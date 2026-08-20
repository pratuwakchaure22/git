import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { AppNotification, NotificationPreferences } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
const POLL_INTERVAL_MS = 30_000; // 30 seconds

const DEFAULT_PREFS: NotificationPreferences = {
  in_app: true,
  browser_push: false,
  deadline_alerts: true,
  reminder_alerts: true,
  task_alerts: true,
};

// ── Helper: urlBase64ToUint8Array (VAPID public key conversion) ────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── Context Interface ──────────────────────────────────────────────────────────
interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  preferences: NotificationPreferences;
  savePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  pushPermission: NotificationPermission | "unsupported";
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Fetch notifications from Supabase ────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data as AppNotification[]);
    }
  }, [user]);

  // ── Fetch preferences ────────────────────────────────────────────────────
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPreferences({
        in_app: data.in_app ?? true,
        browser_push: data.browser_push ?? false,
        deadline_alerts: data.deadline_alerts ?? true,
        reminder_alerts: data.reminder_alerts ?? true,
        task_alerts: data.task_alerts ?? true,
      });
    }
  }, [user]);

  // ── Initial load and polling ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setPreferences(DEFAULT_PREFS);
      return;
    }

    setIsLoading(true);
    Promise.all([fetchNotifications(), fetchPreferences()]).finally(() =>
      setIsLoading(false)
    );

    // Polling every 30s
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    // Supabase Realtime subscription for instant updates
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as AppNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, fetchPreferences]);

  // ── Mark one notification read ───────────────────────────────────────────
  const markRead = useCallback(
    async (id: string) => {
      if (!user) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);
    },
    [user]
  );

  // ── Mark all read ────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }, [user]);

  // ── Dismiss notification ─────────────────────────────────────────────────
  const dismiss = useCallback(
    async (id: string) => {
      if (!user) return;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
    },
    [user]
  );

  // ── Save preferences ─────────────────────────────────────────────────────
  const savePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      if (!user) return;
      const newPrefs = { ...preferences, ...prefs };
      setPreferences(newPrefs);

      await supabase.from("notification_preferences").upsert(
        { user_id: user.id, ...newPrefs, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    },
    [user, preferences]
  );

  // ── Subscribe to browser push ────────────────────────────────────────────
  const subscribeToPush = useCallback(async () => {
    if (!user) return;
    if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) return;

    // Request permission
    const permission = await Notification.requestPermission();
    setPushPermission(permission);
    if (permission !== "granted") return;

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        if (!VAPID_PUBLIC_KEY) {
          console.warn("[Push] VITE_VAPID_PUBLIC_KEY not set — push disabled");
          return;
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        });
      }

      const json = subscription.toJSON();
      // Store subscription in Supabase
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys?.p256dh ?? "",
          auth_key: json.keys?.auth ?? "",
        },
        { onConflict: "endpoint" }
      );

      await savePreferences({ browser_push: true });
    } catch (err) {
      console.error("[Push] Subscribe error:", err);
    }
  }, [user, savePreferences]);

  // ── Unsubscribe from browser push ────────────────────────────────────────
  const unsubscribeFromPush = useCallback(async () => {
    if (!user) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint)
          .eq("user_id", user.id);
        await subscription.unsubscribe();
      }
      await savePreferences({ browser_push: false });
    } catch (err) {
      console.error("[Push] Unsubscribe error:", err);
    }
  }, [user, savePreferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markRead,
        markAllRead,
        dismiss,
        preferences,
        savePreferences,
        pushPermission,
        subscribeToPush,
        unsubscribeFromPush,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

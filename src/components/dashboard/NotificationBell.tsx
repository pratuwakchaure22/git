import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationCenter } from "./NotificationCenter";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={bellRef} className="relative">
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#F4F4F7]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5C6C] font-mono text-[9px] font-bold text-white shadow-md ring-2 ring-[#171824]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationCenter onClose={() => setOpen(false)} />}
    </div>
  );
}

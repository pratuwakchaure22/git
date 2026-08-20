import { useState, useEffect } from "react";
import { Plus, Bell, Clock, Repeat, CheckCircle, Trash2, Edit3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ReminderModal } from "@/components/modals/ReminderModal";
import type { Reminder } from "@/types";

const repeatLabels: Record<string, string> = {
  none: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export default function Reminders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("today");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);

  useEffect(() => {
    if (user) fetchReminders();
  }, [user]);

  async function fetchReminders() {
    setIsLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load reminders.");
      console.error(error);
    } else if (data) {
      const today = new Date().toDateString();
      const mapped: Reminder[] = data.map((r: any) => {
        const reminderDate = r.time ? new Date(r.time) : null;
        let status: Reminder["status"] = r.status || "upcoming";
        if (!r.status && reminderDate) {
          if (r.is_completed) status = "completed";
          else if (reminderDate.toDateString() === today) status = "today";
          else if (reminderDate < new Date()) status = "missed";
          else status = "upcoming";
        }
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          date: reminderDate ? reminderDate.toLocaleDateString() : r.date || "",
          time: reminderDate ? reminderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : r.time || "",
          repeat: r.repeat || "none",
          status,
          createdAt: r.created_at,
        };
      });
      setReminders(mapped);
    }
    setIsLoading(false);
  }

  async function completeReminder(id: string) {
    setReminders((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "completed" } : r)
    );
    const { error } = await supabase
      .from("reminders")
      .update({ status: "completed", is_completed: true })
      .eq("id", id);
    if (error) { console.error(error); fetchReminders(); }
  }

  async function deleteReminder(id: string) {
    if (!confirm("Delete this reminder?")) return;
    setReminders((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) { console.error(error); fetchReminders(); }
  }

  function handleOpenCreate() {
    setReminderToEdit(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(reminder: Reminder) {
    setReminderToEdit(reminder);
    setIsModalOpen(true);
  }

  const todayReminders = reminders.filter((r) => r.status === "today");
  const upcomingReminders = reminders.filter((r) => r.status === "upcoming");
  const completedReminders = reminders.filter((r) => r.status === "completed");

  const tabs = [
    { id: "today", label: "Today", count: todayReminders.length },
    { id: "upcoming", label: "Upcoming", count: upcomingReminders.length },
    { id: "completed", label: "Completed", count: completedReminders.length },
  ];

  const items =
    activeTab === "today" ? todayReminders
    : activeTab === "upcoming" ? upcomingReminders
    : completedReminders;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title="Reminders"
        description="Stay on top of recurring tasks and one-time alerts."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#2a8c82" }}
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4" />
            New Reminder
          </button>
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {isLoading ? (
        <div className="py-8 text-center text-sm" style={{ color: "#8f97a5" }}>Loading reminders...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="No reminders"
          description={activeTab === "completed" ? "Completed reminders appear here." : "Set up reminders to stay on track."}
        />
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <div
              key={r.id}
              className="group flex items-start gap-3 rounded border px-4 py-4 transition-all hover:border-[#2a8c82]/30"
              style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
            >
              {/* Icon */}
              <Bell
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                style={{ color: r.status === "completed" ? "#5b6472" : "#2a8c82" }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${r.status === "completed" ? "line-through opacity-50" : ""}`}
                  style={{ color: "#e9ebf0" }}
                >
                  {r.title}
                </p>
                {r.description && (
                  <p className="mt-0.5 text-xs" style={{ color: "#8f97a5" }}>{r.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "#5b6472" }}>
                    <Clock className="h-3 w-3" />
                    {r.date} at {r.time}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "#5b6472" }}>
                    <Repeat className="h-3 w-3" />
                    {repeatLabels[r.repeat]}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded p-1.5 transition-colors hover:opacity-80 cursor-pointer"
                  style={{ color: "#8f97a5" }}
                  onClick={() => handleOpenEdit(r)}
                  title="Edit reminder"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                {r.status !== "completed" && (
                  <button
                    type="button"
                    className="rounded p-1.5 transition-colors hover:opacity-80 cursor-pointer"
                    style={{ color: "#2a8c82" }}
                    onClick={() => completeReminder(r.id)}
                    title="Mark complete"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  className="rounded p-1.5 transition-colors hover:opacity-80 cursor-pointer"
                  style={{ color: "#c0392b" }}
                  onClick={() => deleteReminder(r.id)}
                  title="Delete reminder"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReminders}
        reminderToEdit={reminderToEdit}
      />
    </div>
  );
}

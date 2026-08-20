import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Reminder, ReminderRepeat } from "@/types";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reminderToEdit?: Reminder | null;
}

const repeatOptions: { value: ReminderRepeat; label: string }[] = [
  { value: "none", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function ReminderModal({ isOpen, onClose, onSuccess, reminderToEdit }: ReminderModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState<ReminderRepeat>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reminderToEdit) {
      setTitle(reminderToEdit.title);
      setDescription(reminderToEdit.description || "");
      setDate(reminderToEdit.date || "");
      setTime(reminderToEdit.time || "");
      setRepeat(reminderToEdit.repeat || "none");
    } else {
      setTitle("");
      setDescription("");
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setTime("09:00");
      setRepeat("none");
    }
    setError("");
  }, [reminderToEdit, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (reminderToEdit) {
        const { error: updateErr } = await supabase
          .from("reminders")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            date: date || null,
            time: time || null,
            repeat,
          })
          .eq("id", reminderToEdit.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from("reminders").insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          date: date || null,
          time: time || null,
          repeat,
          status: "upcoming",
          is_completed: false,
        });

        if (insertErr) throw insertErr;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving reminder:", err);
      setError(err.message || "Failed to save reminder.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-lg rounded-xl border p-6 shadow-2xl transition-all"
        style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "#2e3540" }}>
          <h2 className="text-lg font-semibold" style={{ color: "#e9ebf0" }}>
            {reminderToEdit ? "Edit Reminder" : "Create New Reminder"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 transition-colors hover:opacity-80"
            style={{ color: "#8f97a5" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded bg-red-950/50 border border-red-800/50 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reminder title..."
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Repeat
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as ReminderRepeat)}
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            >
              {repeatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: "#2e3540" }}>
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: "#2e3540", color: "#e9ebf0" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded px-4 py-2 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#2a8c82" }}
            >
              {isSubmitting ? "Saving..." : reminderToEdit ? "Update Reminder" : "Create Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

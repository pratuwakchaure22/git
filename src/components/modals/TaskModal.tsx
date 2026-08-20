import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Task, TaskPriority, TaskStatus } from "@/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: Task | null;
}

const priorities: TaskPriority[] = ["critical", "high", "medium", "low"];
const statuses: TaskStatus[] = ["todo", "in-progress", "completed"];

export function TaskModal({ isOpen, onClose, onSuccess, taskToEdit }: TaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "medium");
      setStatus(taskToEdit.status || "todo");
      setCategory(taskToEdit.category || "General");
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "");
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(", ") : "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setCategory("General");
      setDueDate("");
      setTagsInput("");
    }
    setError("");
  }, [taskToEdit, isOpen]);

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

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (taskToEdit) {
        const { error: updateErr } = await supabase
          .from("tasks")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            priority,
            status,
            category: category.trim() || "General",
            due_date: dueDate || null,
            tags,
            completed_at: status === "completed" ? new Date().toISOString() : null,
          })
          .eq("id", taskToEdit.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from("tasks").insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status,
          category: category.trim() || "General",
          due_date: dueDate || null,
          tags,
        });

        if (insertErr) throw insertErr;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving task:", err);
      setError(err.message || "Failed to save task.");
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
            {taskToEdit ? "Edit Task" : "Create New Task"}
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
              placeholder="Task title..."
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
              placeholder="Task details..."
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              >
                {priorities.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Development, Personal"
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. frontend, bug"
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            />
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
              {isSubmitting ? "Saving..." : taskToEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

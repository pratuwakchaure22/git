import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Deadline, DeadlinePriority } from "@/types";

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deadlineToEdit?: Deadline | null;
}

const priorities: DeadlinePriority[] = ["critical", "high", "medium", "low"];

export function DeadlineModal({ isOpen, onClose, onSuccess, deadlineToEdit }: DeadlineModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<DeadlinePriority>("medium");
  const [relatedProject, setRelatedProject] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (deadlineToEdit) {
      setTitle(deadlineToEdit.title);
      setDescription(deadlineToEdit.description || "");
      setDate(deadlineToEdit.date || "");
      setPriority(deadlineToEdit.priority || "medium");
      setRelatedProject(deadlineToEdit.relatedProject || "");
      setCategory(deadlineToEdit.category || "General");
    } else {
      setTitle("");
      setDescription("");
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      setDate(tomorrow);
      setPriority("medium");
      setRelatedProject("");
      setCategory("General");
    }
    setError("");
  }, [deadlineToEdit, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!date) {
      setError("Date is required.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (deadlineToEdit) {
        const { error: updateErr } = await supabase
          .from("deadlines")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            date,
            priority,
            related_project: relatedProject.trim() || null,
            category: category.trim() || "General",
          })
          .eq("id", deadlineToEdit.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from("deadlines").insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          date,
          priority,
          related_project: relatedProject.trim() || null,
          category: category.trim() || "General",
          status: "upcoming",
        });

        if (insertErr) throw insertErr;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving deadline:", err);
      setError(err.message || "Failed to save deadline.");
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
            {deadlineToEdit ? "Edit Deadline" : "Create New Deadline"}
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
              placeholder="Deadline title..."
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
                Target Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DeadlinePriority)}
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Related Project
              </label>
              <input
                type="text"
                value={relatedProject}
                onChange={(e) => setRelatedProject(e.target.value)}
                placeholder="e.g. Portfolio Revamp"
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Project, Academic"
                className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
                style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              />
            </div>
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
              {isSubmitting ? "Saving..." : deadlineToEdit ? "Update Deadline" : "Create Deadline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

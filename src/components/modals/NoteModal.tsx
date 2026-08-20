import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Note, NoteCategory } from "@/types";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  noteToEdit?: Note | null;
}

const noteCategories: NoteCategory[] = [
  "personal",
  "research",
  "project",
  "meeting",
  "idea",
  "reference",
  "other",
];

export function NoteModal({ isOpen, onClose, onSuccess, noteToEdit }: NoteModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("other");
  const [tagsInput, setTagsInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setCategory(noteToEdit.category);
      setTagsInput(noteToEdit.tags ? noteToEdit.tags.join(", ") : "");
      setPinned(noteToEdit.pinned || false);
    } else {
      setTitle("");
      setContent("");
      setCategory("other");
      setTagsInput("");
      setPinned(false);
    }
    setError("");
  }, [noteToEdit, isOpen]);

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

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    try {
      if (noteToEdit) {
        const { error: updateErr } = await supabase
          .from("notes")
          .update({
            title: title.trim(),
            content,
            category,
            tags,
            pinned,
            word_count: wordCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", noteToEdit.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from("notes").insert({
          user_id: user.id,
          title: title.trim(),
          content,
          category,
          tags,
          pinned,
          word_count: wordCount,
        });

        if (insertErr) throw insertErr;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving note:", err);
      setError(err.message || "Failed to save note.");
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
            {noteToEdit ? "Edit Note" : "Create New Note"}
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
              placeholder="Note title..."
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            >
              {noteCategories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              rows={5}
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. work, urgent, idea"
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded accent-[#2a8c82]"
            />
            <label htmlFor="pinned" className="text-xs cursor-pointer select-none" style={{ color: "#e9ebf0" }}>
              Pin to top
            </label>
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
              {isSubmitting ? "Saving..." : noteToEdit ? "Update Note" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

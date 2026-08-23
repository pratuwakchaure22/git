import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { ImportantItem, ImportantCategory } from "@/types";

interface ImportantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: ImportantItem | null;
}

const categories: { value: ImportantCategory; label: string }[] = [
  { value: "document", label: "Document" },
  { value: "link", label: "Link / URL" },
  { value: "date", label: "Date / Event" },
  { value: "contact", label: "Contact Info" },
  { value: "information", label: "General Info" },
];

export function ImportantModal({ isOpen, onClose, onSuccess, itemToEdit }: ImportantModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<ImportantCategory>("information");
  const [tagsInput, setTagsInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description || "");
      setValue(itemToEdit.value || "");
      setCategory(itemToEdit.category || "information");
      setTagsInput(itemToEdit.tags ? itemToEdit.tags.join(", ") : "");
      setPinned(itemToEdit.pinned || false);
    } else {
      setTitle("");
      setDescription("");
      setValue("");
      setCategory("information");
      setTagsInput("");
      setPinned(false);
    }
    setError("");
  }, [itemToEdit, isOpen]);

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
      if (itemToEdit) {
        let { error: updateErr } = await supabase
          .from("important")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            value: value.trim() || null,
            category,
            tags,
            pinned,
          })
          .eq("id", itemToEdit.id);

        if (updateErr) {
          const fallback = await supabase
            .from("notes")
            .update({
              title: title.trim(),
              content: value.trim() || description.trim(),
              category,
              tags,
              pinned,
              is_important: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", itemToEdit.id);
          updateErr = fallback.error;
        }

        if (updateErr) throw updateErr;
      } else {
        let { error: insertErr } = await supabase.from("important").insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          value: value.trim() || null,
          category,
          tags,
          pinned,
        });

        if (insertErr) {
          const fallback = await supabase.from("notes").insert({
            user_id: user.id,
            title: title.trim(),
            content: value.trim() || description.trim(),
            category,
            tags,
            pinned,
            is_important: true,
          });
          insertErr = fallback.error;
        }

        if (insertErr) throw insertErr;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving important item:", err);
      setError(err.message || "Failed to save important item.");
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
            {itemToEdit ? "Edit Important Item" : "Add Important Item"}
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
              placeholder="Item title..."
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
              onChange={(e) => setCategory(e.target.value as ImportantCategory)}
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              {category === "link"
                ? "URL / Link *"
                : category === "contact"
                ? "Contact Detail (Phone / Email) *"
                : category === "date"
                ? "Date Details *"
                : "Value / Main Content *"}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                category === "link"
                  ? "https://..."
                  : category === "contact"
                  ? "+1 234 567 890"
                  : "Detail content..."
              }
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: "#8f97a5" }}>
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional description..."
              rows={3}
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
              placeholder="e.g. key, passport, link"
              className="w-full rounded border px-3 py-2 text-sm outline-hidden focus:border-[#2a8c82]"
              style={{ backgroundColor: "#14181f", borderColor: "#2e3540", color: "#e9ebf0" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinnedImportant"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded accent-[#2a8c82]"
            />
            <label htmlFor="pinnedImportant" className="text-xs cursor-pointer select-none" style={{ color: "#e9ebf0" }}>
              Pin item
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
              {isSubmitting ? "Saving..." : itemToEdit ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

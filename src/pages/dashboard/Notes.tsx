import { useState, useEffect } from "react";
import { Plus, Pin, Tag, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Note, NoteCategory } from "@/types";

const categoryColors: Record<NoteCategory, string> = {
  personal: "#2a8c82",
  research: "#4285f4",
  project: "#b8763a",
  meeting: "#8f97a5",
  idea: "#9c27b0",
  reference: "#0f9d58",
  other: "#5b6472",
};

const noteCategories = ["all", "personal", "research", "project", "meeting", "idea", "reference", "other"];

export default function Notes() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  async function fetchNotes() {
    setIsLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load notes.");
      console.error(error);
    } else if (data) {
      const mapped: Note[] = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content || "",
        category: (n.category || "other") as NoteCategory,
        tags: n.tags || [],
        pinned: n.pinned || false,
        archived: n.archived || false,
        createdAt: n.created_at,
        updatedAt: n.updated_at || n.created_at,
        wordCount: n.word_count || (n.content ? n.content.split(/\s+/).filter(Boolean).length : 0),
      }));
      setNotes(mapped);
    }
    setIsLoading(false);
  }

  async function deleteNote(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) { console.error(error); fetchNotes(); }
  }

  async function togglePin(id: string, pinned: boolean, e: React.MouseEvent) {
    e.stopPropagation();
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, pinned: !pinned } : n));
    const { error } = await supabase.from("notes").update({ pinned: !pinned }).eq("id", id);
    if (error) { console.error(error); fetchNotes(); }
  }

  const allNotes = notes.filter((n) => !n.archived);
  const pinnedNotes = notes.filter((n) => n.pinned && !n.archived);
  const archivedNotes = notes.filter((n) => n.archived);

  const tabs = [
    { id: "all", label: "All Notes", count: allNotes.length },
    { id: "pinned", label: "Pinned", count: pinnedNotes.length },
    { id: "archived", label: "Archived", count: archivedNotes.length },
  ];

  const baseNotes =
    activeTab === "pinned" ? pinnedNotes
    : activeTab === "archived" ? archivedNotes
    : allNotes;

  const filtered = baseNotes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || n.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Notes"
        description="Capture ideas, meeting notes, and research findings."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#2a8c82" }}
            onClick={() => alert("Create note modal not implemented in this demo")}
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notes..." className="max-w-xs" />
        <div className="flex gap-1 overflow-x-auto">
          {noteCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="flex-shrink-0 rounded border px-2.5 py-1 font-mono text-xs capitalize transition-colors"
              style={{
                borderColor: category === c ? "#2a8c82" : "#2e3540",
                backgroundColor: category === c ? "#1a302e" : "#1e232b",
                color: category === c ? "#2a8c82" : "#8f97a5",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Notes grid */}
      {isLoading ? (
        <div className="py-8 text-center text-sm" style={{ color: "#8f97a5" }}>Loading notes...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-5 w-5" />}
          title="No notes found"
          description={search ? "Try a different search term." : "Create your first note."}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="group relative cursor-pointer rounded border p-4 transition-all hover:border-[#2a8c82]/50"
              style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
              onClick={() => setExpanded(expanded === note.id ? null : note.id)}
            >
              {/* Header */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug" style={{ color: "#e9ebf0" }}>
                  {note.title}
                </h3>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => togglePin(note.id, note.pinned, e)}
                    className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    title={note.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin
                      className="h-3.5 w-3.5"
                      style={{ color: note.pinned ? "#b8763a" : "#5b6472" }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => deleteNote(note.id, e)}
                    className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" style={{ color: "#c0392b" }} />
                  </button>
                </div>
              </div>

              {/* Category */}
              <span
                className="mb-2 inline-block rounded px-2 py-0.5 font-mono text-[10px] capitalize"
                style={{
                  backgroundColor: `${categoryColors[note.category]}20`,
                  color: categoryColors[note.category],
                }}
              >
                {note.category}
              </span>

              {/* Preview */}
              <p
                className={`text-xs leading-relaxed ${expanded === note.id ? "" : "line-clamp-3"}`}
                style={{ color: "#8f97a5" }}
              >
                {note.content}
              </p>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1">
                  {note.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ backgroundColor: "#252c36", color: "#5b6472" }}>
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px]" style={{ color: "#5b6472" }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="font-mono text-[10px]" style={{ color: "#5b6472" }}>{note.wordCount} words</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

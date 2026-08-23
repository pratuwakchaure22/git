import { useState, useEffect } from "react";
import { Plus, Star, Link as LinkIcon, Calendar, Phone, Info, Trash2, ExternalLink, Edit3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ImportantModal } from "@/components/modals/ImportantModal";
import type { ImportantItem, ImportantCategory } from "@/types";

const sections: { category: ImportantCategory; label: string; icon: React.ReactNode }[] = [
  { category: "document", label: "Important Documents", icon: <Star className="h-4 w-4" /> },
  { category: "link", label: "Important Links", icon: <LinkIcon className="h-4 w-4" /> },
  { category: "date", label: "Important Dates", icon: <Calendar className="h-4 w-4" /> },
  { category: "contact", label: "Important Contacts", icon: <Phone className="h-4 w-4" /> },
  { category: "information", label: "Important Information", icon: <Info className="h-4 w-4" /> },
];

const categoryColors: Record<ImportantCategory, string> = {
  document: "#4285f4",
  link: "#2a8c82",
  date: "#b8763a",
  contact: "#9c27b0",
  information: "#0f9d58",
};

export default function Important() {
  const { user } = useAuth();
  const [items, setItems] = useState<ImportantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ImportantItem | null>(null);

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  async function fetchItems() {
    setIsLoading(true);
    setError("");
    let { data, error } = await supabase
      .from("important")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase
        .from("notes")
        .select("*")
        .eq("is_important", true)
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      setError("Failed to load important items.");
      console.error(error);
    } else if (data) {
      const mapped: ImportantItem[] = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.description || n.content || "",
        category: (n.category || "information") as ImportantCategory,
        value: n.value || n.content || "",
        tags: n.tags || [],
        createdAt: n.created_at,
        pinned: n.pinned || false,
      }));
      setItems(mapped);
    }
    setIsLoading(false);
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    let { error } = await supabase.from("important").delete().eq("id", id);
    if (error) {
      const fallback = await supabase.from("notes").delete().eq("id", id);
      error = fallback.error;
    }
    if (error) { console.error(error); fetchItems(); }
  }

  function handleOpenCreate() {
    setItemToEdit(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: ImportantItem) {
    setItemToEdit(item);
    setIsModalOpen(true);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Important Items" description="Quick access to critical information, links, dates, and contacts." />
        <div className="py-8 text-center text-sm" style={{ color: "#8f97a5" }}>Loading...</div>
      </div>
    );
  }

  const hasItems = items.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Important Items"
        description="Quick access to critical information, links, dates, and contacts."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#2a8c82" }}
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        }
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {!hasItems ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title="No important items"
          description="Mark items as important to see them here."
        />
      ) : (
        sections.map((section) => {
          const sectionItems = items.filter((i) => i.category === section.category);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section.category}>
              <div className="mb-2 flex items-center gap-2">
                <span style={{ color: categoryColors[section.category] }}>{section.icon}</span>
                <h2 className="font-display text-sm font-semibold" style={{ color: "#e9ebf0" }}>
                  {section.label}
                </h2>
                <span className="font-mono text-[10px]" style={{ color: "#5b6472" }}>
                  ({sectionItems.length})
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sectionItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded border p-4 transition-all hover:border-opacity-60"
                    style={{
                      backgroundColor: "#1e232b",
                      borderColor: item.pinned ? categoryColors[section.category] + "40" : "#2e3540",
                    }}
                  >
                    {item.pinned && (
                      <span className="absolute right-2 top-2 font-mono text-[10px]" style={{ color: "#b8763a" }}>
                        📌
                      </span>
                    )}
                    <p className="pr-4 text-xs font-semibold" style={{ color: "#e9ebf0" }}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-[10px]" style={{ color: "#8f97a5" }}>{item.description}</p>
                    )}
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <p
                        className="break-all font-mono text-[10px]"
                        style={{ color: categoryColors[section.category] }}
                      >
                        {item.value}
                      </p>
                      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded p-1 transition-colors hover:opacity-80 cursor-pointer"
                          style={{ color: "#8f97a5" }}
                          onClick={() => handleOpenEdit(item)}
                          title="Edit item"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        {section.category === "link" && (
                          <a
                            href={item.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 transition-colors hover:opacity-80 cursor-pointer"
                            style={{ color: "#8f97a5" }}
                            title="Open link"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          className="rounded p-1 transition-colors hover:opacity-80 cursor-pointer"
                          style={{ color: "#c0392b" }}
                          onClick={() => deleteItem(item.id)}
                          title="Delete item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span key={t} className="rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ backgroundColor: "#252c36", color: "#5b6472" }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      <ImportantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchItems}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}

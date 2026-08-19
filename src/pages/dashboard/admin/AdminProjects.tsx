import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { projects as defaultProjects } from "@/data/projects";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function AdminProjects() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [projectList, setProjectList] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTechs, setNewTechs] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setProjectList(
        data.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.technologies?.[0] || "General",
          year: p.created_at ? new Date(p.created_at).getFullYear().toString() : "2026",
          role: p.description || "Full Stack",
          featured: true,
        }))
      );
    } else {
      setProjectList(defaultProjects);
    }
  }

  async function handleAddProject() {
    if (!newTitle.trim() || !user) return;
    const techs = newTechs.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      title: newTitle,
      description: newDesc,
      technologies: techs,
    });

    if (!error) {
      setNewTitle("");
      setNewDesc("");
      setNewTechs("");
      setShowAddModal(false);
      fetchProjects();
    } else {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjectList((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = projectList.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects"
        breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Projects" }]}
        actions={
          <button
            type="button"
            onClick={() => setShowAddModal((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        }
      />

      {showAddModal && (
        <div className="rounded-2xl border border-[#4F7CFF]/50 bg-[#1B1B28] p-5 space-y-3 shadow-xl">
          <h4 className="text-xs font-semibold text-[#F4F4F7]">Add New Project</h4>
          <input
            placeholder="Project Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
          />
          <input
            placeholder="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
          />
          <input
            placeholder="Technologies (comma-separated, e.g. React, TypeScript)"
            value={newTechs}
            onChange={(e) => setNewTechs(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
          />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAddProject} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">Save</button>
            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-[#2A2A3A] bg-[#20202E] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative max-w-xs">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
        />
      </div>

      <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3A] bg-[#171824]">
              {["Name", "Category", "Year", "Status", "Published", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#9A9AA8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-[#2A2A3A] transition-colors hover:bg-[#20202E]/60">
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-[#F4F4F7]">{p.title}</p>
                  <p className="font-mono text-[10px] text-[#9A9AA8]">{p.role}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-lg border border-[#2A2A3A] bg-[#20202E] px-2.5 py-0.5 font-mono text-[10px] capitalize text-[#9A9AA8]">{p.category}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#9A9AA8]">{p.year}</td>
                <td className="px-4 py-3">
                  <StatusBadge status="published" />
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs" style={{ color: p.featured ? "#4F7CFF" : "#9A9AA8" }}>
                    {p.featured ? "Featured" : "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C]/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const defaultSkills = [
  { id: "s1", name: "Python", category: "Programming", level: 95, published: true },
  { id: "s2", name: "TypeScript", category: "Programming", level: 90, published: true },
  { id: "s3", name: "React", category: "Web Development", level: 92, published: true },
  { id: "s4", name: "PyTorch", category: "AI/ML", level: 85, published: true },
  { id: "s5", name: "PostgreSQL", category: "Database", level: 80, published: true },
  { id: "s6", name: "Docker", category: "Tools", level: 78, published: true },
  { id: "s7", name: "Go", category: "Programming", level: 65, published: true },
  { id: "s8", name: "Rust", category: "Programming", level: 30, published: false },
];

export default function AdminSkills() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [skillList, setSkillList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [proficiency, setProficiency] = useState(80);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("category");

    if (data && data.length > 0) {
      setSkillList(
        data.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category || "General",
          level: s.proficiency || 80,
          published: true,
        }))
      );
    } else {
      setSkillList(defaultSkills);
    }
  }

  async function handleAddSkill() {
    if (!name.trim() || !user) return;
    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      name,
      category,
      proficiency,
    });

    if (!error) {
      setName("");
      setCategory("");
      setShowForm(false);
      fetchSkills();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this skill?")) return;
    await supabase.from("skills").delete().eq("id", id);
    setSkillList((prev) => prev.filter((s) => s.id !== id));
  }

  const filtered = skillList.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Skills"
        breadcrumbs={[{ label: "Admin", href: "/dashboard/admin" }, { label: "Skills" }]}
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
        }
      />

      {showForm && (
        <div className="rounded-2xl border border-[#4F7CFF]/50 bg-[#1B1B28] p-5 space-y-3 shadow-xl">
          <h4 className="text-xs font-semibold text-[#F4F4F7]">Add New Skill</h4>
          <input
            placeholder="Skill Name (e.g. React)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
          />
          <input
            placeholder="Category (e.g. Frontend)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
          />
          <div className="flex gap-3 items-center">
            <span className="text-xs text-[#9A9AA8]">Proficiency ({proficiency}%):</span>
            <input
              type="range"
              min="10"
              max="100"
              value={proficiency}
              onChange={(e) => setProficiency(Number(e.target.value))}
              className="flex-1 accent-[#4F7CFF]"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAddSkill} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#2A2A3A] bg-[#20202E] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative max-w-xs">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3.5 py-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
        />
      </div>

      <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3A] bg-[#171824]">
              {["Skill", "Category", "Level", "Published", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#9A9AA8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-[#2A2A3A] transition-colors hover:bg-[#20202E]/60">
                <td className="px-4 py-3 text-xs font-semibold text-[#F4F4F7]">{s.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-lg border border-[#2A2A3A] bg-[#20202E] px-2.5 py-0.5 font-mono text-[10px] text-[#9A9AA8]">{s.category}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-[#20202E]">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#9B4DFF]" style={{ width: `${s.level}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-[#9A9AA8]">{s.level}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs" style={{ color: s.published ? "#48C774" : "#9A9AA8" }}>
                    {s.published ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C]/10">
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

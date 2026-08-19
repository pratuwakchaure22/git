import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Globe, Code2, GraduationCap, Trophy, BookOpen, Award, FileText, StickyNote, CheckSquare, Bell, Calendar, FileSpreadsheet, Bot, Settings } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";


const adminNav = [
  { label: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { label: "Website", href: "/dashboard/admin/website", icon: <Globe className="h-3.5 w-3.5" /> },
  { label: "Projects", href: "/dashboard/admin/projects", icon: <Code2 className="h-3.5 w-3.5" /> },
  { label: "Skills", href: "/dashboard/admin/skills", icon: <Settings className="h-3.5 w-3.5" /> },
  { label: "Education", href: "/dashboard/admin/education", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { label: "Achievements", href: "/dashboard/admin/achievements", icon: <Trophy className="h-3.5 w-3.5" /> },
  { label: "Research", href: "/dashboard/admin/research", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { label: "Certificates", href: "/dashboard/admin/certificates", icon: <Award className="h-3.5 w-3.5" /> },
  { label: "Documents", href: "/dashboard/admin/documents", icon: <FileText className="h-3.5 w-3.5" /> },
  { label: "Notes", href: "/dashboard/admin/notes", icon: <StickyNote className="h-3.5 w-3.5" /> },
  { label: "Tasks", href: "/dashboard/admin/tasks", icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { label: "Reminders", href: "/dashboard/admin/reminders", icon: <Bell className="h-3.5 w-3.5" /> },
  { label: "Deadlines", href: "/dashboard/admin/deadlines", icon: <Calendar className="h-3.5 w-3.5" /> },
  { label: "Resume", href: "/dashboard/admin/resume", icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
  { label: "AI Settings", href: "/dashboard/admin/ai", icon: <Bot className="h-3.5 w-3.5" /> },
];

export default function Admin() {
  const location = useLocation();
  const isRoot = location.pathname === "/dashboard/admin";
  const [stats, setStats] = useState([
    { label: "Projects", value: "—", change: "Live DB count" },
    { label: "Achievements", value: "—", change: "Live DB count" },
    { label: "Documents", value: "—", change: "Live DB count" },
    { label: "Active Tasks", value: "—", change: "Live DB count" },
    { label: "Upcoming Deadlines", value: "—", change: "Live DB count" },
  ]);

  useEffect(() => {
    if (!isRoot) return;
    Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("achievements").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "todo"),
      supabase.from("deadlines").select("id", { count: "exact", head: true }).eq("status", "upcoming"),
    ]).then(([p, a, d, t, dl]) => {
      setStats([
        { label: "Projects", value: String(p.count ?? 0), change: "Total in Supabase" },
        { label: "Achievements", value: String(a.count ?? 0), change: "Total in Supabase" },
        { label: "Documents", value: String(d.count ?? 0), change: "Total in Storage" },
        { label: "Active Tasks", value: String(t.count ?? 0), change: "Status: todo" },
        { label: "Upcoming Deadlines", value: String(dl.count ?? 0), change: "Status: upcoming" },
      ]);
    });
  }, [isRoot]);


  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader
        title="Admin Panel"
        description="Manage all content and system settings."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }]}
      />

      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        {/* Admin nav */}
        <aside className="md:w-48 flex-shrink-0">
          <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden p-2 shadow-lg shadow-black/20">
            <div className="border-b border-[#2A2A3A] px-3 py-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A9AA8]">Navigation</p>
            </div>
            <nav className="p-1 space-y-1 mt-1">
              {adminNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/dashboard/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#4F7CFF]/15 text-[#4F7CFF] font-semibold border-l-2 border-[#4F7CFF]"
                        : "text-[#9A9AA8] hover:bg-[#20202E] hover:text-[#F4F4F7]"
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {isRoot ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] p-4 shadow-lg shadow-black/20 hover:border-[#4F7CFF]/30 transition-all"
                  >
                    <p className="font-display text-2xl font-bold text-[#4F7CFF]">{s.value}</p>
                    <p className="mt-1 text-xs font-semibold text-[#F4F4F7]">{s.label}</p>
                    {s.change && <p className="mt-0.5 font-mono text-[10px] text-[#9A9AA8]">{s.change}</p>}
                  </div>
                ))}
              </div>

              {/* Quick links to sub-sections */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {adminNav.slice(1).map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2.5 rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-3.5 text-xs font-medium text-[#9A9AA8] transition-all hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7] hover:-translate-y-0.5 shadow-lg shadow-black/20"
                  >
                    <span className="text-[#4F7CFF]">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>

      </div>
    </div>
  );
}

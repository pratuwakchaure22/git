import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Calendar, Bell, Star, FileText, FolderOpen, Bot, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { Task, Deadline, Reminder, Note, Document } from "@/types";

function DashCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-[#4F7CFF]/30 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-[#4F7CFF]">{icon}</span>
        <h2 className="font-display text-sm font-semibold tracking-tight text-[#F4F4F7]">
          {title}
        </h2>
      </div>
      <Link
        to={href}
        className="flex items-center gap-1 font-mono text-xs text-[#9A9AA8] transition-colors hover:text-[#4F7CFF]"
      >
        View all
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("deadlines").select("*").order("date", { ascending: true }),
      supabase.from("reminders").select("*").order("created_at", { ascending: false }),
      supabase.from("notes").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(5),
    ]).then(([tasksRes, deadlinesRes, remindersRes, notesRes, docsRes]) => {
      // Map tasks
      if (tasksRes.data) {
        setTasks(tasksRes.data.map((d: any) => ({
          id: d.id, title: d.title, description: d.description,
          status: d.status, priority: d.priority, category: d.category || "other",
          dueDate: d.due_date, completedAt: d.completed_at,
          tags: d.tags || [], createdAt: d.created_at,
        })));
      }
      // Map deadlines
      if (deadlinesRes.data) {
        const now = new Date();
        setDeadlines(deadlinesRes.data.map((d: any) => {
          const dl = d.date ? new Date(d.date) : null;
          const status = d.status || (dl && dl < now ? "overdue" : "upcoming");
          return {
            id: d.id, title: d.title, description: d.description,
            date: dl ? dl.toISOString().split("T")[0] : d.date || "",
            priority: d.priority || "medium", relatedProject: d.related_project,
            status, category: d.category || "other", createdAt: d.created_at,
          };
        }));
      }
      // Map reminders
      if (remindersRes.data) {
        const today = new Date().toDateString();
        setReminders(remindersRes.data.map((r: any) => {
          const rd = r.time ? new Date(r.time) : null;
          let status: any = r.status || "upcoming";
          if (!r.status && rd) {
            if (r.is_completed) status = "completed";
            else if (rd.toDateString() === today) status = "today";
            else if (rd < new Date()) status = "missed";
          }
          return {
            id: r.id, title: r.title, description: r.description,
            date: rd ? rd.toLocaleDateString() : r.date || "",
            time: rd ? rd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : r.time || "",
            repeat: r.repeat || "none", status, createdAt: r.created_at,
          };
        }));
      }
      // Map notes
      if (notesRes.data) {
        setNotes(notesRes.data.map((n: any) => ({
          id: n.id, title: n.title, content: n.content || "",
          category: n.category || "other", tags: n.tags || [],
          pinned: n.pinned || false, archived: n.archived || false,
          createdAt: n.created_at, updatedAt: n.updated_at || n.created_at,
          wordCount: n.word_count || 0,
        })));
      }
      // Map documents
      if (docsRes.data) {
        setDocuments(docsRes.data.map((d: any) => ({
          id: d.id, name: d.name,
          type: (d.name.split(".").pop()?.toLowerCase() || "other") as any,
          size: typeof d.size === "number"
            ? d.size < 1024 * 1024 ? `${(d.size / 1024).toFixed(1)} KB` : `${(d.size / (1024 * 1024)).toFixed(1)} MB`
            : d.size || "—",
          category: d.category || "other", tags: d.tags || [],
          aiAccess: d.ai_access || false,
          uploadedAt: d.created_at, updatedAt: d.updated_at || d.created_at,
        })));
      }
      setIsLoading(false);
    });
  }, [user]);

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const overdueDeadlines = deadlines.filter((d) => d.status === "overdue");
  const todayReminders = reminders.filter((r) => r.status === "today");
  const upcomingDeadlines = deadlines.filter((d) => d.status === "upcoming").slice(0, 3);
  const todayTasks = activeTasks.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4F4F7]">
          {getGreeting()}, {user?.name ?? "Pratik"} 👋
        </h1>
        <p className="mt-1 font-mono text-xs text-[#9A9AA8]">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Active Tasks", value: isLoading ? "—" : activeTasks.length, color: "#4F7CFF", href: "/dashboard/tasks" },
          { label: "Overdue", value: isLoading ? "—" : overdueDeadlines.length, color: "#FF5C6C", href: "/dashboard/deadlines" },
          { label: "Today's Reminders", value: isLoading ? "—" : todayReminders.length, color: "#48C774", href: "/dashboard/reminders" },
          { label: "Documents", value: isLoading ? "—" : documents.length, color: "#9B4DFF", href: "/dashboard/documents" },
        ].map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <DashCard className="cursor-pointer transition-all hover:border-[#4F7CFF]/40 hover:-translate-y-0.5">
              <p className="font-display text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-xs text-[#9A9AA8]">
                {stat.label}
              </p>
            </DashCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Tasks */}
        <DashCard className="lg:col-span-2">
          <SectionTitle
            icon={<CheckSquare className="h-4 w-4" />}
            title="Today's Tasks"
            href="/dashboard/tasks"
          />
          {isLoading ? (
            <p className="text-xs text-[#9A9AA8]">Loading tasks...</p>
          ) : todayTasks.length === 0 ? (
            <p className="text-xs text-[#9A9AA8]">No active tasks right now.</p>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3.5 transition-colors hover:border-[#4F7CFF]/30"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border"
                      style={{
                        borderColor: task.status === "in-progress" ? "#4F7CFF" : "#3E3E52",
                        backgroundColor: task.status === "in-progress" ? "#4F7CFF" : "transparent",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#F4F4F7]">
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        <span className="font-mono text-[10px] text-[#9A9AA8]">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  {task.dueDate && (
                    <span className="flex-shrink-0 font-mono text-[10px] text-[#9A9AA8]">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </DashCard>

        {/* Right column */}
        <div className="space-y-6">
          {/* Reminders */}
          <DashCard>
            <SectionTitle
              icon={<Bell className="h-4 w-4" />}
              title="Today's Reminders"
              href="/dashboard/reminders"
            />
            {todayReminders.length === 0 ? (
              <p className="text-xs text-[#9A9AA8]">No reminders for today.</p>
            ) : (
              <div className="space-y-2.5">
                {todayReminders.map((r) => (
                  <div key={r.id} className="flex items-start gap-2.5 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3">
                    <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#48C774]" />
                    <div>
                      <p className="text-xs font-medium text-[#F4F4F7]">{r.title}</p>
                      <p className="font-mono text-[10px] text-[#9A9AA8]">{r.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashCard>

          {/* Deadlines */}
          <DashCard>
            <SectionTitle
              icon={<Calendar className="h-4 w-4" />}
              title="Upcoming Deadlines"
              href="/dashboard/deadlines"
            />
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-[#9A9AA8]">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((d) => (
                  <div key={d.id} className="flex items-start justify-between gap-2 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3">
                    <p className="text-xs font-medium text-[#F4F4F7]">
                      {d.title}
                    </p>
                    <span className="flex-shrink-0 font-mono text-[10px]" style={{ color: d.priority === "critical" ? "#FF5C6C" : "#FFC43D" }}>
                      {d.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashCard>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Notes */}
        <DashCard>
          <SectionTitle
            icon={<FileText className="h-4 w-4" />}
            title="Recent Notes"
            href="/dashboard/notes"
          />
          {notes.length === 0 ? (
            <p className="text-xs text-[#9A9AA8]">No notes yet.</p>
          ) : (
            <div className="space-y-2.5">
              {notes.slice(0, 3).map((note) => (
                <div key={note.id} className="rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3">
                  <p className="truncate text-xs font-semibold text-[#F4F4F7]">
                    {note.title}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-[#9A9AA8]">
                    {new Date(note.updatedAt).toLocaleDateString()} · {note.category}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DashCard>

        {/* Recent Documents */}
        <DashCard>
          <SectionTitle
            icon={<FolderOpen className="h-4 w-4" />}
            title="Recent Documents"
            href="/dashboard/documents"
          />
          {documents.length === 0 ? (
            <p className="text-xs text-[#9A9AA8]">No documents yet.</p>
          ) : (
            <div className="space-y-2.5">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3">
                  <FolderOpen className="h-4 w-4 flex-shrink-0 text-[#9B4DFF]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#F4F4F7]">{doc.name}</p>
                    <p className="font-mono text-[10px] text-[#9A9AA8]">{doc.size} · {doc.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>

        {/* AI Quick Access */}
        <DashCard className="flex flex-col justify-between">
          <SectionTitle
            icon={<Bot className="h-4 w-4" />}
            title="AI Assistant"
            href="/dashboard/ai"
          />
          <div>
            <Link
              to="/dashboard/ai"
              className="flex w-full items-center gap-2.5 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3 text-xs text-[#9A9AA8] transition-all hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]"
            >
              <Bot className="h-4 w-4 flex-shrink-0 text-[#4F7CFF]" />
              <span>Ask your personal assistant...</span>
            </Link>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["What do I have today?", "Upcoming deadlines", "Find documents"].map((p) => (
                <Link
                  key={p}
                  to={`/dashboard/ai?q=${encodeURIComponent(p)}`}
                  className="rounded-lg border border-[#2A2A3A] bg-[#20202E] px-2.5 py-1 font-mono text-[10px] text-[#9A9AA8] transition-colors hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </DashCard>
      </div>

      {/* Important items preview */}
      <DashCard>
        <SectionTitle
          icon={<Star className="h-4 w-4" />}
          title="Important"
          href="/dashboard/important"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "EMNLP Deadline", value: "Sep 5, 2026", type: "date" },
            { label: "EMNLP Portal", value: "softconf.com/emnlp2026", type: "link" },
            { label: "Supervisor", value: "anand.sharma@iitb.ac.in", type: "contact" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3.5"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">
                {item.type}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#F4F4F7]">{item.label}</p>
              <p className="truncate font-mono text-[10px] text-[#4F7CFF]">{item.value}</p>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

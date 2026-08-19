import { useState, useEffect } from "react";
import { Plus, Calendar, AlertTriangle, Trash2, Edit3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Deadline } from "@/types";

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days}d left`;
}

export default function Deadlines() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchDeadlines();
  }, [user]);

  async function fetchDeadlines() {
    setIsLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("deadlines")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      setError("Failed to load deadlines.");
      console.error(error);
    } else if (data) {
      const now = new Date();
      const mapped: Deadline[] = data.map((d: any) => {
        const deadlineDate = d.date ? new Date(d.date) : null;
        let status: Deadline["status"] = d.status || "upcoming";
        if (!d.status && deadlineDate) {
          if (deadlineDate < now) status = "overdue";
          else status = "upcoming";
        }
        return {
          id: d.id,
          title: d.title,
          description: d.description,
          date: deadlineDate ? deadlineDate.toISOString().split("T")[0] : d.date || "",
          priority: d.priority || "medium",
          relatedProject: d.related_project,
          status,
          category: d.category || "other",
          createdAt: d.created_at,
        };
      });
      setDeadlines(mapped);
    }
    setIsLoading(false);
  }

  async function deleteDeadline(id: string) {
    if (!confirm("Delete this deadline?")) return;
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
    const { error } = await supabase.from("deadlines").delete().eq("id", id);
    if (error) { console.error(error); fetchDeadlines(); }
  }

  const overdueDeadlines = deadlines.filter((d) => d.status === "overdue");
  const upcomingDeadlines = deadlines.filter((d) => d.status === "upcoming");

  const tabs = [
    { id: "all", label: "All", count: deadlines.length },
    { id: "upcoming", label: "Upcoming", count: upcomingDeadlines.length },
    { id: "overdue", label: "Overdue", count: overdueDeadlines.length },
    { id: "completed", label: "Completed", count: deadlines.filter((d) => d.status === "completed").length },
  ];

  const items =
    activeTab === "upcoming" ? upcomingDeadlines
    : activeTab === "overdue" ? overdueDeadlines
    : activeTab === "completed" ? deadlines.filter((d) => d.status === "completed")
    : deadlines;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Deadlines"
        description="Track critical dates and project milestones."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#2a8c82" }}
            onClick={() => alert("Create deadline modal not implemented")}
          >
            <Plus className="h-4 w-4" />
            New Deadline
          </button>
        }
      />

      {/* Overdue alert */}
      {overdueDeadlines.length > 0 && (
        <div
          className="flex items-start gap-3 rounded border px-4 py-3"
          style={{ backgroundColor: "#2e2015", borderColor: "#b8763a" }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#b8763a" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#e9ebf0" }}>
              {overdueDeadlines.length} overdue deadline{overdueDeadlines.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs" style={{ color: "#8f97a5" }}>
              {overdueDeadlines.map((d) => d.title).join(", ")}
            </p>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {isLoading ? (
        <div className="py-8 text-center text-sm" style={{ color: "#8f97a5" }}>Loading deadlines...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-5 w-5" />}
          title="No deadlines found"
          description="Add deadlines to track important dates."
        />
      ) : (
        <div className="space-y-2">
          {items.map((d) => (
            <div
              key={d.id}
              className="group flex items-start gap-4 rounded border px-4 py-4 transition-all hover:border-[#2a8c82]/30"
              style={{
                backgroundColor: "#1e232b",
                borderColor: d.status === "overdue" ? "#b8763a33" : "#2e3540",
              }}
            >
              {/* Priority dot */}
              <div
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    d.priority === "critical" ? "#c0392b"
                    : d.priority === "high" ? "#b8763a"
                    : d.priority === "medium" ? "#2a8c82"
                    : "#5b6472",
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p
                      className={`text-sm font-medium ${d.status === "completed" ? "line-through opacity-50" : ""}`}
                      style={{ color: "#e9ebf0" }}
                    >
                      {d.title}
                    </p>
                    {d.relatedProject && (
                      <p className="mt-0.5 font-mono text-[10px]" style={{ color: "#2a8c82" }}>
                        {d.relatedProject}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className="font-mono text-xs font-semibold"
                      style={{ color: d.status === "overdue" ? "#b8763a" : "#e9ebf0" }}
                    >
                      {d.date}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: d.status === "overdue" ? "#b8763a" : "#5b6472" }}>
                      {daysUntil(d.date)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={d.priority} showDot />
                  <StatusBadge status={d.status} />
                  <span className="font-mono text-[10px]" style={{ color: "#5b6472" }}>{d.category}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded p-1.5"
                  style={{ color: "#8f97a5" }}
                  onClick={() => alert("Edit modal not implemented")}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1.5"
                  style={{ color: "#c0392b" }}
                  onClick={() => deleteDeadline(d.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, CheckSquare, Square, Trash2, Edit3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs } from "@/components/ui/Tabs";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { TaskModal } from "@/components/modals/TaskModal";
import type { Task } from "@/types";

export default function Tasks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  async function fetchTasks() {
    setIsLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks.");
    } else if (data) {
      // Map DB snake_case to frontend camelCase
      const mappedTasks: Task[] = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        status: d.status,
        priority: d.priority,
        category: d.category,
        dueDate: d.due_date,
        completedAt: d.completed_at,
        tags: d.tags || [],
        createdAt: d.created_at,
      }));
      setTasks(mappedTasks);
    }
    setIsLoading(false);
  }

  async function toggleTask(id: string) {
    const taskToToggle = tasks.find((t) => t.id === id);
    if (!taskToToggle) return;

    const newStatus = taskToToggle.status === "completed" ? "todo" : "completed";
    const newCompletedAt =
      newStatus === "completed" ? new Date().toISOString() : null;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              completedAt: newCompletedAt || undefined,
            }
          : t
      )
    );

    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at: newCompletedAt,
      })
      .eq("id", id);

    if (error) {
      console.error("Error toggling task:", error);
      fetchTasks();
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      fetchTasks();
    }
  }

  function handleOpenCreate() {
    setTaskToEdit(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(task: Task) {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }

  const tabs = [
    { id: "active", label: "Active", count: tasks.filter((t) => t.status !== "completed").length },
    { id: "today", label: "Today", count: tasks.filter((t) => t.status === "in-progress").length },
    { id: "completed", label: "Completed", count: tasks.filter((t) => t.status === "completed").length },
  ];

  const base =
    activeTab === "completed"
      ? tasks.filter((t) => t.status === "completed")
      : activeTab === "today"
      ? tasks.filter((t) => t.status === "in-progress")
      : tasks.filter((t) => t.status !== "completed");

  const filtered = base.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Tasks"
        description="Manage your to-do list and track progress."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#2a8c82" }}
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." className="max-w-sm" />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {isLoading ? (
        <div className="py-8 text-center text-sm" style={{ color: "#8f97a5" }}>
          Loading tasks...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-5 w-5" />}
          title="No tasks found"
          description={
            activeTab === "completed"
              ? "Complete some tasks to see them here."
              : "Create a new task to get started."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-3 rounded border px-4 py-3 transition-all hover:border-[#2a8c82]/30"
              style={{ backgroundColor: "#1e232b", borderColor: "#2e3540" }}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 flex-shrink-0 transition-colors hover:opacity-80 cursor-pointer"
                aria-label={task.status === "completed" ? "Mark incomplete" : "Mark complete"}
              >
                {task.status === "completed" ? (
                  <CheckSquare className="h-4 w-4" style={{ color: "#2a8c82" }} />
                ) : (
                  <Square className="h-4 w-4" style={{ color: "#5b6472" }} />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.status === "completed" ? "line-through opacity-50" : ""
                  }`}
                  style={{ color: "#e9ebf0" }}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="mt-0.5 text-xs line-clamp-1" style={{ color: "#8f97a5" }}>
                    {task.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={task.priority} showDot />
                  <StatusBadge status={task.status} />
                  <span
                    className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
                    style={{ borderColor: "#2e3540", color: "#8f97a5" }}
                  >
                    {task.category}
                  </span>
                  {task.dueDate && (
                    <span className="font-mono text-[10px]" style={{ color: "#5b6472" }}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded p-1.5 transition-colors hover:opacity-80 cursor-pointer"
                  style={{ color: "#8f97a5" }}
                  onClick={() => handleOpenEdit(task)}
                  title="Edit task"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1.5 transition-colors hover:opacity-80 cursor-pointer"
                  style={{ color: "#c0392b" }}
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

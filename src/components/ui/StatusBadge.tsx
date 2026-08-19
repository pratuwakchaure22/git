import { cn } from "@/lib/utils";
import type { TaskStatus, ReminderStatus, DeadlineStatus } from "@/types";

type Status = TaskStatus | ReminderStatus | DeadlineStatus | "published" | "draft" | "archived" | "connected" | "disconnected";

const styles: Record<string, string> = {
  todo: "bg-[#20202E] text-[#9A9AA8] border-[#2A2A3A]",
  "in-progress": "bg-[#4F7CFF]/15 text-[#4F7CFF] border-[#4F7CFF]/30",
  completed: "bg-[#48C774]/15 text-[#48C774] border-[#48C774]/30",
  upcoming: "bg-[#4F7CFF]/15 text-[#4F7CFF] border-[#4F7CFF]/30",
  today: "bg-[#FFC43D]/15 text-[#FFC43D] border-[#FFC43D]/30",
  missed: "bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30",
  overdue: "bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30",
  published: "bg-[#48C774]/15 text-[#48C774] border-[#48C774]/30",
  draft: "bg-[#20202E] text-[#9A9AA8] border-[#2A2A3A]",
  archived: "bg-[#1B1B28] text-[#9A9AA8] border-[#2A2A3A]",
  connected: "bg-[#48C774]/15 text-[#48C774] border-[#48C774]/30",
  disconnected: "bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30",
};

const labels: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
  upcoming: "Upcoming",
  today: "Today",
  missed: "Missed",
  overdue: "Overdue",
  published: "Published",
  draft: "Draft",
  archived: "Archived",
  connected: "Connected",
  disconnected: "Disconnected",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 font-mono text-xs font-medium",
        styles[status] ?? "bg-[#20202E] text-[#9A9AA8] border-[#2A2A3A]",
        className
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

import { cn } from "@/lib/utils";
import type { TaskPriority, DeadlinePriority } from "@/types";

type Priority = TaskPriority | DeadlinePriority;

const styles: Record<Priority, string> = {
  critical: "bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30",
  high: "bg-[#FFC43D]/15 text-[#FFC43D] border-[#FFC43D]/30",
  medium: "bg-[#4F7CFF]/15 text-[#4F7CFF] border-[#4F7CFF]/30",
  low: "bg-[#20202E] text-[#9A9AA8] border-[#2A2A3A]",
};

const labels: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const dots: Record<Priority, string> = {
  critical: "bg-[#FF5C6C]",
  high: "bg-[#FFC43D]",
  medium: "bg-[#4F7CFF]",
  low: "bg-[#9A9AA8]",
};

interface PriorityBadgeProps {
  priority: Priority;
  showDot?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showDot = false, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 font-mono text-xs font-medium",
        styles[priority],
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dots[priority])} />}
      {labels[priority]}
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#2A2A3A] bg-[#1B1B28] py-16 text-center shadow-lg shadow-black/20",
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20202E] text-[#4F7CFF]">
          {icon}
        </div>
      )}
      <div>
        <p className="font-display text-sm font-semibold text-[#F4F4F7]">{title}</p>
        {description && <p className="mt-1 text-xs text-[#9A9AA8]">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

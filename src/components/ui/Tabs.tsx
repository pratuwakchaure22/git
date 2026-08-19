import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-[#2A2A3A]", className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition-all duration-200",
            active === tab.id
              ? "border-[#4F7CFF] text-[#4F7CFF] font-semibold"
              : "border-transparent text-[#9A9AA8] hover:text-[#F4F4F7]"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-mono",
                active === tab.id
                  ? "bg-[#4F7CFF]/15 text-[#4F7CFF] font-bold"
                  : "bg-[#20202E] text-[#9A9AA8]"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "indigo" | "amber";
  mono?: boolean;
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-paper text-muted border-line",
  indigo: "bg-indigo-soft text-indigo border-transparent",
  amber: "bg-amber-soft text-amber border-transparent",
};

export function Badge({ children, className, tone = "neutral", mono = true }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs",
        mono ? "font-mono tracking-tight" : "font-body font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

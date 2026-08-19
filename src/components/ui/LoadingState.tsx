import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingState({ message = "Loading...", className, size = "md" }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16", className)}>
      <Loader2 className={cn("animate-spin text-indigo", sizes[size])} />
      <p className="text-xs text-muted">{message}</p>
    </div>
  );
}

// Skeleton variants for inline loading
export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("h-3 animate-pulse rounded bg-line", className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded border border-line bg-surface p-4 space-y-3 animate-pulse", className)}>
      <div className="h-3 w-1/3 rounded bg-line" />
      <div className="h-2 w-2/3 rounded bg-line" />
      <div className="h-2 w-1/2 rounded bg-line" />
    </div>
  );
}

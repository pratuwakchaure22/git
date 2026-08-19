import { SignalMark } from "@/components/common/SignalMark";

export function RouteLoader() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <div className="w-40 text-indigo">
        <SignalMark animate className="h-8" />
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-muted">Loading</p>
    </div>
  );
}

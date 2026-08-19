import { cn } from "@/lib/utils";

interface EyebrowProps {
  label: string;
  index?: string;
  className?: string;
  tone?: "indigo" | "amber" | "muted";
}

const toneClasses: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  indigo: "text-indigo",
  amber: "text-amber",
  muted: "text-muted",
};

/**
 * Instrument-panel style readout used as an eyebrow above headings —
 * e.g. "[ 03 / 09 ]  RESEARCH". Reinforces the site's signal/systems motif.
 */
export function Eyebrow({ label, index, className, tone = "indigo" }: EyebrowProps) {
  return (
    <div className={cn("flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em]", className)}>
      <span className={cn("relative flex h-1.5 w-1.5", toneClasses[tone])}>
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-current" />
      </span>
      {index && <span className="text-muted">[{index}]</span>}
      <span className={toneClasses[tone]}>{label}</span>
    </div>
  );
}

import type { ProjectCategory } from "@/types";

const categoryLabel: Record<ProjectCategory, string> = {
  web: "WEB",
  "ai-ml": "AI / ML",
  mobile: "MOBILE",
  systems: "SYSTEMS",
  design: "DESIGN",
};

// Deterministic pseudo-random generator so each project gets a stable,
// unique-looking readout instead of a random or stock image.
function seededValues(seed: string, count: number, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const values: number[] = [];
  let state = hash || 1;
  for (let i = 0; i < count; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const t = (state % 1000) / 1000;
    values.push(min + t * (max - min));
  }
  return values;
}

interface ProjectVisualProps {
  id: string;
  category: ProjectCategory;
  year: string;
  className?: string;
}

export function ProjectVisual({ id, category, year, className }: ProjectVisualProps) {
  const bars = seededValues(id, 24, 8, 38);
  const points = seededValues(`${id}-line`, 8, 6, 34);
  const linePath = points
    .map((v, i) => `${(i / (points.length - 1)) * 100},${40 - v}`)
    .join(" L ");

  return (
    <div
      className={`relative flex h-44 flex-col justify-between overflow-hidden rounded-t-2xl border-b border-line bg-surface p-5 ${className ?? ""}`}
    >
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative flex items-start justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
        <span>{categoryLabel[category]}</span>
        <span>{year}</span>
      </div>

      <div className="relative flex h-16 items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-indigo/25 dark:bg-indigo/30"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-5 bottom-5 h-12 w-[calc(100%-2.5rem)]" aria-hidden="true">
        <path d={`M ${linePath}`} fill="none" stroke="var(--color-amber)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
    </div>
  );
}

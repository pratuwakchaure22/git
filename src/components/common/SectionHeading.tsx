import type { ReactNode } from "react";
import { Eyebrow } from "@/components/common/Eyebrow";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIndex?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  eyebrowIndex,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        action ? "md:flex-row md:items-end md:justify-between" : "",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-4", align === "center" && "items-center text-center")}>
        {eyebrow && <Eyebrow label={eyebrow} index={eyebrowIndex} />}
        <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {description && <p className="text-base leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

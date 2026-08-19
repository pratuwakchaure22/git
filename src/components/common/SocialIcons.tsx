import { Mail, GraduationCap, Globe, type LucideIcon } from "lucide-react";
import type { SocialLink } from "@/types";
import { cn } from "@/lib/utils";

const iconMap: Partial<Record<SocialLink["icon"], LucideIcon>> = {
  mail: Mail,
  scholar: GraduationCap,
  globe: Globe,
};

// lucide-react no longer ships brand/logo glyphs (GitHub, LinkedIn, X, ...).
// Short mono codes keep these consistent with the site's instrument-panel type system.
const textMap: Partial<Record<SocialLink["icon"], string>> = {
  github: "GH",
  linkedin: "in",
  twitter: "X",
};

interface SocialIconsProps {
  links: SocialLink[];
  className?: string;
  iconClassName?: string;
}

export function SocialIcons({ links, className, iconClassName }: SocialIconsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map((link) => {
        const Icon = iconMap[link.icon];
        const text = textMap[link.icon];
        return (
          <a
            key={link.label}
            href={link.url}
            target={link.icon === "mail" ? undefined : "_blank"}
            rel="noreferrer noopener"
            aria-label={link.label}
            title={link.label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-indigo hover:text-indigo",
              iconClassName,
            )}
          >
            {Icon ? (
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <span className="font-mono text-[11px] font-semibold">{text}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

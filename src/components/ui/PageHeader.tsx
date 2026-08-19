import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-2", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-[#9A9AA8]" />}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="font-mono text-xs text-[#9A9AA8] hover:text-[#4F7CFF] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-[#9A9AA8]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4F4F7]">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-[#9A9AA8]">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2 sm:mt-0">{actions}</div>
      )}
    </div>
  );
}

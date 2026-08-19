import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Code2 } from "lucide-react";
import type { Project } from "@/types";
import { Badge } from "@/components/common/Badge";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_TAGS = 4;

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const visibleTech = project.techStack.slice(0, MAX_VISIBLE_TAGS);
  const remaining = project.techStack.length - visibleTech.length;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-lg">
      <ProjectVisual id={project.id} category={project.category} year={project.year} />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{project.title}</h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${project.title} on GitHub`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-indigo hover:text-indigo"
              >
                <Code2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${project.title} live site`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-indigo hover:text-indigo"
              >
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted">{project.summary}</p>

        <div className="flex flex-wrap gap-1.5">
          {visibleTech.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
          {remaining > 0 && <Badge tone="indigo">+{remaining}</Badge>}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="mt-auto flex items-center gap-1.5 pt-2 text-left font-mono text-xs uppercase tracking-wider text-indigo"
        >
          {expanded ? "Hide details" : "View details"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} strokeWidth={1.75} />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 border-t border-line pt-4">
                <p className="text-sm leading-relaxed text-muted">{project.description}</p>
                <ul className="flex flex-col gap-1.5">
                  {project.highlights.map((point) => (
                    <li key={point} className="flex gap-2 text-sm leading-relaxed text-ink">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="font-mono text-xs text-muted">Role — {project.role}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

import Link from "next/link";
import type { Project } from "@/data/projects";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";
import { TechStack } from "./TechStack";

export function SystemCard({ project }: { project: Project }) {
  const needsReview = project.confidence === "Needs Carson Review";
  return (
    <Link
      href={`/systems/${project.slug}`}
      className="group panel relative flex flex-col gap-3 p-5 transition-colors hover:border-cyan/50 focus-visible:border-cyan"
    >
      {/* module header bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-ink group-hover:text-cyan">
            {project.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CategoryBadge category={project.category} />
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">
        {project.summary}
      </p>

      {needsReview ? (
        <p className="mono text-[11px] text-violet">
          ⚠ Needs Carson review — details unconfirmed
        </p>
      ) : null}

      <div className="mt-auto space-y-3 pt-1">
        <TechStack tech={project.tech.slice(0, 5)} />
        <span className="mono inline-flex items-center gap-1 text-xs text-ink-dim group-hover:text-cyan">
          View system <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

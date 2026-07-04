"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectCategory, ProjectStatus } from "@/data/projects";
import { SystemCard } from "./SystemCard";
import { cn } from "@/lib/utils";

type CategoryFilter = ProjectCategory | "All";
type StatusFilter = ProjectStatus | "All";

export function SystemsExplorer({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");

  const categories = useMemo<CategoryFilter[]>(() => {
    const set = new Set<ProjectCategory>();
    projects.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set).sort()];
  }, [projects]);

  const statuses = useMemo<StatusFilter[]>(() => {
    const order: ProjectStatus[] = [
      "Active",
      "Prototype",
      "Experimental",
      "Planning",
      "Paused",
      "Archived",
      "Needs Review",
    ];
    const present = order.filter((s) => projects.some((p) => p.status === s));
    return ["All", ...present];
  }, [projects]);

  const filtered = projects.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (status === "All" || p.status === status),
  );

  return (
    <div>
      <div className="mb-6 space-y-3">
        <FilterRow
          label="Category"
          options={categories}
          active={category}
          onSelect={(v) => setCategory(v as CategoryFilter)}
        />
        <FilterRow
          label="Status"
          options={statuses}
          active={status}
          onSelect={(v) => setStatus(v as StatusFilter)}
        />
      </div>

      <p className="mono mb-4 text-xs text-ink-dim">
        {filtered.length} system{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <SystemCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <p className="panel p-6 text-sm text-ink-muted">
          No systems match that filter.
        </p>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mono w-16 shrink-0 text-[11px] uppercase tracking-wider text-ink-dim">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSelect(o)}
          aria-pressed={active === o}
          className={cn(
            "mono rounded border px-2.5 py-1 text-xs transition-colors",
            active === o
              ? "border-cyan/50 bg-cyan/10 text-cyan"
              : "border-line bg-surface-2 text-ink-muted hover:text-ink",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

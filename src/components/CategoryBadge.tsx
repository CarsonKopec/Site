import type { ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  className,
}: {
  category: ProjectCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center rounded border border-line-strong bg-base px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-muted",
        className,
      )}
    >
      {category}
    </span>
  );
}

import type { ProjectStatus } from "@/data/projects";
import { cn } from "@/lib/utils";

// Status is conveyed by text + a distinct dot shape/label, never by color alone.
const STATUS_STYLES: Record<
  ProjectStatus,
  { dot: string; text: string; ring: string }
> = {
  Active: {
    dot: "bg-green",
    text: "text-green",
    ring: "ring-green/30",
  },
  Prototype: {
    dot: "bg-cyan",
    text: "text-cyan",
    ring: "ring-cyan/30",
  },
  Experimental: {
    dot: "bg-amber",
    text: "text-amber",
    ring: "ring-amber/30",
  },
  Planning: {
    dot: "bg-blue",
    text: "text-blue",
    ring: "ring-blue/30",
  },
  Paused: {
    dot: "bg-iron",
    text: "text-iron",
    ring: "ring-iron/30",
  },
  Archived: {
    dot: "bg-ink-dim",
    text: "text-ink-dim",
    ring: "ring-ink-dim/30",
  },
  "Needs Review": {
    dot: "bg-violet",
    text: "text-violet",
    ring: "ring-violet/30",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium ring-1",
        s.text,
        s.ring,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", s.dot)}
      />
      <span>{status}</span>
    </span>
  );
}

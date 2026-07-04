import { cn } from "@/lib/utils";

// A card describing one part of a system (a component / layer / note line).
export function ArchitectureCard({
  label,
  body,
  className,
}: {
  label?: string;
  body: string;
  className?: string;
}) {
  // Support "component — description" lines from project data.
  let head = label;
  let rest = body;
  if (!head && body.includes(" — ")) {
    const [h, ...r] = body.split(" — ");
    head = h;
    rest = r.join(" — ");
  }

  return (
    <div
      className={cn(
        "panel-2 flex gap-3 p-3.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-1 h-2 w-2 shrink-0 rotate-45 border border-cyan bg-cyan/20"
      />
      <div className="min-w-0">
        {head ? (
          <p className="mono text-sm font-medium text-ink">{head}</p>
        ) : null}
        {rest ? (
          <p className="text-sm text-ink-muted">{rest}</p>
        ) : null}
      </div>
    </div>
  );
}

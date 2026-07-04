import { cn } from "@/lib/utils";

// Reusable pipeline / data-flow visualization.
// Horizontal on wide screens, vertical stack on narrow ones.
export function PipelineFlow({
  steps,
  className,
}: {
  steps: string[];
  className?: string;
}) {
  if (!steps.length) return null;
  return (
    <ol
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch",
        className,
      )}
      aria-label="Pipeline flow"
    >
      {steps.map((step, i) => (
        <li key={`${step}-${i}`} className="flex items-center gap-2">
          <span className="mono flex-1 rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-center text-xs text-ink sm:flex-none">
            <span className="mr-1.5 text-ink-dim">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </span>
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="mono select-none text-cyan"
            >
              <span className="hidden sm:inline">→</span>
              <span className="inline sm:hidden">↓</span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

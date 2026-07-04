import { cn } from "@/lib/utils";

export function SectionHeader({
  index,
  title,
  subtitle,
  className,
}: {
  index?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-baseline gap-3">
        {index ? (
          <span className="mono text-sm text-cyan">{index}</span>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-line-strong via-line to-transparent" />
    </div>
  );
}

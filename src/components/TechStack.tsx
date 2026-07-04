import { cn } from "@/lib/utils";

export function TechStack({
  tech,
  className,
}: {
  tech: string[];
  className?: string;
}) {
  if (!tech.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tech.map((t) => (
        <li
          key={t}
          className="mono rounded border border-line bg-base px-1.5 py-0.5 text-[11px] text-ink-muted"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

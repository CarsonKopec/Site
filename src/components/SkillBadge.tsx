import { cn } from "@/lib/utils";

export function SkillBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink-muted transition-colors hover:border-cyan/40 hover:text-ink",
        className,
      )}
    >
      {label}
    </span>
  );
}

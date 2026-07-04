import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="mono text-sm text-cyan">404 · route not found</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
        No system at this address.
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted">
        The page you were looking for isn&apos;t here. It may have moved, or the
        link is off.
      </p>
      <Link
        href="/"
        className="mono mt-6 rounded-md border border-line-strong bg-surface px-4 py-2 text-sm text-ink hover:border-cyan/50"
      >
        ← Back home
      </Link>
    </div>
  );
}

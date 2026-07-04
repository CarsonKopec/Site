import Link from "next/link";
import { githubUrl } from "@/data/links";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-base/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Wordmark className="text-sm text-ink" />
          <p className="mt-1 text-xs text-ink-dim">
            Systems, tools, games, ML & hardware — built to understand how they
            work.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link
            href="/systems"
            className="mono text-xs text-ink-muted hover:text-cyan"
          >
            Systems
          </Link>
          <Link
            href="/notes"
            className="mono text-xs text-ink-muted hover:text-cyan"
          >
            Notes
          </Link>
          <Link
            href="/devlog"
            className="mono text-xs text-ink-muted hover:text-cyan"
          >
            Devlog
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mono text-xs text-ink-muted hover:text-cyan"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
      <div className="border-t border-line px-4 py-3 sm:px-6">
        <p className="mono mx-auto max-w-6xl text-[11px] text-ink-dim">
          © {year} Carson · built with Next.js + Tailwind · this is a builder's
          workbench, not a résumé
        </p>
      </div>
    </footer>
  );
}

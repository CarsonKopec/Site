import type { Metadata } from "next";
import Link from "next/link";
import { listNotes } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Architecture Notes",
  description:
    "A public engineering notebook — how Carson's systems are structured, why they use the architecture they do, pipeline designs, and lessons learned.",
};

export default function NotesPage() {
  const notes = listNotes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="mono mb-3 text-xs text-cyan">// notes</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Architecture Notes
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
        A public engineering notebook — short writeups on how a system is
        structured, why it uses a certain architecture, pipeline designs, and
        the tradeoffs behind the decisions.
      </p>

      <div className="mt-10 space-y-3">
        {notes.length === 0 ? (
          <p className="panel p-6 text-sm text-ink-muted">
            No notes yet. Push one with{" "}
            <code className="mono text-cyan">
              npm run content -- notes push note.md
            </code>
            .
          </p>
        ) : null}

        {notes.map((n) => (
          <Link
            key={n.slug}
            href={`/notes/${n.slug}`}
            className="group panel block p-5 transition-colors hover:border-cyan/50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded border border-line-strong bg-base px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-muted">
                {n.category}
              </span>
              <span className="mono text-[11px] text-ink-dim">
                {formatDate(n.date)}
              </span>
            </div>
            <h2 className="mt-2.5 text-lg font-semibold text-ink group-hover:text-cyan">
              {n.title}
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">{n.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

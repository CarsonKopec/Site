import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote, getProjectRecord } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { PipelineFlow } from "@/components/PipelineFlow";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "Note not found" };
  return { title: note.title, description: note.summary };
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const related = note.related
    .map((s) => getProjectRecord(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link
        href="/notes"
        className="mono text-xs text-ink-muted hover:text-cyan"
      >
        ← All notes
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono rounded border border-line-strong bg-base px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-muted">
            {note.category}
          </span>
          <span className="mono text-[11px] text-ink-dim">
            {formatDate(note.date)}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {note.title}
        </h1>
        {note.summary ? (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            {note.summary}
          </p>
        ) : null}
      </header>

      {note.pipeline.length ? (
        <div className="panel mt-8 p-5">
          <PipelineFlow steps={note.pipeline} />
        </div>
      ) : null}

      <div
        className="prose-content mt-8"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(note.body) }}
      />

      {related.length ? (
        <div className="mt-12 border-t border-line pt-6">
          <p className="mono mb-3 text-xs text-ink-dim">Related systems</p>
          <div className="flex flex-wrap gap-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/systems/${p.slug}`}
                className="mono rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink hover:border-cyan/50"
              >
                {p.name} →
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

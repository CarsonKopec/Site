import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlog } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.summary };
}

export default async function DevlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link
        href="/devlog"
        className="mono text-xs text-ink-muted hover:text-cyan"
      >
        ← All devlog
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono rounded border border-line-strong bg-base px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-muted">
            {post.category}
          </span>
          <span className="mono text-[11px] text-ink-dim">
            {formatDate(post.date)}
          </span>
          {post.draft ? (
            <span className="mono text-[11px] text-amber">draft</span>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        {post.summary ? (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            {post.summary}
          </p>
        ) : null}
      </header>

      <div
        className="prose-content mt-8"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
      />
    </article>
  );
}

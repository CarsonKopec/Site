import type { Metadata } from "next";
import Link from "next/link";
import { listBlog } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Devlog",
  description:
    "Build notes and updates from Carson's systems work — architecture, pipeline design, infrastructure, and AI-assisted development.",
};

export default function DevlogPage() {
  const posts = listBlog();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="mono mb-3 text-xs text-cyan">// devlog</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Devlog
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
        Build logs and updates, authored as markdown and managed through the
        content API / carsonctl.
      </p>

      <div className="mt-10 space-y-3">
        {posts.length === 0 ? (
          <p className="panel p-6 text-sm text-ink-muted">
            No posts yet. Push one with{" "}
            <code className="mono text-cyan">
              npm run content -- blog push post.md
            </code>
            .
          </p>
        ) : null}

        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/devlog/${p.slug}`}
            className="group panel block p-5 transition-colors hover:border-cyan/50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded border border-line-strong bg-base px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-muted">
                {p.category}
              </span>
              <span className="mono text-[11px] text-ink-dim">
                {formatDate(p.date)}
              </span>
            </div>
            <h2 className="mt-2.5 text-lg font-semibold text-ink group-hover:text-cyan">
              {p.title}
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">{p.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

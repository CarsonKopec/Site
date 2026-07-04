import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectRecord } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TechStack } from "@/components/TechStack";
import { PipelineFlow } from "@/components/PipelineFlow";
import { ArchitectureCard } from "@/components/ArchitectureCard";
import { SectionHeader } from "@/components/SectionHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectRecord(slug);
  if (!project) return { title: "System not found" };
  return {
    title: project.name,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectRecord(slug);
  if (!project) notFound();

  const needsReview = project.confidence === "Needs Carson Review";

  return (
    <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <Link
        href="/systems"
        className="mono text-xs text-ink-muted hover:text-cyan"
      >
        ← All systems
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={project.status} />
          <CategoryBadge category={project.category} />
          {project.confidence ? (
            <span className="mono text-[11px] text-ink-dim">
              {project.confidence}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {project.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mono rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink hover:border-cyan/50"
            >
              Repository ↗
            </a>
          ) : null}
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mono rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink hover:border-cyan/50"
            >
              Demo ↗
            </a>
          ) : null}
        </div>
      </header>

      {needsReview ? (
        <div className="mt-6 rounded-md border border-violet/40 bg-violet/5 p-4">
          <p className="mono text-sm text-violet">
            ⚠ Needs Carson review
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            This entry is a placeholder or was inferred from the repo layout.
            Details below are unconfirmed and shouldn&apos;t be read as final.
          </p>
        </div>
      ) : null}

      <div className="mt-10 space-y-12">
        {/* Problem */}
        {project.problem ? (
          <section>
            <SectionHeader title="Why it exists" />
            <p className="text-[15px] leading-relaxed text-ink-muted">
              {project.problem}
            </p>
          </section>
        ) : null}

        {/* System overview */}
        <section>
          <SectionHeader
            title="System overview"
            subtitle={project.systemRole}
          />
          <div
            className="prose-content text-[15px] leading-relaxed text-ink-muted"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(project.description),
            }}
          />
        </section>

        {/* Highlights */}
        {project.highlights.length ? (
          <section>
            <SectionHeader title="Highlights" />
            <ul className="grid gap-2 sm:grid-cols-2">
              {project.highlights.map((h) => (
                <li
                  key={h}
                  className="panel-2 flex gap-2.5 p-3 text-sm text-ink-muted"
                >
                  <span
                    aria-hidden="true"
                    className="mono mt-0.5 text-green"
                  >
                    +
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Architecture */}
        {project.architectureNotes?.length ? (
          <section>
            <SectionHeader
              title="Architecture"
              subtitle="How the system is broken into parts."
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {project.architectureNotes.map((a) => (
                <ArchitectureCard key={a} body={a} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Pipeline */}
        {project.pipelineSteps?.length ? (
          <section>
            <SectionHeader
              title="Pipeline flow"
              subtitle="How data / control moves through the system."
            />
            <div className="panel p-5">
              <PipelineFlow steps={project.pipelineSteps} />
            </div>
          </section>
        ) : null}

        {/* Tech stack */}
        {project.tech.length ? (
          <section>
            <SectionHeader title="Tech stack" />
            <TechStack tech={project.tech} />
          </section>
        ) : null}

        {/* Lessons */}
        {project.lessons?.length ? (
          <section>
            <SectionHeader title="What I learned" />
            <ul className="space-y-2">
              {project.lessons.map((l) => (
                <li
                  key={l}
                  className="text-[15px] leading-relaxed text-ink-muted"
                >
                  {l}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Future */}
        {project.futurePlans?.length ? (
          <section>
            <SectionHeader title="Future plans" />
            <ul className="space-y-2">
              {project.futurePlans.map((f) => (
                <li
                  key={f}
                  className="flex gap-2.5 text-[15px] text-ink-muted"
                >
                  <span aria-hidden="true" className="mono text-amber">
                    →
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}

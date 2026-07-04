import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
import { SystemCard } from "@/components/SystemCard";
import { SkillBadge } from "@/components/SkillBadge";
import { PipelineFlow } from "@/components/PipelineFlow";
import { listFeaturedProjects, listBlog, listNotes } from "@/lib/db";
import { skillGroups } from "@/data/skills";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FOCUS = [
  {
    title: "Automation pipelines",
    body: "Wiring tools together so work moves without a human babysitting each step.",
  },
  {
    title: "Server infrastructure",
    body: "Self-hosting, Linux servers, tunnels, and the plumbing behind projects.",
  },
  {
    title: "Developer tooling",
    body: "CLIs, editor integrations, and libraries that make other work easier.",
  },
  {
    title: "Game / server systems",
    body: "Protocols, bots, and handheld hardware — systems close to the metal.",
  },
  {
    title: "Observability & dashboards",
    body: "Making systems observable, scriptable, and easy to extend.",
  },
  {
    title: "AI-assisted engineering",
    body: "Using Claude for specs, architecture, and refactoring — not magic.",
  },
];

export default function HomePage() {
  const featuredProjects = listFeaturedProjects();
  const recentNotes = listNotes().slice(0, 2);
  const recentDevlog = listBlog().slice(0, 3);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* Current Focus */}
        <section aria-labelledby="focus" className="scroll-mt-20">
          <SectionHeader
            index="01"
            title="Current Focus"
            subtitle="Right now I'm focused on building systems that connect tools together: pipelines, dashboards, backend services, automation workflows, and infrastructure around my projects — making them easier to manage, observe, extend, and deploy."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FOCUS.map((f) => (
              <div key={f.title} className="panel p-4">
                <h3 className="mono text-sm font-medium text-cyan">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-muted">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Systems */}
        <section aria-labelledby="featured" className="mt-16 scroll-mt-20">
          <SectionHeader
            index="02"
            title="Featured Systems"
            subtitle="A few of the projects that best show the direction — tools, infrastructure, and codegen. The full list lives on the Systems page."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((p) => (
              <SystemCard key={p.slug} project={p} />
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/systems"
              className="mono text-sm text-cyan hover:underline"
            >
              View all systems →
            </Link>
          </div>
        </section>

        {/* Pipeline / Infrastructure mindset */}
        <section aria-labelledby="mindset" className="mt-16 scroll-mt-20">
          <SectionHeader
            index="03"
            title="Pipeline & Infrastructure Mindset"
            subtitle="Most of my projects, whatever the domain, end up shaped like a pipeline: something comes in, gets processed and validated, gets stored, and gets surfaced. Thinking this way makes systems easier to test and extend."
          />
          <div className="panel p-5 sm:p-6">
            <PipelineFlow
              steps={[
                "Input",
                "Parser / Collector",
                "Processing",
                "Validation",
                "State / Storage",
                "API / Dashboard",
                "Output",
              ]}
            />
            <p className="mt-5 max-w-3xl text-sm text-ink-muted">
              I like working on the parts most people don&apos;t see first:
              protocols, dashboards, automation, server tooling, data flow,
              deployment, and the glue that makes different tools talk to each
              other.
            </p>
          </div>
        </section>

        {/* Skills snapshot */}
        <section aria-labelledby="skills" className="mt-16 scroll-mt-20">
          <SectionHeader
            index="04"
            title="Skills Snapshot"
            subtitle="Grouped around what I actually build, not a keyword dump."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((g) => (
              <div key={g.title} className="panel p-4">
                <h3 className="text-sm font-semibold text-ink">
                  {g.title}
                </h3>
                <p className="mt-1 mb-3 text-xs text-ink-dim">
                  {g.blurb}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <SkillBadge key={s} label={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent notes + devlog */}
        <section aria-labelledby="recent" className="mt-16 scroll-mt-20">
          <SectionHeader
            index="05"
            title="Recent Notes & Devlog"
            subtitle="A public engineering notebook — how systems are structured and why."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h3 className="mono mb-3 text-sm text-cyan">
                Architecture Notes
              </h3>
              <ul className="space-y-3">
                {recentNotes.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/notes/${n.slug}`}
                      className="group block"
                    >
                      <p className="text-sm font-medium text-ink group-hover:text-cyan">
                        {n.title}
                      </p>
                      <p className="mono mt-0.5 text-[11px] text-ink-dim">
                        {n.category} · {formatDate(n.date)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/notes"
                className="mono mt-4 inline-block text-xs text-cyan hover:underline"
              >
                All notes →
              </Link>
            </div>

            <div className="panel p-5">
              <h3 className="mono mb-3 text-sm text-cyan">Devlog</h3>
              <ul className="space-y-3">
                {recentDevlog.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/devlog/${p.slug}`} className="group block">
                      <p className="text-sm font-medium text-ink group-hover:text-cyan">
                        {p.title}
                      </p>
                      <p className="mono mt-0.5 text-[11px] text-ink-dim">
                        {p.category} · {formatDate(p.date)}
                      </p>
                    </Link>
                  </li>
                ))}
                {recentDevlog.length === 0 ? (
                  <li className="text-sm text-ink-dim">No posts yet.</li>
                ) : null}
              </ul>
              <Link
                href="/devlog"
                className="mono mt-4 inline-block text-xs text-cyan hover:underline"
              >
                All devlog →
              </Link>
            </div>
          </div>
        </section>

        {/* Links */}
        <section aria-labelledby="links" className="mt-16 scroll-mt-20">
          <SectionHeader index="06" title="Links" />
          <div className="panel flex flex-wrap items-center gap-4 p-5">
            <p className="text-sm text-ink-muted">
              Want to see the source, or get in touch?
            </p>
            <Link
              href="/links"
              className="mono rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink hover:border-cyan/50"
            >
              Go to Links →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

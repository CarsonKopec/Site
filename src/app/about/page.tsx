import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "Carson — a systems-minded builder working across infrastructure, developer tools, game and Minecraft systems, computer vision, and custom hardware.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="mono mb-3 text-xs text-cyan">// about</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        I build things as systems — to understand how they work.
      </h1>

      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink-muted">
        <p>
          I&apos;m Carson. I like coding, games, servers, and figuring out how
          things work underneath the surface. My projects cover a lot of ground
          — infrastructure and developer tools, game and Minecraft systems,
          computer vision, and custom hardware — but they tend to share one
          thing: I approach them as systems.
        </p>
        <p>
          I like designing the pieces that make a project actually work:
          pipelines, services, protocols, data flow, deployment, and tooling.
          Whether it&apos;s a handheld game console, a real-time vision model for
          Minecraft, or a filesystem driver, I&apos;m usually most interested in
          the plumbing underneath.
        </p>
        <p>
          I use tools like Claude as a development partner — to help me plan,
          design, refactor, and think through architecture. The important part
          isn&apos;t generating code; it&apos;s understanding how the pieces fit
          together and turning messy ideas into working systems. Most of my
          projects start as experiments, and the goal is always to make them
          easier to understand, manage, and extend.
        </p>
      </div>

      <div className="mt-12">
        <SectionHeader
          title="How I work"
          subtitle="A few principles that show up across projects."
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            {
              t: "Close to the metal",
              d: "I like working near servers, protocols, pipelines, automation, and tooling.",
            },
            {
              t: "Observable & scriptable",
              d: "I care about making systems easy to observe, script, and extend.",
            },
            {
              t: "Experiments → infrastructure",
              d: "Most projects start as experiments and turn into tools or infrastructure.",
            },
            {
              t: "Understand, don't just generate",
              d: "AI helps me move faster while still understanding what I'm building.",
            },
          ].map((x) => (
            <li key={x.t} className="panel p-4">
              <p className="mono text-sm font-medium text-cyan">
                {x.t}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{x.d}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 panel p-5">
        <p className="text-sm text-ink-muted">
          The projects that back all of this live on the{" "}
          <a
            href="/systems"
            className="text-cyan hover:underline"
          >
            Systems
          </a>{" "}
          page, with the engineering thinking behind them in{" "}
          <a href="/notes" className="text-cyan hover:underline">
            Notes
          </a>
          .
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { githubUrl } from "@/data/links";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* corner brackets for the "command center" framing */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mono mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs text-ink-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-green"
          />
          Systems-minded builder · Tools · Games · ML · Hardware
        </p>

        <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          Hey, I&apos;m Carson. I build{" "}
          <span className="text-cyan">systems</span>,{" "}
          <span className="text-blue">tools</span>,{" "}
          <span className="text-amber">games</span>,{" "}
          <span className="text-green">ML/CV</span>, and{" "}
          <span className="text-violet">hardware</span> — usually to understand
          how they work under the hood.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-ink-muted sm:text-lg">
          The work is systems-minded — pipelines, protocols, and tooling — but it
          spans a lot of ground: infrastructure and developer tools, game and
          Minecraft systems, computer vision, and custom hardware. Most of it
          starts as an experiment and grows into a tool or a system.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/systems"
            className="mono rounded-md bg-cyan px-4 py-2.5 text-sm font-medium text-[#0a0e14] transition-opacity hover:opacity-90"
          >
            View Systems →
          </Link>
          <Link
            href="/devlog"
            className="mono rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-cyan/50"
          >
            Read Devlog
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mono rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-cyan/50"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}

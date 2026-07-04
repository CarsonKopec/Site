import type { Metadata } from "next";
import { SystemsExplorer } from "@/components/SystemsExplorer";
import { listProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Systems & Projects",
  description:
    "Carson's systems and projects — infrastructure, pipelines, developer tools, game/server systems, and hardware, framed as systems rather than apps.",
};

export default function SystemsPage() {
  const projects = listProjects();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="mono mb-3 text-xs text-cyan">// systems</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Systems &amp; Projects
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
        These are framed as systems — tools, pipelines, and infrastructure —
        not just apps. Each one is at a different stage; statuses are honest, and
        anything I haven&apos;t fully documented is marked{" "}
        <span className="text-violet">Needs Review</span> rather than
        dressed up as finished.
      </p>

      <div className="mt-8">
        <SystemsExplorer projects={projects} />
      </div>
    </div>
  );
}

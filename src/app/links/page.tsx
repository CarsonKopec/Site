import type { Metadata } from "next";
import { links } from "@/data/links";

export const metadata: Metadata = {
  title: "Links",
  description: "Where to find Carson's code and how to get in touch.",
};

export default function LinksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="mono mb-3 text-xs text-cyan">// links</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Links
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
        Where the code lives and how to reach me. Placeholders below are for
        Carson to fill in.
      </p>

      <ul className="mt-10 space-y-3">
        {links.map((l) => {
          const isPlaceholder = l.placeholder;
          const content = (
            <>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-ink">
                  {l.label}
                </span>
                {l.handle ? (
                  <span className="mono text-xs text-cyan">
                    {l.handle}
                  </span>
                ) : null}
                {isPlaceholder ? (
                  <span className="mono text-[11px] text-amber">
                    placeholder
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {l.description}
              </p>
            </>
          );

          return (
            <li key={l.label}>
              {isPlaceholder ? (
                <div className="panel block p-5 opacity-80">{content}</div>
              ) : (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group panel block p-5 transition-colors hover:border-cyan/50"
                >
                  {content}
                  <span className="mono mt-2 inline-block text-xs text-ink-dim group-hover:text-cyan">
                    {l.href} ↗
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { githubUrl } from "@/data/links";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/systems", label: "Systems" },
  { href: "/notes", label: "Notes" },
  { href: "/devlog", label: "Devlog" },
  { href: "/about", label: "About" },
  { href: "/links", label: "Links" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/85 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <Link
          href="/"
          className="mono flex items-center gap-2 text-sm font-semibold text-ink"
        >
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded border border-cyan/50 bg-cyan/10 text-cyan"
          >
            C
          </span>
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "mono rounded px-3 py-1.5 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-surface-2 text-cyan"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mono ml-1 rounded border border-line-strong px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-cyan/50 hover:text-ink"
            >
              GitHub ↗
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="mono rounded border border-line-strong px-3 py-1.5 text-sm text-ink-muted md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {/* Mobile nav */}
      {open ? (
        <ul
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden"
        >
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "mono block rounded px-3 py-2 text-sm",
                  isActive(item.href)
                    ? "bg-surface-2 text-cyan"
                    : "text-ink-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mono block rounded px-3 py-2 text-sm text-ink-muted"
            >
              GitHub ↗
            </a>
          </li>
        </ul>
      ) : null}
    </header>
  );
}

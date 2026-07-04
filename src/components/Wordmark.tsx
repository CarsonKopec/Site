"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// The suffix cycles through the domains Carson actually builds in — the work is
// systems-minded, but not systems-only.
const SUFFIXES = ["systems", "tools", "games", "ml", "hardware", "servers"];

export function Wordmark({ className }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setI((v) => (v + 1) % SUFFIXES.length),
      2600,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <span className={cn("mono", className)}>
      carson<span className="text-ink-dim">.</span>
      <span
        key={i}
        className="wordmark-word text-ink-muted"
        // fixed width avoids layout shift as the word length changes
      >
        {SUFFIXES[i]}
      </span>
    </span>
  );
}

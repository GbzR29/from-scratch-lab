"use client";

// ── Prerequisites ────────────────────────────────────────────────────────────
// The "Before you start" box at the top of a chapter (built from the chapter's
// `requires` list) and the inline <Recall> chip a lesson puts where it uses an
// earlier idea. Both only point back for review; the lesson does not re-teach.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Chapter } from "@/lib/tracks/types";

export interface PrereqLabels {
  beforeStart: string;
  buildsOn: string;
  read: string;
  review: string;
  open: string;
}

interface PrereqCtx {
  chapters: Chapter[];          // shown (translated) chapters of the open track
  visited: Set<string>;
  open: (id: string) => void;   // opens a chapter of the same track
  labels: PrereqLabels;
}

const Ctx = createContext<PrereqCtx | null>(null);

export function PrereqProvider({ children, ...value }: PrereqCtx & { children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Number (1-based) and chapter for an id, or null when the id is unknown. */
function lookup(ctx: PrereqCtx, id: string) {
  const i = ctx.chapters.findIndex((c) => c.id === id);
  return i < 0 ? null : { n: i + 1, chapter: ctx.chapters[i] };
}

// ── Before you start ─────────────────────────────────────────────────────────

export function BeforeYouStart({ ids }: { ids?: string[] }) {
  const ctx = useContext(Ctx);
  if (!ctx || !ids?.length) return null;
  const items = ids.map((id) => lookup(ctx, id)).filter((x) => x !== null);
  if (!items.length) return null;

  return (
    <aside className="lb-plate lb-prereq mb-10">
      <p className="lb-plate-head">↺ {ctx.labels.beforeStart}</p>
      <p className="lb-prereq-text">{ctx.labels.buildsOn}</p>
      <ul className="lb-prereq-list">
        {items.map(({ n, chapter }) => {
          const read = ctx.visited.has(chapter.id);
          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => ctx.open(chapter.id)}
                className="lb-prereq-item group inline-flex items-baseline gap-2 px-3 py-1.5 text-left transition-colors"
              >
                <span className="font-mono text-[11px] text-[var(--primary)]">{n}</span>
                <span className="text-[14px] text-[var(--text-main)] group-hover:text-[var(--primary)]">{chapter.title}</span>
                {read && <span className="font-mono text-[11px] text-[var(--text-muted)]" title={ctx.labels.read}>✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ── Inline review chip ───────────────────────────────────────────────────────

/**
 * Marks a term that an earlier chapter teaches: `<Recall to="matrices">matrix
 * multiplication</Recall>`. A click opens a small card that links to it.
 */
export function Recall({ to, children }: { to: string; children: ReactNode }) {
  const ctx = useContext(Ctx);
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!shown) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setShown(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [shown]);

  const hit = ctx && lookup(ctx, to);
  if (!ctx || !hit) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-expanded={shown}
        className="inline text-inherit underline decoration-dotted decoration-[var(--primary)] underline-offset-4 hover:text-[var(--primary)]"
      >
        {children}<sup className="ml-0.5 font-mono text-[0.7em] text-[var(--primary)]">↺</sup>
      </button>
      {shown && (
        <span
          role="dialog"
          className="absolute left-0 top-full z-30 mt-2 block w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left shadow-lg"
        >
          <span className="block lettering text-[13px] text-[var(--primary)]">
            ↺ {ctx.labels.review} · {hit.n}
          </span>
          <span className="mt-1 block font-display text-[17px] leading-snug text-[var(--text-main)]">{hit.chapter.title}</span>
          <button
            type="button"
            onClick={() => { setShown(false); ctx.open(to); }}
            className="mt-2 font-mono text-[12px] text-[var(--primary)] hover:underline"
          >
            {ctx.labels.open} →
          </button>
        </span>
      )}
    </span>
  );
}

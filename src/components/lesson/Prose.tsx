// src/components/lesson/Prose.tsx
"use client";

// Page-level building blocks shared by every track's chapters: the article
// wrapper, the lead paragraph, the "By the end you can" goals under it and the
// "Key ideas" summary box at the end.

import type { ReactNode } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Callout } from "./LessonComponents";
import { Deeper } from "./Deeper";
import { useLessonLook } from "./look";
import { markCode, markCodeInProse } from "./proseCode";

/**
 * What the reader will be able to do after the chapter, placed right after the
 * Lead. Each item is a task they can check themselves on ("Find a side from an
 * angle and the hypotenuse"), not a topic name. Keys: `${id}_goal${i}`.
 */
export function Goals({ t, id, items }: { t: TrackTranslations; id: string; items: string[] }) {
  const { clean } = useLessonLook();
  return (
    <div className="lb-plate lb-goals my-6">
      <p className="lb-plate-head">{tx(t, "goals", "By the end you can")}</p>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            <span aria-hidden className="lb-box" />
            <span>{clean ? markCode(tx(t, `${id}_goal${i}`, it)) : tx(t, `${id}_goal${i}`, it)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KeyIdeas({ t, id, items }: { t: TrackTranslations; id: string; items: string[] }) {
  const { clean } = useLessonLook();
  return (
    <div className="lb-plate lb-keys my-8">
      <p className="lb-plate-head">{tx(t, "keyIdeas", "Key ideas")}</p>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            <span aria-hidden className="lb-num">{String(i + 1).padStart(2, "0")}</span>
            <span>{clean ? markCode(tx(t, `${id}_key${i}`, it)) : tx(t, `${id}_key${i}`, it)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
export const Lead = ({ children }: { children: ReactNode }) => <p className="lb-lead text-lg text-[var(--text-main)]">{children}</p>;

/** Text inside these is prose too, so code names in it get marked (clean look). */
const PROSE_COMPONENTS: ReadonlySet<unknown> = new Set([Lead, Callout, Deeper]);

export function Article({ children }: { children: ReactNode }) {
  const look = useLessonLook();
  return (
    <article className="space-y-5 text-[var(--text-muted)] leading-relaxed text-base">
      {look.clean ? markCodeInProse(children, PROSE_COMPONENTS) : children}
    </article>
  );
}

"use client";

// ── Related lessons ─────────────────────────────────────────────────────────
// A plate of links to lessons in other chapters or tracks that go deeper into
// something this chapter only touches, each with one line on why. Real links
// in the page's language, so readers and search engines can follow them.
// Same look as the Key ideas plate (lessonBody.css .lb-plate / .lb-keys).

import Link from "next/link";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { chapterHref } from "@/lib/tracks/urls";
import { useUrlLang } from "@/lib/i18n/useUrlLang";

export type RelatedLink = { track: string; id: string; title: string; why: string };

export function Related({ t, links }: { t: TrackTranslations; links: RelatedLink[] }) {
  const lang = useUrlLang();
  return (
    <nav className="lb-plate lb-keys my-8" aria-label={tx(t, "relatedLessons", "Related lessons")}>
      <p className="lb-plate-head">{tx(t, "relatedLessons", "Related lessons")}</p>
      <ol>
        {links.map((l, i) => (
          <li key={`${l.track}/${l.id}`}>
            <span aria-hidden className="lb-num">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <Link href={chapterHref(l.track, l.id, lang)} className="text-[var(--primary)] font-semibold hover:underline">{l.title}</Link>
              {" — "}{l.why}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

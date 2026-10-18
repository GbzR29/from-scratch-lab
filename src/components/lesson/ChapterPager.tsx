"use client";

// ── Previous / next chapter ──────────────────────────────────────────────────

import Link from "next/link";
import type { Chapter } from "@/lib/tracks/types";
import { homeHref } from "@/lib/tracks/urls";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { ChapterLink } from "./ChapterLink";

interface PagerLabels {
  prev: string;
  next: string;
  done: string;
  backToTracks: string;
}

const BOX = "lb-pager-box grid gap-1 px-4 py-3.5 min-w-0 transition-colors";

export function ChapterPager({ prev, next, onSelect, chapterHref, labels }: {
  prev?: Chapter;
  next?: Chapter;
  onSelect: (id: string) => void;
  chapterHref: (id: string) => string;
  labels: PagerLabels;
}) {
  const urlLang = useUrlLang();
  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-[var(--border)]">
      {prev ? (
        <ChapterLink href={chapterHref(prev.id)} onSelect={() => onSelect(prev.id)} className={`${BOX} text-left hover:border-[var(--primary)] group`}>
          <small className="font-mono text-[11.5px] text-[var(--text-muted)]">← {labels.prev}</small>
          <span className="font-display text-[19px] leading-snug truncate group-hover:text-[var(--primary)]">{prev.title}</span>
        </ChapterLink>
      ) : <div className="hidden sm:block" />}

      {next ? (
        <ChapterLink href={chapterHref(next.id)} onSelect={() => onSelect(next.id)} className={`${BOX} lb-pager-next text-left sm:text-right group`}>
          <small className="font-mono text-[11.5px]">{labels.next} →</small>
          <span className="font-display text-[19px] leading-snug truncate">{next.title}</span>
        </ChapterLink>
      ) : (
        <Link href={homeHref(urlLang)} className={`${BOX} text-left sm:text-right hover:border-[var(--primary)] group`}>
          <small className="font-mono text-[11.5px] text-[var(--primary)]">✓ {labels.done}</small>
          <span className="font-display text-[19px] leading-snug group-hover:text-[var(--primary)]">{labels.backToTracks} →</span>
        </Link>
      )}
    </nav>
  );
}

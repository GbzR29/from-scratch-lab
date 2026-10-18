// components/sidebar/LessonSidebar.tsx
"use client";

// The left rail of a lesson: the track (its glyph, name and how much of it was
// read), then every chapter grouped by section, each with a status dot —
// hollow = not read, filled = read, accent ring = open now. Sections fold.
// Styles: .lc-side in src/styles/lessonChrome.css.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Chapter, Track } from "@/lib/tracks/types";
import { ChapterLink } from "@/components/lesson/ChapterLink";
import { TrackGlyph } from "@/components/brand/TrackGlyph";

/** Only the keys this sidebar reads — keeps it decoupled from the full bundle. */
interface SidebarLabels {
  lessonReadOf?: string;
  lessonChapters?: string;
  refTitle?: string;
  refSidebarHint?: string;
}

interface LessonSidebarProps {
  track: Track;
  /** Shown as the rail's heading; defaults to the track's catalog title. */
  title?: string;
  chapters: Chapter[];
  activeId: string;
  visited: Set<string>;
  onSelect: (id: string) => void;
  /** The chapter's own URL, for the link's href. */
  chapterHref: (id: string) => string;
  t: SidebarLabels;
  /** When set, a link to the track's API reference is shown under the chapters. */
  referenceHref?: string;
}

/** A chapter plus its position in the flat list, so numbering stays global. */
type Entry = { chapter: Chapter; index: number };
/** `no` numbers the named sections 1, 2, 3… */
type Group = { title: string | null; no: number; entries: Entry[] };

/** Groups consecutive chapters that share a section. */
function groupChapters(chapters: Chapter[]): Group[] {
  const groups: Group[] = [];
  let named = 0;
  chapters.forEach((chapter, index) => {
    const title = chapter.section ?? null;
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.entries.push({ chapter, index });
    else groups.push({ title, no: title ? ++named : 0, entries: [{ chapter, index }] });
  });
  return groups;
}

export function LessonSidebar({
  track, title, chapters, activeId, visited, onSelect, chapterHref, t, referenceHref,
}: LessonSidebarProps) {
  const groups = useMemo(() => groupChapters(chapters), [chapters]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visitedCount = chapters.filter((c) => visited.has(c.id)).length;
  const visitedPct = chapters.length ? Math.round((visitedCount / chapters.length) * 100) : 0;
  const readOf = (t?.lessonReadOf ?? "{n} of {total} read")
    .replace("{n}", String(visitedCount))
    .replace("{total}", String(chapters.length));

  // Never let the active chapter hide inside a collapsed section.
  const activeSection = chapters.find((c) => c.id === activeId)?.section ?? null;
  useEffect(() => {
    if (!activeSection) return;
    setCollapsed((prev) => {
      if (!prev.has(activeSection)) return prev;
      const next = new Set(prev);
      next.delete(activeSection);
      return next;
    });
  }, [activeSection]);

  const toggle = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="lc-side">

      {/* ── Track: glyph, name, progress ──────────────────────────────── */}
      <div className="lc-track">
        <span className="lc-glyphbox"><TrackGlyph id={track.id} size={34} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="lc-track-name">{title ?? track.title}</span>
          <span className="lc-track-read">{readOf}</span>
          <span className="lc-track-bar" aria-hidden="true"><i style={{ width: `${visitedPct}%` }} /></span>
        </span>
      </div>

      {/* ── Chapters, grouped by section ──────────────────────────────── */}
      <nav aria-label={t?.lessonChapters ?? "Chapters"}>
        {groups.map((group, gi) => {
          const name = group.title;
          const isOpen = name === null || !collapsed.has(name);
          const doneInGroup = group.entries.filter((e) => visited.has(e.chapter.id)).length;

          return (
            <div key={name ?? `ungrouped-${gi}`} className="lc-sec">
              {name && (
                <button type="button" className="lc-sec-head" onClick={() => toggle(name)} aria-expanded={isOpen}>
                  <span>
                    <ChevronRight size={11} />
                    <b>{String(group.no).padStart(2, "0")}</b>
                    {name}
                  </span>
                  <span>{doneInGroup}/{group.entries.length}</span>
                </button>
              )}

              {isOpen && (
                <ol className="lc-list">
                  {group.entries.map(({ chapter, index }) => {
                    const isActive = chapter.id === activeId;
                    const isDone = visited.has(chapter.id);
                    return (
                      <li key={chapter.id}>
                        <ChapterLink
                          href={chapterHref(chapter.id)}
                          onSelect={() => onSelect(chapter.id)}
                          current={isActive}
                          className={`lc-ch${isDone && !isActive ? " done" : ""}`}
                        >
                          <span className="lc-dot" aria-hidden="true" />
                          <span>
                            <span className="sr-only">{index + 1}. </span>
                            {chapter.title}
                          </span>
                          {chapter.minRead && <small>{chapter.minRead}m</small>}
                        </ChapterLink>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── API reference link ────────────────────────────────────────── */}
      {referenceHref && (
        <Link href={referenceHref} className="lc-ref">
          <span>{t?.refTitle ?? "Function reference"} →</span>
          <span>{t?.refSidebarHint ?? "Every function used in the track, with parameters and examples"}</span>
        </Link>
      )}
    </div>
  );
}

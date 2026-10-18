"use client";

// ── Track map ───────────────────────────────────────────────────────────────
// Every section of a track as a row: its number, name and how much was read,
// then its chapters as cells (filled = read, accent = last opened, outlined =
// ready). When the catalog plans more lessons than exist, a dashed row says
// how many are still being written. Styles: .tp-map in trackPage.css.

import Link from "next/link";
import type { Chapter } from "@/lib/tracks/types";

type Strings = Record<string, string | undefined>;

const fill = (s: string, values: Record<string, number | string>) =>
  s.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

export interface MapSection {
  name: string | null;
  entries: { chapter: Chapter; index: number }[];
}

/** Consecutive chapters that share a section, keeping their global numbers. */
export function mapSections(chapters: Chapter[]): MapSection[] {
  const out: MapSection[] = [];
  chapters.forEach((chapter, index) => {
    const name = chapter.section ?? null;
    const last = out[out.length - 1];
    if (last && last.name === name) last.entries.push({ chapter, index });
    else out.push({ name, entries: [{ chapter, index }] });
  });
  return out;
}

export default function TrackMap({ sections, visited, lastId, planned, href, t }: {
  sections: MapSection[];
  visited: Set<string>;
  lastId: string | null;
  /** Lessons still being written (catalog plan minus what exists). */
  planned: number;
  href: (id: string) => string;
  t: Strings;
}) {
  return (
    <ol className="tp-map">
      {sections.map((s, si) => {
        const read = s.entries.filter((e) => visited.has(e.chapter.id)).length;
        return (
          <li key={si} className="tp-row">
            <div className="tp-row-label">
              <span>{String(si + 1).padStart(2, "0")} · {read}/{s.entries.length}</span>
              <b>{s.name ?? "—"}</b>
            </div>
            <div className="tp-cells">
              {s.entries.map(({ chapter, index }) => {
                const state = chapter.id === lastId ? "last" : visited.has(chapter.id) ? "read" : "ready";
                return (
                  <Link key={chapter.id} href={href(chapter.id)} className={`tp-cell ${state}`}>
                    <span className="tp-cell-no">{String(index + 1).padStart(2, "0")}</span>
                    <span className="tp-cell-title">{chapter.title}</span>
                    {chapter.minRead && <span className="tp-cell-min">{chapter.minRead}m</span>}
                  </Link>
                );
              })}
            </div>
          </li>
        );
      })}
      {planned > 0 && (
        <li className="tp-row planned">
          <div className="tp-row-label">
            <span>{String(sections.length + 1).padStart(2, "0")} · …</span>
            <b>{t.tvKeyPlanned ?? "in preparation"}</b>
          </div>
          <div className="tp-planned">
            <b>{fill(t.tvMore ?? "{n} more lessons in preparation", { n: planned })}</b>
            <span>{t.tvMoreBody ?? "New sections arrive here as they are written."}</span>
          </div>
        </li>
      )}
    </ol>
  );
}

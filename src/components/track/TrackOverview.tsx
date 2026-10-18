"use client";

// ── Track page (/<track>, /pt/<track>) ──────────────────────────────────────
// The track as a sheet: its code, glyph, name and description, a button to
// continue (or start), the reader's progress, the tracks it builds on (taken
// from the learning paths), a few facts, and the map of every section and
// chapter. Progress comes from localStorage after mount.
// Styles: src/styles/trackPage.css.

import "@/styles/trackPage.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LearnTopBar } from "@/components/lesson/LearnTopBar";
import { TrackGlyph } from "@/components/brand/TrackGlyph";
import TrackMap, { mapSections } from "@/components/track/TrackMap";
import { getTrack } from "@/lib/tracks";
import { TRACK_CATALOG, trackCode } from "@/lib/tracks/catalog";
import { LEARNING_PATHS } from "@/lib/tracks/paths";
import { trackName } from "@/lib/tracks/crumbs";
import { readLastLesson, readVisited } from "@/lib/tracks/progress";
import { getReference, referenceHref } from "@/lib/reference";
import { chapterHref, homeHref, trackHref } from "@/lib/tracks/urls";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { useLessonText } from "@/lib/i18n/lessons";

type Strings = Record<string, string | undefined>;

const fill = (s: string, values: Record<string, number | string>) =>
  s.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

/** Tracks that come right before this one in any learning path. */
function prerequisites(id: string) {
  const ids = new Set<string>();
  for (const path of LEARNING_PATHS) {
    const i = path.tracks.indexOf(id);
    if (i > 0) ids.add(path.tracks[i - 1]);
  }
  return TRACK_CATALOG.filter((info) => ids.has(info.id) && getTrack(info.path));
}

export default function TrackOverview({ trackPath }: { trackPath: string }) {
  const { t, language } = useLanguage();
  const ui = t as unknown as Strings;
  const lang = useUrlLang();
  const track = getTrack(trackPath);
  const info = TRACK_CATALOG.find((x) => x.path === trackPath);

  // Chapter titles and section names in the reading language
  const lessonText = useLessonText(track?.id, language);
  const chapters = useMemo(
    () => (track?.chapters ?? []).map((c) => ({
      ...c,
      title: lessonText?.titles[c.id] ?? c.title,
      section: c.section && (lessonText?.sections[c.section] ?? c.section),
    })),
    [track, lessonText],
  );

  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [lastId, setLastId] = useState<string | null>(null);
  useEffect(() => {
    if (!track) return;
    setVisited(readVisited(track.id));
    const last = readLastLesson();
    setLastId(last && last.track === trackPath && track.chapters.some((c) => c.id === last.chapter) ? last.chapter : null);
  }, [track, trackPath]);

  if (!track || !info) return null;

  const name = trackName(ui, trackPath);
  const sections = mapSections(chapters);
  const lessons = chapters.length;
  const total = Math.max(info.plannedLessons, lessons);
  const read = chapters.filter((c) => visited.has(c.id)).length;
  const minutes = chapters.reduce((n, c) => n + (c.minRead ?? 0), 0);
  const hours = Math.max(1, Math.round(minutes / 30) / 2);
  const reference = getReference(trackPath);
  const before = prerequisites(info.id);

  // Continue where the reader stopped, else the first unread chapter, else start
  const resume = lastId ?? (read > 0 ? chapters.find((c) => !visited.has(c.id))?.id ?? null : null);
  const resumeIndex = resume ? chapters.findIndex((c) => c.id === resume) : 0;
  const target = chapters[resumeIndex] ?? chapters[0];
  const sheet = ui.tvSheet ?? "Sheet";
  const num = (n: number) => n.toLocaleString(language === "pt" ? "pt-BR" : "en");

  return (
    <div className="learn tp">
      <LearnTopBar crumbs={[{ label: ui.learnCrumb ?? "tracks", href: homeHref(lang) }, { label: name }]} />

      <main className="tp-in">
        <div className="tp-top">
          {/* ── Title sheet ── */}
          <section className="tp-sheet">
            <div className="tp-strip">
              <span>{trackCode(info)} · {ui[`area_${info.area}`] ?? info.area}</span>
              <span>{ui[info.levelKey] ?? info.levelFallback}</span>
            </div>
            <div className="tp-title">
              <span className="tp-glyph"><TrackGlyph id={info.id} size={96} /></span>
              <div>
                <h1>{name}</h1>
                <p>{ui[info.descKey] ?? info.descFallback}</p>
              </div>
            </div>
            <div className="tp-actions">
              <Link className="tp-go" href={chapterHref(trackPath, target.id, lang)}>
                <small>{resume ? fill(ui.tvContinue ?? "Continue · chapter {n}", { n: resumeIndex + 1 }) : ui.tvStart ?? "Start · chapter 1"}</small>
                <span>{target.title} →</span>
              </Link>
              {resume && <Link className="tp-restart" href={chapterHref(trackPath, chapters[0].id, lang)}>{ui.tvFromStart ?? "Start from the beginning"}</Link>}
              <div className="tp-progress">
                <div><span>{fill(ui.tvReadOf ?? "{n} of {total} read", { n: read, total: lessons })}</span>{total > lessons && <span>{fill(ui.tvPlanned ?? "{n} planned", { n: total })}</span>}</div>
                <div className="tp-bar" aria-hidden="true">
                  <i className="read" style={{ width: `${(read / total) * 100}%` }} />
                  <i className="ready" style={{ width: `${((lessons - read) / total) * 100}%` }} />
                </div>
                {total > lessons && <small>{ui.tvLegend ?? "orange: read · grey: ready · empty: in preparation"}</small>}
              </div>
            </div>
          </section>

          {/* ── Before you start + facts ── */}
          <aside className="tp-side">
            {before.length > 0 && (
              <section className="tp-box">
                <h2>{ui.tvBefore ?? "Before you start"}</h2>
                <p>{ui.tvBeforeBody ?? "This track builds on:"}</p>
                <ul>
                  {before.map((b) => (
                    <li key={b.id}>
                      <Link href={trackHref(b.path, lang)}><TrackGlyph id={b.id} size={26} />{trackName(ui, b.path)} →</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="tp-box">
              <h2>{ui.tvFacts ?? "This track"}</h2>
              <ul className="tp-facts">
                <li>{fill(ui.tvLessonsSections ?? "{n} lessons in {s} sections", { n: num(lessons), s: num(sections.length) })}</li>
                <li>{fill(ui.tvReading ?? "about {h} h of reading", { h: num(hours) })}</li>
                {reference && <li><Link href={referenceHref(reference)}>{ui.tvReference ?? "Function reference"} →</Link></li>}
              </ul>
            </section>
          </aside>
        </div>

        {/* ── Map ── */}
        <section className="tp-mapsec">
          <div className="tp-maphead">
            <div>
              <div className="tp-kicker">{sheet} 02 · {ui.tvMap ?? "track map"}</div>
              <h2>{fill(ui.tvMapTitle ?? "{s} sections, {n} lessons", { s: num(sections.length), n: num(lessons) })}</h2>
            </div>
            <ul className="tp-keys">
              <li><i className="read" />{ui.tvKeyRead ?? "read"}</li>
              <li><i className="last" />{ui.tvKeyLast ?? "last opened"}</li>
              <li><i className="ready" />{ui.tvKeyReady ?? "ready"}</li>
              {total > lessons && <li><i className="planned" />{ui.tvKeyPlanned ?? "in preparation"}</li>}
            </ul>
          </div>
          <TrackMap
            sections={sections}
            visited={visited}
            lastId={lastId}
            planned={total - lessons}
            href={(id) => chapterHref(trackPath, id, lang)}
            t={ui}
          />
        </section>
      </main>
    </div>
  );
}

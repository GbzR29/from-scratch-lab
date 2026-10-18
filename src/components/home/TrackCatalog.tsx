"use client";

// ── Track catalog ───────────────────────────────────────────────────────────
// Every track as a "plate" (a sheet of the drawing set), grouped by area, with
// filters for area and level. Progress comes from the parent (localStorage).
// Styles: .hm-plate in home.css.

import Link from "next/link";
import { useState } from "react";
import { getTrack } from "@/lib/tracks";
import { TRACK_AREAS, TRACK_CATALOG, trackCode, type TrackArea, type TrackInfo } from "@/lib/tracks/catalog";
import { getReference, referenceHref } from "@/lib/reference";
import { trackName } from "@/lib/tracks/crumbs";
import { trackHref, type UrlLang } from "@/lib/tracks/urls";
import { TrackGlyph } from "@/components/brand/TrackGlyph";

type Strings = Record<string, string | undefined>;
type Level = "all" | "beginner" | "intermediate" | "advanced";

const fill = (s: string, values: Record<string, number | string>) =>
  s.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

/** A "beginner → advanced" track shows under every level. */
function matchesLevel(info: TrackInfo, level: Level) {
  if (level === "all" || info.levelKey === "begAdv") return true;
  return info.levelKey === level;
}

// ── One plate ────────────────────────────────────────────────────────────────

function Plate({ info, code, t, visited, lang }: { info: TrackInfo; code: string; t: Strings; visited: number; lang: UrlLang }) {
  const track = getTrack(info.path);
  const level = t[info.levelKey] ?? info.levelFallback;
  const desc = t[info.descKey] ?? info.descFallback;
  const name = trackName(t, info.path);

  if (!track) {
    return (
      <article className="hm-plate soon">
        <div className="hm-plate-top"><span>{code}</span><span>{t.learnSoon ?? "coming soon"}</span></div>
        <div className="hm-plate-id">
          <span className="hm-glyphbox"><TrackGlyph id={info.id} size={46} /></span>
          <div>
            <h4>{name}</h4>
            <div className="hm-plate-count">{fill(t.learnPlannedN ?? "{n} lessons planned", { n: info.plannedLessons })}</div>
          </div>
        </div>
        <p>{desc}</p>
        <div className="hm-plate-foot"><span>{t.learnInPrep ?? "in preparation"}</span></div>
      </article>
    );
  }

  const lessons = track.chapters.length;
  const reference = getReference(info.path);
  const pct = Math.round((visited / lessons) * 100);

  return (
    <article className="hm-plate">
      <div className="hm-plate-top"><span>{code}</span><span>{level}</span></div>
      <div className="hm-plate-id">
        <span className="hm-glyphbox"><TrackGlyph id={info.id} size={46} /></span>
        <div>
          <h4><Link className="hm-plate-main" href={trackHref(info.path, lang)}>{name}</Link></h4>
          <div className="hm-plate-count">{fill(t.learnLessonsN ?? "{n} lessons", { n: lessons })}</div>
        </div>
      </div>
      <p>{desc}</p>
      {visited > 0 && <div className="hm-prog" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>}
      <div className="hm-plate-foot">
        {visited > 0 ? t.learnContinue ?? "Continue →" : t.learnStart ?? "Start →"}
        {visited > 0 ? (
          <span>{fill(t.homeOfN ?? "{n} of {total}", { n: visited, total: lessons })}</span>
        ) : reference ? (
          <Link className="hm-ref" href={referenceHref(reference)}>{t.learnReference ?? "reference"}</Link>
        ) : null}
      </div>
    </article>
  );
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export default function TrackCatalog({ t, visited, lang }: { t: Strings; visited: Record<string, number>; lang: UrlLang }) {
  const [area, setArea] = useState<TrackArea | "all">("all");
  const [level, setLevel] = useState<Level>("all");
  const levels: [Level, string][] = [
    ["all", t.homeLevelAll ?? "all"],
    ["beginner", t.homeLevelBeginner ?? "to start"],
    ["intermediate", t.homeLevelIntermediate ?? "intermediate"],
    ["advanced", t.homeLevelAdvanced ?? "advanced"],
  ];

  const groups = TRACK_AREAS.map((a, i) => ({
    area: a,
    index: i,
    // codes are fixed by catalog order, so they do not change while filtering
    tracks: TRACK_CATALOG.filter((info) => info.area === a && matchesLevel(info, level))
      .map((info) => ({ info, code: trackCode(info) })),
  })).filter((g) => (area === "all" || g.area === area) && g.tracks.length > 0);

  return (
    <>
      <div className="hm-filters">
        <div className="hm-chips" role="group" aria-label={t.learnTracks ?? "Tracks"}>
          <button type="button" aria-pressed={area === "all"} onClick={() => setArea("all")}>{t.homeAreaAll ?? "All"}</button>
          {TRACK_AREAS.map((a) => (
            <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(a)}>{t[`area_${a}`] ?? a}</button>
          ))}
        </div>
        <div className="hm-levels" role="group" aria-label={t.homeLevel ?? "level"}>
          <span>{t.homeLevel ?? "level"}:</span>
          {levels.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={level === id} onClick={() => setLevel(id)}>{label}</button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="hm-none">{t.homeNoMatch ?? "No track matches these filters."}</p>}
      {groups.map((g) => (
        <div key={g.area} className="hm-group">
          <div className="hm-group-head">
            <span>02.{g.index + 1}</span>
            <h3>{t[`area_${g.area}`] ?? g.area}</h3>
            <p>{t[`areaBlurb_${g.area}`]}</p>
          </div>
          <div className="hm-plates">
            {g.tracks.map(({ info, code }) => (
              <Plate key={info.id} info={info} code={code} t={t} visited={visited[info.id] ?? 0} lang={lang} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

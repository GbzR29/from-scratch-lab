"use client";

// ── Learning paths ──────────────────────────────────────────────────────────
// "Where to start": tracks joined in the order in which one prepares the next
// (data in src/lib/tracks/paths.ts). Styles: .hm-paths in home.css.

import Link from "next/link";
import { getTrack } from "@/lib/tracks";
import { TRACK_CATALOG } from "@/lib/tracks/catalog";
import { LEARNING_PATHS } from "@/lib/tracks/paths";
import { trackName } from "@/lib/tracks/crumbs";
import { trackHref, type UrlLang } from "@/lib/tracks/urls";
import { TrackGlyph } from "@/components/brand/TrackGlyph";

type Strings = Record<string, string | undefined>;

const fill = (s: string, values: Record<string, number | string>) =>
  s.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

const byId = new Map(TRACK_CATALOG.map((info) => [info.id, info]));

export default function PathsSection({ t, lang }: { t: Strings; lang: UrlLang }) {
  return (
    <div className="hm-paths">
      {LEARNING_PATHS.map((path) => {
        const steps = path.tracks.map((id) => byId.get(id)).filter((info) => info !== undefined);
        const lessons = steps.reduce((n, info) => n + (getTrack(info.path)?.chapters.length ?? 0), 0);
        return (
          <div key={path.id} className="hm-path">
            <div className="hm-path-head">
              <h3>{t[path.nameKey] ?? path.nameFallback}</h3>
              <span>{fill(t.learnLessonsN ?? "{n} lessons", { n: lessons })}</span>
            </div>
            <p>{t[path.goalKey] ?? path.goalFallback}</p>
            <ol className="hm-steps">
              {steps.map((info) => (
                <li key={info.id}>
                  <Link href={trackHref(info.path, lang)}>
                    <TrackGlyph id={info.id} size={22} />
                    {trackName(t, info.path)}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}

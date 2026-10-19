// src/components/home/TracksHome.tsx
"use client";

// The home page (/ and /pt), drawn as a set of sheets: the title sheet with a
// live figure, the track catalog, the suggested paths and how the lessons
// work. Reading progress and "continue" come from localStorage.

import "@/styles/home.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import HomeNav from "@/components/home/HomeNav";
import HomeFooter from "@/components/home/HomeFooter";
import HeroFigure from "@/components/home/hero/HeroFigure";
import TrackCatalog from "@/components/home/TrackCatalog";
import PathsSection from "@/components/home/PathsSection";
import { TrackGlyph } from "@/components/brand/TrackGlyph";
import { getTrack } from "@/lib/tracks";
import { TRACK_CATALOG } from "@/lib/tracks/catalog";
import { readLastLesson, readVisited, type LastLesson } from "@/lib/tracks/progress";
import { chapterHref } from "@/lib/tracks/urls";
import { useUrlLang } from "@/lib/i18n/useUrlLang";

type Strings = Record<string, string | undefined>;

const fill = (s: string, values: Record<string, number | string>) =>
  s.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

// ── Totals, from the track registry ─────────────────────────────────────────

const AVAILABLE = TRACK_CATALOG.filter((info) => getTrack(info.path));
const TOTAL_LESSONS = AVAILABLE.reduce((n, info) => n + (getTrack(info.path)?.chapters.length ?? 0), 0);

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TracksHome() {
  const { t } = useLanguage();
  const urlLang = useUrlLang();
  const ui = t as unknown as Strings;
  const sheet = ui.homeSheet ?? "Sheet";

  // Progress lives in localStorage, so it is read after mount (the server has none)
  const [visited, setVisited] = useState<Record<string, number>>({});
  const [last, setLast] = useState<LastLesson | null>(null);
  useEffect(() => {
    setVisited(Object.fromEntries(AVAILABLE.map((info) => [info.id, readVisited(info.id).size])));
    const l = readLastLesson();
    setLast(l && getTrack(l.track) ? l : null);
  }, []);
  const lastInfo = last ? TRACK_CATALOG.find((info) => info.path === last.track) : undefined;

  const title = ui.learnHeroTitle ?? "Learn from scratch";

  return (
    <div className="home">
      <HomeNav />

      <main>
        {/* ── Sheet 01: title ── */}
        <section className="hm-hero hm-in">
          <div className="hm-hero-text">
            <div className="hm-sheet hm-label">
              <b>{sheet} 01</b>
              <span>{fill(ui.homeFacts ?? "{lessons} lessons · {tracks} tracks · free · no sign-up", { lessons: TOTAL_LESSONS, tracks: AVAILABLE.length })}</span>
            </div>
            <h1>{title}<i>.</i></h1>
            <p className="hm-tagline">{ui.homeTagline}</p>
            <p className="hm-lead">{ui.learnLead}</p>
            <div className="hm-actions">
              <a className="hm-btn" href="#tracks">{ui.homeChoose ?? "Choose a track"} →</a>
              {last && lastInfo && (
                <Link className="hm-resume" href={chapterHref(last.track, last.chapter, urlLang)}>
                  <TrackGlyph id={lastInfo.id} size={30} />
                  <span>
                    <small>{ui.homeContinue ?? "Continue"}{last.number ? ` · ${last.number}` : ""}</small>
                    <span>{last.title ?? lastInfo.title}</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
          <HeroFigure />
        </section>

        {/* ── Sheet 02: catalog ── */}
        <section id="tracks" className="hm-sec alt">
          <div className="hm-in">
            <div className="hm-sec-head">
              <div>
                <div className="hm-kicker hm-label">{sheet} 02 · {ui.homeCatalog ?? "catalog"}</div>
                <h2>{ui.learnTracks ?? "Tracks"}</h2>
              </div>
            </div>
            <TrackCatalog t={ui} visited={visited} lang={urlLang} />
          </div>
        </section>

        {/* ── Sheet 03: paths ── */}
        <section id="paths" className="hm-sec">
          <div className="hm-in">
            <div className="hm-kicker hm-label">{sheet} 03 · {ui.homeAssembly ?? "assembly"}</div>
            <h2>{ui.homePathsTitle ?? "Where to start"}</h2>
            <p className="hm-sec-lead">{ui.homePathsLead}</p>
            <PathsSection t={ui} lang={urlLang} />
          </div>
        </section>

        {/* ── Sheet 04: how the lessons work ── */}
        <section className="hm-sec hm-band">
          <div className="hm-in">
            <div className="hm-kicker hm-label">{sheet} 04 · {ui.homeSpec ?? "specification"}</div>
            <h2>{ui.learnHowTitle ?? "How the lessons work"}</h2>
            <div className="hm-spec">
              {[
                [ui.learnHow1Title, ui.learnHow1Body],
                [ui.learnHow2Title, ui.learnHow2Body],
                [ui.homeHow4Title, ui.homeHow4Body],
                [ui.learnHow3Title, ui.learnHow3Body],
              ].map(([h, p], i) => (
                <div key={i}>
                  <span>4.{i + 1}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

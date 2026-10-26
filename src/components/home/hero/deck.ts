// ── Figure deck ─────────────────────────────────────────────────────────────
// Every home-page figure and the lesson that teaches its idea. The hero shows
// one of them (HeroFigure); the gallery shows six of the others with a link to
// their lesson (FigureGallery). A figure without a lesson (the Bézier curve has
// none yet) appears only in the hero. To add one: write it on HeroFrame
// (./frame.tsx) and list it here.

import type { ComponentType } from "react";
import type { HeroProps } from "./frame";
import Pendulum from "./Pendulum";
import SineWave from "./SineWave";
import Projectile from "./Projectile";
import Refraction from "./Refraction";
import Bezier from "./Bezier";
import GradientDescent from "./GradientDescent";
import Raster from "./Raster";
import Pitch from "./Pitch";
import Bond from "./Bond";
import Search from "./Search";
import { getTrack } from "@/lib/tracks";
import { TRACK_CATALOG } from "@/lib/tracks/catalog";
import { chapterHref, type UrlLang } from "@/lib/tracks/urls";
import physicsPt from "@/lib/tracks/physics/i18n/pt/_track";
import mathPt from "@/lib/tracks/math/i18n/pt/_track";
import aiPt from "@/lib/tracks/ai/i18n/pt/_track";
import openglPt from "@/lib/tracks/opengl/i18n/pt/_track";
import musicPt from "@/lib/tracks/music/i18n/pt/_track";
import chemistryPt from "@/lib/tracks/chemistry/i18n/pt/_track";
import algorithmsPt from "@/lib/tracks/algorithms/i18n/pt/_track";

export interface DeckFigure {
  Figure: ComponentType<HeroProps>;
  /** Track route segment and chapter id of the lesson that teaches it. */
  lesson?: { track: string; chapter: string };
}

/** In gallery order: one track after another, so six cards show six subjects. */
export const DECK: DeckFigure[] = [
  { Figure: Raster, lesson: { track: "OpenGL", chapter: "pipeline" } },
  { Figure: Pendulum, lesson: { track: "Physics", chapter: "simple-harmonic" } },
  { Figure: Pitch, lesson: { track: "Music", chapter: "pitch" } },
  { Figure: GradientDescent, lesson: { track: "AI", chapter: "gradient-descent" } },
  { Figure: Bond, lesson: { track: "Chemistry", chapter: "covalent-lewis" } },
  { Figure: Search, lesson: { track: "Algorithms", chapter: "searching" } },
  { Figure: SineWave, lesson: { track: "Math", chapter: "waves" } },
  { Figure: Projectile, lesson: { track: "Physics", chapter: "kinematics-2d" } },
  { Figure: Refraction, lesson: { track: "Physics", chapter: "geometric-optics" } },
  { Figure: Bezier },
];

const PT_TITLES: Record<string, { titles: Record<string, string> }> = {
  physics: physicsPt, math: mathPt, ai: aiPt, opengl: openglPt, music: musicPt, chemistry: chemistryPt, algorithms: algorithmsPt,
};

export interface DeckLesson {
  href: string;
  /** Track id, for its glyph and its name key (trackName_<id>). */
  trackId: string;
  trackTitle: string;
  title: string;
}

/** The lesson a figure links to, in the page's language; undefined if it has none or it moved. */
export function deckLesson(entry: DeckFigure, lang: UrlLang): DeckLesson | undefined {
  if (!entry.lesson) return undefined;
  const { track, chapter } = entry.lesson;
  const info = TRACK_CATALOG.find((i) => i.path === track);
  const found = getTrack(track)?.chapters.find((c) => c.id === chapter);
  if (!info || !found) return undefined;
  const title = (lang === "pt" && PT_TITLES[info.id]?.titles[chapter]) || found.title;
  return { href: chapterHref(track, chapter, lang), trackId: info.id, trackTitle: info.title, title };
}

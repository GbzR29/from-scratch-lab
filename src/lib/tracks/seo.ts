// src/lib/tracks/seo.ts
// What search engines and link previews see for the home page, a track or a lesson,
// in English or Portuguese: title, description, canonical URL, hreflang links,
// Open Graph and JSON-LD. Built on the server from the catalog, the chapter
// lists and the PT title files.

import type { Metadata } from "next";
import { TRACK_CATALOG, type TrackInfo } from "./catalog";
import { getTrack } from "./index";
import type { Chapter, LessonDescriptions, Track } from "./types";
import { SITE_URL, chapterHref, homeHref, languageAlternates, trackHref, type UrlLang } from "./urls";
import { SEO_COPY, seoWording } from "./seoText";
import { chapterDates } from "./dates";
import { learningTranslations } from "@/lib/i18n/learning/learningTranslantions";
import aiPt from "./ai/i18n/pt/_track";
import algorithmsPt from "./algorithms/i18n/pt/_track";
import asmPt from "./asm/i18n/pt/_track";
import chemistryPt from "./chemistry/i18n/pt/_track";
import cppPt from "./cpp/i18n/pt/_track";
import gamedevPt from "./gamedev/i18n/pt/_track";
import glslPt from "./glsl/i18n/pt/_track";
import mathPt from "./math/i18n/pt/_track";
import musicPt from "./music/i18n/pt/_track";
import openglPt from "./opengl/i18n/pt/_track";
import physicsPt from "./physics/i18n/pt/_track";
import sdl3Pt from "./sdl3/i18n/pt/_track";
import vulkanPt from "./vulkan/i18n/pt/_track";
import { aiDescriptions } from "./ai/descriptions";
import { algorithmsDescriptions } from "./algorithms/descriptions";
import { asmDescriptions } from "./asm/descriptions";
import { chemistryDescriptions } from "./chemistry/descriptions";
import { cppDescriptions } from "./cpp/descriptions";
import { gamedevDescriptions } from "./gamedev/descriptions";
import { glslDescriptions } from "./glsl/descriptions";
import { mathDescriptions } from "./math/descriptions";
import { musicDescriptions } from "./music/descriptions";
import { openglDescriptions } from "./opengl/descriptions";
import { physicsDescriptions } from "./physics/descriptions";
import { sdl3Descriptions } from "./sdl3/descriptions";
import { vulkanDescriptions } from "./vulkan/descriptions";

export const SITE_NAME = "From Scratch Lab";
const LOCALE: Record<UrlLang, string> = { en: "en_US", pt: "pt_BR" };
const IN_LANGUAGE: Record<UrlLang, string> = { en: "en", pt: "pt-BR" };

type TitleFile = { titles: Record<string, string>; sections: Record<string, string> };
const PT_TITLES: Record<string, TitleFile> = {
  ai: aiPt, algorithms: algorithmsPt, asm: asmPt, chemistry: chemistryPt, cpp: cppPt, gamedev: gamedevPt, glsl: glslPt,
  math: mathPt, music: musicPt, opengl: openglPt, physics: physicsPt, sdl3: sdl3Pt, vulkan: vulkanPt,
};

// Each lesson's own search-result text; a lesson without one gets SEO_COPY's generic line
const DESCRIPTIONS: Record<string, LessonDescriptions> = {
  ai: aiDescriptions, algorithms: algorithmsDescriptions, asm: asmDescriptions, chemistry: chemistryDescriptions, cpp: cppDescriptions,
  gamedev: gamedevDescriptions, glsl: glslDescriptions, math: mathDescriptions, music: musicDescriptions,
  opengl: openglDescriptions, physics: physicsDescriptions, sdl3: sdl3Descriptions, vulkan: vulkanDescriptions,
};

// ── Lookups ────────────────────────────────────────────────────────────────

export function trackInfo(trackPath: string): TrackInfo | undefined {
  return TRACK_CATALOG.find((info) => info.path === trackPath);
}

export function findChapter(track: Track, chapterId: string): { chapter: Chapter; index: number } | undefined {
  const index = track.chapters.findIndex((c) => c.id === chapterId);
  return index < 0 ? undefined : { chapter: track.chapters[index], index };
}

function strings(lang: UrlLang): Record<string, string | undefined> {
  return learningTranslations[lang] as Record<string, string | undefined>;
}

/** The track's name as the home page shows it ("OpenGL 4.6", "Matemática"…). */
export function trackName(info: TrackInfo, lang: UrlLang): string {
  return strings(lang)[`trackName_${info.id}`] ?? info.title;
}

/** The track's paragraph from its home page card. */
function trackDescription(info: TrackInfo, lang: UrlLang): string {
  return strings(lang)[info.descKey] ?? strings("en")[info.descKey] ?? info.descFallback ?? info.title;
}

export function chapterTitle(trackId: string, chapter: Chapter, lang: UrlLang): string {
  return (lang === "pt" && PT_TITLES[trackId]?.titles[chapter.id]) || chapter.title;
}

export function sectionName(trackId: string, section: string | undefined, lang: UrlLang): string | undefined {
  if (!section) return undefined;
  return (lang === "pt" && PT_TITLES[trackId]?.sections[section]) || section;
}

/** The lesson's own search-result line, if it has one. */
export function lessonDescription(trackId: string, chapterId: string, lang: UrlLang): string | undefined {
  return DESCRIPTIONS[trackId]?.[chapterId]?.[lang];
}

/** The track's card paragraph, for the site search. */
export function trackBlurb(info: TrackInfo, lang: UrlLang): string {
  return trackDescription(info, lang);
}

/** Shared head tags: canonical in this language + hreflang to both copies. */
function pageMeta(title: string, description: string, enPath: string, lang: UrlLang, type: "website" | "article"): Metadata {
  const url = lang === "pt" ? (enPath === "/" ? "/pt" : `/pt${enPath}`) : enPath;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(enPath) },
    openGraph: { title, description, url, siteName: SITE_NAME, type, locale: LOCALE[lang] },
  };
}

// ── Metadata ───────────────────────────────────────────────────────────────

/** The home page (the track list). */
export function homeMetadata(lang: UrlLang): Metadata {
  const copy = SEO_COPY[lang];
  return pageMeta(`${SITE_NAME} | ${copy.learnTitle}`, copy.learnDesc, homeHref(), lang, "website");
}

export function trackMetadata(trackPath: string, lang: UrlLang): Metadata {
  const track = getTrack(trackPath);
  const info = trackInfo(trackPath);
  if (!track || !info) return {};
  const title = `${seoWording(info.id, info.title, lang).title} ${SEO_COPY[lang].free}`;
  return pageMeta(title, trackDescription(info, lang), trackHref(trackPath), lang, "website");
}

export function chapterMetadata(trackPath: string, chapterId: string, lang: UrlLang): Metadata {
  const track = getTrack(trackPath);
  const info = trackInfo(trackPath);
  const found = track && findChapter(track, chapterId);
  if (!track || !info || !found) return {};
  const { chapter, index } = found;
  const name = chapterTitle(info.id, chapter, lang);
  const title = `${name} | ${seoWording(info.id, info.title, lang).short}`;
  const description = DESCRIPTIONS[info.id]?.[chapter.id]?.[lang] ?? SEO_COPY[lang].lesson(
    name, index + 1, track.chapters.length, trackName(info, lang), sectionName(info.id, chapter.section, lang),
  );
  return pageMeta(title, description, chapterHref(trackPath, chapterId), lang, "article");
}

// ── JSON-LD (structured data) ───────────────────────────────────────────────

const AUTHOR = { "@type": "Person", name: "Gabriel Carvalho", url: "https://www.gabrielfrc.dev" };
const PROVIDER = { "@type": "Organization", name: SITE_NAME, url: SITE_URL, founder: AUTHOR };

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem", position: i + 1, name: item.name, item: SITE_URL + item.path,
    })),
  };
}

/** A track page: the course, and Learn › Track breadcrumbs. */
export function trackJsonLd(trackPath: string, lang: UrlLang): object | null {
  const track = getTrack(trackPath);
  const info = trackInfo(trackPath);
  if (!track || !info) return null;
  const name = trackName(info, lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: seoWording(info.id, info.title, lang).title,
        description: trackDescription(info, lang),
        url: SITE_URL + trackHref(trackPath, lang),
        inLanguage: IN_LANGUAGE[lang],
        isAccessibleForFree: true,
        provider: PROVIDER,
        hasPart: track.chapters.map((c) => ({
          "@type": "LearningResource",
          name: chapterTitle(info.id, c, lang),
          url: SITE_URL + chapterHref(trackPath, c.id, lang),
        })),
      },
      breadcrumbs([
        { name: SITE_NAME, path: homeHref(lang) },
        { name, path: trackHref(trackPath, lang) },
      ]),
    ],
  };
}

/** A lesson page: the lesson as part of its course, and Learn › Track › Lesson breadcrumbs. */
export function chapterJsonLd(trackPath: string, chapterId: string, lang: UrlLang): object | null {
  const track = getTrack(trackPath);
  const info = trackInfo(trackPath);
  const found = track && findChapter(track, chapterId);
  if (!track || !info || !found) return null;
  const { chapter } = found;
  const name = chapterTitle(info.id, chapter, lang);
  const dates = chapterDates(info.id, chapter.id);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name,
        description: DESCRIPTIONS[info.id]?.[chapter.id]?.[lang],
        url: SITE_URL + chapterHref(trackPath, chapter.id, lang),
        inLanguage: IN_LANGUAGE[lang],
        isAccessibleForFree: true,
        learningResourceType: "lesson",
        timeRequired: chapter.minRead ? `PT${chapter.minRead}M` : undefined,
        datePublished: dates?.created,
        dateModified: dates?.updated,
        author: AUTHOR,
        publisher: PROVIDER,
        isPartOf: {
          "@type": "Course",
          name: seoWording(info.id, info.title, lang).title,
          url: SITE_URL + trackHref(trackPath, lang),
        },
      },
      breadcrumbs([
        { name: SITE_NAME, path: homeHref(lang) },
        { name: trackName(info, lang), path: trackHref(trackPath, lang) },
        { name, path: chapterHref(trackPath, chapter.id, lang) },
      ]),
    ],
  };
}

// src/lib/tracks/lessonRoutes.tsx
// The server side of the lesson routes, shared by the English tree
// (app/[trackPath]/…) and the Portuguese one (app/pt/[trackPath]/…).
// A lesson is drawn by LessonView in the (lesson) layout and the track page by
// TrackOverview in (overview); these check the URL and add metadata and
// structured data.

import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import TrackOverview from "@/components/track/TrackOverview";
import { getTrack } from "./index";
import { chapterJsonLd, chapterMetadata, findChapter, trackJsonLd, trackMetadata } from "./seo";
import { chapterHref, decodeSegment, type UrlLang } from "./urls";

export type TrackProps = {
  params: Promise<{ trackPath: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export type ChapterProps = { params: Promise<{ trackPath: string; chapterId: string }> };

/** The track named by the URL. Any other first segment (/<typo>) is a 404,
 *  since the track routes sit at the root. */
export async function requireTrack(params: Promise<{ trackPath: string }>) {
  const track = getTrack(decodeSegment((await params).trackPath));
  if (!track) notFound();
  return track;
}

// ── /<track> ────────────────────────────────────────────────────────────────

export async function trackPageMetadata({ params }: TrackProps, lang: UrlLang): Promise<Metadata> {
  return trackMetadata(decodeSegment((await params).trackPath), lang);
}

/** The track's own page: its map (TrackOverview). Old links, ?chapter=<id>, move to the lesson's URL. */
export async function TrackRoute({ params, searchParams }: TrackProps, lang: UrlLang) {
  const trackPath = decodeSegment((await params).trackPath);
  const track = await requireTrack(params);

  const { chapter, step } = await searchParams;
  if (typeof chapter === "string" && findChapter(track, chapter)) {
    const query = typeof step === "string" ? `?step=${encodeURIComponent(step)}` : "";
    permanentRedirect(chapterHref(trackPath, chapter, lang) + query);
  }
  return (
    <>
      <JsonLd data={trackJsonLd(trackPath, lang)} />
      <TrackOverview trackPath={trackPath} />
    </>
  );
}

// ── /<track>/<chapter id> ───────────────────────────────────────────────────

export async function chapterPageMetadata({ params }: ChapterProps, lang: UrlLang): Promise<Metadata> {
  const { trackPath, chapterId } = await params;
  return chapterMetadata(decodeSegment(trackPath), decodeSegment(chapterId), lang);
}

export async function ChapterRoute({ params }: ChapterProps, lang: UrlLang) {
  const trackPath = decodeSegment((await params).trackPath);
  const chapterId = decodeSegment((await params).chapterId);
  const track = await requireTrack(params);
  if (!findChapter(track, chapterId)) notFound();
  return <JsonLd data={chapterJsonLd(trackPath, chapterId, lang)} />;
}

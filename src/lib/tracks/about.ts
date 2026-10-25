// ── "About this track" texts ──────────────────────────────────────────────────
// Optional prose block for a track page: a title, a few paragraphs, what the
// reader builds and what they need. One file per track (<track>/about.ts),
// registered here by track id. EN + PT; other languages show English.

import { vulkanAbout } from "./vulkan/about";

export type AboutText = { title: string; paragraphs: string[]; build: string[]; need: string[] };
export type TrackAbout = { en: AboutText; pt: AboutText };

const ABOUT: Record<string, TrackAbout> = {
  vulkan: vulkanAbout,
};

export function trackAbout(trackId: string, lang: string): AboutText | undefined {
  const a = ABOUT[trackId];
  return a && (lang === "pt" ? a.pt : a.en);
}

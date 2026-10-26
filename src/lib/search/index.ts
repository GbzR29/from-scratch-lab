// src/lib/search/index.ts
// The site search index: every track, every lesson and every reference entry,
// with its title, where it sits and its one-line description, in English and
// Portuguese. Built on the server and served once as /search-index.json
// (src/app/search-index.json/route.ts); the search box (components/nav/
// SiteSearch.tsx) downloads it the first time it is opened.

import { TRACK_CATALOG } from "@/lib/tracks/catalog";
import { getTrack } from "@/lib/tracks";
import { chapterTitle, lessonDescription, sectionName, trackBlurb, trackName } from "@/lib/tracks/seo";
import { getReference, displayName } from "@/lib/reference";
import type { SearchDoc } from "./types";

/** Text in [English, Portuguese]; PT falls back to English. */
const both = (en: string, pt: string | undefined): [string, string] => [en, pt || en];

export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const info of TRACK_CATALOG) {
    const track = getTrack(info.path);
    if (!track) continue;
    const name = both(trackName(info, "en"), trackName(info, "pt"));

    docs.push({ k: "track", p: info.path, g: info.id, t: name, d: both(trackBlurb(info, "en"), trackBlurb(info, "pt")) });

    track.chapters.forEach((c, i) => {
      const sectionEn = sectionName(info.id, c.section, "en");
      const sectionPt = sectionName(info.id, c.section, "pt");
      docs.push({
        k: "lesson",
        p: info.path,
        g: info.id,
        id: c.id,
        n: i + 1,
        t: both(chapterTitle(info.id, c, "en"), chapterTitle(info.id, c, "pt")),
        s: both(sectionEn ? `${name[0]} · ${sectionEn}` : name[0], sectionPt ? `${name[1]} · ${sectionPt}` : name[1]),
        d: both(lessonDescription(info.id, c.id, "en") ?? "", lessonDescription(info.id, c.id, "pt")),
      });
    });

    const ref = getReference(info.path);
    if (!ref) continue;
    const category = new Map(ref.categories.map((cat) => [cat.id, cat]));
    for (const e of ref.entries) {
      const cat = category.get(e.category);
      docs.push({
        k: "ref",
        p: info.path,
        g: info.id,
        id: e.name,
        t: [displayName(e), displayName(e)],
        s: both(cat ? `${ref.title} · ${cat.title.en}` : ref.title, cat?.title.pt ? `${ref.title} · ${cat.title.pt}` : undefined),
        d: both(e.summary.en, e.summary.pt),
      });
    }
  }
  return docs;
}

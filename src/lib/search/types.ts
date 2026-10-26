// src/lib/search/types.ts
// One entry of the site search index (/search-index.json). Short keys keep the
// file small: it holds every lesson and reference entry in two languages.

export interface SearchDoc {
  /** What it is: a track page, a lesson or a function reference page. */
  k: "track" | "lesson" | "ref";
  /** Track route segment ("OpenGL"). */
  p: string;
  /** Track id, for its glyph ("opengl"). */
  g: string;
  /** Chapter id or reference function name (absent for a track). */
  id?: string;
  /** Lesson number in its track. */
  n?: number;
  /** Title [en, pt]. */
  t: [string, string];
  /** Where it sits: "Track · Section" [en, pt]. */
  s?: [string, string];
  /** One-line description [en, pt]. */
  d?: [string, string];
}

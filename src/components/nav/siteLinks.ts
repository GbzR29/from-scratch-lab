"use client";

// ── Site links ──────────────────────────────────────────────────────────────
// The main links and the language list, shared by HomeNav, LearnTopBar and
// the phone menu so they never drift apart.

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Language } from "@/lib/i18n";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { homeHref, trackHref } from "@/lib/tracks/urls";
import { LINKS } from "./links";

export const LANGUAGES: Language[] = ["en", "pt", "es", "zh"];

/** The site's name, shown in every bar and menu. */
export const BRAND = "From Scratch Lab";

export function useSiteLinks() {
  const { t } = useLanguage();
  const lang = useUrlLang();
  return [
    { href: homeHref(lang), label: t.navTracks },
    // Built here rather than with referenceHref, which would pull the whole reference into every page
    { href: `${trackHref("OpenGL")}/reference`, label: t.navReference },
    { href: LINKS.author, label: `${t.navAuthor} ↗` },
  ];
}

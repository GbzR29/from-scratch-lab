"use client";

// ── Figure gallery ──────────────────────────────────────────────────────────
// The home page's "figures you can move" sheet: six live figures from six
// different tracks (the deck in hero/deck.ts, minus the one shown in the hero),
// each with the lesson where its idea is taught. Every figure runs only while
// it is on screen (useHeroClock). Styles: .hm-gal … in src/styles/home.css.

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { TrackGlyph } from "@/components/brand/TrackGlyph";
import { DECK, deckLesson } from "@/components/home/hero/deck";
import { useFigureNum } from "@/components/home/hero/HeroFigure";
import type { Strings } from "@/components/home/hero/frame";
import type { UrlLang } from "@/lib/tracks/urls";

const SHOWN = 6;

export default function FigureGallery({ heroIndex, sheet, lang }: { heroIndex: number; sheet: number; lang: UrlLang }) {
  const { t } = useLanguage();
  const ui = t as unknown as Strings;
  const num = useFigureNum();

  const cards = DECK
    .map((entry, i) => ({ entry, i, lesson: deckLesson(entry, lang) }))
    .filter((c) => c.i !== heroIndex && c.lesson)
    .slice(0, SHOWN);

  return (
    <div className="hm-gal">
      {cards.map(({ entry: { Figure }, i, lesson }, n) => (
        <div key={i} className="hm-gal-card">
          <Figure ui={ui} num={num} figNo={`${sheet}.${n + 1}`} />
          <Link className="hm-gal-link" href={lesson!.href}>
            <TrackGlyph id={lesson!.trackId} size={30} />
            <span>
              <small>{ui.homeGalleryIn ?? "taught in"} · {ui[`trackName_${lesson!.trackId}`] ?? lesson!.trackTitle}</small>
              <span>{lesson!.title}</span>
            </span>
            <i aria-hidden="true">→</i>
          </Link>
        </div>
      ))}
    </div>
  );
}

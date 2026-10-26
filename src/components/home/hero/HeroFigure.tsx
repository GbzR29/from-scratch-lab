"use client";

// ── Hero figure picker ──────────────────────────────────────────────────────
// The live figure next to the home page title is drawn from the deck
// (./deck.ts): each visit shows a different one (never the one shown last
// time), and the "another" button in its head steps through the rest. The
// server renders the first figure; the pick happens right after hydration,
// while the card is still fading in (hm-rise), so the swap is not seen.
// useHeroDeck holds the pick in the page, because the gallery leaves that
// figure out.

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Strings } from "./frame";
import { DECK } from "./deck";

const STORE = "hm-hero-fig";

function remember(i: number) {
  try { localStorage.setItem(STORE, String(i)); } catch { /* storage may be blocked */ }
}

/** A random figure other than the one shown on the previous visit. */
function pickOnVisit() {
  let previous = -1;
  try { previous = Number(localStorage.getItem(STORE) ?? -1); } catch { /* storage may be blocked */ }
  let i = Math.floor(Math.random() * (DECK.length - 1));
  if (i >= previous && previous >= 0) i++;
  remember(i);
  return i;
}

/** The hero's figure index and the "another" step. */
export function useHeroDeck() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setIndex(pickOnVisit()));
    return () => cancelAnimationFrame(id);
  }, []);
  const next = () => setIndex(i => { const n = (i + 1) % DECK.length; remember(n); return n; });
  return { index, next };
}

/** Locale-aware number formatting for the figures. */
export function useFigureNum() {
  const { language } = useLanguage();
  return (v: number, d: number) =>
    v.toLocaleString(language === "pt" ? "pt-BR" : "en", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function HeroFigure({ index, onNext }: { index: number; onNext: () => void }) {
  const { t } = useLanguage();
  const num = useFigureNum();
  const { Figure } = DECK[index];
  return <Figure key={index} ui={t as unknown as Strings} num={num} onNext={onNext} />;
}

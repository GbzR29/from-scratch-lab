"use client";

// ── Hero figure picker ──────────────────────────────────────────────────────
// The live figure next to the home page title is drawn from a small deck:
// each visit shows a different one (never the one shown last time), and the
// "another" button in its head steps through the rest. The server renders the
// first figure; the pick happens right after hydration, while the card is
// still fading in (hm-rise), so the swap is not seen. To add a figure, write
// one component on HeroFrame (./frame.tsx) and list it in DECK.

import { useEffect, useState, type ComponentType } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { HeroProps, Strings } from "./frame";
import Pendulum from "./Pendulum";
import SineWave from "./SineWave";
import Projectile from "./Projectile";
import Refraction from "./Refraction";
import Bezier from "./Bezier";
import GradientDescent from "./GradientDescent";

const DECK: ComponentType<HeroProps>[] = [Pendulum, SineWave, Projectile, Refraction, Bezier, GradientDescent];
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

export default function HeroFigure() {
  const { t, language } = useLanguage();
  const ui = t as unknown as Strings;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIndex(pickOnVisit()));
    return () => cancelAnimationFrame(id);
  }, []);

  const num = (v: number, d: number) =>
    v.toLocaleString(language === "pt" ? "pt-BR" : "en", { minimumFractionDigits: d, maximumFractionDigits: d });
  const next = () => setIndex(i => { const n = (i + 1) % DECK.length; remember(n); return n; });
  const Figure = DECK[index];
  return <Figure key={index} ui={ui} num={num} onNext={next} />;
}

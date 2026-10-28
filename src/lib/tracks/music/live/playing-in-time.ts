// Live numbers for chapters/playing-in-time.tsx: the LiveFormula compute functions.
// Factories `(t) => (v) => …` when the TeX holds words to translate.

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";

const r = String.raw;

/** "1", "&", "2"… for eighth k of a 4/4 bar. */
export const countName = (t?: TrackTranslations) => (k: number) => (k % 2 === 0 ? String(k / 2 + 1) : tx(t, "figMus_sdAnd", "&"));
/** The same name, safe inside TeX ("&" is the column separator there). */
const texCount = (t?: TrackTranslations) => (k: number) =>
  (k % 2 === 0 ? "" : `${(k - 1) / 2 + 1}\\ `) + countName(t)(k).replace(/&/g, r`\&`);

// ── Where an eighth note falls in the bar ────────────────────────────────────

export const slotNumbers = (t?: TrackTranslations) => (v: Record<string, number>) => {
  const T = 60 / v.bpm, tau = T / 2, at = v.k * tau, beat = v.k % 2 === 0;
  const name = texCount(t)(v.k);
  const where = beat
    ? r`\green{\text{${tx(t, "musPlay_lvWith", "with click")} ${v.k / 2 + 1}}}`
    : r`\amber{\text{${tx(t, "musPlay_lvMid", "halfway between clicks")} ${(v.k - 1) / 2 + 1}\ ${tx(t, "musPlay_lvAnd", "and")}\ ${(v.k + 1) / 2 + 1}}}`;
  return {
    tex: r`\begin{gathered} T = \frac{60}{${v.bpm}} = ${Math.round(T * 1000)}\ \text{ms} \qquad \tau = \frac{T}{2} = ${Math.round(tau * 1000)}\ \text{ms} \\ t_{${v.k}} = ${v.k} \times ${Math.round(tau * 1000)} = ${Math.round(at * 1000)}\ \text{ms} \quad (\text{“${name}”}) \;\Rightarrow\; ${where} \end{gathered}`,
  };
};

// ── When to start a chord change ─────────────────────────────────────────────

export const changeNumbers = (t?: TrackTranslations) => (v: Record<string, number>) => {
  const tau = 60 / v.bpm / 2, k = Math.ceil(v.h / 1000 / tau - 1e-9), lift = 8 - k;
  const on = lift >= 0
    ? r`\text{${tx(t, "musPlay_lvLift", "lift on")} “${texCount(t)(lift)}”}`
    : r`\text{${tx(t, "musPlay_lvTooFast", "more than a bar: slow down")}}`;
  return {
    tex: r`\begin{gathered} \tau = \frac{60}{2 \times ${v.bpm}} = ${Math.round(tau * 1000)}\ \text{ms} \\ k = \left\lceil \frac{${v.h}}{${Math.round(tau * 1000)}} \right\rceil = \left\lceil ${(v.h / 1000 / tau).toFixed(2)} \right\rceil = \amber{${k}} \;\Rightarrow\; \green{${on}} \end{gathered}`,
  };
};

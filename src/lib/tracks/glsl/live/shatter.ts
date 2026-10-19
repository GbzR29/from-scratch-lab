// ── Live formulas of "Cracks & Shattering" ────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, fac, signed, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;

/** Griffith strength of soda-lime glass (E = 70 GPa, γ = 4 J/m²) with a flaw of half length a = 10^lg µm. */
export const griffithNumbers = (t: TrackTranslations) => ({ lg }: V) => {
  const a = 10 ** lg;                                              // µm
  const s = Math.sqrt((2 * 70e9 * 4) / (Math.PI * a * 1e-6)) / 1e6;   // MPa
  const what = a < 1 ? tx(t, "glslShatter_liveFibre", "fresh, untouched fibre")
    : a < 30 ? tx(t, "glslShatter_liveClean", "carefully handled glass")
    : a < 300 ? tx(t, "glslShatter_liveWindow", "an ordinary window")
    : tx(t, "glslShatter_liveScratched", "a deep scratch");
  return {
    tex: r`\begin{aligned}
      &\sigma_f = \sqrt{\frac{2 \cdot 70\times10^{9} \cdot 4}{\pi \cdot ${num(a, a < 1 ? 2 : 1)}\times10^{-6}}} = \amber{${num(s, 0)}\ \text{MPa}} \\[4pt]
      &\frac{\sigma_f}{\sigma_{ideal}} = \frac{${num(s, 0)}}{7000} = ${num((s / 7000) * 100, 1)}\%
    \end{aligned}`,
    meter: Math.min(1, s / 1500),
    meterLabel: what,
  };
};

/** When a shard dropped from height h with upward speed vy (m/s) reaches the floor, and in how many frames. */
export const flightNumbers = () => ({ h, vy }: V) => {
  const g = 9.81, tHit = (vy + Math.sqrt(vy * vy + 2 * g * h)) / g;
  return {
    tex: r`\begin{aligned}
      &y(t) = ${num(h, 2)} ${signed(vy, 2)}\,t - \tfrac{1}{2}\,9.81\,t^2 = 0 \\[4pt]
      &t_{floor} = \frac{${num(vy, 2)} + \sqrt{${fac(vy, 2)}^2 + 2 \cdot 9.81 \cdot ${num(h, 2)}}}{9.81} = \amber{${num(tHit, 3)}\ \text{s}} = ${num(tHit * 60, 0)}\ \text{frames}
    \end{aligned}`,
    meter: Math.min(1, tHit / 1.2),
    meterLabel: `${num(tHit * 1000, 0)} ms`,
  };
};

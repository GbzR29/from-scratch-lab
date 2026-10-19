// ── Live formulas of "Fire & Smoke" ───────────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;

/** Wien's peak and Stefan–Boltzmann's T⁴ for a body at temperature T (K). */
export const wienNumbers = (t: TrackTranslations) => ({ T }: V) => {
  const peak = 2897.8 / T;                                 // µm
  const ratio = (T / 1000) ** 4;
  const where = peak > 0.7 ? tx(t, "glslFire_liveIR", "infrared") : peak < 0.4 ? tx(t, "glslFire_liveUV", "ultraviolet") : tx(t, "glslFire_liveVis", "visible");
  return {
    tex: r`\begin{aligned}
      &\lambda_{max} = \frac{2898\ \mu\text{m·K}}{${num(T, 0)}\ \text{K}} = \amber{${num(peak, 3)}\ \mu\text{m}} \quad (\text{${where}}) \\[4pt]
      &\frac{P(${num(T, 0)}\ \text{K})}{P(1000\ \text{K})} = \left(\frac{${num(T, 0)}}{1000}\right)^4 = ${num(ratio, ratio < 10 ? 2 : 0)}
    \end{aligned}`,
    meter: Math.min(1, Math.max(0, (0.75 - peak) / 0.45 + 0.5)),
    meterLabel: `${num(peak * 1000, 0)} nm`,
  };
};

/** Puffing frequency of a pool fire of diameter D (m): f ≈ 1.5 / √D. */
export const puffNumbers = () => ({ D }: V) => {
  const f = 1.5 / Math.sqrt(D);
  return {
    tex: r`f \approx \frac{1.5}{\sqrt{${num(D, 2)}}} = \amber{${num(f, 2)}\ \text{Hz}} \qquad \text{period } ${num(1 / f, 2)}\ \text{s}`,
    meter: Math.min(1, f / 5),
    meterLabel: `${num(f, 2)} Hz`,
  };
};

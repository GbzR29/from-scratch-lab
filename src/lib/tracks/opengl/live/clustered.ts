// ── Live formulas of "Forward+ & Clustered Shading" ───────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { big, num, r } from "./fmt";

type V = Record<string, number>;

/** Light loop iterations per frame at 1080p: every light vs only the lights that reach each pixel. */
export const lightCostNumbers = (t: TrackTranslations) => ({ L, cov, od }: V) => {
  const P = 1920 * 1080 * od, lbar = L * (cov / 100), naive = P * L, culled = P * lbar;
  return {
    tex: r`\begin{aligned} &P = 1920 \cdot 1080 \cdot ${num(od, 1)} = ${big(P)} \qquad \bar\ell = ${num(L, 0)} \cdot ${num(cov / 100, 3)} = ${num(lbar, 1)} \\[4pt] &P \cdot L = ${num(naive / 1e9, 2)} \cdot 10^9 \qquad P \cdot \bar\ell = ${num(culled / 1e6, 1)} \cdot 10^6 \qquad \amber{${num(L / Math.max(lbar, 1e-9), 0)}\times\\text{${tx(t, "oglClus_liveLess", "less")}}} \end{aligned}`,
  };
};

/** Exponential depth slices: the slice of a depth z and the bounds of that slice. */
export const sliceNumbers = ({ z, S }: V) => {
  const n = 0.1, f = 1000, k = Math.min(S - 1, Math.max(0, Math.floor((Math.log(z / n) / Math.log(f / n)) * S)));
  const a = n * (f / n) ** (k / S), b = n * (f / n) ** ((k + 1) / S);
  return {
    tex: r`\begin{aligned} &\text{slice} = \Big\lfloor \frac{\ln(${num(z, 1)} / 0.1)}{\ln(1000 / 0.1)}\,${num(S, 0)} \Big\rfloor = \lfloor ${num((Math.log(z / n) / Math.log(f / n)) * S, 2)} \rfloor = \amber{${k}} \\[4pt] &z_{${k}} = ${num(a, 2)} \qquad z_{${k + 1}} = ${num(b, 2)} \qquad \frac{z_{${k + 1}} - z_{${k}}}{z_{${k}}} = ${num((b - a) / a, 3)} \end{aligned}`,
  };
};

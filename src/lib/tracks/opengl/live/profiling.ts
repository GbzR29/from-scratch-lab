// ── Live formulas of "Measuring Performance" ──────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r, signed } from "./fmt";

type V = Record<string, number>;

/** A frame-rate change turned into the milliseconds it really costs. */
export const fpsNumbers = (t: TrackTranslations) => ({ a, b }: V) => {
  const ta = 1000 / a, tb = 1000 / b, d = tb - ta, share = Math.abs(d) / (1000 / 60);
  return {
    tex: r`\begin{aligned} &T_{old} = \frac{1000}{${num(a, 0)}} = ${num(ta, 2)}\ \text{ms} \qquad T_{new} = \frac{1000}{${num(b, 0)}} = ${num(tb, 2)}\ \text{ms} \\[4pt] &\Delta T = \amber{${signed(d, 2)}\ \text{ms}} \end{aligned}`,
    meter: share,
    meterLabel: tx(t, "oglProf_liveMeter", "share of the 16.7 ms budget at 60 Hz") + ` · ${num(share * 100, 0)}%`,
  };
};

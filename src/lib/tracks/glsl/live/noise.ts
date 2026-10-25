// ── Live formulas of "Noise & Procedural Patterns" ────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;
const f = Math.fround;                                     // every step rounded to a GPU float

/** The sin hash of the cell (x, y), step by step, in 32-bit floats. */
export const hashNumbers = () => ({ x, y }: V) => {
  const d = f(f(f(127.1) * f(x)) + f(f(311.7) * f(y)));
  const s = f(Math.sin(d));
  const m = f(s * f(43758.5453));
  const h = m - Math.floor(m);
  return {
    tex: r`\begin{aligned}
      d &= 127.1 \cdot ${num(x, 2)} + 311.7 \cdot ${num(y, 2)} = ${num(d, 3)} \\
      \sin d &= ${num(s, 6)} \\
      43758.5453 \cdot \sin d &= ${num(m, 4)} \\
      \operatorname{fract} &= \amber{${num(h, 6)}}
    \end{aligned}`,
    meter: h,
    meterLabel: num(h, 4),
  };
};

/** The three fade curves at f: value, slope and curvature. */
export const fadeNumbers = () => ({ f: x }: V) => {
  const s = x * x * (3 - 2 * x), s1 = 6 * x - 6 * x * x, s2 = 6 - 12 * x;
  const q = x * x * x * (x * (x * 6 - 15) + 10), q1 = 30 * x ** 4 - 60 * x ** 3 + 30 * x * x, q2 = 120 * x ** 3 - 180 * x * x + 60 * x;
  return {
    tex: r`\begin{aligned}
      &\text{linear:} && u = ${num(x, 2)} && u' = 1 && u'' = 0 \\
      &\text{smoothstep:} && u = ${num(s, 3)} && u' = ${num(s1, 3)} && u'' = \amber{${num(s2, 2)}} \\
      &\text{quintic:} && u = ${num(q, 3)} && u' = ${num(q1, 3)} && u'' = ${num(q2, 2)}
    \end{aligned}`,
  };
};

/** How many octaves are worth computing before they get smaller than two pixels. */
export const octaveNumbers = (t: TrackTranslations) => ({ W, s, lac, N }: V) => {
  const last = W / (s * lac ** (N - 1));                  // period of the last octave, in pixels
  const useful = 1 + Math.floor(Math.log(W / (2 * s)) / Math.log(lac));
  const wasted = Math.max(0, N - useful);
  return {
    tex: r`\begin{aligned}
      &P_{${N - 1}} = \frac{${num(W, 0)}}{${num(s, 0)} \cdot ${num(lac, 2)}^{${N - 1}}} = \amber{${num(last, 2)}\ \text{px}} \\[3pt]
      &N_{max} = 1 + \left\lfloor \log_{${num(lac, 2)}} \frac{${num(W, 0)}}{2 \cdot ${num(s, 0)}} \right\rfloor = ${useful}
      \quad \text{(${wasted > 0 ? `${wasted} ${tx(t, "glsl05_liveWasted", "octaves too fine: only aliasing")}` : tx(t, "glsl05_liveOk", "every octave is visible")})}
    \end{aligned}`,
    meter: Math.min(1, useful / Math.max(N, useful)),
    meterLabel: `${Math.min(N, useful)} / ${N}`,
  };
};

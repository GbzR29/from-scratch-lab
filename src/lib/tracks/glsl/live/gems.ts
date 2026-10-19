// ── Live formulas of "Gems & Bubbles" ─────────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;
const deg = (x: number) => (x * 180) / Math.PI;
const rad = (x: number) => (x * Math.PI) / 180;

/** The three tests a ray falling straight through the table must pass, for pavilion angle α and index n. */
export const pavilionNumbers = (t: TrackTranslations) => ({ alpha, n }: V) => {
  const crit = deg(Math.asin(1 / n));
  const ok = (pass: boolean, s: string) => (pass ? r`\green{${s}}` : r`\red{${s}}`);
  const t1 = alpha > crit;
  const second = 180 - 3 * alpha;
  const reaches = alpha > 30;                                   // below 30° the first reflection climbs towards the crown instead
  const t2 = reaches && second > crit;
  const third = Math.abs(180 - 4 * alpha);
  const t3 = third < crit;
  const outAng = t3 ? deg(Math.asin(Math.min(1, n * Math.sin(rad(third))))) : 0;
  const passed = [t1, t2, t3].filter(Boolean).length;
  const yes = tx(t, "glslGems_liveYes", "stays in"), no = tx(t, "glslGems_liveNo", "leaks out");
  return {
    tex: r`\begin{aligned}
      &\theta_c = \arcsin\tfrac{1}{${num(n, 2)}} = ${num(crit, 1)}^\circ \\[4pt]
      &\text{1: } \alpha = ${num(alpha, 2)}^\circ ${t1 ? ">" : "<"} \theta_c \;\Rightarrow\; ${ok(t1, r`\text{${t1 ? yes : no}}`)} \\[4pt]
      &\text{2: } 180^\circ - 3\alpha = ${reaches ? r`${num(second, 2)}^\circ ${t2 ? ">" : "<"} \theta_c \;\Rightarrow\; ${ok(t2, r`\text{${t2 ? yes : no}}`)}` : ok(false, r`\text{${tx(t, "glslGems_liveMiss", "misses the far facet")}}`)} \\[4pt]
      &\text{3: } |180^\circ - 4\alpha| = ${num(third, 2)}^\circ ${t3 ? "<" : ">"} \theta_c \;\Rightarrow\; ${ok(t3, t3 ? r`\text{${tx(t, "glslGems_liveOut", "out of the table at")} } ${num(outAng, 1)}^\circ` : r`\text{${tx(t, "glslGems_liveBack", "reflected again")}}`)}
    \end{aligned}`,
    meter: passed / 3,
    meterLabel: `${passed} / 3`,
  };
};

/** Thin-film reflectance at one wavelength, soap film (n = 1.33) in air. */
export const filmNumbers = () => ({ th, theta, lambda }: V) => {
  const n = 1.33, ci = Math.cos(rad(theta)), ct = Math.sqrt(1 - (1 - ci * ci) / (n * n));
  const rs = (ci - n * ct) / (ci + n * ct), rp = (n * ci - ct) / (n * ci + ct);
  const phi = (2 * Math.PI * n * th * ct) / lambda, s2 = Math.sin(phi) ** 2;
  const airy = (x: number) => (4 * x * x * s2) / ((1 - x * x) ** 2 + 4 * x * x * s2);
  const R = (airy(rs) + airy(rp)) / 2;
  return {
    tex: r`\begin{aligned}
      &\cos\theta_t = \sqrt{1 - \sin^2 ${num(theta, 0)}^\circ / 1.33^2} = ${num(ct, 3)} \\[4pt]
      &\varphi = \frac{2\pi \cdot 1.33 \cdot ${num(th, 0)} \cdot ${num(ct, 3)}}{${num(lambda, 0)}} = ${num(phi, 3)} \qquad \sin^2\varphi = ${num(s2, 3)} \\[4pt]
      &r_s = ${num(rs, 3)},\ r_p = ${num(rp, 3)} \qquad R = \amber{${num(R * 100, 2)}\%}
    \end{aligned}`,
    meter: Math.min(1, R / 0.16),
    meterLabel: `R = ${num(R * 100, 1)}%`,
  };
};

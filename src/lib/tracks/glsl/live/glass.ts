// ── Live formulas of "Glass, Refraction & Fresnel" ────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, fac, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Exact Fresnel reflectance for unpolarised light (cosI, cosT from the normal). */
function exact(n1: number, n2: number, cosI: number, cosT: number) {
  const rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
  const rp = (n1 * cosT - n2 * cosI) / (n1 * cosT + n2 * cosI);
  return (rs * rs + rp * rp) / 2;
}

/** refract(I, N, η) by hand, in a 2D frame where N = (0, 1) and I = (sin θ, −cos θ). */
export const refractNumbers = (t: TrackTranslations) => ({ n, theta, side }: V) => {
  const leaving = side > 0.5;
  const eta = leaving ? n : 1 / n;
  const c = Math.cos(rad(theta)), s = Math.sin(rad(theta));
  const k = 1 - eta * eta * (1 - c * c);
  const etaTex = leaving ? num(n, 2) : r`\tfrac{1}{${num(n, 2)}} = ${num(eta, 3)}`;
  const head = r`&\eta = ${etaTex} \qquad \mathbf N\cdot\mathbf I = -\cos ${theta}^\circ = ${num(-c, 3)} \\[4pt]
    &k = 1 - ${num(eta, 3)}^2\,\big(1 - ${num(c, 3)}^2\big) = 1 - ${num(eta * eta, 3)} \cdot ${num(1 - c * c, 3)} = `;
  if (k < 0) {
    const crit = (Math.asin(1 / n) * 180) / Math.PI;
    return {
      tex: r`\begin{aligned} ${head}\red{${num(k, 3)}} < 0 \\[4pt]
        &\Rightarrow \text{${tx(t, "glslGlass_liveTir", "refract() returns vec3(0): total internal reflection")}} \quad (\theta_c = ${num(crit, 1)}^\circ) \end{aligned}`,
      meter: 0,
      meterLabel: tx(t, "glslGlass_liveTrans", "light that gets through (1 − F)"),
    };
  }
  const sq = Math.sqrt(k), th2 = (Math.asin(Math.min(1, eta * s)) * 180) / Math.PI;
  const F = leaving ? exact(n, 1, c, sq) : exact(1, n, c, sq);
  return {
    tex: r`\begin{aligned} ${head}${num(k, 3)} \\[4pt]
      &\mathbf T = \big(\eta\sin\theta_1,\ -\sqrt k\,\big) = \big(${num(eta * s, 3)},\ ${num(-sq, 3)}\big) \qquad \theta_2 = \amber{${num(th2, 1)}^\circ} \end{aligned}`,
    meter: 1 - F,
    meterLabel: tx(t, "glslGlass_liveTrans", "light that gets through (1 − F)"),
  };
};

/** Schlick's approximation next to the exact Fresnel value, entering glass from air. */
export const schlickNumbers = (t: TrackTranslations) => ({ n, theta }: V) => {
  const c = Math.cos(rad(theta)), s = Math.sin(rad(theta));
  const r0 = ((1 - n) / (1 + n)) ** 2, p5 = (1 - c) ** 5;
  const F = r0 + (1 - r0) * p5;
  const ct = Math.sqrt(1 - (s / n) ** 2), E = exact(1, n, c, ct);
  return {
    tex: r`\begin{aligned} &R_0 = \Big(\frac{1 - ${num(n, 2)}}{1 + ${num(n, 2)}}\Big)^2 = ${num(r0, 4)} \qquad (1 - \cos ${theta}^\circ)^5 = ${fac(1 - c, 3)}^5 = ${num(p5, 4)} \\[4pt]
      &F = ${num(r0, 4)} + ${num(1 - r0, 4)} \cdot ${num(p5, 4)} = \amber{${num(F, 3)}} \qquad \text{${tx(t, "glslGlass_liveExact", "exact")}: } ${num(E, 3)} \end{aligned}`,
    meter: F,
    meterLabel: tx(t, "glslGlass_liveRefl", "light reflected (F)"),
  };
};

// ── Live formulas of "Rain on Glass" ──────────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;
const rad = (d: number) => (d * Math.PI) / 180;

/** The radius above which a drop slides down glass tilted alpha degrees, for advancing/receding contact angles (degrees). */
export const slideNumbers = (t: TrackTranslations) => ({ thA, thR, alpha }: V) => {
  const gamma = 0.072, rho = 1000, g = 9.81;
  const hyst = Math.max(Math.cos(rad(thR)) - Math.cos(rad(thA)), 0);
  const s = Math.sin(rad(alpha));
  const rc = Math.sqrt((3 * gamma * hyst) / (Math.PI * rho * g * Math.max(s, 1e-6))) * 1000;   // mm
  const tooLow = thR >= thA;
  return {
    tex: r`\begin{aligned}
      &\cos\theta_R - \cos\theta_A = \cos ${num(thR, 0)}^\circ - \cos ${num(thA, 0)}^\circ = ${num(hyst, 3)} \\[4pt]
      &r_c = \sqrt{\frac{3 \cdot 0.072 \cdot ${num(hyst, 3)}}{\pi \cdot 1000 \cdot 9.81 \cdot \sin ${num(alpha, 0)}^\circ}} = \amber{${tooLow ? r`0` : num(rc, 2)}\ \text{mm}}
    \end{aligned}`,
    meter: Math.min(1, rc / 6),
    meterLabel: tooLow ? tx(t, "glslRain_liveSlides", "any drop slides") : `⌀ ${num(2 * rc, 1)} mm`,
  };
};

/** Dew point from air temperature (°C) and relative humidity (%), Magnus formula. */
export const dewNumbers = () => ({ T, RH }: V) => {
  const a = 17.62, b = 243.12;
  const gam = Math.log(RH / 100) + (a * T) / (b + T);
  const Td = (b * gam) / (a - gam);
  return {
    tex: r`\begin{aligned}
      &\gamma = \ln\frac{${num(RH, 0)}}{100} + \frac{17.62 \cdot ${num(T, 1)}}{243.12 + ${num(T, 1)}} = ${num(gam, 3)} \\[4pt]
      &T_d = \frac{243.12 \cdot ${num(gam, 3)}}{17.62 - ${num(gam, 3)}} = \amber{${num(Td, 1)}\ ^\circ\text{C}}
    \end{aligned}`,
    meter: Math.min(1, Math.max(0, (Td + 10) / 40)),
    meterLabel: `${num(Td, 1)} °C`,
  };
};

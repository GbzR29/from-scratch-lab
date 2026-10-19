// ── Live formulas of "Snow & Blizzards" ───────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "@/lib/tracks/opengl/live/fmt";

type V = Record<string, number>;

/** fold6 on a point given by its angle (degrees) and its distance from the centre. */
export const foldNumbers = (t: TrackTranslations) => ({ theta, rad }: V) => {
  // atan returns −180°…180°, as GLSL's atan(y, x) does
  const a = theta > 180 ? theta - 360 : theta;
  const shifted = a + 30;
  const m = shifted - 60 * Math.floor(shifted / 60);           // GLSL mod: always 0 ≤ m < 60
  const a1 = m - 30, a2 = Math.abs(a1);
  const arm = Math.floor(shifted / 60), piece = arm * 2 + (a1 < 0 ? 1 : 0);
  const armN = ((arm % 6) + 6) % 6;
  const qx = rad * Math.cos((a2 * Math.PI) / 180), qy = rad * Math.sin((a2 * Math.PI) / 180);
  const mirrored = a1 < 0;
  return {
    tex: r`\begin{aligned}
      &a = ${num(a, 1)}^\circ \\[4pt]
      &a_1 = \operatorname{mod}(${num(a, 1)}^\circ + 30^\circ,\ 60^\circ) - 30^\circ = ${num(a1, 1)}^\circ \\[4pt]
      &a_2 = |a_1| = \amber{${num(a2, 1)}^\circ} \qquad \mathbf q = ${num(rad, 2)}\,(\cos a_2,\ \sin a_2) = (${num(qx, 3)},\ ${num(qy, 3)}) \\[4pt]
      &\text{${tx(t, "glslSnow_liveArm", "arm")} } ${armN},\ \text{${mirrored ? tx(t, "glslSnow_liveMirror", "mirrored") : tx(t, "glslSnow_liveStraight", "not mirrored")}}
    \end{aligned}`,
    meter: a2 / 30,
    meterLabel: `${tx(t, "glslSnow_livePiece", "piece")} ${((piece % 12) + 12) % 12} / 12`,
  };
};

/** Snowy air with 10^logN grains per m³ of radius rmm: extinction and visibility. */
export const visibilityNumbers = (t: TrackTranslations) => ({ logN, rmm }: V) => {
  const n = 10 ** logN, rad = rmm * 1e-3;
  const sigma = n * 2 * Math.PI * rad * rad, vis = 3.912 / sigma;
  const nTex = n >= 1e4 ? r`${num(n / 10 ** Math.floor(logN), 2)} \times 10^{${Math.floor(logN)}}` : num(n, 0);
  return {
    tex: r`\begin{aligned}
      &\sigma = n\,Q\,\pi r^2 = ${nTex} \cdot 2 \cdot \pi \cdot (${num(rmm, 2)} \times 10^{-3})^2 = ${num(sigma, sigma < 0.01 ? 5 : 3)}\ \text{m}^{-1} \\[4pt]
      &V = \frac{3.912}{\sigma} = \amber{${vis >= 10000 ? r`> 10\ \text{km}` : r`${num(vis, 0)}\ \text{m}`}} \qquad \text{${tx(t, "glslSnow_livePoles", "poles 10 m apart")}: } ${num(Math.min(vis / 10, 999), 0)}
    \end{aligned}`,
    meter: Math.min(1, Math.log10(Math.max(vis, 10)) / 4),
    meterLabel: vis >= 10000 ? "> 10 km" : `${num(vis, 0)} m`,
  };
};

/** A ball of radius rho sunk delta into the snow: where its print ends. Both in cm. */
export const ballPrintNumbers = (t: TrackTranslations) => ({ rho, delta }: V) => {
  const d = Math.min(delta, 2 * rho), c = rho - d;
  const rc = Math.sqrt(Math.max(0, rho * rho - c * c));
  return {
    tex: r`\begin{aligned}
      &c = \rho - \delta = ${num(rho, 0)} - ${num(d, 0)} = ${num(c, 0)}\ \text{cm} \\[4pt]
      &r_c = \sqrt{\rho^2 - c^2} = \sqrt{2\rho\delta - \delta^2} = \sqrt{${num(2 * rho * d - d * d, 0)}} = ${num(rc, 1)}\ \text{cm} \\[4pt]
      &\text{${tx(t, "glslSnow_liveWidth", "print width")}: } 2 r_c = \amber{${num(2 * rc, 1)}\ \text{cm}} \;=\; ${num((rc / rho) * 100, 0)}\%\ \text{${tx(t, "glslSnow_liveOfBall", "of the ball's width")}}
    \end{aligned}`,
    meter: rc / rho,
    meterLabel: `${num((rc / rho) * 100, 0)}%`,
  };
};

/** One snow sheet at depth z: what a world cell, a fall speed and a camera step become on screen. */
export const parallaxNumbers = (t: TrackTranslations) => ({ z, v }: V) => {
  const D = 0.35, f = 1;                                        // cell size (m), focal length (tan of the half field of view = 1)
  const cellScreen = (f * D) / z, speedScreen = (f * v) / z, cellsPerS = v / D;
  return {
    tex: r`\begin{aligned}
      &\text{${tx(t, "glslSnow_liveCell", "cell on screen")}: } \frac{f D}{z} = \frac{0.35}{${num(z, 1)}} = ${num(cellScreen, 4)} \\[4pt]
      &\text{${tx(t, "glslSnow_liveSpeed", "speed on screen")}: } \frac{f v}{z} = \frac{${num(v, 2)}}{${num(z, 1)}} = ${num(speedScreen, 4)}\ \text{s}^{-1} \\[4pt]
      &\text{${tx(t, "glslSnow_liveCells", "in cells")}: } \frac{f v / z}{f D / z} = \frac{v}{D} = \amber{${num(cellsPerS, 2)}\ \text{${tx(t, "glslSnow_liveCps", "cells/s")}}}
    \end{aligned}`,
    meter: Math.min(1, speedScreen / 1.5),
    meterLabel: `${num(speedScreen, 2)} / s`,
  };
};

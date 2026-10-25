// src/components/lesson/figures/chemistry/vsepr.ts
// VSEPR for the Chemistry widgets: shape names (translated through
// chShape_<key>), the AXₘEₙ table, and a small repulsion model. Electron
// domains are points on a sphere around the central atom that push each other
// apart with energy w / d² (d = straight-line distance); a lone pair pushes
// harder than a bond (w = 1.3 bond–pair, 1.8 pair–pair, 1 bond–bond). Tuned
// 2026-10-24 so the lowest-energy arrangement, over 12 random starts, gives
// every textbook shape: NH₃ 106.6°, H₂O 104.5°, lone pairs equatorial in
// SF₄/ClF₃/XeF₂, opposite in XeF₄.

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import type { V3 } from "@/components/lesson/kit/scene3d";

export type ShapeKey = "linear" | "trigonalPlanar" | "bent" | "tetrahedral" | "trigonalPyramidal" | "trigonalBipyramidal"
  | "seesaw" | "tShaped" | "octahedral" | "squarePyramidal" | "squarePlanar";

const SHAPE_EN: Record<ShapeKey, string> = {
  linear: "linear", trigonalPlanar: "trigonal planar", bent: "bent", tetrahedral: "tetrahedral",
  trigonalPyramidal: "trigonal pyramidal", trigonalBipyramidal: "trigonal bipyramidal", seesaw: "seesaw",
  tShaped: "T-shaped", octahedral: "octahedral", squarePyramidal: "square pyramidal", squarePlanar: "square planar",
};
export const SHAPE_KEYS = Object.keys(SHAPE_EN) as ShapeKey[];
export const shapeName = (t: TrackTranslations | undefined, k: ShapeKey) => tx(t, `chShape_${k}`, SHAPE_EN[k]);

/** Electron-domain geometry and molecular shape for X bonded atoms and E lone pairs. */
export const AXE: Record<string, { electron: ShapeKey; shape: ShapeKey }> = {
  "2,0": { electron: "linear", shape: "linear" },
  "3,0": { electron: "trigonalPlanar", shape: "trigonalPlanar" },
  "2,1": { electron: "trigonalPlanar", shape: "bent" },
  "4,0": { electron: "tetrahedral", shape: "tetrahedral" },
  "3,1": { electron: "tetrahedral", shape: "trigonalPyramidal" },
  "2,2": { electron: "tetrahedral", shape: "bent" },
  "5,0": { electron: "trigonalBipyramidal", shape: "trigonalBipyramidal" },
  "4,1": { electron: "trigonalBipyramidal", shape: "seesaw" },
  "3,2": { electron: "trigonalBipyramidal", shape: "tShaped" },
  "2,3": { electron: "trigonalBipyramidal", shape: "linear" },
  "6,0": { electron: "octahedral", shape: "octahedral" },
  "5,1": { electron: "octahedral", shape: "squarePyramidal" },
  "4,2": { electron: "octahedral", shape: "squarePlanar" },
};

const W_BL = 1.3, W_LL = 1.8;
const ITER = 1500, KEEP = 6;                          // iterations per start; keep every 6th as a frame

function energyOf(P: V3[], nb: number, equal: boolean) {
  let e = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const w = equal ? 1 : i >= nb && j >= nb ? W_LL : i >= nb || j >= nb ? W_BL : 1;
    e += w / ((P[i][0] - P[j][0]) ** 2 + (P[i][1] - P[j][1]) ** 2 + (P[i][2] - P[j][2]) ** 2);
  }
  return e;
}

/**
 * Relaxes nb bond domains and nl lone-pair domains on the unit sphere, from 12
 * random starts, and returns the frames of the start that ends lowest (first
 * nb directions are bonds). `equal` makes lone pairs push like bonds.
 */
export function relax(nb: number, nl: number, equal = false): V3[][] {
  const n = nb + nl;
  let best: { e: number; frames: V3[][] } | null = null;
  for (let seed = 1; seed <= 12; seed++) {
    let s = seed * 7919;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let P: V3[] = Array.from({ length: n }, () => {
      const v = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], l = Math.hypot(...v) || 1;
      return [v[0] / l, v[1] / l, v[2] / l] as V3;
    });
    const frames: V3[][] = [P];
    for (let it = 0; it < ITER; it++) {
      const F: V3[] = P.map(() => [0, 0, 0]);
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const w = equal ? 1 : i >= nb && j >= nb ? W_LL : i >= nb || j >= nb ? W_BL : 1;
        const d = [P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]];
        const r2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + 1e-9, f = (2 * w) / (r2 * r2);
        for (let c = 0; c < 3; c++) { F[i][c] += f * d[c]; F[j][c] -= f * d[c]; }
      }
      const step = 0.02 * (1 - it / ITER) + 0.002;
      P = P.map((p, i) => {
        const v = [p[0] + step * F[i][0], p[1] + step * F[i][1], p[2] + step * F[i][2]], l = Math.hypot(...v) || 1;
        return [v[0] / l, v[1] / l, v[2] / l] as V3;
      });
      if (it % KEEP === KEEP - 1) frames.push(P);
    }
    const e = energyOf(P, nb, equal);
    if (!best || e < best.e) best = { e, frames };
  }
  return best!.frames;
}

/** The distinct angles (degrees, rounded to 0.1) between the bond directions. */
export function bondAngles(P: V3[], nb: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < nb; i++) for (let j = i + 1; j < nb; j++) {
    const c = Math.max(-1, Math.min(1, P[i][0] * P[j][0] + P[i][1] * P[j][1] + P[i][2] * P[j][2]));
    const a = Math.round((Math.acos(c) * 180) / Math.PI * 10) / 10;
    if (!out.some(x => Math.abs(x - a) < 1.5)) out.push(a);
  }
  return out.sort((x, y) => x - y);
}

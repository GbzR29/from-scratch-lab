// ── Pre-fracturing a pane ─────────────────────────────────────────────────────
// What a game does before the level ships: cut a pane into Voronoi cells and
// turn each cell into a thin prism (a shard). The cut is done by clipping the
// pane's rectangle with one half-plane per other seed, "closer to my seed than
// to yours". Seeds crowd around the impact, so the pieces there are small.

import { mulberry32 } from "@/components/lesson/kit/figure";

export const PANE_W = 1.6, PANE_H = 1.0, PANE_Y0 = 0.45, THICK = 0.024;

type P2 = [number, number];

export type Shard = {
  /** Centroid on the pane (x, y in world units; the pane is the plane z = 0). */
  c: P2;
  /** Outline around the centroid, counter-clockwise. */
  poly: P2[];
  area: number;
  /** Distance from the impact. */
  dist: number;
};

/** Keeps the part of a convex polygon where n·p ≤ d. */
function clip(poly: P2[], nx: number, ny: number, d: number): P2[] {
  const out: P2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = nx * a[0] + ny * a[1] - d, db = nx * b[0] + ny * b[1] - d;
    if (da <= 0) out.push(a);
    if ((da < 0) !== (db < 0) && da !== db) {
      const s = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s]);
    }
  }
  return out;
}

/** Area and centroid of a simple polygon (shoelace). */
function areaCentroid(poly: P2[]) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length];
    const k = x0 * y1 - x1 * y0;
    a += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k;
  }
  a *= 0.5;
  return { area: Math.abs(a), c: [cx / (6 * a), cy / (6 * a)] as P2, ccw: a > 0 };
}

/** Voronoi shards of the pane, seeds crowded around `impact` (world x, y on the pane). */
export function fracture(impact: P2, count = 64, seed = 7): Shard[] {
  const rnd = mulberry32(seed);
  const x0 = -PANE_W / 2, x1 = PANE_W / 2, y0 = PANE_Y0, y1 = PANE_Y0 + PANE_H;
  const seeds: P2[] = [];
  while (seeds.length < count) {
    // Two thirds crowd the impact (radius ∝ u², so density falls off with distance), the rest anywhere
    let p: P2;
    if (seeds.length < count * 0.66) {
      const r = 0.95 * rnd() ** 2 + 0.01, a = rnd() * Math.PI * 2;
      p = [impact[0] + r * Math.cos(a), impact[1] + r * Math.sin(a) * 0.8];
    } else p = [x0 + rnd() * PANE_W, y0 + rnd() * PANE_H];
    if (p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1) seeds.push(p);
  }
  const rect: P2[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const shards: Shard[] = [];
  for (let i = 0; i < seeds.length; i++) {
    let poly = rect;
    const s = seeds[i];
    for (let j = 0; j < seeds.length && poly.length; j++) {
      if (j === i) continue;
      // Closer to s than to o: (p − m)·(o − s) ≤ 0, with m the midpoint
      const o = seeds[j], nx = o[0] - s[0], ny = o[1] - s[1];
      poly = clip(poly, nx, ny, nx * (s[0] + o[0]) * 0.5 + ny * (s[1] + o[1]) * 0.5);
    }
    if (poly.length < 3) continue;
    const { area, c, ccw } = areaCentroid(poly);
    if (area < 1e-6) continue;
    const ring = (ccw ? poly : [...poly].reverse()).map(([x, y]) => [x - c[0], y - c[1]] as P2);
    shards.push({ c, poly: ring, area, dist: Math.hypot(c[0] - impact[0], c[1] - impact[1]) });
  }
  return shards;
}

/**
 * One triangle list for every shard: local position (around the shard's
 * centroid), normal, and (shard index, 1 on the side faces). 8 floats a vertex.
 * The side faces are the fracture surfaces.
 */
export function shardMesh(shards: Shard[]): Float32Array {
  const out: number[] = [];
  const h = THICK / 2;
  const v = (x: number, y: number, z: number, nx: number, ny: number, nz: number, id: number, side: number) =>
    out.push(x, y, z, nx, ny, nz, id, side);
  shards.forEach((s, id) => {
    const P = s.poly, n = P.length;
    for (let i = 1; i < n - 1; i++) {
      // Front (+z, towards the camera at the start) and back faces, as fans
      v(P[0][0], P[0][1], h, 0, 0, 1, id, 0); v(P[i][0], P[i][1], h, 0, 0, 1, id, 0); v(P[i + 1][0], P[i + 1][1], h, 0, 0, 1, id, 0);
      v(P[0][0], P[0][1], -h, 0, 0, -1, id, 0); v(P[i + 1][0], P[i + 1][1], -h, 0, 0, -1, id, 0); v(P[i][0], P[i][1], -h, 0, 0, -1, id, 0);
    }
    for (let i = 0; i < n; i++) {
      const a = P[i], b = P[(i + 1) % n];
      const ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey) || 1;
      const nx = ey / l, ny = -ex / l;                     // outward for a counter-clockwise outline
      v(a[0], a[1], h, nx, ny, 0, id, 1); v(a[0], a[1], -h, nx, ny, 0, id, 1); v(b[0], b[1], -h, nx, ny, 0, id, 1);
      v(a[0], a[1], h, nx, ny, 0, id, 1); v(b[0], b[1], -h, nx, ny, 0, id, 1); v(b[0], b[1], h, nx, ny, 0, id, 1);
    }
  });
  return new Float32Array(out);
}

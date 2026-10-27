// Geometry of the polyhedra figure: vertex sets for the solids, the convex
// hull that turns a point set into faces, and corner cutting (truncation).
// No React here: PolyhedronFigure draws what these functions return.

import { add, sub, scale, dot, cross, len, norm, lerp3, type V3 } from "@/components/lesson/kit/scene3d";

export type SolidId = "prism" | "pyramid" | "tetra" | "cube" | "octa" | "dodeca" | "icosa";

/** Vertices and faces; each face lists vertex indices counter-clockwise seen from outside. */
export type Poly = { verts: V3[]; faces: number[][]; edges: [number, number][] };

const PHI = (1 + Math.sqrt(5)) / 2;
const EPS = 1e-6;

/** Every sign choice of (±a, ±b, ±c), without duplicates when a part is 0. */
function signs([a, b, c]: V3): V3[] {
  const out: V3[] = [];
  for (const sa of a ? [1, -1] : [1]) for (const sb of b ? [1, -1] : [1]) for (const sc of c ? [1, -1] : [1])
    out.push([sa * a, sb * b, sc * c]);
  return out;
}
/** The three cyclic shifts of (a, b, c), each with every sign. */
const cyclic = (v: V3): V3[] => [v, [v[1], v[2], v[0]] as V3, [v[2], v[0], v[1]] as V3].flatMap(signs);

/** A regular n-gon of radius 1 in the horizontal plane at height y. */
const ring = (n: number, y: number, turn = 0): V3[] =>
  Array.from({ length: n }, (_, k) => {
    const a = turn + (k / n) * Math.PI * 2;
    return [Math.cos(a), y, Math.sin(a)] as V3;
  });

export function solidPoints(id: SolidId, n: number): V3[] {
  switch (id) {
    case "prism": {
      const h = Math.sin(Math.PI / n);                // half the side of the base: square side faces
      return [...ring(n, -h, Math.PI / 2), ...ring(n, h, Math.PI / 2)];
    }
    case "pyramid": return [...ring(n, -0.6, Math.PI / 2), [0, 1.0, 0]];
    case "tetra": return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    case "cube": return signs([1, 1, 1]);
    case "octa": return cyclic([1, 0, 0]);
    case "icosa": return cyclic([0, 1, PHI]);
    case "dodeca": return [...signs([1, 1, 1]), ...cyclic([0, 1 / PHI, PHI])];
  }
}

/**
 * Convex hull of a point set as polygons. Brute force over triples (the
 * biggest set here has 60 points): a triple spans a face when every point
 * lies on one side of its plane; all points on that plane form the face.
 */
export function hull(raw: V3[]): Poly {
  const r = Math.max(...raw.map(len));
  const pts = raw.map(p => scale(p, 1 / r));
  const n = pts.length;
  const seen = new Set<string>();
  const faces: number[][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    let nrm = cross(sub(pts[j], pts[i]), sub(pts[k], pts[i]));
    if (len(nrm) < EPS) continue;
    nrm = norm(nrm);
    let d = dot(nrm, pts[i]), pos = false, neg = false;
    for (const p of pts) {
      const s = dot(nrm, p) - d;
      if (s > EPS) pos = true; else if (s < -EPS) neg = true;
      if (pos && neg) break;
    }
    if (pos && neg) continue;
    if (pos) { nrm = scale(nrm, -1); d = -d; }          // make the normal point outward
    const key = [...nrm, d].map(v => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4)).join(",");   // no "-0.0000" twins
    if (seen.has(key)) continue;
    seen.add(key);
    const on = pts.map((p, idx) => [p, idx] as const).filter(([p]) => Math.abs(dot(nrm, p) - d) < EPS);
    const c = scale(on.reduce((s, [p]) => add(s, p), [0, 0, 0] as V3), 1 / on.length);
    const u = norm(sub(on[0][0], c)), v = cross(nrm, u);   // u → v turns anticlockwise seen from outside
    const ang = (p: V3) => Math.atan2(dot(sub(p, c), v), dot(sub(p, c), u));
    faces.push(on.sort((a, b) => ang(a[0]) - ang(b[0])).map(([, idx]) => idx));
  }
  const ek = new Set<string>();
  const edges: [number, number][] = [];
  for (const f of faces) f.forEach((a, m) => {
    const b = f[(m + 1) % f.length], key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!ek.has(key)) { ek.add(key); edges.push(a < b ? [a, b] : [b, a]); }
  });
  return { verts: pts, faces, edges };
}

/** Cut every corner off at a third of each edge: two new points per edge. */
export function truncatedPoints(p: Poly, t = 1 / 3): V3[] {
  return p.edges.flatMap(([a, b]) => [lerp3(p.verts[a], p.verts[b], t), lerp3(p.verts[b], p.verts[a], t)]);
}

/** How many faces have each number of sides, e.g. { 5: 12, 6: 20 }. */
export function faceKinds(p: Poly): [number, number][] {
  const m = new Map<number, number>();
  for (const f of p.faces) m.set(f.length, (m.get(f.length) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
}

/** How many vertices have each degree (edges meeting there). */
export function vertexKinds(p: Poly): [number, number][] {
  const deg = new Array(p.verts.length).fill(0);
  for (const [a, b] of p.edges) { deg[a]++; deg[b]++; }
  const m = new Map<number, number>();
  for (const d of deg) m.set(d, (m.get(d) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
}

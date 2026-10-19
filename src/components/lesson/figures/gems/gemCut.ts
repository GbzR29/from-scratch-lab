// ── A round brilliant, as planes ──────────────────────────────────────────────
// A cut gem is a convex polyhedron: the solid that lies behind every facet
// plane at once. Each facet is a plane n·p = h with an outward unit normal n,
// so the whole stone is a list of vec4(n, h). The proportions follow
// Tolkowsky's 1919 "ideal" brilliant: girdle radius 1, table 53% of the
// diameter, crown angle β ≈ 34.5°, pavilion angle α ≈ 40.75°. The section
// through two opposite pavilion mains is the 2D profile that GemCutFigure traces.

export type Material = { id: string; label: string; A: number; B: number };

/**
 * Cauchy fits n(λ) = A + B/λ² (λ in nm) from each material's index at 589 nm
 * and its "dispersion" (n at 430.8 nm − n at 686.7 nm, the jeweller's number):
 * B = dispersion / (1/430.8² − 1/686.7²), A = n_D − B/589².
 */
export const MATERIALS: Material[] = [
  { id: "diamond", label: "diamond 2.42", A: 2.378, B: 13470 },
  { id: "moissanite", label: "moissanite 2.65", A: 2.558, B: 31800 },
  { id: "cz", label: "cubic zirconia 2.16", A: 2.107, B: 18370 },
  { id: "glass", label: "glass 1.52", A: 1.511, B: 3060 },
];

/** n(λ) with the spread around 550 nm multiplied by `boost` (1 = the real material). */
export const cauchy = (m: Material, lambda: number, boost = 1) =>
  m.A + m.B / 550 ** 2 + boost * m.B * (1 / lambda ** 2 - 1 / 550 ** 2);

export const TABLE = 0.53;          // table half-width, as a fraction of the girdle radius
export const GIRDLE = 0.015;        // half the girdle thickness
const rad = (d: number) => (d * Math.PI) / 180;

/** Every facet plane of the stone, as [nx, ny, nz, h] (73 planes). */
export function brilliantPlanes(alphaDeg: number, betaDeg: number): Float32Array {
  const a = rad(alphaDeg), b = rad(betaDeg);
  const out: number[] = [];
  // A facet tilted by `tilt` from horizontal, facing azimuth phi, up or down, through point p
  const facet = (phi: number, tilt: number, up: boolean, p: [number, number, number]) => {
    const n = [Math.sin(tilt) * Math.cos(phi), (up ? 1 : -1) * Math.cos(tilt), Math.sin(tilt) * Math.sin(phi)];
    out.push(n[0], n[1], n[2], n[0] * p[0] + n[1] * p[1] + n[2] * p[2]);
  };
  const ring = (phi: number, r: number, y: number): [number, number, number] => [r * Math.cos(phi), y, r * Math.sin(phi)];
  const top = GIRDLE + (1 - TABLE) * Math.tan(b);

  out.push(0, 1, 0, top);                                                     // table
  for (let k = 0; k < 8; k++) {
    const phi = rad(45 * k);
    facet(phi, b, true, ring(phi, 1, GIRDLE));                                // crown mains (bezels): from the girdle up to the table corners
    facet(phi + rad(22.5), b - rad(13), true, ring(phi + rad(22.5), TABLE * Math.cos(rad(22.5)), top));   // stars: along the table's edges
    facet(phi, a, false, [0, -GIRDLE - Math.tan(a), 0]);                     // pavilion mains: all through the culet
  }
  for (let j = 0; j < 16; j++) {
    const phi = rad(11.25 + 22.5 * j);
    facet(phi, b + rad(6), true, ring(phi, 1, GIRDLE));                       // upper girdle facets
    facet(phi, a + rad(1.5), false, ring(phi, 1, -GIRDLE));                   // lower girdle facets
    out.push(Math.cos(rad(22.5 * j)), 0, Math.sin(rad(22.5 * j)), 1);        // the girdle: 16 vertical planes
  }
  return new Float32Array(out);
}

// ── The 2D section (x across, y up) ───────────────────────────────────────────

export type P2 = [number, number];

/** Outline of the section through two opposite pavilion mains, counter-clockwise. */
export function profile(alphaDeg: number, betaDeg: number): P2[] {
  const top = GIRDLE + (1 - TABLE) * Math.tan(rad(betaDeg));
  const culet = -GIRDLE - Math.tan(rad(alphaDeg));
  return [[0, culet], [1, -GIRDLE], [1, GIRDLE], [TABLE, top], [-TABLE, top], [-1, GIRDLE], [-1, -GIRDLE]];
}

/** A straight piece of a traced ray: where, how bright, and which part of the path (falling in, inside, out of the top, out of the bottom). */
export type Piece = { a: P2; b: P2; w: number; kind: "fall" | "in" | "top" | "leak" };

const dot = (a: P2, b: P2) => a[0] * b[0] + a[1] * b[1];
const along = (o: P2, d: P2, t: number): P2 => [o[0] + d[0] * t, o[1] + d[1] * t];
const reflect = (d: P2, n: P2): P2 => { const k = 2 * dot(d, n); return [d[0] - k * n[0], d[1] - k * n[1]]; };

/** GLSL refract(); null on total internal reflection. */
function refract(d: P2, n: P2, eta: number): P2 | null {
  const c = dot(n, d), k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  const s = eta * c + Math.sqrt(k);
  return [eta * d[0] - s * n[0], eta * d[1] - s * n[1]];
}

/** Unpolarised Fresnel reflectance, cosines from the normal. */
function fresnel(n1: number, n2: number, ci: number, ct: number) {
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct), rp = (n1 * ct - n2 * ci) / (n1 * ct + n2 * ci);
  return (rs * rs + rp * rp) / 2;
}

/** Outward normals of the outline's edges (it is counter-clockwise). */
function edges(poly: P2[]) {
  return poly.map((a, i) => {
    const b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey);
    const n: P2 = [ey / l, -ex / l];
    return { n, h: dot(n, a) };
  });
}

/**
 * Light falling straight down on the stone at x, one wavelength with index n.
 * Inside, the path splits at every exit: the part that leaves is a "top" or
 * "leak" piece, the reflected part goes on (all of it, past the critical angle).
 */
export function traceDown(poly: P2[], x: number, n: number, maxBounces = 9): Piece[] {
  const E = edges(poly);
  const pieces: Piece[] = [];
  const d0: P2 = [0, -1];
  // Entry: the ray meets the upper outline at the largest t of the planes it enters
  let tIn = -Infinity, nIn: P2 = [0, 1];
  const o: P2 = [x, 1.2];
  for (const e of E) {
    const den = dot(e.n, d0);
    if (den < 0) { const t = (e.h - dot(e.n, o)) / den; if (t > tIn) { tIn = t; nIn = e.n; } }
  }
  const p0 = along(o, d0, tIn);
  pieces.push({ a: o, b: p0, w: 1, kind: "fall" });
  const T = refract(d0, nIn, 1 / n)!;
  const ci = -dot(nIn, d0), ct = Math.sqrt(Math.max(0, 1 - (1 - ci * ci) / (n * n)));
  let w = 1 - fresnel(1, n, ci, ct);
  let p = p0, d = T;
  for (let i = 0; i < maxBounces && w > 0.01; i++) {
    // Exit: the nearest plane the ray is heading out of
    let tOut = Infinity, nOut: P2 = [0, 1];
    for (const e of E) {
      const den = dot(e.n, d);
      if (den > 1e-9) { const t = (e.h - dot(e.n, p)) / den; if (t < tOut) { tOut = t; nOut = e.n; } }
    }
    const q = along(p, d, tOut);
    pieces.push({ a: p, b: q, w, kind: "in" });
    const out = refract(d, [-nOut[0], -nOut[1]], n);                          // leaving: normal flipped to face the ray, η = n
    if (out) {
      const c1 = dot(nOut, d), c2 = Math.sqrt(1 - n * n * (1 - c1 * c1));
      const F = fresnel(n, 1, c1, c2);
      pieces.push({ a: q, b: along(q, out, 3), w: w * (1 - F), kind: nOut[1] > 0.3 ? "top" : "leak" });
      w *= F;
    }
    p = q; d = reflect(d, nOut);
  }
  return pieces;
}

/** Fraction of the light falling on the stone from above that comes back out of the crown. */
export function lightReturn(alphaDeg: number, betaDeg: number, n: number, rays = 64) {
  const poly = profile(alphaDeg, betaDeg);
  let top = 0;
  for (let i = 0; i < rays; i++) {
    const x = -0.98 + (1.96 * (i + 0.5)) / rays;
    for (const pc of traceDown(poly, x, n)) if (pc.kind === "top") top += pc.w;
  }
  return top / rays;
}

/** The pavilion window for a ray falling straight down through the table (see the chapter's derivation). */
export function pavilionWindow(n: number) {
  const c = (Math.asin(1 / n) * 180) / Math.PI;
  return { crit: c, lo: Math.max(c, (180 - c) / 4), hi: Math.min((180 + c) / 4, (180 - c) / 3) };
}

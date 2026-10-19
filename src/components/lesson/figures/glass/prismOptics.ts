// ── Prism optics (CPU side of PrismBeamFigure) ────────────────────────────────
// The whole beam lives in the plane z = 0, so its path is traced here in 2D,
// once per wavelength: Cauchy gives n(λ), refract() bends the ray at each face,
// the exact Fresnel equations take their share, and total internal reflection
// keeps the ray inside. The shader only draws the resulting segments as glowing
// tubes of haze and as light spots where they land on the wall or the floor.

export type V2 = [number, number];
/** A straight piece of the beam: from a to b, power w, colour index (−1 = white), and whether it ends on the wall/floor. */
export type Seg = { a: V2; b: V2; w: number; col: number; ends: boolean };

export const SCENE = {
  wallX: 4.4, floorY: -2.6, wallTop: 1.4, wallZ: 2.6,
  side: 1.7, depth: 0.9,          // triangle side, half length along z
  slit: 0.45,                     // half height of the slit: the beam is a sheet |z| < slit
  beamDeg: 15,                    // the incoming beam rises at this angle
  aim: [-0.3, 0.12] as V2,        // and passes through this point (on the left face at rest)
};

export const MEDIA = {
  crown: { A: 1.5046, B: 4200 },  // window / crown glass
  flint: { A: 1.728, B: 13420 },  // dense flint glass
  water: { A: 1.3199, B: 3300 },
  diamond: { A: 2.385, B: 13000 },
} as const;
export type Medium = keyof typeof MEDIA;

/** Cauchy n(λ) = A + B/λ², with the spread around 550 nm multiplied by `boost`. */
export function cauchy(m: Medium, lambda: number, boost: number) {
  const { A, B } = MEDIA[m];
  return A + B / 550 ** 2 + boost * B * (1 / lambda ** 2 - 1 / 550 ** 2);
}

// ── Wavelength → colour ───────────────────────────────────────────────────────
// CIE 1931 matching functions (multi-lobe Gaussian fit by Wyman, Sloan and
// Shirley, 2013) → linear sRGB, negatives clipped, then each channel scaled so
// that all the samples together add up to white.

const g = (x: number, mu: number, s1: number, s2: number) => { const s = x < mu ? s1 : s2; return Math.exp(-0.5 * ((x - mu) / s) ** 2); };

function xyz(l: number): [number, number, number] {
  return [
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
  ];
}

/** Wavelengths (short to long) and their colours: 3 = a shader's blue, green and red; more = the spectrum. */
export function spectrum(count: number): { lambda: number[]; rgb: [number, number, number][] } {
  if (count === 3) return { lambda: [465, 545, 610], rgb: [[0, 0, 1], [0, 1, 0], [1, 0, 0]] };
  const lambda = Array.from({ length: count }, (_, i) => 400 + (300 * (i + 0.5)) / count);
  const rgb = lambda.map(l => {
    const [X, Y, Z] = xyz(l);
    return [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z]
      .map(v => Math.max(v, 0)) as [number, number, number];
  });
  const sum = [0, 1, 2].map(c => rgb.reduce((s, v) => s + v[c], 0));
  return { lambda, rgb: rgb.map(v => v.map((x, c) => x / sum[c]) as [number, number, number]) };
}

// ── 2D tracing ────────────────────────────────────────────────────────────────

const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const along = (p: V2, d: V2, t: number): V2 => [p[0] + d[0] * t, p[1] + d[1] * t];
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Triangle vertices (counter-clockwise), apex up at rot = 0, turned by rot degrees about its centre. */
export function triangle(rotDeg: number): V2[] {
  const R = SCENE.side / Math.sqrt(3);
  return [90, 210, 330].map(a => [R * Math.cos(rad(a + rotDeg)), R * Math.sin(rad(a + rotDeg))]);
}

/** Nearest crossing of the ray with a triangle edge: distance and outward normal. */
function hitPrism(tri: V2[], p: V2, d: V2) {
  let best = Infinity, nrm: V2 = [0, 0];
  for (let i = 0; i < 3; i++) {
    const a = tri[i], e = sub(tri[(i + 1) % 3], a);
    const den = d[0] * e[1] - d[1] * e[0];
    if (Math.abs(den) < 1e-9) continue;
    const ap = sub(a, p);
    const t = (ap[0] * e[1] - ap[1] * e[0]) / den, s = (ap[0] * d[1] - ap[1] * d[0]) / den;
    if (t > 1e-6 && s >= 0 && s <= 1 && t < best) {
      const L = Math.hypot(e[0], e[1]);
      best = t; nrm = [e[1] / L, -e[0] / L];
    }
  }
  return { t: best, nrm };
}

/** Where a ray outside the prism stops: the wall, the floor, or far away. */
function landing(p: V2, d: V2) {
  let t = 30, ends = false;
  if (d[0] > 0) {
    const tw = (SCENE.wallX - p[0]) / d[0], y = p[1] + d[1] * tw;
    if (y >= SCENE.floorY && y <= SCENE.wallTop && tw < t) { t = tw; ends = true; }
  }
  if (d[1] < 0) {
    const tf = (SCENE.floorY - p[1]) / d[1];
    if (p[0] + d[0] * tf <= SCENE.wallX && tf < t) { t = tf; ends = true; }
  }
  return { t, ends };
}

/** Exact Fresnel reflectance for unpolarised light. */
function fresnel(n1: number, n2: number, cosI: number, cosT: number) {
  const rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
  const rp = (n1 * cosT - n2 * cosI) / (n1 * cosT + n2 * cosI);
  return (rs * rs + rp * rp) / 2;
}

type Path = { segs: Seg[]; out: V2 | null; tirs: number; refractions: number };

/** One wavelength's path from p along d through the prism of index n. */
function trace(tri: V2[], p: V2, d: V2, n: number, col: number, skipFirst: boolean): Path {
  const segs: Seg[] = [];
  let inside = false, w = 1, tirs = 0, refractions = 0;
  for (let k = 0; k < 9; k++) {
    const h = hitPrism(tri, p, d);
    const land = inside ? { t: Infinity, ends: false } : landing(p, d);
    if (h.t >= land.t || !isFinite(h.t)) {
      segs.push({ a: p, b: along(p, d, land.t), w, col, ends: land.ends });
      return { segs, out: d, tirs, refractions };
    }
    const q = along(p, d, h.t);
    if (!(skipFirst && k === 0)) segs.push({ a: p, b: q, w, col, ends: false });
    const entering = dot(d, h.nrm) < 0;
    const N: V2 = entering ? h.nrm : [-h.nrm[0], -h.nrm[1]];   // faces the ray
    const eta = entering ? 1 / n : n;
    const cosI = -dot(d, N), kk = 1 - eta * eta * (1 - cosI * cosI);
    if (kk < 0) {                                                // total internal reflection
      tirs++;
      d = [d[0] + 2 * cosI * N[0], d[1] + 2 * cosI * N[1]];
      p = along(q, N, 1e-5);
      continue;
    }
    const cosT = Math.sqrt(kk);
    w *= 1 - (entering ? fresnel(1, n, cosI, cosT) : fresnel(n, 1, cosI, cosT));
    d = [eta * d[0] + (eta * cosI - cosT) * N[0], eta * d[1] + (eta * cosI - cosT) * N[1]];
    p = along(q, N, -1e-5);
    inside = !inside;
    refractions++;
  }
  return { segs, out: null, tirs, refractions };                 // still bouncing: trapped
}

export const beamDir = (): V2 => [Math.cos(rad(SCENE.beamDeg)), Math.sin(rad(SCENE.beamDeg))];

/** Signed angle (degrees) from the incoming beam to an outgoing direction; negative = turned down. */
const deviation = (out: V2) => {
  const d = beamDir();
  return (Math.atan2(d[0] * out[1] - d[1] * out[0], dot(d, out)) * 180) / Math.PI;
};

export type Beams = {
  segs: Seg[];
  /** Per wavelength: deviation in degrees, or null if total internal reflection caught it. */
  dev: (number | null)[];
  hitsPrism: boolean;
};

/** Every segment of the scene: the white beam, its weak reflection, and one path per wavelength. */
export function computeBeams(rotDeg: number, m: Medium, boost: number, lambda: number[]): Beams {
  const tri = triangle(rotDeg), d = beamDir();
  const o = along(SCENE.aim, d, -14);
  const first = hitPrism(tri, o, d);
  if (!isFinite(first.t)) {
    const land = landing(o, d);
    return { segs: [{ a: o, b: along(o, d, land.t), w: 1, col: -1, ends: land.ends }], dev: lambda.map(() => 0), hitsPrism: false };
  }
  const q = along(o, d, first.t);
  const segs: Seg[] = [{ a: o, b: q, w: 1, col: -1, ends: false }];
  // the few percent the first face reflects (white: every colour reflects about the same)
  const n0 = cauchy(m, 550, 0), cosI = -dot(d, first.nrm);
  const cosT = Math.sqrt(Math.max(0, 1 - (1 - cosI * cosI) / (n0 * n0)));
  const R: V2 = [d[0] + 2 * cosI * first.nrm[0], d[1] + 2 * cosI * first.nrm[1]];
  const p0 = along(q, first.nrm, 1e-5), land = landing(p0, R);
  segs.push({ a: p0, b: along(p0, R, land.t), w: fresnel(1, n0, cosI, cosT), col: -1, ends: land.ends });
  const dev = lambda.map((l, i) => {
    const path = trace(tri, o, d, cauchy(m, l, boost), i, true);
    segs.push(...path.segs);
    return path.out && path.tirs === 0 ? deviation(path.out) : null;
  });
  return { segs, dev, hitsPrism: true };
}

/** The prism turn (degrees) that gives 550 nm light its smallest deviation. */
export function minDeviationRot(m: Medium): number | null {
  const d = beamDir(), o = along(SCENE.aim, d, -14);
  let best: number | null = null, bestDev = Infinity;
  for (let r = -35; r <= 35; r += 0.25) {          // the left face keeps facing the beam
    const path = trace(triangle(r), o, d, cauchy(m, 550, 0), 0, false);
    if (!path.out || path.refractions !== 2 || path.tirs > 0) continue;
    const dv = Math.abs(deviation(path.out));
    if (dv < bestDev) { bestDev = dv; best = r; }
  }
  return best;
}

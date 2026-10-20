// ── Hydrogen wavefunctions ────────────────────────────────────────────────────
// ψ_nlm = R_nl(r) · Y_lm(θ, φ) for the real orbitals chemists draw (s, p_x,
// p_y, p_z, d_z², …), in units of the Bohr radius a₀. Normalisation is left
// out where only shapes matter: the radial function is
//   R_nl ∝ ρ^l e^(−ρ/2) L^(2l+1)_(n−l−1)(ρ),  ρ = 2r/n,
// with L the generalised Laguerre polynomial, and the angular part is the
// associated Legendre function P_l^|m|(cos θ) times cos(mφ) (m > 0), sin(|m|φ)
// (m < 0) or 1 (m = 0).

import { mulberry32 } from "@/components/lesson/kit/figure";

/** Generalised Laguerre polynomial L_k^α(x), by the three-term recurrence. */
function laguerre(k: number, a: number, x: number) {
  if (k === 0) return 1;
  let l0 = 1, l1 = 1 + a - x;
  for (let j = 1; j < k; j++) {
    const l2 = ((2 * j + 1 + a - x) * l1 - (j + a) * l0) / (j + 1);
    l0 = l1; l1 = l2;
  }
  return l1;
}

/** Associated Legendre function P_l^m(x), m ≥ 0 (no Condon–Shortley sign). */
function legendre(l: number, m: number, x: number) {
  let pmm = 1;
  const s = Math.sqrt(Math.max(0, 1 - x * x));
  for (let i = 1; i <= m; i++) pmm *= (2 * i - 1) * s;
  if (l === m) return pmm;
  let pm1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pm1;
  for (let ll = m + 2; ll <= l; ll++) {
    const p = (x * (2 * ll - 1) * pm1 - (ll + m - 1) * pmm) / (ll - m);
    pmm = pm1; pm1 = p;
  }
  return pm1;
}

/** Radial function R_nl(r), r in Bohr radii, normalised so that ∫ r² R² dr = 1. */
export function radial(n: number, l: number, r: number) {
  const rho = (2 * r) / n;
  return radialNorm(n, l) * rho ** l * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho);
}

const normCache = new Map<string, number>();
function radialNorm(n: number, l: number) {
  const key = `${n},${l}`;
  const hit = normCache.get(key);
  if (hit !== undefined) return hit;
  let s = 0;
  const R = rMax(n), dr = R / 4000;
  for (let i = 0; i < 4000; i++) {
    const r = (i + 0.5) * dr, rho = (2 * r) / n;
    const v = rho ** l * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho);
    s += r * r * v * v * dr;
  }
  const k = 1 / Math.sqrt(s);
  normCache.set(key, k);
  return k;
}

/** A radius beyond which the electron is essentially never found. */
export const rMax = (n: number) => 3 * n * n + 6;

/** Real angular part at a direction (x, y, z) / r. */
export function angular(l: number, m: number, x: number, y: number, z: number) {
  const r = Math.hypot(x, y, z) || 1e-12;
  const p = legendre(l, Math.abs(m), z / r);
  if (m === 0) return p;
  const phi = Math.atan2(y, x);
  return p * (m > 0 ? Math.cos(m * phi) : Math.sin(-m * phi));
}

/** The real orbital's value at a point (x, y, z) in Bohr radii. */
export const psi = (n: number, l: number, m: number, x: number, y: number, z: number) =>
  radial(n, l, Math.hypot(x, y, z)) * angular(l, m, x, y, z);

export const NAMES: Record<string, string> = {
  "0,0": "s",
  "1,0": "p_z", "1,1": "p_x", "1,-1": "p_y",
  "2,0": "d_z²", "2,1": "d_xz", "2,-1": "d_yz", "2,2": "d_x²−y²", "2,-2": "d_xy",
  "3,0": "f_z³", "3,1": "f_xz²", "3,-1": "f_yz²", "3,2": "f_z(x²−y²)", "3,-2": "f_xyz", "3,3": "f_x(x²−3y²)", "3,-3": "f_y(3x²−y²)",
};

export type Dot = { x: number; y: number; z: number; sign: number };

/**
 * Points scattered with density |ψ|². ψ is a product of a radial and an
 * angular part, so the two are drawn separately: the distance r from the
 * distribution r²R²(r) (inverse of its cumulative table), and the direction
 * uniformly on the sphere, kept with chance Y² / max Y² (rejection).
 */
export function sampleCloud(n: number, l: number, m: number, count: number, seed = 1): Dot[] {
  const R = rMax(n), rnd = mulberry32(seed), K = 2000;
  const cdf = new Float64Array(K + 1);
  for (let i = 1; i <= K; i++) { const r = ((i - 0.5) / K) * R; cdf[i] = cdf[i - 1] + r * r * radial(n, l, r) ** 2; }
  let ang = 0;
  for (let i = 0; i <= 90; i++) for (let j = 0; j < 48; j++) {
    const th = (i / 90) * Math.PI, ph = (j / 48) * 2 * Math.PI;
    ang = Math.max(ang, angular(l, m, Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)) ** 2);
  }
  const out: Dot[] = [];
  for (let tries = 0; out.length < count && tries < 2e5; tries++) {
    // direction: uniform on the sphere (z uniform in [−1, 1], φ uniform)
    const uz = rnd() * 2 - 1, ph = rnd() * 2 * Math.PI, s = Math.sqrt(1 - uz * uz);
    const dx = s * Math.cos(ph), dy = s * Math.sin(ph);
    const a = angular(l, m, dx, dy, uz);
    if (rnd() * ang * 1.02 > a * a) continue;
    // distance: binary search in the cumulative table
    const target = rnd() * cdf[K];
    let lo = 0, hi = K;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cdf[mid] < target) lo = mid; else hi = mid; }
    const r = ((lo + rnd()) / K) * R;
    const v = radial(n, l, r) * a;
    out.push({ x: r * dx, y: r * dy, z: r * uz, sign: v >= 0 ? 1 : -1 });
  }
  return out;
}

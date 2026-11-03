// ── Beta distribution numerics ────────────────────────────────────────────────
// Shared by the Bayesian figures (BetaBinomialFigure, markov/MHFigure): the
// log-gamma function (Lanczos), the beta density for any a, b > 0, its mean
// and standard deviation, the probability above a point by numerical
// integration, and a beta draw for whole-number shapes (sum of exponentials).

const LANCZOS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** ln Γ(x) for x > 0. */
export function lgamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let s = 0.99999999999980993;
  for (let i = 0; i < 8; i++) s += LANCZOS[i] / (x + i + 1);
  const t = x + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(s);
}

/** ln B(a, b) = ln Γ(a) + ln Γ(b) − ln Γ(a + b). */
export const lbeta = (a: number, b: number) => lgamma(a) + lgamma(b) - lgamma(a + b);

/** The Beta(a, b) density at p (0 outside (0, 1)). */
export function betaPdf(p: number, a: number, b: number): number {
  if (p <= 0 || p >= 1) {
    // the ends: finite only when the exponent there is 0
    if (p === 0 && a === 1) return Math.exp(-lbeta(a, b));
    if (p === 1 && b === 1) return Math.exp(-lbeta(a, b));
    return 0;
  }
  return Math.exp((a - 1) * Math.log(p) + (b - 1) * Math.log(1 - p) - lbeta(a, b));
}

export const betaMean = (a: number, b: number) => a / (a + b);
export const betaSd = (a: number, b: number) => Math.sqrt((a * b) / ((a + b) ** 2 * (a + b + 1)));

/** P(p > x) under Beta(a, b), by Simpson's rule on a fine grid (good to ~4 digits for a, b ≥ 1). */
export function betaAbove(x: number, a: number, b: number, n = 2000): number {
  const h = (1 - x) / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const p = Math.min(1 - 1e-12, Math.max(1e-12, x + i * h));
    s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * betaPdf(p, a, b);
  }
  return Math.min(1, Math.max(0, (s * h) / 3));
}

/** One Beta(a, b) draw for whole-number a, b: X/(X + Y) with X, Y sums of a and b exponentials. */
export function betaDraw(a: number, b: number, rnd: () => number): number {
  let x = 0, y = 0;
  for (let i = 0; i < a; i++) x -= Math.log(1 - rnd());
  for (let i = 0; i < b; i++) y -= Math.log(1 - rnd());
  return x / (x + y);
}

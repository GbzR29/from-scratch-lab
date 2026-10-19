// ── Counting helpers for the statistical-mechanics figures ────────────────────
// Numbers of arrangements grow like factorials, far beyond what a float can
// hold, so everything is done with their natural logarithms.

/** ln Γ(x) for x > 0 (Lanczos approximation, about 15 correct digits). */
export function lnGamma(x: number): number {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const tt = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(tt) - tt + Math.log(a);
}

/** ln n! */
export const lnFact = (n: number) => lnGamma(n + 1);

/** ln Ω for an Einstein solid: N oscillators sharing q quanta, Ω = (q + N − 1)! / (q! (N − 1)!). */
export const lnOmega = (N: number, q: number) => lnFact(q + N - 1) - lnFact(q) - lnFact(N - 1);

/** "1 in 10^k" style text for a probability given by its natural log. */
export function oneIn(lnP: number): string {
  const k = -lnP / Math.LN10;
  if (k < 6) return `1 / ${Math.round(Math.exp(-lnP))}`;
  return `1 / 10^${Math.round(k)}`;
}

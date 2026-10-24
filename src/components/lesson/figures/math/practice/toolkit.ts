// ── Practice generators: the equation toolkit ─────────────────────────────────
// Cross-multiplying two fractions, a square-root equation whose squaring adds
// a fake root (only the real one is the answer), the conjugate trick on
// √(x + a) − √x = c, and the substitution u = x² in x⁴ − (p + q)x² + pq = 0.
// Same rule as algebra.ts: the answer is chosen first and the question is
// built around it.

import { fr } from "./frac";
import { pick, ri, type Gen, type Level, type Problem } from "./problem";
import { terms } from "./algebra";

const amber = (s: string) => `\\amber{${s}}`;
const one = (x: number) => ({ label: "x", answer: { kind: "num" as const, value: fr(x) } });
/** "x + 3", "x - 2", "x" */
const shift = (b: number) => terms([[1, "x"], [b, ""]]);

// ── a/(x + b) = c/(x + d), cross-multiplied ──
export const crossMul: Gen = (lv: Level) => {
  for (;;) {
    const x = ri(-6, 8), b = ri(-6, 6), d = ri(-6, 6), k = lv === 1 ? 1 : pick([1, 2, 3]);
    const a = k * (x + b), c = k * (x + d);
    if (b === d || a <= 0 || c <= 0 || a > 24 || c > 24) continue;
    const show = `\\frac{${a}}{${shift(b)}} = \\frac{${c}}{${shift(d)}}`;
    return {
      key: `cm:${a}:${b}:${c}:${d}`, ask: ["mpr_solveX", "Solve for x"], tex: show,
      steps: [show,
        `${a}(${shift(d)}) = ${c}(${shift(b)})`,
        `${terms([[a, "x"], [a * d, ""]])} = ${terms([[c, "x"], [c * b, ""]])}`,
        `${terms([[a - c, "x"]])} = ${c * b - a * d}`,
        `x = ${amber(String(x))}\\qquad ${shift(b)} = ${x + b} \\ne 0,\\ \\ ${shift(d)} = ${x + d} \\ne 0\\ \\checkmark`],
      short: `x = ${x}`, fields: [one(x)],
    } satisfies Problem;
  }
};

// ── √(x + a) = x + b: squaring gives two candidates, one of them fake ──
export const radical: Gen = (lv: Level) => {
  for (;;) {
    const b = lv === 1 ? pick([-1, -2]) : ri(-4, 2);
    const r = ri(Math.max(-b, 2 - b), 9 - b);                // the real root: r + b ≥ 0 and the fake one below −b
    const f = 1 - 2 * b - r, a = b * b - r * f;
    if (f === r || f + b >= 0 || Math.abs(a) > 30) continue;
    const show = `\\sqrt{${shift(a)}} = ${shift(b)}`;
    const B = 2 * b - 1, C = b * b - a;
    return {
      key: `rd:${a}:${b}`, ask: ["mpr_tkReal", "Solve, and keep only the real solutions"], tex: show,
      steps: [show,
        b ? `${shift(a)} = (${shift(b)})^2 = ${terms([[1, "x^2"], [2 * b, "x"], [b * b, ""]])}` : `${shift(a)} = x^2`,
        `${terms([[1, "x^2"], [B, "x"], [C, ""]])} = 0`,
        `(${shift(-r)})(${shift(-f)}) = 0 \\;\\Rightarrow\\; x = ${r},\\ \\ x = ${f}`,
        `x = ${f}:\\ \\sqrt{${f + a}} = ${Math.sqrt(f + a)} \\ne ${f + b}\\ \\ \\red{\\times}`,
        `x = ${r}:\\ \\sqrt{${r + a}} = ${r + b}\\ \\checkmark \\;\\Rightarrow\\; x = ${amber(String(r))}`],
      short: `x = ${r}`, fields: [one(r)],
    } satisfies Problem;
  }
};

// ── √(x + a) − √x = c: multiply by the conjugate ──
export const conjugate: Gen = (lv: Level) => {
  const s = ri(lv === 1 ? 1 : 0, lv === 3 ? 9 : 5), t = s + (lv === 1 ? 1 : ri(1, 3));
  const a = t * t - s * s, c = t - s;
  const show = `\\sqrt{x + ${a}} - \\sqrt{x} = ${c}`;
  return {
    key: `cj:${a}:${c}`, ask: ["mpr_solveX", "Solve for x"], tex: show,
    steps: [show,
      `\\frac{(x + ${a}) - x}{\\sqrt{x + ${a}} + \\sqrt{x}} = ${c} \\;\\Rightarrow\\; \\sqrt{x + ${a}} + \\sqrt{x} = \\frac{${a}}{${c}} = ${s + t}`,
      `(\\sqrt{x + ${a}} + \\sqrt{x}) - (\\sqrt{x + ${a}} - \\sqrt{x}) = ${s + t} - ${c} \\;\\Rightarrow\\; 2\\sqrt{x} = ${2 * s}`,
      `\\sqrt{x} = ${s} \\;\\Rightarrow\\; x = ${amber(String(s * s))}`],
    short: `x = ${s * s}`, fields: [one(s * s)],
  } satisfies Problem;
};

// ── x⁴ − (p + q)x² + pq = 0 with u = x² ──
export const substitution: Gen = (lv: Level) => {
  const roots = lv === 1 ? [1, 2, 3] : [1, 2, 3, 4, 5];
  let m = pick(roots), n = pick(roots);
  while (n === m) n = pick(roots);
  if (m > n) [m, n] = [n, m];
  const p = m * m, q = n * n;
  const show = `${terms([[1, "x^4"], [-(p + q), "x^2"], [p * q, ""]])} = 0`;
  const label = (i: number) => `x_${i + 1}`;
  return {
    key: `su:${p}:${q}`, ask: ["mpr_roots4", "Find all four solutions"], tex: show, unordered: true,
    steps: [show,
      `u = x^2:\\quad ${terms([[1, "u^2"], [-(p + q), "u"], [p * q, ""]])} = 0`,
      `(u - ${p})(u - ${q}) = 0 \\;\\Rightarrow\\; u = ${p},\\ \\ u = ${q}`,
      `x^2 = ${p} \\Rightarrow x = \\pm ${m},\\quad x^2 = ${q} \\Rightarrow x = \\pm ${n}`,
      amber(`${-n},\\ ${-m},\\ ${m},\\ ${n}`)],
    short: `\\pm ${m},\\ \\pm ${n}`,
    fields: [-n, -m, m, n].map((x, i) => ({ label: label(i), answer: { kind: "num" as const, value: fr(x) } })),
  } satisfies Problem;
};

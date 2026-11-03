// ── Practice generators: limits at infinity ───────────────────────────────────
// Four families, each solved by the chapter's one idea (divide by the fastest-
// growing term) and each with a finite answer, so it can be typed:
//   rational — a ratio of polynomials whose top degree is at most the bottom's:
//              equal degrees give the ratio of the leading coefficients, a
//              smaller top degree gives 0;
//   root     — √(a²x² + bx + c)/(px + q): ±a/p, the sign set by |x| = ±x;
//   conj     — √(a²x² + bx + c) − ax at +∞ (∞ − ∞): the conjugate gives b/2a;
//   exp      — exponentials over exponentials: divide by the biggest base.
// The answer is read off the same numbers that build the question, so the key
// is right by construction.

import { fr, texFrac } from "./frac";
import { nz, pick, ri, sgn, type Gen, type Level, type Problem } from "./problem";
import { until } from "./arithmetic";

const amber = (s: string) => `\\amber{${s}}`;
const field = (n: number, d = 1) => ({ label: "L", answer: { kind: "num" as const, value: fr(n, d) } });
const limTo = (side: 1 | -1) => `\\lim_{x \\to ${side === 1 ? "+" : "-"}\\infty}`;
const xp = (p: number) => (p === 0 ? "" : p === 1 ? "x" : `x^{${p}}`);

/** A signed sum: [[3, "x^{2}"], [-1, "x"], [5, ""]] → "3x^{2} - x + 5"; a body starting with a digit gets a ·. */
function sum(cs: [number, string][]): string {
  let s = "";
  for (const [c, body] of cs) {
    if (!c) continue;
    const a = Math.abs(c);
    const t = !body ? `${a}` : a === 1 ? body : /^\d/.test(body) ? `${a} \\cdot ${body}` : `${a}${body}`;
    s += s ? ` ${c < 0 ? "-" : "+"} ${t}` : `${c < 0 ? "-" : ""}${t}`;
  }
  return s || "0";
}
/** c·xᵖ divided by xⁿ (p ≤ n): c, or c over x^(n − p), as one signed item for `over`. */
const shrunk = (c: number, p: number, n: number): [number, string] => [c, p === n ? "" : `\\frac{${Math.abs(c)}}{${xp(n - p)}}`];
/** Like sum, but an item whose body is a \frac already carries its own number. */
function sumOver(cs: [number, string][]): string {
  let s = "";
  for (const [c, body] of cs) {
    if (!c) continue;
    const t = body || `${Math.abs(c)}`;
    s += s ? ` ${c < 0 ? "-" : "+"} ${t}` : `${c < 0 ? "-" : ""}${t}`;
  }
  return s || "0";
}

// ── 1. Ratios of polynomials ──
export const limRational: Gen = (lv: Level): Problem => until(() => {
  const n = lv === 1 ? pick([1, 2]) : pick([2, 3]);
  const m = Math.random() < 0.6 ? n : Math.max(0, n - pick([1, 2]));
  const side: 1 | -1 = lv === 1 ? 1 : sgn() as 1 | -1;
  const lead = (lo: number, hi: number) => (lv === 1 ? ri(1, hi) : nz(lo, hi));
  const a = lead(-9, 9), b = lead(-6, 6);
  // top: a·xᵐ plus one or two lower terms; bottom: b·xⁿ plus one or two lower terms
  const top: [number, number][] = [[a, m]], bot: [number, number][] = [[b, n]];
  for (let p = m - 1; p >= 0; p--) if (p === 0 || Math.random() < 0.6) top.push([nz(-9, 9), p]);
  for (let p = n - 1; p >= 0; p--) if (p === 0 || Math.random() < 0.6) bot.push([nz(-9, 9), p]);
  if (lv === 3) { top.reverse(); bot.reverse(); }           // leading term written last: find it yourself
  const show = (ts: [number, number][]) => sum(ts.map(([c, p]) => [c, xp(p)]));
  const div = (ts: [number, number][]) => sumOver(ts.map(([c, p]) => shrunk(c, p, n)));
  const L = m === n ? fr(a, b) : fr(0);
  const zeroTop = m < n;
  return {
    key: `li:r:${side}:${top.join(";")}/${bot.join(";")}`,
    ask: ["mpr_liAsk", "Find the limit L."],
    tex: `${limTo(side)} \\frac{${show(top)}}{${show(bot)}}`,
    steps: [
      `= ${limTo(side)} \\frac{(${show(top)}) / ${xp(n)}}{(${show(bot)}) / ${xp(n)}} = ${limTo(side)} \\frac{${div(top)}}{${div(bot)}}`,
      `\\to \\frac{${zeroTop ? 0 : a}}{${b}}`,
      `L = ${amber(texFrac(L))}`,
    ],
    short: `L = ${texFrac(L)}`, fields: [field(L.n, L.d)],
  };
}, (p) => p.tex.length < 140);

// ── 2. A square root over a line: |x| = ±x ──
export const limRoot: Gen = (lv: Level): Problem => {
  const a = ri(1, lv === 1 ? 3 : 5), A = a * a;
  const b = nz(-9, 9), c = lv === 1 ? 0 : ri(-9, 9);
  const p = lv === 1 ? ri(1, 5) : nz(-5, 5), q = nz(-9, 9);
  const side: 1 | -1 = lv === 1 ? 1 : lv === 2 ? sgn() as 1 | -1 : (Math.random() < 0.7 ? -1 : 1);
  const inner = sum([[A, "x^{2}"], [b, "x"], [c, ""]]);
  const innerDiv = sumOver([[A, ""], [b, `\\frac{${Math.abs(b)}}{x}`], [c, `\\frac{${Math.abs(c)}}{x^{2}}`]]);
  const L = fr(side * a, p);
  return {
    key: `li:q:${side}:${A}:${b}:${c}:${p}:${q}`,
    ask: ["mpr_liAsk", "Find the limit L."],
    tex: `${limTo(side)} \\frac{\\sqrt{${inner}}}{${sum([[p, "x"], [q, ""]])}}`,
    steps: [
      `\\sqrt{${inner}} = |x|\\sqrt{${innerDiv}}, \\quad |x| = ${side === 1 ? "x" : "-x"}`,
      `= ${limTo(side)} \\frac{${side === 1 ? "" : "-"}\\sqrt{${innerDiv}}}{${sumOver([[p, ""], [q, `\\frac{${Math.abs(q)}}{x}`]])}} \\to \\frac{${side === 1 ? "" : "-"}\\sqrt{${A}}}{${p}}`,
      `L = ${amber(texFrac(L))}`,
    ],
    short: `L = ${texFrac(L)}`, fields: [field(L.n, L.d)],
  };
};

// ── 3. ∞ − ∞: multiply by the conjugate ──
export const limConj: Gen = (lv: Level): Problem => {
  const a = lv === 3 ? ri(2, 4) : 1, A = a * a;
  const b = lv === 1 ? 2 * nz(-6, 6) : nz(-12, 12), c = ri(-9, 9);
  const inner = sum([[A, "x^{2}"], [b, "x"], [c, ""]]);
  const ax = sum([[a, "x"]]);
  const L = fr(b, 2 * a);
  return {
    key: `li:c:${A}:${b}:${c}`,
    ask: ["mpr_liAsk", "Find the limit L."],
    tex: `\\lim_{x \\to +\\infty} \\left(\\sqrt{${inner}} - ${ax}\\right)`,
    steps: [
      `= \\frac{(${inner}) - ${sum([[A, "x^{2}"]])}}{\\sqrt{${inner}} + ${ax}} = \\frac{${sum([[b, "x"], [c, ""]])}}{\\sqrt{${inner}} + ${ax}}`,
      `= \\frac{${sumOver([[b, ""], [c, `\\frac{${Math.abs(c)}}{x}`]])}}{\\sqrt{${sumOver([[A, ""], [b, `\\frac{${Math.abs(b)}}{x}`], [c, `\\frac{${Math.abs(c)}}{x^{2}}`]])}} + ${a}} \\to \\frac{${b}}{${a} + ${a}}`,
      `L = ${amber(texFrac(L))}`,
    ],
    short: `L = ${texFrac(L)}`, fields: [field(L.n, L.d)],
  };
};

// ── 4. Exponentials: divide by the biggest base ──
export const limExp: Gen = (lv: Level): Problem => {
  const side: 1 | -1 = lv === 1 ? 1 : sgn() as 1 | -1;
  if (lv === 3 && Math.random() < 0.6) {
    // (a·3ˣ + c·2ˣ)/(b·3ˣ + d·2ˣ): +∞ keeps the 3ˣ terms, −∞ keeps the 2ˣ terms
    const a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-6, 6);
    const [big, small] = side === 1 ? ["3", "2"] : ["2", "3"];
    const ratio = side === 1 ? "\\left(\\tfrac{2}{3}\\right)^{x}" : "\\left(\\tfrac{3}{2}\\right)^{x}";
    const [u, v, w, z] = side === 1 ? [a, c, b, d] : [c, a, d, b];   // kept, vanishing, on top and below
    const L = fr(u, w);
    return {
      key: `li:e2:${side}:${a}:${b}:${c}:${d}`,
      ask: ["mpr_liAsk", "Find the limit L."],
      tex: `${limTo(side)} \\frac{${sum([[a, "3^{x}"], [c, "2^{x}"]])}}{${sum([[b, "3^{x}"], [d, "2^{x}"]])}}`,
      steps: [
        `${small}^{x} \\ll ${big}^{x}: \\; \\div\\, ${big}^{x}`,
        `= ${limTo(side)} \\frac{${sum([[u, ""], [v, ratio]])}}{${sum([[w, ""], [z, ratio]])}} \\to \\frac{${u}}{${w}}`,
        `L = ${amber(texFrac(L))}`,
      ],
      short: `L = ${texFrac(L)}`, fields: [field(L.n, L.d)],
    };
  }
  const k = pick([2, 3, 5]), K = `${k}^{x}`;
  const a = lv === 1 ? ri(1, 9) : nz(-9, 9), b = lv === 1 ? ri(1, 6) : nz(-6, 6), p = nz(-9, 9), q = nz(-6, 6);
  const L = side === 1 ? fr(a, b) : fr(p, q);
  return {
    key: `li:e:${side}:${k}:${a}:${b}:${p}:${q}`,
    ask: ["mpr_liAsk", "Find the limit L."],
    tex: `${limTo(side)} \\frac{${sum([[a, K], [p, ""]])}}{${sum([[b, K], [q, ""]])}}`,
    steps: side === 1
      ? [`= ${limTo(1)} \\frac{${sumOver([[a, ""], [p, `\\frac{${Math.abs(p)}}{${K}}`]])}}{${sumOver([[b, ""], [q, `\\frac{${Math.abs(q)}}{${K}}`]])}}`, `\\to \\frac{${a}}{${b}}`, `L = ${amber(texFrac(L))}`]
      : [`${K} \\to 0 \\quad (x \\to -\\infty)`, `\\to \\frac{${a} \\cdot 0 ${p < 0 ? "-" : "+"} ${Math.abs(p)}}{${b} \\cdot 0 ${q < 0 ? "-" : "+"} ${Math.abs(q)}} = \\frac{${p}}{${q}}`, `L = ${amber(texFrac(L))}`],
    short: `L = ${texFrac(L)}`, fields: [field(L.n, L.d)],
  };
};

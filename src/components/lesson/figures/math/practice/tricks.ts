// ── Practice generators: the algebra tricks chapters ──────────────────────────
// Tricks I: mental products with the notable products ((m + d)(m − d),
// (m ± d)², (10a + 5)²) and rationalising c/(k ∓ √n) into a + b√n.
// Tricks II: symmetric expressions of the roots from the sum and the product
// alone, coefficient sums by plugging in 1, −1 or 0, and x + 1/x = k powers.
// Same rule as algebra.ts: the answer is chosen first and the question is
// built around it, so the key is right by construction.

import { add, div, fr, mul, pow, sub, texFrac, type Frac } from "./frac";
import { pick, ri, sgn, type Gen, type Level, type Problem } from "./problem";
import { terms } from "./algebra";

const amber = (s: string) => `\\amber{${s}}`;
const num = (label: string, x: Frac) => ({ label, answer: { kind: "num" as const, value: x } });
const NON_SQUARES = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30];

// ── Notable products in your head ──
export const notable: Gen = (lv: Level) => {
  const round = lv === 1 ? 10 * ri(2, 9) : lv === 2 ? pick([50, 100, 200, 300]) : pick([100, 200, 500, 1000]);
  const d = ri(1, lv === 1 ? 4 : 9);
  const kind = lv === 1 ? "diff" : pick(["diff", "sqMinus", "sqPlus", "five"] as const);
  if (kind === "five") {
    const a = ri(lv === 2 ? 1 : 10, lv === 2 ? 9 : 19), v = 100 * a * (a + 1) + 25;
    return {
      key: `nt5:${a}`, ask: ["mpr_trHead", "Compute it in your head"], tex: `${10 * a + 5}^2`,
      steps: [`${10 * a + 5}^2 = (10\\cdot ${a} + 5)^2`,
        `= 100\\cdot ${a}^2 + 100\\cdot ${a} + 25 = 100\\cdot ${a}\\cdot ${a + 1} + 25`,
        `= ${100 * a * (a + 1)} + 25 = ${amber(String(v))}`],
      short: String(v), fields: [num("", fr(v))],
    } satisfies Problem;
  }
  if (kind === "diff") {
    const v = round * round - d * d;
    return {
      key: `ntd:${round}:${d}`, ask: ["mpr_trHead", "Compute it in your head"], tex: `${round + d} \\cdot ${round - d}`,
      steps: [`${round + d} \\cdot ${round - d} = (${round} + ${d})(${round} - ${d})`,
        `= ${round}^2 - ${d}^2 = ${round * round} - ${d * d}`,
        `= ${amber(String(v))}`],
      short: String(v), fields: [num("", fr(v))],
    } satisfies Problem;
  }
  const s = kind === "sqPlus" ? 1 : -1, x = round + s * d, v = x * x;
  const op = s > 0 ? "+" : "-";
  return {
    key: `nts:${x}`, ask: ["mpr_trHead", "Compute it in your head"], tex: `${x}^2`,
    steps: [`${x}^2 = (${round} ${op} ${d})^2`,
      `= ${round}^2 ${op} 2\\cdot ${round}\\cdot ${d} + ${d}^2 = ${round * round} ${op} ${2 * round * d} + ${d * d}`,
      `= ${amber(String(v))}`],
    short: String(v), fields: [num("", fr(v))],
  } satisfies Problem;
};

// ── c/(k ∓ √n) = a + b√n ──
export const rationalise: Gen = (lv: Level) => {
  for (;;) {
    const n = pick(NON_SQUARES), k = ri(1, 5), sg = lv === 3 ? sgn() : -1;
    const q = k * k - n;                                    // (k + sg√n)(k − sg√n) = k² − n
    if (q === 0 || Math.abs(q) > (lv === 1 ? 3 : 12)) continue;
    const c = lv === 1 ? q * ri(1, 3) * (q < 0 ? -1 : 1) : ri(1, 9);
    const a = fr(c * k, q), b = fr(-sg * c, q);
    const op = sg > 0 ? "+" : "-", co = sg > 0 ? "-" : "+";
    const show = `\\frac{${c}}{${k} ${op} \\sqrt{${n}}}`;
    return {
      key: `ra:${c}:${k}:${sg}:${n}`, ask: ["mpr_trRat", "Multiply by the conjugate, then write it as a + b√n. Find a and b"],
      tex: `${show} = a + b\\sqrt{${n}}`,
      steps: [show,
        `= \\frac{${c}\\,(${k} ${co} \\sqrt{${n}})}{(${k} ${op} \\sqrt{${n}})(${k} ${co} \\sqrt{${n}})} = \\frac{${c}\\,(${k} ${co} \\sqrt{${n}})}{${k}^2 - ${n}}`,
        `= \\frac{${c * k} ${co} ${c}\\sqrt{${n}}}{${q}}`,
        `a = ${amber(texFrac(a))},\\quad b = ${amber(texFrac(b))}`],
      short: `a = ${texFrac(a)},\\ b = ${texFrac(b)}`, fields: [num("a", a), num("b", b)],
    } satisfies Problem;
  }
};

// ── Symmetric expressions of the roots from s = r + q and p = rq ──
export const vieta: Gen = (lv: Level) => {
  for (;;) {
    const a = lv === 1 ? 1 : pick([1, 1, 2, 3]), b = ri(-9, 9), c = ri(-9, 9);
    if (!b || !c) continue;
    const s = fr(-b, a), p = fr(c, a);
    const kinds = lv === 1 ? ["sq", "diff"] as const : lv === 2 ? ["sq", "inv", "diff"] as const : ["inv", "cube", "invsq"] as const;
    const kind = pick(kinds);
    const quad = `${terms([[a, "x^2"], [b, "x"], [c, ""]])} = 0`;
    const sp = [`r + q = -\\frac{b}{a} = ${texFrac(s)},\\qquad rq = \\frac{c}{a} = ${texFrac(p)}`];
    let ask: string, steps: string[], v: Frac;
    if (kind === "sq") {
      ask = "r^2 + q^2"; v = sub(pow(s, 2), mul(fr(2), p));
      steps = [`r^2 + q^2 = (r + q)^2 - 2rq = (${texFrac(s)})^2 - 2\\cdot(${texFrac(p)})`];
    } else if (kind === "diff") {
      ask = "(r - q)^2"; v = sub(pow(s, 2), mul(fr(4), p));
      steps = [`(r - q)^2 = (r + q)^2 - 4rq = (${texFrac(s)})^2 - 4\\cdot(${texFrac(p)})`];
    } else if (kind === "inv") {
      ask = "\\frac{1}{r} + \\frac{1}{q}"; v = div(s, p);
      steps = [`\\frac{1}{r} + \\frac{1}{q} = \\frac{q + r}{rq} = \\frac{${texFrac(s)}}{${texFrac(p)}}`];
    } else if (kind === "cube") {
      ask = "r^3 + q^3"; v = sub(pow(s, 3), mul(fr(3), mul(s, p)));
      steps = [`r^3 + q^3 = (r + q)^3 - 3rq\\,(r + q) = (${texFrac(s)})^3 - 3\\cdot(${texFrac(p)})(${texFrac(s)})`];
    } else {
      ask = "\\frac{1}{r^2} + \\frac{1}{q^2}"; v = div(sub(pow(s, 2), mul(fr(2), p)), pow(p, 2));
      steps = [`\\frac{1}{r^2} + \\frac{1}{q^2} = \\frac{r^2 + q^2}{(rq)^2} = \\frac{(r + q)^2 - 2rq}{(rq)^2}`];
    }
    if (Math.abs(v.n) > 2000 || v.d > 200) continue;
    return {
      key: `vi:${a}:${b}:${c}:${kind}`, ask: ["mpr_trVieta", "r and q are the roots. Find this without solving"],
      tex: `${quad}\\qquad ${ask} = \\;?`,
      steps: [quad, ...sp, ...steps, `= ${amber(texFrac(v))}`],
      short: `${ask} = ${texFrac(v)}`, fields: [num("", v)],
    } satisfies Problem;
  }
};

// ── Coefficient sums of (ax + b)ⁿ by plugging in 1, −1 or 0 ──
export const coefSum: Gen = (lv: Level) => {
  for (;;) {
    const a = pick([-3, -2, -1, 1, 2, 3]), b = pick([-3, -2, -1, 1, 2, 3]), n = ri(lv === 1 ? 2 : 3, lv === 1 ? 4 : 6);
    const P = (x: number) => fr((a * x + b) ** n);
    const kind = lv === 1 ? "all" : lv === 2 ? pick(["alt", "const"] as const) : pick(["even", "odd"] as const);
    const poly = `(${terms([[a, "x"], [b, ""]])})^{${n}}`;
    const at = (x: number) => `P(${x}) = (${a * x + b})^{${n}} = ${P(x).n}`;
    let ask: [string, string], steps: string[], v: Frac;
    if (kind === "all") {
      ask = ["mpr_trSumAll", "Find the sum of all its coefficients"]; v = P(1);
      steps = [`c_0 + c_1 + c_2 + \\dots = P(1)`, at(1)];
    } else if (kind === "alt") {
      ask = ["mpr_trSumAlt", "Find c₀ − c₁ + c₂ − c₃ + …, the coefficients with alternating signs"]; v = P(-1);
      steps = [`c_0 - c_1 + c_2 - \\dots = P(-1)`, at(-1)];
    } else if (kind === "const") {
      ask = ["mpr_trConst", "Find the constant term"]; v = P(0);
      steps = [`c_0 = P(0)`, at(0)];
    } else if (kind === "even") {
      ask = ["mpr_trEven", "Find the sum of the coefficients of the even powers (x⁰, x², x⁴, …)"]; v = div(add(P(1), P(-1)), fr(2));
      steps = [`c_0 + c_2 + c_4 + \\dots = \\frac{P(1) + P(-1)}{2}`, at(1), at(-1), `\\frac{${P(1).n} + (${P(-1).n})}{2}`];
    } else {
      ask = ["mpr_trOdd", "Find the sum of the coefficients of the odd powers (x¹, x³, x⁵, …)"]; v = div(sub(P(1), P(-1)), fr(2));
      steps = [`c_1 + c_3 + c_5 + \\dots = \\frac{P(1) - P(-1)}{2}`, at(1), at(-1), `\\frac{${P(1).n} - (${P(-1).n})}{2}`];
    }
    if (Math.abs(v.n) > 5000) continue;
    return {
      key: `cs:${a}:${b}:${n}:${kind}`, ask, tex: `P(x) = ${poly}`,
      steps: [`P(x) = ${poly}`, ...steps, `= ${amber(texFrac(v))}`],
      short: texFrac(v), fields: [num("", v)],
    } satisfies Problem;
  }
};

// ── x ± 1/x = k: higher powers without finding x ──
export const reciprocal: Gen = (lv: Level) => {
  const k = pick([-5, -4, -3, -2, 2, 3, 4, 5]);
  const minus = lv > 1 && Math.random() < 0.4;
  const kind = lv === 1 ? "sq" : lv === 2 ? pick(["sq", "cube"] as const) : pick(["cube", "four"] as const);
  const K = fr(k), two = fr(2);
  const given = minus ? `x - \\frac{1}{x} = ${k}` : `x + \\frac{1}{x} = ${k}`;
  // With minus, (x − 1/x)² = x² − 2 + 1/x², so x² + 1/x² = k² + 2.
  const sq = minus ? add(pow(K, 2), two) : sub(pow(K, 2), two);
  const sqLine = minus
    ? `\\left(x - \\frac{1}{x}\\right)^2 = x^2 - 2 + \\frac{1}{x^2} \\;\\Rightarrow\\; x^2 + \\frac{1}{x^2} = ${k}^2 + 2 = ${sq.n}`
    : `\\left(x + \\frac{1}{x}\\right)^2 = x^2 + 2 + \\frac{1}{x^2} \\;\\Rightarrow\\; x^2 + \\frac{1}{x^2} = ${k}^2 - 2 = ${sq.n}`;
  let ask: string, steps: string[], v: Frac;
  if (kind === "sq") {
    ask = `x^2 + \\frac{1}{x^2}`; v = sq; steps = [sqLine];
  } else if (kind === "cube") {
    // (x ∓ 1/x)³ = x³ ∓ 1/x³ − (±)3(x ∓ 1/x) → x³ − 1/x³ = k³ + 3k (minus), x³ + 1/x³ = k³ − 3k (plus)
    if (minus) {
      ask = `x^3 - \\frac{1}{x^3}`; v = add(pow(K, 3), mul(fr(3), K));
      steps = [`\\left(x - \\frac{1}{x}\\right)^3 = x^3 - \\frac{1}{x^3} - 3\\left(x - \\frac{1}{x}\\right)`, `x^3 - \\frac{1}{x^3} = ${k}^3 + 3\\cdot(${k})`];
    } else {
      ask = `x^3 + \\frac{1}{x^3}`; v = sub(pow(K, 3), mul(fr(3), K));
      steps = [`\\left(x + \\frac{1}{x}\\right)^3 = x^3 + \\frac{1}{x^3} + 3\\left(x + \\frac{1}{x}\\right)`, `x^3 + \\frac{1}{x^3} = ${k}^3 - 3\\cdot(${k})`];
    }
  } else {
    ask = `x^4 + \\frac{1}{x^4}`; v = sub(pow(sq, 2), two);
    steps = [sqLine, `\\left(x^2 + \\frac{1}{x^2}\\right)^2 = x^4 + 2 + \\frac{1}{x^4} \\;\\Rightarrow\\; x^4 + \\frac{1}{x^4} = ${sq.n}^2 - 2`];
  }
  return {
    key: `rc:${k}:${minus ? 1 : 0}:${kind}`, ask: ["mpr_trRecip", "Find this without finding x"],
    tex: `${given}\\qquad ${ask} = \\;?`,
    steps: [given, ...steps, `= ${amber(texFrac(v))}`],
    short: texFrac(v), fields: [num("", v)],
  } satisfies Problem;
};

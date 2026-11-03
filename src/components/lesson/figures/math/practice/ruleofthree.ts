// ── Practice generators: rule of three ────────────────────────────────────────
// Simple direct (unit rate, and "b is p % of what?"), simple inverse (a fixed
// product: workers × days, speed × time, taps × hours) and compound (two or
// three quantities, all direct or mixed). Like the combinatorics generators,
// the story lives in the translated instruction (`ask`) and the TeX holds only
// the letters' values, so nothing in it needs translating. Every problem is
// built backwards from a whole-number answer, through the constant the
// quantities share, so the key is right by construction.

import { fr } from "./frac";
import { pick, ri, type Gen, type Level, type Problem } from "./problem";
import { until } from "./arithmetic";

const amber = (s: string | number) => `\\amber{${s}}`;
const num = (x: number) => ({ label: "x", answer: { kind: "num" as const, value: fr(x) } });
const vals = (o: Record<string, number>) => Object.entries(o).map(([k, v]) => `${k} = ${v}`).join(",\\quad ");

// ── 1. Simple, direct ──
export const r3Direct: Gen = (lv: Level): Problem => {
  const story = lv === 1 ? pick(["price", "fuel"]) : lv === 2 ? pick(["price", "fuel", "print"]) : pick(["print", "pct"]);
  if (story === "pct") {
    // b is p % of x: b/x = p/100
    const p = pick([4, 5, 8, 12, 15, 20, 25, 30, 35, 40, 60, 75]), x = ri(2, 40) * (100 / gcd(p, 100)), b = x * p / 100;
    return {
      key: `r3d:pct:${p}:${b}`, ask: ["mpr_r3Pct", "b is p % of a number x. What is x?"],
      tex: vals({ b, p }),
      steps: [`\\frac{${b}}{x} = \\frac{${p}}{100}`, `x = \\frac{${b} \\cdot 100}{${p}}`, `x = \\frac{${b * 100}}{${p}} = ${amber(x)}`],
      short: `x = ${x}`, fields: [num(x)],
    };
  }
  const u = lv === 1 ? ri(2, 9) : ri(3, 25);
  const a = ri(2, lv === 1 ? 6 : 12);
  const c = until(() => ri(2, lv === 1 ? 12 : 40), (v) => v !== a);
  const b = a * u, x = c * u;
  const ask: [string, string] = story === "price" ? ["mpr_r3Price", "a kg of coffee cost b. How much do c kg cost?"]
    : story === "fuel" ? ["mpr_r3Fuel", "A car covers b km on a litres. How far does it go on c litres?"]
    : ["mpr_r3Print", "A printer prints b pages in a minutes. How many pages in c minutes?"];
  return {
    key: `r3d:${story}:${a}:${b}:${c}`, ask, tex: vals({ a, b, c }),
    steps: [`\\frac{${a}}{${c}} = \\frac{${b}}{x}`, `${a}\\,x = ${b} \\cdot ${c}`, `x = \\frac{${b * c}}{${a}} = ${amber(x)}`],
    short: `x = ${x}`, fields: [num(x)],
  };
};

// ── 2. Simple, inverse: the product stays the same ──
const SPEEDS = [40, 45, 50, 60, 72, 75, 80, 90, 100, 120];
export const r3Inverse: Gen = (lv: Level): Problem => {
  const story = lv === 1 ? "workers" : pick(lv === 2 ? ["workers", "taps"] : ["speed", "taps", "workers"]);
  let a: number, b: number, c: number;
  if (story === "speed") {
    [a, b, c] = until(() => {
      const a = pick(SPEEDS), b = ri(2, 6), c = pick(SPEEDS);
      return [a, b, c] as const;
    }, ([a, b, c]) => a !== c && (a * b) % c === 0);
  } else {
    // pick the answer x and the other side, then split their product
    [a, b, c] = until(() => {
      const x = ri(2, lv === 1 ? 10 : 20), c = ri(2, lv === 1 ? 10 : 15), P = c * x;
      const ds = Array.from({ length: P }, (_, i) => i + 1).filter((d) => P % d === 0 && d !== c && d >= 2 && P / d >= 2 && d <= 30);
      if (!ds.length) return [0, 0, 0] as const;
      const a = pick(ds);
      return [a, P / a, c] as const;
    }, ([a]) => a > 0);
  }
  const P = a * b, x = P / c;
  const ask: [string, string] = story === "workers" ? ["mpr_r3Workers", "a workers finish a job in b days. How many days do c workers take, at the same pace?"]
    : story === "taps" ? ["mpr_r3Taps", "a equal taps fill a tank in b hours. How many hours do c taps take?"]
    : ["mpr_r3Speed", "At a km/h a trip takes b hours. How many hours at c km/h?"];
  return {
    key: `r3i:${story}:${a}:${b}:${c}`, ask, tex: vals({ a, b, c }),
    steps: [`\\frac{${b}}{x} = \\frac{${c}}{${a}}`, `${c}\\,x = ${a} \\cdot ${b} = ${P}`, `x = \\frac{${P}}{${c}} = ${amber(x)}`],
    short: `x = ${x}`, fields: [num(x)],
  };
};

// ── 3. Compound ──
export const r3Compound: Gen = (lv: Level): Problem => {
  const mixed = lv === 3 || (lv === 2 && Math.random() < 0.5);
  if (!mixed) {
    // parts = k · machines · days: all direct
    const k = ri(2, 12), a = ri(2, 8), c = ri(2, 10), b = k * a * c;
    const [d, e] = until(() => [ri(2, 9), ri(2, 12)] as const, ([d, e]) => d !== a || e !== c);
    const x = k * d * e;
    return {
      key: `r3c:m:${a}:${b}:${c}:${d}:${e}`,
      ask: ["mpr_r3Machines", "a machines make b parts in c days. How many parts do d machines make in e days?"],
      tex: vals({ a, b, c, d, e }),
      steps: [
        `\\frac{${b}}{x} = \\frac{${a}}{${d}} \\cdot \\frac{${c}}{${e}} = \\frac{${a * c}}{${d * e}}`,
        `${a * c}\\,x = ${b} \\cdot ${d * e}`,
        `x = \\frac{${b * d * e}}{${a * c}} = ${amber(x)}`,
      ],
      short: `x = ${x}`, fields: [num(x)],
    };
  }
  // metres = workers · hours/day · days / q: days is inverse to workers and hours, direct to metres
  const [a, b, c, d, e, f, g, x] = until(() => {
    const q = pick([1, 2, 3, 4]), a = ri(2, 12), b = pick([4, 5, 6, 8, 10]), d = ri(2, 20);
    const e = ri(2, 15), f = pick([4, 5, 6, 8, 10]), x = ri(2, 30);
    return [a, b, a * b * d / q, d, e, f, e * f * x / q, x] as const;
  }, ([a, b, c, d, e, f, g, x]) => Number.isInteger(c) && Number.isInteger(g) && c !== g && (a !== e || b !== f) && c <= 2000 && g <= 2000 && x !== d);
  return {
    key: `r3c:w:${a}:${b}:${c}:${d}:${e}:${f}:${g}`,
    ask: ["mpr_r3Wall", "a workers, working b hours a day, build c m of wall in d days. How many days do e workers, working f hours a day, take for g m?"],
    tex: vals({ a, b, c, d, e, f, g }),
    steps: [
      `\\frac{${d}}{x} = \\frac{\\purple{${e}}}{\\purple{${a}}} \\cdot \\frac{\\purple{${f}}}{\\purple{${b}}} \\cdot \\frac{${c}}{${g}}`,
      `\\frac{${d}}{x} = \\frac{${e * f * c}}{${a * b * g}}`,
      `x = \\frac{${d} \\cdot ${a * b * g}}{${e * f * c}} = ${amber(x)}`,
    ],
    short: `x = ${x}`, fields: [num(x)],
  };
};

function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

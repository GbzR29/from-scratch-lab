// ── Practice generators: Bayesian updating and Metropolis–Hastings ────────────
// Beta–binomial (chapter likelihood-beta):
//   bbUpdate — prior Beta(a, b) + y of n → Beta(a + y, b + n − y); level 3 in two batches;
//   bbMean   — the posterior mean (a + y)/(a + b + n), also the chance the next trial succeeds;
//   bbPrior  — a and b from a mean and a strength a + b, or (level 3) from a mean and a variance;
//   bbAbove  — P(p > ½) exactly, through P(Binomial(a + b − 1, ½) ≤ a − 1).
// Metropolis–Hastings (chapter metropolis-hastings):
//   mhAlpha  — the acceptance chance with an unequal proposal matrix on a small grid;
//   mhEntry  — a transition-matrix entry q(j|i)·α, or (level 3) the staying chance;
//   mhCont   — a continuous p: random-walk ratio g(p′)/g(p) (0 off [0, 1]), or
//              (level 3) a proposal drawn from the prior, where only the likelihood ratio is left.
// Every number is an exact fraction, so the key is right by construction.

import { div, fr, mul, pow, sub, texFrac, type Frac } from "./frac";
import { pick, ri, type Gen, type Level, type Problem } from "./problem";
import { until } from "./arithmetic";

const amber = (s: string) => `\\amber{${s}}`;
const field = (label: string, v: Frac) => ({ label, answer: { kind: "num" as const, value: v } });
const lt1 = (f: Frac) => f.n < f.d;
const min1 = (f: Frac) => (lt1(f) ? f : fr(1));
const binom = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const beta = (a: number, b: number) => `\\mathrm{Beta}(${a},\\ ${b})`;

// ── Beta–binomial ──
export const bbUpdate: Gen = (lv: Level): Problem => {
  const a = ri(1, lv === 1 ? 4 : 8), b = ri(1, lv === 1 ? 4 : 8);
  if (lv === 3) {
    const n1 = ri(2, 10), y1 = ri(0, n1), n2 = ri(2, 10), y2 = ri(0, n2);
    const A = a + y1 + y2, B = b + n1 - y1 + n2 - y2;
    return {
      key: `bb:u2:${a}:${b}:${y1}:${n1}:${y2}:${n2}`,
      ask: ["mpr_bbUpdate2", "Prior Beta(a, b); a first batch gives y₁ successes in n₁ trials, a second batch y₂ in n₂. Find the final posterior Beta(a′, b′)."],
      tex: `f(p) = ${beta(a, b)}, \\quad y_1 = ${y1},\\ n_1 = ${n1}, \\quad y_2 = ${y2},\\ n_2 = ${n2}`,
      steps: [
        `${beta(a, b)} \\to ${beta(a + y1, b + n1 - y1)}`,
        `${beta(a + y1, b + n1 - y1)} \\to ${beta(A, B)}`,
        `a' = ${amber(String(A))},\\ b' = ${amber(String(B))}`,
      ],
      short: beta(A, B), fields: [field("a'", fr(A)), field("b'", fr(B))],
    };
  }
  const n = ri(1, lv === 1 ? 10 : 40), y = ri(0, n), A = a + y, B = b + n - y;
  return {
    key: `bb:u:${a}:${b}:${y}:${n}`,
    ask: ["mpr_bbUpdate", "Prior Beta(a, b), data: y successes in n trials. Find the posterior Beta(a′, b′)."],
    tex: `f(p) = ${beta(a, b)}, \\quad y = ${y},\\ n = ${n}`,
    steps: [`a' = a + y = ${a} + ${y} = ${amber(String(A))}`, `b' = b + (n - y) = ${b} + ${n - y} = ${amber(String(B))}`],
    short: beta(A, B), fields: [field("a'", fr(A)), field("b'", fr(B))],
  };
};

export const bbMean: Gen = (lv: Level): Problem => {
  const a = ri(1, lv === 1 ? 4 : 10), b = ri(1, lv === 1 ? 4 : 10), n = ri(1, lv === 1 ? 10 : 30), y = ri(0, n);
  const A = a + y, B = b + n - y, m = fr(A, A + B);
  const next = lv === 3;
  return {
    key: `bb:m:${next}:${a}:${b}:${y}:${n}`,
    ask: next ? ["mpr_bbNext", "Prior Beta(a, b), data: y successes in n trials. What is the probability that the next trial is a success?"]
      : ["mpr_bbMean", "Prior Beta(a, b), data: y successes in n trials. Find the posterior mean of p."],
    tex: `f(p) = ${beta(a, b)}, \\quad y = ${y},\\ n = ${n}`,
    steps: [
      `${beta(a + 0, b)} \\to ${beta(A, B)}`,
      `${next ? "P(\\text{next}) = E[p \\mid y]" : "E[p \\mid y]"} = \\frac{${A}}{${A} + ${B}} = \\frac{${A}}{${A + B}}`,
      `= ${amber(texFrac(m))}`,
    ],
    short: texFrac(m), fields: [field("", m)],
  };
};

export const bbPrior: Gen = (lv: Level): Problem => {
  if (lv === 3) {
    const a = ri(1, 12), b = ri(1, 12), s = a + b;
    const m = fr(a, s), v = fr(a * b, s * s * (s + 1));
    return {
      key: `bb:pv:${a}:${b}`,
      ask: ["mpr_bbPriorV", "A Beta(a, b) prior has mean m and variance v. Find a and b."],
      tex: `m = ${texFrac(m)}, \\quad v = ${texFrac(v)}`,
      steps: [
        `a + b = \\frac{m(1 - m)}{v} - 1 = \\frac{${texFrac(mul(m, sub(fr(1), m)))}}{${texFrac(v)}} - 1 = ${s}`,
        `a = m\\,(a + b) = ${texFrac(m)} \\cdot ${s} = ${amber(String(a))}`,
        `b = ${s} - ${a} = ${amber(String(b))}`,
      ],
      short: beta(a, b), fields: [field("a", fr(a)), field("b", fr(b))],
    };
  }
  const d = pick([2, 4, 5, 10]), k = ri(1, d - 1), s = d * ri(1, lv === 1 ? 3 : 6);
  const m = fr(k, d), a = (k * s) / d, b = s - a;
  return {
    key: `bb:ps:${k}:${d}:${s}`,
    ask: ["mpr_bbPrior", "A Beta(a, b) prior should have mean m and strength a + b = s (worth s imaginary trials). Find a and b."],
    tex: `m = ${texFrac(m)}, \\quad s = ${s}`,
    steps: [`a = m \\cdot s = ${texFrac(m)} \\cdot ${s} = ${amber(String(a))}`, `b = s - a = ${s} - ${a} = ${amber(String(b))}`],
    short: beta(a, b), fields: [field("a", fr(a)), field("b", fr(b))],
  };
};

export const bbAbove: Gen = (lv: Level): Problem => until(() => {
  const a = ri(1, 3), b = ri(1, 3), n = ri(1, lv === 1 ? 3 : lv === 2 ? 5 : 7), y = ri(0, n);
  const A = a + y, B = b + n - y, N = A + B - 1;
  let top = 0; const parts: string[] = [];
  for (let k = 0; k < A; k++) { top += binom(N, k); parts.push(String(binom(N, k))); }
  const P = fr(top, 2 ** N);
  return {
    key: `bb:a:${a}:${b}:${y}:${n}`,
    ask: ["mpr_bbAbove", "Prior Beta(a, b), data: y successes in n trials. Find the posterior probability that p > 1/2."],
    tex: `f(p) = ${beta(a, b)}, \\quad y = ${y},\\ n = ${n}`,
    steps: [
      `${beta(a, b)} \\to ${beta(A, B)}`,
      `P(p > \\tfrac12) = P\\big(\\mathrm{Bin}(${N}, \\tfrac12) \\le ${A - 1}\\big)`,
      `= \\frac{${parts.join(" + ")}}{2^{${N}}} = \\frac{${top}}{${2 ** N}} = ${amber(texFrac(P))}`,
    ],
    short: texFrac(P), fields: [field("", P)],
  };
}, (p) => p.tex.length > 0);

// ── Metropolis–Hastings on a small grid with an unequal proposal ──
const ROWS: [number, number][] = [[1, 2], [1, 1], [2, 1], [1, 3], [3, 1], [1, 0], [0, 1]];   // weights for the two other points
type Setup = { m: number; g: number[]; Q: Frac[][] };
function setup(lv: Level): Setup {
  const m = lv === 3 ? 4 : 3;
  const g = Array.from({ length: m }, () => ri(1, lv === 1 ? 12 : 30));
  const Q: Frac[][] = [];
  for (let i = 0; i < m; i++) {
    const row = new Array<Frac>(m).fill(fr(0));
    const others = Array.from({ length: m }, (_, j) => j).filter(j => j !== i);
    if (m === 3) {
      const [u, v] = pick(ROWS);
      row[others[0]] = fr(u, u + v); row[others[1]] = fr(v, u + v);
    } else {
      // 4 points: propose a neighbour on a ring, unequal halves
      const [u, v] = pick(ROWS.slice(0, 5));
      row[(i + 1) % m] = fr(u, u + v); row[(i + m - 1) % m] = fr(v, u + v);
    }
    Q.push(row);
  }
  return { m, g, Q };
}
const texQ = (Q: Frac[][]) => `q = \\begin{pmatrix} ${Q.map(r => r.map(texFrac).join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
const alpha = (s: Setup, i: number, j: number) => min1(div(mul(fr(s.g[j]), s.Q[j][i]), mul(fr(s.g[i]), s.Q[i][j])));
const pairs = (s: Setup) => {
  const out: [number, number][] = [];
  for (let i = 0; i < s.m; i++) for (let j = 0; j < s.m; j++) if (i !== j && s.Q[i][j].n > 0 && s.Q[j][i].n > 0) out.push([i, j]);
  return out;
};
const alphaLine = (s: Setup, i: number, j: number) =>
  `\\alpha_{${i + 1}${j + 1}} = \\min\\!\\left(1, \\frac{g_{${j + 1}}\\, q(${i + 1} \\mid ${j + 1})}{g_{${i + 1}}\\, q(${j + 1} \\mid ${i + 1})}\\right) = \\min\\!\\left(1, \\frac{${s.g[j]} \\cdot ${texFrac(s.Q[j][i])}}{${s.g[i]} \\cdot ${texFrac(s.Q[i][j])}}\\right) = ${texFrac(alpha(s, i, j))}`;

export const mhAlpha: Gen = (lv: Level): Problem => until(() => {
  const s = setup(lv), ps = pairs(s);
  if (!ps.length) throw new Error("division by zero");          // no usable pair: draw again
  const [i, j] = pick(ps), a = alpha(s, i, j);
  return {
    key: `mh:a:${s.g.join(",")}:${s.Q.map(r => r.map(texFrac).join(",")).join(";")}:${i}${j}`,
    ask: ["mpr_mhAlpha", "Target weights g and proposal matrix q (row i lists where a proposal from point i goes). Find the acceptance probability of a proposed move from point i to point j."],
    tex: `g = (${s.g.join(",\\ ")}), \\quad ${texQ(s.Q)}, \\quad i = ${i + 1},\\ j = ${j + 1}`,
    steps: [alphaLine(s, i, j).replace(/= ([^=]*)$/, (_, x) => `= ${amber(x)}`)],
    short: `\\alpha = ${texFrac(a)}`, fields: [field("\\alpha", a)],
  };
}, () => true);

export const mhEntry: Gen = (lv: Level): Problem => until(() => {
  const s = setup(lv), ps = pairs(s);
  if (!ps.length) throw new Error("division by zero");
  const [i, j] = pick(ps);
  if (lv === 3) {
    // the staying chance: 1 − Σ q(k|i) α_ik
    const moves = Array.from({ length: s.m }, (_, k) => k).filter(k => k !== i && s.Q[i][k].n > 0);
    if (moves.some(k => s.Q[k][i].n === 0)) throw new Error("division by zero");
    let stay = fr(1); const lines: string[] = [];
    for (const k of moves) {
      const e = mul(s.Q[i][k], alpha(s, i, k));
      stay = sub(stay, e);
      lines.push(`P_{${i + 1}${k + 1}} = ${texFrac(s.Q[i][k])} \\cdot ${texFrac(alpha(s, i, k))} = ${texFrac(e)}`);
    }
    return {
      key: `mh:s:${s.g.join(",")}:${s.Q.map(r => r.map(texFrac).join(",")).join(";")}:${i}`,
      ask: ["mpr_mhStay", "Target weights g and proposal matrix q. Find P_ii, the probability that the Metropolis–Hastings chain stays at point i in one step."],
      tex: `g = (${s.g.join(",\\ ")}), \\quad ${texQ(s.Q)}, \\quad i = ${i + 1}`,
      steps: [...lines, `P_{${i + 1}${i + 1}} = 1 - ${moves.map(k => `P_{${i + 1}${k + 1}}`).join(" - ")} = ${amber(texFrac(stay))}`],
      short: `P_{${i + 1}${i + 1}} = ${texFrac(stay)}`, fields: [field(`P_{${i + 1}${i + 1}}`, stay)],
    };
  }
  const e = mul(s.Q[i][j], alpha(s, i, j));
  return {
    key: `mh:e:${s.g.join(",")}:${s.Q.map(r => r.map(texFrac).join(",")).join(";")}:${i}${j}`,
    ask: ["mpr_mhEntry", "Target weights g and proposal matrix q. Find the transition probability P_ij of the Metropolis–Hastings chain (propose j, then accept)."],
    tex: `g = (${s.g.join(",\\ ")}), \\quad ${texQ(s.Q)}, \\quad i = ${i + 1},\\ j = ${j + 1}`,
    steps: [alphaLine(s, i, j), `P_{${i + 1}${j + 1}} = q(${j + 1} \\mid ${i + 1})\\, \\alpha_{${i + 1}${j + 1}} = ${texFrac(s.Q[i][j])} \\cdot ${texFrac(alpha(s, i, j))} = ${amber(texFrac(e))}`],
    short: `P_{${i + 1}${j + 1}} = ${texFrac(e)}`, fields: [field(`P_{${i + 1}${j + 1}}`, e)],
  };
}, () => true);

// ── A continuous p ──
export const mhCont: Gen = (lv: Level): Problem => until(() => {
  const d = pick([4, 5, 10]), k = ri(1, d - 1);
  if (lv === 3 && Math.random() < 0.5) {
    // proposal drawn from the prior: α = min(1, L(p′)/L(p)), L = pʸ(1 − p)ⁿ⁻ʸ
    const a = ri(1, 4), b = ri(1, 4), n = ri(2, 6), y = ri(0, n);
    const k2 = until(() => ri(1, d - 1), (v) => v !== k);
    const ratio = mul(pow(fr(k2, k), y), pow(fr(d - k2, d - k), n - y)), al = min1(ratio);
    const P = texFrac(fr(k, d)), Q = texFrac(fr(k2, d));
    return {
      key: `mh:i:${a}:${b}:${y}:${n}:${k}:${k2}:${d}`,
      ask: ["mpr_mhIndep", "Prior Beta(a, b), data y of n. The proposal p′ is drawn from the prior, whatever the current p. Find the acceptance probability for the move from p to p′."],
      tex: `f(p) = ${beta(a, b)}, \\quad y = ${y},\\ n = ${n}, \\quad p = ${P},\\ p' = ${Q}`,
      steps: [
        `\\alpha = \\min\\!\\left(1, \\frac{g(p')\\, f(p)}{g(p)\\, f(p')}\\right) = \\min\\!\\left(1, \\frac{L(p')}{L(p)}\\right)`,
        `\\frac{L(p')}{L(p)} = \\left(\\frac{${k2}}{${k}}\\right)^{${y}} \\left(\\frac{${d - k2}}{${d - k}}\\right)^{${n - y}} = ${texFrac(ratio)}`,
        `\\alpha = ${amber(texFrac(al))}`,
      ],
      short: `\\alpha = ${texFrac(al)}`, fields: [field("\\alpha", al)],
    };
  }
  const u = ri(1, 4), v = ri(1, 3);
  const off = lv >= 2 && Math.random() < 0.25;
  const k2 = off ? (Math.random() < 0.5 ? -ri(1, 2) : d + ri(1, 2)) : until(() => k + pick([-2, -1, 1, 2]), (x) => x >= 1 && x <= d - 1);
  const P = texFrac(fr(k, d)), Q = texFrac(fr(k2, d));
  const g = `g(p) = p^{${u}}(1 - p)^{${v}}`;
  if (off) return {
    key: `mh:c:${u}:${v}:${k}:${k2}:${d}`,
    ask: ["mpr_mhRW", "Random-walk Metropolis for the kernel g(p) below (a symmetric proposal). The chain is at p and proposes p′. Find the acceptance probability."],
    tex: `${g}, \\quad p = ${P},\\ p' = ${Q}`,
    steps: [`p' \\notin [0, 1] \\;\\Rightarrow\\; g(p') = 0`, `\\alpha = \\min\\!\\left(1, \\frac{0}{g(p)}\\right) = ${amber("0")}`],
    short: "\\alpha = 0", fields: [field("\\alpha", fr(0))],
  };
  const ratio = mul(pow(fr(k2, k), u), pow(fr(d - k2, d - k), v)), al = min1(ratio);
  return {
    key: `mh:c:${u}:${v}:${k}:${k2}:${d}`,
    ask: ["mpr_mhRW", "Random-walk Metropolis for the kernel g(p) below (a symmetric proposal). The chain is at p and proposes p′. Find the acceptance probability."],
    tex: `${g}, \\quad p = ${P},\\ p' = ${Q}`,
    steps: [
      `\\frac{g(p')}{g(p)} = \\left(\\frac{${k2}}{${k}}\\right)^{${u}} \\left(\\frac{${d - k2}}{${d - k}}\\right)^{${v}} = ${texFrac(ratio)}`,
      `\\alpha = \\min\\!\\left(1, ${texFrac(ratio)}\\right) = ${amber(texFrac(al))}`,
    ],
    short: `\\alpha = ${texFrac(al)}`, fields: [field("\\alpha", al)],
  };
}, () => true);

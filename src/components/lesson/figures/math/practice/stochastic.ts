// ── Practice generators: Markov chains and the stochastic-process chapters ─────
// Markov chains (two-step probabilities, stationary distributions of 2-state,
// neighbour-walk and general 3-state chains), chains with memory (corridor
// walker that remembers its direction, two-day weather), Metropolis on the
// grid {1/4, 1/2, 3/4} (matrix entries, posterior mean), queues (exact
// M/M/1/K and M/M/2/K: π(n), L, Lq, W, Wq) and the AR(1) process (stationary
// variance, k-step mean and variance). Every probability in a matrix is a
// whole number of tenths, so every answer is an exact fraction; the story is in
// the translated instruction and the TeX holds only numbers.

import { add, div, fr, mul, pow, sub, texFrac, type Frac } from "./frac";
import { pick, ri, type Gen, type Level, type Problem } from "./problem";
import { until } from "./arithmetic";

const amber = (s: string) => `\\amber{${s}}`;
const one = (label: string, v: Frac) => ({ label, answer: { kind: "num" as const, value: v } });
const tenth = (k: number) => fr(k, 10);
const dec1 = (k: number) => (k === 10 ? "1" : k === 0 ? "0" : `0.${k}`);
const ZERO = fr(0), ONE = fr(1);
const sum = (xs: Frac[]) => xs.reduce((a, b) => add(a, b), ZERO);

/** A 3 × 3 matrix of tenths as TeX. */
const matTex = (M: number[][]) => `P = \\begin{pmatrix} ${M.map(r => r.map(dec1).join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;

/** A random row of three tenths adding up to 10, never staying put for sure (row i, entry i < 10). */
function row3(i: number): number[] {
  return until(() => { const a = ri(0, 10), b = ri(0, 10 - a); return [a, b, 10 - a - b]; }, r => 10 - r[i] >= 1);
}

/** π of a 3-state chain from exact elimination (πP = π, one equation replaced by Σπ = 1). */
function stationary3(P: Frac[][]): Frac[] | null {
  // unknowns π0, π1, π2; equations: column 0 and column 1 of (P − I), then the sum
  const A: Frac[][] = [
    [sub(P[0][0], ONE), P[1][0], P[2][0], ZERO],
    [P[0][1], sub(P[1][1], ONE), P[2][1], ZERO],
    [ONE, ONE, ONE, ONE],
  ];
  for (let c = 0; c < 3; c++) {
    let p = c;
    while (p < 3 && A[p][c].n === 0) p++;
    if (p === 3) return null;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 3; r++) {
      if (r === c || A[r][c].n === 0) continue;
      const f = div(A[r][c], A[c][c]);
      A[r] = A[r].map((v, k) => sub(v, mul(f, A[c][k])));
    }
  }
  return A.map((r, i) => div(r[3], r[i]));
}

// ── Markov chains ──
export const mkTwoStep: Gen = (lv: Level): Problem => {
  const M = [0, 1, 2].map(row3);
  const i = ri(0, 2), j = ri(0, 2);
  const terms = [0, 1, 2].map(k => M[i][k] * M[k][j]);
  const ans = fr(terms.reduce((a, b) => a + b, 0), 100);
  const used = [0, 1, 2].filter(k => M[i][k] && M[k][j]);
  return {
    key: `mk2:${M.flat().join("")}:${i}${j}:${lv}`, ask: ["mpr_mkTwo", "Find the probability of going from state i to state j in exactly two steps."],
    tex: `${matTex(M)} \\qquad (P^2)_{${i}${j}} = \\;?`,
    steps: [
      `(P^2)_{${i}${j}} = \\sum_k p_{${i}k}\\,p_{k${j}}`,
      `= ${[0, 1, 2].map(k => `${dec1(M[i][k])} \\cdot ${dec1(M[k][j])}`).join(" + ")}`,
      `= ${used.length ? used.map(k => `${terms[k] / 100}`).join(" + ") : "0"} = ${amber(texFrac(ans))}`,
    ],
    short: `${texFrac(ans)}`, fields: [one("", ans)],
  };
};

export const mkStat2: Gen = (): Problem => {
  const a = ri(1, 9), b = ri(1, 9), pi0 = fr(b, a + b);
  return {
    key: `mks2:${a}:${b}`, ask: ["mpr_mkStat2", "A two-state chain goes from 0 to 1 with probability a and from 1 to 0 with probability b. Find the long-run probability π(0)."],
    tex: `a = ${dec1(a)},\\quad b = ${dec1(b)}`,
    steps: [`\\pi(0)\\,a = \\pi(1)\\,b`, `\\pi(0) = \\frac{b}{a + b} = \\frac{${dec1(b)}}{${dec1(a)} + ${dec1(b)}} = ${amber(texFrac(pi0))}`],
    short: `\\pi(0) = ${texFrac(pi0)}`, fields: [one("\\pi(0)", pi0)],
  };
};

export const mkStatWalk: Gen = (): Problem => {
  // 0 ↔ 1 ↔ 2: up from 0 = u0, from 1 down d1 / up u1, down from 2 = d2
  const u0 = ri(1, 9), d1 = ri(1, 8), u1 = ri(1, 9 - d1), d2 = ri(1, 9);
  const M = [[10 - u0, u0, 0], [d1, 10 - d1 - u1, u1], [0, d2, 10 - d2]];
  const w = [ONE, fr(u0, d1), mul(fr(u0, d1), fr(u1, d2))], s = sum(w);
  const k = ri(0, 2), ans = div(w[k], s);
  return {
    key: `mksw:${M.flat().join("")}:${k}`, ask: ["mpr_mkWalk", "This chain only moves between neighbours. Use detailed balance to find π(k)."],
    tex: `${matTex(M)} \\qquad k = ${k}`,
    steps: [
      `\\pi(0)\\,${dec1(u0)} = \\pi(1)\\,${dec1(d1)} \\;\\Rightarrow\\; \\pi(1) = ${texFrac(w[1])}\\,\\pi(0)`,
      `\\pi(1)\\,${dec1(u1)} = \\pi(2)\\,${dec1(d2)} \\;\\Rightarrow\\; \\pi(2) = ${texFrac(w[2])}\\,\\pi(0)`,
      `\\pi \\propto (1,\\ ${texFrac(w[1])},\\ ${texFrac(w[2])}), \\quad \\text{sum} = ${texFrac(s)}`,
      `\\pi(${k}) = ${amber(texFrac(ans))}`,
    ],
    short: `\\pi(${k}) = ${texFrac(ans)}`, fields: [one(`\\pi(${k})`, ans)],
  };
};

export const mkStat3: Gen = (): Problem => {
  const [M, pi] = until(() => {
    const M = [0, 1, 2].map(row3);
    const P = M.map(r => r.map(tenth));
    const pi = stationary3(P);
    return [M, pi] as const;
  }, ([, pi]) => !!pi && pi.every(v => v.n > 0) && pi.every(v => v.d <= 400));
  const k = ri(0, 2), ans = pi![k];
  const col = (j: number) => [0, 1, 2].map(i => `${dec1(M[i][j])}\\,\\pi(${i})`).join(" + ");
  return {
    key: `mks3:${M.flat().join("")}:${k}`, ask: ["mpr_mkStat3", "Solve πP = π with π(0) + π(1) + π(2) = 1 and give π(k)."],
    tex: `${matTex(M)} \\qquad k = ${k}`,
    steps: [
      `\\pi(0) = ${col(0)}`,
      `\\pi(1) = ${col(1)}`,
      `\\pi(0) + \\pi(1) + \\pi(2) = 1`,
      `\\pi = (${pi!.map(texFrac).join(",\\ ")}) \\;\\Rightarrow\\; \\pi(${k}) = ${amber(texFrac(ans))}`,
    ],
    short: `\\pi(${k}) = ${texFrac(ans)}`, fields: [one(`\\pi(${k})`, ans)],
  };
};

// ── Chains with memory ──
export const memCorridor: Gen = (lv: Level): Problem => {
  const N = lv === 1 ? 3 : pick([3, 4, 5]), r = ri(1, 9), l = ri(1, 9), q = fr(r, l);
  // post 1: 1; post i (2..N−1): q^(i−2) + q^(i−1); post N: q^(N−2)
  const w = Array.from({ length: N }, (_, i) => (i === 0 ? ONE : i === N - 1 ? pow(q, N - 2) : add(pow(q, i - 1), pow(q, i))));
  const s = sum(w), k = ri(1, N), ans = div(w[k - 1], s);
  return {
    key: `memc:${N}:${r}:${l}:${k}`, ask: ["mpr_memCorr", "A walker on posts 1…N keeps going right with probability r after a step right, and keeps going left with probability l after a step left; at the ends it must turn. Find the long-run share of time at post k."],
    tex: `N = ${N},\\quad r = ${dec1(r)},\\quad l = ${dec1(l)},\\quad k = ${k}`,
    steps: [
      `q = \\frac{r}{l} = ${texFrac(q)}, \\qquad \\pi(1{\\leftarrow}, 2{\\rightarrow}, 2{\\leftarrow}, 3{\\rightarrow}, \\dots) \\propto (1,\\ 1,\\ q,\\ q,\\ q^2,\\ \\dots)`,
      `(1, 2, \\dots, ${N}) \\propto (${w.map(texFrac).join(",\\ ")}), \\quad \\Sigma = ${texFrac(s)}`,
      `${k}: \\ \\frac{${texFrac(w[k - 1])}}{${texFrac(s)}} = ${amber(texFrac(ans))}`,
    ],
    short: `${texFrac(ans)}`, fields: [one("", ans)],
  };
};

export const memWeather: Gen = (): Problem => {
  // rain tomorrow after (yesterday, today) = RR: a, DR: b, RD: c, DD: d (tenths)
  const a = ri(1, 9), b = ri(1, 9), c = ri(1, 9), d = ri(1, 9);
  const RR = fr(b, 10 - a), DR = ONE, RD = ONE, DD = fr(10 - c, d);     // in units of π_DR
  const s = sum([RR, DR, RD, DD]), ans = div(add(RR, DR), s);
  return {
    key: `memw:${a}${b}${c}${d}`, ask: ["mpr_memW", "Rain tomorrow has probability a after two rainy days, b after a dry day then a rainy one, c after a rainy day then a dry one, and d after two dry days. Find the long-run share of rainy days."],
    tex: `a = ${dec1(a)},\\quad b = ${dec1(b)},\\quad c = ${dec1(c)},\\quad d = ${dec1(d)}`,
    steps: [
      `\\pi_{RR} = \\frac{b}{1 - a}\\,\\pi_{DR} = ${texFrac(RR)}\\,\\pi_{DR}, \\quad \\pi_{RD} = \\pi_{DR}, \\quad \\pi_{DD} = \\frac{1 - c}{d}\\,\\pi_{DR} = ${texFrac(DD)}\\,\\pi_{DR}`,
      `P(R) = \\frac{\\pi_{RR} + \\pi_{DR}}{\\pi_{RR} + \\pi_{DR} + \\pi_{RD} + \\pi_{DD}} = \\frac{${texFrac(add(RR, DR))}}{${texFrac(s)}} = ${amber(texFrac(ans))}`,
    ],
    short: `${texFrac(ans)}`, fields: [one("", ans)],
  };
};

// ── Metropolis on the grid {1/4, 1/2, 3/4} ──
function metro(lv: Level) {
  const a = ri(1, 3), b = ri(1, 3), n = ri(1, lv === 1 ? 3 : 5), y = ri(0, n);
  const A = a - 1 + y, B = b - 1 + n - y;
  const g = [1, 2, 3].map(k => fr(k ** A * (4 - k) ** B));     // ∝ g(k/4), the common 4^(A+B) dropped
  const half = fr(1, 2), min1 = (f: Frac) => (f.n >= f.d ? ONE : f);
  const P12 = mul(half, min1(div(g[1], g[0]))), P21 = mul(half, min1(div(g[0], g[1])));
  const P23 = mul(half, min1(div(g[2], g[1]))), P32 = mul(half, min1(div(g[1], g[2])));
  return { a, b, n, y, A, B, g, P12, P21, P23, P32, P22: sub(ONE, add(P21, P23)) };
}
const metroTex = (m: ReturnType<typeof metro>) => `n = ${m.n},\\ y = ${m.y},\\ \\text{Beta}(${m.a}, ${m.b}),\\ \\ p \\in \\{\\tfrac14, \\tfrac12, \\tfrac34\\}`;

export const metEntry: Gen = (lv: Level): Problem => {
  const m = until(() => metro(lv), m => m.g.every(v => v.n > 0));
  const which = pick(["12", "21", "23", "32", "22"] as const);
  const v = { "12": m.P12, "21": m.P21, "23": m.P23, "32": m.P32, "22": m.P22 }[which];
  const gk = `g \\propto (${m.g.map(texFrac).join(",\\ ")})`;
  return {
    key: `met:${m.a}${m.b}${m.n}${m.y}:${which}`, ask: ["mpr_metEntry", "Metropolis with neighbour proposals (½ each; off the grid = stay). Find the entry P_ij of the transition matrix (states 1, 2, 3 = p = 1/4, 1/2, 3/4)."],
    tex: `${metroTex(m)} \\qquad P_{${which[0]}${which[1]}} = \\;?`,
    steps: [
      `g(p) = p^{${m.A}}(1 - p)^{${m.B}} \\;\\Rightarrow\\; ${gk}`,
      which === "22"
        ? `P_{22} = 1 - P_{21} - P_{23} = 1 - ${texFrac(m.P21)} - ${texFrac(m.P23)} = ${amber(texFrac(v))}`
        : `P_{${which[0]}${which[1]}} = \\tfrac12 \\min\\!\\left(1, \\frac{g_${which[1]}}{g_${which[0]}}\\right) = ${amber(texFrac(v))}`,
    ],
    short: `${texFrac(v)}`, fields: [one(`P_{${which}}`, v)],
  };
};

export const metMean: Gen = (lv: Level): Problem => {
  const m = until(() => metro(lv), m => m.g.every(v => v.n > 0));
  const s = sum(m.g), pi = m.g.map(v => div(v, s));
  const mean = add(add(mul(fr(1, 4), pi[0]), mul(fr(1, 2), pi[1])), mul(fr(3, 4), pi[2]));
  return {
    key: `metm:${m.a}${m.b}${m.n}${m.y}`, ask: ["mpr_metMean", "The Metropolis chain on the grid has the posterior as its stationary distribution. Find the posterior mean of p."],
    tex: metroTex(m),
    steps: [
      `g(p) = p^{${m.A}}(1 - p)^{${m.B}} \\;\\Rightarrow\\; g \\propto (${m.g.map(texFrac).join(",\\ ")})`,
      `\\pi = (${pi.map(texFrac).join(",\\ ")})`,
      `E[p] = \\tfrac14\\,\\pi_1 + \\tfrac12\\,\\pi_2 + \\tfrac34\\,\\pi_3 = ${amber(texFrac(mean))}`,
    ],
    short: `${texFrac(mean)}`, fields: [one("E[p]", mean)],
  };
};

// ── Queues (continuous time, exact) ──
function queue(c: number, K: number, lam: number, mu: number) {
  const w: Frac[] = [ONE];
  for (let n = 1; n <= K; n++) w.push(mul(w[n - 1], fr(lam, Math.min(n, c) * mu)));
  const s = sum(w), pi = w.map(v => div(v, s));
  const L = sum(pi.map((p, n) => mul(fr(n), p)));
  const Lq = sum(pi.map((p, n) => mul(fr(Math.max(0, n - c)), p)));
  const lamEff = mul(fr(lam), sub(ONE, pi[K]));
  return { w, pi, L, Lq, lamEff, W: div(L, lamEff), Wq: div(Lq, lamEff) };
}

export const queMM1: Gen = (lv: Level): Problem => {
  const lam = ri(1, 4), mu = ri(1, 4), K = lv === 1 ? 2 : ri(2, 4);
  const q = queue(1, K, lam, mu);
  const what = lv === 1 ? pick(["pi0", "L"] as const) : pick(["pi0", "L", "W", "Wq"] as const);
  const v = { pi0: q.pi[0], L: q.L, W: q.W, Wq: q.Wq }[what];
  const label = { pi0: "\\pi(0)", L: "L", W: "W", Wq: "W_q" }[what];
  return {
    key: `q1:${lam}${mu}${K}:${what}`, ask: ["mpr_queMM1", "An M/M/1/K queue: arrivals at rate λ, one server at rate μ, room for K customers in all. Find the quantity asked."],
    tex: `\\lambda = ${lam},\\quad \\mu = ${mu},\\quad K = ${K} \\qquad ${label} = \\;?`,
    steps: [
      `\\pi(n) \\propto \\left(\\tfrac{\\lambda}{\\mu}\\right)^n = (${q.w.map(texFrac).join(",\\ ")})`,
      `\\pi = (${q.pi.map(texFrac).join(",\\ ")})`,
      `L = \\textstyle\\sum n\\,\\pi(n) = ${texFrac(q.L)}, \\quad \\lambda_{\\text{ef}} = \\lambda(1 - \\pi(${K})) = ${texFrac(q.lamEff)}`,
      `${label} = ${amber(texFrac(v))}`,
    ],
    short: `${label} = ${texFrac(v)}`, fields: [one(label, v)],
  };
};

export const queMM2: Gen = (): Problem => {
  const lam = ri(1, 4), mu = ri(1, 3), K = ri(3, 4);
  const q = queue(2, K, lam, mu);
  const what = pick(["Lq", "Wq", "L"] as const);
  const v = { Lq: q.Lq, Wq: q.Wq, L: q.L }[what];
  const label = { Lq: "L_q", Wq: "W_q", L: "L" }[what];
  return {
    key: `q2:${lam}${mu}${K}:${what}`, ask: ["mpr_queMM2", "An M/M/2/K queue: two servers, each at rate μ, arrivals at rate λ, room for K in all. Find the quantity asked."],
    tex: `\\lambda = ${lam},\\quad \\mu = ${mu},\\quad K = ${K} \\qquad ${label} = \\;?`,
    steps: [
      `\\pi(n) \\propto \\prod_{k=1}^{n} \\frac{\\lambda}{\\min(k, 2)\\,\\mu} = (${q.w.map(texFrac).join(",\\ ")})`,
      `\\pi = (${q.pi.map(texFrac).join(",\\ ")})`,
      `L_q = \\textstyle\\sum (n - 2)\\,\\pi(n) = ${texFrac(q.Lq)}, \\quad \\lambda_{\\text{ef}} = ${texFrac(q.lamEff)}`,
      `${label} = ${amber(texFrac(v))}`,
    ],
    short: `${label} = ${texFrac(v)}`, fields: [one(label, v)],
  };
};

// ── AR(1) ──
export const arVar: Gen = (): Problem => {
  const phi = fr(pick([1, 2, 3, 4, 5, 6, 7, 8, 9]) * (Math.random() < 0.3 ? -1 : 1), 10), s2 = fr(pick([1, 2, 4, 9]));
  const v = div(s2, sub(ONE, mul(phi, phi)));
  return {
    key: `arv:${texFrac(phi)}:${s2.n}`, ask: ["mpr_arVar", "Xₙ₊₁ = φXₙ + εₙ₊₁ with ε ~ N(0, σ²). Find the variance of the stationary distribution."],
    tex: `\\varphi = ${texFrac(phi)},\\quad \\sigma^2 = ${s2.n}`,
    steps: [`v = \\varphi^2 v + \\sigma^2 \\;\\Rightarrow\\; v = \\frac{\\sigma^2}{1 - \\varphi^2}`, `v = \\frac{${s2.n}}{1 - ${texFrac(mul(phi, phi))}} = ${amber(texFrac(v))}`],
    short: `${texFrac(v)}`, fields: [one("v", v)],
  };
};

export const arStep: Gen = (lv: Level): Problem => {
  const phi = fr(pick([1, 2, 3, 4, 5, 6, 8]), 10), s2 = fr(pick([1, 2, 4])), k = lv === 1 ? 2 : ri(2, 3), x = ri(-5, 5);
  const mean = mul(pow(phi, k), fr(x));
  let geo = ZERO;
  for (let i = 0; i < k; i++) geo = add(geo, pow(mul(phi, phi), i));
  const v = mul(s2, geo);
  const askVar = Math.random() < 0.6;
  const val = askVar ? v : mean, label = askVar ? "\\text{Var}" : "E";
  return {
    key: `ark:${texFrac(phi)}:${s2.n}:${k}:${x}:${askVar}`, ask: [askVar ? "mpr_arStepV" : "mpr_arStepE", askVar ? "Given Xₙ = x, find the variance of Xₙ₊ₖ." : "Given Xₙ = x, find the mean of Xₙ₊ₖ."],
    tex: `\\varphi = ${texFrac(phi)},\\quad \\sigma^2 = ${s2.n},\\quad k = ${k},\\quad x = ${x}`,
    steps: [
      `X_{n+k} \\mid X_n = x \\sim N\\!\\left(\\varphi^k x,\\ \\sigma^2 (1 + \\varphi^2 + \\dots + \\varphi^{2(k-1)})\\right)`,
      askVar
        ? `\\text{Var} = ${s2.n} \\cdot ${texFrac(geo)} = ${amber(texFrac(v))}`
        : `E = (${texFrac(phi)})^{${k}} \\cdot ${x} = ${amber(texFrac(mean))}`,
    ],
    short: `${label} = ${texFrac(val)}`, fields: [one(label, val)],
  };
};

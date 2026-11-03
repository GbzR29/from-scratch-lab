// ── Markov chains in floating point, for chains too big for exact fractions ───
// model.ts keeps small chains exact (bigint fractions). The widgets of the
// later chapters (memory walks, Metropolis, queues, a discretised AR(1)) build
// chains with tens or hundreds of states, so they solve πP = π here instead:
// Gaussian elimination with partial pivoting on the transposed system
// (P − I)ᵀπ = 0, one equation replaced by π₁ + … + πₘ = 1. A birth–death chain
// (moves of ±1 only) needs no solve at all: detailed balance gives each
// π(n+1)/π(n) directly.

export type Mat = number[][];

/** The stationary distribution of a chain with one closed class (null if the system is singular). */
export function stationaryOf(P: Mat): number[] | null {
  const m = P.length;
  if (!m) return null;
  // row j of A: Σᵢ πᵢ (P_ij − δ_ij) = 0; the last row becomes Σ πᵢ = 1
  const A = Array.from({ length: m }, (_, j) => {
    const row = new Array<number>(m + 1);
    for (let i = 0; i < m; i++) row[i] = P[i][j] - (i === j ? 1 : 0);
    row[m] = 0;
    return row;
  });
  A[m - 1].fill(1);
  for (let c = 0; c < m; c++) {
    let p = c;
    for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-14) return null;
    if (p !== c) [A[c], A[p]] = [A[p], A[c]];
    const piv = A[c][c];
    for (let r = 0; r < m; r++) {
      if (r === c) continue;
      const f = A[r][c] / piv;
      if (f === 0) continue;
      for (let k = c; k <= m; k++) A[r][k] -= f * A[c][k];
    }
  }
  const pi = A.map((row, i) => row[m] / row[i]);
  // clean round-off: tiny negatives, and make the sum exactly 1
  const s = pi.reduce((a, v) => a + Math.max(0, v), 0);
  return pi.map(v => Math.max(0, v) / s);
}

/** Stationary distribution of a birth–death chain from its up and down probabilities. */
export function birthDeath(up: number[], down: number[]): number[] {
  // up[n] = P(n → n+1), down[n] = P(n → n−1); π(n+1) = π(n)·up[n]/down[n+1]
  const w = [1];
  for (let n = 0; n + 1 < down.length; n++) w.push(w[n] * (up[n] / down[n + 1]));
  const s = w.reduce((a, v) => a + v, 0);
  return w.map(v => v / s);
}

/** v·P */
export function vecTimes(v: number[], P: Mat): number[] {
  const out = new Array<number>(P[0].length).fill(0);
  for (let i = 0; i < v.length; i++) {
    if (!v[i]) continue;
    const row = P[i];
    for (let j = 0; j < row.length; j++) out[j] += v[i] * row[j];
  }
  return out;
}

/** One step of the chain from state i, given a uniform random number u in [0, 1). */
export function stepFrom(P: Mat, i: number, u: number): number {
  const row = P[i];
  let acc = 0;
  for (let j = 0; j < row.length; j++) { acc += row[j]; if (u < acc) return j; }
  return row.length - 1;
}

/** "0.1234" with a fixed number of decimals, and "<0.0001" instead of 0.0000 for tiny positive values. */
export function dec(x: number, d = 4) {
  if (x > 0 && x < 0.5 * 10 ** -d) return `<${(10 ** -d).toFixed(d)}`;
  return x.toFixed(d);
}

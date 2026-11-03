"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Btn, C, Figure, Readout, Row, Slider, Sliders, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { frac, fAdd, fMul, fNum, fStr, fSub, ONE, ZERO, stationaryExact, type FMat, type Frac } from "./model";
import { dec } from "./numeric";

// ── What this figure shows ────────────────────────────────────────────────────
// The Metropolis algorithm on a grid of values for an unknown probability p.
// Data: y successes in n trials; prior Beta(a, b). The target is the
// unnormalised posterior g(p) = p^(a−1+y) (1−p)^(b−1+n−y): prior kernel times
// likelihood kernel. From grid point i the chain proposes a neighbour, left or
// right with chance ½ each (a proposal off the grid means "stay"), and accepts
// it with chance min(1, g(j)/g(i)). Only ratios of g are used, so the constant
// that would normalise g never appears. The transition matrix is built
// exactly (bigint fractions) and πP = π solved exactly; the bars are π. The
// walker runs the chain: green arrow = accepted, red = rejected. The dots are
// the share of time it has spent at each point, which settles on the bars.

const W = 560, H = 200, BASE = 150, HMAX = 118;

function bigPow(x: number, k: number) { let r = BigInt(1); const b = BigInt(x); for (let i = 0; i < k; i++) r *= b; return r; }
const fMin1 = (f: Frac) => (f.n >= f.d ? ONE : f);

function build(K: number, A: number, B: number) {
  // grid p_k = k/(K+1); ratio g(j)/g(i) = (j/i)^A · ((K+1−j)/(K+1−i))^B, exact
  const ratio = (j: number, i: number) => frac(bigPow(j, A) * bigPow(K + 1 - j, B), bigPow(i, A) * bigPow(K + 1 - i, B));
  const half = frac(1, 2);
  const P: FMat = [];
  for (let i = 1; i <= K; i++) {
    const row: Frac[] = new Array(K).fill(ZERO);
    let stay = ONE;
    for (const j of [i - 1, i + 1]) {
      if (j < 1 || j > K) continue;                  // off the grid: the half stays put
      const pij = fMul(half, fMin1(ratio(j, i)));
      row[j - 1] = pij;
      stay = fSub(stay, pij);
    }
    row[i - 1] = stay;
    P.push(row);
  }
  return P;
}

export function MetropolisFigure({ t }: { t?: TrackTranslations }) {
  const [K, setK] = useState(3);
  const [n, setN] = useState(4);
  const [y, setY] = useState(3);
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const yy = Math.min(y, n);
  const A = a - 1 + yy, Bx = b - 1 + n - yy;
  const P = useMemo(() => build(K, A, Bx), [K, A, Bx]);
  const piF = useMemo(() => (K <= 9 ? stationaryExact(P) : null), [P, K]);
  const Pn = useMemo(() => P.map(r => r.map(fNum)), [P]);
  const pi = useMemo(() => {
    if (piF) return piF.map(fNum);
    // larger grids: the same chain is a walk between neighbours, so detailed balance gives π directly
    const w = [1];
    for (let i = 0; i + 1 < K; i++) w.push(w[i] * Pn[i][i + 1] / Pn[i + 1][i]);
    const s = w.reduce((u, v) => u + v, 0);
    return w.map(v => v / s);
  }, [piF, Pn, K]);
  const grid = Array.from({ length: K }, (_, i) => (i + 1) / (K + 1));
  const meanF = piF ? piF.reduce((s, p, i) => fAdd(s, fMul(p, frac(i + 1, K + 1))), ZERO) : null;
  const mean = pi.reduce((s, p, i) => s + p * grid[i], 0);

  // the walker
  const [cur, setCur] = useState(0);
  const [visits, setVisits] = useState<number[]>(() => new Array(K).fill(0));
  const [last, setLast] = useState<{ from: number; to: number; ok: boolean } | null>(null);
  const [acc, setAcc] = useState({ tried: 0, ok: 0 });
  const [playing, setPlaying] = useState(false);
  const [fast, setFast] = useState(false);
  const tick = useRef(0);
  const vis = useVisible<HTMLDivElement>();
  const clear = () => { setCur(Math.floor((K - 1) / 2)); setVisits(new Array(K).fill(0)); setLast(null); setAcc({ tried: 0, ok: 0 }); tick.current = 0; };
  const change = (f: () => void) => { f(); setPlaying(false); setCur(0); setVisits([]); setLast(null); setAcc({ tried: 0, ok: 0 }); };

  const run = (steps: number) => {
    let c = Math.min(cur, K - 1);
    const v = visits.length === K ? [...visits] : new Array(K).fill(0);
    let tried = acc.tried, ok = acc.ok, lastMove = last;
    for (let s = 0; s < steps; s++) {
      const j = c + (Math.random() < 0.5 ? -1 : 1);
      let moved = false;
      if (j >= 0 && j < K) {
        tried++;
        const accept = Math.min(1, Pn[c][j] * 2);       // P_ij = ½ · min(1, ratio)
        if (Math.random() < accept) { moved = true; ok++; }
      }
      lastMove = { from: c, to: j, ok: moved };
      if (moved) c = j;
      v[c]++;
    }
    setCur(c); setVisits(v); setLast(lastMove); setAcc({ tried, ok });
  };
  useFrame(playing && vis.on, dt => {
    tick.current += dt;
    if (tick.current < (fast ? 0.03 : 0.5)) return;
    tick.current = 0;
    run(fast ? 300 : 1);
  });

  const total = visits.reduce((s, v) => s + v, 0);
  const top = Math.max(...pi) * 1.12;
  const step = (W - 40) / K, bw = Math.min(60, step * 0.7);
  const X = (i: number) => 20 + i * step + step / 2;
  const empMean = total ? visits.reduce((s, v, i) => s + v * grid[i], 0) / total : 0;
  const showLabels = K <= 11;

  return (
    <Figure
      title={tx(t, "figMet_title", "Metropolis on a grid")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figMet_K", "grid points")} value={K} min={3} max={39} step={1} onChange={v => change(() => setK(v))} fmt={v => String(v)} />
          <Slider label={tx(t, "figMet_n", "trials n")} value={n} min={1} max={40} step={1} onChange={v => change(() => { setN(v); setY(u => Math.min(u, v)); })} fmt={v => String(v)} />
          <Slider label={tx(t, "figMet_y", "successes y")} value={yy} min={0} max={n} step={1} onChange={v => change(() => setY(v))} fmt={v => String(v)} />
          <Slider label={tx(t, "figMet_a", "prior a")} value={a} min={1} max={10} step={1} onChange={v => change(() => setA(v))} fmt={v => String(v)} />
          <Slider label={tx(t, "figMet_b", "prior b")} value={b} min={1} max={10} step={1} onChange={v => change(() => setB(v))} fmt={v => String(v)} />
        </Sliders>
        <Row>
          <Readout color={C.blue}>{`E[p | ${tx(t, "figMet_data", "data")}] = ${meanF ? `${fStr(meanF)} ≈ ` : ""}${dec(mean, 4)}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figMet_chain", "chain")}: ${total ? dec(empMean, 4) : "–"}`}</Readout>
          <Readout>{`${tx(t, "figMet_acc", "accepted")}: ${acc.tried ? Math.round((100 * acc.ok) / acc.tried) : 0} %`}</Readout>
        </Row>
      </>}
      note={tx(t, "figMet_note", "g(p) = p^(a−1+y) (1 − p)^(b−1+n−y) is prior kernel times likelihood; the chain only ever uses ratios of g. The bars are the stationary distribution of the chain, found by solving πP = π (exactly, as fractions, for up to 9 points): it is the posterior on the grid, without ever dividing g by its sum. Press play: the walker proposes a neighbour, a green arrow is an accepted move, a red one a rejection (it stays and that point is counted again). Moves uphill are always accepted; downhill ones only sometimes. Use fast and watch the dots settle on the bars.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={16} y1={BASE} x2={W - 16} y2={BASE} stroke={C.axis} />
          {pi.map((p, i) => {
            const h = (p / top) * HMAX, emp = total ? visits[i] / total : 0;
            return (
              <g key={i}>
                <rect x={X(i) - bw / 2} y={BASE - h} width={bw} height={h} rx={3} fill={C.blue} fillOpacity={i === cur ? 0.4 : 0.2} stroke={C.blue} strokeWidth={1} />
                {total > 0 && <circle cx={X(i)} cy={BASE - (emp / top) * HMAX} r={3.5} fill={C.amber} />}
                {showLabels && <T x={X(i)} y={BASE + 15} anchor="middle" color={C.muted} size={10}>{K <= 5 ? fStr(frac(i + 1, K + 1)) : grid[i].toFixed(2)}</T>}
                {showLabels && <T x={X(i)} y={BASE - h - 5} anchor="middle" color={C.blue} size={9.5}>{dec(p, 3)}</T>}
              </g>
            );
          })}
          {/* walker + last proposal */}
          <circle cx={X(Math.min(cur, K - 1))} cy={BASE + 30} r={7} fill={C.amber} />
          {last && last.to !== last.from && (() => {
            const x1 = X(last.from), x2 = last.to < 0 ? X(0) - step * 0.6 : last.to >= K ? X(K - 1) + step * 0.6 : X(last.to);
            const col = last.ok ? C.green : C.red;
            return <g>
              <path d={`M ${x1} ${BASE + 40} Q ${(x1 + x2) / 2} ${BASE + 54} ${x2} ${BASE + 40}`} fill="none" stroke={col} strokeWidth={2} strokeDasharray={last.ok ? undefined : "4 3"} />
              <circle cx={x2} cy={BASE + 40} r={3} fill={col} />
            </g>;
          })()}
        </svg>
        {K <= 5 && (
          <div className="px-4 pb-2 overflow-x-auto">
            <table className="mx-auto border-collapse font-mono text-[11px] tabular-nums">
              <tbody>
                {P.map((row, i) => (
                  <tr key={i} style={{ background: i === cur ? "var(--primary-low)" : undefined }}>
                    <td className="px-2 py-0.5 text-[var(--text-muted)]">{fStr(frac(i + 1, K + 1))}</td>
                    {row.map((f, j) => <td key={j} className="px-2 py-0.5 text-center text-[var(--text-main)]">{fStr(f)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {piF && <p className="text-center text-[11px] font-mono text-[var(--text-muted)] mt-1">{`π = (${piF.map(fStr).join(", ")})`}</p>}
          </div>
        )}
        <Transport t={t} playing={playing}
          onPlay={() => { if (!visits.length) clear(); setPlaying(p => !p); }}
          playLabel={tx(t, "figMet_play", "run the chain")}
          onStep={() => { setPlaying(false); if (!visits.length) clear(); run(1); }}
          onReset={() => { setPlaying(false); clear(); }}
          readout={<span className="inline-flex items-center gap-2">{`${total} ${tx(t, "figMet_steps", "steps")}`}
            <Btn active={fast} onClick={() => setFast(f => !f)}>{tx(t, "figMet_fast", "fast")}</Btn></span>} />
      </div>
    </Figure>
  );
}

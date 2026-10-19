"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, useRerender, f2, mulberry32 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { lnOmega, oneIn } from "./statMath";

// ── What this figure shows ────────────────────────────────────────────────────
// Two Einstein solids in contact: A has N_A atoms-as-oscillators, B has N_B,
// and they share q quanta of energy (each quantum is the same packet ε). Every
// way of handing out the quanta to the oscillators is a microstate, and all
// are equally likely. The simulation moves one quantum at a time from a random
// oscillator to a random oscillator (a move from an empty one does nothing);
// this walk visits every microstate equally often in the long run.
// It starts with all quanta in A (A hot, B cold). The chart counts how often
// each split q_A has been seen (pink bars) against the exact prediction
// P(q_A) = Ω_A(q_A) Ω_B(q − q_A) / Ω_total, with Ω(N, q) = (q+N−1)!/(q!(N−1)!)
// (sky line). The temperatures come from kT = ε / ln(1 + N/q) for each solid;
// energy flows from A to B until they match, which is where the most
// arrangements are.

const W = 560, H = 300;
const CELL = 22, COLS = 10, GX = 16;
const AY = 34, BY = 172;
const CX0 = 300, CX1 = 548, CY0 = 34, CY1 = 252;

function fresh(NA: number, NB: number, q: number) {
  const n = new Array(NA + NB).fill(0);
  for (let i = 0; i < q; i++) n[i % NA]++;
  // the chart starts counting once q_A first falls to its fair share, so the start-up flow does not skew it
  return { n, hist: new Array(q + 1).fill(0), moves: 0, counting: false, fair: Math.round((q * NA) / (NA + NB)), rnd: mulberry32(11) };
}

export function EinsteinSolidFigure({ t }: { t?: TrackTranslations }) {
  const [NA, setNA] = useState(30);
  const [NB, setNB] = useState(30);
  const [q, setQ] = useState(40);
  const [playing, setPlaying] = useState(false);
  const st = useRef(fresh(30, 30, 40));
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();

  const move = (k: number) => {
    const s = st.current, N = NA + NB;
    for (let i = 0; i < k; i++) {
      const from = Math.floor(s.rnd() * N), to = Math.floor(s.rnd() * N);
      if (s.n[from] > 0) { s.n[from]--; s.n[to]++; }
      let qa = 0;
      for (let j = 0; j < NA; j++) qa += s.n[j];
      if (qa <= s.fair) s.counting = true;
      if (s.counting) s.hist[qa]++;
      s.moves++;
    }
    rerender();
  };
  useFrame(playing && vis.on, dt => move(Math.max(1, Math.round(dt * 400))));
  const reset = (a = NA, b = NB, qq = q) => { st.current = fresh(a, b, qq); setPlaying(false); rerender(); };

  const s = st.current;
  const qA = s.n.slice(0, NA).reduce((x, y) => x + y, 0), qB = q - qA;
  const lnTot = lnOmega(NA + NB, q);
  const P = (a: number) => Math.exp(lnOmega(NA, a) + lnOmega(NB, q - a) - lnTot);
  const probs = Array.from({ length: q + 1 }, (_, a) => P(a));
  const best = probs.indexOf(Math.max(...probs));
  const total = s.hist.reduce((x, y) => x + y, 0);
  const pMax = Math.max(...probs, ...(total ? s.hist.map(h => h / total) : [0]));
  const bx = (a: number) => CX0 + (a / (q + 1)) * (CX1 - CX0), bw = (CX1 - CX0) / (q + 1);
  const by = (p: number) => CY1 - (p / pMax) * (CY1 - CY0 - 10);
  const kT = (N: number, e: number) => (e > 0 ? 1 / Math.log(1 + N / e) : 0);
  const lnNow = lnOmega(NA, qA) + lnOmega(NB, qB);

  const cell = (i: number) => {
    const inA = i < NA, j = inA ? i : i - NA;
    const x = GX + (j % COLS) * CELL, y = (inA ? AY : BY) + Math.floor(j / COLS) * CELL, k = s.n[i];
    const color = inA ? C.pink : C.sky;
    return <g key={i}>
      <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} rx={3} fill={color} fillOpacity={Math.min(0.75, k * 0.12)} stroke={color} strokeOpacity={0.5} />
      {k > 0 && k <= 9 && Array.from({ length: k }, (_, d) => <circle key={d} cx={x + 6 + (d % 3) * 5} cy={y + 6 + Math.floor(d / 3) * 5} r={1.7} fill={C.fg} />)}
      {k > 9 && <T x={x + CELL / 2} y={y + 14} anchor="middle" size={8} color={C.fg} bold>{`${k}`}</T>}
    </g>;
  };

  return (
    <Figure title={tx(t, "figPhEin_title", "Two solids sharing energy")}
      controls={<>
        <Sliders>
          <Slider label="N_A" value={NA} min={5} max={40} step={1} onChange={v => { setNA(v); reset(v); }} fmt={v => `${v}`} />
          <Slider label="N_B" value={NB} min={5} max={40} step={1} onChange={v => { setNB(v); reset(NA, v); }} fmt={v => `${v}`} />
          <Slider label={tx(t, "figPhEin_q", "quanta q")} value={q} min={5} max={120} step={1} onChange={v => { setQ(v); reset(NA, NB, v); }} fmt={v => `${v}`} />
        </Sliders>
        <Row>
          <Readout color={C.pink}>{`q_A = ${qA} · kT_A = ${f2(kT(NA, qA), 2)} ε`}</Readout>
          <Readout color={C.sky}>{`q_B = ${qB} · kT_B = ${f2(kT(NB, qB), 2)} ε`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhEin_best", "most likely")} q_A = ${best}`}</Readout>
        </Row>
        <Row>
          <Readout color={C.amber}>{`S/k = ln Ω = ${f2(lnNow, 1)} (${tx(t, "figPhEin_max", "max")} ${f2(lnOmega(NA, best) + lnOmega(NB, q - best), 1)})`}</Readout>
          <Readout>{`${tx(t, "figPhEin_allA", "chance all quanta are back in A")}: ${oneIn(lnOmega(NA, q) - lnTot)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhEin_note", "Each square is one atom of a solid, vibrating with some number of quanta of energy (the dots). All the energy starts in solid A, so A is hot and B is cold. Press play: quanta hop between random atoms, with no preference for either side, yet energy flows from A into B and then stays roughly evenly spread. Nothing pushes it: there are simply vastly more arrangements with the energy shared than with it bunched in A. Once the energy has spread, the chart starts counting how often each split turns up (pink) and compares it with the exact count of arrangements (sky line); they match. The temperatures kT_A and kT_B, computed from the counting alone, become equal just where the arrangements peak. Raise the number of atoms and quanta: the peak gets relatively narrower, and the chance of all the energy wandering back into A becomes absurdly small. For a real solid, with 10²³ atoms, it never happens. That is the second law.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <T x={GX} y={AY - 8} color={C.pink} size={8.5} bold>{`${tx(t, "figPhEin_solidA", "solid A")}: ${NA} ${tx(t, "figPhEin_atoms", "atoms")}`}</T>
          <T x={GX} y={BY - 8} color={C.sky} size={8.5} bold>{`${tx(t, "figPhEin_solidB", "solid B")}: ${NB} ${tx(t, "figPhEin_atoms", "atoms")}`}</T>
          {s.n.map((_, i) => cell(i))}

          <line x1={CX0} y1={CY1} x2={CX1} y2={CY1} stroke={C.axis} />
          {total > 0 && s.hist.map((h, a) => h > 0 && <rect key={a} x={bx(a)} y={by(h / total)} width={Math.max(1, bw - 0.5)} height={CY1 - by(h / total)} fill={C.pink} opacity={0.55} />)}
          <path d={probs.map((p, a) => `${a ? "L" : "M"}${(bx(a) + bw / 2).toFixed(1)},${by(p).toFixed(1)}`).join("")} fill="none" stroke={C.sky} strokeWidth={1.8} />
          <line x1={bx(qA) + bw / 2} y1={CY0} x2={bx(qA) + bw / 2} y2={CY1} stroke={C.amber} strokeWidth={1.5} />
          {[0, Math.round(q / 2), q].map(a => <T key={a} x={bx(a) + bw / 2} y={CY1 + 13} anchor="middle" size={7.5}>{`${a}`}</T>)}
          <T x={CX1} y={CY1 + 26} anchor="end" size={8}>{tx(t, "figPhEin_qa", "quanta in A, q_A")}</T>
          <T x={CX0} y={CY0 - 12} size={8.5}>{tx(t, "figPhEin_chart", "each split: seen (bars), counted (line)")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(v => !v)}
          onStep={() => { setPlaying(false); move(1); }}
          onReset={() => reset()}
          readout={`${tx(t, "figPhEin_moves", "moves")}: ${s.moves}`} />
      </div>
    </Figure>
  );
}

"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, f2, mulberry32 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { lnFact } from "./statMath";

// ── What this figure shows ────────────────────────────────────────────────────
// 400 atoms (the 20 × 20 grid, brighter = more energy) all start with the same
// number of quanta, q̄ (slider: the temperature). Again and again a random
// atom gives one quantum to another random atom, if it has one to give. The
// total never changes. The bar chart is how many atoms hold n quanta; the
// line is the Boltzmann distribution for a solid, P(n) = (1 − x) xⁿ with
// x = q̄ / (1 + q̄) = e^(−ε/kT): equal steps of energy cost equal factors of
// probability. "log scale" turns that exponential into a straight line whose
// slope is −ε/kT. ln W counts the ways to give these energies to the 400
// atoms, W = 400! / (N₀! N₁! N₂! …): it starts at 0 (one way: everyone
// equal) and climbs to its maximum as the histogram takes the Boltzmann shape.
// "break it: share fairly" makes every exchange go from the richer atom to the
// poorer one: the energies stay equal, W stays 1, and the exponential never
// appears. Random sharing, not fairness, is what nature does.

const W = 560, H = 290;
const NG = 20, N = NG * NG, CELL = 12, GX = 16, GY = 26;
const HX0 = 300, HX1 = 548, HY0 = 34, HY1 = 250, NMAX = 16;

function fresh(qbar: number) {
  return { n: new Array(N).fill(qbar) as number[], moves: 0, rnd: mulberry32(5) };
}

export function BoltzmannFigure({ t }: { t?: TrackTranslations }) {
  const [qbar, setQbar] = useState(3);
  const [log, setLog] = useState(false);
  const [fair, setFair] = useState(false);
  const [playing, setPlaying] = useState(false);
  const st = useRef(fresh(3));
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();

  const run = (k: number) => {
    const s = st.current;
    for (let i = 0; i < k; i++) {
      let a = Math.floor(s.rnd() * N), b = Math.floor(s.rnd() * N);
      if (fair && s.n[a] < s.n[b]) [a, b] = [b, a];
      if (fair ? s.n[a] - s.n[b] >= 2 : s.n[a] > 0) { s.n[a]--; s.n[b]++; }
      s.moves++;
    }
    rerender();
  };
  useFrame(playing && vis.on, dt => run(Math.max(1, Math.round(dt * 6000))));
  const reset = (qq = qbar) => { st.current = fresh(qq); setPlaying(false); rerender(); };

  const s = st.current;
  const counts = new Array(NMAX + 1).fill(0);
  s.n.forEach(v => { counts[Math.min(v, NMAX)]++; });
  const x = qbar / (1 + qbar);
  const theory = (n: number) => N * (1 - x) * x ** n;
  // ln W = ln 400! − Σ ln N_n!, with the exact counts (the chart lumps n ≥ 16 together)
  const exact = new Map<number, number>();
  s.n.forEach(v => exact.set(v, (exact.get(v) ?? 0) + 1));
  let lnW = lnFact(N);
  exact.forEach(c => { lnW -= lnFact(c); });
  const top = Math.max(...counts, theory(0));
  const yv = (v: number) => {
    if (log) { const l = Math.log10(Math.max(v, 0.5)); return HY1 - ((l - Math.log10(0.5)) / (Math.log10(top) - Math.log10(0.5))) * (HY1 - HY0); }
    return HY1 - (v / top) * (HY1 - HY0);
  };
  const bw = (HX1 - HX0) / (NMAX + 1);
  const hx = (n: number) => HX0 + n * bw;
  let curve = "";
  for (let i = 0; i <= 160; i++) { const n = (i / 160) * NMAX; curve += `${i ? "L" : "M"}${(hx(n) + bw / 2).toFixed(1)},${yv(theory(n)).toFixed(1)}`; }
  const maxN = Math.max(...s.n);

  return (
    <Figure title={tx(t, "figPhBoltz_title", "Random sharing makes the Boltzmann distribution")}
      head={<Btn active={fair} onClick={() => { setFair(f => !f); reset(); }}>{tx(t, "figPhBoltz_broken", "break it: share fairly")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhBoltz_qbar", "quanta per atom q̄")} value={qbar} min={1} max={6} step={1} onChange={v => { setQbar(v); reset(v); }} fmt={v => `${v}`} width="w-32" />
        <Row>
          <Btn active={log} onClick={() => setLog(l => !l)}>{tx(t, "figPhBoltz_log", "log scale")}</Btn>
          <Readout color={C.amber}>{`ln W = ${f2(lnW, 0)}`}</Readout>
          <Readout color={C.sky}>{`kT = ε / ln(1 + 1/q̄) = ${f2(1 / Math.log(1 + 1 / qbar), 2)} ε`}</Readout>
          <Readout>{`${tx(t, "figPhBoltz_zero", "atoms with 0 quanta")}: ${counts[0]} (${tx(t, "figPhBoltz_theory", "theory")} ${f2(theory(0), 0)})`}</Readout>
          <Readout>{`${tx(t, "figPhBoltz_richest", "richest atom")}: ${maxN}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhBoltz_note", "Every atom starts with the same energy. Press play: quanta are passed from random atoms to random atoms, nobody is favoured, and the total stays fixed. Within seconds the equality is gone: many atoms end up with nothing, a few get rich, and the histogram settles on a falling curve, the Boltzmann distribution (sky line). Switch on the log scale and the curve becomes a straight line: each extra quantum makes an atom less likely by the same factor, e^(−ε/kT). A higher q̄ (a hotter solid) gives a gentler slope. Watch ln W, the logarithm of the number of ways to hand out these energies: it starts at zero and climbs to its maximum; the Boltzmann shape is simply the one with the most ways. Break it by sharing fairly, always from richer to poorer: the atoms stay equal, there is only one way to be equal, and the exponential never appears.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {s.n.map((v, i) => <rect key={i} x={GX + (i % NG) * CELL} y={GY + Math.floor(i / NG) * CELL} width={CELL - 1.5} height={CELL - 1.5} rx={1.5}
            fill={C.amber} fillOpacity={v === 0 ? 0.04 : Math.min(1, 0.12 + v / (3 * qbar))} />)}
          <T x={GX} y={GY - 8} size={8.5}>{tx(t, "figPhBoltz_grid", "400 atoms: brighter = more quanta")}</T>

          <line x1={HX0} y1={HY1} x2={HX1} y2={HY1} stroke={C.axis} />
          {counts.map((c, n) => c > 0 && <rect key={n} x={hx(n) + 1} y={yv(c)} width={bw - 2} height={HY1 - yv(c)} fill={fair ? C.red : C.amber} opacity={0.6} />)}
          <path d={curve} fill="none" stroke={C.sky} strokeWidth={2} />
          {[0, 4, 8, 12, 16].map(n => <T key={n} x={hx(n) + bw / 2} y={HY1 + 13} anchor="middle" size={7.5}>{n === NMAX ? `${n}+` : `${n}`}</T>)}
          <T x={HX1} y={HY1 + 26} anchor="end" size={8}>{tx(t, "figPhBoltz_n", "quanta held, n")}</T>
          <T x={HX0} y={HY0 - 12} size={8.5}>{tx(t, "figPhBoltz_chart", "number of atoms holding n quanta")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(v => !v)}
          onStep={() => { setPlaying(false); run(400); }}
          onReset={() => reset()}
          readout={`${tx(t, "figPhBoltz_moves", "exchanges")}: ${s.moves}`} />
      </div>
    </Figure>
  );
}

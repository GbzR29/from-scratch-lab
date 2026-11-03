"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Btn, C, Choice, Figure, Readout, Row, Slider, Sliders, T, mulberry32, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { betaDraw, betaMean, betaPdf } from "@/components/lesson/figures/math/betaMath";

// ── What this figure shows ────────────────────────────────────────────────────
// Metropolis–Hastings for a continuous probability p. The target is the
// posterior kernel g(p) = p^(A−1)(1 − p)^(B−1), A = a + y, B = b + n − y.
// Two proposals:
//   random walk — p′ = p + s·Z with Z standard normal: symmetric, so the
//                 Hastings factor is 1 (plain Metropolis); g = 0 outside [0, 1]
//                 means "reject";
//   from the prior — p′ drawn from the prior Beta(a, b), whatever p is: not
//                 symmetric, so the acceptance needs the factor q(p)/q(p′).
//                 Switching the correction off shows the chain settling on the
//                 wrong distribution, ∝ g·prior (red dashed): the prior counted twice.
// Top: the trace (p against the step number, the burn-in shaded). Bottom: the
// histogram of the kept steps against the exact posterior Beta(A, B) (green).

type Mode = "rw" | "prior";
type Case = { key: string; a: number; b: number; y: number; n: number };
const CASES: Case[] = [
  { key: "c1", a: 2, b: 2, y: 3, n: 4 },
  { key: "c2", a: 8, b: 8, y: 3, n: 4 },
  { key: "c3", a: 2, b: 2, y: 30, n: 40 },
];
const W = 560, HT = 120, HH = 150, GAP = 22, H = HT + GAP + HH + 16;
const MAX = 20000, BINS = 40;
const dec = (v: number, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : "—").replace("-", "−");
const logKernel = (p: number, A: number, B: number) => (p <= 0 || p >= 1 ? -Infinity : (A - 1) * Math.log(p) + (B - 1) * Math.log(1 - p));

export function MHFigure({ t }: { t?: TrackTranslations }) {
  const [cs, setCs] = useState("c1");
  const [mode, setMode] = useState<Mode>("rw");
  const [hastings, setHastings] = useState(true);
  const [s, setS] = useState(0.15);
  const [p0, setP0] = useState(0.05);
  const [burn, setBurn] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [fast, setFast] = useState(false);
  const [, setTick] = useState(0);
  const chain = useRef<number[]>([p0]);
  const acc = useRef(0);
  const rnd = useRef(mulberry32(7));
  const vis = useVisible<HTMLDivElement>();

  const c = CASES.find(k => k.key === cs)!;
  const A = c.a + c.y, B = c.b + c.n - c.y;

  const restart = (start = p0) => { chain.current = [start]; acc.current = 0; rnd.current = mulberry32(7); setPlaying(false); setTick(k => k + 1); };
  const normal = () => {
    const u = 1 - rnd.current(), v = rnd.current();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const run = (k: number) => {
    const ch = chain.current;
    for (let i = 0; i < k && ch.length < MAX; i++) {
      const p = ch[ch.length - 1];
      const q = mode === "rw" ? p + s * normal() : betaDraw(c.a, c.b, rnd.current);
      let logA = logKernel(q, A, B) - logKernel(p, A, B);
      if (mode === "prior" && hastings) logA += logKernel(p, c.a, c.b) - logKernel(q, c.a, c.b);   // q(p)/q(p′)
      const ok = Math.log(1 - rnd.current()) < logA;
      ch.push(ok ? q : p);
      if (ok) acc.current++;
    }
    if (ch.length >= MAX) setPlaying(false);
    setTick(x => x + 1);
  };
  useFrame(playing && vis.on, () => run(fast ? 400 : 8));

  const ch = chain.current, steps = ch.length - 1;
  const kept = ch.slice(Math.min(burn, ch.length));
  const mean = kept.length ? kept.reduce((x, v) => x + v, 0) / kept.length : NaN;
  const wrong = mode === "prior" && !hastings;
  const counts = new Array(BINS).fill(0);
  for (const v of kept) counts[Math.min(BINS - 1, Math.floor(v * BINS))]++;
  const hist = counts.map(k => (kept.length ? (k * BINS) / kept.length : 0));

  // ── the drawing ──
  const X = (i: number) => 16 + ((W - 32) * i) / Math.max(steps, 1);
  const TY = (p: number) => 8 + (1 - p) * (HT - 16);
  const every = Math.max(1, Math.ceil(ch.length / 900));
  let trace = "";
  for (let i = 0; i < ch.length; i += every) trace += `${trace ? "L" : "M"}${X(i).toFixed(1)},${TY(ch[i]).toFixed(1)}`;
  const top = HT + GAP, base = top + HH;
  const PX = (p: number) => 16 + (W - 32) * p;
  const xs = Array.from({ length: 201 }, (_, i) => 0.002 + (0.996 * i) / 200);
  const exact = (p: number) => betaPdf(p, A, B);
  const twice = (p: number) => betaPdf(p, A + c.a - 1, B + c.b - 1);
  const peak = Math.max(...hist, ...xs.map(exact), ...(wrong ? xs.map(twice) : [])) * 1.1;
  const HY = (d: number) => base - (d / peak) * (HH - 10);
  const curve = (f: (p: number) => number) => xs.map((p, i) => `${i ? "L" : "M"}${PX(p).toFixed(1)},${HY(f(p)).toFixed(1)}`).join("");
  const bw = (W - 32) / BINS;

  const view = (
    <div ref={vis.ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* trace */}
        {[0, 0.5, 1].map(p => <g key={p}>
          <line x1={16} x2={W - 16} y1={TY(p)} y2={TY(p)} stroke={C.grid} strokeWidth={0.6} />
          <T x={W - 18} y={TY(p) - 3} anchor="end" color={C.axis} size={8.5}>{`p = ${p}`}</T>
        </g>)}
        {burn > 0 && steps > 0 && <rect x={16} y={4} width={Math.max(0, X(Math.min(burn, steps)) - 16)} height={HT - 8} fill={C.red} fillOpacity={0.1} />}
        <path d={trace} fill="none" stroke={C.sky} strokeWidth={1.1} />
        <T x={18} y={HT + 12} color={C.muted} size={9}>{`${tx(t, "figMH_trace", "trace: p at each step")} · ${tx(t, "figMH_burnShade", "red band = burn-in, thrown away")}`}</T>
        {/* histogram */}
        {hist.map((d, i) => d > 0 && <rect key={i} x={PX(i / BINS) + 0.5} width={bw - 1} y={HY(d)} height={base - HY(d)} fill={C.sky} fillOpacity={0.35} />)}
        <line x1={16} x2={W - 16} y1={base} y2={base} stroke={C.axis} strokeWidth={1.2} />
        {[0, 0.25, 0.5, 0.75, 1].map(p => <T key={p} x={PX(p)} y={base + 12} anchor="middle" color={C.axis} size={8.5}>{String(p)}</T>)}
        {wrong && <path d={curve(twice)} fill="none" stroke={C.red} strokeWidth={2} strokeDasharray="6 4" />}
        <path d={curve(exact)} fill="none" stroke={C.green} strokeWidth={2.4} />
        <T x={18} y={top + 10} color={C.green} bold>{`${tx(t, "figMH_exact", "exact posterior")} Beta(${A}, ${B})`}</T>
        {wrong && <T x={18} y={top + 24} color={C.red} bold>{`${tx(t, "figMH_twice", "what this chain targets")}: Beta(${A + c.a - 1}, ${B + c.b - 1})`}</T>}
      </svg>
      <Transport t={t} playing={playing}
        onPlay={() => { if (steps >= MAX - 1) restart(); setPlaying(p => !p); }}
        playLabel={tx(t, "figMH_play", "run the chain")}
        onStep={() => { setPlaying(false); run(1); }}
        onReset={() => restart()}
        readout={<span className="inline-flex items-center gap-2">{`${steps} ${tx(t, "figMH_steps", "steps")}`}
          <Btn active={fast} onClick={() => setFast(f => !f)}>{tx(t, "figMH_fast", "fast")}</Btn></span>} />
    </div>
  );

  const caseLabel = (k: Case) => `Beta(${k.a}, ${k.b}) + ${k.y}/${k.n}`;
  const controls = <>
    <Row>{CASES.map(k => <Btn key={k.key} active={cs === k.key} onClick={() => { setCs(k.key); restart(); }}>{caseLabel(k)}</Btn>)}</Row>
    <Row>
      <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figMH_proposal", "proposal:")}</span>
      <Choice value={mode} onChange={m => { setMode(m); restart(); }} options={[
        ["rw", tx(t, "figMH_rw", "random walk p + s·Z")],
        ["prior", tx(t, "figMH_fromPrior", "draw from the prior")],
      ] as const} />
      {mode === "prior" && <Btn active={hastings} onClick={() => { setHastings(h => !h); restart(); }}>
        {hastings ? tx(t, "figMH_hOn", "Hastings correction: on") : tx(t, "figMH_hOff", "Hastings correction: off")}</Btn>}
    </Row>
    <Sliders>
      {mode === "rw" && <Slider label={tx(t, "figMH_s", "step size s")} value={s} min={0.01} max={1} step={0.01} onChange={v => { setS(v); restart(); }} width="w-20" />}
      <Slider label={tx(t, "figMH_start", "start p₀")} value={p0} min={0.01} max={0.99} step={0.01} onChange={v => { setP0(v); restart(v); }} width="w-20" />
      <Slider label={tx(t, "figMH_burn", "burn-in")} value={burn} min={0} max={1000} step={10} onChange={setBurn} fmt={String} width="w-20" />
    </Sliders>
    <Row>
      <Readout>{`${tx(t, "figMH_accRate", "acceptance")} = ${steps ? dec((100 * acc.current) / steps, 1) : "—"} %`}</Readout>
      <Readout color={C.sky}>{`${tx(t, "figMH_mean", "mean of kept steps")} = ${dec(mean)}`}</Readout>
      <Readout color={C.green}>{`${tx(t, "figMH_exactMean", "exact mean")} A/(A+B) = ${dec(betaMean(A, B))}`}</Readout>
      {wrong && <Readout color={C.red}>{`${tx(t, "figMH_wrongMean", "wrong target's mean")} = ${dec(betaMean(A + c.a - 1, B + c.b - 1))}`}</Readout>}
    </Row>
  </>;

  return (
    <Figure title={tx(t, "figMH_title", "Metropolis–Hastings on a continuous p")}
      controls={controls}
      note={tx(t, "figMH_note", "Press play. Top: the value of p at each step, starting from p₀; the first steps still remember the start and are thrown away (the red band, burn-in). Bottom: the histogram of the kept steps against the exact posterior (green). With the random walk, try a tiny step (s = 0.01: almost everything is accepted, but the chain crawls) and a huge one (s = 1: most proposals land outside [0, 1] or far downhill and are rejected); somewhere around 20–50 % acceptance mixes best. Then switch to drawing proposals from the prior and turn the Hastings correction off: the histogram drifts to the red curve, because without the factor q(p)/q(p′) the prior is counted twice. The strong prior Beta(8, 8) makes the error easy to see.")}>
      {view}
    </Figure>
  );
}

"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A chain reaction in a disc of fissile fuel, one neutron generation at a
// time (a toy model, in 2-D, with lengths in mean free paths: the average
// distance a neutron flies before it meets a nucleus).
//   • Each neutron flies a random distance (exponential, mean 1) in a random
//     direction. If that takes it outside the disc, it escapes (red).
//   • Otherwise it meets a nucleus. A control rod absorbs it with
//     probability c; else it causes fission with probability P_F = 0.7,
//     releasing 2 or 3 new neutrons (2.5 on average, as for uranium-235),
//     else it is captured without fission (grey).
// So an infinite block multiplies the neutrons by k∞ = 2.5 · 0.7 · (1 − c)
// each generation, and a finite disc by k = k∞ · (fraction that stays in).
// k < 1 dies out, k = 1 is a steady reactor, k > 1 grows exponentially.
// Past 1500 tracked neutrons, half are dropped at random and each remaining
// one counts double, so the count can grow to 10⁸ while only a sample is drawn.

const W = 560, H = 270, PF = 0.7, NU = 2.5, GMAX = 40, LOGMAX = 8, CAP = 1500;
type Track = { x0: number; y0: number; x1: number; y1: number; kind: 0 | 1 | 2 | 3 };   // 0 escape, 1 fission, 2 capture, 3 rod

export function ChainReactionFigure({ t }: { t?: TrackTranslations }) {
  const [R, setR] = useState(3);
  const [rods, setRods] = useState(0);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();

  const fresh = (radius: number, rnd: () => number) => {
    const ns: [number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const r = radius * Math.sqrt(rnd()), a = rnd() * 2 * Math.PI;
      ns.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return { rnd, ns, weight: 1, gen: 0, clock: 0, tracks: [] as Track[], hist: [20] as number[], ks: [] as number[], leak: 0 };
  };
  const sim = useRef(fresh(R, mulberry32(3)));
  const reset = (radius = R) => { sim.current = fresh(radius, mulberry32(3 + Math.floor(Math.random() * 999))); setPlaying(true); rerender(); };

  const step = () => {
    const s = sim.current, rnd = s.rnd;
    const next: [number, number][] = [], tracks: Track[] = [];
    let escaped = 0;
    for (const [x, y] of s.ns) {
      const d = -Math.log(Math.max(1e-9, rnd())), a = rnd() * 2 * Math.PI;
      let x1 = x + d * Math.cos(a), y1 = y + d * Math.sin(a), kind: Track["kind"];
      if (x1 * x1 + y1 * y1 > R * R) {
        kind = 0; escaped++;
        // clip the drawn track at the rim
        const bx = Math.cos(a), by = Math.sin(a), b = x * bx + y * by, c = x * x + y * y - R * R;
        const tt = -b + Math.sqrt(Math.max(0, b * b - c));
        x1 = x + tt * bx; y1 = y + tt * by;
      } else if (rnd() < rods) kind = 3;
      else if (rnd() < PF) {
        kind = 1;
        const born = rnd() < NU - 2 ? 3 : 2;
        for (let i = 0; i < born; i++) next.push([x1, y1]);
      } else kind = 2;
      if (tracks.length < 160) tracks.push({ x0: x, y0: y, x1, y1, kind });
    }
    let weight = s.weight;
    let ns = next;
    while (ns.length > CAP) { ns = ns.filter(() => rnd() < 0.5); weight *= 2; }
    const before = s.ns.length * s.weight, after = ns.length * weight;
    s.ks.push(before ? after / before : 0);
    s.leak = s.ns.length ? escaped / s.ns.length : 0;
    s.ns = ns; s.weight = weight; s.gen++; s.tracks = tracks;
    s.hist.push(after);
  };

  useFrame(playing && vis.on, dt => {
    const s = sim.current;
    const done = s.gen >= GMAX || s.ns.length === 0 || s.ns.length * s.weight >= 10 ** LOGMAX;
    if (done) { setPlaying(false); return; }
    s.clock += dt;
    if (s.clock < 0.45) return;
    s.clock = 0;
    step();
    rerender();
  });

  const s = sim.current;
  const N = s.ns.length * s.weight;
  const recent = s.ks.slice(-6);
  const kAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : NaN;
  const kInf = NU * PF * (1 - rods);
  const status = s.ns.length === 0 ? tx(t, "figPhChain_dead", "died out")
    : N >= 10 ** LOGMAX ? tx(t, "figPhChain_runaway", "runaway: 100 million neutrons")
      : s.gen >= GMAX ? tx(t, "figPhChain_steady", "40 generations reached") : "";

  // drawing: the disc on the left, scaled so the largest radius fits
  const CX = 132, CY = 132, SC = 108 / 6;
  const P = (x: number, y: number) => [CX + x * SC, CY - y * SC] as const;
  const kindCol = [C.red, C.amber, C.muted, C.purple];
  // log plot of the neutron count per generation
  const PX0 = 300, PX1 = 540, PY0 = 26, PY1 = 214;
  const X = (g: number) => PX0 + (g / GMAX) * (PX1 - PX0);
  const Y = (n: number) => PY1 - (Math.log10(Math.max(1, n)) / LOGMAX) * (PY1 - PY0);

  return (
    <Figure title={tx(t, "figPhChain_title", "A chain reaction: does each generation outnumber the last?")}
      controls={<>
        <Slider label={tx(t, "figPhChain_R", "radius of the fuel (mean free paths)")} value={R} min={0.5} max={6} step={0.1} onChange={v => { setR(v); reset(v); }} fmt={v => f2(v, 1)} width="w-32" />
        <Slider label={tx(t, "figPhChain_rods", "control rods absorb")} value={rods} min={0} max={0.6} step={0.01} onChange={v => { setRods(v); reset(); }} fmt={v => `${f2(v * 100, 0)}%`} width="w-32" />
        <Row>
          <Readout>{`k∞ = 2.5 × 0.7 × (1 − ${f2(rods, 2)}) = ${f2(kInf, 2)}`}</Readout>
          <Readout color={C.red}>{`${tx(t, "figPhChain_leak", "escape")}: ${f2(s.leak * 100, 0)}%`}</Readout>
          <Readout color={Number.isNaN(kAvg) ? C.fg : kAvg > 1.03 ? C.red : kAvg < 0.97 ? C.sky : C.green}>{`k ≈ ${Number.isNaN(kAvg) ? "–" : f2(kAvg, 2)}`}</Readout>
          {status && <Readout color={C.amber}>{status}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhChain_note", "Every fission releases two or three neutrons, and each can cause another fission. Whether the reaction grows depends on one number, the multiplication factor k: how many neutrons of the next generation each neutron leaves behind. Inside an endless block of fuel, k∞ = (neutrons per fission) × (chance a neutron causes fission) = 2.5 × 0.7 = 1.75. But a neutron born near the edge can fly out before it meets a nucleus, and a small piece leaks a large share, since its surface is large for its volume. Shrink the disc: once more than about 43% escape (1.75 × 0.57 = 1), k drops below 1 and every chain dies out. Grow it until k = 1: that is the critical size. Beyond it, each generation is larger than the last, and in a bomb a generation takes about 10 nanoseconds, so 80 generations go by in under a microsecond. A reactor holds k at exactly 1 with control rods that soak up neutrons: try the rods slider on a large disc. This model is two-dimensional and its numbers are illustrative, not those of a real core.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <circle cx={CX} cy={CY} r={R * SC} fill={C.green} opacity={0.12} stroke={C.green} />
          {s.tracks.map((tr, i) => {
            const [x0, y0] = P(tr.x0, tr.y0), [x1, y1] = P(tr.x1, tr.y1);
            return (
              <g key={i}>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={kindCol[tr.kind]} strokeWidth={1} opacity={0.75} />
                {tr.kind === 1 && <circle cx={x1} cy={y1} r={2.4} fill={C.amber} />}
                {tr.kind === 0 && <circle cx={x1} cy={y1} r={1.8} fill={C.red} />}
              </g>
            );
          })}
          <T x={14} y={18} size={8}>{`${tx(t, "figPhChain_gen", "generation")} ${s.gen}: ${N >= 1e4 ? N.toExponential(1).replace("e+", "e") : Math.round(N)} ${tx(t, "figPhChain_neutrons", "neutrons")}`}</T>
          <T x={14} y={H - 30} size={8} color={C.amber}>{tx(t, "figPhChain_kFis", "fission")}</T>
          <T x={66} y={H - 30} size={8} color={C.muted}>{tx(t, "figPhChain_kCap", "captured")}</T>
          <T x={126} y={H - 30} size={8} color={C.red}>{tx(t, "figPhChain_kEsc", "escaped")}</T>
          <T x={180} y={H - 30} size={8} color={C.purple}>{tx(t, "figPhChain_kRod", "rod")}</T>

          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          {[0, 2, 4, 6, 8].map(e => (
            <g key={e}>
              <line x1={PX0} y1={Y(10 ** e)} x2={PX1} y2={Y(10 ** e)} stroke={C.grid} />
              <T x={PX0 - 4} y={Y(10 ** e) + 3} anchor="end" size={7.5}>{e ? `1e${e}` : "1"}</T>
            </g>
          ))}
          {[0, 10, 20, 30, 40].map(g => <T key={g} x={X(g)} y={PY1 + 12} anchor="middle" size={7.5}>{String(g)}</T>)}
          <line x1={X(0)} y1={Y(20)} x2={X(GMAX)} y2={Y(20)} stroke={C.green} strokeDasharray="3 3" opacity={0.6} />
          <path d={s.hist.map((n, g) => `${g ? "L" : "M"}${X(g).toFixed(1)},${Y(n).toFixed(1)}`).join("")} fill="none" stroke={C.amber} strokeWidth={1.8} />
          <T x={PX0} y={PY0 - 10} size={8}>{tx(t, "figPhChain_plot", "neutrons per generation (log scale)")}</T>
          <T x={X(GMAX)} y={Y(20) - 4} anchor="end" size={7.5} color={C.green}>{tx(t, "figPhChain_k1", "k = 1: steady")}</T>
          <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhChain_gAx", "generation")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => (status ? reset() : setPlaying(p => !p))} onReset={() => reset()}
          readout={`${tx(t, "figPhChain_gen", "generation")} ${s.gen}`} />
      </div>
    </Figure>
  );
}

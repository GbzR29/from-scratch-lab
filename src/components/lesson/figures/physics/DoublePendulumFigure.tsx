"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Two double pendulums (equal 1 kg bobs on 1 m massless rods, g = 9.81) start
// from rest with both arms at θ₀ (slider); the sky one's upper arm starts δ
// further round (10⁻³, 10⁻⁶ or 10⁻⁹ rad). Both follow the full equations of
// motion, integrated with RK4 in 1 ms steps. The graph plots log₁₀ of their
// distance in phase space, d = √(Δθ₁² + Δθ₂² + (Δω₁² + Δω₂²)/(g/L)), against
// time. For small θ₀ the motion is regular and d stays tiny; for large θ₀ it
// is chaotic: log d climbs along a straight line (exponential growth,
// d ≈ δ e^(λt)) until the two pendulums are doing completely different
// things. λ, the Lyapunov exponent, is the slope fitted to the climbing part.
// The "horizon" is when d first passes 0.1. Shrinking δ a millionfold only
// delays the horizon by ln(10⁶)/λ.
// "break it: small-angle equations" replaces the true equations by their
// linear approximation (sin θ ≈ θ, cos ≈ 1, no ω² terms). A linear system
// cannot be chaotic: the gap between the two stays as small as it started.

const W = 560, H = 280;
const G = 9.81, STEP = 0.001, TMAX = 30;
const PIV = { x: 125, y: 120 }, LP = 58;
const GX0 = 285, GX1 = 548, GY0 = 24, GY1 = 246, LMIN = -10, LMAX = 1;

type S4 = [number, number, number, number];   // θ₁, θ₂, ω₁, ω₂

function deriv(s: S4, linear: boolean): S4 {
  const [a, b, w1, w2] = s;
  if (linear) return [w1, w2, -2 * G * a + G * b, 2 * G * a - 2 * G * b];
  const d = a - b, den = 3 - Math.cos(2 * d);
  const a1 = (-3 * G * Math.sin(a) - G * Math.sin(a - 2 * b) - 2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d))) / den;
  const a2 = (2 * Math.sin(d) * (2 * w1 * w1 + 2 * G * Math.cos(a) + w2 * w2 * Math.cos(d))) / den;
  return [w1, w2, a1, a2];
}
function rk4(s: S4, h: number, linear: boolean): S4 {
  const add = (u: S4, v: S4, k: number) => u.map((x, i) => x + k * v[i]) as S4;
  const k1 = deriv(s, linear), k2 = deriv(add(s, k1, h / 2), linear), k3 = deriv(add(s, k2, h / 2), linear), k4 = deriv(add(s, k3, h), linear);
  return s.map((x, i) => x + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) as S4;
}
const dist = (u: S4, v: S4) => Math.sqrt((u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2 + ((u[2] - v[2]) ** 2 + (u[3] - v[3]) ** 2) / G);

/** Least-squares slope of ln d against t over the part that is still small but has grown. */
function lyapunov(log: [number, number][], delta: number) {
  const pts = log.filter(([, l]) => l > Math.log10(delta) + 1 && l < -1.3);
  if (pts.length < 8) return null;
  const n = pts.length, mt = pts.reduce((s, p) => s + p[0], 0) / n, ml = pts.reduce((s, p) => s + p[1], 0) / n;
  const num = pts.reduce((s, p) => s + (p[0] - mt) * (p[1] - ml), 0), den = pts.reduce((s, p) => s + (p[0] - mt) ** 2, 0);
  return (num / den) * Math.LN10;
}

const DELTAS = ["3", "6", "9"] as const;

function fresh(deg: number, k: string) {
  const th = (deg * Math.PI) / 180, delta = 10 ** -Number(k);
  return { a: [th, th, 0, 0] as S4, b: [th + delta, th, 0, 0] as S4, time: 0, log: [] as [number, number][], trailA: [] as [number, number][], trailB: [] as [number, number][], delta };
}

export function DoublePendulumFigure({ t }: { t?: TrackTranslations }) {
  const [deg, setDeg] = useState(120);
  const [k, setK] = useState<(typeof DELTAS)[number]>("6");
  const [linear, setLinear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const st = useRef(fresh(120, "6"));
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();

  const tip = (s: S4) => ({ x: PIV.x + LP * (Math.sin(s[0]) + Math.sin(s[1])), y: PIV.y + LP * (Math.cos(s[0]) + Math.cos(s[1])) });
  const run = (dt: number) => {
    const s = st.current;
    if (s.time >= TMAX) { setPlaying(false); return; }
    const n = Math.round(dt / STEP);
    for (let i = 0; i < n; i++) {
      s.a = rk4(s.a, STEP, linear); s.b = rk4(s.b, STEP, linear);
      s.time += STEP;
      if (Math.round(s.time / STEP) % 50 === 0) {
        s.log.push([s.time, Math.log10(Math.max(1e-12, dist(s.a, s.b)))]);
        const pa = tip(s.a), pb = tip(s.b);
        s.trailA.push([pa.x, pa.y]); s.trailB.push([pb.x, pb.y]);
        if (s.trailA.length > 120) { s.trailA.shift(); s.trailB.shift(); }
      }
    }
    rerender();
  };
  useFrame(playing && vis.on, dt => run(dt));
  const reset = (d = deg, kk: string = k) => { st.current = fresh(d, kk); setPlaying(false); rerender(); };

  const s = st.current;
  const lam = lyapunov(s.log, s.delta);
  const horizon = s.log.find(([, l]) => l > -1);
  const gx = (tt: number) => GX0 + (tt / TMAX) * (GX1 - GX0);
  const gy = (l: number) => GY1 - ((Math.max(LMIN, Math.min(LMAX, l)) - LMIN) / (LMAX - LMIN)) * (GY1 - GY0);

  const arms = (q: S4, color: string, op: number) => {
    const m = { x: PIV.x + LP * Math.sin(q[0]), y: PIV.y + LP * Math.cos(q[0]) }, e = tip(q);
    return <g opacity={op}>
      <line x1={PIV.x} y1={PIV.y} x2={m.x} y2={m.y} stroke={color} strokeWidth={2} />
      <line x1={m.x} y1={m.y} x2={e.x} y2={e.y} stroke={color} strokeWidth={2} />
      <circle cx={m.x} cy={m.y} r={6} fill={color} />
      <circle cx={e.x} cy={e.y} r={7} fill={color} />
    </g>;
  };
  const trail = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");

  return (
    <Figure title={tx(t, "figPhDbl_title", "Two double pendulums, almost the same start")}
      head={<Btn active={linear} onClick={() => { setLinear(l => !l); reset(); }}>{tx(t, "figPhDbl_broken", "break it: small-angle equations")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhDbl_th0", "start angle θ₀")} value={deg} min={5} max={175} step={1} onChange={v => { setDeg(v); reset(v); }} fmt={v => `${v}°`} width="w-28" />
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figPhDbl_gap", "starting gap δ")}</span>
          <Choice value={k} options={DELTAS.map(d => [d, `1e-${d} rad`] as const)} onChange={v => { setK(v); reset(deg, v); }} />
        </Row>
        <Row>
          <Readout color={C.amber}>{`λ ≈ ${lam === null ? "…" : `${f2(lam, 2)} /s`}`}</Readout>
          <Readout>{`${tx(t, "figPhDbl_horizon", "horizon (d > 0.1)")}: ${horizon ? `${f2(horizon[0], 1)} s` : tx(t, "figPhDbl_notYet", "not yet")}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhDbl_note", "Two double pendulums start from rest with both arms at the same angle, except that the sky one's upper arm is turned a tiny bit further, δ. Start at 120° and press play: for several seconds they move as one, then they suddenly part ways and soon have nothing in common. The graph explains the suddenness. It shows the logarithm of their distance: it climbs along a rough straight line, which means the gap is multiplied by the same factor every second, exponential growth; on this scale a gap of a billionth of a radian is only nine steps below a gap of one radian. Change δ from 1e-6 to 1e-9 rad (from a millionth to a billionth of a radian): the start is a thousand times more precise, yet the horizon moves only a few seconds later. Now try 10°: the motion is regular and the gap stays tiny for the whole run. Break it with the small-angle equations: they are linear, and linear equations can never be chaotic.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <path d={trail(s.trailA)} fill="none" stroke={C.pink} strokeWidth={1} opacity={0.5} />
          <path d={trail(s.trailB)} fill="none" stroke={C.sky} strokeWidth={1} opacity={0.5} />
          {arms(s.a, C.pink, 0.95)}
          {arms(s.b, C.sky, 0.75)}
          <circle cx={PIV.x} cy={PIV.y} r={3.5} fill={C.fg} />

          <line x1={GX0} y1={GY1} x2={GX1} y2={GY1} stroke={C.axis} />
          <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke={C.axis} />
          {[0, -2, -4, -6, -8, -10].map(l => <g key={l}>
            <line x1={GX0} y1={gy(l)} x2={GX1} y2={gy(l)} stroke={C.grid} strokeDasharray="2 4" />
            <T x={GX0 - 4} y={gy(l) + 3} anchor="end" size={7.5}>{l === 0 ? "1" : `1e${l}`}</T>
          </g>)}
          <line x1={GX0} y1={gy(-1)} x2={GX1} y2={gy(-1)} stroke={C.amber} strokeDasharray="4 3" opacity={0.7} />
          {[0, 10, 20, 30].map(tt => <T key={tt} x={gx(tt)} y={GY1 + 13} anchor="middle" size={7.5}>{`${tt} s`}</T>)}
          <T x={GX0 + 4} y={GY0 - 8} size={8.5}>{tx(t, "figPhDbl_graph", "distance between the two (log scale)")}</T>
          <path d={s.log.map(([tt, l], i) => `${i ? "L" : "M"}${gx(tt).toFixed(1)},${gy(l).toFixed(1)}`).join("")} fill="none" stroke={linear ? C.red : C.amber} strokeWidth={1.6} />
          <T x={14} y={H - 8} size={8}>{`1 kg, 1 m, g = 9.81 m/s² · RK4`}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(v => !v)}
          onStep={() => { setPlaying(false); run(0.25); }}
          onReset={() => reset()}
          readout={`t = ${f2(s.time, 1)} s`} />
      </div>
    </Figure>
  );
}

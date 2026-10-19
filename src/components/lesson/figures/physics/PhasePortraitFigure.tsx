"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, C, T, Vec, useDrag, useFrame, useVisible, useRerender, f2, clamp } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A pendulum's phase space. In units where g/L = 1 and m L² = 1, its
// Hamiltonian is H(q, p) = ½ p² − cos q: q is the angle, p the angular
// momentum. Hamilton's equations, q̇ = ∂H/∂p = p and ṗ = −∂H/∂q = −sin q, give
// the little flow arrows. Because H is conserved, every motion runs along a
// level curve of H: closed ovals (H < 1: swinging back and forth), the amber
// separatrix (H = 1: balancing on top, forever approaching it) and the open
// wavy lines (H > 1: going over the top). Click or drag anywhere to start the
// pendulum there; it is integrated with the leapfrog method (0.01 steps), and
// leaves a trail. The pendulum itself is drawn on the left. The q axis wraps
// at ±π, because q = π and q = −π are the same position: straight up.

const W = 560, H = 290;
const PX0 = 190, PX1 = 548, PY0 = 18, PY1 = 270;     // phase plane box (px)
const PMAX = 3;
const LEVELS = [-0.85, -0.6, -0.3, 0.05, 0.45, 1, 1.5, 2.3, 3.3];
const STEP = 0.01;

const qx = (q: number) => PX0 + ((q + Math.PI) / (2 * Math.PI)) * (PX1 - PX0);
const py = (p: number) => (PY0 + PY1) / 2 - (p / PMAX) * ((PY1 - PY0) / 2);
const wrap = (q: number) => Math.atan2(Math.sin(q), Math.cos(q));
const energy = (q: number, p: number) => 0.5 * p * p - Math.cos(q);

/** The level curve H = E as SVG path data (both branches p ≥ 0 and p ≤ 0). */
function level(E: number) {
  const n = 240;
  if (E < 1) {
    const qm = Math.acos(-E);
    let d = "";
    for (let i = 0; i <= n; i++) { const q = -qm + (2 * qm * i) / n; d += `${i ? "L" : "M"}${qx(q).toFixed(1)},${py(Math.sqrt(Math.max(0, 2 * (E + Math.cos(q))))).toFixed(1)}`; }
    for (let i = n; i >= 0; i--) { const q = -qm + (2 * qm * i) / n; d += `L${qx(q).toFixed(1)},${py(-Math.sqrt(Math.max(0, 2 * (E + Math.cos(q))))).toFixed(1)}`; }
    return d;
  }
  let up = "", dn = "";
  for (let i = 0; i <= n; i++) {
    const q = -Math.PI + (2 * Math.PI * i) / n, p = Math.sqrt(Math.max(0, 2 * (E + Math.cos(q))));
    up += `${i ? "L" : "M"}${qx(q).toFixed(1)},${py(p).toFixed(1)}`;
    dn += `${i ? "L" : "M"}${qx(q).toFixed(1)},${py(-p).toFixed(1)}`;
  }
  return up + dn;
}

/** Hamilton's flow (q̇, ṗ) = (p, −sin q) as short arrows on a coarse grid. */
function flowArrows() {
  const out = [];
  const kx = (PX1 - PX0) / (2 * Math.PI), ky = (PY1 - PY0) / (2 * PMAX);
  for (let i = 0; i < 13; i++) for (let j = 0; j < 9; j++) {
    const aq = -Math.PI + ((i + 0.5) / 13) * 2 * Math.PI, ap = -PMAX + ((j + 0.5) / 9) * 2 * PMAX;
    const dq = ap, dp = -Math.sin(aq), len = Math.hypot(dq * kx, dp * ky);
    if (len < 1e-6) continue;
    const s = 9 / len, a = { x: qx(aq), y: py(ap) };
    out.push(<Vec key={`${i}-${j}`} a={a} b={{ x: a.x + dq * kx * s, y: a.y - dp * ky * s }} color={C.muted} w={1} head={4} opacity={0.45} />);
  }
  return out;
}

export function PhasePortraitFigure({ t }: { t?: TrackTranslations }) {
  const st = useRef({ q: 1.2, p: 0, trail: [] as [number, number][] });
  const [playing, setPlaying] = useState(true);
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();
  const curves = useMemo(() => LEVELS.map(E => ({ E, d: level(E) })), []);

  const step = (n: number) => {
    const s = st.current;
    for (let i = 0; i < n; i++) {
      // leapfrog: half kick, drift, half kick
      s.p -= 0.5 * STEP * Math.sin(s.q);
      s.q += STEP * s.p;
      s.p -= 0.5 * STEP * Math.sin(s.q);
      s.q = wrap(s.q);
      if (i % 3 === 0) { s.trail.push([s.q, s.p]); if (s.trail.length > 600) s.trail.shift(); }
    }
    rerender();
  };
  useFrame(playing && vis.on, dt => step(Math.round((dt * 1.5) / STEP)));

  const drag = useDrag<number>(
    p => (p.x >= PX0 && p.x <= PX1 && p.y >= PY0 && p.y <= PY1 ? 0 : null),
    (_, p) => {
      const q = -Math.PI + ((clamp(p.x, PX0, PX1) - PX0) / (PX1 - PX0)) * 2 * Math.PI;
      const pp = (((PY0 + PY1) / 2 - clamp(p.y, PY0, PY1)) / ((PY1 - PY0) / 2)) * PMAX;
      st.current = { q, p: pp, trail: [] };
      rerender();
    },
  );

  const { q, p, trail } = st.current;
  const E = energy(q, p);
  const kind = Math.abs(E - 1) < 0.02 ? tx(t, "figPhPhase_sep", "on the separatrix: creeps up to the top")
    : E < 1 ? tx(t, "figPhPhase_swing", "swinging back and forth") : tx(t, "figPhPhase_over", "going over the top");

  const arrows = useMemo(flowArrows, []);
  // trail, broken where it wraps
  let trailD = "";
  trail.forEach(([tq, tp], i) => {
    const jump = i > 0 && Math.abs(tq - trail[i - 1][0]) > Math.PI;
    trailD += `${i === 0 || jump ? "M" : "L"}${qx(tq).toFixed(1)},${py(tp).toFixed(1)}`;
  });

  const piv = { x: 90, y: 135 }, Lp = 70;
  const bob = { x: piv.x + Lp * Math.sin(q), y: piv.y + Lp * Math.cos(q) };

  return (
    <Figure title={tx(t, "figPhPhase_title", "The pendulum in phase space")}
      controls={<Row>
        <Readout color={C.pink}>{`q = ${f2((q * 180) / Math.PI, 0)}°`}</Readout>
        <Readout color={C.pink}>{`p = ${f2(p, 2)}`}</Readout>
        <Readout color={C.amber}>{`H = p²/2 − cos q =${f2(E, 3)}`}</Readout>
        <Readout>{kind}</Readout>
      </Row>}
      note={tx(t, "figPhPhase_note", "Each point of the plane on the right is one complete state of the pendulum: its angle q across, its angular momentum p up. Click or drag anywhere to start it there. The point then moves along the arrows, which are Hamilton's equations, and it never leaves its level curve of H, because energy is conserved. Start near the middle: a small oval, a gentle swing. Start higher: a bigger oval, a wider swing. Start above the amber line, the separatrix: the curve no longer closes, and the pendulum goes over the top again and again; the q axis wraps round because −180° and +180° are the same position, straight up. Starting exactly on the separatrix, the pendulum climbs towards the top ever more slowly and, in theory, never quite arrives. The whole motion of the pendulum, for every possible start, is in this one picture.")}>
      <div ref={vis.ref}>
        <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="none" stroke={C.axis} />
          <line x1={PX0} y1={py(0)} x2={PX1} y2={py(0)} stroke={C.axis} />
          <line x1={qx(0)} y1={PY0} x2={qx(0)} y2={PY1} stroke={C.axis} />
          {arrows}
          {curves.map(({ E: e, d }) => <path key={e} d={d} fill="none" stroke={e === 1 ? C.amber : C.sky} strokeWidth={e === 1 ? 2 : 1.1} opacity={e === 1 ? 1 : 0.6} />)}
          <path d={trailD} fill="none" stroke={C.pink} strokeWidth={2} opacity={0.75} />
          <circle cx={qx(q)} cy={py(p)} r={5.5} fill={C.pink} />
          {[-180, -90, 0, 90, 180].map(d => <T key={d} x={qx((d * Math.PI) / 180)} y={PY1 + 13} anchor="middle" size={7.5}>{`${d}°`}</T>)}
          <T x={PX1} y={PY1 + 13 + 12} anchor="end" size={8}>{tx(t, "figPhPhase_q", "angle q")}</T>
          {[-2, 2].map(v => <T key={v} x={PX0 - 4} y={py(v) + 3} anchor="end" size={7.5}>{`${v}`}</T>)}
          <T x={PX0 - 4} y={PY0 + 8} anchor="end" size={8}>p</T>
          <T x={qx(0) + 5} y={py(2) - 5} color={C.amber} size={8}>{tx(t, "figPhPhase_sepLabel", "separatrix H = 1")}</T>

          <circle cx={piv.x} cy={piv.y} r={Lp} fill="none" stroke={C.grid} strokeDasharray="2 4" />
          <line x1={piv.x} y1={piv.y} x2={bob.x} y2={bob.y} stroke={C.fg} strokeWidth={1.8} />
          <circle cx={piv.x} cy={piv.y} r={3} fill={C.fg} />
          <circle cx={bob.x} cy={bob.y} r={10} fill={C.pink} />
          <T x={14} y={H - 8} size={8}>{tx(t, "figPhPhase_units", "units: g/L = 1, mL² = 1")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(v => !v)}
          onStep={() => { setPlaying(false); step(10); }}
          onReset={() => { st.current = { q: 1.2, p: 0, trail: [] }; rerender(); }}
          readout={`H = ${f2(E, 3)}`} />
      </div>
    </Figure>
  );
}

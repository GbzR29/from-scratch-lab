"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, C, T, useDrag, useFrame, useVisible, useRerender, f2, clamp, mulberry32 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Liouville's theorem on the pendulum of the previous figure (H = ½p² − cos q).
// A disc of starting states, radius 0.35, is followed in time: its edge is a
// ring of points, each integrated on its own with steps of 0.05, and some
// dots inside show the filling. Points nearer the centre of the ovals swing a
// little faster than points further out, so the disc shears into a long thin
// spiral arm, yet the area inside its edge (shoelace formula on the ring)
// stays the same. Where the ring stretches, new edge points are added,
// integrated from the start, so the area stays measurable.
// The default integrator is leapfrog, which keeps areas exactly, like the
// real flow. "break it: Euler steps" uses the plain Euler method
// (q += h p, p −= h sin q, both from the old values): each step multiplies
// areas by 1 + h² cos q, so the blob swells and its energy creeps upwards.
// Drag the disc to start it somewhere else.

const W = 560, H = 280;
const PX0 = 34, PX1 = 548, PY0 = 14, PY1 = 262;
const PMAX = 3, R0 = 0.35, STEP = 0.05, NB = 200, NI = 220, MAXB = 3000, TMAX = 30;

const qx = (q: number) => PX0 + ((q + Math.PI) / (2 * Math.PI)) * (PX1 - PX0);
const py = (p: number) => (PY0 + PY1) / 2 - (p / PMAX) * ((PY1 - PY0) / 2);
const wrap = (q: number) => Math.atan2(Math.sin(q), Math.cos(q));

type Pt2 = { q: number; p: number; s: number };

function advance(pt: { q: number; p: number }, n: number, euler: boolean) {
  let { q, p } = pt;
  for (let i = 0; i < n; i++) {
    if (euler) { const q0 = q; q += STEP * p; p -= STEP * Math.sin(q0); }
    else { p -= 0.5 * STEP * Math.sin(q); q += STEP * p; p -= 0.5 * STEP * Math.sin(q); }
  }
  return { q, p };
}

function startDisc(cq: number, cp: number) {
  const ring: Pt2[] = Array.from({ length: NB }, (_, i) => {
    const s = i / NB, a = 2 * Math.PI * s;
    return { q: cq + R0 * Math.cos(a), p: cp + R0 * Math.sin(a), s };
  });
  const rnd = mulberry32(7);
  const inner = Array.from({ length: NI }, () => {
    const a = 2 * Math.PI * rnd(), r = R0 * Math.sqrt(rnd()) * 0.97;
    return { q: cq + r * Math.cos(a), p: cp + r * Math.sin(a) };
  });
  return { cq, cp, ring, inner, steps: 0 };
}

/** Area inside the ring (shoelace formula), with q unwrapped. */
function area(ring: Pt2[]) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const u = ring[i], v = ring[(i + 1) % ring.length];
    a += u.q * v.p - v.q * u.p;
  }
  return Math.abs(a) / 2;
}

/** Insert ring points where neighbours have drifted apart, integrating each new one from the start. */
function refine(st: ReturnType<typeof startDisc>, euler: boolean) {
  const out: Pt2[] = [];
  const ring = st.ring;
  for (let i = 0; i < ring.length; i++) {
    const u = ring[i], v = ring[(i + 1) % ring.length];
    out.push(u);
    const gap = Math.hypot(u.q - v.q, u.p - v.p);
    if (gap > 0.06 && ring.length + out.length < MAXB * 2 && out.length < MAXB) {
      const s = i === ring.length - 1 ? (u.s + 1 + v.s) / 2 % 1 : (u.s + v.s) / 2, a = 2 * Math.PI * s;
      const p0 = { q: st.cq + R0 * Math.cos(a), p: st.cp + R0 * Math.sin(a) };
      out.push({ ...advance(p0, st.steps, euler), s });
    }
  }
  st.ring = out.slice(0, MAXB);
}

/** The level curve H = E, both branches, as SVG path data. */
function levelPath(E: number) {
  let up = "", dn = "", pen = false;
  for (let i = 0; i <= 200; i++) {
    const q = -Math.PI + (2 * Math.PI * i) / 200, k = 2 * (E + Math.cos(q));
    if (k < 0) { pen = false; continue; }
    const c = pen ? "L" : "M";
    up += `${c}${qx(q).toFixed(1)},${py(Math.sqrt(k)).toFixed(1)}`;
    dn += `${c}${qx(q).toFixed(1)},${py(-Math.sqrt(k)).toFixed(1)}`;
    pen = true;
  }
  return up + dn;
}

export function LiouvilleFigure({ t }: { t?: TrackTranslations }) {
  const [euler, setEuler] = useState(false);
  const [playing, setPlaying] = useState(false);
  const st = useRef(startDisc(0, 1.3));
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();
  const A0 = Math.PI * R0 * R0;

  const run = (n: number) => {
    const s = st.current;
    // stop at t = 30: enough to show the shearing (and Euler's swelling) before the edge needs thousands of points
    if (s.steps * STEP >= TMAX) { setPlaying(false); return; }
    n = Math.min(n, Math.ceil(TMAX / STEP) - s.steps);
    s.ring = s.ring.map(pt => ({ ...advance(pt, n, euler), s: pt.s }));
    s.inner = s.inner.map(pt => advance(pt, n, euler));
    s.steps += n;
    refine(s, euler);
    rerender();
  };
  useFrame(playing && vis.on, dt => run(Math.max(1, Math.round((dt * 1.2) / STEP))));
  const reset = (cq = st.current.cq, cp = st.current.cp) => { st.current = startDisc(cq, cp); setPlaying(false); rerender(); };

  const drag = useDrag<number>(
    p => (Math.hypot(p.x - qx(st.current.cq), p.y - py(st.current.cp)) < 40 ? 0 : null),
    (_, p) => {
      const cq = -Math.PI + ((clamp(p.x, PX0 + 20, PX1 - 20) - PX0) / (PX1 - PX0)) * 2 * Math.PI;
      const cp = (((PY0 + PY1) / 2 - clamp(p.y, PY0 + 20, PY1 - 20)) / ((PY1 - PY0) / 2)) * PMAX;
      reset(cq, cp);
    },
  );

  const s = st.current;
  const A = area(s.ring);
  const meanE = s.ring.reduce((m, pt) => m + 0.5 * pt.p * pt.p - Math.cos(pt.q), 0) / s.ring.length;
  const levels = useMemo(() => [-0.6, 0, 0.5, 1, 1.8].map(E => ({ E, d: levelPath(E) })), []);

  let ringD = "", allInside = true;
  s.ring.forEach((pt, i) => {
    const q = wrap(pt.q);
    if (Math.abs(pt.q) > Math.PI) allInside = false;
    const prev = s.ring[(i - 1 + s.ring.length) % s.ring.length];
    const jump = i > 0 && Math.abs(q - wrap(prev.q)) > Math.PI;
    ringD += `${i === 0 || jump ? "M" : "L"}${qx(q).toFixed(1)},${py(pt.p).toFixed(1)}`;
  });
  if (allInside) ringD += "Z";

  return (
    <Figure title={tx(t, "figPhLiou_title", "A cloud of pendulums keeps its area")}
      head={<Btn active={euler} onClick={() => { setEuler(e => !e); reset(); }}>{tx(t, "figPhLiou_broken", "break it: Euler steps")}</Btn>}
      controls={<Row>
        <Readout color={Math.abs(A / A0 - 1) > 0.02 ? C.red : C.green}>{`${tx(t, "figPhLiou_area", "area")} = ${f2((100 * A) / A0, 1)}% ${tx(t, "figPhLiou_ofStart", "of the start")}`}</Readout>
        <Readout color={C.amber}>{`${tx(t, "figPhLiou_meanE", "average H")} = ${f2(meanE, 3)}`}</Readout>
        <Readout>{`${tx(t, "figPhLiou_edge", "edge points")}: ${s.ring.length}`}</Readout>
        <Readout>{euler ? tx(t, "figPhLiou_euler", "Euler: q += hp, p −= h sin q") : tx(t, "figPhLiou_leap", "leapfrog: half kick, drift, half kick")}</Readout>
      </Row>}
      note={tx(t, "figPhLiou_note", "Each dot is a pendulum, and together they fill a small disc of starting states. Press play. The pendulums nearer the middle of the ovals swing slightly faster than the ones further out, so the disc is sheared into a long thin arm that wraps round and round. Its shape changes beyond recognition, but the area inside its edge stays at 100%: this is Liouville's theorem, true for every Hamiltonian system. Drag the disc somewhere else, even across the amber separatrix, and the same holds. Now break it with the plain Euler method, which updates q and p both from the old values: each step stretches areas by a factor 1 + h² cos q, the blob swells, and the average energy creeps up, so a simulated pendulum would swing higher and higher. Methods that keep areas, like leapfrog, are called symplectic; they are why orbit and molecule simulations can run for millions of steps without drifting.")}>
      <div ref={vis.ref}>
        <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="none" stroke={C.axis} />
          <line x1={PX0} y1={py(0)} x2={PX1} y2={py(0)} stroke={C.axis} strokeWidth={0.8} />
          {levels.map(({ E, d }) => <path key={E} d={d} fill="none" stroke={E === 1 ? C.amber : C.sky} strokeWidth={E === 1 ? 1.6 : 0.9} opacity={E === 1 ? 0.9 : 0.4} />)}
          <path d={ringD} fill={allInside ? C.pink : "none"} fillOpacity={0.18} stroke={euler ? C.red : C.pink} strokeWidth={1.4} />
          {s.inner.map((pt, i) => <circle key={i} cx={qx(wrap(pt.q))} cy={py(pt.p)} r={1.5} fill={euler ? C.red : C.pink} />)}
          {[-180, -90, 0, 90, 180].map(d => <T key={d} x={qx((d * Math.PI) / 180)} y={PY1 + 13} anchor="middle" size={7.5}>{`${d}°`}</T>)}
          {[-2, 0, 2].map(v => <T key={v} x={PX0 - 4} y={py(v) + 3} anchor="end" size={7.5}>{`${v}`}</T>)}
          <T x={PX1 - 4} y={PY0 + 12} anchor="end" size={8}>{tx(t, "figPhLiou_axes", "across: angle q · up: momentum p")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(v => !v)}
          onStep={() => { setPlaying(false); run(20); }}
          onReset={() => reset()}
          readout={`t = ${f2(s.steps * STEP, 1)}`} />
      </div>
    </Figure>
  );
}

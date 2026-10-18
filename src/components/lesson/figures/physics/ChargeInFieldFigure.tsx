"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, Vec, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A charged particle fired into a uniform magnetic field B pointing into the
// screen (the × marks). The magnetic force F = qv × B is always at right
// angles to the velocity, so it bends the path into a circle without changing
// the speed: r = mv/(|q|B). The time for one turn, T = 2πm/(|q|B), does not
// depend on the speed at all, which is the trick behind the cyclotron.
// Slow motion: a proton in 0.1 T turns once every 4 s on screen (really 0.66 µs).
// 1 px = 1 mm. "flip the charge" makes it negative: it curls the other way.
// "break it: a force with a forward push" tilts the force slightly forwards.
// Then it does work: the particle speeds up, its circle keeps growing, and
// its kinetic energy climbs. A real magnetic force can never do that.

const W = 560, H = 320;
const E = 1.602e-19, MP = 1.673e-27;
const PARTICLES = {
  proton: { m: MP, q: 1 },
  deuteron: { m: 3.344e-27, q: 1 },
  alpha: { m: 6.645e-27, q: 2 },
} as const;
type P = keyof typeof PARTICLES;
/** A positive charge starts low and curls up; a negative one starts high and curls down. */
const startFor = (negative: boolean) => ({ x: 200, y: negative ? 30 : 290 });
const OMEGA_REF = (E * 0.1) / MP;           // proton in 0.1 T
const VIS = (2 * Math.PI / 4) / OMEGA_REF;  // screen rad/s per real rad/s
const PX_PER_M = 1000;

export function ChargeInFieldFigure({ t }: { t?: TrackTranslations }) {
  const [kind, setKind] = useState<P>("proton");
  const [v, setV] = useState(1);            // 10⁶ m/s
  const [B, setB] = useState(0.1);          // T
  const [neg, setNeg] = useState(false);
  const [broken, setBroken] = useState(false);
  const [, setTick] = useState(0);
  const st = useRef({ ...startFor(false), vx: 1, vy: 0, speed: 1, trail: [] as [number, number][] });
  const vis = useVisible<HTMLDivElement>();

  const p = PARTICLES[kind];
  const q = (neg ? -1 : 1) * p.q * E;
  const omega = (Math.abs(q) * B) / p.m;                       // rad/s, real
  const rReal = (p.m * v * 1e6) / (Math.abs(q) * B);           // m
  const period = (2 * Math.PI) / omega;                        // s
  const ke = 0.5 * p.m * (v * 1e6 * st.current.speed) ** 2 / E / 1000;   // keV

  const reset = (negative = neg) => { st.current = { ...startFor(negative), vx: 1, vy: 0, speed: 1, trail: [] }; };

  useFrame(vis.on, dt => {
    const s = st.current;
    const w = omega * VIS * (q > 0 ? -1 : 1);                  // screen rotation (y down): + turns upwards
    const ang = w * dt;
    const c = Math.cos(ang), sn = Math.sin(ang);
    const vx = s.vx * c - s.vy * sn, vy = s.vx * sn + s.vy * c;
    if (broken) s.speed *= 1 + 0.18 * dt;
    s.vx = vx; s.vy = vy;
    const pxPerS = rReal * PX_PER_M * omega * VIS * s.speed;   // screen speed so that the radius is r
    s.x += s.vx * pxPerS * dt; s.y += s.vy * pxPerS * dt;
    s.trail.push([s.x, s.y]);
    if (s.trail.length > 600) s.trail.shift();
    if (s.x < -60 || s.x > W + 60 || s.y < -60 || s.y > H + 60 || s.speed > 6) reset();
    setTick(n => (n + 1) & 0xffff);
  });

  const s = st.current;
  const trail = s.trail.map((pt, i) => `${i ? "L" : "M"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join("");
  // force: towards the centre (perpendicular to v), tilted forwards when broken
  const sideX = q > 0 ? s.vy : -s.vy, sideY = q > 0 ? -s.vx : s.vx;
  const fx = broken ? sideX * 0.85 + s.vx * 0.5 : sideX, fy = broken ? sideY * 0.85 + s.vy * 0.5 : sideY;

  return (
    <Figure title={tx(t, "figPhLor_title", "A charge in a magnetic field")}
      head={<Btn active={broken} onClick={() => { setBroken(b => !b); reset(); }}>{tx(t, "figPhLor_broken", "break it: a force with a forward push")}</Btn>}
      controls={<>
        <Row>
          <Choice value={kind} onChange={k => { setKind(k); reset(); }} options={[
            ["proton", tx(t, "figPhLor_proton", "proton")],
            ["deuteron", tx(t, "figPhLor_deuteron", "deuteron (2 × mass)")],
            ["alpha", tx(t, "figPhLor_alpha", "alpha (4 × mass, 2 × charge)")],
          ]} />
          <Btn active={neg} onClick={() => { reset(!neg); setNeg(!neg); }}>{tx(t, "figPhLor_flip", "flip the charge")}</Btn>
        </Row>
        <Sliders>
          <Slider label={tx(t, "figPhLor_v", "speed")} value={v} min={0.3} max={3} step={0.05} onChange={x => { setV(x); reset(); }} fmt={x => `${f2(x, 2)}×10⁶ m/s`} />
          <Slider label="B" value={B} min={0.05} max={0.5} step={0.01} onChange={x => { setB(x); reset(); }} fmt={x => `${f2(x, 2)} T`} />
        </Sliders>
        <Row>
          <Readout color={C.green}>{`r = mv/(|q|B) = ${f2(rReal * 100, 1)} cm`}</Readout>
          <Readout color={C.sky}>{`T = 2πm/(|q|B) = ${f2(period * 1e9, 0)} ns`}</Readout>
          <Readout color={broken ? C.red : C.amber}>{`${tx(t, "figPhLor_ke", "kinetic energy")} = ${f2(ke, 2)} keV`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhLor_note", "The field points into the screen. The force on the moving charge, in red, always points sideways, at right angles to its motion, so the particle runs round a circle at constant speed and its energy never changes. Speed it up and the circle grows in proportion; strengthen the field and it shrinks. Watch the time for one turn: it does not change with speed, because a faster particle runs a bigger circle in the same time. Try the deuteron, twice as heavy with the same charge: its circle is twice as big, which is how a mass spectrometer sorts atoms by mass. Flip the charge and it curls the other way. Then break it: tilt the force a little forwards and it does work, the particle speeds up, spirals out, and gains energy from the field. A real magnetic force never does, because it is always perpendicular to the velocity.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {Array.from({ length: 8 }, (_, j) => Array.from({ length: 14 }, (_, i) => (
            <T key={`${i}-${j}`} x={20 + i * 40} y={24 + j * 40} anchor="middle" size={10} color={C.muted}>×</T>
          )))}
          <path d={trail} fill="none" stroke={q > 0 ? C.amber : C.purple} strokeWidth={1.8} opacity={0.85} />
          <Vec a={{ x: s.x, y: s.y }} b={{ x: s.x + 34 * s.vx, y: s.y + 34 * s.vy }} color={C.sky} w={2} />
          <Vec a={{ x: s.x, y: s.y }} b={{ x: s.x + 30 * fx, y: s.y + 30 * fy }} color={C.red} w={2} />
          <circle cx={s.x} cy={s.y} r={6} fill={q > 0 ? C.amber : C.purple} />
          <T x={s.x} y={s.y + 3.5} anchor="middle" color="#fff" size={9} bold>{q > 0 ? "+" : "−"}</T>
          <T x={10} y={H - 10} size={8.5}>{`B ${tx(t, "figPhLor_into", "into the screen")} · ${tx(t, "figPhLor_slow", "slowed down for viewing")} · 1 px = 1 mm`}</T>
          <T x={W - 10} y={18} anchor="end" size={8.5} color={C.sky}>{tx(t, "figPhLor_vLabel", "blue: velocity")}</T>
          <T x={W - 10} y={32} anchor="end" size={8.5} color={C.red}>{tx(t, "figPhLor_fLabel", "red: force")}</T>
        </svg>
      </div>
    </Figure>
  );
}

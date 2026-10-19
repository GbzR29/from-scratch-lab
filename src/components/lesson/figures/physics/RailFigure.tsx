"use client";

import { useRef, useState, type ReactElement } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, Vec, Handle, useDrag, useFrame, useVisible, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A metal rod of length L = 0.5 m and mass m = 0.1 kg slides on two rails
// joined by a resistor R, in a uniform field B into the screen. As the rod
// moves, the loop's area and so the flux through it change: the emf is
// ε = BLv, the current I = ε/R, and the field pushes on that current with
// F = BIL = B²L²v/R, always against the motion (Lenz). With nothing else
// acting, the speed dies away exponentially with τ = mR/(B²L²); a steady pull
// F gives a terminal speed v = FR/(B²L²). Every joule of kinetic energy lost
// turns up as heat I²R in the resistor.
// "break it: reverse Lenz" makes the induced current flow the other way: the
// force then pushes the rod forwards, it speeds up on its own and the energy
// ledger stops balancing.

const W = 560, H = 260;
const L = 0.5, MASS = 0.1;
const PX = 240;                                   // px per metre
const X0 = 40, Y_TOP = 70, Y_BOT = Y_TOP + L * PX;
const XMIN = 0.15, XMAX = 1.9;
const sx = (x: number) => X0 + x * PX;

/** The field into the screen, drawn as a grid of small crosses. */
function fieldCrosses(B: number) {
  const out: ReactElement[] = [];
  for (let y = 30; y < H - 10; y += 30) for (let x = 60; x < W - 10; x += 30) out.push(
    <path key={`${x}-${y}`} d={`M${x - 3},${y - 3} L${x + 3},${y + 3} M${x - 3},${y + 3} L${x + 3},${y - 3}`} stroke={C.muted} strokeWidth={1} opacity={0.15 + 0.35 * (B / 1.5)} />,
  );
  return out;
}

export function RailFigure({ t }: { t?: TrackTranslations }) {
  const [B, setB] = useState(0.8);
  const [R, setR] = useState(0.5);
  const [pull, setPull] = useState(0);
  const [broken, setBroken] = useState(false);
  const [s, setS] = useState({ x: 0.4, v: 0, put: 0, heat: 0, dots: 0 });
  const dragT = useRef<{ x: number; time: number } | null>(null);
  const vis = useVisible<HTMLDivElement>();

  const sign = broken ? -1 : 1;                   // +1: the induced force opposes the motion
  const k = (B * B * L * L) / (MASS * R);         // 1/τ

  const drag = useDrag<number>(
    p => (Math.abs(p.x - sx(s.x)) < 20 && p.y > Y_TOP - 20 && p.y < Y_BOT + 20 ? 0 : null),
    (_, p) => {
      const x = clamp((p.x - X0) / PX, XMIN, XMAX), now = performance.now() / 1000;
      const last = dragT.current;
      dragT.current = { x, time: now };
      setS(q => {
        const dtt = last ? Math.max(now - last.time, 1e-3) : 1;
        const v = last ? 0.6 * q.v + 0.4 * (x - last.x) / dtt : 0;
        // the work done by hand on the motion: the change in kinetic energy
        return { ...q, x, v, put: q.put + 0.5 * MASS * (v * v - q.v * q.v) };
      });
    },
  );
  useFrame(vis.on, dt => setS(p => {
    if (drag.dragging === null) dragT.current = null;
    if (dragT.current) {
      // held by hand: the hand supplies the heat the current makes
      const I = (B * L * p.v) / R, q = I * I * R * dt;
      return { ...p, heat: p.heat + q, put: p.put + q, dots: p.dots + I * dt * 40 * sign };
    }
    let { x, v, put, heat } = p;
    const n = 20, h = dt / n;
    for (let i = 0; i < n; i++) {
      const I = (B * L * v) / R;
      heat += I * I * R * h;
      put += pull * v * h;
      v += (pull / MASS - sign * k * v) * h;
      x += v * h;
      // hitting a stop at either end: the lost motion becomes heat in the bump
      if (x > XMAX) { x = XMAX; if (v > 0) { heat += 0.5 * MASS * v * v; v = 0; } }
      if (x < XMIN) { x = XMIN; if (v < 0) { heat += 0.5 * MASS * v * v; v = 0; } }
    }
    const I = (B * L * v) / R;
    return { x, v, put, heat, dots: p.dots + I * dt * 40 * sign };
  }));

  const emf = B * L * s.v, I = emf / R;
  const fMag = -sign * B * I * L;                 // N, + = to the right
  const ke = 0.5 * MASS * s.v * s.v;
  const total = ke + s.heat;
  const kick = () => setS(p => ({ ...p, v: p.v + 2, put: p.put + 0.5 * MASS * ((p.v + 2) ** 2 - p.v * p.v) }));
  const reset = () => setS({ x: 0.4, v: 0, put: 0, heat: 0, dots: 0 });

  // current dots round the loop, anticlockwise for positive I·sign
  const xr = sx(s.x), w = xr - X0, hgt = Y_BOT - Y_TOP, per = 2 * (w + hgt);
  const dotAt = (d: number) => {
    let u = ((d % per) + per) % per;
    if (u < w) return { x: X0 + u, y: Y_BOT };
    u -= w; if (u < hgt) return { x: xr, y: Y_BOT - u };
    u -= hgt; if (u < w) return { x: xr - u, y: Y_TOP };
    u -= w; return { x: X0, y: Y_TOP + u };
  };
  const nDots = Math.max(4, Math.round(per / 26));
  const crosses = fieldCrosses(B);
  // forces on a log scale (they span 1000×), speed at 40 px per m/s
  const arrow = (f: number) => clamp(60 * Math.sign(f) * Math.log10(1 + Math.abs(f) * 10), -90, 90);
  const speedArrow = (v: number) => clamp(40 * v, -90, 90);

  return (
    <Figure title={tx(t, "figPhRail_title", "A rod sliding through a magnetic field")}
      head={<Btn active={broken} onClick={() => { setBroken(b => !b); reset(); }}>{tx(t, "figPhRail_broken", "break it: reverse Lenz")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label="B" value={B} min={0.1} max={1.5} step={0.05} onChange={setB} fmt={v => `${f2(v, 2)} T`} />
          <Slider label="R" value={R} min={0.1} max={2} step={0.05} onChange={setR} fmt={v => `${f2(v, 2)} Ω`} />
          <Slider label={tx(t, "figPhRail_pull", "steady pull F")} value={pull} min={0} max={0.5} step={0.01} onChange={setPull} fmt={v => `${f2(v, 2)} N`} />
        </Sliders>
        <Row>
          <Btn onClick={kick}>{tx(t, "figPhRail_kick", "kick it (+2 m/s)")}</Btn>
          <Btn onClick={reset}>{tx(t, "figPhRail_reset", "start again")}</Btn>
          <Readout color={C.green}>{`v = ${f2(s.v, 2)} m/s`}</Readout>
          <Readout color={C.amber}>{`ε = BLv = ${f2(emf, 3)} V`}</Readout>
          <Readout color={C.sky}>{`I = ${f2(I, 3)} A`}</Readout>
          <Readout color={C.red}>{`F = BIL = ${f2(Math.abs(fMag), 3)} N ${fMag * s.v < 0 ? tx(t, "figPhRail_against", "against v") : fMag * s.v > 0 ? tx(t, "figPhRail_with", "with v") : ""}`}</Readout>
        </Row>
        <Row>
          <Readout color={C.green}>{`τ = mR/(B²L²) = ${f2(1 / k, 2)} s`}</Readout>
          {pull > 0 && !broken && <Readout>{`${tx(t, "figPhRail_terminal", "terminal speed")} FR/(B²L²) = ${f2(pull / (MASS * k), 2)} m/s`}</Readout>}
          <Readout>{`${tx(t, "figPhRail_in", "energy put in")} = ${f2(s.put, 3)} J`}</Readout>
          <Readout color={Math.abs(total - s.put) > 0.02 + 0.05 * s.put ? C.red : C.fg}>{`${tx(t, "figPhRail_out", "kinetic + heat")} = ${f2(total, 3)} J`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhRail_note", "Kick the rod. As it slides, the loop of rod, rails and resistor grows, so more field lines pass through it: the changing flux drives a current round the loop, shown by the moving dots. The field pushes on that current in the rod, and the push points backwards, against the motion: the rod slows down and stops, faster with a stronger field or a smaller resistance. Drag it by hand and feel the same thing in the numbers: the faster you move it, the harder it pushes back. Set a steady pull and the rod settles at the speed where the backward push balances it. The two energy readouts always agree: every joule you put in ends up as motion or as heat in the resistor. Now reverse Lenz's law: the current flows the other way, the push points forwards, and one small kick sends the rod racing off on its own, with energy appearing from nowhere. The minus sign in Faraday's law is energy conservation.")}>
      <div ref={vis.ref}>
        <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {crosses}
          <rect x={X0} y={Y_TOP} width={w} height={hgt} fill={C.amber} opacity={0.12} />
          <line x1={X0} y1={Y_TOP} x2={W - 20} y2={Y_TOP} stroke={C.fg} strokeWidth={3} />
          <line x1={X0} y1={Y_BOT} x2={W - 20} y2={Y_BOT} stroke={C.fg} strokeWidth={3} />
          <rect x={X0 - 9} y={Y_TOP + 30} width={18} height={hgt - 60} fill="var(--code-bg)" />
          <path d={`M${X0},${Y_TOP} V${Y_TOP + 30} ${[0, 1, 2, 3, 4, 5].map(i => `L${X0 + (i % 2 ? -8 : 8)},${Y_TOP + 35 + i * 10}`).join(" ")} L${X0},${Y_BOT - 30} V${Y_BOT}`}
            fill="none" stroke={C.fg} strokeWidth={1.8} />
          <T x={X0 - 12} y={(Y_TOP + Y_BOT) / 2 + 3} anchor="end" size={9} color={C.fg}>R</T>
          {Math.abs(I) > 1e-4 && Array.from({ length: nDots }, (_, i) => {
            const d = dotAt(s.dots + (i * per) / nDots);
            return <circle key={i} cx={d.x} cy={d.y} r={2.8} fill={C.sky} />;
          })}
          <rect x={xr - 5} y={Y_TOP - 12} width={10} height={hgt + 24} rx={2} fill={C.fg} opacity={drag.dragging === 0 ? 0.75 : 0.9} />
          <Handle x={xr} y={Y_TOP - 20} color={C.amber} r={3.5} active={drag.dragging === 0} />
          {Math.abs(s.v) > 0.02 && <Vec a={{ x: xr, y: Y_TOP + hgt * 0.3 }} b={{ x: xr + speedArrow(s.v), y: Y_TOP + hgt * 0.3 }} color={C.green} w={2.5} />}
          {Math.abs(fMag) > 1e-3 && <Vec a={{ x: xr, y: Y_TOP + hgt * 0.55 }} b={{ x: xr + arrow(fMag), y: Y_TOP + hgt * 0.55 }} color={C.red} w={2.5} />}
          {pull > 0 && <Vec a={{ x: xr, y: Y_TOP + hgt * 0.8 }} b={{ x: xr + arrow(pull), y: Y_TOP + hgt * 0.8 }} color={C.amber} w={2.5} />}
          <T x={xr + 8} y={Y_BOT + 26} size={8.5} color={C.fg}>{`L = 0.5 m`}</T>
          <T x={W - 20} y={22} anchor="end" size={8.5}>{tx(t, "figPhRail_key", "× field into the screen · shaded: the loop's area · green v, red magnetic force, amber pull")}</T>
          <T x={W - 20} y={H - 8} anchor="end" size={8}>{`m = 0.1 kg · 1 m = 240 px`}</T>
        </svg>
      </div>
    </Figure>
  );
}

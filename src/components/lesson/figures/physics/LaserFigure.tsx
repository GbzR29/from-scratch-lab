"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A laser built from 300 atoms between two mirrors, simulated atom by atom.
// Levels (four-level scheme): 0 ground → (pump) → 3 → (fast) → 2 → (laser
// light) → 1 → (fast) → 0. In the three-level scheme the lower laser level
// is the ground state itself.
// Per atom and per small time step dt (time unit = the upper level's
// lifetime):
//   pump        0 → 3 with chance P·dt;     3 → 2 with chance 40·dt
//   spontaneous 2 → 1 with chance 1·dt; one in 50 of these photons happens
//               to travel along the axis and joins the cavity
//   stimulated  2 → 1 with chance g·n·dt, adding a copy of a cavity photon
//   absorption  1 → 2 with chance g·n·dt, removing one
//   (four-level) 1 → 0 with chance 40·dt
// Cavity photons leak through the front mirror with chance κ·dt each: that
// leak is the laser beam. Gain beats loss when g·(N₂ − N₁) > κ, so the
// threshold inversion is N₂ − N₁ = κ/g = 150 here.
// "break it: two-level pump" pumps the laser transition directly with light;
// the pump then stimulates emission as often as it excites, so N₂ can never
// pass N₁ and the laser never starts.

const W = 560, H = 268, NA = 300;
const G = 0.01, KAPPA = 1.5, FAST = 40, BETA = 1 / 50, DT = 0.004, SPEED = 1.2;
const THRESH = KAPPA / G;
const LVL_COL = ["#64748b", "#94a3b8", "#f59e0b", "#a855f7"];

export function LaserFigure({ t }: { t?: TrackTranslations }) {
  const [scheme, setScheme] = useState<"four" | "three">("four");
  const [pump, setPump] = useState(3);
  const [broken, setBroken] = useState(false);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const sim = useRef({
    lvl: new Uint8Array(NA), n: 0, out: [] as number[], acc: 0, outCount: 0, rnd: mulberry32(9),
    invAvg: 0, nAvg: 0,                               // running averages over ~half a second
    pos: Array.from({ length: NA }, (_, i) => { const r = mulberry32(100 + i); return [r(), r()] as [number, number]; }),
  });

  const reset = () => { const s = sim.current; s.lvl.fill(0); s.n = 0; s.out = []; s.acc = 0; s.invAvg = 0; s.nAvg = 0; rerender(); };

  const step = () => {
    const s = sim.current, r = s.rnd, lvl = s.lvl;
    const four = scheme === "four" && !broken, lower = four ? 1 : 0;
    let n = s.n, leaked = 0;
    for (let i = 0; i < NA; i++) {
      const L = lvl[i];
      if (broken) {
        // pump light drives 0 ↔ 2 both ways at the same rate
        if (L === 0 && r() < pump * DT) lvl[i] = 2;
        else if (L === 2 && r() < pump * DT) lvl[i] = 0;
      } else if (L === 0 && r() < pump * DT) { lvl[i] = 3; continue; }
      if (L === 3) { if (r() < FAST * DT) lvl[i] = 2; continue; }
      if (lvl[i] === 2) {
        const u = r();
        if (u < DT) { lvl[i] = lower; if (r() < BETA) n++; }
        else if (u < DT + G * n * DT) { lvl[i] = lower; n++; }
        continue;
      }
      if (lvl[i] === lower && n > 0 && r() < G * n * DT) { lvl[i] = 2; n--; continue; }
      if (four && lvl[i] === 1 && r() < FAST * DT) lvl[i] = 0;
    }
    for (let k = n; k > 0; k--) if (r() < KAPPA * DT) leaked++;
    s.n = n - leaked;
    return leaked;
  };

  useFrame(playing && vis.on, dt => {
    const s = sim.current, steps = Math.round((dt * SPEED) / DT);
    let leaked = 0;
    for (let k = 0; k < steps; k++) leaked += step();
    s.acc += leaked; s.outCount++;
    if (s.outCount >= 3) { s.out.push(s.acc / (3 * dt * SPEED || 1)); s.acc = 0; s.outCount = 0; if (s.out.length > 120) s.out.shift(); }
    const lower = scheme === "four" && !broken ? 1 : 0;
    let inv = 0;
    for (let i = 0; i < NA; i++) inv += s.lvl[i] === 2 ? 1 : s.lvl[i] === lower ? -1 : 0;
    const k = Math.min(1, dt * 2);
    s.invAvg += (inv - s.invAvg) * k; s.nAvg += (s.n - s.nAvg) * k;
    rerender();
  });

  const s = sim.current;
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < NA; i++) counts[s.lvl[i]]++;
  const four = scheme === "four" && !broken;
  const inversion = Math.round(s.invAvg);
  const lasing = s.nAvg > 40;
  const outNow = s.out.length ? s.out[s.out.length - 1] : 0;

  // level diagram
  const LX = 26, LW = 90;
  const ly = four ? [222, 176, 110, 60] : [222, 222, 110, 60];
  // cavity
  const MX0 = 168, MX1 = 470, CY0 = 70, CY1 = 196;
  const glow = Math.min(1, s.n / 300);
  // output trace
  const TX0 = 486, TX1 = 552, TY0 = 70, TY1 = 196;
  const outMax = 1000;
  const trace = s.out.map((v, i) => `${i ? "L" : "M"}${(TX0 + (i / 119) * (TX1 - TX0)).toFixed(1)},${(TY1 - Math.min(1, v / outMax) * (TY1 - TY0)).toFixed(1)}`).join("");

  return (
    <Figure title={tx(t, "figPhLaser_title", "A laser, atom by atom")}
      head={<Btn active={broken} onClick={() => { setBroken(b => !b); reset(); }}>{tx(t, "figPhLaser_broken", "break it: two-level pump")}</Btn>}
      controls={<>
        {!broken && <Row>
          <Choice value={scheme} onChange={v => { setScheme(v); reset(); }} options={[
            ["four", tx(t, "figPhLaser_four", "four levels")],
            ["three", tx(t, "figPhLaser_three", "three levels")],
          ] as const} />
        </Row>}
        <Slider label={tx(t, "figPhLaser_pump", "pump rate P")} value={pump} min={0} max={8} step={0.1} onChange={setPump} fmt={v => f2(v, 1)} width="w-32" />
        <Row>
          <Readout color={inversion > 0 ? C.green : C.red}>{`N₂ − N₁ ≈ ${inversion} (${tx(t, "figPhLaser_avg", "average")})`}</Readout>
          <Readout color={C.muted}>{`${tx(t, "figPhLaser_thresh", "threshold")} κ/g = ${THRESH}`}</Readout>
          <Readout color={lasing ? C.red : C.muted}>{`${tx(t, "figPhLaser_n", "photons in the cavity")}: ${Math.round(s.nAvg)}`}</Readout>
          <Readout color={lasing ? C.green : C.muted}>{lasing ? tx(t, "figPhLaser_on", "lasing") : tx(t, "figPhLaser_off", "below threshold: a faint glow")}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhLaser_note", "An excited atom can drop to a lower level on its own (spontaneous emission, in a random direction) or be pushed down by a passing photon of the right energy, and then it emits a copy of that photon, same direction, same phase (stimulated emission). A photon can also be absorbed by an atom in the lower level. With most atoms down, absorption wins and light dies out. To amplify, you need more atoms in the upper laser level than in the lower one: a population inversion. Two mirrors send the photons back and forth through the atoms many times, and one mirror lets a little through: the beam. Raise the pump. In the four-level scheme the lower laser level empties at once, so inversion comes cheap, and above the threshold the photon count shoots up and the inversion stops growing, hovering near the threshold (a little below on average, because the light comes in bursts): every extra pumped atom now becomes laser light. In the three-level scheme the lower level is the ground state, full of atoms, so you must pump more than half of them up first: the threshold is much higher (the first laser, ruby, worked like this). Break it by pumping with light at the laser frequency itself: the pump stimulates emission as often as it excites, so the atoms can never be more than half up and the laser never starts.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* energy levels with their populations */}
          <T x={LX} y={20} size={8}>{tx(t, "figPhLaser_levels", "levels and atoms in each")}</T>
          {(four ? [0, 1, 2, 3] : [0, 2, 3]).filter(k => !(broken && k === 3)).map(k => (
            <g key={k}>
              <line x1={LX} y1={ly[k]} x2={LX + LW} y2={ly[k]} stroke={LVL_COL[k]} strokeWidth={2} />
              <rect x={LX} y={ly[k] - 3 - Math.min(26, counts[k] / 10)} width={8} height={Math.min(26, counts[k] / 10)} fill={LVL_COL[k]} />
              <T x={LX - 5} y={ly[k] + 3} anchor="end" size={8} color={LVL_COL[k]} bold>{`${k}`}</T>
              <T x={LX + LW + 4} y={ly[k] + 3} size={8} color={LVL_COL[k]}>{`${counts[k]}`}</T>
            </g>
          ))}
          {!broken && <path d={`M${LX + 28},${ly[0] - 2}V${ly[3] + 6}`} stroke={C.sky} strokeWidth={1.5} markerEnd="" />}
          {!broken && <T x={LX + 32} y={(ly[0] + ly[3]) / 2 + 44} size={7.5} color={C.sky}>{tx(t, "figPhLaser_pumpL", "pump")}</T>}
          <path d={`M${LX + 70},${ly[2] + 2}V${ly[four ? 1 : 0] - 4}`} stroke={C.red} strokeWidth={2.5} />
          <T x={LX + 74} y={(ly[2] + ly[four ? 1 : 0]) / 2} size={7.5} color={C.red}>{tx(t, "figPhLaser_laserL", "laser")}</T>
          {broken && <path d={`M${LX + 34},${ly[0] - 2}V${ly[2] + 4}`} stroke={C.sky} strokeWidth={1.5} strokeDasharray="3 2" />}

          {/* the cavity */}
          <rect x={MX0} y={CY0} width={MX1 - MX0} height={CY1 - CY0} fill={C.red} opacity={0.05 + 0.4 * glow} rx={6} />
          <rect x={MX0 - 9} y={CY0 - 10} width={7} height={CY1 - CY0 + 20} rx={2} fill={C.fg} opacity={0.85} />
          <rect x={MX1 + 2} y={CY0 - 10} width={7} height={CY1 - CY0 + 20} rx={2} fill={C.fg} opacity={0.45} />
          {Array.from({ length: NA }, (_, i) => {
            const [u, v] = s.pos[i], L = s.lvl[i];
            return <circle key={i} cx={MX0 + 6 + u * (MX1 - MX0 - 12)} cy={CY0 + 6 + v * (CY1 - CY0 - 12)} r={L >= 2 ? 2.6 : 1.8} fill={LVL_COL[L]} opacity={L >= 2 ? 0.95 : 0.6} />;
          })}
          {lasing && <line x1={MX0} y1={(CY0 + CY1) / 2} x2={MX1} y2={(CY0 + CY1) / 2} stroke={C.red} strokeWidth={2 + 6 * glow} opacity={0.35 + 0.4 * glow} />}
          <T x={MX0} y={CY0 - 16} size={8}>{tx(t, "figPhLaser_mirror", "full mirror")}</T>
          <T x={MX1 + 8} y={CY0 - 16} anchor="end" size={8}>{tx(t, "figPhLaser_partial", "leaky mirror")}</T>
          <T x={MX0} y={CY1 + 22} size={8}>{tx(t, "figPhLaser_key", "amber = upper laser level, purple = pump level")}</T>

          {/* the beam out */}
          <line x1={MX1 + 9} y1={(CY0 + CY1) / 2} x2={TX0 - 4} y2={(CY0 + CY1) / 2} stroke={C.red} strokeWidth={1 + 5 * Math.min(1, outNow / outMax)} opacity={0.2 + 0.8 * Math.min(1, outNow / outMax)} />
          <rect x={TX0} y={TY0} width={TX1 - TX0} height={TY1 - TY0} fill="none" stroke={C.axis} />
          <path d={trace} fill="none" stroke={C.red} strokeWidth={1.4} />
          <T x={TX0} y={TY0 - 6} size={7.5}>{tx(t, "figPhLaser_out", "output")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={reset} />
      </div>
    </Figure>
  );
}

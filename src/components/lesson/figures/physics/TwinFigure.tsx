"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The twin paradox on a spacetime diagram (x in light-years across, time in
// years up). One twin stays on Earth (sky, the vertical line x = 0). The other
// (pink) flies to a star D light-years away at βc, turns round at once and
// flies back. Dots mark each twin's birthdays: every year of their own,
// proper, time. Earth's dots are one year apart in t; the traveller's are γ
// years apart in t, because a moving clock runs slow. Total ages:
// Earth 2D/β, traveller 2D/(βγ).
// "lines of simultaneity" draws, at the turnaround, the traveller's line of
// "now" just before turning (it slopes up with slope β) and just after (it
// slopes down). Jumping from one to the other, the traveller's idea of the
// Earth's present leaps forward by 2βD years (the amber stretch of Earth's
// line): that is where the "missing" Earth years go, and why the situation
// is not symmetric: only the traveller changed frames.

const W = 560, H = 300;
const GX0 = 46, GY0 = 278, GW = 280, GH = 262;     // diagram origin (bottom left) and size

export function TwinFigure({ t }: { t?: TrackTranslations }) {
  const [beta, setBeta] = useState(0.8);
  const [D, setD] = useState(4);
  const [sim, setSim] = useState(true);

  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const tTurn = D / beta, tEarth = 2 * tTurn, tTrav = tEarth / gamma;
  const sc = Math.min(GH / tEarth, GW / Math.max(D, 1));     // px per year (and per light-year)
  const X = (x: number) => GX0 + x * sc, Y = (tt: number) => GY0 - tt * sc;

  const earthDots = Array.from({ length: Math.floor(tEarth + 1e-9) + 1 }, (_, k) => k);
  const travDots = Array.from({ length: Math.floor(tTrav + 1e-9) + 1 }, (_, k) => {
    const tc = k * gamma;                                      // coordinate time of the k-th birthday
    return { x: tc <= tTurn ? beta * tc : D - beta * (tc - tTurn), t: tc };
  });
  const before = tTurn - beta * D, after = tTurn + beta * D;   // where the two "now" lines hit Earth

  return (
    <Figure title={tx(t, "figPhTwin_title", "The twin paradox on a spacetime diagram")}
      head={<Btn active={sim} onClick={() => setSim(s => !s)}>{tx(t, "figPhTwin_sim", "lines of simultaneity")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label="β = v/c" value={beta} min={0.1} max={0.99} step={0.01} onChange={setBeta} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figPhTwin_dist", "distance D")} value={D} min={1} max={10} step={0.5} onChange={setD} fmt={v => `${f2(v, 1)} ly`} />
        </Sliders>
        <Row>
          <Readout color={C.sky}>{`${tx(t, "figPhTwin_earth", "Earth twin ages")} 2D/β = ${f2(tEarth, 2)} ${tx(t, "figPhTwin_yr", "yr")}`}</Readout>
          <Readout color={C.pink}>{`${tx(t, "figPhTwin_trav", "traveller ages")} 2D/(βγ) = ${f2(tTrav, 2)} ${tx(t, "figPhTwin_yr", "yr")}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figPhTwin_jump", "jump in the traveller's \"now\" for Earth")}: 2βD = ${f2(2 * beta * D, 2)} ${tx(t, "figPhTwin_yr", "yr")}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhTwin_note", "Time runs up, distance across, in years and light-years, so light would move at 45°. The Earth twin stays put: a vertical line with a dot at every birthday. The traveller goes out to the star and back: two slanted lines, with birthdays further apart, because the traveller's clock runs slow in Earth's frame. At 0.8c to a star 4 light-years away, the Earth twin ages 10 years and the traveller 6. But from the ship, isn't Earth the one moving? Switch on the lines of simultaneity, the traveller's \"now\" at the moment of turning. On the way out it slopes one way; on the way back, the other. In the instant of turning round, the traveller's idea of what is happening \"now\" on Earth jumps forward by the amber stretch. The twins are not symmetric: only one of them changed frames, and spacetime paths with a corner are shorter in time than straight ones.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={GX0} y1={GY0} x2={GX0 + GW} y2={GY0} stroke={C.axis} />
        <line x1={GX0} y1={GY0} x2={GX0} y2={GY0 - GH - 4} stroke={C.axis} />
        <line x1={X(D)} y1={GY0} x2={X(D)} y2={Y(tEarth)} stroke={C.grid} strokeDasharray="3 4" />
        <T x={X(D)} y={GY0 + 13} anchor="middle" size={8}>{tx(t, "figPhTwin_star", "star")}</T>
        <T x={GX0} y={GY0 + 13} anchor="middle" size={8}>{tx(t, "figPhTwin_earthL", "Earth")}</T>
        <T x={GX0 + GW} y={GY0 + 13} anchor="end" size={8}>{tx(t, "figPhTwin_x", "x (light-years)")}</T>
        <T x={GX0 - 6} y={GY0 - GH + 4} anchor="end" size={8}>t</T>
        <line x1={X(0)} y1={Y(0)} x2={X(Math.min(D, tEarth * 0.6))} y2={Y(Math.min(D, tEarth * 0.6))} stroke={C.amber} strokeDasharray="3 4" opacity={0.6} />

        {sim && <>
          <line x1={X(0)} y1={Y(before)} x2={X(D)} y2={Y(tTurn)} stroke={C.pink} strokeDasharray="5 3" opacity={0.7} />
          <line x1={X(0)} y1={Y(after)} x2={X(D)} y2={Y(tTurn)} stroke={C.pink} strokeDasharray="5 3" opacity={0.7} />
          <line x1={X(0)} y1={Y(before)} x2={X(0)} y2={Y(after)} stroke={C.amber} strokeWidth={6} opacity={0.6} />
        </>}
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(tEarth)} stroke={C.sky} strokeWidth={2.4} />
        <path d={`M${X(0)},${Y(0)} L${X(D)},${Y(tTurn)} L${X(0)},${Y(tEarth)}`} fill="none" stroke={C.pink} strokeWidth={2.4} />
        {earthDots.map(k => <circle key={k} cx={X(0)} cy={Y(k)} r={2.6} fill={C.sky} />)}
        {travDots.map((d, k) => <circle key={k} cx={X(d.x)} cy={Y(d.t)} r={2.6} fill={C.pink} />)}

        <T x={360} y={50} size={9} color={C.sky} bold>{tx(t, "figPhTwin_earthLine", "Earth twin")}</T>
        <T x={360} y={64} size={8.5}>{`${f2(tEarth, 1)} ${tx(t, "figPhTwin_birthdays", "birthdays")}`}</T>
        <T x={360} y={92} size={9} color={C.pink} bold>{tx(t, "figPhTwin_travLine", "travelling twin")}</T>
        <T x={360} y={106} size={8.5}>{`${f2(tTrav, 1)} ${tx(t, "figPhTwin_birthdays", "birthdays")}`}</T>
        <T x={360} y={134} size={8.5}>{`γ = ${f2(gamma, 3)}`}</T>
        <T x={360} y={160} size={8} color={C.amber}>{tx(t, "figPhTwin_light", "dashed amber: a light ray")}</T>
        <T x={360} y={174} size={8}>{tx(t, "figPhTwin_dots", "dots: one year of each twin's life")}</T>
      </svg>
    </Figure>
  );
}

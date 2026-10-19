"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A clock in a circular orbit at altitude h, compared with a clock on the
// ground, in microseconds gained per day. Two effects:
//  • special relativity: the orbiting clock moves at v = √(GM/r), so it runs
//    slow by v²/2c² (sky curve, negative);
//  • general relativity: it sits higher in Earth's gravity, so it runs fast
//    by (GM/c²)(1/R − 1/r) (pink curve, positive).
// Their sum (amber) is the net drift. Both are first-order approximations,
// excellent at these tiny sizes; the Earth's own rotation (ground clock moving
// at up to 465 m/s) changes the result by less than 0.1 µs/day and is left
// out. Markers: the International Space Station, GPS satellites and
// geostationary satellites. The net is zero at r = 1.5 R (3 190 km up).
// The last readout is how far a position fix would wander per day if the GPS
// clocks were not corrected: the drift times c.

const W = 560, H = 270;
const GM = 3.986004e14, R = 6.371e6, C2 = 299792458 ** 2, DAY = 86400;
const HMAX = 40000;                                  // km
const PX0 = 50, PX1 = 545, PY0 = 24, PY1 = 236;
const YMIN = -35, YMAX = 55;                         // µs/day

const sr = (hkm: number) => { const r = R + hkm * 1000; return -(GM / r) / (2 * C2) * DAY * 1e6; };
const gr = (hkm: number) => { const r = R + hkm * 1000; return (GM / C2) * (1 / R - 1 / r) * DAY * 1e6; };
const MARKS: [string, number][] = [["ISS", 408], ["GPS", 20200], ["GEO", 35786]];

export function ClockRateFigure({ t }: { t?: TrackTranslations }) {
  const [h, setH] = useState(20200);
  const [days, setDays] = useState(false);

  const px = (k: number) => PX0 + (k / HMAX) * (PX1 - PX0);
  const py = (us: number) => PY1 - ((us - YMIN) / (YMAX - YMIN)) * (PY1 - PY0);
  const curve = (f: (k: number) => number) => Array.from({ length: 201 }, (_, i) => { const k = (i / 200) * HMAX; return `${i ? "L" : "M"}${px(k).toFixed(1)},${py(f(k)).toFixed(1)}`; }).join("");
  const s = sr(h), g = gr(h), net = s + g;
  const errKm = (Math.abs(net) * 1e-6 * 299792458) / 1000;

  return (
    <Figure title={tx(t, "figPhGps_title", "Clocks in orbit: fast or slow?")}
      head={<Btn active={days} onClick={() => setDays(d => !d)}>{tx(t, "figPhGps_week", "uncorrected for a week")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhGps_h", "altitude")} value={h} min={0} max={HMAX} step={50} onChange={setH} fmt={v => `${f2(v, 0)} km`} width="w-20" />
        <Row>
          {MARKS.map(([k, v]) => <Btn key={k} active={h === v} onClick={() => setH(v)}>{k}</Btn>)}
        </Row>
        <Row>
          <Readout color={C.sky}>{`${tx(t, "figPhGps_sr", "speed (special)")}: ${f2(s, 1)} µs/${tx(t, "figPhGps_day", "day")}`}</Readout>
          <Readout color={C.pink}>{`${tx(t, "figPhGps_gr", "height (general)")}: +${f2(g, 1)} µs/${tx(t, "figPhGps_day", "day")}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figPhGps_net", "net")}: ${net >= 0 ? "+" : ""}${f2(net, 1)} µs/${tx(t, "figPhGps_day", "day")}`}</Readout>
          <Readout color={C.red}>{`${tx(t, "figPhGps_err", "position error if uncorrected")}: ${f2(errKm * (days ? 7 : 1), 1)} km${days ? ` ${tx(t, "figPhGps_perWeek", "after a week")}` : ` ${tx(t, "figPhGps_perDay", "per day")}`}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhGps_note", "A clock in orbit differs from a clock on the ground for two reasons pulling opposite ways. It moves fast, so special relativity slows it (sky). It sits higher up in Earth's gravity, so general relativity speeds it up (pink): clocks deeper in gravity run slower. Low orbits are dominated by speed: the Space Station's clocks lose about 25 µs a day. High orbits are dominated by height: GPS satellites, 20 200 km up, gain 45.7 µs a day from gravity and lose 7.2 from speed, a net 38.5 µs a day. That sounds tiny, but GPS finds your position from the travel time of radio signals, which move 300 m every microsecond: uncorrected, the fixes would drift by about 11 km a day. The satellites' clocks are therefore built to tick slightly slow before launch. Relativity is in your pocket every time you open a map.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="none" stroke={C.axis} />
        {[-30, -20, -10, 0, 10, 20, 30, 40, 50].map(v => <g key={v}>
          <line x1={PX0} y1={py(v)} x2={PX1} y2={py(v)} stroke={v === 0 ? C.axis : C.grid} strokeWidth={v === 0 ? 1.2 : 0.6} />
          <T x={PX0 - 4} y={py(v) + 3} anchor="end" size={7.5}>{`${v}`}</T>
        </g>)}
        {[0, 10000, 20000, 30000, 40000].map(k => <T key={k} x={px(k)} y={PY1 + 13} anchor="middle" size={7.5}>{`${k / 1000}k`}</T>)}
        <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhGps_alt", "altitude (km)")}</T>
        <T x={PX0} y={PY0 - 8} size={8.5}>{tx(t, "figPhGps_axis", "µs gained per day, compared with a ground clock")}</T>
        {MARKS.map(([k, v]) => <g key={k}>
          <line x1={px(v)} y1={PY0} x2={px(v)} y2={PY1} stroke={C.grid} strokeDasharray="3 4" />
          <T x={px(v) + 3} y={PY0 + 12} size={8}>{k}</T>
        </g>)}
        <path d={curve(sr)} fill="none" stroke={C.sky} strokeWidth={2} />
        <path d={curve(gr)} fill="none" stroke={C.pink} strokeWidth={2} />
        <path d={curve(k => sr(k) + gr(k))} fill="none" stroke={C.amber} strokeWidth={2.4} />
        <line x1={px(h)} y1={PY0} x2={px(h)} y2={PY1} stroke={C.fg} strokeWidth={1} />
        <circle cx={px(h)} cy={py(s)} r={4} fill={C.sky} />
        <circle cx={px(h)} cy={py(g)} r={4} fill={C.pink} />
        <circle cx={px(h)} cy={py(net)} r={5} fill={C.amber} />
      </svg>
    </Figure>
  );
}

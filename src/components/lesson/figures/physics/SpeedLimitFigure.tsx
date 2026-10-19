"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A spaceship pushed by a steady force F = m g (one Earth gravity) measured in
// our frame, from rest, for a time t (slider, in years). Momentum grows
// steadily, p = F t, in both theories. Newton's p = m v gives v = g t, which
// passes c after c/g = 0.97 years. Relativity's p = γ m v gives
// v = g t / √(1 + (g t / c)²): close to Newton at first, then bending over
// and approaching c without reaching it.
// Right: kinetic energy in units of the rest energy m c², against v/c:
// Newton's ½ m v² stays finite at c; the true (γ − 1) m c² grows without
// limit, so reaching c would take infinite energy.
// "break it: p = mv" makes the ship follow Newton, and its speed passes c.

const W = 560, H = 270;
const G = 9.81, CL = 299792458, YEAR = 365.25 * 86400;
const TAU = CL / G / YEAR;                          // c/g in years ≈ 0.969
const AX0 = 40, AX1 = 270, AY0 = 30, AY1 = 230;    // v/c against t plot
const BX0 = 320, BX1 = 545, BY0 = 30, BY1 = 230;   // energy against v/c plot
const TMAX = 3;

const vRel = (tt: number) => (tt / TAU) / Math.sqrt(1 + (tt / TAU) ** 2);
const vNew = (tt: number) => tt / TAU;

export function SpeedLimitFigure({ t }: { t?: TrackTranslations }) {
  const [time, setTime] = useState(0.8);
  const [broken, setBroken] = useState(false);

  const b = broken ? vNew(time) : vRel(time);
  const gamma = b < 1 ? 1 / Math.sqrt(1 - b * b) : Infinity;
  const ax = (tt: number) => AX0 + (tt / TMAX) * (AX1 - AX0);
  const ay = (v: number) => AY1 - (Math.min(v, 1.6) / 1.6) * (AY1 - AY0);
  const bx = (v: number) => BX0 + v * (BX1 - BX0);
  const by = (e: number) => BY1 - (Math.min(e, 4) / 4) * (BY1 - BY0);
  const curve = (f: (x: number) => number, a: number, z: number, X: (x: number) => number, Yf: (y: number) => number, n = 150) =>
    Array.from({ length: n + 1 }, (_, i) => { const x = a + ((z - a) * i) / n; return `${i ? "L" : "M"}${X(x).toFixed(1)},${Yf(f(x)).toFixed(1)}`; }).join("");

  return (
    <Figure title={tx(t, "figPhLimit_title", "Pushing towards the speed of light")}
      head={<Btn active={broken} onClick={() => setBroken(v => !v)}>{tx(t, "figPhLimit_broken", "break it: p = mv")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhLimit_t", "time pushed")} value={time} min={0} max={TMAX} step={0.01} onChange={setTime} fmt={v => `${f2(v, 2)} ${tx(t, "figPhLimit_yr", "yr")}`} width="w-28" />
        <Row>
          <Readout color={broken && b >= 1 ? C.red : C.pink}>{`v = ${f2(b, 4)} c`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhLimit_newton", "Newton would say")} ${f2(vNew(time), 3)} c`}</Readout>
          <Readout color={C.amber}>{`γ = ${Number.isFinite(gamma) ? f2(gamma, 3) : "∞"}`}</Readout>
          <Readout>{`p = Ft = ${f2(time / TAU, 3)} mc`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhLimit_ke", "kinetic energy")} (γ − 1)mc² = ${Number.isFinite(gamma) ? f2(gamma - 1, 3) : "∞"} mc²`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhLimit_note", "A ship is pushed by a steady force, enough to give it one Earth gravity at the start, for as long as you choose. Its momentum grows at the same rate the whole time: F = dp/dt holds in relativity too. With Newton's p = mv, the speed would grow just as steadily and pass the speed of light in under a year (sky line). With the relativistic momentum p = γmv, the speed follows Newton at first, then bends over and creeps towards c without ever reaching it (pink): more and more of the push goes into γ instead of v. The right panel shows why there is no way round it: the kinetic energy (γ − 1)mc² climbs without limit as v approaches c, so reaching c would take infinite energy, while Newton's ½mv² stays finite. Break it with p = mv and watch the ship pass c, which no particle accelerator has ever managed.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x={AX0} y={AY0} width={AX1 - AX0} height={AY1 - AY0} fill="none" stroke={C.axis} />
        <line x1={AX0} y1={ay(1)} x2={AX1} y2={ay(1)} stroke={C.amber} strokeDasharray="5 4" />
        <T x={AX0 + 4} y={ay(1) - 5} size={8} color={C.amber}>v = c</T>
        <path d={curve(vNew, 0, 1.6 * TAU, ax, ay)} fill="none" stroke={C.sky} strokeWidth={1.6} strokeDasharray="5 3" />
        <path d={curve(vRel, 0, TMAX, ax, ay)} fill="none" stroke={C.pink} strokeWidth={2.2} />
        <circle cx={ax(time)} cy={ay(b)} r={5} fill={broken ? C.red : C.pink} />
        {[0, 1, 2, 3].map(v => <T key={v} x={ax(v)} y={AY1 + 13} anchor="middle" size={7.5}>{`${v}`}</T>)}
        {[0, 0.5, 1, 1.5].map(v => <T key={v} x={AX0 - 4} y={ay(v) + 3} anchor="end" size={7.5}>{`${v}`}</T>)}
        <T x={AX1} y={AY1 + 26} anchor="end" size={8}>{tx(t, "figPhLimit_tAxis", "years of pushing")}</T>
        <T x={AX0} y={AY0 - 10} size={8.5}>{tx(t, "figPhLimit_vAxis", "speed v/c")}</T>

        <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} fill="none" stroke={C.axis} />
        <line x1={bx(1)} y1={BY0} x2={bx(1)} y2={BY1} stroke={C.amber} strokeDasharray="5 4" />
        <path d={curve(v => 0.5 * v * v, 0, 1, bx, by)} fill="none" stroke={C.sky} strokeWidth={1.6} strokeDasharray="5 3" />
        <path d={curve(v => 1 / Math.sqrt(1 - v * v) - 1, 0, 0.995, bx, by, 200)} fill="none" stroke={C.green} strokeWidth={2.2} />
        {b < 1 && <circle cx={bx(b)} cy={by(gamma - 1)} r={5} fill={C.green} />}
        {[0, 0.5, 1].map(v => <T key={v} x={bx(v)} y={BY1 + 13} anchor="middle" size={7.5}>{`${v}`}</T>)}
        {[0, 1, 2, 3, 4].map(e => <T key={e} x={BX0 - 4} y={by(e) + 3} anchor="end" size={7.5}>{`${e}`}</T>)}
        <T x={BX1} y={BY1 + 26} anchor="end" size={8}>v/c</T>
        <T x={BX0} y={BY0 - 10} size={8.5}>{tx(t, "figPhLimit_eAxis", "kinetic energy ÷ mc²")}</T>
        <T x={BX0 + 6} y={by(0.5) - 6} size={8} color={C.sky}>{tx(t, "figPhLimit_newtonKe", "Newton: v²/2")}</T>
        <T x={bx(0.62)} y={by(3.4)} size={8} color={C.green}>γ − 1</T>
      </svg>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, Vec, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A coil of N turns and area A = 0.01 m² turns at f revolutions per second
// between the poles of a magnet with a uniform field B. Its angle is θ = ωt,
// measured between the field and the line perpendicular to the coil, so the
// flux through it is Φ = N B A cos θ and Faraday's law gives the emf
// ε = −dΦ/dt = N B A ω sin θ: an alternating voltage, largest when the coil
// is edge-on to the field (flux zero but changing fastest), zero when it
// faces the field (flux largest but momentarily not changing).
// "break it: emf from the flux itself" makes ε follow Φ instead of its rate
// of change: the lamp then glows even with the coil standing still.

const W = 560, H = 280;
const AREA = 0.01;
const CX = 120, CY = 120, HALF = 52, HGT = 54;    // coil: centre, half-width, half-height
const PX0 = 260, PX1 = 545;
const TURNS = 2;                                   // the plots show two turns

function niceCeil(v: number) {
  const p = 10 ** Math.floor(Math.log10(v)), m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

export function GeneratorFigure({ t }: { t?: TrackTranslations }) {
  const [f, setF] = useState(0.5);
  const [N, setN] = useState(100);
  const [B, setB] = useState(0.5);
  const [th, setTh] = useState(0.6);
  const [broken, setBroken] = useState(false);
  const vis = useVisible<HTMLDivElement>();

  useFrame(vis.on && f > 0, dt => setTh(a => (a + 2 * Math.PI * f * dt) % (2 * Math.PI * TURNS)));

  const w = 2 * Math.PI * f;
  const phiMax = N * B * AREA;                       // Wb (flux linkage)
  const W0 = 2 * Math.PI * 0.5;                      // the broken rule's fixed scale
  const emfAt = (a: number) => broken ? phiMax * W0 * Math.cos(a) : phiMax * w * Math.sin(a);
  const emf = emfAt(th), peak = broken ? phiMax * W0 : phiMax * w;
  // ε axis: the next 1, 2 or 5 × 10ⁿ volts above the peak, labelled on the plot
  const scale = niceCeil(Math.max(peak, 0.05));
  const glow = Math.min(1, (emf * emf) / 4);         // full brightness from 2 V

  // coil seen from the front: its face turns about the vertical axis
  const s = Math.sin(th), c = Math.cos(th);
  const xl = CX - HALF * s, xr = CX + HALF * s;
  const front = c >= 0;

  // plots: flux (top) and emf (bottom) against the angle
  const X = (a: number) => PX0 + ((PX1 - PX0) * a) / (2 * Math.PI * TURNS);
  const curve = (fn: (a: number) => number, y0: number, amp: number) => {
    let d = "";
    for (let k = 0; k <= 200; k++) { const a = (2 * Math.PI * TURNS * k) / 200; d += `${k ? "L" : "M"}${X(a).toFixed(1)},${(y0 - amp * fn(a)).toFixed(1)}`; }
    return d;
  };
  const YF = 70, YE = 195, AMP = 42;
  const eAmp = (a: number) => emfAt(a) / scale;

  return (
    <Figure title={tx(t, "figPhGen_title", "A coil turning in a magnetic field")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhGen_broken", "break it: emf from the flux itself")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhGen_f", "turns per second")} value={f} min={0} max={3} step={0.05} onChange={setF} fmt={v => `${f2(v, 2)} Hz`} />
          <Slider label={tx(t, "figPhGen_N", "turns of wire N")} value={N} min={10} max={200} step={10} onChange={setN} fmt={v => f2(v, 0)} />
          <Slider label="B" value={B} min={0.1} max={1} step={0.05} onChange={setB} fmt={v => `${f2(v, 2)} T`} />
        </Sliders>
        <Row>
          <Readout>{`θ = ${f2(((th * 180) / Math.PI) % 360, 0)}°`}</Readout>
          <Readout color={C.sky}>{`NΦ = NBA cos θ = ${f2(phiMax * c * 1000, 1)} mWb`}</Readout>
          <Readout color={C.amber}>{`ε = ${f2(emf, 2)} V`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhGen_peak", "peak")} NBAω = ${f2(peak, 2)} V`}</Readout>
          <Readout>{`${tx(t, "figPhGen_at50", "at 50 Hz")}: ${f2(phiMax * 2 * Math.PI * 50, 0)} V`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhGen_note", "The coil turns between the poles, and the number of field lines through it rises and falls: the blue curve. The voltage, in amber, is not the flux but how fast the flux changes. When the coil faces the field, the most lines pass through it, yet for an instant that number is not changing, and the voltage is zero. A quarter turn later the coil is edge-on, no lines pass through it, but the number is changing fastest, and the voltage peaks. Each turn the voltage swings positive and negative once: alternating current. Turn faster, add turns of wire or strengthen the field, and the peak N B A ω grows. Set the speed to zero and the lamp goes dark, whatever the angle. Then break it by making the voltage follow the flux itself: now a coil standing still facing the field would light the lamp for ever, from nothing. Only a changing flux drives a current.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* magnet and field */}
          <rect x={14} y={CY - 70} width={34} height={140} rx={3} fill={C.red} opacity={0.85} />
          <rect x={192} y={CY - 70} width={34} height={140} rx={3} fill={C.blue} opacity={0.85} />
          <T x={31} y={CY + 4} anchor="middle" size={12} bold color="#fff">N</T>
          <T x={209} y={CY + 4} anchor="middle" size={12} bold color="#fff">S</T>
          {[-55, -28, 0, 28, 55].map(dy => <Vec key={dy} a={{ x: 52, y: CY + dy }} b={{ x: 188, y: CY + dy }} color={C.muted} w={1} head={5} opacity={0.35 + 0.5 * B} />)}
          {/* the coil: back edge first, front edge on top */}
          <line x1={CX} y1={CY - HGT - 16} x2={CX} y2={CY + HGT + 30} stroke={C.muted} strokeDasharray="3 3" />
          <path d={`M${xl},${CY - HGT} L${xr},${CY - HGT} L${xr},${CY + HGT} L${xl},${CY + HGT} Z`} fill={C.amber} fillOpacity={0.12 + 0.18 * Math.abs(c)} stroke={C.amber} strokeWidth={front ? 3 : 2} />
          <line x1={front ? xl : xr} y1={CY - HGT} x2={front ? xl : xr} y2={CY + HGT} stroke={C.amber} strokeWidth={4} />
          {/* slip rings, wires and lamp */}
          <rect x={CX - 9} y={CY + HGT + 22} width={18} height={6} rx={2} fill={C.fg} />
          <rect x={CX - 9} y={CY + HGT + 32} width={18} height={6} rx={2} fill={C.fg} />
          <path d={`M${CX + 9},${CY + HGT + 25} H170 V${H - 22} M${CX - 9},${CY + HGT + 35} H70 V${H - 22} H150`} fill="none" stroke={C.fg} strokeWidth={1.4} />
          <circle cx={160} cy={H - 22} r={10 + 14 * glow} fill={C.amber} opacity={0.25 * glow} />
          <circle cx={160} cy={H - 22} r={8} fill={glow > 0.02 ? C.amber : "var(--code-bg)"} fillOpacity={0.2 + 0.8 * glow} stroke={C.fg} strokeWidth={1.4} />
          <T x={182} y={H - 18} size={8.5} color={C.fg}>{tx(t, "figPhGen_lamp", "lamp")}</T>
          {/* plots */}
          {[YF, YE].map(y0 => <line key={y0} x1={PX0} y1={y0} x2={PX1} y2={y0} stroke={C.axis} />)}
          <line x1={PX0} y1={YF - AMP - 6} x2={PX0} y2={YE + AMP + 6} stroke={C.axis} />
          {[1, 2, 3, 4].map(q => <line key={q} x1={X((q * Math.PI))} y1={YF - AMP} x2={X(q * Math.PI)} y2={YE + AMP} stroke={C.grid} strokeDasharray="2 4" />)}
          <path d={curve(Math.cos, YF, AMP)} fill="none" stroke={C.sky} strokeWidth={2} />
          <path d={curve(eAmp, YE, AMP)} fill="none" stroke={C.amber} strokeWidth={2} />
          <line x1={X(th)} y1={YF - AMP - 6} x2={X(th)} y2={YE + AMP + 6} stroke={C.fg} strokeOpacity={0.35} />
          <circle cx={X(th)} cy={YF - AMP * c} r={4.5} fill={C.sky} />
          <circle cx={X(th)} cy={YE - AMP * eAmp(th)} r={4.5} fill={C.amber} />
          <T x={PX0 + 4} y={YF - AMP - 10} size={8.5} color={C.sky}>{tx(t, "figPhGen_flux", "flux through the coil")}</T>
          <T x={PX0 + 4} y={YE - AMP - 10} size={8.5} color={C.amber}>{broken ? tx(t, "figPhGen_emfBroken", "voltage (broken: follows the flux)") : tx(t, "figPhGen_emf", "voltage = −(rate of change of flux)")}</T>
          <T x={PX0 - 4} y={YE - AMP + 3} anchor="end" size={8}>{`+${f2(scale, scale < 1 ? 2 : 0)} V`}</T>
          <T x={PX0 - 4} y={YE + AMP + 3} anchor="end" size={8}>{`−${f2(scale, scale < 1 ? 2 : 0)} V`}</T>
          {[1, 2, 3, 4].map(q => <T key={q} x={X(q * Math.PI)} y={YE + AMP + 18} anchor="middle" size={8}>{`${q * 180}°`}</T>)}
        </svg>
      </div>
    </Figure>
  );
}

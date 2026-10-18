"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A capacitor C charged through a resistor R from a battery ε, or discharged
// through the same resistor. The current is (ε − V)/R, so it is large at
// first and dies away as the capacitor fills: V_C(t) = ε(1 − e^(−t/RC)) when
// charging, V₀ e^(−t/RC) when discharging. The time constant τ = RC is where
// the curve has covered 63% of the way; after 5τ it is 99% there.
// Time runs in real seconds. The plot spans 5τ, with τ marked.
// "break it: keep the first current" charges at the starting current ε/R all
// the way: the voltage then rises in a straight line, reaches ε at exactly
// t = τ and keeps going above the battery's voltage, which no battery can do.

const W = 560, H = 280;
const PX0 = 190, PX1 = 545, PY0 = 30, PY1 = 230;          // plot box

export function RcFigure({ t }: { t?: TrackTranslations }) {
  const [emf, setEmf] = useState(9);
  const [R, setR] = useState(10);            // kΩ
  const [Cuf, setCuf] = useState(100);       // µF
  const [charging, setCharging] = useState(true);
  const [time, setTime] = useState(0);
  const [v0, setV0] = useState(0);           // capacitor voltage when the switch was last thrown
  const [playing, setPlaying] = useState(true);
  const [broken, setBroken] = useState(false);
  const vis = useVisible<HTMLDivElement>();

  const tau = R * 1e3 * Cuf * 1e-6;                         // s
  const target = charging ? emf : 0;
  const Vexact = (s: number) => target + (v0 - target) * Math.exp(-s / tau);
  const Vlinear = (s: number) => v0 + (emf / (R * 1e3)) * s / (Cuf * 1e-6);
  const V = broken && charging ? Vlinear(time) : Vexact(time);
  const I = (charging ? emf - V : -V) / (R * 1e3);
  const span = 5 * tau;

  useFrame(playing && vis.on, dt => setTime(s => Math.min(s + dt, span)));

  const flip = () => { setV0(V); setTime(0); setCharging(c => !c); };
  const restart = () => { setV0(charging ? 0 : emf); setTime(0); };
  const changeTau = (fn: () => void) => { fn(); setTime(0); setV0(charging ? 0 : emf); };

  const vmax = Math.max(emf * 1.6, 1);
  const X = (s: number) => PX0 + ((PX1 - PX0) * s) / span;
  const Y = (v: number) => PY1 - ((PY1 - PY0) * clamp(v, -0.05 * vmax, vmax)) / vmax;
  let curve = "";
  for (let k = 0; k <= 160; k++) { const s = (span * k) / 160; curve += `${k ? "L" : "M"}${X(s).toFixed(1)},${Y(Vexact(s)).toFixed(1)}`; }
  const line = `M${X(0)},${Y(v0)} L${X(span)},${Y(Vlinear(span))}`;
  const fill = clamp(V / emf, 0, 1.6);

  return (
    <Figure title={tx(t, "figPhRc_title", "Charging and discharging a capacitor")}
      head={<Btn active={broken} onClick={() => { setBroken(b => !b); restart(); }}>{tx(t, "figPhRc_broken", "break it: keep the first current")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label="R" value={R} min={1} max={50} step={1} onChange={v => changeTau(() => setR(v))} fmt={v => `${f2(v, 0)} kΩ`} />
          <Slider label="C" value={Cuf} min={10} max={200} step={5} onChange={v => changeTau(() => setCuf(v))} fmt={v => `${f2(v, 0)} µF`} />
          <Slider label={tx(t, "figPhRc_emf", "battery ε")} value={emf} min={1} max={12} step={0.5} onChange={v => changeTau(() => setEmf(v))} fmt={v => `${f2(v, 1)} V`} />
        </Sliders>
        <Row>
          <Btn active={!charging} onClick={flip}>{charging ? tx(t, "figPhRc_toDis", "switch to discharge") : tx(t, "figPhRc_toCharge", "switch to charge")}</Btn>
          <Btn onClick={restart}>{tx(t, "figPhRc_restart", "start again")}</Btn>
          <Btn active={!playing} onClick={() => setPlaying(p => !p)}>{playing ? tx(t, "figPhRc_pause", "pause") : tx(t, "figPhRc_play", "run")}</Btn>
        </Row>
        <Row>
          <Readout color={C.green}>{`τ = RC = ${f2(tau, 2)} s`}</Readout>
          <Readout>{`t = ${f2(time, 2)} s`}</Readout>
          <Readout color={broken && V > emf ? C.red : C.amber}>{`V_C = ${f2(V, 2)} V`}</Readout>
          <Readout color={C.sky}>{`I = ${f2(I * 1000, 3)} mA`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhRc_note", "Press start again and watch the capacitor fill. At first it is empty, so the whole battery voltage drives current through the resistor; as charge builds up, the capacitor's own voltage pushes back, the current shrinks, and the filling slows. After one time constant τ = RC the voltage has covered 63% of the way, after five it is practically full. Double R or C and everything takes twice as long. Switch to discharge: the capacitor now drives the current itself, backwards, and empties along the mirror-image curve. Break it by keeping the first current constant: the voltage climbs in a straight line, reaches the battery's voltage after exactly one τ, which is what τ means, and then keeps going, higher than the battery could ever push it.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* circuit */}
          <path d="M30,60 H150 V200 H30 Z" fill="none" stroke={C.fg} strokeWidth={1.6} />
          <rect x={22} y={110} width={16} height={40} fill="var(--code-bg)" />
          <line x1={20} y1={122} x2={40} y2={122} stroke={C.fg} strokeWidth={2.5} />
          <line x1={25} y1={134} x2={35} y2={134} stroke={C.fg} strokeWidth={4} />
          <T x={4} y={100} size={8.5} color={C.fg}>{`${f2(emf, 1)} V`}</T>
          {charging ? null : <path d="M30,110 V150" stroke="var(--code-bg)" strokeWidth={6} />}
          {charging ? null : <path d="M30,108 C10,110 10,150 30,152" fill="none" stroke={C.fg} strokeWidth={1.6} />}
          <rect x={70} y={52} width={40} height={16} fill="var(--code-bg)" stroke={C.fg} strokeWidth={1.4} />
          <T x={90} y={45} anchor="middle" size={8.5} color={C.fg}>R</T>
          <rect x={130} y={110} width={40} height={40} fill="var(--code-bg)" />
          <line x1={134} y1={124} x2={166} y2={124} stroke={C.red} strokeWidth={3} />
          <line x1={134} y1={136} x2={166} y2={136} stroke={C.blue} strokeWidth={3} />
          <rect x={136} y={102} width={28 * Math.min(fill, 1)} height={5} fill={fill > 1 ? C.red : C.amber} />
          <T x={172} y={134} size={8.5} color={C.fg}>C</T>
          <T x={34} y={226} size={8} color={C.muted}>{charging ? tx(t, "figPhRc_charging", "battery in the loop") : tx(t, "figPhRc_discharging", "battery bypassed")}</T>
          {/* plot */}
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={Y(emf)} x2={PX1} y2={Y(emf)} stroke={C.muted} strokeDasharray="4 4" />
          <T x={PX1 - 4} y={Y(emf) - 4} anchor="end" size={8}>{`ε = ${f2(emf, 1)} V`}</T>
          {[1, 2, 3, 4, 5].map(k => (
            <g key={k}>
              <line x1={X(k * tau)} y1={PY1} x2={X(k * tau)} y2={PY1 + 4} stroke={C.axis} />
              <T x={X(k * tau)} y={PY1 + 14} anchor="middle" size={8}>{`${k}τ`}</T>
            </g>
          ))}
          <line x1={X(tau)} y1={PY0} x2={X(tau)} y2={PY1} stroke={C.green} strokeDasharray="3 3" opacity={0.7} />
          {charging && <T x={X(tau) + 4} y={Y(v0 + 0.632 * (emf - v0)) + 12} size={8} color={C.green}>63%</T>}
          <path d={curve} fill="none" stroke={C.amber} strokeWidth={2} opacity={broken && charging ? 0.35 : 1} />
          {broken && charging && <path d={line} fill="none" stroke={C.red} strokeWidth={2} />}
          <circle cx={X(time)} cy={Y(V)} r={5} fill={broken && charging ? C.red : C.amber} />
          <T x={PX0 + 4} y={PY0 - 8} size={8.5} color={C.fg}>{tx(t, "figPhRc_axis", "voltage on the capacitor")}</T>
        </svg>
      </div>
    </Figure>
  );
}

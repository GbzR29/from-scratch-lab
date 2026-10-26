"use client";

// ── Hero figure: two hydrogen atoms make a bond ─────────────────────────────
// The energy of two H atoms as a function of the distance r between their
// nuclei, the Morse fit used in the Chemistry lesson (BondCurveFigure):
// E(r) = D(1 − e^(−a(r − r₀)))² − D, with depth D = 4.75 eV (the bond energy),
// r₀ = 74 pm (the bond length) and a = 0.0194 pm⁻¹. Far apart E → 0; at r₀ it is
// lowest; pushed closer it climbs steeply. The atoms breathe a little around r.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

const D = 4.75, R0 = 74, A = 0.0194;
const energy = (r: number) => { const x = 1 - Math.exp(-A * (r - R0)); return D * x * x - D; };

// plot: r 40…300 pm across, E −5…+3 eV down
const PX0 = 54, PX1 = 420, PY0 = 120, PY1 = 300;
const R_MIN = 40, R_MAX = 300, E_TOP = 3, E_BOT = -5.2;
const px = (r: number) => PX0 + ((r - R_MIN) / (R_MAX - R_MIN)) * (PX1 - PX0);
const py = (e: number) => PY0 + ((E_TOP - Math.min(e, E_TOP)) / (E_TOP - E_BOT)) * (PY1 - PY0);

export default function Bond({ ui, num, onNext, figNo }: HeroProps) {
  const [r, setR] = useState(160);
  const [t, setT] = useState(0);
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setT(s => (s + dt) % 1000));

  const e = energy(r);
  const curve = Array.from({ length: 131 }, (_, i) => R_MIN + (i * (R_MAX - R_MIN)) / 130)
    .map((x, i) => `${i ? "L" : "M"}${px(x).toFixed(1)} ${py(energy(x)).toFixed(1)}`).join("");
  // the atoms, drawn to the plot's r scale above it
  const shown = r + 3 * Math.sin(t * 5);
  const half = ((px(shown) - px(0)) / 2) * 0.62;
  const cx = 240, cy = 58;

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext} figNo={figNo}
      caption={ui.homeFigBondCaption ?? "two hydrogen atoms make a bond"}
      aria={ui.homeFigBondAria ?? "Two hydrogen atoms and the energy curve of their distance; the energy is lowest at the bond length"}
      slider={{ label: ui.homeFigBondSlider ?? "distance r", value: `${num(r, 0)} pm`, min: R_MIN + 8, max: R_MAX, step: 2, at: r, set: setR }}
      formula={<><i>E</i>(<i>r</i>) = <i>D</i>(1 − e<sup>−<i>a</i>(<i>r</i>−<i>r</i>₀)</sup>)² − <i>D</i> = <b>{num(e, 2)} eV</b></>}>
      {[-half, half].map((dx, i) => (
        <g key={i}>
          <circle cx={cx + dx} cy={cy} r="30" fill="var(--hm-draw)" opacity="0.14" />
          <circle cx={cx + dx} cy={cy} r="7" fill="var(--hm-accent)" />
          <text x={cx + dx} y={cy - 38} textAnchor="middle" fontFamily={SERIF} fontSize="17" fill="currentColor">H</text>
        </g>
      ))}
      <path d={`M${cx - half} ${cy + 22} H${cx + half}`} stroke="currentColor" strokeWidth="1.2" />
      <text x={cx} y={cy + 38} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill="currentColor">r</text>

      <g fill="none" stroke="var(--hm-draw)" strokeWidth="1.2" opacity="0.75">
        <path d={`M${PX0} ${PY0} V${PY1} M${PX0} ${py(0)} H${PX1}`} />
        <path d={`M${px(R0)} ${py(-D)} V${py(0)} M${PX0} ${py(-D)} H${px(R0) + 60}`} strokeDasharray="3 5" />
      </g>
      <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
      <path d={`M${px(r)} ${py(0)} V${py(e)}`} stroke="var(--hm-accent)" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx={px(r)} cy={py(e)} r="7" fill="var(--hm-accent)" />
      <text x={PX0 - 8} y={py(0) + 4} textAnchor="end" fontFamily={MONO} fontSize="11" fill="currentColor">0</text>
      <text x={PX0 - 8} y={py(-D) + 4} textAnchor="end" fontFamily={MONO} fontSize="11" fill="currentColor">−D</text>
      <text x={px(R0) + 4} y={PY1 + 14} fontFamily={MONO} fontSize="11" fill="currentColor">r₀ = 74 pm</text>
      <text x={PX0 + 6} y={PY0 + 10} fontFamily={SERIF} fontStyle="italic" fontSize="15" fill="var(--hm-draw)">E</text>
      <text x={PX1} y={py(0) - 8} textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill="var(--hm-draw)">r</text>
    </HeroFrame>
  );
}

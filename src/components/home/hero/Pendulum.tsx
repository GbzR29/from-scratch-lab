"use client";

// ── Hero figure: the simple pendulum ────────────────────────────────────────
// One slider (the length L) and the period it gives, T = 2π√(L/g).
// Small-angle motion, θ(t) = θ₀ cos(ωt) with ω = √(g/L); advancing the phase
// keeps the motion smooth when L changes.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

const G = 9.81;          // m/s²
const THETA0 = 0.36;     // rad, amplitude (small enough for the formula)
const PIVOT = { x: 220, y: 26 };
const lengthPx = (L: number) => 70 + L * 120; // 0.25 m → 100 px, 1.5 m → 250 px

export default function Pendulum({ ui, num, onNext }: HeroProps) {
  const [L, setL] = useState(1);
  const [phase, setPhase] = useState(Math.acos(0.8));
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setPhase(p => p + Math.sqrt(G / L) * dt));

  const theta = THETA0 * Math.cos(phase);
  const len = lengthPx(L);
  const bob = { x: PIVOT.x + len * Math.sin(theta), y: PIVOT.y + len * Math.cos(theta) };
  const swing = (s: number) => ({ x: PIVOT.x + len * Math.sin(s * THETA0), y: PIVOT.y + len * Math.cos(s * THETA0) });
  const left = swing(-1), right = swing(1);
  const period = 2 * Math.PI * Math.sqrt(L / G);
  // the θ arc, 46 px from the pivot, from the vertical to the string
  const arcR = 46;
  const arcEnd = { x: PIVOT.x + arcR * Math.sin(theta), y: PIVOT.y + arcR * Math.cos(theta) };

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext}
      caption={ui.homeFigCaption ?? "the simple pendulum"}
      aria={ui.homeFigAria ?? "A simple pendulum swinging; its length sets the period"}
      slider={{ label: ui.homeFigLength ?? "length L", value: `${num(L, 2)} m`, min: 0.25, max: 1.5, step: 0.05, at: L, set: setL }}
      formula={<><i>T</i> = 2π√(<i>L</i>/<i>g</i>) = <b>{num(period, 2)} s</b></>}>
      <path d="M150 26 H290" stroke="currentColor" strokeWidth="3" />
      <path d="M160 26 l-8 -10 M180 26 l-8 -10 M200 26 l-8 -10 M220 26 l-8 -10 M240 26 l-8 -10 M260 26 l-8 -10 M280 26 l-8 -10" stroke="currentColor" strokeWidth="1.3" />
      <g fill="none" stroke="var(--hm-draw)" strokeWidth="1.2" opacity="0.75">
        <path d={`M${PIVOT.x} ${PIVOT.y} V${PIVOT.y + len + 30}`} strokeDasharray="10 4 2 4" />
        <path d={`M${left.x} ${left.y} A${len} ${len} 0 0 0 ${right.x} ${right.y}`} strokeDasharray="3 5" />
      </g>
      <path d={`M${PIVOT.x} ${PIVOT.y} L${bob.x} ${bob.y}`} stroke="currentColor" strokeWidth="2" />
      <path d={`M${PIVOT.x} ${PIVOT.y + arcR} A${arcR} ${arcR} 0 0 ${theta > 0 ? 0 : 1} ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x={PIVOT.x + (theta > 0 ? 8 : -20)} y={PIVOT.y + arcR + 22} fontFamily={SERIF} fontStyle="italic" fontSize="19" fill="currentColor">θ</text>
      <circle cx={bob.x} cy={bob.y} r="16" fill="var(--hm-accent)" />
      <path d={`M${bob.x} ${bob.y + 17} V${bob.y + 52}`} stroke="var(--hm-draw)" strokeWidth="2" />
      <path d={`M${bob.x - 5} ${bob.y + 44} L${bob.x} ${bob.y + 54} L${bob.x + 5} ${bob.y + 44}`} fill="none" stroke="var(--hm-draw)" strokeWidth="2" />
      <text x={bob.x + 10} y={bob.y + 52} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="var(--hm-draw)">mg</text>
      <text x="300" y="70" fontFamily={MONO} fontSize="12" fill="currentColor">L = {num(L, 2)} m</text>
    </HeroFrame>
  );
}

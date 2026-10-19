"use client";

// ── Hero figure: light bending into water ───────────────────────────────────
// A beam enters water (n = 1.33) at angle θ₁ from the normal and bends to θ₂,
// with sin θ₁ = n sin θ₂ (Snell's law). Pulses of light travel along the beam
// and slow to c/n in the water, so they bunch up there: the bending and the
// slowing are the same fact.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, type HeroProps } from "./frame";

const N = 1.33;
const O = { x: 220, y: 150 };
const LEN = 190;                     // beam length on each side (px)
const SPEED = 90;                    // px/s in air
const GAP = 34;                      // px between pulses in air

type P = { x: number; y: number };

/** Where the light pulses are at time t: GAP apart in air, then n times slower in the water. */
function pulsePositions(t: number, src: P, end: P): P[] {
  const timeAir = LEN / SPEED, timeWater = (LEN * N) / SPEED, total = timeAir + timeWater, period = GAP / SPEED;
  const out: P[] = [];
  for (let k = 0; k * period < total; k++) {
    const s = (((t - k * period) % total) + total) % total;
    out.push(s < timeAir
      ? { x: src.x + (O.x - src.x) * (s / timeAir), y: src.y + (O.y - src.y) * (s / timeAir) }
      : { x: O.x + (end.x - O.x) * ((s - timeAir) / timeWater), y: O.y + (end.y - O.y) * ((s - timeAir) / timeWater) });
  }
  return out;
}

export default function Refraction({ ui, num, onNext }: HeroProps) {
  const [deg, setDeg] = useState(50);
  const [t, setT] = useState(0);
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setT(s => (s + dt) % 1000));

  const t1 = (deg * Math.PI) / 180, t2 = Math.asin(Math.sin(t1) / N);
  const src = { x: O.x - LEN * Math.sin(t1), y: O.y - LEN * Math.cos(t1) };
  const end = { x: O.x + LEN * Math.sin(t2), y: O.y + LEN * Math.cos(t2) };
  const pulses = pulsePositions(t, src, end).map((p, k) => <circle key={k} cx={p.x} cy={p.y} r="4.5" fill="var(--hm-accent)" />);
  // the angle marks, from the normal round to the beam (both turn anticlockwise on screen)
  const arc = (r: number, a: number, down: boolean) => {
    const s = down ? 1 : -1;
    return `M${O.x} ${O.y + s * r} A${r} ${r} 0 0 0 ${O.x + r * Math.sin(a)} ${O.y + s * r * Math.cos(a)}`;
  };

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext}
      caption={ui.homeFigLightCaption ?? "light bending into water"}
      aria={ui.homeFigLightAria ?? "A beam of light bends towards the normal as it enters water, where it travels more slowly"}
      slider={{ label: ui.homeFigLightSlider ?? "angle in air θ₁", value: `${num(deg, 0)}°`, min: 0, max: 80, step: 1, at: deg, set: setDeg }}
      formula={<>sin θ₁ = <i>n</i> sin θ₂ → θ₂ = <b>{num((t2 * 180) / Math.PI, 1)}°</b></>}>
      <rect x="0" y={O.y} width="440" height={320 - O.y} fill="var(--hm-draw)" opacity="0.12" />
      <path d={`M0 ${O.y} H440`} stroke="currentColor" strokeWidth="2" />
      <path d={`M${O.x} ${O.y - 140} V${O.y + 150}`} stroke="var(--hm-draw)" strokeWidth="1.2" strokeDasharray="10 4 2 4" opacity="0.8" />
      <path d={`M${O.x} ${O.y} L${O.x + LEN * Math.sin(t1)} ${O.y + LEN * Math.cos(t1)}`} stroke="var(--hm-draw)" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.7" />
      <path d={`M${src.x} ${src.y} L${O.x} ${O.y} L${end.x} ${end.y}`} fill="none" stroke="currentColor" strokeWidth="2" />
      {pulses}
      {deg > 3 && <path d={arc(50, -t1, false)} fill="none" stroke="currentColor" strokeWidth="1.4" />}
      {deg > 3 && <path d={arc(50, t2, true)} fill="none" stroke="currentColor" strokeWidth="1.4" />}
      <text x={O.x - 30} y={O.y - 58} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="currentColor">θ₁</text>
      <text x={O.x + 10} y={O.y + 74} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="currentColor">θ₂</text>
      <text x="16" y="30" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill="currentColor">{ui.homeFigLightAir ?? "air"}, <tspan fontStyle="normal">n = 1</tspan></text>
      <text x="16" y="306" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill="currentColor">{ui.homeFigLightWater ?? "water"}, <tspan fontStyle="normal">n = {num(N, 2)}</tspan></text>
    </HeroFrame>
  );
}

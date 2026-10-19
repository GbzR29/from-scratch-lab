"use client";

// ── Hero figure: throwing a ball ────────────────────────────────────────────
// A ball launched at v = 20 m/s at angle θ, no air resistance:
// x = v cos θ · t, y = v sin θ · t − ½gt². It lands after 2v sin θ / g at the
// range R = v² sin 2θ / g, longest at 45°. The ball flies in real time, then
// is thrown again. 9 px = 1 m.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

const G = 9.81, V = 20, PX = 9;
const O = { x: 34, y: 286 };
const PAUSE = 0.7;                   // s on the ground before the next throw

export default function Projectile({ ui, num, onNext }: HeroProps) {
  const [deg, setDeg] = useState(55);
  const [t, setT] = useState(0.6);
  const figRef = useRef<HTMLElement>(null);
  const th = (deg * Math.PI) / 180;
  const flight = (2 * V * Math.sin(th)) / G;
  useHeroClock(figRef, dt => setT(s => (s + dt > flight + PAUSE ? 0 : s + dt)));

  const at = (s: number) => ({
    x: O.x + PX * V * Math.cos(th) * s,
    y: O.y - PX * (V * Math.sin(th) * s - 0.5 * G * s * s),
  });
  const ball = at(Math.min(t, flight));
  const range = (V * V * Math.sin(2 * th)) / G;
  // the flight up to time `upTo`, as an SVG path of n segments
  const flightPath = (upTo: number, n: number) => Array.from({ length: n + 1 }, (_, i) => at((upTo * i) / n))
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");
  const path = flightPath(flight, 40), trail = flightPath(Math.min(t, flight), 24);
  const land = O.x + PX * range;
  const arcR = 40;
  const arcEnd = { x: O.x + arcR * Math.cos(th), y: O.y - arcR * Math.sin(th) };

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext}
      caption={ui.homeFigThrowCaption ?? "throwing a ball"}
      aria={ui.homeFigThrowAria ?? "A ball thrown at an angle follows a parabola; the angle sets how far it lands"}
      slider={{ label: ui.homeFigThrowSlider ?? "launch angle θ", value: `${num(deg, 0)}°`, min: 10, max: 80, step: 1, at: deg, set: setDeg }}
      formula={<><i>R</i> = <i>v</i>² sin 2θ / <i>g</i> = <b>{num(range, 1)} m</b></>}>
      <path d={`M10 ${O.y} H430`} stroke="currentColor" strokeWidth="2.5" />
      {Array.from({ length: 21 }, (_, i) => <path key={i} d={`M${14 + i * 20} ${O.y + 2} l-8 10`} stroke="currentColor" strokeWidth="1.2" />)}
      <path d={path} fill="none" stroke="var(--hm-draw)" strokeWidth="1.3" strokeDasharray="3 5" opacity="0.8" />
      <path d={trail} fill="none" stroke="currentColor" strokeWidth="2" />
      <path d={`M${O.x} ${O.y} L${O.x + 70 * Math.cos(th)} ${O.y - 70 * Math.sin(th)}`} stroke="var(--hm-draw)" strokeWidth="1.5" />
      <path d={`M${O.x + arcR} ${O.y} A${arcR} ${arcR} 0 0 0 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text x={O.x + arcR + 6} y={O.y - 10} fontFamily={SERIF} fontStyle="italic" fontSize="18" fill="currentColor">θ</text>
      <path d={`M${O.x} ${O.y + 20} H${land} M${O.x} ${O.y + 14} v12 M${land} ${O.y + 14} v12`} stroke="var(--hm-draw)" strokeWidth="1.3" />
      <text x={(O.x + land) / 2} y={O.y + 18} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill="var(--hm-draw)" paintOrder="stroke" stroke="var(--hm-surface)" strokeWidth="5">R</text>
      <circle cx={ball.x} cy={ball.y - 9} r="9" fill="var(--hm-accent)" />
      <text x="300" y="40" fontFamily={MONO} fontSize="12" fill="currentColor">v = {V} m/s</text>
    </HeroFrame>
  );
}

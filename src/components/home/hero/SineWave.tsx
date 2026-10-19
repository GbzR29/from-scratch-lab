"use client";

// ── Hero figure: a point on a circle draws a sine wave ──────────────────────
// A point goes round the unit circle at f turns per second; its height is
// sin(2πft). That height is carried across to a graph that scrolls to the
// right, so the trace on the right is the sine wave the circle draws.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

const C = { x: 92, y: 160 }, R = 62;
const X0 = 190, X1 = 425;            // the graph
const SPEED = 70;                    // px of graph per second

export default function SineWave({ ui, num, onNext }: HeroProps) {
  const [f, setF] = useState(0.3);
  const [phase, setPhase] = useState(0.9);
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setPhase(p => (p + 2 * Math.PI * f * dt) % (2 * Math.PI * 1000)));

  const pt = { x: C.x + R * Math.cos(phase), y: C.y - R * Math.sin(phase) };
  // the wave already drawn: x px to the right was drawn x / SPEED seconds ago
  const k = (2 * Math.PI * f) / SPEED;
  const wave = Array.from({ length: Math.floor((X1 - X0) / 3) + 1 }, (_, i) => X0 + 3 * i)
    .map((x, i) => `${i ? "L" : "M"}${x} ${(C.y - R * Math.sin(phase - k * (x - X0))).toFixed(1)}`).join("");
  const arc = Math.abs(phase % (2 * Math.PI));
  const arcEnd = { x: C.x + 22 * Math.cos(phase), y: C.y - 22 * Math.sin(phase) };

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext}
      caption={ui.homeFigSineCaption ?? "a circle draws a wave"}
      aria={ui.homeFigSineAria ?? "A point going round a circle; its height traces a sine wave"}
      slider={{ label: ui.homeFigSineSlider ?? "turns per second f", value: `${num(f, 2)} Hz`, min: 0.05, max: 0.8, step: 0.05, at: f, set: setF }}
      formula={<><i>y</i> = sin(2π<i>ft</i>) = <b>{num(Math.sin(phase), 2)}</b></>}>
      <g fill="none" stroke="var(--hm-draw)" strokeWidth="1.2" opacity="0.75">
        <path d={`M${C.x - R - 14} ${C.y} H${X1}`} />
        <path d={`M${C.x} ${C.y - R - 14} V${C.y + R + 14}`} />
        <path d={`M${X0} ${C.y - R} H${X1} M${X0} ${C.y + R} H${X1}`} strokeDasharray="3 5" />
      </g>
      <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="currentColor" strokeWidth="2" />
      <path d={`M${C.x} ${C.y} L${pt.x} ${pt.y}`} stroke="currentColor" strokeWidth="2" />
      <path d={`M${C.x + 22} ${C.y} A22 22 0 ${arc > Math.PI ? 1 : 0} 0 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d={`M${pt.x} ${pt.y} V${C.y}`} stroke="var(--hm-accent)" strokeWidth="2.5" />
      <path d={`M${pt.x} ${pt.y} H${X0}`} stroke="var(--hm-draw)" strokeWidth="1.2" strokeDasharray="4 4" />
      <path d={wave} fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx={pt.x} cy={pt.y} r="8" fill="var(--hm-accent)" />
      <circle cx={X0} cy={pt.y} r="6" fill="var(--hm-accent)" />
      <text x={C.x + 26} y={C.y - 6} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="currentColor">θ</text>
      <text x={X0 + 6} y={C.y - R - 8} fontFamily={MONO} fontSize="12" fill="currentColor">y = +1</text>
      <text x={X0 + 6} y={C.y + R + 18} fontFamily={MONO} fontSize="12" fill="currentColor">y = −1</text>
      <text x={X1} y={C.y + 18} textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="var(--hm-draw)">t</text>
    </HeroFrame>
  );
}

"use client";

// ── Hero figure: a quadratic Bézier curve ───────────────────────────────────
// The curve every vector-drawing program and font uses, built the way de
// Casteljau did: at a time t, mix P₀→P₁ and P₁→P₂ by t, then mix those two
// points by t again. The last point traces B(t) = (1−t)²P₀ + 2t(1−t)P₁ + t²P₂.
// t sweeps 0 → 1 and back; the slider pulls the middle control point.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

type P = { x: number; y: number };
const P0: P = { x: 46, y: 270 }, P2: P = { x: 394, y: 250 };
const mix = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

export default function Bezier({ ui, num, onNext, figNo }: HeroProps) {
  const [pull, setPull] = useState(0.75);
  const [u, setU] = useState(0.55);              // 0 → 2: there and back
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setU(s => (s + dt * 0.28) % 2));

  const t = u <= 1 ? u : 2 - u;
  const P1: P = { x: 180, y: 270 - 250 * pull };
  const a = mix(P0, P1, t), b = mix(P1, P2, t), B = mix(a, b, t);
  const curve = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  let traced = "";
  for (let i = 0; i <= 30; i++) {
    const s = (t * i) / 30, q = mix(mix(P0, P1, s), mix(P1, P2, s), s);
    traced += `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  const label = (p: P, text: string, dx: number, dy: number) => (
    <text x={p.x + dx} y={p.y + dy} fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="currentColor">{text}</text>
  );

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext} figNo={figNo}
      caption={ui.homeFigCurveCaption ?? "a Bézier curve"}
      aria={ui.homeFigCurveAria ?? "A quadratic Bézier curve drawn by mixing points between three control points"}
      slider={{ label: ui.homeFigCurveSlider ?? "pull of P₁", value: num(pull, 2), min: 0, max: 1, step: 0.05, at: pull, set: setPull }}
      formula={<><i>B</i>(<i>t</i>) = (1−<i>t</i>)²<i>P</i>₀ + 2<i>t</i>(1−<i>t</i>)<i>P</i>₁ + <i>t</i>²<i>P</i>₂, <i>t</i> = <b>{num(t, 2)}</b></>}>
      <path d={`M${P0.x} ${P0.y} L${P1.x} ${P1.y} L${P2.x} ${P2.y}`} fill="none" stroke="var(--hm-draw)" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.8" />
      <path d={curve} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <path d={traced} fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="var(--hm-draw)" strokeWidth="1.6" />
      <circle cx={a.x} cy={a.y} r="4.5" fill="var(--hm-draw)" />
      <circle cx={b.x} cy={b.y} r="4.5" fill="var(--hm-draw)" />
      {[P0, P1, P2].map((p, i) => <rect key={i} x={p.x - 6} y={p.y - 6} width="12" height="12" fill="var(--hm-surface)" stroke="currentColor" strokeWidth="2" />)}
      <circle cx={B.x} cy={B.y} r="9" fill="var(--hm-accent)" />
      {label(P0, "P₀", -8, 26)}
      {label(P1, "P₁", 12, -6)}
      {label(P2, "P₂", -8, 26)}
      <text x="300" y="40" fontFamily={MONO} fontSize="12" fill="currentColor">t = {num(t, 2)}</text>
    </HeroFrame>
  );
}

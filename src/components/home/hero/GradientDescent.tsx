"use client";

// ── Hero figure: gradient descent ───────────────────────────────────────────
// How a neural network learns, on the smallest possible problem: minimise
// f(w) = w² by stepping against the slope, w ← w − η f′(w) with f′(w) = 2w.
// So each step multiplies w by (1 − 2η): a small learning rate η creeps down,
// 0.5 < η < 1 zig-zags across the valley, η > 1 throws the ball out of it.
// A new descent starts from w = −2.6 when it settles or escapes.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

const W0 = -2.6, STEP_S = 0.6, MAX_STEPS = 14;
const X = (w: number) => 220 + w * 62;
const Y = (f: number) => 280 - f * 27;

/** The descent from W0 after n steps of rate eta: every w visited. */
function descent(eta: number, n: number) {
  const ws = [W0];
  for (let i = 0; i < n; i++) ws.push(ws[i] - eta * 2 * ws[i]);
  return ws;
}

/** The curve f(w) = w² across the drawing, clipped at the top. */
function curvePath() {
  return Array.from({ length: 61 }, (_, i) => {
    const w = -3.4 + (6.8 * i) / 60;
    return `${i ? "L" : "M"}${X(w).toFixed(1)} ${Math.max(Y(w * w), 8).toFixed(1)}`;
  }).join("");
}
const CURVE = curvePath();

export default function GradientDescent({ ui, num, onNext, figNo }: HeroProps) {
  const [eta, setEta] = useState(0.2);
  const [clock, setClock] = useState(STEP_S * 3.5);
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setClock(c => c + dt));

  const ws = descent(eta, MAX_STEPS);
  // stop early once it settles (|w| tiny) or leaves the valley
  const last = ws.findIndex((w, i) => i > 0 && (Math.abs(w) < 0.03 || Math.abs(w) > 3.3));
  const steps = last < 0 ? MAX_STEPS : last;
  const cycle = (steps + 2) * STEP_S;
  const n = Math.min(Math.floor((clock % cycle) / STEP_S), steps);
  const w = ws[n], fw = w * w;
  const slope = 2 * w;
  const shown = ws.slice(0, n + 1);
  const jumps = shown.slice(1).map((v, i) => {
    const a = { x: X(shown[i]), y: Y(Math.min(shown[i] ** 2, 10)) }, b = { x: X(v), y: Y(Math.min(v * v, 10)) };
    const mid = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 18 - Math.abs(b.x - a.x) * 0.12 };
    return <path key={i} d={`M${a.x} ${a.y} Q${mid.x} ${mid.y} ${b.x} ${b.y}`} fill="none" stroke="var(--hm-draw)" strokeWidth="1.3" strokeDasharray="3 4" />;
  });
  const state = eta > 1 ? ui.homeFigDescentOut ?? "too big: it climbs out"
    : eta > 0.5 ? ui.homeFigDescentZig ?? "big: it zig-zags"
    : ui.homeFigDescentSmall ?? "small: it creeps down";
  const inside = Math.abs(w) <= 3.4 && fw <= 10;

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext} figNo={figNo}
      caption={ui.homeFigDescentCaption ?? "how a network learns"}
      aria={ui.homeFigDescentAria ?? "A ball steps down the curve f(w) = w² by gradient descent; the learning rate sets the step size"}
      slider={{ label: ui.homeFigDescentSlider ?? "learning rate η", value: num(eta, 2), min: 0.05, max: 1.05, step: 0.05, at: eta, set: setEta }}
      formula={<><i>w</i> ← <i>w</i> − η <i>f</i>′(<i>w</i>) = <b>{num(w, 2)}</b></>}>
      <path d={`M14 ${Y(0)} H426 M${X(0)} ${Y(0) + 10} V18`} stroke="var(--hm-draw)" strokeWidth="1.2" opacity="0.75" />
      <path d={CURVE} fill="none" stroke="currentColor" strokeWidth="2" />
      {jumps}
      {inside && <path d={`M${X(w) - 34} ${Y(fw) + 34 * slope * (27 / 62)} L${X(w) + 34} ${Y(fw) - 34 * slope * (27 / 62)}`} stroke="var(--hm-draw)" strokeWidth="1.6" />}
      {inside && <circle cx={X(w)} cy={Y(fw) - 8} r="9" fill="var(--hm-accent)" />}
      <text x="300" y="70" fontFamily={SERIF} fontStyle="italic" fontSize="18" fill="currentColor">f(w) = w²</text>
      <text x="420" y={Y(0) + 22} textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill="var(--hm-draw)">w</text>
      <text x="16" y="30" fontFamily={MONO} fontSize="12" fill="currentColor">{`${ui.homeFigDescentStep ?? "step"} ${n} · ${state}`}</text>
    </HeroFrame>
  );
}

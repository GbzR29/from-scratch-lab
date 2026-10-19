"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Slider, Sliders, Readout, Row, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A plate pulled up and down, with an elliptical flaw across the pull: half
// length a, half height b, tip radius ρ = b²/a. The lines show how the load
// flows around the flaw, drawn as the streamlines of flow around an ellipse
// (Joukowski map of the flow around a circle); colour = how crowded they are.
// The number at the tip is Inglis's exact elastic result, σ_tip = σ(1 + 2a/b).

const W = 560, H = 290;
const SC = 86, X0 = W / 2, Y0 = H / 2;               // world units → SVG
const XS = 3.05, YS = 1.35;                        // half size of the plate, world units

type Shape = "hole" | "slot" | "crack";
const SHAPES: Record<Shape, { a: number; ba: number; label: string }> = {
  hole: { a: 0.6, ba: 1, label: "round hole" },
  slot: { a: 0.8, ba: 0.3, label: "slot" },
  crack: { a: 1, ba: 0.04, label: "sharp crack" },
};

/** Colour for how much the lines crowd: 1 = undisturbed. */
function heat(s: number) {
  const k = Math.min(1, Math.max(0, Math.log(s) / Math.log(10)));
  const stops = [[0.35, 0.55, 0.85], [0.95, 0.75, 0.2], [0.95, 0.2, 0.15]];
  const i = k < 0.5 ? 0 : 1, f = k < 0.5 ? k * 2 : (k - 0.5) * 2;
  const c = stops[i].map((v, j) => v + (stops[i + 1][j] - v) * f);
  return `rgb(${c.map(v => Math.round(v * 255)).join(",")})`;
}

/**
 * Streamlines of a flow straight up past an ellipse with half axes A (across)
 * and B (along the flow). In the ζ plane the ellipse is a circle of radius
 * R = (A + B)/2 and the stream function is ψ = −ξ(1 − R²/|ζ|²); z = ζ + k/ζ
 * with k = (A² − B²)/4 squashes the circle into the ellipse.
 */
function streamlines(A: number, B: number) {
  const R = (A + B) / 2, k = (A * A - B * B) / 4;
  const lines: { x: number; y: number; s: number }[][] = [];
  for (let i = 0; i < 13; i++) {
    const xi0 = 0.06 + i * 0.235;
    for (const side of [1, -1]) {
      const pts: { x: number; y: number; s: number }[] = [];
      for (let j = 0; j <= 90; j++) {
        const u = j / 45 - 1, eta = 1.75 * Math.sign(u) * Math.abs(u) ** 1.5;
        // Solve ξ(1 − R²/(ξ² + η²)) = ξ0 for ξ outside the circle (bisection)
        let lo = Math.sqrt(Math.max(R * R - eta * eta, 0)) + 1e-9, hi = xi0 + R + 1;
        for (let it = 0; it < 50; it++) {
          const m = (lo + hi) / 2, f = m * (1 - (R * R) / (m * m + eta * eta));
          if (f < xi0) lo = m; else hi = m;
        }
        const xi = (lo + hi) / 2, m2 = xi * xi + eta * eta;
        const x = xi + (k * xi) / m2, y = eta - (k * eta) / m2;
        // Crowding = speed of the flow, |1 + R²/ζ²| / |1 − k/ζ²|
        const re = (xi * xi - eta * eta) / (m2 * m2), im = (-2 * xi * eta) / (m2 * m2);
        const s = Math.hypot(1 + R * R * re, R * R * im) / Math.max(Math.hypot(1 - k * re, -k * im), 1e-6);
        pts.push({ x: side * x, y, s });
      }
      lines.push(pts);
    }
  }
  return lines;
}

export function FlawFigure({ t }: { t?: TrackTranslations }) {
  const [a, setA] = useState(1);
  const [ba, setBa] = useState(0.15);
  const b = a * ba, rho = (b * b) / a, K = 1 + (2 * a) / b;
  const shape = (Object.keys(SHAPES) as Shape[]).find(s => SHAPES[s].a === a && SHAPES[s].ba === ba) ?? ("" as Shape);
  const lines = streamlines(a, b);
  const X = (x: number) => X0 + x * SC, Y = (y: number) => Y0 - y * SC;
  const pick = (s: Shape) => { setA(SHAPES[s].a); setBa(SHAPES[s].ba); };

  return (
    <Figure title={tx(t, "figFlaw_title", "Where the load goes around a flaw")}
      controls={<>
        <Row>
          <Choice value={shape} options={(Object.keys(SHAPES) as Shape[]).map(s => [s, tx(t, `figFlaw_${s}`, SHAPES[s].label)] as const)} onChange={pick} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figFlaw_a", "half length a")} value={a} min={0.2} max={1.4} step={0.01} onChange={setA} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figFlaw_ba", "height / length b/a")} value={ba} min={0.03} max={1} step={0.01} onChange={setBa} fmt={v => f2(v, 2)} />
        </Sliders>
        <Row>
          <Readout>ρ = b²/a = {f2(rho, 4)}</Readout>
          <Readout color={C.red}>σ_tip = σ·(1 + 2a/b) = {f2(K, 1)} σ</Readout>
        </Row>
      </>}
      note={tx(t, "figFlaw_note", "The plate is pulled up and down (arrows). Far from the flaw the load is spread evenly, so the lines are straight and evenly spaced. The flaw carries nothing, so the load must squeeze around its ends, and the lines crowd there; colour shows how much. A round hole only triples the stress. Make it long and thin and the crowding at the tips explodes: that number is Inglis's, the exact elastic answer. The lines themselves are a picture, drawn as a fluid flowing around the same shape.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <rect x={X(-XS)} y={Y(YS)} width={2 * XS * SC} height={2 * YS * SC} fill="var(--surface)" stroke={C.axis} />
        {lines.map((pts, i) => pts.slice(1).map((p, j) => {
          const q = pts[j];
          if (Math.abs(p.y) > YS || Math.abs(q.y) > YS || Math.abs(p.x) > XS) return null;
          return <line key={`${i}-${j}`} x1={X(q.x)} y1={Y(q.y)} x2={X(p.x)} y2={Y(p.y)} stroke={heat((p.s + q.s) / 2)} strokeWidth={1.4} />;
        }))}
        <ellipse cx={X0} cy={Y0} rx={a * SC} ry={Math.max(b * SC, 0.6)} fill={C.bg} stroke={C.fg} strokeWidth={1} />
        {[-2, -1, 0, 1, 2].map(i => (
          <g key={i} stroke={C.muted} strokeWidth={1.2}>
            <line x1={X(i * 1.2)} y1={Y(YS) - 2} x2={X(i * 1.2)} y2={Y(YS) - 14} />
            <path d={`M${X(i * 1.2) - 4},${Y(YS) - 10} L${X(i * 1.2)},${Y(YS) - 15} L${X(i * 1.2) + 4},${Y(YS) - 10}`} fill="none" />
            <line x1={X(i * 1.2)} y1={Y(-YS) + 2} x2={X(i * 1.2)} y2={Y(-YS) + 14} />
            <path d={`M${X(i * 1.2) - 4},${Y(-YS) + 10} L${X(i * 1.2)},${Y(-YS) + 15} L${X(i * 1.2) + 4},${Y(-YS) + 10}`} fill="none" />
          </g>
        ))}
        <T x={X(XS) - 4} y={Y(YS) - 6} anchor="end">σ</T>
        <T x={X(a) + 6} y={Y0 - 6} color={C.red} bold>{f2(K, 1)}σ</T>
        <line x1={X0} y1={Y0 + Math.max(b * SC, 0.6) + 10} x2={X(a)} y2={Y0 + Math.max(b * SC, 0.6) + 10} stroke={C.muted} />
        <T x={X(a / 2)} y={Y0 + Math.max(b * SC, 0.6) + 22} anchor="middle">a</T>
      </svg>
    </Figure>
  );
}

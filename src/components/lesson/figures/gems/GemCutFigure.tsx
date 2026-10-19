"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Readout, Row, C, T, useDrag, f2, clamp } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "../physics/spectrum";
import { MATERIALS, cauchy, profile, traceDown, lightReturn, pavilionWindow, type P2 } from "./gemCut";

// ── What this figure shows ────────────────────────────────────────────────────
// The section of a round brilliant, lit from straight above. Every ray is
// traced the way a shader would: refract() in, then at each facet either total
// internal reflection or a split into a part that leaves and a part reflected
// back in. Light that leaves through the crown comes back to the viewer (green
// in one colour); light that leaves through the pavilion is lost (red). The
// plot on the right is that "light return" for every pavilion angle, with the
// window the chapter derives shaded. "White light" traces seven wavelengths:
// the colours separate only where light leaves at a slant, which is the fire.

const W = 560, H = 300;
const SX = 165, SY = 120, S = 118;                       // stone centre on screen and pixels per unit
const PX0 = 345, PX1 = 545, PY0 = 36, PY1 = 250;         // plot box
const A0 = 25, A1 = 60;                                  // plot range of the pavilion angle
const WHITE = [420, 460, 500, 540, 580, 620, 660];
const RAYS = 17;

const toScreen = ([x, y]: P2) => ({ x: SX + x * S, y: SY - y * S });

export function GemCutFigure({ t }: { t?: TrackTranslations }) {
  const [alpha, setAlpha] = useState(40.75);
  const [beta, setBeta] = useState(34.5);
  const [mat, setMat] = useState("diamond");
  const [white, setWhite] = useState(false);
  const [boost, setBoost] = useState(3);
  const m = MATERIALS.find(x => x.id === mat)!;
  const nMid = cauchy(m, 550);
  const win = pavilionWindow(nMid);
  const poly = profile(alpha, beta);

  const curve = useMemo(() => Array.from({ length: 71 }, (_, i) => {
    const a = A0 + ((A1 - A0) * i) / 70;
    return { a, r: lightReturn(a, beta, nMid, 160) };
  }), [beta, nMid]);
  const ret = lightReturn(alpha, beta, nMid);

  const lams = white ? WHITE : [550];
  const pieces = lams.flatMap(l => {
    const n = cauchy(m, l, boost);
    return Array.from({ length: RAYS }, (_, i) => -0.94 + (1.88 * i) / (RAYS - 1))
      .flatMap(x => traceDown(poly, x, n).map(p => ({ ...p, l })));
  });

  const ax = (a: number) => PX0 + ((a - A0) / (A1 - A0)) * (PX1 - PX0);
  const ry = (r: number) => PY1 - r * (PY1 - PY0);
  const drag = useDrag<"plot">(
    p => (p.x > PX0 - 10 && p.x < PX1 + 10 && p.y > PY0 - 10 && p.y < PY1 + 20 ? "plot" : null),
    (_, p) => setAlpha(Math.round(clamp(A0 + ((p.x - PX0) / (PX1 - PX0)) * (A1 - A0), A0, A1) * 4) / 4),
  );

  const colour = (kind: string, l: number) =>
    kind === "fall" ? C.fg : white ? wavelengthCss(l) : kind === "top" ? C.green : kind === "leak" ? C.red : C.amber;

  return (
    <Figure title={tx(t, "figGemCut_title", "Where the light goes in a brilliant")}
      head={<Btn active={white} onClick={() => setWhite(w => !w)}>{tx(t, "figGemCut_white", "white light")}</Btn>}
      controls={<>
        <Row>
          <Choice value={mat} options={MATERIALS.map(x => [x.id, tx(t, `figGemCut_m_${x.id}`, x.label)] as const)} onChange={setMat} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figGemCut_alpha", "pavilion angle α")} value={alpha} min={A0} max={A1} step={0.25} onChange={setAlpha} fmt={v => `${f2(v, 2)}°`} />
          <Slider label={tx(t, "figGemCut_beta", "crown angle β")} value={beta} min={20} max={45} step={0.5} onChange={setBeta} fmt={v => `${f2(v, 1)}°`} />
          {white && <Slider label={tx(t, "figGemCut_boost", "colour spread ×")} value={boost} min={1} max={8} step={0.5} onChange={setBoost} fmt={v => `${f2(v, 1)}×`} />}
        </Sliders>
        <Row>
          <Btn active={Math.abs(alpha - 40.75) < 0.01 && beta === 34.5} onClick={() => { setAlpha(40.75); setBeta(34.5); }}>{tx(t, "figGemCut_ideal", "Tolkowsky 1919")}</Btn>
          <Btn active={alpha === 33} onClick={() => setAlpha(33)}>{tx(t, "figGemCut_shallow", "too shallow")}</Btn>
          <Btn active={alpha === 53} onClick={() => setAlpha(53)}>{tx(t, "figGemCut_deep", "too deep")}</Btn>
        </Row>
        <Row>
          <Readout>{`n(550 nm) = ${f2(nMid, 3)}`}</Readout>
          <Readout>{`θc = ${f2(win.crit, 1)}°`}</Readout>
          <Readout color={C.purple}>{`${tx(t, "figGemCut_window", "window")}: ${f2(win.lo, 1)}° – ${f2(win.hi, 1)}°`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figGemCut_return", "light return")}: ${f2(ret * 100, 0)}%`}</Readout>
        </Row>
      </>}
      note={tx(t, "figGemCut_note", "Light falls straight down on the stone. Green leaves through the crown and reaches the viewer above; red leaks out of the pavilion and is lost. Drag across the plot, or move α. Below the window the pavilion is too shallow: the first facet is hit at less than the critical angle and light pours out of the bottom (a “fish-eye”). Above it the stone is too deep: after two reflections the light comes back too steeply to leave through the table and runs out of the far side (a dark “nail-head”). Switch to glass: its critical angle is so much larger that the window shrinks to a few degrees. In white light the colours split only where light leaves at a slant; that is the fire.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none">
        {/* the stone */}
        <polygon points={poly.map(p => { const s = toScreen(p); return `${s.x},${s.y}`; }).join(" ")}
          fill={C.sky} fillOpacity={0.06 + 0.04 * (nMid - 1)} stroke={C.sky} strokeWidth={1.3} strokeLinejoin="round" />
        <defs><clipPath id="gemcut-clip"><rect x={0} y={0} width={PX0 - 30} height={H} /></clipPath></defs>
        <g clipPath="url(#gemcut-clip)">
          {pieces.map((p, i) => {
            if (white && p.kind === "fall" && p.l !== 540) return null;
            const a = toScreen(p.a), b = toScreen(p.b);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colour(p.kind, p.l)}
              strokeWidth={p.kind === "fall" ? 0.7 : 1.1} opacity={p.kind === "fall" ? 0.35 : (white ? 0.25 : 0.15) + 0.85 * Math.sqrt(p.w)} strokeLinecap="round" />;
          })}
        </g>
        <T x={SX} y={H - 8} size={9} anchor="middle" color={C.muted}>{`α = ${f2(alpha, 2)}°   β = ${f2(beta, 1)}°`}</T>

        {/* light return against the pavilion angle */}
        <rect x={ax(win.lo)} y={PY0} width={Math.max(0, ax(win.hi) - ax(win.lo))} height={PY1 - PY0} fill={C.purple} opacity={0.12} />
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <g key={v}>
            <line x1={PX0} y1={ry(v)} x2={PX1} y2={ry(v)} stroke={C.grid} strokeWidth={0.6} />
            <T x={PX0 - 4} y={ry(v) + 3} size={8} anchor="end" color={C.muted}>{`${v * 100}%`}</T>
          </g>
        ))}
        {[30, 40, 50, 60].map(a => <T key={a} x={ax(a)} y={PY1 + 12} size={8} anchor="middle" color={C.muted}>{`${a}°`}</T>)}
        <polyline points={curve.map(c => `${ax(c.a)},${ry(c.r)}`).join(" ")} fill="none" stroke={C.green} strokeWidth={1.8} strokeLinejoin="round" />
        <line x1={ax(alpha)} y1={PY0} x2={ax(alpha)} y2={PY1} stroke={C.amber} strokeWidth={1.4} />
        <circle cx={ax(alpha)} cy={ry(ret)} r={4} fill={C.amber} />
        <T x={(PX0 + PX1) / 2} y={PY0 - 14} size={9} anchor="middle">{tx(t, "figGemCut_plot", "light back out of the crown")}</T>
        <T x={(PX0 + PX1) / 2} y={PY1 + 26} size={9} anchor="middle" color={C.muted}>{tx(t, "figGemCut_axis", "pavilion angle α")}</T>
      </svg>
    </Figure>
  );
}

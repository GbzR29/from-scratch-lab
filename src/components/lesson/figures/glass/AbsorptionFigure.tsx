"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Slider, Readout, Row, C, T, Handle, useDrag, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Beer–Lambert absorption, channel by channel. Top left: a wedge of tinted
// glass (or a column of water) seen from the side, thin on the left and thick
// on the right. Below it: what white light looks like after crossing that
// thickness, T = e^(−σ d) per channel, multiplied with a white backdrop.
// Right: the three transmission curves. Drag the cursor (or the slider) to
// read the numbers at one thickness. The materials' σ are rough real values:
// water absorbs red about 20× faster than blue, which is why it turns
// blue-green with depth.

const W = 560, H = 250;
const WX0 = 24, WX1 = 300;                          // wedge and strip, left to right = thin to thick
const PX = 345, PW = 195, PY = 22, PH = 190;        // plot box

type Mat = "bottle" | "cobalt" | "amber" | "water";
const MATS: Record<Mat, { s: [number, number, number]; dMax: number; unit: string; label: string }> = {
  bottle: { s: [1.1, 0.22, 0.9], dMax: 4, unit: "cm", label: "bottle glass" },
  cobalt: { s: [1.7, 1.2, 0.12], dMax: 4, unit: "cm", label: "cobalt glass" },
  amber: { s: [0.12, 0.55, 1.9], dMax: 4, unit: "cm", label: "amber glass" },
  water: { s: [0.35, 0.06, 0.017], dMax: 30, unit: "m", label: "clear water" },
};
const BACK: [number, number, number] = [0.96, 0.95, 0.92];   // the white backdrop behind the glass
const CH = [["R", C.red], ["G", C.green], ["B", C.blue]] as const;

const css = (c: number[]) => `rgb(${c.map(v => Math.round(255 * Math.pow(clamp(v, 0, 1), 1 / 2.2))).join(",")})`;

export function AbsorptionFigure({ t }: { t?: TrackTranslations }) {
  const [mat, setMat] = useState<Mat>("bottle");
  const [k, setK] = useState(1);                     // density: scales every σ
  const [frac, setFrac] = useState(0.5);             // cursor, 0..1 of the thickness range

  const M = MATS[mat];
  const sig = M.s.map(s => s * k);
  const d = frac * M.dMax;
  const Tr = sig.map(s => Math.exp(-s * d));
  const seen = Tr.map((v, i) => v * BACK[i]);
  const xOf = (f: number) => WX0 + f * (WX1 - WX0);
  const Xp = (f: number) => PX + f * PW, Yp = (v: number) => PY + (1 - v) * PH;

  const drag = useDrag<number>(
    p => (p.y > 20 && p.y < H - 10 && ((p.x > WX0 - 8 && p.x < WX1 + 8) || (p.x > PX - 8 && p.x < PX + PW + 8)) ? 0 : null),
    (_, p) => setFrac(clamp(p.x > PX - 8 ? (p.x - PX) / PW : (p.x - WX0) / (WX1 - WX0), 0, 1)),
  );

  const STRIPS = 56;
  const curve = (s: number) => Array.from({ length: 121 }, (_, i) => {
    const f = i / 120;
    return `${i ? "L" : "M"}${Xp(f).toFixed(1)},${Yp(Math.exp(-s * f * M.dMax)).toFixed(1)}`;
  }).join(" ");
  const opts = (Object.keys(MATS) as Mat[]).map(m => [m, tx(t, `figAbs_${m}`, MATS[m].label)] as const);

  return (
    <Figure title={tx(t, "figAbs_title", "Beer–Lambert: colour from thickness")}
      controls={<>
        <Row><Choice value={mat} options={opts} onChange={setMat} /></Row>
        <Row>
          <Slider label={tx(t, "figAbs_density", "density ×")} value={k} min={0.25} max={3} step={0.05} onChange={setK} fmt={v => `${f2(v, 2)}×`} />
          <Slider label="d" value={frac} min={0} max={1} step={0.005} onChange={setFrac} fmt={() => `${f2(d, mat === "water" ? 1 : 2)} ${M.unit}`} />
        </Row>
        <Row>
          {CH.map(([name, color], i) => (
            <Readout key={name} color={color}>{`T_${name} = e^(−${f2(sig[i], 3)}·${f2(d, 2)}) = ${f2(Tr[i], 3)}`}</Readout>
          ))}
        </Row>
        <Row>
          {CH.map(([name, color], i) => (
            <Readout key={name} color={color}>{`${tx(t, "figAbs_half", "halves every")} ln2/σ_${name} = ${f2(Math.LN2 / sig[i], 2)} ${M.unit}`}</Readout>
          ))}
        </Row>
      </>}
      note={tx(t, "figAbs_note", "Drag across the wedge or the plot. Every channel loses the same fraction for every extra unit of thickness, so each curve is an exponential and each channel halves after its own distance ln 2 / σ. The colour you see is the three survivors multiplied with the white behind the glass. Thin glass is nearly clear; thick glass shows the colour of the channel that is absorbed least. That is why the edge of a window pane, where light travels through the whole width, is green even though the pane looks colourless face-on. Pick water and go deep: red is gone after a few metres, green after tens, and what is left is blue.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none cursor-ew-resize">
        {/* the wedge, side view */}
        <T x={WX0} y={16} size={8.5}>{tx(t, "figAbs_side", "side view: thickness grows to the right")}</T>
        <polygon points={`${WX0},92 ${WX1},92 ${WX1},28`} fill={css(sig.map(s => Math.exp(-s * M.dMax * 0.35)))} fillOpacity={0.75} stroke={C.fg} strokeWidth={1} />
        <line x1={xOf(frac)} y1={92} x2={xOf(frac)} y2={92 - frac * 64} stroke={C.amber} strokeWidth={2} />
        <T x={clamp(xOf(frac), WX0 + 30, WX1 - 30)} y={104} size={8} anchor="middle" color={C.amber}>{`d = ${f2(d, mat === "water" ? 1 : 2)} ${M.unit}`}</T>
        {/* what you see through it */}
        <T x={WX0} y={116} size={8.5}>{tx(t, "figAbs_seen", "looking through it at white light")}</T>
        {Array.from({ length: STRIPS }, (_, i) => {
          const f = (i + 0.5) / STRIPS;
          const c = sig.map((s, j) => Math.exp(-s * f * M.dMax) * BACK[j]);
          return <rect key={i} x={xOf(i / STRIPS)} y={124} width={(WX1 - WX0) / STRIPS + 0.6} height={56} fill={css(c)} />;
        })}
        <rect x={WX0} y={124} width={WX1 - WX0} height={56} fill="none" stroke={C.fg} strokeWidth={1} />
        <line x1={xOf(frac)} y1={120} x2={xOf(frac)} y2={184} stroke={C.amber} strokeWidth={2} />
        <rect x={WX0} y={196} width={40} height={36} rx={4} fill={css(seen)} stroke={C.fg} strokeWidth={1} />
        <T x={WX0 + 48} y={210} size={8.5} color={C.fg}>{tx(t, "figAbs_swatch", "colour at the cursor")}</T>
        <T x={WX0 + 48} y={224} size={8}>{`(${seen.map(v => f2(v, 2)).join(", ")})`}</T>

        {/* transmission curves */}
        <rect x={PX} y={PY} width={PW} height={PH} fill="var(--code-line)" opacity={0.3} />
        {[0, 0.25, 0.5, 0.75, 1].map(v => <line key={v} x1={PX} y1={Yp(v)} x2={PX + PW} y2={Yp(v)} stroke="var(--code-line)" />)}
        {CH.map(([name, color], i) => <path key={name} d={curve(sig[i])} fill="none" stroke={color} strokeWidth={2} />)}
        <line x1={Xp(frac)} y1={PY} x2={Xp(frac)} y2={PY + PH} stroke={C.amber} strokeWidth={1.4} />
        {CH.map(([name, color], i) => <Handle key={name} x={Xp(frac)} y={Yp(Tr[i])} color={color} r={3.5} />)}
        <T x={PX - 4} y={Yp(1) + 3} size={8} anchor="end">1</T>
        <T x={PX - 4} y={Yp(0.5) + 3} size={8} anchor="end">½</T>
        <T x={PX - 4} y={Yp(0) + 3} size={8} anchor="end">0</T>
        <T x={PX} y={PY + PH + 13} size={8}>0</T>
        <T x={PX + PW} y={PY + PH + 13} size={8} anchor="end">{`${M.dMax} ${M.unit}`}</T>
        <T x={PX + PW / 2} y={PY + PH + 13} size={8} anchor="middle">{tx(t, "figAbs_axis", "thickness d")}</T>
        <T x={PX + PW - 6} y={PY + 12} size={8.5} anchor="end" color={C.fg}>{"T = e^(−σd)"}</T>
      </svg>
    </Figure>
  );
}

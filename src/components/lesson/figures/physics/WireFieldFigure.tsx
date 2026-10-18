"use client";

import { useState, type ReactElement } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, Sliders, C, T, Vec, Handle, useDrag, nearest, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Two long straight wires seen end-on (1 px = 1 mm). A current out of the
// screen is a dot, into the screen a cross. Each wire makes a magnetic field
// that circles it, B = μ₀I/(2πr), anticlockwise around a current coming out
// (right-hand rule); the field anywhere is the vector sum of the two. Small
// compass needles show it: the red end points along B, fainter where B is
// weak. Each wire sits in the other's field and feels F/L = μ₀I₁I₂/(2πd):
// currents the same way attract, opposite ways repel. Wire 2 can be dragged.

const W = 560, H = 320;
const MU0 = 4 * Math.PI * 1e-7;
const M = 0.001;                                   // metres per px
const W1 = { x: 200, y: 160 };

/** Field (T) at (x, y) from wires with currents (A, + = out of the screen). */
function bField(x: number, y: number, wires: { x: number; y: number; I: number }[]) {
  let bx = 0, by = 0;
  for (const w of wires) {
    const dx = (x - w.x) * M, dy = (y - w.y) * M, r2 = dx * dx + dy * dy;
    if (r2 < 1e-6) continue;
    const k = (MU0 * w.I) / (2 * Math.PI * r2);
    // anticlockwise on screen for a current out of the screen (y points down)
    bx += k * dy; by += -k * dx;
  }
  return { bx, by };
}

/** Compass needles on a grid, red end along B, faded where B is weak. */
function compassNeedles(wires: { x: number; y: number; I: number }[]) {
  const needles: ReactElement[] = [];
  for (let y = 20; y < H; y += 30) {
    for (let x = 20; x < W; x += 30) {
      if (wires.some(w => Math.hypot(w.x - x, w.y - y) < 16)) continue;
      const { bx, by } = bField(x, y, wires), b = Math.hypot(bx, by);
      if (b === 0) continue;
      const nx = bx / b, ny = by / b, op = clamp(0.15 + Math.log10(1 + b / 5e-6) / 2, 0.15, 1);
      needles.push(
        <g key={`${x}-${y}`} opacity={op}>
          <path d={`M${x + 9 * nx},${y + 9 * ny} L${x - 3 * ny},${y + 3 * nx} L${x + 3 * ny},${y - 3 * nx} Z`} fill={C.red} />
          <path d={`M${x - 9 * nx},${y - 9 * ny} L${x - 3 * ny},${y + 3 * nx} L${x + 3 * ny},${y - 3 * nx} Z`} fill={C.muted} />
        </g>,
      );
    }
  }
  return needles;
}

export function WireFieldFigure({ t }: { t?: TrackTranslations }) {
  const [I1, setI1] = useState(10);
  const [I2, setI2] = useState(10);
  const [w2, setW2] = useState({ x: 340, y: 160 });

  const drag = useDrag<number>(p => nearest<number>(p, [[0, w2]], 22), (_, p) => setW2({ x: clamp(p.x, 20, W - 20), y: clamp(p.y, 20, H - 20) }));
  const wires = [{ ...W1, I: I1 }, { ...w2, I: I2 }];
  const d = Math.max(Math.hypot(w2.x - W1.x, w2.y - W1.y) * M, 0.005);
  const fPerL = (MU0 * I1 * I2) / (2 * Math.PI * d);            // N/m, + = attraction
  const ux = (w2.x - W1.x) / (d / M), uy = (w2.y - W1.y) / (d / M);
  const fLen = clamp(18 * Math.log10(1 + Math.abs(fPerL) * 1e5), 0, 60) * Math.sign(fPerL);

  const needles = compassNeedles(wires);

  const wire = (x: number, y: number, I: number, active = false) => (
    <g>
      <circle cx={x} cy={y} r={13} fill="var(--code-bg)" stroke={active ? C.amber : C.fg} strokeWidth={2} />
      {I > 0 ? <circle cx={x} cy={y} r={3.5} fill={C.fg} />
        : I < 0 ? <path d={`M${x - 6},${y - 6} L${x + 6},${y + 6} M${x - 6},${y + 6} L${x + 6},${y - 6}`} stroke={C.fg} strokeWidth={2} />
        : null}
    </g>
  );
  const bMid = bField((W1.x + w2.x) / 2, (W1.y + w2.y) / 2, wires);

  return (
    <Figure title={tx(t, "figPhWire_title", "The magnetic field of two currents")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhWire_I1", "current in wire 1")} value={I1} min={-20} max={20} step={1} onChange={setI1} fmt={v => `${f2(v, 0)} A`} />
          <Slider label={tx(t, "figPhWire_I2", "current in wire 2")} value={I2} min={-20} max={20} step={1} onChange={setI2} fmt={v => `${f2(v, 0)} A`} />
        </Sliders>
        <Row>
          <Readout>{`d = ${f2(d * 100, 1)} cm`}</Readout>
          <Readout color={C.sky}>{`B ${tx(t, "figPhWire_mid", "halfway")} = ${f2(Math.hypot(bMid.bx, bMid.by) * 1e6, 1)} µT`}</Readout>
          <Readout color={fPerL >= 0 ? C.green : C.red}>
            {`F/L = μ₀I₁I₂/(2πd) = ${f2(Math.abs(fPerL) * 1e6, 1)} µN/m · ${fPerL > 0 ? tx(t, "figPhWire_attract", "attract") : fPerL < 0 ? tx(t, "figPhWire_repel", "repel") : "0"}`}
          </Readout>
        </Row>
      </>}
      note={tx(t, "figPhWire_note", "Each needle points along the magnetic field, red end first. Set one current to zero: the needles circle the other wire, anticlockwise when its current comes out of the screen (a dot), clockwise when it goes in (a cross), and fade with distance as 1/r. With both currents the same way, the fields cancel between the wires, where the needles go pale, and add up outside, and the wires pull together. Reverse one current and the fields add between the wires instead, and they push apart. Drag wire 2 closer and the force grows as 1/d. Two wires 1 m apart, each carrying 1 A, attract with 2 × 10⁻⁷ N per metre: until 2019 that was the definition of the ampere. For comparison, the Earth's own field is about 50 µT.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {needles}
        {wire(W1.x, W1.y, I1)}
        {wire(w2.x, w2.y, I2, drag.dragging === 0)}
        {fLen !== 0 && <>
          <Vec a={{ x: w2.x - 16 * ux, y: w2.y - 16 * uy }} b={{ x: w2.x - (16 + fLen) * ux, y: w2.y - (16 + fLen) * uy }} color={fPerL > 0 ? C.green : C.red} w={2.5} />
          <Vec a={{ x: W1.x + 16 * ux, y: W1.y + 16 * uy }} b={{ x: W1.x + (16 + fLen) * ux, y: W1.y + (16 + fLen) * uy }} color={fPerL > 0 ? C.green : C.red} w={2.5} />
        </>}
        <T x={W1.x} y={W1.y + 30} anchor="middle" size={9} color={C.fg}>1</T>
        <T x={w2.x} y={w2.y + 30} anchor="middle" size={9} color={C.fg}>2</T>
        <Handle x={w2.x} y={w2.y - 22} color={C.amber} r={3.5} active={drag.dragging === 0} />
        <T x={10} y={H - 8} size={8}>{tx(t, "figPhWire_key", "• out of the screen · × into the screen · 1 px = 1 mm")}</T>
      </svg>
    </Figure>
  );
}

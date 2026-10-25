"use client";

import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, Slider, C, T, Handle, useDrag, clamp, hash2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Worley (cellular) noise at one draggable point P, the way a shader computes it:
// every unit cell holds one feature point at a hashed offset (scaled by the
// jitter), and P looks at the 3×3 cells around its own. The nearest point
// gives F1, the second nearest F2. The background is the whole field in the
// chosen mode: F1 (round cells), F2, F2 − F1 (dark lines on the borders) or
// the id of the nearest cell (flat colours). "own cell only" is the break-it:
// searching one cell instead of nine gives square, broken cells.

const CELLS_X = 5, CELLS_Y = 3, W = 560, CS = W / CELLS_X, H = CS * CELLS_Y;
const CW = 280, CH = Math.round(CW * CELLS_Y / CELLS_X);
type Mode = "F1" | "F2" | "F2-F1" | "id";
const MODES: Mode[] = ["F1", "F2", "F2-F1", "id"];

/** Feature point of cell (i, j): the cell corner plus a hashed offset in [0.5 ± jitter/2]. */
function feature(i: number, j: number, seed: number, jitter: number) {
  const ox = 0.5 + (hash2(i, j, seed) - 0.5) * jitter;
  const oy = 0.5 + (hash2(i, j, seed + 101) - 0.5) * jitter;
  return { x: i + ox, y: j + oy };
}

/** F1, F2 and the cells they came from, searching (2r + 1)² cells around p. */
function worley(px: number, py: number, seed: number, jitter: number, r: number) {
  const ix = Math.floor(px), iy = Math.floor(py);
  let f1 = 9, f2 = 9, c1 = { i: ix, j: iy }, c2 = c1;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const i = ix + dx, j = iy + dy, q = feature(i, j, seed, jitter);
    const d = Math.hypot(q.x - px, q.y - py);
    if (d < f1) { f2 = f1; c2 = c1; f1 = d; c1 = { i, j }; }
    else if (d < f2) { f2 = d; c2 = { i, j }; }
  }
  return { f1, f2, c1, c2, ix, iy };
}

/** The feature points of every drawn cell, plus a ring of cells around them. */
function allFeatures(seed: number, jitter: number) {
  const pts: { i: number; j: number; x: number; y: number }[] = [];
  for (let j = -1; j <= CELLS_Y; j++) for (let i = -1; i <= CELLS_X; i++) pts.push({ i, j, ...feature(i, j, seed, jitter) });
  return pts;
}

export function WorleyFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("F1");
  const [jitter, setJitter] = useState(0.9);
  const [seed, setSeed] = useState(4);
  const [own, setOwn] = useState(false);
  const [P, setP] = useState({ x: 2.3, y: 1.6 });
  const canvas = useRef<HTMLCanvasElement>(null);
  const reach = own ? 0 : 1;

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    cv.width = CW; cv.height = CH;
    const ctx = cv.getContext("2d")!, img = ctx.createImageData(CW, CH);
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const px = ((x + 0.5) / CW) * CELLS_X, py = CELLS_Y - ((y + 0.5) / CH) * CELLS_Y;
      const w = worley(px, py, seed, jitter, reach);
      let rgb: [number, number, number];
      if (mode === "id") {
        const h = hash2(w.c1.i, w.c1.j, seed + 7);
        rgb = [70 + 150 * h, 90 + 110 * hash2(w.c1.i, w.c1.j, seed + 8), 120 + 120 * (1 - h)];
      } else {
        const v = mode === "F1" ? w.f1 : mode === "F2" ? w.f2 * 0.7 : clamp((w.f2 - w.f1) * 3, 0, 1);
        const g = clamp(v, 0, 1) * 255;
        rgb = [g * 0.55, g * 0.75, g];
      }
      const k = (y * CW + x) * 4;
      img.data[k] = rgb[0]; img.data[k + 1] = rgb[1]; img.data[k + 2] = rgb[2]; img.data[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [mode, jitter, seed, reach]);

  // world (y up) ↔ viewBox
  const X = (x: number) => x * CS, Y = (y: number) => H - y * CS;
  const drag = useDrag<"p">(q => (Math.hypot(q.x - X(P.x), q.y - Y(P.y)) < 24 ? "p" : null),
    (_, q) => setP({ x: clamp(q.x / CS, 0.02, CELLS_X - 0.02), y: clamp((H - q.y) / CS, 0.02, CELLS_Y - 0.02) }));

  const w = worley(P.x, P.y, seed, jitter, reach);
  const p1 = feature(w.c1.i, w.c1.j, seed, jitter), p2 = feature(w.c2.i, w.c2.j, seed, jitter);
  const pts = allFeatures(seed, jitter);
  const searched = (i: number, j: number) => Math.abs(i - w.ix) <= reach && Math.abs(j - w.iy) <= reach;

  const notes: Record<Mode, string> = {
    F1: tx(t, "figWorley_nF1", "F1 is the distance from each pixel to the nearest feature point: 0 on the point, growing outwards, so every cell is a soft round blob. Drag P: the green line goes to the nearest point, and only the nine outlined cells are ever examined."),
    F2: tx(t, "figWorley_nF2", "F2 is the distance to the second-nearest point (amber line). It is never smaller than F1 and gives puffier, overlapping shapes; on its own it is used less than in combination with F1."),
    "F2-F1": tx(t, "figWorley_nF21", "F2 − F1 is zero exactly where two points are equally near: on the borders between cells. Thresholding it draws the outline of every cell, which is the base of stones, scales, cracked mud and crackle glazes."),
    id: tx(t, "figWorley_nId", "Instead of a distance, keep which cell the nearest point belongs to and hash that cell's index into a colour. Every pixel of a cell gets the same number: flat Voronoi regions, ready to give each stone or tile its own colour, height or rotation."),
  };

  return (
    <Figure
      title={tx(t, "figWorley_title", "Worley noise: the 3 × 3 search")}
      head={<>
        <Btn active={own} onClick={() => setOwn(o => !o)}>{tx(t, "figWorley_own", "own cell only")}</Btn>
        <Btn onClick={() => setSeed(s => s + 1)}>{tx(t, "figWorley_seed", "new seed")}</Btn>
      </>}
      controls={<>
        <Row>
          <Choice value={mode} onChange={v => setMode(v as Mode)} options={MODES.map(m => [m, m === "id" ? tx(t, "figWorley_id", "cell id") : m] as const)} />
          <Slider label={tx(t, "figWorley_jitter", "jitter")} value={jitter} min={0} max={1} step={0.01} onChange={setJitter} />
        </Row>
        <Row>
          <Readout>{tx(t, "figWorley_cell", "cell")} ({w.ix}, {w.iy})</Readout>
          <Readout color={C.green}>F1 = {w.f1.toFixed(3)}</Readout>
          {!own && <Readout color={C.amber}>F2 = {w.f2.toFixed(3)}</Readout>}
          {!own && <Readout>F2 − F1 = {(w.f2 - w.f1).toFixed(3)}</Readout>}
          <Readout>{tx(t, "figWorley_nearest", "nearest point in cell")} ({w.c1.i}, {w.c1.j})</Readout>
        </Row>
      </>}
      note={own
        ? tx(t, "figWorley_nOwn", "With only the own cell searched, each pixel measures the distance to the one point of its own square, so the pattern is cut along the grid lines: square cells with jumps at every border. A nearer point often sits in the next cell, which is why the shader loops over the 3 × 3 neighbourhood.")
        : notes[mode]}
    >
      <div className="relative">
        <canvas ref={canvas} className="absolute inset-0 w-full h-full" style={{ opacity: 0.85 }} />
        <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="relative w-full h-auto cursor-grab" role="img" aria-label="Worley noise">
          {Array.from({ length: CELLS_X + 1 }, (_, i) => <line key={`v${i}`} x1={X(i)} x2={X(i)} y1={0} y2={H} stroke={C.axis} strokeOpacity={0.5} />)}
          {Array.from({ length: CELLS_Y + 1 }, (_, j) => <line key={`h${j}`} y1={Y(j)} y2={Y(j)} x1={0} x2={W} stroke={C.axis} strokeOpacity={0.5} />)}
          <rect x={X(w.ix - reach)} y={Y(w.iy + reach + 1)} width={CS * (2 * reach + 1)} height={CS * (2 * reach + 1)}
            fill="none" stroke={C.fg} strokeWidth={1.6} strokeDasharray="6 4" />
          {pts.map(p => (
            <circle key={`${p.i},${p.j}`} cx={X(p.x)} cy={Y(p.y)} r={searched(p.i, p.j) ? 4 : 2.8}
              fill={searched(p.i, p.j) ? C.fg : C.muted} opacity={searched(p.i, p.j) ? 1 : 0.55} />
          ))}
          {!own && <line x1={X(P.x)} y1={Y(P.y)} x2={X(p2.x)} y2={Y(p2.y)} stroke={C.amber} strokeWidth={2} strokeDasharray="5 3" />}
          <line x1={X(P.x)} y1={Y(P.y)} x2={X(p1.x)} y2={Y(p1.y)} stroke={C.green} strokeWidth={2.4} />
          <circle cx={X(p1.x)} cy={Y(p1.y)} r={6} fill="none" stroke={C.green} strokeWidth={2} />
          <Handle x={X(P.x)} y={Y(P.y)} color={C.pink} active />
          <T x={X(P.x) + 10} y={Y(P.y) - 9} size={10} bold color={C.fg}>P</T>
          <T x={6} y={14} size={9} color={C.fg}>{tx(t, "figWorley_drag", "drag P")}</T>
        </svg>
      </div>
    </Figure>
  );
}

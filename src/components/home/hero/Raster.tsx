"use client";

// ── Hero figure: a triangle becomes pixels ──────────────────────────────────
// What the rasterizer does: every pixel whose centre falls inside the triangle
// is coloured, and its colour mixes the three corner colours by the pixel's
// barycentric weights (α, β, γ), c = αc₀ + βc₁ + γc₂. The slider sets how many
// pixels fit across the stage; the triangle turns slowly so the coverage changes.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, MONO, type HeroProps } from "./frame";

const W = 440, H = 320;
const CENTER = { x: 220, y: 168 }, RADIUS = 138;
// Corner colours (data, the same in both themes)
const CORNERS: [number, number, number][] = [[229, 72, 77], [48, 164, 108], [62, 99, 221]];

type P = { x: number; y: number };

/** The triangle's corners after turning by `turn` radians. */
function corners(turn: number): P[] {
  return [0, 1, 2].map(i => {
    const a = turn + (i * 2 * Math.PI) / 3 - Math.PI / 2;
    return { x: CENTER.x + RADIUS * Math.cos(a), y: CENTER.y + RADIUS * Math.sin(a) * 0.82 };
  });
}

/** The pixels whose centre is inside the triangle, each coloured by its barycentric weights. */
function rasterize(v: P[], across: number) {
  const area = (v[1].x - v[0].x) * (v[2].y - v[0].y) - (v[2].x - v[0].x) * (v[1].y - v[0].y);
  const weights = (p: P) => {
    const a = ((v[1].x - p.x) * (v[2].y - p.y) - (v[2].x - p.x) * (v[1].y - p.y)) / area;
    const b = ((v[2].x - p.x) * (v[0].y - p.y) - (v[0].x - p.x) * (v[2].y - p.y)) / area;
    return [a, b, 1 - a - b];
  };
  const s = W / across;
  const cells: { x: number; y: number; fill: string }[] = [];
  for (let row = 0; row * s < H; row++) {
    for (let col = 0; col < across; col++) {
      const w = weights({ x: (col + 0.5) * s, y: (row + 0.5) * s });
      if (w.some(k => k < 0)) continue;
      const c = [0, 1, 2].map(ch => Math.round(w[0] * CORNERS[0][ch] + w[1] * CORNERS[1][ch] + w[2] * CORNERS[2][ch]));
      cells.push({ x: col * s, y: row * s, fill: `rgb(${c.join(",")})` });
    }
  }
  return { s, cells };
}

export default function Raster({ ui, num, onNext, figNo }: HeroProps) {
  const [across, setAcross] = useState(16);
  const [turn, setTurn] = useState(0.35);
  const figRef = useRef<HTMLElement>(null);
  useHeroClock(figRef, dt => setTurn(a => (a + dt * 0.18) % (2 * Math.PI)));

  const v = corners(turn);
  const { s, cells } = rasterize(v, across);

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext} figNo={figNo}
      caption={ui.homeFigRasterCaption ?? "a triangle becomes pixels"}
      aria={ui.homeFigRasterAria ?? "A turning triangle drawn as pixels; each pixel mixes the three corner colours"}
      slider={{ label: ui.homeFigRasterSlider ?? "pixels across", value: String(across), min: 6, max: 44, step: 1, at: across, set: setAcross }}
      formula={<><i>c</i> = α<i>c</i>₀ + β<i>c</i>₁ + γ<i>c</i>₂ · <b>{num(cells.length, 0)} px</b></>}>
      {cells.map((c, i) => (
        <rect key={i} x={c.x + 0.5} y={c.y + 0.5} width={s - 1} height={s - 1} fill={c.fill} opacity="0.88" />
      ))}
      <path d={`M${v[0].x} ${v[0].y} L${v[1].x} ${v[1].y} L${v[2].x} ${v[2].y} Z`} fill="none" stroke="currentColor" strokeWidth="1.6" />
      {v.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill={`rgb(${CORNERS[i].join(",")})`} stroke="currentColor" strokeWidth="1.5" />
          <text x={p.x + 10} y={p.y - 8} fontFamily={MONO} fontSize="12" fill="currentColor">v{i}</text>
        </g>
      ))}
    </HeroFrame>
  );
}

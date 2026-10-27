"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Btn, C } from "@/components/lesson/kit/figure";
import { makeProjector, useOrbit, towardEye, boxFaces, add, sub, scale, dot, type V3 } from "@/components/lesson/kit/scene3d";

// ── What this figure shows ────────────────────────────────────────────────────
// A solid built from unit cubes on a 3 × 3 floor, and its three orthogonal
// views: from above (top), from the front and from the right side. A view is
// the shadow of the solid on a wall when the light comes straight at it: each
// cube is pushed along the viewing direction until it hits the wall, so depth
// disappears and only the tallest stack in each line of sight survives.
// The top view doubles as the editor: tap a square to add a cube (after 3 it
// empties again); its numbers are the heights, the usual way plans mark them.

const N = 3, MAXH = 3;
const W3 = 320, H3 = 270;                       // the 3D view
const WV = 250, HV = 270;                       // the three flat views
const TOP = "#7dd3fc", FRONT = "#38bdf8", SIDE = "#0284c7", INK = "#0c4a6e";

type Heights = number[][];                       // h[row z][column x]; row 0 is the back
const PRESETS: Record<string, Heights> = {
  steps: [[3, 2, 1], [2, 1, 0], [1, 0, 0]],
  ell: [[2, 0, 0], [1, 0, 0], [1, 1, 3]],
  tower: [[0, 0, 0], [0, 3, 0], [1, 1, 1]],
};

export function SolidViewsFigure({ t }: { t?: TrackTranslations }) {
  const [h, setH] = useState<Heights>(PRESETS.steps);
  const orb = useOrbit({ yaw: -0.6, pitch: 0.5, zoom: 1 });
  const bump = (z: number, x: number) => setH(h.map((row, r) => row.map((v, c) => (r === z && c === x ? (v + 1) % (MAXH + 1) : v))));
  const has = (x: number, y: number, z: number) => x >= 0 && x < N && z >= 0 && z < N && y >= 0 && y < h[z][x];

  // ── 3D: cubes far to near, faces hidden by a neighbour skipped ──
  const proj = makeProjector(orb.orbit, W3 / 2, H3 / 2 + 10, 44, 14);
  const eye = scale(towardEye(orb.orbit), 14);
  const cubes = h.flatMap((row, z) => row.flatMap((v, x) => Array.from({ length: v }, (_, y) =>
    ({ x, y, z, c: [x - 1, y + 0.5 - 1.5, z - 1] as V3 }))));
  cubes.sort((a, b) => proj(b.c).depth - proj(a.c).depth);
  const faceFill = (nrm: V3) => (nrm[1] > 0.5 ? TOP : Math.abs(nrm[2]) > 0.5 ? FRONT : SIDE);
  const floor = ([[-1.5, -1.5, -1.5], [1.5, -1.5, -1.5], [1.5, -1.5, 1.5], [-1.5, -1.5, 1.5]] as V3[]).map(proj);
  const frontLabel = proj([0, -1.5, 2.1]);

  // ── The three views: the tallest stack along each line of sight ──
  const front = Array.from({ length: N }, (_, x) => Math.max(...h.map(row => row[x])));          // per column x
  const side = Array.from({ length: N }, (_, z) => Math.max(...h[z]));                            // per row z
  const cell = 22;
  const panel = (x0: number, y0: number, label: string, cols: number[]) => (
    <g>
      <text x={x0} y={y0 - 8} fontSize={10} fill={C.muted} fontFamily="monospace">{label}</text>
      {Array.from({ length: MAXH }, (_, r) => cols.map((_, c) =>
        <rect key={`${r}-${c}`} x={x0 + c * cell} y={y0 + r * cell} width={cell} height={cell} fill="none" stroke={C.grid} />))}
      {cols.map((v, c) => Array.from({ length: v }, (_, k) =>
        <rect key={`f${c}-${k}`} x={x0 + c * cell} y={y0 + (MAXH - 1 - k) * cell} width={cell} height={cell} fill={FRONT} fillOpacity={0.75} stroke={INK} />))}
      <line x1={x0 - 4} x2={x0 + N * cell + 4} y1={y0 + MAXH * cell} y2={y0 + MAXH * cell} stroke={C.axis} strokeWidth={1.4} />
    </g>
  );
  const tc = 30, tx0 = 80, ty0 = 26;

  return (
    <Figure
      title={tx(t, "figViews_title", "A solid and its three views")}
      head={<Btn onClick={orb.reset}>{tx(t, "figViews_reset", "reset view")}</Btn>}
      controls={<Row>
        <Btn onClick={() => setH(PRESETS.steps)}>{tx(t, "figViews_steps", "staircase")}</Btn>
        <Btn onClick={() => setH(PRESETS.ell)}>{tx(t, "figViews_ell", "L and tower")}</Btn>
        <Btn onClick={() => setH(PRESETS.tower)}>{tx(t, "figViews_tower", "tower on a wall")}</Btn>
        <Btn onClick={() => setH(h.map(row => row.map(() => 0)))}>{tx(t, "figViews_clear", "clear")}</Btn>
      </Row>}
      note={<>
        {tx(t, "figViews_note", "A view keeps only what reaches the wall: in the front view each column shows its tallest stack, wherever it stands in depth, and in the side view each row does the same. Different solids can share a view, which is why plans give two or three of them. The top view also builds the solid: tap a square to stack one more cube; the numbers are the heights.")}{" "}
        <span data-mouse-only>{tx(t, "figViews_drag", "Drag the solid to turn it.")}</span>
        <span data-touch-only>{tx(t, "figViews_dragTouch", "Swipe the solid to turn it.")}</span>
      </>}
    >
      <div className="grid sm:grid-cols-[1.25fr_1fr]">
        <svg ref={orb.ref} {...orb.handlers} viewBox={`0 0 ${W3} ${H3}`} className="w-full h-auto cursor-grab" style={{ touchAction: "none" }}>
          <path d={"M" + floor.map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join("L") + "Z"} fill={C.grid} fillOpacity={0.5} stroke={C.axis} />
          <text x={frontLabel.x} y={frontLabel.y + 4} fontSize={10} textAnchor="middle" fill={C.muted} fontFamily="monospace">{tx(t, "figViews_frontMark", "front")}</text>
          {cubes.map(({ x, y, z, c }) => boxFaces(c, [0.5, 0.5, 0.5]).map((f, i) => {
            const nb = f.normal;
            if (has(x + nb[0], y + nb[1], z + nb[2])) return null;                  // glued to a neighbour
            const mid = add(c, scale(nb, 0.5));
            if (dot(nb, sub(eye, mid)) <= 0) return null;                            // facing away
            const q = f.pts.map(proj);
            return <path key={`${x}${y}${z}${i}`} d={"M" + q.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("L") + "Z"}
              fill={faceFill(nb)} stroke={INK} strokeWidth={1} strokeLinejoin="round" />;
          }))}
        </svg>
        <svg viewBox={`0 0 ${WV} ${HV}`} className="w-full h-auto">
          <text x={tx0} y={ty0 - 8} fontSize={10} fill={C.muted} fontFamily="monospace">{tx(t, "figViews_top", "top (tap to build)")}</text>
          {h.map((row, z) => row.map((v, x) =>
            <g key={`t${z}${x}`} onClick={() => bump(z, x)} style={{ cursor: "pointer" }}>
              <rect x={tx0 + x * tc} y={ty0 + z * tc} width={tc} height={tc} fill={v ? TOP : "transparent"} fillOpacity={v ? 0.85 : 1} stroke={v ? INK : C.grid} />
              {v > 0 && <text x={tx0 + x * tc + tc / 2} y={ty0 + z * tc + tc / 2 + 4} fontSize={12} fontWeight={700} textAnchor="middle" fill={INK} fontFamily="monospace" pointerEvents="none">{v}</text>}
            </g>))}
          <text x={tx0 + (N * tc) / 2} y={ty0 + N * tc + 13} fontSize={9} textAnchor="middle" fill={C.muted} fontFamily="monospace">{tx(t, "figViews_frontMark", "front")}</text>
          {panel(22, 170, tx(t, "figViews_front", "front"), front)}
          {/* Seen from the right, the front row is on the left of the picture */}
          {panel(150, 170, tx(t, "figViews_side", "right side"), [...side].reverse())}
        </svg>
      </div>
    </Figure>
  );
}

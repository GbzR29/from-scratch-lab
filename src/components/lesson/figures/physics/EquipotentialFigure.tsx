"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, C, T, Vec, Handle, useDrag, nearest, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The potential V = Σ kq/r of two charges (1 px = 1 cm), drawn as contour
// lines of equal V (equipotentials, red above zero, blue below) with faint
// field arrows, which always cross the contours at right angles. Drag the
// amber test charge (1 nC) to read V and its energy U = qV there.
// Two paths lead from A to B. The work you do carrying the test charge slowly
// along each, W = −∫ qE·dl, is added up numerically: the totals agree, and
// both equal q(V_B − V_A). The electric force is conservative.
// "break it: add a swirling field" adds a field that circles the centre. Now
// the two paths cost different amounts of work, so going out by one and back
// by the other would make energy from nothing, and no potential V can be
// drawn: the contours disappear.

const W = 560, H = 320;
const K = 8.99e9, M = 0.01, NC = 1e-9;
const A = { x: 70, y: 60 }, B = { x: 490, y: 270 };
const PATH1 = [A, B];
const PATH2 = [A, { x: 70, y: 305 }, { x: 490, y: 305 }, B];
const SWIRL = 400;                                   // N/C, size of the broken field

type Q = { x: number; y: number; q: number };
const PRESETS: Record<"dipole" | "like", Q[]> = {
  dipole: [{ x: 210, y: 160, q: 2 }, { x: 350, y: 160, q: -2 }],
  like: [{ x: 210, y: 160, q: 2 }, { x: 350, y: 160, q: 2 }],
};

function potential(qs: Q[], x: number, y: number) {
  let v = 0;
  for (const c of qs) v += (K * c.q * NC) / Math.max(Math.hypot(x - c.x, y - c.y) * M, 0.004);
  return v;
}

function field(qs: Q[], x: number, y: number, swirl: boolean) {
  let ex = 0, ey = 0;
  for (const c of qs) {
    const dx = (x - c.x) * M, dy = (y - c.y) * M, r2 = Math.max(dx * dx + dy * dy, 1e-5), r = Math.sqrt(r2);
    const e = (K * c.q * NC) / r2;
    ex += (e * dx) / r; ey += (e * dy) / r;
  }
  if (swirl) {
    // centred inside the loop the two paths make, so a round trip circles it
    const dx = x - W / 2, dy = y - 235, r = Math.hypot(dx, dy) || 1;
    ex += (-SWIRL * dy) / r; ey += (SWIRL * dx) / r;
  }
  return { ex, ey };
}

/** Work you do (J) carrying q = 1 nC slowly along a polyline: −Σ qE·Δl. */
function work(qs: Q[], path: { x: number; y: number }[], swirl: boolean) {
  let w = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i], b = path[i + 1], n = 400;
    for (let k = 0; k < n; k++) {
      const x = a.x + ((b.x - a.x) * (k + 0.5)) / n, y = a.y + ((b.y - a.y) * (k + 0.5)) / n;
      const { ex, ey } = field(qs, x, y, swirl);
      w -= NC * (ex * ((b.x - a.x) / n) * M + ey * ((b.y - a.y) / n) * M);
    }
  }
  return w;
}

/** Contour segments of V = level, by marching squares on a coarse grid. */
function contour(qs: Q[], level: number, step = 8) {
  const nx = Math.ceil(W / step), ny = Math.ceil(H / step);
  const v: number[][] = [];
  for (let j = 0; j <= ny; j++) { v.push([]); for (let i = 0; i <= nx; i++) v[j].push(potential(qs, i * step, j * step) - level); }
  let d = "";
  const cross = (x0: number, y0: number, a: number, x1: number, y1: number, b: number) => {
    const s = a / (a - b);
    return [x0 + (x1 - x0) * s, y0 + (y1 - y0) * s];
  };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = i * step, y = j * step;
    const a = v[j][i], b = v[j][i + 1], c = v[j + 1][i + 1], e = v[j + 1][i];
    const pts: number[][] = [];
    if (a * b < 0) pts.push(cross(x, y, a, x + step, y, b));
    if (b * c < 0) pts.push(cross(x + step, y, b, x + step, y + step, c));
    if (c * e < 0) pts.push(cross(x + step, y + step, c, x, y + step, e));
    if (e * a < 0) pts.push(cross(x, y + step, e, x, y, a));
    for (let k = 0; k + 1 < pts.length; k += 2) d += `M${pts[k][0].toFixed(1)},${pts[k][1].toFixed(1)}L${pts[k + 1][0].toFixed(1)},${pts[k + 1][1].toFixed(1)}`;
  }
  return d;
}

const LEVELS = [20, 40, 80, 160, 320];

/** Unit field arrows on a grid, faded by strength. */
function fieldArrows(qs: Q[], swirl: boolean) {
  const out: { x: number; y: number; ux: number; uy: number; s: number }[] = [];
  for (let y = 24; y < H; y += 36) {
    for (let x = 24; x < W; x += 36) {
      if (qs.some(c => Math.hypot(c.x - x, c.y - y) < 18)) continue;
      const { ex, ey } = field(qs, x, y, swirl), m = Math.hypot(ex, ey) || 1;
      out.push({ x, y, ux: ex / m, uy: ey / m, s: clamp(Math.log10(1 + m / 50) / 3, 0.1, 0.6) });
    }
  }
  return out;
}

export function EquipotentialFigure({ t }: { t?: TrackTranslations }) {
  const [preset, setPreset] = useState<"dipole" | "like">("dipole");
  const [test, setTest] = useState({ x: 280, y: 70 });
  const [broken, setBroken] = useState(false);
  const qs = PRESETS[preset];

  const drag = useDrag<number>(p => nearest<number>(p, [[0, test]], 20), (_, p) => setTest({ x: clamp(p.x, 6, W - 6), y: clamp(p.y, 6, H - 6) }));

  const V = potential(qs, test.x, test.y);
  const w1 = work(qs, PATH1, broken), w2 = work(qs, PATH2, broken);
  const dV = potential(qs, B.x, B.y) - potential(qs, A.x, A.y);
  const nJ = (j: number) => `${f2(j * 1e9, 1)} nJ`;

  const arrows = fieldArrows(qs, broken);
  const line = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join("");

  return (
    <Figure title={tx(t, "figPhEqp_title", "Equipotentials and path-free work")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhEqp_broken", "break it: add a swirling field")}</Btn>}
      controls={<>
        <Row>
          <Choice value={preset} onChange={setPreset} options={[
            ["dipole", tx(t, "figPhEqp_dipole", "+ and −")],
            ["like", tx(t, "figPhEqp_like", "two +")],
          ]} />
          <Readout color={C.amber}>{`V = ${f2(V, 0)} V`}</Readout>
          <Readout color={C.amber}>{`U = qV = ${f2(V, 0)} nJ`}</Readout>
        </Row>
        <Row>
          <Readout color={C.green}>{`${tx(t, "figPhEqp_w1", "work by path 1")}: ${nJ(w1)}`}</Readout>
          <Readout color={C.purple}>{`${tx(t, "figPhEqp_w2", "work by path 2")}: ${nJ(w2)}`}</Readout>
          {!broken && <Readout>{`q(V_B − V_A) = ${nJ(dV * 1e-9)}`}</Readout>}
          {broken && <Readout color={C.red}>{`${tx(t, "figPhEqp_loop", "round trip")}: ${nJ(w1 - w2)}`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhEqp_note", "Each contour joins points of the same potential: red ones above zero near the + charge, blue ones below zero near the −. The field arrows always cross them at right angles and point downhill, from high V to low. Drag the test charge along a contour and its energy U = qV does not change, so moving along an equipotential takes no work. Now compare the two routes from A to B: the straight one and the long way round the bottom. The work you do carrying 1 nC along each is added up step by step, and the totals are equal, both q(V_B − V_A). That is what makes a potential possible. Break it with a field that swirls round the centre: the two routes now cost different amounts, a round trip out by one and back by the other gains energy from nothing, and no map of V can be drawn.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {arrows.map((a, i) => <Vec key={i} a={{ x: a.x - 6 * a.ux, y: a.y - 6 * a.uy }} b={{ x: a.x + 6 * a.ux, y: a.y + 6 * a.uy }} color={broken ? C.red : C.fg} w={1} head={3.5} opacity={a.s} />)}
        {!broken && LEVELS.flatMap(L => [
          <path key={`p${L}`} d={contour(qs, L)} stroke={C.red} strokeWidth={1.1} fill="none" opacity={0.7} />,
          <path key={`n${L}`} d={contour(qs, -L)} stroke={C.blue} strokeWidth={1.1} fill="none" opacity={0.7} />,
        ])}
        {!broken && preset === "dipole" && <path d={contour(qs, 0)} stroke={C.muted} strokeWidth={1} strokeDasharray="4 4" fill="none" />}
        <path d={line(PATH1)} stroke={C.green} strokeWidth={2} fill="none" strokeDasharray="7 4" />
        <path d={line(PATH2)} stroke={C.purple} strokeWidth={2} fill="none" strokeDasharray="7 4" />
        <circle cx={A.x} cy={A.y} r={5} fill={C.fg} /><T x={A.x - 16} y={A.y - 8} color={C.fg} bold>A</T>
        <circle cx={B.x} cy={B.y} r={5} fill={C.fg} /><T x={B.x + 9} y={B.y - 8} color={C.fg} bold>B</T>
        {qs.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={11} fill={c.q > 0 ? C.red : C.blue} />
            <T x={c.x} y={c.y + 4} anchor="middle" color="#fff" size={13} bold>{c.q > 0 ? "+" : "−"}</T>
          </g>
        ))}
        <Handle x={test.x} y={test.y} color={C.amber} r={5} active={drag.dragging === 0} />
        {!broken && <T x={8} y={H - 8} size={8}>{tx(t, "figPhEqp_levels", "contours every doubling: ±20, 40, 80, 160, 320 V")}</T>}
        {broken && <T x={8} y={H - 8} size={8} color={C.red}>{tx(t, "figPhEqp_noV", "no potential exists for this field")}</T>}
      </svg>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, Handle, useDrag, nearest, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Fermat's principle as a lifeguard's problem. The lifeguard at A runs on
// sand at v₁ = 7 m/s and swims at v₂ = v₁/ratio to reach a swimmer at B. The
// route crosses the shoreline at P (draggable). The total time
// T = |AP|/v₁ + |PB|/v₂ is plotted underneath, against where P is, on the same
// horizontal scale. The fastest P is where sin θ₁ / v₁ = sin θ₂ / v₂: Snell's
// law with n ∝ 1/v. The straight line from A to B is the shortest route, not
// the fastest. A and B can be dragged too. 1 px = 0.2 m.

const W = 560, H = 360;
const SHORE = 140, PLOT0 = 262, PLOT1 = 348;
const M = 0.2, V1 = 7;

/** The x in [lo, hi] where f is smallest (f has one minimum there). */
function goldenMin(f: (x: number) => number, lo: number, hi: number) {
  for (let i = 0; i < 60; i++) {
    const m1 = hi - 0.618 * (hi - lo), m2 = lo + 0.618 * (hi - lo);
    if (f(m1) < f(m2)) hi = m2; else lo = m1;
  }
  return (lo + hi) / 2;
}

export function FermatFigure({ t }: { t?: TrackTranslations }) {
  const [A, setA] = useState({ x: 80, y: 50 });
  const [B, setB] = useState({ x: 470, y: 225 });
  const [px, setPx] = useState(240);
  const [ratio, setRatio] = useState(3);

  const v2 = V1 / ratio;
  const time = (x: number) => (Math.hypot(x - A.x, SHORE - A.y) * M) / V1 + (Math.hypot(B.x - x, B.y - SHORE) * M) / v2;

  // the fastest crossing, by golden-section search between A and B
  const lo0 = Math.min(A.x, B.x), hi0 = Math.max(A.x, B.x);
  const best = goldenMin(time, lo0, hi0);
  const straight = A.x + ((B.x - A.x) * (SHORE - A.y)) / (B.y - A.y);

  const drag = useDrag<"A" | "B" | "P">(
    p => nearest<"A" | "B" | "P">(p, [["A", A], ["B", B], ["P", { x: px, y: SHORE }]], 20),
    (id, p) => {
      if (id === "P") setPx(clamp(p.x, 10, W - 10));
      if (id === "A") setA({ x: clamp(p.x, 20, W - 20), y: clamp(p.y, 20, SHORE - 25) });
      if (id === "B") setB({ x: clamp(p.x, 20, W - 20), y: clamp(p.y, SHORE + 25, PLOT0 - 22) });
    },
  );

  const s1 = (px - A.x) / Math.hypot(px - A.x, SHORE - A.y);
  const s2 = (B.x - px) / Math.hypot(B.x - px, B.y - SHORE);
  const Tp = time(px), Tbest = time(best);

  // time curve
  const xs = Array.from({ length: Math.floor((W - 20) / 4) + 1 }, (_, i) => 10 + 4 * i);
  const ts = xs.map(time), tMin = Math.min(...ts), tMax = Math.max(...ts);
  const Y = (v: number) => PLOT1 - ((PLOT1 - PLOT0 - 6) * (v - tMin)) / Math.max(tMax - tMin, 1e-6);
  const curve = xs.map((x, i) => `${i ? "L" : "M"}${x},${Y(time(x)).toFixed(1)}`).join("");

  return (
    <Figure title={tx(t, "figPhFermat_title", "Fermat's principle: the lifeguard's fastest route")}
      head={<>
        <Btn onClick={() => setPx(clamp(straight, 10, W - 10))}>{tx(t, "figPhFermat_straight", "straight line")}</Btn>
        <Btn onClick={() => setPx(best)}>{tx(t, "figPhFermat_fastest", "fastest route")}</Btn>
      </>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhFermat_ratio", "runs this many times faster than swims")} value={ratio} min={1} max={5} step={0.1} onChange={setRatio} fmt={v => `${f2(v, 1)}×`} width="w-40" />
        </Sliders>
        <Row>
          <Readout color={C.amber}>{`${tx(t, "figPhFermat_time", "time")} = ${f2(Tp, 2)} s`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhFermat_best", "fastest possible")} = ${f2(Tbest, 2)} s`}</Readout>
          <Readout>{`sin θ₁ / v₁ = ${f2(s1 / V1, 4)}`}</Readout>
          <Readout>{`sin θ₂ / v₂ = ${f2(s2 / v2, 4)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhFermat_note", "A lifeguard on the sand sees a swimmer in trouble. Running is faster than swimming, so the straight line, the shortest route, is not the quickest: it wastes too much time in the water. Drag the point where the route meets the shoreline and watch the time underneath. It has a single lowest point, and at that point the two readouts agree: the sine of each angle, measured from the perpendicular to the shore, divided by the speed on that side, is the same. That is Snell's law, with the refractive index playing the part of 1/speed. Light behaves as if it chooses the quickest path, Fermat's principle, which is why it bends at a boundary. Set the two speeds equal and the fastest route becomes the straight line: no change of speed, no bending. Make swimming much slower and the best route runs further along the sand before entering the water, like light bending more strongly into diamond.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x={0} y={0} width={W} height={SHORE} fill={C.amber} opacity={0.1} />
        <rect x={0} y={SHORE} width={W} height={PLOT0 - 12 - SHORE} fill={C.sky} opacity={0.14} />
        <line x1={0} y1={SHORE} x2={W} y2={SHORE} stroke={C.fg} strokeWidth={1.2} />
        <T x={W - 10} y={18} anchor="end" size={9} color={C.fg}>{`${tx(t, "figPhFermat_sand", "sand")} · v₁ = 7 m/s`}</T>
        <T x={W - 10} y={PLOT0 - 18} anchor="end" size={9} color={C.fg}>{`${tx(t, "figPhFermat_water", "water")} · v₂ = ${f2(v2, 2)} m/s`}</T>
        {/* straight route, faint */}
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={C.muted} strokeDasharray="4 4" />
        {/* best route, faint green */}
        <path d={`M${A.x},${A.y} L${best},${SHORE} L${B.x},${B.y}`} fill="none" stroke={C.green} strokeOpacity={0.45} strokeWidth={1.5} />
        {/* chosen route */}
        <path d={`M${A.x},${A.y} L${px},${SHORE} L${B.x},${B.y}`} fill="none" stroke={C.amber} strokeWidth={2.5} />
        <line x1={px} y1={SHORE - 60} x2={px} y2={SHORE + 60} stroke={C.muted} strokeDasharray="2 3" />
        <T x={px + 5} y={SHORE - 44} size={8.5}>θ₁</T>
        <T x={px + 5} y={SHORE + 54} size={8.5}>θ₂</T>
        <Handle x={A.x} y={A.y} color={C.fg} r={5} active={drag.dragging === "A"} />
        <Handle x={B.x} y={B.y} color={C.red} r={5} active={drag.dragging === "B"} />
        <Handle x={px} y={SHORE} color={C.amber} r={5} active={drag.dragging === "P"} />
        <T x={A.x - 10} y={A.y - 10} anchor="end" size={9} color={C.fg}>A</T>
        <T x={B.x + 10} y={B.y + 4} size={9} color={C.fg}>B</T>
        {/* time against P */}
        <line x1={10} y1={PLOT1} x2={W - 10} y2={PLOT1} stroke={C.axis} />
        <path d={curve} fill="none" stroke={C.sky} strokeWidth={2} />
        <line x1={best} y1={PLOT0} x2={best} y2={PLOT1} stroke={C.green} strokeDasharray="3 3" />
        <line x1={px} y1={SHORE} x2={px} y2={PLOT1} stroke={C.amber} strokeOpacity={0.25} />
        <circle cx={px} cy={Y(Tp)} r={4.5} fill={C.amber} />
        <T x={12} y={PLOT0 + 2} size={8.5} color={C.fg}>{tx(t, "figPhFermat_plot", "total time, for each crossing point")}</T>
      </svg>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, Handle, useDrag, f2, clamp, type Pt } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Two spacetime diagrams of the same three events: O at the origin and the
// draggable events A and B. Units: x in light-seconds, ct in light-seconds of
// time, so light moves along 45° lines (amber). Left: our frame S. Right: the
// frame S′ of a ship moving at v = βc (slider), found with the Lorentz
// transformation x′ = γ(x − βct), ct′ = γ(ct − βx). In each diagram the
// other frame's axes are drawn in sky blue: in S the ship's time axis is its
// worldline x = βct and its x′ axis is its line of "now", ct = βx.
// Readouts: the interval s² = (cΔt)² − Δx² between A and B, the same in both
// frames, and whether B comes after A in each. For spacelike pairs (s² < 0)
// the order can flip; for timelike ones (s² > 0) it never does.
// "break it: Galilean transformation" uses x′ = x − βct, t′ = t: the light
// lines in S′ (red) then lean away from 45°, so light would have a different
// speed for the ship, and s² stops agreeing.

const W = 560, H = 300;
const SC = 30, R = 4.2;                           // px per light-second, half-range
const CL = { x: 145, y: 150 }, CR = { x: 415, y: 150 };

type Ev = { x: number; t: number };

export function MinkowskiFigure({ t }: { t?: TrackTranslations }) {
  const [beta, setBeta] = useState(0.5);
  const [galilean, setGalilean] = useState(false);
  const [ev, setEv] = useState<Ev[]>([{ x: 1, t: 2.5 }, { x: 2.8, t: 1.2 }]);
  const gamma = 1 / Math.sqrt(1 - beta * beta);

  const tf = (e: Ev): Ev => galilean ? { x: e.x - beta * e.t, t: e.t } : { x: gamma * (e.x - beta * e.t), t: gamma * (e.t - beta * e.x) };
  const P = (c: Pt, e: Ev) => ({ x: c.x + e.x * SC, y: c.y - e.t * SC });

  const drag = useDrag<number>(
    p => {
      let best: number | null = null, bd = 16;
      ev.forEach((e, i) => { const q = P(CL, e), d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = i; } });
      return best;
    },
    (i, p) => setEv(es => es.map((e, j) => (j === i ? { x: clamp((p.x - CL.x) / SC, -R + 0.2, R - 0.2), t: clamp((CL.y - p.y) / SC, -R + 0.2, R - 0.2) } : e))),
  );

  // a line through the origin in diagram c, along direction (dx, dt), clipped to the box
  const axis = (c: Pt, dx: number, dt: number, color: string, w: number, dash?: string) => {
    const k = R / Math.max(Math.abs(dx), Math.abs(dt));
    return <line x1={c.x - dx * k * SC} y1={c.y + dt * k * SC} x2={c.x + dx * k * SC} y2={c.y - dt * k * SC} stroke={color} strokeWidth={w} strokeDasharray={dash} />;
  };
  const frameBox = (c: Pt) => (
    <g>
      <rect x={c.x - R * SC} y={c.y - R * SC} width={2 * R * SC} height={2 * R * SC} fill="none" stroke={C.axis} />
      {[-3, -2, -1, 1, 2, 3].map(k => <g key={k}>
        <line x1={c.x + k * SC} y1={c.y - R * SC} x2={c.x + k * SC} y2={c.y + R * SC} stroke={C.grid} strokeWidth={0.6} />
        <line x1={c.x - R * SC} y1={c.y - k * SC} x2={c.x + R * SC} y2={c.y - k * SC} stroke={C.grid} strokeWidth={0.6} />
      </g>)}
      {axis(c, 1, 0, C.fg, 1.3)}
      {axis(c, 0, 1, C.fg, 1.3)}
      {axis(c, 1, 1, C.amber, 1.4, "5 4")}
      {axis(c, -1, 1, C.amber, 1.4, "5 4")}
    </g>
  );

  // S′ axes seen in S, and S axes seen in S′
  const sPrimeInS = galilean ? [[beta, 1], [1, 0]] : [[beta, 1], [1, beta]];
  const sInSPrime = galilean ? [[-beta, 1], [1, 0]] : [[-beta, 1], [1, -beta]];
  // where real light rays from O land in S′ (they stay on 45° only under Lorentz)
  const lightR = tf({ x: 1, t: 1 }), lightL = tf({ x: -1, t: 1 });

  const A = ev[0], B = ev[1], A2 = tf(A), B2 = tf(B);
  const s2 = (B.t - A.t) ** 2 - (B.x - A.x) ** 2, s2p = (B2.t - A2.t) ** 2 - (B2.x - A2.x) ** 2;
  const kind = Math.abs(s2) < 0.05 ? tx(t, "figPhMink_light", "lightlike") : s2 > 0 ? tx(t, "figPhMink_time", "timelike: one can affect the other") : tx(t, "figPhMink_space", "spacelike: nothing can link them");
  const order = (d: number) => (Math.abs(d) < 0.02 ? tx(t, "figPhMink_same", "same time") : d > 0 ? tx(t, "figPhMink_after", "B after A") : tx(t, "figPhMink_before", "B before A"));
  const events = (c: Pt, es: Ev[]) => [{ x: 0, t: 0 }, ...es].map((e, i) => {
    const q = P(c, e), col = [C.fg, C.pink, C.green][i];
    return <g key={i}>
      {i > 0 && c === CL ? <Handle x={q.x} y={q.y} color={col} active={drag.dragging === i - 1} /> : <circle cx={q.x} cy={q.y} r={i ? 5 : 3.5} fill={col} />}
      <T x={q.x + 8} y={q.y - 6} color={col} size={9} bold>{["O", "A", "B"][i]}</T>
    </g>;
  });

  return (
    <Figure title={tx(t, "figPhMink_title", "Spacetime diagrams of two frames")}
      head={<Btn active={galilean} onClick={() => setGalilean(g => !g)}>{tx(t, "figPhMink_broken", "break it: Galilean transformation")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhMink_beta", "ship speed β")} value={beta} min={-0.9} max={0.9} step={0.01} onChange={setBeta} fmt={v => f2(v, 2)} width="w-28" />
        <Row>
          <Readout color={C.amber}>{`s² ${tx(t, "figPhMink_inS", "in S")} = ${f2(s2, 2)}`}</Readout>
          <Readout color={Math.abs(s2 - s2p) > 0.01 ? C.red : C.amber}>{`s² ${tx(t, "figPhMink_inSp", "in S′")} = ${f2(s2p, 2)}`}</Readout>
          <Readout>{kind}</Readout>
        </Row>
        <Row>
          <Readout>{`S: ${order(B.t - A.t)}`}</Readout>
          <Readout>{`S′: ${order(B2.t - A2.t)}`}</Readout>
          <Readout color={C.sky}>{`γ = ${f2(gamma, 3)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhMink_note", "Each diagram is a map of space (across) and time (up), in light-seconds, so light runs along the amber 45° lines. The left map is ours; the right map is the same events as recorded by a ship moving at βc. Drag A and B on the left. In the left map, the ship's own time axis (its path) and its line of \"now\" are the tilted sky lines: they close up like scissors towards the light line as β grows. Every event gets new coordinates on the right, yet the interval s² = (cΔt)² − Δx² between A and B is the same in both maps: it is the spacetime version of distance. Put B outside A's light cone (s² < 0) and change β: B can switch from after A to before A. Inside the cone (s² > 0) the order never flips, so cause always comes before effect. Break it with the old Galilean rule: light no longer runs at 45° for the ship (red lines), and the interval stops agreeing.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {frameBox(CL)}
        {frameBox(CR)}
        {axis(CL, sPrimeInS[0][0], sPrimeInS[0][1], C.sky, 1.6)}
        {axis(CL, sPrimeInS[1][0], sPrimeInS[1][1], C.sky, 1.6)}
        {axis(CR, sInSPrime[0][0], sInSPrime[0][1], C.sky, 1.6)}
        {axis(CR, sInSPrime[1][0], sInSPrime[1][1], C.sky, 1.6)}
        {galilean && axis(CR, lightR.x, lightR.t, C.red, 1.8)}
        {galilean && axis(CR, lightL.x, lightL.t, C.red, 1.8)}
        {events(CL, ev)}
        <defs><clipPath id="mink-right"><rect x={CR.x - R * SC} y={CR.y - R * SC} width={2 * R * SC} height={2 * R * SC} /></clipPath></defs>
        <g clipPath="url(#mink-right)">{events(CR, [A2, B2])}</g>
        <T x={CL.x - R * SC} y={14} size={8.5} color={C.fg} bold>{tx(t, "figPhMink_left", "S: our frame")}</T>
        <T x={CR.x - R * SC} y={14} size={8.5} color={C.fg} bold>{tx(t, "figPhMink_right", "S′: the ship's frame")}</T>
        <T x={CL.x + R * SC - 4} y={CL.y + 12} anchor="end" size={8}>x</T>
        <T x={CL.x + 4} y={CL.y - R * SC + 10} size={8}>ct</T>
        <T x={CR.x + R * SC - 4} y={CR.y + 12} anchor="end" size={8}>x′</T>
        <T x={CR.x + 4} y={CR.y - R * SC + 10} size={8}>ct′</T>
        <T x={W / 2} y={H - 4} anchor="middle" size={8}>{tx(t, "figPhMink_key", "amber: light · sky: the other frame's axes · grid: 1 light-second")}</T>
      </svg>
    </Figure>
  );
}

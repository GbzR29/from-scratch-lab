"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The Higgs field's potential energy, V(φ) = μ²|φ|² + λ|φ|⁴, for a field with
// two real components φ = (φ₁, φ₂) (the real Higgs field has four; two are
// enough to show the idea). λ = 0.5; μ² is the slider.
//   μ² > 0: one valley at φ = 0. Small ripples about it cost energy in every
//     direction, ω² = V'' = 2μ²: two particles of equal mass.
//   μ² < 0: the "Mexican hat". φ = 0 is now a hilltop and the lowest energy
//     lies on a ring of radius v = √(−μ²/2λ). The field must roll off the top
//     in some direction, chosen by chance: the symmetry is broken.
//     Ripples up the wall (radial) have ω² = −4μ², a massive particle, the
//     Higgs boson; ripples along the ring cost nothing, a massless one (in
//     the Standard Model it becomes part of the W and Z, which gain mass).
// The ball is the field's value everywhere in space; it rolls by
//   φ̈ = −∇V − γφ̇   (γ = 0.5, a stand-in for the expanding, cooling universe)
// with a faint random jiggle. Left: a slice through the potential along the
// ball's direction. Right: the potential seen from above.

const W = 560, H = 270, LAM = 0.5, GAMMA = 0.5;

export function HiggsPotentialFigure({ t }: { t?: TrackTranslations }) {
  const [mu2, setMu2] = useState(-0.6);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const ball = useRef({ x: 0.002, y: 0.001, vx: 0, vy: 0, tm: 0 });

  useFrame(vis.on, dt => {
    const b = ball.current, h = (Math.min(dt, 0.04) * 3) / 4;               // three time units per second
    for (let i = 0; i < 4; i++) {
      const r2 = b.x * b.x + b.y * b.y, g = 2 * mu2 + 4 * LAM * r2;
      b.vx += h * (-g * b.x - GAMMA * b.vx) + (Math.random() - 0.5) * 2e-4;
      b.vy += h * (-g * b.y - GAMMA * b.vy) + (Math.random() - 0.5) * 2e-4;
      b.x += h * b.vx; b.y += h * b.vy;
      b.tm += h;
    }
    rerender();
  });

  const b = ball.current;
  const V = (r: number) => mu2 * r * r + LAM * r ** 4;
  const vev = mu2 < 0 ? Math.sqrt(-mu2 / (2 * LAM)) : 0;
  const mRadial = mu2 < 0 ? 2 * Math.sqrt(-mu2) : Math.sqrt(2 * mu2);
  const mAlong = mu2 < 0 ? 0 : Math.sqrt(2 * mu2);
  const rBall = Math.hypot(b.x, b.y), aBall = Math.atan2(b.y, b.x);

  const kick = (radial: boolean) => {
    const bb = ball.current, a = rBall > 0.02 ? aBall : Math.random() * 2 * Math.PI;
    if (radial) { bb.vx += Math.cos(a) * 1.2; bb.vy += Math.sin(a) * 1.2; }
    else { bb.vx += -Math.sin(a) * 1.4; bb.vy += Math.cos(a) * 1.4; }
  };
  const toTop = () => { const a = Math.random() * 2 * Math.PI; ball.current = { x: 0.002 * Math.cos(a), y: 0.002 * Math.sin(a), vx: 0, vy: 0, tm: 0 }; };

  // left: slice V(s) for s along the ball's direction
  const SX0 = 30, SX1 = 270, SY0 = 40, SY1 = 230, RMAX = 1.6, VMIN = -0.6, VMAX = 0.8;
  const sx = (s: number) => (SX0 + SX1) / 2 + (s / RMAX) * ((SX1 - SX0) / 2);
  const sy = (v: number) => SY1 - ((Math.min(VMAX, v) - VMIN) / (VMAX - VMIN)) * (SY1 - SY0);
  let slice = "";
  for (let i = 0; i <= 120; i++) { const s = -RMAX + (i / 120) * 2 * RMAX; slice += `${i ? "L" : "M"}${sx(s).toFixed(1)},${sy(V(s)).toFixed(1)}`; }
  // right: top view with contour rings
  const TX = 420, TY = 135, TR = 92;
  const tp = (x: number, y: number) => [TX + (x / RMAX) * TR, TY - (y / RMAX) * TR] as const;
  const levels = [-0.15, 0, 0.2, 0.45, 0.75];
  const rings: number[] = [];
  for (const lv of levels) {
    // radii where V(r) = lv (solve λr⁴ + μ²r² − lv = 0 for r²)
    const disc = mu2 * mu2 + 4 * LAM * lv;
    if (disc < 0) continue;
    for (const sgn of [1, -1]) { const r2 = (-mu2 + sgn * Math.sqrt(disc)) / (2 * LAM); if (r2 > 0 && Math.sqrt(r2) < RMAX) rings.push(Math.sqrt(r2)); }
  }
  const [bx, by] = tp(b.x, b.y);

  return (
    <Figure title={tx(t, "figPhHiggs_title", "The Higgs field's 'Mexican hat': how a symmetry breaks")}
      controls={<>
        <Slider label={tx(t, "figPhHiggs_mu", "μ² (hot early universe → cold today)")} value={mu2} min={-1} max={1} step={0.01} onChange={setMu2} fmt={v => f2(v, 2)} width="w-40" />
        <Row>
          <Btn onClick={toTop}>{tx(t, "figPhHiggs_top", "put the field at φ = 0")}</Btn>
          <Btn onClick={() => kick(true)}>{tx(t, "figPhHiggs_up", "nudge up the wall")}</Btn>
          <Btn onClick={() => kick(false)}>{tx(t, "figPhHiggs_along", "nudge along the valley")}</Btn>
        </Row>
        <Row>
          <Readout color={C.amber}>{`${tx(t, "figPhHiggs_vev", "lowest energy at")} |φ| = ${mu2 < 0 ? `√(−μ²/2λ) = ${f2(vev, 3)}` : "0"}`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhHiggs_mR", "ripple up the wall: mass")} ${f2(mRadial, 2)}`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhHiggs_mA", "ripple along the valley: mass")} ${f2(mAlong, 2)}`}</Readout>
          <Readout>{`${tx(t, "figPhHiggs_dir", "direction chosen")}: ${rBall > 0.1 ? `${f2(((aBall * 180) / Math.PI + 360) % 360, 0)}°` : "–"}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhHiggs_note", "The ball is the value of the Higgs field, the same everywhere in space. Start with μ² positive, as in the hot early universe: the lowest energy is at φ = 0, and the field sits there, perfectly symmetric. Slide μ² below zero. The middle becomes a hilltop, the lowest energy is a whole ring around it, and the field rolls off the top in some direction chosen by chance (press 'put the field at φ = 0' a few times: the direction changes every time). The laws are still perfectly round, but the state the universe ends up in is not: that is spontaneous symmetry breaking, like a pencil balanced on its tip that must fall somewhere. Now nudge it. Up the wall, it oscillates: a ripple that costs energy even at rest, a particle with mass, the Higgs boson. Along the valley, it costs no energy at all: a massless ripple. In the Standard Model those massless ripples are absorbed by the W and Z bosons, which is how they become heavy, and particles that move through the field's nonzero value feel a drag that we call their mass. In nature the ring's radius is v = 246 GeV and the Higgs boson's mass is 125 GeV.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* slice */}
          <line x1={SX0} y1={sy(0)} x2={SX1} y2={sy(0)} stroke={C.axis} strokeDasharray="2 3" />
          <line x1={sx(0)} y1={SY0} x2={sx(0)} y2={SY1} stroke={C.axis} strokeDasharray="2 3" />
          <path d={slice} fill="none" stroke={C.purple} strokeWidth={2} />
          {mu2 < 0 && [vev, -vev].map(s => <circle key={s} cx={sx(s)} cy={sy(V(s))} r={2.5} fill={C.amber} />)}
          <circle cx={sx(rBall)} cy={sy(V(rBall)) - 7} r={7} fill={C.amber} stroke="var(--code-bg)" />
          <T x={SX0} y={24} size={8}>{tx(t, "figPhHiggs_slice", "V along the ball's direction")}</T>
          <T x={SX1} y={SY1 + 16} anchor="end" size={8}>{"|φ|"}</T>
          <T x={sx(0) + 4} y={SY0 + 4} size={8}>{"V"}</T>

          {/* top view */}
          <circle cx={TX} cy={TY} r={TR} fill={C.purple} opacity={0.05} stroke={C.axis} />
          {rings.map((r, i) => <circle key={i} cx={TX} cy={TY} r={(r / RMAX) * TR} fill="none" stroke={C.purple} strokeOpacity={0.35} />)}
          {mu2 < 0 && <circle cx={TX} cy={TY} r={(vev / RMAX) * TR} fill="none" stroke={C.amber} strokeWidth={1.6} strokeDasharray="5 3" />}
          <line x1={TX} y1={TY} x2={bx} y2={by} stroke={C.amber} strokeOpacity={0.5} />
          <circle cx={bx} cy={by} r={6} fill={C.amber} stroke="var(--code-bg)" />
          <T x={TX - TR} y={24} size={8}>{tx(t, "figPhHiggs_topView", "seen from above: φ₁ across, φ₂ up")}</T>
          {mu2 < 0 && <T x={TX} y={TY + TR + 16} anchor="middle" size={8} color={C.amber}>{tx(t, "figPhHiggs_ring", "dashed: the ring of lowest energy")}</T>}
          <T x={TX} y={H - 6} anchor="middle" size={8} color={C.muted}>{`V = μ²|φ|² + λ|φ|⁴, λ = ${LAM}`}</T>
        </svg>
      </div>
    </Figure>
  );
}

"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A bead slides without friction on a vertical hoop of radius R = 0.25 m that
// spins about its vertical diameter at ω (slider). One coordinate, the angle θ
// from the bottom, describes everything. The Lagrangian
//   L = ½ m R² (θ̇² + ω² sin²θ) + m g R cos θ
// gives θ̈ = sin θ (ω² cos θ − g/R). Below ω_c = √(g/R) ≈ 6.3 rad/s the
// bottom is the only stable place; above it, the bead settles at
// cos θ = g/(R ω²), off to the side. Optional light friction (−b θ̇) lets it
// settle. The right panel draws the effective potential
//   U(θ) = −(g/R) cos θ − ½ ω² sin²θ   (per m R²)
// whose valleys are the stable positions; the bead's height on it is shown.
// The hoop is drawn as seen from the side, its width shrinking as it turns.
// "break it: forget the hoop's motion" drops the ω² sin²θ term from T, as if
// the bead's velocity were only R θ̇: then it behaves like a plain pendulum
// and never climbs the side, whatever the spin.

const W = 560, H = 280;
const R = 0.25, G = 9.81, WC = Math.sqrt(G / R);
const CX = 140, CY = 145, RP = 100;                  // hoop centre and radius (px)
const UX0 = 300, UX1 = 545, UY0 = 40, UY1 = 240;     // U(θ) plot box
const STEP = 0.0005;

export function BeadHoopFigure({ t }: { t?: TrackTranslations }) {
  const [w, setW] = useState(4);
  const [friction, setFriction] = useState(true);
  const [broken, setBroken] = useState(false);
  const st = useRef({ th: 0.3, v: 0, phi: 0 });
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();

  const om2 = broken ? 0 : w * w;
  const acc = (th: number, v: number) => Math.sin(th) * (om2 * Math.cos(th) - G / R) - (friction ? 1.2 : 0) * v;
  useFrame(vis.on, dt => {
    const s = st.current;
    const n = Math.round(dt / STEP);
    for (let i = 0; i < n; i++) {
      // semi-implicit Euler with a small step: plenty for one degree of freedom
      s.v += acc(s.th, s.v) * STEP;
      s.th += s.v * STEP;
    }
    s.th = Math.atan2(Math.sin(s.th), Math.cos(s.th));
    s.phi += w * dt;
    rerender();
  });

  const { th, phi } = st.current;
  const U = (a: number) => -(G / R) * Math.cos(a) - 0.5 * om2 * Math.sin(a) ** 2;
  const eqAngle = !broken && w > WC ? Math.acos(G / (R * w * w)) : 0;

  // hoop seen from the side: x scaled by cos φ
  const c = Math.cos(phi);
  const bead = { x: CX + RP * Math.sin(th) * c, y: CY + RP * Math.cos(th) };
  const front = Math.sin(phi) * Math.sin(th) >= 0;

  // effective potential plot over θ ∈ [−π, π]
  const uMin = Math.min(U(0), U(eqAngle)), uMax = U(Math.PI) + 2;
  const ux = (a: number) => UX0 + ((a + Math.PI) / (2 * Math.PI)) * (UX1 - UX0);
  const uy = (u: number) => UY1 - ((u - uMin) / (uMax - uMin)) * (UY1 - UY0);
  let curve = "";
  for (let i = 0; i <= 180; i++) { const a = -Math.PI + (i / 180) * 2 * Math.PI; curve += `${i ? "L" : "M"}${ux(a).toFixed(1)},${uy(U(a)).toFixed(1)}`; }

  return (
    <Figure title={tx(t, "figPhHoop_title", "A bead on a spinning hoop")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhHoop_broken", "break it: forget the hoop's motion")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhHoop_w", "spin ω (rad/s)")} value={w} min={0} max={14} step={0.1} onChange={setW} fmt={v => f2(v, 1)} width="w-28" />
        <Row>
          <Btn onClick={() => { st.current.v += 6 * (st.current.th >= 0 ? 1 : -1); }}>{tx(t, "figPhHoop_nudge", "nudge the bead")}</Btn>
          <Btn active={friction} onClick={() => setFriction(f => !f)}>{tx(t, "figPhHoop_friction", "light friction")}</Btn>
          <Readout>{`ω_c = √(g/R) = ${f2(WC, 2)} rad/s`}</Readout>
          <Readout color={C.pink}>{`θ = ${f2((th * 180) / Math.PI, 0)}°`}</Readout>
          <Readout color={C.green}>{eqAngle > 0
            ? `${tx(t, "figPhHoop_rest", "rests at")} cos θ = g/(Rω²) → θ = ${f2((eqAngle * 180) / Math.PI, 0)}°`
            : `${tx(t, "figPhHoop_rest", "rests at")} θ = 0° (${tx(t, "figPhHoop_bottom", "the bottom")})`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhHoop_note", "The bead has one coordinate, the angle θ up the hoop from the bottom, and the Lagrangian needs only its kinetic energy (along the hoop, and round with the spin) and its height. At low spin the bead sits at the bottom, like a pendulum. Raise ω past ω_c = 6.3 rad/s, about one turn per second, and the bottom stops being a valley: the bead climbs to the side and settles at cos θ = g/(Rω²), higher the faster you spin. The right panel shows the effective potential: one valley in the middle splits into two. No force of the hoop on the bead was ever needed. Break it by forgetting that the hoop carries the bead round: the kinetic energy loses the spin term, and the bead behaves like a pendulum at any speed.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={CX} y1={CY - RP - 18} x2={CX} y2={CY + RP + 18} stroke={C.axis} strokeDasharray="4 4" />
          {!front && <circle cx={bead.x} cy={bead.y} r={8} fill={C.pink} opacity={0.55} />}
          <ellipse cx={CX} cy={CY} rx={Math.max(1, RP * Math.abs(c))} ry={RP} fill="none" stroke={C.fg} strokeWidth={2.2} />
          {front && <circle cx={bead.x} cy={bead.y} r={8} fill={C.pink} />}
          <path d={`M${CX - 14},${CY - RP - 26} A14,5 0 1 0 ${CX + 14},${CY - RP - 26}`} fill="none" stroke={C.amber} strokeWidth={1.5} />
          <T x={CX + 18} y={CY - RP - 22} color={C.amber} size={8.5}>{`ω = ${f2(w, 1)} rad/s`}</T>
          <T x={14} y={H - 8} size={8}>{`R = 0.25 m · g = 9.81 m/s²`}</T>

          <T x={UX0} y={UY0 - 22} size={8.5}>{tx(t, "figPhHoop_uTitle", "effective potential")}</T>
          <T x={UX0} y={UY0 - 9} size={8.5}>{tx(t, "figPhHoop_uFormula", "U(θ) = −(g/R) cos θ − (ω²/2) sin²θ")}</T>
          <line x1={UX0} y1={UY1} x2={UX1} y2={UY1} stroke={C.axis} />
          {[-180, -90, 0, 90, 180].map(d => <T key={d} x={ux((d * Math.PI) / 180)} y={UY1 + 13} anchor="middle" size={7.5}>{`${d}°`}</T>)}
          <T x={UX1} y={UY1 + 26} anchor="end" size={8}>θ</T>
          <path d={curve} fill="none" stroke={broken ? C.red : C.sky} strokeWidth={2} />
          {eqAngle > 0 && [-eqAngle, eqAngle].map(a => <line key={a} x1={ux(a)} y1={uy(U(a))} x2={ux(a)} y2={UY1} stroke={C.green} strokeDasharray="2 3" />)}
          <circle cx={ux(th)} cy={uy(U(th))} r={6} fill={C.pink} />
        </svg>
      </div>
    </Figure>
  );
}

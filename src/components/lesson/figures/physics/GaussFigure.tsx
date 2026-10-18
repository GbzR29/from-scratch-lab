"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A point charge inside a closed surface (a sphere, drawn as its cross-
// section). The field at the surface is E = kq/R², the sphere's area is 4πR²,
// so the flux E·A = 4πk q = q/ε₀ is the same whatever the radius: Gauss's law.
// The field lines tell the same story: they are drawn in proportion to the
// charge (8 per nC), and every one crosses the surface exactly once, big
// sphere or small.
// "add a charge outside" puts a second charge outside the surface: each of its
// lines that enters the sphere also leaves it, so it adds nothing to the net
// count. "break it: field falls as 1/R" makes the field weaken more slowly; the
// flux then grows with the radius, as if new field lines appeared out of empty
// space between the spheres.

const W = 560, H = 320, CX = 230, CY = 160;
const K = 8.99e9, EPS0 = 8.854e-12;
const LINES_PER_NC = 8;                    // field lines drawn per nanocoulomb inside
const NLINES = 16;                         // lines of the outside charge

export function GaussFigure({ t }: { t?: TrackTranslations }) {
  const [R, setR] = useState(0.8);                 // m, drawn at 100 px per m
  const [q, setQ] = useState(2);                   // nC
  const [outside, setOutside] = useState(false);
  const [broken, setBroken] = useState(false);

  const rPx = R * 100;
  const nIn = Math.round(LINES_PER_NC * q);
  const qC = q * 1e-9;
  const E = broken ? (K * qC) / (R * 0.8) : (K * qC) / (R * R);   // 1/R version matches 1/R² at R = 0.8 m
  const A = 4 * Math.PI * R * R;
  const flux = E * A;
  const truth = qC / EPS0;

  // the outside charge sits at a fixed spot right of the sphere's largest size
  const OX = CX + 260, OY = CY - 40;
  const out: { x2: number; y2: number; crosses: number }[] = [];
  if (outside) {
    for (let k = 0; k < NLINES; k++) {
      const a = (2 * Math.PI * (k + 0.5)) / NLINES;
      const dx = Math.cos(a), dy = Math.sin(a);
      // where the ray from the outside charge meets the circle: solve |O + s d − C| = r
      const fx = OX - CX, fy = OY - CY;
      const b = fx * dx + fy * dy, c = fx * fx + fy * fy - rPx * rPx;
      const disc = b * b - c;
      out.push({ x2: OX + dx * 340, y2: OY + dy * 340, crosses: disc > 0 && -b - Math.sqrt(disc) > 0 ? 2 : 0 });
    }
  }
  const entering = out.filter(o => o.crosses === 2).length;

  return (
    <Figure title={tx(t, "figPhGauss_title", "Gauss's law: the flux through any closed surface")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhGauss_broken", "break it: field falls as 1/R")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhGauss_R", "radius of the sphere")} value={R} min={0.3} max={1.5} step={0.01} onChange={setR} fmt={v => `${f2(v, 2)} m`} />
          <Slider label={tx(t, "figPhGauss_q", "charge inside")} value={q} min={0.5} max={4} step={0.5} onChange={setQ} fmt={v => `${f2(v, 1)} nC`} />
        </Sliders>
        <Row>
          <Btn active={outside} onClick={() => setOutside(o => !o)}>{tx(t, "figPhGauss_outside", "add a charge outside")}</Btn>
          <Readout color={C.sky}>{`E = ${f2(E, 1)} N/C`}</Readout>
          <Readout>{`A = 4πR² = ${f2(A, 2)} m²`}</Readout>
          <Readout color={broken ? C.red : C.green}>{`Φ = E·A = ${f2(flux, 1)} N·m²/C`}</Readout>
          <Readout color={C.green}>{`q/ε₀ = ${f2(truth, 1)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhGauss_note", "Grow and shrink the sphere. The field at its surface weakens as 1/R², but the area grows as R², so their product, the flux, never changes: it is always the charge inside divided by ε₀. The lines say it without numbers: they are drawn in proportion to the charge, 8 per nanocoulomb, and each one crosses the surface once, whatever its size. Add a charge outside: every one of its lines that enters the sphere comes out again, so it adds nothing to the net flux. Then break it: if the field fell only as 1/R, the flux would grow with the radius, and a bigger sphere would be crossed by more lines than left the charge. New lines would have to appear out of empty space, where there is no charge. Gauss's law and the 1/r² of Coulomb's law are the same fact.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <clipPath id="gaussClip"><rect x={0} y={0} width={W} height={H} /></clipPath>
        </defs>
        <g clipPath="url(#gaussClip)">
          {Array.from({ length: nIn }, (_, k) => {
            const a = (2 * Math.PI * (k + 0.5)) / nIn;
            return <line key={k} x1={CX + 12 * Math.cos(a)} y1={CY + 12 * Math.sin(a)} x2={CX + 400 * Math.cos(a)} y2={CY + 400 * Math.sin(a)}
              stroke={C.sky} strokeWidth={1.2} opacity={0.75} />;
          })}
          {Array.from({ length: nIn }, (_, k) => {
            const a = (2 * Math.PI * (k + 0.5)) / nIn;
            return <circle key={k} cx={CX + rPx * Math.cos(a)} cy={CY + rPx * Math.sin(a)} r={3} fill={C.green} />;
          })}
          {out.map((o, i) => <line key={i} x1={OX} y1={OY} x2={o.x2} y2={o.y2} stroke={C.purple} strokeWidth={1.1} opacity={o.crosses ? 0.9 : 0.35} />)}
        </g>
        <circle cx={CX} cy={CY} r={rPx} fill={C.green} fillOpacity={0.06} stroke={C.green} strokeWidth={1.8} strokeDasharray="6 4" />
        <circle cx={CX} cy={CY} r={11} fill={C.red} />
        <T x={CX} y={CY + 4} anchor="middle" color="#fff" size={13} bold>+</T>
        {outside && <>
          <circle cx={OX} cy={OY} r={10} fill={C.purple} />
          <T x={OX} y={OY + 4} anchor="middle" color="#fff" size={12} bold>+</T>
          <T x={OX - 40} y={OY - 18} color={C.purple} size={8.5}>{`${entering} ${tx(t, "figPhGauss_inOut", "lines in and out")}`}</T>
        </>}
        <T x={10} y={18} color={C.green} size={9}>{`${nIn} ${tx(t, "figPhGauss_cross", "lines cross the surface")}`}</T>
        {broken && <T x={10} y={34} color={C.red} size={9}>{`${tx(t, "figPhGauss_brokenNote", "flux ≠ q/ε₀: lines from nowhere")}`}</T>}
        <T x={10} y={H - 8} size={8}>{tx(t, "figPhGauss_scale", "drawn at 1 m = 100 px")}</T>
      </svg>
    </Figure>
  );
}

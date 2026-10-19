"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Unpolarised light (E pointing every way across the beam) passes through two
// or three polarising filters. Each filter keeps only the component of E
// along its axis: the amplitude is multiplied by cos Δθ, so the intensity by
// cos² Δθ (Malus's law), and the light leaves polarised along the filter's
// axis. The first filter passes half of unpolarised light. Crossed filters
// (90° apart) block everything, yet a third filter at 45° between them lets
// 1/8 through.
// "break it: a filter only dims" keeps the light's polarisation where the
// first filter left it: a filter can then only remove light, and adding the
// middle one can never brighten the end. Real filters re-polarise.

const W = 560, H = 230;
const CY = 112, RX = 26, RY = 62;
const XS = [150, 290, 430];

/** A filter seen at an angle: an ellipse with its axis drawn at φ from vertical. */
function Filter({ x, phi, on }: { x: number; phi: number; on: boolean }) {
  const s = Math.sin(phi), c = Math.cos(phi);
  return (
    <g opacity={on ? 1 : 0.18}>
      <ellipse cx={x} cy={CY} rx={RX} ry={RY} fill={C.sky} fillOpacity={0.12} stroke={C.fg} strokeWidth={1.6} />
      {[-0.6, -0.3, 0, 0.3, 0.6].map(o => (
        <line key={o} x1={x + RX * (s * 0.9 + o * c)} y1={CY - RY * (c * 0.9 - o * s)} x2={x - RX * (s * 0.9 - o * c)} y2={CY + RY * (c * 0.9 + o * s)}
          stroke={C.fg} strokeOpacity={o === 0 ? 0.9 : 0.35} strokeWidth={o === 0 ? 2 : 1} />
      ))}
    </g>
  );
}

/** The E field across the beam at x: a double arrow at φ, length ∝ amplitude. */
function EArrow({ x, phi, amp }: { x: number; phi: number; amp: number }) {
  if (amp < 0.01) return null;
  const s = Math.sin(phi), c = Math.cos(phi), L = 48 * amp;
  const ax = (s * L * RX) / RY, ay = -c * L;
  return (
    <g>
      <line x1={x - ax} y1={CY - ay} x2={x + ax} y2={CY + ay} stroke={C.red} strokeWidth={2.4} />
      <circle cx={x + ax} cy={CY + ay} r={2.6} fill={C.red} />
      <circle cx={x - ax} cy={CY - ay} r={2.6} fill={C.red} />
    </g>
  );
}

export function PolarizerFigure({ t }: { t?: TrackTranslations }) {
  const [a1, setA1] = useState(0);
  const [a2, setA2] = useState(45);
  const [a3, setA3] = useState(90);
  const [middle, setMiddle] = useState(false);
  const [broken, setBroken] = useState(false);

  const rad = (d: number) => (d * Math.PI) / 180;
  // after filter 1: half the light, polarised along a1
  const I1 = 0.5;
  let pol = a1, I2 = I1;
  if (middle) {
    I2 = I1 * Math.cos(rad(a2 - pol)) ** 2;
    if (!broken) pol = a2;
  }
  const I3 = I2 * Math.cos(rad(a3 - pol)) ** 2;
  const pol3 = broken ? pol : a3;
  const pct = (I: number) => `${f2(I * 100, 1)}%`;

  return (
    <Figure title={tx(t, "figPhPol_title", "Polarising filters")}
      head={<>
        <Btn active={middle} onClick={() => setMiddle(m => !m)}>{tx(t, "figPhPol_middle", "insert the middle filter")}</Btn>
        <Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhPol_broken", "break it: a filter only dims")}</Btn>
      </>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhPol_f1", "filter 1")} value={a1} min={0} max={180} step={1} onChange={setA1} fmt={v => `${f2(v, 0)}°`} />
          <Slider label={tx(t, "figPhPol_f3", "last filter")} value={a3} min={0} max={180} step={1} onChange={setA3} fmt={v => `${f2(v, 0)}°`} />
          {middle && <Slider label={tx(t, "figPhPol_f2", "middle filter")} value={a2} min={0} max={180} step={1} onChange={setA2} fmt={v => `${f2(v, 0)}°`} />}
        </Sliders>
        <Row>
          <Readout>{`${tx(t, "figPhPol_after1", "after filter 1")}: ${pct(I1)}`}</Readout>
          {middle && <Readout>{`${tx(t, "figPhPol_after2", "after the middle")}: ${pct(I2)}`}</Readout>}
          <Readout color={C.amber}>{`${tx(t, "figPhPol_end", "reaching the eye")}: ${pct(I3)}`}</Readout>
          <Readout color={C.green}>{middle && !broken
            ? `½ cos²(${f2(a2 - a1, 0)}°) cos²(${f2(a3 - a2, 0)}°)`
            : `½ cos²(${f2(a3 - (middle ? pol : a1), 0)}°)`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhPol_note", "The lamp's light is unpolarised: its electric field points every way across the beam. The first filter keeps only the part along its axis, half the light, and what comes out is polarised along that axis. The last filter then passes the fraction cos² of the angle between the two axes, Malus's law: all of it when they are parallel, none when they are crossed at 90°. Cross them so the eye sees nothing, then insert a middle filter at 45°. Light comes back: one eighth of the original. A filter does not just remove light: it keeps the part of the field along its own axis, so the light leaving it is turned to that axis, and the middle filter turns it halfway, where the last filter can let some through. Break it by making filters only dim the light without turning it: then adding a filter could never make the end brighter, and the crossed pair stays dark. Real filters do brighten it, which is how we know light is a transverse wave with a direction across the beam.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={40} y1={CY} x2={W - 50} y2={CY} stroke={C.amber} strokeOpacity={0.35} strokeWidth={10} />
        <circle cx={30} cy={CY} r={14} fill={C.amber} />
        <T x={30} y={CY + 34} anchor="middle" size={8.5} color={C.fg}>{tx(t, "figPhPol_lamp", "lamp")}</T>
        {/* unpolarised: E every way */}
        {[0, 30, 60, 90, 120, 150].map(d => <EArrow key={d} x={86} phi={rad(d)} amp={0.55} />)}
        <Filter x={XS[0]} phi={rad(a1)} on />
        <EArrow x={(XS[0] + XS[1]) / 2} phi={rad(a1)} amp={Math.sqrt(I1 * 2) * 0.8} />
        <Filter x={XS[1]} phi={rad(a2)} on={middle} />
        <EArrow x={(XS[1] + XS[2]) / 2} phi={rad(middle && !broken ? a2 : a1)} amp={Math.sqrt(I2 * 2) * 0.8} />
        <Filter x={XS[2]} phi={rad(a3)} on />
        <EArrow x={490} phi={rad(pol3)} amp={Math.sqrt(I3 * 2) * 0.8} />
        <circle cx={W - 30} cy={CY} r={18} fill={C.amber} fillOpacity={0.05 + 0.95 * I3 * 2} stroke={C.fg} strokeWidth={1.4} />
        <T x={W - 30} y={CY + 36} anchor="middle" size={8.5} color={C.fg}>{tx(t, "figPhPol_eye", "eye")}</T>
        {[[XS[0], a1], [XS[1], a2], [XS[2], a3]].map(([x, a], i) => (i !== 1 || middle) && (
          <T key={i} x={x} y={CY - RY - 10} anchor="middle" size={9} color={C.fg}>{`${f2(a, 0)}°`}</T>
        ))}
        <T x={10} y={H - 8} size={8}>{tx(t, "figPhPol_key", "red: the electric field across the beam · lines on a filter: its axis")}</T>
      </svg>
    </Figure>
  );
}

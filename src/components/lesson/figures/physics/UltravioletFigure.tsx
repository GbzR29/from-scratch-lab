"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// The light inside a hot oven, by frequency. Top: the energy per frequency
// band, u(f) = (number of standing-wave modes per band) × (average energy of
// one mode). The number of modes grows as f² (8πf²/c³ per unit volume), the
// same for both theories. What differs is the energy each mode gets:
//   classical equipartition: kT for every mode, however high its frequency;
//   Planck: a mode can only hold whole packets hf, so its average is
//   hf / (e^(hf/kT) − 1), which dies away once one packet costs more than kT.
// Bottom: that average per mode, in units of kT, against x = hf/kT.
// "break it: energy comes in any amount" draws the classical curve
// (Rayleigh–Jeans), which climbs without end: the ultraviolet catastrophe.
// Frequencies in units of 10¹⁴ Hz; the top plot is scaled to Planck's peak.

const W = 560, H1 = 200, H2 = 92, PAD = 40, GAP = 34;
const F1 = 16;                                   // ×10¹⁴ Hz on the x axis
const HK = 4.799e-11;                            // h/k in K·s
const X = (f: number) => PAD + (f / F1) * (W - PAD - 14);
const xOf = (f: number, T: number) => (HK * f * 1e14) / T;

/** Planck's average energy per mode in units of kT. */
const perMode = (x: number) => (x < 1e-6 ? 1 : x / Math.expm1(x));

/** SVG path of a curve u(f) over the axis, cut off where it leaves the top of the plot. */
function curvePath(fn: (f: number) => number, Y: (u: number) => number) {
  let d = "";
  for (let k = 0; k <= 300; k++) {
    const f = (F1 * k) / 300, y = Y(fn(f));
    if (y < 4) return `${d}${d ? "L" : "M"}${X(f).toFixed(1)},4`;
    d += `${k ? "L" : "M"}${X(f).toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

/** Share of Planck's energy above the visible band (f > 7.5 × 10¹⁴ Hz). */
function uvShare(planck: (f: number) => number) {
  let all = 0, uv = 0;
  for (let f = 0.05; f < 200; f += 0.05) { const u = planck(f); all += u; if (f > 7.5) uv += u; }
  return uv / all;
}

export function UltravioletFigure({ t }: { t?: TrackTranslations }) {
  const [temp, setTemp] = useState(5000);
  const [broken, setBroken] = useState(false);

  // u(f) ∝ f² · kT · perMode(x); the common factor 8πk/c³ is dropped
  const planck = (f: number) => f * f * temp * perMode(xOf(f, temp));
  const rj = (f: number) => f * f * temp;
  const fPeak = (2.821 * temp) / HK / 1e14;
  const top = planck(fPeak) * 1.18;
  const Y1 = (u: number) => 14 + H1 - 20 - (u / top) * (H1 - 26);
  const path = (fn: (f: number) => number) => curvePath(fn, Y1);
  const fill = `${path(planck)}L${X(F1)},${Y1(0)}L${X(0)},${Y1(0)}Z`;

  // bottom panel: energy per mode against frequency, in units of kT
  const y2o = H1 + GAP, Y2 = (e: number) => y2o + H2 - 14 - e * (H2 - 26);
  const modeQ = curvePath(f => perMode(xOf(f, temp)), Y2);

  // the visible band, 400–750 nm = 7.5–4.0 × 10¹⁴ Hz
  const band = Array.from({ length: 36 }, (_, i) => 4 + (i * 3.5) / 36);
  const lamPeak = 2.898e6 / temp;                // Wien, in nm (wavelength peak, not c/fPeak)
  const share = uvShare(planck);

  return (
    <Figure title={tx(t, "figPhUv_title", "Light in a hot oven: classical physics against Planck")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhUv_broken", "break it: energy comes in any amount")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhUv_T", "temperature T")} value={temp} min={1000} max={9000} step={50} onChange={setTemp} fmt={v => `${f2(v, 0)} K`} width="w-28" />
        <Row>
          <Readout color={C.amber}>{`kT = ${f2(temp / 11605, 3)} eV`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhUv_peak", "peak")}: f = ${f2(fPeak, 1)} × 10^14 Hz`}</Readout>
          <Readout>{`${tx(t, "figPhUv_lam", "peak by wavelength (Wien)")}: ${f2(lamPeak, 0)} nm`}</Readout>
          <Readout color={broken ? C.red : C.green}>{broken
            ? tx(t, "figPhUv_inf", "total energy: infinite")
            : `${tx(t, "figPhUv_uv", "share above violet")}: ${f2(share * 100, 1)}%`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhUv_note", "The oven's walls glow and fill it with light. The light can only be standing waves that fit between the walls, called modes, and there are more modes the higher the frequency: their number grows as f², the dotted curve. Classical physics hands every mode the same average energy, kT. Break it to see the result: the curve climbs for ever into the ultraviolet, and the total energy, the area under it, is infinite. A real oven does nothing of the sort. Planck's fix (the solid curve) is that a mode can only take energy in whole packets of size hf. Low modes have cheap packets and still get about kT each. A mode whose packet costs much more than kT is almost never excited at all, so the high modes are frozen out, as the bottom panel shows. The curve rises, peaks, and falls. Heat the oven: the peak moves to higher frequencies in proportion to T, which is why hot things go from red to white to blue.")}>
      <svg viewBox={`0 0 ${W} ${H1 + GAP + H2}`} className="w-full h-auto">
        {band.map(f => <rect key={f} x={X(f)} y={14} width={X(3.5 / 36) - X(0) + 1.2} height={H1 - 20} fill={wavelengthCss(2998 / f)} opacity={0.14} />)}
        <line x1={PAD} y1={Y1(0)} x2={W - 10} y2={Y1(0)} stroke={C.axis} />
        <line x1={PAD} y1={10} x2={PAD} y2={Y1(0)} stroke={C.axis} />
        {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(f => (
          <g key={f}>
            <line x1={X(f)} y1={Y1(0)} x2={X(f)} y2={Y1(0) + 3} stroke={C.axis} />
            <T x={X(f)} y={Y1(0) + 12} anchor="middle" size={8}>{f}</T>
          </g>
        ))}
        <T x={X(5.75)} y={24} anchor="middle" size={8}>{tx(t, "figPhUv_visible", "visible")}</T>
        <T x={X(11.5)} y={24} anchor="middle" size={8} color={C.purple}>{tx(t, "figPhUv_ultra", "ultraviolet →")}</T>
        <T x={PAD + 4} y={12} size={8}>{tx(t, "figPhUv_u", "energy per frequency band")}</T>
        {/* number of modes, ∝ f², drawn to meet the classical curve's shape at low f */}
        <path d={path(f => rj(f) * 0.22)} fill="none" stroke={C.muted} strokeDasharray="2 3" />
        {(() => {
          const fL = Math.sqrt((0.55 * top) / (0.22 * temp));   // where the dotted curve is a little over half-way up
          return <T x={X(fL) + 6} y={Y1(rj(fL) * 0.22) + 3} size={8}>{tx(t, "figPhUv_modes", "number of modes ∝ f²")}</T>;
        })()}
        <path d={fill} fill={C.green} opacity={0.12} />
        <path d={path(planck)} fill="none" stroke={C.green} strokeWidth={2} />
        <T x={X(fPeak) + 6} y={Y1(planck(fPeak)) - 5} size={8.5} color={C.green}>Planck</T>
        {broken && <>
          <path d={path(rj)} fill="none" stroke={C.red} strokeWidth={2} strokeDasharray="6 3" />
          <T x={X(4.5)} y={64} size={8.5} color={C.red}>{tx(t, "figPhUv_rj", "classical (Rayleigh–Jeans): no end")}</T>
        </>}

        {/* energy per mode */}
        <line x1={PAD} y1={Y2(0)} x2={W - 10} y2={Y2(0)} stroke={C.axis} />
        <line x1={PAD} y1={y2o + 4} x2={PAD} y2={Y2(0)} stroke={C.axis} />
        <T x={PAD - 4} y={Y2(1) + 3} anchor="end" size={8}>kT</T>
        <T x={PAD - 4} y={Y2(0) + 3} anchor="end" size={8}>0</T>
        <line x1={PAD} y1={Y2(1)} x2={W - 10} y2={Y2(1)} stroke={broken ? C.red : C.grid} strokeDasharray={broken ? "6 3" : "2 3"} strokeWidth={broken ? 1.6 : 1} />
        <path d={modeQ} fill="none" stroke={C.amber} strokeWidth={2} />
        <T x={PAD + 4} y={y2o + 2} size={8}>{tx(t, "figPhUv_each", "average energy of one mode")}</T>
        <T x={X(F1) - 2} y={Y2(1) - 4} anchor="end" size={8} color={broken ? C.red : C.muted}>{tx(t, "figPhUv_equi", "classical: kT for every mode")}</T>
        <T x={X(Math.min(F1 - 6, ((3.2 * temp) / HK) / 1e14))} y={Y2(0.18) - 4} size={8} color={C.amber}>{tx(t, "figPhUv_frozen", "packets hf too dear: frozen out")}</T>
        <T x={W - 12} y={Y2(0) + 12} anchor="end" size={8}>{tx(t, "figPhUv_f", "frequency f (10^14 Hz)")}</T>
      </svg>
    </Figure>
  );
}

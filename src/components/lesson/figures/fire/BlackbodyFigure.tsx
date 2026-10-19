"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Readout, Row, C, f2 } from "@/components/lesson/kit/figure";
import { planck, blackbody, blackbodyHex, WIEN } from "./blackbody";
import { spectrum } from "../glass/prismOptics";

// ── What this figure shows ────────────────────────────────────────────────────
// Planck's curve for one temperature, scaled to its own peak, with the visible
// band painted in. Under it, the colour the eye sees and how much of the
// light is visible at all. Hot things go red, orange, yellow, white and blue
// as the peak slides left; never green, because a curve that peaks in the
// green covers the whole visible band and looks white.

const W = 600, H = 230, PAD = 28;
const L0 = 100, L1 = 3000;                       // nm on the x axis
const X = (l: number) => PAD + ((l - L0) / (L1 - L0)) * (W - 2 * PAD);
const PRESETS: [string, string, number][] = [
  ["embers", "dull embers", 950],
  ["candle", "candle soot", 1850],
  ["bulb", "filament bulb", 2700],
  ["sun", "the Sun", 5800],
  ["star", "blue star", 11000],
];

/** Fraction of the total emitted power that falls between 400 and 700 nm. */
function visibleShare(T: number) {
  let vis = 0, all = 0;
  for (let l = 50; l < 50000; l += l < 3000 ? 5 : 50) {
    const b = planck(l, T) * (l < 3000 ? 5 : 50);
    all += b; if (l >= 400 && l <= 700) vis += b;
  }
  return vis / all;
}

export function BlackbodyFigure({ t }: { t?: TrackTranslations }) {
  const [logT, setLogT] = useState(Math.log10(1850));
  const T = 10 ** logT;
  const peak = (WIEN / T) * 1e9;                  // nm
  const bands = useMemo(() => spectrum(30), []);

  const { path, area } = useMemo(() => {
    const top = planck(Math.min(Math.max(peak, L0), L1), T);
    let d = "";
    for (let i = 0; i <= 300; i++) {
      const l = L0 + ((L1 - L0) * i) / 300;
      const y = H - PAD - (planck(l, T) / top) * (H - 2 * PAD - 6);
      d += `${i ? "L" : "M"}${X(l).toFixed(1)} ${y.toFixed(1)} `;
    }
    return { path: d, area: `${d}L${X(L1)} ${H - PAD} L${X(L0)} ${H - PAD} Z` };
  }, [T, peak]);

  const share = visibleShare(T);
  const rel = (T / 1850) ** 4;
  const hex = blackbodyHex(T);
  const { rgb } = blackbody(T);

  return (
    <Figure title={tx(t, "figBB_title", "The colour of hot things")}
      head={<>{PRESETS.map(([id, en, v]) => (
        <Btn key={id} active={Math.abs(T - v) < v * 0.01} onClick={() => setLogT(Math.log10(v))}>{tx(t, `figBB_p_${id}`, en)}</Btn>
      ))}</>}
      controls={<>
        <Slider label={tx(t, "figBB_T", "temperature T")} value={logT} min={Math.log10(700)} max={Math.log10(15000)} step={0.002}
          onChange={setLogT} fmt={() => `${Math.round(T)} K`} width="w-28" />
        <Row>
          <span className="inline-block w-16 h-7 rounded-md border border-[var(--border)]" style={{ background: hex }} />
          <Readout>{`λ_max = ${f2(peak, 0)} nm`}</Readout>
          <Readout>{`${tx(t, "figBB_visible", "visible")} ${share < 1e-5 ? (share * 100).toExponential(1) : f2(share * 100, share < 0.01 ? 3 : 1)}%`}</Readout>
          <Readout>{`${tx(t, "figBB_power", "power vs candle")} × ${rel < 0.1 ? f2(rel, 3) : f2(rel, 1)}`}</Readout>
          <Readout>{`RGB ${f2(rgb[0], 2)} ${f2(rgb[1], 2)} ${f2(rgb[2], 2)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figBB_note", "The curve is scaled to its own peak, so you see its shape, not its size: the real height grows as T⁴. At 950 K the peak is near 3000 nm, deep in the infrared, and only the faint tail that reaches 700 nm is visible: a dull red glow. At 1850 K, a candle's soot, less than half a percent of the light is visible, orange-yellow; the rest is heat you feel on your hand. The Sun's peak sits inside the visible band, and the curve is so broad that every colour is present: white. Only above about 7000 K does blue win.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
        <defs>
          <linearGradient id="bb-vis" x1="0" x2="1" y1="0" y2="0">
            {bands.lambda.map((l, i) => {
              const [r, g, b] = bands.rgb[i], m = Math.max(r, g, b, 1e-6);
              return <stop key={l} offset={`${(i + 0.5) / bands.lambda.length}`} stopColor={`rgb(${Math.round((255 * r) / m)}, ${Math.round((255 * g) / m)}, ${Math.round((255 * b) / m)})`} />;
            })}
          </linearGradient>
          <clipPath id="bb-under"><path d={area} /></clipPath>
        </defs>
        <rect x={X(400)} y={PAD - 6} width={X(700) - X(400)} height={H - 2 * PAD + 6} fill="url(#bb-vis)" opacity={0.18} />
        <rect x={X(400)} y={PAD - 6} width={X(700) - X(400)} height={H - 2 * PAD + 6} fill="url(#bb-vis)" opacity={0.85} clipPath="url(#bb-under)" />
        <path d={area} fill={hex} opacity={0.12} />
        <path d={path} fill="none" stroke={C.fg} strokeWidth={1.8} />
        {peak > L0 && peak < L1 && <>
          <line x1={X(peak)} x2={X(peak)} y1={PAD - 6} y2={H - PAD} stroke={C.amber} strokeDasharray="4 3" />
          <text x={X(peak) + 4} y={PAD + 4} fontSize={10} fill={C.amber} fontFamily="monospace">λ_max</text>
        </>}
        <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke={C.axis} />
        {[500, 1000, 1500, 2000, 2500, 3000].map(l => (
          <text key={l} x={X(l)} y={H - PAD + 13} fontSize={9} fill={C.muted} textAnchor="middle" fontFamily="monospace">{l}</text>
        ))}
        <text x={W - PAD} y={H - 4} fontSize={9} fill={C.muted} textAnchor="end" fontFamily="monospace">{tx(t, "figBB_axis", "wavelength (nm)")}</text>
        <text x={(X(400) + X(700)) / 2} y={PAD - 10} fontSize={9} fill={C.muted} textAnchor="middle" fontFamily="monospace">{tx(t, "figBB_band", "visible")}</text>
      </svg>
    </Figure>
  );
}

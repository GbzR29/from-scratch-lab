"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Why salt shatters and copper bends. A slice of a rock-salt crystal: every
// Na⁺ (small, violet) has Cl⁻ (large, green) above, below and beside it.
// Slide the top half sideways. The plot is the Coulomb energy between the two
// halves, summed over thousands of ion pairs (k q₁q₂/r): at no shift it is
// strongly negative (opposite charges face each other). Half a spacing along,
// it reaches zero, and one full spacing along every ion faces one of its own
// charge, and the energy is just as strongly positive: the halves push apart
// and the crystal splits along that plane. Switch to the metal: positive ions
// in a sea of shared electrons look the same after any shift, so the energy
// stays flat and the layers slide (the metal bends instead of breaking).

const W = 560, H = 270;
const D = 30;                                        // ion spacing in the drawing (px)
const COLS = 9, ROWS = 3;

/** Coulomb energy between the two halves (per top ion, in units of kq²/d), top half shifted by s spacings. */
function halfEnergy(s: number): number {
  let e = 0, n = 0;
  for (let i = -2; i <= 2; i++) for (let j = 1; j <= 3; j++) {
    const qa = (i + j) % 2 === 0 ? 1 : -1;
    n++;
    for (let k = -40; k <= 40; k++) for (let m = 0; m >= -5; m--) {
      const qb = ((k + m) % 2 + 2) % 2 === 0 ? 1 : -1;
      const dx = i + s - k, dy = j - m;
      e += (qa * qb) / Math.hypot(dx, dy);
    }
  }
  return e / n;
}

export function CrystalShiftFigure({ t }: { t?: TrackTranslations }) {
  const [s, setS] = useState(0);
  const [metal, setMetal] = useState(false);

  const curve = useMemo(() => Array.from({ length: 41 }, (_, i) => halfEnergy(i / 40)), []);
  const e0 = Math.abs(curve[0]);
  const eNow = metal ? -1 : halfEnergy(s) / e0;
  const gap = !metal && eNow > 0.05 ? eNow * 26 : 0;

  // ── Crystal slice
  const cx0 = 26, cy0 = 62;
  const ions: { x: number; y: number; q: number; top: boolean }[] = [];
  for (let j = 0; j < ROWS * 2; j++) for (let i = -1; i <= COLS; i++) {
    const top = j < ROWS;
    const x = cx0 + i * D + (top ? s * D : 0), y = cy0 + j * D + (top ? -gap : 0);
    if (x < cx0 - D / 2 || x > cx0 + (COLS - 0.5) * D) continue;
    ions.push({ x, y, q: (i + j) % 2 === 0 ? 1 : -1, top });
  }
  const planeY = cy0 + (ROWS - 0.5) * D;

  // ── Energy plot
  const PL = 360, PR = 530, PT = 60, PB = 210;
  const px = (v: number) => PL + v * (PR - PL);
  const py = (v: number) => (PT + PB) / 2 - v * (PB - PT) / 2.4;
  const path = metal
    ? `M${px(0)},${py(-1)} L${px(1)},${py(-1)}`
    : curve.map((v, i) => `${i ? "L" : "M"}${px(i / 40).toFixed(1)},${py(v / e0).toFixed(1)}`).join(" ");

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <clipPath id="chCsClip"><rect x={cx0 - D / 2 - 4} y={4} width={COLS * D + 8} height={H - 28} /></clipPath>
      </defs>
      <g clipPath="url(#chCsClip)">
        {metal && <rect x={cx0 - D / 2} y={cy0 - D / 2 - gap} width={COLS * D} height={ROWS * 2 * D} fill={C.sky} opacity={0.14} />}
        {ions.map((o, k) => metal
          ? <circle key={k} cx={o.x} cy={o.y} r={9} fill="#d97706" stroke="#0f172a" strokeOpacity={0.3} />
          : <circle key={k} cx={o.x} cy={o.y} r={o.q > 0 ? 7 : 12} fill={o.q > 0 ? "#8b5cf6" : "#22c55e"} stroke="#0f172a" strokeOpacity={0.3} />)}
        {!metal && ions.map((o, k) => (
          <text key={`q${k}`} x={o.x} y={o.y + 3.5} fontSize={o.q > 0 ? 8 : 10} fontWeight={700} textAnchor="middle" fill="#fff">{o.q > 0 ? "+" : "−"}</text>
        ))}
        {metal && ions.map((o, k) => <text key={`q${k}`} x={o.x} y={o.y + 3.5} fontSize={9} fontWeight={700} textAnchor="middle" fill="#fff">+</text>)}
      </g>
      <line x1={cx0 - D / 2 - 6} x2={cx0 + (COLS - 0.5) * D + 6} y1={planeY - gap / 2} y2={planeY - gap / 2}
        stroke={gap > 2 ? C.red : C.muted} strokeDasharray="4 3" />
      <T x={cx0 - D / 2} y={H - 10} color={gap > 2 ? C.red : C.muted}>
        {metal ? tx(t, "figChCs_metalMsg", "same picture after any shift: the layers slide, the metal bends")
          : gap > 2 ? tx(t, "figChCs_split", "like charges face each other: the halves repel and the crystal splits")
            : tx(t, "figChCs_holds", "opposite charges face each other across the plane")}
      </T>

      <T x={PL} y={PT - 26} color={C.fg} bold>{tx(t, "figChCs_plot", "energy between the two halves")}</T>
      <line x1={PL} x2={PR} y1={py(0)} y2={py(0)} stroke={C.axis} />
      <line x1={PL} x2={PL} y1={PT - 8} y2={PB + 8} stroke={C.axis} />
      <T x={PL - 4} y={py(1) + 3} anchor="end">+</T>
      <T x={PL - 4} y={py(-1) + 3} anchor="end">−</T>
      <T x={PR} y={py(0) - 5} anchor="end">{tx(t, "figChCs_zero", "0")}</T>
      <rect x={PL} y={PT - 8} width={PR - PL} height={py(0) - PT + 8} fill={C.red} opacity={0.06} />
      <T x={PL + 4} y={PT + 4} color={C.red} size={8}>{tx(t, "figChCs_repel", "repel")}</T>
      <T x={PL + 4} y={PB + 4} color={C.green} size={8}>{tx(t, "figChCs_attract", "attract")}</T>
      <path d={path} fill="none" stroke={metal ? "#d97706" : C.amber} strokeWidth={2} />
      <circle cx={px(s)} cy={py(eNow)} r={5} fill={eNow > 0 ? C.red : C.green} />
      {[0, 0.5, 1].map(v => <T key={v} x={px(v)} y={PB + 22} anchor="middle">{f2(v, 1)}</T>)}
      <T x={(PL + PR) / 2} y={PB + 36} anchor="middle">{tx(t, "figChCs_shiftAxis", "shift of the top half (ion spacings)")}</T>
    </svg>
  );

  return (
    <Figure title={tx(t, "figChCs_title", "Hit it with a hammer: salt shatters, metal bends")}
      controls={<>
        <Slider label={tx(t, "figChCs_shift", "slide top half")} value={s} min={0} max={1} step={0.01} onChange={setS} fmt={v => f2(v, 2)} width="w-28" />
        <Row>
          <Btn active={!metal} onClick={() => setMetal(false)}>{tx(t, "figChCs_salt", "salt (Na⁺ Cl⁻)")}</Btn>
          <Btn active={metal} onClick={() => setMetal(true)}>{tx(t, "figChCs_metal", "metal (ions in an electron sea)")}</Btn>
          <Btn onClick={() => setS(1)}>{tx(t, "figChCs_one", "one spacing")}</Btn>
          <Readout color={eNow > 0 ? C.red : C.green}>{`E = ${f2(eNow, 2)} × |E₀|`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChCs_note", "Drag the slider to slide the top half of the crystal along the dashed plane, as a hammer blow would. The plot adds up the Coulomb energy of every pair of ions across the plane. Unshifted, each ion faces its opposite, and the energy is strongly negative: the halves hold together. Shifted by one spacing, each Na⁺ sits over an Na⁺ and each Cl⁻ over a Cl⁻: the same sum turns just as strongly positive, and the halves fly apart. That is why salt crystals cleave along flat faces. In a metal, the positive ions are held by a sea of shared electrons that follows them anywhere, so a shifted layer is as well bonded as before: the energy stays flat, and the metal bends.")}>
      {view}
    </Figure>
  );
}

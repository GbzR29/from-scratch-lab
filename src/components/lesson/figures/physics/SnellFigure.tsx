"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, C, T, Handle, useDrag, f2, clamp } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// A laser beam hits the flat boundary between two transparent materials. Part
// of it is reflected at the same angle; the rest is refracted by Snell's law,
// n₁ sin θ₁ = n₂ sin θ₂. How much is reflected comes from the Fresnel
// equations (averaged over both polarisations, as for unpolarised light):
// about 4% for glass at normal incidence, rising to 100% at grazing angles.
// Going from a slower material into a faster one, beyond the critical angle
// sin θc = n₂/n₁ no refracted ray exists: total internal reflection.
// "white light" sends seven wavelengths at once; each material's index is a
// little higher for violet than for red (a Cauchy fit n(λ) = n_D + B(1/λ² −
// 1/589²)), so the colours fan out: dispersion.
// The laser can be dragged round to either side of the boundary.

const W = 560, H = 300;
const O = { x: 280, y: 150 }, RAY = 150;
const MEDIA = {
  air: { n: 1.0003, B: 0 },
  water: { n: 1.333, B: 2850 },
  glass: { n: 1.5168, B: 4040 },
  diamond: { n: 2.417, B: 13000 },
} as const;
type Medium = keyof typeof MEDIA;
const nAt = (m: Medium, l: number) => MEDIA[m].n + MEDIA[m].B * (1 / (l * l) - 1 / (589 * 589));
const WHITE = [410, 450, 490, 530, 570, 620, 680];
const LASER = 532;
const SPREAD = 10;

/** Fresnel reflectance for unpolarised light, from index n1 to n2 at incidence θ1. */
function reflectance(n1: number, n2: number, th1: number) {
  const s = (n1 / n2) * Math.sin(th1);
  if (s >= 1) return 1;
  const th2 = Math.asin(s), c1 = Math.cos(th1), c2 = Math.cos(th2);
  const rs = (n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2);
  const rp = (n1 * c2 - n2 * c1) / (n1 * c2 + n2 * c1);
  return (rs * rs + rp * rp) / 2;
}

export function SnellFigure({ t }: { t?: TrackTranslations }) {
  const [top, setTop] = useState<Medium>("air");
  const [bot, setBot] = useState<Medium>("water");
  const [ang, setAng] = useState(-2.3);             // laser position on the circle (radians, screen)
  const [white, setWhite] = useState(false);

  const drag = useDrag<number>(
    p => (Math.hypot(p.x - (O.x + RAY * Math.cos(ang)), p.y - (O.y + RAY * Math.sin(ang))) < 24 ? 0 : null),
    (_, p) => {
      let a = Math.atan2(p.y - O.y, p.x - O.x);
      // keep the laser clear of the boundary itself
      if (Math.abs(Math.sin(a)) < 0.05) a = Math.atan2(Math.sign(Math.sin(a) || -1) * 0.05, Math.cos(a));
      setAng(a);
    },
  );

  const fromTop = Math.sin(ang) < 0;
  const inM = fromTop ? top : bot, outM = fromTop ? bot : top;
  const dirIn = { x: -Math.cos(ang), y: -Math.sin(ang) };          // towards the hit point
  const th1 = Math.acos(clamp(Math.abs(dirIn.y), 0, 1));
  const side = Math.sign(dirIn.x) || 1;
  const vy = fromTop ? 1 : -1;                                     // travel direction across the boundary

  const lams = white ? WHITE : [LASER];
  const rays = lams.map(l => {
    const n1 = nAt(inM, l), n2 = nAt(outM, l), s2 = (n1 / n2) * Math.sin(th1);
    const tir = s2 >= 1;
    const th2 = tir ? 0 : Math.asin(s2);
    return { l, n1, n2, tir, th2, R: reflectance(n1, n2, th1) };
  });
  const main = rays[Math.floor(rays.length / 2)];
  // real dispersion is a fraction of a degree: the fan is drawn SPREAD× wider than it is
  const out = rays.filter(ray => !ray.tir);
  const spread = white && out.length > 1 ? Math.abs(out[0].th2 - out[out.length - 1].th2) : null;
  const drawn = (th2: number) => (white && !main.tir ? main.th2 + SPREAD * (th2 - main.th2) : th2);
  const nIn = MEDIA[inM].n, nOut = MEDIA[outM].n;
  const crit = nIn > nOut ? Math.asin(nOut / nIn) : null;
  const deg = (a: number) => (a * 180) / Math.PI;
  const col = (l: number) => (white ? wavelengthCss(l) : C.green);

  const src = { x: O.x + RAY * Math.cos(ang), y: O.y + RAY * Math.sin(ang) };
  const refl = { x: O.x + side * RAY * Math.sin(th1), y: O.y - vy * RAY * Math.cos(th1) };
  const opts = (Object.keys(MEDIA) as Medium[]).map(m => [m, tx(t, `figPhSnell_${m}`, m)] as const);

  return (
    <Figure title={tx(t, "figPhSnell_title", "Reflection and refraction at a boundary")}
      head={<Btn active={white} onClick={() => setWhite(w => !w)}>{tx(t, "figPhSnell_white", "white light")}</Btn>}
      controls={<>
        <Row><span className="text-[10px] font-mono text-[var(--text-muted)] w-14">{tx(t, "figPhSnell_top", "top")}</span><Choice value={top} options={opts} onChange={setTop} /></Row>
        <Row><span className="text-[10px] font-mono text-[var(--text-muted)] w-14">{tx(t, "figPhSnell_bottom", "bottom")}</span><Choice value={bot} options={opts} onChange={setBot} /></Row>
        <Row>
          <Readout color={C.green}>{`θ₁ = ${f2(deg(th1), 1)}°`}</Readout>
          <Readout color={C.green}>{main.tir ? tx(t, "figPhSnell_noRefr", "no refracted ray") : `θ₂ = ${f2(deg(main.th2), 1)}°`}</Readout>
          {!main.tir && <Readout>{`n₁ sin θ₁ = ${f2(nIn * Math.sin(th1), 3)} = n₂ sin θ₂`}</Readout>}
          <Readout color={C.amber}>{`${tx(t, "figPhSnell_reflected", "reflected")}: ${f2(main.R * 100, 1)}%`}</Readout>
          {white && spread !== null && <Readout color={C.purple}>{`${tx(t, "figPhSnell_spread", "violet to red")}: ${f2(deg(spread), 2)}°`}</Readout>}
          {crit !== null && <Readout color={main.tir ? C.red : C.fg}>{`θc = ${f2(deg(crit), 1)}°${main.tir ? ` · ${tx(t, "figPhSnell_tir", "total internal reflection")}` : ""}`}</Readout>}
          <Readout>{`v = c/n: ${f2(299.8 / nIn, 0)} → ${f2(299.8 / nOut, 0)} ${tx(t, "figPhSnell_mms", "thousand km/s")}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhSnell_note", "Drag the laser round. The reflected beam always leaves at the same angle it arrived. The refracted beam bends towards the perpendicular when it enters a slower material (higher n) and away from it when it enters a faster one, so that n₁ sin θ₁ stays equal to n₂ sin θ₂. Watch the percentage reflected: only a few percent near the perpendicular, much more at shallow angles, which is why a lake mirrors the far shore but you can see into the water at your feet. Now move the laser below the boundary, in water or glass, aimed upwards, and tilt it: the refracted beam swings towards the surface, grazes it at the critical angle, and beyond that vanishes. All the light is reflected back down: total internal reflection, which keeps light trapped inside optical fibres and makes diamonds sparkle. Switch on white light: violet is slowed a little more than red, bends a little more, and the colours fan out. Diamond spreads them most. The real fan is only a fraction of a degree wide, shown in the purple readout, so the drawing widens it ten times.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x={0} y={O.y} width={W} height={H - O.y} fill={C.sky} opacity={0.06 + 0.05 * (MEDIA[bot].n - 1)} />
        <rect x={0} y={0} width={W} height={O.y} fill={C.sky} opacity={0.06 * (MEDIA[top].n - 1) * 1.5} />
        <line x1={0} y1={O.y} x2={W} y2={O.y} stroke={C.fg} strokeWidth={1.4} />
        <line x1={O.x} y1={O.y - 130} x2={O.x} y2={O.y + 130} stroke={C.muted} strokeDasharray="4 4" />
        <T x={10} y={18} size={9} color={C.fg}>{`${tx(t, `figPhSnell_${top}`, top)} · n = ${f2(MEDIA[top].n, 3)}`}</T>
        <T x={10} y={H - 10} size={9} color={C.fg}>{`${tx(t, `figPhSnell_${bot}`, bot)} · n = ${f2(MEDIA[bot].n, 3)}`}</T>
        {/* incident */}
        <line x1={src.x} y1={src.y} x2={O.x} y2={O.y} stroke={white ? "#fff" : C.green} strokeWidth={3} style={white ? { filter: "drop-shadow(0 0 1px #000)" } : undefined} />
        {/* reflected (strength from Fresnel) */}
        <line x1={O.x} y1={O.y} x2={refl.x} y2={refl.y} stroke={white ? "#fff" : C.green} strokeWidth={1 + 2.5 * main.R} opacity={0.25 + 0.75 * Math.sqrt(main.R)}
          style={white ? { filter: "drop-shadow(0 0 1px #000)" } : undefined} />
        {/* refracted, one per wavelength */}
        {rays.map(ray => ray.tir ? null : (
          <line key={ray.l} x1={O.x} y1={O.y} x2={O.x + side * RAY * 1.2 * Math.sin(drawn(ray.th2))} y2={O.y + vy * RAY * 1.2 * Math.cos(drawn(ray.th2))}
            stroke={col(ray.l)} strokeWidth={white ? 1.6 : 3} opacity={0.35 + 0.65 * (1 - ray.R)} />
        ))}
        {crit !== null && (
          <path d={`M${O.x},${O.y} L${O.x - side * 90 * Math.sin(crit)},${O.y - vy * 90 * Math.cos(crit)}`} stroke={C.red} strokeDasharray="2 4" opacity={0.6} />
        )}
        <circle cx={src.x} cy={src.y} r={9} fill="var(--code-bg)" stroke={C.fg} strokeWidth={1.6} />
        <Handle x={src.x} y={src.y} color={C.amber} r={4} active={drag.dragging === 0} />
        <T x={O.x + 6} y={O.y + (fromTop ? -118 : 128)} size={8.5}>{tx(t, "figPhSnell_normal", "perpendicular")}</T>
        {white && spread !== null && <T x={W - 10} y={fromTop ? H - 10 : 18} anchor="end" size={8.5} color={C.purple}>{tx(t, "figPhSnell_exag", "colour fan drawn 10× wider")}</T>}
      </svg>
    </Figure>
  );
}

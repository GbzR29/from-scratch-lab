"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The Milky Way's rotation curve: how fast stars and gas orbit at each
// distance r from the centre. For a circular orbit, v² = G M(<r) / r, where
// M(<r) is the mass inside the orbit (treated as spherical, a simplification
// that is off by some 10–20% for the disc). The visible mass:
//   bulge  Hernquist, M_b r²/(r + a)², M_b = 10¹⁰ M☉, a = 0.5 kpc
//   disc   exponential, M_d [1 − e^(−x)(1 + x)], x = r/R_d,
//          M_d = 5.5 × 10¹⁰ M☉ (stars and gas), R_d = 2.6 kpc
// The slider adds a dark halo, a pseudo-isothermal sphere with core
// r_c = 4 kpc, M_h(<r) ∝ r_c³ (r/r_c − arctan(r/r_c)), scaled to the mass it
// holds inside 25 kpc. G = 4.30 × 10⁻⁶ kpc (km/s)² / M☉.
// Dots: the measured curve from 5 to 25 kpc, as the straight-line fit of
// Eilers et al. (2019): v = 229 − 1.7 (r − 8.12) km/s, with error bars that
// widen outwards. Left: a top view whose stars go round at v(r)/r, all the
// rings starting lined up, so a falling curve smears them into a spiral.

const W = 560, H = 280, G = 4.30091e-6, RC = 4, RMAX = 26;
const rotMass = (r: number, halo25: number) => {
  const bulge = (1e10 * r * r) / (r + 0.5) ** 2;
  const x = r / 2.6, disc = 5.5e10 * (1 - Math.exp(-x) * (1 + x));
  const shape = (u: number) => u - Math.atan(u);
  const halo = halo25 * (shape(r / RC) / shape(25 / RC));
  return { bulge, disc, halo };
};
const speed = (m: number, r: number) => Math.sqrt((G * m) / r);
const DATA = Array.from({ length: 14 }, (_, i) => {
  const r = 5 + i * 1.5;
  return { r, v: 229 - 1.7 * (r - 8.12), err: 4 + i * 0.9 };
});

export function RotationCurveFigure({ t }: { t?: TrackTranslations }) {
  const [halo, setHalo] = useState(0);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const clock = useRef({ tm: 0 });
  const stars = useRef((() => {
    const rnd = mulberry32(7);
    return Array.from({ length: 180 }, (_, i) => ({ ring: i % 6, jit: (rnd() - 0.5) * 0.25, phase: Math.floor(i / 6) * 0.06 + (rnd() - 0.5) * 0.02 }));
  })());

  useFrame(vis.on, dt => { clock.current.tm += dt; rerender(); });

  const vAt = (r: number, h = halo) => { const m = rotMass(r, h); return speed(m.bulge + m.disc + m.halo, r); };
  const vVis = (r: number) => { const m = rotMass(r, 0); return speed(m.bulge + m.disc, r); };
  const miss = Math.sqrt(DATA.reduce((a, d) => a + (vAt(d.r) - d.v) ** 2, 0) / DATA.length);
  const m25 = rotMass(25, halo), visible25 = m25.bulge + m25.disc;
  const darkShare = m25.halo / (visible25 + m25.halo);

  // curve plot
  const PX0 = 300, PX1 = 540, PY0 = 26, PY1 = 230, VMAX = 300;
  const X = (r: number) => PX0 + (r / RMAX) * (PX1 - PX0), Y = (v: number) => PY1 - (v / VMAX) * (PY1 - PY0);
  const curve = (f: (r: number) => number) => {
    let d = "";
    for (let i = 1; i <= 100; i++) { const r = (i / 100) * RMAX; d += `${i > 1 ? "L" : "M"}${X(r).toFixed(1)},${Y(f(r)).toFixed(1)}`; }
    return d;
  };

  // top view: six rings of stars; time scaled so the inner ring turns once every 6 s
  const GX = 140, GY = 140, GR = 120, RINGS = [3, 6.5, 10, 14, 19, 24];
  const omega0 = vAt(RINGS[0]) / RINGS[0];
  const tt = clock.current.tm % 60;

  return (
    <Figure title={tx(t, "figPhRot_title", "How fast does the galaxy spin? Rotation curves and dark matter")}
      controls={<>
        <Slider label={tx(t, "figPhRot_halo", "dark halo: mass inside 25 kpc")} value={halo} min={0} max={4e11} step={5e9} onChange={setHalo} fmt={v => `${f2(v / 1e11, 2)} × 10¹¹ M☉`} width="w-40" />
        <Row>
          <Readout>{`${tx(t, "figPhRot_sun", "at the Sun (8.1 kpc)")}: ${f2(vAt(8.12), 0)} km/s`}</Readout>
          <Readout>{`${tx(t, "figPhRot_at25", "at 25 kpc")}: ${f2(vAt(25), 0)} km/s`}</Readout>
          <Readout color={miss < 10 ? C.green : C.red}>{`${tx(t, "figPhRot_miss", "average miss")}: ${f2(miss, 0)} km/s`}</Readout>
          <Readout color={C.purple}>{`${tx(t, "figPhRot_dark", "dark share inside 25 kpc")}: ${f2(darkShare * 100, 0)}%`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhRot_note", "Planets far from the Sun orbit slowly: Neptune at 5.4 km/s against Earth's 30, because almost all the solar system's mass is at the centre, and v² = GM/r falls as 1/r. A galaxy's light is concentrated towards its middle too, so its outer stars and gas should orbit slower and slower. They do not. From the 1970s, Vera Rubin and Kent Ford measured the speeds of stars and gas across many galaxies from the Doppler shifts of their light, and the curves stayed flat as far out as anyone could see. Start with no halo: the orange curve from the visible stars and gas peaks and falls, far below the measured dots. Add an invisible mass, spread in a large round halo, until the curve passes through the dots. For the Milky Way this takes about 2 × 10¹¹ suns of dark matter inside 25 kpc, three times the visible mass, and the halo goes on much further. On the left, the rings all start lined up; with the visible mass alone the outer ones lag behind and the line winds into a spiral, while with the halo they keep nearly the same speed.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* top view */}
          <circle cx={GX} cy={GY} r={GR} fill={C.purple} opacity={0.04 + 0.12 * Math.min(1, halo / 3e11)} />
          <circle cx={GX} cy={GY} r={16} fill={C.amber} opacity={0.35} />
          {RINGS.map((r, k) => <circle key={k} cx={GX} cy={GY} r={(r / RMAX) * GR} fill="none" stroke={C.grid} />)}
          {stars.current.map((s, i) => {
            const r = RINGS[s.ring] + s.jit * 2, w = vAt(r) / r / omega0, ang = s.phase - ((2 * Math.PI) / 6) * w * tt;
            const rr = (r / RMAX) * GR;
            return <circle key={i} cx={GX + rr * Math.cos(ang)} cy={GY - rr * Math.sin(ang)} r={s.phase < 0.07 ? 3 : 1.3} fill={s.phase < 0.07 ? C.amber : C.fg} opacity={s.phase < 0.07 ? 1 : 0.55} />;
          })}
          <T x={14} y={18} size={8}>{tx(t, "figPhRot_top", "top view: one bright star per ring started on the same line")}</T>
          {halo > 0 && <T x={GX} y={GY + GR + 14} anchor="middle" size={8} color={C.purple}>{tx(t, "figPhRot_haloL", "shaded: the dark halo (it reaches far beyond)")}</T>}

          {/* rotation curve */}
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          {[0, 100, 200, 300].map(v => (
            <g key={v}>
              <line x1={PX0} y1={Y(v)} x2={PX1} y2={Y(v)} stroke={C.grid} />
              <T x={PX0 - 4} y={Y(v) + 3} anchor="end" size={7.5}>{String(v)}</T>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25].map(r => <T key={r} x={X(r)} y={PY1 + 12} anchor="middle" size={7.5}>{String(r)}</T>)}
          <path d={curve(vVis)} fill="none" stroke={C.orange} strokeWidth={1.6} strokeDasharray={halo > 0 ? "5 3" : undefined} />
          {halo > 0 && <path d={curve(r => { const m = rotMass(r, halo); return speed(m.halo, r); })} fill="none" stroke={C.purple} strokeWidth={1.2} strokeDasharray="3 3" />}
          {halo > 0 && <path d={curve(r => vAt(r))} fill="none" stroke={C.sky} strokeWidth={2} />}
          {DATA.map((d, i) => (
            <g key={i}>
              <line x1={X(d.r)} y1={Y(d.v - d.err)} x2={X(d.r)} y2={Y(d.v + d.err)} stroke={C.fg} strokeWidth={1} />
              <circle cx={X(d.r)} cy={Y(d.v)} r={2.6} fill={C.fg} />
            </g>
          ))}
          <T x={PX0} y={PY0 - 10} size={8}>{tx(t, "figPhRot_plot", "orbital speed (km/s) against distance from the centre")}</T>
          <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhRot_rAx", "r (kpc; 1 kpc = 3260 light-years)")}</T>
          <T x={X(14)} y={Y(vVis(14)) + 14} size={8} color={C.orange}>{tx(t, "figPhRot_vis", "visible stars and gas")}</T>
          <T x={X(10)} y={Y(262)} size={8} color={C.fg}>{tx(t, "figPhRot_data", "measured (Eilers et al. 2019)")}</T>
          {halo > 0 && <T x={X(16)} y={Y(speed(rotMass(16, halo).halo, 16)) + 14} size={8} color={C.purple}>{tx(t, "figPhRot_haloC", "halo alone")}</T>}
        </svg>
      </div>
    </Figure>
  );
}

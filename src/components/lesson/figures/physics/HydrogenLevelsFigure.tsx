"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// Hydrogen's energy levels, Eₙ = −13.6 eV / n², drawn to scale (left). Pick a
// lower level (the series) and an upper one: the electron drops from the
// upper to the lower level and sends out one photon of energy
// ΔE = 13.6 eV (1/n₁² − 1/n₂²), wavelength λ = 1240 eV·nm / ΔE. Middle: Bohr's
// picture of the same jump, orbits of radius n²a₀ with exactly n de Broglie
// wavelengths around each (the wobble), drawn to the scale of the upper orbit.
// Bottom: every line of the chosen series, by wavelength; visible lines in
// their own colour, ultraviolet and infrared ones in grey.
// "break it: a classical atom" lets the electron orbit at any radius: it
// radiates all the time, spirals into the nucleus (in about 16 ps for real),
// and the light it gives off is a continuous smear, not lines.

const W = 560, H = 290;
const EX0 = 26, EX1 = 150, EY0 = 26, EY1 = 230;     // level diagram
const OX = 284, OY = 120, OR = 92;                   // orbit panel centre and largest radius
const SX0 = 196, SX1 = 548, SY0 = 246, SY1 = 270;   // spectrum strip
const yLevel = (e: number) => EY1 - ((e + 13.6) / 13.6) * (EY1 - EY0);
const En = (n: number) => -13.6 / (n * n);
const SERIES = [
  [1, "lyman", "Lyman (ultraviolet)", 88, 126],
  [2, "balmer", "Balmer (visible)", 360, 670],
  [3, "paschen", "Paschen (infrared)", 800, 1900],
] as const;
const lamOf = (lo: number, hi: number) => 1240 / (En(hi) - En(lo));

/**
 * A classically radiating electron after a fraction s of its fall: r³ shrinks
 * linearly, and the angular speed grows as r^(−3/2) (Kepler for a 1/r² pull).
 * Returns the path so far and the electron's position.
 */
function spiralPath(s: number) {
  let a = 0, d = "", x = OX + OR, y = OY;
  const N = 400;
  for (let i = 0; i <= N; i++) {
    const u = (s * i) / N, r = Math.max(0.04, Math.cbrt(1 - u));
    if (i) a += (s / N) * 14 * r ** -1.5;
    x = OX + (OR * r + 3) * Math.cos(a); y = OY + (OR * r + 3) * Math.sin(a);
    d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return { d, x, y };
}

export function HydrogenLevelsFigure({ t }: { t?: TrackTranslations }) {
  const [lo, setLo] = useState(2);
  const [hi, setHi] = useState(3);
  const [broken, setBroken] = useState(false);
  const [time, setTime] = useState(0);
  const vis = useVisible<HTMLDivElement>();
  useFrame(vis.on, dt => setTime(v => v + dt));

  const ser = SERIES.find(s => s[0] === lo)!;
  const lam = lamOf(lo, hi), dE = En(hi) - En(lo);
  const visible = lam >= 380 && lam <= 750;
  const col = visible ? wavelengthCss(lam) : C.muted;
  const region = lam < 380 ? tx(t, "figPhH_uv", "ultraviolet") : lam > 750 ? tx(t, "figPhH_ir", "infrared") : tx(t, "figPhH_vis", "visible");
  const pick = (n: number) => { setLo(n); setHi(h => (h <= n ? n + 1 : h)); };
  const SX = (l: number) => SX0 + ((l - ser[3]) / (ser[4] - ser[3])) * (SX1 - SX0);

  // the jump cycle: 2 s on the upper orbit, then the drop and the photon
  const cyc = time % 3.4, dropped = cyc > 2;
  const rUp = OR, rLo = OR * (lo * lo) / (hi * hi);
  const rNow = dropped ? rLo : rUp, n = dropped ? lo : hi;
  const ang = time * (3.2 / Math.sqrt(n));
  // classical spiral (radiating charge: r³ falls linearly in time), then it starts again
  const spiral = spiralPath((time % 4) / 4);

  const wobble = (r: number, k: number, a: number) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const th = (i / 160) * 2 * Math.PI, rr = r + a * Math.sin(k * th + time * 2);
      d += `${i ? "L" : "M"}${(OX + rr * Math.cos(th)).toFixed(1)},${(OY + rr * Math.sin(th)).toFixed(1)}`;
    }
    return d + "Z";
  };

  return (
    <Figure title={tx(t, "figPhH_title", "Hydrogen: energy levels and the light of a jump")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhH_broken", "break it: a classical atom")}</Btn>}
      controls={<>
        <Row>
          <Choice value={String(lo)} onChange={v => pick(Number(v))} options={SERIES.map(([k, id, name]) => [String(k), tx(t, `figPhH_${id}`, name)] as const)} />
        </Row>
        {!broken && <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figPhH_from", "drop from")}</span>
          {Array.from({ length: 6 }, (_, i) => lo + 1 + i).map(k => <Btn key={k} active={hi === k} onClick={() => setHi(k)}>{`n = ${k}`}</Btn>)}
        </Row>}
        <Row>
          {broken
            ? <Readout color={C.red}>{tx(t, "figPhH_crash", "the electron radiates and spirals in: a smear of colours, then collapse")}</Readout>
            : <>
              <Readout>{`E${hi} = ${f2(En(hi), 2)} eV, E${lo} = ${f2(En(lo), 2)} eV`}</Readout>
              <Readout color={C.amber}>{`${tx(t, "figPhH_photon", "photon")}: ΔE = ${f2(dE, 3)} eV`}</Readout>
              <Readout color={visible ? col : C.fg}>{`λ = 1240/ΔE = ${f2(lam, 1)} nm (${region})`}</Readout>
            </>}
        </Row>
      </>}
      note={tx(t, "figPhH_note", "Hydrogen's electron can only have the energies on the left, −13.6 eV divided by n². When it drops from a higher level to a lower one, the difference leaves as a single photon, so each pair of levels gives one exact wavelength. All the drops that end on level 2 form the Balmer series: four of them are visible, red, cyan, blue and violet, the lines that astronomers see in hydrogen clouds all over the sky. Drops to level 1 give much bigger energies, in the ultraviolet (Lyman); drops to level 3 give small ones, in the infrared (Paschen). Notice how the lines crowd together towards a limit: the levels themselves crowd together near zero energy, where the electron is set free. The middle picture is Niels Bohr's 1913 model of the same jump: circular orbits of radius n² times the Bohr radius, each with exactly n electron wavelengths round it. Break it by letting the electron orbit anywhere, as classical physics allows: an orbiting charge radiates all the time, so it spirals into the nucleus and gives off a smear of every colour. Real atoms are stable and give sharp lines.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* level diagram */}
          <T x={EX0} y={14} size={8}>{tx(t, "figPhH_levels", "energy (eV)")}</T>
          <line x1={EX0} y1={yLevel(0)} x2={EX1} y2={yLevel(0)} stroke={C.muted} strokeDasharray="3 3" />
          <T x={EX1 + 4} y={yLevel(0) + 3} size={7.5}>{tx(t, "figPhH_free", "0: free")}</T>
          {broken
            ? <rect x={EX0} y={yLevel(0)} width={EX1 - EX0} height={yLevel(-13.6) - yLevel(0)} fill={C.red} opacity={0.12} />
            : Array.from({ length: 8 }, (_, i) => {
              const k = i + 1, y = yLevel(En(k)), act = k === lo || k === hi;
              return (
                <g key={k}>
                  <line x1={EX0} y1={y} x2={EX1} y2={y} stroke={act ? C.fg : C.muted} strokeWidth={act ? 2 : 1} opacity={act ? 1 : 0.6} />
                  {k <= 4 && <T x={EX1 + 4} y={y + 3} size={7.5} color={act ? C.fg : C.muted}>{`n=${k}  ${f2(En(k), 2)}`}</T>}
                </g>
              );
            })}
          {!broken && (() => {
            const x = EX0 + 30 + (lo - 1) * 26, y1 = yLevel(En(hi)), y2 = yLevel(En(lo));
            return <>
              <line x1={x} y1={y1} x2={x} y2={y2 - 6} stroke={col === C.muted ? C.fg : col} strokeWidth={2} />
              <polygon points={`${x},${y2} ${x - 4},${y2 - 7} ${x + 4},${y2 - 7}`} fill={col === C.muted ? C.fg : col} />
            </>;
          })()}

          {/* Bohr's picture */}
          <circle cx={OX} cy={OY} r={4} fill={C.red} />
          {broken ? <>
            <path d={spiral.d} fill="none" stroke={C.sky} strokeWidth={1} opacity={0.6} />
            <circle cx={spiral.x} cy={spiral.y} r={4} fill={C.sky} />
          </> : <>
            <circle cx={OX} cy={OY} r={rUp} fill="none" stroke={C.grid} strokeDasharray="2 3" />
            <circle cx={OX} cy={OY} r={rLo} fill="none" stroke={C.grid} strokeDasharray="2 3" />
            <path d={wobble(rUp, hi, Math.min(5, rUp * 0.06))} fill="none" stroke={C.muted} strokeWidth={1} opacity={dropped ? 0.35 : 0.9} />
            <path d={wobble(rLo, lo, Math.min(5, rLo * 0.12))} fill="none" stroke={C.muted} strokeWidth={1} opacity={dropped ? 0.9 : 0.35} />
            <circle cx={OX + rNow * Math.cos(ang)} cy={OY + rNow * Math.sin(ang)} r={4} fill={C.sky} />
            {dropped && (() => {
              const u = (cyc - 2) / 1.4, d0 = rLo + 6 + u * (OR + 40 - rLo);
              const a0 = -0.6, pts: string[] = [];
              for (let i = 0; i <= 24; i++) {
                const s = d0 + i * 1.6, w = 4 * Math.sin(i * 1.1);
                pts.push(`${i ? "L" : "M"}${(OX + s * Math.cos(a0) - w * Math.sin(a0)).toFixed(1)},${(OY + s * Math.sin(a0) + w * Math.cos(a0)).toFixed(1)}`);
              }
              return <path d={pts.join("")} fill="none" stroke={col === C.muted ? C.fg : col} strokeWidth={2} opacity={1 - u * 0.6} />;
            })()}
            <T x={OX} y={OY + OR + 16} anchor="middle" size={8}>{`r = n² a₀: ${hi * hi} a₀ → ${lo * lo} a₀`}</T>
          </>}

          {/* the series */}
          <T x={SX0} y={SY0 - 6} size={8}>{`${tx(t, `figPhH_${ser[1]}`, ser[2])}: ${ser[3]}–${ser[4]} nm`}</T>
          <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill="#05070c" />
          {broken
            ? Array.from({ length: 120 }, (_, i) => {
              const l = ser[3] + ((i + 0.5) / 120) * (ser[4] - ser[3]);
              return <rect key={i} x={SX(l) - 0.2} y={SY0} width={(SX1 - SX0) / 120 + 0.6} height={SY1 - SY0} fill={l >= 380 && l <= 750 ? wavelengthCss(l) : "#555"} opacity={0.7} />;
            })
            : Array.from({ length: 24 }, (_, i) => {
              const k = lo + 1 + i, l = lamOf(lo, k), sel = k === hi;
              const c = l >= 380 && l <= 750 ? wavelengthCss(l) : "#888";
              return <rect key={k} x={SX(l) - (sel ? 1.5 : 0.7)} y={SY0} width={sel ? 3 : 1.4} height={SY1 - SY0} fill={c} opacity={sel ? 1 : 0.75} />;
            })}
          {!broken && <line x1={SX(lamOf(lo, hi))} y1={SY1} x2={SX(lamOf(lo, hi))} y2={SY1 + 6} stroke={C.fg} />}
          {!broken && <T x={SX(1240 / (13.6 / (lo * lo)))} y={SY1 + 14} anchor="middle" size={7.5}>{tx(t, "figPhH_limit", "series limit")}</T>}
        </svg>
      </div>
    </Figure>
  );
}

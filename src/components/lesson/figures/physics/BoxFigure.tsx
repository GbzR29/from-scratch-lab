"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A particle in a box: an electron free to move between two walls a distance
// L apart, that it cannot pass. The allowed waves are ψₙ = √(2/L) sin(nπx/L),
// those that fit a whole number of half-wavelengths, with energies
// Eₙ = n² h²/(8 m L²). Left: the ladder of levels (click a level to add it to
// or remove it from the state). Right: the state, Re ψ (blue), Im ψ (pink)
// and the probability density |ψ|² (filled). Each level turns in time as
// e^(−iEₙt/ħ): one level alone is a standing wave whose |ψ|² never changes
// (a stationary state); two or more beat against each other and |ψ|² sloshes
// from side to side with period h/(E₂ − E₁). Time runs slowed down: the real
// slosh for L = 1 nm takes about 4 femtoseconds.
// "break it: allow any energy" lets you pick any energy and draws the wave
// that starts at zero on the left wall. Only at Eₙ does it come back to zero
// at the right wall; anywhere else it would have to jump at the wall, which a
// wave cannot do. That is why the energies are quantised.

const W = 560, H = 250;
const LX0 = 30, LX1 = 140, LY0 = 22, LY1 = 226;     // ladder panel
const PX0 = 190, PX1 = 540, PMID = 128, PAMP = 92;   // plot panel
const NMAX = 6, OMEGA1 = 1.1;                         // levels shown; on-screen angular speed of level 1
const LEVEL_COLORS = [C.sky, C.green, C.amber, C.pink, C.purple, C.teal];
const ly = (e: number) => LY1 - (e / (NMAX * NMAX)) * (LY1 - LY0);

export function BoxFigure({ t }: { t?: TrackTranslations }) {
  const [on, setOn] = useState<boolean[]>([true, true, false, false, false, false]);
  const [L, setL] = useState(1);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [broken, setBroken] = useState(false);
  const [eAny, setEAny] = useState(6.5);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && vis.on && !broken, dt => setTime(v => v + dt));

  const E1 = 0.376 / (L * L);                            // eV, electron
  const ns = on.map((b, i) => (b ? i + 1 : 0)).filter(Boolean);
  const norm = 1 / Math.sqrt(Math.max(1, ns.length));

  const N = 220;
  let dRe = "", dIm = "", dP = `M${PX0},${PMID}`, end = 0;
  for (let i = 0; i <= N; i++) {
    const u = i / N, X = PX0 + u * (PX1 - PX0);
    let re = 0, im = 0;
    if (broken) {
      re = Math.sin(Math.PI * Math.sqrt(eAny) * u) * 0.8;
      if (i === N) end = re;
    } else {
      for (const n of ns) {
        const ph = -n * n * OMEGA1 * time, s = Math.sin(n * Math.PI * u) * norm;
        re += s * Math.cos(ph); im += s * Math.sin(ph);
      }
    }
    const p = re * re + im * im;
    dRe += `${i ? "L" : "M"}${X.toFixed(1)},${(PMID - re * PAMP).toFixed(1)}`;
    dIm += `${i ? "L" : "M"}${X.toFixed(1)},${(PMID - im * PAMP).toFixed(1)}`;
    dP += `L${X.toFixed(1)},${(PMID - p * PAMP * 0.6).toFixed(1)}`;
  }
  dP += `L${PX1},${PMID}Z`;

  // where the particle is likely to be: chance of the left half
  let left = 0, all = 0;
  if (!broken) for (let i = 0; i < 200; i++) {
    const u = (i + 0.5) / 200;
    let re = 0, im = 0;
    for (const n of ns) { const ph = -n * n * OMEGA1 * time, s = Math.sin(n * Math.PI * u); re += s * Math.cos(ph); im += s * Math.sin(ph); }
    const p = re * re + im * im; all += p; if (u < 0.5) left += p;
  }
  const nearest = Math.max(1, Math.round(Math.sqrt(eAny)));
  const fits = Math.abs(end) < 0.03;
  const toggle = (i: number) => setOn(o => {
    const n = o.map((b, j) => (j === i ? !b : b));
    return n.some(Boolean) ? n : o;
  });
  const slosh = ns.length >= 2 ? 4.136e-15 / ((ns[1] ** 2 - ns[0] ** 2) * E1) : 0;   // h in eV·s

  return (
    <Figure title={tx(t, "figPhBox_title", "A particle in a box")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhBox_broken", "break it: allow any energy")}</Btn>}
      controls={<>
        {broken
          ? <Slider label={tx(t, "figPhBox_e", "energy E / E₁")} value={eAny} min={0.3} max={36} step={0.05} onChange={setEAny} fmt={v => f2(v, 2)} width="w-28" />
          : <Row>
            {on.map((b, i) => <Btn key={i} active={b} onClick={() => toggle(i)}>{`n = ${i + 1}`}</Btn>)}
          </Row>}
        <Slider label={tx(t, "figPhBox_L", "box width L")} value={L} min={0.2} max={2} step={0.05} onChange={setL} fmt={v => `${f2(v, 2)} nm`} width="w-28" />
        <Row>
          <Readout color={C.amber}>{`E₁ = h²/8mL² = ${f2(E1, 3)} eV`}</Readout>
          {broken
            ? <Readout color={fits ? C.green : C.red}>{fits
              ? `${tx(t, "figPhBox_fits", "fits: an allowed level")} n = ${nearest}`
              : `${tx(t, "figPhBox_miss", "misses the right wall by")} ${f2(Math.abs(end) / 0.8 * 100, 0)}%`}</Readout>
            : <>
              <Readout>{ns.map(n => `E${"₁₂₃₄₅₆"[n - 1]} = ${f2(n * n * E1, 2)}`).join(", ")} eV</Readout>
              <Readout color={C.sky}>{`${tx(t, "figPhBox_left", "chance in the left half")}: ${f2((left / all) * 100, 0)}%`}</Readout>
              {slosh > 0 && <Readout>{`${tx(t, "figPhBox_period", "slosh period")} h/ΔE = ${f2(slosh * 1e15, 2)} fs`}</Readout>}
            </>}
        </Row>
      </>}
      note={tx(t, "figPhBox_note", "An electron trapped between two walls it cannot cross. Its wave must be zero at both walls, so only waves that fit a whole number of half-wavelengths are allowed, like the harmonics of a guitar string. Shorter waves mean more momentum and more energy, and the energies go as 1, 4, 9, 16: n squared. Pick one level alone: the wave turns in time (blue and pink trade places), but |ψ|², the filled shape, does not move at all. That is a stationary state, and it is why an atom in its lowest level sits quietly instead of radiating. Pick two levels together: now |ψ|² sloshes from one side to the other, and the left-half chance swings up and down. Make the box narrower and every level climbs, as 1/L²: squeezing a particle costs energy. Break it by letting the energy be anything: the wave starts at zero on the left wall but, except at the special energies, does not come back to zero at the right one. A wave cannot jump, so those energies are forbidden. Quantisation is just the wave fitting its box.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* the ladder */}
          <line x1={LX0} y1={LY0 - 4} x2={LX0} y2={LY1} stroke={C.fg} strokeWidth={2.5} />
          <line x1={LX1} y1={LY0 - 4} x2={LX1} y2={LY1} stroke={C.fg} strokeWidth={2.5} />
          <line x1={LX0} y1={LY1} x2={LX1} y2={LY1} stroke={C.fg} strokeWidth={1.5} />
          {Array.from({ length: NMAX }, (_, i) => {
            const n = i + 1, y = ly(n * n), act = !broken && on[i];
            return (
              <g key={n} onClick={() => !broken && toggle(i)} style={{ cursor: broken ? "default" : "pointer" }}>
                <rect x={LX0} y={y - 7} width={LX1 - LX0} height={14} fill="transparent" />
                <line x1={LX0 + 4} y1={y} x2={LX1 - 4} y2={y} stroke={act ? LEVEL_COLORS[i] : C.muted} strokeWidth={act ? 2.6 : 1.2} />
                <T x={LX1 + 6} y={y + 3} size={8} color={act ? LEVEL_COLORS[i] : C.muted}>{`n=${n}`}</T>
              </g>
            );
          })}
          {broken && <line x1={LX0 + 2} y1={ly(eAny)} x2={LX1 - 2} y2={ly(eAny)} stroke={fits ? C.green : C.red} strokeWidth={2} strokeDasharray="5 3" />}
          <T x={LX0} y={12} size={8}>{tx(t, "figPhBox_levels", "energy levels")}</T>

          {/* the wave */}
          <rect x={PX0 - 6} y={20} width={6} height={H - 40} fill={C.fg} />
          <rect x={PX1} y={20} width={6} height={H - 40} fill={C.fg} />
          <line x1={PX0} y1={PMID} x2={PX1} y2={PMID} stroke={C.axis} />
          {!broken && <path d={dP} fill={C.sky} opacity={0.22} />}
          {!broken && <path d={dIm} fill="none" stroke={C.pink} strokeWidth={1.3} opacity={0.8} />}
          <path d={dRe} fill="none" stroke={broken ? (fits ? C.green : C.red) : C.sky} strokeWidth={1.8} />
          {broken && <circle cx={PX1} cy={PMID - end * PAMP} r={4.5} fill={fits ? C.green : C.red} />}
          <T x={PX0 + 4} y={16} size={8}>{broken ? tx(t, "figPhBox_try", "a wave that starts at zero on the left wall") : tx(t, "figPhBox_key", "Re ψ (blue), Im ψ (pink), |ψ|² (filled)")}</T>
          <T x={PX0} y={H - 6} anchor="middle" size={8}>0</T>
          <T x={PX1} y={H - 6} anchor="middle" size={8}>L</T>
        </svg>
        {!broken && <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={() => setTime(0)}
          readout={tx(t, "figPhBox_slow", "time slowed down ~10^15 times")} />}
      </div>
    </Figure>
  );
}

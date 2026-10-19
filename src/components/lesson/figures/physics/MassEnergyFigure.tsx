"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Two identical lumps of putty, each of rest mass m = 1 kg, fly at each other
// at the same speed v = βc and stick. Total momentum is zero before and after,
// so the merged lump sits still. Energy is conserved: before, it is
// 2γmc² (rest energy plus kinetic energy of both); after, the lump is at rest,
// so all of it is rest energy, Mc² = 2γmc², and M = 2γm > 2m. The kinetic
// energy has become mass: the hot lump weighs more by 2(γ − 1)m.
// Presets show everyday collisions, where the gain is real but tiny.
// "break it: mass is conserved" insists that M = 2m, as in Newton's physics:
// the energy ledger then has 2(γ − 1)mc² missing.

const W = 560, H = 230;
const C2 = 299792458 ** 2;
const PRESETS: [string, number][] = [["car", 30 / 299792458], ["meteor", 20000 / 299792458], ["0.5c", 0.5], ["0.9c", 0.9]];

/** "1.23 × 10^-12" style for very small or large numbers. */
function sci(v: number, d = 3) {
  if (v === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e < 4) return f2(v, d);
  return `${f2(v / 10 ** e, 2)} × 10^${e}`;
}

export function MassEnergyFigure({ t }: { t?: TrackTranslations }) {
  const [beta, setBeta] = useState(0.6);
  const [broken, setBroken] = useState(false);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && vis.on, dt => { if (time + dt >= 2) { setTime(2); setPlaying(false); } else setTime(time + dt); });

  // γ − 1 computed without cancellation for tiny speeds
  const gm1 = beta < 1e-3 ? 0.5 * beta * beta + 0.375 * beta ** 4 : 1 / Math.sqrt(1 - beta * beta) - 1;
  const gamma = 1 + gm1;
  const M = broken ? 2 : 2 * gamma, dM = 2 * gm1;
  const missing = broken ? dM * C2 : 0;

  const hit = time >= 1;
  const x = (side: -1 | 1) => 280 + side * (230 - 216 * Math.min(time, 1));
  const r1 = 18, rM = 18 * Math.cbrt(M / 1);

  return (
    <Figure title={tx(t, "figPhMass_title", "Kinetic energy turns into mass")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhMass_broken", "break it: mass is conserved")}</Btn>}
      controls={<>
        <Slider label="β = v/c" value={beta} min={0} max={0.95} step={0.01} onChange={b => { setBeta(b); setTime(0); }} fmt={b => (b < 0.01 && b > 0 ? sci(b) : f2(b, 2))} />
        <Row>
          {PRESETS.map(([k, b]) => <Btn key={k} active={Math.abs(beta - b) < 1e-12} onClick={() => { setBeta(b); setTime(0); }}>
            {k === "car" ? tx(t, "figPhMass_car", "car crash, 30 m/s") : k === "meteor" ? tx(t, "figPhMass_meteor", "meteorite, 20 km/s") : k}
          </Btn>)}
        </Row>
        <Row>
          <Readout color={C.sky}>{`${tx(t, "figPhMass_before", "before")}: E = 2γmc² = ${sci(2 * gamma, 6)} mc²`}</Readout>
          <Readout color={broken ? C.red : C.pink}>{`${tx(t, "figPhMass_after", "after")}: M = ${broken ? "2m" : "2γm"} = ${sci(M, 6)} kg`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figPhMass_gain", "mass gained")} = 2(γ − 1)m = ${sci(dM)} kg`}</Readout>
          {broken && <Readout color={C.red}>{`${tx(t, "figPhMass_missing", "energy missing")}: ${sci(missing)} J`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhMass_note", "Two 1 kg lumps of putty fly at each other at the same speed and stick together. The total momentum is zero before and after, so the merged lump ends up at rest. Where did the kinetic energy go? Into heat, the old answer says; relativity adds that heat has mass. Energy is conserved, and a lump at rest has energy Mc², so M = 2γm: the warm lump is heavier than the two cold ones by 2(γ − 1)m. At half the speed of light that is 0.31 kg. For a car crash it is about 10⁻¹⁴ kg, real but far beyond any scale, which is why mass seemed to be conserved for centuries. Break it by insisting that mass is conserved: the energy books no longer balance, and the missing amount is exactly the kinetic energy.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={20} y1={150} x2={W - 20} y2={150} stroke={C.axis} />
          {!hit && <>
            <circle cx={x(-1)} cy={150 - r1} r={r1} fill={C.sky} opacity={0.8} />
            <circle cx={x(1)} cy={150 - r1} r={r1} fill={C.sky} opacity={0.8} />
            <T x={x(-1)} y={150 - 2 * r1 - 8} anchor="middle" size={8.5} color={C.fg}>{`m → ${beta < 0.01 ? "" : `${f2(beta, 2)}c`}`}</T>
            <T x={x(1)} y={150 - 2 * r1 - 8} anchor="middle" size={8.5} color={C.fg}>{`← m`}</T>
          </>}
          {hit && <>
            <circle cx={280} cy={150 - rM} r={rM} fill={broken ? C.red : C.pink} opacity={0.85} />
            <T x={280} y={150 - 2 * rM - 8} anchor="middle" size={9} color={C.fg} bold>{`M = ${sci(M, 4)} kg`}</T>
          </>}
          <T x={20} y={190} size={8.5}>{tx(t, "figPhMass_key", "each lump: m = 1 kg at rest · after the hit: one lump, at rest")}</T>
          <T x={20} y={206} size={8.5}>{`γ = ${sci(gamma, 6)} · mc² = 9.0 × 10^16 J`}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => { if (time >= 2) setTime(0); setPlaying(p => !p); }} onReset={() => { setTime(0); setPlaying(false); }} />
      </div>
    </Figure>
  );
}

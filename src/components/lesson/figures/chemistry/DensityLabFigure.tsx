"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, C, T, f2, useFrame, useVisible } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Identify a material by its density, the way Archimedes is said to have
// tested a crown. Weigh the sample on a balance, then lower it into a
// measuring cylinder: the water rises by exactly the sample's volume, however
// odd its shape. ρ = m / V, with the uncertainty of two readings of ±0.2 mL,
// is matched against a table. The two gold-coloured nuggets have the same
// size: one is gold (19.3 g/cm³), the other pyrite, "fool's gold" (5.0).
// Break it: take the final water level as the volume and forget to subtract
// the starting 50 mL; every sample then looks lighter than water.

const W = 560, H = 290;
type Sample = { id: string; name: [string, string]; rho: number; V: number; color: string; shape: "nugget" | "block" | "bolt" };
const SAMPLES: Sample[] = [
  { id: "a", name: ["figChDen_a", "gold nugget A"], rho: 5.01, V: 8.0, color: "#d4b13b", shape: "nugget" },
  { id: "b", name: ["figChDen_b", "gold nugget B"], rho: 19.32, V: 8.0, color: "#eab308", shape: "nugget" },
  { id: "c", name: ["figChDen_c", "grey block 1"], rho: 2.70, V: 12.0, color: "#cbd5e1", shape: "block" },
  { id: "d", name: ["figChDen_d", "grey block 2"], rho: 11.34, V: 12.0, color: "#64748b", shape: "block" },
  { id: "e", name: ["figChDen_e", "reddish bolt"], rho: 8.96, V: 6.5, color: "#c2410c", shape: "bolt" },
  { id: "f", name: ["figChDen_f", "dark bolt"], rho: 7.87, V: 6.5, color: "#475569", shape: "bolt" },
];
const TABLE: [string, string, number][] = [
  ["al", "aluminium", 2.70], ["pyrite", "pyrite (fool's gold)", 5.01], ["fe", "iron", 7.87], ["cu", "copper", 8.96],
  ["ag", "silver", 10.49], ["pb", "lead", 11.34], ["au", "gold", 19.32],
];
const V0 = 50.0, READ = 0.2;                                 // starting water, reading uncertainty (mL)

function SampleShape({ s, x, y, k = 1 }: { s: Sample; x: number; y: number; k?: number }) {
  const z = Math.cbrt(s.V) * 6 * k;
  if (s.shape === "block") return <rect x={x - z} y={y - 1.4 * z} width={2 * z} height={1.4 * z} rx={1.5} fill={s.color} stroke="#0f172a" strokeOpacity={0.4} />;
  if (s.shape === "bolt") return (
    <g><rect x={x - z * 0.45} y={y - 2.2 * z} width={0.9 * z} height={1.6 * z} fill={s.color} stroke="#0f172a" strokeOpacity={0.4} />
      <rect x={x - z} y={y - 0.7 * z} width={2 * z} height={0.7 * z} rx={1} fill={s.color} stroke="#0f172a" strokeOpacity={0.4} /></g>
  );
  const pts = [[-1, 0], [-0.8, -0.9], [-0.2, -1.3], [0.6, -1.1], [1.05, -0.4], [0.8, 0]].map(([a, b]) => `${x + a * z},${y + b * z}`).join(" ");
  return <polygon points={pts} fill={s.color} stroke="#0f172a" strokeOpacity={0.4} />;
}

export function DensityLabFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState("a");
  const [weighed, setWeighed] = useState(false);
  const [drop, setDrop] = useState(0);                         // 0 = on the bench … 1 = at the bottom of the cylinder
  const [dropping, setDropping] = useState(false);
  const [noSub, setNoSub] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const s = SAMPLES.find(x => x.id === id)!;
  const m = s.rho * s.V;
  useFrame(dropping && vis.on, dt => setDrop(d => {
    const n = Math.min(1, d + dt * 0.8);
    if (n >= 1) setDropping(false);
    return n;
  }));

  const inWater = drop > 0.55;
  const after = V0 + (inWater ? s.V * Math.min(1, (drop - 0.55) / 0.2) : 0);
  const measured = drop >= 1;
  const V = noSub ? V0 + s.V : s.V;
  const rho = m / V, dRho = rho * ((2 * READ) / (noSub ? V0 + s.V : s.V));
  const best = TABLE.reduce((b, row) => (Math.abs(row[2] - rho) < Math.abs(b[2] - rho) ? row : b));
  const fits = TABLE.filter(row => Math.abs(row[2] - rho) <= dRho);

  const choose = (v: string) => { setId(v); setWeighed(false); setDrop(0); setDropping(false); };

  // ── Cylinder geometry: 0–100 mL
  const CX = 300, CW = 54, CT = 40, CB = 250;
  const yOf = (mL: number) => CB - (mL / 100) * (CB - CT);
  // first half: lifted from the balance over to the cylinder's mouth; second half: sinks to the bottom
  const u = drop / 0.5;
  const sampleX = drop < 0.5 ? lerpY(u, 100, CX) : CX;
  const sampleY = drop < 0.5 ? lerpY(u, 214, CT - 4) - 120 * Math.sin(Math.PI * Math.min(1, u)) * 0.6 : lerpY((drop - 0.5) / 0.5, CT - 4, CB - 4);

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* balance */}
      <rect x={30} y={226} width={140} height={34} rx={6} fill="var(--card)" stroke="var(--border)" />
      <rect x={50} y={218} width={100} height={8} rx={2} fill={C.axis} />
      <rect x={66} y={236} width={68} height={16} rx={3} fill="#0f172a" />
      <text x={128} y={248} fontSize={11} fontFamily="monospace" textAnchor="end" fill="#4ade80">{weighed && drop === 0 ? f2(m, 2) : "0.00"}</text>
      <text x={132} y={248} fontSize={8} fill="#4ade80">g</text>
      <T x={100} y={276} anchor="middle">{tx(t, "figChDen_balance", "balance (±0.01 g)")}</T>
      {drop === 0 && <SampleShape s={s} x={100} y={weighed ? 218 : 200} />}
      {drop === 0 && !weighed && <T x={100} y={160} anchor="middle" color={C.fg}>{tx(t, s.name[0], s.name[1])}</T>}

      {/* cylinder */}
      <rect x={CX - CW / 2} y={yOf(after)} width={CW} height={CB - yOf(after)} fill={C.sky} opacity={0.25} />
      <path d={`M${CX - CW / 2},${yOf(after)} Q${CX},${yOf(after) + 5} ${CX + CW / 2},${yOf(after)}`} fill="none" stroke={C.sky} strokeWidth={1.5} />
      {drop > 0 && <SampleShape s={s} x={sampleX} y={sampleY} k={0.85} />}
      <path d={`M${CX - CW / 2},${CT - 10} L${CX - CW / 2},${CB} L${CX + CW / 2},${CB} L${CX + CW / 2},${CT - 10}`} fill="none" stroke={C.fg} strokeWidth={1.4} />
      <rect x={CX - CW / 2 - 12} y={CB} width={CW + 24} height={6} rx={2} fill={C.axis} />
      {Array.from({ length: 21 }, (_, i) => i * 5).map(mL => (
        <g key={mL}>
          <line x1={CX + CW / 2 - (mL % 10 ? 7 : 13)} x2={CX + CW / 2} y1={yOf(mL)} y2={yOf(mL)} stroke={C.muted} strokeWidth={0.7} />
          {mL % 20 === 0 && <text x={CX + CW / 2 + 4} y={yOf(mL) + 3} fontSize={7} fill={C.muted}>{mL}</text>}
        </g>
      ))}
      <T x={CX} y={276} anchor="middle">{tx(t, "figChDen_cyl", "measuring cylinder (mL)")}</T>

      {/* results */}
      <g transform="translate(372,24)">
        <T x={0} y={0} color={C.fg} bold>{tx(t, "figChDen_readings", "readings")}</T>
        <T x={0} y={16}>{`m = ${weighed ? `${f2(m, 2)} g` : "?"}`}</T>
        <T x={0} y={30}>{`${tx(t, "figChDen_start", "water before")}: ${f2(V0, 1)} mL`}</T>
        <T x={0} y={44}>{`${tx(t, "figChDen_end", "water after")}: ${measured ? `${f2(after, 1)} mL` : "?"}`}</T>
        <T x={0} y={58} color={noSub ? C.red : C.fg}>{`V = ${measured ? (noSub ? `${f2(V0 + s.V, 1)} mL` : `${f2(after, 1)} − ${f2(V0, 1)} = ${f2(s.V, 1)} mL`) : "?"}`}</T>
        {weighed && measured && (
          <T x={0} y={78} color={noSub ? C.red : C.amber} size={11} bold>{`ρ = m/V = ${f2(rho, 2)} ± ${f2(dRho, 2)} g/cm³`}</T>
        )}
        <T x={0} y={104} color={C.fg} bold>{tx(t, "figChDen_tableHead", "known densities (g/cm³)")}</T>
        {TABLE.map(([key, en, r], i) => {
          const hit = weighed && measured && fits.includes(TABLE[i]);
          const near = weighed && measured && best[0] === key;
          return (
            <g key={key}>
              <rect x={-4} y={112 + i * 16} width={180} height={14} rx={3} fill={hit ? C.green : near ? C.amber : "transparent"} opacity={0.2} />
              <T x={0} y={122 + i * 16} color={hit ? C.green : C.fg}>{tx(t, `figChDen_m_${key}`, en)}</T>
              <T x={170} y={122 + i * 16} anchor="end" color={hit ? C.green : C.muted}>{f2(r, 2)}</T>
            </g>
          );
        })}
        {weighed && measured && (
          <T x={0} y={240} color={fits.length ? C.green : C.red} bold>{fits.length
            ? `${tx(t, "figChDen_match", "match")}: ${fits.map(f => tx(t, `figChDen_m_${f[0]}`, f[1])).join(", ")}`
            : `${tx(t, "figChDen_noMatch", "no material fits")} (${tx(t, "figChDen_closest", "closest")}: ${tx(t, `figChDen_m_${best[0]}`, best[1])})`}</T>
        )}
      </g>
    </svg>
  );

  return (
    <Figure title={tx(t, "figChDen_title", "Density lab: what is it made of?")}
      controls={<>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Choice value={id} onChange={choose} options={SAMPLES.map(x => [x.id, tx(t, x.name[0], x.name[1])] as const)} />
        </div>
        <Row>
          <Btn active={weighed} onClick={() => drop === 0 && setWeighed(true)}>{tx(t, "figChDen_weigh", "1. weigh it")}</Btn>
          <Btn active={drop > 0} onClick={() => { if (weighed && drop === 0) setDropping(true); }}>{tx(t, "figChDen_drop", "2. lower it into the water")}</Btn>
          <Btn onClick={() => choose(id)}>{tx(t, "figChDen_reset", "start again")}</Btn>
          <Btn active={noSub} onClick={() => setNoSub(v => !v)}>{tx(t, "figChDen_break", "break it: forget the starting 50 mL")}</Btn>
        </Row>
        {weighed && measured && <Row><Readout color={noSub ? C.red : C.green}>{noSub
          ? tx(t, "figChDen_brokenMsg", "the volume now includes the water: every sample comes out lighter than water and nothing in the table fits")
          : tx(t, "figChDen_okMsg", "the rise of the water is the sample's volume, whatever its shape")}</Readout></Row>}
      </>}
      note={tx(t, "figChDen_note", "Pick a sample, weigh it, then lower it into the water. A solid pushes aside exactly its own volume of water, so the rise of the level is its volume, even for a lumpy nugget no ruler could measure. Density is mass per volume, ρ = m/V, and it belongs to the material, not to the object: a gold ring and a gold bar share it. Compare the two nuggets: same size, same colour, but one is almost four times heavier. Each water reading is good to about ±0.2 mL, so the density comes with an uncertainty; the green rows are the materials inside it.")}>
      <div ref={vis.ref}>{view}</div>
    </Figure>
  );
}

function lerpY(u: number, a: number, b: number) { return a + (b - a) * Math.max(0, Math.min(1, u)); }

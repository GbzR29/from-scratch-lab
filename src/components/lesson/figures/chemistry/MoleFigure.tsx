"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Row, Readout, Slider, C, T, f2 } from "@/components/lesson/kit/figure";
import { BY_SYMBOL } from "./elements";
import { formula, sci } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// The mole as a counting unit. "Convert": pick a substance and a mass; the
// figure adds up the molar mass from the formula (count × atomic mass for each
// element), divides to get moles, multiplies by Avogadro's number to get
// particles, and says how long counting them one per second would take.
// "One mole of each": the same 6.022 × 10²³ particles of eight substances
// drawn to scale as cubes (side = ∛(M/ρ)); one mole of oxygen gas at room
// conditions fills a box almost 30 cm on a side, a mole of gold a 2 cm cube.

const NA = 6.02214076e23;
const W = 560, H = 290;

type Sub = { id: string; f: string; name: [string, string]; rho: number | null; color: string };
const SUBS: Sub[] = [
  { id: "water", f: "H2O", name: ["figChMol_water", "water"], rho: 0.997, color: C.sky },
  { id: "salt", f: "NaCl", name: ["figChMol_salt", "table salt"], rho: 2.165, color: "#cbd5e1" },
  { id: "sugar", f: "C12H22O11", name: ["figChMol_sugar", "sugar (sucrose)"], rho: 1.587, color: "#f5f5f4" },
  { id: "iron", f: "Fe", name: ["figChMol_iron", "iron"], rho: 7.874, color: "#78716c" },
  { id: "gold", f: "Au", name: ["figChMol_gold", "gold"], rho: 19.32, color: "#eab308" },
  { id: "al", f: "Al", name: ["figChMol_al", "aluminium"], rho: 2.70, color: "#a1a1aa" },
  { id: "diamond", f: "C", name: ["figChMol_diamond", "diamond (carbon)"], rho: 3.51, color: "#a5f3fc" },
  { id: "oxygen", f: "O2", name: ["figChMol_oxygen", "oxygen gas"], rho: null, color: C.red },
];
const GAS_L = 24.47;                                         // litres per mole of a gas at 25 °C and 1 atm

/** "C12H22O11" → [["C", 12], ["H", 22], ["O", 11]]. */
const parts = (f: string) => [...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(m => [m[1], m[2] ? +m[2] : 1] as [string, number]);
export const molarMass = (f: string) => parts(f).reduce((s, [sym, k]) => s + k * BY_SYMBOL[sym].mass, 0);
/** cm³ taken by one mole. */
const molarVolume = (s: Sub) => (s.rho ? molarMass(s.f) / s.rho : GAS_L * 1000);

export function MoleFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<"convert" | "compare">("convert");
  const [id, setId] = useState("water");
  const [logM, setLogM] = useState(Math.log10(18));
  const s = SUBS.find(x => x.id === id)!;
  const M = molarMass(s.f), m = 10 ** logM, n = m / M, N = n * NA;
  const atomsPer = parts(s.f).reduce((a, [, k]) => a + k, 0);
  const years = N / 3.156e7;
  const name = (x: Sub) => tx(t, x.name[0], x.name[1]);

  const convert = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <T x={20} y={26} color={C.fg} size={12} bold>{`${name(s)} · ${formula(s.f)}`}</T>
      <T x={20} y={48} color={C.muted}>{tx(t, "figChMol_step1", "1. molar mass M: add up the atomic masses in the formula")}</T>
      {parts(s.f).map(([sym, k], i) => (
        <T key={sym} x={36} y={66 + i * 15} color={C.fg}>{`${k} × ${sym} ${BY_SYMBOL[sym].mass} = ${f2(k * BY_SYMBOL[sym].mass, 3)} g/mol`}</T>
      ))}
      <T x={36} y={66 + parts(s.f).length * 15} color={C.amber} bold>{`M = ${f2(M, 3)} g/mol`}</T>

      <g transform="translate(0,140)">
        <rect x={20} y={0} width={150} height={56} rx={8} fill="var(--card)" stroke="var(--border)" />
        <T x={95} y={20} anchor="middle">{tx(t, "figChMol_mass", "mass m")}</T>
        <T x={95} y={42} anchor="middle" color={C.fg} size={14} bold>{`${sci(m, 3)} g`}</T>
        <T x={205} y={24} anchor="middle" color={C.amber}>{"÷ M"}</T>
        <line x1={175} x2={232} y1={30} y2={30} stroke={C.amber} strokeWidth={1.6} markerEnd="url(#chmol-arrow)" />
        <rect x={238} y={0} width={130} height={56} rx={8} fill="var(--card)" stroke="var(--border)" />
        <T x={303} y={20} anchor="middle">{tx(t, "figChMol_moles", "amount n")}</T>
        <T x={303} y={42} anchor="middle" color={C.fg} size={14} bold>{`${sci(n, 3)} mol`}</T>
        <T x={405} y={24} anchor="middle" color={C.green}>{"× Nₐ"}</T>
        <line x1={373} x2={432} y1={30} y2={30} stroke={C.green} strokeWidth={1.6} markerEnd="url(#chmol-arrow)" />
        <rect x={438} y={0} width={110} height={56} rx={8} fill="var(--card)" stroke="var(--border)" />
        <T x={493} y={20} anchor="middle">{tx(t, "figChMol_particles", "particles N")}</T>
        <T x={493} y={42} anchor="middle" color={C.fg} size={12} bold>{sci(N, 3)}</T>
      </g>
      <defs>
        <marker id="chmol-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={C.muted} />
        </marker>
      </defs>
      <T x={20} y={226} color={C.muted}>{`${tx(t, "figChMol_atoms", "atoms inside them")}: ${sci(N, 3)} × ${atomsPer} = ${sci(N * atomsPer, 3)}`}</T>
      <T x={20} y={244} color={C.muted}>{`${tx(t, "figChMol_count", "counting one per second would take")} ${sci(years, 2)} ${tx(t, "figChMol_years", "years")}`}</T>
      <T x={20} y={262} color={C.muted}>{`${tx(t, "figChMol_universe", "the universe is")} 1.38 × 10¹⁰ ${tx(t, "figChMol_years", "years")} ${tx(t, "figChMol_old", "old")}`}</T>
    </svg>
  );

  // ── One mole of each, to scale (cube side in cm = ∛V)
  const PX = 5.5, BASE = 262;
  let x = 34;
  const cubes = SUBS.map(sub => {
    const side = Math.cbrt(molarVolume(sub)) * PX;
    const c = { sub, x, side };
    x += side + 34;
    return c;
  });
  const compare = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={10} x2={W - 10} y1={BASE} y2={BASE} stroke={C.axis} />
      {cubes.map(({ sub, x: cx, side }, i) => {
        const V = molarVolume(sub), gas = !sub.rho;
        const top = BASE - side - (i % 2 && !gas ? 44 : 0);      // every other label raised so neighbours do not touch
        return (
          <g key={sub.id}>
            <rect x={cx} y={BASE - side} width={side} height={side} fill={sub.color} fillOpacity={gas ? 0.12 : 0.85}
              stroke={gas ? sub.color : "var(--code-gutter)"} strokeDasharray={gas ? "4 3" : undefined} />
            {top < BASE - side && <line x1={cx + side / 2} x2={cx + side / 2} y1={top - 2} y2={BASE - side - 2} stroke={C.grid} />}
            <T x={cx + side / 2} y={top - 30} anchor="middle" color={C.fg} bold>{formula(sub.f)}</T>
            <T x={cx + side / 2} y={top - 18} anchor="middle">{`${f2(molarMass(sub.f), 1)} g`}</T>
            <T x={cx + side / 2} y={top - 6} anchor="middle">{gas ? `${GAS_L} L` : `${f2(V, 1)} cm³`}</T>
          </g>
        );
      })}
      <line x1={W - 20 - 10 * PX} x2={W - 20} y1={BASE + 14} y2={BASE + 14} stroke={C.fg} strokeWidth={1.5} />
      <T x={W - 20 - 5 * PX} y={BASE + 26} anchor="middle" color={C.fg}>10 cm</T>
      <T x={14} y={BASE + 26}>{tx(t, "figChMol_same", `each holds ${sci(NA, 4)} particles`)}</T>
    </svg>
  );

  return (
    <Figure title={tx(t, "figChMol_title", "Counting by weighing: the mole")}
      head={<Choice value={mode} onChange={setMode} options={[["convert", tx(t, "figChMol_convert", "convert")], ["compare", tx(t, "figChMol_compare", "one mole of each")]]} />}
      controls={mode === "convert" ? <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Choice value={id} onChange={setId} options={SUBS.map(x => [x.id, formula(x.f)] as const)} />
        </div>
        <Slider label={tx(t, "figChMol_mSlider", "mass m")} value={logM} min={-3} max={3} step={0.01} onChange={setLogM} fmt={v => `${sci(10 ** v, 3)} g`} />
        <Row>
          <Readout color={C.amber}>{`n = m / M = ${sci(m, 3)} / ${f2(M, 2)} = ${sci(n, 3)} mol`}</Readout>
          <Readout color={C.green}>{`N = n × ${sci(NA, 4)}`}</Readout>
        </Row>
      </> : undefined}
      note={mode === "convert"
        ? tx(t, "figChMol_noteC", "Pick a substance and slide the mass. The molar mass comes straight from the formula and the periodic table: the mass of one mole, in grams, equals the formula's mass in u. Dividing by it turns grams into moles; multiplying by Avogadro's number turns moles into particles. Try 18 g of water: exactly one mole, about a tablespoon. Even a milligram of anything holds more particles than anyone could ever count.")
        : tx(t, "figChMol_noteM", "Every block holds the same number of particles: one mole. Their masses differ because the particles differ (a gold atom is 197 u, a water molecule 18 u), and their sizes differ again with density. The dashed box is one mole of oxygen gas at 25 °C and 1 atm: the molecules are so far apart that the same count fills almost 25 litres. Drawn to the same scale as the 10 cm bar.")}>
      {mode === "convert" ? convert : compare}
    </Figure>
  );
}

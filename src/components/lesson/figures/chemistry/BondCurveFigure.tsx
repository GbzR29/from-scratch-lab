"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A covalent bond as an energy curve. Two hydrogen atoms are brought together:
// their electron clouds overlap, the shared electrons gather between the
// nuclei, and the energy drops into a well. Too close and the two nuclei repel,
// so the energy shoots up again. The bottom of the well is the bond length
// (74 pm) and its depth the bond energy. H₂⁺ has one shared electron: a bond,
// half as deep and longer. Break it: two helium atoms bring four electrons,
// and the extra two cancel the bonding of the first two (molecular orbitals,
// next section): no well, no He₂. Curves are Morse fits to the measured
// constants (H₂: depth 4.75 eV, 74.1 pm; H₂⁺: 2.79 eV, 106 pm); He₂ is a plain
// repulsive wall (its real well, 0.001 eV deep, is too shallow to hold).

type Mol = "H2" | "H2+" | "He2";
const MOLS: Record<Mol, { label: string; electrons: number; De: number; re: number; a: number }> = {
  H2: { label: "H₂", electrons: 2, De: 4.75, re: 74, a: 0.0194 },
  "H2+": { label: "H₂⁺", electrons: 1, De: 2.79, re: 106, a: 0.0144 },
  He2: { label: "He₂", electrons: 4, De: 0, re: 0, a: 0 },
};
const energy = (m: Mol, r: number) => {
  const k = MOLS[m];
  if (m === "He2") return 6.5 * Math.exp(-(r - 50) / 21);
  const x = 1 - Math.exp(-k.a * (r - k.re));
  return k.De * x * x - k.De;
};

const W = 560, H = 270;

export function BondCurveFigure({ t }: { t?: TrackTranslations }) {
  const [mol, setMol] = useState<Mol>("H2");
  const [r, setR] = useState(200);
  const m = MOLS[mol];
  const e = energy(mol, r);
  const depth = mol === "He2" ? 0 : Math.max(0, -e / m.De);

  // ── The two atoms
  const S = 0.72, cy = 128, mid = 140;
  const x1 = mid - (r * S) / 2, x2 = mid + (r * S) / 2;
  const cloud = mol === "He2" ? 30 : 40;
  const nuc = mol === "He2" ? "+2" : "+1";
  const eDots: [number, number][] = [];
  if (mol === "H2+") eDots.push([depth > 0.3 ? mid : x1, cy - 4]);
  else if (mol === "H2") { const b = depth > 0.3; eDots.push([b ? mid - 4 : x1 - 14, cy - 6], [b ? mid + 4 : x2 + 14, cy + 6]); }
  else eDots.push([x1 - 14, cy - 8], [x1 - 14, cy + 8], [x2 + 14, cy - 8], [x2 + 14, cy + 8]);

  // ── The curve
  const PL = 318, PR = 530, PT = 34, PB = 228, R0 = 30, R1 = 300, E0 = -5.2, E1 = 3;
  const X = (v: number) => PL + ((v - R0) / (R1 - R0)) * (PR - PL);
  const Y = (v: number) => PT + ((E1 - Math.min(E1, v)) / (E1 - E0)) * (PB - PT);
  const pts: string[] = [];
  for (let v = R0; v <= R1; v += 2) pts.push(`${pts.length ? "L" : "M"}${X(v).toFixed(1)},${Y(energy(mol, v)).toFixed(1)}`);

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <radialGradient id="chBcCloud"><stop offset="0%" stopColor={C.sky} stopOpacity={0.45} /><stop offset="100%" stopColor={C.sky} stopOpacity={0} /></radialGradient>
      </defs>
      <circle cx={x1} cy={cy} r={cloud} fill="url(#chBcCloud)" />
      <circle cx={x2} cy={cy} r={mol === "H2+" ? 0 : cloud} fill="url(#chBcCloud)" />
      {depth > 0 && <ellipse cx={mid} cy={cy} rx={Math.max(8, (x2 - x1) / 2)} ry={14 + 10 * depth} fill={C.green} opacity={0.12 + 0.35 * depth} />}
      {[x1, x2].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={cy} r={8} fill={C.red} />
          <text x={x} y={cy + 3} fontSize={7.5} fontWeight={700} textAnchor="middle" fill="#fff">{nuc}</text>
        </g>
      ))}
      {eDots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.2} fill={C.sky} />)}
      <line x1={x1} x2={x2} y1={cy + 52} y2={cy + 52} stroke={C.muted} />
      <line x1={x1} x2={x1} y1={cy + 47} y2={cy + 57} stroke={C.muted} />
      <line x1={x2} x2={x2} y1={cy + 47} y2={cy + 57} stroke={C.muted} />
      <T x={mid} y={cy + 68} anchor="middle" color={C.fg}>{`r = ${r} pm`}</T>
      <T x={14} y={20} color={C.fg} size={12} bold>{m.label}</T>
      <T x={14} y={34}>{`${m.electrons} ${tx(t, "figChBc_electrons", "electron(s)")}`}</T>
      <T x={14} y={H - 12} color={mol === "He2" ? C.red : depth > 0.6 ? C.green : C.muted}>
        {mol === "He2" ? tx(t, "figChBc_noBond", "four electrons: the extra pair cancels the bond, the atoms just repel")
          : e > 0 ? tx(t, "figChBc_tooClose", "too close: the nuclei repel each other")
            : depth > 0.6 ? tx(t, "figChBc_shared", "shared electrons between the nuclei hold both")
              : tx(t, "figChBc_far", "far apart: two separate atoms")}
      </T>

      <line x1={PL} x2={PR} y1={Y(0)} y2={Y(0)} stroke={C.axis} />
      <line x1={PL} x2={PL} y1={PT} y2={PB} stroke={C.axis} />
      <T x={PL} y={PT - 10} color={C.fg} bold>{tx(t, "figChBc_plot", "energy (eV) against distance")}</T>
      {[2, 0, -2, -4].map(v => <T key={v} x={PL - 4} y={Y(v) + 3} anchor="end">{v > 0 ? `+${v}` : `${v}`}</T>)}
      {[50, 100, 150, 200, 250, 300].map(v => <T key={v} x={X(v)} y={PB + 12} anchor="middle">{v}</T>)}
      <T x={PR} y={PB + 26} anchor="end">r (pm)</T>
      <path d={pts.join(" ")} fill="none" stroke={mol === "He2" ? C.red : C.amber} strokeWidth={2} />
      {mol !== "He2" && (
        <g>
          <line x1={X(m.re)} x2={X(m.re)} y1={Y(0)} y2={Y(-m.De)} stroke={C.green} strokeDasharray="3 2" />
          <T x={X(m.re) + 4} y={Y(-m.De) + 14} color={C.green}>{`${m.re} pm`}</T>
          <T x={X(m.re) + 4} y={Y(-m.De / 2)} color={C.green}>{`${f2(m.De, 2)} eV`}</T>
        </g>
      )}
      <circle cx={X(r)} cy={Y(e)} r={5} fill={e < 0 ? C.green : C.red} />
    </svg>
  );

  return (
    <Figure title={tx(t, "figChBc_title", "Two atoms become a molecule")}
      controls={<>
        <Slider label={tx(t, "figChBc_r", "distance r")} value={r} min={R0} max={R1} step={1} onChange={setR} fmt={v => `${v} pm`} />
        <Row>
          <Btn active={mol === "H2"} onClick={() => setMol("H2")}>H₂</Btn>
          <Btn active={mol === "H2+"} onClick={() => setMol("H2+")}>H₂⁺</Btn>
          <Btn active={mol === "He2"} onClick={() => setMol("He2")}>{tx(t, "figChBc_break", "break it: He₂")}</Btn>
          <Btn onClick={() => setR(mol === "He2" ? 74 : m.re)}>{tx(t, "figChBc_bottom", "go to the bottom")}</Btn>
          <Readout color={e < 0 ? C.green : C.red}>{`E = ${f2(e, 2)} eV = ${f2(e * 96.485, 0)} kJ/mol`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChBc_note", "Slide the atoms together. Far apart, nothing happens: zero energy. As the clouds overlap, the two electrons spend more time between the nuclei, where both protons pull on them, and the energy drops. Push closer than 74 pm and the protons' repulsion wins: the curve shoots up. The molecule sits at the bottom, at the bond length; the depth is the energy needed to pull it apart. (A real molecule keeps vibrating even at the bottom, so it takes slightly less, 4.48 eV or 432 kJ/mol.) H₂⁺, with a single shared electron, still bonds, at half the depth. Two helium atoms bring four electrons, and the extra pair undoes the bond: helium stays a gas of single atoms.")}>
      {view}
    </Figure>
  );
}

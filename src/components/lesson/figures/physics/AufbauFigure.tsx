"use client";

import { useState, type ReactNode } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Building the atoms from hydrogen (Z = 1) to xenon (Z = 54) by adding one
// electron at a time. Left: the subshells in the order they fill (the
// Madelung n + l rule: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p), each orbital a box
// holding at most two electrons of opposite spin (Pauli). Inside a subshell
// the boxes fill singly first (Hund's rule). The big gaps after 1s and each
// p subshell end the rows of the periodic table. Real exceptions are used
// (Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag move an s electron into d).
// Right: the measured first ionisation energy, the energy to pull off the
// outermost electron (NIST values). It peaks at the noble gases, whose last
// subshell is full, and drops sharply at the alkali metals, which start a new
// row with one lonely s electron. Click a bar to pick that element.
// "break it: no Pauli" lets every electron drop into 1s: no shells, no rows,
// no chemistry.

const W = 560, H = 270;
const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe".split(" ");
const IE = [13.598, 24.587, 5.392, 9.323, 8.298, 11.26, 14.534, 13.618, 17.423, 21.565, 5.139, 7.646, 5.986, 8.152, 10.487, 10.36, 12.968, 15.76,
  4.341, 6.113, 6.561, 6.828, 6.746, 6.767, 7.434, 7.902, 7.881, 7.64, 7.726, 9.394, 5.999, 7.9, 9.789, 9.752, 11.814, 14.0,
  4.177, 5.695, 6.217, 6.634, 6.759, 7.092, 7.28, 7.361, 7.459, 8.337, 7.576, 8.994, 5.786, 7.344, 8.608, 9.01, 10.451, 12.13];
const SUBS = [["1s", 1], ["2s", 1], ["2p", 3], ["3s", 1], ["3p", 3], ["4s", 1], ["3d", 5], ["4p", 3], ["5s", 1], ["4d", 5], ["5p", 3]] as const;
const ROW_END = new Set(["1s", "2p", "3p", "4p", "5p"]);
const NOBLE = [2, 10, 18, 36, 54];
/** Measured ground states that break the simple order: [s subshell, its count, d subshell, its count]. */
const EXCEPT: Record<number, [string, number, string, number]> = {
  24: ["4s", 1, "3d", 5], 29: ["4s", 1, "3d", 10], 41: ["5s", 1, "4d", 4], 42: ["5s", 1, "4d", 5],
  44: ["5s", 1, "4d", 7], 45: ["5s", 1, "4d", 8], 46: ["5s", 0, "4d", 10], 47: ["5s", 1, "4d", 10],
};

function fill(Z: number): Record<string, number> {
  const out: Record<string, number> = {};
  let left = Z;
  for (const [name, orb] of SUBS) { const k = Math.min(left, 2 * orb); out[name] = k; left -= k; }
  const ex = EXCEPT[Z];
  if (ex) { out[ex[0]] = ex[1]; out[ex[2]] = ex[3]; }
  return out;
}

/** Arrows in each box of a subshell with e electrons: singly first, then paired. */
const boxes = (orb: number, e: number) => Array.from({ length: orb }, (_, i) => [i < e, i + orb < e] as const);

export function AufbauFigure({ t }: { t?: TrackTranslations }) {
  const [Z, setZ] = useState(26);
  const [broken, setBroken] = useState(false);
  const occ = fill(Z);

  // configuration with the noble-gas core, e.g. [Ar] 3d⁶ 4s²
  const core = [...NOBLE].reverse().find(n => n < Z);
  const coreOcc = core ? fill(core) : {};
  const order = SUBS.map(([n]) => n).sort((x, y) => Number(x[0]) - Number(y[0]) || "spdf".indexOf(x[1]) - "spdf".indexOf(y[1]));
  const config: ReactNode[] = broken ? [<span key="b">1s<sup>{Z}</sup></span>] : [
    ...(core ? [<span key="c">[{SYM[core - 1]}] </span>] : []),
    ...order.filter(n => occ[n] > 0 && occ[n] !== (coreOcc[n] ?? 0)).map(n => <span key={n}>{n}<sup>{occ[n]}</sup> </span>),
  ];

  // ladder geometry
  const LX = 54, BOX = 17, ly = (i: number) => H - 26 - i * 19 - [...SUBS.slice(0, i)].filter(([n]) => ROW_END.has(n)).length * 6;
  // chart geometry
  const CX0 = 262, CX1 = 552, CY0 = 40, CY1 = 222, bw = (CX1 - CX0) / 54;
  const cy = (e: number) => CY1 - (e / 25) * (CY1 - CY0);

  return (
    <Figure title={tx(t, "figPhAuf_title", "Building the periodic table one electron at a time")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhAuf_broken", "break it: no Pauli")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhAuf_Z", "atomic number Z")} value={Z} min={1} max={54} step={1} onChange={setZ} fmt={v => `${v} ${SYM[v - 1]}`} width="w-32" />
        <Row>
          <Readout color={C.amber}>{SYM[Z - 1]}: {config}</Readout>
          <Readout color={broken ? C.muted : C.sky}>{`${tx(t, "figPhAuf_ie", "ionisation energy")} ${f2(IE[Z - 1], 2)} eV`}</Readout>
          {broken && <Readout color={C.red}>{tx(t, "figPhAuf_brokenMsg", "all in 1s: every atom a closed ball, no rows, no chemistry")}</Readout>}
          {!broken && EXCEPT[Z] && <Readout color={C.purple}>{tx(t, "figPhAuf_exc", "exception: a half-full or full d subshell wins")}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhAuf_note", "Each orbital holds at most two electrons, one spin up and one spin down: that is the Pauli principle at work. So electrons cannot all crowd into the lowest level; they stack up. In atoms with many electrons, the inner electrons screen the nucleus, and orbitals that stay far out (higher l) feel less of its pull; so 2p sits above 2s and 4s fills before 3d. Slide Z up from 1. Each time a p subshell fills (He has only 1s), the next electron must jump across a big energy gap to start a new shell: those gaps are the ends of the rows, and the full shells are the noble gases, which barely react. Watch the ionisation chart: tall spikes at He, Ne, Ar, Kr, Xe, and a cliff right after each, at Li, Na, K, Rb, whose single outer electron is easy to remove. Elements in the same column have the same outer arrangement, so they behave alike. Break Pauli and every electron falls into 1s: no shells, no rows, no chemistry, and no you.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <T x={10} y={18} size={8}>{tx(t, "figPhAuf_ladder", "subshells, lowest at the bottom")}</T>
        {SUBS.map(([name, orb], i) => {
          const y = ly(i), e = broken ? (name === "1s" ? Z : 0) : occ[name];
          const full = e >= 2 * orb;
          return (
            <g key={name}>
              <T x={LX - 8} y={y + 4} anchor="end" size={9} color={e ? C.fg : C.muted} bold={e > 0}>{name}</T>
              {boxes(orb, broken ? 0 : e).map(([up, down], k) => {
                const x = LX + k * (BOX + 2);
                return (
                  <g key={k}>
                    <rect x={x} y={y - 7} width={BOX} height={14} rx={2} fill={full ? C.sky : "none"} fillOpacity={0.12} stroke={e ? C.fg : C.axis} strokeWidth={0.8} />
                    {up && <path d={`M${x + 5},${y + 5}V${y - 4}M${x + 2.5},${y - 1.5}L${x + 5},${y - 4.5}L${x + 7.5},${y - 1.5}`} stroke={C.sky} strokeWidth={1.4} fill="none" />}
                    {down && <path d={`M${x + 12},${y - 5}V${y + 4}M${x + 9.5},${y + 1.5}L${x + 12},${y + 4.5}L${x + 14.5},${y + 1.5}`} stroke={C.pink} strokeWidth={1.4} fill="none" />}
                  </g>
                );
              })}
              {broken && name === "1s" && <T x={LX + BOX + 8} y={y + 4} size={9} color={C.red} bold>{`× ${Z}`}</T>}
              {ROW_END.has(name) && i < SUBS.length - 1 && <line x1={LX - 30} y1={y - 12} x2={LX + 5 * (BOX + 2)} y2={y - 12} stroke={C.axis} strokeDasharray="2 3" />}
            </g>
          );
        })}

        {/* ionisation energies */}
        <g opacity={broken ? 0.3 : 1}>
          <line x1={CX0} y1={CY1} x2={CX1} y2={CY1} stroke={C.axis} />
          <line x1={CX0} y1={CY0} x2={CX0} y2={CY1} stroke={C.axis} />
          {[0, 5, 10, 15, 20, 25].map(e => <T key={e} x={CX0 - 4} y={cy(e) + 3} anchor="end" size={7.5}>{e}</T>)}
          {IE.map((e, i) => {
            const x = CX0 + i * bw, here = i + 1 === Z;
            return (
              <rect key={i} x={x + 0.5} y={cy(e)} width={bw - 1} height={CY1 - cy(e)} style={{ cursor: "pointer" }}
                fill={here ? C.amber : NOBLE.includes(i + 1) ? C.sky : C.muted} opacity={here ? 1 : 0.55}
                onClick={() => setZ(i + 1)} />
            );
          })}
          {NOBLE.map(n => <T key={n} x={CX0 + (n - 0.5) * bw} y={cy(IE[n - 1]) - 4} anchor="middle" size={8} color={C.sky}>{SYM[n - 1]}</T>)}
          {[3, 11, 19, 37].map(n => <T key={n} x={CX0 + (n - 0.5) * bw} y={cy(IE[n - 1]) - 4} anchor="middle" size={8} color={C.muted}>{SYM[n - 1]}</T>)}
          <T x={CX0} y={CY0 - 14} size={8}>{tx(t, "figPhAuf_chart", "first ionisation energy (eV), click a bar")}</T>
          <T x={CX1} y={CY1 + 14} anchor="end" size={8}>{"Z = 1 … 54"}</T>
        </g>
        <T x={CX0 + 150} y={CY0 + 6} anchor="middle" size={26} color={C.amber} bold>{SYM[Z - 1]}</T>
        <T x={CX0 + 150} y={CY0 + 22} anchor="middle" size={8.5}>{`Z = ${Z}`}</T>
      </svg>
    </Figure>
  );
}

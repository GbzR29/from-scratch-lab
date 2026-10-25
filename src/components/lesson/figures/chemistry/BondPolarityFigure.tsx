"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, T, f2 } from "@/components/lesson/kit/figure";
import { BY_SYMBOL } from "./elements";
import { elementName } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// From covalent to ionic as one scale. Pick two atoms: the shared electron
// pair (the cloud between them) slides toward the more electronegative one,
// by Pauling's estimate of the ionic character, 1 − e^(−Δχ²/4). Equal atoms
// share evenly (nonpolar); a modest difference gives partial charges δ+ and
// δ− and a bond dipole (the crossed arrow points to the negative end); a
// large difference all but hands the pair over: an ionic bond. The bar below
// places the bond on the continuum with familiar examples. Electronegativities
// are Pauling's (elements.ts).

const SYMS = ["H", "Li", "Na", "K", "Cs", "Mg", "C", "N", "O", "F", "S", "Cl", "Br", "I"];
const EXAMPLES: [string, number][] = [["H–H", 0], ["C–H", 0.35], ["H–Cl", 0.96], ["O–H", 1.24], ["H–F", 1.78], ["NaCl", 2.23], ["CsF", 3.19]];
const W = 560, H = 250;

export function BondPolarityFigure({ t }: { t?: TrackTranslations }) {
  const [a, setA] = useState("H");
  const [b, setB] = useState("Cl");
  const A = BY_SYMBOL[a], B = BY_SYMBOL[b];
  const ea = A.en ?? 0, eb = B.en ?? 0;
  const d = Math.abs(ea - eb);
  const ionic = 1 - Math.exp(-(d * d) / 4);
  const towardB = eb > ea ? 1 : eb < ea ? -1 : 0;
  const kind = d < 0.4 ? "nonpolar" : d < 1.8 ? "polar" : "ionic";

  // ── The bond
  const xa = 150, xb = 330, cy = 92;
  const ra = Math.max(14, (A.rCov ?? 60) * 0.22), rb = Math.max(14, (B.rCov ?? 60) * 0.22);
  const cloudX = (xa + xb) / 2 + towardB * ionic * ((xb - xa) / 2);
  const neg = towardB > 0 ? xb : xa, pos = towardB > 0 ? xa : xb;

  // ── The continuum
  const BL = 40, BR = 520, BY = 190, DMAX = 3.3;
  const bx = (v: number) => BL + (Math.min(v, DMAX) / DMAX) * (BR - BL);

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <radialGradient id="chBpCloud"><stop offset="0%" stopColor={C.sky} stopOpacity={0.6} /><stop offset="100%" stopColor={C.sky} stopOpacity={0} /></radialGradient>
      </defs>
      <ellipse cx={cloudX} cy={cy} rx={90 - 40 * ionic} ry={46 - 10 * ionic} fill="url(#chBpCloud)" />
      {[[xa, ra, A], [xb, rb, B]].map(([x, rr, e], i) => {
        const el = e as typeof A;
        return (
          <g key={i}>
            <circle cx={x as number} cy={cy} r={rr as number} fill="var(--card)" stroke={C.fg} strokeOpacity={0.6} />
            <text x={x as number} y={cy + 5} fontSize={14} fontWeight={700} textAnchor="middle" fill="var(--text-main)">{el.sym}</text>
            <T x={x as number} y={cy + (rr as number) + 34} anchor="middle">{`χ = ${f2(el.en ?? 0, 2)}`}</T>
          </g>
        );
      })}
      <circle cx={cloudX} cy={cy - 5} r={3} fill={C.sky} />
      <circle cx={cloudX} cy={cy + 5} r={3} fill={C.sky} />
      {kind !== "nonpolar" && (
        <g>
          <T x={pos} y={cy - 40} anchor="middle" color={C.red} size={13} bold>{kind === "ionic" ? "+" : "δ+"}</T>
          <T x={neg} y={cy - 40} anchor="middle" color={C.blue} size={13} bold>{kind === "ionic" ? "−" : "δ−"}</T>
          {/* bond dipole: crossed arrow from the positive to the negative end */}
          <line x1={pos} x2={neg - Math.sign(neg - pos) * 10} y1={cy + 62} y2={cy + 62} stroke={C.purple} strokeWidth={2} />
          <path d={`M${neg - Math.sign(neg - pos) * 12},${cy + 56} L${neg},${cy + 62} L${neg - Math.sign(neg - pos) * 12},${cy + 68}`} fill="none" stroke={C.purple} strokeWidth={2} />
          <line x1={pos + Math.sign(neg - pos) * 10} x2={pos + Math.sign(neg - pos) * 10} y1={cy + 56} y2={cy + 68} stroke={C.purple} strokeWidth={2} />
        </g>
      )}
      <T x={14} y={20} color={C.fg} size={12} bold>{`${elementName(t, A)} – ${elementName(t, B)}`}</T>
      <T x={14} y={34} color={kind === "ionic" ? C.amber : kind === "polar" ? C.purple : C.green} bold>
        {kind === "ionic" ? tx(t, "figChBp_ionic", "mostly ionic: the pair has almost moved over")
          : kind === "polar" ? tx(t, "figChBp_polar", "polar covalent: shared unequally")
            : tx(t, "figChBp_nonpolar", "nonpolar covalent: shared (almost) evenly")}
      </T>

      <rect x={bx(0)} y={BY} width={bx(0.4) - bx(0)} height={10} fill={C.green} opacity={0.5} />
      <rect x={bx(0.4)} y={BY} width={bx(1.8) - bx(0.4)} height={10} fill={C.purple} opacity={0.45} />
      <rect x={bx(1.8)} y={BY} width={bx(DMAX) - bx(1.8)} height={10} fill={C.amber} opacity={0.5} />
      <T x={bx(0.2)} y={BY - 16} anchor="middle" size={8}>{tx(t, "figChBp_zNon", "nonpolar")}</T>
      <T x={bx(1.1)} y={BY - 16} anchor="middle" size={8}>{tx(t, "figChBp_zPol", "polar covalent")}</T>
      <T x={bx(2.55)} y={BY - 16} anchor="middle" size={8}>{tx(t, "figChBp_zIon", "ionic")}</T>
      {EXAMPLES.map(([lab, v], i) => (
        <g key={lab}>
          <line x1={bx(v)} x2={bx(v)} y1={BY + 10} y2={BY + 16} stroke={C.muted} />
          <T x={bx(v)} y={BY + 26 + (i % 2) * 11} anchor="middle" size={8}>{lab}</T>
        </g>
      ))}
      <path d={`M${bx(d)},${BY - 2} l-6,-10 h12 z`} fill={C.fg} />
      <T x={BR} y={H - 6} anchor="end" size={8}>{tx(t, "figChBp_axis", "electronegativity difference Δχ")}</T>
    </svg>
  );

  const picker = (label: string, cur: string, set: (s: string) => void) => (
    <Row>
      <span className="text-[10px] font-mono text-[var(--text-muted)] w-14">{label}</span>
      {SYMS.map(s => <Btn key={s} active={cur === s} onClick={() => set(s)}>{s}</Btn>)}
    </Row>
  );

  return (
    <Figure title={tx(t, "figChBp_title", "Bond polarity: from sharing to handing over")}
      controls={<>
        {picker(tx(t, "figChBp_a", "atom 1"), a, setA)}
        {picker(tx(t, "figChBp_b", "atom 2"), b, setB)}
        <Row>
          <Readout>{`Δχ = ${f2(d, 2)}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figChBp_char", "ionic character")} ≈ ${f2(ionic * 100, 0)}%`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChBp_note", "Pick any two atoms. The blue cloud is the bonding pair. With equal electronegativities (H–H, Cl–Cl) it sits in the middle. As the difference Δχ grows, the more electronegative atom pulls the pair closer: it gets a partial negative charge δ−, its partner δ+, and the bond has a dipole, drawn as an arrow with a crossed tail pointing to the negative end. Pauling estimated the ionic character as 1 − e^(−Δχ²/4): 3% for C–H, 21% for H–Cl, 55% for H–F, 71% for NaCl. There is no sharp border: the 0.4 and 1.8 marks are conventions, and every bond is somewhere on one continuous scale.")}>
      {view}
    </Figure>
  );
}

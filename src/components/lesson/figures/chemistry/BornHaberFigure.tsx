"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, T, clamp, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// The Born–Haber cycle: making a salt from its elements by an imaginary path
// whose every step can be measured, as an energy ladder. Atomise the metal,
// ionise it, atomise the nonmetal, add the electron(s), then let the gas ions
// fall together into the crystal (the lattice energy). The steps add up to the
// measured enthalpy of formation, since energy does not depend on the path
// (Hess's law, Thermochemistry section). Every step but the last costs energy
// or barely pays; the lattice step pays for all of them. Break it: leave the
// lattice out and the "salt" ends up far above the elements: it would never form.
// Data (kJ/mol, 298 K): NIST-JANAF / CRC enthalpies; ionisation energies and
// electron affinities converted from eV; the lattice energy closes the cycle.
// O's second electron affinity cannot be measured: +744 is the usual estimate.

type Step = { eq: string; dh: number; key: string; en: string };
type Salt = { id: string; start: string; steps: Step[]; product: string; hf: number };

const SALTS: Salt[] = [
  { id: "NaCl", start: "Na(s) + ½Cl₂(g)", product: "NaCl(s)", hf: -411, steps: [
    { eq: "Na(s) → Na(g)", dh: 107, key: "sub", en: "atomise the metal (sublimation)" },
    { eq: "Na(g) → Na⁺(g) + e⁻", dh: 496, key: "ie", en: "ionisation energy" },
    { eq: "½Cl₂(g) → Cl(g)", dh: 122, key: "atom", en: "break half a Cl–Cl bond" },
    { eq: "Cl(g) + e⁻ → Cl⁻(g)", dh: -349, key: "ea", en: "electron affinity" },
    { eq: "Na⁺(g) + Cl⁻(g) → NaCl(s)", dh: -787, key: "lat", en: "lattice energy: ions form the crystal" },
  ] },
  { id: "KCl", start: "K(s) + ½Cl₂(g)", product: "KCl(s)", hf: -437, steps: [
    { eq: "K(s) → K(g)", dh: 89, key: "sub", en: "atomise the metal (sublimation)" },
    { eq: "K(g) → K⁺(g) + e⁻", dh: 419, key: "ie", en: "ionisation energy" },
    { eq: "½Cl₂(g) → Cl(g)", dh: 122, key: "atom", en: "break half a Cl–Cl bond" },
    { eq: "Cl(g) + e⁻ → Cl⁻(g)", dh: -349, key: "ea", en: "electron affinity" },
    { eq: "K⁺(g) + Cl⁻(g) → KCl(s)", dh: -718, key: "lat", en: "lattice energy: ions form the crystal" },
  ] },
  { id: "LiF", start: "Li(s) + ½F₂(g)", product: "LiF(s)", hf: -616, steps: [
    { eq: "Li(s) → Li(g)", dh: 159, key: "sub", en: "atomise the metal (sublimation)" },
    { eq: "Li(g) → Li⁺(g) + e⁻", dh: 520, key: "ie", en: "ionisation energy" },
    { eq: "½F₂(g) → F(g)", dh: 79, key: "atomF", en: "break half an F–F bond" },
    { eq: "F(g) + e⁻ → F⁻(g)", dh: -328, key: "ea", en: "electron affinity" },
    { eq: "Li⁺(g) + F⁻(g) → LiF(s)", dh: -1046, key: "lat", en: "lattice energy: ions form the crystal" },
  ] },
  { id: "MgO", start: "Mg(s) + ½O₂(g)", product: "MgO(s)", hf: -602, steps: [
    { eq: "Mg(s) → Mg(g)", dh: 147, key: "sub", en: "atomise the metal (sublimation)" },
    { eq: "Mg(g) → Mg⁺(g) + e⁻", dh: 738, key: "ie", en: "ionisation energy" },
    { eq: "Mg⁺(g) → Mg²⁺(g) + e⁻", dh: 1451, key: "ie2", en: "second ionisation energy" },
    { eq: "½O₂(g) → O(g)", dh: 249, key: "atomO", en: "break half an O=O bond" },
    { eq: "O(g) + e⁻ → O⁻(g)", dh: -141, key: "ea", en: "electron affinity" },
    { eq: "O⁻(g) + e⁻ → O²⁻(g)", dh: 744, key: "ea2", en: "2nd electron: repelled (estimate)" },
    { eq: "Mg²⁺(g) + O²⁻(g) → MgO(s)", dh: -3790, key: "lat", en: "lattice energy: ions form the crystal" },
  ] },
];

const W = 560, H = 300;
const sgn = (v: number) => `${v > 0 ? "+" : "−"}${Math.abs(v)}`;

export function BornHaberFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState("NaCl");
  const [noLattice, setNoLattice] = useState(false);
  const [p, setP] = useState(0);                       // progress: k.x = step k drawn to fraction x
  const [playing, setPlaying] = useState(false);
  const vis = useVisible<HTMLDivElement>();

  const salt = SALTS.find(s => s.id === id)!;
  const steps = noLattice ? salt.steps.filter(s => s.key !== "lat") : salt.steps;
  const n = steps.length;
  const levels = [0];
  for (const s of steps) levels.push(levels[levels.length - 1] + s.dh);
  const end = levels[n];

  useFrame(playing && vis.on, dt => {
    setP(v => {
      const next = Math.min(n + 1, v + dt * 0.9);
      if (next >= n + 1) setPlaying(false);
      return next;
    });
  });
  const restart = (s: string, nl: boolean) => { setId(s); setNoLattice(nl); setP(0); setPlaying(false); };

  // ── Energy ladder
  const L = 54, R = 352, TOP = 46, BOT = 268;
  const lo = Math.min(...levels, salt.hf), hi = Math.max(...levels);
  const Y = (v: number) => BOT - ((v - lo) / (hi - lo || 1)) * (BOT - TOP);
  const col = (R - L) / (n + 1);
  const X = (k: number) => L + col * (k + 0.5);
  const cur = Math.min(n - 1, Math.floor(p));
  const shown = p >= n ? null : steps[cur];
  const doneAll = p >= n;

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={L - 8} x2={L - 8} y1={TOP - 6} y2={BOT + 6} stroke={C.axis} />
      <T x={L - 12} y={Y(0) + 3} anchor="end">0</T>
      <T x={L - 12} y={TOP - 12} anchor="start" color={C.fg}>{tx(t, "figChBh_axis", "energy (kJ/mol)")}</T>
      <line x1={L - 8} x2={R} y1={Y(0)} y2={Y(0)} stroke={C.grid} strokeDasharray="3 3" />
      <T x={X(0) + 8} y={Y(0) + 13} color={C.fg}>{salt.start}</T>

      {steps.map((s, k) => {
        const f = clamp(p - k, 0, 1);
        if (f <= 0) return null;
        const y0 = Y(levels[k]), y1 = Y(levels[k] + s.dh * f), x = X(k);
        const color = s.dh > 0 ? C.amber : s.key === "lat" ? C.green : C.sky;
        const up = s.dh > 0;
        return (
          <g key={k}>
            <line x1={x} x2={x} y1={y0} y2={y1} stroke={color} strokeWidth={k === cur && !doneAll ? 3 : 2} />
            <path d={`M${x - 4},${y1 + (up ? 6 : -6)} L${x},${y1} L${x + 4},${y1 + (up ? 6 : -6)}`} fill="none" stroke={color} strokeWidth={2} />
            {f >= 1 && <line x1={x - col * 0.35} x2={x + col * 0.85} y1={Y(levels[k + 1])} y2={Y(levels[k + 1])} stroke={C.muted} />}
            <T x={x + 4} y={(y0 + Y(levels[k + 1])) / 2 + 3} color={color} bold>{sgn(s.dh)}</T>
          </g>
        );
      })}

      {/* the measured formation enthalpy, straight from the elements */}
      {doneAll && !noLattice && (
        <g>
          <line x1={X(n) + 6} x2={X(n) + 6} y1={Y(0)} y2={Y(salt.hf)} stroke={C.purple} strokeWidth={2.5} />
          <path d={`M${X(n) + 2},${Y(salt.hf) - 6} L${X(n) + 6},${Y(salt.hf)} L${X(n) + 10},${Y(salt.hf) - 6}`} fill="none" stroke={C.purple} strokeWidth={2.5} />
          <line x1={X(n) - col * 0.5} x2={R} y1={Y(salt.hf)} y2={Y(salt.hf)} stroke={C.purple} />
          <T x={X(n) - col * 0.5} y={Y(salt.hf) + 13} color={C.purple} bold>{`${salt.product}  ${sgn(salt.hf)}`}</T>
        </g>
      )}
      {doneAll && noLattice && (
        <T x={X(n - 1)} y={Y(end) - 10} anchor="middle" color={C.red} bold>{`${tx(t, "figChBh_gasIons", "gas ions")}  ${sgn(end)}`}</T>
      )}

      {/* the step list */}
      <T x={372} y={24} color={C.fg} bold>{tx(t, "figChBh_list", "the path, step by step")}</T>
      {steps.map((s, k) => {
        const on = p > k, color = s.dh > 0 ? C.amber : s.key === "lat" ? C.green : C.sky;
        return (
          <g key={k} opacity={on ? 1 : 0.35}>
            <T x={372} y={44 + k * 30} color={on ? C.fg : C.muted}>{s.eq}</T>
            <T x={548} y={44 + k * 30} anchor="end" color={color} bold>{sgn(s.dh)}</T>
            <T x={372} y={56 + k * 30} size={8}>{tx(t, `figChBh_s_${s.key}`, s.en)}</T>
          </g>
        );
      })}
      <line x1={372} x2={548} y1={44 + n * 30 - 12} y2={44 + n * 30 - 12} stroke={C.grid} />
      <T x={372} y={44 + n * 30 + 2} color={C.fg} bold>{tx(t, "figChBh_sum", "sum")}</T>
      <T x={548} y={44 + n * 30 + 2} anchor="end" color={noLattice ? C.red : C.purple} bold>{doneAll ? `${sgn(end)} kJ/mol` : "…"}</T>
      {doneAll && !noLattice && <T x={372} y={58 + n * 30} size={8} color={C.purple}>{tx(t, "figChBh_match", "= the measured enthalpy of formation")}</T>}
      {doneAll && noLattice && <T x={372} y={58 + n * 30} size={8} color={C.red}>{tx(t, "figChBh_noForm", "uphill: without the lattice, no salt")}</T>}

      {shown && p > 0 && (
        <T x={L} y={H - 8} color={C.fg}>{`${cur + 1}/${n}: ${tx(t, `figChBh_s_${shown.key}`, shown.en)}`}</T>
      )}
    </svg>
  );

  return (
    <Figure title={tx(t, "figChBh_title", "Born–Haber cycle: where a salt's energy comes from")}
      controls={<>
        <Row>
          {SALTS.map(s => <Btn key={s.id} active={id === s.id} onClick={() => restart(s.id, noLattice)}>{s.id}</Btn>)}
          <Btn active={noLattice} onClick={() => restart(id, !noLattice)}>{tx(t, "figChBh_break", "break it: no lattice")}</Btn>
        </Row>
        <Row>
          <Readout>{`${tx(t, "figChBh_costs", "costs")}: ${sgn(steps.filter(s => s.dh > 0).reduce((a, s) => a + s.dh, 0))}`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figChBh_lattice", "lattice")}: ${noLattice ? "—" : sgn(salt.steps.find(s => s.key === "lat")!.dh)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChBh_note", "Press play, or step through. Up arrows cost energy (amber), down arrows release it (blue for the electron affinity, green for the lattice). Making the gas ions is always uphill: for NaCl it costs 107 + 496 + 122 − 349 = +376 kJ/mol. Then the ions fall together into the crystal and release 787 kJ/mol, much more than all the costs, and the total lands at −411 kJ/mol, exactly what a calorimeter measures when sodium burns in chlorine. Compare MgO: the second ionisation energy of magnesium and the second electron of oxygen are huge costs, yet MgO forms readily, because doubly charged ions attract four times as strongly and the lattice energy is almost five times NaCl's.")}>
      <div ref={vis.ref}>
        {view}
        <Transport t={t} playing={playing} onPlay={() => { if (p >= n + 1) setP(0); setPlaying(v => !v); }}
          onStep={() => { setPlaying(false); setP(v => Math.min(n + 1, Math.floor(v) + 1)); }}
          onBack={() => { setPlaying(false); setP(v => Math.max(0, Math.ceil(v) - 1)); }}
          onReset={() => { setPlaying(false); setP(0); }}
          readout={`${Math.min(n, Math.floor(p))}/${n}`} />
      </div>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The bookkeeping of particle reactions. Pick a reaction; the table adds up
// each conserved quantity before and after:
//   charge Q, baryon number B (quarks count 1/3), electron number L_e and
//   muon number L_μ (leptons +1, antileptons −1), and energy: a decay can
//   only happen if the particle weighs more than its products (masses in
//   MeV, PDG); a collision can supply the difference as kinetic energy.
// Strangeness S is conserved by the strong and electromagnetic forces but
// the weak force may change it by one, so a change is marked "weak only".
// Every reaction that balances is seen; every one that does not, never is.

const W = 560, H = 272;
type Part = { q: number; B: number; Le: number; Lm: number; S: number; m: number };
const P: Record<string, Part> = {
  "e⁻": { q: -1, B: 0, Le: 1, Lm: 0, S: 0, m: 0.511 }, "e⁺": { q: 1, B: 0, Le: -1, Lm: 0, S: 0, m: 0.511 },
  "νe": { q: 0, B: 0, Le: 1, Lm: 0, S: 0, m: 0 }, "ν̄e": { q: 0, B: 0, Le: -1, Lm: 0, S: 0, m: 0 },
  "μ⁻": { q: -1, B: 0, Le: 0, Lm: 1, S: 0, m: 105.66 }, "μ⁺": { q: 1, B: 0, Le: 0, Lm: -1, S: 0, m: 105.66 },
  "νμ": { q: 0, B: 0, Le: 0, Lm: 1, S: 0, m: 0 }, "ν̄μ": { q: 0, B: 0, Le: 0, Lm: -1, S: 0, m: 0 },
  "p": { q: 1, B: 1, Le: 0, Lm: 0, S: 0, m: 938.27 }, "n": { q: 0, B: 1, Le: 0, Lm: 0, S: 0, m: 939.57 },
  "π⁺": { q: 1, B: 0, Le: 0, Lm: 0, S: 0, m: 139.57 }, "π⁻": { q: -1, B: 0, Le: 0, Lm: 0, S: 0, m: 139.57 },
  "π⁰": { q: 0, B: 0, Le: 0, Lm: 0, S: 0, m: 134.98 }, "γ": { q: 0, B: 0, Le: 0, Lm: 0, S: 0, m: 0 },
  "Λ": { q: 0, B: 1, Le: 0, Lm: 0, S: -1, m: 1115.68 }, "K⁻": { q: -1, B: 0, Le: 0, Lm: 0, S: -1, m: 493.68 },
};
type Rx = { id: string; a: string[]; b: string[]; force?: "strong" | "em" | "weak" };
const RX: Rx[] = [
  { id: "n", a: ["n"], b: ["p", "e⁻", "ν̄e"], force: "weak" },
  { id: "nNoNu", a: ["n"], b: ["p", "e⁻"] },
  { id: "pDecay", a: ["p"], b: ["e⁺", "π⁰"] },
  { id: "pBeta", a: ["p"], b: ["n", "e⁺", "νe"] },
  { id: "mu", a: ["μ⁻"], b: ["e⁻", "ν̄e", "νμ"], force: "weak" },
  { id: "muGamma", a: ["μ⁻"], b: ["e⁻", "γ"] },
  { id: "pi", a: ["π⁺"], b: ["μ⁺", "νμ"], force: "weak" },
  { id: "pi0", a: ["π⁰"], b: ["γ", "γ"], force: "em" },
  { id: "annih", a: ["e⁺", "e⁻"], b: ["γ", "γ"], force: "em" },
  { id: "ppPi", a: ["p", "p"], b: ["p", "p", "π⁰"], force: "strong" },
  { id: "lambda", a: ["Λ"], b: ["p", "π⁻"], force: "weak" },
  { id: "kp", a: ["K⁻", "p"], b: ["Λ", "π⁰"], force: "strong" },
];

export function ReactionFigure({ t }: { t?: TrackTranslations }) {
  const [pick, setPick] = useState(0);
  const rx = RX[pick];
  const sum = (list: string[], k: keyof Part) => list.reduce((a, n) => a + P[n][k], 0);
  const decay = rx.a.length === 1;
  const mA = sum(rx.a, "m"), mB = sum(rx.b, "m");

  type Row_ = { name: string; before: number; after: number; ok: boolean; soft?: boolean; fmt?: (v: number) => string };
  const sig = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
  const rows: Row_[] = [
    { name: tx(t, "figPhRx_q", "charge"), before: sum(rx.a, "q"), after: sum(rx.b, "q"), ok: true, fmt: sig },
    { name: tx(t, "figPhRx_B", "baryon number"), before: sum(rx.a, "B"), after: sum(rx.b, "B"), ok: true, fmt: sig },
    { name: tx(t, "figPhRx_Le", "electron number"), before: sum(rx.a, "Le"), after: sum(rx.b, "Le"), ok: true, fmt: sig },
    { name: tx(t, "figPhRx_Lm", "muon number"), before: sum(rx.a, "Lm"), after: sum(rx.b, "Lm"), ok: true, fmt: sig },
    { name: tx(t, "figPhRx_S", "strangeness"), before: sum(rx.a, "S"), after: sum(rx.b, "S"), ok: true, soft: true, fmt: sig },
  ];
  for (const r of rows) r.ok = r.before === r.after;
  const energyOk = !decay || mA >= mB;
  const broken = rows.filter(r => !r.ok && !r.soft).map(r => r.name);
  if (!energyOk) broken.push(tx(t, "figPhRx_E", "energy"));
  const sChanges = !rows[4].ok;

  const VERDICT: Record<string, string> = {
    n: tx(t, "figPhRx_vN", "Seen: the decay of a free neutron, mean life 879 s. The weak force turns a down quark into an up quark."),
    nNoNu: tx(t, "figPhRx_vNoNu", "Never seen: electron number goes from 0 to 1. This is why Pauli proposed the neutrino in 1930."),
    pDecay: tx(t, "figPhRx_vP", "Never seen: baryon number would vanish. Water tanks of 50 000 tonnes show the proton lives longer than 2.4 × 10³⁴ years."),
    pBeta: tx(t, "figPhRx_vPb", "Impossible for a free proton, which is lighter than a neutron plus a positron. Inside a proton-rich nucleus the nucleus pays the difference: beta-plus decay."),
    mu: tx(t, "figPhRx_vMu", "Seen: the muon decays in 2.2 µs, by the weak force, with two neutrinos to carry off electron and muon number."),
    muGamma: tx(t, "figPhRx_vMuG", "Never seen (fewer than 1 in 3 × 10¹² muon decays): electron and muon number would each change. The total lepton number balances, but each family is kept separately."),
    pi: tx(t, "figPhRx_vPi", "Seen: the charged pion's main decay, mean life 26 ns."),
    pi0: tx(t, "figPhRx_vPi0", "Seen: the neutral pion decays into two photons in 8.5 × 10⁻¹⁷ s, by the electromagnetic force."),
    annih: tx(t, "figPhRx_vAnn", "Seen: an electron and a positron annihilate into two photons of 511 keV each, the signal used in PET scans."),
    ppPi: tx(t, "figPhRx_vPP", "Seen, if the protons collide hard enough: the products weigh 135 MeV more, which the kinetic energy must supply (280 MeV in the lab, since momentum must be conserved too)."),
    lambda: tx(t, "figPhRx_vL", "Seen, but slowly: strangeness changes, which only the weak force allows, so the Λ lives 2.6 × 10⁻¹⁰ s instead of the 10⁻²³ s of a strong decay."),
    kp: tx(t, "figPhRx_vKp", "Seen: a fast strong reaction, strangeness −1 before and after. This is how Λ particles are made."),
  };
  const ok = broken.length === 0;
  const forceName = rx.force === "strong" ? tx(t, "figPhRx_fS", "strong force") : rx.force === "em" ? tx(t, "figPhRx_fE", "electromagnetic force") : tx(t, "figPhRx_fW", "weak force");

  // table geometry
  const X0 = 30, colB = 250, colA = 340, colOk = 440, Y0 = 92, DY = 22;

  return (
    <Figure title={tx(t, "figPhRx_title", "Can this reaction happen? Check the conservation laws")}
      controls={<>
        <Row>
          {RX.map((r, i) => (
            <Btn key={r.id} active={i === pick} onClick={() => setPick(i)}>{`${r.a.join(" ")} → ${r.b.join(" ")}`}</Btn>
          ))}
        </Row>
        <Row>
          <Readout color={ok ? C.green : C.red}>{ok
            ? `${tx(t, "figPhRx_allowed", "allowed")}${rx.force ? `: ${forceName}` : ""}${sChanges ? ` (${tx(t, "figPhRx_sNote", "strangeness changes")})` : ""}`
            : `${tx(t, "figPhRx_forbidden", "forbidden")}: ${broken.join(", ")}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhRx_note", "Particle physicists find conservation laws the way an accountant finds fraud: by noticing what never happens. Charge and energy you know. Baryon number counts protons, neutrons and their heavier cousins as +1 and their antiparticles as −1; no reaction has ever changed it, which is why the proton, the lightest baryon, has never been seen to decay. Lepton numbers do the same for electrons and muons with their neutrinos, each family on its own. Strangeness is different: the strong and electromagnetic forces keep it, the weak force can change it, and the price is speed. A reaction that only the weak force can do takes a hundred billion times longer than a strong one. Click through the list: every reaction that balances has been seen, and none of the others ever has.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <T x={W / 2} y={40} anchor="middle" size={20} color={C.fg} bold>{`${rx.a.join(" + ")}  →  ${rx.b.join(" + ")}`}</T>
        <T x={W / 2} y={62} anchor="middle" size={8.5} color={ok ? C.green : C.red}>{ok ? tx(t, "figPhRx_balances", "everything balances") : `${tx(t, "figPhRx_breaks", "breaks")}: ${broken.join(", ")}`}</T>

        <T x={colB} y={Y0 - 8} anchor="middle" size={8}>{tx(t, "figPhRx_before", "before")}</T>
        <T x={colA} y={Y0 - 8} anchor="middle" size={8}>{tx(t, "figPhRx_after", "after")}</T>
        {rows.map((r, i) => {
          const y = Y0 + 12 + i * DY;
          return (
            <g key={r.name}>
              <line x1={X0} y1={y + 7} x2={W - X0} y2={y + 7} stroke={C.grid} />
              <T x={X0} y={y} size={9}>{r.name}</T>
              <T x={colB} y={y} anchor="middle" size={10} color={C.fg}>{r.fmt!(r.before)}</T>
              <T x={colA} y={y} anchor="middle" size={10} color={C.fg}>{r.fmt!(r.after)}</T>
              <Mark x={colOk} y={y - 4} ok={r.ok} soft={!r.ok && r.soft} />
              {!r.ok && <T x={colOk + 14} y={y} size={8} color={r.soft ? C.amber : C.red}>{r.soft ? tx(t, "figPhRx_weakOnly", "weak force only") : tx(t, "figPhRx_broken", "not conserved")}</T>}
            </g>
          );
        })}
        {(() => {
          const y = Y0 + 12 + rows.length * DY;
          return (
            <g>
              <T x={X0} y={y} size={9}>{tx(t, "figPhRx_mass", "mass (MeV)")}</T>
              <T x={colB} y={y} anchor="middle" size={10} color={C.fg}>{f2(mA, 2)}</T>
              <T x={colA} y={y} anchor="middle" size={10} color={C.fg}>{f2(mB, 2)}</T>
              <Mark x={colOk} y={y - 4} ok={energyOk} soft={!decay && mB > mA} />
              <T x={colOk + 14} y={y} size={8} color={!energyOk ? C.red : !decay && mB > mA ? C.amber : C.muted}>{decay
                ? energyOk ? `${tx(t, "figPhRx_spare", "spare")} ${f2(mA - mB, 2)} MeV` : tx(t, "figPhRx_tooLight", "too light to decay so")
                : mB > mA ? `${tx(t, "figPhRx_needs", "needs")} ${f2(mB - mA, 1)} MeV ${tx(t, "figPhRx_ke", "of motion")}` : `${tx(t, "figPhRx_spare", "spare")} ${f2(mA - mB, 2)} MeV`}</T>
            </g>
          );
        })()}
        <foreignObject x={X0} y={H - 46} width={W - 2 * X0} height={46}>
          <div style={{ fontSize: 9.5, lineHeight: 1.3, color: "var(--text-muted)" }}>{VERDICT[rx.id]}</div>
        </foreignObject>
      </svg>
    </Figure>
  );
}

/** A drawn tick or cross; amber when it comes with a condition (needs energy, weak force only). */
function Mark({ x, y, ok, soft }: { x: number; y: number; ok: boolean; soft?: boolean }) {
  const col = soft ? C.amber : ok ? C.green : C.red;
  return ok
    ? <path d={`M${x - 5},${y} L${x - 1},${y + 4} L${x + 6},${y - 5}`} fill="none" stroke={col} strokeWidth={2} />
    : <path d={`M${x - 4},${y - 4} L${x + 4},${y + 4} M${x + 4},${y - 4} L${x - 4},${y + 4}`} fill="none" stroke={col} strokeWidth={2} />;
}

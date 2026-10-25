"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Choice, Figure, C } from "@/components/lesson/kit/figure";
import { Practice, type StageApi } from "@/components/lesson/kit/practice/Practice";
import { ChoiceButtons } from "@/components/lesson/kit/practice/ChoiceButtons";
import { ATOM_COLOR, formula } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// A practice round (kit/practice) on the particle view of matter. "What is in
// the box?": a box of atoms and molecules; is it an element, a compound or a
// mixture? "What kind of change?": the same box before and after; did the
// particles only move (physical change) or did the atoms swap partners into
// new molecules (chemical change)? Both boxes always hold the same atoms,
// counted underneath: mass is conserved either way. Every question is drawn
// at random, so no two rounds look alike.

type Species = "He" | "Ne" | "Ar" | "H2" | "O2" | "N2" | "Cl2" | "H2O" | "CO2" | "NH3" | "CH4" | "HCl";
const SHAPE: Record<Species, [string, number, number][]> = {
  He: [["He", 0, 0]], Ne: [["Ne", 0, 0]], Ar: [["Ar", 0, 0]],
  H2: [["H", -4, 0], ["H", 4, 0]], O2: [["O", -6, 0], ["O", 6, 0]], N2: [["N", -6, 0], ["N", 6, 0]],
  Cl2: [["Cl", -6.5, 0], ["Cl", 6.5, 0]],
  H2O: [["O", 0, 0], ["H", -7, 5], ["H", 7, 5]], CO2: [["O", -11, 0], ["O", 11, 0], ["C", 0, 0]],
  NH3: [["N", 0, 0], ["H", -8, 4], ["H", 8, 4], ["H", 0, -8]],
  CH4: [["C", 0, 0], ["H", -8, 0], ["H", 8, 0], ["H", 0, -8], ["H", 0, 8]], HCl: [["Cl", 2, 0], ["H", -7, 0]],
};
const RADIUS: Record<string, number> = { H: 4.5, He: 6, Ne: 6.5, Ar: 7.5, Cl: 7.5 };
const ATOMS: Species[] = ["He", "Ne", "Ar"], DIATOMIC: Species[] = ["H2", "O2", "N2", "Cl2"];
const COMPOUNDS: Species[] = ["H2O", "CO2", "NH3", "CH4", "HCl"];

type P = { sp: Species; x: number; y: number; a: number };
type Cls = "element" | "compound" | "mixture";
type Q =
  | { key: string; kind: "classify"; answer: Cls; parts: P[]; species: Species[] }
  | { key: string; kind: "change"; answer: "physical" | "chemical"; before: P[]; after: P[]; what: string };

const BW = 240, BH = 150;
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

/** Scatters molecules in a box without overlaps; `area` limits them to part of it. */
function scatter(list: Species[], area = { x0: 0, x1: BW, y0: 0, y1: BH }, grid = false): P[] {
  if (grid) {
    const cols = Math.ceil(Math.sqrt(list.length * 1.6));
    return list.map((sp, i) => ({ sp, a: 0, x: area.x0 + 26 + (i % cols) * 28, y: area.y1 - 22 - Math.floor(i / cols) * 26 }));
  }
  const out: P[] = [];
  for (const sp of list) {
    for (let k = 0; k < 400; k++) {
      const x = area.x0 + 20 + Math.random() * (area.x1 - area.x0 - 40), y = area.y0 + 18 + Math.random() * (area.y1 - area.y0 - 36);
      if (out.every(p => (p.x - x) ** 2 + (p.y - y) ** 2 > 30 * 30) || k === 399) { out.push({ sp, x, y, a: Math.random() * Math.PI * 2 }); break; }
    }
  }
  return out;
}
const repeat = (sp: Species, n: number) => Array.from({ length: n }, () => sp);

function makeClassify(): Q {
  const answer = pick(["element", "element", "compound", "mixture", "mixture"] as const);
  let species: Species[];
  if (answer === "element") species = [pick([...ATOMS, ...DIATOMIC])];
  else if (answer === "compound") species = [pick(COMPOUNDS)];
  else {
    const pool = [...ATOMS, ...DIATOMIC, ...COMPOUNDS].sort(() => Math.random() - 0.5);
    species = pool.slice(0, Math.random() < 0.7 ? 2 : 3);
  }
  const n = 8 + Math.floor(Math.random() * 3);
  const list = Array.from({ length: n }, (_, i) => species[i % species.length]);
  return { key: `c:${answer}:${species.join("+")}`, kind: "classify", answer, species, parts: scatter(list) };
}

const CHANGES = [
  { what: "boil", answer: "physical" as const },
  { what: "freeze", answer: "physical" as const },
  { what: "mix", answer: "physical" as const },
  { what: "water", answer: "chemical" as const },
  { what: "burn", answer: "chemical" as const },
  { what: "ammonia", answer: "chemical" as const },
  { what: "hcl", answer: "chemical" as const },
];
function makeChange(): Q {
  const c = pick(CHANGES);
  const low = { x0: 0, x1: BW, y0: BH * 0.5, y1: BH }, left = { x0: 0, x1: BW / 2, y0: 0, y1: BH }, right = { x0: BW / 2, x1: BW, y0: 0, y1: BH };
  let before: P[], after: P[];
  switch (c.what) {
    case "boil": before = scatter(repeat("H2O", 8), low); after = scatter(repeat("H2O", 8)); break;
    case "freeze": before = scatter(repeat("H2O", 8)); after = scatter(repeat("H2O", 8), undefined, true); break;
    case "mix": before = [...scatter(repeat("N2", 4), left), ...scatter(repeat("O2", 4), right)]; after = scatter(["N2", "O2", "N2", "O2", "N2", "O2", "N2", "O2"]); break;
    case "water": before = scatter([...repeat("H2", 4), ...repeat("O2", 2)]); after = scatter(repeat("H2O", 4)); break;
    case "burn": before = scatter([...repeat("CH4", 2), ...repeat("O2", 4)]); after = scatter([...repeat("CO2", 2), ...repeat("H2O", 4)]); break;
    case "ammonia": before = scatter([...repeat("N2", 2), ...repeat("H2", 6)]); after = scatter(repeat("NH3", 4)); break;
    default: before = scatter([...repeat("H2", 3), ...repeat("Cl2", 3)]); after = scatter(repeat("HCl", 6));
  }
  return { key: `x:${c.what}`, kind: "change", answer: c.answer, before, after, what: c.what };
}

function Box({ parts, x0 = 0 }: { parts: P[]; x0?: number }) {
  return (
    <g transform={`translate(${x0},0)`}>
      <rect x={0} y={0} width={BW} height={BH} rx={8} fill="var(--code-bg)" stroke="var(--border)" />
      {parts.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y}) rotate(${(p.a * 180) / Math.PI})`}>
          {SHAPE[p.sp].map(([el, dx, dy], j) => (
            <circle key={j} cx={dx} cy={dy} r={RADIUS[el] ?? 7} fill={ATOM_COLOR[el]} stroke="#0f172a" strokeOpacity={0.35} strokeWidth={0.8} />
          ))}
        </g>
      ))}
    </g>
  );
}

/** "4 H · 2 O" for the atoms in a box. */
function atomCount(parts: P[]) {
  const n: Record<string, number> = {};
  for (const p of parts) for (const [el] of SHAPE[p.sp]) n[el] = (n[el] ?? 0) + 1;
  return Object.entries(n).map(([el, k]) => `${k} ${el}`).join(" · ");
}

export function ParticlePracticeFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<"mixed" | "classify" | "change">("mixed");
  const [given, setGiven] = useState<{ q: string; i: number } | null>(null);

  const CLS: Cls[] = ["element", "compound", "mixture"];
  const clsName = (c: Cls) => tx(t, `figChPP_${c}`, c);
  const make = (avoid: string | null): Q => {
    for (let i = 0; ; i++) {
      const kind = mode === "mixed" ? (Math.random() < 0.55 ? "classify" : "change") : mode;
      const q = kind === "classify" ? makeClassify() : makeChange();
      if (q.key !== avoid || i > 20) return q;
    }
  };

  const stage = (q: Q, { submit, feedback }: StageApi) => {
    const mine = given?.q === q.key ? given.i : null;
    const options = q.kind === "classify" ? CLS.map(clsName) : [tx(t, "figChPP_physical", "physical change"), tx(t, "figChPP_chemical", "chemical change")];
    const right = q.kind === "classify" ? CLS.indexOf(q.answer) : q.answer === "physical" ? 0 : 1;
    const w = q.kind === "classify" ? BW + 20 : 2 * BW + 70;
    return (
      <div className="px-3 pb-4">
        <svg viewBox={`-10 -6 ${w} ${BH + 30}`} className="w-full h-auto mx-auto" style={{ maxWidth: q.kind === "classify" ? 340 : 600 }}>
          {q.kind === "classify" ? (
            <Box parts={q.parts} />
          ) : (
            <>
              <Box parts={q.before} />
              <text x={BW + 25} y={BH / 2 + 5} fontSize={20} textAnchor="middle" fill={C.muted}>→</text>
              <Box parts={q.after} x0={BW + 50} />
              <text x={BW / 2} y={BH + 16} fontSize={9} textAnchor="middle" fill={C.muted}>{`${tx(t, "figChPP_before", "before")}: ${atomCount(q.before)}`}</text>
              <text x={BW + 50 + BW / 2} y={BH + 16} fontSize={9} textAnchor="middle" fill={C.muted}>{`${tx(t, "figChPP_after", "after")}: ${atomCount(q.after)}`}</text>
            </>
          )}
        </svg>
        <div className="pt-3">
          <ChoiceButtons options={options} right={right} picked={mine} feedback={feedback}
            onPick={i => { setGiven({ q: q.key, i }); submit(i === right); }} />
        </div>
      </div>
    );
  };

  const solution = (q: Q) => {
    if (q.kind === "classify") {
      const f = q.species.map(formula).join(", ");
      return q.answer === "element"
        ? `${clsName("element")}: ${tx(t, "figChPP_solEl", "only one kind of atom")} (${f})`
        : q.answer === "compound"
          ? `${clsName("compound")}: ${tx(t, "figChPP_solCo", "all the same molecule, made of different atoms")} (${f})`
          : `${clsName("mixture")}: ${tx(t, "figChPP_solMx", "more than one kind of particle")} (${f})`;
    }
    return q.answer === "physical"
      ? tx(t, "figChPP_solPh", "physical: the same molecules before and after, only their arrangement changed")
      : tx(t, "figChPP_solCh", "chemical: the atoms are the same, but they are joined into new molecules");
  };

  return (
    <Figure title={tx(t, "figChPP_title", "Practice: matter, particle by particle")}
      note={tx(t, "figChPP_note", "Each ball is an atom, coloured by element (white H, red O, blue N, dark grey C, green Cl); touching balls are one molecule. An element has one kind of atom, alone or in molecules like O₂. A compound is one kind of molecule built from two or more elements. A mixture has more than one kind of particle, mixed but not joined. For a change, compare the molecules, not their positions: if every molecule after was already there before, it was physical; if new molecules appear, it was chemical. The atom counts under the boxes never change: atoms are neither made nor destroyed.")}>
      <Practice<Q> t={t} id={`chem-particles-${mode}`} make={make}
        settings={<Choice value={mode} onChange={setMode} options={[
          ["mixed", tx(t, "figChPP_mixed", "mixed")], ["classify", tx(t, "figChPP_mClassify", "what is in the box?")], ["change", tx(t, "figChPP_mChange", "what kind of change?")],
        ]} />}
        prompt={q => q.kind === "classify" ? tx(t, "figChPP_qClassify", "What is in the box?") : tx(t, "figChPP_qChange", "What kind of change is this?")}
        stage={stage} solution={solution} />
    </Figure>
  );
}

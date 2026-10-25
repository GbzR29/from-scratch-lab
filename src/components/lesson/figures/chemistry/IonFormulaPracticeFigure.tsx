"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Choice, Figure, C } from "@/components/lesson/kit/figure";
import { Practice, type StageApi } from "@/components/lesson/kit/practice/Practice";
import { ChoiceButtons } from "@/components/lesson/kit/practice/ChoiceButtons";
import { BY_SYMBOL } from "./elements";
import { CATEGORY_COLOR, elementName, sub, sup } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// A practice round (kit/practice) on ions. "Which ion?": an element's tile
// (with its group); the reader picks the charge it takes, from the group and
// the noble gas it reaches. "Which formula?": a cation and an anion, simple or
// polyatomic; the reader picks the neutral formula, where the total positive
// charge cancels the negative (Al³⁺ + O²⁻ → Al₂O₃, Ca²⁺ + NO₃⁻ → Ca(NO₃)₂).
// The wrong options are the classic slips: the charges copied as counts in
// the wrong place, a 1:1 formula, missing brackets.

type Ion = { f: string; q: number; poly?: true };
const CATIONS: Ion[] = [
  { f: "Li", q: 1 }, { f: "Na", q: 1 }, { f: "K", q: 1 }, { f: "Mg", q: 2 }, { f: "Ca", q: 2 }, { f: "Ba", q: 2 },
  { f: "Al", q: 3 }, { f: "Zn", q: 2 }, { f: "Fe", q: 2 }, { f: "Fe", q: 3 }, { f: "NH4", q: 1, poly: true },
];
const ANIONS: Ion[] = [
  { f: "F", q: -1 }, { f: "Cl", q: -1 }, { f: "Br", q: -1 }, { f: "I", q: -1 }, { f: "O", q: -2 }, { f: "S", q: -2 }, { f: "N", q: -3 },
  { f: "OH", q: -1, poly: true }, { f: "NO3", q: -1, poly: true }, { f: "SO4", q: -2, poly: true },
  { f: "CO3", q: -2, poly: true }, { f: "PO4", q: -3, poly: true },
];
const ION_ELEMENTS = ["Li", "Na", "K", "Rb", "Mg", "Ca", "Sr", "Ba", "Al", "N", "P", "O", "S", "Se", "F", "Cl", "Br", "I"];

type Q =
  | { key: string; kind: "ion"; sym: string; answer: number; options: number[] }
  | { key: string; kind: "formula"; cat: Ion; an: Ion; options: string[]; right: number };

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const shuffle = <T,>(xs: T[]) => xs.map(x => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(p => p[1]);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

const ionText = (i: Ion) => `${sub(i.f)}${sup(`${Math.abs(i.q) > 1 ? Math.abs(i.q) : ""}${i.q > 0 ? "+" : "-"}`)}`;
const chargeText = (sym: string, q: number) => `${sym}${sup(`${Math.abs(q) > 1 ? Math.abs(q) : ""}${q > 0 ? "+" : "-"}`)}`;
/** One part of a formula: Ca, Cl₂, (NO₃)₂, NH₄. */
const part = (i: Ion, n: number) => (n === 1 ? sub(i.f) : i.poly ? `(${sub(i.f)})${sub(n)}` : `${sub(i.f)}${sub(n)}`);
const formulaOf = (c: Ion, a: Ion, nc: number, na: number) => part(c, nc) + part(a, na);

/** The group's usual charge for a main-group element. */
function usualCharge(sym: string): number {
  const g = BY_SYMBOL[sym].group ?? 0;
  if (g <= 2) return g;
  if (g === 13) return 3;
  return g - 18;
}

function makeIon(): Q {
  const sym = pick(ION_ELEMENTS), answer = usualCharge(sym);
  const pool = [-3, -2, -1, 1, 2, 3].filter(k => k !== answer);
  const options = shuffle([answer, ...shuffle(pool).slice(0, 3)]);
  return { key: `i:${sym}`, kind: "ion", sym, answer, options };
}

function makeFormula(): Q {
  const cat = pick(CATIONS), an = pick(ANIONS);
  const g = gcd(cat.q, -an.q);
  const nc = -an.q / g, na = cat.q / g;
  const right = formulaOf(cat, an, nc, na);
  const wrong = new Set<string>();
  const cands = [
    formulaOf(cat, an, na, nc),                                            // counts swapped
    formulaOf(cat, an, 1, 1),                                              // 1:1 regardless of charge
    formulaOf(cat, an, -an.q, cat.q),                                      // criss-cross without reducing
    an.poly && na > 1 ? `${sub(cat.f)}${sub(an.f)}${sub(na)}` : formulaOf(cat, an, nc + 1, na), // brackets forgotten
    formulaOf(cat, an, nc, na + 1),
    formulaOf(cat, an, nc * 2, na),
  ];
  for (const c of cands) if (c !== right && wrong.size < 3) wrong.add(c);
  const options = shuffle([right, ...wrong]);
  return { key: `f:${cat.f}${cat.q}:${an.f}`, kind: "formula", cat, an, options, right: options.indexOf(right) };
}

export function IonFormulaPracticeFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<"mixed" | "ion" | "formula">("mixed");
  const [given, setGiven] = useState<{ q: string; i: number } | null>(null);

  const make = (avoid: string | null): Q => {
    for (let i = 0; ; i++) {
      const kind = mode === "mixed" ? (Math.random() < 0.4 ? "ion" : "formula") : mode;
      const q = kind === "ion" ? makeIon() : makeFormula();
      if (q.key !== avoid || i > 20) return q;
    }
  };

  const ionCard = (x: number, label: string, color: string, caption: string) => (
    <g transform={`translate(${x},0)`}>
      <rect x={0} y={0} width={110} height={92} rx={10} fill="var(--card)" stroke={color} strokeWidth={2} />
      <text x={55} y={54} fontSize={label.length > 5 ? 22 : 28} fontWeight={700} textAnchor="middle" fill="var(--text-main)">{label}</text>
      <text x={55} y={80} fontSize={9.5} textAnchor="middle" fill={C.muted}>{caption}</text>
    </g>
  );

  const stage = (q: Q, { submit, feedback }: StageApi) => {
    const mine = given?.q === q.key ? given.i : null;
    if (q.kind === "ion") {
      const el = BY_SYMBOL[q.sym];
      const right = q.options.indexOf(q.answer);
      return (
        <div className="px-3 pb-4">
          <svg viewBox="0 0 130 112" className="w-full h-auto mx-auto" style={{ maxWidth: 160 }}>
            <rect x={10} y={4} width={110} height={104} rx={10} fill="var(--card)" stroke={CATEGORY_COLOR[el.cat]} strokeWidth={2.5} />
            <text x={20} y={22} fontSize={10} fill={C.muted}>{el.z}</text>
            <text x={110} y={22} fontSize={10} textAnchor="end" fill={C.muted}>{`${tx(t, "figChIf_group", "group")} ${el.group}`}</text>
            <text x={65} y={68} fontSize={34} fontWeight={700} textAnchor="middle" fill="var(--text-main)">{el.sym}</text>
            <text x={65} y={94} fontSize={9.5} textAnchor="middle" fill={C.muted}>{elementName(t, el)}</text>
          </svg>
          <div className="pt-3">
            <ChoiceButtons options={q.options.map(k => chargeText(q.sym, k))} right={right} picked={mine} feedback={feedback}
              onPick={i => { setGiven({ q: q.key, i }); submit(i === right); }} />
          </div>
        </div>
      );
    }
    return (
      <div className="px-3 pb-4">
        <svg viewBox="0 0 290 96" className="w-full h-auto mx-auto" style={{ maxWidth: 360 }}>
          {ionCard(2, ionText(q.cat), C.amber, tx(t, "figChIf_cation", "cation"))}
          <text x={145} y={54} fontSize={22} textAnchor="middle" fill={C.muted}>+</text>
          {ionCard(178, ionText(q.an), C.sky, tx(t, "figChIf_anion", "anion"))}
        </svg>
        <div className="pt-3">
          <ChoiceButtons options={q.options} right={q.right} picked={mine} feedback={feedback}
            onPick={i => { setGiven({ q: q.key, i }); submit(i === q.right); }} />
        </div>
      </div>
    );
  };

  const solution = (q: Q) => {
    if (q.kind === "ion") {
      const g = BY_SYMBOL[q.sym].group ?? 0;
      const how = q.answer > 0
        ? tx(t, "figChIf_solLose", "group {g}: it loses {n} electron(s) to reach the noble gas before it")
        : tx(t, "figChIf_solGain", "group {g}: it gains {n} electron(s) to reach the noble gas after it");
      return `${chargeText(q.sym, q.answer)}: ${how.replace("{g}", String(g)).replace("{n}", String(Math.abs(q.answer)))}`;
    }
    const g = gcd(q.cat.q, -q.an.q), nc = -q.an.q / g, na = q.cat.q / g;
    return `${q.options[q.right]}: ${nc} × (${q.cat.q > 0 ? "+" : ""}${q.cat.q}) + ${na} × (${q.an.q}) = 0`;
  };

  return (
    <Figure title={tx(t, "figChIf_title", "Practice: ions and ionic formulas")}
      note={tx(t, "figChIf_note", "Which ion: read the group. Groups 1, 2 and 13 lose 1, 2 and 3 electrons; groups 15, 16 and 17 gain 3, 2 and 1. Which formula: find the smallest numbers of each ion whose charges add up to zero. A quick way is to cross the charges over (Al³⁺ and O²⁻ give Al₂O₃) and then divide by any common factor (Mg²⁺ and O²⁻ give Mg₂O₂, so MgO). A polyatomic ion is one unit: when you need more than one, put it in brackets, Ca(NO₃)₂, never CaNO₃₂.")}>
      <Practice<Q> t={t} id={`chem-ions-${mode}`} make={make}
        settings={<Choice value={mode} onChange={setMode} options={[
          ["mixed", tx(t, "figChIf_mixed", "mixed")], ["ion", tx(t, "figChIf_mIon", "which ion?")], ["formula", tx(t, "figChIf_mFormula", "which formula?")],
        ]} />}
        prompt={q => q.kind === "ion" ? tx(t, "figChIf_qIon", "Which ion does this element form?") : tx(t, "figChIf_qFormula", "Which formula is neutral?")}
        stage={stage} solution={solution} />
    </Figure>
  );
}

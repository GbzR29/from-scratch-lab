"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, C, T, f2 } from "@/components/lesson/kit/figure";
import { BY_SYMBOL } from "./elements";
import { formula } from "./names";
import { molarMass } from "./MoleFigure";

// ── What this figure shows ────────────────────────────────────────────────────
// From a lab's percent composition to a formula, one column at a time:
// percent → grams in a 100 g sample → moles (÷ atomic mass) → ratio (÷ the
// smallest) → whole numbers (× the smallest multiplier that clears the
// decimals) = the empirical formula; then the measured molar mass says how
// many empirical units make one molecule. Break it: round the ratio straight
// away. Vitamin C's 1 : 1.33 : 1 becomes CHO, rust's 1 : 1.5 becomes FeO₂, and
// the check row shows those formulas do not even give back the measured
// percentages.

type Case = { id: string; name: [string, string]; pct: [string, number][]; M: number | null };
const CASES: Case[] = [
  { id: "glucose", name: ["figChEmp_glucose", "glucose"], pct: [["C", 40.00], ["H", 6.71], ["O", 53.29]], M: 180.16 },
  { id: "vitc", name: ["figChEmp_vitc", "vitamin C"], pct: [["C", 40.92], ["H", 4.58], ["O", 54.50]], M: 176.12 },
  { id: "rust", name: ["figChEmp_rust", "rust (iron oxide)"], pct: [["Fe", 69.94], ["O", 30.06]], M: null },
  { id: "caffeine", name: ["figChEmp_caffeine", "caffeine"], pct: [["C", 49.48], ["H", 5.19], ["N", 28.85], ["O", 16.48]], M: 194.19 },
  { id: "benzene", name: ["figChEmp_benzene", "benzene"], pct: [["C", 92.26], ["H", 7.74]], M: 78.11 },
];
const STEPS = 5;

const write = (syms: string[], ks: number[]) => syms.map((s, i) => s + (ks[i] === 1 ? "" : ks[i])).join("");
const percents = (syms: string[], ks: number[]) => {
  const tot = syms.reduce((a, s, i) => a + ks[i] * BY_SYMBOL[s].mass, 0);
  return syms.map((s, i) => (100 * ks[i] * BY_SYMBOL[s].mass) / tot);
};

export function EmpiricalFormulaFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState("vitc");
  const [step, setStep] = useState(0);
  const [early, setEarly] = useState(false);
  const c = CASES.find(x => x.id === id)!;
  const syms = c.pct.map(p => p[0]);
  const grams = c.pct.map(p => p[1]);
  const moles = c.pct.map(([s, g]) => g / BY_SYMBOL[s].mass);
  const small = Math.min(...moles);
  const ratio = moles.map(m => m / small);
  const mult = early ? 1 : ([1, 2, 3, 4, 5, 6].find(k => ratio.every(r => Math.abs(r * k - Math.round(r * k)) < 0.08)) ?? 1);
  const whole = ratio.map(r => Math.max(1, Math.round(r * mult)));
  const emp = write(syms, whole), empM = molarMass(emp);
  const times = c.M ? Math.round(c.M / empM) : 1;
  const mol = write(syms, whole.map(k => k * times));
  const back = percents(syms, whole);
  const wrong = back.some((p, i) => Math.abs(p - grams[i]) > 0.5);

  const pick = (v: string) => { setId(v); setStep(0); };
  const cols = [
    { x: 120, head: tx(t, "figChEmp_cPct", "mass %"), at: 0 },
    { x: 200, head: tx(t, "figChEmp_cG", "in 100 g"), at: 1 },
    { x: 290, head: tx(t, "figChEmp_cMol", "÷ atomic mass = mol"), at: 2 },
    { x: 400, head: tx(t, "figChEmp_cRatio", "÷ smallest"), at: 3 },
    { x: 490, head: early ? tx(t, "figChEmp_cRound", "rounded at once") : `× ${mult}`, at: 4 },
  ];
  const cell = (i: number, col: number) => [
    `${f2(grams[i], 2)} %`, `${f2(grams[i], 2)} g`,
    `${f2(grams[i], 2)} / ${f2(BY_SYMBOL[syms[i]].mass, 3)} = ${f2(moles[i], 4)}`,
    f2(ratio[i], 3), String(whole[i]),
  ][col];

  const W = 560, H = 120 + syms.length * 22 + 70;
  const rowY = (i: number) => 72 + i * 22;
  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <T x={16} y={24} color={C.fg} size={12} bold>{tx(t, c.name[0], c.name[1])}</T>
      <T x={16} y={40}>{tx(t, "figChEmp_given", "the lab measured these mass percentages")}</T>
      {cols.map((col, j) => step >= col.at && (
        <T key={j} x={col.x} y={64} anchor="middle" color={j === step ? C.amber : C.muted} bold={j === step}>{col.head}</T>
      ))}
      {syms.map((s, i) => (
        <g key={s}>
          <T x={30} y={rowY(i) + 10} color={C.fg} size={12} bold>{s}</T>
          {cols.map((col, j) => step >= col.at && (
            <T key={j} x={col.x} y={rowY(i) + 10} anchor="middle" color={j === step ? C.amber : C.fg}>{cell(i, j)}</T>
          ))}
        </g>
      ))}
      {step >= 4 && (
        <g>
          <T x={16} y={rowY(syms.length) + 20} color={wrong ? C.red : C.green} size={12} bold>
            {`${tx(t, "figChEmp_emp", "empirical formula")}: ${formula(emp)}`}
          </T>
          <T x={16} y={rowY(syms.length) + 38} color={wrong ? C.red : C.muted}>
            {`${tx(t, "figChEmp_check", "check, % from this formula")}: ${syms.map((s, i) => `${s} ${f2(back[i], 2)}`).join(" · ")}${wrong ? `  ✗ ${tx(t, "figChEmp_noMatch", "does not match the lab")}` : "  ✓"}`}
          </T>
        </g>
      )}
      {step >= 5 && (
        <T x={16} y={rowY(syms.length) + 58} color={wrong ? C.red : C.green} size={12} bold>
          {c.M
            ? `${tx(t, "figChEmp_mol", "molecular formula")}: ${f2(c.M, 2)} / ${f2(empM, 2)} ≈ ${times} → ${formula(mol)}`
            : tx(t, "figChEmp_ionic", "an ionic solid: no molecules, the empirical formula is the formula")}
        </T>
      )}
    </svg>
  );

  const labels = [
    tx(t, "figChEmp_s0", "the data: mass percentages"),
    tx(t, "figChEmp_s1", "take 100 g, so % becomes grams"),
    tx(t, "figChEmp_s2", "grams ÷ atomic mass = moles of atoms"),
    tx(t, "figChEmp_s3", "divide by the smallest number of moles"),
    tx(t, "figChEmp_s4", "multiply until every number is whole"),
    tx(t, "figChEmp_s5", "use the molar mass to scale up"),
  ];

  return (
    <Figure title={tx(t, "figChEmp_title", "From percentages to a formula")}
      controls={<>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Choice value={id} onChange={pick} options={CASES.map(x => [x.id, tx(t, x.name[0], x.name[1])] as const)} />
        </div>
        <Row>
          <Btn onClick={() => setStep(s => Math.max(0, s - 1))}>{tx(t, "figChEmp_back", "◀ back")}</Btn>
          <Btn onClick={() => setStep(s => Math.min(STEPS, s + 1))}>{tx(t, "figChEmp_next", "next step ▶")}</Btn>
          <Readout color={C.amber}>{`${step + 1}/${STEPS + 1} · ${labels[step]}`}</Readout>
        </Row>
        <Row>
          <Btn active={early} onClick={() => setEarly(v => !v)}>{tx(t, "figChEmp_break", "break it: round the ratio at once")}</Btn>
        </Row>
      </>}
      note={tx(t, "figChEmp_note", "Step through the method with \"next step\". Taking exactly 100 g turns every percentage into grams; dividing by the atomic mass turns grams into moles of atoms, and only moles can be compared, because a formula counts atoms, not grams. Dividing by the smallest gives the ratio. When a ratio ends in .33, .5 or .67, multiply everything by 3, 2 or 3 to clear it. Now break it: round the ratio immediately. For glucose nothing goes wrong, but vitamin C becomes CHO and rust FeO₂, and the check row shows those formulas would not have the measured percentages.")}>
      {view}
    </Figure>
  );
}

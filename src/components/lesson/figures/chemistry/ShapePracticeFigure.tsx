"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Choice, Figure, C } from "@/components/lesson/kit/figure";
import { Practice, type StageApi } from "@/components/lesson/kit/practice/Practice";
import { ChoiceButtons } from "@/components/lesson/kit/practice/ChoiceButtons";
import { AXE, SHAPE_KEYS, shapeName, type ShapeKey } from "./vsepr";
import { formula } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// A practice round (kit/practice) on VSEPR. "Which shape?": a formula and its
// central atom; the reader counts the domains (from the Lewis structure) and
// picks the molecular shape. "Polar or not?": the same molecules, deciding
// whether the bond dipoles cancel. The solution always gives the count:
// "SF₄: S has 4 bonds and 1 lone pair (AX₄E) → seesaw". Ions are left out of
// the polarity questions (an ion is charged anyway).

type Item = { f: string; center: string; x: number; e: number; charge?: string; polar?: boolean };
const BANK: Item[] = [
  { f: "CO2", center: "C", x: 2, e: 0, polar: false }, { f: "HCN", center: "C", x: 2, e: 0, polar: true },
  { f: "BeCl2", center: "Be", x: 2, e: 0, polar: false }, { f: "BF3", center: "B", x: 3, e: 0, polar: false },
  { f: "SO3", center: "S", x: 3, e: 0, polar: false }, { f: "CH2O", center: "C", x: 3, e: 0, polar: true },
  { f: "SO2", center: "S", x: 2, e: 1, polar: true }, { f: "O3", center: "O", x: 2, e: 1, polar: true },
  { f: "NO2", center: "N", x: 2, e: 1, charge: "-" }, { f: "CH4", center: "C", x: 4, e: 0, polar: false },
  { f: "CCl4", center: "C", x: 4, e: 0, polar: false }, { f: "CHCl3", center: "C", x: 4, e: 0, polar: true },
  { f: "NH4", center: "N", x: 4, e: 0, charge: "+" }, { f: "NH3", center: "N", x: 3, e: 1, polar: true },
  { f: "PCl3", center: "P", x: 3, e: 1, polar: true }, { f: "H3O", center: "O", x: 3, e: 1, charge: "+" },
  { f: "H2O", center: "O", x: 2, e: 2, polar: true }, { f: "H2S", center: "S", x: 2, e: 2, polar: true },
  { f: "OF2", center: "O", x: 2, e: 2, polar: true }, { f: "PCl5", center: "P", x: 5, e: 0, polar: false },
  { f: "SF4", center: "S", x: 4, e: 1, polar: true }, { f: "ClF3", center: "Cl", x: 3, e: 2, polar: true },
  { f: "XeF2", center: "Xe", x: 2, e: 3, polar: false }, { f: "I3", center: "I", x: 2, e: 3, charge: "-" },
  { f: "SF6", center: "S", x: 6, e: 0, polar: false }, { f: "BrF5", center: "Br", x: 5, e: 1, polar: true },
  { f: "XeF4", center: "Xe", x: 4, e: 2, polar: false },
];

type Q = { key: string; kind: "shape" | "polar"; item: Item; options: string[]; right: number };
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const shuffle = <T,>(xs: T[]) => xs.map(x => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(p => p[1]);
const axe = (i: Item) => `AX${i.x > 1 ? i.x : ""}${i.e ? `E${i.e > 1 ? i.e : ""}` : ""}`.replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[+d]);
const label = (i: Item) => formula(i.f) + (i.charge === "-" ? "⁻" : i.charge === "+" ? "⁺" : "");

export function ShapePracticeFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<"mixed" | "shape" | "polar">("mixed");
  const [given, setGiven] = useState<{ q: string; i: number } | null>(null);

  const make = (avoid: string | null): Q => {
    for (let n = 0; ; n++) {
      const kind = mode === "mixed" ? (Math.random() < 0.6 ? "shape" : "polar") : mode;
      const item = pick(kind === "polar" ? BANK.filter(b => b.polar !== undefined) : BANK);
      const key = `${kind}:${item.f}`;
      if (key === avoid && n < 20) continue;
      if (kind === "shape") {
        const right = AXE[`${item.x},${item.e}`].shape;
        const others = shuffle(SHAPE_KEYS.filter(s => s !== right)).slice(0, 3);
        const keys: ShapeKey[] = shuffle([right, ...others]);
        return { key, kind, item, options: keys.map(s => shapeName(t, s)), right: keys.indexOf(right) };
      }
      return { key, kind, item, options: [tx(t, "figChSp_polar", "polar"), tx(t, "figChSp_nonpolar", "nonpolar")], right: item.polar ? 0 : 1 };
    }
  };

  const stage = (q: Q, { submit, feedback }: StageApi) => {
    const mine = given?.q === q.key ? given.i : null;
    return (
      <div className="px-3 pb-4">
        <svg viewBox="0 0 220 92" className="w-full h-auto mx-auto" style={{ maxWidth: 280 }}>
          <rect x={2} y={2} width={216} height={88} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
          <text x={110} y={52} fontSize={32} fontWeight={700} textAnchor="middle" fill="var(--text-main)">{label(q.item)}</text>
          <text x={110} y={76} fontSize={10} textAnchor="middle" fill={C.muted}>{`${tx(t, "figChSp_center", "central atom")}: ${q.item.center}`}</text>
        </svg>
        <div className="pt-3">
          <ChoiceButtons options={q.options} right={q.right} picked={mine} feedback={feedback}
            onPick={i => { setGiven({ q: q.key, i }); submit(i === q.right); }} />
        </div>
      </div>
    );
  };

  const solution = (q: Q) => {
    const it = q.item, shape = shapeName(t, AXE[`${it.x},${it.e}`].shape);
    const count = tx(t, "figChSp_count", "{c} has {x} bonded atoms and {e} lone pairs ({axe})")
      .replace("{c}", it.center).replace("{x}", String(it.x)).replace("{e}", String(it.e)).replace("{axe}", axe(it));
    if (q.kind === "shape") return `${label(it)}: ${count} → ${shape}`;
    return `${label(it)}: ${shape}; ${it.polar ? tx(t, "figChSp_solPolar", "the bond dipoles do not cancel → polar") : tx(t, "figChSp_solNon", "the bond dipoles cancel by symmetry → nonpolar")}`;
  };

  return (
    <Figure title={tx(t, "figChSp_title", "Practice: shapes and polarity")}
      note={tx(t, "figChSp_note", "For each formula, sketch the Lewis structure in your head and count the electron domains on the central atom: each bonded atom is one domain, whatever the bond order, and so is each lone pair. Bonds plus lone pairs give the domain geometry (2 line, 3 triangle, 4 tetrahedron, 5 trigonal bipyramid, 6 octahedron); then name the shape by the atoms only. For polarity: if all the outer atoms are the same and the shape is one of the fully symmetric ones (linear, trigonal planar, tetrahedral, trigonal bipyramidal, octahedral, square planar), the dipoles cancel; otherwise the molecule is polar.")}>
      <Practice<Q> t={t} id={`chem-shapes-${mode}`} make={make}
        settings={<Choice value={mode} onChange={setMode} options={[
          ["mixed", tx(t, "figChSp_mixed", "mixed")], ["shape", tx(t, "figChSp_mShape", "which shape?")], ["polar", tx(t, "figChSp_mPolar", "polar or not?")],
        ]} />}
        prompt={q => q.kind === "shape" ? tx(t, "figChSp_qShape", "What shape is this molecule?") : tx(t, "figChSp_qPolar", "Is this molecule polar?")}
        stage={stage} solution={solution} />
    </Figure>
  );
}

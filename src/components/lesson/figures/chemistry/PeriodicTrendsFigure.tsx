"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Row, Readout, C, T, f2 } from "@/components/lesson/kit/figure";
import { ELEMENTS, type Element } from "./elements";
import { PeriodicTable, CW, CH, TABLE_H, ramp, RAMP_STOPS } from "./PeriodicTable";
import { CATEGORIES, CATEGORY_COLOR, categoryName, elementName } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// The whole periodic table coloured by one property at a time: category,
// state at 25 °C, covalent radius, first ionisation energy, electronegativity,
// electron affinity, density, melting point. Hover or tap an element for its
// card. "Graph" plots the same property against the atomic number for Z 1–86,
// where the periodicity shows as a saw-tooth that restarts at every alkali
// metal. Break it: order the graph by atomic MASS, as Mendeleev had to; three
// pairs (Ar–K, Co–Ni, Te–I) come out swapped and the saw-tooth glitches there.

type NumProp = "rCov" | "ie" | "en" | "ea" | "density" | "mp";
type Prop = "cat" | "state" | NumProp;

const NUM: Record<NumProp, { unit: string; log?: boolean; d: number; label: [string, string]; trend: [string, string] }> = {
  rCov: { unit: "pm", d: 0, label: ["figChPT_rCov", "covalent radius"],
    trend: ["figChPT_trRCov", "→ across a period: smaller · ↓ down a group: larger"] },
  ie: { unit: "eV", d: 2, label: ["figChPT_ie", "first ionisation energy"],
    trend: ["figChPT_trIe", "→ across a period: higher · ↓ down a group: lower · peaks at the noble gases"] },
  en: { unit: "", d: 2, label: ["figChPT_en", "electronegativity (Pauling)"],
    trend: ["figChPT_trEn", "→ across a period: higher · ↓ down a group: lower · fluorine is the top (3.98)"] },
  ea: { unit: "eV", d: 2, label: ["figChPT_ea", "electron affinity"],
    trend: ["figChPT_trEa", "→ grows toward the halogens · dashed cells: the atom does not hold an extra electron"] },
  density: { unit: "g/cm³", log: true, d: 2, label: ["figChPT_density", "density (log scale)"],
    trend: ["figChPT_trDensity", "highest in the middle of period 6 (osmium 22.6) · gases are a thousand times lighter"] },
  mp: { unit: "K", d: 0, label: ["figChPT_mp", "melting point"],
    trend: ["figChPT_trMp", "highest in the middle (carbon, tungsten) · lowest at the edges (noble gases, alkali metals)"] },
};
const STATE_COLOR = { s: "#64748b", l: "#3b82f6", g: "#f59e0b" } as const;
const ALKALI = new Set([3, 11, 19, 37, 55]), NOBLE = new Set([2, 10, 18, 36, 54, 86]);

const W = 560, X0 = 10, Y0 = 16, H = Y0 + TABLE_H + 54;
const GZ = 86;                                              // the graph stops at radon: data beyond is sparse

const valueOf = (e: Element, p: NumProp) => e[p];
function range(p: NumProp): [number, number] {
  const vs = ELEMENTS.map(e => valueOf(e, p)).filter((v): v is number => v != null && v > 0);
  const f = NUM[p].log ? Math.log10 : (v: number) => v;
  return [f(Math.min(...vs)), f(Math.max(...vs))];
}
const fmt = (v: number, p: NumProp) => (p === "density" && v < 0.01 ? v.toExponential(1) : f2(v, NUM[p].d));

export function PeriodicTrendsFigure({ t }: { t?: TrackTranslations }) {
  const [prop, setProp] = useState<Prop>("cat");
  const [view, setView] = useState<"table" | "graph">("table");
  const [order, setOrder] = useState<"z" | "mass">("z");
  const [sel, setSel] = useState(11);
  const e = ELEMENTS[sel - 1];
  const numeric = prop !== "cat" && prop !== "state";
  const showGraph = view === "graph" && numeric;

  const [lo, hi] = numeric ? range(prop) : [0, 1];
  const u = (v: number) => ((numeric && NUM[prop].log ? Math.log10(v) : v) - lo) / (hi - lo);
  const fill = (x: Element): string | null => {
    if (prop === "cat") return CATEGORY_COLOR[x.cat];
    if (prop === "state") return x.predicted ? null : STATE_COLOR[x.state];
    const v = valueOf(x, prop);
    return v == null || v <= 0 ? null : ramp(u(v));
  };
  const small = (x: Element): string | null => {
    if (!numeric) return null;
    const v = valueOf(x, prop);
    return v == null || v <= 0 ? null : prop === "density" ? (v < 0.01 ? tx(t, "figChPT_gas", "gas") : f2(v, 1)) : prop === "en" ? f2(v, 2) : prop === "rCov" || prop === "mp" ? f2(v, 0) : f2(v, 1);
  };
  const propLabel = numeric ? tx(t, NUM[prop].label[0], NUM[prop].label[1]) : "";
  const selValue = numeric ? (valueOf(e, prop) != null && (valueOf(e, prop) as number) > 0
    ? `${propLabel}: ${fmt(valueOf(e, prop) as number, prop)} ${NUM[prop].unit}`
    : `${propLabel}: ${tx(t, "figChPT_none", "no value")}`) : "";

  // ── Table view
  const card = (
    <g>
      <rect x={X0 + 2 * CW + 4} y={Y0 + 2} width={10 * CW - 8} height={3 * CH - 6} rx={6} fill="var(--card)" stroke="var(--border)" />
      <text x={X0 + 2 * CW + 16} y={Y0 + 20} fontSize={8} fill={C.muted}>{e.z}</text>
      <text x={X0 + 2 * CW + 14} y={Y0 + 50} fontSize={28} fontWeight={700} fill={CATEGORY_COLOR[e.cat]}>{e.sym}</text>
      <T x={X0 + 2 * CW + 72} y={Y0 + 20} color={C.fg} size={12} bold>{elementName(t, e)}</T>
      <T x={X0 + 2 * CW + 72} y={Y0 + 35} color={C.muted}>{`Z = ${e.z} · ${e.mass} u · ${tx(t, "figChPT_period", "period")} ${e.period}${e.group ? ` · ${tx(t, "figChPT_group", "group")} ${e.group}` : ""}`}</T>
      <T x={X0 + 2 * CW + 72} y={Y0 + 49} color={C.muted}>{e.config}</T>
      <T x={X0 + 2 * CW + 72} y={Y0 + 63} color={CATEGORY_COLOR[e.cat]} bold>{categoryName(t, e.cat)}</T>
      {numeric && <T x={X0 + 2 * CW + 72} y={Y0 + 79} color={C.amber} bold>{selValue}</T>}
    </g>
  );
  const legendY = Y0 + TABLE_H + 12;
  const legend = numeric ? (
    <g>
      <defs>
        <linearGradient id="chpt-ramp">{RAMP_STOPS.map((c, i) => <stop key={i} offset={i / (RAMP_STOPS.length - 1)} stopColor={c} />)}</linearGradient>
      </defs>
      <rect x={X0 + 90} y={legendY} width={260} height={10} rx={2} fill="url(#chpt-ramp)" />
      <T x={X0 + 86} y={legendY + 8} anchor="end">{fmt(NUM[prop].log ? 10 ** lo : lo, prop)}</T>
      <T x={X0 + 354} y={legendY + 8}>{`${fmt(NUM[prop].log ? 10 ** hi : hi, prop)} ${NUM[prop].unit}`}</T>
      <T x={X0 + 90} y={legendY + 24}>{tx(t, "figChPT_dashed", "dashed cell: no measured value")}</T>
    </g>
  ) : prop === "cat" ? (
    <g>
      {CATEGORIES.map((c, i) => (
        <g key={c} transform={`translate(${X0 + (i % 4) * 135},${legendY + Math.floor(i / 4) * 13})`}>
          <rect width={9} height={9} rx={2} fill={CATEGORY_COLOR[c]} />
          <T x={13} y={8}>{categoryName(t, c)}</T>
        </g>
      ))}
    </g>
  ) : (
    <g>
      {(["s", "l", "g"] as const).map((s, i) => (
        <g key={s} transform={`translate(${X0 + 90 + i * 100},${legendY})`}>
          <rect width={9} height={9} rx={2} fill={STATE_COLOR[s]} />
          <T x={13} y={8}>{tx(t, `figChPT_st_${s}`, s === "s" ? "solid" : s === "l" ? "liquid" : "gas")}</T>
        </g>
      ))}
      <T x={X0 + 90} y={legendY + 24}>{tx(t, "figChPT_predicted", "dashed: made only a few atoms at a time, state not known")}</T>
    </g>
  );
  const table = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {Array.from({ length: 18 }, (_, g) => (
        <text key={g} x={X0 + g * CW + CW / 2} y={Y0 - 4} fontSize={6} textAnchor="middle" fill={C.muted}>{g + 1}</text>
      ))}
      <PeriodicTable x0={X0} y0={Y0} fill={fill} value={small} sel={sel} onPick={setSel} />
      {card}
      <text x={X0 + 3 * CW - 4} y={Y0 + 7 * CH + 10 + 19} fontSize={7} textAnchor="end" fill={C.muted}>{tx(t, "figChPT_lan", "lanthanides")}</text>
      <text x={X0 + 3 * CW - 4} y={Y0 + 8 * CH + 10 + 19} fontSize={7} textAnchor="end" fill={C.muted}>{tx(t, "figChPT_act", "actinides")}</text>
      {legend}
    </svg>
  );

  // ── Graph view: the property against Z (or against the mass rank)
  const GW = 560, GH = 300, L = 44, R = 536, TOP = 30, BOT = 262;
  const els = ELEMENTS.slice(0, GZ);
  const byMass = [...els].sort((a, b) => a.mass - b.mass);
  const rank = new Map(byMass.map((x, i) => [x.z, i + 1]));
  const swapped = els.filter((x, i) => i + 1 < GZ && x.mass > els[i + 1].mass).map(x => [x, els[x.z]] as const);
  const xOf = (x: Element) => L + (((order === "mass" ? rank.get(x.z)! : x.z) - 1) / (GZ - 1)) * (R - L);
  const yOf = (v: number) => BOT - u(v) * (BOT - TOP);
  const seq = order === "mass" ? byMass : els;
  let path = "", pen = false;
  if (numeric) for (const x of seq) {
    const v = valueOf(x, prop);
    if (v == null || v <= 0) { pen = false; continue; }
    path += `${pen ? "L" : "M"}${xOf(x).toFixed(1)},${yOf(v).toFixed(1)} `;
    pen = true;
  }
  const graph = numeric && (
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full h-auto">
      <line x1={L} x2={R} y1={BOT} y2={BOT} stroke={C.axis} />
      <line x1={L} x2={L} y1={TOP} y2={BOT} stroke={C.axis} />
      {[1, 10, 20, 30, 40, 50, 60, 70, 80].map(z => (
        <T key={z} x={L + ((z - 1) / (GZ - 1)) * (R - L)} y={BOT + 12} anchor="middle">{String(z)}</T>
      ))}
      <T x={(L + R) / 2} y={BOT + 26} anchor="middle" color={C.fg}>{order === "mass"
        ? tx(t, "figChPT_xMass", "position when sorted by atomic mass")
        : tx(t, "figChPT_xZ", "atomic number Z")}</T>
      <T x={L - 4} y={TOP + 4} anchor="end">{fmt(NUM[prop].log ? 10 ** hi : hi, prop)}</T>
      <T x={L - 4} y={BOT} anchor="end">{fmt(NUM[prop].log ? 10 ** lo : lo, prop)}</T>
      <T x={R} y={14} anchor="end" color={C.fg}>{`${propLabel}${NUM[prop].unit ? ` (${NUM[prop].unit})` : ""}`}</T>
      <path d={path} fill="none" stroke={C.muted} strokeWidth={1} />
      {seq.map(x => {
        const v = valueOf(x, prop);
        if (v == null || v <= 0) return null;
        const px = xOf(x), py = yOf(v), out = order === "mass" && rank.get(x.z) !== x.z;
        return (
          <g key={x.z} onClick={() => setSel(x.z)} onMouseEnter={() => setSel(x.z)} style={{ cursor: "pointer" }}>
            <circle cx={px} cy={py} r={7} fill="transparent" />
            <circle cx={px} cy={py} r={x.z === sel ? 4.5 : 2.6} fill={CATEGORY_COLOR[x.cat]} stroke={out ? C.red : x.z === sel ? C.fg : "none"} strokeWidth={out ? 2 : 1.4} />
            {(ALKALI.has(x.z) || NOBLE.has(x.z) || out) && (
              ALKALI.has(x.z) && !out
                ? <T x={px + 6} y={py + 3} color={C.fg} bold>{x.sym}</T>
                : <T x={px} y={NOBLE.has(x.z) || (out && x.z % 2) ? py - 7 : py + 13} anchor="middle" color={out ? C.red : C.fg} bold>{x.sym}</T>
            )}
          </g>
        );
      })}
    </svg>
  );

  const props: [Prop, string][] = [
    ["cat", tx(t, "figChPT_cat", "category")], ["state", tx(t, "figChPT_state", "state")],
    ["rCov", tx(t, "figChPT_bRCov", "radius")], ["ie", tx(t, "figChPT_bIe", "ionisation energy")],
    ["en", tx(t, "figChPT_bEn", "electronegativity")], ["ea", tx(t, "figChPT_bEa", "electron affinity")],
    ["density", tx(t, "figChPT_bDensity", "density")], ["mp", tx(t, "figChPT_bMp", "melting point")],
  ];

  return (
    <Figure title={tx(t, "figChPT_title", "The periodic table, coloured by a property")}
      head={<Choice value={view} onChange={setView} options={[["table", tx(t, "figChPT_table", "table")], ["graph", tx(t, "figChPT_graph", "graph against Z")]]} />}
      controls={<>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}><Choice value={prop} onChange={setProp} options={props} /></div>
        {showGraph && (
          <Row>
            <Choice value={order} onChange={setOrder} options={[
              ["z", tx(t, "figChPT_byZ", "order by atomic number")], ["mass", tx(t, "figChPT_byMass", "break it: order by mass")],
            ]} />
          </Row>
        )}
        <Row>
          {numeric && <Readout color={C.sky}>{tx(t, NUM[prop].trend[0], NUM[prop].trend[1])}</Readout>}
          {showGraph && <Readout>{`${e.sym}, ${elementName(t, e)} · ${selValue}`}</Readout>}
          {showGraph && order === "mass" && (
            <Readout color={C.red}>{`${tx(t, "figChPT_swapped", "out of order")}: ${swapped.map(([a, b]) => `${a.sym} ${f2(a.mass, 2)} > ${b.sym} ${f2(b.mass, 2)}`).join(" · ")}`}</Readout>
          )}
        </Row>
      </>}
      note={view === "graph" && !numeric
        ? tx(t, "figChPT_noteNoGraph", "Category and state are names, not numbers, so they have no graph: pick a numeric property such as the radius or the ionisation energy.")
        : showGraph
          ? tx(t, "figChPT_noteGraph", "The same property against the atomic number. It does not rise steadily: it climbs (or falls) along each period and then jumps back at every alkali metal, as if the pattern restarted. That repeating saw-tooth is what \"periodic\" means. Now order the elements by mass, as Mendeleev had to in 1869: three pairs come out swapped, because a heavier isotope mix can sit on the lighter element. Mendeleev swapped tellurium and iodine by hand to keep the chemistry right; Moseley showed in 1913 that the real order is the nuclear charge Z.")
          : tx(t, "figChPT_note", "Hover or tap any element for its card. Each colouring shows one property for all 118 elements at once. Category first: metals fill the left and the middle, nonmetals the upper right, with a staircase of metalloids between them. Then try the radius, the ionisation energy and the electronegativity: each changes smoothly across a row and down a column, and the chapter explains why. The two rows at the bottom belong inside periods 6 and 7; they are drawn apart only so the table fits on a page.")}>
      {showGraph ? graph : table}
    </Figure>
  );
}

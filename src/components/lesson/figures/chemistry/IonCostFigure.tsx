"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, T, f2 } from "@/components/lesson/kit/figure";
import { BY_SYMBOL } from "./elements";
import { elementName, sup } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// What it costs to make an ion. Pick an element and a charge: the atom (shells
// as rings) loses or gains electrons, and the bars show the successive
// ionisation energies, filled for the electrons already removed. Each step
// costs a little more, until the next electron would come from a full inner
// shell and the cost jumps by a factor of 5 to 10: the charge stops there,
// exactly at the noble gas configuration. On the other side, the first extra
// electron of a nonmetal releases energy (the electron affinity), but a second
// one is repelled by the first: a lone O²⁻ or N³⁻ in a gas falls apart. Those
// ions only exist where something pays for them (the crystal of the next
// chapter). Break it: push sodium to +2 and the price goes from 5 to 52 eV.

const W = 560, H = 280;
const EV_TO_KJ = 96.485;

/** Successive ionisation energies (eV), NIST Atomic Spectra Database. */
const IE: Record<string, number[]> = {
  Li: [5.392, 75.64, 122.45],
  Na: [5.139, 47.29, 71.62, 98.91],
  K: [4.341, 31.63, 45.81, 60.91],
  Mg: [7.646, 15.04, 80.14, 109.27],
  Ca: [6.113, 11.87, 50.91, 67.27],
  Al: [5.986, 18.83, 28.45, 119.99],
  C: [11.26, 24.38, 47.89, 64.49, 392.09],
  N: [14.53, 29.6, 47.45, 77.47, 97.89],
  O: [13.62, 35.12, 54.94, 77.41],
  F: [17.42, 34.97, 62.71],
  S: [10.36, 23.34, 34.86, 47.22],
  Cl: [12.97, 23.81, 39.61, 53.47],
};
const PICKS = ["Li", "Na", "K", "Mg", "Ca", "Al", "C", "N", "O", "S", "F", "Cl"];
const NOBLE: Record<number, string> = { 0: "", 2: "He", 10: "Ne", 18: "Ar" };
const ORDER: [string, number][] = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["4s", 2]];

/** Electrons per shell n = 1..4 for a count of up to 20 (main-group filling). */
function perShell(e: number): number[] {
  const out = [0, 0, 0, 0, 0];
  let left = e;
  for (const [sub, cap] of ORDER) { const k = Math.min(cap, left); out[+sub[0]] += k; left -= k; }
  return out;
}
/** "1s² 2s² 2p⁶" for a count of up to 20 electrons. */
function config(e: number): string {
  const parts: string[] = [];
  let left = e;
  for (const [sub, cap] of ORDER) { if (left <= 0) break; const k = Math.min(cap, left); parts.push(sub + sup(k)); left -= k; }
  return parts.join(" ") || "—";
}
const chargeLabel = (q: number) => (q === 0 ? "0" : `${Math.abs(q) > 1 ? Math.abs(q) : ""}${q > 0 ? "+" : "−"}`);

export function IonCostFigure({ t }: { t?: TrackTranslations }) {
  const [sym, setSym] = useState("Na");
  const [q, setQ] = useState(1);
  const el = BY_SYMBOL[sym];
  const ies = IE[sym];
  const z = el.z, e = z - q;
  const shellsNow = perShell(e), shellsAtom = perShell(z);
  const nOuter = Math.max(...[1, 2, 3, 4].filter(k => shellsAtom[k] > 0));
  const noble = NOBLE[e];

  // ── Energy of the chosen ion, from the neutral atom
  let cost: number | null = 0;
  if (q > 0) cost = ies.slice(0, q).reduce((a, b) => a + b, 0);
  else if (q === -1) cost = el.ea !== null ? -el.ea : null;
  else if (q < -1) cost = null;

  // ── Atom: rings, kept electrons, removed ones as ghosts, added ones green
  const cx = 120, cy = 150, ringR = (k: number) => 24 + k * 24;
  const dots: { x: number; y: number; kind: "in" | "out" | "add" }[] = [];
  const shown = Math.max(nOuter, [1, 2, 3, 4].filter(k => shellsNow[k] > 0).pop() ?? 1);
  for (let k = 1; k <= shown; k++) {
    const total = Math.max(shellsAtom[k], shellsNow[k]), r = ringR(k);
    for (let i = 0; i < total; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(total, 1) + k * 0.35;
      const kind = i < Math.min(shellsAtom[k], shellsNow[k]) ? "in" : shellsNow[k] > shellsAtom[k] ? "add" : "out";
      dots.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), kind });
    }
  }

  // ── Bars: successive ionisation energies on a common scale for this element
  const BL = 300, BR = 548, BT = 46, BB = 196;
  const max = Math.max(...ies);
  const bw = (BR - BL) / ies.length;
  const jumpAt = ies.findIndex((v, i) => i > 0 && v / ies[i - 1] > 3.5);     // first electron of an inner shell

  const qMax = ies.length, qs: number[] = [];
  for (let k = -3; k <= qMax; k++) qs.push(k);

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {Array.from({ length: shown }, (_, k) => (
        <circle key={k} cx={cx} cy={cy} r={ringR(k + 1)} fill="none" stroke={C.grid} strokeDasharray={k + 1 === shown ? undefined : "3 3"} />
      ))}
      <circle cx={cx} cy={cy} r={14} fill={C.red} />
      <text x={cx} y={cy + 3.5} fontSize={9} fontWeight={700} textAnchor="middle" fill="#fff">{`+${z}`}</text>
      {dots.map((d, i) => d.kind === "out"
        ? <circle key={i} cx={d.x} cy={d.y} r={3.6} fill="none" stroke={C.amber} strokeDasharray="2 1.5" />
        : <circle key={i} cx={d.x} cy={d.y} r={3.4} fill={d.kind === "add" ? C.green : C.sky} />)}
      <T x={14} y={20} color={C.fg} size={13} bold>{`${sym}${q === 0 ? "" : sup(chargeLabel(q).replace("−", "-"))}`}</T>
      <T x={14} y={35}>{`${elementName(t, el)} · ${z} ${tx(t, "figChIc_protons", "protons")} · ${e} ${tx(t, "figChIc_electrons", "electrons")}`}</T>
      <T x={14} y={49}>{config(e)}</T>
      {noble && q !== 0 && <T x={14} y={H - 12} color={C.green} bold>{tx(t, "figChIc_noble", "same electrons as {g}: a noble gas configuration").replace("{g}", noble)}</T>}
      {q === 0 && <T x={14} y={H - 12}>{tx(t, "figChIc_neutral", "neutral atom: as many electrons as protons")}</T>}

      <T x={BL} y={20} color={C.fg} bold>{tx(t, "figChIc_bars", "energy to remove each electron in turn (eV)")}</T>
      <line x1={BL} x2={BR} y1={BB} y2={BB} stroke={C.axis} />
      {ies.map((v, i) => {
        const h = Math.max(2, (v / max) * (BB - BT)), x = BL + i * bw + 4, removed = i < q;
        return (
          <g key={i}>
            <rect x={x} y={BB - h} width={bw - 8} height={h} rx={2}
              fill={removed ? (i === jumpAt ? C.red : C.amber) : "none"} fillOpacity={removed ? 0.85 : 0}
              stroke={i === jumpAt ? C.red : C.amber} strokeDasharray={removed ? undefined : "3 2"} />
            <T x={x + (bw - 8) / 2} y={BB - h - 4} anchor="middle" color={C.fg}>{f2(v, v < 100 ? 1 : 0)}</T>
            <T x={x + (bw - 8) / 2} y={BB + 12} anchor="middle">{`${i + 1}.`}</T>
          </g>
        );
      })}
      {jumpAt > 0 && (
        <T x={BL + jumpAt * bw + bw / 2} y={BB + 25} anchor="middle" color={C.red}>{tx(t, "figChIc_inner", "inner shell")}</T>
      )}
      <T x={BL} y={H - 40} color={C.fg}>{tx(t, "figChIc_cost", "energy to make this ion from the atom:")}</T>
      <T x={BL} y={H - 24} color={cost === null ? C.red : cost < 0 ? C.green : C.amber} size={12} bold>
        {cost === null
          ? (q === -1 ? tx(t, "figChIc_noEa", "no value: this atom does not hold an extra electron")
            : tx(t, "figChIc_unbound", "a lone gas ion with this charge falls apart"))
          : cost === 0 ? "0"
            : `${cost < 0 ? "−" : "+"}${f2(Math.abs(cost), 2)} eV  =  ${cost < 0 ? "−" : "+"}${f2(Math.abs(cost) * EV_TO_KJ, 0)} kJ/mol`}
      </T>
      {cost !== null && cost < 0 && <T x={BL} y={H - 10} color={C.green}>{tx(t, "figChIc_released", "negative: energy is released")}</T>}
      {q > 0 && jumpAt > 0 && q > jumpAt && <T x={BL} y={H - 10} color={C.red}>{tx(t, "figChIc_tooFar", "past the noble gas: this ion never forms in chemistry")}</T>}
    </svg>
  );

  return (
    <Figure title={tx(t, "figChIc_title", "The price of an ion")}
      controls={<>
        <Row>
          {PICKS.map(s => <Btn key={s} active={sym === s} onClick={() => { setSym(s); setQ(0); }}>{s}</Btn>)}
        </Row>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figChIc_charge", "charge:")}</span>
          {qs.map(k => <Btn key={k} active={q === k} onClick={() => setQ(k)}>{k > 0 ? `+${k}` : k < 0 ? `−${-k}` : "0"}</Btn>)}
          {sym === "Na" && <Btn active={q === 2} onClick={() => setQ(2)}>{tx(t, "figChIc_break", "break it: Na²⁺")}</Btn>}
        </Row>
        <Row>
          <Readout>{`${tx(t, "figChIc_val", "valence electrons")}: ${shellsAtom[nOuter]}`}</Readout>
          {el.ea !== null && <Readout color={C.green}>{`${tx(t, "figChIc_ea", "electron affinity")}: ${f2(el.ea, 2)} eV`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figChIc_note", "Pick an element, then a charge. Positive charges remove electrons one by one, and the bars add up their cost: each is a bit harder than the last, since the ion left behind is more positive, until the next one would come from a full inner shell. There the bar jumps (red), because that electron sits much closer to the nucleus and is barely screened. The charge an element really takes is the last one before the jump, which always leaves a noble gas configuration: Na⁺, Mg²⁺, Al³⁺. Negative charges add electrons: chlorine releases 3.61 eV for its first extra electron, but no second electron sticks to any lone atom. Notice that even Na⁺ costs energy (5.14 eV) and Cl⁻ only gives back 3.61: making the ions alone never pays. The next chapter finds what does.")}>
      {view}
    </Figure>
  );
}

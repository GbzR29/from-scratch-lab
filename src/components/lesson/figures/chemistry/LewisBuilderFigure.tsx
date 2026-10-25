"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, T } from "@/components/lesson/kit/figure";
import { BY_SYMBOL } from "./elements";
import { formula } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// Build Lewis structures by hand. The skeleton (which atom is bonded to which)
// is given; click a bond to make it single, double or triple, and click an
// atom to add lone pairs. The panel keeps the books: electrons placed against
// the valence electrons available, each atom's electron count (ring colour:
// green when it has its octet, or 2 for hydrogen, 6 or 8 for boron), and the
// formal charges. The figure knows every valid structure (it tries them all)
// and says when yours is the best one: the fewest formal charges, with any
// negative charge on the most electronegative atom. Molecules with several
// equally good answers (O₃, NO₃⁻) are resonance cases.

type A = { el: string; x: number; y: number };
type Mol = { id: string; f: string; charge: number; atoms: A[]; bonds: [number, number][] };

const MOLS: Mol[] = [
  { id: "H2O", f: "H2O", charge: 0, atoms: [{ el: "O", x: 165, y: 95 }, { el: "H", x: 105, y: 135 }, { el: "H", x: 225, y: 135 }], bonds: [[0, 1], [0, 2]] },
  { id: "NH3", f: "NH3", charge: 0, atoms: [{ el: "N", x: 165, y: 90 }, { el: "H", x: 105, y: 120 }, { el: "H", x: 225, y: 120 }, { el: "H", x: 165, y: 158 }], bonds: [[0, 1], [0, 2], [0, 3]] },
  { id: "CO2", f: "CO2", charge: 0, atoms: [{ el: "O", x: 95, y: 110 }, { el: "C", x: 165, y: 110 }, { el: "O", x: 235, y: 110 }], bonds: [[0, 1], [1, 2]] },
  { id: "HCN", f: "HCN", charge: 0, atoms: [{ el: "H", x: 95, y: 110 }, { el: "C", x: 165, y: 110 }, { el: "N", x: 235, y: 110 }], bonds: [[0, 1], [1, 2]] },
  { id: "N2", f: "N2", charge: 0, atoms: [{ el: "N", x: 135, y: 110 }, { el: "N", x: 195, y: 110 }], bonds: [[0, 1]] },
  { id: "CH2O", f: "CH2O", charge: 0, atoms: [{ el: "C", x: 165, y: 120 }, { el: "O", x: 165, y: 55 }, { el: "H", x: 108, y: 155 }, { el: "H", x: 222, y: 155 }], bonds: [[0, 1], [0, 2], [0, 3]] },
  { id: "C2H2", f: "C2H2", charge: 0, atoms: [{ el: "H", x: 70, y: 110 }, { el: "C", x: 135, y: 110 }, { el: "C", x: 195, y: 110 }, { el: "H", x: 260, y: 110 }], bonds: [[0, 1], [1, 2], [2, 3]] },
  { id: "CO", f: "CO", charge: 0, atoms: [{ el: "C", x: 135, y: 110 }, { el: "O", x: 195, y: 110 }], bonds: [[0, 1]] },
  { id: "O3", f: "O3", charge: 0, atoms: [{ el: "O", x: 165, y: 85 }, { el: "O", x: 105, y: 125 }, { el: "O", x: 225, y: 125 }], bonds: [[0, 1], [0, 2]] },
  { id: "NO3", f: "NO3", charge: -1, atoms: [{ el: "N", x: 165, y: 115 }, { el: "O", x: 165, y: 52 }, { el: "O", x: 110, y: 148 }, { el: "O", x: 220, y: 148 }], bonds: [[0, 1], [0, 2], [0, 3]] },
  { id: "OCN", f: "OCN", charge: -1, atoms: [{ el: "O", x: 95, y: 110 }, { el: "C", x: 165, y: 110 }, { el: "N", x: 235, y: 110 }], bonds: [[0, 1], [1, 2]] },
  { id: "BF3", f: "BF3", charge: 0, atoms: [{ el: "B", x: 165, y: 115 }, { el: "F", x: 165, y: 52 }, { el: "F", x: 110, y: 148 }, { el: "F", x: 220, y: 148 }], bonds: [[0, 1], [0, 2], [0, 3]] },
];

const VALENCE: Record<string, number> = { H: 1, B: 3, C: 4, N: 5, O: 6, F: 7 };
const ALLOWED: Record<string, number[]> = { H: [2], B: [6, 8] };
const allowed = (el: string) => ALLOWED[el] ?? [8];

type S = { orders: number[]; lps: number[] };

function analyse(m: Mol, s: S) {
  const bondSum = m.atoms.map((_, i) => m.bonds.reduce((acc, [a, b], k) => acc + (a === i || b === i ? s.orders[k] : 0), 0));
  const around = m.atoms.map((_, i) => 2 * bondSum[i] + 2 * s.lps[i]);
  const fc = m.atoms.map((a, i) => VALENCE[a.el] - 2 * s.lps[i] - bondSum[i]);
  const placed = 2 * s.orders.reduce((x, y) => x + y, 0) + 2 * s.lps.reduce((x, y) => x + y, 0);
  const ok = m.atoms.map((a, i) => allowed(a.el).includes(around[i]));
  const score = [fc.reduce((x, v) => x + Math.abs(v), 0), fc.reduce((x, v, i) => x + v * (BY_SYMBOL[m.atoms[i].el].en ?? 0), 0)];
  return { bondSum, around, fc, placed, ok, score };
}
const target = (m: Mol) => m.atoms.reduce((x, a) => x + VALENCE[a.el], 0) - m.charge;

/** Every valid structure, and the best ones (fewest formal charges, then negative charge on the most electronegative atom). */
function solve(m: Mol): S[] {
  const nb = m.bonds.length, all: { s: S; score: number[] }[] = [];
  for (let code = 0; code < 3 ** nb; code++) {
    const orders = Array.from({ length: nb }, (_, k) => 1 + (Math.floor(code / 3 ** k) % 3));
    const bs = m.atoms.map((_, i) => m.bonds.reduce((acc, [a, b], k) => acc + (a === i || b === i ? orders[k] : 0), 0));
    const choices = m.atoms.map((a, i) => allowed(a.el).map(c => (c - 2 * bs[i]) / 2).filter(lp => lp >= 0));
    const walk = (i: number, lps: number[]) => {
      if (i === m.atoms.length) {
        const s = { orders, lps: [...lps] };
        const an = analyse(m, s);
        if (an.placed === target(m)) all.push({ s, score: an.score });
        return;
      }
      for (const lp of choices[i]) walk(i + 1, [...lps, lp]);
    };
    walk(0, []);
  }
  const best = (x: number[], y: number[]) => x[0] - y[0] || x[1] - y[1];
  all.sort((p, q) => best(p.score, q.score));
  return all.filter(p => Math.abs(best(p.score, all[0].score)) < 1e-6).map(p => p.s);
}

/** Directions (radians) for n lone pairs, as far as possible from the bonds and from each other. */
function lpAngles(bondDirs: number[], n: number): number[] {
  const taken = [...bondDirs], out: number[] = [];
  const dist = (a: number, b: number) => { const d = Math.abs(a - b) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d); };
  for (let k = 0; k < n; k++) {
    let best = -Math.PI / 2, bestD = -1;
    for (let a = 0; a < 360; a += 15) {
      const ang = (a * Math.PI) / 180 - Math.PI / 2;
      const d = taken.length ? Math.min(...taken.map(t => dist(t, ang))) : Math.PI;
      if (d > bestD + 1e-6) { bestD = d; best = ang; }
    }
    out.push(best); taken.push(best);
  }
  return out;
}

const W = 560, H = 250;

export function LewisBuilderFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState("H2O");
  const m = MOLS.find(x => x.id === id)!;
  const fresh = (mm: Mol): S => ({ orders: mm.bonds.map(() => 1), lps: mm.atoms.map(() => 0) });
  const [s, setS] = useState<S>(() => fresh(m));
  const [showFc, setShowFc] = useState(true);
  const [answer, setAnswer] = useState(0);

  const bestList = useMemo(() => solve(m), [m]);
  const an = analyse(m, s);
  const need = target(m);
  const allOk = an.ok.every(Boolean) && an.placed === need;
  const isBest = allOk && Math.abs(an.score[0] - analyse(m, bestList[0]).score[0]) < 1e-6 && Math.abs(an.score[1] - analyse(m, bestList[0]).score[1]) < 1e-6;

  const pickMol = (k: string) => { const mm = MOLS.find(x => x.id === k)!; setId(k); setS(fresh(mm)); setAnswer(0); };
  const cycleBond = (k: number) => setS(v => ({ ...v, orders: v.orders.map((o, i) => (i === k ? (o % 3) + 1 : o)) }));
  const cycleLp = (i: number) => setS(v => ({ ...v, lps: v.lps.map((l, j) => (j === i ? (l + 1) % 5 : l)) }));
  const showAnswer = () => { const b = bestList[answer % bestList.length]; setS({ orders: [...b.orders], lps: [...b.lps] }); setAnswer(a => a + 1); };

  const ring = (i: number) => an.ok[i] ? C.green : an.around[i] > Math.max(...allowed(m.atoms[i].el)) ? C.red : C.amber;
  const valText = m.atoms.reduce((acc, a) => { acc[a.el] = (acc[a.el] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const breakdown = Object.entries(valText).map(([el, n]) => `${n > 1 ? `${n}×` : ""}${el} ${VALENCE[el]}`).join(" + ") + (m.charge ? ` + ${-m.charge} (${tx(t, "figChLw_charge", "charge")})` : "");

  const xs = m.atoms.map(a => a.x), ys = m.atoms.map(a => a.y);
  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* bonds */}
      {m.bonds.map(([a, b], k) => {
        const A = m.atoms[a], B = m.atoms[b];
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        const o = s.orders[k];
        return (
          <g key={k} onClick={() => cycleBond(k)} style={{ cursor: "pointer" }}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="transparent" strokeWidth={18} />
            {Array.from({ length: o }, (_, j) => {
              const off = (j - (o - 1) / 2) * 5;
              return <line key={j} x1={A.x + ux * 15 + nx * off} y1={A.y + uy * 15 + ny * off} x2={B.x - ux * 15 + nx * off} y2={B.y - uy * 15 + ny * off}
                stroke={C.fg} strokeWidth={2} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
      {/* atoms with lone pairs */}
      {m.atoms.map((a, i) => {
        const dirs = m.bonds.filter(([p, q]) => p === i || q === i).map(([p, q]) => { const o = m.atoms[p === i ? q : p]; return Math.atan2(o.y - a.y, o.x - a.x); });
        const angs = lpAngles(dirs, s.lps[i]);
        return (
          <g key={i} onClick={() => cycleLp(i)} style={{ cursor: "pointer" }}>
            <circle cx={a.x} cy={a.y} r={14} fill="var(--card)" stroke={ring(i)} strokeWidth={2} />
            <text x={a.x} y={a.y + 4.5} fontSize={13} fontWeight={700} textAnchor="middle" fill="var(--text-main)">{a.el}</text>
            {angs.map((g, j) => {
              const cx = a.x + Math.cos(g) * 21, cy = a.y + Math.sin(g) * 21, px = -Math.sin(g) * 3.4, py = Math.cos(g) * 3.4;
              return <g key={j}><circle cx={cx + px} cy={cy + py} r={2.2} fill={C.sky} /><circle cx={cx - px} cy={cy - py} r={2.2} fill={C.sky} /></g>;
            })}
            {showFc && an.fc[i] !== 0 && (
              <g>
                <circle cx={a.x + 15} cy={a.y - 15} r={7.5} fill={an.fc[i] > 0 ? C.red : C.blue} />
                <text x={a.x + 15} y={a.y - 12} fontSize={8.5} fontWeight={700} textAnchor="middle" fill="#fff">{an.fc[i] > 0 ? `+${an.fc[i]}` : `−${-an.fc[i]}`}</text>
              </g>
            )}
          </g>
        );
      })}
      {m.charge !== 0 && (
        <g>
          <T x={Math.min(...xs) - 34} y={(Math.min(...ys) + Math.max(...ys)) / 2 + 10} color={C.fg} size={40}>[</T>
          <T x={Math.max(...xs) + 24} y={(Math.min(...ys) + Math.max(...ys)) / 2 + 10} color={C.fg} size={40}>]</T>
          <T x={Math.max(...xs) + 40} y={Math.min(...ys) - 6} color={C.fg} size={13} bold>{m.charge < 0 ? "−" : "+"}</T>
        </g>
      )}
      <T x={14} y={22} color={C.fg} size={13} bold>{formula(m.f) + (m.charge ? (m.charge < 0 ? "⁻" : "⁺") : "")}</T>

      {/* bookkeeping */}
      <T x={322} y={30} color={C.fg} bold>{tx(t, "figChLw_avail", "valence electrons")}</T>
      <T x={322} y={44}>{breakdown}</T>
      <T x={548} y={30} anchor="end" color={C.fg} size={12} bold>{need}</T>
      <T x={322} y={66} color={C.fg} bold>{tx(t, "figChLw_placed", "placed in the drawing")}</T>
      <T x={548} y={66} anchor="end" color={an.placed === need ? C.green : an.placed > need ? C.red : C.amber} size={12} bold>{an.placed}</T>
      <T x={322} y={90} color={C.fg} bold>{tx(t, "figChLw_each", "electrons around each atom")}</T>
      {m.atoms.map((a, i) => (
        <g key={i}>
          <T x={322 + (i % 4) * 52} y={106 + Math.floor(i / 4) * 14} color={ring(i)}>{`${a.el}${i + 1}: ${an.around[i]}`}</T>
        </g>
      ))}
      <T x={322} y={140} color={C.fg} bold>{tx(t, "figChLw_fc", "formal charges, total size")}</T>
      <T x={548} y={140} anchor="end" color={C.fg} bold>{an.fc.reduce((x, v) => x + Math.abs(v), 0)}</T>
      <T x={322} y={154}>{`${tx(t, "figChLw_fcRule", "FC = V − lone-pair e⁻ − bonds")}`}</T>

      <T x={322} y={186} color={isBest ? C.green : allOk ? C.amber : C.muted} size={11} bold>
        {isBest ? tx(t, "figChLw_best", "a correct Lewis structure")
          : allOk ? tx(t, "figChLw_valid", "every atom is satisfied...")
            : an.placed !== need ? tx(t, "figChLw_count", "electron count does not match yet")
              : tx(t, "figChLw_octet", "some atom lacks or exceeds its octet")}
      </T>
      <T x={322} y={202} color={isBest ? C.green : allOk ? C.amber : C.muted}>
        {isBest ? (bestList.length > 1 ? tx(t, "figChLw_res", "{n} equally good structures: resonance").replace("{n}", String(bestList.length)) : tx(t, "figChLw_only", "and the only best one"))
          : allOk ? tx(t, "figChLw_validMore", "...but the formal charges can be better") : ""}
      </T>
      <T x={14} y={H - 10} size={8.5}>{tx(t, "figChLw_how", "click a bond: single → double → triple · click an atom: add a lone pair")}</T>
    </svg>
  );

  return (
    <Figure title={tx(t, "figChLw_title", "Lewis structure builder")}
      controls={<>
        <Row>
          {MOLS.map(x => <Btn key={x.id} active={id === x.id} onClick={() => pickMol(x.id)}>{formula(x.f) + (x.charge ? "⁻" : "")}</Btn>)}
        </Row>
        <Row>
          <Btn onClick={() => { setS(fresh(m)); setAnswer(0); }}>{tx(t, "figChLw_reset", "start over")}</Btn>
          <Btn onClick={showAnswer}>{bestList.length > 1 && answer > 0 ? tx(t, "figChLw_another", "another best answer") : tx(t, "figChLw_answer", "show an answer")}</Btn>
          <Btn active={showFc} onClick={() => setShowFc(v => !v)}>{tx(t, "figChLw_showFc", "formal charges")}</Btn>
          <Readout color={an.placed === need ? C.green : C.amber}>{`${an.placed} / ${need}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChLw_note", "The recipe: (1) count the valence electrons, adding one per negative charge; (2) connect the atoms with single bonds; (3) give the outer atoms lone pairs until each has its octet (hydrogen: 2); (4) put any electrons left on the central atom; (5) if the central atom is still short, turn a lone pair of a neighbour into a second bond. The count on the right must match exactly, every ring must turn green, and among the structures that do, the best has the smallest formal charges. Try CO: the only way to give both atoms an octet is a triple bond, with a formal −1 on carbon and +1 on oxygen. Try BF₃: boron is happier with six electrons than with a double bond to fluorine. And O₃ or NO₃⁻: there is more than one best answer.")}>
      {view}
    </Figure>
  );
}

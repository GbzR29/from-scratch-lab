"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Choice, C, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// The slot method for counting arrangements: draw one box per position, write
// in each box how many options it has, and multiply. The order in which the
// boxes are filled is part of the method: the most restricted box goes first,
// so that every later box has a number of options that does not depend on
// what was put before. The Transport fills the boxes one at a time, in that
// order, and says why each number is what it is. A problem that splits into
// cases (even numbers: ending in 0 or not) gets one row per case, and the
// rows add.

type Txt = [string, string];
type Slot = { opt: number; tag: string; why: Txt };
type Case = { label?: Txt; slots: Slot[]; order: number[] };
type Preset = { id: string; name: Txt; cases: Case[] };

const PRESETS: Preset[] = [
  { id: "podium", name: ["figSlot_podium", "podium of 8 runners"], cases: [{ slots: [
    { opt: 8, tag: "1º", why: ["figSlot_p1", "gold: any of the 8 runners"] },
    { opt: 7, tag: "2º", why: ["figSlot_p2", "silver: anyone except the gold medallist"] },
    { opt: 6, tag: "3º", why: ["figSlot_p3", "bronze: the 6 who are left"] },
  ], order: [0, 1, 2] }] },
  { id: "pin", name: ["figSlot_pin", "4-digit PIN"], cases: [{ slots: [0, 1, 2, 3].map(() => (
    { opt: 10, tag: "0–9", why: ["figSlot_pinW", "any digit: repeats are allowed, so every box has all 10"] as Txt }
  )), order: [0, 1, 2, 3] }] },
  { id: "distinct", name: ["figSlot_distinct", "3 different digits"], cases: [{ slots: [
    { opt: 9, tag: "≠ 0", why: ["figSlot_d1", "first, the fussy box: a number cannot start with 0, so 1 to 9"] },
    { opt: 9, tag: "", why: ["figSlot_d2", "0 is allowed now, but not the digit already used: 10 − 1"] },
    { opt: 8, tag: "", why: ["figSlot_d3", "anything except the two digits used: 10 − 2"] },
  ], order: [0, 1, 2] }] },
  { id: "even", name: ["figSlot_even", "even, 3 different digits"], cases: [
    { label: ["figSlot_e0", "case 1: ends in 0"], slots: [
      { opt: 9, tag: "", why: ["figSlot_e0b", "first digit: 1 to 9, all still free (0 is at the end)"] },
      { opt: 8, tag: "", why: ["figSlot_e0c", "middle: 10 digits minus the two used"] },
      { opt: 1, tag: "0", why: ["figSlot_e0a", "the last box first: it must be 0, one option"] },
    ], order: [2, 0, 1] },
    { label: ["figSlot_e1", "case 2: ends in 2, 4, 6 or 8"], slots: [
      { opt: 8, tag: "≠ 0", why: ["figSlot_e1b", "first digit: not 0 and not the last digit, 10 − 2"] },
      { opt: 8, tag: "", why: ["figSlot_e1c", "middle: 0 is allowed again, minus the two used, 10 − 2"] },
      { opt: 4, tag: "2468", why: ["figSlot_e1a", "the last box first: 2, 4, 6 or 8"] },
    ], order: [2, 0, 1] },
  ] },
];

const BOX = 64, GAP = 18, W = 560;

export function SlotsFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState("distinct");
  const preset = PRESETS.find(p => p.id === id) ?? PRESETS[0];
  const total = preset.cases.reduce((s, c) => s + c.slots.length, 0);
  const [shown, setShown] = useState(total);
  const [playing, setPlaying] = useState(false);
  const acc = useRef(0);
  const vis = useVisible<HTMLDivElement>();
  const n = Math.min(shown, total);

  useFrame(playing && vis.on, dt => {
    if (n >= total) { setPlaying(false); return; }
    acc.current += dt;
    if (acc.current > 1.2) { acc.current = 0; setShown(v => v + 1); }
  });
  const stepTo = (v: number) => { setPlaying(false); setShown(Math.max(0, Math.min(total, v))); };
  const choose = (v: string) => { setId(v); setPlaying(false); setShown(0); };

  // which boxes are filled after n steps: the cases one after another, each in its fill order
  let left = n;
  const filled = preset.cases.map(c => { const k = Math.min(left, c.slots.length); left -= k; return new Set(c.order.slice(0, k)); });
  let last: { ci: number; si: number } | null = null;
  { let m = n; for (let ci = 0; ci < preset.cases.length && m > 0; ci++) { const c = preset.cases[ci]; const k = Math.min(m, c.slots.length); if (k > 0) last = { ci, si: c.order[k - 1] }; m -= k; } }

  const products = preset.cases.map(c => c.slots.reduce((p, s) => p * s.opt, 1));
  const answer = products.reduce((a, b) => a + b, 0);
  const rowH = 118, H = preset.cases.length * rowH + 6;

  return (
    <Figure
      title={tx(t, "figSlot_title", "The slot method")}
      head={<Choice value={id} onChange={choose} options={PRESETS.map(p => [p.id, tx(t, p.name[0], p.name[1])] as [string, string])} />}
      controls={<Row>
        {preset.cases.map((c, i) => <Readout key={i} color={i ? C.purple : C.blue}>{`${c.slots.map(s => s.opt).join(" · ")} = ${products[i]}`}</Readout>)}
        {preset.cases.length > 1 && <Readout color={C.green}>{`${products.join(" + ")} = ${answer}`}</Readout>}
      </Row>}
      note={tx(t, "figSlot_note", "One box per position; the number in a box is how many options that position has at the moment it is filled. Multiply the boxes. The small number above a box is the order in which it is filled: the box with a restriction goes first, so the count in every later box is the same whatever was put before. When the restriction cannot be handled that way (is the last digit 0 or not?), split into cases, one row each, and add the rows.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {preset.cases.map((c, ci) => {
            const y0 = ci * rowH + 26, wAll = c.slots.length * BOX + (c.slots.length - 1) * GAP, x0 = (W - wAll) / 2;
            return (
              <g key={ci}>
                {c.label && <T x={x0} y={y0 - 12} color={ci ? C.purple : C.blue} bold>{tx(t, c.label[0], c.label[1])}</T>}
                {c.slots.map((s, si) => {
                  const x = x0 + si * (BOX + GAP), on = filled[ci].has(si), cur = last?.ci === ci && last.si === si;
                  const col = ci ? C.purple : C.blue;
                  return (
                    <g key={si}>
                      <rect x={x} y={y0} width={BOX} height={BOX} rx={10} fill={on ? col : "var(--surface)"} fillOpacity={on ? (cur ? 0.32 : 0.16) : 1}
                        stroke={on ? col : "var(--border)"} strokeWidth={cur ? 2.2 : 1.2} strokeDasharray={on ? undefined : "4 4"} />
                      <T x={x + BOX / 2} y={y0 + BOX / 2 + 8} anchor="middle" color={C.fg} size={22} bold>{on ? String(s.opt) : ""}</T>
                      <T x={x + BOX - 6} y={y0 + 13} anchor="end" color={C.muted} size={9}>{`${c.order.indexOf(si) + 1}.`}</T>
                      {s.tag && <T x={x + BOX / 2} y={y0 + BOX + 15} anchor="middle" color={C.muted}>{s.tag}</T>}
                      {si < c.slots.length - 1 && <T x={x + BOX + GAP / 2} y={y0 + BOX / 2 + 5} anchor="middle" color={C.muted} size={14}>·</T>}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <div className="px-4 pb-2 min-h-[22px] text-[13px] text-[var(--text-main)]">
          {last ? tx(t, preset.cases[last.ci].slots[last.si].why[0], preset.cases[last.ci].slots[last.si].why[1]) : tx(t, "figSlot_start", "Press play to fill the boxes in the right order.")}
        </div>
        <Transport t={t} playing={playing}
          onPlay={() => { if (n >= total) setShown(0); acc.current = 0; setPlaying(p => !p); }}
          playLabel={tx(t, "figSlot_play", "fill the boxes one at a time")}
          onStep={() => stepTo(n + 1)}
          onBack={() => stepTo(n - 1)}
          onReset={() => stepTo(0)}
          readout={`${n} / ${total}`} />
      </div>
    </Figure>
  );
}

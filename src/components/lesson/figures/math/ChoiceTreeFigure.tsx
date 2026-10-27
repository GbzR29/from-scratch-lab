"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Slider, Choice, C, T } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The tree of possibilities behind the multiplication principle. Each column
// is one stage of a choice (shirt, then trousers, then shoes); every branch of
// one stage splits into the same number of branches at the next, so the
// leaves on the right are the product of the options. Each leaf is one
// complete result, coloured by its first choice. In "one or the other" mode
// the same two groups are alternatives instead: they sit side by side and
// their sizes add (a bus or a train).

const W = 560, H = 310, PAD = 28;
const COLS = [40, 190, 340, 490];
const STAGE_COLORS = [C.blue, C.amber, C.green];
const LEAF_COLORS = [C.blue, C.red, C.green, C.purple];

type Node = { x: number; y: number; first: number; path: number[] };

/** The tree, one array of nodes per level; each node sits in the middle of the leaves below it. */
function buildTree(used: number[]): Node[][] {
  const leaves = used.reduce((a, b) => a * b, 1);
  const levels: Node[][] = [[{ x: COLS[0], y: H / 2, first: -1, path: [] }]];
  const leafGap = (H - 2 * PAD) / Math.max(1, leaves - 1);
  used.forEach((count, s) => {
    const below = used.slice(s + 1).reduce((a, b) => a * b, 1);      // leaves under each node of level s + 1
    levels.push(levels[s].flatMap((p, pi) => Array.from({ length: count }, (_, c) => {
      const first = (pi * count + c) * below;
      const y = leaves === 1 ? H / 2 : PAD + (first + (below - 1) / 2) * leafGap;
      return { x: COLS[s + 1], y, first: s === 0 ? c : p.first, path: [...p.path, c] };
    })));
  });
  return levels;
}

export function ChoiceTreeFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<"then" | "or">("then");
  const [stages, setStages] = useState(2);
  const [opts, setOpts] = useState([3, 4, 2]);
  const setOpt = (i: number) => (v: number) => setOpts(o => o.map((x, j) => (j === i ? v : x)));

  const used = opts.slice(0, stages);
  const leaves = used.reduce((a, b) => a * b, 1);
  const names = [tx(t, "figCtree_s1", "shirt"), tx(t, "figCtree_s2", "trousers"), tx(t, "figCtree_s3", "shoes")];
  const orNames = [tx(t, "figCtree_bus", "bus"), tx(t, "figCtree_train", "train")];
  const levels = buildTree(used);
  const showLabels = leaves <= 16;

  const sum = used[0] + (used[1] ?? 0);

  return (
    <Figure
      title={tx(t, "figCtree_title", "The tree of possibilities")}
      head={<Choice value={mode} onChange={setMode} options={[["then", tx(t, "figCtree_then", "one and then another")], ["or", tx(t, "figCtree_or", "one or the other")]]} />}
      controls={<>
        <Row>
          {mode === "then" && <Choice value={String(stages)} onChange={v => setStages(Number(v))}
            options={[["2", tx(t, "figCtree_two", "2 stages")], ["3", tx(t, "figCtree_three", "3 stages")]]} />}
          {Array.from({ length: mode === "then" ? stages : 2 }, (_, i) => (
            <Slider key={i} label={(mode === "then" ? names : orNames)[i]} value={opts[i]} min={1} max={i === 2 ? 3 : 4} step={1} onChange={setOpt(i)} fmt={v => String(v)} />
          ))}
        </Row>
        <Row>
          {mode === "then"
            ? <Readout color={C.blue}>{`${used.join(" · ")} = ${leaves} ${tx(t, "figCtree_results", "results")}`}</Readout>
            : <Readout color={C.amber}>{`${used[0]} + ${used[1]} = ${sum} ${tx(t, "figCtree_ways", "ways")}`}</Readout>}
        </Row>
      </>}
      note={mode === "then"
        ? tx(t, "figCtree_noteThen", "Each column is one stage. Every branch splits into the same number of branches at the next stage, so the leaves on the right number the product of the options. One leaf is one complete result: a path from the root to the right edge. The colour shows the first choice: each colour has the same number of leaves.")
        : tx(t, "figCtree_noteOr", "Now the same two groups are alternatives: you take one item from the first group or one from the second, never both. Nothing branches; the two groups just stand side by side, so their sizes add. This only works because no item belongs to both groups.")}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {mode === "then" ? <>
          {COLS.slice(1, stages + 1).map((x, s) => <T key={`h${s}`} x={x} y={10} anchor="middle" color={STAGE_COLORS[s]} bold>{names[s]}</T>)}
          {levels.slice(1).map((lv, s) => lv.map((n, i) => {
            const parent = levels[s][Math.floor(i / used[s])];
            return <line key={`e${s}-${i}`} x1={parent.x} y1={parent.y} x2={n.x} y2={n.y} stroke={LEAF_COLORS[n.first]} strokeOpacity={0.55} strokeWidth={1.3} />;
          }))}
          {levels.map((lv, s) => lv.map((n, i) => (
            <g key={`n${s}-${i}`}>
              <circle cx={n.x} cy={n.y} r={s === 0 ? 5 : s === stages ? 3.2 : 4} fill={s === 0 ? C.fg : LEAF_COLORS[n.first]} />
              {s > 0 && s < stages && <T x={n.x + 7} y={n.y - 5} color={STAGE_COLORS[s - 1]}>{String(n.path[s - 1] + 1)}</T>}
              {s === stages && showLabels && <T x={n.x + 8} y={n.y + 3.5} color={C.fg}>{n.path.map(c => c + 1).join("-")}</T>}
            </g>
          )))}
        </> : <>
          {[0, 1].map(g => {
            const x0 = g === 0 ? 70 : 320, w = 170;
            return (
              <g key={g}>
                <rect x={x0} y={60} width={w} height={180} rx={12} fill="none" stroke={STAGE_COLORS[g]} strokeWidth={1.5} strokeDasharray="5 4" />
                <T x={x0 + w / 2} y={50} anchor="middle" color={STAGE_COLORS[g]} bold>{orNames[g]}</T>
                {Array.from({ length: used[g] }, (_, i) => (
                  <g key={i}>
                    <circle cx={x0 + w / 2} cy={90 + i * 40} r={13} fill={STAGE_COLORS[g]} fillOpacity={0.22} stroke={STAGE_COLORS[g]} />
                    <T x={x0 + w / 2} y={94 + i * 40} anchor="middle" color={C.fg} bold>{String(i + 1)}</T>
                  </g>
                ))}
              </g>
            );
          })}
          <T x={W / 2 - 5} y={155} anchor="middle" color={C.fg} size={20} bold>+</T>
        </>}
      </svg>
    </Figure>
  );
}

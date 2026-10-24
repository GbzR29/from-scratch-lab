"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, C, T, Grid, plot, fnPath } from "@/components/lesson/kit/figure";
import { Tex } from "@/components/lesson/Tex";
import { EQ_SCENARIOS, rootMarks, type MoveKind, type ScenarioId } from "./equationMoves";

// ── What this figure shows ────────────────────────────────────────────────────
// An equation drawn as two curves: its left side in blue and its right side in
// amber. The solutions are the x where the curves meet. The reader applies
// moves (square both sides, divide by x, multiply by a denominator, take a
// square root) and watches the curves change. Every candidate of the current
// equation is checked against the FIRST equation: green = a real solution, red
// = a fake one the moves created, a dashed ring on the axis = a real solution
// the moves lost. Unsafe moves are the "break it" here; each scenario also has
// the safe way to do the same job.

const P = plot({ W: 560, H: 280, x0: -3, x1: 4.5, y0: -3, y1: 6 });
const n = (v: number) => (Object.is(v, -0) ? "0" : String(+v.toFixed(2)).replace("-", "−"));
const KIND_COL: Record<MoveKind, string> = { safe: C.green, gain: C.red, lose: C.amber };

export function EquationMovesFigure({ t }: { t?: TrackTranslations }) {
  const [sid, setSid] = useState<ScenarioId>("square");
  const sc = EQ_SCENARIOS[sid];
  const [path, setPath] = useState<{ state: string; kind?: MoveKind; why?: [string, string] }[]>([{ state: sc.start }]);
  const cur = path[path.length - 1];
  const st = sc.states[cur.state];
  const marks = rootMarks(sc, cur.state);
  const p = plot({ ...P, ...sc.view });

  const choose = (id: ScenarioId) => { setSid(id); setPath([{ state: EQ_SCENARIOS[id].start }]); };
  const kindText = (k: MoveKind) => k === "safe" ? tx(t, "figEqMv_kSafe", "safe: the same solutions")
    : k === "gain" ? tx(t, "figEqMv_kGain", "careful: this move can add fake solutions")
      : tx(t, "figEqMv_kLose", "careful: this move can lose solutions");
  const status = (s: "real" | "fake" | "lost") => s === "real" ? tx(t, "figEqMv_real", "real") : s === "fake" ? tx(t, "figEqMv_fake", "fake") : tx(t, "figEqMv_lost", "lost");
  const statusCol = (s: "real" | "fake" | "lost") => s === "real" ? C.green : s === "fake" ? C.red : C.amber;

  return (
    <Figure title={tx(t, "figEqMv_title", "Moves on an equation: kept, gained or lost?")}
      head={<Choice value={sid} onChange={choose}
        options={(Object.keys(EQ_SCENARIOS) as ScenarioId[]).map(id => [id, tx(t, EQ_SCENARIOS[id].name[0], EQ_SCENARIOS[id].name[1])] as [ScenarioId, string])} />}
      controls={<>
        {st.moves.length > 0 && <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figEqMv_next", "next move:")}</span>
          {st.moves.map(m => (
            <Btn key={m.to} onClick={() => setPath(ps => [...ps, { state: m.to, kind: m.kind, why: m.why }])}>{tx(t, m.label[0], m.label[1])}</Btn>
          ))}
        </Row>}
        {cur.kind && cur.why && (
          <p className="text-[12px] leading-relaxed rounded-lg px-3 py-2 border" style={{ borderColor: KIND_COL[cur.kind], color: "var(--text-main)" }}>
            <b style={{ color: KIND_COL[cur.kind] }}>{kindText(cur.kind)}.</b> {tx(t, cur.why[0], cur.why[1])}
          </p>
        )}
        {st.end && <p className="text-[12px] leading-relaxed text-[var(--text-main)]">{tx(t, st.end[0], st.end[1])}</p>}
        <Row>
          {marks.length === 0 && <Readout color={C.muted}>{tx(t, "figEqMv_none", "no candidates: the curves never meet")}</Readout>}
          {marks.map(m => <Readout key={`${m.x}${m.status}`} color={statusCol(m.status)}>x = {n(m.x)}: {status(m.status)}</Readout>)}
          {path.length > 1 && <>
            <Btn onClick={() => setPath(ps => ps.slice(0, -1))}>{tx(t, "figEqMv_back", "undo")}</Btn>
            <Btn onClick={() => setPath([{ state: sc.start }])}>{tx(t, "figEqMv_restart", "start again")}</Btn>
          </>}
        </Row>
      </>}
      note={tx(t, "figEqMv_note", "Blue is the left side of the equation, amber the right side; a solution is an x where they meet. Every candidate is tested in the first equation: green is real, red is fake (a move created it), a dashed amber ring is a real solution a move lost. Before each move, predict which of the three it will be.")}
    >
      <div className="px-4 pt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--text-muted)]">
        {path.slice(0, -1).map((h, i) => (
          <span key={i} className="flex items-center gap-2 text-[13px] opacity-70">
            <Tex>{sc.states[h.state].tex}</Tex>
            <Tex>{path[i + 1].kind === "safe" ? String.raw`\iff` : String.raw`\Rightarrow`}</Tex>
          </span>
        ))}
        <span className="text-[18px] text-[var(--text-main)]"><Tex>{st.tex}</Tex></span>
      </div>
      <svg viewBox={`0 0 ${p.W} ${p.H}`} className="w-full h-auto">
        <Grid p={p} />
        <path d={fnPath(p, st.L, p.x0, p.x1, 480)} fill="none" stroke={C.sky} strokeWidth={2.4} />
        <path d={fnPath(p, st.R, p.x0, p.x1, 480)} fill="none" stroke={C.amber} strokeWidth={2.4} />
        {marks.map(m => {
          const y = m.status === "lost" ? 0 : st.L(m.x);
          const cx = p.X(m.x), cy = p.Y(y), col = statusCol(m.status);
          return (
            <g key={`${m.x}${m.status}`}>
              {m.status === "lost"
                ? <circle cx={cx} cy={cy} r={7} fill="none" stroke={col} strokeWidth={2} strokeDasharray="3 2" />
                : <circle cx={cx} cy={cy} r={5.5} fill={col} stroke="var(--code-bg)" strokeWidth={1.5} />}
              <text x={cx} y={m.status === "lost" ? cy + 21 : cy - 11} fontSize={10} textAnchor="middle" fill={col} fontWeight={700}
                fontFamily="monospace" stroke="var(--code-bg)" strokeWidth={3.5} paintOrder="stroke">{`${n(m.x)} ${status(m.status)}`}</text>
            </g>
          );
        })}
        <rect x={8} y={8} width={128} height={36} rx={6} fill="var(--code-bg)" opacity={0.85} />
        <line x1={14} x2={32} y1={20} y2={20} stroke={C.sky} strokeWidth={2.4} />
        <T x={38} y={23} size={9.5} color={C.fg}>{tx(t, "figEqMv_left", "left side")}</T>
        <line x1={14} x2={32} y1={35} y2={35} stroke={C.amber} strokeWidth={2.4} />
        <T x={38} y={38} size={9.5} color={C.fg}>{tx(t, "figEqMv_right", "right side")}</T>
      </svg>
    </Figure>
  );
}

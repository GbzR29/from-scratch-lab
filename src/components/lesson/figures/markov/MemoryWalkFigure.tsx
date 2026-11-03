"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Btn, C, Choice, Figure, Readout, Row, Slider, Sliders, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { dec, stationaryOf, stepFrom, type Mat } from "./numeric";

// ── What this figure shows ────────────────────────────────────────────────────
// A walker on a corridor of N posts whose next step depends on its past, made
// Markov by enlarging the state. "Last step" mode remembers the direction of
// the last step: the chance of going on depends on that direction (keep going
// right r, keep going left l). "Last two steps" mode remembers two directions:
// going on has chance s after two steps the same way and q after a turn. At
// either end the walker must turn back. The figure lists the states that can
// actually occur, builds their transition matrix, solves πP = π and adds the
// states of each post to get the share of time spent there (the bars). The
// walker runs the chain; the dots on the bars are the shares it has really
// spent so far, which settle onto the bars.

type Mode = "one" | "two";
type St = { pos: number; d: number; e: number };   // e = the step before (two-step mode only; 0 otherwise)

function build(N: number, mode: Mode, a: number, b: number) {
  // a, b: one-step mode → keep right, keep left; two-step mode → same, turned
  const key = (s: St) => `${s.pos}:${s.d}:${s.e}`;
  const start: St = mode === "one" ? { pos: 1, d: -1, e: 0 } : { pos: 1, d: -1, e: 1 };
  const states: St[] = [start], index = new Map([[key(start), 0]]);
  const edges: [number, number, number][] = [];
  for (let k = 0; k < states.length; k++) {
    const s = states[k];
    const keep = s.pos === 1 ? (s.d > 0 ? 1 : 0) : s.pos === N ? (s.d < 0 ? 1 : 0)
      : mode === "one" ? (s.d > 0 ? a : b) : (s.d === s.e ? a : b);
    for (const [nd, p] of [[s.d, keep], [-s.d, 1 - keep]] as const) {
      if (p <= 0) continue;
      const nx: St = { pos: s.pos + nd, d: nd, e: mode === "two" ? s.d : 0 };
      let j = index.get(key(nx));
      if (j === undefined) { j = states.length; states.push(nx); index.set(key(nx), j); }
      edges.push([k, j, p]);
    }
  }
  const P: Mat = states.map(() => new Array<number>(states.length).fill(0));
  for (const [i, j, p] of edges) P[i][j] += p;
  // list the states post by post, as the text does
  const order = states.map((_, i) => i).sort((i, j) => states[i].pos - states[j].pos || states[j].d - states[i].d || states[j].e - states[i].e);
  return { states, P, order };
}

const arrow = (d: number) => (d > 0 ? "→" : "←");
const W = 560, H = 190;

export function MemoryWalkFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("one");
  const [N, setN] = useState(4);
  const [a, setA] = useState(0.5);
  const [b, setB] = useState(0.75);
  const { states, P, order } = useMemo(() => build(N, mode, a, b), [N, mode, a, b]);
  const pi = useMemo(() => stationaryOf(P), [P]);
  const share = useMemo(() => {
    const out = new Array<number>(N).fill(0);
    if (pi) states.forEach((s, i) => { out[s.pos - 1] += pi[i]; });
    return out;
  }, [pi, states, N]);

  // the walker
  const [cur, setCur] = useState(0);
  const [visits, setVisits] = useState<number[]>(() => new Array(N).fill(0));
  const [steps, setSteps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fast, setFast] = useState(false);
  const acc = useRef(0);
  const vis = useVisible<HTMLDivElement>();
  const reset = () => { setCur(0); setVisits(new Array(N).fill(0)); setSteps(0); acc.current = 0; };
  const change = (f: () => void) => { f(); setPlaying(false); setCur(0); setVisits(new Array(N).fill(0)); setSteps(0); };
  const advance = (k: number) => {
    let c = Math.min(cur, states.length - 1);
    const v = visits.length === N ? [...visits] : new Array(N).fill(0);
    for (let n = 0; n < k; n++) { c = stepFrom(P, c, Math.random()); v[states[c].pos - 1]++; }
    setCur(c); setVisits(v); setSteps(s => s + k);
  };
  useFrame(playing && vis.on, dt => {
    acc.current += dt;
    if (acc.current < (fast ? 0.03 : 0.35)) return;
    acc.current = 0;
    advance(fast ? 200 : 1);
  });

  const here = states[Math.min(cur, states.length - 1)];
  const bw = Math.min(90, (W - 40) / N - 10), gap = (W - 40 - N * bw) / Math.max(1, N - 1);
  const X = (p: number) => 20 + (p - 1) * (bw + gap);
  const top = Math.max(0.05, ...share) * 1.15, base = 120, hMax = 92;
  const total = visits.reduce((s, v) => s + v, 0);
  const label = (s: St) => `${s.pos}${arrow(s.d)}${mode === "two" ? arrow(s.e) : ""}`;

  return (
    <Figure
      title={tx(t, "figMem_title", "A walk with memory, made Markov")}
      head={<Choice value={mode} onChange={v => change(() => setMode(v))} options={[
        ["one", tx(t, "figMem_one", "remembers the last step")], ["two", tx(t, "figMem_two", "remembers two steps")],
      ]} />}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figMem_posts", "posts N")} value={N} min={3} max={8} step={1} onChange={v => change(() => setN(v))} fmt={v => String(v)} />
          <Slider label={mode === "one" ? tx(t, "figMem_r", "keep → (r)") : tx(t, "figMem_s", "keep after same (s)")} value={a} min={0.05} max={0.95} step={0.05} onChange={v => change(() => setA(v))} />
          <Slider label={mode === "one" ? tx(t, "figMem_l", "keep ← (l)") : tx(t, "figMem_q", "keep after turn (q)")} value={b} min={0.05} max={0.95} step={0.05} onChange={v => change(() => setB(v))} />
        </Sliders>
        <Row>
          <Readout>{`${tx(t, "figMem_states", "states")}: ${states.length}`}</Readout>
          {share.map((s, i) => <Readout key={i} color={C.blue}>{`${i + 1}: ${dec(s, 4)}`}</Readout>)}
        </Row>
      </>}
      note={tx(t, "figMem_note", "The bars are the exact long-run share of time at each post: π of the enlarged chain, with the states of each post added up. The dots are what the walker has actually done so far; let it run (the fast button takes 200 steps at a time) and they settle on the bars. The chips under the corridor are the states that can occur: the post, then the direction of the last step, and in two-step mode the direction of the step before. At the ends only one direction can arrive, which is why there are fewer states than posts × directions. Set r = l, or s = q, and look at what stays the same.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {share.map((s, i) => {
            const x = X(i + 1), h = (s / top) * hMax, emp = total ? visits[i] / total : 0;
            return (
              <g key={i}>
                <rect x={x} y={base - h} width={bw} height={h} rx={4} fill={C.blue} fillOpacity={0.22} stroke={C.blue} strokeWidth={1.2} />
                {total > 0 && <circle cx={x + bw / 2} cy={base - (emp / top) * hMax} r={4} fill={C.amber} />}
                <rect x={x} y={base + 6} width={bw} height={26} rx={6} fill={here.pos === i + 1 ? "var(--primary-low)" : "var(--surface)"} stroke={here.pos === i + 1 ? "var(--primary)" : "var(--border)"} />
                <T x={x + bw / 2} y={base + 24} anchor="middle" color={C.fg} size={12} bold>{String(i + 1)}</T>
                <T x={x + bw / 2} y={base - h - 6} anchor="middle" color={C.blue} size={10}>{dec(s, 3)}</T>
              </g>
            );
          })}
          {/* the walker and its memory */}
          <T x={X(here.pos) + bw / 2} y={base + 50} anchor="middle" color={C.amber} size={14} bold>
            {mode === "two" ? `${arrow(here.e)}${arrow(here.d)}` : arrow(here.d)}
          </T>
        </svg>
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 text-[11px] font-mono">
          {order.map(i => (
            <span key={i} className="px-1.5 py-0.5 rounded-md border"
              style={{ borderColor: i === cur ? "var(--primary)" : "var(--border)", color: i === cur ? "var(--primary)" : "var(--text-muted)", background: "var(--surface)" }}>
              {`${label(states[i])} ${pi ? dec(pi[i], 3) : "–"}`}
            </span>
          ))}
        </div>
        <Transport t={t} playing={playing}
          onPlay={() => setPlaying(p => !p)}
          playLabel={tx(t, "figMem_play", "let the walker run")}
          onStep={() => { setPlaying(false); advance(1); }}
          onReset={() => { setPlaying(false); reset(); }}
          readout={<span className="inline-flex items-center gap-2">{`${steps} ${tx(t, "figMem_steps", "steps")}`}
            <Btn active={fast} onClick={() => setFast(f => !f)}>{tx(t, "figMem_fast", "fast")}</Btn></span>} />
      </div>
    </Figure>
  );
}

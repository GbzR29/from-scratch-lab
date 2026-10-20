"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A Bell test (the CHSH form). A source sends pairs of spin-½ particles in
// the singlet state to Alice (left) and Bob (right). For each pair, each of
// them picks one of two magnet angles at random: Alice a = 0° or a′ = 90°,
// Bob b = 45° or b′ = 135°, and gets +1 or −1. For each of the four setting
// pairs the figure measures the correlation E = (same − different)/total,
// counting −1·−1 as "same".
//   Quantum mechanics: P(same) = sin²((a − b)/2), so E = −cos(a − b).
//   S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′) = −2√2 ≈ −2.83.
// "break it: hidden instructions" swaps in a local model: each pair leaves
// the source carrying a hidden angle λ, and each particle answers
// sign(cos(setting − λ)) (Bob's with a minus sign). It gets perfect
// anticorrelation at equal angles right, but its correlation is a straight
// line in the angle, and |S| can never pass 2, whatever the instructions.
// Right: E against the angle between the two magnets, the quantum curve, the
// local line, and the four measured points.

const W = 560, H = 270;
const SETTINGS_A = [0, 90], SETTINGS_B = [45, 135];
const PX0 = 336, PX1 = 534, PY0 = 30, PY1 = 214;
const FLY = 0.55;                                    // seconds from the source to a detector

type Pair = { age: number; a: number; b: number; A: number; B: number };
const eQuantum = (d: number) => -Math.cos((d * Math.PI) / 180);
const eLocal = (d: number) => { const x = Math.abs(((d % 360) + 360) % 360); const u = x > 180 ? 360 - x : x; return -1 + (2 * u) / 180; };

export function BellFigure({ t }: { t?: TrackTranslations }) {
  const [local, setLocal] = useState(false);
  const [rate, setRate] = useState(20);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const sim = useRef({
    pairs: [] as Pair[], due: 0, rnd: mulberry32(5),
    n: [0, 0, 0, 0], same: [0, 0, 0, 0], aliceUp: [0, 0], aliceBy: [0, 0],
    last: null as Pair | null,
  });

  const reset = () => {
    const s = sim.current;
    s.pairs = []; s.n = [0, 0, 0, 0]; s.same = [0, 0, 0, 0]; s.aliceUp = [0, 0]; s.aliceBy = [0, 0]; s.last = null;
    rerender();
  };

  const emit = (): Pair => {
    const r = sim.current.rnd, a = r() < 0.5 ? 0 : 1, b = r() < 0.5 ? 0 : 1;
    const A_ = SETTINGS_A[a], B_ = SETTINGS_B[b];
    let A: number, B: number;
    if (local) {
      const lam = r() * 360;
      A = Math.cos(((A_ - lam) * Math.PI) / 180) >= 0 ? 1 : -1;
      B = Math.cos(((B_ - lam) * Math.PI) / 180) >= 0 ? -1 : 1;
    } else {
      A = r() < 0.5 ? 1 : -1;
      const pSame = Math.sin(((A_ - B_) * Math.PI) / 360) ** 2;
      B = r() < pSame ? A : -A;
    }
    return { age: 0, a, b, A, B };
  };

  useFrame(playing && vis.on, dt => {
    const s = sim.current;
    s.due += dt * rate;
    while (s.due >= 1) { s.due -= 1; s.pairs.push(emit()); }
    const keep: Pair[] = [];
    for (const p of s.pairs) {
      p.age += dt;
      if (p.age < FLY) { keep.push(p); continue; }
      const k = p.a * 2 + p.b;
      s.n[k]++; if (p.A === p.B) s.same[k]++;
      s.aliceBy[p.b]++; if (p.A > 0) s.aliceUp[p.b]++;
      s.last = p;
    }
    s.pairs = keep;
    rerender();
  });

  const s = sim.current;
  const E = s.n.map((n, k) => (n ? (2 * s.same[k] - n) / n : 0));
  const S = E[0] - E[1] + E[2] + E[3];
  const total = s.n.reduce((x, y) => x + y, 0);
  // 1σ of S: each E from n pairs has variance (1 − E²)/n
  const err = s.n.every(n => n > 2) ? Math.sqrt(E.reduce((acc, e, k) => acc + (1 - e * e) / s.n[k], 0)) : 0;
  const X = (d: number) => PX0 + (d / 180) * (PX1 - PX0);
  const Y = (e: number) => (PY0 + PY1) / 2 - e * (PY1 - PY0) / 2;
  let curveQ = "", curveL = "";
  for (let i = 0; i <= 90; i++) {
    const d = i * 2;
    curveQ += `${i ? "L" : "M"}${X(d).toFixed(1)},${Y(eQuantum(d)).toFixed(1)}`;
    curveL += `${i ? "L" : "M"}${X(d).toFixed(1)},${Y(eLocal(d)).toFixed(1)}`;
  }
  const names = ["a,b", "a,b′", "a′,b", "a′,b′"];
  const diffs = [45, 135, 45, 45];

  // the stage: source in the middle, Alice left, Bob right
  const SX = 166, SY = 120, AX = 50, BXd = 284;
  const dial = (x: number, ang: number, col: string, label: string) => {
    const r = (ang * Math.PI) / 180, dx = Math.sin(r) * 15, dy = -Math.cos(r) * 15;
    return (
      <g>
        <circle cx={x} cy={SY} r={18} fill={C.bg} stroke={C.axis} />
        <line x1={x - dx} y1={SY - dy} x2={x + dx} y2={SY + dy} stroke={col} strokeWidth={2.2} />
        <circle cx={x + dx} cy={SY + dy} r={3} fill={col} />
        <T x={x} y={SY + 32} anchor="middle" size={8.5} color={col} bold>{label}</T>
      </g>
    );
  };
  const lastA = s.last ? SETTINGS_A[s.last.a] : 0, lastB = s.last ? SETTINGS_B[s.last.b] : 45;
  const lamp = (x: number, v: number | undefined) => (
    <g>
      <circle cx={x} cy={SY - 40} r={9} fill={v === undefined ? C.axis : v > 0 ? C.green : C.red} opacity={0.85} />
      <T x={x} y={SY - 37} anchor="middle" size={8.5} color="#fff" bold>{v === undefined ? "" : v > 0 ? "+" : "−"}</T>
    </g>
  );

  return (
    <Figure title={tx(t, "figPhBell_title", "A Bell test: can hidden instructions explain the correlations?")}
      head={<Btn active={local} onClick={() => { setLocal(l => !l); reset(); }}>{tx(t, "figPhBell_broken", "break it: hidden instructions")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhBell_rate", "pairs per second")} value={rate} min={2} max={200} step={1} onChange={setRate} fmt={v => String(v)} width="w-32" />
        <Row>
          {names.map((nm, k) => (
            <Readout key={k} color={k === 1 ? C.amber : undefined}>{`E(${nm}) = ${s.n[k] ? f2(E[k], 2) : "–"}`}</Readout>
          ))}
        </Row>
        <Row>
          <Readout color={Math.abs(S) > 2 + err ? C.green : C.fg}>{`S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′) = ${total ? f2(S, 2) : "–"}${err ? ` ± ${f2(err, 2)}` : ""}`}</Readout>
          <Readout color={C.muted}>{tx(t, "figPhBell_limit", "any local model: |S| ≤ 2")}</Readout>
        </Row>
        <Row>
          <Readout>{`${tx(t, "figPhBell_alice", "Alice gets +1")}: ${s.aliceBy[0] ? f2((s.aliceUp[0] / s.aliceBy[0]) * 100, 0) : "–"}% ${tx(t, "figPhBell_whenB", "when Bob uses b")}, ${s.aliceBy[1] ? f2((s.aliceUp[1] / s.aliceBy[1]) * 100, 0) : "–"}% ${tx(t, "figPhBell_whenB2", "when he uses b′")}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhBell_note", "Each pair is born in the singlet state: measured along the same axis, the two spins always disagree. Alice and Bob each choose one of two magnet angles at random, after the particles have left, and each writes down +1 or −1. The correlation E is +1 if they always agree, −1 if they always disagree, 0 if there is no link. Bell's quantity S combines the four setting pairs. Any theory in which each particle carries its own answers from the source, and in which Alice's choice cannot affect Bob's result, gives |S| at most 2: try it with the break-it button, a pair carrying a hidden angle that fixes every answer. It even gets equal angles right, but its correlation falls along a straight line, and S sticks at −2. Quantum mechanics follows the cosine curve and reaches 2√2 = 2.83 at these angles, and so do real experiments. Look at Alice's own results: +1 half the time, whatever Bob does. The link only shows when the two lists are compared, so it cannot carry a message.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* source and the flying pairs */}
          <line x1={AX + 20} y1={SY} x2={BXd - 20} y2={SY} stroke={C.axis} strokeDasharray="2 4" />
          <circle cx={SX} cy={SY} r={10} fill={C.purple} opacity={0.75} />
          <T x={SX} y={SY + 30} anchor="middle" size={8}>{tx(t, "figPhBell_source", "source")}</T>
          {s.pairs.map((p, i) => {
            const u = p.age / FLY;
            return (
              <g key={i}>
                <circle cx={SX - u * (SX - AX - 20)} cy={SY} r={2.6} fill={C.purple} />
                <circle cx={SX + u * (BXd - 20 - SX)} cy={SY} r={2.6} fill={C.purple} />
              </g>
            );
          })}
          {dial(AX, lastA, C.sky, `Alice ${lastA === 0 ? "a" : "a′"} = ${lastA}°`)}
          {dial(BXd, lastB, C.pink, `Bob ${lastB === 45 ? "b" : "b′"} = ${lastB}°`)}
          {lamp(AX, s.last?.A)}
          {lamp(BXd, s.last?.B)}
          <T x={12} y={18} size={8}>{local
            ? tx(t, "figPhBell_keyL", "local model: each pair carries a hidden angle λ")
            : tx(t, "figPhBell_keyQ", "quantum: the singlet state, no answers until measured")}</T>
          <T x={12} y={H - 34} size={8}>{tx(t, "figPhBell_settings", "settings chosen at random for every pair")}</T>
          <T x={12} y={H - 20} size={8}>{"a = 0°, a′ = 90°, b = 45°, b′ = 135°"}</T>

          {/* correlation against the angle between the magnets */}
          <line x1={PX0} y1={Y(0)} x2={PX1} y2={Y(0)} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          {[-1, 1].map(e => <T key={e} x={PX0 - 4} y={Y(e) + 3} anchor="end" size={8}>{e > 0 ? "+1" : "−1"}</T>)}
          {[0, 45, 90, 135, 180].map(d => <T key={d} x={X(d)} y={PY1 + 12} anchor="middle" size={8}>{`${d}°`}</T>)}
          <path d={curveQ} fill="none" stroke={C.green} strokeWidth={1.8} />
          <path d={curveL} fill="none" stroke={C.red} strokeWidth={1.4} strokeDasharray="5 3" />
          {E.map((e, k) => s.n[k] > 0 && (
            <g key={k}>
              <circle cx={X(diffs[k]) + (k === 0 ? -5 : k === 3 ? 5 : 0)} cy={Y(e)} r={4} fill={k === 1 ? C.amber : C.fg} stroke="var(--code-bg)" />
            </g>
          ))}
          <T x={PX0 - 12} y={PY0 - 12} size={8}>{tx(t, "figPhBell_plot", "correlation E against the angle")}</T>
          <line x1={X(6)} y1={Y(0.86)} x2={X(22)} y2={Y(0.86)} stroke={C.green} strokeWidth={1.8} />
          <T x={X(25)} y={Y(0.86) + 3} size={8} color={C.green}>{tx(t, "figPhBell_q", "quantum: −cos θ")}</T>
          <line x1={X(6)} y1={Y(0.68)} x2={X(22)} y2={Y(0.68)} stroke={C.red} strokeWidth={1.4} strokeDasharray="5 3" />
          <T x={X(25)} y={Y(0.68) + 3} size={8} color={C.red}>{tx(t, "figPhBell_l", "hidden answers")}</T>
          <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhBell_angle", "angle between the magnets")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={reset}
          readout={`${total} ${tx(t, "figPhBell_pairs", "pairs")}`} />
      </div>
    </Figure>
  );
}

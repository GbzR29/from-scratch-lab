"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, C, T, Handle, useDrag, f2, clamp, mulberry32 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A 1 kg ball thrown straight up leaves the ground at t = 0 and lands at
// t = 2 s. The true motion is x(t) = ½ g t (2 − t) (dashed green). The pink
// trial path has the same ends but its own shape: true path + a₁ sin(πt/2) +
// a₂ sin(πt) + a₃ sin(3πt/2), with a₁…a₃ set so it passes through the three
// draggable handles at t = 0.5, 1 and 1.5 s.
// For each path the action S = ∫ (T − V) dt, T = ½ m ẋ², V = m g x, is added
// up numerically (400 slices). The right panel scales the trial path's
// difference from the true path by ε and plots S(ε): a parabola whose bottom
// sits exactly at ε = 0, the true path. For uniform gravity the change is
// exactly ΔS = ½ m ∫ η̇² dt ≥ 0, so every other path has a larger action.
// "break it: use T + V" swaps the Lagrangian for T + V. Its stationary path
// obeys ẍ = +g, a ball that falls upwards: the dashed red valley, and the
// bottom of S(ε) moves away from the true path.

const W = 560, H = 290;
const G = 9.81, M = 1, TT = 2, N = 400;
const PX0 = 40, PX1 = 330, PY0 = 30, PY1 = 260;     // path plot box (px)
const XMIN = -6, XMAX = 7;                            // height range (m)
const SX0 = 370, SX1 = 545, SY0 = 60, SY1 = 230;     // S(ε) plot box (px)
const HT = [0.5, 1, 1.5];                             // handle times (s)

const xTrue = (t: number) => 0.5 * G * t * (TT - t);
const vTrue = (t: number) => G * (TT / 2 - t);
const xValley = (t: number) => -xTrue(t);             // the T + V "path": ẍ = +g
const tx_ = (t: number) => PX0 + (t / TT) * (PX1 - PX0);
const xy = (x: number) => PY1 - ((x - XMIN) / (XMAX - XMIN)) * (PY1 - PY0);

/** Solve the 3×3 system M a = b (Gaussian elimination, partial pivoting). */
function solve3(m: number[][], b: number[]) {
  const a = m.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    for (let r = 0; r < 3; r++) if (r !== c) {
      const f = a[r][c] / a[c][c];
      for (let k = c; k < 4; k++) a[r][k] -= f * a[c][k];
    }
  }
  return a.map((row, i) => row[3] / row[i]);
}
const BASIS = HT.map(t => [1, 2, 3].map(k => Math.sin((k * Math.PI * t) / TT)));

/** The bump η(t) = Σ a_k sin(kπt/T) and its rate of change. */
const eta = (a: number[], t: number) => a.reduce((s, ak, k) => s + ak * Math.sin(((k + 1) * Math.PI * t) / TT), 0);
const etaDot = (a: number[], t: number) => a.reduce((s, ak, k) => s + ak * ((k + 1) * Math.PI / TT) * Math.cos(((k + 1) * Math.PI * t) / TT), 0);

/** Action of the path x_true + ε η, with L = T − V (or T + V when broken). */
function action(a: number[], eps: number, broken: boolean) {
  let s = 0;
  const h = TT / N;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) * h;
    const x = xTrue(t) + eps * eta(a, t), v = vTrue(t) + eps * etaDot(a, t);
    const T = 0.5 * M * v * v, V = M * G * x;
    s += (broken ? T + V : T - V) * h;
  }
  return s;
}

export function ActionFigure({ t }: { t?: TrackTranslations }) {
  const [hs, setHs] = useState([xTrue(0.5) + 1.2, xTrue(1) - 1.5, xTrue(1.5) + 0.8]);
  const [broken, setBroken] = useState(false);
  const a = useMemo(() => solve3(BASIS, hs.map((h, i) => h - xTrue(HT[i]))), [hs]);

  const drag = useDrag<number>(
    p => {
      let best: number | null = null, bd = 18;
      HT.forEach((tt, i) => { const d = Math.hypot(p.x - tx_(tt), p.y - xy(hs[i])); if (d < bd) { bd = d; best = i; } });
      return best;
    },
    (i, p) => setHs(h => h.map((v, j) => (j === i ? clamp(XMIN + ((PY1 - p.y) / (PY1 - PY0)) * (XMAX - XMIN), XMIN + 0.3, XMAX - 0.3) : v))),
  );

  const S0 = action(a, 0, broken), S1 = action(a, 1, broken);
  // S(ε) over ε ∈ [−1.5, 1.5]
  const curve = useMemo(() => Array.from({ length: 61 }, (_, i) => { const e = -1.5 + i * 0.05; return [e, action(a, e, broken)] as const; }), [a, broken]);
  const lo = Math.min(...curve.map(c => c[1])), hi = Math.max(...curve.map(c => c[1]));
  const span = Math.max(hi - lo, 1e-6);
  const ex = (e: number) => SX0 + ((e + 1.5) / 3) * (SX1 - SX0);
  const ey = (s: number) => SY1 - ((s - lo) / span) * (SY1 - SY0);
  const best = curve.reduce((b, c) => (c[1] < b[1] ? c : b));

  const path = (f: (t: number) => number) => {
    let d = "";
    for (let i = 0; i <= 120; i++) { const tt = (i / 120) * TT; d += `${i ? "L" : "M"}${tx_(tt).toFixed(1)},${xy(f(tt)).toFixed(1)}`; }
    return d;
  };
  const wiggle = () => {
    const rnd = mulberry32(Math.floor(Math.random() * 1e9));
    setHs(HT.map(tt => clamp(xTrue(tt) + (rnd() - 0.5) * 5, XMIN + 0.3, XMAX - 0.3)));
  };

  return (
    <Figure title={tx(t, "figPhAct_title", "The action of a thrown ball")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhAct_broken", "break it: use T + V")}</Btn>}
      controls={<>
        <Row>
          <Btn onClick={() => setHs(HT.map(xTrue))}>{tx(t, "figPhAct_snap", "snap to the true path")}</Btn>
          <Btn onClick={wiggle}>{tx(t, "figPhAct_random", "random path")}</Btn>
          <Readout color={C.green}>{`S ${tx(t, "figPhAct_true", "true path")} = ${f2(S0, 2)} J·s`}</Readout>
          <Readout color={C.pink}>{`S ${tx(t, "figPhAct_trial", "your path")} = ${f2(S1, 2)} J·s`}</Readout>
          <Readout color={S1 - S0 < -1e-6 ? C.red : C.fg}>{`ΔS = ${f2(S1 - S0, 3)} J·s`}</Readout>
        </Row>
        <Row>
          <Readout>{`L = ${broken ? "T + V" : "T − V"} = mẋ²/2 ${broken ? "+" : "−"} mgx`}</Readout>
          <Readout color={Math.abs(best[0]) < 0.03 ? C.green : C.red}>{`${tx(t, "figPhAct_bottom", "lowest S at")} ε = ${f2(best[0], 2)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhAct_note", "Both paths start on the ground at t = 0 and land at t = 2 s; only the shape in between differs. Drag the three pink handles to bend your path, or press random path. Whatever you do, your action is larger than the true path's: ΔS is never negative, and it is zero only when you snap back. The right panel shows why: it slides your path towards the true one (ε = 0) and away again (ε = 1 is your path, ε = −1 its mirror image), and the action traces a parabola whose bottom sits exactly at the true path. Nature picks the path where the action is stationary. Now break it by using T + V: the bottom of the parabola moves away from the true path, and the path that T + V prefers is the red valley, a ball that falls upwards. Only T − V gives Newton's law.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* path plot */}
        {[-4, -2, 0, 2, 4, 6].map(x => <g key={x}>
          <line x1={PX0} y1={xy(x)} x2={PX1} y2={xy(x)} stroke={x === 0 ? C.axis : C.grid} strokeWidth={x === 0 ? 1.2 : 0.6} />
          <T x={PX0 - 5} y={xy(x) + 3} anchor="end" size={7.5}>{`${x}`}</T>
        </g>)}
        {[0, 0.5, 1, 1.5, 2].map(tt => <T key={tt} x={tx_(tt)} y={PY1 + 13} anchor="middle" size={7.5}>{`${tt}`}</T>)}
        <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhAct_time", "time t (s)")}</T>
        <T x={PX0 - 30} y={PY0 - 12} size={8}>{tx(t, "figPhAct_height", "height x (m)")}</T>
        {broken && <path d={path(xValley)} fill="none" stroke={C.red} strokeWidth={1.6} strokeDasharray="5 4" />}
        <path d={path(xTrue)} fill="none" stroke={C.green} strokeWidth={2} strokeDasharray="6 4" />
        <path d={path(tt => xTrue(tt) + eta(a, tt))} fill="none" stroke={C.pink} strokeWidth={2.2} />
        <circle cx={tx_(0)} cy={xy(0)} r={4} fill={C.fg} />
        <circle cx={tx_(TT)} cy={xy(0)} r={4} fill={C.fg} />
        {HT.map((tt, i) => <Handle key={i} x={tx_(tt)} y={xy(hs[i])} color={C.pink} active={drag.dragging === i} />)}
        <T x={PX0 + 6} y={PY0 - 12 + 26} color={C.green} size={8}>{tx(t, "figPhAct_keyTrue", "true path: x = gt(2 − t)/2")}</T>
        {broken && <T x={PX0 + 6} y={PY1 - 6} color={C.red} size={8}>{tx(t, "figPhAct_keyValley", "path T + V prefers: ẍ = +g")}</T>}

        {/* S(ε) plot */}
        <T x={SX0 - 25} y={SY0 - 22} size={8}>{tx(t, "figPhAct_sTitle", "action S(ε), path = true + ε·bump")}</T>
        <line x1={SX0} y1={SY1} x2={SX1} y2={SY1} stroke={C.axis} />
        <line x1={ex(0)} y1={SY0 - 6} x2={ex(0)} y2={SY1} stroke={C.green} strokeDasharray="3 3" />
        {[-1, 0, 1].map(e => <T key={e} x={ex(e)} y={SY1 + 13} anchor="middle" size={7.5}>{`${e}`}</T>)}
        <T x={SX1} y={SY1 + 26} anchor="end" size={8}>ε</T>
        <path d={curve.map(([e, s], i) => `${i ? "L" : "M"}${ex(e).toFixed(1)},${ey(s).toFixed(1)}`).join("")} fill="none" stroke={broken ? C.red : C.sky} strokeWidth={2} />
        <circle cx={ex(1)} cy={ey(S1)} r={4.5} fill={C.pink} />
        <circle cx={ex(0)} cy={ey(S0)} r={4.5} fill={C.green} />
        <circle cx={ex(best[0])} cy={ey(best[1])} r={3} fill="none" stroke={broken ? C.red : C.sky} strokeWidth={1.5} />
        <T x={ex(0) + 5} y={SY0 - 8} color={C.green} size={7.5}>{tx(t, "figPhAct_eps0", "true path")}</T>
      </svg>
    </Figure>
  );
}

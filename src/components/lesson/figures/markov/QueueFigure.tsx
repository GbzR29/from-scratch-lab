"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Btn, C, Choice, Figure, Row, Slider, Sliders, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { birthDeath, dec } from "./numeric";
import { NumMatrix } from "./NumMatrix";

// ── What this figure shows ────────────────────────────────────────────────────
// A queue with c servers and room for K customers, as a discrete-time Markov
// chain on the number in the system. Time is cut into intervals of length h;
// in each interval at most one arrival (chance a = 1 − e^(−λh)) and at most
// one completion (chance d = 1 − e^(−min(n, c)·μh)) are counted, possibly
// both. Moves are only ±1, so the chain is birth–death and detailed balance
// gives π directly, even for K = 200. The bars are π(n); the dots are the
// exact continuous-time M/M/c/K answer, which the chain approaches as h → 0.
// The table compares L, Lq, W, Wq. The strip on top runs the chain: servers
// on the left, the waiting line to the right, the clock in minutes.

type Full = "stay" | "drop";

function queue(lam: number, mu: number, c: number, K: number, h: number, full: Full) {
  const a = 1 - Math.exp(-lam * h);
  const d = (n: number) => (n === 0 ? 0 : 1 - Math.exp(-Math.min(n, c) * mu * h));
  const up: number[] = [], down: number[] = [];
  for (let n = 0; n <= K; n++) {
    up.push(n < K ? a * (1 - d(n)) : 0);
    // at K an arrival cannot enter on its own; with "stay", one that comes with a departure takes the freed place
    down.push(n === 0 ? 0 : n === K && full === "drop" ? d(n) : (1 - a) * d(n));
  }
  return { pi: birthDeath(up, down), up, down, a };
}

function exact(lam: number, mu: number, c: number, K: number) {
  const w = [1];
  for (let n = 1; n <= K; n++) w.push(w[n - 1] * lam / (Math.min(n, c) * mu));
  const s = w.reduce((u, v) => u + v, 0);
  return w.map(v => v / s);
}

function measures(pi: number[], lam: number, c: number) {
  const K = pi.length - 1;
  const L = pi.reduce((s, p, n) => s + n * p, 0);
  const Lq = pi.reduce((s, p, n) => s + Math.max(0, n - c) * p, 0);
  const lamEff = lam * (1 - pi[K]);
  return { L, Lq, W: L / lamEff, Wq: Lq / lamEff, loss: pi[K], lamEff };
}

const W = 560, H = 210, BASE = 182, HMAX = 96;
const HS = ["0.1", "0.01", "0.001"] as const;

export function QueueFigure({ t }: { t?: TrackTranslations }) {
  const [lam, setLam] = useState(0.5);
  const [svc, setSvc] = useState(1);
  const [c, setC] = useState(1);
  const [K, setK] = useState(3);
  const [hs, setHs] = useState<(typeof HS)[number]>("0.1");
  const [full, setFull] = useState<Full>("stay");
  const h = Number(hs), mu = 1 / svc, Kc = Math.max(K, c);
  const { pi, up, down } = useMemo(() => queue(lam, mu, c, Kc, h, full), [lam, mu, c, Kc, h, full]);
  const ex = useMemo(() => exact(lam, mu, c, Kc), [lam, mu, c, Kc]);
  const m = measures(pi, lam, c), me = measures(ex, lam, c);

  // the running queue
  const [n, setN] = useState(0);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showP, setShowP] = useState(false);
  const acc = useRef(0);
  const vis = useVisible<HTMLDivElement>();
  const reset = () => { setN(0); setClock(0); };
  const change = (f: () => void) => { f(); setPlaying(false); reset(); };
  const run = (steps: number) => {
    let s = Math.min(n, Kc);
    for (let i = 0; i < steps; i++) {
      const u = Math.random();
      if (u < up[s]) s++;
      else if (u < up[s] + down[s]) s--;
    }
    setN(s); setClock(v => v + steps * h);
  };
  useFrame(playing && vis.on, dt => {
    // one simulated minute per second of real time
    acc.current += dt / h;
    const k = Math.floor(acc.current);
    if (k > 0) { acc.current -= k; run(Math.min(k, 5000)); }
  });

  // bars: show at most 60 states (the rest are tiny when K is large)
  let shown = Kc + 1;
  if (shown > 60) { let cum = 0; shown = 0; while (shown <= Kc && cum < 0.9999) cum += pi[shown++]; shown = Math.max(shown, Math.min(Kc + 1, 20)); }
  const top = Math.max(...pi.slice(0, shown), ...ex.slice(0, shown)) * 1.1;
  const step = (W - 40) / shown, bw = Math.max(1.5, Math.min(40, step * 0.72));
  const X = (k: number) => 20 + k * step + step / 2;
  const label = shown <= 16 ? 1 : Math.ceil(shown / 12);

  // the strip: servers then the line
  const busy = Math.min(n, c), waiting = Math.max(0, n - c);
  const box = 16;

  return (
    <Figure
      title={tx(t, "figQue_title", "A queue as a Markov chain")}
      head={<Choice value={hs} onChange={v => change(() => setHs(v))} options={HS.map(v => [v, `h = ${v}`] as [typeof v, string])} />}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figQue_lam", "arrivals λ /min")} value={lam} min={0.1} max={4} step={0.1} onChange={v => change(() => setLam(v))} />
          <Slider label={tx(t, "figQue_svc", "mean service (min)")} value={svc} min={0.1} max={5} step={0.1} onChange={v => change(() => setSvc(v))} />
          <Slider label={tx(t, "figQue_c", "servers c")} value={c} min={1} max={4} step={1} onChange={v => change(() => setC(v))} fmt={v => String(v)} />
          <Slider label={tx(t, "figQue_K", "capacity K")} value={Kc} min={1} max={200} step={1} onChange={v => change(() => setK(v))} fmt={v => String(v)} />
        </Sliders>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figQue_fullQ", "arrival + departure when full:")}</span>
          <Choice value={full} onChange={v => change(() => setFull(v))} options={[
            ["stay", tx(t, "figQue_stay", "the arrival takes the place")], ["drop", tx(t, "figQue_drop", "the arrival is lost")],
          ]} />
          {Kc <= 6 && <Btn active={showP} onClick={() => setShowP(v => !v)}>{tx(t, "figQue_showP", "matrix P")}</Btn>}
        </Row>
        <div className="overflow-x-auto">
          <table className="border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr className="text-[var(--text-muted)]">
                <th className="px-2 py-0.5 text-left font-normal"></th>
                <th className="px-2 py-0.5 font-normal">L</th><th className="px-2 py-0.5 font-normal">Lq</th>
                <th className="px-2 py-0.5 font-normal">W</th><th className="px-2 py-0.5 font-normal">Wq</th>
                <th className="px-2 py-0.5 font-normal">{`π(${Kc})`}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ color: C.blue }}>
                <td className="px-2 py-0.5">{tx(t, "figQue_chain", "chain, h =") + " " + hs}</td>
                <td className="px-2 py-0.5">{dec(m.L, 4)}</td><td className="px-2 py-0.5">{dec(m.Lq, 4)}</td>
                <td className="px-2 py-0.5">{dec(m.W, 4)}</td><td className="px-2 py-0.5">{dec(m.Wq, 4)}</td>
                <td className="px-2 py-0.5">{dec(m.loss, 4)}</td>
              </tr>
              <tr style={{ color: C.amber }}>
                <td className="px-2 py-0.5">{tx(t, "figQue_exact", "exact (h → 0)")}</td>
                <td className="px-2 py-0.5">{dec(me.L, 4)}</td><td className="px-2 py-0.5">{dec(me.Lq, 4)}</td>
                <td className="px-2 py-0.5">{dec(me.W, 4)}</td><td className="px-2 py-0.5">{dec(me.Wq, 4)}</td>
                <td className="px-2 py-0.5">{dec(me.loss, 4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>}
      note={tx(t, "figQue_note", "Bars: the stationary distribution of the chain, π(n) = probability of n customers in the system. Dots: the exact continuous-time answer. W and Wq come from Little's law with the arrivals that get in, λ(1 − π(K)). Make h smaller and the bars move onto the dots. The choice under the sliders is the one convention the discretisation leaves open: when the system is full and an arrival and a departure fall in the same interval, does the newcomer take the freed place or was it already turned away? It matters less and less as h shrinks. Press play to watch the chain run, one simulated minute per second.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* the strip */}
          {Array.from({ length: c }, (_, i) => (
            <rect key={`s${i}`} x={20 + i * (box + 6)} y={14} width={box} height={box} rx={4}
              fill={i < busy ? C.green : "var(--surface)"} fillOpacity={i < busy ? 0.6 : 1} stroke={i < busy ? C.green : "var(--border)"} />
          ))}
          <line x1={20 + c * (box + 6) + 2} y1={10} x2={20 + c * (box + 6) + 2} y2={34} stroke={C.axis} />
          {Array.from({ length: Math.min(waiting, 22) }, (_, i) => (
            <circle key={`q${i}`} cx={20 + c * (box + 6) + 16 + i * 18} cy={22} r={6} fill={C.amber} fillOpacity={0.75} />
          ))}
          {waiting > 22 && <T x={20 + c * (box + 6) + 16 + 22 * 18} y={26} color={C.amber} size={11}>{`+${waiting - 22}`}</T>}
          <T x={W - 20} y={26} anchor="end" color={C.muted} size={10}>{`n = ${n}   t = ${clock.toFixed(1)} min`}</T>
          {/* π(n) */}
          <line x1={16} y1={BASE} x2={W - 16} y2={BASE} stroke={C.axis} />
          {pi.slice(0, shown).map((p, k) => {
            const hgt = (p / top) * HMAX;
            return (
              <g key={k}>
                <rect x={X(k) - bw / 2} y={BASE - hgt} width={bw} height={hgt} rx={Math.min(3, bw / 3)} fill={C.blue} fillOpacity={k === n ? 0.45 : 0.22} stroke={C.blue} strokeWidth={bw > 4 ? 1 : 0} />
                <circle cx={X(k)} cy={BASE - (ex[k] / top) * HMAX} r={Math.min(3.5, Math.max(1.5, bw / 4))} fill={C.amber} />
                {k % label === 0 && <T x={X(k)} y={BASE + 13} anchor="middle" color={C.muted} size={9}>{String(k)}</T>}
              </g>
            );
          })}
          {shown < Kc + 1 && <T x={W - 18} y={BASE - 6} anchor="end" color={C.muted} size={9}>{`… ${Kc}`}</T>}
        </svg>
        {showP && Kc <= 6 && (
          <NumMatrix t={t} digits={5} row={n} names={Array.from({ length: Kc + 1 }, (_, k) => String(k))}
            P={Array.from({ length: Kc + 1 }, (_, i) => Array.from({ length: Kc + 1 }, (_, j) =>
              j === i + 1 ? up[i] : j === i - 1 ? down[i] : j === i ? 1 - up[i] - down[i] : 0))} />
        )}
        <Transport t={t} playing={playing}
          onPlay={() => setPlaying(p => !p)}
          playLabel={tx(t, "figQue_play", "run the queue")}
          onStep={() => { setPlaying(false); run(Math.round(1 / h)); }}
          onReset={() => { setPlaying(false); reset(); }}
          readout={tx(t, "figQue_stepNote", "⏭ = one minute")} />
      </div>
    </Figure>
  );
}

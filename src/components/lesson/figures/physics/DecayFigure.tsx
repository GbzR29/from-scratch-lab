"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// 400 radioactive nuclei, each one simulated on its own. In every small time
// step dt each undecayed nucleus decays with probability λ·dt, the same for
// all and whatever its age (λ = ln 2 per half-life). Time runs at two seconds
// of animation per half-life, up to six half-lives; the isotope choice only
// says what one half-life is in real time.
// Right: the counts against time, with the exponential law
//   N(t) = N₀ e^(−λt) = N₀ (1/2)^(t/T½)
// and, with "the daughter decays too", the parent → daughter → stable chain
// with the Bateman solution N_D = N₀ λ_P/(λ_D − λ_P) (e^(−λ_P t) − e^(−λ_D t)).
// The readouts list the survivors at each whole half-life.
// "break it: nuclei that wear out" gives each nucleus a fixed lifespan at
// birth (normal, mean = the true mean life 1/λ, spread 10%), like a light
// bulb. Then almost nothing happens for a while and then nearly all go at
// once: the "half" no longer halves.

const W = 560, H = 262, N0 = 400, COLS = 20, TMAX = 6, SEC_PER_HALF = 2;
const LN2 = Math.LN2;
const ISOTOPES = {
  c14: { label: "C-14", half: "5730 y" },
  i131: { label: "I-131", half: "8.02 d" },
  rn222: { label: "Rn-222", half: "3.82 d" },
  po214: { label: "Po-214", half: "164 µs" },
} as const;
type Iso = keyof typeof ISOTOPES;

type Nuc = { s: 0 | 1 | 2; life: number; born: number };

export function DecayFigure({ t }: { t?: TrackTranslations }) {
  const [iso, setIso] = useState<Iso>("c14");
  const [chain, setChain] = useState(false);
  const [ratio, setRatio] = useState(1);
  const [aging, setAging] = useState(false);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();

  const fresh = (rnd: () => number, age: boolean) => ({
    tm: 0, rnd,
    nuc: Array.from({ length: N0 }, (): Nuc => ({ s: 0, life: age ? lifespan(rnd, 1 / LN2) : 0, born: 0 })),
    hist: [[0, N0, 0, 0]] as number[][],
    marks: [N0] as number[],
  });
  const sim = useRef(fresh(mulberry32(11), false));
  const reset = (age = aging) => { sim.current = fresh(mulberry32(11 + Math.floor(Math.random() * 1000)), age); setPlaying(true); rerender(); };

  useFrame(playing && vis.on, dt => {
    const s = sim.current;
    if (s.tm >= TMAX) { setPlaying(false); return; }
    const step = Math.min(dt, 0.05) / SEC_PER_HALF;              // in half-lives
    const lamP = LN2, lamD = LN2 / ratio;
    s.tm = Math.min(TMAX, s.tm + step);
    for (const n of s.nuc) {
      if (n.s === 2 || (n.s === 1 && !chain)) continue;
      const lam = n.s === 0 ? lamP : lamD;
      const decays = aging ? s.tm - n.born >= n.life : s.rnd() < lam * step;
      if (!decays) continue;
      n.s = (n.s + 1) as 1 | 2;
      n.born = s.tm;
      if (n.s === 1 && aging) n.life = lifespan(s.rnd, 1 / lamD);
    }
    const p = s.nuc.filter(n => n.s === 0).length, d = s.nuc.filter(n => n.s === 1).length;
    s.hist.push([s.tm, p, d, N0 - p - d]);
    while (s.marks.length <= Math.floor(s.tm + 1e-9) && s.marks.length <= TMAX) s.marks.push(p);
    rerender();
  });

  const s = sim.current;
  const last = s.hist[s.hist.length - 1];

  // grid of nuclei
  const cell = 10.5, GX = 14, GY = 22;
  // count plot
  const PX0 = 290, PX1 = 540, PY0 = 26, PY1 = 214;
  const X = (tt: number) => PX0 + (tt / TMAX) * (PX1 - PX0);
  const Y = (n: number) => PY1 - (n / N0) * (PY1 - PY0);
  const line = (k: number) => s.hist.map((h, i) => `${i ? "L" : "M"}${X(h[0]).toFixed(1)},${Y(h[k]).toFixed(1)}`).join("");
  const theory = (f: (tt: number) => number) => {
    let d = "";
    for (let i = 0; i <= 120; i++) { const tt = (i / 120) * TMAX; d += `${i ? "L" : "M"}${X(tt).toFixed(1)},${Y(f(tt)).toFixed(1)}`; }
    return d;
  };
  const lamP = LN2, lamD = LN2 / ratio;
  const parentLaw = (tt: number) => N0 * Math.exp(-lamP * tt);
  const daughterLaw = (tt: number) => Math.abs(lamD - lamP) < 1e-9
    ? N0 * lamP * tt * Math.exp(-lamP * tt)
    : (N0 * lamP / (lamD - lamP)) * (Math.exp(-lamP * tt) - Math.exp(-lamD * tt));
  const col = (st: number) => (st === 0 ? C.sky : st === 1 && chain ? C.amber : C.muted);
  const lastFrac = s.marks.length >= 2 ? 1 - s.marks[s.marks.length - 1] / Math.max(1, s.marks[s.marks.length - 2]) : NaN;

  return (
    <Figure title={tx(t, "figPhDecay_title", "Radioactive decay, one nucleus at a time")}
      head={<Btn active={aging} onClick={() => { setAging(a => !a); reset(!aging); }}>{tx(t, "figPhDecay_broken", "break it: nuclei that wear out")}</Btn>}
      controls={<>
        <Row>
          <Choice value={iso} onChange={setIso} options={(Object.keys(ISOTOPES) as Iso[]).map(k => [k, ISOTOPES[k].label] as const)} />
          <Btn active={chain} onClick={() => { setChain(c => !c); reset(); }}>{tx(t, "figPhDecay_chain", "the daughter decays too")}</Btn>
        </Row>
        {chain && <Slider label={tx(t, "figPhDecay_ratio", "daughter half-life (× parent's)")} value={ratio} min={0.1} max={5} step={0.05} onChange={setRatio} fmt={v => f2(v, 2)} width="w-32" />}
        <Row>
          <Readout>{`T½ = ${ISOTOPES[iso].half}`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhDecay_left", "undecayed")}: ${last[1]}`}</Readout>
          {chain && <Readout color={C.amber}>{`${tx(t, "figPhDecay_daughter", "daughter")}: ${last[2]}`}</Readout>}
        </Row>
        <Row>
          <Readout>{`${tx(t, "figPhDecay_marks", "left after 0, 1, 2 … half-lives")}: ${s.marks.join(" → ")}`}</Readout>
          {!Number.isNaN(lastFrac) && <Readout color={Math.abs(lastFrac - 0.5) < 0.12 ? C.green : C.red}>{`${tx(t, "figPhDecay_lastHalf", "decayed in the last half-life")}: ${f2(lastFrac * 100, 0)}%`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhDecay_note", "No one can say when a given nucleus will decay. Each one has the same small chance per second, whatever its age: an old carbon-14 nucleus is exactly as likely to decay in the next second as a newborn one. That single fact is enough to give the exponential law. The more nuclei there are, the more decay per second, so the count falls in proportion to itself, and the time to lose half is always the same: 400 → about 200 → about 100 → about 50. Run it a few times: the counts scatter by roughly the square root of the count, which is why small samples are noisy. With the daughter decaying too, it builds up, peaks and fades; if its half-life is much shorter than the parent's, it soon decays as fast as it is made (secular equilibrium). Now break it: give each nucleus a fixed lifespan, like a light bulb. Nothing happens for a long time, then nearly all of them go together, and 'half-life' loses its meaning. Real nuclei have no memory, which is why radioactive dating works.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {s.nuc.map((n, i) => {
            const x = GX + (i % COLS) * cell, y = GY + Math.floor(i / COLS) * cell;
            return <rect key={i} x={x} y={y} width={cell - 2.5} height={cell - 2.5} rx={2} fill={col(n.s)} opacity={n.s === 2 || (n.s === 1 && !chain) ? 0.45 : 0.9} />;
          })}
          <T x={GX} y={14} size={8}>{`${N0} ${tx(t, "figPhDecay_nuclei", "nuclei")}, ${ISOTOPES[iso].label}`}</T>

          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          {[0, 100, 200, 300, 400].map(n => (
            <g key={n}>
              <line x1={PX0} y1={Y(n)} x2={PX1} y2={Y(n)} stroke={C.grid} />
              <T x={PX0 - 4} y={Y(n) + 3} anchor="end" size={7.5}>{String(n)}</T>
            </g>
          ))}
          {Array.from({ length: TMAX + 1 }, (_, i) => i).map(i => <T key={i} x={X(i)} y={PY1 + 12} anchor="middle" size={7.5}>{String(i)}</T>)}
          <path d={theory(parentLaw)} fill="none" stroke={C.sky} strokeDasharray="4 3" opacity={0.7} />
          {chain && <path d={theory(daughterLaw)} fill="none" stroke={C.amber} strokeDasharray="4 3" opacity={0.7} />}
          <path d={line(1)} fill="none" stroke={C.sky} strokeWidth={1.8} />
          {chain && <path d={line(2)} fill="none" stroke={C.amber} strokeWidth={1.8} />}
          <path d={line(3)} fill="none" stroke={C.muted} strokeWidth={1.2} />
          <T x={PX0} y={PY0 - 10} size={8}>{tx(t, "figPhDecay_plot", "count (solid) and the exponential law (dashed)")}</T>
          <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhDecay_tAx", "time in half-lives")}</T>
          <T x={GX} y={GY + 20 * cell + 12} size={8} color={C.sky}>{tx(t, "figPhDecay_kP", "parent")}</T>
          {chain && <T x={GX + 50} y={GY + 20 * cell + 12} size={8} color={C.amber}>{tx(t, "figPhDecay_daughter", "daughter")}</T>}
          <T x={GX + 110} y={GY + 20 * cell + 12} size={8}>{tx(t, "figPhDecay_kS", "stable")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => (s.tm >= TMAX ? reset() : setPlaying(p => !p))} onReset={() => reset()}
          readout={`t = ${f2(s.tm, 2)} T½`} />
      </div>
    </Figure>
  );
}

/** A lifespan for "nuclei that wear out": normal around the mean life, 10% spread. */
function lifespan(rnd: () => number, mean: number) {
  const u = Math.max(1e-9, rnd()), v = rnd();
  return Math.max(0.05, mean * (1 + 0.1 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)));
}

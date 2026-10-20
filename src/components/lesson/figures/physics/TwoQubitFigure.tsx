"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, C, T, mulberry32, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Two qubits, A and B, and their four amplitudes for |00⟩, |01⟩, |10⟩, |11⟩
// (A's bit first). Every gate here keeps the amplitudes real, so each bar is
// a signed number; its square is the chance of that pair of results.
// Gates: H (A or B) turns 0 into an even mix; X flips; Z flips the sign of
// the 1 part; CNOT flips B when A is 1. H on A then CNOT turns |00⟩ into the
// Bell state (|00⟩ + |11⟩)/√2.
// A state is a product (A and B each have their own state) exactly when
// a₀₀a₁₁ − a₀₁a₁₀ = 0; the "concurrence" C = 2|a₀₀a₁₁ − a₀₁a₁₀| measures
// how entangled it is, from 0 (product) to 1 (a Bell state).
// "measure A" picks A's result with its chance and keeps only the matching
// amplitudes: for a Bell state, B's result is then certain. "measure both,
// 100 times" runs 100 fresh copies of the state shown.

const W = 560, H = 236;
const LABELS = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];
const COLORS = [C.sky, C.teal, C.amber, C.pink];
const S2 = Math.SQRT1_2;
type Amp = [number, number, number, number];

const GATES: Record<string, (a: Amp) => Amp> = {
  "H·A": a => [(a[0] + a[2]) * S2, (a[1] + a[3]) * S2, (a[0] - a[2]) * S2, (a[1] - a[3]) * S2],
  "H·B": a => [(a[0] + a[1]) * S2, (a[0] - a[1]) * S2, (a[2] + a[3]) * S2, (a[2] - a[3]) * S2],
  "X·A": a => [a[2], a[3], a[0], a[1]],
  "X·B": a => [a[1], a[0], a[3], a[2]],
  "Z·A": a => [a[0], a[1], -a[2], -a[3]],
  CNOT: a => [a[0], a[1], a[3], a[2]],
};
const BELL: [string, Amp][] = [
  ["Φ⁺ = (|00⟩ + |11⟩)/√2", [S2, 0, 0, S2]], ["Φ⁻ = (|00⟩ − |11⟩)/√2", [S2, 0, 0, -S2]],
  ["Ψ⁺ = (|01⟩ + |10⟩)/√2", [0, S2, S2, 0]], ["Ψ⁻ = (|01⟩ − |10⟩)/√2", [0, S2, -S2, 0]],
];

export function TwoQubitFigure({ t }: { t?: TrackTranslations }) {
  const [amp, setAmp] = useState<Amp>([1, 0, 0, 0]);
  const [ops, setOps] = useState<string[]>([]);
  const [runs, setRuns] = useState<number[] | null>(null);
  const rnd = useRef(mulberry32(3));

  const apply = (g: string) => { setAmp(a => GATES[g](a)); setOps(o => [...o, g].slice(-12)); setRuns(null); };
  const measure = (which: "A" | "B") => {
    const keep0 = which === "A" ? [0, 1] : [0, 2], keep1 = which === "A" ? [2, 3] : [1, 3];
    const p0 = keep0.reduce((s, i) => s + amp[i] ** 2, 0);
    const zero = rnd.current() < p0, keep = zero ? keep0 : keep1, n = Math.sqrt(zero ? p0 : 1 - p0) || 1;
    setAmp(amp.map((v, i) => (keep.includes(i) ? v / n : 0)) as Amp);
    setOps(o => [...o, `M·${which}=${zero ? 0 : 1}`].slice(-12));
    setRuns(null);
  };
  const hundred = () => {
    const c = [0, 0, 0, 0];
    for (let k = 0; k < 100; k++) {
      let u = rnd.current(), i = 0;
      while (i < 3 && u >= amp[i] ** 2) { u -= amp[i] ** 2; i++; }
      c[i]++;
    }
    setRuns(c);
  };

  const conc = 2 * Math.abs(amp[0] * amp[3] - amp[1] * amp[2]);
  const bell = BELL.find(([, b]) => Math.abs(Math.abs(b.reduce((s, v, i) => s + v * amp[i], 0)) - 1) < 1e-6);
  const kind = conc < 1e-6 ? tx(t, "figPh2q_product", "product state: A and B each have their own state")
    : bell ? `${tx(t, "figPh2q_bell", "a Bell state")}: ${bell[0]}`
      : tx(t, "figPh2q_partly", "partly entangled");

  // the circuit
  const CX0 = 46, CX1 = 296, WA = 70, WB = 140;
  const step = Math.min(34, (CX1 - CX0 - 20) / Math.max(1, ops.length));
  // the bars
  const BX0 = 330, BW = 50, MID = 120, AMPH = 80;

  return (
    <Figure title={tx(t, "figPh2q_title", "Two qubits: from a product state to entanglement")}
      controls={<>
        <Row>
          {Object.keys(GATES).map(g => <Btn key={g} onClick={() => apply(g)}>{g}</Btn>)}
          <Btn onClick={() => measure("A")}>{tx(t, "figPh2q_mA", "measure A")}</Btn>
          <Btn onClick={() => measure("B")}>{tx(t, "figPh2q_mB", "measure B")}</Btn>
          <Btn onClick={hundred}>{tx(t, "figPh2q_runs", "measure both, 100 times")}</Btn>
          <Btn onClick={() => { setAmp([1, 0, 0, 0]); setOps([]); setRuns(null); }}>{tx(t, "figPh2q_reset", "reset to |00⟩")}</Btn>
        </Row>
        <Row>
          <Readout color={conc > 1e-6 ? C.green : C.fg}>{`C = 2|a₀₀a₁₁ − a₀₁a₁₀| = ${f2(conc, 2)}`}</Readout>
          <Readout>{kind}</Readout>
        </Row>
        {runs && <Row>
          {runs.map((n, i) => <Readout key={i} color={COLORS[i]}>{`${LABELS[i]}: ${n}`}</Readout>)}
        </Row>}
      </>}
      note={tx(t, "figPh2q_note", "Two qubits need four amplitudes, one for each pair of results. Start from |00⟩ and press H·A: A becomes an even mix and the state is (|00⟩ + |10⟩)/√2. That is still a product: A is in a mix, B is surely 0, and each could be described alone. Now press CNOT, which flips B whenever A is 1: the state becomes (|00⟩ + |11⟩)/√2, a Bell state. Neither qubit has a state of its own any more; only the pair does. Measure both 100 times: you get 00 or 11, half and half, never 01 or 10. Measure A alone: the result is random, but afterwards B is certain to agree. Try the other gates to reach the other three Bell states. The readout C is zero exactly when the four amplitudes factor into (A's two) × (B's two). A product state can be made from two separate qubits; an entangled one cannot.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* circuit */}
        <T x={8} y={WA + 4} size={10} color={C.fg} bold>A</T>
        <T x={8} y={WB + 4} size={10} color={C.fg} bold>B</T>
        <line x1={CX0 - 6} y1={WA} x2={CX1} y2={WA} stroke={C.muted} />
        <line x1={CX0 - 6} y1={WB} x2={CX1} y2={WB} stroke={C.muted} />
        <T x={20} y={WA + 4} size={8}>|0⟩</T>
        <T x={20} y={WB + 4} size={8}>|0⟩</T>
        {ops.map((g, i) => {
          const x = CX0 + 16 + i * step;
          if (g === "CNOT") return (
            <g key={i}>
              <line x1={x} y1={WA} x2={x} y2={WB + 9} stroke={C.purple} strokeWidth={1.5} />
              <circle cx={x} cy={WA} r={4} fill={C.purple} />
              <circle cx={x} cy={WB} r={9} fill="none" stroke={C.purple} strokeWidth={1.5} />
            </g>
          );
          const onA = g.endsWith("A") || g.startsWith("M·A"), y = onA ? WA : WB, meas = g.startsWith("M");
          return (
            <g key={i}>
              <rect x={x - 12} y={y - 12} width={24} height={24} rx={4} fill={meas ? C.amber : C.sky} opacity={0.85} />
              <T x={x} y={y + 4} anchor="middle" size={meas ? 8 : 10} color="#fff" bold>{meas ? `=${g.slice(-1)}` : g[0]}</T>
            </g>
          );
        })}
        <T x={8} y={20} size={8}>{tx(t, "figPh2q_circuit", "the circuit so far (time runs left to right)")}</T>

        {/* amplitudes */}
        <line x1={BX0 - 6} y1={MID} x2={W - 8} y2={MID} stroke={C.axis} />
        <line x1={BX0 - 6} y1={MID - AMPH} x2={W - 8} y2={MID - AMPH} stroke={C.grid} strokeDasharray="2 3" />
        <line x1={BX0 - 6} y1={MID + AMPH} x2={W - 8} y2={MID + AMPH} stroke={C.grid} strokeDasharray="2 3" />
        <T x={BX0 - 10} y={MID - AMPH + 3} anchor="end" size={8}>+1</T>
        <T x={BX0 - 10} y={MID + AMPH + 3} anchor="end" size={8}>−1</T>
        {amp.map((a, i) => {
          const x = BX0 + i * (BW + 6), h = a * AMPH;
          return (
            <g key={i}>
              <rect x={x} y={Math.min(MID, MID - h)} width={BW} height={Math.abs(h)} rx={2} fill={COLORS[i]} opacity={0.8} />
              <T x={x + BW / 2} y={MID + AMPH + 18} anchor="middle" size={9.5} color={COLORS[i]} bold>{LABELS[i]}</T>
              <T x={x + BW / 2} y={a >= 0 ? MID - h - 5 : MID - h + 12} anchor="middle" size={8.5} color={C.fg}>{f2(a, 2)}</T>
              <T x={x + BW / 2} y={MID + AMPH + 30} anchor="middle" size={8}>{`${f2(a * a * 100, 0)}%`}</T>
            </g>
          );
        })}
        <T x={BX0 - 6} y={20} size={8}>{tx(t, "figPh2q_amps", "amplitudes (chance = square)")}</T>
      </svg>
    </Figure>
  );
}

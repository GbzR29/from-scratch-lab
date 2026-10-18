"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A battery and two lamps (resistors R₁, R₂), in series or in parallel. The
// dots stand for the charge flowing (conventional current, from + to −); they
// move faster where the current is larger. Each lamp glows with its power
// P = I²R. Series: one current I = ε/(R₁ + R₂) through both, and the two
// voltage drops add up to the battery's ε (Kirchhoff's loop rule).
// Parallel: each lamp gets the full ε, the branch currents ε/R add up to the
// battery's current (junction rule).
// "break it: the first lamp uses up current" (series only) lets less current
// leave lamp 1 than entered it. Then charge would pile up in the wire after
// the lamp, without limit: the counter shows how fast. Current is not used up;
// energy is.

const W = 560, H = 300;
type Seg = { a: [number, number]; b: [number, number]; i: () => number };

export function CircuitFigure({ t }: { t?: TrackTranslations }) {
  const [emf, setEmf] = useState(12);
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(20);
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [broken, setBroken] = useState(false);
  const [, setTick] = useState(0);
  const phase = useRef<number[]>([]);
  const piled = useRef(0);
  const vis = useVisible<HTMLDivElement>();

  const series = mode === "series";
  const bad = broken && series;
  let I = 0, I1 = 0, I2 = 0;
  if (series) { I = emf / (R1 + R2); I1 = I; I2 = bad ? I * 0.5 : I; }
  else { I1 = emf / R1; I2 = emf / R2; I = I1 + I2; }
  const V1 = I1 * R1, V2 = series ? I2 * R2 : emf;
  const P1 = I1 * I1 * R1, P2 = I2 * I2 * R2;
  const pRef = (emf * emf) / 10;

  // wire segments with the current each carries
  const segs: Seg[] = series
    ? [
        { a: [80, 260], b: [80, 60], i: () => I },
        { a: [80, 60], b: [280, 60], i: () => I },
        { a: [280, 60], b: [480, 60], i: () => I1 * (bad ? 0.5 : 1) },
        { a: [480, 60], b: [480, 260], i: () => I2 },
        { a: [480, 260], b: [80, 260], i: () => I2 },
      ]
    : [
        { a: [80, 260], b: [80, 60], i: () => I },
        { a: [80, 60], b: [300, 60], i: () => I },
        { a: [300, 60], b: [460, 60], i: () => I2 },
        { a: [300, 60], b: [300, 260], i: () => I1 },
        { a: [460, 60], b: [460, 260], i: () => I2 },
        { a: [460, 260], b: [300, 260], i: () => I2 },
        { a: [300, 260], b: [80, 260], i: () => I },
      ];
  if (phase.current.length !== segs.length) phase.current = segs.map(() => 0);

  useFrame(vis.on, dt => {
    segs.forEach((s, k) => { phase.current[k] = (phase.current[k] + s.i() * 40 * dt) % 22; });
    if (bad) piled.current += (I - I2) * dt; else piled.current = 0;
    setTick(n => (n + 1) & 0xffff);
  });

  const lamp = (x: number, y: number, P: number, label: string) => {
    const glow = clamp(P / pRef, 0.04, 1);
    return (
      <g>
        <circle cx={x} cy={y} r={30} fill={C.amber} opacity={glow * 0.35} />
        <circle cx={x} cy={y} r={15} fill={C.amber} opacity={0.15 + glow * 0.85} stroke={C.fg} strokeWidth={1.5} />
        <path d={`M${x - 7},${y - 7} L${x + 7},${y + 7} M${x - 7},${y + 7} L${x + 7},${y - 7}`} stroke={C.fg} strokeWidth={1.2} />
        <T x={x + 20} y={y - 18} color={C.fg} size={9}>{label}</T>
      </g>
    );
  };

  return (
    <Figure title={tx(t, "figPhCirc_title", "Current, voltage and two lamps")}
      head={series ? <Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhCirc_broken", "break it: the first lamp uses up current")}</Btn> : undefined}
      controls={<>
        <Row>
          <Choice value={mode} onChange={setMode} options={[
            ["series", tx(t, "figPhCirc_series", "in series")],
            ["parallel", tx(t, "figPhCirc_parallel", "in parallel")],
          ]} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figPhCirc_emf", "battery ε")} value={emf} min={1.5} max={24} step={0.5} onChange={setEmf} fmt={v => `${f2(v, 1)} V`} />
          <Slider label="R₁" value={R1} min={2} max={100} step={1} onChange={setR1} fmt={v => `${f2(v, 0)} Ω`} />
          <Slider label="R₂" value={R2} min={2} max={100} step={1} onChange={setR2} fmt={v => `${f2(v, 0)} Ω`} />
        </Sliders>
        <Row>
          <Readout color={C.sky}>{series ? `I = ε/(R₁+R₂) = ${f2(I, 3)} A` : `I = I₁ + I₂ = ${f2(I1, 3)} + ${f2(I2, 3)} = ${f2(I, 3)} A`}</Readout>
          <Readout color={C.amber}>{`V₁ = ${f2(V1, 2)} V · V₂ = ${f2(V2, 2)} V`}</Readout>
          <Readout>{`P₁ = ${f2(P1, 2)} W · P₂ = ${f2(P2, 2)} W`}</Readout>
          {series && !bad && <Readout color={C.green}>{`V₁ + V₂ = ${f2(V1 + V2, 2)} V = ε`}</Readout>}
          {bad && <Readout color={C.red}>{`${tx(t, "figPhCirc_piled", "charge piled up")}: ${f2(piled.current, 2)} C`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhCirc_note", "The dots show charge moving round the circuit, faster where the current is bigger. In series there is one path, so the same current passes through both lamps, and the battery's voltage is shared: the bigger resistance takes the bigger share, and the two drops always add up to the battery's voltage. Raise R₂ and both lamps dim, since less current flows. Now switch to parallel: each lamp sits directly across the battery, gets the full voltage and draws its own current, and the battery supplies the sum. Adding a lamp in parallel does not dim the other one, which is how the sockets in a house are wired. Back in series, break it: if lamp 1 used up some of the current, charge would pile up in the wire after it, a coulomb at a time, forever. What the lamps use is energy: each coulomb arrives with high potential and leaves with low.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {segs.map((s, k) => {
            const [ax, ay] = s.a, [bx, by] = s.b, len = Math.hypot(bx - ax, by - ay);
            const n = Math.floor(len / 22), ux = (bx - ax) / len, uy = (by - ay) / len;
            return (
              <g key={k}>
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke={C.fg} strokeWidth={2} />
                {s.i() > 1e-4 && Array.from({ length: n }, (_, j) => {
                  const d = (j * 22 + (phase.current[k] ?? 0)) % len;
                  return <circle key={j} cx={ax + ux * d} cy={ay + uy * d} r={2.6} fill={bad && k >= 2 ? C.red : C.sky} />;
                })}
              </g>
            );
          })}
          {/* battery on the left side */}
          <rect x={60} y={140} width={40} height={40} fill="var(--code-bg)" />
          <line x1={66} y1={152} x2={94} y2={152} stroke={C.fg} strokeWidth={2.5} />
          <line x1={73} y1={168} x2={87} y2={168} stroke={C.fg} strokeWidth={5} />
          <T x={104} y={152} color={C.red} size={11} bold>+</T>
          <T x={104} y={176} color={C.blue} size={11} bold>−</T>
          <T x={20} y={164} color={C.fg} size={9}>{`${f2(emf, 1)} V`}</T>
          {series ? <>{lamp(280, 60, P1, "R₁")}{lamp(480, 160, P2, "R₂")}</> : <>{lamp(300, 160, P1, "R₁")}{lamp(460, 160, P2, "R₂")}</>}
          {!series && <>
            <circle cx={300} cy={60} r={4} fill={C.fg} /><circle cx={300} cy={260} r={4} fill={C.fg} />
            <T x={306} y={50} size={8.5} color={C.green}>{tx(t, "figPhCirc_junction", "junction: I = I₁ + I₂")}</T>
          </>}
          {bad && <T x={300} y={92} size={9} color={C.red}>{tx(t, "figPhCirc_pile", "charge piling up here")}</T>}
        </svg>
      </div>
    </Figure>
  );
}

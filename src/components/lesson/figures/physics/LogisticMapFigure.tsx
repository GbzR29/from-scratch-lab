"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The logistic map x → r x (1 − x), the simplest rule that turns chaotic.
// Left: the cobweb diagram. From x₀, go up to the parabola (that is the next
// value), across to the diagonal (it becomes the new x), and repeat; the path
// shows where the values go. Top right: the first 50 values from x₀ (pink)
// and from x₀ + 10⁻⁶ (sky), to show sensitivity. Bottom right: the
// bifurcation diagram, for each r from 2.5 to 4 the values the map keeps
// visiting after 600 warm-up steps; the amber line marks the current r.
// Readouts: the long-run behaviour (period found by iterating 2000 times and
// looking for a repeat within 10⁻⁷) and the Lyapunov exponent
// λ = average of ln|r (1 − 2x)| (negative: nearby starts converge;
// positive: they separate, chaos).

const W = 560, H = 300;
const CX0 = 34, CX1 = 254, CY0 = 22, CY1 = 242;       // cobweb box
const SX0 = 290, SX1 = 548, SY0 = 22, SY1 = 128;      // time series box
const BX0 = 290, BX1 = 548, BY0 = 162, BY1 = 272;     // bifurcation box
const R0 = 2.5, R1 = 4;
const PRESETS = [2.8, 3.2, 3.5, 3.56, 3.83, 3.9, 4];

const f = (r: number, x: number) => r * x * (1 - x);

/** Long-run period (0 = none found up to 64) and Lyapunov exponent. */
function analyse(r: number, x0: number) {
  let x = x0, lam = 0;
  for (let i = 0; i < 2000; i++) x = f(r, x);
  for (let i = 0; i < 2000; i++) { lam += Math.log(Math.max(1e-12, Math.abs(r * (1 - 2 * x)))); x = f(r, x); }
  let y = x, period = 0;
  for (let p = 1; p <= 64; p++) { y = f(r, y); if (Math.abs(y - x) < 1e-7) { period = p; break; } }
  return { period, lam: lam / 2000 };
}

/** The bifurcation diagram as one path of tiny dashes (duplicates dropped). */
function bifurcation() {
  let d = "";
  const cols = 260;
  for (let c = 0; c < cols; c++) {
    const r = R0 + ((c + 0.5) / cols) * (R1 - R0);
    let x = 0.5;
    for (let i = 0; i < 600; i++) x = f(r, x);
    const seen = new Set<number>();
    const px = BX0 + ((c + 0.5) / cols) * (BX1 - BX0);
    for (let i = 0; i < 90; i++) {
      x = f(r, x);
      const py = Math.round((BY1 - x * (BY1 - BY0)) * 2) / 2;
      if (seen.has(py)) continue;
      seen.add(py);
      d += `M${px.toFixed(1)},${py}h1`;
    }
  }
  return d;
}

const cx = (x: number) => CX0 + x * (CX1 - CX0), cy = (y: number) => CY1 - y * (CY1 - CY0);

/** The parabola and the cobweb path from x₀. */
function cobweb(r: number, x0: number) {
  let parab = "";
  for (let i = 0; i <= 100; i++) parab += `${i ? "L" : "M"}${cx(i / 100).toFixed(1)},${cy(f(r, i / 100)).toFixed(1)}`;
  let web = `M${cx(x0)},${cy(0)}`, x = x0;
  for (let i = 0; i < 80; i++) { const y = f(r, x); web += `L${cx(x).toFixed(1)},${cy(y).toFixed(1)}L${cx(y).toFixed(1)},${cy(y).toFixed(1)}`; x = y; }
  return { parab, web };
}

/** x₀, x₁, … x₅₀ as a path in the time-series box. */
function timeSeries(r: number, start: number) {
  let d = "", v = start;
  for (let n = 0; n <= 50; n++) {
    d += `${n ? "L" : "M"}${(SX0 + (n / 50) * (SX1 - SX0)).toFixed(1)},${(SY1 - v * (SY1 - SY0)).toFixed(1)}`;
    v = f(r, v);
  }
  return d;
}

export function LogisticMapFigure({ t }: { t?: TrackTranslations }) {
  const [r, setR] = useState(3.2);
  const [x0, setX0] = useState(0.2);
  const bif = useMemo(bifurcation, []);
  const { period, lam } = useMemo(() => analyse(r, x0), [r, x0]);

  const { parab, web } = cobweb(r, x0);
  const series = (start: number) => timeSeries(r, start);
  const bxr = BX0 + ((r - R0) / (R1 - R0)) * (BX1 - BX0);
  const fixed = 1 - 1 / r;

  const kind = period === 1 ? tx(t, "figPhLog_fixed", "settles on one value")
    : period > 1 ? `${tx(t, "figPhLog_cycle", "repeats every")} ${period} ${tx(t, "figPhLog_steps", "steps")}`
    : tx(t, "figPhLog_chaos", "never repeats: chaos");

  return (
    <Figure title={tx(t, "figPhLog_title", "The logistic map: from order to chaos")}
      controls={<>
        <Sliders>
          <Slider label="r" value={r} min={R0} max={R1} step={0.001} onChange={setR} fmt={v => f2(v, 3)} />
          <Slider label="x₀" value={x0} min={0.01} max={0.99} step={0.01} onChange={setX0} fmt={v => f2(v, 2)} />
        </Sliders>
        <Row>
          {PRESETS.map(p => <Btn key={p} active={Math.abs(r - p) < 1e-9} onClick={() => setR(p)}>{`r = ${p}`}</Btn>)}
        </Row>
        <Row>
          <Readout color={period ? C.green : C.red}>{kind}</Readout>
          {period === 1 && <Readout>{`x* = 1 − 1/r = ${f2(fixed, 3)}`}</Readout>}
          <Readout color={lam > 0.005 ? C.red : C.sky}>{`λ = ${f2(lam, 3)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhLog_note", "One line of algebra, x → r x (1 − x), repeated. At r = 2.8 the cobweb spirals into one point: the values settle. At 3.2 they settle into a 2-step cycle, at 3.5 into a 4-step cycle, at 3.56 into an 8-step one: the period keeps doubling, faster and faster, and past r ≈ 3.5699 it never repeats at all. That is chaos: the time series of x₀ (pink) and of x₀ + 0.000001 (sky) agree for a dozen steps and then have nothing to do with each other, and the Lyapunov exponent λ turns positive. The bifurcation diagram at the bottom shows the whole story at once, including the windows of order inside the chaos, like the 3-step cycle at 3.83. Nothing here is random: every value follows exactly from the one before.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x={CX0} y={CY0} width={CX1 - CX0} height={CY1 - CY0} fill="none" stroke={C.axis} />
        <line x1={cx(0)} y1={cy(0)} x2={cx(1)} y2={cy(1)} stroke={C.muted} strokeDasharray="3 3" />
        <path d={parab} fill="none" stroke={C.sky} strokeWidth={2} />
        <path d={web} fill="none" stroke={C.pink} strokeWidth={1} opacity={0.8} />
        <circle cx={cx(x0)} cy={cy(0)} r={3.5} fill={C.pink} />
        <T x={CX1} y={CY1 + 14} anchor="end" size={8}>{tx(t, "figPhLog_xn", "x now")}</T>
        <T x={CX0 + 4} y={CY0 + 12} size={8}>{tx(t, "figPhLog_xnext", "next x")}</T>
        <T x={CX0} y={CY1 + 14} size={7.5}>0</T>
        <T x={CX1 - 6} y={CY1 - 8} anchor="end" size={8} color={C.sky}>{`r x (1 − x)`}</T>

        <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill="none" stroke={C.axis} />
        <path d={series(x0 + 1e-6)} fill="none" stroke={C.sky} strokeWidth={1.4} />
        <path d={series(x0)} fill="none" stroke={C.pink} strokeWidth={1.4} strokeDasharray="4 2" />
        <T x={SX0} y={SY0 - 7} size={8}>{tx(t, "figPhLog_series", "x for steps 0 to 50, from x₀ and from x₀ + 0.000001")}</T>

        <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} fill="none" stroke={C.axis} />
        <path d={bif} stroke={C.sky} strokeWidth={0.9} opacity={0.7} />
        <line x1={bxr} y1={BY0} x2={bxr} y2={BY1} stroke={C.amber} strokeWidth={1.5} />
        <T x={BX0} y={BY0 - 7} size={8}>{tx(t, "figPhLog_bif", "where x ends up, for every r (bifurcation diagram)")}</T>
        {[2.5, 3, 3.5, 4].map(v => <T key={v} x={BX0 + ((v - R0) / (R1 - R0)) * (BX1 - BX0)} y={BY1 + 12} anchor="middle" size={7.5}>{`${v}`}</T>)}
      </svg>
    </Figure>
  );
}

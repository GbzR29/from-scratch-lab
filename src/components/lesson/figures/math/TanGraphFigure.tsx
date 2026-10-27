"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Slider, Sliders, C, T, plot, Grid, fnPath } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// y = a + b · tan(c x + d). Each parameter does one job: a lifts the graph,
// b stretches it upright (and flips it when negative), c squeezes it sideways,
// so the period is π/|c|, and d slides it, so the centre point (where the
// tangent is 0) sits at x = −d/c. The asymptotes, dashed, are where the
// argument cx + d reaches π/2 + kπ: there cos = 0 and the tangent has no value.
// Each branch is drawn on its own, so the curve never jumps across an asymptote.

const p = plot({ W: 560, H: 280, x0: -2 * Math.PI, x1: 2 * Math.PI, y0: -4, y1: 4 });
const n2 = (v: number) => (+v.toFixed(2)).toString().replace("-", "−");
/** A multiple of π written as a fraction: "π/4", "−3π/4", "2π". */
function piFrac(v: number) {
  const q = v / Math.PI;
  for (const den of [1, 2, 3, 4, 6]) {
    const num = Math.round(q * den);
    if (Math.abs(q * den - num) < 1e-6) {
      if (num === 0) return "0";
      const s = num < 0 ? "−" : "", a = Math.abs(num);
      const top = a === 1 ? "π" : `${a}π`;
      return den === 1 ? `${s}${top}` : `${s}${top}/${den}`;
    }
  }
  return n2(v);
}

export function TanGraphFigure({ t }: { t?: TrackTranslations }) {
  const [a, setA] = useState(0), [b, setB] = useState(1), [c, setC] = useState(1), [d, setD] = useState(0);
  const f = (x: number) => a + b * Math.tan(c * x + d);
  const period = Math.PI / c;
  // Asymptotes: c x + d = π/2 + kπ
  const asym = Array.from({ length: 25 }, (_, i) => (Math.PI / 2 + (i - 12) * Math.PI - d) / c)
    .filter(x => x > p.x0 - period && x < p.x1 + period);
  const centre = -d / c;
  const branches = asym.slice(1).map((x1, i) => [asym[i], x1] as const);
  const first = branches.find(([, x1]) => x1 > centre) ?? branches[0];
  const ticks = Array.from({ length: 9 }, (_, i) => -2 * Math.PI + i * (Math.PI / 2));

  return (
    <Figure
      title={tx(t, "figTan_title", "The tangent, stretched and shifted")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figTan_a", "a (lift)")} value={a} min={-2} max={2} step={0.5} onChange={setA} fmt={n2} />
          <Slider label={tx(t, "figTan_b", "b (stretch)")} value={b} min={-2} max={2} step={0.5} onChange={setB} fmt={n2} />
          <Slider label={tx(t, "figTan_c", "c (squeeze)")} value={c} min={0.5} max={3} step={0.5} onChange={setC} fmt={n2} />
          <Slider label={tx(t, "figTan_d", "d (slide)")} value={d} min={-Math.PI} max={Math.PI} step={Math.PI / 4} onChange={setD} fmt={piFrac} />
        </Sliders>
        <Row>
          <Readout color={C.sky}>{`y = ${n2(a)} + ${n2(b)} · tan(${n2(c)}x ${d < 0 ? "−" : "+"} ${piFrac(Math.abs(d))})`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figTan_period", "period")} π/|c| = ${piFrac(period)}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figTan_centre", "centre")} (${piFrac(centre)}, ${n2(a)})`}</Readout>
          <Readout color={C.pink}>{`${tx(t, "figTan_asym", "asymptotes")} x = ${piFrac((Math.PI / 2 - d) / c)} + k · ${piFrac(period)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figTan_note", "A sine has an amplitude; the tangent does not, it runs from −∞ to +∞ on every branch. So b does not set a height: it sets how steep the graph is as it crosses its centre point, and a negative b turns every branch downhill. Only c changes the period, π/|c|; a and d move the graph without changing its shape. The asymptotes are where cx + d = π/2 + kπ, the angles where the cosine is 0.")}
    >
      <svg viewBox={`0 0 ${p.W} ${p.H}`} className="w-full h-auto">
        <Grid p={p} step={Math.PI / 4} major={Math.PI / 2} labels={false} />
        {ticks.filter(x => Math.abs(x) > 1e-9).map(x =>
          <T key={x} x={p.X(x)} y={p.Y(0) + 12} size={8} anchor="middle">{piFrac(x)}</T>)}
        {[-3, -2, -1, 1, 2, 3].map(y => <T key={y} x={p.X(0) - 4} y={p.Y(y) + 3} size={8} anchor="end">{String(y).replace("-", "−")}</T>)}
        <line x1={0} x2={p.W} y1={p.Y(a)} y2={p.Y(a)} stroke={C.amber} strokeDasharray="2 4" opacity={0.6} />
        {asym.map(x => <line key={x} x1={p.X(x)} x2={p.X(x)} y1={0} y2={p.H} stroke={C.pink} strokeDasharray="5 4" opacity={0.8} />)}
        {first && <g>
          <line x1={p.X(first[0])} x2={p.X(first[1])} y1={14} y2={14} stroke={C.green} strokeWidth={1.6} />
          <line x1={p.X(first[0])} x2={p.X(first[0])} y1={9} y2={19} stroke={C.green} strokeWidth={1.6} />
          <line x1={p.X(first[1])} x2={p.X(first[1])} y1={9} y2={19} stroke={C.green} strokeWidth={1.6} />
          <T x={(p.X(first[0]) + p.X(first[1])) / 2} y={28} size={9} anchor="middle" color={C.green}>{`π/|c| = ${piFrac(period)}`}</T>
        </g>}
        {branches.map(([x0, x1]) => {
          const m = (x1 - x0) * 0.002;
          return <path key={x0} d={fnPath(p, f, Math.max(p.x0, x0 + m), Math.min(p.x1, x1 - m), 160)} fill="none" stroke={C.sky} strokeWidth={2.2} />;
        })}
        <circle cx={p.X(centre)} cy={p.Y(a)} r={4.5} fill={C.amber} />
      </svg>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Btn, Slider, Sliders, C, T, plot } from "@/components/lesson/kit/figure";
import { betaAbove, betaMean, betaPdf, betaSd } from "./betaMath";

// ── What this figure shows ────────────────────────────────────────────────────
// Bayesian updating of an unknown probability p. The amber curve is the prior
// Beta(a, b); the dashed blue curve is the likelihood of y successes in n
// trials, rescaled to area 1 so it can share the axes (rescaled, it is the
// density Beta(y + 1, n − y + 1)); the green curve is the posterior
// Beta(a + y, b + n − y), which is the product of the other two, rescaled.
// The ticks under the axis mark the three centres: prior mean, y/n, and
// posterior mean, which always lies between the other two.

const W = 560, H = 240, BASE = H - 24;
const PRESETS: [string, string, number, number][] = [
  ["flat", "Beta(1, 1)", 1, 1],
  ["mild", "Beta(2, 2)", 2, 2],
  ["firm", "Beta(10, 10)", 10, 10],
  ["high", "Beta(8, 2)", 8, 2],
  ["sceptic", "Beta(2, 8)", 2, 8],
];
const dec = (v: number, d = 3) => v.toFixed(d).replace("-", "−");
const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export function BetaBinomialFigure({ t }: { t?: TrackTranslations }) {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [n, setN] = useState(4);
  const [y, setY] = useState(3);

  const A = a + y, B = b + n - y;
  const pr = plot({ W, H: BASE, x0: -0.04, x1: 1.04, y0: 0, y1: 1 });
  const xs = Array.from({ length: 301 }, (_, i) => 0.0005 + (0.999 * i) / 300);
  const curves = [
    { key: "prior", col: C.amber, f: (p: number) => betaPdf(p, a, b) },
    { key: "lik", col: C.sky, f: (p: number) => betaPdf(p, y + 1, n - y + 1) },
    { key: "post", col: C.green, f: (p: number) => betaPdf(p, A, B) },
  ];
  const peak = Math.min(30, Math.max(1.2, ...curves.flatMap(c => xs.map(c.f)).filter(Number.isFinite)) * 1.08);
  const Y = (d: number) => BASE - (Math.min(d, peak) / peak) * (BASE - 14);
  const path = (f: (p: number) => number) => xs.map((p, i) => `${i ? "L" : "M"}${pr.X(p).toFixed(1)},${Y(f(p)).toFixed(1)}`).join("");
  const mPrior = betaMean(a, b), mPost = betaMean(A, B), mle = n > 0 ? y / n : null;

  const setNn = (v: number) => { setN(v); if (y > v) setY(v); };
  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map(p => <g key={p}>
        <line x1={pr.X(p)} x2={pr.X(p)} y1={8} y2={BASE} stroke={C.grid} strokeWidth={0.6} />
        <T x={pr.X(p)} y={H - 6} anchor="middle" color={C.axis} size={9}>{String(p)}</T>
      </g>)}
      <line x1={0} x2={W} y1={BASE} y2={BASE} stroke={C.axis} strokeWidth={1.2} />
      <path d={`${path(curves[2].f)}L${pr.X(xs[300])},${BASE}L${pr.X(xs[0])},${BASE}Z`} fill={C.green} fillOpacity={0.12} />
      <path d={path(curves[0].f)} fill="none" stroke={C.amber} strokeWidth={2} />
      {n > 0 && <path d={path(curves[1].f)} fill="none" stroke={C.sky} strokeWidth={2} strokeDasharray="6 4" />}
      <path d={path(curves[2].f)} fill="none" stroke={C.green} strokeWidth={2.6} />
      {/* the three centres */}
      {([[mPrior, C.amber], [mle, C.sky], [mPost, C.green]] as const).map(([m, col], i) => m !== null &&
        <path key={i} d={`M${pr.X(m)},${BASE + 1} l-5,8 l10,0 Z`} fill={col} />)}
      <T x={18} y={18} color={C.amber} bold>{`${tx(t, "figBB_prior", "prior")} Beta(${num(a)}, ${num(b)})`}</T>
      {n > 0 && <T x={18} y={32} color={C.sky} bold>{`${tx(t, "figBB_lik", "likelihood")}: ${y} / ${n}`}</T>}
      <T x={18} y={n > 0 ? 46 : 32} color={C.green} bold>{`${tx(t, "figBB_post", "posterior")} Beta(${num(A)}, ${num(B)})`}</T>
    </svg>
  );

  const w = (a + b) / (a + b + n);
  const controls = <>
    <Row>
      <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figBB_presets", "prior:")}</span>
      {PRESETS.map(([k, label, pa, pb]) => <Btn key={k} active={a === pa && b === pb} onClick={() => { setA(pa); setB(pb); }}>{label}</Btn>)}
    </Row>
    <Sliders>
      <Slider label="a" value={a} min={0.5} max={30} step={0.5} onChange={setA} fmt={num} width="w-6" />
      <Slider label="b" value={b} min={0.5} max={30} step={0.5} onChange={setB} fmt={num} width="w-6" />
      <Slider label={tx(t, "figBB_n", "trials n")} value={n} min={0} max={200} step={1} onChange={setNn} fmt={String} width="w-16" />
      <Slider label={tx(t, "figBB_y", "successes y")} value={y} min={0} max={n} step={1} onChange={setY} fmt={String} width="w-16" />
    </Sliders>
    <Row>
      <Readout color={C.amber}>{`${tx(t, "figBB_priorMean", "prior mean")} a/(a+b) = ${dec(mPrior)}`}</Readout>
      <Readout color={C.amber}>{`${tx(t, "figBB_strength", "strength")} a+b = ${num(a + b)}`}</Readout>
      <Readout color={C.sky}>{`y/n = ${mle === null ? "—" : dec(mle)}`}</Readout>
    </Row>
    <Row>
      <Readout color={C.green}>{`${tx(t, "figBB_postMean", "posterior mean")} = ${dec(mPost)}`}</Readout>
      <Readout color={C.green}>{`${tx(t, "figBB_sd", "sd")} = ${dec(betaSd(A, B))}`}</Readout>
      <Readout color={C.green}>{`P(p > ½) = ${dec(betaAbove(0.5, A, B))}`}</Readout>
      <Readout>{`${tx(t, "figBB_weight", "weight of the prior")} w = ${dec(w)}`}</Readout>
    </Row>
  </>;

  return (
    <Figure title={tx(t, "figBB_title", "Prior × likelihood → posterior")}
      controls={controls}
      note={tx(t, "figBB_note", "Amber: what you believed before the data (the prior). Dashed blue: how well each p explains y successes in n trials (the likelihood, rescaled to area 1). Green: the posterior, prior times likelihood, rescaled. The triangles under the axis mark the three centres: the posterior mean always sits between the prior mean and y/n, at the share w of the way from y/n to the prior mean. Try a firm prior with little data, then push n up with the same proportion of successes: the prior stops mattering and the green curve narrows onto y/n.")}>
      {view}
    </Figure>
  );
}

"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { C, Choice, Figure, Readout, Row, Slider, Sliders, T } from "@/components/lesson/kit/figure";
import { Phi, normPdf } from "@/components/lesson/figures/math/distMath";
import { dec, stationaryOf, vecTimes, type Mat } from "./numeric";

// ── What this figure shows ────────────────────────────────────────────────────
// The AR(1) process X(n+1) = φ·X(n) + ε, ε ~ N(0, σ²), turned into a finite
// Markov chain. The line is cut into bands of width w centred on the points
// k·w (|k·w| ≤ the range), the two outer bands stretched to ±∞. From the
// point cᵢ the next value is N(φcᵢ, σ²), so P(i → j) is the normal probability
// of band j. The figure solves πP = π for up to a few hundred states (the
// computer part of the exercises) and draws π/w as bars against the exact
// stationary density N(0, σ²/(1 − φ²)); the outer bands are drawn as their
// probabilities. Below, a k-step question P(X(n+k) ≥ c | X(n) = x₀): chain
// (row x₀ of Pᵏ, adding the bands above c) against the exact normal answer.

const WIDTHS = ["2", "1", "0.5", "0.25", "1/11", "0.05"] as const;
const wOf = (s: string) => (s === "1/11" ? 1 / 11 : Number(s));
const W = 560, H = 200, BASE = 170, HMAX = 140;

function chain(phi: number, sigma: number, w: number, range: number) {
  const M = Math.max(1, Math.round(range / w));
  const pts = Array.from({ length: 2 * M + 1 }, (_, i) => (i - M) * w);
  const lo = pts.map((c, i) => (i === 0 ? -Infinity : c - w / 2));
  const hi = pts.map((c, i) => (i === pts.length - 1 ? Infinity : c + w / 2));
  const P: Mat = pts.map(ci => pts.map((_, j) => {
    const m = phi * ci;
    const up = hi[j] === Infinity ? 1 : Phi((hi[j] - m) / sigma);
    const dn = lo[j] === -Infinity ? 0 : Phi((lo[j] - m) / sigma);
    return Math.max(0, up - dn);
  }));
  return { pts, lo, hi, P };
}

export function DiscretizeFigure({ t }: { t?: TrackTranslations }) {
  const [phi, setPhi] = useState(0.5);
  const [sigma, setSigma] = useState(1);
  const [ws, setWs] = useState<(typeof WIDTHS)[number]>("2");
  const [range, setRange] = useState(2);
  const [k, setK] = useState(2);
  const [x0i, setX0i] = useState(0);        // offset from the middle point, in bands
  const [ci, setCi] = useState(0);          // threshold: the lower edge of band (middle + ci + 1)
  const w = wOf(ws);
  const { pts, lo, P } = useMemo(() => chain(phi, sigma, w, range), [phi, sigma, w, range]);
  const pi = useMemo(() => stationaryOf(P), [P]);
  const M = (pts.length - 1) / 2;
  const v = sigma * sigma / (1 - phi * phi), sd = Math.sqrt(v);

  // the k-step question
  const xi = Math.max(0, Math.min(pts.length - 1, M + x0i));
  const edge = Math.max(1, Math.min(pts.length - 1, M + ci + 1));      // bands edge.. are "≥ c"
  const c = lo[edge];
  const row = useMemo(() => {
    let e: number[] = pts.map((_, j) => (j === xi ? 1 : 0));
    for (let s = 0; s < k; s++) e = vecTimes(e, P);
    return e;
  }, [P, pts, xi, k]);
  const chainK = row.slice(edge).reduce((s, p) => s + p, 0);
  const x0 = pts[xi];
  const sdK = sigma * Math.sqrt((1 - phi ** (2 * k)) / (1 - phi * phi));
  const exactK = 1 - Phi((c - phi ** k * x0) / sdK);
  const chainStat = pi ? pi.slice(edge).reduce((s, p) => s + p, 0) : NaN;
  const exactStat = 1 - Phi(c / sd);

  // drawing: x from −R to R
  const R = Math.max(range + w, 3 * sd);
  const X = (x: number) => 20 + ((x + R) / (2 * R)) * (W - 40);
  const dens = (x: number) => normPdf(x, 0, sd);
  const top = Math.max(dens(0), ...(pi ?? []).slice(1, -1).map(p => p / w)) * 1.1;
  const Y = (d: number) => BASE - (d / top) * HMAX;
  let curve = "";
  for (let i = 0; i <= 200; i++) { const x = -R + (2 * R * i) / 200; curve += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(dens(x)).toFixed(1)} `; }

  return (
    <Figure
      title={tx(t, "figDisc_title", "An AR(1) process as a Markov chain")}
      head={<Choice value={ws} onChange={setWs} options={WIDTHS.map(s => [s, `w = ${s}`] as [typeof s, string])} />}
      controls={<>
        <Sliders>
          <Slider label="φ" value={phi} min={-0.95} max={0.95} step={0.05} onChange={setPhi} />
          <Slider label="σ" value={sigma} min={0.5} max={2} step={0.1} onChange={setSigma} />
          <Slider label={tx(t, "figDisc_range", "points up to ±")} value={range} min={1} max={8} step={1} onChange={setRange} fmt={v => String(v)} />
          <Slider label={tx(t, "figDisc_k", "steps k")} value={k} min={1} max={6} step={1} onChange={setK} fmt={v => String(v)} />
          <Slider label={tx(t, "figDisc_x0", "start x₀")} value={x0i} min={-M} max={M} step={1} onChange={setX0i} fmt={() => dec(pts[xi], 3)} />
          <Slider label={tx(t, "figDisc_c", "threshold c")} value={ci} min={-M} max={M - 1} step={1} onChange={setCi} fmt={() => dec(c, 3)} />
        </Sliders>
        <Row>
          <Readout>{`${tx(t, "figDisc_states", "states")}: ${pts.length}`}</Readout>
          <Readout color={C.blue}>{`P(Xₙ₊ₖ ≥ c | x₀) ${tx(t, "figDisc_chain", "chain")} ${dec(chainK, 4)}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figDisc_exact", "exact")} ${dec(exactK, 4)}`}</Readout>
        </Row>
        <Row>
          <Readout color={C.blue}>{`π(X ≥ c) ${tx(t, "figDisc_chain", "chain")} ${pi ? dec(chainStat, 4) : "–"}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figDisc_exact", "exact")} ${dec(exactStat, 4)}`}</Readout>
          <Readout>{`${tx(t, "figDisc_var", "stationary variance")} σ²/(1 − φ²) = ${dec(v, 4)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figDisc_note", "Blue bars: π of the chain divided by the band width, so they can be compared with a density; the two outer bands, which reach to ±∞, are drawn as hatched blocks of their probability. Amber curve: the exact stationary density. Shrink w and widen the range and the bars follow the curve; with w = 1/11 and points up to ±6 the chain has 133 states, solved here in a moment. The second line of numbers answers a k-step question both ways: the chain multiplies the starting row by P k times; the exact answer uses X(n+k) | x₀ ~ N(φᵏx₀, σ²(1 − φ²ᵏ)/(1 − φ²)).")}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <pattern id="discHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={C.blue} strokeWidth="1.4" />
          </pattern>
        </defs>
        <line x1={16} y1={BASE} x2={W - 16} y2={BASE} stroke={C.axis} />
        {pi && pts.map((p, i) => {
          const outer = i === 0 || i === pts.length - 1;
          const x1 = outer ? (i === 0 ? X(-R) : X(p - w / 2)) : X(p - w / 2), x2 = outer ? (i === 0 ? X(p + w / 2) : X(R)) : X(p + w / 2);
          const d = outer ? pi[i] / ((x2 - x1) / (W - 40) * 2 * R) : pi[i] / w;
          return <rect key={i} x={x1 + 0.4} y={Y(d)} width={Math.max(0.6, x2 - x1 - 0.8)} height={BASE - Y(d)}
            fill={outer ? "url(#discHatch)" : C.blue} fillOpacity={outer ? 0.6 : i === xi ? 0.5 : 0.22} stroke={C.blue} strokeWidth={pts.length < 40 ? 0.8 : 0} />;
        })}
        <path d={curve} fill="none" stroke={C.amber} strokeWidth={2} />
        {/* threshold and start */}
        <line x1={X(c)} y1={20} x2={X(c)} y2={BASE} stroke={C.green} strokeDasharray="4 3" />
        <T x={X(c) + 4} y={30} color={C.green} size={10}>{`c = ${dec(c, 3)}`}</T>
        <circle cx={X(x0)} cy={BASE + 10} r={4.5} fill={C.blue} />
        {[-R, -R / 2, 0, R / 2, R].map((x, i) => <T key={i} x={X(x)} y={BASE + 24} anchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} color={C.muted} size={9}>{x.toFixed(1)}</T>)}
      </svg>
    </Figure>
  );
}

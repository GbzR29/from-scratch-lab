"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Row, Readout, Btn, C, T, plot, fnPath, clamp, useFrame, useVisible, type Plot } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Zooming out. The window runs from x = 0 to x = ±R, and the Transport grows R
// from 10 to 10 000 (play glides, ⏭ multiplies by 10). The blue curve is the
// function, the dashed amber curve is its dominant term: the part left after
// keeping only the fastest-growing piece of the top and of the bottom. Far
// out the two curves become indistinguishable, and the readout f / dominant
// heads for 1: that is the whole method of limits at infinity. When the limit
// is a number, the green line is the horizontal asymptote y = L.

type Side = 1 | -1;
type End = { L: number | null; dom: (x: number) => number; domText: string; verdict: string };
type Fn = { key: string; label: string; f: (x: number) => number; plus: End; minus: End };

const W = 560, H = 280;
const K_MIN = 1, K_MAX = 4;                            // R = 10ᵏ

const FNS: Fn[] = [
  {
    key: "lower", label: "(3x + 2)/(x² + 1)", f: x => (3 * x + 2) / (x * x + 1),
    plus: { L: 0, dom: x => 3 / x, domText: "3x / x² = 3/x", verdict: "0" },
    minus: { L: 0, dom: x => 3 / x, domText: "3x / x² = 3/x", verdict: "0" },
  },
  {
    key: "equal", label: "(3x² − 20x)/(x² + 5)", f: x => (3 * x * x - 20 * x) / (x * x + 5),
    plus: { L: 3, dom: () => 3, domText: "3x² / x² = 3", verdict: "3" },
    minus: { L: 3, dom: () => 3, domText: "3x² / x² = 3", verdict: "3" },
  },
  {
    key: "higher", label: "(x² − 8x)/(2x + 1)", f: x => (x * x - 8 * x) / (2 * x + 1),
    plus: { L: null, dom: x => x / 2, domText: "x² / 2x = x/2", verdict: "+∞" },
    minus: { L: null, dom: x => x / 2, domText: "x² / 2x = x/2", verdict: "−∞" },
  },
  {
    key: "root", label: "√(4x² + 1)/(x + 3)", f: x => Math.sqrt(4 * x * x + 1) / (x + 3),
    plus: { L: 2, dom: () => 2, domText: "2|x| / x = 2x / x = 2", verdict: "2" },
    minus: { L: -2, dom: () => -2, domText: "2|x| / x = −2x / x = −2", verdict: "−2" },
  },
  {
    key: "conj", label: "√(x² + 6x) − x", f: x => Math.sqrt(x * x + 6 * x) - x,
    plus: { L: 3, dom: () => 3, domText: "6x / (|x| + x) = 6x / 2x = 3", verdict: "3" },
    minus: { L: null, dom: x => -2 * x, domText: "|x| − x = −x − x = −2x", verdict: "+∞" },
  },
  {
    key: "exp", label: "(3·2ˣ + x)/(2ˣ + 1)",
    // written so that 2ˣ never overflows: for x > 0 divide top and bottom by 2ˣ first
    f: x => (x > 0 ? (3 + x * 2 ** -x) / (1 + 2 ** -x) : (3 * 2 ** x + x) / (2 ** x + 1)),
    plus: { L: 3, dom: () => 3, domText: "3·2ˣ / 2ˣ = 3", verdict: "3" },
    minus: { L: null, dom: x => x, domText: "x / 1 = x  (2ˣ → 0)", verdict: "−∞" },
  },
];

const sup = (k: number) => String(k).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]).join("");
const fmt = (v: number) =>
  (!Number.isFinite(v) ? "—" : Math.abs(v) >= 1e5 ? v.toExponential(2) : Math.abs(v) >= 100 ? v.toFixed(1) : v.toFixed(4)).replace("-", "−");
const fmtR = (R: number) => (R >= 1e4 ? "10 000" : R >= 100 ? Math.round(R).toString() : R.toFixed(1));
/** A round grid spacing that gives about `n` lines over `span`. */
function niceStep(span: number, n = 6) {
  const raw = span / n, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
const label = (v: number) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : `${+v.toFixed(3)}`).replace("-", "−");

// ── The drawing ───────────────────────────────────────────────────────────────

/** Grid with its own spacing on each axis (x runs to thousands, y stays small). */
function AxisGrid({ p }: { p: Plot }) {
  const sx = niceStep(p.x1 - p.x0), sy = niceStep(p.y1 - p.y0, 5);
  const xs: number[] = [], ys: number[] = [];
  for (let x = Math.ceil(p.x0 / sx) * sx; x <= p.x1 + 1e-9; x += sx) xs.push(x);
  for (let y = Math.ceil(p.y0 / sy) * sy; y <= p.y1 + 1e-9; y += sy) ys.push(y);
  const yAxis = clamp(p.X(0), 0, p.W);
  return (
    <g pointerEvents="none">
      {xs.map(x => <line key={`x${x}`} x1={p.X(x)} x2={p.X(x)} y1={0} y2={p.H} stroke={C.grid} strokeWidth={0.6} />)}
      {ys.map(y => <line key={`y${y}`} y1={p.Y(y)} y2={p.Y(y)} x1={0} x2={p.W} stroke={C.grid} strokeWidth={0.6} />)}
      {p.y0 <= 0 && p.y1 >= 0 && <line y1={p.Y(0)} y2={p.Y(0)} x1={0} x2={p.W} stroke={C.axis} strokeWidth={1.2} />}
      <line x1={yAxis} x2={yAxis} y1={0} y2={p.H} stroke={C.axis} strokeWidth={1.2} />
      {xs.filter(x => Math.abs(x) > 1e-9 && p.X(x) > 14 && p.X(x) < p.W - 14).map(x =>
        <text key={`lx${x}`} x={p.X(x)} y={p.H - 4} fontSize={8.5} fill={C.axis} textAnchor="middle" fontFamily="monospace">{label(x)}</text>)}
      {ys.filter(y => p.Y(y) > 8 && p.Y(y) < p.H - 14).map(y =>
        <text key={`ly${y}`} x={yAxis < p.W / 2 ? yAxis + 4 : yAxis - 4} y={p.Y(y) - 2} fontSize={8.5} fill={C.axis}
          textAnchor={yAxis < p.W / 2 ? "start" : "end"} fontFamily="monospace">{label(y)}</text>)}
    </g>
  );
}

function InfinityDrawing({ fn, side, R }: { fn: Fn; side: Side; R: number }) {
  const end = side === 1 ? fn.plus : fn.minus;
  const [a, b] = side === 1 ? [0, R] : [-R, 0];
  // the vertical range: what the curve does over the outer part of the window, plus L itself
  const ys: number[] = end.L !== null ? [end.L] : [0];
  for (let i = 0; i <= 200; i++) {
    const x = side * (R / 25 + (R - R / 25) * i / 200), y = fn.f(x);
    if (Number.isFinite(y)) ys.push(y);
  }
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = Math.max((y1 - y0) * 0.15, 0.6);
  y0 -= pad; y1 += pad;
  const pr = plot({ W, H, x0: a, x1: b, y0, y1 });
  const n = 600;
  const xEnd = side * R;
  const yEnd = fn.f(xEnd);
  return <>
    <AxisGrid p={pr} />
    {end.L !== null && <>
      <line x1={0} x2={W} y1={pr.Y(end.L)} y2={pr.Y(end.L)} stroke={C.green} strokeWidth={1.4} strokeDasharray="6 4" />
      <T x={side === 1 ? W - 6 : 6} y={pr.Y(end.L) - 5} color={C.green} bold anchor={side === 1 ? "end" : "start"}>{`y = ${fmt(end.L).replace(/\.?0+$/, "")}`}</T>
    </>}
    <path d={fnPath(pr, end.dom, a, b, n)} fill="none" stroke={C.amber} strokeWidth={2} strokeDasharray="7 5" />
    <path d={fnPath(pr, fn.f, a, b, n)} fill="none" stroke={C.sky} strokeWidth={2.2} />
    {Number.isFinite(yEnd) && <circle cx={pr.X(xEnd) - side * 3} cy={pr.Y(yEnd)} r={4.5} fill={C.sky} />}
  </>;
}

export function InfinityFigure({ t }: { t?: TrackTranslations }) {
  const [key, setKey] = useState("equal");
  const [side, setSide] = useState<Side>(1);
  const [k, setK] = useState(K_MIN);
  const [playing, setPlaying] = useState(false);
  const vis = useVisible<HTMLDivElement>();

  useFrame(playing && vis.on, dt => {
    if (k >= K_MAX) setPlaying(false);
    else setK(Math.min(K_MAX, k + dt * 0.6));
  });

  const fn = FNS.find(e => e.key === key)!;
  const end = side === 1 ? fn.plus : fn.minus;
  const R = 10 ** k;
  const x = side * R, fx = fn.f(x), dx = end.dom(x);
  const stop = () => setPlaying(false);
  const zoomTo = (v: number) => { stop(); setK(clamp(v, K_MIN, K_MAX)); };
  const choose = (kk: string) => { setKey(kk); setK(K_MIN); stop(); };
  const turn = (s: Side) => { setSide(s); setK(K_MIN); stop(); };

  const sideTxt = side === 1 ? "+∞" : "−∞";
  const view = (
    <div ref={vis.ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"><InfinityDrawing fn={fn} side={side} R={R} /></svg>
      <Transport t={t} playing={playing}
        onPlay={() => { if (k >= K_MAX) setK(K_MIN); setPlaying(p => !p); }}
        playLabel={tx(t, "figInf_zoom", "zoom out")}
        onStep={() => zoomTo(Math.floor(k + 1e-6) + 1)}
        onBack={() => zoomTo(Math.ceil(k - 1e-6) - 1)}
        onReset={() => zoomTo(K_MIN)}
        readout={`|x| ≤ ${fmtR(R)}${Number.isInteger(+k.toFixed(6)) ? ` = 10${sup(Math.round(k))}` : ""}`} />
    </div>
  );

  const controls = <>
    <Row>{FNS.map(e => <Btn key={e.key} active={key === e.key} onClick={() => choose(e.key)}>{e.label}</Btn>)}</Row>
    <Row>
      <Readout color={C.sky}>{`f(${fmt(x)}) = ${fmt(fx)}`}</Readout>
      <Readout color={C.amber}>{`${tx(t, "figInf_dom", "dominant")}: ${end.domText}`}</Readout>
    </Row>
    <Row>
      <Readout>{`f / ${tx(t, "figInf_dom", "dominant")} = ${fmt(fx / dx)}`}</Readout>
      {end.L !== null && <Readout color={C.green}>{`|f − L| = ${fmt(Math.abs(fx - end.L))}`}</Readout>}
      <Readout color={end.L !== null ? C.green : C.red}>{`${tx(t, "figInf_lim", "limit as x →")} ${sideTxt}: ${end.verdict}`}</Readout>
    </Row>
  </>;

  return (
    <Figure fullscreen={false} title={tx(t, "figInf_title", "Zooming out: the dominant term takes over")}
      head={<Choice value={side === 1 ? "plus" : "minus"} onChange={v => turn(v === "plus" ? 1 : -1)} options={[
        ["plus", "x → +∞"],
        ["minus", "x → −∞"],
      ] as const} />}
      controls={controls}
      note={tx(t, "figInf_note", "Press play, or ⏭, to zoom out: the window grows from |x| ≤ 10 to |x| ≤ 10 000. The blue curve is the function; the dashed amber curve keeps only its dominant term, the fastest-growing part of the top over the fastest-growing part of the bottom. Near 0 they disagree, sometimes wildly, but as the window grows the blue curve melts into the amber one and f / dominant closes in on 1. So the limit of f is the limit of its dominant term, which is easy: a number (the green line, a horizontal asymptote), or a curve that runs off to ±∞. Switch to x → −∞ and watch the square root and the conjugate change their answer.")}
    >
      {view}
    </Figure>
  );
}

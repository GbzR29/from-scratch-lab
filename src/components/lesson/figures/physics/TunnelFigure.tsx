"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A wave packet running into a barrier, computed by solving the Schrödinger
// equation  iħ ∂ψ/∂t = −(ħ²/2m) ∂²ψ/∂x² + V ψ  on a grid of 600 points with
// the Crank–Nicolson method (each step solves one tridiagonal system; the
// method keeps the total probability exactly 1). Units ħ = m = 1: the packet
// starts with wavenumber k₀ = 2, so its mean energy is about k₀²/2 = 2 (the
// dashed line). The barrier height is set as a multiple of that energy.
// A classical ball with less energy than the barrier always bounces back; the
// wave leaks through, and the share that gets through falls off roughly as
// e^(−2κa), with κ = √(2m(V₀ − E))/ħ: a thicker or taller barrier lets
// exponentially less through. Readouts compare the share measured on the
// grid with the plane-wave formula (one exact energy, so it differs a little
// from a packet, which has a spread of energies).

const W = 560, H = 230, N = 600, DX = 0.1, DT = 0.02, STEPS = 2;
const XB = 32, K0 = 2, SIG = 2.2, X_START = 16, T_END = 13;
const E0 = (K0 * K0) / 2;
const sx = (j: number) => 10 + (j / (N - 1)) * (W - 20);

type Sim = { re: Float64Array; im: Float64Array; V: Float64Array; time: number };

function start(v0: number, a: number): Sim {
  const re = new Float64Array(N), im = new Float64Array(N), V = new Float64Array(N);
  let s = 0;
  for (let j = 0; j < N; j++) {
    const x = j * DX, g = Math.exp(-((x - X_START) ** 2) / (4 * SIG * SIG));
    re[j] = g * Math.cos(K0 * x); im[j] = g * Math.sin(K0 * x);
    s += g * g * DX;
    V[j] = x >= XB && x < XB + a ? v0 * E0 : 0;
  }
  const k = 1 / Math.sqrt(s);
  for (let j = 0; j < N; j++) { re[j] *= k; im[j] *= k; }
  return { re, im, V, time: 0 };
}

// scratch arrays for the tridiagonal solve
const cr = new Float64Array(N), ci = new Float64Array(N), dr = new Float64Array(N), di = new Float64Array(N);
const br = new Float64Array(N), bi = new Float64Array(N);

/** One Crank–Nicolson step: (1 + iHΔt/2) ψ' = (1 − iHΔt/2) ψ, with ψ = 0 at both ends. */
function step(s: Sim) {
  const { re, im, V } = s;
  const r = DT / (4 * DX * DX);                        // off-diagonal size of iHΔt/2
  // right-hand side b = (1 − iHΔt/2) ψ
  for (let j = 1; j < N - 1; j++) {
    const h = DT / 2 * (1 / (DX * DX) + V[j]);         // diagonal of HΔt/2
    // (1 − i h) ψ_j + i r (ψ_{j+1} + ψ_{j−1})
    const sr = re[j + 1] + re[j - 1], si = im[j + 1] + im[j - 1];
    br[j] = re[j] + h * im[j] - r * si;
    bi[j] = im[j] - h * re[j] + r * sr;
  }
  // Thomas algorithm for A ψ' = b, A = tridiag(−i r, 1 + i h_j, −i r)
  // off-diagonal o = −i r (pure imaginary)
  cr[0] = 0; ci[0] = 0; dr[0] = 0; di[0] = 0;
  for (let j = 1; j < N - 1; j++) {
    const h = DT / 2 * (1 / (DX * DX) + V[j]);
    // denominator m = (1 + i h) − o · c_{j−1} = 1 + i h + i r · c_{j−1}
    const mr = 1 - r * ci[j - 1], mi = h + r * cr[j - 1];
    const md = mr * mr + mi * mi;
    // c_j = o / m = (−i r) / m
    cr[j] = (-r * mi) / md; ci[j] = (-r * mr) / md;
    // d_j = (b_j − o · d_{j−1}) / m = (b_j + i r d_{j−1}) / m
    const nr = br[j] - r * di[j - 1], ni = bi[j] + r * dr[j - 1];
    dr[j] = (nr * mr + ni * mi) / md; di[j] = (ni * mr - nr * mi) / md;
  }
  re[N - 1] = 0; im[N - 1] = 0;
  for (let j = N - 2; j >= 1; j--) {
    const nr = dr[j] - (cr[j] * re[j + 1] - ci[j] * im[j + 1]);
    const ni = di[j] - (cr[j] * im[j + 1] + ci[j] * re[j + 1]);
    re[j] = nr; im[j] = ni;
  }
  re[0] = 0; im[0] = 0;
  s.time += DT;
}

/** Plane-wave transmission through a rectangular barrier (ħ = m = 1). */
function planeT(E: number, V0: number, a: number) {
  if (a <= 0) return 1;
  if (Math.abs(E - V0) < 1e-6) return 1 / (1 + (V0 * a * a) / 2);
  if (E < V0) {
    const k = Math.sqrt(2 * (V0 - E)), s = Math.sinh(k * a);
    return 1 / (1 + (V0 * V0 * s * s) / (4 * E * (V0 - E)));
  }
  const k = Math.sqrt(2 * (E - V0)), s = Math.sin(k * a);
  return 1 / (1 + (V0 * V0 * s * s) / (4 * E * (E - V0)));
}

export function TunnelFigure({ t }: { t?: TrackTranslations }) {
  const [v0, setV0] = useState(1.3);
  const [a, setA] = useState(0.8);
  const [playing, setPlaying] = useState(true);
  const [, setTick] = useState(0);
  const sim = useRef<Sim>(start(1.3, 0.8));
  const vis = useVisible<HTMLDivElement>();

  const restart = (nv: number, na: number) => { sim.current = start(nv, na); setPlaying(true); setTick(k => (k + 1) & 0xffff); };

  useFrame(playing && vis.on, () => {
    const s = sim.current;
    if (s.time >= T_END) { setPlaying(false); return; }
    for (let k = 0; k < STEPS; k++) step(s);
    setTick(k => (k + 1) & 0xffff);
  });

  const s = sim.current;
  let right = 0, total = 0, peak = 0;
  for (let j = 0; j < N; j++) {
    const p = s.re[j] * s.re[j] + s.im[j] * s.im[j];
    total += p * DX; if (j * DX >= XB + a) right += p * DX;
    peak = Math.max(peak, p);
  }
  const P0 = 1 / (Math.sqrt(2 * Math.PI) * SIG);        // peak of |ψ|² at the start
  const Yp = (p: number) => H - 30 - (p / P0) * (H - 80);
  const yE = H - 30 - 0.5 * (H - 80);                    // the energy E₀ is drawn at mid-height
  const yV = H - 30 - Math.min(1.6, v0 * 0.5) * (H - 80);
  let dP = `M${sx(0)},${H - 30}`, dRe = "";
  for (let j = 0; j < N; j++) {
    const p = s.re[j] * s.re[j] + s.im[j] * s.im[j];
    dP += `L${sx(j).toFixed(1)},${Yp(p).toFixed(1)}`;
    dRe += `${j ? "L" : "M"}${sx(j).toFixed(1)},${(H - 30 - (s.re[j] / Math.sqrt(P0)) * (H - 80) * 0.5).toFixed(1)}`;
  }
  dP += `L${sx(N - 1)},${H - 30}Z`;
  const bx0 = sx(XB / DX), bx1 = sx((XB + a) / DX);
  const theory = planeT(E0, v0 * E0, a);
  const kappa = v0 > 1 ? Math.sqrt(2 * (v0 - 1) * E0) : 0;

  return (
    <Figure title={tx(t, "figPhTun_title", "A wave packet meets a barrier")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhTun_v", "barrier height V₀ / E")} value={v0} min={0} max={3} step={0.05} onChange={v => { setV0(v); restart(v, a); }} fmt={v => f2(v, 2)} width="w-32" />
          <Slider label={tx(t, "figPhTun_a", "barrier width a")} value={a} min={0.1} max={3} step={0.05} onChange={v => { setA(v); restart(v0, v); }} fmt={v => f2(v, 2)} width="w-32" />
        </Sliders>
        <Row>
          <Readout color={C.green}>{`${tx(t, "figPhTun_through", "got through")}: ${f2((right / total) * 100, 1)}%`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figPhTun_plane", "plane-wave formula")}: ${f2(theory * 100, 1)}%`}</Readout>
          <Readout color={v0 > 1 ? C.red : C.fg}>{`${tx(t, "figPhTun_ball", "a classical ball")}: ${v0 > 1 ? "0%" : "100%"}`}</Readout>
          {kappa > 0 && <Readout>{`κa = ${f2(kappa * a, 2)}, e^(−2κa) = ${f2(Math.exp(-2 * kappa * a) * 100, 1)}%`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhTun_note", "A particle's wave packet runs from the left into a wall of potential energy, the orange block. The dashed line is the packet's energy. When the wall is taller than that line, a ball rolling at a hill it cannot climb comes straight back, every time. The wave does not stop dead at the wall: inside, it dies away exponentially instead of oscillating, and if the wall is thin enough, some of it is still there on the far side and carries on. Watch the packet split in two: most bounces back, a smaller copy appears beyond the barrier. That share is the chance that the particle tunnels through. Make the barrier a little wider or taller and the share collapses, roughly as e^(−2κa). Lower the barrier below the dashed line and, strangely, some of the wave still bounces back. The simulation solves the Schrödinger equation on 600 points, in units where ħ and the mass are 1.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={10} y1={H - 30} x2={W - 10} y2={H - 30} stroke={C.axis} />
          {v0 > 0 && <rect x={bx0} y={yV} width={Math.max(1.5, bx1 - bx0)} height={H - 30 - yV} fill={C.orange} opacity={0.75} />}
          {v0 * 0.5 > 1.6 && <T x={bx1 + 3} y={yV + 8} size={8} color={C.orange}>↑</T>}
          <line x1={10} y1={yE} x2={W - 10} y2={yE} stroke={C.fg} strokeDasharray="5 4" opacity={0.6} />
          <T x={14} y={yE - 4} size={8}>{tx(t, "figPhTun_energy", "packet's energy E")}</T>
          <T x={bx1 + 4} y={Math.min(yV + 10, H - 36)} size={8} color={C.orange}>{`V₀ = ${f2(v0, 2)} E`}</T>
          <path d={dRe} fill="none" stroke={C.sky} strokeWidth={0.8} opacity={0.5} />
          <path d={dP} fill={C.sky} opacity={0.3} stroke={C.sky} strokeWidth={1.6} />
          <T x={W - 12} y={H - 14} anchor="end" size={8}>{tx(t, "figPhTun_key", "|ψ|² (filled) and Re ψ (thin)")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => { if (s.time >= T_END) restart(v0, a); else setPlaying(p => !p); }} onReset={() => restart(v0, a)}
          readout={`t = ${f2(s.time, 1)}`} />
      </div>
    </Figure>
  );
}

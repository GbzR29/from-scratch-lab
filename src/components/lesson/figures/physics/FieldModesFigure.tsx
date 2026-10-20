"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A field as a row of oscillators. 120 values φᵢ on a ring, each pulled back
// to zero by its own spring (the mass term) and tied to its two neighbours by
// springs (the gradient term). In units ħ = c = 1 and lattice spacing 1:
//   φ̈ᵢ = κ(φᵢ₊₁ − 2φᵢ + φᵢ₋₁) − m²φᵢ
// the Klein–Gordon equation on a lattice (κ = 1; "break it" sets κ = 0).
// Its waves e^(i(kx − ωt)) obey ω² = m² + 4κ sin²(k/2), which for long waves
// is ω² = m² + k², i.e. E² = m² + p² with E = ħω and p = ħk. A wave packet of
// carrier wavenumber k₀ moves at the group velocity v = dω/dk = κ sin k₀ / ω,
// always below 1 (light), and equal to 1 only for a massless field and long
// waves. The figure measures the packet's speed from the centre of its energy
// and compares. Integration: leapfrog, dt = 0.1, exact enough to keep the
// energy to a fraction of a percent. Bottom: the dispersion curve ω(k), the
// light line ω = k, the chosen k₀ and its slope.

const W = 560, H = 290, N = 120, DT = 0.1, SIM_PER_SEC = 9;
const X0 = 20, X1 = 540, BASE = 78;

export function FieldModesFigure({ t }: { t?: TrackTranslations }) {
  const [m, setM] = useState(0.4);
  const [k0, setK0] = useState(0.6);
  const [cut, setCut] = useState(false);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const kappa = cut ? 0 : 1;
  const omega = (k: number) => Math.sqrt(m * m + 4 * kappa * Math.sin(k / 2) ** 2);
  const w0 = omega(k0);
  const vg = w0 > 0 ? (kappa * Math.sin(k0)) / w0 : 0;

  const launch = (mm = m, kk = k0, kap = kappa) => {
    const phi = new Float64Array(N), pi = new Float64Array(N);
    const w = Math.sqrt(mm * mm + 4 * kap * Math.sin(kk / 2) ** 2), c0 = 30, sig = 7;
    for (let i = 0; i < N; i++) {
      const g = Math.exp(-((i - c0) ** 2) / (2 * sig * sig));
      phi[i] = g * Math.cos(kk * (i - c0));
      pi[i] = g * w * Math.sin(kk * (i - c0));
    }
    return { phi, pi, tm: 0, clock: 0, track: [] as [number, number][], vMeas: NaN };
  };
  const sim = useRef(launch());
  const restart = (mm = m, kk = k0, kap = kappa) => { sim.current = launch(mm, kk, kap); setPlaying(true); rerender(); };

  useFrame(playing && vis.on, dt => {
    const s = sim.current, steps = Math.round((Math.min(dt, 0.05) * SIM_PER_SEC) / DT);
    const { phi, pi } = s, m2 = m * m;
    for (let n = 0; n < steps; n++) {
      // kick–drift–kick leapfrog
      for (let i = 0; i < N; i++) pi[i] += 0.5 * DT * (kappa * (phi[(i + 1) % N] - 2 * phi[i] + phi[(i + N - 1) % N]) - m2 * phi[i]);
      for (let i = 0; i < N; i++) phi[i] += DT * pi[i];
      for (let i = 0; i < N; i++) pi[i] += 0.5 * DT * (kappa * (phi[(i + 1) % N] - 2 * phi[i] + phi[(i + N - 1) % N]) - m2 * phi[i]);
      s.tm += DT;
    }
    // centre of the energy on the ring (circular mean), unwrapped for the speed
    let cx = 0, cy = 0;
    for (let i = 0; i < N; i++) {
      const e = 0.5 * pi[i] ** 2 + 0.5 * kappa * (phi[(i + 1) % N] - phi[i]) ** 2 + 0.5 * m2 * phi[i] ** 2;
      const a = (2 * Math.PI * (i + 0.5)) / N;
      cx += e * Math.cos(a); cy += e * Math.sin(a);
    }
    let pos = (Math.atan2(cy, cx) / (2 * Math.PI)) * N;
    const last = s.track[s.track.length - 1];
    if (last) { while (pos - last[1] > N / 2) pos -= N; while (pos - last[1] < -N / 2) pos += N; }
    s.track.push([s.tm, pos]);
    while (s.track.length > 2 && s.tm - s.track[0][0] > 12) s.track.shift();
    if (s.track.length > 4 && s.tm > 6) {
      const a = s.track[0], b = s.track[s.track.length - 1];
      s.vMeas = (b[1] - a[1]) / (b[0] - a[0]);
    }
    rerender();
  });

  const s = sim.current;
  const X = (i: number) => X0 + (i / (N - 1)) * (X1 - X0);
  const Yf = (v: number) => BASE - v * 34;
  let energy = "";
  for (let i = 0; i < N; i++) {
    const e = 0.5 * s.pi[i] ** 2 + 0.5 * kappa * (s.phi[(i + 1) % N] - s.phi[i]) ** 2 + 0.5 * m * m * s.phi[i] ** 2;
    energy += `${i ? "L" : "M"}${X(i).toFixed(1)},${(152 - Math.min(1, e / 0.6) * 30).toFixed(1)}`;
  }

  // dispersion plot
  const PX0 = 60, PX1 = 300, PY0 = 176, PY1 = 270, KMAX = Math.PI, WMAX = 2.4;
  const kx = (k: number) => PX0 + (k / KMAX) * (PX1 - PX0);
  const wy = (w: number) => PY1 - (Math.min(w, WMAX) / WMAX) * (PY1 - PY0);
  let disp = "";
  for (let i = 0; i <= 80; i++) { const k = (i / 80) * KMAX; disp += `${i ? "L" : "M"}${kx(k).toFixed(1)},${wy(omega(k)).toFixed(1)}`; }
  const tan = (dk: number) => [kx(k0 + dk), wy(w0 + vg * dk)] as const;
  const [ta, tb] = [tan(-0.5), tan(0.5)];

  return (
    <Figure title={tx(t, "figPhField_title", "A field is a row of oscillators; a particle is a ripple in it")}
      head={<Btn active={cut} onClick={() => { setCut(c => !c); restart(m, k0, cut ? 1 : 0); }}>{tx(t, "figPhField_broken", "break it: cut the neighbour springs")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figPhField_m", "mass m (own spring)")} value={m} min={0} max={1.2} step={0.01} onChange={v => { setM(v); restart(v, k0); }} fmt={v => f2(v, 2)} width="w-32" />
        <Slider label={tx(t, "figPhField_k", "wavenumber k₀ (momentum)")} value={k0} min={0.05} max={1.6} step={0.01} onChange={v => { setK0(v); restart(m, v); }} fmt={v => f2(v, 2)} width="w-32" />
        <Row>
          <Readout>{`ω₀ = √(m² + 4 sin²(k₀/2)) = ${f2(w0, 3)}`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhField_pred", "predicted speed")} dω/dk = ${f2(vg, 3)} c`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figPhField_meas", "measured")}: ${Number.isNaN(s.vMeas) ? "…" : `${f2(s.vMeas, 3)} c`}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhField_note", "Each dot is the value of the field at one point of space. Each one has its own spring pulling it back to zero (that spring is the mass), and springs tie it to its neighbours (they make a disturbance spread). A wave packet, a ripple of a definite wavenumber, travels along the row: this is what a particle is in quantum field theory. Its speed comes out of the springs: set m = 0 and long waves travel at exactly 1, the speed of light in these units; give the field a mass and the packet goes slower, and slower still for small k₀, a slow particle. No setting makes it faster than light. The lower plot is ω against k, which quantum mechanics reads as energy against momentum (E = ħω, p = ħk): for long waves it is E² = m² + p², Einstein's relation of the relativity chapter, and the packet's speed is the slope. Now cut the neighbour springs: every point just bobs in place at ω = m, and nothing moves. A particle can only travel because each point of the field is coupled to the next. Quantum mechanics adds one rule to all this: each wave's energy comes in lumps of ħω, and one lump is one particle.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke={C.axis} strokeDasharray="2 3" />
          {/* neighbour springs, then the oscillators */}
          {!cut && <path d={Array.from({ length: N }, (_, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Yf(s.phi[i]).toFixed(1)}`).join("")} fill="none" stroke={C.sky} strokeWidth={1.2} opacity={0.7} />}
          {Array.from({ length: N }, (_, i) => (
            <g key={i}>
              <line x1={X(i)} y1={BASE} x2={X(i)} y2={Yf(s.phi[i])} stroke={C.muted} strokeWidth={0.6} opacity={0.5} />
              <circle cx={X(i)} cy={Yf(s.phi[i])} r={2.2} fill={C.sky} />
            </g>
          ))}
          <T x={X0} y={16} size={8}>{tx(t, "figPhField_row", "the field φ at 120 points of space")}</T>
          <path d={`${energy}L${X1},152L${X0},152Z`} fill={C.amber} opacity={0.35} />
          <T x={X0} y={164} size={7.5} color={C.amber}>{tx(t, "figPhField_energy", "energy along the row")}</T>
          {s.track.length > 0 && <line x1={X(((s.track[s.track.length - 1][1] % N) + N) % N)} y1={120} x2={X(((s.track[s.track.length - 1][1] % N) + N) % N)} y2={154} stroke={C.amber} strokeWidth={1.5} />}

          {/* dispersion */}
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          <line x1={kx(0)} y1={wy(0)} x2={kx(WMAX)} y2={wy(WMAX)} stroke={C.muted} strokeDasharray="4 3" />
          <path d={disp} fill="none" stroke={C.green} strokeWidth={1.8} />
          <line x1={ta[0]} y1={ta[1]} x2={tb[0]} y2={tb[1]} stroke={C.amber} strokeWidth={1.4} />
          <circle cx={kx(k0)} cy={wy(w0)} r={4} fill={C.amber} />
          <T x={PX0 - 6} y={PY0 + 4} anchor="end" size={8}>{"ω (E)"}</T>
          <T x={PX1} y={PY1 + 12} anchor="end" size={8}>{"k (p)"}</T>
          <T x={kx(WMAX) + 4} y={wy(WMAX) + 10} size={7.5}>{tx(t, "figPhField_light", "light: ω = k")}</T>
          <T x={320} y={PY0 + 6} size={8} color={C.green}>{"ω² = m² + 4 sin²(k/2)"}</T>
          <T x={320} y={PY0 + 22} size={8}>{tx(t, "figPhField_long", "long waves: E² = m² + p²")}</T>
          <T x={320} y={PY0 + 38} size={8} color={C.amber}>{tx(t, "figPhField_slope", "slope at k₀ = the particle's speed")}</T>
          <T x={320} y={PY0 + 54} size={8}>{tx(t, "figPhField_quantum", "one quantum of this wave: E = ħω₀")}</T>
          {cut && <T x={320} y={PY0 + 74} size={8} color={C.red}>{tx(t, "figPhField_flat", "no neighbour springs: ω = m for every k, speed 0")}</T>}
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={() => restart()}
          readout={`t = ${f2(s.tm, 0)}`} />
      </div>
    </Figure>
  );
}

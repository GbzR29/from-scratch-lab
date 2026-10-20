"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A wave packet built by adding 61 plane waves e^(i(kx − ωt)) whose amplitudes
// follow a bell curve of width Δk around k₀ (top panel: the recipe, in
// wavenumbers). Bottom: the sum, Re ψ (thin) and its envelope |ψ| (thick).
// Units with ħ = m = 1, so a wave e^(ikx) has momentum p = k, and a free
// particle has ω = k²/2. Δx and Δk are the standard deviations of |ψ|² and of
// the amplitudes squared, computed from the samples: at t = 0 their product is
// ½, the smallest the uncertainty principle allows. Playing moves the packet
// at the group velocity k₀ and spreads it: different k travel at different
// speeds, so Δx grows while Δk stays fixed, and the product grows above ½.

const W = 560, HK = 92, HX = 168, GAP = 26;
const NW = 121, X0 = -24, X1 = 24, NX = 480, START = -12;    // 121 waves: the packet's copies (period 2π/δk) stay off screen
const KS = 6;                                                 // the recipe panel shows k₀ ± 6
const kx = (k: number, k0: number) => 40 + ((k - k0 + KS) / (2 * KS)) * (W - 60);
const xx = (x: number) => 40 + ((x - X0) / (X1 - X0)) * (W - 60);

/** SVG path through NX samples spread over the x window. */
function samplesPath(v: Float32Array, Y: (v: number) => number) {
  let d = "";
  for (let i = 0; i < NX; i++) d += `${i ? "L" : "M"}${xx(X0 + ((X1 - X0) * i) / (NX - 1)).toFixed(1)},${Y(v[i]).toFixed(1)}`;
  return d;
}

export function WavePacketFigure({ t }: { t?: TrackTranslations }) {
  const [k0, setK0] = useState(3);
  const [dk, setDk] = useState(0.5);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vis = useVisible<HTMLDivElement>();

  useFrame(playing && vis.on, dt => setTime(v => {
    const nv = v + dt * 1.2;
    return START + k0 * nv > X1 + 6 ? 0 : nv;
  }));

  const waves = useMemo(() => Array.from({ length: NW }, (_, j) => {
    const k = k0 + ((j - (NW - 1) / 2) / ((NW - 1) / 2)) * 4 * dk;
    return { k, a: Math.exp(-((k - k0) ** 2) / (4 * dk * dk)) };   // |a|² has standard deviation Δk
  }), [k0, dk]);

  const { re, mod, sx, mean } = useMemo(() => {
    const re = new Float32Array(NX), mod = new Float32Array(NX);
    let s0 = 0, s1 = 0, s2 = 0;
    for (let i = 0; i < NX; i++) {
      const x = X0 + ((X1 - X0) * i) / (NX - 1);
      let a = 0, b = 0;
      for (const w of waves) {
        const ph = w.k * (x - START) - 0.5 * w.k * w.k * time;
        a += w.a * Math.cos(ph); b += w.a * Math.sin(ph);
      }
      re[i] = a; mod[i] = Math.hypot(a, b);
      const p = a * a + b * b;
      s0 += p; s1 += p * x; s2 += p * x * x;
    }
    const mean = s1 / s0;
    return { re, mod, sx: Math.sqrt(Math.max(0, s2 / s0 - mean * mean)), mean };
  }, [waves, time]);

  const sk = useMemo(() => {
    let s0 = 0, s1 = 0, s2 = 0;
    for (const w of waves) { const p = w.a * w.a; s0 += p; s1 += p * w.k; s2 += p * w.k * w.k; }
    return Math.sqrt(s2 / s0 - (s1 / s0) ** 2);
  }, [waves]);

  const amp = useMemo(() => waves.reduce((s, w) => s + w.a, 0), [waves]);
  const yx = HK + GAP + HX / 2;
  const Yx = (v: number) => yx - (v / amp) * (HX / 2 - 10);
  const dRe = samplesPath(re, Yx), dMod = samplesPath(mod, Yx);
  const inside = mean - 2.5 * sx > X0 && mean + 2.5 * sx < X1;

  return (
    <Figure title={tx(t, "figPhPack_title", "Building a wave packet out of pure waves")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhPack_k0", "central k₀ (momentum)")} value={k0} min={1} max={5} step={0.1} onChange={v => { setK0(v); setTime(0); }} fmt={v => f2(v, 1)} width="w-32" />
          <Slider label={tx(t, "figPhPack_dk", "spread of k, Δk")} value={dk} min={0.08} max={1.5} step={0.01} onChange={v => { setDk(v); setTime(0); }} fmt={v => f2(v, 2)} width="w-32" />
        </Sliders>
        <Row>
          <Readout color={C.amber}>{`Δk = ${f2(sk, 2)}`}</Readout>
          <Readout color={C.sky}>{inside ? `Δx = ${f2(sx, 2)}` : tx(t, "figPhPack_out", "Δx: packet wider than the window")}</Readout>
          {inside && <Readout color={Math.abs(sx * sk - 0.5) < 0.01 ? C.green : C.fg}>{`Δx · Δk = ${f2(sx * sk, 3)} ≥ 0.5`}</Readout>}
          <Readout>{`λ = 2π/k₀ = ${f2((2 * Math.PI) / k0, 2)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhPack_note", "A single wave with one exact wavelength, so one exact momentum, goes on for ever: it is everywhere at once. To make something that sits in one place, add many waves with slightly different wavelengths. They agree in the middle and cancel everywhere else. The top panel is the recipe: how much of each wavenumber k goes in. Narrow the spread Δk and the packet below gets wider; widen it and the packet gets narrower. The product Δx · Δk never goes below one half, and a bell-shaped recipe like this one reaches exactly one half. Since momentum is p = ħk, this is Heisenberg's uncertainty principle, Δx · Δp ≥ ħ/2: it is not a flaw of measuring instruments but a property of waves. Press play: the packet moves at speed k₀, and it spreads, because each of its waves travels at its own speed. Δk stays the same, Δx grows, and the product climbs above one half.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${HK + GAP + HX}`} className="w-full h-auto">
          <T x={40} y={12} size={8}>{tx(t, "figPhPack_recipe", "the recipe: amplitude of each wave, by wavenumber k")}</T>
          <line x1={40} y1={HK - 6} x2={W - 20} y2={HK - 6} stroke={C.axis} />
          {waves.filter((_, j) => j % 2 === 0).map((w, j) => <line key={j} x1={kx(w.k, k0)} x2={kx(w.k, k0)} y1={HK - 6} y2={HK - 6 - w.a * (HK - 28)} stroke={C.amber} strokeWidth={1.6} opacity={0.85} />)}
          <line x1={kx(k0 - sk, k0)} x2={kx(k0 + sk, k0)} y1={HK - 14} y2={HK - 14} stroke={C.fg} strokeWidth={1.2} />
          <T x={kx(k0 + sk, k0) + 4} y={HK - 11} size={8} color={C.fg}>{"±Δk"}</T>
          <T x={kx(k0, k0)} y={HK + 6} anchor="middle" size={8}>{`k₀ = ${f2(k0, 1)}`}</T>
          <T x={kx(k0 - KS, k0)} y={HK + 6} size={8}>{f2(k0 - KS, 1)}</T>
          <T x={kx(k0 + KS, k0)} y={HK + 6} anchor="end" size={8}>{f2(k0 + KS, 1)}</T>

          <line x1={40} y1={yx} x2={W - 20} y2={yx} stroke={C.axis} />
          <path d={dRe} fill="none" stroke={C.sky} strokeWidth={1} opacity={0.7} />
          <path d={dMod} fill="none" stroke={C.sky} strokeWidth={2.2} />
          {inside && <>
            <line x1={xx(mean - sx)} x2={xx(mean + sx)} y1={yx + HX / 2 - 6} y2={yx + HX / 2 - 6} stroke={C.fg} strokeWidth={1.2} />
            <T x={xx(mean + sx) + 4} y={yx + HX / 2 - 3} size={8} color={C.fg}>±Δx</T>
          </>}
          <T x={40} y={HK + GAP + 6} size={8}>{tx(t, "figPhPack_sum", "the sum: Re ψ (thin) and |ψ| (thick), along x")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={() => setTime(0)}
          readout={`t = ${f2(time, 1)}`} />
      </div>
    </Figure>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Readout, Row, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Two particles in the same box (width L, walls at 0 and L), one in level a
// and one in level b, φₙ(x) = √(2/L) sin(nπx/L). Each map shows the joint
// chance |ψ(x₁, x₂)|²: x₁ across, x₂ up, bright = likely. The dashed diagonal
// is x₁ = x₂, both particles at the same place.
//   distinguishable:  ψ = φa(x₁) φb(x₂)
//   bosons:           ψ = [φa(x₁)φb(x₂) + φb(x₁)φa(x₂)] / √2
//   fermions:         ψ = [φa(x₁)φb(x₂) − φb(x₁)φa(x₂)] / √2
// Swapping the particles leaves |ψ|² of bosons and fermions unchanged (the
// maps are mirror-symmetric about the diagonal). Fermions vanish on the
// diagonal: they are never found together. Bosons pile up there. With a = b
// the fermion state is zero everywhere: there is no such state (Pauli).
// All three maps share one brightness scale. Readouts: the chance of finding
// the two within L/10 of each other, and their mean distance.

const W = 560, H = 250, N = 120, MAP = 150;
const MX = [24, 204, 384], MY = 44;
const phi = (n: number, x: number) => Math.SQRT2 * Math.sin(n * Math.PI * x);
type Kind = 0 | 1 | 2;

function density(a: number, b: number, kind: Kind) {
  const d = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x1 = (i + 0.5) / N, x2 = (j + 0.5) / N;
    const ab = phi(a, x1) * phi(b, x2), ba = phi(b, x1) * phi(a, x2);
    let psi: number;
    if (kind === 0) psi = ab;
    else if (a === b) psi = kind === 1 ? ab : 0;
    else psi = (kind === 1 ? ab + ba : ab - ba) * Math.SQRT1_2;
    d[j * N + i] = psi * psi;
  }
  return d;
}

function stats(d: Float32Array) {
  let all = 0, close = 0, dist = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const p = d[j * N + i], gap = Math.abs(i - j) / N;
    all += p; dist += p * gap; if (gap < 0.1) close += p;
  }
  return all > 1e-9 ? { close: close / all, dist: dist / all } : null;
}

export function ExchangeFigure({ t }: { t?: TrackTranslations }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const canvases = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  const maps = useMemo(() => ([0, 1, 2] as Kind[]).map(k => density(a, b, k)), [a, b]);
  const top = useMemo(() => Math.max(...maps.map(m => m.reduce((x, y) => Math.max(x, y), 0))), [maps]);

  useEffect(() => {
    maps.forEach((m, k) => {
      const ctx = canvases[k].current?.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(N, N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const v = Math.sqrt(m[j * N + i] / top), o = ((N - 1 - j) * N + i) * 4;   // x₂ up
        img.data[o] = Math.min(255, 12 + 330 * v);
        img.data[o + 1] = Math.min(255, 10 + 260 * Math.max(0, v - 0.25));
        img.data[o + 2] = Math.min(255, 20 + 120 * Math.max(0, v - 0.6) + 30 * (1 - v));
        img.data[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    });
    // canvases are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maps, top]);

  const st = maps.map(stats);
  const names = [tx(t, "figPhEx_dist", "distinguishable"), tx(t, "figPhEx_boson", "bosons (+)"), tx(t, "figPhEx_fermion", "fermions (−)")];
  const cols = [C.fg, C.green, C.pink];
  const levels = [1, 2, 3].map(n => [String(n), String(n)] as const);

  return (
    <Figure title={tx(t, "figPhEx_title", "Two identical particles in a box: bosons bunch, fermions avoid")}
      controls={<>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figPhEx_a", "level a")}</span>
          <Choice value={String(a)} onChange={v => setA(Number(v))} options={levels} />
          <span className="text-[10px] font-mono text-[var(--text-muted)] ml-3">{tx(t, "figPhEx_b", "level b")}</span>
          <Choice value={String(b)} onChange={v => setB(Number(v))} options={levels} />
        </Row>
        <Row>
          {st.map((s, k) => (
            <Readout key={k} color={cols[k]}>{s
              ? `${names[k]}: ${tx(t, "figPhEx_close", "within L/10")} ${f2(s.close * 100, 0)}%, ${tx(t, "figPhEx_mean", "mean gap")} ${f2(s.dist, 2)} L`
              : `${names[k]}: ${tx(t, "figPhEx_none", "no such state")}`}</Readout>
          ))}
        </Row>
      </>}
      note={tx(t, "figPhEx_note", "Put two particles in a box, one in level a and one in level b. If they could be told apart, the joint chance would be a plain product, the left map. But two electrons, or two photons, are exactly alike: swapping them must give the same |ψ|², so ψ can only stay the same (bosons) or flip sign (fermions). That one sign changes everything. On the diagonal x₁ = x₂ the two terms of the fermion wave cancel: two fermions are never found at the same place, and they keep further apart than independent particles would. For bosons the terms add: they are found together more often. Now set a = b. The boson state is fine, both particles in the same level. The fermion state is zero everywhere: it does not exist. That is the Pauli exclusion principle: two identical fermions can never share a state. Electrons, protons and neutrons are fermions; photons and helium-4 atoms are bosons.")}>
      <div className="relative">
        {canvases.map((ref, k) => (
          <canvas key={k} ref={ref} width={N} height={N} className="absolute"
            style={{ left: `${(MX[k] / W) * 100}%`, top: `${(MY / H) * 100}%`, width: `${(MAP / W) * 100}%`, height: `${(MAP / H) * 100}%`, imageRendering: "auto", borderRadius: 4 }} />
        ))}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto relative" pointerEvents="none">
          {MX.map((x, k) => (
            <g key={k}>
              <T x={x + MAP / 2} y={MY - 12} anchor="middle" size={9.5} color={cols[k]} bold>{names[k]}</T>
              <rect x={x} y={MY} width={MAP} height={MAP} fill="none" stroke={C.axis} />
              <line x1={x} y1={MY + MAP} x2={x + MAP} y2={MY} stroke="#e5e7eb" strokeDasharray="3 4" opacity={0.55} />
              <T x={x + MAP / 2} y={MY + MAP + 14} anchor="middle" size={8}>{tx(t, "figPhEx_x1", "x₁ (particle 1) →")}</T>
              <T x={x - 4} y={MY + 4} anchor="end" size={8}>L</T>
              <T x={x - 4} y={MY + MAP} anchor="end" size={8}>0</T>
              {!st[k] && <T x={x + MAP / 2} y={MY + MAP / 2 + 3} anchor="middle" size={9} color={C.pink} bold>{tx(t, "figPhEx_zero", "ψ = 0 everywhere")}</T>}
            </g>
          ))}
          <T x={MX[0]} y={H - 14} size={8}>{tx(t, "figPhEx_axes", "x₂ (particle 2) up · dashed line: both at the same place")}</T>
        </svg>
      </div>
    </Figure>
  );
}

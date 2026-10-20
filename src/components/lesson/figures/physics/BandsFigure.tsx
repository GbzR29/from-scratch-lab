"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// An electron in a row of N identical wells (each 0.6 nm wide, 4 eV deep,
// separated by barriers of width b): a one-dimensional crystal. The
// Schrödinger equation −(ħ²/2m)ψ″ + Vψ = Eψ is solved on a grid of 0.01 nm
// steps: the bound energies come from bisection with a Sturm count on the
// tridiagonal matrix (exact for the grid), the chosen wave from inverse
// iteration. ħ²/2m = 0.0381 eV·nm² for an electron.
// One well has two bound levels. N wells give N levels near each of them:
// the electron can tunnel from well to well, and each single-well level
// splits into N. As N grows the levels fill a band; the shaded strips are the
// bands of an endless row (the Kronig–Penney condition
//   |cos αa cosh κb + (κ² − α²)/(2ακ) sin αa sinh κb| ≤ 1,
//   α = √(E/c), κ = √((V₀ − E)/c), c = ħ²/2m).
// Thinner barriers mean more tunnelling, wider bands and smaller gaps.

const W = 560, H = 270;
const A = 0.6, V0 = 4, CC = 0.0381, DX = 0.01, MARGIN = 1.0;
const EY = (e: number) => 236 - (e / (V0 + 0.6)) * 206;

function lattice(n: number, b: number) {
  const len = 2 * MARGIN + n * A + (n - 1) * b, M = Math.round(len / DX);
  const V = new Float64Array(M);
  for (let i = 0; i < M; i++) {
    const x = (i + 0.5) * DX - MARGIN;
    const cell = A + b, k = Math.floor(x / cell), inWell = x >= 0 && k < n && x - k * cell < A;
    V[i] = inWell ? 0 : V0;
  }
  return { V, M, len };
}

/** Number of eigenvalues below e (Sturm sequence of the tridiagonal matrix). */
function countBelow(V: Float64Array, e: number) {
  const off = CC / (DX * DX), diag = 2 * off;
  let d = 1, count = 0;
  for (let i = 0; i < V.length; i++) {
    d = diag + V[i] - e - (i ? (off * off) / d : 0);
    if (d === 0) d = 1e-12;
    if (d < 0) count++;
  }
  return count;
}

function levels(V: Float64Array) {
  const total = countBelow(V, V0), out: number[] = [];
  for (let k = 0; k < total; k++) {
    let lo = 0, hi = V0;
    for (let it = 0; it < 46; it++) { const mid = (lo + hi) / 2; if (countBelow(V, mid) > k) hi = mid; else lo = mid; }
    out.push((lo + hi) / 2);
  }
  return out;
}

/** Inverse iteration: solve (H − e)x = x_old a few times (Thomas algorithm). */
function wave(V: Float64Array, e: number) {
  const M = V.length, off = -CC / (DX * DX), diag = 2 * CC / (DX * DX);
  let x = new Float64Array(M).fill(1);
  const cp = new Float64Array(M), dp = new Float64Array(M);
  for (let it = 0; it < 4; it++) {
    for (let i = 0; i < M; i++) {
      const bi = diag + V[i] - e - 1e-9, den = bi - (i ? off * cp[i - 1] : 0);
      cp[i] = off / den;
      dp[i] = (x[i] - (i ? off * dp[i - 1] : 0)) / den;
    }
    const y = new Float64Array(M);
    y[M - 1] = dp[M - 1];
    for (let i = M - 2; i >= 0; i--) y[i] = dp[i] - cp[i] * y[i + 1];
    let m = 0;
    for (let i = 0; i < M; i++) m = Math.max(m, Math.abs(y[i]));
    for (let i = 0; i < M; i++) y[i] /= m;
    x = y;
  }
  return x;
}

/** Allowed energy strips of an endless row of wells. */
function kpBands(b: number) {
  const bands: [number, number][] = [];
  let start = -1;
  for (let i = 1; i < 1200; i++) {
    const E = (i / 1200) * V0, al = Math.sqrt(E / CC), ka = Math.sqrt((V0 - E) / CC);
    const f = Math.cos(al * A) * Math.cosh(ka * b) + ((ka * ka - al * al) / (2 * al * ka)) * Math.sin(al * A) * Math.sinh(ka * b);
    const ok = Math.abs(f) <= 1;
    if (ok && start < 0) start = E;
    if (!ok && start >= 0) { bands.push([start, E]); start = -1; }
  }
  if (start >= 0) bands.push([start, V0]);
  return bands;
}

/** The potential as a stepped outline: one point at each wall. */
function potentialPath(V: Float64Array, sx: (x: number) => number) {
  let d = "";
  for (let i = 0; i < V.length; i++) {
    const wall = i === 0 || i === V.length - 1 || V[i] !== V[i - 1];
    if (wall) d += `${d ? "L" : "M"}${sx(i * DX).toFixed(1)},${EY(V[i - 1] ?? V[i]).toFixed(1)}L${sx(i * DX).toFixed(1)},${EY(V[i]).toFixed(1)}`;
  }
  return d;
}

export function BandsFigure({ t }: { t?: TrackTranslations }) {
  const [n, setN] = useState(6);
  const [b, setB] = useState(0.2);
  const [pick, setPick] = useState(1);

  const lat = useMemo(() => lattice(n, b), [n, b]);
  const lv = useMemo(() => levels(lat.V), [lat]);
  const bands = useMemo(() => kpBands(b), [b]);
  const sel = Math.min(pick, lv.length) - 1;
  const psi = useMemo(() => (sel >= 0 ? wave(lat.V, lv[sel]) : null), [lat, lv, sel]);

  // drawing of the row of wells
  const PX0 = 150, PX1 = 550, sx = (x: number) => PX0 + (x / lat.len) * (PX1 - PX0);
  const pot = potentialPath(lat.V, sx);
  let wv = "";
  if (psi) for (let i = 0; i < lat.M; i += 2) wv += `${i ? "L" : "M"}${sx(i * DX).toFixed(1)},${(EY(lv[sel]) - psi[i] * 20).toFixed(1)}`;

  const inBand = (e: number) => bands.findIndex(([lo, hi]) => e >= lo - 0.08 && e <= hi + 0.08);
  const bandCol = [C.sky, C.amber, C.green];
  const gap = bands.length >= 2 ? bands[1][0] - bands[0][1] : 0;

  return (
    <Figure title={tx(t, "figPhBands_title", "From levels to bands: N wells in a row")}
      controls={<>
        <Slider label={tx(t, "figPhBands_n", "number of wells N")} value={n} min={1} max={10} step={1} onChange={setN} fmt={v => String(v)} width="w-32" />
        <Slider label={tx(t, "figPhBands_b", "barrier width b")} value={b} min={0.08} max={0.6} step={0.01} onChange={setB} fmt={v => `${f2(v, 2)} nm`} width="w-32" />
        <Slider label={tx(t, "figPhBands_pick", "show level")} value={Math.min(pick, lv.length)} min={1} max={Math.max(1, lv.length)} step={1} onChange={setPick} fmt={v => `${v} / ${lv.length}`} width="w-32" />
        <Row>
          <Readout color={C.amber}>{`${tx(t, "figPhBands_count", "bound levels")}: ${lv.length}${lv.length === 2 * n ? ` = 2 × ${n}` : ""}`}</Readout>
          {bands[0] && <Readout color={C.sky}>{`${tx(t, "figPhBands_w1", "band 1 width")} ${f2(bands[0][1] - bands[0][0], 2)} eV`}</Readout>}
          {bands.length >= 2 && <Readout>{`${tx(t, "figPhBands_gap", "gap")} ${f2(gap, 2)} eV`}</Readout>}
          {sel >= 0 && <Readout color={bandCol[Math.max(0, inBand(lv[sel]))]}>{`E = ${f2(lv[sel], 3)} eV`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhBands_note", "Start with N = 1: a single well with two bound levels, like an atom with two orbitals. Now add a second well next to it. The electron can tunnel through the thin wall, and each level splits in two: one wave with the same sign in both wells (slightly lower) and one with opposite signs (slightly higher). With N wells, every level splits into N, always packed inside the same strip, the shaded band of an endless row. A real crystal has some 10²³ atoms, so the levels are so close that the band is effectively continuous, and between the bands are gaps with no states at all. Pick a level and look at its wave: the lowest in a band has no sign changes between wells, the highest flips at every wall. Thin the barriers and the bands widen, because tunnelling is easier; thicken them and the bands shrink back to the single-atom levels. Electrons fill these bands from the bottom up, two per level (Pauli), and whether the top band is full or half-full decides whether the solid conducts.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* levels and the bands of an endless row */}
        {bands.map(([lo, hi], k) => (
          <rect key={k} x={24} y={EY(hi)} width={92} height={Math.max(1.5, EY(lo) - EY(hi))} fill={bandCol[k % 3]} opacity={0.16} />
        ))}
        {lv.map((e, k) => (
          <line key={k} x1={30} y1={EY(e)} x2={110} y2={EY(e)} stroke={bandCol[Math.max(0, inBand(e)) % 3]} strokeWidth={k === sel ? 2.8 : 1.2}
            onClick={() => setPick(k + 1)} style={{ cursor: "pointer" }} />
        ))}
        <line x1={24} y1={EY(V0)} x2={116} y2={EY(V0)} stroke={C.muted} strokeDasharray="3 3" />
        <T x={70} y={EY(V0) - 6} anchor="middle" size={7.5}>{tx(t, "figPhBands_free", "free above here")}</T>
        <T x={20} y={18} size={8}>{tx(t, "figPhBands_lv", "energy levels")}</T>
        {[0, 1, 2, 3, 4].map(e => <T key={e} x={18} y={EY(e) + 3} anchor="end" size={7.5}>{e}</T>)}
        <T x={18} y={EY(V0 + 0.5)} anchor="end" size={7.5}>eV</T>

        {/* the wells and one wave */}
        <path d={pot} fill="none" stroke={C.fg} strokeWidth={1.6} />
        {sel >= 0 && <line x1={PX0} y1={EY(lv[sel])} x2={PX1} y2={EY(lv[sel])} stroke={C.axis} strokeDasharray="2 3" />}
        <path d={wv} fill="none" stroke={bandCol[Math.max(0, inBand(lv[Math.max(0, sel)])) % 3]} strokeWidth={1.8} />
        <T x={PX0} y={18} size={8}>{tx(t, "figPhBands_wave", "the wells (4 eV deep, 0.6 nm wide) and the chosen wave ψ")}</T>
        <T x={PX1} y={H - 8} anchor="end" size={8}>{`${tx(t, "figPhBands_len", "length")} ${f2(lat.len, 1)} nm`}</T>
      </svg>
    </Figure>
  );
}

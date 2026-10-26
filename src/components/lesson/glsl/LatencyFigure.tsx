"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Slider, Sliders, T, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// One warp scheduler, cycle by cycle. Every warp runs the same shader: K
// arithmetic instructions, then a texture read that takes L cycles to come
// back, over and over. Each cycle the scheduler issues one instruction from
// any warp that is not waiting. How many warps it has to choose from depends
// on the registers each lane needs: the scheduler's register file (16,384
// 32-bit registers, a quarter of an NVIDIA SM's 65,536) is shared by all of
// them, and the hardware keeps at most 12 per scheduler (48 per SM on the
// RTX 40 series). A simplified model: real GPUs add caches, dual issue and
// instructions of different lengths, but the shape of the curve is the same.

const REG_FILE = 16384, MAX_WARPS = 12, LANES = 32, CYCLES = 640;
const W = 520, ROW = 13, X0 = 54, Y0 = 6;

/** Resident warps: registers per lane are allocated in steps of 8. */
export const residentWarps = (regs: number) => Math.max(1, Math.min(MAX_WARPS, Math.floor(REG_FILE / (LANES * Math.ceil(regs / 8) * 8))));

type Run = { w: number; a: number; b: number; kind: "issue" | "wait" };

function simulate(n: number, k: number, lat: number) {
  const left = Array(n).fill(k), readyAt = Array(n).fill(0);
  const runs: Run[] = [], busy: boolean[] = [];
  const open: (Run | null)[] = Array(n).fill(null);
  let next = 0, issued = 0;
  const mark = (w: number, c: number, kind: Run["kind"]) => {
    const r = open[w];
    if (r && r.kind === kind && r.b === c) r.b = c + 1;
    else { const nr = { w, a: c, b: c + 1, kind }; runs.push(nr); open[w] = nr; }
  };
  for (let c = 0; c < CYCLES; c++) {
    let pick = -1;
    for (let s = 0; s < n; s++) { const w = (next + s) % n; if (readyAt[w] <= c) { pick = w; break; } }
    if (pick >= 0) {
      mark(pick, c, "issue"); issued++;
      if (--left[pick] === 0) { left[pick] = k; readyAt[pick] = c + 1 + lat; next = (pick + 1) % n; }
      else next = pick;                       // keep issuing the same warp until it stalls
    }
    busy.push(pick >= 0);
    for (let w = 0; w < n; w++) if (readyAt[w] > c && w !== pick) mark(w, c, "wait");
  }
  return { runs, busy, util: issued / CYCLES };
}

export function LatencyFigure({ t }: { t?: TrackTranslations }) {
  const [regs, setRegs] = useState(64);
  const [k, setK] = useState(8);
  const [lat, setLat] = useState(200);

  const n = residentWarps(regs);
  const sim = useMemo(() => simulate(n, k, lat), [n, k, lat]);
  const model = Math.min(1, (n * k) / (k + lat));
  const need = Math.ceil((k + lat) / k);
  const sx = (c: number) => X0 + (c / CYCLES) * (W - X0 - 6);
  const H = Y0 + (MAX_WARPS + 1) * ROW + 34;

  // ALU row: merge busy cycles into runs
  const aluRuns: [number, number][] = [];
  sim.busy.forEach((b, c) => { if (!b) return; const last = aluRuns[aluRuns.length - 1]; if (last && last[1] === c) last[1] = c + 1; else aluRuns.push([c, c + 1]); });

  return (
    <Figure title={tx(t, "figLat_title", "Hiding a texture read behind other warps")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figLat_regs", "registers / lane")} value={regs} min={16} max={255} step={1} onChange={setRegs} fmt={v => `${v}`} width="w-36" />
          <Slider label={tx(t, "figLat_k", "maths between reads")} value={k} min={1} max={40} step={1} onChange={setK} fmt={v => `${v}`} width="w-36" />
          <Slider label={tx(t, "figLat_lat", "read latency (cycles)")} value={lat} min={20} max={600} step={10} onChange={setLat} fmt={v => `${v}`} width="w-36" />
        </Sliders>
        <Row>
          <Readout>{`${tx(t, "figLat_resident", "warps resident")} = min(12, ⌊16384 / (32 · ${Math.ceil(regs / 8) * 8})⌋) = ${n}`}</Readout>
          <Readout>{`${tx(t, "figLat_needed", "warps needed to hide it")} ≈ ⌈(K + L) / K⌉ = ${need}`}</Readout>
        </Row>
        <Row>
          <Readout>{`${tx(t, "figLat_model", "formula")}: min(1, N·K / (K + L)) = ${Math.round(model * 100)}%`}</Readout>
          <Readout color={sim.util > 0.9 ? C.green : sim.util > 0.5 ? C.amber : C.red}>{`${tx(t, "figLat_busy", "ALU busy in this run")}: ${Math.round(sim.util * 100)}%`}</Readout>
        </Row>
      </>}
      note={tx(t, "figLat_note", "Each row is a warp: bright = issuing an instruction, grey = waiting for its texture read. The bottom row is the arithmetic unit; every gap in it is time thrown away. Start at 64 registers: 8 warps, and the unit is mostly idle while they all wait. Lower the latency, or put more maths between reads, and the gaps close. Then raise the registers to 128: only 4 warps fit, and no amount of maths per read keeps the unit busy at a 600-cycle latency.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
        {Array.from({ length: MAX_WARPS }, (_, w) => (
          <g key={w} opacity={w < n ? 1 : 0.35}>
            <T x={X0 - 6} y={Y0 + w * ROW + 9.5} size={8.5} anchor="end">{w < n ? `warp ${w}` : "—"}</T>
            <rect x={sx(0)} y={Y0 + w * ROW + 1} width={sx(CYCLES) - sx(0)} height={ROW - 3} fill="none" stroke="var(--code-line)" strokeWidth={0.5} />
          </g>
        ))}
        {sim.runs.map((r, i) => (
          <rect key={i} x={sx(r.a)} y={Y0 + r.w * ROW + 1} width={Math.max(0.6, sx(r.b) - sx(r.a))} height={ROW - 3}
            fill={r.kind === "issue" ? "var(--primary)" : "var(--text-muted)"} opacity={r.kind === "issue" ? 0.95 : 0.22} />
        ))}
        <T x={X0 - 6} y={Y0 + MAX_WARPS * ROW + 12} size={8.5} anchor="end" color={C.fg} bold>ALU</T>
        <rect x={sx(0)} y={Y0 + MAX_WARPS * ROW + 3} width={sx(CYCLES) - sx(0)} height={ROW - 1} fill={C.red} opacity={0.18} />
        {aluRuns.map(([a, b], i) => <rect key={i} x={sx(a)} y={Y0 + MAX_WARPS * ROW + 3} width={Math.max(0.6, sx(b) - sx(a))} height={ROW - 1} fill={C.green} opacity={0.85} />)}
        {[0, 160, 320, 480, 640].map(c => (
          <g key={c}>
            <line x1={sx(c)} x2={sx(c)} y1={Y0 + (MAX_WARPS + 1) * ROW + 3} y2={Y0 + (MAX_WARPS + 1) * ROW + 7} stroke="var(--code-gutter)" />
            <T x={sx(c)} y={Y0 + (MAX_WARPS + 1) * ROW + 17} size={8} anchor="middle">{`${c}`}</T>
          </g>
        ))}
        <T x={(sx(0) + sx(CYCLES)) / 2} y={Y0 + (MAX_WARPS + 1) * ROW + 29} size={8} anchor="middle">{tx(t, "figLat_cycles", "cycles")}</T>
      </svg>
    </Figure>
  );
}

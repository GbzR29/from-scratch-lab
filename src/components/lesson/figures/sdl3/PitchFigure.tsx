"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Slider, Row, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The memory SDL_LockTexture hands out for a W × 6 streaming texture of 4-byte
// pixels. Each row is `pitch` bytes long: W × 4 rounded up to the alignment the
// driver wants, so the end of a row may be padding. The CPU loop writes a small
// picture, indexing rows with y × pitch (right) or y × W × 4 (the bug); the GPU
// always reads row y at y × pitch. Left: the memory, one cell per 4 bytes,
// padding hatched (a red frame = picture data written into padding). Right: the
// texture the GPU shows. With the wrong index every row starts earlier than
// the GPU expects, and the picture shears.

const H = 6;
const CELL = 15;

/** The picture the CPU writes: a diagonal bar over a horizontal gradient. */
function picture(x: number, y: number, w: number): string {
  if (x === y || x === y + 1) return "#f8fafc";
  const k = w > 1 ? x / (w - 1) : 0;
  const r = Math.round(59 + (249 - 59) * k), g = Math.round(130 + (115 - 130) * k), b = Math.round(246 + (22 - 246) * k);
  return `rgb(${r},${g},${b})`;
}

export function PitchFigure({ t }: { t?: TrackTranslations }) {
  const [w, setW] = useState(7);
  const [align, setAlign] = useState("16");
  const [index, setIndex] = useState<"pitch" | "tight">("pitch");

  const A = Number(align);
  const tight = w * 4;
  const pitch = Math.ceil(tight / A) * A;
  const slots = pitch / 4;                 // cells per memory row
  const rowStride = index === "pitch" ? slots : w;   // where the CPU starts row y, in cells

  // Memory: what the CPU wrote into each cell (null = untouched)
  const mem: (string | null)[] = Array(slots * H).fill(null);
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    const s = y * rowStride + x;
    if (s < mem.length) mem[s] = picture(x, y, w);
  }
  const shown = (x: number, y: number) => mem[y * slots + x];

  const memW = slots * CELL, texW = w * CELL, gap = 48;
  const vbW = Math.max(memW + gap + Math.max(texW, 160) + 8, 420);   // room for the GPU label
  const vbH = H * CELL + 34;
  const ok = index === "pitch" || pitch === tight;

  return (
    <Figure
      title={tx(t, "figSdlPitch_title", "Pitch: the row length the driver chose")}
      controls={
        <div className="space-y-3">
          <Slider label={tx(t, "figSdlPitch_w", "width W")} value={w} min={4} max={12} step={1} onChange={setW} fmt={(v) => `${v} px`} />
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-24">{tx(t, "figSdlPitch_align", "row alignment")}</span>
            <Choice value={align} options={[["4", "4 B"], ["16", "16 B"], ["64", "64 B"]] as const} onChange={setAlign} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-24">{tx(t, "figSdlPitch_index", "row start")}</span>
            <Choice value={index} options={[["pitch", "y * pitch"], ["tight", "y * W * 4"]] as const} onChange={setIndex} />
          </Row>
          <p className="font-mono text-[11.5px] leading-relaxed text-[var(--text-main)]">
            W × 4 = {tight} B · pitch = ⌈{tight} / {A}⌉ × {A} = <span style={{ color: C.sky }}>{pitch} B</span> · {tx(t, "figSdlPitch_pad", "padding")} {pitch - tight} B {tx(t, "figSdlPitch_perRow", "per row")}
          </p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: ok ? C.green : C.red }}>
            {ok
              ? (index === "pitch"
                ? tx(t, "figSdlPitch_ok", "Every row starts where the GPU reads it. The padding is skipped and never shown.")
                : tx(t, "figSdlPitch_lucky", "Correct by luck: at this width the rows need no padding, so W × 4 equals the pitch. Change the width or the alignment and the bug appears; on the developer's GPU it may never show."))
              : tx(t, "figSdlPitch_bad", "Each row is written too early: row y starts y × padding bytes before where the GPU reads it. The picture shears to the left, pixels of the next row show up at the end of each row, and the bottom of the texture shows whatever was in memory, because the loop stopped writing too early.")}
          </p>
        </div>
      }
      note={tx(t, "figSdlPitch_note", "Left: the locked memory, one cell per 4-byte pixel, each memory row pitch bytes long. Hatched cells are padding. Right: the texture as the GPU reads it, row y taken from byte y × pitch. The CPU writes a white diagonal over a blue-to-orange gradient. Switch the row start to y * W * 4 and move the width.")}
    >
      <div className="p-3 md:p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW * 1.5, minWidth: 380 }} role="img"
          aria-label={tx(t, "figSdlPitch_aria", "locked texture memory and the texture the GPU shows")}>
          <defs>
            <pattern id="sdl-pitch-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="var(--text-muted)" strokeOpacity="0.45" strokeWidth="1.5" />
            </pattern>
          </defs>
          <text x={0} y={12} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>
            {tx(t, "figSdlPitch_memory", "memory")} · pitch = {pitch} B
          </text>
          {Array.from({ length: H }, (_, y) => Array.from({ length: slots }, (_, s) => {
            const c = mem[y * slots + s];
            const pad = s >= w;
            return (
              <g key={`${y}-${s}`}>
                <rect x={s * CELL} y={22 + y * CELL} width={CELL - 1} height={CELL - 1}
                  fill={c ?? (pad ? "url(#sdl-pitch-hatch)" : "#1f2330")} stroke={pad ? "var(--border)" : "none"} />
                {c && pad && <rect x={s * CELL + 0.5} y={22 + y * CELL + 0.5} width={CELL - 2} height={CELL - 2} fill="none" stroke={C.red} strokeWidth={1} />}
              </g>
            );
          }))}
          <line x1={w * CELL - 0.5} y1={18} x2={w * CELL - 0.5} y2={22 + H * CELL + 2} stroke={C.sky} strokeDasharray="3 2" />

          <g transform={`translate(${memW + gap} 0)`}>
            <text x={0} y={12} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>
              {tx(t, "figSdlPitch_gpu", "what the GPU shows")} · {w} × {H}
            </text>
            {Array.from({ length: H }, (_, y) => Array.from({ length: w }, (_, x) => (
              <rect key={`${y}-${x}`} x={x * CELL} y={22 + y * CELL} width={CELL - 1} height={CELL - 1} fill={shown(x, y) ?? "#1f2330"} />
            )))}
          </g>
          <text x={memW + gap / 2} y={22 + (H * CELL) / 2 + 4} textAnchor="middle" style={{ fontSize: 14, fill: C.muted }}>→</text>
        </svg>
      </div>
    </Figure>
  );
}

"use client";

// ── The periodic table, drawn ─────────────────────────────────────────────────
// An SVG <g> with one cell per element in the usual layout: 18 groups, 7
// periods, and the f-block (lanthanides, actinides) as two rows under the
// table. Each widget decides what a cell shows: its fill, an optional small
// value under the symbol, and which cell is picked. Reused by every Chemistry
// widget that needs the table (the trends figure first).

import type { ReactNode } from "react";
import { ELEMENTS, type Element } from "./elements";

export const CW = 30, CH = 32;           // cell size in viewBox units
const F_GAP = 10;                        // space between the main table and the f rows

/** Top-left corner of an element's cell, relative to the table's origin. */
export function cellXY(e: Element): { x: number; y: number } {
  if (e.group == null) {                                   // f-block: Ce–Lu, Th–Lr
    const first = e.period === 6 ? 58 : 90;
    return { x: (3 + e.z - first) * CW, y: 7 * CH + F_GAP + (e.period - 6) * CH };
  }
  return { x: (e.group - 1) * CW, y: (e.period - 1) * CH };
}
export const TABLE_W = 18 * CW, TABLE_H = 9 * CH + F_GAP;

/** Black or white text, whichever reads on a fill given as #rrggbb. */
export function inkOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#111827" : "#ffffff";
}

export function PeriodicTable({ x0, y0, fill, value, sel, onPick, dim }: {
  x0: number; y0: number;
  /** A #rrggbb fill, or null for "no data" (drawn as an empty outline). */
  fill: (e: Element) => string | null;
  /** Optional small text under the symbol. */
  value?: (e: Element) => string | null;
  sel: number | null;
  onPick: (z: number) => void;
  /** Elements drawn faded (outside the widget's range, say). */
  dim?: (e: Element) => boolean;
}) {
  const cells: ReactNode[] = ELEMENTS.map(e => {
    const { x, y } = cellXY(e);
    const f = fill(e), faded = dim?.(e) ?? false;
    const ink = f ? inkOn(f) : "var(--text-muted)";
    const v = value?.(e);
    return (
      <g key={e.z} transform={`translate(${x0 + x},${y0 + y})`} opacity={faded ? 0.3 : 1}
        onClick={() => onPick(e.z)} onMouseEnter={() => onPick(e.z)} style={{ cursor: "pointer" }}>
        <rect x={1} y={1} width={CW - 2} height={CH - 2} rx={3}
          fill={f ?? "transparent"} stroke={f ? "none" : "var(--code-gutter)"} strokeDasharray={f ? undefined : "2 2"} />
        <text x={3.5} y={8.5} fontSize={6} fill={ink} opacity={0.85}>{e.z}</text>
        <text x={CW / 2} y={v ? 19 : 21} fontSize={11} fontWeight={700} textAnchor="middle" fill={ink}>{e.sym}</text>
        {v && <text x={CW / 2} y={27.5} fontSize={5.6} textAnchor="middle" fill={ink} opacity={0.9}>{v}</text>}
      </g>
    );
  });
  const picked = sel ? ELEMENTS[sel - 1] : null;
  const p = picked ? cellXY(picked) : null;
  return (
    <g>
      {cells}
      {p && <rect x={x0 + p.x} y={y0 + p.y} width={CW} height={CH} rx={4} fill="none" stroke="var(--text-main)" strokeWidth={2} pointerEvents="none" />}
    </g>
  );
}

// ── Colour ramp for numeric properties (viridis, readable in both themes) ─────

const VIRIDIS = ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"];
export function ramp(u: number): string {
  const x = Math.max(0, Math.min(1, u)) * (VIRIDIS.length - 1), i = Math.min(VIRIDIS.length - 2, Math.floor(x)), f = x - i;
  const a = parseInt(VIRIDIS[i].slice(1), 16), b = parseInt(VIRIDIS[i + 1].slice(1), 16);
  const mix = (s: number) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f);
  return "#" + ((mix(16) << 16) | (mix(8) << 8) | mix(0)).toString(16).padStart(6, "0");
}
export const RAMP_STOPS = VIRIDIS;

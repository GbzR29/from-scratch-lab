"use client";

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { dec } from "./numeric";

// ── A transition matrix in decimals, with state names ─────────────────────────
// For the widgets whose chains are built from a story (memory walk, queue, AR(1)
// bands): shown when the chain is small, so a reader can check the matrix they
// wrote by hand, entry by entry. Zeros are dimmed; one row can be tinted (the
// state the simulation is in).

export function NumMatrix({ P, names, row, t, digits = 4 }: {
  P: number[][];
  names: string[];
  row?: number | null;
  t?: TrackTranslations;
  digits?: number;
}) {
  const cell = "px-1.5 py-0.5 text-center font-mono text-[10.5px] tabular-nums whitespace-nowrap";
  return (
    <div className="overflow-x-auto px-4 pb-2">
      <table className="mx-auto border-collapse">
        <thead>
          <tr>
            <th className={`${cell} text-[var(--text-muted)] font-normal`}>{tx(t, "figMk_fromTo", "from ↓ to →")}</th>
            {names.map((n, j) => <th key={j} className={`${cell} text-[var(--text-muted)] font-semibold`}>{n}</th>)}
          </tr>
        </thead>
        <tbody>
          {P.map((r, i) => (
            <tr key={i} style={{ background: i === row ? "var(--primary-low)" : undefined }}>
              <td className={`${cell} text-[var(--text-muted)] font-semibold`}>{names[i]}</td>
              {r.map((v, j) => (
                <td key={j} className={cell} style={{ color: v === 0 ? "var(--text-muted)" : "var(--text-main)", opacity: v === 0 ? 0.45 : 1 }}>
                  {v === 0 ? "0" : v === 1 ? "1" : dec(v, digits)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

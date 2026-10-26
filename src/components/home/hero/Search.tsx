"use client";

// ── Hero figure: binary search halves the list ──────────────────────────────
// A sorted list of 15 numbers. Each step looks at the middle of the part that
// is still possible, mid = ⌊(lo + hi)/2⌋, and throws away the half that cannot
// hold the target; one row per step shows what is left. 15 = 2⁴ − 1 numbers
// never need more than 4 looks (⌈log₂ 16⌉). The search replays on a loop.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, MONO, type HeroProps } from "./frame";

const LIST = [3, 7, 12, 18, 21, 26, 30, 37, 41, 45, 52, 58, 63, 70, 77];
const CELL = 26, X0 = 25, Y0 = 34, ROW = 62;
const STEP_S = 0.9, HOLD_S = 1.8;

/** The ranges looked at, in order, until `target` is found. */
function steps(target: number) {
  const out: { lo: number; hi: number; mid: number }[] = [];
  let lo = 0, hi = LIST.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    out.push({ lo, hi, mid });
    if (LIST[mid] === target) break;
    if (LIST[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return out;
}

export default function Search({ ui, onNext, figNo }: HeroProps) {
  const [at, setAt] = useState(9);
  const [clock, setClock] = useState(0);
  const figRef = useRef<HTMLElement>(null);
  const path = steps(LIST[at]);
  const total = path.length * STEP_S + HOLD_S;
  useHeroClock(figRef, dt => setClock(c => (c + dt) % total));
  const pick = (i: number) => { setAt(i); setClock(0); };

  const shown = Math.min(path.length, Math.floor(clock / STEP_S) + 1);
  const found = shown === path.length;

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext} figNo={figNo}
      caption={ui.homeFigSearchCaption ?? "binary search halves the list"}
      aria={ui.homeFigSearchAria ?? "A sorted list searched by looking at the middle and dropping half each step"}
      slider={{ label: ui.homeFigSearchSlider ?? "number searched", value: String(LIST[at]), min: 0, max: LIST.length - 1, step: 1, at, set: pick }}
      formula={<>{ui.homeFigSearchSteps ?? "looks"}: <b>{shown}</b> ≤ ⌈log₂ 16⌉ = 4</>}>
      {path.slice(0, shown).map((s, row) => {
        const y = Y0 + row * ROW;
        return (
          <g key={row}>
            <text x={X0 - 8} y={y + 18} textAnchor="end" fontFamily={MONO} fontSize="11" fill="var(--hm-draw)">{row + 1}</text>
            {LIST.map((v, i) => {
              const live = i >= s.lo && i <= s.hi;
              const mid = i === s.mid;
              const hit = mid && found && row === shown - 1;
              return (
                <g key={i} opacity={live ? 1 : 0.28}>
                  <rect x={X0 + i * CELL} y={y} width={CELL - 2} height="26"
                    fill={hit ? "var(--hm-accent)" : mid ? "color-mix(in srgb, var(--hm-accent) 22%, transparent)" : "none"}
                    stroke="currentColor" strokeWidth={mid ? 1.8 : 1} />
                  <text x={X0 + i * CELL + (CELL - 2) / 2} y={y + 17} textAnchor="middle" fontFamily={MONO} fontSize="11"
                    fill={hit ? "var(--hm-on-accent)" : "currentColor"}>{v}</text>
                </g>
              );
            })}
            {s.lo <= s.hi && (
              <path d={`M${X0 + s.lo * CELL} ${y + 34} H${X0 + (s.hi + 1) * CELL - 2}`} stroke="var(--hm-draw)" strokeWidth="1.5" />
            )}
          </g>
        );
      })}
    </HeroFrame>
  );
}

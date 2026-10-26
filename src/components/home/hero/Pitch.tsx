"use client";

// ── Hero figure: pitch is frequency ─────────────────────────────────────────
// Each semitone up multiplies the frequency by 2^(1/12), so n semitones from
// the A above middle C (A4 = 440 Hz) give f = 440 · 2^(n/12); twelve semitones
// double it (an octave). The wave on the stage is drawn with the real ratio:
// at 440 Hz three cycles fit across, so a note an octave up shows six.

import { useRef, useState } from "react";
import { HeroFrame, useHeroClock, SERIF, MONO, type HeroProps } from "./frame";

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const X0 = 24, X1 = 416, MID = 150, AMP = 82;
const CYCLES_AT_A4 = 3;

const noteName = (n: number) => {
  const midi = 69 + n;
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
};

export default function Pitch({ ui, num, onNext, figNo }: HeroProps) {
  const [n, setN] = useState(3);
  const [phase, setPhase] = useState(0);
  const figRef = useRef<HTMLElement>(null);
  const f = 440 * Math.pow(2, n / 12);
  // the drawing scrolls at one cycle per second at A4, faster for higher notes
  useHeroClock(figRef, dt => setPhase(p => (p + 2 * Math.PI * (f / 440) * dt) % (2 * Math.PI * 1000)));

  const cycles = (CYCLES_AT_A4 * f) / 440;
  const k = (2 * Math.PI * cycles) / (X1 - X0);
  const wave = Array.from({ length: Math.floor((X1 - X0) / 2) + 1 }, (_, i) => X0 + 2 * i)
    .map((x, i) => `${i ? "L" : "M"}${x} ${(MID - AMP * Math.sin(k * (x - X0) - phase)).toFixed(1)}`).join("");
  // one period, marked from the first crest after X0
  const period = (X1 - X0) / cycles;
  const crest = X0 + ((((Math.PI / 2 + phase) / k) % period) + period) % period;

  return (
    <HeroFrame figRef={figRef} ui={ui} onNext={onNext} figNo={figNo}
      caption={ui.homeFigPitchCaption ?? "pitch is frequency"}
      aria={ui.homeFigPitchAria ?? "A sound wave; each semitone up makes it a little faster, twelve semitones double it"}
      slider={{ label: ui.homeFigPitchSlider ?? "semitones from A4, n", value: (n > 0 ? "+" : "") + n, min: -12, max: 12, step: 1, at: n, set: setN }}
      formula={<><i>f</i> = 440 · 2<sup><i>n</i>/12</sup> = <b>{num(f, 1)} Hz</b></>}>
      <g fill="none" stroke="var(--hm-draw)" strokeWidth="1.2" opacity="0.75">
        <path d={`M${X0} ${MID} H${X1}`} />
        <path d={`M${X0} ${MID - AMP} H${X1} M${X0} ${MID + AMP} H${X1}`} strokeDasharray="3 5" />
      </g>
      <path d={wave} fill="none" stroke="currentColor" strokeWidth="2.2" />
      {crest + period <= X1 && (
        <g stroke="var(--hm-accent)" strokeWidth="1.6">
          <path d={`M${crest} ${MID - AMP - 6} V${MID - AMP - 22} M${crest + period} ${MID - AMP - 6} V${MID - AMP - 22}`} />
          <path d={`M${crest} ${MID - AMP - 14} H${crest + period}`} />
          <text x={crest + period / 2} y={MID - AMP - 26} textAnchor="middle" stroke="none" fill="var(--hm-accent)" fontFamily={SERIF} fontStyle="italic" fontSize="16">
            T = {num(1000 / f, 2)} ms
          </text>
        </g>
      )}
      <text x={X0} y={300} fontFamily={MONO} fontSize="12" fill="currentColor">{ui.homeFigPitchNote ?? "note"}: {noteName(n)}</text>
      <text x={X1} y={300} textAnchor="end" fontFamily={MONO} fontSize="12" fill="currentColor">A4 = 440 Hz</text>
    </HeroFrame>
  );
}

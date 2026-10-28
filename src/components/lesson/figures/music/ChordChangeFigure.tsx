"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { C, Choice, Figure, Readout, Row, Slider, T, useVisible } from "@/components/lesson/kit/figure";
import { VolumeSlider } from "@/components/lesson/kit/audio/VolumeSlider";
import { SoundButton } from "@/components/lesson/kit/audio/SoundButton";
import { InstrumentChoice, loadStatus, SampleCredit } from "@/components/lesson/kit/audio/useInstrument";
import { accentClick, usePulseLoop, type Hit } from "./usePulseLoop";
import { countOf, fingerMark, fullCount, noteOf, PATTERNS, ringSlots, ROLES, slotSec, type ChordName, type Role } from "./picking";

// ── What this figure shows ────────────────────────────────────────────────────
// Changing chords inside a picking pattern. Two bars of "p i m a" loop, one
// chord each. The reader picks the column where the fretting hand leaves the
// old chord and how long the hand needs to land on the new one. From that
// column on, the plucked strings ring open (no finger on them); if the hand
// lands after the next 1, the 1 is either played late (the player waits) or
// on time with the hand still in the air (open strings, the wrong chord).
// The lesson's rule follows: start moving k = ⌈h / τ⌉ columns before the 1.

const W = 600, X0 = 54, X1 = 590, Y_CHORD = 16, Y_COUNT = 36, Y0 = 48, LANE = 15, Y_HAND = Y0 + 5 * LANE + 22;
const H = Y_HAND + 44, N = 8;
const PAT = PATTERNS.pima.slots;
const PAIRS: [ChordName, ChordName][] = [["C", "G"], ["Am", "D"], ["G", "Em"]];
type Fail = "wait" | "keep";
type Kind = "fretted" | "open" | "late" | "skipped";
const COLOR: Record<Role, string> = { p: C.purple, p2: C.purple, i: C.teal, m: C.sky, a: C.amber };

/** What happens to the note of role-slot k (0…7) in a bar, given the change timing. */
function kindOf(k: number, s: number, late: number, spp: number, fail: Fail): Kind {
  if (late > 0 && k * spp < late) return k === 0 ? (fail === "wait" ? "late" : "open") : fail === "wait" ? "skipped" : "open";
  return k >= s ? "open" : "fretted";
}

export function MusicChordChangeFigure({ t }: { t?: TrackTranslations }) {
  const [pair, setPair] = useState(0);
  const [start, setStart] = useState(7);                     // the column where the hand lifts
  const [hand, setHand] = useState(400);                     // ms the hand needs
  const [bpm, setBpm] = useState(70);
  const [fail, setFail] = useState<Fail>("wait");
  const vis = useVisible<HTMLDivElement>();
  const spp = slotSec("4/4", bpm), ready = start * spp + hand / 1000, late = ready - N * spp;   // seconds, from the bar's start
  const chords = PAIRS[pair];

  const pulses = Array.from({ length: 2 * N }, (_, q) => {
    const b = Math.floor(q / N), k = q % N, kind = kindOf(k, start, late, spp, fail), hits: Hit[] = [];
    if (k % 2 === 0) hits.push(accentClick(k === 0 ? 2 : 1));
    if (kind !== "skipped") PAT[k].forEach(r => hits.push({
      note: noteOf(chords[b], r, kind === "open"),
      vel: r[0] === "p" ? 0.8 : 0.58,
      ring: Math.min(ringSlots(PAT, k, r), N - k) * spp,
      delay: kind === "late" ? late : 0,
    }));
    return hits;
  });
  const loop = usePulseLoop(vis.on, { pulses, spp });

  const w = (X1 - X0) / (2 * N), cx = (q: number) => X0 + (q + 0.5) * w, xAt = (sec: number) => X0 + (sec / spp) * w;
  const status = loop.notesLoad === "loading" ? loadStatus(t, loop.inst, loop.notesLoad) : null;
  const k = Math.ceil(hand / 1000 / spp), need = N - k;
  const free = (N - start) * spp * 1000;

  return (
    <Figure title={tx(t, "figMus_ccTitle", "Changing chords without losing the 1")}
      head={<InstrumentChoice t={t} onChange={() => { if (loop.running) loop.prepareNotes(); }} />}
      controls={<>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figMus_ccChords", "chords")}</span>
          <Choice value={String(pair)} onChange={v => setPair(Number(v))} options={PAIRS.map(([a, b], i) => [String(i), `${a} ↔ ${b}`] as const)} />
        </Row>
        <Slider label={tx(t, "figMus_ccStart", "lift the hand on")} value={start} min={0} max={N - 1} step={1} onChange={setStart}
          fmt={v => `"${fullCount("4/4", v, t)}"`} width="w-28" />
        <Slider label={tx(t, "figMus_ccHand", "the hand needs")} value={hand} min={100} max={1200} step={10} onChange={setHand} fmt={v => `${v} ms`} width="w-28" />
        <Slider label={tx(t, "figMus_meBpm", "tempo (BPM)")} value={bpm} min={40} max={140} step={1} onChange={setBpm} fmt={v => `${v} BPM`} width="w-28" />
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figMus_ccFail", "if the hand is late")}</span>
          <Choice value={fail} onChange={setFail} options={[
            ["wait", tx(t, "figMus_ccWait", "wait for it (the 1 comes late)")],
            ["keep", tx(t, "figMus_ccKeep", "keep the beat (open strings)")],
          ]} />
        </Row>
        <Row>
          <Readout color={C.amber}>{tx(t, "figMus_ccFree", "time to the 1")}: {N - start} × {Math.round(spp * 1000)} = {Math.round(free)} ms</Readout>
          <Readout color={late > 0 ? C.red : C.green}>{late > 0
            ? `${tx(t, "figMus_ccLate", "the hand lands")} ${Math.round(late * 1000)} ms ${tx(t, "figMus_ccAfter", "after the 1")}`
            : `${tx(t, "figMus_ccReady", "ready")} ${Math.round(-late * 1000)} ms ${tx(t, "figMus_ccBefore", "before the 1")}`}</Readout>
          <Readout>{tx(t, "figMus_ccRule", "lift at the latest on")} {need >= 0 ? `"${fullCount("4/4", need, t)}"` : tx(t, "figMus_ccEarlier", "the bar before (slow down)")}</Readout>
        </Row>
        <VolumeSlider t={t} />
      </>}
      note={<>
        {tx(t, "figMus_ccNote", "Start with the hand lifting on the last \"&\" and needing 400 ms. At 70 BPM a column lasts 429 ms, so the new chord is ready in time, and the one note picked in the air is an open string. Now raise the tempo, or make the hand slower: once it lands after the 1, waiting makes the bar stumble, and keeping the beat plays the 1 on open strings. Move the lift one column earlier and the 1 is safe again. Of the two failures, keeping the beat is the one listeners forgive.")}
        {" "}<SampleCredit t={t} />
      </>}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
          {loop.pulse !== null && <rect x={X0 + loop.pulse * w} y={Y_COUNT - 14} width={w} height={Y_HAND - Y_COUNT + 26} rx={4} fill={C.fg} opacity={0.08} />}
          {[0, 1].map(b => (
            <g key={b}>
              <T x={X0 + b * N * w + 4} y={Y_CHORD} size={13} bold color={C.fg}>{chords[b]}</T>
              <line x1={X0 + b * N * w} x2={X0 + b * N * w} y1={Y_CHORD - 12} y2={Y_HAND + 16} stroke={C.axis} strokeWidth={1.8} />
            </g>
          ))}
          <line x1={X1} x2={X1} y1={Y_CHORD - 12} y2={Y_HAND + 16} stroke={C.axis} strokeWidth={1.8} strokeDasharray="3 3" />
          {Array.from({ length: 2 * N }, (_, q) => (
            <T key={q} x={cx(q)} y={Y_COUNT} anchor="middle" size={q % 2 === 0 ? 12 : 10} bold={q % 2 === 0} color={q % 2 === 0 ? C.fg : C.muted}>{countOf("4/4", q % N, t)}</T>
          ))}
          {/* the picked notes, one lane per finger */}
          {ROLES.map((r, i) => <line key={r} x1={X0} x2={X1} y1={Y0 + i * LANE + LANE / 2} y2={Y0 + i * LANE + LANE / 2} stroke={C.grid} />)}
          {Array.from({ length: 2 * N }, (_, q) => {
            const kind = kindOf(q % N, start, late, spp, fail);
            return PAT[q % N].map(r => {
              const y = Y0 + ROLES.indexOf(r) * LANE + LANE / 2, x = kind === "late" ? cx(q) + (late / spp) * w : cx(q);
              const col = kind === "open" ? C.amber : kind === "late" ? C.red : COLOR[r];
              return (
                <g key={`${q}${r}`} opacity={kind === "skipped" ? 0.35 : 1}>
                  {kind === "late" && <line x1={cx(q)} x2={x} y1={y} y2={y} stroke={C.red} strokeWidth={1.5} strokeDasharray="2 2" />}
                  <circle cx={x} cy={y} r={6.5} fill={kind === "fretted" ? col : "var(--card)"} stroke={col} strokeWidth={kind === "skipped" ? 1 : 1.8}
                    strokeDasharray={kind === "skipped" ? "2 2" : undefined} />
                  <T x={x} y={y + 3} anchor="middle" size={7.5} bold color={kind === "fretted" ? "#fff" : col}>{fingerMark(r, loop.inst)}</T>
                </g>
              );
            });
          })}
          {/* the fretting hand: on the chord, in the air, on the next chord */}
          <T x={X0 - 6} y={Y_HAND + 4} anchor="end" size={8.5} bold color={C.muted}>{tx(t, "figMus_ccHandRow", "hand")}</T>
          {[0, 1].map(b => {
            const x0 = X0 + b * N * w, lift = x0 + start * w, land = Math.min(X0 + 2 * N * w, xAt(ready) + b * N * w);
            return (
              <g key={b}>
                <rect x={x0 + 1} y={Y_HAND - 6} width={Math.max(0, lift - x0 - 2)} height={12} rx={3} fill={C.green} opacity={0.5} />
                <rect x={lift} y={Y_HAND - 6} width={Math.max(2, land - lift)} height={12} rx={3} fill={late > 0 ? C.red : C.amber} opacity={0.75} />
                <T x={x0 + N * w - 3} y={Y_HAND + 20} anchor="end" size={8} color={late > 0 ? C.red : C.amber}>{tx(t, "figMus_ccAir", "in the air")} {hand} ms</T>
              </g>
            );
          })}
          {late > 0 && <T x={X0 + N * w + 4} y={Y_HAND - 10} size={8.5} bold color={C.red}>{tx(t, "figMus_ccMissed", "the 1 is not ready")}</T>}
        </svg>
        <div className="px-3 pb-3 flex flex-wrap items-center gap-3">
          <SoundButton on={loop.running} onClick={() => loop.toggle(false, true)}>
            {loop.running ? tx(t, "figMus_stop", "stop") : tx(t, "figMus_ccPlay", "play the two bars")}
          </SoundButton>
          {status && <span className="text-[11px] font-mono text-[var(--text-muted)]">{status}</span>}
        </div>
      </div>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Btn, C, Choice, Figure, Readout, Row, Slider, T, useVisible } from "@/components/lesson/kit/figure";
import { VolumeSlider } from "@/components/lesson/kit/audio/VolumeSlider";
import { SoundButton } from "@/components/lesson/kit/audio/SoundButton";
import { InstrumentChoice, loadStatus, SampleCredit } from "@/components/lesson/kit/audio/useInstrument";
import { accentClick, usePulseLoop, type Hit } from "./usePulseLoop";
import {
  CHORD_NAMES, countOf, fingerMark, METER, noteOf, onClick, PATTERN_IDS, PATTERNS, patternName, ringSlots, roleLabel, ROLES, slotSec,
  type ChordName, type Pattern, type PatternId, type Role,
} from "./picking";

// ── What this figure shows ────────────────────────────────────────────────────
// A picking pattern laid out on the counting grid. Columns are the eighth
// notes of one bar, named the way they are counted ("1 & 2 & …"); the
// metronome clicks only on the columns that start a beat. Rows are the
// fingers: the thumb on the bass strings, i, m and a on the top three (on the
// piano: the left hand's bass, the right hand's three chord notes). Playing,
// the heard column lights up, so the reader sees which notes land WITH a
// click and which fall exactly between two. Cells can be clicked to change
// the pattern; the chord changes the notes, never the rhythm.

const W = 600, X0 = 124, X1 = 590, Y_COUNT = 24, Y_CLICK = 44, Y0 = 58, ROW = 30;
const COLOR: Record<Role, string> = { p: C.purple, p2: C.purple, i: C.teal, m: C.sky, a: C.amber };

/** The hits of slot `s`: the click (if any) and the notes. */
function hitsOf(pat: Pattern, chord: ChordName, s: number, spp: number, o: { click: boolean; sub: boolean; notes: boolean }): Hit[] {
  const hits: Hit[] = [];
  if (o.click && onClick(pat.meter, s)) hits.push(accentClick(s === 0 ? 2 : 1));
  else if (o.click && o.sub) hits.push({ hz: 2600, level: 0.12 });
  if (o.notes) pat.slots[s].forEach(r => hits.push({
    note: noteOf(chord, r),
    vel: r === "p" || r === "p2" ? (s === 0 ? 0.85 : 0.75) : 0.58,
    ring: ringSlots(pat.slots, s, r) * spp,
  }));
  return hits;
}

export function MusicPickingGridFigure({ t }: { t?: TrackTranslations }) {
  const [preset, setPreset] = useState<PatternId | null>("pima");
  const [pat, setPat] = useState<Pattern>(PATTERNS.pima);
  const [chord, setChord] = useState<ChordName>("C");
  const [bpm, setBpm] = useState(60);
  const [click, setClick] = useState(true);
  const [sub, setSub] = useState(false);
  const [notes, setNotes] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const spp = slotSec(pat.meter, bpm), n = pat.slots.length;
  const loop = usePulseLoop(vis.on, { pulses: Array.from({ length: n }, (_, s) => hitsOf(pat, chord, s, spp, { click, sub, notes })), spp });

  const w = (X1 - X0) / n, cx = (s: number) => X0 + (s + 0.5) * w, yRow = (i: number) => Y0 + i * ROW;
  const H = yRow(ROLES.length) + 34;
  const choose = (id: PatternId) => { setPreset(id); setPat(PATTERNS[id]); };
  const toggleCell = (s: number, r: Role) => {
    setPreset(null);
    setPat(p => ({ ...p, slots: p.slots.map((rs, k) => (k !== s ? rs : rs.includes(r) ? rs.filter(x => x !== r) : [...rs, r])) }));
  };
  const withClick = pat.slots.reduce((a, rs, s) => a + (onClick(pat.meter, s) ? rs.length : 0), 0);
  const all = pat.slots.reduce((a, rs) => a + rs.length, 0);
  const per = METER[pat.meter].perClick, status = loop.notesLoad === "loading" ? loadStatus(t, loop.inst, loop.notesLoad) : null;

  return (
    <Figure title={tx(t, "figMus_ppTitle", "A picking pattern on the counting grid")}
      head={<InstrumentChoice t={t} onChange={() => { if (loop.running) loop.prepareNotes(); }} />}
      controls={<>
        <Row>{PATTERN_IDS.map(id => <Btn key={id} active={preset === id} onClick={() => choose(id)}>{patternName(id, t)}</Btn>)}</Row>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figMus_ppChord", "chord")}</span>
          <Choice value={chord} onChange={setChord} options={CHORD_NAMES.map(c => [c, c] as const)} />
        </Row>
        <Row>
          <Btn active={click} onClick={() => setClick(c => !c)}>{tx(t, "figMus_ppClick", "metronome")}</Btn>
          <Btn active={sub} onClick={() => setSub(v => !v)}>{tx(t, "figMus_ppSub", "soft click between beats too")}</Btn>
          <Btn active={notes} onClick={() => setNotes(v => !v)}>{tx(t, "figMus_ppNotes", "notes")}</Btn>
        </Row>
        <Slider label={tx(t, "figMus_meBpm", "tempo (BPM)")} value={bpm} min={40} max={120} step={1} onChange={setBpm} fmt={v => `${v} BPM`} width="w-28" />
        <Row>
          <Readout color={C.amber}>{tx(t, "figMus_ppSlot", "one column")} = 60/({bpm}·{per}) s = {Math.round(spp * 1000)} ms</Readout>
          <Readout>{tx(t, "figMus_ppWith", "with a click")}: {withClick} · {tx(t, "figMus_ppBetween", "between clicks")}: {all - withClick}</Readout>
        </Row>
        <VolumeSlider t={t} />
      </>}
      note={<>
        {tx(t, "figMus_ppNote", "Start at 60 BPM and say the count out loud with the lit column. The notes under a click sound together with it; the notes under an \"&\" sit exactly halfway to the next click. Turn the notes off to hear only the click and keep counting, then turn them back on. The thumb (purple) lands on the strong beats: it is the anchor that keeps the fingers in place. Click a cell to add or remove a note.")}
        {" "}<SampleCredit t={t} />
      </>}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
          {loop.pulse !== null && <rect x={X0 + loop.pulse * w} y={Y_COUNT - 18} width={w} height={yRow(ROLES.length) - Y_COUNT + 18} rx={4} fill={C.fg} opacity={0.08} />}
          {/* beat lines: a solid line where a click falls */}
          {Array.from({ length: n + 1 }, (_, s) => (
            <line key={s} x1={X0 + s * w} x2={X0 + s * w} y1={Y0 - 4} y2={yRow(ROLES.length)}
              stroke={s % n === 0 ? C.axis : onClick(pat.meter, s) ? C.axis : C.grid} strokeWidth={s % n === 0 ? 1.6 : 1}
              strokeDasharray={onClick(pat.meter, s % n) || s === n ? undefined : "2 4"} />
          ))}
          <T x={X0 - 10} y={Y_COUNT + 4} anchor="end" size={9} color={C.muted}>{tx(t, "figMus_ppCount", "say")}</T>
          <T x={X0 - 10} y={Y_CLICK + 3} anchor="end" size={9} color={C.muted}>{tx(t, "figMus_ppClickRow", "click")}</T>
          {pat.slots.map((_, s) => {
            const beat = onClick(pat.meter, s), lit = loop.pulse === s;
            return (
              <g key={s}>
                <T x={cx(s)} y={Y_COUNT + 5} anchor="middle" size={beat ? 15 : 12} bold={beat} color={lit ? C.fg : beat ? C.fg : C.muted}>{countOf(pat.meter, s, t)}</T>
                {beat
                  ? <circle cx={cx(s)} cy={Y_CLICK} r={lit ? 6.5 : 5} fill={s === 0 ? "#f43f5e" : C.fg} opacity={lit ? 1 : 0.55} />
                  : sub && click && <circle cx={cx(s)} cy={Y_CLICK} r={2.5} fill={C.muted} opacity={0.6} />}
              </g>
            );
          })}
          {ROLES.map((r, i) => {
            const y = yRow(i);
            return (
              <g key={r}>
                <T x={X0 - 10} y={y + ROW / 2 + 3} anchor="end" size={9.5} bold color={COLOR[r]}>{roleLabel(r, loop.inst, chord, t)}</T>
                <line x1={X0} x2={X1} y1={y + ROW / 2} y2={y + ROW / 2} stroke={C.grid} />
                {pat.slots.map((rs, s) => {
                  const on = rs.includes(r), lit = on && loop.pulse === s;
                  return (
                    <g key={s} onClick={() => toggleCell(s, r)} style={{ cursor: "pointer" }}>
                      <rect x={cx(s) - w / 2} y={y} width={w} height={ROW} fill="transparent" />
                      {on && <circle cx={cx(s)} cy={y + ROW / 2} r={lit ? 12 : 10} fill={COLOR[r]} opacity={lit ? 1 : 0.75} />}
                      {on && <T x={cx(s)} y={y + ROW / 2 + 4} anchor="middle" size={11} bold color="#fff">{fingerMark(r, loop.inst)}</T>}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <T x={X0} y={H - 10} size={8.5}>{pat.meter} · {tx(t, "figMus_ppBar", "one bar, then again")} ↺</T>
          <T x={X1} y={H - 10} anchor="end" size={8.5}>{tx(t, "figMus_ppSolid", "solid line = click · dashed = between clicks")}</T>
        </svg>
        <div className="px-3 pb-3 flex flex-wrap items-center gap-3">
          <SoundButton on={loop.running} onClick={() => loop.toggle(false, true)}>
            {loop.running ? tx(t, "figMus_stop", "stop") : tx(t, "figMus_ppPlay", "play the pattern")}
          </SoundButton>
          {status && <span className="text-[11px] font-mono text-[var(--text-muted)]">{status}</span>}
        </div>
      </div>
    </Figure>
  );
}

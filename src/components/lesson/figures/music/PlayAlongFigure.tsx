"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Btn, C, Choice, clamp, Figure, Readout, Row, Slider, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { audio, startAudio, type Voice } from "@/components/lesson/kit/audio/context";
import { playClick } from "@/components/lesson/kit/audio/click";
import { playNote } from "@/components/lesson/kit/audio/instrument";
import { VolumeSlider } from "@/components/lesson/kit/audio/VolumeSlider";
import { SoundButton } from "@/components/lesson/kit/audio/SoundButton";
import { InstrumentChoice, loadStatus, SampleCredit, useNotes } from "@/components/lesson/kit/audio/useInstrument";
import { countOf, fingerMark, noteOf, onClick, PATTERNS, patternName, ringSlots, slotSec, type PatternId, type Role } from "./picking";

// ── What this figure shows ────────────────────────────────────────────────────
// Play a picking pattern by tapping. The metronome clicks, one bar counts in,
// and then the reader taps the notes of their part: only the thumb, only the
// fingers, or every note; the widget plays the rest. Each tap sounds the note
// it was aimed at and is drawn where it really fell, early (left) or late
// (right) of the place it belongs, so the reader sees whether the "&"s sit in
// the middle. A bar is clean when every note of the part is within a small
// window and nothing extra was tapped; with the ladder on, two clean bars in
// a row raise the tempo by 4 BPM. Clicks are booked on the audio clock.

const W = 600, X0 = 70, X1 = 584, Y_COUNT = 22, Y0 = 44, ROW = 30, ROWS = 4;
const H = Y0 + ROWS * ROW + 18;
const AHEAD = 0.15, TICK_MS = 25, CHORD = "C" as const, STEP_UP = 4, BPM_MAX = 140;
const IDS: PatternId[] = ["pima", "pimi", "alt", "arp34", "six8"];
const COLOR: Record<Role, string> = { p: C.purple, p2: C.purple, i: C.teal, m: C.sky, a: C.amber };

type Part = "thumb" | "fingers" | "all";
const inPart = (part: Part, r: Role) => part === "all" || (part === "thumb") === (r === "p" || r === "p2");
type Booked = { at: number; slot: number; bar: number; spp: number };
type Tap = { bar: number; slot: number; ms: number | null };     // ms = offset from the note (null: nothing near)
const latency = (ctx: AudioContext) => ctx.outputLatency || ctx.baseLatency || 0;
/** The timing window for a clean note: 15 % of a slot, kept between 35 and 70 ms. */
const tolOf = (spp: number) => clamp(0.15 * spp, 0.035, 0.07);

export function MusicPlayAlongFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState<PatternId>("pima");
  const [part, setPart] = useState<Part>("thumb");
  const [bpm, setBpm] = useState(60);
  const [ladder, setLadder] = useState(false);
  const [running, setRunning] = useState(false);
  const [taps, setTaps] = useState<Tap[]>([]);
  const [bars, setBars] = useState<Record<number, boolean>>({});   // judged bars: clean or not
  const [streak, setStreak] = useState(0);
  const [pos, setPos] = useState<{ bar: number; slot: number } | null>(null);
  const vis = useVisible<HTMLDivElement>();
  const { inst, load, ensure } = useNotes();
  const pat = PATTERNS[id], n = pat.slots.length;
  const live = useRef({ pat, part, bpm });
  useEffect(() => { live.current = { pat, part, bpm }; });
  const booked = useRef<Booked[]>([]);
  const voices = useRef<{ v: Voice; end: number }[]>([]);
  const tapsRef = useRef<Tap[]>([]);
  const judged = useRef(new Set<number>());
  const ladderRef = useRef({ on: ladder, streak: 0 });
  useEffect(() => { ladderRef.current.on = ladder; }, [ladder]);

  const isTarget = (s: number) => pat.slots[s].some(r => inPart(part, r));

  // The scheduler: clicks and the widget's part, bar by bar (the tempo changes only on a new bar)
  useEffect(() => {
    if (!running || !vis.on) return;
    const { ctx } = audio();
    let next = ctx.currentTime + 0.15, slot = 0, bar = 0, spp = slotSec(live.current.pat.meter, live.current.bpm);
    booked.current = [];
    const id = setInterval(() => {
      voices.current = voices.current.filter(x => x.end > ctx.currentTime || (x.v.stop(), false));
      while (next < ctx.currentTime + AHEAD) {
        const { pat: p, part: pt, bpm: tempo } = live.current;
        if (slot >= p.slots.length) { slot = 0; bar++; }
        if (slot === 0) spp = slotSec(p.meter, tempo);
        if (onClick(p.meter, slot)) playClick(next, { accent: slot === 0, level: 0.6 });
        if (bar > 0) p.slots[slot].filter(r => !inPart(pt, r)).forEach(r => {
          const v = playNote(noteOf(CHORD, r), { when: next, velocity: r[0] === "p" ? 0.75 : 0.55 });
          if (v) voices.current.push({ v, end: next + ringSlots(p.slots, slot, r) * spp });
        });
        booked.current = [...booked.current.slice(-31), { at: next, slot, bar, spp }];
        next += spp; slot++;
      }
    }, TICK_MS);
    return () => { clearInterval(id); voices.current.forEach(x => x.v.stop(0.1)); voices.current = []; };
  }, [running, vis.on]);
  useEffect(() => { if (!vis.on) { setRunning(false); setPos(null); } }, [vis.on]);

  // Follow the heard slot, and judge each bar once it is over
  useFrame(vis.on && running, () => {
    const { ctx } = audio(), now = ctx.currentTime - latency(ctx);
    const last = [...booked.current].reverse().find(b => b.at <= now);
    if (last) setPos(p => (p && p.bar === last.bar && p.slot === last.slot ? p : { bar: last.bar, slot: last.slot }));
    const { pat: p, part: pt } = live.current;
    const done = new Set(booked.current.filter(b => b.bar > 0 && b.slot === p.slots.length - 1 && b.at + b.spp * 1.5 < now).map(b => b.bar));
    done.forEach(bar => {
      if (judged.current.has(bar)) return;
      judged.current.add(bar);
      const tol = tolOf(booked.current.find(b => b.bar === bar)!.spp) * 1000;
      const mine = tapsRef.current.filter(x => x.bar === bar);
      const want = p.slots.map((rs, s) => rs.some(r => inPart(pt, r)) ? s : -1).filter(s => s >= 0);
      const clean = mine.length === want.length && want.every(s => mine.some(x => x.slot === s && x.ms !== null && Math.abs(x.ms) <= tol));
      setBars(b => ({ ...b, [bar]: clean }));
      const l = ladderRef.current;
      l.streak = clean ? l.streak + 1 : 0;
      setStreak(l.streak);
      if (clean && l.on && l.streak % 2 === 0) setBpm(v => Math.min(BPM_MAX, v + STEP_UP));
    });
  });

  const toggle = async () => {
    startAudio();
    if (running) { setRunning(false); setPos(null); return; }
    try { await ensure(); } catch { return; }
    tapsRef.current = []; judged.current = new Set(); ladderRef.current.streak = 0;
    setTaps([]); setBars({}); setStreak(0);
    setRunning(true);
  };

  const tap = () => {
    if (!running) return;
    const { ctx } = audio(), now = ctx.currentTime, lat = latency(ctx);
    const targets = booked.current.filter(b => b.bar > 0 && live.current.pat.slots[b.slot]?.some(r => inPart(live.current.part, r)));
    if (!targets.length) return;
    const near = targets.reduce((a, b) => (Math.abs(b.at + lat - now) < Math.abs(a.at + lat - now) ? b : a));
    const off = now - (near.at + lat), twice = tapsRef.current.some(x => x.bar === near.bar && x.slot === near.slot);
    const x: Tap = { bar: near.bar, slot: near.slot, ms: Math.abs(off) < near.spp / 2 && !twice ? off * 1000 : null };
    tapsRef.current = [...tapsRef.current.slice(-63), x];
    setTaps(tapsRef.current);
    live.current.pat.slots[near.slot].filter(r => inPart(live.current.part, r)).forEach(r => {
      const v = playNote(noteOf(CHORD, r), { velocity: r[0] === "p" ? 0.8 : 0.6 });
      if (v) voices.current.push({ v, end: ctx.currentTime + ringSlots(live.current.pat.slots, near.slot, r) * near.spp });
    });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) tap(); }
  };

  const w = (X1 - X0) / n, cx = (s: number) => X0 + (s + 0.5) * w;
  const spp = slotSec(pat.meter, bpm), tol = tolOf(spp) * 1000;
  const cur = pos?.bar ?? 0, shown = Array.from({ length: ROWS }, (_, k) => cur - k).filter(b => b >= 1);
  const timed = taps.filter(x => x.ms !== null).slice(-16), avg = timed.length ? timed.reduce((a, x) => a + x.ms!, 0) / timed.length : null;
  const lastTap = taps[taps.length - 1];
  const dot = (ms: number | null) => (ms === null ? C.red : Math.abs(ms) <= tol ? C.green : Math.abs(ms) <= 2 * tol ? C.amber : C.red);
  const early = tx(t, "figMus_mtEarly", "early"), late = tx(t, "figMus_mtLate", "late");
  const msText = (ms: number) => `${Math.abs(ms).toFixed(0)} ms ${ms < 0 ? early : late}`;

  return (
    <Figure title={tx(t, "figMus_paTitle", "Play along: tap your part in time")}
      head={<InstrumentChoice t={t} onChange={() => ensure().catch(() => {})} />}
      controls={<>
        <Row>{IDS.map(k => <Btn key={k} active={id === k} onClick={() => setId(k)}>{patternName(k, t)}</Btn>)}</Row>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figMus_paYou", "you tap")}</span>
          <Choice value={part} onChange={setPart} options={[
            ["thumb", tx(t, "figMus_paThumb", "the thumb (bass)")],
            ["fingers", tx(t, "figMus_paFingers", "the fingers (i m a)")],
            ["all", tx(t, "figMus_paAll", "every note")],
          ]} />
        </Row>
        <Row>
          <Btn active={ladder} onClick={() => setLadder(v => !v)}>{tx(t, "figMus_paLadder", "tempo ladder: +4 BPM every 2 clean bars")}</Btn>
        </Row>
        <Slider label={tx(t, "figMus_meBpm", "tempo (BPM)")} value={bpm} min={40} max={BPM_MAX} step={1} onChange={setBpm} fmt={v => `${v} BPM`} width="w-28" />
        <Row>
          <Readout color={C.green}>{tx(t, "figMus_paWindow", "clean window")}: ±{tol.toFixed(0)} ms</Readout>
          {lastTap && <Readout color={dot(lastTap.ms)}>{tx(t, "figMus_paLast", "last tap")}: {lastTap.ms === null ? tx(t, "figMus_paStray", "no note there") : msText(lastTap.ms)}</Readout>}
          {avg !== null && <Readout color={C.purple}>{tx(t, "figMus_mtAvg", "on average")} {msText(avg)}</Readout>}
          {running && <Readout>{tx(t, "figMus_paStreak", "clean bars in a row")}: {streak}</Readout>}
        </Row>
        <VolumeSlider t={t} />
      </>}
      note={<>
        {tx(t, "figMus_paNote", "Start it and listen to one bar of clicks, counting out loud; then tap from the next 1. Begin with the thumb alone: it lands on the clicks, so it is the easiest part. Then tap only the fingers while the widget plays the thumb: now most taps fall between clicks. Last, tap every note. Green is inside the window, amber close, red off (or a tap with no note near it). Raise the tempo only when the bars come out clean.")}
        {" "}<span data-mouse-only>{tx(t, "figMus_mtNoteKey", "The space bar taps too once the button has focus.")}</span>
        {" "}{tx(t, "figMus_mtNoteLat", "Your device adds a few milliseconds of its own between a tap and the sound, so treat small offsets as approximate.")}
        {" "}<SampleCredit t={t} />
      </>}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
          {pos && pos.bar > 0 && <rect x={X0 + pos.slot * w} y={Y_COUNT - 16} width={w} height={22} rx={4} fill={C.fg} opacity={0.08} />}
          {pat.slots.map((rs, s) => (
            <T key={s} x={cx(s)} y={Y_COUNT} anchor="middle" size={onClick(pat.meter, s) ? 14 : 11} bold={onClick(pat.meter, s)}
              color={isTarget(s) ? C.fg : C.muted}>{countOf(pat.meter, s, t)}</T>
          ))}
          {running && cur === 0 && <T x={X1} y={Y_COUNT} anchor="end" size={9} bold color={C.amber}>{tx(t, "figMus_paCountIn", "count-in bar: listen")}</T>}
          {Array.from({ length: ROWS }, (_, k) => {
            const bar = shown[k], y = Y0 + k * ROW + ROW / 2, result = bar !== undefined ? bars[bar] : undefined;
            if (bar === undefined && k > 0) return null;
            return (
              <g key={k} opacity={bar === undefined ? 0.35 : k === 0 ? 1 : 0.7}>
                <T x={8} y={y + 3} size={9} bold={k === 0} color={result === undefined ? C.muted : result ? C.green : C.red}>
                  {bar === undefined ? "" : `${tx(t, "figMus_paBar", "bar")} ${bar}${result === undefined ? "" : result ? " ✓" : " ×"}`}
                </T>
                <line x1={X0} x2={X1} y1={y} y2={y} stroke={C.grid} />
                {pat.slots.map((rs, s) => {
                  const mine = rs.filter(r => inPart(part, r)), other = rs.filter(r => !inPart(part, r));
                  return (
                    <g key={s}>
                      {onClick(pat.meter, s) && <line x1={cx(s)} x2={cx(s)} y1={y - 12} y2={y + 12} stroke={C.axis} />}
                      {mine.length > 0 && <circle cx={cx(s)} cy={y} r={9} fill="none" stroke={COLOR[mine[0]]} strokeWidth={2} />}
                      {mine.length > 0 && <T x={cx(s)} y={y + 3.5} anchor="middle" size={9} bold color={COLOR[mine[0]]}>{fingerMark(mine[0], inst)}</T>}
                      {mine.length === 0 && other.length > 0 && <circle cx={cx(s)} cy={y} r={3} fill={C.muted} opacity={0.5} />}
                    </g>
                  );
                })}
                {bar !== undefined && taps.filter(x => x.bar === bar).map((x, j) => {
                  const xpos = x.ms === null ? cx(x.slot) : cx(x.slot) + (x.ms / 1000 / spp) * w;
                  return <circle key={j} cx={clamp(xpos, X0, X1)} cy={y - 13} r={4.5} fill={dot(x.ms)} />;
                })}
              </g>
            );
          })}
          <T x={X0} y={H - 4} size={8}>{tx(t, "figMus_paAxis", "your tap left of the ring = early, right = late")}</T>
          <T x={X1} y={H - 4} anchor="end" size={8}>{tx(t, "figMus_paLegend", "ring = your note · grey = played for you")}</T>
        </svg>
        <div className="px-3 pb-3 flex flex-wrap gap-2 items-center">
          <SoundButton on={running} onClick={toggle}>
            {running ? tx(t, "figMus_stop", "stop") : tx(t, "figMus_paStart", "start (one bar to count in)")}
          </SoundButton>
          <button type="button" onPointerDown={tap} onKeyDown={onKey} disabled={!running}
            className="h-11 px-8 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] bg-[var(--card)] text-[12px] font-semibold active:bg-[var(--primary)] active:text-[var(--card)] touch-manipulation disabled:opacity-40">
            {tx(t, "figMus_mtTap", "tap")}
          </button>
          {load === "loading" && <span className="text-[11px] font-mono text-[var(--text-muted)]">{loadStatus(t, inst, load)}</span>}
        </div>
      </div>
    </Figure>
  );
}

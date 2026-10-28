// ── Picking patterns ──────────────────────────────────────────────────────────
// Shared data for the "Playing in Time" widgets. A pattern is a bar of slots
// (eighth notes) and, in each slot, the ROLES that play: the bass (thumb), the
// alternate bass, and the three treble strings (fingers i, m, a). A chord
// turns roles into notes, so one pattern works over any chord, and the same
// notes are played on the guitar (strings) or the piano (left hand bass,
// right hand on the top three). The metronome clicks on the slots that start
// a beat.

import type { TrackTranslations } from "@/lib/tracks/types";
import { tx } from "@/lib/tracks/tx";
import { STANDARD_TUNING } from "@/components/lesson/kit/audio/Fretboard";
import type { Instrument } from "@/components/lesson/kit/audio/instrument";

export type Role = "p" | "p2" | "i" | "m" | "a";
/** Top to bottom as drawn: the high string first, like tablature. */
export const ROLES: Role[] = ["a", "m", "i", "p2", "p"];

export type Meter = "4/4" | "3/4" | "6/8";
/** Eighth-note slots per bar, and slots per metronome click (6/8 clicks the dotted quarter). */
export const METER: Record<Meter, { slots: number; perClick: number }> = {
  "4/4": { slots: 8, perClick: 2 },
  "3/4": { slots: 6, perClick: 2 },
  "6/8": { slots: 6, perClick: 3 },
};

export const onClick = (meter: Meter, s: number) => s % METER[meter].perClick === 0;
/** Seconds per slot: the click period split in `perClick`. */
export const slotSec = (meter: Meter, bpm: number) => 60 / bpm / METER[meter].perClick;

/** What to say on each slot: "1 & 2 &…" (PT "1 e 2 e…"), or "1 2 3 4 5 6" in 6/8. */
export function countOf(meter: Meter, s: number, t?: TrackTranslations) {
  if (meter === "6/8") return String(s + 1);
  return s % 2 === 0 ? String(s / 2 + 1) : tx(t, "figMus_sdAnd", "&");
}

/** The same, with the beat an "&" belongs to: "4 &" instead of a bare "&". */
export const fullCount = (meter: Meter, s: number, t?: TrackTranslations) =>
  meter !== "6/8" && s % 2 === 1 ? `${(s - 1) / 2 + 1} ${countOf(meter, s, t)}` : countOf(meter, s, t);

// ── Chords ───────────────────────────────────────────────────────────────────
// Open guitar shapes, strings low E (0) to high E (5); null = not played.
// `bass` and `alt` are the strings the thumb alternates between.

export type ChordName = "C" | "G" | "Am" | "Em" | "D";
type Shape = { frets: (number | null)[]; bass: number; alt: number };
export const CHORDS: Record<ChordName, Shape> = {
  C: { frets: [null, 3, 2, 0, 1, 0], bass: 1, alt: 2 },
  G: { frets: [3, 2, 0, 0, 0, 3], bass: 0, alt: 2 },
  Am: { frets: [null, 0, 2, 2, 1, 0], bass: 1, alt: 2 },
  Em: { frets: [0, 2, 2, 0, 0, 0], bass: 0, alt: 1 },
  D: { frets: [null, 0, 0, 2, 3, 2], bass: 2, alt: 1 },
};
export const CHORD_NAMES = Object.keys(CHORDS) as ChordName[];

/** The string each role plucks in a chord. */
export function stringOf(c: ChordName, r: Role) {
  const ch = CHORDS[c];
  return r === "p" ? ch.bass : r === "p2" ? ch.alt : { i: 3, m: 4, a: 5 }[r];
}

/** The MIDI note a role plays in a chord; `open` = the string with no finger on it. */
export function noteOf(c: ChordName, r: Role, open = false) {
  const s = stringOf(c, r);
  return STANDARD_TUNING[s] + (open ? 0 : CHORDS[c].frets[s] ?? 0);
}

/** Row label: the finger on the guitar ("p · string 5"), the hand and finger on the piano. */
export function roleLabel(r: Role, inst: Instrument, c: ChordName, t?: TrackTranslations) {
  if (inst === "piano") return {
    p: tx(t, "figMus_ppLH5", "left hand 5"), p2: tx(t, "figMus_ppLH1", "left hand 1"),
    i: tx(t, "figMus_ppRH1", "right hand 1"), m: tx(t, "figMus_ppRH3", "right hand 3"), a: tx(t, "figMus_ppRH5", "right hand 5"),
  }[r];
  const str = tx(t, "figMus_ppString", "string");
  return `${r === "p2" ? "p" : r} · ${str} ${6 - stringOf(c, r)}`;
}

/** The short mark inside a cell: the guitar finger, or the piano finger number. */
export const fingerMark = (r: Role, inst: Instrument) =>
  inst === "piano" ? { p: "5", p2: "1", i: "1", m: "3", a: "5" }[r] : r === "p2" ? "p" : r;

// ── Patterns ─────────────────────────────────────────────────────────────────

export type Pattern = { meter: Meter; slots: Role[][] };
export type PatternId = "pima" | "pimi" | "alt" | "pinch" | "waltz" | "arp34" | "six8";

const P = (meter: Meter, ...slots: string[]): Pattern =>
  ({ meter, slots: slots.map(s => (s ? s.split("+") as Role[] : [])) });

export const PATTERNS: Record<PatternId, Pattern> = {
  pima: P("4/4", "p", "i", "m", "a", "p2", "i", "m", "a"),
  pimi: P("4/4", "p", "i", "m", "i", "p2", "i", "m", "i"),
  alt: P("4/4", "p", "m", "p2", "i", "p", "m", "p2", "a"),
  pinch: P("4/4", "p+a", "i", "m", "i", "p2+a", "i", "m", "i"),
  waltz: P("3/4", "p", "", "i+m+a", "", "i+m+a", ""),
  arp34: P("3/4", "p", "i", "m", "a", "m", "i"),
  six8: P("6/8", "p", "i", "m", "a", "m", "i"),
};
export const PATTERN_IDS = Object.keys(PATTERNS) as PatternId[];

export function patternName(id: PatternId, t?: TrackTranslations) {
  return {
    pima: tx(t, "figMus_ppPima", "4/4 · p i m a"),
    pimi: tx(t, "figMus_ppPimi", "4/4 · p i m i"),
    alt: tx(t, "figMus_ppAlt", "4/4 · alternating bass"),
    pinch: tx(t, "figMus_ppPinch", "4/4 · pinch"),
    waltz: tx(t, "figMus_ppWaltz", "3/4 · waltz"),
    arp34: tx(t, "figMus_ppArp34", "3/4 · arpeggio"),
    six8: tx(t, "figMus_ppSix8", "6/8 · arpeggio"),
  }[id];
}

/** How many slots until role `r` plays again after slot `s` (how long its string can ring). */
export function ringSlots(slots: Role[][], s: number, r: Role) {
  const n = slots.length;
  for (let k = 1; k <= n; k++) if (slots[(s + k) % n].includes(r)) return k;
  return n;
}

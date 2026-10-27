"use client";

// ── The project's sound effect ────────────────────────────────────────────────
// Loads public/sdl3/pickup.wav (the file the Audio chapter downloads: 22050 Hz,
// mono, signed 16-bit, 4410 sample frames = 8820 bytes of data) and reads its
// RIFF chunks the way SDL_LoadWAV does for plain PCM: the spec from "fmt ",
// the bytes from "data". The audio figures work on these real bytes.

import { useEffect, useState } from "react";

export type Wav = { freq: number; channels: number; bits: number; bytes: Uint8Array };

let cache: Promise<Wav> | null = null;

function parse(buf: ArrayBuffer): Wav {
  const v = new DataView(buf);
  const tag = (o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE") throw new Error("not a WAVE file");
  let freq = 0, channels = 0, bits = 0, bytes: Uint8Array | null = null;
  for (let o = 12; o + 8 <= buf.byteLength;) {
    const id = tag(o), len = v.getUint32(o + 4, true);
    if (id === "fmt ") { channels = v.getUint16(o + 10, true); freq = v.getUint32(o + 12, true); bits = v.getUint16(o + 22, true); }
    if (id === "data") bytes = new Uint8Array(buf, o + 8, len);
    o += 8 + len + (len & 1);
  }
  if (!bytes || !freq) throw new Error("no fmt or data chunk");
  return { freq, channels, bits, bytes };
}

export function loadPickup() {
  cache ??= fetch("/sdl3/pickup.wav").then(r => r.arrayBuffer()).then(parse);
  return cache;
}

export function usePickup() {
  const [wav, setWav] = useState<Wav | null>(null);
  useEffect(() => { let live = true; loadPickup().then(w => { if (live) setWav(w); }).catch(() => {}); return () => { live = false; }; }, []);
  return wav;
}

/** The file's samples as floats, the way the stream converts S16: s / 32768. */
export function pickupFloats(w: Wav) {
  const n = w.bytes.byteLength >> 1, out = new Float32Array(n);
  const v = new DataView(w.bytes.buffer, w.bytes.byteOffset, w.bytes.byteLength);
  for (let i = 0; i < n; i++) out[i] = v.getInt16(i * 2, true) / 32768;
  return out;
}

/** The project's music, as the C++ get callback makes it (see chapters/audio.tsx): 48000 Hz mono, 2 s loop. */
export const MUSIC_RATE = 48000, MUSIC_NOTE = 24000;
export const MUSIC_NOTES = [110.0, 87.31, 130.81, 98.0];          // A2 F2 C3 G2
export function musicSample(frame: number) {
  const f = frame % (MUSIC_NOTE * 4);
  const note = Math.floor(f / MUSIC_NOTE), t = (f % MUSIC_NOTE) / MUSIC_RATE;
  const phase = (t * MUSIC_NOTES[note]) % 1;
  return (4 * Math.abs(phase - 0.5) - 1) * Math.exp(-3 * t) * 0.5;
}

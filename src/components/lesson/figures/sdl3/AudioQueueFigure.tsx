"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, useRaf, useRerender } from "@/components/lesson/kit/figure";
import { audio, startAudio } from "@/components/lesson/kit/audio/context";
import { VolumeSlider } from "@/components/lesson/kit/audio/VolumeSlider";
import { usePickup, pickupFloats } from "./pickupWav";

// ── What this figure shows ────────────────────────────────────────────────────
// The stream SDL_OpenAudioDeviceStream returns, fed with the real pickup.wav.
// Put appends the file's 8820 bytes to the queue; the device takes data from
// the front only while it is resumed (it starts paused, as in SDL). Put twice
// and the second copy waits for the first; Clear + Put restarts the sound.
// The queue is drawn in the stream's input format (S16 mono 22050 Hz, so
// 44100 bytes per second) and drains at real time; what you hear is the same
// queue, scheduled with Web Audio on your own output device.

const MAX_S = 2;                                   // seconds of queue the drawing shows
const W = 640, H = 128, qx = 168, qw = W - qx - 8, pxs = qw / MAX_S, qy = 44, qh = 46;

export function AudioQueueFigure({ t }: { t?: TrackTranslations }) {
  const wav = usePickup();
  const [paused, setPaused] = useState(true);
  const [last, setLast] = useState("SDL_OpenAudioDeviceStream(…)");
  const R = useRef(0);                             // seconds still queued
  const srcs = useRef<AudioBufferSourceNode[]>([]);
  const rerender = useRerender();
  const [devRate, setDevRate] = useState(48000);                // the reader's output rate, read after mount
  useEffect(() => setDevRate(audio().ctx.sampleRate), []);

  const floats = useMemo(() => (wav ? pickupFloats(wav) : null), [wav]);
  const D = wav ? wav.bytes.byteLength / (wav.freq * wav.channels * (wav.bits / 8)) : 0.2;
  const bytesPerSec = wav ? wav.freq * wav.channels * (wav.bits / 8) : 44100;

  const buffer = useMemo(() => {
    if (!floats || !wav || typeof window === "undefined") return null;
    const b = audio().ctx.createBuffer(1, floats.length, wav.freq);
    b.copyToChannel(floats, 0);
    return b;
  }, [floats, wav]);

  // The sound's loudness per pixel column of one drawn copy
  const segW = D * pxs;
  const env = useMemo(() => {
    if (!floats) return [];
    const cols = Math.max(1, Math.round(segW)), per = floats.length / cols, out: number[] = [];
    for (let c = 0; c < cols; c++) {
      let m = 0;
      for (let i = Math.floor(c * per); i < Math.floor((c + 1) * per); i++) m = Math.max(m, Math.abs(floats[i]));
      out.push(m);
    }
    return out;
  }, [floats, segW]);

  const stopAll = () => { for (const s of srcs.current) { try { s.stop(); } catch { /* already ended */ } } srcs.current = []; };
  const startAt = (when: number, offset = 0) => {
    if (!buffer) return;
    const { ctx, out } = audio();
    const s = ctx.createBufferSource();
    s.buffer = buffer;
    s.connect(out);
    s.start(when, offset);
    srcs.current.push(s);
  };
  // Plays whatever is queued from now on: the rest of the first copy, then the whole ones
  const scheduleAll = (isPaused: boolean) => {
    stopAll();
    if (isPaused || R.current <= 0) return;
    const now = audio().ctx.currentTime + 0.01;
    const n = Math.ceil(R.current / D - 1e-6), first = R.current - (n - 1) * D;
    startAt(now, D - first);
    for (let k = 1; k < n; k++) startAt(now + first + (k - 1) * D);
  };
  useEffect(() => () => stopAll(), []);

  const ref = useRaf(!paused && R.current > 0, dt => {
    R.current = Math.max(0, R.current - dt);
    rerender();
  });

  const toggle = () => {
    startAudio();
    const p = !paused;
    setPaused(p);
    setLast(p ? "SDL_PauseAudioStreamDevice(stream)" : "SDL_ResumeAudioStreamDevice(stream)");
    scheduleAll(p);
  };
  const put = () => {
    startAudio();
    if (!paused) startAt(audio().ctx.currentTime + 0.01 + R.current);
    R.current += D;
    setLast("SDL_PutAudioStreamData(stream, data, 8820)");
    rerender();
  };
  const clearPut = () => {
    startAudio();
    R.current = D;
    setLast("SDL_ClearAudioStream(stream); SDL_PutAudioStreamData(stream, data, 8820)");
    scheduleAll(paused);
    rerender();
  };
  const clear = () => {
    R.current = 0;
    stopAll();
    setLast("SDL_ClearAudioStream(stream)");
    rerender();
  };

  // ── Drawing ──
  const queued = R.current;
  const n = Math.ceil(queued / D - 1e-6);
  const first = queued - (n - 1) * D;
  const segs: { x: number; w: number; cut: number }[] = [];
  for (let k = 0; k < n; k++) {
    const x0 = k === 0 ? 0 : (first + (k - 1) * D) * pxs;
    const w = (k === 0 ? first : D) * pxs;
    if (x0 >= qw) break;
    segs.push({ x: qx + x0, w: Math.min(w, qw - x0), cut: k === 0 ? (D - first) * pxs : 0 });
  }
  const hidden = Math.max(0, queued - MAX_S);
  const qBytes = Math.round(queued * bytesPerSec / 2) * 2;

  return (
    <Figure
      title={tx(t, "figSdlQueue_title", "An audio stream: put, queue, pull")}
      head={<Btn active={!paused} onClick={toggle}>{paused ? tx(t, "figSdlQueue_resume", "resume device") : tx(t, "figSdlQueue_pause", "pause device")}</Btn>}
      controls={
        <div className="space-y-3">
          <Row>
            <Btn onClick={put}>SDL_PutAudioStreamData</Btn>
            <Btn onClick={clearPut}>Clear + Put</Btn>
            <Btn onClick={clear}>SDL_ClearAudioStream</Btn>
          </Row>
          <Row>
            <Readout color={C.sky}>SDL_GetAudioStreamQueued = {qBytes} B</Readout>
            <Readout>= {qBytes} / {bytesPerSec} = {queued.toFixed(2)} s</Readout>
            <Readout color={paused ? C.red : C.green}>{paused ? tx(t, "figSdlQueue_paused", "device paused") : tx(t, "figSdlQueue_playing", "device playing")}</Readout>
          </Row>
          <p className="text-[12px] font-mono text-[var(--text-main)] break-all">{last}</p>
          <p className="text-[12.5px] leading-relaxed text-[var(--text-main)]">
            {paused && queued > 0
              ? tx(t, "figSdlQueue_stuck", "The device is paused: the data waits in the queue, and putting more only makes the queue longer. No error is reported. This is what happens when SDL_ResumeAudioStreamDevice is forgotten.")
              : n > 1
                ? tx(t, "figSdlQueue_line", "Several copies are queued: they play one after another, not together. A stream is a queue, not a mixer. Clear + Put restarts the sound instead.")
                : tx(t, "figSdlQueue_idle", "Put copies the bytes into the stream and returns at once; the device takes them from the front while it plays. Try Put several times quickly, with the device playing and paused.")}
          </p>
          <VolumeSlider t={t} />
        </div>
      }
      note={tx(t, "figSdlQueue_note", "The queue holds the bytes in the stream's input format, the file's own: S16, mono, 22050 Hz, 44100 bytes per second, so one copy of pickup.wav is 8820 bytes and 0.2 s. The device takes from the front in its own format and converts as it goes; SDL_GetAudioStreamQueued counts the input bytes still waiting.")}
    >
      <div ref={ref} className="p-3 md:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={tx(t, "figSdlQueue_aria", "an audio stream's queue feeding a playback device")}>
          <rect x={8} y={qy - 6} width={128} height={qh + 12} rx={6} fill="var(--surface)" stroke={paused ? C.red : C.green} strokeWidth={1.5} />
          <text x={72} y={qy + 12} textAnchor="middle" style={{ fontSize: 11, fill: C.fg, fontWeight: 600 }}>{tx(t, "figSdlQueue_device", "device")}</text>
          <text x={72} y={qy + 28} textAnchor="middle" style={{ fontSize: 9.5, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>F32 · {devRate} Hz</text>
          <text x={72} y={qy + 42} textAnchor="middle" style={{ fontSize: 9.5, fill: paused ? C.red : C.green, fontFamily: "var(--font-mono, monospace)" }}>{paused ? tx(t, "figSdlQueue_short0", "paused") : tx(t, "figSdlQueue_short1", "playing")}</text>
          <path d={`M ${qx - 6} ${qy + qh / 2} L 142 ${qy + qh / 2}`} stroke={paused ? C.muted : C.green} strokeWidth={2} strokeDasharray={paused ? "4 3" : undefined} />
          <path d={`M 142 ${qy + qh / 2} l 7 -5 v 10 z`} fill={paused ? C.muted : C.green} />

          <text x={qx} y={18} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>{tx(t, "figSdlQueue_queue", "stream queue · S16 mono 22050 Hz")}</text>
          <rect x={qx} y={qy} width={qw} height={qh} fill="#00000033" stroke="var(--border)" />
          {Array.from({ length: MAX_S * 2 + 1 }, (_, i) => (
            <g key={i}>
              <line x1={qx + i * pxs / 2} x2={qx + i * pxs / 2} y1={qy + qh} y2={qy + qh + 4} stroke={C.axis} />
              <text x={qx + i * pxs / 2} y={qy + qh + 15} textAnchor="middle" style={{ fontSize: 9, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>{(i / 2).toFixed(1)} s</text>
            </g>
          ))}
          {segs.map((s, i) => (
            <g key={i}>
              <rect x={s.x} y={qy + 2} width={Math.max(0, s.w - 1)} height={qh - 4} fill={i === 0 && !paused ? `${C.sky}33` : "#ffffff10"} stroke={C.sky} strokeOpacity={0.6} />
              {env.map((m, c) => {
                const x = s.x + c - s.cut;
                if (x < s.x || x > s.x + s.w - 1) return null;
                const h = m * (qh - 8);
                return <line key={c} x1={x} x2={x} y1={qy + qh / 2 - h / 2} y2={qy + qh / 2 + h / 2} stroke={C.sky} strokeOpacity={0.85} />;
              })}
            </g>
          ))}
          {hidden > 0 && <text x={qx + qw - 4} y={qy - 6} textAnchor="end" style={{ fontSize: 10, fill: C.amber }}>+{hidden.toFixed(1)} s {tx(t, "figSdlQueue_more", "more")}</text>}
          {queued === 0 && <text x={qx + qw / 2} y={qy + qh / 2 + 4} textAnchor="middle" style={{ fontSize: 11, fill: C.muted }}>{tx(t, "figSdlQueue_empty", "empty: the device plays silence")}</text>}
        </svg>
      </div>
    </Figure>
  );
}

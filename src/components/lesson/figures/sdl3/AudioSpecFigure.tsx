"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, Choice, C } from "@/components/lesson/kit/figure";
import { audio, startAudio } from "@/components/lesson/kit/audio/context";
import { VolumeSlider } from "@/components/lesson/kit/audio/VolumeSlider";
import { usePickup, type Wav } from "./pickupWav";

// ── What this figure shows ────────────────────────────────────────────────────
// The SDL_AudioSpec you give a stream is the only thing that says what your
// bytes mean. The 8820 bytes of pickup.wav are read with the spec picked
// here: U8 → (b − 128) / 128, S16 → s / 32768, F32 → the 4 bytes as a float
// (non-numbers become 0 and everything is clamped to ±1, as SDL's mix clamps);
// interleaved channels; freq sample frames per second. The top lane is the
// whole sound on one time axis, the bottom one 3 ms of channel 0 with its
// samples as dots, over what the file really holds (grey). Play hears it.

type Fmt = "U8" | "S16" | "F32";
const BYTES: Record<Fmt, number> = { U8: 1, S16: 2, F32: 4 };
const RATES = [11025, 22050, 44100, 48000] as const;
const T_MAX = 0.8, Z0 = 0.03, Z1 = 0.033;        // overview axis, zoom window (seconds)

/** The file's bytes as the stream would read them with this spec: one Float32Array per channel. */
function decode(w: Wav, fmt: Fmt, ch: number) {
  const b = BYTES[fmt], frames = Math.floor(w.bytes.byteLength / (b * ch));
  const v = new DataView(w.bytes.buffer, w.bytes.byteOffset, w.bytes.byteLength);
  const out = Array.from({ length: ch }, () => new Float32Array(frames));
  for (let i = 0; i < frames; i++) for (let c = 0; c < ch; c++) {
    const o = (i * ch + c) * b;
    let s = fmt === "U8" ? (v.getUint8(o) - 128) / 128 : fmt === "S16" ? v.getInt16(o, true) / 32768 : v.getFloat32(o, true);
    if (!Number.isFinite(s)) s = 0;
    out[c][i] = Math.max(-1, Math.min(1, s));
  }
  return out;
}

export function AudioSpecFigure({ t }: { t?: TrackTranslations }) {
  const wav = usePickup();
  const [fmt, setFmt] = useState<Fmt>("S16");
  const [ch, setCh] = useState(1);
  const [freq, setFreq] = useState<number>(22050);
  const src = useRef<AudioBufferSourceNode | null>(null);
  useEffect(() => () => { try { src.current?.stop(); } catch { /* ended */ } }, []);
  const [devRate, setDevRate] = useState(48000);                // the reader's output rate, read after mount
  useEffect(() => setDevRate(audio().ctx.sampleRate), []);

  const data = useMemo(() => (wav ? decode(wav, fmt, ch) : null), [wav, fmt, ch]);
  const truth = useMemo(() => (wav ? decode(wav, "S16", 1)[0] : null), [wav]);
  const frames = data ? data[0].length : 0;
  const dur = frames / freq;
  const matches = fmt === "S16" && ch === 1 && freq === 22050;

  const play = () => {
    if (!data) return;
    const { ctx, out } = startAudio();
    try { src.current?.stop(); } catch { /* ended */ }
    const buf = ctx.createBuffer(ch, frames, freq);
    data.forEach((d, c) => buf.copyToChannel(d, c));
    const s = ctx.createBufferSource(), g = ctx.createGain();
    g.gain.value = fmt === "S16" ? 1 : 0.3;            // the wrong formats are loud noise
    s.buffer = buf;
    s.connect(g).connect(out);
    s.start();
    src.current = s;
  };

  // ── Drawing ──
  const W = 640, x0 = 40, pw = W - x0 - 10, H = 230;
  const oy = 22, oh = 70, zy = 128, zh = 80;
  const lanes = useMemo(() => {
    if (!data) return [];
    return data.map(d => {
      const cols: [number, number][] = [];
      for (let px = 0; px < pw; px++) {
        const a = Math.floor((px / pw) * T_MAX * freq), b = Math.floor(((px + 1) / pw) * T_MAX * freq);
        if (a >= d.length) break;
        let lo = 0, hi = 0;
        for (let i = a; i < Math.min(b + 1, d.length); i++) { lo = Math.min(lo, d[i]); hi = Math.max(hi, d[i]); }
        cols.push([lo, hi]);
      }
      return cols;
    });
  }, [data, freq, pw]);
  const zx = (s: number) => x0 + ((s - Z0) / (Z1 - Z0)) * pw;
  const zv = (v: number) => zy + zh / 2 - v * (zh / 2 - 4);
  const zoomPts = (d: Float32Array, rate: number) => {
    const pts: [number, number][] = [];
    for (let i = Math.ceil(Z0 * rate); i <= Math.floor(Z1 * rate) && i < d.length; i++) pts.push([zx(i / rate), zv(d[i])]);
    return pts;
  };
  const zp = data ? zoomPts(data[0], freq) : [];
  const tp = truth ? zoomPts(truth, 22050) : [];

  const why: string[] = [];
  if (matches) why.push(tx(t, "figSdlSpec_ok", "This is the file's own spec (SDL_LoadWAV reads it from the fmt chunk): 4410 frames, 0.2 s, a B5 and then an E6."));
  if (fmt === "U8") why.push(tx(t, "figSdlSpec_u8", "U8: every byte is taken as one sample. Each S16 sample becomes two, its low byte almost random: twice as many samples, mostly noise."));
  if (fmt === "F32") why.push(tx(t, "figSdlSpec_f32", "F32: every four bytes are read as one float. The bits of two S16 samples make numbers that are mostly either tiny or enormous: silence broken by clipped bursts, and half as many samples as S16."));
  if (ch === 2) why.push(tx(t, "figSdlSpec_ch", "Stereo: samples are taken in pairs, left then right. Half as many frames: at the same rate the sound lasts half as long and is an octave higher, and the two channels are the odd and even samples."));
  if (freq !== 22050) why.push(`${tx(t, "figSdlSpec_rate", "freq")} ${freq}: ${tx(t, "figSdlSpec_rate2", "the frames are played")} ${(freq / 22050).toFixed(3)} × ${freq > 22050 ? tx(t, "figSdlSpec_faster", "faster, so shorter and higher") : tx(t, "figSdlSpec_slower", "slower, so longer and lower")}${freq === 44100 ? tx(t, "figSdlSpec_oct", " (an octave up)") : freq === 11025 ? tx(t, "figSdlSpec_octDown", " (an octave down)") : ""}.`);

  return (
    <Figure
      title={tx(t, "figSdlSpec_title", "The spec is what your bytes mean")}
      head={<><Btn onClick={play}>{tx(t, "figSdlSpec_play", "play")}</Btn><Btn active={matches} onClick={() => { setFmt("S16"); setCh(1); setFreq(22050); }}>{tx(t, "figSdlSpec_file", "the file's spec")}</Btn></>}
      controls={
        <div className="space-y-3">
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-14">format</span>
            <Choice value={fmt} options={[["U8", "SDL_AUDIO_U8"], ["S16", "SDL_AUDIO_S16"], ["F32", "SDL_AUDIO_F32"]] as const} onChange={setFmt} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-14">channels</span>
            <Choice value={String(ch) as "1" | "2"} options={[["1", "1"], ["2", "2"]] as const} onChange={v => setCh(Number(v))} />
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-10 ml-3">freq</span>
            <Choice value={String(freq)} options={RATES.map(r => [String(r), String(r)] as const)} onChange={v => setFreq(Number(v))} />
          </Row>
          <Row>
            <Readout color={matches ? C.green : C.amber}>{wav?.bytes.byteLength ?? 8820} / ({freq} × {ch} × {BYTES[fmt]}) = {dur.toFixed(3)} s</Readout>
            <Readout>{frames} {tx(t, "figSdlSpec_frames", "sample frames")}</Readout>
            <Readout color={C.sky}>→ {tx(t, "figSdlSpec_dev", "your device")}: F32 · 2 ch · {devRate} Hz · ×{(devRate / freq).toFixed(3)} {tx(t, "figSdlSpec_perFrame", "frames")}</Readout>
          </Row>
          <ul className="text-[12.5px] leading-relaxed text-[var(--text-main)] list-disc pl-5 space-y-1">
            {why.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          <VolumeSlider t={t} />
        </div>
      }
      note={tx(t, "figSdlSpec_note", "The bytes never change: only the spec does. A stream cannot tell that a spec is wrong, so it converts whatever it is told. Top: the whole sound on a 0.8 s axis (pink = the right channel). Bottom: 3 ms from 30 ms on, the samples as dots, over what the file really holds in grey. The wrong formats play at a third of the volume.")}
    >
      <div className="p-3 md:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={tx(t, "figSdlSpec_aria", "the sound's waveform read with the chosen format, channels and rate")}>
          <text x={x0} y={12} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>{tx(t, "figSdlSpec_whole", "the whole sound")}</text>
          <rect x={x0} y={oy} width={pw} height={oh} fill="#00000033" stroke="var(--border)" />
          <line x1={x0} x2={x0 + pw} y1={oy + oh / 2} y2={oy + oh / 2} stroke={C.grid} />
          {lanes.map((cols, c) => cols.map(([lo, hi], px) => (
            <line key={`${c}-${px}`} x1={x0 + px + 0.5} x2={x0 + px + 0.5} y1={oy + oh / 2 - hi * (oh / 2 - 3)} y2={oy + oh / 2 - lo * (oh / 2 - 3)}
              stroke={c === 0 ? C.sky : C.pink} strokeOpacity={c === 0 ? 0.9 : 0.6} />
          )))}
          {[0, 0.2, 0.4, 0.6, 0.8].map(s => (
            <text key={s} x={x0 + (s / T_MAX) * pw} y={oy + oh + 12} textAnchor={s === T_MAX ? "end" : "middle"} style={{ fontSize: 9, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>{s.toFixed(1)} s</text>
          ))}
          <line x1={x0 + (dur / T_MAX) * pw} x2={x0 + (dur / T_MAX) * pw} y1={oy - 4} y2={oy + oh + 2} stroke={C.amber} strokeDasharray="3 2" />
          <rect x={x0 + (Z0 / T_MAX) * pw} y={oy} width={Math.max(2, ((Z1 - Z0) / T_MAX) * pw)} height={oh} fill="none" stroke={C.amber} strokeOpacity={0.8} />

          <text x={x0} y={zy - 8} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>30–33 ms · {zp.length} {tx(t, "figSdlSpec_samples", "samples")}</text>
          <rect x={x0} y={zy} width={pw} height={zh} fill="#00000033" stroke="var(--border)" />
          <line x1={x0} x2={x0 + pw} y1={zy + zh / 2} y2={zy + zh / 2} stroke={C.grid} />
          <polyline points={tp.map(p => p.join(",")).join(" ")} fill="none" stroke={C.muted} strokeOpacity={0.5} strokeWidth={1.5} />
          <polyline points={zp.map(p => p.join(",")).join(" ")} fill="none" stroke={C.sky} strokeWidth={1.2} />
          {zp.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} fill={C.sky} />)}
          <text x={x0 - 6} y={zy + 8} textAnchor="end" style={{ fontSize: 9, fill: C.muted }}>+1</text>
          <text x={x0 - 6} y={zy + zh} textAnchor="end" style={{ fontSize: 9, fill: C.muted }}>−1</text>
        </svg>
      </div>
    </Figure>
  );
}

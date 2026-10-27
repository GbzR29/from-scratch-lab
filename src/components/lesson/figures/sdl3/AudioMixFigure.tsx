"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, Slider, Sliders, C } from "@/components/lesson/kit/figure";
import { audio, startAudio } from "@/components/lesson/kit/audio/context";
import { VolumeSlider } from "@/components/lesson/kit/audio/VolumeSlider";
import { usePickup, pickupFloats, musicSample, MUSIC_RATE, MUSIC_NOTE } from "./pickupWav";

// ── What this figure shows ────────────────────────────────────────────────────
// Two streams bound to one device, as in the chapter's project: the music
// (the same triangle-wave bass the C++ get callback makes) and the sound
// effect (pickup.wav). The device mixes them the way SDL_audio.c does: each
// stream's samples times its gain (SDL_SetAudioStreamGain), added up, and
// clamped to −1…+1 (SDL_MixAudio with F32). The lanes are 0.25 s with the
// effect starting at 20 ms; red columns of the mix are where the sum went
// past ±1 and was clamped: that is the distortion you hear as clipping.
// The sound goes through the same sum and clamp (a WaveShaper clamps at ±1).

const WIN = 0.25, SFX_AT = 0.02;

const dB = (g: number) => (g <= 0 ? "−∞ dB" : `${(20 * Math.log10(g)).toFixed(1).replace("-", "−")} dB`);

export function AudioMixFigure({ t }: { t?: TrackTranslations }) {
  const wav = usePickup();
  const [gm, setGm] = useState(0.5);
  const [gs, setGs] = useState(1);
  const [playing, setPlaying] = useState(false);
  const nodes = useRef<{ music?: AudioBufferSourceNode; mg?: GainNode; sg?: GainNode; clip?: WaveShaperNode }>({});

  const sfx = useMemo(() => (wav ? pickupFloats(wav) : null), [wav]);
  const sfxRate = wav?.freq ?? 22050;

  // The graph: music → gain ┐
  //            sfx   → gain ┴→ clamp ±1 → master
  const graph = () => {
    const { ctx, out } = audio();
    const n = nodes.current;
    if (!n.clip) {
      n.clip = ctx.createWaveShaper();
      n.clip.curve = new Float32Array([-1, 1]);      // identity on −1…1, clamped outside it
      n.clip.connect(out);
      n.mg = ctx.createGain(); n.mg.connect(n.clip);
      n.sg = ctx.createGain(); n.sg.connect(n.clip);
    }
    return { ctx, n };
  };
  useEffect(() => {
    const n = nodes.current;
    if (n.mg) n.mg.gain.value = gm;
    if (n.sg) n.sg.gain.value = gs;
  }, [gm, gs]);
  useEffect(() => () => { try { nodes.current.music?.stop(); } catch { /* ended */ } }, []);

  const toggleMusic = () => {
    startAudio();
    const { ctx, n } = graph();
    n.mg!.gain.value = gm; n.sg!.gain.value = gs;
    if (playing) { try { n.music?.stop(); } catch { /* ended */ } n.music = undefined; setPlaying(false); return; }
    const len = MUSIC_NOTE * 4, buf = ctx.createBuffer(1, len, MUSIC_RATE), d = new Float32Array(len);
    for (let i = 0; i < len; i++) d[i] = musicSample(i);
    buf.copyToChannel(d, 0);
    const s = ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    s.connect(n.mg!);
    s.start();
    n.music = s;
    setPlaying(true);
  };
  const pickup = () => {
    if (!sfx) return;
    startAudio();
    const { ctx, n } = graph();
    n.mg!.gain.value = gm; n.sg!.gain.value = gs;
    const buf = ctx.createBuffer(1, sfx.length, sfxRate);
    buf.copyToChannel(sfx, 0);
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.connect(n.sg!);
    s.start();
  };

  // ── The mix over the drawn window, at 48000 Hz ──
  const N = Math.round(WIN * MUSIC_RATE);
  const mix = useMemo(() => {
    const m = new Float32Array(N), e = new Float32Array(N), sum = new Float32Array(N);
    let peak = 0, clipped = 0;
    for (let i = 0; i < N; i++) {
      m[i] = musicSample(i) * gm;
      const ts = (i / MUSIC_RATE - SFX_AT) * sfxRate;   // position in the effect, in its own frames
      if (sfx && ts >= 0 && ts < sfx.length - 1) {
        const k = Math.floor(ts), f = ts - k;
        e[i] = (sfx[k] * (1 - f) + sfx[k + 1] * f) * gs;
      }
      const s = m[i] + e[i];
      peak = Math.max(peak, Math.abs(s));
      if (Math.abs(s) > 1) clipped++;
      sum[i] = s;
    }
    return { m, e, sum, peak, clipped };
  }, [N, gm, gs, sfx, sfxRate]);

  const W = 640, x0 = 70, pw = W - x0 - 10, lh = 54, gap = 14, H = 3 * lh + 2 * gap + 22;
  // One lane: min/max per pixel column on a ±range axis; `clamp` cuts at ±1 and paints the cut columns red
  const lane = (d: Float32Array, y: number, color: string, range: number, clamp = false) => {
    const cols = [];
    for (let px = 0; px < pw; px++) {
      const a = Math.floor((px / pw) * N), b = Math.floor(((px + 1) / pw) * N);
      let lo = 0, hi = 0;
      for (let i = a; i < b; i++) { lo = Math.min(lo, d[i]); hi = Math.max(hi, d[i]); }
      const over = clamp && (hi > 1 || lo < -1);
      if (clamp) { hi = Math.min(hi, 1); lo = Math.max(lo, -1); }
      hi = Math.min(hi, range); lo = Math.max(lo, -range);
      const k = (lh / 2 - 2) / range;
      cols.push(<line key={px} x1={x0 + px + 0.5} x2={x0 + px + 0.5} y1={y + lh / 2 - hi * k} y2={y + lh / 2 - lo * k} stroke={over ? C.red : color} strokeOpacity={0.9} />);
    }
    return cols;
  };
  const label = (y: number, s: string, sub: string) => (
    <g>
      <text x={x0 - 8} y={y + lh / 2 - 2} textAnchor="end" style={{ fontSize: 10.5, fill: C.fg, fontWeight: 600 }}>{s}</text>
      <text x={x0 - 8} y={y + lh / 2 + 11} textAnchor="end" style={{ fontSize: 9, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>{sub}</text>
    </g>
  );
  const ys = [8, 8 + lh + gap, 8 + 2 * (lh + gap)];
  const pct = (100 * mix.clipped) / N;

  return (
    <Figure
      title={tx(t, "figSdlMix_title", "Two streams, one device: the mix")}
      head={<><Btn active={playing} onClick={toggleMusic}>{playing ? tx(t, "figSdlMix_stop", "stop music") : tx(t, "figSdlMix_start", "start music")}</Btn><Btn onClick={pickup}>{tx(t, "figSdlMix_pickup", "pickup sound")}</Btn></>}
      controls={
        <div className="space-y-3">
          <Sliders>
            <Slider label="music gain" value={gm} min={0} max={2} step={0.05} onChange={setGm} fmt={v => v.toFixed(2)} />
            <Slider label="sfx gain" value={gs} min={0} max={2} step={0.05} onChange={setGs} fmt={v => v.toFixed(2)} />
          </Sliders>
          <Row>
            <Readout color={C.teal}>music {dB(gm)}</Readout>
            <Readout color={C.sky}>sfx {dB(gs)}</Readout>
            <Readout color={mix.peak > 1 ? C.red : C.green}>{tx(t, "figSdlMix_peak", "peak of the sum")} {mix.peak.toFixed(2)}</Readout>
            <Readout color={mix.clipped ? C.red : C.muted}>{tx(t, "figSdlMix_clipped", "clamped")} {pct.toFixed(1)} %</Readout>
          </Row>
          <p className="text-[12.5px] leading-relaxed text-[var(--text-main)]">
            {mix.peak > 1
              ? tx(t, "figSdlMix_over", "The sum goes past ±1. SDL clamps it, so the tops of the wave are cut flat (red): a harsh, crackling sound while both play. Lower a gain until the peak is under 1.")
              : tx(t, "figSdlMix_ok", "The sum stays inside ±1, so nothing is clamped. Raise both gains, or start the music and press the pickup sound, to hear what clipping does.")}
          </p>
          <VolumeSlider t={t} />
        </div>
      }
      note={tx(t, "figSdlMix_note", "Each lane is 0.25 s at 48000 Hz, with the pickup sound starting at 20 ms. A gain multiplies every sample; a gain of 2 is +6 dB, about twice as loud, and 0.5 is −6 dB. The dashed red line in the top lanes is +1. The page's volume slider acts after the clamp, so it makes clipping quieter but cannot remove it.")}
    >
      <div className="p-3 md:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={tx(t, "figSdlMix_aria", "two sound waves and their clamped sum")}>
          {ys.map((y, i) => (
            <g key={i}>
              <rect x={x0} y={y} width={pw} height={lh} fill="#00000033" stroke="var(--border)" />
              <line x1={x0} x2={x0 + pw} y1={y + lh / 2} y2={y + lh / 2} stroke={C.grid} />
            </g>
          ))}
          {label(ys[0], "music", `× ${gm.toFixed(2)}`)}
          {label(ys[1], "sfx", `× ${gs.toFixed(2)}`)}
          {label(ys[2], tx(t, "figSdlMix_device", "device"), "clamp ±1")}
          {lane(mix.m, ys[0], C.teal, 2)}
          {lane(mix.e, ys[1], C.sky, 2)}
          {lane(mix.sum, ys[2], C.amber, 1, true)}
          <line x1={x0} x2={x0 + pw} y1={ys[0] + lh / 4 + 0.5} y2={ys[0] + lh / 4 + 0.5} stroke={C.red} strokeOpacity={0.35} strokeDasharray="3 3" />
          <line x1={x0} x2={x0 + pw} y1={ys[1] + lh / 4 + 0.5} y2={ys[1] + lh / 4 + 0.5} stroke={C.red} strokeOpacity={0.35} strokeDasharray="3 3" />
          {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map(s => (
            <text key={s} x={x0 + (s / WIN) * pw} y={H - 4} textAnchor={s === WIN ? "end" : "middle"} style={{ fontSize: 9, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>{(s * 1000).toFixed(0)} ms</text>
          ))}
        </svg>
      </div>
    </Figure>
  );
}

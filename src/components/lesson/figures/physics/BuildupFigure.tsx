"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// A double-slit experiment run with one particle at a time. Each particle
// lands at ONE point on the screen, picked at random with the chance given by
// |ψ|², the square of the wave that went through both slits:
//   I(y) ∝ cos²(π F y) · sinc²(π G y)  (two-slit fringes × one-slit envelope).
// Dot by dot, the fringes appear. The histogram on the right counts the hits;
// the line over it is |ψ|².
// The "which-slit detector" shines light at the slits so each particle is
// seen at one of them (dots coloured by the slit). The waves through the two
// slits no longer add: the chance is |ψ₁|² + |ψ₂|², and the fringes vanish.
// The same pattern is seen with photons, electrons and C₆₀ molecules; only
// the scale changes (λ = h/p). Slow rates show each particle's flight.

const W = 560, H = 300;
const BX = 96, SX = 150, SX1 = 400;             // barrier x, screen strip x-range
const HX0 = 412, HX1 = 548, BINS = 60;
const F = 4.2, G = 1.25;                        // fringes and envelope across the screen (y ∈ [−1, 1])
const SY = (y: number) => H / 2 + y * (H / 2 - 12);
const PARTICLES = [
  ["photon", "photons", "633 nm", "#f87171"],
  ["electron", "electrons", "5.4 pm", "#7dd3fc"],
  ["c60", "C₆₀ molecules", "2.5 pm", "#fbbf24"],
] as const;
type Kind = typeof PARTICLES[number][0];

const sinc2 = (x: number) => (Math.abs(x) < 1e-9 ? 1 : (Math.sin(x) / x) ** 2);
const chance = (y: number, which: boolean) => sinc2(Math.PI * G * y) * (which ? 0.5 : Math.cos(Math.PI * F * y) ** 2);

export function BuildupFigure({ t }: { t?: TrackTranslations }) {
  const [kind, setKind] = useState<Kind>("electron");
  const [which, setWhich] = useState(false);
  const [logRate, setLogRate] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [, setTick] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sim = useRef({ bins: new Array(BINS).fill(0) as number[], n: 0, acc: 0, rnd: mulberry32(3), flying: [] as { y: number; s: number; age: number }[] });
  const vis = useVisible<HTMLDivElement>();
  const rate = 10 ** logRate;
  const color = PARTICLES.find(p => p[0] === kind)![3];

  const clear = () => {
    const s = sim.current;
    s.bins.fill(0); s.n = 0; s.acc = 0; s.flying = [];
    const ctx = canvas.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setTick(k => (k + 1) & 0xffff);
  };

  const land = (y: number, slit: number) => {
    const s = sim.current, ctx = canvas.current?.getContext("2d");
    s.n++;
    s.bins[Math.min(BINS - 1, Math.floor(((y + 1) / 2) * BINS))]++;
    if (!ctx) return;
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    ctx.fillStyle = which ? (slit ? "#38bdf8" : "#f59e0b") : color;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(s.rnd() * (cw - 2), ((y + 1) / 2) * (ch - 2), 1.6, 1.6);
    ctx.globalAlpha = 1;
  };

  useFrame(playing && vis.on, dt => {
    const s = sim.current;
    s.acc += dt * rate;
    while (s.acc >= 1 && s.n < 60000) {
      s.acc -= 1;
      let y = 0;
      for (let tries = 0; tries < 200; tries++) {        // rejection sampling of |ψ|²
        y = s.rnd() * 2 - 1;
        if (s.rnd() < chance(y, which) / (which ? 0.5 : 1)) break;
      }
      const slit = which ? (s.rnd() < 0.5 ? 0 : 1) : -1;
      if (rate < 12) s.flying.push({ y, s: slit, age: 0 });
      else land(y, slit);
    }
    for (const f of s.flying) { f.age += dt * 1.6; if (f.age >= 1) land(f.y, f.s); }
    s.flying = s.flying.filter(f => f.age < 1);
    setTick(k => (k + 1) & 0xffff);
  });

  const s = sim.current;
  const peak = Math.max(1, ...s.bins);
  const theory = Array.from({ length: 121 }, (_, k) => {
    const y = -1 + k / 60;
    return `${k ? "L" : "M"}${(HX0 + (HX1 - HX0) * chance(y, which) / (which ? 0.5 : 1)).toFixed(1)},${SY(y).toFixed(1)}`;
  }).join("");
  const binSum = s.bins.reduce((a, b) => a + b, 0);
  const meanTheory = (() => { let m = 0; for (let k = 0; k < 400; k++) m += chance(-1 + (k + 0.5) / 200, which) / (which ? 0.5 : 1); return m / 400; })();
  const scale = binSum ? (binSum / BINS) / meanTheory : 1;     // histogram height that matches the theory curve
  const slitY = [H / 2 - 22, H / 2 + 22];

  return (
    <Figure title={tx(t, "figPhBuild_title", "The double slit, one particle at a time")}
      head={<Btn active={which} onClick={() => { setWhich(w => !w); clear(); }}>{tx(t, "figPhBuild_which", "which-slit detector")}</Btn>}
      controls={<>
        <Row>
          <Choice value={kind} onChange={k => { setKind(k); clear(); }}options={PARTICLES.map(([k, name]) => [k, tx(t, `figPhBuild_${k}`, name)] as const)} />
        </Row>
        <Slider label={tx(t, "figPhBuild_rate", "particles per second")} value={logRate} min={0} max={3.3} step={0.05} onChange={setLogRate} fmt={v => f2(10 ** v, 0)} width="w-32" />
        <Row>
          <Readout>{`${tx(t, "figPhBuild_count", "particles so far")}: ${s.n}`}</Readout>
          <Readout color={C.amber}>{`λ = h/p = ${PARTICLES.find(p => p[0] === kind)![2]}`}</Readout>
          <Readout color={which ? C.red : C.green}>{which
            ? tx(t, "figPhBuild_noFringe", "path known: no fringes")
            : tx(t, "figPhBuild_fringe", "path unknown: fringes")}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhBuild_note", "Particles leave the source one at a time, with long gaps in between, so there is never more than one in the apparatus. Each one lands at a single point, like a particle. Slow the rate right down and watch: the first dots look random. Speed it up and stripes appear, the same bright and dark fringes that waves through two slits make. The pattern is a pattern of chances: the wave goes through both slits, interferes with itself, and the square of its height, |ψ|², tells how likely each point is. Switch the particle: photons, electrons and even C₆₀ molecules of 60 carbon atoms all do it, with their own wavelength λ = h/p. Now turn on the which-slit detector, which catches each particle at one slit (the dots are coloured by the slit it was seen at). The fringes disappear and you get one smooth hump: the two slits' blobs, lying almost on top of each other. Knowing the path, even in principle, destroys the interference.")}>
      <div ref={vis.ref}>
        <div className="relative">
          <canvas ref={canvas} width={250} height={276} className="absolute"
            style={{ background: "#05070c", left: `${(SX / W) * 100}%`, top: `${(12 / H) * 100}%`, width: `${((SX1 - SX) / W) * 100}%`, height: `${((H - 24) / H) * 100}%` }} />
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto relative">
            {/* source and barrier */}
            <rect x={12} y={H / 2 - 14} width={26} height={28} rx={4} fill={C.axis} />
            <T x={25} y={H / 2 + 26} anchor="middle" size={8}>{tx(t, "figPhBuild_src", "source")}</T>
            <rect x={BX - 3} y={10} width={6} height={H - 20} fill={C.fg} />
            {slitY.map((y, i) => <rect key={i} x={BX - 4} y={y - 5} width={8} height={10} fill="var(--code-bg)" />)}
            {which && slitY.map((y, i) => (
              <g key={i}>
                <circle cx={BX + 16} cy={y} r={5} fill="none" stroke={i ? "#38bdf8" : "#f59e0b"} strokeWidth={1.5} />
                <circle cx={BX + 16} cy={y} r={1.8} fill={i ? "#38bdf8" : "#f59e0b"} />
              </g>
            ))}
            {s.flying.map((f, i) => {
              const a = f.age;
              const sy = which ? slitY[f.s] : H / 2;
              const x = a < 0.4 ? 38 + (a / 0.4) * (BX - 38) : BX + ((a - 0.4) / 0.6) * (SX - BX);
              const y = a < 0.4 ? H / 2 + (a / 0.4) * (sy - H / 2) : sy + ((a - 0.4) / 0.6) * (SY(f.y) - sy);
              // before the slits the particle is a spreading wave, not a dot: draw only where it can be seen
              return a < 0.4 || which
                ? <circle key={i} cx={x} cy={y} r={3} fill={color} />
                : <circle key={i} cx={x} cy={H / 2} r={6 + 120 * (a - 0.4)} fill="none" stroke={color} strokeOpacity={0.5 * (1 - a)} />;
            })}
            <rect x={SX} y={12} width={SX1 - SX} height={H - 24} fill="none" stroke={C.grid} />
            <T x={SX + 4} y={H - 2} size={8}>{tx(t, "figPhBuild_screen", "screen (each dot = one particle)")}</T>
            {/* histogram */}
            {s.bins.map((b, i) => {
              const y0 = SY(-1 + (2 * i) / BINS), y1 = SY(-1 + (2 * (i + 1)) / BINS);
              return <rect key={i} x={HX0} y={y0} width={(HX1 - HX0) * Math.min(1.2, b / scale)} height={Math.max(0.5, y1 - y0 - 0.6)} fill={color} opacity={0.55} />;
            })}
            <path d={theory} fill="none" stroke={C.fg} strokeWidth={1.3} strokeDasharray={s.n < 300 ? "3 3" : undefined} opacity={0.8} />
            <line x1={HX0} y1={12} x2={HX0} y2={H - 12} stroke={C.axis} />
            <T x={HX0 + 2} y={10} size={8}>{peak > 1 ? tx(t, "figPhBuild_hist", "hits per strip, and |ψ|²") : "|ψ|²"}</T>
          </svg>
        </div>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={clear}
          readout={`N = ${s.n}`} />
      </div>
    </Figure>
  );
}

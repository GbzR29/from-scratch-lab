"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, useRerender, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Maxwell's equations solved live along one line in empty space. An antenna
// at the left drives the electric field up and down. The two curl equations
// in one dimension,
//   ∂E/∂t = −(1/μ₀ε₀) ∂B/∂x   (Ampère–Maxwell, the displacement current)
//   ∂B/∂t = −∂E/∂x            (Faraday)
// are stepped on a grid (the Yee scheme, in units where c = 1 cell per step;
// at exactly that step the scheme has no numerical error for this 1-D wave).
// E (red) is drawn vertical, B (blue) along the depth axis, towards the
// viewer: each makes the other further along, and the pair travels at c.
// "break it: no displacement current" drops Maxwell's term from the first
// equation: a changing B still makes E (Faraday), but a changing E no longer
// makes B, the chain is cut and the fields stay stuck at the antenna.

const W = 560, H = 290;
const N = 240, X0 = 56, DX = 2;                 // cells, left edge, px per cell
const Y0 = 140, AMP = 62;
const DEPTH = { x: -0.42, y: 0.5 };             // screen direction of the axis towards the viewer
const STEPS_PER_FRAME = 1;

export function EmWaveFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<"wave" | "pulse">("wave");
  const [lam, setLam] = useState(60);             // wavelength in cells
  const [playing, setPlaying] = useState(true);
  const [broken, setBroken] = useState(false);
  const sim = useRef({ e: new Float64Array(N), b: new Float64Array(N), n: 0, pulseAt: -1e9 });
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();

  const source = (n: number) => {
    if (mode === "wave") return Math.sin((2 * Math.PI * n) / lam) * Math.min(1, n / lam);
    const u = (n - sim.current.pulseAt - 40) / 12;
    return Math.exp(-u * u);
  };

  useFrame(playing && vis.on, () => {
    const s = sim.current, { e, b } = s;
    for (let k = 0; k < STEPS_PER_FRAME; k++) {
      const edge = e[N - 2];
      for (let i = 0; i < N - 1; i++) b[i] -= e[i + 1] - e[i];               // Faraday
      if (!broken) for (let i = 1; i < N - 1; i++) e[i] -= b[i] - b[i - 1];   // Ampère–Maxwell
      e[N - 1] = edge;                                                        // the wave leaves on the right
      s.n++;
      e[0] = source(s.n);
    }
    rerender();
  });

  const reset = () => { const s = sim.current; s.e.fill(0); s.b.fill(0); s.n = 0; s.pulseAt = mode === "pulse" ? 0 : -1e9; rerender(); };
  const pulse = () => { sim.current.pulseAt = sim.current.n; setPlaying(true); };

  const { e, b } = sim.current;
  const X = (i: number) => X0 + i * DX;
  let ePath = "", bPath = "";
  const stems = [];
  for (let i = 0; i < N; i++) {
    // clipped for drawing: with the break on, B piles up at the antenna
    const ev = clamp(e[i], -1.4, 1.4), bv = clamp(b[i], -1.4, 1.4);
    const ex = X(i), ey = Y0 - AMP * ev;
    const bx = X(i) + AMP * bv * DEPTH.x, by = Y0 + AMP * bv * DEPTH.y;
    ePath += `${i ? "L" : "M"}${ex.toFixed(1)},${ey.toFixed(1)}`;
    bPath += `${i ? "L" : "M"}${bx.toFixed(1)},${by.toFixed(1)}`;
    if (i % 5 === 0) stems.push(
      <g key={i}>
        <line x1={ex} y1={Y0} x2={ex} y2={ey} stroke={C.red} strokeOpacity={0.35} />
        <line x1={ex} y1={Y0} x2={bx} y2={by} stroke={C.blue} strokeOpacity={0.35} />
      </g>,
    );
  }
  const q = e[0];

  return (
    <Figure title={tx(t, "figPhEm_title", "An electromagnetic wave leaving an antenna")}
      head={<Btn active={broken} onClick={() => { setBroken(v => !v); reset(); }}>{tx(t, "figPhEm_broken", "break it: no displacement current")}</Btn>}
      controls={<>
        <Row>
          <Choice value={mode} onChange={m => { setMode(m); const s = sim.current; s.e.fill(0); s.b.fill(0); s.n = 0; s.pulseAt = m === "pulse" ? 0 : -1e9; }}
            options={[["wave", tx(t, "figPhEm_wave", "steady wave")], ["pulse", tx(t, "figPhEm_pulse", "single pulse")]]} />
          {mode === "pulse" && <Btn onClick={pulse}>{tx(t, "figPhEm_send", "send a pulse")}</Btn>}
          <Btn onClick={reset}>{tx(t, "figPhEm_reset", "start again")}</Btn>
          <Btn active={!playing} onClick={() => setPlaying(p => !p)}>{playing ? tx(t, "figPhEm_pause", "pause") : tx(t, "figPhEm_play", "run")}</Btn>
        </Row>
        {mode === "wave" && (
          <Sliders>
            <Slider label={tx(t, "figPhEm_lambda", "wavelength")} value={lam} min={20} max={120} step={5} onChange={v => setLam(v)} fmt={v => f2(v / 20, 2)} />
          </Sliders>
        )}
        <Row>
          <Readout color={C.green}>{`c = 1/√(μ₀ε₀) = 2.998 × 10⁸ m/s`}</Readout>
          <Readout color={C.red}>{tx(t, "figPhEm_E", "E: vertical")}</Readout>
          <Readout color={C.blue}>{tx(t, "figPhEm_B", "B: towards you")}</Readout>
          <Readout>{tx(t, "figPhEm_ratio", "E = cB at every point")}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhEm_note", "This is Maxwell's equations being solved as you watch. The antenna pushes charge up and down, and the electric field next to it rises and falls. Faraday's law says a changing magnetic field makes an electric field, and Maxwell's addition to Ampère's law says a changing electric field makes a magnetic field: each keeps regenerating the other one step further along, and the pair sets off at the speed c, the electric field vertical, the magnetic field across it, both at right angles to the direction of travel and always in step. Make the wavelength shorter and the wave still moves at the same speed: every colour of light, every radio wave, travels at c in empty space. Send a single pulse and watch it go without spreading or fading: nothing needs to be there to carry it. Now break it by removing the displacement current: a changing electric field no longer makes a magnetic field, the chain is cut, and nothing leaves the antenna. Without that one term there would be no light. Slowed down enormously: real light would cross a stadium in under a microsecond.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={X0} y1={Y0} x2={W - 12} y2={Y0} stroke={C.axis} />
          <line x1={X0 - 34 * DEPTH.x} y1={Y0 - 34 * DEPTH.y} x2={X0 + 60 * DEPTH.x} y2={Y0 + 60 * DEPTH.y} stroke={C.axis} strokeDasharray="3 3" />
          <line x1={X0} y1={Y0 - AMP - 14} x2={X0} y2={Y0 + AMP + 14} stroke={C.axis} strokeDasharray="3 3" />
          {stems}
          <path d={bPath} fill="none" stroke={C.blue} strokeWidth={2} />
          <path d={ePath} fill="none" stroke={C.red} strokeWidth={2} />
          {/* the antenna and its charge */}
          <line x1={X0 - 22} y1={Y0 - AMP} x2={X0 - 22} y2={Y0 + AMP} stroke={C.fg} strokeWidth={3} />
          <circle cx={X0 - 22} cy={Y0 - AMP * 0.8 * q} r={6} fill={C.amber} />
          <T x={X0 - 22} y={Y0 + AMP + 26} anchor="middle" size={8.5} color={C.fg}>{tx(t, "figPhEm_antenna", "antenna")}</T>
          <T x={W - 14} y={Y0 - 6} anchor="end" size={8.5} color={C.fg}>{tx(t, "figPhEm_travel", "direction of travel →")}</T>
          <T x={X0 + 6} y={Y0 - AMP - 6} size={8.5} color={C.red}>E</T>
          <T x={X0 + 60 * DEPTH.x - 12} y={Y0 + 60 * DEPTH.y + 4} size={8.5} color={C.blue}>B</T>
          {broken && <T x={W / 2} y={H - 14} anchor="middle" size={9} color={C.red}>{tx(t, "figPhEm_stuck", "without ε₀ dΦ_E/dt, the fields cannot leave the antenna")}</T>}
        </svg>
      </div>
    </Figure>
  );
}

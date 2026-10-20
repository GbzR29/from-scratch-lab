"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Expanding space, seen from any galaxy. 49 galaxies sit at fixed comoving
// positions x in a periodic box (a stand-in for an endless, uniform
// universe); their real distances are a(t)·x, with the scale factor
// a(t) = e^(Ht) growing from 1 to 2.4 (H = ln 2.4 / 10 per second). Pick a
// home galaxy: the view is centred on it, arrows show each galaxy's velocity
// relative to home, and the plot gives speed against distance: a straight
// line through zero, Hubble's law v = H d, whichever galaxy is home.
// "send light" fires a photon from a distant galaxy towards home. It moves
// at c through space (comoving rate c/a), and its wavelength is drawn in
// proportion to a, so it arrives stretched by a_arrive/a_emit = 1 + z.
// "break it: an explosion" replaces the expansion of space by an explosion
// in static space: every galaxy flies out of one point at its own constant
// speed. Hubble's law still holds from any galaxy (speeds and separations
// both grow in proportion), but now there is a centre and an edge, and a
// galaxy near the edge sees almost all the others on one side of its sky.

const W = 560, H = 290, NG = 49, BOX = 2.2, HRATE = Math.log(2.4) / 10, CLIGHT = 0.2;
const LX = 150, LY = 140, SCALE = 105, VIEW = 132;

export function ExpansionFigure({ t }: { t?: TrackTranslations }) {
  const [boom, setBoom] = useState(false);
  const [home, setHome] = useState(24);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();

  const gal = useRef((() => {
    const rnd = mulberry32(21), list: { x: number; y: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < NG; i++) {
      const gx = ((i % 7) + 0.5) / 7 - 0.5, gy = (Math.floor(i / 7) + 0.5) / 7 - 0.5;
      const x = (gx + (rnd() - 0.5) * 0.08) * BOX, y = (gy + (rnd() - 0.5) * 0.08) * BOX;
      // explosion speeds: uniform in a disc, so the cloud is uniform inside its edge
      const r = Math.sqrt(rnd()) * 0.1, a = rnd() * 2 * Math.PI;
      list.push({ x, y, vx: r * Math.cos(a), vy: r * Math.sin(a) });
    }
    return list;
  })());
  const sim = useRef({ tau: 0, photon: null as null | { from: number; chi: number; aEmit: number; done: boolean; z: number } });

  useFrame(playing && vis.on, dt => {
    const s = sim.current;
    s.tau = Math.min(10, s.tau + dt);
    const a = Math.exp(HRATE * s.tau);
    const p = s.photon;
    if (p && !p.done) {
      p.chi -= (CLIGHT / a) * dt;
      if (p.chi <= 0) { p.chi = 0; p.done = true; p.z = a / p.aEmit - 1; }
    }
    if (s.tau >= 10) setPlaying(false);
    rerender();
  });

  const s = sim.current;
  const a = Math.exp(HRATE * s.tau), Hnow = HRATE;
  const T0 = 11.4;                                                  // explosion age at the start, so 1/t ≈ H
  const age = T0 + s.tau;

  // positions and velocities relative to home
  const rel = gal.current.map((g, i) => {
    if (boom) {
      const h = gal.current[home];
      return { i, dx: (g.vx - h.vx) * age, dy: (g.vy - h.vy) * age, vx: g.vx - h.vx, vy: g.vy - h.vy };
    }
    const h = gal.current[home];
    let dx = g.x - h.x, dy = g.y - h.y;
    dx -= BOX * Math.round(dx / BOX); dy -= BOX * Math.round(dy / BOX);
    return { i, dx: a * dx, dy: a * dy, vx: Hnow * a * dx, vy: Hnow * a * dy };
  });
  const centre = boom ? { x: -gal.current[home].vx * age, y: -gal.current[home].vy * age } : null;
  const visible = rel.filter(g => Math.hypot(g.dx, g.dy) * SCALE < VIEW);
  const left = rel.filter(g => g.i !== home && g.dx < 0).length, right = rel.filter(g => g.i !== home && g.dx > 0).length;

  const send = () => {
    // the farthest galaxy still well inside the view
    let best = -1, bd = 0;
    for (const g of rel) { const d = Math.hypot(g.dx, g.dy) * SCALE; if (d < VIEW * 0.92 && d > bd) { bd = d; best = g.i; } }
    if (best < 0) return;
    const g = rel.find(q => q.i === best)!;
    sim.current.photon = { from: best, chi: Math.hypot(g.dx, g.dy) / a, aEmit: a, done: false, z: 0 };
    if (!playing) setPlaying(true);
  };
  const reset = () => { sim.current = { tau: 0, photon: null }; setPlaying(true); rerender(); };

  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget, pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    let best = -1, bd = 14;
    for (const g of rel) { const d = Math.hypot(LX + g.dx * SCALE - p.x, LY - g.dy * SCALE - p.y); if (d < bd) { bd = d; best = g.i; } }
    if (best >= 0) { setHome(best); sim.current.photon = null; }
  };

  // photon drawn along the line from its source to home
  const ph = s.photon;
  let photonPath = "";
  if (ph && !ph.done) {
    const src = rel.find(q => q.i === ph.from)!, L = Math.hypot(src.dx, src.dy);
    const ux = src.dx / L, uy = src.dy / L, r = ph.chi * a, lam = 0.08 * (a / ph.aEmit);
    for (let i = 0; i <= 40; i++) {
      const u = r + (i / 40 - 0.5) * 3 * lam, w = Math.sin(((i / 40) * 3) * 2 * Math.PI) * 5 * Math.exp(-(((i / 40) - 0.5) ** 2) * 8);
      photonPath += `${i ? "L" : "M"}${(LX + u * ux * SCALE - uy * w).toFixed(1)},${(LY - u * uy * SCALE - ux * w).toFixed(1)}`;
    }
  }
  const zNow = ph ? (ph.done ? ph.z : a / ph.aEmit - 1) : 0;

  // speed–distance plot
  const PX0 = 330, PX1 = 540, PY0 = 30, PY1 = 230, DMAX = 3.2, VMAX = 0.3;
  const X = (d: number) => PX0 + (d / DMAX) * (PX1 - PX0), Y = (v: number) => PY1 - (v / VMAX) * (PY1 - PY0);
  const slope = boom ? 1 / age : Hnow;

  return (
    <Figure title={tx(t, "figPhExp_title", "Expanding space: every galaxy sees the others flee")}
      head={<Btn active={boom} onClick={() => { setBoom(b => !b); reset(); }}>{tx(t, "figPhExp_broken", "break it: an explosion")}</Btn>}
      controls={<>
        <Row>
          {!boom && <Btn onClick={send}>{tx(t, "figPhExp_send", "send light from a far galaxy")}</Btn>}
          <span className="text-[11px] text-[var(--text-muted)]">{tx(t, "figPhExp_pick", "click any galaxy to stand on it")}</span>
        </Row>
        <Row>
          <Readout>{boom ? `${tx(t, "figPhExp_age", "time since the explosion")}: ${f2(age, 1)}` : `${tx(t, "figPhExp_a", "scale factor")} a = ${f2(a, 2)}`}</Readout>
          <Readout color={C.green}>{`H = ${f2(slope, 3)} ${tx(t, "figPhExp_perS", "per second")}`}</Readout>
          <Readout color={boom && Math.abs(left - right) > 12 ? C.red : C.fg}>{`${tx(t, "figPhExp_sky", "galaxies to the left / right")}: ${left} / ${right}`}</Readout>
          {ph && <Readout color={C.red}>{`${ph.done ? tx(t, "figPhExp_arrived", "light arrived") : tx(t, "figPhExp_travel", "light on its way")}: 1 + z = ${f2(1 + zNow, 2)}`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhExp_note", "Every distance between galaxies grows by the same factor a(t), the scale factor. So a galaxy twice as far away gets twice as far away in the same time: it recedes twice as fast. That is Hubble's law, v = H d, and the plot shows it as a straight line. Now click another galaxy and stand on it: the picture looks the same, everyone sees everyone else rushing away, and nobody is at the centre. The galaxies are not flying through space; space between them is growing (this box repeats endlessly, as a stand-in for an infinite universe). Send light from a far galaxy: as it crosses growing space its waves are stretched along with it, so it arrives redder, with 1 + z equal to how much the universe grew while it travelled. Now break it with an ordinary explosion: galaxies flung from one point through static space. Surprisingly, Hubble's law still holds from every galaxy. What gives the explosion away is the edge: stand on a galaxy near it and nearly all the others are on one side of the sky. Our sky looks the same in every direction, which is why astronomers read Hubble's law as the expansion of space and not as debris from a blast.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onClick={pick} style={{ cursor: "pointer" }}>
          <defs>
            <clipPath id="figPhExpClip"><circle cx={LX} cy={LY} r={VIEW} /></clipPath>
          </defs>
          <circle cx={LX} cy={LY} r={VIEW} fill={C.bg} stroke={C.axis} />
          <g clipPath="url(#figPhExpClip)">
            {centre && <g>
              <circle cx={LX + centre.x * SCALE} cy={LY - centre.y * SCALE} r={0.1 * age * SCALE} fill="none" stroke={C.red} strokeDasharray="4 3" />
              <path d={`M${LX + centre.x * SCALE - 5},${LY - centre.y * SCALE - 5}L${LX + centre.x * SCALE + 5},${LY - centre.y * SCALE + 5}M${LX + centre.x * SCALE + 5},${LY - centre.y * SCALE - 5}L${LX + centre.x * SCALE - 5},${LY - centre.y * SCALE + 5}`} stroke={C.red} strokeWidth={1.6} />
            </g>}
            {rel.map(g => {
              const x = LX + g.dx * SCALE, y = LY - g.dy * SCALE, me = g.i === home;
              return (
                <g key={g.i}>
                  {!me && <line x1={x} y1={y} x2={x + g.vx * SCALE * 3} y2={y - g.vy * SCALE * 3} stroke={C.green} strokeWidth={1} opacity={0.7} />}
                  <ellipse cx={x} cy={y} rx={me ? 6 : 4} ry={me ? 3.6 : 2.4} transform={`rotate(${(g.i * 47) % 180} ${x} ${y})`} fill={me ? C.amber : C.purple} opacity={me ? 1 : 0.85} />
                </g>
              );
            })}
            {photonPath && <path d={photonPath} fill="none" stroke={C.red} strokeWidth={1.8} />}
          </g>
          <T x={LX} y={LY + VIEW + 14} anchor="middle" size={8} color={C.amber}>{tx(t, "figPhExp_home", "home galaxy (centre of the view)")}</T>
          {centre && <T x={14} y={18} size={8} color={C.red}>{tx(t, "figPhExp_centre", "× the point the explosion started from")}</T>}

          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          <line x1={X(0)} y1={Y(0)} x2={X(Math.min(DMAX, VMAX / slope))} y2={Y(Math.min(VMAX, slope * DMAX))} stroke={C.green} strokeDasharray="4 3" />
          {visible.filter(g => g.i !== home).map(g => {
            const d = Math.hypot(g.dx, g.dy), v = Math.hypot(g.vx, g.vy);
            return d < DMAX && v < VMAX ? <circle key={g.i} cx={X(d)} cy={Y(v)} r={2.6} fill={C.purple} /> : null;
          })}
          <T x={PX0} y={PY0 - 10} size={8}>{tx(t, "figPhExp_plot", "speed away from home against distance")}</T>
          <T x={PX1} y={PY1 + 14} anchor="end" size={8}>{tx(t, "figPhExp_dAx", "distance d")}</T>
          <T x={PX0 + 6} y={PY0 + 8} size={8}>{"v"}</T>
          <T x={X(DMAX * 0.55)} y={Y(Math.min(VMAX, slope * DMAX * 0.55)) - 8} size={8} color={C.green}>{"v = H d"}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => (s.tau >= 10 ? reset() : setPlaying(p => !p))} onReset={reset}
          readout={`t = ${f2(s.tau, 1)} s`} />
      </div>
    </Figure>
  );
}

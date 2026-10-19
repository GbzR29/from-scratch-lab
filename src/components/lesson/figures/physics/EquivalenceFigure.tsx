"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, C, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Einstein's box. Inside a closed, windowless box, a ball is let go and a
// laser fires a pulse straight across. Four situations:
//  • rocket: the box accelerates upwards at g in empty space;
//  • on Earth: the box sits on the ground in gravity g;
//  • falling: the box falls freely near the Earth;
//  • floating: the box drifts in empty space, far from everything.
// Left, what the person inside sees; right, the same box seen from outside:
// by someone floating in space (rocket, floating) or standing on the ground
// (on Earth, falling). Inside, the rocket and the Earth look identical (the ball falls, the
// light bends down), and so do falling and floating (both go straight): the
// equivalence principle. For the rocket, the outside view shows the reason:
// the ball and the light go straight, the floor comes up to meet them. On
// Earth, the principle then forces light to bend in gravity too.
// Drawn hugely exaggerated: light at 112 px/s, g = 62.5 px/s². Across a real
// 2 m box, light drops about 2 × 10⁻¹⁶ m.
// "break it: light ignores gravity": on Earth the light goes straight, and
// the person inside could now tell gravity from acceleration.

const W = 560, H = 300;
const BOX = 180, TMAX = 1.6, CS = BOX / TMAX, GS = (2 * 80) / (TMAX * TMAX);
const LX = 40, RX = 320, TOPY = 30;
type Mode = "rocket" | "earth" | "fall" | "float";

export function EquivalenceFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("rocket");
  const [broken, setBroken] = useState(false);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && vis.on, dt => setTime(v => (v + dt) % (TMAX + 0.6)));

  const tt = Math.min(time, TMAX);
  const drop = 0.5 * GS * tt * tt;                       // how far things fall relative to an accelerating box
  const accel = mode === "rocket" || mode === "earth";
  const lightBends = mode === "rocket" || (mode === "earth" && !broken);
  // inside view (relative to the box)
  const ballIn = accel ? drop : 0;
  // outside view: box offset (down = +) and absolute drops
  const boxOut = mode === "rocket" ? -drop : mode === "fall" ? drop : 0;
  const ballOut = mode === "earth" || mode === "fall" ? drop : 0;
  const lightOut = (mode === "earth" && !broken) || mode === "fall" ? drop : 0;
  const yBall0 = 40, yLight0 = 70;

  const scene = (x0: number, boxDy: number, ballDy: number, lightDy: (s: number) => number, outside: boolean) => {
    const path = Array.from({ length: 31 }, (_, i) => {
      const s = (i / 30) * tt;
      return `${i ? "L" : "M"}${(x0 + 10 + CS * s).toFixed(1)},${(TOPY + boxDy * 0 + yLight0 + lightDy(s)).toFixed(1)}`;
    }).join("");
    return <g>
      <rect x={x0} y={TOPY + boxDy} width={BOX + 20} height={BOX} rx={4} fill={C.fg} fillOpacity={0.04} stroke={C.fg} strokeWidth={1.8} />
      {accel && mode === "rocket" && outside && <path d={`M${x0 + 70},${TOPY + boxDy + BOX} l15,${18 + 6 * Math.sin(time * 40)} l15,${-18 - 6 * Math.sin(time * 40)}`} fill={C.orange} opacity={0.8} />}
      <rect x={x0 + 2} y={TOPY + boxDy + yLight0 - 6} width={8} height={12} fill={C.red} />
      <path d={path} fill="none" stroke={C.red} strokeWidth={2} transform={outside ? undefined : `translate(0, ${boxDy})`} />
      <circle cx={x0 + 40} cy={TOPY + (outside ? 0 : boxDy) + yBall0 + ballDy} r={8} fill={C.sky} />
    </g>;
  };

  const same = (mode === "rocket" || mode === "earth") ? !broken : true;

  return (
    <Figure title={tx(t, "figPhEquiv_title", "Inside a closed box: gravity or acceleration?")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhEquiv_broken", "break it: light ignores gravity")}</Btn>}
      controls={<>
        <Row>
          <Choice value={mode} onChange={m => { setMode(m); setTime(0); }} options={[
            ["rocket", tx(t, "figPhEquiv_rocket", "rocket accelerating in space")],
            ["earth", tx(t, "figPhEquiv_earth", "standing on Earth")],
            ["fall", tx(t, "figPhEquiv_fall", "falling freely")],
            ["float", tx(t, "figPhEquiv_float", "floating in space")],
          ] as const} />
        </Row>
        <Row>
          <Readout color={same ? C.green : C.red}>{same
            ? tx(t, "figPhEquiv_same", "inside, this looks exactly like its partner situation")
            : tx(t, "figPhEquiv_diff", "inside, Earth and rocket now look different: the principle is broken")}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhEquiv_note", "A person in a closed box lets go of a ball and fires a laser straight across. Choose the rocket: inside (left), the ball falls to the floor and the light pulse curves down on its way across. Outside (right), the reason is plain: the ball and the light go perfectly straight, and the floor accelerates up to meet them. Now choose standing on Earth: the inside view is identical. Einstein made this his starting point, the equivalence principle: no experiment inside the box can tell gravity from acceleration. So light must bend in gravity too. Falling freely and floating far out in space also look the same inside: everything floats and light goes straight; gravity has vanished. Break it by letting light ignore gravity: the Earth box no longer matches the rocket, and the person could tell where they are. Everything is exaggerated enormously; across a real 2 m box, light falls about 2 × 10⁻¹⁶ m.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <T x={LX} y={18} size={8.5} color={C.fg} bold>{tx(t, "figPhEquiv_inside", "inside view")}</T>
          <T x={RX} y={18} size={8.5} color={C.fg} bold>{mode === "earth" || mode === "fall" ? tx(t, "figPhEquiv_fromGround", "seen from the ground") : tx(t, "figPhEquiv_fromSpace", "seen by someone floating outside")}</T>
          {scene(LX, 0, ballIn, s => (lightBends ? 0.5 * GS * s * s : 0), false)}
          <defs><clipPath id="equiv-out"><rect x={RX - 10} y={0} width={BOX + 40} height={H - 10} /></clipPath></defs>
          <g clipPath="url(#equiv-out)">
            <g transform={`translate(0, ${mode === "rocket" ? 50 : 0})`}>
              {mode === "earth" && <line x1={RX - 10} y1={TOPY + BOX + 3} x2={RX + BOX + 30} y2={TOPY + BOX + 3} stroke={C.axis} strokeWidth={4} />}
              {scene(RX, boxOut, ballOut, s => (lightOut ? 0.5 * GS * s * s : 0), true)}
            </g>
          </g>
          {mode === "earth" && <T x={RX + BOX + 26} y={TOPY + BOX + 18} anchor="end" size={8}>{tx(t, "figPhEquiv_ground", "ground")}</T>}
          {mode === "fall" && <T x={RX + BOX + 26} y={H - 22} anchor="end" size={8}>{tx(t, "figPhEquiv_groundBelow", "the ground is far below")}</T>}
          <T x={14} y={H - 8} size={8}>{tx(t, "figPhEquiv_scale", "light slowed and gravity exaggerated enormously")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={() => setTime(0)} />
      </div>
    </Figure>
  );
}

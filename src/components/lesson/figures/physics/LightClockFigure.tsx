"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Two identical light clocks: a flash of light bouncing between two mirrors a
// distance L apart; every arrival at a mirror is one tick. We watch from the
// platform. The top clock is at rest beside us. The bottom one rides past at
// v = βc (slider), so in our frame its light runs along a zigzag. Light has
// the same speed c for everyone (Einstein's second postulate), so the longer
// zigzag takes longer: each tick of the moving clock lasts γ = 1/√(1 − β²)
// times longer than a tick of ours. Speeds are drawn slowed down: c is
// 160 px/s on screen.
// "break it: light adds speed like a ball" lets the light keep its full
// vertical speed and add the clock's speed on top, as a thrown ball would.
// Then both clocks tick together, but the light along the zigzag moves faster
// than c, which every experiment since Michelson and Morley's (1887) rules out.

const W = 560, H = 290;
const CPX = 160, LPX = 80;                    // light speed on screen (px/s), mirror gap (px)
const RX = 70, TOP0 = 34, BOT0 = 164;         // rest clock x; top mirror y of each clock

/** Height of the light above the bottom mirror after time t, for a half-tick of duration h. */
function bounce(t: number, h: number) {
  const k = Math.floor(t / h), f = t / h - k;
  return { ticks: k, y: k % 2 === 0 ? f : 1 - f };
}

export function LightClockFigure({ t }: { t?: TrackTranslations }) {
  const [beta, setBeta] = useState(0.6);
  const [broken, setBroken] = useState(false);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && vis.on, dt => setTime(v => v + dt));

  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const hRest = LPX / CPX, hMove = broken ? hRest : gamma * hRest;
  const rest = bounce(time, hRest), move = bounce(time, hMove);
  const span = W - 120;
  const mx = 60 + ((beta * CPX * time) % span);
  const lightSpeed = broken ? Math.sqrt(1 + beta * beta) : 1;

  // the zigzag the moving clock's light has drawn, back to where the clock last wrapped round
  const tWrap = Math.floor((beta * CPX * time) / span) * (span / Math.max(1e-9, beta * CPX));
  const pts: string[] = [];
  for (let k = 0; k <= 60; k++) {
    const tt = tWrap + ((time - tWrap) * k) / 60;
    const b = bounce(tt, hMove);
    pts.push(`${k ? "L" : "M"}${(60 + ((beta * CPX * tt) % span) + 30).toFixed(1)},${(BOT0 + LPX - b.y * LPX).toFixed(1)}`);
  }

  const clock = (x: number, y0: number, color: string, ly: number) => (
    <g>
      <rect x={x} y={y0 - 4} width={60} height={4} fill={C.fg} />
      <rect x={x} y={y0 + LPX} width={60} height={4} fill={C.fg} />
      <line x1={x + 30} y1={y0} x2={x + 30} y2={y0 + LPX} stroke={C.grid} strokeDasharray="2 3" />
      <circle cx={x + 30} cy={y0 + LPX - ly * LPX} r={5} fill={color} />
    </g>
  );

  return (
    <Figure title={tx(t, "figPhClock_title", "Two light clocks, one moving")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhClock_broken", "break it: light adds speed like a ball")}</Btn>}
      controls={<>
        <Slider label="β = v/c" value={beta} min={0} max={0.98} step={0.01} onChange={setBeta} fmt={v => f2(v, 2)} />
        <Row>
          <Readout color={C.amber}>{`γ = 1/√(1 − β²) = ${f2(gamma, 3)}`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhClock_restTicks", "ticks, clock at rest")}: ${rest.ticks}`}</Readout>
          <Readout color={C.pink}>{`${tx(t, "figPhClock_moveTicks", "ticks, moving clock")}: ${move.ticks}`}</Readout>
          <Readout color={broken ? C.red : C.green}>{`${tx(t, "figPhClock_speed", "light along the zigzag")}: ${f2(lightSpeed, 3)} c`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhClock_note", "Each clock is a flash of light bouncing between two mirrors; each arrival is a tick. The top clock sits beside you; the bottom one rides past at the speed you choose. From where you stand, the moving clock's light does not go straight up and down: it runs along a zigzag, which is longer. Light travels at the same speed c for every observer, so the longer path takes longer, and the moving clock ticks slower, by the factor γ. At β = 0.6, γ = 1.25: four of its ticks for every five of yours. Push β towards 1 and the moving clock almost stops. Nothing is wrong with the clock: any clock, heart or atom moving with it slows the same way, because they all share its time. Break it by letting the light add the clock's speed like a thrown ball: the clocks tick together again, but the light on the zigzag now moves faster than c, which experiments rule out.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <T x={14} y={TOP0 - 14} size={8.5} color={C.sky}>{tx(t, "figPhClock_rest", "clock at rest beside you")}</T>
          {clock(RX, TOP0, C.sky, rest.y)}
          <line x1={10} y1={(TOP0 + LPX + BOT0) / 2 + 2} x2={W - 10} y2={(TOP0 + LPX + BOT0) / 2 + 2} stroke={C.grid} />
          <T x={14} y={BOT0 - 14} size={8.5} color={C.pink}>{`${tx(t, "figPhClock_moving", "clock moving at")} ${f2(beta, 2)}c →`}</T>
          {beta > 0 && <path d={pts.join("")} fill="none" stroke={C.pink} strokeWidth={1.3} opacity={0.55} />}
          {clock(mx, BOT0, C.pink, move.y)}
          <T x={W - 14} y={H - 8} anchor="end" size={8}>{tx(t, "figPhClock_slow", "light slowed down for the screen")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={() => setTime(0)}
          readout={`t = ${f2(time, 1)} s`} />
      </div>
    </Figure>
  );
}

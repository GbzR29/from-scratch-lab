"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Einstein's train. A carriage 300 m long (in its own frame) passes a
// platform at v = βc. A lamp in the exact middle of the carriage flashes; the
// light runs to both ends at c. Two descriptions:
//  • train frame: the carriage is at rest, both halves are 150 m, so the
//    light reaches both ends together, after 150 m / c = 500 ns;
//  • platform frame: the carriage is shortened to 300/γ m and moves forward.
//    The back end runs into the light, the front end runs away from it:
//    t_back = (L/2γ)/(c + v), t_front = (L/2γ)/(c − v). The two arrivals are
//    no longer simultaneous; they are γ L v / c² apart.
// Both are right. "Simultaneous" depends on the frame. On screen light
// moves at 120 px/s, 1 px = 1 m; the readouts are in real nanoseconds.

const W = 560, H = 230;
const LP = 300, CPX = 120, CREAL = 299.792458;   // proper length (m = px); screen light speed; c in m/µs
const YT = 100;

export function SimultaneityFigure({ t }: { t?: TrackTranslations }) {
  const [beta, setBeta] = useState(0.6);
  const [frame, setFrame] = useState<"train" | "platform">("platform");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vis = useVisible<HTMLDivElement>();

  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const onTrain = frame === "train";
  const len = onTrain ? LP : LP / gamma;
  const v = onTrain ? 0 : beta * CPX;
  const tBack = (len / 2) / (CPX + v), tFront = (len / 2) / (CPX - v);
  const tEnd = Math.max(tBack, tFront) + 0.6;
  useFrame(playing && vis.on, dt => {
    if (time + dt >= tEnd) { setPlaying(false); setTime(tEnd); } else setTime(time + dt);
  });

  // positions in metres from the flash point, then squeezed (k ≤ 1) so the whole run fits on screen
  const span = len + v * tEnd, k = Math.min(1, 440 / span), left = (W - k * span) / 2;
  const X = (m: number) => left + k * (m + len / 2);
  const XC = X(0);
  const shift = v * time;                                   // how far the carriage has moved (platform frame)
  const back = X(-len / 2 + shift), front = X(len / 2 + shift);
  const lightL = Math.max(back, X(-CPX * time)), lightR = Math.min(front, X(CPX * time));
  const posts = onTrain ? -beta * CPX * time : 0;           // platform posts slide back in the train frame
  const ns = (tpx: number) => (tpx * CPX) / CREAL * 1000;   // screen seconds → real ns (1 px = 1 m)
  const hitB = time >= tBack, hitF = time >= tFront;

  return (
    <Figure title={tx(t, "figPhSim_title", "A flash in the middle of a moving carriage")}
      head={<Choice value={frame} options={[["platform", tx(t, "figPhSim_platform", "seen from the platform")], ["train", tx(t, "figPhSim_train", "seen from the train")]] as const}
        onChange={f => { setFrame(f); setTime(0); setPlaying(false); }} />}
      controls={<>
        <Slider label="β = v/c" value={beta} min={0} max={0.9} step={0.01} onChange={b => { setBeta(b); setTime(0); setPlaying(false); }} fmt={b => f2(b, 2)} />
        <Row>
          <Readout color={C.sky}>{`${tx(t, "figPhSim_back", "light reaches the back")}: ${f2(ns(tBack), 0)} ns`}</Readout>
          <Readout color={C.pink}>{`${tx(t, "figPhSim_front", "light reaches the front")}: ${f2(ns(tFront), 0)} ns`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figPhSim_gap", "gap")} = ${f2(ns(tFront) - ns(tBack), 0)} ns${onTrain ? "" : ` = γLv/c²`}`}</Readout>
          <Readout>{`${tx(t, "figPhSim_len", "carriage length")}: ${f2(len, 0)} m`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhSim_note", "A lamp in the exact middle of a carriage flashes, and the light runs to both ends. Seen from the train, nothing could be simpler: the ends are 150 m away on each side, the light goes at c both ways, and it reaches them at the same moment. Now watch the same flash from the platform. The light still goes at c both ways (it does not care that the lamp was moving), but the back of the carriage is moving towards the light and the front is running away from it. The light reaches the back first. Both observers are right. Two events that happen at the same time in one frame happen at different times in another moving past it; at everyday speeds the gap is far too small to notice, which is why nobody suspected it before 1905.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={0} y1={YT + 46} x2={W} y2={YT + 46} stroke={C.axis} strokeWidth={2} />
          {Array.from({ length: 40 }, (_, i) => {
            const x = left + (((((i * 40 + posts) % 1600) + 1600) % 1600) - 400) * k;
            return <line key={i} x1={x} y1={YT + 46} x2={x} y2={YT + 60} stroke={C.axis} />;
          })}
          <rect x={back} y={YT - 30} width={front - back} height={60} rx={6} fill={C.fg} fillOpacity={0.06} stroke={C.fg} strokeWidth={1.6} />
          <circle cx={back + 18} cy={YT + 36} r={8} fill="none" stroke={C.fg} />
          <circle cx={front - 18} cy={YT + 36} r={8} fill="none" stroke={C.fg} />
          <rect x={back - 3} y={YT - 30} width={6} height={60} fill={hitB ? C.sky : C.fg} />
          <rect x={front - 3} y={YT - 30} width={6} height={60} fill={hitF ? C.pink : C.fg} />
          {time > 0 && <>
            <line x1={lightL} y1={YT} x2={lightR} y2={YT} stroke={C.amber} strokeWidth={3} />
            <circle cx={lightL} cy={YT} r={4} fill={C.amber} />
            <circle cx={lightR} cy={YT} r={4} fill={C.amber} />
          </>}
          <circle cx={XC} cy={YT - 40} r={5} fill={C.amber} opacity={time === 0 ? 1 : 0.4} />
          <T x={XC} y={YT - 50} anchor="middle" size={8}>{tx(t, "figPhSim_flash", "flash")}</T>
          {hitB && <T x={back} y={YT - 38} anchor="middle" color={C.sky} size={8.5} bold>{`${f2(ns(tBack), 0)} ns`}</T>}
          {hitF && <T x={front} y={YT - 38} anchor="middle" color={C.pink} size={8.5} bold>{`${f2(ns(tFront), 0)} ns`}</T>}
          {!onTrain && beta > 0 && <T x={front + 8} y={YT + 4} size={9} color={C.fg}>{`→ ${f2(beta, 2)}c`}</T>}
          <T x={14} y={H - 10} size={8}>{onTrain ? tx(t, "figPhSim_keyTrain", "the train is at rest; the platform slides backwards") : tx(t, "figPhSim_keyPlatform", "the platform is at rest; the carriage moves right")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => { if (time >= tEnd) setTime(0); setPlaying(p => !p); }} onReset={() => { setTime(0); setPlaying(false); }}
          readout={`${f2(ns(time), 0)} ns`} />
      </div>
    </Figure>
  );
}

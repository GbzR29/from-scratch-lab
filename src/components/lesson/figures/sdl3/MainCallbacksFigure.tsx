"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, C, T, useFrame, useVisible, useRerender } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { scaledMs, useFigureSpeed } from "@/components/lesson/kit/Stepper";

// ── What this figure shows ────────────────────────────────────────────────────
// Who owns the loop. The tape scrolls one call at a time: the top lane is SDL
// (or the browser), the bottom lane is your code. With the main callbacks, SDL
// calls SDL_AppInit once, then for every frame one SDL_AppEvent per queued
// event and one SDL_AppIterate, then hands the thread back so the frame is
// shown. The reader queues events with the buttons; "close window" queues
// SDL_EVENT_QUIT, whose SDL_APP_SUCCESS ends the program through SDL_AppQuit.
// SDL_HINT_MAIN_CALLBACK_RATE "waitevent" skips SDL_AppIterate until an event
// arrives. The second mode runs a classic while loop compiled for the web: it
// never returns, so the browser never paints and never delivers the input.

type Mode = "callbacks" | "while";
type Rate = "0" | "waitevent";
type Kind = "init" | "event" | "iterate" | "quit" | "shown" | "wait" | "poll" | "draw";
type Call = { k: Kind; label: string; ret?: string; id: number };

const LANE_SDL: Kind[] = ["shown", "wait"];
const COL: Record<Kind, string> = {
  init: C.sky, event: C.amber, iterate: C.blue, quit: C.red, shown: C.green, wait: "var(--code-gutter)",
  poll: C.purple, draw: C.purple,
};
const W = 640, H = 270, BW = 46, GAP = 4, KEEP = 12;
const X0 = W - 14 - BW;                         // newest block, at the right
const LANE1 = 34, LANE2 = 106, LH = 40;
const SPEED = 240, DT = 1 / 60;                 // px/s of the square, seconds per frame
const STAGE = { x: 14, y: 168, w: 160, h: 90 }; // 1280×720 scaled by 1/8

type Sim = {
  phase: "pre" | "run" | "done";
  pending: Call[];
  queue: string[];
  tape: Call[];
  x: number;          // square position in the program (px of 1280)
  shownX: number;     // what the screen shows
  counts: { event: number; iterate: number; shown: number; loops: number };
  nextId: number;
};

const fresh = (): Sim => ({
  phase: "pre", pending: [], queue: [], tape: [], x: 0, shownX: 0,
  counts: { event: 0, iterate: 0, shown: 0, loops: 0 }, nextId: 1,
});

function stepSim(s: Sim, mode: Mode, rate: Rate) {
  if (s.phase === "done") return;
  const call = (k: Kind, label: string): Call => ({ k, label, id: s.nextId++ });

  // Plan the next frame when the current one is used up
  if (s.pending.length === 0) {
    if (s.phase === "pre") s.pending.push(call("init", mode === "callbacks" ? "AppInit" : "main()"));
    else if (mode === "callbacks") {
      const had = s.queue.length > 0;
      for (const e of s.queue) s.pending.push(call("event", e));
      s.queue = [];
      if (rate === "0" || had) s.pending.push(call("iterate", "AppIterate"), call("shown", "shown"));
      else s.pending.push(call("wait", "wait"));
    } else {
      s.pending.push(call("poll", "PollEvent"), call("draw", "draw"));
    }
  }

  const c = s.pending.shift()!;
  switch (c.k) {
    case "init":
      c.ret = mode === "callbacks" ? "CONTINUE" : "";
      s.phase = "run";
      break;
    case "event":
      s.counts.event++;
      if (c.label === "QUIT") { c.ret = "SUCCESS"; s.pending = [call("quit", "AppQuit")]; }
      else c.ret = "CONTINUE";
      break;
    case "iterate":
      s.counts.iterate++;
      s.x += SPEED * DT;
      if (s.x > 1280) s.x = -100;
      c.ret = "CONTINUE";
      break;
    case "shown":
      s.counts.shown++;
      s.shownX = s.x;
      break;
    case "quit":
      s.phase = "done";
      break;
    case "poll":
      c.ret = "0 events";                       // the browser never ran its input handlers
      break;
    case "draw":
      s.counts.loops++;
      s.x += SPEED * DT;
      if (s.x > 1280) s.x = -100;
      break;
  }
  s.tape.push(c);
  if (s.tape.length > KEEP) s.tape.shift();
}

export function MainCallbacksFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("callbacks");
  const [rate, setRate] = useState<Rate>("0");
  const [playing, setPlaying] = useState(false);
  const [speed] = useFigureSpeed();
  const sim = useRef<Sim>(fresh());
  const acc = useRef(0);
  const rerender = useRerender();
  const vis = useVisible<HTMLDivElement>();
  const s = sim.current;

  const step = () => { stepSim(s, mode, rate); if (s.phase === "done") setPlaying(false); rerender(); };
  const reset = (m = mode) => { sim.current = fresh(); acc.current = 0; setPlaying(false); setMode(m); rerender(); };
  const queue = (e: string) => { if (s.phase === "done") return; s.queue.push(e); rerender(); };

  useFrame(playing && vis.on, dt => {
    acc.current += dt * 1000;
    const every = scaledMs(380, speed);
    let changed = false;
    while (acc.current >= every) { acc.current -= every; stepSim(s, mode, rate); changed = true; }
    if (s.phase === "done") setPlaying(false);
    if (changed) rerender();
  });

  const unresponsive = mode === "while" && s.counts.loops >= 6;
  const blockX = (i: number) => X0 - (s.tape.length - 1 - i) * (BW + GAP);
  // The 100 px square at 1/8 scale, clipped to the window (it re-enters from x = −100)
  const sq = 100 / 8;
  const sqL = Math.max(0, s.shownX / 8);
  const sqW = Math.min(STAGE.w, s.shownX / 8 + sq) - sqL;

  return (
    <Figure
      title={tx(t, "figSdlCb_title", "Who owns the loop")}
      head={<Choice value={mode} onChange={m => reset(m)} options={[
        ["callbacks", tx(t, "figSdlCb_mCb", "main callbacks")],
        ["while", tx(t, "figSdlCb_mWhile", "while loop, on the web")],
      ]} />}
      controls={<>
        <Row>
          <Btn onClick={() => queue("KEY_DOWN")}>{tx(t, "figSdlCb_key", "press a key")}</Btn>
          <Btn onClick={() => queue("MOUSE_MOTION")}>{tx(t, "figSdlCb_mouse", "move the mouse")}</Btn>
          <Btn onClick={() => queue("QUIT")}>{tx(t, "figSdlCb_close", "close the window")}</Btn>
        </Row>
        {mode === "callbacks" && (
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">SDL_HINT_MAIN_CALLBACK_RATE</span>
            <Choice value={rate} onChange={setRate} options={[["0", "\"0\""], ["waitevent", "\"waitevent\""]]} />
          </Row>
        )}
        <Row>
          <Readout>{tx(t, "figSdlCb_queued", "queued events")}: {s.queue.length}</Readout>
          {mode === "callbacks" ? <>
            <Readout color={C.amber}>AppEvent: {s.counts.event}</Readout>
            <Readout color={C.blue}>AppIterate: {s.counts.iterate}</Readout>
          </> : <Readout color={C.purple}>{tx(t, "figSdlCb_loops", "loop turns")}: {s.counts.loops}</Readout>}
          <Readout color={C.green}>{tx(t, "figSdlCb_frames", "frames shown")}: {s.counts.shown}</Readout>
        </Row>
      </>}
      note={mode === "callbacks"
        ? tx(t, "figSdlCb_noteCb", "Press play, then queue a few events. Each frame, SDL first calls SDL_AppEvent once for every event that arrived, then SDL_AppIterate once, then takes the thread back so the frame can be shown. Your code never waits and never loops: it is called, does its part and returns. With the rate hint set to \"waitevent\", SDL_AppIterate is skipped until an event arrives, which saves power in tools and menus. \"close the window\" queues SDL_EVENT_QUIT: SDL_AppEvent returns SDL_APP_SUCCESS and SDL calls SDL_AppQuit.")
        : tx(t, "figSdlCb_noteWhile", "The same program written with while (running) and compiled to WebAssembly. Your loop polls, updates and draws forever, and never returns. The browser runs on that same thread, so it never gets a turn: it cannot show a frame, and it cannot run the handlers that would turn your clicks into SDL events, so SDL_PollEvent always finds nothing. The square moves in memory but the screen never changes, the close button does nothing, and the browser finally offers to kill the page.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
          {/* lanes */}
          <rect x={8} y={LANE1 - 8} width={W - 16} height={LH + 16} rx={8} fill="var(--surface)" opacity={0.6} />
          <rect x={8} y={LANE2 - 8} width={W - 16} height={LH + 16} rx={8} fill="var(--surface)" opacity={0.6} />
          <T x={14} y={LANE1 - 13} size={9} bold>{mode === "callbacks" ? tx(t, "figSdlCb_laneSdl", "SDL (owns the loop)") : tx(t, "figSdlCb_laneBrowser", "the browser")}</T>
          <T x={14} y={LANE2 - 13} size={9} bold>{mode === "callbacks" ? tx(t, "figSdlCb_laneYou", "your code (called)") : tx(t, "figSdlCb_laneYouWhile", "your code (owns the loop)")}</T>

          {mode === "while" && s.phase === "run" && (
            <g>
              <rect x={14} y={LANE1} width={W - 28} height={LH} rx={6} fill={C.red} fillOpacity={0.08} stroke={C.red} strokeDasharray="5 4" />
              <T x={W / 2} y={LANE1 + 24} size={10} anchor="middle" color={C.red}>
                {tx(t, "figSdlCb_blocked", "waiting for the thread: no frame shown, no input delivered")}
              </T>
            </g>
          )}

          {s.tape.map((c, i) => {
            const x = blockX(i);
            if (x < 10) return null;
            const top = LANE_SDL.includes(c.k) ? LANE1 : LANE2;
            const last = i === s.tape.length - 1;
            return (
              <g key={c.id}>
                {!LANE_SDL.includes(c.k) && mode === "callbacks" && (
                  <line x1={x + BW / 2} y1={LANE1 + LH} x2={x + BW / 2} y2={LANE2 - 2} stroke={COL[c.k]} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="2 3" />
                )}
                <rect x={x} y={top} width={BW} height={LH} rx={6} fill={COL[c.k]} fillOpacity={last ? 0.35 : 0.14}
                  stroke={COL[c.k]} strokeWidth={last ? 2 : 1} />
                <T x={x + BW / 2} y={top + (c.k === "event" ? 17 : 24)} size={c.k === "event" ? 7.5 : 8} anchor="middle" bold={last} color={C.fg}>
                  {c.k === "event" ? "AppEvent" : c.k === "shown" ? tx(t, "figSdlCb_shown", "shown") : c.k === "wait" ? tx(t, "figSdlCb_wait", "sleep") : c.label}
                </T>
                {c.k === "event" && <T x={x + BW / 2} y={top + 29} size={c.label.length > 9 ? 5.6 : 6.5} anchor="middle" color={C.muted}>{c.label}</T>}
                {c.ret && <T x={x + BW / 2} y={LANE2 + LH + 12} size={6.5} anchor="middle" color={c.ret === "SUCCESS" ? C.red : C.muted}>{c.k === "poll" ? tx(t, "figSdlCb_none", "0 events") : c.ret}</T>}
              </g>
            );
          })}

          {s.tape.length === 0 && (
            <T x={W / 2} y={LANE2 + 24} size={10} anchor="middle">{tx(t, "figSdlCb_start", "press play: the program has not started yet")}</T>
          )}

          {/* the window: what the screen shows */}
          <T x={STAGE.x} y={STAGE.y - 6} size={9} bold>{tx(t, "figSdlCb_screen", "the screen")}</T>
          <rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} rx={4} fill="#10121a" stroke="var(--border)" />
          {mode === "callbacks" && s.counts.shown > 0 && sqW > 0 && (
            <rect x={STAGE.x + sqL} y={STAGE.y + 310 / 8} width={sqW} height={sq} fill="#3b82f6" />
          )}
          {s.phase === "done" && (
            <g>
              <rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} rx={4} fill="var(--code-bg)" />
              <T x={STAGE.x + STAGE.w / 2} y={STAGE.y + 49} size={9} anchor="middle" color={C.green}>{tx(t, "figSdlCb_exited", "exited, code 0")}</T>
            </g>
          )}
          {unresponsive && (
            <g>
              <rect x={STAGE.x + STAGE.w + 18} y={STAGE.y} width={W - STAGE.x - STAGE.w - 32} height={STAGE.h} rx={8} fill="var(--card)" stroke="var(--border)" />
              <T x={STAGE.x + STAGE.w + 32} y={STAGE.y + 26} size={11} bold color={C.fg}>{tx(t, "figSdlCb_unresp", "Page Unresponsive")}</T>
              <T x={STAGE.x + STAGE.w + 32} y={STAGE.y + 46} size={9}>{tx(t, "figSdlCb_unresp2", "You can wait for it to become responsive")}</T>
              <T x={STAGE.x + STAGE.w + 32} y={STAGE.y + 60} size={9}>{tx(t, "figSdlCb_unresp3", "or exit the page.")}</T>
            </g>
          )}
          {!unresponsive && (
            <g>
              <T x={STAGE.x + STAGE.w + 22} y={STAGE.y + 20} size={9}>{tx(t, "figSdlCb_inMem", "square in memory")}: x = {Math.round(s.x)}</T>
              <T x={STAGE.x + STAGE.w + 22} y={STAGE.y + 38} size={9}>{tx(t, "figSdlCb_onScr", "square on screen")}: {mode === "callbacks" && s.counts.shown > 0 ? `x = ${Math.round(s.shownX)}` : "—"}</T>
              <T x={STAGE.x + STAGE.w + 22} y={STAGE.y + 62} size={8.5} color={C.muted}>
                {s.phase === "done" ? tx(t, "figSdlCb_quitDone", "SDL_AppQuit ran, then SDL_Quit: everything is freed.")
                  : mode === "callbacks" ? tx(t, "figSdlCb_moves", "each AppIterate moves it 240 px/s × 1/60 s = 4 px")
                    : tx(t, "figSdlCb_frozen", "updated every turn, never shown")}
              </T>
            </g>
          )}
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onStep={step} onReset={() => reset()} speed
          readout={s.phase === "done" ? tx(t, "figSdlCb_ended", "ended") : undefined} />
      </div>
    </Figure>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, C, T, useFrame, useVisible, useRerender } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Events versus state, with the reader's real keyboard. One key moves two
// squares. The top one moves 8 px for every SDL_EVENT_KEY_DOWN, the way a
// beginner first writes movement; the bottom one reads SDL_GetKeyboardState
// every frame and moves 240 px/s × dt. Holding a key shows the difference: the
// event square jumps once, waits for the operating system's repeat delay, then
// moves in repeat steps; the state square starts at once and glides. The log
// is the event queue (repeats folded into one line with a count), the table is
// the state array. Losing focus releases held keys, as SDL_ResetKeyboard does.
// The on-screen buttons fake the OS repeat (500 ms delay, 30 per second), so
// touch screens see the same thing.

type Scan = "LEFT" | "RIGHT" | "A" | "D";
type Entry = { id: number; kind: "down" | "up"; scan: Scan; repeat: boolean; n: number; reset?: boolean };

const CODE: Record<string, Scan> = { ArrowLeft: "LEFT", ArrowRight: "RIGHT", KeyA: "A", KeyD: "D" };
const SCANS: Scan[] = ["LEFT", "RIGHT", "A", "D"];
const DIR: Record<Scan, -1 | 1> = { LEFT: -1, A: -1, RIGHT: 1, D: 1 };
const W = 640, SQ = 24, STEP = 8, SPEED = 240, LOG = 7;
const LANE = [34, 104];                         // top edge of each square

type Sim = { held: Set<Scan>; evX: number; stX: number; log: Entry[]; nextId: number };

const wrap = (x: number) => (x > W ? -SQ : x < -SQ ? W : x);

export function EventsStateFigure({ t }: { t?: TrackTranslations }) {
  const sim = useRef<Sim>({ held: new Set(), evX: 308, stX: 308, log: [], nextId: 1 });
  const timers = useRef<{ delay?: ReturnType<typeof setTimeout>; rep?: ReturnType<typeof setInterval> }>({});
  const [focused, setFocused] = useState(false);
  const [holding, setHolding] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();

  const push = (e: Omit<Entry, "id" | "n">) => {
    const s = sim.current, last = s.log[0];
    if (last && e.kind === "down" && e.repeat && last.kind === "down" && last.repeat && last.scan === e.scan) last.n++;
    else s.log = [{ ...e, id: s.nextId++, n: 1 }, ...s.log].slice(0, LOG);
  };

  const down = (scan: Scan, repeat: boolean) => {
    const s = sim.current;
    if (!repeat && s.held.has(scan)) repeat = true;   // a held key seen again is a repeat
    s.held.add(scan);
    s.evX = wrap(s.evX + DIR[scan] * STEP);
    push({ kind: "down", scan, repeat });
    setHolding(true);
    rerender();
  };
  const up = (scan: Scan, reset = false) => {
    const s = sim.current;
    if (!s.held.delete(scan)) return;
    push({ kind: "up", scan, repeat: false, reset });
    setHolding(s.held.size > 0);
    rerender();
  };
  const releaseAll = () => {
    stopRepeat();
    for (const k of [...sim.current.held]) up(k, true);
  };

  // On-screen buttons: the same events, with a faked OS repeat
  const stopRepeat = () => {
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.rep);
  };
  const press = (scan: Scan) => {
    stopRepeat();
    down(scan, false);
    timers.current.delay = setTimeout(() => {
      timers.current.rep = setInterval(() => down(scan, true), 1000 / 30);
    }, 500);
  };
  const release = (scan: Scan) => { stopRepeat(); up(scan); };
  useEffect(() => stopRepeat, []);

  // The state square: read the "keyboard state" every frame
  useFrame(vis.on && holding, dt => {
    const s = sim.current;
    let dx = 0;
    for (const k of s.held) dx += DIR[k];
    dx = Math.max(-1, Math.min(1, dx));
    s.stX = wrap(s.stX + dx * SPEED * dt);
    rerender();
  });

  const reset = () => {
    releaseAll();
    sim.current = { held: new Set(), evX: 308, stX: 308, log: [], nextId: 1 };
    setHolding(false);
    rerender();
  };

  const s = sim.current;

  return (
    <Figure
      title={tx(t, "figSdlEvents_title", "Events or state: one key, two squares")}
      head={<Btn onClick={reset}>{tx(t, "figSdlEvents_reset", "reset")}</Btn>}
      note={tx(t, "figSdlEvents_note", "Hold one key for a second and watch both squares. The top square moves 8 pixels per SDL_EVENT_KEY_DOWN: one step, then a pause of about half a second (the system's key-repeat delay), then repeat steps at the system's repeat rate. The bottom square reads the keyboard state every frame and moves 240 pixels per second from the first frame. The log on the left is the event queue; the table on the right is the state array SDL_GetKeyboardState returns. Click outside while holding a key: focus is lost, SDL releases the key, and both squares stop.")}
    >
      <div ref={vis.ref}
        tabIndex={0}
        role="application"
        aria-label={tx(t, "figSdlEvents_aria", "keyboard test area: hold the left or right arrow, or A or D")}
        onFocus={() => setFocused(true)}
        onBlur={e => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;   // focus moved to a button inside
          setFocused(false);
          releaseAll();
        }}
        onKeyDown={e => {
          const scan = CODE[e.code];
          if (!scan) return;
          e.preventDefault();
          down(scan, e.repeat);
        }}
        onKeyUp={e => {
          const scan = CODE[e.code];
          if (!scan) return;
          e.preventDefault();
          up(scan);
        }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
      >
        <div className="p-3 md:p-4 space-y-3">
          <svg viewBox={`0 0 ${W} 150`} width="100%" role="img"
            aria-label={tx(t, "figSdlEvents_svg", "two squares: one moved by key events, one by the keyboard state")}>
            <T x={0} y={LANE[0] - 8} color={C.amber} size={11} bold>
              {tx(t, "figSdlEvents_lane1", "moved by events: x += 8 on every SDL_EVENT_KEY_DOWN")}
            </T>
            <line x1={0} x2={W} y1={LANE[0] + SQ + 4} y2={LANE[0] + SQ + 4} stroke={C.grid} />
            <rect x={s.evX} y={LANE[0]} width={SQ} height={SQ} rx={3} fill={C.amber} />
            <T x={0} y={LANE[1] - 8} color={C.blue} size={11} bold>
              {tx(t, "figSdlEvents_lane2", "moved by state: x += 240 × dt while keys[…] is true")}
            </T>
            <line x1={0} x2={W} y1={LANE[1] + SQ + 4} y2={LANE[1] + SQ + 4} stroke={C.grid} />
            <rect x={s.stX} y={LANE[1]} width={SQ} height={SQ} rx={3} fill={C.blue} />
          </svg>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(["LEFT", "RIGHT"] as const).map(k => (
              <button key={k} type="button"
                aria-label={k === "LEFT" ? tx(t, "figSdlEvents_left", "hold left") : tx(t, "figSdlEvents_right", "hold right")}
                onPointerDown={e => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); press(k); }}
                onPointerUp={() => release(k)}
                onPointerCancel={() => release(k)}
                onContextMenu={e => e.preventDefault()}
                className="w-14 h-10 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-main)] text-lg touch-none select-none active:bg-[var(--primary-low)]">
                {k === "LEFT" ? "◀" : "▶"}
              </button>
            ))}
            <span className="text-[11px] text-[var(--text-muted)]">
              <span data-mouse-only>{focused
                ? tx(t, "figSdlEvents_focused", "keyboard captured: hold ← → or A D")
                : tx(t, "figSdlEvents_click", "click here, then hold ← → or A D, or hold a button")}</span>
              <span data-touch-only>{tx(t, "figSdlEvents_touch", "hold a button")}</span>
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 min-h-[9.5rem]">
              <p className="text-[9.5px] font-semibold mb-1" style={{ color: C.axis }}>
                {tx(t, "figSdlEvents_queue", "event queue (newest first)")}
              </p>
              {s.log.length === 0 && (
                <p className="text-[11px] text-[var(--text-muted)]">{tx(t, "figSdlEvents_empty", "no events yet")}</p>
              )}
              <ul className="font-mono text-[10.5px] leading-[1.55]">
                {s.log.map(e => (
                  <li key={e.id} className="whitespace-pre overflow-hidden text-ellipsis"style={{ color: e.kind === "up" ? C.muted : e.repeat ? C.orange : C.fg }}>
                    {e.kind === "down" ? "KEY_DOWN" : "KEY_UP  "} {e.scan.padEnd(5)}{" "}
                    {e.kind === "down" && `repeat=${e.repeat}`}
                    {e.n > 1 && <span style={{ color: C.orange }}> × {e.n}</span>}
                    {e.reset && <span style={{ color: C.red }}> {tx(t, "figSdlEvents_lost", "(focus lost)")}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
              <p className="text-[9.5px] font-semibold mb-1" style={{ color: C.axis }}>
                {tx(t, "figSdlEvents_state", "SDL_GetKeyboardState, this frame")}
              </p>
              <ul className="font-mono text-[10.5px] leading-[1.55]">
                {SCANS.map(k => (
                  <li key={k} style={{ color: s.held.has(k) ? C.green : C.muted }}>
                    keys[SDL_SCANCODE_{k}] = {String(s.held.has(k))}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}

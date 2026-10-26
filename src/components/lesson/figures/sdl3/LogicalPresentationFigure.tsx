"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, Handle, C, svgPoint, useDrag, type Pt } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// SDL_SetRenderLogicalPresentation(renderer, 640, 360, mode) on a window the
// reader resizes by dragging its corner. The game always draws the same
// 640 × 360 scene (a playfield, a 32-px grid, the square, amber corner marks);
// the mode decides the destination rectangle SDL scales it into, computed
// exactly as UpdateLogicalPresentation in SDL 3.4's SDL_render.c: integer
// scale divides by the dimension that limits, letterbox fits, overscan fills,
// stretch ignores the aspect, disabled draws 1:1 from the top-left. Outside
// that rectangle the window shows the clear colour. Moving the pointer over the
// window converts its position back to game coordinates, which is what
// SDL_RenderCoordinatesFromWindow does.

type Mode = "DISABLED" | "STRETCH" | "LETTERBOX" | "OVERSCAN" | "INTEGER_SCALE";
type Rect = { x: number; y: number; w: number; h: number };

const LW = 640, LH = 360;
const K = 1 / 3;                               // real pixels → drawing units
const OX = 8, OY = 22;                         // the window's client area, top-left
const MIN_W = 360, MIN_H = 220, MAX_W = 1920, MAX_H = 1080;

/** The destination rectangle of the logical image, as SDL 3.4 computes it. */
function presentation(mode: Mode, ow: number, oh: number): { dst: Rect; sx: number; sy: number } {
  const want = LW / LH, real = ow / oh;
  let dst: Rect;
  if (mode === "DISABLED") dst = { x: 0, y: 0, w: LW, h: LH };     // the game's coordinates are window pixels
  else if (mode === "INTEGER_SCALE") {
    let s = want > real ? Math.floor(ow / LW) : Math.floor(oh / LH);
    if (s < 1) s = 1;
    const w = Math.floor(LW * s), h = Math.floor(LH * s);
    dst = { x: (ow - w) / 2, y: (oh - h) / 2, w, h };
  } else if (mode === "STRETCH" || Math.abs(want - real) < 0.0001) dst = { x: 0, y: 0, w: ow, h: oh };
  else if ((want > real) === (mode === "LETTERBOX")) {
    const s = ow / LW, h = Math.floor(LH * s);               // fit the width
    dst = { x: 0, y: (oh - h) / 2, w: ow, h };
  } else {
    const s = oh / LH, w = Math.floor(LW * s);               // fit the height
    dst = { x: (ow - w) / 2, y: 0, w, h: oh };
  }
  return { dst, sx: dst.w / LW, sy: dst.h / LH };
}

const f1 = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export function LogicalPresentationFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("INTEGER_SCALE");
  const [win, setWin] = useState({ w: 1280, h: 720 });
  const [hover, setHover] = useState<Pt | null>(null);   // window pixels

  const corner = { x: OX + win.w * K, y: OY + win.h * K };
  const drag = useDrag<"corner">(
    p => (Math.hypot(p.x - corner.x, p.y - corner.y) < 18 ? "corner" : null),
    (_, p) => setWin({
      w: Math.round(Math.min(MAX_W, Math.max(MIN_W, (p.x - OX) / K))),
      h: Math.round(Math.min(MAX_H, Math.max(MIN_H, (p.y - OY) / K))),
    }),
  );

  const { dst, sx, sy } = presentation(mode, win.w, win.h);
  const want = LW / LH, real = win.w / win.h;

  // SDL_RenderCoordinatesFromWindow: window pixel → game coordinate
  const toGame = (p: Pt) => ({ x: ((p.x - dst.x) * LW) / dst.w, y: ((p.y - dst.y) * LH) / dst.h });
  const g = hover && toGame(hover);
  const inside = g && g.x >= 0 && g.x < LW && g.y >= 0 && g.y < LH;

  const scaleText = (() => {
    switch (mode) {
      case "DISABLED": return "1";
      case "STRETCH": return `${f1(win.w)} / 640 = ${sx.toFixed(2)} × ${f1(win.h)} / 360 = ${sy.toFixed(2)}`;
      case "INTEGER_SCALE": return want > real
        ? `⌊${win.w} / 640⌋ = ${sx}` : `⌊${win.h} / 360⌋ = ${sy}`;
      default: return sx.toFixed(3);
    }
  })();

  const verdict: Record<Mode, string> = {
    DISABLED: tx(t, "figSdlLogical_vDisabled", "No logical size: the game's coordinates are window pixels. A game written for 640 × 360 fills a corner of a big window, and a small window cuts it off."),
    STRETCH: tx(t, "figSdlLogical_vStretch", "Fills the whole window, but each axis has its own scale: unless the window is 16:9, the square is no longer square."),
    LETTERBOX: tx(t, "figSdlLogical_vLetterbox", "The largest picture that fits, with the aspect kept. The rest of the window is bars in the clear colour. The scale is usually not a whole number, so pixels come out in two sizes."),
    OVERSCAN: tx(t, "figSdlLogical_vOverscan", "The smallest picture that fills the window, with the aspect kept: no bars, but the edges of the game are cut off. Watch the amber corner marks."),
    INTEGER_SCALE: tx(t, "figSdlLogical_vInteger", "Only whole scales: every game pixel becomes exactly 1 × 1, 2 × 2 or 3 × 3 screen pixels, so pixel art stays crisp. The price is wider bars: a window just short of 1280 wide drops back to scale 1."),
  };

  const clipId = "sdl-logical-clip";
  const vbW = OX + MAX_W * K + 10, vbH = OY + MAX_H * K + 8;

  return (
    <Figure
      title={tx(t, "figSdlLogical_title", "Logical presentation: one 640 × 360 game, any window")}
      head={<>
        {([[1280, 720], [1920, 1080], [1000, 720], [800, 600]] as const).map(([w, h]) => (
          <Btn key={w} active={win.w === w && win.h === h} onClick={() => setWin({ w, h })}>{w}×{h}</Btn>
        ))}
      </>}
      controls={
        <div className="space-y-3">
          <Row>
            <Choice value={mode} onChange={setMode}
              options={[["INTEGER_SCALE", "INTEGER_SCALE"], ["LETTERBOX", "LETTERBOX"], ["OVERSCAN", "OVERSCAN"], ["STRETCH", "STRETCH"], ["DISABLED", "DISABLED"]] as const} />
          </Row>
          <Row>
            <Readout>{tx(t, "figSdlLogical_window", "window")} {win.w} × {win.h}</Readout>
            <Readout color={C.sky}>{tx(t, "figSdlLogical_scale", "scale")} {scaleText}</Readout>
            <Readout color={C.amber}>{tx(t, "figSdlLogical_dst", "drawn at")} x {f1(dst.x)} y {f1(dst.y)} · {f1(dst.w)} × {f1(dst.h)}</Readout>
          </Row>
          <p className="font-mono text-[11.5px] text-[var(--text-main)] min-h-[1.2rem]">
            {g ? <>
              {tx(t, "figSdlLogical_pointer", "pointer")} ({Math.round(hover!.x)}, {Math.round(hover!.y)}) → {tx(t, "figSdlLogical_game", "game")}{" "}
              <span style={{ color: inside ? C.green : C.red }}>({g.x.toFixed(1)}, {g.y.toFixed(1)})</span>
              {!inside && <span style={{ color: C.red }}> {tx(t, "figSdlLogical_outside", "outside the game area")}</span>}
            </> : <span className="text-[var(--text-muted)]">
              <span data-mouse-only>{tx(t, "figSdlLogical_hoverHint", "move the pointer over the window to convert its position")}</span>
              <span data-touch-only>{tx(t, "figSdlLogical_tapHint", "tap inside the window to convert a position")}</span>
            </span>}
          </p>
          <p className="text-[12.5px] leading-relaxed text-[var(--text-main)]">{verdict[mode]}</p>
        </div>
      }
      note={tx(t, "figSdlLogical_note", "Drag the window's bottom-right corner, or pick a size above. The game always draws the same 640 × 360 scene; only the mode changes where SDL puts it. The dark border is the window's clear colour. The numbers are the ones SDL 3.4 computes in UpdateLogicalPresentation.")}
    >
      <div className="p-3 md:p-4">
        <svg ref={drag.ref} viewBox={`0 0 ${vbW} ${vbH}`} width="100%" role="img"
          aria-label={tx(t, "figSdlLogical_aria", "a resizable window showing a 640 by 360 game scaled by the chosen mode")}
          {...drag.handlers}
          onPointerMove={e => {
            drag.handlers.onPointerMove(e);
            if (!drag.ref.current) return;
            const p = svgPoint(drag.ref.current, e);
            const wp = { x: (p.x - OX) / K, y: (p.y - OY) / K };
            setHover(wp.x >= 0 && wp.y >= 0 && wp.x <= win.w && wp.y <= win.h ? wp : null);
          }}
          onPointerLeave={() => setHover(null)}>
          <defs>
            <clipPath id={clipId}><rect x={OX} y={OY} width={win.w * K} height={win.h * K} /></clipPath>
          </defs>

          {/* the desktop's largest window, for scale */}
          <rect x={OX} y={OY} width={MAX_W * K} height={MAX_H * K} fill="none" stroke="var(--border)" strokeDasharray="3 3" />

          {/* window frame and title bar */}
          <rect x={OX} y={OY - 14} width={win.w * K} height={14} fill="var(--card)" stroke="var(--border)" />
          <text x={OX + 5} y={OY - 4} style={{ fontSize: 8.5, fill: "var(--text-main)" }}>SDL3 Lab</text>
          <rect x={OX} y={OY} width={win.w * K} height={win.h * K} fill="#10121a" />

          {/* the 640 × 360 game, mapped into dst */}
          <g clipPath={`url(#${clipId})`}>
            <g transform={`translate(${OX + dst.x * K} ${OY + dst.y * K}) scale(${(dst.w * K) / LW} ${(dst.h * K) / LH})`}>
              <rect width={LW} height={LH} fill="#1b2a44" />
              {Array.from({ length: 19 }, (_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 32} x2={(i + 1) * 32} y1={0} y2={LH} stroke="#ffffff" strokeOpacity={0.07} vectorEffect="non-scaling-stroke" />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`h${i}`} y1={(i + 1) * 32} y2={(i + 1) * 32} x1={0} x2={LW} stroke="#ffffff" strokeOpacity={0.07} vectorEffect="non-scaling-stroke" />
              ))}
              <rect y={296} width={LW} height={64} fill="#2c4a37" />
              <rect x={304} y={164} width={32} height={32} fill="#3b82f6" />
              {[[0, 0, 1, 1], [LW, 0, -1, 1], [0, LH, 1, -1], [LW, LH, -1, -1]].map(([x, y, dx, dy], i) => (
                <path key={i} d={`M${x + dx * 40} ${y + dy * 6} H${x + dx * 6} V${y + dy * 40}`} fill="none" stroke="#f59e0b" strokeWidth={4} />
              ))}
              {g && inside && (
                <g pointerEvents="none">
                  <line x1={g.x} x2={g.x} y1={0} y2={LH} stroke="#22c55e" strokeOpacity={0.6} vectorEffect="non-scaling-stroke" />
                  <line y1={g.y} y2={g.y} x1={0} x2={LW} stroke="#22c55e" strokeOpacity={0.6} vectorEffect="non-scaling-stroke" />
                </g>
              )}
            </g>
          </g>
          <rect x={OX} y={OY} width={win.w * K} height={win.h * K} fill="none" stroke="var(--border)" />
          <Handle x={corner.x} y={corner.y} color={C.purple} active={drag.dragging === "corner"} />
        </svg>
      </div>
    </Figure>
  );
}

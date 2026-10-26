"use client";

import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Row, C, useRaf } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The sprite sheet of the project (public/sdl3/hero.png, the file the reader
// downloads): 4 frames × 2 rows of 32×32. The amber box on the sheet is src,
// the part SDL_RenderTextureRotated copies; the window on the right draws it
// into dst, scaled, flipped and rotated around dst's centre, with the chosen
// scale mode. Click a cell to pick a frame. The code under the drawing is the
// call that produces exactly this picture.
//
// Scale modes: NEAREST and LINEAR are the canvas's own smoothing off and on.
// PIXELART (SDL 3.4) keeps texels sharp but blends the one screen pixel where
// two texels meet; it is approximated here by scaling up by a whole number
// with nearest sampling, then smoothly down to the exact size.

const FRAME = 32, COLS = 4, ROWS = 2;
const SHEET_ZOOM = 3;                      // the sheet is shown at 3×
const WIN_W = 360, WIN_H = 220;            // the "window", in CSS pixels

type Flip = "none" | "h" | "v" | "hv";
type Mode = "nearest" | "linear" | "pixelart";

const FLIP_C: Record<Flip, string> = {
  none: "SDL_FLIP_NONE", h: "SDL_FLIP_HORIZONTAL", v: "SDL_FLIP_VERTICAL", hv: "SDL_FLIP_HORIZONTAL_AND_VERTICAL",
};

export function SpriteSheetFigure({ t }: { t?: TrackTranslations }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [row, setRow] = useState(1);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fps, setFps] = useState(8);
  const [scale, setScale] = useState(4);
  const [angle, setAngle] = useState(0);
  const [flip, setFlip] = useState<Flip>("none");
  const [mode, setMode] = useState<Mode>("nearest");
  const clock = useRef(0);
  const sheetRef = useRef<HTMLCanvasElement>(null);
  const winRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = "/sdl3/hero.png";
  }, []);

  // Animation: frame = floor(time × fps) mod 4, as in the lesson's code
  const visRef = useRaf(playing, (dt) => {
    clock.current += dt;
    const f = Math.floor(clock.current * fps) % COLS;
    setFrame((old) => (old === f ? old : f));
  });

  // The sheet with its grid and the src box
  useEffect(() => {
    const cv = sheetRef.current;
    if (!cv || !img) return;
    const dpr = window.devicePixelRatio || 1;
    const w = FRAME * COLS * SHEET_ZOOM, h = FRAME * ROWS * SHEET_ZOOM;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0, w, h);
    g.strokeStyle = "rgba(138,143,152,0.55)";
    g.lineWidth = 1;
    for (let c = 1; c < COLS; c++) { g.beginPath(); g.moveTo(c * FRAME * SHEET_ZOOM + 0.5, 0); g.lineTo(c * FRAME * SHEET_ZOOM + 0.5, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, FRAME * SHEET_ZOOM + 0.5); g.lineTo(w, FRAME * SHEET_ZOOM + 0.5); g.stroke();
    g.strokeStyle = C.amber;
    g.lineWidth = 2.5;
    g.strokeRect(frame * FRAME * SHEET_ZOOM + 1.25, row * FRAME * SHEET_ZOOM + 1.25, FRAME * SHEET_ZOOM - 2.5, FRAME * SHEET_ZOOM - 2.5);
  }, [img, frame, row]);

  // The window: SDL_RenderTextureRotated(src, dst, angle, centre, flip)
  useEffect(() => {
    const cv = winRef.current;
    if (!cv || !img) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = WIN_W * dpr; cv.height = WIN_H * dpr;
    const g = cv.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#10121a";
    g.fillRect(0, 0, WIN_W, WIN_H);

    const size = FRAME * scale;
    const dx = (WIN_W - size) / 2, dy = (WIN_H - size) / 2;
    const sx = frame * FRAME, sy = row * FRAME;

    g.save();
    g.translate(dx + size / 2, dy + size / 2);
    g.rotate((angle * Math.PI) / 180);                  // clockwise on a y-down screen, like SDL
    g.scale(flip === "h" || flip === "hv" ? -1 : 1, flip === "v" || flip === "hv" ? -1 : 1);
    if (mode === "pixelart") {
      const k = Math.max(1, Math.ceil(scale * dpr));
      const tmp = document.createElement("canvas");
      tmp.width = tmp.height = FRAME * k;
      const tg = tmp.getContext("2d")!;
      tg.imageSmoothingEnabled = false;
      tg.drawImage(img, sx, sy, FRAME, FRAME, 0, 0, FRAME * k, FRAME * k);
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.drawImage(tmp, -size / 2, -size / 2, size, size);
    } else {
      g.imageSmoothingEnabled = mode === "linear";
      g.imageSmoothingQuality = "low";
      g.drawImage(img, sx, sy, FRAME, FRAME, -size / 2, -size / 2, size, size);
    }
    g.restore();

    // dst as SDL sees it (before rotation), and the pivot
    g.setLineDash([5, 4]);
    g.strokeStyle = "rgba(14,165,233,0.85)";
    g.lineWidth = 1;
    g.strokeRect(dx + 0.5, dy + 0.5, size - 1, size - 1);
    g.setLineDash([]);
    g.fillStyle = C.sky;
    g.beginPath(); g.arc(dx + size / 2, dy + size / 2, 3, 0, Math.PI * 2); g.fill();
  }, [img, frame, row, scale, angle, flip, mode]);

  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const c = Math.floor(((e.clientX - r.left) / r.width) * COLS);
    const rr = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
    setFrame(Math.min(COLS - 1, Math.max(0, c)));
    setRow(Math.min(ROWS - 1, Math.max(0, rr)));
    setPlaying(false);
  };

  const size = FRAME * scale;
  const modeC = { nearest: "SDL_SCALEMODE_NEAREST", linear: "SDL_SCALEMODE_LINEAR", pixelart: "SDL_SCALEMODE_PIXELART" }[mode];
  const modeNote = {
    nearest: tx(t, "figSdlSprite_mNearest", "NEAREST: each screen pixel takes the closest texel. Sharp at whole-number scales; at 3.5× some texels get 3 pixels and others 4, so lines wobble while the sprite moves."),
    linear: tx(t, "figSdlSprite_mLinear", "LINEAR (the default): each screen pixel blends the four closest texels. Right for photos and smooth art; pixel art turns blurry."),
    pixelart: tx(t, "figSdlSprite_mPixelart", "PIXELART (SDL 3.4): texels stay sharp, and only the one screen pixel where two texels meet is blended. Pixel art stays crisp at any scale and rotation, without the wobble of NEAREST."),
  }[mode];

  return (
    <Figure
      title={tx(t, "figSdlSprite_title", "A sprite sheet: src picks the frame, dst places it")}
      head={<Btn active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? tx(t, "figSdlSprite_pause", "pause") : tx(t, "figSdlSprite_play", "play")}</Btn>}
      controls={
        <div className="space-y-3">
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-16">{tx(t, "figSdlSprite_row", "row")}</span>
            <Choice value={String(row)} options={[["0", tx(t, "figSdlSprite_idle", "0: idle")], ["1", tx(t, "figSdlSprite_walk", "1: walk")]] as const} onChange={(v) => setRow(Number(v))} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-16">flip</span>
            <Choice value={flip} options={[["none", "NONE"], ["h", "HORIZ"], ["v", "VERT"], ["hv", "BOTH"]] as const} onChange={setFlip} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-16">{tx(t, "figSdlSprite_mode", "scale mode")}</span>
            <Choice value={mode} options={[["nearest", "NEAREST"], ["linear", "LINEAR"], ["pixelart", "PIXELART"]] as const} onChange={setMode} />
          </Row>
          <Sliders>
            <Slider label={tx(t, "figSdlSprite_scale", "scale")} value={scale} min={1} max={6} step={0.25} onChange={setScale} fmt={(v) => `${v}×`} />
            <Slider label={tx(t, "figSdlSprite_angle", "angle")} value={angle} min={0} max={360} step={1} onChange={setAngle} fmt={(v) => `${v}°`} />
            <Slider label="fps" value={fps} min={2} max={16} step={1} onChange={setFps} fmt={(v) => String(v)} />
          </Sliders>
          <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all rounded-md border border-[var(--border)] bg-[var(--code-bg)] px-3 py-2 text-[var(--code-text)]">
{`SDL_SetTextureScaleMode(sheet, ${modeC});
SDL_FRect src{ ${frame * FRAME}.0f, ${row * FRAME}.0f, 32.0f, 32.0f };   // frame ${frame}, row ${row}
SDL_FRect dst{ x, y, ${size}.0f, ${size}.0f };                // 32 × ${scale}
SDL_RenderTextureRotated(renderer, sheet, &src, &dst,
                         ${angle.toFixed(1)}, nullptr, ${FLIP_C[flip]});`}
          </pre>
          <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">{modeNote}</p>
        </div>
      }
      note={tx(t, "figSdlSprite_note", "Left, the whole texture: 128 × 64 pixels, four frames in each row. The amber box is src: x = frame × 32 and y = row × 32. Click a cell to choose it. Right, the window: the frame is drawn into dst, the dashed blue box, scaled to 32 × scale pixels. The angle turns it clockwise around dst's centre (nullptr as the centre), and flip mirrors it inside dst first.")}
    >
      <div ref={visRef as React.RefObject<HTMLDivElement>} className="grid gap-4 p-3 md:p-4 md:grid-cols-[auto_1fr] items-center">
        <div className="mx-auto">
          <p className="text-[10px] font-mono mb-1" style={{ color: C.muted }}>hero.png · 128 × 64</p>
          <canvas ref={sheetRef} onClick={pick}
            className="block cursor-pointer rounded border border-[var(--border)]"
            style={{
              width: FRAME * COLS * SHEET_ZOOM, maxWidth: "100%", aspectRatio: `${COLS} / ${ROWS}`,
              backgroundImage: "repeating-conic-gradient(rgba(138,143,152,0.18) 0 25%, transparent 0 50%)",
              backgroundSize: "12px 12px",
            }} />
        </div>
        <div className="mx-auto w-full" style={{ maxWidth: WIN_W }}>
          <p className="text-[10px] font-mono mb-1" style={{ color: C.muted }}>{tx(t, "figSdlSprite_window", "the window")}</p>
          <canvas ref={winRef} className="block w-full rounded border border-[var(--border)]" style={{ aspectRatio: `${WIN_W} / ${WIN_H}` }} />
        </div>
      </div>
    </Figure>
  );
}

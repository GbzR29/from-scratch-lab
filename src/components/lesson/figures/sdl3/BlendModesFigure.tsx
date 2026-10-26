"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Slider, Row, Btn, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// SDL_SetRenderDrawBlendMode + SDL_RenderFillRect over a frame that already
// holds something: six colour bars on top, a black-to-white ramp below. The
// rectangle is drawn with the chosen colour and alpha; every cell under it is
// the blend of source and destination, using the formulas of SDL_blendmode.h
// (RGB only: the window does not show the alpha channel, which is why NONE
// looks opaque at any alpha). Clicking a cell plugs its numbers into the
// formula of the chosen mode.

type Mode = "NONE" | "BLEND" | "ADD" | "MOD" | "MUL";
type RGB = [number, number, number];

const BARS: RGB[] = [[255, 255, 255], [250, 204, 21], [34, 211, 238], [34, 197, 94], [217, 70, 239], [30, 41, 59]];
const RAMP = 12;
const SRC: Record<string, RGB> = { red: [239, 68, 68], blue: [59, 130, 246], orange: [249, 115, 22], white: [255, 255, 255], grey: [128, 128, 128] };

/** One channel, all values 0..1, as SDL_blendmode.h defines each mode. */
function blend(mode: Mode, s: number, d: number, a: number): number {
  switch (mode) {
    case "NONE": return s;
    case "BLEND": return s * a + d * (1 - a);
    case "ADD": return Math.min(1, s * a + d);
    case "MOD": return s * d;
    case "MUL": return Math.min(1, s * d + d * (1 - a));
  }
}

const FORMULA: Record<Mode, string> = {
  NONE: "dst = src",
  BLEND: "dst = src × srcA + dst × (1 − srcA)",
  ADD: "dst = src × srcA + dst",
  MOD: "dst = src × dst",
  MUL: "dst = src × dst + dst × (1 − srcA)",
};

const W = 600, BAR_H = 90, RAMP_H = 50, TOP = 6;
const RECT = { x: 120, y: 40, w: 360, h: 80 };   // the rectangle being drawn

const css = (c: RGB) => `rgb(${c.map(Math.round).join(",")})`;
const n255 = (v: number) => Math.round(v * 255);

export function BlendModesFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("BLEND");
  const [srcName, setSrcName] = useState("red");
  const [alpha, setAlpha] = useState(128);
  const [probe, setProbe] = useState<{ x: number; y: number }>({ x: 2.5 * (W / 6), y: TOP + 60 });

  const src = SRC[srcName];
  const a = alpha / 255;

  // The destination under a point, before the rectangle is drawn
  const dstAt = (x: number, y: number): RGB => {
    if (y < TOP + BAR_H) return BARS[Math.min(5, Math.floor(x / (W / 6)))];
    const v = (Math.min(RAMP - 1, Math.floor(x / (W / RAMP))) / (RAMP - 1)) * 255;
    return [v, v, v];
  };
  const out = (d: RGB): RGB => [0, 1, 2].map(i => blend(mode, src[i] / 255, d[i] / 255, a) * 255) as RGB;

  // Cells: one per bar (top) or ramp step (bottom), split where the rectangle starts and ends
  const cells: { x: number; y: number; w: number; h: number; d: RGB }[] = [];
  const xs = (n: number) => Array.from({ length: n + 1 }, (_, i) => (i * W) / n);
  const add = (n: number, y0: number, y1: number) => {
    const edges = xs(n);
    for (let i = 0; i < n; i++) {
      const d = dstAt(edges[i] + 1, y0 + 1);
      const cuts = [edges[i], ...[RECT.x, RECT.x + RECT.w].filter(v => v > edges[i] && v < edges[i + 1]), edges[i + 1]];
      const ycuts = [y0, ...[RECT.y, RECT.y + RECT.h].filter(v => v > y0 && v < y1), y1];
      for (let a2 = 0; a2 < cuts.length - 1; a2++) for (let b = 0; b < ycuts.length - 1; b++)
        cells.push({ x: cuts[a2], y: ycuts[b], w: cuts[a2 + 1] - cuts[a2], h: ycuts[b + 1] - ycuts[b], d });
    }
  };
  add(6, TOP, TOP + BAR_H);
  add(RAMP, TOP + BAR_H, TOP + BAR_H + RAMP_H);
  const under = (c: { x: number; y: number; w: number; h: number }) =>
    c.x >= RECT.x && c.x + c.w <= RECT.x + RECT.w && c.y >= RECT.y && c.y + c.h <= RECT.y + RECT.h;

  const pd = dstAt(probe.x, probe.y);
  const inRect = probe.x >= RECT.x && probe.x < RECT.x + RECT.w && probe.y >= RECT.y && probe.y < RECT.y + RECT.h;
  const po = inRect ? out(pd) : pd;
  const H = TOP + BAR_H + RAMP_H + 6;

  const why: Record<Mode, string> = {
    NONE: tx(t, "figSdlBlend_wNone", "The default. The colour replaces what is there and the alpha is just copied into the target. A window does not show its alpha, so the rectangle looks opaque at every alpha. This is the \"my alpha is ignored\" surprise."),
    BLEND: tx(t, "figSdlBlend_wBlend", "Ordinary transparency: alpha 255 covers, 0 leaves the frame unchanged, 128 is half and half. Shadows, fades, glass."),
    ADD: tx(t, "figSdlBlend_wAdd", "Adds light: the result is never darker than what was there, and it saturates at white. Fire, sparks, glows, lasers. Over black it shows the source colour; over white it changes nothing."),
    MOD: tx(t, "figSdlBlend_wMod", "Multiplies by the source colour and ignores alpha: like a coloured filter. White leaves the frame unchanged, black makes it black. Tinting, darkness with a light-mask texture."),
    MUL: tx(t, "figSdlBlend_wMul", "MOD with alpha: at alpha 255 it is MOD, at 0 it changes nothing. Useful for textures whose transparent parts should not darken anything."),
  };

  return (
    <Figure
      title={tx(t, "figSdlBlend_title", "Blend modes: one rectangle over a finished frame")}
      controls={
        <div className="space-y-3">
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-20">SDL_BLENDMODE_</span>
            <Choice value={mode} onChange={setMode}
              options={[["NONE", "NONE"], ["BLEND", "BLEND"], ["ADD", "ADD"], ["MOD", "MOD"], ["MUL", "MUL"]] as const} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-20">{tx(t, "figSdlBlend_colour", "colour")}</span>
            {Object.entries(SRC).map(([k, c]) => (
              <Btn key={k} active={srcName === k} onClick={() => setSrcName(k)}>
                <span className="inline-block w-3 h-3 rounded-sm align-[-2px] border border-[var(--border)]" style={{ background: css(c) }} />
              </Btn>
            ))}
          </Row>
          <Slider label={tx(t, "figSdlBlend_alpha", "alpha")} value={alpha} min={0} max={255} step={1} onChange={setAlpha} fmt={v => String(v)} width="w-20" />
          <p className="font-mono text-[11.5px] leading-relaxed text-[var(--text-main)]">
            <span className="text-[var(--text-muted)]">{FORMULA[mode]}</span><br />
            {inRect ? <>
              src ({src.join(", ")}) · srcA {alpha} · dst ({pd.map(Math.round).join(", ")}) → <span style={{ color: C.sky }}>({po.map(Math.round).join(", ")})</span>
              {mode === "BLEND" && <span className="text-[var(--text-muted)]"> · R: {src[0]} × {a.toFixed(2)} + {Math.round(pd[0])} × {(1 - a).toFixed(2)} = {n255(blend("BLEND", src[0] / 255, pd[0] / 255, a))}</span>}
            </> : <span className="text-[var(--text-muted)]">{tx(t, "figSdlBlend_outside", "this cell is outside the rectangle: it keeps its colour")} ({pd.map(Math.round).join(", ")})</span>}
          </p>
          <p className="text-[12.5px] leading-relaxed text-[var(--text-main)]">{why[mode]}</p>
        </div>
      }
      note={tx(t, "figSdlBlend_note", "The frame already holds six colour bars and a black-to-white ramp. The dashed rectangle is drawn on top with SDL_SetRenderDrawColor(r, g, b, alpha) and SDL_RenderFillRect, in the chosen blend mode. Click any cell inside it to see the formula with its numbers. Values are 0 to 255 on screen and 0 to 1 inside the formula.")}
    >
      <div className="p-3 md:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ cursor: "crosshair" }}
          aria-label={tx(t, "figSdlBlend_aria", "colour bars with a rectangle blended on top")}
          onClick={e => {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            setProbe({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
          }}>
          {cells.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width={c.w + 0.5} height={c.h + 0.5} fill={css(under(c) ? out(c.d) : c.d)} />
          ))}
          <rect x={RECT.x} y={RECT.y} width={RECT.w} height={RECT.h} fill="none" stroke="var(--text-main)" strokeOpacity={0.55} strokeDasharray="5 4" />
          <circle cx={probe.x} cy={probe.y} r={5} fill="none" stroke="#000" strokeWidth={3} />
          <circle cx={probe.x} cy={probe.y} r={5} fill="none" stroke="#fff" strokeWidth={1.5} />
        </svg>
      </div>
    </Figure>
  );
}

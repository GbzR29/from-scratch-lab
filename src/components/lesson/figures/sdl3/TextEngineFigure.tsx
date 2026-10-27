"use client";

import { useEffect, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C } from "@/components/lesson/kit/figure";
import { useMicroFont, layout, coverage, type Font } from "./microFont";

// ── What this figure shows ────────────────────────────────────────────────────
// What the renderer text engine does with a TTF_Text, next to the surface
// path. The engine rasterizes each distinct glyph once, at 22 points, into an
// atlas texture, and draws a string as one quad per glyph that points into the
// atlas; changing the string only rebuilds the quad list, and a glyph it has
// never seen is added to the atlas. The surface path (TTF_RenderText_Blended +
// SDL_CreateTextureFromSurface) rasterizes and uploads the whole string on
// every change. The counters add up the bytes each path sends to the GPU
// (4 bytes per pixel). Packing is a simple shelf, a stand-in for SDL_ttf's
// rectangle packer; the real atlas is 1024 × 1024.

const PT = 22;
const AW = 72, AH = 34, PAD = 1;              // the drawn atlas, in pixels
type Slot = { x: number; y: number; w: number; h: number };
type Atlas = { slots: Map<string, Slot>; cx: number; cy: number; row: number; full: boolean };
type Stats = { glyphBytes: number; surfBytes: number; changes: number; last: string | null };

const emptyAtlas = (): Atlas => ({ slots: new Map(), cx: PAD, cy: PAD, row: 0, full: false });

/** Adds the glyphs of `text` the atlas has not seen; returns the new atlas, the bytes uploaded and the last glyph added. */
function addGlyphs(font: Font, a: Atlas, text: string) {
  const next: Atlas = { ...a, slots: new Map(a.slots) };
  let bytes = 0, last: string | null = null;
  for (const ch of text) {
    if (next.slots.has(ch)) continue;
    const g = font.glyph(ch.codePointAt(0) ?? 0);
    if (!g || !g.contours.length) continue;               // spaces take no atlas room
    const { w, h } = coverage(g, PT, font.upem, 1);
    if (next.cx + w + PAD > AW) { next.cx = PAD; next.cy += next.row + PAD; next.row = 0; }
    if (next.cy + h + PAD > AH) { next.full = true; continue; }
    next.slots.set(ch, { x: next.cx, y: next.cy, w, h });
    next.cx += w + PAD;
    next.row = Math.max(next.row, h);
    bytes += w * h * 4;
    last = ch;
  }
  return { atlas: next, bytes, last };
}

export function TextEngineFigure({ t }: { t?: TrackTranslations }) {
  const font = useMicroFont();
  const [text, setText] = useState("Score 0");
  const [score, setScore] = useState(0);
  const [atlas, setAtlas] = useState<Atlas>(emptyAtlas);
  const [stats, setStats] = useState<Stats>({ glyphBytes: 0, surfBytes: 0, changes: 0, last: null });

  // Every change of the string: what each path has to do
  const apply = (next: string, f: Font | null = font, base: Atlas = atlas, before: Stats = stats) => {
    setText(next);
    if (!f) return;
    const L = layout(f, next, PT);
    const r = addGlyphs(f, base, next);
    setAtlas(r.atlas);
    setStats({ glyphBytes: before.glyphBytes + r.bytes, surfBytes: before.surfBytes + L.w * L.h * 4, changes: before.changes + 1, last: r.last });
  };
  useEffect(() => { if (font) apply(text, font); }, [font]);   // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setScore(0);
    apply("Score 0", font, emptyAtlas(), { glyphBytes: 0, surfBytes: 0, changes: 0, last: null });
  };
  const bump = (n: number) => { const s = score + n; setScore(s); apply(`Score ${s}`); };

  const L = font ? layout(font, text, PT) : null;
  const Z = 4, gap = 28;
  const screenW = Math.max(L?.pen ?? 0, 60) * Z;
  const W = screenW + gap + AW * Z + 4, H = Math.max(PT + 6, AH) * Z + 20;
  const kb = (b: number) => (b < 10240 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`);
  const perFrame = L ? L.w * L.h * 4 * 60 : 0;

  return (
    <Figure
      title={tx(t, "figSdlEngine_title", "The text engine: glyphs once, strings for free")}
      head={<Btn onClick={reset}>{tx(t, "figSdlEngine_reset", "reset")}</Btn>}
      controls={
        <div className="space-y-3">
          <Row>
            <Btn onClick={() => bump(1)}>{tx(t, "figSdlEngine_plus1", "+1 score")}</Btn>
            <Btn onClick={() => bump(10)}>+10</Btn>
            <input value={text} maxLength={16} onChange={e => apply(e.target.value)}
              aria-label={tx(t, "figSdlEngine_input", "the string of the TTF_Text")}
              className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] font-mono text-[12px] w-40" />
          </Row>
          <Row>
            <Readout color={C.sky}>{tx(t, "figSdlEngine_atlas", "engine")}: {atlas.slots.size} {tx(t, "figSdlEngine_glyphs", "glyphs rasterized")} · {kb(stats.glyphBytes)} {tx(t, "figSdlEngine_up", "uploaded")}</Readout>
            <Readout color={C.orange}>{tx(t, "figSdlEngine_surface", "surface path")}: {stats.changes} × {tx(t, "figSdlEngine_whole", "whole string")} · {kb(stats.surfBytes)} {tx(t, "figSdlEngine_up", "uploaded")}</Readout>
          </Row>
          <p className="text-[12.5px] leading-relaxed text-[var(--text-main)]">
            {stats.last
              ? <>{tx(t, "figSdlEngine_new", "New glyph")} <span className="font-mono" style={{ color: C.amber }}>&apos;{stats.last}&apos;</span>: {tx(t, "figSdlEngine_newBody", "rasterized once and copied into the atlas. Every later string that uses it costs nothing but a quad.")}</>
              : tx(t, "figSdlEngine_reuse", "Every glyph of this string is already in the atlas: the engine only rebuilt its list of quads, and nothing was sent to the GPU.")}
            {" "}{atlas.full && <span style={{ color: C.red }}>{tx(t, "figSdlEngine_full", "This small drawn atlas is full; the real one is 1024 × 1024, and SDL_ttf opens another texture when one fills up.")}</span>}
          </p>
          <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
            {tx(t, "figSdlEngine_frame", "Rebuilding this string with the surface path every frame at 60 fps would upload")}{" "}
            <span className="font-mono" style={{ color: C.orange }}>{kb(perFrame)}/s</span>
            {tx(t, "figSdlEngine_frame2", ", and rasterize it 60 times a second, for text that changes a few times a minute.")}
          </p>
        </div>
      }
      note={tx(t, "figSdlEngine_note", "Left: the string on screen, drawn as one quad per glyph (dashed). Right: the engine's atlas texture, filled as new glyphs appear. Press +1 a few times: the digits are added once, then every new score reuses them. The surface path counter grows by the size of the whole string on every change.")}
    >
      <div className="p-3 md:p-4 overflow-x-auto">
        {!L || !font ? (
          <p className="text-[12px] text-[var(--text-muted)] p-6 text-center">{tx(t, "figSdlEngine_loading", "loading the font…")}</p>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W * 1.3, minWidth: 320 }} role="img"
            aria-label={tx(t, "figSdlEngine_aria", "a string drawn from glyph quads, and the atlas texture they come from")}>
            <text x={0} y={10} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>
              TTF_DrawRendererText · {L.placed.filter(p => p.g.contours.length).length} quads
            </text>
            <rect x={0} y={16} width={screenW} height={(PT + 6) * Z} fill="#10121a" />
            {L.placed.map((p, i) => {
              if (!p.g.contours.length) return null;
              const cov = coverage(p.g, PT, font.upem, 1);
              const x0 = p.pen + cov.m.minx, y0 = 3 + L.fm.ascent - cov.m.maxy;
              const cells = [];
              for (let r = 0; r < cov.h; r++) for (let c = 0; c < cov.w; c++)
                if (cov.a[r * cov.w + c] > 0) cells.push(<rect key={`${r}-${c}`} x={(x0 + c) * Z} y={16 + (y0 + r) * Z} width={Z} height={Z} fill="#facc15" />);
              return (
                <g key={i}>
                  {cells}
                  <rect x={x0 * Z} y={16 + y0 * Z} width={cov.w * Z} height={cov.h * Z} fill="none" stroke={C.sky} strokeOpacity={0.7} strokeDasharray="3 2" />
                </g>
              );
            })}

            <g transform={`translate(${screenW + gap} 0)`}>
              <text x={0} y={10} style={{ fontSize: 10, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>
                {tx(t, "figSdlEngine_atlasLabel", "atlas texture")}
              </text>
              <rect x={0} y={16} width={AW * Z} height={AH * Z} fill="#00000055" stroke="var(--border)" />
              {[...atlas.slots.entries()].map(([ch, s]) => {
                const g = font.glyph(ch.codePointAt(0) ?? 0)!;
                const cov = coverage(g, PT, font.upem, 1);
                const cells = [];
                for (let r = 0; r < cov.h; r++) for (let c = 0; c < cov.w; c++)
                  if (cov.a[r * cov.w + c] > 0) cells.push(<rect key={`${r}-${c}`} x={(s.x + c) * Z} y={16 + (s.y + r) * Z} width={Z} height={Z} fill="#f8fafc" />);
                return (
                  <g key={ch}>
                    <rect x={s.x * Z} y={16 + s.y * Z} width={s.w * Z} height={s.h * Z} fill={ch === stats.last ? `${C.amber}55` : "#ffffff0a"} stroke={ch === stats.last ? C.amber : "var(--code-line)"} />
                    {cells}
                  </g>
                );
              })}
            </g>
            <text x={screenW + gap / 2} y={16 + (PT + 6) * Z / 2} textAnchor="middle" style={{ fontSize: 14, fill: C.muted }}>←</text>
          </svg>
        )}
      </div>
    </Figure>
  );
}

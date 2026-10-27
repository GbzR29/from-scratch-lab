"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Row, Readout, C } from "@/components/lesson/kit/figure";
import { useMicroFont, layout, coverage } from "./microFont";

// ── What this figure shows ────────────────────────────────────────────────────
// One line of the project's font, Micro 5, measured exactly as SDL_ttf 3.2
// measures it (microFont.ts reads the real .ttf). Horizontal lines: the line's
// top, the baseline (ascent below the top), the descent line and the next
// line's top (line skip). Each glyph sits in its advance box; clicking one
// shows its TTF_GetGlyphMetrics ink box. Three views: the outline as drawn by
// the type designer, Blended (coverage → alpha) and Solid (coverage ≥ 50% →
// opaque). At 11 and 22 points the outline lands on whole pixels, so all views
// agree; at 16 it does not, and the pixels turn grey or ragged.

type View = "outline" | "blended" | "solid";
const SIZES = [["11", "11 pt"], ["16", "16 pt"], ["22", "22 pt"], ["33", "33 pt"]] as const;
const ML = 150, MR = 12, MT = 14;              // margins, in drawing units

export function GlyphMetricsFigure({ t }: { t?: TrackTranslations }) {
  const font = useMicroFont();
  const [text, setText] = useState("Glyph 42");
  const [size, setSize] = useState<(typeof SIZES)[number][0]>("22");
  const [view, setView] = useState<View>("outline");
  const [sel, setSel] = useState<number | null>(0);

  const pt = Number(size);
  const L = font ? layout(font, text, pt) : null;
  const Z = L ? Math.max(3, Math.min(16, Math.floor(520 / Math.max(L.pen, 24)))) : 8;   // drawing units per pixel
  const W = ML + Math.max(L?.pen ?? 0, 24) * Z + MR;
  const lineH = L ? L.fm.lineskip : pt;
  const H = MT + (lineH + 4) * Z + 8;
  const yOf = (row: number) => MT + row * Z;          // row 0 = the line's top
  const xOf = (px: number) => ML + px * Z;
  const placed = L?.placed ?? [];
  const pick = sel !== null && sel < placed.length ? placed[sel] : null;
  const onGrid = pt % 11 === 0;

  const lines = L ? [
    { row: 0, label: tx(t, "figSdlGlyph_top", "top: the y you draw at"), col: C.muted, dash: "4 3" },
    { row: L.fm.ascent, label: tx(t, "figSdlGlyph_base", "baseline"), col: C.amber, dash: "" },
    ...(L.fm.lineskip === L.fm.ascent - L.fm.descent
      ? [{ row: L.fm.lineskip, label: tx(t, "figSdlGlyph_descNext", "descent = next top"), col: C.purple, dash: "4 3" }]
      : [
        { row: L.fm.ascent - L.fm.descent, label: tx(t, "figSdlGlyph_desc", "descent"), col: C.purple, dash: "4 3" },
        { row: L.fm.lineskip, label: tx(t, "figSdlGlyph_next", "next line's top"), col: C.sky, dash: "2 3" },
      ]),
  ] : [];

  return (
    <Figure
      title={tx(t, "figSdlGlyph_title", "Glyph metrics, as SDL_ttf measures them")}
      controls={
        <div className="space-y-3">
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-16">{tx(t, "figSdlGlyph_text", "text")}</span>
            <input value={text} maxLength={14} onChange={e => { setText(e.target.value); setSel(null); }}
              className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-main)] font-mono text-[12px] w-40" />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-16">ptsize</span>
            <Choice value={size} onChange={setSize} options={SIZES} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-16">{tx(t, "figSdlGlyph_view", "view")}</span>
            <Choice value={view} onChange={setView}
              options={[["outline", tx(t, "figSdlGlyph_outline", "outline")], ["blended", "Blended"], ["solid", "Solid"]] as const} />
          </Row>
          {L && (
            <Row>
              <Readout color={C.amber}>TTF_GetFontAscent = {L.fm.ascent}</Readout>
              <Readout color={C.purple}>TTF_GetFontDescent = {L.fm.descent}</Readout>
              <Readout>TTF_GetFontHeight = {L.fm.height}</Readout>
              <Readout color={C.sky}>TTF_GetFontLineSkip = {L.fm.lineskip}</Readout>
              <Readout color={C.green}>TTF_GetStringSize = {L.w} × {L.h}</Readout>
            </Row>
          )}
          {pick && (
            <p className="font-mono text-[11.5px] text-[var(--text-main)]">
              TTF_GetGlyphMetrics(&apos;{pick.ch === " " ? "␠" : pick.ch}&apos;) → minx {pick.m.minx}, maxx {pick.m.maxx}, miny {pick.m.miny}, maxy {pick.m.maxy},{" "}
              <span style={{ color: C.orange }}>advance {pick.m.advance}</span>
            </p>
          )}
          <p className="text-[12.5px] leading-relaxed" style={{ color: onGrid ? C.green : C.red }}>
            {onGrid
              ? tx(t, "figSdlGlyph_onGrid", "Micro 5 is drawn on a grid of 150 font units, and 1650 units make one em, so the font has 11 pixels per em. At a multiple of 11 points every edge of the outline falls on a pixel edge: every pixel is fully inside or fully outside, and Blended and Solid give the same sharp result.")
              : tx(t, "figSdlGlyph_offGrid", "At 16 points one font pixel is 16 / 11 ≈ 1.45 screen pixels. Edges fall inside pixels: Blended paints those pixels half transparent (a grey fringe), Solid rounds each one to on or off, so some strokes come out 1 pixel wide and others 2.")}
          </p>
        </div>
      }
      note={tx(t, "figSdlGlyph_note", "This is the project's font, read from the real Micro5-Regular.ttf with the same formulas SDL_ttf uses. The grey grid is the screen's pixels. Each glyph's tinted box is its advance: the pen moves that far before the next glyph. Click a glyph to see its ink box (dashed) and its metrics. The string size is what TTF_GetStringSize returns: the advances added up, and the font height.")}
    >
      <div className="p-3 md:p-4 overflow-x-auto">
        {!L ? (
          <p className="text-[12px] text-[var(--text-muted)] p-6 text-center">{tx(t, "figSdlGlyph_loading", "loading the font…")}</p>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W * 1.2, minWidth: 320 }} role="img"
            aria-label={tx(t, "figSdlGlyph_aria", "a line of text with its baseline, ascent, descent and glyph advance boxes")}>
            {/* advance boxes */}
            {placed.map((p, i) => (
              <rect key={`a${i}`} x={xOf(p.pen)} y={yOf(0)} width={p.m.advance * Z} height={L.fm.height * Z}
                fill={i === sel ? `${C.orange}33` : i % 2 ? "#ffffff0d" : "#ffffff05"}
                stroke={i === sel ? C.orange : "none"} style={{ cursor: "pointer" }} onClick={() => setSel(i)} />
            ))}
            {/* pixel grid */}
            {Array.from({ length: Math.max(L.pen, 24) + 1 }, (_, i) => (
              <line key={`gx${i}`} x1={xOf(i)} x2={xOf(i)} y1={yOf(0)} y2={yOf(lineH)} stroke="var(--code-line)" strokeWidth={0.6} pointerEvents="none" />
            ))}
            {Array.from({ length: lineH + 1 }, (_, i) => (
              <line key={`gy${i}`} x1={ML} x2={W - MR} y1={yOf(i)} y2={yOf(i)} stroke="var(--code-line)" strokeWidth={0.6} pointerEvents="none" />
            ))}

            {/* glyphs */}
            <g pointerEvents="none">
              {placed.map((p, i) => {
                if (!p.g.contours.length) return null;
                if (view === "outline") {
                  const s = (pt / font!.upem) * Z;
                  const d = p.g.contours.map(c => c.map(([x, y], k) => `${k ? "L" : "M"}${(xOf(p.pen) + x * s).toFixed(2)} ${(yOf(L.fm.ascent) - y * s).toFixed(2)}`).join(" ") + "Z").join(" ");
                  return <path key={`g${i}`} d={d} fill="#e2e8f0" fillOpacity={0.85} fillRule="nonzero" stroke="#f8fafc" strokeWidth={0.8} />;
                }
                const cov = coverage(p.g, pt, font!.upem);
                const cells = [];
                for (let r = 0; r < cov.h; r++) for (let c = 0; c < cov.w; c++) {
                  const a = cov.a[r * cov.w + c];
                  const alpha = view === "solid" ? (a >= 0.5 ? 1 : 0) : a;
                  if (alpha <= 0) continue;
                  cells.push(<rect key={`${i}-${r}-${c}`} x={xOf(p.pen + cov.m.minx + c)} y={yOf(L.fm.ascent - cov.m.maxy + r)}
                    width={Z} height={Z} fill="#e2e8f0" fillOpacity={alpha} />);
                }
                return <g key={`g${i}`}>{cells}</g>;
              })}
            </g>

            {/* metric lines */}
            {lines.map(l => (
              <g key={l.label} pointerEvents="none">
                <line x1={ML - 6} x2={W - MR} y1={yOf(l.row)} y2={yOf(l.row)} stroke={l.col} strokeWidth={1.4} strokeDasharray={l.dash || undefined} />
                <text x={ML - 9} y={yOf(l.row) + 3.5} textAnchor="end" style={{ fontSize: 10, fill: l.col, fontFamily: "var(--font-mono, monospace)" }}>
                  {l.label}
                </text>
              </g>
            ))}

            {/* the picked glyph's ink box */}
            {pick && pick.g.contours.length > 0 && (
              <rect x={xOf(pick.pen + pick.m.minx)} y={yOf(L.fm.ascent - pick.m.maxy)}
                width={(pick.m.maxx - pick.m.minx) * Z} height={(pick.m.maxy - pick.m.miny) * Z}
                fill="none" stroke={C.green} strokeWidth={1.4} strokeDasharray="4 3" pointerEvents="none" />
            )}
          </svg>
        )}
      </div>
    </Figure>
  );
}

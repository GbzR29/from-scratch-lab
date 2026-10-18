// src/lib/og/card.tsx
// The link-preview image (Open Graph, 1200×630) of every page, drawn like the
// site: a sheet on drafting paper with a label strip on top, the track's
// drawn glyph (or the mark) in a dashed box, a Spectral title, and a title
// block at the bottom. Pages call the builders in ./cards.tsx; this file only
// draws. ImageResponse cannot read CSS variables, so colours are literals here
// (the home page's light tokens, src/styles/home.css).

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Mark } from "@/components/brand/Mark";
import { TrackGlyph } from "@/components/brand/TrackGlyph";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#f2f0e8";
const SHEET = "#f7f6f0";
const INK = "#14304d";
const MUTED = "#3d5670";
const PENCIL = "#d9541e";
const PENCIL_TEXT = "#b3421a";
const DRAW = "#2b6cb0";
const GRID_MAJOR = "rgba(27, 74, 122, 0.10)";
const GRID_MINOR = "rgba(27, 74, 122, 0.045)";

export interface OgCard {
  /** Small mono line above the title ("learn / OpenGL 4.6"). */
  eyebrow: string;
  title: string;
  /** Mono title (function names) instead of Spectral. */
  monoTitle?: boolean;
  /** One line under the title ("lesson 4 of 70 · 10 min read"). */
  detail?: string;
  /** Right side of the footer ("free interactive course"). */
  footer: string;
  /** Catalog id of the track whose glyph is drawn; the mark when absent. */
  glyph?: string;
}

// Fonts are read once per server instance
let assets: Promise<{ spectral: Buffer; mono: Buffer }> | undefined;
function loadAssets() {
  assets ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Spectral-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/IBMPlexMono-Regular.ttf")),
  ]).then(([spectral, mono]) => ({ spectral, mono }));
  return assets;
}

/** Long titles get smaller type so they still fit in three lines. */
function titleSize(title: string, mono: boolean): number {
  const n = title.length * (mono ? 1.25 : 1);
  if (n <= 20) return 84;
  if (n <= 38) return 68;
  if (n <= 62) return 56;
  return 46;
}

export async function renderOgCard(card: OgCard): Promise<ImageResponse> {
  const { spectral, mono } = await loadAssets();
  const glyphColors = { accent: PENCIL, bg: SHEET, font: "Plex Mono" };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", padding: 36,
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(${GRID_MAJOR} 1px, transparent 1px), linear-gradient(90deg, ${GRID_MAJOR} 1px, transparent 1px), linear-gradient(${GRID_MINOR} 1px, transparent 1px), linear-gradient(90deg, ${GRID_MINOR} 1px, transparent 1px)`,
          backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
          fontFamily: "Plex Mono",
          color: INK,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: `2px solid ${INK}`, backgroundColor: SHEET }}>
          {/* ── Label strip ── */}
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 24px", borderBottom: `2px solid ${INK}`,
              fontSize: 21, letterSpacing: 2, textTransform: "uppercase",
            }}
          >
            <span style={{ color: PENCIL_TEXT }}>{card.eyebrow}</span>
            <span style={{ color: MUTED }}>fromscratchlab.com</span>
          </div>

          {/* ── Glyph + title ── */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 40px" }}>
            <div
              style={{
                width: 200, height: 200, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px dashed ${DRAW}`, marginRight: 44, color: INK,
              }}
            >
              {card.glyph
                ? <TrackGlyph id={card.glyph} size={150} colors={glyphColors} />
                : <Mark size={150} accent={PENCIL} />}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: card.monoTitle ? "Plex Mono" : "Spectral",
                  fontSize: titleSize(card.title, !!card.monoTitle),
                  lineHeight: 1.08,
                  letterSpacing: card.monoTitle ? 0 : -0.5,
                }}
              >
                {card.title}
              </div>
              {card.detail && (
                <div style={{ display: "flex", marginTop: 22, fontSize: 24, color: MUTED }}>{card.detail}</div>
              )}
            </div>
          </div>

          {/* ── Title block ── */}
          <div style={{ display: "flex", borderTop: `2px solid ${INK}`, fontSize: 20 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 22px", borderRight: `2px solid ${INK}`, color: INK }}>
              <Mark size={40} accent={PENCIL} />
              <span style={{ fontFamily: "Spectral", fontSize: 28, marginLeft: 14 }}>From Scratch Lab</span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "12px 22px", color: MUTED }}>{card.footer}</div>
            <div style={{ width: 64, display: "flex", borderLeft: `2px solid ${INK}`, backgroundColor: PENCIL }} />
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Spectral", data: spectral, style: "normal", weight: 400 },
        { name: "Plex Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}

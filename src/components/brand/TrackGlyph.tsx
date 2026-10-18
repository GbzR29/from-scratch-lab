// src/components/brand/TrackGlyph.tsx
// One small technical drawing per track (keyed by the catalog id), used on the
// home page cards, the learning paths and the lesson sidebar. Ink follows
// currentColor; --glyph-accent fills the highlighted part and --glyph-bg the
// hollow dots (set both to the surface the glyph sits on). The link-preview
// images cannot read CSS variables, so they pass the colours as props.

import type { ReactNode } from "react";

/** A = accent fill, B = hollow fill, F = font of the one glyph with text.
 *  Each glyph is a <g>, not a fragment: the preview images' renderer only
 *  accepts real SVG elements inside <svg>. */
const glyphs = (A: string, B: string, F: string): Record<string, ReactNode> => ({
  cpp: (
    <g>
      <rect x="3" y="15" width="16" height="18" />
      <circle cx="11" cy="24" r="2.6" fill={A} stroke="none" />
      <path d="M13.6 24 C20 24 21 20.5 28.5 20.5" />
      <path d="M25.5 18 L29 20.5 L25.5 23" />
      <rect x="29.5" y="10" width="15" height="28" />
      <path d="M29.5 17 H44.5 M29.5 24 H44.5 M29.5 31 H44.5" />
    </g>
  ),
  asm: (
    <g>
      <rect x="13" y="13" width="22" height="22" />
      <rect x="19" y="19" width="10" height="10" fill={A} stroke="none" />
      <path d="M18 13V7 M24 13V7 M30 13V7 M18 35v6 M24 35v6 M30 35v6 M13 18H7 M13 24H7 M13 30H7 M35 18h6 M35 24h6 M35 30h6" />
    </g>
  ),
  algorithms: (
    <g>
      <path d="M24 10 L13 24 M24 10 L35 24 M13 24 L8 38 M13 24 L18 38 M35 24 L35 38" />
      <circle cx="24" cy="10" r="4" fill={A} />
      <circle cx="13" cy="24" r="4" fill={B} />
      <circle cx="35" cy="24" r="4" fill={B} />
      <circle cx="8" cy="38" r="3.5" fill={B} />
      <circle cx="18" cy="38" r="3.5" fill={B} />
      <circle cx="35" cy="38" r="3.5" fill={B} />
    </g>
  ),
  ai: (
    <g>
      <path
        d="M8 14 L24 9 M8 14 L24 24 M8 14 L24 39 M8 34 L24 9 M8 34 L24 24 M8 34 L24 39 M24 9 L40 24 M24 24 L40 24 M24 39 L40 24"
        strokeWidth="1"
      />
      <circle cx="8" cy="14" r="3.5" fill={B} />
      <circle cx="8" cy="34" r="3.5" fill={B} />
      <circle cx="24" cy="9" r="3.5" fill={B} />
      <circle cx="24" cy="24" r="3.5" fill={B} />
      <circle cx="24" cy="39" r="3.5" fill={B} />
      <circle cx="40" cy="24" r="4" fill={A} />
    </g>
  ),
  opengl: (
    <g>
      <path d="M24 7 L42 39 H6 Z" fill={A} fillOpacity=".14" />
      <path d="M24 7 L24 39 M15 23 L33 23" strokeDasharray="2 3" strokeWidth="1" />
      <circle cx="24" cy="7" r="3" fill={A} stroke="none" />
      <circle cx="42" cy="39" r="3" fill={B} />
      <circle cx="6" cy="39" r="3" fill={B} />
    </g>
  ),
  glsl: (
    <g>
      <g stroke="none" fill={A}>
        {[
          [0.95, 0.65, 0.35, 0.12],
          [0.65, 0.5, 0.28, 0.1],
          [0.35, 0.28, 0.16, 0.06],
          [0.12, 0.1, 0.06, 0],
        ].flatMap((row, r) =>
          row.map((o, c) => <rect key={`${r}${c}`} x={6 + 9 * c} y={6 + 9 * r} width="9" height="9" opacity={o} />),
        )}
      </g>
      <rect x="6" y="6" width="36" height="36" />
      <path d="M15 6V42 M24 6V42 M33 6V42 M6 15H42 M6 24H42 M6 33H42" strokeWidth="1" />
    </g>
  ),
  vulkan: (
    <g>
      <path d="M24 8 L42 16 L24 24 L6 16 Z" fill={A} fillOpacity=".3" />
      <path d="M6 24 L24 32 L42 24" />
      <path d="M6 32 L24 40 L42 32" />
    </g>
  ),
  sdl3: (
    <g>
      <rect x="5" y="8" width="38" height="32" />
      <path d="M5 15 H43" />
      <circle cx="9.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <rect x="17" y="24" width="8" height="8" fill={A} stroke="none" />
      <path d="M9 34 H39 M10 26 H14 M10 30 H13" />
    </g>
  ),
  gamedev: (
    <g>
      <path d="M38 24 A14 14 0 1 1 33.9 14.1" />
      <path d="M33 8.5 L34.2 14.4 L28.3 15" />
      <circle cx="38" cy="24" r="2.6" fill={A} stroke="none" />
      <text x="24" y="28" textAnchor="middle" fontFamily={F} fontSize="11" fill="currentColor" stroke="none">
        dt
      </text>
    </g>
  ),
  math: (
    <g>
      <path d="M16 31.2 C21 27 26 17 32 14.2 V40 H16 Z" fill={A} fillOpacity=".28" stroke="none" />
      <path d="M8 40 H43 M8 40 V5" />
      <path d="M8 35 C18 31 24 15 42 10" />
      <path d="M16 31 V40 M32 14 V40" strokeDasharray="2 3" strokeWidth="1" />
    </g>
  ),
  physics: (
    <g>
      <path d="M6 10 V38 M6 14 l-3 3 M6 21 l-3 3 M6 28 l-3 3 M6 35 l-3 3" />
      <path d="M6 24 H9.5 l2.5 -6 l4 12 l4 -12 l4 12 l2.5 -6 H30" />
      <rect x="30" y="16" width="12" height="16" fill={A} stroke="none" />
      <path d="M4 40 H45" />
    </g>
  ),
  chemistry: (
    <g>
      <path d="M24 8 L37.9 16 L37.9 32 L24 40 L10.1 32 L10.1 16 Z" />
      <circle cx="24" cy="24" r="8" />
      <circle cx="24" cy="8" r="2.8" fill={A} stroke="none" />
    </g>
  ),
  music: (
    <g>
      <path d="M5 14 H43 M5 19 H43 M5 24 H43 M5 29 H43 M5 34 H43" strokeWidth="1" />
      <ellipse cx="22" cy="29.5" rx="4.6" ry="3.3" transform="rotate(-20 22 29.5)" fill={A} stroke="none" />
      <path d="M26.2 28.5 V9 C29.5 12 33 13.5 32 19.5" />
    </g>
  ),
});

const PAGE = glyphs("var(--glyph-accent, #d9541e)", "var(--glyph-bg, #f7f6f0)", "var(--font-plex-mono), monospace");

export function TrackGlyph({ id, size = 48, colors }: {
  id: string;
  size?: number;
  /** Fixed colours and font instead of the CSS variables (preview images). */
  colors?: { accent: string; bg: string; font: string };
}) {
  const glyph = (colors ? glyphs(colors.accent, colors.bg, colors.font) : PAGE)[id];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: "block", flex: "none" }}
    >
      {glyph}
    </svg>
  );
}

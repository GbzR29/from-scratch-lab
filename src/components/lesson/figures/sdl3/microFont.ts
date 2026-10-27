"use client";

// ── The project's font, read the way SDL_ttf reads it ─────────────────────────
// A tiny TrueType reader for public/sdl3/Micro5-Regular.ttf, the pixel font of
// the SDL3 code-along. It reads head, hhea, hmtx, cmap (format 4), loca and glyf
// (simple glyphs; this font has only straight on-curve contours) and computes
// what SDL_ttf 3.2 reports: font metrics as in TTF_InitFontMetrics (ceil of
// units × size / unitsPerEm, 72 DPI so 1 pt = 1 px), glyph boxes and the string
// box of TTF_Size_Internal (no kerning: this font has none). coverage() samples
// a glyph on a pixel grid, which is what FreeType's rasterizer produces.

import { useEffect, useState } from "react";

export const FONT_URL = "/sdl3/Micro5-Regular.ttf";

export type Glyph = { adv: number; xMin: number; yMin: number; xMax: number; yMax: number; contours: [number, number][][] };
export type Font = { upem: number; asc: number; desc: number; gap: number; glyph: (cp: number) => Glyph | null };

function parse(buf: ArrayBuffer): Font {
  const v = new DataView(buf);
  const u16 = (o: number) => v.getUint16(o), i16 = (o: number) => v.getInt16(o), u32 = (o: number) => v.getUint32(o);
  const tables: Record<string, number> = {};
  for (let i = 0; i < u16(4); i++) {
    const o = 12 + 16 * i;
    tables[String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3))] = u32(o + 8);
  }
  const head = tables.head, hhea = tables.hhea, hmtx = tables.hmtx, loca = tables.loca, glyf = tables.glyf;
  const upem = u16(head + 18), longLoca = i16(head + 50) === 1;
  const nH = u16(hhea + 34);

  // cmap: the Windows Unicode BMP subtable, format 4
  const cmap = tables.cmap;
  let sub = 0;
  for (let i = 0; i < u16(cmap + 2); i++) {
    const o = cmap + 4 + 8 * i;
    if (u16(cmap + u32(o + 4)) === 4) { sub = cmap + u32(o + 4); if (u16(o) === 3) break; }
  }
  const segX2 = u16(sub + 6);
  const ends = sub + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
  const glyphId = (cp: number) => {
    for (let i = 0; i < segX2 / 2; i++) {
      if (cp > u16(ends + 2 * i)) continue;
      const start = u16(starts + 2 * i);
      if (cp < start) return 0;
      const ro = u16(ranges + 2 * i);
      if (ro === 0) return (cp + i16(deltas + 2 * i)) & 0xffff;
      const g = u16(ranges + 2 * i + ro + 2 * (cp - start));
      return g ? (g + i16(deltas + 2 * i)) & 0xffff : 0;
    }
    return 0;
  };
  const locaAt = (g: number) => (longLoca ? u32(loca + 4 * g) : 2 * u16(loca + 2 * g));

  const cache = new Map<number, Glyph | null>();
  const readGlyph = (g: number): Glyph => {
    const adv = u16(hmtx + 4 * Math.min(g, nH - 1));
    const s = glyf + locaAt(g), e = glyf + locaAt(g + 1);
    if (e <= s) return { adv, xMin: 0, yMin: 0, xMax: 0, yMax: 0, contours: [] };
    const nc = i16(s);
    const box = { xMin: i16(s + 2), yMin: i16(s + 4), xMax: i16(s + 6), yMax: i16(s + 8) };
    if (nc < 0) return { adv, ...box, contours: [] };          // composite: not in this font
    let p = s + 10;
    const endPts: number[] = [];
    for (let k = 0; k < nc; k++) { endPts.push(u16(p)); p += 2; }
    const np = nc ? endPts[nc - 1] + 1 : 0;
    p += 2 + u16(p);                                           // skip instructions
    const flags: number[] = [];
    while (flags.length < np) {
      const f = v.getUint8(p++);
      flags.push(f);
      if (f & 8) { let r = v.getUint8(p++); while (r--) flags.push(f); }
    }
    const xs: number[] = [], ys: number[] = [];
    for (const [arr, shortBit, sameBit] of [[xs, 2, 16], [ys, 4, 32]] as const) {
      let c = 0;
      for (const f of flags) {
        if (f & shortBit) { const d = v.getUint8(p++); c += f & sameBit ? d : -d; }
        else if (!(f & sameBit)) { c += i16(p); p += 2; }
        arr.push(c);
      }
    }
    const contours: [number, number][][] = [];
    let first = 0;
    for (const end of endPts) {
      const c: [number, number][] = [];
      for (let k = first; k <= end; k++) c.push([xs[k], ys[k]]);
      contours.push(c);
      first = end + 1;
    }
    return { adv, ...box, contours };
  };

  return {
    upem, asc: i16(hhea + 4), desc: i16(hhea + 6), gap: i16(hhea + 8),
    glyph: (cp: number) => {
      if (!cache.has(cp)) { const g = glyphId(cp); cache.set(cp, g ? readGlyph(g) : null); }
      return cache.get(cp) ?? null;
    },
  };
}

let loading: Promise<Font> | null = null;

/** The project's font, or null while it loads. */
export function useMicroFont(): Font | null {
  const [font, setFont] = useState<Font | null>(null);
  useEffect(() => {
    let live = true;
    loading ??= fetch(FONT_URL).then(r => r.arrayBuffer()).then(parse);
    loading.then(f => { if (live) setFont(f); }).catch(() => { loading = null; });
    return () => { live = false; };
  }, []);
  return font;
}

// ── What SDL_ttf reports ──────────────────────────────────────────────────────

/** TTF_GetFontAscent / Descent / Height / LineSkip at `size` points. */
export function fontMetrics(f: Font, size: number) {
  const s = size / f.upem;
  const ceil = (u: number) => Math.ceil(u * s - 1e-9);
  return { ascent: ceil(f.asc), descent: ceil(f.desc), height: ceil(f.asc - f.desc), lineskip: ceil(f.asc - f.desc + f.gap) };
}

/** TTF_GetGlyphMetrics: the ink box relative to the pen and the baseline (y up), and the advance. */
export function glyphMetrics(g: Glyph, size: number, upem: number) {
  const s = size / upem;
  const empty = g.contours.length === 0;
  return {
    minx: empty ? 0 : Math.floor(g.xMin * s + 1e-9), maxx: empty ? 0 : Math.ceil(g.xMax * s - 1e-9),
    miny: empty ? 0 : Math.floor(g.yMin * s + 1e-9), maxy: empty ? 0 : Math.ceil(g.yMax * s - 1e-9),
    advance: Math.round(g.adv * s),
  };
}

export type Placed = { ch: string; g: Glyph; pen: number; m: ReturnType<typeof glyphMetrics> };

/** Pen positions and the TTF_GetStringSize box of a line, as TTF_Size_Internal computes it. */
export function layout(f: Font, text: string, size: number) {
  const fm = fontMetrics(f, size);
  const placed: Placed[] = [];
  let pen = 0, minx = 0, maxx = 0, miny = 0, maxy = fm.height;
  for (const ch of text) {
    const g = f.glyph(ch.codePointAt(0) ?? 0) ?? f.glyph(0x3f);   // a missing glyph shows as "?"
    if (!g) continue;
    const m = glyphMetrics(g, size, f.upem);
    if (g.contours.length) {
      const top = fm.ascent - m.maxy;                       // pos_y: rows below the line top
      minx = Math.min(minx, pen + m.minx);
      maxx = Math.max(maxx, pen + m.maxx);
      miny = Math.min(miny, top);
      maxy = Math.max(maxy, top + (m.maxy - m.miny));
    }
    placed.push({ ch, g, pen, m });
    pen += m.advance;
  }
  maxx = Math.max(maxx, pen);
  return { placed, w: maxx - minx, h: maxy - miny, pen, fm };
}

/**
 * Coverage of each pixel of a glyph's box (0..1), from `n × n` samples per pixel
 * with the nonzero rule. Rows go down from the glyph's top (maxy).
 */
export function coverage(g: Glyph, size: number, upem: number, n = 4) {
  const m = glyphMetrics(g, size, upem);
  const w = m.maxx - m.minx, h = m.maxy - m.miny;
  const a = new Float32Array(Math.max(0, w * h));
  const s = size / upem;
  const edges: [number, number, number, number][] = [];
  for (const c of g.contours) for (let i = 0; i < c.length; i++) {
    const p = c[i], q = c[(i + 1) % c.length];
    edges.push([p[0] * s, p[1] * s, q[0] * s, q[1] * s]);
  }
  for (let row = 0; row < h; row++) for (let col = 0; col < w; col++) {
    let hit = 0;
    for (let sy = 0; sy < n; sy++) for (let sx = 0; sx < n; sx++) {
      const x = m.minx + col + (sx + 0.5) / n, y = m.maxy - row - (sy + 0.5) / n;
      let wind = 0;
      for (const [x0, y0, x1, y1] of edges) {
        if ((y0 <= y) !== (y1 <= y)) {
          const xc = x0 + ((y - y0) * (x1 - x0)) / (y1 - y0);
          if (xc > x) wind += y1 > y0 ? 1 : -1;
        }
      }
      if (wind !== 0) hit++;
    }
    a[row * w + col] = hit / (n * n);
  }
  return { a, w, h, m };
}

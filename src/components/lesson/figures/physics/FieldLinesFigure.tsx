"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, Vec, Handle, useDrag, nearest, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Point charges on a plane (1 px = 1 cm). Every charge makes a field
// E = k q / r² pointing away from + and towards −; the field at any point is
// the VECTOR sum of all of them (superposition). The grey arrows show its
// direction everywhere, darker where it is stronger; the lines are field
// lines, traced by following the field from each + charge until they reach a
// − charge or leave the picture. A test charge (amber) can be dragged around:
// its force arrow is q E. The charges themselves can be dragged too.
// "break it: add the strengths, not the arrows" adds the sizes of the
// separate fields instead of the arrows. Then between two equal charges, where
// the pushes cancel and a test charge feels nothing, the broken rule reports a
// strong field.

const W = 560, H = 320;
const K = 8.99e9;                       // N m² / C²
const M = 0.01;                         // metres per px
const NC = 1e-9;                        // a nanocoulomb

type Q = { x: number; y: number; q: number };   // q in nC
type Preset = "dipole" | "like" | "single";

const PRESETS: Record<Preset, Q[]> = {
  dipole: [{ x: 200, y: 160, q: 2 }, { x: 360, y: 160, q: -2 }],
  like: [{ x: 200, y: 160, q: 2 }, { x: 360, y: 160, q: 2 }],
  single: [{ x: 280, y: 160, q: 2 }],
};

/** Field at (x, y) in N/C, as a vector; `broken` adds magnitudes instead. */
function field(qs: Q[], x: number, y: number, broken = false) {
  let ex = 0, ey = 0, sum = 0, best = 0, bx = 0, by = 0;
  for (const c of qs) {
    const dx = (x - c.x) * M, dy = (y - c.y) * M;
    const r2 = Math.max(dx * dx + dy * dy, 1e-6), r = Math.sqrt(r2);
    const e = (K * c.q * NC) / r2;
    ex += (e * dx) / r; ey += (e * dy) / r;
    sum += Math.abs(e);
    if (Math.abs(e) > best) { best = Math.abs(e); bx = (e * dx) / r / Math.abs(e); by = (e * dy) / r / Math.abs(e); }
  }
  // broken: the strengths add up, pointing along the strongest single field
  return broken ? { ex: bx * sum, ey: by * sum } : { ex, ey };
}

/** Field lines from every + charge (or from every − one when there is no +). */
function fieldLines(qs: Q[]) {
  const pos = qs.filter(c => c.q > 0), sources = pos.length ? pos : qs.filter(c => c.q < 0);
  const dir = pos.length ? 1 : -1;
  const lines: string[] = [];
  for (const s of sources) {
    const n = Math.round(6 * Math.abs(s.q));
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * (k + 0.5)) / n;
      let x = s.x + 10 * Math.cos(a), y = s.y + 10 * Math.sin(a);
      let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
      for (let i = 0; i < 400; i++) {
        const { ex, ey } = field(qs, x, y);
        const m = Math.hypot(ex, ey) || 1;
        x += (dir * 4 * ex) / m; y += (dir * 4 * ey) / m;
        d += `L${x.toFixed(1)},${y.toFixed(1)}`;
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break;
        if (qs.some(c => c.q * dir < 0 && Math.hypot(c.x - x, c.y - y) < 8)) break;
      }
      lines.push(d);
    }
  }
  return lines;
}

export function FieldLinesFigure({ t }: { t?: TrackTranslations }) {
  const [preset, setPreset] = useState<Preset>("dipole");
  const [qs, setQs] = useState<Q[]>(PRESETS.dipole);
  const [test, setTest] = useState({ x: 280, y: 90 });
  const [mag, setMag] = useState(2);
  const [broken, setBroken] = useState(false);

  const pick = (p: { x: number; y: number }) =>
    nearest<number>(p, [[-1, test], ...qs.map((c, i) => [i, c] as [number, { x: number; y: number }])], 18);
  const drag = useDrag<number>(pick, (id, p) => {
    const x = clamp(p.x, 10, W - 10), y = clamp(p.y, 10, H - 10);
    if (id === -1) setTest({ x, y });
    else setQs(list => list.map((c, i) => (i === id ? { ...c, x, y } : c)));
  });

  const choose = (p: Preset) => {
    setPreset(p);
    setQs(PRESETS[p].map(c => ({ ...c, q: Math.sign(c.q) * mag })));
  };
  const setStrength = (m: number) => {
    setMag(m);
    setQs(list => list.map(c => ({ ...c, q: Math.sign(c.q) * m })));
  };

  const lines = broken ? [] : fieldLines(qs);
  const arrows: { x: number; y: number; ex: number; ey: number; s: number }[] = [];
  for (let y = 20; y < H; y += 32) for (let x = 20; x < W; x += 32) {
    if (qs.some(c => Math.hypot(c.x - x, c.y - y) < 16)) continue;
    const { ex, ey } = field(qs, x, y, broken);
    const m = Math.hypot(ex, ey);
    arrows.push({ x, y, ex: ex / (m || 1), ey: ey / (m || 1), s: clamp(Math.log10(1 + m / 50) / 3, 0.08, 1) });
  }
  const te = field(qs, test.x, test.y, broken);
  const tm = Math.hypot(te.ex, te.ey);
  const fLen = clamp(12 * Math.log10(1 + tm / 20), 0, 60);
  const testQ = 1;                                         // nC
  const force = tm * testQ * NC;                           // N

  return (
    <Figure title={tx(t, "figPhField_title", "Electric field of point charges")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhField_broken", "break it: add the strengths, not the arrows")}</Btn>}
      controls={<>
        <Row>
          <Choice value={preset} onChange={choose} options={[
            ["dipole", tx(t, "figPhField_dipole", "+ and −")],
            ["like", tx(t, "figPhField_like", "two +")],
            ["single", tx(t, "figPhField_single", "one +")],
          ]} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figPhField_q", "each charge")} value={mag} min={0.5} max={4} step={0.5} onChange={setStrength} fmt={v => `${f2(v, 1)} nC`} />
        </Sliders>
        <Row>
          <Readout color={C.amber}>{`|E| = ${tm >= 1e4 ? f2(tm / 1000, 1) + " k" : f2(tm, 0) + " "}N/C`}</Readout>
          <Readout color={C.amber}>{`F = q|E| = ${f2(force * 1e6, 2)} µN (q = 1 nC)`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhField_note", "Drag the charges and the amber test charge. The grey arrows show which way a small positive charge would be pushed at each point, darker where the push is stronger; the lines follow those arrows from + to −. With + and −, the lines leave the + and bend round into the −. With two + charges they push each other's lines away, and halfway between them the arrows vanish: the two equal pushes cancel. Put the test charge there and its force drops to zero. Now break it: add the sizes of the two fields instead of adding them as arrows. The midpoint now shows the strongest field in the picture, although a charge placed there feels nothing. Fields are vectors, and only arrow addition matches what charges actually feel.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {arrows.map((a, i) => (
          <Vec key={i} a={{ x: a.x - 7 * a.ex, y: a.y - 7 * a.ey }} b={{ x: a.x + 7 * a.ex, y: a.y + 7 * a.ey }}
            color={broken ? C.red : C.fg} w={1.1} head={4} opacity={a.s} />
        ))}
        {lines.map((d, i) => <path key={i} d={d} fill="none" stroke={C.sky} strokeWidth={1.2} opacity={0.75} />)}
        {qs.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={11} fill={c.q > 0 ? C.red : C.blue} />
            <T x={c.x} y={c.y + 4} anchor="middle" color="#fff" size={13} bold>{c.q > 0 ? "+" : "−"}</T>
          </g>
        ))}
        <Vec a={test} b={{ x: test.x + fLen * te.ex / (tm || 1), y: test.y + fLen * te.ey / (tm || 1) }} color={C.amber} w={2.2} />
        <Handle x={test.x} y={test.y} color={C.amber} r={5} active={drag.dragging === -1} />
        <T x={8} y={H - 8} size={8}>{tx(t, "figPhField_scale", "1 px = 1 cm")}</T>
      </svg>
    </Figure>
  );
}

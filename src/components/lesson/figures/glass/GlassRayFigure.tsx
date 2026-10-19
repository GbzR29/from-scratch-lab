"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Readout, Row, C, T, Vec, Handle, useDrag, f2, type Pt } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "../physics/spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// A laser shines into a piece of glass drawn in 2D, and the ray is split at
// every surface exactly the way a shader does it. Entering, the normal faces
// the ray and η = n_air / n_glass = 1/n; leaving, the normal is flipped and
// η = n. refract() gives the new direction (the GLSL formula, line for line)
// unless k < 0, which is total internal reflection. The Fresnel reflectance
// (exact, unpolarised) decides how bright the reflected and refracted branches
// are. The table lists the first hits of the brightest path with the numbers
// refract() receives. "white light" traces seven wavelengths with a Cauchy
// index n(λ) = n + B(1/λ² − 1/589²), so a prism fans the colours out.

const W = 560, H = 300;
const SPREAD = 4;                                   // the colour fan is drawn this many times wider
const WHITE = [410, 450, 490, 530, 570, 620, 680];
const MID = 530;                                    // the wavelength that stands for the white beam inside the glass

type Shape = { kind: "poly"; pts: Pt[] } | { kind: "circle"; c: Pt; r: number };
type ShapeId = "slab" | "prism" | "ball" | "fibre";
type Laser = { src: Pt; ang: number };
type Seg = { a: Pt; b: Pt; I: number; l: number; out: boolean };   // out: leaves the glass for good
type Hit = { p: Pt; enter: boolean; eta: number; dot: number; k: number; R: number; n: Pt };

// ── The four pieces of glass ──────────────────────────────────────────────────

function fibrePts(): Pt[] {
  const c = { x: 280, y: 380 }, ro = 240, ri = 205, a0 = Math.PI + 0.55, a1 = 2 * Math.PI - 0.55, N = 48;
  const arc = (r: number, from: number, to: number) =>
    Array.from({ length: N + 1 }, (_, i) => { const a = from + ((to - from) * i) / N; return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) }; });
  return [...arc(ro, a0, a1), ...arc(ri, a1, a0)];
}

const SHAPES: Record<ShapeId, Shape> = {
  slab: { kind: "poly", pts: [{ x: 120, y: 130 }, { x: 440, y: 130 }, { x: 440, y: 200 }, { x: 120, y: 200 }] },
  prism: { kind: "poly", pts: [{ x: 300, y: 55 }, { x: 405, y: 237 }, { x: 195, y: 237 }] },
  ball: { kind: "circle", c: { x: 320, y: 150 }, r: 95 },
  fibre: { kind: "poly", pts: fibrePts() },
};

const START: Record<ShapeId, Laser> = {
  slab: { src: { x: 70, y: 40 }, ang: 0.62 },
  prism: { src: { x: 60, y: 200 }, ang: -0.32 },
  ball: { src: { x: 60, y: 110 }, ang: 0 },
  fibre: { src: { x: 62, y: 290 }, ang: -1.05 },
};

// ── 2D vector helpers (the same operations GLSL has) ─────────────────────────

const add = (a: Pt, b: Pt) => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Pt, s: number) => ({ x: a.x * s, y: a.y * s });
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
const norm = (a: Pt) => { const l = Math.hypot(a.x, a.y) || 1; return { x: a.x / l, y: a.y / l }; };

/** GLSL refract(I, N, eta): null when k < 0 (total internal reflection). */
function refract(I: Pt, N: Pt, eta: number) {
  const d = dot(N, I), k = 1 - eta * eta * (1 - d * d);
  return { k, T: k < 0 ? null : add(mul(I, eta), mul(N, -(eta * d + Math.sqrt(k)))) };
}
const reflect = (I: Pt, N: Pt) => add(I, mul(N, -2 * dot(N, I)));

/** Fresnel reflectance for unpolarised light; cosI and cosT measured from the normal. */
function fresnel(n1: number, n2: number, cosI: number, cosT: number) {
  const rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
  const rp = (n1 * cosT - n2 * cosI) / (n1 * cosT + n2 * cosI);
  return (rs * rs + rp * rp) / 2;
}

/** Nearest surface along the ray: distance and OUTWARD normal there. */
function intersect(s: Shape, o: Pt, d: Pt): { t: number; n: Pt } | null {
  const EPS = 1e-3;
  if (s.kind === "circle") {
    const oc = add(o, mul(s.c, -1)), b = dot(oc, d), h = b * b - (dot(oc, oc) - s.r * s.r);
    if (h < 0) return null;
    const sq = Math.sqrt(h), t = -b - sq > EPS ? -b - sq : -b + sq;
    if (t <= EPS) return null;
    return { t, n: norm(add(add(o, mul(d, t)), mul(s.c, -1))) };
  }
  const P = s.pts;
  let area = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a.x * b.y - b.x * a.y; }
  let best: { t: number; n: Pt } | null = null;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], e = { x: b.x - a.x, y: b.y - a.y };
    const den = d.x * e.y - d.y * e.x;
    if (Math.abs(den) < 1e-9) continue;
    const w = { x: a.x - o.x, y: a.y - o.y };
    const t = (w.x * e.y - w.y * e.x) / den, u = (w.x * d.y - w.y * d.x) / den;
    if (t > EPS && u >= 0 && u <= 1 && (!best || t < best.t)) {
      const n = norm(area > 0 ? { x: e.y, y: -e.x } : { x: -e.y, y: e.x });
      best = { t, n };
    }
  }
  return best;
}

/** One surface crossing, as a shader would do it. */
function cross(I: Pt, nOut: Pt, ior: number) {
  const enter = dot(I, nOut) < 0;
  const N = enter ? nOut : mul(nOut, -1);              // must face against the ray
  const eta = enter ? 1 / ior : ior;                   // n_from / n_to
  const { k, T } = refract(I, N, eta);
  const cosI = -dot(N, I);
  const R = T ? (enter ? fresnel(1, ior, cosI, Math.sqrt(k)) : fresnel(ior, 1, cosI, Math.sqrt(k))) : 1;
  return { enter, N, eta, k, T, R, d: dot(N, I) };
}

// ── Tracing: every branch, and the brightest path for the table ──────────────

function traceAll(s: Shape, o: Pt, d: Pt, ior: number, l: number, reflections: boolean) {
  const segs: Seg[] = [];
  const go = (o: Pt, d: Pt, I: number, depth: number) => {
    if (I < 0.012 || segs.length > 320) return;
    const h = depth < 10 ? intersect(s, o, d) : null;
    if (!h) { segs.push({ a: o, b: add(o, mul(d, 900)), I, l, out: depth > 0 }); return; }
    const p = add(o, mul(d, h.t));
    segs.push({ a: o, b: p, I, l, out: false });
    const c = cross(d, h.n, ior);
    if (c.T) go(p, norm(c.T), I * (1 - c.R), depth + 1);
    if (!c.T || reflections) go(p, reflect(d, c.N), I * c.R, depth + 1);
  };
  go(o, d, 1, 0);
  return segs;
}

function mainPath(s: Shape, o: Pt, d: Pt, ior: number) {
  const hits: Hit[] = [];
  for (let i = 0; i < 8; i++) {
    const h = intersect(s, o, d);
    if (!h) break;
    const p = add(o, mul(d, h.t)), c = cross(d, h.n, ior);
    hits.push({ p, enter: c.enter, eta: c.eta, dot: c.d, k: c.k, R: c.R, n: c.N });
    d = c.T && 1 - c.R >= c.R ? norm(c.T) : reflect(d, c.N);
    o = p;
  }
  return hits;
}

const nOf = (ior: number, l: number, white: boolean) =>
  white ? ior + SPREAD * 4040 * ((ior - 1) / 0.5168) * (1 / (l * l) - 1 / (589 * 589)) : ior;

// ── Figure ────────────────────────────────────────────────────────────────────

export function GlassRayFigure({ t }: { t?: TrackTranslations }) {
  const [shape, setShape] = useState<ShapeId>("prism");
  const [laser, setLaser] = useState<Laser>(START.prism);
  const [ior, setIor] = useState(1.5);
  const [white, setWhite] = useState(false);
  const [refl, setRefl] = useState(true);

  const dir = { x: Math.cos(laser.ang), y: Math.sin(laser.ang) };
  const aim = add(laser.src, mul(dir, 34));
  const drag = useDrag<"src" | "aim">(
    p => (Math.hypot(p.x - aim.x, p.y - aim.y) < 14 ? "aim" : Math.hypot(p.x - laser.src.x, p.y - laser.src.y) < 16 ? "src" : null),
    (id, p) => {
      if (id === "aim") setLaser(L => ({ ...L, ang: Math.atan2(p.y - L.src.y, p.x - L.src.x) }));
      else setLaser(L => ({ ...L, src: { x: Math.max(8, Math.min(W - 8, p.x)), y: Math.max(8, Math.min(H - 8, p.y)) } }));
    },
  );

  const s = SHAPES[shape];
  const lams = white ? WHITE : [532];
  const segs = lams.flatMap(l => traceAll(s, laser.src, dir, nOf(ior, l, white), l, refl));
  const hits = mainPath(s, laser.src, dir, ior);
  const crit = (Math.asin(1 / ior) * 180) / Math.PI;
  const tirCount = hits.filter(h => h.k < 0).length;
  const col = (l: number) => (white ? wavelengthCss(l) : C.green);
  const pick = (id: ShapeId) => { setShape(id); setLaser(START[id]); };
  const opts = (["slab", "prism", "ball", "fibre"] as ShapeId[]).map(id => [id, tx(t, `figGlRay_${id}`, { slab: "slab", prism: "prism", ball: "ball", fibre: "fibre" }[id])] as const);
  const th = "px-1.5 py-0.5 text-left font-normal text-[var(--text-muted)]";

  return (
    <Figure title={tx(t, "figGlRay_title", "Rays through glass, one refract() at a time")}
      head={<>
        <Btn active={white} onClick={() => setWhite(w => !w)}>{tx(t, "figGlRay_white", "white light")}</Btn>
        <Btn active={refl} onClick={() => setRefl(r => !r)}>{tx(t, "figGlRay_refl", "reflections")}</Btn>
      </>}
      controls={<>
        <Row>
          <Choice value={shape} options={opts} onChange={pick} />
          <Slider label="n" value={ior} min={1} max={2.5} step={0.01} onChange={setIor} fmt={v => f2(v, 2)} width="w-4" />
        </Row>
        <Row>
          <Readout>{`θc = asin(1/n) = ${f2(crit, 1)}°`}</Readout>
          <Readout color={tirCount ? C.red : C.fg}>{`${tx(t, "figGlRay_tirCount", "total internal reflections")}: ${tirCount}`}</Readout>
          {white && <Readout color={C.purple}>{tx(t, "figGlRay_exag", "colour fan drawn 4× wider")}</Readout>}
        </Row>
        <div className="overflow-x-auto rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)]">
          <table className="w-full font-mono text-[10.5px] text-[var(--code-text)] whitespace-nowrap">
            <thead><tr>
              <th className={th}>#</th>
              <th className={th}>{tx(t, "figGlRay_side", "side")}</th>
              <th className={th}>{tx(t, "figGlRay_normal", "normal passed")}</th>
              <th className={th}>η</th>
              <th className={th}>N·I</th>
              <th className={th}>k</th>
              <th className={th}>{tx(t, "figGlRay_result", "result")}</th>
            </tr></thead>
            <tbody>
              {hits.slice(0, 6).map((h, i) => (
                <tr key={i} className="border-t border-[var(--code-border)]">
                  <td className="px-1.5 py-0.5 text-[var(--code-muted)]">{i + 1}</td>
                  <td className="px-1.5 py-0.5">{h.enter ? tx(t, "figGlRay_enter", "enter") : tx(t, "figGlRay_leave", "leave")}</td>
                  <td className="px-1.5 py-0.5" style={{ color: h.enter ? C.sky : C.orange }}>{h.enter ? tx(t, "figGlRay_nOut", "N (outward)") : tx(t, "figGlRay_nIn", "−N (flipped)")}</td>
                  <td className="px-1.5 py-0.5">{h.enter ? `1/${f2(ior, 2)} = ${f2(h.eta, 3)}` : f2(h.eta, 2)}</td>
                  <td className="px-1.5 py-0.5">{f2(h.dot, 3)}</td>
                  <td className="px-1.5 py-0.5" style={{ color: h.k < 0 ? C.red : undefined }}>{f2(h.k, 3)}</td>
                  <td className="px-1.5 py-0.5" style={{ color: h.k < 0 ? C.red : undefined }}>
                    {h.k < 0 ? tx(t, "figGlRay_tir", "k < 0: reflect()") : `refract() · R = ${f2(h.R * 100, 1)}%`}
                  </td>
                </tr>
              ))}
              {!hits.length && <tr><td colSpan={7} className="px-1.5 py-1 text-[var(--code-muted)]">{tx(t, "figGlRay_miss", "the laser misses the glass: aim it at the shape")}</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
      note={tx(t, "figGlRay_note", "Drag the laser to move it and its small round handle to aim it. The table follows the brightest path. Each time the ray enters, the normal passed to refract() is the outward one (blue arrow) and η = 1/n. Each time it leaves, the normal is flipped to face the ray (orange arrow) and η = n. Only the leaving case can make k negative. Try each shape. The slab: the ray comes out parallel to how it went in, just shifted. The prism: switch on white light and the colours fan out, because violet sees a slightly larger n. The ball is exactly the glass ball shader further down: two refractions. The fibre: the ray hits the walls at shallow angles, every hit has k < 0, and the light is trapped and carried round the bend. Lower n until θc grows past the hitting angle and watch the light escape.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none">
        <g>
          {s.kind === "circle"
            ? <circle cx={s.c.x} cy={s.c.y} r={s.r} fill={C.sky} fillOpacity={0.07 + 0.06 * (ior - 1)} stroke={C.sky} strokeWidth={1.4} />
            : <polygon points={s.pts.map(p => `${p.x},${p.y}`).join(" ")} fill={C.sky} fillOpacity={0.07 + 0.06 * (ior - 1)} stroke={C.sky} strokeWidth={1.4} strokeLinejoin="round" />}
          {/* white light: one white beam until it leaves the glass, then the fanned-out colours */}
          {segs.map((g, i) => white && !g.out && g.l !== MID ? null : (
            <line key={i} x1={g.a.x} y1={g.a.y} x2={g.b.x} y2={g.b.y} stroke={white && !g.out ? "#fff" : col(g.l)}
              style={white && !g.out ? { filter: "drop-shadow(0 0 1px #000)" } : undefined}
              strokeWidth={white ? (g.out ? 1.3 : 2.2) : 0.8 + 2.2 * Math.sqrt(g.I)} opacity={0.12 + 0.88 * Math.sqrt(g.I)} strokeLinecap="round" />
          ))}
          {hits.slice(0, 6).map((h, i) => (
            <g key={i}>
              <Vec a={add(h.p, mul(h.n, 7))} b={add(h.p, mul(h.n, 36))} color={h.enter ? C.sky : C.orange} w={1.8} head={6} />
              <circle cx={h.p.x} cy={h.p.y} r={7} fill="var(--code-bg)" stroke={h.k < 0 ? C.red : C.fg} strokeWidth={1} />
              <T x={h.p.x} y={h.p.y + 3} size={8} anchor="middle" color={h.k < 0 ? C.red : C.fg} bold>{String(i + 1)}</T>
            </g>
          ))}
        </g>
        <line x1={laser.src.x} y1={laser.src.y} x2={aim.x} y2={aim.y} stroke={C.fg} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
        <circle cx={laser.src.x} cy={laser.src.y} r={10} fill="var(--code-bg)" stroke={C.fg} strokeWidth={1.6} />
        <Handle x={laser.src.x} y={laser.src.y} color={C.amber} r={4} active={drag.dragging === "src"} />
        <Handle x={aim.x} y={aim.y} color={C.purple} r={4.5} active={drag.dragging === "aim"} />
        <T x={10} y={18} size={9}>{`${tx(t, "figGlRay_air", "air")} · n = 1`}</T>
        <T x={W - 10} y={18} size={9} anchor="end" color={C.sky}>{`${tx(t, "figGlRay_glass", "glass")} · n = ${f2(ior, 2)}`}</T>
      </svg>
    </Figure>
  );
}

"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, T, C, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Eight by six pixels of a fragment shader, grouped in 2×2 quads the way the
// GPU runs them. Each pixel shows the value f it computed. Tap a pixel and
// dFdx / dFdy appear as the difference to its neighbour inside the quad:
// "fine" takes the pixel's own row or column, "coarse" one row and one column
// for the whole quad. Two more views: a triangle edge, where pixels outside
// the triangle still run as helpers so their quad has neighbours, and an if
// whose branch only some pixels take, where the derivative has no neighbour.

const COLS = 8, ROWS = 6, S = 34, X0 = 14, Y0 = 14;
const W = X0 * 2 + COLS * S, H = Y0 * 2 + ROWS * S;

type Fn = "ramp" | "bowl" | "angle";
type View = "all" | "triangle" | "branch";
const FNS: Record<Fn, { label: string; expr: string; f: (x: number, y: number) => number }> = {
  ramp: { label: "ramp", expr: "f = 0.1·x", f: x => 0.1 * x },
  bowl: { label: "bowl", expr: "f = 0.02·|p − c|²", f: (x, y) => 0.02 * ((x - 4) ** 2 + (y - 3) ** 2) },
  angle: { label: "angle", expr: "f = atan(p − c) / 2π + 0.5", f: (x, y) => Math.atan2(y - 3, x - 4) / (2 * Math.PI) + 0.5 },
};
const FN_KEYS = Object.keys(FNS) as Fn[];

// A triangle in pixel units (y up, like gl_FragCoord)
const TRI: [number, number][] = [[0.6, 0.5], [7.5, 1.4], [2.4, 5.6]];
const edge = (a: [number, number], b: [number, number], x: number, y: number) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
const inTri = (x: number, y: number) => edge(TRI[0], TRI[1], x, y) >= 0 && edge(TRI[1], TRI[2], x, y) >= 0 && edge(TRI[2], TRI[0], x, y) >= 0;
const inBranch = (x: number, y: number) => x + y < 7;

const sx = (x: number) => X0 + x * S;               // pixel units → SVG
const sy = (y: number) => Y0 + (ROWS - y) * S;

export function PixelQuadFigure({ t }: { t?: TrackTranslations }) {
  const [fn, setFn] = useState<Fn>("bowl");
  const [view, setView] = useState<View>("all");
  const [fine, setFine] = useState(true);
  const [sel, setSel] = useState<[number, number]>([5, 1]);

  const F = FNS[fn];
  const val = (i: number, j: number) => F.f(i + 0.5, j + 0.5);
  const quadOf = (i: number, j: number) => [i & ~1, j & ~1] as const;
  const quadCovered = (qi: number, qj: number) =>
    [0, 1].some(a => [0, 1].some(b => inTri(qi + a + 0.5, qj + b + 0.5)));
  // What a pixel is in the current view
  const kind = (i: number, j: number): "normal" | "helper" | "idle" | "skip" => {
    if (view === "triangle") {
      if (inTri(i + 0.5, j + 0.5)) return "normal";
      const [qi, qj] = quadOf(i, j);
      return quadCovered(qi, qj) ? "helper" : "idle";
    }
    if (view === "branch") return inBranch(i + 0.5, j + 0.5) ? "normal" : "skip";
    return "normal";
  };
  const has = (i: number, j: number) => { const k = kind(i, j); return k === "normal" || k === "helper"; };

  // Values range for the shading
  const cells = Array.from({ length: COLS * ROWS }, (_, n) => [n % COLS, Math.floor(n / COLS)] as const);
  const vals = cells.map(([i, j]) => val(i, j));
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const shade = (v: number) => { const k = Math.round(40 + 175 * (hi > lo ? (v - lo) / (hi - lo) : 0.5)); return `rgb(${k},${k},${Math.min(255, k + 18)})`; };

  // The derivative pairs for the selected pixel
  const [si, sj] = sel;
  const [qi, qj] = quadOf(si, sj);
  const rowY = fine ? sj : qj;                       // coarse: the quad's bottom row
  const colX = fine ? si : qi;                       // coarse: the quad's left column
  const xa: [number, number] = [qi, rowY], xb: [number, number] = [qi + 1, rowY];
  const ya: [number, number] = [colX, qj], yb: [number, number] = [colX, qj + 1];
  const dx = has(...xa) && has(...xb) ? val(...xb) - val(...xa) : null;
  const dy = has(...ya) && has(...yb) ? val(...yb) - val(...ya) : null;
  const selOn = kind(si, sj) !== "idle";

  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const i = Math.floor((x - X0) / S), j = ROWS - 1 - Math.floor((y - Y0) / S);
    if (i >= 0 && i < COLS && j >= 0 && j < ROWS) setSel([i, j]);
  };

  const kinds = cells.map(([i, j]) => kind(i, j));
  const covered = kinds.filter(k => k === "normal").length, helpers = kinds.filter(k => k === "helper").length;

  const viewNote: Record<View, string> = {
    all: tx(t, "figQuad_vAll", "Every pixel runs, so every quad has its four values. The two pixels of a pair share one difference: dFdx of the left pixel and of the right pixel is the same number."),
    triangle: tx(t, "figQuad_vTri", "Only the pixels whose centre is inside the triangle are drawn. But the GPU runs whole quads: the dashed pixels run the shader too, as helpers, only so their neighbours have someone to subtract from. Their results are thrown away. Small and thin triangles waste most of their work this way."),
    branch: tx(t, "figQuad_vBranch", "The value is computed inside if (x + y < 7). Pixels on the other side of the line never compute it, so a pair split by the line has nothing to subtract: the spec calls the derivative undefined there. texture() takes the same derivatives to pick a mip level, so it has the same problem inside such a branch."),
  };

  return (
    <Figure title={tx(t, "figQuad_title", "Derivatives come from 2×2 quads")}
      head={<>
        {FN_KEYS.map(k => <Btn key={k} active={fn === k} onClick={() => setFn(k)}>{tx(t, `figQuad_fn_${k}`, FNS[k].label)}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Btn active={view === "all"} onClick={() => setView("all")}>{tx(t, "figQuad_all", "all pixels")}</Btn>
          <Btn active={view === "triangle"} onClick={() => setView("triangle")}>{tx(t, "figQuad_tri", "triangle edge")}</Btn>
          <Btn active={view === "branch"} onClick={() => setView("branch")}>{tx(t, "figQuad_branch", "inside an if")}</Btn>
        </Row>
        <Row>
          <Btn active={fine} onClick={() => setFine(true)}>{tx(t, "figQuad_fine", "fine")}</Btn>
          <Btn active={!fine} onClick={() => setFine(false)}>{tx(t, "figQuad_coarse", "coarse")}</Btn>
          <span className="text-[11px] font-mono" style={{ color: C.amber }}>{`dFdx: ${fine ? tx(t, "figQuad_ownRow", "its own row") : tx(t, "figQuad_bottomRow", "the quad's bottom row")}`}</span>
          <span className="text-[11px] font-mono" style={{ color: C.blue }}>{`dFdy: ${fine ? tx(t, "figQuad_ownCol", "its own column") : tx(t, "figQuad_leftCol", "the quad's left column")}`}</span>
        </Row>
        <Row>
          <Readout>{`${F.expr}${fn === "ramp" ? "" : ", c = (4, 3)"}`}</Readout>
          <Readout>{`${tx(t, "figQuad_pixel", "pixel")} gl_FragCoord.xy = (${si + 0.5}, ${sj + 0.5})`}</Readout>
          <Readout>{`f = ${kind(si, sj) === "skip" ? "—" : f2(val(si, sj), 3)}`}</Readout>
        </Row>
        <Row>
          <Readout color={C.amber}>{`dFdx = ${dx === null ? tx(t, "figQuad_undef", "undefined") : `${f2(val(...xb), 3)} − ${f2(val(...xa), 3)} = ${f2(dx, 3)}`}`}</Readout>
          <Readout color={C.blue}>{`dFdy = ${dy === null ? tx(t, "figQuad_undef", "undefined") : `${f2(val(...yb), 3)} − ${f2(val(...ya), 3)} = ${f2(dy, 3)}`}`}</Readout>
          {dx !== null && dy !== null && <Readout>{`fwidth = |dFdx| + |dFdy| = ${f2(Math.abs(dx) + Math.abs(dy), 3)}`}</Readout>}
        </Row>
        {view === "triangle" && (
          <Row>
            <Readout>{`${tx(t, "figQuad_covered", "pixels in the triangle")}: ${covered}`}</Readout>
            <Readout>{`${tx(t, "figQuad_helpers", "helper pixels")}: ${helpers}`}</Readout>
            <Readout>{`${tx(t, "figQuad_waste", "work thrown away")}: ${Math.round((100 * helpers) / (covered + helpers))}%`}</Readout>
          </Row>
        )}
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={tx(t, "figQuad_note", "Tap a pixel. The amber arrow is the subtraction behind dFdx and the blue one is dFdy, with y growing upwards as in gl_FragCoord. Try \"bowl\" with coarse: the whole quad gets the bottom row's slope, even for the top pixels. Then try \"angle\" on the row just left of the centre, where the value jumps from 1 back to 0: the derivative there is huge, and that is what makes a seam appear in a texture.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full max-w-[440px] mx-auto h-auto touch-none cursor-pointer" onPointerDown={pick}>
        {Array.from({ length: COLS * ROWS }, (_, n) => {
          const i = n % COLS, j = Math.floor(n / COLS), k = kind(i, j), v = val(i, j);
          const x = sx(i), y = sy(j + 1);
          const ran = k === "normal" || k === "helper";
          return (
            <g key={n} opacity={k === "helper" ? 0.55 : 1}>
              <rect x={x} y={y} width={S} height={S} fill={ran ? shade(v) : "var(--code-bg)"} stroke="var(--code-line)" strokeWidth={0.6}
                strokeDasharray={k === "helper" ? "3 2" : undefined} />
              {ran
                ? <T x={x + S / 2} y={y + 12} size={8} anchor="middle" color={v > (lo + hi) / 2 ? "#111" : "#eee"}>{f2(v, 2)}</T>
                : k === "skip" && <T x={x + S / 2} y={y + S / 2 + 3} size={9} anchor="middle">—</T>}
            </g>
          );
        })}
        {/* quad borders */}
        {Array.from({ length: (COLS / 2) * (ROWS / 2) }, (_, n) => {
          const a = (n % (COLS / 2)) * 2, b = Math.floor(n / (COLS / 2)) * 2;
          return <rect key={n} x={sx(a)} y={sy(b + 2)} width={2 * S} height={2 * S} fill="none" stroke="var(--text-muted)" strokeWidth={1.4} />;
        })}
        {view === "triangle" && <polygon points={TRI.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")} fill="none" stroke={C.green} strokeWidth={2} />}
        {view === "branch" && <line x1={sx(1)} y1={sy(6)} x2={sx(7)} y2={sy(0)} stroke={C.purple} strokeWidth={2} strokeDasharray="5 3" />}
        {/* selection */}
        <rect x={sx(qi)} y={sy(qj + 2)} width={2 * S} height={2 * S} fill="none" stroke="var(--primary)" strokeWidth={2.4} />
        <rect x={sx(si) + 2} y={sy(sj + 1) + 2} width={S - 4} height={S - 4} fill="none" stroke="var(--text-main)" strokeWidth={1.6} />
        {/* below the numbers: dFdx along the lower part of the row, dFdy along the right of the column */}
        {selOn && <Arrow from={[xa[0] + 0.3, xa[1] + 0.3]} to={[xb[0] + 0.7, xb[1] + 0.3]} color={C.amber} ok={dx !== null} />}
        {selOn && <Arrow from={[ya[0] + 0.75, ya[1] + 0.2]} to={[yb[0] + 0.75, yb[1] + 0.45]} color={C.blue} ok={dy !== null} />}

      </svg>
      <p className="text-center text-[11px] font-mono text-[var(--text-muted)]">
        {`${tx(t, "figQuad_legend1", "thick squares = quads")} · ${tx(t, "figQuad_legend2", "y grows upwards")}`}
        {view === "triangle" && <span style={{ color: C.green }}>{` · ${tx(t, "figQuad_legend3", "dashed = helper pixel")}`}</span>}
      </p>
    </Figure>
  );
}

function Arrow({ from, to, color, ok }: { from: [number, number]; to: [number, number]; color: string; ok: boolean }) {
  const x1 = sx(from[0]), y1 = sy(from[1]), x2 = sx(to[0]), y2 = sy(to[1]);
  const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const a = 9, bx = x2 - ux * 8, by = y2 - uy * 8;
  return (
    <g opacity={ok ? 1 : 0.6}>
      <line x1={x1 + ux * 6} y1={y1 + uy * 6} x2={bx} y2={by} stroke={color} strokeWidth={2.4} strokeDasharray={ok ? undefined : "3 3"} />
      <polygon points={`${x2 - ux * 3},${y2 - uy * 3} ${bx - uy * a * 0.45 - ux * 2},${by + ux * a * 0.45 - uy * 2} ${bx + uy * a * 0.45 - ux * 2},${by - ux * a * 0.45 - uy * 2}`} fill={color} />
      <circle cx={x1} cy={y1} r={3} fill={color} />
    </g>
  );
}

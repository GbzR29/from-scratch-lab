"use client";

import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, T, C } from "@/components/lesson/kit/figure";
import { claimContext, releaseContext } from "../kit/gl/context";

// ── What this figure shows ────────────────────────────────────────────────────
// A real measurement on the reader's own GPU. One full-screen pass of a
// shader with an if / else whose two paths cost exactly the same, timed with
// EXT_disjoint_timer_query_webgl2 (fastest of 10 runs). The condition is a
// checkerboard, vertical stripes or horizontal stripes of 1 to 32 pixels. As
// long as a warp contains pixels of both kinds, it runs both paths and the
// pass takes twice as long; once the cells are as large as a warp, the time
// drops to that of a uniform branch. The widths at which the stripes stop
// costing double give the shape of a warp on this GPU. Without the timer
// extension (Firefox, Safari, most phones) the figure shows a run recorded on
// an NVIDIA RTX 4060 in Edge.

const SIZES = [1, 2, 4, 8, 16, 32];
type Pattern = "checker" | "vert" | "horz";
const PATTERNS: Pattern[] = ["checker", "vert", "horz"];
const COLOR: Record<Pattern, string> = { checker: C.purple, vert: C.amber, horz: C.sky };
type Result = { base: number; noise: number; series: Record<Pattern, number[]>; renderer: string };

// Recorded 2026-10-26: NVIDIA GeForce RTX 4060, Edge 156, ANGLE on Direct3D 11, 1024 × 1024, 200 iterations
const RECORDED: Result = {
  base: 0.246, noise: 0.479, renderer: "NVIDIA GeForce RTX 4060 (ANGLE, Direct3D 11)",
  series: {
    checker: [0.479, 0.479, 0.479, 0.246, 0.246, 0.246],
    vert: [0.479, 0.479, 0.247, 0.247, 0.246, 0.246],
    horz: [0.479, 0.479, 0.479, 0.246, 0.246, 0.246],
  },
};

const VS = `#version 300 es
void main() {
    vec2 p = vec2((gl_VertexID & 1) * 4 - 1, (gl_VertexID & 2) * 2 - 1);
    gl_Position = vec4(p, 0.0, 1.0);
}`;
// uMode: 0 checker, 1 vertical stripes, 2 horizontal stripes, 3 uniform (always A), 4 noise per pixel
const FS = `#version 300 es
precision highp float;
uniform float uCell;
uniform int uMode, uN;
out vec4 o;
void main() {
    vec2 c = floor(gl_FragCoord.xy / uCell);
    bool a = uMode == 0 ? mod(c.x + c.y, 2.0) < 1.0
           : uMode == 1 ? mod(c.x, 2.0) < 1.0
           : uMode == 2 ? mod(c.y, 2.0) < 1.0
           : uMode == 3 ? true
           : fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) < 0.5;
    float v = gl_FragCoord.x * 1e-3;
    if (a) { for (int i = 0; i < uN; i++) v = sin(v * 1.01 + 0.3); }   // path A
    else   { for (int i = 0; i < uN; i++) v = sin(v * 0.99 + 0.7); }   // path B: same cost
    o = vec4(v);
}`;

type Ctx = { canvas: HTMLCanvasElement; gl: WebGL2RenderingContext };

/** The smallest cell size from which every larger size runs at about the uniform time. */
function coherentFrom(ms: number[], base: number) {
  for (let i = 0; i < ms.length; i++) if (ms.slice(i).every(m => m < base * 1.3)) return SIZES[i];
  return null;
}

export function DivergenceTimerFigure({ t }: { t?: TrackTranslations }) {
  const [res, setRes] = useState<Result | null>(null);
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "none">("idle");
  const [progress, setProgress] = useState(0);
  const ctx = useRef<Ctx | null>(null);

  useEffect(() => {
    const c = ctx.current;
    if (c) claimContext(c.canvas);
    return () => { if (ctx.current) releaseContext(ctx.current.canvas, ctx.current.gl); ctx.current = null; };
  }, []);

  const measure = async () => {
    if (!ctx.current) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1024;
      const gl = canvas.getContext("webgl2");
      if (!gl) { setStatus("none"); setRes(RECORDED); return; }
      ctx.current = { canvas, gl };
    }
    const { gl } = ctx.current;
    const ext = gl.getExtension("EXT_disjoint_timer_query_webgl2");
    if (!ext) { setStatus("none"); setRes(RECORDED); setLive(false); return; }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { setStatus("none"); setRes(RECORDED); return; }
    gl.useProgram(pr);
    gl.viewport(0, 0, 1024, 1024);
    const loc = (n: string) => gl.getUniformLocation(pr, n);
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    setStatus("running"); setProgress(0);

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const once = async (mode: number, cell: number) => {
      gl.uniform1i(loc("uMode"), mode); gl.uniform1f(loc("uCell"), cell);
      const q = gl.createQuery()!;
      gl.beginQuery(ext.TIME_ELAPSED_EXT, q); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.endQuery(ext.TIME_ELAPSED_EXT);
      gl.flush();
      while (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) await sleep(2);
      const ms = gl.getParameter(ext.GPU_DISJOINT_EXT) ? Infinity : gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6;
      gl.deleteQuery(q);
      return ms;
    };

    // Warm up for 0.4 s so the GPU reaches its working clock, and shrink the work if one pass is slow
    let n = 200;
    gl.uniform1i(loc("uN"), n);
    const t0 = performance.now();
    let warm = Infinity;
    while (performance.now() - t0 < 400) warm = Math.min(warm, await once(3, 1));
    if (warm > 8) { n = Math.max(10, Math.round((n * 8) / warm)); gl.uniform1i(loc("uN"), n); }

    // Clocks still drift, so every setting is measured in 5 interleaved rounds and the fastest run kept:
    // noise only ever adds time
    const cfg: [number, number][] = [[3, 1], [4, 1]];
    PATTERNS.forEach((_, m) => SIZES.forEach(s => cfg.push([m, s])));
    const best = cfg.map(() => Infinity);
    for (let round = 0; round < 5; round++) {
      for (const [i, [m, s]] of cfg.entries()) for (let k = 0; k < 2; k++) best[i] = Math.min(best[i], await once(m, s));
      setProgress((round + 1) / 5);
    }
    const series = Object.fromEntries(PATTERNS.map((p, m) => [p, best.slice(2 + m * SIZES.length, 2 + (m + 1) * SIZES.length)])) as Record<Pattern, number[]>;
    setRes({ base: best[0], noise: best[1], series, renderer });
    setLive(true);
    setStatus("idle");
  };

  const r = res ?? RECORDED;
  const top = Math.max(r.base * 2.3, ...PATTERNS.flatMap(p => r.series[p]));
  const W = 520, H = 210, L = 44, R = 14, TOP = 10, B = 30;
  const x = (i: number) => L + (i / (SIZES.length - 1)) * (W - L - R);
  const y = (ms: number) => TOP + (1 - ms / top) * (H - TOP - B);
  const ww = coherentFrom(r.series.vert, r.base), wh = coherentFrom(r.series.horz, r.base);
  const label: Record<Pattern, string> = {
    checker: tx(t, "figDivT_checker", "checkerboard"),
    vert: tx(t, "figDivT_vert", "vertical stripes"),
    horz: tx(t, "figDivT_horz", "horizontal stripes"),
  };

  return (
    <Figure title={tx(t, "figDivT_title", "Divergence, timed on your GPU")}
      controls={<>
        <Row>
          <Btn onClick={() => { if (status !== "running") void measure(); }} active={status === "running"}>
            {status === "running" ? `${tx(t, "figDivT_running", "measuring")} ${Math.round(progress * 100)}%` : tx(t, "figDivT_run", "measure on this GPU")}
          </Btn>
          <Readout>{live ? r.renderer : `${tx(t, "figDivT_recorded", "recorded")}: ${RECORDED.renderer}`}</Readout>
        </Row>
        {status === "none" && <p className="text-[12px] text-[var(--text-main)]">{tx(t, "figDivT_none", "This browser does not expose GPU timer queries (EXT_disjoint_timer_query_webgl2), so the chart shows the recorded run. Chrome and Edge on a desktop usually have them.")}</p>}
        <Row>
          <Readout color={C.green}>{`${tx(t, "figDivT_uniform", "uniform branch")}: ${r.base.toFixed(3)} ms`}</Readout>
          <Readout color={C.red}>{`${tx(t, "figDivT_noise", "noise per pixel")}: ${r.noise.toFixed(3)} ms (×${(r.noise / r.base).toFixed(2)})`}</Readout>
          {ww && wh && <Readout color="var(--primary)">{`${tx(t, "figDivT_shape", "a warp covers")} ≈ ${ww} × ${wh} = ${ww * wh} ${tx(t, "figDivT_px", "pixels")}`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figDivT_note", "Both paths do the same 200 sines, so a pixel never costs more than one path. The dashed lines are one path (green) and both paths (red). Small cells cost double: every warp holds both colours. The size at which each line falls says how wide and how tall a warp is: on the RTX 4060 vertical stripes stop costing double at 4 pixels and horizontal ones at 8, so a warp there is a block 4 pixels wide and 8 tall, 32 lanes. Other GPUs give other shapes; press the button to see yours.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full max-w-[560px] mx-auto h-auto">
        {[0, 0.5, 1].map(f => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(top * f)} y2={y(top * f)} stroke="var(--code-line)" strokeWidth={0.6} />
            <T x={L - 5} y={y(top * f) + 3} size={8} anchor="end">{(top * f).toFixed(2)}</T>
          </g>
        ))}
        <T x={6} y={TOP + 4} size={8}>ms</T>
        <line x1={L} x2={W - R} y1={y(r.base)} y2={y(r.base)} stroke={C.green} strokeDasharray="5 4" strokeWidth={1.4} />
        <line x1={L} x2={W - R} y1={y(2 * r.base)} y2={y(2 * r.base)} stroke={C.red} strokeDasharray="5 4" strokeWidth={1.4} />
        <T x={W - R} y={y(r.base) - 4} size={8} anchor="end" color={C.green}>{tx(t, "figDivT_one", "one path")}</T>
        <T x={W - R} y={y(2 * r.base) - 4} size={8} anchor="end" color={C.red}>{tx(t, "figDivT_both", "both paths")}</T>
        {PATTERNS.map((p, k) => (
          <g key={p}>
            <polyline points={r.series[p].map((ms, i) => `${x(i) + (k - 1) * 3},${y(ms)}`).join(" ")} fill="none" stroke={COLOR[p]} strokeWidth={2} />
            {r.series[p].map((ms, i) => <circle key={i} cx={x(i) + (k - 1) * 3} cy={y(ms)} r={3.2} fill={COLOR[p]} />)}
          </g>
        ))}
        {SIZES.map((s, i) => <T key={s} x={x(i)} y={H - B + 14} size={8.5} anchor="middle">{`${s} px`}</T>)}
        <T x={(L + W - R) / 2} y={H - 4} size={8} anchor="middle">{tx(t, "figDivT_cell", "cell or stripe size")}</T>
      </svg>
      <p className="text-center text-[11px] font-mono pb-1">
        {PATTERNS.map((p, i) => <span key={p} style={{ color: COLOR[p] }}>{`${i ? " · " : ""}● ${label[p]}`}</span>)}
      </p>
    </Figure>
  );
}

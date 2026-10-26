"use client";

import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C } from "@/components/lesson/kit/figure";
import { claimContext, releaseContext } from "../kit/gl/context";

// ── What this figure shows ────────────────────────────────────────────────────
// Expressions whose result the GLSL specification leaves undefined, or that
// produce NaN and infinity, each run as a one-pixel shader on the reader's
// GPU and read back from a 32-bit float target. Inputs come from a uniform
// set to 0, so the compiler cannot work them out in advance (except where
// it rewrites the algebra itself, which is part of the lesson). The spec
// column quotes GLSL ES 3.00; the right column is what this GPU, driver and
// browser actually return. Without float render targets it shows a run
// recorded on an NVIDIA RTX 4060 in Edge.

type Case = { id: string; expr: string; code: string; pre?: string; spec: string };

// Each case sets float r. z is 0.0 at run time, n is NaN (the square root of −1).
const CASES: Case[] = [
  { id: "sqrt", expr: "sqrt(-1.0)", code: "r = sqrt(z - 1.0);", spec: "undefined for x < 0" },
  { id: "log", expr: "log(0.0)", code: "r = log(z);", spec: "undefined for x ≤ 0" },
  { id: "div0", expr: "1.0 / 0.0", code: "r = 1.0 / z;", spec: "+Inf in IEEE 754, which GLSL ES does not require" },
  { id: "zz", expr: "x / x, with x = 0.0", code: "r = z / z;", spec: "0 / 0 is NaN in IEEE 754" },
  { id: "pow2", expr: "pow(-2.0, 2.0)", code: "r = pow(z - 2.0, 2.0);", spec: "undefined for x < 0" },
  { id: "pow22", expr: "pow(-2.0, 2.2)", code: "r = pow(z - 2.0, 2.2);", spec: "undefined for x < 0" },
  { id: "pow0", expr: "pow(0.0, -1.0)", code: "r = pow(z, -1.0);", spec: "undefined for x = 0 and y ≤ 0" },
  { id: "norm", expr: "normalize(vec3(0.0)).x", code: "r = normalize(vec3(z)).x;", spec: "divides by a length of 0" },
  { id: "acos", expr: "acos(1.000001)", code: "r = acos(1.000001 + z);", spec: "undefined for |x| > 1" },
  { id: "atan", expr: "atan(0.0, 0.0)", code: "r = atan(z, z);", spec: "undefined when both are 0" },
  { id: "nan0", expr: "NaN * 0.0", code: "r = n * 0.0;", spec: "NaN in IEEE 754" },
  { id: "min", expr: "min(NaN, 1.0)", code: "r = min(n, 1.0);", spec: "not specified" },
  { id: "max", expr: "max(NaN, 0.0)", code: "r = max(n, 0.0);", spec: "not specified" },
  { id: "clamp", expr: "clamp(NaN, 0.0, 1.0)", code: "r = clamp(n, 0.0, 1.0);", spec: "not specified" },
  { id: "isnan", expr: "isnan(NaN) ? 1.0 : 0.0", code: "r = isnan(n) ? 1.0 : 0.0;", spec: "1, or always 0 if the GPU has no NaNs" },
  { id: "imod", expr: "-7 % 3", code: "r = float((int(z) - 7) % 3);", spec: "undefined if an operand is negative" },
  { id: "fmod", expr: "mod(-7.0, 3.0)", code: "r = mod(z - 7.0, 3.0);", spec: "x − y · floor(x / y) = 2" },
  { id: "smooth", expr: "smoothstep(1.0, 0.0, 0.25)", code: "r = smoothstep(1.0, 0.0, 0.25 + z);", spec: "undefined if edge0 ≥ edge1" },
  { id: "uninit", expr: "float x; (never written)", code: "float x; if (z > 1.0) x = 5.0; r = x;", spec: "undefined value" },
  { id: "noret", expr: "f() that misses its return", pre: "float f(float x) { if (x > 1.0) return 5.0; }", code: "r = f(z);", spec: "undefined value" },
];

// Recorded 2026-10-26: NVIDIA GeForce RTX 4060, Edge 156, ANGLE on Direct3D 11
const RECORDED_ON = "NVIDIA GeForce RTX 4060 (ANGLE, Direct3D 11)";
const RECORDED: Record<string, number> = {
  sqrt: NaN, log: -Infinity, div0: Infinity, zz: 1, pow2: 4, pow22: NaN, pow0: Infinity, norm: NaN, acos: NaN, atan: 0,
  nan0: 0, min: 1, max: NaN, clamp: 1, isnan: 1, imod: -1, fmod: 2, smooth: 0.84375, uninit: 0, noret: 0,
};

const VS = "#version 300 es\nvoid main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); gl_PointSize = 1.0; }";
const fs = (c: Case) => `#version 300 es
precision highp float;
precision highp int;
uniform float uZero;
out vec4 o;
${c.pre ?? ""}
void main() {
    float z = uZero, n = sqrt(uZero - 1.0), r = 0.0;
    ${c.code}
    o = vec4(r, 0.0, 0.0, 1.0);
}`;

const show = (v: number | undefined) =>
  v === undefined ? "—" : Number.isNaN(v) ? "NaN" : v === Infinity ? "+Inf" : v === -Infinity ? "−Inf" : String(Number(v.toPrecision(6)));
const tone = (v: number | undefined) => v === undefined ? "var(--text-muted)" : Number.isNaN(v) ? C.pink : Number.isFinite(v) ? "var(--text-main)" : C.amber;

export function GpuQuirksFigure({ t }: { t?: TrackTranslations }) {
  const [vals, setVals] = useState<Record<string, number> | null>(null);
  const [renderer, setRenderer] = useState<string | null>(null);
  const [none, setNone] = useState(false);
  const ctx = useRef<{ canvas: HTMLCanvasElement; gl: WebGL2RenderingContext } | null>(null);

  useEffect(() => {
    const c = ctx.current;
    if (c) claimContext(c.canvas);
    return () => { if (ctx.current) releaseContext(ctx.current.canvas, ctx.current.gl); ctx.current = null; };
  }, []);

  const run = () => {
    if (!ctx.current) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const gl = canvas.getContext("webgl2");
      if (!gl) { setNone(true); return; }
      ctx.current = { canvas, gl };
    }
    const { gl } = ctx.current;
    if (!gl.getExtension("EXT_color_buffer_float")) { setNone(true); return; }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, 1, 1);
    const compile = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = compile(gl.VERTEX_SHADER, VS);
    const out: Record<string, number> = {};
    const px = new Float32Array(4);
    for (const c of CASES) {
      const f = compile(gl.FRAGMENT_SHADER, fs(c));
      const pr = gl.createProgram()!;
      gl.attachShader(pr, vs); gl.attachShader(pr, f); gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        gl.useProgram(pr);
        gl.uniform1f(gl.getUniformLocation(pr, "uZero"), 0);
        gl.clearColor(7, 7, 7, 7); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, 1);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, px);
        out[c.id] = px[0];
      }
      gl.deleteProgram(pr); gl.deleteShader(f);
    }
    gl.deleteShader(vs); gl.deleteFramebuffer(fb); gl.deleteTexture(tex);
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    setRenderer(String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)));
    setVals(out);
  };

  const v = vals ?? RECORDED;
  return (
    <Figure title={tx(t, "figQuirk_title", "What the spec leaves open, asked of your GPU")}
      controls={<>
        <Row>
          <Btn onClick={run} active={!!vals}>{tx(t, "figQuirk_run", "run on this GPU")}</Btn>
          <Readout>{vals && renderer ? renderer : `${tx(t, "figQuirk_recorded", "recorded")}: ${RECORDED_ON}`}</Readout>
        </Row>
        {none && <p className="text-[12px] text-[var(--text-main)]">{tx(t, "figQuirk_none", "This browser cannot render to 32-bit float textures (EXT_color_buffer_float), so the table keeps the recorded values.")}</p>}
      </>}
      note={tx(t, "figQuirk_note", "Every row is a real one-pixel shader. Pink is NaN, amber is infinity. Look at x / x: 0 / 0 should be NaN, but the compiler simplified x / x to 1 before the GPU ever saw a zero. NaN * 0.0 became 0 the same way, while min and clamp quietly turned NaN into a number and max kept it. None of this is guaranteed: another GPU, driver or browser may print a different column, and that is exactly why shaders must not rely on it.")}>
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px] font-mono border-collapse min-w-[520px]">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              <th className="px-3 py-2 font-semibold">{tx(t, "figQuirk_expr", "expression")}</th>
              <th className="px-3 py-2 font-semibold">{tx(t, "figQuirk_spec", "the spec says")}</th>
              <th className="px-3 py-2 font-semibold text-right">{vals ? tx(t, "figQuirk_gpu", "this GPU") : tx(t, "figQuirk_rec", "RTX 4060")}</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map(c => (
              <tr key={c.id} className="border-t border-[var(--code-line)]">
                <td className="px-3 py-1.5 text-[var(--text-main)] whitespace-nowrap">{tx(t, `figQuirk_e_${c.id}`, c.expr)}</td>
                <td className="px-3 py-1.5 text-[var(--text-muted)] font-sans">{tx(t, `figQuirk_s_${c.id}`, c.spec)}</td>
                <td className="px-3 py-1.5 text-right font-bold" style={{ color: tone(v[c.id]) }}>{show(v[c.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

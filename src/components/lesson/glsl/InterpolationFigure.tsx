"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Slider, Sliders, Readout, f2 } from "@/components/lesson/kit/figure";
import { compileProgram, mat4, type Vec3 } from "../kit/gl/gl";
import { GLView } from "../kit/gl/GLView";

// ── What this figure shows ────────────────────────────────────────────────────
// A square floor tile made of two triangles, seen in perspective, with its
// varyings interpolated three ways: smooth (perspective-correct), noperspective
// (linear on screen) and flat (one vertex's value for the whole triangle).
// GLSL ES 3.00 has no noperspective, so the shader rebuilds it exactly: it
// passes v·w and w with smooth interpolation, and their ratio is the value
// interpolated linearly on screen (see the lesson). Lower the camera and the
// checker bends along the diagonal: the look of PlayStation 1 textures.

type Mode = "smooth" | "noper" | "flat";
type Show = "checker" | "colour";
const MODES: Mode[] = ["smooth", "noper", "flat"];
const MODE_EN: Record<Mode, string> = { smooth: "smooth", noper: "noperspective", flat: "flat" };

// Corners in the tile's plane (x, z) and their colours; triangles 0-1-2 and 0-2-3,
// so the provoking (last) vertex is 2 for the first and 3 for the second.
const CORNERS: [number, number][] = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
const COLOURS: Vec3[] = [[0.93, 0.27, 0.23], [0.25, 0.75, 0.35], [0.22, 0.45, 0.95], [0.97, 0.78, 0.18]];
const ORDER = [0, 1, 2, 0, 2, 3];

const VS = `#version 300 es
layout(location = 0) in vec2 aCorner;     // the tile's own coordinates, -1..1
layout(location = 1) in vec3 aColour;
uniform mat4 uMVP;

out vec2 vUV;                 // smooth: perspective-correct
out vec3 vUVw;                // (uv·w, w): the FS divides to get screen-linear uv
out vec3 vColW;               // colour·w, the same trick
out vec3 vCol;
flat out vec2 vUVFlat;        // flat: the provoking vertex's value
flat out vec3 vColFlat;

void main() {
    vec2 uv = aCorner * 0.5 + 0.5;
    gl_Position = uMVP * vec4(aCorner.x, 0.0, aCorner.y, 1.0);
    float w = gl_Position.w;
    vUV = uv;            vCol = aColour;
    vUVw = vec3(uv * w, w);
    vColW = aColour * w;
    vUVFlat = uv;        vColFlat = aColour;
}`;

const FS = `#version 300 es
precision highp float;
in vec2 vUV; in vec3 vUVw; in vec3 vColW; in vec3 vCol;
flat in vec2 vUVFlat; flat in vec3 vColFlat;
uniform int uMode;            // 0 smooth, 1 noperspective, 2 flat
uniform int uShow;            // 0 checker, 1 colour
uniform int uLine;            // 1: drawing the triangle edges
out vec4 FragColor;

// Box-filtered checker (Inigo Quilez): no shimmer where cells get small
float checker(vec2 p) {
    vec2 w = fwidth(p) + 1e-4;
    vec2 i = 2.0 * (abs(fract((p - 0.5 * w) * 0.5) - 0.5) - abs(fract((p + 0.5 * w) * 0.5) - 0.5)) / w;
    return 0.5 - 0.5 * i.x * i.y;
}

void main() {
    if (uLine == 1) { FragColor = vec4(1.0); return; }
    vec2 uv  = uMode == 0 ? vUV  : uMode == 1 ? vUVw.xy / vUVw.z : vUVFlat;
    vec3 col = uMode == 0 ? vCol : uMode == 1 ? vColW / vUVw.z   : vColFlat;
    if (uShow == 0) {
        float c = checker(uv * 8.0);
        col = mix(vec3(0.12, 0.13, 0.16), vec3(0.92, 0.9, 0.84), c);
        col = mix(col, vec3(0.95, 0.45, 0.15), step(uv.x, 0.06) * step(0.0, uv.x));   // a stripe along one edge
    }
    FragColor = vec4(col, 1.0);
}`;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject; lines: WebGLVertexArrayObject };

function vao(gl: WebGL2RenderingContext, idx: number[]) {
  const data = new Float32Array(idx.flatMap(i => [...CORNERS[i], ...COLOURS[i]]));
  const v = gl.createVertexArray()!;
  gl.bindVertexArray(v);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
  return v;
}

/** Camera on a circle above the tile: elevation φ, distance d; returns view-projection. */
function camera(phiDeg: number, d: number, aspect: number) {
  const phi = (phiDeg * Math.PI) / 180;
  const eye: Vec3 = [0, d * Math.sin(phi), d * Math.cos(phi)];
  const up: Vec3 = [0, Math.cos(phi), -Math.sin(phi)];
  const fov = 2 * Math.asin(Math.min(0.97, 1.0 / d));
  return mat4.multiply(mat4.perspective(fov, aspect, 0.05, 50), mat4.lookAt(eye, [0, 0, 0], up));
}

export function InterpolationFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("noper");
  const [show, setShow] = useState<Show>("checker");
  const [phi, setPhi] = useState(28);
  const [dist, setDist] = useState(2.2);
  const [edges, setEdges] = useState(true);

  // w of the nearest and farthest corner = their distance along the view axis
  const vp = camera(phi, dist, 16 / 9);
  const ws = CORNERS.map(([x, z]) => vp[3] * x + vp[11] * z + vp[15]);

  const init = (gl: WebGL2RenderingContext): Res => ({
    prog: compileProgram(gl, VS, FS),
    vao: vao(gl, ORDER),
    lines: vao(gl, [0, 1, 1, 2, 2, 3, 3, 0, 0, 2]),
  });
  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    gl.clearColor(0.06, 0.07, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const u = (n: string) => gl.getUniformLocation(r.prog, n);
    gl.useProgram(r.prog);
    gl.uniformMatrix4fv(u("uMVP"), false, camera(phi, dist, size.aspect));
    gl.uniform1i(u("uMode"), MODES.indexOf(mode));
    gl.uniform1i(u("uShow"), show === "checker" ? 0 : 1);
    gl.uniform1i(u("uLine"), 0);
    gl.bindVertexArray(r.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (edges) {
      gl.uniform1i(u("uLine"), 1);
      gl.bindVertexArray(r.lines);
      gl.drawArrays(gl.LINES, 0, 10);
    }
  };

  const modeNote: Record<Mode, string> = {
    smooth: tx(t, "figInterp_mSmooth", "Perspective-correct, the default. The squares shrink with distance the way a real floor's tiles do, and the diagonal where the two triangles meet is invisible."),
    noper: tx(t, "figInterp_mNoper", "Linear on screen. Each triangle on its own is blended as if it were flat on the glass, so the far half of the tile gets as much of the texture as the near half. The two triangles disagree along the diagonal, and the lines bend there. Raise the camera to 90°: with every corner at the same depth, the two modes agree."),
    flat: tx(t, "figInterp_mFlat", "No blend at all. Every pixel of a triangle gets the value of its provoking vertex, the last one: vertex 2 (blue) for the first triangle and vertex 3 (yellow) for the second. On the checker, one uv for the whole triangle means one colour."),
  };

  return (
    <Figure title={tx(t, "figInterp_title", "Three ways to interpolate a varying")}
      head={<>
        {MODES.map(m => <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{tx(t, `figInterp_${m}`, MODE_EN[m])}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Btn active={show === "checker"} onClick={() => setShow("checker")}>{tx(t, "figInterp_checker", "uv as a checker")}</Btn>
          <Btn active={show === "colour"} onClick={() => setShow("colour")}>{tx(t, "figInterp_colour", "vertex colours")}</Btn>
          <Btn active={edges} onClick={() => setEdges(e => !e)}>{tx(t, "figInterp_edges", "triangle edges")}</Btn>
        </Row>
        <Sliders>
          <Slider label={tx(t, "figInterp_phi", "camera height")} value={phi} min={8} max={90} step={1} onChange={setPhi} fmt={v => `${v}°`} />
          <Slider label={tx(t, "figInterp_dist", "camera distance")} value={dist} min={1.7} max={8} step={0.05} onChange={setDist} fmt={v => f2(v, 1)} />
        </Sliders>
        <Row>
          <Readout>{`w ${tx(t, "figInterp_near", "near")} = ${f2(Math.min(...ws), 2)}`}</Readout>
          <Readout>{`w ${tx(t, "figInterp_far", "far")} = ${f2(Math.max(...ws), 2)}`}</Readout>
          <Readout>{`${tx(t, "figInterp_ratio", "far / near")} = ${f2(Math.max(...ws) / Math.min(...ws), 2)}`}</Readout>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{modeNote[mode]}</p>
      </>}
      note={tx(t, "figInterp_note", "w is each corner's distance in front of the camera. When all four are equal, screen-linear and perspective-correct are the same thing; the larger far / near gets, the more noperspective goes wrong. WebGL 2 has no noperspective keyword, so this figure builds it from two smooth varyings, as the lesson explains.")}>
      <GLView<Res> init={init} draw={draw} look={{ yaw: 0, pitch: 0, fov: 1 }}
        frame={[mode, show, phi, dist, edges]} aspect={16 / 9} />
    </Figure>
  );
}

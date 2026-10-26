"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Slider, Sliders, Readout, useVisible } from "@/components/lesson/kit/figure";
import { compileProgram } from "../kit/gl/gl";
import { FULL_VS, drawFullscreen, ensureColorTarget, type ColorTarget } from "../kit/gl/glx";
import { GLView, useAnimationTime } from "../kit/gl/GLView";

// ── What this figure shows ────────────────────────────────────────────────────
// Three test scenes drawn by a fragment shader at a low resolution and then
// enlarged without filtering, so each pixel is a visible square. The same
// scene can be cut four ways: a hard step, a smoothstep of fixed width, a
// one-pixel ramp from fwidth, and that ramp plus the two fixes for detail
// smaller than a pixel (thin lines keep their brightness, stripes that no
// longer fit fade to their average). Turn on "move": aliasing is worst in
// motion, where hard edges crawl and stripes flicker.

type Scene = "shapes" | "grid" | "rings";
type Mode = "step" | "fixed" | "fwidth" | "fade";
const SCENES: Scene[] = ["shapes", "grid", "rings"];
const MODES: Mode[] = ["step", "fixed", "fwidth", "fade"];
const SCENE_EN: Record<Scene, string> = { shapes: "shapes", grid: "floor grid", rings: "rings" };
const MODE_EN: Record<Mode, string> = { step: "step()", fixed: "fixed smoothstep", fwidth: "fwidth", fade: "fwidth + thin detail" };

const SCENE_FS = `#version 300 es
precision highp float;
uniform vec2  uRes;
uniform int   uScene, uMode;
uniform float uZoom, uTime;
out vec4 FragColor;

const float FIXED = 0.004;    // the fixed smoothstep half-width, in scene units
const float PI = 3.14159265;

// Coverage of a filled shape with signed distance d (negative inside)
float fill(float d) {
    if (uMode == 0) return step(d, 0.0);
    if (uMode == 1) return 1.0 - smoothstep(-FIXED, FIXED, d);
    float w = fwidth(d);                          // how much d changes over one pixel
    return clamp(0.5 - d / w, 0.0, 1.0);
}

// Coverage of a line of half-width h, r = distance from its centre line
float line(float r, float h) {
    r = abs(r);
    if (uMode == 0) return step(r, h);
    if (uMode == 1) return 1.0 - smoothstep(h - FIXED, h + FIXED, r);
    float w = fwidth(r);
    if (uMode == 2) return clamp((h - r) / w + 0.5, 0.0, 1.0);
    // Thin line: draw it at least one pixel wide, and dim it by how much of that pixel it really covers
    float wide = max(2.0 * h, w);
    return clamp((0.5 * wide - r) / w + 0.5, 0.0, 1.0) * (2.0 * h / wide);
}

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

vec3 shapes(vec2 p) {
    vec3 col = vec3(0.07, 0.08, 0.1);
    vec2 q = rot(0.35 + 0.15 * uTime) * (p - vec2(-0.36, 0.0));
    vec2 b = abs(q) - vec2(0.16);
    float box = length(max(b, 0.0)) + min(max(b.x, b.y), 0.0);
    col = mix(col, vec3(0.96, 0.62, 0.14), fill(box));
    vec2 c = p - vec2(0.3, 0.0);
    float ring = line(length(c) - 0.24, 0.009);            // about 1.5 px wide at the default pixel size
    float a = atan(c.y, c.x) + 0.1 * uTime;
    // sin(6a)/6 · r ≈ the distance to the nearest of 12 spokes; these are thinner than a pixel
    float spokes = line(sin(a * 6.0) / 6.0 * length(c), 0.0025) * step(length(c), 0.24);
    return mix(col, vec3(0.93, 0.95, 1.0), max(ring, spokes));
}

vec3 grid(vec2 p) {
    vec3 ray = normalize(vec3(p.x, p.y - 0.12, -1.0));
    if (ray.y > -0.002) return vec3(0.42, 0.55, 0.72) + 0.25 * p.y;      // sky
    vec2 uv = (ray.xz / -ray.y) * uZoom + vec2(0.0, -uTime * 0.6);    // floor 1 unit below the camera
    vec2 g = abs(fract(uv + 0.5) - 0.5);                               // distance to the nearest line, per axis
    float h = 0.03;
    float cx = line(g.x, h), cy = line(g.y, h);
    if (uMode == 3) {                                                  // cells under ~2 px: fade to the average
        vec2 w = fwidth(uv);
        cx = mix(cx, 2.0 * h, smoothstep(0.3, 0.7, w.x));
        cy = mix(cy, 2.0 * h, smoothstep(0.3, 0.7, w.y));
    }
    float cov = 1.0 - (1.0 - cx) * (1.0 - cy);
    return mix(vec3(0.12, 0.13, 0.15), vec3(0.9, 0.88, 0.8), cov);
}

vec3 rings(vec2 p) {
    float phi = 260.0 * uZoom * dot(p, p) - uTime;      // phase grows with r², so the rings get finer outwards
    float c = cos(phi), v;
    if (uMode == 0) v = step(0.0, c);
    else if (uMode == 1) v = smoothstep(-0.08, 0.08, c);
    else {
        v = clamp(c / fwidth(c) + 0.5, 0.0, 1.0);
        if (uMode == 3) v = mix(v, 0.5, smoothstep(0.5 * PI, PI, fwidth(phi)));   // over half a period per pixel: average
    }
    return vec3(v);
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 col = uScene == 0 ? shapes(p / uZoom) : uScene == 1 ? grid(p) : rings(p);
    FragColor = vec4(col, 1.0);
}`;

const SHOW_FS = `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform vec2 uRes;
out vec4 FragColor;
void main() { FragColor = texture(uImage, gl_FragCoord.xy / uRes); }`;

type Res = { scene: WebGLProgram; show: WebGLProgram; vao: WebGLVertexArrayObject; target: { t: ColorTarget | null } };

export function EdgeAAFigure({ t }: { t?: TrackTranslations }) {
  const [scene, setScene] = useState<Scene>("shapes");
  const [mode, setMode] = useState<Mode>("step");
  const [px, setPx] = useState(4);
  const [zoom, setZoom] = useState(1);
  const [moving, setMoving] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(moving && vis.on);
  const [lowSize, setLowSize] = useState({ w: 0, h: 0 });

  const init = (gl: WebGL2RenderingContext): Res => ({
    scene: compileProgram(gl, FULL_VS, SCENE_FS),
    show: compileProgram(gl, FULL_VS, SHOW_FS),
    vao: gl.createVertexArray()!,
    target: { t: null },
  });
  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number }) => {
    const lw = Math.max(8, Math.round(size.w / px)), lh = Math.max(6, Math.round(size.h / px));
    if (lw !== lowSize.w || lh !== lowSize.h) setLowSize({ w: lw, h: lh });
    const tgt = r.target.t = ensureColorTarget(gl, r.target.t, lw, lh, { depth: false, linear: false });
    // 1: the scene, at the low resolution
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt.fbo);
    gl.viewport(0, 0, lw, lh);
    let p = r.scene, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform2f(u("uRes"), lw, lh);
    gl.uniform1i(u("uScene"), SCENES.indexOf(scene));
    gl.uniform1i(u("uMode"), MODES.indexOf(mode));
    gl.uniform1f(u("uZoom"), zoom);
    gl.uniform1f(u("uTime"), time);
    drawFullscreen(gl, r.vao);
    // 2: enlarge it with nearest filtering, one square per low-res pixel
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, size.w, size.h);
    p = r.show; u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tgt.tex[0]);
    gl.uniform1i(u("uImage"), 0);
    gl.uniform2f(u("uRes"), size.w, size.h);
    drawFullscreen(gl, r.vao);
  };

  const modeNote: Record<Mode, string> = {
    step: tx(t, "figAA_mStep", "Each pixel asks one question at its centre, inside or outside, and gets all or nothing. Edges become stairs, lines thinner than a pixel break into dashes, and fine stripes turn into patterns that are not there (moiré)."),
    fixed: tx(t, "figAA_mFixed", "A smoothstep whose width is a fixed distance in the scene. At one zoom it looks right; zoom in and the edges go blurry, zoom out (or look at the far floor) and they are hard again, because the width did not follow the pixel size."),
    fwidth: tx(t, "figAA_mFwidth", "The ramp is one pixel wide wherever the pixel is: fwidth(d) says how much d changes across one pixel, and d / fwidth(d) is the distance measured in pixels. Edges are clean at every zoom. Detail thinner than a pixel is still a problem: the spokes flicker and the far grid and the outer rings still form moiré."),
    fade: tx(t, "figAA_mFade", "Two more uses of fwidth. A line thinner than a pixel is drawn one pixel wide but dimmed by how much of the pixel it covers, so it stays continuous. And where the pattern repeats faster than every two pixels, it is replaced by its average colour: the far floor turns into an even grey, the outer rings into flat grey, instead of a false pattern. The grey area of the rings is a diamond, not a circle: fwidth adds |dFdx| and |dFdy|, so it overestimates the change along the diagonals."),
  };

  return (
    <Figure title={tx(t, "figAA_title", "Four ways to cut an edge")}
      head={<>
        {SCENES.map(s => <Btn key={s} active={scene === s} onClick={() => setScene(s)}>{tx(t, `figAA_scene_${s}`, SCENE_EN[s])}</Btn>)}
      </>}
      controls={<>
        <Row>
          {MODES.map(m => <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{tx(t, `figAA_mode_${m}`, MODE_EN[m])}</Btn>)}
          <Btn active={moving} onClick={() => setMoving(v => !v)}>{tx(t, "figAA_move", "move")}</Btn>
        </Row>
        <Sliders>
          <Slider label={tx(t, "figAA_px", "pixel size")} value={px} min={1} max={12} step={1} onChange={setPx} fmt={v => `${v}×`} />
          <Slider label={tx(t, "figAA_zoom", "zoom")} value={zoom} min={0.4} max={3} step={0.01} onChange={setZoom} fmt={v => `${v.toFixed(2)}×`} />
        </Sliders>
        <Row>
          <Readout>{`${tx(t, "figAA_rendered", "rendered at")} ${lowSize.w} × ${lowSize.h}`}</Readout>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{modeNote[mode]}</p>
      </>}
      note={tx(t, "figAA_note", "The scene is drawn at a low resolution and then blown up without smoothing, so you can count the pixels. Pixel size 1 is your screen's real resolution. Compare the four modes on each scene, then turn on \"move\": a still image hides most of the aliasing, motion shows it.")}>
      <div ref={vis.ref}>
        <GLView<Res> init={init} draw={draw} look={{ yaw: 0, pitch: 0, fov: 1 }}
          frame={[scene, mode, px, zoom, time]} aspect={16 / 9} />
      </div>
    </Figure>
  );
}

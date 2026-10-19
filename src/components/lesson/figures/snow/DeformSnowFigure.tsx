"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, mat4, norm, cross, sub, type Mat4, type Vec3 } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen, makeColorTarget, uploadMesh, spherePNUT, type ColorTarget, type Mesh } from "../../kit/gl/glx";
import { GLView, useAnimationTime, type Look } from "../../kit/gl/GLView";
import { STAMP_FS, SNOW_VS, SNOW_FS, BALL_VS, BALL_FS, MAP_FS, SKY_FS } from "./deformShader";

const HORIZON: Vec3 = [0.8, 0.86, 0.93];   // display colour where sky and haze meet

// ── What this figure shows ────────────────────────────────────────────────────
// A 6 × 6 m patch of fresh snow whose surface is a 512² height texture. Each
// frame a stamp pass presses boots or a rolling snowball into it (ping-pong
// between two textures), and a 256² grid is pushed down by it in the vertex
// shader. The walker follows the pointer (or a finger) and walks a figure of
// eight on its own otherwise. Low sun + self-shadows are what make the prints
// readable; "the texture" shows the height map that drives everything.

type Mode = "boots" | "ball";
type View = "snow" | "mesh";
const LOOK: Look = { yaw: 0, pitch: 0, fov: 0.9 };
const HALF = 3;              // the patch is 2·HALF metres wide
const MAP = 512;
const GRID = 255;            // segments per side of the displaced mesh
const STRIDE = 0.62;         // distance between two footprints (one step), m
const BALL_R = 0.3;

type Walker = { x: number; z: number; dx: number; dz: number; s: number; sinceStep: number; left: boolean; rot: Mat4; fresh: boolean };
type Res = {
  stamp: WebGLProgram; snow: WebGLProgram; ball: WebGLProgram; map: WebGLProgram; sky: WebGLProgram;
  vao: WebGLVertexArrayObject; grid: { vao: WebGLVertexArrayObject; count: number }; field: { vao: WebGLVertexArrayObject; count: number };
  sphere: Mesh; targets: ColorTarget[]; cur: number; last: number; walker: Walker; reset: boolean;
};

/** A square grid of (x, z) in −1…1, as indexed triangles. */
function gridMesh(gl: WebGL2RenderingContext, n: number) {
  const pos = new Float32Array((n + 1) * (n + 1) * 2);
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const k = (j * (n + 1) + i) * 2;
    pos[k] = (i / n) * 2 - 1; pos[k + 1] = (j / n) * 2 - 1;
  }
  const idx = new Uint32Array(n * n * 6);
  let o = 0;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
    idx.set([a, c, b, b, c, d], o); o += 6;
  }
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, count: idx.length };
}

/** Rotation by `a` radians about the unit axis `k` (Rodrigues), as a column-major mat4. */
function axisAngle(k: Vec3, a: number): Mat4 {
  const c = Math.cos(a), s = Math.sin(a), t = 1 - c, [x, y, z] = k;
  const m = mat4.identity();
  m[0] = t * x * x + c;     m[4] = t * x * y - s * z; m[8] = t * x * z + s * y;
  m[1] = t * x * y + s * z; m[5] = t * y * y + c;     m[9] = t * y * z - s * x;
  m[2] = t * x * z - s * y; m[6] = t * y * z + s * x; m[10] = t * z * z + c;
  return m;
}

/** The figure-of-eight the walker follows when nobody steers. */
const pathAt = (s: number) => ({ x: 1.5 * Math.sin(s), z: 0.1 + 1.2 * Math.sin(s) * Math.cos(s) });

export function DeformSnowFigure({ t }: { t?: TrackTranslations }) {
  const [view, setView] = useState<View>("snow");
  const [mode, setMode] = useState<Mode>("boots");
  const [depth, setDepth] = useState(0.15);
  const [sink, setSink] = useState(0.75);
  const [berm, setBerm] = useState(0.15);
  const [refill, setRefill] = useState(0.03);
  const [sunDeg, setSunDeg] = useState(16);
  const [shadows, setShadows] = useState(true);
  const [above, setAbove] = useState(false);
  const [inset, setInset] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [resetTick, setResetTick] = useState(0);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(playing && vis.on);
  const hover = useRef<{ x: number; y: number } | null>(null);
  const resRef = useRef<Res | null>(null);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => {
    const [stamp, snow, ball, map, sky] = await Promise.all([
      compileProgramAsync(gl, FULL_VS, STAMP_FS), compileProgramAsync(gl, SNOW_VS, SNOW_FS),
      compileProgramAsync(gl, BALL_VS, BALL_FS), compileProgramAsync(gl, FULL_VS, MAP_FS),
      compileProgramAsync(gl, FULL_VS, SKY_FS),
    ]);
    const targets = [0, 1].map(() => makeColorTarget(gl, MAP, MAP, { float: true, depth: false, linear: true }));
    const r: Res = {
      stamp, snow, ball, map, sky, vao: gl.createVertexArray()!, grid: gridMesh(gl, GRID), field: gridMesh(gl, 8),
      sphere: uploadMesh(gl, spherePNUT(24, 36)), targets, cur: 0, last: 0, reset: true,
      walker: { x: 0, z: 0.2, dx: 1, dz: 0, s: 0, sinceStep: STRIDE, left: false, rot: mat4.identity(), fresh: true },
    };
    resRef.current = r;
    return r;
  };

  // Camera
  const camera = () => above
    ? { eye: [0, 7.2, 0.6] as Vec3, at: [0, 0, 0] as Vec3 }
    : { eye: [0, 1.2, 2.3] as Vec3, at: [0, 0.12, -0.4] as Vec3 };

  /** Where a point on screen (NDC) meets the snow's top, y = 0. */
  const pick = (ndc: { x: number; y: number }, aspect: number) => {
    const { eye, at } = camera();
    const f = norm(sub(at, eye)), rt = norm(cross(f, [0, 1, 0])), up = cross(rt, f);
    const th = Math.tan(LOOK.fov / 2);
    const d = norm([0, 1, 2].map(i => f[i] + ndc.x * th * aspect * rt[i] + ndc.y * th * up[i]) as Vec3);
    if (d[1] > -1e-3) return null;
    const k = -eye[1] / d[1];
    return { x: eye[0] + d[0] * k, z: eye[2] + d[2] * k };
  };

  // ── One step of the walker: move, and say what touches the snow ──
  const step = (r: Res, dt: number, aspect: number) => {
    const w = r.walker, speed = mode === "ball" ? 1.0 : 1.15;
    let target = hover.current ? pick(hover.current, aspect) : null;
    if (target) target = { x: Math.max(-HALF + 0.4, Math.min(HALF - 0.4, target.x)), z: Math.max(-HALF + 0.4, Math.min(HALF - 0.4, target.z)) };
    if (!target) {
      let p = pathAt(w.s);
      while (Math.hypot(p.x - w.x, p.z - w.z) < 0.35) { w.s += 0.05; p = pathAt(w.s); }
      target = p;
    }
    const ex = target.x - w.x, ez = target.z - w.z, dist = Math.hypot(ex, ez);
    const moved = Math.min(dist > 0.06 ? speed * dt : 0, dist);
    if (moved > 0) {
      // Turn smoothly towards the target, then walk along the heading
      const k = Math.min(1, dt * 6);
      w.dx += (ex / dist - w.dx) * k; w.dz += (ez / dist - w.dz) * k;
      const l = Math.hypot(w.dx, w.dz); w.dx /= l; w.dz /= l;
      w.x += w.dx * moved; w.z += w.dz * moved;
    }
    const stamps: number[] = [];
    if (mode === "boots") {
      w.sinceStep += moved;
      if (w.sinceStep >= STRIDE || w.fresh) {
        w.sinceStep = 0; w.left = !w.left;
        const side = w.left ? 0.09 : -0.09;                  // feet sit either side of the walking line
        stamps.push(w.x - w.dz * side, w.z + w.dx * side, Math.atan2(w.dz, w.dx), 1);
      }
    } else {
      // Roll: the ball turns about the axis up × direction, by distance / radius
      if (moved > 0) w.rot = mat4.multiply(axisAngle(norm([w.dz, 0, -w.dx]), moved / BALL_R), w.rot);
      stamps.push(w.x, w.z, 0, 3);
    }
    w.fresh = false;
    return stamps;
  };

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    const dt = Math.max(0, Math.min(0.05, time - r.last));
    r.last = time;
    const stamps = playing ? step(r, dt, size.aspect) : [];
    const ballY = BALL_R - sink * depth;                    // the ball sinks as far as a boot would

    // ── 1. Stamp pass: read one texture, write the other ──
    const src = r.targets[r.cur], dst = r.targets[1 - r.cur];
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.viewport(0, 0, MAP, MAP);
    gl.disable(gl.DEPTH_TEST);
    let p = r.stamp, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex[0]);
    gl.uniform1i(u("uPrev"), 0);
    gl.uniform1f(u("uHalf"), HALF);
    gl.uniform1f(u("uDepth"), depth);
    gl.uniform4fv(u("uStamp"), new Float32Array([...stamps, ...new Array(16 - stamps.length).fill(0)]));
    gl.uniform1i(u("uCount"), stamps.length / 4);
    gl.uniform1f(u("uSink"), sink);
    gl.uniform1f(u("uBallR"), BALL_R);
    gl.uniform1f(u("uBallY"), ballY);
    gl.uniform1f(u("uBerm"), berm);
    gl.uniform1f(u("uRefill"), 1 - Math.exp(-refill * dt));
    gl.uniform1i(u("uReset"), r.reset ? 1 : 0);
    drawFullscreen(gl, r.vao);
    r.reset = false;
    r.cur = 1 - r.cur;
    const mapTex = dst.tex[0];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // ── 2. The scene ──
    gl.viewport(0, 0, size.w, size.h);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    const { eye, at } = camera();
    const vp = mat4.multiply(mat4.perspective(LOOK.fov, size.aspect, 0.05, 200), mat4.lookAt(eye, at, [0, 1, 0]));
    const a = (sunDeg * Math.PI) / 180, az = 2.2;
    const sun: Vec3 = [Math.cos(a) * Math.cos(az), Math.sin(a), -Math.cos(a) * Math.sin(az)];
    const w = r.walker;
    const ballOn = mode === "ball";

    // the sky, as a fullscreen pass behind everything
    const cf = norm(sub(at, eye)), cr = norm(cross(cf, [0, 1, 0])), cu = cross(cr, cf);
    p = r.sky; u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform3fv(u("uCamF"), cf); gl.uniform3fv(u("uCamR"), cr); gl.uniform3fv(u("uCamU"), cu);
    gl.uniform3fv(u("uSun"), sun);
    gl.uniform3fv(u("uHorizon"), HORIZON);
    gl.uniform1f(u("uTanHalf"), Math.tan(LOOK.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    drawFullscreen(gl, r.vao);
    gl.enable(gl.DEPTH_TEST);

    p = r.snow; u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.bindTexture(gl.TEXTURE_2D, mapTex);
    gl.uniform1i(u("uMap"), 0);
    gl.uniformMatrix4fv(u("uVP"), false, vp);
    gl.uniform1f(u("uHalf"), HALF);
    gl.uniform1f(u("uDepth"), depth);
    gl.uniform3fv(u("uSun"), sun);
    gl.uniform3fv(u("uCam"), eye);
    gl.uniform1f(u("uTexel"), 1 / MAP);
    gl.uniform4f(u("uBall"), w.x, ballY, w.z, ballOn ? BALL_R : 0);
    gl.uniform1i(u("uView"), view === "mesh" ? 1 : 0);
    gl.uniform1i(u("uShadows"), shadows ? 1 : 0);
    gl.uniform3fv(u("uHorizon"), HORIZON);
    // the patch, displaced
    gl.uniform1i(u("uFlat"), 0);
    gl.uniform1f(u("uScale"), HALF);
    gl.bindVertexArray(r.grid.vao);
    gl.drawElements(gl.TRIANGLES, r.grid.count, gl.UNSIGNED_INT, 0);
    // the untouched field around it
    gl.uniform1i(u("uFlat"), 1);
    gl.uniform1f(u("uScale"), 60);
    gl.bindVertexArray(r.field.vao);
    gl.drawElements(gl.TRIANGLES, r.field.count, gl.UNSIGNED_INT, 0);

    if (ballOn) {
      p = r.ball; u = (n: string) => gl.getUniformLocation(p, n);
      gl.useProgram(p);
      const s = mat4.scale(2 * BALL_R);
      const model = mat4.multiply(mat4.translation(w.x, ballY, w.z), mat4.multiply(w.rot, s));
      gl.uniformMatrix4fv(u("uVP"), false, vp);
      gl.uniformMatrix4fv(u("uModel"), false, model);
      gl.uniform3fv(u("uSun"), sun);
      gl.uniform3fv(u("uCam"), eye);
      gl.uniform3fv(u("uHorizon"), HORIZON);
      gl.bindVertexArray(r.sphere.vao);
      gl.drawArrays(gl.TRIANGLES, 0, r.sphere.count);
    }

    // ── 3. The texture, in the bottom-left corner ──
    if (inset) {
      gl.disable(gl.DEPTH_TEST);
      const side = Math.round(size.h * 0.34), pad = Math.round(size.h * 0.03);
      gl.viewport(pad, pad, side, side);
      p = r.map; u = (n: string) => gl.getUniformLocation(p, n);
      gl.useProgram(p);
      gl.bindTexture(gl.TEXTURE_2D, mapTex);
      gl.uniform1i(u("uMap"), 0);
      gl.uniform2f(u("uWalker"), w.x / (2 * HALF) + 0.5, w.z / (2 * HALF) + 0.5);
      drawFullscreen(gl, r.vao);
    }
  };

  const freshSnow = () => { if (resRef.current) resRef.current.reset = true; setResetTick(n => n + 1); };
  const viewNote: Record<View, string> = {
    snow: tx(t, "figDeform_vSnow", "Move the pointer over the snow (or drag a finger) and the walker follows it; leave it alone and it walks a figure of eight. Each footprint is one stamp into the height texture in the corner: dark is pressed down, orange is snow pushed up beside the print. Lower the sun and the prints get deep shadows; switch shadows off and they almost vanish, because the shape alone, lit from the side with soft sky light, has little contrast."),
    mesh: tx(t, "figDeform_vMesh", "The grid the vertex shader moves: every vertex reads the height texture once and sinks by uDepth · (h − 1). With 256 vertices across 6 m there is one every 2.3 cm, so a boot's lugs, 2.8 cm apart, are close to the limit; the lighting, which reads the texture per pixel, shows more detail than the mesh holds."),
  };

  return (
    <Figure title={tx(t, "figDeform_title", "Footprints in deformable snow")}
      head={<>
        {(["snow", "mesh"] as View[]).map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figDeform_view_${v}`, v === "snow" ? "snow" : "mesh")}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Btn active={mode === "boots"} onClick={() => setMode("boots")}>{tx(t, "figDeform_boots", "boots")}</Btn>
          <Btn active={mode === "ball"} onClick={() => setMode("ball")}>{tx(t, "figDeform_ball", "snowball")}</Btn>
          <Btn onClick={freshSnow}>{tx(t, "figDeform_fresh", "fresh snow")}</Btn>
          <Btn active={playing} onClick={() => setPlaying(v => !v)}>{playing ? tx(t, "figDeform_pause", "pause") : tx(t, "figDeform_play", "play")}</Btn>
          <Btn active={shadows} onClick={() => setShadows(v => !v)}>{tx(t, "figDeform_shadows", "shadows")}</Btn>
          <Btn active={above} onClick={() => setAbove(v => !v)}>{tx(t, "figDeform_above", "from above")}</Btn>
          <Btn active={inset} onClick={() => setInset(v => !v)}>{tx(t, "figDeform_inset", "the texture")}</Btn>
        </Row>
        <Sliders>
          <Slider label={tx(t, "figDeform_depth", "snow depth")} value={depth} min={0.05} max={0.5} step={0.01} onChange={setDepth} fmt={v => `${Math.round(v * 100)} cm`} />
          <Slider label={tx(t, "figDeform_sink", "how far it sinks")} value={sink} min={0.1} max={1} step={0.01} onChange={setSink} fmt={v => `${Math.round(v * 100)}%`} />
          <Slider label={tx(t, "figDeform_berm", "pushed-up rim")} value={berm} min={0} max={0.4} step={0.01} onChange={setBerm} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figDeform_refill", "snowfall refill k")} value={refill} min={0} max={0.4} step={0.005} onChange={setRefill} fmt={v => `${f2(v, 3)} /s`} />
          <Slider label={tx(t, "figDeform_sun", "sun height")} value={sunDeg} min={4} max={80} step={1} onChange={setSunDeg} fmt={v => `${v}°`} />
        </Sliders>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={tx(t, "figDeform_note", "Nothing here remembers a list of footprints. The texture is the memory: each frame reads last frame's texture and writes the next one, with h = min(h, the underside of whatever touches the snow), plus a little fresh snow that pulls every texel back towards 1 at the rate k. The snowball presses a spherical trench, so its print is as wide as the circle where the sphere cuts the snow's top, not as wide as the ball.")}>
      <div ref={vis.ref}>
        <GLView<Res> init={init} draw={draw} look={LOOK} onHover={n => { hover.current = n; }}
          frame={[time, view, mode, depth, sink, berm, refill, sunDeg, shadows, above, inset, resetTick]} aspect={16 / 9} />
      </div>
    </Figure>
  );
}

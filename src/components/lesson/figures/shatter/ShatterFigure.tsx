"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom, mat4, type Vec3 } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, lookBasis, rayDir, type Look } from "../../kit/gl/GLView";
import { fracture, shardMesh, PANE_W, PANE_H, PANE_Y0 } from "./fracture";
import { launches, launchTexels, bakeVAT, FPS, FRAMES } from "./shardSim";
import { SCENE_FS, SHARD_VS, SHARD_FS, VAT_FS } from "./shatterShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A pre-fractured pane (fracture.ts) hit by a stone. All shards are one mesh
// drawn in one call; the vertex shader moves each shard either by the closed
// form (it falls through the floor) or by reading a vertex animation texture
// baked from a small rigid-body simulation (shardSim.ts). The third view shows
// that texture itself.

type Mode = "closed" | "baked";
type View = "glass" | "ids" | "texture";
const MODES: Mode[] = ["closed", "baked"];
const VIEWS: View[] = ["glass", "ids", "texture"];
const MODE_EN: Record<Mode, string> = { closed: "closed form", baked: "baked texture (VAT)" };
const VIEW_EN: Record<View, string> = { glass: "glass", ids: "shard ids", texture: "the texture" };
const TARGET: Vec3 = [0, 0.8, 0];
const DIST = 2.4;
/** Highest pitch that keeps the camera above the floor: 0.8 − 2.4·sin(pitch) > 0.1. */
const MAX_PITCH = 0.2;

type Res = {
  scene: WebGLProgram; shard: WebGLProgram; vat: WebGLProgram; vao: WebGLVertexArrayObject;
  mesh: { vao: WebGLVertexArrayObject; buf: WebGLBuffer; count: number } | null;
  launchTex: WebGLTexture; vatTex: WebGLTexture; uploaded: unknown;
};

function floatTexture(gl: WebGL2RenderingContext, tex: WebGLTexture, w: number, h: number, data: Float32Array) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

export function ShatterFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.45, pitch: -0.16, fov: 0.95 });
  const [mode, setMode] = useState<Mode>("baked");
  const [view, setView] = useState<View>("glass");
  const [push, setPush] = useState(2.2);
  const [slow, setSlow] = useState(0.35);
  const [edges, setEdges] = useState(true);
  const [struck, setStruck] = useState(true);
  const [impact, setImpact] = useState<[number, number]>([-0.2, 1.05]);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(vis.on);
  const strikeAt = useRef(0);
  const since = struck ? Math.max(0, time - strikeAt.current) * slow : -1;
  const down = useRef<{ x: number; y: number } | null>(null);

  // Everything the GPU needs, rebuilt when the stone lands somewhere else
  const baked = useMemo(() => {
    const shards = fracture(impact);
    const ls = launches(shards, impact, push);
    return { n: shards.length, mesh: shardMesh(shards), launch: launchTexels(ls), vat: bakeVAT(shards, ls) };
  }, [impact, push]);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => {
    const [scene, shard, vat] = await Promise.all([
      compileProgramAsync(gl, FULL_VS, SCENE_FS), compileProgramAsync(gl, SHARD_VS, SHARD_FS), compileProgramAsync(gl, FULL_VS, VAT_FS),
    ]);
    return { scene, shard, vat, vao: gl.createVertexArray()!, mesh: null, launchTex: gl.createTexture()!, vatTex: gl.createTexture()!, uploaded: null };
  };

  const upload = (gl: WebGL2RenderingContext, r: Res) => {
    if (r.uploaded === baked) return;
    if (r.mesh) { gl.deleteVertexArray(r.mesh.vao); gl.deleteBuffer(r.mesh.buf); }
    const vao = gl.createVertexArray()!, buf = gl.createBuffer()!;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, baked.mesh, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);
    gl.bindVertexArray(null);
    r.mesh = { vao, buf, count: baked.mesh.length / 8 };
    floatTexture(gl, r.launchTex, baked.n, 3, baked.launch);
    floatTexture(gl, r.vatTex, baked.n, FRAMES * 2, baked.vat);
    r.uploaded = baked;
  };

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    upload(gl, r);
    gl.viewport(0, 0, size.w, size.h);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, r.launchTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, r.vatTex);

    if (view === "texture") {
      const p = r.vat, u = (n: string) => gl.getUniformLocation(p, n);
      gl.useProgram(p);
      gl.uniform1i(u("uVat"), 1);
      gl.uniform1i(u("uShards"), baked.n);
      gl.uniform1i(u("uFrames"), FRAMES);
      gl.uniform1f(u("uFrame"), Math.min(Math.max(since, 0) * FPS, FRAMES - 1));
      drawFullscreen(gl, r.vao);
      gl.activeTexture(gl.TEXTURE0);
      return;
    }

    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const eye: Vec3 = [TARGET[0] - f[0] * DIST, TARGET[1] - f[1] * DIST, TARGET[2] - f[2] * DIST];
    const viewProj = mat4.multiply(mat4.perspective(look.fov, size.aspect, 0.05, 60), mat4.lookAt(eye, TARGET, [0, 1, 0]));

    // 1. The courtyard
    let p = r.scene, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform3fv(u("uCamPos"), eye);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    drawFullscreen(gl, r.vao);

    // 2. Every shard, one draw call
    const ids = view === "ids";
    if (ids) { gl.enable(gl.DEPTH_TEST); gl.clear(gl.DEPTH_BUFFER_BIT); }
    else { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
    p = r.shard; u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniformMatrix4fv(u("uViewProj"), false, viewProj);
    gl.uniform3fv(u("uCamPos"), eye);
    gl.uniform1i(u("uLaunch"), 0);
    gl.uniform1i(u("uVat"), 1);
    gl.uniform1i(u("uMode"), MODES.indexOf(mode));
    gl.uniform1i(u("uFrames"), FRAMES);
    gl.uniform1f(u("uFps"), FPS);
    gl.uniform1f(u("uTime"), since);
    gl.uniform1i(u("uView"), ids ? 1 : 0);
    gl.uniform1i(u("uEdges"), edges ? 1 : 0);
    gl.bindVertexArray(r.mesh!.vao);
    gl.drawArrays(gl.TRIANGLES, 0, r.mesh!.count);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
  };

  /** A tap that did not drag is a stone thrown at that point of the pane. */
  const throwAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = down.current;
    down.current = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || view === "texture") return;
    const b = e.currentTarget.getBoundingClientRect();
    const ndcX = ((e.clientX - b.left) / b.width) * 2 - 1, ndcY = 1 - ((e.clientY - b.top) / b.height) * 2;
    const f = forwardFrom(look.yaw, look.pitch);
    const eye: Vec3 = [TARGET[0] - f[0] * DIST, TARGET[1] - f[1] * DIST, TARGET[2] - f[2] * DIST];
    const dir = rayDir(look, b.width / b.height, ndcX, ndcY);
    if (Math.abs(dir[2]) < 1e-4) return;
    const s = -eye[2] / dir[2], x = eye[0] + dir[0] * s, y = eye[1] + dir[1] * s;
    if (s <= 0 || Math.abs(x) > PANE_W / 2 || y < PANE_Y0 || y > PANE_Y0 + PANE_H) return;
    setImpact([x, y]);
    setStruck(true);
    strikeAt.current = time;
  };

  const modeNote: Record<Mode, string> = {
    closed: tx(t, "figShatter_nClosed", "Each shard's centre is c₀ + v·t + ½g·t², and it turns at a steady rate about a fixed axis: a few lines in the vertex shader, no memory, any number of shards. But the formula knows nothing about the floor: the shards sink straight through it (they are cut off where they pass under it)."),
    baked: tx(t, "figShatter_nBaked", "The same start, but this time a small rigid-body simulation ran once, when the stone landed, and wrote every shard's centre and turn for 150 frames into a float texture. The shards bounce, slide and settle on the floor; the vertex shader just reads two frames and blends them. The price: the motion is fixed, and memory grows with shards × frames."),
  };

  return (
    <Figure title={tx(t, "figShatter_title", "A pane that shatters")}
      head={<>{VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figShatter_view_${v}`, VIEW_EN[v])}</Btn>)}</>}
      controls={<>
        <Row>
          <Choice value={mode} options={MODES.map(m => [m, tx(t, `figShatter_mode_${m}`, MODE_EN[m])] as const)} onChange={m => { setMode(m); strikeAt.current = time; }} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figShatter_push", "stone's push")} value={push} min={0.3} max={4} step={0.05} onChange={setPush} fmt={v => `${f2(v, 2)} m/s`} />
          <Slider label={tx(t, "figShatter_slow", "slow motion")} value={slow} min={0.05} max={1} step={0.01} onChange={setSlow} fmt={v => `×${f2(v, 2)}`} />
        </Sliders>
        <Row>
          <Btn onClick={() => { setStruck(true); strikeAt.current = time; }}>{tx(t, "figShatter_again", "throw again")}</Btn>
          <Btn active={!struck} onClick={() => setStruck(false)}>{tx(t, "figShatter_mend", "whole pane")}</Btn>
          <Btn active={edges} onClick={() => setEdges(v => !v)}>{tx(t, "figShatter_edges", "green fracture faces")}</Btn>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">
          {view === "texture"
            ? tx(t, "figShatter_nTexture", "The baked texture, as a picture. Each column is one shard, each row one frame, time running down; the white line is the frame being played. Left half: the centre's movement since frame 0 as a colour (x, y, z → red, green, blue). Right half: the orientation quaternion. Where a column stops changing, that shard has come to rest.")
            : modeNote[mode]}
        </p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figShatter_noteMouse", "Click the pane to throw a stone there; drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figShatter_noteTouch", "Tap the pane to throw a stone there; drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figShatter_note", "The pane is cut into Voronoi shards before anything happens, crowded around the stone. All of them are one mesh drawn in one call: every vertex carries its shard's number, and the vertex shader moves the whole shard. Shards pass through each other, as they would in the cheapest game effects; the release is delayed with distance from the stone so the eye can follow it.")}
      </>}>
      <div ref={vis.ref} onPointerDown={e => { down.current = { x: e.clientX, y: e.clientY }; }} onPointerUp={throwAt}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={l => setLook({ ...l, pitch: Math.min(l.pitch, MAX_PITCH) })}
          frame={[look, since, mode, view, edges, baked]} aspect={16 / 9} fovRange={[0.4, 1.3]} />
      </div>
    </Figure>
  );
}

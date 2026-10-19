"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom, mat4, type Vec3 } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen, ensureColorTarget, uploadMesh, torusKnotPNUT, spherePNUT, trs, type ColorTarget, type Mesh } from "../../kit/gl/glx";
import { GLView, useAnimationTime, useSky, skyTexture, SkyPicker, lookBasis, type Look, type SkyImages } from "../../kit/gl/GLView";
import { ROOM_FS, GLASS_VS, GLASS_FS } from "./realtimeShader";

// ── What this figure shows ────────────────────────────────────────────────────
// Glass the way a game draws it: a real triangle mesh, rasterised, refracting
// only its front surface. Three ways to find what is behind it: the sky cube
// map (fast, but blind to the room), the screen behind it (sees the room, but
// only what is on screen), and a blurred copy of the screen (frosted glass).
// "Where it reads" paints the look-up itself instead of the result.

type Mode = "cube" | "screen" | "frosted";
type Shape = "knot" | "sphere" | "lens";
const MODES: Mode[] = ["cube", "screen", "frosted"];
const SHAPES: Shape[] = ["knot", "sphere", "lens"];
const MODE_EN: Record<Mode, string> = { cube: "cube map", screen: "screen space", frosted: "frosted" };
const SHAPE_EN: Record<Shape, string> = { knot: "torus knot", sphere: "sphere", lens: "lens" };
/** Size of each mesh, as x, y, z scale. */
const SCALE: Record<Shape, Vec3> = { knot: [1.6, 1.6, 1.6], sphere: [1.3, 1.3, 1.3], lens: [1.5, 1.5, 0.45] };
const DIST = 3.2;
/** Highest upward pitch: the camera sits at y = −3.2 sin(pitch) and must stay above the floor (y = −0.9). */
const MAX_PITCH = 0.2;

type Res = {
  room: WebGLProgram; glass: WebGLProgram; vao: WebGLVertexArrayObject;
  meshes: Record<Shape, Mesh>; target: ColorTarget | null;
  skyTex?: WebGLTexture | null; skyFrom?: SkyImages | null;
};

/**
 * Normal matrix of R_y·S·L (L a rotation): R_y·S⁻¹·L, the inverse-transpose,
 * which keeps normals perpendicular to a squashed surface (the lens).
 */
function normalMatrix(s: Vec3, rotY: number, lean: Float32Array) {
  const m = mat4.multiply(trs([0, 0, 0], [1 / s[0], 1 / s[1], 1 / s[2]], rotY), lean);
  return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]);
}

function rotX(a: number) {
  const m = mat4.identity(), c = Math.cos(a), s = Math.sin(a);
  m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
  return m;
}

export function RealtimeGlassFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.5, pitch: -0.22, fov: 0.9 });
  const [mode, setMode] = useState<Mode>("screen");
  const [shape, setShape] = useState<Shape>("knot");
  const [ior, setIor] = useState(1.5);
  const [spread, setSpread] = useState(0.03);
  const [depth, setDepth] = useState(0.6);
  const [rough, setRough] = useState(0.5);
  const [fresnel, setFresnel] = useState(true);
  const [show, setShow] = useState(false);
  const [spin, setSpin] = useState(true);
  const sky = useSky({ initial: "sky_04" });
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(spin && vis.on);
  const angle = time * 0.4;

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    room: await compileProgramAsync(gl, FULL_VS, ROOM_FS),
    glass: await compileProgramAsync(gl, GLASS_VS, GLASS_FS),
    vao: gl.createVertexArray()!,
    meshes: { knot: uploadMesh(gl, torusKnotPNUT(2, 3, 0.11)), sphere: uploadMesh(gl, spherePNUT(48, 64)), lens: uploadMesh(gl, spherePNUT(48, 64)) },
    target: null,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    const cube = skyTexture(gl, r, sky.images);
    gl.viewport(0, 0, size.w, size.h);
    if (!cube) { gl.clearColor(0.06, 0.07, 0.09, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const eye: Vec3 = [-f[0] * DIST, -f[1] * DIST, -f[2] * DIST];
    const viewProj = mat4.multiply(mat4.perspective(look.fov, size.aspect, 0.05, 50), mat4.lookAt(eye, [0, 0, 0], [0, 1, 0]));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube);

    // 1. The room: into a texture first when the glass will read the screen, then on screen
    const room = () => {
      const p = r.room, u = (n: string) => gl.getUniformLocation(p, n);
      gl.useProgram(p);
      gl.uniform1i(u("uSky"), 0);
      gl.uniform3fv(u("uCamPos"), eye);
      gl.uniform3fv(u("uCamF"), b.f);
      gl.uniform3fv(u("uCamR"), b.r);
      gl.uniform3fv(u("uCamU"), b.u);
      gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
      gl.uniform1f(u("uAspect"), size.aspect);
      drawFullscreen(gl, r.vao);
    };
    gl.disable(gl.DEPTH_TEST);
    if (mode !== "cube") {
      r.target = ensureColorTarget(gl, r.target, size.w, size.h, { depth: false });
      gl.bindFramebuffer(gl.FRAMEBUFFER, r.target.fbo);
      room();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, r.target.tex[0]);
      gl.generateMipmap(gl.TEXTURE_2D);                                    // the blur levels for frosted glass
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    room();

    // 2. The glass: front faces only, each pixel looks up what is behind it
    const s = SCALE[shape];
    const lean = shape === "knot" ? rotX(0.5 + 0.3 * Math.sin(angle * 0.7)) : mat4.identity();   // the knot also rocks
    const model = mat4.multiply(trs([0, 0.05, 0], s, angle), lean);
    const p = r.glass, u = (n: string) => gl.getUniformLocation(p, n);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(p);
    gl.uniformMatrix4fv(u("uModel"), false, model);
    gl.uniformMatrix3fv(u("uNormalMat"), false, normalMatrix(s, angle, lean));
    gl.uniformMatrix4fv(u("uViewProj"), false, viewProj);
    gl.uniform3fv(u("uCamPos"), eye);
    gl.uniform1i(u("uSky"), 0);
    gl.uniform1i(u("uScene"), 1);
    gl.uniform1i(u("uMode"), MODES.indexOf(mode));
    gl.uniform1i(u("uShow"), show ? 1 : 0);
    gl.uniform1f(u("uIor"), ior);
    gl.uniform1f(u("uSpread"), spread);
    gl.uniform1f(u("uDepth"), depth);
    gl.uniform1f(u("uRough"), rough);
    gl.uniform1f(u("uFresnel"), fresnel ? 1 : 0);
    const m = r.meshes[shape];
    gl.bindVertexArray(m.vao);
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.activeTexture(gl.TEXTURE0);
  };

  const modeNote: Record<Mode, string> = {
    cube: tx(t, "figRtGlass_nCube", "refract() gives a direction, and a cube map is a table of directions: one texture read. It is the cheapest glass there is, but the cube map holds only the far-away sky. The floor and the pillars are not in it, so the glass shows sky where the floor should be. Games fix this with cube maps captured from inside the room (reflection probes)."),
    screen: tx(t, "figRtGlass_nScreen", "The room is drawn first into a texture. Each glass pixel walks a distance d along T, projects that point back to the screen and reads the room there. Now the floor and pillars bend through the glass. The cost: d is a guess, the same for every pixel, and only what is on screen exists. Orbit until a pillar is right behind the edge of the knot: the colours smear where the look-up lands outside the image."),
    frosted: tx(t, "figRtGlass_nFrosted", "Frosted glass scatters each ray a little, so a pixel sees an average of nearby directions: a blur. The room texture has mipmaps, so a blurrier copy is one textureLod away; six taps on a small ring, turned at random for each pixel, round off the square mip blocks and add the grain of etched glass."),
  };

  return (
    <Figure title={tx(t, "figRtGlass_title", "Glass in a rasteriser")}
      head={<>
        {MODES.map(m => <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{tx(t, `figRtGlass_mode_${m}`, MODE_EN[m])}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Choice value={shape} options={SHAPES.map(s => [s, tx(t, `figRtGlass_shape_${s}`, SHAPE_EN[s])] as const)} onChange={setShape} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figRtGlass_ior", "index n")} value={ior} min={1} max={2.4} step={0.01} onChange={setIor} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figRtGlass_spread", "chromatic aberration ±Δn")} value={spread} min={0} max={0.12} step={0.002} onChange={setSpread} fmt={v => f2(v, 3)} />
          {mode !== "cube" && <Slider label={tx(t, "figRtGlass_depth", "distance d")} value={depth} min={0} max={2} step={0.02} onChange={setDepth} fmt={v => f2(v, 2)} />}
          {mode === "frosted" && <Slider label={tx(t, "figRtGlass_rough", "roughness")} value={rough} min={0} max={1} step={0.01} onChange={setRough} fmt={v => f2(v, 2)} />}
        </Sliders>
        <Row>
          <Btn active={fresnel} onClick={() => setFresnel(v => !v)}>{tx(t, "figRtGlass_fresnel", "Fresnel reflection")}</Btn>
          <Btn active={show} onClick={() => setShow(v => !v)}>{tx(t, "figRtGlass_show", "where it reads")}</Btn>
          <Btn active={spin} onClick={() => setSpin(v => !v)}>{tx(t, "figRtGlass_spin", "spin")}</Btn>
          <span className="ml-auto"><SkyPicker sources={sky.sources} value={sky.id} onChange={sky.setId} busy={sky.busy} /></span>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{modeNote[mode]}</p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figRtGlass_noteMouse", "Drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figRtGlass_noteTouch", "Drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figRtGlass_note", "A real mesh of triangles, drawn the way a game draws it. Only the front surface refracts, so the sphere magnifies the world instead of turning it upside down like the traced ball in the studio: the second surface is missing. Switch on “where it reads” to see the look-up itself. Chromatic aberration is the dispersion trick again: three refract() calls with three indices.")}
      </>}>
      <div ref={vis.ref}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={l => setLook({ ...l, pitch: Math.min(l.pitch, MAX_PITCH) })}
          frame={[look, mode, shape, ior, spread, depth, rough, fresnel, show, angle, sky.images]} aspect={16 / 9} fovRange={[0.4, 1.3]} />
      </div>
    </Figure>
  );
}

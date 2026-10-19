"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen, makeColorTarget, type ColorTarget } from "../../kit/gl/glx";
import { GLView, useAnimationTime, type Look } from "../../kit/gl/GLView";
import { CITY_FS, WIPE_FS, RAIN_FS } from "./rainShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A rainy window at night (rainShader.ts). The city behind is drawn into a
// texture with mipmaps; the fogged glass reads it at a blurry level, and drops
// and their trails read it sharp, through their own lens. Moving the pointer
// (or a finger) over the glass wipes it like a hand; the fog creeps back at
// the rate k, as condensation does.

type View = "window" | "height" | "mask";
const VIEWS: View[] = ["window", "height", "mask"];
const VIEW_EN: Record<View, string> = { window: "window", height: "water height", mask: "clear mask" };
const LOOK: Look = { yaw: 0, pitch: 0, fov: 1 };
const WIPE_W = 320, WIPE_H = 180;

type City = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };
type Res = {
  city: WebGLProgram; wipe: WebGLProgram; rain: WebGLProgram; vao: WebGLVertexArrayObject;
  cityTarget: City | null; wipes: ColorTarget[]; cur: number; last: number; reset: boolean;
};

/** A colour target whose texture keeps a full mip chain (the blur of the fogged glass). */
function makeCity(gl: WebGL2RenderingContext, w: number, h: number): City {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texStorage2D(gl.TEXTURE_2D, Math.floor(Math.log2(Math.max(w, h))) + 1, gl.RGBA8, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, tex, w, h };
}

export function RainGlassFigure({ t }: { t?: TrackTranslations }) {
  const [view, setView] = useState<View>("window");
  const [rain, setRain] = useState(0.55);
  const [fog, setFog] = useState(0.8);
  const [lens, setLens] = useState(0.025);
  const [blur, setBlur] = useState(4.5);
  const [k, setK] = useState(0.12);
  const [wipeOn, setWipeOn] = useState(true);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(playing && vis.on);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const resRef = useRef<Res | null>(null);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => {
    const [city, wipe, rainP] = await Promise.all([
      compileProgramAsync(gl, FULL_VS, CITY_FS), compileProgramAsync(gl, FULL_VS, WIPE_FS), compileProgramAsync(gl, FULL_VS, RAIN_FS),
    ]);
    const r: Res = {
      city, wipe, rain: rainP, vao: gl.createVertexArray()!, cityTarget: null,
      wipes: [0, 1].map(() => makeColorTarget(gl, WIPE_W, WIPE_H, { depth: false, linear: true })), cur: 0, last: 0, reset: true,
    };
    resRef.current = r;
    return r;
  };

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    const dt = Math.max(0, Math.min(0.05, time - r.last));
    r.last = time;

    // ── 1. The city, then its mipmaps ──
    if (!r.cityTarget || r.cityTarget.w !== size.w || r.cityTarget.h !== size.h) {
      if (r.cityTarget) { gl.deleteTexture(r.cityTarget.tex); gl.deleteFramebuffer(r.cityTarget.fbo); }
      r.cityTarget = makeCity(gl, size.w, size.h);
    }
    const C = r.cityTarget;
    gl.bindFramebuffer(gl.FRAMEBUFFER, C.fbo);
    gl.viewport(0, 0, C.w, C.h);
    let p = r.city, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uTime"), time);
    drawFullscreen(gl, r.vao);
    gl.bindTexture(gl.TEXTURE_2D, C.tex);
    gl.generateMipmap(gl.TEXTURE_2D);

    // ── 2. The wipe mask (ping-pong) ──
    const src = r.wipes[r.cur], dst = r.wipes[1 - r.cur];
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.viewport(0, 0, WIPE_W, WIPE_H);
    p = r.wipe; u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex[0]);
    gl.uniform1i(u("uPrev"), 0);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uReturn"), Math.exp(-k * dt));
    const now = pointer.current, before = lastPointer.current ?? now;
    const toQ = (n: { x: number; y: number }) => [((n.x + 1) / 2) * size.aspect, (n.y + 1) / 2];
    const down = wipeOn && !!now;
    if (down) { const a = toQ(before!), b = toQ(now!); gl.uniform4f(u("uStroke"), a[0], a[1], b[0], b[1]); }
    gl.uniform1i(u("uDown"), down ? 1 : 0);
    gl.uniform1i(u("uReset"), r.reset ? 1 : 0);
    drawFullscreen(gl, r.vao);
    lastPointer.current = now;
    r.reset = false;
    r.cur = 1 - r.cur;

    // ── 3. The window ──
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, size.w, size.h);
    p = r.rain; u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, C.tex);
    gl.uniform1i(u("uCity"), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, dst.tex[0]);
    gl.uniform1i(u("uWipe"), 1);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uTime"), time);
    gl.uniform1f(u("uRain"), rain);
    gl.uniform1f(u("uFog"), fog);
    gl.uniform1f(u("uLens"), lens);
    gl.uniform1f(u("uBlur"), blur);
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
    gl.activeTexture(gl.TEXTURE0);
  };

  const viewNote: Record<View, string> = {
    window: tx(t, "figRainGlass_vWindow", "Move the pointer over the glass (or drag a finger) to wipe the fog off with your hand; watch it creep back. Each big drop sits still, then slips a little way down, then sticks again, leaving a clear trail and a line of tiny droplets. Look into a big drop: the street lights inside it are upside down, because the drop is a lens."),
    height: tx(t, "figRainGlass_vHeight", "The water's height on the glass, the only thing the drops are made of. Bright is thick; the red streaks are the trails, which carry no height but have wiped the fog. The lighting, the lens and the clearing are all worked out from this one field."),
    mask: tx(t, "figRainGlass_vMask", "Where the glass is clear: white is sharp, black is fogged. Drops, trails and your wiping all write into it; only the wiping is stored from frame to frame (in a texture that fades back to fog), the drops and trails are recomputed every frame."),
  };

  return (
    <Figure title={tx(t, "figRainGlass_title", "Rain on a window")}
      head={<>{VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figRainGlass_view_${v}`, VIEW_EN[v])}</Btn>)}</>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figRainGlass_rain", "rain")} value={rain} min={0} max={1} step={0.01} onChange={setRain} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figRainGlass_fog", "condensation")} value={fog} min={0} max={1} step={0.01} onChange={setFog} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figRainGlass_lens", "lens strength")} value={lens} min={0} max={0.06} step={0.001} onChange={setLens} fmt={v => f2(v, 3)} />
          <Slider label={tx(t, "figRainGlass_blur", "blur (mip level)")} value={blur} min={0} max={7} step={0.1} onChange={setBlur} fmt={v => f2(v, 1)} />
          <Slider label={tx(t, "figRainGlass_k", "fog returns, k")} value={k} min={0} max={0.6} step={0.01} onChange={setK} fmt={v => `${f2(v, 2)} /s`} />
        </Sliders>
        <Row>
          <Btn active={playing} onClick={() => setPlaying(v => !v)}>{playing ? tx(t, "figRainGlass_pause", "pause") : tx(t, "figRainGlass_play", "play")}</Btn>
          <Btn active={wipeOn} onClick={() => setWipeOn(v => !v)}>{tx(t, "figRainGlass_wipe", "wipe with the pointer")}</Btn>
          <Btn onClick={() => { if (resRef.current) resRef.current.reset = true; }}>{tx(t, "figRainGlass_refog", "fog it all again")}</Btn>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={tx(t, "figRainGlass_note", "Nothing here is simulated: every drop is a hash of its cell, as with the snow, and its position is a function of time. The only memory is the wiping, kept in a small texture that decays by e^(−k·dt) each frame. The blur of the fogged glass costs nothing: the city is drawn once into a texture with mipmaps, and the fogged parts simply read a smaller, blurrier copy.")}>
      <div ref={vis.ref}>
        <GLView<Res> init={init} draw={draw} look={LOOK} onHover={n => { pointer.current = n; }}
          frame={[time, view, rain, fog, lens, blur, k, wipeOn]} aspect={16 / 9} />
      </div>
    </Figure>
  );
}

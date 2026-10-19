"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Readout, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, useSky, skyTexture, SkyPicker, lookBasis, type Look, type SkyImages } from "../../kit/gl/GLView";
import { spectrum } from "../glass/prismOptics";
import { BUBBLE_FS } from "./bubbleShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A soap bubble under a sky. Its colours are thin-film interference computed
// at 16 wavelengths on both walls (bubbleShader.ts). The film drains: thin at
// the top, thick at the bottom, and it swirls as it flows. Where it is under
// about 30 nm the two reflections cancel for every colour and the film goes
// black, the sign that a bubble is about to burst. "Thickness" shows the film
// itself; "no interference" adds the reflections' powers instead of their
// waves, which is what a film thicker than a few micrometres does.

type View = "colour" | "thickness" | "plain";
const VIEWS: View[] = ["colour", "thickness", "plain"];
const VIEW_EN: Record<View, string> = { colour: "colour", thickness: "thickness", plain: "no interference" };
const DIST = 3.2;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject; skyTex?: WebGLTexture | null; skyFrom?: SkyImages | null };

export function BubbleFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.2, pitch: -0.12, fov: 0.75 });
  const [view, setView] = useState<View>("colour");
  const [mean, setMean] = useState(450);
  const [drain, setDrain] = useState(0.95);
  const [backdrop, setBackdrop] = useState(true);
  const [swirl, setSwirl] = useState(0.6);
  const [playing, setPlaying] = useState(true);
  const sky = useSky({ initial: "sky_05" });
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(playing && vis.on);
  const spec = useMemo(() => spectrum(16), []);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, BUBBLE_FS),
    vao: gl.createVertexArray()!,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    const cube = skyTexture(gl, r, sky.images);
    gl.viewport(0, 0, size.w, size.h);
    if (!cube) { gl.clearColor(0.06, 0.07, 0.09, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube);
    gl.uniform1i(u("uSky"), 0);
    gl.uniform3f(u("uCamPos"), -f[0] * DIST, -f[1] * DIST, -f[2] * DIST);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1fv(u("uLam"), new Float32Array(spec.lambda));
    gl.uniform3fv(u("uW"), new Float32Array(spec.rgb.flat()));
    gl.uniform1f(u("uMean"), mean);
    gl.uniform1f(u("uDrain"), drain);
    gl.uniform1f(u("uSwirl"), swirl);
    gl.uniform1f(u("uTime"), time);
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uBackdrop"), backdrop ? 1 : 0);
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const viewNote: Record<View, string> = {
    colour: tx(t, "figBubble_vColour", "Each wall reflects some wavelengths and lets the others through, depending on its thickness and on the angle. Near the rim the light crosses the film at a slant, the path inside is shorter (cos θt), and the colours shift. Lower the average thickness until the top turns black."),
    thickness: tx(t, "figBubble_vThickness", "The film itself: dark is thin, light is thick, up to 1200 nm; pure black is under 30 nm, too thin to reflect anything. The colours in the other view follow these contours exactly."),
    plain: tx(t, "figBubble_vPlain", "The same bubble with the reflections added as powers, as if the two waves were unrelated. That is what happens when the film is thicker than the light's coherence length, a few micrometres for sunlight: a window pane, or a water drop. All the colour is gone; what is left is a faint, colourless Fresnel reflection."),
  };
  const top = mean * (1 - drain), bottom = mean * (1 + drain);

  return (
    <Figure title={tx(t, "figBubble_title", "A soap bubble")}
      head={<>
        {VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figBubble_view_${v}`, VIEW_EN[v])}</Btn>)}
      </>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figBubble_mean", "average thickness")} value={mean} min={50} max={1500} step={10} onChange={setMean} fmt={v => `${v} nm`} />
          <Slider label={tx(t, "figBubble_drain", "drainage")} value={drain} min={0} max={1} step={0.01} onChange={setDrain} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figBubble_swirl", "swirl")} value={swirl} min={0} max={1} step={0.01} onChange={setSwirl} fmt={v => f2(v, 2)} />
        </Sliders>
        <Row>
          <Btn active={playing} onClick={() => setPlaying(p => !p)}>{tx(t, "figBubble_flow", "flow")}</Btn>
          <Btn active={backdrop} onClick={() => setBackdrop(b => !b)}>{tx(t, "figBubble_backdrop", "black backdrop")}</Btn>
          <Readout>{`${tx(t, "figBubble_top", "top")} ≈ ${Math.round(top)} nm`}</Readout>
          <Readout>{`${tx(t, "figBubble_bottom", "bottom")} ≈ ${Math.round(bottom)} nm`}</Readout>
          <span className="ml-auto"><SkyPicker sources={sky.sources} value={sky.id} onChange={sky.setId} busy={sky.busy} /></span>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figBubble_noteMouse", "Drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figBubble_noteTouch", "Drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figBubble_note", "Three paths reach your eye: off the front wall, straight through both walls, and off the inside of the back wall, which makes the small, upside-down second image of the sky. Each is weighted by the thin-film reflectance at 16 wavelengths. A wall reflects at most about 8%, so against a bright sky the light coming through drowns the colours; photographers put a black card behind the bubble, as the backdrop button does, and keep the sky in front of it to be reflected. Very thick films (over about 1000 nm) fade to pale pink and green: many wavelengths fit, and their colours average out.")}
      </>}>
      <div ref={vis.ref}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={setLook} resolution={0.8}
          frame={[look, view, mean, drain, swirl, backdrop, time, sky.images]} aspect={16 / 9} fovRange={[0.35, 1.2]} />
      </div>
    </Figure>
  );
}

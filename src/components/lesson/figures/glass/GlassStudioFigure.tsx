"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Readout, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, useSky, skyTexture, SkyPicker, lookBasis, type Look, type SkyImages } from "../../kit/gl/GLView";
import { STUDIO_FS } from "./studioShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A glass object under a real sky, sphere-traced in one fullscreen shader
// (studioShader.ts): refraction in and out with refract(), Fresnel on every
// surface, total internal reflection, Beer–Lambert absorption and dispersion.
// Drag to orbit, wheel or pinch to zoom. The views split the image into the
// chapter's pieces: the Fresnel weight alone, the reflection alone, the
// refraction alone, and a count of total internal reflections per pixel.

type Shape = "sphere" | "prism" | "gem" | "torus" | "cube" | "wine";
type View = "full" | "fresnel" | "reflect" | "refract" | "bounces";
const SHAPES: Shape[] = ["sphere", "prism", "gem", "torus", "cube", "wine"];
const VIEWS: View[] = ["full", "fresnel", "reflect", "refract", "bounces"];
const SHAPE_EN: Record<Shape, string> = { sphere: "sphere", prism: "prism", gem: "diamond", torus: "torus", cube: "rounded cube", wine: "wine glass" };
const VIEW_EN: Record<View, string> = { full: "everything", fresnel: "F only", reflect: "reflection", refract: "refraction", bounces: "count bounces" };
/** What each shape looks best with: index, internal bounces followed. */
const SUGGEST: Record<Shape, { ior: number; bounces: number }> = {
  sphere: { ior: 1.5, bounces: 3 }, prism: { ior: 1.5, bounces: 4 }, gem: { ior: 2.42, bounces: 7 },
  torus: { ior: 1.5, bounces: 3 }, cube: { ior: 1.5, bounces: 4 }, wine: { ior: 1.5, bounces: 3 },
};
const MEDIA: [string, number][] = [["water", 1.33], ["glass", 1.5], ["diamond", 2.42]];
const DIST = 3.6;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject; skyTex?: WebGLTexture | null; skyFrom?: SkyImages | null };

const hexToRgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

export function GlassStudioFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.6, pitch: -0.32, fov: 0.85 });
  const [shape, setShape] = useState<Shape>("gem");
  const [view, setView] = useState<View>("full");
  const [ior, setIor] = useState(2.42);
  const [disp, setDisp] = useState(0.03);
  const [density, setDensity] = useState(0.3);
  const [tint, setTint] = useState("#d9f0ea");
  const [bounces, setBounces] = useState(7);
  const [spin, setSpin] = useState(true);
  const sky = useSky({ initial: "sky_04" });
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(spin && vis.on);
  const angle = time * 0.35;

  const pick = (s: Shape) => { setShape(s); setIor(SUGGEST[s].ior); setBounces(SUGGEST[s].bounces); };

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, STUDIO_FS),
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
    gl.uniform3f(u("uCamPos"), -f[0] * DIST, -f[1] * DIST - 0.1, -f[2] * DIST);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1i(u("uShape"), SHAPES.indexOf(shape));
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uBounces"), bounces);
    gl.uniform1i(u("uZero"), 0);
    gl.uniform1f(u("uIor"), ior);
    gl.uniform1f(u("uDisp"), disp);
    gl.uniform1f(u("uDensity"), density);
    gl.uniform1f(u("uAngle"), angle);
    gl.uniform3fv(u("uTint"), hexToRgb(tint));
    drawFullscreen(gl, r.vao);
  };

  const r0 = ((ior - 1) / (ior + 1)) ** 2;
  const crit = ior > 1 ? (Math.asin(1 / ior) * 180) / Math.PI : 90;
  const viewNote: Record<View, string> = {
    full: tx(t, "figStudio_vFull", "Everything together: the refracted world, the Fresnel reflection on top, absorption inside, and the colours split by dispersion."),
    fresnel: tx(t, "figStudio_vFresnel", "The Fresnel weight F of the first surface, black = 0, white = 1. It is dark where the surface faces you and turns white towards every rim, on every shape. That is the number the full image uses to mix reflection over refraction."),
    reflect: tx(t, "figStudio_vReflect", "Only the reflected ray of the first surface: the object as a perfect mirror. The full image shows this much of it at each pixel: F."),
    refract: tx(t, "figStudio_vRefract", "Only light that goes through, with no partial reflections. Total internal reflection is kept, since it is not optional: past the critical angle refract() gives nothing else."),
    bounces: tx(t, "figStudio_vBounces", "Each pixel coloured by how many times its path was totally reflected inside: grey none, blue one, red five or more. The diamond lights up: its facets are cut so that light entering the top bounces off the pavilion and comes back out of the top. Lower n towards glass and watch the red die out as the critical angle widens."),
  };

  return (
    <Figure title={tx(t, "figStudio_title", "Glass studio")}
      head={<>
        {VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figStudio_view_${v}`, VIEW_EN[v])}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Choice value={shape} options={SHAPES.map(s => [s, tx(t, `figStudio_shape_${s}`, SHAPE_EN[s])] as const)} onChange={pick} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figStudio_ior", "index n")} value={ior} min={1} max={2.6} step={0.01} onChange={setIor} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figStudio_disp", "dispersion ±Δn")} value={disp} min={0} max={0.08} step={0.002} onChange={setDisp} fmt={v => f2(v, 3)} />
          <Slider label={tx(t, "figStudio_density", "absorption")} value={density} min={0} max={3} step={0.05} onChange={setDensity} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figStudio_bounces", "inner bounces")} value={bounces} min={1} max={8} step={1} onChange={setBounces} fmt={v => String(v)} />
        </Sliders>
        <Row>
          {MEDIA.map(([name, v]) => (
            <Btn key={name} active={Math.abs(ior - v) < 0.005} onClick={() => setIor(v)}>{`${tx(t, `figStudio_m_${name}`, name)} ${v}`}</Btn>
          ))}
          <label className="inline-flex items-center gap-1.5 ml-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{tx(t, "figStudio_tint", "tint")}</span>
            <input type="color" value={tint} onChange={e => setTint(e.target.value)} className="w-8 h-6 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
          </label>
          <Btn active={spin} onClick={() => setSpin(s => !s)}>{tx(t, "figStudio_spin", "spin")}</Btn>
          <span className="ml-auto"><SkyPicker sources={sky.sources} value={sky.id} onChange={sky.setId} busy={sky.busy} /></span>
        </Row>
        <Row>
          <Readout>{`R₀ = ((n − 1)/(n + 1))² = ${f2(r0 * 100, 1)}%`}</Readout>
          <Readout>{`θc = asin(1/n) = ${f2(crit, 1)}°`}</Readout>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figStudio_noteMouse", "Drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figStudio_noteTouch", "Drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figStudio_note", "Every pixel follows one path through the glass: refracted on the way in, then at each exit either out or, past the critical angle, back in. The branch it does not follow is added as a look-up of the sky, weighted by Fresnel. Try the sphere at n = 1.0 (it vanishes), then 1.33 and 2.42: the world behind it flips and shrinks. Turn the prism slowly with dispersion up to see coloured edges. Raise absorption on the wine glass: only the thick base and stem take on the tint, because Beer–Lambert depends on the distance travelled inside.")}
      </>}>
      <div ref={vis.ref}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={setLook} resolution={0.8}
          frame={[look, shape, view, ior, disp, density, tint, bounces, angle, sky.images]} aspect={16 / 9} fovRange={[0.35, 1.3]} />
      </div>
    </Figure>
  );
}

"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, useSky, skyTexture, lookBasis, type Look, type SkyImages } from "../../kit/gl/GLView";
import { spectrum } from "../glass/prismOptics";
import { MATERIALS, brilliantPlanes } from "./gemCut";
import { DIAMOND_FS } from "./diamondShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A round brilliant of 73 facets traced exactly in one fullscreen shader, lit
// by the small lamps of a jeweller's showroom (or a sky). The cut angles are
// live: change the pavilion and the crown and the stone is rebuilt from its
// planes. "Colours" traces 1, 3 or 8 wavelengths: one gives brilliance with no
// fire, three is what an RGB shader does, eight is close to a real spectrum.
// The other views show where the light leaves (crown or pavilion) and how
// many total internal reflections each pixel's path made.

type View = "light" | "return" | "tir";
const VIEWS: View[] = ["light", "return", "tir"];
const VIEW_EN: Record<View, string> = { light: "light", return: "where it leaves", tir: "count reflections" };
const WAVES = [1, 3, 8] as const;
const TARGET = [0, -0.25, 0] as const;
const DIST = 3.4;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject; skyTex?: WebGLTexture | null; skyFrom?: SkyImages | null };

export function DiamondFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.3, pitch: -0.9, fov: 0.7 });
  const [view, setView] = useState<View>("light");
  const [mat, setMat] = useState("diamond");
  const [alpha, setAlpha] = useState(40.75);
  const [beta, setBeta] = useState(34.5);
  const [waves, setWaves] = useState<(typeof WAVES)[number]>(8);
  const [boost, setBoost] = useState(1);
  const [lamps, setLamps] = useState(true);
  const [spin, setSpin] = useState(true);
  const sky = useSky({ initial: "sky_04", off: lamps });
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(spin && vis.on);
  const angle = time * 0.25;
  const m = MATERIALS.find(x => x.id === mat)!;

  const planes = useMemo(() => brilliantPlanes(alpha, beta), [alpha, beta]);
  const spec = useMemo(() => {
    if (waves === 1) return { lambda: [550], rgb: [[1, 1, 1]] as [number, number, number][] };
    return spectrum(waves);
  }, [waves]);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, DIAMOND_FS),
    vao: gl.createVertexArray()!,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    const cube = lamps ? null : skyTexture(gl, r, sky.images);
    gl.viewport(0, 0, size.w, size.h);
    if (!lamps && !cube) { gl.clearColor(0.06, 0.07, 0.09, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube);
    gl.uniform1i(u("uSky"), 0);
    gl.uniform3f(u("uCamPos"), TARGET[0] - f[0] * DIST, TARGET[1] - f[1] * DIST, TARGET[2] - f[2] * DIST);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform4fv(u("uPlanes"), planes);
    gl.uniform1i(u("uCount"), planes.length / 4);
    gl.uniform1i(u("uWaves"), spec.lambda.length);
    gl.uniform1fv(u("uLam"), new Float32Array([...spec.lambda, ...Array(8 - spec.lambda.length).fill(550)]));
    gl.uniform3fv(u("uW"), new Float32Array([...spec.rgb.flat(), ...Array(3 * (8 - spec.rgb.length)).fill(0)]));
    gl.uniform1f(u("uA"), m.A);
    gl.uniform1f(u("uB"), m.B);
    gl.uniform1f(u("uBoost"), boost);
    gl.uniform1i(u("uBounces"), 10);
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uEnv"), lamps ? 0 : 1);
    gl.uniform1f(u("uAngle"), angle);
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const viewNote: Record<View, string> = {
    light: tx(t, "figDiamond_vLight", "The stone as you would see it. Each wavelength follows its own path: the reflections inside are the same for all of them, but every exit bends violet a little more than red. Set colours to 1 and the fire is gone; what is left is brilliance, the white light the cut sends back. Turn it slowly: the flashes that come and go are scintillation."),
    return: tx(t, "figDiamond_vReturn", "Where the light that enters each pixel leaves the stone: green through the crown, back towards the viewer; red through the pavilion, lost. Seen from above, a well-cut diamond is mostly green. Lower α below about 38° and a ring of red opens around the table (fish-eye); raise it above 48° and the middle goes red (nail-head)."),
    tir: tx(t, "figDiamond_vTir", "How many times the path is totally reflected inside before it first gets out: grey none, blue one, yellow two, red five or more. Under the table almost every path makes the two pavilion reflections of the derivation. Switch to glass and most of the colour drains away."),
  };

  return (
    <Figure title={tx(t, "figDiamond_title", "A round brilliant, traced")}
      head={<>
        {VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figDiamond_view_${v}`, VIEW_EN[v])}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Choice value={mat} options={MATERIALS.map(x => [x.id, tx(t, `figGemCut_m_${x.id}`, x.label)] as const)} onChange={setMat} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figGemCut_alpha", "pavilion angle α")} value={alpha} min={30} max={55} step={0.25} onChange={setAlpha} fmt={v => `${f2(v, 2)}°`} />
          <Slider label={tx(t, "figGemCut_beta", "crown angle β")} value={beta} min={20} max={45} step={0.5} onChange={setBeta} fmt={v => `${f2(v, 1)}°`} />
          <Slider label={tx(t, "figDiamond_boost", "dispersion ×")} value={boost} min={0} max={4} step={0.1} onChange={setBoost} fmt={v => `${f2(v, 1)}×`} />
        </Sliders>
        <Row>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{tx(t, "figDiamond_colours", "colours")}</span>
          {WAVES.map(w => <Btn key={w} active={waves === w} onClick={() => setWaves(w)}>{String(w)}</Btn>)}
          <Btn active={lamps} onClick={() => setLamps(true)}>{tx(t, "figDiamond_lamps", "showroom")}</Btn>
          <Btn active={!lamps} onClick={() => setLamps(false)}>{tx(t, "figDiamond_sky", "sky")}</Btn>
          <Btn active={spin} onClick={() => setSpin(s => !s)}>{tx(t, "figDiamond_spin", "turn")}</Btn>
          <Btn active={Math.abs(alpha - 40.75) < 0.01 && beta === 34.5} onClick={() => { setAlpha(40.75); setBeta(34.5); }}>{tx(t, "figGemCut_ideal", "Tolkowsky 1919")}</Btn>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figDiamond_noteMouse", "Drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figDiamond_noteTouch", "Drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figDiamond_note", "73 planes and no marching: the ray enters at the largest t of the planes it is entering and leaves at the smallest t of the planes it is heading out of. Inside, each exit lets (1 − F) of the light out and keeps F; past the critical angle it keeps all of it. Moissanite has more than twice the dispersion of diamond and throws visibly more colour; glass, at the same cut, is dull.")}
      </>}>
      <div ref={vis.ref}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={setLook} resolution={0.8}
          frame={[look, view, mat, planes, spec, boost, lamps, angle, sky.images]} aspect={16 / 9} fovRange={[0.3, 1.1]} />
      </div>
    </Figure>
  );
}

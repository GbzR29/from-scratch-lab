"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, f2 } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, lookBasis, type Look } from "../../kit/gl/GLView";
import { COVER_FS } from "./coverShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A yard under fresh snow, raymarched (coverShader.ts). "Geometry" adds the
// snow as real shape with smax(s(p) − T, s(p − u·T)); "shader only" is the
// usual game material trick, snow mixed in where the normal faces up; "bare"
// is the yard before the snow. Wind tilts "up" so snow sticks to the
// windward faces. Orbit to make the sparkle twinkle.

type View = "geometry" | "shader" | "bare";
const VIEWS: View[] = ["geometry", "shader", "bare"];
const VIEW_EN: Record<View, string> = { geometry: "geometry", shader: "shader only", bare: "bare" };
const TARGET: [number, number, number] = [0, 0.45, -0.1];
const DIST = 4.4;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function SnowCoverFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: -0.35, pitch: -0.42, fov: 0.8 });
  const [view, setView] = useState<View>("geometry");
  const [amount, setAmount] = useState(0.75);
  const [depth, setDepth] = useState(0.12);
  const [wind, setWind] = useState(0);
  const [sunDeg, setSunDeg] = useState(28);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, COVER_FS),
    vao: gl.createVertexArray()!,
  });
  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    const a = (sunDeg * Math.PI) / 180, az = 0.9;
    gl.useProgram(p);
    gl.uniform3f(u("uCamPos"), TARGET[0] - f[0] * DIST, TARGET[1] - f[1] * DIST, TARGET[2] - f[2] * DIST);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uDepth"), depth);
    gl.uniform1f(u("uAmount"), amount);
    gl.uniform1f(u("uWind"), wind);
    gl.uniform3f(u("uSun"), Math.cos(a) * Math.cos(az), Math.sin(a), Math.cos(a) * Math.sin(az));
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const viewNote: Record<View, string> = {
    geometry: tx(t, "figCover_vGeometry", "Real snow: a layer added to the shape itself. Look at the fence rails and the top of the crate: the snow sits on them as a rounded cap that sticks out past the edges, and the walls below stay bare. Raise the amount and the first patches, where the noise is highest, grow until they join."),
    shader: tx(t, "figCover_vShader", "The cheap way most games use: no new shape, only the colour mixed towards snow where the surface faces up, with noise to break the edge. It costs almost nothing, but the snow has no thickness: the crate's edges stay sharp and the rails stay thin. Games add a little thickness by pushing vertices out along the normal."),
    bare: tx(t, "figCover_vBare", "The yard before the snow, to compare. Everything snow does to the picture, it does by covering dark, coloured surfaces with a white, soft one that hides their edges."),
  };

  return (
    <Figure title={tx(t, "figCover_title", "Snow that settles")}
      head={<>
        {VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figCover_view_${v}`, VIEW_EN[v])}</Btn>)}
      </>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figCover_amount", "how much has fallen")} value={amount} min={0} max={1} step={0.01} onChange={setAmount} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figCover_depth", "deepest snow T")} value={depth} min={0.02} max={0.3} step={0.005} onChange={setDepth} fmt={v => `${Math.round(v * 100)} cm`} />
          <Slider label={tx(t, "figCover_wind", "wind (tilts up)")} value={wind} min={0} max={1.5} step={0.01} onChange={setWind} fmt={v => `${f2((Math.atan(v) * 180) / Math.PI, 0)}°`} />
          <Slider label={tx(t, "figCover_sun", "sun height")} value={sunDeg} min={5} max={70} step={1} onChange={setSunDeg} fmt={v => `${v}°`} />
        </Sliders>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figCover_noteMouse", "Drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figCover_noteTouch", "Drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figCover_note", "Tilt up into the wind and the snow moves onto the faces of the posts, rocks and pine that look into it, as blowing snow plastered on one side of every tree does after a storm. Orbit slowly in the sun: single grains flash and go out, because each is a tiny mirror that only sends the sun to your eye from one direction.")}
      </>}>
      <GLView<Res> orbit init={init} draw={draw} look={look} onLook={setLook} resolution={0.75}
        frame={[look, view, amount, depth, wind, sunDeg]} aspect={16 / 9} fovRange={[0.4, 1.2]} />
    </Figure>
  );
}

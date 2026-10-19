"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, lookBasis, type Look } from "../../kit/gl/GLView";
import { blackbodyLUT } from "./blackbody";
import { SMOKE_FS } from "./smokeShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A campfire's plume, raymarched as a volume (smokeShader.ts). The albedo goes
// from black soot (absorbs most of the light) to white steam (scatters almost
// all of it). "No self-shadow" skips the march towards the sun; the smoke goes
// flat and glows evenly. "Transmittance" shows 1 − T: how much of the
// background each pixel's smoke hides.

type View = "smoke" | "flat" | "trans";
const VIEWS: View[] = ["smoke", "flat", "trans"];
const VIEW_EN: Record<View, string> = { smoke: "smoke", flat: "no self-shadow", trans: "transmittance" };
const TARGET: [number, number, number] = [0.3, 1.7, 0];
const DIST = 4.6;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function SmokeFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.0, pitch: -0.05, fov: 0.85 });
  const [view, setView] = useState<View>("smoke");
  const [density, setDensity] = useState(8);
  const [albedo, setAlbedo] = useState(0.6);
  const [wind, setWind] = useState(0.6);
  const [sunDeg, setSunDeg] = useState(25);
  const [fire, setFire] = useState(true);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(playing && vis.on);
  const lut = useMemo(() => blackbodyLUT(), []);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, SMOKE_FS),
    vao: gl.createVertexArray()!,
  });
  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    const a = (sunDeg * Math.PI) / 180, az = 2.4;
    gl.useProgram(p);
    gl.uniform4fv(u("uBB"), lut);
    gl.uniform3f(u("uCamPos"), TARGET[0] - f[0] * DIST, TARGET[1] - f[1] * DIST, TARGET[2] - f[2] * DIST);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uTime"), time);
    gl.uniform3f(u("uSun"), Math.cos(a) * Math.cos(az), Math.sin(a), Math.cos(a) * Math.sin(az));
    gl.uniform1f(u("uDensity"), density);
    gl.uniform1f(u("uAlbedo"), albedo);
    gl.uniform1f(u("uWind"), wind);
    gl.uniform1i(u("uFire"), fire ? 1 : 0);
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const viewNote: Record<View, string> = {
    smoke: tx(t, "figSmoke_vSmoke", "Each pixel marches through the smoke in 72 steps. At every step it asks how much sunlight gets there, with six more steps towards the sun, so the far side of the plume lies in its own shadow. Lower the albedo towards 0.3 for sooty smoke from a smouldering fire: it absorbs most of the light and goes dark grey. Raise it to 0.99 for white steam."),
    flat: tx(t, "figSmoke_vFlat", "The same smoke without the march towards the sun: every point is lit as if nothing stood between it and the sun. The plume looks flat and painted on, with no lit side and no shadowed side. That second march is what makes a volume look round, and it is most of the cost."),
    trans: tx(t, "figSmoke_vTrans", "1 − T: white where the smoke hides everything behind it, black where it hides nothing. Near the fire, where the plume is narrow, the smoke is dense; higher up the same smoke has spread over more area and thins out, as 1/r²."),
  };

  return (
    <Figure title={tx(t, "figSmoke_title", "Smoke as a volume")}
      head={<>{VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figSmoke_view_${v}`, VIEW_EN[v])}</Btn>)}</>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figSmoke_density", "thickest σt")} value={density} min={0.5} max={12} step={0.1} onChange={setDensity} fmt={v => `${f2(v, 1)} /m`} />
          <Slider label={tx(t, "figSmoke_albedo", "albedo σs/σt")} value={albedo} min={0.05} max={0.99} step={0.01} onChange={setAlbedo} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figSmoke_wind", "wind")} value={wind} min={-1.5} max={1.5} step={0.01} onChange={setWind} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figSmoke_sun", "sun height")} value={sunDeg} min={3} max={80} step={1} onChange={setSunDeg} fmt={v => `${v}°`} />
        </Sliders>
        <Row>
          <Btn active={playing} onClick={() => setPlaying(v => !v)}>{playing ? tx(t, "figSmoke_pause", "pause") : tx(t, "figSmoke_play", "play")}</Btn>
          <Btn active={fire} onClick={() => setFire(v => !v)}>{tx(t, "figSmoke_fire", "fire")}</Btn>
          <Btn onClick={() => setAlbedo(0.3)}>{tx(t, "figSmoke_soot", "soot")}</Btn>
          <Btn onClick={() => setAlbedo(0.99)}>{tx(t, "figSmoke_steam", "steam")}</Btn>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figSmoke_noteMouse", "Drag to orbit, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figSmoke_noteTouch", "Drag to orbit, pinch to zoom. ")}</span>
        {tx(t, "figSmoke_note", "Orbit to look towards the sun: thin smoke lit from behind glows at its edges, and thick smoke turns into a dark silhouette. The plume widens as it rises, about 12 cm for every metre, because the rising gas drags the still air around it in; the same smoke spread over more area thins out.")}
      </>}>
      <div ref={vis.ref}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={setLook} resolution={0.6}
          frame={[look, time, view, density, albedo, wind, sunDeg, fire]} aspect={16 / 9} fovRange={[0.4, 1.2]} />
      </div>
    </Figure>
  );
}

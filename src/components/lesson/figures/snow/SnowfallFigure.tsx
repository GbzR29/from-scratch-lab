"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Readout, Row, f2, useVisible, useFrame } from "@/components/lesson/kit/figure";
import { compileProgramAsync } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, type Look } from "../../kit/gl/GLView";
import { SNOW_FS } from "./snowfallShader";

// ── What this figure shows ────────────────────────────────────────────────────
// Snow falling down a street at night, made entirely of hashed grid cells on a
// stack of sheets (snowfallShader.ts). "Cells" draws each sheet's grid in its
// own colour, so you can see that a near sheet has a few big cells and a far
// one many small ones; "depth" colours the flakes by sheet. Walking the camera
// shows the parallax, which costs nothing: the motion is added in metres
// before dividing by the cell size.

type View = "snow" | "cells" | "depth";
const VIEWS: View[] = ["snow", "cells", "depth"];
const VIEW_EN: Record<View, string> = { snow: "snow", cells: "cells", depth: "depth" };
const LOOK: Look = { yaw: 0, pitch: 0, fov: 1 };

type Preset = "light" | "steady" | "heavy";
const PRESETS: Record<Preset, { layers: number; density: number; fall: number; wind: number; wobble: number; size: number }> = {
  light:  { layers: 6,  density: 0.25, fall: 0.7, wind: 0.2, wobble: 0.9, size: 0.8 },
  steady: { layers: 10, density: 0.5,  fall: 1.0, wind: 0.5, wobble: 0.6, size: 1.0 },
  heavy:  { layers: 14, density: 0.9,  fall: 1.4, wind: 1.2, wobble: 0.4, size: 1.0 },
};
const PRESET_EN: Record<Preset, string> = { light: "light flurries", steady: "steady snow", heavy: "heavy snow" };

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function SnowfallFigure({ t }: { t?: TrackTranslations }) {
  const [view, setView] = useState<View>("snow");
  const [preset, setPreset] = useState<Preset | null>("steady");
  const [layers, setLayers] = useState(10);
  const [density, setDensity] = useState(0.5);
  const [fall, setFall] = useState(1.0);
  const [wind, setWind] = useState(0.5);
  const [wobble, setWobble] = useState(0.6);
  const [size, setSize] = useState(1);
  const [dof, setDof] = useState(true);
  const [focus, setFocus] = useState(1.5);
  const [crystals, setCrystals] = useState(true);
  const [walk, setWalk] = useState(false);
  const [lamp, setLamp] = useState(true);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(playing && vis.on);
  // Speeds are integrated frame by frame, so moving a slider changes the
  // motion from now on instead of jumping the whole field to speed × time
  const drift = useRef({ x: 0, y: 0, cam: 0 });
  useFrame(playing && vis.on, dt => {
    drift.current.x += wind * dt;
    drift.current.y += fall * dt;
    if (walk) drift.current.cam += 1.4 * dt;
  });

  const pick = (k: Preset) => {
    const s = PRESETS[k];
    setPreset(k); setLayers(s.layers); setDensity(s.density); setFall(s.fall); setWind(s.wind); setWobble(s.wobble); setSize(s.size);
  };
  const custom = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPreset(null); };

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, SNOW_FS),
    vao: gl.createVertexArray()!,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, sz: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, sz.w, sz.h);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform1f(u("uAspect"), sz.aspect);
    gl.uniform1f(u("uPx"), 2 / sz.h);
    gl.uniform1f(u("uTime"), time);
    gl.uniform1i(u("uLayers"), layers);
    gl.uniform1f(u("uDensity"), density);
    gl.uniform2f(u("uDrift"), drift.current.x, drift.current.y);
    gl.uniform1f(u("uWobble"), wobble);
    gl.uniform1f(u("uSize"), size);
    gl.uniform1f(u("uFocus"), focus);
    gl.uniform1f(u("uAperture"), dof ? 1 : 0);
    gl.uniform1f(u("uCamX"), drift.current.cam);
    gl.uniform1i(u("uLamp"), lamp ? 1 : 0);
    gl.uniform1i(u("uCrystals"), crystals ? 1 : 0);
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const viewNote: Record<View, string> = {
    snow: tx(t, "figSnowfall_vSnow", "Every flake is one cell of a grid that falls as a whole. Nothing is stored and nothing is simulated: each pixel finds its cell on each sheet, hashes the cell's number, and gets back whether there is a flake, where it sits, how big it is and how it sways. Turn on walk to see the near flakes rush past while the far ones barely move. A flake that is several pixels wide and in focus is drawn as a small crystal with the fold6 from the start of the chapter, spinning and tumbling; the rest stay round dots, since at two pixels no one could see the shape. That choice by size on screen is called level of detail."),
    cells: tx(t, "figSnowfall_vCells", "Each sheet's grid in its own colour, from warm (near) to cool (far). A cell is 35 cm wide on every sheet; it is the distance that makes the far grids fine and the near ones coarse. Each flake stays inside its own square: the budget offset + sway + radius + blur ≤ half a cell is what makes that true."),
    depth: tx(t, "figSnowfall_vDepth", "The flakes coloured by the sheet they belong to. The near ones are big, fast and blurred, the far ones small, slow and faded into the fog. All of that comes from one number per sheet, its depth z, and the same code for every sheet."),
  };

  return (
    <Figure title={tx(t, "figSnowfall_title", "Snow from hashed cells")}
      head={<>
        {VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figSnowfall_view_${v}`, VIEW_EN[v])}</Btn>)}
      </>}
      controls={<>
        <Row>
          {(Object.keys(PRESETS) as Preset[]).map(k => <Btn key={k} active={preset === k} onClick={() => pick(k)}>{tx(t, `figSnowfall_p_${k}`, PRESET_EN[k])}</Btn>)}
        </Row>
        <Sliders>
          <Slider label={tx(t, "figSnowfall_layers", "sheets")} value={layers} min={1} max={16} step={1} onChange={custom(setLayers)} fmt={v => String(v)} />
          <Slider label={tx(t, "figSnowfall_density", "cells with a flake")} value={density} min={0.05} max={1} step={0.01} onChange={custom(setDensity)} fmt={v => `${Math.round(v * 100)}%`} />
          <Slider label={tx(t, "figSnowfall_fall", "fall speed")} value={fall} min={0.2} max={2.5} step={0.05} onChange={custom(setFall)} fmt={v => `${f2(v, 2)} m/s`} />
          <Slider label={tx(t, "figSnowfall_wind", "wind")} value={wind} min={-2} max={2} step={0.05} onChange={custom(setWind)} fmt={v => `${f2(v, 2)} m/s`} />
          <Slider label={tx(t, "figSnowfall_wobble", "sway")} value={wobble} min={0} max={1} step={0.01} onChange={custom(setWobble)} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figSnowfall_size", "flake size")} value={size} min={0.3} max={1} step={0.01} onChange={custom(setSize)} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figSnowfall_focus", "focus distance")} value={focus} min={1.2} max={24} step={0.1} onChange={setFocus} fmt={v => `${f2(v, 1)} m`} />
        </Sliders>
        <Row>
          <Btn active={playing} onClick={() => setPlaying(p => !p)}>{playing ? tx(t, "figSnowfall_pause", "pause") : tx(t, "figSnowfall_play", "play")}</Btn>
          <Btn active={walk} onClick={() => setWalk(w => !w)}>{tx(t, "figSnowfall_walk", "walk")}</Btn>
          <Btn active={dof} onClick={() => setDof(d => !d)}>{tx(t, "figSnowfall_dof", "depth of field")}</Btn>
          <Btn active={lamp} onClick={() => setLamp(l => !l)}>{tx(t, "figSnowfall_lamp", "street lamps")}</Btn>
          <Btn active={crystals} onClick={() => setCrystals(c => !c)}>{tx(t, "figSnowfall_crystals", "crystals")}</Btn>
          <Readout>{`${layers} × ${tx(t, "figSnowfall_lookups", "hash lookups per pixel")}`}</Readout>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={tx(t, "figSnowfall_note", "The flakes in the lamp's cone light up because each one asks the lamp how far away it is, using its real depth z: the light falls off as 1/distance², so only the flakes near the lamp shine, not those in front of it or behind it. Move the focus distance onto the lamp (about 7 m) and the near flakes turn into soft discs, as in a photograph with the lens wide open; their light is spread over a bigger disc, so they get dimmer as they get bigger.")}>
      <div ref={vis.ref}>
        <GLView<Res> init={init} draw={draw} look={LOOK}
          frame={[view, time, layers, density, fall, wind, wobble, size, dof, focus, lamp, crystals]} aspect={16 / 9} />
      </div>
    </Figure>
  );
}

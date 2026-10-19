"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Readout, Row, f2, useVisible, useFrame } from "@/components/lesson/kit/figure";
import { Lab, LabButton, fill, useLab, type Insight, type LabStep } from "@/components/lesson/kit/lab/Lab";
import { compileProgramAsync } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, type Look } from "../../kit/gl/GLView";
import { BLIZZARD_FS } from "./blizzardShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A road in falling snow, with a marker pole every 10 m. The sliders are the
// physics of a storm: wind, gusts, turbulence, the camera's exposure, and the
// number and size of the flakes, from which σ = n·Q·πr² and the visibility
// V = 3.912/σ follow (Q ≈ 2 for grains much bigger than a wavelength). The lab
// walks from light snow to a whiteout.

const FALL = 1.0;                         // m/s, snowflakes' terminal speed
const LOOK: Look = { yaw: 0, pitch: 0, fov: 1 };
const LAYERS = 12;

export type Storm = { wind: number; gust: number; turb: number; shutter: number; logN: number; rmm: number; overcast: number };
const CALM: Storm = { wind: 0.5, gust: 0, turb: 0, shutter: 8, logN: 2.3, rmm: 1.5, overcast: 0.2 };

/** Extinction coefficient (1/m) and visibility (m) of air holding 10^logN grains per m³ of radius rmm. */
export function stormOptics(logN: number, rmm: number) {
  const n = 10 ** logN, r = rmm * 1e-3;
  const sigma = n * 2 * Math.PI * r * r;           // Q ≈ 2: each grain blocks twice its shadow (diffraction)
  return { n, sigma, vis: 3.912 / sigma };
}

/** A smooth, repeatable wobble in −1…1 for the gusts. */
const gustAt = (t: number) => (Math.sin(t * 0.9) * 0.5 + Math.sin(t * 2.3 + 1.7) * 0.3 + Math.sin(t * 5.1 + 0.4) * 0.2);

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function BlizzardFigure({ t }: { t?: TrackTranslations }) {
  const [s, setS] = useState<Storm>({ wind: 6, gust: 0.4, turb: 0.4, shutter: 16, logN: 3.2, rmm: 1.5, overcast: 0.4 });
  const set = <K extends keyof Storm>(k: K) => (v: Storm[K]) => setS(o => ({ ...o, [k]: v }));
  const [playing, setPlaying] = useState(true);
  const lab = useLab("glsl-blizzard");
  const vis = useVisible<HTMLDivElement>();
  const on = playing && (vis.on || lab.open);
  const time = useAnimationTime(on);
  const drift = useRef(0);
  const gustNow = useRef(0);
  useFrame(on, dt => {
    gustNow.current = gustAt(time) * s.gust;
    const u = s.wind * (1 + 0.6 * gustNow.current);
    drift.current += Math.hypot(u, FALL) * dt;
  });

  const { sigma, vis: V } = stormOptics(s.logN, s.rmm);
  const speed = Math.hypot(s.wind, FALL);
  const streak = speed * s.shutter / 1000;
  const angle = Math.atan2(s.wind, FALL);
  const density = Math.min(1, Math.max(0.08, 0.12 + 0.88 * (s.logN - 2) / 4));
  const poles = Math.floor(V / 10);
  const blizzard = V < 400 && s.wind >= 15.6;

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, BLIZZARD_FS),
    vao: gl.createVertexArray()!,
  });
  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uPx"), 2 / size.h);
    gl.uniform1f(u("uTime"), time);
    gl.uniform1i(u("uLayers"), LAYERS);
    gl.uniform1f(u("uDensity"), density);
    gl.uniform2f(u("uDrift"), 0, drift.current);
    gl.uniform1f(u("uAngle"), angle);
    gl.uniform1f(u("uStreak"), streak);
    gl.uniform1f(u("uCellLong"), Math.max(0.35, streak + 0.1));
    gl.uniform1f(u("uTurb"), s.turb);
    gl.uniform1f(u("uSigma"), sigma);
    gl.uniform1f(u("uOvercast"), s.overcast);
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const stage = (
    <GLView<Res> init={init} draw={draw} look={LOOK} frame={[time, s]} aspect={16 / 9} />
  );

  const sliders = (
    <Sliders>
      <Slider label={tx(t, "figBlz_wind", "wind")} value={s.wind} min={0} max={30} step={0.5} onChange={set("wind")} fmt={v => `${f2(v, 1)} m/s`} />
      <Slider label={tx(t, "figBlz_gust", "gusts")} value={s.gust} min={0} max={1} step={0.01} onChange={set("gust")} fmt={v => f2(v, 2)} />
      <Slider label={tx(t, "figBlz_turb", "turbulence")} value={s.turb} min={0} max={1} step={0.01} onChange={set("turb")} fmt={v => f2(v, 2)} />
      <Slider label={tx(t, "figBlz_shutter", "exposure Δt")} value={s.shutter} min={0} max={60} step={1} onChange={set("shutter")} fmt={v => `${v} ms`} />
      <Slider label={tx(t, "figBlz_n", "grains per m³")} value={s.logN} min={2} max={6} step={0.05} onChange={set("logN")} fmt={v => (10 ** v >= 1e4 ? `${f2(10 ** v / 1000, 0)}k` : f2(10 ** v, 0))} />
      <Slider label={tx(t, "figBlz_r", "grain radius")} value={s.rmm} min={0.1} max={3} step={0.05} onChange={set("rmm")} fmt={v => `${f2(v, 2)} mm`} />
      <Slider label={tx(t, "figBlz_overcast", "overcast")} value={s.overcast} min={0} max={1} step={0.01} onChange={set("overcast")} fmt={v => f2(v, 2)} />
    </Sliders>
  );
  const readouts = (
    <Row>
      <Btn active={playing} onClick={() => setPlaying(v => !v)}>{playing ? tx(t, "figBlz_pause", "pause") : tx(t, "figBlz_play", "play")}</Btn>
      <Readout>{`σ = ${sigma < 0.01 ? sigma.toExponential(1) : f2(sigma, 3)} /m`}</Readout>
      <Readout>{`${tx(t, "figBlz_vis", "visibility")} ≈ ${V >= 10000 ? "> 10 km" : `${f2(V, 0)} m`}`}</Readout>
      <Readout>{`${tx(t, "figBlz_poles", "poles")} ≈ ${Math.min(poles, 30)}${poles > 30 ? "+" : ""}`}</Readout>
      <Readout color={blizzard ? "#e05252" : undefined}>{blizzard ? tx(t, "figBlz_isBlizzard", "officially a blizzard") : tx(t, "figBlz_notBlizzard", "not a blizzard yet")}</Readout>
    </Row>
  );

  // ── The lab: from light snow to a whiteout ──
  const steps: LabStep[] = [
    {
      title: tx(t, "figBlzL1_t", "Light snow"),
      body: <p>{tx(t, "figBlzL1_b", "A calm afternoon: a few hundred flakes in every cubic metre, falling at about 1 m/s, and almost no wind. Each flake is a round dot, because in one frame it hardly moves. The poles run 10 m apart along the road; you can count them far into the distance. Now let the wind pick up.")}</p>,
      goal: { text: tx(t, "figBlzL1_g", "Raise the wind above 8 m/s."), done: s.wind > 8 },
      setup: () => setS(CALM),
    },
    {
      title: tx(t, "figBlzL2_t", "Streaks"),
      body: <>
        <p>{tx(t, "figBlzL2_b1", "The flakes now fly sideways: their direction on screen is atan(wind / fall speed) from straight down. A camera (or your eye) collects light for a short time Δt, and in that time each flake moves |v|·Δt, so it leaves a streak, not a dot.")}</p>
        <p>{tx(t, "figBlzL2_b2", "A streak is a segment, so the shader takes the distance to a segment instead of to a point. The grid of cells is turned to line up with the motion and stretched along it, so that every streak still fits in its own cell.")}</p>
      </>,
      goal: { text: tx(t, "figBlzL2_g", "Set the exposure to 40 ms or more."), done: s.shutter >= 40 && s.wind > 8 },
      hint: tx(t, "figBlzL2_h", "Exposure Δt is the fourth slider. At 15 m/s and 40 ms, a flake moves 60 cm during one frame."),
    },
    {
      title: tx(t, "figBlzL3_t", "Gusts and swirls"),
      body: <>
        <p>{tx(t, "figBlzL3_b1", "Real wind is never steady. Gusts change its speed from second to second, and turbulence bends the paths into swirls. The swirls come from curl noise: take a smooth noise ψ and use v = (∂ψ/∂y, −∂ψ/∂x) as a velocity. Its divergence is zero, so the flow has no sources or sinks, and swirling snow never piles up in one spot or empties out of another.")}</p>
        <p>{tx(t, "figBlzL3_b2", "The shader does not move each flake: it bends the space the cells live in by that velocity field, so every flake nearby follows the same swirl.")}</p>
      </>,
      goal: { text: tx(t, "figBlzL3_g", "Turn gusts and turbulence both above 0.6."), done: s.gust > 0.6 && s.turb > 0.6 },
    },
    {
      title: tx(t, "figBlzL4_t", "Snow is the fog"),
      body: <>
        <p>{tx(t, "figBlzL4_b1", "Every grain blocks a little of the light coming through the air. With n grains per cubic metre, each of radius r, a metre of air removes the fraction σ = n·Q·πr², where Q ≈ 2 because a grain much bigger than a wavelength blocks its own shadow and diffracts as much again. What survives distance d is e^(−σd), the fog formula from the Fog chapter.")}</p>
        <p>{tx(t, "figBlzL4_b2", "Meteorologists call the visibility the distance at which a dark object fades to 2% contrast: e^(−σV) = 0.02, so V = ln 50 / σ ≈ 3.912 / σ. The poles show it directly: count how many you can see, times 10 m.")}</p>
      </>,
      goal: { text: tx(t, "figBlzL4_g", "Bring the visibility below 200 m."), done: V < 200 },
      hint: tx(t, "figBlzL4_h", "Raise the grains per m³. Blowing snow is many tiny grains (about 0.1 mm), falling snow fewer, bigger flakes."),
    },
    {
      title: tx(t, "figBlzL5_t", "Quick check"),
      body: <p>{tx(t, "figBlzL5_b", "Use σ = n·Q·πr² and V = 3.912/σ.")}</p>,
      quiz: {
        q: tx(t, "figBlzL5_q", "The same mass of snow is ground into grains half the radius. Each grain has 1/8 of the volume, so there are 8 times as many. What happens to the visibility?"),
        options: [
          tx(t, "figBlzL5_o1", "it halves"),
          tx(t, "figBlzL5_o2", "it stays the same"),
          tx(t, "figBlzL5_o3", "it drops to 1/8"),
          tx(t, "figBlzL5_o4", "it doubles"),
        ],
        answer: 0,
        why: tx(t, "figBlzL5_w", "σ goes as n·r²: 8 × (1/2)² = 2, so σ doubles and V = 3.912/σ halves. That is why wind that breaks snow into fine blowing grains can blind you even when hardly any new snow is falling: the same snow, in smaller pieces, blocks more light."),
      },
    },
    {
      title: tx(t, "figBlzL6_t", "Whiteout"),
      body: <>
        <p>{tx(t, "figBlzL6_b1", "Under a thick, even overcast, the light comes from the whole sky at once. The snow on the ground reflects nearly all of it, so the ground is as bright as the sky, and the snowy air between them is the same white. Nothing casts a shadow, the horizon disappears, and with nothing to judge distance by, people lose all sense of up and slope.")}</p>
        <p>{tx(t, "figBlzL6_b2", "In the shader it is one number: the overcast mixes the sky, the ground, the flakes and the fog towards the same grey.")}</p>
      </>,
      goal: { text: tx(t, "figBlzL6_g", "Overcast at 0.9 or more, with visibility under 60 m."), done: s.overcast >= 0.9 && V < 60 },
    },
  ];

  const insights: Insight[] = [
    {
      id: "blizzard", tone: "warn", when: blizzard,
      title: tx(t, "figBlzI1_t", "A blizzard, by the book"),
      body: tx(t, "figBlzI1_b", "The US National Weather Service calls it a blizzard when the wind is at least 35 mph (15.6 m/s) and snow brings visibility under a quarter of a mile (about 400 m), for three hours or more. It is the wind and the visibility, not the temperature or how much snow falls."),
    },
    {
      id: "streak", tone: "info", when: streak > 0.3,
      title: tx(t, "figBlzI2_t", "Longer than a cell"),
      body: fill(tx(t, "figBlzI2_b", "Each streak is now {s} cm long, more than a square 35 cm cell could hold, so the cells are stretched to {c} cm along the motion. Fewer cells means fewer flakes per square metre of sheet; a game would add a sheet or two to make up for it."), { s: f2(streak * 100, 0), c: f2(Math.max(35, streak * 100 + 10), 0) }),
    },
    {
      id: "whiteout", tone: "ok", when: s.overcast >= 0.9 && V < 60,
      title: tx(t, "figBlzI3_t", "No horizon"),
      body: tx(t, "figBlzI3_b", "Look for the line where the ground meets the sky: it is gone. Only the nearest poles are left to tell you which way is down."),
    },
  ];

  return (
    <>
      <Figure fullscreen={false}
        title={tx(t, "figBlz_title", "A blizzard on the road")}
        head={<LabButton lab={lab} t={t} />}
        controls={<>{sliders}{readouts}</>}
        note={tx(t, "figBlz_note", "A pole stands every 10 m beside the road, so the number you can make out, times 10, is the visibility. It comes from the grains alone: σ = n·Q·πr² with Q ≈ 2, and V = 3.912/σ. Long exposures stretch flakes into streaks, as on a photograph taken at night with a slow shutter; your eye, which collects light for about 1/20 s, sees blowing snow as streaks too.")}>
        <div ref={vis.ref}>{stage}</div>
      </Figure>
      <Lab lab={lab} t={t}
        title={tx(t, "figBlz_title", "A blizzard on the road")}
        steps={steps} insights={insights} stage={stage}
        controls={<>{sliders}{readouts}</>}
        recap={[
          tx(t, "figBlzR1", "A flake moves |v|·Δt during one exposure, so it is drawn as a segment; the cells are turned along the motion and stretched so each streak fits."),
          tx(t, "figBlzR2", "Curl noise, v = (∂ψ/∂y, −∂ψ/∂x), has no divergence: swirls that never bunch the snow up. The shader bends the space the cells live in."),
          tx(t, "figBlzR3", "Snowy air is fog: σ = n·Q·πr² with Q ≈ 2, light surviving e^(−σd), visibility V = 3.912/σ."),
          tx(t, "figBlzR4", "The same snow in smaller grains blocks more light: σ grows as n·r², which for fixed mass goes as 1/r."),
          tx(t, "figBlzR5", "A whiteout is ground, sky and air at the same brightness: no shadows, no horizon."),
        ]} />
    </>
  );
}

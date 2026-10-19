"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Readout, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, type Look } from "../../kit/gl/GLView";
import { blackbodyLUT, blackbodyHex } from "./blackbody";
import { FLAME_FS } from "./flameShader";

// ── What this figure shows ────────────────────────────────────────────────────
// Three flames from one function (flameShader.ts): a temperature field coloured
// with Planck's law, plus a blue zone. "Temperature" shows the field itself,
// with a line every 250 K. Exposure is on a log scale because the visible
// brightness of a blackbody changes by about 700× between 1300 K and 2000 K.

type Mode = "candle" | "campfire" | "gas";
const MODES: Mode[] = ["candle", "campfire", "gas"];
const MODE_EN: Record<Mode, string> = { candle: "candle", campfire: "campfire", gas: "gas burner" };
const START: Record<Mode, { T: number; turb: number; soot: number; logE: number }> = {
  candle: { T: 1850, turb: 0.25, soot: 1, logE: 1.3 },
  campfire: { T: 1450, turb: 0.7, soot: 1, logE: 2.9 },
  gas: { T: 2100, turb: 0.15, soot: 0.04, logE: 0.6 },
};
const FIRE_D = 0.8;                       // campfire diameter, m
const LOOK: Look = { yaw: 0, pitch: 0, fov: 1 };

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function FlameFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("candle");
  const [T, setT] = useState(START.candle.T);
  const [turb, setTurb] = useState(START.candle.turb);
  const [soot, setSoot] = useState(START.candle.soot);
  const [logE, setLogE] = useState(START.candle.logE);   // exposure, as a power of ten
  const [wind, setWind] = useState(0);
  const [view, setView] = useState<"flame" | "temp">("flame");
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(playing && vis.on);
  const lut = useMemo(() => blackbodyLUT(), []);
  const puff = 1.5 / Math.sqrt(FIRE_D);

  const pick = (m: Mode) => { const s = START[m]; setMode(m); setT(s.T); setTurb(s.turb); setSoot(s.soot); setLogE(s.logE); };

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, FLAME_FS),
    vao: gl.createVertexArray()!,
  });
  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    const E = 10 ** logE;
    gl.useProgram(p);
    gl.uniform4fv(u("uBB"), lut);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uPx"), 2 / size.h);
    gl.uniform1f(u("uTime"), time);
    gl.uniform1i(u("uMode"), MODES.indexOf(mode));
    gl.uniform1f(u("uTmax"), T);
    gl.uniform1f(u("uTurb"), turb);
    gl.uniform1f(u("uWind"), wind);
    gl.uniform1f(u("uSoot"), soot);
    gl.uniform1f(u("uExposure"), E);
    gl.uniform1f(u("uBlueScale"), 1.6 / E);
    gl.uniform1f(u("uPuff"), puff);
    gl.uniform1i(u("uView"), view === "temp" ? 1 : 0);
    drawFullscreen(gl, r.vao);
  };

  const note: Record<Mode, string> = {
    candle: tx(t, "figFlame_mCandle", "Wax melts, climbs the wick and evaporates; the vapour burns where it meets air, at the flame's edge. Inside, just above the wick, is a darker core of vapour that has not met any air yet. Soot forms inside the flame and glows at about 1850 K as it rises, which is the yellow; at the tip it burns away. The thin blue rim at the bottom is where air reaches the fuel before soot can form."),
    campfire: tx(t, "figFlame_mCampfire", "Wood gas burns cooler and much more turbulently: around 1300–1500 K, so the light is deep orange and some 30 times dimmer per square centimetre than a candle's, which is why the exposure is so high. A fire this wide also breathes: big flames puff at about f ≈ 1.5/√D Hz, here 1.7 Hz for a 0.8 m fire. The cracks in the logs glow at 1100–1300 K, dull red."),
    gas: tx(t, "figFlame_mGas", "Gas and air are mixed before they burn (a premixed flame), so there is oxygen everywhere and soot never gets a chance to form. Almost no blackbody light: the blue comes from CH and C₂ molecules that are left excited by the reactions and give off light at their own fixed wavelengths, 431 nm and 516 nm. Close the air hole of a burner (raise the soot) and the flame turns lazy and yellow."),
  };

  return (
    <Figure title={tx(t, "figFlame_title", "A flame from a temperature field")}
      head={<>
        {MODES.map(m => <Btn key={m} active={mode === m} onClick={() => pick(m)}>{tx(t, `figFlame_m_${m}`, MODE_EN[m])}</Btn>)}
        <Btn active={view === "temp"} onClick={() => setView(v => (v === "temp" ? "flame" : "temp"))}>{tx(t, "figFlame_temp", "temperature")}</Btn>
      </>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figFlame_T", "hottest soot")} value={T} min={1000} max={3200} step={10} onChange={setT} fmt={v => `${v} K`} />
          <Slider label={tx(t, "figFlame_soot", "soot")} value={soot} min={0} max={1} step={0.01} onChange={setSoot} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figFlame_turb", "turbulence")} value={turb} min={0} max={1.2} step={0.01} onChange={setTurb} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figFlame_wind", "draught")} value={wind} min={-1} max={1} step={0.01} onChange={setWind} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figFlame_exp", "exposure")} value={logE} min={-1} max={3.5} step={0.01} onChange={setLogE} fmt={v => `×${10 ** v >= 100 ? f2(10 ** v, 0) : f2(10 ** v, 1)}`} />
        </Sliders>
        <Row>
          <Btn active={playing} onClick={() => setPlaying(v => !v)}>{playing ? tx(t, "figFlame_pause", "pause") : tx(t, "figFlame_play", "play")}</Btn>
          <span className="inline-block w-10 h-6 rounded-md border border-[var(--border)]" style={{ background: blackbodyHex(T) }} />
          <Readout>{`${T} K → λ_max ≈ ${f2(2897.8 / T, 2)} µm`}</Readout>
          {mode === "campfire" && <Readout>{`${tx(t, "figFlame_puff", "puffing")} ≈ ${f2(puff, 2)} Hz`}</Readout>}
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{note[mode]}</p>
      </>}
      note={tx(t, "figFlame_note", "Raise the hottest soot towards 3000 K and the flame goes from orange to yellow-white and gets far brighter: turn the exposure down to keep it on screen. The same function draws all three; only the shape, the noise's speed and the amount of soot change. In \"temperature\" the colours are a map, not light: a line every 250 K.")}>
      <div ref={vis.ref}>
        <GLView<Res> init={init} draw={draw} look={LOOK} frame={[time, mode, T, turb, soot, logE, wind, view]} aspect={4 / 3} phoneAspect={1} />
      </div>
    </Figure>
  );
}

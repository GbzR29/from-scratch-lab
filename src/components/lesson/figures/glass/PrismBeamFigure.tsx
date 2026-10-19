"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Readout, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync, forwardFrom } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, lookBasis, type Look } from "../../kit/gl/GLView";
import { PRISM_FS, MAX_SEG } from "./prismShader";
import { SCENE, MEDIA, type Medium, cauchy, spectrum, triangle, computeBeams, minDeviationRot } from "./prismOptics";

// ── What this figure shows ────────────────────────────────────────────────────
// The album-cover experiment in 3D: a thin white beam crosses hazy air, enters
// a glass prism and leaves as a fan of colours that paints a spectrum on the
// wall. Every wavelength is traced on its own (Cauchy index, refract(), exact
// Fresnel, total internal reflection); the shader draws the haze and the spots.
// Drag to walk around the scene; the slider turns the prism.

const MEDIA_EN: Record<Medium, string> = { crown: "crown glass", flint: "flint glass", water: "water", diamond: "diamond" };
const MEDIA_KEYS = Object.keys(MEDIA) as Medium[];
const TARGET = [1.9, -1.0, 0] as const;
const DIST = 7.2;
/** Highest upward pitch: the camera sits at y = −1 − 7.2 sin(pitch) and must stay above the floor (y = −2.6). */
const MAX_PITCH = 0.15;

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function PrismBeamFigure({ t }: { t?: TrackTranslations }) {
  const [look, setLook] = useState<Look>({ yaw: 0.35, pitch: -0.42, fov: 0.85 });
  const [medium, setMedium] = useState<Medium>("flint");
  const [rot, setRot] = useState(() => minDeviationRot("flint") ?? 0);
  const [boost, setBoost] = useState(2);
  const [waves, setWaves] = useState<3 | 16>(16);
  const [haze, setHaze] = useState(0.35);
  const [radius, setRadius] = useState(0.035);
  const [sweep, setSweep] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(sweep && vis.on);
  const turn = sweep ? rot + 22 * Math.sin(time * 0.6) : rot;

  const spec = useMemo(() => spectrum(waves), [waves]);
  const beams = useMemo(() => computeBeams(turn, medium, boost, spec.lambda), [turn, medium, boost, spec]);
  const minRot = useMemo(() => minDeviationRot(medium), [medium]);

  const pickMedium = (m: Medium) => { setMedium(m); const r = minDeviationRot(m); if (r !== null) setRot(r); };

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, PRISM_FS),
    vao: gl.createVertexArray()!,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const f = forwardFrom(look.yaw, look.pitch), b = lookBasis(look);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform3f(u("uCamPos"), TARGET[0] - f[0] * DIST, TARGET[1] - f[1] * DIST, TARGET[2] - f[2] * DIST);
    gl.uniform3fv(u("uCamF"), b.f);
    gl.uniform3fv(u("uCamR"), b.r);
    gl.uniform3fv(u("uCamU"), b.u);
    gl.uniform1f(u("uTanHalf"), Math.tan(look.fov / 2));
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform2fv(u("uTri"), triangle(turn).flat());
    const n = Math.min(beams.segs.length, MAX_SEG);
    const seg = new Float32Array(MAX_SEG * 4), info = new Float32Array(MAX_SEG);
    beams.segs.slice(0, n).forEach((s, i) => {
      seg.set([s.a[0], s.a[1], s.b[0], s.b[1]], i * 4);
      info[i] = (s.col + 1) * 2 + (s.ends ? 1 : 0) + Math.min(s.w, 0.999);   // unpacked in the shader
    });
    gl.uniform4fv(u("uSeg"), seg);
    gl.uniform4fv(u("uInfo"), info);
    gl.uniform1i(u("uNSeg"), n);
    gl.uniform1i(u("uZero"), 0);
    const cols = new Float32Array(16 * 3);
    spec.rgb.forEach((c, i) => cols.set(c, i * 3));
    gl.uniform3fv(u("uCol"), cols);
    gl.uniform1f(u("uHaze"), haze);
    gl.uniform1f(u("uRadius"), radius);
    gl.uniform1f(u("uSlit"), SCENE.slit);
    gl.uniform1f(u("uIor"), cauchy(medium, 550, 0));
    gl.uniform4f(u("uScene"), SCENE.wallX, SCENE.floorY, SCENE.wallTop, SCENE.wallZ);
    gl.uniform1f(u("uDepth"), SCENE.depth);
    drawFullscreen(gl, r.vao);
  };

  // readouts: the two ends of the spectrum
  const last = spec.lambda.length - 1;
  const lo = spec.lambda[last], hi = spec.lambda[0];                 // red end, violet end
  const devText = (d: number | null) => (d === null ? tx(t, "figPrism_trapped", "— (total reflection)") : `${f2(Math.abs(d), 1)}°`);
  const dRed = beams.dev[last], dViolet = beams.dev[0];
  const spread = dRed !== null && dViolet !== null ? Math.abs(dViolet - dRed) : null;

  return (
    <Figure title={tx(t, "figPrism_title", "A prism in a dark room")}
      head={<>
        <Btn active={waves === 16} onClick={() => setWaves(16)}>{tx(t, "figPrism_w16", "16 wavelengths")}</Btn>
        <Btn active={waves === 3} onClick={() => setWaves(3)}>{tx(t, "figPrism_w3", "3, like a shader")}</Btn>
      </>}
      controls={<>
        <Row>
          <Choice value={medium} options={MEDIA_KEYS.map(m => [m, tx(t, `figPrism_m_${m}`, MEDIA_EN[m])] as const)} onChange={pickMedium} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figPrism_turn", "turn the prism")} value={rot} min={-35} max={35} step={0.25} onChange={v => { setSweep(false); setRot(v); }} fmt={v => `${f2(v, 1)}°`} />
          <Slider label={tx(t, "figPrism_boost", "exaggerate spread ×")} value={boost} min={1} max={8} step={0.5} onChange={setBoost} fmt={v => f2(v, 1)} />
          <Slider label={tx(t, "figPrism_width", "beam width")} value={radius} min={0.015} max={0.15} step={0.005} onChange={setRadius} fmt={v => f2(v * 2, 2)} />
          <Slider label={tx(t, "figPrism_haze", "haze")} value={haze} min={0} max={1.5} step={0.05} onChange={setHaze} fmt={v => f2(v, 2)} />
        </Sliders>
        <Row>
          <Btn active={minRot !== null && Math.abs(rot - minRot) < 0.01 && !sweep} onClick={() => { setSweep(false); if (minRot !== null) setRot(minRot); }}>
            {tx(t, "figPrism_minDev", "minimum deviation")}
          </Btn>
          <Btn active={sweep} onClick={() => setSweep(s => !s)}>{tx(t, "figPrism_sweep", "rock the prism")}</Btn>
        </Row>
        <Row>
          <Readout>{`n(${Math.round(lo)} nm) = ${f2(cauchy(medium, lo, boost), 4)}`}</Readout>
          <Readout>{`n(${Math.round(hi)} nm) = ${f2(cauchy(medium, hi, boost), 4)}`}</Readout>
          <Readout color="#ff7a6b">{`${tx(t, "figPrism_devRed", "red turned by")} ${devText(dRed)}`}</Readout>
          <Readout color="#b49cff">{`${waves === 3 ? tx(t, "figPrism_devBlue", "blue turned by") : tx(t, "figPrism_devViolet", "violet turned by")} ${devText(dViolet)}`}</Readout>
          {spread !== null && <Readout>{`${tx(t, "figPrism_spread", "fan")} ${f2(spread, 2)}°`}</Readout>}
        </Row>
      </>}
      note={<>
        <span data-mouse-only>{tx(t, "figPrism_noteMouse", "Drag to walk around the room, scroll to zoom. ")}</span>
        <span data-touch-only>{tx(t, "figPrism_noteTouch", "Drag to walk around the room, pinch to zoom. ")}</span>
        {tx(t, "figPrism_note", "Each wavelength is traced on its own with its own n from Cauchy, so violet, with the largest n, is always turned the most. Inside the glass the paths are so close that the beam still looks white; only after the second face does the fan open. Rock the prism: the spectrum goes down and comes back up, and the turning point is the minimum deviation. Flint glass, the default, spreads the colours about three times more than crown glass. Diamond's 24° critical angle traps the light inside a 60° prism: it bounces off the second face and leaves through the base. With 3 wavelengths you see what a three-channel shader really computes: three separate beams, with gaps between them where a real spectrum has yellow and cyan.")}
      </>}>
      <div ref={vis.ref}>
        <GLView<Res> orbit init={init} draw={draw} look={look} onLook={l => setLook({ ...l, pitch: Math.min(l.pitch, MAX_PITCH) })} resolution={0.8}
          frame={[look, beams, spec, haze, radius, medium, turn]} aspect={16 / 9} fovRange={[0.35, 1.3]} />
      </div>
    </Figure>
  );
}

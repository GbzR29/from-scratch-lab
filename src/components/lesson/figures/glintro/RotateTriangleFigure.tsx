"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Row, Readout, C, T, useFrame, useVisible } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The triangle of "Drawing the Triangle" in a 1280 × 720 window, turned by
// glm::rotate. Three switches: the axis (z turns it flat on the screen, y and x
// flip it like a card), the pivot (the origin or its top corner) and whether an
// orthographic projection undoes the window's stretch. Without it, 1 unit of x
// is 640 px but 1 unit of y only 360 px, so the triangle changes shape as it
// turns; the readout gives one corner's distance from the pivot in real pixels.

type V = [number, number, number];
type Axis = "z" | "y" | "x";
type Pivot = "origin" | "top";

const TRI: V[] = [[-0.6, -0.55, 0], [0.65, -0.45, 0], [0, 0.65, 0]];
const COLS = ["#ff4545", "#21c45e", "#3b82f5"];           // the vertex colours of the program
const TOP: V = [0, 0.65, 0];
const ASPECT = 1280 / 720;
const SPEED = 90;                                         // degrees per second while playing

/** glm::rotate around one of the three axes, counter-clockwise seen from its tip. */
function rot(p: V, axis: Axis, a: number): V {
  const c = Math.cos(a), s = Math.sin(a);
  if (axis === "z") return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  if (axis === "y") return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

const around = (p: V, c: V, axis: Axis, a: number): V => {
  const q = rot([p[0] - c[0], p[1] - c[1], p[2] - c[2]], axis, a);
  return [q[0] + c[0], q[1] + c[1], q[2] + c[2]];
};

const wrap = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

// The window, scaled down: 320 × 180 drawing units for 1280 × 720 pixels.
const W = 320, H = 180, X0 = 10, Y0 = 10, CX = X0 + W / 2, CY = Y0 + H / 2;

export function RotateTriangleFigure({ t }: { t?: TrackTranslations }) {
  const [deg, setDeg] = useState(30);
  const [axis, setAxis] = useState<Axis>("z");
  const [pivot, setPivot] = useState<Pivot>("origin");
  const [fixed, setFixed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && vis.on, dt => setDeg(d => wrap(d + SPEED * dt)));

  const a = (deg * Math.PI) / 180;
  const c: V = pivot === "top" ? TOP : [0, 0, 0];
  const pts = TRI.map(p => around(p, c, axis, a));
  // NDC → drawing units. Fixed: x is divided by the aspect, as glm::ortho(-aspect, aspect, …) does.
  const kx = fixed ? W / 2 / ASPECT : W / 2, ky = H / 2;
  const scr = (p: V) => ({ x: CX + p[0] * kx, y: CY - p[1] * ky });
  const poly = (ps: V[]) => ps.map(p => { const s = scr(p); return `${s.x},${s.y}`; }).join(" ");

  // One corner's distance from the pivot, in pixels of the real 1280 × 720 window.
  const probe = pivot === "top" ? 0 : 2;
  const pp = pts[probe];
  const px = Math.round(Math.hypot((pp[0] - c[0]) * (fixed ? 360 : 640), (pp[1] - c[1]) * 360));
  const probeName = probe === 0 ? tx(t, "figRotTri_red", "red corner") : tx(t, "figRotTri_top", "top corner");

  const axisVec = axis === "z" ? "0, 0, 1" : axis === "y" ? "0, 1, 0" : "1, 0, 0";
  const angleArg = `glm::radians(${deg.toFixed(0)}.0f)`;
  const code = pivot === "origin"
    ? [`glm::mat4 model = glm::rotate(glm::mat4(1.0f), ${angleArg}, glm::vec3(${axisVec}));`]
    : [
      "glm::mat4 model(1.0f);",
      "model = glm::translate(model, glm::vec3(0.0f,  0.65f, 0.0f));  // 3rd: pivot back",
      `model = glm::rotate(model, ${angleArg}, glm::vec3(${axisVec}));  // 2nd: turn`,
      "model = glm::translate(model, glm::vec3(0.0f, -0.65f, 0.0f));  // 1st: pivot to origin",
    ];
  const proj = fixed
    ? "glm::mat4 projection = glm::ortho(-aspect, aspect, -1.0f, 1.0f, -1.0f, 1.0f);"
    : "glm::mat4 projection(1.0f);   // none: x = ±1 are the window's side edges";

  const pv = scr(c);
  return (
    <Figure
      title={tx(t, "figRotTri_title", "Turning the triangle")}
      head={<Btn active={playing} onClick={() => setPlaying(p => !p)}>{playing ? tx(t, "figRotTri_pause", "pause") : tx(t, "figRotTri_play", "spin")}</Btn>}
      controls={<>
        <Slider label={tx(t, "figRotTri_angle", "angle")} value={deg} min={-180} max={180} step={1}
          onChange={v => { setPlaying(false); setDeg(v); }} fmt={v => `${v.toFixed(0)}°`} />
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-14">{tx(t, "figRotTri_axis", "axis")}</span>
          <Choice value={axis} onChange={setAxis} options={[["z", "z (0, 0, 1)"], ["y", "y (0, 1, 0)"], ["x", "x (1, 0, 0)"]]} />
        </Row>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-14">{tx(t, "figRotTri_pivot", "pivot")}</span>
          <Choice value={pivot} onChange={setPivot} options={[
            ["origin", tx(t, "figRotTri_pOrigin", "the origin (0, 0)")],
            ["top", tx(t, "figRotTri_pTop", "its top corner")],
          ]} />
        </Row>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-14">{tx(t, "figRotTri_stretch", "window")}</span>
          <Choice value={fixed ? "on" : "off"} onChange={v => setFixed(v === "on")} options={[
            ["off", tx(t, "figRotTri_fixOff", "no projection (stretched)")],
            ["on", tx(t, "figRotTri_fixOn", "with glm::ortho")],
          ]} />
        </Row>
        <Row>
          <Readout color={!fixed && axis === "z" ? C.amber : undefined}>
            {probeName}: {px} px {tx(t, "figRotTri_fromPivot", "from the pivot")}
          </Readout>
        </Row>
        <pre className="text-[10px] font-mono rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)] px-3 py-2 overflow-x-auto leading-relaxed text-[var(--text-main)]">
          {[proj, ...code].join("\n")}
        </pre>
      </>}
      note={!fixed
        ? tx(t, "figRotTri_noteOff", "Spin it with no projection and watch the readout: the top corner is 234 px from the centre when it points up, but 416 px when it points sideways, because one unit of x is 640 pixels and one unit of y only 360. The triangle is turning, but it is also being stretched, by a different amount at every angle. Switch on glm::ortho and the distance stays the same all the way round.")
        : tx(t, "figRotTri_noteOn", "With glm::ortho, one unit is 360 px both ways, so the shape stays the same at every angle. Now try the pivot: around the origin the triangle almost spins in place, because its centre, (0.017, −0.117), is close to (0, 0). Around its top corner it swings like a flag. Then pick axis y or x: the triangle turns like a card, becomes a thin line at 90° and comes back mirrored.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W + 20} ${H + 20}`} className="w-full max-w-[560px] mx-auto block h-auto" role="img"
          aria-label={tx(t, "figRotTri_aria", "A triangle turning inside a 16:9 window")}>
          <rect x={X0} y={Y0} width={W} height={H} rx={4} fill="#10121a" stroke="var(--border)" />
          <line x1={X0} y1={CY} x2={X0 + W} y2={CY} stroke="#ffffff" strokeOpacity={0.12} />
          <line x1={CX} y1={Y0} x2={CX} y2={Y0 + H} stroke="#ffffff" strokeOpacity={0.12} />
          <T x={X0 + W - 4} y={CY - 4} size={7.5} anchor="end" color="#9ca3af">{fixed ? `x = ${ASPECT.toFixed(2)}` : "x = 1"}</T>
          <T x={CX + 4} y={Y0 + 10} size={7.5} color="#9ca3af">y = 1</T>
          <polygon points={poly(TRI)} fill="none" stroke="#9ca3af" strokeOpacity={0.5} strokeDasharray="3 3" />
          <polygon points={poly(pts)} fill="#3b82f5" fillOpacity={0.28} stroke="#e5e7eb" strokeWidth={1.2} strokeLinejoin="round" />
          {pts.map((p, i) => { const s = scr(p); return <circle key={i} cx={s.x} cy={s.y} r={4} fill={COLS[i]} stroke="#10121a" strokeWidth={1} />; })}
          <line x1={pv.x - 5} y1={pv.y} x2={pv.x + 5} y2={pv.y} stroke={C.amber} strokeWidth={1.5} />
          <line x1={pv.x} y1={pv.y - 5} x2={pv.x} y2={pv.y + 5} stroke={C.amber} strokeWidth={1.5} />
          <T x={X0 + 6} y={Y0 + H - 6} size={7.5} color="#9ca3af">{tx(t, "figRotTri_win", "1280 × 720 window · dashed: before the turn · cross: the pivot")}</T>
        </svg>
      </div>
    </Figure>
  );
}

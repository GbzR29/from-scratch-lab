"use client";

import { useRef, useState, type PointerEvent } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, T, clamp, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { add, scale, dot, sub, type Vec3 } from "@/components/lesson/kit/vec3";

// ── What this figure shows ────────────────────────────────────────────────────
// The colour cube of "Drawing a Cube" (colour = aPos + 0.5), seen exactly as
// the program sees it: camera at z = 3, glm::perspective with a 45° FOV in a
// 16:9 window. Six ways to turn it: one axis at a time (z only spins the front
// face, so the cube still looks flat), two rotations in both orders (a
// turntable seen from above, or a wobble), and dragging (yaw and pitch, the
// mouse step of the chapter). Each face is drawn as an 8 × 8 grid of small
// quads coloured by their own position, which imitates the GPU's blend.

type Mode = "x" | "y" | "z" | "tiltSpin" | "spinTilt" | "drag";

const rx = (p: Vec3, a: number): Vec3 => { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
const ry = (p: Vec3, a: number): Vec3 => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
const rz = (p: Vec3, a: number): Vec3 => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };

// Each face: its outward normal and two edge directions along it.
const FACES: { key: string; en: string; n: Vec3; u: Vec3; v: Vec3 }[] = [
  { key: "front",  en: "front",  n: [0, 0, 1],  u: [1, 0, 0], v: [0, 1, 0] },
  { key: "back",   en: "back",   n: [0, 0, -1], u: [0, 1, 0], v: [1, 0, 0] },
  { key: "right",  en: "right",  n: [1, 0, 0],  u: [0, 1, 0], v: [0, 0, 1] },
  { key: "left",   en: "left",   n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { key: "top",    en: "top",    n: [0, 1, 0],  u: [0, 0, 1], v: [1, 0, 0] },
  { key: "bottom", en: "bottom", n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
];
const N = 8;
const TILT = (30 * Math.PI) / 180;
const SPEED = 50;                                         // degrees per second, as in Drawing a Cube
const EYE: Vec3 = [0, 0, 3];
const F = 1 / Math.tan((22.5 * Math.PI) / 180);           // glm::perspective, 45° FOV
const W = 320, H = 180, X0 = 10, Y0 = 10;

const rgb = (p: Vec3) => `rgb(${p.map(k => Math.round(clamp(k + 0.5, 0, 1) * 255)).join(",")})`;

export function RotateCubeFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("y");
  const [deg, setDeg] = useState(25);
  const [playing, setPlaying] = useState(true);
  const [yaw, setYaw] = useState(0.5);
  const [pitch, setPitch] = useState(0.35);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && mode !== "drag" && vis.on, dt => setDeg(d => (d + SPEED * dt) % 360));

  const a = (deg * Math.PI) / 180;
  // The model matrix, applied to a point: the rotation written LAST in GLM acts first.
  const model = (p: Vec3): Vec3 => {
    switch (mode) {
      case "x": return rx(p, a);
      case "y": return ry(p, a);
      case "z": return rz(p, a);
      case "tiltSpin": return rx(ry(p, a), TILT);
      case "spinTilt": return ry(rx(p, TILT), a);
      case "drag": return rx(ry(p, yaw), pitch);
    }
  };
  const scr = (p: Vec3) => {
    const d = 3 - p[2];                                   // distance in front of the camera, −z in view space
    return { x: X0 + W / 2 + ((F / (W / H)) * p[0] / d) * (W / 2), y: Y0 + H / 2 - ((F * p[1]) / d) * (H / 2) };
  };

  const seen: string[] = [];
  const quads: { pts: string; fill: string; k: string }[] = [];
  const labels: { x: number; y: number; text: string; k: string; dark: boolean }[] = [];
  for (const f of FACES) {
    const centre = model(scale(f.n, 0.5)), normal = model(f.n);
    const facing = dot(normal, sub(EYE, centre));
    if (facing <= 0) continue;
    seen.push(f.key);
    const at = (i: number, j: number) => model(add(scale(f.n, 0.5), add(scale(f.u, i / N - 0.5), scale(f.v, j / N - 0.5))));
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const mid = add(scale(f.n, 0.5), add(scale(f.u, (i + 0.5) / N - 0.5), scale(f.v, (j + 0.5) / N - 0.5)));
      const pts = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)].map(scr).map(s => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(" ");
      quads.push({ pts, fill: rgb(mid), k: `${f.key}${i}${j}` });
    }
    if (dot(normal, [0, 0, 1]) > 0.45) {
      const s = scr(centre), col = scale(add(f.n, [1, 1, 1]), 0.5);   // the face centre's colour
      const dark = 0.3 * col[0] + 0.59 * col[1] + 0.11 * col[2] > 0.5;
      labels.push({ x: s.x, y: s.y + 3, text: tx(t, `figRotCube_f_${f.key}`, f.en), k: f.key, dark });
    }
  }

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (mode !== "drag") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const k = (0.5 * Math.PI) / 180;                      // 0.5° per pixel, as in the chapter's code
    setYaw(y => y + (e.clientX - d.x) * k);
    setPitch(p => clamp(p + (e.clientY - d.y) * k, -Math.PI / 2, Math.PI / 2));
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { drag.current = null; };

  const ang = `glm::radians(${deg.toFixed(0)}.0f)`;
  const code: Record<Mode, string[]> = {
    x: [`model = glm::rotate(model, ${ang}, glm::vec3(1.0f, 0.0f, 0.0f));`],
    y: [`model = glm::rotate(model, ${ang}, glm::vec3(0.0f, 1.0f, 0.0f));`],
    z: [`model = glm::rotate(model, ${ang}, glm::vec3(0.0f, 0.0f, 1.0f));`],
    tiltSpin: [
      "model = glm::rotate(model, glm::radians(30.0f), glm::vec3(1.0f, 0.0f, 0.0f)); // 2nd: tilt",
      `model = glm::rotate(model, ${ang}, glm::vec3(0.0f, 1.0f, 0.0f)); // 1st: spin`,
    ],
    spinTilt: [
      `model = glm::rotate(model, ${ang}, glm::vec3(0.0f, 1.0f, 0.0f)); // 2nd: spin`,
      "model = glm::rotate(model, glm::radians(30.0f), glm::vec3(1.0f, 0.0f, 0.0f)); // 1st: tilt",
    ],
    drag: [
      `model = glm::rotate(model, pitch, glm::vec3(1.0f, 0.0f, 0.0f)); // pitch = ${((pitch * 180) / Math.PI).toFixed(0)}°`,
      `model = glm::rotate(model, yaw,   glm::vec3(0.0f, 1.0f, 0.0f)); // yaw   = ${((yaw * 180) / Math.PI).toFixed(0)}°`,
    ],
  };
  const notes: Record<Mode, [string, string]> = {
    x: ["figRotCube_nX", "Around x the cube rolls toward you like a wheel: the top face comes down to the front, then the back, then the bottom. The left and right faces never face you."],
    y: ["figRotCube_nY", "Around y the cube turns like a turntable: the front face slides off to the right and the left face comes round. The top and bottom never face you."],
    z: ["figRotCube_nZ", "Around z, the axis that points at you, only the front face turns, like the triangle did. The cube still looks like a flat square: turning around the axis you look along never shows depth."],
    tiltSpin: ["figRotCube_nTS", "The spin acts first, around the cube's own up axis; the 30° tilt comes after it, so it stays the same: a turntable seen from a little above. The top face is visible the whole time."],
    spinTilt: ["figRotCube_nST", "Same two calls, swapped. Now the tilt acts first and the spin carries it round: half a turn later the tilt leans away from you, and you see the bottom instead of the top. The cube wobbles."],
    drag: ["figRotCube_nD", "Drag across the cube. Right turns it right (yaw, around its up axis); down tips its top toward you (pitch, around x). Pitch is applied last, so dragging sideways always turns the cube around its own up axis, as in a 3D editor. Pitch stops at ±90°."],
  };

  return (
    <Figure
      title={tx(t, "figRotCube_title", "Turning the cube")}
      head={mode !== "drag"
        ? <Btn active={playing} onClick={() => setPlaying(p => !p)}>{playing ? tx(t, "figRotCube_pause", "pause") : tx(t, "figRotCube_play", "spin")}</Btn>
        : <Btn onClick={() => { setYaw(0.5); setPitch(0.35); }}>{tx(t, "figRotCube_reset", "reset")}</Btn>}
      controls={<>
        <Row>
          <Choice value={mode} onChange={setMode} options={[
            ["x", tx(t, "figRotCube_mX", "around x")],
            ["y", tx(t, "figRotCube_mY", "around y")],
            ["z", tx(t, "figRotCube_mZ", "around z")],
            ["tiltSpin", tx(t, "figRotCube_mTS", "tilt, then spin")],
            ["spinTilt", tx(t, "figRotCube_mST", "spin, then tilt")],
            ["drag", tx(t, "figRotCube_mD", "drag it")],
          ]} />
        </Row>
        <Row>
          <Readout>{tx(t, "figRotCube_seen", "faces toward you")}: {seen.map(k => tx(t, `figRotCube_f_${k}`, FACES.find(f => f.key === k)!.en)).join(", ")}</Readout>
        </Row>
        <pre className="text-[10px] font-mono rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)] px-3 py-2 overflow-x-auto leading-relaxed text-[var(--text-main)]">
          {["glm::mat4 model(1.0f);", ...code[mode]].join("\n")}
        </pre>
      </>}
      note={tx(t, notes[mode][0], notes[mode][1])}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W + 20} ${H + 20}`} className="w-full max-w-[560px] mx-auto block h-auto" role="img"
          aria-label={tx(t, "figRotCube_aria", "A colour cube turning in a 16:9 window")}
          style={{ touchAction: mode === "drag" ? "none" : undefined, cursor: mode === "drag" ? "grab" : undefined }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <rect x={X0} y={Y0} width={W} height={H} rx={4} fill="#10121a" stroke="var(--border)" />
          {quads.map(q => <polygon key={q.k} points={q.pts} fill={q.fill} stroke={q.fill} strokeWidth={0.6} strokeLinejoin="round" />)}
          {labels.map(l => <T key={l.k} x={l.x} y={l.y} size={8} anchor="middle" color={l.dark ? "#10121a" : "#f4f4f5"} bold>{l.text}</T>)}
          {mode === "drag" && <T x={X0 + 6} y={Y0 + H - 6} size={7.5} color="#9ca3af">{tx(t, "figRotCube_dragHint", "drag to turn")}</T>}
        </svg>
      </div>
    </Figure>
  );
}

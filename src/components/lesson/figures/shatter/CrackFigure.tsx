"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Slider, Sliders, Row, f2, useVisible } from "@/components/lesson/kit/figure";
import { compileProgramAsync } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, useAnimationTime, type Look } from "../../kit/gl/GLView";
import { CRACK_FS } from "./crackShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A window seen from inside, struck where the reader clicks (crackShader.ts).
// Ordinary (annealed) glass breaks into a spiderweb: radial cracks first, then
// some rings. Tempered glass dices into small cubes all over. The crack front
// is slowed down enormously: real cracks run at about 1500 m/s.

type Kind = "annealed" | "tempered";
type View = "glass" | "shards" | "grid";
const KINDS: Kind[] = ["annealed", "tempered"];
const VIEWS: View[] = ["glass", "shards", "grid"];
const KIND_EN: Record<Kind, string> = { annealed: "window glass", tempered: "tempered glass" };
const VIEW_EN: Record<View, string> = { glass: "glass", shards: "shards", grid: "warped grid" };
const LOOK: Look = { yaw: 0, pitch: 0, fov: 1 };

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function CrackFigure({ t }: { t?: TrackTranslations }) {
  const [kind, setKind] = useState<Kind>("annealed");
  const [view, setView] = useState<View>("glass");
  const [radial, setRadial] = useState(15);
  const [rings, setRings] = useState(1.25);
  const [keep, setKeep] = useState(0.55);
  const [speed, setSpeed] = useState(0.5);
  const [lens, setLens] = useState(0.05);
  const [struck, setStruck] = useState(true);
  const [impact, setImpact] = useState<[number, number]>([0.95, 0.56]);
  const vis = useVisible<HTMLDivElement>();
  const time = useAnimationTime(vis.on);
  const strikeAt = useRef(0);
  const since = Math.max(0, time - strikeAt.current);

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, CRACK_FS), vao: gl.createVertexArray()!,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uTime"), since);
    gl.uniform1f(u("uSpeed"), speed);
    gl.uniform1f(u("uN"), radial);
    gl.uniform1f(u("uRingScale"), rings);
    gl.uniform1f(u("uRingKeep"), keep);
    gl.uniform1f(u("uLens"), lens);
    gl.uniform1f(u("uPx"), 1 / size.h);
    gl.uniform2f(u("uImpact"), impact[0], impact[1]);
    gl.uniform1i(u("uKind"), KINDS.indexOf(kind));
    gl.uniform1i(u("uView"), VIEWS.indexOf(view));
    gl.uniform1i(u("uStruck"), struck ? 1 : 0);
    drawFullscreen(gl, r.vao);
  };

  /** A click (or tap) on the pane is the stone: crack it again from there. */
  const strike = (e: React.PointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.height, y = 1 - (e.clientY - b.top) / b.height;
    setImpact([x, y]);
    setStruck(true);
    strikeAt.current = time;
  };

  const viewNote: Record<View, string> = {
    glass: tx(t, "figCrack_vGlass", "Click or tap anywhere on the window to throw a stone there. Each piece is tilted a little, so it shows the garden shifted and catches the light at its own angle; the broken edges shine pale green, because there you look along the glass instead of through it."),
    shards: tx(t, "figCrack_vShards", "One colour per Voronoi cell; black lines are the borders that have broken. Where two colours meet without a line, the cells are still one piece of glass. In window glass the radial cracks run first and split the pane into long wedges; the rings come later and cut only some of them. Tempered glass breaks along every border, into thousands of small, blunt cubes."),
    grid: tx(t, "figCrack_vGrid", "The space the Voronoi is computed in. For window glass the blue grid is square in q = (S·ln r, N·θ/2π); on the pane its cells are wedges that widen with distance. Yellow dots are the seeds, white lines every cell border, broken or not."),
  };

  return (
    <Figure title={tx(t, "figCrack_title", "A pane that cracks")}
      head={<>{VIEWS.map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figCrack_view_${v}`, VIEW_EN[v])}</Btn>)}</>}
      controls={<>
        <Row>
          <Choice value={kind} options={KINDS.map(k => [k, tx(t, `figCrack_kind_${k}`, KIND_EN[k])] as const)} onChange={k => { setKind(k); strikeAt.current = time; }} />
        </Row>
        <Sliders>
          {kind === "annealed" && <>
            <Slider label={tx(t, "figCrack_radial", "radial cracks N")} value={radial} min={5} max={30} step={1} onChange={setRadial} fmt={v => f2(v, 0)} />
            <Slider label={tx(t, "figCrack_rings", "rings per e-fold S")} value={rings} min={0.5} max={2.5} step={0.05} onChange={setRings} fmt={v => f2(v, 2)} />
            <Slider label={tx(t, "figCrack_keep", "rings that break")} value={keep} min={0} max={1} step={0.01} onChange={setKeep} fmt={v => `${f2(v * 100, 0)}%`} />
          </>}
          <Slider label={tx(t, "figCrack_speed", "crack speed (slowed)")} value={speed} min={0.05} max={2} step={0.01} onChange={setSpeed} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figCrack_lens", "shard tilt")} value={lens} min={0} max={0.15} step={0.002} onChange={setLens} fmt={v => f2(v, 3)} />
        </Sliders>
        <Row>
          <Btn onClick={() => { setStruck(true); strikeAt.current = time; }}>{tx(t, "figCrack_again", "break it again")}</Btn>
          <Btn active={!struck} onClick={() => setStruck(false)}>{tx(t, "figCrack_new", "new pane")}</Btn>
        </Row>
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={tx(t, "figCrack_note", "Nothing is simulated: every crack is the border between two Voronoi cells, and whether it has broken yet is a comparison with the crack front v·t. The front here is slowed down about a million times; in real glass it runs at roughly 1500 m/s and the whole picture is over in under a millisecond.")}>
      <div ref={vis.ref} onPointerDown={strike} className="cursor-crosshair">
        <GLView<Res> init={init} draw={draw} look={LOOK}
          frame={[since, kind, view, radial, rings, keep, speed, lens, struck, impact]} aspect={16 / 9} />
      </div>
    </Figure>
  );
}

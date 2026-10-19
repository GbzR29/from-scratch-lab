"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Slider, Sliders, Readout, Row, f2, useVisible, useFrame, mulberry32 } from "@/components/lesson/kit/figure";
import { compileProgramAsync } from "../../kit/gl/gl";
import { FULL_VS, drawFullscreen } from "../../kit/gl/glx";
import { GLView, type Look } from "../../kit/gl/GLView";
import { FLAKE_FS, FLAKE_HIST } from "./flakeShader";

// ── What this figure shows ────────────────────────────────────────────────────
// A snow crystal growing from a tiny hexagonal plate. While it grows, the
// supersaturation slider is written into a growth record, one value per
// radius: high there and the corners sprout side branches, low and the arm
// fills out into a flat plate. The shader draws one twelfth of the crystal
// and folds it six times and mirrors it (flakeShader.ts), so whatever you do
// to the record happens to every arm at once. The scripts replay a few
// classic life stories; "the wedge" shows the twelfth that is really drawn.

type View = "crystal" | "wedge";
type Script = "dendrite" | "plate" | "stellarPlate" | "plateThenBranch" | "random";
const SCRIPTS: Script[] = ["dendrite", "stellarPlate", "plate", "plateThenBranch", "random"];
const SCRIPT_EN: Record<Script, string> = {
  dendrite: "stellar dendrite", plate: "sectored plate", stellarPlate: "branches, then plates",
  plateThenBranch: "plate, then branches", random: "random sky",
};
const MAX_R = 0.95;
const GROW_SECONDS = 9;
const LOOK: Look = { yaw: 0, pitch: 0, fov: 1 };

/** Supersaturation the script feeds the tip at x = radius / MAX_R (0–1). */
function scriptValue(s: Script, x: number, seed: number) {
  switch (s) {
    case "dendrite": return 0.9;
    case "plate": return 0.15;
    case "stellarPlate": return x < 0.62 ? 0.88 : 0.15;
    case "plateThenBranch": return x < 0.32 ? 0.15 : 0.9;
    case "random": {
      // A few smooth swings, as the crystal falls through layers of cloud
      const rnd = mulberry32(seed * 7919 + 13);
      const knots = Array.from({ length: 6 }, () => rnd());
      const f = x * 5, i = Math.min(4, Math.floor(f)), u = f - i, sm = u * u * (3 - 2 * u);
      return knots[i] + (knots[i + 1] - knots[i]) * sm;
    }
  }
}

type Res = { prog: WebGLProgram; vao: WebGLVertexArrayObject };

export function SnowflakeFigure({ t }: { t?: TrackTranslations }) {
  const [view, setView] = useState<View>("crystal");
  const [radius, setRadius] = useState(MAX_R);
  const [playing, setPlaying] = useState(false);
  const [humid, setHumid] = useState(0.9);
  const [spacing, setSpacing] = useState(0.09);
  const [imperfect, setImperfect] = useState(0);
  const [seed, setSeed] = useState(3);
  const [script, setScript] = useState<Script | null>("stellarPlate");
  const hist = useRef(Float32Array.from({ length: FLAKE_HIST }, (_, i) => scriptValue("stellarPlate", (i + 0.5) / FLAKE_HIST, 3)));
  const [version, setVersion] = useState(0);
  const vis = useVisible<HTMLDivElement>();

  const start = (s: Script | null) => {
    setScript(s);
    hist.current.fill(s ? scriptValue(s, 0, s === "random" ? seed + 1 : seed) : humid);
    setRadius(0);
    setPlaying(true);
  };

  // Grow the tip and write what it meets into the record
  useFrame(playing && vis.on, dt => {
    const r0 = radius, r1 = Math.min(MAX_R, r0 + (MAX_R / GROW_SECONDS) * dt);
    const value = script ? scriptValue(script, r1 / MAX_R, seed) : humid;
    if (script) setHumid(value);
    const b0 = Math.floor((r0 / MAX_R) * FLAKE_HIST), b1 = Math.min(FLAKE_HIST - 1, Math.floor((r1 / MAX_R) * FLAKE_HIST));
    for (let b = b0; b <= b1; b++) hist.current[b] = value;
    setRadius(r1);
    setVersion(v => v + 1);
    if (r1 >= MAX_R) setPlaying(false);
  });

  const init = async (gl: WebGL2RenderingContext): Promise<Res> => ({
    prog: await compileProgramAsync(gl, FULL_VS, FLAKE_FS),
    vao: gl.createVertexArray()!,
  });

  const draw = (gl: WebGL2RenderingContext, r: Res, size: { w: number; h: number; aspect: number }) => {
    gl.viewport(0, 0, size.w, size.h);
    const p = r.prog, u = (n: string) => gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform1f(u("uAspect"), size.aspect);
    gl.uniform1f(u("uPx"), 2.2 / size.h);
    gl.uniform1f(u("uR"), radius);
    gl.uniform1f(u("uMaxR"), MAX_R);
    gl.uniform1fv(u("uHist"), hist.current);
    gl.uniform1f(u("uSpacing"), spacing);
    gl.uniform1f(u("uSeed"), seed);
    gl.uniform1f(u("uImperfect"), imperfect);
    gl.uniform1i(u("uView"), view === "wedge" ? 1 : 0);
    gl.uniform1i(u("uZero"), 0);
    drawFullscreen(gl, r.vao);
  };

  const viewNote: Record<View, string> = {
    crystal: tx(t, "figFlake_vCrystal", "Press grow and move the supersaturation slider while the crystal grows. High: the six corners stick out into the moist air, catch vapour faster than the flat faces, and sprout branches. Low: the faces keep up, and the arm fills out into a flat plate. The record under the picture is the crystal's life story, read from the centre out."),
    wedge: tx(t, "figFlake_vWedge", "The bright piece is the only part the shader really computes: a 30° wedge between an arm (amber line) and the mirror line halfway to the next arm (dashed). Every other pixel is folded into that wedge first, by turning it through a multiple of 60° and mirroring it, so it reads the same distance field. Twelve pieces, one function."),
  };
  const mm = (radius / MAX_R) * 1.6;

  return (
    <Figure title={tx(t, "figFlake_title", "Grow a snow crystal")}
      head={<>
        {(["crystal", "wedge"] as View[]).map(v => <Btn key={v} active={view === v} onClick={() => setView(v)}>{tx(t, `figFlake_view_${v}`, v === "crystal" ? "crystal" : "the wedge")}</Btn>)}
      </>}
      controls={<>
        <Row>
          <Btn active={playing} onClick={() => (playing ? setPlaying(false) : radius >= MAX_R ? start(script) : setPlaying(true))}>
            {playing ? tx(t, "figFlake_pause", "pause") : radius >= MAX_R ? tx(t, "figFlake_grow", "grow") : tx(t, "figFlake_resume", "resume")}
          </Btn>
          {SCRIPTS.map(s => <Btn key={s} active={script === s} onClick={() => { if (s === "random") setSeed(n => n + 1); start(s); }}>{tx(t, `figFlake_s_${s}`, SCRIPT_EN[s])}</Btn>)}
          <Readout>{`⌀ ≈ ${f2(mm * 2, 1)} mm`}</Readout>
        </Row>
        <Sliders>
          <Slider label={tx(t, "figFlake_humid", "supersaturation")} value={humid} min={0} max={1} step={0.01}
            onChange={v => { setHumid(v); setScript(null); }} fmt={v => (v < 0.5 ? tx(t, "figFlake_facets", "facets") : tx(t, "figFlake_branches", "branches"))} />
          <Slider label={tx(t, "figFlake_spacing", "branch spacing")} value={spacing} min={0.04} max={0.16} step={0.005} onChange={setSpacing} fmt={v => f2(v, 3)} />
          <Slider label={tx(t, "figFlake_imperfect", "imperfection")} value={imperfect} min={0} max={1} step={0.01} onChange={setImperfect} fmt={v => f2(v, 2)} />
          <Slider label={tx(t, "figFlake_seed", "seed")} value={seed} min={1} max={40} step={1} onChange={setSeed} fmt={v => String(v)} />
        </Sliders>
        <HistoryStrip t={t} hist={hist.current} radius={radius} />
        <p className="text-[12px] text-[var(--text-main)] leading-relaxed">{viewNote[view]}</p>
      </>}
      note={tx(t, "figFlake_note", "The six arms are identical because they are the same twelfth of the plane, folded. Real arms come out nearly identical for a related reason: they grow at the same moment in the same air, so they record the same history. Raise imperfection to mix the arm's number into its random numbers, and the arms start to differ, as most real snowflakes do. Branches leave at 60°, parallel to the neighbouring arms, because they grow along the same directions of the ice lattice.")}>
      <div ref={vis.ref}>
        <GLView<Res> init={init} draw={draw} look={LOOK}
          frame={[view, radius, spacing, seed, imperfect, version]} aspect={4 / 3} phoneAspect={1} />
      </div>
    </Figure>
  );
}

// ── The growth record ─────────────────────────────────────────────────────────

function HistoryStrip({ t, hist, radius }: { t?: TrackTranslations; hist: Float32Array; radius: number }) {
  const grown = (radius / MAX_R) * FLAKE_HIST;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mb-1">
        <span>{tx(t, "figFlake_centre", "centre")}</span>
        <span>{tx(t, "figFlake_record", "growth record: what the tip met at each radius")}</span>
        <span>{tx(t, "figFlake_tip", "tip")}</span>
      </div>
      <div className="flex h-3 rounded overflow-hidden border border-[var(--border)]">
        {Array.from(hist, (h, i) => (
          <div key={i} className="flex-1" style={{
            background: i < grown ? (h >= 0.5 ? "#e8a33c" : "#3f9fc4") : "transparent",
            opacity: i < grown ? 0.35 + 0.65 * Math.abs(h - 0.5) * 2 : 1,
          }} />
        ))}
      </div>
      <div className="flex gap-3 text-[10px] font-mono text-[var(--text-muted)] mt-1">
        <span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: "#e8a33c" }} />{tx(t, "figFlake_kBranch", "branching")}</span>
        <span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: "#3f9fc4" }} />{tx(t, "figFlake_kPlate", "plate")}</span>
      </div>
    </div>
  );
}

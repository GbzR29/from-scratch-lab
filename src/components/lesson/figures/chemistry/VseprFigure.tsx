"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, C, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { useOrbit, add, scale, type V3 } from "@/components/lesson/kit/scene3d";
import { MoleculeView, alignRotation, type MolAtom, type MolBond, type MolLobe } from "./Molecule3D";
import { AXE, relax, bondAngles, shapeName } from "./vsepr";
import { ATOM_COLOR, formula } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// VSEPR, live. Pick a molecule: its central atom has X bonded atoms and E lone
// pairs, the electron domains. Press play and the domains start from random
// directions and push each other apart (vsepr.ts) until they settle: two make
// a line, three a triangle, four a tetrahedron, five a trigonal bipyramid, six
// an octahedron. Lone pairs (purple lobes) push harder than bonds, so they
// squeeze the bond angles (CH₄ 109.5°, NH₃ 107°, H₂O 104.5°) and, in the
// five-domain shapes, take the roomy equatorial seats. The shape's name
// describes only where the atoms are. Break it: let the lone pairs push like
// bonds (every angle back to 109.5°), or forget them altogether (water turns
// straight like CO₂). Drag to turn the molecule.

type Preset = { f: string; center: string; outer: string; x: number; e: number; measured: string };
const PRESETS: Preset[] = [
  { f: "CO2", center: "C", outer: "O", x: 2, e: 0, measured: "180°" },
  { f: "BF3", center: "B", outer: "F", x: 3, e: 0, measured: "120°" },
  { f: "SO2", center: "S", outer: "O", x: 2, e: 1, measured: "119°" },
  { f: "CH4", center: "C", outer: "H", x: 4, e: 0, measured: "109.5°" },
  { f: "NH3", center: "N", outer: "H", x: 3, e: 1, measured: "106.8°" },
  { f: "H2O", center: "O", outer: "H", x: 2, e: 2, measured: "104.5°" },
  { f: "PCl5", center: "P", outer: "Cl", x: 5, e: 0, measured: "90°, 120°" },
  { f: "SF4", center: "S", outer: "F", x: 4, e: 1, measured: "102°, 173°" },
  { f: "ClF3", center: "Cl", outer: "F", x: 3, e: 2, measured: "87.5°" },
  { f: "XeF2", center: "Xe", outer: "F", x: 2, e: 3, measured: "180°" },
  { f: "SF6", center: "S", outer: "F", x: 6, e: 0, measured: "90°" },
  { f: "BrF5", center: "Br", outer: "F", x: 5, e: 1, measured: "85°" },
  { f: "XeF4", center: "Xe", outer: "F", x: 4, e: 2, measured: "90°" },
];
type Mode = "real" | "equal" | "forget";
const W = 560, H = 300;
const RADIUS: Record<string, number> = { H: 0.28, C: 0.4, N: 0.4, O: 0.4, B: 0.4, F: 0.36, S: 0.5, P: 0.5, Cl: 0.48, Br: 0.52, Xe: 0.56 };

export function VseprFigure({ t }: { t?: TrackTranslations }) {
  const [k, setK] = useState(5);
  const [mode, setMode] = useState<Mode>("real");
  const [f, setF] = useState(Infinity);                   // frame shown (Infinity: the settled shape)
  const [playing, setPlaying] = useState(false);
  const orbit = useOrbit({ yaw: 0.5, pitch: 0.3, zoom: 1 });
  const vis = useVisible<HTMLDivElement>();
  const p = PRESETS[k];
  const nl = mode === "forget" ? 0 : p.e;

  const frames = useMemo(() => {
    const raw = relax(p.x, nl, mode === "equal");
    const last = raw[raw.length - 1];
    // Turn the result so it reads well: lone pairs up, or a bond along x (linear) or up
    const to: V3 = p.x === 2 && nl === 0 ? [1, 0, 0] : [0, 1, 0];
    let from: V3 = last[0];
    if (nl > 0) {
      const m = last.slice(p.x).reduce<V3>((a, v) => add(a, v), [0, 0, 0]);
      from = Math.hypot(...m) > 0.2 ? m : last[p.x];
    }
    const rot = alignRotation(from, to);
    return raw.map(fr => fr.map(rot));
  }, [p, nl, mode]);

  useFrame(playing && vis.on, dt => {
    setF(v => {
      const next = (Number.isFinite(v) ? v : 0) + dt * 90;
      if (next >= frames.length - 1) { setPlaying(false); return Infinity; }
      return next;
    });
  });

  const P = frames[Math.min(frames.length - 1, Number.isFinite(f) ? Math.floor(f) : frames.length - 1)];
  const settled = !Number.isFinite(f);
  const L = 1.45;
  const atoms: MolAtom[] = [{ p: [0, 0, 0], color: ATOM_COLOR[p.center] ?? "#64748b", r: RADIUS[p.center] ?? 0.45, label: p.center }];
  const bonds: MolBond[] = [];
  for (let i = 0; i < p.x; i++) {
    atoms.push({ p: scale(P[i], L), color: ATOM_COLOR[p.outer] ?? "#e2e8f0", r: RADIUS[p.outer] ?? 0.35, label: p.outer });
    bonds.push({ a: 0, b: i + 1 });
  }
  const lobes: MolLobe[] = P.slice(p.x).map(d => ({ at: [0, 0, 0], dir: d }));
  const angles = bondAngles(P, p.x);
  const real = AXE[`${p.x},${p.e}`];
  const now = AXE[`${p.x},${nl}`] ?? real;

  const play = () => { if (playing) { setPlaying(false); return; } setF(0); setPlaying(true); };

  return (
    <Figure title={tx(t, "figChVs_title", "VSEPR: electron domains push apart")}
      controls={<>
        <Row>
          {PRESETS.map((q, i) => <Btn key={q.f} active={k === i} onClick={() => { setK(i); setF(Infinity); setPlaying(false); }}>{formula(q.f)}</Btn>)}
        </Row>
        <Row>
          <Choice value={mode} onChange={m => { setMode(m); setF(Infinity); setPlaying(false); }} options={[
            ["real", tx(t, "figChVs_real", "real: lone pairs push harder")],
            ["equal", tx(t, "figChVs_equal", "break it: lone pairs = bonds")],
            ["forget", tx(t, "figChVs_forget", "break it: forget the lone pairs")],
          ]} />
          <Btn onClick={orbit.reset}>{tx(t, "figChVs_view", "reset view")}</Btn>
        </Row>
        <Row>
          <Readout>{`AX${p.x > 1 ? p.x : ""}${nl ? `E${nl > 1 ? nl : ""}` : ""}`.replace(/(\d)/g, d => "₀₁₂₃₄₅₆₇₈₉"[+d])}</Readout>
          <Readout>{`${tx(t, "figChVs_domains", "electron domains")}: ${shapeName(t, now.electron)}`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figChVs_shape", "shape")}: ${shapeName(t, now.shape)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChVs_note", "Pick a molecule and press play: its electron domains (bonds and lone pairs around the central atom) start in random directions and repel each other until they are as far apart as they can get. The arrangement of all the domains is the electron-domain geometry; the shape of the molecule is named after the atoms only, because lone pairs are invisible to X-rays. Watch CH₄, NH₃ and H₂O: the same tetrahedron of four domains, but each lone pair is held by one nucleus only, spreads wider and pushes the bonds closer: 109.5°, 107°, 104.5°. In the five-domain molecules the lone pairs always take the triangle around the middle (the equatorial positions), where they have only two neighbours at 90° instead of three. The model angles come from a simple push-apart rule; the measured ones are on the right.")}>
      <div ref={vis.ref}>
        <MoleculeView orbit={orbit} W={W} H={H} unit={62} atoms={atoms} bonds={bonds} lobes={lobes} cx={W / 2 - 40}>
          <T x={14} y={22} color={C.fg} size={13} bold>{formula(p.f)}</T>
          <T x={14} y={38}>{`${tx(t, "figChVs_bonded", "bonded atoms")}: ${p.x} · ${tx(t, "figChVs_lp", "lone pairs")}: ${nl}`}</T>
          <T x={W - 14} y={22} anchor="end" color={C.fg} bold>{tx(t, "figChVs_angles", "bond angles")}</T>
          <T x={W - 14} y={38} anchor="end" color={C.amber}>{`${tx(t, "figChVs_model", "model")}: ${angles.map(a => `${a.toFixed(1)}°`).join(", ")}`}</T>
          <T x={W - 14} y={52} anchor="end" color={C.green}>{`${tx(t, "figChVs_measured", "measured")}: ${p.measured}`}</T>
          {!settled && <T x={W - 14} y={H - 12} anchor="end" color={C.amber}>{tx(t, "figChVs_moving", "domains pushing apart…")}</T>}
          {mode === "forget" && p.e > 0 && settled && (
            <T x={14} y={H - 12} color={C.red}>{tx(t, "figChVs_forgetMsg", "wrong shape: the real {f} is {s}").replace("{f}", formula(p.f)).replace("{s}", shapeName(t, real.shape))}</T>
          )}
          {mode === "equal" && p.e > 0 && settled && (
            <T x={14} y={H - 12} color={C.red}>{tx(t, "figChVs_equalMsg", "angles too wide: lone pairs really push harder than bonds")}</T>
          )}
          <T x={14} y={H - 28} size={8} >
            <tspan data-mouse-only="">{tx(t, "figChVs_drag", "drag to turn · wheel to zoom")}</tspan>
          </T>
        </MoleculeView>
        <Transport t={t} playing={playing} onPlay={play} onReset={() => { setPlaying(false); setF(Infinity); }}
          playLabel={tx(t, "figChVs_play", "watch them spread")} />
      </div>
    </Figure>
  );
}

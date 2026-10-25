"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, T, f2 } from "@/components/lesson/kit/figure";
import { useOrbit, add, scale, norm, len, type V3 } from "@/components/lesson/kit/scene3d";
import { MoleculeView, type MolArrow, type MolAtom, type MolBond, type MolLobe } from "./Molecule3D";
import { BY_SYMBOL } from "./elements";
import { ATOM_COLOR, formula } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// Is a molecule polar? Each polar bond has a dipole (thin purple arrow, toward
// the more electronegative atom, length ∝ Δχ). The molecule's dipole is their
// vector sum (thick arrow). In CO₂, BF₃, CH₄ and CCl₄ the bond dipoles point
// symmetrically and cancel: polar bonds, nonpolar molecule. In H₂O, NH₃, SO₂
// and CHCl₃ they do not. Break it: straighten water (or flatten ammonia) and
// its dipole vanishes, which is exactly why the real, bent water is so
// polar. The measured dipole moments (debye) are listed for comparison; the
// bond-dipole sum is a model, so only the direction and "zero or not" are
// meant to match.

type Sub = { el: string; dir: V3; length: number; order?: number };
type Mol = { f: string; center: string; subs: (flat: boolean) => Sub[]; lps: (flat: boolean) => V3[]; debye: number; canFlat?: true };

const d2r = (d: number) => (d * Math.PI) / 180;
const TETRA: V3[] = [[0, 1, 0], ...[0, 120, 240].map(a => [0.9428 * Math.cos(d2r(a)), -1 / 3, 0.9428 * Math.sin(d2r(a))] as V3)];
const bent = (deg: number): V3[] => [[-Math.sin(d2r(deg / 2)), -Math.cos(d2r(deg / 2)), 0], [Math.sin(d2r(deg / 2)), -Math.cos(d2r(deg / 2)), 0]];
/** Three bonds pointing down at mutual angle deg (90° from the axis = flat). */
const pyramid = (deg: number): V3[] => {
  const ca = Math.sqrt(Math.max(0, (2 * Math.cos(d2r(deg)) + 1) / 3)), sa = Math.sqrt(1 - ca * ca);
  return [0, 120, 240].map(a => [sa * Math.cos(d2r(a)), -ca, sa * Math.sin(d2r(a))] as V3);
};
const subs = (el: string, dirs: V3[], length: number, order?: number): Sub[] => dirs.map(dir => ({ el, dir, length, order }));

const MOLS: Mol[] = [
  { f: "CO2", center: "C", subs: () => subs("O", [[-1, 0, 0], [1, 0, 0]], 1.16, 2), lps: () => [], debye: 0 },
  { f: "H2O", center: "O", subs: fl => subs("H", fl ? bent(180) : bent(104.5), 0.96), lps: fl => fl ? [[0, 0, 1], [0, 0, -1]] : [[0, 0.57, 0.82], [0, 0.57, -0.82]], debye: 1.85, canFlat: true },
  { f: "NH3", center: "N", subs: fl => subs("H", fl ? pyramid(120) : pyramid(106.8), 1.01), lps: () => [[0, 1, 0]], debye: 1.47, canFlat: true },
  { f: "SO2", center: "S", subs: fl => subs("O", fl ? bent(180) : bent(119), 1.43, 2), lps: () => [[0, 1, 0]], debye: 1.63, canFlat: true },
  { f: "BF3", center: "B", subs: () => subs("F", [0, 120, 240].map(a => [Math.sin(d2r(a)), Math.cos(d2r(a)), 0] as V3), 1.31), lps: () => [], debye: 0 },
  { f: "CH4", center: "C", subs: () => subs("H", TETRA, 1.09), lps: () => [], debye: 0 },
  { f: "CCl4", center: "C", subs: () => subs("Cl", TETRA, 1.77), lps: () => [], debye: 0 },
  { f: "CHCl3", center: "C", subs: () => [...subs("H", [TETRA[0]], 1.09), ...subs("Cl", TETRA.slice(1), 1.77)], lps: () => [], debye: 1.04 },
  { f: "HCN", center: "C", subs: () => [...subs("H", [[-1, 0, 0]], 1.06), ...subs("N", [[1, 0, 0]], 1.16, 3)], lps: () => [], debye: 2.98 },
  { f: "HCl", center: "Cl", subs: () => subs("H", [[-1, 0, 0]], 1.27), lps: () => [], debye: 1.11 },
];
const RADIUS: Record<string, number> = { H: 0.26, C: 0.38, N: 0.38, O: 0.38, B: 0.38, F: 0.34, S: 0.48, Cl: 0.46 };
const W = 560, H = 290, STRETCH = 1.25, DIPOLE = 1.1;

export function PolarityFigure({ t }: { t?: TrackTranslations }) {
  const [k, setK] = useState(1);
  const [flat, setFlat] = useState(false);
  const orbit = useOrbit({ yaw: 0.35, pitch: 0.28, zoom: 1 });
  const m = MOLS[k];
  const fl = flat && !!m.canFlat;
  const list = m.subs(fl);
  const enC = BY_SYMBOL[m.center].en ?? 0;

  const atoms: MolAtom[] = [{ p: [0, 0, 0], color: ATOM_COLOR[m.center], r: RADIUS[m.center], label: m.center }];
  const bonds: MolBond[] = [];
  const arrows: MolArrow[] = [];
  let net: V3 = [0, 0, 0];
  list.forEach((s, i) => {
    const pos = scale(norm(s.dir), s.length * STRETCH);
    atoms.push({ p: pos, color: ATOM_COLOR[s.el], r: RADIUS[s.el], label: s.el });
    bonds.push({ a: 0, b: i + 1, order: s.order });
    const dchi = (BY_SYMBOL[s.el].en ?? 0) - enC;                       // > 0: dipole points out toward the substituent
    const bd = scale(norm(s.dir), dchi);
    net = add(net, bd);
    if (Math.abs(dchi) > 0.05) {
      const mid = scale(pos, 0.5), half = scale(norm(s.dir), Math.sign(dchi) * Math.min(0.42, Math.abs(dchi) * 0.45) * STRETCH);
      arrows.push({ from: add(mid, scale(half, -1)), to: add(mid, half), color: C.purple, width: 1.6 });
    }
  });
  const size = len(net);
  if (size > 0.05) arrows.push({ from: [0, 0, 0], to: scale(norm(net), DIPOLE * (0.55 + 0.6 * Math.min(size, 1.6))), color: C.red, width: 3.4 });
  const lobes: MolLobe[] = m.lps(fl).map(d => ({ at: [0, 0, 0], dir: d }));
  const polar = size > 0.05;

  return (
    <Figure title={tx(t, "figChPo_title", "Polar molecule or not? Add the bond dipoles")}
      controls={<>
        <Row>
          {MOLS.map((q, i) => <Btn key={q.f} active={k === i} onClick={() => { setK(i); setFlat(false); }}>{formula(q.f)}</Btn>)}
        </Row>
        <Row>
          <Btn active={fl} onClick={() => setFlat(v => !v)}>{m.f === "NH3" ? tx(t, "figChPo_flatten", "break it: flatten it") : tx(t, "figChPo_straighten", "break it: straighten it")}</Btn>
          <Btn onClick={orbit.reset}>{tx(t, "figChPo_view", "reset view")}</Btn>
          <Readout color={polar ? C.red : C.green}>{polar ? tx(t, "figChPo_polar", "polar") : tx(t, "figChPo_nonpolar", "nonpolar")}</Readout>
          <Readout>{`${tx(t, "figChPo_sum", "sum of bond dipoles")}: ${f2(size, 2)}`}</Readout>
          <Readout color={C.amber}>{`${tx(t, "figChPo_meas", "measured")}: ${fl ? "—" : `${f2(m.debye, 2)} D`}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figChPo_note", "Each thin purple arrow is a bond dipole, pointing to the more electronegative atom, as long as the electronegativity difference. The thick red arrow is their sum, the dipole of the whole molecule. Look at CO₂: two strongly polar C=O bonds pointing in opposite directions cancel exactly, and carbon dioxide is nonpolar. BF₃, CH₄ and CCl₄ cancel the same way, in a triangle or a tetrahedron. Water's two O–H dipoles point down at an angle and add up; so do ammonia's three. Straighten water and the sum drops to zero. Swap one chlorine of CCl₄ for a hydrogen (CHCl₃) and the symmetry is broken: polar again. Lone pairs add their own share, which is why the measured values are not simply proportional to the arrows.")}>
      <MoleculeView orbit={orbit} W={W} H={H} unit={70} atoms={atoms} bonds={bonds} lobes={lobes} arrows={arrows}>
        <T x={14} y={22} color={C.fg} size={13} bold>{formula(m.f)}</T>
        <T x={14} y={38} color={polar ? C.red : C.green}>
          {fl ? tx(t, "figChPo_flatMsg", "not the real shape: with this symmetry the dipoles cancel")
            : polar ? tx(t, "figChPo_polarMsg", "the bond dipoles do not cancel: a polar molecule")
              : tx(t, "figChPo_cancelMsg", "the bond dipoles cancel: a nonpolar molecule")}
        </T>
        <T x={W - 14} y={22} anchor="end" color={C.purple}>{tx(t, "figChPo_bondKey", "→ bond dipole (toward δ−)")}</T>
        <T x={W - 14} y={36} anchor="end" color={C.red}>{tx(t, "figChPo_netKey", "→ molecular dipole")}</T>
        <T x={14} y={H - 12} size={8}><tspan data-mouse-only="">{tx(t, "figChPo_drag", "drag to turn · wheel to zoom")}</tspan></T>
      </MoleculeView>
    </Figure>
  );
}

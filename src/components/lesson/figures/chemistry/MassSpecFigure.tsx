"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Row, Readout, C, T, f2, useFrame, useVisible, useRerender, mulberry32 } from "@/components/lesson/kit/figure";
import { BY_SYMBOL } from "./elements";
import { elementName } from "./names";
import { isotopesOf } from "./isotopes";

// ── What this figure shows ────────────────────────────────────────────────────
// A mass spectrometer, the instrument that measures isotopes. Atoms of one
// element are ionised, all pushed to the same energy and sent through a
// magnetic field. The field bends every path; heavier ions bend less and land
// farther along the detector. Each landing adds to that mass's bar, so the
// bars grow to the natural abundances and the running weighted average closes
// in on the atomic mass in the periodic table. Break it: average the isotope
// masses WITHOUT their shares, and chlorine comes out 35.97 instead of 35.45.
// (The bending is exaggerated so isotopes one unit apart separate visibly.)

const W = 560, H = 270;
const SAMPLES = ["Cl", "Mg", "B", "Ne", "Cu", "Br"] as const;
type Sample = (typeof SAMPLES)[number];
const COLORS = [C.sky, C.amber, C.pink, C.green];
const SRC = { x: 24, y: 52 }, FIELD_X = 70, DET_Y = 236;
const SPEED = 260;                                         // drawing units per second along the path

type Ion = { iso: number; s: number; r: number };

export function MassSpecFigure({ t }: { t?: TrackTranslations }) {
  const [sample, setSample] = useState<Sample>("Cl");
  const [running, setRunning] = useState(true);
  const [plain, setPlain] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const rng = useRef(mulberry32(7));
  const spawn = useRef(0);
  const sim = useRef<{ ions: Ion[]; counts: number[] }>({ ions: [], counts: [] });
  const rerender = useRerender();

  const el = BY_SYMBOL[sample];
  const isos = isotopesOf(el.z);
  const mLo = isos[0].a, mHi = isos[isos.length - 1].a;
  const D = DET_Y - SRC.y;
  // path radius: grows with √m in a real instrument; spread out here for the drawing
  const radius = (a: number) => (mHi === mLo ? 150 : 110 + ((a - mLo) / (mHi - mLo)) * 110);
  const landX = (r: number) => FIELD_X + Math.sqrt(2 * r * D - D * D);
  const arcLen = (r: number) => r * Math.acos(1 - D / r) + (FIELD_X - SRC.x);

  const clear = () => { sim.current = { ions: [], counts: [] }; rerender(); };
  const choose = (s: Sample) => { setSample(s); clear(); };

  useFrame(running && vis.on, dt => {
    const st = sim.current;
    spawn.current += dt;
    while (spawn.current > 0.07) {
      spawn.current -= 0.07;
      let u = rng.current() * 100, i = 0;
      while (i < isos.length - 1 && u > isos[i].abundance) { u -= isos[i].abundance; i++; }
      st.ions.push({ iso: i, s: 0, r: radius(isos[i].a) });
    }
    const next: Ion[] = [];
    for (const ion of st.ions) {
      ion.s += SPEED * dt;
      if (ion.s >= arcLen(ion.r)) st.counts[ion.iso] = (st.counts[ion.iso] ?? 0) + 1; else next.push(ion);
    }
    st.ions = next;
    rerender();
  });
  const { ions, counts } = sim.current;

  const pos = (ion: Ion) => {
    if (ion.s < FIELD_X - SRC.x) return { x: SRC.x + ion.s, y: SRC.y };
    const a = (ion.s - (FIELD_X - SRC.x)) / ion.r;           // angle turned inside the field
    return { x: FIELD_X + ion.r * Math.sin(a), y: SRC.y + ion.r * (1 - Math.cos(a)) };
  };

  const total = counts.reduce((s, c) => s + c, 0);
  const measured = total ? isos.reduce((s, iso, i) => s + ((counts[i] ?? 0) / total) * iso.mass, 0) : 0;
  const weighted = isos.reduce((s, iso) => s + (iso.abundance / 100) * iso.mass, 0);
  const plainAvg = isos.reduce((s, iso) => s + iso.mass, 0) / isos.length;

  // spectrum panel
  const SL = 360, SR = 546, ST = 40, SB = 200;
  const maxShare = Math.max(...isos.map((_, i) => (total ? (counts[i] ?? 0) / total : 0)), 0.01);
  const sx = (a: number) => (mHi === mLo ? (SL + SR) / 2 : SL + 24 + ((a - mLo) / (mHi - mLo)) * (SR - SL - 48));

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect x={FIELD_X} y={20} width={260} height={DET_Y - 20} fill={C.purple} opacity={0.07} />
      {Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => (
        <text key={`${i}-${j}`} x={FIELD_X + 30 + i * 42} y={44 + j * 50} fontSize={9} fill={C.purple} opacity={0.45} textAnchor="middle">×</text>
      )))}
      <T x={FIELD_X + 4} y={32} color={C.purple}>{tx(t, "figChMs_field", "magnetic field (into the page)")}</T>
      <rect x={SRC.x - 18} y={SRC.y - 10} width={22} height={20} rx={3} fill="var(--card)" stroke="var(--border)" />
      <T x={SRC.x - 18} y={SRC.y - 14}>{tx(t, "figChMs_source", "ion source")}</T>
      {isos.map((iso, i) => {
        const r = radius(iso.a), lx = landX(r);
        const d = `M${SRC.x},${SRC.y} L${FIELD_X},${SRC.y} A${r},${r} 0 0 1 ${lx.toFixed(1)},${DET_Y}`;
        return (
          <g key={iso.a}>
            <path d={d} fill="none" stroke={COLORS[i]} strokeOpacity={0.25} strokeDasharray="3 4" />
            <T x={lx} y={DET_Y + 14} anchor="middle" color={COLORS[i]} bold>{`${iso.a}${el.sym}`}</T>
          </g>
        );
      })}
      <line x1={FIELD_X} x2={FIELD_X + 260} y1={DET_Y} y2={DET_Y} stroke={C.fg} strokeWidth={2} />
      <T x={FIELD_X + 4} y={DET_Y - 6}>{tx(t, "figChMs_detector", "detector")}</T>
      {ions.map((ion, i) => { const p = pos(ion); return <circle key={i} cx={p.x} cy={p.y} r={2.4} fill={COLORS[ion.iso]} />; })}

      {/* spectrum */}
      <T x={SL} y={ST - 18} color={C.fg} bold>{tx(t, "figChMs_spectrum", "mass spectrum")}</T>
      <line x1={SL} x2={SR} y1={SB} y2={SB} stroke={C.axis} />
      {isos.map((iso, i) => {
        const share = total ? (counts[i] ?? 0) / total : 0, h = (share / maxShare) * (SB - ST);
        return (
          <g key={iso.a}>
            <rect x={sx(iso.a) - 9} y={SB - h} width={18} height={h} fill={COLORS[i]} rx={2} />
            <T x={sx(iso.a)} y={SB - h - 4} anchor="middle" color={COLORS[i]} bold>{`${f2(share * 100, 1)}%`}</T>
            <T x={sx(iso.a)} y={SB + 12} anchor="middle">{String(iso.a)}</T>
            <T x={sx(iso.a)} y={SB + 24} anchor="middle" color={C.muted}>{`(${f2(iso.abundance, 1)}%)`}</T>
          </g>
        );
      })}
      <T x={(SL + SR) / 2} y={SB + 38} anchor="middle">{tx(t, "figChMs_axis", "mass (u)")}</T>
      <T x={(SL + SR) / 2} y={SB + 50} anchor="middle">{tx(t, "figChMs_axis2", "in brackets: the true share")}</T>
      <T x={SL} y={SB + 66} color={C.fg}>{`${tx(t, "figChMs_count", "ions counted")}: ${total}`}</T>
    </svg>
  );

  return (
    <Figure title={tx(t, "figChMs_title", "A mass spectrometer sorts isotopes")}
      head={<Btn active={running} onClick={() => setRunning(r => !r)}>{running ? tx(t, "figChMs_pause", "pause") : tx(t, "figChMs_run", "run")}</Btn>}
      controls={<>
        <Row>
          <Choice value={sample} onChange={choose} options={SAMPLES.map(s => [s, `${s} · ${elementName(t, BY_SYMBOL[s])}`] as const)} />
          <Btn onClick={clear}>{tx(t, "figChMs_reset", "clear the counts")}</Btn>
        </Row>
        <Row>
          <Readout color={C.amber}>{`${tx(t, "figChMs_measured", "weighted average of the counts")} = ${total ? f2(measured, 3) : "—"} u`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figChMs_table", "periodic table")}: ${el.mass} u`}</Readout>
          <Btn active={plain} onClick={() => setPlain(p => !p)}>{tx(t, "figChMs_break", "break it: ignore the shares")}</Btn>
        </Row>
        {plain && (
          <Row>
            <Readout color={C.red}>{`(${isos.map(i => f2(i.mass, 3)).join(" + ")}) / ${isos.length} = ${f2(plainAvg, 3)} u ≠ ${f2(weighted, 3)} u`}</Readout>
          </Row>
        )}
      </>}
      note={tx(t, "figChMs_note", "Every ion leaves the source with the same energy and enters the field. The magnetic force bends its path into a circle, and a heavier ion, harder to turn, follows a wider circle and lands farther along the detector. Watch the bars: they grow in proportion to how common each isotope is, and the weighted average of the counts settles on the atomic mass printed in the periodic table. That is what the table's mass is: not the mass of any single atom, but the average over the natural mix. Chlorine has no atom of mass 35.45; it is about three atoms of 35 for every one of 37. (Real paths differ by a few percent; the drawing spreads them out.)")}>
      <div ref={vis.ref}>{view}</div>
    </Figure>
  );
}

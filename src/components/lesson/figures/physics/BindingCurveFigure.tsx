"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";
import { ALL_TERMS, MEASURED, bestZ, nuclide, semfTerms, type Terms } from "./nuclearMath";

// ── What this figure shows ────────────────────────────────────────────────────
// The binding energy per nucleon, B/A, against the mass number A. Dots: the
// measured values of 23 nuclei (AME2020). Line: the semi-empirical mass
// formula, each A taken with the proton number Z that binds it best (the
// valley of stability). Each of its terms can be switched off:
//   surface   the nucleons at the edge have fewer neighbours
//   Coulomb   every proton repels every other
//   asymmetry Pauli: unequal N and Z cost energy
//   pairing   nucleons in pairs bind a little better (the zigzag of even A)
// Right: the terms of the selected nucleus, per nucleon, as a waterfall that
// starts at the volume term (15.75 MeV) and ends at B/A. The readouts give the
// energy released by splitting it into two halves (fission) or by fusing two
// of it (fusion), both from the formula.

const W = 560, H = 290;
const PX0 = 44, PX1 = 392, PY0 = 26, PY1 = 236, AMAX = 250;
const BX0 = 420, BX1 = 548;

export function BindingCurveFigure({ t }: { t?: TrackTranslations }) {
  const [on, setOn] = useState<Terms>(ALL_TERMS);
  const [A, setA] = useState(56);
  const toggle = (k: keyof Terms) => setOn(o => ({ ...o, [k]: !o[k] }));

  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    for (let a = 2; a <= AMAX; a++) pts.push([a, semfTerms(a, bestZ(a, on), on).total / a]);
    return pts;
  }, [on]);
  const yMax = Math.max(9.5, Math.ceil(Math.max(...curve.map(p => p[1]))));
  const X = (a: number) => PX0 + (a / AMAX) * (PX1 - PX0);
  const Y = (b: number) => PY1 - (Math.max(0, b) / yMax) * (PY1 - PY0);
  const path = curve.map(([a, b], i) => `${i ? "L" : "M"}${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join("");

  const Z = bestZ(A, on);
  const k = semfTerms(A, Z, on);
  const perA = k.total / A;

  // fission into two halves (charge shared in proportion) and fusion of two copies
  const A1 = Math.floor(A / 2), A2 = A - A1, Z1 = Math.round((Z * A1) / A), Z2 = Z - Z1;
  const qFission = A1 >= 1 && Z1 >= 1 && Z2 >= 1 ? semfTerms(A1, Z1, on).total + semfTerms(A2, Z2, on).total - k.total : NaN;
  const qFusion = 2 * A <= 300 ? semfTerms(2 * A, 2 * Z, on).total - 2 * k.total : NaN;

  // waterfall of the terms, per nucleon
  const bars: [string, number, string][] = [
    [tx(t, "figPhBind_vol", "volume"), k.vol / A, C.green],
    [tx(t, "figPhBind_surf", "surface"), k.surf / A, C.sky],
    [tx(t, "figPhBind_coul", "Coulomb"), k.coul / A, C.red],
    [tx(t, "figPhBind_asym", "asymmetry"), k.asym / A, C.purple],
    [tx(t, "figPhBind_pair", "pairing"), k.pair / A, C.amber],
  ];
  const BY = (b: number) => PY1 - (b / 16) * (PY1 - PY0);
  const bw = (BX1 - BX0) / (bars.length + 1) - 3;
  let level = 0;

  const fmtQ = (q: number) => (Number.isNaN(q) ? "–" : `${q >= 0 ? "+" : "−"}${f2(Math.abs(q), 1)} MeV`);

  return (
    <Figure title={tx(t, "figPhBind_title", "The binding-energy curve, term by term")}
      controls={<>
        <Row>
          <span className="text-[11px] text-[var(--text-muted)]">{tx(t, "figPhBind_terms", "terms:")}</span>
          <Btn active={on.surface} onClick={() => toggle("surface")}>{tx(t, "figPhBind_surf", "surface")}</Btn>
          <Btn active={on.coulomb} onClick={() => toggle("coulomb")}>{tx(t, "figPhBind_coul", "Coulomb")}</Btn>
          <Btn active={on.asym} onClick={() => toggle("asym")}>{tx(t, "figPhBind_asym", "asymmetry")}</Btn>
          <Btn active={on.pairing} onClick={() => toggle("pairing")}>{tx(t, "figPhBind_pair", "pairing")}</Btn>
        </Row>
        <Slider label={tx(t, "figPhBind_A", "mass number A")} value={A} min={2} max={AMAX} step={1} onChange={setA} fmt={v => String(v)} width="w-40" />
        <Row>
          <Readout color={C.amber}>{`${nuclide(A, Z)}: Z = ${Z}, N = ${A - Z}`}</Readout>
          <Readout>{`B = ${f2(k.total, 1)} MeV, B/A = ${f2(perA, 3)} MeV`}</Readout>
        </Row>
        <Row>
          <Readout color={qFission > 0 ? C.green : C.muted}>{`${tx(t, "figPhBind_fis", "split into two halves")}: ${fmtQ(qFission)}`}</Readout>
          <Readout color={qFusion > 0 ? C.green : C.muted}>{`${tx(t, "figPhBind_fus", "fuse two of them")}: ${fmtQ(qFusion)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhBind_note", "Each dot is a measured nucleus; the line is a formula with five terms, each with a physical reason. Start with every nucleon bound to its neighbours by the short-range strong force: a fixed amount each, the volume term, 15.75 MeV per nucleon. Nucleons at the surface have fewer neighbours, which costs most in small nuclei, where most nucleons are at the surface: switch the surface term off and the curve no longer rises from zero. Every proton repels every other, over the whole nucleus, and that grows faster than A: switch Coulomb off and the curve keeps rising, so heavy nuclei would have nothing to gain by splitting. The asymmetry term is Pauli's principle: protons and neutrons each fill their own levels, so piling up one kind costs energy. Without it the formula would rather make nuclei of neutrons only. The peak near iron and nickel is the most tightly bound matter there is: lighter nuclei release energy by fusing, heavier ones by splitting, as the readouts show.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* axes and grid */}
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
        {Array.from({ length: Math.floor(yMax / 2) + 1 }, (_, i) => i * 2).map(b => (
          <g key={b}>
            <line x1={PX0} y1={Y(b)} x2={PX1} y2={Y(b)} stroke={C.grid} />
            <T x={PX0 - 5} y={Y(b) + 3} anchor="end" size={8}>{String(b)}</T>
          </g>
        ))}
        {[0, 50, 100, 150, 200, 250].map(a => <T key={a} x={X(a)} y={PY1 + 12} anchor="middle" size={8}>{String(a)}</T>)}
        <T x={PX0 - 30} y={PY0 - 10} size={8}>{tx(t, "figPhBind_yAx", "B/A (MeV per nucleon)")}</T>
        <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhBind_xAx", "mass number A")}</T>

        {/* fusion and fission sides of the peak */}
        <T x={X(14)} y={Y(Math.min(yMax, 9.2)) - 2} size={8} color={C.green}>{tx(t, "figPhBind_fusSide", "← fusion releases energy")}</T>
        <T x={X(250)} y={Y(Math.min(yMax, 9.2)) - 2} anchor="end" size={8} color={C.green}>{tx(t, "figPhBind_fisSide", "fission releases energy →")}</T>

        <path d={path} fill="none" stroke={C.sky} strokeWidth={1.8} />
        {MEASURED.map(([a, , b], i) => <circle key={i} cx={X(a)} cy={Y(b)} r={2.8} fill={C.fg} />)}
        {[[4, 2, "He-4"], [12, 6, "C-12"], [56, 26, "Fe-56"], [238, 92, "U-238"]].map(([a, , nm]) => {
          const m = MEASURED.find(p => p[0] === a)!;
          return <T key={nm} x={X(m[0]) + 5} y={Y(m[2]) + 12} size={7.5}>{String(nm)}</T>;
        })}
        <line x1={X(A)} y1={PY0} x2={X(A)} y2={PY1} stroke={C.amber} strokeDasharray="2 3" />
        <circle cx={X(A)} cy={Y(perA)} r={4.5} fill={C.amber} stroke="var(--code-bg)" />

        {/* waterfall of the selected nucleus' terms */}
        <T x={BX0} y={PY0 - 10} size={8}>{`${nuclide(A, Z)}, ${tx(t, "figPhBind_perN", "per nucleon")}`}</T>
        <line x1={BX0 - 4} y1={BY(0)} x2={BX1} y2={BY(0)} stroke={C.axis} />
        {bars.map(([name, v, col], i) => {
          const x = BX0 + i * (bw + 3), top = BY(Math.max(level, level + v)), h = Math.max(1, Math.abs(BY(level) - BY(level + v)));
          level += v;
          return (
            <g key={name}>
              <rect x={x} y={top} width={bw} height={h} fill={col} opacity={v === 0 ? 0.2 : 0.75} />
              <T x={x + bw / 2} y={top - 3} anchor="middle" size={6.5} color={col}>{f2(v, 1)}</T>
              <g transform={`translate(${x + bw / 2 + 2}, ${PY1 + 6}) rotate(60)`}>
                <T x={0} y={0} size={7}>{name}</T>
              </g>
            </g>
          );
        })}
        <rect x={BX0 + bars.length * (bw + 3)} y={BY(perA)} width={bw} height={Math.max(1, BY(0) - BY(perA))} fill={C.amber} />
        <T x={BX0 + bars.length * (bw + 3) + bw / 2} y={BY(perA) - 3} anchor="middle" size={6.5} color={C.amber}>{f2(perA, 2)}</T>
        <g transform={`translate(${BX0 + bars.length * (bw + 3) + bw / 2 + 2}, ${PY1 + 6}) rotate(60)`}>
          <T x={0} y={0} size={7} color={C.amber}>B/A</T>
        </g>
      </svg>
    </Figure>
  );
}

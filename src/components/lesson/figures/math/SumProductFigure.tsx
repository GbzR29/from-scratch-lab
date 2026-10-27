"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Choice, Figure, Grid, Handle, Row, Readout, Slider, Sliders, C, T, fnPath, nearest, plot, useDrag } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Symmetric expressions of the two roots from their sum and product alone.
// roots  — drag the roots r and q along the x axis of y = x² − s·x + p; s and p
//          follow (s = r + q, p = rq).
// coeffs — set s and p directly. When s² − 4p < 0 the parabola misses the axis
//          and the roots are complex, α ± βi, yet every formula still works.
// The table computes r² + q², (r − q)², 1/r + 1/q and r³ + q³ twice: from s
// and p only, and directly from the roots. The two columns always agree.

type Mode = "roots" | "coeffs";
const n2 = (v: number) => (!Number.isFinite(v) ? "—" : (Math.abs(v) < 5e-4 ? 0 : +v.toFixed(3)).toString().replace("-", "−"));
const V = plot({ W: 560, H: 250, x0: -7, x1: 7, y0: -12, y1: 14 });
const snap = (x: number) => Math.max(-6, Math.min(6, Math.round(x * 2) / 2));

export function SumProductFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("roots");
  const [r, setR] = useState(1);
  const [q, setQ] = useState(4);
  const [cs, setCs] = useState(5);
  const [cp, setCp] = useState(4);

  const s = mode === "roots" ? r + q : cs;
  const p = mode === "roots" ? r * q : cp;
  const disc = s * s - 4 * p;
  // The roots as α ± βi (β = 0 when they are real).
  const al = s / 2, be = disc < 0 ? Math.sqrt(-disc) / 2 : 0;
  const r1 = disc < 0 ? al : mode === "roots" ? r : al - Math.sqrt(disc) / 2;
  const r2 = disc < 0 ? al : mode === "roots" ? q : al + Math.sqrt(disc) / 2;

  const pickMode = (m: Mode) => {
    if (m === "coeffs") { setCs(r + q); setCp(r * q); }
    else if (disc >= 0) { setR(snap(r1)); setQ(snap(r2)); }
    setMode(m);
  };

  const drag = useDrag<"r" | "q">(
    pt => (mode === "roots" ? nearest(pt, [["r", { x: V.X(r), y: V.Y(0) }], ["q", { x: V.X(q), y: V.Y(0) }]], 18) : null),
    (id, pt) => { const x = snap(V.inv(pt).x); if (id === "r") setR(x); else setQ(x); },
  );

  // Direct values from the roots (complex pair when β > 0, all results real).
  const direct = be > 0 ? {
    sq: 2 * (al * al - be * be), diff: -4 * be * be, inv: (2 * al) / (al * al + be * be), cube: 2 * (al ** 3 - 3 * al * be * be),
  } : {
    sq: r1 * r1 + r2 * r2, diff: (r1 - r2) ** 2, inv: 1 / r1 + 1 / r2, cube: r1 ** 3 + r2 ** 3,
  };
  const rows: [string, string, number, number][] = [
    ["r² + q²", "s² − 2p", s * s - 2 * p, direct.sq],
    ["(r − q)²", "s² − 4p", s * s - 4 * p, direct.diff],
    ["1/r + 1/q", "s / p", p === 0 ? NaN : s / p, p === 0 ? NaN : direct.inv],
    ["r³ + q³", "s³ − 3sp", s ** 3 - 3 * s * p, direct.cube],
  ];
  const rootText = be > 0 ? `${n2(al)} ± ${n2(be)}i` : `${n2(r1)}, ${n2(r2)}`;

  const view = (
    <div>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${V.W} ${V.H}`} className="w-full h-auto">
        <Grid p={V} step={1} major={2} />
        <path d={fnPath(V, x => x * x - s * x + p)} fill="none" stroke={C.purple} strokeWidth={2} />
        {be > 0 && <T x={V.X(al)} y={V.Y(0) - 8} size={9.5} anchor="middle" color={C.amber}>{tx(t, "figSp_miss", "misses the axis: complex roots")}</T>}
        {be === 0 && <>
          <Handle x={V.X(r1)} y={V.Y(0)} color={C.sky} active={drag.dragging === "r"} />
          <Handle x={V.X(r2)} y={V.Y(0)} color={C.pink} active={drag.dragging === "q"} />
          <T x={V.X(r1)} y={V.Y(0) + 20} size={10} anchor="middle" color={C.sky} bold>r</T>
          <T x={V.X(r2)} y={V.Y(0) + 20} size={10} anchor="middle" color={C.pink} bold>q</T>
        </>}
        <T x={8} y={14} size={10} color={C.purple}>{`y = x² − ${n2(s)}x + ${n2(p)}`.replace("+ −", "− ").replace("− −", "+ ")}</T>
      </svg>
      <div className="overflow-x-auto px-3 pb-3">
        <table className="mx-auto text-[12px] font-mono border-collapse">
          <thead>
            <tr className="text-[var(--text-muted)]">
              <th className="px-3 py-1 text-left font-semibold">{tx(t, "figSp_hExpr", "expression")}</th>
              <th className="px-3 py-1 text-left font-semibold">{tx(t, "figSp_hFrom", "from s and p")}</th>
              <th className="px-3 py-1 text-right font-semibold">{tx(t, "figSp_hValue", "value")}</th>
              <th className="px-3 py-1 text-right font-semibold">{tx(t, "figSp_hDirect", "from the roots")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([e, f, a, d]) => (
              <tr key={e} className="border-t border-[var(--border)]">
                <td className="px-3 py-1 text-[var(--text-main)]">{e}</td>
                <td className="px-3 py-1" style={{ color: C.amber }}>{f}</td>
                <td className="px-3 py-1 text-right text-[var(--text-main)]">{n2(a)}</td>
                <td className="px-3 py-1 text-right" style={{ color: C.green }}>{n2(d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const controls = <>
    <Row>
      <Choice value={mode} onChange={pickMode} options={[
        ["roots", tx(t, "figSp_mRoots", "drag the roots")],
        ["coeffs", tx(t, "figSp_mCoeffs", "set s and p")],
      ]} />
    </Row>
    {mode === "coeffs" && (
      <Sliders>
        <Slider label="s = r + q" value={cs} min={-8} max={8} step={0.5} onChange={setCs} fmt={n2} />
        <Slider label="p = rq" value={cp} min={-10} max={16} step={0.5} onChange={setCp} fmt={n2} />
      </Sliders>
    )}
    <Row>
      <Readout color={C.amber}>{`s = ${n2(s)},  p = ${n2(p)}`}</Readout>
      <Readout>{`${tx(t, "figSp_roots", "roots")}: ${rootText}`}</Readout>
      <Readout color={disc < 0 ? C.red : C.green}>{`s² − 4p = ${n2(disc)}`}</Readout>
    </Row>
  </>;

  return (
    <Figure title={tx(t, "figSp_title", "Sum and product are enough")} controls={controls}
      note={tx(t, "figSp_note", "The purple curve is y = x² − s·x + p, whose roots are r and q, with s = r + q and p = rq. In the first mode drag the two dots along the axis; in the second set s and p yourself. The table works out four expressions in two ways: from s and p alone (amber formula), and directly from the roots (green). They always match, even when s² − 4p is negative and the curve misses the axis: then the roots are complex numbers α ± βi, and the expressions still come out real.")}>
      {view}
    </Figure>
  );
}

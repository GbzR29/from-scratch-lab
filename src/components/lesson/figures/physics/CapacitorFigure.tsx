"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A parallel-plate capacitor seen side on: two plates of area A a gap d apart,
// optionally filled with a dielectric of constant κ. C = κ ε₀ A / d.
// Connected to the battery, the plates sit at the battery's voltage V and
// take a charge Q = C V. Disconnected, the charge is trapped: Q stays fixed,
// and changing d or κ changes V = Q / C instead.
// The + and − signs on the plates grow with the charge per area, the field
// lines between them with E = V/d (both on a log scale). In a
// dielectric the molecules polarise (small − and + at the slab's faces) and
// cancel part of the field, so the same charge makes a weaker field.
// Pull the plates apart while disconnected: V and the stored energy ½QV both
// grow; the extra energy is the work your hands did against the attraction of
// the plates.

const W = 560, H = 300;
const EPS0 = 8.854e-12;
const MATERIALS = { air: 1, plastic: 2.3, glass: 5 } as const;
type Mat = keyof typeof MATERIALS;

export function CapacitorFigure({ t }: { t?: TrackTranslations }) {
  const [A, setA] = useState(200);          // cm²
  const [d, setD] = useState(4);            // mm
  const [Vbat, setVbat] = useState(50);     // V
  const [mat, setMat] = useState<Mat>("air");
  const [connected, setConnected] = useState(true);
  const [Qheld, setQheld] = useState(0);    // C, while disconnected

  const kappa = MATERIALS[mat];
  const Cap = (kappa * EPS0 * A * 1e-4) / (d * 1e-3);
  const Q = connected ? Cap * Vbat : Qheld;
  const V = Q / Cap;
  const E = V / (d * 1e-3);
  const U = 0.5 * Q * V;

  const toggle = () => {
    if (connected) setQheld(Cap * Vbat);
    setConnected(c => !c);
  };

  // drawing
  const ph = clamp(Math.sqrt(A) * 12, 90, 270);          // plate height, px
  const gap = d * 22;                                     // px
  const x1 = W / 2 - gap / 2 - 70, x2 = W / 2 + gap / 2 - 70;
  const top = H / 2 - ph / 2;
  // charge and field span a hundredfold over the sliders, so signs and lines
  // grow with their logarithm
  const sigma = Q / (A * 1e-4);                           // C/m²
  const nSigns = sigma > 0 ? clamp(Math.round(3 * Math.log10(sigma / 1e-9)), 0, 16) : 0;
  const nLines = E > 0 ? clamp(Math.round(4 * Math.log10(E / 100)), 0, 18) : 0;

  return (
    <Figure title={tx(t, "figPhCap_title", "A parallel-plate capacitor")}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhCap_A", "plate area A")} value={A} min={50} max={500} step={10} onChange={setA} fmt={v => `${f2(v, 0)} cm²`} />
          <Slider label={tx(t, "figPhCap_d", "gap d")} value={d} min={1} max={10} step={0.1} onChange={setD} fmt={v => `${f2(v, 1)} mm`} />
          {connected && <Slider label={tx(t, "figPhCap_V", "battery voltage")} value={Vbat} min={0} max={100} step={1} onChange={setVbat} fmt={v => `${f2(v, 0)} V`} />}
        </Sliders>
        <Row>
          <Choice value={mat} onChange={setMat} options={[
            ["air", tx(t, "figPhCap_air", "air, κ = 1")],
            ["plastic", tx(t, "figPhCap_plastic", "plastic, κ = 2.3")],
            ["glass", tx(t, "figPhCap_glass", "glass, κ = 5")],
          ]} />
          <Btn active={!connected} onClick={toggle}>{connected ? tx(t, "figPhCap_disconnect", "disconnect the battery") : tx(t, "figPhCap_connect", "reconnect the battery")}</Btn>
        </Row>
        <Row>
          <Readout color={C.green}>{`C = κε₀A/d = ${f2(Cap * 1e12, 1)} pF`}</Readout>
          <Readout color={C.red}>{`Q = ${f2(Q * 1e9, 2)} nC`}</Readout>
          <Readout color={C.amber}>{`V = ${f2(V, 1)} V`}</Readout>
          <Readout color={C.sky}>{`E = V/d = ${f2(E / 1000, 1)} kV/m`}</Readout>
          <Readout>{`U = ½QV = ${U >= 1e-6 ? `${f2(U * 1e6, 2)} µJ` : `${f2(U * 1e9, 1)} nJ`}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhCap_note", "With the battery connected, widen the plates' area or close the gap: the capacitance grows, so the same voltage pushes more charge onto the plates. Slide in a dielectric: the molecules line up, their ends cancel part of the field, and the battery has to supply κ times as much charge to keep the same voltage. Now disconnect the battery, trapping the charge, and pull the plates apart. The charge cannot change, the field between the plates stays the same, but over a longer gap that field adds up to a larger voltage, and the stored energy ½QV grows. That energy came from you: the plates attract each other, and separating them takes work. Slide the dielectric in now and the voltage drops by κ.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* wires and battery */}
        <path d={`M${x1 - 4},${H / 2} H${60} V${H - 30} H${200}`} fill="none" stroke={C.fg} strokeWidth={1.5} />
        <path d={`M${x2 + 4},${H / 2} H${W - 170} V${H - 30} H${260}`} fill="none" stroke={C.fg} strokeWidth={1.5} />
        {connected ? (
          <g>
            <line x1={222} y1={H - 44} x2={222} y2={H - 16} stroke={C.fg} strokeWidth={2.5} />
            <line x1={238} y1={H - 38} x2={238} y2={H - 22} stroke={C.fg} strokeWidth={4} />
            <path d={`M200,${H - 30} H222 M238,${H - 30} H260`} stroke={C.fg} strokeWidth={1.5} />
            <T x={230} y={H - 50} anchor="middle" size={8.5} color={C.fg}>{`${f2(Vbat, 0)} V`}</T>
          </g>
        ) : (
          <g>
            <path d={`M200,${H - 30} L222,${H - 44}`} stroke={C.muted} strokeWidth={1.5} />
            <T x={230} y={H - 50} anchor="middle" size={8.5}>{tx(t, "figPhCap_open", "open")}</T>
          </g>
        )}
        {/* dielectric slab */}
        {mat !== "air" && <>
          <rect x={x1 + 4} y={top} width={gap - 8} height={ph} fill={C.amber} opacity={0.14} />
          {Array.from({ length: Math.round(nSigns * (1 - 1 / kappa)) }, (_, i) => {
            const y = top + ((i + 0.5) * ph) / Math.max(1, Math.round(nSigns * (1 - 1 / kappa)));
            return <g key={i}><T x={x1 + 8} y={y + 3} color={C.blue} size={8}>−</T><T x={x2 - 14} y={y + 3} color={C.red} size={8}>+</T></g>;
          })}
        </>}
        {/* field lines */}
        {Array.from({ length: nLines }, (_, i) => {
          const y = top + ((i + 0.5) * ph) / nLines;
          return <line key={i} x1={x1 + 6} y1={y} x2={x2 - 6} y2={y} stroke={C.sky} strokeWidth={1.1} opacity={0.75} markerEnd="url(#capArrow)" />;
        })}
        <defs>
          <marker id="capArrow" viewBox="0 0 6 6" refX={5} refY={3} markerWidth={5} markerHeight={5} orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={C.sky} />
          </marker>
        </defs>
        {/* plates */}
        <rect x={x1 - 4} y={top} width={6} height={ph} fill={C.red} />
        <rect x={x2 - 2} y={top} width={6} height={ph} fill={C.blue} />
        {Array.from({ length: nSigns }, (_, i) => {
          const y = top + ((i + 0.5) * ph) / Math.max(1, nSigns);
          return <g key={i}><T x={x1 - 16} y={y + 4} color={C.red} size={11} bold>+</T><T x={x2 + 8} y={y + 4} color={C.blue} size={11} bold>−</T></g>;
        })}
        {/* gap dimension */}
        <path d={`M${x1},${top - 14} H${x2}`} stroke={C.muted} strokeWidth={1} />
        <path d={`M${x1},${top - 19} V${top - 9} M${x2},${top - 19} V${top - 9}`} stroke={C.muted} strokeWidth={1} />
        <T x={(x1 + x2) / 2} y={top - 22} anchor="middle" size={8.5}>{`d = ${f2(d, 1)} mm`}</T>
        {/* energy bar */}
        <T x={W - 120} y={30} size={8.5} color={C.fg}>{tx(t, "figPhCap_energy", "stored energy")}</T>
        <rect x={W - 120} y={38} width={100} height={10} fill="none" stroke={C.axis} />
        <rect x={W - 120} y={38} width={U > 1e-9 ? clamp(25 * Math.log10(U * 1e9), 0, 100) : 0} height={10} fill={C.amber} />
        <T x={W - 120} y={60} size={7.5}>{tx(t, "figPhCap_log", "bar: log scale")}</T>
      </svg>
    </Figure>
  );
}

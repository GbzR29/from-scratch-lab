"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// One Feynman diagram, read with time pointing in any direction. A diagram is
// drawn once, with fixed lines: fermion lines (electrons) carry an arrow,
// photons are wavy. Nothing in it says which way time runs; that is chosen
// when it is read, with the dial. For each outer line:
//   • it is incoming if its free end lies earlier than its vertex along the
//     time arrow t̂, else outgoing;
//   • a fermion whose arrow points forward in time is an electron, one whose
//     arrow points backward is a positron (Feynman's reading of antiparticles
//     as particles running backward in time).
// So the same picture is several processes. Two diagrams:
//   photon exchange: e⁻e⁻ → e⁻e⁻ (time up), e⁻e⁺ → e⁻e⁺ through annihilation
//     (time sideways), e⁺e⁺ → e⁺e⁺ (time down);
//   electron exchange: e⁻e⁺ → γγ (up), e⁻γ → e⁻γ Compton (sideways),
//     γγ → e⁻e⁺ (down).
// In both pictures the outer lines flip in pairs as the dial turns, so a
// reading always has two lines in and two out (one in and three out would not
// be a possible process for real particles; the code still says so). "now" sweeps a line of simultaneity through the picture and lists
// what exists at that moment. Each vertex contributes √α to the amplitude.

const W = 560, H = 290, CX = 190, CY = 140, U = 50;
type P2 = [number, number];
type Leg = { end: P2; v: P2; kind: "f" | "g"; into: boolean };         // into: the fermion arrow points into the vertex
type Diagram = { legs: Leg[]; internal: { a: P2; b: P2; kind: "f" | "g" } };
const V1: P2 = [-1, 0], V2: P2 = [1, 0];
const DIAGRAMS: Record<"photon" | "electron", Diagram> = {
  photon: {
    legs: [
      { end: [-2.1, -1.7], v: V1, kind: "f", into: true }, { end: [-2.1, 1.7], v: V1, kind: "f", into: false },
      { end: [2.1, -1.7], v: V2, kind: "f", into: true }, { end: [2.1, 1.7], v: V2, kind: "f", into: false },
    ],
    internal: { a: V1, b: V2, kind: "g" },
  },
  electron: {
    legs: [
      { end: [-2.1, -1.7], v: V1, kind: "f", into: true }, { end: [-2.1, 1.7], v: V1, kind: "g", into: false },
      { end: [2.1, -1.7], v: V2, kind: "f", into: false }, { end: [2.1, 1.7], v: V2, kind: "g", into: false },
    ],
    internal: { a: V1, b: V2, kind: "f" },                                 // arrow from V1 to V2
  },
};
const dot = (a: P2, b: P2) => a[0] * b[0] + a[1] * b[1];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const scr = (p: P2) => [CX + p[0] * U, CY - p[1] * U] as const;

export function FeynmanFigure({ t }: { t?: TrackTranslations }) {
  const [which, setWhich] = useState<"photon" | "electron">("photon");
  const [ang, setAng] = useState(0);
  const [loop, setLoop] = useState(false);
  const [sweep, setSweep] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const now = useRef(0);

  useFrame(sweep && vis.on, dt => {
    now.current += dt * 0.35;
    if (now.current > 1) now.current = 0;
    rerender();
  });

  const d = DIAGRAMS[which];
  const th = (ang * Math.PI) / 180, tHat: P2 = [Math.sin(th), Math.cos(th)];

  const read = d.legs.map(l => {
    const incoming = dot(sub(l.end, l.v), tHat) < 0;
    if (l.kind === "g") return { incoming, name: "γ" };
    const arrow = l.into ? sub(l.v, l.end) : sub(l.end, l.v);
    return { incoming, name: dot(arrow, tHat) > 0 ? "e⁻" : "e⁺" };
  });
  const ins = read.filter(r => r.incoming).map(r => r.name).sort();
  const outs = read.filter(r => !r.incoming).map(r => r.name).sort();
  const key = `${ins.join("")}>${outs.join("")}`;
  const NAMES: Record<string, string> = {
    "e⁻e⁻>e⁻e⁻": tx(t, "figPhFey_moller", "Møller scattering: two electrons repel"),
    "e⁺e⁺>e⁺e⁺": tx(t, "figPhFey_pp", "two positrons repel"),
    "e⁺e⁻>e⁺e⁻": d.internal.kind === "g" ? tx(t, "figPhFey_bhabha", "Bhabha scattering: annihilation into a photon, then a new pair") : "",
    "e⁺e⁻>γγ": tx(t, "figPhFey_annih", "annihilation into two photons"),
    "γγ>e⁺e⁻": tx(t, "figPhFey_pair", "pair creation from two photons (Breit–Wheeler)"),
    "e⁻γ>e⁻γ": tx(t, "figPhFey_compton", "Compton scattering: light bouncing off an electron"),
    "e⁺γ>e⁺γ": tx(t, "figPhFey_comptonP", "Compton scattering off a positron"),
  };
  const lopsided = ins.length !== 2;
  let process = lopsided ? tx(t, "figPhFey_impossible", "not a real process: with 1 line in and 3 out (or 3 and 1), energy and momentum cannot both balance") : NAMES[key];
  if (!process) process = tx(t, "figPhFey_scatter", "electron–positron scattering by photon exchange");

  // internal line: a virtual photon or a virtual electron / positron
  const intName = d.internal.kind === "g" ? tx(t, "figPhFey_vGamma", "virtual photon")
    : dot(sub(d.internal.b, d.internal.a), tHat) > 0 ? tx(t, "figPhFey_vE", "virtual electron") : tx(t, "figPhFey_vP", "virtual positron");

  // the "now" line: projections of every line onto t̂
  const segs: { a: P2; b: P2; name: string }[] = [
    ...d.legs.map((l, i) => ({ a: l.end, b: l.v, name: read[i].name })),
    { a: d.internal.a, b: d.internal.b, name: intName },
  ];
  const projs = segs.flatMap(s => [dot(s.a, tHat), dot(s.b, tHat)]);
  const pMin = Math.min(...projs), pMax = Math.max(...projs);
  const pNow = pMin + 0.02 + now.current * (pMax - pMin - 0.04);
  const alive = segs.filter(s => {
    const a = dot(s.a, tHat), b = dot(s.b, tHat);
    return pNow >= Math.min(a, b) && pNow <= Math.max(a, b);
  });

  const fermion = (a: P2, b: P2, arrowFromAToB: boolean, hot: boolean, key: string) => {
    const [x0, y0] = scr(a), [x1, y1] = scr(b);
    const [fx, fy, tx_, ty] = arrowFromAToB ? [x0, y0, x1, y1] : [x1, y1, x0, y0];
    const mx = (fx + tx_) / 2, my = (fy + ty) / 2, L = Math.hypot(tx_ - fx, ty - fy), ux = (tx_ - fx) / L, uy = (ty - fy) / L;
    return (
      <g key={key}>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={hot ? C.amber : C.fg} strokeWidth={hot ? 2.6 : 1.8} />
        <path d={`M${mx - ux * 6 - uy * 5},${my - uy * 6 + ux * 5} L${mx + ux * 6},${my + uy * 6} L${mx - ux * 6 + uy * 5},${my - uy * 6 - ux * 5}`} fill="none" stroke={hot ? C.amber : C.fg} strokeWidth={1.8} />
      </g>
    );
  };
  const photon = (a: P2, b: P2, hot: boolean, key: string) => {
    const [x0, y0] = scr(a), [x1, y1] = scr(b), L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    const waves = Math.max(3, Math.round(L / 12));
    let p = "";
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, w = Math.sin(u * waves * 2 * Math.PI) * 5;
      p += `${i ? "L" : "M"}${(x0 + (x1 - x0) * u + nx * w).toFixed(1)},${(y0 + (y1 - y0) * u + ny * w).toFixed(1)}`;
    }
    return <path key={key} d={p} fill="none" stroke={hot ? C.amber : C.sky} strokeWidth={hot ? 2.4 : 1.6} />;
  };
  const isHot = (s: { a: P2; b: P2 }) => sweep && alive.some(x => x.a === s.a && x.b === s.b);

  // the second-order photon: joins the two lower outer fermion lines
  const loopA: P2 = [(d.legs[0].end[0] + V1[0]) / 2, (d.legs[0].end[1] + V1[1]) / 2];
  const loopB: P2 = [(d.legs[2].end[0] + V2[0]) / 2, (d.legs[2].end[1] + V2[1]) / 2];

  // time arrow, drawn on the left
  const TA: P2 = [-3.2, 0];
  const [tx0, ty0] = scr([TA[0] - tHat[0] * 0.55, TA[1] - tHat[1] * 0.55]), [tx1, ty1] = scr([TA[0] + tHat[0] * 0.55, TA[1] + tHat[1] * 0.55]);

  // the "now" line: perpendicular to t̂ through the point pNow·t̂
  const nowA = scr([tHat[0] * pNow - tHat[1] * 2.6, tHat[1] * pNow + tHat[0] * 2.6]);
  const nowB = scr([tHat[0] * pNow + tHat[1] * 2.6, tHat[1] * pNow - tHat[0] * 2.6]);

  const vertices = loop ? 4 : 2;

  return (
    <Figure title={tx(t, "figPhFey_title", "One Feynman diagram, many processes: turn the time axis")}
      controls={<>
        <Row>
          <Choice value={which} onChange={setWhich} options={[["photon", tx(t, "figPhFey_dPhoton", "photon exchange")], ["electron", tx(t, "figPhFey_dElectron", "electron exchange")]] as const} />
          {[0, 90, 180, 270].map(a => <Btn key={a} active={ang === a} onClick={() => setAng(a)}>{a === 0 ? "↑" : a === 90 ? "→" : a === 180 ? "↓" : "←"}</Btn>)}
          <Btn active={sweep} onClick={() => setSweep(s => !s)}>{tx(t, "figPhFey_now", "show 'now'")}</Btn>
          <Btn active={loop} onClick={() => setLoop(l => !l)}>{tx(t, "figPhFey_loop", "add a photon (next order)")}</Btn>
        </Row>
        <Slider label={tx(t, "figPhFey_dial", "direction of time")} value={ang} min={0} max={359} step={1} onChange={setAng} fmt={v => `${v}°`} width="w-40" />
        <Row>
          <Readout color={lopsided ? C.red : C.green}>{process}</Readout>
        </Row>
        <Row>
          <Readout>{`${tx(t, "figPhFey_in", "in")}: ${ins.join(" ") || "–"}   ${tx(t, "figPhFey_out", "out")}: ${outs.join(" ") || "–"}`}</Readout>
          <Readout>{`${tx(t, "figPhFey_inside", "inside")}: ${intName}`}</Readout>
          {sweep && <Readout color={C.amber}>{`${tx(t, "figPhFey_nowIs", "now")}: ${alive.map(a => a.name).join(", ")}`}</Readout>}
        </Row>
        <Row>
          <Readout>{`${vertices} ${tx(t, "figPhFey_vertices", "vertices")}: ${tx(t, "figPhFey_amp", "amplitude")} ∝ (√α)^${vertices}, ${tx(t, "figPhFey_prob", "chance")} ∝ α^${vertices} ≈ ${vertices === 2 ? "5.3e−5" : "2.8e−9"}`}</Readout>
          {loop && <Readout color={C.muted}>{tx(t, "figPhFey_loopNote", "this correction changes the answer by about α/π ≈ 0.2%")}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhFey_note", "A Feynman diagram is a picture of one term in a calculation. Lines are particles, and every vertex, where a photon line meets an electron line, is one basic event: an electron emits or absorbs a photon. The diagram itself has no built-in direction of time. Turn the dial and read it again. With time pointing up, the photon-exchange diagram is two electrons repelling: one throws a photon, the other catches it. With time pointing sideways, the same lines read as an electron and a positron that annihilate into a photon, which then makes a new pair. The rule is Feynman's: an electron line whose arrow points backward in time is a positron. The electron-exchange diagram is even richer: annihilation into two photons, Compton scattering, or two photons making matter. Each vertex multiplies the amplitude by √α, about 1/11.7, so the chance of a process falls by α ≈ 1/137 for every extra pair of vertices. That is why the simplest diagrams give most of the answer, and adding a photon, the next order, corrects it by only a fraction of a percent.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* time arrow */}
          <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke={C.purple} strokeWidth={2} />
          <circle cx={tx1} cy={ty1} r={4} fill={C.purple} />
          <T x={scr(TA)[0]} y={scr(TA)[1] + 64} anchor="middle" size={8} color={C.purple}>{tx(t, "figPhFey_time", "time")}</T>

          {sweep && <line x1={nowA[0]} y1={nowA[1]} x2={nowB[0]} y2={nowB[1]} stroke={C.amber} strokeDasharray="5 4" />}

          {d.legs.map((l, i) => {
            const hot = isHot(segs[i]);
            return l.kind === "g" ? photon(l.end, l.v, hot, `l${i}`) : fermion(l.end, l.v, l.into, hot, `l${i}`);
          })}
          {d.internal.kind === "g"
            ? photon(d.internal.a, d.internal.b, isHot(segs[4]), "int")
            : fermion(d.internal.a, d.internal.b, true, isHot(segs[4]), "int")}
          {loop && photon(loopA, loopB, false, "loop")}
          {[V1, V2, ...(loop ? [loopA, loopB] : [])].map((v, i) => <circle key={i} cx={scr(v)[0]} cy={scr(v)[1]} r={4} fill={C.fg} />)}

          {/* names at the free ends */}
          {d.legs.map((l, i) => {
            const [x, y] = scr(l.end), off = l.end[1] > 0 ? -10 : 18;
            return (
              <g key={`n${i}`}>
                <T x={x} y={y + off} anchor="middle" size={11} color={read[i].name === "γ" ? C.sky : read[i].name === "e⁺" ? C.pink : C.fg} bold>{read[i].name}</T>
                <T x={x} y={y + off + (off < 0 ? -11 : 11)} anchor="middle" size={7.5}>{read[i].incoming ? tx(t, "figPhFey_inL", "in") : tx(t, "figPhFey_outL", "out")}</T>
              </g>
            );
          })}

          <T x={330} y={30} size={8.5} color={C.fg} bold>{tx(t, "figPhFey_rules", "Reading rules")}</T>
          <T x={330} y={48} size={8}>{tx(t, "figPhFey_r1", "a line starting before its vertex: comes in")}</T>
          <T x={330} y={64} size={8}>{tx(t, "figPhFey_r2", "arrow along time: electron e⁻")}</T>
          <T x={330} y={80} size={8} color={C.pink}>{tx(t, "figPhFey_r3", "arrow against time: positron e⁺")}</T>
          <T x={330} y={96} size={8} color={C.sky}>{tx(t, "figPhFey_r4", "wavy line: photon γ")}</T>
          <T x={330} y={112} size={8}>{tx(t, "figPhFey_r5", "dot: a vertex, factor √α ≈ 0.085")}</T>
          <T x={330} y={140} size={8.5} color={C.fg} bold>{tx(t, "figPhFey_charge", "At every vertex")}</T>
          <T x={330} y={158} size={8}>{tx(t, "figPhFey_c1", "one arrow in, one arrow out:")}</T>
          <T x={330} y={174} size={8}>{tx(t, "figPhFey_c2", "charge is conserved, whichever")}</T>
          <T x={330} y={190} size={8}>{tx(t, "figPhFey_c3", "way time runs")}</T>
        </svg>
      </div>
    </Figure>
  );
}

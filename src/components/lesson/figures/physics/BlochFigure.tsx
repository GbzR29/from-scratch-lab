"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, Vec, useFrame, useVisible, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { makeProjector, useOrbit, cross, dot, norm, scale, add, type V3 } from "@/components/lesson/kit/scene3d";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// The Bloch sphere: every state of a spin ½ (or any qubit),
//   |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩,
// is a point on a sphere, at polar angle θ from the top and longitude φ. The
// top is |0⟩ (spin up along z), the bottom |1⟩ (down), the equator holds the
// even mixes such as |+⟩ = (|0⟩ + |1⟩)/√2 (spin up along x).
// Gates turn the arrow: X, Y, Z by 180° about their axes, H by 180° about the
// x+z diagonal, S by 90° about z. A magnetic field along z makes the arrow
// precess about z (Larmor precession, the basis of MRI).
// "measure z" gives 0 with chance (1 + z)/2 = cos²(θ/2) and moves the arrow
// to the pole it found. "100 copies" measures 100 fresh copies of the state
// shown, leaving it alone. The dashed drop to the z axis marks the average.
// "break it: classical arrow" makes a measurement read off the arrow's height
// z, any value between −1 and 1, and leave it where it was. Stern and Gerlach
// saw only two values.

const W = 560, H = 290, CX = 160, CY = 146, UNIT = 104;
const GATES: Record<string, [V3, number]> = {
  X: [[1, 0, 0], Math.PI], Y: [[0, 1, 0], Math.PI], Z: [[0, 0, 1], Math.PI],
  H: [norm([1, 0, 1]), Math.PI], S: [[0, 0, 1], Math.PI / 2],
};
const OMEGA = 1.3;                                   // precession, rad per second on screen

/** Rodrigues: turn v about the unit axis k by angle a. */
function rotate(v: V3, k: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c)));
}
const toScene = (b: V3): V3 => [b[1], b[2], b[0]];   // Bloch x toward the eye, y right, z up
const angles = (v: V3) => {
  const th = Math.acos(Math.max(-1, Math.min(1, v[2])));
  let ph = Math.atan2(v[1], v[0]);
  if (ph < 0) ph += 2 * Math.PI;
  return { th, ph: Math.sin(th) < 1e-6 ? 0 : ph };
};
const fromAngles = (th: number, ph: number): V3 => [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
const deg = (r: number) => Math.round((r * 180) / Math.PI);

export function BlochFigure({ t }: { t?: TrackTranslations }) {
  const [v, setV] = useState<V3>(fromAngles(Math.PI / 3, Math.PI / 4));
  const [anim, setAnim] = useState<{ k: V3; left: number } | null>(null);
  const [field, setField] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [classical, setClassical] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copies, setCopies] = useState<[number, number] | null>(null);
  const rnd = useRef(mulberry32(11));
  const orbit = useOrbit({ yaw: 0.55, pitch: 0.32, zoom: 1 });
  const vis = useVisible<HTMLDivElement>();

  useFrame(vis.on && (!!anim || (field && playing)), dt => {
    if (anim) {
      const step = Math.min(anim.left, dt * 3.2);
      setV(p => rotate(p, anim.k, step));
      setAnim(a => (a && a.left - step > 1e-6 ? { ...a, left: a.left - step } : null));
    } else setV(p => rotate(p, [0, 0, 1], OMEGA * dt));
  });

  const gate = (g: string) => { if (!anim) { setAnim({ k: GATES[g][0], left: GATES[g][1] }); setCopies(null); } };
  const measure = () => {
    if (anim) return;
    const p0 = (1 + v[2]) / 2;
    if (classical) { setHistory(h => [...h, (v[2] >= 0 ? "+" : "−") + f2(Math.abs(v[2]), 2)].slice(-8)); return; }
    const zero = rnd.current() < p0;
    setV(zero ? [0, 0, 1] : [0, 0, -1]);
    setHistory(h => [...h, zero ? "0" : "1"].slice(-16));
  };
  const hundred = () => {
    let n0 = 0;
    for (let i = 0; i < 100; i++) if (rnd.current() < (1 + v[2]) / 2) n0++;
    setCopies([n0, 100 - n0]);
  };

  const { th, ph } = angles(v);
  const a = Math.cos(th / 2), bMag = Math.sin(th / 2);
  const P = makeProjector(orbit.orbit, CX, CY, UNIT);
  const p = (b: V3) => P(toScene(b));
  const R = UNIT * orbit.orbit.zoom;

  // a great circle, split into the half in front of the centre and the half behind it
  const ring = (f: (s: number) => V3) => {
    let front = "", back = "", prev: boolean | null = null;
    const depth0 = P([0, 0, 0]).depth;
    for (let i = 0; i <= 96; i++) {
      const q = p(f((i / 96) * 2 * Math.PI)), seg = `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
      const isFront = q.depth < depth0;
      if (isFront) front += (prev === true ? "L" : "M") + seg;
      else back += (prev === false ? "L" : "M") + seg;
      prev = isFront;
    }
    return { front, back };
  };
  const equator = ring(s => [Math.cos(s), Math.sin(s), 0]);
  const meridian = ring(s => [Math.sin(s), 0, Math.cos(s)]);
  const tip = p(v), o = p([0, 0, 0]), drop = p([0, 0, v[2]]);
  const axes: [V3, string, string][] = [
    [[0, 0, 1], "|0⟩", C.sky], [[0, 0, -1], "|1⟩", C.pink],
    [[1, 0, 0], "|+⟩", C.muted], [[-1, 0, 0], "|−⟩", C.muted],
    [[0, 1, 0], "|+i⟩", C.muted], [[0, -1, 0], "|−i⟩", C.muted],
  ];

  const BX = 336, BW = 200;
  return (
    <Figure title={tx(t, "figPhBloch_title", "The Bloch sphere: every state of a spin ½")}
      head={<Btn active={classical} onClick={() => { setClassical(c => !c); setHistory([]); }}>{tx(t, "figPhBloch_broken", "break it: classical arrow")}</Btn>}
      controls={<>
        <Row>
          {Object.keys(GATES).map(g => <Btn key={g} onClick={() => gate(g)}>{g}</Btn>)}
          <Btn active={field} onClick={() => setField(f => !f)}>{tx(t, "figPhBloch_field", "field along z")}</Btn>
          <Btn onClick={measure}>{tx(t, "figPhBloch_measure", "measure z")}</Btn>
          {!classical && <Btn onClick={hundred}>{tx(t, "figPhBloch_copies", "measure 100 copies")}</Btn>}
          <Btn onClick={() => { setV([0, 0, 1]); setHistory([]); setCopies(null); }}>{tx(t, "figPhBloch_reset", "reset to |0⟩")}</Btn>
        </Row>
        <Slider label="θ" value={deg(th)} min={0} max={180} step={1} onChange={d => { setV(fromAngles((d * Math.PI) / 180, ph)); setCopies(null); }} fmt={d => `${d}°`} />
        <Slider label="φ" value={deg(ph)} min={0} max={359} step={1} onChange={d => { setV(fromAngles(th, (d * Math.PI) / 180)); setCopies(null); }} fmt={d => `${d}°`} />
        <Row>
          <Readout color={C.sky}>{`P(0) = cos²(θ/2) = ${f2(a * a, 2)}`}</Readout>
          <Readout color={C.pink}>{`P(1) = ${f2(bMag * bMag, 2)}`}</Readout>
          {copies && <Readout color={C.amber}>{`${tx(t, "figPhBloch_of100", "100 copies")}: 0 → ${copies[0]}, 1 → ${copies[1]}`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhBloch_note", "Two complex numbers describe a spin ½, but only two angles matter once the total chance is 1 and the overall phase is dropped. θ, measured from the top, sets how the chances split between 0 (up) and 1 (down): cos²(θ/2) and sin²(θ/2). φ, the longitude, is the phase between the two parts; it does not change the z chances but changes everything else, as H shows. Press H at |0⟩: the arrow lands on the equator at |+⟩, an even mix, which is just spin up along x. Measure z a few times on fresh mixes: you get 0 or 1 at random, and the arrow jumps to the pole it found. One measurement gives one bit, never θ itself; the 100-copies button shows the chances emerging from many runs. Switch on the field: the arrow precesses about z at a fixed rate, like a spinning top; MRI scanners listen to exactly this motion of the protons in your body. Break it with a classical arrow: a measurement would read the height of the arrow, any number between −1 and 1. Nature only ever answers +1 or −1.")}>
      <div ref={vis.ref}>
        <svg ref={orbit.ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ touchAction: "none", cursor: "grab" }} {...orbit.handlers}>
          <circle cx={o.x} cy={o.y} r={R} fill={C.sky} opacity={0.05} stroke={C.axis} />
          <path d={equator.back} fill="none" stroke={C.axis} strokeDasharray="3 3" />
          <path d={meridian.back} fill="none" stroke={C.axis} strokeDasharray="3 3" />
          <path d={equator.front} fill="none" stroke={C.muted} strokeWidth={1.1} />
          <path d={meridian.front} fill="none" stroke={C.muted} strokeWidth={0.8} opacity={0.6} />
          {axes.map(([b, label, col], i) => {
            const q = p(scale(b, 1.18)), e = p(b);
            return (
              <g key={i}>
                <line x1={o.x} y1={o.y} x2={e.x} y2={e.y} stroke={C.axis} strokeWidth={0.8} />
                <circle cx={e.x} cy={e.y} r={2} fill={col} />
                <T x={q.x} y={q.y + 3} anchor="middle" size={9} color={col} bold={i < 2}>{label}</T>
              </g>
            );
          })}
          <line x1={tip.x} y1={tip.y} x2={drop.x} y2={drop.y} stroke={C.amber} strokeDasharray="3 3" />
          <circle cx={drop.x} cy={drop.y} r={3} fill={C.amber} />
          <Vec a={o} b={tip} color={C.amber} w={3} head={10} />
          <T x={12} y={18} size={8}>{tx(t, "figPhBloch_drag", "drag to turn the sphere")}</T>

          {/* the state as numbers */}
          <T x={BX} y={34} size={10} color={C.fg} bold>{"|ψ⟩ = α|0⟩ + β|1⟩"}</T>
          <T x={BX} y={56} size={9.5} color={C.sky}>{`α = cos(θ/2) = ${f2(a, 2)}`}</T>
          <T x={BX} y={74} size={9.5} color={C.pink}>{`β = ${f2(bMag, 2)} e^(i·${deg(ph)}°)`}</T>
          <T x={BX + 16} y={90} size={9} color={C.pink}>{`= ${f2(bMag * Math.cos(ph), 2)} ${bMag * Math.sin(ph) < 0 ? "−" : "+"} ${f2(Math.abs(bMag * Math.sin(ph)), 2)} i`}</T>
          {[["0", a * a, C.sky], ["1", bMag * bMag, C.pink]].map(([k, pr, col], i) => (
            <g key={k as string}>
              <T x={BX} y={124 + i * 22} size={9} color={col as string}>{`P(${k})`}</T>
              <rect x={BX + 34} y={115 + i * 22} width={BW - 34} height={11} rx={2} fill="none" stroke={C.axis} />
              <rect x={BX + 34} y={115 + i * 22} width={(BW - 34) * (pr as number)} height={11} rx={2} fill={col as string} opacity={0.7} />
            </g>
          ))}
          <T x={BX} y={186} size={8.5}>{classical ? tx(t, "figPhBloch_readC", "classical readings (any value)") : tx(t, "figPhBloch_read", "measurements so far")}</T>
          {history.map((h, i) => {
            const perRow = classical ? 4 : 8, x = BX + (i % perRow) * (classical ? 50 : 25), y = 206 + Math.floor(i / perRow) * 24;
            const col = classical ? C.amber : h === "0" ? C.sky : C.pink;
            return (
              <g key={i}>
                <rect x={x} y={y - 12} width={classical ? 44 : 20} height={17} rx={4} fill={col} opacity={0.18} />
                <T x={x + (classical ? 22 : 10)} y={y} anchor="middle" size={9.5} color={col} bold>{h}</T>
              </g>
            );
          })}
        </svg>
        {field && <Transport t={t} playing={playing} onPlay={() => setPlaying(q => !q)}
          readout={tx(t, "figPhBloch_prec", "precession about z")} />}
      </div>
    </Figure>
  );
}

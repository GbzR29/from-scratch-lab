"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// Light falls on a clean metal plate in a vacuum tube. Each photon carries
// E = hf = 1240 eV·nm / λ. If E is larger than the metal's work function W
// (the energy that holds an electron in), one electron comes out with up to
// E − W of kinetic energy; otherwise nothing happens, however bright the
// light. Brightness only sets how many photons arrive per second, so it sets
// the current, never the electrons' speed. Electrons fly to the right with a
// speed ∝ √(kinetic energy); the energy of each one is drawn at random below
// the maximum (electrons from deeper in the metal lose some on the way out).
// Right: Einstein's line, K_max = hf − W, slope h, with the current light.
// "break it: wave theory" uses the 19th-century picture: a wave's energy is
// set by its brightness, so electrons come out for any colour, after the
// plate has soaked up enough energy, with speeds that grow with brightness.

const W = 560, H = 230, PX = 168;                // plate x
const METALS = [["cs", "caesium", 2.1], ["na", "sodium", 2.28], ["zn", "zinc", 4.3]] as const;
type Metal = typeof METALS[number][0];
type E = { x: number; y: number; v: number; vy: number };
const GX0 = 358, GX1 = 548, GY0 = 30, GY1 = 196;  // graph box
const F0 = 0, F1 = 20;                            // ×10¹⁴ Hz
const K1 = 4;                                     // eV
const gx = (f: number) => GX0 + ((f - F0) / (F1 - F0)) * (GX1 - GX0);
const gy = (k: number) => GY1 - (k / K1) * (GY1 - GY0);

export function PhotoelectricFigure({ t }: { t?: TrackTranslations }) {
  const [metal, setMetal] = useState<Metal>("na");
  const [lam, setLam] = useState(400);
  const [bright, setBright] = useState(0.5);
  const [broken, setBroken] = useState(false);
  const [, setTick] = useState(0);
  const sim = useRef({ es: [] as E[], acc: 0, soak: 0, time: 0, rnd: mulberry32(7) });
  const vis = useVisible<HTMLDivElement>();

  const Wf = METALS.find(m => m[0] === metal)![2];
  const Eph = 1240 / lam;                         // eV
  const f = 2998 / lam;                           // ×10¹⁴ Hz
  const fCut = (Wf / 1240) * 2998;                // threshold frequency, ×10¹⁴ Hz
  const kMax = broken ? 0.3 + 2.6 * bright : Math.max(0, Eph - Wf);
  const emits = broken ? true : Eph > Wf;
  const rate = 40 * bright;                       // electrons per second on screen

  useFrame(vis.on, dt => {
    const s = sim.current;
    s.time += dt;
    if (emits) {
      if (broken) s.soak += dt * bright;          // the wave picture: energy builds up first
      if (!broken || s.soak > 0.9) {
        s.acc += dt * rate;
        while (s.acc >= 1) {
          s.acc -= 1;
          const k = kMax * Math.sqrt(s.rnd());
          s.es.push({ x: PX + 4, y: 50 + s.rnd() * 130, v: 30 + 95 * Math.sqrt(k), vy: (s.rnd() - 0.5) * 18 });
        }
      }
    }
    for (const e of s.es) { e.x += e.v * dt; e.y += e.vy * dt; }
    s.es = s.es.filter(e => e.x < 322);
    setTick(n => (n + 1) & 0xffff);
  });

  const reset = (fn: () => void) => { fn(); sim.current.es = []; sim.current.soak = 0; sim.current.acc = 0; };
  const col = lam < 380 ? C.purple : wavelengthCss(lam);
  const phase = sim.current.time % 1;

  return (
    <Figure title={tx(t, "figPhPe_title", "Light knocking electrons out of a metal")}
      head={<Btn active={broken} onClick={() => reset(() => setBroken(b => !b))}>{tx(t, "figPhPe_broken", "break it: wave theory")}</Btn>}
      controls={<>
        <Row>
          <Choice value={metal} onChange={m => reset(() => setMetal(m))} options={METALS.map(([k, name, w]) => [k, `${tx(t, `figPhPe_${k}`, name)} (W = ${tx(t, `figPhPe_w${k}`, String(w))} eV)`] as const)} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figPhPe_lam", "wavelength λ")} value={lam} min={150} max={700} step={5} onChange={setLam} fmt={v => `${f2(v, 0)} nm`} />
          <Slider label={tx(t, "figPhPe_bright", "brightness")} value={bright} min={0.05} max={1} step={0.05} onChange={setBright} fmt={v => `${f2(v * 100, 0)}%`} />
        </Sliders>
        <Row>
          <Readout color={C.amber}>{`${tx(t, "figPhPe_photon", "photon")}: E = 1240/λ = ${f2(Eph, 2)} eV`}</Readout>
          <Readout color={emits ? C.green : C.red}>{emits
            ? `K_max = ${broken ? "" : `${f2(Eph, 2)} − ${f2(Wf, 2)} = `}${f2(kMax, 2)} eV`
            : tx(t, "figPhPe_none", "below the threshold: no electrons")}</Readout>
          {emits && <Readout color={C.sky}>{`${tx(t, "figPhPe_stop", "stopping voltage")}: ${f2(kMax, 2)} V`}</Readout>}
          <Readout>{`${tx(t, "figPhPe_cut", "threshold")}: λ < ${f2(1240 / Wf, 0)} nm`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhPe_note", "Light shines on a metal plate in a vacuum and knocks electrons out of it. Change the colour first. With sodium, red and green light do nothing at all, however bright you make them; below about 540 nm electrons start to fly, and the bluer the light, the faster they go. Now change only the brightness: more electrons come out each second, but the fastest ones are exactly as fast as before. Einstein's explanation (1905): light arrives in packets, photons, each of energy hf. One photon gives all its energy to one electron. If hf is less than the work function W, the energy needed to pull an electron out, the electron stays in, and a million more photons do not help, since they cannot pool their energy. The graph on the right is the straight line K_max = hf − W: every metal has the same slope, Planck's constant h, and its own threshold. Break it to see what the wave theory of light predicted: electrons for any colour, after a delay while the plate soaks up energy, and faster electrons from brighter light. Experiments show none of that.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* lamp and beam */}
          <circle cx={30} cy={60} r={12} fill={col} opacity={0.25 + 0.6 * bright} />
          <circle cx={30} cy={60} r={6} fill={col} />
          {Array.from({ length: 7 }, (_, i) => {
            const u = (i + phase) / 7, x = 40 + u * (PX - 46), y = 64 + u * 50;
            return broken
              ? <path key={i} d={`M${x - 6},${y - 22} Q${x},${y - 12} ${x - 4},${y} T${x - 2},${y + 22}`} fill="none" stroke={col} strokeWidth={1.2 + 2 * bright} opacity={0.5} />
              : <path key={i} d={`M${x - 8},${y} q2,-4 4,0 t4,0 t4,0`} fill="none" stroke={col} strokeWidth={2} opacity={0.35 + 0.65 * bright} />;
          })}
          <T x={18} y={88} size={8}>{lam < 380 ? tx(t, "figPhPe_uv", "ultraviolet") : tx(t, "figPhPe_lamp", "lamp")}</T>
          {/* plate and collector */}
          <rect x={PX - 6} y={36} width={10} height={160} rx={2} fill="#9ca3af" />
          <T x={PX - 1} y={210} anchor="middle" size={8}>{tx(t, `figPhPe_${metal}`, METALS.find(m => m[0] === metal)![1])}</T>
          <rect x={318} y={36} width={6} height={160} rx={2} fill={C.axis} />
          <T x={321} y={210} anchor="middle" size={8}>{tx(t, "figPhPe_coll", "collector")}</T>
          {sim.current.es.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={2.6} fill={C.sky} />)}
          {broken && emits && sim.current.soak <= 0.9 && (
            <T x={PX + 12} y={120} size={8.5} color={C.red}>{`${tx(t, "figPhPe_soak", "soaking up energy")}… ${f2((sim.current.soak / 0.9) * 100, 0)}%`}</T>
          )}

          {/* Einstein's line */}
          <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="none" stroke={C.grid} />
          {[0, 1, 2, 3, 4].map(k => (
            <g key={k}>
              <line x1={GX0} y1={gy(k)} x2={GX1} y2={gy(k)} stroke={C.grid} strokeWidth={0.6} />
              <T x={GX0 - 4} y={gy(k) + 3} anchor="end" size={8}>{k}</T>
            </g>
          ))}
          {[0, 5, 10, 15, 20].map(v => <T key={v} x={gx(v)} y={GY1 + 11} anchor="middle" size={8}>{v}</T>)}
          {broken
            ? <line x1={gx(F0)} y1={gy(kMax)} x2={gx(F1)} y2={gy(kMax)} stroke={C.red} strokeWidth={1.8} strokeDasharray="6 3" />
            : METALS.map(([k, , w]) => {
              const fc = (w / 1240) * 2998, active = k === metal;
              const fEnd = Math.min(F1, fc + (K1 * 2998) / 1240);
              return <line key={k} x1={gx(fc)} y1={gy(0)} x2={gx(fEnd)} y2={gy(((fEnd - fc) * 1240) / 2998)}
                stroke={active ? C.green : C.muted} strokeWidth={active ? 2 : 1} opacity={active ? 1 : 0.5} />;
            })}
          {!broken && <circle cx={gx(fCut)} cy={gy(0)} r={3} fill={C.red} />}
          {f <= F1 && <circle cx={gx(f)} cy={gy(Math.min(K1, kMax))} r={4.5} fill={col} stroke="var(--code-bg)" strokeWidth={1.5} />}
          <T x={GX0 + 4} y={GY0 - 6} size={8}>{tx(t, "figPhPe_kaxis", "fastest electron, K_max (eV)")}</T>
          <T x={GX1} y={GY1 + 22} anchor="end" size={8}>{tx(t, "figPhPe_faxis", "frequency f (10^14 Hz)")}</T>
          {!broken && <T x={gx(fCut) + 4} y={gy(0) - 5} size={8} color={C.red}>{tx(t, "figPhPe_f0", "threshold")}</T>}
        </svg>
      </div>
    </Figure>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { wavelengthCss } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// A semiconductor's free carriers. Left: the band diagram, the valence band
// (full of bonding electrons) below, the conduction band above, the gap Eg
// between them drawn to scale. 40 dots show the MIX of free carriers:
// electrons (blue) in the conduction band and holes (pink) in the valence
// band, in the ratio n : p. The dashed line is the Fermi level E_F, where a
// state is half likely to be filled. "apply a voltage" makes electrons drift
// one way and holes the other: both carry current.
// Right: carrier densities against temperature on a log scale, from the
// standard formulas (constant gap, every dopant ionised):
//   nᵢ = √(Nc Nv) e^(−Eg/2kT),  Nc, Nv ∝ T^(3/2)
//   n − p = N_D − N_A,  n·p = nᵢ²
// With doping, the majority carriers stay at the doping level until nᵢ
// overtakes it at high temperature. Material data at 300 K (Sze): Nc, Nv in
// cm⁻³, mobilities in cm²/(V·s), gaps in eV. An LED's colour is ≈ 1240/Eg nm,
// for direct-gap materials only.

const W = 560, H = 262;
const KB = 8.617e-5, Q = 1.602e-19;
const MAT = {
  Ge: { eg: 0.66, nc: 1.04e19, nv: 6.0e18, mn: 3900, mp: 1900, atoms: 4.4e22, direct: false },
  Si: { eg: 1.12, nc: 2.8e19, nv: 1.04e19, mn: 1400, mp: 450, atoms: 5.0e22, direct: false },
  GaAs: { eg: 1.42, nc: 4.7e17, nv: 7.0e18, mn: 8500, mp: 400, atoms: 4.4e22, direct: true },
  GaN: { eg: 3.4, nc: 2.3e18, nv: 4.6e19, mn: 1000, mp: 200, atoms: 8.9e22, direct: true },
} as const;
type Mat = keyof typeof MAT;
type Dope = "none" | "n" | "p";

function carriers(m: (typeof MAT)[Mat], T: number, dope: Dope, N: number) {
  const s = (T / 300) ** 1.5, ni = Math.sqrt(m.nc * s * m.nv * s) * Math.exp(-m.eg / (2 * KB * T));
  if (dope === "none") return { ni, n: ni, p: ni };
  const maj = N / 2 + Math.sqrt((N * N) / 4 + ni * ni), min = (ni * ni) / maj;
  return dope === "n" ? { ni, n: maj, p: min } : { ni, n: min, p: maj };
}
const sci = (v: number) => {
  if (v < 1) return v.toPrecision(2);
  const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  return `${f2(m, 1)}e${e}`;
};

type Dot = { x: number; y: number; e: boolean };

export function SemiconductorFigure({ t }: { t?: TrackTranslations }) {
  const [mat, setMat] = useState<Mat>("Si");
  const [temp, setTemp] = useState(300);
  const [dope, setDope] = useState<Dope>("none");
  const [logN, setLogN] = useState(16);
  const [field, setField] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const m = MAT[mat], N = 10 ** logN;
  const c = carriers(m, temp, dope, N);
  const shareE = c.n / (c.n + c.p);

  // the 40 dots: rebuilt whenever the mix changes noticeably
  const nE = Math.round(40 * shareE);
  const dots = useRef<{ key: string; list: Dot[]; rnd: () => number }>({ key: "", list: [], rnd: mulberry32(4) });
  if (dots.current.key !== `${nE}`) {
    const r = dots.current.rnd;
    dots.current = { key: `${nE}`, rnd: r, list: Array.from({ length: 40 }, (_, i) => ({ x: r(), y: r(), e: i < nE })) };
  }
  useFrame(vis.on, dt => {
    const r = dots.current.rnd;
    for (const d of dots.current.list) {
      d.x += (r() - 0.5) * 0.02 + (field ? (d.e ? -1 : 1) * 0.12 * dt : 0);
      d.y = Math.min(1, Math.max(0, d.y + (r() - 0.5) * 0.02));
      d.x = (d.x + 1) % 1;
    }
    rerender();
  });

  // band diagram geometry: gap drawn to scale, 30 px per eV
  const DX0 = 18, DX1 = 238, gapPx = 18 + m.eg * 30, mid = 138;
  const cbY = mid - gapPx / 2, vbY = mid + gapPx / 2;
  const fermi = KB * temp * Math.log(c.n / c.ni);                      // E_F − midgap, eV
  const fy = mid - Math.max(-gapPx / 2 + 2, Math.min(gapPx / 2 - 2, fermi * 30));

  // log plot of densities against temperature
  const PX0 = 300, PX1 = 536, PY0 = 30, PY1 = 214, T0 = 200, T1 = 600, L0 = 0, L1 = 20;
  const px = (tt: number) => PX0 + ((tt - T0) / (T1 - T0)) * (PX1 - PX0);
  const py = (v: number) => PY1 - ((Math.log10(Math.max(1, v)) - L0) / (L1 - L0)) * (PY1 - PY0);
  const curves = useMemo(() => {
    let n = "", p = "", ni = "";
    for (let i = 0; i <= 80; i++) {
      const tt = T0 + (i / 80) * (T1 - T0), k = carriers(m, tt, dope, N), cmd = i ? "L" : "M";
      n += `${cmd}${px(tt).toFixed(1)},${py(k.n).toFixed(1)}`;
      p += `${cmd}${px(tt).toFixed(1)},${py(k.p).toFixed(1)}`;
      ni += `${cmd}${px(tt).toFixed(1)},${py(k.ni).toFixed(1)}`;
    }
    return { n, p, ni };
  }, [m, dope, N]);

  const sigma = Q * (c.n * m.mn + c.p * m.mp), rho = 1 / sigma;
  const lam = 1240 / m.eg;
  const perAtom = m.atoms / (c.n + c.p);

  return (
    <Figure title={tx(t, "figPhSemi_title", "Electrons and holes in a semiconductor")}
      controls={<>
        <Row>
          <Choice value={mat} onChange={setMat} options={(Object.keys(MAT) as Mat[]).map(k => [k, k] as const)} />
          <span className="w-3" />
          <Choice value={dope} onChange={setDope} options={[
            ["none", tx(t, "figPhSemi_pure", "pure")],
            ["n", tx(t, "figPhSemi_n", "n-type (donors)")],
            ["p", tx(t, "figPhSemi_p", "p-type (acceptors)")],
          ] as const} />
          <Btn active={field} onClick={() => setField(f => !f)}>{tx(t, "figPhSemi_field", "apply a voltage")}</Btn>
        </Row>
        <Slider label={tx(t, "figPhSemi_T", "temperature")} value={temp} min={T0} max={T1} step={5} onChange={setTemp} fmt={v => `${v} K`} width="w-28" />
        {dope !== "none" && <Slider label={tx(t, "figPhSemi_N", "dopant density")} value={logN} min={13} max={18} step={0.1} onChange={setLogN} fmt={v => `${sci(10 ** v)}`} width="w-28" />}
        <Row>
          <Readout color={C.sky}>{`n = ${sci(c.n)} cm⁻³`}</Readout>
          <Readout color={C.pink}>{`p = ${sci(c.p)} cm⁻³`}</Readout>
          <Readout>{`nᵢ = ${sci(c.ni)} cm⁻³`}</Readout>
          <Readout>{`${tx(t, "figPhSemi_rho", "resistivity")} ρ = ${sci(rho)} Ω·cm`}</Readout>
          <Readout>{`${tx(t, "figPhSemi_per", "one free carrier per")} ${sci(perAtom)} ${tx(t, "figPhSemi_atoms", "atoms")}`}</Readout>
          {m.direct
            ? <Readout color={lam >= 380 && lam <= 750 ? wavelengthCss(lam) : C.purple}>{`LED: 1240/Eg ≈ ${f2(lam, 0)} nm${lam > 750 ? ` (${tx(t, "figPhSemi_ir", "infrared")})` : lam < 380 ? ` (${tx(t, "figPhSemi_uv", "ultraviolet")})` : ""}`}</Readout>
            : <Readout color={C.muted}>{tx(t, "figPhSemi_indirect", "indirect gap: a poor light emitter")}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhSemi_note", "In a semiconductor at absolute zero, the valence band is exactly full and the conduction band exactly empty, so nothing can move: an insulator. Heat shakes a few electrons across the gap. Each leaves behind an empty place in the valence band, a hole, which behaves like a positive charge, because neighbouring electrons can shuffle into it. The number of such pairs depends on e^(−Eg/2kT): with kT = 0.026 eV at room temperature, a gap of 1.12 eV (silicon) gives only one free electron per several trillion atoms, and germanium's smaller gap gives thousands of times more. Raise the temperature and watch the curves climb steeply. Now dope the silicon: one phosphorus atom per million (5 × 10¹⁶ cm⁻³) brings an extra electron each, easily freed, and the electron density jumps millions of times: n-type. Boron brings one electron too few, so holes: p-type. The tiny minority density follows n·p = nᵢ². Apply a voltage and both carriers drift, electrons one way and holes the other. In direct-gap materials like GaAs and GaN, an electron falling across the gap emits a photon of energy Eg: that is an LED, and its colour is set by the gap.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* bands */}
          <rect x={DX0} y={30} width={DX1 - DX0} height={cbY - 30} fill={C.sky} opacity={0.12} />
          <rect x={DX0} y={vbY} width={DX1 - DX0} height={236 - vbY} fill={C.pink} opacity={0.12} />
          <line x1={DX0} y1={cbY} x2={DX1} y2={cbY} stroke={C.sky} strokeWidth={1.5} />
          <line x1={DX0} y1={vbY} x2={DX1} y2={vbY} stroke={C.pink} strokeWidth={1.5} />
          <T x={DX0 + 4} y={44} size={8} color={C.sky}>{tx(t, "figPhSemi_cb", "conduction band")}</T>
          <T x={DX0 + 4} y={230} size={8} color={C.pink}>{tx(t, "figPhSemi_vb", "valence band (bonds)")}</T>
          <T x={DX1 + 4} y={mid + 3} size={8}>{`Eg = ${m.eg} eV`}</T>
          <line x1={DX0} y1={fy} x2={DX1} y2={fy} stroke={C.amber} strokeDasharray="5 3" />
          <T x={DX1 + 4} y={fy - 6} size={8} color={C.amber}>E_F</T>
          {dope === "n" && <line x1={DX0 + 10} y1={cbY + 5} x2={DX1 - 10} y2={cbY + 5} stroke={C.green} strokeDasharray="2 4" />}
          {dope === "p" && <line x1={DX0 + 10} y1={vbY - 5} x2={DX1 - 10} y2={vbY - 5} stroke={C.green} strokeDasharray="2 4" />}
          {dots.current.list.map((d, i) => {
            const x = DX0 + 6 + d.x * (DX1 - DX0 - 12);
            return d.e
              ? <circle key={i} cx={x} cy={52 + d.y * (cbY - 60)} r={3.2} fill={C.sky} />
              : <circle key={i} cx={x} cy={vbY + 8 + d.y * (214 - vbY)} r={3.2} fill="none" stroke={C.pink} strokeWidth={1.6} />;
          })}
          {field && <T x={(DX0 + DX1) / 2} y={20} anchor="middle" size={8} color={C.fg}>{tx(t, "figPhSemi_drift", "− terminal on the right: electrons ← · holes →")}</T>}
          {!field && <T x={DX0} y={20} size={8}>{tx(t, "figPhSemi_mix", "40 dots = the mix of free carriers")}</T>}

          {/* densities against temperature */}
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
          <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
          {[0, 5, 10, 15, 20].map(e => (
            <g key={e}>
              <line x1={PX0} y1={py(10 ** e)} x2={PX1} y2={py(10 ** e)} stroke={C.grid} />
              <T x={PX0 - 4} y={py(10 ** e) + 3} anchor="end" size={7.5}>{`1e${e}`}</T>
            </g>
          ))}
          {[200, 300, 400, 500, 600].map(tt => <T key={tt} x={px(tt)} y={PY1 + 12} anchor="middle" size={7.5}>{`${tt}`}</T>)}
          <path d={curves.ni} fill="none" stroke={C.muted} strokeDasharray="4 3" />
          <path d={curves.p} fill="none" stroke={C.pink} strokeWidth={1.8} />
          <path d={curves.n} fill="none" stroke={C.sky} strokeWidth={1.8} />
          <line x1={px(temp)} y1={PY0} x2={px(temp)} y2={PY1} stroke={C.amber} strokeDasharray="2 3" />
          <circle cx={px(temp)} cy={py(c.n)} r={3.5} fill={C.sky} />
          <circle cx={px(temp)} cy={py(c.p)} r={3.5} fill={C.pink} />
          <T x={PX0} y={PY0 - 12} size={8}>{tx(t, "figPhSemi_plot", "free carriers per cm³ (log scale)")}</T>
          <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhSemi_Tax", "temperature (K)")}</T>
        </svg>
      </div>
    </Figure>
  );
}

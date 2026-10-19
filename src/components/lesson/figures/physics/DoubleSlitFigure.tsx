"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, Sliders, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { wavelengthCss, wavelengthRgb } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// Light of one wavelength falls on a barrier with 1, 2 or 5 slits. Behind the
// barrier, the field is computed exactly as Huygens said: every point of every
// opening sends out a circular wavelet e^(ikr)/√r, and the wavelets add up as
// waves (complex amplitudes). The picture shows the field at one instant,
// animated: bright = crest; the dark lines that stay dark are where waves
// from different slits always cancel. Drawn to scale: 1 px = 25 nm, so the
// slits are only a few wavelengths apart.
// The plot on the right is the pattern on a distant screen, by angle θ:
// I = (sin β / β)² · (sin Nα / (N sin α))², α = π d sin θ / λ, β = π a sin θ / λ.
// "break it: add brightness, not waves" adds the slits' intensities instead
// of their amplitudes, as if light were a stream of particles: the fringes
// disappear and only the broad single-slit hump is left.

const W = 560, H = 300;
const BAR = 64, FX0 = 66, FX1 = 404, NM = 25;        // barrier x, field x-range, nm per px
const CELL = 3, COLS = Math.floor((FX1 - FX0) / CELL), ROWS = Math.floor(H / CELL);
const PX0 = 420, PX1 = 548, TH_MAX = 60;

/** Screen y of an angle on the distant-screen plot. */
const Y = (thDeg: number) => H / 2 - (thDeg / TH_MAX) * (H / 2 - 14);

type Field = { re: Float32Array; im: Float32Array; inc: Float32Array; norm: number };

function computeField(slits: number, d: number, a: number, lam: number): Field {
  const k = (2 * Math.PI) / (lam / NM);                  // per px
  const pts: number[] = [];
  const dPx = d / NM, aPx = Math.max(a / NM, 1);
  const K = Math.max(1, Math.min(8, Math.round(aPx / 3)));
  for (let s = 0; s < slits; s++) {
    const yc = H / 2 + (s - (slits - 1) / 2) * dPx;
    for (let j = 0; j < K; j++) pts.push(yc + (K === 1 ? 0 : (j / (K - 1) - 0.5) * aPx));
  }
  const n = COLS * ROWS;
  const re = new Float32Array(n), im = new Float32Array(n), inc = new Float32Array(n);
  let norm = 0;
  for (let row = 0; row < ROWS; row++) {
    const y = row * CELL + CELL / 2;
    for (let col = 0; col < COLS; col++) {
      const x = FX0 + col * CELL + CELL / 2 - BAR;
      let sr = 0, si = 0, sq = 0;
      for (const py of pts) {
        const r = Math.hypot(x, y - py), w = 1 / Math.sqrt(r + 4);
        sr += w * Math.cos(k * r); si += w * Math.sin(k * r); sq += w * w;
      }
      const g = Math.sqrt(x + 12) / pts.length;          // keep the far side visible as the wavelets spread
      const i = row * COLS + col;
      re[i] = sr * g; im[i] = si * g; inc[i] = Math.sqrt(sq) * g * Math.sqrt(pts.length / slits);
      norm = Math.max(norm, Math.hypot(re[i], im[i]));
    }
  }
  return { re, im, inc, norm };
}

/** Far-field intensity at angle th (radians), normalised to 1 at the centre. */
function pattern(th: number, slits: number, d: number, a: number, lam: number, incoherent: boolean) {
  const s = Math.sin(th);
  const b = (Math.PI * a * s) / lam, al = (Math.PI * d * s) / lam;
  const env = Math.abs(b) < 1e-9 ? 1 : (Math.sin(b) / b) ** 2;
  if (incoherent || slits === 1) return env;
  const sa = Math.sin(al);
  const arr = Math.abs(sa) < 1e-9 ? 1 : (Math.sin(slits * al) / (slits * sa)) ** 2;
  return env * arr;
}

export function DoubleSlitFigure({ t }: { t?: TrackTranslations }) {
  const [slits, setSlits] = useState<"1" | "2" | "5">("2");
  const [lam, setLam] = useState(600);
  const [d, setD] = useState(1500);
  const [a, setA] = useState(200);
  const [broken, setBroken] = useState(false);
  const [phase, setPhase] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const vis = useVisible<HTMLDivElement>();
  const N = Number(slits);

  const field = useMemo(() => computeField(N, d, a, lam), [N, d, a, lam]);
  useFrame(vis.on, dt => setPhase(p => (p + dt * 2.2 * Math.PI * 0.6) % (2 * Math.PI)));

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(COLS, ROWS);
    const [cr, cg, cb] = wavelengthRgb(lam);
    const c = Math.cos(phase), s = Math.sin(phase);
    for (let i = 0; i < COLS * ROWS; i++) {
      const amp = Math.hypot(field.re[i], field.im[i]);
      let v: number;
      if (broken) v = Math.min(1, (field.inc[i] / field.norm) ** 2 * 0.9);
      else {
        const inst = field.re[i] * c + field.im[i] * s;           // Re(A e^(−iωt))
        v = ((inst + amp) / 2 / field.norm) * 1.3;
      }
      v = Math.min(1, v);
      img.data[4 * i] = cr * v; img.data[4 * i + 1] = cg * v; img.data[4 * i + 2] = cb * v; img.data[4 * i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [field, phase, broken, lam]);

  // the distant screen
  const curve = useMemo(() => {
    let p = "";
    for (let k = 0; k <= 400; k++) {
      const th = -TH_MAX + (2 * TH_MAX * k) / 400;
      const I = pattern((th * Math.PI) / 180, N, d, a, lam, broken);
      p += `${k ? "L" : "M"}${(PX0 + (PX1 - PX0) * I).toFixed(1)},${Y(th).toFixed(1)}`;
    }
    return p;
  }, [N, d, a, lam, broken]);
  const strip = useMemo(() => Array.from({ length: 90 }, (_, k) => {
    const th = -TH_MAX + (2 * TH_MAX * (k + 0.5)) / 90;
    return { th, I: pattern((th * Math.PI) / 180, N, d, a, lam, broken) };
  }), [N, d, a, lam, broken]);

  const col = wavelengthCss(lam);
  const first = N > 1 && lam < d ? (Math.asin(lam / d) * 180) / Math.PI : null;
  const dark1 = lam < a ? (Math.asin(lam / a) * 180) / Math.PI : null;
  const slitYs = Array.from({ length: N }, (_, s) => H / 2 + (s - (N - 1) / 2) * (d / NM));
  const aPx = Math.max(a / NM, 1.5);

  return (
    <Figure title={tx(t, "figPhSlit_title", "Light through slits: Young's experiment")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhSlit_broken", "break it: add brightness, not waves")}</Btn>}
      controls={<>
        <Row>
          <Choice value={slits} onChange={setSlits} options={[["1", tx(t, "figPhSlit_one", "one slit")], ["2", tx(t, "figPhSlit_two", "two slits")], ["5", tx(t, "figPhSlit_five", "five slits (a grating)")]]} />
        </Row>
        <Sliders>
          <Slider label={tx(t, "figPhSlit_lam", "wavelength λ")} value={lam} min={400} max={700} step={10} onChange={setLam} fmt={v => `${f2(v, 0)} nm`} />
          {N > 1 && <Slider label={tx(t, "figPhSlit_d", "slit spacing d")} value={d} min={600} max={3500} step={50} onChange={setD} fmt={v => `${f2(v / 1000, 2)} µm`} />}
          <Slider label={tx(t, "figPhSlit_a", "slit width a")} value={a} min={50} max={1500} step={25} onChange={setA} fmt={v => `${f2(v / 1000, 2)} µm`} />
        </Sliders>
        <Row>
          {first !== null && <Readout color={C.amber}>{`${tx(t, "figPhSlit_first", "first bright fringe")}: sin θ = λ/d → ${f2(first, 1)}°`}</Readout>}
          {dark1 !== null && <Readout color={C.sky}>{`${tx(t, "figPhSlit_dark", "single-slit dark band")}: sin θ = λ/a → ${f2(dark1, 1)}°`}</Readout>}
          {first !== null && <Readout>{`${tx(t, "figPhSlit_screen", "on a screen 1 m away")}: ${f2(Math.tan((first * Math.PI) / 180) * 100, 1)} cm`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhSlit_note", "Light comes in from the left as straight wavefronts. Each slit becomes a source of circular waves, and behind the barrier the waves from the two slits overlap. Where a crest from one meets a crest from the other they add up; where a crest meets a trough they cancel, and those lines stay dark however the waves move. On a distant screen this gives bright and dark fringes, plotted on the right by angle: the bright ones where the path difference d sin θ is a whole number of wavelengths. Make the wavelength longer, red, or the slits closer together, and the fringes spread out; blue light packs them closer. Switch to five slits: the bright fringes stay in the same places but become much sharper, which is how a grating sorts light into its colours. With one slit there are no fringes, only a central band that gets wider as the slit gets narrower: diffraction. Now break it by adding the brightness of each slit instead of the waves, as if light were made of little pellets: the fringes vanish. They are the signature of waves.")}>
      <div ref={vis.ref} className="relative">
        <canvas ref={canvas} width={COLS} height={ROWS} className="absolute"
          style={{ left: `${(FX0 / W) * 100}%`, top: 0, width: `${((COLS * CELL) / W) * 100}%`, height: `${((ROWS * CELL) / H) * 100}%` }} />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto relative">
          {/* incoming wavefronts */}
          {Array.from({ length: 6 }, (_, i) => {
            const x = 6 + (i - 1 + phase / (2 * Math.PI)) * (lam / NM);
            if (x < 4 || x > BAR - 6) return null;
            return <line key={i} x1={x} y1={20} x2={x} y2={H - 20} stroke={col} strokeOpacity={0.7} strokeWidth={1.5} />;
          })}
          {/* barrier with slits */}
          <rect x={BAR - 3} y={0} width={6} height={H} fill={C.fg} />
          {slitYs.map((y, i) => <rect key={i} x={BAR - 4} y={y - aPx / 2} width={8} height={aPx} fill="#000" />)}
          {/* distant screen pattern */}
          <rect x={PX0 - 12} y={0} width={8} height={H} fill="#000" />
          {strip.map((s, i) => (
            <rect key={i} x={PX0 - 12} y={Y(s.th) - (H - 28) / 180} width={8} height={(H - 28) / 90 + 0.6} fill={col} opacity={Math.min(1, s.I * 1.1)} />
          ))}
          <line x1={PX0} y1={10} x2={PX0} y2={H - 10} stroke={C.axis} />
          <path d={curve} fill="none" stroke={col} strokeWidth={1.8} />
          {[-45, -30, -15, 0, 15, 30, 45].map(th => (
            <g key={th}>
              <line x1={PX0 - 3} y1={Y(th)} x2={PX0} y2={Y(th)} stroke={C.axis} />
              <T x={PX1} y={Y(th) + 3} anchor="end" size={7.5}>{`${th}°`}</T>
            </g>
          ))}
          <T x={PX0 + 2} y={10} size={8}>{tx(t, "figPhSlit_far", "distant screen")}</T>
          <T x={FX0 + 4} y={H - 6} size={8} color="#ccc">{tx(t, "figPhSlit_scale", "1 px = 25 nm")}</T>
        </svg>
      </div>
    </Figure>
  );
}

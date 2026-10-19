"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, Vec, Handle, useDrag, f2, clamp } from "@/components/lesson/kit/figure";
import { rgbCss, spectrumRgb, wavelengthCss } from "./spectrum";

// ── What this figure shows ────────────────────────────────────────────────────
// A soap film standing in a wire loop. Gravity drains it, so it is thinnest at
// the top (0 nm) and thickest at the bottom (1 200 nm). White light reflects
// off its front and back faces; the two reflections interfere. At normal
// incidence their phase difference is δ = 4πnt/λ + π: the extra trip 2nt
// through the film, plus half a wave because the front reflection (air →
// soap, into the slower material) flips the wave over while the back one
// (soap → air) does not. The reflected power at each wavelength goes as
// 1 − cos(4πnt/λ), and the colour drawn is that spectrum seen by the eye
// (CIE 1931). The thinnest film is black: the two reflections cancel.
// "break it: forget the flip" drops the half wave: the top of the film would
// then shine white, which is not what soap films do just before they burst.

const W = 560, H = 300;
const FX = 30, FW = 120, FY0 = 20, FY1 = 280, TMAX = 1200;
const SX0 = 345, SX1 = 548, SY0 = 60, SY1 = 230;

const reflect = (l: number, n: number, th: number, flip: boolean) =>
  (1 - (flip ? 1 : -1) * Math.cos((4 * Math.PI * n * th) / l)) / 2;

/** Visible wavelengths (nm) the two reflections reinforce and cancel, for path difference 2nt. */
function fringes(path: number, flip: boolean) {
  const bright: number[] = [], dark: number[] = [];
  for (let m = 0; m < 12; m++) {
    const half = path / (m + 0.5), whole = m > 0 ? path / m : Infinity;
    const lb = flip ? half : whole, ld = flip ? whole : half;
    if (lb >= 400 && lb <= 700) bright.push(lb);
    if (ld >= 400 && ld <= 700) dark.push(ld);
  }
  return { bright, dark };
}

export function ThinFilmFigure({ t }: { t?: TrackTranslations }) {
  const [n, setN] = useState(1.33);
  const [th, setTh] = useState(300);
  const [broken, setBroken] = useState(false);
  const flip = !broken;
  const ty = (v: number) => FY0 + ((FY1 - FY0) * v) / TMAX;

  const drag = useDrag<number>(
    p => (p.x > FX - 15 && p.x < FX + FW + 25 ? 0 : null),
    (_, p) => setTh(clamp(((p.y - FY0) / (FY1 - FY0)) * TMAX, 0, TMAX)),
  );

  const bands = useMemo(() => Array.from({ length: 130 }, (_, i) => {
    const v = ((i + 0.5) * TMAX) / 130;
    return rgbCss(spectrumRgb(l => 1.4 * reflect(l, n, v, flip)));
  }), [n, flip]);
  const here = rgbCss(spectrumRgb(l => 1.4 * reflect(l, n, th, flip)));

  // which visible wavelengths are reinforced and which cancelled
  const path = 2 * n * th;
  const { bright, dark } = fringes(path, flip);

  const X = (l: number) => SX0 + ((SX1 - SX0) * (l - 400)) / 300;
  const Ys = (v: number) => SY1 - (SY1 - SY0) * v;
  const curve = Array.from({ length: 101 }, (_, i) => 400 + 3 * i)
    .map((l, i) => `${i ? "L" : "M"}${X(l).toFixed(1)},${Ys(reflect(l, n, th, flip)).toFixed(1)}`).join("");

  // side view of the film at the chosen point
  const DX = 196, DW = 120, FT = 16 + 44 * (th / TMAX), DY = 150 - FT / 2;

  return (
    <Figure title={tx(t, "figPhFilm_title", "Colours of a soap film")}
      head={<Btn active={broken} onClick={() => setBroken(b => !b)}>{tx(t, "figPhFilm_broken", "break it: forget the flip")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhFilm_t", "thickness t")} value={th} min={0} max={TMAX} step={5} onChange={setTh} fmt={v => `${f2(v, 0)} nm`} />
          <Slider label={tx(t, "figPhFilm_n", "film index n")} value={n} min={1.2} max={1.6} step={0.01} onChange={setN} fmt={v => f2(v, 2)} />
        </Sliders>
        <Row>
          <Readout>{`2nt = ${f2(path, 0)} nm`}</Readout>
          <Readout color={C.green}>{`${tx(t, "figPhFilm_bright", "reinforced")}: ${bright.length ? bright.map(l => `${f2(l, 0)} nm`).join(", ") : "—"}`}</Readout>
          <Readout color={C.red}>{`${tx(t, "figPhFilm_dark", "cancelled")}: ${dark.length ? dark.map(l => `${f2(l, 0)} nm`).join(", ") : "—"}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhFilm_note", "Drag along the film to pick a thickness. Light bounces off the film's front face and its back face, and the second reflection has travelled an extra 2nt through the soap. The front reflection also flips the wave over, half a wavelength, because it happens going into the slower material; the back one does not. The two reflections reinforce the wavelengths for which 2nt is a whole number of wavelengths plus a half, and cancel those for which it is a whole number. White light minus a few colours is a colour: the bands of a soap bubble. At the very top, where the film is far thinner than any wavelength, the path difference is nothing and the flip alone makes the two reflections cancel for every colour: the film turns black, just before it bursts. Lower down, thick film reinforces and cancels so many wavelengths that the colours wash out to white. Now break it by forgetting the flip: the thinnest film would shine brightest. Real soap films go black, which shows the flip is real.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* the film, as reflected light on a dark background */}
        <rect x={FX - 6} y={FY0 - 6} width={FW + 12} height={FY1 - FY0 + 12} rx={8} fill="#000" stroke={C.fg} strokeWidth={2} />
        {bands.map((c, i) => <rect key={i} x={FX} y={FY0 + (i * (FY1 - FY0)) / 130} width={FW} height={(FY1 - FY0) / 130 + 0.5} fill={c} />)}
        <line x1={FX - 8} y1={ty(th)} x2={FX + FW + 14} y2={ty(th)} stroke={C.amber} strokeWidth={1.5} />
        <Handle x={FX + FW + 16} y={ty(th)} color={C.amber} r={4} active={drag.dragging === 0} />
        <T x={FX + FW / 2} y={10} anchor="middle" size={8}>0 nm</T>
        <T x={FX + FW / 2} y={H - 4} anchor="middle" size={8}>{`${TMAX} nm`}</T>
        {/* side view */}
        <rect x={DX} y={DY} width={DW} height={FT} fill={C.sky} opacity={0.25} stroke={C.sky} />
        <Vec a={{ x: DX + 18, y: 50 }} b={{ x: DX + 44, y: DY }} color={C.fg} w={1.6} />
        <Vec a={{ x: DX + 44, y: DY }} b={{ x: DX + 70, y: 50 }} color={C.amber} w={1.6} />
        <line x1={DX + 44} y1={DY} x2={DX + 60} y2={DY + FT} stroke={C.fg} strokeOpacity={0.6} />
        <line x1={DX + 60} y1={DY + FT} x2={DX + 76} y2={DY} stroke={C.green} strokeOpacity={0.8} />
        <Vec a={{ x: DX + 76, y: DY }} b={{ x: DX + 102, y: 50 }} color={C.green} w={1.6} />
        <T x={DX} y={DY + FT + 14} size={7.5} color={C.amber}>{`${tx(t, "figPhFilm_front", "front")}: ${broken ? tx(t, "figPhFilm_noFlip", "no flip (broken)") : tx(t, "figPhFilm_flip", "flips: +½λ")}`}</T>
        <T x={DX} y={DY + FT + 26} size={7.5} color={C.green}>{`${tx(t, "figPhFilm_backFace", "back")}: ${tx(t, "figPhFilm_back", "no flip, +2nt")}`}</T>
        <T x={DX + DW / 2} y={DY + FT + 44} anchor="middle" size={8}>{`t = ${f2(th, 0)} nm`}</T>
        <rect x={DX + 20} y={H - 50} width={80} height={26} rx={4} fill={here} stroke={C.fg} strokeWidth={1} />
        <T x={DX + 60} y={H - 10} anchor="middle" size={8}>{tx(t, "figPhFilm_seen", "colour seen")}</T>
        {/* reflected spectrum */}
        {Array.from({ length: 30 }, (_, i) => {
          const l = 400 + i * 10 + 5;
          return <rect key={i} x={X(l - 5)} y={Ys(reflect(l, n, th, flip))} width={X(l + 5) - X(l - 5) + 0.5} height={SY1 - Ys(reflect(l, n, th, flip))} fill={wavelengthCss(l)} opacity={0.55} />;
        })}
        <path d={curve} fill="none" stroke={C.fg} strokeWidth={1.4} />
        <line x1={SX0} y1={SY1} x2={SX1} y2={SY1} stroke={C.axis} />
        <line x1={SX0} y1={SY0} x2={SX0} y2={SY1} stroke={C.axis} />
        {[400, 500, 600, 700].map(l => <T key={l} x={X(l)} y={SY1 + 13} anchor="middle" size={8}>{`${l}`}</T>)}
        <T x={SX1} y={SY1 + 26} anchor="end" size={8}>{tx(t, "figPhFilm_lam", "wavelength (nm)")}</T>
        <T x={SX0} y={SY0 - 10} size={8.5} color={C.fg}>{tx(t, "figPhFilm_spec", "light reflected, by wavelength")}</T>
      </svg>
    </Figure>
  );
}

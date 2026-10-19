"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, Sliders, C, T, Vec, Handle, useDrag, f2, clamp } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A thin lens of focal length f (negative for a diverging lens) and an object
// arrow whose tip can be dragged. Each ray is bent at the lens by the
// thin-lens rule: its slope changes by −h/f, where h is the height at which
// it crosses the lens. That rule alone makes the three classic rays (parallel
// → through the far focus; through the centre → straight on; through the near
// focus → parallel) and puts the image where 1/d_o + 1/d_i = 1/f says.
// Rays that diverge after the lens are traced back (dashed) to a virtual
// image. "cover the top half" blocks every ray that would cross the upper
// half of the lens: the image is still whole, just dimmer. 1 px = 1 mm.

const W = 560, H = 300;
const LX = 300, AY = 150, LENS_H = 115;

type Ray = { h: number; blocked: boolean };

export function LensFigure({ t }: { t?: TrackTranslations }) {
  const [f, setF] = useState(100);
  const [tip, setTip] = useState({ x: 120, h: 55 });
  const [cover, setCover] = useState(false);

  const drag = useDrag<number>(
    p => (Math.hypot(p.x - tip.x, p.y - (AY - tip.h)) < 22 ? 0 : null),
    (_, p) => {
      let h = clamp(AY - p.y, -95, 95);
      if (Math.abs(h) < 12) h = h < 0 ? -12 : 12;
      setTip({ x: clamp(p.x, 15, LX - 12), h });
    },
  );
  const fSafe = Math.abs(f) < 10 ? (f < 0 ? -10 : 10) : f;

  const dO = LX - tip.x;                                     // object distance (px = mm)
  const atInf = Math.abs(dO - fSafe) < 0.5;
  const dI = atInf ? Infinity : 1 / (1 / fSafe - 1 / dO);
  const hI = atInf ? 0 : (-tip.h * dI) / dO;
  const real = dI > 0 && Number.isFinite(dI);
  const mag = atInf ? Infinity : -dI / dO;

  // a ray from the tip through the lens at height h, then bent: slope_out = slope_in − h/f
  const trace = (h: number) => {
    const sIn = (h - tip.h) / dO, sOut = sIn - h / fSafe;
    const at = (x: number) => ({ x, y: AY - (h + sOut * (x - LX)) });
    return { lens: { x: LX, y: AY - h }, out: at(W - 5), back: at(Math.max(5, LX - 280)), sOut };
  };
  const principal: Ray[] = [
    { h: tip.h, blocked: false },
    { h: 0, blocked: false },
    ...(Math.abs(dO - fSafe) > 1 ? [{ h: (-tip.h * fSafe) / (dO - fSafe), blocked: false }] : []),
  ].filter(r => Math.abs(r.h) <= LENS_H).map(r => ({ ...r, blocked: cover && r.h > 0 }));
  const fan: Ray[] = cover ? Array.from({ length: 11 }, (_, i) => -LENS_H + 8 + (i * (2 * LENS_H - 16)) / 10).map(h => ({ h, blocked: h > 0 })) : [];
  const colours = [C.amber, C.green, C.sky];
  const brightness = cover ? 0.5 : 1;

  const ray = (r: Ray, i: number, colour: string, thin = false) => {
    const tr = trace(r.h);
    return (
      <g key={`${thin ? "f" : "p"}${i}`} opacity={thin ? 0.55 : 1}>
        <line x1={tip.x} y1={AY - tip.h} x2={tr.lens.x} y2={tr.lens.y} stroke={colour} strokeWidth={thin ? 1 : 1.8} />
        {!r.blocked && <line x1={tr.lens.x} y1={tr.lens.y} x2={tr.out.x} y2={tr.out.y} stroke={colour} strokeWidth={thin ? 1 : 1.8} />}
        {!r.blocked && !real && !thin && <line x1={tr.lens.x} y1={tr.lens.y} x2={tr.back.x} y2={tr.back.y} stroke={colour} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.7} />}
      </g>
    );
  };

  const lensPath = f > 0
    ? `M${LX},${AY - LENS_H} Q${LX + 16},${AY} ${LX},${AY + LENS_H} Q${LX - 16},${AY} ${LX},${AY - LENS_H} Z`
    : `M${LX - 9},${AY - LENS_H} L${LX + 9},${AY - LENS_H} Q${LX + 1},${AY} ${LX + 9},${AY + LENS_H} L${LX - 9},${AY + LENS_H} Q${LX - 1},${AY} ${LX - 9},${AY - LENS_H} Z`;
  const showImage = !atInf && Math.abs(hI) < 400 && LX + dI > -50 && LX + dI < W + 400;
  const kind = atInf ? tx(t, "figPhLens_inf", "no image: the rays leave parallel")
    : `${real ? tx(t, "figPhLens_real", "real") : tx(t, "figPhLens_virtual", "virtual")}, ${mag < 0 ? tx(t, "figPhLens_inverted", "inverted") : tx(t, "figPhLens_upright", "upright")}, ${Math.abs(mag) > 1 ? tx(t, "figPhLens_bigger", "magnified") : tx(t, "figPhLens_smaller", "smaller")}`;

  return (
    <Figure title={tx(t, "figPhLens_title", "A thin lens and the image it forms")}
      head={<Btn active={cover} onClick={() => setCover(c => !c)}>{tx(t, "figPhLens_cover", "cover the top half of the lens")}</Btn>}
      controls={<>
        <Sliders>
          <Slider label={tx(t, "figPhLens_f", "focal length f")} value={f} min={-150} max={150} step={5} onChange={setF} fmt={v => `${f2(v / 10, 1)} cm`} />
        </Sliders>
        <Row>
          <Readout>{`d_o = ${f2(dO / 10, 1)} cm`}</Readout>
          <Readout color={C.purple}>{atInf ? "d_i = ∞" : `d_i = ${f2(dI / 10, 1)} cm`}</Readout>
          <Readout color={C.green}>{atInf ? "m = ∞" : `m = −d_i/d_o = ${f2(mag, 2)}`}</Readout>
          <Readout>{`P = 1/f = ${f2(1000 / fSafe, 1)} D`}</Readout>
          <Readout color={real ? C.fg : C.muted}>{kind}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhLens_note", "Drag the tip of the object arrow. Three rays from the tip are easy to follow: the amber one leaves parallel to the axis and is bent through the focal point on the far side; the green one goes through the centre of the lens without bending; the blue one passes through the near focal point and leaves parallel. Where they meet, the image forms, here a real, inverted image you could catch on a sheet of paper, purple. Move the object towards the lens: the image moves away and grows. At exactly one focal length the rays leave parallel and there is no image. Closer still, the rays spread out after the lens; traced back, dashed, they seem to come from a larger, upright, virtual image behind the object: a magnifying glass. Make f negative for a diverging lens: the image is always virtual, upright and smaller, as through the glasses of a short-sighted person. Now cover the top half of the lens. You might expect half the image to vanish, but every point of the lens receives light from every point of the object: the image stays whole, only dimmer.")}>
      <svg ref={drag.ref} {...drag.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={0} y1={AY} x2={W} y2={AY} stroke={C.axis} />
        <path d={lensPath} fill={C.sky} fillOpacity={0.18} stroke={C.sky} strokeWidth={1.4} />
        {cover && <rect x={LX - 14} y={AY - LENS_H - 4} width={28} height={LENS_H + 4} fill={C.fg} opacity={0.85} />}
        {[-1, 1].map(sd => (
          <g key={sd}>
            <circle cx={LX + sd * fSafe} cy={AY} r={3} fill={C.fg} />
            <T x={LX + sd * fSafe} y={AY + 16} anchor="middle" size={8.5} color={C.fg}>{sd === 1 ? "F′" : "F"}</T>
          </g>
        ))}
        {fan.map((r, i) => ray(r, i, C.muted, true))}
        {principal.map((r, i) => ray(r, i, colours[i]))}
        <Vec a={{ x: tip.x, y: AY }} b={{ x: tip.x, y: AY - tip.h }} color={C.fg} w={3} head={9} />
        <Handle x={tip.x} y={AY - tip.h} color={C.amber} r={4} active={drag.dragging === 0} />
        {showImage && (
          <Vec a={{ x: LX + dI, y: AY }} b={{ x: LX + dI, y: AY - hI }} color={C.purple} w={3} head={9} dash={real ? undefined : "4 3"} opacity={brightness} />
        )}
        <T x={10} y={18} size={8.5}>{tx(t, "figPhLens_key", "1 px = 1 mm · drag the tip of the arrow")}</T>
      </svg>
    </Figure>
  );
}

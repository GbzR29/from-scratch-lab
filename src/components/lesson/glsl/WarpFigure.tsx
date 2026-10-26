"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, Slider, Sliders, T, C, hash2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// 32 × 24 pixels of a fragment shader, cut into warps the way the GPU runs
// them: 4 × 8 pixels (32 lanes, the block measured on an NVIDIA RTX 4060 in
// the next figure) or 8 × 8 (64 lanes). A warp issues one instruction at a
// time for all its lanes, so:
// - "if / else": a warp whose lanes disagree runs both paths, one after the
//   other, and pays the cost of both;
// - "loop": a warp keeps looping until its slowest lane is done. The step
//   counts are a real sphere-tracing run (a ball on a floor) for each pixel.
// Tap a warp to read its cost.

const COLS = 32, ROWS = 24, S = 12, M = 8;
const W = M * 2 + COLS * S, H = M * 2 + ROWS * S;
const MAX_STEPS = 64;

type Mode = "branch" | "loop";
type Cond = "uniform" | "circle" | "stripes" | "noise";
type Shape = "4x8" | "8x8";
const SHAPES: Record<Shape, [number, number]> = { "4x8": [4, 8], "8x8": [8, 8] };

// Sphere tracing a ball (r 0.9) on a floor (y = −1), one ray per pixel: the step count
function marchSteps(i: number, j: number) {
  const px = (2 * (i + 0.5) - COLS) / ROWS, py = (2 * (j + 0.5) - ROWS) / ROWS;
  const ro = [0, 0.35, -3.4];
  const len = Math.hypot(px, py - 0.1, 1.7);
  const rd = [px / len, (py - 0.1) / len, 1.7 / len];
  let t = 0;
  for (let k = 1; k <= MAX_STEPS; k++) {
    const x = ro[0] + rd[0] * t, y = ro[1] + rd[1] * t, z = ro[2] + rd[2] * t;
    const h = Math.min(y + 1, Math.hypot(x, y, z) - 0.9);
    if (h < 0.001 * Math.max(t, 1)) return k;
    t += h;
    if (t > 40) return k;
  }
  return MAX_STEPS;
}
const STEPS = Array.from({ length: COLS * ROWS }, (_, n) => marchSteps(n % COLS, Math.floor(n / COLS)));

// The raymarching chapter's heat map: blue → green → red
const heat = (x: number) => {
  const c = (k: number) => Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(4 * x - k))));
  return `rgb(${c(3)},${c(2)},${c(1)})`;
};

export function WarpFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("branch");
  const [cond, setCond] = useState<Cond>("circle");
  const [shape, setShape] = useState<Shape>("4x8");
  const [stripe, setStripe] = useState(2);
  const [costA, setCostA] = useState(40);
  const [costB, setCostB] = useState(8);
  const [sel, setSel] = useState<[number, number]>([2, 2]);

  const [ww, wh] = SHAPES[shape];
  const nwx = COLS / ww, nwy = ROWS / wh, lanes = ww * wh;

  // Does pixel (i, j) take path A? (j counts upwards, like gl_FragCoord.y)
  const takesA = (i: number, j: number) => {
    if (cond === "uniform") return true;
    if (cond === "circle") return Math.hypot(i + 0.5 - 16, j + 0.5 - 12) < 8.5;
    if (cond === "stripes") return Math.floor(i / stripe) % 2 === 0;
    return hash2(i, j, 7) < 0.5;
  };

  const warps = useMemo(() => {
    const out: { wx: number; wy: number; nA: number; maxS: number; sumS: number; cost: number; own: number }[] = [];
    for (let wy = 0; wy < nwy; wy++) for (let wx = 0; wx < nwx; wx++) {
      let nA = 0, maxS = 0, sumS = 0;
      for (let b = 0; b < wh; b++) for (let a = 0; a < ww; a++) {
        const i = wx * ww + a, j = wy * wh + b;
        if (takesA(i, j)) nA++;
        const s = STEPS[j * COLS + i]; maxS = Math.max(maxS, s); sumS += s;
      }
      const nB = lanes - nA;
      const cost = mode === "loop" ? maxS : (nA ? costA : 0) + (nB ? costB : 0);
      const own = mode === "loop" ? sumS : nA * costA + nB * costB;      // lane-work actually needed
      out.push({ wx, wy, nA, maxS, sumS, cost, own });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cond, shape, stripe, costA, costB]);

  const paid = warps.reduce((s, w) => s + w.cost * lanes, 0);
  const needed = warps.reduce((s, w) => s + w.own, 0);
  const diverged = warps.filter(w => mode === "branch" ? w.nA > 0 && w.nA < lanes : w.maxS * lanes > w.sumS).length;
  const sw = warps.find(w => w.wx === Math.min(sel[0], nwx - 1) && w.wy === Math.min(sel[1], nwy - 1)) ?? warps[0];

  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const i = Math.floor((x - M) / S), j = ROWS - 1 - Math.floor((y - M) / S);
    if (i >= 0 && i < COLS && j >= 0 && j < ROWS) setSel([Math.floor(i / ww), Math.floor(j / wh)]);
  };

  const px = (i: number) => M + i * S, py = (j: number) => M + (ROWS - j) * S;   // j = row from the bottom

  const warpLine = mode === "loop"
    ? `${tx(t, "figWarp_selLoop", "this warp")}: ${tx(t, "figWarp_lanesStop", "its lanes need")} ${Math.min(...lanesOf(sw, ww, wh).map(([i, j]) => STEPS[j * COLS + i]))}–${sw.maxS} ${tx(t, "figWarp_steps", "steps")} → ${tx(t, "figWarp_allRun", "all")} ${lanes} ${tx(t, "figWarp_lanesRun", "lanes run")} ${sw.maxS}`
    : sw.nA === 0 || sw.nA === lanes
      ? `${tx(t, "figWarp_selLoop", "this warp")}: ${tx(t, "figWarp_agree", "all")} ${lanes} ${tx(t, "figWarp_lanesTake", "lanes take")} ${sw.nA ? "A" : "B"} → ${sw.cost}`
      : `${tx(t, "figWarp_selLoop", "this warp")}: ${sw.nA} ${tx(t, "figWarp_takeA", "lanes want A")}, ${lanes - sw.nA} ${tx(t, "figWarp_wantB", "want B")} → A ${tx(t, "figWarp_then", "then")} B = ${costA} + ${costB} = ${sw.cost}`;

  return (
    <Figure title={tx(t, "figWarp_title", "One instruction, a whole warp")}
      head={<>
        <Btn active={mode === "branch"} onClick={() => setMode("branch")}>if / else</Btn>
        <Btn active={mode === "loop"} onClick={() => setMode("loop")}>{tx(t, "figWarp_loop", "loop")}</Btn>
      </>}
      controls={<>
        {mode === "branch" && <Row>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">{tx(t, "figWarp_cond", "condition")}:</span>
          <Btn active={cond === "uniform"} onClick={() => setCond("uniform")}>{tx(t, "figWarp_cUniform", "a uniform")}</Btn>
          <Btn active={cond === "circle"} onClick={() => setCond("circle")}>{tx(t, "figWarp_cCircle", "inside a circle")}</Btn>
          <Btn active={cond === "stripes"} onClick={() => setCond("stripes")}>{tx(t, "figWarp_cStripes", "stripes")}</Btn>
          <Btn active={cond === "noise"} onClick={() => setCond("noise")}>{tx(t, "figWarp_cNoise", "noise per pixel")}</Btn>
        </Row>}
        <Row>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">{tx(t, "figWarp_warp", "warp")}:</span>
          <Btn active={shape === "4x8"} onClick={() => setShape("4x8")}>{tx(t, "figWarp_s32", "32 lanes, 4 × 8")}</Btn>
          <Btn active={shape === "8x8"} onClick={() => setShape("8x8")}>{tx(t, "figWarp_s64", "64 lanes, 8 × 8")}</Btn>
        </Row>
        {mode === "branch" && <Sliders>
          <Slider label={tx(t, "figWarp_costA", "cost of A")} value={costA} min={1} max={60} step={1} onChange={setCostA} fmt={v => `${v}`} />
          <Slider label={tx(t, "figWarp_costB", "cost of B")} value={costB} min={1} max={60} step={1} onChange={setCostB} fmt={v => `${v}`} />
          {cond === "stripes" && <Slider label={tx(t, "figWarp_stripe", "stripe width")} value={stripe} min={1} max={16} step={1} onChange={setStripe} fmt={v => `${v} px`} />}
        </Sliders>}
        <Row>
          <Readout>{`${tx(t, "figWarp_diverged", "warps that diverged")}: ${diverged} / ${warps.length}`}</Readout>
          <Readout>{`${tx(t, "figWarp_perPixel", "cost per pixel")}: ${(paid / (COLS * ROWS)).toFixed(1)}`}</Readout>
          <Readout>{`${tx(t, "figWarp_alone", "if each pixel ran alone")}: ${(needed / (COLS * ROWS)).toFixed(1)}`}</Readout>
          <Readout color={needed / paid > 0.8 ? C.green : needed / paid > 0.55 ? C.amber : C.red}>{`${tx(t, "figWarp_useful", "lanes doing useful work")}: ${Math.round((100 * needed) / paid)}%`}</Readout>
        </Row>
        <Row><Readout color="var(--primary)">{warpLine}</Readout></Row>
      </>}
      note={mode === "branch"
        ? tx(t, "figWarp_noteBranch", "Amber pixels want path A, blue ones path B; the number in each warp is what it pays. With a uniform every warp agrees. With the circle only the warps on its edge pay for both paths. Narrow stripes and noise make almost every warp pay A + B, even though no pixel needs more than one. Try stripes 4 px wide with the 4 × 8 warp, then 8 × 8.")
        : tx(t, "figWarp_noteLoop", "Each pixel is a ray marched towards a ball on a floor; colour is its number of steps (blue few, red many, the cap is 64). A warp loops until its slowest lane is done, and the lanes that finished early sit idle. The number in each warp is its slowest lane. The silhouette and the floor near the horizon set the price for everything around them.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full max-w-[480px] mx-auto h-auto touch-none cursor-pointer" onPointerDown={pick}>
        {STEPS.map((s, n) => {
          const i = n % COLS, j = Math.floor(n / COLS);
          const fill = mode === "loop" ? heat(s / MAX_STEPS) : takesA(i, j) ? C.amber : C.blue;
          return <rect key={n} x={px(i)} y={py(j + 1)} width={S} height={S} fill={fill} opacity={mode === "loop" ? 0.85 : 0.7} stroke="var(--code-bg)" strokeWidth={0.5} />;
        })}
        {warps.map(w => {
          const x = px(w.wx * ww), y = py((w.wy + 1) * wh), split = mode === "branch" ? w.nA > 0 && w.nA < lanes : false;
          const isSel = w === sw;
          return (
            <g key={`${w.wx}-${w.wy}`}>
              <rect x={x} y={y} width={ww * S} height={wh * S} fill="none"
                stroke={isSel ? "var(--text-main)" : split ? C.red : "var(--code-bg)"} strokeWidth={isSel ? 2.6 : split ? 2 : 1.6} />
              <rect x={x + ww * S / 2 - 13} y={y + wh * S / 2 - 8} width={26} height={15} rx={3} fill="var(--code-bg)" opacity={0.88} />
              <T x={x + ww * S / 2} y={y + wh * S / 2 + 3.5} size={9.5} anchor="middle" color={split ? C.red : C.fg} bold>{`${w.cost}`}</T>
            </g>
          );
        })}
      </svg>
      <p className="text-center text-[11px] font-mono text-[var(--text-muted)] pb-1">
        {mode === "branch"
          ? <><span style={{ color: C.amber }}>{tx(t, "figWarp_legA", "■ wants A")}</span>{" · "}<span style={{ color: C.blue }}>{tx(t, "figWarp_legB", "■ wants B")}</span>{" · "}<span style={{ color: C.red }}>{tx(t, "figWarp_legSplit", "red frame = runs both")}</span></>
          : tx(t, "figWarp_legLoop", "colour = steps of that pixel · number = steps the whole warp runs")}
      </p>
    </Figure>
  );
}

function lanesOf(w: { wx: number; wy: number }, ww: number, wh: number): [number, number][] {
  const out: [number, number][] = [];
  for (let b = 0; b < wh; b++) for (let a = 0; a < ww; a++) out.push([w.wx * ww + a, w.wy * wh + b]);
  return out;
}

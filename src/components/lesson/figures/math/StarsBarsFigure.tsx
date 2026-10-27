"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Slider, C, T, useFrame, useVisible } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Stars and bars. k identical items (stars) go into n boxes; a box may stay
// empty. Each way of doing it is drawn twice: as boxes holding stars, and as
// one row of k stars and n − 1 bars, where the bars are the walls between
// the boxes. The two pictures match one to one, and a row is fixed by
// choosing which k of the n + k − 1 places hold stars: C(n + k − 1, k).
// The Transport walks through every distribution in order.

const W = 560, H = 210;
const BOX_COLORS = [C.blue, C.amber, C.green, C.purple, C.red];
const fact = (n: number) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const choose = (n: number, k: number) => Math.round(fact(n) / (fact(k) * fact(n - k)));

/** Every way to put k stars into n boxes, in reverse dictionary order (all in box 1 first). */
function distributions(n: number, k: number): number[][] {
  if (n === 1) return [[k]];
  const out: number[][] = [];
  for (let first = k; first >= 0; first--) for (const rest of distributions(n - 1, k - first)) out.push([first, ...rest]);
  return out;
}

export function StarsBarsFigure({ t }: { t?: TrackTranslations }) {
  const [n, setN] = useState(3);
  const [k, setK] = useState(4);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const acc = useRef(0);
  const vis = useVisible<HTMLDivElement>();
  const all = distributions(n, k), total = all.length, idx = Math.min(i, total - 1), d = all[idx];

  useFrame(playing && vis.on, dt => {
    acc.current += dt;
    if (acc.current > 0.9) { acc.current = 0; setI(v => (v + 1) % total); }
  });
  const stepTo = (v: number) => { setPlaying(false); setI(((v % total) + total) % total); };
  const reset = (nn: number, kk: number) => { setN(nn); setK(kk); setI(0); };

  // the row of symbols: stars of box 1, bar, stars of box 2, …
  const row: { star: boolean; box: number }[] = [];
  d.forEach((c, b) => { for (let s = 0; s < c; s++) row.push({ star: true, box: b }); if (b < n - 1) row.push({ star: false, box: b }); });
  const cell = Math.min(40, (W - 40) / row.length), rx0 = (W - row.length * cell) / 2;
  const bw = Math.min(100, (W - 40 - (n - 1) * 12) / n), bx0 = (W - (n * bw + (n - 1) * 12)) / 2;

  return (
    <Figure
      title={tx(t, "figStars_title", "Stars and bars")}
      controls={<>
        <Row>
          <Slider label={tx(t, "figStars_n", "boxes n")} value={n} min={2} max={5} step={1} onChange={v => reset(v, k)} fmt={v => String(v)} />
          <Slider label={tx(t, "figStars_k", "items k")} value={k} min={1} max={7} step={1} onChange={v => reset(n, v)} fmt={v => String(v)} />
        </Row>
        <Row>
          <Readout color={C.blue}>{`(${d.join(", ")})`}</Readout>
          <Readout color={C.amber}>{`C(${n} + ${k} − 1, ${k}) = C(${n + k - 1}, ${k}) = ${choose(n + k - 1, k)}`}</Readout>
        </Row>
      </>}
      note={tx(t, "figStars_note", "Top: the k identical items shared out among the n boxes; a box may stay empty. Bottom: the same thing written as one row, a star for each item and a bar for each wall between two boxes. Every sharing gives one row and every row gives one sharing, so counting rows is enough. A row has n + k − 1 places, and it is fixed by choosing which k of them hold stars.")}
    >
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {d.map((c, b) => {
            const x = bx0 + b * (bw + 12);
            return (
              <g key={b}>
                <rect x={x} y={14} width={bw} height={88} rx={10} fill={BOX_COLORS[b]} fillOpacity={0.1} stroke={BOX_COLORS[b]} strokeWidth={1.4} />
                {Array.from({ length: c }, (_, s) => (
                  <T key={s} x={x + 14 + (s % 3) * ((bw - 28) / 2)} y={42 + Math.floor(s / 3) * 24} anchor="middle" color={BOX_COLORS[b]} size={18} bold>★</T>
                ))}
                <T x={x + bw / 2} y={118} anchor="middle" color={C.muted}>{`${tx(t, "figStars_box", "box")} ${b + 1}: ${c}`}</T>
              </g>
            );
          })}
          {row.map((s, j) => (
            s.star
              ? <T key={j} x={rx0 + j * cell + cell / 2} y={172} anchor="middle" color={BOX_COLORS[s.box]} size={22} bold>★</T>
              : <line key={j} x1={rx0 + j * cell + cell / 2} y1={150} x2={rx0 + j * cell + cell / 2} y2={182} stroke={C.fg} strokeWidth={2.4} />
          ))}
          {row.map((_, j) => <T key={`p${j}`} x={rx0 + j * cell + cell / 2} y={200} anchor="middle" color={C.axis} size={8.5}>{String(j + 1)}</T>)}
        </svg>
        <Transport t={t} playing={playing}
          onPlay={() => { acc.current = 0; setPlaying(p => !p); }}
          playLabel={tx(t, "figStars_play", "go through every sharing")}
          onStep={() => stepTo(idx + 1)}
          onBack={() => stepTo(idx - 1)}
          onReset={() => stepTo(0)}
          readout={`${idx + 1} / ${total}`} />
      </div>
    </Figure>
  );
}

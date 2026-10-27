"use client";

import { useEffect, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Choice, Figure, Row, Readout, Slider, Sliders, C, T, useVisible } from "@/components/lesson/kit/figure";
import { scaledMs, useFigureSpeed } from "@/components/lesson/kit/Stepper";
import { Transport } from "@/components/lesson/kit/Transport";
import { Lab, LabButton, fill, useLab, type Insight, type LabStep } from "@/components/lesson/kit/lab/Lab";

// ── What this figure shows ────────────────────────────────────────────────────
// Why multiplying by the conjugate works, in two pictures.
// area — a² − b² as a picture: an a-by-a square with a b-by-b corner cut out.
//        The Transport cuts the L shape into two strips and swings the lower
//        one up beside the other: the same area is now a rectangle a + b wide
//        and a − b tall, so a² − b² = (a + b)(a − b).
// root — (a + √n) times itself and times its conjugate (a − √n), as a 2 × 2
//        multiplication grid. Squaring leaves two cross cells a√n, so the
//        root survives; with the conjugate the cross cells are −a√n and +a√n,
//        and the Transport cancels them: only a² − n is left, no root at all.

type Mode = "area" | "root";
const n3 = (v: number) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(3)).toString().replace("-", "−");
const STAGES: Record<Mode, number> = { area: 2, root: 1 };
const W = 560, H = 300, S = 30, X0 = 84, Y0 = 34;

export function ConjugateFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("area");
  const [a, setA] = useState(6);
  const [b, setB] = useState(2);
  const [ra, setRa] = useState(3);
  const [rn, setRn] = useState(2);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed] = useFigureSpeed();
  const lab = useLab("math-conjugate");
  const vis = useVisible<HTMLDivElement>();
  const last = STAGES[mode];

  useEffect(() => {
    if (!playing || !(vis.on || lab.open)) return;
    if (stage >= last) { setPlaying(false); return; }
    const id = setTimeout(() => setStage(stage + 1), scaledMs(1200, speed));
    return () => clearTimeout(id);
  }, [playing, stage, last, speed, vis.on, lab.open]);

  const pickMode = (m: Mode) => { setMode(m); setStage(0); setPlaying(false); };
  const setSideA = (v: number) => { setA(v); if (b >= v) setB(v - 1); };

  // ── area: a² − b² cut and rearranged ──
  const k = a - b;
  const cut = stage >= 1, moved = stage >= 2;
  const lower = moved
    ? `translate(${X0 + (a + b) * S}px, ${Y0}px) rotate(90deg)`
    : `translate(${X0}px, ${Y0 + k * S + (cut ? 6 : 0)}px) rotate(0deg)`;
  const areaView = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* the cut-out corner, b × b */}
      <rect x={X0 + k * S} y={Y0 + k * S} width={b * S} height={b * S} fill={C.red} fillOpacity={moved ? 0 : 0.06}
        stroke={C.red} strokeWidth={1.2} strokeDasharray="4 3" opacity={moved ? 0.35 : 1} style={{ transition: "opacity 0.5s ease" }} />
      {!moved && b * S > 30 && <T x={X0 + (k + b / 2) * S} y={Y0 + (k + b / 2) * S + 4} size={10} anchor="middle" color={C.red} bold>{`−${n3(b * b)}`}</T>}
      {/* top strip: a wide, a − b tall */}
      <rect x={X0} y={Y0} width={a * S} height={k * S} fill={C.purple} fillOpacity={0.24} stroke={C.purple} strokeWidth={1.4} />
      <T x={X0 + (a * S) / 2} y={Y0 + (k * S) / 2 + 4} size={10} anchor="middle" color={C.purple} bold>{`${n3(a)} × ${n3(k)}`}</T>
      {/* lower strip: a − b wide, b tall; it swings up to the right of the top strip */}
      <g style={{ transform: lower, transition: "transform 0.8s ease" }}>
        <rect width={k * S} height={b * S} fill={C.sky} fillOpacity={0.24} stroke={C.sky} strokeWidth={1.4} />
      </g>
      {moved
        ? <T x={X0 + (a + b / 2) * S} y={Y0 + (k * S) / 2 + 4} size={10} anchor="middle" color={C.sky} bold>{`${n3(b)} × ${n3(k)}`}</T>
        : <T x={X0 + (k * S) / 2} y={Y0 + (k + b / 2) * S + (cut ? 10 : 4)} size={10} anchor="middle" color={C.sky} bold>{`${n3(k)} × ${n3(b)}`}</T>}
      {/* side labels */}
      {moved ? <>
        <line x1={X0} x2={X0 + (a + b) * S} y1={Y0 - 6} y2={Y0 - 6} stroke={C.axis} />
        <T x={X0 + ((a + b) * S) / 2} y={Y0 - 11} size={10} anchor="middle" color={C.fg}>{`a + b = ${n3(a + b)}`}</T>
        <T x={X0 - 8} y={Y0 + (k * S) / 2 + 4} size={10} anchor="end" color={C.fg}>{`a − b = ${n3(k)}`}</T>
      </> : <>
        <line x1={X0} x2={X0 + a * S} y1={Y0 - 6} y2={Y0 - 6} stroke={C.axis} />
        <T x={X0 + (a * S) / 2} y={Y0 - 11} size={10} anchor="middle" color={C.fg}>{`a = ${n3(a)}`}</T>
        <T x={X0 + (k + b / 2) * S} y={Y0 + a * S + 16} size={10} anchor="middle" color={C.red}>{`b = ${n3(b)}`}</T>
      </>}
    </svg>
  );

  // ── root: (a + √n)² against (a + √n)(a − √n) ──
  const cancel = stage >= 1;
  const sq = Number.isInteger(Math.sqrt(rn));
  const rt = `√${rn}`;
  const grid = (x0: number, title: string, signB: 1 | -1) => {
    const cw = 104, ch = 46;
    const cells: [string, string, boolean][] = [
      [`${n3(ra * ra)}`, C.purple, false],
      [`${signB < 0 ? "−" : "+"}${ra}${rt}`, C.red, true],
      [`+${ra}${rt}`, C.red, true],
      [`${signB < 0 ? "−" : "+"}${rn}`, C.sky, false],
    ];
    const gone = signB < 0 && cancel;
    return (
      <g>
        <T x={x0 + cw + 30} y={20} size={10.5} anchor="middle" color={C.fg} bold>{title}</T>
        <T x={x0 + 30 + cw / 2} y={44} size={10} anchor="middle" color={C.fg}>{`${ra}`}</T>
        <T x={x0 + 30 + cw * 1.5} y={44} size={10} anchor="middle" color={C.fg}>{`${signB < 0 ? "−" : "+"}${rt}`}</T>
        <T x={x0 + 22} y={52 + ch / 2 + 4} size={10} anchor="end" color={C.fg}>{`${ra}`}</T>
        <T x={x0 + 22} y={52 + ch * 1.5 + 4} size={10} anchor="end" color={C.fg}>{`+${rt}`}</T>
        {cells.map(([txt, col, cross], i) => {
          const cx = x0 + 30 + (i % 2) * cw, cy = 52 + Math.floor(i / 2) * ch;
          const fade = cross && gone;
          return (
            <g key={i} style={{ opacity: fade ? 0.28 : 1, transition: "opacity 0.6s ease" }}>
              <rect x={cx} y={cy} width={cw} height={ch} fill={col} fillOpacity={0.16} stroke={col} strokeWidth={1.3} />
              <T x={cx + cw / 2} y={cy + ch / 2 + 4} size={11} anchor="middle" color={col} bold>{txt}</T>
              {fade && <line x1={cx + 14} x2={cx + cw - 14} y1={cy + ch / 2} y2={cy + ch / 2} stroke={C.red} strokeWidth={1.6} />}
            </g>
          );
        })}
      </g>
    );
  };
  const sumSq = `${n3(ra * ra + rn)} + ${2 * ra}${rt}`;
  const prod = n3(ra * ra - rn);
  const rootView = (
    <svg viewBox={`0 0 ${W} 210`} className="w-full h-auto">
      {grid(0, tx(t, "figConj_self", "times itself"), 1)}
      {grid(W / 2 + 4, tx(t, "figConj_conj", "times its conjugate"), -1)}
      <T x={30 + 104} y={170} size={11} anchor="middle" color={C.fg}>{`= ${sumSq}`}</T>
      <T x={30 + 104} y={188} size={9.5} anchor="middle" color={C.red}>{tx(t, "figConj_stays", "the root is still there")}</T>
      <T x={W / 2 + 34 + 104} y={170} size={11} anchor="middle" color={C.fg}>{cancel ? `= ${prod}` : `= ${n3(ra * ra)} − ${ra}${rt} + ${ra}${rt} − ${rn}`}</T>
      {cancel && <T x={W / 2 + 34 + 104} y={188} size={9.5} anchor="middle" color={C.green}>{tx(t, "figConj_gone", "no root left")}</T>}
    </svg>
  );

  const stageNames: Record<Mode, string[]> = {
    area: [tx(t, "figConj_s0", "a² with a corner b² cut out"), tx(t, "figConj_s1", "cut into two strips"), tx(t, "figConj_s2", "one strip moved: a rectangle")],
    root: [tx(t, "figConj_r0", "the four products"), tx(t, "figConj_r1", "the cross terms cancel")],
  };
  const view = (
    <div>
      {mode === "area" ? areaView : rootView}
      <Transport t={t} speed playing={playing}
        onPlay={() => { if (playing) { setPlaying(false); return; } if (stage >= last) setStage(0); setPlaying(true); }}
        playLabel={mode === "area" ? tx(t, "figConj_playA", "rearrange") : tx(t, "figConj_playR", "cancel")}
        onStep={stage < last ? () => { setPlaying(false); setStage(stage + 1); } : undefined}
        onBack={stage > 0 ? () => { setPlaying(false); setStage(stage - 1); } : undefined}
        onReset={() => { setPlaying(false); setStage(0); }}
        readout={stageNames[mode][Math.min(stage, last)]} />
    </div>
  );

  const controls = <>
    <Row>
      <Choice value={mode} onChange={pickMode} options={[
        ["area", tx(t, "figConj_mArea", "a² − b² as an area")],
        ["root", tx(t, "figConj_mRoot", "square or conjugate?")],
      ]} />
    </Row>
    {mode === "area" ? <>
      <Sliders>
        <Slider label="a" value={a} min={2} max={8} step={1} onChange={setSideA} fmt={n3} />
        <Slider label="b" value={b} min={1} max={a - 1} step={1} onChange={setB} fmt={n3} />
      </Sliders>
      <Row>
        <Readout>{`${n3(a * a)} − ${n3(b * b)} = ${n3(a * a - b * b)}`}</Readout>
        <Readout color={C.amber}>{`(${n3(a + b)})(${n3(k)}) = ${n3((a + b) * k)}`}</Readout>
      </Row>
    </> : <>
      <Sliders>
        <Slider label="a" value={ra} min={1} max={6} step={1} onChange={setRa} fmt={n3} />
        <Slider label="n" value={rn} min={2} max={30} step={1} onChange={setRn} fmt={n3} />
      </Sliders>
      <Row>
        <Readout>{`(${ra} + ${rt})² ≈ ${n3((ra + Math.sqrt(rn)) ** 2)}`}</Readout>
        <Readout color={C.amber}>{`(${ra} + ${rt})(${ra} − ${rt}) = ${prod}`}</Readout>
      </Row>
    </>}
  </>;

  // ── Lab ──
  const labSteps: LabStep[] = [
    {
      title: tx(t, "figConjL1_t", "Cut out a corner"),
      body: <>
        <p>{tx(t, "figConjL1_b1", "The whole square is a² = 36. The red corner, b² = 4, is cut away, so what is left has area 36 − 4 = 32. That L shape is not a rectangle, so its area is not one product yet.")}</p>
        <p>{tx(t, "figConjL1_b2", "Step forward: the L is cut into a top strip and a lower strip.")}</p>
      </>,
      goal: { text: tx(t, "figConjL1_g", "Cut the L into two strips."), done: mode === "area" && a === 6 && b === 2 && stage >= 1 },
      focus: "step",
      setup: () => { pickMode("area"); setA(6); setB(2); },
    },
    {
      title: tx(t, "figConjL2_t", "Move one strip"),
      body: <p>{tx(t, "figConjL2_b", "Both strips are a − b = 4 tall once the lower one is turned. Step again: it swings up beside the top strip.")}</p>,
      goal: { text: tx(t, "figConjL2_g", "Make the rectangle."), done: mode === "area" && stage === 2 },
      focus: "step",
    },
    {
      title: tx(t, "figConjL3_t", "Quick check"),
      body: <p>{tx(t, "figConjL3_b", "The rectangle is (a + b) wide and (a − b) tall. Use it for mental arithmetic.")}</p>,
      quiz: {
        q: "53 · 47 = ?",
        options: ["2491", "2500", "2409", "2591"],
        answer: 0,
        why: tx(t, "figConjL3_w", "53 = 50 + 3 and 47 = 50 − 3, so 53 · 47 = 50² − 3² = 2500 − 9 = 2491."),
      },
    },
    {
      title: tx(t, "figConjL4_t", "Now with a root"),
      body: <>
        <p>{tx(t, "figConjL4_b1", "Here b is a square root, √n. On the left, 3 + √2 is multiplied by itself; on the right, by its conjugate 3 − √2.")}</p>
        <p>{tx(t, "figConjL4_b2", "Press play and watch the two red cross cells on the right.")}</p>
      </>,
      goal: { text: tx(t, "figConjL4_g", "Cancel the cross terms."), done: mode === "root" && stage === 1 },
      focus: "play",
      setup: () => { pickMode("root"); setRa(3); setRn(2); },
    },
    {
      title: tx(t, "figConjL5_t", "Quick check"),
      body: <p>{tx(t, "figConjL5_b", "The conjugate keeps the two terms and flips the sign between them.")}</p>,
      quiz: {
        q: tx(t, "figConjL5_q", "What should 2 − √3 be multiplied by to remove the root?"),
        options: ["2 + √3", "2 − √3", "√3", "−2 + √3"],
        answer: 0,
        why: tx(t, "figConjL5_w", "(2 − √3)(2 + √3) = 4 − 3 = 1. Squaring instead gives 7 − 4√3, still with a root; √3 alone gives 2√3 − 3; and −2 + √3 is just −(2 − √3), the same number again with its sign changed."),
      },
    },
    {
      title: tx(t, "figConjL6_t", "When the trick breaks"),
      body: <p>{tx(t, "figConjL6_b", "Keep the conjugate panel and set n = a², for example a = 3 and n = 9. Read the product.")}</p>,
      goal: { text: tx(t, "figConjL6_g", "Make n equal to a²."), done: mode === "root" && rn === ra * ra },
      setup: () => { pickMode("root"); setRa(3); setRn(5); },
    },
  ];

  const insights: Insight[] = [
    {
      id: "rect", tone: "ok", when: mode === "area" && stage === 2,
      title: tx(t, "figConjI1_t", "Same area, new shape"),
      body: fill(tx(t, "figConjI1_b", "Nothing was added or thrown away, only moved: {a}² − {b}² = {d} and ({s})({k}) = {d}. That is the difference of squares, a² − b² = (a + b)(a − b)."), { a: n3(a), b: n3(b), d: n3(a * a - b * b), s: n3(a + b), k: n3(k) }),
    },
    {
      id: "cross", tone: "info", when: mode === "root" && stage === 0,
      title: tx(t, "figConjI2_t", "The cross cells"),
      body: fill(tx(t, "figConjI2_b", "Every root on the page sits in the two red cells. Squaring makes them both +{a}{r}, so they add up to {two}{r}. The conjugate makes them opposite."), { a: String(ra), r: rt, two: String(2 * ra) }),
    },
    {
      id: "zero", tone: "warn", when: mode === "root" && rn === ra * ra,
      title: tx(t, "figConjI3_t", "The conjugate is 0 here"),
      body: fill(tx(t, "figConjI3_b", "√{n} = {a}, so {a} − √{n} = 0 and the product is 0. In a fraction you multiply the top and the bottom by the conjugate, and multiplying by 0/0 is not allowed. Here there was no real root to remove anyway: √{n} is a whole number."), { n: String(rn), a: String(ra) }),
    },
    {
      id: "square", tone: "info", when: mode === "root" && sq && rn !== ra * ra,
      title: tx(t, "figConjI4_t", "n is a perfect square"),
      body: fill(tx(t, "figConjI4_b", "√{n} = {r} is a whole number, so there is no root to remove. The identity still holds: ({a} + {r})({a} − {r}) = {p}."), { n: String(rn), r: n3(Math.sqrt(rn)), a: String(ra), p: prod }),
    },
  ];

  const title = tx(t, "figConj_title", "Why the conjugate removes a root");
  return (
    <>
      <Figure fullscreen={false} title={title}
        head={<LabButton lab={lab} t={t} />}
        controls={controls}
        note={tx(t, "figConj_note", "First panel: a square of side a with a corner of side b cut out has area a² − b². Press ▶: the L shape is cut into two strips and one is turned and moved, giving a rectangle (a + b) by (a − b) with the same area. Second panel: (a + √n) is multiplied by itself and by its conjugate (a − √n) in a 2 × 2 grid, one cell per pair of terms. The root lives only in the two red cross cells. Squared, they add up; with the conjugate they are opposite and cancel, leaving a² − n with no root.")}
      >
        <div ref={vis.ref}>{view}</div>
      </Figure>

      <Lab lab={lab} t={t} title={title}
        steps={labSteps} insights={insights} stage={view}
        controls={controls}
        recap={[
          tx(t, "figConjR1", "A square a² with a corner b² cut out can be rearranged into a rectangle (a + b) by (a − b): a² − b² = (a + b)(a − b)."),
          tx(t, "figConjR2", "Multiplying a + √n by itself keeps a cross term 2a√n; multiplying by its conjugate a − √n makes the cross terms cancel."),
          tx(t, "figConjR3", "What is left, a² − n, has no root. The conjugate must not be 0, so check that a ≠ √n."),
        ]}
      />
    </>
  );
}

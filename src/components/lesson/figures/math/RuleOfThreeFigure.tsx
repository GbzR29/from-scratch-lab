"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Choice, Btn, C, T, Vec } from "@/components/lesson/kit/figure";
import { Tex } from "@/components/lesson/Tex";

// ── What this figure shows ────────────────────────────────────────────────────
// The arrow method of the rule of three, simple and compound. Each quantity is
// a column with its old value (top row) and new value (bottom row); the
// unknown x sits in the first column, whose arrow is fixed pointing down. The
// reader sets the arrow of every other column: down = the same direction as x
// (directly proportional), up = the opposite direction (inversely
// proportional). The setup is built live from those arrows: the ratio of the
// x column equals the product of the other ratios, each read in the direction
// of its arrow, so an up-arrow column appears flipped. A wrong arrow gives a
// wrong x, and the line under each column says why its arrow points the way
// it does once it is right.

type Txt = [string, string];
type Col = { name: Txt; old: number; now: number; dir: 1 | -1; why: Txt };
type Preset = { id: string; name: Txt; x: { name: Txt; old: number }; cols: Col[] };

const PRESETS: Preset[] = [
  { id: "fuel", name: ["figR3_fuel", "fuel (simple, direct)"], x: { name: ["figR3_litres", "litres"], old: 6 }, cols: [
    { name: ["figR3_km", "km"], old: 75, now: 200, dir: 1, why: ["figR3_wKm", "a longer trip burns more fuel: same direction"] },
  ] },
  { id: "speed", name: ["figR3_speed", "trip (simple, inverse)"], x: { name: ["figR3_hours", "hours"], old: 4 }, cols: [
    { name: ["figR3_kmh", "km/h"], old: 60, now: 80, dir: -1, why: ["figR3_wKmh", "driving faster, the same trip takes less time: opposite direction"] },
  ] },
  { id: "machines", name: ["figR3_machines", "factory (compound)"], x: { name: ["figR3_parts", "parts"], old: 400 }, cols: [
    { name: ["figR3_mach", "machines"], old: 5, now: 3, dir: 1, why: ["figR3_wMach", "more machines make more parts in the same days: same direction"] },
    { name: ["figR3_days", "days"], old: 8, now: 10, dir: 1, why: ["figR3_wDaysP", "more days of work make more parts with the same machines: same direction"] },
  ] },
  { id: "wall", name: ["figR3_wall", "wall (compound, mixed)"], x: { name: ["figR3_daysX", "days"], old: 20 }, cols: [
    { name: ["figR3_workers", "workers"], old: 6, now: 10, dir: -1, why: ["figR3_wWork", "more workers finish the same wall sooner: opposite direction"] },
    { name: ["figR3_hpd", "hours/day"], old: 8, now: 6, dir: -1, why: ["figR3_wHpd", "longer working days finish it sooner: opposite direction"] },
    { name: ["figR3_metres", "metres"], old: 400, now: 600, dir: 1, why: ["figR3_wMetres", "a longer wall takes more days: same direction"] },
  ] },
];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fmt = (n: number, d: number) => {
  const g = gcd(n, d), p = n / g, q = d / g;
  return q === 1 ? String(p) : (p / q).toFixed(2).replace(/\.?0+$/, "");
};

const H = 172, CW = 100;

export function RuleOfThreeFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState("wall");
  const preset = PRESETS.find(p => p.id === id) ?? PRESETS[0];
  const [dirs, setDirs] = useState<number[]>(() => preset.cols.map(() => 1));
  const choose = (v: string) => { setId(v); setDirs((PRESETS.find(p => p.id === v) ?? PRESETS[0]).cols.map(() => 1)); };
  const flip = (i: number) => setDirs(ds => ds.map((d, j) => (j === i ? -d : d)));

  // x = X0 · Π (new/old)^dir, kept as an exact fraction num/den
  const solve = (ds: number[]) => {
    let num = preset.x.old, den = 1;
    preset.cols.forEach((c, i) => { if (ds[i] > 0) { num *= c.now; den *= c.old; } else { num *= c.old; den *= c.now; } });
    return [num, den] as const;
  };
  const [n, d] = solve(dirs);
  const [tn, td] = solve(preset.cols.map(c => c.dir));
  const wrong = preset.cols.filter((c, i) => dirs[i] !== c.dir).length;
  const right = wrong === 0;
  const xName = tx(t, preset.x.name[0], preset.x.name[1]);

  // the setup, in the arrow layout: X0/x = product of the other ratios, each read along its arrow
  const ratios = preset.cols.map((c, i) => (dirs[i] > 0 ? `\\frac{${c.old}}{${c.now}}` : `\\frac{\\purple{${c.now}}}{\\purple{${c.old}}}`)).join(" \\cdot ");
  const top = preset.cols.reduce((p, c, i) => p * (dirs[i] > 0 ? c.old : c.now), 1);
  const bot = preset.cols.reduce((p, c, i) => p * (dirs[i] > 0 ? c.now : c.old), 1);
  // two fixed lines, so a narrow screen never breaks a fraction in the middle
  const setup = `\\begin{gathered} \\frac{${preset.x.old}}{x} = ${ratios}${preset.cols.length > 1 ? ` = \\frac{${top}}{${bot}}` : ""} \\\\ x = \\frac{${preset.x.old} \\cdot ${bot}}{${top}} = ${right ? "\\green" : "\\red"}{${fmt(n, d)}} \\end{gathered}`;

  const cols = [{ name: preset.x.name, old: preset.x.old, now: null as number | null }, ...preset.cols.map(c => ({ name: c.name, old: c.old, now: c.now as number | null }))];
  // the drawing is only as wide as its columns, so a phone shrinks it less
  const W = cols.length * CW + 40, x0 = 20;

  return (
    <Figure
      title={tx(t, "figR3_title", "Rule of three: set the arrows")}
      head={<Choice value={id} onChange={choose} options={PRESETS.map(p => [p.id, tx(t, p.name[0], p.name[1])] as [string, string])} />}
      controls={<>
        <Row>
          {preset.cols.map((c, i) => (
            <Btn key={i} active={dirs[i] < 0} onClick={() => flip(i)}
              title={tx(t, "figR3_flipTip", "flip this arrow")}>
              {`${tx(t, c.name[0], c.name[1])}: ${dirs[i] > 0 ? tx(t, "figR3_same", "same ↓") : tx(t, "figR3_opp", "opposite ↑")}`}
            </Btn>
          ))}
        </Row>
        <Row>
          <Readout color={right ? C.green : C.red}>{`x = ${fmt(n, d)} ${xName}`}</Readout>
          <Readout color={right ? C.green : C.muted}>
            {right ? tx(t, "figR3_ok", "all arrows right")
              : tx(t, "figR3_bad", "{n} arrow(s) point the wrong way").replace("{n}", String(wrong))}
          </Readout>
          {!right && <Readout color={C.muted}>{`${tx(t, "figR3_should", "should be")} ${fmt(tn, td)}`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figR3_note", "The column with x always gets a down arrow. For every other column, freeze all the rest and ask: if this quantity grows, does x grow too? Then its arrow points down like x's (direct). Does x shrink? Then it points up (inverse), and its ratio is written upside down, in purple. The ratio of x's column equals the product of the others, each read along its arrow. Start with every arrow down and see how far off the answer is.")}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mx-auto block" style={{ maxWidth: W * 1.25 }}>
        {cols.map((c, i) => {
          const cx = x0 + i * CW + CW / 2 - 12, isX = i === 0;
          const dir = isX ? 1 : dirs[i - 1];
          const ok = isX || dirs[i - 1] === preset.cols[i - 1].dir;
          const col = isX ? C.amber : dir > 0 ? C.blue : C.purple;
          const ax = cx + 36, ya = 62, yb = 128;
          return (
            <g key={i}>
              <T x={cx + 6} y={30} anchor="middle" color={isX ? C.amber : C.fg} size={13} bold>{tx(t, c.name[0], c.name[1])}</T>
              <line x1={cx - 38} y1={40} x2={cx + 46} y2={40} stroke="var(--border)" />
              <T x={cx} y={78} anchor="middle" color={C.fg} size={20}>{String(c.old)}</T>
              <T x={cx} y={124} anchor="middle" color={isX ? C.amber : C.fg} size={20} bold={isX}>{c.now === null ? "x" : String(c.now)}</T>
              <g role={isX ? undefined : "button"} tabIndex={isX ? undefined : 0} style={{ cursor: isX ? "default" : "pointer" }}
                aria-label={isX ? undefined : tx(t, "figR3_flipTip", "flip this arrow")}
                onClick={isX ? undefined : () => flip(i - 1)}
                onKeyDown={isX ? undefined : e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(i - 1); } }}>
                <rect x={ax - 14} y={ya - 6} width={28} height={yb - ya + 12} fill="transparent" />
                <Vec a={{ x: ax, y: dir > 0 ? ya : yb }} b={{ x: ax, y: dir > 0 ? yb : ya }} color={col} w={2.4} head={9} />
              </g>
              {!isX && <T x={cx + 6} y={160} anchor="middle" color={ok ? C.green : C.muted} size={12} bold>{ok ? tx(t, "figR3_right", "right") : "?"}</T>}
            </g>
          );
        })}
      </svg>
      <div className="px-4 pb-3 space-y-1 text-[12.5px]">
        <div className="overflow-x-auto overflow-y-hidden py-2 text-[16px] text-[var(--text-main)]"><Tex>{`\\displaystyle ${setup}`}</Tex></div>
        {preset.cols.map((c, i) => (
          <div key={i} style={{ color: dirs[i] === c.dir ? "var(--text-main)" : "var(--text-muted)" }}>
            <b>{tx(t, c.name[0], c.name[1])}</b>{": "}
            {dirs[i] === c.dir ? tx(t, c.why[0], c.why[1])
              : tx(t, "figR3_ask", "with everything else fixed, if there were more {c}, would there be more or fewer {x}?")
                .replace("{c}", tx(t, c.name[0], c.name[1])).replace("{x}", xName)}
          </div>
        ))}
      </div>
    </Figure>
  );
}

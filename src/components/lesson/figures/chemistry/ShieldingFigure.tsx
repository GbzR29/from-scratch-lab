"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, Slider, C, T, f2 } from "@/components/lesson/kit/figure";
import { ELEMENTS, BY_SYMBOL } from "./elements";
import { elementName } from "./names";

// ── What this figure shows ────────────────────────────────────────────────────
// Why the trends happen. For Z = 1–36 the outermost electron is drawn with the
// electrons inside it; the inner ones screen part of the nucleus' charge.
// Slater's rules (1930) give the screening S, so the charge the outer electron
// really feels is Z_eff = Z − S. Two hydrogen-like estimates follow from it
// (radius ≈ a₀ n*² / Z_eff, ionisation energy ≈ 13.6 eV · Z_eff² / n*²) and are
// shown next to the measured values: rough numbers, right trends. The plot
// shows Z_eff for all 36 elements: it climbs along a period and drops at every
// alkali metal. Break it: switch the screening off and every number goes
// absurd (sodium would need 180 eV to lose an electron instead of 5).

const W = 560, H = 290;
const NSTAR = [0, 1, 2, 3, 3.7, 4.0, 4.2];                  // Slater's effective principal number
const CORE: Record<string, string> = { He: "1s2", Ne: "[He]2s2 2p6", Ar: "[Ne]3s2 3p6", Kr: "[Ar]3d10 4s2 4p6" };

/** Occupation of each subshell, e.g. {"1s": 2, "2s": 2, "2p": 6, "3s": 1}. */
function shells(config: string): Record<string, number> {
  const out: Record<string, number> = {};
  const add = (c: string) => {
    for (const part of c.split(/\s+/)) {
      const core = part.match(/^\[(\w+)\](.*)$/);
      if (core) { add(CORE[core[1]]); if (core[2]) add(core[2]); continue; }
      const m = part.match(/^(\d)([spdf])(\d+)$/);
      if (m) out[m[1] + m[2]] = (out[m[1] + m[2]] ?? 0) + +m[3];
    }
  };
  add(config);
  return out;
}

/** Slater screening of one outermost s/p electron, split by where it comes from. */
function slater(z: number) {
  const occ = shells(ELEMENTS[z - 1].config);
  const n = Math.max(...Object.keys(occ).map(k => +k[0]));
  let same = 0, next = 0, deep = 0;
  for (const [k, c] of Object.entries(occ)) {
    const kn = +k[0], l = k[1];
    if (kn === n && (l === "s" || l === "p")) same += c;
    else if (kn === n - 1) next += c;
    else if (kn < n - 1) deep += c;
  }
  same -= 1;                                                   // not the electron itself
  const S = same * (n === 1 ? 0.3 : 0.35) + next * 0.85 + deep * 1.0;
  return { n, occ, same, next, deep, S, zeff: z - S };
}

const PICKS = ["Li", "Na", "K", "C", "F", "Cl", "Ne", "Fe"];

export function ShieldingFigure({ t }: { t?: TrackTranslations }) {
  const [z, setZ] = useState(11);
  const [off, setOff] = useState(false);
  const e = ELEMENTS[z - 1];
  const s = slater(z);
  const zeff = off ? z : s.zeff;
  const ns = NSTAR[s.n];
  const rEst = (52.9 * ns * ns) / zeff, ieEst = (13.6 * zeff * zeff) / (ns * ns);

  // ── Atom: one ring per shell n, electrons spread on it
  const cx = 128, cy = 140, ringR = (k: number) => 22 + k * 27;
  const perShell: number[] = [0, 0, 0, 0, 0];
  for (const [k, c] of Object.entries(s.occ)) perShell[+k[0]] += c;
  const dots: { x: number; y: number; c: string }[] = [];
  for (let k = 1; k <= s.n; k++) {
    const cnt = perShell[k], r = ringR(k);
    for (let i = 0; i < cnt; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / cnt + k * 0.4;
      const isOuter = k === s.n && i === 0;
      const color = isOuter ? C.amber : k === s.n ? C.teal : C.sky;
      dots.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), c: color });
    }
  }

  // ── Z_eff for Z = 1–36 (or Z itself with the screening off)
  const PL = 330, PR = 548, PT = 172, PB = 262, ZMAX = 36, YMAX = off ? 36 : 9;
  const px = (k: number) => PL + ((k - 1) / (ZMAX - 1)) * (PR - PL);
  const py = (v: number) => PB - (Math.min(v, YMAX) / YMAX) * (PB - PT);
  const series = Array.from({ length: ZMAX }, (_, i) => (off ? i + 1 : slater(i + 1).zeff));
  const path = series.map((v, i) => `${i ? "L" : "M"}${px(i + 1).toFixed(1)},${py(v).toFixed(1)}`).join(" ");

  const bar = (label: string, v: number, y: number, color: string) => {
    const w = Math.max(1, (v / 36) * 100);
    return (
      <g>
        <T x={330} y={y + 8}>{label}</T>
        <rect x={420} y={y} width={w} height={10} rx={2} fill={color} />
        <T x={424 + w} y={y + 8} color={color} bold>{f2(v, 2)}</T>
      </g>
    );
  };

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* screening cloud: everything inside the outer shell */}
      {s.n > 1 && !off && <circle cx={cx} cy={cy} r={ringR(s.n - 1) + 10} fill={C.sky} opacity={0.12} />}
      {Array.from({ length: s.n }, (_, k) => (
        <circle key={k} cx={cx} cy={cy} r={ringR(k + 1)} fill="none" stroke={C.grid} strokeDasharray={k + 1 === s.n ? undefined : "3 3"} />
      ))}
      <circle cx={cx} cy={cy} r={13} fill={C.red} />
      <text x={cx} y={cy + 3.5} fontSize={9} fontWeight={700} textAnchor="middle" fill="#fff">{`+${z}`}</text>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.c === C.amber ? 5 : 3.2} fill={d.c} />)}
      <T x={14} y={20} color={C.fg} size={12} bold>{`${e.sym} · ${elementName(t, e)}`}</T>
      <T x={14} y={34}>{e.config}</T>
      <T x={14} y={H - 24} color={C.amber}>{tx(t, "figChSh_outer", "● the outer electron")}</T>
      <T x={14} y={H - 10} color={C.sky}>{off ? tx(t, "figChSh_noScreen", "● inner electrons, screening switched off") : tx(t, "figChSh_inner", "● inner electrons: they screen the nucleus")}</T>

      {bar(tx(t, "figChSh_Z", "nucleus Z"), z, 14, C.red)}
      {bar(tx(t, "figChSh_S", "screening S"), off ? 0 : s.S, 32, C.sky)}
      {bar(tx(t, "figChSh_Zeff", "felt Z_eff"), zeff, 50, C.amber)}
      <T x={330} y={84}>{tx(t, "figChSh_estR", "radius ≈ 52.9 pm · n*²/Z_eff")}</T>
      <T x={548} y={84} anchor="end" color={C.amber} bold>{`${f2(rEst, 0)} pm`}</T>
      <T x={330} y={98}>{tx(t, "figChSh_measR", "measured covalent radius")}</T>
      <T x={548} y={98} anchor="end" color={C.fg} bold>{e.rCov ? `${e.rCov} pm` : "—"}</T>
      <T x={330} y={116}>{tx(t, "figChSh_estIe", "ionisation ≈ 13.6 eV · Z_eff²/n*²")}</T>
      <T x={548} y={116} anchor="end" color={C.amber} bold>{`${f2(ieEst, 1)} eV`}</T>
      <T x={330} y={130}>{tx(t, "figChSh_measIe", "measured ionisation energy")}</T>
      <T x={548} y={130} anchor="end" color={C.fg} bold>{e.ie ? `${f2(e.ie, 2)} eV` : "—"}</T>
      <T x={330} y={146}>{`n = ${s.n} · n* = ${ns}`}</T>

      <line x1={PL} x2={PR} y1={PB} y2={PB} stroke={C.axis} />
      <line x1={PL} x2={PL} y1={PT} y2={PB} stroke={C.axis} />
      <T x={PL} y={PT - 4} color={C.fg}>{off ? tx(t, "figChSh_plotOff", "charge felt = Z (no screening)") : tx(t, "figChSh_plot", "Z_eff felt by the outer electron, Z = 1–36")}</T>
      <path d={path} fill="none" stroke={C.amber} strokeWidth={1.4} />
      {series.map((v, i) => (
        <circle key={i} cx={px(i + 1)} cy={py(v)} r={i + 1 === z ? 4 : 1.8} fill={i + 1 === z ? C.amber : C.muted}
          onClick={() => setZ(i + 1)} style={{ cursor: "pointer" }} />
      ))}
      {["Li", "Na", "K", "Kr"].map(sym => {
        const k = BY_SYMBOL[sym].z;
        return <T key={sym} x={px(k)} y={PB + 11} anchor="middle">{sym}</T>;
      })}
    </svg>
  );

  return (
    <Figure title={tx(t, "figChSh_title", "Screening: the charge the outer electron feels")}
      controls={<>
        <Slider label={tx(t, "figChSh_z", "atomic number Z")} value={z} min={1} max={36} step={1} onChange={setZ} fmt={v => `${v} ${ELEMENTS[v - 1].sym}`} />
        <Row>
          {PICKS.map(sym => <Btn key={sym} active={e.sym === sym} onClick={() => setZ(BY_SYMBOL[sym].z)}>{sym}</Btn>)}
          <Btn active={off} onClick={() => setOff(o => !o)}>{tx(t, "figChSh_break", "break it: no screening")}</Btn>
        </Row>
        <Row>
          <Readout>{`S = ${s.same} × ${s.n === 1 ? "0.30" : "0.35"} + ${s.next} × 0.85 + ${s.deep} × 1.00 = ${f2(s.S, 2)}`}</Readout>
          {off && <Readout color={C.red}>{tx(t, "figChSh_offMsg", "every inner electron ignored: atoms far too small, electrons far too hard to remove")}</Readout>}
        </Row>
      </>}
      note={tx(t, "figChSh_note", "Pick an element. Its outer electron (amber) is attracted by the whole nucleus, +Z, but the electrons inside (blue) sit between them and cancel part of that pull. Slater's rules count it: each inner electron one shell down cancels 0.85 of a charge, deeper ones a full 1, and each neighbour in the same shell only 0.35, since it is as often outside as inside. Walk along period 3 from Na to Ar: Z grows by 1 each step but S only by 0.35, so Z_eff climbs, the atom shrinks and holds its electrons harder. At K a new shell starts, far out and behind 18 screening electrons: Z_eff drops back and the radius jumps. The estimates are crude (hydrogen formulas with a borrowed charge), but they follow the measured numbers up and down.")}>
      {view}
    </Figure>
  );
}

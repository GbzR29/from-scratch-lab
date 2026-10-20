"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, C, T, useFrame, useVisible, useRerender, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Building hadrons out of quarks. A baryon is three quarks, a meson a quark
// and an antiquark; click (tap) a quark to change its flavour. The quark
// spins are either as aligned as possible (baryon 3/2, meson 1) or not
// (baryon 1/2, meson 0). The figure adds up the charge, baryon number and
// strangeness, compares the quark masses with the hadron's measured mass
// (PDG 2024, MeV) and names the particle.
// Colour: each quark carries one of three colour charges, and the strong
// force only lets colourless sets exist: red + green + blue, or a colour
// with its anticolour. The colours keep swapping, as gluons are exchanged.
// "break it: no colour" removes them. Then a spin-3/2 baryon with two equal
// flavours puts two identical fermions in the same state, which Pauli
// forbids, yet the Δ⁺⁺ (uuu) and the Ω⁻ (sss) are seen: the historical
// argument for colour (Greenberg 1964, Han–Nambu 1965).

const W = 560, H = 250;
type Fl = "u" | "d" | "s" | "c" | "b" | "t";
const FLAVOURS: Fl[] = ["u", "d", "s", "c", "b", "t"];
const Q: Record<Fl, number> = { u: 2, d: -1, s: -1, c: 2, b: -1, t: 2 };          // charge in thirds
const MASS: Record<Fl, number> = { u: 2.2, d: 4.7, s: 93, c: 1270, b: 4180, t: 172500 };
const RANK: Record<Fl, number> = { u: 0, d: 1, s: 2, c: 3, b: 4, t: 5 };

// measured hadrons: baryons by sorted flavours + spin, mesons by quark + antiquark + spin
const BARYONS: Record<string, [string, number]> = {
  "uud/1": ["p (proton)", 938.27], "udd/1": ["n (neutron)", 939.57], "uds/1": ["Λ⁰ (and Σ⁰)", 1115.68],
  "uus/1": ["Σ⁺", 1189.37], "dds/1": ["Σ⁻", 1197.45], "uss/1": ["Ξ⁰", 1314.86], "dss/1": ["Ξ⁻", 1321.71],
  "udc/1": ["Λc⁺", 2286.46], "udb/1": ["Λb⁰", 5619.6],
  "uuu/3": ["Δ⁺⁺", 1232], "uud/3": ["Δ⁺", 1232], "udd/3": ["Δ⁰", 1232], "ddd/3": ["Δ⁻", 1232],
  "uus/3": ["Σ*⁺", 1382.8], "uds/3": ["Σ*⁰", 1383.7], "dds/3": ["Σ*⁻", 1387.2],
  "uss/3": ["Ξ*⁰", 1531.8], "dss/3": ["Ξ*⁻", 1535], "sss/3": ["Ω⁻", 1672.45],
};
const MESONS: Record<string, [string, number]> = {
  "uu/0": ["π⁰ (and η)", 134.98], "dd/0": ["π⁰ (and η)", 134.98], "ud/0": ["π⁺", 139.57], "du/0": ["π⁻", 139.57],
  "us/0": ["K⁺", 493.68], "ds/0": ["K⁰", 497.61], "su/0": ["K⁻", 493.68], "sd/0": ["K̄⁰", 497.61], "ss/0": ["η′ (partly)", 957.78],
  "cu/0": ["D⁰", 1864.84], "cd/0": ["D⁺", 1869.66], "cc/0": ["ηc", 2983.9], "ub/0": ["B⁺", 5279.34], "db/0": ["B⁰", 5279.66], "bb/0": ["ηb", 9398.7],
  "uu/1": ["ρ⁰ (and ω)", 775.26], "dd/1": ["ρ⁰ (and ω)", 775.26], "ud/1": ["ρ⁺", 775.11], "du/1": ["ρ⁻", 775.11],
  "us/1": ["K*⁺", 891.67], "su/1": ["K*⁻", 891.67], "ss/1": ["φ", 1019.46], "cc/1": ["J/ψ", 3096.9], "bb/1": ["Υ", 9460.3],
};
const PRESETS: [string, "baryon" | "meson", Fl[], boolean][] = [
  ["p", "baryon", ["u", "u", "d"], false], ["n", "baryon", ["u", "d", "d"], false], ["Δ⁺⁺", "baryon", ["u", "u", "u"], true],
  ["Ω⁻", "baryon", ["s", "s", "s"], true], ["π⁺", "meson", ["u", "d"], false], ["K⁺", "meson", ["u", "s"], false], ["J/ψ", "meson", ["c", "c"], true],
];
const COLS = [C.red, C.green, C.blue];
const ANTI = ["#22d3ee", "#e879f9", "#facc15"];                                       // anti-red, anti-green, anti-blue
const TABLE: Fl[] = ["u", "c", "t", "d", "s", "b"];                                  // columns = generations
const thirds = (n: number) => {
  const s = n < 0 ? "−" : n > 0 ? "+" : "";
  return n % 3 === 0 ? `${s}${Math.abs(n / 3)}` : `${s}${Math.abs(n)}/3`;
};

export function QuarkBuilderFigure({ t }: { t?: TrackTranslations }) {
  const [kind, setKind] = useState<"baryon" | "meson">("baryon");
  const [fl, setFl] = useState<Fl[]>(["u", "u", "d"]);
  const [aligned, setAligned] = useState(false);
  const [noColour, setNoColour] = useState(false);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const clock = useRef({ tm: 0, perm: 0, swap: -1 });

  useFrame(vis.on && !noColour, dt => {
    const c = clock.current;
    c.tm += dt;
    if (c.tm > 1.1) { c.tm = 0; c.perm = (c.perm + 1) % 6; c.swap = c.perm % 3; }
    rerender();
  });

  const qs = kind === "baryon" ? fl.slice(0, 3) : fl.slice(0, 2);
  const cycle = (i: number) => setFl(f => { const g = [...f]; g[i] = FLAVOURS[(FLAVOURS.indexOf(g[i]) + 1) % 6]; return g; });
  const setMode = (k: "baryon" | "meson") => { setKind(k); setFl(k === "baryon" ? ["u", "u", "d"] : ["u", "d"]); };

  // quantum numbers (meson: the second is an antiquark)
  const sign = (i: number) => (kind === "meson" && i === 1 ? -1 : 1);
  const charge3 = qs.reduce((a, q, i) => a + sign(i) * Q[q], 0);
  const baryonNo = kind === "baryon" ? 1 : 0;
  const strange = qs.reduce((a, q, i) => a + (q === "s" ? -sign(i) : 0), 0);
  const quarkMass = qs.reduce((a, q) => a + MASS[q], 0);
  const spin = kind === "baryon" ? (aligned ? "3/2" : "1/2") : aligned ? "1" : "0";

  const sorted = [...qs].sort((a, b) => RANK[a] - RANK[b]).join("");
  const key = kind === "baryon" ? `${sorted}/${aligned ? 3 : 1}` : `${qs[0]}${qs[1]}/${aligned ? 1 : 0}`;
  const found = kind === "baryon" ? BARYONS[key] : MESONS[key];
  const hasTop = qs.includes("t");
  const sameThree = kind === "baryon" && qs[0] === qs[1] && qs[1] === qs[2];
  const repeated = kind === "baryon" && new Set(qs).size < 3;
  const pauli = noColour && kind === "baryon" && aligned && repeated;

  let verdict: string, vcol: string = C.fg;
  if (hasTop) { verdict = tx(t, "figPhQuark_top", "the top quark decays in 5 × 10⁻²⁵ s, before any hadron can form around it"); vcol = C.muted; }
  else if (sameThree && !aligned) { verdict = tx(t, "figPhQuark_noHalf", "no such state: three equal quarks only come with spin 3/2"); vcol = C.muted; }
  else if (pauli) { verdict = `${tx(t, "figPhQuark_pauli", "forbidden by Pauli: two identical quarks in the same state")}. ${tx(t, "figPhQuark_yet", "Yet it is seen")}: ${found ? found[0] : ""}`; vcol = C.red; }
  else if (found) { verdict = `${found[0]}: ${f2(found[1], found[1] < 1000 ? 2 : 1)} MeV`; vcol = C.green; }
  else { verdict = tx(t, "figPhQuark_heavy", "a heavy-flavour hadron: many are known, with masses near the sum of the heavy quarks"); vcol = C.muted; }

  // drawing
  const CX = 150, CY = 128, RAD = kind === "baryon" ? 52 : 46;
  const pos = qs.map((_, i) => {
    const a = kind === "baryon" ? -Math.PI / 2 + (i * 2 * Math.PI) / 3 : Math.PI * i;
    return [CX + RAD * Math.cos(a), CY + RAD * Math.sin(a)] as const;
  });
  const perms = [[0, 1, 2], [1, 0, 2], [1, 2, 0], [2, 1, 0], [2, 0, 1], [0, 2, 1]];
  const pm = perms[clock.current.perm];
  const colourOf = (i: number) => {
    if (noColour) return C.axis;
    if (kind === "baryon") return COLS[pm[i]];
    return i === 0 ? COLS[pm[0]] : ANTI[pm[0]];
  };
  const spins = kind === "baryon" ? (aligned ? [1, 1, 1] : [1, 1, -1]) : aligned ? [1, 1] : [1, -1];
  const gluon = (a: readonly [number, number], b: readonly [number, number], k: number) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    let d = "";
    for (let i = 0; i <= 40; i++) {
      const u = 0.2 + (i / 40) * 0.6, w = Math.sin(u * 40 + clock.current.tm * 6 + k) * 4;
      d += `${i ? "L" : "M"}${(a[0] + dx * u + nx * w).toFixed(1)},${(a[1] + dy * u + ny * w).toFixed(1)}`;
    }
    return <path key={k} d={d} fill="none" stroke={C.muted} strokeWidth={1} opacity={0.7} />;
  };

  return (
    <Figure title={tx(t, "figPhQuark_title", "Build a hadron out of quarks")}
      head={<Btn active={noColour} onClick={() => setNoColour(n => !n)}>{tx(t, "figPhQuark_broken", "break it: no colour")}</Btn>}
      controls={<>
        <Row>
          <Choice value={kind} onChange={setMode} options={[["baryon", tx(t, "figPhQuark_baryon", "baryon: 3 quarks")], ["meson", tx(t, "figPhQuark_meson", "meson: quark + antiquark")]] as const} />
          <Choice value={aligned ? "a" : "o"} onChange={v => setAligned(v === "a")} options={[
            ["o", `${tx(t, "figPhQuark_spin", "spin")} ${kind === "baryon" ? "1/2" : "0"}`],
            ["a", `${tx(t, "figPhQuark_spin", "spin")} ${kind === "baryon" ? "3/2" : "1"}`],
          ] as const} />
        </Row>
        <Row>
          {PRESETS.map(([name, k, f, al]) => (
            <Btn key={name} onClick={() => { setKind(k); setFl(f); setAligned(al); }}>{name}</Btn>
          ))}
        </Row>
        <Row>
          <Readout>{`${tx(t, "figPhQuark_charge", "charge")} = ${thirds(charge3)} e`}</Readout>
          <Readout>{`${tx(t, "figPhQuark_bNo", "baryon number")} = ${baryonNo}`}</Readout>
          <Readout>{`${tx(t, "figPhQuark_strange", "strangeness")} = ${strange}`}</Readout>
          <Readout>{`${tx(t, "figPhQuark_spinR", "spin")} = ${spin}`}</Readout>
        </Row>
        <Row>
          <Readout color={vcol}>{verdict}</Readout>
          {found && !hasTop && <Readout color={C.muted}>{`${tx(t, "figPhQuark_qMass", "quark masses add up to")} ${f2(quarkMass, quarkMass < 100 ? 1 : 0)} MeV (${f2((quarkMass / found[1]) * 100, quarkMass / found[1] < 0.1 ? 1 : 0)}%)`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhQuark_note", "Up and down quarks have charges +2/3 and −1/3 of the proton's. Two ups and a down make +1, the proton; one up and two downs make 0, the neutron. An up and an anti-down make the π⁺. Every combination with whole charge and no free colour is a particle someone has seen: in the 1960s Murray Gell-Mann and George Zweig sorted the hundreds of 'elementary' particles found in accelerators this way, and predicted the Ω⁻ (sss) before it was found in 1964. Notice the masses: the three quarks of a proton weigh about 9 MeV, but the proton weighs 938. Almost all of your mass is the energy of the gluon field and of the quarks' motion, E = mc² again. Now press break it. Without colour, the Δ⁺⁺ is three up quarks with all spins pointing the same way, in the same lowest orbit: three identical fermions in the same state, which Pauli's principle forbids. Yet the Δ⁺⁺ is plainly there at 1232 MeV. Giving each quark one of three colours, all different, makes them distinguishable and saves Pauli; colour turned out to be the charge of the strong force.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <circle cx={CX} cy={CY} r={RAD + 34} fill={C.purple} opacity={0.06} stroke={C.purple} strokeOpacity={0.4} />
          {pos.map((a, i) => pos.slice(i + 1).map((b, j) => gluon(a, b, i * 3 + j)))}
          {pos.map(([x, y], i) => (
            <g key={i} onClick={() => cycle(i)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={20} fill={colourOf(i)} opacity={0.85} stroke={kind === "meson" && i === 1 ? C.fg : "none"} strokeDasharray="3 2" />
              <T x={x} y={y + 5} anchor="middle" size={15} color="#fff" bold>{qs[i]}</T>
              {kind === "meson" && i === 1 && <line x1={x - 5} y1={y - 9} x2={x + 5} y2={y - 9} stroke="#fff" strokeWidth={1.6} />}
              <line x1={x + 26} y1={y + 8 * spins[i]} x2={x + 26} y2={y - 8 * spins[i]} stroke={C.amber} strokeWidth={1.8} />
              <path d={`M${x + 22},${y - 4 * spins[i]} L${x + 26},${y - 9 * spins[i]} L${x + 30},${y - 4 * spins[i]}`} fill="none" stroke={C.amber} strokeWidth={1.8} />
            </g>
          ))}
          <T x={14} y={18} size={8}>{tx(t, "figPhQuark_click", "click a quark to change its flavour")}</T>
          <T x={14} y={H - 12} size={8} color={noColour ? C.red : C.muted}>{noColour
            ? tx(t, "figPhQuark_keyNo", "no colour: identical quarks are truly identical")
            : kind === "baryon" ? tx(t, "figPhQuark_keyB", "red + green + blue = colourless") : tx(t, "figPhQuark_keyM", "colour + its anticolour = colourless")}</T>

          {/* the flavour table */}
          {TABLE.map((f, i) => {
            const x = 330 + (i % 3) * 72, y = 40 + Math.floor(i / 3) * 74;
            return (
              <g key={f}>
                <rect x={x} y={y} width={64} height={62} rx={8} fill={C.bg} stroke={qs.includes(f) ? C.amber : C.axis} />
                <T x={x + 32} y={y + 24} anchor="middle" size={16} color={C.fg} bold>{f}</T>
                <T x={x + 32} y={y + 40} anchor="middle" size={8}>{`${Q[f] > 0 ? "+2/3" : "−1/3"} e`}</T>
                <T x={x + 32} y={y + 53} anchor="middle" size={7.5}>{MASS[f] >= 1000 ? `${f2(MASS[f] / 1000, 2)} GeV` : `${MASS[f]} MeV`}</T>
              </g>
            );
          })}
          <T x={330} y={28} size={8}>{tx(t, "figPhQuark_table", "the six quark flavours: charge and mass")}</T>
          <T x={330} y={204} size={8}>{tx(t, "figPhQuark_gens", "columns: three generations")}</T>
          <T x={330} y={218} size={7.5}>{"(u, d) · (c, s) · (t, b)"}</T>
        </svg>
      </div>
    </Figure>
  );
}

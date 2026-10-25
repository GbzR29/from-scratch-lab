"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C, T, f2 } from "@/components/lesson/kit/figure";
import { ELEMENTS } from "./elements";
import { elementName, sci, sup } from "./names";
import { STABLE, HALF_LIFE, PRIMORDIAL_RADIOACTIVE, PROTON_U, NEUTRON_U, ELECTRON_U } from "./isotopes";

// ── What this figure shows ────────────────────────────────────────────────────
// Build an atom from protons, neutrons and electrons (Z ≤ 20). The number of
// protons alone names the element; protons + neutrons give the mass number A
// (the isotope); protons − electrons give the charge (the ion). The card says
// whether the nucleus is one of the stable isotopes found in nature (with its
// share), a known radioactive one (with its half-life), or does not hold
// together. Electrons are drawn on the simple 2-8-8 shell picture: the real
// shapes are orbitals (Physics, "The Hydrogen Atom"). Small goals tick
// themselves when the build matches.

const W = 560, H = 270;
const SHELL_CAP = [2, 8, 8, 8];
const GOALS: { key: string; en: string; p: number; n: number; e: number }[] = [
  { key: "c12", en: "carbon-12, neutral", p: 6, n: 6, e: 6 },
  { key: "c14", en: "carbon-14, the radiocarbon clock", p: 6, n: 8, e: 6 },
  { key: "na", en: "a sodium ion, Na⁺", p: 11, n: 12, e: 10 },
  { key: "cl", en: "a chloride-35 ion, Cl⁻", p: 17, n: 18, e: 18 },
  { key: "d", en: "deuterium (heavy hydrogen)", p: 1, n: 1, e: 1 },
];

const UNIT_EN: Record<string, string> = { s: "s", min: "min", h: "h", d: "days", y: "years" };

/** A deterministic sunflower of nucleons: protons and neutrons interleaved. */
function nucleus(p: number, n: number) {
  const total = p + n, out: { x: number; y: number; proton: boolean }[] = [];
  let pi = 0, ni = 0;
  for (let i = 0; i < total; i++) {
    const proton = ni >= n || (pi < p && pi * n <= ni * p);
    if (proton) pi++; else ni++;
    const r = 4.6 * Math.sqrt(i + 0.5), a = i * 2.39996;
    out.push({ x: r * Math.cos(a), y: r * Math.sin(a), proton });
  }
  return out.reverse();                                       // inner ones on top
}

export function AtomBuilderFigure({ t }: { t?: TrackTranslations }) {
  const [p, setP] = useState(6);
  const [n, setN] = useState(6);
  const [e, setE] = useState(6);
  const [done, setDone] = useState<Set<string>>(new Set());

  const el = p > 0 ? ELEMENTS[p - 1] : null;
  const A = p + n, charge = p - e, key = `${p}-${A}`;
  const stable = STABLE[key], hl = HALF_LIFE[key];
  const massU = p * PROTON_U + n * NEUTRON_U + e * ELECTRON_U;

  const set = (np: number, nn: number, ne: number) => {
    setP(np); setN(nn); setE(ne);
    const hit = GOALS.find(g => g.p === np && g.n === nn && g.e === ne);
    if (hit && !done.has(hit.key)) setDone(new Set(done).add(hit.key));
  };

  const cx = 150, cy = 135;
  const nuc = nucleus(p, n);
  const shellR = (k: number) => 44 + k * 24;
  const electrons: { x: number; y: number }[] = [];
  let left = e;
  SHELL_CAP.forEach((cap, k) => {
    const cnt = Math.min(cap, left);
    left -= cnt;
    for (let i = 0; i < cnt; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / cnt + k * 0.3;
      electrons.push({ x: cx + shellR(k) * Math.cos(a), y: cy + shellR(k) * Math.sin(a) });
    }
  });
  const shellsUsed = SHELL_CAP.findIndex((_, k) => SHELL_CAP.slice(0, k + 1).reduce((s, c) => s + c, 0) >= e) + 1;

  const chargeTxt = charge === 0 ? "" : sup(`${Math.abs(charge) > 1 ? Math.abs(charge) : ""}${charge > 0 ? "+" : "-"}`);
  let status: [string, string];
  if (!el) status = [C.muted, tx(t, "figChAt_noP", "no protons: not an element")];
  else if (stable) status = PRIMORDIAL_RADIOACTIVE.has(key)
    ? [C.amber, `${tx(t, "figChAt_primordial", "in nature but radioactive")} · ${f2(stable[0], 4)} %`]
    : [C.green, `${tx(t, "figChAt_stable", "stable, found in nature")} · ${stable[0] >= 0.01 ? f2(stable[0], 2) : stable[0]} % ${tx(t, "figChAt_ofAtoms", "of its atoms")}`];
  else if (hl) status = [C.amber, `${tx(t, "figChAt_radio", "radioactive, half-life")} ${sci(hl[0])} ${tx(t, `figChAt_u_${hl[1]}`, UNIT_EN[hl[1]])}`];
  else status = [C.red, n * 1.6 + 2 < p || n > 1.6 * p + 4
    ? tx(t, "figChAt_none", "no such nucleus: it falls apart at once")
    : tx(t, "figChAt_short", "unstable: decays in moments (not in nature)")];

  const ionTxt = charge === 0 ? tx(t, "figChAt_neutral", "neutral atom")
    : charge > 0 ? `${tx(t, "figChAt_cation", "positive ion (cation)")}: ${tx(t, "figChAt_lost", "lost")} ${charge} e⁻`
    : `${tx(t, "figChAt_anion", "negative ion (anion)")}: ${tx(t, "figChAt_gained", "gained")} ${-charge} e⁻`;

  const view = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {Array.from({ length: Math.max(0, shellsUsed) }, (_, k) => (
        <circle key={k} cx={cx} cy={cy} r={shellR(k)} fill="none" stroke={C.grid} strokeDasharray="3 3" />
      ))}
      {nuc.map((q, i) => (
        <circle key={i} cx={cx + q.x} cy={cy + q.y} r={4.6} fill={q.proton ? C.red : "#94a3b8"} stroke="var(--code-bg)" strokeWidth={0.8} />
      ))}
      {electrons.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={3.6} fill={C.sky} />)}

      {/* nuclide card */}
      <rect x={318} y={16} width={226} height={238} rx={8} fill="var(--card)" stroke="var(--border)" />
      {el ? (
        <g>
          <text x={350} y={44} fontSize={12} fill={C.amber} fontWeight={700} textAnchor="end">{A}</text>
          <text x={350} y={74} fontSize={12} fill={C.red} fontWeight={700} textAnchor="end">{p}</text>
          <text x={354} y={70} fontSize={34} fill={C.fg} fontWeight={700}>{el.sym}</text>
          {chargeTxt && <text x={356 + el.sym.length * 21} y={46} fontSize={16} fill={C.sky} fontWeight={700}>{chargeTxt}</text>}
          <T x={334} y={98} color={C.fg} size={12} bold>{`${elementName(t, el)}-${A}`}</T>
        </g>
      ) : <T x={334} y={70} color={C.muted} size={12}>—</T>}
      <T x={334} y={118} color={C.red}>{`${tx(t, "figChAt_Z", "protons Z")} = ${p} → ${tx(t, "figChAt_names", "names the element")}`}</T>
      <T x={334} y={133} color={C.amber}>{`${tx(t, "figChAt_A", "mass number A = Z + N")} = ${A}`}</T>
      <T x={334} y={148} color={C.sky}>{`${tx(t, "figChAt_charge", "charge = Z − electrons")} = ${charge > 0 ? "+" : charge < 0 ? "−" : ""}${Math.abs(charge)}`}</T>
      <T x={334} y={166} color={C.muted}>{ionTxt}</T>
      <T x={334} y={184} color={C.muted}>{`${tx(t, "figChAt_mass", "parts add up to")} ${f2(massU, 3)} u`}</T>
      {stable && <T x={334} y={198} color={C.muted}>{`${tx(t, "figChAt_real", "measured mass")} ${f2(stable[1], 3)} u`}</T>}
      {status[1].split(" · ").map((line, i) => (
        <T key={i} x={334} y={216 + i * 14} color={status[0]} bold={i === 0}>{line}</T>
      ))}
      <T x={334} y={246} color={C.muted}>{`N = ${n} ${tx(t, "figChAt_neutrons", "neutrons")}`}</T>
    </svg>
  );

  const stepper = (label: string, color: string, v: number, setV: (v: number) => void, lo: number, hi: number) => (
    <Row>
      <span className="text-[10px] font-mono w-24" style={{ color }}>{label}</span>
      <Btn onClick={() => v > lo && setV(v - 1)}>−</Btn>
      <span className="text-[11px] font-mono w-6 text-center text-[var(--text-main)]">{v}</span>
      <Btn onClick={() => v < hi && setV(v + 1)}>+</Btn>
    </Row>
  );

  return (
    <Figure title={tx(t, "figChAt_title", "Build an atom")}
      controls={<>
        {stepper(tx(t, "figChAt_bP", "protons"), C.red, p, v => set(v, n, e), 0, 20)}
        {stepper(tx(t, "figChAt_bN", "neutrons"), "#94a3b8", n, v => set(p, v, e), 0, 28)}
        {stepper(tx(t, "figChAt_bE", "electrons"), C.sky, e, v => set(p, n, v), 0, 23)}
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figChAt_goals", "build:")}</span>
          {GOALS.map(g => (
            <Readout key={g.key} color={done.has(g.key) ? C.green : undefined}>{`${done.has(g.key) ? "✓ " : ""}${tx(t, `figChAt_g_${g.key}`, g.en)}`}</Readout>
          ))}
        </Row>
      </>}
      note={tx(t, "figChAt_note", "Add and remove particles with the buttons. Change the protons and the element itself changes: 6 is always carbon, 7 always nitrogen. Change the neutrons and you get another isotope of the same element: same chemistry, different mass, and only a few combinations last (carbon-12 and carbon-13 are stable, carbon-14 decays slowly, carbon-8 cannot hold together at all). Change the electrons and you get an ion: the nucleus stays, only the charge moves. Notice the mass line: the parts add up to slightly MORE than the measured mass, because binding the nucleus releases energy (Physics, \"The Nucleus\").")}>
      {view}
    </Figure>
  );
}

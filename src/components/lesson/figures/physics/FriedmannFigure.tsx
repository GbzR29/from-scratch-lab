"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, Slider, C, T, f2 } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The history and future of the scale factor a(t), from the Friedmann
// equation with today's expansion rate H₀ = 67.7 km/s/Mpc (1/H₀ = 14.44 Gyr):
//   (da/dt)² = H₀² (Ω_r/a² + Ω_m/a + Ω_k + Ω_Λ a²),  Ω_k = 1 − Ω_r − Ω_m − Ω_Λ
// with radiation Ω_r = 9 × 10⁻⁵ fixed and the matter Ω_m and dark-energy Ω_Λ
// shares on the sliders. Written as dt = a da / (H₀ √G(a)) with
// G(a) = Ω_r + Ω_m a + Ω_k a² + Ω_Λ a⁴, the time is an integral over a
// (midpoint rule, 4000 steps). The past runs back to a = 0, the Big Bang
// (age = the integral from 0 to 1), unless G vanishes first: then a(t) turns
// round, a "bounce" with no Big Bang. The future runs on unless G vanishes
// at some a_max > 1: then the universe stops and recollapses, the curve
// mirrored about its peak, to a Big Crunch. Today is t = 0, a = 1.
// The grey band marks the ages of the oldest stars, about 12–13.5 Gyr; a
// model younger than its own stars is ruled out (the "break it" preset).

const W = 560, H = 280, OR = 9e-5, HUBBLE_TIME = 14.44;
const PX0 = 50, PX1 = 540, PY0 = 22, PY1 = 236, TMIN = -25, TMAX = 45, AMAX = 3;

type Model = { pts: [number, number][]; age: number | null; bounce: boolean; crunch: number | null; aMax: number | null };

function solve(om: number, ol: number): Model {
  const ok = 1 - OR - om - ol;
  const G = (a: number) => OR + om * a + ok * a * a + ol * a ** 4;
  const pts: [number, number][] = [];
  // the past: from a = 1 down towards 0
  const N = 4000;
  let tm = 0, a = 1, bounce = false, age: number | null = null;
  const past: [number, number][] = [[0, 1]];
  const da = 1 / N;
  while (a > 1e-6) {
    const mid = a - da / 2, g = G(mid);
    if (g <= 0) { bounce = true; break; }
    tm -= ((mid * da) / Math.sqrt(g)) * HUBBLE_TIME;
    a -= da;
    past.push([tm, Math.max(0, a)]);
    if (tm < TMIN - 5) break;
  }
  if (!bounce && a <= 1e-6) age = -tm;
  if (bounce) {
    // mirror the history about the turning point: a(t) climbs again further back
    const tb = tm, back = past.slice().reverse().map(([tt, aa]) => [2 * tb - tt, aa] as [number, number]);
    past.push(...back.filter(p => p[0] > TMIN - 5));
  }
  pts.push(...past.reverse());
  // the future: from a = 1 up, until G vanishes or time runs out
  tm = 0; a = 1;
  let aMax: number | null = null, crunch: number | null = null;
  const fut: [number, number][] = [];
  const step = 0.002;
  while (tm < TMAX + 5 && a < 60) {
    const mid = a + step / 2, g = G(mid);
    if (g <= 0) { aMax = a; break; }
    tm += ((mid * step) / Math.sqrt(g)) * HUBBLE_TIME;
    a += step;
    fut.push([tm, a]);
  }
  pts.push(...fut);
  if (aMax !== null) {
    const tTurn = tm, ageNow = age ?? 0;
    const down = fut.slice().reverse().map(([tt, aa]) => [2 * tTurn - tt, aa] as [number, number]);
    pts.push(...down);
    // the past branch mirrored too, down to a = 0
    const pastDown = past.filter(p => p[0] <= 0).map(([tt, aa]) => [2 * tTurn - tt, aa] as [number, number]).reverse();
    pts.push(...pastDown);
    crunch = 2 * tTurn + ageNow;
  }
  return { pts, age, bounce, crunch, aMax };
}

export function FriedmannFigure({ t }: { t?: TrackTranslations }) {
  const [om, setOm] = useState(0.31);
  const [ol, setOl] = useState(0.69);
  const m = useMemo(() => solve(om, ol), [om, ol]);
  const ok = 1 - OR - om - ol;
  const q0 = OR + om / 2 - ol;

  const X = (tt: number) => PX0 + ((tt - TMIN) / (TMAX - TMIN)) * (PX1 - PX0);
  const Y = (a: number) => PY1 - (Math.min(a, AMAX) / AMAX) * (PY1 - PY0);
  // the curve leaves the plot above a = AMAX instead of running along its top edge
  let path = "", pen = false;
  for (const [tt, a] of m.pts) {
    const inside = tt >= TMIN && tt <= TMAX && a <= AMAX;
    if (inside) path += `${pen ? "L" : "M"}${X(tt).toFixed(1)},${Y(a).toFixed(1)}`;
    pen = inside;
  }
  const tooYoung = m.age !== null && m.age < 12;
  const presets: [string, number, number][] = [
    [tx(t, "figPhFried_ours", "our universe"), 0.31, 0.69],
    [tx(t, "figPhFried_noDE", "break it: no dark energy"), 1, 0],
    [tx(t, "figPhFried_closed", "heavy: recollapse"), 2.5, 0],
    [tx(t, "figPhFried_empty", "empty"), 0, 0],
  ];

  const fate = m.aMax !== null
    ? `${tx(t, "figPhFried_crunch", "stops at a =")} ${f2(m.aMax, 2)} ${tx(t, "figPhFried_crunch2", "and recollapses: Big Crunch")} ${m.crunch !== null ? `${f2(m.crunch, 0)} ${tx(t, "figPhFried_gyr", "Gyr")} ${tx(t, "figPhFried_fromNow", "from now")}` : ""}`
    : ol > 0 && q0 < 0 ? tx(t, "figPhFried_accel", "expands forever, faster and faster")
      : tx(t, "figPhFried_forever", "expands forever, ever more slowly");

  return (
    <Figure title={tx(t, "figPhFried_title", "The size of the universe over time: the Friedmann equation")}
      controls={<>
        <Row>
          {presets.map(([name, a, b]) => <Btn key={name} active={Math.abs(om - a) < 0.005 && Math.abs(ol - b) < 0.005} onClick={() => { setOm(a); setOl(b); }}>{name}</Btn>)}
        </Row>
        <Slider label={tx(t, "figPhFried_om", "matter Ωm (ordinary + dark)")} value={om} min={0} max={3} step={0.01} onChange={setOm} fmt={v => f2(v, 2)} width="w-36" />
        <Slider label={tx(t, "figPhFried_ol", "dark energy ΩΛ")} value={ol} min={0} max={2} step={0.01} onChange={setOl} fmt={v => f2(v, 2)} width="w-36" />
        <Row>
          <Readout color={tooYoung ? C.red : m.bounce ? C.amber : C.green}>{m.bounce
            ? tx(t, "figPhFried_bounce", "no Big Bang: going back, a(t) turns round (a bounce)")
            : m.age === null ? tx(t, "figPhFried_old", "age: more than 30 Gyr")
            : `${tx(t, "figPhFried_age", "age")}: ${f2(m.age, 1)} ${tx(t, "figPhFried_gyr", "Gyr")}${tooYoung ? ` – ${tx(t, "figPhFried_young", "younger than its oldest stars!")}` : ""}`}</Readout>
          <Readout>{fate}</Readout>
        </Row>
        <Row>
          <Readout>{`Ωk = ${f2(ok, 2)} (${Math.abs(ok) < 0.01 ? tx(t, "figPhFried_flat", "flat") : ok > 0 ? tx(t, "figPhFried_open", "open, negatively curved") : tx(t, "figPhFried_closedC", "closed, like a sphere")})`}</Readout>
          <Readout color={q0 < 0 ? C.amber : C.fg}>{`q₀ = Ωm/2 − ΩΛ = ${f2(q0, 2)} (${q0 < 0 ? tx(t, "figPhFried_speeding", "speeding up today") : tx(t, "figPhFried_slowing", "slowing down today")})`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhFried_note", "The Friedmann equation says how fast space grows, given what fills it. Matter thins out as the universe grows, as 1/a³, and its gravity slows the expansion. Dark energy, if it is a cosmological constant, does not thin out at all, and its effect is to speed the expansion up. Every curve passes through today, a = 1, with today's measured slope H₀. Our universe (31% matter, 69% dark energy) started from a = 0 13.8 billion years ago, slowed down for its first 7.7 billion years, and has been speeding up ever since: the curve bends upward. Now remove the dark energy and fill it with matter to the same total: the curve bends the other way, and running it back reaches a = 0 only 9.6 billion years ago. But we know stars older than 12 billion years: a universe younger than its own stars is impossible. That clash was one of the hints, before 1998, that something like dark energy had to be there. Add enough matter and gravity wins: the growth stops and turns into a collapse. With much dark energy and little matter, there was not even a Big Bang.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x={X(-13.5)} y={PY0} width={X(-12) - X(-13.5)} height={PY1 - PY0} fill={C.muted} opacity={0.15} />
        <T x={X(-12.75)} y={PY0 + 10} anchor="middle" size={7.5}>{tx(t, "figPhFried_stars", "oldest stars")}</T>
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
        {[0, 1, 2, 3].map(a => (
          <g key={a}>
            <line x1={PX0} y1={Y(a)} x2={PX1} y2={Y(a)} stroke={C.grid} />
            <T x={PX0 - 5} y={Y(a) + 3} anchor="end" size={8}>{String(a)}</T>
          </g>
        ))}
        {[-20, -10, 0, 10, 20, 30, 40].map(tt => <T key={tt} x={X(tt)} y={PY1 + 12} anchor="middle" size={8}>{tt > 0 ? `+${tt}` : String(tt).replace("-", "−")}</T>)}
        <line x1={X(0)} y1={PY0} x2={X(0)} y2={PY1} stroke={C.amber} strokeDasharray="3 3" />
        <T x={X(0) + 4} y={PY0 + 10} size={8} color={C.amber}>{tx(t, "figPhFried_today", "today")}</T>
        {/* the line of constant expansion speed through today, for comparison */}
        <line x1={X(-HUBBLE_TIME)} y1={Y(0)} x2={X(-HUBBLE_TIME + AMAX * HUBBLE_TIME)} y2={Y(AMAX)} stroke={C.muted} strokeDasharray="2 4" />
        <path d={path} fill="none" stroke={tooYoung ? C.red : C.sky} strokeWidth={2} />
        <circle cx={X(0)} cy={Y(1)} r={4} fill={C.amber} />
        {m.age !== null && m.age <= -TMIN && <circle cx={X(-m.age)} cy={Y(0)} r={4} fill={tooYoung ? C.red : C.sky} />}
        {m.age !== null && m.age <= -TMIN && <T x={X(-m.age) + 7} y={Y(0) - 6} size={8} color={tooYoung ? C.red : C.sky}>{tx(t, "figPhFried_bang", "Big Bang")}</T>}
        <T x={PX0} y={14} size={8}>{tx(t, "figPhFried_aAx", "scale factor a (1 = today)")}</T>
        <T x={PX1} y={PY1 + 26} anchor="end" size={8}>{tx(t, "figPhFried_tAx", "time from today (billions of years)")}</T>
        <T x={X(-HUBBLE_TIME + 2.6 * HUBBLE_TIME) - 4} y={Y(2.6) + 14} anchor="end" size={7.5}>{tx(t, "figPhFried_const", "steady expansion, for comparison")}</T>
      </svg>
    </Figure>
  );
}

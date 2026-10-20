"use client";

import { useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Choice, Readout, Row, Slider, C, T, useFrame, useVisible, useRerender, mulberry32, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";

// ── What this figure shows ────────────────────────────────────────────────────
// Silver atoms fly from an oven through one, two or three Stern–Gerlach
// magnets. Each magnet's field gets stronger towards its pointed pole, so it
// pushes an atom up or down its own axis depending on the atom's magnetic
// moment along that axis. Each magnet's axis can be turned about the beam
// (the small dial above it: 0° = z, 90° = x); its two outputs are drawn as
// "up" and "down" along that axis. Between magnets the lower beam is blocked.
// Quantum rule: every magnet gives exactly two outcomes. The first is 50/50;
// after an atom has come out "up" along an axis at angle θ₁, the chance of
// "up" along the next axis θ₂ is cos²((θ₂ − θ₁)/2), and the atom then points
// along whichever result it got (it forgets the earlier one). So z, x, z
// brings the blocked "down" back.
// "break it: classical magnets" gives each atom a little arrow pointing in a
// random direction that never changes. A magnet then pushes it in proportion
// to the arrow's component along the axis, d = m·a: a continuous smear, not
// two spots, and z, x, z can never give "down".

const W = 560, H = 262;
const Y0 = 196, DY = 30, D = 44;                   // first beam height, rise per kept beam, final split
const OVEN = 40, SCREEN = 492, HX0 = 498, HX1 = 552, BINS = 36;
const MX = [128, 254, 380], MHALF = 24, BLOCK = 48;
const SPEED = 230;                                  // px per second
const PRESETS = {
  one: { stages: 1, last: 0 },
  zz: { stages: 2, last: 0 },
  zx: { stages: 2, last: 90 },
  zxz: { stages: 3, last: 0 },
} as const;
type Preset = keyof typeof PRESETS;

type Atom = { x: number; defl: number[]; die: number; yEnd: number; up: boolean };
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/** Height of an atom on its way: each magnet it has entered adds its own push. */
function atomY(a: Atom, stages: number) {
  let y = Y0;
  for (let i = 0; i < a.defl.length; i++) {
    const x0 = MX[i] - MHALF, x1 = i < stages - 1 ? MX[i] + BLOCK : SCREEN;
    y -= a.defl[i] * smooth((a.x - x0) / (x1 - x0));
  }
  return y;
}

export function SternGerlachFigure({ t }: { t?: TrackTranslations }) {
  const [preset, setPreset] = useState<Preset>("zxz");
  const [last, setLast] = useState<number>(PRESETS.zxz.last);
  const [rate, setRate] = useState(18);
  const [classical, setClassical] = useState(false);
  const [playing, setPlaying] = useState(true);
  const vis = useVisible<HTMLDivElement>();
  const rerender = useRerender();
  const sim = useRef({ atoms: [] as Atom[], due: 0, fired: 0, up: 0, down: 0, blocked: 0, bins: new Array<number>(BINS).fill(0), rnd: mulberry32(7) });

  const stages = PRESETS[preset].stages;
  const axes = stages === 1 ? [last] : stages === 2 ? [0, last] : [0, 90, last];
  const yc = Y0 - (stages - 1) * DY;                  // height of the beam entering the last magnet
  const binOf = (y: number) => Math.floor(((y - (yc - D - 14)) / (2 * D + 28)) * BINS);

  const reset = () => {
    const s = sim.current;
    s.atoms = []; s.fired = 0; s.up = 0; s.down = 0; s.blocked = 0; s.bins.fill(0);
    rerender();
  };
  const pick = (p: Preset) => { setPreset(p); setLast(PRESETS[p].last); reset(); };

  /** Decide an atom's whole flight when it leaves the oven. */
  const fire = (): Atom => {
    const s = sim.current, rnd = s.rnd, defl: number[] = [];
    let die = Infinity, up = false, yEnd = 0;
    if (classical) {
      // a fixed arrow pointing anywhere: uniform on the sphere
      const z = 2 * rnd() - 1, ph = 2 * Math.PI * rnd(), sx = Math.sqrt(1 - z * z) * Math.cos(ph);
      for (let i = 0; i < stages; i++) {
        const th = (axes[i] * Math.PI) / 180, d = sx * Math.sin(th) + z * Math.cos(th);
        if (i < stages - 1) {
          defl.push(DY * d);
          if (d < 0) { die = MX[i] + BLOCK; break; }
        } else { defl.push(D * d); up = d > 0; }
      }
    } else {
      let state: number | null = null;                // axis (deg) the atom points along, if known
      for (let i = 0; i < stages; i++) {
        const pUp: number = state === null ? 0.5 : Math.cos(((axes[i] - state) * Math.PI) / 360) ** 2;
        const isUp: boolean = rnd() < pUp;
        state = isUp ? axes[i] : axes[i] + 180;
        if (i < stages - 1) {
          defl.push(isUp ? DY : -DY);
          if (!isUp) { die = MX[i] + BLOCK; break; }
        } else { defl.push(isUp ? D : -D); up = isUp; }
      }
    }
    if (die === Infinity) yEnd = yc - defl[stages - 1] + (rnd() + rnd() + rnd() - 1.5) * 3.2;
    return { x: OVEN, defl, die, yEnd, up };
  };

  useFrame(playing && vis.on, dt => {
    const s = sim.current;
    s.due += dt * rate;
    while (s.due >= 1) { s.due -= 1; s.atoms.push(fire()); s.fired++; }
    const keep: Atom[] = [];
    for (const a of s.atoms) {
      a.x += SPEED * dt;
      if (a.x >= a.die) { s.blocked++; continue; }
      if (a.x >= SCREEN) {
        if (a.up) s.up++; else s.down++;
        const b = binOf(a.yEnd);
        if (b >= 0 && b < BINS) s.bins[b]++;
        continue;
      }
      keep.push(a);
    }
    s.atoms = keep;
    rerender();
  });

  const s = sim.current;
  const landed = s.up + s.down;
  const binMax = Math.max(4, ...s.bins);
  const pUp = stages === 1 ? 0.5 : Math.cos(((axes[stages - 1] - axes[stages - 2]) * Math.PI) / 360) ** 2;
  const axisName = (a: number) => (a === 0 ? "z" : a === 90 ? "x" : `${a}°`);

  return (
    <Figure title={tx(t, "figPhSg_title", "Stern–Gerlach: measuring a silver atom's spin")}
      head={<Btn active={classical} onClick={() => { setClassical(c => !c); reset(); }}>{tx(t, "figPhSg_broken", "break it: classical magnets")}</Btn>}
      controls={<>
        <Row>
          <Choice value={preset} onChange={pick} options={[
            ["one", tx(t, "figPhSg_one", "one magnet")],
            ["zz", "z → z"],
            ["zx", "z → x"],
            ["zxz", "z → x → z"],
          ] as const} />
        </Row>
        <Slider label={tx(t, "figPhSg_last", "last magnet's axis")} value={last} min={0} max={180} step={5}
          onChange={v => { setLast(v); reset(); }} fmt={v => `${v}°`} width="w-32" />
        <Slider label={tx(t, "figPhSg_rate", "atoms per second")} value={rate} min={2} max={60} step={1} onChange={setRate} fmt={v => String(v)} width="w-32" />
        <Row>
          <Readout>{`${tx(t, "figPhSg_fired", "fired")} ${s.fired} · ${tx(t, "figPhSg_blocked", "blocked")} ${s.blocked}`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhSg_up", "up")} ${s.up} (${landed ? f2((s.up / landed) * 100, 0) : "–"}%)`}</Readout>
          <Readout color={C.pink}>{`${tx(t, "figPhSg_down", "down")} ${s.down} (${landed ? f2((s.down / landed) * 100, 0) : "–"}%)`}</Readout>
          {!classical && <Readout color={C.amber}>{stages === 1
            ? `${tx(t, "figPhSg_rule", "quantum rule")}: 50%`
            : `${tx(t, "figPhSg_rule", "quantum rule")}: cos²(${Math.abs(axes[stages - 1] - axes[stages - 2])}°/2) = ${f2(pUp * 100, 0)}%`}</Readout>}
        </Row>
      </>}
      note={tx(t, "figPhSg_note", "In 1922 Otto Stern and Walther Gerlach sent silver atoms through a magnet whose field is much stronger near its pointed pole. Each atom is a tiny magnet, and a field that changes across the beam pushes it up or down depending on which way it points. Classically the atoms point every which way, so the beam should smear into a line: switch on the break-it button to see that. Instead the beam split into two spots, and only two, whatever the magnet's angle. Now chain the magnets and block the lower beam between them. z then z: every atom that came out up comes out up again; the measurement is repeatable. z then x: half and half; knowing z tells you nothing about x. z, x, z: the down atoms are back, half of them, even though they were all removed by the first magnet! Measuring x wiped out what the atom 'knew' about z. Turn the last magnet's dial: the share coming out up follows cos²(θ/2) of the angle between the last two magnets, the rule of spin ½. Each magnet's two outputs are drawn up and down along its own axis.")}>
      <div ref={vis.ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* oven */}
          <rect x={8} y={Y0 - 16} width={OVEN - 10} height={32} rx={4} fill={C.orange} opacity={0.75} />
          <T x={OVEN - 16} y={Y0 + 30} anchor="middle" size={8}>{tx(t, "figPhSg_oven", "oven")}</T>

          {/* magnets */}
          {axes.map((ax, i) => {
            const base = Y0 - i * DY, x = MX[i];
            const ang = (ax * Math.PI) / 180, dx = Math.sin(ang) * 11, dy = -Math.cos(ang) * 11;
            return (
              <g key={i}>
                <path d={`M${x - MHALF},${base - 46}H${x + MHALF}V${base - 20}L${x},${base - 9}L${x - MHALF},${base - 20}Z`} fill={C.red} opacity={0.75} />
                <path d={`M${x - MHALF},${base + 46}H${x + MHALF}V${base + 14}H${x + 7}V${base + 20}H${x - 7}V${base + 14}H${x - MHALF}Z`} fill={C.blue} opacity={0.75} />
                <T x={x} y={base - 31} anchor="middle" size={9} color="#fff" bold>N</T>
                <T x={x} y={base + 37} anchor="middle" size={9} color="#fff" bold>S</T>
                {/* the dial: the magnet's axis seen along the beam */}
                <circle cx={x} cy={base - 66} r={13} fill="none" stroke={C.axis} />
                <line x1={x - dx} y1={base - 66 - dy} x2={x + dx} y2={base - 66 + dy} stroke={C.amber} strokeWidth={2} />
                <circle cx={x + dx} cy={base - 66 + dy} r={2.6} fill={C.amber} />
                <T x={x + 17} y={base - 63} size={8.5} color={C.amber} bold>{axisName(ax)}</T>
                {i < stages - 1 && <rect x={x + BLOCK} y={base + 4} width={6} height={DY + 14} fill={C.fg} opacity={0.8} />}
              </g>
            );
          })}

          {/* screen and tally */}
          <rect x={SCREEN} y={yc - D - 18} width={4} height={2 * D + 36} fill={C.fg} opacity={0.7} />
          {s.bins.map((n, i) => {
            const h = (2 * D + 28) / BINS, y = yc - D - 14 + i * h;
            return n > 0 && <rect key={i} x={HX0} y={y} width={(n / binMax) * (HX1 - HX0)} height={h - 0.5}
              fill={y + h / 2 < yc ? C.sky : C.pink} opacity={0.8} />;
          })}
          <T x={HX1} y={yc - D - 24} anchor="end" size={8}>{tx(t, "figPhSg_screen", "screen")}</T>

          {/* atoms */}
          {s.atoms.map((a, i) => (
            <circle key={i} cx={a.x} cy={atomY(a, stages)} r={2.4} fill={C.fg} opacity={0.85} />
          ))}
          <T x={10} y={16} size={8}>{classical
            ? tx(t, "figPhSg_keyC", "classical: each atom a fixed arrow, pushed by its component along the axis")
            : tx(t, "figPhSg_keyQ", "quantum: two outcomes per magnet, lower beam blocked between magnets")}</T>
        </svg>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} onReset={reset}
          readout={`${landed} ${tx(t, "figPhSg_landed", "on the screen")}`} />
      </div>
    </Figure>
  );
}

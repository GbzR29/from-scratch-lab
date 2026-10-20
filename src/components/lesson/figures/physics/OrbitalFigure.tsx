"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Readout, Row, C, T, useFrame, useVisible, f2 } from "@/components/lesson/kit/figure";
import { Transport } from "@/components/lesson/kit/Transport";
import { NAMES, radial, rMax, sampleCloud } from "./hydrogenMath";

// ── What this figure shows ────────────────────────────────────────────────────
// Left: a hydrogen orbital as a cloud of 4000 dots scattered with density
// |ψ_nlm|², the exact solution of the Schrödinger equation (hydrogenMath.ts).
// Each dot is one place the electron could be found; amber where ψ > 0, blue
// where ψ < 0 (the sign matters when orbitals combine into chemical bonds).
// Drag to turn it; it turns by itself while playing. Right: the radial
// probability P(r) = r² R²(r), the chance of finding the electron at distance
// r from the nucleus, with Bohr's orbit radius n²a₀ marked. Readouts: the
// energy, which depends only on n, and the nodes: n − l − 1 spheres and l
// planes or cones where ψ = 0.

const W = 560, H = 290, CW = 280, CH = 280;
const PX0 = 318, PX1 = 548, PY0 = 30, PY1 = 236;
const L_NAMES = ["s", "p", "d", "f"];

export function OrbitalFigure({ t }: { t?: TrackTranslations }) {
  const [n, setN] = useState(3);
  const [l, setL] = useState(2);
  const [m, setM] = useState(0);
  const [yaw, setYaw] = useState(0.6);
  const [playing, setPlaying] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; yaw: number } | null>(null);
  const vis = useVisible<HTMLDivElement>();
  useFrame(playing && vis.on && !drag.current, dt => setYaw(v => v + dt * 0.35));

  const dots = useMemo(() => sampleCloud(n, l, m, 4000, 7 + n * 16 + l * 4 + m), [n, l, m]);
  const extent = useMemo(() => {
    const rs = dots.map(d => Math.hypot(d.x, d.y, d.z)).sort((a, b) => a - b);
    return rs[Math.floor(rs.length * 0.97)] || 1;
  }, [dots]);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);
    const c = Math.cos(yaw), s = Math.sin(yaw), tilt = 0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
    const k = (CW / 2 - 14) / extent;
    for (const d of dots) {
      const x1 = d.x * c - d.y * s, y1 = d.x * s + d.y * c;   // turn about the z axis
      const z2 = d.z * ct - y1 * st, depth = d.z * st + y1 * ct; // tip towards the viewer
      ctx.globalAlpha = 0.35 + 0.35 * Math.max(-1, Math.min(1, -depth / extent));
      ctx.fillStyle = d.sign > 0 ? "#f59e0b" : "#38bdf8";
      ctx.fillRect(CW / 2 + x1 * k - 0.8, CH / 2 - z2 * k - 0.8, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(CW / 2, CH / 2, 2.5, 0, 2 * Math.PI); ctx.fill();
  }, [dots, yaw, extent]);

  // radial probability
  const R = Math.min(rMax(n), extent * 1.6);
  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    let top = 0;
    for (let i = 0; i <= 300; i++) {
      const r = (i / 300) * R, p = r * r * radial(n, l, r) ** 2;
      pts.push([r, p]); top = Math.max(top, p);
    }
    const best = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
    return { pts, top, best: best[0] };
  }, [n, l, R]);
  const X = (r: number) => PX0 + (r / R) * (PX1 - PX0);
  const Y = (p: number) => PY1 - (p / curve.top) * (PY1 - PY0 - 10);
  const d = curve.pts.map(([r, p], i) => `${i ? "L" : "M"}${X(r).toFixed(1)},${Y(p).toFixed(1)}`).join("");

  const setNl = (nn: number, ll: number) => {
    const l2 = Math.min(ll, nn - 1);
    setN(nn); setL(l2); setM(mm => (Math.abs(mm) <= l2 ? mm : 0));
  };
  const name = `${n}${NAMES[`${l},${m}`]}`;
  const mOpts = Array.from({ length: 2 * l + 1 }, (_, i) => i - l).sort((a, b) => Math.abs(a) - Math.abs(b) || b - a);

  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, yaw }; (e.target as Element).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (drag.current) setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.012); };
  const onUp = () => { drag.current = null; };

  return (
    <Figure title={tx(t, "figPhOrb_title", "Hydrogen orbitals: where the electron can be found")}
      controls={<>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-6">n</span>
          <Choice value={String(n)} onChange={v => setNl(Number(v), l)} options={[1, 2, 3, 4].map(k => [String(k), String(k)] as const)} />
        </Row>
        <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-6">l</span>
          <Choice value={String(l)} onChange={v => setNl(n, Number(v))} options={L_NAMES.slice(0, n).map((s, k) => [String(k), `${k} (${s})`] as const)} />
        </Row>
        {l > 0 && <Row>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-6">m</span>
          <Choice value={String(m)} onChange={v => setM(Number(v))} options={mOpts.map(k => [String(k), NAMES[`${l},${k}`]] as const)} />
        </Row>}
        <Row>
          <Readout color={C.amber}>{`${name}: E = −13.6/${n}² = ${f2(-13.6 / (n * n), 2)} eV`}</Readout>
          <Readout>{`${tx(t, "figPhOrb_radial", "spherical nodes")} n − l − 1 = ${n - l - 1}`}</Readout>
          <Readout>{`${tx(t, "figPhOrb_angular", "angular nodes")} l = ${l}`}</Readout>
          <Readout color={C.sky}>{`${tx(t, "figPhOrb_best", "most likely distance")}: ${f2(curve.best, 1)} a₀`}</Readout>
        </Row>
      </>}
      note={tx(t, "figPhOrb_note", "Solving the Schrödinger equation for the electron around a proton gives these shapes. There is no orbit: each dot is a place where the electron might be found if you looked, scattered with density |ψ|². Three whole numbers label each shape. n sets the energy and the size; l, from 0 to n − 1, sets the shape (s, p, d, f) and the angular momentum; m, from −l to l, sets the orientation. Start with 1s: a fuzzy ball, most likely found at exactly one Bohr radius, 0.053 nm, which is where Bohr put his orbit. Then try 2s and 3s: balls inside balls, separated by spherical nodes where the electron is never found. The p orbitals are two lobes with a nodal plane between them; d orbitals have four lobes or a ring. Amber and blue mark the sign of ψ, which matters when atoms share electrons in bonds. All orbitals with the same n have the same energy in hydrogen. Drag to turn the cloud.")}>
      <div ref={vis.ref}>
        <div className="relative">
          <canvas ref={canvas} width={CW} height={CH} className="absolute"
            style={{ left: `${(8 / W) * 100}%`, top: `${(4 / H) * 100}%`, width: `${(CW / W) * 100}%`, height: `${(CH / H) * 100}%`, background: "#05070c", borderRadius: 8, touchAction: "none", cursor: "grab" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto relative" pointerEvents="none">
            <T x={16} y={18} size={9} color="#e5e7eb" bold>{name}</T>
            <T x={16} y={H - 14} size={7.5} color="#9ca3af">{tx(t, "figPhOrb_drag", "drag to turn · z axis up")}</T>
            <T x={PX0} y={PY0 - 12} size={8}>{tx(t, "figPhOrb_p", "chance at distance r: r² R²(r)")}</T>
            <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={C.axis} />
            <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.axis} />
            <path d={`${d}L${X(R)},${PY1}L${PX0},${PY1}Z`} fill={C.amber} opacity={0.15} />
            <path d={d} fill="none" stroke={C.amber} strokeWidth={2} />
            {n * n <= R && <>
              <line x1={X(n * n)} y1={PY0} x2={X(n * n)} y2={PY1} stroke={C.red} strokeDasharray="4 3" />
              <T x={X(n * n) + 3} y={PY0 + 8} size={8} color={C.red}>{`Bohr: n²a₀ = ${n * n}`}</T>
            </>}
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
              <T key={f} x={X(f * R)} y={PY1 + 12} anchor="middle" size={8}>{f2(f * R, 0)}</T>
            ))}
            <T x={PX1} y={PY1 + 24} anchor="end" size={8}>{tx(t, "figPhOrb_r", "r (Bohr radii, a₀ = 0.053 nm)")}</T>
          </svg>
        </div>
        <Transport t={t} playing={playing} onPlay={() => setPlaying(p => !p)} readout={name} />
      </div>
    </Figure>
  );
}

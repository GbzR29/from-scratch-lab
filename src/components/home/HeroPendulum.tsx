"use client";

// ── Hero figure: the simple pendulum ────────────────────────────────────────
// A small live figure next to the home page title, drawn like the lessons'
// figures: one slider (the length L) and the period it gives, T = 2π√(L/g).
// Small-angle motion, θ(t) = θ₀ cos(ωt) with ω = √(g/L). It only animates
// while on screen, and stays still when the reader prefers reduced motion.

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Strings = Record<string, string | undefined>;

const G = 9.81;          // m/s²
const THETA0 = 0.36;     // rad, amplitude (small enough for the formula)
const PIVOT = { x: 220, y: 26 };
const lengthPx = (L: number) => 70 + L * 120; // 0.25 m → 100 px, 1.5 m → 250 px

export default function HeroPendulum() {
  const { t, language } = useLanguage();
  const ui = t as unknown as Strings;
  const [L, setL] = useState(1);
  const [theta, setTheta] = useState(THETA0 * 0.8);
  const figRef = useRef<HTMLElement>(null);
  const lRef = useRef(L);
  useEffect(() => { lRef.current = L; }, [L]);

  // ── Animation: runs only while visible ────────────────────────────────────
  useEffect(() => {
    const el = figRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let phase = Math.acos(0.8); // start where the still frame is
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      phase += Math.sqrt(G / lRef.current) * dt; // advancing the phase keeps the motion smooth when L changes
      setTheta(THETA0 * Math.cos(phase));
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const len = lengthPx(L);
  const bob = { x: PIVOT.x + len * Math.sin(theta), y: PIVOT.y + len * Math.cos(theta) };
  const swing = (s: number) => ({ x: PIVOT.x + len * Math.sin(s * THETA0), y: PIVOT.y + len * Math.cos(s * THETA0) });
  const left = swing(-1), right = swing(1);
  const period = 2 * Math.PI * Math.sqrt(L / G);
  const num = (v: number, d: number) => v.toLocaleString(language === "pt" ? "pt-BR" : "en", { minimumFractionDigits: d, maximumFractionDigits: d });
  // the θ arc, 46 px from the pivot, from the vertical to the string
  const arcR = 46;
  const arcEnd = { x: PIVOT.x + arcR * Math.sin(theta), y: PIVOT.y + arcR * Math.cos(theta) };

  return (
    <figure className="hm-figure" ref={figRef}>
      <div className="hm-fig-head">
        <b>fig. 0</b>
        <span>{ui.homeFigCaption ?? "the simple pendulum"}</span>
        <span className="hm-fig-hint"><i />{ui.homeFigHint ?? "move it"}</span>
      </div>
      <svg className="hm-fig-stage" viewBox="0 0 440 320" role="img" aria-label={ui.homeFigAria ?? "A simple pendulum swinging; its length sets the period"}>
        <path d="M150 26 H290" stroke="currentColor" strokeWidth="3" />
        <path d="M160 26 l-8 -10 M180 26 l-8 -10 M200 26 l-8 -10 M220 26 l-8 -10 M240 26 l-8 -10 M260 26 l-8 -10 M280 26 l-8 -10" stroke="currentColor" strokeWidth="1.3" />
        <g fill="none" stroke="var(--hm-draw)" strokeWidth="1.2" opacity="0.75">
          <path d={`M${PIVOT.x} ${PIVOT.y} V${PIVOT.y + len + 30}`} strokeDasharray="10 4 2 4" />
          <path d={`M${left.x} ${left.y} A${len} ${len} 0 0 0 ${right.x} ${right.y}`} strokeDasharray="3 5" />
        </g>
        <path d={`M${PIVOT.x} ${PIVOT.y} L${bob.x} ${bob.y}`} stroke="currentColor" strokeWidth="2" />
        <path d={`M${PIVOT.x} ${PIVOT.y + arcR} A${arcR} ${arcR} 0 0 ${theta > 0 ? 0 : 1} ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x={PIVOT.x + (theta > 0 ? 8 : -20)} y={PIVOT.y + arcR + 22} fontFamily="var(--font-spectral), serif" fontStyle="italic" fontSize="19" fill="currentColor">θ</text>
        <circle cx={bob.x} cy={bob.y} r="16" fill="var(--hm-accent)" />
        <path d={`M${bob.x} ${bob.y + 17} V${bob.y + 52}`} stroke="var(--hm-draw)" strokeWidth="2" />
        <path d={`M${bob.x - 5} ${bob.y + 44} L${bob.x} ${bob.y + 54} L${bob.x + 5} ${bob.y + 44}`} fill="none" stroke="var(--hm-draw)" strokeWidth="2" />
        <text x={bob.x + 10} y={bob.y + 52} fontFamily="var(--font-spectral), serif" fontStyle="italic" fontSize="17" fill="var(--hm-draw)">mg</text>
        <text x="300" y="70" fontFamily="var(--font-plex-mono), monospace" fontSize="12" fill="currentColor">L = {num(L, 2)} m</text>
      </svg>
      <div className="hm-fig-foot">
        <label>
          <span>{ui.homeFigLength ?? "length L"}<b>{num(L, 2)} m</b></span>
          <input type="range" min={0.25} max={1.5} step={0.05} value={L} onChange={(e) => setL(Number(e.target.value))} />
        </label>
        <div className="hm-fig-formula">
          <i>T</i> = 2π√(<i>L</i>/<i>g</i>) = <b>{num(period, 2)} s</b>
        </div>
      </div>
    </figure>
  );
}

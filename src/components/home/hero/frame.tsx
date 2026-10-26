"use client";

// ── Hero figure frame ───────────────────────────────────────────────────────
// What every home-page hero figure shares: the card (head with "fig. 0", a
// caption and the hint), the gridded 440 × 320 stage, and a foot with one
// slider and the formula it drives. useHeroClock runs a figure's animation
// only while it is on screen, and not at all when the reader prefers reduced
// motion. Styles: .hm-figure … in src/styles/home.css.

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export type Strings = Record<string, string | undefined>;

/** What the hero picker and the gallery hand every figure. */
export type HeroProps = {
  ui: Strings;
  /** Locale-aware number with d decimals. */
  num: (v: number, d: number) => string;
  /** Shows the next figure of the deck (the hero only; gallery cards have no button). */
  onNext?: () => void;
  /** The number in the head: "0" in the hero, "3.1"… in the gallery. */
  figNo?: string;
};

/** Font shorthands for SVG text in the drawings. */
export const SERIF = "var(--font-spectral), serif";
export const MONO = "var(--font-plex-mono), monospace";

/**
 * Calls tick(dt) every frame while the element is on screen. dt is in seconds,
 * capped at 0.05 s so a background tab does not jump.
 */
export function useHeroClock(ref: RefObject<HTMLElement | null>, tick: (dt: number) => void) {
  const tickRef = useRef(tick);
  useEffect(() => { tickRef.current = tick; });
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = 0;
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      tickRef.current(dt);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [ref]);
}

export function HeroFrame({ figRef, ui, onNext, figNo = "0", caption, aria, slider, formula, children }: {
  figRef: RefObject<HTMLElement | null>;
  ui: Strings;
  onNext?: () => void;
  figNo?: string;
  caption: string;
  aria: string;
  /** The one control: label, shown value and the range input. */
  slider: { label: string; value: string; min: number; max: number; step: number; at: number; set: (v: number) => void };
  formula: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="hm-figure" ref={figRef}>
      <div className="hm-fig-head">
        <b>fig. {figNo}</b>
        <span>{caption}</span>
        <span className="hm-fig-hint"><i />{ui.homeFigHint ?? "move it"}</span>
        {onNext && (
          <button type="button" className="hm-fig-next" onClick={onNext} aria-label={ui.homeFigNextAria ?? "Show another figure"}>
            {ui.homeFigNext ?? "another"} →
          </button>
        )}
      </div>
      <svg className="hm-fig-stage" viewBox="0 0 440 320" role="img" aria-label={aria}>
        {children}
      </svg>
      <div className="hm-fig-foot">
        <label>
          <span>{slider.label}<b>{slider.value}</b></span>
          <input type="range" min={slider.min} max={slider.max} step={slider.step} value={slider.at}
            onChange={(e) => slider.set(Number(e.target.value))} />
        </label>
        <div className="hm-fig-formula">{formula}</div>
      </div>
    </figure>
  );
}

"use client";

// ── Ball-and-stick molecule drawing ──────────────────────────────────────────
// The 3D molecule every Chemistry figure draws: shaded atoms, single, double
// and triple bonds, lone pairs as soft lobes, and arrows (bond and molecular
// dipoles), all depth-sorted and seen through an orbit that the reader drags
// (kit/scene3d useOrbit). Positions are in ångström-like units around the
// origin; `unit` sets how many pixels one unit spans. A figure owns the orbit
// and passes it in, so its own buttons can reset or turn the view.

import { useId, type ReactNode } from "react";
import { makeProjector, add, scale, norm, type V3, type useOrbit } from "@/components/lesson/kit/scene3d";

export type MolAtom = { p: V3; color: string; r: number; label?: string };
export type MolBond = { a: number; b: number; order?: number };
export type MolLobe = { at: V3; dir: V3 };
export type MolArrow = { from: V3; to: V3; color: string; width?: number };

type OrbitApi = ReturnType<typeof useOrbit>;

export function MoleculeView({ orbit, W, H, unit, atoms, bonds, lobes = [], arrows = [], children, cx = W / 2, cy = H / 2 }: {
  orbit: OrbitApi; W: number; H: number; unit: number;
  atoms: MolAtom[]; bonds: MolBond[]; lobes?: MolLobe[]; arrows?: MolArrow[];
  /** Flat overlay drawn on top (labels, legends). */
  children?: ReactNode;
  /** Where the origin lands in the drawing. */
  cx?: number; cy?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const proj = makeProjector(orbit.orbit, cx, cy, unit);
  const k = (depth: number) => (9 / Math.max(0.5, depth)) * orbit.orbit.zoom;          // pixels per unit at a depth, / unit

  type Item = { depth: number; node: ReactNode };
  const items: Item[] = [];

  bonds.forEach((b, i) => {
    const A = proj(atoms[b.a].p), B = proj(atoms[b.b].p);
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const o = b.order ?? 1, w = 4.2 * k((A.depth + B.depth) / 2) * (o > 1 ? 0.6 : 1);
    // start and end at the spheres' rims, so a bond in front never hides an atom's label
    const ra = Math.min(L * 0.45, atoms[b.a].r * unit * k(A.depth) * 0.8), rb = Math.min(L * 0.45, atoms[b.b].r * unit * k(B.depth) * 0.8);
    const ux = dx / L, uy = dy / L;
    const a0 = { x: A.x + ux * ra, y: A.y + uy * ra }, b0 = { x: B.x - ux * rb, y: B.y - uy * rb };
    items.push({
      depth: (A.depth + B.depth) / 2 + 0.01,
      node: (
        <g key={`b${i}`}>
          {Array.from({ length: o }, (_, j) => {
            const off = (j - (o - 1) / 2) * w * 1.25;
            return <line key={j} x1={a0.x + nx * off} y1={a0.y + ny * off} x2={b0.x + nx * off} y2={b0.y + ny * off}
              stroke="#94a3b8" strokeWidth={w} strokeLinecap="round" />;
          })}
        </g>
      ),
    });
  });

  lobes.forEach((l, i) => {
    const d = norm(l.dir);
    const base = proj(add(l.at, scale(d, 0.18))), tip = proj(add(l.at, scale(d, 1.0))), mid = proj(add(l.at, scale(d, 0.6)));
    const len = Math.hypot(tip.x - base.x, tip.y - base.y);
    const ry = 0.3 * unit * k(mid.depth);
    const rx = Math.max(ry * 0.9, len / 2 + ry * 0.35);
    const ang = (Math.atan2(tip.y - base.y, tip.x - base.x) * 180) / Math.PI;
    items.push({
      depth: mid.depth,
      node: <ellipse key={`l${i}`} cx={(base.x + tip.x) / 2} cy={(base.y + tip.y) / 2} rx={rx} ry={ry}
        transform={`rotate(${ang} ${(base.x + tip.x) / 2} ${(base.y + tip.y) / 2})`}
        fill="#a855f7" fillOpacity={0.28} stroke="#a855f7" strokeOpacity={0.6} />,
    });
  });

  atoms.forEach((a, i) => {
    const P = proj(a.p), rr = a.r * unit * k(P.depth);
    items.push({
      depth: P.depth,
      node: (
        <g key={`a${i}`}>
          <circle cx={P.x} cy={P.y} r={rr} fill={`url(#${uid}g${i})`} stroke="#0f172a" strokeOpacity={0.35} strokeWidth={0.8} />
          {a.label && <text x={P.x} y={P.y + Math.min(4.5, rr * 0.4)} fontSize={Math.min(13, Math.max(8, rr * 0.9))} fontWeight={700} textAnchor="middle"
            fill={a.color === "#f1f5f9" ? "#0f172a" : "#fff"} style={{ pointerEvents: "none" }}>{a.label}</text>}
        </g>
      ),
    });
  });

  items.sort((p, q) => q.depth - p.depth);                   // far first

  return (
    <svg ref={orbit.ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ touchAction: "none", cursor: "grab" }} {...orbit.handlers}>
      <defs>
        {atoms.map((a, i) => (
          <radialGradient key={i} id={`${uid}g${i}`} cx="35%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
            <stop offset="35%" stopColor={a.color} />
            <stop offset="100%" stopColor={a.color} stopOpacity={0.75} />
          </radialGradient>
        ))}
      </defs>
      {items.map(it => it.node)}
      {arrows.map((ar, i) => {
        const A = proj(ar.from), B = proj(ar.to), w = ar.width ?? 2.2;
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy);
        if (L < 2) return null;
        const ux = dx / L, uy = dy / L, hl = Math.min(10, L * 0.45);
        return (
          <g key={`r${i}`}>
            <line x1={A.x} y1={A.y} x2={B.x - ux * hl * 0.6} y2={B.y - uy * hl * 0.6} stroke={ar.color} strokeWidth={w} />
            <path d={`M${B.x},${B.y} L${B.x - ux * hl - uy * hl * 0.5},${B.y - uy * hl + ux * hl * 0.5} L${B.x - ux * hl + uy * hl * 0.5},${B.y - uy * hl - ux * hl * 0.5} Z`} fill={ar.color} />
          </g>
        );
      })}
      {children}
    </svg>
  );
}

/** Rotation taking unit vector a onto unit vector b (Rodrigues), as a function on points. */
export function alignRotation(a: V3, b: V3): (p: V3) => V3 {
  const u = norm(a), v = norm(b);
  const c = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  if (c > 0.999999) return p => p;
  let axis: V3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (Math.hypot(...axis) < 1e-6) axis = Math.abs(u[0]) < 0.9 ? [0, -u[2], u[1]] : [-u[2], 0, u[0]];
  const kx = norm(axis), ang = Math.acos(Math.max(-1, Math.min(1, c))), s = Math.sin(ang), co = Math.cos(ang);
  return p => {
    const d = kx[0] * p[0] + kx[1] * p[1] + kx[2] * p[2];
    const cr: V3 = [kx[1] * p[2] - kx[2] * p[1], kx[2] * p[0] - kx[0] * p[2], kx[0] * p[1] - kx[1] * p[0]];
    return [0, 1, 2].map(i => p[i] * co + cr[i] * s + kx[i] * d * (1 - co)) as V3;
  };
}

// ── How the shards move ───────────────────────────────────────────────────────
// Two answers to "where is shard i at time t":
//   closed form  each shard keeps its start velocity v and spin ω; the vertex
//                shader evaluates c₀ + v·t + ½g·t² and a rotation by |ω|·t.
//                Cheap and exact, but it knows nothing about the floor.
//   baked (VAT)  a small rigid-body simulation runs once, here on the CPU, and
//                every frame's centre and orientation are written into a
//                float texture: a vertex animation texture. The vertex shader
//                only reads it back. Shard-to-shard collisions are left out.

import { mulberry32 } from "@/components/lesson/kit/figure";
import { THICK, type Shard } from "./fracture";

export const G = 9.81, FPS = 60, FRAMES = 150;
const SUB = 8, E = 0.25, MU = 0.5, DENSITY = 2500;

type V3 = [number, number, number];
type Q = [number, number, number, number];          // x, y, z, w

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Rotates v by the unit quaternion q: v + 2·qv × (qv × v + w·v). */
function rot(q: Q, v: V3): V3 {
  const u: V3 = [q[0], q[1], q[2]];
  const t = cross(u, v).map((x, i) => x + q[3] * v[i]) as V3;
  const c = cross(u, t);
  return [v[0] + 2 * c[0], v[1] + 2 * c[1], v[2] + 2 * c[2]];
}
const conj = (q: Q): Q => [-q[0], -q[1], -q[2], q[3]];
function normQ(q: Q): Q { const l = Math.hypot(...q) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; }

/** Start of every shard's flight, shared by both methods. */
export type Launch = { c0: V3; v: V3; w: V3; delay: number };

export function launches(shards: Shard[], impact: [number, number], push: number, seed = 3): Launch[] {
  const rnd = mulberry32(seed);
  return shards.map(s => {
    const dx = s.c[0] - impact[0], dy = s.c[1] - impact[1], d = Math.max(s.dist, 1e-3);
    const near = Math.exp(-d / 0.3);
    // Pushed into the room near the stone, sprayed outwards a little, and everything topples forward
    const out = push * 0.35 * near;
    const v: V3 = [dx / d * out + (rnd() - 0.5) * 0.3, dy / d * out + rnd() * 0.3 * near, push * near * (0.6 + 0.8 * rnd()) + 0.2 + 0.4 * rnd()];
    let a: V3 = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5];
    const al = Math.hypot(...a) || 1;
    const spin = 1 + 9 * near * push / 2;
    a = [a[0] / al * spin + 0.8, a[1] / al * spin, a[2] / al * spin];   // + x: the top tips towards the room
    return { c0: [s.c[0], s.c[1], 0], v, w: a, delay: d * 0.15 };
  });
}

/** Closed-form data texture: row 0 = (c₀, delay), row 1 = (v, 0), row 2 = (ω, 0). Width = shard count. */
export function launchTexels(ls: Launch[]): Float32Array {
  const n = ls.length, out = new Float32Array(n * 3 * 4);
  ls.forEach((l, i) => {
    out.set([...l.c0, l.delay], i * 4);
    out.set([...l.v, 0], (n + i) * 4);
    out.set([...l.w, 0], (2 * n + i) * 4);
  });
  return out;
}

/**
 * Runs the rigid-body simulation and bakes it: for frame f, row 2f holds every
 * shard's centre and row 2f + 1 its orientation quaternion. Width = shard count.
 */
export function bakeVAT(shards: Shard[], ls: Launch[]): Float32Array {
  const n = shards.length, out = new Float32Array(n * FRAMES * 2 * 4);
  const dt = 1 / (FPS * SUB), h = THICK / 2;
  const bodies = shards.map((s, i) => {
    let wx = 0, wy = 0;
    for (const [x, y] of s.poly) { wx = Math.max(wx, Math.abs(x)); wy = Math.max(wy, Math.abs(y)); }
    wx *= 2; wy *= 2;
    const m = s.area * THICK * DENSITY;
    // A box of the shard's size: the inertia about each of its own axes
    const I: V3 = [m * (wy * wy + THICK * THICK) / 12, m * (wx * wx + THICK * THICK) / 12, m * (wx * wx + wy * wy) / 12];
    const corners: V3[] = [];
    for (const [x, y] of s.poly) corners.push([x, y, h], [x, y, -h]);
    const l = ls[i];
    return { m, I, corners, c: [...l.c0] as V3, v: [...l.v] as V3, w: [...l.w] as V3, q: [0, 0, 0, 1] as Q, delay: l.delay, still: 0, asleep: false };
  });

  const write = (f: number) => bodies.forEach((b, i) => {
    out.set([...b.c, 1], (2 * f * n + i) * 4);
    out.set(b.q, ((2 * f + 1) * n + i) * 4);
  });
  write(0);

  for (let f = 1; f < FRAMES; f++) {
    for (let s = 0; s < SUB; s++) {
      const time = ((f - 1) * SUB + s) * dt;
      for (const b of bodies) {
        if (b.asleep || time < b.delay) continue;
        // Free flight: gravity, then move and turn (q̇ = ½ ω q)
        b.v[1] -= G * dt;
        for (let k = 0; k < 3; k++) b.c[k] += b.v[k] * dt;
        const [wx, wy, wz] = b.w, [x, y, z, w] = b.q;
        b.q = normQ([
          x + 0.5 * dt * (wx * w + wy * z - wz * y),
          y + 0.5 * dt * (wy * w + wz * x - wx * z),
          z + 0.5 * dt * (wz * w + wx * y - wy * x),
          w - 0.5 * dt * (wx * x + wy * y + wz * z),
        ]);

        // The floor (y = 0): an impulse at every corner that went through it
        const invI = (v: V3): V3 => {                       // I⁻¹ in world space = R·diag(1/I)·Rᵀ
          const lv = rot(conj(b.q), v);
          return rot(b.q, [lv[0] / b.I[0], lv[1] / b.I[1], lv[2] / b.I[2]]);
        };
        const rs = b.corners.map(c => rot(b.q, c));
        const hits = rs.filter(r => b.c[1] + r[1] < 0);
        if (!hits.length) { b.still = 0; continue; }
        for (let it = 0; it < 3; it++) for (const r of hits) {
          const vp = [b.v[0] + b.w[1] * r[2] - b.w[2] * r[1], b.v[1] + b.w[2] * r[0] - b.w[0] * r[2], b.v[2] + b.w[0] * r[1] - b.w[1] * r[0]] as V3;
          if (vp[1] >= 0) continue;
          const n: V3 = [0, 1, 0];
          const k = 1 / b.m + dot(n, cross(invI(cross(r, n)), r));
          const j = -(1 + (it === 0 && vp[1] < -0.5 ? E : 0)) * vp[1] / k;
          b.v[1] += j / b.m;
          const dw = invI(cross(r, [0, j, 0]));
          for (let q = 0; q < 3; q++) b.w[q] += dw[q];
          // Friction: an impulse against the sliding, at most μ times the push of the floor
          const vt: V3 = [b.v[0] + b.w[1] * r[2] - b.w[2] * r[1], 0, b.v[2] + b.w[0] * r[1] - b.w[1] * r[0]];
          const sl = Math.hypot(vt[0], vt[2]);
          if (sl < 1e-6) continue;
          const td: V3 = [vt[0] / sl, 0, vt[2] / sl];
          const kt = 1 / b.m + dot(td, cross(invI(cross(r, td)), r));
          const jt = Math.min(sl / kt, MU * j);
          b.v[0] -= td[0] * jt / b.m; b.v[2] -= td[2] * jt / b.m;
          const dt2 = invI(cross(r, [-td[0] * jt, 0, -td[2] * jt]));
          for (let q = 0; q < 3; q++) b.w[q] += dt2[q];
        }
        // Push it back out, and let a resting shard fall asleep
        b.c[1] -= Math.min(...hits.map(r => b.c[1] + r[1]));
        for (let q = 0; q < 3; q++) b.w[q] *= 0.995;
        b.still = Math.hypot(...b.v) < 0.04 && Math.hypot(...b.w) < 0.3 ? b.still + 1 : 0;
        if (b.still > 30) { b.asleep = true; b.v = [0, 0, 0]; b.w = [0, 0, 0]; }
      }
    }
    write(f);
  }
  return out;
}

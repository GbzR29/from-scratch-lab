// ── A pane that cracks ────────────────────────────────────────────────────────
// One fullscreen pass. The garden behind the window is drawn by scene(); the
// cracks are the borders of Voronoi cells.
//   annealed  ordinary window glass. The Voronoi lives in log-polar space around
//             the impact, q = (S·ln(r/r0), N·θ/2π): equal cells there are long,
//             thin wedges on the pane that grow with distance, the spiderweb.
//             Borders across θ are radial cracks (all of them break); borders
//             across ln r are the rings, which break later and only in part.
//   tempered  toughened glass. Uniform small cells: the stored stress dices
//             the whole pane at once.
// A crack front r < v·t spreads from the impact. Each broken shard is tilted a
// little (the pane is dished in around the impact), so it shows the garden
// shifted, and catches the light on its own.

export const CRACK_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform float uAspect, uTime, uSpeed, uN, uRingScale, uRingKeep, uLens, uPx;
uniform vec2  uImpact;
uniform int   uKind, uView, uStruck;

const float TAU = 6.2831853;
const float R0 = 0.012;            // radius of the crushed zone under the impact
const float DICE = 0.016;          // size of a tempered-glass cube, in pane heights

float hash1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2  hash2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
vec3  hash3(vec2 p) { return fract(sin(vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)))) * 43758.5453); }

// ── The garden behind the window ──
vec3 scene(vec2 p) {
  vec3 col = mix(vec3(0.80, 0.88, 0.95), vec3(0.30, 0.52, 0.84), smoothstep(0.35, 1.0, p.y));
  col += vec3(1.0, 0.9, 0.7) * 0.6 * exp(-length(p - vec2(0.28 * uAspect, 0.84)) * 9.0);
  float cloud = smoothstep(0.55, 0.9, sin(p.x * 5.0 + 1.3) * 0.5 + sin(p.x * 11.0) * 0.25 + 0.5) * smoothstep(0.62, 0.72, p.y) * smoothstep(0.86, 0.74, p.y);
  col = mix(col, vec3(0.97), cloud * 0.8);
  float far = 0.42 + 0.05 * sin(p.x * 3.1 + 0.5) + 0.025 * sin(p.x * 8.3);
  if (p.y < far) col = mix(vec3(0.42, 0.58, 0.48), vec3(0.62, 0.72, 0.68), smoothstep(far - 0.12, far, p.y));
  // Houses with red roofs
  for (int i = 0; i < 4; i++) {
    float fi = float(i), x0 = 0.18 + fi * 0.43 * uAspect / 1.78, w = 0.13 + 0.03 * fi;
    float base = 0.3, top = 0.42 + 0.02 * fi;
    if (p.x > x0 && p.x < x0 + w && p.y > base && p.y < top) {
      col = vec3(0.93, 0.88, 0.78) * (0.85 + 0.15 * step(0.5, fract(fi * 0.37)));
      vec2 win = fract(vec2((p.x - x0) / w * 3.0, (p.y - base) / (top - base) * 2.0));
      if (win.x > 0.3 && win.x < 0.7 && win.y > 0.3 && win.y < 0.75) col = vec3(0.25, 0.32, 0.4);
    }
    float roof = top + 0.07 - abs(p.x - x0 - w * 0.5) * 0.9;
    if (p.x > x0 - 0.015 && p.x < x0 + w + 0.015 && p.y >= top && p.y < roof) col = vec3(0.7, 0.24, 0.18);
  }
  float near = 0.3 + 0.03 * sin(p.x * 2.3 + 2.0);
  if (p.y < near) col = mix(vec3(0.22, 0.42, 0.16), vec3(0.38, 0.6, 0.26), p.y / near);
  // Trees
  for (int i = 0; i < 5; i++) {
    float fi = float(i), x = (0.1 + fi * 0.23 + 0.06 * sin(fi * 2.7)) * uAspect;
    if (abs(p.x - x) < 0.008 && p.y < 0.4 && p.y > 0.2) col = vec3(0.3, 0.2, 0.12);
    float d = length((p - vec2(x, 0.44 + 0.03 * sin(fi))) * vec2(1.0, 0.85));
    if (d < 0.07 + 0.01 * sin(fi * 5.0)) col = vec3(0.16, 0.36, 0.14) * (0.8 + 0.4 * (p.y - 0.4) * 5.0);
  }
  return col;
}

// ── Voronoi with the border distance ──
// Returns the border distance in pane units (x), whether that border is a ring
// (y = 1) or a radial crack (0); id = nearest cell, nid = the cell across the
// border, seed = nearest seed's position in q.
vec2 wrapId(vec2 id) { return uKind == 0 ? vec2(id.x, mod(id.y, uN)) : id; }

vec2 cracks(vec2 q, float r, out vec2 id, out vec2 nid, out vec2 seed) {
  vec2 ip = floor(q), fp = fract(q);
  vec2 mg = vec2(0.0), mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(i, j), rr = g + hash2(wrapId(ip + g)) - fp;
    float d = dot(rr, rr);
    if (d < md) { md = d; mr = rr; mg = g; }
  }
  id = wrapId(ip + mg);
  seed = q + mr;
  float bd = 8.0;
  vec2 bn = vec2(1.0, 0.0);
  nid = id;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(i, j), rr = g + hash2(wrapId(ip + g)) - fp;
    if (dot(mr - rr, mr - rr) < 1e-5) continue;
    vec2 n = normalize(rr - mr);
    float d = dot(0.5 * (mr + rr), n);
    if (d < bd) { bd = d; bn = n; nid = wrapId(ip + g); }
  }
  if (uKind == 1) return vec2(bd * DICE, 0.0);
  // Back from q to the pane: a step n·dq in q is a step of length
  // |(n.x·S, n.y·N/2π)|/r on the pane, so divide by that
  vec2 k = vec2(bn.x * uRingScale, bn.y * uN / TAU);
  return vec2(bd * r / length(k), abs(k.x) > abs(k.y) ? 1.0 : 0.0);
}

void main() {
  vec2 p = vec2(vUV.x * uAspect, vUV.y);
  vec2 d = p - uImpact;
  float r = length(d);
  float front = uStruck == 1 ? uTime * uSpeed : -1.0;

  vec2 q = uKind == 0 ? vec2(log(max(r, 1e-4) / R0) * uRingScale, atan(d.y, d.x) / TAU * uN) : d / DICE;
  vec2 id, nid, seed;
  vec2 b = cracks(q, r, id, nid, seed);
  float h = hash1(id + nid);                                     // the same from both sides of a border

  // Which borders have broken by now
  float broken;
  if (uKind == 1) broken = step(r, front * (0.9 + 0.2 * h));
  else if (b.y < 0.5) broken = step(r, front * (0.8 + 0.4 * h));                       // radial: first
  else broken = step(h, uRingKeep) * step(r * 1.6, front);                            // rings: later, some
  broken *= step(R0, r);

  // Where the nearest seed sits on the pane: the shard's own position
  vec2 sp = uKind == 0 ? uImpact + R0 * exp(seed.x / uRingScale) * vec2(cos(seed.y * TAU / uN), sin(seed.y * TAU / uN))
                       : uImpact + seed * DICE;
  float rs = length(sp - uImpact);
  vec3 hs = hash3(id);
  vec2 tilt = vec2(0.0);
  if (uStruck == 1 && rs < front) {
    tilt = uKind == 0 ? normalize(sp - uImpact + 1e-6) * 0.7 * exp(-rs / 0.35) * (0.6 + 0.8 * hs.x) + (hs.yz - 0.5) * 0.12
                      : (hs.xy - 0.5) * 0.5;
  }

  float px = b.x / uPx;                                          // distance to the border, in pixels
  float w = uKind == 0 ? 0.9 + 2.2 * exp(-r / 0.12) : 0.8;
  float line = broken * (1.0 - smoothstep(w * 0.5, w + 0.6, px));
  float halo = broken * (1.0 - smoothstep(w, w * 4.0 + 2.0, px));

  vec3 col;
  if (uView == 1) {
    // Shards: one colour per piece that is free to move
    col = uStruck == 1 && rs < front ? 0.35 + 0.6 * hs : vec3(0.45, 0.5, 0.55);
    col = mix(col, vec3(0.02), line);
  } else if (uView == 2) {
    // The warped grid itself: integer lines of q, seeds, and every Voronoi border
    col = scene(p) * 0.35;
    vec2 g = abs(fract(q + 0.5) - 0.5);
    float gx = uKind == 0 ? g.x * r / uRingScale : g.x * DICE, gy = uKind == 0 ? g.y * r * TAU / uN : g.y * DICE;
    float grid = 1.0 - smoothstep(0.5, 1.5, min(gx, gy) / uPx);
    col = mix(col, vec3(0.3, 0.55, 1.0), grid * 0.8);
    col = mix(col, vec3(1.0), 1.0 - smoothstep(0.6, 1.4, px));
    float rad = uKind == 0 ? 2.5 : 1.0;
    col = mix(col, vec3(1.0, 0.75, 0.2), 1.0 - smoothstep(rad, rad + 1.0, length(sp - p) / uPx));
  } else {
    col = scene(p + tilt * uLens);
    // A tilted shard mirrors the bright room at its own angle
    vec3 n = normalize(vec3(-tilt, 1.0));
    col += vec3(1.0, 0.97, 0.9) * 0.5 * pow(max(dot(reflect(vec3(0.0, 0.0, -1.0), n), normalize(vec3(-0.35, 0.45, 0.82))), 0.0), 300.0);
    col *= vec3(0.96, 0.99, 0.97);                               // the faint green of window glass
    // Broken edges: a dark crease with a bright fracture face, green from the long path through the glass
    float lit = 0.6 + 0.4 * sin(dot(sp, vec2(53.0, 31.0)));
    col *= 1.0 - 0.3 * halo;
    col = mix(col, mix(vec3(0.62, 0.86, 0.74), vec3(1.0), lit * 0.6), line * 0.9);
    // The crushed zone right under the impact
    float crush = uStruck == 1 && front > R0 ? smoothstep(R0 * 1.9, R0 * 0.9, r) : 0.0;
    col = mix(col, vec3(0.9, 0.95, 0.93) * (0.8 + 0.3 * hash1(floor(p / uPx / 2.0))), crush);
  }

  // The window frame
  vec2 e = min(p, vec2(uAspect, 1.0) - p);
  if (min(e.x, e.y) < 0.025) col = vec3(0.93, 0.92, 0.88) * (0.75 + 0.25 * smoothstep(0.0, 0.025, min(e.x, e.y)));
  FragColor = vec4(col, 1.0);
}`;

// ── Settled snow shader ───────────────────────────────────────────────────────
// A small raymarched yard (rocks, a crate, a fence, a pine) under fresh snow.
// "geometry": the snow is real shape. For a scene SDF s(p) and a depth T, the
// snow layer is every point that is within T of a surface (s(p) < T) AND has
// something solid below it along the "up" direction u, within T:
//     snow(p) = smax(s(p) − T, min_k s(p − u·kT/3) + M),    surface = min(s, snow).
// Walls fail the second test, so they stay bare; tops pass both. Wind tilts u,
// plastering snow on the windward faces. "shader only" is the cheap game way:
// no new shape, just the material mixed towards snow where the normal faces u.

export const COVER_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;
uniform float uDepth;          // the deepest snow, m
uniform float uAmount;         // 0 bare … 1 everything covered
uniform float uWind;           // tilt of "up" towards −x: snow plastered on the faces looking into the wind
uniform vec3  uSun;
uniform int   uView;           // 0 geometry, 1 shader only, 2 bare
uniform int   uZero;

// ── Noise ─────────────────────────────────────────────────────────────────────
vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}
float vnoise(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash33(vec3(i, 1.0)).x, b = hash33(vec3(i + vec2(1, 0), 1.0)).x;
  float c = hash33(vec3(i + vec2(0, 1), 1.0)).x, d = hash33(vec3(i + vec2(1, 1), 1.0)).x;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// ── The yard ──────────────────────────────────────────────────────────────────
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdCone(vec3 p, float r, float h) {                 // base radius r at y = 0, tip at y = h
  vec2 q = vec2(length(p.xz), p.y);
  vec2 n = normalize(vec2(h, r));
  return max(dot(q - vec2(r, 0.0), n), -q.y);
}
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k) { return -smin(-a, -b, k); }

// id: 0 ground, 1 rock, 2 wood, 3 pine, 4 bark
float scene(vec3 p, out float id) {
  float d = p.y; id = 0.0;
  float rock = min(length((p - vec3(1.15, 0.05, 0.75)) / vec3(1.0, 0.65, 0.9)) * 0.7 - 0.32,
                   length((p - vec3(-1.5, 0.0, -0.2)) / vec3(1.0, 0.75, 1.0)) * 0.8 - 0.22);
  if (rock < d) { d = rock; id = 1.0; }
  float crate = sdBox(p - vec3(-0.75, 0.3, 0.75), vec3(0.3)) - 0.01;
  // the fence: posts every 0.5 m and two rails
  vec3 q = p - vec3(0.9, 0.0, -0.75);
  float px = clamp(floor(q.x / 0.5 + 0.5), -2.0, 2.0) * 0.5;
  float fence = sdBox(q - vec3(px, 0.5, 0.0), vec3(0.04, 0.5, 0.04));
  fence = min(fence, sdBox(q - vec3(0.0, 0.42, 0.0), vec3(1.05, 0.03, 0.02)));
  fence = min(fence, sdBox(q - vec3(0.0, 0.82, 0.0), vec3(1.05, 0.03, 0.02)));
  float wood = min(crate, fence);
  if (wood < d) { d = wood; id = 2.0; }
  vec3 t = p - vec3(-0.6, 0.0, -1.0);
  float trunk = max(length(t.xz) - 0.07, abs(t.y - 0.3) - 0.3);
  if (trunk < d) { d = trunk; id = 4.0; }
  float pine = min(sdCone(t - vec3(0.0, 0.35, 0.0), 0.62, 0.75), min(sdCone(t - vec3(0.0, 0.8, 0.0), 0.47, 0.62), sdCone(t - vec3(0.0, 1.2, 0.0), 0.32, 0.55)));
  if (pine < d) { d = pine; id = 3.0; }
  return d;
}
float scene(vec3 p) { float id; return scene(p, id); }

// ── The snow ──────────────────────────────────────────────────────────────────
vec3 upDir() { return normalize(vec3(-uWind, 1.0, 0.0)); }

// How deep the snow lies here: patchy while little has fallen, even when a lot has
float depthAt(vec3 p) {
  float n = 0.65 * vnoise(p.xz * 2.5 + p.y) + 0.35 * vnoise(p.xz * 9.0 - p.y * 3.0);
  return uDepth * clamp((n + 1.6 * uAmount - 0.9) * 2.5, 0.0, 1.0);
}
// Is there something solid below p, within T? Looked for at three depths, so a
// thin rail (thinner than T) is still found, and required to be clearly inside
// (by M), since beside a wall the point below is still ON the wall, at distance 0.
const float M = 0.012;
float snowLayer(vec3 p) {
  float T = depthAt(p);
  if (T < 0.002) return 1e3;
  float below = 1e3;
  for (int i = uZero; i < 3; i++) below = min(below, scene(p - upDir() * T * float(i + 1) / 3.0));
  return smax(scene(p) - T, below + M, 0.03);
}
float map(vec3 p) {
  float s = scene(p);
  return uView == 0 ? min(s, snowLayer(p)) : s;
}
// Tetrahedral normal in a loop: one call site of map keeps the compiled shader small
vec3 normalAt(vec3 p) {
  vec3 n = vec3(0.0);
  for (int i = uZero; i < 4; i++) {
    vec3 e = 0.5773 * (2.0 * vec3(float(((i + 3) >> 1) & 1), float((i >> 1) & 1), float(i & 1)) - 1.0);
    n += e * map(p + 0.0015 * e);
  }
  return normalize(n);
}
float shadow(vec3 ro, vec3 rd) {
  float res = 1.0, t = 0.02;
  for (int i = 0; i < 40 + uZero; i++) {
    float h = map(ro + rd * t);
    res = min(res, 10.0 * h / t);
    t += clamp(h, 0.01, 0.25);
    if (res < 0.01 || t > 6.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

vec3 skyAt(vec3 d) {
  vec3 col = mix(vec3(0.78, 0.84, 0.92), vec3(0.38, 0.56, 0.86), pow(clamp(d.y, 0.0, 1.0), 0.5));
  return col + vec3(1.0, 0.85, 0.6) * pow(max(dot(d, uSun), 0.0), 200.0) * 2.0;
}

void main() {
  vec2 sp = (vUV * 2.0 - 1.0) * vec2(uAspect, 1.0) * uTanHalf;
  vec3 rd = normalize(uCamF + sp.x * uCamR + sp.y * uCamU), ro = uCamPos;

  float t = 0.0, hit = 0.0;
  for (int i = 0; i < 140 + uZero; i++) {
    float h = map(ro + rd * t);
    if (h < 0.0008 * t) { hit = 1.0; break; }
    t += h * 0.9;
    if (t > 40.0) break;
  }
  vec3 col = skyAt(rd);
  if (hit > 0.5) {
    vec3 p = ro + rd * t, n = normalAt(p);
    float id; float base = scene(p, id);
    vec3 alb = id == 0.0 ? vec3(0.32, 0.27, 0.2) : id == 1.0 ? vec3(0.36, 0.36, 0.38)
             : id == 2.0 ? vec3(0.42, 0.28, 0.16) : id == 3.0 ? vec3(0.08, 0.2, 0.12) : vec3(0.25, 0.17, 0.11);
    // Snow or not: the real layer in "geometry", the normal test in "shader only"
    float snow = 0.0;
    if (uView == 0) snow = smoothstep(0.006, -0.002, snowLayer(p) - base);   // soft, so the cap's edge is not a staircase
    else if (uView == 1) {
      float n2 = 0.65 * vnoise(p.xz * 2.5 + p.y) + 0.35 * vnoise(p.xz * 9.0 - p.y * 3.0);
      snow = smoothstep(0.55, 0.75, dot(n, upDir()) + 0.5 * n2 - 1.2 * (1.0 - uAmount));
    }
    alb = mix(alb, vec3(0.92, 0.95, 1.0), snow);

    float sh = shadow(p + n * 0.003, uSun);
    float dif = max(dot(n, uSun), 0.0);
    vec3 sky = vec3(0.4, 0.55, 0.85) * (0.6 + 0.4 * n.y);
    float ao = clamp(map(p + n * 0.08) / 0.08, 0.0, 1.0);
    col = alb * (vec3(1.0, 0.9, 0.75) * 2.3 * dif * sh + sky * (0.5 + 0.5 * ao));
    // Snow lets light wander a little below its surface: the shadow side glows faintly blue
    col += snow * vec3(0.05, 0.1, 0.18) * (1.0 - sh) * ao;
    // Sparkle: ice grains with random facets mirroring the sun
    vec3 g = hash33(floor(p * 160.0));
    if (snow > 0.5 && g.x > 0.97) {
      vec3 fn = normalize(n + (g - 0.5) * 0.9);
      col += 10.0 * sh * pow(max(dot(reflect(-uSun, fn), -rd), 0.0), 700.0);
    }
    col = mix(col, vec3(0.78, 0.84, 0.92), 1.0 - exp(-t * 0.04));
  }
  col = 1.0 - exp(-col * 1.15);
  FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

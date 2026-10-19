// ── Smoke shader ──────────────────────────────────────────────────────────────
// A plume of smoke rising from a campfire, raymarched as a volume. Along the
// view ray, every step of length dt:
//   • lets through e^(−σt·dt) of what is behind it (extinction),
//   • adds light scattered towards the eye: σs × (sunlight reaching that point,
//     found by a second, short march towards the sun) × phase, plus sky light,
//   • adds the fire's own glow near the bottom.
// σt = σs + σa; the albedo σs/σt is about 0.3 for black soot and 0.99 for
// white steam. The plume widens as r ≈ 0.12·y (it drags in the air around it)
// and its smoke thins out as 1/r², since the same smoke spreads over more area.

import { BLACKBODY_GLSL } from "./blackbody";

export const SMOKE_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect, uTime;
uniform vec3  uSun;
uniform float uDensity;        // σt of the thickest smoke, 1/m
uniform float uAlbedo;         // σs / σt
uniform float uWind;
uniform int   uFire;
uniform int   uView;           // 0 smoke, 1 no self-shadow, 2 transmittance
uniform int   uZero;
${BLACKBODY_GLSL}

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p, int oct) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { if (i >= oct) break; s += a * noise(p); p = p * 2.02 + 7.3; a *= 0.5; } return s; }

// ── The plume ─────────────────────────────────────────────────────────────────
float plumeR(float y) { return 0.18 + 0.12 * y; }
vec3 axis(float y) { return vec3(uWind * 0.18 * y * sqrt(max(y, 0.0)), y, 0.0); }   // the wind bends it more the higher it is

// Smoke density (0…1, times uDensity for σt)
float density(vec3 p, int oct) {
  if (p.y < 0.15 || p.y > 6.0) return 0.0;
  vec3 c = axis(p.y);
  float R = plumeR(p.y);
  float r = length((p - c).xz);
  if (r > R * 2.2) return 0.0;
  // The smoke rises: sample the noise where this smoke was a moment ago
  vec3 q = (p - c) / R * 0.6 + vec3(0.0, p.y * 0.8 - uTime * 0.9, 0.0);
  float n = fbm(q * 1.4, oct);
  float body = exp(-2.0 * (r / R) * (r / R));
  float d = clamp(body * (n * 2.0 - 0.55), 0.0, 1.0);
  return d * min(0.3 * 0.3 / (R * R), 1.2) * smoothstep(0.15, 0.5, p.y) * smoothstep(6.0, 3.5, p.y);   // 1/R²: the same smoke over more area
}

// The fire: a hot glow at the bottom of the plume, flickering
float fireT(vec3 p) {
  if (uFire == 0) return 0.0;
  float r = length(p.xz), y = p.y;
  float n = fbm(vec3(p.xz * 4.0, y * 3.0 - uTime * 3.0), 3);
  float h = 0.55 * (1.0 - r / 0.32) - y + 0.3 * (n - 0.5);
  return h > 0.0 ? 1100.0 + 600.0 * clamp(h * 3.0, 0.0, 1.0) : 0.0;
}

vec3 sky(vec3 d) {
  vec3 col = mix(vec3(0.62, 0.68, 0.76), vec3(0.18, 0.34, 0.66), pow(clamp(d.y, 0.0, 1.0), 0.5));
  return col + vec3(1.0, 0.8, 0.55) * pow(max(dot(d, uSun), 0.0), 300.0) * 6.0;
}

void main() {
  vec2 sp = (vUV * 2.0 - 1.0) * vec2(uAspect, 1.0) * uTanHalf;
  vec3 rd = normalize(uCamF + sp.x * uCamR + sp.y * uCamU), ro = uCamPos;
  vec3 sunCol = vec3(1.0, 0.88, 0.72) * 3.0, ambient = vec3(0.32, 0.42, 0.6) * 0.8;

  // What is behind the smoke: the sky, or the ground lit by the sun and the fire
  float tGround = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  vec3 bg = sky(rd);
  if (tGround < 1e8) {
    vec3 g = ro + rd * tGround;
    vec3 ground = vec3(0.09, 0.1, 0.06) * (sunCol * max(uSun.y, 0.0) * 0.35 + ambient);   // dry grass and earth
    if (uFire == 1) ground += vec3(1.0, 0.45, 0.15) * 0.6 / (1.0 + 6.0 * dot(g.xz, g.xz));
    bg = mix(ground, sky(vec3(rd.x, 0.0, rd.z)), 1.0 - exp(-tGround * 0.02));
  }

  // March through the plume's bounding box only
  vec3 lo = vec3(-1.4, 0.0, -1.4), hi = vec3(1.4 + max(uWind, 0.0) * 2.5, 6.2, 1.4);
  lo.x -= max(-uWind, 0.0) * 2.5;
  vec3 t0 = (lo - ro) / rd, t1 = (hi - ro) / rd;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  float ta = max(max(tmin.x, tmin.y), max(tmin.z, 0.0)), tb = min(min(tmax.x, tmax.y), min(tmax.z, tGround));

  vec3 L = vec3(0.0);
  float T = 1.0;
  if (tb > ta) {
    const int STEPS = 72;
    float dt = (tb - ta) / float(STEPS);
    float t = ta + dt * hash(vec3(gl_FragCoord.xy, uTime));   // jitter the start: noise instead of bands
    for (int i = 0; i < STEPS + uZero; i++) {
      vec3 p = ro + rd * t;
      float d = density(p, 4);
      float Tf = fireT(p);
      if (d > 0.002 || Tf > 0.0) {
        float st = d * uDensity;
        // Sunlight reaching p: a short march towards the sun, through the same smoke
        float Tl = 1.0;
        if (uView != 1 && st > 0.0) {
          float od = 0.0;
          for (int j = 1; j <= 6; j++) od += density(p + uSun * (float(j) * 0.18), 2) * 0.18;
          Tl = exp(-od * uDensity);
        }
        vec3 S = uAlbedo * st * (sunCol * Tl / (4.0 * 3.14159) * 4.0 + ambient);   // phase 1/4π, light brought up to scale
        if (Tf > 0.0) S += blackbody(Tf) * 40.0;                                       // the flames glow
        float tr = exp(-st * dt);
        // Exact integral of a constant source over the step: S·(1 − e^(−σt·dt))/σt
        L += T * (st > 1e-4 ? S * (1.0 - tr) / st : S * dt);
        T *= tr;
        if (T < 0.01) break;
      }
      t += dt;
      if (t > tb) break;
    }
  }
  vec3 col = uView == 2 ? vec3(1.0 - T) : L + T * bg;
  col = 1.0 - exp(-col * 1.1);
  FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

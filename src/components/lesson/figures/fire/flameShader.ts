// ── Flame shader ──────────────────────────────────────────────────────────────
// A flame as a temperature field T(x, y) drawn with Planck's colours:
//   • a shape: hot along the axis, cooling outwards and upwards, narrowing as
//     the buoyant gas speeds up;
//   • rising noise that eats into the shape, more and more with height, which
//     breaks the top into tongues and makes it flicker;
//   • soot glows with blackbody(T) (yellow-orange); where fuel and air are
//     already mixed, near the base, excited CH and C₂ molecules glow blue.
// A campfire also "puffs" at f ≈ 1.5/√D Hz (D = fire diameter in metres).

import { BLACKBODY_GLSL } from "./blackbody";

export const FLAME_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform float uAspect, uTime, uPx;
uniform int   uMode;           // 0 candle, 1 campfire, 2 gas burner
uniform float uTmax;           // hottest soot, K
uniform float uTurb;           // turbulence
uniform float uWind;
uniform float uSoot;           // 0 clean blue flame … 1 sooty yellow flame
uniform float uExposure;
uniform float uBlueScale;      // the blue glow's brightness, already divided by the exposure
uniform float uPuff;           // puffing frequency, Hz
uniform int   uView;           // 0 flame, 1 temperature
${BLACKBODY_GLSL}

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

// ── The temperature field of one flame ────────────────────────────────────────
// base: the flame's root; H: its height; W: its half-width; rise: how fast the
// noise climbs (the hot gas's speed). Returns T in kelvin and the blue zone.
float flame(vec2 p, vec2 base, float H, float W, float rise, float seed, out float blue) {
  float y = (p.y - base.y) / H;                                  // 0 at the root, 1 at the tip
  blue = 0.0;
  if (y < -0.05 || y > 1.6) return 0.0;
  float yy = max(y, 0.0);
  // Wind leans the flame more the higher it is; noise sways it
  float x = p.x - base.x - uWind * yy * yy * H * 0.6 - (noise(vec2(uTime * 2.3 + seed, 0.0)) - 0.5) * 0.15 * W * yy;
  // Rising noise, scrolled up at the gas's speed, stronger towards the tip
  float n = fbm(vec2(x / W * 0.9 + seed, (p.y - base.y) / H * 2.2 - uTime * rise));
  x += (n - 0.5) * uTurb * W * 1.2 * yy;
  // A teardrop: wide low down, pointed at the top
  float w = W * pow(yy + 0.02, 0.45) * pow(max(1.0 - yy * 0.85, 0.0), 0.9) * 1.6 + 1e-4;
  float q = x / w;
  float shape = 1.0 - q * q - yy * 0.35;
  shape -= (1.0 - n) * uTurb * yy * 1.3;                         // the noise eats the top into tongues
  float heat = clamp(shape, 0.0, 1.0);
  // The dark core above the wick: fuel vapour that has not met any air yet
  float core = exp(-q * q * 5.0) * exp(-yy * 7.0);
  float T = uTmax * pow(heat, 0.45) * (1.0 - 0.45 * core) * smoothstep(-0.05, 0.08, y);
  // Blue: at the bottom edge, where fuel and air meet already mixed
  blue = exp(-yy * 7.0) * smoothstep(1.3, 0.75, abs(q)) * smoothstep(0.15, 0.7, abs(q) + 0.2 * yy) * smoothstep(-0.05, 0.03, y);
  return T;
}

void main() {
  vec2 p = (vUV - 0.5) * 2.0 * vec2(uAspect, 1.0);
  vec3 col = vec3(0.004, 0.005, 0.008) * (1.0 - 0.3 * p.y) / uExposure;   // the dark room, the same on screen at any exposure
  float T = 0.0, blue = 0.0, b;
  float puff = 1.0 + 0.12 * sin(6.2832 * uPuff * uTime) * float(uMode == 1);

  if (uMode == 0) {
    // Candle: wax, wick, one flame
    T = flame(p, vec2(0.0, -0.32), 0.62 * puff, 0.085, 1.6, 0.0, b); blue = b;
  } else if (uMode == 1) {
    // Campfire: a few flames side by side, each with its own noise
    for (int i = 0; i < 5; i++) {
      float fi = float(i), off = (fi - 2.0) * 0.17;
      float h = (0.75 + 0.35 * hash(vec2(fi, 3.0))) * puff * (1.0 - abs(fi - 2.0) * 0.16);
      T = max(T, flame(p, vec2(off, -0.5), h, 0.17, 1.1, fi * 7.3, b));
      blue = max(blue, b * 0.12);                       // wood fires are sooty: little blue shows
    }
  } else {
    // Gas burner: a ring of small, clean cones seen from the side
    for (int i = 0; i < 7; i++) {
      float off = (float(i) - 3.0) * 0.13;
      T = max(T, flame(p, vec2(off, -0.2), 0.26, 0.04, 2.5, float(i) * 3.1, b));
      blue = max(blue, b);
    }
  }

  if (uView == 1) {
    // Temperature as a map, with a line every 250 K
    float u = clamp((T - 700.0) / 2600.0, 0.0, 1.0);
    vec3 m = mix(vec3(0.05, 0.05, 0.25), vec3(0.2, 0.6, 1.0), smoothstep(0.0, 0.33, u));
    m = mix(m, vec3(1.0, 0.85, 0.2), smoothstep(0.33, 0.7, u));
    m = mix(m, vec3(1.0), smoothstep(0.7, 1.0, u));
    float iso = abs(fract(T / 250.0 + 0.5) - 0.5) * 250.0 / max(fwidth(T), 1e-3);
    m *= 0.75 + 0.25 * smoothstep(0.0, 1.5, iso);
    FragColor = vec4(T > 650.0 ? m : vec3(0.02), 1.0);
    return;
  }

  // Soot glows with Planck's colour; the blue zone glows at fixed wavelengths
  vec3 E = blackbody(T) * uSoot;
  E += vec3(0.12, 0.25, 1.0) * blue * (0.25 + 0.75 * (1.0 - uSoot)) * uBlueScale;
  col += E;

  // Surroundings, lit by the flame
  float glow = blackbody(uTmax * 0.92).r * uSoot + uBlueScale * 0.2 * (1.0 - uSoot);
  if (uMode == 0) {
    float wax = step(abs(p.x), 0.11) * step(p.y, -0.34) * step(-1.0, p.y);
    vec3 waxCol = vec3(0.95, 0.88, 0.75) * (0.04 / uExposure + 0.5 * glow * exp(-(-0.34 - p.y) * 3.0));
    col = mix(col, waxCol, wax);
    col = mix(col, vec3(0.02), step(abs(p.x), 0.006) * step(-0.34, p.y) * step(p.y, -0.29));   // the wick
  } else if (uMode == 1) {
    // Logs, with glowing cracks: embers at 900–1100 K
    // Two round logs crossing, seen from the side: capsules, lit from above by the fire
    vec2 q = p - vec2(0.0, -0.62);
    vec2 a1 = vec2(cos(0.22), sin(0.22)), a2 = vec2(cos(-0.22), sin(-0.22));
    float s1 = dot(q, a1), s2 = dot(q, a2);
    float d1 = length(q - a1 * clamp(s1, -0.5, 0.5)) - 0.07, d2 = length(q - a2 * clamp(s2, -0.5, 0.5)) - 0.07;
    float across = d1 < d2 ? dot(q, vec2(-a1.y, a1.x)) : dot(q, vec2(-a2.y, a2.x));   // −r…r across the log
    float logs = smoothstep(uPx, -uPx, min(d1, d2));
    float round_ = sqrt(max(1.0 - (across / 0.07) * (across / 0.07), 0.0));          // a cylinder's shading
    float cracks = smoothstep(0.6, 0.8, fbm(p * 18.0 + vec2(0.0, uTime * 0.15))) * smoothstep(-0.02, 0.05, across);
    vec3 bark = vec3(0.09, 0.05, 0.03) * round_ * (0.3 + 0.7 * smoothstep(-0.07, 0.07, across));
    vec3 logCol = bark * glow * 0.6 + blackbody(1050.0 + 300.0 * cracks) * cracks * 3.0;
    col = mix(col, logCol, logs);
    col += vec3(1.0, 0.45, 0.15) * 0.05 * glow * exp(-length(p - vec2(0.0, -0.4)) * 2.5);
  } else {
    col = mix(col, vec3(0.08, 0.085, 0.09) / uExposure, step(abs(p.x), 0.5) * step(abs(p.y + 0.24), 0.04));
  }
  // A soft halo: light scattered in the eye and the lens
  col += blackbody(uTmax * 0.9) * uSoot * 0.03 * exp(-length((p - vec2(0.0, -0.05)) * vec2(1.5, 1.0)) * 3.0);

  col = 1.0 - exp(-col * uExposure);
  FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

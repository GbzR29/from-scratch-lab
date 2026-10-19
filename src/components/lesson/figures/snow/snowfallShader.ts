// ── Falling snow shader ───────────────────────────────────────────────────────
// A winter street at night, with snow falling through it. The snow is a stack
// of flat sheets at depths z. A pixel's ray (p, 1) meets the sheet at depth z
// in the world point p·z (plus the camera's position); dividing by the cell
// size D gives cell coordinates, and each cell holds at most one flake, placed
// by a hash of the cell's integer id. All the motion (falling, wind, the
// camera walking) is added in world units before the division, so near sheets
// move fast on screen and far ones slowly with no extra code: that is the
// parallax. Each flake must stay inside its own cell:
//     |offset| + wobble + radius + blur ≤ 0.5   (in cell units)
// or the cell edge cuts it off. Sheets are composited front to back with
// fog per depth, a defocus blur from the circle of confusion, and the light
// of a street lamp.

export const SNOW_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform float uAspect, uPx, uTime;
uniform int   uLayers;
uniform float uDensity;        // chance that a cell holds a flake
uniform vec2  uDrift;          // how far the air has carried the snow so far, m: (wind, fall) integrated over time
uniform float uWobble;         // 0–1
uniform float uSize;           // flake radius scale
uniform float uFocus;          // depth in focus, m
uniform float uAperture;       // 0: pinhole, everything sharp
uniform float uCamX;           // the camera walking, m
uniform int   uLamp;
uniform int   uView;           // 0 snow, 1 cells, 2 depth
uniform int   uCrystals;       // 1: flakes big enough on screen are drawn as crystals
uniform int   uZero;

const float D = 0.35;          // cell size in the world, m
const float EYE = 1.6;         // camera height, m
const float FOG = 0.045;
const float LAMP_GAP = 14.0;   // a lamp every 14 m along the street
const float LAMP_Z = 7.0, LAMP_H = 3.2;

vec3 hash32(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.xxy + q.yzz) * q.zyx);
}
float hash21(vec2 p) { return hash32(p).x; }
float vnoise(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash21(vec2(i, 7.0)), hash21(vec2(i + 1.0, 7.0)), f); }

// ── A small crystal, for the flakes near the camera ───────────────────────────
// The same fold6 as the flake figure; s is in units of the flake's radius.
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
vec2 fold6(vec2 p) {
  float a = atan(p.y, p.x);
  a = abs(mod(a + 0.5235988, 1.0471976) - 0.5235988);
  return length(p) * vec2(cos(a), sin(a));
}
float crystalSD(vec2 s, float kind) {
  const vec2 B = vec2(0.5, 0.8660254), N = vec2(0.8660254, 0.5);
  vec2 q = fold6(s);
  float d = sdSeg(q, vec2(0.0), vec2(0.95, 0.0)) - 0.07;          // the arm
  d = min(d, dot(q, N) - 0.16 * N.x);                               // the hexagonal centre
  if (kind < 0.5) {                                                  // stellar dendrite
    for (int j = 1; j <= 3; j++) {
      float x = 0.22 * float(j) + 0.08, l = min(0.7 * x, 0.85 * (0.95 - x));
      d = min(d, sdSeg(q, vec2(x, 0.0), vec2(x, 0.0) + B * l) - 0.05);
    }
  } else if (kind < 1.5) {                                           // stellar plate: a little hexagon on each tip
    vec2 t = q - vec2(0.7, 0.0);
    d = min(d, max(max(abs(dot(t, N)), abs(dot(t, vec2(N.x, -N.y)))), abs(t.y)) - 0.2 * N.x);
  } else {                                                           // a plate with short arms
    d = min(d, dot(q, N) - 0.55 * N.x);
  }
  return d;
}

vec3 hue(float u) { return mix(vec3(1.0, 0.62, 0.28), vec3(0.3, 0.72, 1.0), u); }    // near warm, far cool

// The lamp light reaching world point P: inverse square, in a downward cone
vec3 lampAt(vec3 P) {
  if (uLamp == 0) return vec3(0.0);
  float lx = LAMP_GAP * floor((P.x - 1.6) / LAMP_GAP + 0.5) + 1.6;    // nearest lamp along the street
  vec3 L = vec3(lx, LAMP_H - EYE, LAMP_Z);
  vec3 v = P - L;
  float d2 = dot(v, v);
  float cone = smoothstep(0.55, 0.85, -v.y / sqrt(d2));                // cos of the angle from straight down
  return vec3(1.0, 0.72, 0.42) * (5.0 * cone / (d2 + 0.4));
}

// ── The scene behind the snow ─────────────────────────────────────────────────
vec3 background(vec2 p, out float depth) {
  vec3 sky = mix(vec3(0.06, 0.05, 0.075), vec3(0.008, 0.012, 0.03), clamp(p.y * 1.2 + 0.3, 0.0, 1.0));
  vec3 fogCol = vec3(0.06, 0.06, 0.085);
  depth = 60.0;
  vec3 col = sky;
  // A line of trees 30 m away; it slides with the camera, a little
  float zt = 30.0;
  float xt = p.x * zt + uCamX;
  float h = (1.2 + 3.5 * vnoise(xt * 0.35) + 1.2 * vnoise(xt * 1.7)) - EYE;
  if (p.y * zt < h) { col = mix(vec3(0.03, 0.04, 0.05), fogCol, 1.0 - exp(-FOG * zt)); depth = zt; }
  // Snowy ground: the ray meets y = −EYE at z = EYE / −p.y
  if (p.y < 0.0) {
    float zg = EYE / -p.y;
    if (zg < depth) {
      vec3 P = vec3(p.x * zg + uCamX, -EYE, zg);
      float bumps = 0.92 + 0.08 * vnoise(P.x * 2.0 + floor(P.z * 2.0) * 3.1);
      vec3 snow = vec3(0.08, 0.085, 0.11) * bumps + vec3(0.9, 0.95, 1.0) * lampAt(P) * 0.9;
      col = mix(snow, fogCol, 1.0 - exp(-FOG * zg));
      depth = zg;
    }
  }
  // The lamp posts, and the glow of the haze around each head
  if (uLamp == 1) {
    for (int k = -1; k <= 1; k++) {
      float lx = LAMP_GAP * (floor(uCamX / LAMP_GAP + 0.5) + float(k)) + 1.6 - uCamX;
      vec2 s = vec2(lx, LAMP_H - EYE) / LAMP_Z;               // the head on screen
      float post = step(abs(p.x - lx / LAMP_Z), 0.05 / LAMP_Z) * step(p.y, s.y) * step(-EYE / LAMP_Z, p.y);
      if (post > 0.0 && LAMP_Z < depth) { col = vec3(0.02); depth = LAMP_Z; }
      float g = length((p - s) * vec2(1.0, 1.3));
      col += vec3(1.0, 0.7, 0.4) * (0.006 / (g * g + 0.0004) * 0.08 + 0.25 * exp(-g * 9.0));
    }
  }
  return col;
}

void main() {
  vec2 p = (vUV - 0.5) * 2.0 * vec2(uAspect, 1.0) * 0.7;   // tan of the half field of view is 0.7
  float bgDepth;
  vec3 bg = background(p, bgDepth);
  vec3 fogCol = vec3(0.06, 0.06, 0.085);

  vec3 acc = vec3(0.0);
  float T = 1.0;                                            // how much of what is behind still shows
  int n = max(uLayers, 1);
  for (int i = 0; i < 16 + uZero; i++) {
    if (i >= n) break;
    float u = n == 1 ? 0.25 : float(i) / float(n - 1);
    float z = mix(0.6, 24.0, u * u);                        // near sheets first
    if (z > bgDepth) break;                                  // behind the trees or the ground

    // World point on this sheet, everything moving in metres, then into cells
    vec2 W = p * z + vec2(uCamX, 0.0);
    float layerSpeed = 1.0 + 0.25 * (hash21(vec2(float(i), 3.0)) - 0.5);
    W += vec2(-uDrift.x, uDrift.y * layerSpeed);
    vec2 cell = W / D + float(i) * 17.3;                    // each sheet its own pattern
    vec2 id = floor(cell), f = fract(cell) - 0.5;
    vec3 h = hash32(id);

    if (uView == 1) {
      float line = min(min(f.x + 0.5, 0.5 - f.x), min(f.y + 0.5, 0.5 - f.y));
      float px = uPx * 0.7 * z / D;                          // one pixel in this sheet's cell units
      float a = (1.0 - smoothstep(0.0, px * 1.5, line)) * 0.6 * T;
      a *= smoothstep(0.08, 0.025, px);                      // grids finer than ~12 px per cell would be noise
      acc += a * hue(u);
    }
    if (h.z > uDensity) continue;                            // an empty cell

    // Where the flake sits in its cell, and how it drifts
    vec2 c = (h.xy - 0.5) * 0.3;                             // |offset| ≤ 0.15
    float ph = h.x * 6.2832, w = 1.5 + 2.0 * h.y;
    c += uWobble * 0.12 * vec2(sin(uTime * w + ph), 0.4 * sin(uTime * w * 1.7 + ph * 2.0));   // ≤ 0.12
    float r = uSize * (0.045 + 0.045 * h.y);                 // ≤ 0.09

    // Defocus: the circle of confusion grows with |1/z − 1/zf| (screen units)
    float coc = uAperture * 0.03 * abs(1.0 / z - 1.0 / uFocus);
    float blur = min(coc * z / D, 0.12);                     // into cell units, kept inside the budget
    float rr = r + blur;
    float d = length(f - c);
    float energy = (r * r) / (rr * rr);                      // the same light spread over a bigger disc
    float a = smoothstep(rr, rr * 0.55 - 0.004, d) * mix(1.0, energy, 0.85);
    a = clamp(a * 0.95, 0.0, 1.0);

    // Level of detail: a flake several pixels wide and in focus shows its shape;
    // smaller or blurred ones stay round dots, where the shape could not be seen
    float pxCell = uPx * 0.7 * z / D;                        // one pixel in cell units
    float shape = float(uCrystals) * smoothstep(3.0, 7.0, r / pxCell) * (1.0 - smoothstep(0.15, 0.5, blur / rr));
    if (shape > 0.0 && d < rr) {
      vec2 v = f - c;
      float ang = h.x * 6.2832 + uTime * (h.y - 0.5) * 1.2;  // a slow spin
      v = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * v;
      v.y /= 0.4 + 0.6 * abs(cos(uTime * (0.5 + h.z) + h.y * 6.2832));   // tumbling: seen at a slant now and then
      float sd = crystalSD(v / r, floor(h.y * 2.999)) * r;
      float aa = pxCell + blur;
      float body = smoothstep(aa, -aa, sd);
      float glow = 0.3 * exp(-max(sd, 0.0) / (0.15 * r));    // the faint halo around the ice
      a = mix(a, clamp(body + glow * (1.0 - body), 0.0, 1.0), shape);
    }

    vec3 lit = vec3(0.16, 0.17, 0.22) + lampAt(vec3(p.x * z + uCamX, p.y * z, z)) * 2.5;
    lit += shape * vec3(0.26, 0.28, 0.34);                   // ice facets catch the light of the whole sky
    vec3 flake = mix(lit, fogCol, 1.0 - exp(-FOG * z));
    if (uView != 0) flake = hue(u) * 0.9;
    acc += T * a * flake;
    T *= 1.0 - a;
  }
  vec3 col = acc + T * bg;
  col = col / (1.0 + col * 0.25);
  FragColor = vec4(pow(col, vec3(1.0 / 2.2)) * 1.05, 1.0);
}`;

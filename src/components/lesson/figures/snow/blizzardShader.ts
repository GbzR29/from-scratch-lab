// ── Blizzard shader ───────────────────────────────────────────────────────────
// The falling-snow sheets of snowfallShader.ts, pushed into a storm:
//  • Streaks. During one exposure a flake moves |v|·Δt, so it is drawn as a
//    segment, not a dot. To keep each streak inside its own cell, the cells
//    are turned to line up with the flakes' velocity and stretched along it.
//  • Turbulence. The cells live in a space bent by a curl-noise field, a flow
//    with no sources or sinks, so swirling flakes neither bunch up nor vanish.
//  • Visibility. Snow is the fog: a road with marker poles every 10 m fades by
//    e^(−σd), with σ the extinction coefficient worked out on the CPU from the
//    number and size of the flakes. With an overcast sky, ground, sky and air
//    turn the same white: the whiteout.

export const BLIZZARD_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform float uAspect, uPx, uTime;
uniform int   uLayers;
uniform float uDensity;        // chance that a cell holds a flake
uniform vec2  uDrift;          // wind and fall integrated over time, m (in the turned frame: x across, y along the motion)
uniform float uAngle;          // the flakes' direction of motion on screen, rad from straight down
uniform float uStreak;         // |v|·Δt: how far a flake moves during one exposure, m
uniform float uCellLong;       // cell length along the motion, m
uniform float uTurb;           // curl-noise strength
uniform float uSigma;          // extinction coefficient of the snowy air, 1/m
uniform float uOvercast;       // 0 bright day, 1 flat white light
uniform int   uZero;

const float D = 0.35;          // cell width across the motion, m
const float EYE = 1.6;

vec3 hash32(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.xxy + q.yzz) * q.zyx);
}
float vnoise(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash32(i).x, hash32(i + vec2(1, 0)).x, f.x), mix(hash32(i + vec2(0, 1)).x, hash32(i + vec2(1, 1)).x, f.x), f.y);
}
// Curl of a noise "stream function" ψ: v = (∂ψ/∂y, −∂ψ/∂x) has zero divergence
vec2 curl(vec2 p) {
  const float e = 0.05;
  float a = vnoise(p + vec2(0.0, e)), b = vnoise(p - vec2(0.0, e));
  float c = vnoise(p + vec2(e, 0.0)), d = vnoise(p - vec2(e, 0.0));
  return vec2(a - b, -(c - d)) / (2.0 * e);
}
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  return length(pa - ba * h);
}

// ── Light and the scene behind the snow ───────────────────────────────────────
vec3 skyCol(float y) {
  vec3 clear = mix(vec3(0.62, 0.70, 0.80), vec3(0.30, 0.42, 0.62), clamp(y * 1.5, 0.0, 1.0));
  return mix(clear, vec3(0.80), uOvercast);
}
vec3 fogCol() { return mix(vec3(0.70, 0.74, 0.80), vec3(0.80), uOvercast); }

// The air between the eye and distance d lets e^(−σd) of the object through and adds the rest as fog
vec3 through(vec3 col, float d) { return mix(fogCol(), col, exp(-uSigma * d)); }

vec3 background(vec2 p, out float depth) {
  depth = 1e4;
  vec3 col = skyCol(p.y);
  if (p.y < 0.0) {                                   // the snowy ground, z = EYE / −p.y
    float z = EYE / -p.y;
    float x = p.x * z;
    vec3 snow = mix(vec3(0.74, 0.77, 0.83), vec3(0.78), uOvercast);
    float road = 1.0 - smoothstep(1.6, 1.8, abs(x - 0.6));
    vec3 g = mix(snow, snow * vec3(0.82, 0.84, 0.88), road * (0.35 - 0.3 * uOvercast));   // a faint road, packed by tyres
    col = through(g, z);
    depth = z;
  }
  // A dark line of pines 60 m away: the first thing the storm swallows
  const float ZT = 60.0;
  float xt = p.x * ZT;
  float tops = 7.0 + 5.0 * vnoise(vec2(xt * 0.12, 1.0)) + 3.0 * abs(fract(xt * 0.35) - 0.5) * 2.0 - EYE;
  if (p.y * ZT < tops && ZT < depth) { col = through(vec3(0.05, 0.09, 0.07), ZT); depth = ZT; }

  // Marker poles every 10 m along the road's edge, 1.5 m tall, dark with a red band
  for (int i = 1; i <= 30; i++) {
    float z = float(i) * 10.0 - 3.0;
    float sx = -1.6 / z, w = 0.035 / z;
    float top = (1.5 - EYE) / z, bottom = -EYE / z;
    if (z < depth && abs(p.x - sx) < w && p.y > bottom && p.y < top) {
      float band = step(0.75, (p.y * z + EYE) / 1.5);
      col = through(mix(vec3(0.08), vec3(0.7, 0.1, 0.08), band), z);
      depth = z;
    }
  }
  return col;
}

void main() {
  vec2 p = (vUV - 0.5) * 2.0 * vec2(uAspect, 1.0) * 0.7;
  float bgDepth;
  vec3 bg = background(p, bgDepth);

  // The frame turned so its y axis runs along the flakes' motion
  float ca = cos(uAngle), sa = sin(uAngle);
  mat2 toMotion = mat2(ca, -sa, sa, ca);
  vec2 cellSize = vec2(D, uCellLong);

  vec3 acc = vec3(0.0);
  float T = 1.0;
  int n = max(uLayers, 1);
  for (int i = 0; i < 16 + uZero; i++) {
    if (i >= n) break;
    float u = n == 1 ? 0.25 : float(i) / float(n - 1);
    float z = mix(0.6, 24.0, u * u);
    if (z > bgDepth) break;

    vec2 W = toMotion * (p * z);                                  // on the sheet, in metres, in the motion's frame
    W += uTurb * 0.6 * curl(W * 0.35 + vec2(float(i) * 3.7, uTime * 0.25));   // bend the space with the gusts' swirls
    W += vec2(uDrift.x, uDrift.y * (1.0 + 0.2 * (hash32(vec2(float(i), 5.0)).x - 0.5)));
    vec2 cell = W / cellSize + float(i) * 17.3;
    vec2 id = floor(cell);
    vec3 h = hash32(id);
    if (h.z > uDensity) continue;

    // In metres, inside the cell: the flake sits away from the edges by its budget
    vec2 f = (fract(cell) - 0.5) * cellSize;
    float r = 0.008 + 0.01 * h.y;
    vec2 room = 0.5 * cellSize - vec2(r + 0.005, r + 0.5 * uStreak + 0.005);
    vec2 c = (h.xy - 0.5) * 2.0 * max(room, 0.0) * 0.8;
    // The streak: everywhere the flake was during the exposure
    float d = sdSeg(f, c - vec2(0.0, 0.5 * uStreak), c + vec2(0.0, 0.5 * uStreak));
    float px = uPx * 0.7 * z;                                     // one pixel, in metres on this sheet
    float a = smoothstep(r + px, r - px, d);
    a *= r / (r + 0.5 * uStreak);                                 // the same light spread along the streak

    // A flake is lit from above by the sky and seen from the side: against the bright
    // sky it reads grey, against the ground white
    vec3 flake = mix(vec3(1.0), vec3(0.5, 0.53, 0.58), smoothstep(-0.15, 0.25, p.y));
    flake = through(mix(flake, vec3(0.7), 0.4 * uOvercast), z);
    acc += T * a * flake;
    T *= 1.0 - a;
  }
  vec3 col = acc + T * bg;
  FragColor = vec4(pow(col, vec3(0.95)), 1.0);
}`;

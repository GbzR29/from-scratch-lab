// ── Deformable snow shaders ───────────────────────────────────────────────────
// The snow's surface lives in a height texture seen from above: a value h per
// texel, 1 for fresh snow, 0 down at the ground, a little over 1 where snow
// has been pushed up into a ridge. Three passes use it:
//   STAMP_FS  reads last frame's texture and writes the next one (ping-pong):
//             fresh snow evens h out towards 1, then every object touching the
//             snow presses it down to its own underside, h = min(h, target).
//   SNOW_VS/FS a dense grid displaced by the texture in the vertex shader, lit
//             with normals from the texture, self-shadowed by marching towards
//             the sun across the same texture.
//   MAP_FS    the texture itself, drawn in a corner.
// The texture stores h / 1.5 so that 8-bit targets (no float support) can
// still hold ridges up to 1.5.

export const STORE = 1.5;

const HEIGHT = `
uniform sampler2D uMap;
uniform float uHalf;          // half the patch's width, m
uniform float uDepth;         // depth of fresh snow, m
uniform highp int uFlat;      // 1: the plain field outside the patch (highp: both stages must agree)
float H(vec2 uv) { return uFlat == 1 ? 1.0 : textureLod(uMap, uv, 0.0).r * ${STORE.toFixed(1)}; }
float Y(vec2 uv) { return uDepth * (H(uv) - 1.0); }           // height of the surface, m (fresh snow at y = 0)
vec2 uvOf(vec2 xz) { return xz / (2.0 * uHalf) + 0.5; }
`;

// ── Stamp pass: one fullscreen triangle over the texture ──────────────────────
export const STAMP_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform sampler2D uPrev;
uniform float uHalf, uDepth;
uniform vec4  uStamp[4];      // xz = centre (m), z = heading (rad), w = kind: 1 boot, 3 ball
uniform int   uCount;
uniform float uSink;          // how far a boot presses down, as a fraction of the snow's depth
uniform float uBallR, uBallY; // the ball's radius and the height of its centre (m)
uniform float uBerm;          // how high the pushed-aside ridge grows
uniform float uRefill;        // 1 − e^(−k·dt): how much fresh snow evens out this frame
uniform int   uReset;

const float S = ${STORE.toFixed(1)};

// A boot sole, in the boot's own frame: x forwards, y sideways, metres
float bootSD(vec2 p) {
  float fore = length((p - vec2(0.05, 0.0)) / vec2(1.0, 0.85)) - 0.058;
  float heel = length((p - vec2(-0.085, 0.0)) / vec2(1.0, 0.9)) - 0.045;
  float k = 0.03, m = clamp(0.5 + 0.5 * (heel - fore) / k, 0.0, 1.0);
  return mix(heel, fore, m) - k * m * (1.0 - m);              // smooth union of the two
}

void main() {
  if (uReset == 1) { FragColor = vec4(1.0 / S, 0.0, 0.0, 1.0); return; }
  float h = texture(uPrev, vUV).r * S;
  vec2 P = (vUV * 2.0 - 1.0) * uHalf;                         // this texel's place on the ground, m

  h += (1.0 - h) * uRefill;                                   // fresh snow fills prints and flattens ridges

  for (int i = 0; i < 4; i++) {
    if (i >= uCount) break;
    vec4 s = uStamp[i];
    vec2 d = P - s.xy;
    float target, ring;
    if (s.w < 2.0) {
      // Boot: turn into the boot's frame, a flat sole with lugs, walls sloping over about 4 cm
      float c = cos(s.z), sn = sin(s.z);
      vec2 q = vec2(c * d.x + sn * d.y, -sn * d.x + c * d.y);
      float sd = bootSD(q);
      float lugs = 0.5 + 0.5 * sin(q.x * 6.2832 / 0.028);
      float floorH = 1.0 - uSink + 0.07 * uSink * lugs;
      target = mix(floorH, 1.2, smoothstep(-0.008, 0.04, sd));     // walls wider than a vertex, or they come out stepped
      ring = smoothstep(0.015, 0.035, sd) * smoothstep(0.09, 0.035, sd);
    } else {
      // Ball: the underside of a sphere, y = c − sqrt(ρ² − r²)
      float r = length(d);
      float yb = r < uBallR ? uBallY - sqrt(uBallR * uBallR - r * r) : 1e3;
      target = 1.0 + yb / uDepth;
      float rc = sqrt(max(uBallR * uBallR - uBallY * uBallY, 0.0));   // where the sphere crosses the snow's top
      ring = smoothstep(rc - 0.01, rc + 0.03, r) * smoothstep(rc + 0.16, rc + 0.04, r);
    }
    if (target < h) h = max(target, 0.0);                     // snow only gets pressed down, never springs back
    else if (h > 0.9) h = max(h, 1.0 + uBerm * ring);         // untouched snow next to the print is pushed up
  }
  FragColor = vec4(h / S, 0.0, 0.0, 1.0);
}`;

// ── The snow surface ──────────────────────────────────────────────────────────
export const SNOW_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aXZ;            // grid, −1…1
uniform mat4 uVP;
uniform float uScale;                         // half width of this mesh, m
${HEIGHT}
out vec3 vW;
out vec2 vUV;
void main() {
  vec2 xz = aXZ * uScale;
  vUV = uvOf(xz);
  vW = vec3(xz.x, Y(vUV), xz.y);              // the displacement: one texture read per vertex
  gl_Position = uVP * vec4(vW, 1.0);
}`;

export const SNOW_FS = `#version 300 es
precision highp float;
in vec3 vW;
in vec2 vUV;
out vec4 FragColor;
${HEIGHT}
uniform vec3  uSun, uCam;
uniform float uTexel;                         // one texel, in uv
uniform vec4  uBall;                          // xyz centre, w radius (0: no ball)
uniform int   uView;                          // 0 snow, 1 mesh
uniform int   uShadows;
uniform vec3  uHorizon;                       // display colour of the sky at the horizon, for the fog

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
// Wind-blown grain on top of the snow: a few millimetres of bumps, only felt by the lighting
float grain(vec2 xz) { return 0.006 * (0.6 * vnoise(xz * 7.0) + 0.4 * vnoise(xz * 19.0)); }

// Does the ray from p towards the sun pass through the ball?
float ballShadow(vec3 p) {
  if (uBall.w <= 0.0) return 1.0;
  vec3 oc = p - uBall.xyz;
  float b = dot(oc, uSun), c = dot(oc, oc) - uBall.w * uBall.w;
  float disc = b * b - c;
  if (disc < 0.0 || -b + sqrt(disc) < 0.0) return 1.0;      // misses it, or the ball is behind the point
  return 1.0 - smoothstep(0.0, 0.004, disc);                 // soft edge where the ray only grazes it
}

void main() {
  if (uFlat == 1 && max(abs(vW.x), abs(vW.z)) < uHalf - 0.001) discard;   // the patch draws itself there

  // Normal from the height texture, by central differences
  float e = uTexel, w = 2.0 * uHalf * e;                     // one texel in uv, and in metres
  float dx = (Y(vUV + vec2(e, 0.0)) - Y(vUV - vec2(e, 0.0))) / (2.0 * w);
  float dz = (Y(vUV + vec2(0.0, e)) - Y(vUV - vec2(0.0, e))) / (2.0 * w);
  const float G = 0.01;
  dx += (grain(vW.xz + vec2(G, 0.0)) - grain(vW.xz - vec2(G, 0.0))) / (2.0 * G);
  dz += (grain(vW.xz + vec2(0.0, G)) - grain(vW.xz - vec2(0.0, G))) / (2.0 * G);
  vec3 n = normalize(vec3(-dx, 1.0, -dz));

  // Self-shadow: step towards the sun across the texture, looking for snow above the ray
  float sh = 1.0;
  if (uShadows == 1 && uFlat == 0) {
    vec3 p = vW + n * 0.002;
    float flat_ = max(length(uSun.xz), 0.05);
    float t = 0.004 * hash32(gl_FragCoord.xy).x / flat_;     // a random start per pixel turns step bands into fine noise
    for (int i = 1; i <= 32; i++) {
      t += 0.004 * float(i) / flat_;                          // steps grow: fine near the point, long further out
      vec3 q = p + uSun * t;
      vec2 uv = uvOf(q.xz);
      if (q.y > 0.5 * uDepth || uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) break;
      sh = min(sh, smoothstep(-0.003, 0.004, q.y - Y(uv)));
    }
  }
  sh *= ballShadow(vW + n * 0.002);

  vec3 V = normalize(uCam - vW);
  float pressed = clamp(1.0 - H(vUV), 0.0, 1.0);
  // Packed snow at the bottom of a print lets light travel further inside it: bluer
  vec3 albedo = mix(vec3(0.93, 0.95, 1.0), vec3(0.62, 0.78, 1.0), 0.45 * pressed);
  // Snow in shadow is lit by the whole blue sky, so it is light blue, not grey
  vec3 sun = vec3(1.0, 0.88, 0.72) * 2.1, sky = vec3(0.42, 0.58, 0.92);
  float wrap = max((dot(n, uSun) + 0.1) / 1.1, 0.0);
  vec3 col = albedo * (sun * wrap * sh + sky * (0.6 + 0.4 * n.y) * (1.0 - 0.25 * pressed));

  // Sparkle: a few grains, each with its own tilted facet, mirror the sun
  vec3 g = hash32(floor(vW.xz * 140.0));
  if (g.x > 0.975) {
    vec3 fn = normalize(n + (g - 0.5) * 0.9);
    col += 9.0 * sh * pow(max(dot(reflect(-uSun, fn), V), 0.0), 600.0);
  }

  if (uView == 1 && uFlat == 0) {
    vec2 cell = abs(fract(vUV * 64.0) - 0.5);                 // every 4th row of vertices
    float line = 1.0 - smoothstep(0.0, 0.06, 0.5 - max(cell.x, cell.y));
    col = mix(col, vec3(0.1, 0.35, 0.9), line * 0.7);
  }

  col = pow(1.0 - exp(-col * 1.1), vec3(1.0 / 2.2));
  col = mix(col, uHorizon, 1.0 - exp(-length(uCam - vW) * 0.03));   // distance haze, into the horizon's colour
  FragColor = vec4(col, 1.0);
}`;

// ── The sky behind it ─────────────────────────────────────────────────────────
export const SKY_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform vec3 uCamF, uCamR, uCamU, uSun, uHorizon;
uniform float uTanHalf, uAspect;
void main() {
  vec2 p = vUV * 2.0 - 1.0;
  vec3 d = normalize(uCamF + p.x * uTanHalf * uAspect * uCamR + p.y * uTanHalf * uCamU);
  vec3 zenith = vec3(0.36, 0.55, 0.86);
  vec3 col = mix(uHorizon, zenith, pow(clamp(d.y, 0.0, 1.0), 0.45));
  col += vec3(1.0, 0.85, 0.6) * pow(max(dot(d, uSun), 0.0), 64.0) * 0.6;
  FragColor = vec4(col, 1.0);
}`;

// ── The ball (a snowball) ─────────────────────────────────────────────────────
export const BALL_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
uniform mat4 uVP, uModel;
out vec3 vW, vN, vObj;
void main() {
  vObj = aPos;
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz;
  vN = mat3(uModel) * aNormal;
  gl_Position = uVP * w;
}`;

export const BALL_FS = `#version 300 es
precision highp float;
in vec3 vW, vN, vObj;
out vec4 FragColor;
uniform vec3 uSun, uCam, uHorizon;
void main() {
  vec3 n = normalize(vN);
  // Two great circles, so you can see it roll
  float seam = 1.0 - 0.3 * (1.0 - smoothstep(0.0, 0.025, min(abs(vObj.y), abs(vObj.x))));
  vec3 col = vec3(0.92, 0.94, 1.0) * seam * (vec3(1.0, 0.88, 0.72) * 2.1 * max((dot(n, uSun) + 0.1) / 1.1, 0.0)
           + vec3(0.42, 0.58, 0.92) * (0.5 + 0.5 * n.y));
  col = pow(1.0 - exp(-col * 1.1), vec3(1.0 / 2.2));
  col = mix(col, uHorizon, 1.0 - exp(-length(uCam - vW) * 0.03));
  FragColor = vec4(col, 1.0);
}`;

// ── The texture itself, in a corner ───────────────────────────────────────────
export const MAP_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform sampler2D uMap;
uniform vec2 uWalker;                         // the walker, in uv
void main() {
  vec2 uv = vec2(vUV.x, 1.0 - vUV.y);         // drawn as seen from above, far side at the top
  float h = texture(uMap, uv).r * ${STORE.toFixed(1)};
  vec3 col = h < 1.0 ? mix(vec3(0.05, 0.1, 0.3), vec3(0.85), h) : mix(vec3(0.85), vec3(1.0, 0.7, 0.3), clamp((h - 1.0) * 6.0, 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.3, 0.2), 1.0 - smoothstep(0.008, 0.016, length(uv - uWalker)));
  vec2 b = min(vUV, 1.0 - vUV);
  col = mix(col, vec3(0.15), 1.0 - smoothstep(0.0, 0.012, min(b.x, b.y)));
  FragColor = vec4(col, 1.0);
}`;

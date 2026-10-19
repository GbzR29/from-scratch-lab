// ── A pane that shatters ──────────────────────────────────────────────────────
//   SCENE_FS  the courtyard around the pane, one fullscreen pass (sky, tiled
//             floor at y = 0, a ring of striped posts).
//   SHARD_VS  every shard of the pre-fractured pane in one draw call. Each
//             vertex knows its shard's index and its position around the
//             shard's centre; the shader finds where that shard is now, from
//             the closed form or from the baked texture, and moves it there.
//   SHARD_FS  thin glass: Fresnel reflection of the sky, nearly clear; the
//             fracture faces are green, the colour of a long path through glass.
//   VAT_FS    the baked texture itself, drawn as a picture.

const SKY = `
const vec3 SUN = normalize(vec3(-0.45, 0.62, 0.64));
vec3 sky(vec3 d) {
  vec3 c = mix(vec3(0.78, 0.84, 0.9), vec3(0.32, 0.5, 0.78), smoothstep(0.0, 0.6, d.y));
  c = mix(c, vec3(0.55, 0.52, 0.48), smoothstep(0.0, -0.08, d.y));
  return c + vec3(1.0, 0.92, 0.8) * (3.0 * pow(max(dot(d, SUN), 0.0), 600.0) + 0.25 * pow(max(dot(d, SUN), 0.0), 8.0));
}`;

export const SCENE_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;
${SKY}
void main() {
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 rd = normalize(uCamF + uCamR * ndc.x * uTanHalf * uAspect + uCamU * ndc.y * uTanHalf);
  vec3 ro = uCamPos, col = sky(rd);
  float tBest = 1e9;
  if (rd.y < -0.002) {
    float t = -ro.y / rd.y;
    vec3 p = ro + rd * t;
    vec2 c = floor(p.xz * 2.0);
    float tile = (mod(c.x + c.y, 2.0) - 0.5) * exp(-t * 0.15);
    vec2 g = abs(fract(p.xz * 2.0) - 0.5);
    vec3 f = vec3(0.66, 0.63, 0.58) + 0.08 * tile - 0.1 * smoothstep(0.47, 0.5, max(g.x, g.y));
    f *= 0.75 + 0.25 * max(dot(vec3(0.0, 1.0, 0.0), SUN), 0.0);
    col = mix(sky(normalize(vec3(rd.x, 0.02, rd.z))), f, exp(-t * 0.04));
    tBest = t;
  }
  for (int i = 0; i < 7; i++) {
    float a = float(i) * 0.6 + 3.5;
    vec2 c = vec2(sin(a), -cos(a)) * 6.0;
    vec2 oc = ro.xz - c, d = rd.xz;
    float A = dot(d, d), B = dot(oc, d), C = dot(oc, oc) - 0.09;
    float h = B * B - A * C;
    if (h < 0.0) continue;
    float t = (-B - sqrt(h)) / A;
    vec3 p = ro + rd * t;
    if (t < 0.0 || t > tBest || p.y > 2.2) continue;
    vec3 n = normalize(vec3(p.x - c.x, 0.0, p.z - c.y));
    vec3 base = 0.5 + 0.45 * cos(6.2831 * (float(i) * 0.17 + vec3(0.0, 0.33, 0.67)));
    col = base * (0.75 + 0.25 * step(0.5, fract(p.y * 2.0))) * (0.4 + 0.7 * max(dot(n, SUN), 0.0));
    col = mix(sky(normalize(vec3(rd.x, 0.02, rd.z))), col, exp(-t * 0.04));
    tBest = t;
  }
  FragColor = vec4(col, 1.0);
}`;

export const SHARD_VS = `#version 300 es
layout(location = 0) in vec3 aLocal;      // around the shard's centre, as it sat in the pane
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aShard;      // x = shard index, y = 1 on a fracture face
uniform mat4 uViewProj;
uniform highp sampler2D uLaunch;          // closed form: (c0, delay), v, omega
uniform highp sampler2D uVat;             // baked: row 2f = centre, row 2f + 1 = quaternion
uniform int   uMode, uFrames;
uniform float uTime, uFps;
out vec3 vPos, vN;
flat out vec2 vShard;
flat out float vFree;                     // 1 once the crack has reached this shard

vec3 rotq(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }

void main() {
  int i = int(aShard.x + 0.5);
  vec3 c;
  vec4 q;
  if (uMode == 0) {
    // Closed form: thrown at t = delay, then only gravity
    vec4 c0 = texelFetch(uLaunch, ivec2(i, 0), 0);
    vec3 v  = texelFetch(uLaunch, ivec2(i, 1), 0).xyz;
    vec3 w  = texelFetch(uLaunch, ivec2(i, 2), 0).xyz;
    float t = max(uTime - c0.w, 0.0);
    c = c0.xyz + v * t + 0.5 * vec3(0.0, -9.81, 0.0) * t * t;
    float a = length(w) * t;
    q = vec4(normalize(w + 1e-6) * sin(0.5 * a), cos(0.5 * a));
  } else {
    // Baked: read two frames and blend between them
    float f = clamp(uTime * uFps, 0.0, float(uFrames) - 1.001);
    int f0 = int(f);
    float s = f - float(f0);
    vec3 c0 = texelFetch(uVat, ivec2(i, 2 * f0), 0).xyz, c1 = texelFetch(uVat, ivec2(i, 2 * f0 + 2), 0).xyz;
    vec4 q0 = texelFetch(uVat, ivec2(i, 2 * f0 + 1), 0), q1 = texelFetch(uVat, ivec2(i, 2 * f0 + 3), 0);
    if (dot(q0, q1) < 0.0) q1 = -q1;                 // q and −q are the same turn: blend the near pair
    c = mix(c0, c1, s);
    q = normalize(mix(q0, q1, s));
  }
  vec3 wp = c + rotq(q, aLocal);
  vPos = wp;
  vN = rotq(q, aNormal);
  vShard = aShard;
  vFree = step(texelFetch(uLaunch, ivec2(i, 0), 0).w, uTime);
  gl_Position = uViewProj * vec4(wp, 1.0);
}`;

export const SHARD_FS = `#version 300 es
precision highp float;
in vec3 vPos, vN;
flat in vec2 vShard;
flat in float vFree;
uniform vec3 uCamPos;
uniform int  uView, uEdges;
out vec4 FragColor;
${SKY}
vec3 hash3(float n) { return fract(sin(vec3(n * 12.9898, n * 78.233, n * 37.719)) * 43758.5453); }

void main() {
  if (vPos.y < -0.003) discard;                       // under the floor: only the closed form gets here
  if (vShard.y > 0.5 && vFree < 0.5) discard;         // no fracture face until the crack has passed
  vec3 V = normalize(vPos - uCamPos), n = normalize(vN);
  if (dot(n, V) > 0.0) n = -n;
  float diff = max(dot(n, SUN), 0.0);
  if (uView == 1) {
    FragColor = vec4((0.3 + 0.7 * hash3(vShard.x + 1.0)) * (0.45 + 0.55 * diff), 1.0);
    return;
  }
  float F = 0.04 + 0.96 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
  vec3 refl = sky(reflect(V, n));
  if (vShard.y > 0.5 && uEdges == 1) {
    // A fracture face: here the eye looks along the glass, through centimetres of it,
    // and the iron in ordinary glass absorbs red and blue: pale green, nearly opaque
    vec3 col = vec3(0.36, 0.72, 0.56) * (0.45 + 0.55 * diff) + refl * F;
    FragColor = vec4(col * 0.85, 0.85);
  } else {
    // The flat faces: a Fresnel reflection over almost clear glass (premultiplied)
    FragColor = vec4(refl * F + vec3(0.004, 0.012, 0.008), F + 0.05);
  }
}`;

export const VAT_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform highp sampler2D uVat;
uniform int   uShards, uFrames;
uniform float uFrame;
void main() {
  // Left: centres (row 2f), right: quaternions (row 2f + 1); time runs down
  bool rotation = vUV.x > 0.5;
  float x = fract(vUV.x * 2.0) * float(uShards);
  float f = (1.0 - vUV.y) * float(uFrames);
  int i = int(x), fi = int(f);
  vec4 v = texelFetch(uVat, ivec2(i, 2 * fi + (rotation ? 1 : 0)), 0);
  vec3 col = rotation ? v.xyz * 0.5 + 0.5 : clamp((v.xyz - texelFetch(uVat, ivec2(i, 0), 0).xyz) * 0.6 + 0.5, 0.0, 1.0);
  col *= 0.8 + 0.2 * step(0.12, fract(x));                                  // a thin gap between columns
  if (abs(f - uFrame) < 0.6) col = mix(col, vec3(1.0), 0.8);                // the frame being played
  if (abs(vUV.x - 0.5) < 0.002) col = vec3(0.0);
  FragColor = vec4(col, 1.0);
}`;

// ── Glass studio shader ───────────────────────────────────────────────────────
// One fullscreen pass that sphere-traces a glass object (signed distance
// functions) in front of a sky cube map and a tiled floor. A ray follows ONE
// path through the glass: refracted on the way in, then at every exit either
// out (refract) or back in (total internal reflection). The branch it does not
// follow is approximated by a lookup of the environment, weighted by Fresnel.
// Inside, light is absorbed by Beer–Lambert. With dispersion on, the whole path
// is traced three times, with a slightly different index for R, G and B.
// Compile time matters on Windows (ANGLE → D3D unrolls loops and inlines every
// call site), so: loop bounds go through uZero, and map() / march() / the
// normal each have a single call site inside the segment loop.

export const STUDIO_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform samplerCube uSky;
uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;
uniform int   uShape;        // 0 sphere, 1 prism, 3 torus, 4 rounded cube, 5 wine glass (cut gems: figures/gems)
uniform int   uView;         // 0 full, 1 Fresnel F, 2 reflection only, 3 refraction only, 4 bounce count
uniform int   uBounces;      // internal bounces followed, 1..8
uniform int   uZero;         // always 0: keeps loops from being unrolled
uniform float uIor, uDisp, uDensity, uAngle;
uniform vec3  uTint;

const vec3  SUN   = vec3(0.48, 0.62, 0.62);
const float FLOOR = -1.13;

// ── Shapes (unit size, centred on the origin) ────────────────────────────────

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdPrism(vec3 p) {                    // triangle in x/y, extruded along z
  vec3 q = abs(p);
  return max(q.z - 1.1, max(q.x * 0.866025 + p.y * 0.5, -p.y) - 0.62);
}

float sdWine(vec3 p) {
  float r = length(p.xz), y = p.y;
  float bowl = max(abs(length(vec2(r, y - 0.32)) - 0.72) - 0.028, y - 0.78);
  float stem = length(vec2(r, y - clamp(y, -1.08, -0.4))) - 0.045;
  vec2  b = vec2(r - 0.52, abs(y + 1.1) - 0.012);
  float base = length(max(b, 0.0)) + min(max(b.x, b.y), 0.0) - 0.01;
  return smin(smin(bowl, stem, 0.07), base, 0.05);
}

float map(vec3 p) {
  p.xz = rot(uAngle) * p.xz;
  if (uShape == 0) return length(p) - 1.0;
  if (uShape == 1) { p.xy = rot(0.25) * p.xy; return sdPrism(p); }
  if (uShape == 3) { p.yz = rot(1.0) * p.yz; return length(vec2(length(p.xz) - 0.78, p.y)) - 0.34; }
  if (uShape == 4) { p.xy = rot(0.5) * p.xy; vec3 q = abs(p) - 0.52; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - 0.18; }
  return sdWine(p);
}

vec3 normalAt(vec3 p) {                    // tetrahedron of 4 taps, one call site
  vec3 n = vec3(0.0);
  for (int i = uZero; i < 4; i++) {
    vec3 e = 0.5773 * (2.0 * vec3(float(((i + 3) >> 1) & 1), float((i >> 1) & 1), float(i & 1)) - 1.0);
    n += e * map(p + 0.0008 * e);
  }
  return normalize(n);
}

// ── The world around the glass: sky + a tiled floor ──────────────────────────

vec3 env(vec3 ro, vec3 rd) {
  vec3 sky = texture(uSky, rd).rgb + 3.0 * pow(max(dot(rd, SUN), 0.0), 900.0);
  if (rd.y > -0.002 || ro.y < FLOOR) return sky;                   // looking up, or seen from below the floor
  float t = (FLOOR - ro.y) / rd.y;
  vec3 p = ro + rd * t;
  vec2 c = floor(p.xz * 0.9);
  float tile = (mod(c.x + c.y, 2.0) - 0.5) * exp(-t * 0.18);       // contrast fades with distance: no shimmer at the horizon
  vec3 col = vec3(0.68, 0.66, 0.62) + 0.2 * tile;
  float s = exp(-dot(p.xz, p.xz) * 1.4);                           // soft, tinted shadow under the glass
  col *= mix(vec3(1.0), 0.25 + 0.5 * uTint, 0.6 * s);
  // far away the floor fades into the haze at the horizon: sample the sky just
  // above it, since below the horizon the sky images hold their own ground
  vec3 haze = texture(uSky, normalize(vec3(rd.x, 0.03, rd.z))).rgb;
  return mix(haze, col, exp(-t * 0.045));
}

// Schlick, using the angle on the thin side when light leaves (exact TIR)
float fresnel(float cosI, float n1, float n2) {
  float r0 = (n1 - n2) / (n1 + n2); r0 *= r0;
  if (n1 > n2) {
    float s2 = (n1 / n2) * (n1 / n2) * (1.0 - cosI * cosI);
    if (s2 > 1.0) return 1.0;
    cosI = sqrt(1.0 - s2);
  }
  return r0 + (1.0 - r0) * pow(1.0 - cosI, 5.0);
}

// ── One path through the glass ────────────────────────────────────────────────
// Returns the colour; tirs = how many total internal reflections the path
// made, or −1 when the camera ray misses the glass.

vec3 trace(vec3 ro, vec3 rd, float ior, out float tirs) {
  vec3 col = vec3(0.0), w = vec3(1.0);
  bool inside = false;
  tirs = 0.0;
  int maxSeg = 2 * uBounces + 4;
  for (int seg = uZero; seg < 24; seg++) {
    if (seg >= maxSeg) break;
    // sphere tracing; inside the glass the distance is negated
    float sgn = inside ? -1.0 : 1.0, t = 0.002;
    bool hit = false;
    for (int i = uZero; i < 140; i++) {
      float d = sgn * map(ro + rd * t);
      if (d < 0.0004) { hit = true; break; }
      t += max(d, inside ? 0.0015 : 0.0005);
      if (t > 14.0) break;
    }
    if (!hit) { if (seg == 0) tirs = -1.0; col += w * env(ro, rd); return col; }
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);                                           // outward
    if (inside) w *= pow(max(uTint, vec3(0.002)), vec3(t * uDensity));   // Beer–Lambert
    vec3 N = inside ? -n : n;                                       // faces the ray
    float n1 = inside ? ior : 1.0, n2 = inside ? 1.0 : ior;
    float cosI = clamp(-dot(rd, N), 0.0, 1.0);
    float F = fresnel(cosI, n1, n2);
    vec3 R = reflect(rd, N), T = refract(rd, N, n1 / n2);
    if (uView == 1 && seg == 0) return vec3(F);
    if (uView == 2 && seg == 0) return env(p, R);
    if (uView == 3) F = (dot(T, T) < 1e-6) ? 1.0 : 0.0;
    if (dot(T, T) < 1e-6) {                                         // total internal reflection
      tirs += 1.0;
      rd = R; ro = p + N * 0.002;                                   // stay on the glass side
      continue;
    }
    col += w * F * env(p, R);                                       // the branch not followed
    w *= 1.0 - F;
    rd = T; ro = p - N * 0.003;                                     // step through the surface
    inside = !inside;
  }
  return col + w * env(ro, rd);                                     // light still trapped
}

void main() {
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 rd = normalize(uCamF + uCamR * ndc.x * uTanHalf * uAspect + uCamU * ndc.y * uTanHalf);
  vec3 col = vec3(0.0);
  float tirs = 0.0;
  int passes = uDisp > 0.0 ? 3 : 1;
  for (int c = uZero; c < 3; c++) {
    if (c >= passes) break;
    float k = passes == 1 ? 0.0 : float(c) - 1.0;                  // red −1, green 0, blue +1
    float tc;
    vec3 v = trace(uCamPos, rd, uIor + k * uDisp, tc);
    if (passes == 1) col = v; else col[c] = v[c];
    tirs = max(tirs, tc);
  }
  if (uView == 4) {                                                 // 0 bounces grey-blue, then blue → red
    vec3 heat = tirs < 0.5 ? vec3(0.16, 0.19, 0.26) : mix(vec3(0.15, 0.4, 1.0), vec3(1.0, 0.22, 0.08), clamp((tirs - 1.0) / 5.0, 0.0, 1.0));
    col = tirs < 0.0 ? col * 0.25 : mix(heat, col, 0.15);
  }
  col = col / (1.0 + 0.12 * col);                                   // soft shoulder for the sparkles
  FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

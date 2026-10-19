// ── Diamond shader ────────────────────────────────────────────────────────────
// A round brilliant traced exactly, with no marching: the stone is a convex
// polyhedron given as planes n·p = h (gemCut.ts), so a ray enters at the
// LARGEST t among the planes it is entering and, from inside, leaves at the
// SMALLEST t among the planes it is heading out of.
// Inside, the path follows the reflected branch: at every exit either total
// internal reflection (all of it stays in) or a split, where (1 − F) leaves and
// is added as a look-up of the environment, and F goes on. Each wavelength
// gets its own index from Cauchy, and its result is added with that
// wavelength's colour (weights that sum to white): the colours only part
// where they leave at different angles, and that is the stone's fire.
// Loop bounds go through uZero so ANGLE does not unroll them.

export const DIAMOND_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform samplerCube uSky;
uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;
uniform vec4  uPlanes[80];     // facet planes: xyz outward normal, w offset
uniform int   uCount;
uniform int   uWaves;          // 1, 3 or 8 wavelengths
uniform float uLam[8];         // nm
uniform vec3  uW[8];           // colour of each wavelength; together they add up to white
uniform float uA, uB, uBoost;  // Cauchy n(λ) = A + B/λ², spread around 550 nm × uBoost
uniform int   uBounces;
uniform int   uView;           // 0 light, 1 where it leaves (top / bottom), 2 total internal reflections
uniform int   uEnv;            // 0 showroom lamps, 1 sky
uniform float uAngle;          // the stone turns about y
uniform int   uZero;

// ── The world around the stone ────────────────────────────────────────────────

vec3 rotY(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z); }

vec3 env(vec3 d) {
  d = rotY(d, uAngle);                                          // stone space → world
  if (uEnv == 1) return texture(uSky, d).rgb * 1.3 + 30.0 * pow(max(dot(d, normalize(vec3(0.48, 0.62, 0.62))), 0.0), 2000.0);
  // A jeweller's showroom: dark walls, soft light panels above, a few small hard lamps
  vec3 c = mix(vec3(0.012, 0.013, 0.018), vec3(0.05, 0.055, 0.07), smoothstep(-0.4, 0.9, d.y));
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 1.5708 + 0.4;
    vec3 f = normalize(vec3(cos(a) * 0.55, 0.83, sin(a) * 0.55));
    vec3 u = normalize(cross(f, vec3(0.0, 1.0, 0.0))), v = cross(u, f);
    float k = dot(d, f);
    vec2 q = vec2(dot(d, u), dot(d, v)) / max(k, 1e-3);
    if (k > 0.0 && abs(q.x) < 0.18 && abs(q.y) < 0.32) c += vec3(2.2, 2.1, 1.95);
  }
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0472 + 0.15, e = 0.35 + 0.25 * float(i & 1);
    vec3 L = vec3(cos(a) * cos(e), sin(e), sin(a) * cos(e));
    c += 70.0 * pow(max(dot(d, L), 0.0), 6000.0);
  }
  return c;
}

// ── Ray against the stone ─────────────────────────────────────────────────────

// Entering from outside: largest t of the planes being entered, smallest of the ones being left
float enter(vec3 ro, vec3 rd, out vec3 N) {
  float tIn = -1e9, tOut = 1e9;
  N = vec3(0.0, 1.0, 0.0);
  for (int i = uZero; i < 80; i++) {
    if (i >= uCount) break;
    vec4 P = uPlanes[i];
    float den = dot(P.xyz, rd), dist = P.w - dot(P.xyz, ro);
    if (abs(den) < 1e-7) { if (dist < 0.0) return -1.0; continue; }
    float t = dist / den;
    if (den < 0.0) { if (t > tIn) { tIn = t; N = P.xyz; } }
    else tOut = min(tOut, t);
  }
  return (tIn < tOut && tIn > 0.0) ? tIn : -1.0;
}

// From inside: the nearest plane the ray is heading out of
float leave(vec3 p, vec3 d, out vec3 N) {
  float tOut = 1e9;
  N = vec3(0.0, 1.0, 0.0);
  for (int i = uZero; i < 80; i++) {
    if (i >= uCount) break;
    vec4 P = uPlanes[i];
    float den = dot(P.xyz, d);
    if (den <= 1e-7) continue;
    float t = (P.w - dot(P.xyz, p)) / den;
    if (t > 1e-5 && t < tOut) { tOut = t; N = P.xyz; }
  }
  return tOut;
}

// Unpolarised Fresnel reflectance; cosines from the normal
float fresnel(float n1, float n2, float ci, float ct) {
  float rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
  float rp = (n1 * ct - n2 * ci) / (n1 * ct + n2 * ci);
  return 0.5 * (rs * rs + rp * rp);
}

void main() {
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 rd = normalize(uCamF + uCamR * ndc.x * uTanHalf * uAspect + uCamU * ndc.y * uTanHalf);
  vec3 ro = rotY(uCamPos, -uAngle);                             // world → stone space
  rd = rotY(rd, -uAngle);

  vec3 N;
  float t = enter(ro, rd, N);
  if (t < 0.0) {
    vec3 bg = uView == 0 ? env(rd) : vec3(0.04);
    FragColor = vec4(1.0 - exp(-bg * 1.4), 1.0);
    return;
  }
  vec3 p0 = ro + rd * t;
  float nMid = uA + uB / (550.0 * 550.0);
  float ci = -dot(rd, N);
  float F0 = fresnel(1.0, nMid, ci, sqrt(1.0 - (1.0 - ci * ci) / (nMid * nMid)));
  vec3 col = F0 * env(reflect(rd, N));                          // the surface reflection is the same for every colour
  float top = 0.0, leak = 0.0, tirs = 0.0;

  for (int k = uZero; k < 8; k++) {
    if (k >= uWaves) break;
    float l = uLam[k];
    float n = uA + uB / (550.0 * 550.0) + uBoost * uB * (1.0 / (l * l) - 1.0 / (550.0 * 550.0));
    vec3 d = refract(rd, N, 1.0 / n), p = p0;
    float w = 1.0 - F0;
    vec3 light = vec3(0.0);
    for (int b = uZero; b < 12; b++) {
      if (b >= uBounces || w < 0.01) break;
      vec3 Nout;
      p += d * leave(p, d, Nout);
      float c1 = dot(d, Nout), kk = 1.0 - n * n * (1.0 - c1 * c1);
      if (kk >= 0.0) {                                          // some of it gets out here
        float F = fresnel(n, 1.0, c1, sqrt(kk));
        float esc = w * (1.0 - F);
        light += esc * env(refract(d, -Nout, n));
        if (Nout.y > 0.3) top += esc / float(uWaves); else leak += esc / float(uWaves);
        w *= F;
      } else if (k == 0) tirs += 1.0;                            // total internal reflection: all of it stays in
      d = reflect(d, Nout);
    }
    col += light * uW[k];
  }

  if (uView == 1) col = vec3(0.9, 0.2, 0.15) * leak + vec3(0.2, 0.9, 0.35) * top;
  if (uView == 2) {
    vec3 heat = mix(vec3(0.25), vec3(0.2, 0.5, 1.0), clamp(tirs, 0.0, 1.0));
    heat = mix(heat, vec3(1.0, 0.85, 0.2), clamp(tirs - 1.0, 0.0, 1.0));
    heat = mix(heat, vec3(1.0, 0.25, 0.15), clamp((tirs - 2.0) / 3.0, 0.0, 1.0));
    col = heat;
  }
  FragColor = vec4(uView == 0 ? 1.0 - exp(-col * 1.4) : col, 1.0);
}`;

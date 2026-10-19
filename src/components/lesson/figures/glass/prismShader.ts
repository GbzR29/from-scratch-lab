// ── Prism scene shader ────────────────────────────────────────────────────────
// A dark room with hazy air, a glass prism, a wall and a floor. The beam's path
// is traced on the CPU (prismOptics.ts) and arrives as a list of 2D segments in
// the plane z = 0. The light comes through a slit, so each segment is a sheet:
// Gaussian across its thickness (radius r, in the plane of the path) and flat
// over the slit height |z| < H. For each pixel the shader adds:
//   · haze: dust in the sheet scatters a little light towards the eye. Along
//     the eye ray the sheet's density is a Gaussian in t, so the light picked
//     up is an integral of exp(−x²), which is the error function erf;
//   · spots: where a sheet lands on the wall or the floor, its irradiance,
//     power · cos θ / (r √π · 2H) at the centre line;
//   · the prism itself: Fresnel reflection of a dim studio light and its edges.
// Loops go through uZero (Windows compiles shaders through D3D and unrolls them).

export const MAX_SEG = 80;

export const PRISM_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

#define MAX_SEG ${MAX_SEG}
uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;
uniform vec2  uTri[3];                 // prism cross-section, counter-clockwise
uniform vec4  uSeg[MAX_SEG];           // segment a.xy, b.xy
uniform vec4  uInfo[MAX_SEG / 4];      // per segment: (colour + 1) · 2 + lands + power (packed, 4 per vec4)
uniform int   uNSeg, uZero;
uniform vec3  uCol[16];                // colour of each wavelength; together they add up to white
uniform float uHaze, uRadius, uSlit, uIor;
uniform vec4  uScene;                  // wall x, floor y, wall top, wall half width
uniform float uDepth;                  // prism half length along z
const float WALL_TURN = 0.7;           // radians the wall is turned towards the viewer
const float SQRT_PI = 1.7724539;

// ── The prism: a convex solid, five planes ───────────────────────────────────

void plane(int i, out vec3 n, out float d) {
  if (i == 3) { n = vec3(0.0, 0.0, 1.0); d = uDepth; return; }
  if (i == 4) { n = vec3(0.0, 0.0, -1.0); d = uDepth; return; }
  vec2 a = uTri[i], e = uTri[(i + 1) % 3] - a;
  n = vec3(normalize(vec2(e.y, -e.x)), 0.0);
  d = dot(n.xy, a);
}

// Inside = every plane has dot(n, p) <= d. The ray is inside between the last
// plane it enters and the first one it leaves.
bool hitPrism(vec3 ro, vec3 rd, out float tN, out float tF, out vec3 nN) {
  tN = -1e9; tF = 1e9; nN = vec3(0.0);
  for (int i = uZero; i < 5; i++) {
    vec3 n; float d;
    plane(i, n, d);
    float dn = dot(n, rd), gap = d - dot(n, ro);
    if (abs(dn) < 1e-6) { if (gap < 0.0) return false; continue; }
    float t = gap / dn;
    if (dn < 0.0) { if (t > tN) { tN = t; nN = n; } }
    else tF = min(tF, t);
  }
  return tN < tF && tN > 0.0;
}

// Distance to the nearest edge of the prism from a point on its surface: the
// point is on one face (distance 0), so the edge is where the second closest
// face plane meets it.
float edgeDist(vec3 p) {
  float a = 1e9, b = 1e9;
  for (int i = uZero; i < 5; i++) {
    vec3 n; float d;
    plane(i, n, d);
    float g = abs(d - dot(n, p));
    if (g < a) { b = a; a = g; } else b = min(b, g);
  }
  return b;
}

vec3 studio(vec3 r) {                  // the dim room the prism reflects
  vec3 c = vec3(0.012, 0.014, 0.02) + 0.35 * smoothstep(0.55, 0.95, r.y);
  return c + 1.2 * pow(max(dot(r, normalize(vec3(-1.0, 0.25, 0.3))), 0.0), 60.0);
}

// ── Haze ─────────────────────────────────────────────────────────────────────

float erfApprox(float x) {             // within 0.0002 of erf (Winitzki)
  float x2 = x * x, a = 0.147;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));
}

// Keep the part of [t1, t2] where alpha + beta·t >= 0.
void clip(float alpha, float beta, inout float t1, inout float t2) {
  if (abs(beta) < 1e-7) { if (alpha < 0.0) t2 = -1.0; return; }
  float t = -alpha / beta;
  if (beta > 0.0) t1 = max(t1, t); else t2 = min(t2, t);
}

void main() {
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamF + uCamR * ndc.x * uTanHalf * uAspect + uCamU * ndc.y * uTanHalf);
  float WALL_X = uScene.x, FLOOR_Y = uScene.y, TOP = uScene.z, WZ = uScene.w;

  // ── Wall and floor ──
  // The wall stands on the line x = WALL_X of the beam's plane, turned about
  // that vertical line so that it faces the viewer: the beam lands where the
  // 2D trace says, and the spectrum is not seen edge-on.
  vec3 col = vec3(0.008, 0.009, 0.013) + 0.012 * max(rd.y, 0.0);
  float tS = 1e9;
  vec3 sp = vec3(0.0), sn = vec3(0.0);
  float albedo = 0.0;
  vec3 W0 = vec3(WALL_X, 0.0, 0.0), wn = vec3(-cos(WALL_TURN), 0.0, sin(WALL_TURN)), wt = vec3(sin(WALL_TURN), 0.0, cos(WALL_TURN));
  float dw = dot(rd, wn);
  if (dw < 0.0) {
    float t = dot(W0 - ro, wn) / dw;
    vec3 p = ro + rd * t;
    if (t > 0.0 && p.y > FLOOR_Y && p.y < TOP && abs(dot(p - W0, wt)) < WZ) { tS = t; sp = p; sn = wn; albedo = 0.8; }
  }
  if (rd.y < 0.0) {
    float t = (FLOOR_Y - ro.y) / rd.y;
    vec3 p = ro + rd * t;
    if (t > 0.0 && t < tS && dot(p - W0, wn) > 0.0) { tS = t; sp = p; sn = vec3(0.0, 1.0, 0.0); albedo = 0.45; }
  }

  // ── The beams: haze in every sheet, light where they land ──
  vec3 glow = vec3(0.0), irr = vec3(0.0);
  float r = uRadius, H = uSlit;
  for (int i = uZero; i < MAX_SEG; i++) {
    if (i >= uNSeg) break;
    float packed = uInfo[i / 4][i % 4];
    float base = floor(packed), w = fract(packed);
    float lands = mod(base, 2.0), ci = floor(base / 2.0) - 1.0;
    vec3 c = ci < 0.0 ? vec3(1.0) : uCol[int(ci)];
    vec3 a = vec3(uSeg[i].xy, 0.0), b = vec3(uSeg[i].zw, 0.0);
    float L = length(b - a);
    vec3 d = (b - a) / L, m = vec3(-d.y, d.x, 0.0);                // along the beam, across its thickness
    // A sheet that lands runs on until the wall or the floor cuts it: the
    // turned wall meets the sheet further on at one side than at the other.
    float Lx = lands > 0.5 ? L + 2.0 : L;
    // the stretch of the eye ray that is inside the sheet's slab of height 2H
    float t1 = 0.0, t2 = tS;
    vec3 ra = ro - a;
    clip(H - ro.z, -rd.z, t1, t2);
    clip(H + ro.z, rd.z, t1, t2);
    clip(dot(ra, d), dot(rd, d), t1, t2);
    clip(Lx - dot(ra, d), -dot(rd, d), t1, t2);
    clip(ro.y - FLOOR_Y, rd.y, t1, t2);
    clip(dot(ro - W0, wn), dot(rd, wn), t1, t2);
    if (t2 > t1) {
      // ∫ exp(−(δ0 + μt)² / r²) dt from t1 to t2, δ = distance across the sheet
      float d0 = dot(ra, m), mu = dot(rd, m), I;
      if (abs(mu) < 1e-3) { float x = (d0 + mu * 0.5 * (t1 + t2)) / r; I = exp(-x * x) * (t2 - t1); }
      else I = r * SQRT_PI / (2.0 * mu) * (erfApprox((d0 + mu * t2) / r) - erfApprox((d0 + mu * t1) / r));
      glow += w * c * abs(I) / (r * SQRT_PI * 2.0 * H);
    }
    if (lands > 0.5 && albedo > 0.0) {
      vec3 q = sp - a;
      float u = dot(q, d), off = dot(q, m);
      if (u > 0.0 && u < Lx)
        irr += w * c * exp(-off * off / (r * r)) * (1.0 - smoothstep(H - 0.03, H, abs(sp.z))) * max(dot(-d, sn), 0.0) / (r * SQRT_PI * 2.0 * H);
    }
  }
  if (albedo > 0.0) col = albedo * (vec3(0.02, 0.021, 0.027) + 0.4 * irr) * exp(-0.02 * tS);
  // ── The prism ──
  float tN, tF; vec3 nN;
  if (hitPrism(ro, rd, tN, tF, nN) && tN < tS) {
    float cosI = clamp(-dot(rd, nN), 0.0, 1.0);
    float r0 = (uIor - 1.0) / (uIor + 1.0); r0 *= r0;
    float F = r0 + (1.0 - r0) * pow(1.0 - cosI, 5.0);
    col = col * (1.0 - F) * 0.92 + F * studio(reflect(rd, nN)) + 0.01 * (min(tF, tS) - tN);
    float px = 1.6 * uTanHalf / 400.0;                             // about one pixel at distance 1
    float e = exp(-pow(edgeDist(ro + rd * tN) / (px * tN), 2.0));
    if (tF < tS) e += 0.55 * exp(-pow(edgeDist(ro + rd * tF) / (px * tF), 2.0));
    col += e * vec3(0.55, 0.6, 0.68);
  }

  col += uHaze * 0.5 * glow;
  col = 1.0 - exp(-col * 1.4);                                     // exposure
  FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

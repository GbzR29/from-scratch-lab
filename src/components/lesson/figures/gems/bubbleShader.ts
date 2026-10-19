// ── Soap bubble shader ────────────────────────────────────────────────────────
// A sphere of soapy water a few hundred nanometres thick, in front of a sky.
// At each wall, light reflects off the front and the back of the film and the
// two waves interfere. For a film between two equal media (air, water, air)
// the reflectance at one wavelength is the Airy sum of all the bounces:
//     R = 4r² sin²φ / ((1 − r²)² + 4r² sin²φ),   φ = 2π n t cos θt / λ,
// with r the Fresnel amplitude at the air–water surface (averaged over the two
// polarisations). It is computed at 16 wavelengths and summed with their
// colours. The thickness t drains downwards and swirls with time.
// Three paths reach the eye: reflected off the front wall, straight through
// both walls, and reflected inside off the back wall (the small upside-down
// second image).

export const BUBBLE_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform samplerCube uSky;
uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;
uniform float uLam[16];        // nm
uniform vec3  uW[16];          // colour of each wavelength; together they add up to white
uniform float uMean;           // average thickness, nm
uniform float uDrain;          // 0 even film, 1 the top has drained to nothing
uniform float uSwirl;
uniform float uTime;
uniform int   uView;           // 0 colour, 1 thickness, 2 no interference
uniform int   uBackdrop;       // 1: black card behind the bubble
uniform int   uZero;

const float NF = 1.33;         // soapy water

// ── Thickness of the film at a point of the unit sphere ───────────────────────

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

float thickness(vec3 p) {
  // swirl: turn each height band by a different, slowly changing amount
  float a = uSwirl * (2.5 * noise(vec3(p.y * 3.0, uTime * 0.12, 0.0)) + 0.3 * uTime);
  float c = cos(a), s = sin(a);
  vec3 q = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  float n = noise(q * 3.0 + vec3(0.0, -uTime * 0.08, 0.0)) * 0.65 + noise(q * 7.0) * 0.35;
  float drained = mix(1.0 - uDrain, 1.0 + uDrain, 0.5 - 0.5 * p.y);        // gravity pulls the water down
  return max(uMean * drained * (1.0 + uSwirl * 1.1 * (n - 0.5)), 0.0);
}

// ── Thin-film reflectance at one wavelength ───────────────────────────────────

float airy(float r, float s2) { float r2 = r * r; return 4.0 * r2 * s2 / ((1.0 - r2) * (1.0 - r2) + 4.0 * r2 * s2); }

float film(float lambda, float cosI, float t) {
  float cosT = sqrt(1.0 - (1.0 - cosI * cosI) / (NF * NF));             // Snell inside the film
  float rs = (cosI - NF * cosT) / (cosI + NF * cosT);
  float rp = (NF * cosI - cosT) / (NF * cosI + cosT);
  float phi = 6.2831853 * NF * t * cosT / lambda;                       // half the phase of one round trip
  float s2 = sin(phi) * sin(phi);
  if (uView == 2) {                                                     // no interference: add the bounces' powers, not their waves
    float is = rs * rs, ip = rp * rp;
    return 0.5 * (2.0 * is / (1.0 + is) + 2.0 * ip / (1.0 + ip));
  }
  return 0.5 * (airy(rs, s2) + airy(rp, s2));
}

vec2 sphere(vec3 ro, vec3 rd) {
  float b = dot(ro, rd), h = b * b - dot(ro, ro) + 1.0;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

// The world: the sky, or with the backdrop on, a black card behind the bubble (the photographer's trick)
vec3 sky(vec3 d) {
  vec3 s = texture(uSky, d).rgb + 6.0 * pow(max(dot(d, normalize(vec3(0.48, 0.62, 0.62))), 0.0), 900.0);
  return uBackdrop == 1 ? s * smoothstep(0.5, 0.1, dot(d, uCamF)) : s;
}

void main() {
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 rd = normalize(uCamF + uCamR * ndc.x * uTanHalf * uAspect + uCamU * ndc.y * uTanHalf);
  vec3 bg = sky(rd);
  vec2 h = sphere(uCamPos, rd);
  if (h.x < 0.0) { FragColor = vec4(bg, 1.0); return; }

  vec3 p1 = uCamPos + rd * h.x, p2 = uCamPos + rd * h.y;               // front and back wall
  float c1 = -dot(rd, p1), c2 = dot(rd, p2);                             // cosines of the hits (unit sphere: p = normal)
  float t1 = thickness(p1), t2 = thickness(p2);
  if (uView == 1) {
    float v = clamp(t1 / 1200.0, 0.0, 1.0);
    vec3 m = mix(vec3(0.05, 0.05, 0.12), vec3(0.95, 0.9, 0.6), v);
    if (t1 < 30.0) m = vec3(0.0);                                         // black film
    FragColor = vec4(m, 1.0);
    return;
  }
  vec3 front = sky(reflect(rd, p1)), inner = sky(reflect(rd, -p2));
  vec3 col = vec3(0.0);
  for (int k = uZero; k < 16; k++) {
    float R1 = film(uLam[k], c1, t1), R2 = film(uLam[k], c2, t2);
    col += uW[k] * (R1 * front + (1.0 - R1) * (1.0 - R2) * bg + (1.0 - R1) * R2 * inner);
  }
  if (uBackdrop == 1) col = 1.0 - exp(-col * 7.0);                       // a longer exposure, as a photographer would use
  FragColor = vec4(col, 1.0);
}`;

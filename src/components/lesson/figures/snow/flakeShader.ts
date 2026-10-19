// ── Snowflake shader ──────────────────────────────────────────────────────────
// A plate-type snow crystal seen from above, drawn as a 2D distance field.
// The plane is folded into one twelfth (fold6): six 60° wedges onto one, then
// the two mirror halves of that wedge onto one. Everything after the fold is
// written for one half-arm only, in coordinates q where q.x runs along the arm
// and 0 ≤ q.y ≤ q.x·tan 30°.
// The shape is a growth record. uHist[i] is the supersaturation the tip met
// when it was at radius (i + 0.5)/HIST · uMaxR: high means the corners won and
// side branches sprouted there, low means the facets won and the arm widened
// into a flat plate. Since all six arms read the same q, they come out alike,
// as in a real crystal, whose arms all grew in the same air at the same time.
// uImperfect mixes the wedge index k into the hashes, so the arms drift apart.

export const FLAKE_HIST = 48;

export const FLAKE_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform float uAspect;
uniform float uR;              // current tip radius
uniform float uMaxR;           // radius the history covers
uniform float uHist[${FLAKE_HIST}];
uniform float uSpacing;        // distance between side branches, as a fraction of uMaxR
uniform float uSeed;
uniform float uImperfect;      // 0: six identical arms
uniform int   uView;           // 0 crystal, 1 the wedge
uniform int   uZero;

const float PI = 3.14159265;
const int HIST = ${FLAKE_HIST};
const float T30 = 0.57735;     // tan 30°
const vec2 N30 = vec2(0.8660254, 0.5);
const vec2 B60 = vec2(0.5, 0.8660254);

float hash11(float x) { return fract(sin(x * 127.1 + uSeed * 311.7) * 43758.5453); }

// ── The fold: one twelfth of the plane ────────────────────────────────────────
vec2 fold6(vec2 p, out float k) {
  float a = atan(p.y, p.x);
  k = floor((a + PI / 6.0) / (PI / 3.0));            // which of the six arms
  a = mod(a + PI / 6.0, PI / 3.0) - PI / 6.0;         // six 60° wedges onto one
  float side = step(a, 0.0);
  a = abs(a);                                          // mirror: the two halves onto one
  k = k * 2.0 + side;                                  // which of the twelve pieces
  return length(p) * vec2(cos(a), sin(a));
}

float hist(float x) {
  float f = clamp(x / uMaxR, 0.0, 0.999) * float(HIST) - 0.5;
  int i = int(floor(f));
  int i0 = clamp(i, 0, HIST - 1), i1 = clamp(i + 1, 0, HIST - 1);
  return mix(uHist[i0], uHist[i1], clamp(f - float(i), 0.0, 1.0));
}

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// ── One half-arm ──────────────────────────────────────────────────────────────
// Returns the distance to the crystal; ridge gets 1 on the arm's and the
// branches' central ribs, where real plates are thicker.
float crystal(vec2 q, float k, out float ridge) {
  float R = max(uR, 1e-3);
  float w = 0.012 + 0.006 * R;                         // half-width of a bare arm
  float salt = uImperfect * (k * 7.13 + 1.0);

  // The arm, widened where it grew as a plate (low supersaturation)
  float plate = 1.0 - smoothstep(0.35, 0.65, hist(q.x));
  float wide = min(0.92 * T30 * q.x, 1.15 * (R - q.x));   // never into the next arm, pointed at the tip
  float W = w + plate * max(wide, 0.0) * (1.0 + 0.4 * uImperfect * (hash11(floor(q.x * 20.0) + salt) - 0.5));
  float d = max(q.y - W, q.x - R);
  ridge = 1.0 - smoothstep(0.0, 0.006, q.y);

  // Side branches, at 60° to the arm: parallel to the two neighbouring arms
  float s = uSpacing * uMaxR;
  for (int j = 1; j < 40 + uZero; j++) {
    float xj = float(j) * s;
    if (xj >= R) break;
    float h = hist(xj);
    if (h < 0.5) continue;                               // the facets won here: no branch
    float jit = hash11(float(j) + salt);
    // A branch keeps growing after the tip has passed, so the older ones are
    // longer, and it stops before it reaches the next arm's branch (ℓ < x).
    float len = min(0.75 * xj, 0.85 * (R - xj)) * (0.5 + 0.5 * jit) * smoothstep(0.5, 0.8, h);
    vec2 a = vec2(xj, 0.0), b = a + B60 * len;
    float db = sdSeg(q, a, b) - w * 0.75;
    d = min(d, db);
    ridge = max(ridge, (1.0 - smoothstep(0.0, 0.005, sdSeg(q, a, b))) * step(db, 0.0));
  }
  d = min(d, dot(q, N30) - min(R, 0.07) * N30.x);        // every crystal starts as a tiny hexagonal plate
  d = max(d, dot(q, N30) - R * N30.x);                   // the whole crystal stays inside the hexagon of its tips
  return d;
}

uniform float uPx;             // one pixel in p units

void main() {
  vec2 p = (vUV - 0.5) * 2.2 * vec2(uAspect, 1.0);
  float k;
  vec2 q = fold6(p, k);
  float ridge;
  float d = crystal(q, k, ridge);

  // Dark backdrop, as in snow-crystal photographs lit from behind
  vec3 col = mix(vec3(0.05, 0.10, 0.20), vec3(0.015, 0.03, 0.07), clamp(length(p) * 0.6, 0.0, 1.0));

  // Ice: almost clear inside, bright where the light grazes an edge or a rib
  float m = smoothstep(uPx, -uPx, d);
  float rim = exp(min(d, 0.0) / 0.007);
  float hexR = dot(q, N30) / N30.x;                       // the hexagonal "radius" of this point
  vec3 tint = 0.018 * cos(6.2832 * (hexR * 2.5 + vec3(0.0, 0.33, 0.67)));
  vec3 ice = vec3(0.72, 0.86, 1.0);
  col += m * (ice * (0.2 + 0.12 * smoothstep(0.0, 0.05, -d) + 0.75 * rim + 0.45 * ridge) + tint);

  if (uView == 1) {
    // The one twelfth the code really draws; the rest is its copies
    if (k != 0.0) col = mix(col, vec3(0.03, 0.05, 0.09), 0.62);
    float a = atan(p.y, p.x), r = length(p);
    float seg = PI / 6.0, n = floor(a / seg + 0.5);
    float line = r * abs(sin(a - n * seg));
    float isArm = 1.0 - step(0.5, mod(n, 2.0));        // even multiples of 30° are the arms
    vec3 lc = mix(vec3(0.35, 0.85, 0.95), vec3(1.0, 0.72, 0.3), isArm);
    float dash = isArm > 0.5 ? 1.0 : step(0.5, fract(r * 14.0));
    col = mix(col, lc, (1.0 - smoothstep(0.0, uPx * 1.5, line)) * dash * 0.9);
  }
  FragColor = vec4(pow(col, vec3(1.0 / 1.1)), 1.0);
}`;

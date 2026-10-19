// ── Rain on a window ──────────────────────────────────────────────────────────
// Three passes:
//   CITY_FS  a night street behind the glass, rendered into a texture whose
//            mipmaps give the blur of the fogged glass for free.
//   WIPE_FS  the glass's "clear" mask (ping-pong): the fog creeps back at rate
//            k, and the pointer wipes a stripe like a hand.
//   RAIN_FS  the window. Drops are a height field built from hashed cells:
//            big drops sliding down tall cells in stick-slip jumps, leaving a
//            trail that wipes the fog and a line of tiny droplets; small drops
//            sitting still, which a passing trail sweeps away. Each drop is a
//            lens: the slope of its surface shifts where the city is read, so
//            near its edge it reads the far side and shows the scene upside
//            down. Outside drops and trails the city is read at a blurry mip.

export const CITY_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform float uAspect, uTime;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// A soft round light, the way an out-of-focus street light looks
vec3 light(vec2 p, vec2 c, float r, vec3 col) { float d = length(p - c); return col * smoothstep(r, r * 0.3, d); }

void main() {
  vec2 p = vec2(vUV.x * uAspect, vUV.y);
  vec3 col = mix(vec3(0.12, 0.06, 0.05), vec3(0.01, 0.015, 0.04), smoothstep(0.3, 0.9, p.y));   // city glow at the horizon
  // Buildings with lit windows
  for (int layer = 0; layer < 2; layer++) {
    float fl = float(layer), w = 0.12 + 0.06 * fl;
    float bx = floor(p.x / w + fl * 3.7);
    float top = 0.42 + 0.35 * hash(vec2(bx, fl)) - 0.12 * fl;
    if (p.y < top && p.y > 0.28) {
      vec3 b = vec3(0.012, 0.014, 0.02) * (1.0 + fl);
      vec2 win = vec2(fract(p.x / w * 6.0), fract(p.y * 38.0));
      vec2 wid = vec2(floor(p.x / w * 6.0), floor(p.y * 38.0));
      float lit = step(0.62, hash(wid + fl * 11.0)) * step(0.2, win.x) * step(win.x, 0.8) * step(0.25, win.y) * step(win.y, 0.75);
      vec3 wc = mix(vec3(1.0, 0.72, 0.38), vec3(0.6, 0.75, 1.0), step(0.8, hash(wid * 1.7)));
      col = b + wc * lit * 0.55;
    }
  }
  // The street: wet asphalt, street lamps, and cars in both directions
  if (p.y < 0.28) col = vec3(0.01, 0.012, 0.016) + vec3(0.12, 0.07, 0.03) * smoothstep(0.0, 0.28, p.y) * 0.3;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    col += light(p, vec2(fi * 0.32 + 0.1, 0.5), 0.022, vec3(1.0, 0.6, 0.25) * 1.4);                 // lamp heads
    col += light(p, vec2(fi * 0.32 + 0.1, 0.18), 0.05, vec3(1.0, 0.6, 0.25) * 0.25);                 // their glow on the wet road
    float x1 = fract(hash(vec2(fi, 1.0)) - uTime * 0.05 * (0.7 + 0.6 * hash(vec2(fi, 2.0)))) * (uAspect + 0.4) - 0.2;
    float x2 = fract(hash(vec2(fi, 3.0)) + uTime * 0.04 * (0.7 + 0.6 * hash(vec2(fi, 4.0)))) * (uAspect + 0.4) - 0.2;
    col += light(p, vec2(x1, 0.12), 0.012, vec3(1.0, 0.95, 0.85) * 2.0) + light(p, vec2(x1 + 0.04, 0.12), 0.012, vec3(1.0, 0.95, 0.85) * 2.0);
    col += light(p, vec2(x2, 0.2), 0.01, vec3(1.0, 0.1, 0.05) * 1.6) + light(p, vec2(x2 + 0.035, 0.2), 0.01, vec3(1.0, 0.1, 0.05) * 1.6);
  }
  FragColor = vec4(col, 1.0);
}`;

export const WIPE_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform sampler2D uPrev;
uniform float uAspect, uReturn;  // uReturn = e^(−k·dt): how much of the clearing survives this frame
uniform vec4  uStroke;           // the pointer's last and current position, in window uv (x scaled by aspect)
uniform int   uDown, uReset;

float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0); return length(pa - ba * h); }

void main() {
  float c = uReset == 1 ? 0.0 : texture(uPrev, vUV).r * uReturn;   // the fog creeps back
  if (uDown == 1) {
    vec2 p = vec2(vUV.x * uAspect, vUV.y);
    c = max(c, smoothstep(0.075, 0.04, seg(p, uStroke.xy, uStroke.zw)));   // a hand-wide stripe
  }
  FragColor = vec4(c, 0.0, 0.0, 1.0);
}`;

export const RAIN_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;
uniform sampler2D uCity, uWipe;
uniform float uAspect, uTime, uRain, uFog, uLens, uBlur;
uniform int   uView;           // 0 window, 1 height field, 2 clear mask
uniform int   uZero;

vec3 hash3(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.xxy + q.yzz) * q.zyx);
}

const float CELL_H = 3.0;      // a sliding drop's cell is three times taller than wide

// Where a sliding drop is at height y (0…1 of its cell): a wobbly path it also leaves its trail along
float pathX(float y, vec3 n) { return (n.x - 0.5) * 0.45 + 0.09 * sin(y * 17.0 + n.y * 6.28) * sin(y * 7.3 + n.x * 3.0); }

// ── The height of the water on the glass at q, and how much the trails have cleared ──
float drops(vec2 q, out float clear) {
  clear = 0.0;
  float h = 0.0;
  // Big sliding drops: columns of tall cells
  vec2 s = q * vec2(7.0, 7.0 / CELL_H);
  vec2 id = floor(s);
  vec3 n = hash3(id + 4.0);
  if (n.z < uRain) {
    vec2 st = vec2(fract(s.x) - 0.5, fract(s.y));
    // Stick-slip: pinned most of the time, then a quick slide; 5 jumps per pass
    float ph = fract(uTime * (0.05 + 0.06 * n.y) + n.x) * 5.0;
    // From 0.88 down to 0.12 of the cell: a drop (up to 0.11 tall) never touches the cell's ends, or the edge would cut it
    float yd = 0.88 - 0.76 * (floor(ph) + smoothstep(0.55, 1.0, fract(ph))) / 5.0;
    float r = 0.16 + 0.08 * n.y;
    vec2 dv = vec2(st.x - pathX(yd, n), (st.y - yd) * CELL_H);
    dv.y *= dv.y > 0.0 ? 0.75 : 1.15;                                // flatter on top, rounder below
    float d = length(dv) / r;
    h = max(h, r * sqrt(max(1.0 - d * d, 0.0)));
    // The trail above it: the fog is wiped where the drop has been
    float above = st.y - yd;
    if (above > 0.0) {
      float cx = abs(st.x - pathX(st.y, n));
      float w = r * (0.75 - 0.35 * smoothstep(0.0, 0.6, above));
      clear = max(clear, smoothstep(w, w * 0.6, cx) * exp(-above * 1.2));
      // Tiny droplets left behind along the trail
      float k = floor(st.y * 24.0);
      vec3 m = hash3(vec2(k, id.x * 7.0 + id.y));
      float yc = (k + 0.5) / 24.0;
      if (m.x > 0.45 && yc > yd + 0.02) {
        float rr = 0.03 + 0.04 * m.y;
        vec2 dc = vec2(st.x - pathX(yc, n) - (m.z - 0.5) * 0.08, (st.y - yc) * CELL_H);
        float dd = length(dc) / rr;
        h = max(h, rr * sqrt(max(1.0 - dd * dd, 0.0)));
      }
    }
  }
  // Small drops sitting still; a trail sweeps them up
  vec2 s2 = q * 26.0;
  vec2 id2 = floor(s2);
  vec3 m2 = hash3(id2 + 91.0);
  if (m2.z < 0.2 + 0.55 * uRain) {
    vec2 c = (m2.xy - 0.5) * 0.5;
    float grow = smoothstep(0.0, 0.25, fract(uTime * 0.04 + m2.z * 7.0));   // drops land and grow, then a new one replaces them
    float rr = (0.12 + 0.18 * m2.y) * grow;
    float dd = length(fract(s2) - 0.5 - c) / max(rr, 1e-3);
    h = max(h, rr / 26.0 * 7.0 * sqrt(max(1.0 - dd * dd, 0.0)) * (1.0 - smoothstep(0.1, 0.4, clear)));
  }
  return h;
}

void main() {
  vec2 uv = vUV;
  vec2 q = vec2(uv.x * uAspect, uv.y);

  // Height and its slope by finite differences: one call site, in a loop
  const float E = 0.0015;
  float hs[3]; float clr = 0.0;
  for (int i = uZero; i < 3; i++) {
    vec2 o = i == 1 ? vec2(E, 0.0) : i == 2 ? vec2(0.0, E) : vec2(0.0);
    float c;
    hs[i] = drops(q + o, c);
    if (i == 0) clr = c;
  }
  vec2 grad = vec2(hs[1] - hs[0], hs[2] - hs[0]) / E;      // slope of the water surface
  float wet = smoothstep(0.0, 0.004, hs[0]);                 // inside a drop
  float wiped = texture(uWipe, uv).r;
  float clear = max(max(clr, wiped), wet);

  if (uView == 1) { FragColor = vec4(vec3(hs[0] * 18.0) + vec3(0.6, 0.15, 0.1) * clr, 1.0); return; }
  if (uView == 2) { FragColor = vec4(vec3(clear), 1.0); return; }

  // A drop is a lens: its slope moves the point the city is read from
  vec2 uvS = uv - grad * uLens * vec2(1.0 / uAspect, 1.0);
  float lod = uBlur * uFog * (1.0 - clear);
  vec3 col = textureLod(uCity, uvS, lod).rgb;

  // Fogged glass also scatters the room light: a pale veil
  vec3 veil = textureLod(uCity, uv, uBlur + 1.5).rgb * 0.8 + vec3(0.025, 0.028, 0.032);
  col = mix(col, veil, 0.55 * uFog * (1.0 - clear));
  // Drop edges reflect the dark room (Fresnel) and catch a highlight
  float slope = length(grad);
  col *= 1.0 - 0.45 * wet * smoothstep(1.2, 4.0, slope);
  vec3 nrm = normalize(vec3(-grad, 1.0));
  col += wet * vec3(1.0, 0.85, 0.7) * 0.35 * pow(max(dot(nrm, normalize(vec3(-0.4, 0.5, 1.0))), 0.0), 60.0);

  col = 1.0 - exp(-col * 1.6);
  FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

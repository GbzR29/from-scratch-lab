// src/lib/tracks/glsl/presets/snow.ts
import type { PlaygroundPreset } from "@/components/lesson/glsl/ShaderPlayground";
// ── Snow ──────────────────────────────────────────────────────────────────────
export const SNOW_PRESETS: PlaygroundPreset[] = [
  {
    id: "flake", label: "one snowflake",
    note: "fold6 turns the whole plane into one 30° wedge, and the rest is written for half an arm: a segment along x and a row of branches at 60°. uGrow is the tip's radius; the branches are longer near the centre because they have been growing for longer. Try changing the 60° branch angle (the vec2 B) or the number of branches, and watch all twelve pieces change together.",
    frag: `uniform float uGrow;     // @slider 0.1 0.95 0.85
uniform float uBranches; // @slider 2 14 7 1
uniform float uWidth;    // @slider 0.005 0.04 0.014

const float PI = 3.14159265;

// The plane folded into one twelfth: turn by a multiple of 60°, then mirror
vec2 fold6(vec2 p) {
    float a = atan(p.y, p.x);
    a = mod(a + PI / 6.0, PI / 3.0) - PI / 6.0;
    a = abs(a);
    return length(p) * vec2(cos(a), sin(a));
}

float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float flake(vec2 p) {
    vec2 q = fold6(p);
    float R = uGrow;
    float d = sdSeg(q, vec2(0.0), vec2(R, 0.0)) - uWidth;          // the arm
    vec2 B = vec2(cos(PI / 3.0), sin(PI / 3.0));                    // branches at 60°
    float s = R / (uBranches + 1.0);
    for (int j = 1; j <= 14; j++) {
        if (float(j) > uBranches) break;
        float x = float(j) * s;
        float len = min(0.75 * x, 0.8 * (R - x));                   // older branches are longer, but never reach the next arm
        d = min(d, sdSeg(q, vec2(x, 0.0), vec2(x, 0.0) + B * len) - uWidth * 0.8);
    }
    d = min(d, dot(q, vec2(0.866, 0.5)) - 0.06);                    // the small hexagonal plate it started from
    return d;
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y * 1.1;
    float px = 2.2 / uResolution.y;
    float d = flake(p);
    vec3 col = mix(vec3(0.05, 0.1, 0.2), vec3(0.01, 0.03, 0.07), length(p) * 0.6);
    float inside = smoothstep(px, -px, d);
    float rim = exp(min(d, 0.0) / 0.006);
    col += inside * vec3(0.72, 0.86, 1.0) * (0.25 + 0.75 * rim);
    FragColor = vec4(col, 1.0);
}`,
  },
  {
    id: "snowfall", label: "falling snow",
    note: "Each layer is a grid of cells sliding down the screen; a cell holds at most one flake, and a hash of the cell's integer id says whether it has one, where it sits and how it sways. A near layer has big cells and moves fast, a far one small cells and moves slowly, and the code is the same for both. Try uLayers = 1, then raise uSway until flakes are cut off at the cell edges.",
    frag: `uniform float uLayers;  // @slider 1 12 8 1
uniform float uDensity; // @slider 0 1 0.5
uniform float uWind;    // @slider -1 1 0.25
uniform float uSway;    // @slider 0 0.4 0.12

vec3 hash32(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    q += dot(q, q.yxz + 33.33);
    return fract((q.xxy + q.yzz) * q.zyx);
}

// One sheet of snow at depth z: returns how much flake covers this pixel
float layer(vec2 p, float z, float seed) {
    vec2 w = p * z + vec2(-uWind, 1.0) * uTime;     // the world point on the sheet, falling at one metre a second
    vec2 cell = w / 0.35 + seed;                     // cells 35 cm wide
    vec2 id = floor(cell), f = fract(cell) - 0.5;
    vec3 h = hash32(id);
    if (h.z > uDensity) return 0.0;                  // an empty cell
    vec2 c = (h.xy - 0.5) * 0.3;                     // where the flake sits in its cell
    c.x += uSway * sin(uTime * (1.5 + 2.0 * h.y) + h.x * 6.28);
    float r = 0.05 + 0.04 * h.y;
    return smoothstep(r, r * 0.5, length(f - c));
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y * 0.7;
    vec3 col = mix(vec3(0.12, 0.11, 0.17), vec3(0.02, 0.03, 0.08), clamp(p.y + 0.5, 0.0, 1.0));
    // Far to near, so near flakes are drawn over far ones
    for (int i = 11; i >= 0; i--) {
        if (float(i) >= uLayers) continue;
        float u = float(i) / max(uLayers - 1.0, 1.0);
        float z = mix(1.2, 20.0, u * u);
        float a = layer(p, z, float(i) * 17.3);
        vec3 flake = mix(vec3(0.9, 0.93, 1.0), col, 1.0 - exp(-0.06 * z));   // far flakes fade into the night
        col = mix(col, flake, a);
    }
    FragColor = vec4(col, 1.0);
}`,
  },
];

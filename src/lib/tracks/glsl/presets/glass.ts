// src/lib/tracks/glsl/presets/glass.ts
import type { PlaygroundPreset } from "@/components/lesson/glsl/ShaderPlayground";
import { pickTexture } from "@/components/lesson/glsl/textures";

const POOL = pickTexture("mat:squareceramicglossytile-aqua-blue:albedo", "uvgrid");
// ── Glass & Fresnel ───────────────────────────────────────────────────────────
export const GLASS_PRESETS: PlaygroundPreset[] = [
  {
    id: "glass", label: "glass ball: refraction + dispersion",
    channels: [POOL],
    note: "A glass sphere in front of a textured wall. Each ray refracts twice (air → glass, glass → air) with refract(); red, green and blue use slightly different indices, which splits the colours (dispersion). Inside, the light is absorbed by Beer–Lambert: uTint is the colour left after one unit of glass, raised to the power d × uDensity. Fresnel blends in the reflection at the rim.",
    frag: `uniform float uIOR;         // @slider 1.0 2.4 1.5
uniform float uDispersion;  // @slider 0.0 0.1 0.03
uniform float uFresnel;     // @toggle 1
uniform vec3  uTint;        // @color 0.55 0.85 0.75
uniform float uDensity;     // @slider 0.0 3.0 0.4

vec3 wall(vec3 ro, vec3 rd) {                         // the backdrop: plane z = -2.5
    float t = (-2.5 - ro.z) / rd.z;
    vec2 uv = (ro + rd * t).xy * 0.22 + vec2(uTime * 0.02, 0.0);
    return texture(uTex0, uv).rgb;
}
vec3 env(vec3 d) {                                    // what the reflection shows
    vec3 c = mix(vec3(0.08, 0.09, 0.12), vec3(0.8, 0.85, 0.95), smoothstep(-0.2, 0.9, d.y));
    return c + 4.0 * pow(max(dot(d, normalize(vec3(0.6, 0.7, 0.5))), 0.0), 120.0);
}
vec2 sphere(vec3 ro, vec3 rd, float r) {             // entry and exit distances
    float b = dot(ro, rd), c = dot(ro, ro) - r * r, h = b * b - c;
    if (h < 0.0) return vec2(-1.0);
    h = sqrt(h);
    return vec2(-b - h, -b + h);
}
vec3 through(vec3 ro, vec3 rd, float ior) {
    vec3 p  = ro + rd * sphere(ro, rd, 1.0).x;
    vec3 r1 = refract(rd, normalize(p), 1.0 / ior);    // entering: eta = n_air / n_glass
    float d = sphere(p, r1, 1.0).y;                    // path length inside the glass
    vec3 q  = p + r1 * d;                              // exit point
    vec3 n2 = -normalize(q);                           // normal facing the ray, inside
    vec3 r2 = refract(r1, n2, ior);                    // leaving: eta = n_glass / n_air
    vec3 absorb = pow(max(uTint, vec3(1e-3)), vec3(d * uDensity));   // Beer–Lambert
    if (dot(r2, r2) < 1e-4) return env(reflect(r1, n2)) * 0.5 * absorb;   // total internal reflection
    return wall(q, r2) * absorb;
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
    vec3 ro = vec3(0.0, 0.0, 3.5), rd = normalize(vec3(p, -2.2));
    vec3 col = wall(ro, rd);
    float t = sphere(ro, rd, 1.0).x;
    if (t > 0.0) {
        vec3 n = normalize(ro + rd * t);
        vec3 refr = vec3(through(ro, rd, uIOR - uDispersion).r,
                         through(ro, rd, uIOR).g,
                         through(ro, rd, uIOR + uDispersion).b);
        float r0 = pow((uIOR - 1.0) / (uIOR + 1.0), 2.0);
        float F  = r0 + (1.0 - r0) * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
        col = mix(refr, env(reflect(rd, n)), uFresnel * F);
    }
    FragColor = vec4(col, 1.0);
}`,
  },
];

// ── Flat panes: patterned and stained glass ───────────────────────────────────
// Both draw the view behind the pane procedurally (a garden at dusk), so the
// "look-up" is a function call at a shifted uv instead of a texture read.
const GARDEN = `vec3 garden(vec2 uv) {                     // what is behind the pane, uv in 0..1
    vec3 col = mix(vec3(1.0, 0.62, 0.32), vec3(0.18, 0.28, 0.6), smoothstep(0.25, 1.0, uv.y));
    col += vec3(1.0, 0.85, 0.5) * smoothstep(0.09, 0.07, length((uv - vec2(0.68, 0.5)) * vec2(1.6, 1.0)));
    float hill = 0.3 + 0.05 * sin(uv.x * 7.0) + 0.03 * sin(uv.x * 19.0 + 1.0);
    if (uv.y < hill) col = vec3(0.1, 0.22, 0.14) * (0.6 + uv.y);
    if (abs(fract(uv.x * 9.0) - 0.5) < 0.05 && uv.y < 0.42) col = vec3(0.32, 0.2, 0.14);      // fence posts
    for (int i = 0; i < 14; i++) {                                                          // a string of lights
        float x = (float(i) + 0.5) / 14.0;
        vec2 c = vec2(x, 0.72 - 0.08 * sin(x * 3.1416));
        vec3 tint = 0.6 + 0.4 * cos(6.2832 * (float(i) * 0.27 + vec3(0.0, 0.33, 0.67)));
        col += tint * 0.012 / (dot(uv - c, uv - c) * 900.0 + 0.012);
    }
    return col;
}
`;

export const GLASS_PANE_PRESETS: PlaygroundPreset[] = [
  {
    id: "patterned", label: "patterned glass",
    note: "A height field h(p) is pressed into the pane: reeds, hammered dimples, a pyramid grid or glass blocks. Light bends where the surface is tilted, so the garden behind is read at uv − k·∇h, with ∇h measured by finite differences. The three channels use slightly different k, which leaves rainbow edges on the lights.",
    frag: `// uPattern: reeded, hammered, pyramids, glass blocks
uniform int   uPattern;     // @slider 0 3 0
uniform float uScale;      // @slider 4 30 12
uniform float uStrength;    // @slider 0.0 0.12 0.05
uniform float uDispersion;  // @slider 0.0 0.5 0.15

${GARDEN}
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// The relief of the glass, in units of one pattern cell
float relief(vec2 p) {
    int k = uPattern;
    if (k == 0) { float f = fract(p.x) - 0.5; return 1.2 * (0.25 - f * f); }    // reeds: rounded ridges side by side
    if (k == 1) {                                                               // hammered: a dimple around random points
        vec2 i = floor(p), f = fract(p);
        float s = 0.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
            vec2 o = vec2(x, y);
            vec2 r = o + 0.5 + 0.4 * sin(6.2832 * hash2(i + o)) - f;
            s += exp(-8.0 * dot(r, r));                                         // smooth minimum of the squared distances
        }
        return 0.6 * log(s) / 8.0;
    }
    vec2 f = abs(fract(p) - 0.5);
    if (k == 2) return -0.5 * max(f.x, f.y);                                    // pyramids: four flat facets per cell
    vec2 b = fract(p * 0.5) - 0.5;                                              // glass blocks: 2×2 cells each
    float edge = smoothstep(0.5, 0.4, max(abs(b.x), abs(b.y)));                 // a rounded border, a pillow inside
    return edge * (0.2 - 1.2 * dot(b, b) + 0.006 * sin(length(b) * 30.0));
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * uScale;
    float e = 0.01, h = relief(p);
    vec2 g = vec2(relief(p + vec2(e, 0.0)) - h, relief(p + vec2(0.0, e)) - h) / e;   // ∇h
    vec2 off = -g * uStrength;
    vec3 col = vec3(garden(uv + off * (1.0 - uDispersion)).r,
                    garden(uv + off).g,
                    garden(uv + off * (1.0 + uDispersion)).b);
    vec3 n = normalize(vec3(-g * 0.4, 1.0));                                    // the tilt, for a faint sheen
    col += 0.25 * pow(max(dot(n, normalize(vec3(-0.5, 0.6, 0.6))), 0.0), 40.0);
    FragColor = vec4(col, 1.0);
}`,
  },
  {
    id: "stained", label: "stained glass",
    note: "Voronoi cells are the pieces of glass and the borders between them are the lead. Each piece has its own colour, the light left after one unit of thickness, and its own uneven thickness d, so it transmits pow(colour, d·density): Beer–Lambert again. Hand-made glass is wavy, so the garden behind is read through a small noise offset. Raise the density and the thick pieces turn almost black first.",
    frag: `uniform float uCells;       // @slider 3 12 6
uniform float uLead;        // @slider 0.01 0.12 0.04
uniform float uDensity;     // @slider 0.2 4.0 1.0
uniform float uWaviness;    // @slider 0.0 0.05 0.012

${GARDEN}
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    float a = hash2(i).x, b = hash2(i + vec2(1, 0)).x, c = hash2(i + vec2(0, 1)).x, d = hash2(i + vec2(1, 1)).x;
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Distance to the nearest lead line (F2 − F1 of a Voronoi) and the id of the piece
vec3 pieces(vec2 p) {
    vec2 i = floor(p), f = fract(p), id = vec2(0.0);
    float d1 = 9.0, d2 = 9.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
        vec2 o = vec2(x, y), r = o + hash2(i + o) - f;
        float d = dot(r, r);
        if (d < d1) { d2 = d1; d1 = d; id = i + o; } else if (d < d2) d2 = d;
    }
    return vec3(sqrt(d2) - sqrt(d1), id);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * uCells;
    vec3 v = pieces(p);
    vec2 h = hash2(v.yz + 3.7);
    vec3 palette[6] = vec3[6](vec3(0.85, 0.12, 0.15), vec3(0.15, 0.3, 0.9), vec3(0.95, 0.7, 0.15),
                              vec3(0.15, 0.7, 0.3), vec3(0.55, 0.2, 0.75), vec3(0.92, 0.92, 0.85));
    vec3 tint = palette[int(h.x * 6.0)];
    float d = 0.7 + 0.6 * noise(p * 2.5 + h * 9.0);                              // uneven thickness inside the piece
    vec2 wave = (vec2(noise(p * 4.0), noise(p * 4.0 + 17.0)) - 0.5) * uWaviness * 2.0;
    vec3 col = 1.6 * garden(uv + wave) * pow(tint, vec3(d * uDensity));          // daylight behind, Beer–Lambert per channel
    float edge = v.x * 0.5;                                                     // ≈ distance to the border, in cells
    float lead = smoothstep(uLead, uLead * 0.7, edge);
    col = mix(col, vec3(0.06, 0.06, 0.07) + 0.15 * smoothstep(uLead * 0.6, 0.0, edge), lead);   // a lit ridge along the lead
    FragColor = vec4(col, 1.0);
}`,
  },
];

// Playground presets for the Debugging Shaders chapter.
import type { PlaygroundPreset } from "@/components/lesson/glsl/ShaderPlayground";

// A lit ball drawn in 2D: the normal of a unit sphere comes straight from the pixel's position
const BALL = `    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / (0.42 * uResolution.y);   // the ball has radius 1
    float r2 = dot(p, p);`;

export const DEBUG_PRESETS: PlaygroundPreset[] = [
  {
    id: "views", label: "debug views, split screen",
    note: "uView picks what the left side shows; the right side is always the real image. Drag across the canvas to move the split. 1: the normal as a colour. 2: the ball's texture coordinates as repeating bands. 3: N·L with its sign, negative in red. 4: a range check on the final colour: blue below 0, red above 1, magenta for NaN, grey where all is well.",
    frag: `uniform int uView;   // @slider 0 4 1

void main() {
${BALL}
    vec3 L = normalize(vec3(cos(uTime * 0.6), 0.6, sin(uTime * 0.6) + 0.5));
    vec3 N = vec3(0.0, 0.0, 1.0);
    vec3 col = vec3(0.07, 0.08, 0.11);                     // background
    vec2 uv = p * 3.0;
    float ndl = 0.0;
    if (r2 < 1.0) {
        N = vec3(p, sqrt(1.0 - r2));                       // unit sphere: the normal is the position
        ndl = dot(N, L);
        uv = vec2(atan(N.x, N.z), asin(N.y)) * 3.0;        // longitude, latitude
        float checker = mod(floor(uv.x) + floor(uv.y), 2.0);
        vec3 albedo = mix(vec3(0.85, 0.35, 0.2), vec3(0.95, 0.8, 0.55), checker);
        vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
        col = albedo * (0.12 + max(ndl, 0.0)) + 0.8 * pow(max(dot(N, H), 0.0), 40.0);
    }

    vec3 view = col;
    if (uView == 1) view = N * 0.5 + 0.5;                                  // a direction: −1..1 → 0..1
    if (uView == 2) view = vec3(fract(uv), 0.0);                           // coordinates as bands
    if (uView == 3) view = ndl < 0.0 ? vec3(-ndl, 0.0, 0.0) : vec3(ndl);   // a sign: negative in red
    if (uView == 4) {                                                      // a range check
        bool nan = any(isnan(col));
        bool low = any(lessThan(col, vec3(0.0)));
        bool high = any(greaterThan(col, vec3(1.0)));
        view = nan ? vec3(1.0, 0.0, 1.0) : low ? vec3(0.1, 0.3, 1.0) : high ? vec3(1.0, 0.15, 0.1) : vec3(0.35);
    }

    float split = uMouse.x > 0.0 ? uMouse.x : 0.5 * uResolution.x;
    bool left = uView > 0 && gl_FragCoord.x < split;
    vec3 outCol = left ? view : pow(col, vec3(1.0 / 2.2));   // debug values raw, the image gamma-encoded
    if (uView > 0 && abs(gl_FragCoord.x - split) < 1.0) outCol = vec3(1.0);   // the split line
    FragColor = vec4(outCol, 1.0);
}`,
  },
  {
    id: "bug", label: "find the bug: a black crescent",
    note: "The ambient term 0.12 should keep the whole ball dimly lit, yet a pure black crescent sweeps across its dark side. Turn on uFind: it paints every NaN pixel magenta and dims the rest. Which line makes NaN only there? (The answer is in the text below the playground.)",
    frag: `uniform float uShine;   // @slider 4.0 64.0 24.0
uniform float uFind;    // @toggle 0

void main() {
${BALL}
    vec3 col = vec3(0.07, 0.08, 0.11);
    if (r2 < 1.0) {
        vec3 N = vec3(p, sqrt(1.0 - r2));
        vec3 L = normalize(vec3(1.2 * sin(uTime * 0.7), 0.4, -0.3));   // swings side to side, a little behind
        vec3 V = vec3(0.0, 0.0, 1.0);
        vec3 H = normalize(L + V);                     // half vector (Blinn-Phong)
        float diff = max(dot(N, L), 0.0);
        float spec = pow(dot(N, H), uShine);
        col = vec3(0.85, 0.35, 0.2) * (0.12 + diff) + 0.6 * spec;
    }
    if (uFind > 0.5) {
        bool bad = any(isnan(col));
        col = bad ? vec3(1.0, 0.0, 1.0) : col * 0.35;  // magenta where NaN, the rest dimmed
    }
    FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`,
  },
];

// Playground presets for the Derivatives & Anti-aliasing chapter.
import type { PlaygroundPreset } from "@/components/lesson/glsl/ShaderPlayground";
import { pickTexture } from "@/components/lesson/glsl/textures";

const CHECKER = pickTexture("checker", "uvgrid");

export const DERIV_PRESETS: PlaygroundPreset[] = [
  {
    id: "flat-normals", label: "normals from derivatives",
    mode: "mesh", mesh: "sphere",
    note: "The vertex shader pushes the sphere into bumps, but aNormal still holds the sphere's normals, so the stored normals light it as if it were round. cross(dFdx(vWorld), dFdy(vWorld)) is built from the real, displaced surface: always right, one normal per triangle.",
    vert: `uniform float uBumps;   // @slider 0.0 0.3 0.18

void main() {
    // Displace along the normal: 0 at the sphere, up to uBumps at the peaks
    float b = sin(aPos.x * 6.0) * sin(aPos.y * 6.0 + uTime) * sin(aPos.z * 6.0);
    vec3 p = aPos + aNormal * uBumps * b;

    vec4 world = uModel * vec4(p, 1.0);
    vWorld   = world.xyz;
    vNormal  = mat3(uModel) * aNormal;      // the sphere's normal: no longer true
    vUV      = aUV;
    vTangent = mat3(uModel) * aTangent;
    gl_Position = uProjection * uView * world;
}`,
    frag: `uniform float uFlat;    // @toggle 1

void main() {
    vec3 N = normalize(vNormal);
    if (uFlat > 0.5) {
        // Two edges of the surface inside this pixel's quad: one along the
        // screen's x, one along its y. Their cross product is perpendicular
        // to the surface and, with y up, points towards the camera.
        N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    }
    vec3 V = normalize(uCamPos - vWorld), H = normalize(uLightDir + V);
    float diff = max(dot(N, uLightDir), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 48.0);
    vec3 col = vec3(0.35, 0.6, 0.9) * (0.12 + 0.88 * diff) + 0.4 * spec;
    FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`,
  },
  {
    id: "seam", label: "the atan seam",
    channels: [CHECKER],
    note: "Polar texture coordinates: u = angle, v = distance. On the left, u jumps back by a whole turn (4 repeats of the texture), the derivatives there are huge, texture() picks the smallest mip level and draws a thin dotted line of grey pixels. The fix keeps the coordinate but gives textureGrad the derivatives of a copy whose jump is on the other side.",
    frag: `uniform float uFix;     // @toggle 0
uniform float uZoom;    // @slider 0.5 3.0 1.0

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y / uZoom;
    // The angle of p turned by 0.5 rad: the jump becomes a slanted line on the left.
    // (A horizontal jump can fall exactly between two rows of quads and hide.)
    vec2 q = vec2(p.x * 0.878 - p.y * 0.479, p.x * 0.479 + p.y * 0.878);
    float a = atan(q.y, q.x) / 6.2831853;         // -0.5 .. 0.5
    // 4 repeats around the circle; +0.3 puts the jump in the middle of a square
    vec2 uv = vec2(a * 4.0 + 0.3, length(p) * 2.0 - uTime * 0.1);

    vec2 dx = dFdx(uv), dy = dFdy(uv);
    if (uFix > 0.5) {
        // The same angle wrapped to 0 .. 1: its jump is on the right instead
        float u2 = fract(a) * 4.0;
        float dx2 = dFdx(u2), dy2 = dFdy(u2);
        // Take whichever copy did not jump inside this quad
        if (abs(dx2) + abs(dy2) < abs(dx.x) + abs(dy.x)) { dx.x = dx2; dy.x = dy2; }
    }
    vec3 col = textureGrad(uTex0, uv, dx, dy).rgb;
    FragColor = vec4(col, 1.0);
}`,
  },
];

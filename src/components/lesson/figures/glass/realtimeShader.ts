// ── Real-time glass shaders ───────────────────────────────────────────────────
// How a rasteriser draws glass. It cannot follow the refracted ray through the
// scene, so it looks the answer up somewhere:
//   cube map      T = refract(I, N, η) is a direction; read the sky cube map there.
//   screen space  the scene behind was drawn into a texture first; walk a fixed
//                 distance d along T, project that point to the screen, read there.
//   frosted       the same, from a blurred mip level, with a few jittered taps.
// Only the front surface is refracted (back faces are culled), which is what most
// games do. ROOM_FS draws the world around the glass in one fullscreen pass.

export const ROOM_FS = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 FragColor;

uniform samplerCube uSky;
uniform vec3  uCamPos, uCamF, uCamR, uCamU;
uniform float uTanHalf, uAspect;

const vec3  SUN   = vec3(0.48, 0.62, 0.62);
const float FLOOR = -0.9;
const float RING  = 5.5;                                 // pillars stand on a circle this far out

vec3 pillarColor(float i) {
  vec3 c[8] = vec3[8](vec3(0.95, 0.3, 0.2), vec3(0.98, 0.7, 0.15), vec3(0.3, 0.8, 0.35), vec3(0.2, 0.6, 0.95),
                      vec3(0.6, 0.35, 0.9), vec3(0.95, 0.4, 0.7), vec3(0.15, 0.8, 0.8), vec3(0.95, 0.95, 0.9));
  return c[int(i) & 7];
}

void main() {
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 rd = normalize(uCamF + uCamR * ndc.x * uTanHalf * uAspect + uCamU * ndc.y * uTanHalf);
  vec3 ro = uCamPos;
  vec3 col = texture(uSky, rd).rgb + 3.0 * pow(max(dot(rd, SUN), 0.0), 900.0);
  float tBest = 1e9;

  // Floor: tiles that fade into the haze
  if (rd.y < -0.002) {
    float t = (FLOOR - ro.y) / rd.y;
    vec3 p = ro + rd * t;
    vec2 c = floor(p.xz * 1.2);
    float tile = (mod(c.x + c.y, 2.0) - 0.5) * exp(-t * 0.2);
    vec3 f = vec3(0.7, 0.68, 0.64) + 0.22 * tile;
    f *= 1.0 - 0.45 * exp(-dot(p.xz, p.xz) * 2.0);       // soft shadow under the glass
    vec3 haze = texture(uSky, normalize(vec3(rd.x, 0.03, rd.z))).rgb;
    col = mix(haze, f, exp(-t * 0.05));
    tBest = t;
  }

  // Eight striped pillars on a ring: something with edges to see bent
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398 + 0.3;
    vec2 c = vec2(cos(a), sin(a)) * RING;
    vec2 oc = ro.xz - c, d = rd.xz;
    float A = dot(d, d), B = dot(oc, d), C = dot(oc, oc) - 0.36;
    float h = B * B - A * C;
    if (h < 0.0) continue;
    float t = (-B - sqrt(h)) / A;
    vec3 p = ro + rd * t;
    if (t < 0.0 || t > tBest || p.y > 1.8 + 0.4 * sin(a * 3.0)) continue;
    vec3 n = normalize(vec3(p.x - c.x, 0.0, p.z - c.y));
    float stripe = step(0.5, fract(p.y * 2.5));
    vec3 base = pillarColor(float(i)) * (0.75 + 0.25 * stripe);
    col = base * (0.35 + 0.75 * max(dot(n, SUN), 0.0));
    tBest = t;
  }
  FragColor = vec4(col, 1.0);
}`;

export const GLASS_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
uniform mat4 uModel, uViewProj;
uniform mat3 uNormalMat;       // inverse-transpose of the model's 3×3: the lens is squashed
out vec3 vPos, vN;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vPos = w.xyz;
  vN = uNormalMat * aNormal;
  gl_Position = uViewProj * w;
}`;

export const GLASS_FS = `#version 300 es
precision highp float;
in vec3 vPos, vN;
out vec4 FragColor;

uniform samplerCube uSky;
uniform sampler2D uScene;      // the room, drawn before the glass (screen-space modes)
uniform mat4  uViewProj;
uniform vec3  uCamPos;
uniform int   uMode;           // 0 cube map, 1 screen space, 2 frosted
uniform int   uShow;           // 0 glass, 1 where each pixel reads from
uniform float uIor, uSpread, uDepth, uRough, uFresnel;

const vec3 SUN = vec3(0.48, 0.62, 0.62);

vec3 sky(vec3 d) { return texture(uSky, d).rgb + 3.0 * pow(max(dot(d, SUN), 0.0), 900.0); }

// Screen position of a world point, 0..1
vec2 toScreen(vec3 p) {
  vec4 c = uViewProj * vec4(p, 1.0);
  return c.xy / c.w * 0.5 + 0.5;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 screenRead(vec2 uv) {
  if (uMode == 1) return textureLod(uScene, uv, 0.0).rgb;
  // Frosted: a blurrier mip level, and six taps on a ring turned at random per pixel
  float lod = uRough * 5.0;
  float r = uRough * 0.035, a0 = hash(gl_FragCoord.xy) * 6.2832;
  vec3 s = textureLod(uScene, uv, lod).rgb;
  for (int i = 0; i < 6; i++) {
    float a = a0 + float(i) * 1.0472;
    s += textureLod(uScene, uv + r * vec2(cos(a), sin(a)), lod).rgb;
  }
  return s / 7.0;
}

void main() {
  vec3 N = normalize(vN);
  vec3 I = normalize(vPos - uCamPos);
  vec3 refr;
  vec2 uvG = vec2(0.0);
  for (int c = 0; c < 3; c++) {
    float n = uIor + (float(c) - 1.0) * uSpread;         // red the lowest index, blue the highest
    vec3 T = refract(I, N, 1.0 / n);                     // entering: never total internal reflection
    vec3 v;
    if (uMode == 0) v = sky(T);
    else {
      vec2 uv = clamp(toScreen(vPos + T * uDepth), 0.001, 0.999);   // walk d along T, look at the screen there
      if (c == 1) uvG = uv;
      v = screenRead(uv);
    }
    refr[c] = v[c];
  }
  float cosI = max(dot(-I, N), 0.0);
  float r0 = (uIor - 1.0) / (uIor + 1.0); r0 *= r0;
  float F = (r0 + (1.0 - r0) * pow(1.0 - cosI, 5.0)) * uFresnel;
  vec3 col = mix(refr * vec3(0.96, 0.99, 0.98), sky(reflect(I, N)), F);
  if (uShow == 1) {
    // Cube map: the direction T it reads, as a colour (x red, y green, z blue).
    // Screen space: the offset from this pixel to the one it reads (red = right, green = up).
    col = uMode == 0 ? 0.5 + 0.5 * refract(I, N, 1.0 / uIor) : vec3(0.5 + (uvG - toScreen(vPos)) * 4.0, 0.5);
  }
  FragColor = vec4(col, 1.0);
}`;

// ── Blackbody light ───────────────────────────────────────────────────────────
// Planck's law and what it looks like: the colour of a hot body is its Planck
// spectrum seen through the CIE colour-matching curves (prismOptics.spectrum,
// whose weights add up to white for a flat spectrum). The shaders get a small
// table: for each temperature, the colour (brightest channel = 1) and the
// visible brightness relative to 2000 K.

import { spectrum } from "../glass/prismOptics";

export const C2 = 1.4388e-2;            // hc/k, m·K
export const WIEN = 2.8978e-3;          // m·K

/** Planck's spectral radiance, up to a constant factor: λ in nm, T in kelvin. */
export function planck(lambdaNm: number, T: number) {
  const l = lambdaNm * 1e-9;
  return 1 / (l ** 5 * (Math.exp(C2 / (l * T)) - 1));
}

const SPEC = spectrum(32);

/** Linear RGB of a blackbody at T, scaled so its brightest channel is 1, and its visible brightness (unscaled). */
export function blackbody(T: number): { rgb: [number, number, number]; power: number } {
  const rgb: [number, number, number] = [0, 0, 0];
  SPEC.lambda.forEach((l, k) => { const b = planck(l, T); for (let c = 0; c < 3; c++) rgb[c] += SPEC.rgb[k][c] * b; });
  const m = Math.max(...rgb, 1e-30);
  return { rgb: rgb.map(v => v / m) as [number, number, number], power: rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 };
}

/** sRGB hex of a blackbody's colour (for swatches). */
export function blackbodyHex(T: number) {
  const { rgb } = blackbody(T);
  const s = (v: number) => Math.round(255 * Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  return `rgb(${s(rgb[0])}, ${s(rgb[1])}, ${s(rgb[2])})`;
}

export const LUT_SIZE = 48, LUT_T0 = 700, LUT_T1 = 3300;

/** For the shaders: vec4(colour, brightness relative to 2000 K) for LUT_SIZE temperatures from LUT_T0 to LUT_T1. */
export function blackbodyLUT(): Float32Array {
  const ref = blackbody(2000).power, out = new Float32Array(LUT_SIZE * 4);
  for (let i = 0; i < LUT_SIZE; i++) {
    const T = LUT_T0 + ((LUT_T1 - LUT_T0) * i) / (LUT_SIZE - 1);
    const b = blackbody(T);
    out.set([...b.rgb, b.power / ref], i * 4);
  }
  return out;
}

/** GLSL that reads the table: blackbody(T) returns colour × relative brightness. */
export const BLACKBODY_GLSL = `
uniform vec4 uBB[${LUT_SIZE}];
vec3 blackbody(float T) {
  float f = clamp((T - ${LUT_T0.toFixed(1)}) / ${(LUT_T1 - LUT_T0).toFixed(1)}, 0.0, 1.0) * ${(LUT_SIZE - 1).toFixed(1)};
  int i = int(floor(f));
  vec4 a = uBB[i], b = uBB[min(i + 1, ${LUT_SIZE - 1})];
  vec4 c = mix(a, b, f - float(i));
  return T < ${LUT_T0.toFixed(1)} ? vec3(0.0) : c.rgb * c.a;
}`;

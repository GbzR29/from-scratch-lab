// ── Colours of light ──────────────────────────────────────────────────────────
// The colour the eye sees for one wavelength, or for a whole spectrum, from
// the CIE 1931 colour-matching functions (the analytic fit of Wyman, Sloan &
// Shirley, 2013), converted to sRGB. Shared by the optics figures.

const lobe = (l: number, mu: number, s1: number, s2: number) => {
  const s = l < mu ? s1 : s2;
  return Math.exp(-0.5 * ((l - mu) / s) ** 2);
};

/** CIE 1931 x̄, ȳ, z̄ at wavelength l (nm). */
export function cie(l: number): [number, number, number] {
  return [
    1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2),
    0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1),
    1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8),
  ];
}

/** XYZ → linear sRGB. */
function toLinearRgb([X, Y, Z]: [number, number, number]): [number, number, number] {
  return [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.204 * Y + 1.057 * Z,
  ];
}

const gamma = (c: number) => {
  const v = Math.max(0, Math.min(1, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
};

const STEP = 5, L0 = 380, L1 = 730;
const WHITE_Y = (() => { let y = 0; for (let l = L0; l <= L1; l += STEP) y += cie(l)[1]; return y; })();

/** sRGB (0–255) of a spectrum: power(l) = 1 everywhere is white. */
export function spectrumRgb(power: (l: number) => number): [number, number, number] {
  let X = 0, Y = 0, Z = 0;
  for (let l = L0; l <= L1; l += STEP) {
    const p = power(l), [x, y, z] = cie(l);
    X += p * x; Y += p * y; Z += p * z;
  }
  const lin = toLinearRgb([X / WHITE_Y, Y / WHITE_Y, Z / WHITE_Y]);
  return lin.map(c => Math.round(255 * gamma(c))) as [number, number, number];
}

/** The display colour of one wavelength (nm): its hue at full brightness. */
export function wavelengthRgb(l: number): [number, number, number] {
  const lin = toLinearRgb(cie(l)).map(c => Math.max(0, c));
  const m = Math.max(...lin, 1e-6);
  // a little white keeps the hues near the ends of the spectrum visible
  return lin.map(c => Math.round(255 * gamma(0.03 + 0.97 * c / m))) as [number, number, number];
}

export const rgbCss = ([r, g, b]: [number, number, number]) => `rgb(${r},${g},${b})`;
export const wavelengthCss = (l: number) => rgbCss(wavelengthRgb(l));

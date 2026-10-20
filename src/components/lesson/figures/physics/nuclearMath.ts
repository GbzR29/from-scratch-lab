// ── Nuclear data shared by the nuclear-physics figures ────────────────────────
// The semi-empirical mass formula (Weizsäcker 1935, coefficients of a common
// least-squares fit, in MeV) and element symbols up to Z = 100.
//   B(A, Z) = aV·A − aS·A^(2/3) − aC·Z(Z − 1)/A^(1/3) − aA·(A − 2Z)²/A + δ
//   δ = +aP/√A (even Z, even N), −aP/√A (odd, odd), 0 (odd A)

export const SEMF = { aV: 15.75, aS: 17.8, aC: 0.711, aA: 23.7, aP: 11.18 };

export type Terms = { surface: boolean; coulomb: boolean; asym: boolean; pairing: boolean };
export const ALL_TERMS: Terms = { surface: true, coulomb: true, asym: true, pairing: true };

/** Each term of the binding energy of (A, Z), in MeV; switched-off terms are 0. */
export function semfTerms(A: number, Z: number, on: Terms = ALL_TERMS) {
  const N = A - Z;
  const vol = SEMF.aV * A;
  const surf = on.surface ? -SEMF.aS * A ** (2 / 3) : 0;
  const coul = on.coulomb ? (-SEMF.aC * Z * (Z - 1)) / A ** (1 / 3) : 0;
  const asym = on.asym ? (-SEMF.aA * (A - 2 * Z) ** 2) / A : 0;
  const pair = !on.pairing || A % 2 === 1 ? 0 : (Z % 2 === 0 && N % 2 === 0 ? 1 : -1) * SEMF.aP / Math.sqrt(A);
  return { vol, surf, coul, asym, pair, total: vol + surf + coul + asym + pair };
}

/** The proton number that binds A nucleons most tightly (with pairing, so even A picks even Z, as for Fe-56). */
export function bestZ(A: number, on: Terms = ALL_TERMS) {
  let best = 1, bestB = -Infinity;
  for (let Z = 1; Z <= Math.max(1, A - 1); Z++) {
    const b = semfTerms(A, Z, on).total;
    if (b > bestB) { bestB = b; best = Z; }
  }
  return best;
}

export const ELEMENTS = [
  "n", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
];

export const nuclide = (A: number, Z: number) => `${ELEMENTS[Z] ?? `Z${Z}`}-${A}`;

/** Measured binding energy per nucleon (AME2020, MeV) of some nuclei: [A, Z, B/A]. */
export const MEASURED: [number, number, number][] = [
  [2, 1, 1.112], [3, 1, 2.827], [3, 2, 2.573], [4, 2, 7.074], [6, 3, 5.332], [7, 3, 5.606], [9, 4, 6.463],
  [12, 6, 7.680], [14, 7, 7.476], [16, 8, 7.976], [20, 10, 8.032], [24, 12, 8.261], [28, 14, 8.448],
  [32, 16, 8.493], [40, 20, 8.551], [56, 26, 8.790], [62, 28, 8.795], [84, 36, 8.717], [120, 50, 8.505],
  [138, 56, 8.393], [208, 82, 7.868], [235, 92, 7.591], [238, 92, 7.570],
];

// src/components/lesson/figures/chemistry/names.ts
// Translated element and category names for the Chemistry widgets. English is
// the fallback in elements.ts; other languages live in the widget i18n files
// under keys chEl_<symbol> and chCat_<category>.

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import type { Category, Element } from "./elements";

export const elementName = (t: TrackTranslations | undefined, e: Element) => tx(t, `chEl_${e.sym}`, e.name);

const CATEGORY: Record<Category, string> = {
  am: "alkali metal", ae: "alkaline earth metal", tm: "transition metal", pt: "post-transition metal",
  ln: "lanthanide", an: "actinide", md: "metalloid", nm: "reactive nonmetal", hl: "halogen", ng: "noble gas",
};
export const CATEGORIES = Object.keys(CATEGORY) as Category[];
export const categoryName = (t: TrackTranslations | undefined, c: Category) => tx(t, `chCat_${c}`, CATEGORY[c]);

/** Fixed data colours for the categories (the same in both themes). */
export const CATEGORY_COLOR: Record<Category, string> = {
  am: "#ef4444", ae: "#f97316", tm: "#eab308", pt: "#84cc16", ln: "#06b6d4",
  an: "#94a3b8", md: "#10b981", nm: "#3b82f6", hl: "#ec4899", ng: "#a855f7",
};

/** CPK-style atom colours used in particle drawings. */
export const ATOM_COLOR: Record<string, string> = {
  H: "#f1f5f9", C: "#475569", N: "#3b82f6", O: "#ef4444", Cl: "#22c55e", He: "#06b6d4",
  Ne: "#f97316", Ar: "#a855f7", Na: "#8b5cf6", S: "#eab308", Fe: "#c2410c",
  F: "#84cc16", B: "#fda4af", P: "#fb923c", Br: "#b91c1c", I: "#7e22ce", Xe: "#0891b2", Be: "#a3a3a3",
};

/** Superscript and subscript digits for formulas and nuclide symbols. */
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹", SUB = "₀₁₂₃₄₅₆₇₈₉";
export const sup = (s: string | number) => String(s).replace(/\d/g, d => SUP[+d]).replace("+", "⁺").replace("-", "⁻");
export const sub = (s: string | number) => String(s).replace(/\d/g, d => SUB[+d]);
/** 1.39e6 → "1.39 × 10⁶" (plain digits below 10 000). */
export function sci(v: number, digits = 3): string {
  if (v === 0) return "0";
  const ex = Math.floor(Math.log10(Math.abs(v)));
  if (ex >= -2 && ex < 4) return String(+v.toPrecision(digits));
  return `${+(v / 10 ** ex).toPrecision(digits)} × 10${sup(String(ex)).replace("-", "⁻")}`;
}

/** "C6H12O6" → "C₆H₁₂O₆". */
export const formula = (f: string) => f.replace(/\d+/g, d => sub(d));

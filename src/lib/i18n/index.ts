// src/lib/i18n/index.ts
import { navTranslations } from "./nav/navTranslations";
import { learningTranslations } from "./learning/learningTranslantions";
import { openglTranslations } from "./opengl/openglTranslations";
import { glslTranslations } from "./glsl/glslTranslations";
import { homeTranslations } from "./home/homeTranslations";
import { trackTranslations } from "./track/trackTranslations";

export const translations = {
  en: {
    ...navTranslations.en,
    ...learningTranslations.en,
    ...openglTranslations.en,
    ...glslTranslations.en,
    ...homeTranslations.en,
    ...trackTranslations.en,
  },
  pt: {
    ...navTranslations.pt,
    ...learningTranslations.pt,
    ...openglTranslations.pt,
    ...glslTranslations.pt,
    ...homeTranslations.pt,
    ...trackTranslations.pt,
  },
  zh: {
    ...navTranslations.zh,
    ...learningTranslations.zh,
    ...openglTranslations.zh,
    ...glslTranslations.zh,
    ...homeTranslations.zh,
    ...trackTranslations.zh,
  },
  es: {
    ...navTranslations.es,
    ...learningTranslations.es,
    ...openglTranslations.es,
    ...glslTranslations.es,
    ...homeTranslations.es,
    ...trackTranslations.es,
  }
};

export type Language = keyof typeof translations;

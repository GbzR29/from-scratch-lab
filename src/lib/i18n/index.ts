// src/lib/i18n/index.ts
import { navTranslations } from "./nav/navTranslations";
import { learningTranslations } from "./learning/learningTranslantions";
import { openglTranslations } from "./opengl/openglTranslations";
import { glslTranslations } from "./glsl/glslTranslations";

export const translations = {
  en: {
    ...navTranslations.en,
    ...learningTranslations.en,
    ...openglTranslations.en,
    ...glslTranslations.en,
  },
  pt: {
    ...navTranslations.pt,
    ...learningTranslations.pt,
    ...openglTranslations.pt,
    ...glslTranslations.pt,
  },
  zh: {
    ...navTranslations.zh,
    ...learningTranslations.zh,
    ...openglTranslations.zh,
    ...glslTranslations.zh,
  },
  es: {
    ...navTranslations.es,
    ...learningTranslations.es,
    ...openglTranslations.es,
    ...glslTranslations.es,
  }
};

export type Language = keyof typeof translations;

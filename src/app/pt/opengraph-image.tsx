// app/pt/opengraph-image.tsx — the home page in Portuguese
// Link-preview image (see src/lib/og/card.tsx).

import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/card";
import { homeImage } from "@/lib/og/cards";

export const alt = "From Scratch Lab: cursos interativos e gratuitos";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return homeImage("pt");
}

// app/opengraph-image.tsx — the home page (and pages without their own)
// Link-preview image (see src/lib/og/card.tsx).

import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/card";
import { homeImage } from "@/lib/og/cards";

export const alt = "From Scratch Lab: free interactive courses";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return homeImage("en");
}

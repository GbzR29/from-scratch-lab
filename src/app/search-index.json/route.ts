// app/search-index.json/route.ts → /search-index.json
// The site search index (src/lib/search), rendered once at build time.

import { buildSearchIndex } from "@/lib/search";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}

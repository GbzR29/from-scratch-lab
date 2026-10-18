// app/pt/page.tsx
// /pt: the home page in Portuguese (see app/page.tsx).

import type { Metadata } from "next";
import TracksHome from "@/components/home/TracksHome";
import { homeMetadata } from "@/lib/tracks/seo";

export const metadata: Metadata = homeMetadata("pt");

export default TracksHome;

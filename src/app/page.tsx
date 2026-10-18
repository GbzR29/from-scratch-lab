// app/page.tsx
// The home page: the track list (components/home/TracksHome). The /pt copy
// reuses it; LanguageProvider reads the /pt prefix and renders it in PT.

import type { Metadata } from "next";
import TracksHome from "@/components/home/TracksHome";
import { homeMetadata } from "@/lib/tracks/seo";

export const metadata: Metadata = homeMetadata("en");

export default TracksHome;

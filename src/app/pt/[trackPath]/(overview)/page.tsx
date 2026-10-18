// app/pt/[trackPath]/(overview)/page.tsx
// /pt/<track> (see app/[trackPath]/(overview)/page.tsx).

import { TrackRoute, trackPageMetadata, type TrackProps } from "@/lib/tracks/lessonRoutes";

export const generateMetadata = (props: TrackProps) => trackPageMetadata(props, "pt");

export default function PtTrackPage(props: TrackProps) {
  return TrackRoute(props, "pt");
}

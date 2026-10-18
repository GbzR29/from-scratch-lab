// app/[trackPath]/(lesson)/page.tsx
// /<track>: the track's own URL (shows its first chapter). Old lesson
// links, /<track>?chapter=<id>, are sent to /<track>/<id>.
// Shared with /pt/<track> (src/lib/tracks/lessonRoutes.tsx).

import { TrackRoute, trackPageMetadata, type TrackProps } from "@/lib/tracks/lessonRoutes";

export const generateMetadata = (props: TrackProps) => trackPageMetadata(props, "en");

export default function TrackPage(props: TrackProps) {
  return TrackRoute(props, "en");
}

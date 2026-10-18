// app/[trackPath]/(lesson)/layout.tsx
// The lesson reader stays mounted here while the URL moves between a track's
// chapters; the pages below only give each URL its metadata.

import type { ReactNode } from "react";
import LessonView from "./LessonView";
import { requireTrack } from "@/lib/tracks/lessonRoutes";

type Props = { children: ReactNode; params: Promise<{ trackPath: string }> };

export default async function LessonLayout({ children, params }: Props) {
  await requireTrack(params);
  return (
    <>
      <LessonView />
      {children}
    </>
  );
}

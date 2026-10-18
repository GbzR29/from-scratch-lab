// app/pt/[trackPath]/(lesson)/layout.tsx
// The Portuguese lesson URLs use the same reader as the English ones (see there).

import type { ReactNode } from "react";
import LessonView from "@/app/[trackPath]/(lesson)/LessonView";
import { requireTrack } from "@/lib/tracks/lessonRoutes";

type Props = { children: ReactNode; params: Promise<{ trackPath: string }> };

export default async function PtLessonLayout({ children, params }: Props) {
  await requireTrack(params);
  return (
    <>
      <LessonView />
      {children}
    </>
  );
}

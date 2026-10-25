// PT text for this track, loaded on demand by src/lib/i18n/lessons.ts.

import type { LessonText } from "@/lib/i18n/lessons";
import track from "./_track";
import matterMeasurement from "./matter-measurement";
import atomsIsotopes from "./atoms-isotopes";
import theMole from "./the-mole";
import periodicTrends from "./periodic-trends";

const bundle: LessonText = {
  strings: { ...matterMeasurement, ...atomsIsotopes, ...theMole, ...periodicTrends },
  titles: track.titles,
  sections: track.sections,
};

export default bundle;

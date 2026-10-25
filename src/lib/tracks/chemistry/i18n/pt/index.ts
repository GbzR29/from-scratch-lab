// PT text for this track, loaded on demand by src/lib/i18n/lessons.ts.

import type { LessonText } from "@/lib/i18n/lessons";
import track from "./_track";
import matterMeasurement from "./matter-measurement";
import atomsIsotopes from "./atoms-isotopes";
import theMole from "./the-mole";
import periodicTrends from "./periodic-trends";
import valenceIons from "./valence-ions";
import ionicBonding from "./ionic-bonding";
import covalentLewis from "./covalent-lewis";
import molecularShape from "./molecular-shape";

const bundle: LessonText = {
  strings: {
    ...matterMeasurement, ...atomsIsotopes, ...theMole, ...periodicTrends,
    ...valenceIons, ...ionicBonding, ...covalentLewis, ...molecularShape,
  },
  titles: track.titles,
  sections: track.sections,
};

export default bundle;

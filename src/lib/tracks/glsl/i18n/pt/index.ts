// PT text for this track, loaded on demand by src/lib/i18n/lessons.ts.

import type { LessonText } from "@/lib/i18n/lessons";
import track from "./_track";
import blackhole from "./blackhole";
import builtinVars from "./builtin-vars";
import builtins from "./builtins";
import effects from "./effects";
import fire from "./fire";
import fragcoord from "./fragcoord";
import gems from "./gems";
import glass from "./glass";
import noise from "./noise";
import ocean from "./ocean";
import playground from "./playground";
import pool from "./pool";
import rain from "./rain";
import raymarching from "./raymarching";
import river from "./river";
import raytracing from "./raytracing";
import sdf from "./sdf";
import shaderClass from "./shader-class";
import shapes from "./shapes";
import snow from "./snow";
import types from "./types";
import underwater from "./underwater";

const bundle: LessonText = {
  strings: { ...blackhole, ...builtinVars, ...builtins, ...effects, ...fire, ...fragcoord, ...gems, ...glass, ...noise, ...ocean, ...playground, ...pool, ...rain, ...raymarching, ...river, ...raytracing, ...sdf, ...shaderClass, ...shapes, ...snow, ...types, ...underwater },
  titles: track.titles,
  sections: track.sections,
};

export default bundle;

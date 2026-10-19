// PT text for this track, loaded on demand by src/lib/i18n/lessons.ts.

import type { LessonText } from "@/lib/i18n/lessons";
import track from "./_track";
import unitsMeasurement from "./units-measurement";
import kinematics1d from "./kinematics-1d";
import kinematics2d from "./kinematics-2d";
import relativeMotion from "./relative-motion";
import newtonsLaws from "./newtons-laws";
import forces from "./forces";
import circularMotion from "./circular-motion";
import workEnergy from "./work-energy";
import momentumCollisions from "./momentum-collisions";
import rotation from "./rotation";
import angularMomentum from "./angular-momentum";
import gravityOrbits from "./gravity-orbits";
import simpleHarmonic from "./simple-harmonic";
import dampingResonance from "./damping-resonance";
import waves from "./waves";
import sound from "./sound";
import fluidStatics from "./fluid-statics";
import fluidDynamics from "./fluid-dynamics";
import temperatureHeat from "./temperature-heat";
import thermodynamics from "./thermodynamics";
import electricChargeField from "./electric-charge-field";
import electricPotential from "./electric-potential";
import circuits from "./circuits";
import magnetism from "./magnetism";
import induction from "./induction";
import maxwellEmWaves from "./maxwell-em-waves";
import geometricOptics from "./geometric-optics";
import waveOptics from "./wave-optics";
import lagrangian from "./lagrangian";
import hamiltonianPhaseSpace from "./hamiltonian-phase-space";
import chaos from "./chaos";
import statisticalMechanics from "./statistical-mechanics";

const bundle: LessonText = {
  strings: { ...unitsMeasurement, ...kinematics1d, ...kinematics2d, ...relativeMotion, ...newtonsLaws, ...forces, ...circularMotion, ...workEnergy, ...momentumCollisions, ...rotation, ...angularMomentum, ...gravityOrbits, ...simpleHarmonic, ...dampingResonance, ...waves, ...sound, ...fluidStatics, ...fluidDynamics, ...temperatureHeat, ...thermodynamics, ...electricChargeField, ...electricPotential, ...circuits, ...magnetism, ...induction, ...maxwellEmWaves, ...geometricOptics, ...waveOptics, ...lagrangian, ...hamiltonianPhaseSpace, ...chaos, ...statisticalMechanics },
  titles: track.titles,
  sections: track.sections,
};

export default bundle;

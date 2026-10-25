// src/lib/tracks/chemistry/index.tsx

// The Chemistry track: chemistry as a subject in its own right, from matter
// and atoms up to equilibrium, electrochemistry and organic chemistry. No code,
// like Physics: every formula is explained and every idea is a widget. Where
// Physics already teaches the underlying physics (the hydrogen atom, Pauli and
// the Aufbau order, thermodynamics, the nucleus) these lessons link there and
// go on with the chemistry. This file only lists the chapters; each chapter's
// content lives in its own module under ./chapters and is loaded on demand.

import type { Chapter } from "@/lib/tracks/types";

export const chemistryChapters: Chapter[] = [
  { id: "matter-measurement", section: "Matter & Atoms", title: "Matter: Substances, Mixtures & Changes", minRead: 20, load: () => import("./chapters/matter-measurement").then((m) => m.MatterMeasurementContent) },
  { id: "atoms-isotopes", section: "Matter & Atoms",     title: "Atoms, Ions & Isotopes",                 minRead: 21, load: () => import("./chapters/atoms-isotopes").then((m) => m.AtomsIsotopesContent) },
  { id: "the-mole", section: "Matter & Atoms",           title: "The Mole: Counting Atoms by Weighing",   minRead: 22, load: () => import("./chapters/the-mole").then((m) => m.TheMoleContent) },
  { id: "periodic-trends", section: "Matter & Atoms",    title: "The Periodic Table & Its Trends",        minRead: 24, load: () => import("./chapters/periodic-trends").then((m) => m.PeriodicTrendsContent) },
  { id: "valence-ions", section: "Bonding",              title: "Valence Electrons, the Octet & Ions",    minRead: 21, load: () => import("./chapters/valence-ions").then((m) => m.ValenceIonsContent) },
  { id: "ionic-bonding", section: "Bonding",             title: "Ionic Bonds & Lattice Energy",           minRead: 23, load: () => import("./chapters/ionic-bonding").then((m) => m.IonicBondingContent) },
  { id: "covalent-lewis", section: "Bonding",            title: "Covalent Bonds & Lewis Structures",      minRead: 25, load: () => import("./chapters/covalent-lewis").then((m) => m.CovalentLewisContent) },
  { id: "molecular-shape", section: "Bonding",           title: "Molecular Shape: VSEPR & Polarity",      minRead: 23, load: () => import("./chapters/molecular-shape").then((m) => m.MolecularShapeContent) },
];

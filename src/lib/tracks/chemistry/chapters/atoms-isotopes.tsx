"use client";

// Matter & Atoms 2: Dalton's atomic theory and what survived of it; the three
// particles (charges, masses); atomic number Z and mass number A, nuclide
// notation; ions; isotopes; the atomic mass unit; average atomic mass as a
// weighted mean (chlorine derived, boron live, copper solved backwards); the
// mass spectrometer. The quantum structure of the atom is taught in Physics,
// "The Hydrogen Atom" and "Many Particles", and the nucleus in "The Nucleus".

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { AtomBuilderFigure } from "@/components/lesson/figures/chemistry/AtomBuilderFigure";
import { MassSpecFigure } from "@/components/lesson/figures/chemistry/MassSpecFigure";

const r = String.raw;
const num = (v: number, d = 3) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Boron's average mass from the share of boron-10. */
function boronNumbers(v: Record<string, number>) {
  const x = v.x / 100, avg = x * 10.0129 + (1 - x) * 11.0093;
  return {
    tex: r`\bar m = ${num(x, 3)} \times 10.013 + ${num(1 - x, 3)} \times 11.009 = \amber{${num(avg, 3)}\ \text{u}}`,
    meter: (avg - 10.0129) / (11.0093 - 10.0129), meterLabel: `${num(avg, 3)} u`,
  };
}

export function AtomsIsotopesContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chAtom_intro",
          "The last chapter said that everything is made of atoms. This one opens them up. An atom is a tiny, heavy, positive nucleus with electrons around it, and three numbers say almost everything chemistry needs: how many protons, how many neutrons, how many electrons. The protons decide which element it is, the neutrons which isotope, and the electrons whether it is a neutral atom or an ion. By the end you will also know why the periodic table says chlorine weighs 35.45 when no chlorine atom does.")}
      </Lead>

      <Goals t={t} id="chAtom" items={[
        "Give the charge, mass and place of protons, neutrons and electrons.",
        "Read and write a nuclide symbol such as ³⁵Cl and count its particles.",
        "Explain what an ion and an isotope are, and how they differ.",
        "Compute an element's average atomic mass from its isotopes, and read a mass spectrum.",
      ]} />

      <H2>{tx(t, "chAtom_daltonTitle", "From Dalton's atoms to the nucleus")}</H2>
      <p>
        {tx(t, "chAtom_daltonBody",
          "In 1808 John Dalton turned the old Greek guess about atoms into a scientific theory, built to explain the laws of the last chapter. Its four claims, and how they held up:")}
      </p>
      <LessonTable
        headers={[tx(t, "chAtom_tClaim", "Dalton's claim (1808)"), tx(t, "chAtom_tToday", "Today")]}
        rows={[
          [tx(t, "chAtom_d1", "every element is made of tiny atoms"), tx(t, "chAtom_d1t", "true")],
          [tx(t, "chAtom_d2", "all atoms of one element are identical"), tx(t, "chAtom_d2t", "same chemistry, but they can differ in mass: isotopes")],
          [tx(t, "chAtom_d3", "compounds join atoms in small whole-number ratios"), tx(t, "chAtom_d3t", "true: H₂O, CO₂, NH₃")],
          [tx(t, "chAtom_d4", "reactions rearrange atoms; they never create or destroy them"), tx(t, "chAtom_d4t", "true for chemistry (nuclear reactions do change atoms)")],
        ]}
      />
      <p>
        {tx(t, "chAtom_insideBody",
          "Dalton's atoms had no parts. Then J. J. Thomson found in 1897 that every atom contains electrons, light particles with a negative charge, and in 1911 Ernest Rutherford's team showed that the positive charge and almost all the mass sit in a tiny nucleus at the centre. The nucleus is about 100 000 times smaller than the atom: if an atom were a football stadium, its nucleus would be a pea at the centre spot, and the rest would be the electrons' territory. How the electrons are arranged around it is quantum mechanics, worked out in Physics, \"The Hydrogen Atom\"; chemistry mostly needs to count them.")}
      </p>

      <H2>{tx(t, "chAtom_partsTitle", "Three particles")}</H2>
      <LessonTable
        headers={[tx(t, "chAtom_tPart", "Particle"), tx(t, "chAtom_tCharge", "Charge"), tx(t, "chAtom_tMassU", "Mass (u)"), tx(t, "chAtom_tWhere", "Where")]}
        rows={[
          [tx(t, "chAtom_p", "proton (p⁺)"), "+1", "1.007 276", tx(t, "chAtom_pW", "in the nucleus")],
          [tx(t, "chAtom_n", "neutron (n)"), "0", "1.008 665", tx(t, "chAtom_nW", "in the nucleus")],
          [tx(t, "chAtom_e", "electron (e⁻)"), "−1", "0.000 549", tx(t, "chAtom_eW", "around the nucleus")],
        ]}
      />
      <p>
        {tx(t, "chAtom_partsBody",
          "Charges are given in units of e = 1.602 × 10⁻¹⁹ coulomb, the size of the electron's charge, so a proton is +1 and an electron −1 exactly. Masses are given in u, the atomic mass unit (defined below; 1 u ≈ 1.66 × 10⁻²⁷ kg). A proton and a neutron weigh almost the same, about 1 u each, while an electron is 1836 times lighter. So nearly all of an atom's mass is in its nucleus, and nearly all of its volume, and all of its chemistry, belongs to the electrons.")}
      </p>

      <H2>{tx(t, "chAtom_zaTitle", "Atomic number and mass number")}</H2>
      <p>
        {tx(t, "chAtom_zaBody",
          "The number of protons in the nucleus is the atomic number, Z. It is the element's identity card: every atom with 6 protons is carbon, every atom with 79 is gold, and changing Z means changing the element. The total number of protons and neutrons, the particles of the nucleus (together called nucleons), is the mass number, A. It is a count, not a mass, and always a whole number. A particular kind of nucleus, with given Z and A, is called a nuclide, written with A on top and Z below, to the left of the symbol.")}
      </p>
      <Equation label={tx(t, "chAtom_eqZA", "A nuclide symbol")}
        where={[
          [r`Z`, tx(t, "chAtom_wZ", "atomic number: the number of protons (it fixes the element)")],
          [r`A`, tx(t, "chAtom_wA", "mass number: protons plus neutrons")],
          [r`N`, tx(t, "chAtom_wN", "the number of neutrons, N = A − Z")],
          [r`\mathrm{X}`, tx(t, "chAtom_wX", "the element's symbol")],
        ]}
        note={tx(t, "chAtom_zaNote", "Example: ³⁵₁₇Cl has Z = 17 protons, A = 35 nucleons, so N = 35 − 17 = 18 neutrons; a neutral atom also has 17 electrons. Since the symbol already fixes Z, it is often left out: ³⁵Cl, or chlorine-35.")}>
        {r`{}^{A}_{Z}\mathrm{X} \qquad A = Z + N`}
      </Equation>

      <H2>{tx(t, "chAtom_ionTitle", "Ions: atoms with a charge")}</H2>
      <p>
        {tx(t, "chAtom_ionBody",
          "A neutral atom has as many electrons as protons, so the charges cancel. In chemical reactions the nucleus is never touched (that would take the energies of nuclear physics), but electrons can be moved. An atom that loses electrons is left with more protons than electrons: a positive ion, or cation. One that gains electrons becomes a negative ion, or anion. The charge is written as a superscript: Na⁺, Mg²⁺, Cl⁻, O²⁻.")}
      </p>
      <Equation label={tx(t, "chAtom_eqIon", "The charge of an atom or ion")}
        where={[
          [r`q`, tx(t, "chAtom_wQ", "the charge, in units of e")],
          [r`Z`, tx(t, "chAtom_wZ2", "the number of protons")],
          [r`n_e`, tx(t, "chAtom_wNe", "the number of electrons")],
        ]}
        words={tx(t, "chAtom_ionWords", "The charge is the protons minus the electrons.")}>
        {r`q = Z - n_e`}
      </Equation>
      <LessonTable
        headers={[tx(t, "chAtom_tIon", "Ion"), "Z", tx(t, "chAtom_tElec", "Electrons"), tx(t, "chAtom_tHow", "How it formed")]}
        rows={[
          ["Na⁺", "11", "10", tx(t, "chAtom_i1", "sodium lost 1 electron")],
          ["Mg²⁺", "12", "10", tx(t, "chAtom_i2", "magnesium lost 2")],
          ["Cl⁻", "17", "18", tx(t, "chAtom_i3", "chlorine gained 1")],
          ["O²⁻", "8", "10", tx(t, "chAtom_i4", "oxygen gained 2")],
        ]}
      />
      <p>
        {tx(t, "chAtom_ionBody2",
          "Notice that Na⁺, Mg²⁺ and O²⁻ all end up with 10 electrons, the same number as the noble gas neon. That is no accident, and it is the key to which ions form; the bonding chapters build on it. For now, build some atoms and ions yourself.")}
      </p>
      <AtomBuilderFigure t={t} />

      <H2>{tx(t, "chAtom_isoTitle", "Isotopes")}</H2>
      <p>
        {tx(t, "chAtom_isoBody",
          "Atoms of the same element always have the same number of protons, but they can have different numbers of neutrons. These variants are the isotopes of the element (Greek for \"same place\": they sit in the same box of the periodic table). Isotopes have the same electrons, so the same chemistry: carbon-12 and carbon-13 burn, bond and taste the same. They differ in mass, and sometimes in the stability of the nucleus.")}
      </p>
      <LessonTable
        headers={[tx(t, "chAtom_tIso", "Isotope"), tx(t, "chAtom_tPN", "p / n"), tx(t, "chAtom_tShare", "Share in nature"), tx(t, "chAtom_tNote", "Note")]}
        rows={[
          [tx(t, "chAtom_h1", "hydrogen-1"), "1 / 0", "99.988 %", tx(t, "chAtom_h1n", "the only nuclide with no neutron")],
          [tx(t, "chAtom_h2", "hydrogen-2, deuterium (D)"), "1 / 1", "0.012 %", tx(t, "chAtom_h2n", "\"heavy water\" D₂O is 11 % denser than water")],
          [tx(t, "chAtom_h3", "hydrogen-3, tritium (T)"), "1 / 2", tx(t, "chAtom_trace", "traces"), tx(t, "chAtom_h3n", "radioactive, half-life 12.3 years")],
          [tx(t, "chAtom_c12", "carbon-12"), "6 / 6", "98.93 %", tx(t, "chAtom_c12n", "defines the atomic mass unit")],
          [tx(t, "chAtom_c13", "carbon-13"), "6 / 7", "1.07 %", tx(t, "chAtom_c13n", "stable")],
          [tx(t, "chAtom_c14", "carbon-14"), "6 / 8", tx(t, "chAtom_trace", "traces"), tx(t, "chAtom_c14n", "radioactive, half-life 5730 years: radiocarbon dating")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "chAtom_stabTip", "Why only some combinations of protons and neutrons last, and how radioactive ones decay, is nuclear physics: see Physics, \"The Nucleus\". Light elements are stable with about as many neutrons as protons; heavy ones need more neutrons to dilute the electric repulsion of all those protons.")}
      </Callout>

      <H2>{tx(t, "chAtom_uTitle", "The atomic mass unit")}</H2>
      <p>
        {tx(t, "chAtom_uBody",
          "Atoms are far too light for kilograms to be convenient. Chemists use the atomic mass unit u (also called the dalton, Da), defined as exactly one twelfth of the mass of a carbon-12 atom. On that scale a hydrogen-1 atom weighs 1.007 825 u and an oxygen-16 atom 15.994 915 u. The masses are close to the mass numbers but never exactly equal (except carbon-12, by definition), for two reasons: a proton and a neutron each weigh a bit more than 1 u, and binding a nucleus releases energy, which takes away a little mass (E = mc², Physics, \"Relativistic Energy\").")}
      </p>
      <Equation label={tx(t, "chAtom_eqU", "The atomic mass unit")}
        where={[
          [r`\text{u}`, tx(t, "chAtom_wU", "the atomic mass unit")],
          [r`m({}^{12}\text{C})`, tx(t, "chAtom_wC12", "the mass of one neutral carbon-12 atom")],
        ]}>
        {r`1\ \text{u} = \tfrac{1}{12}\, m({}^{12}\text{C}) = 1.660\,539 \times 10^{-27}\ \text{kg}`}
      </Equation>

      <H2>{tx(t, "chAtom_avgTitle", "Average atomic mass")}</H2>
      <p>
        {tx(t, "chAtom_avgBody",
          "Natural chlorine is a mixture: about 75.76 % of its atoms are chlorine-35 (34.969 u) and 24.24 % are chlorine-37 (36.966 u). The mix is the same in practically every sample on Earth, so a handful of chlorine atoms always weighs, on average, the same. That average, weighted by how common each isotope is, is the atomic mass (or standard atomic weight) printed in the periodic table.")}
      </p>
      <Equation label={tx(t, "chAtom_eqAvg", "Average atomic mass")}
        where={[
          [r`\bar m`, tx(t, "chAtom_wAvg", "the average atomic mass of the element, in u")],
          [r`f_i`, tx(t, "chAtom_wF", "the fraction of atoms that are isotope i (the percentage divided by 100); all the fractions add up to 1")],
          [r`m_i`, tx(t, "chAtom_wMi", "the mass of one atom of isotope i, in u")],
        ]}
        words={tx(t, "chAtom_avgWords", "Multiply each isotope's mass by its share, then add.")}>
        {r`\bar m = \sum_i f_i\, m_i = f_1 m_1 + f_2 m_2 + \dots`}
      </Equation>
      <Derivation t={t} label={tx(t, "chAtom_eqCl", "Chlorine's atomic mass")}
        steps={[
          { tex: r`\bar m = f_{35}\, m_{35} + f_{37}\, m_{37}` },
          { tex: r`= 0.7576 \times 34.969 + 0.2424 \times 36.966`, why: tx(t, "chAtom_cl1", "percentages divided by 100; isotope masses in u") },
          { tex: r`= 26.492 + 8.961`, why: tx(t, "chAtom_cl2", "each isotope's contribution") },
          { tex: r`= \green{35.453\ \text{u}}`, why: tx(t, "chAtom_cl3", "the 35.45 in the periodic table, closer to 35 because chlorine-35 is three times as common") },
        ]} />
      <LiveFormula label={tx(t, "chAtom_liveB", "Try it: boron, with two isotopes")}
        tex={r`\bar m = f_{10} \cdot 10.013 + (1 - f_{10}) \cdot 11.009`}
        vars={[
          { id: "x", label: tx(t, "chAtom_liveBx", "boron-10 (%)"), min: 0, max: 100, step: 0.1, value: 19.9, fmt: v => num(v, 1) },
        ]}
        compute={boronNumbers}
        note={tx(t, "chAtom_liveBNote", "Natural boron is 19.9 % boron-10, giving the table's 10.81 u. Slide to 50 % and the average sits exactly halfway; at 0 % or 100 % it is just one isotope's mass. Boron enriched in boron-10 is used to absorb neutrons in nuclear reactors, and its atomic mass is measurably lower.")} />
      <Callout type="warn" t={t}>
        {tx(t, "chAtom_avgWarn", "No chlorine atom weighs 35.45 u. The table's value is an average over the natural mix, like the average family having 1.8 children. Its decimals are also why the table's masses are not whole numbers.")}
      </Callout>

      <H2>{tx(t, "chAtom_msTitle", "Weighing isotopes: the mass spectrometer")}</H2>
      <p>
        {tx(t, "chAtom_msBody",
          "The isotope masses and shares above were measured with a mass spectrometer. It works in four steps. Ionise: knock an electron off each atom, so it becomes a positive ion that electric and magnetic fields can steer. Accelerate: send all the ions through the same voltage, so they all get the same energy. Deflect: pass them through a magnetic field, which bends each path into a circle. Detect: count the ions where they land. Ions with the same charge and energy follow a circle whose radius depends only on their mass, so each isotope lands in its own place.")}
      </p>
      <Equation label={tx(t, "chAtom_eqMs", "Radius of an ion's path in the magnet")}
        where={[
          [r`r`, tx(t, "chAtom_wR", "the radius of the circle the ion follows (m)")],
          [r`m`, tx(t, "chAtom_wM", "the mass of the ion (kg)")],
          [r`V`, tx(t, "chAtom_wV", "the accelerating voltage (V), the same for every ion")],
          [r`q`, tx(t, "chAtom_wQq", "the charge of the ion (C), e for a singly charged ion")],
          [r`B`, tx(t, "chAtom_wB", "the strength of the magnetic field (T)")],
        ]}
        note={tx(t, "chAtom_msNote", "The radius grows with the square root of the mass: a heavier ion is harder to turn. Physics, \"Magnetism\", derives it: the magnetic force qvB bends the path, and the voltage gives the speed v = √(2qV/m). Chlorine-35 and chlorine-37 differ by 6 % in mass, so their radii differ by about 3 %, plenty for a detector.")}>
        {r`r = \frac{1}{B}\sqrt{\frac{2\,m\,V}{q}}`}
      </Equation>
      <MassSpecFigure t={t} />

      <H2>{tx(t, "chAtom_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chAtom_ex1", "1. How many protons, neutrons and electrons are in ⁵⁶Fe³⁺? Iron has Z = 26, so 26 protons; N = 56 − 26 = 30 neutrons; the charge is +3, so 26 − 3 = 23 electrons.")}</p>
      <p>{tx(t, "chAtom_ex2", "2. An ion has 16 protons, 18 neutrons and 18 electrons. Z = 16 is sulfur, A = 16 + 18 = 34, charge = 16 − 18 = −2: it is ³⁴S²⁻.")}</p>
      <p>{tx(t, "chAtom_ex3", "3. Magnesium is 78.99 % ²⁴Mg (23.985 u), 10.00 % ²⁵Mg (24.986 u) and 11.01 % ²⁶Mg (25.983 u). Average: 0.7899 × 23.985 + 0.1000 × 24.986 + 0.1101 × 25.983 = 18.946 + 2.499 + 2.861 = 24.305 u, the table's value.")}</p>
      <H3>{tx(t, "chAtom_ex4Title", "Working backwards: copper's isotopes")}</H3>
      <p>{tx(t, "chAtom_ex4", "4. Copper's atomic mass is 63.546 u, and it has two isotopes, ⁶³Cu (62.930 u) and ⁶⁵Cu (64.928 u). What share is copper-63? Call it x; then copper-65 is 1 − x. So 63.546 = 62.930 x + 64.928 (1 − x) = 64.928 − 1.998 x, giving x = (64.928 − 63.546) / 1.998 = 0.692: about 69 % copper-63 and 31 % copper-65.")}</p>

      <H2>{tx(t, "chAtom_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chAtom_tWrong", "Wrong"), tx(t, "chAtom_tRight", "Right"), tx(t, "chAtom_tWhy", "Why")]}
        rows={[
          [tx(t, "chAtom_x1w", "a different number of neutrons makes a different element"), tx(t, "chAtom_x1r", "it makes a different isotope"), tx(t, "chAtom_x1", "only the number of protons fixes the element")],
          [tx(t, "chAtom_x2w", "Na⁺ gained a positive charge"), tx(t, "chAtom_x2r", "Na⁺ lost an electron"), tx(t, "chAtom_x2", "ions form by moving electrons; protons never move in chemistry")],
          [tx(t, "chAtom_x3w", "mass number = atomic mass"), tx(t, "chAtom_x3r", "A is a whole-number count; the mass in u is not"), tx(t, "chAtom_x3", "³⁵Cl has A = 35 but a mass of 34.969 u")],
          [tx(t, "chAtom_x4w", "average the isotope masses directly"), tx(t, "chAtom_x4r", "weight each by its abundance"), tx(t, "chAtom_x4", "(35 + 37)/2 = 36 ignores that ³⁵Cl is three times as common")],
          [tx(t, "chAtom_x5w", "Cl⁻ has 17 electrons"), tx(t, "chAtom_x5r", "it has 18"), tx(t, "chAtom_x5", "a negative charge means extra electrons: 17 + 1")],
        ]}
      />

      <KeyIdeas t={t} id="chAtom" items={[
        "An atom is a tiny nucleus of protons (+1) and neutrons (0), about 1 u each, surrounded by electrons (−1), 1836 times lighter.",
        "The atomic number Z (protons) fixes the element; the mass number A = Z + N counts the nucleons.",
        "Ions form when atoms lose electrons (cations) or gain them (anions): charge = Z − electrons.",
        "Isotopes have the same Z and different N: same chemistry, different mass.",
        "1 u is one twelfth of the mass of a carbon-12 atom.",
        "The atomic mass in the table is the abundance-weighted average of the isotope masses, measured with a mass spectrometer.",
      ]} />
    </Article>
  );
}

"use client";

// Matter & Atoms 4: Mendeleev's table and its predictions (eka-silicon);
// reading the modern table (periods, groups, blocks, families, metals and
// nonmetals); valence electrons; effective nuclear charge with Slater's rules
// (Na and Cl derived); the trends in radius, ionisation energy (with the
// successive-energy jumps and the Be/B, N/O dips), electron affinity,
// electronegativity and metallic character, each explained by Z_eff and n.
// Why rows hold 2, 8, 18, 32 elements (Pauli and the Aufbau order) is taught
// in Physics, "Many Particles", and only used here.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { PeriodicTrendsFigure } from "@/components/lesson/figures/chemistry/PeriodicTrendsFigure";
import { ShieldingFigure } from "@/components/lesson/figures/chemistry/ShieldingFigure";

const r = String.raw;

export function PeriodicTrendsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chPer_intro",
          "The periodic table is the most useful single page in science. Read one element's position and you can predict how big its atoms are, how easily they lose or gain electrons, what ions they form and whom they bond with. None of this has to be memorised element by element: it follows from two numbers, the charge of the nucleus and the shell the outer electrons sit in. This chapter shows how the table is built and why its properties change the way they do.")}
      </Lead>

      <Goals t={t} id="chPer" items={[
        "Find periods, groups, blocks and the main families in the table, and count valence electrons from the group.",
        "Compute an effective nuclear charge with Slater's rules.",
        "Predict and explain the trends in atomic radius, ionisation energy, electron affinity and electronegativity.",
        "Read successive ionisation energies to find how many valence electrons an atom has.",
      ]} />

      <H2>{tx(t, "chPer_mendTitle", "Mendeleev's gamble")}</H2>
      <p>
        {tx(t, "chPer_mendBody",
          "By 1869 chemists knew 63 elements and had noticed families among them: lithium, sodium and potassium are all soft metals that react violently with water; chlorine, bromine and iodine all form salts with them. Dmitri Mendeleev wrote each element on a card and arranged the cards by atomic mass, starting a new row whenever the properties began to repeat, so that families fell into columns. Two bold choices made his table famous. Where no known element fitted, he left a gap and predicted the missing element's properties. And where mass order put an element in the wrong family, he trusted the chemistry over the mass: tellurium (127.6) went before iodine (126.9).")}
      </p>
      <LessonTable
        headers={[tx(t, "chPer_tProp", "Property"), tx(t, "chPer_tPred", "Predicted for \"eka-silicon\" (1871)"), tx(t, "chPer_tFound", "Germanium, found 1886")]}
        rows={[
          [tx(t, "chPer_g1", "atomic mass"), "72", "72.63"],
          [tx(t, "chPer_g2", "density (g/cm³)"), "5.5", "5.32"],
          [tx(t, "chPer_g3", "oxide formula and density"), "EsO₂, 4.7", "GeO₂, 4.70"],
          [tx(t, "chPer_g4", "chloride boiling point"), tx(t, "chPer_g4p", "below 100 °C"), "86 °C"],
        ]}
      />
      <p>
        {tx(t, "chPer_moseBody",
          "Why did mass order sometimes fail? In 1913 Henry Moseley measured the X-rays given off by each element and found they grow in perfectly even steps with a whole number: the charge of the nucleus, the atomic number Z. Ordered by Z, tellurium (52) comes before iodine (53) with no special pleading. Mass order fails where an element's isotope mix happens to be heavy. The modern table is ordered by Z.")}
      </p>

      <H2>{tx(t, "chPer_readTitle", "Reading the modern table")}</H2>
      <p>
        {tx(t, "chPer_readBody",
          "Each row is a period. A new period starts every time electrons begin filling a new, larger shell, so period n is the row where the outer electrons have principal number n. Each column is a group, numbered 1 to 18. Atoms in the same group have the same arrangement of outer electrons, which is why they behave alike. Why the rows hold 2, 8, 8, 18, 18, 32 and 32 elements (the Pauli principle and the filling order of the orbitals) is explained in Physics, \"Many Particles\". Here we use the result: the table falls into blocks named after the orbital being filled.")}
      </p>
      <LessonTable
        headers={[tx(t, "chPer_tBlock", "Block"), tx(t, "chPer_tCols", "Columns"), tx(t, "chPer_tFill", "Filling"), tx(t, "chPer_tFam", "Families")]}
        rows={[
          [tx(t, "chPer_b1", "s-block"), tx(t, "chPer_b1c", "groups 1–2 (and helium)"), tx(t, "chPer_b1f", "an s orbital, 2 electrons"), tx(t, "chPer_b1m", "alkali metals (group 1), alkaline earth metals (group 2)")],
          [tx(t, "chPer_b2", "p-block"), tx(t, "chPer_b2c", "groups 13–18"), tx(t, "chPer_b2f", "p orbitals, 6 electrons"), tx(t, "chPer_b2m", "halogens (17), noble gases (18), most nonmetals")],
          [tx(t, "chPer_b3", "d-block"), tx(t, "chPer_b3c", "groups 3–12"), tx(t, "chPer_b3f", "d orbitals, 10 electrons"), tx(t, "chPer_b3m", "transition metals: iron, copper, gold")],
          [tx(t, "chPer_b4", "f-block"), tx(t, "chPer_b4c", "the two rows below"), tx(t, "chPer_b4f", "f orbitals, 14 electrons"), tx(t, "chPer_b4m", "lanthanides and actinides")],
        ]}
      />
      <p>
        {tx(t, "chPer_metBody",
          "A staircase line running from boron down to astatine splits the table. To its left are the metals, more than three quarters of all elements: shiny, good conductors of heat and electricity, easily shaped, and inclined to lose electrons. To its upper right are the nonmetals: dull or gaseous, poor conductors, inclined to gain or share electrons. Along the staircase sit the metalloids, such as silicon and germanium, with properties in between, which is exactly what makes them good semiconductors.")}
      </p>
      <PeriodicTrendsFigure t={t} />

      <H2>{tx(t, "chPer_valTitle", "Valence electrons")}</H2>
      <p>
        {tx(t, "chPer_valBody",
          "The electrons in the outermost shell, called valence electrons, are the ones that take part in bonding; the inner core electrons sit too deep to be disturbed. For the s- and p-blocks the group number gives their count directly, and that count is why a family behaves alike.")}
      </p>
      <LessonTable
        headers={[tx(t, "chPer_tGroup", "Group"), "1", "2", "13", "14", "15", "16", "17", "18"]}
        rows={[
          [tx(t, "chPer_tVal", "valence electrons"), "1", "2", "3", "4", "5", "6", "7", tx(t, "chPer_v8", "8 (He: 2)")],
          [tx(t, "chPer_tEx", "example"), "Na", "Mg", "Al", "C", "N", "O", "Cl", "Ar"],
          [tx(t, "chPer_tIon", "usual ion"), "Na⁺", "Mg²⁺", "Al³⁺", "—", "N³⁻", "O²⁻", "Cl⁻", tx(t, "chPer_none", "none")],
        ]}
      />
      <p>
        {tx(t, "chPer_valBody2",
          "The last row shows the pattern from the previous chapter: atoms near the left lose their few valence electrons, atoms near the right gain a few, and both end with the same electron count as the nearest noble gas. The noble gases already have full shells and almost never react. The rest of this chapter explains why losing is easy on the left and gaining is attractive on the right.")}
      </p>

      <H2>{tx(t, "chPer_zeffTitle", "The charge an electron really feels")}</H2>
      <p>
        {tx(t, "chPer_zeffBody",
          "Every trend in the table comes from one idea. A valence electron is pulled by the nucleus, charge +Z, but it is also pushed by all the other electrons. The inner electrons sit mostly between it and the nucleus and cancel much of the nuclear charge: they screen (or shield) it. Electrons in the same shell screen only a little, since they are as often on the far side. The charge left over, the effective nuclear charge Z_eff, is what the valence electron actually feels.")}
      </p>
      <Equation label={tx(t, "chPer_eqZeff", "Effective nuclear charge")}
        where={[
          [r`Z_{\text{eff}}`, tx(t, "chPer_wZeff", "the effective nuclear charge felt by one electron")],
          [r`Z`, tx(t, "chPer_wZ", "the atomic number, the true charge of the nucleus")],
          [r`S`, tx(t, "chPer_wS", "the screening constant: how much of that charge the other electrons cancel")],
        ]}
        words={tx(t, "chPer_zeffWords", "The charge an electron feels is the nuclear charge minus what the other electrons screen off.")}>
        {r`Z_{\text{eff}} = Z - S`}
      </Equation>
      <p>
        {tx(t, "chPer_slaterBody",
          "John Slater gave simple rules in 1930 for estimating S for an outer s or p electron. Write the configuration and count the other electrons: each one in the same shell n adds 0.35 (0.30 in the 1s shell); each one in shell n − 1 adds 0.85; each one deeper adds 1.00, a full charge.")}
      </p>
      <Derivation t={t} label={tx(t, "chPer_eqNaCl", "Sodium and chlorine, same period")}
        steps={[
          { tex: r`\text{Na: } 1s^2\,2s^2 2p^6\,\underline{3s^1}`, why: tx(t, "chPer_n1", "the valence electron is the lone 3s electron") },
          { tex: r`S = 0 \times 0.35 + 8 \times 0.85 + 2 \times 1.00 = 8.80`, why: tx(t, "chPer_n2", "no other electron in shell 3; eight in shell 2; two in shell 1") },
          { tex: r`Z_{\text{eff}}(\text{Na}) = 11 - 8.80 = \amber{2.20}`, why: tx(t, "chPer_n3", "out of 11 protons, the valence electron feels about 2") },
          { tex: r`\text{Cl: } 1s^2\,2s^2 2p^6\,\underline{3s^2 3p^5}`, why: tx(t, "chPer_n4", "seven electrons in shell 3; pick one of them") },
          { tex: r`S = 6 \times 0.35 + 8 \times 0.85 + 2 \times 1.00 = 10.90`, why: tx(t, "chPer_n5", "its six shell-3 neighbours screen weakly, the inner ten as before") },
          { tex: r`Z_{\text{eff}}(\text{Cl}) = 17 - 10.90 = \green{6.10}`, why: tx(t, "chPer_n6", "same shell as sodium's electron, but almost three times the pull") },
        ]} />
      <p>
        {tx(t, "chPer_zeffBody2",
          "This is the pattern behind everything that follows. Moving right along a period, each step adds one proton (+1 to Z) but only one same-shell electron (+0.35 to S), so Z_eff climbs by about 0.65 per element. Moving down a group, Z_eff stays roughly the same (sodium 2.20, potassium 2.20), but the valence electron sits in a bigger shell, farther out. Explore it below, then switch the screening off to see how absurd the atoms would be without it.")}
      </p>
      <ShieldingFigure t={t} />

      <H2>{tx(t, "chPer_radTitle", "Atomic radius")}</H2>
      <p>
        {tx(t, "chPer_radBody",
          "An atom has no sharp edge: its electron cloud just fades away. So a radius has to be defined by measurement. The covalent radius is half the distance between the nuclei of two identical atoms joined by a single bond: in Cl₂ the nuclei are 199 pm apart, so chlorine's covalent radius is about 99 pm (1 pm = 10⁻¹² m). The trends follow directly from Z_eff and the shell number.")}
      </p>
      <LessonTable
        headers={[tx(t, "chPer_tDir", "Direction"), tx(t, "chPer_tRad", "Radius"), tx(t, "chPer_tWhyR", "Why")]}
        rows={[
          [tx(t, "chPer_r1", "→ across a period"), tx(t, "chPer_r1v", "shrinks: Na 155 pm → Cl 99 pm"), tx(t, "chPer_r1w", "same shell, rising Z_eff pulls it in")],
          [tx(t, "chPer_r2", "↓ down a group"), tx(t, "chPer_r2v", "grows: Li 133 → Na 155 → K 196 pm"), tx(t, "chPer_r2w", "a new, larger shell each period")],
        ]}
      />
      <p>
        {tx(t, "chPer_ionRad",
          "Ions change size too. A cation lost electrons, often a whole shell, and the remaining ones feel the same nucleus with less screening: Na⁺ (102 pm) is much smaller than Na (155 pm, covalent; 186 pm in the metal). An anion gained electrons that repel each other with no extra protons to hold them: Cl⁻ (181 pm) is much bigger than Cl (99 pm).")}
      </p>

      <H2>{tx(t, "chPer_ieTitle", "Ionisation energy")}</H2>
      <p>
        {tx(t, "chPer_ieBody",
          "The first ionisation energy is the energy needed to pull the most loosely held electron off an atom of the gas: X(g) → X⁺(g) + e⁻. It measures how tightly an atom holds its valence electrons. It is given either per atom, in electronvolts (1 eV = 1.602 × 10⁻¹⁹ J), or per mole of atoms, in kJ/mol.")}
      </p>
      <Equation label={tx(t, "chPer_eqEv", "Per atom and per mole")}
        where={[
          [r`E_{\text{mol}}`, tx(t, "chPer_wEmol", "the energy for one mole of atoms (kJ/mol)")],
          [r`E_{\text{atom}}`, tx(t, "chPer_wEat", "the energy for one atom (eV)")],
          [r`96.485`, tx(t, "chPer_w96", "1 eV × N_A, in kJ/mol: 1.602 × 10⁻¹⁹ J × 6.022 × 10²³ mol⁻¹ = 96 485 J/mol")],
        ]}
        note={tx(t, "chPer_evNote", "Sodium: 5.14 eV per atom, so 5.14 × 96.485 = 496 kJ to ionise a mole (23 g) of sodium atoms.")}>
        {r`E_{\text{mol}} = 96.485 \times E_{\text{atom}}`}
      </Equation>
      <p>
        {tx(t, "chPer_ieTrend",
          "Across a period the ionisation energy rises, because Z_eff rises and the radius shrinks: sodium 5.14 eV, chlorine 12.97 eV, argon 15.76 eV. Down a group it falls, because the electron is farther away: lithium 5.39, sodium 5.14, potassium 4.34, caesium 3.89 eV. That is why caesium is the most reactive metal you can safely keep: it gives its electron away most easily.")}
      </p>
      <H3>{tx(t, "chPer_dipTitle", "Two small dips")}</H3>
      <p>
        {tx(t, "chPer_dipBody",
          "Look at period 2 in the graph view of the table: the rise is not perfectly smooth. Boron (8.30 eV) is easier to ionise than beryllium (9.32 eV), because boron's outer electron is the first in a 2p orbital, slightly higher in energy and better screened than beryllium's 2s pair. Oxygen (13.62 eV) is easier than nitrogen (14.53 eV), because oxygen's fourth p electron has to share an orbital with another electron, and their repulsion helps push it out. The same two dips repeat in period 3 (Mg/Al and P/S).")}
      </p>
      <H3>{tx(t, "chPer_succTitle", "Successive ionisation energies")}</H3>
      <p>
        {tx(t, "chPer_succBody",
          "Atoms can lose more than one electron. Each further one is harder to remove, since it leaves an ion that is already positive. But the steps are not even: there is a huge jump the moment you start digging into a full inner shell. Counting the electrons before the jump counts the valence electrons.")}
      </p>
      <LessonTable
        headers={[tx(t, "chPer_tAtom", "Atom"), tx(t, "chPer_ie1", "1st (eV)"), tx(t, "chPer_ie2", "2nd"), tx(t, "chPer_ie3", "3rd"), tx(t, "chPer_ie4", "4th"), tx(t, "chPer_tJump", "Jump after")]}
        rows={[
          ["Na", "5.14", "47.3", "71.6", "98.9", tx(t, "chPer_j1", "1 electron → Na⁺")],
          ["Mg", "7.65", "15.0", "80.1", "109", tx(t, "chPer_j2", "2 electrons → Mg²⁺")],
          ["Al", "5.99", "18.8", "28.4", "120", tx(t, "chPer_j3", "3 electrons → Al³⁺")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "chPer_succTip", "Sodium's second electron needs nine times the energy of the first, because it comes from the full 2p shell, close to the nucleus and barely screened. That is why sodium forms Na⁺ and never Na²⁺ in chemistry.")}
      </Callout>

      <H2>{tx(t, "chPer_eaTitle", "Electron affinity")}</H2>
      <p>
        {tx(t, "chPer_eaBody",
          "The electron affinity is the energy released when a gas atom takes in an extra electron: X(g) + e⁻ → X⁻(g). A large value means the atom holds the new electron tightly. It grows toward the right of the table and peaks at the halogens, which need only one electron to complete their shell: chlorine releases 3.61 eV, the highest of all elements. Fluorine (3.40 eV) is slightly lower than chlorine, because it is so small that the new electron is crowded by the seven already there. Noble gases, beryllium, magnesium and nitrogen do not hold an extra electron at all: the dashed cells in the figure.")}
      </p>

      <H2>{tx(t, "chPer_enTitle", "Electronegativity")}</H2>
      <p>
        {tx(t, "chPer_enBody",
          "Ionisation energy and electron affinity describe lone atoms. Inside a molecule, what matters is how strongly an atom pulls the electrons it shares with a bonding partner. Linus Pauling put this on a scale in 1932, the electronegativity χ (the Greek letter chi), from bond energies. Fluorine is the most electronegative at 3.98, then oxygen 3.44, chlorine 3.16 and nitrogen 3.04; caesium is among the least at 0.79. Electronegativity rises across a period and falls down a group, for the same Z_eff and distance reasons. The difference between two atoms' electronegativities decides what kind of bond they form, which is where the next section begins.")}
      </p>

      <H2>{tx(t, "chPer_sumTitle", "All the trends on one page")}</H2>
      <LessonTable
        headers={[tx(t, "chPer_tProp", "Property"), tx(t, "chPer_tAcross", "→ across a period"), tx(t, "chPer_tDown", "↓ down a group"), tx(t, "chPer_tCause", "Cause")]}
        rows={[
          [tx(t, "chPer_sum1", "atomic radius"), tx(t, "chPer_dec", "decreases"), tx(t, "chPer_inc", "increases"), tx(t, "chPer_sum1c", "Z_eff up across; new shells down")],
          [tx(t, "chPer_sum2", "ionisation energy"), tx(t, "chPer_inc", "increases"), tx(t, "chPer_dec", "decreases"), tx(t, "chPer_sum2c", "electrons held tighter when closer and more strongly pulled")],
          [tx(t, "chPer_sum3", "electron affinity"), tx(t, "chPer_sum3a", "increases, peak at group 17"), tx(t, "chPer_sum3b", "decreases (from period 3)"), tx(t, "chPer_sum3c", "an incoming electron feels Z_eff too")],
          [tx(t, "chPer_sum4", "electronegativity"), tx(t, "chPer_inc", "increases"), tx(t, "chPer_dec", "decreases"), tx(t, "chPer_sum4c", "the same pull, measured inside bonds")],
          [tx(t, "chPer_sum5", "metallic character"), tx(t, "chPer_dec", "decreases"), tx(t, "chPer_inc", "increases"), tx(t, "chPer_sum5c", "metals are atoms that lose electrons easily")],
        ]}
      />

      <H2>{tx(t, "chPer_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chPer_ex1", "1. Which is larger, a magnesium or a sulfur atom? Same period (3), and sulfur is further right with a higher Z_eff, so magnesium is larger: 139 pm against 103 pm.")}</p>
      <p>{tx(t, "chPer_ex2", "2. Which has the higher first ionisation energy, oxygen or sulfur? Same group; oxygen's valence electrons are one shell closer, so oxygen: 13.62 eV against 10.36 eV.")}</p>
      <p>{tx(t, "chPer_ex3", "3. An element's successive ionisation energies are 6.1, 11.9, 51 and 67 eV. The big jump is after the second, so it has two valence electrons: a group 2 element. (It is calcium.)")}</p>
      <H3>{tx(t, "chPer_ex4Title", "Potassium's Z_eff")}</H3>
      <p>{tx(t, "chPer_ex4", "4. Potassium, 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹. The 4s electron has no neighbours in shell 4, 8 electrons in shell 3 (× 0.85 = 6.80) and 10 deeper (× 1.00 = 10.00). S = 16.80, Z_eff = 19 − 16.80 = 2.20, the same as sodium's. The difference is the shell: n = 4 instead of 3, so potassium is bigger and loses its electron more easily.")}</p>

      <H2>{tx(t, "chPer_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chPer_tWrong", "Wrong"), tx(t, "chPer_tRight", "Right"), tx(t, "chPer_tWhy", "Why")]}
        rows={[
          [tx(t, "chPer_x1w", "more protons, bigger atom"), tx(t, "chPer_x1r", "across a period, more protons make it smaller"), tx(t, "chPer_x1", "the extra charge pulls the same shell closer")],
          [tx(t, "chPer_x2w", "the table is ordered by mass"), tx(t, "chPer_x2r", "it is ordered by atomic number Z"), tx(t, "chPer_x2", "Ar/K, Co/Ni and Te/I would be swapped by mass")],
          [tx(t, "chPer_x3w", "Z_eff is the number of valence electrons"), tx(t, "chPer_x3r", "it is the charge a valence electron feels"), tx(t, "chPer_x3", "sodium has 1 valence electron and Z_eff 2.2")],
          [tx(t, "chPer_x4w", "noble gases have the highest electronegativity"), tx(t, "chPer_x4r", "most have no value at all"), tx(t, "chPer_x4", "electronegativity is defined from bonds, and they barely form any")],
          [tx(t, "chPer_x5w", "ionisation energy and electron affinity are the same"), tx(t, "chPer_x5r", "one removes an electron, the other adds one"), tx(t, "chPer_x5", "they follow similar trends but measure opposite processes")],
        ]}
      />

      <KeyIdeas t={t} id="chPer" items={[
        "The table is ordered by atomic number Z; periods are electron shells, groups share the same valence electrons.",
        "Blocks s, p, d, f name the orbital being filled; metals sit left of the boron–astatine staircase, nonmetals to its right.",
        "For the s- and p-blocks the group gives the number of valence electrons (group 13–18: minus 10).",
        "Z_eff = Z − S: inner electrons screen the nucleus, same-shell ones barely do (Slater: 0.35, 0.85, 1.00).",
        "Across a period Z_eff rises: atoms shrink, ionisation energy and electronegativity rise.",
        "Down a group the shell grows: atoms grow, ionisation energy and electronegativity fall.",
        "A jump in successive ionisation energies marks the start of an inner shell, and counts the valence electrons.",
      ]} />
    </Article>
  );
}

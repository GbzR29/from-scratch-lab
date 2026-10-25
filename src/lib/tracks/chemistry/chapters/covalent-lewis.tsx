"use client";

// Bonding 3: the covalent bond as a shared pair (H₂'s energy curve, bond
// length and bond energy); Lewis structures and the five-step recipe (CO₂
// worked); multiple bonds; bond order, length and energy; formal charge;
// resonance (O₃, NO₃⁻, benzene); exceptions to the octet rule (odd electron
// counts, boron, period 3 and beyond); polar bonds, partial charges and the
// covalent–ionic continuum. Why He₂ does not exist and why O₂ is magnetic
// need molecular orbitals: next section (hybridization-mo).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BondCurveFigure } from "@/components/lesson/figures/chemistry/BondCurveFigure";
import { LewisBuilderFigure } from "@/components/lesson/figures/chemistry/LewisBuilderFigure";
import { BondPolarityFigure } from "@/components/lesson/figures/chemistry/BondPolarityFigure";

const r = String.raw;

export function CovalentLewisContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chCov_intro",
          "Two chlorine atoms cannot settle their differences the way sodium and chlorine do: each wants one more electron, and neither will give one away. They share instead. A pair of electrons between two nuclei, attracted by both, is the covalent bond, and it holds together almost every molecule in a living thing, in fuel, in plastic and in air. This chapter shows why sharing lowers the energy, how to draw who shares what (Lewis structures), how to choose between drawings, and what happens when two atoms do not share equally.")}
      </Lead>

      <Goals t={t} id="chCov" items={[
        "Explain a covalent bond with the energy curve of H₂, and define bond length and bond energy.",
        "Draw the Lewis structure of a small molecule or ion, with multiple bonds where needed.",
        "Use formal charges to pick the best structure, and recognise resonance.",
        "Name the three kinds of exception to the octet rule.",
        "Predict whether a bond is nonpolar, polar or ionic from electronegativities.",
      ]} />

      <H2>{tx(t, "chCov_shareTitle", "Sharing a pair")}</H2>
      <p>
        {tx(t, "chCov_shareBody",
          "Bring two hydrogen atoms together. Far apart they ignore each other. As their electron clouds begin to overlap, each electron can spend time between the two nuclei, where it is attracted by both protons at once, and the energy drops. Bring them too close and the two protons repel each other strongly. Somewhere in between is a minimum: there the two atoms stay, as a molecule. The two electrons now belong to the pair of atoms together. That shared pair is a covalent bond.")}
      </p>
      <BondCurveFigure t={t} />
      <p>
        {tx(t, "chCov_curveBody",
          "Two numbers describe every bond. The bond length is the distance between the nuclei at the bottom of the curve (74 pm for H₂). The bond energy, or bond dissociation energy, is the energy needed to break one mole of the bonds into separate atoms in the gas (436 kJ/mol for H₂ at room temperature). A deep, narrow well means a short, strong bond.")}
      </p>

      <H2>{tx(t, "chCov_lewisTitle", "Lewis structures")}</H2>
      <p>
        {tx(t, "chCov_lewisBody",
          "A Lewis structure shows every valence electron of a molecule. A shared pair is drawn as a line between two atoms; a pair that belongs to one atom only, a lone pair (or nonbonding pair), is drawn as two dots beside it. In water, oxygen shares one pair with each hydrogen and keeps two lone pairs: counting both, oxygen has eight electrons around it and each hydrogen has two. Building such structures for any molecule follows a recipe.")}
      </p>
      <LessonTable
        headers={[tx(t, "chCov_tStep", "Step"), tx(t, "chCov_tDo", "What to do")]}
        rows={[
          ["1", tx(t, "chCov_r1", "Add up the valence electrons of all atoms; add one per negative charge, remove one per positive charge.")],
          ["2", tx(t, "chCov_r2", "Write the skeleton: usually the least electronegative atom (never hydrogen) in the centre, the others around it. Join each to the centre with a single bond (2 electrons each).")],
          ["3", tx(t, "chCov_r3", "Give the outer atoms lone pairs until each has an octet (hydrogen: just its bond).")],
          ["4", tx(t, "chCov_r4", "Put any electrons still left on the central atom, as lone pairs.")],
          ["5", tx(t, "chCov_r5", "If the central atom has fewer than eight, turn lone pairs of outer atoms into extra bonds (double or triple) until it has eight.")],
        ]}
      />
      <Derivation t={t} label={tx(t, "chCov_eqCo2", "Carbon dioxide, step by step")}
        steps={[
          { tex: r`4 + 2 \times 6 = 16\ \text{electrons}`, why: tx(t, "chCov_d1", "carbon has 4 valence electrons, each oxygen 6") },
          { tex: r`\text{O}-\text{C}-\text{O}: \quad 16 - 4 = 12\ \text{left}`, why: tx(t, "chCov_d2", "carbon is less electronegative, so it goes in the middle; two single bonds use 4") },
          { tex: r`\text{each O gets 3 lone pairs}: \quad 12 - 12 = 0`, why: tx(t, "chCov_d3", "the oxygens now have octets; no electrons are left for carbon") },
          { tex: r`\text{C has only } 2 + 2 = 4`, why: tx(t, "chCov_d4", "carbon is four electrons short of an octet") },
          { tex: r`\text{O}=\text{C}=\text{O}`, why: tx(t, "chCov_d5", "move one lone pair from each oxygen into a second bond: now every atom has eight, each oxygen with two lone pairs") },
        ]} />
      <H3>{tx(t, "chCov_multiTitle", "Double and triple bonds")}</H3>
      <p>
        {tx(t, "chCov_multiBody",
          "Two atoms can share two pairs (a double bond, as in CO₂ and in ethene, C₂H₄) or three (a triple bond, as in nitrogen, N≡N, and in ethyne, C₂H₂). The number of shared pairs is the bond order. More shared electrons between the same two nuclei pull them closer and hold them tighter, so as the bond order goes up, the bond gets shorter and stronger. It does not get three times stronger, though: the second and third pairs sit off the line between the nuclei and bind less (the next section shows why).")}
      </p>
      <LessonTable
        headers={[tx(t, "chCov_tBond", "Bond"), tx(t, "chCov_tOrder", "Order"), tx(t, "chCov_tLen", "Length (pm)"), tx(t, "chCov_tEn", "Energy (kJ/mol)")]}
        rows={[
          ["C–C", "1", "154", "347"],
          ["C=C", "2", "134", "614"],
          ["C≡C", "3", "120", "839"],
          ["N–N", "1", "145", "163"],
          ["N=N", "2", "125", "418"],
          ["N≡N", "3", "110", "945"],
          ["C–O", "1", "143", "358"],
          ["C=O", "2", "123", "745"],
          ["C≡O", "3", "113", "1072"],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "chCov_n2Tip", "The N≡N triple bond, 945 kJ/mol, is one of the strongest in chemistry. That is why the nitrogen that makes up 78% of the air is so unreactive, and why plants depend on bacteria, and farmers on the energy-hungry Haber process, to split it into usable compounds.")}
      </Callout>
      <p>
        {tx(t, "chCov_avgBody",
          "These are average values. The same kind of bond differs a little from molecule to molecule (C=O is 799 kJ/mol in CO₂, 745 on average), which is good enough for estimates. The Thermochemistry section uses them to estimate the heat of reactions.")}
      </p>

      <H2>{tx(t, "chCov_fcTitle", "Formal charge: choosing between drawings")}</H2>
      <p>
        {tx(t, "chCov_fcBody",
          "Often more than one structure obeys the octet rule. For carbon dioxide, O≡C–O (a triple and a single bond) also gives every atom eight electrons. To choose, chemists compute a formal charge for each atom: the charge it would have if every bond were shared perfectly evenly, one electron to each partner.")}
      </p>
      <Equation label={tx(t, "chCov_eqFc", "Formal charge")}
        where={[
          [r`FC`, tx(t, "chCov_wFc", "the formal charge of the atom in this structure")],
          [r`V`, tx(t, "chCov_wV", "the atom's valence electrons as a free atom (from its group)")],
          [r`L`, tx(t, "chCov_wL", "the electrons in its lone pairs (2 per pair), which are all its own")],
          [r`B`, tx(t, "chCov_wB", "the electrons in its bonds (2 per line), of which half count as its own")],
        ]}
        words={tx(t, "chCov_fcWords", "Compare the electrons an atom brought with the electrons it owns in the drawing: all its lone-pair electrons and half of its bonding ones.")}>
        {r`FC = V - L - \tfrac{1}{2}B`}
      </Equation>
      <p>
        {tx(t, "chCov_fcRules",
          "The formal charges always add up to the charge of the molecule or ion. The best structure is usually the one whose formal charges are as close to zero as possible, and, if a negative formal charge is needed, the one that puts it on the most electronegative atom. In O=C=O every formal charge is zero. In O≡C–O the triple-bonded oxygen has 6 − 2 − 3 = +1 and the single-bonded one 6 − 6 − 1 = −1, so O=C=O wins, and indeed both C–O distances in CO₂ are equal (116 pm).")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "chCov_fcWarn", "A formal charge is bookkeeping, not the real charge on an atom. In CO, the best structure gives carbon −1 and oxygen +1, yet oxygen is more electronegative. The real charges come from how the electrons are actually spread, which is the next idea in this chapter.")}
      </Callout>
      <p>
        {tx(t, "chCov_builderBody",
          "Practise with the builder. Each molecule's skeleton is fixed; you choose the bonds and the lone pairs, and the panel checks the count, the octets and the formal charges for you.")}
      </p>
      <LewisBuilderFigure t={t} />

      <H2>{tx(t, "chCov_resTitle", "Resonance")}</H2>
      <p>
        {tx(t, "chCov_resBody",
          "Ozone, O₃, has two equally good Lewis structures: O=O–O and O–O=O. Neither is right on its own. If either were, ozone would have one short double bond (121 pm, like O₂) and one long single bond (148 pm, like hydrogen peroxide). Measured, both bonds are 128 pm: the real molecule is a single, fixed structure in between, with one and a half bonds on each side. Lewis structures cannot draw that, so chemists draw all the equivalent structures with double-headed arrows between them and call them resonance structures. The real molecule is their average, the resonance hybrid.")}
      </p>
      <LessonTable
        headers={[tx(t, "chCov_tSpecies", "Species"), tx(t, "chCov_tStructs", "Resonance structures"), tx(t, "chCov_tAvg", "Bond order of each bond"), tx(t, "chCov_tMeas", "Measured")]}
        rows={[
          ["O₃", "2", "1½", tx(t, "chCov_m1", "both O–O 128 pm")],
          ["NO₃⁻", "3", "1⅓", tx(t, "chCov_m2", "all three N–O 125 pm")],
          ["CO₃²⁻", "3", "1⅓", tx(t, "chCov_m3", "all three C–O 129 pm")],
          [tx(t, "chCov_benz", "benzene, C₆H₆"), "2", "1½", tx(t, "chCov_m4", "all six C–C 140 pm, between 154 and 134")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "chCov_resWarn", "Resonance does not mean the molecule flips back and forth between the structures. A mule is not a horse half the time and a donkey the other half: it is a hybrid all the time. The structures are only our way of describing something a single drawing cannot.")}
      </Callout>

      <H2>{tx(t, "chCov_excTitle", "When the octet rule fails")}</H2>
      <LessonTable
        headers={[tx(t, "chCov_tCase", "Case"), tx(t, "chCov_tEx", "Examples"), tx(t, "chCov_tWhy", "What happens")]}
        rows={[
          [tx(t, "chCov_e1", "odd number of electrons"), "NO, NO₂, ClO₂", tx(t, "chCov_e1w", "with an odd total, some atom must have an unpaired electron; such molecules (radicals) are usually very reactive")],
          [tx(t, "chCov_e2", "fewer than eight"), "BF₃, BeCl₂ (gas)", tx(t, "chCov_e2w", "boron and beryllium have too few valence electrons; BF₃ keeps 6 around boron, which makes it eager to accept a lone pair from another molecule")],
          [tx(t, "chCov_e3", "more than eight"), "PCl₅, SF₆, XeF₄", tx(t, "chCov_e3w", "atoms of period 3 and below are large enough to fit five or six neighbours around them; their Lewis structures show 10 or 12 electrons")],
        ]}
      />
      <p>
        {tx(t, "chCov_excBody",
          "The third case is often explained by saying the central atom uses its empty d orbitals. Modern calculations show the d orbitals play almost no part: what matters is that a big atom has room for more neighbours, with the bonding electrons spread over several atoms. The 10- and 12-electron Lewis structures remain a useful way to count, as long as they are not taken literally. The other famous failure is oxygen: its Lewis structure O=O has every electron paired, but liquid oxygen sticks to a magnet, which takes unpaired electrons. Molecular orbitals, in the next section, get it right.")}
      </p>

      <H2>{tx(t, "chCov_polarTitle", "Unequal sharing: polar bonds")}</H2>
      <p>
        {tx(t, "chCov_polarBody",
          "Two identical atoms share their pair exactly evenly. Two different atoms do not: the more electronegative one (the Periodic Trends chapter) pulls the pair toward itself. In H–Cl the pair spends more time near chlorine, which gets a small negative charge, written δ− (delta minus, a fraction of an electron's charge), while hydrogen gets δ+. Such a bond is polar covalent, and it has a bond dipole: two opposite charges a small distance apart. The bigger the electronegativity difference Δχ, the more polar the bond, until at a large difference the pair practically belongs to one atom and the bond is ionic.")}
      </p>
      <Equation label={tx(t, "chCov_eqIonic", "Ionic character (Pauling's estimate)")}
        where={[
          [r`\text{ionic character}`, tx(t, "chCov_wIc", "how far the bond is from evenly shared (0) toward fully ionic (1)")],
          [r`\Delta\chi`, tx(t, "chCov_wDchi", "the difference between the two atoms' electronegativities")],
          [r`e`, tx(t, "chCov_wE", "the base of natural logarithms, 2.718")],
        ]}
        note={tx(t, "chCov_icNote", "H–Cl: Δχ = 3.16 − 2.20 = 0.96, so 1 − e^(−0.23) = 0.21: about one fifth ionic.")}>
        {r`\text{ionic character} \approx 1 - e^{-(\Delta\chi)^2/4}`}
      </Equation>
      <BondPolarityFigure t={t} />
      <p>
        {tx(t, "chCov_contBody",
          "So ionic and covalent bonds are two ends of one scale, not two separate worlds. A common rule of thumb calls a bond nonpolar below Δχ = 0.4, polar between 0.4 and about 1.8, and ionic above. Even sodium chloride, at 2.23, is not 100% ionic, and the polar bonds in water (Δχ = 1.24) are what make water such a good solvent. Whether a whole molecule ends up polar depends also on its shape: the subject of the next chapter.")}
      </p>

      <H2>{tx(t, "chCov_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chCov_ex1", "1. Ammonia, NH₃: 5 + 3 × 1 = 8 electrons. Three N–H bonds use 6; the last 2 form a lone pair on nitrogen. Nitrogen: 6 + 2 = 8 electrons; every formal charge is zero.")}</p>
      <p>{tx(t, "chCov_ex2", "2. Hydrogen cyanide, HCN: 1 + 4 + 5 = 10 electrons. H–C–N uses 4; nitrogen takes three lone pairs (6), leaving carbon with only 4. Moving two of nitrogen's pairs into bonds gives H–C≡N with one lone pair on nitrogen: all formal charges zero.")}</p>
      <p>{tx(t, "chCov_ex3", "3. Formal charges in the ammonium ion, NH₄⁺: nitrogen has 4 bonds and no lone pair, FC = 5 − 0 − 4 = +1; each hydrogen 1 − 0 − 1 = 0. The total is +1, the charge of the ion.")}</p>
      <p>{tx(t, "chCov_ex4", "4. The cyanate ion OCN⁻ has two structures with a total formal charge of size 1: [O=C=N]⁻ with −1 on nitrogen and [O–C≡N]⁻ with −1 on oxygen. Oxygen is more electronegative, so the second is the better description.")}</p>
      <p>{tx(t, "chCov_ex5", "5. Rank by polarity: C–H (Δχ 0.35), N–H (0.84), O–H (1.24), F–H (1.78). The order is the order of the electronegativity of the partner of hydrogen.")}</p>

      <H2>{tx(t, "chCov_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chCov_tWrong", "Wrong"), tx(t, "chCov_tRight", "Right"), tx(t, "chCov_tWhy2", "Why")]}
        rows={[
          [tx(t, "chCov_x1w", "forgetting the ion's charge in the count"), tx(t, "chCov_x1r", "add one electron per negative charge"), tx(t, "chCov_x1", "NO₃⁻ has 24 electrons, not 23")],
          [tx(t, "chCov_x2w", "hydrogen in the middle"), tx(t, "chCov_x2r", "hydrogen is always on the outside"), tx(t, "chCov_x2", "it can only make one bond")],
          [tx(t, "chCov_x3w", "a double bond is twice as strong as a single"), tx(t, "chCov_x3r", "it is stronger, but less than twice"), tx(t, "chCov_x3", "C–C 347, C=C 614 kJ/mol")],
          [tx(t, "chCov_x4w", "resonance structures interconvert quickly"), tx(t, "chCov_x4r", "the molecule is one hybrid, always"), tx(t, "chCov_x4", "all bonds in O₃ measure the same, 128 pm")],
          [tx(t, "chCov_x5w", "formal charge is the real charge"), tx(t, "chCov_x5r", "it is a bookkeeping device"), tx(t, "chCov_x5", "real charges depend on electronegativity, as in CO")],
        ]}
      />

      <KeyIdeas t={t} id="chCov" items={[
        "A covalent bond is a shared electron pair attracted by both nuclei; the energy minimum gives the bond length and the bond energy.",
        "Lewis structures: count valence electrons (adjusting for charge), single bonds first, complete outer octets, leftovers to the centre, then multiple bonds.",
        "Higher bond order means a shorter, stronger bond, but not proportionally stronger.",
        "Formal charge FC = V − L − B/2; the best structure has formal charges closest to zero, negative ones on electronegative atoms.",
        "Resonance: when several structures are equally good, the real molecule is a fixed hybrid with averaged bonds.",
        "Odd-electron molecules, boron and beryllium, and large atoms of period 3 and below break the octet rule.",
        "The electronegativity difference sets bond polarity: nonpolar, polar covalent or ionic, one continuous scale.",
      ]} />
    </Article>
  );
}

"use client";

// Bonding 1: why atoms combine (and noble gases do not); Lewis dot symbols and
// unpaired electrons; the octet rule as a rule of thumb; predicting ion
// charges from the group, explained by the jump in successive ionisation
// energies; electron configurations of ions, isoelectronic series and ionic
// radii; transition-metal ions (4s lost first, several charges); polyatomic
// ions; writing neutral formulas by charge balance. Why making ions pays at
// all (the lattice) is the next chapter.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { IonCostFigure } from "@/components/lesson/figures/chemistry/IonCostFigure";
import { IonFormulaPracticeFigure } from "@/components/lesson/figures/chemistry/IonFormulaPracticeFigure";

const r = String.raw;

export function ValenceIonsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chVal_intro",
          "Almost nothing around you is made of lone atoms. Salt is sodium and chlorine locked together, water is hydrogen and oxygen, you are mostly carbon, hydrogen, oxygen and nitrogen in long chains. Only the noble gases float around alone. This section is about how atoms hold on to each other, and it starts with the only part of the atom that takes part: the outer electrons. This chapter counts them, shows which atoms lose or gain them to become ions, and how ions combine into neutral compounds.")}
      </Lead>

      <Goals t={t} id="chVal" items={[
        "Draw the Lewis dot symbol of a main-group atom and say how many bonds it tends to make.",
        "Predict the usual ion of a main-group element and explain it with ionisation energies.",
        "Write the electron configuration of an ion, including transition-metal ions.",
        "Write the neutral formula of an ionic compound, with simple or polyatomic ions.",
      ]} />

      <H2>{tx(t, "chVal_whyTitle", "Why atoms combine")}</H2>
      <p>
        {tx(t, "chVal_whyBody",
          "A chemical bond is an attraction that holds atoms together strongly enough to make a new substance with its own properties. Atoms bond when the bonded arrangement has lower energy than the separate atoms: the difference is released, usually as heat, and the same amount would have to be put back in to pull them apart. Every bond is electrical in the end, a balance between nuclei attracting electrons and like charges repelling. What differs is where the outer electrons end up, and that gives three kinds of bond.")}
      </p>
      <LessonTable
        headers={[tx(t, "chVal_tKind", "Bond"), tx(t, "chVal_tWho", "Between"), tx(t, "chVal_tElec", "The outer electrons"), tx(t, "chVal_tEx", "Example")]}
        rows={[
          [tx(t, "chVal_k1", "ionic"), tx(t, "chVal_k1w", "a metal and a nonmetal"), tx(t, "chVal_k1e", "move from one atom to the other, making + and − ions that attract"), tx(t, "chVal_k1x", "table salt, NaCl")],
          [tx(t, "chVal_k2", "covalent"), tx(t, "chVal_k2w", "nonmetals"), tx(t, "chVal_k2e", "are shared in pairs between two atoms"), tx(t, "chVal_k2x", "water H₂O, methane CH₄")],
          [tx(t, "chVal_k3", "metallic"), tx(t, "chVal_k3w", "metals"), tx(t, "chVal_k3e", "leave every atom and roam through the whole piece"), tx(t, "chVal_k3x", "copper wire, iron")],
        ]}
      />
      <p>
        {tx(t, "chVal_nobleBody",
          "The noble gases (helium, neon, argon and the rest of group 18) are the exception that explains the rule. They have the highest ionisation energies of their periods and no wish for an extra electron: their outer shell is full. Atoms of other elements, when they bond, very often end up with the same electron count as the nearest noble gas.")}
      </p>

      <H2>{tx(t, "chVal_lewisTitle", "Lewis dot symbols")}</H2>
      <p>
        {tx(t, "chVal_lewisBody",
          "In 1916 Gilbert N. Lewis proposed a shorthand that chemists still use every day. Write the element's symbol and put one dot around it for each valence electron (the electrons of the outer shell, counted from the group as in the previous chapter). Place the dots on the four sides, one per side first, and only then start pairing them. The four sides stand for the four orbitals of the outer shell (one s and three p), each holding up to two electrons.")}
      </p>
      <LessonTable
        headers={[tx(t, "chVal_tAtom", "Atom"), tx(t, "chVal_tVal", "Valence electrons"), tx(t, "chVal_tPairs", "Pairs"), tx(t, "chVal_tSingle", "Unpaired dots"), tx(t, "chVal_tBonds", "Usual number of bonds")]}
        rows={[
          ["H", "1", "0", "1", "1"],
          ["C", "4", "0", "4", "4"],
          ["N", "5", "1", "3", "3"],
          ["O", "6", "2", "2", "2"],
          ["F, Cl", "7", "3", "1", "1"],
          ["Ne, Ar", "8", "4", "0", "0"],
        ]}
      />
      <p>
        {tx(t, "chVal_lewisBody2",
          "The unpaired dots are the useful column. Each one is an electron looking for a partner, and in a covalent bond it pairs with an unpaired electron of another atom. So carbon usually makes four bonds, nitrogen three, oxygen two, and hydrogen and the halogens one: methane is CH₄, ammonia NH₃, water H₂O, hydrogen chloride HCl. Two chapters from now the dots become full Lewis structures of molecules.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "chVal_lewisTip", "Carbon's ground state is really 2s² 2p², two paired and two unpaired electrons, which would suggest two bonds. It makes four because promoting one 2s electron costs less than the energy released by two extra bonds. The four-dot symbol already counts that. Hybrid orbitals, in the next section, describe it properly.")}
      </Callout>

      <H2>{tx(t, "chVal_octetTitle", "The octet rule")}</H2>
      <p>
        {tx(t, "chVal_octetBody",
          "Lewis noticed that atoms in stable compounds usually end up with eight electrons around them (an octet), counting the ones they share. Hydrogen ends up with two, like helium. This is the octet rule: atoms lose, gain or share electrons until each has the electron count of a noble gas. It is a rule of thumb, not a law of nature. It works very well for carbon, nitrogen, oxygen and fluorine, which have only the four orbitals of shell 2 to fill, and it has well-known exceptions that the covalent chapter collects. Its value is that it predicts most formulas from a glance at the table.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "chVal_octetWarn", "\"Atoms want a full shell\" is a convenient way to speak, but atoms want nothing, and a full shell is not magic. A lone Na⁺ ion has a neon configuration and is still higher in energy than a sodium atom. What makes the octet common is the whole energy balance of the compound, which the next chapter works out.")}
      </Callout>

      <H2>{tx(t, "chVal_ionsTitle", "Which ion an element forms")}</H2>
      <p>
        {tx(t, "chVal_ionsBody",
          "An ion is an atom with more or fewer electrons than protons. A positive ion is a cation, a negative ion an anion. Metals on the left of the table hold their few valence electrons loosely (low ionisation energy) and lose them: sodium becomes Na⁺, magnesium Mg²⁺, aluminium Al³⁺. Nonmetals on the right are only a few electrons short of the next noble gas and gain them: chlorine becomes Cl⁻, oxygen O²⁻, nitrogen N³⁻. In both cases the ion has the electron count of a noble gas.")}
      </p>
      <LessonTable
        headers={[tx(t, "chVal_tGroup", "Group"), "1", "2", "13", "15", "16", "17"]}
        rows={[
          [tx(t, "chVal_tCharge", "charge"), "+1", "+2", "+3", "−3", "−2", "−1"],
          [tx(t, "chVal_tIons", "ions"), "Li⁺ Na⁺ K⁺", "Mg²⁺ Ca²⁺ Ba²⁺", "Al³⁺", "N³⁻ P³⁻", "O²⁻ S²⁻", "F⁻ Cl⁻ Br⁻ I⁻"],
          [tx(t, "chVal_tLike", "electrons like"), tx(t, "chVal_prev", "the noble gas before"), tx(t, "chVal_prev", "the noble gas before"), tx(t, "chVal_prev", "the noble gas before"), tx(t, "chVal_next", "the noble gas after"), tx(t, "chVal_next", "the noble gas after"), tx(t, "chVal_next", "the noble gas after")],
        ]}
      />
      <p>
        {tx(t, "chVal_whyStop",
          "Why does magnesium stop at +2 and never go to +3? The previous chapter met the answer: successive ionisation energies. Removing magnesium's two 3s electrons costs 7.6 and 15.0 eV. The third would have to come from the full 2p shell, close to the nucleus and barely screened, and costs 80 eV. No chemical reaction supplies that. The charge of an ion is set by where that jump is. Try it below with every element; note also that making an ion always costs something, even for sodium.")}
      </p>
      <IonCostFigure t={t} />
      <p>
        {tx(t, "chVal_anionBody",
          "On the other side, a chlorine atom releases 3.61 eV when it takes one extra electron (its electron affinity). But a second extra electron would be pushed away by the first: no lone atom holds two extra electrons. O²⁻ and N³⁻ exist only surrounded by cations in a solid or by water molecules in a solution, which pay the extra cost with their attraction.")}
      </p>

      <H3>{tx(t, "chVal_cfgTitle", "Electron configurations of ions")}</H3>
      <p>
        {tx(t, "chVal_cfgBody",
          "For main-group ions, remove electrons from the outermost shell or add them to the first unfilled orbital. Sodium is 1s² 2s² 2p⁶ 3s¹, so Na⁺ is 1s² 2s² 2p⁶, the configuration of neon. Chlorine is [Ne] 3s² 3p⁵, so Cl⁻ is [Ne] 3s² 3p⁶, the configuration of argon. Atoms and ions with the same number of electrons are called isoelectronic. Their sizes show the nuclear charge at work: the same ten electrons are pulled tighter as protons are added.")}
      </p>
      <LessonTable
        headers={[tx(t, "chVal_tIon", "Ion (10 electrons)"), "N³⁻", "O²⁻", "F⁻", "Na⁺", "Mg²⁺", "Al³⁺"]}
        rows={[
          [tx(t, "chVal_tProtons", "protons"), "7", "8", "9", "11", "12", "13"],
          [tx(t, "chVal_tRadius", "ionic radius (pm)"), "146", "140", "133", "102", "72", "54"],
        ]}
      />
      <p>
        {tx(t, "chVal_radNote",
          "Ionic radii come from the distances between ions in crystals (Shannon's 1976 table, for an ion with six neighbours; N³⁻ with four). Across the series the charge of the nucleus goes from +7 to +13 while the electrons stay the same, and the radius falls to almost a third.")}
      </p>

      <H3>{tx(t, "chVal_tmTitle", "Transition-metal ions")}</H3>
      <p>
        {tx(t, "chVal_tmBody",
          "Transition metals do not follow the group rule, for two reasons. First, they lose their 4s electrons before their 3d ones, although 4s fills first in the neutral atom: once the atom is charged, the 3d orbitals drop below 4s in energy. Iron is [Ar] 3d⁶ 4s², so Fe²⁺ is [Ar] 3d⁶, not [Ar] 3d⁴ 4s². Second, the 3d electrons that remain have similar energies, so many transition metals form more than one ion. The charge is then written as a Roman numeral in the name: iron(II) for Fe²⁺, iron(III) for Fe³⁺.")}
      </p>
      <LessonTable
        headers={[tx(t, "chVal_tMetal", "Metal"), tx(t, "chVal_tCfg", "Atom"), tx(t, "chVal_tCommon", "Common ions")]}
        rows={[
          [tx(t, "chVal_m1", "iron"), "[Ar] 3d⁶ 4s²", "Fe²⁺ [Ar] 3d⁶ · Fe³⁺ [Ar] 3d⁵"],
          [tx(t, "chVal_m2", "copper"), "[Ar] 3d¹⁰ 4s¹", "Cu⁺ [Ar] 3d¹⁰ · Cu²⁺ [Ar] 3d⁹"],
          [tx(t, "chVal_m3", "zinc"), "[Ar] 3d¹⁰ 4s²", tx(t, "chVal_m3i", "Zn²⁺ [Ar] 3d¹⁰ only")],
          [tx(t, "chVal_m4", "silver"), "[Kr] 4d¹⁰ 5s¹", tx(t, "chVal_m4i", "Ag⁺ [Kr] 4d¹⁰ only")],
        ]}
      />

      <H2>{tx(t, "chVal_polyTitle", "Polyatomic ions")}</H2>
      <p>
        {tx(t, "chVal_polyBody",
          "Some ions are small groups of atoms that hold together with covalent bonds and carry a charge as a whole. They behave as one unit in compounds and in solution, so it pays to know the common ones by sight. How they are named is part of the naming chapter in the next section.")}
      </p>
      <LessonTable
        headers={[tx(t, "chVal_tFormula", "Ion"), tx(t, "chVal_tName", "Name"), tx(t, "chVal_tWhere", "Where you meet it")]}
        rows={[
          ["NH₄⁺", tx(t, "chVal_p1", "ammonium"), tx(t, "chVal_p1w", "fertilisers (ammonium nitrate)")],
          ["OH⁻", tx(t, "chVal_p2", "hydroxide"), tx(t, "chVal_p2w", "drain cleaner (sodium hydroxide)")],
          ["NO₃⁻", tx(t, "chVal_p3", "nitrate"), tx(t, "chVal_p3w", "fertilisers, gunpowder")],
          ["SO₄²⁻", tx(t, "chVal_p4", "sulfate"), tx(t, "chVal_p4w", "plaster (calcium sulfate), car batteries")],
          ["CO₃²⁻", tx(t, "chVal_p5", "carbonate"), tx(t, "chVal_p5w", "limestone and chalk (calcium carbonate)")],
          ["HCO₃⁻", tx(t, "chVal_p6", "hydrogen carbonate (bicarbonate)"), tx(t, "chVal_p6w", "baking soda (sodium hydrogen carbonate)")],
          ["PO₄³⁻", tx(t, "chVal_p7", "phosphate"), tx(t, "chVal_p7w", "bones and teeth (calcium phosphate)")],
          ["CH₃COO⁻", tx(t, "chVal_p8", "acetate"), tx(t, "chVal_p8w", "vinegar")],
        ]}
      />

      <H2>{tx(t, "chVal_formulaTitle", "Formulas of ionic compounds")}</H2>
      <p>
        {tx(t, "chVal_formulaBody",
          "A piece of salt has no overall charge. So an ionic compound contains cations and anions in the ratio that makes the charges cancel, and its formula gives that ratio in the smallest whole numbers. Such a formula describes a ratio, not a molecule: there is no single \"NaCl molecule\" in a salt crystal, only a huge stack of Na⁺ and Cl⁻ in a 1 : 1 ratio. That smallest repeating ratio is called a formula unit.")}
      </p>
      <Equation label={tx(t, "chVal_eqBal", "Charge balance")}
        where={[
          [r`n_+`, tx(t, "chVal_wNp", "the number of cations in the formula unit")],
          [r`z_+`, tx(t, "chVal_wZp", "the charge of one cation (for Al³⁺, +3)")],
          [r`n_-`, tx(t, "chVal_wNm", "the number of anions in the formula unit")],
          [r`z_-`, tx(t, "chVal_wZm", "the charge of one anion (for O²⁻, −2)")],
        ]}
        words={tx(t, "chVal_balWords", "All the positive charge plus all the negative charge adds up to zero.")}>
        {r`n_+\, z_+ + n_-\, z_- = 0`}
      </Equation>
      <Derivation t={t} label={tx(t, "chVal_eqAl", "Aluminium oxide")}
        steps={[
          { tex: r`\text{Al}^{3+} \quad \text{O}^{2-}`, why: tx(t, "chVal_a1", "aluminium is in group 13, oxygen in group 16") },
          { tex: r`n_+ \cdot 3 + n_- \cdot (-2) = 0 \;\Rightarrow\; 3 n_+ = 2 n_-`, why: tx(t, "chVal_a2", "the charges must cancel") },
          { tex: r`\operatorname{lcm}(3, 2) = 6`, why: tx(t, "chVal_a3", "the least common multiple of the two charges: the smallest total both ions can reach, 6 positive and 6 negative") },
          { tex: r`n_+ = 6 / 3 = \amber{2}, \quad n_- = 6 / 2 = \green{3}`, why: tx(t, "chVal_a4", "two Al³⁺ give +6, three O²⁻ give −6") },
          { tex: r`\text{Al}_{\amber{2}}\text{O}_{\green{3}}`, why: tx(t, "chVal_a5", "the formula of corundum, the mineral of rubies and sapphires") },
        ]} />
      <p>
        {tx(t, "chVal_crossBody",
          "The shortcut is to cross the charges over: the size of each ion's charge becomes the other ion's count. Al³⁺ and O²⁻ give Al₂O₃ at once. Always check that the result cannot be divided: Mg²⁺ and O²⁻ cross over to Mg₂O₂, which reduces to MgO. With polyatomic ions the same rule applies, and the ion goes in brackets when there is more than one: Ca²⁺ and NO₃⁻ give Ca(NO₃)₂, and Ca²⁺ with PO₄³⁻ gives Ca₃(PO₄)₂, the mineral in your bones.")}
      </p>
      <IonFormulaPracticeFigure t={t} />

      <H2>{tx(t, "chVal_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chVal_ex1", "1. Lewis symbol of sulfur: group 16, six valence electrons, so two pairs and two single dots. It usually makes two bonds (H₂S) or takes two electrons (S²⁻).")}</p>
      <p>{tx(t, "chVal_ex2", "2. Ion of strontium (group 2): Sr²⁺, configuration [Kr], with the electrons of krypton.")}</p>
      <p>{tx(t, "chVal_ex3", "3. Configuration of Mn²⁺: manganese is [Ar] 3d⁵ 4s²; the two 4s electrons go first, leaving [Ar] 3d⁵.")}</p>
      <p>{tx(t, "chVal_ex4", "4. Formula of the compound of ammonium and sulfate: NH₄⁺ and SO₄²⁻; two ammoniums balance one sulfate, so (NH₄)₂SO₄, a common fertiliser.")}</p>
      <p>{tx(t, "chVal_ex5", "5. Which charge does iron have in Fe₂O₃? Three O²⁻ give −6, shared by two iron ions, so each is +3: iron(III) oxide, rust.")}</p>

      <H2>{tx(t, "chVal_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chVal_tWrong", "Wrong"), tx(t, "chVal_tRight", "Right"), tx(t, "chVal_tWhy", "Why")]}
        rows={[
          [tx(t, "chVal_x1w", "Na⁺ is stable because it has a full shell"), tx(t, "chVal_x1r", "Na⁺ alone costs 5.14 eV to make"), tx(t, "chVal_x1", "the octet only pays off together with the attraction to other ions")],
          [tx(t, "chVal_x2w", "Fe²⁺ is [Ar] 3d⁴ 4s²"), tx(t, "chVal_x2r", "Fe²⁺ is [Ar] 3d⁶"), tx(t, "chVal_x2", "transition metals lose 4s electrons first")],
          [tx(t, "chVal_x3w", "MgO is written Mg₂O₂"), tx(t, "chVal_x3r", "MgO"), tx(t, "chVal_x3", "a formula unit uses the smallest whole-number ratio")],
          [tx(t, "chVal_x4w", "CaNO₃₂"), tx(t, "chVal_x4r", "Ca(NO₃)₂"), tx(t, "chVal_x4", "the brackets show that the whole nitrate ion is taken twice")],
          [tx(t, "chVal_x5w", "a bigger charge means a bigger ion"), tx(t, "chVal_x5r", "cations shrink, anions grow"), tx(t, "chVal_x5", "losing electrons leaves the rest pulled tighter; extra electrons repel each other")],
        ]}
      />

      <KeyIdeas t={t} id="chVal" items={[
        "Bonds form when the bonded atoms have lower energy than the separate ones; ionic, covalent and metallic bonds differ in where the outer electrons go.",
        "A Lewis symbol shows the valence electrons as dots; the unpaired ones give the usual number of covalent bonds.",
        "The octet rule (two for hydrogen) predicts most main-group formulas, but it is a rule of thumb.",
        "Main-group ions reach a noble gas count: groups 1, 2, 13 lose 1, 2, 3 electrons; groups 15, 16, 17 gain 3, 2, 1.",
        "The charge stops where the next electron would come from a full inner shell: the ionisation energy jumps.",
        "Transition metals lose 4s electrons before 3d and often have several ions, named with Roman numerals.",
        "An ionic formula is the smallest ratio whose charges add to zero; polyatomic ions stay together, in brackets when repeated.",
      ]} />
    </Article>
  );
}

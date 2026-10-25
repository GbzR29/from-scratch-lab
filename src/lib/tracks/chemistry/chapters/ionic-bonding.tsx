"use client";

// Bonding 2: sodium + chlorine as electron transfer and its energy puzzle
// (ions alone cost energy); the Coulomb energy of an ion pair in chemists'
// units (138 900 kJ·pm/mol derived); the rock-salt lattice, the Madelung
// constant and the Born–Landé equation (NaCl worked out); lattice energy
// trends with charge and size; the Born–Haber cycle; properties of ionic
// solids (melting points, brittleness, conduction). Coulomb's law itself is
// taught in Physics, "Electric Charge & Field".

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BornHaberFigure } from "@/components/lesson/figures/chemistry/BornHaberFigure";
import { CrystalShiftFigure } from "@/components/lesson/figures/chemistry/CrystalShiftFigure";

const r = String.raw;
const num = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/,/g, "\\,");

/** Coulomb energy of one cation–anion pair, per mole of pairs. */
function pairNumbers(t: TrackTranslations) {
  return (v: Record<string, number>) => {
    const e = (138900 * v.zp * v.zm) / v.r;
    return {
      tex: r`E = -\frac{138\,900 \times ${v.zp} \times ${v.zm}}{${v.r}} = \mathbf{-${num(e)}}\ \text{kJ/mol}`,
      meter: Math.min(1, e / 6000),
      meterLabel: `${tx(t, "chIon_liveNaCl", "× NaCl pair")} ${(e / 589).toFixed(1)}`,
    };
  };
}

export function IonicBondingContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chIon_intro",
          "Drop a piece of sodium, a soft metal you can cut with a knife, into a flask of chlorine, a poisonous yellow-green gas. It bursts into a yellow flame and leaves a white powder you could sprinkle on your food: sodium chloride, table salt. The previous chapter showed that sodium gives up an electron and chlorine takes one. But it also showed that this swap, on its own, costs energy. This chapter finds what pays for it: the electrical attraction of the ions, multiplied across a whole crystal.")}
      </Lead>

      <Goals t={t} id="chIon" items={[
        "Explain the ionic bond as electron transfer followed by Coulomb attraction.",
        "Compute the Coulomb energy of an ion pair and the lattice energy with the Born–Landé equation.",
        "Predict which of two salts has the larger lattice energy and the higher melting point.",
        "Build a Born–Haber cycle and use it to find a missing energy.",
        "Explain why ionic solids are hard, brittle, and conduct only when molten or dissolved.",
      ]} />

      <H2>{tx(t, "chIon_transferTitle", "Electron transfer, and its bill")}</H2>
      <p>
        {tx(t, "chIon_transferBody",
          "In Lewis symbols the reaction is one dot moving: Na· plus chlorine's seven dots gives Na⁺ and a chloride ion with eight dots, written in square brackets with its charge outside. Each ion now has a noble gas configuration. But follow the energy for single atoms in the gas: pulling the electron off sodium costs 496 kJ/mol (its ionisation energy), and putting it on chlorine gives back only 349 kJ/mol (its electron affinity).")}
      </p>
      <Derivation t={t} label={tx(t, "chIon_eqBill", "Making a pair of gas ions")}
        steps={[
          { tex: r`\text{Na}(g) \to \text{Na}^+(g) + e^- \qquad +496\ \text{kJ/mol}`, why: tx(t, "chIon_b1", "the ionisation energy: energy goes in") },
          { tex: r`\text{Cl}(g) + e^- \to \text{Cl}^-(g) \qquad -349\ \text{kJ/mol}`, why: tx(t, "chIon_b2", "the electron affinity: energy comes out") },
          { tex: r`\text{Na}(g) + \text{Cl}(g) \to \text{Na}^+(g) + \text{Cl}^-(g) \qquad \amber{+147}\ \text{kJ/mol}`, why: tx(t, "chIon_b3", "adding the two: the transfer alone is uphill") },
        ]} />
      <p>
        {tx(t, "chIon_billBody",
          "This is true for every pair of elements: no atom's electron affinity is as large as any atom's ionisation energy (the largest affinity, chlorine's 349, is below the smallest ionisation energy, caesium's 376). Electron transfer between lone atoms never pays. Something else must.")}
      </p>

      <H2>{tx(t, "chIon_coulTitle", "The attraction that pays")}</H2>
      <p>
        {tx(t, "chIon_coulBody",
          "Once formed, Na⁺ and Cl⁻ attract each other, and pulling opposite charges together releases energy. Coulomb's law (Physics, \"Electric Charge & Field\") gives the energy of two charges at a distance r. Chemists work with ion charges in units of e and distances in picometres, and per mole of pairs, so it pays to pack all the constants into one number first.")}
      </p>
      <Equation label={tx(t, "chIon_eqCoul", "Coulomb energy of an ion pair")}
        where={[
          [r`E`, tx(t, "chIon_wE", "the energy of the pair relative to the ions far apart (negative: lower, attracted)")],
          [r`z_1, z_2`, tx(t, "chIon_wZ", "the ion charges in units of e (Na⁺: +1, O²⁻: −2)")],
          [r`r`, tx(t, "chIon_wR", "the distance between the two nuclei, in pm")],
          [r`138\,900`, tx(t, "chIon_wK", "k e² N_A in kJ·pm/mol: all the constants together (derived below)")],
        ]}
        words={tx(t, "chIon_coulWords", "The attraction grows with the product of the charges and falls with the distance between the ions.")}>
        {r`E = 138\,900\ \frac{z_1\, z_2}{r}`}
      </Equation>
      <Derivation t={t} label={tx(t, "chIon_eqConst", "Where 138 900 comes from")}
        steps={[
          { tex: r`E = k\,\frac{q_1 q_2}{r}, \quad k = 8.988 \times 10^{9}\ \text{N·m}^2/\text{C}^2`, why: tx(t, "chIon_c1", "Coulomb's law for one pair of charges, in SI units") },
          { tex: r`q = z\,e, \quad e = 1.602 \times 10^{-19}\ \text{C}`, why: tx(t, "chIon_c2", "an ion's charge is z elementary charges") },
          { tex: r`k\,e^2 = 8.988 \times 10^{9} \times (1.602 \times 10^{-19})^2 = 2.307 \times 10^{-28}\ \text{J·m}`, why: tx(t, "chIon_c3", "the energy of one pair, times its distance in metres") },
          { tex: r`k\,e^2 N_A = 2.307 \times 10^{-28} \times 6.022 \times 10^{23} = 1.389 \times 10^{-4}\ \text{J·m/mol}`, why: tx(t, "chIon_c4", "per mole of pairs (Avogadro's number N_A)") },
          { tex: r`1.389 \times 10^{-4}\ \text{J·m} = 1.389 \times 10^{-7}\ \text{kJ} \times 10^{12}\ \text{pm} = \amber{138\,900}\ \text{kJ·pm/mol}`, why: tx(t, "chIon_c5", "1 J = 10⁻³ kJ and 1 m = 10¹² pm") },
        ]} />
      <p>
        {tx(t, "chIon_pairBody",
          "In a gas-phase NaCl pair the nuclei are 236 pm apart, so E = 138 900 × (+1)(−1) / 236 = −589 kJ/mol. That is four times the 147 kJ/mol the transfer cost: the pair ends up 442 kJ/mol below the two atoms. Try other charges and distances: doubling both charges multiplies the energy by four.")}
      </p>
      <LiveFormula label={tx(t, "chIon_liveTitle", "Try it: one cation and one anion")}
        tex={r`E = -138\,900\ \frac{z_+\, |z_-|}{r}`}
        vars={[
          { id: "zp", label: tx(t, "chIon_liveZp", "cation charge z₊"), min: 1, max: 3, step: 1, value: 1, fmt: v => `+${v}` },
          { id: "zm", label: tx(t, "chIon_liveZm", "anion charge |z₋|"), min: 1, max: 3, step: 1, value: 1, fmt: v => `−${v}` },
          { id: "r", label: tx(t, "chIon_liveR", "distance r (pm)"), min: 150, max: 400, step: 1, value: 236, fmt: v => `${v} pm` },
        ]}
        compute={pairNumbers(t)}
        note={tx(t, "chIon_liveNote", "Real pairs: NaCl 236 pm, KCl 267 pm, LiF 156 pm, MgO about 175 pm. The meter compares with the NaCl pair (589 kJ/mol).")} />

      <H2>{tx(t, "chIon_latticeTitle", "From a pair to a crystal")}</H2>
      <p>
        {tx(t, "chIon_latticeBody",
          "Ions do not stop at pairs. Each Na⁺ attracts every Cl⁻ around it, and the lowest-energy arrangement is a crystal lattice, a regular three-dimensional stack in which every ion is surrounded by ions of the opposite charge. In sodium chloride (the rock-salt structure) each Na⁺ sits in the middle of six Cl⁻ (above, below, left, right, front, back) and each Cl⁻ in the middle of six Na⁺. The energy released when one mole of gas ions comes together into the crystal is the lattice energy. For NaCl it is 787 kJ/mol, and it is what makes salt possible.")}
      </p>
      <H3>{tx(t, "chIon_madTitle", "Adding up every neighbour")}</H3>
      <p>
        {tx(t, "chIon_madBody",
          "To compute it, start with one Na⁺ and add up its Coulomb energy with every other ion in the crystal. At distance r₀ it has 6 Cl⁻ (attractive), at √2 r₀ 12 Na⁺ (repulsive), at √3 r₀ 8 Cl⁻ (attractive), at 2 r₀ 6 more Na⁺, and so on forever. The signs alternate and the sum, done carefully, converges to 1.7476 times the energy of a single pair at r₀. That number depends only on the geometry of the lattice and is called the Madelung constant M. So the crystal holds each ion 75% more strongly than a lone pair at the same distance would.")}
      </p>
      <p>
        {tx(t, "chIon_bornBody",
          "Attraction alone would collapse the crystal. When ions get too close, their filled electron shells overlap and repel very steeply, roughly as 1/rⁿ with n between 5 and 12 (the Born exponent, larger for bigger ions). The ions settle where attraction and repulsion balance, and the repulsion takes back a fraction 1/n of the attraction. Together that gives the Born–Landé equation (1918).")}
      </p>
      <Equation label={tx(t, "chIon_eqBL", "Born–Landé equation")}
        where={[
          [r`U`, tx(t, "chIon_wU", "the lattice energy: released when a mole of gas ions forms the crystal (kJ/mol)")],
          [r`M`, tx(t, "chIon_wM", "the Madelung constant of the lattice (rock salt: 1.7476)")],
          [r`z_+, z_-`, tx(t, "chIon_wZz", "the sizes of the ion charges")],
          [r`r_0`, tx(t, "chIon_wR0", "the distance between neighbouring cation and anion in the crystal (pm)")],
          [r`n`, tx(t, "chIon_wN", "the Born exponent: how steeply the overlap repulsion rises (5 to 12)")],
          [r`138\,900`, tx(t, "chIon_wK2", "the Coulomb constant in kJ·pm/mol, as above")],
        ]}
        words={tx(t, "chIon_blWords", "The lattice energy is the pair attraction, boosted by the geometry of the whole crystal, minus the small share taken back by repulsion.")}>
        {r`U = \frac{138\,900\ M\, z_+ z_-}{r_0}\left(1 - \frac{1}{n}\right)`}
      </Equation>
      <Derivation t={t} label={tx(t, "chIon_eqNaClU", "Lattice energy of NaCl")}
        steps={[
          { tex: r`M = 1.7476, \quad z_+ = z_- = 1`, why: tx(t, "chIon_u1", "rock-salt lattice, singly charged ions") },
          { tex: r`r_0 = 102 + 181 = 283\ \text{pm} \;(\text{measured: } 282)`, why: tx(t, "chIon_u2", "the radii of Na⁺ and Cl⁻ add up to the X-ray distance") },
          { tex: r`n = \tfrac{7 + 9}{2} = 8`, why: tx(t, "chIon_u3", "Born exponents: 7 for neon-like Na⁺, 9 for argon-like Cl⁻, averaged") },
          { tex: r`\frac{138\,900 \times 1.7476}{282} = 861\ \text{kJ/mol}`, why: tx(t, "chIon_u4", "the attraction of the whole lattice") },
          { tex: r`U = 861 \times \left(1 - \tfrac{1}{8}\right) = \green{753}\ \text{kJ/mol}`, why: tx(t, "chIon_u5", "minus one eighth for the repulsion; the measured value is 787, within 5%") },
        ]} />

      <H3>{tx(t, "chIon_trendTitle", "What makes a lattice strong")}</H3>
      <p>
        {tx(t, "chIon_trendBody",
          "The formula says it: the lattice energy grows with the product of the charges and shrinks with the distance between the ions. Charge wins by far. Going from Na⁺Cl⁻ to Mg²⁺O²⁻ multiplies z₊z₋ by four and shortens the distance a little, so the lattice energy almost quintuples. Within one charge type, smaller ions mean a stronger lattice. Melting the solid means pulling the ions out of that arrangement, so the melting points follow the same order.")}
      </p>
      <LessonTable
        headers={[tx(t, "chIon_tSalt", "Salt"), tx(t, "chIon_tCharges", "Charges"), tx(t, "chIon_tR0", "r₀ (pm)"), tx(t, "chIon_tU", "Lattice energy (kJ/mol)"), tx(t, "chIon_tMp", "Melts at (°C)")]}
        rows={[
          ["NaF", "+1, −1", "231", "923", "993"],
          ["NaCl", "+1, −1", "282", "787", "801"],
          ["NaBr", "+1, −1", "299", "747", "747"],
          ["NaI", "+1, −1", "324", "704", "661"],
          ["CaO", "+2, −2", "240", "3401", "2613"],
          ["MgO", "+2, −2", "211", "3791", "2852"],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "chIon_mgoTip", "Magnesium oxide melts at 2852 °C, hotter than most steel furnaces, and is used to line them. It is the same kind of bond as table salt, with doubled charges.")}
      </Callout>

      <H2>{tx(t, "chIon_bhTitle", "Measuring it: the Born–Haber cycle")}</H2>
      <p>
        {tx(t, "chIon_bhBody",
          "No experiment brings a mole of gas ions together directly, so lattice energies are found by a detour. Max Born and Fritz Haber (1919) used a fact about energy: the energy change between a start and an end does not depend on the path taken between them (Hess's law, which the Thermochemistry section develops). The direct path from sodium metal and chlorine gas to salt releases 411 kJ/mol, measured in a calorimeter. The detour goes through steps that can each be measured: turn the metal into gas atoms, ionise them, split the chlorine molecules into atoms, add the electrons, and finally let the ions form the crystal. Both paths must add up to the same total, so the one unknown step, the lattice energy, follows.")}
      </p>
      <Equation label={tx(t, "chIon_eqBH", "Born–Haber cycle for NaCl")}
        where={[
          [r`\Delta H_f`, tx(t, "chIon_wHf", "the enthalpy of formation: the heat of making 1 mol of NaCl from Na(s) and Cl₂(g) (−411 kJ/mol)")],
          [r`\Delta H_{\text{sub}}`, tx(t, "chIon_wSub", "turning solid sodium into gas atoms (+107)")],
          [r`IE`, tx(t, "chIon_wIe", "the ionisation energy of sodium (+496)")],
          [r`\tfrac12 D`, tx(t, "chIon_wD", "half the Cl–Cl bond energy: one Cl atom from half a Cl₂ molecule (+122)")],
          [r`EA`, tx(t, "chIon_wEa", "chlorine's electron affinity, as released energy (−349)")],
          [r`\Delta H_{\text{lat}}`, tx(t, "chIon_wU2", "the lattice step: gas ions form the crystal (negative, energy released)")],
        ]}
        note={tx(t, "chIon_bhNote", "ΔH_lat = −411 − 107 − 496 − 122 + 349 = −787 kJ/mol. The minus sign says the energy is released; tables list its size, the lattice energy U = 787 kJ/mol.")}>
        {r`\Delta H_f = \Delta H_{\text{sub}} + IE + \tfrac12 D + EA + \Delta H_{\text{lat}}`}
      </Equation>
      <BornHaberFigure t={t} />

      <H2>{tx(t, "chIon_propTitle", "What ionic solids are like")}</H2>
      <LessonTable
        headers={[tx(t, "chIon_tProp", "Property"), tx(t, "chIon_tWhy", "Why")]}
        rows={[
          [tx(t, "chIon_p1", "high melting and boiling points"), tx(t, "chIon_p1w", "every ion is held by all its neighbours; melting means breaking the lattice apart")],
          [tx(t, "chIon_p2", "hard but brittle"), tx(t, "chIon_p2w", "ions resist being pushed, but a slip of one row puts like charges face to face, and the crystal splits")],
          [tx(t, "chIon_p3", "do not conduct as solids"), tx(t, "chIon_p3w", "the ions are locked in place and there are no free electrons")],
          [tx(t, "chIon_p4", "conduct when molten or dissolved"), tx(t, "chIon_p4w", "the ions are free to move, carrying their charge with them")],
          [tx(t, "chIon_p5", "many dissolve in water"), tx(t, "chIon_p5w", "water molecules are polar and surround each ion (the shape chapter and the intermolecular forces chapter explain how)")],
        ]}
      />
      <p>
        {tx(t, "chIon_brittleBody",
          "The second row is worth seeing. Hit a grain of salt and it does not dent like a coin: it breaks into smaller cubes with flat faces. Slide the layers below and watch the energy between them change sign.")}
      </p>
      <CrystalShiftFigure t={t} />

      <H2>{tx(t, "chIon_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chIon_ex1", "1. Which has the larger lattice energy, KF or CaO? CaO: its charge product is 4 instead of 1, which outweighs everything else (measured: 3401 against 821 kJ/mol).")}</p>
      <p>{tx(t, "chIon_ex2", "2. The Coulomb energy of one Mg²⁺–O²⁻ pair at 211 pm: E = 138 900 × 2 × (−2) / 211 = −2633 kJ/mol, four and a half times the NaCl pair.")}</p>
      <p>{tx(t, "chIon_ex3", "3. The lattice energy of KCl from its cycle: ΔH_f = −437, sublimation of K +89, ionisation +419, ½ D(Cl₂) +122, EA −349. So ΔH_lat = −437 − 89 − 419 − 122 + 349 = −718 kJ/mol: a lattice energy of 718 kJ/mol, smaller than NaCl's because K⁺ is bigger.")}</p>
      <H3>{tx(t, "chIon_ex4Title", "Why not NaCl₂?")}</H3>
      <p>{tx(t, "chIon_ex4", "4. Na²⁺ would bring a bigger charge and a stronger lattice, so why does it never form? Its second electron comes from the full 2p shell and costs 4562 kJ/mol. Even with a lattice as strong as MgCl₂'s (2526 kJ/mol), the cycle would end about 2200 kJ/mol above the elements. The ionisation jump of the previous chapter decides the formula.")}</p>

      <H2>{tx(t, "chIon_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chIon_tWrong", "Wrong"), tx(t, "chIon_tRight", "Right"), tx(t, "chIon_tWhy2", "Why")]}
        rows={[
          [tx(t, "chIon_x1w", "sodium gives chlorine its electron because both want an octet"), tx(t, "chIon_x1r", "the transfer costs energy; the attraction of the ions pays for it"), tx(t, "chIon_x1", "496 kJ/mol in, only 349 back")],
          [tx(t, "chIon_x2w", "salt is made of NaCl molecules"), tx(t, "chIon_x2r", "it is a lattice of ions in a 1 : 1 ratio"), tx(t, "chIon_x2", "each ion is bonded equally to six neighbours, not to one partner")],
          [tx(t, "chIon_x3w", "bigger ions make stronger lattices"), tx(t, "chIon_x3r", "smaller and more highly charged ions do"), tx(t, "chIon_x3", "the energy goes as z₊z₋ / r₀")],
          [tx(t, "chIon_x4w", "solid salt conducts electricity"), tx(t, "chIon_x4r", "only molten or dissolved salt does"), tx(t, "chIon_x4", "charge needs carriers free to move")],
        ]}
      />

      <KeyIdeas t={t} id="chIon" items={[
        "Electron transfer between lone atoms always costs energy (for NaCl, +147 kJ/mol); the Coulomb attraction of the ions pays it back many times.",
        "Coulomb energy of an ion pair: E = 138 900 z₁z₂ / r, in kJ/mol with r in pm.",
        "In a crystal every ion attracts all its opposite neighbours: the Madelung constant (1.7476 for rock salt) adds them up.",
        "Born–Landé: U = 138 900 M z₊z₋ / r₀ × (1 − 1/n); the overlap repulsion takes back a fraction 1/n.",
        "Lattice energy grows with the charge product and with smaller ions; melting points follow it.",
        "A Born–Haber cycle finds the lattice energy from measurable steps, because energy changes do not depend on the path.",
        "Ionic solids are hard, brittle, high-melting, and conduct only when the ions can move.",
      ]} />
    </Article>
  );
}

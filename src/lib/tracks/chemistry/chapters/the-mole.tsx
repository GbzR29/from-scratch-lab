"use client";

// Matter & Atoms 3: counting by weighing; the mole and Avogadro's number (the
// 2019 definition, and why the number makes grams match u); molar mass from a
// formula; the conversions mass ↔ moles ↔ particles ↔ atoms; percent
// composition; empirical and molecular formulas from percentages and from a
// combustion analysis; a first look at the molar volume of a gas (the gas
// laws come in the States of Matter section).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { MoleFigure } from "@/components/lesson/figures/chemistry/MoleFigure";
import { EmpiricalFormulaFigure } from "@/components/lesson/figures/chemistry/EmpiricalFormulaFigure";

const r = String.raw;
const num = (v: number, d = 3) => String(+v.toFixed(d)).replace("-", "−");
const sciTex = (v: number) => {
  const e = Math.floor(Math.log10(v));
  return `${(v / 10 ** e).toFixed(2)} \\times 10^{${e}}`;
};

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Moles and molecules in a glass of water. */
function waterNumbers(v: Record<string, number>) {
  const m = v.m, n = m / 18.015, N = n * 6.02214076e23;
  return {
    tex: r`n = \frac{${num(m, 0)}\ \text{g}}{18.015\ \text{g/mol}} = \amber{${num(n, 2)}\ \text{mol}} \qquad N = ${num(n, 2)} \times 6.022 \times 10^{23} = \green{${sciTex(N)}}`,
    meter: m / 500, meterLabel: `${num(n, 1)} mol`,
  };
}

export function TheMoleContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chMol_intro",
          "A recipe for water says: two hydrogen atoms for every oxygen atom. But nobody can count atoms; a single drop holds more than a thousand billion billion of them. Chemists solve this the way a bank counts coins: by weighing. If you know what one coin weighs, a bag's weight tells you how many coins are inside. The mole is the unit that makes this work for atoms, and it turns every formula into a recipe you can follow on a balance.")}
      </Lead>

      <Goals t={t} id="chMol" items={[
        "Say what a mole is and why Avogadro's number has the value it has.",
        "Compute a molar mass from a formula and convert between grams, moles and particles.",
        "Compute the percent composition of a compound.",
        "Find an empirical and a molecular formula from lab data.",
      ]} />

      <H2>{tx(t, "chMol_weighTitle", "Counting by weighing")}</H2>
      <p>
        {tx(t, "chMol_weighBody",
          "A bank knows that one 1-euro coin weighs 7.50 g. A bag of coins that weighs 750 g therefore holds 100 coins, and nobody had to count them. Atoms work the same way, with one complication: they are absurdly light. One carbon-12 atom weighs 12 u, which is 1.993 × 10⁻²³ g. Weighing out any useful amount, a gram or so, means handling around 10²³ atoms. So chemists use a counting unit big enough to match: the mole.")}
      </p>

      <H2>{tx(t, "chMol_moleTitle", "The mole and Avogadro's number")}</H2>
      <p>
        {tx(t, "chMol_moleBody",
          "A mole (symbol mol) is a count, like a dozen, only much larger. Since 2019 the SI defines it as exactly 6.022 140 76 × 10²³ entities, the Avogadro number. \"Entities\" means whatever you are counting: atoms, molecules, ions, electrons. A mole of water is 6.022 × 10²³ water molecules, just as a dozen eggs is 12 eggs. The amount of substance n, measured in moles, is the SI's seventh base quantity.")}
      </p>
      <Equation label={tx(t, "chMol_eqN", "Particles and moles")}
        where={[
          [r`N`, tx(t, "chMol_wN", "the number of particles (a pure number)")],
          [r`n`, tx(t, "chMol_wn", "the amount of substance, in moles (mol)")],
          [r`N_A`, tx(t, "chMol_wNA", "the Avogadro constant: 6.022 140 76 × 10²³ particles per mole (mol⁻¹)")],
        ]}
        words={tx(t, "chMol_nWords", "The number of particles is the number of moles times Avogadro's number.")}>
        {r`N = n\, N_A \qquad N_A = 6.022\,140\,76 \times 10^{23}\ \text{mol}^{-1}`}
      </Equation>
      <p>
        {tx(t, "chMol_whyBody",
          "Why such a strange number? It was chosen to make the atomic mass unit and the gram fit together. One mole of atoms that each weigh 1 u weighs (to ten significant figures) exactly 1 g, because N_A is the number of u in a gram. That is the whole trick of the mole: a mass in u, read in grams, is the mass of one mole.")}
      </p>
      <Derivation t={t} label={tx(t, "chMol_eqWhy", "Why a mole of carbon-12 weighs 12 g")}
        steps={[
          { tex: r`m = N_A \times m(\text{one atom})` },
          { tex: r`= 6.022\,14 \times 10^{23}\ \text{mol}^{-1} \times 12\ \text{u}`, why: tx(t, "chMol_w1", "a carbon-12 atom weighs exactly 12 u") },
          { tex: r`= 6.022\,14 \times 10^{23}\ \text{mol}^{-1} \times 12 \times 1.660\,539 \times 10^{-24}\ \text{g}`, why: tx(t, "chMol_w2", "1 u = 1.660 539 × 10⁻²⁷ kg = 1.660 539 × 10⁻²⁴ g") },
          { tex: r`= 12 \times \underbrace{(6.022\,14 \times 1.660\,539) \times 10^{-1}}_{=\,1.000\,00}\ \text{g/mol}`, why: tx(t, "chMol_w3", "the two numbers were chosen to multiply to 10") },
          { tex: r`= \green{12.000\ \text{g/mol}}`, why: tx(t, "chMol_w4", "the mass of one atom in u becomes the mass of one mole in grams") },
        ]} />
      <Callout type="info" t={t}>
        {tx(t, "chMol_sizeTip", "How big is 6 × 10²³? Spread that many grains of sand over the Earth and they would bury every continent several metres deep. Yet it is only 18 g of water, a tablespoon. Atoms are small enough that both statements are true.")}
      </Callout>

      <H2>{tx(t, "chMol_mmTitle", "Molar mass")}</H2>
      <p>
        {tx(t, "chMol_mmBody",
          "The molar mass M of a substance is the mass of one mole of it, in grams per mole. For an element it is the atomic mass from the periodic table, read in g/mol: iron is 55.845 u per atom, so 55.845 g/mol. For a compound, add up the atomic masses of every atom in the formula, counting each as many times as it appears.")}
      </p>
      <Derivation t={t} label={tx(t, "chMol_eqSuc", "The molar mass of sucrose, C₁₂H₂₂O₁₁")}
        steps={[
          { tex: r`M = 12\, M(\text{C}) + 22\, M(\text{H}) + 11\, M(\text{O})`, why: tx(t, "chMol_s1", "the formula says 12 carbons, 22 hydrogens and 11 oxygens per molecule") },
          { tex: r`= 12 \times 12.011 + 22 \times 1.008 + 11 \times 15.999`, why: tx(t, "chMol_s2", "atomic masses from the periodic table, in g/mol") },
          { tex: r`= 144.132 + 22.176 + 175.989`, why: tx(t, "chMol_s3", "each element's share") },
          { tex: r`= \green{342.30\ \text{g/mol}}`, why: tx(t, "chMol_s4", "one mole of table sugar weighs 342.30 g") },
        ]} />
      <Equation label={tx(t, "chMol_eqM", "Mass and moles")}
        where={[
          [r`n`, tx(t, "chMol_wn2", "the amount of substance (mol)")],
          [r`m`, tx(t, "chMol_wm", "the mass of the sample (g)")],
          [r`M`, tx(t, "chMol_wM", "the molar mass (g/mol)")],
        ]}
        words={tx(t, "chMol_mWords", "To get moles, divide the mass by the molar mass.")}
        note={tx(t, "chMol_mNote", "Check the units: g ÷ (g/mol) = mol. If you ever divide the wrong way, the units come out as mol/g² or similar and tell you at once.")}>
        {r`n = \frac{m}{M}`}
      </Equation>
      <LiveFormula label={tx(t, "chMol_liveWater", "Try it: the molecules in some water")}
        tex={r`n = \frac{m}{M} \qquad N = n\,N_A`}
        vars={[{ id: "m", label: "m (g)", min: 1, max: 500, step: 1, value: 250, fmt: v => num(v, 0) }]}
        compute={waterNumbers}
        note={tx(t, "chMol_liveWaterNote", "A 250 g glass of water holds 13.9 mol, about 8.4 × 10²⁴ molecules. Slide to 18 g: one mole.")} />
      <MoleFigure t={t} />

      <H2>{tx(t, "chMol_mapTitle", "The map of conversions")}</H2>
      <p>
        {tx(t, "chMol_mapBody",
          "Almost every calculation in this track passes through moles. Grams and particles are the things you can weigh or think about; moles are the bridge between them. Each arrow is one multiplication or division.")}
      </p>
      <LessonTable
        headers={[tx(t, "chMol_tFrom", "From"), tx(t, "chMol_tTo", "To"), tx(t, "chMol_tDo", "Do")]}
        rows={[
          [tx(t, "chMol_c1f", "mass m (g)"), tx(t, "chMol_c1t", "moles n"), tx(t, "chMol_c1", "divide by the molar mass M")],
          [tx(t, "chMol_c2f", "moles n"), tx(t, "chMol_c2t", "mass m (g)"), tx(t, "chMol_c2", "multiply by M")],
          [tx(t, "chMol_c3f", "moles n"), tx(t, "chMol_c3t", "particles N"), tx(t, "chMol_c3", "multiply by N_A")],
          [tx(t, "chMol_c4f", "particles N"), tx(t, "chMol_c4t", "moles n"), tx(t, "chMol_c4", "divide by N_A")],
          [tx(t, "chMol_c5f", "molecules"), tx(t, "chMol_c5t", "atoms of one element"), tx(t, "chMol_c5", "multiply by that element's count in the formula")],
        ]}
      />
      <p>
        {tx(t, "chMol_mapEx",
          "Example: a 5.00 g sugar cube. n = 5.00 / 342.30 = 0.0146 mol of sucrose. N = 0.0146 × 6.022 × 10²³ = 8.80 × 10²¹ molecules. Each molecule has 12 + 22 + 11 = 45 atoms, so the cube holds 3.96 × 10²³ atoms, and 0.0146 × 12 = 0.175 mol of carbon atoms, 2.10 g of carbon.")}
      </p>

      <H2>{tx(t, "chMol_pctTitle", "Percent composition")}</H2>
      <p>
        {tx(t, "chMol_pctBody",
          "The first chapter computed that water is 11.19 % hydrogen by mass. The same reasoning works for any compound, with molar masses: each element's share is its total mass in one mole, divided by the molar mass.")}
      </p>
      <Equation label={tx(t, "chMol_eqPct", "Mass percentage of an element")}
        where={[
          [r`k`, tx(t, "chMol_wk", "how many atoms of the element are in the formula")],
          [r`M_{\text{el}}`, tx(t, "chMol_wMel", "the element's molar mass (g/mol)")],
          [r`M`, tx(t, "chMol_wMc", "the molar mass of the whole compound (g/mol)")],
        ]}
        note={tx(t, "chMol_pctNote", "Carbon dioxide, CO₂ (44.009 g/mol): carbon 12.011 / 44.009 = 27.29 %, oxygen 2 × 15.999 / 44.009 = 72.71 %. The percentages of all the elements always add up to 100 %.")}>
        {r`\%\,\text{el} = \frac{k\, M_{\text{el}}}{M} \times 100\%`}
      </Equation>

      <H2>{tx(t, "chMol_empTitle", "Empirical and molecular formulas")}</H2>
      <p>
        {tx(t, "chMol_empBody",
          "Now the reverse question, the one a chemist faces with a new substance: the lab measures the percentages, what is the formula? The answer comes in two stages. The empirical formula gives the simplest whole-number ratio of the atoms; for glucose it is CH₂O. The molecular formula gives the actual number of each atom in one molecule; for glucose it is C₆H₁₂O₆, six times the empirical formula. Percentages alone can only give the ratio, since CH₂O and C₆H₁₂O₆ have exactly the same percentages. To find the multiple, you also need the molar mass, measured separately (with a mass spectrometer, for example).")}
      </p>
      <Equation label={tx(t, "chMol_eqMult", "From empirical to molecular formula")}
        where={[
          [r`k`, tx(t, "chMol_wMult", "how many empirical units make one molecule (a whole number)")],
          [r`M`, tx(t, "chMol_wMmol", "the measured molar mass of the compound")],
          [r`M_{\text{emp}}`, tx(t, "chMol_wMemp", "the molar mass of the empirical formula")],
        ]}
        note={tx(t, "chMol_multNote", "Glucose: M = 180.16 g/mol and CH₂O weighs 30.03 g/mol, so k = 6 and the molecular formula is C₆H₁₂O₆. For ionic solids such as salt or rust there are no molecules, so the empirical formula is the formula.")}>
        {r`k = \frac{M}{M_{\text{emp}}} \qquad \text{molecular formula} = (\text{empirical formula})_k`}
      </Equation>
      <p>
        {tx(t, "chMol_empHow",
          "The method has five steps: assume 100 g of the compound, so the percentages become grams; divide each by its atomic mass to get moles of atoms; divide by the smallest number of moles; if a ratio ends in .33, .5 or .67, multiply everything by 3, 2 or 3; finally scale up by k. Step through it below, and try rounding too early.")}
      </p>
      <EmpiricalFormulaFigure t={t} />
      <Callout type="warn" t={t}>
        {tx(t, "chMol_roundWarn", "Keep three or four significant figures until the last step. A ratio of 1.48 is almost certainly 1.5 (multiply by 2), not 1; a ratio of 1.33 means multiply by 3. Rounding 1.5 to 2 turns rust, Fe₂O₃, into a compound that does not exist.")}
      </Callout>

      <H3>{tx(t, "chMol_combTitle", "Combustion analysis")}</H3>
      <p>
        {tx(t, "chMol_combBody",
          "How does a lab measure the percentages of a carbon compound? It burns a weighed sample in pure oxygen. All the carbon ends up in carbon dioxide and all the hydrogen in water, which are trapped and weighed. Their masses give back the carbon and hydrogen; oxygen is whatever mass is left.")}
      </p>
      <Derivation t={t} label={tx(t, "chMol_eqComb", "1.000 g of a sugar burns to 1.466 g of CO₂ and 0.6004 g of H₂O")}
        steps={[
          { tex: r`m(\text{C}) = 1.466\ \text{g} \times \frac{12.011}{44.009} = 0.4001\ \text{g}`, why: tx(t, "chMol_b1", "carbon is 12.011 of every 44.009 g of CO₂") },
          { tex: r`m(\text{H}) = 0.6004\ \text{g} \times \frac{2 \times 1.008}{18.015} = 0.0672\ \text{g}`, why: tx(t, "chMol_b2", "hydrogen is 2.016 of every 18.015 g of water") },
          { tex: r`m(\text{O}) = 1.000 - 0.4001 - 0.0672 = 0.5327\ \text{g}`, why: tx(t, "chMol_b3", "the rest of the sample must be oxygen (mass is conserved)") },
          { tex: r`n:\ \ \tfrac{0.4001}{12.011} : \tfrac{0.0672}{1.008} : \tfrac{0.5327}{15.999} = 0.0333 : 0.0667 : 0.0333`, why: tx(t, "chMol_b4", "grams to moles of atoms") },
          { tex: r`= 1 : 2 : 1 \ \Rightarrow\ \green{\text{CH}_2\text{O}}`, why: tx(t, "chMol_b5", "divide by the smallest: the empirical formula of glucose") },
        ]} />

      <H2>{tx(t, "chMol_gasTitle", "A mole of gas")}</H2>
      <p>
        {tx(t, "chMol_gasBody",
          "Solids and liquids pack their particles tightly, so a mole of each takes a different volume. Gases are different: their molecules are so far apart that their own size hardly matters, and one mole of any gas takes almost the same volume at the same temperature and pressure: 24.5 L at 25 °C and normal atmospheric pressure (22.4 L at 0 °C). Avogadro guessed this in 1811, long before anyone could count molecules. The gas-laws chapter derives it; for now, it is why a mole of oxygen in the figure above is a box almost 30 cm on each side.")}
      </p>

      <H2>{tx(t, "chMol_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chMol_ex1", "1. How many moles are in 10.0 g of table salt, NaCl? M = 22.990 + 35.45 = 58.44 g/mol, so n = 10.0 / 58.44 = 0.171 mol. That is 0.171 mol of Na⁺ ions and 0.171 mol of Cl⁻ ions.")}</p>
      <p>{tx(t, "chMol_ex2", "2. What is the mass of 0.250 mol of calcium carbonate, CaCO₃? M = 40.078 + 12.011 + 3 × 15.999 = 100.09 g/mol, so m = 0.250 × 100.09 = 25.0 g.")}</p>
      <p>{tx(t, "chMol_ex3", "3. What does one water molecule weigh? M / N_A = 18.015 g/mol ÷ 6.022 × 10²³ mol⁻¹ = 2.99 × 10⁻²³ g.")}</p>
      <H3>{tx(t, "chMol_ex4Title", "A formula from percentages")}</H3>
      <p>{tx(t, "chMol_ex4", "4. A compound is 85.6 % carbon and 14.4 % hydrogen, and its molar mass is 56.1 g/mol. Moles in 100 g: C 85.6 / 12.011 = 7.13, H 14.4 / 1.008 = 14.3. Ratio 1 : 2.00, so the empirical formula is CH₂ (14.03 g/mol). k = 56.1 / 14.03 = 4, so the molecule is C₄H₈, butene.")}</p>

      <H2>{tx(t, "chMol_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chMol_tWrong", "Wrong"), tx(t, "chMol_tRight", "Right"), tx(t, "chMol_tWhy", "Why")]}
        rows={[
          [tx(t, "chMol_x1w", "a mole is a mass"), tx(t, "chMol_x1r", "a mole is a count"), tx(t, "chMol_x1", "a mole of hydrogen and a mole of gold weigh 2 g and 197 g, but hold the same number of molecules or atoms")],
          [tx(t, "chMol_x2w", "n = M / m"), tx(t, "chMol_x2r", "n = m / M"), tx(t, "chMol_x2", "check the units: g ÷ g/mol = mol")],
          [tx(t, "chMol_x3w", "the molar mass of O₂ is 16.00 g/mol"), tx(t, "chMol_x3r", "it is 32.00 g/mol"), tx(t, "chMol_x3", "oxygen gas is made of O₂ molecules; count both atoms")],
          [tx(t, "chMol_x4w", "rounding 1.5 to 2 in a ratio"), tx(t, "chMol_x4r", "multiply everything by 2"), tx(t, "chMol_x4", "formulas need whole numbers, reached by multiplying, not rounding")],
          [tx(t, "chMol_x5w", "CH₂O must be glucose"), tx(t, "chMol_x5r", "it is only the empirical formula"), tx(t, "chMol_x5", "formaldehyde, acetic acid and glucose all share it")],
        ]}
      />

      <KeyIdeas t={t} id="chMol" items={[
        "A mole is exactly 6.022 140 76 × 10²³ particles; N = n N_A.",
        "Avogadro's number makes the mass of a particle in u equal to the mass of a mole in grams.",
        "The molar mass M is the sum of the atomic masses in the formula, in g/mol; n = m / M.",
        "Grams ↔ moles ↔ particles: divide or multiply by M, then by N_A.",
        "Percentages give the empirical formula (simplest ratio); the molar mass gives the molecular formula.",
        "One mole of any gas takes about 24.5 L at 25 °C and 1 atm.",
      ]} />
    </Article>
  );
}

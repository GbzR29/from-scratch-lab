"use client";

// Matter & Atoms 1: what chemistry studies; the three states seen as
// particles; pure substances (elements, compounds) and mixtures (homogeneous,
// heterogeneous); the law of definite proportions; separating mixtures;
// physical vs chemical properties and changes; conservation of mass
// (Lavoisier); density and how to measure it; the lab units chemists use.
// SI units, dimensions and significant figures are taught in Physics,
// "Units, Dimensions & Measurement", and only recalled here.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ParticlePracticeFigure } from "@/components/lesson/figures/chemistry/ParticlePracticeFigure";
import { DensityLabFigure } from "@/components/lesson/figures/chemistry/DensityLabFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Density of a sample, and whether it floats in water. */
function densityNumbers(v: Record<string, number>) {
  const { m, V } = v;
  const rho = m / V;
  return {
    tex: r`\rho = \frac{m}{V} = \frac{${num(m, 1)}\ \text{g}}{${num(V, 1)}\ \text{cm}^3} = \amber{${num(rho, 2)}\ \text{g/cm}^3} \qquad ${rho < 1 ? r`\green{\rho < 1:\ \text{floats on water}}` : r`\rho > 1:\ \text{sinks in water}`}`,
    meter: Math.min(1, rho / 20), meterLabel: `${num(rho, 2)} g/cm³`,
  };
}

export function MatterMeasurementContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chMat_intro",
          "Physics asks how things move and why. Chemistry asks a different question: what is this made of, and how can it turn into something else? Iron rusts, wood burns, bread rises, a battery runs down. In each case one set of substances becomes another. This first chapter sets up the language for that: what matter is, how to tell a pure substance from a mixture, how to tell a chemical change from a physical one, and the first law of chemistry, that mass is never lost.")}
      </Lead>

      <Goals t={t} id="chMat" items={[
        "Describe solids, liquids and gases in terms of particles.",
        "Sort any sample into element, compound, homogeneous mixture or heterogeneous mixture.",
        "Tell a physical change from a chemical change, and pick a method to separate a mixture.",
        "Use conservation of mass and density, ρ = m/V, in calculations.",
      ]} />

      <H2>{tx(t, "chMat_whatTitle", "Matter is made of particles")}</H2>
      <p>
        {tx(t, "chMat_whatBody",
          "Matter is anything that has mass and takes up space: air, water, rock, you. Look closely enough and all of it turns out to be made of atoms, tiny particles about 10⁻¹⁰ m across (a ten-billionth of a metre). There are only 118 kinds of atom, called the elements, and almost everything around you is built from a few dozen of them. Atoms often join into groups that stay together, called molecules: a water molecule is one oxygen atom joined to two hydrogen atoms, written H₂O. The small number after a symbol counts the atoms of that kind; no number means one.")}
      </p>
      <p>
        {tx(t, "chMat_whatBody2",
          "Chemists keep two pictures in mind at once. The macroscopic one is what you can see and measure: a clear liquid that boils at 100 °C. The particle one is what is really there: countless H₂O molecules, constantly moving and bumping into each other. Most of this track moves back and forth between the two. Every property you can measure is explained by what the particles do.")}
      </p>

      <H2>{tx(t, "chMat_statesTitle", "Three states, seen as particles")}</H2>
      <p>
        {tx(t, "chMat_statesBody",
          "The same substance can be a solid, a liquid or a gas. What changes between them is not the molecules themselves but how they are arranged and how freely they move. Particles attract each other a little, and they are always jiggling with thermal motion; the faster they jiggle, the higher the temperature. Which state wins depends on the contest between the attraction (holding them together) and the motion (pulling them apart).")}
      </p>
      <LessonTable
        headers={[tx(t, "chMat_tState", "State"), tx(t, "chMat_tShape", "Shape and volume"), tx(t, "chMat_tArr", "Particles"), tx(t, "chMat_tMove", "Motion")]}
        rows={[
          [tx(t, "chMat_s1", "solid"), tx(t, "chMat_s1a", "fixed shape, fixed volume"), tx(t, "chMat_s1b", "packed tight, usually in a regular pattern"), tx(t, "chMat_s1c", "vibrate in place")],
          [tx(t, "chMat_s2", "liquid"), tx(t, "chMat_s2a", "takes the container's shape, fixed volume"), tx(t, "chMat_s2b", "still touching, no fixed pattern"), tx(t, "chMat_s2c", "slide past each other")],
          [tx(t, "chMat_s3", "gas"), tx(t, "chMat_s3a", "fills the whole container"), tx(t, "chMat_s3b", "far apart, mostly empty space"), tx(t, "chMat_s3c", "fly freely, collide often")],
        ]}
      />
      <p>
        {tx(t, "chMat_statesBody2",
          "This explains everyday facts at once. Gases can be squeezed and liquids almost cannot, because only a gas has empty space between its particles. A litre of liquid water becomes about 1700 litres of steam at 100 °C: the same molecules, spread out. The energy needed to melt or boil, and why the temperature stays flat while it happens, are covered in Physics, \"Temperature & Heat\"; here what matters is that melting, boiling and freezing do not change what the molecules are.")}
      </p>

      <H2>{tx(t, "chMat_classTitle", "Pure substances and mixtures")}</H2>
      <p>
        {tx(t, "chMat_classBody",
          "A pure substance has a fixed composition: every sample of it is made of the same particles. Pure water is H₂O molecules and nothing else, whether it came from a glacier or a laboratory. A mixture is two or more substances mingled together, each keeping its own particles, in proportions that can vary: sea water can be more or less salty. Pure substances come in two kinds, and so do mixtures.")}
      </p>
      <LessonTable
        headers={[tx(t, "chMat_tKind", "Kind"), tx(t, "chMat_tMeans", "What it means"), tx(t, "chMat_tEx", "Examples")]}
        rows={[
          [tx(t, "chMat_k1", "element"), tx(t, "chMat_k1m", "pure substance made of one kind of atom; cannot be broken into simpler substances"), tx(t, "chMat_k1e", "iron Fe, helium He, oxygen O₂, carbon (diamond)")],
          [tx(t, "chMat_k2", "compound"), tx(t, "chMat_k2m", "pure substance made of two or more elements joined in a fixed ratio"), tx(t, "chMat_k2e", "water H₂O, table salt NaCl, carbon dioxide CO₂, sugar C₁₂H₂₂O₁₁")],
          [tx(t, "chMat_k3", "homogeneous mixture (solution)"), tx(t, "chMat_k3m", "mixture that looks the same everywhere, even under a microscope"), tx(t, "chMat_k3e", "salt water, air, vinegar, brass (copper + zinc)")],
          [tx(t, "chMat_k4", "heterogeneous mixture"), tx(t, "chMat_k4m", "mixture whose parts you can tell apart"), tx(t, "chMat_k4e", "sand in water, granite, salad, oil and vinegar")],
        ]}
      />
      <p>
        {tx(t, "chMat_classBody2",
          "A compound is not a mixture of its elements. Sodium is a soft metal that bursts into flame in water; chlorine is a poisonous green gas. Joined as sodium chloride they make table salt, which you eat. The atoms are the same, but once joined they behave as a new substance with its own properties. A mixture of sodium and chlorine would still burn and still poison; salt does neither.")}
      </p>

      <H3>{tx(t, "chMat_proustTitle", "A compound always has the same composition")}</H3>
      <p>
        {tx(t, "chMat_proustBody",
          "Around 1799 Joseph Proust noticed that copper carbonate had exactly the same proportion of copper, carbon and oxygen whether he made it in the lab or dug it out of the ground. This is the law of definite proportions: a given compound always contains its elements in the same proportion by mass. It follows directly from the particle picture: if every molecule of water is H₂O, every sample has the same share of hydrogen. You can compute that share from the masses of the atoms (the next two chapters explain where these numbers come from: a hydrogen atom has a mass of 1.008 u and an oxygen atom 16.00 u, with u a tiny unit of mass).")}
      </p>
      <Derivation t={t} label={tx(t, "chMat_eqPct", "Hydrogen's share of the mass of water")}
        steps={[
          { tex: r`\%\,\text{H} = \frac{\text{mass of H in one molecule}}{\text{mass of one molecule}} \times 100\%` },
          { tex: r`= \frac{2 \times 1.008}{2 \times 1.008 + 16.00} \times 100\%`, why: tx(t, "chMat_p1", "one molecule has 2 H atoms (1.008 u each) and 1 O atom (16.00 u)") },
          { tex: r`= \frac{2.016}{18.016} \times 100\%`, why: tx(t, "chMat_p2", "add up the mass of the whole molecule") },
          { tex: r`= \green{11.19\%}`, why: tx(t, "chMat_p3", "the same for every sample of pure water: 100 g of water always holds 11.19 g of hydrogen") },
        ]} />

      <H2>{tx(t, "chMat_sepTitle", "Separating mixtures")}</H2>
      <p>
        {tx(t, "chMat_sepBody",
          "Because the substances in a mixture keep their own properties, a mixture can be pulled apart by physical means: you only need one property in which the parts differ. A compound cannot be separated this way; breaking it into elements takes a chemical reaction. Each method below exploits one difference.")}
      </p>
      <LessonTable
        headers={[tx(t, "chMat_tMethod", "Method"), tx(t, "chMat_tUses", "Uses the difference in…"), tx(t, "chMat_tSep", "Separates, for example")]}
        rows={[
          [tx(t, "chMat_m1", "filtration"), tx(t, "chMat_m1u", "particle size: a solid stays on the paper, the liquid passes"), tx(t, "chMat_m1e", "sand from water, coffee grounds from coffee")],
          [tx(t, "chMat_m2", "evaporation"), tx(t, "chMat_m2u", "volatility: the liquid leaves as vapour, the solid stays"), tx(t, "chMat_m2e", "salt from sea water")],
          [tx(t, "chMat_m3", "distillation"), tx(t, "chMat_m3u", "boiling point: boil, then cool the vapour back into a liquid"), tx(t, "chMat_m3e", "pure water from sea water, alcohol from wine")],
          [tx(t, "chMat_m4", "chromatography"), tx(t, "chMat_m4u", "how strongly each substance sticks to a surface as a solvent carries it along"), tx(t, "chMat_m4e", "the dyes in a black ink")],
          [tx(t, "chMat_m5", "decanting, centrifuging"), tx(t, "chMat_m5u", "density: the heavier part settles"), tx(t, "chMat_m5e", "oil from water, blood cells from plasma")],
          [tx(t, "chMat_m6", "magnet"), tx(t, "chMat_m6u", "magnetism"), tx(t, "chMat_m6e", "iron filings from sulfur powder")],
        ]}
      />

      <H2>{tx(t, "chMat_changeTitle", "Physical and chemical changes")}</H2>
      <p>
        {tx(t, "chMat_changeBody",
          "In a physical change the substances stay the same; only their form or state changes. Ice melting, sugar dissolving, glass breaking: the water is still H₂O, the sugar molecules are still sugar molecules, now spread through the water. In a chemical change, also called a chemical reaction, new substances are made: the atoms let go of their old partners and join into new combinations. When hydrogen burns in oxygen, H₂ and O₂ molecules disappear and H₂O molecules appear.")}
      </p>
      <p>
        {tx(t, "chMat_propBody",
          "Properties come in the same two kinds. A physical property can be measured without changing the substance: colour, density, melting point, hardness. A chemical property describes how a substance changes into others: iron rusts in damp air, methane burns, gold does not react with acids. To observe a chemical property you have to use some of the substance up.")}
      </p>
      <LessonTable
        headers={[tx(t, "chMat_tSign", "Sign that a reaction may have happened"), tx(t, "chMat_tSignEx", "Example")]}
        rows={[
          [tx(t, "chMat_g1", "a gas appears (bubbles) that was not there"), tx(t, "chMat_g1e", "baking soda and vinegar fizz: carbon dioxide")],
          [tx(t, "chMat_g2", "a new colour"), tx(t, "chMat_g2e", "a cut apple browns, copper roofs turn green")],
          [tx(t, "chMat_g3", "a solid forms in a clear liquid (a precipitate)"), tx(t, "chMat_g3e", "limewater turns milky with your breath")],
          [tx(t, "chMat_g4", "heat or light given out (or taken in)"), tx(t, "chMat_g4e", "a candle flame, a cold pack")],
          [tx(t, "chMat_g5", "a new smell"), tx(t, "chMat_g5e", "milk going sour")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "chMat_signWarn", "These signs are clues, not proof. Boiling water makes bubbles and is only a physical change; dissolving some salts in water makes it cold. The test is always the same question: are there new substances, made of the same atoms in new combinations?")}
      </Callout>

      <H2>{tx(t, "chMat_consTitle", "Mass is conserved")}</H2>
      <p>
        {tx(t, "chMat_consBody",
          "Burn a log and only a little ash is left; leave an iron nail to rust and it gets heavier. For centuries this looked as if reactions could create or destroy matter. In the 1770s and 1780s Antoine Lavoisier weighed reactions inside sealed vessels, so no gas could escape or get in, and found that the total mass before and after was always the same. The log's missing mass leaves as carbon dioxide and water vapour; the nail's extra mass is oxygen taken from the air. This is the law of conservation of mass.")}
      </p>
      <Equation label={tx(t, "chMat_eqCons", "Conservation of mass in a reaction")}
        where={[
          [r`m_{\text{reactants}}`, tx(t, "chMat_wReact", "the total mass of the substances you start with (the reactants)")],
          [r`m_{\text{products}}`, tx(t, "chMat_wProd", "the total mass of the substances that form (the products)")],
        ]}
        words={tx(t, "chMat_consWords", "In a closed container, the mass after a reaction equals the mass before it.")}
        note={tx(t, "chMat_consNote", "The particle picture explains why: a reaction only rearranges atoms, and every atom has its own fixed mass. The same atoms, counted before and after, weigh the same. (Strictly, a reaction that gives out energy loses a tiny mass, E = mc², but for chemical energies it is around a billionth of the total and no balance can see it.)")}>
        {r`m_{\text{reactants}} = m_{\text{products}}`}
      </Equation>
      <p>
        {tx(t, "chMat_consEx",
          "Example: 12.0 g of carbon burns completely in oxygen and makes 44.0 g of carbon dioxide. How much oxygen was used? Mass is conserved, so 12.0 g + m(oxygen) = 44.0 g, and m(oxygen) = 32.0 g. The practice round below lets you check the particle version: in every change the atoms counted under the two boxes are the same.")}
      </p>
      <ParticlePracticeFigure t={t} />

      <H2>{tx(t, "chMat_densTitle", "Density: a fingerprint of a material")}</H2>
      <p>
        {tx(t, "chMat_densBody",
          "A kilogram of feathers and a kilogram of lead have the same mass, but very different volumes. Density measures how much mass is packed into each unit of volume. It does not depend on how much of the material you have: a gold ring and a gold bar have the same density. That makes it one of the easiest physical properties for identifying a substance.")}
      </p>
      <Equation label={tx(t, "chMat_eqDens", "Density")}
        where={[
          [r`\rho`, tx(t, "chMat_wRho", "the density (the Greek letter rho), in g/cm³ or kg/m³")],
          [r`m`, tx(t, "chMat_wM", "the mass of the sample, in grams")],
          [r`V`, tx(t, "chMat_wV", "the volume it takes up, in cm³ (the same as mL)")],
        ]}
        words={tx(t, "chMat_densWords", "Density is mass divided by volume.")}
        note={tx(t, "chMat_densNote", "1 cm³ = 1 mL, so 1 g/cm³ = 1 g/mL = 1 kg/L = 1000 kg/m³. Water at 4 °C is the reference: 1.000 g/cm³. Anything denser sinks in water; anything less dense floats.")}>
        {r`\rho = \frac{m}{V}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "chMat_tMat", "Material"), tx(t, "chMat_tRho", "Density (g/cm³, about 20 °C)")]}
        rows={[
          [tx(t, "chMat_d1", "air (at sea level)"), "0.0012"],
          [tx(t, "chMat_d2", "cork"), "0.24"],
          [tx(t, "chMat_d3", "olive oil"), "0.92"],
          [tx(t, "chMat_d4", "water"), "1.00"],
          [tx(t, "chMat_d5", "aluminium"), "2.70"],
          [tx(t, "chMat_d6", "iron"), "7.87"],
          [tx(t, "chMat_d7", "lead"), "11.34"],
          [tx(t, "chMat_d8", "gold"), "19.32"],
        ]}
      />
      <LiveFormula label={tx(t, "chMat_liveDens", "Try it: density of a sample")}
        tex={r`\rho = \frac{m}{V}`}
        vars={[
          { id: "m", label: "m (g)", min: 1, max: 200, step: 0.5, value: 54, fmt: v => num(v, 1) },
          { id: "V", label: "V (cm³)", min: 1, max: 100, step: 0.5, value: 20, fmt: v => num(v, 1) },
        ]}
        compute={densityNumbers}
        note={tx(t, "chMat_liveDensNote", "It starts at 54 g in 20 cm³: 2.70 g/cm³, aluminium. Double both mass and volume and the density does not move: it belongs to the material, not to the amount.")} />
      <p>
        {tx(t, "chMat_archBody",
          "Measuring a mass is easy: put it on a balance. A cube's volume is side × side × side, but most objects are not cubes. The trick, credited to Archimedes, is to lower the object into water in a measuring cylinder: a solid pushes aside exactly its own volume of water, so the water level rises by the object's volume. In the lab below, two nuggets of the same size and colour turn out to be very different materials.")}
      </p>
      <DensityLabFigure t={t} />
      <Callout type="info" t={t}>
        {tx(t, "chMat_tempTip", "Density changes a little with temperature, because most things expand when warmed: the same mass takes more volume. Water is the famous exception between 0 and 4 °C, and ice (0.917 g/cm³) is less dense than liquid water, which is why ice floats and lakes freeze from the top down.")}
      </Callout>

      <H2>{tx(t, "chMat_unitsTitle", "The units on a chemist's bench")}</H2>
      <p>
        {tx(t, "chMat_unitsBody",
          "Chemistry uses the SI units from Physics, \"Units, Dimensions & Measurement\", where converting units and significant figures are explained. Three habits are worth adding. Volumes are usually in litres and millilitres: 1 L = 1000 mL = 1000 cm³ = 1 dm³. Masses are usually in grams, because laboratory amounts are small. And temperatures are measured in degrees Celsius but used in formulas in kelvin, the scale that starts at absolute zero.")}
      </p>
      <Equation label={tx(t, "chMat_eqK", "Celsius to kelvin")}
        where={[
          [r`T`, tx(t, "chMat_wT", "the temperature in kelvin (K), always positive")],
          [r`\theta`, tx(t, "chMat_wTheta", "the same temperature in degrees Celsius (°C)")],
        ]}
        note={tx(t, "chMat_kNote", "A step of 1 K is the same size as a step of 1 °C; only the starting point differs. 25 °C, the usual \"room temperature\" of chemistry tables, is 298.15 K.")}>
        {r`T = \theta + 273.15`}
      </Equation>

      <H2>{tx(t, "chMat_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chMat_ex1", "1. Classify: (a) steam, (b) air, (c) mercury, (d) muddy water. Steam is water, a compound, in the gas state. Air is a homogeneous mixture of mainly N₂ and O₂. Mercury is an element. Muddy water is a heterogeneous mixture: the mud settles if you wait.")}</p>
      <p>{tx(t, "chMat_ex2", "2. Physical or chemical? Dissolving sugar in tea is physical: evaporate the water and the sugar is still there. Toasting bread is chemical: new brown, flavourful substances form and you cannot get the untoasted bread back.")}</p>
      <p>{tx(t, "chMat_ex3", "3. A metal block of 5.00 cm × 4.00 cm × 2.00 cm has a mass of 316 g. V = 40.0 cm³, so ρ = 316 / 40.0 = 7.90 g/cm³: iron (7.87) fits within the precision of the measurement.")}</p>
      <H3>{tx(t, "chMat_ex4Title", "Mass that seems to vanish")}</H3>
      <p>{tx(t, "chMat_ex4", "4. A 100.0 g piece of steel wool burns in an open dish, and the black product weighs 140 g. Mass was not created: the iron combined with 40 g of oxygen from the air. Burned in a sealed flask full of oxygen, the flask would weigh exactly the same before and after.")}</p>

      <H2>{tx(t, "chMat_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chMat_tWrong", "Wrong"), tx(t, "chMat_tRight", "Right"), tx(t, "chMat_tWhy", "Why")]}
        rows={[
          [tx(t, "chMat_x1w", "O₂ is a compound because it has two atoms"), tx(t, "chMat_x1r", "O₂ is an element"), tx(t, "chMat_x1", "a compound needs two different elements; O₂ has only oxygen")],
          [tx(t, "chMat_x2w", "salt water is a compound"), tx(t, "chMat_x2r", "it is a homogeneous mixture"), tx(t, "chMat_x2", "the proportion of salt can vary, and evaporation separates them")],
          [tx(t, "chMat_x3w", "melting is a chemical change"), tx(t, "chMat_x3r", "a change of state is physical"), tx(t, "chMat_x3", "the molecules are the same before and after")],
          [tx(t, "chMat_x4w", "burning destroys matter"), tx(t, "chMat_x4r", "the products are mostly gases"), tx(t, "chMat_x4", "weighed in a closed container, nothing is lost")],
          [tx(t, "chMat_x5w", "a big object is denser"), tx(t, "chMat_x5r", "density does not depend on size"), tx(t, "chMat_x5", "double the mass and the volume doubles too")],
        ]}
      />

      <KeyIdeas t={t} id="chMat" items={[
        "All matter is made of atoms of 118 elements, often joined into molecules.",
        "Solids, liquids and gases differ in how their particles are arranged and move, not in what the particles are.",
        "Elements have one kind of atom; compounds have two or more elements in a fixed ratio; mixtures have varying proportions and can be separated by physical means.",
        "A physical change keeps the substances; a chemical change makes new substances from the same atoms.",
        "Mass is conserved in every reaction, because atoms are only rearranged.",
        "Density ρ = m/V is a property of the material, useful to identify it; volume can be measured by water displacement.",
      ]} />
    </Article>
  );
}

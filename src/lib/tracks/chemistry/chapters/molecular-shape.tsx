"use client";

// Bonding 4: VSEPR. Electron domains counted from the Lewis structure; the
// five domain geometries and their angles (109.47° derived from a cube);
// lone pairs and the molecular shapes (AXₘEₙ table, angle squeeze, equatorial
// lone pairs, multiple bonds as bigger domains); molecules with several
// centres; dipole moments (μ = qd, debye; HCl's percent ionic character from
// its dipole) and molecular polarity as a vector sum; why water's shape
// matters. Hybrid orbitals, which explain the shapes in orbital terms, are the
// next section's first chapter (hybridization-mo).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { VseprFigure } from "@/components/lesson/figures/chemistry/VseprFigure";
import { PolarityFigure } from "@/components/lesson/figures/chemistry/PolarityFigure";
import { ShapePracticeFigure } from "@/components/lesson/figures/chemistry/ShapePracticeFigure";

const r = String.raw;

export function MolecularShapeContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "chShp_intro",
          "Carbon dioxide and water have the same kind of formula, one atom with two partners, and both have polar bonds. Yet carbon dioxide is a gas that never dissolves much in anything, and water is a liquid that dissolves salt, sugar and half of chemistry. The difference is shape: CO₂ is a straight line, water is bent. A Lewis structure says which atoms are joined, but not how they sit in space. This chapter adds the third dimension with one simple idea, electron pairs keep as far apart as they can, and then uses the shape to decide whether a molecule is polar.")}
      </Lead>

      <Goals t={t} id="chShp" items={[
        "Count the electron domains around a central atom from its Lewis structure.",
        "Name the domain geometry and the molecular shape for two to six domains, with or without lone pairs.",
        "Explain why lone pairs squeeze bond angles, and derive the tetrahedral angle.",
        "Compute a dipole moment and decide whether a molecule is polar from its shape.",
      ]} />

      <H2>{tx(t, "chShp_domTitle", "Electron domains")}</H2>
      <p>
        {tx(t, "chShp_domBody",
          "The valence shell electron pair repulsion model, VSEPR for short (often said \"vesper\"), was set out by Ronald Gillespie and Ronald Nyholm in 1957. Its idea: the groups of electrons around a central atom are all negative, so they repel each other and arrange themselves as far apart as possible. Each group is called an electron domain, and there are two kinds: a bond to another atom, and a lone pair. A double or triple bond counts as one domain, because all its electrons sit between the same two atoms, in the same direction.")}
      </p>
      <LessonTable
        headers={[tx(t, "chShp_tMol", "Molecule"), tx(t, "chShp_tLewis", "Around the central atom"), tx(t, "chShp_tDom", "Domains")]}
        rows={[
          ["CO₂", tx(t, "chShp_d1", "two double bonds"), "2"],
          ["BF₃", tx(t, "chShp_d2", "three single bonds"), "3"],
          ["H₂O", tx(t, "chShp_d3", "two single bonds, two lone pairs"), "4"],
          ["HCN", tx(t, "chShp_d4", "one single and one triple bond"), "2"],
          ["SF₄", tx(t, "chShp_d5", "four single bonds, one lone pair"), "5"],
        ]}
      />

      <H2>{tx(t, "chShp_geomTitle", "The five arrangements")}</H2>
      <p>
        {tx(t, "chShp_geomBody",
          "Ask how to spread n points over a sphere so they are as far apart as possible, and five answers cover almost all of chemistry. These are the electron-domain geometries.")}
      </p>
      <LessonTable
        headers={[tx(t, "chShp_tN", "Domains"), tx(t, "chShp_tGeom", "Geometry"), tx(t, "chShp_tAngles", "Angles"), tx(t, "chShp_tEx", "Example")]}
        rows={[
          ["2", tx(t, "chShp_g2", "linear"), "180°", "CO₂, BeCl₂"],
          ["3", tx(t, "chShp_g3", "trigonal planar (a flat triangle)"), "120°", "BF₃, SO₃"],
          ["4", tx(t, "chShp_g4", "tetrahedral (a pyramid on a triangular base)"), "109.5°", "CH₄, CCl₄"],
          ["5", tx(t, "chShp_g5", "trigonal bipyramidal (a triangle plus one above and one below)"), tx(t, "chShp_g5a", "120° around the middle, 90° up and down"), "PCl₅"],
          ["6", tx(t, "chShp_g6", "octahedral (along ±x, ±y, ±z)"), "90°", "SF₆"],
        ]}
      />
      <H3>{tx(t, "chShp_tetraTitle", "Where 109.5° comes from")}</H3>
      <p>
        {tx(t, "chShp_tetraBody",
          "Two domains on a line and three in a triangle are easy to picture. The tetrahedral angle needs a trick: put the central atom at the centre of a cube and the four domains toward four corners, no two of them sharing an edge. The angle between two directions follows from the dot product of their vectors, a · b = |a| |b| cos θ.")}
      </p>
      <Derivation t={t} label={tx(t, "chShp_eqTetra", "The tetrahedral angle")}
        steps={[
          { tex: r`\mathbf{a} = (1, 1, 1), \quad \mathbf{b} = (1, -1, -1)`, why: tx(t, "chShp_t1", "two of the four corners (the others are (−1, 1, −1) and (−1, −1, 1)); the cube's centre is the origin") },
          { tex: r`\mathbf{a} \cdot \mathbf{b} = 1 \cdot 1 + 1 \cdot (-1) + 1 \cdot (-1) = -1`, why: tx(t, "chShp_t2", "the dot product: multiply matching components and add") },
          { tex: r`|\mathbf{a}| = |\mathbf{b}| = \sqrt{1 + 1 + 1} = \sqrt{3}`, why: tx(t, "chShp_t3", "both reach a corner of the same cube") },
          { tex: r`\cos\theta = \frac{\mathbf{a} \cdot \mathbf{b}}{|\mathbf{a}|\,|\mathbf{b}|} = \frac{-1}{3}`, why: tx(t, "chShp_t4", "the dot product divided by the two lengths") },
          { tex: r`\theta = \arccos\left(-\tfrac13\right) = \amber{109.47^\circ}`, why: tx(t, "chShp_t5", "the same for every pair of the four, so all six angles are equal") },
        ]} />
      <p>
        {tx(t, "chShp_simBody",
          "Below, the domains really do push each other apart. Start them in random directions and press play: they always end in the same arrangement for the same number of domains.")}
      </p>
      <VseprFigure t={t} />

      <H2>{tx(t, "chShp_lpTitle", "Lone pairs change the shape")}</H2>
      <p>
        {tx(t, "chShp_lpBody",
          "Lone pairs count when arranging the domains, but they are invisible when we look at where the atoms are, and the name of a molecule's shape describes the atoms only. Ammonia has four domains in a tetrahedron, one of them a lone pair, so its atoms form a trigonal pyramid: nitrogen at the top, three hydrogens below. Water has two lone pairs and two bonds: its atoms form a bent line. Chemists label each case AXₘEₙ: A is the central atom, X a bonded atom (m of them) and E a lone pair (n of them).")}
      </p>
      <LessonTable
        headers={[tx(t, "chShp_tTotal", "Domains"), "AXₘEₙ", tx(t, "chShp_tShape", "Shape"), tx(t, "chShp_tEx2", "Example, angle")]}
        rows={[
          ["3", "AX₂E", tx(t, "chShp_s1", "bent"), "SO₂, 119°"],
          ["4", "AX₃E", tx(t, "chShp_s2", "trigonal pyramidal"), "NH₃, 106.8°"],
          ["4", "AX₂E₂", tx(t, "chShp_s3", "bent"), "H₂O, 104.5°"],
          ["5", "AX₄E", tx(t, "chShp_s4", "seesaw"), "SF₄, 102° and 173°"],
          ["5", "AX₃E₂", tx(t, "chShp_s5", "T-shaped"), "ClF₃, 87.5°"],
          ["5", "AX₂E₃", tx(t, "chShp_s6", "linear"), "XeF₂, 180°"],
          ["6", "AX₅E", tx(t, "chShp_s7", "square pyramidal"), "BrF₅, 85°"],
          ["6", "AX₄E₂", tx(t, "chShp_s8", "square planar"), "XeF₄, 90°"],
        ]}
      />
      <p>
        {tx(t, "chShp_squeezeBody",
          "The angles are not quite the ideal ones. A bonding pair is pulled out between two nuclei; a lone pair belongs to the central atom alone, sits closer to it and spreads wider. So lone pairs push harder than bonds, in the order lone pair–lone pair > lone pair–bond > bond–bond. Every lone pair squeezes the bonds together: 109.5° in CH₄, 106.8° in NH₃, 104.5° in H₂O. For five domains there are two kinds of seat: three around the middle (equatorial) with two neighbours at 90°, and two at the top and bottom (axial) with three neighbours at 90°. Lone pairs always take equatorial seats, which is why SF₄ is a seesaw, ClF₃ a T and XeF₂ a straight line. For six domains, two lone pairs go opposite each other: XeF₄ is a flat square.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "chShp_multiTip", "A double bond holds four electrons in one domain, so it also pushes a little harder than a single bond. In formaldehyde, H₂C=O, the domains are trigonal planar, but the H–C–H angle is 116°, not 120°: the C=O domain squeezes it.")}
      </Callout>

      <H3>{tx(t, "chShp_multiCenterTitle", "Molecules with more than one centre")}</H3>
      <p>
        {tx(t, "chShp_multiCenterBody",
          "Larger molecules have several central atoms; apply VSEPR to each in turn. In methanol, CH₃OH, carbon has four bonds (tetrahedral) and oxygen has two bonds and two lone pairs (bent, about 108°). In ethene, H₂C=CH₂, each carbon has three domains, so all six atoms lie in one plane with angles near 120°. In ethyne, HC≡CH, each carbon has two domains and the molecule is a straight line. Chains of tetrahedral carbons zigzag, which is why fats and plastics are long, kinked molecules rather than straight rods.")}
      </p>

      <H2>{tx(t, "chShp_dipoleTitle", "Dipole moments")}</H2>
      <p>
        {tx(t, "chShp_dipoleBody",
          "The previous chapter met polar bonds: partial charges δ+ and δ− on the two atoms. Their strength is measured by the dipole moment, the size of the separated charge times the distance between the charges. It can be measured directly, from how molecules line up in an electric field.")}
      </p>
      <Equation label={tx(t, "chShp_eqMu", "Dipole moment")}
        where={[
          [r`\mu`, tx(t, "chShp_wMu", "the dipole moment (Greek mu), a vector pointing from + to − in chemistry")],
          [r`q`, tx(t, "chShp_wQ", "the size of the separated charge (C)")],
          [r`d`, tx(t, "chShp_wD", "the distance between the charges (m)")],
          [r`\text{D}`, tx(t, "chShp_wDebye", "the debye, the chemists' unit: 1 D = 3.336 × 10⁻³⁰ C·m, named after Peter Debye")],
        ]}
        words={tx(t, "chShp_muWords", "The bigger the charges and the farther apart, the bigger the dipole.")}>
        {r`\mu = q\, d`}
      </Equation>
      <Derivation t={t} label={tx(t, "chShp_eqHcl", "How ionic is H–Cl?")}
        steps={[
          { tex: r`d = 127\ \text{pm} = 1.27 \times 10^{-10}\ \text{m}`, why: tx(t, "chShp_h1", "the measured H–Cl bond length") },
          { tex: r`\mu_{\text{ionic}} = e\,d = 1.602 \times 10^{-19} \times 1.27 \times 10^{-10} = 2.03 \times 10^{-29}\ \text{C·m}`, why: tx(t, "chShp_h2", "the dipole if a whole electron had moved: H⁺ Cl⁻") },
          { tex: r`\mu_{\text{ionic}} = \frac{2.03 \times 10^{-29}}{3.336 \times 10^{-30}} = 6.10\ \text{D}`, why: tx(t, "chShp_h3", "in debye") },
          { tex: r`\frac{\mu_{\text{measured}}}{\mu_{\text{ionic}}} = \frac{1.11}{6.10} = \green{0.18}`, why: tx(t, "chShp_h4", "the measured dipole is 18% of the fully ionic one, close to Pauling's estimate of 21%") },
        ]} />

      <H2>{tx(t, "chShp_polarTitle", "Polar and nonpolar molecules")}</H2>
      <p>
        {tx(t, "chShp_polarBody",
          "A molecule with several polar bonds has several bond dipoles, and since dipoles are vectors (they have a size and a direction) they add like arrows. If the shape is symmetric and the outer atoms are all the same, the arrows cancel and the molecule is nonpolar, even though every bond is polar. CO₂ is the classic case: two strong C=O dipoles, pointing in opposite directions, sum to zero. Water's two O–H dipoles point down at 104.5° to each other and add up to a large dipole, 1.85 D. Turn the molecules and try the break-it switch.")}
      </p>
      <PolarityFigure t={t} />
      <LessonTable
        headers={[tx(t, "chShp_tMol2", "Molecule"), tx(t, "chShp_tShape2", "Shape"), tx(t, "chShp_tMu", "Dipole moment (D)"), tx(t, "chShp_tVerdict", "Polar?")]}
        rows={[
          ["CO₂", tx(t, "chShp_s1l", "linear"), "0", tx(t, "chShp_no", "no")],
          ["H₂O", tx(t, "chShp_s3", "bent"), "1.85", tx(t, "chShp_yes", "yes")],
          ["NH₃", tx(t, "chShp_s2", "trigonal pyramidal"), "1.47", tx(t, "chShp_yes", "yes")],
          ["BF₃", tx(t, "chShp_g3s", "trigonal planar"), "0", tx(t, "chShp_no", "no")],
          ["CCl₄", tx(t, "chShp_g4s", "tetrahedral"), "0", tx(t, "chShp_no", "no")],
          ["CHCl₃", tx(t, "chShp_g4s", "tetrahedral"), "1.04", tx(t, "chShp_yes", "yes")],
          ["HCN", tx(t, "chShp_s1l", "linear"), "2.98", tx(t, "chShp_yes", "yes")],
        ]}
      />
      <H3>{tx(t, "chShp_whyTitle", "Why shape matters")}</H3>
      <p>
        {tx(t, "chShp_whyBody",
          "Polar molecules attract each other, the δ+ end of one toward the δ− end of the next. That is why water, with a mass of only 18 u, boils at 100 °C while methane (16 u, nonpolar) boils at −162 °C. It is why water dissolves salt: its δ− oxygens crowd around each Na⁺ and its δ+ hydrogens around each Cl⁻, and the attraction pays for pulling the lattice apart. It is even why a microwave oven heats food: the oven's field flips back and forth billions of times a second, and the polar water molecules turn with it and jostle their neighbours. Had water been straight like CO₂, none of this would happen, and life as we know it would not exist. The forces between molecules are the subject of the next section.")}
      </p>
      <ShapePracticeFigure t={t} />

      <H2>{tx(t, "chShp_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "chShp_ex1", "1. SF₄: 6 + 4 × 7 = 34 electrons. Four S–F bonds use 8, three lone pairs on each F use 24, and the last 2 make a lone pair on sulfur. Five domains (AX₄E): the lone pair takes an equatorial seat, so SF₄ is a seesaw, and polar.")}</p>
      <p>{tx(t, "chShp_ex2", "2. XeF₄: 8 + 4 × 7 = 36 electrons. Four bonds (8) and the fluorines' lone pairs (24) leave 4: two lone pairs on xenon. Six domains with the lone pairs opposite each other: square planar, and nonpolar, since the four Xe–F dipoles cancel in pairs.")}</p>
      <p>{tx(t, "chShp_ex3", "3. CO₂ and SO₂ both have the formula AB₂. Carbon has two double bonds and no lone pair: linear, nonpolar. Sulfur has the two bonds plus one lone pair: bent (119°), polar, 1.63 D.")}</p>
      <p>{tx(t, "chShp_ex4", "4. Is dichloromethane, CH₂Cl₂, polar? Its carbon is tetrahedral, but two corners are H and two are Cl, so the bond dipoles cannot cancel: polar, 1.60 D.")}</p>

      <H2>{tx(t, "chShp_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "chShp_tWrong", "Wrong"), tx(t, "chShp_tRight", "Right"), tx(t, "chShp_tWhy", "Why")]}
        rows={[
          [tx(t, "chShp_x1w", "water is linear, like CO₂"), tx(t, "chShp_x1r", "water is bent"), tx(t, "chShp_x1", "oxygen's two lone pairs are domains too: four in all")],
          [tx(t, "chShp_x2w", "a double bond counts as two domains"), tx(t, "chShp_x2r", "it counts as one"), tx(t, "chShp_x2", "all its electrons point the same way, to the same atom")],
          [tx(t, "chShp_x3w", "NH₃ is tetrahedral"), tx(t, "chShp_x3r", "its domains are; its shape is trigonal pyramidal"), tx(t, "chShp_x3", "the shape names only the positions of atoms")],
          [tx(t, "chShp_x4w", "polar bonds make a polar molecule"), tx(t, "chShp_x4r", "only if their dipoles do not cancel"), tx(t, "chShp_x4", "CO₂ and CCl₄ have polar bonds and no dipole")],
          [tx(t, "chShp_x5w", "lone pairs in SF₄ sit at the top"), tx(t, "chShp_x5r", "they take an equatorial seat"), tx(t, "chShp_x5", "there they have only two neighbours at 90°")],
        ]}
      />

      <KeyIdeas t={t} id="chShp" items={[
        "VSEPR: electron domains (bonds of any order, and lone pairs) around a central atom get as far apart as possible.",
        "2, 3, 4, 5, 6 domains: linear 180°, trigonal planar 120°, tetrahedral 109.5°, trigonal bipyramidal 90°/120°, octahedral 90°.",
        "The tetrahedral angle is arccos(−1/3) = 109.47°, from two corners of a cube.",
        "The shape is named by the atoms only; lone pairs make bent, pyramidal, seesaw, T-shaped and square shapes.",
        "Lone pairs push harder than bonds: they squeeze bond angles and take equatorial seats in trigonal bipyramids.",
        "Dipole moment μ = q d, in debye; bond dipoles add as vectors.",
        "Symmetric shapes with identical outer atoms are nonpolar; otherwise the molecule is polar, and that changes how it boils, dissolves and heats.",
      ]} />
    </Article>
  );
}

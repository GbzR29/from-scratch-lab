"use client";

// Electricity 1: electric charge and the electric field — the two kinds of
// charge, quantisation and conservation, conductors and insulators, charging
// by friction and polarisation; Coulomb's law and its strength next to
// gravity; superposition; the field E = F/q, the field of a point charge,
// field lines, the dipole; flux and Gauss's law derived for a point charge,
// the fields of a plane and of two plates; conductors, shielding, sharp points.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { FieldLinesFigure } from "@/components/lesson/figures/physics/FieldLinesFigure";
import { GaussFigure } from "@/components/lesson/figures/physics/GaussFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Coulomb's law with charges in µC and the distance in cm. */
const coulombNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const F = (8.99e9 * v.q1 * 1e-6 * v.q2 * 1e-6) / (v.d / 100) ** 2;
  const kind = v.q1 * v.q2 > 0 ? tx(t, "phChg_liveRepel", "repel") : tx(t, "phChg_liveAttract", "attract");
  return {
    tex: r`F = \frac{8.99\times10^{9} \cdot ${num(Math.abs(v.q1), 1)}\times10^{-6} \cdot ${num(Math.abs(v.q2), 1)}\times10^{-6}}{(${num(v.d / 100, 2)})^2} = \amber{${num(F, F < 1 ? 3 : 1)}\ \text{N}}`,
    meter: Math.min(1, F / 50), meterLabel: `${kind} · ${tx(t, "phChg_liveWeight", "the weight of")} ${num(F / 9.81, F / 9.81 < 1 ? 3 : 1)} kg`,
  };
};

export function ElectricChargeFieldContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phChg_intro",
          "Rub a balloon on your hair and it sticks to the wall. Walk across a carpet and a spark jumps from your finger to a door handle. A thundercloud does the same thing with a billion times more charge. These are everyday glimpses of the electric force, the force that holds every atom together, bonds atoms into molecules, and makes a table push back on your hand. This chapter starts from the charges themselves, finds the law of the force between them, and then introduces the idea that makes the rest of electricity and magnetism work: the field.")}
      </Lead>

      <Goals t={t} id="phChg" items={[
        "Describe electric charge: its two kinds, its smallest unit, and why it is conserved.",
        "Use Coulomb's law and superposition to find the force between charges.",
        "Explain the electric field, read field lines, and find the field of a point charge.",
        "Use Gauss's law for symmetric charges, and explain why the field inside a conductor is zero.",
      ]} />

      <H2>{tx(t, "phChg_chargeTitle", "Electric charge")}</H2>
      <p>
        {tx(t, "phChg_chargeBody",
          "Experiments with rubbed amber and glass showed long ago that there are two kinds of electric charge. Benjamin Franklin named them positive and negative. Charges of the same kind repel each other; opposite charges attract. We now know where they come from: atoms are made of a tiny, positive nucleus of protons and neutrons, surrounded by negative electrons. A proton and an electron carry exactly the same amount of charge with opposite signs, so an atom with as many electrons as protons is neutral.")}
      </p>
      <LessonTable
        headers={[tx(t, "phChg_tFact", "Fact"), tx(t, "phChg_tMeans", "What it means")]}
        rows={[
          [tx(t, "phChg_f1", "the unit is the coulomb (C)"), tx(t, "phChg_f1m", "the charge carried in one second by a current of one ampere (next chapters)")],
          [tx(t, "phChg_f2", "charge comes in whole steps of e"), tx(t, "phChg_f2m", "e = 1.602 × 10⁻¹⁹ C, the charge of a proton; an electron has −e. One coulomb is 6.24 × 10¹⁸ electrons")],
          [tx(t, "phChg_f3", "charge is conserved"), tx(t, "phChg_f3m", "it is never created or destroyed, only moved; rubbing a balloon moves electrons from hair to balloon")],
          [tx(t, "phChg_f4", "conductors and insulators"), tx(t, "phChg_f4m", "in metals some electrons move freely; in glass, plastic and dry air they stay bound to their atoms")],
        ]}
      />
      <p>
        {tx(t, "phChg_polBody",
          "Why does a charged balloon stick to a neutral wall? Its negative charge pushes the electrons in the wall's molecules slightly away and pulls their nuclei slightly closer. Each molecule becomes polarised: its near side a little positive, its far side a little negative. The near side is closer, so the attraction beats the repulsion, and the balloon is pulled in. The same effect lets a charged comb pick up scraps of paper.")}
      </p>

      <H2>{tx(t, "phChg_coulombTitle", "Coulomb's law")}</H2>
      <p>
        {tx(t, "phChg_coulombBody",
          "In 1785 Charles-Augustin de Coulomb measured the force between small charged spheres with a torsion balance, a thin wire twisted by the force. He found that it grows in proportion to each charge and falls with the square of the distance, exactly like Newton's gravity, except that it can repel as well as attract.")}
      </p>
      <Equation label={tx(t, "phChg_eqCoulomb", "Coulomb's law")}
        where={[
          [r`F`, tx(t, "phChg_wF", "the size of the force each charge feels (N); it acts along the line joining them")],
          [r`q_1,\ q_2`, tx(t, "phChg_wQ", "the two charges (C), with their signs: a positive product means repulsion, a negative one attraction")],
          [r`r`, tx(t, "phChg_wR", "the distance between the charges (m)")],
          [r`k`, tx(t, "phChg_wK", "Coulomb's constant, 8.99 × 10⁹ N·m²/C²")],
          [r`\varepsilon_0`, tx(t, "phChg_wEps", "the permittivity of free space, 8.854 × 10⁻¹² C²/(N·m²); k = 1/(4πε₀)")],
        ]}
        words={tx(t, "phChg_coulombWords", "Double either charge and the force doubles; double the distance and it falls to a quarter.")}
        note={tx(t, "phChg_coulombNote", "The 4π in k = 1/(4πε₀) looks odd here but makes later laws simpler, as Gauss's law will show. The 1/r² has the same origin as in gravity: the influence spreads over spheres whose area grows as r².")}>
        {r`F = k\,\frac{|q_1 q_2|}{r^2} = \frac{1}{4\pi\varepsilon_0}\,\frac{|q_1 q_2|}{r^2}`}
      </Equation>
      <LiveFormula label={tx(t, "phChg_liveCoulomb", "Try it: two small charged spheres")}
        tex={r`F = k\,\frac{q_1 q_2}{r^2}`}
        vars={[
          { id: "q1", label: "q₁ (µC)", min: -5, max: 5, step: 0.5, value: 1, fmt: v => `${num(v, 1)} µC` },
          { id: "q2", label: "q₂ (µC)", min: -5, max: 5, step: 0.5, value: 1, fmt: v => `${num(v, 1)} µC` },
          { id: "d", label: "r (cm)", min: 2, max: 50, step: 1, value: 10, fmt: v => `${num(v, 0)} cm` },
        ]}
        compute={coulombNumbers(t)}
        note={tx(t, "phChg_liveCoulombNote", "A microcoulomb (µC) is a millionth of a coulomb, about what a rubbed balloon carries. Two of them 10 cm apart push with almost 1 N, the weight of 90 g. A whole coulomb is enormous: two 1 C charges 1 m apart would push with 9 × 10⁹ N, the weight of about 600 000 cars.")} />
      <p>
        {tx(t, "phChg_strongBody",
          "The electric force is fantastically stronger than gravity. In a hydrogen atom the electron and proton attract electrically with 2.3 × 10³⁹ times the force of their gravity. Gravity rules the sky only because big things are almost perfectly neutral: their positive and negative charges cancel, while masses only add up.")}
      </p>
      <H3>{tx(t, "phChg_superTitle", "More than two charges: superposition")}</H3>
      <p>
        {tx(t, "phChg_superBody",
          "With many charges, each pair acts as if the others were not there, and the force on a charge is the vector sum of the forces from all the others. This principle of superposition sounds obvious, but it is a fact of nature, checked by experiment, and it is what lets us build the field of any arrangement of charges from the field of one.")}
      </p>

      <H2>{tx(t, "phChg_fieldTitle", "The electric field")}</H2>
      <p>
        {tx(t, "phChg_fieldBody",
          "How does one charge push another across empty space? Michael Faraday's answer was that every charge fills the space around it with an electric field, and a second charge feels the field where it sits. To measure the field at a point, place a small positive test charge q there and divide the force it feels by q. The result no longer depends on the test charge: it describes the space itself.")}
      </p>
      <Equation label={tx(t, "phChg_eqField", "The electric field")}
        where={[
          [r`\vec E`, tx(t, "phChg_wE", "the electric field (N/C, the same as V/m), a vector with a size and a direction at every point")],
          [r`\vec F`, tx(t, "phChg_wFt", "the force on a small test charge placed there (N)")],
          [r`q`, tx(t, "phChg_wQt", "the test charge (C)")],
          [r`Q`, tx(t, "phChg_wQs", "the charge that makes the field (C)")],
          [r`\hat r`, tx(t, "phChg_wRhat", "a unit arrow pointing from Q to the point")],
        ]}
        words={tx(t, "phChg_fieldWords", "The field is the force per unit charge. Around a single charge it points straight away from a positive one and straight in towards a negative one, and weakens as 1/r².")}
        note={tx(t, "phChg_fieldNote", "Once the field is known, the force on any charge is F = q E: positive charges are pushed along the field, negative ones against it. That is why an electron in a field accelerates the opposite way to the field arrows.")}>
        {r`\vec E = \frac{\vec F}{q}, \qquad \vec E_{point} = k\,\frac{Q}{r^2}\,\hat r`}
      </Equation>
      <p>
        {tx(t, "phChg_linesBody",
          "Faraday drew fields as field lines. They follow the direction of the field, start on positive charges and end on negative ones (or run off to infinity), never cross, and crowd together where the field is strong. The number of lines leaving a charge is drawn in proportion to its size.")}
      </p>
      <FieldLinesFigure t={t} />
      <LessonTable
        headers={[tx(t, "phChg_tWhere", "Where"), tx(t, "phChg_tE", "Field strength")]}
        rows={[
          [tx(t, "phChg_e1", "inside a copper wire carrying 10 A"), tx(t, "phChg_e1v", "0.07 V/m")],
          [tx(t, "phChg_e2", "the air on a fine day, near the ground"), "100–150 V/m"],
          [tx(t, "phChg_e3", "under a thundercloud"), tx(t, "phChg_e3v", "10 000–100 000 V/m")],
          [tx(t, "phChg_e4", "air breaks down: sparks and lightning"), tx(t, "phChg_e4v", "about 3 000 000 V/m")],
          [tx(t, "phChg_e5", "on the electron in a hydrogen atom"), "5 × 10¹¹ V/m"],
        ]}
      />
      <H3>{tx(t, "phChg_dipoleTitle", "The electric dipole")}</H3>
      <p>
        {tx(t, "phChg_dipoleBody",
          "A positive and a negative charge of the same size held a small distance d apart make a dipole. Its field lines loop from + to −, as in the figure. Many molecules are dipoles: in water the oxygen pulls the shared electrons towards itself, leaving its end slightly negative and the hydrogens slightly positive. Its strength is the dipole moment p = q d. In a uniform field the two ends are pushed opposite ways, so a dipole feels no net force but a twist that lines it up with the field. A microwave oven flips its field billions of times a second, so the water molecules in food keep twisting back and forth and their jostling heats the food.")}
      </p>

      <H2>{tx(t, "phChg_gaussTitle", "Gauss's law")}</H2>
      <p>
        {tx(t, "phChg_fluxBody",
          "Imagine the field as a flow and hold a small window in it. The amount of field passing through the window is its flux: the field times the window's area, counting only the part of the field that crosses the window square-on, Φ = E A cos θ, where θ is the angle between the field and the line perpendicular to the window. In terms of field lines, the flux counts the lines that cross. Now wrap a closed surface around a charge and add up the flux over the whole surface.")}
      </p>
      <Derivation t={t} label={tx(t, "phChg_eqGaussDer", "The flux around a point charge")}
        steps={[
          { tex: r`E = k\frac{q}{r^2}`, why: tx(t, "phChg_g1", "take a sphere of radius r centred on the charge: the field has this same size everywhere on it") },
          { tex: r`\theta = 0`, why: tx(t, "phChg_g2", "and it crosses the sphere square-on at every point, pointing straight out") },
          { tex: r`\Phi = E \cdot 4\pi r^2 = k\frac{q}{r^2}\, 4\pi r^2`, why: tx(t, "phChg_g3", "so the flux is the field times the sphere's whole area, 4πr²") },
          { tex: r`\green{\Phi = 4\pi k\, q = \frac{q}{\varepsilon_0}}`, why: tx(t, "phChg_g4", "the r² cancels: the flux does not depend on the size of the sphere, only on the charge inside") },
        ]} />
      <p>
        {tx(t, "phChg_gaussBody",
          "The result holds for any closed surface, of any shape, around any collection of charges: field lines leave positive charges and end on negative ones, and the surface simply counts how many escape. Charges outside the surface contribute nothing, since every line of theirs that enters also leaves. This is Gauss's law, the first of Maxwell's four equations of electromagnetism.")}
      </p>
      <Equation label={tx(t, "phChg_eqGauss", "Gauss's law")}
        where={[
          [r`\oint \vec E \cdot d\vec A`, tx(t, "phChg_wFlux", "the flux through a closed surface: the field crossing each small patch of area dA, added up (an integral) over the whole surface")],
          [r`Q_{inside}`, tx(t, "phChg_wQin", "the total charge enclosed by the surface (C)")],
          [r`\varepsilon_0`, tx(t, "phChg_wEps2", "the permittivity of free space")],
        ]}
        words={tx(t, "phChg_gaussWords", "The field flowing out of any closed surface is the charge inside it divided by ε₀.")}
        note={tx(t, "phChg_gaussNote", "Gauss's law is true always, but it finds the field easily only when symmetry tells you the field is the same all over a surface. It quickly gives three useful results: outside a uniformly charged sphere the field is as if all the charge sat at the centre; a large flat sheet with charge σ per square metre makes a uniform field σ/(2ε₀) on each side; and two parallel plates with charges +σ and −σ make a uniform field σ/ε₀ between them and almost none outside.")}>
        {r`\oint \vec E \cdot d\vec A = \frac{Q_{inside}}{\varepsilon_0}`}
      </Equation>
      <GaussFigure t={t} />
      <H3>{tx(t, "phChg_condTitle", "Conductors and shielding")}</H3>
      <p>
        {tx(t, "phChg_condBody",
          "In a conductor, free electrons move whenever there is a field. So once the charges settle, the field inside the metal must be zero: any field left would push electrons until it was cancelled. Gauss's law then says there is no charge inside either, so any extra charge on a conductor sits on its outer surface. The field just outside is perpendicular to the surface. A closed metal box shields its inside from outside fields: this is a Faraday cage. A car struck by lightning protects the people inside, and the metal mesh in a microwave oven's door keeps the waves in. On a conductor, charge piles up most densely at sharp points, where the field becomes strong enough to ionise the air; that is how a lightning rod works, and why sparks leap from fingertips and keys.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phChg_nucleus", "If like charges repel so strongly, why does a nucleus full of protons not fly apart? A different force, the strong nuclear force, holds it together. It is even stronger than the electric force but acts only over the size of a nucleus, about 10⁻¹⁵ m. A later chapter, on nuclear physics, takes it up.")}
      </Callout>

      <H2>{tx(t, "phChg_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phChg_ex1", "1. Two spheres with +1 µC each sit 10 cm apart. F = 8.99 × 10⁹ × (10⁻⁶)² / 0.1² = 0.90 N, a repulsion.")}</p>
      <p>{tx(t, "phChg_ex2", "2. In hydrogen the electron sits about 5.29 × 10⁻¹¹ m from the proton. F = 8.99 × 10⁹ × (1.602 × 10⁻¹⁹)² / (5.29 × 10⁻¹¹)² = 8.2 × 10⁻⁸ N. Their gravity is G m_e m_p / r² = 3.6 × 10⁻⁴⁷ N, 2.3 × 10³⁹ times weaker.")}</p>
      <p>{tx(t, "phChg_ex3", "3. The field 30 cm from a 5 nC charge: E = 8.99 × 10⁹ × 5 × 10⁻⁹ / 0.3² = 500 N/C. An electron there feels 500 × 1.602 × 10⁻¹⁹ = 8.0 × 10⁻¹⁷ N, which gives its tiny mass (9.11 × 10⁻³¹ kg) an acceleration of 8.8 × 10¹³ m/s², towards the charge.")}</p>
      <p>{tx(t, "phChg_ex4", "4. Two parallel plates of 0.01 m² carry +10 nC and −10 nC. σ = 10⁻⁸ / 0.01 = 10⁻⁶ C/m², so the field between them is σ/ε₀ = 10⁻⁶ / 8.854 × 10⁻¹² = 1.1 × 10⁵ N/C, the same everywhere between the plates.")}</p>
      <p>{tx(t, "phChg_ex5", "5. A balloon charged to −1 µC has gained 10⁻⁶ / 1.602 × 10⁻¹⁹ = 6.2 × 10¹² extra electrons, still a tiny fraction of the roughly 10²³ electrons in its rubber.")}</p>

      <H2>{tx(t, "phChg_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phChg_tWrong", "Wrong"), tx(t, "phChg_tRight", "Right"), tx(t, "phChg_tWhy", "Why")]}
        rows={[
          [tx(t, "phChg_m1w", "the force falls as 1/r"), tx(t, "phChg_m1r", "as 1/r²"), tx(t, "phChg_m1", "double the distance and the force falls to a quarter")],
          [tx(t, "phChg_m2w", "adding the sizes of the fields"), tx(t, "phChg_m2r", "adding them as vectors"), tx(t, "phChg_m2", "between two equal charges the fields cancel to zero")],
          [tx(t, "phChg_m3w", "an electron moves along the field"), tx(t, "phChg_m3r", "against it"), tx(t, "phChg_m3", "F = q E with q negative")],
          [tx(t, "phChg_m4w", "field lines are paths charges follow"), tx(t, "phChg_m4r", "they show the force's direction"), tx(t, "phChg_m4", "a moving charge has inertia and can leave the line")],
          [tx(t, "phChg_m5w", "a neutral object feels no electric force"), tx(t, "phChg_m5r", "it can be polarised and attracted"), tx(t, "phChg_m5", "that is why a balloon sticks to a wall")],
          [tx(t, "phChg_m6w", "charge spreads through a metal"), tx(t, "phChg_m6r", "it sits on the outer surface"), tx(t, "phChg_m6", "the field inside a conductor is zero")],
        ]}
      />

      <KeyIdeas t={t} id="phChg" items={[
        "Charge comes in two kinds, in whole steps of e = 1.602 × 10⁻¹⁹ C, and is conserved.",
        "Coulomb's law: F = k q₁ q₂ / r², with k = 1/(4πε₀) = 8.99 × 10⁹ N·m²/C²; it is 10³⁹ times stronger than gravity in an atom.",
        "Forces and fields from several charges add as vectors (superposition).",
        "The field is force per unit charge, E = F/q; a point charge makes E = kQ/r², and F = qE on any charge.",
        "Gauss's law: the flux out of any closed surface is Q_inside/ε₀; it gives the fields of spheres, sheets and plates.",
        "Inside a conductor in equilibrium the field is zero and extra charge sits on the surface; metal boxes shield their insides.",
      ]} />
    </Article>
  );
}

"use client";

// Quantum foundations 4: the hydrogen atom — line spectra and the Balmer–
// Rydberg formula, Rutherford's nucleus and the collapse of the classical
// atom, Bohr's model derived (Coulomb pull = centripetal force, n de Broglie
// wavelengths round the orbit → rₙ = n²a₀, Eₙ = −13.6 eV/n²) and the Rydberg
// constant from it, where Bohr fails, the Schrödinger atom with its three
// quantum numbers n, l, m and real orbitals, spin as a fourth number, 2n²
// states per shell, hydrogen-like ions (Z²), and fine structure, the Lamb
// shift and the 21 cm line.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { HydrogenLevelsFigure } from "@/components/lesson/figures/physics/HydrogenLevelsFigure";
import { OrbitalFigure } from "@/components/lesson/figures/physics/OrbitalFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Wavelength of the photon from a jump n₂ → n₁ in a hydrogen-like ion of charge Z. */
const rydbergNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const n1 = v.n1, n2 = Math.max(v.n1 + 1, v.n2), Z = v.Z;
  const inv = 1.097e7 * Z * Z * (1 / (n1 * n1) - 1 / (n2 * n2));      // 1/m
  const lam = 1e9 / inv, E = 1240 / lam;
  const where = lam < 380 ? tx(t, "phH_liveUv", "ultraviolet") : lam > 750 ? tx(t, "phH_liveIr", "infrared") : tx(t, "phH_liveVis", "visible");
  return {
    tex: r`\frac{1}{\lambda} = 1.097\times10^{7}\ \text{m}^{-1} \times ${num(Z, 0)}^2\left(\frac{1}{${num(n1, 0)}^2} - \frac{1}{${num(n2, 0)}^2}\right) \;\to\; \lambda = \amber{${num(lam, 1)}\ \text{nm}}, \quad E = \green{${num(E, 2)}\ \text{eV}}`,
    meter: Math.min(1, Math.max(0, (Math.log10(lam) - 1) / 3)), meterLabel: `${num(lam, 1)} nm: ${where}`,
  };
};

export function HydrogenAtomContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phH_intro",
          "Hydrogen is one proton and one electron, the simplest atom there is, and three-quarters of the ordinary matter in the universe. Heat it and it glows at a handful of exact colours, not a rainbow. Explaining those colours was the third puzzle of the first chapter of this section, and the hydrogen atom is where quantum physics proved itself: Niels Bohr's model of 1913 got the colours right with a mixture of old and new ideas, and Schrödinger's equation of 1926 got them right from first principles, along with the shapes of the orbitals that underlie all of chemistry. Everything in this chapter follows from the electric pull between two charges and the rule that the electron's wave must fit.")}
      </Lead>

      <Goals t={t} id="phH" items={[
        "Use the Rydberg formula to find the wavelengths of hydrogen's spectral lines.",
        "Derive Bohr's radii rₙ = n²a₀ and energies Eₙ = −13.6 eV/n², and explain where his model fails.",
        "Name the quantum numbers n, l, m (and spin) and describe the orbitals they label.",
        "Count the states in each shell (2n²) and scale the levels to hydrogen-like ions with Z².",
      ]} />

      <H2>{tx(t, "phH_specTitle", "Hydrogen's fingerprint")}</H2>
      <p>
        {tx(t, "phH_specBody",
          "Pass the light of a hydrogen lamp through a prism or a grating (the wave optics chapter) and you see four bright lines on a dark background: red at 656 nm, cyan at 486, blue at 434 and violet at 410. In 1885 Johann Balmer, a Swiss schoolteacher, found by trial and error that all four fit one formula. Johannes Rydberg generalised it, and later lines found in the ultraviolet (Lyman) and infrared (Paschen) fitted too, with other whole numbers in the place of 2.")}
      </p>
      <Equation label={tx(t, "phH_eqRyd", "The Rydberg formula")}
        where={[
          [r`\lambda`, tx(t, "phH_wLam", "the wavelength of a spectral line")],
          [r`R_\infty`, tx(t, "phH_wR", "the Rydberg constant, 1.097 × 10⁷ m⁻¹, found from the measurements")],
          [r`n_1 < n_2`, tx(t, "phH_wN", "two whole numbers; n₁ = 1 gives the Lyman series, 2 the Balmer series, 3 the Paschen series")],
        ]}
        words={tx(t, "phH_rydWords", "Every line of hydrogen is the difference of two terms R/n², one for each of two whole numbers.")}
        note={tx(t, "phH_rydNote", "The formula was found before anyone knew why. A difference of two terms suggests that each line comes from a jump between two of something; with Einstein's photons, each term is an energy level divided by hc.")}>
        {r`\frac{1}{\lambda} = R_\infty\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)`}
      </Equation>
      <H3>{tx(t, "phH_collapseTitle", "Why a classical atom cannot exist")}</H3>
      <p>
        {tx(t, "phH_collapseBody",
          "In 1911 Ernest Rutherford found, by firing alpha particles at gold foil, that an atom's positive charge and nearly all its mass sit in a tiny nucleus, 100 000 times smaller than the atom. The obvious picture is a miniature solar system, the electron orbiting the nucleus as a planet orbits the Sun. But an orbiting electron is an accelerating charge, and the Maxwell's equations chapter showed that accelerating charges radiate. It would lose energy, spiral inward and hit the nucleus in about 16 picoseconds, shining a smear of all colours as it went. Atoms are stable and their light comes in sharp lines, so something had to give.")}
      </p>

      <H2>{tx(t, "phH_bohrTitle", "Bohr's model")}</H2>
      <p>
        {tx(t, "phH_bohrBody",
          "Niels Bohr, working with Rutherford in Manchester, simply declared that only certain orbits are allowed and that an electron in one of them does not radiate. Light is emitted only when the electron jumps from one allowed orbit to a lower one, as a single photon carrying the energy difference. Which orbits? With hindsight (de Broglie came eleven years later) the rule is easiest to see as a wave condition: a whole number of the electron's wavelengths must fit round the orbit, so the wave joins up with itself.")}
      </p>
      <Derivation t={t} label={tx(t, "phH_bohrDer", "The allowed orbits")}
        steps={[
          { tex: r`\frac{k e^2}{r^2} = \frac{m v^2}{r}`, why: tx(t, "phH_d1", "the electric pull of the proton (Coulomb's law, k = 8.99 × 10⁹ N·m²/C²) provides the centripetal force of a circular orbit (circular motion chapter)") },
          { tex: r`2\pi r = n\lambda = n\,\frac{h}{m v} \;\to\; m v r = n\hbar`, why: tx(t, "phH_d2", "n de Broglie wavelengths fit round the circle. Equivalently, the angular momentum mvr comes in whole multiples of ħ, Bohr's original form") },
          { tex: r`v = \frac{n\hbar}{m r} \;\to\; k e^2 = m v^2 r = \frac{n^2\hbar^2}{m r} \;\to\; \green{r_n = n^2\,\frac{\hbar^2}{m k e^2} = n^2 a_0}`, why: tx(t, "phH_d3", "take v from the second line, put it in the first (multiplied by r²), and solve for r") },
          { tex: r`E = \tfrac12 m v^2 - \frac{k e^2}{r} = \frac{k e^2}{2r} - \frac{k e^2}{r} = -\frac{k e^2}{2 r}`, why: tx(t, "phH_d4", "kinetic plus electric potential energy; the first line gives mv² = ke²/r, so the kinetic energy is half the size of the potential energy, as for any circular orbit (gravity orbits chapter)") },
          { tex: r`\green{E_n = -\frac{k e^2}{2 a_0}\,\frac{1}{n^2} = -\frac{13.6\ \text{eV}}{n^2}}`, why: tx(t, "phH_d5", "put in rₙ = n²a₀. The energy is negative: the electron is bound, and 13.6 eV must be supplied to set it free from the lowest level") },
        ]} />
      <Equation label={tx(t, "phH_eqBohr", "Hydrogen's radii and energy levels")}
        where={[
          [r`a_0`, tx(t, "phH_wA0", "the Bohr radius, ħ²/(m k e²) = 5.29 × 10⁻¹¹ m = 0.0529 nm: the size of a hydrogen atom in its lowest state")],
          [r`n`, tx(t, "phH_wN2", "the principal quantum number, 1, 2, 3, …")],
          [r`13.6\ \text{eV}`, tx(t, "phH_w136", "the ionisation energy of hydrogen, ke²/2a₀, also called one rydberg")],
        ]}
        words={tx(t, "phH_bohrWords", "The n-th allowed orbit is n² times bigger than the smallest one, and its energy is 13.6 eV divided by n², below zero.")}
        note={tx(t, "phH_bohrNote", "A jump from n₂ down to n₁ releases ΔE = 13.6 eV (1/n₁² − 1/n₂²), and dividing by hc gives exactly the Rydberg formula, with R∞ = 13.6 eV / hc = 1.097 × 10⁷ m⁻¹. Bohr computed the constant from e, m, h and k, and it matched the measured value. That was the moment the quantum atom was taken seriously.")}>
        {r`r_n = n^2 a_0, \qquad E_n = -\frac{13.6\ \text{eV}}{n^2}`}
      </Equation>
      <HydrogenLevelsFigure t={t} />
      <LiveFormula label={tx(t, "phH_liveRyd", "Try it: a jump between two levels")}
        tex={r`\frac{1}{\lambda} = R_\infty\,Z^2\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)`}
        vars={[
          { id: "n1", label: tx(t, "phH_liveN1", "lower level n₁"), min: 1, max: 5, step: 1, value: 2, fmt: v => num(v, 0) },
          { id: "n2", label: tx(t, "phH_liveN2", "upper level n₂"), min: 2, max: 12, step: 1, value: 3, fmt: v => num(v, 0) },
          { id: "Z", label: tx(t, "phH_liveZ", "nuclear charge Z"), min: 1, max: 3, step: 1, value: 1, fmt: v => num(v, 0) },
        ]}
        compute={rydbergNumbers(t)}
        note={tx(t, "phH_liveRydNote", "With Z = 1 this is hydrogen. Z = 2 is singly ionised helium, He⁺, and Z = 3 is Li²⁺: one electron round a nucleus of charge Z. The pull is Z times stronger, the orbits Z times smaller, and every energy Z² times bigger, so the same jumps give lines Z² times shorter. If you set n₂ ≤ n₁, it is raised to n₁ + 1.")} />
      <H3>{tx(t, "phH_failTitle", "Where Bohr's model breaks")}</H3>
      <LessonTable
        headers={[tx(t, "phH_tGot", "Bohr got right"), tx(t, "phH_tWrong2", "Bohr got wrong")]}
        rows={[
          [tx(t, "phH_f1a", "the energy levels and every line of hydrogen"), tx(t, "phH_f1b", "electrons do not follow orbits; there is no path, only a cloud of chances")],
          [tx(t, "phH_f2a", "the size of the atom, a₀"), tx(t, "phH_f2b", "the lowest state has zero angular momentum, not ħ")],
          [tx(t, "phH_f3a", "hydrogen-like ions (He⁺, Li²⁺)"), tx(t, "phH_f3b", "it fails for helium and every atom with two or more electrons")],
          [tx(t, "phH_f4a", "the Rydberg constant from fundamental constants"), tx(t, "phH_f4b", "it cannot say how bright each line is, or why some jumps never happen")],
        ]}
      />

      <H2>{tx(t, "phH_qTitle", "The quantum atom")}</H2>
      <p>
        {tx(t, "phH_qBody",
          "Schrödinger's first application of his equation, in 1926, was hydrogen. The electron moves in three dimensions in the potential V = −ke²/r. Because the pull points straight at the nucleus, the equation separates in spherical coordinates (distance r and two angles, like latitude and longitude) into a radial part and an angular part. Each part allows only certain solutions, and they are labelled by three whole numbers. The energies come out exactly as Bohr's, −13.6 eV/n², but now with no orbits and no extra rules: they are just the waves that fit.")}
      </p>
      <LessonTable
        headers={[tx(t, "phH_tQn", "Quantum number"), tx(t, "phH_tVals", "Allowed values"), tx(t, "phH_tSets", "What it sets")]}
        rows={[
          [tx(t, "phH_q1", "principal, n"), "1, 2, 3, …", tx(t, "phH_q1s", "the energy, −13.6 eV/n², and the size, about n²a₀")],
          [tx(t, "phH_q2", "orbital, l"), "0, 1, …, n − 1", tx(t, "phH_q2s", "the shape and the size of the angular momentum, √(l(l+1)) ħ; named s, p, d, f for l = 0, 1, 2, 3")],
          [tx(t, "phH_q3", "magnetic, m"), "−l, …, 0, …, l", tx(t, "phH_q3s", "the orientation: the component of angular momentum along an axis, mħ")],
          [tx(t, "phH_q4", "spin, m_s"), "+½, −½", tx(t, "phH_q4s", "the electron's own built-in angular momentum, up or down (the first chapter of the next section)")],
        ]}
      />
      <OrbitalFigure t={t} />
      <Equation label={tx(t, "phH_eqGround", "The ground state, 1s")}
        where={[
          [r`\psi_{100}`, tx(t, "phH_wPsi", "the wavefunction with n = 1, l = 0, m = 0")],
          [r`\pi a_0^3`, tx(t, "phH_wNorm", "the normalising factor that makes the total probability 1")],
          [r`e^{-r/a_0}`, tx(t, "phH_wExp", "the wave dies away exponentially with distance: largest at the nucleus, a tenth of its central value by r = 2.3a₀")],
        ]}
        words={tx(t, "phH_groundWords", "In its lowest state, the electron is a round, fuzzy ball whose wave fades exponentially with distance from the proton.")}
        note={tx(t, "phH_groundNote", "ψ is largest at the centre, but the chance of being at distance r is |ψ|² times the area 4πr² of the shell at that distance. That product, 4πr²|ψ|², peaks at exactly r = a₀: Bohr's radius returns as the most likely distance.")}>
        {r`\psi_{100}(r) = \frac{1}{\sqrt{\pi a_0^3}}\,e^{-r/a_0}`}
      </Equation>
      <H3>{tx(t, "phH_shellTitle", "Shells: counting the states")}</H3>
      <p>
        {tx(t, "phH_shellBody",
          "For each n, l runs from 0 to n − 1 and each l has 2l + 1 values of m. Adding them up gives n² orbitals with the same energy, and each holds two spin states, so the n-th shell has room for 2n² states: 2, 8, 18, 32. In atoms with many electrons, which the second chapter of the next section treats, the l values separate in energy, and these numbers turn into the rows of the periodic table.")}
      </p>
      <LessonTable
        headers={["n", tx(t, "phH_tSub", "Subshells"), tx(t, "phH_tOrb", "Orbitals (n²)"), tx(t, "phH_tSt", "States with spin (2n²)")]}
        rows={[
          ["1", "1s", "1", "2"],
          ["2", "2s 2p", "1 + 3 = 4", "8"],
          ["3", "3s 3p 3d", "1 + 3 + 5 = 9", "18"],
          ["4", "4s 4p 4d 4f", "1 + 3 + 5 + 7 = 16", "32"],
        ]}
      />
      <H3>{tx(t, "phH_fineTitle", "Smaller details")}</H3>
      <p>
        {tx(t, "phH_fineBody",
          "Look closely enough and hydrogen's lines split. The electron moves at about 1/137 of the speed of light, so relativity and the interaction of its spin with its motion shift the levels slightly: the fine structure, a split of about 10⁻⁴ of the line spacing. In 1947 Willis Lamb found a still smaller shift (the Lamb shift) that only quantum electrodynamics, the subject of the last section, explains. And the proton's own spin splits the ground state into two levels 5.9 × 10⁻⁶ eV apart: the jump between them gives radio waves of 21 cm, with which astronomers map the cold hydrogen of the whole Milky Way.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phH_alpha", "The number 1/137 is the fine-structure constant, α = ke²/(ħc) ≈ 1/137.036, the strength of electromagnetism with all the units taken out. In the ground state of hydrogen the electron's typical speed is αc, and the 13.6 eV is ½α² times the electron's rest energy, 511 keV.")}
      </Callout>

      <H2>{tx(t, "phH_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phH_ex1", "1. The red Balmer line, n = 3 → 2: ΔE = 13.6 × (1/4 − 1/9) = 13.6 × 5/36 = 1.89 eV, λ = 1240/1.89 = 656 nm. This is the H-alpha line that gives glowing nebulae their pink-red colour.")}</p>
      <p>{tx(t, "phH_ex2", "2. To ionise hydrogen from its ground state takes 13.6 eV, a photon of 1240/13.6 = 91.2 nm or shorter: far ultraviolet. Starlight that hot ionises the gas around young stars, and recapture of the electrons makes the Balmer lines.")}</p>
      <p>{tx(t, "phH_ex3", "3. The size of the n = 100 state: r = 100² × 0.0529 nm = 529 nm, half a micrometre, about the size of a bacterium. Such giant Rydberg atoms exist in space and in labs, held together by an energy of only 13.6/10 000 = 1.4 meV.")}</p>
      <p>{tx(t, "phH_ex4", "4. He⁺ (Z = 2), jump 4 → 3: ΔE = 13.6 × 4 × (1/9 − 1/16) = 2.64 eV, λ = 469 nm, a blue line seen in hot stars. It was first wrongly attributed to hydrogen; Bohr's Z² rule identified it in 1913.")}</p>

      <H2>{tx(t, "phH_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phH_tWrong", "Wrong"), tx(t, "phH_tRight", "Right"), tx(t, "phH_tWhy", "Why")]}
        rows={[
          [tx(t, "phH_m1w", "the electron circles the nucleus on an orbit"), tx(t, "phH_m1r", "it is a standing wave, a cloud of chances"), tx(t, "phH_m1", "Bohr's orbits gave the right energies for the wrong reason")],
          [tx(t, "phH_m2w", "an energy level of −3.4 eV means the atom has less energy than nothing"), tx(t, "phH_m2r", "zero is the free electron at rest"), tx(t, "phH_m2", "a bound electron has less energy than a free one; 3.4 eV is needed to free it from n = 2")],
          [tx(t, "phH_m3w", "the lines get further apart at higher n"), tx(t, "phH_m3r", "they crowd towards a limit"), tx(t, "phH_m3", "the levels −13.6/n² bunch up just below zero")],
          [tx(t, "phH_m4w", "2s and 2p have different energies in hydrogen"), tx(t, "phH_m4r", "they have the same (apart from tiny shifts)"), tx(t, "phH_m4", "in hydrogen the energy depends only on n; in heavier atoms l matters")],
          [tx(t, "phH_m5w", "the 1s electron is most likely at the nucleus"), tx(t, "phH_m5r", "most likely at distance a₀"), tx(t, "phH_m5", "|ψ|² peaks at the centre, but the shell area 4πr² is zero there")],
        ]}
      />

      <KeyIdeas t={t} id="phH" items={[
        "Hydrogen glows at exact wavelengths given by 1/λ = R∞(1/n₁² − 1/n₂²); a classical orbiting electron would instead spiral in within picoseconds.",
        "Bohr: a whole number of de Broglie wavelengths fits each allowed orbit, so rₙ = n²a₀ (a₀ = 0.0529 nm) and Eₙ = −13.6 eV/n².",
        "A jump between levels emits one photon with the energy difference, which gives the Rydberg constant from e, m, h and k.",
        "Schrödinger's equation gives the same energies without orbits: states labelled by n, l (0 … n − 1) and m (−l … l), the s, p, d, f orbitals.",
        "With the electron's spin, each shell holds 2n² states (2, 8, 18, 32), the seed of the periodic table.",
        "One-electron ions scale as Z²; fine structure, the Lamb shift and the 21 cm line are smaller effects that need relativity, QED and the proton's spin.",
      ]} />
    </Article>
  );
}

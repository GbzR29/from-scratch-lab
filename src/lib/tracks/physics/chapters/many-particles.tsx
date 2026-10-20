"use client";

// Quantum deeper 3: many particles — identical particles and the exchange
// sign ψ(x₂, x₁) = ±ψ(x₁, x₂), bosons and fermions (spin–statistics), the
// Pauli exclusion principle, atoms with many electrons (screening, Z_eff,
// the n + l filling order, Hund's rule) and the periodic table with its
// ionisation energies, degeneracy pressure and the Fermi energy (metals,
// white dwarfs), bosons together (stimulated emission, n + 1, Bose–Einstein
// condensates), and the laser: inversion, threshold, three and four levels.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ExchangeFigure } from "@/components/lesson/figures/physics/ExchangeFigure";
import { AufbauFigure } from "@/components/lesson/figures/physics/AufbauFigure";
import { LaserFigure } from "@/components/lesson/figures/physics/LaserFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Effective nuclear charge felt by the outer electron, from its ionisation energy. */
const zeffNumbers = (v: Record<string, number>) => {
  const z = v.n * Math.sqrt(v.ie / 13.6);
  return {
    tex: r`Z_{\text{eff}} = n\sqrt{\frac{E_{\text{ion}}}{13.6\ \text{eV}}} = ${num(v.n, 0)}\sqrt{\frac{${num(v.ie, 2)}}{13.6}} = \amber{${num(z, 2)}}`,
  };
};

/** Fermi energy of a free-electron metal from its electron density. */
const fermiNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const n = v.n * 1e28, hb2m = 6.104e-39;                    // ħ²/2m in J·m²
  const E = (hb2m * Math.pow(3 * Math.PI * Math.PI * n, 2 / 3)) / 1.602e-19;
  return {
    tex: r`E_F = \frac{\hbar^2}{2m}\left(3\pi^2 \times ${num(v.n, 2)}\times10^{28}\ \text{m}^{-3}\right)^{2/3} = \amber{${num(E, 2)}\ \text{eV}} \approx \green{${num(E / 0.0259, 0)}}\,kT_{\text{room}}`,
    meter: Math.min(1, E / 12), meterLabel: `${num(E / 8.617e-5 / 1000, 0)} 000 K ${tx(t, "phMany_liveTF", "(Fermi temperature)")}`,
  };
};

export function ManyParticlesContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phMany_intro",
          "Everything so far had one particle in it. Real matter has many, and quantum mechanics adds a rule for them that has no classical counterpart: identical particles are truly identical, and swapping two of them can at most flip the sign of the wave. Which way it goes splits all particles into two families. Fermions, like electrons, refuse to share a state, and that refusal builds the periodic table, makes solids solid and holds up dead stars. Bosons, like photons, crowd into the same state, and that eagerness makes the laser. This chapter follows both.")}
      </Lead>

      <Goals t={t} id="phMany" items={[
        "Explain the exchange rule ψ(x₂, x₁) = ±ψ(x₁, x₂) and sort particles into bosons and fermions.",
        "Use the Pauli principle to fill the electron shells and explain the rows of the periodic table.",
        "Estimate the Fermi energy of a metal and say why degeneracy pressure holds up white dwarfs.",
        "Explain stimulated emission, population inversion and the threshold of a laser.",
      ]} />

      <H2>{tx(t, "phMany_idTitle", "Identical means identical")}</H2>
      <p>
        {tx(t, "phMany_idBody",
          "Two billiard balls may look alike, but you can follow each along its path and say which is which. Two electrons have no paths, only overlapping waves, and every electron in the universe has exactly the same mass, charge and spin. So nothing measurable may change if they are swapped: the chance |ψ(x₁, x₂)|² of finding one at x₁ and the other at x₂ must equal |ψ(x₂, x₁)|². The wave itself may still change sign. Swap twice and you must get back where you started, so only two options remain.")}
      </p>
      <Equation label={tx(t, "phMany_eqEx", "The exchange rule")}
        where={[
          [r`\psi(x_1, x_2)`, tx(t, "phMany_wPsi", "the wave of two particles: its square is the chance of finding one at x₁ and the other at x₂ (positions include the spin)")],
          [r`+`, tx(t, "phMany_wPlus", "bosons: the wave is unchanged by a swap. Particles with whole-number spin: photons, the Higgs, helium-4 atoms")],
          [r`-`, tx(t, "phMany_wMinus", "fermions: the wave flips sign. Particles with half-integer spin: electrons, protons, neutrons, quarks, helium-3 atoms")],
          [r`\varphi_a,\ \varphi_b`, tx(t, "phMany_wPhi", "two one-particle states, for example two levels of a box")],
        ]}
        words={tx(t, "phMany_exWords", "Swap two identical particles and the wave stays the same for bosons and flips sign for fermions; a pair in states a and b must be the sum or the difference of both assignments.")}
        note={tx(t, "phMany_exNote", "Which family a particle belongs to is fixed by its spin: whole-number spin means boson, half-integer spin means fermion. Wolfgang Pauli proved this spin–statistics link in 1940 from relativity and quantum field theory; in ordinary quantum mechanics it has to be taken as a rule.")}>
        {r`\begin{gathered} \psi(x_2, x_1) = \pm\,\psi(x_1, x_2) \\ \psi_\pm = \frac{1}{\sqrt2}\big[\varphi_a(x_1)\varphi_b(x_2) \pm \varphi_b(x_1)\varphi_a(x_2)\big] \end{gathered}`}
      </Equation>
      <ExchangeFigure t={t} />
      <H3>{tx(t, "phMany_pauliTitle", "The Pauli exclusion principle")}</H3>
      <p>
        {tx(t, "phMany_pauliBody",
          "Put both fermions in the same state, a = b, and the difference φa(x₁)φa(x₂) − φa(x₁)φa(x₂) is zero everywhere: no such state exists. Two identical fermions can never occupy the same quantum state. Pauli stated this rule in 1925 to explain the shells of atoms, before the exchange sign was understood. Since an electron's state includes its spin, one orbital holds two electrons, one up and one down, and no more. The figure also shows a softer effect: even in different states, fermions keep away from each other. That 'exchange' avoidance makes electrons with parallel spins repel each other less, which is why iron is magnetic.")}
      </p>

      <H2>{tx(t, "phMany_atomsTitle", "Building the atoms")}</H2>
      <p>
        {tx(t, "phMany_atomsBody",
          "An atom of atomic number Z has Z electrons around a nucleus of charge Ze. Each electron feels the nucleus, partly screened by the electrons inside it. The screening breaks hydrogen's rule that the energy depends only on n: an s electron spends some time close to the nucleus, inside the others, and feels nearly its full charge, so it is bound more tightly than a p electron of the same shell, which in turn beats a d. The order in which subshells fill follows, to a good approximation, the n + l rule: lowest n + l first, and for equal n + l, lowest n first. That puts 4s before 3d.")}
      </p>
      <Equation label={tx(t, "phMany_eqZeff", "The outer electron's energy with screening")}
        where={[
          [r`E_{\text{ion}}`, tx(t, "phMany_wIon", "the ionisation energy: the energy needed to pull off the outermost electron")],
          [r`Z_{\text{eff}}`, tx(t, "phMany_wZeff", "the effective nuclear charge: the nucleus's Z minus the electrons screening it, as felt by the outer electron")],
          [r`n`, tx(t, "phMany_wN", "the outer electron's principal quantum number (its shell)")],
        ]}
        words={tx(t, "phMany_zeffWords", "An outer electron is bound like hydrogen's, but by a nucleus whose charge is reduced by the electrons inside it.")}
        note={tx(t, "phMany_zeffNote", "This is hydrogen's −13.6 eV Z²/n² with Z replaced by Z_eff. Turned around, a measured ionisation energy gives the charge the outer electron feels.")}>
        {r`E_{\text{ion}} \approx 13.6\ \text{eV}\,\frac{Z_{\text{eff}}^2}{n^2}`}
      </Equation>
      <AufbauFigure t={t} />
      <LiveFormula label={tx(t, "phMany_liveZeff", "Try it: how much charge does the outer electron feel?")}
        tex={r`Z_{\text{eff}} = n\sqrt{E_{\text{ion}}/13.6\ \text{eV}}`}
        vars={[
          { id: "n", label: tx(t, "phMany_liveN", "outer shell n"), min: 1, max: 5, step: 1, value: 3, fmt: v => num(v, 0) },
          { id: "ie", label: tx(t, "phMany_liveIe", "ionisation energy"), min: 3, max: 25, step: 0.01, value: 5.14, fmt: v => `${num(v, 2)} eV` },
        ]}
        compute={zeffNumbers}
        note={tx(t, "phMany_liveZeffNote", "Sodium (n = 3, 5.14 eV): its 11 protons are screened by 10 inner electrons, yet the 3s electron feels 1.84, not 1, because it dips inside the inner shells. Argon (n = 3, 15.76 eV) gives 3.2: in the same shell the electrons screen each other poorly, so the pull grows along each row, until the shell is full.")} />
      <LessonTable
        headers={[tx(t, "phMany_tRow", "Row"), tx(t, "phMany_tFills", "Subshells that fill"), tx(t, "phMany_tLen", "Elements"), tx(t, "phMany_tEnds", "Ends at")]}
        rows={[
          ["1", "1s", "2", "He"],
          ["2", "2s 2p", "2 + 6 = 8", "Ne"],
          ["3", "3s 3p", "2 + 6 = 8", "Ar"],
          ["4", "4s 3d 4p", "2 + 10 + 6 = 18", "Kr"],
          ["5", "5s 4d 5p", "2 + 10 + 6 = 18", "Xe"],
          ["6", "6s 4f 5d 6p", "2 + 14 + 10 + 6 = 32", "Rn"],
        ]}
      />
      <p>
        {tx(t, "phMany_rowsBody",
          "Each row ends when a p subshell is full, because the next available level lies across a big energy gap. Those full-shell atoms, the noble gases, hold their electrons tightly and almost never react. The next element starts a new shell with one lonely, loosely held s electron: the alkali metals, which react violently, giving that electron away. Elements in the same column have the same arrangement of outer electrons, and so similar chemistry. Mendeleev arranged his table in 1869 by chemical behaviour alone; the Pauli principle explains it 56 years later.")}
      </p>
      <H3>{tx(t, "phMany_degTitle", "Degeneracy pressure: why matter takes up space")}</H3>
      <p>
        {tx(t, "phMany_degBody",
          "In a metal, the outer electrons leave their atoms and roam the whole crystal, like particles in a big box. Pauli forbids them all from sitting in the lowest level, so they fill the levels from the bottom up, two per level, up to an energy called the Fermi energy. Even at absolute zero most of them are moving fast. Squeeze the metal and the box gets smaller, every level rises (the box chapter: E ∝ 1/L²), and the electrons push back. That degeneracy pressure, not electric repulsion alone, is why solids resist compression.")}
      </p>
      <Equation label={tx(t, "phMany_eqFermi", "The Fermi energy of a free-electron metal")}
        where={[
          [r`E_F`, tx(t, "phMany_wEF", "the Fermi energy: the kinetic energy of the fastest electrons at absolute zero")],
          [r`n`, tx(t, "phMany_wn", "the number of free electrons per cubic metre")],
          [r`\hbar^2/2m`, tx(t, "phMany_wHb", "6.10 × 10⁻³⁹ J·m² for an electron: the constant of the kinetic energy p²/2m written with ħk")],
          [r`3\pi^2`, tx(t, "phMany_w3pi", "from counting: in a box, the states with |k| < k_F fill a sphere, and two spins per state give n = k_F³/(3π²)")],
        ]}
        words={tx(t, "phMany_fermiWords", "Packing n electrons per cubic metre, two to a state, forces the top ones up to an energy that grows as n to the two-thirds.")}
        note={tx(t, "phMany_fermiNote", "For copper, n = 8.5 × 10²⁸ m⁻³ gives E_F = 7.0 eV, 270 times the thermal energy at room temperature. Only the few electrons within about kT of the top can take up heat, which solved the puzzle of why metals' electrons add almost nothing to their heat capacity.")}>
        {r`E_F = \frac{\hbar^2}{2m}\left(3\pi^2 n\right)^{2/3}`}
      </Equation>
      <LiveFormula label={tx(t, "phMany_liveFermi", "Try it: the Fermi energy of a metal")}
        tex={r`E_F = \frac{\hbar^2}{2m}\left(3\pi^2 n\right)^{2/3}`}
        vars={[{ id: "n", label: tx(t, "phMany_liveDens", "electron density n"), min: 0.5, max: 25, step: 0.1, value: 8.5, fmt: v => `${num(v, 1)} × 10²⁸ m⁻³` }]}
        compute={fermiNumbers(t)}
        note={tx(t, "phMany_liveFermiNote", "Sodium has 2.5 × 10²⁸ free electrons per m³ (3.2 eV), copper 8.5 (7.0 eV), aluminium 18 (11.7 eV, three electrons per atom). In a white dwarf, a star that has burnt out, the Sun's mass is squeezed to the size of the Earth, n is about a million times higher, and electron degeneracy pressure is what stops the collapse, up to 1.4 solar masses (Chandrasekhar's limit). Beyond it, electrons are pushed into protons and a neutron star forms, held up by neutron degeneracy.")} />

      <H2>{tx(t, "phMany_bosonTitle", "Bosons together")}</H2>
      <p>
        {tx(t, "phMany_bosonBody",
          "Bosons do the opposite. The figure shows them found together more often than independent particles, and the effect grows with numbers: a boson is more likely to go into a state the more bosons are already in it. For photons this is stimulated emission, predicted by Einstein in 1917. Cooled far enough, a gas of bosonic atoms drops into a single state, a Bose–Einstein condensate: first made in 1995 with rubidium atoms at 170 billionths of a kelvin. Liquid helium-4 below 2.17 K flows without any friction for the same reason.")}
      </p>
      <Equation label={tx(t, "phMany_eqStim", "Emission into a crowded state")}
        where={[
          [r`R_{\text{emit}}`, tx(t, "phMany_wR", "the rate at which an excited atom emits a photon into one particular mode (direction, frequency, polarisation) of the light")],
          [r`n`, tx(t, "phMany_wNph", "the number of photons already in that mode")],
          [r`A`, tx(t, "phMany_wA", "the spontaneous rate into the mode, the rate when it is empty")],
          [r`n\,A`, tx(t, "phMany_wNA", "the stimulated part: a copy of the photons already there, same direction, frequency and phase")],
        ]}
        words={tx(t, "phMany_stimWords", "An atom emits into a mode that already holds n photons n + 1 times as fast as into an empty one; the extra n are copies.")}
        note={tx(t, "phMany_stimNote", "The same factor n multiplies absorption from that mode by atoms in the lower level. So light passing through atoms grows only if more atoms are up than down: N₂ > N₁. In any gas in thermal equilibrium the Boltzmann factor makes N₂ < N₁, so light is absorbed, not amplified.")}>
        {r`R_{\text{emit}} = A\,(n + 1) = \underbrace{A}_{\text{${tx(t, "phMany_texSpont", "spontaneous")}}} + \underbrace{n\,A}_{\text{${tx(t, "phMany_texStim", "stimulated")}}}`}
      </Equation>

      <H2>{tx(t, "phMany_laserTitle", "The laser")}</H2>
      <p>
        {tx(t, "phMany_laserBody",
          "LASER stands for light amplification by stimulated emission of radiation. Three things are needed. A gain medium, atoms (or ions, molecules, a semiconductor) with a suitable pair of levels. A pump, light or current, that keeps more atoms in the upper level than the lower: a population inversion. And a cavity, two mirrors that send the light back through the medium hundreds of times, so a photon's copies build up in one mode. One mirror lets a percent or so through: that is the beam.")}
      </p>
      <Derivation t={t} label={tx(t, "phMany_threshDer", "The threshold")}
        steps={[
          { tex: r`\frac{dn}{dt} = g\,(N_2 - N_1)\,n - \kappa\,n + \dots`, why: tx(t, "phMany_d1", "photons in the cavity mode: stimulated emission adds g·N₂·n, absorption removes g·N₁·n, and the mirrors leak κ·n per second (the dots are the few spontaneous photons that happen to start in the mode)") },
          { tex: r`g\,(N_2 - N_1) > \kappa`, why: tx(t, "phMany_d2", "the count grows when gain beats loss") },
          { tex: r`\green{(N_2 - N_1)_{\text{th}} = \frac{\kappa}{g}}`, why: tx(t, "phMany_d3", "the threshold inversion. Above it the photon number grows until stimulated emission drains the upper level as fast as the pump fills it: the inversion stays clamped at the threshold, and every extra pumped atom becomes laser light") },
        ]} />
      <LaserFigure t={t} />
      <LessonTable
        headers={[tx(t, "phMany_tLaser", "Laser"), tx(t, "phMany_tLam", "Wavelength"), tx(t, "phMany_tMed", "Gain medium, scheme")]}
        rows={[
          [tx(t, "phMany_las1", "ruby (the first, 1960)"), "694 nm", tx(t, "phMany_las1m", "chromium ions in sapphire, three levels, flash-lamp pumped, pulsed")],
          [tx(t, "phMany_las2", "helium–neon"), "633 nm", tx(t, "phMany_las2m", "neon atoms excited by collisions with helium, four levels")],
          [tx(t, "phMany_las3", "Nd:YAG"), "1064 nm", tx(t, "phMany_las3m", "neodymium ions in a crystal, four levels; doubled to 532 nm in green pointers")],
          [tx(t, "phMany_las4", "semiconductor diode"), "405–1550 nm", tx(t, "phMany_las4m", "electrons and holes meeting across the gap (next chapter); in Blu-ray, barcode readers, fibre optics")],
          [tx(t, "phMany_las5", "carbon dioxide"), "10.6 µm", tx(t, "phMany_las5m", "molecular vibration levels; cutting steel")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phMany_coherent", "Because every stimulated photon copies an existing one, laser light is a single wave: one colour (a line width that can be below a hertz), one direction (it spreads only by diffraction, θ ≈ λ/D) and one phase across the beam. That coherence, not brightness, is what makes holograms, interferometers like LIGO, and fibre-optic communication possible.")}
      </Callout>

      <H2>{tx(t, "phMany_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phMany_ex1", "1. Lithium (Z = 3): two electrons fill 1s with opposite spins; the third cannot join them and must go to 2s, much further out. That is why lithium gives up one electron so easily (5.39 eV against helium's 24.6 eV).")}</p>
      <p>{tx(t, "phMany_ex2", "2. Iron (Z = 26): [Ar] 4s² 3d⁶. By Hund's rule, five of the six d electrons take one box each with parallel spins and the sixth pairs up, leaving four unpaired spins: one source of iron's strong magnetism.")}</p>
      <p>{tx(t, "phMany_ex3", "3. Copper's Fermi energy, 7.0 eV, corresponds to a speed v = √(2E/m) = 1.6 × 10⁶ m/s, half a percent of light speed, even at absolute zero. The current in a wire is a drift of millimetres per second on top of that.")}</p>
      <p>{tx(t, "phMany_ex4", "4. A 1 mW red laser pointer at 650 nm: each photon carries 1240/650 = 1.91 eV = 3.06 × 10⁻¹⁹ J, so it sends 10⁻³ / 3.06 × 10⁻¹⁹ = 3.3 × 10¹⁵ photons per second, almost all in one mode.")}</p>

      <H2>{tx(t, "phMany_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phMany_tWrong", "Wrong"), tx(t, "phMany_tRight", "Right"), tx(t, "phMany_tWhy", "Why")]}
        rows={[
          [tx(t, "phMany_m1w", "Pauli: two electrons cannot be in the same place"), tx(t, "phMany_m1r", "they cannot be in the same state"), tx(t, "phMany_m1", "two electrons with opposite spins share an orbital and the same region of space")],
          [tx(t, "phMany_m2w", "electrons avoid each other only because they repel"), tx(t, "phMany_m2r", "the exchange sign adds an avoidance of its own"), tx(t, "phMany_m2", "even uncharged fermions (neutrons in a neutron star) refuse to share states")],
          [tx(t, "phMany_m3w", "3d fills before 4s because 3 < 4"), tx(t, "phMany_m3r", "4s fills first (n + l = 4 against 5)"), tx(t, "phMany_m3", "screening makes s orbitals, which reach the nucleus, lower than d of a lower shell")],
          [tx(t, "phMany_m4w", "a laser needs most atoms excited"), tx(t, "phMany_m4r", "it needs N₂ > N₁ for the two laser levels"), tx(t, "phMany_m4", "in a four-level laser N₁ ≈ 0, so a small N₂ is already an inversion")],
          [tx(t, "phMany_m5w", "pumping harder with the laser's own colour gives inversion"), tx(t, "phMany_m5r", "it can at best equalise the two levels"), tx(t, "phMany_m5", "the pump stimulates emission as often as it is absorbed: N₂ never passes N₁ (the figure's break-it)")],
        ]}
      />

      <KeyIdeas t={t} id="phMany" items={[
        "Swapping identical particles leaves the wave unchanged (bosons, whole-number spin) or flips its sign (fermions, half-integer spin).",
        "Pauli: two identical fermions never share a state, so each orbital holds two electrons of opposite spin.",
        "Screening makes s orbitals lower than p and d; subshells fill by the n + l rule, and full p subshells end the rows of the periodic table at the noble gases.",
        "Fermions packed together fill levels up to the Fermi energy (7 eV in copper); their degeneracy pressure holds up solids, white dwarfs and neutron stars.",
        "Bosons crowd together: emission into a mode with n photons goes as n + 1, which gives stimulated emission, Bose–Einstein condensates and superfluids.",
        "A laser needs a gain medium with population inversion, a pump and a cavity; above the threshold N₂ − N₁ = κ/g every extra pumped atom becomes coherent light.",
      ]} />
    </Article>
  );
}

"use client";

// Advanced Mechanics 4: statistical mechanics — microstates and macrostates
// (coins), the fundamental assumption, counting energy in an Einstein solid
// (Ω = (q+N−1)!/(q!(N−1)!) by dots and bars), two solids in contact and the
// sharp peak, entropy S = k ln Ω and why it adds, temperature from counting
// (1/T = ∂S/∂E, derived) and the solid's kT = ε/ln(1+N/q) with equipartition
// and Dulong–Petit, the Boltzmann factor derived from a reservoir, the
// partition function, uses (barometric formula, populations of levels,
// reaction rates), the Maxwell–Boltzmann speed distribution, and free energy
// F = E − TS with melting ice as the example.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { EinsteinSolidFigure } from "@/components/lesson/figures/physics/EinsteinSolidFigure";
import { BoltzmannFigure } from "@/components/lesson/figures/physics/BoltzmannFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");
const K_EV = 8.617e-5;   // Boltzmann's constant in eV/K

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** The Boltzmann ratio of two levels ΔE apart at temperature T. */
const ratioNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const kT = K_EV * v.T, x = v.dE / kT, ratio = Math.exp(-x);
  const shown = ratio > 1e-3 ? num(ratio, 4) : `${num(ratio / 10 ** Math.floor(Math.log10(ratio)), 2)} \\times 10^{${Math.floor(Math.log10(ratio))}}`;
  return {
    tex: r`\frac{P_2}{P_1} = e^{-\Delta E / kT} = e^{-${num(v.dE, 2)} / ${num(kT, 4)}} = e^{-${num(x, 1)}} = \green{${shown}}`,
    meter: ratio, meterLabel: `kT = ${num(kT, 4)} eV · ${tx(t, "phStat_liveLevels", "upper level holds")} ${num((100 * ratio) / (1 + ratio), 2)}%`,
  };
};

export function StatisticalMechanicsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phStat_intro",
          "A glass of water holds about 10²⁵ molecules. Nobody will ever follow them one by one, and the chaos chapter showed that even if we tried, the details would be lost within moments. Yet the water's temperature, pressure and boiling point are perfectly predictable. Statistical mechanics, built by Ludwig Boltzmann, Josiah Willard Gibbs and James Clerk Maxwell in the late nineteenth century, explains why: with numbers this large, probabilities become certainties. It derives the laws of thermodynamics from counting, explains what entropy and temperature really are, and gives one formula, the Boltzmann factor, that sets the odds of everything from the thinning of the air with height to the speed of chemical reactions.")}
      </Lead>

      <Goals t={t} id="phStat" items={[
        "Tell microstates from macrostates and count them for coins and for an Einstein solid.",
        "Explain the second law as the overwhelming probability of the macrostate with the most microstates, using S = k ln Ω.",
        "Derive temperature from counting (1/T = ∂S/∂E) and the Boltzmann factor e^(−E/kT).",
        "Use the Boltzmann factor for the atmosphere, energy levels and reaction rates, and free energy for melting.",
      ]} />

      <H2>{tx(t, "phStat_microTitle", "Microstates and macrostates")}</H2>
      <p>
        {tx(t, "phStat_microBody",
          "Toss four coins. A microstate is the full detail: which coin shows what, for example HTTH. A macrostate is what you would measure without looking closely: just the number of heads. There are 2⁴ = 16 microstates but only 5 macrostates, and the macrostates are not equally common, because they contain different numbers of microstates. That number is written Ω (capital omega) and called the multiplicity.")}
      </p>
      <LessonTable
        headers={[tx(t, "phStat_tHeads", "Heads (macrostate)"), tx(t, "phStat_tMicro", "Microstates"), tx(t, "phStat_tOmega", "Ω"), tx(t, "phStat_tProb", "Probability")]}
        rows={[
          ["0", tx(t, "phStat_c0", "TTTT"), "1", "1/16"],
          ["1", tx(t, "phStat_c1", "HTTT, THTT, TTHT, TTTH"), "4", "4/16"],
          ["2", tx(t, "phStat_c2", "HHTT, HTHT, HTTH, THHT, THTH, TTHH"), "6", "6/16"],
          ["3", tx(t, "phStat_c3", "HHHT, HHTH, HTHH, THHH"), "4", "4/16"],
          ["4", tx(t, "phStat_c4", "HHHH"), "1", "1/16"],
        ]}
      />
      <p>
        {tx(t, "phStat_coinsBig",
          "With n coins, the number of microstates with k heads is the binomial coefficient C(n, k) = n! / (k!(n − k)!) from the Math track. For 100 coins, exactly 50 heads can happen in about 10²⁹ ways, all heads in just 1. As n grows, the macrostates near half heads take an ever larger share of all the microstates: the spread around 50% shrinks like 1/√n. For 10²³ coins you would never, in the life of the universe, see the fraction of heads differ from one half in the tenth decimal place.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phStat_assumption", "The fundamental assumption of statistical mechanics: an isolated system in equilibrium is equally likely to be in any of its accessible microstates (those with the right total energy, number of particles and volume). Nobody has proved it for real systems in general, but the previous chapters make it plausible: chaos mixes states thoroughly, and Liouville's theorem says the motion does not crowd states together, so an even spread stays even.")}
      </Callout>

      <H2>{tx(t, "phStat_einsteinTitle", "Counting energy: the Einstein solid")}</H2>
      <p>
        {tx(t, "phStat_einsteinBody",
          "To count states that carry energy, use the simplest model of a solid, proposed by Albert Einstein in 1907. Each atom vibrates about its place like a mass on a spring, an oscillator, and (a quantum fact, explained in later chapters) the energy of each oscillator comes in equal packets, quanta of size ε. A solid of N oscillators holding q quanta has energy E = qε, and a microstate says how many quanta each oscillator holds.")}
      </p>
      <Derivation t={t} label={tx(t, "phStat_eqOmega", "How many ways to share q quanta among N oscillators")}
        steps={[
          { tex: r`\bullet\bullet\,|\,\,|\,\bullet\bullet\bullet\,|\,\bullet`, why: tx(t, "phStat_o1", "draw the quanta as q dots and separate the oscillators with N − 1 bars: this picture is 2, 0, 3 and 1 quanta in N = 4 oscillators with q = 6") },
          { tex: r`q + N - 1 \text{ symbols}`, why: tx(t, "phStat_o2", "every microstate is one such row, and every row is one microstate") },
          { tex: r`\green{\Omega(N, q) = \binom{q + N - 1}{q} = \frac{(q + N - 1)!}{q!\,(N - 1)!}}`, why: tx(t, "phStat_o3", "count the rows: choose which q of the q + N − 1 positions hold dots") },
        ]} />
      <p>
        {tx(t, "phStat_einsteinSmall",
          "Three oscillators sharing three quanta: Ω = 5!/(3! 2!) = 10. The numbers explode quickly. A tiny solid of 300 oscillators holding 100 quanta has about 10⁹⁶ microstates, more than there are atoms in the observable universe.")}
      </p>

      <H2>{tx(t, "phStat_contactTitle", "Two solids in contact")}</H2>
      <p>
        {tx(t, "phStat_contactBody",
          "Put two Einstein solids, A and B, side by side so that quanta can pass between them, and isolate the pair. The total q is fixed, but it can be split in many ways: q_A in A and q − q_A in B. For each split, the number of microstates of the pair is the product Ω_A(q_A) × Ω_B(q − q_A), since every arrangement in A can go with every arrangement in B. By the fundamental assumption, the probability of a split is proportional to that product.")}
      </p>
      <EinsteinSolidFigure t={t} />
      <p>
        {tx(t, "phStat_contactResult",
          "This is the second law of thermodynamics, explained. Heat flows from a hot body to a cold one because there are vastly more microstates with the energy shared than with it bunched up, and random exchanges carry the system into the crowd. With two solids of 10²³ atoms, the peak is so narrow that the split never measurably differs from the most probable one, and a spontaneous flow from cold to hot is not forbidden but so improbable that it has never been seen.")}
      </p>

      <H2>{tx(t, "phStat_entropyTitle", "Entropy")}</H2>
      <Equation label={tx(t, "phStat_eqS", "Boltzmann's entropy")}
        where={[
          [r`S`, tx(t, "phStat_wS", "the entropy of a macrostate (J/K)")],
          [r`k`, tx(t, "phStat_wK", "Boltzmann's constant, 1.381 × 10⁻²³ J/K; it converts a pure count into thermodynamic units")],
          [r`\Omega`, tx(t, "phStat_wOmega", "the number of microstates in that macrostate")],
        ]}
        words={tx(t, "phStat_sWords", "Entropy is the logarithm of the number of ways a system can be arranged without looking any different.")}
        note={tx(t, "phStat_sNote", "Why a logarithm? For two independent systems the microstates multiply, Ω = Ω_A Ω_B, but entropy, like energy, should add, S = S_A + S_B. The logarithm turns products into sums. It also tames the numbers: Ω of 10^(10²³) becomes an entropy of a few joules per kelvin.")}>
        {r`S = k \ln \Omega`}
      </Equation>
      <p>
        {tx(t, "phStat_secondLaw",
          "In this language the second law reads: an isolated system moves towards the macrostate of largest Ω, and so of largest entropy, and stays there. The thermodynamics chapter defined entropy differently, by ΔS = Q/T, the heat added at temperature T. The two definitions agree, as the next section shows. They are one quantity seen from inside and from outside.")}
      </p>

      <H2>{tx(t, "phStat_tempTitle", "Temperature from counting")}</H2>
      <Derivation t={t} label={tx(t, "phStat_eqT", "What the two solids agree on at equilibrium")}
        steps={[
          { tex: r`S_{tot} = S_A(E_A) + S_B(E - E_A)`, why: tx(t, "phStat_t1", "the total entropy for a split that gives energy E_A to A; the total E is fixed") },
          { tex: r`\frac{dS_{tot}}{dE_A} = \frac{\partial S_A}{\partial E_A} - \frac{\partial S_B}{\partial E_B} = 0`, why: tx(t, "phStat_t2", "at the most probable split the entropy is at its peak, so its slope is zero (chain rule: E_B = E − E_A falls as E_A rises)") },
          { tex: r`\frac{\partial S_A}{\partial E_A} = \frac{\partial S_B}{\partial E_B}`, why: tx(t, "phStat_t3", "in equilibrium, the two solids have the same slope of entropy against energy") },
          { tex: r`\green{\frac{1}{T} = \frac{\partial S}{\partial E}}`, why: tx(t, "phStat_t4", "and bodies in equilibrium have the same temperature: so this slope is (one over) the temperature. Energy flows towards the body whose entropy rises faster with energy, the colder one") },
        ]} />
      <Derivation t={t} label={tx(t, "phStat_eqSolidT", "The temperature of an Einstein solid")}
        steps={[
          { tex: r`\ln n! \approx n\ln n - n`, why: tx(t, "phStat_st1", "Stirling's approximation, excellent for large n") },
          { tex: r`\frac{S}{k} \approx (q + N)\ln(q + N) - q\ln q - N\ln N`, why: tx(t, "phStat_st2", "apply it to ln Ω with large q and N (the −1's no longer matter, and the −n terms cancel)") },
          { tex: r`\frac{1}{T} = \frac{1}{\varepsilon}\frac{\partial S}{\partial q} = \frac{k}{\varepsilon}\ln\frac{q + N}{q}`, why: tx(t, "phStat_st3", "E = qε, so ∂/∂E = (1/ε) ∂/∂q; the derivative of n ln n is ln n + 1, and the +1's cancel") },
          { tex: r`\green{kT = \frac{\varepsilon}{\ln(1 + N/q)}}`, why: tx(t, "phStat_st4", "the temperature, from nothing but counting; the figure above uses exactly this") },
          { tex: r`q \gg N:\ \ln(1 + N/q) \approx \frac{N}{q} \;\Rightarrow\; \green{E = q\varepsilon \approx N kT}`, why: tx(t, "phStat_st5", "hot enough, each oscillator holds on average kT of energy, whatever ε is") },
        ]} />
      <p>
        {tx(t, "phStat_equip",
          "That last line is the equipartition theorem: in the classical limit, every term in the energy that is a square, such as ½mv² or ½kx², holds on average ½kT. An oscillator has two (kinetic and spring), so kT. A gas molecule moving in three directions has three, so (3/2)kT, the result of kinetic theory in the thermodynamics chapter. A solid has 3 oscillators per atom (one for each direction), so 3kT per atom and a heat capacity of 3R = 25 J/(mol·K) per mole, the law of Dulong and Petit (1819) that fits most solids at room temperature. When cold, the quanta stop being small compared with kT and the heat capacity falls, which is why diamond, with its stiff bonds, holds much less: one of the first clues that energy comes in quanta.")}
      </p>

      <H2>{tx(t, "phStat_boltzTitle", "The Boltzmann factor")}</H2>
      <p>
        {tx(t, "phStat_boltzBody",
          "Most systems are not isolated: a molecule in a gas, an atom in a solid, a protein in water all sit in contact with surroundings at a fixed temperature T, a reservoir much bigger than themselves. What is the probability that such a small system is in one particular state s, with energy E_s?")}
      </p>
      <Derivation t={t} label={tx(t, "phStat_eqBoltz", "From counting the reservoir's states")}
        steps={[
          { tex: r`P(s) \propto \Omega_R(E_{tot} - E_s)`, why: tx(t, "phStat_b1", "the small system is in the single state s; all the freedom is in the reservoir, which has the rest of the energy, and every microstate of the whole is equally likely") },
          { tex: r`\Omega_R = e^{S_R/k}`, why: tx(t, "phStat_b2", "turn Boltzmann's entropy round") },
          { tex: r`S_R(E_{tot} - E_s) \approx S_R(E_{tot}) - \frac{\partial S_R}{\partial E}E_s = S_R(E_{tot}) - \frac{E_s}{T}`, why: tx(t, "phStat_b3", "E_s is tiny compared with the reservoir's energy, so keep the first term of the Taylor series, and the slope is 1/T") },
          { tex: r`\green{P(s) = \frac{e^{-E_s/kT}}{Z}}`, why: tx(t, "phStat_b4", "the constant e^(S_R(E_tot)/k) is the same for every state, so it goes into the normalising number Z") },
        ]} />
      <Equation label={tx(t, "phStat_eqZ", "The Boltzmann distribution and the partition function")}
        where={[
          [r`P(s)`, tx(t, "phStat_wP", "the probability that the system is in state s")],
          [r`E_s`, tx(t, "phStat_wEs", "the energy of that state")],
          [r`kT`, tx(t, "phStat_wKT", "the thermal energy scale: 0.0253 eV, about 1/40 eV, at room temperature")],
          [r`Z`, tx(t, "phStat_wZ", "the partition function, the sum of e^(−E/kT) over all states, which makes the probabilities add up to 1")],
        ]}
        words={tx(t, "phStat_zWords", "Each state's odds fall off exponentially with its energy, measured in units of kT. States much higher than kT are almost never occupied.")}
        note={tx(t, "phStat_zNote", "Z looks like a mere normalising constant, but it holds everything: the average energy is ⟨E⟩ = −∂ ln Z/∂β with β = 1/kT, and the free energy is F = −kT ln Z. Computing Z is the main job of statistical mechanics.")}>
        {r`P(s) = \frac{1}{Z}\,e^{-E_s/kT}, \qquad Z = \sum_s e^{-E_s/kT}`}
      </Equation>
      <BoltzmannFigure t={t} />
      <LiveFormula label={tx(t, "phStat_liveRatio", "Try it: how full is a higher energy level?")}
        tex={r`\frac{P_2}{P_1} = e^{-\Delta E / kT}`}
        vars={[
          { id: "dE", label: "ΔE (eV)", min: 0.01, max: 3, step: 0.01, value: 0.1, fmt: v => `${num(v, 2)} eV` },
          { id: "T", label: "T (K)", min: 50, max: 10000, step: 10, value: 300, fmt: v => `${num(v, 0)} K` },
        ]}
        compute={ratioNumbers(t)}
        note={tx(t, "phStat_liveNote", "At room temperature kT is 0.025 eV. A level 0.1 eV up holds about 2% as many molecules as the lower one; a level 2 eV up, the size of the energy of visible light, essentially none, which is why things at room temperature do not glow. Heat to 6000 K, the Sun's surface, and the 2 eV level fills to about 2% too, which is why the Sun shines in visible light.")} />

      <H3>{tx(t, "phStat_usesTitle", "One factor, many uses")}</H3>
      <LessonTable
        headers={[tx(t, "phStat_tWhere", "Where"), tx(t, "phStat_tEnergy", "Energy E"), tx(t, "phStat_tResult", "Result")]}
        rows={[
          [tx(t, "phStat_u1a", "the atmosphere"), tx(t, "phStat_u1b", "mgh, a molecule's weight times its height"), tx(t, "phStat_u1c", "density falls as e^(−mgh/kT): it halves about every 5.8 km (scale height kT/mg ≈ 8.4 km)")],
          [tx(t, "phStat_u2a", "chemical reactions"), tx(t, "phStat_u2b", "the activation energy E_a needed to react"), tx(t, "phStat_u2c", "rate ∝ e^(−E_a/kT) (Arrhenius): with E_a ≈ 50 kJ/mol, about twice as fast for every 10 °C warmer")],
          [tx(t, "phStat_u3a", "evaporation"), tx(t, "phStat_u3b", "the energy to escape the liquid"), tx(t, "phStat_u3c", "vapour pressure rises steeply with temperature; the fastest molecules leave and the liquid cools")],
          [tx(t, "phStat_u4a", "semiconductors"), tx(t, "phStat_u4b", "the band gap, about 1.1 eV in silicon"), tx(t, "phStat_u4c", "free charge carriers ∝ e^(−E_g/2kT): silicon conducts far better when hot (solids chapter)")],
          [tx(t, "phStat_u5a", "stars"), tx(t, "phStat_u5b", "the levels of atoms"), tx(t, "phStat_u5c", "which spectral lines a star shows tells its surface temperature")],
        ]}
      />

      <H2>{tx(t, "phStat_maxwellTitle", "The speeds of molecules")}</H2>
      <p>
        {tx(t, "phStat_maxwellBody",
          "Apply the Boltzmann factor to a molecule of a gas, whose energy is its kinetic energy ½mv². The chance of a velocity is proportional to e^(−mv²/2kT). To get the chance of a speed v, whatever the direction, multiply by the number of velocities with that speed, which grows like the area of a sphere of radius v, 4πv². The result, found by Maxwell in 1860, is the distribution of molecular speeds.")}
      </p>
      <Equation label={tx(t, "phStat_eqMB", "The Maxwell–Boltzmann speed distribution")}
        where={[
          [r`f(v)\,dv`, tx(t, "phStat_wF", "the fraction of molecules with speed between v and v + dv")],
          [r`m`, tx(t, "phStat_wM", "the mass of one molecule (kg)")],
          [r`4\pi v^2`, tx(t, "phStat_wSphere", "how many directions share the speed v: few for slow molecules, many for fast ones")],
          [r`e^{-mv^2/2kT}`, tx(t, "phStat_wBoltz", "the Boltzmann factor of the kinetic energy: very fast molecules are rare")],
        ]}
        words={tx(t, "phStat_mbWords", "Few molecules are very slow (there are few ways to be slow) and few are very fast (the energy costs too much); most are in between.")}
        note={tx(t, "phStat_mbNote", "Three speeds summarise it: the most probable √(2kT/m), the mean √(8kT/πm), and the root-mean-square √(3kT/m), which sets the kinetic energy. For nitrogen at 300 K they are 422, 476 and 517 m/s, faster than sound in air (347 m/s), as they must be, since sound is carried by those molecules.")}>
        {r`f(v) = 4\pi v^2 \left(\frac{m}{2\pi kT}\right)^{3/2} e^{-mv^2/2kT}`}
      </Equation>

      <H2>{tx(t, "phStat_freeTitle", "Free energy: energy against entropy")}</H2>
      <p>
        {tx(t, "phStat_freeBody",
          "At a fixed temperature, what does a system settle into? Not simply the state of lowest energy, and not simply the one of highest entropy, but a balance. Lowering its energy by E gives the surroundings heat E, which raises their entropy by E/T; so the total entropy rises by ΔS − ΔE/T. Maximising the total entropy is the same as minimising the free energy F = E − TS. At low temperature the energy term wins and things order themselves; at high temperature the entropy term wins and they disorder.")}
      </p>
      <Equation label={tx(t, "phStat_eqF", "The free energy, minimised at fixed temperature")}
        where={[
          [r`F`, tx(t, "phStat_wFree", "the (Helmholtz) free energy (J)")],
          [r`E`, tx(t, "phStat_wE", "the system's energy")],
          [r`T S`, tx(t, "phStat_wTS", "temperature times entropy: how much the system's disorder is worth at this temperature")],
        ]}
        words={tx(t, "phStat_fWords", "At constant temperature, a system goes to the state that best balances low energy against high entropy.")}>
        {r`F = E - T S`}
      </Equation>
      <p>
        {tx(t, "phStat_ice",
          "Ice and water are the classic case. Melting a mole of ice takes 6.01 kJ (water has more energy) and raises its entropy by 22.0 J/K (the molecules are freer). The free energy of melting is ΔF ≈ 6010 − T × 22.0. Below 6010/22.0 = 273 K it is positive, so ice is preferred; above, negative, so water is. The melting point, 0 °C, is just the temperature where energy and entropy break even. The same balance decides when proteins unfold, when magnets lose their magnetism and when the early universe's particles froze out.")}
      </p>

      <H2>{tx(t, "phStat_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phStat_ex1", "1. Ten coins: 5 heads can happen in C(10, 5) = 252 ways out of 2¹⁰ = 1024, a probability of 25%. All heads: 1 in 1024.")}</p>
      <p>{tx(t, "phStat_ex2", "2. An Einstein solid with N = 4 oscillators and q = 2 quanta: Ω = 5!/(2! 3!) = 10 (two quanta in one oscillator: 4 ways; in two different ones: 6 ways).")}</p>
      <p>{tx(t, "phStat_ex3", "3. Air (mostly N₂ and O₂, m ≈ 29 u = 4.8 × 10⁻²⁶ kg) at 288 K: scale height kT/mg = (1.38 × 10⁻²³ × 288)/(4.8 × 10⁻²⁶ × 9.8) = 8.4 km. At the top of Everest, 8.8 km, the density is about e^(−8.8/8.4) ≈ 35% of sea level, close to the real value of about a third.")}</p>
      <p>{tx(t, "phStat_ex4", "4. A reaction with E_a = 50 kJ/mol goes from 25 °C to 35 °C: the rate grows by e^((50 000/8.314)(1/298 − 1/308)) = e^0.66 = 1.9, nearly double. This is why food keeps longer in the fridge.")}</p>
      <p>{tx(t, "phStat_ex5", "5. Helium atoms (m = 6.6 × 10⁻²⁷ kg) at 300 K have an rms speed √(3kT/m) = √(3 × 1.38 × 10⁻²³ × 300 / 6.6 × 10⁻²⁷) = 1 370 m/s, about 2.6 times that of nitrogen, because they are 7 times lighter (√7 ≈ 2.6).")}</p>

      <H2>{tx(t, "phStat_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phStat_tWrong", "Wrong"), tx(t, "phStat_tRight", "Right"), tx(t, "phStat_tWhy", "Why")]}
        rows={[
          [tx(t, "phStat_m1w", "every macrostate is equally likely"), tx(t, "phStat_m1r", "every microstate is"), tx(t, "phStat_m1", "macrostates with more microstates are more likely")],
          [tx(t, "phStat_m2w", "entropy is disorder"), tx(t, "phStat_m2r", "entropy counts microstates"), tx(t, "phStat_m2", "\"disorder\" is a loose picture; S = k ln Ω is the definition")],
          [tx(t, "phStat_m3w", "the second law is absolute"), tx(t, "phStat_m3r", "it is overwhelmingly probable"), tx(t, "phStat_m3", "small systems do fluctuate backwards now and then")],
          [tx(t, "phStat_m4w", "temperature is energy"), tx(t, "phStat_m4r", "1/T = ∂S/∂E"), tx(t, "phStat_m4", "two bodies with the same energy can have different temperatures")],
          [tx(t, "phStat_m5w", "higher states are empty"), tx(t, "phStat_m5r", "less full by e^(−ΔE/kT)"), tx(t, "phStat_m5", "a level a few kT up still holds a fair share")],
          [tx(t, "phStat_m6w", "systems seek the lowest energy"), tx(t, "phStat_m6r", "at fixed T, the lowest F = E − TS"), tx(t, "phStat_m6", "otherwise ice would never melt")],
        ]}
      />

      <KeyIdeas t={t} id="phStat" items={[
        "A microstate is the full detail of a system, a macrostate what we measure; Ω counts the microstates in a macrostate, and all microstates are equally likely.",
        "An Einstein solid of N oscillators with q quanta has Ω = (q + N − 1)!/(q!(N − 1)!); shared between two solids, the energy almost certainly ends up near the peak of Ω_A Ω_B.",
        "Entropy is S = k ln Ω; the second law says isolated systems go to the macrostate with the most microstates.",
        "Temperature is 1/T = ∂S/∂E; in equilibrium each quadratic energy term holds ½kT (equipartition).",
        "A system in contact with surroundings at T is in a state of energy E with probability e^(−E/kT)/Z: the Boltzmann factor.",
        "At fixed temperature systems minimise the free energy F = E − TS: energy and entropy compete, as in melting.",
      ]} />
    </Article>
  );
}

"use client";

// Nuclear, particles & cosmos 1: the nucleus — protons and neutrons, size
// R = r₀A^(1/3) and nuclear density, the strong force, the binding-energy
// curve and the semi-empirical mass formula, alpha, beta and gamma decay and
// the valley of stability, the decay law N = N₀e^(−λt) with half-life,
// activity and radiocarbon dating, alpha decay as tunnelling, fission and
// the chain reaction (k, critical size, delayed neutrons), fusion, the
// Coulomb barrier and the Sun's proton–proton chain, and fusion on Earth.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BindingCurveFigure } from "@/components/lesson/figures/physics/BindingCurveFigure";
import { DecayFigure } from "@/components/lesson/figures/physics/DecayFigure";
import { ChainReactionFigure } from "@/components/lesson/figures/physics/ChainReactionFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Age of a sample from the fraction of its carbon-14 that is left. */
const datingNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const age = (5730 / Math.LN2) * Math.log(100 / v.f);
  return {
    tex: r`t = \frac{5730\ \text{${tx(t, "phNuc_liveY", "y")}}}{0.693}\,\ln\frac{100}{${num(v.f, 1)}} = \amber{${Math.round(age).toLocaleString("en-US").replace(/,/g, "\\,")}\ \text{${tx(t, "phNuc_liveYears", "years")}}}`,
    meter: Math.min(1, age / 50000),
    meterLabel: `${num(age / 5730, 2)} ${tx(t, "phNuc_liveHalves", "half-lives")}`,
  };
};

/** Coulomb barrier between two nuclei that just touch. */
const barrierNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const A = (z: number) => (z === 1 ? 1 : 2 * z);
  const rr = 1.2 * (A(v.z1) ** (1 / 3) + A(v.z2) ** (1 / 3));
  const E = (1.44 * v.z1 * v.z2) / rr;
  const T = (E * 1e6) / 8.617e-5;
  return {
    tex: r`E_C = \frac{1.44\ \text{MeV fm}\times${v.z1}\times${v.z2}}{${num(rr, 2)}\ \text{fm}} = \amber{${num(E, 2)}\ \text{MeV}}`,
    meter: Math.min(1, E / 6),
    meterLabel: `${tx(t, "phNuc_liveT", "as a temperature")}: ${(T / 1e9).toFixed(1)} × 10⁹ K, ${Math.round((E * 1e6) / 1350)} × ${tx(t, "phNuc_liveSun", "the Sun's core kT")}`,
  };
};

export function NuclearContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phNuc_intro",
          "Every atom has at its centre a nucleus 100 000 times smaller than the atom itself, holding 99.97% of its mass. Chemistry happens in the electron clouds and never touches it, with energies of a few electronvolts. The nucleus works with millions of electronvolts: it is held together by a force far stronger than electricity, it can fall apart on its own (radioactivity), it can split (fission) and it can merge with another (fusion). That last process is what powers every star, and the first two run nuclear reactors and tell us the age of rocks and bones.")}
      </Lead>

      <Goals t={t} id="phNuc" items={[
        "Describe what a nucleus is made of, how large it is and what holds it together.",
        "Read the binding-energy curve and explain each term of the formula behind it.",
        "Use the decay law, half-lives and activities, including radiocarbon dating.",
        "Explain how fission and fusion release energy, what a chain reaction needs and why fusion is so hard.",
      ]} />

      <H2>{tx(t, "phNuc_insideTitle", "Inside the nucleus")}</H2>
      <p>
        {tx(t, "phNuc_insideBody",
          "In 1911 Ernest Rutherford's students fired alpha particles at gold foil. Almost all went straight through, but about one in 8000 bounced back, as if it had hit something tiny and heavy: the nucleus. It is made of protons (charge +e) and neutrons (no charge, found by James Chadwick in 1932), together called nucleons, of almost equal mass. Three numbers name a nucleus: Z protons, which fix the element, N neutrons, and the mass number A = Z + N. Nuclei with the same Z and different N are isotopes of one element: carbon-12 has 6 protons and 6 neutrons, carbon-14 has 6 and 8. Scattering experiments show that nuclei are roughly balls whose volume grows in proportion to A.")}
      </p>
      <Equation label={tx(t, "phNuc_eqR", "The size of a nucleus")}
        where={[
          [r`R`, tx(t, "phNuc_wR", "the radius of the nucleus")],
          [r`r_0`, tx(t, "phNuc_wR0", "about 1.2 femtometres (1 fm = 10⁻¹⁵ m), the same for every nucleus: roughly the size of one nucleon")],
          [r`A`, tx(t, "phNuc_wA", "the mass number, the number of nucleons")],
        ]}
        words={tx(t, "phNuc_rWords", "The volume of a nucleus is proportional to the number of nucleons in it: they pack like marbles in a bag.")}
        note={tx(t, "phNuc_rNote", "Uranium-238: R = 1.2 × 238^(1/3) = 7.4 fm. Since volume ∝ A, every nucleus has the same density, one nucleon mass per (4/3)πr₀³: 1.67 × 10⁻²⁷ kg / 7.2 × 10⁻⁴⁵ m³ = 2.3 × 10¹⁷ kg/m³. A teaspoon of nuclear matter would weigh a billion tonnes; neutron stars are made of it.")}>
        {r`R = r_0\,A^{1/3}`}
      </Equation>

      <H2>{tx(t, "phNuc_strongTitle", "The strong force")}</H2>
      <p>
        {tx(t, "phNuc_strongBody",
          "Two protons 2 fm apart repel each other with an electric force of about 58 newtons, an enormous force on a particle of 10⁻²⁷ kg. Something stronger must hold them together: the strong nuclear force, which acts between protons and neutrons alike. It has three odd features. It is short-ranged: strong out to about 2 fm and then gone, so a nucleon feels only its nearest neighbours. It saturates: adding nucleons does not make each one more bound, because each already has all the neighbours it can touch. And it repels at very short distance, below about 0.5 fm, which stops nuclei collapsing. Neutrons are the glue: they add strong attraction without adding electric repulsion. That is why heavy nuclei need more neutrons than protons (lead-208 has 126 neutrons for 82 protons).")}
      </p>

      <H2>{tx(t, "phNuc_curveTitle", "The binding-energy curve")}</H2>
      <p>
        {tx(t, "phNuc_curveBody",
          "The relativistic energy chapter showed that a bound nucleus weighs less than its parts, and that the missing mass times c² is the binding energy B: 28.3 MeV for helium-4. The number that matters for energy production is the binding energy per nucleon, B/A, the energy needed on average to pull one nucleon out. Measured across all nuclei it rises steeply from hydrogen, peaks near iron and nickel at about 8.8 MeV and falls slowly for heavier nuclei. In 1935 Carl Friedrich von Weizsäcker explained this shape with a formula that treats the nucleus as a drop of charged liquid. Each term has a physical cause; switch them off in the figure to see what each does.")}
      </p>
      <BindingCurveFigure t={t} />
      <Equation label={tx(t, "phNuc_eqSemf", "The semi-empirical mass formula")}
        where={[
          [r`a_V A`, tx(t, "phNuc_wV", "volume term, a_V = 15.75 MeV: each nucleon bound to its neighbours, so the total grows like the number of nucleons")],
          [r`a_S A^{2/3}`, tx(t, "phNuc_wS", "surface term, a_S = 17.8 MeV: nucleons at the surface have fewer neighbours. The surface area grows like R², which is A^(2/3)")],
          [r`a_C \frac{Z(Z-1)}{A^{1/3}}`, tx(t, "phNuc_wC", "Coulomb term, a_C = 0.711 MeV: every pair of the Z protons repels; there are Z(Z − 1)/2 pairs, each at a distance of order R ∝ A^(1/3)")],
          [r`a_A \frac{(A-2Z)^2}{A}`, tx(t, "phNuc_wAs", "asymmetry term, a_A = 23.7 MeV: protons and neutrons each fill their own ladder of levels (Pauli, the many-particles chapter), so having more of one kind puts nucleons on higher rungs")],
          [r`\delta`, tx(t, "phNuc_wP", "pairing term, about ±11.2/√A MeV: + if Z and N are both even, − if both odd, 0 if A is odd. Like nucleons bind a little better in pairs")],
        ]}
        words={tx(t, "phNuc_semfWords", "The binding is a fixed amount per nucleon, minus a penalty for the surface, minus the protons' repulsion, minus a penalty for unequal numbers, plus a bonus for pairs.")}
        note={tx(t, "phNuc_semfNote", "For iron-56 (Z = 26): 882 − 260.6 − 120.8 − 6.8 + 1.5 = 495.3 MeV, or 8.84 MeV per nucleon; the measured value is 8.79. Five numbers fitted once reproduce the binding of thousands of nuclei to within about 1%, except for the lightest, and a few 'magic' nuclei bound extra tightly, the nuclear shell model's echo of the noble gases.")}>
        {r`\begin{gathered}B(A,Z) = a_V A - a_S A^{2/3} - a_C \frac{Z(Z-1)}{A^{1/3}} \\ - a_A \frac{(A-2Z)^2}{A} + \delta\end{gathered}`}
      </Equation>
      <Callout type="tip" t={t}>
        {tx(t, "phNuc_peak", "The peak tells you which way to go for energy. Below iron, joining nuclei (fusion) moves up the curve, so it releases energy; above iron, splitting them (fission) does. Iron and nickel are the ash of both: the most tightly bound matter there is. This is why stars that burn up to iron have nothing left to burn, and why every element heavier than iron had to be made in rare, violent events that put energy in, such as supernovae and neutron-star collisions.")}
      </Callout>

      <H2>{tx(t, "phNuc_decayTitle", "Radioactivity")}</H2>
      <p>
        {tx(t, "phNuc_decayBody",
          "In 1896 Henri Becquerel found that uranium salts fog a photographic plate in the dark. Marie and Pierre Curie went on to find polonium and radium, and Rutherford sorted the rays by how far they get: alpha rays stop in a sheet of paper, beta rays in a few millimetres of aluminium, gamma rays need centimetres of lead. Each is a way for an unstable nucleus to move to a lower energy. Plot every known nucleus by N and Z and the stable ones lie in a narrow valley; the rest decay towards it.")}
      </p>
      <LessonTable
        headers={[tx(t, "phNuc_tDecay", "Decay"), tx(t, "phNuc_tWhat", "What leaves"), tx(t, "phNuc_tChange", "Change"), tx(t, "phNuc_tWho", "Who does it"), tx(t, "phNuc_tEx", "Example")]}
        rows={[
          [tx(t, "phNuc_d1", "alpha (α)"), tx(t, "phNuc_d1w", "a helium-4 nucleus"), "A − 4, Z − 2", tx(t, "phNuc_d1h", "heavy nuclei, too big to hold together"), "U-238 → Th-234 + α"],
          [tx(t, "phNuc_d2", "beta minus (β⁻)"), tx(t, "phNuc_d2w", "an electron and an antineutrino; a neutron became a proton"), "Z + 1", tx(t, "phNuc_d2h", "nuclei with too many neutrons"), "C-14 → N-14 + e⁻ + ν̄"],
          [tx(t, "phNuc_d3", "beta plus (β⁺)"), tx(t, "phNuc_d3w", "a positron and a neutrino; a proton became a neutron"), "Z − 1", tx(t, "phNuc_d3h", "nuclei with too many protons"), "F-18 → O-18 + e⁺ + ν"],
          [tx(t, "phNuc_d4", "electron capture"), tx(t, "phNuc_d4w", "a neutrino; the nucleus swallowed an inner electron"), "Z − 1", tx(t, "phNuc_d4h", "proton-rich nuclei"), "K-40 → Ar-40 + ν (11%)"],
          [tx(t, "phNuc_d5", "gamma (γ)"), tx(t, "phNuc_d5w", "a photon of MeV energy"), tx(t, "phNuc_d5c", "none: an excited nucleus drops to a lower level"), tx(t, "phNuc_d5h", "nuclei left excited by another decay"), "Co-60 → Ni-60* → Ni-60 + 2γ"],
        ]}
      />
      <p>
        {tx(t, "phNuc_betaBody",
          "Beta decay puzzled physicists for twenty years: the electron came out with any energy up to a maximum, as if energy were lost. In 1930 Wolfgang Pauli proposed a third particle that carried the rest away unseen: the neutrino, which interacts so weakly that it can cross the Earth without stopping. It was detected only in 1956, next to a nuclear reactor. The force behind beta decay is the weak force of the next chapter.")}
      </p>

      <H2>{tx(t, "phNuc_lawTitle", "The decay law")}</H2>
      <p>
        {tx(t, "phNuc_lawBody",
          "A nucleus does not age. Whatever has happened to it, its chance of decaying in the next second is always the same number λ, the decay constant. Nobody can say which nucleus will go next, but with many of them the pattern is exact. The figure follows 400 nuclei one by one.")}
      </p>
      <DecayFigure t={t} />
      <Derivation t={t} label={tx(t, "phNuc_lawDer", "From a constant chance to the exponential law")}
        steps={[
          { tex: r`dN = -\lambda N\,dt`, why: tx(t, "phNuc_l1", "of N nuclei, each decays in a short time dt with chance λ dt, so on average λN dt of them go") },
          { tex: r`\frac{dN}{N} = -\lambda\,dt \;\Rightarrow\; \ln N = -\lambda t + \text{const}`, why: tx(t, "phNuc_l2", "separate the variables and integrate both sides (the differential equations chapter of the Math track)") },
          { tex: r`N(t) = N_0\,e^{-\lambda t}`, why: tx(t, "phNuc_l3", "take the exponential; at t = 0 there are N₀ nuclei") },
          { tex: r`\frac12 = e^{-\lambda T_{1/2}} \;\Rightarrow\; \green{T_{1/2} = \frac{\ln 2}{\lambda}}`, why: tx(t, "phNuc_l4", "the half-life is the time for half to go: the same however many there are, and the same for every later half") },
        ]} />
      <Equation label={tx(t, "phNuc_eqLaw", "Half-life and activity")}
        where={[
          [r`N_0,\ N(t)`, tx(t, "phNuc_wN", "the number of undecayed nuclei at the start and after a time t")],
          [r`T_{1/2}`, tx(t, "phNuc_wT", "the half-life: from 164 microseconds (polonium-214) to 4.5 billion years (uranium-238) and far beyond")],
          [r`\lambda`, tx(t, "phNuc_wL", "the decay constant, the chance per second that one nucleus decays, ln 2 / T½")],
          [r`A`, tx(t, "phNuc_wAct", "the activity: decays per second, in becquerels (1 Bq = 1 decay per second)")],
        ]}
        words={tx(t, "phNuc_lawWords", "After each half-life, half of what is left remains; the number of decays per second is the decay constant times the number of nuclei.")}
        note={tx(t, "phNuc_lawNote", "One gram of radium-226 (T½ = 1600 years, λ = 1.37 × 10⁻¹¹ per second, N = 2.66 × 10²¹ nuclei) has an activity of 3.7 × 10¹⁰ Bq, the old unit called the curie. Your own body has about 8000 Bq, mostly from potassium-40 and carbon-14.")}>
        {r`\begin{gathered}N(t) = N_0\left(\tfrac12\right)^{t/T_{1/2}} \\ A = \lambda N = \frac{\ln 2}{T_{1/2}}\,N\end{gathered}`}
      </Equation>
      <H3>{tx(t, "phNuc_c14Title", "Radiocarbon dating")}</H3>
      <p>
        {tx(t, "phNuc_c14Body",
          "Cosmic rays keep making carbon-14 high in the atmosphere (a neutron hits nitrogen-14 and knocks out a proton), so the carbon in air, and in everything alive, has a nearly fixed share of it: about 1.2 atoms in every 10¹² carbon atoms. When a plant or animal dies it stops taking in carbon, and its carbon-14 decays with a half-life of 5730 years. Measure the share left and you have the time since death, out to about 50 000 years. For older things, slower clocks are used: potassium-40 → argon-40 (1.25 billion years) dates volcanic rock, and uranium → lead dates the oldest minerals and the Earth itself, 4.54 billion years.")}
      </p>
      <LiveFormula label={tx(t, "phNuc_liveDating", "Try it: how old is the sample?")}
        tex={r`t = \frac{T_{1/2}}{\ln 2}\,\ln\frac{N_0}{N}`}
        vars={[{ id: "f", label: tx(t, "phNuc_liveF", "carbon-14 left (% of a living sample)"), min: 1, max: 100, step: 0.5, value: 25, fmt: v => `${num(v, 1)}%` }]}
        compute={datingNumbers(t)}
        note={tx(t, "phNuc_liveDatingNote", "25% left is two half-lives, 11 460 years. Below about 0.2% (fifty thousand years) there is too little carbon-14 left to count reliably. In practice the result is corrected with a calibration curve, because the atmosphere's share has varied a little over time.")} />
      <Callout type="info" t={t}>
        {tx(t, "phNuc_alpha", "Alpha decay is quantum tunnelling, the effect of the Schrödinger chapter. Inside the nucleus an alpha particle has a few MeV of energy, but the Coulomb wall around the nucleus is about 30 MeV high: classically it could never get out. Its wave leaks through, and the leak is exponentially sensitive to the wall's thickness. That is why polonium-212, with 8.95 MeV alphas, has a half-life of 0.3 microseconds, while thorium-232, with 4.08 MeV alphas, has 14 billion years. A factor of two in energy, a factor of 10²⁴ in half-life (George Gamow, 1928).")}
      </Callout>

      <H2>{tx(t, "phNuc_fissionTitle", "Fission")}</H2>
      <p>
        {tx(t, "phNuc_fissionBody",
          "In December 1938 Otto Hahn and Fritz Strassmann found barium in uranium they had hit with neutrons, an element half its size. Lise Meitner and Otto Frisch understood within weeks: the nucleus had split in two. A uranium-235 nucleus that absorbs a slow neutron wobbles like a drop of water, stretches, and the electric repulsion of its two halves wins over the surface tension of the strong force. The two pieces fly apart with about 170 MeV of kinetic energy, and two or three neutrons come out as well.")}
      </p>
      <Equation label={tx(t, "phNuc_eqFission", "A typical fission of uranium-235")}
        where={[
          [r`n`, tx(t, "phNuc_wn", "a neutron")],
          [r`{}^{236}\text{U}^{*}`, tx(t, "phNuc_wU", "the uranium-236 formed for an instant, excited by the neutron's binding energy")],
          [r`200\ \text{MeV}`, tx(t, "phNuc_wQ", "the energy released: the fragments sit higher on the binding curve, about 0.9 MeV more per nucleon, times 236 nucleons")],
        ]}
        words={tx(t, "phNuc_fissionWords", "A neutron splits a uranium nucleus into two middle-sized nuclei, three new neutrons and 200 MeV.")}
        note={tx(t, "phNuc_fissionNote", "The numbers balance: 92 = 56 + 36 protons and 236 = 141 + 92 + 3 nucleons. Many other splits happen too; the fragments are neutron-rich and decay by beta decay for years afterwards, which is what makes spent fuel radioactive.")}>
        {r`\begin{gathered}n + {}^{235}\text{U} \;\to\; {}^{236}\text{U}^{*} \\ \to\; {}^{141}\text{Ba} + {}^{92}\text{Kr} + 3n + 200\ \text{MeV}\end{gathered}`}
      </Equation>
      <p>
        {tx(t, "phNuc_chainBody",
          "Those new neutrons can split more nuclei, which release more neutrons: a chain reaction. Whether it grows depends on the multiplication factor k, the number of neutrons in the next generation per neutron in this one. Some neutrons escape through the surface and some are absorbed without fission. A small piece of fuel loses too many through its surface, so there is a critical size, and for a bare sphere of uranium-235 a critical mass of about 52 kg.")}
      </p>
      <ChainReactionFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "phNuc_delayed", "If a neutron generation takes microseconds, how can anyone keep a reactor at exactly k = 1? Thanks to delayed neutrons: about 0.65% of the neutrons from uranium-235 come out seconds later, from the beta decay of fragments. A reactor is run so that it is just below critical on prompt neutrons alone and reaches k = 1 only with the delayed ones, which slows any change to seconds or minutes, enough time for control rods to move. A moderator (water or graphite) slows the neutrons, since slow neutrons are hundreds of times more likely to cause fission in uranium-235. The first reactor, Enrico Fermi's pile of graphite and uranium in Chicago, went critical on 2 December 1942.")}
      </Callout>

      <H2>{tx(t, "phNuc_fusionTitle", "Fusion")}</H2>
      <p>
        {tx(t, "phNuc_fusionBody",
          "At the other end of the curve, light nuclei release energy by joining. The obstacle is their electric repulsion: two nuclei must come within the 2–3 fm reach of the strong force before it can pull them together, and the Coulomb barrier at that distance is hundreds of thousands of electronvolts high.")}
      </p>
      <Equation label={tx(t, "phNuc_eqBarrier", "The Coulomb barrier")}
        where={[
          [r`Z_1, Z_2`, tx(t, "phNuc_wZ", "the charges of the two nuclei, in units of e")],
          [r`\frac{e^2}{4\pi\varepsilon_0}`, tx(t, "phNuc_wE2", "1.44 MeV·fm, a handy form of the Coulomb constant times e² for nuclear sizes")],
          [r`r`, tx(t, "phNuc_wr", "the distance at which the nuclei touch, the sum of their radii r₀A^(1/3)")],
        ]}
        words={tx(t, "phNuc_barrierWords", "The barrier is the electric potential energy of the two charges when their surfaces touch.")}
        note={tx(t, "phNuc_barrierNote", "Two protons: r ≈ 2.4 fm, so E_C ≈ 0.6 MeV. The core of the Sun is at 15.7 million kelvin, where kT is only 1.35 keV, about 440 times too little. Fusion happens anyway by tunnelling, for the few fast protons in the tail of the Maxwell–Boltzmann distribution: the energies that win are a compromise, the Gamow peak, around 6 keV in the Sun.")}>
        {r`\begin{gathered}E_C = \frac{Z_1 Z_2\,e^2}{4\pi\varepsilon_0\,r} \\ r \approx r_0\left(A_1^{1/3} + A_2^{1/3}\right)\end{gathered}`}
      </Equation>
      <LiveFormula label={tx(t, "phNuc_liveBarrier", "Try it: how high is the wall?")}
        tex={r`E_C = \frac{1.44\ \text{MeV fm}\; Z_1 Z_2}{r}`}
        vars={[
          { id: "z1", label: "Z₁", min: 1, max: 8, step: 1, value: 1, fmt: v => String(v) },
          { id: "z2", label: "Z₂", min: 1, max: 8, step: 1, value: 1, fmt: v => String(v) },
        ]}
        compute={barrierNumbers(t)}
        note={tx(t, "phNuc_liveBarrierNote", "Masses are taken as A = 1 for hydrogen and A = 2Z otherwise. The barrier grows with the product of the charges, which is why stars burn hydrogen first, then helium at about 100 million kelvin, then carbon and oxygen at a billion and more: each stage needs a hotter core.")} />
      <p>
        {tx(t, "phNuc_sunBody",
          "In 1939 Hans Bethe worked out how the Sun does it, in steps called the proton–proton chain. Two protons fuse into deuterium, one turning into a neutron by beta-plus decay; this weak step is so slow that a given proton waits about 10 billion years, which is why the Sun burns steadily. Deuterium then quickly picks up a proton to make helium-3, and two helium-3 nuclei make helium-4 and give back two protons. In all, four protons become one helium-4 nucleus and 26.7 MeV, of which about 2% leaves with the neutrinos.")}
      </p>
      <Equation label={tx(t, "phNuc_eqPp", "The Sun's net reaction, and the fusion of reactors")}
        where={[
          [r`e^{+},\ \nu_e`, tx(t, "phNuc_wPos", "two positrons, which at once annihilate with electrons, and two electron neutrinos, which fly straight out of the Sun")],
          [r`\text{D},\ \text{T}`, tx(t, "phNuc_wDT", "deuterium (hydrogen-2) and tritium (hydrogen-3), the easiest fuel: one charge each and an extra-large cross-section")],
        ]}
        words={tx(t, "phNuc_ppWords", "Four hydrogen nuclei become one helium nucleus; on Earth, deuterium and tritium become helium and a fast neutron.")}
        note={tx(t, "phNuc_ppNote", "Every second about 65 billion solar neutrinos cross each square centimetre of your body. In a D–T reactor the 14.1 MeV neutron carries 80% of the energy out of the magnetic cage, to be absorbed in a blanket that heats up and breeds new tritium from lithium.")}>
        {r`\begin{gathered}4\,p \;\to\; {}^{4}\text{He} + 2e^{+} + 2\nu_e + 26.7\ \text{MeV} \\ \text{D} + \text{T} \;\to\; {}^{4}\text{He}\ (3.5\ \text{MeV}) + n\ (14.1\ \text{MeV})\end{gathered}`}
      </Equation>
      <p>
        {tx(t, "phNuc_earthBody",
          "On Earth there is no star's gravity to hold the fuel in, so it must be held another way and heated to about 150 million kelvin, ten times the Sun's core, to make up for having far less of it. John Lawson's criterion (1955) says what is needed: the density n of the plasma, its temperature T and the time τ it holds its heat must together reach n T τ ≥ 3 × 10²¹ keV·s/m³ for D–T fuel. Tokamaks such as ITER hold a thin plasma for seconds in magnetic fields; laser fusion squeezes a frozen pellet for a fraction of a nanosecond. In December 2022 the National Ignition Facility in California got 3.15 MJ of fusion energy out of a pellet hit with 2.05 MJ of laser light, the first time a fusion experiment released more energy than it received (though far less than the power drawn by the lasers).")}
      </p>

      <H2>{tx(t, "phNuc_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phNuc_ex1", "1. Uranium-238 has R = 1.2 × 238^(1/3) = 1.2 × 6.20 = 7.4 fm, a gold nucleus (A = 197) 7.0 fm. The gold atom is about 0.29 nm across, 20 000 times its nucleus: in Rutherford's foil the alpha particles almost always missed.")}</p>
      <p>{tx(t, "phNuc_ex2", "2. Iodine-131 (T½ = 8.02 days) released by a reactor accident: after 80 days, ten half-lives, (1/2)¹⁰ ≈ 1/1000 is left. This is why iodine tablets matter in the first weeks, while caesium-137 (30 years) stays for generations.")}</p>
      <p>{tx(t, "phNuc_ex3", "3. Fission energy from the curve: uranium has B/A ≈ 7.6 MeV, the fragments near A = 120 about 8.5 MeV. The gain is 0.9 MeV for each of 236 nucleons, about 210 MeV, close to the measured 200 MeV. One kilogram of uranium-235 is 2.56 × 10²⁴ nuclei, so 8 × 10¹³ J, as much as burning 2800 tonnes of coal.")}</p>
      <p>{tx(t, "phNuc_ex4", "4. The Sun radiates 3.83 × 10²⁶ W. Each helium-4 made gives 26.7 MeV = 4.28 × 10⁻¹² J, so it makes 9 × 10³⁷ helium nuclei per second, and turns about 600 million tonnes of hydrogen into helium every second.")}</p>

      <H2>{tx(t, "phNuc_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phNuc_tWrong", "Wrong"), tx(t, "phNuc_tRight", "Right"), tx(t, "phNuc_tWhy", "Why")]}
        rows={[
          [tx(t, "phNuc_m1w", "after two half-lives nothing is left"), tx(t, "phNuc_m1r", "a quarter is left"), tx(t, "phNuc_m1", "each half-life halves what remains, not the starting amount")],
          [tx(t, "phNuc_m2w", "an old nucleus is about to decay"), tx(t, "phNuc_m2r", "its chance is the same as a new one's"), tx(t, "phNuc_m2", "nuclei have no memory; that is what makes the law exponential")],
          [tx(t, "phNuc_m3w", "beta electrons come from the electron cloud"), tx(t, "phNuc_m3r", "they are made in the nucleus"), tx(t, "phNuc_m3", "a neutron turns into a proton, an electron and an antineutrino at the moment of decay")],
          [tx(t, "phNuc_m4w", "fission and fusion get energy from destroying mass"), tx(t, "phNuc_m4r", "from moving up the binding curve"), tx(t, "phNuc_m4", "the nucleons all survive; the products are more tightly bound, so they weigh a little less")],
          [tx(t, "phNuc_m5w", "a reactor can explode like a bomb"), tx(t, "phNuc_m5r", "its fuel cannot sustain a fast chain"), tx(t, "phNuc_m5", "reactor uranium is 3–5% uranium-235 and needs slowed neutrons; a bomb needs over 80% and a fast chain. Reactor accidents are steam and chemical explosions and fires")],
        ]}
      />

      <KeyIdeas t={t} id="phNuc" items={[
        "A nucleus has Z protons and N neutrons, A = Z + N nucleons, radius R = 1.2 A^(1/3) fm and the same density in every nucleus, 2.3 × 10¹⁷ kg/m³.",
        "The strong force is short-ranged and saturates; neutrons glue nuclei together without adding repulsion.",
        "Binding energy per nucleon peaks near iron at 8.8 MeV; the semi-empirical mass formula explains the curve with volume, surface, Coulomb, asymmetry and pairing terms.",
        "Unstable nuclei decay by alpha, beta or gamma emission towards the valley of stability, each with a fixed chance per second: N = N₀ e^(−λt), T½ = ln 2/λ, activity A = λN.",
        "Fission of heavy nuclei releases about 200 MeV; a chain reaction needs k ≥ 1, so a critical size, and reactors are controlled thanks to delayed neutrons.",
        "Fusion of light nuclei must overcome the Coulomb barrier by heat and tunnelling; it powers the Sun through the proton–proton chain (26.7 MeV per helium) and needs n T τ ≥ 3 × 10²¹ keV·s/m³ on Earth.",
      ]} />
    </Article>
  );
}

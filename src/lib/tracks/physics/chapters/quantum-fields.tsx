"use client";

// Nuclear, particles & cosmos 3: quantum fields — why relativity and quantum
// mechanics together need fields, the Klein–Gordon equation and its
// dispersion, antiparticles, each field mode as an oscillator whose quanta
// are particles, the vacuum's zero-point energy and the Casimir effect,
// interactions as vertices, the fine-structure constant and Feynman diagrams,
// forces from exchange (Coulomb and Yukawa potentials), the electron's
// magnetic moment, running couplings and asymptotic freedom, and the Higgs
// field: symmetry breaking, the W mass and Yukawa couplings.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { FieldModesFigure } from "@/components/lesson/figures/physics/FieldModesFigure";
import { FeynmanFigure } from "@/components/lesson/figures/physics/FeynmanFigure";
import { HiggsPotentialFigure } from "@/components/lesson/figures/physics/HiggsPotentialFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Casimir pressure between two mirrors a distance d apart. */
const casimirNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const d = v.d * 1e-9, P = (Math.PI ** 2 * 1.0546e-34 * 2.998e8) / (240 * d ** 4);
  const show = P >= 1 ? `${num(P, P < 10 ? 2 : 0)}\\ \\text{Pa}` : `${num(P * 1000, 2)}\\ \\text{mPa}`;
  return {
    tex: r`P = \frac{\pi^2 \times 1.055\times10^{-34} \times 3.00\times10^{8}}{240\times(${num(v.d, 0)}\times10^{-9})^4} = \amber{${show}}`,
    meter: Math.min(1, Math.max(0, (Math.log10(P) + 4) / 9)),
    meterLabel: `${(P / 101325).toExponential(1).replace("e+", "e").replace("-", "−")} ${tx(t, "phQft_liveAtm", "atmospheres")}`,
  };
};

/** The strong coupling at a momentum transfer Q (one loop, five flavours). */
const alphaSNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const Q = 10 ** v.lq, a = (12 * Math.PI) / (23 * Math.log((Q * Q) / (0.09 * 0.09)));
  return {
    tex: r`\alpha_s = \frac{12\pi}{23\,\ln\!\big(${num(Q, Q < 10 ? 2 : 0)}^2/0.09^2\big)} = \amber{${num(a, 3)}}`,
    meter: Math.min(1, a / 0.4),
    meterLabel: `${tx(t, "phQft_liveVs", "compared with α = 1/137:")} ${num(a * 137, 0)} ${tx(t, "phQft_liveTimes", "times stronger")}`,
  };
};

/** Mass of a fermion from its Yukawa coupling to the Higgs field. */
const yukawaNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const y = 10 ** v.ly, m = (y * 246) / Math.SQRT2;
  const show = m >= 1 ? `${num(m, 1)}\\ \\text{GeV}` : m >= 1e-3 ? `${num(m * 1000, 1)}\\ \\text{MeV}` : `${num(m * 1e6, 0)}\\ \\text{keV}`;
  const near = m > 100 ? tx(t, "phQft_liveTop", "the top quark (172.5 GeV)") : m > 2 && m < 7 ? tx(t, "phQft_liveB", "the bottom quark (4.18 GeV)") : m > 0.08 && m < 0.13 ? tx(t, "phQft_liveMu", "the muon (105.7 MeV)") : m > 3e-4 && m < 7e-4 ? tx(t, "phQft_liveE", "the electron (0.511 MeV)") : "";
  return {
    tex: r`m = \frac{y\,v}{\sqrt2} = \frac{${y < 0.01 ? `${num(y * 1e6, 1)}\\times10^{-6}` : num(y, 3)} \times 246\ \text{GeV}}{1.414} = \amber{${show}}`,
    meter: Math.min(1, Math.max(0, (v.ly + 6) / 6)),
    meterLabel: near ? `${tx(t, "phQft_liveLike", "like")} ${near}` : "",
  };
};

export function QuantumFieldsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phQft_intro",
          "Quantum mechanics describes a fixed number of particles; special relativity says energy can turn into new particles. Put the two together and the particle picture breaks. What survives is the idea that the basic things in nature are fields filling all of space, an electron field, a photon field, a quark field for each flavour, and that particles are small, quantised ripples in them. This is quantum field theory, the language of the Standard Model, and its predictions agree with experiment to twelve digits, the best agreement in all of science.")}
      </Lead>

      <Goals t={t} id="phQft" items={[
        "Explain why combining quantum mechanics with relativity leads to fields and antiparticles.",
        "Derive the Klein–Gordon equation and read its waves as particles with E² = (pc)² + (mc²)².",
        "Read a Feynman diagram and say how the fine-structure constant sets the size of each term.",
        "Describe how the Higgs field gives particles mass through spontaneous symmetry breaking.",
      ]} />

      <H2>{tx(t, "phQft_whyTitle", "Why particles have to be fields")}</H2>
      <p>
        {tx(t, "phQft_whyBody",
          "The Schrödinger equation follows one electron, or two, or N: the number is fixed from the start. But a photon with more than 1.022 MeV passing a nucleus can turn into an electron and a positron, and a fast proton hitting another can make pions. Particle number is not conserved, so a theory of a fixed number of particles cannot be the whole story. There is a second hint. Every electron in the universe is exactly identical to every other, the fact behind Pauli's principle and the periodic table. If electrons are all ripples in one electron field that fills space, as all waves on one pond are made of the same water, this is no coincidence: there is only one 'stuff', and an electron is a lump of excitation in it.")}
      </p>

      <H2>{tx(t, "phQft_kgTitle", "A relativistic wave equation")}</H2>
      <p>
        {tx(t, "phQft_kgBody",
          "In the Schrödinger chapter, the equation came from the energy of a free particle, E = p²/2m, by turning E and p into derivatives that act on the wave. Do the same with Einstein's relation from the relativistic energy chapter, and you get the simplest relativistic field equation, written down by Oskar Klein and Walter Gordon (and by Schrödinger himself) in 1926.")}
      </p>
      <Derivation t={t} label={tx(t, "phQft_kgDer", "The Klein–Gordon equation from E² = (pc)² + (mc²)²")}
        steps={[
          { tex: r`E^2 = p^2c^2 + m^2c^4`, why: tx(t, "phQft_k1", "energy and momentum of a free particle of mass m, from the relativity section") },
          { tex: r`E \to i\hbar\frac{\partial}{\partial t}, \qquad p \to -i\hbar\frac{\partial}{\partial x}`, why: tx(t, "phQft_k2", "the quantum rules: on a plane wave e^(i(kx − ωt)) these give E = ħω and p = ħk") },
          { tex: r`-\hbar^2\frac{\partial^2\phi}{\partial t^2} = -\hbar^2c^2\frac{\partial^2\phi}{\partial x^2} + m^2c^4\,\phi`, why: tx(t, "phQft_k3", "apply each side to a field φ(x, t); squaring the operators gives second derivatives") },
          { tex: r`\green{\frac{1}{c^2}\frac{\partial^2\phi}{\partial t^2} - \frac{\partial^2\phi}{\partial x^2} + \left(\frac{mc}{\hbar}\right)^2\phi = 0}`, why: tx(t, "phQft_k4", "divide by −ħ²c²: the wave equation of the waves chapter, plus one term for the mass") },
          { tex: r`\omega^2 = c^2k^2 + \left(\frac{mc^2}{\hbar}\right)^2 \;\Rightarrow\; \omega = \pm\sqrt{\cdots}`, why: tx(t, "phQft_k5", "put in a plane wave: each wavenumber has a frequency, and both signs are solutions") },
        ]} />
      <Equation label={tx(t, "phQft_eqKg", "The Klein–Gordon equation")}
        where={[
          [r`\phi(x,t)`, tx(t, "phQft_wPhi", "the field: one number at every point of space and time (for a spin-0 particle such as the pion or the Higgs boson)")],
          [r`c`, tx(t, "phQft_wC", "the speed of light: without the mass term, ripples of the field travel at exactly c")],
          [r`\frac{mc}{\hbar}`, tx(t, "phQft_wM", "the inverse of the particle's reduced Compton wavelength: the mass acts as a spring that pulls the field back to zero at every point")],
        ]}
        words={tx(t, "phQft_kgWords", "A massive field is a wave equation with an extra spring at every point; its waves are particles obeying Einstein's energy–momentum relation.")}
        note={tx(t, "phQft_kgNote", "The minus-sign solutions, ω < 0, worried Klein, Gordon and Dirac: a particle with negative energy could fall forever. Their modern reading (Stückelberg 1941, Feynman 1949) is that a negative-frequency wave running forward in time is a positive-energy antiparticle. Relativity plus quantum mechanics demands antimatter.")}>
        {r`\frac{1}{c^2}\frac{\partial^2\phi}{\partial t^2} - \nabla^2\phi + \left(\frac{mc}{\hbar}\right)^2\phi = 0`}
      </Equation>
      <p>
        {tx(t, "phQft_latticeBody",
          "A field equation like this is easier to picture on a grid: one oscillator at each point, with a spring to its neighbours and a spring of its own. The figure solves it that way.")}
      </p>
      <FieldModesFigure t={t} />

      <H2>{tx(t, "phQft_quantaTitle", "Quanta: where the particles come from")}</H2>
      <p>
        {tx(t, "phQft_quantaBody",
          "A field obeying a linear equation can be split into independent waves, one for each wavenumber k, its modes, and each mode moves exactly like a harmonic oscillator of frequency ω(k). Quantum mechanics already told us what a quantum oscillator does (the Schrödinger chapter): its energy comes only in steps of ħω above a ground level of ½ħω. For a field, this is the whole story of particles. A mode excited by one step holds one particle of momentum ħk and energy ħω; two steps, two particles. Particles are not little balls added to the field; they are the field's quantised levels of vibration. Planck's packets of light, from the birth of quantum physics, were exactly this: the quanta of the electromagnetic field.")}
      </p>
      <Equation label={tx(t, "phQft_eqH", "The energy of a free quantum field")}
        where={[
          [r`k`, tx(t, "phQft_wK", "a mode, a wave with wavenumber k (in three dimensions, a wave vector)")],
          [r`\omega_k`, tx(t, "phQft_wW", "its frequency, from the field equation: ω = √(c²k² + (mc²/ħ)²)")],
          [r`n_k`, tx(t, "phQft_wN", "how many quanta, particles, are in that mode: 0, 1, 2, … for bosons; only 0 or 1 for fermions, which is Pauli's principle in this language")],
          [r`\tfrac12\hbar\omega_k`, tx(t, "phQft_wZero", "the ground-level energy each mode keeps even when empty")],
        ]}
        words={tx(t, "phQft_hWords", "A field is a collection of oscillators, one per wave; each step up an oscillator's energy ladder is one particle.")}
        note={tx(t, "phQft_hNote", "The state with every n_k = 0 is the vacuum: no particles, but not nothing, since every mode still jitters with its half quantum.")}>
        {r`E = \sum_k \hbar\omega_k\left(n_k + \tfrac12\right)`}
      </Equation>
      <H3>{tx(t, "phQft_vacTitle", "The vacuum is not empty")}</H3>
      <p>
        {tx(t, "phQft_vacBody",
          "Can the vacuum's jitter be seen? Not its total, which is infinite and only differences can be measured. But differences are real. Put two uncharged mirrors close together: between them, only waves that fit the gap are allowed, so there are fewer modes inside than outside, and the outside pushes the mirrors together. Hendrik Casimir predicted this in 1948; Steve Lamoreaux measured it in 1997.")}
      </p>
      <Equation label={tx(t, "phQft_eqCas", "The Casimir pressure")}
        where={[
          [r`P`, tx(t, "phQft_wP", "the pressure pushing two parallel perfect mirrors together")],
          [r`d`, tx(t, "phQft_wD", "the gap between them")],
          [r`\hbar c`, tx(t, "phQft_wHc", "the only constants: the effect is quantum (ħ) and electromagnetic (c), with no charges involved")],
        ]}
        words={tx(t, "phQft_casWords", "Two mirrors in empty space attract, with a pressure that grows as the fourth power of how close they are.")}
        note={tx(t, "phQft_casNote", "The 1/d⁴ makes it tiny at everyday sizes and strong at the nanoscale, where it can make the moving parts of microchips stick together.")}>
        {r`P = \frac{\pi^2 \hbar c}{240\, d^4}`}
      </Equation>
      <LiveFormula label={tx(t, "phQft_liveCas", "Try it: the pull of empty space")}
        tex={r`P = \frac{\pi^2\hbar c}{240\,d^4}`}
        vars={[{ id: "d", label: tx(t, "phQft_liveD", "gap d"), min: 10, max: 2000, step: 10, value: 100, fmt: v => `${num(v, 0)} nm` }]}
        compute={casimirNumbers(t)}
        note={tx(t, "phQft_liveCasNote", "At 100 nm the pressure is about 13 Pa; at 10 nm it is ten thousand times more, 1.3 × 10⁵ Pa, more than atmospheric pressure. At 1 µm it is 1.3 mPa.")} />

      <H2>{tx(t, "phQft_intTitle", "Interactions: vertices and Feynman diagrams")}</H2>
      <p>
        {tx(t, "phQft_intBody",
          "Free fields only ripple through each other. Interactions come from terms in the theory that couple two fields together. In quantum electrodynamics (QED), the theory of electrons and light completed by Feynman, Schwinger and Tomonaga in the late 1940s, there is exactly one such term: the electron field can emit or absorb a photon at a point. That event is a vertex, and its strength is the electron's charge, best expressed as a pure number.")}
      </p>
      <Equation label={tx(t, "phQft_eqAlpha", "The fine-structure constant")}
        where={[
          [r`e`, tx(t, "phQft_wE", "the electron's charge")],
          [r`\varepsilon_0`, tx(t, "phQft_wEps", "the permittivity of empty space, from the electricity section")],
          [r`\hbar c`, tx(t, "phQft_wHc2", "the quantum of action times the speed of light; e²/4πε₀ and ħc both have units of energy × length, so α has no units at all")],
        ]}
        words={tx(t, "phQft_alphaWords", "The strength of electromagnetism is a pure number, about 1/137, the same in every system of units.")}
        note={tx(t, "phQft_alphaNote", "It first appeared in the fine structure of hydrogen's spectral lines (the hydrogen chapter), hence the name. It also gives the electron's speed in hydrogen's ground state, v = αc. Why it has this value, nobody knows.")}>
        {r`\alpha = \frac{e^2}{4\pi\varepsilon_0\,\hbar c} \approx \frac{1}{137.036}`}
      </Equation>
      <p>
        {tx(t, "phQft_feynBody",
          "To compute the chance of any process, say two electrons scattering, quantum field theory adds up the amplitudes of every way it can happen, as in the double slit. Feynman found a way to draw each way as a picture, with a rule that turns the picture into a formula. Each vertex brings a factor of √α, so a picture with more vertices adds a smaller term: the calculation is a series in powers of α, and since α is small the first few pictures give almost all of it.")}
      </p>
      <FeynmanFigure t={t} />
      <Callout type="warn" t={t}>
        {tx(t, "phQft_virtual", "The inner lines of a diagram are often called virtual particles. They are a useful way to talk, but they are terms in a calculation, not particles you could catch: they do not obey E² = (pc)² + (mc²)², and a single diagram is not something that 'happens'. Only the sum of all diagrams is physical.")}
      </Callout>
      <H3>{tx(t, "phQft_forceTitle", "How exchange makes a force")}</H3>
      <p>
        {tx(t, "phQft_forceBody",
          "The photon-exchange diagram, summed over all the photons' possible momenta, gives back exactly Coulomb's law, the 1/r potential of the electricity section. Exchange a particle with mass instead and the potential is cut off at the range ħ/mc found in the particle physics chapter. This is how Yukawa described the nuclear force in 1935.")}
      </p>
      <Equation label={tx(t, "phQft_eqYuk", "Massless and massive exchange")}
        where={[
          [r`V(r)`, tx(t, "phQft_wV", "the potential energy of two particles a distance r apart")],
          [r`g^2`, tx(t, "phQft_wG", "the product of the two vertex strengths; for photons it is e²/ε₀")],
          [r`R = \hbar/mc`, tx(t, "phQft_wR", "the range: the reduced Compton wavelength of the exchanged particle (1.4 fm for the pion)")],
        ]}
        words={tx(t, "phQft_yukWords", "Exchanging a massless particle gives a force that reaches forever; exchanging a heavy one gives a force that dies away exponentially beyond its range.")}
        note={tx(t, "phQft_yukNote", "The exponential is the same e^(−r/R) as the decay of a wave inside a barrier in the tunnelling section: the exchanged particle is 'tunnelling' through a region where it does not have the energy to exist.")}>
        {r`\begin{gathered}V_\gamma(r) = \frac{g^2}{4\pi r} \\ V_{\text{Yukawa}}(r) = -\frac{g^2}{4\pi r}\,e^{-r/R}\end{gathered}`}
      </Equation>

      <H2>{tx(t, "phQft_precTitle", "The most precise theory ever tested")}</H2>
      <p>
        {tx(t, "phQft_precBody",
          "The spin chapter said the electron's magnetic moment has g ≈ 2. Dirac's equation gives exactly 2. QED adds tiny corrections from diagrams where the electron emits and reabsorbs photons, and in 1948 Julian Schwinger computed the first: g/2 = 1 + α/2π. The calculation has since been carried to the fifth order, more than 12 000 diagrams, and compared with an electron held for months in a magnetic trap.")}
      </p>
      <Equation label={tx(t, "phQft_eqG", "The electron's magnetic moment")}
        where={[
          [r`a_e`, tx(t, "phQft_wAe", "the anomaly: how much g/2 exceeds 1")],
          [r`\frac{\alpha}{2\pi}`, tx(t, "phQft_wSch", "Schwinger's term, from one photon emitted and reabsorbed: 0.001 161 4")],
          [r`\cdots`, tx(t, "phQft_wDots", "higher orders, each about α/π ≈ 1/430 times the one before")],
        ]}
        words={tx(t, "phQft_gWords", "The electron is a slightly stronger magnet than the simplest theory says, by about one part in 860, and QED computes the excess to twelve digits.")}
        note={tx(t, "phQft_gNote", "Measured (Northwestern, 2023): a_e = 0.001 159 652 180 59 (13). Theory and experiment agree to about one part in a trillion of g, as far as α itself is known. Schwinger's single term already gets the first three digits.")}>
        {r`\begin{gathered}\frac{g}{2} = 1 + a_e \\ a_e = \frac{\alpha}{2\pi} - 0.3285\left(\frac{\alpha}{\pi}\right)^2 + \cdots \\ = 0.001\,159\,652\,18\ldots\end{gathered}`}
      </Equation>
      <H3>{tx(t, "phQft_runTitle", "Couplings that change with distance")}</H3>
      <p>
        {tx(t, "phQft_runBody",
          "The vacuum around an electron fills with short-lived electron–positron pairs that partly screen its charge, as the molecules of water screen an ion. Probe closer, at higher energy, and you see more of the bare charge: α grows from 1/137 at large distances to about 1/128 at 91 GeV. The strong force does the opposite. Gluons carry colour themselves, and their cloud spreads the colour charge out instead of screening it, so the strong coupling α_s is weak at short distances and strong at long ones. Inside a proton, quarks hit hard move almost freely; pulled apart, they are confined. This asymptotic freedom earned David Gross, Frank Wilczek and David Politzer the 2004 Nobel Prize.")}
      </p>
      <LiveFormula label={tx(t, "phQft_liveAs", "Try it: the strong coupling at an energy Q")}
        tex={r`\alpha_s(Q) = \frac{12\pi}{(33 - 2n_f)\,\ln(Q^2/\Lambda^2)}`}
        vars={[{ id: "lq", label: tx(t, "phQft_liveQ", "energy Q"), min: 0, max: 3, step: 0.01, value: Math.log10(91.19), fmt: v => `${num(10 ** v, 10 ** v < 10 ? 2 : 0)} GeV` }]}
        compute={alphaSNumbers(t)}
        note={tx(t, "phQft_liveAsNote", "The one-loop formula with n_f = 5 quark flavours light enough to matter and Λ = 0.09 GeV, the energy where it blows up. At the Z mass it gives 0.118, the measured value. Towards 1 GeV it climbs fast, and below that the formula, and any calculation by series, breaks down: that is the world of hadrons, which is computed instead on a lattice of spacetime points.")} />

      <H2>{tx(t, "phQft_higgsTitle", "The Higgs field")}</H2>
      <p>
        {tx(t, "phQft_higgsBody",
          "The theory of the weak force has a symmetry (a gauge symmetry, like the one behind electromagnetism) that forbids its carriers from having mass. Yet the W and Z weigh 80 and 91 GeV. In 1964 Robert Brout and François Englert, and Peter Higgs, and Gerald Guralnik, Carl Hagen and Tom Kibble, found the way out: keep the symmetric laws, but let the vacuum itself be lopsided. Fill space with a field whose lowest energy is not at zero.")}
      </p>
      <HiggsPotentialFigure t={t} />
      <Equation label={tx(t, "phQft_eqHiggs", "The Higgs potential and what it gives")}
        where={[
          [r`\mu^2 < 0,\ \lambda > 0`, tx(t, "phQft_wMu", "the two numbers that shape the potential into a 'Mexican hat'")],
          [r`v = 246\ \text{GeV}`, tx(t, "phQft_wVev", "the field's value in the vacuum, the ring's radius, fixed by the Fermi constant measured in muon decay")],
          [r`m_H`, tx(t, "phQft_wMh", "the Higgs boson: a ripple up the wall of the hat. Measured 125.1 GeV, so λ ≈ 0.13")],
          [r`m_W`, tx(t, "phQft_wMw", "the W boson's mass, from the weak coupling g ≈ 0.65 and v")],
          [r`y_f`, tx(t, "phQft_wY", "each fermion's own coupling to the Higgs field (its Yukawa coupling), a number the theory does not predict")],
        ]}
        words={tx(t, "phQft_higgsWords", "The vacuum is full of a Higgs field of strength 246 GeV; how strongly a particle couples to it is how heavy it is.")}
        note={tx(t, "phQft_higgsNote", "m_W = 0.65 × 246/2 = 80 GeV, as measured. The photon does not couple to the vacuum's Higgs field and stays massless. And the Higgs mechanism gives only the elementary masses: the proton's mass, 99% of yours, comes from the strong force, as the quark builder showed.")}>
        {r`\begin{gathered}V = \mu^2|\phi|^2 + \lambda|\phi|^4 \\ m_H = \sqrt{2\lambda}\,v, \quad m_W = \frac{g\,v}{2}, \quad m_f = \frac{y_f\,v}{\sqrt2}\end{gathered}`}
      </Equation>
      <LiveFormula label={tx(t, "phQft_liveY", "Try it: mass from the coupling to the Higgs field")}
        tex={r`m_f = \frac{y_f\,v}{\sqrt2}`}
        vars={[{ id: "ly", label: tx(t, "phQft_liveYl", "Yukawa coupling y"), min: -6, max: 0.1, step: 0.01, value: Math.log10(2.94e-6), fmt: v => (10 ** v < 0.01 ? (10 ** v).toExponential(2).replace("-", "−") : num(10 ** v, 3)) }]}
        compute={yukawaNumbers(t)}
        note={tx(t, "phQft_liveYNote", "The electron's coupling is 2.9 × 10⁻⁶, the top quark's almost exactly 1. The pattern spans six orders of magnitude, and why is one of the great open questions.")} />
      <Callout type="info" t={t}>
        {tx(t, "phQft_gravity", "One force is missing from all of this: gravity. Treat the metric of general relativity as a quantum field and its quanta, gravitons, can be described at low energies, but the corrections from higher diagrams grow without limit near the Planck energy, √(ħc⁵/G) ≈ 1.2 × 10¹⁹ GeV. A quantum theory of gravity that works there, whether string theory, loop quantum gravity or something not yet thought of, is the biggest unfinished job in physics.")}
      </Callout>

      <H2>{tx(t, "phQft_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phQft_ex1", "1. A photon can make an electron–positron pair only if it carries at least 2 × 0.511 = 1.022 MeV, and only near a nucleus, which takes up the momentum: a lone photon cannot turn into two massive particles, since in their centre-of-mass frame the photon would need zero momentum.")}</p>
      <p>{tx(t, "phQft_ex2", "2. The electron's reduced Compton wavelength, ħ/mc = 197.3 MeV fm / 0.511 MeV = 386 fm. Try to locate an electron better than this and the energy needed starts making new pairs: below that size, 'one electron' stops making sense.")}</p>
      <p>{tx(t, "phQft_ex3", "3. Schwinger's term: α/2π = 1/(2π × 137.036) = 0.001 161 4, against the measured 0.001 159 7. The difference, 0.15%, is the second-order term, −0.3285 (α/π)² = −1.77 × 10⁻⁶.")}</p>
      <p>{tx(t, "phQft_ex4", "4. The Higgs: λ = m_H²/(2v²) = 125.1²/(2 × 246²) = 0.129. And the W: m_W = g v/2 = 0.652 × 246/2 = 80.2 GeV, against 80.4 GeV measured.")}</p>

      <H2>{tx(t, "phQft_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phQft_tWrong", "Wrong"), tx(t, "phQft_tRight", "Right"), tx(t, "phQft_tWhy", "Why")]}
        rows={[
          [tx(t, "phQft_m1w", "fields are a convenient way to describe particles"), tx(t, "phQft_m1r", "the fields are the basic thing"), tx(t, "phQft_m1", "particles are quantised excitations of them; that is why they can be created and destroyed")],
          [tx(t, "phQft_m2w", "a Feynman diagram shows the paths particles take"), tx(t, "phQft_m2r", "it stands for a term in a sum"), tx(t, "phQft_m2", "it has no positions or times; only the sum of all diagrams is physical")],
          [tx(t, "phQft_m3w", "the vacuum is nothing at all"), tx(t, "phQft_m3r", "it is the fields' lowest state"), tx(t, "phQft_m3", "every mode keeps ½ħω, which shows up in the Casimir effect and the Lamb shift")],
          [tx(t, "phQft_m4w", "α is exactly 1/137"), tx(t, "phQft_m4r", "1/137.035 999 2 at low energy"), tx(t, "phQft_m4", "and it grows at higher energies, to 1/128 at the Z mass")],
          [tx(t, "phQft_m5w", "the Higgs field slows particles like treacle"), tx(t, "phQft_m5r", "it gives a rest mass"), tx(t, "phQft_m5", "a particle at rest feels it too; the treacle picture wrongly suggests friction and loss of energy")],
        ]}
      />

      <KeyIdeas t={t} id="phQft" items={[
        "Relativity lets energy become particles, so particle number is not fixed: the basic objects are fields, and identical particles are ripples of one field.",
        "The Klein–Gordon equation comes from E² = (pc)² + (mc²)²; its waves obey ω² = c²k² + (mc²/ħ)², and its negative-frequency solutions are antiparticles.",
        "Each mode of a field is a quantum oscillator; each quantum ħω is one particle, and even the empty vacuum keeps ½ħω per mode (Casimir effect).",
        "Interactions are vertices; Feynman diagrams add up amplitudes in powers of α ≈ 1/137, and QED predicts the electron's g-factor to twelve digits.",
        "Exchanging a massless particle gives a 1/r force; a massive one gives a Yukawa force of range ħ/mc. Couplings run: α grows with energy, α_s falls (asymptotic freedom).",
        "The Higgs field's lopsided vacuum, v = 246 GeV, gives mass to the W and Z and to each fermion through its own coupling; its ripple is the 125 GeV Higgs boson.",
      ]} />
    </Article>
  );
}

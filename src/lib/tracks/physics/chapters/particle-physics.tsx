"use client";

// Nuclear, particles & cosmos 2: particle physics — antimatter and the
// particle zoo, quarks (charges, hadrons, deep inelastic scattering), colour
// and confinement, the four forces and their carriers, the range of a force
// from the mass of its carrier (R = ħ/mc), the weak force and beta decay at
// the quark level, neutrinos and their oscillations, conservation laws, the
// Standard Model's 17 particles, the Higgs discovery and statistical
// significance, and what the Standard Model leaves open.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { QuarkBuilderFigure } from "@/components/lesson/figures/physics/QuarkBuilderFigure";
import { ReactionFigure } from "@/components/lesson/figures/physics/ReactionFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Range of a force carried by a particle of mass m. */
const rangeNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const m = 10 ** v.lm, R = 197.3 / m;
  const show = R >= 0.01 ? `${num(R, R < 1 ? 3 : 2)}\\ \\text{fm}` : `${num(R * 1000, 2)}\\times10^{-3}\\ \\text{fm}`;
  return {
    tex: r`R = \frac{197.3\ \text{MeV fm}}{${m >= 1000 ? `${num(m / 1000, 2)}\\ \\text{GeV}\\times 1000` : `${num(m, m < 10 ? 2 : 1)}\\ \\text{MeV}`}} = \amber{${show}}`,
    meter: Math.min(1, Math.max(0, (Math.log10(R) + 3.5) / 6)),
    meterLabel: m > 50000 ? tx(t, "phPart_liveW", "about the W boson: the weak force") : m > 100 && m < 200 ? tx(t, "phPart_livePi", "about the pion: the force between nucleons") : m < 2 ? tx(t, "phPart_liveLight", "a very light carrier: a long range") : "",
  };
};

/** Chance that a muon neutrino has turned into a tau neutrino after L km. */
const oscNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const ph = (1.27 * 2.5e-3 * v.L) / v.E, P = Math.sin(ph) ** 2;
  return {
    tex: r`P = \sin^2\!\left(\frac{1.27\times 0.0025\times ${num(v.L, 0)}}{${num(v.E, 2)}}\right) = \sin^2(${num(ph, 2)}) = \amber{${num(P * 100, 0)}\%}`,
    meter: P,
    meterLabel: `${num(P * 100, 0)}% ${tx(t, "phPart_liveChanged", "changed flavour")}`,
  };
};

/** Significance of a bump: S signal events over a background B. */
const sigmaNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const S = 40 * v.mo, B = 1000 * v.mo, Z = S / Math.sqrt(B);
  return {
    tex: r`Z = \frac{S}{\sqrt{B}} = \frac{${num(S, 0)}}{\sqrt{${num(B, 0)}}} = \amber{${num(Z, 2)}\,\sigma}`,
    meter: Math.min(1, Z / 6),
    meterLabel: Z >= 5 ? tx(t, "phPart_liveDisc", "a discovery (5σ)") : Z >= 3 ? tx(t, "phPart_liveEvid", "evidence (3σ), not yet a discovery") : tx(t, "phPart_liveNoise", "could still be a fluctuation"),
  };
};

export function ParticlePhysicsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phPart_intro",
          "What is everything made of? By 1932 the answer looked simple: protons, neutrons and electrons, plus the photon. Then cosmic rays and accelerators turned up hundreds of new particles, a 'zoo' with no obvious order. Sorting it out took forty years and produced the Standard Model: six quarks, six leptons, four kinds of force carrier and the Higgs boson, seventeen particles in all, which describe every experiment ever done in a particle accelerator. This chapter builds it up piece by piece.")}
      </Lead>

      <Goals t={t} id="phPart" items={[
        "Build protons, neutrons and other hadrons out of quarks and explain why quarks carry colour and are never seen alone.",
        "Name the four forces and their carriers and relate a force's range to the mass of its carrier.",
        "Use conservation of charge, baryon number and lepton numbers to decide whether a reaction can happen.",
        "List the particles of the Standard Model and say what it leaves unexplained.",
      ]} />

      <H2>{tx(t, "phPart_zooTitle", "Antimatter and the particle zoo")}</H2>
      <p>
        {tx(t, "phPart_zooBody",
          "In 1928 Paul Dirac wrote a wave equation for the electron that obeyed special relativity. It had solutions with negative energy, which he could not throw away, and he concluded that every particle has an antiparticle with the same mass and opposite charge. In 1932 Carl Anderson saw one in a cloud chamber: a positron, curving the wrong way in a magnetic field. When a particle meets its antiparticle they can annihilate into pure energy, and enough energy can make a pair. Then the surprises came. The muon (1936), a heavier copy of the electron with no apparent purpose (\"Who ordered that?\" asked Isidor Rabi). The pion (1947), predicted by Hideki Yukawa as the carrier of the nuclear force. Then kaons and lambdas, oddly long-lived 'strange' particles, and in the 1950s and 60s hundreds more from the new accelerators.")}
      </p>

      <H2>{tx(t, "phPart_quarkTitle", "Quarks")}</H2>
      <p>
        {tx(t, "phPart_quarkBody",
          "In 1964 Murray Gell-Mann and George Zweig proposed that all these strongly interacting particles, the hadrons, are built from a few smaller pieces with fractional charges, which Gell-Mann called quarks. Baryons such as the proton are made of three quarks; mesons such as the pion of a quark and an antiquark. Few believed the quarks were real until 1968, when electrons fired at protons at the Stanford linear accelerator bounced off hard, point-like objects inside them, just as Rutherford's alphas had bounced off the nucleus. Today we know six flavours of quark. Try building hadrons from them.")}
      </p>
      <QuarkBuilderFigure t={t} />
      <Equation label={tx(t, "phPart_eqCharge", "Charges from quarks")}
        where={[
          [r`u`, tx(t, "phPart_wU", "the up quark, charge +2/3 e (as are charm and top)")],
          [r`d`, tx(t, "phPart_wD", "the down quark, charge −1/3 e (as are strange and bottom)")],
          [r`\bar d`, tx(t, "phPart_wDbar", "an anti-down quark: every charge reversed, so +1/3 e")],
        ]}
        words={tx(t, "phPart_chargeWords", "Two ups and a down give the proton its charge of +1; one up and two downs give the neutron 0; an up and an anti-down give the positive pion +1.")}
        note={tx(t, "phPart_chargeNote", "Beta decay is now simple to state: one down quark in a neutron turns into an up quark, and the neutron (udd) becomes a proton (uud).")}>
        {r`\begin{gathered}p = uud:\ \tfrac23 + \tfrac23 - \tfrac13 = +1 \\ n = udd:\ \tfrac23 - \tfrac13 - \tfrac13 = 0 \\ \pi^+ = u\bar d:\ \tfrac23 + \tfrac13 = +1\end{gathered}`}
      </Equation>
      <H3>{tx(t, "phPart_colourTitle", "Colour and confinement")}</H3>
      <p>
        {tx(t, "phPart_colourBody",
          "Each quark carries a new kind of charge, called colour (a name only: nothing to do with real colours), which comes in three kinds, red, green and blue, plus the three anticolours. Colour is the charge of the strong force, as electric charge is the charge of electromagnetism, and its carriers are eight gluons, which carry colour themselves. That last fact makes the strong force behave strangely. Between two quarks the field does not spread out like the electric field; it narrows into a tube, so the force stays constant, about 1 GeV per femtometre (a pull of some 16 tonnes) however far you pull. Before you could separate them, the tube's energy makes a new quark–antiquark pair, and you get two hadrons instead of a free quark. This is confinement: only colourless combinations exist alone, and no single quark has ever been seen. In high-energy collisions, a struck quark becomes a narrow spray of hadrons, a jet.")}
      </p>

      <H2>{tx(t, "phPart_forcesTitle", "The four forces and their messengers")}</H2>
      <p>
        {tx(t, "phPart_forcesBody",
          "In quantum theory, a force between two particles is carried by a third: they exchange it. The electron pushes the electron by exchanging photons; quarks hold together by exchanging gluons. The next chapter shows how this works; here are the four forces we know.")}
      </p>
      <LessonTable
        headers={[tx(t, "phPart_tForce", "Force"), tx(t, "phPart_tCarrier", "Carrier"), tx(t, "phPart_tMass", "Carrier mass"), tx(t, "phPart_tStrength", "Strength (rough)"), tx(t, "phPart_tRange", "Range"), tx(t, "phPart_tActs", "Acts on")]}
        rows={[
          [tx(t, "phPart_f1", "strong"), tx(t, "phPart_f1c", "8 gluons"), "0", "1", tx(t, "phPart_f1r", "about 1 fm (confined)"), tx(t, "phPart_f1a", "quarks, gluons (colour)")],
          [tx(t, "phPart_f2", "electromagnetic"), tx(t, "phPart_f2c", "photon"), "0", "1/137", tx(t, "phPart_inf", "infinite"), tx(t, "phPart_f2a", "electric charges")],
          [tx(t, "phPart_f3", "weak"), "W⁺, W⁻, Z⁰", "80.4, 91.2 GeV", "10⁻⁶", "0.002 fm", tx(t, "phPart_f3a", "all quarks and leptons")],
          [tx(t, "phPart_f4", "gravity"), tx(t, "phPart_f4c", "graviton (never seen)"), "0", "10⁻³⁸", tx(t, "phPart_inf", "infinite"), tx(t, "phPart_f4a", "all energy")],
        ]}
      />
      <Derivation t={t} label={tx(t, "phPart_rangeDer", "Why a heavy carrier means a short range (Yukawa, 1935)")}
        steps={[
          { tex: r`\Delta E = m c^2`, why: tx(t, "phPart_r1", "to emit a carrier of mass m out of nothing, energy conservation must be broken by at least its rest energy") },
          { tex: r`\Delta t \approx \frac{\hbar}{\Delta E} = \frac{\hbar}{m c^2}`, why: tx(t, "phPart_r2", "the energy–time uncertainty relation allows such a loan only for about this long") },
          { tex: r`\green{R \approx c\,\Delta t = \frac{\hbar}{m c} = \frac{\hbar c}{m c^2}}`, why: tx(t, "phPart_r3", "even at the speed of light the carrier gets only this far before the loan must be repaid: the range of the force") },
          { tex: r`\hbar c = 197.3\ \text{MeV fm}`, why: tx(t, "phPart_r4", "a handy constant: divide it by the carrier's rest energy in MeV and you get the range in femtometres") },
        ]} />
      <LiveFormula label={tx(t, "phPart_liveRange", "Try it: the range of a force from the mass of its carrier")}
        tex={r`R = \frac{\hbar c}{m c^2}`}
        vars={[{ id: "lm", label: tx(t, "phPart_liveM", "carrier mass mc²"), min: 0, max: 5.2, step: 0.01, value: Math.log10(139.57), fmt: v => (10 ** v >= 1000 ? `${num(10 ** v / 1000, 1)} GeV` : `${num(10 ** v, 1)} MeV`) }]}
        compute={rangeNumbers(t)}
        note={tx(t, "phPart_liveRangeNote", "Yukawa ran this backwards: the nuclear force reaches about 1.4 fm, so its carrier should weigh about 140 MeV, and the pion turned up at 139.6 MeV. A massless carrier (the photon) has an infinite range, which is why electric forces fall off only as 1/r².")} />

      <H2>{tx(t, "phPart_weakTitle", "The weak force")}</H2>
      <p>
        {tx(t, "phPart_weakBody",
          "The weak force is the only one that changes one kind of particle into another. In beta decay a down quark emits a W⁻ boson and becomes an up quark; the W⁻ then turns at once into an electron and an antineutrino. It is weak not because its charge is small (it is about as large as the electric one) but because the W is so heavy, 80 times a proton: at the low energies of a decaying nucleus the loan of energy is huge and the exchange very unlikely. At energies near 100 GeV it is as strong as electromagnetism, and in fact the two are parts of one electroweak force (Glashow, Weinberg and Salam, 1960s). The W and Z bosons were found at CERN in 1983, at the predicted masses. The weak force also treats left and right differently: only left-handed particles feel it, the only known law of nature that can tell a mirror image from the original.")}
      </p>
      <H3>{tx(t, "phPart_nuTitle", "Neutrinos")}</H3>
      <p>
        {tx(t, "phPart_nuBody",
          "There are three neutrinos, one paired with each charged lepton: νe, νμ and ντ. They feel only the weak force (and gravity), so they pass through almost anything: hundreds of trillions from the Sun cross your body every second, and nearly all of them go on through the whole Earth. For decades they were thought to be massless. Then, in 1998, the Super-Kamiokande detector found that muon neutrinos made in the atmosphere on the far side of the Earth arrive with half of them missing, turned into tau neutrinos on the way. Such oscillations are only possible if neutrinos have mass, though tiny: less than about half an electronvolt, a millionth of the electron's.")}
      </p>
      <Equation label={tx(t, "phPart_eqOsc", "Neutrino oscillation (two flavours)")}
        where={[
          [r`P`, tx(t, "phPart_wP", "the chance that a neutrino born as one flavour is found as the other")],
          [r`\theta`, tx(t, "phPart_wTh", "the mixing angle: how much each flavour is a blend of two mass states. For atmospheric neutrinos it is close to 45°, so sin² 2θ ≈ 1")],
          [r`\Delta m^2`, tx(t, "phPart_wDm", "the difference of the squared masses, in eV²: 2.5 × 10⁻³ eV² for atmospheric neutrinos")],
          [r`L,\ E`, tx(t, "phPart_wLE", "the distance travelled in km and the energy in GeV; 1.27 collects ħ, c and the unit conversions")],
        ]}
        words={tx(t, "phPart_oscWords", "A neutrino's flavour swings back and forth as it travels, with a period set by the difference of the masses squared.")}
        note={tx(t, "phPart_oscNote", "The two mass states travel with slightly different phases, like two notes of nearly equal pitch making beats (the sound chapter). The flavour you detect is the beat. Measuring the oscillation length measures Δm², but not the masses themselves.")}>
        {r`P(\nu_\mu \to \nu_\tau) = \sin^2 2\theta\;\sin^2\!\left(\frac{1.27\,\Delta m^2\,L}{E}\right)`}
      </Equation>
      <LiveFormula label={tx(t, "phPart_liveOsc", "Try it: muon neutrinos on a long journey")}
        tex={r`P = \sin^2\!\left(\frac{1.27\,\Delta m^2 L}{E}\right)`}
        vars={[
          { id: "L", label: tx(t, "phPart_liveL", "distance L"), min: 0, max: 13000, step: 10, value: 295, fmt: v => `${num(v, 0)} km` },
          { id: "E", label: tx(t, "phPart_liveE", "energy E"), min: 0.2, max: 10, step: 0.05, value: 0.6, fmt: v => `${num(v, 2)} GeV` },
        ]}
        compute={oscNumbers(t)}
        note={tx(t, "phPart_liveOscNote", "With sin² 2θ = 1 and Δm² = 2.5 × 10⁻³ eV². The Japanese T2K experiment sends 0.6 GeV neutrinos 295 km, from Tokai to Kamioka, right at the first maximum. Neutrinos from the atmosphere on the far side of the Earth travel 13 000 km and arrive thoroughly mixed: on average half have changed.")} />

      <H2>{tx(t, "phPart_consTitle", "What is conserved")}</H2>
      <p>
        {tx(t, "phPart_consBody",
          "With so many particles, which reactions can happen? Each force respects some conserved quantities, and a reaction is allowed only if it balances them all. Energy, momentum and charge are always conserved. Baryon number (+1 for each baryon, or +1/3 per quark) is too, and so are the lepton numbers, kept separately for the electron and muon families. Quark flavours like strangeness are kept by the strong and electromagnetic forces but not by the weak one.")}
      </p>
      <ReactionFigure t={t} />

      <H2>{tx(t, "phPart_smTitle", "The Standard Model")}</H2>
      <p>
        {tx(t, "phPart_smBody",
          "Put it all together and you get the Standard Model. Matter is made of fermions in three generations, each a heavier copy of the one before: a pair of quarks and a pair of leptons. Everything around you, every atom, uses only the first generation: up, down, the electron (and the electron neutrino). The heavier copies decay into lighter ones within fractions of a second, and nobody knows why there are three. Forces are carried by bosons. And one more boson, the Higgs, gives the W, the Z and the fermions their masses, as the next chapter explains.")}
      </p>
      <LessonTable
        headers={["", tx(t, "phPart_tG1", "1st generation"), tx(t, "phPart_tG2", "2nd"), tx(t, "phPart_tG3", "3rd"), tx(t, "phPart_tCharge", "Charge")]}
        rows={[
          [tx(t, "phPart_rUp", "up-type quarks"), "u 2.2 MeV", "c 1.27 GeV", "t 172.5 GeV", "+2/3"],
          [tx(t, "phPart_rDown", "down-type quarks"), "d 4.7 MeV", "s 93 MeV", "b 4.18 GeV", "−1/3"],
          [tx(t, "phPart_rLep", "charged leptons"), "e 0.511 MeV", "μ 105.7 MeV", "τ 1.777 GeV", "−1"],
          [tx(t, "phPart_rNu", "neutrinos"), "νe", "νμ", "ντ", tx(t, "phPart_rNuQ", "0 (masses below 0.5 eV)")],
          [tx(t, "phPart_rBos", "force carriers"), tx(t, "phPart_rBos1", "γ (0), 8 g (0)"), "W± 80.4 GeV", "Z⁰ 91.2 GeV", tx(t, "phPart_rBosQ", "0, ±1")],
          [tx(t, "phPart_rHiggs", "Higgs boson"), "H 125.1 GeV", "", "", "0"],
        ]}
      />
      <H3>{tx(t, "phPart_higgsTitle", "Finding the Higgs: a bump in the data")}</H3>
      <p>
        {tx(t, "phPart_higgsBody",
          "A Higgs boson lives about 10⁻²² s, so nobody sees one directly. It is found from what it decays into, for example two photons. For every collision with two photons, the detector measures their energies and directions and computes the mass of whatever could have made them. Most such pairs come from ordinary processes and spread smoothly over all masses: the background. A real particle adds a narrow bump at its own mass. The question is whether the bump is real or a chance fluctuation of the background, and that is a question about statistics.")}
      </p>
      <Equation label={tx(t, "phPart_eqSig", "The significance of a bump")}
        where={[
          [r`S`, tx(t, "phPart_wS", "the number of extra events in the bump (the signal)")],
          [r`B`, tx(t, "phPart_wB", "the number of background events expected in the same mass window")],
          [r`\sqrt{B}`, tx(t, "phPart_wSqrtB", "the typical random fluctuation of a count B (Poisson statistics, the probability chapters of the Math track)")],
          [r`Z`, tx(t, "phPart_wZ", "how many standard deviations σ the signal stands above the noise")],
        ]}
        words={tx(t, "phPart_sigWords", "A bump counts as real when it is many times larger than the background's own random wobble.")}
        note={tx(t, "phPart_sigNote", "Particle physicists announce a discovery only at Z = 5, a chance of about 1 in 3.5 million that the background alone would fluctuate up so far. Since S and B both grow in proportion to the amount of data, Z grows only like its square root: four times the data, twice the significance.")}>
        {r`Z \approx \frac{S}{\sqrt{B}}`}
      </Equation>
      <LiveFormula label={tx(t, "phPart_liveSig", "Try it: how long until a discovery?")}
        tex={r`Z = \frac{S}{\sqrt{B}}`}
        vars={[{ id: "mo", label: tx(t, "phPart_liveMo", "months of collisions"), min: 1, max: 36, step: 1, value: 6, fmt: v => `${num(v, 0)}` }]}
        compute={sigmaNumbers(t)}
        note={tx(t, "phPart_liveSigNote", "Illustrative numbers: 40 signal events and 1000 background events in the window per month. Three sigma comes after about 6 months, five sigma after 16. The real search took two years of data at the Large Hadron Collider before ATLAS and CMS announced the Higgs on 4 July 2012; Peter Higgs and François Englert, who had predicted it in 1964, shared the 2013 Nobel Prize.")} />
      <Callout type="info" t={t}>
        {tx(t, "phPart_beyond", "The Standard Model has passed every test in accelerators, yet it is surely not the end. It leaves out gravity. It has no particle for the dark matter that outweighs ordinary matter five to one (the cosmology chapter). It does not say why neutrinos have mass, why the universe holds matter but almost no antimatter, or why there are three generations with such different masses. And it has about 19 numbers, masses and couplings, that must be measured rather than derived. Experiments are hunting for cracks: rare decays, precise magnetic moments, dark-matter detectors deep underground.")}
      </Callout>

      <H2>{tx(t, "phPart_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phPart_ex1", "1. The Ω⁻ is sss: charge 3 × (−1/3) = −1, strangeness −3. No lighter combination has strangeness −3, and the strong force cannot change it, so the Ω⁻ can only decay by the weak force, one strange quark at a time, and lives 8 × 10⁻¹¹ s. Gell-Mann predicted its mass, about 1680 MeV, from the pattern of the other baryons; it was found in 1964 at 1672 MeV.")}</p>
      <p>{tx(t, "phPart_ex2", "2. The W boson: R = 197.3 MeV fm / 80 400 MeV = 0.0025 fm, a four-hundredth of a proton's size. That is why the weak force seems to act only at a point (Fermi's 1934 theory of beta decay treated it so).")}</p>
      <p>{tx(t, "phPart_ex3", "3. Making a proton–antiproton pair needs at least 2 × 938.3 = 1876.5 MeV. In a collision of a beam proton with a proton at rest, momentum conservation raises the beam's needed kinetic energy to 6 × 938.3 = 5.6 GeV; the Bevatron at Berkeley was built for that, and found the antiproton in 1955.")}</p>
      <p>{tx(t, "phPart_ex4", "4. The Δ⁺⁺ is uuu, charge 3 × 2/3 = +2. It decays by the strong force into p + π⁺: charge 1 + 1 = 2, baryon number 1 = 1, and its mass of 1232 MeV is more than 938.3 + 139.6 = 1077.9 MeV, so the decay has 154 MeV to spare. Being a strong decay, it takes only 5.6 × 10⁻²⁴ s, about the time light needs to cross a proton.")}</p>

      <H2>{tx(t, "phPart_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phPart_tWrong", "Wrong"), tx(t, "phPart_tRight", "Right"), tx(t, "phPart_tWhy", "Why")]}
        rows={[
          [tx(t, "phPart_m1w", "quark colours are real colours"), tx(t, "phPart_m1r", "colour is a name for a kind of charge"), tx(t, "phPart_m1", "three kinds that cancel in sets of three reminded physicists of red, green and blue light making white")],
          [tx(t, "phPart_m2w", "the proton's mass is its quarks' mass"), tx(t, "phPart_m2r", "about 1% of it"), tx(t, "phPart_m2", "the rest is the energy of the gluon field and the quarks' motion")],
          [tx(t, "phPart_m3w", "the weak force is weak because its charge is small"), tx(t, "phPart_m3r", "because its carriers are heavy"), tx(t, "phPart_m3", "its coupling is comparable to the electric one; the W's mass suppresses it at low energy")],
          [tx(t, "phPart_m4w", "antimatter has negative mass"), tx(t, "phPart_m4r", "it has the same, positive, mass"), tx(t, "phPart_m4", "only the charges are reversed; at CERN, antihydrogen falls down like hydrogen (ALPHA-g, 2023)")],
          [tx(t, "phPart_m5w", "the Higgs gives all mass"), tx(t, "phPart_m5r", "it gives the elementary particles theirs"), tx(t, "phPart_m5", "most of the mass of everyday matter comes from the strong force inside protons and neutrons")],
        ]}
      />

      <KeyIdeas t={t} id="phPart" items={[
        "Every particle has an antiparticle with the same mass and opposite charges; particle–antiparticle pairs can annihilate and be created.",
        "Hadrons are made of quarks: baryons of three (proton uud, neutron udd), mesons of a quark and an antiquark; the six flavours have charges +2/3 or −1/3.",
        "Quarks carry one of three colours, the charge of the strong force; only colourless combinations exist alone (confinement).",
        "Forces are carried by bosons: gluons, the photon, the W and Z; a carrier of mass m gives a range R ≈ ħ/mc.",
        "The weak force changes quark and lepton flavours and makes neutrinos, which oscillate between flavours because they have tiny masses.",
        "Charge, baryon number and lepton numbers are always conserved; the Standard Model's 17 particles explain every accelerator experiment, but not gravity, dark matter or the matter–antimatter imbalance.",
      ]} />
    </Article>
  );
}

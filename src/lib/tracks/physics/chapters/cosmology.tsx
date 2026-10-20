"use client";

// Nuclear, particles & cosmos 4: cosmology — the dark night sky, measuring
// distances, Hubble's law and expanding space, redshift as stretching
// (1 + z = a_now/a_then), the Friedmann equation derived from Newtonian
// energy, the critical density, how matter, radiation and dark energy thin
// out, the age and fate of the universe, the accelerating expansion, the
// hot Big Bang timeline, nucleosynthesis and the 25% helium, the cosmic
// microwave background, the evidence for dark matter, inflation, and the
// open questions.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ExpansionFigure } from "@/components/lesson/figures/physics/ExpansionFigure";
import { FriedmannFigure } from "@/components/lesson/figures/physics/FriedmannFigure";
import { RotationCurveFigure } from "@/components/lesson/figures/physics/RotationCurveFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Recession speed from Hubble's law, and the matching redshift for small z. */
const hubbleNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const vel = v.H * v.d;
  return {
    tex: r`v = ${num(v.H, 1)}\ \tfrac{\text{km/s}}{\text{Mpc}} \times ${num(v.d, 0)}\ \text{Mpc} = \amber{${Math.round(vel).toLocaleString("en-US").replace(/,/g, "\\,")}\ \text{km/s}}`,
    meter: Math.min(1, vel / 3e5),
    meterLabel: `${num((vel / 299792) * 100, 2)}% ${tx(t, "phCos_liveC", "of the speed of light")}; 1/H₀ = ${num(977.8 / v.H, 1)} ${tx(t, "phCos_liveGyr", "billion years")}`,
  };
};

/** Primordial helium from the neutron–proton ratio at freeze-out. */
const heliumNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const ratio = Math.exp(-1.293 / v.kT), xn = ratio / (1 + ratio), xnLater = xn * Math.exp(-180 / 879.4), Y = 2 * xnLater;
  return {
    tex: r`\frac{n}{p} = e^{-1.293/${num(v.kT, 2)}} = ${num(ratio, 3)} \;\Rightarrow\; Y = 2 \times ${num(xn, 3)} \times e^{-180/879} = \amber{${num(Y, 3)}}`,
    meter: Math.min(1, Y / 0.5),
    meterLabel: `${num(Y * 100, 1)}% ${tx(t, "phCos_liveHe", "of the mass in helium (measured: 24.5%)")}`,
  };
};

/** Temperature of the background radiation at redshift z. */
const cmbNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const z = 10 ** v.lz - 1, T = 2.7255 * (1 + z);
  return {
    tex: r`T = 2.7255\ \text{K} \times (1 + ${z < 10 ? num(z, 2) : num(z, 0)}) = \amber{${T < 100 ? num(T, 2) : num(T, 0)}\ \text{K}}`,
    meter: Math.min(1, v.lz / 4),
    meterLabel: T > 2900 && T < 3100 ? tx(t, "phCos_liveRec", "hot enough to ionise hydrogen: where the CMB comes from") : T < 3 ? tx(t, "phCos_liveNow", "today") : "",
  };
};

export function CosmologyContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phCos_intro",
          "Can physics describe the whole universe, its age, its history and its fate? A century ago the question was philosophy. Today it is a science with numbers measured to a percent: the universe has been expanding for 13.8 billion years from a hot, dense state, it is made of 5% ordinary matter, 27% dark matter and 68% dark energy, and its expansion is speeding up. This last chapter puts together gravity, relativity, thermodynamics, nuclear and particle physics, all from earlier in the track, to show how we know.")}
      </Lead>

      <Goals t={t} id="phCos" items={[
        "Use Hubble's law and redshift, and explain why they mean that space itself is expanding.",
        "Derive the Friedmann equation and use it to find the critical density, the age and the fate of the universe.",
        "Describe the hot Big Bang: nucleosynthesis, the 25% helium and the cosmic microwave background.",
        "Weigh the evidence for dark matter and dark energy and say what remains unknown.",
      ]} />

      <H2>{tx(t, "phCos_hubbleTitle", "The receding galaxies")}</H2>
      <p>
        {tx(t, "phCos_hubbleBody",
          "Why is the night sky dark? If the universe were infinite, unchanging and full of stars, every line of sight would end on a star and the whole sky would blaze like the Sun's surface (Olbers' paradox). The darkness is a first clue that the universe has a finite age. The second clue took longer. Measuring distances to galaxies needs a ladder: parallax for nearby stars, then Cepheid variable stars, whose period tells their true brightness (Henrietta Leavitt, 1912), and today supernovae of type Ia, all of nearly the same peak brightness. In 1929 Edwin Hubble, using Cepheids and the redshifts measured by Vesto Slipher, found that galaxies recede from us, and the farther they are, the faster.")}
      </p>
      <Equation label={tx(t, "phCos_eqHubble", "Hubble's law")}
        where={[
          [r`v`, tx(t, "phCos_wV", "the speed at which a galaxy recedes, from the redshift of its light")],
          [r`d`, tx(t, "phCos_wD", "its distance, usually in megaparsecs (1 Mpc = 3.26 million light-years = 3.09 × 10²² m)")],
          [r`H_0`, tx(t, "phCos_wH", "the Hubble constant, today's expansion rate: 67–73 km/s per Mpc depending on the method (the 'Hubble tension', unexplained)")],
        ]}
        words={tx(t, "phCos_hubbleWords", "Every galaxy recedes at a speed proportional to its distance.")}
        note={tx(t, "phCos_hubbleNote", "1/H₀ has units of time: 1/(67.7 km/s/Mpc) = 14.4 billion years. If every galaxy had always kept its speed, that is how long ago they were all together, already close to the true age.")}>
        {r`v = H_0\,d`}
      </Equation>
      <LiveFormula label={tx(t, "phCos_liveHubble", "Try it: how fast is that galaxy receding?")}
        tex={r`v = H_0\,d`}
        vars={[
          { id: "d", label: tx(t, "phCos_liveD", "distance d"), min: 1, max: 4000, step: 1, value: 100, fmt: v => `${num(v, 0)} Mpc` },
          { id: "H", label: "H₀", min: 60, max: 80, step: 0.1, value: 67.7, fmt: v => `${num(v, 1)} km/s/Mpc` },
        ]}
        compute={hubbleNumbers(t)}
        note={tx(t, "phCos_liveHubbleNote", "The Andromeda galaxy, at 0.78 Mpc, is actually approaching (gravity wins nearby); the Virgo cluster, at 16.5 Mpc, recedes at about 1100 km/s. Beyond about 4400 Mpc the formula gives more than the speed of light: nothing wrong, since nothing moves through space that fast; the space between grows.")} />
      <p>
        {tx(t, "phCos_spaceBody",
          "This does not put us at the centre. If all distances grow by the same factor, every observer sees the same law. The figure lets you stand on any galaxy.")}
      </p>
      <ExpansionFigure t={t} />
      <H3>{tx(t, "phCos_zTitle", "Redshift: light stretched by space")}</H3>
      <p>
        {tx(t, "phCos_zBody",
          "Describe the expansion by one number, the scale factor a(t): every distance between galaxies is proportional to it, and today a = 1. Light travelling through expanding space has its wavelength stretched with everything else. So the redshift z, how much longer a wavelength arrives than it left, measures directly how much the universe has grown since the light set out.")}
      </p>
      <Equation label={tx(t, "phCos_eqZ", "Cosmological redshift")}
        where={[
          [r`z`, tx(t, "phCos_wZ", "the redshift: the fractional increase of every wavelength")],
          [r`\lambda_{\text{obs}},\ \lambda_{\text{emit}}`, tx(t, "phCos_wL", "the wavelength received and the wavelength emitted, from known spectral lines such as hydrogen's")],
          [r`a_{\text{then}}`, tx(t, "phCos_wA", "the scale factor when the light left; a_now = 1")],
        ]}
        words={tx(t, "phCos_zWords", "Light arrives stretched by exactly the factor by which the universe has grown during its journey.")}
        note={tx(t, "phCos_zNote", "For small z, z ≈ v/c, and Hubble's law follows. The James Webb Space Telescope sees galaxies beyond z = 14, light that left when the universe was a fifteenth of its present size and about 300 million years old.")}>
        {r`1 + z = \frac{\lambda_{\text{obs}}}{\lambda_{\text{emit}}} = \frac{a_{\text{now}}}{a_{\text{then}}} = \frac{1}{a_{\text{then}}}`}
      </Equation>

      <H2>{tx(t, "phCos_friedTitle", "The Friedmann equation")}</H2>
      <p>
        {tx(t, "phCos_friedBody",
          "How does a(t) change? In 1922 Alexander Friedmann found the answer in general relativity, for a universe that is the same everywhere and in every direction. Remarkably, the same equation comes out of Newton's gravity and energy conservation, applied to a ball of the universe.")}
      </p>
      <Derivation t={t} label={tx(t, "phCos_fDer", "The Friedmann equation from energy conservation")}
        steps={[
          { tex: r`R(t) = a(t)\,r, \qquad M = \tfrac43\pi R^3\rho`, why: tx(t, "phCos_f1", "take a ball of radius R that grows with the universe, filled with density ρ; the mass M inside it never changes") },
          { tex: r`\tfrac12\dot R^2 - \frac{GM}{R} = E`, why: tx(t, "phCos_f2", "a galaxy on its surface (per unit mass): kinetic plus gravitational energy stays constant. Matter outside the ball pulls equally from all sides and adds nothing (Newton's shell theorem, from the gravity chapter)") },
          { tex: r`\tfrac12\dot a^2 r^2 - \frac{4\pi G\rho\,a^2 r^2}{3} = E`, why: tx(t, "phCos_f3", "put in R = ar and M; the R³ in the mass cancels one power of R") },
          { tex: r`\green{\left(\frac{\dot a}{a}\right)^2 = \frac{8\pi G}{3}\,\rho - \frac{k c^2}{a^2}}`, why: tx(t, "phCos_f4", "divide by a²r²/2 and write the energy as −kc²/r². General relativity gives the same equation and reads k as the curvature of space: k = 0 flat, positive closed, negative open") },
        ]} />
      <Equation label={tx(t, "phCos_eqFried", "The Friedmann equation and the critical density")}
        where={[
          [r`H = \dot a/a`, tx(t, "phCos_wHa", "the expansion rate at any time; today it is H₀")],
          [r`\rho`, tx(t, "phCos_wRho", "the density of everything (matter, radiation, dark energy), as mass per volume, E/c² for energy")],
          [r`k`, tx(t, "phCos_wK", "the curvature of space")],
          [r`\rho_c`, tx(t, "phCos_wRc", "the critical density: the value that makes space flat (k = 0)")],
        ]}
        words={tx(t, "phCos_friedWords", "The square of the expansion rate is set by how much the universe contains; at exactly the critical density, space is flat.")}
        note={tx(t, "phCos_friedNote", "With H₀ = 67.7 km/s/Mpc = 2.19 × 10⁻¹⁸ per second, ρc = 3 × (2.19 × 10⁻¹⁸)² / (8π × 6.674 × 10⁻¹¹) = 8.6 × 10⁻²⁷ kg/m³: about five protons in each cubic metre. Measurements of the cosmic microwave background show that space is flat to within 0.2%, so the true density is the critical one.")}>
        {r`\begin{gathered}H^2 = \frac{8\pi G}{3}\rho - \frac{kc^2}{a^2} \\ \rho_c = \frac{3H^2}{8\pi G}\end{gathered}`}
      </Equation>
      <p>
        {tx(t, "phCos_thinBody",
          "To run the equation forward and back you need to know how each ingredient thins out as a grows. Matter is easy: the same particles in a volume a³, so ρ ∝ a⁻³. Radiation thins faster, as a⁻⁴, because each photon is also redshifted and loses energy. The cosmological constant Λ that Einstein added in 1917, now called dark energy, is an energy of empty space itself: it does not thin out at all, so it ends up winning. Writing each as a share Ω of today's critical density:")}
      </p>
      <LessonTable
        headers={[tx(t, "phCos_tIng", "Ingredient"), tx(t, "phCos_tShare", "Share today (Ω)"), tx(t, "phCos_tThin", "Density as the universe grows"), tx(t, "phCos_tEff", "Effect on the expansion")]}
        rows={[
          [tx(t, "phCos_i1", "ordinary matter (atoms)"), "0.049", "a⁻³", tx(t, "phCos_slow", "slows it")],
          [tx(t, "phCos_i2", "dark matter"), "0.266", "a⁻³", tx(t, "phCos_slow", "slows it")],
          [tx(t, "phCos_i3", "radiation (photons, neutrinos)"), "0.00009", "a⁻⁴", tx(t, "phCos_slow2", "slows it; dominated the first 50 000 years")],
          [tx(t, "phCos_i4", "dark energy (Λ)"), "0.685", tx(t, "phCos_const", "constant"), tx(t, "phCos_speed", "speeds it up; dominates since about 3.5 billion years ago")],
        ]}
      />
      <FriedmannFigure t={t} />
      <Callout type="info" t={t}>
        {tx(t, "phCos_accel", "In 1998 two teams, led by Saul Perlmutter and by Brian Schmidt and Adam Riess, measured distant type Ia supernovae and found them fainter, so farther, than a decelerating universe allows: the expansion has been speeding up for the last six billion years or so (Nobel Prize 2011). What dark energy is, nobody knows. The simplest guess, the vacuum energy of quantum fields, comes out some 10¹²⁰ times too large, the worst prediction in physics. Recent galaxy surveys (DESI, 2024–2025) hint that it may even be changing with time.")}
      </Callout>

      <H2>{tx(t, "phCos_hotTitle", "The hot Big Bang")}</H2>
      <p>
        {tx(t, "phCos_hotBody",
          "Run the expansion backwards and everything gets denser and, since the radiation was less stretched the further back you go, hotter: the temperature goes as 1/a. A universe a thousand times smaller was a thousand times hotter, hot enough to tear atoms apart; a billion times smaller, hot enough to tear nuclei apart. The physics of each era is the physics of this track, run at the right temperature.")}
      </p>
      <LessonTable
        headers={[tx(t, "phCos_tTime", "Time after the Big Bang"), tx(t, "phCos_tTemp", "Temperature"), tx(t, "phCos_tEvent", "What happens")]}
        rows={[
          [tx(t, "phCos_e1t", "about 10⁻³² s"), "–", tx(t, "phCos_e1", "inflation ends (see below); the universe fills with hot particles")],
          [tx(t, "phCos_e2t", "10⁻¹² s"), "10¹⁵ K", tx(t, "phCos_e2", "the Higgs field takes its value: W and Z become heavy, the weak and electromagnetic forces part")],
          [tx(t, "phCos_e3t", "10⁻⁶ s"), "10¹² K", tx(t, "phCos_e3", "quarks and gluons are confined into protons and neutrons")],
          [tx(t, "phCos_e4t", "1 s"), "10¹⁰ K", tx(t, "phCos_e4", "neutrinos stop interacting; the neutron-to-proton ratio freezes")],
          [tx(t, "phCos_e5t", "3 minutes"), "10⁹ K", tx(t, "phCos_e5", "nucleosynthesis: helium, a little deuterium and lithium")],
          [tx(t, "phCos_e6t", "380 000 years"), "3000 K", tx(t, "phCos_e6", "electrons join nuclei into atoms; light flies free: the cosmic microwave background")],
          [tx(t, "phCos_e7t", "100–200 million years"), "50 K", tx(t, "phCos_e7", "the first stars light up in clumps of dark matter")],
          [tx(t, "phCos_e8t", "13.8 billion years"), "2.7 K", tx(t, "phCos_e8", "today")],
        ]}
      />
      <H3>{tx(t, "phCos_bbnTitle", "The first three minutes: helium")}</H3>
      <p>
        {tx(t, "phCos_bbnBody",
          "One second in, protons and neutrons were turning into each other by weak reactions with neutrinos, and their numbers followed a Boltzmann factor: the neutron is heavier by 1.293 MeV, so it is the rarer of the two. When the temperature dropped below about 0.75 MeV, the weak reactions became too slow and the ratio froze. The free neutrons then began to decay, until, about three minutes in, the universe was cool enough for deuterium to survive and nearly every remaining neutron was locked into helium-4.")}
      </p>
      <Derivation t={t} label={tx(t, "phCos_bbnDer", "Why a quarter of the ordinary matter is helium")}
        steps={[
          { tex: r`\frac{n}{p} = e^{-\Delta m c^2/kT_f} = e^{-1.293/0.75} = 0.18`, why: tx(t, "phCos_b1", "the Boltzmann factor for the neutron's extra mass Δmc² = 1.293 MeV at freeze-out, kT_f ≈ 0.75 MeV") },
          { tex: r`X_n = \frac{n}{n+p} = \frac{0.18}{1.18} = 0.151`, why: tx(t, "phCos_b2", "the share of nucleons that are neutrons") },
          { tex: r`X_n \to 0.151 \times e^{-180/879} = 0.123`, why: tx(t, "phCos_b3", "free neutrons decay with mean life 879 s for about 180 s before nucleosynthesis") },
          { tex: r`\green{Y = 2X_n \approx 0.25}`, why: tx(t, "phCos_b4", "every neutron ends up in helium-4 with a proton partner, two nucleons for each neutron, so helium's share of the mass is twice the neutron share") },
        ]} />
      <LiveFormula label={tx(t, "phCos_liveHe", "Try it: helium from the freeze-out temperature")}
        tex={r`\begin{gathered}Y = 2\,\frac{n/p}{1 + n/p}\,e^{-t/\tau_n} \\ \frac{n}{p} = e^{-1.293\ \text{MeV}/kT_f}\end{gathered}`}
        vars={[{ id: "kT", label: tx(t, "phCos_liveKT", "freeze-out temperature kT_f"), min: 0.3, max: 2, step: 0.01, value: 0.75, fmt: v => `${num(v, 2)} MeV` }]}
        compute={heliumNumbers(t)}
        note={tx(t, "phCos_liveHeNote", "The freeze-out temperature is set by the strength of the weak force and the expansion rate. A weak force a little stronger would freeze later and leave less helium; the measured 24.5% in the oldest gas clouds agrees with the calculation. The same calculation predicts the deuterium left over, which depends on the density of ordinary matter, and gives Ω = 0.049: that is how we know dark matter cannot be made of atoms.")} />
      <H3>{tx(t, "phCos_cmbTitle", "The oldest light")}</H3>
      <p>
        {tx(t, "phCos_cmbBody",
          "Until 380 000 years, the universe was a glowing plasma, opaque like the inside of the Sun. When it cooled below about 3000 K, electrons joined nuclei, the gas turned transparent, and the light then present has travelled freely ever since, stretched by a factor of 1100 into microwaves. Arno Penzias and Robert Wilson found it by accident in 1965 as a hiss coming from every direction. In 1990 the COBE satellite showed its spectrum is the most perfect blackbody ever measured, Planck's law from the birth of quantum physics. Its temperature varies across the sky by only 1 part in 100 000: those tiny ripples are the seeds that gravity grew into every galaxy.")}
      </p>
      <Equation label={tx(t, "phCos_eqT", "The temperature of the background radiation")}
        where={[
          [r`T_0`, tx(t, "phCos_wT0", "today's temperature, 2.7255 K, measured by COBE")],
          [r`z`, tx(t, "phCos_wZ2", "the redshift of the era: blackbody light stays blackbody as it stretches, with every wavelength, and so the temperature, scaled by 1 + z")],
        ]}
        words={tx(t, "phCos_tWords", "The universe was hotter in the past by exactly the factor by which it was smaller.")}
        note={tx(t, "phCos_tNote", "Wien's law (the birth-of-quantum chapter) puts today's peak at 1.06 mm; at emission, at z = 1090, it was about 1 µm, near-infrared light from a gas as hot as the surface of a cool star.")}>
        {r`T(z) = T_0\,(1 + z)`}
      </Equation>
      <LiveFormula label={tx(t, "phCos_liveCmb", "Try it: how hot was the universe then?")}
        tex={r`T = T_0\,(1 + z)`}
        vars={[{ id: "lz", label: tx(t, "phCos_liveZ", "redshift 1 + z"), min: 0, max: 4, step: 0.01, value: Math.log10(1091), fmt: v => num(10 ** v, 10 ** v < 10 ? 2 : 0) }]}
        compute={cmbNumbers(t)}
        note={tx(t, "phCos_liveCmbNote", "At 1 + z = 1091 the light was 2970 K, when the CMB was set free. At the redshift of the most distant galaxies known, about 15, it was 41 K.")} />

      <H2>{tx(t, "phCos_dmTitle", "Dark matter")}</H2>
      <p>
        {tx(t, "phCos_dmBody",
          "In 1933 Fritz Zwicky measured the speeds of galaxies in the Coma cluster and found them far too fast to be held by the visible mass; something unseen had to be holding them. Forty years later Vera Rubin's rotation curves showed the same inside single galaxies. The figure lets you weigh the Milky Way's halo yourself.")}
      </p>
      <RotationCurveFigure t={t} />
      <p>
        {tx(t, "phCos_dmMore",
          "Independent lines of evidence agree. Clusters bend the light of galaxies behind them (gravitational lensing, from general relativity) by more than their visible mass can. In the Bullet Cluster, two clusters that collided, the lensing mass has passed straight through while the hot gas, most of the ordinary matter, was slowed in the middle. The pattern of ripples in the microwave background needs about five times more matter than atoms can supply, and without that extra matter the ripples could not have grown into galaxies in time. Whatever dark matter is, it has mass, barely interacts with light or with itself, and is not made of atoms. Detectors deep underground have been looking for its particles for decades, without success so far.")}
      </p>

      <H2>{tx(t, "phCos_inflTitle", "Inflation and the open questions")}</H2>
      <p>
        {tx(t, "phCos_inflBody",
          "The microwave background holds a puzzle. Regions on opposite sides of our sky have the same temperature to 1 part in 100 000, yet in the plain Big Bang they were never close enough for light to cross between them: how did they agree? And why is space so flat, when any small curvature early on would have grown enormously? In 1980 Alan Guth proposed inflation: in its first moment, roughly 10⁻³⁶ to 10⁻³² s, the universe grew exponentially, by a factor of at least e⁶⁰ ≈ 10²⁶, driven by a field like the Higgs. A tiny region that had time to even out became everything we see, and any curvature was stretched flat. The quantum jitter of that field, stretched to astronomical size, would make exactly the kind of nearly scale-free ripples the microwave background shows.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "phCos_open", "What is still unknown is large. What dark matter is. What dark energy is, and whether it changes. Why the universe holds matter but almost no antimatter. Why two good methods give different Hubble constants. What drove inflation, if it happened, and whether 'before the Big Bang' means anything. These are the questions of current research, and every one of them uses the physics of this track, from units and kinematics to quantum fields. Here the track ends; the questions do not.")}
      </Callout>

      <H2>{tx(t, "phCos_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phCos_ex1", "1. A galaxy 100 Mpc away recedes at 67.7 × 100 = 6770 km/s, so z ≈ v/c = 6770/299 792 = 0.023: its hydrogen-alpha line at 656.3 nm arrives at 671.1 nm.")}</p>
      <p>{tx(t, "phCos_ex2", "2. Matter only, flat: a ∝ t^(2/3), so H = ȧ/a = 2/(3t) and the age is (2/3)(1/H₀) = (2/3) × 14.4 = 9.6 billion years, younger than the oldest stars. With 69% dark energy the integral gives 13.8 billion years.")}</p>
      <p>{tx(t, "phCos_ex3", "3. The density of the universe is the critical one, 8.6 × 10⁻²⁷ kg/m³. Ordinary matter is 4.9% of it, 0.25 protons per cubic metre on average, a far better vacuum than any laboratory can make; we live in one of the rare dense spots.")}</p>
      <p>{tx(t, "phCos_ex4", "4. A light from z = 3 was emitted when every distance was a quarter of today's and the background was at 4 × 2.73 = 10.9 K. Its Lyman-alpha line (121.6 nm, ultraviolet) arrives at 486 nm, blue light.")}</p>

      <H2>{tx(t, "phCos_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phCos_tWrong", "Wrong"), tx(t, "phCos_tRight", "Right"), tx(t, "phCos_tWhy", "Why")]}
        rows={[
          [tx(t, "phCos_m1w", "the Big Bang was an explosion at a point"), tx(t, "phCos_m1r", "it happened everywhere"), tx(t, "phCos_m1", "space itself expands; there is no centre and no edge to fly into")],
          [tx(t, "phCos_m2w", "galaxies beyond 4400 Mpc break the speed of light"), tx(t, "phCos_m2r", "no law is broken"), tx(t, "phCos_m2", "relativity limits motion through space; the growth of space between galaxies has no such limit")],
          [tx(t, "phCos_m3w", "cosmological redshift is a Doppler shift"), tx(t, "phCos_m3r", "it is stretching by expansion"), tx(t, "phCos_m3", "1 + z equals how much the universe grew, which works even at z = 1100")],
          [tx(t, "phCos_m4w", "the solar system and atoms are expanding too"), tx(t, "phCos_m4r", "bound systems keep their size"), tx(t, "phCos_m4", "their own forces hold them; only the space between unbound galaxy groups grows")],
          [tx(t, "phCos_m5w", "dark matter is just dim ordinary matter"), tx(t, "phCos_m5r", "it is not made of atoms"), tx(t, "phCos_m5", "nucleosynthesis and the microwave background both fix the amount of atoms at about a fifth of all matter")],
        ]}
      />

      <KeyIdeas t={t} id="phCos" items={[
        "Galaxies recede with v = H₀d; all distances grow with the scale factor a(t), so every observer sees the same law and there is no centre.",
        "Light is stretched by the expansion: 1 + z = 1/a_then. The background radiation has T = 2.7255 K × (1 + z).",
        "The Friedmann equation H² = (8πG/3)ρ − kc²/a² follows from energy conservation; the critical density 3H²/8πG, about five protons per m³, makes space flat.",
        "Matter thins as a⁻³, radiation as a⁻⁴, dark energy not at all: our universe (5% atoms, 27% dark matter, 68% dark energy) is 13.8 billion years old and its expansion is accelerating.",
        "The hot Big Bang made 25% helium in its first minutes and released the microwave background at 380 000 years, a near-perfect blackbody with ripples of 1 part in 10⁵.",
        "Rotation curves, lensing, clusters and the microwave background all require dark matter; dark energy, dark matter, inflation and the matter–antimatter imbalance remain open questions.",
      ]} />
    </Article>
  );
}

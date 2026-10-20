"use client";

// Quantum foundations 2: wave–particle duality — de Broglie's λ = h/p for
// matter, electron diffraction (Davisson–Germer, electron microscopes),
// the double slit run one particle at a time (Tonomura's electrons, C₆₀),
// the wavefunction and Born's rule P = |ψ|², which-path information and
// complementarity, wave packets built from pure waves, and Heisenberg's
// uncertainty principle Δx·Δp ≥ ħ/2 with its sizes in atoms and in daily life.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation, Tex } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BuildupFigure } from "@/components/lesson/figures/physics/BuildupFigure";
import { WavePacketFigure } from "@/components/lesson/figures/physics/WavePacketFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** de Broglie wavelength of an electron accelerated from rest through a voltage V. */
const electronNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const V = 10 ** v.lv, p = Math.sqrt(2 * 9.109e-31 * 1.602e-19 * V), lam = 6.626e-34 / p;
  const nm = lam * 1e9, speed = p / 9.109e-31;
  return {
    tex: r`p = \sqrt{2 m_e e V} = ${num(p * 1e24, 2)}\times10^{-24}\ \text{kg·m/s}, \quad \lambda = \frac{h}{p} = \amber{${num(nm, nm < 0.01 ? 4 : 3)}\ \text{nm}}`,
    meter: Math.min(1, speed / 3e8 / 0.2), meterLabel: `${tx(t, "phWp_liveSpeed", "electron speed")}: ${num(speed / 1e6, 2)} × 10⁶ m/s${V > 5000 ? ` (${tx(t, "phWp_liveRel", "relativity starts to matter")})` : ""}`,
  };
};

/** Smallest speed spread of something of mass m confined to a size Δx. */
const uncertaintyNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const m = 10 ** v.lm, dx = 10 ** v.lx, dv = 1.0546e-34 / (2 * m * dx);
  const e = Math.floor(Math.log10(dv)), mant = dv / 10 ** e;
  return {
    tex: r`\Delta v \ge \frac{\hbar}{2\,m\,\Delta x} = \frac{1.055\times10^{-34}}{2 \times 10^{${num(v.lm, 1)}} \times 10^{${num(v.lx, 1)}}} = \amber{${num(mant, 2)}\times10^{${e}}\ \text{m/s}}`,
    meter: Math.min(1, Math.max(0, (Math.log10(dv) + 20) / 28)), meterLabel: `${tx(t, "phWp_liveDv", "least speed spread")}: ${num(mant, 2)} × 10^${e} m/s`,
  };
};

export function WaveParticleContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phWp_intro",
          "The last chapter left light with two personalities: it interferes like a wave and arrives in packets like a stream of particles. In 1924 a French PhD student, Louis de Broglie, turned the puzzle around. If waves can behave like particles, perhaps particles, electrons, atoms, you, behave like waves. Three years later electrons were seen making diffraction patterns, and soon after the double-slit experiment was done with electrons one at a time. The way the two personalities fit together is the central idea of quantum mechanics: a particle is detected at one place, but where it is likely to be found is governed by a wave. Out of that wave comes the most famous limit in physics, Heisenberg's uncertainty principle.")}
      </Lead>

      <Goals t={t} id="phWp" items={[
        "Compute the de Broglie wavelength λ = h/p of an electron, an atom and an everyday object.",
        "Describe the one-particle-at-a-time double slit and state Born's rule, P = |ψ|².",
        "Explain why knowing which slit a particle went through destroys the fringes.",
        "Use the uncertainty principle Δx·Δp ≥ ħ/2 to estimate speeds in atoms and explain why it is a property of waves.",
      ]} />

      <H2>{tx(t, "phWp_dbTitle", "Matter waves: de Broglie's idea")}</H2>
      <p>
        {tx(t, "phWp_dbBody",
          "For a photon, Compton scattering had shown that p = h/λ. De Broglie's proposal was that the same relation, read backwards, gives a wavelength to anything with momentum. The faster or heavier the particle, the shorter its wave. It was a bold guess with no evidence; his examiners were unsure, sent the thesis to Einstein, and Einstein replied that it was \"more than a mere analogy\".")}
      </p>
      <Equation label={tx(t, "phWp_eqDb", "The de Broglie wavelength")}
        where={[
          [r`\lambda`, tx(t, "phWp_wLam", "the wavelength of the particle's wave")],
          [r`h`, tx(t, "phWp_wH", "Planck's constant, 6.626 × 10⁻³⁴ J·s")],
          [r`p = m v`, tx(t, "phWp_wP", "the particle's momentum: mass times speed (well below the speed of light)")],
        ]}
        words={tx(t, "phWp_dbWords", "Every moving thing has a wavelength, Planck's constant divided by its momentum.")}
        note={tx(t, "phWp_dbNote", "h is so small that only very light, slow particles have waves big enough to matter: wavelengths need to be comparable to the gaps and obstacles they meet before any wave behaviour shows.")}>
        {r`\lambda = \frac{h}{p} = \frac{h}{m v}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "phWp_tObj", "Object"), tx(t, "phWp_tMv", "Mass and speed"), "λ = h/mv", tx(t, "phWp_tComp", "Compared with")]}
        rows={[
          [tx(t, "phWp_r1", "electron in a TV tube or old monitor"), tx(t, "phWp_r1v", "9.1 × 10⁻³¹ kg, 6 × 10⁷ m/s (10 kV)"), tx(t, "phWp_r1l", "0.012 nm"), tx(t, "phWp_r1c", "a tenth of an atom")],
          [tx(t, "phWp_r2", "electron in a hydrogen atom"), tx(t, "phWp_r2v", "2.2 × 10⁶ m/s"), tx(t, "phWp_r2l", "0.33 nm"), tx(t, "phWp_r2c", "the atom's circumference (hydrogen-atom chapter)")],
          [tx(t, "phWp_r3", "a nitrogen molecule in the air"), tx(t, "phWp_r3v", "4.7 × 10⁻²⁶ kg, 500 m/s"), tx(t, "phWp_r3l", "0.028 nm"), tx(t, "phWp_r3c", "much smaller than the gaps between molecules")],
          [tx(t, "phWp_r4", "a speck of dust"), tx(t, "phWp_r4v", "10⁻¹⁵ kg, 1 mm/s"), tx(t, "phWp_r4l", "6.6 × 10⁻¹⁶ m"), tx(t, "phWp_r4c", "smaller than a proton")],
          [tx(t, "phWp_r5", "a thrown baseball"), tx(t, "phWp_r5v", "0.145 kg, 40 m/s"), tx(t, "phWp_r5l", "1.1 × 10⁻³⁴ m"), tx(t, "phWp_r5c", "hopelessly small: no experiment could ever see it")],
        ]}
      />
      <LiveFormula label={tx(t, "phWp_liveE", "Try it: an electron accelerated through a voltage")}
        tex={r`\tfrac{1}{2} m_e v^2 = eV \;\Rightarrow\; p = \sqrt{2 m_e e V}, \qquad \lambda = \frac{h}{p}`}
        vars={[{ id: "lv", label: tx(t, "phWp_liveV", "voltage V"), min: 0, max: 4.5, step: 0.05, value: 1.74, fmt: v => `${num(10 ** v, 10 ** v < 10 ? 1 : 0)} V` }]}
        compute={electronNumbers(t)}
        note={tx(t, "phWp_liveENote", "54 V, the voltage Davisson and Germer used, gives 0.167 nm, close to the spacing of atoms in a nickel crystal. A handy rule: λ ≈ 1.23 nm / √V. Above a few kilovolts the electron's speed becomes a sizeable fraction of c and the exact answer needs relativistic momentum, so this simple formula starts to drift.")} />

      <H3>{tx(t, "phWp_dgTitle", "Electrons diffract")}</H3>
      <p>
        {tx(t, "phWp_dgBody",
          "In 1927 Clinton Davisson and Lester Germer at Bell Labs fired 54 eV electrons at a nickel crystal and found them bouncing off strongly at one particular angle, 50°, exactly as X-rays of the same wavelength would. The rows of atoms acted as a diffraction grating (the wave optics chapter), and the angle gave λ = 0.165 nm, against de Broglie's 0.167 nm. The same year George Paget Thomson sent electrons through thin metal foil and photographed rings of diffraction. His father, J. J. Thomson, had won a Nobel Prize for showing the electron is a particle; the son won one for showing it is a wave.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phWp_microscope", "Electron microscopes exploit this. A light microscope cannot resolve details much smaller than half the wavelength of light, about 200 nm. Electrons accelerated through 200 kV have λ = 0.0025 nm, so electron microscopes can image single columns of atoms, and cryo-electron microscopy maps the shapes of proteins, which won the 2017 Nobel Prize in chemistry.")}
      </Callout>

      <H2>{tx(t, "phWp_oneTitle", "The double slit, one particle at a time")}</H2>
      <p>
        {tx(t, "phWp_oneBody",
          "The cleanest test is the double slit of the wave optics chapter, with the source turned down until only one particle at a time is in flight. In 1989 Akira Tonomura's team at Hitachi did it with electrons, about ten per second, so that each one was gone long before the next arrived. Every electron hit the screen at one point, as a particle should. Yet after thousands of hits the points formed interference fringes, which only a wave passing through both slits can make. Nothing was interfering with anything else: each electron interfered with itself.")}
      </p>
      <BuildupFigure t={t} />
      <p>
        {tx(t, "phWp_bornBody",
          "The rule that reconciles the two was found by Max Born in 1926. A particle is described by a wave, the wavefunction ψ (psi), which spreads, passes through both slits and interferes like any wave. The wavefunction is not something you see. What you see is the particle, at one place, and ψ tells you how likely each place is.")}
      </p>
      <Equation label={tx(t, "phWp_eqBorn", "Born's rule")}
        where={[
          [r`\psi(x)`, tx(t, "phWp_wPsi", "the wavefunction: a number (in general a complex number) at each point of space, which evolves like a wave")],
          [r`|\psi(x)|^2`, tx(t, "phWp_wPsi2", "its size squared, the probability density: the chance per unit length of finding the particle near x")],
          [r`P`, tx(t, "phWp_wP2", "the probability of finding the particle somewhere between a and b")],
        ]}
        words={tx(t, "phWp_bornWords", "The square of the wave's height at a point is how likely the particle is to be found there.")}
        note={tx(t, "phWp_bornNote", "The particle must be found somewhere, so the total chance is 1: ∫|ψ|² dx = 1 over all space (the integrals chapter of the Math track). A wavefunction scaled this way is called normalised. Interference comes from adding the waves first and squaring afterwards: |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + (a cross term), and the cross term, positive in some places and negative in others, makes the fringes.")}>
        {r`P(a \le x \le b) = \int_a^b |\psi(x)|^2\,dx`}
      </Equation>
      <H3>{tx(t, "phWp_whichTitle", "Looking at the slits")}</H3>
      <p>
        {tx(t, "phWp_whichBody",
          "Which slit did the electron go through? Put a detector at the slits, say a light that scatters off each electron as it passes, and you will find it at one slit or the other, never both. But then the fringes are gone: the pattern becomes |ψ₁|² + |ψ₂|², two overlapping blobs with no cross term. The detection is not a clumsy disturbance that could be refined away; any setup that records which slit was taken, even if nobody reads the record, destroys the interference. Niels Bohr called this complementarity: the wave behaviour and the which-path particle behaviour are both real, but no experiment shows both at once.")}
      </p>
      <LessonTable
        headers={[tx(t, "phWp_tSetup", "Setup"), tx(t, "phWp_tAdd", "What adds"), tx(t, "phWp_tSee", "What you see")]}
        rows={[
          [tx(t, "phWp_s1", "both slits open, path not recorded"), <Tex key="a">{r`|\psi_1 + \psi_2|^2`}</Tex>, tx(t, "phWp_s1s", "interference fringes")],
          [tx(t, "phWp_s2", "both slits open, which-slit detector on"), <Tex key="b">{r`|\psi_1|^2 + |\psi_2|^2`}</Tex>, tx(t, "phWp_s2s", "two overlapping blobs, no fringes")],
          [tx(t, "phWp_s3", "one slit closed"), <Tex key="c">{r`|\psi_1|^2`}</Tex>, tx(t, "phWp_s3s", "one blob (single-slit diffraction)")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phWp_big", "How big can a quantum wave be? In 1999 Markus Arndt and Anton Zeilinger's group in Vienna made C₆₀ molecules, footballs of 60 carbon atoms, interfere through a grating; their λ was 2.5 pm, 400 times smaller than the molecule itself. By 2019 the same group had done it with molecules of 2 000 atoms. No upper limit has been found, but larger and warmer objects interact with their surroundings so constantly that their path is always being recorded, and the fringes wash out (decoherence).")}
      </Callout>

      <H2>{tx(t, "phWp_packTitle", "Wave packets")}</H2>
      <p>
        {tx(t, "phWp_packBody",
          "A wave with a single exact wavelength, ψ = e^(ikx), goes on unchanged for ever, so its |ψ|² is the same everywhere: a particle with a perfectly known momentum could be anywhere. A particle known to be in one region is described by a wave packet: many waves with a range of wavelengths, added so that they reinforce in one place and cancel elsewhere. The wavenumber k = 2π/λ counts how many radians of wave fit in a metre, and with de Broglie p = h/λ the momentum is p = ħk.")}
      </p>
      <Equation label={tx(t, "phWp_eqHbar", "The reduced Planck constant")}
        where={[
          [r`\hbar`, tx(t, "phWp_wHbar", "h-bar, Planck's constant divided by 2π; quantum formulas written with the wavenumber k and the angular frequency ω use it")],
          [r`k = \frac{2\pi}{\lambda}`, tx(t, "phWp_wK", "the wavenumber, in radians per metre")],
        ]}
        words={tx(t, "phWp_hbarWords", "Momentum is ħ times the wavenumber, and energy is ħ times the angular frequency.")}>
        {r`\hbar = \frac{h}{2\pi} = 1.055\times10^{-34}\ \text{J·s}, \qquad p = \hbar k, \qquad E = \hbar\omega`}
      </Equation>
      <WavePacketFigure t={t} />

      <H2>{tx(t, "phWp_hupTitle", "Heisenberg's uncertainty principle")}</H2>
      <p>
        {tx(t, "phWp_hupBody",
          "The figure shows a fact about all waves, sound and water as much as matter: a packet made of a narrow range of wavenumbers is long, and a short packet needs a wide range. For a bell-shaped packet the spreads, measured as standard deviations (the statistics chapter of the Math track), obey Δx · Δk = ½ exactly; any other shape gives more. Multiply by ħ and the statement is about momentum. Werner Heisenberg found it in 1927.")}
      </p>
      <Derivation t={t} label={tx(t, "phWp_eqHupD", "From waves to the uncertainty principle")}
        steps={[
          { tex: r`\Delta x\,\Delta k \ge \tfrac12`, why: tx(t, "phWp_h1", "a property of adding waves (Fourier analysis, the Fourier chapter of the Math track): the narrower a packet in x, the wider its recipe in k, with equality for a bell curve") },
          { tex: r`p = \hbar k \;\to\; \Delta p = \hbar\,\Delta k`, why: tx(t, "phWp_h2", "de Broglie's relation, in wavenumber form: spreads in k are spreads in momentum") },
          { tex: r`\green{\Delta x\,\Delta p \ge \frac{\hbar}{2}}`, why: tx(t, "phWp_h3", "multiply the first line by ħ") },
        ]} />
      <Equation label={tx(t, "phWp_eqHup", "The uncertainty principle")}
        where={[
          [r`\Delta x`, tx(t, "phWp_wDx", "the spread of positions at which the particle could be found (standard deviation)")],
          [r`\Delta p`, tx(t, "phWp_wDp", "the spread of momenta it could be found to have")],
        ]}
        words={tx(t, "phWp_hupWords", "The more sharply a particle's position is pinned down, the more spread out its momentum must be, and the other way round.")}
        note={tx(t, "phWp_hupNote", "It is not about clumsy instruments. A particle does not have an exact position and an exact momentum that we are too crude to measure; its wave simply cannot be narrow in both at once. A similar relation, ΔE · Δt ≳ ħ/2, links the spread of a state's energy to how long it lasts: short-lived excited states of atoms have slightly blurred energies, which widens their spectral lines.")}>
        {r`\Delta x\,\Delta p \ge \frac{\hbar}{2}`}
      </Equation>
      <LiveFormula label={tx(t, "phWp_liveHup", "Try it: squeeze something into a small space")}
        tex={r`\Delta v \ge \frac{\hbar}{2\,m\,\Delta x}`}
        vars={[
          { id: "lm", label: tx(t, "phWp_liveM", "mass m (kg, log₁₀)"), min: -31, max: 0, step: 0.1, value: -30, fmt: v => `10^${num(v, 1)}` },
          { id: "lx", label: tx(t, "phWp_liveX", "size Δx (m, log₁₀)"), min: -15, max: -2, step: 0.1, value: -10, fmt: v => `10^${num(v, 1)}` },
        ]}
        compute={uncertaintyNumbers(t)}
        note={tx(t, "phWp_liveHupNote", "An electron (9.1 × 10⁻³¹ kg, about 10^−30) held within an atom (10⁻¹⁰ m) must have a speed spread of at least 6 × 10⁵ m/s: the electron cannot sit still, and that restless motion is what keeps atoms from collapsing. A grain of sand (10⁻⁶ kg) pinned to a micrometre has a spread of 5 × 10⁻²³ m/s, utterly unmeasurable.")} />

      <H2>{tx(t, "phWp_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phWp_ex1", "1. A neutron from a nuclear reactor, cooled to room temperature, moves at about 2 200 m/s: λ = 6.626 × 10⁻³⁴ / (1.675 × 10⁻²⁷ × 2 200) = 0.18 nm, about the spacing of atoms. Neutron diffraction uses this to find where atoms sit in a crystal.")}</p>
      <p>{tx(t, "phWp_ex2", "2. Electrons of 0.167 nm through two slits 1 µm apart, screen 1 m away: fringe spacing λL/d = 0.167 × 10⁻⁹ × 1 / 10⁻⁶ = 0.17 mm. Real experiments use much closer slits or an electron biprism to spread the fringes.")}</p>
      <p>{tx(t, "phWp_ex3", "3. Confine an electron to a nucleus-sized region, 10⁻¹⁴ m: Δp ≥ ħ/(2Δx) = 5.3 × 10⁻²¹ kg·m/s, so pc ≈ 10 MeV. That is far more energy than nuclear forces could hold an electron with, one argument that nuclei cannot contain electrons.")}</p>
      <p>{tx(t, "phWp_ex4", "4. A pendulum bob of 1 kg on Earth: its position known to 1 µm, Δv ≥ 10⁻³⁴ / (2 × 10⁻⁶) ≈ 5 × 10⁻²⁹ m/s. For everyday objects the uncertainty principle is real but far beyond any measurement.")}</p>

      <H2>{tx(t, "phWp_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phWp_tWrong", "Wrong"), tx(t, "phWp_tRight", "Right"), tx(t, "phWp_tWhy", "Why")]}
        rows={[
          [tx(t, "phWp_m1w", "the electron is smeared out like a cloud of charge"), tx(t, "phWp_m1r", "it is found at one point each time"), tx(t, "phWp_m1", "ψ gives the chances; each detection is a single point")],
          [tx(t, "phWp_m2w", "the particles interfere with each other"), tx(t, "phWp_m2r", "each one interferes with itself"), tx(t, "phWp_m2", "the fringes form even with one particle at a time")],
          [tx(t, "phWp_m3w", "uncertainty is measurement error"), tx(t, "phWp_m3r", "it is a property of the state"), tx(t, "phWp_m3", "no wave is narrow in both x and k")],
          [tx(t, "phWp_m4w", "|ψ| is the probability"), tx(t, "phWp_m4r", "|ψ|² is"), tx(t, "phWp_m4", "the amplitudes add, the squares give the chances")],
          [tx(t, "phWp_m5w", "large objects have no wavelength"), tx(t, "phWp_m5r", "they do, just tiny"), tx(t, "phWp_m5", "λ = h/mv applies to everything; it is only too small to see")],
        ]}
      />

      <KeyIdeas t={t} id="phWp" items={[
        "Everything with momentum p has a wavelength λ = h/p; only light, slow particles have waves large enough to notice.",
        "Electrons diffract (Davisson–Germer 1927), and electron microscopes use their short wavelength to see atoms.",
        "Sent one at a time through two slits, particles land at single points that build up interference fringes.",
        "Born's rule: the wavefunction ψ evolves like a wave, and |ψ|² is the probability density of finding the particle.",
        "Recording which slit a particle used removes the cross term and the fringes (complementarity).",
        "A localised particle is a wave packet; since p = ħk, its spreads obey Δx·Δp ≥ ħ/2 (Heisenberg), a property of waves, not of instruments.",
      ]} />
    </Article>
  );
}

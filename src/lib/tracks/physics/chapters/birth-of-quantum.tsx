"use client";

// Quantum foundations 1: the birth of quantum physics — the three puzzles of
// 1900 (black-body light, the photoelectric effect, sharp spectral lines),
// counting the modes of an oven and the ultraviolet catastrophe of
// equipartition, Planck's packets E = nhf and the average energy of a mode
// derived with Boltzmann factors, Planck's law and its limits, photons and
// Einstein's photoelectric equation (threshold, stopping voltage, Millikan),
// photon momentum p = h/λ and Compton scattering derived from the two
// conservation laws, and what changed.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { UltravioletFigure } from "@/components/lesson/figures/physics/UltravioletFigure";
import { PhotoelectricFigure } from "@/components/lesson/figures/physics/PhotoelectricFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Energy of one photon, and how many a lamp sends out each second. */
const photonNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const E = 1240 / v.l, J = E * 1.602e-19, n = v.P / J;
  const e = Math.floor(Math.log10(n)), m = n / 10 ** e;
  return {
    tex: r`E = \frac{1240\ \text{eV·nm}}{${num(v.l, 0)}\ \text{nm}} = \amber{${num(E, 2)}\ \text{eV}} = ${num(J * 1e19, 2)}\times10^{-19}\ \text{J}, \quad N = \frac{${num(v.P, 1)}\ \text{W}}{E} = \green{${num(m, 2)}\times10^{${e}}\ \text{photons/s}}`,
    meter: Math.min(1, E / 6), meterLabel: `${tx(t, "phBq_livePhoton", "energy of one photon")}: ${num(E, 2)} eV`,
  };
};

/** Compton's wavelength shift for a scattering angle θ. */
const comptonNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const d = 2.426 * (1 - Math.cos((v.th * Math.PI) / 180));
  const l2 = v.l + d, lost = 1 - v.l / l2;
  return {
    tex: r`\Delta\lambda = 2.426\ \text{pm} \times (1 - \cos ${num(v.th, 0)}^\circ) = \amber{${num(d, 3)}\ \text{pm}}, \quad \lambda' = ${num(v.l, 1)} + ${num(d, 3)} = \green{${num(l2, 2)}\ \text{pm}}`,
    meter: lost, meterLabel: `${tx(t, "phBq_liveLost", "energy handed to the electron")}: ${num(lost * 100, 1)}%`,
  };
};

export function BirthOfQuantumContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phBq_intro",
          "By 1900 physics looked nearly finished. Newton's mechanics ran the heavens, Maxwell's equations explained light, and thermodynamics explained heat. A few small puzzles were left over. One was the colour of hot things: the theory of light and the theory of heat, each excellent on its own, combined to predict that every warm object should blaze with infinite energy in the ultraviolet. Another was that light shone on a metal knocks electrons out in a way waves cannot explain. Solving them took a single new idea, that energy comes in packets, and that idea grew within thirty years into quantum mechanics, the physics of atoms, chemistry, lasers, transistors and every chip in your computer. This chapter follows the first two steps: Planck's packets in 1900 and Einstein's photons in 1905.")}
      </Lead>

      <Goals t={t} id="phBq" items={[
        "Explain why classical physics predicts infinite energy in a hot oven (the ultraviolet catastrophe).",
        "Derive the average energy of a mode from Planck's rule E = nhf and use Planck's law.",
        "Use Einstein's equation K_max = hf − W to predict the photoelectric effect, including the threshold and the stopping voltage.",
        "Compute a photon's energy and momentum and the Compton shift of scattered X-rays.",
      ]} />

      <H2>{tx(t, "phBq_puzzTitle", "Three puzzles around 1900")}</H2>
      <LessonTable
        headers={[tx(t, "phBq_tPuzzle", "Puzzle"), tx(t, "phBq_tSeen", "What experiments showed"), tx(t, "phBq_tClass", "What classical physics said")]}
        rows={[
          [tx(t, "phBq_z1", "black-body light"), tx(t, "phBq_z1s", "the light inside a hot oven rises, peaks and falls with frequency; the peak moves with temperature"), tx(t, "phBq_z1c", "the light should grow without limit towards the ultraviolet")],
          [tx(t, "phBq_z2", "photoelectric effect"), tx(t, "phBq_z2s", "light ejects electrons from a metal only above a threshold frequency, instantly, at speeds set by the colour"), tx(t, "phBq_z2c", "any colour should work if bright enough, after a delay, with speeds set by brightness")],
          [tx(t, "phBq_z3", "atomic spectra"), tx(t, "phBq_z3s", "a glowing gas gives sharp lines at a few exact wavelengths, and atoms are stable"), tx(t, "phBq_z3c", "an orbiting electron should radiate a smear of colours and spiral into the nucleus in about 10⁻¹¹ s")],
        ]}
      />
      <p>
        {tx(t, "phBq_puzzBody",
          "This chapter solves the first two. The third, the atom, needs the full theory of the next two chapters and is the subject of the last chapter of this section.")}
      </p>

      <H2>{tx(t, "phBq_bbTitle", "Light in a hot oven")}</H2>
      <p>
        {tx(t, "phBq_bbBody",
          "A black body is an object that absorbs all the light that falls on it. The best practical one is a small hole in the wall of a closed oven: light that enters bounces around inside and is almost never reflected back out. The light that does come out of the hole was made by the hot walls and has come to equilibrium with them, so its spectrum depends only on the temperature, not on what the walls are made of. That makes it a question of pure physics: how much light, at each frequency, does an oven at temperature T contain?")}
      </p>
      <p>
        {tx(t, "phBq_modesBody",
          "Inside a closed box, light can only exist as standing waves that fit between the walls, just as a guitar string can only vibrate at its harmonics (the waves chapter). Each allowed pattern is a mode. Counting them for a cube is a three-dimensional version of counting harmonics, and the answer grows with the square of the frequency: twice the frequency, four times as many modes in each band. The number does not depend on any theory of heat; it is pure geometry of waves.")}
      </p>
      <Equation label={tx(t, "phBq_eqModes", "Number of modes per unit volume, between f and f + df")}
        where={[
          [r`n(f)\,df`, tx(t, "phBq_wN", "how many standing-wave patterns of light, per cubic metre of oven, have a frequency in the small band from f to f + df")],
          [r`8\pi`, tx(t, "phBq_w8pi", "4π from counting the patterns in every direction (the area of a unit sphere), times 2 for the two polarisations of light")],
          [r`c`, tx(t, "phBq_wC", "the speed of light, 3.00 × 10⁸ m/s")],
        ]}
        words={tx(t, "phBq_modesWords", "The higher the frequency, the more ways there are to fit a standing wave in the box, growing as f².")}>
        {r`n(f)\,df = \frac{8\pi f^2}{c^3}\,df`}
      </Equation>
      <H3>{tx(t, "phBq_catTitle", "The ultraviolet catastrophe")}</H3>
      <p>
        {tx(t, "phBq_catBody",
          "Each mode is an oscillator, like a mass on a spring. Classical statistical mechanics gives every oscillator in equilibrium the same average energy, kT (½kT for its motion and ½kT for its stretch: the equipartition theorem of the statistical mechanics chapter). Multiply the number of modes by kT and you get the energy of the light, per frequency band, in each cubic metre of the oven. Lord Rayleigh and James Jeans worked it out in 1900–1905.")}
      </p>
      <Equation label={tx(t, "phBq_eqRj", "The classical prediction (Rayleigh–Jeans)")}
        where={[
          [r`u(f)`, tx(t, "phBq_wU", "the energy density per unit frequency: joules per cubic metre per hertz")],
          [r`k`, tx(t, "phBq_wK", "Boltzmann's constant, 1.381 × 10⁻²³ J/K: kT is the typical thermal energy at temperature T (0.026 eV at room temperature)")],
          [r`T`, tx(t, "phBq_wT", "the oven's temperature, in kelvin")],
        ]}
        words={tx(t, "phBq_rjWords", "Every mode gets kT, and there are more and more modes at higher frequency, so the energy keeps growing.")}
        note={tx(t, "phBq_rjNote", "At low frequencies (infrared, for an oven at 1500 K) this matches the measurements very well. At high frequencies it grows without limit, and integrated over all frequencies it gives infinite energy in every oven. Paul Ehrenfest later named this the ultraviolet catastrophe. Every warm object would instantly radiate away all its heat as X-rays and gamma rays.")}>
        {r`u(f) = \frac{8\pi f^2}{c^3}\,kT`}
      </Equation>

      <H2>{tx(t, "phBq_planckTitle", "Planck's packets of energy")}</H2>
      <p>
        {tx(t, "phBq_planckBody",
          "Max Planck found a formula that fitted the measurements in October 1900, and spent the following weeks looking for a reason. The only one he could find, an \"act of desperation\" in his own words, was that an oscillator of frequency f cannot hold any amount of energy: only whole multiples of a smallest packet, a quantum, of size hf. The new constant h is now called Planck's constant.")}
      </p>
      <Equation label={tx(t, "phBq_eqQuant", "Planck's rule")}
        where={[
          [r`E_n`, tx(t, "phBq_wEn", "the energies an oscillator of frequency f is allowed to have")],
          [r`n`, tx(t, "phBq_wNn", "a whole number, 0, 1, 2, 3, …: how many packets it holds")],
          [r`h`, tx(t, "phBq_wH", "Planck's constant, 6.626 × 10⁻³⁴ J·s; since 2019 it is exact by definition and fixes the kilogram (units chapter)")],
          [r`f`, tx(t, "phBq_wF", "the oscillator's frequency, in hertz")],
        ]}
        words={tx(t, "phBq_quantWords", "Energy at frequency f comes in packets of hf, and you cannot have part of a packet.")}>
        {r`E_n = n\,h f, \qquad n = 0, 1, 2, \dots`}
      </Equation>
      <p>
        {tx(t, "phBq_avgBody",
          "With packets, the average energy of a mode is no longer kT. In equilibrium, the chance that an oscillator holds energy E is proportional to the Boltzmann factor e^(−E/kT) (statistical mechanics chapter). Average over the allowed energies:")}
      </p>
      <Derivation t={t} label={tx(t, "phBq_eqAvg", "The average energy of one mode")}
        steps={[
          { tex: r`\langle E\rangle = \frac{\sum_n n h f\, e^{-n h f / kT}}{\sum_n e^{-n h f / kT}}`, why: tx(t, "phBq_v1", "each allowed energy nhf, weighted by its Boltzmann factor, divided by the sum of the weights so that the chances add up to 1") },
          { tex: r`x = e^{-hf/kT}: \quad \sum_n x^n = \frac{1}{1 - x}, \qquad \sum_n n\,x^n = \frac{x}{(1 - x)^2}`, why: tx(t, "phBq_v2", "the sums are a geometric series (Math track) and its derivative: write x for the factor of one packet, so n packets give xⁿ") },
          { tex: r`\langle E\rangle = h f\,\frac{x}{1 - x} = \frac{h f}{1/x - 1}`, why: tx(t, "phBq_v3", "divide the two sums") },
          { tex: r`\green{\langle E\rangle = \frac{h f}{e^{hf/kT} - 1}}`, why: tx(t, "phBq_v4", "put back 1/x = e^(hf/kT)") },
        ]} />
      <p>
        {tx(t, "phBq_limits",
          "Check the two ends. When one packet is cheap, hf ≪ kT, the exponential is about 1 + hf/kT and ⟨E⟩ ≈ kT: the classical answer, so the infrared stays right. When one packet is expensive, hf ≫ kT, the exponential is huge and ⟨E⟩ ≈ hf·e^(−hf/kT), which falls almost to zero: a mode that would need more than its share of thermal energy for even one packet is hardly ever excited. The high modes freeze out, and the catastrophe goes away.")}
      </p>
      <Equation label={tx(t, "phBq_eqPlanck", "Planck's law")}
        where={[
          [r`\frac{8\pi f^2}{c^3}`, tx(t, "phBq_wModes", "the number of modes per unit volume and frequency, unchanged")],
          [r`\frac{hf}{e^{hf/kT}-1}`, tx(t, "phBq_wAvg", "the average energy of one mode, just derived")],
        ]}
        words={tx(t, "phBq_planckWords", "The light in an oven is the number of modes times the energy each one gets, and high-frequency modes get almost none.")}
        note={tx(t, "phBq_planckNote", "Its peak lies at hf = 2.82 kT, so it moves in proportion to the temperature (Wien's law); measured by wavelength, the peak is at λ = 2.898 mm·K / T, 500 nm for the Sun's 5800 K. The total, integrated over all frequencies, is finite and grows as T⁴ (the Stefan–Boltzmann law of the temperature and heat chapter). How a spectrum turns into the colour the eye sees is worked out in the Fire & Smoke chapter of the GLSL track.")}>
        {r`u(f) = \frac{8\pi f^2}{c^3}\,\frac{h f}{e^{hf/kT} - 1}`}
      </Equation>
      <UltravioletFigure t={t} />
      <Callout type="info" t={t}>
        {tx(t, "phBq_cmb", "The best black body ever measured is the whole universe. The cosmic microwave background, light left over from 380 000 years after the Big Bang, matches Planck's law for T = 2.725 K so closely that the COBE satellite's 1990 data points sat within the width of the line drawn through them.")}
      </Callout>

      <H2>{tx(t, "phBq_peTitle", "Photons: the photoelectric effect")}</H2>
      <p>
        {tx(t, "phBq_peBody",
          "Planck thought of his packets as a property of the oscillators in the walls, not of light itself. In 1905, the same year as relativity, Einstein went further: light itself is made of packets, later named photons, each carrying energy hf. The strongest evidence was an effect Heinrich Hertz had stumbled on in 1887 and Philipp Lenard had measured in 1902. Light falling on a clean metal knocks electrons out of it, and the details are strange for a wave.")}
      </p>
      <LessonTable
        headers={[tx(t, "phBq_tObs", "Observation"), tx(t, "phBq_tWave", "Wave picture expects"), tx(t, "phBq_tPhoton", "Photon picture explains")]}
        rows={[
          [tx(t, "phBq_o1", "below a threshold frequency, no electrons at all, however bright the light"), tx(t, "phBq_o1w", "bright enough light of any colour should work"), tx(t, "phBq_o1p", "one photon frees one electron; if hf < W, no single photon has enough")],
          [tx(t, "phBq_o2", "the fastest electrons' energy rises with frequency and does not depend on brightness"), tx(t, "phBq_o2w", "a stronger wave should shake electrons harder"), tx(t, "phBq_o2p", "each electron gets one photon's energy, hf; brightness only adds photons")],
          [tx(t, "phBq_o3", "the current is proportional to brightness"), tx(t, "phBq_o3w", "agrees"), tx(t, "phBq_o3p", "more photons per second, more electrons per second")],
          [tx(t, "phBq_o4", "electrons come out at once, even in very dim light (within 10⁻⁹ s)"), tx(t, "phBq_o4w", "in dim light an atom needs minutes to soak up enough energy"), tx(t, "phBq_o4p", "the first photon that arrives can free an electron")],
        ]}
      />
      <Equation label={tx(t, "phBq_eqPe", "Einstein's photoelectric equation")}
        where={[
          [r`K_\text{max}`, tx(t, "phBq_wKmax", "the kinetic energy of the fastest electrons that come out")],
          [r`hf`, tx(t, "phBq_wHf", "the energy of one photon")],
          [r`W`, tx(t, "phBq_wW", "the work function: the least energy needed to pull an electron out of that metal, 2 to 6 eV (2.28 eV for sodium, 4.3 eV for zinc)")],
        ]}
        words={tx(t, "phBq_peWords", "The photon's energy pays the exit fee W, and what is left over is the electron's kinetic energy.")}
        note={tx(t, "phBq_peNote", "Electrons that start deeper in the metal lose some energy on the way out, so most come out slower than K_max. The threshold frequency is f₀ = W/h.")}>
        {r`K_\text{max} = h f - W`}
      </Equation>
      <PhotoelectricFigure t={t} />
      <p>
        {tx(t, "phBq_stopBody",
          "K_max is measured with a voltage. Make the collector negative: it pushes the electrons back, and the current stops when the voltage V₀ is just enough to turn the fastest ones round, eV₀ = K_max (the electric potential chapter: a charge e crossing a voltage V gains or loses energy eV). A plot of V₀ against f is a straight line of slope h/e for every metal. Robert Millikan spent ten years trying to prove Einstein wrong this way, and in 1916 confirmed the line and measured h to within 0.5%. Einstein's Nobel Prize, in 1921, was for this, not for relativity.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phBq_ev", "A handy shortcut: with energies in electron-volts and wavelengths in nanometres, hc = 1240 eV·nm, so a photon of wavelength λ carries E = 1240/λ eV. Red light at 700 nm: 1.77 eV. Violet at 400 nm: 3.10 eV. Medical X-rays at 0.02 nm: 62 000 eV.")}
      </Callout>
      <LiveFormula label={tx(t, "phBq_livePhot", "Try it: how many photons a lamp gives out")}
        tex={r`E = h f = \frac{hc}{\lambda}, \qquad N = \frac{P}{E}`}
        vars={[
          { id: "l", label: tx(t, "phBq_liveL", "wavelength λ (nm)"), min: 100, max: 1500, step: 10, value: 550, fmt: v => `${num(v, 0)} nm` },
          { id: "P", label: tx(t, "phBq_liveP", "light power P (W)"), min: 0.1, max: 10, step: 0.1, value: 1, fmt: v => `${num(v, 1)} W` },
        ]}
        compute={photonNumbers(t)}
        note={tx(t, "phBq_livePhotNote", "One watt of green light is nearly 3 × 10¹⁸ photons every second. That is why light looks smooth: each packet is tiny. The eye, adapted to the dark, can notice a flash of about ten photons.")} />

      <H2>{tx(t, "phBq_comptonTitle", "Photons have momentum: Compton scattering")}</H2>
      <p>
        {tx(t, "phBq_comptonBody",
          "If light is particles, it should also carry momentum. The relativistic energy chapter showed that for something with no mass E = pc, so a photon of energy hf has momentum p = hf/c = h/λ. In 1923 Arthur Compton fired X-rays at graphite and found that the X-rays scattered at an angle θ came out with a longer wavelength, by an amount that depended only on the angle. A wave scattered by a charge keeps its wavelength. A photon bouncing off an electron, like one billiard ball off another, hands over some of its energy, and less energy means a longer wavelength.")}
      </p>
      <Derivation t={t} label={tx(t, "phBq_eqComp", "A photon hits an electron at rest")}
        steps={[
          { tex: r`\frac{hc}{\lambda} + m c^2 = \frac{hc}{\lambda'} + E_e`, why: tx(t, "phBq_c1", "energy is conserved: photon in plus the electron's rest energy equals photon out plus the electron's total energy afterwards") },
          { tex: r`\vec p_e = \vec p - \vec p\,' \;\to\; p_e^2 = p^2 + p'^2 - 2 p p' \cos\theta`, why: tx(t, "phBq_c2", "momentum is conserved: whatever the photon lost, the electron carries. Squaring a difference of two vectors at angle θ is the law of cosines (Math track)") },
          { tex: r`E_e^2 = (p_e c)^2 + (mc^2)^2`, why: tx(t, "phBq_c3", "the energy–momentum relation of the relativistic energy chapter ties the electron's energy to its momentum") },
          { tex: r`\green{\lambda' - \lambda = \frac{h}{m c}\,(1 - \cos\theta)}`, why: tx(t, "phBq_c4", "put E_e from the first line and p_e² from the second into the third, and write p = h/λ: the squares of mc² cancel and the result rearranges to this") },
        ]} />
      <Equation label={tx(t, "phBq_eqCompton", "The Compton shift")}
        where={[
          [r`\lambda,\ \lambda'`, tx(t, "phBq_wLam", "the photon's wavelength before and after")],
          [r`\theta`, tx(t, "phBq_wTh", "the angle between the photon's old and new directions")],
          [r`\frac{h}{mc}`, tx(t, "phBq_wComp", "the Compton wavelength of the electron, 2.426 × 10⁻¹² m = 2.426 pm")],
        ]}
        words={tx(t, "phBq_compWords", "A photon that bounces off an electron comes out with a longer wavelength, more so the more sharply it turns.")}
        note={tx(t, "phBq_compNote", "The biggest shift, 2 × 2.426 pm, is for a photon bounced straight back. For visible light, 500 000 pm long, that is invisible; for X-rays of about 70 pm, as Compton used, it is a few percent and easy to measure.")}>
        {r`\Delta\lambda = \frac{h}{m_e c}\,(1 - \cos\theta)`}
      </Equation>
      <LiveFormula label={tx(t, "phBq_liveComp", "Try it: an X-ray photon bouncing off an electron")}
        tex={r`\lambda' = \lambda + \frac{h}{m_e c}\,(1 - \cos\theta)`}
        vars={[
          { id: "l", label: tx(t, "phBq_liveLam", "wavelength in λ (pm)"), min: 1, max: 100, step: 0.5, value: 71, fmt: v => `${num(v, 1)} pm` },
          { id: "th", label: tx(t, "phBq_liveTh", "angle θ"), min: 0, max: 180, step: 1, value: 90, fmt: v => `${num(v, 0)}°` },
        ]}
        compute={comptonNumbers(t)}
        note={tx(t, "phBq_liveCompNote", "The shift does not depend on the wavelength you start with, so short-wavelength gamma rays lose a much bigger share of their energy. Hospitals' PET scanners and gamma cameras must sort out Compton-scattered photons for this reason.")} />

      <H2>{tx(t, "phBq_whatTitle", "What changed")}</H2>
      <LessonTable
        headers={[tx(t, "phBq_tBefore", "Before 1900"), tx(t, "phBq_tAfter", "After 1905")]}
        rows={[
          [tx(t, "phBq_w1a", "energy can take any value"), tx(t, "phBq_w1b", "an oscillator of frequency f holds energy in steps of hf")],
          [tx(t, "phBq_w2a", "light is a wave"), tx(t, "phBq_w2b", "light is also a stream of photons, each with E = hf and p = h/λ")],
          [tx(t, "phBq_w3a", "brightness is the size of the wave"), tx(t, "phBq_w3b", "brightness is the number of photons per second")],
          [tx(t, "phBq_w4a", "h did not exist"), tx(t, "phBq_w4b", "h sets the scale where the quantum world shows: for anything with a frequency f, compare hf with kT and with the energies involved")],
        ]}
      />
      <p>
        {tx(t, "phBq_puzzleLeft",
          "That leaves an awkward question. The wave optics chapter proved that light makes interference fringes, which only waves can do. This chapter proved that it arrives in packets, which only particles do. The next chapter shows that both are true at once, and that electrons, too, behave like waves.")}
      </p>

      <H2>{tx(t, "phBq_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phBq_ex1", "1. A red laser pointer, 650 nm and 1 mW: each photon carries 1240/650 = 1.91 eV = 3.06 × 10⁻¹⁹ J, so the beam carries 10⁻³ / 3.06 × 10⁻¹⁹ = 3.3 × 10¹⁵ photons per second.")}</p>
      <p>{tx(t, "phBq_ex2", "2. Ultraviolet light of 250 nm on zinc (W = 4.3 eV): hf = 1240/250 = 4.96 eV, K_max = 4.96 − 4.3 = 0.66 eV, so a stopping voltage of 0.66 V. The threshold is 1240/4.3 = 288 nm: visible light cannot free electrons from zinc.")}</p>
      <p>{tx(t, "phBq_ex3", "3. Why a guitar string shows no quantum effects: at f = 440 Hz one packet is hf = 2.9 × 10⁻³¹ J, while a string plucked with 10⁻³ J of energy holds about 3 × 10²⁷ packets. The steps are far too small to notice. At room temperature kT = 4 × 10⁻²¹ J, so the steps only matter for f above about kT/h = 6 × 10¹² Hz: infrared and beyond.")}</p>
      <p>{tx(t, "phBq_ex4", "4. A 71 pm X-ray (from a molybdenum target, as Compton used) scattered at 90°: Δλ = 2.426 × (1 − 0) = 2.43 pm, so λ′ = 73.4 pm. The photon has lost 3.3% of its energy, about 580 eV, which the electron carries off.")}</p>

      <H2>{tx(t, "phBq_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phBq_tWrong", "Wrong"), tx(t, "phBq_tRight", "Right"), tx(t, "phBq_tWhy", "Why")]}
        rows={[
          [tx(t, "phBq_m1w", "brighter light gives faster electrons"), tx(t, "phBq_m1r", "bluer light does"), tx(t, "phBq_m1", "brightness is the number of photons; the colour is the energy of each one")],
          [tx(t, "phBq_m2w", "two photons can add up to free an electron"), tx(t, "phBq_m2r", "one photon per electron (in ordinary light)"), tx(t, "phBq_m2", "a photon is absorbed whole by one electron; only intense lasers make two-photon absorption likely")],
          [tx(t, "phBq_m3w", "Planck's law fails at low frequency"), tx(t, "phBq_m3r", "it becomes the classical law there"), tx(t, "phBq_m3", "when hf ≪ kT the average energy per mode is kT again")],
          [tx(t, "phBq_m4w", "a photon has mass, since it has momentum"), tx(t, "phBq_m4r", "p = E/c with zero mass"), tx(t, "phBq_m4", "E² = (pc)² + (mc²)² allows momentum with m = 0")],
          [tx(t, "phBq_m5w", "Compton's shift depends on the wavelength"), tx(t, "phBq_m5r", "only on the angle"), tx(t, "phBq_m5", "Δλ = (h/mc)(1 − cos θ); the share of energy lost does depend on λ")],
        ]}
      />

      <KeyIdeas t={t} id="phBq" items={[
        "Light in a box is a set of standing-wave modes whose number grows as f²; giving each one kT (classical) predicts infinite energy, the ultraviolet catastrophe.",
        "Planck (1900): an oscillator of frequency f holds energy only in packets hf, with h = 6.626 × 10⁻³⁴ J·s.",
        "With packets, a mode's average energy is hf/(e^(hf/kT) − 1): kT for cheap packets, nearly zero for dear ones, so Planck's law rises, peaks at hf = 2.82 kT and falls.",
        "Einstein (1905): light is made of photons with E = hf; in the photoelectric effect one photon frees one electron with K_max = hf − W.",
        "Brightness is the number of photons, colour the energy of each; hc = 1240 eV·nm turns wavelengths into photon energies.",
        "Photons carry momentum p = h/λ, shown by Compton scattering: Δλ = (h/mc)(1 − cos θ).",
      ]} />
    </Article>
  );
}

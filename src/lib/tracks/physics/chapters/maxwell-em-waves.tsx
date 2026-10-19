"use client";

// Electromagnetism & Light 2: Maxwell's equations and electromagnetic waves —
// the four laws met so far, the charging-capacitor paradox and the
// displacement current derived, the full set in integral form, the 1-D wave
// equation derived from Faraday + Ampère–Maxwell with c = 1/√(μ₀ε₀) and
// E = cB, how antennas radiate, the spectrum, energy density, intensity and
// radiation pressure, and polarisation with Malus's law.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { EmWaveFigure } from "@/components/lesson/figures/physics/EmWaveFigure";
import { PolarizerFigure } from "@/components/lesson/figures/physics/PolarizerFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");
const C_LIGHT = 2.998e8;

/** A number as "a × 10ⁿ" in TeX. */
const sci = (v: number, d = 2) => {
  const e = Math.floor(Math.log10(Math.abs(v)));
  const m = v / 10 ** e;
  return e >= -2 && e <= 3 ? num(v, d) : r`${num(m, d)} \times 10^{${e}}`;
};

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** λ = c / f, with the name of the band the wave falls in. */
const spectrumNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const f = 10 ** v.lg, lam = C_LIGHT / f;
  const band =
    lam > 1e-3 ? (lam > 1 ? tx(t, "phEm_bandRadio", "radio") : tx(t, "phEm_bandMicro", "microwave"))
    : lam > 700e-9 ? tx(t, "phEm_bandIr", "infrared")
    : lam > 400e-9 ? tx(t, "phEm_bandVis", "visible light")
    : lam > 10e-9 ? tx(t, "phEm_bandUv", "ultraviolet")
    : lam > 10e-12 ? tx(t, "phEm_bandX", "X-rays")
    : tx(t, "phEm_bandGamma", "gamma rays");
  return {
    tex: r`\lambda = \frac{c}{f} = \frac{2.998 \times 10^{8}\ \text{m/s}}{${sci(f)}\ \text{Hz}} = \amber{${sci(lam)}\ \text{m}}`,
    meter: (v.lg - 3) / 17, meterLabel: band,
  };
};

export function MaxwellEmWavesContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phEm_intro",
          "By 1860 the laws of electricity and magnetism were known one by one: Coulomb's and Gauss's for charges, Ampère's for currents, Faraday's for induction. James Clerk Maxwell put them together and found they did not fit. Fixing them took one extra term, and the corrected equations made a prediction nobody had asked for: waves of electric and magnetic field that travel through empty space at a speed he could compute from two laboratory constants. The number came out as the speed of light. Light, radio, X-rays and the warmth of the Sun are all the same thing: electromagnetic waves.")}
      </Lead>

      <Goals t={t} id="phEm" items={[
        "State the four Maxwell equations and say in words what each one means.",
        "Explain why Ampère's law needs the displacement current, and derive it for a charging capacitor.",
        "Derive the wave equation for light from Faraday's law and the Ampère–Maxwell law, with c = 1/√(μ₀ε₀) and E = cB.",
        "Use λ = c/f across the spectrum, the intensity of a wave, radiation pressure, and Malus's law for polarisers.",
      ]} />

      <H2>{tx(t, "phEm_fourTitle", "The four laws so far")}</H2>
      <p>
        {tx(t, "phEm_fourBody",
          "The last four chapters met every law Maxwell started with. Each is a statement about a closed surface or a closed loop, which makes them easy to put side by side.")}
      </p>
      <LessonTable
        headers={[tx(t, "phEm_tLaw", "Law"), tx(t, "phEm_tSays", "What it says"), tx(t, "phEm_tFrom", "Met in")]}
        rows={[
          [tx(t, "phEm_l1", "Gauss's law"), tx(t, "phEm_l1s", "electric field lines start and end on charges: the flux out of a closed surface is the charge inside over ε₀"), tx(t, "phEm_l1f", "electric charge and field")],
          [tx(t, "phEm_l2", "Gauss's law for magnetism"), tx(t, "phEm_l2s", "magnetic field lines never start or end: the magnetic flux out of any closed surface is zero"), tx(t, "phEm_l2f", "magnetism")],
          [tx(t, "phEm_l3", "Faraday's law"), tx(t, "phEm_l3s", "a changing magnetic flux makes an electric field that circles round it"), tx(t, "phEm_l3f", "induction")],
          [tx(t, "phEm_l4", "Ampère's law"), tx(t, "phEm_l4s", "a current makes a magnetic field that circles round it"), tx(t, "phEm_l4f", "magnetism")],
        ]}
      />

      <H2>{tx(t, "phEm_dispTitle", "The missing term")}</H2>
      <p>
        {tx(t, "phEm_dispBody",
          "Ampère's law says the circulation of B round a loop is μ₀ times the current through the loop. But which surface do you count the current through? Any surface whose edge is the loop should do. Take a wire charging a capacitor and a loop round the wire. A flat disc across the wire is crossed by the current I. Now stretch the surface into a bag that passes between the capacitor's plates without touching the wire: no current crosses it at all. The same loop, the same field, two different answers. Something crosses the gap that Ampère did not count: a changing electric field.")}
      </p>
      <Derivation t={t} label={tx(t, "phEm_eqDisp", "The displacement current in a charging capacitor")}
        steps={[
          { tex: r`E = \frac{Q}{\varepsilon_0 A}`, why: tx(t, "phEm_d1", "the field between the plates, of area A, holding charge ±Q (from the potential and capacitors chapter)") },
          { tex: r`\Phi_E = E\,A = \frac{Q}{\varepsilon_0}`, why: tx(t, "phEm_d2", "the electric flux through the bag where it passes between the plates") },
          { tex: r`\varepsilon_0\,\frac{d\Phi_E}{dt} = \frac{dQ}{dt} = I`, why: tx(t, "phEm_d3", "as the capacitor charges, Q grows at the rate I; so ε₀ times the rate of change of the flux equals the current in the wire exactly") },
          { tex: r`\green{\oint \vec B \cdot d\vec l = \mu_0 \Big(I + \varepsilon_0 \frac{d\Phi_E}{dt}\Big)}`, why: tx(t, "phEm_d4", "add this displacement current to Ampère's law and both surfaces give the same answer: the wire's current through one, the changing field through the other") },
        ]} />
      <p>
        {tx(t, "phEm_dispMeaning",
          "The new term says something Ampère never saw, because in his experiments it was tiny: a changing electric field makes a magnetic field, even in empty space with no charge moving. It is the mirror image of Faraday's law, where a changing magnetic field makes an electric field.")}
      </p>
      <Equation label={tx(t, "phEm_eqMaxwell", "Maxwell's equations (integral form, in empty space or with charges and currents)")}
        where={[
          [r`\oint \vec E \cdot d\vec A`, tx(t, "phEm_wFluxE", "the electric flux out of a closed surface")],
          [r`\oint \vec B \cdot d\vec A`, tx(t, "phEm_wFluxB", "the magnetic flux out of a closed surface")],
          [r`\oint \vec E \cdot d\vec l`, tx(t, "phEm_wCircE", "the circulation of E round a closed loop: the emf round it")],
          [r`\oint \vec B \cdot d\vec l`, tx(t, "phEm_wCircB", "the circulation of B round a closed loop")],
          [r`Q_{in}`, tx(t, "phEm_wQ", "the charge inside the surface (C)")],
          [r`I`, tx(t, "phEm_wI", "the current through the loop (A)")],
          [r`\Phi_B,\ \Phi_E`, tx(t, "phEm_wPhis", "the magnetic and electric flux through the loop")],
          [r`\varepsilon_0,\ \mu_0`, tx(t, "phEm_wConsts", "the permittivity (8.854 × 10⁻¹² F/m) and permeability (4π × 10⁻⁷ T·m/A) of empty space")],
        ]}
        words={tx(t, "phEm_maxwellWords", "Charges make electric fields; there are no magnetic charges; a changing magnetic field makes an electric field; currents and changing electric fields make magnetic fields.")}
        note={tx(t, "phEm_maxwellNote", "With the Lorentz force F = q(E + v × B), which says what the fields do to charges, these four equations hold all of classical electricity, magnetism and optics. They are usually written in differential form, with divergence and curl (Math track, vector calculus): ∇·E = ρ/ε₀, ∇·B = 0, ∇×E = −∂B/∂t, ∇×B = μ₀J + μ₀ε₀ ∂E/∂t.")}>
        {r`\begin{aligned} \oint \vec E \cdot d\vec A &= \frac{Q_{in}}{\varepsilon_0} & \oint \vec B \cdot d\vec A &= 0 \\ \oint \vec E \cdot d\vec l &= -\frac{d\Phi_B}{dt} & \oint \vec B \cdot d\vec l &= \mu_0 I + \mu_0 \varepsilon_0 \frac{d\Phi_E}{dt} \end{aligned}`}
      </Equation>

      <H2>{tx(t, "phEm_waveTitle", "Light falls out of the equations")}</H2>
      <p>
        {tx(t, "phEm_waveBody",
          "In empty space there are no charges and no currents, and the last two equations are left talking only to each other: a changing B makes E, a changing E makes B. Can such a pair keep itself going? Try the simplest case: a wave travelling along x, with E pointing along y and B along z, each depending only on x and t. Applying the two loop laws to thin rectangles turns them into statements about slopes.")}
      </p>
      <Derivation t={t} label={tx(t, "phEm_eqWave", "The wave equation for E and B")}
        steps={[
          { tex: r`\frac{\partial E}{\partial x} = -\frac{\partial B}{\partial t}`, why: tx(t, "phEm_w1", "Faraday's law round a thin rectangle in the x–y plane, of length dx and height h: the circulation is h (E(x + dx) − E(x)), the flux through it is B h dx; divide by h dx") },
          { tex: r`-\frac{\partial B}{\partial x} = \mu_0 \varepsilon_0\,\frac{\partial E}{\partial t}`, why: tx(t, "phEm_w2", "the Ampère–Maxwell law round a thin rectangle in the x–z plane, with no current, only the displacement term; the same steps") },
          { tex: r`\frac{\partial^2 E}{\partial x^2} = -\frac{\partial}{\partial t}\frac{\partial B}{\partial x} = \mu_0 \varepsilon_0\,\frac{\partial^2 E}{\partial t^2}`, why: tx(t, "phEm_w3", "take the slope of the first equation once more in x, swap the order of the two derivatives, and use the second equation") },
          { tex: r`\frac{\partial^2 E}{\partial t^2} = v^2\,\frac{\partial^2 E}{\partial x^2}, \quad v^2 = \frac{1}{\mu_0 \varepsilon_0}`, why: tx(t, "phEm_w4", "this is exactly the wave equation of a string from the waves chapter (Math track, partial differential equations), with this speed in place of √(T/μ)") },
          { tex: r`\green{c = \frac{1}{\sqrt{\mu_0 \varepsilon_0}} = \frac{1}{\sqrt{4\pi \times 10^{-7} \times 8.854 \times 10^{-12}}} = 2.998 \times 10^{8}\ \text{m/s}}`, why: tx(t, "phEm_w5", "plug in the two constants measured with magnets and capacitors: out comes the measured speed of light") },
        ]} />
      <Derivation t={t} label={tx(t, "phEm_eqEcB", "How big B is compared with E")}
        steps={[
          { tex: r`E = E_0 \sin(kx - \omega t), \quad B = B_0 \sin(kx - \omega t)`, why: tx(t, "phEm_e1", "try a sine wave of wavenumber k = 2π/λ and angular frequency ω = 2πf for both fields") },
          { tex: r`k\,E_0 = \omega\,B_0`, why: tx(t, "phEm_e2", "put them into ∂E/∂x = −∂B/∂t: the slope of E gives k E₀ cos(…), the rate of change of B gives −ω B₀ cos(…)") },
          { tex: r`\green{E_0 = \frac{\omega}{k}\,B_0 = c\,B_0}`, why: tx(t, "phEm_e3", "ω/k = fλ is the wave's speed: E and B rise and fall together, in step, and E is always c times B") },
        ]} />
      <EmWaveFigure t={t} />
      <p>
        {tx(t, "phEm_propsBody",
          "The derivation says more than the speed. E and B are at right angles to each other and to the direction of travel: the wave is transverse. They are in step, peaking at the same places. And nothing material is waving: no medium is needed, which is why sunlight crosses 150 million kilometres of nearly empty space. In 1887 Heinrich Hertz made such waves with a spark circuit and caught them across his laboratory, measuring their speed: Maxwell was right.")}
      </p>
      <H3>{tx(t, "phEm_antennaTitle", "How waves are made")}</H3>
      <p>
        {tx(t, "phEm_antennaBody",
          "A charge at rest has only an electric field; a charge moving steadily adds a magnetic field that travels along with it. Only an accelerating charge sends waves away. An antenna is a rod in which an alternating current drives electrons up and down millions of times a second; the waves leave at the frequency of the current. Atoms do the same on a much smaller scale when their electrons jump between energy levels, which is why each element glows in its own colours, and so do the jostling charges of anything warm, which is why your body glows in infrared. A good antenna is about half a wavelength long, or a quarter if it stands on a metal ground plane.")}
      </p>
      <LiveFormula label={tx(t, "phEm_liveSpec", "Try it: wavelength and frequency across the spectrum")}
        tex={r`\lambda = \frac{c}{f}`}
        vars={[
          { id: "lg", label: tx(t, "phEm_liveF", "frequency f"), min: 3, max: 20, step: 0.1, value: 8, fmt: v => `10^${num(v, 1)} Hz` },
        ]}
        compute={spectrumNumbers(t)}
        note={tx(t, "phEm_liveSpecNote", "The slider moves the frequency by powers of ten. An FM station at 100 MHz (10⁸ Hz) has waves 3 m long; Wi-Fi at 2.4 GHz, 12.5 cm; green light at 6 × 10¹⁴ Hz, half a micrometre. The speed is the same for all of them.")} />

      <H2>{tx(t, "phEm_specTitle", "The electromagnetic spectrum")}</H2>
      <LessonTable
        headers={[tx(t, "phEm_tBand", "Band"), tx(t, "phEm_tLam", "Wavelength"), tx(t, "phEm_tSource", "Made by"), tx(t, "phEm_tUse", "Used for")]}
        rows={[
          [tx(t, "phEm_s1", "radio"), tx(t, "phEm_s1l", "above 1 m"), tx(t, "phEm_s1s", "currents in antennas"), tx(t, "phEm_s1u", "broadcasting, phones, radio astronomy")],
          [tx(t, "phEm_s2", "microwaves"), tx(t, "phEm_s2l", "1 mm – 1 m"), tx(t, "phEm_s2s", "electronic oscillators"), tx(t, "phEm_s2u", "Wi-Fi, radar, microwave ovens, satellite links")],
          [tx(t, "phEm_s3", "infrared"), tx(t, "phEm_s3l", "700 nm – 1 mm"), tx(t, "phEm_s3s", "warm objects, molecular vibrations"), tx(t, "phEm_s3u", "remote controls, thermal cameras, fibre-optic links")],
          [tx(t, "phEm_s4", "visible light"), tx(t, "phEm_s4l", "400 – 700 nm"), tx(t, "phEm_s4s", "the Sun, hot filaments, electrons in atoms"), tx(t, "phEm_s4u", "seeing")],
          [tx(t, "phEm_s5", "ultraviolet"), tx(t, "phEm_s5l", "10 – 400 nm"), tx(t, "phEm_s5s", "very hot objects, electric discharges"), tx(t, "phEm_s5u", "sterilising, sunburn and vitamin D, making computer chips")],
          [tx(t, "phEm_s6", "X-rays"), tx(t, "phEm_s6l", "10 pm – 10 nm"), tx(t, "phEm_s6s", "fast electrons hitting metal"), tx(t, "phEm_s6u", "medical images, crystal structures, airport scanners")],
          [tx(t, "phEm_s7", "gamma rays"), tx(t, "phEm_s7l", "below 10 pm"), tx(t, "phEm_s7s", "atomic nuclei, cosmic explosions"), tx(t, "phEm_s7u", "cancer treatment, sterilising food and tools")],
        ]}
      />
      <p>
        {tx(t, "phEm_eyeBody",
          "The band our eyes see is a sliver: less than a factor of two in wavelength out of more than twenty powers of ten. It is not an accident. The Sun's light peaks there, and the air and water are transparent there; eyes evolved to use the light that is available.")}
      </p>

      <H2>{tx(t, "phEm_energyTitle", "Energy and momentum in a wave")}</H2>
      <p>
        {tx(t, "phEm_energyBody",
          "A capacitor stores energy ½ε₀E² in each cubic metre of electric field, and a coil stores B²/(2μ₀) in each cubic metre of magnetic field. A wave carries both, and carries them along at c.")}
      </p>
      <Derivation t={t} label={tx(t, "phEm_eqIntensity", "The intensity of an electromagnetic wave")}
        steps={[
          { tex: r`u = \tfrac12 \varepsilon_0 E^2 + \frac{B^2}{2\mu_0}`, why: tx(t, "phEm_i1", "the energy per cubic metre in the electric field plus that in the magnetic field (J/m³)") },
          { tex: r`\frac{B^2}{2\mu_0} = \frac{E^2}{2\mu_0 c^2} = \tfrac12 \varepsilon_0 E^2`, why: tx(t, "phEm_i2", "use B = E/c and c² = 1/(μ₀ε₀): the magnetic half carries exactly as much energy as the electric half") },
          { tex: r`\bar u = \varepsilon_0 \overline{E^2} = \tfrac12 \varepsilon_0 E_0^2`, why: tx(t, "phEm_i3", "so u = ε₀E²; averaged over a cycle, sin² averages to ½") },
          { tex: r`\green{I = \bar u\,c = \tfrac12\, c\,\varepsilon_0 E_0^2}`, why: tx(t, "phEm_i4", "the intensity, in W/m², is the energy crossing each square metre per second: the energy density times the speed it moves at") },
        ]} />
      <p>
        {tx(t, "phEm_sunBody",
          "Sunlight reaching the Earth carries about 1 361 W/m². That gives E₀ = √(2I/(cε₀)) ≈ 1 000 V/m and B₀ = E₀/c ≈ 3.4 µT. Light from a small source spreads over a sphere, so its intensity falls as I = P/(4πr²), the inverse-square law. Waves also carry momentum: light that is absorbed pushes with a pressure I/c, and light that is reflected with 2I/c. For sunlight that is about 5 micropascals, a billionth of the air pressure, but in space nothing opposes it: solar sails, thin mirrors hundreds of square metres wide, have steered spacecraft with it, and it bends comets' dust tails away from the Sun.")}
      </p>

      <H2>{tx(t, "phEm_polTitle", "Polarisation")}</H2>
      <p>
        {tx(t, "phEm_polBody",
          "Because the wave is transverse, its electric field points in some direction across the beam: its polarisation. Light from the Sun or a bulb is a jumble of all directions, unpolarised. A polarising filter is a sheet of long molecules lined up in one direction: the electric field along the molecules drives electrons along them and is absorbed, while the field across them passes. What comes out is polarised along the filter's transmission axis.")}
      </p>
      <Equation label={tx(t, "phEm_eqMalus", "Malus's law")}
        where={[
          [r`I_0`, tx(t, "phEm_wI0", "the intensity of polarised light arriving at the filter")],
          [r`I`, tx(t, "phEm_wIout", "the intensity that gets through")],
          [r`\theta`, tx(t, "phEm_wThPol", "the angle between the light's polarisation and the filter's axis")],
        ]}
        words={tx(t, "phEm_malusWords", "The filter keeps the part of the electric field along its axis, E₀ cos θ; intensity goes as the field squared, hence cos².")}
        note={tx(t, "phEm_malusNote", "Unpolarised light averages cos² over every angle, so one filter passes half of it.")}>
        {r`I = I_0 \cos^2\theta`}
      </Equation>
      <PolarizerFigure t={t} />
      <p>
        {tx(t, "phEm_polUses",
          "Light reflected from water, roads or glass is partly polarised horizontally, so sunglasses with vertical polarising filters cut the glare and let the rest through. A liquid-crystal screen puts a layer of crystal between two crossed filters; a voltage on each pixel turns the crystal and with it the light's polarisation, deciding how much reaches the second filter. Look at a phone screen through polarised sunglasses and turn your head: it goes dark at one angle.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phEm_relativity", "Maxwell's equations give one speed for light, c, without saying relative to what. Physicists assumed it meant relative to an invisible medium, the ether, and tried to measure the Earth's motion through it. Every experiment found the same c in every direction. In 1905 Einstein took the equations at their word: light moves at c for every observer. That is where the relativity chapters begin.")}
      </Callout>

      <H2>{tx(t, "phEm_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phEm_ex1", "1. Light from the Moon, 384 400 km away, takes 3.844 × 10⁸ / 2.998 × 10⁸ = 1.28 s to reach us; from the Sun, 1.496 × 10¹¹ m away, 499 s, a little over 8 minutes.")}</p>
      <p>{tx(t, "phEm_ex2", "2. An FM station at 100 MHz: λ = c/f = 2.998 × 10⁸ / 10⁸ = 3.0 m, so a quarter-wave car antenna is about 75 cm long. A microwave oven at 2.45 GHz: λ = 12.2 cm.")}</p>
      <p>{tx(t, "phEm_ex3", "3. A laser pointer of 1 mW focused into a spot 1 mm across (area 7.9 × 10⁻⁷ m²) has I = 1 270 W/m², about the Sun's intensity, but all at one wavelength and in one direction: never look into one. Its field is E₀ = √(2I/(cε₀)) ≈ 980 V/m.")}</p>
      <p>{tx(t, "phEm_ex4", "4. A 100 W light bulb, of which about 5 W leaves as visible light, seen from 2 m: I = 5/(4π × 2²) = 0.10 W/m².")}</p>
      <p>{tx(t, "phEm_ex5", "5. Unpolarised light of 400 W/m² through two filters at 60° to each other: 200 W/m² after the first, then 200 × cos² 60° = 200 × 0.25 = 50 W/m².")}</p>

      <H2>{tx(t, "phEm_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phEm_tWrong", "Wrong"), tx(t, "phEm_tRight", "Right"), tx(t, "phEm_tWhy", "Why")]}
        rows={[
          [tx(t, "phEm_m1w", "light needs a medium to travel through"), tx(t, "phEm_m1r", "it travels through empty space"), tx(t, "phEm_m1", "the fields regenerate each other; nothing material waves")],
          [tx(t, "phEm_m2w", "the displacement current is a flow of charge"), tx(t, "phEm_m2r", "it is a changing electric field"), tx(t, "phEm_m2", "no charge crosses the gap of a capacitor")],
          [tx(t, "phEm_m3w", "radio waves are a kind of sound"), tx(t, "phEm_m3r", "they are electromagnetic, like light"), tx(t, "phEm_m3", "a radio turns them into sound; sound itself cannot cross a vacuum")],
          [tx(t, "phEm_m4w", "higher-frequency waves travel faster"), tx(t, "phEm_m4r", "all travel at c in a vacuum"), tx(t, "phEm_m4", "c depends only on μ₀ and ε₀; λ = c/f just gets shorter")],
          [tx(t, "phEm_m5w", "the magnetic field of light is negligible"), tx(t, "phEm_m5r", "it carries half the energy"), tx(t, "phEm_m5", "B is small in teslas, but B²/(2μ₀) equals ½ε₀E²")],
          [tx(t, "phEm_m6w", "a filter passes light in proportion to cos θ"), tx(t, "phEm_m6r", "to cos² θ"), tx(t, "phEm_m6", "the field goes as cos θ, the intensity as its square")],
        ]}
      />

      <KeyIdeas t={t} id="phEm" items={[
        "Maxwell's four equations: charges make E, there are no magnetic charges, a changing B makes E, currents and changing E make B.",
        "The displacement current ε₀ dΦ_E/dt fixes Ampère's law for a charging capacitor: a changing electric field makes a magnetic field.",
        "In empty space the two loop laws combine into a wave equation with speed c = 1/√(μ₀ε₀) = 2.998 × 10⁸ m/s: light.",
        "E and B are perpendicular to each other and to the travel, in step, with E = cB; accelerating charges make the waves.",
        "λ = c/f runs from radio to gamma rays; intensity is I = ½cε₀E₀², and light pushes with pressure I/c.",
        "A polariser keeps the field along its axis: unpolarised light loses half, polarised light passes I₀ cos² θ.",
      ]} />
    </Article>
  );
}

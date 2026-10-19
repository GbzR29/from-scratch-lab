"use client";

// Electromagnetism & Light 4: wave optics — Huygens' principle, superposition
// and coherence, Young's double slit (path difference, fringe positions and
// spacing derived, the cos² intensity), single-slit diffraction by pairing,
// the resolution limit 1.22 λ/D, diffraction gratings and spectroscopy, thin
// films with the half-wave flip (soap, anti-reflection coatings), Brewster's
// angle derived, and the wave-or-particle question that leads to quantum.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { DoubleSlitFigure } from "@/components/lesson/figures/physics/DoubleSlitFigure";
import { ThinFilmFigure } from "@/components/lesson/figures/physics/ThinFilmFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Fringe spacing on a screen: Δy = λL/d. */
const fringeNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const dy = (v.lam * 1e-9 * v.L) / (v.d * 1e-3);              // m
  return {
    tex: r`\Delta y = \frac{${num(v.lam, 0)} \times 10^{-9}\ \text{m} \times ${num(v.L, 1)}\ \text{m}}{${num(v.d, 2)} \times 10^{-3}\ \text{m}} = \amber{${num(dy * 1000, 2)}\ \text{mm}}`,
    meter: Math.min(1, (dy * 1000) / 20), meterLabel: `${tx(t, "phWo_liveFringes", "fringes per cm")}: ${num(10 / (dy * 1000), 1)}`,
  };
};

export function WaveOpticsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phWo_intro",
          "In 1801 Thomas Young let sunlight through two pinholes close together and saw, on the wall behind, not two spots but a row of bright and dark stripes. Adding light to light had made darkness. Only waves can do that: where the crest of one meets the trough of the other, they cancel. This chapter is about what light does when it meets openings and layers so small that its wavelength matters: the colours of soap bubbles and of a CD, the coatings on glasses, and the limit on how sharp any telescope or microscope can be.")}
      </Lead>

      <Goals t={t} id="phWo" items={[
        "Explain constructive and destructive interference in terms of path difference, and what coherent light is.",
        "Derive the positions and spacing of the fringes in Young's double-slit experiment.",
        "Find the dark bands of single-slit diffraction, the resolution limit of a lens and the angles of a grating.",
        "Explain the colours of thin films, including the half-wave flip, and design an anti-reflection coating.",
      ]} />

      <H2>{tx(t, "phWo_huygensTitle", "Waves that add and cancel")}</H2>
      <p>
        {tx(t, "phWo_huygensBody",
          "Christiaan Huygens proposed in 1678 a way to follow any wave: treat every point of a wavefront as a small source of circular wavelets, and the next wavefront is where the wavelets have all got to. Far from any obstacle this just moves the front forward. At an opening, the wavelets from the opening spread out behind it, and where wavelets from different places overlap they add up by superposition, as in the waves chapter: crest on crest makes a bigger crest, crest on trough makes nothing.")}
      </p>
      <Equation label={tx(t, "phWo_eqPath", "Conditions for interference")}
        where={[
          [r`\Delta`, tx(t, "phWo_wDelta", "the path difference: how much further one wave has travelled than the other to reach the same point")],
          [r`\lambda`, tx(t, "phWo_wLam", "the wavelength")],
          [r`m`, tx(t, "phWo_wM", "any whole number 0, ±1, ±2…, called the order")],
        ]}
        words={tx(t, "phWo_pathWords", "If one wave is behind by a whole number of wavelengths, the two arrive in step and reinforce; if it is behind by a half-wavelength more, they arrive opposite and cancel.")}
        note={tx(t, "phWo_pathNote", "This only gives a steady pattern for coherent light: waves of exactly the same frequency with a fixed phase difference. Two separate bulbs are not coherent, their atoms emit in short random bursts; a laser is, and so are two parts of one wavefront split by slits, as in Young's experiment.")}>
        {r`\text{bright: } \Delta = m\lambda, \qquad \text{dark: } \Delta = \big(m + \tfrac12\big)\lambda`}
      </Equation>

      <H2>{tx(t, "phWo_youngTitle", "Young's double slit")}</H2>
      <p>
        {tx(t, "phWo_youngBody",
          "Light of one wavelength falls on two narrow slits a distance d apart, and a screen stands a distance L behind them, much further than d. To reach a point on the screen at angle θ from the centre, the light from one slit travels further than the light from the other.")}
      </p>
      <Derivation t={t} label={tx(t, "phWo_eqYoung", "Where the fringes are")}
        steps={[
          { tex: r`\Delta = d\,\sin\theta`, why: tx(t, "phWo_y1", "with the screen far away, the two paths are nearly parallel; drop a perpendicular from one slit onto the other's path, and the leftover piece is d sin θ") },
          { tex: r`\green{d \sin\theta = m\lambda}`, why: tx(t, "phWo_y2", "bright fringes where that is a whole number of wavelengths; dark ones half-way between, at d sin θ = (m + ½)λ") },
          { tex: r`y = L \tan\theta \approx L\,\theta \approx L \sin\theta`, why: tx(t, "phWo_y3", "the fringe's distance from the centre of the screen; for small angles, in radians, tan θ ≈ sin θ ≈ θ (Math track, series)") },
          { tex: r`\green{y_m = \frac{m \lambda L}{d}, \qquad \Delta y = \frac{\lambda L}{d}}`, why: tx(t, "phWo_y4", "so the fringes are equally spaced, further apart for longer wavelengths, a more distant screen, or slits closer together") },
        ]} />
      <p>
        {tx(t, "phWo_intensityBody",
          "Between those positions the brightness changes smoothly. Adding two waves of equal amplitude E₀ whose phases differ by φ = 2πd sin θ/λ gives an amplitude 2E₀ cos(φ/2), so the intensity is I = 4I₁ cos²(πd sin θ/λ), where I₁ is the intensity from one slit alone. The bright fringes are four times as bright as one slit, not twice, and the dark ones are completely dark: energy is not lost, it is moved from the dark fringes into the bright ones.")}
      </p>
      <DoubleSlitFigure t={t} />
      <LiveFormula label={tx(t, "phWo_liveFringe", "Try it: fringe spacing on a wall")}
        tex={r`\Delta y = \frac{\lambda L}{d}`}
        vars={[
          { id: "lam", label: "λ (nm)", min: 400, max: 700, step: 5, value: 650, fmt: v => `${num(v, 0)} nm` },
          { id: "L", label: "L (m)", min: 0.5, max: 5, step: 0.1, value: 2, fmt: v => `${num(v, 1)} m` },
          { id: "d", label: "d (mm)", min: 0.05, max: 1, step: 0.01, value: 0.25, fmt: v => `${num(v, 2)} mm` },
        ]}
        compute={fringeNumbers(t)}
        note={tx(t, "phWo_liveFringeNote", "A red laser pointer through two slits 0.25 mm apart makes fringes 5.2 mm apart on a wall 2 m away: big enough to measure with a ruler. Young ran this sum backwards: measuring the spacing gave him the wavelength of light, the first time anyone had measured it.")} />

      <H2>{tx(t, "phWo_singleTitle", "Diffraction by one slit")}</H2>
      <p>
        {tx(t, "phWo_singleBody",
          "Even a single slit does not make a sharp shadow: light spreads out behind it, and the spreading has a pattern of its own, a bright central band with fainter bands beside it. Each point across the slit's width a is a source of wavelets, and they interfere with each other.")}
      </p>
      <Derivation t={t} label={tx(t, "phWo_eqSingle", "The dark bands of a single slit")}
        steps={[
          { tex: r`\Delta_{top,\,bottom} = a\,\sin\theta`, why: tx(t, "phWo_s1", "at angle θ, a wavelet from the bottom edge of the slit travels a sin θ further than one from the top edge") },
          { tex: r`\frac{a}{2}\,\sin\theta = \frac{\lambda}{2}`, why: tx(t, "phWo_s2", "split the slit into a top half and a bottom half. Pair each point in the top half with the point a/2 below it. If their path difference is half a wavelength, every pair cancels, and so does the whole slit") },
          { tex: r`\green{a \sin\theta = m\lambda, \quad m = \pm1, \pm2, \dots}`, why: tx(t, "phWo_s3", "the first dark band; splitting into 4, 6… strips gives the others. m = 0 is not dark: there all the wavelets arrive in step") },
          { tex: r`\theta_1 \approx \frac{\lambda}{a}`, why: tx(t, "phWo_s4", "for small angles: the narrower the slit, the more the light spreads. The central band is twice as wide as the others, 2λL/a on a screen") },
        ]} />
      <p>
        {tx(t, "phWo_bendBody",
          "This is why you can hear round a corner but not see round it. Sound waves are about a metre long, comparable to a doorway, so they spread widely through it. Light waves are half a micrometre, a million times smaller than the doorway, so the spreading is tiny. In a double-slit experiment both effects are present: the fine fringes from the two slits sit inside the broad envelope of each slit's diffraction.")}
      </p>
      <H3>{tx(t, "phWo_resTitle", "The limit of sharpness")}</H3>
      <p>
        {tx(t, "phWo_resBody",
          "Every lens, mirror and pupil is an opening, so it spreads the light of a single point into a small blurred disc, the Airy disc. For a circular opening of diameter D, the first dark ring is at sin θ = 1.22 λ/D. Two points closer together than that angle blur into one: this is Rayleigh's criterion, the diffraction limit. No polishing can beat it; only a wider opening or a shorter wavelength can.")}
      </p>
      <LessonTable
        headers={[tx(t, "phWo_tInst", "Opening"), tx(t, "phWo_tD", "Diameter D"), tx(t, "phWo_tRes", "Smallest angle, 1.22 λ/D at 550 nm"), tx(t, "phWo_tMeans", "What it means")]}
        rows={[
          [tx(t, "phWo_r1", "human pupil"), tx(t, "phWo_r1d", "3 mm"), tx(t, "phWo_r1r", "2.2 × 10⁻⁴ rad"), tx(t, "phWo_r1m", "two dots 22 cm apart can just be told apart from 1 km")],
          [tx(t, "phWo_r2", "amateur telescope"), tx(t, "phWo_r2d", "20 cm"), tx(t, "phWo_r2r", "3.4 × 10⁻⁶ rad"), tx(t, "phWo_r2m", "details of 1.3 km on the Moon")],
          [tx(t, "phWo_r3", "Hubble Space Telescope"), tx(t, "phWo_r3d", "2.4 m"), tx(t, "phWo_r3r", "2.8 × 10⁻⁷ rad"), tx(t, "phWo_r3m", "a coin seen from 80 km")],
          [tx(t, "phWo_r4", "light microscope"), tx(t, "phWo_r4d", "—"), tx(t, "phWo_r4r", "—"), tx(t, "phWo_r4m", "about 200 nm at best: viruses are too small; electron microscopes use much shorter wavelengths")],
        ]}
      />

      <H2>{tx(t, "phWo_gratingTitle", "Diffraction gratings")}</H2>
      <p>
        {tx(t, "phWo_gratingBody",
          "A grating is a surface with thousands of equally spaced slits or grooves, a distance d apart. The bright directions are the same as for two slits, d sin θ = mλ, because neighbouring slits must still be a whole number of wavelengths out of step. But with N slits, being even slightly off that angle makes the waves from far-apart slits cancel, so the bright lines become very narrow, about N times sharper. Each wavelength goes off at its own angle, which makes a grating the best tool for splitting light into a spectrum: astronomers use it to read the chemical make-up and speed of stars from their spectral lines. The rainbow on a CD is the same thing: its tracks are 1.6 µm apart.")}
      </p>
      <Equation label={tx(t, "phWo_eqGrating", "The grating equation")}
        where={[
          [r`d`, tx(t, "phWo_wD", "the spacing between neighbouring lines; a grating with 600 lines per mm has d = 1/600 mm = 1.67 µm")],
          [r`\theta_m`, tx(t, "phWo_wThm", "the angle of the m-th order bright line")],
          [r`m`, tx(t, "phWo_wOrder", "the order: 0 straight through (all colours together, white), then ±1, ±2… on each side")],
        ]}
        words={tx(t, "phWo_gratingWords", "Bright lines appear only where neighbouring slits are exactly a whole number of wavelengths out of step, so each colour leaves at its own angle.")}
        note={tx(t, "phWo_gratingNote", "Since sin θ cannot exceed 1, only orders up to m = d/λ exist.")}>
        {r`d\,\sin\theta_m = m\lambda`}
      </Equation>

      <H2>{tx(t, "phWo_filmTitle", "Thin films")}</H2>
      <p>
        {tx(t, "phWo_filmBody",
          "A soap bubble or an oil slick is a layer a few hundred nanometres thick. Light reflects from its front surface and from its back surface, and the two reflections interfere. There is one more rule to know: when light reflects off a material with a higher refractive index than the one it is travelling in, the reflected wave is turned upside down, a shift of half a wavelength. Reflecting off a lower index, it is not. A rope tied to a wall behaves the same way: a pulse sent along it comes back inverted from the fixed end, and upright from a free end.")}
      </p>
      <Derivation t={t} label={tx(t, "phWo_eqFilm", "The colours of a soap film in air")}
        steps={[
          { tex: r`\Delta = 2\,n\,t`, why: tx(t, "phWo_f1", "looking straight on, the back reflection crosses the film of thickness t twice; inside the film the wavelength is λ/n, so the extra path counts as 2nt in vacuum wavelengths") },
          { tex: r`\Delta_{total} = 2nt + \tfrac{\lambda}{2}`, why: tx(t, "phWo_f2", "the front reflection (air → soap, into a higher index) flips; the back one (soap → air) does not; so one of the two is half a wave behind") },
          { tex: r`\green{2nt = \big(m + \tfrac12\big)\lambda \ \text{bright}, \qquad 2nt = m\lambda \ \text{dark}}`, why: tx(t, "phWo_f3", "put that into the interference conditions; each thickness reinforces some wavelengths and removes others, so the film looks coloured") },
          { tex: r`t \to 0: \quad \text{dark for every } \lambda`, why: tx(t, "phWo_f4", "a film much thinner than a wavelength has no path difference left, only the flip: the two reflections cancel for every colour, and the film looks black") },
        ]} />
      <ThinFilmFigure t={t} />
      <p>
        {tx(t, "phWo_coatBody",
          "Glasses and camera lenses use the same effect the other way round. A coating of magnesium fluoride (n = 1.38) on glass (n = 1.52) gives two reflections that both flip, air to coating and coating to glass, so the flips cancel out, and the reflections cancel when 2nt = λ/2. For the middle of the spectrum, 550 nm, that means t = λ/(4n) = 550/(4 × 1.38) ≈ 100 nm, a quarter of a wavelength inside the coating. The reflection of green light almost vanishes, and the energy that would have been reflected goes through the lens instead. Red and blue are cancelled less well, which is why coated lenses show a faint purple glint.")}
      </p>
      <H3>{tx(t, "phWo_brewsterTitle", "Polarisation by reflection")}</H3>
      <Derivation t={t} label={tx(t, "phWo_eqBrewster", "Brewster's angle")}
        steps={[
          { tex: r`\theta_B + \theta_2 = 90^\circ`, why: tx(t, "phWo_b1", "the reflected light is made by electrons in the surface shaken by the refracted wave. An oscillating charge does not radiate along its own line of motion, so when the reflected and refracted rays are at right angles, the light polarised in the plane of incidence cannot be reflected at all") },
          { tex: r`n_1 \sin\theta_B = n_2 \sin(90^\circ - \theta_B) = n_2 \cos\theta_B`, why: tx(t, "phWo_b2", "put that into Snell's law") },
          { tex: r`\green{\tan\theta_B = \frac{n_2}{n_1}}`, why: tx(t, "phWo_b3", "divide by cos θ_B: for glass in air θ_B = 56°, for water 53°; light reflected at that angle is completely polarised parallel to the surface") },
        ]} />
      <p>
        {tx(t, "phWo_brewsterUse",
          "That is why the glare from a lake or a wet road is mostly horizontally polarised, and why the polarising sunglasses of the previous chapter, with vertical axes, remove it so well. Photographers use polarising filters to see through reflections on water and to darken a blue sky, whose scattered light is also partly polarised.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phWo_quantum", "Fringes prove that light is a wave. Yet turn the light down until only one bit of energy arrives at a time, and each one lands at a single point on the screen, like a particle. Wait long enough and the points pile up into the same bright and dark fringes. Each one somehow went through both slits. That puzzle, photons that arrive like particles and spread like waves, opens the quantum chapters.")}
      </Callout>

      <H2>{tx(t, "phWo_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phWo_ex1", "1. Red light of 650 nm through slits 0.25 mm apart onto a screen 2.0 m away: Δy = λL/d = 650 × 10⁻⁹ × 2.0 / 2.5 × 10⁻⁴ = 5.2 mm between fringes.")}</p>
      <p>{tx(t, "phWo_ex2", "2. A laser of 633 nm through a single slit 0.10 mm wide, screen at 2.0 m: the first dark bands are at y = λL/a = 12.7 mm on each side, so the central bright band is 25 mm wide. Halve the slit and the band doubles to 51 mm.")}</p>
      <p>{tx(t, "phWo_ex3", "3. Green light of 532 nm on a grating with 600 lines per mm (d = 1.667 µm): sin θ₁ = 0.319, θ₁ = 18.6°; sin θ₂ = 0.638, θ₂ = 39.7°; sin θ₃ = 0.958, θ₃ = 73°; a fourth order would need sin θ = 1.28, impossible.")}</p>
      <p>{tx(t, "phWo_ex4", "4. A soap film (n = 1.33) 300 nm thick: 2nt = 798 nm. Bright for 798/(m + ½): 532 nm with m = 1 (green; m = 0 gives 1 596 nm, infrared). Dark for 798/m: 399 nm with m = 2, at the violet edge. The reflected light is a broad hump centred on green, and the film looks yellow-green.")}</p>
      <p>{tx(t, "phWo_ex5", "5. The resolution of a 3 mm pupil at 550 nm: θ = 1.22 × 550 × 10⁻⁹ / 3 × 10⁻³ = 2.2 × 10⁻⁴ rad. A car's headlights 1.5 m apart blur into one beyond 1.5 / 2.2 × 10⁻⁴ ≈ 7 km.")}</p>

      <H2>{tx(t, "phWo_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phWo_tWrong", "Wrong"), tx(t, "phWo_tRight", "Right"), tx(t, "phWo_tWhy", "Why")]}
        rows={[
          [tx(t, "phWo_m1w", "dark fringes mean energy was destroyed"), tx(t, "phWo_m1r", "it was moved to the bright fringes"), tx(t, "phWo_m1", "bright fringes are 4 times one slit's intensity; the average is still twice")],
          [tx(t, "phWo_m2w", "any two lamps make fringes"), tx(t, "phWo_m2r", "only coherent sources do"), tx(t, "phWo_m2", "independent lamps change phase at random billions of times a second, washing the pattern out")],
          [tx(t, "phWo_m3w", "a narrower slit gives a narrower beam"), tx(t, "phWo_m3r", "a wider spread"), tx(t, "phWo_m3", "θ₁ ≈ λ/a grows as a shrinks")],
          [tx(t, "phWo_m4w", "a sin θ = mλ gives bright bands"), tx(t, "phWo_m4r", "for one slit it gives the dark ones"), tx(t, "phWo_m4", "the same form as the two-slit rule, the opposite meaning; check which situation you are in")],
          [tx(t, "phWo_m5w", "the path difference in a film is 2t"), tx(t, "phWo_m5r", "it is 2nt, plus any flips"), tx(t, "phWo_m5", "the wavelength inside is λ/n, and reflections into higher n add half a wave")],
          [tx(t, "phWo_m6w", "a better-polished lens can resolve anything"), tx(t, "phWo_m6r", "diffraction sets a limit"), tx(t, "phWo_m6", "θ = 1.22 λ/D depends only on the size and the wavelength")],
        ]}
      />

      <KeyIdeas t={t} id="phWo" items={[
        "Coherent waves reinforce where the path difference is mλ and cancel where it is (m + ½)λ.",
        "Two slits a distance d apart give bright fringes at d sin θ = mλ, spaced Δy = λL/d on a distant screen.",
        "One slit of width a has dark bands at a sin θ = mλ (m ≠ 0): narrower openings spread light more.",
        "Every opening blurs a point into a disc of angle 1.22 λ/D; that is the diffraction limit of telescopes and eyes.",
        "A grating obeys d sin θ = mλ with very sharp lines, and splits light into its spectrum.",
        "Thin films colour light through 2nt plus a half-wave flip at each reflection into a higher index; λ/(4n) coatings cancel reflections.",
      ]} />
    </Article>
  );
}

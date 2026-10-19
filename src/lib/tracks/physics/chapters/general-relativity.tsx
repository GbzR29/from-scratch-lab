"use client";

// Relativity 4: general relativity — the trouble with Newtonian gravity in
// relativity, inertial and gravitational mass, the equivalence principle
// (Einstein's box), light bending (Eddington 1919, lensing), gravitational
// time dilation derived in an accelerating rocket (Δf/f = gh/c²) with
// Pound–Rebka, optical clocks and GPS, curved spacetime and geodesics,
// Einstein's field equations at a conceptual level, the classic tests
// (Mercury, deflection, Shapiro delay, redshift, frame dragging), black holes
// and the Schwarzschild radius, and gravitational waves (LIGO 2015).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { EquivalenceFigure } from "@/components/lesson/figures/physics/EquivalenceFigure";
import { ClockRateFigure } from "@/components/lesson/figures/physics/ClockRateFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

/** A number as "a × 10^{b}" TeX when it is very large or small. */
const texNum = (v: number, d = 3) => {
  const e = Math.floor(Math.log10(Math.abs(v)));
  return e >= -2 && e < 5 ? num(v, d) : `${num(v / 10 ** e, 2)} \\times 10^{${e}}`;
};

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** The Schwarzschild radius r_s = 2GM/c² for M = 10^k solar masses. */
const horizonNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const M = 10 ** v.k, rs = 2.953 * M;              // km
  return {
    tex: r`r_s = \frac{2GM}{c^2} = 2.95\ \text{km} \times ${texNum(M)} = \green{${rs < 1 ? `${texNum(rs * 1e5)}\ \text{cm}` : `${texNum(rs)}\ \text{km}`}}`,
    meterLabel: `M = ${texNum(M).replace(" \\times 10^{", "e").replace("}", "")} ${tx(t, "phGr_liveSuns", "solar masses")}`,
    meter: (v.k + 6) / 16,
  };
};

export function GeneralRelativityContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phGr_intro",
          "Special relativity left one thing out: gravity. Newton's law has the Sun pulling the Earth instantly across 150 million kilometres, which relativity forbids, since no influence may travel faster than light. Einstein spent ten years, from 1905 to 1915, finding the fix, and it changed the question completely. Gravity, in general relativity, is not a force at all. Mass and energy curve spacetime, and bodies with no forces on them follow the straightest possible paths through that curved spacetime, which look to us like falling, orbiting and bending. The theory predicted that light bends round the Sun, that clocks run slower low down, that there are black holes and gravitational waves. All of these have been seen, and your phone's map uses one of them.")}
      </Lead>

      <Goals t={t} id="phGr" items={[
        "State the equivalence principle and use it to show that light bends and clocks run slow in gravity.",
        "Compute gravitational time dilation, gh/c², and explain why GPS satellites must correct for relativity.",
        "Describe gravity as curved spacetime and say what Einstein's field equations relate.",
        "Compute a Schwarzschild radius and describe black holes and gravitational waves and how they were observed.",
      ]} />

      <H2>{tx(t, "phGr_eqTitle", "The equivalence principle")}</H2>
      <p>
        {tx(t, "phGr_massBody",
          "Mass appears twice in Newton's physics. In F = ma it measures inertia, how hard a body is to accelerate. In F = GMm/r² it measures how strongly gravity pulls. There is no reason in Newton's theory why the two should be equal, yet they are: that is why a hammer and a feather fall together on the Moon (as David Scott showed during Apollo 15). The equality has been tested to one part in 10¹⁵ by the MICROSCOPE satellite. Einstein took it as a clue, not a coincidence.")}
      </p>
      <p>
        {tx(t, "phGr_boxBody",
          "His \"happiest thought\", in 1907: a person falling freely from a roof feels no weight. Picture a closed box. If it sits on the Earth, things inside fall at g. If it is a rocket accelerating at g in empty space, things inside also \"fall\" at g, because the floor rushes up at them. If the box falls freely, everything inside floats, just as in empty space. The equivalence principle states that no experiment inside a small box can tell these pairs apart: the effects of gravity and of acceleration are the same.")}
      </p>
      <EquivalenceFigure t={t} />

      <H2>{tx(t, "phGr_bendTitle", "Light bends")}</H2>
      <p>
        {tx(t, "phGr_bendBody",
          "In the accelerating rocket, a light beam fired across the cabin is straight for an outside observer, but the floor accelerates up while it crosses, so inside it curves towards the floor. By the equivalence principle, light must curve the same way in gravity. Near the Sun, general relativity predicts that starlight grazing its edge is deflected by 1.75 arcseconds, twice what a Newtonian argument gives. In 1919 Arthur Eddington's expeditions (one of them at Sobral, in Brazil) photographed stars near the Sun during a total eclipse and found the larger value, making Einstein world-famous overnight. Today we see the effect everywhere in the sky: galaxies and clusters act as gravitational lenses, bending the light of objects behind them into arcs, multiple images and, when perfectly aligned, complete Einstein rings.")}
      </p>

      <H2>{tx(t, "phGr_timeTitle", "Gravity slows time")}</H2>
      <p>
        {tx(t, "phGr_timeBody",
          "Put a light source on the floor of a rocket accelerating at g and a receiver on the ceiling, a height h above.")}
      </p>
      <Derivation t={t} label={tx(t, "phGr_eqRedshift", "Light climbing a rocket, and then a gravitational field")}
        steps={[
          { tex: r`\Delta t = \frac{h}{c}`, why: tx(t, "phGr_r1", "the light takes about this long to reach the ceiling") },
          { tex: r`\Delta v = g\,\Delta t = \frac{g h}{c}`, why: tx(t, "phGr_r2", "meanwhile the ceiling has gained this much speed: by the time the light arrives, the receiver is moving away from where the light was sent") },
          { tex: r`\frac{\Delta f}{f} = -\frac{\Delta v}{c} = -\frac{g h}{c^2}`, why: tx(t, "phGr_r3", "a receiver moving away sees the frequency lowered (the Doppler effect of the sound chapter, for speeds far below c)") },
          { tex: r`\green{\frac{\Delta f}{f} = -\frac{g h}{c^2} = -\frac{\Delta \Phi}{c^2}}`, why: tx(t, "phGr_r4", "by the equivalence principle the same happens to light climbing a height h in gravity, where gh is the rise in gravitational potential Φ (energy per kilogram)") },
        ]} />
      <p>
        {tx(t, "phGr_timeMeaning",
          "The light's waves are crests sent at a steady rate. If the ceiling receives them at a lower rate than the floor sends them, then the floor's clock, judged from the ceiling, ticks slower. Nothing is lost on the way; time itself runs more slowly lower down. A clock at height h runs fast compared with one on the ground by gh/c², which for one metre is 1.1 × 10⁻¹⁶.")}
      </p>
      <Equation label={tx(t, "phGr_eqClock", "Gravitational time dilation (weak gravity)")}
        where={[
          [r`\Delta t_h,\ \Delta t_0`, tx(t, "phGr_wTh", "the time measured by a clock at height h and by one at the bottom, between the same two signals")],
          [r`g h = \Delta\Phi`, tx(t, "phGr_wPhi", "the difference in gravitational potential between them (J/kg); far from Earth use GM(1/R − 1/r)")],
          [r`c^2`, tx(t, "phGr_wC2", "the speed of light squared, 9 × 10¹⁶ m²/s²: why the effect is so small on Earth")],
        ]}
        words={tx(t, "phGr_clockWords", "The higher clock runs faster by a fraction equal to the potential difference divided by c².")}
        note={tx(t, "phGr_clockNote", "Robert Pound and Glen Rebka measured it in 1959 by sending gamma rays up a 22.5 m tower at Harvard: a shift of 2.5 × 10⁻¹⁵, as predicted. In 2010 optical atomic clocks detected the difference between two clocks only 33 cm apart in height. Your head ages faster than your feet, by about half a microsecond over a lifetime.")}>
        {r`\Delta t_h = \Delta t_0\left(1 + \frac{g h}{c^2}\right)`}
      </Equation>
      <ClockRateFigure t={t} />

      <H2>{tx(t, "phGr_curveTitle", "Curved spacetime")}</H2>
      <p>
        {tx(t, "phGr_curveBody",
          "Here is the leap. A freely falling body feels no force: an astronaut in orbit floats. So Einstein proposed that falling is the natural, force-free motion, and that it follows a geodesic, the straightest possible path, through spacetime. Why then do orbits curve? Because spacetime itself is curved by the mass and energy in it. Two travellers who set off due north from different points on the equator, each walking dead straight, find themselves drawing together and meeting at the pole. No force pulled them; the surface is curved. In the same way, two apples falling side by side towards the Earth drift together; general relativity says that is the curvature of spacetime, not a pull. John Wheeler's summary: spacetime tells matter how to move; matter tells spacetime how to curve.")}
      </p>
      <Equation label={tx(t, "phGr_eqField", "Einstein's field equations (1915)")}
        where={[
          [r`G_{\mu\nu}`, tx(t, "phGr_wG", "the Einstein tensor: a table of numbers describing how spacetime is curved at a point")],
          [r`T_{\mu\nu}`, tx(t, "phGr_wT", "the stress–energy tensor: the density and flow of energy and momentum there (mass, pressure, light, fields)")],
          [r`\frac{8\pi G}{c^4}`, tx(t, "phGr_wK", "the coupling constant, 2.1 × 10⁻⁴³ s²/(kg·m): spacetime is extraordinarily stiff, so it takes a planet to bend it noticeably")],
          [r`\mu,\nu`, tx(t, "phGr_wMu", "labels running over the four directions t, x, y, z: these are really 10 coupled equations")],
        ]}
        words={tx(t, "phGr_fieldWords", "The curvature of spacetime at each point equals a constant times the energy and momentum at that point.")}
        note={tx(t, "phGr_fieldNote", "Solving them is hard, and this track does not need to. For weak gravity and slow motion they reduce to Newton's law of gravitation, which is why Newton works so well for the Solar System. The differences show up where gravity is strong or precision is high.")}>
        {r`G_{\mu\nu} = \frac{8\pi G}{c^4}\, T_{\mu\nu}`}
      </Equation>
      <H3>{tx(t, "phGr_testsTitle", "The tests")}</H3>
      <LessonTable
        headers={[tx(t, "phGr_tEffect", "Effect"), tx(t, "phGr_tPred", "Prediction"), tx(t, "phGr_tObs", "Observed")]}
        rows={[
          [tx(t, "phGr_e1a", "Mercury's orbit turns slowly (perihelion precession)"), tx(t, "phGr_e1b", "43 arcseconds per century beyond Newton"), tx(t, "phGr_e1c", "known since 1859, explained in 1915")],
          [tx(t, "phGr_e2a", "light bent by the Sun"), tx(t, "phGr_e2b", "1.75 arcseconds at the edge"), tx(t, "phGr_e2c", "1919 eclipse; now radio telescopes to 0.01%")],
          [tx(t, "phGr_e3a", "clocks run slow low down"), "gh/c²", tx(t, "phGr_e3c", "Pound–Rebka 1959, atomic clocks, GPS")],
          [tx(t, "phGr_e4a", "radar echoes delayed passing the Sun (Shapiro delay)"), tx(t, "phGr_e4b", "up to about 200 μs"), tx(t, "phGr_e4c", "Cassini spacecraft, 2003, to 0.001%")],
          [tx(t, "phGr_e5a", "a spinning Earth drags spacetime round (frame dragging)"), tx(t, "phGr_e5b", "39 milliarcseconds per year for a gyroscope in orbit"), tx(t, "phGr_e5c", "Gravity Probe B, 2011")],
          [tx(t, "phGr_e6a", "gravitational waves"), tx(t, "phGr_e6b", "ripples of curvature moving at c"), tx(t, "phGr_e6c", "LIGO, 2015")],
        ]}
      />

      <H2>{tx(t, "phGr_bhTitle", "Black holes")}</H2>
      <p>
        {tx(t, "phGr_bhBody",
          "Within months of Einstein's paper, Karl Schwarzschild, serving on the Russian front, found the exact solution for the spacetime outside a round mass. It contains a special radius. Squeeze a mass inside it, and nothing, not even light, can climb back out: the surface at that radius is an event horizon, and the object is a black hole. A quick way to find the radius is to ask where Newton's escape speed reaches c. That reasoning is not legitimate, since it uses Newtonian gravity where it fails, but by a happy accident it gives the exact result.")}
      </p>
      <Derivation t={t} label={tx(t, "phGr_eqRs", "The Schwarzschild radius")}
        steps={[
          { tex: r`\tfrac12 m v_{esc}^2 = \frac{G M m}{r} \;\Rightarrow\; v_{esc} = \sqrt{\frac{2 G M}{r}}`, why: tx(t, "phGr_s1", "the escape speed from the gravity and orbits chapter: enough kinetic energy to climb out of the potential well") },
          { tex: r`\green{r_s = \frac{2 G M}{c^2}}`, why: tx(t, "phGr_s2", "set v_esc = c and solve for r") },
          { tex: r`r_s(\text{Sun}) = \frac{2 \times 6.67\times10^{-11} \times 1.99\times10^{30}}{(3.00\times10^8)^2} = 2.95\ \text{km}`, why: tx(t, "phGr_s3", "the Sun would have to be squeezed from 696 000 km to under 3 km; the Earth to under 9 mm") },
        ]} />
      <LiveFormula label={tx(t, "phGr_liveRs", "Try it: how small would it have to be?")}
        tex={r`r_s = \frac{2GM}{c^2}`}
        vars={[
          { id: "k", label: tx(t, "phGr_liveK", "mass = 10^k Suns, k"), min: -6, max: 10, step: 0.1, value: 0, fmt: v => num(v, 1) },
        ]}
        compute={horizonNumbers(t)}
        note={tx(t, "phGr_liveNote", "k = −5.5 is about the Earth (9 mm); k = 0 the Sun (3 km); k = 1 a typical stellar black hole (30 km); k = 6.6 Sagittarius A*, the black hole at the centre of our galaxy (4.3 million Suns, 13 million km, smaller than Mercury's orbit); k = 9.8 the giant in the galaxy M87 (6.5 billion Suns, larger than the Solar System).")} />
      <p>
        {tx(t, "phGr_bhReal",
          "Black holes are real and common. Stars more than about 20 times the Sun's mass end as black holes a few tens of kilometres across; we see them pulling gas from companion stars, which heats up and glows in X-rays. At the centre of almost every large galaxy sits a supermassive one. Watching stars whip round the centre of the Milky Way for 30 years pinned down Sagittarius A*'s mass (Nobel Prize 2020), and the Event Horizon Telescope, a network of radio dishes as wide as the Earth, imaged the shadow of M87's black hole in 2019 and of Sagittarius A* in 2022. Near a horizon, time dilation grows without limit: seen from far away, an object falling in seems to freeze and fade at the horizon, while for the object itself nothing special happens as it crosses.")}
      </p>

      <H2>{tx(t, "phGr_gwTitle", "Gravitational waves")}</H2>
      <p>
        {tx(t, "phGr_gwBody",
          "If masses curve spacetime, masses that move should send out ripples of curvature that travel at the speed of light, just as moving charges send out electromagnetic waves. A passing gravitational wave stretches space in one direction and squeezes it in the perpendicular one, back and forth. On 14 September 2015 the two LIGO detectors in the United States, each an L-shaped interferometer with arms 4 km long (Michelson and Morley's instrument, grown enormous), felt a signal lasting a fifth of a second. Its shape matched two black holes of 36 and 29 solar masses spiralling together 1.3 billion light-years away and merging into one of 62. The missing 3 solar masses had been radiated as gravitational waves, more power for that instant than all the stars in the observable universe. On Earth the arms changed length by about 10⁻¹⁸ m, a thousandth of the width of a proton. Hundreds of such events have been detected since, including colliding neutron stars also seen in light (2017).")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phGr_open", "General relativity and quantum mechanics, the subject of the next section, are both superbly tested, but they do not fit together. Inside black holes and at the Big Bang both are needed at once, and no one yet has a tested theory that does it. Finding one, a theory of quantum gravity, is the largest open problem in fundamental physics.")}
      </Callout>

      <H2>{tx(t, "phGr_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phGr_ex1", "1. A clock at the top of the 828 m Burj Khalifa runs fast compared with one at its base by gh/c² = 9.8 × 828 / (9.0 × 10¹⁶) = 9.0 × 10⁻¹⁴. Over a year (3.16 × 10⁷ s) it gains 2.9 μs.")}</p>
      <p>{tx(t, "phGr_ex2", "2. GPS satellites orbit at 26 600 km from Earth's centre at 3.87 km/s. Gravity makes them gain (GM/c²)(1/R − 1/r) × 86 400 s = 45.7 μs a day; speed makes them lose v²/2c² × 86 400 s = 7.2 μs; net +38.5 μs a day, or 11.5 km of position error a day if ignored.")}</p>
      <p>{tx(t, "phGr_ex3", "3. The Earth's Schwarzschild radius: 2 × 6.67 × 10⁻¹¹ × 5.97 × 10²⁴ / (9.0 × 10¹⁶) = 8.9 × 10⁻³ m: the whole planet squeezed into a marble.")}</p>
      <p>{tx(t, "phGr_ex4", "4. Light leaving the Sun's surface climbs out of a potential well GM/R = 1.9 × 10¹¹ J/kg, so it arrives here redshifted by about 1.9 × 10¹¹ / 9.0 × 10¹⁶ = 2.1 × 10⁻⁶: spectral lines from the Sun are shifted by two parts in a million, as measured.")}</p>
      <p>{tx(t, "phGr_ex5", "5. A gravitational wave with strain h = 10⁻²¹ changes a 4 km arm by h × L = 4 × 10⁻¹⁸ m, though the light in LIGO bounces back and forth hundreds of times, multiplying the effect it measures.")}</p>

      <H2>{tx(t, "phGr_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phGr_tWrong", "Wrong"), tx(t, "phGr_tRight", "Right"), tx(t, "phGr_tWhy", "Why")]}
        rows={[
          [tx(t, "phGr_m1w", "astronauts in orbit are weightless because there is no gravity"), tx(t, "phGr_m1r", "they are falling freely"), tx(t, "phGr_m1", "gravity at the ISS is still 90% of that on the ground")],
          [tx(t, "phGr_m2w", "clocks higher up run slow"), tx(t, "phGr_m2r", "higher clocks run fast"), tx(t, "phGr_m2", "time runs slower deeper in gravity")],
          [tx(t, "phGr_m3w", "GPS only needs special relativity"), tx(t, "phGr_m3r", "the gravitational effect is bigger"), tx(t, "phGr_m3", "+45.7 μs from height against −7.2 μs from speed")],
          [tx(t, "phGr_m4w", "black holes suck everything in"), tx(t, "phGr_m4r", "far away they pull like any mass"), tx(t, "phGr_m4", "if the Sun became a black hole of the same mass, the Earth's orbit would not change")],
          [tx(t, "phGr_m5w", "spacetime curvature is a rubber sheet pulled down by gravity"), tx(t, "phGr_m5r", "a picture, not the mechanism"), tx(t, "phGr_m5", "the sheet uses gravity to explain gravity; what curves is spacetime, including time")],
          [tx(t, "phGr_m6w", "the escape-speed argument derives r_s"), tx(t, "phGr_m6r", "it only happens to agree"), tx(t, "phGr_m6", "the real derivation solves Einstein's equations (Schwarzschild 1916)")],
        ]}
      />

      <KeyIdeas t={t} id="phGr" items={[
        "Equivalence principle: inside a small closed box, gravity and acceleration cannot be told apart; inertial and gravitational mass are equal.",
        "Therefore light bends in gravity (1.75 arcseconds at the Sun, gravitational lenses) and clocks lower down run slower, by gh/c².",
        "GPS clocks gain 45.7 μs a day from height and lose 7.2 μs from speed; uncorrected, positions would drift about 11 km a day.",
        "Gravity is the curvature of spacetime by mass and energy; free bodies follow geodesics; Einstein's equations G = (8πG/c⁴)T link the two.",
        "A mass squeezed inside its Schwarzschild radius 2GM/c² becomes a black hole: 3 km for the Sun, 9 mm for the Earth.",
        "Accelerating masses send out gravitational waves at c; LIGO detected two black holes merging in 2015.",
      ]} />
    </Article>
  );
}

"use client";

// Relativity 1: special relativity — the puzzle of the speed of light
// (Galilean addition vs Maxwell's c, the ether, Michelson–Morley), Einstein's
// two postulates, time dilation derived with the light clock, γ and its
// values, muons as evidence, length contraction derived from the muon's
// point of view, the relativity of simultaneity (Einstein's train, gap
// γLv/c²), and the everyday limit γ ≈ 1 + β²/2.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { LightClockFigure } from "@/components/lesson/figures/physics/LightClockFigure";
import { SimultaneityFigure } from "@/components/lesson/figures/physics/SimultaneityFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Time dilation and length contraction for a speed βc. */
const gammaNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const g = 1 / Math.sqrt(1 - v.b * v.b);
  return {
    tex: r`\gamma = \frac{1}{\sqrt{1 - ${num(v.b, 3)}^2}} = \amber{${num(g, 3)}}, \quad \Delta t = ${num(g, 3)} \times ${num(v.t0, 1)}\ \text{s} = \green{${num(g * v.t0, 2)}\ \text{s}}, \quad L = \frac{${num(v.L0, 0)}\ \text{m}}{${num(g, 3)}} = ${num(v.L0 / g, 1)}\ \text{m}`,
    meter: 1 / g, meterLabel: `${tx(t, "phSr_liveRate", "moving clock's rate")}: ${num(100 / g, 1)}%`,
  };
};

export function SpecialRelativityContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phSr_intro",
          "Maxwell's equations predict that light travels at c = 299 792 458 m/s. But measured by whom? If you chase a light beam at half that speed, Galileo's rule for adding velocities says you should see it pass at only half of c. Experiments said otherwise: everyone, however they move, measures the same c. In 1905 a 26-year-old patent clerk, Albert Einstein, took that fact seriously and followed it to its consequences. Moving clocks run slow, moving rulers shrink, and two events that are simultaneous for one observer happen at different times for another. None of it shows up at everyday speeds, which is why it took until 1905 to find, but particle accelerators, cosmic rays and the satellites that tell your phone where it is depend on it every second.")}
      </Lead>

      <Goals t={t} id="phSr" items={[
        "State Einstein's two postulates and explain why they clash with Galilean velocity addition.",
        "Derive time dilation with a light clock and compute γ for a given speed.",
        "Derive length contraction and use both effects to explain why cosmic-ray muons reach the ground.",
        "Explain why simultaneity depends on the observer, with Einstein's train.",
      ]} />

      <H2>{tx(t, "phSr_puzzleTitle", "The puzzle of the speed of light")}</H2>
      <p>
        {tx(t, "phSr_puzzleBody",
          "The relative motion chapter added velocities the common-sense way: a ball thrown forward at 20 m/s from a train moving at 30 m/s goes at 50 m/s relative to the ground. Light should be no different. Maxwell's equations, however, give the speed of light as c = 1/√(μ₀ε₀), built only from two constants of electricity and magnetism, with no mention of who is measuring. Nineteenth-century physicists concluded that c must be the speed relative to some medium filling space, the luminiferous ether, and that the Earth, moving round the Sun at 30 km/s, should feel an ether wind.")}
      </p>
      <p>
        {tx(t, "phSr_mmBody",
          "In 1887 Albert Michelson and Edward Morley built an interferometer sensitive enough to detect that wind: it compared the time light takes to go out and back along two perpendicular arms, while the apparatus floated on mercury and was slowly turned. The expected shift of the interference fringes was 0.4 of a fringe; they saw less than 0.02, no more than their measuring noise. Repeated in every season and, later, with lasers to a precision of one part in 10¹⁷, the answer has never changed: light moves at the same speed in every direction, however the lab moves.")}
      </p>

      <H2>{tx(t, "phSr_postTitle", "Einstein's two postulates")}</H2>
      <LessonTable
        headers={[tx(t, "phSr_tPost", "Postulate"), tx(t, "phSr_tSays", "What it says")]}
        rows={[
          [tx(t, "phSr_p1a", "1. The principle of relativity"), tx(t, "phSr_p1b", "The laws of physics are the same in every inertial frame (every frame moving at constant velocity). No experiment done inside a closed room can tell whether the room is at rest or moving steadily.")],
          [tx(t, "phSr_p2a", "2. The constancy of the speed of light"), tx(t, "phSr_p2b", "Light in empty space moves at the same speed c for every inertial observer, whatever the motion of the source or of the observer.")],
        ]}
      />
      <p>
        {tx(t, "phSr_postBody",
          "The first was already Galileo's; Einstein extended it from mechanics to electromagnetism. The second follows from the first if Maxwell's equations are laws of physics: they fix c, so c must be the same for everyone. Together they cannot be squared with Galileo's velocity addition. Something else has to give, and what gives is our idea of time.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phSr_inertial", "An inertial frame is a frame in which a body with no forces on it moves in a straight line at constant speed: Newton's first law holds. A train gliding smoothly is (very nearly) one; a braking train or a spinning carousel is not. Special relativity is about inertial frames; accelerations and gravity are the subject of the last chapter of this section.")}
      </Callout>

      <H2>{tx(t, "phSr_dilTitle", "Time dilation: moving clocks run slow")}</H2>
      <p>
        {tx(t, "phSr_dilBody",
          "The simplest clock to analyse is a light clock: a flash of light bouncing between two mirrors a distance L apart, one tick for each trip. Put one on a train moving at speed v and compare its ticks, seen from the platform, with an identical clock standing on the platform.")}
      </p>
      <Derivation t={t} label={tx(t, "phSr_eqDil", "The light clock")}
        steps={[
          { tex: r`\Delta t_0 = \frac{L}{c}`, why: tx(t, "phSr_d1", "in the train, the light goes straight across the gap L at speed c: this is one tick of the clock in its own frame, its proper time") },
          { tex: r`\left(\frac{c\,\Delta t}{2}\right)^2 = L^2 + \left(\frac{v\,\Delta t}{2}\right)^2 \;\to\; (c\,\Delta t)^2 = L^2 + (v\,\Delta t)^2`, why: tx(t, "phSr_d2", "seen from the platform, during one tick Δt the mirrors move on by vΔt, so the light runs along the slanted side of a right triangle (Pythagoras). By postulate 2 it still moves at c, so the slanted side is cΔt") },
          { tex: r`\Delta t^2\,(c^2 - v^2) = L^2 \;\to\; \Delta t = \frac{L/c}{\sqrt{1 - v^2/c^2}}`, why: tx(t, "phSr_d3", "collect the Δt terms and take the square root") },
          { tex: r`\green{\Delta t = \gamma\,\Delta t_0}, \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}`, why: tx(t, "phSr_d4", "each tick of the moving clock lasts γ times longer as measured from the platform") },
        ]} />
      <Equation label={tx(t, "phSr_eqGamma", "Time dilation and the Lorentz factor")}
        where={[
          [r`\Delta t_0`, tx(t, "phSr_wT0", "the proper time: the time between two events measured by a clock present at both, moving with them")],
          [r`\Delta t`, tx(t, "phSr_wT", "the time between the same two events measured in a frame where that clock moves at speed v")],
          [r`\gamma`, tx(t, "phSr_wGamma", "the Lorentz factor; 1 at rest, larger at higher speed, infinite at v = c")],
          [r`\beta = v/c`, tx(t, "phSr_wBeta", "the speed as a fraction of the speed of light")],
        ]}
        words={tx(t, "phSr_dilWords", "A clock moving past you ticks slower than yours by the factor γ; the faster it moves, the bigger the effect.")}
        note={tx(t, "phSr_dilNote", "This is not a defect of light clocks. If a mechanical clock on the train kept different time from the light clock beside it, a passenger could tell the train was moving, breaking postulate 1. So every process on the train slows by the same factor: clocks, hearts, chemical reactions, the decay of particles. And it is symmetric: to the passenger, the platform clocks run slow.")}>
        {r`\Delta t = \gamma\,\Delta t_0, \qquad \gamma = \frac{1}{\sqrt{1 - \beta^2}}`}
      </Equation>
      <LightClockFigure t={t} />
      <LessonTable
        headers={[tx(t, "phSr_tSpeed", "Speed"), "γ", tx(t, "phSr_tMeans", "One moving hour lasts, for us")]}
        rows={[
          [tx(t, "phSr_g1", "airliner, 250 m/s"), tx(t, "phSr_g1g", "1.000 000 000 000 35"), tx(t, "phSr_g1m", "1 h plus 1.25 ns")],
          [tx(t, "phSr_g2", "0.1 c"), tx(t, "phSr_g2g", "1.005"), tx(t, "phSr_g2m", "1 h 0 min 18 s")],
          [tx(t, "phSr_g3", "0.5 c"), tx(t, "phSr_g3g", "1.155"), tx(t, "phSr_g3m", "1 h 9 min")],
          [tx(t, "phSr_g4", "0.8 c"), tx(t, "phSr_g4g", "1.667"), tx(t, "phSr_g4m", "1 h 40 min")],
          [tx(t, "phSr_g5", "0.99 c"), tx(t, "phSr_g5g", "7.09"), tx(t, "phSr_g5m", "7 h 5 min")],
          [tx(t, "phSr_g6", "0.999 c"), tx(t, "phSr_g6g", "22.4"), tx(t, "phSr_g6m", "22 h 22 min")],
        ]}
      />
      <H3>{tx(t, "phSr_muonTitle", "Evidence from the sky: muons")}</H3>
      <p>
        {tx(t, "phSr_muonBody",
          "Cosmic rays striking the top of the atmosphere, some 10 to 15 km up, make muons, heavy cousins of the electron that live on average 2.2 μs before decaying. Even at nearly the speed of light, 2.2 μs is enough for only about 660 m of travel, so almost none should reach the ground. Yet muons rain down on every square metre of the Earth's surface, about one per second through your hand. At v = 0.998c, γ = 15.8: in our frame each muon's clock runs nearly sixteen times slow, its life stretches to about 35 μs, and it can cover over 10 km. Bruno Rossi and David Hall measured exactly this in 1941. Particle accelerators see the same: fast unstable particles live longer by precisely γ.")}
      </p>

      <H2>{tx(t, "phSr_lenTitle", "Length contraction: moving objects are shorter")}</H2>
      <p>
        {tx(t, "phSr_lenBody",
          "Look at the same muon from its own point of view. In its frame it lives its normal 2.2 μs, so how does it reach the ground? The two frames must agree on what happens (the muon either hits the detector or it does not), so the muon must see a thinner atmosphere: the ground rushing up at 0.998c has to cover a shorter distance.")}
      </p>
      <Derivation t={t} label={tx(t, "phSr_eqLen", "The same trip from both sides")}
        steps={[
          { tex: r`L_0 = v\,\Delta t = v\,\gamma\,\Delta t_0`, why: tx(t, "phSr_l1", "Earth frame: the atmosphere has its normal thickness L₀ and the muon crosses it at v in the dilated time γΔt₀") },
          { tex: r`L = v\,\Delta t_0`, why: tx(t, "phSr_l2", "muon frame: the muon is at rest, the atmosphere streams past at the same speed v, and the trip takes the muon's own time Δt₀") },
          { tex: r`\green{L = \frac{L_0}{\gamma}}`, why: tx(t, "phSr_l3", "divide: in the muon's frame the atmosphere is shorter by the factor γ") },
        ]} />
      <Equation label={tx(t, "phSr_eqContr", "Length contraction")}
        where={[
          [r`L_0`, tx(t, "phSr_wL0", "the proper length: the length of an object measured in the frame where it is at rest")],
          [r`L`, tx(t, "phSr_wL", "its length measured in a frame where it moves at speed v, along the direction of motion")],
        ]}
        words={tx(t, "phSr_lenWords", "A moving object is shorter along its direction of motion by the factor γ. Sizes across the motion are not changed.")}
        note={tx(t, "phSr_lenNote", "Measuring the length of a moving object means marking both ends at the same moment; the next section shows that \"the same moment\" depends on the frame, which is why lengths can disagree. A photograph is another matter: light from the far end left earlier, so a fast object would look rotated rather than squashed (the Terrell effect).")}>
        {r`L = \frac{L_0}{\gamma}`}
      </Equation>
      <LiveFormula label={tx(t, "phSr_liveGamma", "Try it: a clock and a ruler at speed")}
        tex={r`\gamma = \frac{1}{\sqrt{1 - \beta^2}}, \quad \Delta t = \gamma\,\Delta t_0, \quad L = \frac{L_0}{\gamma}`}
        vars={[
          { id: "b", label: "β = v/c", min: 0, max: 0.999, step: 0.001, value: 0.8, fmt: v => num(v, 3) },
          { id: "t0", label: tx(t, "phSr_liveT0", "proper time Δt₀ (s)"), min: 1, max: 60, step: 1, value: 10, fmt: v => `${num(v, 0)} s` },
          { id: "L0", label: tx(t, "phSr_liveL0", "proper length L₀ (m)"), min: 1, max: 500, step: 1, value: 100, fmt: v => `${num(v, 0)} m` },
        ]}
        compute={gammaNumbers(t)}
        note={tx(t, "phSr_liveNote", "Up to about 0.3c, γ stays within 5% of 1. Past 0.9c it climbs steeply: the last few percent of the speed of light are where all the drama is.")} />

      <H2>{tx(t, "phSr_simTitle", "The relativity of simultaneity")}</H2>
      <p>
        {tx(t, "phSr_simBody",
          "The deepest change is to the word \"now\". Einstein's thought experiment: a lamp in the middle of a moving carriage flashes. For the passengers, light reaches both ends at the same instant. For the people on the platform, light still moves at c in both directions, but the back wall moves into the light and the front wall away from it, so the back is lit first. Neither is wrong. Whether two separated events are simultaneous depends on the frame.")}
      </p>
      <SimultaneityFigure t={t} />
      <Equation label={tx(t, "phSr_eqSim", "How far apart in time the two arrivals are, seen from the platform")}
        where={[
          [r`\Delta t`, tx(t, "phSr_wDt", "the time between the light reaching the back and reaching the front, in the platform frame")],
          [r`L`, tx(t, "phSr_wLp", "the carriage's proper length (in its own frame)")],
          [r`v`, tx(t, "phSr_wV", "the carriage's speed")],
        ]}
        words={tx(t, "phSr_simWords", "Events simultaneous in the train are separated in the platform frame by a time proportional to their distance apart and to the train's speed.")}
        note={tx(t, "phSr_simNote", "For a 300 m train at 30 m/s, Δt = 300 × 30 / (9 × 10¹⁶) = 10⁻¹³ s. At everyday speeds the disagreement is utterly negligible, which is why absolute simultaneity seemed obvious. The derivation follows from the two times in the figure: (L/2γ)/(c − v) − (L/2γ)/(c + v).")}>
        {r`\Delta t = \frac{\gamma\, L\, v}{c^2}`}
      </Equation>

      <H2>{tx(t, "phSr_everyTitle", "Why we never notice")}</H2>
      <Derivation t={t} label={tx(t, "phSr_eqApprox", "γ at everyday speeds")}
        steps={[
          { tex: r`(1 - x)^{-1/2} \approx 1 + \tfrac12 x \quad (x \ll 1)`, why: tx(t, "phSr_a1", "the binomial approximation (Math track): for a small x, raising 1 − x to a power n gives about 1 − nx") },
          { tex: r`\green{\gamma \approx 1 + \frac{\beta^2}{2} = 1 + \frac{v^2}{2c^2}}`, why: tx(t, "phSr_a2", "put x = β²") },
          { tex: r`\frac{v^2}{2c^2} = \frac{250^2}{2 \times (3\times10^8)^2} = 3.5\times10^{-13}`, why: tx(t, "phSr_a3", "for an airliner: a clock on board loses 3.5 × 10⁻¹³ of a second each second, about 1.25 ns per hour") },
        ]} />
      <p>
        {tx(t, "phSr_hk",
          "Small, but measurable. In 1971 Joseph Hafele and Richard Keating flew caesium atomic clocks round the world on commercial flights, eastwards and westwards, and compared them with clocks left at the US Naval Observatory. The differences, tens to hundreds of nanoseconds, matched relativity, including the effect of altitude that the last chapter of this section explains.")}
      </p>

      <H2>{tx(t, "phSr_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phSr_ex1", "1. A spaceship passes at 0.6c. γ = 1/√(1 − 0.36) = 1/0.8 = 1.25. Its 100 m length is measured as 100/1.25 = 80 m, and a 60 s video call from the crew lasts 75 s by our clocks.")}</p>
      <p>{tx(t, "phSr_ex2", "2. A pion, an unstable particle with a mean life of 26 ns, flies at 0.95c (γ = 3.20). In the lab it lives 3.20 × 26 = 83 ns on average and travels 0.95 × 3.0 × 10⁸ × 83 × 10⁻⁹ = 24 m instead of 7.4 m.")}</p>
      <p>{tx(t, "phSr_ex3", "3. How fast must a ship go for its crew to age half as fast as us? γ = 2, so 1 − β² = 1/4, β = √0.75 = 0.866: 87% of the speed of light.")}</p>
      <p>{tx(t, "phSr_ex4", "4. A muon made 12 km up at 0.998c: in our frame it needs 12 000 / (0.998 × 3.0 × 10⁸) = 40 μs, which is 40/15.8 = 2.5 μs of its own time, about one average lifetime, so a good fraction survive. In its frame the 12 km of air is 12/15.8 = 0.76 km thick.")}</p>

      <H2>{tx(t, "phSr_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phSr_tWrong", "Wrong"), tx(t, "phSr_tRight", "Right"), tx(t, "phSr_tWhy", "Why")]}
        rows={[
          [tx(t, "phSr_m1w", "moving clocks are faulty"), tx(t, "phSr_m1r", "time itself runs differently"), tx(t, "phSr_m1", "every process in the moving frame slows by the same γ")],
          [tx(t, "phSr_m2w", "the moving observer feels time drag"), tx(t, "phSr_m2r", "everyone feels normal time"), tx(t, "phSr_m2", "a passenger's own clock and heart run at their usual rate")],
          [tx(t, "phSr_m3w", "putting γ on the proper time the wrong way"), tx(t, "phSr_m3r", "proper time is the shortest"), tx(t, "phSr_m3", "Δt = γΔt₀, with Δt₀ measured by the clock present at both events")],
          [tx(t, "phSr_m4w", "objects shrink in every direction"), tx(t, "phSr_m4r", "only along the motion"), tx(t, "phSr_m4", "sizes across the motion are the same in both frames")],
          [tx(t, "phSr_m5w", "one of the two observers is really right"), tx(t, "phSr_m5r", "both are"), tx(t, "phSr_m5", "each frame is as good as the other (postulate 1)")],
          [tx(t, "phSr_m6w", "relativity says everything is relative"), tx(t, "phSr_m6r", "some things are absolute"), tx(t, "phSr_m6", "c, the laws of physics and, next chapter, the spacetime interval are the same for all")],
        ]}
      />

      <KeyIdeas t={t} id="phSr" items={[
        "Light moves at the same speed c for every inertial observer (Michelson–Morley), and the laws of physics are the same in every inertial frame.",
        "Moving clocks run slow: Δt = γΔt₀, with γ = 1/√(1 − v²/c²) and Δt₀ the proper time.",
        "Moving objects are shorter along their motion: L = L₀/γ.",
        "Cosmic-ray muons reach the ground because their clocks run slow in our frame, or, in theirs, because the atmosphere is contracted.",
        "Simultaneity is relative: events at the same time in one frame are γLv/c² apart in another.",
        "At everyday speeds γ ≈ 1 + v²/2c², far too close to 1 to notice, but atomic clocks on aeroplanes and satellites measure it.",
      ]} />
    </Article>
  );
}

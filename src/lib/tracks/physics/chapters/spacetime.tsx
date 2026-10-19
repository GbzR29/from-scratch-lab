"use client";

// Relativity 2: spacetime — events, worldlines and spacetime diagrams (ct
// units, light at 45°), the Lorentz transformation derived (linearity,
// symmetry, the same c), its Galilean limit, two frames on one diagram, the
// invariant interval s² = (cΔt)² − Δx² derived, proper time, timelike /
// lightlike / spacelike separations, light cones and causality (why nothing
// signals faster than light), relativistic velocity addition derived, the
// twin paradox with proper time along a bent worldline, and the relativistic
// Doppler shift.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { MinkowskiFigure } from "@/components/lesson/figures/physics/MinkowskiFigure";
import { TwinFigure } from "@/components/lesson/figures/physics/TwinFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Relativistic velocity addition, compared with Galileo's sum. */
const addNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const u = (v.a + v.b) / (1 + v.a * v.b);
  return {
    tex: r`u = \frac{${num(v.a, 2)} + ${num(v.b, 2)}}{1 + ${num(v.a, 2)} \times ${num(v.b, 2)}}\,c = \green{${num(u, 4)}\,c}`,
    meter: u, meterLabel: `${tx(t, "phSt_liveGalileo", "Galileo would say")} ${num(v.a + v.b, 2)}c`,
  };
};

export function SpacetimeContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phSt_intro",
          "\"Henceforth space by itself, and time by itself, are doomed to fade away into mere shadows, and only a kind of union of the two will preserve an independent reality.\" Hermann Minkowski, Einstein's former mathematics teacher, said this in 1908, three years after special relativity. He saw that the strange effects of the previous chapter, slow clocks, short rulers, disputed simultaneity, are one effect seen from different angles: observers moving relative to each other slice a single four-dimensional spacetime differently into space and time. This chapter builds the tools for that picture, the Lorentz transformation and the spacetime diagram, and uses them to settle the most famous puzzle of relativity, the twins.")}
      </Lead>

      <Goals t={t} id="phSt" items={[
        "Draw events and worldlines on a spacetime diagram and read the axes of a moving frame on it.",
        "Derive the Lorentz transformation and use it to move between frames.",
        "Compute the spacetime interval, classify separations as timelike, lightlike or spacelike, and explain why causes always come before effects.",
        "Add velocities relativistically and resolve the twin paradox with proper time.",
      ]} />

      <H2>{tx(t, "phSt_eventsTitle", "Events and spacetime diagrams")}</H2>
      <p>
        {tx(t, "phSt_eventsBody",
          "An event is something that happens at one place at one instant: a firecracker going off, a clock ticking, a photon hitting a detector. In one space dimension it needs two numbers, x and t. On a spacetime diagram, x runs across and time runs up, and it is convenient to measure time as ct, the distance light covers in that time: one light-second of ct is one second. Then light moves along lines at 45°. The path of an object through spacetime, the set of all events in its life, is its worldline: a vertical line for an object at rest, a tilted line for steady motion, a curve for acceleration. Since nothing moves faster than light, every worldline is steeper than 45°.")}
      </p>

      <H2>{tx(t, "phSt_lorentzTitle", "The Lorentz transformation")}</H2>
      <p>
        {tx(t, "phSt_lorentzBody",
          "Let frame S′ move at speed v along x relative to frame S, with their origins together at t = t′ = 0. An event has coordinates (x, t) in S and (x′, t′) in S′. Galileo's answer was x′ = x − vt and t′ = t. We need the rule that keeps c the same in both frames.")}
      </p>
      <Derivation t={t} label={tx(t, "phSt_eqDerive", "Finding the rule from the two postulates")}
        steps={[
          { tex: r`x' = \gamma\,(x - v t)`, why: tx(t, "phSt_l1", "the rule must be linear (uniform motion must look uniform in both frames), and the origin of S′, x′ = 0, must move as x = vt; γ is an unknown factor, equal to 1 for Galileo") },
          { tex: r`x = \gamma\,(x' + v t')`, why: tx(t, "phSt_l2", "postulate 1: S′ sees S moving at −v, with the same law and the same γ, since neither frame is special") },
          { tex: r`c\,t' = \gamma\,(c t - v t), \qquad c\,t = \gamma\,(c t' + v t')`, why: tx(t, "phSt_l3", "postulate 2: a light flash from the origin has x = ct in S and x′ = ct′ in S′; put these into the two lines above") },
          { tex: r`c^2 t\,t' = \gamma^2 (c - v)(c + v)\, t\, t' \;\Rightarrow\; \gamma^2 = \frac{1}{1 - v^2/c^2}`, why: tx(t, "phSt_l4", "multiply the two equations and cancel t t′: the same γ as the light clock") },
          { tex: r`\green{t' = \gamma\left(t - \frac{v x}{c^2}\right)}`, why: tx(t, "phSt_l5", "eliminate x′ between the first two lines and solve for t′ (a few lines of algebra, using 1 − 1/γ² = v²/c²)") },
        ]} />
      <Equation label={tx(t, "phSt_eqLorentz", "The Lorentz transformation")}
        where={[
          [r`x,\ t`, tx(t, "phSt_wXT", "an event's position and time in frame S")],
          [r`x',\ t'`, tx(t, "phSt_wXTp", "the same event's position and time in frame S′, which moves at v along x relative to S")],
          [r`\gamma`, tx(t, "phSt_wG", "the Lorentz factor 1/√(1 − v²/c²)")],
          [r`\frac{v x}{c^2}`, tx(t, "phSt_wSync", "the term that makes simultaneity relative: clocks synchronised in S′ disagree in S by an amount growing with distance x")],
        ]}
        words={tx(t, "phSt_lorentzWords", "Position and time mix: what one observer calls pure distance, another sees partly as time, and the other way round.")}
        note={tx(t, "phSt_lorentzNote", "Directions across the motion are untouched: y′ = y, z′ = z. For v ≪ c, γ ≈ 1 and vx/c² is tiny, so the rule becomes Galileo's: relativity contains Newton as the slow-speed limit. Time dilation and length contraction both follow from these two lines.")}>
        {r`x' = \gamma\,(x - v t), \qquad t' = \gamma\left(t - \frac{v x}{c^2}\right)`}
      </Equation>

      <H2>{tx(t, "phSt_twoTitle", "Two frames on one diagram")}</H2>
      <p>
        {tx(t, "phSt_twoBody",
          "On our diagram, where are the axes of the moving frame? Its time axis is the set of events with x′ = 0: its own worldline, x = vt, tilted towards the light line. Its space axis is the set of events with t′ = 0: its line of \"now\", t = vx/c², tilted by the same angle from our x axis. The two axes close up like scissors around the 45° light line, which stays put: that is the constancy of c, drawn.")}
      </p>
      <MinkowskiFigure t={t} />

      <H2>{tx(t, "phSt_intervalTitle", "The spacetime interval")}</H2>
      <p>
        {tx(t, "phSt_intervalBody",
          "Observers disagree about distances and times, but not about everything. In ordinary space, rotating your axes changes the x and y of a displacement but not its length √(Δx² + Δy²). Spacetime has a similar invariant, with a crucial minus sign.")}
      </p>
      <Derivation t={t} label={tx(t, "phSt_eqInvariant", "Why the interval is the same in every frame")}
        steps={[
          { tex: r`c^2\Delta t'^2 - \Delta x'^2 = \gamma^2\left[(c\Delta t - \beta\,\Delta x)^2 - (\Delta x - \beta\,c\Delta t)^2\right]`, why: tx(t, "phSt_i1", "put the Lorentz transformation into the combination, with β = v/c (and ct′ = γ(ct − βx))") },
          { tex: r`= \gamma^2\left[c^2\Delta t^2(1 - \beta^2) - \Delta x^2 (1 - \beta^2)\right]`, why: tx(t, "phSt_i2", "expand the squares: the cross terms −2βcΔtΔx cancel") },
          { tex: r`\green{= c^2\Delta t^2 - \Delta x^2}`, why: tx(t, "phSt_i3", "γ²(1 − β²) = 1") },
        ]} />
      <Equation label={tx(t, "phSt_eqInterval", "The spacetime interval between two events")}
        where={[
          [r`s^2`, tx(t, "phSt_wS2", "the squared interval, the same for every inertial observer")],
          [r`c\Delta t,\ \Delta x`, tx(t, "phSt_wDx", "the time (as a distance) and the distance between the events in any one frame")],
          [r`\tau`, tx(t, "phSt_wTau", "the proper time: what a clock moving straight from one event to the other would read")],
        ]}
        words={tx(t, "phSt_intervalWords", "Time squared minus distance squared, both in light units, is the one measure of separation every observer agrees on.")}
        note={tx(t, "phSt_intervalNote", "For a clock present at both events, Δx = 0 in its own frame, so s² = c²τ²: the interval measures the time ticked off by a clock that travels between the events. With three space dimensions, s² = c²Δt² − Δx² − Δy² − Δz².")}>
        {r`s^2 = (c\,\Delta t)^2 - \Delta x^2 = (c\,\tau)^2`}
      </Equation>
      <LessonTable
        headers={[tx(t, "phSt_tSign", "Sign of s²"), tx(t, "phSt_tName", "Name"), tx(t, "phSt_tMeaning", "Meaning")]}
        rows={[
          ["s² > 0", tx(t, "phSt_c1n", "timelike"), tx(t, "phSt_c1m", "a clock can travel from one to the other; one can cause the other; all observers agree which came first")],
          ["s² = 0", tx(t, "phSt_c2n", "lightlike"), tx(t, "phSt_c2m", "only a light signal connects them")],
          ["s² < 0", tx(t, "phSt_c3n", "spacelike"), tx(t, "phSt_c3m", "too far apart for any signal; there is a frame where they are simultaneous, and frames where either comes first")],
        ]}
      />
      <H3>{tx(t, "phSt_coneTitle", "Light cones and causality")}</H3>
      <p>
        {tx(t, "phSt_coneBody",
          "The light lines through an event form its light cone (a cone when two space dimensions are drawn). Inside the upper half is its future: every event it can influence. Inside the lower half is its past: every event that can have influenced it. Outside is \"elsewhere\": events whose order in time is a matter of frame. This is why nothing, no particle and no signal, can travel faster than light. A signal from A to a spacelike B would, in some frames, arrive before it was sent; and with two such signals you could send a message into your own past and stop yourself from sending it. Relativity keeps cause before effect only because the speed of light is a limit.")}
      </p>

      <H2>{tx(t, "phSt_addTitle", "Adding velocities")}</H2>
      <Derivation t={t} label={tx(t, "phSt_eqAdd", "A ball thrown forward on a fast train")}
        steps={[
          { tex: r`x' = u' t'`, why: tx(t, "phSt_a1", "in the train frame S′, the ball moves at u′ from the origin") },
          { tex: r`x = \gamma(x' + v t') = \gamma(u' + v)\,t', \qquad t = \gamma\left(t' + \frac{v x'}{c^2}\right) = \gamma\left(1 + \frac{u' v}{c^2}\right) t'`, why: tx(t, "phSt_a2", "the inverse transformation, from S′ back to S (swap the frames and change the sign of v)") },
          { tex: r`\green{u = \frac{x}{t} = \frac{u' + v}{1 + u' v / c^2}}`, why: tx(t, "phSt_a3", "divide: the γ's and t′ cancel") },
        ]} />
      <p>
        {tx(t, "phSt_addBody",
          "At everyday speeds the denominator is 1 to many decimal places and the rule is Galileo's sum. Near c it is not: two ships approaching each other, each at 0.5c relative to Earth, see each other approaching at 0.8c, not c. And if u′ = c, then u = (c + v)/(1 + v/c) = c: light from a moving lamp still moves at c, as postulate 2 demands. No combination of speeds below c ever reaches c.")}
      </p>
      <LiveFormula label={tx(t, "phSt_liveAdd", "Try it: adding two speeds")}
        tex={r`u = \frac{u' + v}{1 + u' v / c^2}`}
        vars={[
          { id: "a", label: "u′/c", min: 0, max: 1, step: 0.01, value: 0.5, fmt: v => num(v, 2) },
          { id: "b", label: "v/c", min: 0, max: 1, step: 0.01, value: 0.5, fmt: v => num(v, 2) },
        ]}
        compute={addNumbers(t)}
        note={tx(t, "phSt_liveNote", "Push both sliders to 0.9: Galileo says 1.8c, relativity 0.994c. Set either to 1: the answer is exactly c, whatever the other is.")} />

      <H2>{tx(t, "phSt_twinTitle", "The twin paradox")}</H2>
      <p>
        {tx(t, "phSt_twinBody",
          "One twin stays on Earth; the other flies at 0.8c to a star 4 light-years away and comes straight back. In Earth's frame the trip takes 10 years, and the traveller's clock runs slow by γ = 5/3, so the traveller ages only 6 years. The paradox: from the ship, Earth is the one moving, so shouldn't the Earth twin be younger? No, because the situation is not symmetric. The Earth twin stays in one inertial frame the whole time; the traveller uses two, out and back, and feels the turnaround (the jolt of reversing). The interval gives the answer directly: each twin ages by the proper time along their own worldline, and in spacetime a bent path between two events has less proper time than the straight one, the opposite of ordinary geometry, where the straight path is the shortest.")}
      </p>
      <TwinFigure t={t} />
      <Derivation t={t} label={tx(t, "phSt_eqTwin", "Proper time along each worldline (0.8c to a star 4 light-years away)")}
        steps={[
          { tex: r`c\tau_{Earth} = \sqrt{(c \cdot 10\ \text{yr})^2 - 0^2} = 10\ \text{ly}`, why: tx(t, "phSt_tw1", "the Earth twin stays at x = 0 for 10 years: 10 years of proper time") },
          { tex: r`c\tau_{out} = \sqrt{(5\ \text{ly})^2 - (4\ \text{ly})^2} = 3\ \text{ly}`, why: tx(t, "phSt_tw2", "the way out takes 5 years and covers 4 light-years: by the interval, 3 years of proper time") },
          { tex: r`\green{\tau_{trav} = 2 \times 3 = 6\ \text{yr} < 10\ \text{yr}}`, why: tx(t, "phSt_tw3", "the way back is the same: the traveller is 4 years younger on return") },
        ]} />
      <Callout type="info" t={t}>
        {tx(t, "phSt_doppler", "What would the twins see through telescopes? Light from a source moving away arrives stretched: its frequency is lowered by the relativistic Doppler factor √((1 − β)/(1 + β)), which is 1/3 at 0.8c. On the way out, each sees the other's clock running at a third of the normal rate; on the way back, at three times. The traveller switches from slow to fast at the turnaround, after 3 years; the Earth twin only sees the switch when the light from the turnaround arrives, after 9 years. Counting the flashes gives 6 years against 10, with no paradox. The same factor stretches the light of receding galaxies in the cosmology chapter.")}
      </Callout>

      <H2>{tx(t, "phSt_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phSt_ex1", "1. An event at x = 3 light-seconds, ct = 5 light-seconds, seen from a ship at 0.6c (γ = 1.25): x′ = 1.25 × (3 − 0.6 × 5) = 0, ct′ = 1.25 × (5 − 0.6 × 3) = 4. The event happens at the ship, and the interval checks: 5² − 3² = 16 = 4² − 0².")}</p>
      <p>{tx(t, "phSt_ex2", "2. Two firecrackers, 2 light-seconds apart, explode at the same moment in our frame. For a ship moving at 0.6c along the line joining them, Δt′ = γ(0 − vΔx/c²) = 1.25 × (−0.6 × 2) = −1.5 s: the far one explodes 1.5 s earlier. The interval is −4 (light-seconds²): spacelike, so neither caused the other.")}</p>
      <p>{tx(t, "phSt_ex3", "3. A spaceship at 0.9c fires a probe forward at 0.9c relative to itself. Relative to Earth: (0.9 + 0.9)/(1 + 0.81) = 1.8/1.81 = 0.994c.")}</p>
      <p>{tx(t, "phSt_ex4", "4. To reach a star 25 light-years away in 10 years of your own time, you need γβ = 25/10 = 2.5 (distance over proper time), so β = 2.5/√(1 + 2.5²) = 0.928. Earth sees the trip take 25/0.928 = 26.9 years.")}</p>

      <H2>{tx(t, "phSt_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phSt_tWrong", "Wrong"), tx(t, "phSt_tRight", "Right"), tx(t, "phSt_tWhy", "Why")]}
        rows={[
          [tx(t, "phSt_m1w", "t′ = γt"), tx(t, "phSt_m1r", "t′ = γ(t − vx/c²)"), tx(t, "phSt_m1", "the vx/c² term is the relativity of simultaneity; leaving it out gives contradictions")],
          [tx(t, "phSt_m2w", "the interval is c²Δt² + Δx²"), tx(t, "phSt_m2r", "c²Δt² − Δx²"), tx(t, "phSt_m2", "the minus sign is what makes spacetime different from space")],
          [tx(t, "phSt_m3w", "the twins are symmetric"), tx(t, "phSt_m3r", "only the traveller changes frames"), tx(t, "phSt_m3", "the bent worldline has less proper time")],
          [tx(t, "phSt_m4w", "you need general relativity for the twins"), tx(t, "phSt_m4r", "special relativity is enough"), tx(t, "phSt_m4", "the proper time along each path can be computed in Earth's inertial frame")],
          [tx(t, "phSt_m5w", "velocities add up to more than c"), tx(t, "phSt_m5r", "(u′ + v)/(1 + u′v/c²)"), tx(t, "phSt_m5", "the result is always below c")],
          [tx(t, "phSt_m6w", "faster-than-light signals would just be fast"), tx(t, "phSt_m6r", "they would break causality"), tx(t, "phSt_m6", "in some frame they would arrive before being sent")],
        ]}
      />

      <KeyIdeas t={t} id="phSt" items={[
        "A spacetime diagram plots events with ct up and x across; light moves at 45°, and every worldline is steeper.",
        "The Lorentz transformation, x′ = γ(x − vt), t′ = γ(t − vx/c²), follows from the two postulates and becomes Galileo's rule at low speed.",
        "A moving frame's axes tilt towards the light line like scissors; its line of \"now\" is not ours.",
        "The interval s² = (cΔt)² − Δx² is the same for every observer; for a clock moving between two events it gives the proper time.",
        "Timelike events have a definite order and can be cause and effect; spacelike ones cannot, which is why nothing signals faster than light.",
        "Velocities add as (u′ + v)/(1 + u′v/c²); the twin who travels ages less, because a bent worldline has less proper time.",
      ]} />
    </Article>
  );
}

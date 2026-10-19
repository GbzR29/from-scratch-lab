"use client";

// Advanced Mechanics 1: Lagrangian mechanics — why a second formulation
// (constraints, any coordinates), generalised coordinates and degrees of
// freedom, the action S = ∫(T − V) dt and the principle of stationary action,
// the Euler–Lagrange equation derived, the recipe, worked systems (pendulum,
// Atwood machine, bead on a spinning hoop, planet in polar coordinates),
// generalised momentum and cyclic coordinates, and Noether's theorem
// (symmetries ↔ conservation laws).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ActionFigure } from "@/components/lesson/figures/physics/ActionFigure";
import { BeadHoopFigure } from "@/components/lesson/figures/physics/BeadHoopFigure";

const r = String.raw;

export function LagrangianContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phLag_intro",
          "Newton's mechanics is about forces: draw every push and pull as an arrow, add the arrows, and F = ma tells you the acceleration. It works, but it gets painful as soon as things are tied together. A bead threaded on a wire, a pendulum on a rod, a ball rolling in a bowl: each is held on its track by a force nobody knows in advance, and you must find it before you can find the motion. In 1788 Joseph-Louis Lagrange published a way round this. Instead of forces, use two numbers, the kinetic energy and the potential energy, written in whatever coordinates suit the problem; one equation then gives the motion, and the forces of constraint never appear. The same idea, with other energies, now runs all of fundamental physics.")}
      </Lead>

      <Goals t={t} id="phLag" items={[
        "Choose generalised coordinates for a system and count its degrees of freedom.",
        "Write the Lagrangian L = T − V and explain the principle of stationary action.",
        "Use the Euler–Lagrange equation to get the equations of motion of a pendulum, an Atwood machine and a bead on a spinning hoop.",
        "Find conserved quantities from cyclic coordinates and state Noether's theorem.",
      ]} />

      <H2>{tx(t, "phLag_whyTitle", "Why another way to do mechanics")}</H2>
      <p>
        {tx(t, "phLag_whyBody",
          "Take a simple pendulum. In x and y coordinates the bob has two equations of motion, and both contain the tension in the rod, which changes all the time and which you do not know. But the bob cannot go anywhere it likes: it stays at distance L from the pivot. One number, the angle θ, says exactly where it is. Lagrange's idea is to describe a system with as few numbers as it really needs and to write the physics directly in those numbers.")}
      </p>
      <p>
        {tx(t, "phLag_coordBody",
          "Those numbers are called generalised coordinates, written q₁, q₂, … They can be lengths, angles, or anything else that pins down the configuration. How many you need is the number of degrees of freedom: three for a free particle, one for a pendulum, two for a double pendulum, six for a rigid body flying through the air (three for where it is, three for how it is turned). Their rates of change, q̇ = dq/dt, are the generalised velocities; a dot over a symbol always means its rate of change in time.")}
      </p>
      <LessonTable
        headers={[tx(t, "phLag_tSys", "System"), tx(t, "phLag_tCoords", "Good coordinates"), tx(t, "phLag_tDof", "Degrees of freedom")]}
        rows={[
          [tx(t, "phLag_r1a", "a ball thrown in a plane"), tx(t, "phLag_r1b", "x and y"), "2"],
          [tx(t, "phLag_r2a", "a simple pendulum"), tx(t, "phLag_r2b", "the angle θ"), "1"],
          [tx(t, "phLag_r3a", "a bead on a hoop"), tx(t, "phLag_r3b", "the angle θ round the hoop"), "1"],
          [tx(t, "phLag_r4a", "a double pendulum"), tx(t, "phLag_r4b", "the two angles θ₁, θ₂"), "2"],
          [tx(t, "phLag_r5a", "a planet round the Sun"), tx(t, "phLag_r5b", "distance r and angle φ"), "2"],
          [tx(t, "phLag_r6a", "a spinning top"), tx(t, "phLag_r6b", "three angles (Euler angles)"), "3"],
        ]}
      />

      <H2>{tx(t, "phLag_actionTitle", "The action")}</H2>
      <p>
        {tx(t, "phLag_actionBody",
          "Suppose a system is in a known configuration at time t₁ and in another known configuration at a later time t₂. Many motions could connect the two. For each imaginable one, take the kinetic energy T minus the potential energy V at every instant, and add it up over the whole trip. That total is called the action, S. The Math track's calculus of variations chapter set up this kind of quantity, a number computed from a whole path, called a functional.")}
      </p>
      <Equation label={tx(t, "phLag_eqAction", "The Lagrangian and the action")}
        where={[
          [r`L`, tx(t, "phLag_wL", "the Lagrangian, kinetic minus potential energy at one instant (J)")],
          [r`T`, tx(t, "phLag_wT", "the kinetic energy, which depends on the velocities q̇ (and sometimes on the q)")],
          [r`V`, tx(t, "phLag_wV", "the potential energy, which depends on the coordinates q")],
          [r`S`, tx(t, "phLag_wS", "the action of one whole path, in joule-seconds (J·s)")],
          [r`t_1,\ t_2`, tx(t, "phLag_wT12", "the start and end times, where the configuration is fixed")],
        ]}
        words={tx(t, "phLag_actionWords", "Add up kinetic minus potential energy over the whole motion. The path the system really takes is the one for which this total is stationary: nudging the path a little does not change it, to first order.")}
        note={tx(t, "phLag_actionNote", "The rule is usually called the principle of least action, but \"stationary\" is the accurate word: for short trips the true action is a minimum, as in the figure below, but in general it can be a saddle. What matters is that small changes of the path leave S unchanged, the way a small step sideways at the bottom of a valley or the top of a hill leaves your height unchanged.")}>
        {r`L = T - V, \qquad S = \int_{t_1}^{t_2} L\big(q, \dot q, t\big)\, dt`}
      </Equation>
      <ActionFigure t={t} />
      <p>
        {tx(t, "phLag_whyMinus",
          "Why T minus V, and not plus? Because it works: the figure shows that T + V would pick a ball that falls upwards. A rough feel for the minus sign: the action rewards a path that spends its time where the potential energy is high and does not hurry. A thrown ball could rush up and down, or linger near the ground; the true parabola is the best compromise between moving slowly (small T) and staying high (large V, which lowers T − V).")}
      </p>

      <H2>{tx(t, "phLag_elTitle", "The Euler–Lagrange equation")}</H2>
      <p>
        {tx(t, "phLag_elBody",
          "To turn \"S is stationary\" into an equation of motion, change the true path q(t) into a nearby path q(t) + εη(t), where η is any bump that is zero at both ends (the ends are fixed) and ε is a small number. Stationary means that dS/dε = 0 at ε = 0, for every bump.")}
      </p>
      <Derivation t={t} label={tx(t, "phLag_eqDerive", "From stationary action to an equation of motion")}
        steps={[
          { tex: r`\frac{dS}{d\varepsilon}\Big|_{0} = \int_{t_1}^{t_2} \left( \frac{\partial L}{\partial q}\,\eta + \frac{\partial L}{\partial \dot q}\,\dot\eta \right) dt`, why: tx(t, "phLag_d1", "L depends on the path through q and q̇; changing q by εη changes q̇ by εη̇, and the chain rule gives these two terms (∂ means a partial derivative: change one variable, hold the others)") },
          { tex: r`\int \frac{\partial L}{\partial \dot q}\,\dot\eta\, dt = \Big[\frac{\partial L}{\partial \dot q}\,\eta\Big]_{t_1}^{t_2} - \int \frac{d}{dt}\Big(\frac{\partial L}{\partial \dot q}\Big)\,\eta\, dt`, why: tx(t, "phLag_d2", "integration by parts moves the time derivative off the bump") },
          { tex: r`\Big[\frac{\partial L}{\partial \dot q}\,\eta\Big]_{t_1}^{t_2} = 0`, why: tx(t, "phLag_d3", "the bump is zero at both ends, so the boundary term vanishes") },
          { tex: r`\frac{dS}{d\varepsilon}\Big|_{0} = \int_{t_1}^{t_2} \left( \frac{\partial L}{\partial q} - \frac{d}{dt}\frac{\partial L}{\partial \dot q} \right) \eta\; dt = 0`, why: tx(t, "phLag_d4", "this must be zero for every possible bump η") },
          { tex: r`\green{\frac{d}{dt}\frac{\partial L}{\partial \dot q} - \frac{\partial L}{\partial q} = 0}`, why: tx(t, "phLag_d5", "the only way: the bracket itself is zero at every instant (if it were positive somewhere, a bump placed just there would give a non-zero integral)") },
        ]} />
      <Equation label={tx(t, "phLag_eqEL", "The Euler–Lagrange equation, one for each coordinate")}
        where={[
          [r`q_i`, tx(t, "phLag_wQi", "the i-th generalised coordinate (a length, an angle, …)")],
          [r`\dot q_i`, tx(t, "phLag_wQdi", "its rate of change, the generalised velocity")],
          [r`\frac{\partial L}{\partial \dot q_i}`, tx(t, "phLag_wP", "how L changes with that velocity: the generalised momentum")],
          [r`\frac{\partial L}{\partial q_i}`, tx(t, "phLag_wF", "how L changes with that coordinate: the generalised force")],
        ]}
        words={tx(t, "phLag_elWords", "The rate of change of the generalised momentum equals the generalised force: Newton's second law, written for any coordinates.")}>
        {r`\frac{d}{dt}\left(\frac{\partial L}{\partial \dot q_i}\right) = \frac{\partial L}{\partial q_i}, \qquad i = 1, 2, \dots`}
      </Equation>
      <H3>{tx(t, "phLag_checkTitle", "Check: it gives back Newton")}</H3>
      <Derivation t={t} label={tx(t, "phLag_eqCheck", "One particle on a line, in a potential V(x)")}
        steps={[
          { tex: r`L = \tfrac12 m\dot x^2 - V(x)`, why: tx(t, "phLag_c1", "kinetic minus potential energy") },
          { tex: r`\frac{\partial L}{\partial \dot x} = m\dot x, \qquad \frac{\partial L}{\partial x} = -\frac{dV}{dx}`, why: tx(t, "phLag_c2", "differentiate with respect to the velocity, holding x fixed, and with respect to x, holding the velocity fixed") },
          { tex: r`\frac{d}{dt}(m\dot x) = -\frac{dV}{dx}`, why: tx(t, "phLag_c3", "the Euler–Lagrange equation") },
          { tex: r`\green{m\ddot x = F}, \quad F = -\frac{dV}{dx}`, why: tx(t, "phLag_c4", "Newton's second law, with the force as minus the slope of the potential energy (work and energy chapter)") },
        ]} />

      <H2>{tx(t, "phLag_recipeTitle", "The recipe")}</H2>
      <LessonTable
        headers={[tx(t, "phLag_tStep", "Step"), tx(t, "phLag_tDo", "What to do")]}
        rows={[
          ["1", tx(t, "phLag_s1", "Pick generalised coordinates, as many as the degrees of freedom.")],
          ["2", tx(t, "phLag_s2", "Write the kinetic energy T in those coordinates and their rates. Always start from the true velocity in a non-accelerating frame.")],
          ["3", tx(t, "phLag_s3", "Write the potential energy V in those coordinates.")],
          ["4", tx(t, "phLag_s4", "Form L = T − V.")],
          ["5", tx(t, "phLag_s5", "For each coordinate, compute ∂L/∂q̇ and ∂L/∂q and set d/dt(∂L/∂q̇) = ∂L/∂q.")],
        ]}
      />
      <p>
        {tx(t, "phLag_recipeNote",
          "No free-body diagram, no unknown constraint forces, no vectors to resolve into components: two scalar energies and some derivatives. The constraint is built into the choice of coordinates.")}
      </p>

      <H2>{tx(t, "phLag_pendTitle", "Example: the pendulum")}</H2>
      <Derivation t={t} label={tx(t, "phLag_eqPend", "A bob of mass m on a rod of length ℓ, coordinate θ")}
        steps={[
          { tex: r`x = \ell\sin\theta, \quad y = -\ell\cos\theta \;\Rightarrow\; v = \ell\,\dot\theta`, why: tx(t, "phLag_p1", "the bob moves on a circle of radius ℓ, so its speed is ℓ times the rate of turning (y measured upwards from the pivot)") },
          { tex: r`T = \tfrac12 m\ell^2\dot\theta^2, \qquad V = m g y = -m g \ell\cos\theta`, why: tx(t, "phLag_p2", "kinetic energy ½mv², and potential energy mg times the height") },
          { tex: r`L = \tfrac12 m\ell^2\dot\theta^2 + m g\ell\cos\theta`, why: tx(t, "phLag_p3", "T − V; the minus of a minus becomes plus") },
          { tex: r`\frac{d}{dt}\big(m\ell^2\dot\theta\big) = -m g\ell\sin\theta`, why: tx(t, "phLag_p4", "∂L/∂θ̇ = mℓ²θ̇ and ∂L/∂θ = −mgℓ sin θ") },
          { tex: r`\green{\ddot\theta = -\frac{g}{\ell}\sin\theta}`, why: tx(t, "phLag_p5", "the pendulum equation of the oscillations section, in three lines, and the tension in the rod never appeared") },
        ]} />

      <H2>{tx(t, "phLag_atwoodTitle", "Example: the Atwood machine")}</H2>
      <p>
        {tx(t, "phLag_atwoodBody",
          "Two masses m₁ and m₂ hang from the ends of a string over a light pulley. With Newton you write two equations with the tension T_s in both and eliminate it. With Lagrange, notice that one number describes everything: how far m₁ has gone down, x. Then m₂ has gone up by the same x, and both move at speed ẋ.")}
      </p>
      <Derivation t={t} label={tx(t, "phLag_eqAtwood", "Two masses on a string over a pulley")}
        steps={[
          { tex: r`T = \tfrac12 (m_1 + m_2)\,\dot x^2`, why: tx(t, "phLag_a1", "both masses move at the same speed ẋ") },
          { tex: r`V = -m_1 g x + m_2 g x + \text{const}`, why: tx(t, "phLag_a2", "m₁ goes down by x (its potential energy falls), m₂ goes up by x") },
          { tex: r`L = \tfrac12 (m_1 + m_2)\dot x^2 + (m_1 - m_2)\, g\, x`, why: tx(t, "phLag_a3", "T − V; the constant does not matter, since only derivatives of L enter") },
          { tex: r`\green{\ddot x = \frac{m_1 - m_2}{m_1 + m_2}\, g}`, why: tx(t, "phLag_a4", "Euler–Lagrange: (m₁ + m₂) ẍ = (m₁ − m₂) g. The difference in weight drives the total mass") },
        ]} />

      <H2>{tx(t, "phLag_hoopTitle", "Example: a bead on a spinning hoop")}</H2>
      <p>
        {tx(t, "phLag_hoopBody",
          "Now a problem that is awkward with forces. A bead slides without friction on a circular hoop of radius R, and the hoop is spun about its vertical diameter at a steady angular speed ω. The hoop pushes on the bead in two directions at once, and both pushes are unknown. The bead's position on the hoop is one angle θ, measured from the bottom.")}
      </p>
      <Derivation t={t} label={tx(t, "phLag_eqHoop", "The bead's Lagrangian and equation of motion")}
        steps={[
          { tex: r`v^2 = (R\dot\theta)^2 + (\omega R\sin\theta)^2`, why: tx(t, "phLag_h1", "two perpendicular velocities: along the hoop, Rθ̇, and round the vertical axis with the spin, ω times the distance from the axis, R sin θ") },
          { tex: r`L = \tfrac12 m R^2\big(\dot\theta^2 + \omega^2\sin^2\theta\big) + m g R\cos\theta`, why: tx(t, "phLag_h2", "T = ½mv², and V = −mgR cos θ with heights measured from the centre of the hoop") },
          { tex: r`\green{\ddot\theta = \sin\theta\left(\omega^2\cos\theta - \frac{g}{R}\right)}`, why: tx(t, "phLag_h3", "Euler–Lagrange: mR²θ̈ = mR²ω² sin θ cos θ − mgR sin θ, divided by mR²") },
          { tex: r`\sin\theta = 0 \quad\text{or}\quad \cos\theta = \frac{g}{R\,\omega^2}`, why: tx(t, "phLag_h4", "the bead can rest where θ̈ = 0: at the bottom, or, if the right-hand side is less than 1, at an angle off to the side") },
        ]} />
      <p>
        {tx(t, "phLag_hoopResult",
          "The second resting place exists only when g/(Rω²) < 1, that is when ω is above the critical speed ω_c = √(g/R). Below it, the bead sits at the bottom. Above it, the bottom becomes unstable and the bead climbs to the side: a sudden change of behaviour when a smooth control passes a threshold, called a bifurcation. The chaos chapter meets bifurcations again.")}
      </p>
      <BeadHoopFigure t={t} />

      <H2>{tx(t, "phLag_cyclicTitle", "Generalised momentum and cyclic coordinates")}</H2>
      <p>
        {tx(t, "phLag_cyclicBody",
          "The quantity p = ∂L/∂q̇ is the generalised momentum belonging to the coordinate q. For a position x it is the ordinary momentum mẋ; for an angle it is an angular momentum. If L happens not to contain some coordinate at all (only its velocity), the Euler–Lagrange equation for it reads dp/dt = 0: that momentum is conserved. Such a coordinate is called cyclic, or ignorable. Choosing coordinates well can reveal conserved quantities at a glance.")}
      </p>
      <Derivation t={t} label={tx(t, "phLag_eqPlanet", "A planet round the Sun, in polar coordinates r and φ")}
        steps={[
          { tex: r`L = \tfrac12 m\big(\dot r^2 + r^2\dot\varphi^2\big) + \frac{G M m}{r}`, why: tx(t, "phLag_k1", "the velocity has a part along the radius, ṙ, and a part round the circle, rφ̇; the gravitational potential energy is −GMm/r (gravity chapter)") },
          { tex: r`\frac{\partial L}{\partial \varphi} = 0 \;\Rightarrow\; \green{p_\varphi = m r^2\dot\varphi = \text{constant}}`, why: tx(t, "phLag_k2", "L has no φ in it, so φ is cyclic: its momentum, the angular momentum, is conserved, which is Kepler's second law") },
          { tex: r`m\ddot r = m r\dot\varphi^2 - \frac{G M m}{r^2}`, why: tx(t, "phLag_k3", "the r equation: gravity pulls in, and the term mrφ̇² is the familiar centripetal requirement appearing on its own") },
          { tex: r`m\ddot r = \frac{p_\varphi^2}{m r^3} - \frac{G M m}{r^2}`, why: tx(t, "phLag_k4", "put in φ̇ = p_φ/(mr²): a one-dimensional problem in r alone, with an effective outward push that grows as the planet comes close") },
        ]} />

      <H2>{tx(t, "phLag_noetherTitle", "Noether's theorem: symmetry means conservation")}</H2>
      <p>
        {tx(t, "phLag_noetherBody",
          "In 1918 Emmy Noether proved the deepest result of this chapter. Whenever the Lagrangian does not change under a smooth transformation, a symmetry, some quantity is conserved. Shifting all positions by the same amount is a symmetry if space is the same everywhere, and the conserved quantity is total momentum. Rotating everything is a symmetry if space has no preferred direction: angular momentum. Shifting the time is a symmetry if the laws do not change from day to day: energy. The conservation laws of the earlier chapters are not separate facts; they are what the sameness of space and time looks like in mechanics.")}
      </p>
      <LessonTable
        headers={[tx(t, "phLag_nSym", "If the laws do not change when you…"), tx(t, "phLag_nCons", "…this is conserved")]}
        rows={[
          [tx(t, "phLag_n1a", "shift everything to another place"), tx(t, "phLag_n1b", "momentum")],
          [tx(t, "phLag_n2a", "turn everything to another direction"), tx(t, "phLag_n2b", "angular momentum")],
          [tx(t, "phLag_n3a", "run the experiment at another time"), tx(t, "phLag_n3b", "energy")],
          [tx(t, "phLag_n4a", "change the phase of a charged field (electromagnetism)"), tx(t, "phLag_n4b", "electric charge")],
        ]}
      />
      <Equation label={tx(t, "phLag_eqEnergy", "The conserved energy when L has no explicit time")}
        where={[
          [r`h`, tx(t, "phLag_wH", "the energy function; for the usual T quadratic in the velocities it equals T + V")],
          [r`p_i\,\dot q_i`, tx(t, "phLag_wPq", "each generalised momentum times its velocity, summed over the coordinates")],
        ]}
        words={tx(t, "phLag_energyWords", "If time does not appear in L by itself, this combination never changes. For ordinary systems it is just kinetic plus potential energy.")}
        note={tx(t, "phLag_energyNote", "For the bead on the spinning hoop, L has no explicit t, so h is conserved, but h is not T + V there: the motor that spins the hoop keeps feeding energy in and out. The next chapter makes h the star: it is the Hamiltonian.")}>
        {r`h = \sum_i p_i\,\dot q_i - L, \qquad \frac{\partial L}{\partial t} = 0 \;\Rightarrow\; \frac{dh}{dt} = 0`}
      </Equation>
      <Callout type="info" t={t}>
        {tx(t, "phLag_fields", "Lagrangians are how modern physics is written. Electromagnetism, general relativity and the Standard Model of particle physics are each stated as one Lagrangian, and their equations come out of the same stationary-action rule. Choosing which symmetries the Lagrangian must have largely decides what it can contain.")}
      </Callout>

      <H2>{tx(t, "phLag_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phLag_ex1", "1. A block of mass m on a spring of stiffness k: L = ½mẋ² − ½kx². ∂L/∂ẋ = mẋ, ∂L/∂x = −kx, so mẍ = −kx: simple harmonic motion with ω = √(k/m).")}</p>
      <p>{tx(t, "phLag_ex2", "2. An Atwood machine with 3.0 kg and 2.0 kg: ẍ = (3 − 2)/(3 + 2) × 9.8 = 1.96 m/s². From rest, after 1.0 s the masses have moved ½ × 1.96 × 1² = 0.98 m.")}</p>
      <p>{tx(t, "phLag_ex3", "3. A bead on a hoop of radius 0.25 m: ω_c = √(9.8/0.25) = 6.3 rad/s, about one turn per second. Spun at 10 rad/s, it rests at cos θ = 9.8/(0.25 × 100) = 0.39, θ = 67° from the bottom.")}</p>
      <p>{tx(t, "phLag_ex4", "4. A comet's angular momentum p_φ = mr²φ̇ is constant. At 1 AU from the Sun it sweeps round at 2.0 × 10⁻⁷ rad/s; at 0.5 AU r² is four times smaller, so φ̇ is four times larger, 8.0 × 10⁻⁷ rad/s.")}</p>
      <p>{tx(t, "phLag_ex5", "5. A ball rolling in a long straight horizontal gutter: L = ½mẋ², with no x in it. x is cyclic, so mẋ is conserved: it rolls at constant speed. Tilt the gutter and V = mgx sin α brings x back into L; the momentum is no longer conserved.")}</p>

      <H2>{tx(t, "phLag_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phLag_tWrong", "Wrong"), tx(t, "phLag_tRight", "Right"), tx(t, "phLag_tWhy", "Why")]}
        rows={[
          [tx(t, "phLag_m1w", "L = T + V"), tx(t, "phLag_m1r", "L = T − V"), tx(t, "phLag_m1", "T + V is the energy; its stationary paths have gravity pointing the wrong way")],
          [tx(t, "phLag_m2w", "the action is always a minimum"), tx(t, "phLag_m2r", "it is stationary"), tx(t, "phLag_m2", "it is a minimum only for short enough paths; in general it can be a saddle")],
          [tx(t, "phLag_m3w", "T = ½mq̇² for any coordinate"), tx(t, "phLag_m3r", "work out the true speed"), tx(t, "phLag_m3", "for an angle, v = ℓθ̇; on the spinning hoop, the spin adds its own part")],
          [tx(t, "phLag_m4w", "writing T in a rotating frame"), tx(t, "phLag_m4r", "use a non-accelerating frame"), tx(t, "phLag_m4", "the velocities in T must be the real ones; forgetting the hoop's motion loses the effect")],
          [tx(t, "phLag_m5w", "∂L/∂q̇ and dL/dt are the same kind of derivative"), tx(t, "phLag_m5r", "∂ holds the other variables fixed"), tx(t, "phLag_m5", "d/dt follows the motion and changes q and q̇ together")],
          [tx(t, "phLag_m6w", "Lagrange gives the constraint forces"), tx(t, "phLag_m6r", "it removes them"), tx(t, "phLag_m6", "the tension in a pendulum rod never appears; find it afterwards from F = ma if you need it")],
        ]}
      />

      <KeyIdeas t={t} id="phLag" items={[
        "Generalised coordinates describe a system with as few numbers as it needs, one per degree of freedom; constraints are built in.",
        "The Lagrangian is L = T − V; the action S = ∫ L dt adds it over a whole path.",
        "The true motion makes the action stationary, which gives the Euler–Lagrange equation d/dt(∂L/∂q̇) = ∂L/∂q for each coordinate.",
        "The recipe is two energies and some derivatives: no free-body diagram and no unknown constraint forces.",
        "p = ∂L/∂q̇ is the generalised momentum; if L does not contain q, that momentum is conserved.",
        "Noether's theorem: each symmetry gives a conservation law (place → momentum, direction → angular momentum, time → energy).",
      ]} />
    </Article>
  );
}

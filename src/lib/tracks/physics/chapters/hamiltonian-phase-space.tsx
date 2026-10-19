"use client";

// Advanced Mechanics 2: Hamiltonian mechanics and phase space — momentum
// p = ∂L/∂q̇, the Hamiltonian H = Σ p q̇ − L (the Legendre transform) and why
// it is usually T + V, Hamilton's equations derived, energy conservation,
// phase space (states as points, trajectories that never cross), the
// oscillator's ellipse and its area 2πE/ω, the pendulum's phase portrait
// (centre, saddle, separatrix), Liouville's theorem derived (the flow has no
// divergence) with its consequences (no attractors, symplectic integrators,
// statistical mechanics), and Poisson brackets as the road to quantum
// mechanics.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { PhasePortraitFigure } from "@/components/lesson/figures/physics/PhasePortraitFigure";
import { LiouvilleFigure } from "@/components/lesson/figures/physics/LiouvilleFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** A mass on a spring: energy, top momentum and the area of its phase-space ellipse. */
const ellipseNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const E = 0.5 * v.k * v.A * v.A, w = Math.sqrt(v.k / v.m), pmax = Math.sqrt(2 * v.m * E), area = Math.PI * v.A * pmax;
  return {
    tex: r`E = \tfrac12 (${num(v.k, 0)})(${num(v.A, 2)})^2 = \amber{${num(E, 3)}\ \text{J}}, \quad p_{max} = \sqrt{2mE} = ${num(pmax, 3)}, \quad \text{area} = \pi x_{max} p_{max} = \green{${num(area, 3)}} = \frac{2\pi E}{\omega}`,
    meter: Math.min(1, area / 2), meterLabel: `${tx(t, "phHam_liveOmega", "ω = √(k/m)")} = ${num(w, 2)} rad/s`,
  };
};

export function HamiltonianPhaseSpaceContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phHam_intro",
          "Lagrange described motion with positions and velocities. In 1833 William Rowan Hamilton rewrote the same mechanics with positions and momenta, and something unexpected happened: the equations became perfectly symmetric, and motion turned into geometry. Every possible state of a system becomes a point in a space of positions and momenta, phase space, and the laws of motion become a flow that carries each point along, like water in a stream. This picture is the natural language of chaos, of statistical mechanics, and, with one twist, of quantum mechanics. This chapter builds it.")}
      </Lead>

      <Goals t={t} id="phHam" items={[
        "Get the Hamiltonian from a Lagrangian and explain when it equals the total energy.",
        "Derive Hamilton's equations and use them for a spring and a pendulum.",
        "Read a phase portrait: closed orbits, fixed points, the separatrix.",
        "State Liouville's theorem, derive it, and explain what it forbids and why it matters for simulations.",
      ]} />

      <H2>{tx(t, "phHam_fromTitle", "From the Lagrangian to the Hamiltonian")}</H2>
      <p>
        {tx(t, "phHam_fromBody",
          "The previous chapter defined, for each coordinate q, its generalised momentum p = ∂L/∂q̇. Hamilton's step is to use p instead of q̇ as the second variable. For a particle, p = mq̇, so knowing one is knowing the other; but the momentum turns out to be the better choice. The function that replaces the Lagrangian is the energy function h from Noether's theorem, now written in terms of q and p and called the Hamiltonian.")}
      </p>
      <Equation label={tx(t, "phHam_eqH", "The Hamiltonian")}
        where={[
          [r`H`, tx(t, "phHam_wH", "the Hamiltonian, a function of the coordinates q, the momenta p and possibly time (J)")],
          [r`p_i`, tx(t, "phHam_wP", "the generalised momentum of coordinate i, p_i = ∂L/∂q̇_i")],
          [r`\dot q_i`, tx(t, "phHam_wQd", "the generalised velocity, written in terms of the p's before substituting")],
          [r`L`, tx(t, "phHam_wL", "the Lagrangian T − V")],
        ]}
        words={tx(t, "phHam_hWords", "Multiply each momentum by its velocity, add them up, subtract the Lagrangian, and express the result using positions and momenta only.")}
        note={tx(t, "phHam_hNote", "This swap of variables, from q̇ to p = ∂L/∂q̇, is called a Legendre transform. The same operation turns energy into the other thermodynamic potentials, such as the free energy of the statistical mechanics chapter.")}>
        {r`H(q, p, t) = \sum_i p_i\,\dot q_i - L`}
      </Equation>
      <Derivation t={t} label={tx(t, "phHam_eqTV", "For a particle in a potential, H is the total energy")}
        steps={[
          { tex: r`L = \tfrac12 m\dot q^2 - V(q), \qquad p = \frac{\partial L}{\partial \dot q} = m\dot q`, why: tx(t, "phHam_tv1", "the usual Lagrangian, and its momentum") },
          { tex: r`\dot q = \frac{p}{m}`, why: tx(t, "phHam_tv2", "solve for the velocity in terms of the momentum") },
          { tex: r`H = p\,\frac{p}{m} - \left(\frac{p^2}{2m} - V\right)`, why: tx(t, "phHam_tv3", "substitute into p q̇ − L") },
          { tex: r`\green{H = \frac{p^2}{2m} + V(q)}`, why: tx(t, "phHam_tv4", "kinetic plus potential energy, with the kinetic part written through the momentum") },
        ]} />
      <p>
        {tx(t, "phHam_tvNote",
          "The same holds whenever the kinetic energy is quadratic in the velocities and the coordinates do not move by themselves: H = T + V. It fails when a constraint is driven from outside, like the motor-driven hoop of the previous chapter.")}
      </p>

      <H2>{tx(t, "phHam_eqsTitle", "Hamilton's equations")}</H2>
      <Derivation t={t} label={tx(t, "phHam_eqDerive", "Where the two equations come from")}
        steps={[
          { tex: r`dH = \dot q\,dp + p\,d\dot q - \frac{\partial L}{\partial q}dq - \frac{\partial L}{\partial \dot q}d\dot q - \frac{\partial L}{\partial t}dt`, why: tx(t, "phHam_e1", "the small change in H = p q̇ − L when every variable changes a little (product rule on p q̇, chain rule on L)") },
          { tex: r`p\,d\dot q - \frac{\partial L}{\partial \dot q}d\dot q = 0`, why: tx(t, "phHam_e2", "since p = ∂L/∂q̇, the two dq̇ terms cancel: H really does not depend on q̇, only on q, p and t") },
          { tex: r`dH = \dot q\,dp - \dot p\,dq - \frac{\partial L}{\partial t}dt`, why: tx(t, "phHam_e3", "Euler–Lagrange says ∂L/∂q = d/dt(∂L/∂q̇) = ṗ") },
          { tex: r`\green{\dot q = \frac{\partial H}{\partial p}, \qquad \dot p = -\frac{\partial H}{\partial q}}`, why: tx(t, "phHam_e4", "compare with dH = (∂H/∂q) dq + (∂H/∂p) dp + (∂H/∂t) dt, term by term") },
        ]} />
      <Equation label={tx(t, "phHam_eqHam", "Hamilton's equations, for each coordinate")}
        where={[
          [r`\dot q_i`, tx(t, "phHam_wQdot", "how fast the coordinate changes")],
          [r`\dot p_i`, tx(t, "phHam_wPdot", "how fast its momentum changes")],
          [r`\frac{\partial H}{\partial p_i},\ \frac{\partial H}{\partial q_i}`, tx(t, "phHam_wDer", "how H changes with that momentum, or with that coordinate, holding everything else fixed")],
        ]}
        words={tx(t, "phHam_eqsWords", "The coordinate moves at the rate the Hamiltonian changes with momentum; the momentum changes at minus the rate the Hamiltonian changes with position.")}
        note={tx(t, "phHam_eqsNote", "Lagrange gives one second-order equation per coordinate; Hamilton gives two first-order equations. Same physics, but now the state is just the list of all q's and p's, and the equations say how that list changes in the next instant. That is exactly the form a computer integrates.")}>
        {r`\dot q_i = \frac{\partial H}{\partial p_i}, \qquad \dot p_i = -\frac{\partial H}{\partial q_i}`}
      </Equation>
      <Derivation t={t} label={tx(t, "phHam_eqSpring", "Check: a mass on a spring")}
        steps={[
          { tex: r`H = \frac{p^2}{2m} + \tfrac12 k x^2`, why: tx(t, "phHam_sp1", "kinetic plus spring energy") },
          { tex: r`\dot x = \frac{\partial H}{\partial p} = \frac{p}{m}, \qquad \dot p = -\frac{\partial H}{\partial x} = -k x`, why: tx(t, "phHam_sp2", "the first says momentum is mass times velocity; the second is Hooke's law") },
          { tex: r`\green{m\ddot x = -k x}`, why: tx(t, "phHam_sp3", "put them together: simple harmonic motion again") },
        ]} />
      <H3>{tx(t, "phHam_consTitle", "Energy conservation in one line")}</H3>
      <p>
        {tx(t, "phHam_consBody",
          "Follow H along a motion: dH/dt = (∂H/∂q) q̇ + (∂H/∂p) ṗ + ∂H/∂t. Put in Hamilton's equations: the first two terms are (∂H/∂q)(∂H/∂p) − (∂H/∂p)(∂H/∂q) = 0. So dH/dt = ∂H/∂t: if H does not contain time explicitly, it never changes. Energy conservation is built into the shape of the equations.")}
      </p>

      <H2>{tx(t, "phHam_phaseTitle", "Phase space")}</H2>
      <p>
        {tx(t, "phHam_phaseBody",
          "For one coordinate, draw q across and p up. Each point of this plane is one complete state: where the system is and how it is moving. Hamilton's equations give, at every point, a little arrow (q̇, ṗ) saying where the state goes next, and a motion is a curve that follows the arrows. Two such curves can never cross or touch: at a crossing the state would have two different futures, and the equations give only one. Since H is conserved, each curve stays on a contour of H, a line of constant energy, like a walker who never changes height on a hillside map.")}
      </p>
      <Derivation t={t} label={tx(t, "phHam_eqEllipse", "The spring's phase curve is an ellipse")}
        steps={[
          { tex: r`\frac{p^2}{2m} + \frac{k x^2}{2} = E`, why: tx(t, "phHam_el1", "the state stays where H equals its starting energy E") },
          { tex: r`\frac{x^2}{x_{max}^2} + \frac{p^2}{p_{max}^2} = 1, \quad x_{max} = \sqrt{\frac{2E}{k}},\ p_{max} = \sqrt{2mE}`, why: tx(t, "phHam_el2", "divide by E: the equation of an ellipse with these half-widths, the amplitude and the top momentum") },
          { tex: r`\green{\text{area} = \pi\,x_{max}\,p_{max} = \frac{2\pi E}{\omega}}`, why: tx(t, "phHam_el3", "the area of an ellipse is π times its half-widths; with ω = √(k/m) this is 2πE/ω") },
        ]} />
      <LiveFormula label={tx(t, "phHam_liveEllipse", "Try it: a spring's ellipse in phase space")}
        tex={r`\text{area} = \pi\,x_{max}\,p_{max} = \frac{2\pi E}{\omega}`}
        vars={[
          { id: "m", label: "m (kg)", min: 0.1, max: 4, step: 0.1, value: 1, fmt: v => `${num(v, 1)} kg` },
          { id: "k", label: "k (N/m)", min: 1, max: 100, step: 1, value: 25, fmt: v => `${num(v, 0)} N/m` },
          { id: "A", label: tx(t, "phHam_liveAmp", "amplitude (m)"), min: 0.02, max: 0.4, step: 0.01, value: 0.2, fmt: v => `${num(v, 2)} m` },
        ]}
        compute={ellipseNumbers(t)}
        note={tx(t, "phHam_liveNote", "Double the amplitude and the energy goes up four times, and so does the area. The area divided by 2π is the energy divided by the frequency. In the early quantum theory this area could only come in whole multiples of Planck's constant h, which gives Planck's rule E = nhf for oscillators (the full theory later shifts it by half a step, to (n + ½)hf).")} />

      <H2>{tx(t, "phHam_pendTitle", "The pendulum's phase portrait")}</H2>
      <p>
        {tx(t, "phHam_pendBody",
          "For a pendulum, q is the angle and p the angular momentum mℓ²θ̇, and H = p²/(2mℓ²) − mgℓ cos q. Its contours split phase space into regions with different kinds of motion. Near the bottom, small closed ovals: ordinary swings. Higher energies give bigger ovals, no longer ellipses. Above a certain energy the pendulum has enough to pass over the top, and the curves no longer close: it whirls round and round. The boundary between the two, the separatrix, is the motion that just reaches the top and balances there, taking forever to arrive.")}
      </p>
      <PhasePortraitFigure t={t} />
      <LessonTable
        headers={[tx(t, "phHam_fpPoint", "Point"), tx(t, "phHam_fpKind", "Kind"), tx(t, "phHam_fpWhat", "What nearby states do")]}
        rows={[
          [tx(t, "phHam_fp1a", "q = 0, p = 0 (hanging down)"), tx(t, "phHam_fp1b", "centre, stable"), tx(t, "phHam_fp1c", "circle round it for ever: small swings")],
          [tx(t, "phHam_fp2a", "q = ±180°, p = 0 (balanced on top)"), tx(t, "phHam_fp2b", "saddle, unstable"), tx(t, "phHam_fp2c", "come in along two directions and leave along two others: the slightest error and it falls")],
        ]}
      />

      <H2>{tx(t, "phHam_liouTitle", "Liouville's theorem")}</H2>
      <p>
        {tx(t, "phHam_liouBody",
          "Instead of one starting state, take a whole patch of them, a small blob of phase space, and let each point move by Hamilton's equations. The blob moves and changes shape, often wildly. Joseph Liouville proved in 1838 that its area never changes (with more coordinates, its volume). The phase-space flow behaves like an incompressible fluid.")}
      </p>
      <Derivation t={t} label={tx(t, "phHam_eqLiou", "Why the area is conserved: the flow has no divergence")}
        steps={[
          { tex: r`\mathbf{u} = (\dot q,\ \dot p) = \left(\frac{\partial H}{\partial p},\ -\frac{\partial H}{\partial q}\right)`, why: tx(t, "phHam_l1", "the velocity of the flow at each point of phase space") },
          { tex: r`\frac{dA}{dt} = \iint \nabla\cdot\mathbf{u}\; dq\,dp`, why: tx(t, "phHam_l2", "a patch grows at a rate given by the divergence of the flow inside it: how much the flow spreads out at each point (Math track, vector fields, divergence and curl)") },
          { tex: r`\nabla\cdot\mathbf{u} = \frac{\partial}{\partial q}\frac{\partial H}{\partial p} - \frac{\partial}{\partial p}\frac{\partial H}{\partial q}`, why: tx(t, "phHam_l3", "the divergence is ∂q̇/∂q + ∂ṗ/∂p") },
          { tex: r`\green{\nabla\cdot\mathbf{u} = 0 \;\Rightarrow\; \frac{dA}{dt} = 0}`, why: tx(t, "phHam_l4", "the two mixed derivatives of H are equal, so they cancel at every point") },
        ]} />
      <LiouvilleFigure t={t} />
      <p>
        {tx(t, "phHam_liouUse",
          "Three consequences. First, a Hamiltonian system can have no attractor: nothing can shrink a whole region onto a single resting point, because that would squeeze area to zero. A real pendulum does settle at the bottom, but only because friction is at work, and friction is not part of a Hamiltonian; it removes energy into the many hidden coordinates of the air and the pivot. Second, statistical mechanics relies on it: if states are spread evenly over a region of phase space, they stay spread evenly as the system evolves, which is why all accessible states can be treated as equally likely. Third, computer simulations: integrators that keep phase-space area exactly, called symplectic (leapfrog, Verlet), do not slowly gain or lose energy, so planets stay on their orbits for billions of simulated years. The Game Dev track's chapter on integrators (Euler, Verlet and RK4) shows the same difference in code.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phHam_recur", "Liouville's theorem has a strange consequence, proved by Henri Poincaré: a bounded Hamiltonian system will come back arbitrarily close to its starting state, again and again. For the air in a room the waiting time is far longer than the age of the universe, which is why nobody has seen the air all gather in one corner, and why the second law of the statistical mechanics chapter is statistical, not absolute.")}
      </Callout>

      <H2>{tx(t, "phHam_poissonTitle", "Poisson brackets and the road to quantum mechanics")}</H2>
      <p>
        {tx(t, "phHam_poissonBody",
          "Any quantity F(q, p) changes along a motion as dF/dt = (∂F/∂q) q̇ + (∂F/∂p) ṗ. With Hamilton's equations this is (∂F/∂q)(∂H/∂p) − (∂F/∂p)(∂H/∂q), a combination called the Poisson bracket {F, H}. So dF/dt = {F, H}: to know how anything changes, take its bracket with the energy. A quantity whose bracket with H is zero is conserved. The bracket of position with momentum is the simplest of all: {q, p} = 1.")}
      </p>
      <p>
        {tx(t, "phHam_quantum",
          "In 1925 Paul Dirac noticed that quantum mechanics has exactly the same structure, with each bracket replaced by a commutator divided by iħ. {q, p} = 1 becomes qp − pq = iħ: in quantum mechanics position and momentum cannot both be sharp, which is the uncertainty principle. The Hamiltonian survives untouched as the quantity that drives change in time, in Schrödinger's equation. The quantum chapters later in this track start from here.")}
      </p>

      <H2>{tx(t, "phHam_compareTitle", "Newton, Lagrange, Hamilton side by side")}</H2>
      <LessonTable
        headers={["", "Newton", "Lagrange", "Hamilton"]}
        rows={[
          [tx(t, "phHam_c1", "basic quantity"), tx(t, "phHam_c1n", "forces (vectors)"), "L = T − V", "H = T + V"],
          [tx(t, "phHam_c2", "variables"), tx(t, "phHam_c2n", "positions"), "q, q̇", "q, p"],
          [tx(t, "phHam_c3", "equations"), tx(t, "phHam_c3n", "second order, F = ma"), tx(t, "phHam_c3l", "second order, one per coordinate"), tx(t, "phHam_c3h", "first order, two per coordinate")],
          [tx(t, "phHam_c4", "best for"), tx(t, "phHam_c4n", "simple systems, contact forces, friction"), tx(t, "phHam_c4l", "constraints, odd coordinates, fields"), tx(t, "phHam_c4h", "geometry of motion, chaos, statistical and quantum physics")],
        ]}
      />

      <H2>{tx(t, "phHam_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phHam_ex1", "1. A 0.50 kg ball thrown up: H = p²/(2 × 0.50) + 0.50 × 9.8 × y. Hamilton's equations give ẏ = p/0.50 and ṗ = −4.9 N: the momentum falls by 4.9 kg·m/s every second, which is gravity's pull.")}</p>
      <p>{tx(t, "phHam_ex2", "2. A 1.0 kg mass on a 25 N/m spring with amplitude 0.20 m: E = ½ × 25 × 0.04 = 0.50 J, p_max = √(2 × 1.0 × 0.50) = 1.0 kg·m/s, and the ellipse has area π × 0.20 × 1.0 = 0.63 J·s = 2πE/ω with ω = 5 rad/s.")}</p>
      <p>{tx(t, "phHam_ex3", "3. A pendulum of length 1.0 m: to go over the top it needs at least the energy 2mgℓ above the bottom, so a speed at the bottom of √(4gℓ) = √(4 × 9.8 × 1.0) = 6.3 m/s. Started at the bottom with 6.0 m/s it swings; with 6.5 m/s it whirls round.")}</p>
      <p>{tx(t, "phHam_ex4", "4. A Poisson bracket: for H = p²/2m + ½kx², the momentum changes as {p, H} = −∂H/∂x = −kx, and the energy as {H, H} = 0: conserved.")}</p>

      <H2>{tx(t, "phHam_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phHam_tWrong", "Wrong"), tx(t, "phHam_tRight", "Right"), tx(t, "phHam_tWhy", "Why")]}
        rows={[
          [tx(t, "phHam_m1w", "H is always T + V"), tx(t, "phHam_m1r", "H = Σ p q̇ − L"), tx(t, "phHam_m1", "they agree only for ordinary systems; a driven constraint breaks it")],
          [tx(t, "phHam_m2w", "writing H with q̇ in it"), tx(t, "phHam_m2r", "replace q̇ by p first"), tx(t, "phHam_m2", "Hamilton's equations need H as a function of q and p")],
          [tx(t, "phHam_m3w", "both equations have a minus sign"), tx(t, "phHam_m3r", "only ṗ = −∂H/∂q does"), tx(t, "phHam_m3", "the sign difference is what makes areas conserved")],
          [tx(t, "phHam_m4w", "phase curves can cross"), tx(t, "phHam_m4r", "they never do"), tx(t, "phHam_m4", "a state has exactly one future; the pendulum's separatrix only approaches the saddle")],
          [tx(t, "phHam_m5w", "Liouville: the blob keeps its shape"), tx(t, "phHam_m5r", "it keeps its area"), tx(t, "phHam_m5", "the shape can be stretched into a thin filament")],
          [tx(t, "phHam_m6w", "a pendulum settling down breaks Liouville"), tx(t, "phHam_m6r", "friction is not Hamiltonian"), tx(t, "phHam_m6", "the theorem applies to the whole system including the air, not to the pendulum alone")],
        ]}
      />

      <KeyIdeas t={t} id="phHam" items={[
        "The Hamiltonian H = Σ p q̇ − L is a function of positions and momenta; for ordinary systems it is the total energy T + V.",
        "Hamilton's equations, q̇ = ∂H/∂p and ṗ = −∂H/∂q, give two first-order equations per coordinate.",
        "If H does not contain time, it is conserved; a motion follows a contour of H in phase space.",
        "Phase-space curves never cross; the pendulum's portrait has a stable centre, an unstable saddle and a separatrix between swinging and whirling.",
        "Liouville's theorem: the flow keeps phase-space areas, so there are no attractors without friction, and symplectic integrators do not drift.",
        "Poisson brackets give dF/dt = {F, H}, with {q, p} = 1; quantum mechanics replaces them by commutators, qp − pq = iħ.",
      ]} />
    </Article>
  );
}

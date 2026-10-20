"use client";

// Quantum foundations 3: the Schrödinger equation — built from a plane wave
// with E = ħω and p = ħk, stationary states by separation of variables, the
// particle in a box solved (sin(nπx/L), Eₙ = n²h²/8mL², zero-point energy,
// quantum dots), superpositions and measurement, the forbidden region and
// tunnelling (e^(−2κa), alpha decay, the scanning tunnelling microscope,
// fusion in the Sun, flash memory), and the harmonic oscillator's evenly
// spaced ladder (n + ½)ħω, which closes the loop with Planck.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation, Tex } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BoxFigure } from "@/components/lesson/figures/physics/BoxFigure";
import { TunnelFigure } from "@/components/lesson/figures/physics/TunnelFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Energy levels of an electron in a box of width L. */
const boxNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const E1 = 0.376 / (v.L * v.L), E = v.n * v.n * E1;
  const lam = 1240 / ((2 * v.n + 1) * E1);              // photon for the jump n → n + 1
  return {
    tex: r`E_{${num(v.n, 0)}} = ${num(v.n, 0)}^2 \times \frac{0.376\ \text{eV}}{(${num(v.L, 2)})^2} = \amber{${num(E, 3)}\ \text{eV}}, \quad E_{${num(v.n + 1, 0)}} - E_{${num(v.n, 0)}} = ${num((2 * v.n + 1) * E1, 3)}\ \text{eV} \;\to\; \lambda = \green{${num(lam, 0)}\ \text{nm}}`,
    meter: Math.min(1, E / 10), meterLabel: `${tx(t, "phSch_liveJump", "light from the jump to the next level")}: ${num(lam, 0)} nm`,
  };
};

/** Tunnelling chance of an electron through a barrier, T ≈ e^(−2κa). */
const tunnelNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const kappa = 5.123 * Math.sqrt(v.U), T = Math.exp(-2 * kappa * v.a);
  const e = Math.floor(Math.log10(T)), m = T / 10 ** e;
  return {
    tex: r`\kappa = \frac{\sqrt{2 m_e \cdot ${num(v.U, 1)}\ \text{eV}}}{\hbar} = ${num(kappa, 2)}\ \text{nm}^{-1}, \quad T \approx e^{-2 \times ${num(kappa, 2)} \times ${num(v.a, 2)}} = \amber{${e >= -2 ? num(T, 4) : `${num(m, 2)}\\times10^{${e}}`}}`,
    meter: Math.min(1, Math.max(0, 1 + Math.log10(T) / 12)), meterLabel: `${tx(t, "phSch_liveT", "chance to get through")}: ${e >= -2 ? `${num(T * 100, 2)}%` : `1 ${tx(t, "phSch_liveIn", "in")} ${num(1 / T, 0)}`}`,
  };
};

export function SchrodingerContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phSch_intro",
          "If a particle is described by a wave, something must say how that wave moves, the way Newton's second law says how a ball moves. In the winter of 1925, on holiday in the Alps, Erwin Schrödinger found the equation. Feed it the forces acting on a particle and it tells you how the particle's wavefunction changes in time; ask it which waves stay unchanged and it hands back the allowed energies. Two consequences make up most of this chapter. Confine a wave and only certain energies are possible: energy comes in levels, not because anybody imposed packets, but because waves must fit. And a wave that meets a wall it cannot climb does not stop dead: some of it leaks through, so particles tunnel through barriers, which is how the Sun shines and how some microscopes see single atoms.")}
      </Lead>

      <Goals t={t} id="phSch" items={[
        "Build the Schrödinger equation from E = ħω, p = ħk and the energy of a particle, and say what each term means.",
        "Solve the particle in a box: wavefunctions, the energies Eₙ = n²h²/8mL², and why the lowest is not zero.",
        "Explain stationary states and why superpositions of levels move.",
        "Estimate tunnelling through a barrier with T ≈ e^(−2κa) and name real devices that rely on it.",
      ]} />

      <H2>{tx(t, "phSch_eqTitle", "The equation for a matter wave")}</H2>
      <p>
        {tx(t, "phSch_eqBody",
          "Start with the simplest matter wave, a free particle with an exact momentum: ψ = e^(i(kx − ωt)), a complex wave (the complex numbers chapter of the Math track: e^(iθ) = cos θ + i sin θ). From the last two chapters, its momentum is p = ħk and its energy E = ħω. Look for an equation that this wave obeys and that, at the same time, says energy = kinetic + potential.")}
      </p>
      <Derivation t={t} label={tx(t, "phSch_eqDer", "Guessing the equation from a plane wave")}
        steps={[
          { tex: r`i\hbar\,\frac{\partial \psi}{\partial t} = i\hbar\,(-i\omega)\,\psi = \hbar\omega\,\psi = E\,\psi`, why: tx(t, "phSch_e1", "differentiating e^(−iωt) in time brings down −iω; multiplied by iħ that is ħω, the energy. So iħ ∂/∂t measures energy") },
          { tex: r`-\frac{\hbar^2}{2m}\,\frac{\partial^2 \psi}{\partial x^2} = -\frac{\hbar^2}{2m}\,(ik)^2\,\psi = \frac{(\hbar k)^2}{2m}\,\psi = \frac{p^2}{2m}\,\psi`, why: tx(t, "phSch_e2", "differentiating e^(ikx) twice in space brings down (ik)² = −k²; with −ħ²/2m in front, that is p²/2m, the kinetic energy") },
          { tex: r`E = \frac{p^2}{2m} + V \;\to\; \green{i\hbar\,\frac{\partial \psi}{\partial t} = -\frac{\hbar^2}{2m}\,\frac{\partial^2 \psi}{\partial x^2} + V(x)\,\psi}`, why: tx(t, "phSch_e3", "write total energy = kinetic + potential with each energy replaced by what measures it. Schrödinger's leap was to assume this holds for every wavefunction and every potential, not only for the free wave") },
        ]} />
      <Equation label={tx(t, "phSch_eqTdse", "The Schrödinger equation (one dimension)")}
        where={[
          [r`\psi(x, t)`, tx(t, "phSch_wPsi", "the wavefunction; |ψ|² is the probability density (Born's rule)")],
          [r`i`, tx(t, "phSch_wI", "the imaginary unit, i² = −1: it makes the wave turn instead of decay, which is what keeps the total probability equal to 1")],
          [r`\hbar`, tx(t, "phSch_wHbar", "Planck's constant over 2π, 1.055 × 10⁻³⁴ J·s")],
          [r`m`, tx(t, "phSch_wM", "the particle's mass")],
          [r`\frac{\partial^2\psi}{\partial x^2}`, tx(t, "phSch_wCurv", "the curvature of the wave: sharply bent waves have short wavelengths, so lots of kinetic energy")],
          [r`V(x)`, tx(t, "phSch_wV", "the potential energy at each point, which is how forces enter (a wall, a nucleus's pull, a spring)")],
        ]}
        words={tx(t, "phSch_tdseWords", "How fast the wave turns at each point is set by its kinetic energy (its curvature) plus its potential energy there.")}
        note={tx(t, "phSch_tdseNote", "It is a partial differential equation, first order in time and second in space, like the heat equation, but with an i in front of the time derivative. The PDE chapter of the Math track showed what that i does: instead of spreading out and fading like heat, the modes rotate and keep their size. The equation is not derived from anything deeper; it is the rule, and its predictions have been checked for a century.")}>
        {r`i\hbar\,\frac{\partial \psi}{\partial t} = -\frac{\hbar^2}{2m}\,\frac{\partial^2 \psi}{\partial x^2} + V(x)\,\psi`}
      </Equation>
      <H3>{tx(t, "phSch_statTitle", "Stationary states")}</H3>
      <p>
        {tx(t, "phSch_statBody",
          "Most questions are about states of definite energy. Try ψ(x, t) = φ(x)·e^(−iEt/ħ): a fixed shape φ(x) whose phase turns at the rate E/ħ. Put it in the equation, cancel the common factor, and what is left has no time in it.")}
      </p>
      <Equation label={tx(t, "phSch_eqTise", "The time-independent Schrödinger equation")}
        where={[
          [r`\varphi(x)`, tx(t, "phSch_wPhi", "the shape of the wave in a state of definite energy")],
          [r`E`, tx(t, "phSch_wE", "that energy: only some values of E allow a sensible solution (one that stays finite and fits the boundaries), and they are the energy levels")],
        ]}
        words={tx(t, "phSch_tiseWords", "Find the wave shapes that, after counting kinetic and potential energy, give back the same shape times a single number, the energy.")}
        note={tx(t, "phSch_tiseNote", "These are stationary states: |ψ|² = |φ|² does not change in time, because the phase factor has size 1. An atom in a stationary state does not radiate, which answers the third puzzle of the first chapter, as the next chapter shows.")}>
        {r`-\frac{\hbar^2}{2m}\,\frac{d^2 \varphi}{dx^2} + V(x)\,\varphi = E\,\varphi`}
      </Equation>

      <H2>{tx(t, "phSch_boxTitle", "A particle in a box")}</H2>
      <p>
        {tx(t, "phSch_boxBody",
          "The simplest problem with a real answer: a particle that moves freely between x = 0 and x = L, with walls it can never pass (V = 0 inside, infinite outside). Outside, ψ must be zero. A wave cannot jump, so ψ must also be zero right at both walls.")}
      </p>
      <Derivation t={t} label={tx(t, "phSch_boxDer", "Solving the box")}
        steps={[
          { tex: r`\frac{d^2\varphi}{dx^2} = -k^2 \varphi, \qquad k = \frac{\sqrt{2 m E}}{\hbar}`, why: tx(t, "phSch_b1", "inside, V = 0, so the equation says the curvature is minus a constant times φ: the equation of simple harmonic motion, now in space instead of time") },
          { tex: r`\varphi = A \sin kx + B \cos kx, \qquad \varphi(0) = 0 \Rightarrow B = 0`, why: tx(t, "phSch_b2", "its solutions are sines and cosines; the cosine is 1 at x = 0, so it must go") },
          { tex: r`\varphi(L) = A \sin kL = 0 \;\Rightarrow\; kL = n\pi, \quad n = 1, 2, 3, \dots`, why: tx(t, "phSch_b3", "the sine must also vanish at the far wall, which only happens when a whole number of half-wavelengths fits in the box (n = 0 gives φ = 0 everywhere: no particle)") },
          { tex: r`\green{E_n = \frac{\hbar^2 k^2}{2m} = \frac{n^2 \pi^2 \hbar^2}{2 m L^2} = \frac{n^2 h^2}{8 m L^2}}`, why: tx(t, "phSch_b4", "put k = nπ/L back into E = ħ²k²/2m, and use ħ = h/2π") },
          { tex: r`\varphi_n(x) = \sqrt{\frac{2}{L}}\,\sin\frac{n\pi x}{L}`, why: tx(t, "phSch_b5", "A is fixed by requiring a total probability of 1: the average of sin² is ½, so A²·L/2 = 1") },
        ]} />
      <BoxFigure t={t} />
      <Equation label={tx(t, "phSch_eqBox", "Energy levels in a box")}
        where={[
          [r`n`, tx(t, "phSch_wN", "the quantum number, 1, 2, 3, …: the number of half-waves that fit, and one more than the number of nodes (points inside where ψ = 0)")],
          [r`L`, tx(t, "phSch_wL", "the width of the box")],
          [r`m`, tx(t, "phSch_wM2", "the particle's mass; for an electron h²/8m = 0.376 eV·nm², so E₁ = 0.376 eV / L² with L in nm")],
        ]}
        words={tx(t, "phSch_boxWords", "Only energies proportional to 1, 4, 9, 16… are allowed, and a smaller box or a lighter particle pushes them all up.")}
        note={tx(t, "phSch_boxNote", "The lowest energy, E₁, is not zero: a confined particle can never be at rest. That zero-point energy is the uncertainty principle at work: squeezing the particle into Δx ≈ L forces a spread of momentum Δp ≳ ħ/2L, and with it kinetic energy. It is why liquid helium does not freeze at ordinary pressure, even at absolute zero.")}>
        {r`E_n = \frac{n^2 h^2}{8 m L^2}`}
      </Equation>
      <LiveFormula label={tx(t, "phSch_liveBox", "Try it: an electron in a box")}
        tex={r`E_n = n^2\,\frac{h^2}{8 m_e L^2}, \qquad \lambda = \frac{hc}{E_{n+1} - E_n}`}
        vars={[
          { id: "L", label: tx(t, "phSch_liveL", "box width L (nm)"), min: 0.3, max: 5, step: 0.05, value: 0.7, fmt: v => `${num(v, 2)} nm` },
          { id: "n", label: tx(t, "phSch_liveN", "level n"), min: 1, max: 6, step: 1, value: 1, fmt: v => num(v, 0) },
        ]}
        compute={boxNumbers(t)}
        note={tx(t, "phSch_liveBoxNote", "Around 0.6 to 0.8 nm, the light from the jump between the lowest two levels falls in the visible band. That is the idea behind quantum dots: semiconductor crystals a few nanometres across whose colour is set by their size, smaller dots glowing bluer. They light up some QLED TV screens, and their discovery won the 2023 Nobel Prize in chemistry. Real dots are 3D and the electron's mass inside a crystal is not its free mass, so their sizes differ from this simple box.")} />
      <H3>{tx(t, "phSch_supTitle", "Superpositions and measurement")}</H3>
      <p>
        {tx(t, "phSch_supBody",
          "The Schrödinger equation is linear: if ψ₁ and ψ₂ are solutions, so is any mix aψ₁ + bψ₂. A mix of two levels is not a state of definite energy. Its two parts turn at different rates, E₁/ħ and E₂/ħ, so they drift in and out of step and |ψ|² sloshes back and forth with period h/(E₂ − E₁), as the figure shows. Measure the energy of such a state and you get E₁ or E₂, never anything in between, with chances |a|² and |b|²; right after the measurement the state is the level you found. How and why that happens, the measurement problem, is still argued about. The rules for using it are not.")}
      </p>

      <H2>{tx(t, "phSch_tunTitle", "Through the wall: tunnelling")}</H2>
      <p>
        {tx(t, "phSch_tunBody",
          "Real walls are not infinitely high. Where the potential energy V is larger than the particle's energy E, a classical particle can never go: its kinetic energy would be negative. The wave equation does not forbid it. There, E − V is negative, so the curvature has the same sign as φ, and instead of oscillating the wave bends away from the axis: it grows or decays exponentially.")}
      </p>
      <Derivation t={t} label={tx(t, "phSch_tunDer", "Inside a barrier")}
        steps={[
          { tex: r`\frac{d^2\varphi}{dx^2} = \frac{2m(V - E)}{\hbar^2}\,\varphi = \kappa^2 \varphi`, why: tx(t, "phSch_t1", "rearrange the time-independent equation; with V > E the constant κ² = 2m(V − E)/ħ² is positive") },
          { tex: r`\varphi \approx A\,e^{-\kappa x}`, why: tx(t, "phSch_t2", "the solutions are e^(κx) and e^(−κx); inside a thick barrier the decaying one wins (the growing one would only matter near the far edge)") },
          { tex: r`\green{T \approx \frac{|\varphi(a)|^2}{|\varphi(0)|^2} = e^{-2\kappa a}}`, why: tx(t, "phSch_t3", "the chance of coming out the other side of a barrier of width a is roughly the drop of |φ|² across it. The exact formula for a rectangular barrier has a factor in front, of order 1") },
        ]} />
      <Equation label={tx(t, "phSch_eqTun", "Tunnelling through a barrier")}
        where={[
          [r`T`, tx(t, "phSch_wT", "the transmission: the chance that the particle gets through")],
          [r`\kappa`, tx(t, "phSch_wKappa", "how fast the wave dies inside the barrier; for an electron, κ = 5.12 nm⁻¹ × √(V − E in eV)")],
          [r`a`, tx(t, "phSch_wA", "the barrier's thickness")],
        ]}
        words={tx(t, "phSch_tunWords", "A particle can cross a barrier too high to climb, with a chance that falls exponentially with the barrier's thickness and with the square root of the missing energy.")}>
        {r`T \approx e^{-2\kappa a}, \qquad \kappa = \frac{\sqrt{2 m (V_0 - E)}}{\hbar}`}
      </Equation>
      <TunnelFigure t={t} />
      <LiveFormula label={tx(t, "phSch_liveTun", "Try it: an electron and a thin gap")}
        tex={r`T \approx e^{-2\kappa a}, \qquad \kappa = 5.12\ \text{nm}^{-1}\sqrt{V_0 - E\ \text{(eV)}}`}
        vars={[
          { id: "U", label: tx(t, "phSch_liveU", "missing energy V₀ − E (eV)"), min: 0.1, max: 10, step: 0.1, value: 4, fmt: v => `${num(v, 1)} eV` },
          { id: "a", label: tx(t, "phSch_liveA", "gap width a (nm)"), min: 0.05, max: 2, step: 0.01, value: 0.5, fmt: v => `${num(v, 2)} nm` },
        ]}
        compute={tunnelNumbers(t)}
        note={tx(t, "phSch_liveTunNote", "With 4 eV missing, about the work function of a metal, each extra 0.1 nm of gap cuts the chance by a factor of about 8. A scanning tunnelling microscope holds a sharp tip a few tenths of a nanometre above a surface; the tunnelling current is so sensitive to the gap that it maps single atoms.")} />
      <LessonTable
        headers={[tx(t, "phSch_tWhere", "Where"), tx(t, "phSch_tWhat", "What tunnels"), tx(t, "phSch_tResult", "Result")]}
        rows={[
          [tx(t, "phSch_a1", "alpha decay"), tx(t, "phSch_a1t", "an alpha particle out of a nucleus, through the barrier of the strong and electric forces (Gamow, 1928)"), tx(t, "phSch_a1r", "half-lives from microseconds to billions of years, from small changes in energy")],
          [tx(t, "phSch_a2", "the Sun"), tx(t, "phSch_a2t", "protons into each other, through their electric repulsion"), tx(t, "phSch_a2r", "the core is about 1000 times too cold for protons to touch classically; tunnelling makes fusion, and sunlight, possible")],
          [tx(t, "phSch_a3", "scanning tunnelling microscope"), tx(t, "phSch_a3t", "electrons between a sharp tip and a surface"), tx(t, "phSch_a3r", "images of single atoms (Binnig and Rohrer, Nobel Prize 1986)")],
          [tx(t, "phSch_a4", "flash memory"), tx(t, "phSch_a4t", "electrons through a thin oxide layer onto an insulated gate"), tx(t, "phSch_a4r", "every USB stick and SSD stores its bits this way")],
        ]}
      />

      <H2>{tx(t, "phSch_oscTitle", "Back to Planck: the quantum oscillator")}</H2>
      <p>
        {tx(t, "phSch_oscBody",
          "Put a particle in the potential of a spring, V = ½mω²x² (the simple harmonic motion chapter). Solving the Schrödinger equation is harder than for the box, but the answer is strikingly simple: the levels are evenly spaced, one step ħω = hf apart. This is exactly the ladder Planck guessed for his oscillators in 1900, now derived, with one surprise: the bottom rung is ½hf, not 0. Molecules vibrate this way, which is why they absorb infrared light at sharp frequencies, the basis of the greenhouse effect and of infrared spectroscopy.")}
      </p>
      <Equation label={tx(t, "phSch_eqOsc", "Levels of the quantum harmonic oscillator")}
        where={[
          [r`\omega`, tx(t, "phSch_wOmega", "the classical angular frequency of the oscillator, √(k/m)")],
          [r`n`, tx(t, "phSch_wN2", "0, 1, 2, …")],
        ]}
        words={tx(t, "phSch_oscWords", "An oscillator's energy climbs in equal steps of ħω, starting from half a step.")}>
        {r`E_n = \left(n + \tfrac12\right)\hbar\omega`}
      </Equation>
      <LessonTable
        headers={[tx(t, "phSch_tPot", "Potential"), tx(t, "phSch_tLev", "Levels"), tx(t, "phSch_tSpace", "Spacing")]}
        rows={[
          [tx(t, "phSch_p1", "box, hard walls"), <Tex key="a">{r`E_n \propto n^2`}</Tex>, tx(t, "phSch_p1s", "grows with n")],
          [tx(t, "phSch_p2", "spring, ½mω²x²"), <Tex key="b">{r`E_n = (n + \tfrac12)\hbar\omega`}</Tex>, tx(t, "phSch_p2s", "equal")],
          [tx(t, "phSch_p3", "hydrogen atom, −ke²/r (next chapter)"), <Tex key="c">{r`E_n \propto -1/n^2`}</Tex>, tx(t, "phSch_p3s", "shrinks with n")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phSch_rule", "A rule of thumb from the three: the wider the potential opens out at higher energy, the closer the levels crowd. Hard walls never open, so levels spread apart; a parabola opens steadily; the atom's 1/r opens fastest, so its levels pile up below zero.")}
      </Callout>

      <H2>{tx(t, "phSch_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phSch_ex1", "1. An electron in a box 0.5 nm wide (about an atom): E₁ = 0.376 / 0.25 = 1.50 eV, E₂ = 6.02 eV. The jump from 2 to 1 gives a photon of 4.51 eV, 275 nm: ultraviolet.")}</p>
      <p>{tx(t, "phSch_ex2", "2. A 1 g marble in a 10 cm box: E₁ = (6.6 × 10⁻³⁴)² / (8 × 10⁻³ × 0.01) = 5.5 × 10⁻⁶³ J. Rolling at 1 cm/s it has 5 × 10⁻⁸ J, so n = √(5 × 10⁻⁸ / 5.5 × 10⁻⁶³) ≈ 3 × 10²⁷. The levels are so dense that the energy looks continuous.")}</p>
      <p>{tx(t, "phSch_ex3", "3. An electron, 2 eV short of the barrier top, and a 1 nm gap: κ = 5.12 × √2 = 7.24 nm⁻¹, T ≈ e^(−14.5) = 5 × 10⁻⁷. Halve the gap to 0.5 nm: e^(−7.24) = 7 × 10⁻⁴, about 1400 times more likely.")}</p>
      <p>{tx(t, "phSch_ex4", "4. A proton, same 2 eV and 1 nm: its mass is 1836 times the electron's, so κ is √1836 = 43 times bigger, 311 nm⁻¹, and T ≈ e^(−622) ≈ 10⁻²⁷⁰. Tunnelling is for light particles and thin barriers. Protons in the Sun manage it only because the last stretch of their barrier is extremely thin, a few hundred femtometres (10⁻⁴ nm), and because the core holds so many protons that even very rare successes add up.")}</p>

      <H2>{tx(t, "phSch_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phSch_tWrong", "Wrong"), tx(t, "phSch_tRight", "Right"), tx(t, "phSch_tWhy", "Why")]}
        rows={[
          [tx(t, "phSch_m1w", "the lowest energy in a box is zero"), tx(t, "phSch_m1r", "it is E₁ > 0"), tx(t, "phSch_m1", "n = 0 would mean no wave at all; confinement always costs energy")],
          [tx(t, "phSch_m2w", "a stationary state means the particle stands still"), tx(t, "phSch_m2r", "its probability pattern stands still"), tx(t, "phSch_m2", "the phase turns; momentum is spread, as the uncertainty principle demands")],
          [tx(t, "phSch_m3w", "the tunnelled particle lost energy in the barrier"), tx(t, "phSch_m3r", "it comes out with the same energy"), tx(t, "phSch_m3", "only the amplitude, the chance, drops; E is conserved")],
          [tx(t, "phSch_m4w", "tunnelling chance falls in proportion to the width"), tx(t, "phSch_m4r", "it falls exponentially"), tx(t, "phSch_m4", "T ≈ e^(−2κa): each extra width multiplies T by the same factor")],
          [tx(t, "phSch_m5w", "a particle above the barrier always passes"), tx(t, "phSch_m5r", "some of the wave still reflects"), tx(t, "phSch_m5", "any sudden change of potential reflects part of a wave, like light at glass")],
        ]}
      />

      <KeyIdeas t={t} id="phSch" items={[
        "The Schrödinger equation iħ∂ψ/∂t = −(ħ²/2m)∂²ψ/∂x² + Vψ says how a wavefunction evolves; it follows the rule energy = kinetic + potential with E → iħ∂/∂t and p → −iħ∂/∂x.",
        "States of definite energy, ψ = φ(x)e^(−iEt/ħ), have an unchanging |ψ|²; only some energies give acceptable φ, and these are the energy levels.",
        "In a box of width L: φₙ = √(2/L) sin(nπx/L) and Eₙ = n²h²/8mL²; the lowest energy is not zero.",
        "A mix of levels moves, sloshing with period h/ΔE; measuring the energy gives one of the levels.",
        "Inside a barrier the wave decays as e^(−κx), so particles tunnel through with T ≈ e^(−2κa): alpha decay, fusion in the Sun, the STM and flash memory depend on it.",
        "A quantum oscillator has evenly spaced levels (n + ½)ħω, Planck's ladder with a zero-point step.",
      ]} />
    </Article>
  );
}

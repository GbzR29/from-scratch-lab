"use client";

// Quantum deeper 1: spin and qubits — atoms as tiny magnets (μ = −(e/2m)L,
// the Bohr magneton, the force of a non-uniform field), the Stern–Gerlach
// experiment and its two spots, spin ½ (Sz = ±ħ/2, |S| = √3 ħ/2, g ≈ 2),
// repeated measurements and the cos²(θ/2) rule, the state as two amplitudes
// and the Bloch sphere, the 720° turn, Larmor precession and MRI, and the
// qubit: gates as rotations, measurement gives one bit, no cloning, and the
// hardware that carries qubits today.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { SternGerlachFigure } from "@/components/lesson/figures/physics/SternGerlachFigure";
import { BlochFigure } from "@/components/lesson/figures/physics/BlochFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Chance of "up" along an axis tilted by θ from the one the spin points along. */
const tiltNumbers = (v: Record<string, number>) => {
  const p = Math.cos((v.th * Math.PI) / 360) ** 2;
  return {
    tex: r`P_\uparrow = \cos^2\!\left(\frac{${num(v.th, 0)}^\circ}{2}\right) = \amber{${num(p, 3)}}, \qquad \langle S_z \rangle = \frac{\hbar}{2}\cos ${num(v.th, 0)}^\circ = \green{${num(Math.cos((v.th * Math.PI) / 180), 3)}}\,\frac{\hbar}{2}`,
    meter: p,
  };
};

/** Larmor frequency of protons (MRI) or electrons in a field B. */
const larmorNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const proton = v.who < 0.5, g = proton ? 42.58e6 : 28.025e9, f = g * v.B;
  const nice = f >= 1e9 ? `${num(f / 1e9, 2)}\\ \\text{GHz}` : `${num(f / 1e6, 1)}\\ \\text{MHz}`;
  const lam = 3e8 / f;
  return {
    tex: r`f = ${proton ? r`42.58\ \text{MHz/T}` : r`28.0\ \text{GHz/T}`} \times ${num(v.B, 2)}\ \text{T} = \amber{${nice}}, \quad \lambda = \frac{c}{f} = \green{${lam >= 1 ? `${num(lam, 2)}\\ \\text{m}` : `${num(lam * 100, 2)}\\ \\text{cm}`}}`,
    meterLabel: proton ? tx(t, "phSpin_liveRadio", "radio waves") : tx(t, "phSpin_liveMicro", "microwaves"),
    meter: Math.min(1, v.B / 7),
  };
};

export function SpinQubitsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phSpin_intro",
          "An electron behaves like a tiny spinning magnet, but the spin can only ever be measured in two ways: up or down, whatever direction you choose to measure it in. This one fact, found by accident in 1922 with a beam of silver atoms, is the simplest quantum system there is: a thing with exactly two outcomes. It underlies magnetism, the periodic table (next chapter but one), MRI scanners, and the qubit, the unit of quantum computing. In this chapter you will see the experiment, learn the rule that predicts its odd results, and meet the sphere on which every state of a spin lives.")}
      </Lead>

      <Goals t={t} id="phSpin" items={[
        "Explain how a non-uniform magnetic field sorts atoms by their magnetic moment, and what Stern and Gerlach saw.",
        "Give the measured values of an electron's spin, Sz = ±ħ/2, and the rule cos²(θ/2) for measurements along tilted axes.",
        "Describe a spin state with two amplitudes and place it on the Bloch sphere.",
        "Explain precession in a magnetic field (MRI) and what makes a qubit different from a bit.",
      ]} />

      <H2>{tx(t, "phSpin_magTitle", "Atoms as tiny magnets")}</H2>
      <p>
        {tx(t, "phSpin_magBody",
          "A charge going round in a loop is a current loop, and a current loop is a magnet (the magnetism chapter). An electron in an atom carries angular momentum L, so it carries a magnetic moment μ, a vector that measures how strong a magnet it is and which way it points. For an orbiting electron the two are locked together.")}
      </p>
      <Equation label={tx(t, "phSpin_eqMu", "The magnetic moment of an orbit")}
        where={[
          [r`\vec\mu`, tx(t, "phSpin_wMu", "the magnetic moment, in J/T (joules per tesla): the energy of the magnet in a field is −μ·B")],
          [r`e,\ m_e`, tx(t, "phSpin_wE", "the electron's charge, 1.60 × 10⁻¹⁹ C, and mass, 9.11 × 10⁻³¹ kg")],
          [r`\vec L`, tx(t, "phSpin_wL", "the orbital angular momentum; the minus sign is there because the electron's charge is negative")],
          [r`\mu_B`, tx(t, "phSpin_wMuB", "the Bohr magneton, eħ/2mₑ = 9.27 × 10⁻²⁴ J/T: the natural size of an atomic magnet, the moment of one unit ħ of orbital angular momentum")],
        ]}
        words={tx(t, "phSpin_muWords", "An electron's magnetism is its angular momentum times e/2m; one unit ħ gives one Bohr magneton.")}
        note={tx(t, "phSpin_muNote", "Where does e/2m come from? A charge e going round a circle of radius r at speed v is a current e·v/(2πr), enclosing an area πr². Current times area is the moment: μ = evr/2 = (e/2m)·mvr = (e/2m)L.")}>
        {r`\vec\mu = -\frac{e}{2m_e}\vec L, \qquad \mu_B = \frac{e\hbar}{2m_e}`}
      </Equation>
      <p>
        {tx(t, "phSpin_forceBody",
          "In a uniform field a magnet only turns; the push on its north pole cancels the pull on its south pole. In a field that is stronger at one end than the other, the two no longer cancel and there is a net force. A magnet pointing with the field is pulled towards the strong side, one pointing against it is pushed to the weak side, and one pointing across feels nothing.")}
      </p>
      <Equation label={tx(t, "phSpin_eqForce", "The force on a magnet in a non-uniform field")}
        where={[
          [r`F_z`, tx(t, "phSpin_wFz", "the force along z, the direction in which the field changes")],
          [r`\mu_z`, tx(t, "phSpin_wMuz", "the component of the magnetic moment along z: how much of the magnet points that way")],
          [r`\partial B_z/\partial z`, tx(t, "phSpin_wGrad", "the field gradient: how fast the field grows along z, in T/m. The pointed pole of a Stern–Gerlach magnet makes it about 1000 T/m")],
        ]}
        words={tx(t, "phSpin_forceWords", "The sideways push is the magnet's component along the field's slope times the steepness of that slope.")}>
        {r`F_z = \mu_z\,\frac{\partial B_z}{\partial z}`}
      </Equation>

      <H2>{tx(t, "phSpin_sgTitle", "The Stern–Gerlach experiment")}</H2>
      <p>
        {tx(t, "phSpin_sgBody",
          "In 1922 Otto Stern and Walther Gerlach, in Frankfurt, boiled silver in an oven, let the atoms out through a slit as a thin beam, sent the beam between the poles of such a magnet, and caught it on a glass plate. If the atomic magnets pointed every which way, as classical physics expects, each atom would be pushed by a different amount and the beam would smear into a line. Instead they found two separate spots. Legend has it the spots only became visible because Stern's cheap cigars put sulphur on his breath, which blackened the thin silver deposit.")}
      </p>
      <SternGerlachFigure t={t} />
      <p>
        {tx(t, "phSpin_spinBody",
          "Silver has 47 electrons. Forty-six of them sit in closed shells whose magnetism cancels; the last is a 5s electron, with l = 0 and so no orbital angular momentum at all. So the magnetism Stern and Gerlach measured did not come from an orbit. In 1925 two Dutch students, George Uhlenbeck and Samuel Goudsmit, proposed that the electron itself carries a built-in angular momentum, which they called spin. It is not a little ball turning (the electron's surface would have to move faster than light); it is a property the electron simply has, like its charge.")}
      </p>
      <Equation label={tx(t, "phSpin_eqSpin", "The electron's spin")}
        where={[
          [r`S_z`, tx(t, "phSpin_wSz", "the spin along any axis you choose to measure: only ever +ħ/2 (up) or −ħ/2 (down)")],
          [r`s = \tfrac12`, tx(t, "phSpin_wS", "the spin quantum number of the electron; quantities come in steps of ħ from −sħ to +sħ, so two values")],
          [r`|\vec S|`, tx(t, "phSpin_wSabs", "the size of the spin vector, √(s(s + 1)) ħ, larger than its largest component ħ/2: the spin can never point exactly along the axis")],
          [r`g`, tx(t, "phSpin_wG", "the g-factor, 2.0023 for the electron: spin is twice as magnetic as an orbit with the same angular momentum, so μz = ∓μB to 0.1%")],
        ]}
        words={tx(t, "phSpin_spinWords", "Measured along any axis, an electron's spin is half a unit of ħ, up or down, and nothing in between.")}
        note={tx(t, "phSpin_spinNote", "The g = 2 came out of Dirac's relativistic equation for the electron in 1928, unasked for. The extra 0.0023 comes from quantum electrodynamics (the quantum fields chapter) and has been computed and measured to twelve digits, the most precise agreement in all of science.")}>
        {r`\begin{gathered} S_z = \pm\frac{\hbar}{2}, \qquad |\vec S| = \sqrt{s(s+1)}\,\hbar = \frac{\sqrt3}{2}\hbar \\ \mu_z = \mp\frac{g}{2}\mu_B \end{gathered}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "phSpin_tPart", "Particle"), tx(t, "phSpin_tSpin", "Spin s"), tx(t, "phSpin_tVals", "Values of Sz (units of ħ)")]}
        rows={[
          [tx(t, "phSpin_p1", "electron, proton, neutron, quarks"), "1/2", "−1/2, +1/2"],
          [tx(t, "phSpin_p2", "photon"), "1", tx(t, "phSpin_p2v", "−1, +1 (the two polarisations; 0 is missing for a massless particle)")],
          [tx(t, "phSpin_p3", "W and Z bosons, deuteron nucleus"), "1", "−1, 0, +1"],
          [tx(t, "phSpin_p4", "Higgs boson, helium-4 atom"), "0", "0"],
          [tx(t, "phSpin_p5", "the Δ⁺⁺ particle"), "3/2", "−3/2, −1/2, +1/2, +3/2"],
        ]}
      />

      <H2>{tx(t, "phSpin_seqTitle", "Measuring again, and along other axes")}</H2>
      <p>
        {tx(t, "phSpin_seqBody",
          "Chain the magnets in the figure. An atom that came out up along z comes out up again along z every time: a measurement repeated gives the same answer. Along x, at right angles, it comes out up or down at random, half and half. And after an x measurement, the z answer is random again: the atom keeps only the last result. Between the two extremes, the chance follows one smooth rule.")}
      </p>
      <Equation label={tx(t, "phSpin_eqRule", "The chance of 'up' along a tilted axis")}
        where={[
          [r`\theta`, tx(t, "phSpin_wTh", "the angle between the axis the spin was last found up along and the axis you measure now")],
          [r`P_\uparrow,\ P_\downarrow`, tx(t, "phSpin_wP", "the chances of the two results; they add to 1")],
          [r`\langle S_z \rangle`, tx(t, "phSpin_wAvg", "the average result over many atoms: (+ħ/2)P↑ + (−ħ/2)P↓")],
        ]}
        words={tx(t, "phSpin_ruleWords", "Tilt the second magnet by θ and the chance of 'up' is cos² of half that angle; on average the result equals the classical projection, but each single answer is still up or down.")}
        note={tx(t, "phSpin_ruleNote", "Why half the angle? The state of a spin is not an arrow but a pair of amplitudes, and turning the apparatus by θ mixes them by θ/2. Turn a spin through a full 360° and its amplitudes change sign; it takes 720° to get back to where it started. No measurement sees a sign on its own, but interference can: neutron experiments in 1975 split a beam, turned one half by 360°, and saw the interference flip.")}>
        {r`P_\uparrow = \cos^2\frac{\theta}{2}, \qquad P_\downarrow = \sin^2\frac{\theta}{2}, \qquad \langle S_z \rangle = \frac{\hbar}{2}\cos\theta`}
      </Equation>
      <LiveFormula label={tx(t, "phSpin_liveTilt", "Try it: a second magnet at angle θ")}
        tex={r`P_\uparrow = \cos^2(\theta/2), \qquad \langle S_z \rangle = \tfrac{\hbar}{2}\cos\theta`}
        vars={[{ id: "th", label: tx(t, "phSpin_liveTh", "angle θ"), min: 0, max: 180, step: 1, value: 60, fmt: v => `${num(v, 0)}°` }]}
        compute={tiltNumbers}
        note={tx(t, "phSpin_liveTiltNote", "θ = 0 is the repeat measurement, always up. θ = 90° is the x measurement, a fair coin. θ = 180° measures along the opposite axis, always 'down'. At 60°, three atoms in four come out up.")} />

      <H2>{tx(t, "phSpin_stateTitle", "The state of a spin: two amplitudes")}</H2>
      <p>
        {tx(t, "phSpin_stateBody",
          "The wave of a particle in a box needed a number at every point. A spin needs only two numbers: an amplitude α for up and an amplitude β for down. They are complex numbers, like the e^(iωt) of the wave chapters, each with a size and a phase. The squares of their sizes are the chances. Physicists write the state with Dirac's brackets, |↑⟩ and |↓⟩, or in quantum computing |0⟩ and |1⟩.")}
      </p>
      <Equation label={tx(t, "phSpin_eqState", "A spin state")}
        where={[
          [r`|0\rangle,\ |1\rangle`, tx(t, "phSpin_wKets", "spin up and spin down along z (also written |↑⟩, |↓⟩); a 'ket' |…⟩ is just a name for a state")],
          [r`\alpha,\ \beta`, tx(t, "phSpin_wAB", "complex amplitudes; |α|² and |β|² are the chances of finding 0 and 1")],
          [r`\theta,\ \varphi`, tx(t, "phSpin_wTP", "the two angles that remain: θ from the top of the Bloch sphere, φ round its equator")],
        ]}
        words={tx(t, "phSpin_stateWords", "Every state of a spin is a mix of up and down, fixed by two angles: how much of each (θ) and the phase between them (φ).")}
        note={tx(t, "phSpin_stateNote", "Four real numbers (two complex) shrink to two angles because the chances must add to 1 and because multiplying the whole state by the same phase changes nothing measurable. Each pair (θ, φ) is a direction in space, and the state is exactly 'spin up along that direction'. So every possible state of an electron's spin is up along some axis.")}>
        {r`\begin{gathered} |\psi\rangle = \alpha|0\rangle + \beta|1\rangle, \qquad |\alpha|^2 + |\beta|^2 = 1 \\ |\psi\rangle = \cos\frac{\theta}{2}\,|0\rangle + e^{i\varphi}\sin\frac{\theta}{2}\,|1\rangle \end{gathered}`}
      </Equation>
      <BlochFigure t={t} />
      <H3>{tx(t, "phSpin_precTitle", "Precession, and how MRI listens to it")}</H3>
      <p>
        {tx(t, "phSpin_precBody",
          "Put a spin in a steady field B along z. Its energy depends on its z component, so up and down differ by ΔE = 2μ_zB, and the phase between them turns at the rate ΔE/ħ. On the Bloch sphere the arrow goes round the z axis, like a tilted spinning top round the vertical (the angular momentum chapter). The rate is the Larmor frequency, set by the particle's gyromagnetic ratio γ, its magnetic moment per unit of angular momentum.")}
      </p>
      <Derivation t={t} label={tx(t, "phSpin_precDer", "Why the arrow turns at ω = γB")}
        steps={[
          { tex: r`E_{\uparrow,\downarrow} = \mp\mu_z B`, why: tx(t, "phSpin_d1", "the energy of a magnet in a field is −μ·B; up and down have opposite μz") },
          { tex: r`\Delta E = 2\mu_z B = \hbar\,\gamma B`, why: tx(t, "phSpin_d2", "the gap between the two levels. γ = 2μz/ħ is the moment per unit of angular momentum (ħ/2)") },
          { tex: r`\beta(t) \propto e^{-iE_\downarrow t/\hbar},\ \alpha(t) \propto e^{-iE_\uparrow t/\hbar} \;\to\; \varphi(t) = \varphi_0 + \frac{\Delta E}{\hbar}\,t`, why: tx(t, "phSpin_d3", "each part of a state with a definite energy turns its phase as e^(−iEt/ħ) (the Schrödinger chapter); only the difference of the two phases is the angle φ") },
          { tex: r`\green{\omega = \gamma B}, \qquad f = \frac{\gamma}{2\pi}B`, why: tx(t, "phSpin_d4", "so φ grows at the steady rate ω: the arrow precesses about the field, θ unchanged") },
        ]} />
      <LiveFormula label={tx(t, "phSpin_liveLarmor", "Try it: the Larmor frequency")}
        tex={r`f = \frac{\gamma}{2\pi}\,B`}
        vars={[
          { id: "who", label: tx(t, "phSpin_liveWho", "0 = proton, 1 = electron"), min: 0, max: 1, step: 1, value: 0, fmt: v => (v < 0.5 ? "p" : "e") },
          { id: "B", label: tx(t, "phSpin_liveB", "field B"), min: 0.1, max: 7, step: 0.1, value: 1.5, fmt: v => `${num(v, 1)} T` },
        ]}
        compute={larmorNumbers(t)}
        note={tx(t, "phSpin_liveLarmorNote", "Hospital MRI scanners use 1.5 or 3 T, so the hydrogen nuclei (protons) in the water of your body precess at 64 or 128 MHz, the band of FM radio. A radio pulse tips them over; as they precess back they broadcast at that frequency, and a field that varies across the body makes each place sing at its own pitch. Electrons, 658 times more magnetic, precess in the microwave range: that is electron spin resonance.")} />

      <H2>{tx(t, "phSpin_qubitTitle", "The qubit")}</H2>
      <p>
        {tx(t, "phSpin_qubitBody",
          "A classical bit is 0 or 1. A qubit is any two-level quantum system: a spin, two energy levels of an ion, two currents in a superconducting loop, two polarisations of a photon. Its state is a point on the Bloch sphere. The operations of a quantum computer, the gates, are rotations of that sphere, and they can be undone. At the end, a measurement gives a single 0 or 1, with chances |α|² and |β|²: you never read α and β themselves. The power of qubits comes when there are many of them, as the next chapter shows.")}
      </p>
      <LessonTable
        headers={[tx(t, "phSpin_tGate", "Gate"), tx(t, "phSpin_tRot", "Rotation of the Bloch sphere"), tx(t, "phSpin_tDoes", "What it does")]}
        rows={[
          ["X", tx(t, "phSpin_g1r", "180° about x"), tx(t, "phSpin_g1", "swaps 0 and 1, the quantum NOT")],
          ["Z", tx(t, "phSpin_g2r", "180° about z"), tx(t, "phSpin_g2", "flips the sign of the 1 part; chances unchanged")],
          ["H", tx(t, "phSpin_g3r", "180° about the x–z diagonal"), tx(t, "phSpin_g3", "Hadamard: 0 → (0 + 1)/√2 and 1 → (0 − 1)/√2, even mixes")],
          ["S", tx(t, "phSpin_g4r", "90° about z"), tx(t, "phSpin_g4", "adds a quarter-turn phase to the 1 part")],
          [tx(t, "phSpin_g5", "field along z"), tx(t, "phSpin_g5r", "steady turn about z"), tx(t, "phSpin_g5d", "precession; gates on real qubits are timed pulses of such fields")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phSpin_clone", "You cannot copy an unknown qubit (the no-cloning theorem, 1982). A copier would have to work for every state, and because quantum evolution is linear, a machine that copies |0⟩ and |1⟩ correctly turns a mix into an entangled pair instead of two copies. That is why measuring one copy can never reveal α and β, and why quantum cryptography can detect an eavesdropper.")}
      </Callout>
      <LessonTable
        headers={[tx(t, "phSpin_tHw", "Qubit made of"), tx(t, "phSpin_tTwo", "Its two states"), tx(t, "phSpin_tNote", "Note")]}
        rows={[
          [tx(t, "phSpin_h1", "superconducting circuit"), tx(t, "phSpin_h1s", "two lowest energy levels of a tiny LC circuit"), tx(t, "phSpin_h1n", "Google, IBM; cooled to 0.01 K, gates in tens of nanoseconds")],
          [tx(t, "phSpin_h2", "trapped ion"), tx(t, "phSpin_h2s", "two levels of one ion held by electric fields"), tx(t, "phSpin_h2n", "the most accurate gates; lasers drive the rotations")],
          [tx(t, "phSpin_h3", "photon"), tx(t, "phSpin_h3s", "horizontal and vertical polarisation"), tx(t, "phSpin_h3n", "travels far, so used for quantum communication")],
          [tx(t, "phSpin_h4", "electron spin in silicon"), tx(t, "phSpin_h4s", "spin up and down"), tx(t, "phSpin_h4n", "the Stern–Gerlach system itself, built with chip technology")],
        ]}
      />
      <Callout type="tip" t={t}>
        {tx(t, "phSpin_malus", "A photon's polarisation is a qubit too, and you have met its rule already: Malus's law from the polariser figure, cos²θ. It has θ where spin has θ/2 because a polariser turned by 90° (not 180°) gives the opposite result. Same mathematics, different way of labelling the angle.")}
      </Callout>

      <H2>{tx(t, "phSpin_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phSpin_ex1", "1. The size of the split. A silver atom (mass 1.79 × 10⁻²⁵ kg) with μz = 9.27 × 10⁻²⁴ J/T in a gradient of 1000 T/m feels F = 9.3 × 10⁻²¹ N, an acceleration a = F/m = 5.2 × 10⁴ m/s². At 500 m/s it spends 70 µs in a 3.5 cm magnet and is deflected ½at² = 0.13 mm up or down. Stern and Gerlach's two lines were indeed a fraction of a millimetre apart.")}</p>
      <p>{tx(t, "phSpin_ex2", "2. An atom is found up along z, then measured along an axis 120° away: P↑ = cos²(60°) = 0.25. One atom in four comes out up, three in four down. The average spin along that axis is (ħ/2) cos 120° = −ħ/4.")}</p>
      <p>{tx(t, "phSpin_ex3", "3. An electron in a 0.35 T field: its two levels are ΔE = 2μBB = 2 × 5.79 × 10⁻⁵ eV/T × 0.35 T = 4.1 × 10⁻⁵ eV apart, matching microwaves of f = ΔE/h = 9.8 GHz. That is the standard frequency of electron spin resonance spectrometers.")}</p>
      <p>{tx(t, "phSpin_ex4", "4. A qubit prepared with θ = 90°, φ = 0 (the state |+⟩) and measured 1000 times gives about 500 zeros and 500 ones. The same counts come from φ = 90°. The difference shows only after a gate: H turns |+⟩ back into a certain 0, but turns the φ = 90° state into another even mix.")}</p>

      <H2>{tx(t, "phSpin_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phSpin_tWrong", "Wrong"), tx(t, "phSpin_tRight", "Right"), tx(t, "phSpin_tWhy", "Why")]}
        rows={[
          [tx(t, "phSpin_m1w", "spin is the electron rotating"), tx(t, "phSpin_m1r", "spin is built-in angular momentum"), tx(t, "phSpin_m1", "a point-like electron spinning fast enough would have its surface move faster than light")],
          [tx(t, "phSpin_m2w", "the spin points along z, we just do not know which way"), tx(t, "phSpin_m2r", "the spin has a definite value only along the axis last measured"), tx(t, "phSpin_m2", "the z, x, z experiment brings back 'down'; a hidden fixed arrow cannot")],
          [tx(t, "phSpin_m3w", "a qubit stores two numbers you can read"), tx(t, "phSpin_m3r", "a measurement returns one bit"), tx(t, "phSpin_m3", "α and β set the chances; only many identical copies reveal them")],
          [tx(t, "phSpin_m4w", "P↑ = cos²θ"), tx(t, "phSpin_m4r", "P↑ = cos²(θ/2) for spin ½"), tx(t, "phSpin_m4", "at θ = 90° the chance is ½, at 180° it is 0; cos²θ is the photon rule")],
          [tx(t, "phSpin_m5w", "|S| = ħ/2"), tx(t, "phSpin_m5r", "|S| = (√3/2)ħ; its component is ħ/2"), tx(t, "phSpin_m5", "the vector is longer than any component you can measure")],
        ]}
      />

      <KeyIdeas t={t} id="phSpin" items={[
        "A current loop is a magnet: an electron's moment is (e/2m) times its angular momentum, and a field that varies in space pushes on it with F = μz ∂B/∂z.",
        "Stern and Gerlach saw a beam of silver atoms split in two: the electron has a built-in spin, measured as ±ħ/2 along any axis, with g ≈ 2.",
        "Measured again along the same axis, the answer repeats; along an axis tilted by θ, 'up' comes with chance cos²(θ/2), and the earlier answer is forgotten.",
        "A spin state is α|0⟩ + β|1⟩, a point on the Bloch sphere at angles θ and φ; every state is 'up' along some direction.",
        "In a field, the state precesses at ω = γB: 42.6 MHz/T for protons (MRI), 28 GHz/T for electrons.",
        "A qubit is any two-level system; gates rotate the Bloch sphere, a measurement yields one bit, and an unknown qubit cannot be copied.",
      ]} />
    </Article>
  );
}

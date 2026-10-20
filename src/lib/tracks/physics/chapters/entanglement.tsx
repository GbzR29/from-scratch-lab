"use client";

// Quantum deeper 2: entanglement and Bell's theorem — two qubits and their
// four amplitudes, product and entangled states (a₀₀a₁₁ = a₀₁a₁₀), making a
// Bell state with H and CNOT, 2ⁿ amplitudes for n qubits, the EPR argument
// and the singlet, Bell's inequality in the CHSH form derived (|S| ≤ 2) and
// the quantum value 2√2 from E = −cos θ, the experiments (Clauser, Aspect,
// the 2015 loophole-free tests, Nobel 2022), why no message travels, and
// what entanglement is used for: key distribution, teleportation, quantum
// computing, and decoherence.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { TwoQubitFigure } from "@/components/lesson/figures/physics/TwoQubitFigure";
import { BellFigure } from "@/components/lesson/figures/physics/BellFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Correlation of a singlet pair at angle θ, quantum against the best hidden-answer model. */
const corrNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const q = -Math.cos((v.th * Math.PI) / 180), l = -1 + (2 * v.th) / 180;
  return {
    tex: r`E_{\text{q}} = -\cos ${num(v.th, 0)}^\circ = \green{${num(q, 3)}}, \qquad E_{\text{local}} = -1 + \frac{2 \times ${num(v.th, 0)}^\circ}{180^\circ} = \red{${num(l, 3)}}`,
    meter: Math.abs(q - l) / 0.25,
    meterLabel: `${tx(t, "phEnt_liveGap", "gap")} ${num(Math.abs(q - l), 3)}`,
  };
};

export function EntanglementContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phEnt_intro",
          "Two particles can share one quantum state so completely that neither has a state of its own. Measure one, and you know at once what the other will give, however far away it is. Einstein thought this proved quantum mechanics was incomplete: surely each particle carried its answers with it all along. In 1964 John Bell showed that this common-sense idea makes a prediction that quantum mechanics breaks, and experiments since 1972 have sided, every time, with quantum mechanics. This chapter builds an entangled pair, follows the argument, and runs the test yourself.")}
      </Lead>

      <Goals t={t} id="phEnt" items={[
        "Write a two-qubit state with four amplitudes and tell a product state from an entangled one.",
        "State the EPR argument and what 'local hidden variables' means.",
        "Derive Bell's bound |S| ≤ 2 and the quantum value 2√2 from the cos² rule.",
        "Explain why entanglement cannot send a message, and name its uses: key distribution, teleportation, quantum computing.",
      ]} />

      <H2>{tx(t, "phEnt_twoTitle", "Two qubits, four amplitudes")}</H2>
      <p>
        {tx(t, "phEnt_twoBody",
          "One spin needs two amplitudes. Two spins, A and B, have four possible pairs of results, 00, 01, 10 and 11 (A's bit first), and quantum mechanics gives each pair its own amplitude. The chance of a pair is the square of its amplitude, as before.")}
      </p>
      <Equation label={tx(t, "phEnt_eqTwo", "The state of two qubits")}
        where={[
          [r`a_{00}, \dots, a_{11}`, tx(t, "phEnt_wA", "four amplitudes, one for each pair of results; their squares add to 1")],
          [r`|01\rangle`, tx(t, "phEnt_wKet", "the state 'A gives 0 and B gives 1', short for |0⟩ of A times |1⟩ of B")],
          [r`(\alpha_A, \beta_A),\ (\alpha_B, \beta_B)`, tx(t, "phEnt_wProd", "the amplitudes of each qubit alone, when the pair is a product")],
        ]}
        words={tx(t, "phEnt_twoWords", "Two qubits have four amplitudes; only when they factor into A's two times B's two does each qubit have a state of its own.")}
        note={tx(t, "phEnt_twoNote", "For a product, a₀₀a₁₁ = αAαB βAβB = a₀₁a₁₀. So a₀₀a₁₁ − a₀₁a₁₀ = 0 is the test: when it fails, the state is entangled, and the figure's C = 2|a₀₀a₁₁ − a₀₁a₁₀| measures by how much.")}>
        {r`\begin{gathered} |\psi\rangle = a_{00}|00\rangle + a_{01}|01\rangle + a_{10}|10\rangle + a_{11}|11\rangle \\ \text{${tx(t, "phEnt_texProd", "product")}: } a_{xy} = \alpha_x^{A}\,\alpha_y^{B} \end{gathered}`}
      </Equation>
      <TwoQubitFigure t={t} />
      <p>
        {tx(t, "phEnt_growBody",
          "Each extra qubit doubles the count: n qubits need 2ⁿ amplitudes. Fifty qubits need 2⁵⁰ ≈ 10¹⁵ numbers, and three hundred need more numbers than there are atoms in the observable universe. A product state needs only 2n, so it is the entangled states that make a quantum computer impossible to imitate with an ordinary one.")}
      </p>

      <H2>{tx(t, "phEnt_eprTitle", "Einstein's objection")}</H2>
      <p>
        {tx(t, "phEnt_eprBody",
          "In 1935 Einstein, Boris Podolsky and Nathan Rosen (EPR) pointed at states like the singlet, which a particle with no spin produces when it splits into two spin-½ particles. Total spin is conserved, so along any axis the two results must be opposite. Alice measures her particle along z and gets up: she then knows Bob's will be down along z, without touching it. EPR argued that since she could predict Bob's result with certainty, from far away, that result must have been fixed all along, an 'element of reality' that quantum mechanics leaves out. The alternative, that her measurement changes Bob's particle instantly, Einstein later called 'spooky action at a distance'.")}
      </p>
      <Equation label={tx(t, "phEnt_eqSinglet", "The singlet state")}
        where={[
          [r`|01\rangle`, tx(t, "phEnt_wS1", "A up, B down")],
          [r`|10\rangle`, tx(t, "phEnt_wS2", "A down, B up")],
          [r`1/\sqrt2`, tx(t, "phEnt_wS3", "equal sizes: each of the two outcomes has chance ½")],
          [r`-`, tx(t, "phEnt_wS4", "the minus sign makes the state look the same along every axis: total spin zero")],
        ]}
        words={tx(t, "phEnt_singletWords", "Either A is up and B down, or the reverse, with equal amplitudes and a minus sign, and that holds along whatever axis both measure.")}
        note={tx(t, "phEnt_singletNote", "Neither particle has a spin direction of its own: alone, each gives up or down at random along any axis. Only the pair has a definite property, total spin zero.")}>
        {r`|\Psi^-\rangle = \frac{1}{\sqrt2}\big(|01\rangle - |10\rangle\big)`}
      </Equation>
      <p>
        {tx(t, "phEnt_hvBody",
          "EPR's picture is called local hidden variables. Local: what happens at Bob's detector depends only on things at Bob's detector, never on Alice's choice far away. Hidden variables: each pair leaves the source carrying instructions, which may be random and unknown to us, that fix every answer to every question it might be asked. For thirty years this looked like a matter of taste. Then Bell found a way to test it.")}
      </p>

      <H2>{tx(t, "phEnt_bellTitle", "Bell's inequality")}</H2>
      <p>
        {tx(t, "phEnt_bellBody",
          "Give Alice a choice of two magnet angles, a and a′, and Bob two, b and b′. For each pair, each picks one at random and records +1 or −1. For each of the four combinations they work out the correlation E: the average of the product of their two results, +1 if they always agree, −1 if they always disagree. Here is the form of Bell's argument found by Clauser, Horne, Shimony and Holt in 1969 (CHSH).")}
      </p>
      <Derivation t={t} label={tx(t, "phEnt_chshDer", "Hidden answers can never beat 2")}
        steps={[
          { tex: r`A, A', B, B' \in \{+1, -1\}`, why: tx(t, "phEnt_d1", "if each pair carries answers, it carries Alice's answer to a (A) and to a′ (A′), and Bob's to b (B) and to b′ (B′), even though only one of each is ever asked") },
          { tex: r`A(B - B') + A'(B + B')`, why: tx(t, "phEnt_d2", "build this from the four answers of one pair") },
          { tex: r`= \pm 2`, why: tx(t, "phEnt_d3", "B and B′ are each ±1, so either they are equal (B − B′ = 0, B + B′ = ±2) or opposite (B + B′ = 0, B − B′ = ±2). One bracket is zero and the other is ±2, times A or A′, which is ±1") },
          { tex: r`S = E(a,b) - E(a,b') + E(a',b) + E(a',b')`, why: tx(t, "phEnt_d4", "averaging over many pairs gives this combination of the four measured correlations; locality means each term is the same average whatever the other side chose") },
          { tex: r`\green{|S| \le 2}`, why: tx(t, "phEnt_d5", "an average of numbers that are each +2 or −2 lies between −2 and +2") },
        ]} />
      <p>
        {tx(t, "phEnt_qBody",
          "Quantum mechanics predicts something else. For the singlet, B is opposite to A along the same axis, so if Alice found 'up' along a, Bob's particle acts as if it were 'down' along a. Measured along b, at angle θ = b − a, the previous chapter's rule gives the chance that the two results are the same: sin²(θ/2).")}
      </p>
      <Equation label={tx(t, "phEnt_eqE", "The quantum correlation")}
        where={[
          [r`E(\theta)`, tx(t, "phEnt_wE", "the correlation: chance of the same result minus chance of different results")],
          [r`\theta`, tx(t, "phEnt_wTh", "the angle between Alice's and Bob's magnets")],
          [r`2\sqrt2`, tx(t, "phEnt_wTs", "≈ 2.83, the value of |S| with a = 0°, a′ = 90°, b = 45°, b′ = 135°, the most quantum mechanics allows (Tsirelson's bound)")],
        ]}
        words={tx(t, "phEnt_eWords", "The correlation falls as minus the cosine of the angle, and at the best angles Bell's combination reaches 2.83, above the limit of 2 for any hidden answers.")}
        note={tx(t, "phEnt_eNote", "At these angles three terms are −cos 45° = −0.707 and E(a, b′) = −cos 135° = +0.707, so S = −0.707 − 0.707 − 0.707 − 0.707 = −2√2. Any local model has a correlation that, at best, falls in a straight line from −1 to +1, giving ±0.5 at 45° and 135°, and S = −2.")}>
        {r`E(\theta) = \sin^2\frac{\theta}{2} - \cos^2\frac{\theta}{2} = -\cos\theta, \qquad |S| = 2\sqrt2`}
      </Equation>
      <BellFigure t={t} />
      <LiveFormula label={tx(t, "phEnt_liveCorr", "Try it: quantum against the best hidden-answer model")}
        tex={r`E_{\text{q}} = -\cos\theta, \qquad E_{\text{local}} = -1 + \frac{2\theta}{180^\circ}`}
        vars={[{ id: "th", label: tx(t, "phEnt_liveTh", "angle θ"), min: 0, max: 180, step: 1, value: 45, fmt: v => `${num(v, 0)}°` }]}
        compute={corrNumbers(t)}
        note={tx(t, "phEnt_liveCorrNote", "At 0°, 90° and 180° the two agree. In between they part: the quantum curve is steeper near the ends and flatter in the middle. Bell's test picks angles where the gap is largest, 45° and 135°, and adds four gaps of 0.207 to get 2 + 0.83 = 2.83.")} />

      <H3>{tx(t, "phEnt_expTitle", "The experiments")}</H3>
      <p>
        {tx(t, "phEnt_expBody",
          "John Clauser and Stuart Freedman ran the first test in 1972 with pairs of photons from calcium atoms; quantum mechanics won. Alain Aspect in 1982 switched the polariser settings while the photons were in flight, so no signal could warn one side about the other's choice. Each test left a loophole, a way a cunning local model could still escape, until 2015, when three groups closed the main ones at once. In Delft, Ronald Hanson's team entangled electron spins in two diamonds 1.3 km apart; each side chose its setting and finished its measurement before light from the other side's choice could arrive, and almost every pair was detected. The 2022 Nobel Prize went to Aspect, Clauser and Anton Zeilinger.")}
      </p>
      <LessonTable
        headers={[tx(t, "phEnt_tLoop", "Loophole"), tx(t, "phEnt_tIdea", "The escape"), tx(t, "phEnt_tClosed", "How it was closed")]}
        rows={[
          [tx(t, "phEnt_l1", "locality"), tx(t, "phEnt_l1i", "a slow signal tells one side what the other chose"), tx(t, "phEnt_l1c", "choose settings after the pair leaves, far enough apart that light cannot connect the choices in time (Aspect 1982, Weihs 1998)")],
          [tx(t, "phEnt_l2", "detection"), tx(t, "phEnt_l2i", "only some pairs are detected, and the hidden answers decide which"), tx(t, "phEnt_l2c", "detect almost every pair (ions 2001, Delft and Vienna and NIST 2015)")],
          [tx(t, "phEnt_l3", "freedom of choice"), tx(t, "phEnt_l3i", "the settings were correlated with the pairs from the start"), tx(t, "phEnt_l3c", "pick the settings with fast random-number generators, or even with the colour of light from distant stars and quasars (2017–2018)")],
        ]}
      />

      <H2>{tx(t, "phEnt_noTitle", "Why no message can travel")}</H2>
      <p>
        {tx(t, "phEnt_noBody",
          "If Alice's choice affects Bob's results, can she use it to signal him faster than light? No. Look at the figure: Alice's own results are +1 half the time whatever Bob does, and Bob's are half and half whatever Alice does. The correlation is only visible when the two lists are brought together and compared, and that needs an ordinary signal, at light speed or slower. Relativity is safe in a subtle way: for two far-apart measurements, different observers disagree about which came first (the spacetime chapter), yet all of them see the same correlations. What Bell and the experiments rule out is the idea that the results were written down in advance and only read off locally.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phEnt_interp", "What really happens is still argued over. The Copenhagen view says the state is our knowledge and the question 'what was it before?' has no answer. Many-worlds says every outcome happens, in branches that stop interfering. Pilot-wave theories keep hidden variables but make them openly non-local. All give the same predictions for every experiment done so far; Bell's theorem says which kind of theory is impossible, not which possible one is true.")}
      </Callout>

      <H2>{tx(t, "phEnt_useTitle", "What entanglement is good for")}</H2>
      <LessonTable
        headers={[tx(t, "phEnt_tUse", "Use"), tx(t, "phEnt_tHow", "How entanglement helps")]}
        rows={[
          [tx(t, "phEnt_u1", "quantum key distribution"), tx(t, "phEnt_u1h", "Alice and Bob measure entangled pairs and use the results as a shared secret key. A spy who measures the pairs on the way spoils the correlations, and a Bell test reveals it (Ekert, 1991). The Micius satellite sent entangled pairs to ground stations 1200 km apart in 2017 and used them for a key in 2020")],
          [tx(t, "phEnt_u2", "teleportation"), tx(t, "phEnt_u2h", "a shared pair plus two ordinary bits sent by Alice let Bob rebuild an unknown qubit that Alice destroys in the process; no copy is made and nothing outruns light (theory 1993, first done 1997)")],
          [tx(t, "phEnt_u3", "quantum computing"), tx(t, "phEnt_u3h", "n entangled qubits hold 2ⁿ amplitudes; an algorithm arranges for wrong answers to cancel and right ones to add, as in Shor's factoring algorithm")],
          [tx(t, "phEnt_u4", "sensing and clocks"), tx(t, "phEnt_u4h", "entangled atoms measure time and fields more precisely than the same atoms used one by one")],
        ]}
      />
      <H3>{tx(t, "phEnt_decTitle", "Decoherence: entanglement with everything")}</H3>
      <p>
        {tx(t, "phEnt_decBody",
          "A qubit is fragile because it entangles just as easily with stray air molecules, photons or vibrations as with another qubit. Once its state is tied up with its surroundings, it no longer has a state of its own, and its interference effects are spread over trillions of untracked particles where no one can see them. This decoherence is why everyday objects never show superpositions (the wave–particle chapter) and why quantum computers must be cold, dark and isolated, and still lose their states in microseconds to seconds.")}
      </p>

      <H2>{tx(t, "phEnt_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phEnt_ex1", "1. Same axis: a and b both 0°, θ = 0. E = −cos 0 = −1: the results always disagree, as conservation of spin demands. Hidden answers manage this too; the difference shows only at other angles.")}</p>
      <p>{tx(t, "phEnt_ex2", "2. θ = 45°: the quantum chance of the same result is sin²(22.5°) = 0.146, so E = 0.146 − 0.854 = −0.707. The straight-line local model gives same-result chance 0.25 and E = −0.5.")}</p>
      <p>{tx(t, "phEnt_ex3", "3. Simulating 50 qubits on an ordinary computer: 2⁵⁰ = 1.1 × 10¹⁵ amplitudes, each a complex number of 16 bytes, is 18 petabytes, more than the memory of most supercomputers. Each extra qubit doubles it.")}</p>
      <p>{tx(t, "phEnt_ex4", "4. In the Delft test the two labs were 1.3 km apart, so light needs 1.3 km / (3 × 10⁸ m/s) = 4.3 µs to cross. Each side had to pick its setting and record its result inside that window, which it did, so no signal at light speed could connect them.")}</p>

      <H2>{tx(t, "phEnt_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phEnt_tWrong", "Wrong"), tx(t, "phEnt_tRight", "Right"), tx(t, "phEnt_tWhy", "Why")]}
        rows={[
          [tx(t, "phEnt_m1w", "entanglement lets you send signals faster than light"), tx(t, "phEnt_m1r", "it gives correlations, not messages"), tx(t, "phEnt_m1", "each side alone sees pure randomness, whatever the other does")],
          [tx(t, "phEnt_m2w", "the pair is like two gloves, one left one right, in two boxes"), tx(t, "phEnt_m2r", "gloves are exactly a local hidden-variable model"), tx(t, "phEnt_m2", "gloves give |S| ≤ 2; entangled pairs give 2.83")],
          [tx(t, "phEnt_m3w", "any state with correlations is entangled"), tx(t, "phEnt_m3r", "only one that does not factor"), tx(t, "phEnt_m3", "(|00⟩ + |10⟩)/√2 has B always 0, but it is a product: A mixed, B certain")],
          [tx(t, "phEnt_m4w", "Bell proved quantum mechanics is non-local"), tx(t, "phEnt_m4r", "he proved local hidden variables fail"), tx(t, "phEnt_m4", "dropping the hidden answers (the idea that results exist before measurement) also escapes; interpretations differ on which to give up")],
          [tx(t, "phEnt_m5w", "teleportation moves matter instantly"), tx(t, "phEnt_m5r", "it transfers a state, using a classical message"), tx(t, "phEnt_m5", "Bob cannot finish until Alice's two bits arrive at light speed")],
        ]}
      />

      <KeyIdeas t={t} id="phEnt" items={[
        "Two qubits have four amplitudes; the state is a product only if a₀₀a₁₁ = a₀₁a₁₀, otherwise it is entangled and neither qubit has a state of its own.",
        "H then CNOT turns |00⟩ into the Bell state (|00⟩ + |11⟩)/√2; n qubits need 2ⁿ amplitudes.",
        "EPR argued that perfect correlations mean pre-set answers (local hidden variables); Bell showed this idea can be tested.",
        "Any local hidden-answer model obeys |S| ≤ 2; quantum mechanics gives E = −cos θ and |S| = 2√2, and experiments since 1972, loophole-free since 2015, agree with it.",
        "Each side's own results are random whatever the other does, so entanglement carries no message.",
        "Entanglement powers key distribution, teleportation and quantum computing; entanglement with the surroundings (decoherence) is what hides quantum behaviour in everyday objects.",
      ]} />
    </Article>
  );
}

"use client";

// Probability & Statistics: Bayesian estimation of a probability on a grid,
// and the Metropolis algorithm. Prior × likelihood ∝ posterior (only kernels
// matter); a grid of values; the neighbour-proposal Metropolis chain and its
// transition matrix; detailed balance proves its stationary distribution is
// the posterior; solving πP = π for a small chain and taking the posterior
// mean; running the chain instead of solving it.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { MetropolisFigure } from "@/components/lesson/figures/markov/MetropolisFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function BayesMetropolisContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mMet_intro",
          "A basketball player makes 3 of her first 4 free throws. What is her real hit rate p? Bayes' theorem answers with a whole distribution for p, the posterior. Writing it down is easy up to one number, the constant that makes it add up to 1, and that number is exactly what becomes impossible to compute when there are many unknowns. The Metropolis algorithm gets around it with the tool of the previous chapters: it builds a Markov chain whose stationary distribution is the posterior, using only ratios, in which the constant cancels.")}
      </Lead>

      <Goals t={t} id="mMet" items={[
        "Write the posterior of a probability as prior times likelihood, up to a constant.",
        "Restrict the unknown to a grid and find the posterior weight of each grid value.",
        "Build the transition matrix of the Metropolis chain with neighbour proposals.",
        "Prove with detailed balance that its stationary distribution is the posterior.",
        "Solve πP = π for the chain and compute the posterior mean from it.",
      ]} />

      <H2>{tx(t, "mMet_bayesTitle", "Prior, likelihood, posterior")}</H2>
      <p>
        {tx(t, "mMet_bayesBody",
          "Before the data we describe what we believe about p with a prior density f(p); a beta distribution is the natural choice for a probability. The data are y successes in n independent trials, whose probability for a given p is the binomial likelihood. Bayes' theorem combines the two exactly as it did for events: the new weight of each value is its old weight times how well it explains the data, divided by the total.")}
      </p>
      <Equation label={tx(t, "mMet_eqBayes", "Bayes' theorem for a probability p")}
        where={[
          [r`f(p)`, tx(t, "mMet_wPrior", "the prior: how plausible each value of p was before the data")],
          [r`L(p)`, tx(t, "mMet_wLik", "the likelihood: the probability of the data if the hit rate were p, here C(n, y) pʸ(1 − p)ⁿ⁻ʸ")],
          [r`f(p \mid y)`, tx(t, "mMet_wPost", "the posterior: the plausibility of each value of p after seeing y successes")],
          [r`\int_0^1 f(q)\,L(q)\,dq`, tx(t, "mMet_wEv", "the total over all values, the probability of the data: one number, the same for every p")],
        ]}
        words={tx(t, "mMet_bayesWords", "Posterior = prior × likelihood, rescaled so that it adds up to 1. The rescaling is a single constant.")}
        note={tx(t, "mMet_bayesNote", "q in the denominator is just the name of the integration variable, so that it is not confused with the p on the left.")}>
        {r`f(p \mid y) = \frac{f(p)\,L(p)}{\int_0^1 f(q)\,L(q)\,dq}`}
      </Equation>
      <H3>{tx(t, "mMet_kerTitle", "Only the kernel matters")}</H3>
      <p>
        {tx(t, "mMet_kerBody",
          "With a Beta(a, b) prior, f(p) = p^(a−1)(1 − p)^(b−1)/B(a, b). Multiply by the likelihood and drop every factor that does not contain p: B(a, b), the binomial coefficient C(n, y) and the denominator are all constants. What is left is the kernel of the posterior; call it g. The posterior is g divided by its own total.")}
      </p>
      <Equation label={tx(t, "mMet_eqKer", "The posterior kernel")}
        where={[
          [r`a,\ b`, tx(t, "mMet_wAB", "the shape numbers of the beta prior")],
          [r`y,\ n`, tx(t, "mMet_wYN", "y successes in n trials")],
          [r`g(p)`, tx(t, "mMet_wG", "the posterior up to a constant; ∝ reads \"proportional to\"")],
        ]}
        words={tx(t, "mMet_kerWords", "The exponents add: the prior's a − 1 and b − 1 count like extra successes and failures on top of the data's y and n − y.")}
        note={tx(t, "mMet_kerNote", "For the player: prior Beta(2, 2) (a mild belief that p is near 1/2) and 3 hits in 4 shots give g(p) = p^(1+3)(1 − p)^(1+1) = p⁴(1 − p)².")}>
        {r`f(p \mid y) \propto g(p) = p^{\,a-1+y}\,(1-p)^{\,b-1+n-y}`}
      </Equation>

      <H2>{tx(t, "mMet_gridTitle", "A grid of values")}</H2>
      <p>
        {tx(t, "mMet_gridBody",
          "To work with numbers instead of a curve, let p take only a few values, a grid p₁ < p₂ < … < pₘ. The posterior on the grid gives each value the weight g(pₖ), rescaled to add up to 1. For the player on the grid {1/4, 1/2, 3/4}:")}
      </p>
      <Derivation t={t} label={tx(t, "mMet_derGrid", "The kernel at three points")}
        steps={[
          { tex: r`g\!\left(\tfrac14\right) = \left(\tfrac14\right)^4\left(\tfrac34\right)^2 = \tfrac{1}{256}\cdot\tfrac{9}{16} = \tfrac{9}{4096}`, full: true, why: tx(t, "mMet_g1", "a low hit rate explains 3 hits in 4 badly, so its weight is small") },
          { tex: r`g\!\left(\tfrac12\right) = \left(\tfrac12\right)^4\left(\tfrac12\right)^2 = \tfrac{1}{64} = \tfrac{64}{4096}`, full: true, why: tx(t, "mMet_g2", "written over the same denominator, 4096, to compare") },
          { tex: r`g\!\left(\tfrac34\right) = \left(\tfrac34\right)^4\left(\tfrac14\right)^2 = \tfrac{81}{256}\cdot\tfrac{1}{16} = \tfrac{81}{4096}`, full: true, why: tx(t, "mMet_g3", "the highest: 3/4 fits 3 of 4 best, and the prior does not object much") },
          { tex: r`g \propto (9,\ 64,\ 81)`, full: true, why: tx(t, "mMet_g4", "the common denominator 4096 is a constant too, so the weights are just 9, 64 and 81. Dividing by their sum, 154, would give the posterior, but that is the step Metropolis will avoid") },
        ]} />
      <p>
        {tx(t, "mMet_whyBody",
          "With three grid points the sum is trivial. With ten unknown parameters and a grid of 100 values for each, it would have 100¹⁰ = 10²⁰ terms, more than any computer can add. Ratios such as g(3/4)/g(1/2) = 81/64, on the other hand, are always cheap. Metropolis needs nothing else.")}
      </p>

      <H2>{tx(t, "mMet_algoTitle", "The Metropolis algorithm")}</H2>
      <p>
        {tx(t, "mMet_algoBody",
          "The chain walks on the grid. From the current point pᵢ, one step is:")}
      </p>
      <ol className="list-decimal pl-6 space-y-1">
        <li>{tx(t, "mMet_s1", "Propose a neighbour: pᵢ₋₁ or pᵢ₊₁, each with probability ½.")}</li>
        <li>{tx(t, "mMet_s2", "If the proposal falls off the grid (left of p₁ or right of pₘ), reject it: stay at pᵢ.")}</li>
        <li>{tx(t, "mMet_s3", "Otherwise accept it with probability min(1, g(pⱼ)/g(pᵢ)): always if the new point is at least as plausible, sometimes if it is less. If it is not accepted, stay at pᵢ.")}</li>
      </ol>
      <Equation label={tx(t, "mMet_eqP", "The Metropolis transition matrix with neighbour proposals")}
        where={[
          [r`P_{ij}`, tx(t, "mMet_wPij", "the probability of moving from grid point i to grid point j in one step")],
          [r`\tfrac12`, tx(t, "mMet_wHalf", "the chance of proposing that particular neighbour")],
          [r`\min\!\left(1, \frac{g_j}{g_i}\right)`, tx(t, "mMet_wAcc", "the chance of accepting it; gⱼ is short for g(pⱼ)")],
          [r`P_{ii}`, tx(t, "mMet_wPii", "staying: everything left over, so the row adds up to 1. It includes rejected proposals and proposals off the grid")],
        ]}
        words={tx(t, "mMet_pWords", "Moving to a neighbour = proposing it (½) and accepting it (the ratio, capped at 1). Every other move has probability 0; staying gets what is left.")}
        note={tx(t, "mMet_pNote", "At an end of the grid the proposal off the grid still has its ½; it turns into staying. Do not replace it by always proposing the inside neighbour: that would make proposals unequal and the chain would no longer target g.")}>
        {r`P_{ij} = \tfrac12 \min\!\left(1, \frac{g_j}{g_i}\right) \ \ (j = i \pm 1), \qquad P_{ii} = 1 - \sum_{j \ne i} P_{ij}`}
      </Equation>
      <H3>{tx(t, "mMet_ftTitle", "The free-throw chain")}</H3>
      <Derivation t={t} label={tx(t, "mMet_derRows", "Row by row, with g ∝ (9, 64, 81)")}
        steps={[
          { tex: r`P_{12} = \tfrac12 \min\!\left(1, \tfrac{64}{9}\right) = \tfrac12 \qquad P_{11} = 1 - \tfrac12 = \tfrac12`, full: true, why: tx(t, "mMet_r1", "from 1/4: the proposal 1/2 is uphill, always accepted; the other half of the time the proposal is off the grid and the chain stays") },
          { tex: r`P_{21} = \tfrac12 \cdot \tfrac{9}{64} = \tfrac{9}{128} \qquad P_{23} = \tfrac12 \min\!\left(1, \tfrac{81}{64}\right) = \tfrac12`, full: true, why: tx(t, "mMet_r2", "from 1/2: going down to 1/4 is accepted only with chance 9/64; going up to 3/4 always") },
          { tex: r`P_{22} = 1 - \tfrac{9}{128} - \tfrac{64}{128} = \tfrac{55}{128}`, full: true, why: tx(t, "mMet_r3", "the rest of row 2: the rejected downhill proposals") },
          { tex: r`P_{32} = \tfrac12 \cdot \tfrac{64}{81} = \tfrac{32}{81} \qquad P_{33} = 1 - \tfrac{32}{81} = \tfrac{49}{81}`, full: true, why: tx(t, "mMet_r4", "from 3/4: down to 1/2 with chance 64/81 if proposed; off the grid on the other side") },
        ]} />
      <LessonTable
        headers={[tx(t, "mMet_tFrom", "from ↓ to →"), "1/4", "1/2", "3/4"]}
        rows={[
          ["1/4", "1/2", "1/2", "0"],
          ["1/2", "9/128", "55/128", "1/2"],
          ["3/4", "0", "32/81", "49/81"],
        ]}
      />

      <H2>{tx(t, "mMet_proofTitle", "Why the chain ends up at the posterior")}</H2>
      <p>
        {tx(t, "mMet_proofBody",
          "The Markov-chains chapter showed that a walk between neighbours satisfies detailed balance in its stationary state: the flow across each edge is the same both ways. Metropolis is built so that g itself balances every edge. That is the whole proof:")}
      </p>
      <Derivation t={t} label={tx(t, "mMet_derProof", "Detailed balance for Metropolis")}
        steps={[
          { tex: r`g_i\,P_{ij} = g_i \cdot \tfrac12 \min\!\left(1, \tfrac{g_j}{g_i}\right) = \tfrac12 \min(g_i,\ g_j)`, full: true, why: tx(t, "mMet_p1", "multiply g_i into the min: min(1, g_j/g_i) · g_i = min(g_i, g_j)") },
          { tex: r`g_j\,P_{ji} = \tfrac12 \min(g_j,\ g_i)`, full: true, why: tx(t, "mMet_p2", "the same computation in the other direction") },
          { tex: r`g_i\,P_{ij} = g_j\,P_{ji}`, full: true, why: tx(t, "mMet_p3", "min(g_i, g_j) does not care about the order: the flows are equal. For non-neighbours both sides are 0") },
          { tex: r`\sum_i g_i\,P_{ij} = \sum_i g_j\,P_{ji} = g_j \sum_i P_{ji} = g_j`, full: true, why: tx(t, "mMet_p4", "add the balance over all i: the rows of P add up to 1, so gP = g. g is stationary, and so is g divided by its sum, which is the posterior") },
        ]} />
      <H3>{tx(t, "mMet_solveTitle", "Solving πP = π and the posterior mean")}</H3>
      <Derivation t={t} label={tx(t, "mMet_derSolve", "The free-throw chain, solved")}
        steps={[
          { tex: r`\pi_1 \cdot \tfrac12 = \pi_2 \cdot \tfrac{9}{128} \;\Rightarrow\; \pi_2 = \tfrac{64}{9}\,\pi_1`, full: true, why: tx(t, "mMet_v1", "balance across the edge 1/4 – 1/2, read from the matrix (the equations of πP = π give the same, as they always do for a neighbour walk)") },
          { tex: r`\pi_2 \cdot \tfrac12 = \pi_3 \cdot \tfrac{32}{81} \;\Rightarrow\; \pi_3 = \tfrac{81}{64}\,\pi_2 = 9\,\pi_1`, full: true, why: tx(t, "mMet_v2", "balance across the edge 1/2 – 3/4") },
          { tex: r`\pi_1\left(1 + \tfrac{64}{9} + 9\right) = 1 \;\Rightarrow\; \pi = \left(\tfrac{9}{154},\ \tfrac{64}{154},\ \tfrac{81}{154}\right)`, full: true, why: tx(t, "mMet_v3", "the probabilities add up to 1; 1 + 64/9 + 9 = 154/9. The result is g rescaled, found from the chain alone") },
          { tex: r`E[p \mid y] = \tfrac14 \cdot \tfrac{9}{154} + \tfrac12 \cdot \tfrac{64}{154} + \tfrac34 \cdot \tfrac{81}{154} = \tfrac{95}{154} \approx 0.617`, full: true, why: tx(t, "mMet_v4", "the posterior mean is the expectation of p under π: each grid value times its probability") },
        ]} />
      <Callout type="info" t={t}>
        {tx(t, "mMet_conj", "Without the grid, a Beta(2, 2) prior and 3 hits in 4 give the posterior Beta(5, 3), whose mean is 5/8 = 0.625. The grid answer, 0.617, is close; a finer grid gets closer. Try 19 grid points in the figure.")}
      </Callout>

      <MetropolisFigure t={t} />

      <H2>{tx(t, "mMet_runTitle", "Running the chain instead of solving it")}</H2>
      <p>
        {tx(t, "mMet_runBody",
          "For a big problem nobody writes P down. The chain is simulated: start anywhere, take many steps, and average whatever you want over the values visited. The long-run average of a Markov chain equals the average under π (the ergodic result of the Markov-chains chapter), so the average of the visited p tends to the posterior mean. Three practical points. The first steps still remember the starting point, so they are usually thrown away (burn-in). Successive values are correlated, so 10 000 steps carry less information than 10 000 independent draws. And the acceptance rate tells you about the step size: proposals that are almost always accepted are too timid, and proposals that are almost never accepted go too far. For a continuous p the proposal is p′ = p + a small random step, accepted with the same min(1, g(p′)/g(p)), where g is 0 outside [0, 1].")}
      </p>

      <H2>{tx(t, "mMet_recipeTitle", "Solving a Metropolis exercise, step by step")}</H2>
      <LessonTable
        headers={[tx(t, "mMet_tStep", "Step"), tx(t, "mMet_tDo", "What to do")]}
        rows={[
          ["1", tx(t, "mMet_rc1", "Kernel: g(p) = p^(a−1+y)(1 − p)^(b−1+n−y). Drop every constant.")],
          ["2", tx(t, "mMet_rc2", "Evaluate g at each grid point; scale to whole numbers if you like (only ratios matter).")],
          ["3", tx(t, "mMet_rc3", "Neighbour entries: P_ij = ½ min(1, gⱼ/gᵢ). Diagonal: 1 minus the rest (it holds the off-grid ½ at the ends).")],
          ["4", tx(t, "mMet_rc4", "Check that every row adds up to 1.")],
          ["5", tx(t, "mMet_rc5", "Solve πP = π with Σπ = 1; for a neighbour walk, balance each edge: πᵢPᵢⱼ = πⱼPⱼᵢ.")],
          ["6", tx(t, "mMet_rc6", "Posterior mean: Σ pₖ π(pₖ). Sanity check: π should be proportional to g.")],
        ]}
      />

      <MathPracticeFigure t={t} set="metropolis" />

      <H2>{tx(t, "mMet_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mMet_tWrong", "Wrong"), tx(t, "mMet_tRight", "Right"), tx(t, "mMet_tWhy", "Why")]}
        rows={[
          [tx(t, "mMet_m1w", "P_ij = g_j/g_i"), "½ · min(1, g_j/g_i)", tx(t, "mMet_m1", "the proposal chance ½ comes first, and a ratio above 1 is not a probability")],
          [tx(t, "mMet_m2w", "rows that do not add up to 1"), tx(t, "mMet_m2r", "put the rest on P_ii"), tx(t, "mMet_m2", "rejections and off-grid proposals mean staying")],
          [tx(t, "mMet_m3w", "at an end, always propose the inside point"), tx(t, "mMet_m3r", "propose off the grid with ½ and stay"), tx(t, "mMet_m3", "unequal proposals break detailed balance and change the stationary distribution")],
          [tx(t, "mMet_m4w", "keeping C(n, y) and B(a, b)"), tx(t, "mMet_m4r", "drop them"), tx(t, "mMet_m4", "they cancel in every ratio; only the kernel matters")],
          [tx(t, "mMet_m5w", "posterior mean = the most visited point"), "Σ pₖ π(pₖ)", tx(t, "mMet_m5", "the mean is a weighted average, not the mode")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "conditional", title: tx(t, "mMet_rel1", "Conditional Probability & Bayes"), why: tx(t, "mMet_rel1b", "Bayes' theorem for events, which this chapter extends to a whole distribution.") },
        { track: "Math", id: "distributions", title: tx(t, "mMet_rel2", "Common Distributions"), why: tx(t, "mMet_rel2b", "the beta distribution and its kernel.") },
        { track: "Math", id: "markov-chains", title: tx(t, "mMet_rel3", "Markov Chains"), why: tx(t, "mMet_rel3b", "detailed balance, πP = π and long-run averages.") },
      ]} />

      <KeyIdeas t={t} id="mMet" items={[
        "Posterior ∝ prior × likelihood; with a Beta(a, b) prior and y of n, g(p) = p^(a−1+y)(1 − p)^(b−1+n−y).",
        "The normalising constant is one number; it cancels in every ratio g(pⱼ)/g(pᵢ).",
        "Metropolis with neighbour proposals: P_ij = ½ min(1, g_j/g_i) for j = i ± 1; staying takes the rest, including proposals off the grid.",
        "g_i P_ij = ½ min(g_i, g_j) = g_j P_ji: detailed balance, so the posterior is the stationary distribution.",
        "Solve πP = π (or run the chain), then the posterior mean is Σ pₖ π(pₖ).",
        "Simulated chains need burn-in and many steps, because successive values are correlated.",
      ]} />
    </Article>
  );
}

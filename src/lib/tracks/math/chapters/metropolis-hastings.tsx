"use client";

// Probability & Statistics: the Metropolis–Hastings algorithm. One step with
// any proposal q and the acceptance min(1, g′q(x|x′)/(g q(x′|x))); detailed
// balance with the proposal factor; the free-throw grid with an unequal
// proposal, solved with and without the correction; random-walk Metropolis on
// a continuous p, five steps by hand; working in logarithms; a proposal drawn
// from the prior (the prior cancels, only the likelihood ratio is left, and
// without the correction the prior is counted twice); burn-in, step size,
// acceptance rate and correlation; estimating from the samples; a recipe.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { MHFigure } from "@/components/lesson/figures/markov/MHFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function MetropolisHastingsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mMh_intro",
          "The previous chapter's Metropolis chain walked on a grid and proposed the left or the right neighbour with chance ½ each. That evenness was quietly essential: the chapter warned that proposing unevenly, for example always proposing the inside point at the ends of the grid, would make the chain settle on the wrong distribution. Real problems need uneven proposals all the time, and continuous parameters instead of grids. In 1970 W. K. Hastings showed that one extra factor in the acceptance chance repairs any proposal. With it, the algorithm, Metropolis–Hastings, can sample from almost any posterior you can write down up to a constant.")}
      </Lead>

      <Goals t={t} id="mMh" items={[
        "Write the Metropolis–Hastings acceptance chance and say what each factor does.",
        "Prove with detailed balance that it targets g for any proposal, and show what goes wrong without the correction.",
        "Run random-walk Metropolis on a continuous p by hand, working in logarithms.",
        "Use proposals drawn from the prior, and explain why then only the likelihood ratio decides.",
        "Read a trace, choose a burn-in and a step size from the acceptance rate, and estimate from the samples.",
      ]} />

      <H2>{tx(t, "mMh_stepTitle", "One step of Metropolis–Hastings")}</H2>
      <p>
        {tx(t, "mMh_stepBody",
          "The target is a posterior known only up to a constant: g(x) = prior × likelihood, with every factor that does not contain x dropped. The chain is at x. One step:")}
      </p>
      <ol className="list-decimal pl-6 space-y-1">
        <li>{tx(t, "mMh_s1", "Propose a new value x′ by drawing it from a proposal distribution q(x′ | x), which may depend on where you are.")}</li>
        <li>{tx(t, "mMh_s2", "Compute the acceptance chance α (below).")}</li>
        <li>{tx(t, "mMh_s3", "Draw u uniformly from [0, 1]. If u < α, move to x′. Otherwise stay at x, and record x again: a rejected proposal still counts as a step.")}</li>
      </ol>
      <Equation label={tx(t, "mMh_eqAlpha", "The Metropolis–Hastings acceptance chance")}
        where={[
          [r`g(x)`, tx(t, "mMh_wg", "the target up to a constant (the posterior kernel) at the current value")],
          [r`g(x')`, tx(t, "mMh_wg2", "the same at the proposed value")],
          [r`q(x' \mid x)`, tx(t, "mMh_wq", "the chance (or density) of proposing x′ when you are at x: the move you are trying")],
          [r`q(x \mid x')`, tx(t, "mMh_wqr", "the chance of proposing the way back, x from x′: the reverse move")],
        ]}
        words={tx(t, "mMh_alphaWords", "Accept with the target's ratio, times how much easier the way back is to propose than the way forward, capped at 1.")}
        note={tx(t, "mMh_alphaNote", "The constant that would normalise g appears on top and below and cancels, which is the whole point. When q is symmetric, q(x′ | x) = q(x | x′), the second fraction is 1 and this is the plain Metropolis rule of the previous chapter.")}>
        {r`\alpha(x \to x') = \min\!\left(1,\ \frac{g(x')}{g(x)} \cdot \frac{q(x \mid x')}{q(x' \mid x)}\right)`}
      </Equation>
      <p>
        {tx(t, "mMh_stepBody2",
          "Why the reverse move goes on top: if x′ is easy to propose from x but x is hard to propose from x′, the chain would arrive at x′ often and leave rarely, piling up there for reasons that have nothing to do with g. The factor q(x | x′)/q(x′ | x) is below 1 exactly in that case, and it accepts such moves less often, by the right amount.")}
      </p>

      <H2>{tx(t, "mMh_proofTitle", "Why it works: detailed balance with the proposal")}</H2>
      <p>
        {tx(t, "mMh_proofBody",
          "On a grid, the chance of moving from i to j ≠ i is P_ij = q(j | i) · α_ij: propose j, then accept. The proof of the previous chapter goes through with q inside the min:")}
      </p>
      <Derivation t={t} label={tx(t, "mMh_derProof", "Detailed balance for Metropolis–Hastings")}
        steps={[
          { tex: r`g_i\,P_{ij} = g_i\, q(j \mid i)\, \min\!\left(1, \frac{g_j\, q(i \mid j)}{g_i\, q(j \mid i)}\right)`, full: true, why: tx(t, "mMh_p1", "the flow from i to j in the stationary state: be at i, propose j, accept") },
          { tex: r`= \min\big(g_i\, q(j \mid i),\ g_j\, q(i \mid j)\big)`, full: true, why: tx(t, "mMh_p2", "multiply the positive number g_i q(j | i) into the min: c · min(1, A/c) = min(c, A)") },
          { tex: r`= g_j\, q(i \mid j)\, \min\!\left(1, \frac{g_i\, q(j \mid i)}{g_j\, q(i \mid j)}\right) = g_j\, P_{ji}`, full: true, why: tx(t, "mMh_p3", "the min does not care about the order of its two entries, so it is also the flow from j back to i") },
          { tex: r`g_i P_{ij} = g_j P_{ji} \;\Rightarrow\; gP = g`, full: true, why: tx(t, "mMh_p4", "detailed balance on every pair; summing over i, as in the previous chapter, gives that g (rescaled) is stationary") },
        ]} />

      <H3>{tx(t, "mMh_gridTitle", "The free-throw grid with an uneven proposal")}</H3>
      <p>
        {tx(t, "mMh_gridBody",
          "Take the previous chapter's example: prior Beta(2, 2), 3 hits in 4, grid {1/4, 1/2, 3/4}, so g ∝ (9, 64, 81). Now use the proposal that chapter forbade: from an end, always propose the middle; from the middle, propose either end with chance ½. The proposal is uneven, q(2 | 1) = 1 but q(1 | 2) = ½, so the Hastings factor matters.")}
      </p>
      <Derivation t={t} label={tx(t, "mMh_derGrid", "Acceptance chances with the correction")}
        steps={[
          { tex: r`\alpha_{12} = \min\!\left(1, \tfrac{64}{9} \cdot \tfrac{1/2}{1}\right) = \min\!\left(1, \tfrac{32}{9}\right) = 1`, full: true, why: tx(t, "mMh_g1", "from 1/4 to 1/2: uphill, and still above 1 after halving") },
          { tex: r`\alpha_{21} = \min\!\left(1, \tfrac{9}{64} \cdot \tfrac{1}{1/2}\right) = \tfrac{9}{32}`, full: true, why: tx(t, "mMh_g2", "from 1/2 to 1/4: the way back is proposed with chance 1, the way there only ½, so the ratio doubles") },
          { tex: r`\alpha_{23} = \min\!\left(1, \tfrac{81}{64} \cdot 2\right) = 1, \qquad \alpha_{32} = \min\!\left(1, \tfrac{64}{81} \cdot \tfrac12\right) = \tfrac{32}{81}`, full: true, why: tx(t, "mMh_g3", "the same on the other side") },
          { tex: r`P_{21} = \tfrac12 \cdot \tfrac{9}{32} = \tfrac{9}{64}, \quad P_{23} = \tfrac12, \quad P_{22} = 1 - \tfrac{9}{64} - \tfrac{32}{64} = \tfrac{23}{64}`, full: true, why: tx(t, "mMh_g4", "each move = proposal chance × acceptance; staying takes the rest") },
        ]} />
      <LessonTable
        headers={[tx(t, "mMh_tFrom", "from ↓ to →"), "1/4", "1/2", "3/4"]}
        rows={[
          ["1/4", "0", "1", "0"],
          ["1/2", "9/64", "23/64", "1/2"],
          ["3/4", "0", "32/81", "49/81"],
        ]}
      />
      <p>
        {tx(t, "mMh_gridBody2",
          "Balance across the edges: π₁ · 1 = π₂ · 9/64 gives π₂ = (64/9) π₁, and π₂ · ½ = π₃ · 32/81 gives π₃ = 9 π₁. So π ∝ (9, 64, 81), the posterior, as promised. Now drop the correction and accept with min(1, gⱼ/gᵢ) as plain Metropolis would. The edges become P₂₁ = ½ · 9/64 = 9/128 and P₃₂ = 1 · 64/81, and the same balance gives π ∝ (9, 128, 81): the middle gets twice its weight, because it is proposed twice as eagerly as it proposes. The posterior mean comes out as 127/218 ≈ 0.583 instead of the correct 95/154 ≈ 0.617.")}
      </p>
      <LessonTable
        headers={[tx(t, "mMh_tVersion", "chain"), tx(t, "mMh_tStat", "stationary distribution"), tx(t, "mMh_tMean", "mean of p")]}
        rows={[
          [tx(t, "mMh_v1", "with the Hastings factor"), "(9, 64, 81) / 154", "95/154 ≈ 0.617"],
          [tx(t, "mMh_v2", "without it"), "(9, 128, 81) / 218", tx(t, "mMh_v2m", "127/218 ≈ 0.583, wrong")],
        ]}
      />

      <H2>{tx(t, "mMh_rwTitle", "A continuous p: random-walk Metropolis")}</H2>
      <p>
        {tx(t, "mMh_rwBody",
          "Without a grid, p can be any number in [0, 1]. The simplest proposal is a random step: p′ = p + s·Z, where Z is a standard normal number and s, the step size, is a number you choose. The chance of proposing p′ from p depends only on the distance |p′ − p|, so it is the same both ways: the proposal is symmetric, the Hastings factor is 1, and α = min(1, g(p′)/g(p)). A proposal outside [0, 1] has g(p′) = 0 and is simply rejected.")}
      </p>
      <p>
        {tx(t, "mMh_rwBody2",
          "For the player the target is the kernel of Beta(5, 3), g(p) = p⁴(1 − p)². Five steps by hand from p = 0.5, with the random steps and the uniform numbers u already drawn:")}
      </p>
      <LessonTable
        headers={[tx(t, "mMh_tStep", "step"), "p", "p′", "g(p′) / g(p)", "u", tx(t, "mMh_tRes", "result")]}
        rows={[
          ["1", "0.50", "0.62", "0.02134 / 0.01563 = 1.366", "—", tx(t, "mMh_r1", "ratio ≥ 1: accept, p = 0.62")],
          ["2", "0.62", "0.90", "0.00656 / 0.02134 = 0.308", "0.52", tx(t, "mMh_r2", "u > α: reject, p stays 0.62")],
          ["3", "0.62", "0.55", "0.01853 / 0.02134 = 0.868", "0.31", tx(t, "mMh_r3", "u < α: accept, p = 0.55")],
          ["4", "0.55", "1.06", tx(t, "mMh_r4r", "0 (outside [0, 1])"), "—", tx(t, "mMh_r4", "reject, p stays 0.55")],
          ["5", "0.55", "0.71", "0.02137 / 0.01853 = 1.153", "—", tx(t, "mMh_r5", "accept, p = 0.71")],
        ]}
      />
      <p>
        {tx(t, "mMh_rwBody3",
          "The recorded chain is 0.50, 0.62, 0.62, 0.55, 0.55, 0.71. The repeated values are not a mistake: staying put is how the chain spends more time in plausible regions. If the rejected steps were left out of the record, the samples would follow the wrong distribution.")}
      </p>

      <H3>{tx(t, "mMh_logTitle", "Work in logarithms")}</H3>
      <p>
        {tx(t, "mMh_logBody",
          "With real data the kernel itself is unusable. For 7500 hits in 10 000 throws, g(0.75) contains 0.75⁷⁵⁰⁰ = e^(7500 · ln 0.75) ≈ e^(−2158), far below the smallest number a computer can store (about 10⁻³⁰⁸), so both g values come out as 0 and the ratio as 0/0. Compare logarithms instead: ln g(p) = (a′ − 1) ln p + (b′ − 1) ln(1 − p), and accept when ln u < ln g(p′) − ln g(p) (plus ln q(p | p′) − ln q(p′ | p) for an uneven proposal). The differences are ordinary numbers.")}
      </p>

      <H2>{tx(t, "mMh_priorTitle", "An uneven proposal: drawing from the prior")}</H2>
      <p>
        {tx(t, "mMh_priorBody",
          "A proposal does not have to be a small step. One idea is to ignore where you are and draw p′ from the prior: q(p′ | p) = f(p′). This is very uneven (the chance of proposing p′ does not depend on p at all), so the Hastings factor is essential. It simplifies beautifully:")}
      </p>
      <Derivation t={t} label={tx(t, "mMh_derPrior", "Proposals from the prior: the prior cancels")}
        steps={[
          { tex: r`\alpha = \min\!\left(1, \frac{g(p')}{g(p)} \cdot \frac{q(p \mid p')}{q(p' \mid p)}\right) = \min\!\left(1, \frac{g(p')}{g(p)} \cdot \frac{f(p)}{f(p')}\right)`, why: tx(t, "mMh_q1", "q(p | p′) = f(p) and q(p′ | p) = f(p′): each proposal is just a draw from the prior") },
          { tex: r`= \min\!\left(1, \frac{f(p')\,L(p')}{f(p)\,L(p)} \cdot \frac{f(p)}{f(p')}\right)`, why: tx(t, "mMh_q2", "the target is prior × likelihood: g = f · L") },
          { tex: r`= \min\!\left(1, \frac{L(p')}{L(p)}\right)`, why: tx(t, "mMh_q3", "the prior cancels: it has already been used to make the proposals, so the acceptance only asks how much better the new value explains the data") },
          { tex: r`p = \tfrac12,\ p' = \tfrac34: \ \frac{(3/4)^3(1/4)}{(1/2)^3(1/2)} = \frac{27/256}{1/16} = \tfrac{27}{16} \Rightarrow \alpha = 1`, why: tx(t, "mMh_q4", "for 3 hits in 4, L(p) ∝ p³(1 − p); p′ = 1/4 instead would give (3/256)/(1/16) = 3/16") },
        ]} />
      <p>
        {tx(t, "mMh_priorBody2",
          "Forget the correction and accept with min(1, g(p′)/g(p)), and the chain targets g · f instead of g, the prior multiplied in twice: detailed balance holds, but for the wrong distribution. With a mild prior the error is small; with a strong one it is plain to see. The figure below lets you switch the correction off. One practical caveat: drawing from the prior only works well when the prior is not much wider than the posterior. With a lot of data the posterior is narrow, almost every draw from the prior lands where the likelihood is tiny, and nearly everything is rejected.")}
      </p>

      <H2>{tx(t, "mMh_tuneTitle", "Burn-in, step size and the acceptance rate")}</H2>
      <p>
        {tx(t, "mMh_tuneBody",
          "The theory promises the right distribution in the long run; practice decides how long that is. Three things to watch, all visible in the figure:")}
      </p>
      <LessonTable
        headers={[tx(t, "mMh_tWatch", "what"), tx(t, "mMh_tProblem", "problem"), tx(t, "mMh_tDo2", "what to do")]}
        rows={[
          [tx(t, "mMh_u1", "burn-in"), tx(t, "mMh_u1p", "the first steps still remember the starting point; started at p₀ = 0.05, the trace takes a while to climb to where the posterior is"), tx(t, "mMh_u1d", "throw away the first part of the run, until the trace stops drifting")],
          [tx(t, "mMh_u2", "step too small"), tx(t, "mMh_u2p", "almost every proposal is accepted, but each moves only a little; the trace wanders slowly and successive values are nearly equal"), tx(t, "mMh_u2d", "increase s")],
          [tx(t, "mMh_u3", "step too large"), tx(t, "mMh_u3p", "most proposals land outside [0, 1] or far downhill and are rejected; the trace shows long flat stretches"), tx(t, "mMh_u3d", "decrease s")],
          [tx(t, "mMh_u4", "acceptance rate"), tx(t, "mMh_u4p", "the share of accepted proposals summarises both problems"), tx(t, "mMh_u4d", "for one parameter aim for roughly 20–50 % (about 44 % is the classic best for a bell-shaped target); with many parameters, lower, around 25 %")],
        ]}
      />
      <p>
        {tx(t, "mMh_tuneBody2",
          "Successive values of a chain are correlated, so 10 000 steps carry less information than 10 000 independent draws, sometimes only as much as a few hundred. A well-tuned trace looks like dense, even noise around a fixed level, with no slow drifts and no flat stretches. A useful check: run the chain again from a very different starting point; after burn-in the two runs should agree.")}
      </p>

      <MHFigure t={t} />

      <H3>{tx(t, "mMh_estTitle", "Estimating from the samples")}</H3>
      <p>
        {tx(t, "mMh_estBody",
          "After burn-in, the kept values behave like (correlated) draws from the posterior, so any question about p becomes counting or averaging. The posterior mean is the average of the kept values. P(p > ½) is the share of kept values above ½. A 95 % credible interval runs from the value with 2.5 % of the samples below it to the value with 97.5 % below it. For the player, the exact answers from the Beta(5, 3) posterior are 0.625 and 99/128 ≈ 0.773, and a long run of the chain gets as close to them as you like.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "mMh_whyTip", "For one probability with a beta prior none of this is needed: the posterior is a known beta. The point of practising on it is that the answer can be checked. The same algorithm, unchanged, handles models with dozens of unknowns where no formula exists, which is why it is the workhorse of Bayesian statistics.")}
      </Callout>

      <H2>{tx(t, "mMh_recipeTitle", "Solving a Metropolis–Hastings exercise")}</H2>
      <LessonTable
        headers={[tx(t, "mMh_tStepN", "step"), tx(t, "mMh_tDo", "what to do")]}
        rows={[
          ["1", tx(t, "mMh_c1", "Write the target kernel g = prior × likelihood, dropping constants (in logs, for a program).")],
          ["2", tx(t, "mMh_c2", "Write the proposal q(x′ | x). Is it symmetric? Then the Hastings factor is 1.")],
          ["3", tx(t, "mMh_c3", "α = min(1, g(x′) q(x | x′) / (g(x) q(x′ | x))): the reverse proposal on top.")],
          ["4", tx(t, "mMh_c4", "Grid: P_ij = q(j | i) α_ij for j ≠ i, and P_ii = 1 minus the rest of the row.")],
          ["5", tx(t, "mMh_c5", "Simulation: accept if u < α; otherwise record the current value again.")],
          ["6", tx(t, "mMh_c6", "Discard the burn-in, check the trace and the acceptance rate, then average, count or take quantiles.")],
        ]}
      />

      <MathPracticeFigure t={t} set="mh" />

      <H2>{tx(t, "mMh_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mMh_tWrong", "Wrong"), tx(t, "mMh_tRight", "Right"), tx(t, "mMh_tWhy", "Why")]}
        rows={[
          [tx(t, "mMh_x1w", "min(1, g′/g) with an uneven proposal"), tx(t, "mMh_x1r", "multiply by q(x | x′)/q(x′ | x)"), tx(t, "mMh_x1", "without it the chain targets the wrong distribution, (9, 128, 81) instead of (9, 64, 81)")],
          [tx(t, "mMh_x2w", "q(x′ | x)/q(x | x′)"), "q(x | x′)/q(x′ | x)", tx(t, "mMh_x2", "the reverse move goes on top")],
          [tx(t, "mMh_x3w", "skipping rejected steps in the record"), tx(t, "mMh_x3r", "record the current value again"), tx(t, "mMh_x3", "the repeats are what weights the plausible values")],
          [tx(t, "mMh_x4w", "pushing a proposal outside [0, 1] back to the edge"), tx(t, "mMh_x4r", "reject it (g = 0 there)"), tx(t, "mMh_x4", "moving it changes q, and the edges would be proposed too often")],
          [tx(t, "mMh_x5w", "acceptance near 100 % means the chain works well"), tx(t, "mMh_x5r", "it means the steps are too small"), tx(t, "mMh_x5", "the chain crawls; aim for 20–50 % with one parameter")],
          [tx(t, "mMh_x6w", "using every step, from the first"), tx(t, "mMh_x6r", "discard the burn-in"), tx(t, "mMh_x6", "the start can be far from the posterior")],
          [tx(t, "mMh_x7w", "computing g(p) directly with lots of data"), tx(t, "mMh_x7r", "compare ln g"), tx(t, "mMh_x7", "the powers underflow to 0, and 0/0 is meaningless")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "likelihood-beta", title: tx(t, "mMh_rel1", "Likelihood, Beta Priors & Bayesian Updating"), why: tx(t, "mMh_rel1b", "where g = prior × likelihood comes from, and the exact posterior to check against.") },
        { track: "Math", id: "bayes-metropolis", title: tx(t, "mMh_rel2", "Bayes on a Grid & the Metropolis Algorithm"), why: tx(t, "mMh_rel2b", "the symmetric case on a grid, solved exactly with πP = π.") },
        { track: "Math", id: "markov-chains", title: tx(t, "mMh_rel3", "Markov Chains"), why: tx(t, "mMh_rel3b", "stationary distributions, detailed balance and long-run averages.") },
      ]} />

      <KeyIdeas t={t} id="mMh" items={[
        "Metropolis–Hastings: propose x′ from q(x′ | x), accept with α = min(1, g(x′) q(x | x′) / (g(x) q(x′ | x))), otherwise stay.",
        "The reverse proposal goes on top; for a symmetric proposal the factor is 1 and it is plain Metropolis.",
        "g_i q(j | i) α_ij = min(g_i q(j | i), g_j q(i | j)) is symmetric: detailed balance, so the target is stationary for any proposal.",
        "Without the factor an uneven proposal biases the chain: on the free-throw grid, (9, 128, 81) instead of (9, 64, 81).",
        "Random walk p′ = p + s·Z: symmetric; reject proposals outside [0, 1]; compare logarithms.",
        "Proposals drawn from the prior leave only the likelihood ratio, min(1, L(p′)/L(p)).",
        "Discard the burn-in, tune s to about 20–50 % acceptance, remember the samples are correlated.",
        "Estimate by averaging, counting and taking quantiles of the kept values.",
      ]} />
    </Article>
  );
}

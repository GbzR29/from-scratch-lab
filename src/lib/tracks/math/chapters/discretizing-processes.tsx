"use client";

// Probability & Statistics: from a continuous process to a finite chain. The
// Gaussian AR(1) process, its conditional law and stationary distribution
// (derived from sums of independent normals), k steps at once, cutting the
// line into bands with representative points (P_ij as normal band
// probabilities), a three-band worked example against the exact answers, and
// how a computer solves the large chains that finer bands produce.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { DiscretizeFigure } from "@/components/lesson/figures/markov/DiscretizeFigure";

const r = String.raw;

export function DiscretizingProcessesContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mDisc_intro",
          "Tomorrow's temperature anomaly is about half of today's plus a random shock. A quantity like that takes values on the whole real line, so it cannot be a chain with a finite list of states. But it is Markov: the next value depends only on the current one. Cut the line into a few bands, let each band be a state, and the process becomes an ordinary transition matrix, approximately. This chapter does that for the simplest such process, the AR(1), and compares every answer the chain gives with the exact one.")}
      </Lead>

      <Goals t={t} id="mDisc" items={[
        "Write the conditional distribution of an AR(1) process one step and k steps ahead.",
        "Derive its stationary distribution from sums of independent normals.",
        "Turn the process into a finite chain with bands and representative points.",
        "Compute transition probabilities, stationary probabilities and k-step probabilities of the chain, and compare them with the exact values.",
        "Explain how a computer solves the large chains that fine bands produce.",
      ]} />

      <H2>{tx(t, "mDisc_arTitle", "The AR(1) process")}</H2>
      <Equation label={tx(t, "mDisc_eqAR", "Autoregressive process of order 1")}
        where={[
          [r`X_n`, tx(t, "mDisc_wX", "the value at time n")],
          [r`\varphi`, tx(t, "mDisc_wPhi", "the memory: the fraction of today's value carried into tomorrow (a number between −1 and 1)")],
          [r`\varepsilon_{n+1}`, tx(t, "mDisc_wEps", "the new shock, normal with mean 0 and variance σ², independent of everything before it")],
        ]}
        words={tx(t, "mDisc_arWords", "Tomorrow = a fraction φ of today + a fresh random shock. \"Order 1\" because only one past value appears.")}
        note={tx(t, "mDisc_arNote", "Given Xₙ = x, the only random part of Xₙ₊₁ is ε, so Xₙ₊₁ | Xₙ = x ~ N(φx, σ²): a normal centred on φx. The earlier values do not appear anywhere, which is the Markov property.")}>
        {r`X_{n+1} = \varphi\,X_n + \varepsilon_{n+1}, \qquad \varepsilon_{n+1} \sim N(0, \sigma^2)`}
      </Equation>

      <H2>{tx(t, "mDisc_statTitle", "Its stationary distribution")}</H2>
      <p>
        {tx(t, "mDisc_statBody",
          "A stationary distribution is one that reproduces itself: if Xₙ has it, so does Xₙ₊₁. Try a normal N(m, v) and see what the equation forces.")}
      </p>
      <Derivation t={t} label={tx(t, "mDisc_derStat", "The stationary mean and variance")}
        steps={[
          { tex: r`X_n \sim N(m, v) \;\Rightarrow\; \varphi X_n \sim N(\varphi m,\ \varphi^2 v)`, full: true, why: tx(t, "mDisc_s1", "multiplying by a constant multiplies the mean by φ and the variance by φ²") },
          { tex: r`X_{n+1} = \varphi X_n + \varepsilon_{n+1} \sim N(\varphi m,\ \varphi^2 v + \sigma^2)`, full: true, why: tx(t, "mDisc_s2", "a sum of independent normals is normal, with means and variances added (ε has mean 0 and variance σ²)") },
          { tex: r`m = \varphi m \;\Rightarrow\; m = 0 \qquad v = \varphi^2 v + \sigma^2 \;\Rightarrow\; v = \frac{\sigma^2}{1 - \varphi^2}`, full: true, why: tx(t, "mDisc_s3", "stationary means the same mean and variance at n + 1 as at n. With φ ≠ 1 the first gives m = 0; the second is solved for v") },
          { tex: r`\varphi = 0.5,\ \sigma = 1: \quad v = \frac{1}{0.75} = \frac43, \quad \sqrt{v} \approx 1.1547`, full: true, why: tx(t, "mDisc_s4", "the example used below. The spread is larger than the shock's own, because shocks pile up") },
        ]} />
      <Callout type="info" t={t}>
        {tx(t, "mDisc_phiInfo", "The formula needs |φ| < 1. With φ = 1 every shock is kept forever (a random walk) and the variance grows without limit; with |φ| > 1 the process explodes. There is then no stationary distribution at all.")}
      </Callout>

      <H2>{tx(t, "mDisc_kTitle", "Several steps at once")}</H2>
      <Derivation t={t} label={tx(t, "mDisc_derK", "Where the process is k steps later")}
        steps={[
          { tex: r`X_{n+2} = \varphi(\varphi X_n + \varepsilon_{n+1}) + \varepsilon_{n+2} = \varphi^2 X_n + \varphi\,\varepsilon_{n+1} + \varepsilon_{n+2}`, full: true, why: tx(t, "mDisc_k1", "substitute the equation into itself") },
          { tex: r`X_{n+2} \mid X_n = x \;\sim\; N\!\left(\varphi^2 x,\ \sigma^2(1 + \varphi^2)\right)`, full: true, why: tx(t, "mDisc_k2", "given x, two independent normal shocks are left, with variances φ²σ² and σ²") },
          { tex: r`X_{n+k} \mid X_n = x \;\sim\; N\!\left(\varphi^k x,\ \sigma^2\,\frac{1 - \varphi^{2k}}{1 - \varphi^2}\right)`, full: true, why: tx(t, "mDisc_k3", "after k steps the variances σ²(1 + φ² + φ⁴ + … + φ²⁽ᵏ⁻¹⁾) add up; that geometric sum is (1 − φ²ᵏ)/(1 − φ²)") },
          { tex: r`k \to \infty: \quad N\!\left(0,\ \frac{\sigma^2}{1 - \varphi^2}\right)`, full: true, why: tx(t, "mDisc_k4", "φᵏ → 0, so the start is forgotten and the stationary distribution appears") },
        ]} />

      <H2>{tx(t, "mDisc_bandTitle", "Cutting the line into bands")}</H2>
      <p>
        {tx(t, "mDisc_bandBody",
          "Choose bands B₁, …, Bₘ that cover the whole line without overlapping, the two outer ones reaching to −∞ and +∞, and a representative point cᵢ inside each band. State i means \"the value is in band i\", and to move on we pretend the value is exactly cᵢ. Then the next value is N(φcᵢ, σ²), and the transition probability to band j = [lⱼ, uⱼ) is a normal probability, computed with Φ, the standard normal distribution function:")}
      </p>
      <Equation label={tx(t, "mDisc_eqPij", "Transition probabilities of the band chain")}
        where={[
          [r`c_i`, tx(t, "mDisc_wC", "the representative point of band i (where the process is assumed to be)")],
          [r`l_j,\ u_j`, tx(t, "mDisc_wLU", "the lower and upper limits of band j; −∞ and +∞ for the outer bands, where Φ(−∞) = 0 and Φ(+∞) = 1")],
          [r`\Phi`, tx(t, "mDisc_wPhiF", "the standard normal distribution function: Φ(z) = P(Z < z), Z ~ N(0, 1)")],
        ]}
        words={tx(t, "mDisc_pWords", "From the point cᵢ, the next value is normal around φcᵢ; P_ij is the share of that bell that falls in band j. Standardise the two limits and subtract.")}
        note={tx(t, "mDisc_pNote", "Each row adds up to 1 because the bands cover the line exactly once. The approximation is the pretending: any value in band i moves like cᵢ. Narrower bands make that error smaller.")}>
        {r`P_{ij} = \Phi\!\left(\frac{u_j - \varphi c_i}{\sigma}\right) - \Phi\!\left(\frac{l_j - \varphi c_i}{\sigma}\right)`}
      </Equation>
      <H3>{tx(t, "mDisc_exTitle", "Worked example: φ = 0.5, σ = 1, three bands")}</H3>
      <p>
        {tx(t, "mDisc_exBody",
          "Bands (−∞; −1), [−1; 1) and [1; ∞), represented by −2, 0 and 2. From −2 the next value is N(−1, 1); from 0 it is N(0, 1); from 2 it is N(1, 1).")}
      </p>
      <Derivation t={t} label={tx(t, "mDisc_derRows", "The three rows")}
        steps={[
          { tex: r`\text{from } {-2}:\ \ \Phi(-1 + 1) = 0.5, \quad \Phi(1 + 1) - \Phi(0) = 0.4772, \quad 1 - \Phi(2) = 0.0228`, full: true, why: tx(t, "mDisc_r1", "the mean is φ · (−2) = −1. Standardise each limit by subtracting −1 (σ = 1): −1 → 0 and 1 → 2. Φ(0) = 0.5, Φ(2) = 0.9772") },
          { tex: r`\text{from } 0:\ \ \Phi(-1) = 0.1587, \quad \Phi(1) - \Phi(-1) = 0.6827, \quad 1 - \Phi(1) = 0.1587`, full: true, why: tx(t, "mDisc_r2", "the mean is 0, so the limits are already standard: Φ(1) = 0.8413") },
          { tex: r`\text{from } 2:\ \ 0.0228, \quad 0.4772, \quad 0.5`, full: true, why: tx(t, "mDisc_r3", "the mirror image of the first row: the process and the bands are symmetric about 0") },
        ]} />
      <LessonTable
        headers={[tx(t, "mDisc_tFrom", "from ↓ to →"), "−2", "0", "2"]}
        rows={[
          ["−2", "0.5000", "0.4772", "0.0228"],
          ["0", "0.1587", "0.6827", "0.1587"],
          ["2", "0.0228", "0.4772", "0.5000"],
        ]}
      />
      <Derivation t={t} label={tx(t, "mDisc_derPi", "The stationary distribution of the chain")}
        steps={[
          { tex: r`\pi_{-2} = \pi_{2} = x`, full: true, why: tx(t, "mDisc_p1", "by symmetry the two outer bands get the same share") },
          { tex: r`\pi_0 = 0.4772\,x + 0.6827\,\pi_0 + 0.4772\,x \;\Rightarrow\; 0.3173\,\pi_0 = 0.9544\,x`, full: true, why: tx(t, "mDisc_p2", "the column of state 0 in πP = π: inflow from both sides plus staying") },
          { tex: r`\pi_0 = 3.0079\,x, \quad x + 3.0079\,x + x = 1 \;\Rightarrow\; \pi = (0.1997,\ 0.6006,\ 0.1997)`, full: true, why: tx(t, "mDisc_p3", "divide, then use that the three probabilities add up to 1") },
          { tex: r`\text{exact: } P(X < -1) = \Phi\!\left(\tfrac{-1}{1.1547}\right) = 0.1932, \quad P(-1 \le X < 1) = 0.6135`, full: true, why: tx(t, "mDisc_p4", "under the exact stationary N(0, 4/3), standardise with √(4/3). The chain is off by about 0.01 per band") },
        ]} />
      <Derivation t={t} label={tx(t, "mDisc_derTwo", "Two steps: P(Xₙ₊₂ ≥ 1 | Xₙ = 0)")}
        steps={[
          { tex: r`(P^2)_{0,2} = 0.1587(0.0228) + 0.6827(0.1587) + 0.1587(0.5) \approx 0.191`, full: true, why: tx(t, "mDisc_t1", "two steps of the chain: go from 0 to each band, then from there to the top band, and add (row 0 of P times column 2)") },
          { tex: r`\text{exact: } X_{n+2} \mid X_n = 0 \sim N(0,\ 1.25), \quad 1 - \Phi\!\left(\tfrac{1}{\sqrt{1.25}}\right) = 1 - \Phi(0.894) = 0.1855`, full: true, why: tx(t, "mDisc_t2", "the k-step formula with k = 2 and x = 0: variance σ²(1 + φ²) = 1.25") },
        ]} />

      <H2>{tx(t, "mDisc_fineTitle", "Finer bands, more states, and a computer")}</H2>
      <p>
        {tx(t, "mDisc_fineBody",
          "Three bands are crude. Bands of width 1/11 from −6 to 6 give 133 states, and the chain then agrees with the exact answers to three or four decimals. Nobody solves 133 equations by hand, but the computer does nothing new. It follows one of two routes. (1) Elimination: write πP = π as (P − I)ᵀπ = 0, replace one of the equations (they are redundant by one) by π₁ + … + πₘ = 1, and eliminate unknowns exactly as you would for three. (2) Iteration: start from any distribution and multiply by P again and again, π ← πP, until it stops changing; for a chain like this one it converges to π (the convergence result of the Markov-chains chapter). k-step probabilities need only the starting row multiplied by P k times, never Pᵏ itself. Any statistics package, R included, uses one of these two routes. The figure below does the same in your browser.")}
      </p>

      <DiscretizeFigure t={t} />

      <H2>{tx(t, "mDisc_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mDisc_tWrong", "Wrong"), tx(t, "mDisc_tRight", "Right"), tx(t, "mDisc_tWhy", "Why")]}
        rows={[
          [tx(t, "mDisc_m1w", "next value ~ N(cᵢ, σ²)"), "N(φcᵢ, σ²)", tx(t, "mDisc_m1", "the bell is centred on φ times the current value")],
          [tx(t, "mDisc_m2w", "outer bands cut at the last point"), tx(t, "mDisc_m2r", "outer bands to ±∞"), tx(t, "mDisc_m2", "otherwise the rows do not add up to 1")],
          [tx(t, "mDisc_m3w", "P_ij ≈ density at cⱼ"), tx(t, "mDisc_m3r", "Φ(upper) − Φ(lower)"), tx(t, "mDisc_m3", "a transition probability is an area, not a height")],
          [tx(t, "mDisc_m4w", "compare with N(0, σ²)"), "N(0, σ²/(1 − φ²))", tx(t, "mDisc_m4", "the stationary spread includes all the shocks still remembered")],
          [tx(t, "mDisc_m5w", "two-step variance 2σ²"), "σ²(1 + φ²)", tx(t, "mDisc_m5", "the older shock has been multiplied by φ once")],
          [tx(t, "mDisc_m6w", "standardise with σ²"), tx(t, "mDisc_m6r", "divide by σ (the standard deviation)"), tx(t, "mDisc_m6", "z = (x − mean)/standard deviation")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "distributions", title: tx(t, "mDisc_rel1", "Common Distributions"), why: tx(t, "mDisc_rel1b", "the normal distribution, Φ and sums of independent normals.") },
        { track: "Math", id: "markov-chains", title: tx(t, "mDisc_rel2", "Markov Chains"), why: tx(t, "mDisc_rel2b", "πP = π, n-step probabilities and convergence.") },
        { track: "Math", id: "queues", title: tx(t, "mDisc_rel3", "Queues as Markov Chains"), why: tx(t, "mDisc_rel3b", "another continuous process turned into a chain, by cutting time instead of values.") },
      ]} />

      <KeyIdeas t={t} id="mDisc" items={[
        "AR(1): Xₙ₊₁ = φXₙ + ε, so Xₙ₊₁ | Xₙ = x ~ N(φx, σ²); it is Markov.",
        "Stationary distribution (|φ| < 1): N(0, σ²/(1 − φ²)), from v = φ²v + σ².",
        "k steps ahead: N(φᵏx, σ²(1 − φ²ᵏ)/(1 − φ²)).",
        "Bands + representative points: P_ij = Φ((uⱼ − φcᵢ)/σ) − Φ((lⱼ − φcᵢ)/σ), outer bands to ±∞.",
        "The chain's π and Pᵏ approximate the exact answers; narrower bands approximate them better.",
        "Large chains are solved by elimination with Σπ = 1 or by iterating π ← πP.",
      ]} />
    </Article>
  );
}

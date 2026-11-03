"use client";

// Probability & Statistics: Bayesian estimation of a probability, with the
// ingredients built one at a time. The binomial probability read the other
// way round is the likelihood (data fixed, p varies; not a density in p);
// building a likelihood from independent observations; the maximum at y/n
// through the log-likelihood; the same recipe for other models. The beta
// prior: mean, strength a + b, a table of typical priors, choosing a and b
// from a statement. Prior × likelihood: the beta–binomial update derived with
// its constant; the posterior mean as a weighted compromise; more data, less
// prior; updating in batches; answering questions with the posterior (mean,
// mode, P(p > ½) exactly through the binomial, an approximate interval, the
// next trial).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BetaBinomialFigure } from "@/components/lesson/figures/math/BetaBinomialFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function LikelihoodBetaContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mLb_intro",
          "A basketball player makes 3 of her first 4 free throws. What is her real hit rate p? Classical statistics answers with one number, 3/4. Bayesian statistics answers with a whole distribution for p, built from three ingredients: the likelihood (how well each possible p explains the data), the prior (what you believed about p before the data) and Bayes' rule, which multiplies the two into the posterior (what you believe after). This chapter builds each ingredient on its own, with the binomial for the data and the beta distribution for the belief, because that pair is where almost every course and exercise starts.")}
      </Lead>

      <Goals t={t} id="mLb" items={[
        "Write the likelihood of a set of observations and say why it is not a probability distribution for p.",
        "Find the value of p that makes the data most likely, y/n, from the log-likelihood.",
        "Read a Beta(a, b) prior as a belief: its centre, its strength a + b, and choose a and b from a sentence.",
        "Turn a beta prior and binomial data into the posterior Beta(a + y, b + n − y), and explain why.",
        "Answer questions with the posterior: its mean, P(p > ½), an interval, the chance of the next success.",
      ]} />

      <H2>{tx(t, "mLb_binTitle", "The data model: the binomial")}</H2>
      <p>
        {tx(t, "mLb_binBody",
          "Each free throw is a trial with two outcomes, hit or miss, and we assume the same hit chance p every time and no influence between throws (independent trials). Then the number of hits Y in n throws has the binomial distribution, met in the Common Distributions chapter.")}
      </p>
      <Equation label={tx(t, "mLb_eqBin", "The binomial probability")}
        where={[
          [r`Y`, tx(t, "mLb_wY", "the number of successes, a random number from 0 to n")],
          [r`y`, tx(t, "mLb_wy", "one particular value of it, such as 3")],
          [r`\binom{n}{y}`, tx(t, "mLb_wC", "the number of orders in which y successes can fall among n trials")],
          [r`p^{y}(1-p)^{n-y}`, tx(t, "mLb_wPow", "the chance of one particular order: p for each success, 1 − p for each failure, multiplied because the trials are independent")],
        ]}
        words={tx(t, "mLb_binWords", "The chance of exactly y successes is the number of orders times the chance of any one order.")}>
        {r`P(Y = y \mid p) = \binom{n}{y}\, p^{y}\,(1-p)^{n-y}`}
      </Equation>

      <H2>{tx(t, "mLb_likTitle", "The same formula, read the other way: the likelihood")}</H2>
      <p>
        {tx(t, "mLb_likBody",
          "Before the throws, p is fixed and Y is unknown: the formula tells you how likely each count is. After the throws it is the other way round. The data are known, y = 3 of n = 4, and p is what we do not know. Keep the data fixed and let p vary: the same expression now tells you, for each candidate p, how probable the data you actually saw would have been. That function of p is the likelihood, L(p).")}
      </p>
      <LessonTable
        headers={[tx(t, "mLb_tProbHead", "probability: p = ½ fixed, y varies"), "y = 0", "y = 1", "y = 2", "y = 3", "y = 4", tx(t, "mLb_tSum", "total")]}
        rows={[["P(Y = y | ½)", "1/16", "4/16", "6/16", "4/16", "1/16", "1"]]}
      />
      <LessonTable
        headers={[tx(t, "mLb_tLikHead", "likelihood: y = 3 fixed, p varies"), "p = 0", "p = ¼", "p = ½", "p = ¾", "p = 1", tx(t, "mLb_tArea", "area")]}
        rows={[["L(p) = 4p³(1 − p)", "0", "0.047", "0.250", "0.422", "0", "1/5"]]}
      />
      <p>
        {tx(t, "mLb_likBody2",
          "The first row is a probability distribution: its values add up to 1. The second is not. Its values are probabilities of the same event (3 hits) under different hypotheses, and nothing makes them add up to anything: the area under L(p) from 0 to 1 is ∫ 4p³(1 − p) dp = 4(1/4 − 1/5) = 1/5. So the likelihood compares values of p with one another (p = ¾ explains 3 hits in 4 about 1.7 times better than p = ½, since 0.422/0.25 ≈ 1.7), but it is not yet a belief about p. Turning it into one is the job of the prior and Bayes' rule.")}
      </p>
      <Equation label={tx(t, "mLb_eqLik", "The binomial likelihood")}
        where={[
          [r`L(p)`, tx(t, "mLb_wL", "the likelihood: a function of the unknown p, with the data y and n held fixed")],
          [r`p`, tx(t, "mLb_wp", "a candidate value of the success chance, anywhere in [0, 1]")],
          [r`\propto`, tx(t, "mLb_wProp", "\"proportional to\": equal up to a factor that does not contain p")],
        ]}
        note={tx(t, "mLb_likNote", "The factor C(n, y) does not depend on p, so it changes the height of the curve but not its shape. Any comparison of two values of p, L(p₁)/L(p₂), cancels it. That is why it is usually dropped.")}
        words={tx(t, "mLb_likWords", "For each possible p: how probable the data we actually saw would have been.")}>
        {r`L(p) = \binom{n}{y}\, p^{y}(1-p)^{n-y} \;\propto\; p^{y}(1-p)^{n-y}`}
      </Equation>

      <H3>{tx(t, "mLb_buildTitle", "Building a likelihood, step by step")}</H3>
      <p>
        {tx(t, "mLb_buildBody",
          "The binomial is one case of a general recipe that works for any model:")}
      </p>
      <LessonTable
        headers={[tx(t, "mLb_tStep", "step"), tx(t, "mLb_tDo", "what you do"), tx(t, "mLb_tFT", "for the throws hit, hit, miss, hit")]}
        rows={[
          ["1", tx(t, "mLb_b1", "Write the probability of one observation, as a function of the unknown."), tx(t, "mLb_b1e", "hit: p; miss: 1 − p")],
          ["2", tx(t, "mLb_b2", "Independent observations: multiply."), "p · p · (1 − p) · p"],
          ["3", tx(t, "mLb_b3", "Simplify, and read the result as a function of the unknown."), "L(p) = p³(1 − p)"],
          ["4", tx(t, "mLb_b4", "Drop every factor that does not contain the unknown."), tx(t, "mLb_b4e", "nothing to drop here")],
        ]}
      />
      <p>
        {tx(t, "mLb_buildBody2",
          "This likelihood, for the throws in that order, is p³(1 − p). The binomial one, for \"3 hits in some order\", is 4p³(1 − p). They differ only by the constant 4, the number of orders, so they rank every value of p the same way and lead to the same conclusions. Whether you record the order or only the count, the information about p is the same.")}
      </p>

      <H3>{tx(t, "mLb_mleTitle", "The best-supported value: y/n")}</H3>
      <p>
        {tx(t, "mLb_mleBody",
          "The value of p where L is highest is called the maximum-likelihood estimate, p̂. To find it, take the logarithm first: ln turns the product into a sum, which is easier to differentiate, and since ln only ever increases, L and ln L peak at the same place.")}
      </p>
      <Derivation t={t} label={tx(t, "mLb_eqMle", "The maximum of the binomial likelihood")}
        steps={[
          { tex: r`\ell(p) = \ln L(p) = y \ln p + (n - y)\ln(1 - p) + \text{const}`, why: tx(t, "mLb_m1", "the log of a product is the sum of the logs; ln pʸ = y ln p; the constant is ln C(n, y)") },
          { tex: r`\ell'(p) = \frac{y}{p} - \frac{n - y}{1 - p}`, why: tx(t, "mLb_m2", "the derivative of ln p is 1/p; the derivative of ln(1 − p) is −1/(1 − p) by the chain rule") },
          { tex: r`\frac{y}{p} = \frac{n - y}{1 - p} \;\Rightarrow\; y(1 - p) = (n - y)p \;\Rightarrow\; y = np`, why: tx(t, "mLb_m3", "the top of the curve is where the slope is 0; cross-multiply and the yp terms cancel") },
          { tex: r`\hat p = \frac{y}{n} = \green{\tfrac34}`, why: tx(t, "mLb_m4", "the observed proportion; for 3 hits in 4 it is 3/4") },
        ]} />
      <p>
        {tx(t, "mLb_mleBody2",
          "So the value the data alone support best is the observed proportion, which is what common sense says. What the likelihood adds is the spread: with 3 of 4 the curve is wide and many values are almost as good; with 30 of 40 it has the same peak but is far narrower. The figure below shows both.")}
      </p>
      <LessonTable
        headers={[tx(t, "mLb_tModel", "model of one observation"), tx(t, "mLb_tLik", "likelihood of n observations"), tx(t, "mLb_tMax", "maximum at")]}
        rows={[
          [tx(t, "mLb_o1", "success or failure, chance p"), "pʸ(1 − p)ⁿ⁻ʸ", "y / n"],
          [tx(t, "mLb_o2", "a count with Poisson rate λ"), "λ^(x₁ + … + xₙ) e^(−nλ)", tx(t, "mLb_o2m", "the mean count x̄")],
          [tx(t, "mLb_o3", "a measurement, normal with mean μ and known σ"), "exp(−Σ(xᵢ − μ)² / 2σ²)", tx(t, "mLb_o3m", "the mean x̄")],
        ]}
      />

      <H2>{tx(t, "mLb_priorTitle", "The prior: a beta distribution as a belief")}</H2>
      <p>
        {tx(t, "mLb_priorBody",
          "Before seeing the player, you are not completely ignorant: most players make between 50 % and 90 % of free throws. A prior is a probability distribution for p that says how plausible each value is before the data. Since p lives in [0, 1], the natural family is the beta distribution of the Common Distributions chapter.")}
      </p>
      <Equation label={tx(t, "mLb_eqBeta", "A Beta(a, b) prior")}
        where={[
          [r`a,\ b > 0`, tx(t, "mLb_wAB", "the two shape numbers; you choose them to describe your belief")],
          [r`B(a, b)`, tx(t, "mLb_wB", "the constant that makes the area 1; for whole numbers, (a − 1)!(b − 1)!/(a + b − 1)!")],
          [r`\frac{a}{a + b}`, tx(t, "mLb_wMean", "the mean: where the belief is centred")],
          [r`a + b`, tx(t, "mLb_wStr", "the strength: the larger it is, the narrower the curve and the firmer the belief")],
        ]}
        words={tx(t, "mLb_betaWords", "A Beta(a, b) prior behaves like the memory of a + b earlier trials, a of them successes and b failures: it is centred at a/(a + b), and it is as firm as that many trials would make you.")}
        note={tx(t, "mLb_betaNote", "The memory reading is exact in one sense: after the update below, a and b are simply added to the counted successes and failures. (Some books count a − 1 and b − 1 instead, because Beta(1, 1), the flat curve, should mean \"no trials seen yet\". Both readings describe the same rule.)")}>
        {r`f(p) = \frac{p^{a-1}(1-p)^{b-1}}{B(a, b)}, \qquad E[p] = \frac{a}{a+b}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "mLb_tPrior", "prior"), tx(t, "mLb_tMeanH", "mean"), tx(t, "mLb_tSd", "standard deviation"), tx(t, "mLb_tSays", "what it says")]}
        rows={[
          ["Beta(1, 1)", "0.5", "0.289", tx(t, "mLb_p1", "flat: every value of p equally plausible, \"no idea\"")],
          ["Beta(2, 2)", "0.5", "0.224", tx(t, "mLb_p2", "a mild hunch that p is near ½, easily overruled")],
          ["Beta(10, 10)", "0.5", "0.109", tx(t, "mLb_p3", "fairly sure p is close to ½, worth 20 trials of evidence")],
          ["Beta(8, 2)", "0.8", "0.121", tx(t, "mLb_p4", "p is probably high, around 0.8")],
          ["Beta(½, ½)", "0.5", "0.354", tx(t, "mLb_p5", "U-shaped: p is probably near 0 or near 1, rarely in the middle")],
        ]}
      />

      <H3>{tx(t, "mLb_chooseTitle", "Choosing a and b from a sentence")}</H3>
      <p>
        {tx(t, "mLb_chooseBody",
          "A belief usually comes as words: \"I think she makes about 70 %, and I am as sure as if I had watched 10 throws.\" The centre gives the mean, the \"as sure as\" gives the strength. If instead you can say how uncertain you are, as a standard deviation s, use the variance of the beta, v = s², to find the strength.")}
      </p>
      <Derivation t={t} label={tx(t, "mLb_eqChoose", "From a mean and a strength, or a mean and a spread")}
        steps={[
          { tex: r`\frac{a}{a+b} = 0.7, \quad a + b = 10 \;\Rightarrow\; a = 7,\ b = 3`, why: tx(t, "mLb_c1", "the mean times the strength gives a; the rest of the strength is b") },
          { tex: r`v = \frac{ab}{(a+b)^2(a+b+1)} = \frac{m(1-m)}{a+b+1}`, why: tx(t, "mLb_c2", "the beta's variance, rewritten with m = a/(a + b) and 1 − m = b/(a + b)") },
          { tex: r`a + b = \frac{m(1-m)}{v} - 1 = \frac{0.7 \cdot 0.3}{0.1^2} - 1 = 20`, why: tx(t, "mLb_c3", "solve for the strength; here mean 0.7 and standard deviation 0.1, so v = 0.01") },
          { tex: r`a = 0.7 \cdot 20 = 14,\quad b = 6 \;\Rightarrow\; \green{\mathrm{Beta}(14, 6)}`, why: tx(t, "mLb_c4", "check: 14 · 6 / (20² · 21) = 84/8400 = 0.01, a standard deviation of 0.1") },
        ]} />

      <H2>{tx(t, "mLb_bayesTitle", "Bayes' rule: prior × likelihood = posterior")}</H2>
      <p>
        {tx(t, "mLb_bayesBody",
          "Bayes' rule for events said: P(A | B) is P(A) times P(B | A), divided by P(B). With a whole range of values of p it says the same thing value by value: the new plausibility of each p is its old plausibility, times how well it explains the data, divided by one total that makes everything add up to 1.")}
      </p>
      <Equation label={tx(t, "mLb_eqBayes", "Bayes' rule for a probability p")}
        where={[
          [r`f(p)`, tx(t, "mLb_wPrior", "the prior: before the data")],
          [r`L(p)`, tx(t, "mLb_wLik2", "the likelihood: how well p explains the data")],
          [r`f(p \mid y)`, tx(t, "mLb_wPost", "the posterior: after the data")],
          [r`\int_0^1 f(q)\,L(q)\,dq`, tx(t, "mLb_wEv", "the total, the probability of the data averaged over the prior; a single number. q is just the integration variable")],
        ]}
        words={tx(t, "mLb_bayesWords", "Posterior = prior × likelihood, rescaled to area 1.")}>
        {r`f(p \mid y) = \frac{f(p)\, L(p)}{\int_0^1 f(q)\, L(q)\, dq} \;\propto\; f(p)\, L(p)`}
      </Equation>
      <Derivation t={t} label={tx(t, "mLb_eqConj", "A beta prior and binomial data give a beta posterior")}
        steps={[
          { tex: r`f(p \mid y) \propto \underbrace{p^{a-1}(1-p)^{b-1}}_{\text{prior}} \cdot \underbrace{p^{y}(1-p)^{n-y}}_{\text{likelihood}}`, why: tx(t, "mLb_u1", "prior times likelihood, with the constants B(a, b) and C(n, y) dropped: they do not contain p") },
          { tex: r`= p^{\,a+y-1}\,(1-p)^{\,b+n-y-1}`, why: tx(t, "mLb_u2", "same base, so the exponents add: (a − 1) + y and (b − 1) + (n − y)") },
          { tex: r`f(p \mid y) = \frac{p^{\,a+y-1}(1-p)^{\,b+n-y-1}}{B(a + y,\ b + n - y)}`, why: tx(t, "mLb_u3", "this is the shape of a beta density with a′ = a + y and b′ = b + n − y; a density must have area 1, so the missing constant can only be 1/B(a′, b′). No integral needed") },
          { tex: r`\text{Beta}(a, b) \;\xrightarrow{\;y \text{ of } n\;}\; \green{\text{Beta}(a + y,\ b + n - y)}`, why: tx(t, "mLb_u4", "the rule: add the successes to a and the failures to b") },
        ]} />
      <p>
        {tx(t, "mLb_bayesBody2",
          "When the prior and the posterior belong to the same family, the prior is called conjugate to the likelihood; the beta is conjugate to the binomial. For the player, a mild prior Beta(2, 2) and 3 hits in 4 give the posterior Beta(5, 3). Its mean is 5/8 = 0.625, its highest point (the mode, (a′ − 1)/(a′ + b′ − 2)) is 4/6 ≈ 0.667, and its standard deviation is √(5 · 3 / (8² · 9)) ≈ 0.161.")}
      </p>

      <BetaBinomialFigure t={t} />

      <H3>{tx(t, "mLb_compTitle", "The posterior mean is a compromise")}</H3>
      <Derivation t={t} label={tx(t, "mLb_eqComp", "Between the prior mean and the data")}
        steps={[
          { tex: r`E[p \mid y] = \frac{a + y}{a + b + n}`, why: tx(t, "mLb_w1", "the mean of Beta(a + y, b + n − y): a′/(a′ + b′)") },
          { tex: r`= \frac{a+b}{a+b+n}\cdot\frac{a}{a+b} \;+\; \frac{n}{a+b+n}\cdot\frac{y}{n}`, why: tx(t, "mLb_w2", "split the top, a + y, and multiply and divide each part by its own count: a by a + b, y by n") },
          { tex: r`= w \cdot \underbrace{\frac{a}{a+b}}_{\text{prior mean}} + (1 - w) \cdot \underbrace{\frac{y}{n}}_{\text{data}}, \qquad w = \frac{a+b}{a+b+n}`, why: tx(t, "mLb_w3", "the two weights add up to 1; w is the prior's share of all the evidence") },
          { tex: r`w = \tfrac48 = \tfrac12: \quad \tfrac12 \cdot \tfrac12 + \tfrac12 \cdot \tfrac34 = \green{\tfrac58}`, why: tx(t, "mLb_w4", "for the player the prior is worth 4 trials and the data 4 throws, so the answer is exactly half way between 0.5 and 0.75") },
        ]} />
      <p>
        {tx(t, "mLb_compBody",
          "As the data grow, w = (a + b)/(a + b + n) shrinks toward 0, and the posterior mean moves toward y/n. Two people who start from different priors end up agreeing once there is enough data. With the same 75 % hit rate:")}
      </p>
      <LessonTable
        headers={[tx(t, "mLb_tData", "data"), tx(t, "mLb_tPost", "posterior (prior Beta(2, 2))"), tx(t, "mLb_tMeanH", "mean"), tx(t, "mLb_tSd", "standard deviation"), "w"]}
        rows={[
          ["3 / 4", "Beta(5, 3)", "0.625", "0.161", "0.50"],
          ["30 / 40", "Beta(32, 12)", "0.727", "0.066", "0.09"],
          ["300 / 400", "Beta(302, 102)", "0.748", "0.022", "0.01"],
        ]}
      />

      <H3>{tx(t, "mLb_seqTitle", "Updating in batches")}</H3>
      <p>
        {tx(t, "mLb_seqBody",
          "Today's posterior is tomorrow's prior. After 3 hits in 4 the belief is Beta(5, 3). If she then makes 2 of 3 more, add again: Beta(5 + 2, 3 + 1) = Beta(7, 4). Using all the data at once, 5 hits in 7 from the original Beta(2, 2), gives Beta(2 + 5, 2 + 2) = Beta(7, 4), the same. The order in which evidence arrives does not matter, only the totals.")}
      </p>

      <H2>{tx(t, "mLb_useTitle", "Answering questions with the posterior")}</H2>
      <p>
        {tx(t, "mLb_useBody",
          "The posterior is the full answer; questions about p are read off it. The most common ones:")}
      </p>
      <LessonTable
        headers={[tx(t, "mLb_tQ", "question"), tx(t, "mLb_tHow", "how"), "Beta(5, 3)"]}
        rows={[
          [tx(t, "mLb_q1", "a best single guess"), tx(t, "mLb_q1h", "the posterior mean a′/(a′ + b′)"), "0.625"],
          [tx(t, "mLb_q2", "the most plausible value"), tx(t, "mLb_q2h", "the mode (a′ − 1)/(a′ + b′ − 2)"), "0.667"],
          [tx(t, "mLb_q3", "is she better than 50 %?"), tx(t, "mLb_q3h", "P(p > ½): the area of the posterior to the right of ½"), "99/128 ≈ 0.773"],
          [tx(t, "mLb_q4", "a range of plausible values"), tx(t, "mLb_q4h", "an interval holding 95 % of the area (a credible interval)"), tx(t, "mLb_q4v", "see below")],
          [tx(t, "mLb_q5", "will the next throw go in?"), tx(t, "mLb_q5h", "the average of p over the posterior, which is its mean"), "5/8"],
        ]}
      />
      <Derivation t={t} label={tx(t, "mLb_eqAbove", "P(p > ½) for Beta(5, 3), by integration")}
        steps={[
          { tex: r`P(p > \tfrac12) = 105 \int_{1/2}^{1} p^4 (1-p)^2\, dp`, why: tx(t, "mLb_a1", "the area of the density to the right of ½; 1/B(5, 3) = 7!/(4! · 2!) = 105") },
          { tex: r`\int p^4(1-p)^2\,dp = \frac{p^5}{5} - \frac{p^6}{3} + \frac{p^7}{7}`, why: tx(t, "mLb_a2", "expand (1 − p)² = 1 − 2p + p², multiply by p⁴, integrate term by term") },
          { tex: r`\Big[\ \cdot\ \Big]_{1/2}^{1} = \frac{1}{105} - \frac{29}{13440} = \frac{99}{13440}`, why: tx(t, "mLb_a3", "at 1: 1/5 − 1/3 + 1/7 = 1/105 = 128/13440; at ½: 84/13440 − 70/13440 + 15/13440 = 29/13440") },
          { tex: r`105 \cdot \frac{99}{13440} = \green{\frac{99}{128}} \approx 0.773`, why: tx(t, "mLb_a4", "a 77 % chance that her true rate is above one half") },
        ]} />
      <p>
        {tx(t, "mLb_aboveBody",
          "For whole-number a and b there is a shortcut with no integral. A Beta(a, b) variable has the same distribution as the a-th smallest of a + b − 1 random points dropped uniformly on [0, 1]. That point lies above x exactly when at most a − 1 of the points fall below x, and the number of points below x is binomial. So P(p > x) = P(Binomial(a + b − 1, x) ≤ a − 1). For Beta(5, 3) and x = ½: P(Bin(7, ½) ≤ 4) = (1 + 7 + 21 + 35 + 35)/128 = 99/128, the same answer.")}
      </p>
      <p>
        {tx(t, "mLb_ciBody",
          "An exact 95 % interval needs the beta's quantiles (a table or software). With more data the posterior is close to a normal curve, and mean ± 1.96 standard deviations is a good approximation: for 30 of 40, Beta(32, 12) gives 0.727 ± 1.96 · 0.066, roughly [0.60, 0.86]. Unlike a classical confidence interval, this one means what people usually want it to mean: given the data and the prior, p is in it with probability 95 %.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "mLb_nextTip", "Why the next throw has chance equal to the posterior mean: for a given p it goes in with probability p; averaging over everything you believe about p gives ∫ p f(p | y) dp, which is the definition of the posterior mean. For the player, 5/8, a little less than the raw 3/4, because the prior pulls toward ½.")}
      </Callout>

      <MathPracticeFigure t={t} set="betaBinomial" />

      <H2>{tx(t, "mLb_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mLb_tWrong", "Wrong"), tx(t, "mLb_tRight", "Right"), tx(t, "mLb_tWhy", "Why")]}
        rows={[
          [tx(t, "mLb_x1w", "the likelihood is the probability of p"), tx(t, "mLb_x1r", "it is the probability of the data, for each p"), tx(t, "mLb_x1", "its area is not 1 (1/5 for 3 of 4); only prior × likelihood, rescaled, is a distribution for p")],
          [tx(t, "mLb_x2w", "Beta(a, b) → Beta(a + y, b + n)"), "Beta(a + y, b + n − y)", tx(t, "mLb_x2", "b collects the failures, n − y, not all the trials")],
          [tx(t, "mLb_x3w", "the prior mean is (a − 1)/(a + b − 2)"), "a / (a + b)", tx(t, "mLb_x3", "that is the mode, the highest point; they differ unless a = b")],
          [tx(t, "mLb_x4w", "keeping C(n, y) and B(a, b) through the update"), tx(t, "mLb_x4r", "drop them, then name the beta"), tx(t, "mLb_x4", "the constant of the posterior is fixed by the area being 1")],
          [tx(t, "mLb_x5w", "a strong prior can never be overruled"), tx(t, "mLb_x5r", "its weight is (a + b)/(a + b + n)"), tx(t, "mLb_x5", "with enough data the weight goes to 0")],
          [tx(t, "mLb_x6w", "P(next success) = y/n"), tx(t, "mLb_x6r", "the posterior mean (a + y)/(a + b + n)"), tx(t, "mLb_x6", "y/n ignores the prior; with 4 of 4 it would claim certainty")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "conditional", title: tx(t, "mLb_rel1", "Conditional Probability & Bayes"), why: tx(t, "mLb_rel1b", "Bayes' rule for events, and the base-rate examples.") },
        { track: "Math", id: "distributions", title: tx(t, "mLb_rel2", "Common Distributions"), why: tx(t, "mLb_rel2b", "the binomial and the beta in full, with their means and variances.") },
        { track: "Math", id: "bayes-metropolis", title: tx(t, "mLb_rel3", "Bayes on a Grid & the Metropolis Algorithm"), why: tx(t, "mLb_rel3b", "when the posterior cannot be named, a Markov chain samples it.") },
      ]} />

      <KeyIdeas t={t} id="mLb" items={[
        "The likelihood is the data's probability read as a function of the unknown: data fixed, p varies. It is not a distribution for p.",
        "Build it by multiplying the probabilities of independent observations and dropping factors without p: pʸ(1 − p)ⁿ⁻ʸ.",
        "Its maximum is at the observed proportion y/n; its width shows how much the data pin p down.",
        "A Beta(a, b) prior is centred at a/(a + b) and is as firm as a + b trials; choose a and b from a mean and a strength.",
        "Posterior ∝ prior × likelihood. Beta(a, b) with y of n gives Beta(a + y, b + n − y).",
        "The posterior mean is a weighted average of the prior mean and y/n, with prior weight (a + b)/(a + b + n).",
        "Batches can be added one at a time or all at once; the result is the same.",
        "P(p > x) for whole a, b is P(Binomial(a + b − 1, x) ≤ a − 1); the next trial succeeds with the posterior mean.",
      ]} />
    </Article>
  );
}

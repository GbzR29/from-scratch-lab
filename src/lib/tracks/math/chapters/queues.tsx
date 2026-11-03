"use client";

// Probability & Statistics: queues as Markov chains. The Poisson process in
// short intervals (1 − e^(−λh) and why two events can be counted as one),
// exponential service and memorylessness (the minimum of k exponentials),
// the discrete-time chain on the number in the system with its edge cases,
// birth–death solution by detailed balance, L, Lq, W, Wq with Little's law,
// and the continuous M/M/c/K limit as h → 0.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { QueueFigure } from "@/components/lesson/figures/markov/QueueFigure";

const r = String.raw;

export function QueuesContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mQue_intro",
          "A small café has one barista and room for three customers inside, counting the one being served. Customers arrive at random, about one every two minutes, and an order takes a minute on average. How many people are inside on average? How long does a customer spend there? How often is someone turned away at the door? The number of customers inside goes up and down by one at a time, and with the right assumptions its future depends only on its present value. That makes it a Markov chain, and every question becomes a question about its stationary distribution.")}
      </Lead>

      <Goals t={t} id="mQue" items={[
        "Use the Poisson process to get the chance of an arrival in a short interval.",
        "Explain why exponential service lets the state be just the number of customers.",
        "Build the transition matrix of a queue in discrete time, including the empty and full states.",
        "Solve a birth–death chain by detailed balance.",
        "Compute L, Lq, W and Wq, using Little's law with the arrivals that get in.",
      ]} />

      <H2>{tx(t, "mQue_poisTitle", "Arrivals at random: the Poisson process")}</H2>
      <p>
        {tx(t, "mQue_poisBody",
          "\"Arrivals form a Poisson process with rate λ\" means: the numbers of arrivals in separate stretches of time are independent, and the number in any stretch of length t is Poisson with mean λt. Equivalently, the gaps between arrivals are independent exponential times with mean 1/λ (the Common Distributions chapter connects the two). To turn this into a chain we cut time into short intervals of length h and ask what happens in each one.")}
      </p>
      <Equation label={tx(t, "mQue_eqA", "The chance of an arrival in an interval of length h")}
        where={[
          [r`\lambda`, tx(t, "mQue_wLam", "the arrival rate: customers per minute")],
          [r`h`, tx(t, "mQue_wH", "the length of one interval, in the same time unit")],
          [r`a`, tx(t, "mQue_wA", "the probability of at least one arrival in the interval")],
        ]}
        words={tx(t, "mQue_aWords", "No arrival in h happens with probability e^(−λh), the Poisson probability of 0 with mean λh. At least one arrival is the complement.")}
        note={tx(t, "mQue_aNote", "For a small interval, a ≈ λh: the rate times the length. The exact form is what exercises usually ask for when they say to count each interval as \"arrival or no arrival\".")}>
        {r`a = P(\text{at least one arrival in } h) = 1 - e^{-\lambda h} \approx \lambda h`}
      </Equation>
      <Derivation t={t} label={tx(t, "mQue_derTwo", "Why two arrivals in one interval can be counted as one")}
        steps={[
          { tex: r`P(0) = e^{-\lambda h}, \qquad P(1) = \lambda h\,e^{-\lambda h}`, full: true, why: tx(t, "mQue_t1", "Poisson probabilities with mean λh: e^(−m) mᵏ/k! for k = 0 and k = 1") },
          { tex: r`P(\ge 2) = 1 - e^{-\lambda h}(1 + \lambda h)`, full: true, why: tx(t, "mQue_t2", "everything else") },
          { tex: r`e^{-x} = 1 - x + \tfrac{x^2}{2} - \dots \;\Rightarrow\; P(\ge 2) \approx \tfrac{(\lambda h)^2}{2}`, full: true, why: tx(t, "mQue_t3", "expand e^(−x) for small x = λh: the terms in x cancel and the first one left is x²/2") },
          { tex: r`\lambda = 0.5,\ h = 0.1: \quad a = 0.0488, \quad P(\ge 2) \approx 0.0012`, full: true, why: tx(t, "mQue_t4", "two arrivals in the same interval are about 40 times rarer than one, and the ratio shrinks with h. Counting them as one is an error that disappears as h → 0") },
        ]} />

      <H2>{tx(t, "mQue_svcTitle", "Service times and memorylessness")}</H2>
      <p>
        {tx(t, "mQue_svcBody",
          "Services are assumed exponential with rate μ (mean 1/μ). The exponential is memoryless: a service that has already lasted s minutes has the same chance of ending in the next h minutes as one that has just started. That is why the state can be the number of customers alone. Nobody needs to remember how long the current service has been running. With k servers busy at once, the next completion is the first of k independent exponential times:")}
      </p>
      <Derivation t={t} label={tx(t, "mQue_derMin", "k busy servers finish at rate kμ")}
        steps={[
          { tex: r`P(T > s + h \mid T > s) = \frac{e^{-\mu(s+h)}}{e^{-\mu s}} = e^{-\mu h}`, full: true, why: tx(t, "mQue_ml1", "memorylessness: the age s cancels, using P(T > t) = e^(−μt)") },
          { tex: r`P(\min(T_1, \dots, T_k) > t) = P(T_1 > t) \cdots P(T_k > t) = e^{-k\mu t}`, full: true, why: tx(t, "mQue_ml2", "the first completion is later than t only if every one of the k services is; they are independent, so the probabilities multiply") },
          { tex: r`d_n = 1 - e^{-\min(n,\,c)\,\mu h}`, full: true, why: tx(t, "mQue_ml3", "so the chance of a completion in an interval, with n customers and c servers, uses the number of busy servers, min(n, c): with 5 customers and 2 servers only 2 are being served") },
        ]} />

      <H2>{tx(t, "mQue_chainTitle", "The chain on the number in the system")}</H2>
      <p>
        {tx(t, "mQue_chainBody",
          "Let Xₖ be the number of customers in the system (waiting or being served) after k intervals, from 0 to the capacity K. In each interval an arrival happens with chance a and a completion with chance dₙ, independently. One arrival and no completion: up by one. One completion and no arrival: down by one. Both or neither: the count stays.")}
      </p>
      <Equation label={tx(t, "mQue_eqP", "The moves of the queue in one interval")}
        where={[
          [r`a`, tx(t, "mQue_wA2", "chance of an arrival in the interval, 1 − e^(−λh)")],
          [r`d_n`, tx(t, "mQue_wD", "chance of a completion with n in the system, 1 − e^(−min(n, c)μh); d₀ = 0, an empty system has nothing to finish")],
          [r`P_{n,n+1},\ P_{n,n-1}`, tx(t, "mQue_wUD", "the only moves to other states: up by one and down by one")],
        ]}
        words={tx(t, "mQue_pWords", "Up = arrival and no completion. Down = completion and no arrival. Stay = whatever is left, so that the row adds up to 1.")}
        note={tx(t, "mQue_pNote", "At full capacity K an arrival on its own is turned away, so the count stays at K. If an arrival and a departure fall in the same interval, one convention lets the newcomer take the freed place (the count stays K, the formula above); the other says it was already turned away (down to K − 1 with chance d_K). The difference vanishes as h → 0; follow the convention your course uses.")}>
        {r`P_{n,n+1} = a\,(1 - d_n), \qquad P_{n,n-1} = (1 - a)\,d_n, \qquad P_{nn} = 1 - P_{n,n+1} - P_{n,n-1}`}
      </Equation>
      <H3>{tx(t, "mQue_cafeTitle", "The café: λ = 0.5, mean service 1 minute, K = 3, h = 0.1")}</H3>
      <p>
        {tx(t, "mQue_cafeBody",
          "a = 1 − e^(−0.05) = 0.04877 and, with one barista, d = 1 − e^(−0.1) = 0.09516 whenever someone is inside. Rounded to five decimals:")}
      </p>
      <LessonTable
        headers={[tx(t, "mQue_tFrom", "from ↓ to →"), "0", "1", "2", "3"]}
        rows={[
          ["0", "0.95123", "0.04877", "0", "0"],
          ["1", "0.09052", "0.86535", "0.04413", "0"],
          ["2", "0", "0.09052", "0.86535", "0.04413"],
          ["3", "0", "0", "0.09052", "0.90948"],
        ]}
      />
      <p>
        {tx(t, "mQue_cafeRead",
          "Row 0: an arrival (0.04877) is the only way out. Row 1: up needs an arrival and no completion, 0.04877 × 0.90484 = 0.04413; down needs a completion and no arrival, 0.95123 × 0.09516 = 0.09052. Row 3: a lone arrival is turned away, so the stay probability gets that 0.04413 as well.")}
      </p>

      <H2>{tx(t, "mQue_bdTitle", "Solving it: births and deaths")}</H2>
      <p>
        {tx(t, "mQue_bdBody",
          "A chain that only moves up or down by one is a birth–death chain, and for it detailed balance holds: in the long run the flow up across the edge between n and n + 1 equals the flow down. That gives each π(n + 1) from π(n) with one multiplication, with no system to solve, even for K = 150.")}
      </p>
      <Equation label={tx(t, "mQue_eqBD", "Birth–death chains")}
        where={[
          [r`\pi(n)`, tx(t, "mQue_wPi", "the long-run probability of n customers in the system")],
          [r`P_{n,n+1}`, tx(t, "mQue_wUp", "the chance of going up from n")],
          [r`P_{n+1,n}`, tx(t, "mQue_wDown", "the chance of coming down from n + 1")],
        ]}
        words={tx(t, "mQue_bdWords", "Flow up across an edge equals flow down. Start from π(0) = 1, multiply your way up, and divide everything by the total at the end.")}>
        {r`\pi(n)\,P_{n,n+1} = \pi(n+1)\,P_{n+1,n} \;\Rightarrow\; \pi(n+1) = \pi(n)\,\frac{P_{n,n+1}}{P_{n+1,n}}`}
      </Equation>
      <Derivation t={t} label={tx(t, "mQue_derCafe", "The café's stationary distribution")}
        steps={[
          { tex: r`\frac{\pi(1)}{\pi(0)} = \frac{0.04877}{0.09052} = 0.53877`, full: true, why: tx(t, "mQue_c1", "up from 0 over down from 1") },
          { tex: r`\frac{\pi(2)}{\pi(1)} = \frac{\pi(3)}{\pi(2)} = \frac{0.04413}{0.09052} = 0.48751`, full: true, why: tx(t, "mQue_c2", "the same up and down probabilities for the other two edges") },
          { tex: r`(1,\ 0.53877,\ 0.26266,\ 0.12805), \quad \text{sum} = 1.92948`, full: true, why: tx(t, "mQue_c3", "multiply along: 0.53877 × 0.48751 = 0.26266, then × 0.48751 again") },
          { tex: r`\pi = (0.51828,\ 0.27923,\ 0.13613,\ 0.06636)`, full: true, why: tx(t, "mQue_c4", "divide by the sum. The café is empty about half the time and full 6.6 % of the time") },
        ]} />

      <H2>{tx(t, "mQue_measTitle", "What to measure: L, Lq, W, Wq")}</H2>
      <Equation label={tx(t, "mQue_eqL", "Averages and Little's law")}
        where={[
          [r`L`, tx(t, "mQue_wL", "the mean number in the system (waiting plus being served)")],
          [r`L_q`, tx(t, "mQue_wLq", "the mean number waiting: with n customers and c servers, n − c are waiting if n > c, none otherwise")],
          [r`\lambda_{\text{ef}}`, tx(t, "mQue_wLe", "the effective arrival rate: arrivals that get in. A customer who arrives when the system is full, which happens a share π(K) of the time, never enters")],
          [r`W,\ W_q`, tx(t, "mQue_wW", "the mean time a customer who gets in spends in the system, and waiting in line")],
        ]}
        words={tx(t, "mQue_measWords", "L and Lq are averages over π. W and Wq follow from Little's law: the number inside equals the rate at which people come in times how long each stays.")}
        note={tx(t, "mQue_measNote", "Use λ_ef, not λ: dividing by λ would count turned-away customers as people who spent zero time inside. In the continuous model W = Wq + 1/μ exactly (waiting, then a service of mean 1/μ); in the chain it holds approximately.")}>
        {r`L = \sum_n n\,\pi(n), \quad L_q = \sum_{n > c} (n - c)\,\pi(n), \quad \lambda_{\text{ef}} = \lambda\,(1 - \pi(K)), \quad W = \frac{L}{\lambda_{\text{ef}}}, \quad W_q = \frac{L_q}{\lambda_{\text{ef}}}`}
      </Equation>
      <p>
        {tx(t, "mQue_littleBody",
          "Why Little's law holds: watch the café for a long time T and add up everyone's time inside. Counted customer by customer, that is about λ_ef·T customers × W minutes each. Counted minute by minute, it is the number inside at each moment added over the T minutes, about L × T. The two counts are the same total, so L·T = λ_ef·T·W and L = λ_ef W. Nothing in the argument used exponential times; Little's law holds for almost any queue.")}
      </p>
      <Derivation t={t} label={tx(t, "mQue_derMeas", "The café's measures")}
        steps={[
          { tex: r`L = 1(0.27923) + 2(0.13613) + 3(0.06636) = 0.7506`, full: true, why: tx(t, "mQue_e1", "n times π(n), added") },
          { tex: r`L_q = 1(0.13613) + 2(0.06636) = 0.2689`, full: true, why: tx(t, "mQue_e2", "with one barista, 2 customers means 1 waiting and 3 means 2 waiting") },
          { tex: r`\lambda_{\text{ef}} = 0.5\,(1 - 0.06636) = 0.4668`, full: true, why: tx(t, "mQue_e3", "6.6 % of arrivals find the café full and leave") },
          { tex: r`W = \frac{0.7506}{0.4668} = 1.608\ \text{min}, \qquad W_q = \frac{0.2689}{0.4668} = 0.576\ \text{min}`, full: true, why: tx(t, "mQue_e4", "Little's law for the whole system and for the line. W − Wq ≈ 1.03, close to the mean service of 1 minute") },
        ]} />

      <H2>{tx(t, "mQue_limitTitle", "How good is the chain? Let h shrink")}</H2>
      <p>
        {tx(t, "mQue_limitBody",
          "As h → 0, a ≈ λh and dₙ ≈ min(n, c)μh, so each ratio up/down tends to λ/(min(n + 1, c)μ): the h cancels. That gives the exact distribution of the continuous-time queue, written M/M/c/K (Markovian arrivals, Markovian services, c servers, capacity K):")}
      </p>
      <Equation label={tx(t, "mQue_eqExact", "The continuous-time M/M/c/K queue")}
        where={[
          [r`\lambda,\ \mu`, tx(t, "mQue_wLM", "arrival rate and service rate (per server)")],
          [r`\min(k, c)`, tx(t, "mQue_wMin", "the number of servers busy with k customers in the system")],
        ]}
        words={tx(t, "mQue_exWords", "Each step up multiplies by the arrival rate over the total service rate at the next level.")}
        note={tx(t, "mQue_exNote", "For the café, λ/μ = 0.5 at every level: π ∝ (1, 1/2, 1/4, 1/8), that is (8, 4, 2, 1)/15. Then L = 11/15 = 0.7333, λ_ef = 7/15, W = 11/7 = 1.571 and Wq = 4/7 = 0.571, so W − Wq = 1 exactly. The chain with h = 0.1 gave 0.7506; with h = 0.001 it gives 0.7335.")}>
        {r`\pi(n) \propto \prod_{k=1}^{n} \frac{\lambda}{\min(k,\,c)\,\mu}, \qquad n = 0, 1, \dots, K`}
      </Equation>
      <Callout type="info" t={t}>
        {tx(t, "mQue_bias", "Why h = 0.1 overestimates the crowd: in the chain an arrival and a departure in the same interval cancel out, but an empty café has nothing to cancel with, so the step up from 0 is a little more likely than it should be (a instead of a(1 − d)). The error is of the order of h.")}
      </Callout>

      <QueueFigure t={t} />

      <H2>{tx(t, "mQue_bigTitle", "More servers, more room")}</H2>
      <p>
        {tx(t, "mQue_bigBody",
          "Nothing changes with c servers except dₙ, which grows with the number busy until all c are working. A large capacity K is no harder either: the product formula has one factor per level. When K is large and λ < cμ (fewer arrivals than the servers can handle), the probabilities of the top levels are tiny, the loss π(K) is practically 0, and the queue behaves like one with unlimited room. If λ ≥ cμ, the line grows without limit in an unlimited queue, and in a limited one it stays close to full.")}
      </p>

      <H2>{tx(t, "mQue_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mQue_tWrong", "Wrong"), tx(t, "mQue_tRight", "Right"), tx(t, "mQue_tWhy", "Why")]}
        rows={[
          [tx(t, "mQue_m1w", "completion chance μh with 2 servers busy"), "1 − e^(−2μh)", tx(t, "mQue_m1", "the first of two exponentials ends at rate 2μ")],
          [tx(t, "mQue_m2w", "a completion from state 0"), "d₀ = 0", tx(t, "mQue_m2", "an empty system has no service to finish")],
          [tx(t, "mQue_m3w", "an arrival from K goes to K + 1"), tx(t, "mQue_m3r", "it is turned away: the count stays K"), tx(t, "mQue_m3", "the capacity includes the customers being served")],
          [tx(t, "mQue_m4w", "W = L/λ"), "W = L/(λ(1 − π(K)))", tx(t, "mQue_m4", "only the arrivals that get in spend time inside")],
          [tx(t, "mQue_m5w", "Lq = Σ n π(n) for n > c"), "Σ (n − c) π(n)", tx(t, "mQue_m5", "c of the n customers are being served, not waiting")],
          [tx(t, "mQue_m6w", "state = number + time served so far"), tx(t, "mQue_m6r", "the number alone"), tx(t, "mQue_m6", "exponential services are memoryless")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "distributions", title: tx(t, "mQue_rel1", "Common Distributions"), why: tx(t, "mQue_rel1b", "the Poisson and exponential distributions and how they connect.") },
        { track: "Math", id: "markov-chains", title: tx(t, "mQue_rel2", "Markov Chains"), why: tx(t, "mQue_rel2b", "πP = π, detailed balance and long-run averages.") },
      ]} />

      <KeyIdeas t={t} id="mQue" items={[
        "Poisson arrivals: an arrival in an interval h with chance a = 1 − e^(−λh) ≈ λh; two in one interval have chance ≈ (λh)²/2.",
        "Exponential services are memoryless, so the state is just the number in the system; k busy servers finish at rate kμ.",
        "Per interval: up = a(1 − dₙ), down = (1 − a)dₙ, stay = the rest; d₀ = 0; at K a lone arrival is lost.",
        "Moves of ±1 only: detailed balance gives π(n + 1) = π(n)·P(n→n+1)/P(n+1→n).",
        "L = Σ nπ(n), Lq = Σ (n − c)π(n); W = L/λ_ef and Wq = Lq/λ_ef with λ_ef = λ(1 − π(K)).",
        "As h → 0 the chain tends to the continuous M/M/c/K queue, π(n) ∝ Π λ/(min(k, c)μ).",
      ]} />
    </Article>
  );
}

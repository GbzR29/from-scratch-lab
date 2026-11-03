"use client";

// Probability & Statistics: chains with memory. A walk whose next step depends
// on the direction it came from is not Markov in its position; putting the
// direction into the state makes it Markov again. Building the enlarged
// chain (only the states that can occur, forced turns at the ends), solving
// it by balance equations, adding states back up to positions, and a
// two-step memory (today and yesterday) with the same method.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { MemoryWalkFigure } from "@/components/lesson/figures/markov/MemoryWalkFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function ChainsWithMemoryContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mMem_intro",
          "A guard patrols a corridor with four posts and tends to keep walking the way he is going. Where he goes next depends on where he is and on which way he was walking, so his position alone is not a Markov chain: two guards at the same post can have different futures. The cure is not a new theory but a better choice of state. Put the missing memory into the state, and the process becomes an ordinary Markov chain again, with everything from the previous chapters available: transition matrix, πP = π, long-run shares.")}
      </Lead>

      <Goals t={t} id="mMem" items={[
        "Recognise when the obvious states of a process are not Markov.",
        "Enlarge the state with just the memory the rule needs, and list only the states that can occur.",
        "Build the transition matrix of the enlarged chain, including forced moves at the ends.",
        "Solve it, and add states back up to answer questions about the original quantity.",
        "Handle a rule that looks two steps back.",
      ]} />

      <H2>{tx(t, "mMem_failTitle", "When the obvious states are not enough")}</H2>
      <p>
        {tx(t, "mMem_failBody",
          "Number the posts 1 to 4 from left to right. The rule: if the last step was to the right, the next one is also to the right with probability r = 0.5; if it was to the left, the next is also to the left with probability l = 0.75. At post 1 or post 4 he has no choice and turns back. Call his position after n steps Xₙ. A Markov chain needs P(Xₙ₊₁ = j | the whole past) to depend only on Xₙ. Look at a guard standing at post 2:")}
      </p>
      <Equation label={tx(t, "mMem_eqFail", "Same present, different futures")}
        where={[
          [r`X_n`, tx(t, "mMem_wX", "the post after n steps")],
          [r`r`, tx(t, "mMem_wR", "the chance of another step to the right after a step to the right")],
          [r`l`, tx(t, "mMem_wL", "the chance of another step to the left after a step to the left; 1 − l is the chance of turning round to the right")],
        ]}
        words={tx(t, "mMem_failWords", "Both guards are at post 2 now. The one who came from post 1 was walking right and goes on with chance r; the one who came from post 3 was walking left, and going right means turning, chance 1 − l. The past changes the future, so post alone is not a Markov state.")}
        note={tx(t, "mMem_failNote", "With r = 0.5 and l = 0.75 the two numbers are 0.5 and 0.25. If they were equal (r = 1 − l), the direction would not matter and the position would be Markov after all.")}>
        {r`P(X_{n+1} = 3 \mid X_n = 2,\ X_{n-1} = 1) = r \qquad P(X_{n+1} = 3 \mid X_n = 2,\ X_{n-1} = 3) = 1 - l`}
      </Equation>

      <H2>{tx(t, "mMem_fixTitle", "Put the memory into the state")}</H2>
      <p>
        {tx(t, "mMem_fixBody",
          "The rule looks at two things: the post and the direction of the last step. So the state must hold both: Yₙ = (Xₙ, Dₙ), where Dₙ is → or ← for the step that brought him to Xₙ. Now the next state depends only on the current one, because everything the rule reads is in it. Not every pair can occur. He can only arrive at post 1 walking left and at post 4 walking right, so instead of 4 × 2 = 8 states there are 6:")}
      </p>
      <LessonTable
        headers={[tx(t, "mMem_tState", "State"), tx(t, "mMem_tMeans", "Meaning"), tx(t, "mMem_tNext", "Next state (probability)")]}
        rows={[
          ["1←", tx(t, "mMem_s1", "at post 1, arrived walking left"), tx(t, "mMem_n1", "2→ (1): forced to turn")],
          ["2→", tx(t, "mMem_s2", "at post 2, arrived walking right"), tx(t, "mMem_n2", "3→ (r = 0.5), 1← (1 − r = 0.5)")],
          ["2←", tx(t, "mMem_s3", "at post 2, arrived walking left"), tx(t, "mMem_n3", "1← (l = 0.75), 3→ (1 − l = 0.25)")],
          ["3→", tx(t, "mMem_s4", "at post 3, arrived walking right"), tx(t, "mMem_n4", "4→ (r = 0.5), 2← (1 − r = 0.5)")],
          ["3←", tx(t, "mMem_s5", "at post 3, arrived walking left"), tx(t, "mMem_n5", "2← (l = 0.75), 4→ (1 − l = 0.25)")],
          ["4→", tx(t, "mMem_s6", "at post 4, arrived walking right"), tx(t, "mMem_n6", "3← (1): forced to turn")],
        ]}
      />
      <p>
        {tx(t, "mMem_fixBody2",
          "Read the names carefully: the arrow in the next state is the direction of the step just taken. From 2→, going on to the right lands on post 3 still walking right, 3→; turning lands on post 1 walking left, 1←. Each row adds up to 1, as every row of a transition matrix must. The forced turns at the ends are rows with a single 1.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "mMem_info", "Some books describe the walker by the direction of its next step instead of the last one. Both work, as long as the state contains everything the rule needs and you use one convention throughout. The long-run share of each post comes out the same.")}
      </Callout>

      <H2>{tx(t, "mMem_solveTitle", "Solving the enlarged chain")}</H2>
      <p>
        {tx(t, "mMem_solveBody",
          "The stationary distribution satisfies πP = π: for each state, the probability flowing in equals the probability sitting there. Write one equation per state, adding the arrows that arrive at it. Call π(1←) = A, π(2→) = B, π(2←) = C, π(3→) = D, π(3←) = E, π(4→) = F.")}
      </p>
      <Derivation t={t} label={tx(t, "mMem_der", "The guard's chain, state by state")}
        steps={[
          { tex: r`B = A \qquad E = F`, full: true, why: tx(t, "mMem_d1", "2→ is reached only from 1← (the forced turn), with probability 1; likewise 3← only from 4→") },
          { tex: r`F = r\,D + (1 - l)\,E \;\Rightarrow\; l\,E = r\,D \;\Rightarrow\; E = \tfrac{r}{l}\,D`, full: true, why: tx(t, "mMem_d2", "4→ is reached from 3→ going on (r) and from 3← turning (1 − l). Replace F by E (previous line) and collect the E terms: E − (1 − l)E = lE") },
          { tex: r`C = (1 - r)\,D + l\,E = (1 - r)\,D + r\,D = D`, full: true, why: tx(t, "mMem_d3", "2← is reached from 3→ turning and from 3← going on; with lE = rD the two terms add up to D") },
          { tex: r`D = r\,B + (1 - l)\,C \;\Rightarrow\; l\,D = r\,B \;\Rightarrow\; D = \tfrac{r}{l}\,B`, full: true, why: tx(t, "mMem_d4", "3→ is reached from 2→ going on and from 2← turning; replace C by D and collect, exactly as for E") },
          { tex: r`(A, B, C, D, E, F) \propto (1,\ 1,\ q,\ q,\ q^2,\ q^2), \qquad q = \tfrac{r}{l}`, full: true, why: tx(t, "mMem_d5", "start from A = 1 and use each line: B = 1, D = q, C = D = q, E = qD = q², F = E = q². The remaining equation, for A, is then automatically true (it always is: one equation of πP = π is redundant)") },
          { tex: r`q = \tfrac{0.5}{0.75} = \tfrac{2}{3}, \qquad \text{sum} = 2\,(1 + q + q^2) = \tfrac{38}{9}`, full: true, why: tx(t, "mMem_d6", "with the guard's numbers; dividing every weight by the sum makes the probabilities add up to 1") },
        ]} />
      <p>
        {tx(t, "mMem_backBody",
          "The question was about posts, not about states. The guard is at post 2 whenever he is in 2→ or in 2←, so the share of time at a post is the sum of the probabilities of its states:")}
      </p>
      <Equation label={tx(t, "mMem_eqBack", "From states back to posts")}
        where={[
          [r`\pi(s)`, tx(t, "mMem_wPiS", "the long-run probability of state s of the enlarged chain")],
          [r`\text{pos}(s)`, tx(t, "mMem_wPos", "the post that state s is at (the first part of its name)")],
        ]}
        words={tx(t, "mMem_backWords", "Add the shares of all the states that sit at post i. The direction was only needed to make the chain Markov; once π is known, it can be added away.")}
        note={tx(t, "mMem_backNote", "For the guard: post 1 gets A = 9/38, post 2 gets B + C = (1 + 2/3) · 9/38 = 15/38, post 3 gets D + E = (2/3 + 4/9) · 9/38 = 10/38 and post 4 gets F = (4/9) · 9/38 = 4/38. They add up to 38/38. He spends more time on the left because he holds a leftward walk more stubbornly (l > r).")}>
        {r`P(\text{post } i) = \sum_{s\,:\ \text{pos}(s) = i} \pi(s)`}
      </Equation>
      <H3>{tx(t, "mMem_symTitle", "A walker that does not prefer a side")}</H3>
      <p>
        {tx(t, "mMem_symBody",
          "If r = l, then q = 1 and all six states are equally likely, 1/6 each, however stubborn the walker is. The end posts have only one state each, so they get 1/6 of the time, and the middle posts 2/6. Stubbornness changes how the walk looks (long runs instead of jitter) but not where the time goes. Check it in the figure: set r = l and move them together.")}
      </p>

      <MemoryWalkFigure t={t} />

      <H2>{tx(t, "mMem_twoTitle", "Remembering two steps")}</H2>
      <p>
        {tx(t, "mMem_twoBody",
          "Some rules look further back. In a simple weather model, whether it rains tomorrow depends on today and on yesterday: rain tomorrow with probability 0.8 after two rainy days, 0.6 if it rained today but not yesterday, 0.3 if it rained yesterday but not today, and 0.1 after two dry days. The day's weather alone is not Markov. The state must hold both days: (yesterday, today), four states. Moving one day forward, today becomes yesterday and tomorrow becomes today.")}
      </p>
      <LessonTable
        headers={[tx(t, "mMem_tState", "State"), tx(t, "mMem_tMeans", "Meaning"), tx(t, "mMem_tNext", "Next state (probability)")]}
        rows={[
          ["RR", tx(t, "mMem_wRR", "rain yesterday, rain today"), "RR (0.8), RD (0.2)"],
          ["DR", tx(t, "mMem_wDR", "dry yesterday, rain today"), "RR (0.6), RD (0.4)"],
          ["RD", tx(t, "mMem_wRD", "rain yesterday, dry today"), "DR (0.3), DD (0.7)"],
          ["DD", tx(t, "mMem_wDD", "dry yesterday, dry today"), "DR (0.1), DD (0.9)"],
        ]}
      />
      <Derivation t={t} label={tx(t, "mMem_derW", "Rain with a two-day memory")}
        steps={[
          { tex: r`\pi_{RR} = 0.8\,\pi_{RR} + 0.6\,\pi_{DR} \;\Rightarrow\; \pi_{RR} = 3\,\pi_{DR}`, full: true, why: tx(t, "mMem_w1", "RR is reached from the states whose \"today\" is rainy, followed by rain: from RR with 0.8 and from DR with 0.6. Collect: 0.2 π_RR = 0.6 π_DR") },
          { tex: r`\pi_{RD} = 0.2\,\pi_{RR} + 0.4\,\pi_{DR} = 0.6\,\pi_{DR} + 0.4\,\pi_{DR} = \pi_{DR}`, full: true, why: tx(t, "mMem_w2", "RD is reached from the same two states followed by a dry day; replace π_RR by 3 π_DR") },
          { tex: r`\pi_{DD} = 0.7\,\pi_{RD} + 0.9\,\pi_{DD} \;\Rightarrow\; \pi_{DD} = 7\,\pi_{RD} = 7\,\pi_{DR}`, full: true, why: tx(t, "mMem_w3", "DD is reached from RD and DD followed by a dry day. Collect: 0.1 π_DD = 0.7 π_RD") },
          { tex: r`(\pi_{RR}, \pi_{DR}, \pi_{RD}, \pi_{DD}) = \left(\tfrac{3}{12}, \tfrac{1}{12}, \tfrac{1}{12}, \tfrac{7}{12}\right)`, full: true, why: tx(t, "mMem_w4", "the weights 3, 1, 1, 7 add up to 12; divide each by 12") },
          { tex: r`P(\text{rain}) = \pi_{RR} + \pi_{DR} = \tfrac{4}{12} = \tfrac{1}{3}`, full: true, why: tx(t, "mMem_w5", "back to the original question by adding: it rains today in the two states whose second letter is R") },
        ]} />
      <p>
        {tx(t, "mMem_twoWalk",
          "A walker whose rule depends on its last two steps works the same way: the state is (post, direction of the last step, direction of the step before). Only combinations that can really happen count. Arriving at post 1 always means the last step was to the left; at post 2 of a corridor with only 3 posts the two last steps always point opposite ways. The second mode of the figure builds these states for any corridor and lists them under the bars.")}
      </p>

      <H2>{tx(t, "mMem_recipeTitle", "Choosing the states: a checklist")}</H2>
      <ol className="list-decimal pl-6 space-y-1">
        <li>{tx(t, "mMem_c1", "Write the rule for the next step in words, including what happens at the edges.")}</li>
        <li>{tx(t, "mMem_c2", "List everything the rule looks at: the position, the last direction, the last two days…")}</li>
        <li>{tx(t, "mMem_c3", "Make the state exactly that list. Less, and the chain is not Markov; more, and it is Markov but needlessly big.")}</li>
        <li>{tx(t, "mMem_c4", "Keep only the states that can occur: start from one state and follow the arrows until no new state appears.")}</li>
        <li>{tx(t, "mMem_c5", "Write each row of P and check that it adds up to 1.")}</li>
        <li>{tx(t, "mMem_c6", "Solve πP = π, then add states up to answer the question about the original quantity.")}</li>
      </ol>

      <MathPracticeFigure t={t} set="memory" />

      <H2>{tx(t, "mMem_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mMem_tWrong", "Wrong"), tx(t, "mMem_tRight", "Right"), tx(t, "mMem_tWhy", "Why")]}
        rows={[
          [tx(t, "mMem_m1w", "a chain on the positions alone"), tx(t, "mMem_m1r", "position + direction"), tx(t, "mMem_m1", "the next step depends on the direction, so it must be in the state")],
          [tx(t, "mMem_m2w", "8 states for 4 posts"), tx(t, "mMem_m2r", "6 states"), tx(t, "mMem_m2", "1→ and 4← can never occur; unreachable states make πP = π have many solutions or none")],
          [tx(t, "mMem_m3w", "forgetting the forced turn"), tx(t, "mMem_m3r", "a row with a single 1"), tx(t, "mMem_m3", "at the ends the rule's probabilities do not apply")],
          [tx(t, "mMem_m4w", "reporting π of the states"), tx(t, "mMem_m4r", "add the states of each post"), tx(t, "mMem_m4", "the question is about posts; 2→ and 2← are both post 2")],
          [tx(t, "mMem_m5w", "next state named by the old direction"), tx(t, "mMem_m5r", "name it by the step just taken"), tx(t, "mMem_m5", "otherwise rows point to the wrong columns")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "markov-chains", title: tx(t, "mMem_rel1", "Markov Chains"), why: tx(t, "mMem_rel1b", "the Markov property, the transition matrix and solving πP = π.") },
        { track: "Math", id: "absorbing-chains", title: tx(t, "mMem_rel2", "Absorbing Chains"), why: tx(t, "mMem_rel2b", "the same \"remember just enough\" idea for patterns of coin flips.") },
      ]} />

      <KeyIdeas t={t} id="mMem" items={[
        "A process is Markov in a set of states only if the next step depends on the current state alone.",
        "When the rule looks at more than the position (the last direction, yesterday), put that memory into the state.",
        "Keep only the states that can occur; at the ends the rule is replaced by forced moves.",
        "The enlarged chain is an ordinary Markov chain: build P, check the rows, solve πP = π.",
        "To answer for the original quantity, add the probabilities of the states that share it.",
        "Two-step memory: the state is the last two observations; one step forward shifts them along.",
      ]} />
    </Article>
  );
}

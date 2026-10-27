"use client";

// Combinatorics 1: what combinatorics is and why it is studied; listing
// carefully with a tree of possibilities (figure); the multiplication
// principle and why it works; restrictions handled first; the addition
// principle for alternatives that cannot both happen; "and then" against
// "or"; cases first, then stages; the two questions (order? repetition?)
// that sort every problem into the chapters that follow; worked examples;
// mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ChoiceTreeFigure } from "@/components/lesson/figures/math/ChoiceTreeFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function CountingContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mCnt_intro",
          "Combinatorics is the part of mathematics that counts without listing. How many passwords of eight characters exist? In how many orders can ten people stand in a queue? How many different bets can be placed in a lottery? For small cases you could write every possibility down, but the answers grow so fast that listing soon becomes impossible: the queue alone has more than three and a half million orders. Combinatorics replaces the list with a few principles that give the number directly. This first chapter explains what the subject is, why it is worth learning, and the two principles that every other counting method in this section is built from.")}
      </Lead>

      <Goals t={t} id="mCnt" items={[
        "Say what combinatorics studies and name places where counting is needed.",
        "Draw a tree of possibilities and read the number of results from it.",
        "Count choices made one after another with the multiplication principle, handling restrictions first.",
        "Count alternatives that cannot both happen with the addition principle, and tell \"and then\" from \"or\".",
        "Sort a counting problem by its two key questions: does order matter, and may an item repeat?",
      ]} />

      <H2>{tx(t, "mCnt_whatTitle", "What combinatorics is")}</H2>
      <p>
        {tx(t, "mCnt_whatBody",
          "Combinatorics, also called the analysis of combinations, studies the ways in which objects can be chosen, arranged and grouped, and above all how many such ways there are. Its questions have the form \"in how many ways can…?\". The objects can be anything: people in a queue, digits in a password, numbers on a lottery ticket, colours on a flag, roads between cities. What matters is a precise rule saying which results are allowed and when two results count as the same.")}
      </p>
      <p>
        {tx(t, "mCnt_whyBody",
          "Why study it? First, because it is the foundation of probability: when every result of an experiment is equally likely, the probability of an event is the number of favourable results divided by the number of possible results, and both numbers come from counting. Second, because counting decides practical questions: whether a password is safe, how many licence plates a format allows, how many matches a tournament needs, how long a computer takes to try every option. Third, because it trains a way of thinking: splitting a big question into small decisions, and checking that nothing is counted twice or forgotten.")}
      </p>
      <LessonTable
        headers={[tx(t, "mCnt_hWhere", "Where counting appears"), tx(t, "mCnt_hQuestion", "A typical question")]}
        rows={[
          [tx(t, "mCnt_w1", "Probability"), tx(t, "mCnt_w1q", "What is the chance that one lottery ticket wins? (one out of how many possible draws?)")],
          [tx(t, "mCnt_w2", "Security"), tx(t, "mCnt_w2q", "How many PINs of 4 digits are there, and how long would it take to try them all?")],
          [tx(t, "mCnt_w3", "Codes and identification"), tx(t, "mCnt_w3q", "How many licence plates, phone numbers or ID codes does a format allow?")],
          [tx(t, "mCnt_w4", "Sport and planning"), tx(t, "mCnt_w4q", "How many matches are played if every team meets every other team once?")],
          [tx(t, "mCnt_w5", "Computing"), tx(t, "mCnt_w5q", "How many orders must a program check to find the shortest delivery route?")],
          [tx(t, "mCnt_w6", "Biology and chemistry"), tx(t, "mCnt_w6q", "How many different sequences can a short chain of DNA bases form?")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "mCnt_mapInfo", "This section has six chapters. This one gives the two basic principles. Then come factorials and permutations (putting everything in order), arrangements (putting some items in order), combinations (choosing a group, order ignored), harder counts (repetition, groups, overlaps) and, to close, the tricks and traps that solve most exam problems.")}
      </Callout>

      <H2>{tx(t, "mCnt_treeTitle", "Listing carefully: the tree of possibilities")}</H2>
      <p>
        {tx(t, "mCnt_treeBody",
          "Before any formula, the safest way to count is a list made in a fixed order, so that nothing is skipped and nothing is repeated. A tree of possibilities organises that list. You own 3 shirts and 4 pairs of trousers and want to know how many outfits you can make. Start from a single point. Draw one branch for each shirt. From the end of every shirt branch, draw one branch for each pair of trousers. Every path from the start to a tip is one outfit, and every outfit is exactly one path. Counting outfits has become counting tips.")}
      </p>
      <ChoiceTreeFigure t={t} />
      <p>
        {tx(t, "mCnt_treeRead",
          "Look at the shape of the tree. The first level has 3 branches. Each of them splits into the same number of branches, 4, whatever shirt was chosen. So the tips come in 3 groups of 4: 3 · 4 = 12 outfits. Add a third level with 2 pairs of shoes and every one of the 12 tips splits again into 2: 24 outfits. The tree shows the principle, but it also shows why it soon stops being practical: with 10 levels of 10 branches it would need ten billion tips.")}
      </p>

      <H2>{tx(t, "mCnt_multTitle", "The multiplication principle")}</H2>
      <p>
        {tx(t, "mCnt_multBody",
          "The tree turns into a rule. When a result is built by making several choices one after another, and the number of options at each stage does not depend on what was chosen before, the number of results is the product of the numbers of options. This rule is called the multiplication principle, or the fundamental counting principle.")}
      </p>
      <Equation label={tx(t, "mCnt_eqMult", "The multiplication principle")}
        where={[
          [r`k`, tx(t, "mCnt_wK", "the number of choices made one after another (the stages)")],
          [r`n_i`, tx(t, "mCnt_wNi", "the number of options at stage i, which must be the same whatever was chosen at the earlier stages")],
          [r`N`, tx(t, "mCnt_wN", "the number of complete results: different sequences of choices")],
        ]}
        note={tx(t, "mCnt_multNote", "The options themselves may change with earlier choices; only their number must not. After the gold medal is given, the runners left for silver are different people each time, but there are always 7 of them.")}
        words={tx(t, "mCnt_multWords", "When choices are made one after another, multiply the number of options at each stage.")}>
        {r`N = n_1 \cdot n_2 \cdot \ldots \cdot n_k`}
      </Equation>
      <Derivation t={t} label={tx(t, "mCnt_eqWhyMult", "Why multiplication and not addition")}
        steps={[
          { tex: r`n_1`, full: true, why: tx(t, "mCnt_wm1", "after the first choice there are n₁ partial results") },
          { tex: r`\underbrace{n_2 + n_2 + \cdots + n_2}_{n_1} = n_1 \cdot n_2`, full: true, why: tx(t, "mCnt_wm2", "each of them is continued in n₂ ways, so there are n₁ groups of n₂: adding n₂ to itself n₁ times is multiplying") },
          { tex: r`(n_1 \cdot n_2) \cdot n_3 \cdots n_k = \green{n_1 n_2 \cdots n_k}`, full: true, why: tx(t, "mCnt_wm3", "every further stage repeats the argument with the results so far as the groups") },
        ]} />
      <p>
        {tx(t, "mCnt_plateBody",
          "Two examples. A four-digit PIN: each digit has 10 options and digits may repeat, so 10 · 10 · 10 · 10 = 10⁴ = 10 000 PINs. A licence plate in the Mercosur format has three letters, one digit, one letter and two digits (like BRA2E19). With 26 letters and 10 digits: 26 · 26 · 26 · 10 · 26 · 10 · 10 = 26⁴ · 10³ = 456 976 000 plates. The number grows quickly because every new stage multiplies everything that came before.")}
      </p>

      <H3>{tx(t, "mCnt_restrTitle", "Restrictions: deal with the fussy stage first")}</H3>
      <p>
        {tx(t, "mCnt_restrBody",
          "How many four-digit numbers have four different digits? A four-digit number cannot start with 0, so the first digit has 9 options (1 to 9). The second may be anything except the first digit: 10 − 1 = 9 options, because 0 is allowed now. The third avoids the two digits used: 8. The fourth: 7. Total 9 · 9 · 8 · 7 = 4536. Had we started with the last digit, the number of options for the first digit would depend on whether 0 had already been used, and the principle would no longer apply directly. Rule of thumb: fill the most restricted position first.")}
      </p>
      <Derivation t={t} label={tx(t, "mCnt_eqFlag", "A flag of 3 stripes in 4 colours, neighbouring stripes different")}
        steps={[
          { tex: r`4`, full: true, why: tx(t, "mCnt_f1", "top stripe: no restriction yet, any of the 4 colours") },
          { tex: r`4 - 1 = 3`, full: true, why: tx(t, "mCnt_f2", "middle stripe: anything except the colour just above it") },
          { tex: r`4 - 1 = 3`, full: true, why: tx(t, "mCnt_f3", "bottom stripe: it only touches the middle stripe, so it may repeat the top colour") },
          { tex: r`4 \cdot 3 \cdot 3 = \green{36}`, full: true, why: tx(t, "mCnt_f4", "each stage has a fixed number of options, so the principle applies") },
        ]} />

      <H2>{tx(t, "mCnt_addTitle", "The addition principle")}</H2>
      <p>
        {tx(t, "mCnt_addBody",
          "Sometimes a task is done in one way or in another, never both. To travel between two cities you can take one of 3 buses or one of 2 trains. Nothing branches here: you pick a bus or you pick a train, so there are 3 + 2 = 5 ways. This is the addition principle: when the possible results split into groups that have nothing in common, the total is the sum of the sizes of the groups.")}
      </p>
      <Equation label={tx(t, "mCnt_eqAdd", "The addition principle")}
        where={[
          [r`m_j`, tx(t, "mCnt_wMj", "the number of results in group j (case j)")],
          [r`N`, tx(t, "mCnt_wNadd", "the total, valid only when no result belongs to two groups")],
        ]}
        note={tx(t, "mCnt_addNote", "If the groups overlap, adding counts the shared results twice. The chapter on harder counts shows how to repair that with inclusion–exclusion.")}
        words={tx(t, "mCnt_addWords", "When a result belongs to exactly one of several separate cases, add the number of results of each case.")}>
        {r`N = m_1 + m_2 + \cdots + m_r`}
      </Equation>
      <LessonTable
        headers={[tx(t, "mCnt_hWord", "The situation"), tx(t, "mCnt_hDo", "What to do"), tx(t, "mCnt_hEx", "Example")]}
        rows={[
          [tx(t, "mCnt_r1", "one choice and then another (stages)"), tx(t, "mCnt_r1d", "multiply"), tx(t, "mCnt_r1e", "shirt and then trousers: 3 · 4 = 12")],
          [tx(t, "mCnt_r2", "one choice or another (separate cases)"), tx(t, "mCnt_r2d", "add"), tx(t, "mCnt_r2e", "a bus or a train: 3 + 2 = 5")],
          [tx(t, "mCnt_r3", "cases, each made of stages"), tx(t, "mCnt_r3d", "multiply inside each case, then add the cases"), tx(t, "mCnt_r3e", "a 1-letter or a 2-letter code: 26 + 26 · 26 = 702")],
        ]}
      />
      <p>
        {tx(t, "mCnt_bothBody",
          "Most real problems use both principles. A trip goes from city A to city C, either directly by one of 2 flights, or through city B, with 3 roads from A to B and 4 roads from B to C. The trips through B are made of two stages: 3 · 4 = 12. The direct trips are a separate case: 2. The two cases cannot both happen, so add them: 12 + 2 = 14 trips. The order of the work is always the same: split into cases, count each case with stages, add the cases.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "mCnt_andOrTip", "A test for \"and\" against \"or\": ask whether one complete result uses both choices. An outfit has a shirt and trousers, so multiply. A trip uses a bus or a train, not both, so add.")}
      </Callout>

      <H2>{tx(t, "mCnt_twoQTitle", "The two questions that sort every problem")}</H2>
      <p>
        {tx(t, "mCnt_twoQBody",
          "Every counting problem in the next chapters is the multiplication principle in some form, but four situations come up so often that they have their own names and formulas. To know which one you face, ask two questions about the result you are counting. First: does order matter, that is, if you swap two of the chosen items, do you get a different result? Second: may an item be used more than once? A podium is ordered and nobody wins two medals. A PIN is ordered and digits may repeat. A committee is not ordered and nobody sits twice. A cup of ice cream with three scoops is not ordered, and a flavour may repeat.")}
      </p>
      <LessonTable
        headers={["", tx(t, "mCnt_tNoRep", "no repetition"), tx(t, "mCnt_tRep", "repetition allowed")]}
        rows={[
          [tx(t, "mCnt_tOrder", "order matters"), tx(t, "mCnt_tPerm", "arrangements and permutations (podium, a queue): chapters 2 and 3"), tx(t, "mCnt_tSeq", "sequences with repetition (PIN, plate): chapter 3")],
          [tx(t, "mCnt_tNoOrder", "order does not matter"), tx(t, "mCnt_tComb", "combinations (committee, lottery): chapter 4"), tx(t, "mCnt_tMulti", "combinations with repetition (ice cream): chapter 5")],
        ]}
      />

      <H2>{tx(t, "mCnt_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mCnt_ex1", "1. A restaurant offers 4 starters, 5 main courses and 3 desserts. A full meal has one of each: 4 · 5 · 3 = 60 meals. A meal with a main course and either a starter or a dessert (not both): 5 · (4 + 3) = 35.")}</p>
      <p>{tx(t, "mCnt_ex2", "2. Passwords of 6 lowercase letters: 26⁶ = 308 915 776. If no letter may repeat: 26 · 25 · 24 · 23 · 22 · 21 = 165 765 600, a little more than half.")}</p>
      <p>{tx(t, "mCnt_ex3", "3. Three-digit numbers that use only the digits 1, 2, 3, 4 and 5, repeats allowed: 5 · 5 · 5 = 125. Of these, the odd ones end in 1, 3 or 5: 5 · 5 · 3 = 75. Here the restricted position is the last one, so count it first in your head and then multiply.")}</p>
      <p>{tx(t, "mCnt_ex4", "4. A true-or-false test has 10 questions. Every way of answering all of them is a sequence of 10 choices of 2 options: 2¹⁰ = 1024. Guessing at random, the chance of a perfect score is 1 in 1024.")}</p>
      <p>{tx(t, "mCnt_ex5", "5. Codes of 1, 2 or 3 letters (26 letters, repeats allowed): three separate cases. 26 + 26² + 26³ = 26 + 676 + 17 576 = 18 278. This is how many columns a spreadsheet can label with up to three letters (A to ZZZ).")}</p>

      <H2>{tx(t, "mCnt_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mCnt_tWrong", "Wrong"), tx(t, "mCnt_tRight", "Right"), tx(t, "mCnt_tWhy", "Why")]}
        rows={[
          [tx(t, "mCnt_m1w", "3 shirts and 4 trousers: 3 + 4 = 7 outfits"), "3 · 4 = 12", tx(t, "mCnt_m1", "an outfit uses both choices, one after the other; each shirt combines with every pair of trousers")],
          [tx(t, "mCnt_m2w", "four-digit numbers with distinct digits: 10 · 9 · 8 · 7"), "9 · 9 · 8 · 7 = 4536", tx(t, "mCnt_m2", "the first digit cannot be 0; place the restricted digit first")],
          [tx(t, "mCnt_m3w", "3 buses or 2 trains: 3 · 2 = 6 ways"), "3 + 2 = 5", tx(t, "mCnt_m3", "a trip uses one or the other, never both; separate cases add")],
          [tx(t, "mCnt_m4w", "flag of 3 stripes, 4 colours, neighbours different: 4 · 3 · 2"), "4 · 3 · 3 = 36", tx(t, "mCnt_m4", "the bottom stripe only has to differ from its neighbour, so it may repeat the top colour")],
          [tx(t, "mCnt_m5w", "starting a count with the free positions"), tx(t, "mCnt_m5r", "start with the restricted ones"), tx(t, "mCnt_m5", "otherwise the options of a later position depend on earlier choices and the product is wrong")],
        ]}
      />

      <MathPracticeFigure t={t} set="countingPrinciples" />

      <Related t={t} links={[
        { track: "Math", id: "permutations", title: tx(t, "mCnt_rel1", "Factorials & Permutations"), why: tx(t, "mCnt_rel1b", "the next chapter: every item in order, repeated letters and round tables.") },
        { track: "Math", id: "sets", title: tx(t, "mCnt_rel2", "Sets"), why: tx(t, "mCnt_rel2b", "unions, intersections and the size of a cartesian product, the language behind both principles.") },
        { track: "Math", id: "probability", title: tx(t, "mCnt_rel3", "Probability Basics"), why: tx(t, "mCnt_rel3b", "where counting is used: favourable results over possible results.") },
      ]} />

      <KeyIdeas t={t} id="mCnt" items={[
        "Combinatorics counts the ways to choose, arrange and group objects without listing them; it is the base of probability.",
        "A tree of possibilities is an organised list: one level per choice, one tip per complete result.",
        "Choices made one after another multiply, as long as the number of options at each stage is fixed.",
        "Fill the most restricted position first, so that every later stage has a fixed number of options.",
        "Separate cases that cannot both happen add; split into cases first, count each with stages, then add.",
        "Two questions sort every problem: does order matter, and may an item repeat?",
      ]} />
    </Article>
  );
}

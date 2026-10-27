"use client";

// Combinatorics 5: harder counts. Combinations with repetition by stars and
// bars (figure), whole-number solutions of x + y + z = s with and without a
// minimum, the four basic formulas in one table; splitting into groups
// (labelled groups by stages, a condition on one group, unlabelled groups
// divided by the orders of equal groups); inclusion–exclusion for two and
// three sets (live formula); derangements via inclusion–exclusion and the
// 1/e limit; the pigeonhole principle; worked examples; mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { StarsBarsFigure } from "@/components/lesson/figures/math/StarsBarsFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

// ── Live formula: the numbers plugged in ──────────────────────────────────────

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Numbers from 1 to N divisible by a or by b, by inclusion–exclusion. */
function ieNumbers(v: Record<string, number>) {
  const { N, a, b } = v, l = (a * b) / gcd(a, b);
  const A = Math.floor(N / a), B = Math.floor(N / b), AB = Math.floor(N / l);
  return {
    tex: r`\begin{aligned} |A \cup B| &= \lfloor ${N}/${a} \rfloor + \lfloor ${N}/${b} \rfloor - \lfloor ${N}/${l} \rfloor \\ &= ${A} + ${B} - ${AB} = \amber{${A + B - AB}} \end{aligned}`,
    meter: (A + B - AB) / N,
  };
}

export function CountingAdvancedContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mCadv_intro",
          "Permutations, arrangements and combinations cover most counting problems, but a few situations need one more idea. Items that may be chosen more than once in a group with no order. Objects shared out among people or boxes. Groups that overlap, so that adding their sizes counts some results twice. Letters that must all miss their own envelopes. And questions that ask not \"how many\" but \"is it certain that…\". This chapter gives the standard method for each: stars and bars, splitting into groups, inclusion–exclusion, derangements and the pigeonhole principle.")}
      </Lead>

      <Goals t={t} id="mCadv" items={[
        "Count choices with repetition and no order with stars and bars, and whole-number solutions of x + y + z = s.",
        "Share different objects among labelled groups, with or without a condition, and handle groups with no labels.",
        "Count a union of overlapping sets with inclusion–exclusion.",
        "Count derangements, orders in which no item is in its own place.",
        "Use the pigeonhole principle to prove that some coincidence must happen.",
      ]} />

      <H2>{tx(t, "mCadv_starsTitle", "Combinations with repetition: stars and bars")}</H2>
      <p>
        {tx(t, "mCadv_starsBody",
          "An ice-cream shop has 5 flavours and you want a cup with 3 scoops. Flavours may repeat and the order of the scoops does not matter: two scoops of chocolate and one of lemon is one cup. This is neither an arrangement nor an ordinary combination. The trick is to draw each cup in a code. Line up the 5 flavours as boxes separated by 4 walls (bars), and draw each scoop as a star in its box. ★★|★||| means two scoops of flavour 1 and one of flavour 2. Every cup gives exactly one row of 3 stars and 4 bars, and every such row gives one cup.")}
      </p>
      <StarsBarsFigure t={t} />
      <p>
        {tx(t, "mCadv_starsCount",
          "A row has 3 + 4 = 7 places, and it is completely fixed once you say which 3 of the 7 places hold stars. So there are C(7, 3) = 35 cups. In general, choosing k items from n kinds with repetition and no order means k stars and n − 1 bars.")}
      </p>
      <Equation label={tx(t, "mCadv_eqStars", "Combinations with repetition")}
        where={[
          [r`n`, tx(t, "mCadv_wN", "the number of kinds to choose from (boxes), which need n − 1 bars between them")],
          [r`k`, tx(t, "mCadv_wK", "the number of items chosen (stars); a kind may be chosen many times or not at all")],
          [r`n + k - 1`, tx(t, "mCadv_wPlaces", "the length of the row of stars and bars")],
        ]}
        words={tx(t, "mCadv_starsWords", "Choosing k items from n kinds, repeats allowed and order ignored: choose which k of the n plus k minus 1 places hold the stars.")}>
        {r`CR_{n,k} = \binom{n + k - 1}{k}`}
      </Equation>
      <H3>{tx(t, "mCadv_solTitle", "Whole-number solutions of an equation")}</H3>
      <p>
        {tx(t, "mCadv_solBody",
          "How many solutions does x + y + z = 10 have in whole numbers x, y, z ≥ 0? Read it as 10 identical stars shared among 3 boxes x, y and z: 10 stars and 2 bars, C(12, 2) = 66 solutions. If every variable must be at least 1, give each one its 1 first. That uses 3 of the 10, and the remaining 7 are shared freely.")}
      </p>
      <Derivation t={t} label={tx(t, "mCadv_eqPos", "Solutions with every variable at least 1")}
        steps={[
          { tex: r`x + y + z = 10, \quad x, y, z \ge 1`, full: true, why: tx(t, "mCadv_p1", "the problem") },
          { tex: r`x = x' + 1,\ y = y' + 1,\ z = z' + 1 \;\Rightarrow\; x' + y' + z' = 7`, full: true, why: tx(t, "mCadv_p2", "hand out the compulsory 1 to each variable; the new variables may be 0") },
          { tex: r`\binom{7 + 2}{2} = \binom{9}{2} = \green{36}`, full: true, why: tx(t, "mCadv_p3", "7 stars and 2 bars") },
        ]} />
      <LessonTable
        headers={["", tx(t, "mCadv_tNoRep", "no repetition"), tx(t, "mCadv_tRep", "repetition allowed")]}
        rows={[
          [tx(t, "mCadv_tOrder", "order matters"), "A(n, k) = n!/(n − k)!", "nᵏ"],
          [tx(t, "mCadv_tNoOrder", "order does not matter"), "C(n, k) = n!/(k!(n − k)!)", "C(n + k − 1, k)"],
        ]}
      />

      <H2>{tx(t, "mCadv_groupsTitle", "Splitting into groups")}</H2>
      <H3>{tx(t, "mCadv_labTitle", "Labelled groups: choose in stages")}</H3>
      <p>
        {tx(t, "mCadv_labBody",
          "Seven different gifts go to three children: the oldest gets 3, the middle one 2 and the youngest 2. The children are different people, so the groups are labelled. Choose the oldest child's gifts, C(7, 3) = 35, then the middle child's from the 4 left, C(4, 2) = 6, and the youngest takes the last 2, C(2, 2) = 1: 35 · 6 · 1 = 210. The same number is 7!/(3! · 2! · 2!): ordering all the gifts in a row and cutting the row into pieces of 3, 2 and 2, where the order inside each piece does not matter.")}
      </p>
      <H3>{tx(t, "mCadv_condTitle", "A condition on one group")}</H3>
      <p>
        {tx(t, "mCadv_condBody",
          "Among the seven gifts are a tablet and a ball, and the oldest child must get exactly one of them, not both. Handle the condition first. Which of the two goes to the oldest: 2 options. The oldest's other 2 gifts come from the 5 ordinary gifts (the other special one is not allowed): C(5, 2) = 10. That leaves 4 gifts, the other special one included, for the middle child: C(4, 2) = 6. The youngest gets the rest.")}
      </p>
      <Derivation t={t} label={tx(t, "mCadv_eqCond", "Exactly one of the two special gifts to the oldest")}
        steps={[
          { tex: r`2 \cdot \binom{5}{2} \cdot \binom{4}{2} \cdot \binom{2}{2} = 2 \cdot 10 \cdot 6 \cdot 1 = \green{120}`, full: true, why: tx(t, "mCadv_c1", "the condition first, then the stages") },
          { tex: r`210 - \underbrace{\binom{5}{1}\binom{4}{2}}_{30} - \underbrace{\binom{5}{3}\binom{4}{2}}_{60} = 120`, full: true, why: tx(t, "mCadv_c2", "a check by the complement: all 210 distributions, minus the 30 where the oldest gets both special gifts, minus the 60 where the oldest gets neither") },
        ]} />
      <H3>{tx(t, "mCadv_unlabTitle", "Groups without labels")}</H3>
      <p>
        {tx(t, "mCadv_unlabBody",
          "Six players are split into 3 pairs for a doubles tournament. Counted in stages, C(6, 2) · C(4, 2) · C(2, 2) = 15 · 6 · 1 = 90, but that is the count for labelled pairs (pair 1, pair 2, pair 3). The pairs have no names: the same three pairs listed in another order are the same split. Three groups of the same size can be listed in 3! = 6 orders, so there are 90/6 = 15 splits. Divide by the factorial of the number of groups only for groups that have the same size and no labels.")}
      </p>

      <H2>{tx(t, "mCadv_ieTitle", "Inclusion–exclusion: counting overlaps once")}</H2>
      <p>
        {tx(t, "mCadv_ieBody",
          "How many whole numbers from 1 to 100 are divisible by 2 or by 3? There are 50 multiples of 2 and 33 multiples of 3 (100/3 = 33.3…, rounded down). But 50 + 33 = 83 is too many: the multiples of 6 (6, 12, …, 96, which is 16 numbers) are in both lists and were counted twice. Subtract them once: 50 + 33 − 16 = 67. This is the addition principle repaired for groups that overlap. With three sets, add the three sizes, subtract the three pairwise overlaps, and add back the triple overlap, which the subtractions removed once too often.")}
      </p>
      <Equation label={tx(t, "mCadv_eqIE", "Inclusion–exclusion")}
        where={[
          [r`|A|`, tx(t, "mCadv_wSize", "the number of elements of the set A")],
          [r`A \cup B`, tx(t, "mCadv_wUnion", "the union: elements in A or in B (or both)")],
          [r`A \cap B`, tx(t, "mCadv_wInter", "the intersection: elements in both A and B")],
        ]}
        note={tx(t, "mCadv_ieNote", "Divisible by 2, 3 or 5 among 1 to 100: 50 + 33 + 20 − 16 − 10 − 6 + 3 = 74. The 16, 10 and 6 are the multiples of 6, 10 and 15, and the 3 are the multiples of 30.")}
        words={tx(t, "mCadv_ieWords", "Add the sizes of the sets, subtract what lies in two of them, add back what lies in all three: everything ends up counted exactly once.")}>
        {r`\begin{aligned} |A \cup B| &= |A| + |B| - |A \cap B| \\ |A \cup B \cup C| &= |A| + |B| + |C| \\ &\quad - |A\cap B| - |A \cap C| - |B \cap C| \\ &\quad + |A \cap B \cap C| \end{aligned}`}
      </Equation>
      <LiveFormula label={tx(t, "mCadv_liveIE", "Try it: divisible by a or by b, from 1 to N")}
        tex={r`|A \cup B| = \left\lfloor \tfrac{N}{a} \right\rfloor + \left\lfloor \tfrac{N}{b} \right\rfloor - \left\lfloor \tfrac{N}{\operatorname{lcm}(a,\,b)} \right\rfloor`}
        vars={[
          { id: "N", label: "N", min: 10, max: 200, step: 1, value: 100, fmt: v => String(v) },
          { id: "a", label: "a", min: 2, max: 12, step: 1, value: 2, fmt: v => String(v) },
          { id: "b", label: "b", min: 2, max: 12, step: 1, value: 3, fmt: v => String(v) },
        ]}
        compute={ieNumbers}
        note={tx(t, "mCadv_liveIENote", "⌊N/a⌋ means N/a rounded down: the number of multiples of a up to N. A number divisible by both a and b is a multiple of their least common multiple, lcm(a, b), so that term removes the double count. Try a = 4, b = 6: the overlap is the multiples of 12, not of 24. The bar is the share of 1 … N that is counted.")} />

      <H2>{tx(t, "mCadv_derTitle", "Derangements: nothing in its place")}</H2>
      <p>
        {tx(t, "mCadv_derBody",
          "A secretary puts n letters into n addressed envelopes completely at random. In how many ways does no letter reach its own envelope? Such an order is a derangement, and the count is written Dₙ. With 3 letters, of the 3! = 6 orders only 2 move every letter (BCA and CAB), so D₃ = 2. Inclusion–exclusion gives the general count: start from all n! orders, take away those that fix letter 1, letter 2 and so on, add back those that fix two letters, and continue.")}
      </p>
      <Derivation t={t} label={tx(t, "mCadv_eqDer", "Counting derangements by inclusion–exclusion")}
        steps={[
          { tex: r`\binom{n}{j}\,(n-j)!`, full: true, why: tx(t, "mCadv_r1", "orders that fix a chosen set of j letters: choose the j letters, arrange the other n − j freely") },
          { tex: r`D_n = n! - \binom{n}{1}(n-1)! + \binom{n}{2}(n-2)! - \cdots`, full: true, why: tx(t, "mCadv_r2", "inclusion–exclusion with alternating signs") },
          { tex: r`\binom{n}{j}(n-j)! = \frac{n!}{j!} \;\Rightarrow\; D_n = \green{n!\left(1 - \frac{1}{1!} + \frac{1}{2!} - \frac{1}{3!} + \cdots \pm \frac{1}{n!}\right)}`, full: true, why: tx(t, "mCadv_r3", "each term simplifies, and n! comes out as a common factor") },
        ]} />
      <LessonTable
        headers={["n", "1", "2", "3", "4", "5", "6"]}
        rows={[["Dₙ", "0", "1", "2", "9", "44", "265"], ["Dₙ / n!", "0", "0.5", "0.333", "0.375", "0.367", "0.368"]]}
      />
      <p>
        {tx(t, "mCadv_derE",
          "The bracket is the start of the series for 1/e, where e ≈ 2.718 is the base of natural logarithms. So, for any number of letters above a handful, the chance that none reaches its envelope is almost exactly 1/e ≈ 36.8%, whether there are 6 letters or a million.")}
      </p>

      <H2>{tx(t, "mCadv_pigeonTitle", "The pigeonhole principle")}</H2>
      <p>
        {tx(t, "mCadv_pigeonBody",
          "If more than n pigeons fly into n holes, at least one hole holds two pigeons. It sounds too obvious to be useful, but it proves things without counting them. Among any 13 people, two were born in the same month: 13 people, 12 months. A drawer has socks of 3 colours, mixed in the dark: taking 4 socks guarantees a pair of the same colour, and 3 do not. The stronger form: if more than n · k objects go into n boxes, some box holds at least k + 1 of them. Among 367 people, two share a birthday; among 1000 people, some date is shared by at least 3, because 1000 > 366 · 2.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "mCadv_pigeonInfo", "The principle says that the coincidence must happen, not where. It answers \"what is the least number that guarantees…?\" questions: count the boxes, and the answer is one more than the number that could fill each box without the coincidence.")}
      </Callout>

      <H2>{tx(t, "mCadv_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mCadv_ex1", "1. 6 identical sweets are shared among 4 children, and a child may get none: 6 stars and 3 bars, C(9, 3) = 84 ways. If every child must get at least one: give one to each first, 2 sweets are left: C(2 + 3, 3) = C(5, 3) = 10.")}</p>
      <p>{tx(t, "mCadv_ex2", "2. A bakery sells 4 kinds of bread, and a bag holds 6 breads: C(4 + 6 − 1, 6) = C(9, 6) = 84 different bags.")}</p>
      <p>{tx(t, "mCadv_ex3", "3. 12 students are split into 3 working groups of 4 with no names: C(12, 4) · C(8, 4) · C(4, 4)/3! = 495 · 70 · 1/6 = 5775. If the groups get different topics, do not divide: 34 650.")}</p>
      <p>{tx(t, "mCadv_ex4", "4. Of 40 students, 25 study English, 18 study Spanish and 10 study both. Those who study at least one: 25 + 18 − 10 = 33; those who study neither: 40 − 33 = 7.")}</p>
      <p>{tx(t, "mCadv_ex5", "5. Four friends each bring a gift and draw one at random, Secret-Santa style. The chance that nobody draws their own: D₄/4! = 9/24 = 37.5%.")}</p>

      <H2>{tx(t, "mCadv_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mCadv_tWrong", "Wrong"), tx(t, "mCadv_tRight", "Right"), tx(t, "mCadv_tWhy", "Why")]}
        rows={[
          [tx(t, "mCadv_m1w", "3 scoops from 5 flavours, repeats allowed: C(5, 3) = 10"), "C(7, 3) = 35", tx(t, "mCadv_m1", "C(5, 3) forbids repeated flavours; use stars and bars")],
          [tx(t, "mCadv_m2w", "x + y + z = 10 with x, y, z ≥ 1: C(12, 2)"), "C(9, 2) = 36", tx(t, "mCadv_m2", "hand out the compulsory 1s before sharing")],
          [tx(t, "mCadv_m3w", "6 players into 3 pairs: 15 · 6 · 1 = 90"), "90/3! = 15", tx(t, "mCadv_m3", "the pairs have no names; listing them in another order is the same split")],
          [tx(t, "mCadv_m4w", "English or Spanish: 25 + 18 = 43"), "25 + 18 − 10 = 33", tx(t, "mCadv_m4", "the 10 who study both were counted twice")],
          [tx(t, "mCadv_m5w", "socks of 3 colours: 6 socks guarantee a pair"), "4", tx(t, "mCadv_m5", "3 socks can be all different; the 4th must repeat a colour")],
        ]}
      />

      <MathPracticeFigure t={t} set="countingAdvanced" />

      <Related t={t} links={[
        { track: "Math", id: "combinations", title: tx(t, "mCadv_rel1", "Combinations: When Order Does Not Matter"), why: tx(t, "mCadv_rel1b", "the ordinary combinations these methods extend.") },
        { track: "Math", id: "sets", title: tx(t, "mCadv_rel2", "Sets"), why: tx(t, "mCadv_rel2b", "Venn diagrams, unions and intersections, the picture behind inclusion–exclusion.") },
        { track: "Math", id: "counting-tricks", title: tx(t, "mCadv_rel3", "Combinatorics Tricks & Traps"), why: tx(t, "mCadv_rel3b", "the closing chapter: the moves that crack most problems, and how to spot them.") },
      ]} />

      <KeyIdeas t={t} id="mCadv" items={[
        "k items from n kinds, repeats allowed, no order: k stars and n − 1 bars, C(n + k − 1, k).",
        "Whole-number solutions of x₁ + … + xₙ = s: C(s + n − 1, n − 1); with each xᵢ ≥ 1, hand out the 1s first.",
        "Labelled groups: choose them in stages and multiply; unlabelled groups of equal size: divide by the number of their orders.",
        "Inclusion–exclusion: add the sets, subtract the pairwise overlaps, add back the triple overlap.",
        "Derangements: Dₙ = n!(1 − 1/1! + 1/2! − … ± 1/n!), and Dₙ/n! is almost 1/e.",
        "Pigeonhole: more objects than boxes forces two objects into one box.",
      ]} />
    </Article>
  );
}

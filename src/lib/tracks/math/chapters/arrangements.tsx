"use client";

// Combinatorics 3: arrangements. The slot method (figure); simple
// arrangements A(n, k) = n!/(n − k)! and their link to permutations;
// arrangements with repetition nᵏ; the order test (swap two items: a new
// result?); restrictions on digits (distinct digits, even and odd numbers by
// cases, numbers above a bound); positions with a "partner" restriction
// (couples: at most one per couple); worked examples; mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { SlotsFigure } from "@/components/lesson/figures/math/SlotsFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function ArrangementsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mArr_intro",
          "A permutation puts every item in order. Very often only some of them are needed: three medals for eight runners, a president and a treasurer chosen from a club, a four-digit code from ten digits. Choosing k items out of n and putting them in order is called an arrangement. This chapter introduces the slot method, the most reliable tool for this kind of count, derives the formula for arrangements with and without repetition, and gives a simple test for the question that decides almost every counting problem: does the order matter?")}
      </Lead>

      <Goals t={t} id="mArr" items={[
        "Use the slot method: one box per position, the number of options in each, restricted boxes first.",
        "Count arrangements of k out of n items, with the formula n!/(n − k)! and without it.",
        "Count sequences with repetition allowed, nᵏ.",
        "Decide whether order matters with the swap test.",
        "Solve digit problems with restrictions, splitting into cases when needed.",
      ]} />

      <H2>{tx(t, "mArr_slotTitle", "The slot method")}</H2>
      <p>
        {tx(t, "mArr_slotBody",
          "Draw one box (slot) for each position of the result. Write in each box the number of options for that position at the moment it is filled. Multiply the boxes. That is all: the multiplication principle written in a way you can see. The method has one rule that matters: fill the boxes in an order where every box has a fixed number of options. In practice that means the restricted boxes first.")}
      </p>
      <SlotsFigure t={t} />
      <p>
        {tx(t, "mArr_slotRead",
          "In the figure, choose \"even, 3 different digits\". Whether the last digit is 0 changes how many options the first digit has (0 is forbidden there, but if 0 is already used at the end, all of 1 to 9 remain). No single filling order makes every box fixed, so the problem splits into two cases, each counted by slots, and the cases add: 72 + 256 = 328. Splitting into cases is the answer whenever one restriction affects another.")}
      </p>

      <H2>{tx(t, "mArr_simpleTitle", "Simple arrangements")}</H2>
      <p>
        {tx(t, "mArr_simpleBody",
          "Eight runners race and gold, silver and bronze are given. Three boxes: 8 options for gold, 7 for silver (anyone but the winner), 6 for bronze: 8 · 7 · 6 = 336 podiums. The product starts at n and has k factors, one per box, each one less than the one before. This count is called a simple arrangement of n items taken k at a time, written A(n, k), Aₙ,ₖ or P(n, k). To write it with factorials, multiply and divide by the missing tail 5 · 4 · 3 · 2 · 1 = 5!.")}
      </p>
      <Derivation t={t} label={tx(t, "mArr_eqDer", "From the boxes to the formula")}
        steps={[
          { tex: r`A_{8,3} = 8 \cdot 7 \cdot 6`, full: true, why: tx(t, "mArr_d1", "three boxes, each with one option fewer than the one before") },
          { tex: r`= \frac{8 \cdot 7 \cdot 6 \cdot \overbrace{5 \cdot 4 \cdot 3 \cdot 2 \cdot 1}^{5!}}{5 \cdot 4 \cdot 3 \cdot 2 \cdot 1} = \frac{8!}{5!}`, full: true, why: tx(t, "mArr_d2", "multiply and divide by the factors that are missing to complete 8!") },
          { tex: r`A_{n,k} = \green{\frac{n!}{(n-k)!}}`, full: true, why: tx(t, "mArr_d3", "in general the missing tail is (n − k)!") },
        ]} />
      <Equation label={tx(t, "mArr_eqArr", "Simple arrangements")}
        where={[
          [r`n`, tx(t, "mArr_wN", "the number of different items available")],
          [r`k`, tx(t, "mArr_wK", "how many are placed in order, each at most once (0 ≤ k ≤ n)")],
          [r`(n-k)!`, tx(t, "mArr_wTail", "the factors of n! that are not used, cancelled by the division")],
        ]}
        note={tx(t, "mArr_arrNote", "With k = n, A(n, n) = n!/0! = n!: a permutation is an arrangement that uses every item. By hand, the product of k factors from n downward is faster than the factorials.")}
        words={tx(t, "mArr_arrWords", "Arranging k of n different items in order: multiply k factors, counting down from n.")}>
        {r`A_{n,k} = n\,(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}`}
      </Equation>

      <H2>{tx(t, "mArr_repTitle", "Arrangements with repetition")}</H2>
      <p>
        {tx(t, "mArr_repBody",
          "When an item may be used again, every box has all n options. A PIN of 4 digits: 10 · 10 · 10 · 10 = 10⁴ = 10 000. A string of 8 bits, each 0 or 1: 2⁸ = 256. A 3-letter code with repeats: 26³ = 17 576. These are arrangements with repetition, and their count is a power.")}
      </p>
      <Equation label={tx(t, "mArr_eqRep", "Arrangements with repetition")}
        where={[
          [r`n`, tx(t, "mArr_wNrep", "the number of options for each position")],
          [r`k`, tx(t, "mArr_wKrep", "the number of positions; here k may be bigger than n")],
        ]}
        words={tx(t, "mArr_repWords", "k positions, each with the same n options: n to the power k.")}>
        {r`AR_{n,k} = n^k`}
      </Equation>
      <LessonTable
        headers={[tx(t, "mArr_hCode", "Code"), tx(t, "mArr_hWith", "repeats allowed"), tx(t, "mArr_hWithout", "no repeats")]}
        rows={[
          [tx(t, "mArr_c1", "4 digits"), "10⁴ = 10 000", "10 · 9 · 8 · 7 = 5040"],
          [tx(t, "mArr_c2", "3 letters"), "26³ = 17 576", "26 · 25 · 24 = 15 600"],
          [tx(t, "mArr_c3", "6 lowercase letters"), "26⁶ = 308 915 776", "26 · 25 · 24 · 23 · 22 · 21 = 165 765 600"],
        ]}
      />

      <H2>{tx(t, "mArr_orderTitle", "Does order matter? The swap test")}</H2>
      <p>
        {tx(t, "mArr_orderBody",
          "The most common mistake in counting is to use an arrangement where a combination is needed, or the other way round. A test settles it. Take one result and swap two of its chosen items. If the swap gives a different result, order matters, and you are arranging. If it gives the same result, order does not matter, and you are choosing a group (a combination, the subject of the next chapter).")}
      </p>
      <LessonTable
        headers={[tx(t, "mArr_hSit", "Situation"), tx(t, "mArr_hSwap", "Swap two of the chosen"), tx(t, "mArr_hKind", "Order matters?")]}
        rows={[
          [tx(t, "mArr_o1", "gold and silver among 8 runners"), tx(t, "mArr_o1s", "the winner and the runner-up change: a different podium"), tx(t, "mArr_yes", "yes: arrangement")],
          [tx(t, "mArr_o2", "2 representatives of a class, equal roles"), tx(t, "mArr_o2s", "the same two people: the same pair"), tx(t, "mArr_no", "no: combination")],
          [tx(t, "mArr_o3", "president and treasurer of a club"), tx(t, "mArr_o3s", "the jobs change hands: a different board"), tx(t, "mArr_yes", "yes: arrangement")],
          [tx(t, "mArr_o4", "6 numbers on a lottery ticket"), tx(t, "mArr_o4s", "the same set of numbers: the same ticket"), tx(t, "mArr_no", "no: combination")],
          [tx(t, "mArr_o5", "a 4-digit PIN"), tx(t, "mArr_o5s", "1234 and 2134 open different locks"), tx(t, "mArr_yes", "yes: arrangement")],
          [tx(t, "mArr_o6", "3 pizza toppings out of 10"), tx(t, "mArr_o6s", "the same pizza"), tx(t, "mArr_no", "no: combination")],
        ]}
      />
      <Callout type="tip" t={t}>
        {tx(t, "mArr_rolesTip", "A quick sign: if the chosen items get different roles, places or labels (first, second, president, gold, a position in a code), order matters. If they all end up in the same bag with the same role, it does not.")}
      </Callout>

      <H2>{tx(t, "mArr_digitTitle", "Digit problems with restrictions")}</H2>
      <p>
        {tx(t, "mArr_digitBody",
          "Questions about numbers formed with digits are the most frequent arrangement problems in exams. They combine three kinds of restriction: the first digit cannot be 0, the digits may have to be different, and the number may have to be even, odd, a multiple of 5 or within some range. The slot method with the restricted boxes first handles all of them.")}
      </p>
      <H3>{tx(t, "mArr_evenTitle", "Even numbers with different digits: two cases")}</H3>
      <Derivation t={t} label={tx(t, "mArr_eqEven", "Even 3-digit numbers, all digits different")}
        steps={[
          { tex: r`\_\;\_\;\boxed{0}: \quad 9 \cdot 8 \cdot 1 = 72`, full: true, why: tx(t, "mArr_e1", "case 1, last digit 0: then 0 is used up, the first digit has 9 options (1–9) and the middle 8") },
          { tex: r`\_\;\_\;\boxed{2,4,6,8}: \quad 8 \cdot 8 \cdot 4 = 256`, full: true, why: tx(t, "mArr_e2", "case 2, last digit 2, 4, 6 or 8 (4 options): the first digit cannot be 0 or the last digit, 8 options; the middle may be 0, minus the two used, 8 options") },
          { tex: r`72 + 256 = \green{328}`, full: true, why: tx(t, "mArr_e3", "a number ends in 0 or it does not: separate cases add") },
        ]} />
      <H3>{tx(t, "mArr_boundTitle", "Numbers above a bound")}</H3>
      <p>
        {tx(t, "mArr_boundBody",
          "With the digits 1, 2, 3, 4, 5 and 6, no repeats, how many 3-digit numbers are greater than 400? The restriction sits in the first digit: 4, 5 or 6, 3 options. Then 5 and 4 options for the other two: 3 · 5 · 4 = 60. Multiples of 5 with the same digits: the last digit must be 5, 1 option; then 5 · 4 for the first two: 20.")}
      </p>
      <H3>{tx(t, "mArr_coupleTitle", "Restrictions between people: at most one per couple")}</H3>
      <p>
        {tx(t, "mArr_coupleBody",
          "Ten couples form a club, and a board of president, secretary and treasurer is chosen, with at most one person from each couple. The jobs are different, so order matters: three boxes. President: any of the 20 people. Secretary: not the president, and not the president's partner, 20 − 2 = 18. Treasurer: not the two people already chosen and not their two partners, 20 − 4 = 16. Total 20 · 18 · 16 = 5760. Each choice removes a whole couple from the options left.")}
      </p>

      <H2>{tx(t, "mArr_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mArr_ex1", "1. A class of 30 elects a representative and a deputy: A(30, 2) = 30 · 29 = 870 possible results.")}</p>
      <p>{tx(t, "mArr_ex2", "2. A 5-question multiple-choice test with options A to E: every way of answering is a sequence of 5 letters with repetition, 5⁵ = 3125.")}</p>
      <p>{tx(t, "mArr_ex3", "3. Four-digit numbers with all digits different that are odd: last digit odd, 5 options; first digit not 0 and not the last, 8; then 8 and 7 for the middle: 8 · 8 · 7 · 5 = 2240.")}</p>
      <p>{tx(t, "mArr_ex4", "4. A horse race with 12 horses, a bet on the first three in order: A(12, 3) = 12 · 11 · 10 = 1320 possible bets.")}</p>
      <p>{tx(t, "mArr_ex5", "5. Three different flags are hoisted on 5 flagpoles in a row, at most one per pole, and the order on the poles matters: A(5, 3) = 60 signals.")}</p>

      <H2>{tx(t, "mArr_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mArr_tWrong", "Wrong"), tx(t, "mArr_tRight", "Right"), tx(t, "mArr_tWhy", "Why")]}
        rows={[
          [tx(t, "mArr_m1w", "2 equal representatives from 30: 30 · 29"), "30 · 29/2 = 435", tx(t, "mArr_m1", "swapping two representatives gives the same pair; the swap test says combination")],
          [tx(t, "mArr_m2w", "4-digit PIN: 10 · 9 · 8 · 7"), "10⁴", tx(t, "mArr_m2", "digits in a PIN may repeat")],
          [tx(t, "mArr_m3w", "even 3-digit numbers, distinct digits: 9 · 8 · 5"), "72 + 256 = 328", tx(t, "mArr_m3", "whether the last digit is 0 changes the first digit's options; split into cases")],
          [tx(t, "mArr_m4w", "A(8, 3) = 8!/3!"), "8!/5!", tx(t, "mArr_m4", "divide by the factorial of the items NOT used, (n − k)!")],
          [tx(t, "mArr_m5w", "board from 10 couples: 20 · 19 · 18"), "20 · 18 · 16", tx(t, "mArr_m5", "each choice also removes that person's partner")],
        ]}
      />

      <MathPracticeFigure t={t} set="arrangements" />

      <Related t={t} links={[
        { track: "Math", id: "permutations", title: tx(t, "mArr_rel1", "Factorials & Permutations"), why: tx(t, "mArr_rel1b", "the special case k = n, with blocks, repeats and circles.") },
        { track: "Math", id: "combinations", title: tx(t, "mArr_rel2", "Combinations: When Order Does Not Matter"), why: tx(t, "mArr_rel2b", "the next chapter: dividing the arrangements by the orders of each group.") },
      ]} />

      <KeyIdeas t={t} id="mArr" items={[
        "Slot method: one box per position, the options in each, multiply; restricted boxes first.",
        "When a restriction changes another box's options, split into cases and add them.",
        "Simple arrangements: A(n, k) = n(n − 1)…(n − k + 1) = n!/(n − k)!.",
        "With repetition allowed every box keeps all n options: nᵏ.",
        "Swap test: if swapping two chosen items gives a new result, order matters.",
      ]} />
    </Article>
  );
}

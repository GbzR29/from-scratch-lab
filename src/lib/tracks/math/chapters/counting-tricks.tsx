"use client";

// Combinatorics 6: tricks and traps, closing the section. How to read a
// trick; nine tricks, each as what it is / why it works / when to use it /
// an example / the trap: the swap test, restricted first, cases, the
// complement, the block, the gaps, dividing out an overcount, choosing the
// places first, stars and bars in disguise. A routine for any problem; the
// classic traps; "which trick?" practice; mixed practice of the section.

import type { ReactNode } from "react";
import { H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { TrickPickFigure } from "@/components/lesson/figures/math/TrickPickFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

/** One part of a trick: a bold label ("Why it works.") and its text. */
function Part({ label, children }: { label: string; children: ReactNode }) {
  return <p><strong>{label}</strong> {children}</p>;
}

export function CountingTricksContent({ t }: { t: TrackTranslations }) {
  const L = {
    what: tx(t, "mCtr_lWhat", "What it is."),
    why: tx(t, "mCtr_lWhy", "Why it works."),
    when: tx(t, "mCtr_lWhen", "When to use it."),
    ex: tx(t, "mCtr_lEx", "Example."),
    trap: tx(t, "mCtr_lTrap", "The trap."),
  };
  return (
    <Article>
      <Lead>
        {tx(t, "mCtr_intro",
          "Most counting problems, in exams and outside them, are solved by a small number of moves used again and again. The formulas of the previous chapters are only half the work; the other half is seeing which move a problem is asking for. This chapter collects the nine moves that crack most problems. Each one is described in the same five parts: what it is, why it works, the sign in the problem that calls for it, an example, and the trap that usually catches people. At the end there is a routine for attacking any problem, a list of classic traps, and two practice rounds.")}
      </Lead>

      <Goals t={t} id="mCtr" items={[
        "Recognise from the wording which counting move a problem needs.",
        "Use the complement, the block, the gaps and \"choose the places first\" with confidence.",
        "Spot an overcount and divide it out, or split into cases when a restriction affects another.",
        "Follow a fixed routine to set up any counting problem.",
        "Avoid the classic traps: double counting, forgotten inner orders, identical against different items.",
      ]} />

      <H2>{tx(t, "mCtr_t1Title", "Trick 1: the swap test")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t1What", "Before any formula, swap two of the chosen items in one result and ask whether the result changed.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t1Why", "Arrangements count ordered results and combinations count groups; the only difference between them is whether a swap makes a new result. The test asks exactly that question.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t1When", "Always, as the first step. Words like president, first, position, code, podium point to order; words like committee, group, team, set, ticket, hand point to no order.")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t1Ex", "Choosing 2 class representatives with equal roles from 30 students: swapping the two gives the same pair, so C(30, 2) = 435. Choosing a representative and a deputy: the swap gives a new result, so A(30, 2) = 870.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t1Trap", "The word \"choose\" does not mean combination. \"Choose a president and a treasurer\" is an arrangement.")}</Part>

      <H2>{tx(t, "mCtr_t2Title", "Trick 2: the restricted position first")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t2What", "In the slot method, fill the positions with conditions before the free ones.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t2Why", "The multiplication principle needs each stage to have a fixed number of options. A free position has the same number of options whatever happens; a restricted one may not, if the free ones have already used up what it needs.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t2When", "\"Cannot start with 0\", \"must end in a vowel\", \"must be odd\", \"the first place goes to…\".")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t2Ex", "Anagrams of LIVRO that start and end with a vowel: the ends first, I and O in 2 orders; then the 3 consonants in the middle, 3! = 6. Total 12.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t2Trap", "Two restrictions that compete for the same items (the last digit even and the first digit not 0) cannot both go first. Then use Trick 3.")}</Part>

      <H2>{tx(t, "mCtr_t3Title", "Trick 3: split into cases and add")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t3What", "Divide the results into separate cases, count each one, and add.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t3Why", "The addition principle: if every result falls in exactly one case, the total is the sum of the cases.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t3When", "When one choice changes the number of options of another (is the last digit 0 or not?), or when the question itself lists cases (\"4 or 5 digits\", \"exactly 2 or exactly 3\").")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t3Ex", "Even 3-digit numbers with different digits: ending in 0, 9 · 8 = 72; ending in 2, 4, 6 or 8, 8 · 8 · 4 = 256. Total 328.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t3Trap", "The cases must not overlap and must cover everything. Check with a small example that no result belongs to two cases.")}</Part>

      <H2>{tx(t, "mCtr_t4Title", "Trick 4: the complement")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t4What", "Count everything, count what you do not want, and subtract.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t4Why", "Every result either has the property or does not, so wanted = total − unwanted. It pays off when the unwanted side is one simple case.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t4When", "\"At least one\", \"not all\", \"not side by side\", \"some repeated digit\".")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t4Ex", "4-digit PINs with at least one repeated digit: all PINs, 10⁴ = 10 000, minus those with all digits different, 10 · 9 · 8 · 7 = 5040. Total 4960.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t4Trap", "The opposite of \"at least one\" is \"none\", not \"exactly one\".")}</Part>

      <H2>{tx(t, "mCtr_t5Title", "Trick 5: the block")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t5What", "Items that must stay together are glued into one block, counted as a single item; then the block's inner orders are multiplied in.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t5Why", "Every order with the items together is exactly one order of the block among the others, times one order inside the block.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t5When", "\"Together\", \"side by side\", \"next to each other\", \"in a row without separating\".")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t5Ex", "Anagrams of PERNAMBUCO with the vowels E, A, U, O together, in any order: the block plus P, R, N, M, B, C is 7 items, 7! = 5040, times 4! = 24 inside the block: 120 960.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t5Trap", "Forgetting the inner orders, or multiplying them when the order inside is fixed (\"together and in this order\").")}</Part>

      <H2>{tx(t, "mCtr_t6Title", "Trick 6: the gaps")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t6What", "To keep some items apart, first place the others; then put the separated items into the gaps between them, at most one per gap.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t6Why", "m items in a row leave m + 1 gaps (the two ends included). Items put into different gaps can never touch.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t6When", "\"No two side by side\", \"never together\", for more than two items, where the complement would need inclusion–exclusion.")}</Part>
      <Derivation t={t} label={tx(t, "mCtr_eqGaps", "5 boys and 3 girls in a row, no two girls side by side")}
        steps={[
          { tex: r`\_\,\bullet\,\_\,\bullet\,\_\,\bullet\,\_\,\bullet\,\_\,\bullet\,\_ \qquad 5! = 120`, full: true, why: tx(t, "mCtr_g1", "the boys (dots) first, in any order; they leave 6 gaps (dashes)") },
          { tex: r`A_{6,3} = 6 \cdot 5 \cdot 4 = 120`, full: true, why: tx(t, "mCtr_g2", "the girls take 3 of the 6 gaps, one each, and they are different people, so order matters") },
          { tex: r`120 \cdot 120 = \green{14\,400}`, full: true, why: tx(t, "mCtr_g3", "the two stages multiply") },
        ]} />
      <Part label={L.trap}>{tx(t, "mCtr_t6Trap", "Forgetting the two ends as gaps, or using the gaps for items that only need to be apart from one particular item.")}</Part>

      <H2>{tx(t, "mCtr_t7Title", "Trick 7: divide out what was counted twice")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t7What", "Count as if everything were different and ordered, then divide by how many times each real result was counted.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t7Why", "If every real result was counted the same number of times m, the true count is the rough count divided by m. That is exactly where k! in combinations, a!b! in repeated letters and n in circular tables come from.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t7When", "Identical items, rotations of a circle, groups without names, or a symmetric condition such as \"A before B\" (exactly half of all orders).")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t7Ex", "In how many orders of 6 runners does Ana finish ahead of Bia? Swapping the two pairs every order with one where Bia is ahead: 6!/2 = 360.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t7Trap", "Dividing only works when every result was counted the same number of times. In \"at least one man\" by choosing \"the\" man first, a committee with one man is counted once and one with two men twice, so no single division fixes it.")}</Part>

      <H2>{tx(t, "mCtr_t8Title", "Trick 8: choose the places first")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t8What", "Decide which positions a kind of item will occupy (a combination of positions), then fill each kind of position.")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t8Why", "A result is fixed by where each kind goes and by the order within each kind; the two choices are stages.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t8When", "Strings with a fixed number of some symbol, items that keep a fixed order among themselves, shortest paths on a grid.")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t8Ex", "Anagrams of CAPITULO in which the vowels A, I, U, O appear in this order (not necessarily together): choose the 4 places of the vowels, C(8, 4) = 70; they go in the fixed order, 1 way; the 4 consonants fill the rest, 4! = 24. Total 1680, which is 8!/4!, as Trick 7 also says.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t8Trap", "Choosing the places is a combination (the places are a set); filling them is a permutation of the items, unless the items are identical or in a fixed order.")}</Part>

      <H2>{tx(t, "mCtr_t9Title", "Trick 9: stars and bars in disguise")}</H2>
      <Part label={L.what}>{tx(t, "mCtr_t9What", "Any problem where identical items are shared among different boxes is k stars and n − 1 bars: C(n + k − 1, k).")}</Part>
      <Part label={L.why}>{tx(t, "mCtr_t9Why", "Identical items have no identity, so a sharing is fixed by how many go into each box, which is a row of stars and bars.")}</Part>
      <Part label={L.when}>{tx(t, "mCtr_t9When", "Identical sweets, coins or votes; repeats allowed and order ignored; whole-number solutions of x + y + z = s.")}</Part>
      <Part label={L.ex}>{tx(t, "mCtr_t9Ex", "10 identical votes among 3 candidates, each candidate may get none: C(12, 2) = 66 possible tallies.")}</Part>
      <Part label={L.trap}>{tx(t, "mCtr_t9Trap", "If the items are different (10 different people voting), each item chooses its box: 3¹⁰, not stars and bars.")}</Part>

      <H2>{tx(t, "mCtr_routineTitle", "A routine for any problem")}</H2>
      <LessonTable
        headers={[tx(t, "mCtr_hStep", "Step"), tx(t, "mCtr_hAsk", "Ask")]}
        rows={[
          ["1", tx(t, "mCtr_s1", "What exactly is one result? Write one down, as a concrete example.")],
          ["2", tx(t, "mCtr_s2", "Does order matter (swap test)? May items repeat? Are the items different or identical?")],
          ["3", tx(t, "mCtr_s3", "Are there restrictions? Fill them first, or split into cases.")],
          ["4", tx(t, "mCtr_s4", "Is the opposite simpler? Then count the complement.")],
          ["5", tx(t, "mCtr_s5", "Did I count some result more than once? Divide, or rethink the method.")],
          ["6", tx(t, "mCtr_s6", "Check with a smaller version you can list by hand.")],
        ]}
      />

      <H2>{tx(t, "mCtr_trapsTitle", "The classic traps")}</H2>
      <LessonTable
        headers={[tx(t, "mCtr_tWrong", "Wrong"), tx(t, "mCtr_tRight", "Right"), tx(t, "mCtr_tWhy", "Why")]}
        rows={[
          [tx(t, "mCtr_x1w", "\"at least one man\": choose the man, then the rest"), tx(t, "mCtr_x1r", "all minus no man"), tx(t, "mCtr_x1", "committees with several men are counted several times")],
          [tx(t, "mCtr_x2w", "two together: 5! for 6 people"), "5! · 2!", tx(t, "mCtr_x2", "the inner order of the block was forgotten")],
          [tx(t, "mCtr_x3w", "10 different people vote for 3 candidates: C(12, 2)"), "3¹⁰", tx(t, "mCtr_x3", "different voters are not identical stars")],
          [tx(t, "mCtr_x4w", "3 equal prizes to 10 people: A(10, 3)"), "C(10, 3)", tx(t, "mCtr_x4", "equal prizes have no order")],
          [tx(t, "mCtr_x5w", "6 people into 3 unnamed pairs: 90"), "90/3! = 15", tx(t, "mCtr_x5", "groups without names must not be ordered")],
          [tx(t, "mCtr_x6w", "\"and then\" counted with +"), "·", tx(t, "mCtr_x6", "stages multiply, separate cases add")],
        ]}
      />

      <TrickPickFigure t={t} bank="combinatorics" />

      <MathPracticeFigure t={t} set="countingMix" />

      <Related t={t} links={[
        { track: "Math", id: "counting", title: tx(t, "mCtr_rel1", "What Is Combinatorics? The Counting Principles"), why: tx(t, "mCtr_rel1b", "the start of the section, if a principle needs revising.") },
        { track: "Math", id: "probability", title: tx(t, "mCtr_rel2", "Probability Basics"), why: tx(t, "mCtr_rel2b", "where these counts become chances.") },
        { track: "Math", id: "algebra-tricks", title: tx(t, "mCtr_rel3", "Algebra Tricks I"), why: tx(t, "mCtr_rel3b", "the tricks chapter of the Algebra section, in the same format.") },
      ]} />

      <KeyIdeas t={t} id="mCtr" items={[
        "Swap test first: a new result after swapping means order matters.",
        "Restricted positions first; when restrictions compete, split into cases and add.",
        "\"At least one\" and \"not together\" are usually total minus the opposite.",
        "Together: a block, times its inner orders. Apart: place the others, then use the m + 1 gaps.",
        "Count as if all were different and ordered, then divide by how often each result was counted.",
        "Choose the places of a kind of item first; identical items into boxes are stars and bars.",
        "Write one concrete result before counting, and check the method on a small case.",
      ]} />
    </Article>
  );
}

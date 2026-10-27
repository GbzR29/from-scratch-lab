"use client";

// Combinatorics 4: combinations. From arrangements to groups (divide by k!);
// the formula C(n, k) and computing it by hand (live formula); the
// order/repetition figure; symmetry and the edge cases; combinations in
// stages (two groups multiply); "at least" and "at most" (complement or
// cases, and the double-counting trap); geometry counts (segments,
// diagonals, triangles with collinear points, handshakes, tournaments);
// lotteries and cards; arrangement or combination, and problems that need
// both; worked examples; mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { CountingFigure } from "@/components/lesson/figures/math/CountingFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

// ── Live formula: the numbers plugged in ──────────────────────────────────────

/** 50063860 → 50\,063\,860 (thin spaces between groups of three). */
const big = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, r`\,`);

/** C(n, k) as k falling factors over k!, and the chance that one ticket wins. */
function chooseNumbers(v: Record<string, number>) {
  const n = v.n, k = Math.min(v.k, n);
  let top = 1, bottom = 1;
  for (let i = 0; i < k; i++) { top *= n - i; bottom *= i + 1; }
  const c = Math.round(top / bottom);
  const fall = Array.from({ length: k }, (_, i) => n - i).join(r` \cdot `);
  const down = Array.from({ length: k }, (_, i) => k - i).join(r` \cdot `);
  return {
    tex: r`\binom{${n}}{${k}} = \frac{${fall}}{${down}} = \frac{${big(top)}}{${big(bottom)}} = \amber{${big(c)}}`,
    meter: 1 / c,
    meterLabel: `1 / ${c.toLocaleString("en").replace(/,/g, " ")}`,
  };
}

export function CombinationsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mComb_intro",
          "A committee, a lottery ticket, a hand of cards, a set of pizza toppings: in all of these a group is chosen and the order in which its members were picked does not matter. Such a choice is a combination. Combinations are the most used tool of combinatorics and of probability, and they come straight from arrangements: count the ordered choices, then divide by the number of orders in which each group was counted. This chapter derives the formula, shows how to compute it quickly by hand, and works through the situations exams build on it: two groups at once, \"at least one\", geometry, lotteries, and problems that mix order and groups.")}
      </Lead>

      <Goals t={t} id="mComb" items={[
        "Explain why a combination is an arrangement divided by k!, and compute C(n, k) by hand.",
        "Use the symmetry C(n, k) = C(n, n − k) to save work.",
        "Count groups chosen in stages from two or more sets, and groups with \"at least\" or \"at most\".",
        "Count segments, diagonals and triangles from points, and matches in a tournament.",
        "Tell apart, in a mixed problem, the part that is a combination and the part that is an arrangement.",
      ]} />

      <H2>{tx(t, "mComb_fromTitle", "From arrangements to groups")}</H2>
      <p>
        {tx(t, "mComb_fromBody",
          "From 8 people, choose a committee of 3 with equal roles. If the roles were different (president, secretary, treasurer), the answer would be the arrangement A(8, 3) = 8 · 7 · 6 = 336. A committee has no roles, though: {Ana, Bruno, Carla} is the same committee whichever order its members were picked in. Among the 336 ordered choices, this one committee appears once for each order of its 3 members, which is 3! = 6 times, and the same is true of every committee. So the number of committees is 336/6 = 56.")}
      </p>
      <Derivation t={t} label={tx(t, "mComb_eqDer", "Counting groups by dividing out the orders")}
        steps={[
          { tex: r`A_{8,3} = 8 \cdot 7 \cdot 6 = 336`, full: true, why: tx(t, "mComb_d1", "count the choices as if order mattered") },
          { tex: r`\{A, B, C\} \to ABC,\ ACB,\ BAC,\ BCA,\ CAB,\ CBA \quad (3! = 6)`, full: true, why: tx(t, "mComb_d2", "each group of 3 was counted once for each of its 3! orders") },
          { tex: r`C_{8,3} = \frac{336}{6} = \green{56}`, full: true, why: tx(t, "mComb_d3", "every group was counted the same number of times, so divide by it") },
        ]} />
      <Equation label={tx(t, "mComb_eqComb", "Combinations: groups of k out of n")}
        where={[
          [r`C_{n,k} = \binom{n}{k}`, tx(t, "mComb_wBinom", "read \"combination of n taken k at a time\" or \"n choose k\": the number of groups of k items out of n, order ignored")],
          [r`A_{n,k} = \frac{n!}{(n-k)!}`, tx(t, "mComb_wOrdered", "the ordered choices")],
          [r`k!`, tx(t, "mComb_wKfact", "the number of orders of one group, all counted separately by the arrangement")],
        ]}
        note={tx(t, "mComb_combNote", "Only the bottom changes compared with arrangements: the extra k! is the order that a group does not have.")}
        words={tx(t, "mComb_combWords", "Count the ordered picks, then divide by the number of orders each group was counted in: n factorial over k factorial times n minus k factorial.")}>
        {r`C_{n,k} = \binom{n}{k} = \frac{A_{n,k}}{k!} = \frac{n!}{k!\,(n-k)!}`}
      </Equation>
      <CountingFigure t={t} />

      <H2>{tx(t, "mComb_handTitle", "Computing C(n, k) by hand")}</H2>
      <p>
        {tx(t, "mComb_handBody",
          "Do not compute the three factorials. Write k factors counting down from n on top and k factors counting down from k below, then cancel before multiplying. C(10, 4) = (10 · 9 · 8 · 7)/(4 · 3 · 2 · 1): the 8 cancels with 4 · 2, the 9 with 3, leaving 10 · 3 · 7 = 210. The result is always a whole number, because it counts something; if a fraction is left, a factor was dropped.")}
      </p>
      <LiveFormula label={tx(t, "mComb_liveChoose", "Try it: n choose k, and the chance of one ticket")}
        tex={r`\binom{n}{k} = \frac{n\,(n-1)\cdots(n-k+1)}{k\,(k-1)\cdots 1}`}
        vars={[
          { id: "n", label: "n", min: 1, max: 60, step: 1, value: 60, fmt: v => String(v) },
          { id: "k", label: "k", min: 1, max: 8, step: 1, value: 6, fmt: v => String(v) },
        ]}
        compute={chooseNumbers}
        note={tx(t, "mComb_liveChooseNote", "Top and bottom both have k factors. The bar is 1 divided by the count: the chance that a single ticket holds the drawn set. At n = 60, k = 6 (the Mega-Sena) it is 1 in 50 063 860, far too thin to see. Try n = 10, k = 3 (120), then k = 7: the same 120, by symmetry.")} />
      <H3>{tx(t, "mComb_symTitle", "Symmetry and the edge cases")}</H3>
      <p>
        {tx(t, "mComb_symBody",
          "Choosing the 3 people who go on a trip is the same as choosing the 5 who stay behind, so C(8, 3) = C(8, 5) = 56. In general C(n, k) = C(n, n − k): swapping k and n − k only swaps the two factorials below. Use it to keep k small: C(100, 98) = C(100, 2) = 100 · 99/2 = 4950. The edge cases follow from the formula and from common sense: C(n, 0) = C(n, n) = 1 (one way to choose nothing, one way to choose everything) and C(n, 1) = n. The numbers C(n, k) form Pascal's triangle, studied in the Binomial Theorem chapter.")}
      </p>

      <H2>{tx(t, "mComb_stageTitle", "Combinations in stages")}</H2>
      <p>
        {tx(t, "mComb_stageBody",
          "A committee of 5 must have exactly 3 women and 2 men, chosen from 6 women and 4 men. Build it in two stages: choose the women, C(6, 3) = 20 ways, and then the men, C(4, 2) = 6 ways. Every choice of women combines with every choice of men, so multiply: 20 · 6 = 120. Inside each stage the order does not matter; between the stages, the multiplication principle applies as always.")}
      </p>

      <H2>{tx(t, "mComb_leastTitle", "\"At least\" and \"at most\"")}</H2>
      <p>
        {tx(t, "mComb_leastBody",
          "\"At least one man\" in a committee of 5 from 6 women and 4 men covers the cases with 1, 2, 3 or 4 men. You could add the four cases, but the opposite of \"at least one man\" is a single case, \"no man\", which is much shorter. All committees: C(10, 5) = 252. Committees with no man, all women: C(6, 5) = 6. So 252 − 6 = 246 have at least one man. \"At most two men\" is the cases 0, 1 and 2 men: C(6, 5) + C(4, 1) · C(6, 4) + C(4, 2) · C(6, 3) = 6 + 60 + 120 = 186.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "mComb_leastWarn", "A tempting wrong method: \"choose the man first, C(4, 1) = 4, then the other 4 members from the 9 left, C(9, 4) = 126, total 504\". It counts too much: a committee with two men, Bruno and Davi, is counted once with Bruno as \"the\" man and once with Davi. The two methods above count every committee exactly once.")}
      </Callout>

      <H2>{tx(t, "mComb_geoTitle", "Counting in geometry")}</H2>
      <p>
        {tx(t, "mComb_geoBody",
          "A set of points determines figures, and the figure does not depend on the order in which its points are named: segment AB is segment BA. So these are combinations. With 10 points on a circle (no three on a line): segments C(10, 2) = 45, triangles C(10, 3) = 120, quadrilaterals C(10, 4) = 210.")}
      </p>
      <LessonTable
        headers={[tx(t, "mComb_hFig", "What is counted"), tx(t, "mComb_hHow", "How"), tx(t, "mComb_hEx", "Example")]}
        rows={[
          [tx(t, "mComb_g1", "diagonals of a convex polygon with n sides"), tx(t, "mComb_g1h", "all segments between corners, minus the n sides"), "C(8, 2) − 8 = 20; n(n − 3)/2"],
          [tx(t, "mComb_g2", "triangles from n points, m of them on one line"), tx(t, "mComb_g2h", "all triples, minus the triples on the line (they make no triangle)"), "C(10, 3) − C(4, 3) = 116"],
          [tx(t, "mComb_g3", "handshakes when n people all greet each other"), tx(t, "mComb_g3h", "one handshake per pair"), "C(10, 2) = 45"],
          [tx(t, "mComb_g4", "matches of a tournament, every team against every other once"), tx(t, "mComb_g4h", "one match per pair of teams; twice (home and away) is an arrangement"), "C(20, 2) = 190; A(20, 2) = 380"],
        ]}
      />

      <H2>{tx(t, "mComb_lottoTitle", "Lotteries and cards")}</H2>
      <p>
        {tx(t, "mComb_lottoBody",
          "The Mega-Sena draws 6 numbers out of 60, and the order of the draw does not matter: C(60, 6) = (60 · 59 · 58 · 57 · 56 · 55)/720 = 50 063 860 possible results. A simple bet of 6 numbers covers one of them. A bet of 7 numbers covers every set of 6 inside the 7, which is C(7, 6) = 7 sets: it costs seven simple bets and wins exactly seven times as often. A hand of 5 cards from a 52-card deck: C(52, 5) = 2 598 960. Hands with all 5 cards of the same suit: 4 suits times C(13, 5) = 1287, so 5148.")}
      </p>

      <H2>{tx(t, "mComb_mixTitle", "Arrangement or combination? Problems with both")}</H2>
      <p>
        {tx(t, "mComb_mixBody",
          "Many problems have a part where order matters and a part where it does not. Choose a committee of 4 from 10 people and then a coordinator among the 4. Stage 1, the group: C(10, 4) = 210. Stage 2, a role inside the group: 4 options. Total 840. The same count in another order: first the coordinator, 10 options, then the other 3 members with equal roles, C(9, 3) = 84: 10 · 84 = 840. Two correct methods must give the same number, which makes a good check.")}
      </p>
      <LessonTable
        headers={[tx(t, "mComb_hQ", "Question"), tx(t, "mComb_hA", "Kind"), tx(t, "mComb_hC", "Count")]}
        rows={[
          [tx(t, "mComb_q1", "3 prizes, gold, silver and bronze, among 10 students"), tx(t, "mComb_arr", "arrangement"), "A(10, 3) = 720"],
          [tx(t, "mComb_q2", "3 equal prizes among 10 students"), tx(t, "mComb_comb", "combination"), "C(10, 3) = 120"],
          [tx(t, "mComb_q3", "3 equal prizes, at most one per student, then a photo of the 3 winners in a row"), tx(t, "mComb_both", "combination, then permutation"), "120 · 3! = 720"],
        ]}
      />

      <H2>{tx(t, "mComb_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mComb_ex1", "1. A student must answer 7 of the 10 questions of an exam: C(10, 7) = C(10, 3) = 120 ways to choose them. If questions 1 and 2 are compulsory, she chooses the other 5 from the remaining 8: C(8, 5) = 56.")}</p>
      <p>{tx(t, "mComb_ex2", "2. From 5 red and 4 blue balls, 3 are drawn at once. Draws with 2 red and 1 blue: C(5, 2) · C(4, 1) = 10 · 4 = 40, out of C(9, 3) = 84 draws in all.")}</p>
      <p>{tx(t, "mComb_ex3", "3. A pizzeria offers 8 toppings and a pizza has 3 different ones: C(8, 3) = 56 pizzas. With 2 or 3 toppings: C(8, 2) + C(8, 3) = 28 + 56 = 84.")}</p>
      <p>{tx(t, "mComb_ex4", "4. Strings of 8 bits with exactly 3 ones: choosing which 3 of the 8 positions hold the ones fixes the string: C(8, 3) = 56.")}</p>
      <p>{tx(t, "mComb_ex5", "5. Lines through pairs of 12 points, 5 of which lie on one line and no other three are collinear: C(12, 2) − C(5, 2) + 1 = 66 − 10 + 1 = 57. The 10 pairs on the special line all give the same line, counted once.")}</p>

      <H2>{tx(t, "mComb_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mComb_tWrong", "Wrong"), tx(t, "mComb_tRight", "Right"), tx(t, "mComb_tWhy", "Why")]}
        rows={[
          [tx(t, "mComb_m1w", "committees of 3 from 8: 8 · 7 · 6 = 336"), "336/3! = 56", tx(t, "mComb_m1", "a committee has no order; each one was counted 3! times")],
          [tx(t, "mComb_m2w", "3 women and 2 men: C(6, 3) + C(4, 2) = 26"), "C(6, 3) · C(4, 2) = 120", tx(t, "mComb_m2", "the two stages are made one after the other: multiply")],
          [tx(t, "mComb_m3w", "\"at least one man\": C(4, 1) · C(9, 4) = 504"), "252 − 6 = 246", tx(t, "mComb_m3", "choosing \"the\" man first counts a committee with two men twice")],
          [tx(t, "mComb_m4w", "diagonals of an octagon: C(8, 2) = 28"), "28 − 8 = 20", tx(t, "mComb_m4", "8 of those segments are sides, not diagonals")],
          [tx(t, "mComb_m5w", "C(10, 4) = 10!/4!"), "10!/(4! · 6!) = 210", tx(t, "mComb_m5", "both the chosen and the unchosen orders are divided out")],
        ]}
      />

      <MathPracticeFigure t={t} set="combinations" />

      <Related t={t} links={[
        { track: "Math", id: "arrangements", title: tx(t, "mComb_rel1", "Arrangements: When Order Matters"), why: tx(t, "mComb_rel1b", "the ordered count that a combination divides by k!.") },
        { track: "Math", id: "binomial", title: tx(t, "mComb_rel2", "The Binomial Theorem"), why: tx(t, "mComb_rel2b", "Pascal's triangle, made of the numbers C(n, k), and why they are the coefficients of (a + b)ⁿ.") },
        { track: "Math", id: "counting-advanced", title: tx(t, "mComb_rel3", "Harder Counting"), why: tx(t, "mComb_rel3b", "the next chapter: combinations with repetition, splitting into groups, overlaps.") },
        { track: "Math", id: "probability", title: tx(t, "mComb_rel4", "Probability Basics"), why: tx(t, "mComb_rel4b", "probabilities of lotteries and card hands as one combination divided by another.") },
      ]} />

      <KeyIdeas t={t} id="mComb" items={[
        "A combination is a group with no order: C(n, k) = A(n, k)/k! = n!/(k!(n − k)!).",
        "By hand: k factors down from n over k!, cancelling first; the result is always whole.",
        "C(n, k) = C(n, n − k); C(n, 0) = C(n, n) = 1, C(n, 1) = n.",
        "Groups chosen from separate sets in stages multiply: C(6, 3) · C(4, 2).",
        "\"At least one\" is usually all minus none; choosing \"the\" special member first double counts.",
        "Points make figures without order: segments C(n, 2), triangles C(n, 3), diagonals C(n, 2) − n.",
        "In mixed problems, choose the group (combination) and then give roles (arrangement).",
      ]} />
    </Article>
  );
}

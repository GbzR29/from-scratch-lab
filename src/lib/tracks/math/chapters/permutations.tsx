"use client";

// Combinatorics 2: the factorial (definition, n! = n·(n − 1)!, why 0! = 1,
// simplifying quotients, how fast it grows); simple permutations P_n = n!;
// permutations with conditions (fixed places, blocks kept together, "not
// together" as total minus together, one item before another, alternating);
// permutations with repeated items (anagrams, figure; shortest grid paths);
// circular permutations (n − 1)!; worked examples; mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { AnagramFigure } from "@/components/lesson/figures/math/AnagramFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function PermutationsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mPerm_intro",
          "A permutation is an ordering of all the items of a group: the order of runners crossing the line, of books on a shelf, of letters in a word. Counting permutations is the multiplication principle applied to one special situation, every item used exactly once, and it leads to one of the most important numbers in mathematics, the factorial. This chapter defines the factorial and learns to handle it by hand, counts permutations, and then adds the three complications that exams love: conditions on where items may stand, items that repeat, and items sitting in a circle.")}
      </Lead>

      <Goals t={t} id="mPerm" items={[
        "Compute factorials and simplify quotients of factorials without multiplying them out.",
        "Count the orders of n different items, and explain why there are n! of them.",
        "Handle conditions: fixed places, items kept together or apart, one item before another.",
        "Count anagrams of a word with repeated letters by dividing out the repeats.",
        "Count arrangements around a round table, and say why the answer is (n − 1)!.",
      ]} />

      <H2>{tx(t, "mPerm_factTitle", "The factorial")}</H2>
      <p>
        {tx(t, "mPerm_factBody",
          "In how many orders can 5 different books stand on a shelf? Fill the shelf from left to right. Any of the 5 books can go first. Whichever it was, 4 remain for the second place, then 3, then 2, and the last book goes into the last place: 5 · 4 · 3 · 2 · 1 = 120. A product of every whole number from n down to 1 appears so often that it has its own name and symbol: n factorial, written n!.")}
      </p>
      <Equation label={tx(t, "mPerm_eqFact", "The factorial")}
        where={[
          [r`n!`, tx(t, "mPerm_wFact", "read \"n factorial\": the product of all whole numbers from n down to 1")],
          [r`n`, tx(t, "mPerm_wN", "a whole number, 0 or more")],
        ]}
        note={tx(t, "mPerm_factNote", "The second form is the one used in practice: every factorial is n times the factorial before it, 6! = 6 · 5! = 6 · 120 = 720.")}
        words={tx(t, "mPerm_factWords", "n factorial is n times n minus 1 times n minus 2, and so on down to 1; it equals n times the factorial of n minus 1.")}>
        {r`n! = n \cdot (n-1) \cdot (n-2) \cdots 2 \cdot 1 \qquad n! = n \cdot (n-1)!`}
      </Equation>
      <LessonTable
        headers={["n", "0", "1", "2", "3", "4", "5", "6", "7", "8", "10"]}
        rows={[["n!", "1", "1", "2", "6", "24", "120", "720", "5040", "40 320", "3 628 800"]]}
      />
      <H3>{tx(t, "mPerm_zeroTitle", "Why 0! = 1")}</H3>
      <p>
        {tx(t, "mPerm_zeroBody",
          "0! is defined as 1, and this is not an arbitrary choice. Two independent reasons give the same value. The rule n! = n · (n − 1)! read backwards says (n − 1)! = n!/n: going down the table divides by the n you leave. Following it down to the bottom gives 0! = 1!/1 = 1. And as a count, there is exactly one way to arrange no items at all: do nothing. With 0! = 1 every formula of this section also works in its edge cases.")}
      </p>
      <Derivation t={t} label={tx(t, "mPerm_eqZero", "Walking the factorials down to 0!")}
        steps={[
          { tex: r`(n-1)! = \frac{n!}{n}`, full: true, why: tx(t, "mPerm_z1", "n! = n · (n − 1)!, divided by n on both sides") },
          { tex: r`3! = \frac{24}{4} = 6 \qquad 2! = \frac{6}{3} = 2 \qquad 1! = \frac{2}{2} = 1`, full: true, why: tx(t, "mPerm_z2", "check the rule on the table: each step down divides by the n we are leaving") },
          { tex: r`0! = \frac{1!}{1} = \green{1}`, full: true, why: tx(t, "mPerm_z3", "one more step down, from n = 1; it agrees with the count: one way to arrange nothing") },
        ]} />
      <H3>{tx(t, "mPerm_simpTitle", "Simplifying quotients of factorials")}</H3>
      <p>
        {tx(t, "mPerm_simpBody",
          "Factorials are huge, but quotients of factorials are usually small, because most of the factors cancel. Never compute both factorials and divide: write the bigger one down only as far as the smaller one, then cancel.")}
      </p>
      <Derivation t={t} label={tx(t, "mPerm_eqSimp", "Cancelling instead of multiplying")}
        steps={[
          { tex: r`\frac{10!}{8!} = \frac{10 \cdot 9 \cdot \cancel{8!}}{\cancel{8!}} = 90`, full: true, why: tx(t, "mPerm_s1", "write 10! as 10 · 9 · 8! and cancel the 8!") },
          { tex: r`\frac{(n+1)!}{(n-1)!} = \frac{(n+1)\,n\,\cancel{(n-1)!}}{\cancel{(n-1)!}} = n^2 + n`, full: true, why: tx(t, "mPerm_s2", "the same move with letters: stop at the smaller factorial") },
          { tex: r`\frac{n!}{(n-2)!} = 30 \;\Rightarrow\; n(n-1) = 30 = 6 \cdot 5 \;\Rightarrow\; \green{n = 6}`, full: true, why: tx(t, "mPerm_s3", "an equation with factorials becomes a small polynomial equation; n must be a whole number") },
        ]} />
      <p>
        {tx(t, "mPerm_growBody",
          "The factorial grows faster than any power. 10! is already over three million, 20! is about 2.4 · 10¹⁸, and a deck of 52 cards can be shuffled into 52! ≈ 8 · 10⁶⁷ orders. That is why a well-shuffled deck is almost certainly in an order that no deck in history has ever been in.")}
      </p>

      <H2>{tx(t, "mPerm_simpleTitle", "Simple permutations")}</H2>
      <p>
        {tx(t, "mPerm_simpleBody",
          "An ordering of all n items of a group, each used exactly once, is a simple permutation of those items. The shelf argument works for any n: n options for the first place, n − 1 for the second, down to 1 for the last. So there are n! permutations. The symbol P with the number of items below is common in Brazilian textbooks: P₅ = 5! = 120.")}
      </p>
      <Equation label={tx(t, "mPerm_eqPerm", "Simple permutations")}
        where={[
          [r`P_n`, tx(t, "mPerm_wPn", "the number of orders of n different items, each used once")],
          [r`n`, tx(t, "mPerm_wNitems", "the number of items; all of them are different")],
        ]}
        words={tx(t, "mPerm_permWords", "n different items can be put in order in n factorial ways.")}>
        {r`P_n = n!`}
      </Equation>
      <p>
        {tx(t, "mPerm_anagBody",
          "A classic use: anagrams. An anagram of a word is any ordering of its letters, whether it means something or not. The word AMOR has 4 different letters, so it has P₄ = 4! = 24 anagrams: AMOR, AMRO, AOMR, and so on, including ROMA. The word LIVRO has 5 different letters: 5! = 120 anagrams.")}
      </p>

      <H2>{tx(t, "mPerm_condTitle", "Permutations with conditions")}</H2>
      <p>
        {tx(t, "mPerm_condBody",
          "Exam problems rarely ask for all the orders; they add a condition. Each kind of condition has a standard way in, and all of them are the multiplication principle with the restricted part handled first.")}
      </p>
      <H3>{tx(t, "mPerm_fixTitle", "Items in fixed places")}</H3>
      <p>
        {tx(t, "mPerm_fixBody",
          "How many anagrams of LIVRO start with a vowel? Fill the restricted place first: the first letter is I or O, 2 options. The other 4 letters fill the remaining 4 places in any order: 4! = 24. Total 2 · 24 = 48. Start with a vowel and end with a consonant: first place 2 options, last place 3 (L, V, R), middle 3! = 6: 2 · 3 · 6 = 36.")}
      </p>
      <H3>{tx(t, "mPerm_blockTitle", "Items that must stay together: the block")}</H3>
      <p>
        {tx(t, "mPerm_blockBody",
          "Six friends stand in a row for a photo, and two of them, a couple, want to stand side by side. Glue the couple into one block. Now there are 5 things to arrange, the block and the 4 others: 5! = 120. Inside the block the couple can stand in 2! = 2 orders. Total 120 · 2 = 240. In general, a block of m items that must stay together among n items gives (n − m + 1)! · m!.")}
      </p>
      <H3>{tx(t, "mPerm_apartTitle", "Items that must stay apart: total minus together")}</H3>
      <p>
        {tx(t, "mPerm_apartBody",
          "If the couple must not stand side by side, count the opposite. All orders: 6! = 720. Orders with the couple together: 240. Every order is one or the other, so 720 − 240 = 480 orders have them apart. Counting what you do not want and subtracting it from the total is called counting by the complement, and it is often the shortest way.")}
      </p>
      <H3>{tx(t, "mPerm_beforeTitle", "One item before another: symmetry")}</H3>
      <p>
        {tx(t, "mPerm_beforeBody",
          "In how many orders of the 6 friends does Ana stand somewhere to the left of Bia, not necessarily next to her? Swap the two in any order and you get an order where Bia is to the left of Ana. This swap pairs the orders up perfectly, so exactly half of them have Ana first: 720/2 = 360. With three people who must appear in a given order among themselves, divide by 3! = 6.")}
      </p>
      <H3>{tx(t, "mPerm_altTitle", "Alternating rows")}</H3>
      <p>
        {tx(t, "mPerm_altBody",
          "3 boys and 3 girls stand in a row, alternating boy and girl. The pattern is either B G B G B G or G B G B G B: 2 cases. In each, the boys fill their 3 places in 3! = 6 ways and the girls theirs in 3! = 6 ways. Total 2 · 6 · 6 = 72.")}
      </p>

      <H2>{tx(t, "mPerm_repTitle", "Permutations with repeated items")}</H2>
      <p>
        {tx(t, "mPerm_repBody",
          "How many anagrams does BANANA have? It has 6 letters, so 6! = 720 if they were all different. But they are not: there are three A's and two N's. Swapping two A's gives back the same word, so 720 counts each real word several times. The way out is to pretend the repeated letters are different by numbering them, count, and then divide out the numbering.")}
      </p>
      <Derivation t={t} label={tx(t, "mPerm_eqBanana", "Counting the words of BANANA")}
        steps={[
          { tex: r`\text{B A}_1\text{ N}_1\text{ A}_2\text{ N}_2\text{ A}_3: \quad 6! = 720`, full: true, why: tx(t, "mPerm_n1", "number the repeated letters; 6 different symbols have 6! orders") },
          { tex: r`\text{A}_1\text{A}_2\text{A}_3 \to 3! = 6 \qquad \text{N}_1\text{N}_2 \to 2! = 2`, full: true, why: tx(t, "mPerm_n2", "rubbing the numbers out, each real word appears once for each order of its A's times each order of its N's") },
          { tex: r`\frac{6!}{3! \cdot 2!} = \frac{720}{12} = \green{60}`, full: true, why: tx(t, "mPerm_n3", "so each word was counted 6 · 2 = 12 times: divide by 12") },
        ]} />
      <AnagramFigure t={t} />
      <Equation label={tx(t, "mPerm_eqRep", "Permutations with repetition")}
        where={[
          [r`n`, tx(t, "mPerm_wNrep", "the total number of items, repeats included")],
          [r`a, b, c, \ldots`, tx(t, "mPerm_wAbc", "how many times each repeated item appears (an item that appears once contributes 1! = 1)")],
        ]}
        note={tx(t, "mPerm_repNote", "MISSISSIPPI: 11 letters, I four times, S four times, P twice: 11!/(4! · 4! · 2!) = 39 916 800/1152 = 34 650.")}
        words={tx(t, "mPerm_repWords", "Divide n factorial by the factorial of the number of copies of each repeated item.")}>
        {r`P_n^{\,a,\,b,\,c,\ldots} = \frac{n!}{a!\;b!\;c!\cdots}`}
      </Equation>
      <p>
        {tx(t, "mPerm_gridBody",
          "The same formula counts shortest paths on a grid. To walk from one corner of a street grid to the corner 4 blocks east and 3 blocks north, always going east (E) or north (N), every route is a word of 7 moves with four E's and three N's, like EENENNE. So the number of shortest routes is 7!/(4! · 3!) = 35. A route that must pass through a given corner is two such walks, one after the other: multiply them.")}
      </p>

      <H2>{tx(t, "mPerm_circTitle", "Circular permutations")}</H2>
      <p>
        {tx(t, "mPerm_circBody",
          "Around a round table, what matters is who sits next to whom, not which chair is \"first\". If everybody stands up and moves one chair to the left, the seating has not really changed. So each real seating was counted n times among the n! orders of a row, once for each turn. Equivalently: fix one person's chair to remove the turning, and arrange the other n − 1 people in the remaining chairs, as in a row.")}
      </p>
      <Equation label={tx(t, "mPerm_eqCirc", "Circular permutations")}
        where={[
          [r`(PC)_n`, tx(t, "mPerm_wPc", "the number of ways to seat n different people around a round table, turns counted as the same")],
          [r`\frac{n!}{n}`, tx(t, "mPerm_wDiv", "the row orders, each seating counted once for every one of the n turns")],
        ]}
        note={tx(t, "mPerm_circNote", "Six people around a table: 5! = 120, not 720. If, in addition, flipping the circle over counts as the same (beads on a necklace that can be turned over), divide by 2 again: 5!/2 = 60.")}
        words={tx(t, "mPerm_circWords", "Around a circle, fix one item and arrange the rest: n minus 1 factorial.")}>
        {r`(PC)_n = \frac{n!}{n} = (n-1)!`}
      </Equation>
      <Callout type="warn" t={t}>
        {tx(t, "mPerm_circWarn", "The table is circular only if the chairs are all alike. If the chairs are labelled (a head of the table, numbered seats), turning everyone does change the seating, and the count goes back to n!.")}
      </Callout>

      <H2>{tx(t, "mPerm_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mPerm_ex1", "1. Eight athletes in a final: the number of possible orders at the finish line, with no ties, is 8! = 40 320.")}</p>
      <p>{tx(t, "mPerm_ex2", "2. Anagrams of ESCOLA that start with S: S is fixed in the first place and the other 5 letters are free: 5! = 120.")}</p>
      <p>{tx(t, "mPerm_ex3", "3. Anagrams of ARARA: 5 letters, three A's and two R's: 5!/(3! · 2!) = 120/12 = 10.")}</p>
      <p>{tx(t, "mPerm_ex4", "4. Seven books on a shelf, the 3 maths books together in any order: block of 3 plus 4 other books, 5 things: 5! · 3! = 120 · 6 = 720.")}</p>
      <p>{tx(t, "mPerm_ex5", "5. Five children play a round game holding hands in a circle: (5 − 1)! = 24 different circles.")}</p>

      <H2>{tx(t, "mPerm_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mPerm_tWrong", "Wrong"), tx(t, "mPerm_tRight", "Right"), tx(t, "mPerm_tWhy", "Why")]}
        rows={[
          ["0! = 0", "0! = 1", tx(t, "mPerm_m1", "there is one way to arrange nothing, and it keeps n! = n · (n − 1)! true for n = 1")],
          ["10!/5! = 2!", "10 · 9 · 8 · 7 · 6 = 30 240", tx(t, "mPerm_m2", "factorials do not divide like the numbers inside them; cancel the common tail")],
          [tx(t, "mPerm_m3w", "BANANA: 6! = 720 anagrams"), "6!/(3! · 2!) = 60", tx(t, "mPerm_m3", "swapping identical letters gives the same word; divide out the repeats")],
          [tx(t, "mPerm_m4w", "couple together: 5! = 120"), "5! · 2! = 240", tx(t, "mPerm_m4", "the two inside the block can also swap")],
          [tx(t, "mPerm_m5w", "6 people at a round table: 6! = 720"), "5! = 120", tx(t, "mPerm_m5", "turning everyone together is the same seating")],
        ]}
      />

      <MathPracticeFigure t={t} set="permutations" />

      <Related t={t} links={[
        { track: "Math", id: "counting", title: tx(t, "mPerm_rel1", "What Is Combinatorics? The Counting Principles"), why: tx(t, "mPerm_rel1b", "the multiplication principle that every formula here comes from.") },
        { track: "Math", id: "arrangements", title: tx(t, "mPerm_rel2", "Arrangements: When Order Matters"), why: tx(t, "mPerm_rel2b", "the next chapter: putting only some of the items in order.") },
      ]} />

      <KeyIdeas t={t} id="mPerm" items={[
        "n! = n · (n − 1) · … · 1, and n! = n · (n − 1)!; 0! = 1.",
        "Quotients of factorials cancel: write the larger only down to the smaller.",
        "n different items have Pₙ = n! orders.",
        "Fixed places first; a block that stays together counts as one item, times its inner orders; \"apart\" is total minus together.",
        "Repeated items: divide n! by the factorial of each repeat count.",
        "Around a round table with identical chairs: (n − 1)!.",
      ]} />
    </Article>
  );
}

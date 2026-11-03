"use client";

// Calculus 1b: limits at infinity, step by step — what x → ±∞ means (the
// cost-per-item table, the N–ε version); the three building blocks and the
// arithmetic of ∞ with its undecided forms; polynomials follow their leading
// term; the four-step method for ratios of polynomials and its three cases;
// square roots (√x² = |x|, the sign at −∞); ∞ − ∞ with the conjugate; the
// growth ranking ln ≪ power ≪ exponential; 1^∞ and (1 + k/x)ˣ → eᵏ; oblique
// asymptotes; a checklist, worked examples and generated practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { InfinityFigure } from "@/components/lesson/figures/math/InfinityFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;
const dec = (v: number, d: number) => v.toFixed(d).replace("-", "−");

// ── Live formula: (1 + k/x)ˣ against eᵏ ───────────────────────────────────────
const compoundNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const { k, x } = v, val = (1 + k / x) ** x, ek = Math.exp(k);
  return {
    tex: r`\left(1 + \frac{${k}}{${x}}\right)^{${x}} = \green{${dec(val, 5)}} \qquad e^{${k}} = ${dec(ek, 5)} \qquad \text{${tx(t, "mLi_liveGap", "gap")}: } ${dec(Math.abs(ek - val), 5)}`,
    meter: val / ek,
    meterLabel: `${tx(t, "mLi_liveShare", "share of eᵏ reached")}: ${dec(100 * val / ek, 2)} %`,
  };
};

export function LimitsInfinityContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mLi_intro",
          "What happens in the long run? The cost of each item when a factory makes more and more of them, the amount of a medicine left after many hours, the speed a falling raindrop settles at. All of these are limits as x → ∞: x grows past every number, and we ask where f(x) is heading. One idea is behind every exercise in this chapter: far out, only the fastest-growing part of an expression matters. You will learn to spot that part, divide by it and read off the answer, and to handle the few places where that idea needs care: minus infinity, square roots, and ∞ − ∞.")}
      </Lead>

      <Goals t={t} id="mLi" items={[
        "Say what lim f(x) = L as x → ∞ means, and check a guess with a table of values.",
        "Find the limit of any ratio of polynomials at +∞ or −∞, by dividing and by comparing degrees.",
        "Get the sign right with square roots at −∞, and undo ∞ − ∞ with the conjugate.",
        "Rank logarithms, powers and exponentials by how fast they grow, and use the ranking to find limits.",
      ]} />

      <H2>{tx(t, "mLi_meanTitle", "What x → ∞ means")}</H2>
      <p>
        {tx(t, "mLi_meanBody",
          "x → ∞ (read \"x tends to infinity\") means that x takes larger and larger values, 10, 100, 1000 and on, passing every number you could name. We never plug in ∞: infinity is not a number, and 1/∞ is not a calculation. We watch what f(x) does while x keeps growing. Take a factory that pays 5000 to set up a machine and then 2 for each item it makes. Making x items costs 5000 + 2x, so the cost per item is C(x) = (5000 + 2x)/x.")}
      </p>
      <LessonTable
        headers={[tx(t, "mLi_tItems", "items x"), "10", "100", "1000", "10 000", "1 000 000"]}
        rows={[[tx(t, "mLi_tCost", "cost per item C(x)"), "502", "52", "7", "2.5", "2.005"]]}
      />
      <p>
        {tx(t, "mLi_meanBody2",
          "The cost per item closes in on 2: the setup cost is shared by so many items that each one carries almost none of it. Algebra says the same: C(x) = 5000/x + 2, and 5000/x shrinks toward 0. We write lim C(x) = 2 as x → ∞. The line y = 2 is called a horizontal asymptote: the graph gets as close to it as you like, and here never touches it.")}
      </p>
      <Equation label={tx(t, "mLi_eqDef", "The limit as x tends to infinity")}
        where={[
          [r`x \to \infty`, tx(t, "mLi_wTo", "x grows without bound: past 10, past a million, past any number")],
          [r`f(x)`, tx(t, "mLi_wF", "the function's value at those ever larger x")],
          [r`L`, tx(t, "mLi_wL", "the limit: a number the values f(x) end up as close to as you want")],
          [r`\infty`, tx(t, "mLi_wInf", "not a number: shorthand for \"without bound\"")],
        ]}
        note={tx(t, "mLi_defNote", "Precisely: for every tolerance ε > 0 there is a point N such that every x > N gives |f(x) − L| < ε. It is the ε–δ game of the last chapter, with \"x close enough to a\" replaced by \"x large enough\".")}
        words={tx(t, "mLi_defWords", "However close to L you demand, from some point on all the values of f stay that close.")}>
        {r`\lim_{x \to \infty} \frac{5000 + 2x}{x} = 2 \qquad\text{in general}\qquad \lim_{x \to \infty} f(x) = L`}
      </Equation>
      <p>
        {tx(t, "mLi_meanBody3",
          "x → −∞ is the same idea to the left: x = −10, −100, −1000 and on. And when f(x) itself grows past every number, we write lim f(x) = ∞. That is not a value: it says the values run away, and on that side the graph has no horizontal asymptote.")}
      </p>

      <H2>{tx(t, "mLi_blocksTitle", "The three building blocks")}</H2>
      <p>
        {tx(t, "mLi_blocksBody",
          "Every limit in this chapter is assembled from three facts. Each one can be checked with a single number.")}
      </p>
      <LessonTable
        headers={[tx(t, "mLi_tFact", "fact"), tx(t, "mLi_tWhy", "why"), tx(t, "mLi_tCheck", "check at x = 1000")]}
        rows={[
          [tx(t, "mLi_b1f", "c / xᵏ → 0, for any number c and any power k > 0"), tx(t, "mLi_b1w", "a fixed number divided by a huge one is tiny"), "5 / x² = 0.000005"],
          [tx(t, "mLi_b2f", "xᵏ → +∞ as x → +∞, for k > 0"), tx(t, "mLi_b2w", "a power of a huge number is even larger"), "x² = 1 000 000"],
          [tx(t, "mLi_b3f", "a constant c stays c"), tx(t, "mLi_b3w", "it does not depend on x"), "7 = 7"],
        ]}
      />
      <p>
        {tx(t, "mLi_blocksBody2",
          "At −∞ the second fact depends on the power. An even power is positive, so it still goes to +∞: (−1000)² = 1 000 000. An odd power keeps the minus sign and goes to −∞: (−1000)³ = −1 000 000 000. The first fact holds at −∞ too: 5/(−1000) = −0.005 is still tiny.")}
      </p>

      <H3>{tx(t, "mLi_arithTitle", "Arithmetic with infinity")}</H3>
      <p>
        {tx(t, "mLi_arithBody",
          "Combining the blocks, some results are clear and some are not. When both parts push the same way the answer is decided. When they pull against each other it is not: the form alone tells you nothing, and you must rewrite the expression first. These undecided forms are called indeterminate forms.")}
      </p>
      <LessonTable
        headers={[tx(t, "mLi_tForm", "form"), tx(t, "mLi_tResult", "result"), tx(t, "mLi_tReason", "why")]}
        rows={[
          ["∞ + ∞", "∞", tx(t, "mLi_a1", "both grow")],
          ["c · ∞", "±∞", tx(t, "mLi_a2", "+∞ if c > 0, −∞ if c < 0 (c ≠ 0)")],
          ["c / ∞", "0", tx(t, "mLi_a3", "the first building block")],
          ["∞ · ∞", "∞", tx(t, "mLi_a4", "both grow")],
          ["∞ − ∞", tx(t, "mLi_undecided", "undecided"), tx(t, "mLi_a5", "x² − x → ∞, but (x + 1) − x = 1 and x − x² → −∞")],
          ["∞ / ∞", tx(t, "mLi_undecided", "undecided"), tx(t, "mLi_a6", "2x/x → 2, x²/x → ∞, x/x² → 0")],
          ["0 · ∞", tx(t, "mLi_undecided", "undecided"), tx(t, "mLi_a7", "(1/x) · x = 1, (1/x) · x² → ∞")],
        ]}
      />
      <p>
        {tx(t, "mLi_arithBody2",
          "Almost every exercise starts as ∞/∞ or ∞ − ∞. The rest of the chapter is the toolbox for turning those into something decided.")}
      </p>

      <H2>{tx(t, "mLi_polyTitle", "Polynomials: the leading term wins")}</H2>
      <p>
        {tx(t, "mLi_polyBody",
          "Take p(x) = 2x³ − 100x² + 5. As x → ∞ the first term goes to +∞ and the second to −∞: ∞ − ∞, undecided. Look at the sizes instead. At x = 1000 the three terms are 2 000 000 000, −100 000 000 and 5. The first is twenty times the second, and the gap keeps widening, because x³ is x times x², and x keeps growing. The term with the highest power is called the leading term, and far out it is the only one that matters.")}
      </p>
      <Derivation t={t} label={tx(t, "mLi_eqPoly", "Why only the leading term matters")}
        steps={[
          { tex: r`p(x) = 2x^3 - 100x^2 + 5` },
          { tex: r`= x^3\left(2 - \frac{100}{x} + \frac{5}{x^3}\right)`, why: tx(t, "mLi_p1", "take out the highest power, x³: divide each term by x³ inside the bracket, and multiply by x³ outside so nothing changes") },
          { tex: r`\left(2 - \frac{100}{x} + \frac{5}{x^3}\right) \to 2 - 0 + 0 = 2`, why: tx(t, "mLi_p2", "100/x and 5/x³ are a number over a growing power: they go to 0") },
          { tex: r`p(x) \approx 2x^3 \to \green{+\infty}`, why: tx(t, "mLi_p3", "x³ grows without bound, times a bracket that settles on the positive number 2") },
        ]} />
      <p>
        {tx(t, "mLi_polyBody2",
          "At −∞ the bracket still tends to 2, but x³ → −∞, so p(x) → −∞. The rule: a polynomial at ±∞ goes where its leading term goes. Only two things decide it: the sign of the leading coefficient, and, at −∞, whether the degree is even or odd. So −x⁴ + 50x³ → −∞ on both sides, and 3x⁵ − x → +∞ at +∞ but −∞ at −∞.")}
      </p>

      <H2>{tx(t, "mLi_ratioTitle", "Ratios of polynomials: the method")}</H2>
      <p>
        {tx(t, "mLi_ratioBody",
          "A fraction of two polynomials is ∞/∞ (or something over ∞), undecided. The method has four steps, and it always works:")}
      </p>
      <LessonTable
        headers={[tx(t, "mLi_tStep", "step"), tx(t, "mLi_tDo", "what you do"), r`(3x² − 20x)/(x² + 5)`]}
        rows={[
          ["1", tx(t, "mLi_m1", "Find the highest power of x in the denominator."), "x²"],
          ["2", tx(t, "mLi_m2", "Divide every term, top and bottom, by that power. The fraction's value does not change: dividing top and bottom by the same thing is multiplying by 1."), "(3 − 20/x) / (1 + 5/x²)"],
          ["3", tx(t, "mLi_m3", "Every term of the form c/xᵏ goes to 0."), "(3 − 0) / (1 + 0)"],
          ["4", tx(t, "mLi_m4", "Read off what is left: a number, or something that still grows."), "3"],
        ]}
      />
      <p>
        {tx(t, "mLi_ratioBody2",
          "Which of three things happens depends only on how the degree of the top (its highest power, m) compares with the degree of the bottom (n).")}
      </p>

      <H3>{tx(t, "mLi_c1Title", "Case 1: the same degree gives the ratio of the leading coefficients")}</H3>
      <Derivation t={t} label={tx(t, "mLi_eqC1", "Same degree on top and bottom")}
        steps={[
          { tex: r`\lim_{x \to \infty} \frac{3x^2 - 20x}{x^2 + 5}` },
          { tex: r`= \lim_{x \to \infty} \frac{3 - \frac{20}{x}}{1 + \frac{5}{x^2}}`, why: tx(t, "mLi_c1a", "divide every term by x², the highest power in the denominator: 3x²/x² = 3, 20x/x² = 20/x, x²/x² = 1, 5/x²") },
          { tex: r`= \frac{3 - 0}{1 + 0}`, why: tx(t, "mLi_c1b", "20/x and 5/x² go to 0") },
          { tex: r`= \green{3}`, why: tx(t, "mLi_c1c", "only the leading coefficients are left: 3 on top, 1 below") },
        ]} />
      <p>
        {tx(t, "mLi_c1Body",
          "The −20x is not small at first: at x = 5 the fraction is (75 − 100)/30 ≈ −0.83, nowhere near 3. But it grows only like x while 3x² grows like x², so far out it no longer counts. The figure below shows exactly this.")}
      </p>

      <H3>{tx(t, "mLi_c2Title", "Case 2: a bigger degree below gives 0")}</H3>
      <Derivation t={t} label={tx(t, "mLi_eqC2", "The bottom grows faster")}
        steps={[
          { tex: r`\lim_{x \to \infty} \frac{3x + 2}{x^2 + 1}` },
          { tex: r`= \lim_{x \to \infty} \frac{\frac{3}{x} + \frac{2}{x^2}}{1 + \frac{1}{x^2}}`, why: tx(t, "mLi_c2a", "divide every term by x²: 3x/x² = 3/x, 2/x², x²/x² = 1, 1/x²") },
          { tex: r`= \frac{0 + 0}{1 + 0} = \green{0}`, why: tx(t, "mLi_c2b", "everything on top goes to 0, the bottom goes to 1") },
        ]} />
      <p>
        {tx(t, "mLi_c2Body",
          "The bottom wins the race: it grows like x², the top only like x, so the fraction behaves like 3x/x² = 3/x, which is crushed to 0.")}
      </p>

      <H3>{tx(t, "mLi_c3Title", "Case 3: a bigger degree on top gives ±∞")}</H3>
      <Derivation t={t} label={tx(t, "mLi_eqC3", "The top grows faster")}
        steps={[
          { tex: r`\lim_{x \to \pm\infty} \frac{x^2 - 8x}{2x + 1}` },
          { tex: r`= \lim_{x \to \pm\infty} \frac{x - 8}{2 + \frac{1}{x}}`, why: tx(t, "mLi_c3a", "divide every term by x, the highest power in the denominator: x²/x = x, 8x/x = 8, 2x/x = 2, 1/x") },
          { tex: r`\text{${tx(t, "mLi_c3top", "top")}} \to \pm\infty, \quad \text{${tx(t, "mLi_c3bot", "bottom")}} \to 2`, why: tx(t, "mLi_c3b", "x − 8 follows x; 1/x goes to 0") },
          { tex: r`x \to +\infty: \green{+\infty} \qquad x \to -\infty: \green{-\infty}`, why: tx(t, "mLi_c3c", "something that runs away, divided by the positive number 2, keeps running away with the same sign") },
        ]} />

      <Equation label={tx(t, "mLi_eqDom", "The shortcut: keep only the leading terms")}
        where={[
          [r`a x^m`, tx(t, "mLi_wTop", "the leading term of the top: coefficient a, degree m")],
          [r`b x^n`, tx(t, "mLi_wBot", "the leading term of the bottom: coefficient b, degree n")],
          [r`m - n`, tx(t, "mLi_wDiff", "the difference of the degrees decides: negative gives 0, zero gives a/b, positive gives ±∞")],
        ]}
        words={tx(t, "mLi_domWords", "Far out, a ratio of polynomials behaves like its top leading term over its bottom leading term, and that simplifies to a number times a single power of x.")}>
        {r`\frac{a x^m + \cdots}{b x^n + \cdots} \;\approx\; \frac{a x^m}{b x^n} = \frac{a}{b}\, x^{m - n}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "mLi_tDeg", "degrees"), tx(t, "mLi_tLim", "limit at ±∞"), tx(t, "mLi_tEx", "example")]}
        rows={[
          ["m < n", "0", "(3x + 2)/(x² + 1) → 0"],
          ["m = n", "a / b", "(3x² − 20x)/(x² + 5) → 3"],
          ["m > n", tx(t, "mLi_r3", "±∞: the sign of (a/b) · x^(m − n) on that side"), tx(t, "mLi_r3ex", "(x² − 8x)/(2x + 1) → +∞ at +∞, −∞ at −∞")],
        ]}
      />
      <Callout type="tip" t={t}>
        {tx(t, "mLi_tip", "Use the table to check an answer in seconds, but in a written solution show the division step: it is the actual reason, and it is what still works when the expression is not a plain ratio of polynomials. And look for the highest power, not the first term written: in (5 − x + 2x²)/(7x² + 1) the leading term on top is 2x², so the limit is 2/7.")}
      </Callout>

      <InfinityFigure t={t} />

      <H2>{tx(t, "mLi_rootTitle", "Square roots: √(x²) is |x|, not x")}</H2>
      <p>
        {tx(t, "mLi_rootBody",
          "Roots change one thing. To take x² out of a square root you use √(x²) = |x|, the absolute value (the number without its sign), because a square root is never negative. For x → +∞, x is positive and |x| = x, so nothing changes. For x → −∞, x is negative, so |x| = −x. Forgetting that minus sign is the most common mistake in this whole chapter.")}
      </p>
      <Derivation t={t} label={tx(t, "mLi_eqRoot", "A root at minus infinity")}
        steps={[
          { tex: r`\lim_{x \to -\infty} \frac{\sqrt{4x^2 + 1}}{x + 3}` },
          { tex: r`= \lim_{x \to -\infty} \frac{|x|\sqrt{4 + \frac{1}{x^2}}}{x + 3}`, why: tx(t, "mLi_q1", "inside the root, 4x² + 1 = x²(4 + 1/x²), and √(x² · something) = √(x²) · √(something) = |x| · √(something)") },
          { tex: r`= \lim_{x \to -\infty} \frac{-x\sqrt{4 + \frac{1}{x^2}}}{x + 3}`, why: tx(t, "mLi_q2", "x is negative here, so |x| = −x") },
          { tex: r`= \lim_{x \to -\infty} \frac{-\sqrt{4 + \frac{1}{x^2}}}{1 + \frac{3}{x}}`, why: tx(t, "mLi_q3", "divide top and bottom by x: −x/x = −1, x/x = 1, 3/x") },
          { tex: r`= \frac{-\sqrt{4}}{1} = \green{-2}`, why: tx(t, "mLi_q4", "1/x² and 3/x go to 0") },
        ]} />
      <p>
        {tx(t, "mLi_rootBody2",
          "At +∞ the same steps, with |x| = x, give +2. One function, two horizontal asymptotes: y = 2 on the right and y = −2 on the left. A sign check with one number catches the mistake every time: at x = −1000 the top is about 2000 (a root is positive) and the bottom is −997, so the fraction is about −2.")}
      </p>

      <H2>{tx(t, "mLi_conjTitle", "∞ − ∞ with a root: the conjugate")}</H2>
      <p>
        {tx(t, "mLi_conjBody",
          "√(x² + 6x) − x as x → +∞ is ∞ − ∞. Here the leading-term idea alone fails: inside the root the leading term is x², √(x²) = x, and x − x = 0, but the answer is not 0. The two big terms almost cancel, and what decides is the small leftover. Multiplying by the conjugate (the same two terms with the sign between them flipped) turns the difference into a fraction, and fractions we know how to handle.")}
      </p>
      <Derivation t={t} label={tx(t, "mLi_eqConj", "Undoing ∞ − ∞ with the conjugate")}
        steps={[
          { tex: r`\lim_{x \to \infty} \left(\sqrt{x^2 + 6x} - x\right)` },
          { tex: r`= \lim_{x \to \infty} \frac{\left(\sqrt{x^2 + 6x} - x\right)\left(\sqrt{x^2 + 6x} + x\right)}{\sqrt{x^2 + 6x} + x}`, why: tx(t, "mLi_j1", "multiply by the conjugate over itself, which is 1, so the value does not change") },
          { tex: r`= \lim_{x \to \infty} \frac{(x^2 + 6x) - x^2}{\sqrt{x^2 + 6x} + x} = \lim_{x \to \infty} \frac{6x}{\sqrt{x^2 + 6x} + x}`, why: tx(t, "mLi_j2", "difference of squares on top: (u − v)(u + v) = u² − v². The x² cancels exactly, which is the whole point") },
          { tex: r`= \lim_{x \to \infty} \frac{6}{\sqrt{1 + \frac{6}{x}} + 1}`, why: tx(t, "mLi_j3", "now it is ∞/∞: divide top and bottom by x. Inside the root that means dividing by x², because x = √(x²) when x > 0") },
          { tex: r`= \frac{6}{1 + 1} = \green{3}`, why: tx(t, "mLi_j4", "6/x goes to 0, and √1 = 1") },
        ]} />
      <p>
        {tx(t, "mLi_conjBody2",
          "Check with a number: at x = 1000, √(1 006 000) ≈ 1002.996, and minus 1000 leaves 2.996. A rule of thumb: for large x, √(x² + bx) ≈ x + b/2, because (x + b/2)² = x² + bx + b²/4 is almost the same thing under the root. At −∞ there is nothing to undo: √(x² + 6x) is positive and −x is positive too, so the sum is ∞ + ∞ = +∞. Undecided forms must be rewritten, but first make sure the form really is undecided.")}
      </p>

      <H2>{tx(t, "mLi_growTitle", "Exponentials and logarithms: who grows fastest")}</H2>
      <p>
        {tx(t, "mLi_growBody",
          "Beyond polynomials the same idea, divide by the fastest-growing term, needs a ranking of how fast things grow as x → ∞.")}
      </p>
      <Equation label={tx(t, "mLi_eqRank", "The growth ranking")}
        where={[
          [r`\ll`, tx(t, "mLi_wLl", "\"grows much more slowly than\": the left side divided by the right side goes to 0")],
          [r`\ln x`, tx(t, "mLi_wLn", "the natural logarithm (any logarithm behaves the same)")],
          [r`x^{p}`, tx(t, "mLi_wPow", "any positive power, even a small one like √x = x^(1/2)")],
          [r`a^{x}`, tx(t, "mLi_wExp", "an exponential with any base a > 1, such as 2ˣ or eˣ")],
        ]}
        note={tx(t, "mLi_rankNote", "Every logarithm loses to every power, and every power loses to every exponential, whatever the constants: x¹⁰⁰ / 1.01ˣ → 0 too, even though for a long stretch the power is far bigger.")}
        words={tx(t, "mLi_rankWords", "Logarithms grow slowest, powers faster, exponentials fastest of the three.")}>
        {r`\ln x \;\ll\; x^{p} \;\ll\; a^{x} \qquad (p > 0,\; a > 1)`}
      </Equation>
      <LessonTable
        headers={["x", "ln x", "x²", "2ˣ"]}
        rows={[
          ["10", "2.3", "100", "1024"],
          ["100", "4.6", "10 000", "1.27 · 10³⁰"],
          ["1000", "6.9", "1 000 000", "1.07 · 10³⁰¹"],
        ]}
      />
      <p>
        {tx(t, "mLi_growBody2",
          "Why the exponential wins: going from x to x + 1 multiplies 2ˣ by 2, every single time. The same step multiplies x² by ((x + 1)/x)², which is 1.21 at x = 10 and only 1.0201 at x = 100, closer and closer to 1. A fixed doubling at every step beats a growth factor that fades toward 1. The logarithm is the slow one because it undoes the exponential: for ln x to reach 100 you need x = e¹⁰⁰, a number with 44 digits.")}
      </p>
      <Derivation t={t} label={tx(t, "mLi_eqExp", "Divide by the exponential")}
        steps={[
          { tex: r`\lim_{x \to \infty} \frac{3 \cdot 2^x + x}{2^x + 1}` },
          { tex: r`= \lim_{x \to \infty} \frac{3 + \frac{x}{2^x}}{1 + \frac{1}{2^x}}`, why: tx(t, "mLi_e1", "the fastest-growing term is 2ˣ: divide every term by it") },
          { tex: r`= \frac{3 + 0}{1 + 0} = \green{3}`, why: tx(t, "mLi_e2", "x/2ˣ → 0 by the ranking (a power loses to an exponential), and 1/2ˣ → 0") },
        ]} />
      <p>
        {tx(t, "mLi_growBody3",
          "At −∞ an exponential with base above 1 goes to 0: 2⁻¹⁰⁰⁰ = 1/2¹⁰⁰⁰. So the same function at −∞ becomes (0 + x)/(0 + 1), which follows x down to −∞. Switch the figure to x → −∞ to see it. In the same way e⁻ˣ → 0 as x → ∞: that is the shape of a cooling cup, of radioactive decay and of a charging capacitor, all of which settle on a final value.")}
      </p>

      <H2>{tx(t, "mLi_eTitle", "One more undecided form: 1^∞")}</H2>
      <p>
        {tx(t, "mLi_eBody",
          "(1 + 1/x)ˣ looks like 1^∞: the base heads for 1, and 1 to any power is 1, but the exponent grows without bound, and a number even slightly above 1, raised to a huge power, is huge. The two pull against each other, and the result is the number e ≈ 2.71828, which you met in the exponents chapter as the limit of compound interest. A substitution turns it into a whole family.")}
      </p>
      <Derivation t={t} label={tx(t, "mLi_eqE", "From e to eᵏ")}
        steps={[
          { tex: r`\lim_{x \to \infty} \left(1 + \frac{k}{x}\right)^{x}` },
          { tex: r`= \lim_{u \to \infty} \left(1 + \frac{1}{u}\right)^{k u}`, why: tx(t, "mLi_k1", "put u = x/k (k > 0 a fixed number): then k/x = 1/u and x = ku, and u → ∞ as x → ∞") },
          { tex: r`= \lim_{u \to \infty} \left[\left(1 + \frac{1}{u}\right)^{u}\right]^{k}`, why: tx(t, "mLi_k2", "a power of a power: (bᵘ)ᵏ = bᵘᵏ") },
          { tex: r`= \green{e^{k}}`, why: tx(t, "mLi_k3", "the inside tends to e, and raising to the fixed power k is continuous") },
        ]} />
      <p>
        {tx(t, "mLi_eBody2",
          "So (1 + 3/x)ˣ → e³ ≈ 20.09 and (1 − 1/x)ˣ → e⁻¹ ≈ 0.368 (for a negative k the same steps work with u = x/k → −∞, because (1 + 1/u)ᵘ tends to e from that side too). In money terms: 100 % yearly interest paid in x tiny instalments grows 1 into e, and 300 % into e³.")}
      </p>
      <LiveFormula label={tx(t, "mLi_liveE", "Try it: (1 + k/x)ˣ closing in on eᵏ")}
        tex={r`\lim_{x \to \infty} \left(1 + \frac{k}{x}\right)^{x} = e^{k}`}
        vars={[
          { id: "k", label: "k", min: -2, max: 3, step: 1, value: 1, fmt: v => dec(v, 0) },
          { id: "x", label: "x", min: 5, max: 2000, step: 1, value: 10, fmt: v => dec(v, 0) },
        ]}
        compute={compoundNumbers(t)}
        note={tx(t, "mLi_liveENote", "At x = 10 with k = 1 the value is 2.59374, short of e by 0.12. Push x up: at 100 it is 2.70481, at 1000 it is 2.71692. The approach is slow, about e·k²/(2x) short, which is why the base must really go to 1 and the exponent really to ∞ together.")} />

      <H2>{tx(t, "mLi_obliqueTitle", "Slanted asymptotes")}</H2>
      <p>
        {tx(t, "mLi_obliqueBody",
          "When the top degree is exactly one more than the bottom, the limit is ±∞, but the graph still settles along a line, a slanted (oblique) asymptote. Polynomial division finds it. Dividing x² − 8x by 2x + 1 gives the quotient x/2 − 17/4 and the remainder 17/4, so (x² − 8x)/(2x + 1) = x/2 − 17/4 + (17/4)/(2x + 1). The last part is a number over something that grows, so it goes to 0, and far out the graph runs along the line y = x/2 − 17/4.")}
      </p>

      <H2>{tx(t, "mLi_checkTitle", "Which tool? A checklist")}</H2>
      <LessonTable
        headers={[tx(t, "mLi_tSee", "you see"), tx(t, "mLi_tTool", "what to do")]}
        rows={[
          [tx(t, "mLi_k1s", "nothing undecided (∞ + ∞, c/∞, c · ∞ …)"), tx(t, "mLi_k1d", "read it off directly")],
          [tx(t, "mLi_k2s", "a polynomial"), tx(t, "mLi_k2d", "follow its leading term")],
          [tx(t, "mLi_k3s", "a ratio of polynomials (∞/∞)"), tx(t, "mLi_k3d", "divide every term by the highest power in the denominator, or compare the degrees")],
          [tx(t, "mLi_k4s", "a square root of x² + …"), tx(t, "mLi_k4d", "take out |x|; at −∞ write |x| = −x")],
          [tx(t, "mLi_k5s", "a root minus a term (∞ − ∞)"), tx(t, "mLi_k5d", "multiply by the conjugate, then divide")],
          [tx(t, "mLi_k6s", "exponentials, powers and logarithms mixed"), tx(t, "mLi_k6d", "divide by the fastest-growing term, using the ranking")],
          [tx(t, "mLi_k7s", "(1 + k/x)ˣ, the form 1^∞"), tx(t, "mLi_k7d", "it tends to eᵏ")],
        ]}
      />

      <H2>{tx(t, "mLi_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mLi_ex1", "1. lim (4x³ − x + 7) as x → −∞. A polynomial: it follows 4x³. An odd power of a large negative number is large and negative, times 4: −∞.")}</p>
      <p>{tx(t, "mLi_ex2", "2. lim (6x² − x)/(3 − 2x²) as x → ∞. Same degree. The leading term below is −2x², even though it is written last: 6/(−2) = −3.")}</p>
      <p>{tx(t, "mLi_ex3", "3. lim (x + 5)/(x³ − 1) as x → −∞. The bottom has the bigger degree: 0.")}</p>
      <p>{tx(t, "mLi_ex4", "4. lim 2x³/(x² + 1) as x → −∞. The top has the bigger degree. Leading terms: 2x³/x² = 2x, which goes to −∞ when x does.")}</p>
      <p>{tx(t, "mLi_ex5", "5. lim √(9x² + x)/(3x − 4) as x → −∞. Take out |x| = −x: −√(9 + 1/x)/(3 − 4/x) → −3/3 = −1.")}</p>
      <p>{tx(t, "mLi_ex6", "6. lim (√(x² + 4x) − x) as x → ∞. ∞ − ∞: the conjugate gives 4x/(√(x² + 4x) + x); divide by x: 4/(√(1 + 4/x) + 1) → 4/2 = 2.")}</p>
      <p>{tx(t, "mLi_ex7", "7. lim (x³ + 5ˣ)/(2 · 5ˣ − x) as x → ∞. The fastest term is 5ˣ; divide by it: (x³/5ˣ + 1)/(2 − x/5ˣ) → (0 + 1)/(2 − 0) = 1/2.")}</p>
      <p>{tx(t, "mLi_ex8", "8. lim (1 + 2/x)ˣ as x → ∞. The form 1^∞ with k = 2: e² ≈ 7.389.")}</p>
      <p>{tx(t, "mLi_ex9", "9. lim (ln x)/√x as x → ∞. A logarithm over a power: by the ranking, 0. (At x = 10⁶ it is already 13.8/1000 = 0.014.)")}</p>

      <MathPracticeFigure t={t} set="limitsInf" />

      <H2>{tx(t, "mLi_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mLi_tWrong", "Wrong"), tx(t, "mLi_tRight", "Right"), tx(t, "mLi_tWhyM", "Why")]}
        rows={[
          ["∞ − ∞ = 0", tx(t, "mLi_x1r", "rewrite: factor, or use the conjugate"), tx(t, "mLi_x1", "√(x² + 6x) − x → 3, not 0")],
          ["∞ / ∞ = 1", tx(t, "mLi_x2r", "divide by the fastest-growing term"), tx(t, "mLi_x2", "2x/x → 2, x²/x → ∞")],
          [tx(t, "mLi_x3w", "√(x²) = x when x → −∞"), tx(t, "mLi_x3r", "√(x²) = |x| = −x there"), tx(t, "mLi_x3", "a square root is never negative")],
          [tx(t, "mLi_x4w", "dividing only the top by xⁿ"), tx(t, "mLi_x4r", "divide top and bottom by the same power"), tx(t, "mLi_x4", "otherwise the fraction changes value")],
          [tx(t, "mLi_x5w", "taking the first term written as the leading one"), tx(t, "mLi_x5r", "look for the highest power"), tx(t, "mLi_x5", "in 3 − 2x² the leading term is −2x²")],
          ["1^∞ = 1", tx(t, "mLi_x6r", "(1 + k/x)ˣ → eᵏ"), tx(t, "mLi_x6", "the base and the exponent race each other")],
          [tx(t, "mLi_x7w", "2ˣ → ∞ as x → −∞"), tx(t, "mLi_x7r", "2ˣ → 0 as x → −∞"), "2⁻¹⁰ = 1/1024"],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "polynomials", title: tx(t, "mLi_rel1", "Polynomials"), why: tx(t, "mLi_rel1b", "end behaviour: why the leading term decides where the graph's two ends go.") },
        { track: "Math", id: "polynomial-division", title: tx(t, "mLi_rel2", "Polynomial Division"), why: tx(t, "mLi_rel2b", "the long division that finds a slanted asymptote.") },
        { track: "Math", id: "algebra-tricks", title: tx(t, "mLi_rel3", "Algebra Tricks I: Multiply by 1, Add 0"), why: tx(t, "mLi_rel3b", "the conjugate in full, and why multiplying by it changes nothing.") },
      ]} />

      <KeyIdeas t={t} id="mLi" items={[
        "x → ∞ means x grows past every number. Infinity is never plugged in; you watch where f(x) heads.",
        "Far out, only the fastest-growing term of each part matters.",
        "Ratio of polynomials: same degree gives the ratio of the leading coefficients, a bigger bottom gives 0, a bigger top gives ±∞.",
        "To show it, divide every term by the highest power in the denominator; every c/xᵏ goes to 0.",
        "√(x²) = |x|: at −∞ that is −x, and the sign of the answer flips.",
        "∞ − ∞, ∞/∞, 0 · ∞ and 1^∞ are undecided: rewrite before concluding (factor, conjugate, divide).",
        "ln x ≪ xᵖ ≪ aˣ: logarithms lose to powers, powers lose to exponentials; and aˣ → 0 at −∞.",
        "(1 + k/x)ˣ → eᵏ.",
      ]} />
    </Article>
  );
}

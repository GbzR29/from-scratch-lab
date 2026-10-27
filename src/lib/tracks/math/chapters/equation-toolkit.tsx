"use client";

// Algebra: the equation toolkit — moves that keep the solutions (⇔) and moves
// that only go one way (⇒) and can add fake solutions or lose real ones
// (figure); cross-multiplying after noting what the denominators forbid;
// factoring instead of dividing by the unknown; square-root equations
// (isolate, square, check); a pointer to the conjugate trick (its full section
// lives in algebra-tricks.tsx); substitution (u = x², u = 2ˣ); the toolkit at
// a glance; common mistakes; practice.

import { Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { EquationMovesFigure } from "@/components/lesson/figures/math/EquationMovesFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function EquationToolkitContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mEqt_intro",
          "The chapter on linear equations gave one rule: do the same thing to both sides. For harder equations, with fractions, square roots and powers, you need more moves, and some of them are traps. Squaring both sides can create solutions that are not real. Dividing by x can throw a real one away. This chapter collects the moves and tricks used to handle equations, says which ones are always safe, and shows how to use the risky ones without being caught.")}
      </Lead>

      <Goals t={t} id="mEqt" items={[
        "Tell a move that keeps the solutions from one that can add fake ones or lose real ones.",
        "Clear fractions by cross-multiplying, after noting which values the denominators forbid.",
        "Solve a square-root equation by isolating, squaring and checking.",
        "Spot a substitution, and factor instead of dividing by the unknown.",
      ]} />

      <H2>{tx(t, "mEqt_arrowTitle", "Two kinds of arrow")}</H2>
      <p>
        {tx(t, "mEqt_arrowBody",
          "Solving an equation is a chain of equations, each one rewritten from the one before. What matters is how two neighbours in the chain are connected. A two-way arrow, ⇔, means the two equations are true for exactly the same x: the move can be undone, so no solution is gained or lost. A one-way arrow, ⇒, means every solution of the first is a solution of the second, but not necessarily the other way round: the second equation may have extra solutions that the first does not. Some moves even point the wrong way, so that solutions of the first go missing.")}
      </p>
      <Equation label={tx(t, "mEqt_eqArrows", "A safe move and a one-way move")}
        where={[
          [r`\iff`, tx(t, "mEqt_wIff", "\"if and only if\": both equations have exactly the same solutions")],
          [r`\Longrightarrow`, tx(t, "mEqt_wImp", "\"implies\": every solution on the left is one on the right, but the right may have more")],
          [r`c \neq 0`, tx(t, "mEqt_wC", "multiplying by c can be undone by dividing by c, which needs c ≠ 0")],
          [r`A^2 = B^2`, tx(t, "mEqt_wSq", "true when A = B, but also when A = −B: the sign is forgotten")],
        ]}
        words={tx(t, "mEqt_arrowWords", "Multiplying both sides by a number that is not zero can be undone, so it keeps the solutions. Squaring both sides cannot be undone, because a number and its negative have the same square, so it can bring in extra solutions.")}>
        {r`A = B \;\iff\; c\,A = c\,B \quad (c \neq 0) \qquad\qquad A = B \;\Longrightarrow\; A^2 = B^2`}
      </Equation>
      <p>
        {tx(t, "mEqt_arrowAfter",
          "A one-way move is not forbidden. It is often the only way forward. It just means the final list of answers is a list of candidates, and each candidate must be tested in the original equation. A candidate that fails is called extraneous, or a fake solution: the moves created it, the original equation never had it. The opposite danger, a lost solution, is worse, because no check at the end can bring it back. The table lists the usual moves.")}
      </p>
      <LessonTable
        headers={[tx(t, "mEqt_hMove", "Move"), tx(t, "mEqt_hRisk", "Risk"), tx(t, "mEqt_hSafe", "How to stay safe")]}
        rows={[
          [tx(t, "mEqt_m1", "Add or subtract the same thing on both sides"), tx(t, "mEqt_m1r", "none"), tx(t, "mEqt_m1s", "always safe")],
          [tx(t, "mEqt_m2", "Multiply or divide both sides by a number"), tx(t, "mEqt_m2r", "none, unless the number is 0"), tx(t, "mEqt_m2s", "never multiply or divide by 0")],
          [tx(t, "mEqt_m3", "Multiply both sides by an expression with x, such as x − 2"), tx(t, "mEqt_m3r", "can add fake solutions where it is 0"), tx(t, "mEqt_m3s", "write down where it is 0 first, and reject those values")],
          [tx(t, "mEqt_m4", "Divide both sides by an expression with x"), tx(t, "mEqt_m4r", "can lose the solutions where it is 0"), tx(t, "mEqt_m4s", "factor it out instead, then use the zero-product rule")],
          [tx(t, "mEqt_m5", "Square both sides"), tx(t, "mEqt_m5r", "can add fake solutions (A = −B)"), tx(t, "mEqt_m5s", "check every candidate in the original, or keep the sign condition")],
          [tx(t, "mEqt_m6", "Take the square root of both sides"), tx(t, "mEqt_m6r", "can lose the negative solution"), tx(t, "mEqt_m6s", "write ±: x² = 9 gives x = ±3")],
          [tx(t, "mEqt_m7", "Take the logarithm of both sides"), tx(t, "mEqt_m7r", "none, if both sides are positive"), tx(t, "mEqt_m7s", "a log needs a positive input: check the domain")],
          [tx(t, "mEqt_m8", "Use a log rule, such as ln a + ln b = ln(ab)"), tx(t, "mEqt_m8r", "can add fake solutions (ab > 0 also when a, b < 0)"), tx(t, "mEqt_m8s", "check every candidate in the original")],
        ]}
      />

      <EquationMovesFigure t={t} />

      <H2>{tx(t, "mEqt_crossTitle", "Clearing fractions: cross-multiplying")}</H2>
      <p>
        {tx(t, "mEqt_crossBody",
          "When each side is a single fraction, a/b = c/d, you can multiply both sides by b·d. On the left the b cancels, on the right the d cancels, and what is left is a·d = b·c. Drawn on the page, each numerator is multiplied by the opposite denominator, crosswise, hence the name. The move multiplies by b·d, an expression that may contain x, so it is safe only where b and d are not zero. Write those forbidden values down before you start.")}
      </p>
      <Equation label={tx(t, "mEqt_eqCross", "Cross-multiplying")}
        where={[
          [r`a,\ c`, tx(t, "mEqt_wAc", "the numerators")],
          [r`b,\ d`, tx(t, "mEqt_wBd", "the denominators; neither may be 0, since division by 0 has no value")],
          [r`a\,d = b\,c`, tx(t, "mEqt_wAd", "both sides multiplied by b·d: each numerator times the other side's denominator")],
        ]}
        words={tx(t, "mEqt_crossWords", "Two fractions are equal exactly when each numerator times the other denominator gives the same number, as long as neither denominator is zero.")}>
        {r`\frac{a}{b} = \frac{c}{d} \;\iff\; a\,d = b\,c \qquad (b \neq 0,\ d \neq 0)`}
      </Equation>
      <Derivation t={t} label={tx(t, "mEqt_eqCrossEx", "Solving 3/x = 6/(x + 1)")}
        steps={[
          { full: true, tex: r`\frac{3}{x} = \frac{6}{x + 1} \qquad (x \neq 0,\ x \neq -1)`, why: tx(t, "mEqt_c0", "first note what the denominators forbid: x = 0 and x = −1") },
          { full: true, tex: r`3\,(x + 1) = 6\,x`, why: tx(t, "mEqt_c1", "cross-multiply: 3 times (x + 1), 6 times x") },
          { full: true, tex: r`3x + 3 = 6x`, why: tx(t, "mEqt_c2", "expand the bracket") },
          { full: true, tex: r`3 = 3x \;\Rightarrow\; x = \green{1}`, why: tx(t, "mEqt_c3", "subtract 3x from both sides, then divide by 3") },
          { full: true, tex: r`\frac{3}{1} = 3 = \frac{6}{2}\;\checkmark`, why: tx(t, "mEqt_c4", "1 is not a forbidden value, and the check works: 3/1 = 3 and 6/2 = 3") },
        ]} />
      <Callout type="warn" t={t}>
        {tx(t, "mEqt_crossWarn",
          "Cross-multiplying needs ONE fraction on each side. In x/2 + 1 = 3/x, the left side is a sum, so crosswise products mean nothing. First turn each side into a single fraction (x/2 + 1 = (x + 2)/2), or multiply every term by the common denominator 2x, as the linear-equations chapter did with numbers.")}
      </Callout>

      <H2>{tx(t, "mEqt_factorTitle", "Never divide by the unknown: factor it out")}</H2>
      <p>
        {tx(t, "mEqt_factorBody",
          "x³ = 4x looks like an invitation to divide both sides by x. Do that and you get x² = 4, so x = ±2, and the solution x = 0 is gone: 0³ = 4 · 0 is true. Dividing by x assumed x ≠ 0 without saying so. The safe route moves everything to one side and factors out what you wanted to divide by. Then the zero-product rule finishes the job: a product is zero exactly when at least one of its factors is zero.")}
      </p>
      <Derivation t={t} label={tx(t, "mEqt_eqFactor", "Solving x³ = 4x without losing a root")}
        steps={[
          { full: true, tex: r`x^3 = 4x` },
          { full: true, tex: r`x^3 - 4x = 0`, why: tx(t, "mEqt_f1", "subtract 4x from both sides, so the right side is 0") },
          { full: true, tex: r`x\,(x^2 - 4) = 0`, why: tx(t, "mEqt_f2", "factor out x, the thing we were tempted to divide by") },
          { full: true, tex: r`x\,(x - 2)(x + 2) = 0`, why: tx(t, "mEqt_f3", "x² − 4 is a difference of squares: (x − 2)(x + 2)") },
          { full: true, tex: r`x = \green{0},\quadx = \green{2},\quadx = \green{-2}`, why: tx(t, "mEqt_f4", "zero-product rule: one of the three factors must be 0, giving three solutions instead of two") },
        ]} />

      <H2>{tx(t, "mEqt_sqrtTitle", "Square roots in an equation: isolate, square, check")}</H2>
      <p>
        {tx(t, "mEqt_sqrtBody",
          "To get rid of a square root, square it: (√u)² = u. Two habits make this work. First, isolate the root, so it is alone on one side. If you square √(x + 7) + 5 as it is, (a + b)² = a² + 2ab + b² gives a middle term 10√(x + 7), and the root is still there. Second, squaring is a one-way move, so check every candidate in the original equation. A square root is never negative, so any candidate that makes the other side negative is fake.")}
      </p>
      <Derivation t={t} label={tx(t, "mEqt_eqSqrt", "Solving √(x + 7) + 5 = x")}
        steps={[
          { full: true, tex: r`\sqrt{x + 7} + 5 = x` },
          { full: true, tex: r`\sqrt{x + 7} = x - 5`, why: tx(t, "mEqt_s1", "isolate the root: subtract 5 from both sides") },
          { full: true, tex: r`x + 7 = (x - 5)^2 = x^2 - 10x + 25`, why: tx(t, "mEqt_s2", "square both sides (one-way: the list will need checking); (x − 5)² = x² − 2 · 5x + 25") },
          { full: true, tex: r`x^2 - 11x + 18 = 0`, why: tx(t, "mEqt_s3", "move everything to the right: x² − 10x − x + 25 − 7") },
          { full: true, tex: r`(x - 2)(x - 9) = 0 \;\Rightarrow\; x = 2,\quadx = 9`, why: tx(t, "mEqt_s4", "two numbers with product 18 and sum 11: 2 and 9") },
          { full: true, tex: r`x = 9:\ \sqrt{16} + 5 = 9\;\checkmark \qquad x = 2:\ \sqrt{9} + 5 = 8 \neq 2\;\red{\times}`, why: tx(t, "mEqt_s5", "check both in the original: 9 is real; 2 is fake, it solves √(x + 7) = −(x − 5) instead") },
        ]} />
      <Callout type="tip" t={t}>
        {tx(t, "mEqt_sqrtTip",
          "A faster filter before the full check: after isolating, √(x + 7) = x − 5 needs x − 5 ≥ 0, so x ≥ 5. The candidate 2 fails that at a glance. With two square roots, isolate one, square, then isolate the other and square again; check at the very end.")}
      </Callout>

      <H2>{tx(t, "mEqt_conjTitle", "Multiplying by the conjugate")}</H2>
      <p>
        {tx(t, "mEqt_conjMoved",
          "A square root in a denominator, or a difference of two roots such as √(x + 5) − √x = 1, has its own trick: multiply by the conjugate, the same two terms with the sign between them flipped, because (a + b)(a − b) = a² − b² leaves no root behind. In an equation that means multiplying both sides, so the factor must not be zero, as in the table above. The trick has its own full section, with why it works, a picture and worked examples, in the chapter Algebra Tricks I at the end of this section.")}
      </p>

      <H2>{tx(t, "mEqt_subTitle", "Substitution: find a familiar equation inside")}</H2>
      <p>
        {tx(t, "mEqt_subBody",
          "Some equations are an old friend in disguise. x⁴ − 13x² + 36 = 0 has degree 4, but x appears only as x² and (x²)². Give the repeated piece a new name, u = x², and it becomes the quadratic u² − 13u + 36 = 0. Solve that, then undo the substitution. The same trick turns 4ˣ − 6 · 2ˣ + 8 = 0 into a quadratic, because 4ˣ = (2²)ˣ = (2ˣ)². Before undoing, look at what u is allowed to be: u = x² and u = 2ˣ can never be negative, so a negative u gives no x at all.")}
      </p>
      <Derivation t={t} label={tx(t, "mEqt_eqSub", "Solving x⁴ − 13x² + 36 = 0 with u = x²")}
        steps={[
          { full: true, tex: r`x^4 - 13x^2 + 36 = 0` },
          { full: true, tex: r`u^2 - 13u + 36 = 0 \qquad (u = x^2)`, why: tx(t, "mEqt_u1", "x⁴ = (x²)² = u²") },
          { full: true, tex: r`(u - 4)(u - 9) = 0 \;\Rightarrow\; u = 4,\quadu = 9`, why: tx(t, "mEqt_u2", "two numbers with product 36 and sum 13: 4 and 9") },
          { full: true, tex: r`x^2 = 4,\quadx^2 = 9 \;\Rightarrow\; x = \green{\pm 2},\ \green{\pm 3}`, why: tx(t, "mEqt_u3", "undo u = x², with ± each time: four solutions") },
        ]} />
      <Derivation t={t} label={tx(t, "mEqt_eqSub2", "Solving 4ˣ − 6 · 2ˣ + 8 = 0 with u = 2ˣ")}
        steps={[
          { full: true, tex: r`4^x - 6\cdot 2^x + 8 = 0` },
          { full: true, tex: r`u^2 - 6u + 8 = 0 \qquad (u = 2^x > 0)`, why: tx(t, "mEqt_v1", "4ˣ = (2ˣ)² = u²; and 2ˣ is always positive") },
          { full: true, tex: r`(u - 2)(u - 4) = 0 \;\Rightarrow\; u = 2,\quadu = 4`, why: tx(t, "mEqt_v2", "product 8, sum 6: 2 and 4, both positive, so both are allowed") },
          { full: true, tex: r`2^x = 2 \Rightarrow x = \green{1}, \qquad 2^x = 4 \Rightarrow x = \green{2}`, why: tx(t, "mEqt_v3", "undo the substitution: 2¹ = 2 and 2² = 4") },
        ]} />

      <H2>{tx(t, "mEqt_kitTitle", "The toolkit at a glance")}</H2>
      <LessonTable
        headers={[tx(t, "mEqt_hSee", "When you see"), tx(t, "mEqt_hTry", "Try"), tx(t, "mEqt_hWatch", "Watch out for")]}
        rows={[
          [tx(t, "mEqt_k1", "fractions with numbers below"), tx(t, "mEqt_k1t", "multiply every term by the LCM (Linear Equations)"), tx(t, "mEqt_k1w", "multiply every term, not just the fractions")],
          [tx(t, "mEqt_k2", "one fraction on each side"), tx(t, "mEqt_k2t", "cross-multiply"), tx(t, "mEqt_k2w", "values that make a denominator 0")],
          [tx(t, "mEqt_k3", "the unknown as a common factor"), tx(t, "mEqt_k3t", "move all to one side, factor, zero-product rule"), tx(t, "mEqt_k3w", "never divide by it")],
          [tx(t, "mEqt_k4", "x² and x, no way to factor"), tx(t, "mEqt_k4t", "complete the square or the quadratic formula (Quadratics)"), tx(t, "mEqt_k4w", "add the same number to both sides")],
          [tx(t, "mEqt_k5", "a square root"), tx(t, "mEqt_k5t", "isolate it, then square"), tx(t, "mEqt_k5w", "fake solutions: check them all")],
          [tx(t, "mEqt_k6", "a root in a denominator or a difference of roots"), tx(t, "mEqt_k6t", "multiply by the conjugate"), tx(t, "mEqt_k6w", "multiply top and bottom, or both sides")],
          [tx(t, "mEqt_k7", "a square on each side, x² = 9"), tx(t, "mEqt_k7t", "square root with ±, or factor"), tx(t, "mEqt_k7w", "the negative solution")],
          [tx(t, "mEqt_k8", "the same block repeated (x², 2ˣ, sin x)"), tx(t, "mEqt_k8t", "substitute u for it"), tx(t, "mEqt_k8w", "values u cannot take")],
          [tx(t, "mEqt_k9", "the unknown in an exponent"), tx(t, "mEqt_k9t", "logarithm of both sides (Exponents & Logarithms)"), tx(t, "mEqt_k9w", "a log needs a positive input")],
        ]}
      />

      <H2>{tx(t, "mEqt_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mEqt_tWrong", "Wrong"), tx(t, "mEqt_tRight", "Right"), tx(t, "mEqt_tWhy", "Why")]}
        rows={[
          ["√(a + b) = √a + √b", tx(t, "mEqt_x1r", "leave it as √(a + b)"), tx(t, "mEqt_x1", "√(9 + 16) = √25 = 5, but √9 + √16 = 7")],
          ["(x + 3)² = x² + 9", "x² + 6x + 9", tx(t, "mEqt_x2", "the cross term 2 · 3x is missing")],
          ["1/(√a + √b) = 1/√a + 1/√b", tx(t, "mEqt_x3r", "multiply by the conjugate"), tx(t, "mEqt_x3", "a fraction does not split over a sum in its denominator: 1/(1 + 1) = 1/2, not 2")],
          ["x² = 5x → x = 5", tx(t, "mEqt_x4r", "x(x − 5) = 0: x = 0 or 5"), tx(t, "mEqt_x4", "dividing by x lost x = 0")],
          ["x² = 16 → x = 4", "x = ±4", tx(t, "mEqt_x5", "(−4)² = 16 as well")],
          [tx(t, "mEqt_x6w", "squaring and not checking"), tx(t, "mEqt_x6r", "test every candidate in the original"), tx(t, "mEqt_x6", "squaring can add fake solutions")],
          ["x/2 + 1 = 3/x → x · x = 2 · 3", tx(t, "mEqt_x7r", "multiply every term by 2x"), tx(t, "mEqt_x7", "cross-multiplying needs a single fraction on each side")],
        ]}
      />

      <MathPracticeFigure t={t} set="toolkit" />

      <Related t={t} links={[
        { track: "Math", id: "algebra-tricks", title: tx(t, "mEqt_rel1", "Algebra Tricks I: Multiply by 1, Add 0"), why: tx(t, "mEqt_rel1b", "multiplying by the conjugate in full: why it works, rationalising, differences of roots, cube roots.") },
        { track: "Math", id: "algebra-shortcuts", title: tx(t, "mEqt_rel2", "Algebra Tricks II: Roots, Coefficients & Symmetry"), why: tx(t, "mEqt_rel2b", "shortcuts for equations: sum and product of the roots, symmetric systems, x + 1/x.") },
      ]} />

      <KeyIdeas t={t} id="mEqt" items={[
        "A move that can be undone (⇔) keeps the solutions; a one-way move (⇒) turns the answers into candidates that must be checked.",
        "Multiplying by an expression that can be 0, squaring, and some log rules can add fake solutions: check every candidate in the original.",
        "Dividing by an expression that can be 0, and taking a square root without ±, can lose real solutions: factor instead, and write ±.",
        "a/b = c/d ⇔ ad = bc, once b ≠ 0 and d ≠ 0 are written down; it needs one fraction on each side.",
        "For a square root: isolate it, square, then check.",
        "Substitution, u = x² or u = 2ˣ, turns a disguised equation into a familiar one; mind the values u cannot take.",
      ]} />
    </Article>
  );
}

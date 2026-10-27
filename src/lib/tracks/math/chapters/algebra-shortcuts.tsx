"use client";

// Algebra tricks II: shortcuts that avoid the long road. The sum and the
// product of the roots instead of the roots (figure: symmetric expressions
// from s and p, real or complex roots); symmetric systems in s = x + y and
// p = xy; t = x + 1/x and palindromic equations; plugging in 1, −1 or 0 for
// coefficient sums; testing identities with easy numbers (and when that is a
// proof); comparing huge powers; pointers to Gauss pairing and telescoping;
// which trick when; mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { SumProductFigure } from "@/components/lesson/figures/math/SumProductFigure";
import { TrickPickFigure } from "@/components/lesson/figures/math/TrickPickFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function AlgebraShortcutsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mTr2_intro",
          "Many problems ask for less than they seem to. \"Find r² + q², where r and q are the roots\" does not need the roots. \"Find the sum of the coefficients of (2x − 1)⁵\" does not need the expansion. The tricks in this chapter all notice what the question really needs and go straight for it: the sum and the product of the roots, a symmetry, one well-chosen value of x. Each one is described as in the previous chapter: what it is, why it works, when to use it and the trap.")}
      </Lead>

      <Goals t={t} id="mTr2" items={[
        "Find symmetric expressions of the roots, such as r² + q² or 1/r + 1/q, from the coefficients alone.",
        "Solve a symmetric system by changing to s = x + y and p = xy.",
        "Use t = x + 1/x to get x² + 1/x² and to solve an equation whose coefficients read the same both ways.",
        "Get coefficient sums and remainders by plugging in x = 1, −1 or 0.",
        "Test an identity with numbers, and know when a few values are a proof and when they are not.",
      ]} />

      <H2>{tx(t, "mTr2_vietaTitle", "Trick 1: the sum and the product instead of the roots")}</H2>
      <H3>{tx(t, "mTr2_vWhatTitle", "What it is, and why it works")}</H3>
      <p>
        {tx(t, "mTr2_vWhatBody",
          "If r and q are the roots of x² − s·x + p = 0, then r + q = s and r·q = p. You can read both straight off the equation. The reason: a quadratic with roots r and q is (x − r)(x − q), and multiplying it out gives x² − (r + q)x + rq. Comparing with x² − s·x + p, the middle coefficient is minus the sum and the last one is the product. For a·x² + b·x + c = 0, divide by a first: the sum is −b/a and the product is c/a. The Quadratics chapter proves this in full; here the point is what it lets you skip.")}
      </p>
      <Equation label={tx(t, "mTr2_eqVieta", "Sum and product of the roots")}
        where={[
          [r`r,\ q`, tx(t, "mTr2_wRq", "the two roots of a·x² + b·x + c = 0 (a ≠ 0), real or complex")],
          [r`s`, tx(t, "mTr2_wS", "their sum: minus the middle coefficient, divided by a")],
          [r`p`, tx(t, "mTr2_wP", "their product: the constant term divided by a")],
        ]}
        words={tx(t, "mTr2_vietaWords", "The roots add up to minus b over a and multiply to c over a.")}>
        {r`s = r + q = -\frac{b}{a} \qquad\qquad p = r\,q = \frac{c}{a}`}
      </Equation>
      <H3>{tx(t, "mTr2_vWhenTitle", "When to use it")}</H3>
      <p>
        {tx(t, "mTr2_vWhenBody",
          "The sign is a question about the roots that does not change if you swap them. r² + q² is the same as q² + r²; so are 1/r + 1/q, (r − q)² and r³ + q³. Such an expression is called symmetric, and every symmetric expression in r and q can be written using s and p alone. So you never need the roots, which may be ugly fractions with square roots, or not even real.")}
      </p>
      <LessonTable
        headers={[tx(t, "mTr2_hWant", "You want"), tx(t, "mTr2_hFrom", "From s and p"), tx(t, "mTr2_hHow", "How")]}
        rows={[
          ["r² + q²", "s² − 2p", tx(t, "mTr2_h1", "(r + q)² = r² + 2rq + q², take away 2rq")],
          ["(r − q)²", "s² − 4p", tx(t, "mTr2_h2", "(r − q)² = r² + q² − 2rq; this is the discriminant (divided by a²)")],
          ["1/r + 1/q", "s / p", tx(t, "mTr2_h3", "common denominator: (q + r)/(rq)")],
          ["r³ + q³", "s³ − 3ps", tx(t, "mTr2_h4", "(r + q)³ = r³ + q³ + 3rq(r + q)")],
          ["r²q + rq²", "ps", tx(t, "mTr2_h5", "take rq out: rq(r + q)")],
        ]}
      />
      <Derivation t={t} label={tx(t, "mTr2_eqComplex", "r² + q² for x² − 3x + 5 = 0, whose roots are not real")}
        steps={[
          { full: true, tex: r`s = 3,\qquad p = 5`, why: tx(t, "mTr2_x1", "a = 1, b = −3, c = 5: s = −(−3)/1 and p = 5/1") },
          { full: true, tex: r`r^2 + q^2 = s^2 - 2p = 9 - 10 = \green{-1}`, why: tx(t, "mTr2_x2", "the formula from the table; done, without the roots") },
          { full: true, tex: r`r, q = \frac{3 \pm i\sqrt{11}}{2}`, why: tx(t, "mTr2_x3", "the roots, only to check: the discriminant 9 − 20 = −11 is negative, so they are complex") },
          { full: true, tex: r`r^2 + q^2 = \frac{(-2 + 6i\sqrt{11}) + (-2 - 6i\sqrt{11})}{4} = -1\;\checkmark`, why: tx(t, "mTr2_x4", "each square is (9 − 11 ± 6i√11)/4; the imaginary parts cancel") },
        ]} />
      <SumProductFigure t={t} />
      <p>
        {tx(t, "mTr2_otherBody",
          "Two more uses. If you know one root, the product gives the other at once: 2x² − 7x + 3 = 0 has the root 3, and the product of the roots is 3/2, so the other root is (3/2)/3 = 1/2. And to build an equation with given roots, write x² − (sum)x + (product) = 0: the roots 2 and −5 come from x² + 3x − 10 = 0.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "mTr2_vTrap",
          "The trap is the sign of the sum. It is MINUS b over a: in x² − 5x + 6 = 0 the roots add up to +5, not −5. And when a is not 1, divide both b and c by it.")}
      </Callout>

      <H2>{tx(t, "mTr2_symTitle", "Trick 2: symmetric systems, in s and p")}</H2>
      <p>
        {tx(t, "mTr2_symBody",
          "x + y = 5 and x² + y² = 13 is a system that does not change if you swap x and y. That symmetry is the sign. Change the unknowns to s = x + y and p = xy: the system becomes simple, and at the end x and y are the two roots of t² − s·t + p = 0, by trick 1. Why does this always work? Because any expression that does not change when x and y swap can be written using s and p; this fact is called the fundamental theorem of symmetric polynomials.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr2_eqSym", "Solving x + y = 5, x² + y² = 13")}
        steps={[
          { full: true, tex: r`s = x + y = 5,\qquad x^2 + y^2 = s^2 - 2p = 13`, why: tx(t, "mTr2_y1", "write the second equation with s and p, using the first row of the table") },
          { full: true, tex: r`25 - 2p = 13 \;\Rightarrow\; p = 6`, why: tx(t, "mTr2_y2", "s = 5, so s² = 25; solve for p") },
          { full: true, tex: r`t^2 - 5t + 6 = 0 \;\Rightarrow\; t = 2,\ t = 3`, why: tx(t, "mTr2_y3", "x and y have sum 5 and product 6, so they are the roots of this quadratic") },
          { full: true, tex: r`(x, y) = \green{(2, 3)},\quad (x, y) = \green{(3, 2)}`, why: tx(t, "mTr2_y4", "either one can be x; check: 2 + 3 = 5 and 4 + 9 = 13") },
        ]} />

      <H2>{tx(t, "mTr2_recTitle", "Trick 3: t = x + 1/x")}</H2>
      <p>
        {tx(t, "mTr2_recBody",
          "When x and 1/x appear together, call their sum t. Squaring t gives x² + 2 + 1/x², because the cross term is 2 · x · (1/x) = 2: the x cancels out of it. So x² + 1/x² = t² − 2, without ever finding x. Cubing in the same way gives x³ + 1/x³ = t³ − 3t.")}
      </p>
      <Equation label={tx(t, "mTr2_eqRec", "Powers of x + 1/x")}
        where={[
          [r`t`, tx(t, "mTr2_wT", "the sum x + 1/x (x ≠ 0)")],
          [r`2`, tx(t, "mTr2_wTwo", "the cross term 2 · x · (1/x); no x is left in it")],
          [r`3t`, tx(t, "mTr2_wThree", "from (x + 1/x)³ = x³ + 3x + 3/x + 1/x³ = x³ + 1/x³ + 3t")],
        ]}
        words={tx(t, "mTr2_recWords", "If t is x plus one over x, then x squared plus one over x squared is t squared minus 2, and x cubed plus one over x cubed is t cubed minus 3t.")}>
        {r`x^2 + \frac{1}{x^2} = t^2 - 2 \qquad\qquad x^3 + \frac{1}{x^3} = t^3 - 3t`}
      </Equation>
      <p>
        {tx(t, "mTr2_palBody",
          "The same t solves equations whose coefficients read the same from both ends, called palindromic: x⁴ + x³ − 4x² + x + 1 = 0 has coefficients 1, 1, −4, 1, 1. That is the sign. Divide by x², which is safe here because x = 0 is not a solution (the constant term is 1, not 0), so no solution is lost. The terms pair up as x² + 1/x² and x + 1/x, and a degree-4 equation becomes a quadratic in t.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr2_eqPal", "Solving x⁴ + x³ − 4x² + x + 1 = 0")}
        steps={[
          { full: true, tex: r`x^2 + x - 4 + \frac{1}{x} + \frac{1}{x^2} = 0`, why: tx(t, "mTr2_p1", "divide every term by x² (x = 0 is not a root)") },
          { full: true, tex: r`\Big(x^2 + \frac{1}{x^2}\Big) + \Big(x + \frac{1}{x}\Big) - 4 = 0`, why: tx(t, "mTr2_p2", "pair the terms that match") },
          { full: true, tex: r`(t^2 - 2) + t - 4 = 0 \;\Rightarrow\; t^2 + t - 6 = 0 \;\Rightarrow\; t = 2,\ t = -3`, why: tx(t, "mTr2_p3", "with t = x + 1/x; two numbers with product −6 and sum −1: 2 and −3") },
          { full: true, tex: r`x + \frac{1}{x} = 2 \;\Rightarrow\; x^2 - 2x + 1 = 0 \;\Rightarrow\; x = \green{1}`, why: tx(t, "mTr2_p4", "multiply by x: (x − 1)² = 0, a double root") },
          { full: true, tex: r`x + \frac{1}{x} = -3 \;\Rightarrow\; x^2 + 3x + 1 = 0 \;\Rightarrow\; x = \green{\frac{-3 \pm \sqrt{5}}{2}}`, why: tx(t, "mTr2_p5", "the quadratic formula: 9 − 4 = 5 under the root") },
          { full: true, tex: r`x = 1:\quad 1 + 1 - 4 + 1 + 1 = 0\;\checkmark`, why: tx(t, "mTr2_p6", "check the easy one in the original") },
        ]} />

      <H2>{tx(t, "mTr2_specTitle", "Trick 4: plug in x = 1, −1 or 0")}</H2>
      <p>
        {tx(t, "mTr2_specBody",
          "Write a polynomial as P(x) = c₀ + c₁x + c₂x² + … + cₙxⁿ, where c₀, c₁, … are its coefficients. Every power of 1 is 1, so P(1) is the sum of all the coefficients. The powers of −1 alternate between +1 and −1, so P(−1) is the alternating sum c₀ − c₁ + c₂ − …. Every power of 0 above the zeroth is 0, so P(0) = c₀, the constant term. The sign to use it: a question about the coefficients of a big expansion, not the expansion itself.")}
      </p>
      <Equation label={tx(t, "mTr2_eqSpec", "Coefficient sums from three values")}
        where={[
          [r`c_k`, tx(t, "mTr2_wCk", "the coefficient of xᵏ")],
          [r`P(1)`, tx(t, "mTr2_wP1", "the value at x = 1: all coefficients added")],
          [r`P(-1)`, tx(t, "mTr2_wPm1", "the value at x = −1: even powers added, odd powers subtracted")],
          [r`\frac{P(1) + P(-1)}{2}`, tx(t, "mTr2_wEven", "the odd powers cancel in the sum, so half of it is the sum of the even-power coefficients")],
        ]}
        words={tx(t, "mTr2_specWords", "The value at 1 adds every coefficient, the value at −1 alternates their signs, and the value at 0 is the constant term.")}>
        {r`P(1) = \sum c_k \qquad P(-1) = \sum (-1)^k c_k \qquad P(0) = c_0 \qquad c_0 + c_2 + c_4 + \dots = \frac{P(1) + P(-1)}{2}`}
      </Equation>
      <Derivation t={t} label={tx(t, "mTr2_eqSpecEx", "Coefficients of (2x − 1)⁵ without expanding")}
        steps={[
          { full: true, tex: r`P(1) = (2 - 1)^5 = \green{1}`, why: tx(t, "mTr2_s1", "the sum of all six coefficients") },
          { full: true, tex: r`P(-1) = (-2 - 1)^5 = (-3)^5 = -243`, why: tx(t, "mTr2_s2", "the alternating sum") },
          { full: true, tex: r`c_0 + c_2 + c_4 = \frac{1 + (-243)}{2} = \green{-121}`, why: tx(t, "mTr2_s3", "the even-power coefficients") },
          { full: true, tex: r`32x^5 - 80x^4 + 80x^3 - 40x^2 + 10x - 1`, why: tx(t, "mTr2_s4", "the full expansion, only to check: 32 − 80 + 80 − 40 + 10 − 1 = 1, and −80 − 40 − 1 = −121") },
        ]} />
      <p>
        {tx(t, "mTr2_specMore",
          "The same idea appears elsewhere in the track. The remainder of P(x) divided by x − 1 is P(1), the remainder theorem of the polynomial-division chapter. And (1 + x)ⁿ at x = 1 says that the binomial coefficients C(n, 0) + C(n, 1) + … + C(n, n) add up to 2ⁿ.")}
      </p>

      <H2>{tx(t, "mTr2_checkTitle", "Trick 5: test with easy numbers")}</H2>
      <p>
        {tx(t, "mTr2_checkBody",
          "Before trusting an identity or an answer, put numbers in. One value where the two sides differ is enough to show the identity is false: (a + b)² = a² + b² fails at a = b = 1, since 4 ≠ 2. Agreement at a few values usually only makes it likely. But for polynomials it can be a proof. The difference of the two sides, D(x), is again a polynomial. A polynomial of degree at most n that is not zero has at most n roots, since each root gives a factor (the factor theorem). So if both sides have degree at most n and agree at n + 1 different values, D has n + 1 roots, D must be the zero polynomial, and the identity holds for every x.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr2_eqCheck", "Proving (x + 1)³ = x³ + 3x² + 3x + 1 with four numbers")}
        steps={[
          { full: true, tex: r`x = 0:\ 1 = 1 \qquad x = 1:\ 8 = 8`, why: tx(t, "mTr2_k1", "left: (x + 1)³; right: x³ + 3x² + 3x + 1") },
          { full: true, tex: r`x = 2:\ 27 = 8 + 12 + 6 + 1 \qquad x = 3:\ 64 = 27 + 27 + 9 + 1`, why: tx(t, "mTr2_k2", "both sides give 27, then 64") },
          { full: true, tex: r`\deg D \leq 3,\quad D(0) = D(1) = D(2) = D(3) = 0 \;\Rightarrow\; \green{D \equiv 0}`, why: tx(t, "mTr2_k3", "D(x) is the left side minus the right side: degree at most 3 and four roots, so it is the zero polynomial and the two sides are the same") },
        ]} />
      <Callout type="warn" t={t}>
        {tx(t, "mTr2_checkTrap",
          "Two traps. First, 0 and 1 are too kind: x² = x is true at both, and so are many wrong formulas, so also try a value such as 2 or 3. Second, the n + 1 rule is only for polynomials: sin(πx) is 0 at every whole number, yet it is not the zero function.")}
      </Callout>

      <H2>{tx(t, "mTr2_powTitle", "Trick 6: comparing huge powers")}</H2>
      <p>
        {tx(t, "mTr2_powBody",
          "Which is bigger, 2³⁰⁰ or 3²⁰⁰? Neither fits on a calculator. Make the exponents equal: 300 and 200 share the factor 100, so 2³⁰⁰ = (2³)¹⁰⁰ = 8¹⁰⁰ and 3²⁰⁰ = (3²)¹⁰⁰ = 9¹⁰⁰. For positive numbers, raising to the same positive power keeps the order, and 8 < 9, so 3²⁰⁰ is bigger. When the exponents share no useful factor, take logarithms: the logarithm also keeps the order, and it turns a power into a product, log(aⁿ) = n · log a.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr2_eqPow", "2¹⁰⁰ against 3⁶³ with logarithms")}
        steps={[
          { full: true, tex: r`\log_{10} 2^{100} = 100 \cdot 0.30103 = 30.103`, why: tx(t, "mTr2_w1", "log of a power: the exponent comes down as a factor; log₁₀ 2 ≈ 0.30103") },
          { full: true, tex: r`\log_{10} 3^{63} = 63 \cdot 0.47712 = 30.059`, why: tx(t, "mTr2_w2", "log₁₀ 3 ≈ 0.47712") },
          { full: true, tex: r`30.103 > 30.059 \;\Rightarrow\; \green{2^{100} > 3^{63}}`, why: tx(t, "mTr2_w3", "the logarithm keeps the order, so the larger log belongs to the larger number; both are about 10³⁰") },
        ]} />

      <H2>{tx(t, "mTr2_moreTitle", "Two more, taught in their own chapters")}</H2>
      <LessonTable
        headers={[tx(t, "mTr2_hTrick", "Trick"), tx(t, "mTr2_hIdea", "The idea in one line"), tx(t, "mTr2_hChapter", "Chapter")]}
        rows={[
          [tx(t, "mTr2_m1", "Gauss pairing"), tx(t, "mTr2_m1i", "1 + 2 + … + 100: pair the first with the last, 1 + 100, 2 + 99, …: 50 pairs of 101 = 5050"), tx(t, "mTr2_m1c", "Sequences & Series")],
          [tx(t, "mTr2_m2", "Telescoping"), tx(t, "mTr2_m2i", "1/(k(k + 1)) = 1/k − 1/(k + 1): in the sum every middle term cancels its neighbour, leaving 1 − 1/(n + 1)"), tx(t, "mTr2_m2c", "Summation & Its Rules")],
          [tx(t, "mTr2_m3", "Substitution"), tx(t, "mTr2_m3i", "x⁴ − 13x² + 36 = 0: name the repeated block, u = x², and it is a quadratic"), tx(t, "mTr2_m3c", "Equation Toolkit")],
        ]}
      />

      <H2>{tx(t, "mTr2_whichTitle", "Which trick, when")}</H2>
      <LessonTable
        headers={[tx(t, "mTr2_hSee", "When you see"), tx(t, "mTr2_hTry", "Try"), tx(t, "mTr2_hWhyW", "Why it works")]}
        rows={[
          [tx(t, "mTr2_q1", "an expression of the roots that does not change if they swap"), tx(t, "mTr2_q1t", "sum and product"), tx(t, "mTr2_q1w", "(x − r)(x − q) = x² − (r + q)x + rq")],
          [tx(t, "mTr2_q2", "a system unchanged when x and y swap"), tx(t, "mTr2_q2t", "s = x + y, p = xy"), tx(t, "mTr2_q2w", "symmetric expressions are expressions in s and p")],
          [tx(t, "mTr2_q3", "x and 1/x together, or coefficients that read the same both ways"), tx(t, "mTr2_q3t", "t = x + 1/x"), tx(t, "mTr2_q3w", "x · (1/x) = 1, so the cross terms are numbers")],
          [tx(t, "mTr2_q4", "a question about the coefficients, not the expansion"), tx(t, "mTr2_q4t", "plug in 1, −1 or 0"), tx(t, "mTr2_q4w", "1ᵏ = 1, (−1)ᵏ = ±1, 0ᵏ = 0")],
          [tx(t, "mTr2_q5", "an identity or an answer to trust"), tx(t, "mTr2_q5t", "test with numbers such as 2 and 3"), tx(t, "mTr2_q5w", "one failure disproves; for degree n, n + 1 agreements prove")],
          [tx(t, "mTr2_q6", "two huge powers to compare"), tx(t, "mTr2_q6t", "a common exponent, or logarithms"), tx(t, "mTr2_q6w", "both keep the order of positive numbers")],
        ]}
      />

      <TrickPickFigure t={t} bank="algebra2" />

      <H2>{tx(t, "mTr2_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mTr2_tWrong", "Wrong"), tx(t, "mTr2_tRight", "Right"), tx(t, "mTr2_tWhy", "Why")]}
        rows={[
          [tx(t, "mTr2_e1w", "x² − 5x + 6: the roots add up to −5"), "+5", tx(t, "mTr2_e1", "the sum is −b/a, and here b = −5")],
          [tx(t, "mTr2_e2w", "2x² − 6x + 4: the roots multiply to 4"), "4/2 = 2", tx(t, "mTr2_e2", "divide by the leading coefficient a")],
          ["r² + q² = s²", "s² − 2p", tx(t, "mTr2_e3", "(r + q)² also contains the cross term 2rq")],
          ["x² + 1/x² = t²", "t² − 2", tx(t, "mTr2_e4", "the cross term 2 · x · (1/x) is 2, not 0")],
          [tx(t, "mTr2_e5w", "checking only with x = 0 and x = 1"), tx(t, "mTr2_e5r", "also try 2 or 3"), tx(t, "mTr2_e5", "x² = x holds at 0 and 1 but nowhere else")],
          [tx(t, "mTr2_e6w", "dividing a palindromic equation by x² without a thought"), tx(t, "mTr2_e6r", "first check that x = 0 is not a root"), tx(t, "mTr2_e6", "dividing by an expression that can be 0 can lose a solution")],
        ]}
      />

      <MathPracticeFigure t={t} set="algebraShortcuts" />

      <Related t={t} links={[
        { track: "Math", id: "quadratics", title: tx(t, "mTr2_rel1", "Quadratics"), why: tx(t, "mTr2_rel1b", "where the sum and the product of the roots are proved, and the quadratic formula.") },
        { track: "Math", id: "polynomial-division", title: tx(t, "mTr2_rel2", "Polynomial Division & Ruffini's Rule"), why: tx(t, "mTr2_rel2b", "the remainder theorem, and Girard's relations for roots of higher degree.") },
        { track: "Math", id: "binomial", title: tx(t, "mTr2_rel3", "The Binomial Theorem"), why: tx(t, "mTr2_rel3b", "the expansion of (a + b)ⁿ whose coefficient sums trick 4 reads off.") },
        { track: "Math", id: "algebra-tricks", title: tx(t, "mTr2_rel4", "Algebra Tricks I"), why: tx(t, "mTr2_rel4b", "multiplying by 1 and adding 0: the conjugate, completing the square, splitting fractions.") },
      ]} />

      <KeyIdeas t={t} id="mTr2" items={[
        "The roots of a·x² + b·x + c add up to −b/a and multiply to c/a; any expression that does not change when they swap can be written with these two numbers.",
        "r² + q² = s² − 2p, (r − q)² = s² − 4p, 1/r + 1/q = s/p, r³ + q³ = s³ − 3ps; they hold for complex roots too.",
        "A system unchanged when x and y swap becomes simple in s = x + y and p = xy; at the end x and y are the roots of t² − st + p = 0.",
        "With t = x + 1/x: x² + 1/x² = t² − 2. Equations whose coefficients read the same both ways become quadratics in t, after dividing by x².",
        "P(1) is the sum of the coefficients, P(−1) the alternating sum and P(0) the constant term.",
        "One counterexample disproves an identity. For polynomials of degree at most n, agreement at n + 1 values proves it.",
        "Compare huge powers by making the exponents equal, or by comparing their logarithms.",
      ]} />
    </Article>
  );
}

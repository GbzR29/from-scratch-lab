"use client";

// Algebra tricks I: the two moves that change a value's shape but not the
// value — multiplying by 1 and adding 0. How to read a trick (what, why, when,
// trap); multiplying by the conjugate in depth (what it is, why not just
// square, the area picture (figure), rationalising, a difference of roots,
// nearly equal roots, cube roots, traps, where else it appears); other
// disguises of 1 (fractions inside fractions, unit conversion); adding 0
// (completing the square, splitting a fraction, x⁴ + 4); the notable products
// read backwards for mental arithmetic; which trick when; mistakes; practice.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ConjugateFigure } from "@/components/lesson/figures/math/ConjugateFigure";
import { TrickPickFigure } from "@/components/lesson/figures/math/TrickPickFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

export function AlgebraTricksContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mTr1_intro",
          "A trick in algebra is not magic and not a rule to memorise. Almost every one of them is one of two harmless moves: multiply by 1, or add 0. Neither changes the value of anything, so both are allowed anywhere, at any time. What they change is the shape, and the right shape makes a root disappear, a fraction split, or a hard product easy to do in your head. This chapter takes the most useful tricks of that kind one by one, starting with multiplying by the conjugate, and for each one says what it is, why it works, when to reach for it and where it can go wrong.")}
      </Lead>

      <Goals t={t} id="mTr1" items={[
        "Explain why multiplying by 1 or adding 0 is always allowed, and what it is good for.",
        "Multiply by the conjugate to remove square roots, and say why squaring would not do the same job.",
        "Rationalise a denominator with one root, with a sum or difference of roots, and with a cube root.",
        "Add and subtract the same term to complete a square, split a fraction or factor x⁴ + 4.",
        "Use the notable products backwards to multiply and square numbers in your head.",
      ]} />

      <H2>{tx(t, "mTr1_readTitle", "How to read a trick")}</H2>
      <p>
        {tx(t, "mTr1_readBody",
          "Every trick in this chapter, and in the other tricks chapters of the track, is described in the same four parts. What it is: the move, in one line. Why it works: a short proof, so you can rebuild the trick if you forget it, and trust it. When to use it: the sign in the problem that tells you this trick will help, because knowing a trick is useless if you never notice the moment for it. The trap: the one way it usually goes wrong.")}
      </p>
      <LessonTable
        headers={[tx(t, "mTr1_hPart", "Part"), tx(t, "mTr1_hQuestion", "The question it answers")]}
        rows={[
          [tx(t, "mTr1_p1", "What it is"), tx(t, "mTr1_p1q", "What exactly do I write?")],
          [tx(t, "mTr1_p2", "Why it works"), tx(t, "mTr1_p2q", "Why is the result equal to what I started with?")],
          [tx(t, "mTr1_p3", "When to use it"), tx(t, "mTr1_p3q", "What in the problem tells me to try this?")],
          [tx(t, "mTr1_p4", "The trap"), tx(t, "mTr1_p4q", "How does it usually go wrong?")],
        ]}
      />

      <H2>{tx(t, "mTr1_twoTitle", "The two moves that change nothing")}</H2>
      <p>
        {tx(t, "mTr1_twoBody",
          "1 is the number that leaves everything alone under multiplication, and 0 is the one that leaves everything alone under addition. So you may multiply any expression by 1 and add 0 to it, and it stays the same expression. The point is to write the 1 and the 0 in a useful disguise: 1 as c/c for some well-chosen c that is not zero, and 0 as c − c. This is different from the rule for equations, \"do the same to both sides\". Here nothing is done to the other side, because nothing has changed. That is why these moves also work on a single expression that is not part of any equation.")}
      </p>
      <Equation label={tx(t, "mTr1_eqTwo", "Multiplying by 1 and adding 0")}
        where={[
          [r`E`, tx(t, "mTr1_wE", "any expression")],
          [r`\frac{c}{c}`, tx(t, "mTr1_wCc", "the number 1 in disguise; c can be any expression that is not zero, so the division is allowed")],
          [r`c - c`, tx(t, "mTr1_wCmc", "the number 0 in disguise; here c can be anything at all")],
        ]}
        words={tx(t, "mTr1_twoWords", "An expression times c over c is the same expression, as long as c is not zero. An expression plus c minus c is the same expression, for any c.")}>
        {r`E = E \cdot \frac{c}{c} \quad (c \neq 0) \qquad\qquad E = E + c - c`}
      </Equation>

      <H2>{tx(t, "mTr1_conjTitle", "Trick 1: multiplying by the conjugate")}</H2>
      <H3>{tx(t, "mTr1_whatTitle", "What it is")}</H3>
      <p>
        {tx(t, "mTr1_whatBody",
          "The conjugate of a sum of two terms, a + b, is the same two terms with the sign between them flipped, a − b. The conjugate of a − b is a + b. The terms themselves are not changed, only the sign that joins them. The trick is to multiply by the conjugate when a square root is in the way, because the product of a pair of conjugates has no square root left in it. In a fraction, you multiply the top and the bottom by it, so you are multiplying by 1.")}
      </p>
      <LessonTable
        headers={[tx(t, "mTr1_hExpr", "Expression"), tx(t, "mTr1_hConj", "Its conjugate"), tx(t, "mTr1_hProd", "The product")]}
        rows={[
          ["3 − √2", "3 + √2", "9 − 2 = 7"],
          ["√x + 1", "√x − 1", "x − 1"],
          ["√5 + √3", "√5 − √3", "5 − 3 = 2"],
          ["2√7 − 5", "2√7 + 5", "28 − 25 = 3"],
          ["a + bi", "a − bi", tx(t, "mTr1_cplx", "a² + b² (complex numbers, since i² = −1)")],
        ]}
      />
      <H3>{tx(t, "mTr1_whyTitle", "Why it works")}</H3>
      <p>
        {tx(t, "mTr1_whyBody",
          "Multiply out (a + b)(a − b) term by term. You get a² − ab + ab − b². The two cross terms, −ab and +ab, are opposites and cancel, leaving a² − b², the difference of squares. Now let one of the terms be a square root. The root only appears in the cross terms, and they are gone. What is left are the squares, and squaring a square root removes it: (√2)² = 2.")}
      </p>
      <Equation label={tx(t, "mTr1_eqConj", "A sum times its conjugate")}
        where={[
          [r`a + b`, tx(t, "mTr1_wAb", "a sum of two terms, at least one with a square root")],
          [r`a - b`, tx(t, "mTr1_wAmb", "its conjugate: the same terms, the sign between them flipped")],
          [r`-ab + ab`, tx(t, "mTr1_wCross", "the cross terms: opposite, so they cancel")],
          [r`a^2 - b^2`, tx(t, "mTr1_wA2", "what is left: only squares, and a squared root is no longer a root")],
        ]}
        words={tx(t, "mTr1_conjWords", "A sum times the same terms with the sign flipped gives the first term squared minus the second term squared. The terms where the root sat cancel, and squaring removes the root from the rest.")}>
        {r`(a + b)(a - b) = a^2 \underbrace{- ab + ab}_{0} - b^2 = a^2 - b^2`}
      </Equation>
      <p>
        {tx(t, "mTr1_whyNotBody",
          "Why not simply square the expression? Because the square of a sum keeps its cross term: (a + b)² = a² + 2ab + b². The cross term 2ab still holds the root. Only the conjugate makes the two cross terms opposite instead of equal. The comparison below uses 3 + √2.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqWhyNot", "Squaring against multiplying by the conjugate")}
        steps={[
          { full: true, tex: r`(3 + \sqrt{2})^2 = 9 + 2\cdot 3\sqrt{2} + 2 = 11 + \red{6\sqrt{2}}`, why: tx(t, "mTr1_wn1", "squared: the cross terms are equal, they add up to 6√2, and the root survives") },
          { full: true, tex: r`(3 + \sqrt{2})(3 - \sqrt{2}) = 9 - 3\sqrt{2} + 3\sqrt{2} - 2 = \green{7}`, why: tx(t, "mTr1_wn2", "times the conjugate: the cross terms are opposite, they cancel, and the result is a plain whole number") },
        ]} />
      <ConjugateFigure t={t} />
      <H3>{tx(t, "mTr1_whenTitle", "When to use it")}</H3>
      <LessonTable
        headers={[tx(t, "mTr1_hSign", "The sign in the problem"), tx(t, "mTr1_hDo", "What to multiply by")]}
        rows={[
          [tx(t, "mTr1_s1", "a sum or difference with a root in a denominator, 1/(3 − √2)"), tx(t, "mTr1_s1d", "top and bottom by the conjugate of the denominator")],
          [tx(t, "mTr1_s2", "a difference of two roots in an equation, √(x + 5) − √x = 1"), tx(t, "mTr1_s2d", "both sides by the sum of the roots")],
          [tx(t, "mTr1_s3", "a limit that gives 0/0 and has a root, (√(x + 1) − 1)/x at x = 0"), tx(t, "mTr1_s3d", "top and bottom by the conjugate of the part with the root")],
          [tx(t, "mTr1_s4", "two nearly equal roots subtracted, √10001 − √10000"), tx(t, "mTr1_s4d", "top and bottom by their sum, to turn the difference into a quotient")],
          [tx(t, "mTr1_s5", "a complex number in a denominator, 1/(2 + i)"), tx(t, "mTr1_s5d", "top and bottom by the conjugate, 2 − i")],
        ]}
      />

      <H3>{tx(t, "mTr1_ratTitle", "Use 1: rationalising a denominator")}</H3>
      <p>
        {tx(t, "mTr1_ratBody",
          "A fraction with a square root in its denominator is usually rewritten without it; the step is called rationalising, because the denominator becomes a rational number. Without the root below, fractions are easier to compare, add and estimate: 1/√2 means \"1 divided by 1.41421…\", while √2/2 is simply half of 1.41421…. A single root needs only itself: 1/√2 = √2/2, because √2 · √2 = 2. A sum or difference with a root needs its conjugate.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqRat", "Rationalising 1/(3 − √2)")}
        steps={[
          { full: true, tex: r`\frac{1}{3 - \sqrt{2}}` },
          { full: true, tex: r`= \frac{1}{3 - \sqrt{2}} \cdot \amber{\frac{3 + \sqrt{2}}{3 + \sqrt{2}}}`, why: tx(t, "mTr1_r1", "multiply by the conjugate over itself: a fraction equal to 1") },
          { full: true, tex: r`= \frac{3 + \sqrt{2}}{3^2 - (\sqrt{2})^2}`, why: tx(t, "mTr1_r2", "the bottom is a difference of squares") },
          { full: true, tex: r`= \green{\frac{3 + \sqrt{2}}{7}}`, why: tx(t, "mTr1_r3", "9 − 2 = 7: the root is gone from the bottom") },
          { full: true, tex: r`\frac{1}{1.5858} \approx 0.6306 \approx \frac{4.4142}{7}\;\checkmark`, why: tx(t, "mTr1_r4", "check with decimals, √2 ≈ 1.4142: both sides give 0.6306") },
        ]} />

      <H3>{tx(t, "mTr1_diffTitle", "Use 2: an equation with a difference of roots")}</H3>
      <p>
        {tx(t, "mTr1_diffBody",
          "In √(x + 5) − √x = 1, squaring right away leaves a cross term with a root in it, exactly as in the comparison above. The conjugate gives a cleaner route. Multiply both sides by √(x + 5) + √x. This is an equation, so here the same thing is done to both sides, and that is only safe if the factor is not zero (the Equation Toolkit chapter explains why). This sum is positive for every allowed x, at least √5, so the move is safe. On the left, the difference of squares leaves (x + 5) − x = 5, and the x disappears.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqDiff", "Solving √(x + 5) − √x = 1")}
        steps={[
          { full: true, tex: r`\sqrt{x + 5} - \sqrt{x} = 1 \qquad (x \geq 0)`, why: tx(t, "mTr1_d0", "√x needs x ≥ 0") },
          { full: true, tex: r`(x + 5) - x = 1 \cdot (\sqrt{x + 5} + \sqrt{x})`, why: tx(t, "mTr1_d1", "multiply both sides by the conjugate √(x + 5) + √x; the left side becomes a difference of squares") },
          { full: true, tex: r`\sqrt{x + 5} + \sqrt{x} = 5`, why: tx(t, "mTr1_d2", "the left side is just 5; swap the sides") },
          { full: true, tex: r`2\sqrt{x + 5} = 6`, why: tx(t, "mTr1_d3", "add this equation to the original one: the √x terms cancel") },
          { full: true, tex: r`\sqrt{x + 5} = 3 \;\Rightarrow\; x + 5 = 9 \;\Rightarrow\; x = \green{4}`, why: tx(t, "mTr1_d4", "divide by 2, square (3 is positive, so nothing fake is added), subtract 5") },
          { full: true, tex: r`\sqrt{9} - \sqrt{4} = 3 - 2 = 1\;\checkmark`, why: tx(t, "mTr1_d5", "check in the original") },
        ]} />

      <H3>{tx(t, "mTr1_nearTitle", "Use 3: two nearly equal roots")}</H3>
      <p>
        {tx(t, "mTr1_nearBody",
          "How big is √10001 − √10000? Both roots are about 100, so the difference is tiny, and subtracting two nearly equal numbers is where a calculator, or a computer, loses digits: if each root is known to 6 digits, the difference may keep only one or two of them right. The conjugate turns the subtraction into a division, which loses nothing. It also gives a quick estimate: when n is large, √(n + 1) and √n are both about √n, so their sum is about 2√n.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqNear", "√(n + 1) − √n without subtracting")}
        steps={[
          { full: true, tex: r`\sqrt{n + 1} - \sqrt{n} = \frac{(\sqrt{n + 1} - \sqrt{n})(\sqrt{n + 1} + \sqrt{n})}{\sqrt{n + 1} + \sqrt{n}}`, why: tx(t, "mTr1_n1", "multiply and divide by the sum, which is positive: a fraction equal to 1") },
          { full: true, tex: r`= \frac{(n + 1) - n}{\sqrt{n + 1} + \sqrt{n}} = \frac{1}{\sqrt{n + 1} + \sqrt{n}}`, why: tx(t, "mTr1_n2", "difference of squares on top: the n cancels and only 1 is left") },
          { full: true, tex: r`\approx \frac{1}{2\sqrt{n}}`, why: tx(t, "mTr1_n3", "for large n both roots below are close to √n") },
          { full: true, tex: r`n = 10000:\quad \frac{1}{100.005 + 100} \approx \green{0.0049999}`, why: tx(t, "mTr1_n4", "√10001 ≈ 100.005, so the exact value is 0.00499988; the estimate 1/200 = 0.005 is already very close") },
        ]} />

      <H3>{tx(t, "mTr1_cubeTitle", "Use 4: cube roots need a different partner")}</H3>
      <p>
        {tx(t, "mTr1_cubeBody",
          "The plain conjugate does not remove a cube root: (∛2 − 1)(∛2 + 1) = ∛4 − 1, still a root. The idea is the same, but the identity has to produce cubes instead of squares. The difference of cubes is a³ − b³ = (a − b)(a² + ab + b²), which you can check by multiplying out: a³ + a²b + ab² − a²b − ab² − b³, and four terms cancel. So the partner of a − b, for cubes, is a² + ab + b². For a sum, a³ + b³ = (a + b)(a² − ab + b²).")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqCube", "Rationalising 1/(∛2 − 1)")}
        steps={[
          { full: true, tex: r`\frac{1}{\sqrt[3]{2} - 1} \qquad a = \sqrt[3]{2},\ b = 1`, why: tx(t, "mTr1_c0", "the denominator is a − b with a cube root") },
          { full: true, tex: r`= \frac{1}{\sqrt[3]{2} - 1}\cdot\amber{\frac{\sqrt[3]{4} + \sqrt[3]{2} + 1}{\sqrt[3]{4} + \sqrt[3]{2} + 1}}`, why: tx(t, "mTr1_c1", "multiply by a² + ab + b² over itself: a² = ∛4, ab = ∛2, b² = 1") },
          { full: true, tex: r`= \frac{\sqrt[3]{4} + \sqrt[3]{2} + 1}{(\sqrt[3]{2})^3 - 1^3} = \green{\sqrt[3]{4} + \sqrt[3]{2} + 1}`, why: tx(t, "mTr1_c2", "the bottom is a³ − b³ = 2 − 1 = 1") },
          { full: true, tex: r`\frac{1}{0.259921} \approx 3.847322 \approx 1.587401 + 1.259921 + 1\;\checkmark`, why: tx(t, "mTr1_c3", "check with decimals: ∛2 ≈ 1.259921 and ∛4 ≈ 1.587401") },
        ]} />

      <H3>{tx(t, "mTr1_trapTitle", "The traps")}</H3>
      <Callout type="warn" t={t}>
        {tx(t, "mTr1_trapBody",
          "Three ways it goes wrong. First, in a fraction, multiply the top AND the bottom: multiplying only the bottom changes the value. Second, the conjugate flips the sign between the two terms, not a sign inside a root: the conjugate of √(x − 1) + 2 is √(x − 1) − 2, not √(x + 1) + 2. Third, the conjugate must not be zero, since c/c is 1 only for c ≠ 0; 3 − √9 = 0, for instance, so (3 + √9)/(3 − √9) is not allowed (and √9 = 3 was never a root to remove anyway).")}
      </Callout>

      <H3>{tx(t, "mTr1_elseTitle", "Where else the conjugate appears")}</H3>
      <LessonTable
        headers={[tx(t, "mTr1_hWhere", "Where"), tx(t, "mTr1_hWhat", "What it removes"), tx(t, "mTr1_hChapter", "Chapter")]}
        rows={[
          [tx(t, "mTr1_e1", "Dividing complex numbers, (5 + 5i)/(1 + 2i)"), tx(t, "mTr1_e1w", "the i in the denominator, since (1 + 2i)(1 − 2i) = 1 + 4 = 5"), tx(t, "mTr1_e1c", "Complex Numbers")],
          [tx(t, "mTr1_e2", "A limit that gives 0/0, such as (√(x + 1) − 1)/x at x = 0"), tx(t, "mTr1_e2w", "the root that keeps the 0/0, so a factor x can cancel"), tx(t, "mTr1_e2c", "Limits & Continuity")],
          [tx(t, "mTr1_e3", "The derivative of √x from its definition"), tx(t, "mTr1_e3w", "the difference √(x + h) − √x on top"), tx(t, "mTr1_e3c", "The Derivative")],
          [tx(t, "mTr1_e4", "Trigonometry: (1 − cos x)(1 + cos x)"), tx(t, "mTr1_e4w", "the 1 − cos x: the product is 1 − cos²x = sin²x"), tx(t, "mTr1_e4c", "Identities & Rotation")],
        ]}
      />

      <H2>{tx(t, "mTr1_oneTitle", "Trick 2: other disguises of 1")}</H2>
      <p>
        {tx(t, "mTr1_oneBody",
          "The conjugate is only one way to write 1. Two others come up all the time. The first clears fractions that sit inside a fraction: multiply the top and the bottom by the inner denominator. When you see a small fraction inside a big one, this is the move. The trap is the same as before: every term on top and every term below gets multiplied, and the inner denominator must not be zero.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqNest", "Simplifying (1 + 1/x)/(1 − 1/x)")}
        steps={[
          { full: true, tex: r`\frac{1 + \frac{1}{x}}{1 - \frac{1}{x}} \qquad (x \neq 0)`, why: tx(t, "mTr1_q0", "1/x needs x ≠ 0") },
          { full: true, tex: r`= \frac{1 + \frac{1}{x}}{1 - \frac{1}{x}}\cdot\amber{\frac{x}{x}} = \frac{x + 1}{x - 1}`, why: tx(t, "mTr1_q1", "multiply top and bottom by x: 1 · x = x and (1/x) · x = 1, in each term") },
          { full: true, tex: r`x = 2:\quad \frac{1.5}{0.5} = 3 = \frac{3}{1}\;\checkmark`, why: tx(t, "mTr1_q2", "check with a number: both forms give 3") },
        ]} />
      <p>
        {tx(t, "mTr1_unitBody",
          "The second is unit conversion. 1000 m and 1 km are the same length, so the fraction 1000 m / 1 km is equal to 1, and so is 1 h / 3600 s. Multiplying by them changes the units, not the speed. Choose each fraction so the unit you want to remove appears once on top and once below, and cancels.")}
      </p>
      <Equation label={tx(t, "mTr1_eqUnit", "72 km/h in metres per second")}
        where={[
          [r`\frac{1000\ \text{m}}{1\ \text{km}}`, tx(t, "mTr1_wKm", "equal to 1, because 1 km is 1000 m; it cancels the km")],
          [r`\frac{1\ \text{h}}{3600\ \text{s}}`, tx(t, "mTr1_wH", "equal to 1, because 1 hour is 3600 seconds; it cancels the h")],
        ]}
        words={tx(t, "mTr1_unitWords", "72 kilometres per hour, times 1000 metres per kilometre, times one hour per 3600 seconds, is 20 metres per second.")}>
        {r`72\ \frac{\text{km}}{\text{h}} \cdot \frac{1000\ \text{m}}{1\ \text{km}} \cdot \frac{1\ \text{h}}{3600\ \text{s}} = \frac{72000}{3600}\ \frac{\text{m}}{\text{s}} = 20\ \frac{\text{m}}{\text{s}}`}
      </Equation>

      <H2>{tx(t, "mTr1_zeroTitle", "Trick 3: adding 0, or add and subtract the same thing")}</H2>
      <p>
        {tx(t, "mTr1_zeroBody",
          "Adding c and taking c away again adds 0. The art is choosing c so that one copy of it completes a pattern you know and the other copy is left over, harmless. The pattern can be a perfect square, a copy of the denominator, or a difference of squares.")}
      </p>
      <H3>{tx(t, "mTr1_csTitle", "Completing the square")}</H3>
      <p>
        {tx(t, "mTr1_csBody",
          "x² + 6x + 5 is not a perfect square, but x² + 6x + 9 is: it is (x + 3)². So add 9 to complete it, and subtract 9 to stay honest. The number to add is always (half of the x coefficient)². The sign that tells you to try this: you need the smallest or largest value of a quadratic, its vertex, or you want to solve it without the formula. The Quadratics chapter builds this step as a picture and uses it to prove the quadratic formula.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqCs", "Completing the square in x² + 6x + 5")}
        steps={[
          { full: true, tex: r`x^2 + 6x + 5 = x^2 + 6x \amber{+ 9 - 9} + 5`, why: tx(t, "mTr1_cs1", "add 0 as 9 − 9; 9 = (6/2)²") },
          { full: true, tex: r`= (x + 3)^2 - 4`, why: tx(t, "mTr1_cs2", "the first three terms are the square (x + 3)²; −9 + 5 = −4") },
          { full: true, tex: r`\geq -4 \qquad (x = -3)`, why: tx(t, "mTr1_cs3", "a square is never negative, so the smallest value is −4, reached when x + 3 = 0") },
        ]} />
      <H3>{tx(t, "mTr1_splitTitle", "Splitting a fraction")}</H3>
      <p>
        {tx(t, "mTr1_splitBody",
          "In (x + 3)/(x + 1), x appears twice, on top and below, and it is hard to see how the value behaves. Write the top as the denominator plus what is left: x + 3 = (x + 1) + 2, which is adding and subtracting 1. Now the fraction splits into 1 + 2/(x + 1), and x appears once. At a glance, the value is a little more than 1 when x is large and positive, and it is never exactly 1. This is the step that later turns many integrals into easy ones.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqSplit", "Splitting (x + 3)/(x + 1)")}
        steps={[
          { full: true, tex: r`\frac{x + 3}{x + 1} = \frac{(x + 1) + 2}{x + 1}`, why: tx(t, "mTr1_sp1", "x + 3 = x + 1 + 2: add and subtract 1 to make a copy of the denominator") },
          { full: true, tex: r`= \frac{x + 1}{x + 1} + \frac{2}{x + 1} = \green{1 + \frac{2}{x + 1}}`, why: tx(t, "mTr1_sp2", "a fraction whose top is a sum splits into two fractions with the same denominator") },
          { full: true, tex: r`x = 3:\quad \frac{6}{4} = 1.5 = 1 + \frac{2}{4}\;\checkmark`, why: tx(t, "mTr1_sp3", "check with a number") },
        ]} />
      <H3>{tx(t, "mTr1_germTitle", "Factoring x⁴ + 4")}</H3>
      <p>
        {tx(t, "mTr1_germBody",
          "x⁴ + 4 looks impossible to factor: it is a sum, and it is never zero for a real x. Adding and subtracting 4x² makes it a perfect square minus a square, and a difference of squares factors at once. This is called the Sophie Germain identity. It shows that n⁴ + 4 is never a prime number for a whole number n > 1, because both factors are then bigger than 1: n² − 2n + 2 = (n − 1)² + 1 > 1.")}
      </p>
      <Derivation t={t} label={tx(t, "mTr1_eqGerm", "x⁴ + 4 as a product")}
        steps={[
          { full: true, tex: r`x^4 + 4 = x^4 \amber{+ 4x^2} + 4 \amber{- 4x^2}`, why: tx(t, "mTr1_g1", "add 0 as 4x² − 4x²; 4x² is the middle term that (x² + 2)² needs") },
          { full: true, tex: r`= (x^2 + 2)^2 - (2x)^2`, why: tx(t, "mTr1_g2", "x⁴ + 4x² + 4 = (x² + 2)², and 4x² = (2x)²") },
          { full: true, tex: r`= \green{(x^2 + 2x + 2)(x^2 - 2x + 2)}`, why: tx(t, "mTr1_g3", "difference of squares, A² − B² = (A + B)(A − B), with A = x² + 2 and B = 2x") },
          { full: true, tex: r`x = 3:\quad 81 + 4 = 85 = 17 \cdot 5\;\checkmark`, why: tx(t, "mTr1_g4", "check: 9 + 6 + 2 = 17 and 9 − 6 + 2 = 5") },
        ]} />

      <H2>{tx(t, "mTr1_notTitle", "Trick 4: the notable products, read backwards")}</H2>
      <p>
        {tx(t, "mTr1_notBody",
          "The notable products are usually read from left to right, to expand brackets. Read from right to left they become tools for mental arithmetic. The sign: two numbers at the same distance from a round number, or a number close to a round one that has to be squared. Write the numbers as round ± small, then use the identity; the round part is easy to square and the small part is small.")}
      </p>
      <LessonTable
        headers={[tx(t, "mTr1_hId", "Identity"), tx(t, "mTr1_hUse", "In your head")]}
        rows={[
          ["(a + b)(a − b) = a² − b²", "47 · 53 = 50² − 3² = 2500 − 9 = 2491"],
          ["(a − b)² = a² − 2ab + b²", "98² = 100² − 2 · 100 · 2 + 2² = 10000 − 400 + 4 = 9604"],
          ["(a + b)² = a² + 2ab + b²", "203² = 40000 + 1200 + 9 = 41209"],
          ["a² − b² = (a + b)(a − b)", "1001² − 999² = 2000 · 2 = 4000"],
          ["(10a + 5)² = 100 · a(a + 1) + 25", "65² = 100 · 6 · 7 + 25 = 4225"],
        ]}
      />
      <Derivation t={t} label={tx(t, "mTr1_eqFive", "Why a square ending in 5 is a(a + 1), then 25")}
        steps={[
          { full: true, tex: r`(10a + 5)^2 = 100a^2 + 2\cdot 10a \cdot 5 + 25`, why: tx(t, "mTr1_f1", "a number ending in 5 is 10a + 5, where a is the number of tens (a = 6 for 65); expand the square") },
          { full: true, tex: r`= 100a^2 + 100a + 25 = 100\,a(a + 1) + 25`, why: tx(t, "mTr1_f2", "2 · 10a · 5 = 100a; factor 100a out of the first two terms") },
          { full: true, tex: r`85^2 = 100\cdot 8 \cdot 9 + 25 = \green{7225}`, why: tx(t, "mTr1_f3", "so: multiply the tens digit by the next number up, and write 25 after it") },
        ]} />

      <H2>{tx(t, "mTr1_whichTitle", "Which trick, when")}</H2>
      <LessonTable
        headers={[tx(t, "mTr1_hSee", "When you see"), tx(t, "mTr1_hTry", "Try"), tx(t, "mTr1_hWhyW", "Why it works")]}
        rows={[
          [tx(t, "mTr1_w1", "one root below, 6/√3"), tx(t, "mTr1_w1t", "multiply top and bottom by the root"), "√a · √a = a"],
          [tx(t, "mTr1_w2", "a sum or difference with a root, 1/(√5 − 2)"), tx(t, "mTr1_w2t", "multiply by the conjugate"), "(a + b)(a − b) = a² − b²"],
          [tx(t, "mTr1_w3", "a cube root in a difference, 1/(∛3 − 1)"), tx(t, "mTr1_w3t", "multiply by a² + ab + b²"), "(a − b)(a² + ab + b²) = a³ − b³"],
          [tx(t, "mTr1_w4", "a fraction inside a fraction"), tx(t, "mTr1_w4t", "multiply top and bottom by the inner denominator"), tx(t, "mTr1_w4w", "it is c/c = 1")],
          [tx(t, "mTr1_w5", "the smallest value, or the vertex, of a quadratic"), tx(t, "mTr1_w5t", "complete the square"), tx(t, "mTr1_w5w", "+ (b/2)² − (b/2)² = 0; a square is ≥ 0")],
          [tx(t, "mTr1_w6", "x on top and below, (x + 3)/(x + 1)"), tx(t, "mTr1_w6t", "make a copy of the denominator on top"), tx(t, "mTr1_w6w", "add and subtract, then split the sum")],
          [tx(t, "mTr1_w7", "a sum of two squares that will not factor"), tx(t, "mTr1_w7t", "add and subtract the missing middle term"), tx(t, "mTr1_w7w", "it becomes a difference of squares")],
          [tx(t, "mTr1_w8", "numbers close to a round number"), tx(t, "mTr1_w8t", "round ± small, then a notable product"), tx(t, "mTr1_w8w", "the round part is easy, the small part is small")],
        ]}
      />

      <TrickPickFigure t={t} bank="algebra1" />

      <H2>{tx(t, "mTr1_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mTr1_tWrong", "Wrong"), tx(t, "mTr1_tRight", "Right"), tx(t, "mTr1_tWhy", "Why")]}
        rows={[
          ["1/(3 − √2) → 1/(3 − √2) · (3 + √2)", "· (3 + √2)/(3 + √2)", tx(t, "mTr1_x1", "multiplying only the bottom, or only the top, changes the value; c/c is what equals 1")],
          [tx(t, "mTr1_x2w", "conjugate of √(x − 1) + 2 is √(x + 1) + 2"), "√(x − 1) − 2", tx(t, "mTr1_x2", "flip the sign between the terms, never inside them")],
          ["(√a + √b)² = a + b", "a + 2√(ab) + b", tx(t, "mTr1_x3", "squaring keeps the cross term; only the conjugate cancels it")],
          ["1/(√a + √b) = 1/√a + 1/√b", tx(t, "mTr1_x4r", "multiply by the conjugate"), tx(t, "mTr1_x4", "a fraction does not split over a sum in its denominator: 1/(1 + 1) = 1/2, not 2")],
          ["(∛2 − 1)(∛2 + 1) = 1", "∛4 − 1", tx(t, "mTr1_x5", "for cube roots the partner is a² + ab + b², not a + b")],
          ["x² + 6x + 5 = (x + 3)² + 5", "(x + 3)² − 4", tx(t, "mTr1_x6", "the 9 that completes the square must also be taken away")],
        ]}
      />

      <MathPracticeFigure t={t} set="algebraTricks" />

      <Related t={t} links={[
        { track: "Math", id: "quadratics", title: tx(t, "mTr1_rel1", "Quadratics"), why: tx(t, "mTr1_rel1b", "completing the square drawn as a picture, and the quadratic formula it proves.") },
        { track: "Math", id: "equation-toolkit", title: tx(t, "mTr1_rel2", "Equation Toolkit: Safe Moves & Tricks"), why: tx(t, "mTr1_rel2b", "which moves on both sides of an equation are safe, and which add or lose solutions.") },
        { track: "Math", id: "complex", title: tx(t, "mTr1_rel3", "Complex Numbers"), why: tx(t, "mTr1_rel3b", "the conjugate a − bi and dividing complex numbers.") },
        { track: "Math", id: "limits", title: tx(t, "mTr1_rel4", "Limits & Continuity"), why: tx(t, "mTr1_rel4b", "the conjugate used to get past a 0/0.") },
        { track: "Math", id: "algebra-shortcuts", title: tx(t, "mTr1_rel5", "Algebra Tricks II"), why: tx(t, "mTr1_rel5b", "the next set of tricks: roots from their sum and product, special values, symmetry.") },
      ]} />

      <KeyIdeas t={t} id="mTr1" items={[
        "Multiplying by 1 (as c/c, with c ≠ 0) and adding 0 (as c − c) never change a value, only its shape; they work on any expression.",
        "The conjugate of a + b is a − b. Their product a² − b² has no cross term, so a square root in a or b disappears; squaring would keep the cross term 2ab.",
        "In a fraction, multiply top and bottom by the conjugate; in an equation, multiply both sides, and check the factor is not zero.",
        "A difference of nearly equal roots is better written as 1 over their sum: no digits are lost, and it gives the estimate 1/(2√n).",
        "For cube roots the partner of a − b is a² + ab + b², from a³ − b³ = (a − b)(a² + ab + b²).",
        "Adding and subtracting the same term completes a square, makes a copy of a denominator, or turns a sum like x⁴ + 4 into a difference of squares.",
        "The notable products read backwards are mental arithmetic: 47 · 53 = 50² − 3², 98² = (100 − 2)².",
      ]} />
    </Article>
  );
}

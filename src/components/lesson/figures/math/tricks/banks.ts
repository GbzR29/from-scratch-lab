// ── "Which trick?" question banks ─────────────────────────────────────────────
// One bank per tricks chapter, used by TrickPickFigure. Each item is a problem
// (TeX) with what it asks for, the trick that opens it and one sentence on
// why. The four answer buttons are the right trick plus three others from the
// same bank. Text is [translation key, English]; PT lives in
// components/lesson/i18n/pt/mathTricks.ts. Bank ids are part of the storage
// key of the best score, so keep them stable.

export type Txt = [string, string];
export type Trick = { id: string; name: Txt };
export type TrickItem = { tex: string; goal: Txt; right: string; why: Txt };
export type TrickBank = { title: Txt; tricks: Trick[]; items: TrickItem[] };

const r = String.raw;

const ALGEBRA1: TrickBank = {
  title: ["figTk_a1Title", "Practice: which trick? (multiply by 1, add 0)"],
  tricks: [
    { id: "conj", name: ["figTk_nConj", "multiply by the conjugate"] },
    { id: "self", name: ["figTk_nSelf", "multiply by the root itself"] },
    { id: "lcd", name: ["figTk_nLcd", "multiply top and bottom by the inner denominator"] },
    { id: "complete", name: ["figTk_nComplete", "add and subtract: complete the square"] },
    { id: "split", name: ["figTk_nSplit", "add and subtract in the numerator"] },
    { id: "notable", name: ["figTk_nNotable", "a notable product"] },
  ],
  items: [
    { tex: r`\frac{1}{\sqrt{5} - 2}`, goal: ["figTk_a1g1", "Remove the root from the denominator"], right: "conj",
      why: ["figTk_a1w1", "A difference with a root below: multiply top and bottom by √5 + 2. The bottom becomes 5 − 4 = 1, so the answer is √5 + 2."] },
    { tex: r`\frac{6}{\sqrt{3}}`, goal: ["figTk_a1g2", "Remove the root from the denominator"], right: "self",
      why: ["figTk_a1w2", "A single root below needs only itself: multiply by √3/√3. Since √3 · √3 = 3, 6/√3 = 6√3/3 = 2√3."] },
    { tex: r`\frac{1 + \frac{1}{x}}{1 - \frac{1}{x}}`, goal: ["figTk_a1g3", "Simplify"], right: "lcd",
      why: ["figTk_a1w3", "Fractions inside a fraction: multiply top and bottom by x, the inner denominator. Every 1/x becomes 1, giving (x + 1)/(x − 1)."] },
    { tex: r`x^2 + 8x + 3`, goal: ["figTk_a1g4", "Find the smallest value"], right: "complete",
      why: ["figTk_a1w4", "Add and subtract 16: (x + 4)² − 13. A square is never negative, so the smallest value is −13, at x = −4."] },
    { tex: r`\frac{x + 5}{x + 2}`, goal: ["figTk_a1g5", "Rewrite it with x in one place only"], right: "split",
      why: ["figTk_a1w5", "Write the top as (x + 2) + 3, adding and subtracting 2. The fraction splits into 1 + 3/(x + 2)."] },
    { tex: r`102 \cdot 98`, goal: ["figTk_a1g6", "Compute it in your head"], right: "notable",
      why: ["figTk_a1w6", "(100 + 2)(100 − 2) is a difference of squares: 10000 − 4 = 9996."] },
    { tex: r`\sqrt{x + 9} - \sqrt{x} = 1`, goal: ["figTk_a1g7", "Solve, without squaring a difference of roots"], right: "conj",
      why: ["figTk_a1w7", "Multiply both sides by √(x + 9) + √x. The left side becomes (x + 9) − x = 9, so √(x + 9) + √x = 9; add the two equations to get √(x + 9) = 5, x = 16."] },
    { tex: r`75^2`, goal: ["figTk_a1g8", "Compute it in your head"], right: "notable",
      why: ["figTk_a1w8", "(10a + 5)² = 100·a(a + 1) + 25. With a = 7: 100 · 56 + 25 = 5625."] },
    { tex: r`\lim_{x \to 0} \frac{\sqrt{4 + x} - 2}{x}`, goal: ["figTk_a1g9", "Get past 0/0"], right: "conj",
      why: ["figTk_a1w9", "Multiply top and bottom by √(4 + x) + 2. The top becomes (4 + x) − 4 = x, which cancels the x below: the limit is 1/(2 + 2) = 1/4."] },
    { tex: r`x^4 + 64`, goal: ["figTk_a1g10", "Factor it"], right: "complete",
      why: ["figTk_a1w10", "Add and subtract 16x²: x⁴ + 16x² + 64 − 16x² = (x² + 8)² − (4x)², a difference of squares: (x² + 4x + 8)(x² − 4x + 8)."] },
    { tex: r`\frac{x^2}{x^2 + 1}`, goal: ["figTk_a1g11", "Show it is always below 1"], right: "split",
      why: ["figTk_a1w11", "Write x² as (x² + 1) − 1. Then the fraction is 1 − 1/(x² + 1), and 1/(x² + 1) is always positive."] },
    { tex: r`\frac{2}{\sqrt[3]{3} - 1}`, goal: ["figTk_a1g12", "Remove the cube root from the denominator"], right: "conj",
      why: ["figTk_a1w12", "For cube roots, the partner of a − b is a² + ab + b², because (a − b)(a² + ab + b²) = a³ − b³. Here the bottom becomes 3 − 1 = 2, so the answer is ∛9 + ∛3 + 1."] },
    { tex: r`2x^2 - 12x + 7`, goal: ["figTk_a1g13", "Find the vertex of the parabola"], right: "complete",
      why: ["figTk_a1w13", "Take out the 2: 2(x² − 6x) + 7, then add and subtract 9 inside: 2(x − 3)² − 11. The vertex is (3, −11)."] },
    { tex: r`\frac{\frac{1}{a} - \frac{1}{b}}{a - b}`, goal: ["figTk_a1g14", "Simplify"], right: "lcd",
      why: ["figTk_a1w14", "Multiply top and bottom by ab: (b − a)/(ab(a − b)). Since b − a = −(a − b), it is −1/(ab)."] },
    { tex: r`999^2`, goal: ["figTk_a1g15", "Compute it in your head"], right: "notable",
      why: ["figTk_a1w15", "(1000 − 1)² = 1000000 − 2000 + 1 = 998001."] },
    { tex: r`\frac{3}{2\sqrt{5}}`, goal: ["figTk_a1g16", "Remove the root from the denominator"], right: "self",
      why: ["figTk_a1w16", "Multiply by √5/√5: the bottom becomes 2 · 5 = 10, so the answer is 3√5/10."] },
  ],
};

const ALGEBRA2: TrickBank = {
  title: ["figTk_a2Title", "Practice: which trick? (roots, coefficients, symmetry)"],
  tricks: [
    { id: "vieta", name: ["figTk_nVieta", "sum and product of the roots"] },
    { id: "special", name: ["figTk_nSpecial", "plug in x = 1, −1 or 0"] },
    { id: "sub", name: ["figTk_nSub", "substitute u for a repeated block"] },
    { id: "recip", name: ["figTk_nRecip", "work with t = x + 1/x"] },
    { id: "symm", name: ["figTk_nSymm", "use s = x + y and p = xy"] },
    { id: "logs", name: ["figTk_nLogs", "a common exponent, or logarithms"] },
    { id: "check", name: ["figTk_nCheck", "test with easy numbers"] },
  ],
  items: [
    { tex: r`x^2 - 5x + 3 = 0 \qquad r^2 + q^2 = \;?`, goal: ["figTk_a2g1", "r and q are the roots. Find this without solving"], right: "vieta",
      why: ["figTk_a2w1", "r + q = 5 and rq = 3, so r² + q² = (r + q)² − 2rq = 25 − 6 = 19."] },
    { tex: r`(3x - 2)^7`, goal: ["figTk_a2g2", "Find the sum of its coefficients"], right: "special",
      why: ["figTk_a2w2", "The sum of the coefficients is the value at x = 1: (3 − 2)⁷ = 1."] },
    { tex: r`x^4 - 10x^2 + 9 = 0`, goal: ["figTk_a2g3", "Solve"], right: "sub",
      why: ["figTk_a2w3", "x only appears as x² and (x²)²: with u = x², u² − 10u + 9 = (u − 1)(u − 9), so x = ±1 or ±3."] },
    { tex: r`x^4 - 3x^3 + 4x^2 - 3x + 1 = 0`, goal: ["figTk_a2g4", "Solve"], right: "recip",
      why: ["figTk_a2w4", "The coefficients 1, −3, 4, −3, 1 read the same backwards. Divide by x² and set t = x + 1/x: (t² − 2) − 3t + 4 = 0, so t² − 3t + 2 = 0."] },
    { tex: r`x + y = 7,\quad xy = 10.\quad x^2 + y^2 = \;?`, goal: ["figTk_a2g5", "Find it without finding x and y"], right: "symm",
      why: ["figTk_a2w5", "x² + y² = (x + y)² − 2xy = 49 − 20 = 29."] },
    { tex: r`2^{300} \;\lessgtr\; 3^{200}`, goal: ["figTk_a2g6", "Which is bigger?"], right: "logs",
      why: ["figTk_a2w6", "Write both with the exponent 100: 2³⁰⁰ = (2³)¹⁰⁰ = 8¹⁰⁰ and 3²⁰⁰ = (3²)¹⁰⁰ = 9¹⁰⁰. So 3²⁰⁰ is bigger."] },
    { tex: r`(a + b)^2 \overset{?}{=} a^2 + b^2`, goal: ["figTk_a2g7", "Is this identity true?"], right: "check",
      why: ["figTk_a2w7", "Try a = b = 1: the left side is 4, the right side is 2. One case that fails is enough: it is false (the 2ab is missing)."] },
    { tex: r`2x^2 + 7x - 4 = 0 \qquad \frac{1}{r} + \frac{1}{q} = \;?`, goal: ["figTk_a2g8", "r and q are the roots. Find this without solving"], right: "vieta",
      why: ["figTk_a2w8", "r + q = −7/2 and rq = −4/2 = −2. 1/r + 1/q = (r + q)/(rq) = (−7/2)/(−2) = 7/4."] },
    { tex: r`(x + 2)^3 (x - 1)^4`, goal: ["figTk_a2g9", "Find the constant term"], right: "special",
      why: ["figTk_a2w9", "The constant term is the value at x = 0: 2³ · (−1)⁴ = 8."] },
    { tex: r`9^x - 4\cdot 3^x + 3 = 0`, goal: ["figTk_a2g10", "Solve"], right: "sub",
      why: ["figTk_a2w10", "9ˣ = (3ˣ)², so with u = 3ˣ: u² − 4u + 3 = 0, u = 1 or 3, so x = 0 or 1."] },
    { tex: r`x + \frac{1}{x} = 3.\quad x^2 + \frac{1}{x^2} = \;?`, goal: ["figTk_a2g11", "Find it without finding x"], right: "recip",
      why: ["figTk_a2w11", "Square t = x + 1/x: t² = x² + 2 + 1/x², because x · 1/x = 1. So x² + 1/x² = 9 − 2 = 7."] },
    { tex: r`x + y = 7,\quad x^2 + y^2 = 25.\quad xy = \;?`, goal: ["figTk_a2g12", "Find it without finding x and y"], right: "symm",
      why: ["figTk_a2w12", "(x + y)² = x² + y² + 2xy, so 49 = 25 + 2xy and xy = 12."] },
    { tex: r`5^{40} \;\lessgtr\; 3^{60}`, goal: ["figTk_a2g13", "Which is bigger?"], right: "logs",
      why: ["figTk_a2w13", "Write both with the exponent 20: 5⁴⁰ = 25²⁰ and 3⁶⁰ = 27²⁰. So 3⁶⁰ is bigger."] },
    { tex: r`(x^{50} + x + 1) \div (x - 1)`, goal: ["figTk_a2g14", "Find the remainder"], right: "special",
      why: ["figTk_a2w14", "By the remainder theorem, the remainder of P(x) ÷ (x − 1) is P(1) = 1 + 1 + 1 = 3."] },
    { tex: r`x^3 - x \overset{?}{=} x(x - 1)(x + 1)`, goal: ["figTk_a2g15", "Is this identity true?"], right: "check",
      why: ["figTk_a2w15", "x = 0, 1, 2, 3 give 0, 0, 6, 24 on both sides. Two polynomials of degree 3 that agree at 4 points are the same polynomial, so this check is a proof."] },
    { tex: r`x^2 - 6x + 4 = 0 \qquad (r - q)^2 = \;?`, goal: ["figTk_a2g16", "r and q are the roots. Find this without solving"], right: "vieta",
      why: ["figTk_a2w16", "(r − q)² = (r + q)² − 4rq = 36 − 16 = 20."] },
  ],
};

export const BANKS = { algebra1: ALGEBRA1, algebra2: ALGEBRA2 } satisfies Record<string, TrickBank>;
export type BankId = keyof typeof BANKS;

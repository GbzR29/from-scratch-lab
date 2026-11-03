"use client";

// Arithmetic 5: the rule of three. Simple direct (cross-multiplication and the
// unit rate behind it), how to tell direct from inverse and from "not
// proportional at all", simple inverse (the product stays fixed), the arrow
// method, and the compound rule of three with three or more quantities, with
// the derivation of why the ratios multiply (a constant that cancels).

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { RuleOfThreeFigure } from "@/components/lesson/figures/math/RuleOfThreeFigure";
import { MathPracticeFigure } from "@/components/lesson/figures/math/MathPracticeFigure";

const r = String.raw;

// ── Live compound rule of three: the wall ────────────────────────────────────
// 6 workers, 8 h a day, 400 m in 20 days. Days = 20 · (6/e) · (8/f) · (g/400).

const num = (v: number) => String(Math.round(v * 100) / 100);

function wallDays(v: Record<string, number>, days: string) {
  const x = (20 * 6 * 8 * v.g) / (v.e * v.f * 400);
  const exact = Math.abs(x - Math.round(x)) < 1e-9;
  return {
    tex: r`\begin{gathered} \frac{20}{x} = \frac{\purple{${v.e}}}{\purple{6}} \cdot \frac{\purple{${v.f}}}{\purple{8}} \cdot \frac{400}{${v.g}} \\ x = \frac{20 \cdot 6 \cdot 8 \cdot ${v.g}}{${v.e} \cdot ${v.f} \cdot 400} ${exact ? "=" : "\\approx"} \green{${num(x)}}\ \text{${days}} \end{gathered}`,
  };
}

export function RuleOfThreeContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mR3_intro",
          "Three numbers are known and a fourth is missing: 6 litres of fuel take a car 75 km, so how many litres for 200 km? 5 machines make 400 parts in 8 days, so how many parts do 3 machines make in 10 days? The rule of three is the method for these questions. It is the proportion of the previous chapter turned into a routine: decide, quantity by quantity, whether it moves with the unknown or against it, write the ratios, and cross-multiply. With two quantities it is the simple rule of three; with three or more, the compound one.")}
      </Lead>

      <Goals t={t} id="mR3" items={[
        "Solve a simple rule of three, direct and inverse.",
        "Decide whether two quantities are directly proportional, inversely proportional, or not proportional at all.",
        "Set up a compound rule of three with the arrow method.",
        "Explain why the ratios of a compound rule of three multiply.",
        "Check an answer with the constant the quantities share.",
      ]} />

      <H2>{tx(t, "mR3_simpleTitle", "Three numbers known, one to find")}</H2>
      <p>
        {tx(t, "mR3_simpleBody",
          "The name says what the method uses: three known numbers find the fourth. Medieval and Renaissance arithmetic books called it the golden rule, because merchants used it for every price, exchange and share; Portuguese, Spanish and Italian still call it the rule of three, while English school books usually just say proportion problems. Put the two quantities in two columns, the known case in one row and the new case in the next. When the quantities are directly proportional (double one and the other doubles), the ratio of the two values in one column equals the ratio in the other column.")}
      </p>
      <Equation label={tx(t, "mR3_eqDirect", "Simple rule of three, direct")}
        where={[
          [r`a,\ b`, tx(t, "mR3_wAB", "the known case: a of the first quantity goes with b of the second (6 L with 75 km)")],
          [r`c`, tx(t, "mR3_wC", "the new value of the first quantity (the 200 km in the example go here when km is the first column)")],
          [r`x`, tx(t, "mR3_wX", "the value of the second quantity that goes with c, the one we want")],
        ]}
        words={tx(t, "mR3_directWords", "In a direct rule of three, each column changes by the same factor: the ratio down one column equals the ratio down the other. Cross-multiply and divide by the number facing x.")}
        note={tx(t, "mR3_eqDirectNote", "The fuel question with km as the first column: a = 75 km goes with b = 6 L, and c = 200 km goes with x litres. 75/200 = 6/x, so 75x = 6 · 200 = 1200 and x = 1200/75 = 16 L.")}>
        {r`\frac{a}{c} = \frac{b}{x} \;\Rightarrow\; a\,x = b\,c \;\Rightarrow\; x = \frac{b\,c}{a}`}
      </Equation>
      <Derivation t={t} label={tx(t, "mR3_derUnit", "Why cross-multiplying gives the same as the unit rate")}
        steps={[
          { tex: r`k = \frac{6\ \text{L}}{75\ \text{km}} = 0.08\ \text{L/km}`, full: true, why: tx(t, "mR3_du1", "direct proportion means litres per km is a constant k: the car uses the same fuel for every kilometre") },
          { tex: r`x = k \cdot 200 = 0.08 \times 200 = 16\ \text{L}`, full: true, why: tx(t, "mR3_du2", "the new trip uses the same k per km, so multiply by its 200 km") },
          { tex: r`x = \frac{6}{75} \cdot 200 = \frac{6 \cdot 200}{75}`, full: true, why: tx(t, "mR3_du3", "write k as the fraction 6/75 instead: this is exactly x = bc/a, the cross-multiplication. The rule of three is the unit rate, done without dividing first") },
        ]} />

      <H2>{tx(t, "mR3_testTitle", "Direct, inverse, or neither: the doubling test")}</H2>
      <p>
        {tx(t, "mR3_testBody",
          "Everything depends on one decision, made before any arithmetic. Imagine doubling one quantity while everything else stays as it was. If the other quantity doubles too, they are directly proportional and their ratio is fixed. If it halves, they are inversely proportional and their product is fixed: twice the workers, half the days. If it does something else (stays the same, quadruples, grows by a fixed amount), they are not proportional at all, and the rule of three gives a wrong answer however carefully it is done. \"More gives more\" is not enough for direct: it has to be in the same proportion.")}
      </p>
      <LessonTable
        headers={[tx(t, "mR3_tPair", "Pair of quantities"), tx(t, "mR3_tType", "Type"), tx(t, "mR3_tWhy", "Why")]}
        rows={[
          [tx(t, "mR3_p1", "kilograms bought and price paid"), tx(t, "mR3_direct", "direct"), tx(t, "mR3_p1w", "every kilogram costs the same")],
          [tx(t, "mR3_p2", "machines and parts made (same days)"), tx(t, "mR3_direct", "direct"), tx(t, "mR3_p2w", "every machine makes the same number of parts")],
          [tx(t, "mR3_p3", "speed and travel time (same distance)"), tx(t, "mR3_inverse", "inverse"), tx(t, "mR3_p3w", "speed × time = distance, which is fixed")],
          [tx(t, "mR3_p4", "workers and days (same job)"), tx(t, "mR3_inverse", "inverse"), tx(t, "mR3_p4w", "workers × days = the work, in worker-days, which is fixed")],
          [tx(t, "mR3_p5", "taps and time to fill a tank"), tx(t, "mR3_inverse", "inverse"), tx(t, "mR3_p5w", "taps × hours = the tank's volume in \"tap-hours\"")],
          [tx(t, "mR3_p6", "side of a square and its area"), tx(t, "mR3_neither", "neither"), tx(t, "mR3_p6w", "double the side and the area is multiplied by 4 (area = side²)")],
          [tx(t, "mR3_p7", "taxi kilometres and fare"), tx(t, "mR3_neither", "neither"), tx(t, "mR3_p7w", "the fixed starting fee makes 0 km cost more than 0; double the km and the fare less than doubles")],
          [tx(t, "mR3_p8", "a child's age and height"), tx(t, "mR3_neither", "neither"), tx(t, "mR3_p8w", "a 10-year-old is not twice as tall as a 5-year-old")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "mR3_warnFee", "A quantity with a fixed part is never proportional. A taxi charging 5 to start plus 2 per km charges 25 for 10 km, but not 50 for 20 km: it charges 45. To use a rule of three there, take the fixed part away first (20 for 10 km, so 40 for 20 km) and add it back at the end.")}
      </Callout>

      <H2>{tx(t, "mR3_invTitle", "Simple rule of three, inverse")}</H2>
      <p>
        {tx(t, "mR3_invBody",
          "At 60 km/h a trip takes 4 hours. At 80 km/h it takes less, so speed and time move against each other. The distance did not change, and distance = speed × time, so the product is what stays fixed: 60 × 4 = 240 = 80 × x, and x = 3 hours. In the two-column layout this means one ratio has to be turned upside down before cross-multiplying. The usual way is to keep the column with x as it is and flip the inverse one.")}
      </p>
      <Equation label={tx(t, "mR3_eqInverse", "Simple rule of three, inverse")}
        where={[
          [r`a,\ b`, tx(t, "mR3_wABi", "the known case: a of the first quantity with b of the second (60 km/h with 4 h)")],
          [r`c`, tx(t, "mR3_wCi", "the new value of the first quantity (80 km/h)")],
          [r`x`, tx(t, "mR3_wXi", "the value of the second quantity that goes with c")],
        ]}
        words={tx(t, "mR3_invWords", "In an inverse rule of three the product stays the same, so the ratio of the x column equals the other ratio upside down. Equivalently: multiply the known pair, divide by the new value.")}
        note={tx(t, "mR3_eqInverseNote", "Check every inverse answer by multiplying: 60 × 4 and 80 × 3 must both give the same 240. If you had cross-multiplied without flipping, you would get x = 80 · 4/60 ≈ 5.3 h: going faster and arriving later, which the doubling test rules out at once.")}>
        {r`\frac{b}{x} = \frac{c}{a} \;\Rightarrow\; a\,b = c\,x \;\Rightarrow\; x = \frac{a\,b}{c}`}
      </Equation>

      <H2>{tx(t, "mR3_arrowTitle", "The arrow method")}</H2>
      <p>
        {tx(t, "mR3_arrowBody",
          "Brazilian and Portuguese schools teach a layout that makes the decision visible, and it scales to any number of quantities:")}
      </p>
      <ol className="list-decimal pl-6 space-y-1">
        <li>{tx(t, "mR3_step1", "Write one column per quantity, with its unit at the top. The known case goes in the first row, the new case in the second; x goes where the missing number is.")}</li>
        <li>{tx(t, "mR3_step2", "Draw an arrow down the column with x. It is the reference.")}</li>
        <li>{tx(t, "mR3_step3", "For each other column, ask the doubling question against x alone, as if every other column were frozen. Same direction: arrow down. Opposite: arrow up.")}</li>
        <li>{tx(t, "mR3_step4", "Write the ratio of the x column, top over bottom. Set it equal to the product of the other ratios, each read in the direction of its own arrow: a down arrow is top over bottom, an up arrow is bottom over top.")}</li>
        <li>{tx(t, "mR3_step5", "Solve for x, then check the answer with the constant (next section).")}</li>
      </ol>
      <RuleOfThreeFigure t={t} />

      <H2>{tx(t, "mR3_compTitle", "Compound rule of three")}</H2>
      <p>
        {tx(t, "mR3_compBody",
          "5 machines make 400 parts in 8 days. How many parts do 3 machines make in 10 days? Now three quantities change together. The key is step 3 of the method: compare each quantity with the unknown on its own. With the days frozen, more machines make more parts: direct. With the machines frozen, more days make more parts: direct. Machines and days are never compared with each other; only with x. Both arrows point down like x's, so 400/x = (5/3) · (8/10) = 40/30, and x = 400 · 30/40 = 300 parts.")}
      </p>
      <Equation label={tx(t, "mR3_eqCompound", "Compound rule of three")}
        where={[
          [r`x_0,\ x`, tx(t, "mR3_wX0", "the quantity asked for: x₀ in the known case, x in the new one")],
          [r`p_0,\ p_1`, tx(t, "mR3_wP", "a quantity that is directly proportional to x (arrow down): its old and new value, read top over bottom")],
          [r`q_0,\ q_1`, tx(t, "mR3_wQ", "a quantity that is inversely proportional to x (arrow up): read bottom over top, so q₁ goes on top")],
        ]}
        words={tx(t, "mR3_compWords", "The ratio of the unknown's column equals the product of all the other ratios, each one flipped if its quantity works against the unknown. Add one factor per quantity; there is no limit.")}
        note={tx(t, "mR3_eqCompoundNote", "With only one p and no q this is the direct rule of three; with only one q, the inverse one. The simple rule is the compound rule with one factor.")}>
        {r`\frac{x_0}{x} = \frac{p_0}{p_1} \cdot \frac{q_1}{q_0} \cdot \ldots`}
      </Equation>

      <H3>{tx(t, "mR3_wallTitle", "With an inverse quantity: the wall")}</H3>
      <p>
        {tx(t, "mR3_wallBody",
          "6 workers, working 8 hours a day, build 400 m of wall in 20 days. How many days do 10 workers, working 6 hours a day, need for 600 m? The unknown is days. More workers: fewer days (inverse, arrow up). More hours a day: fewer days (inverse, arrow up). More metres: more days (direct, arrow down).")}
      </p>
      <Derivation t={t} label={tx(t, "mR3_derWall", "The wall, step by step")}
        steps={[
          { tex: r`\frac{20}{x} = \frac{\purple{10}}{\purple{6}} \cdot \frac{\purple{6}}{\purple{8}} \cdot \frac{400}{600}`, full: true, why: tx(t, "mR3_dw1", "the days column, top over bottom, equals the three other ratios: workers and hours flipped (purple, arrow up), metres as they are (arrow down)") },
          { tex: r`\frac{20}{x} = \frac{10 \cdot 6 \cdot 400}{6 \cdot 8 \cdot 600} = \frac{24\,000}{28\,800} = \frac{5}{6}`, full: true, why: tx(t, "mR3_dw2", "multiply the tops together and the bottoms together, then simplify (both divide by 4800)") },
          { tex: r`5x = 20 \cdot 6 = 120 \;\Rightarrow\; \green{x = 24\ \text{days}}`, full: true, why: tx(t, "mR3_dw3", "cross-multiply and divide by 5") },
          { tex: r`\frac{400}{6 \cdot 8 \cdot 20} = \frac{5}{12} \qquad 10 \cdot 6 \cdot 24 \cdot \frac{5}{12} = 600`, full: true, why: tx(t, "mR3_dw4", "check with the constant: the first team lays 5/12 m of wall per worker-hour. The new team works 10 × 6 × 24 = 1440 worker-hours, and 1440 × 5/12 = 600 m, exactly the wall asked for") },
        ]} />

      <H3>{tx(t, "mR3_whyTitle", "Why the ratios multiply")}</H3>
      <p>
        {tx(t, "mR3_whyBody",
          "The method looks like a recipe, but it comes from one fact: when each quantity is proportional to the unknown on its own, there is a single constant that ties them all together. In the wall, each worker lays the same length per hour, so metres = k × workers × hours a day × days, with the same k for both teams.")}
      </p>
      <Derivation t={t} label={tx(t, "mR3_derWhy", "From the constant to the method")}
        steps={[
          { tex: r`\begin{gathered} m_0 = k\,w_0\,h_0\,d_0 \\ m_1 = k\,w_1\,h_1\,d_1 \end{gathered}`, full: true, why: tx(t, "mR3_dy1", "m metres, w workers, h hours a day, d days, for the known team (0) and the new one (1). k is the metres one worker lays in one hour, the same for both") },
          { tex: r`\frac{m_0}{m_1} = \frac{w_0\,h_0\,d_0}{w_1\,h_1\,d_1}`, full: true, why: tx(t, "mR3_dy2", "divide the first equation by the second: k cancels, which is why it never has to be known") },
          { tex: r`\frac{d_0}{d_1} = \frac{w_1}{w_0} \cdot \frac{h_1}{h_0} \cdot \frac{m_0}{m_1}`, full: true, why: tx(t, "mR3_dy3", "solve for the ratio of the days: w and h move to the other side, so they come out flipped (inverse, up arrows); m stays as it is (direct, down arrow). This is the arrow layout, derived") },
        ]} />
      <LiveFormula label={tx(t, "mR3_liveWall", "Try it: change the new team")}
        tex={r`\frac{20}{x} = \frac{e}{6} \cdot \frac{f}{8} \cdot \frac{400}{g}`}
        vars={[
          { id: "e", label: tx(t, "mR3_vWorkers", "workers e"), min: 1, max: 20, step: 1, value: 10, fmt: v => String(v) },
          { id: "f", label: tx(t, "mR3_vHours", "hours/day f"), min: 2, max: 12, step: 1, value: 6, fmt: v => String(v) },
          { id: "g", label: tx(t, "mR3_vMetres", "metres g"), min: 100, max: 1200, step: 50, value: 600, fmt: v => String(v) },
        ]}
        compute={(v) => wallDays(v, tx(t, "mR3_days", "days"))}
        note={tx(t, "mR3_liveWallNote", "The known team stays at 6 workers, 8 h a day, 400 m in 20 days. Double the workers and the days halve; double the metres and they double; set e = 6, f = 8, g = 400 and you get the 20 days back.")} />

      <H2>{tx(t, "mR3_exTitle", "Worked examples")}</H2>
      <H3>{tx(t, "mR3_ex1T", "A percentage as a rule of three")}</H3>
      <p>
        {tx(t, "mR3_ex1",
          "18 students are 40 % of a class. How many students are in the class? The whole class is 100 %, and students and percentage are directly proportional: 18 goes with 40, x goes with 100. 18/x = 40/100, so 40x = 1800 and x = 45. This is the same as the \"whole = part / percentage\" of the previous chapter, 18/0.4 = 45, laid out as a rule of three.")}
      </p>
      <H3>{tx(t, "mR3_ex2T", "Scaling a recipe")}</H3>
      <p>
        {tx(t, "mR3_ex2",
          "A cake for 8 people takes 300 g of flour and 3 eggs. For 12 people: 8/12 = 300/x gives x = 450 g of flour, and 8/12 = 3/y gives y = 4.5 eggs. The baking time does not follow: a bigger cake does not take 1.5 times as long, because time is not proportional to the number of guests. The doubling test catches this before the arithmetic does.")}
      </p>
      <H3>{tx(t, "mR3_ex3T", "Three inverse quantities")}</H3>
      <p>
        {tx(t, "mR3_ex3",
          "4 identical pumps, running 6 hours a day, empty a reservoir in 15 days. How many days do 5 pumps, running 8 hours a day, take? More pumps: fewer days (inverse). More hours a day: fewer days (inverse). 15/x = (5/4) · (8/6) = 40/24, so x = 15 · 24/40 = 9 days. Check: 4 × 6 × 15 = 360 pump-hours, and 5 × 8 × 9 = 360 pump-hours as well.")}
      </p>

      <H2>{tx(t, "mR3_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mR3_tWrong", "Wrong"), tx(t, "mR3_tRight", "Right"), tx(t, "mR3_tWhy2", "Why")]}
        rows={[
          [tx(t, "mR3_m1w", "cross-multiplying an inverse pair"), tx(t, "mR3_m1r", "flip the inverse column first"), tx(t, "mR3_m1", "otherwise faster gives later and more workers give more days")],
          [tx(t, "mR3_m2w", "comparing machines with days"), tx(t, "mR3_m2r", "compare each column with x only"), tx(t, "mR3_m2", "the arrows say how each quantity moves the unknown, with the others frozen")],
          [tx(t, "mR3_m3w", "a rule of three on a square's area"), "A = s²", tx(t, "mR3_m3", "double the side, four times the area: not proportional")],
          [tx(t, "mR3_m4w", "a rule of three on a fare with a fixed fee"), tx(t, "mR3_m4r", "remove the fixed part first"), tx(t, "mR3_m4", "a fixed part breaks the proportion")],
          [tx(t, "mR3_m5w", "minutes in one row, hours in the other"), tx(t, "mR3_m5r", "one unit per column"), tx(t, "mR3_m5", "the ratios only cancel when both values share a unit")],
          [tx(t, "mR3_m6w", "an answer that is never checked"), tx(t, "mR3_m6r", "recompute the constant"), tx(t, "mR3_m6", "the ratio (direct) or product (inverse) must come out the same for both cases")],
        ]}
      />
      <Callout type="tip" t={t}>
        {tx(t, "mR3_tip", "Before writing any fraction, say the sentence out loud: \"more workers, fewer days\". If the sentence has \"more … more\" or \"less … less\", the arrow goes down; \"more … less\", it goes up. Then check that doubling really doubles or halves.")}
      </Callout>

      <MathPracticeFigure t={t} set="ruleOfThree" />

      <Related t={t} links={[
        { track: "Math", id: "ratios", title: tx(t, "mR3_rel1", "Ratios, Proportion & Percent"), why: tx(t, "mR3_rel1b", "direct and inverse proportion, the constant k, and percentages.") },
        { track: "Math", id: "similarity", title: tx(t, "mR3_rel2", "Similarity"), why: tx(t, "mR3_rel2b", "the sides of similar figures are a direct rule of three; their areas are not.") },
      ]} />

      <KeyIdeas t={t} id="mR3" items={[
        "The rule of three finds a fourth number from three, when the quantities are proportional.",
        "Doubling test: the other doubles → direct (ratio fixed); it halves → inverse (product fixed); anything else → no rule of three.",
        "Direct: a/c = b/x, so x = bc/a. Inverse: flip one ratio, so x = ab/c.",
        "Arrow method: arrow down on x; each other column compared with x alone, down if it moves with x, up if against; up-arrow ratios are flipped.",
        "Compound: the ratio of x's column equals the product of all the other ratios.",
        "It works because one constant ties all the quantities together, and it cancels when the two cases are divided.",
        "Check with the constant: parts per machine-day, metres per worker-hour.",
      ]} />
    </Article>
  );
}

// ── The equations the "moves" figure can transform ────────────────────────────
// Each scenario is a small graph of states. A state is an equation (TeX), its
// two sides as functions of x (NaN where a side is undefined), and its exact
// solutions. A move leads to another state and is labelled safe (the same
// solutions), gain (it may add fake solutions) or lose (it may drop real ones).
// The figure compares every state's solutions with the first state's, so it
// can show which candidates are real, which are fake and which were lost.
// Texts are tx keys (figEqMv_…) with their English.

export type Text = [string, string];
export type MoveKind = "safe" | "gain" | "lose";
export type Move = { label: Text; to: string; kind: MoveKind; why: Text };
export type EqState = {
  tex: string;
  L: (x: number) => number;
  R: (x: number) => number;
  roots: number[];
  moves: Move[];
  /** Shown when the state has no moves left. */
  end?: Text;
};
export type Scenario = {
  id: string;
  name: Text;
  view: { x0: number; x1: number; y0: number; y1: number };
  start: string;
  states: Record<string, EqState>;
};

const only = (ok: (x: number) => boolean, f: (x: number) => number) => (x: number) => (ok(x) ? f(x) : NaN);
const zero = () => 0;
/** Undefined next to x = 2, so the plot leaves a gap there instead of a vertical line. */
const offPole = (f: (x: number) => number) => only(x => Math.abs(x - 2) > 0.04, f);

// ── Squaring both sides ──
const square: Scenario = {
  id: "square",
  name: ["figEqMv_nSquare", "squaring"],
  view: { x0: -3, x1: 4.5, y0: -3, y1: 6 },
  start: "s0",
  states: {
    s0: {
      tex: String.raw`\sqrt{x + 2} = x`, L: x => Math.sqrt(x + 2), R: x => x, roots: [2],
      moves: [
        { label: ["figEqMv_sq", "square both sides"], to: "s1", kind: "gain",
          why: ["figEqMv_sqWhy", "Squaring forgets signs: 2 = −2 is false, but 2² = (−2)² is true. So the new equation also holds wherever √(x + 2) = −x, and those x are fake solutions of the old one."] },
        { label: ["figEqMv_sqC", "square, keeping x ≥ 0"], to: "c1", kind: "safe",
          why: ["figEqMv_sqCWhy", "A square root is never negative, so the right side x must be ≥ 0 too. Squaring two sides that are both ≥ 0 loses nothing and adds nothing, as long as the condition comes along."] },
      ],
    },
    s1: {
      tex: String.raw`x + 2 = x^2`, L: x => x + 2, R: x => x * x, roots: [-1, 2],
      moves: [{ label: ["figEqMv_collect", "move everything to one side"], to: "s2", kind: "safe",
        why: ["figEqMv_collectWhy", "Subtracting the same thing from both sides never changes the solutions."] }],
    },
    s2: {
      tex: String.raw`x^2 - x - 2 = 0`, L: x => x * x - x - 2, R: zero, roots: [-1, 2],
      moves: [{ label: ["figEqMv_factor", "factor"], to: "s3", kind: "safe",
        why: ["figEqMv_factorWhy", "Rewriting one side as an equal expression changes nothing."] }],
    },
    s3: {
      tex: String.raw`(x - 2)(x + 1) = 0`, L: x => (x - 2) * (x + 1), R: zero, roots: [-1, 2], moves: [],
      end: ["figEqMv_sqEnd", "Two candidates, 2 and −1. Check them in the original: √4 = 2 ✓, but √1 = 1, not −1. The red one was created by squaring. After squaring, checking is not optional."],
    },
    c1: {
      tex: String.raw`x + 2 = x^2,\quad x \ge 0`, L: only(x => x >= 0, x => x + 2), R: only(x => x >= 0, x => x * x), roots: [2], moves: [],
      end: ["figEqMv_sqCEnd", "The condition x ≥ 0 removes −1 before it can cause trouble: only x = 2 is left, and it is real."],
    },
  },
};

// ── Dividing by the unknown ──
const divide: Scenario = {
  id: "divide",
  name: ["figEqMv_nDivide", "dividing by x"],
  view: { x0: -2, x1: 5, y0: -4, y1: 12 },
  start: "s0",
  states: {
    s0: {
      tex: String.raw`x^2 = 3x`, L: x => x * x, R: x => 3 * x, roots: [0, 3],
      moves: [
        { label: ["figEqMv_div", "divide both sides by x"], to: "s1", kind: "lose",
          why: ["figEqMv_divWhy", "Dividing by x is only allowed when x ≠ 0. The move quietly assumed it, so the solution x = 0 is thrown away."] },
        { label: ["figEqMv_sub3", "subtract 3x from both sides"], to: "s2", kind: "safe",
          why: ["figEqMv_collectWhy", "Subtracting the same thing from both sides never changes the solutions."] },
      ],
    },
    s1: {
      tex: String.raw`x = 3`, L: x => x, R: () => 3, roots: [3], moves: [],
      end: ["figEqMv_divEnd", "Only 3 is left, but 0² = 3 · 0 is true as well. Never divide by something that could be zero: factor it out instead."],
    },
    s2: {
      tex: String.raw`x^2 - 3x = 0`, L: x => x * x - 3 * x, R: zero, roots: [0, 3],
      moves: [{ label: ["figEqMv_factorX", "factor out x"], to: "s3", kind: "safe",
        why: ["figEqMv_factorWhy", "Rewriting one side as an equal expression changes nothing."] }],
    },
    s3: {
      tex: String.raw`x\,(x - 3) = 0`, L: x => x * (x - 3), R: zero, roots: [0, 3], moves: [],
      end: ["figEqMv_zpEnd", "A product is zero exactly when one of its factors is zero: x = 0 or x − 3 = 0. Both solutions survive."],
    },
  },
};

// ── Multiplying by an expression that can be zero ──
const denom: Scenario = {
  id: "denom",
  name: ["figEqMv_nDenom", "a denominator"],
  view: { x0: -3, x1: 6, y0: -5, y1: 7 },
  start: "s0",
  states: {
    s0: {
      tex: String.raw`\frac{x}{x - 2} = \frac{2}{x - 2}`, L: offPole(x => x / (x - 2)), R: offPole(x => 2 / (x - 2)), roots: [],
      moves: [
        { label: ["figEqMv_mul", "multiply both sides by x − 2"], to: "s1", kind: "gain",
          why: ["figEqMv_mulWhy", "Multiplying by x − 2 is only reversible when x − 2 ≠ 0. At x = 2 it turns two undefined sides into equal numbers, which can create a solution."] },
        { label: ["figEqMv_mulC", "note x ≠ 2, then multiply"], to: "c1", kind: "safe",
          why: ["figEqMv_mulCWhy", "Write down the values that make a denominator zero before clearing it. With x ≠ 2 kept, multiplying by x − 2 is reversible."] },
      ],
    },
    s1: {
      tex: String.raw`x = 2`, L: x => x, R: () => 2, roots: [2], moves: [],
      end: ["figEqMv_mulEnd", "x = 2 looks like a solution, but put it in the original: both denominators become 2 − 2 = 0, and division by zero has no value. The original has no solution at all: its two curves never meet."],
    },
    c1: {
      tex: String.raw`x = 2,\quad x \ne 2`, L: offPole(x => x), R: offPole(() => 2), roots: [], moves: [],
      end: ["figEqMv_mulCEnd", "The only candidate is the one value that was ruled out. So the equation has no solution, and the condition said so in one line."],
    },
  },
};

// ── Taking a square root ──
const root: Scenario = {
  id: "root",
  name: ["figEqMv_nRoot", "square roots"],
  view: { x0: -5, x1: 5, y0: -2, y1: 12 },
  start: "s0",
  states: {
    s0: {
      tex: String.raw`x^2 = 9`, L: x => x * x, R: () => 9, roots: [-3, 3],
      moves: [
        { label: ["figEqMv_rt", "square root: x = 3"], to: "s1", kind: "lose",
          why: ["figEqMv_rtWhy", "√9 means the positive root, 3. But (−3)² = 9 too: √(x²) is |x|, not x."] },
        { label: ["figEqMv_rtPm", "square root, both signs: x = ±3"], to: "s2", kind: "safe",
          why: ["figEqMv_rtPmWhy", "√(x²) = |x|, so the honest result is |x| = 3, which means x = 3 or x = −3."] },
        { label: ["figEqMv_rtFac", "subtract 9 and factor"], to: "s3", kind: "safe",
          why: ["figEqMv_rtFacWhy", "x² − 9 is a difference of squares, (x − 3)(x + 3). No root is taken, so no sign can be forgotten."] },
      ],
    },
    s1: {
      tex: String.raw`x = 3`, L: x => x, R: () => 3, roots: [3], moves: [],
      end: ["figEqMv_rtEnd", "−3 is lost. Whenever you take the square root of both sides, write ±."],
    },
    s2: {
      tex: String.raw`x = \pm 3 \quad(\,|x| = 3\,)`, L: x => Math.abs(x), R: () => 3, roots: [-3, 3], moves: [],
      end: ["figEqMv_rtPmEnd", "The drawing shows |x| = 3, the same claim as x = ±3: both solutions survive."],
    },
    s3: {
      tex: String.raw`(x - 3)(x + 3) = 0`, L: x => (x - 3) * (x + 3), R: zero, roots: [-3, 3], moves: [],
      end: ["figEqMv_zpEnd2", "A product is zero when one factor is: x = 3 or x = −3."],
    },
  },
};

export const EQ_SCENARIOS = { square, divide, denom, root } as const;
export type ScenarioId = keyof typeof EQ_SCENARIOS;

export type RootMark = { x: number; status: "real" | "fake" | "lost" };

/** Every candidate of a state, compared with the solutions of the scenario's first equation. */
export function rootMarks(sc: Scenario, stateId: string): RootMark[] {
  const orig = sc.states[sc.start].roots, now = sc.states[stateId].roots;
  const has = (xs: number[], x: number) => xs.some(y => Math.abs(y - x) < 1e-9);
  return [
    ...now.map(x => ({ x, status: has(orig, x) ? "real" as const : "fake" as const })),
    ...orig.filter(x => !has(now, x)).map(x => ({ x, status: "lost" as const })),
  ].sort((a, b) => a.x - b.x);
}

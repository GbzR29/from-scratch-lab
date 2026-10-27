// ── Practice generators: combinatorics ────────────────────────────────────────
// One generator per chapter of the Combinatorics section: the counting
// principles (stages that multiply, alternatives that add), factorials,
// permutations (rows, repeated letters, round tables, blocks), arrangements
// (podiums, digits with restrictions, even and odd numbers), combinations
// (committees, two groups, "at least one", points and diagonals) and the
// harder counts (stars and bars, positive solutions, labelled groups,
// derangements). The story is in the translated instruction (`ask`); the TeX
// holds only numbers and symbols, so nothing in it needs translating. Every
// answer is computed from the numbers the question shows.

import { fr } from "./frac";
import { pick, ri, type Gen, type Level, type Problem } from "./problem";

const amber = (s: string | number) => `\\amber{${s}}`;
const num = (x: number) => ({ label: "", answer: { kind: "num" as const, value: fr(x) } });
const fact = (n: number) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const perm = (n: number, k: number) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
const choose = (n: number, k: number) => (k < 0 || k > n ? 0 : Math.round(perm(n, k) / fact(k)));
/** "8 \cdot 7 \cdot 6": k factors counting down from n. */
const down = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).join(" \\cdot ");

// ── 1. The counting principles ──
export const cntPrinciple: Gen = (lv: Level): Problem => {
  if (lv === 1) {
    const a = ri(2, 6), b = ri(2, 6), c = ri(2, 4), ans = a * b * c;
    return {
      key: `cp1:${a}:${b}:${c}`, ask: ["mpr_cntOutfit", "a shirts, b trousers and c pairs of shoes: how many outfits with one of each?"],
      tex: `a = ${a},\\quad b = ${b},\\quad c = ${c}`,
      steps: [`a \\cdot b \\cdot c`, `${a} \\cdot ${b} \\cdot ${c} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  if (lv === 2) {
    const a = ri(2, 6), b = ri(1, 4), c = ri(2, 5), ans = (a + b) * c;
    return {
      key: `cp2:${a}:${b}:${c}`, ask: ["mpr_cntTrip", "To go: one of a buses or one of b trains. To come back: one of c flights. How many round trips?"],
      tex: `a = ${a},\\quad b = ${b},\\quad c = ${c}`,
      steps: [`(a + b) \\cdot c`, `(${a} + ${b}) \\cdot ${c} = ${a + b} \\cdot ${c} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  const L = ri(2, 3), D = ri(2, 4), ans = perm(26, L) * 10 ** D;
  return {
    key: `cp3:${L}:${D}`, ask: ["mpr_cntCode", "A code is L different letters (of 26) followed by D digits (repeats allowed). How many codes?"],
    tex: `L = ${L},\\quad D = ${D}`,
    steps: [`${down(26, L)} = ${perm(26, L)}`, `10^{${D}} = ${10 ** D}`, `${perm(26, L)} \\cdot ${10 ** D} = ${amber(ans)}`],
    short: `${ans}`, fields: [num(ans)],
  };
};

// ── 2. Factorials ──
export const cntFactorial: Gen = (lv: Level): Problem => {
  if (lv === 1) {
    const n = ri(5, 12), k = ri(1, 3), ans = perm(n, k);
    return {
      key: `cf1:${n}:${k}`, ask: ["mpr_cntFact", "Compute it without working out the big factorials"],
      tex: `\\frac{${n}!}{${n - k}!}`,
      steps: [`${n}! = ${down(n, k)} \\cdot ${n - k}!`, `\\frac{${n}!}{${n - k}!} = ${down(n, k)} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  if (lv === 2) {
    const n = ri(5, 10), k = ri(2, 4), ans = choose(n, k);
    return {
      key: `cf2:${n}:${k}`, ask: ["mpr_cntFact", "Compute it without working out the big factorials"],
      tex: `\\frac{${n}!}{${k}!\\,${n - k}!}`,
      steps: [`= \\frac{${down(n, k)}}{${down(k, k)}}`, `= \\frac{${perm(n, k)}}{${fact(k)}} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  const n = ri(4, 15), v = n * (n - 1);
  return {
    key: `cf3:${n}`, ask: ["mpr_cntFactN", "Find the whole number n"],
    tex: `\\frac{n!}{(n-2)!} = ${v}`,
    steps: [`\\frac{n!}{(n-2)!} = n\\,(n-1)`, `n\\,(n-1) = ${v} = ${n} \\cdot ${n - 1}`, `n = ${amber(n)}`],
    short: `n = ${n}`, fields: [num(n)],
  };
};

// ── 3. Permutations ──
export const cntPerm: Gen = (lv: Level): Problem => {
  if (lv === 1) {
    const n = ri(3, 8), ans = fact(n);
    return {
      key: `pp1:${n}`, ask: ["mpr_cntRow", "In how many orders can n different people stand in a row?"],
      tex: `n = ${n}`, steps: [`P_{${n}} = ${n}! = ${down(n, n)} = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
    };
  }
  if (lv === 2) {
    const reps = pick([[2, 1, 1], [2, 2, 1], [3, 1, 1], [3, 2, 1], [2, 2, 2], [3, 2], [4, 2], [3, 3], [2, 2, 1, 1], [3, 1, 1, 1]]);
    const letters = reps.map((c, i) => "ABCD"[i].repeat(c)).join("");
    const n = letters.length, den = reps.reduce((p, c) => p * fact(c), 1), ans = fact(n) / den;
    const denTex = reps.filter(c => c > 1).map(c => `${c}!`).join("\\,");
    return {
      key: `pp2:${letters}`, ask: ["mpr_cntAnagram", "How many different words (anagrams) use exactly these letters?"],
      tex: `\\mathrm{${letters.split("").join("\\,")}}`,
      steps: [`\\frac{${n}!}{${denTex}} = \\frac{${fact(n)}}{${den}} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  if (Math.random() < 0.5) {
    const n = ri(4, 9), ans = fact(n - 1);
    return {
      key: `pp3:${n}`, ask: ["mpr_cntRound", "In how many ways can n people sit around a round table, if turning everyone together counts as the same?"],
      tex: `n = ${n}`, steps: [`(PC)_{${n}} = (n - 1)! = ${n - 1}! = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
    };
  }
  const n = ri(4, 8), ans = 2 * fact(n - 1);
  return {
    key: `pp4:${n}`, ask: ["mpr_cntBlock", "n people stand in a row, and two of them must stand side by side. How many orders?"],
    tex: `n = ${n}`,
    steps: [`(n - 1)! \\cdot 2!`, `${n - 1}! \\cdot 2 = ${fact(n - 1)} \\cdot 2 = ${amber(ans)}`],
    short: `${ans}`, fields: [num(ans)],
  };
};

// ── 4. Arrangements ──
export const cntArr: Gen = (lv: Level): Problem => {
  if (lv === 1) {
    const n = ri(5, 14), k = ri(2, 3), ans = perm(n, k);
    return {
      key: `pa1:${n}:${k}`, ask: k === 3 ? ["mpr_cntPodium", "n runners: in how many ways can gold, silver and bronze be given?"] : ["mpr_cntPair", "n people: in how many ways can a president and a vice-president be chosen?"],
      tex: `n = ${n}`, steps: [`A_{${n},${k}} = \\frac{${n}!}{${n - k}!} = ${down(n, k)} = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
    };
  }
  if (lv === 2) {
    const k = ri(3, 5), ans = 9 * perm(9, k - 1);
    return {
      key: `pa2:${k}`, ask: ["mpr_cntDigits", "How many k-digit numbers have all their digits different?"],
      tex: `k = ${k}`,
      steps: [`\\underbrace{9}_{\\ne 0} \\cdot ${down(9, k - 1)}`, `= ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  const k = ri(3, 4);
  if (Math.random() < 0.5) {
    const a = perm(9, k - 1), b = 8 * perm(8, k - 2) * 4, ans = a + b;
    return {
      key: `pa3e:${k}`, ask: ["mpr_cntEven", "How many even k-digit numbers have all their digits different?"],
      tex: `k = ${k}`,
      steps: [
        `\\ldots 0:\\quad ${down(9, k - 1)} = ${a}`,
        `\\ldots 2, 4, 6, 8:\\quad \\underbrace{8}_{\\ne 0}${k > 3 ? ` \\cdot ${down(8, k - 2)}` : " \\cdot 8"} \\cdot \\underbrace{4}_{\\text{2,4,6,8}} = ${b}`,
        `${a} + ${b} = ${amber(ans)}`,
      ],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  const ans = 8 * perm(8, k - 2) * 5;
  return {
    key: `pa3o:${k}`, ask: ["mpr_cntOdd", "How many odd k-digit numbers have all their digits different?"],
    tex: `k = ${k}`,
    steps: [`\\underbrace{8}_{\\ne 0} \\cdot ${down(8, k - 2)} \\cdot \\underbrace{5}_{1,3,5,7,9}`, `= ${amber(ans)}`],
    short: `${ans}`, fields: [num(ans)],
  };
};

// ── 5. Combinations ──
export const cntComb: Gen = (lv: Level): Problem => {
  if (lv === 1) {
    const n = ri(5, 15), k = ri(2, 4), ans = choose(n, k);
    return {
      key: `cc1:${n}:${k}`, ask: ["mpr_cntCommittee", "How many committees of k people can be chosen from n?"],
      tex: `n = ${n},\\quad k = ${k}`,
      steps: [`C_{${n},${k}} = \\frac{${down(n, k)}}{${k}!}`, `= \\frac{${perm(n, k)}}{${fact(k)}} = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
    };
  }
  if (lv === 2) {
    if (Math.random() < 0.4) {
      const n = ri(5, 12);
      if (Math.random() < 0.5) {
        const ans = choose(n, 3);
        return {
          key: `cc2t:${n}`, ask: ["mpr_cntTri", "n points on a circle: how many triangles have all three corners among them?"],
          tex: `n = ${n}`, steps: [`C_{${n},3} = \\frac{${down(n, 3)}}{6} = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
        };
      }
      const ans = (n * (n - 3)) / 2;
      return {
        key: `cc2d:${n}`, ask: ["mpr_cntDiag", "How many diagonals does a convex polygon with n sides have?"],
        tex: `n = ${n}`, steps: [`C_{${n},2} - ${n} = ${choose(n, 2)} - ${n} = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
      };
    }
    const w = ri(4, 8), m = ri(3, 7), a = ri(1, 3), b = ri(1, 3), ans = choose(w, a) * choose(m, b);
    return {
      key: `cc2:${w}:${m}:${a}:${b}`, ask: ["mpr_cntTwo", "From w women and m men, choose a women and b men. How many groups?"],
      tex: `w = ${w},\\ m = ${m},\\quad a = ${a},\\ b = ${b}`,
      steps: [`C_{${w},${a}} \\cdot C_{${m},${b}}`, `${choose(w, a)} \\cdot ${choose(m, b)} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  const w = ri(4, 8), m = ri(2, 5), k = ri(3, Math.min(5, w)), all = choose(w + m, k), none = choose(w, k), ans = all - none;
  return {
    key: `cc3:${w}:${m}:${k}`, ask: ["mpr_cntAtLeast", "From w women and m men, how many committees of k have at least one man?"],
    tex: `w = ${w},\\ m = ${m},\\quad k = ${k}`,
    steps: [`C_{${w + m},${k}} - C_{${w},${k}}`, `${all} - ${none} = ${amber(ans)}`],
    short: `${ans}`, fields: [num(ans)],
  };
};

// ── 6. Harder counts ──
export const cntAdvanced: Gen = (lv: Level): Problem => {
  if (lv === 1) {
    const n = ri(3, 6), k = ri(2, 6), ans = choose(n + k - 1, k);
    return {
      key: `ca1:${n}:${k}`, ask: ["mpr_cntScoops", "n flavours, k scoops in a cup, repeats allowed, order ignored. How many different cups?"],
      tex: `n = ${n},\\quad k = ${k}`,
      steps: [`\\underbrace{${k}}_{\\star}\\ +\\ \\underbrace{${n - 1}}_{|}\\ = ${n + k - 1}`, `C_{${n + k - 1},${k}} = ${amber(ans)}`], short: `${ans}`, fields: [num(ans)],
    };
  }
  if (lv === 2) {
    const v = ri(3, 4), s = ri(v + 2, 12), pos = Math.random() < 0.5;
    const ans = pos ? choose(s - 1, v - 1) : choose(s + v - 1, v - 1);
    const vars = ["x", "y", "z", "w"].slice(0, v);
    return {
      key: `ca2:${v}:${s}:${pos}`, ask: pos ? ["mpr_cntPos", "How many solutions in whole numbers, each at least 1?"] : ["mpr_cntNonneg", "How many solutions in whole numbers, each at least 0?"],
      tex: `${vars.join(" + ")} = ${s}`,
      steps: pos
        ? [`${vars.map(x => `${x}'`).join(" + ")} = ${s} - ${v} = ${s - v} \\quad (${vars[0]}' = ${vars[0]} - 1 \\ge 0)`, `C_{${s - v} + ${v - 1},\\,${v - 1}} = C_{${s - 1},${v - 1}} = ${amber(ans)}`]
        : [`\\underbrace{${s}}_{\\star}\\ +\\ \\underbrace{${v - 1}}_{|}`, `C_{${s + v - 1},${v - 1}} = ${amber(ans)}`],
      short: `${ans}`, fields: [num(ans)],
    };
  }
  if (Math.random() < 0.5) {
    const n = ri(3, 6), D = [1, 0, 1, 2, 9, 44, 265][n];
    return {
      key: `ca3d:${n}`, ask: ["mpr_cntDerange", "n letters are put at random into n addressed envelopes. In how many ways does no letter reach its own envelope?"],
      tex: `n = ${n}`,
      steps: [`D_n = n!\\left(1 - \\frac{1}{1!} + \\frac{1}{2!} - \\cdots \\pm \\frac{1}{n!}\\right)`, `D_{${n}} = ${amber(D)}`], short: `${D}`, fields: [num(D)],
    };
  }
  const sizes = pick([[3, 3, 2], [2, 2, 2], [3, 2, 1], [4, 2, 2], [3, 3, 3], [4, 3, 1]]);
  const n = sizes.reduce((a, b) => a + b, 0), ans = fact(n) / sizes.reduce((p, c) => p * fact(c), 1);
  return {
    key: `ca3g:${sizes.join(":")}`, ask: ["mpr_cntGroups", "a + b + c different gifts go to three children: the first gets a, the second b, the third c. How many ways?"],
    tex: `a = ${sizes[0]},\\ b = ${sizes[1]},\\ c = ${sizes[2]}`,
    steps: [
      `C_{${n},${sizes[0]}} \\cdot C_{${n - sizes[0]},${sizes[1]}} \\cdot C_{${sizes[2]},${sizes[2]}}`,
      `= ${choose(n, sizes[0])} \\cdot ${choose(n - sizes[0], sizes[1])} \\cdot 1 = ${amber(ans)}`,
    ],
    short: `${ans}`, fields: [num(ans)],
  };
};

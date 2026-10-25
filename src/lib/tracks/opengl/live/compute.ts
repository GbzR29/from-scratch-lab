// ── Live formulas of "Compute Shaders" ────────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { big, r } from "./fmt";

type V = Record<string, number>;

/** Passes of a group-wise reduction: n values, G per group, until one is left. */
export const reduceNumbers = (t: TrackTranslations) => ({ e, G }: V) => {
  const n = Math.round(10 ** e);
  const rows: string[] = [];
  let m = n, passes = 0;
  while (m > 1 && passes < 8) {
    const next = Math.ceil(m / G);
    rows.push(r`&\text{${tx(t, "oglCompute_livePass", "pass")} ${passes + 1}:}\ \Big\lceil \frac{${big(m)}}{${G}} \Big\rceil = ${big(next)}`);
    m = next; passes++;
  }
  return {
    tex: r`\begin{aligned} ${rows.join(" \\\\ ")} \\[3pt] &\amber{${passes}\ \text{${tx(t, "oglCompute_livePasses", "dispatches")}}} = \lceil \log_{${G}} ${big(n)} \rceil \end{aligned}`,
  };
};

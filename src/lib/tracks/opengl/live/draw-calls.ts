// ── Live formulas of "Draw Calls & State" ─────────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { big, num, r } from "./fmt";

type V = Record<string, number>;

/** CPU time spent issuing draws: count × cost per draw, before and after merging k draws into one. */
export const drawCostNumbers = (t: TrackTranslations) => ({ n, us, k }: V) => {
  const ms = (n * us) / 1000, merged = Math.ceil(n / k), ms2 = (merged * us) / 1000;
  return {
    tex: r`\begin{aligned} &T_{draws} = ${big(n)} \times ${num(us, 1)}\ \mu\text{s} = ${num(ms, 2)}\ \text{ms} \\[4pt] &\text{${tx(t, "oglDraw_liveMerged", "merged")}}: \lceil ${big(n)} / ${num(k, 0)} \rceil = ${big(merged)}\ \text{${tx(t, "oglDraw_liveDraws", "draws")}} \;\Rightarrow\; \amber{${num(ms2, 2)}\ \text{ms}} \end{aligned}`,
    meter: ms2 / (1000 / 60),
    meterLabel: tx(t, "oglDraw_liveMeter", "of the 16.7 ms frame") + ` · ${num((ms2 / (1000 / 60)) * 100, 0)}%`,
  };
};

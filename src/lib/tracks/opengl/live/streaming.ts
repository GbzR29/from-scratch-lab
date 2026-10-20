// ── Live formulas of "Buffer Streaming & Sync" ────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { big, r } from "./fmt";

type V = Record<string, number>;

/** Ring of N regions: where frame i writes, and whether the fence it waits on can still be pending. */
export const ringNumbers = (t: TrackTranslations) => ({ i, N, S, F }: V) => {
  const k = i % N, sa = Math.ceil(S / 256) * 256, j = i - N;
  const wait = j >= 0 && j >= i - F, frame = tx(t, "oglStream_liveFrame", "frame");
  const fence = j < 0
    ? r`\text{${tx(t, "oglStream_liveNoFence", "no fence yet: first pass over the ring")}}`
    : r`\text{fence}(${j}):\ ${wait
      ? r`\red{\text{${frame} ${j} ${tx(t, "oglStream_liveMayRun", "may still be running")}} \Rightarrow \text{${tx(t, "oglStream_liveStall", "CPU waits")}}}`
      : r`\green{\text{${frame} ${j} ${tx(t, "oglStream_liveFinished", "finished long ago")}} \Rightarrow \text{${tx(t, "oglStream_liveNoWait", "no wait")}}}`}`;
  return {
    tex: r`\begin{aligned} &\text{region} = ${i} \bmod ${N} = \amber{${k}} \qquad S = \lceil ${big(S)} / 256 \rceil \cdot 256 = ${big(sa)}\ \text{B} \\[4pt] &\text{offset} = ${big(sa)} \cdot ${k} = ${big(sa * k)}\ \text{B} \\[4pt] &${fence} \end{aligned}`,
  };
};

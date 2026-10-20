// ── Live formulas of "Face Winding & Culling" ─────────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "./fmt";

type V = Record<string, number>;

const RAD = Math.PI / 180;

/** Normal-cone test: the view direction th degrees from the cone axis, half-angle al. */
export const coneNumbers = (t: TrackTranslations) => ({ th, al }: V) => {
  const c = Math.cos(th * RAD), s = Math.sin(al * RAD), cull = c >= s - 1e-9;
  const verdict = cull
    ? r`\green{\text{${tx(t, "ch10_liveCull", "cull the whole cluster")}}}`
    : r`\red{\text{${tx(t, "ch10_liveKeep", "keep: some triangle may face the camera")}}}`;
  return {
    tex: r`\begin{aligned} &\hat{\mathbf v}\cdot\mathbf a = \cos ${num(th, 0)}^\circ = ${num(c, 3)} \qquad \sin ${num(al, 0)}^\circ = ${num(s, 3)} \\[4pt] &${num(c, 3)} ${cull ? r`\ge` : "<"} ${num(s, 3)} \;\Rightarrow\; ${verdict} \\[4pt] &\text{${tx(t, "ch10_liveWorst", "worst triangle")}}: ${num(th, 0)}^\circ + ${num(al, 0)}^\circ = ${num(th + al, 0)}^\circ\ ${th + al <= 90 + 1e-9 ? r`\le` : ">"}\ 90^\circ \end{aligned}`,
  };
};

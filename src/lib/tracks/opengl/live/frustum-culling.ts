// ── Live formulas of "Frustum & Occlusion Culling" ────────────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "./fmt";

type V = Record<string, number>;

const RAD = Math.PI / 180;

/** One plane, one box: the AABB's projected radius against its bounding sphere's radius. */
export const boxNumbers = (t: TrackTranslations) => ({ s, phi, ex, ey }: V) => {
  const nx = Math.abs(Math.cos(phi * RAD)), ny = Math.abs(Math.sin(phi * RAD));
  const box = ex * nx + ey * ny, rho = Math.hypot(ex, ey);
  const out = tx(t, "oglCull_liveOut", "culled"), keep = tx(t, "oglCull_liveIn", "drawn");
  const v = (lim: number) => (s < -lim ? r`\green{\text{${out}}}` : r`\red{\text{${keep}}}`);
  return {
    tex: r`\begin{aligned} &\text{AABB}: & &\mathbf e\cdot|\mathbf n| = ${num(ex, 1)} \cdot ${num(nx, 3)} + ${num(ey, 1)} \cdot ${num(ny, 3)} = ${num(box, 2)} \\ & & &${num(s, 1)} ${s < -box ? "<" : r`\ge`} -${num(box, 2)} \;\Rightarrow\; ${v(box)} \\[6pt] &\text{${tx(t, "oglCull_liveSphere", "sphere")}}: & &\rho = \sqrt{${num(ex, 1)}^2 + ${num(ey, 1)}^2} = ${num(rho, 2)} \\ & & &${num(s, 1)} ${s < -rho ? "<" : r`\ge`} -${num(rho, 2)} \;\Rightarrow\; ${v(rho)} \end{aligned}`,
  };
};

/** Which Hi-Z level a screen rectangle is tested at, and how many texels it can touch there. */
export const hizNumbers = (t: TrackTranslations) => ({ w, h }: V) => {
  const m = Math.max(w, h), l = Math.ceil(Math.log2(m) - 1e-9), size = 2 ** l;
  const span = (k: number) => Math.ceil(m / 2 ** k - 1e-9) + 1;   // a W-texel-wide span, placed anywhere, touches ⌈W⌉ + 1 texels
  return {
    tex: r`\begin{aligned} &\ell = \lceil \log_2 ${num(m, 0)} \rceil = \lceil ${num(Math.log2(m), 2)} \rceil = \amber{${l}} \qquad \text{${tx(t, "oglCull_liveTexel", "one texel")}} = 2^{${l}} = ${size}\ \text{px} \\[4pt] &R = ${num(w / size, 2)} \times ${num(h / size, 2)}\ \text{texels} \le 1 \;\Rightarrow\; \text{${tx(t, "oglCull_liveAtMost", "touches at most")}}\ 2 \times 2 \\[4pt] &\text{${tx(t, "oglCull_liveOneFiner", "one level finer")}}\ (\ell = ${l - 1}): \ \text{${tx(t, "oglCull_liveUpTo", "up to")}}\ ${span(l - 1)} \times ${span(l - 1)}\ \text{texels} \end{aligned}`,
  };
};

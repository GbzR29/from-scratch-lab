// ── Live formulas of "Mipmapping & Texture Compression" ───────────────────────

import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { num, r } from "./fmt";

type V = Record<string, number>;

/** Trilinear and anisotropic mip selection for a footprint of px × py texels. */
export const lambdaNumbers = (t: TrackTranslations) => ({ px, py, A }: V) => {
  const hi = Math.max(px, py), lo = Math.min(px, py);
  const lt = Math.max(0, Math.log2(hi)), n = Math.min(Math.ceil(hi / lo - 1e-9), A), la = Math.max(0, Math.log2(hi / n));
  const blend = (l: number) => r`${Math.floor(l)}\ \&\ ${Math.floor(l) + 1},\ ${num((l - Math.floor(l)) * 100, 0)}\%`;
  return {
    tex: r`\begin{aligned} &\text{${tx(t, "oglTexc_liveTri", "trilinear")}}: & &\lambda = \log_2 ${num(hi, 2)} = ${num(lt, 2)} \quad (${blend(lt)}) \\[4pt] &\text{${tx(t, "oglTexc_liveAniso", "anisotropic")}}: & &n = \min(\lceil ${num(hi / lo, 2)} \rceil,\ ${num(A, 0)}) = ${n} \quad \lambda = \log_2 \tfrac{${num(hi, 2)}}{${n}} = \amber{${num(la, 2)}} \end{aligned}`,
  };
};

const FORMATS = [["RGBA8", 32], ["BC7", 8], ["BC1", 4]] as const;

/** Memory of one square texture of 2^k texels per side in a given format, with or without mips. */
export const memNumbers = ({ k, f, mips }: V) => {
  const N = 2 ** k, [name, bpp] = FORMATS[f], base = (N * N * bpp) / 8, total = mips ? (base * 4) / 3 : base;
  const mib = (b: number) => (b >= 1 << 20 ? `${num(b / (1 << 20), 1)}\\ \\text{MiB}` : `${num(b / 1024, 1)}\\ \\text{KiB}`);
  return {
    tex: r`\text{${name}}: \ ${N}^2 \cdot \frac{${bpp}}{8} ${mips ? r`\cdot \frac43` : ""} = \amber{${mib(total)}}`,
  };
};

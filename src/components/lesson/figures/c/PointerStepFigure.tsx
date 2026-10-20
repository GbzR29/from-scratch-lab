"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Readout, Row, Slider, C, T } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Pointer arithmetic is counted in elements, not bytes. The same 16 bytes of
// memory hold an array of the chosen type (char[16], short[8], int[4] or
// double[2], filled with sample values and encoded little-endian, as on x86
// and ARM). The slider sets i: p + i lands sizeof(T) × i bytes after a, and
// the bytes of a[i] = *(a + i) light up. i = n is "one past the end": a
// valid address to compare with, never to read. Beyond that is out of
// bounds (the break-it end of the slider): undefined behaviour.

const W = 560, H = 190, BASE = 0x2000, NB = 16;
type Ty = "char" | "short" | "int" | "double";
const SIZE: Record<Ty, number> = { char: 1, short: 2, int: 4, double: 8 };
const DATA: Record<Ty, number[]> = {
  char: [..."pointers in C!\n"].map(c => c.charCodeAt(0)).concat(0),
  short: [300, -2, 7, 1000, 42, -1, 5, 9],
  int: [3, 1, 4, 1],
  double: [3.14, 2.72],
};

export function PointerStepFigure({ t }: { t?: TrackTranslations }) {
  const [ty, setTy] = useState<Ty>("int");
  const [i, setI] = useState(1);
  const size = SIZE[ty], n = NB / size;
  const bytes = useMemo(() => {
    const dv = new DataView(new ArrayBuffer(NB));
    DATA[ty].forEach((v, k) => {
      if (ty === "char") dv.setUint8(k, v);
      else if (ty === "short") dv.setInt16(k * 2, v, true);
      else if (ty === "int") dv.setInt32(k * 4, v, true);
      else dv.setFloat64(k * 8, v, true);
    });
    return Array.from({ length: NB }, (_, k) => dv.getUint8(k));
  }, [ty]);
  const ii = Math.min(i, n + 2);
  const addr = BASE + ii * size;
  const inside = ii < n, edge = ii === n;
  const shown = (v: number) => (ty === "char" ? (v === 10 ? "'\\n'" : v === 0 ? "'\\0'" : `'${String.fromCharCode(v)}'`) : String(v));

  const CW = 30, X0 = 20, Y0 = 70;
  const col = inside ? C.amber : edge ? C.sky : C.red;

  return (
    <Figure title={tx(t, "figCPtrS_title", "p + i moves i elements: pointer arithmetic by type")}
      controls={<>
        <Row>
          <Choice value={ty} onChange={v => { setTy(v); setI(1); }} options={(["char", "short", "int", "double"] as Ty[]).map(k => [k, `${k} a[${NB / SIZE[k]}]`] as const)} />
        </Row>
        <Slider label="i" value={i} min={0} max={n + 2} step={1} onChange={setI} fmt={v => String(v)} width="w-40" />
        <Row>
          <Readout>{`sizeof(${ty}) = ${size}`}</Readout>
          <Readout color={col}>{`a + ${ii} = 0x${BASE.toString(16)} + ${ii} × ${size} = 0x${addr.toString(16)}`}</Readout>
          <Readout color={col}>{inside
            ? `a[${ii}] = *(a + ${ii}) = ${shown(DATA[ty][ii])}`
            : edge ? tx(t, "figCPtrS_edge", "one past the end: fine to compare (p != a + n), never to read")
              : tx(t, "figCPtrS_out", "out of bounds: reading here is undefined behaviour (garbage, a crash, or silent damage)")}</Readout>
        </Row>
      </>}
      note={tx(t, "figCPtrS_note", "The same 16 bytes, seen through four types. Pick int: a + 1 is 4 bytes after a, because one int takes 4 bytes. Pick double: a + 1 is 8 bytes on, and the array has only two elements. Pick char: one byte per step. You never multiply by the size yourself; the type of the pointer tells the compiler how far one step is, and that is why a[i] and *(a + i) are the same thing. Notice too that numbers are stored lowest byte first (little-endian): the int 3 is the bytes 03 00 00 00. Slide i to n: that address, one past the end, is legal to form and to compare against, which is how loops stop. Slide further and you are reading memory that belongs to something else. C does not check: it is your job to stay inside.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {bytes.map((b, k) => {
          const el = Math.floor(k / size), hot = inside && el === ii;
          return (
            <g key={k}>
              <rect x={X0 + k * CW} y={Y0} width={CW - 2} height={34} rx={3} fill={hot ? C.amber : el % 2 ? C.bg : C.grid} opacity={hot ? 0.85 : 1} stroke={C.axis} strokeWidth={0.6} />
              <T x={X0 + k * CW + CW / 2 - 1} y={Y0 + 21} anchor="middle" size={9} color={hot ? "#fff" : C.fg}>{b.toString(16).padStart(2, "0")}</T>
              {k % size === 0 && <T x={X0 + k * CW + 2} y={Y0 + 48} size={7.5}>{`[${el}]`}</T>}
              {k % 4 === 0 && <T x={X0 + k * CW + 2} y={Y0 - 6} size={7}>{`${(BASE + k).toString(16)}`}</T>}
            </g>
          );
        })}
        {/* the pointer a + i */}
        {(() => {
          const x = X0 + Math.min(ii * size, NB) * CW + (ii * size > NB ? 20 : 0);
          return (
            <g>
              <line x1={x} y1={Y0 + 70} x2={x} y2={Y0 + 38} stroke={col} strokeWidth={2} />
              <path d={`M${x - 5},${Y0 + 46} L${x},${Y0 + 38} L${x + 5},${Y0 + 46}`} fill="none" stroke={col} strokeWidth={2} />
              <T x={x + 4} y={Y0 + 82} size={9} color={col} bold>{`a + ${ii}`}</T>
            </g>
          );
        })()}
        {ii * size > NB && <rect x={X0 + NB * CW} y={Y0} width={40} height={34} rx={3} fill={C.red} opacity={0.15} stroke={C.red} strokeDasharray="3 3" />}
        <T x={X0} y={22} size={8.5} color={C.fg}>{`${ty} a[${n}];   ${ty} *p = a;`}</T>
        <T x={X0} y={36} size={8}>{tx(t, "figCPtrS_bytes", "16 bytes of memory, in hex; shading alternates element by element")}</T>
      </svg>
    </Figure>
  );
}

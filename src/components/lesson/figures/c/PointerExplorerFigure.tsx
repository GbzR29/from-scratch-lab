"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Readout, Row, C, T } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Four variables in memory, each a box with its address:
//   int x = 42;  int y = 7;  int *p = &x;  int **pp = &p;
// Pick an expression (x, &x, p, *p, &p, pp, *pp, **pp): the figure says what
// it means, its type and value, and outlines the box it names (if it names
// one). Arrows show where each pointer points. "p = &y" retargets p, "*p = 99"
// writes through it into whichever box p points at.
// Break it: "p = NULL" or "p never set" make *p a read of a box that does
// not exist: a crash (address 0 is never mapped) or a garbage read.

const W = 560, H = 210;
type State = "x" | "y" | "null" | "junk";
type Expr = "x" | "&x" | "p" | "*p" | "&p" | "pp" | "*pp" | "**pp";
const ADDR = { x: 0x1000, y: 0x1004, p: 0x1008, pp: 0x1010 } as const;
const BOX = { x: { at: 30, w: 90 }, y: { at: 140, w: 90 }, p: { at: 250, w: 140 }, pp: { at: 410, w: 140 } } as const;
const hex = (a: number) => `0x${a.toString(16)}`;
const JUNK = 0x7ffd3a9c;

export function PointerExplorerFigure({ t }: { t?: TrackTranslations }) {
  const [vals, setVals] = useState({ x: 42, y: 7 });
  const [target, setTarget] = useState<State>("x");
  const [expr, setExpr] = useState<Expr>("*p");
  const pVal = target === "x" ? ADDR.x : target === "y" ? ADDR.y : target === "null" ? 0 : JUNK;
  const pointee = target === "x" || target === "y" ? target : null;

  // what each expression names
  const deref = (): { box: keyof typeof BOX | null; value: string; type: string; text: string; bad?: boolean } => {
    const crash = target === "null"
      ? tx(t, "figCPtrX_null", "p holds address 0 (NULL). No box lives there: the program crashes (segmentation fault)")
      : tx(t, "figCPtrX_junk", "p was never set, so it holds whatever bits were left in its box. *p reads a random address: garbage, or a crash. Undefined behaviour")
    switch (expr) {
      case "x": return { box: "x", value: String(vals.x), type: "int", text: tx(t, "figCPtrX_eX", "the box x itself, read as a number") };
      case "&x": return { box: null, value: hex(ADDR.x), type: "int *", text: tx(t, "figCPtrX_eAx", "the address of x: where its box starts. Not a box, just a number you can store") };
      case "p": return { box: "p", value: hex(pVal), type: "int *", text: tx(t, "figCPtrX_eP", "the box p, which holds an address") };
      case "*p":
      case "**pp":
        if (!pointee) return { box: null, value: "?", type: "int", text: crash, bad: true };
        return { box: pointee, value: String(vals[pointee]), type: "int", text: `${expr === "**pp" ? tx(t, "figCPtrX_ePP2", "follow pp to p, then p to") : tx(t, "figCPtrX_eSp", "follow the address in p to")} ${pointee}` };
      case "&p": return { box: null, value: hex(ADDR.p), type: "int **", text: tx(t, "figCPtrX_eAp", "the address of p: a pointer has a box and an address too") };
      case "pp": return { box: "pp", value: hex(ADDR.p), type: "int **", text: tx(t, "figCPtrX_ePp", "the box pp, holding the address of p") };
      case "*pp": return { box: "p", value: hex(pVal), type: "int *", text: tx(t, "figCPtrX_eSpp", "follow pp: you land on the box p") };
    }
  };
  const d = deref();
  const writeThrough = () => { if (pointee) setVals(v => ({ ...v, [pointee]: 99 })); };

  const BY = 70, BH = 46;
  const mid = (k: keyof typeof BOX) => BOX[k].at + BOX[k].w / 2;
  const arrow = (from: keyof typeof BOX, to: keyof typeof BOX, col: string) => {
    const x0 = mid(from), x1 = mid(to), lift = 30 + Math.abs(x1 - x0) * 0.12;
    return (
      <g>
        <path d={`M${x0},${BY + BH} C${x0},${BY + BH + lift} ${x1},${BY + BH + lift} ${x1},${BY + BH + 4}`} fill="none" stroke={col} strokeWidth={1.8} />
        <path d={`M${x1 - 5},${BY + BH + 12} L${x1},${BY + BH + 4} L${x1 + 5},${BY + BH + 12}`} fill="none" stroke={col} strokeWidth={1.8} />
      </g>
    );
  };
  const box = (k: keyof typeof BOX, type: string, value: string) => {
    const b = BOX[k], hot = d.box === k;
    return (
      <g key={k}>
        <T x={b.at + b.w / 2} y={BY - 22} anchor="middle" size={10} color={C.fg} bold>{`${type} ${k}`}</T>
        <T x={b.at + b.w / 2} y={BY - 8} anchor="middle" size={8}>{hex(ADDR[k])}</T>
        <rect x={b.at} y={BY} width={b.w} height={BH} rx={6} fill={C.bg} stroke={hot ? C.amber : C.axis} strokeWidth={hot ? 3 : 1.2} />
        <T x={b.at + b.w / 2} y={BY + 28} anchor="middle" size={13} color={k === "x" || k === "y" ? C.sky : C.purple} bold>{value}</T>
      </g>
    );
  };

  return (
    <Figure title={tx(t, "figCPtrX_title", "What does each expression name? & and * on real boxes")}
      controls={<>
        <Row>
          {(["x", "&x", "p", "*p", "&p", "pp", "*pp", "**pp"] as Expr[]).map(e => <Btn key={e} active={expr === e} onClick={() => setExpr(e)}>{e}</Btn>)}
        </Row>
        <Row>
          <Btn active={target === "x"} onClick={() => setTarget("x")}>{"p = &x;"}</Btn>
          <Btn active={target === "y"} onClick={() => setTarget("y")}>{"p = &y;"}</Btn>
          <Btn onClick={writeThrough}>{"*p = 99;"}</Btn>
          <Btn onClick={() => { setVals({ x: 42, y: 7 }); setTarget("x"); }}>{tx(t, "figCPtrX_reset", "reset")}</Btn>
        </Row>
        <Row>
          <Btn active={target === "null"} onClick={() => { setTarget("null"); setExpr("*p"); }}>{tx(t, "figCPtrX_bNull", "break it: p = NULL")}</Btn>
          <Btn active={target === "junk"} onClick={() => { setTarget("junk"); setExpr("*p"); }}>{tx(t, "figCPtrX_bJunk", "break it: p never set")}</Btn>
        </Row>
        <Row>
          <Readout color={d.bad ? C.red : C.amber}>{`${expr}  →  ${d.value}   (${tx(t, "figCPtrX_type", "type")} ${d.type})`}</Readout>
          <Readout color={d.bad ? C.red : C.fg}>{d.text}</Readout>
        </Row>
      </>}
      note={tx(t, "figCPtrX_note", "Every variable is a box at an address. & asks a box for its address; * goes the other way, from an address to the box that lives there. So p is the box that stores an address, *p is the box at that address, and &p is where p itself lives, because a pointer is a variable with a box like any other. Each & adds a star to the type and each * removes one: x is int, &x is int *, &p is int **. Click p = &y and then *p = 99: the same line of code now writes into y. That is the whole point of pointers: code that works on whatever box you hand it. Now break it. A pointer set to NULL holds address 0, where no box ever lives, and *p crashes at once. A pointer never set holds leftover bits, and *p reads or writes some random place: sometimes a crash, sometimes silent damage. Always give a pointer a value before you use it.")}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {box("x", "int", String(vals.x))}
        {box("y", "int", String(vals.y))}
        {box("p", "int *", hex(pVal))}
        {box("pp", "int **", hex(ADDR.p))}
        {pointee && arrow("p", pointee, d.box === pointee && expr !== "x" ? C.amber : C.purple)}
        {arrow("pp", "p", expr === "*pp" || expr === "**pp" ? C.amber : C.purple)}
        {!pointee && <T x={mid("p")} y={BY + BH + 30} anchor="middle" size={9} color={C.red} bold>{target === "null" ? tx(t, "figCPtrX_toNowhere", "→ address 0: nothing there") : tx(t, "figCPtrX_toJunk", "→ some random address")}</T>}
        <T x={14} y={H - 10} size={8}>{"int x = 42;  int y = 7;  int *p = &x;  int **pp = &p;"}</T>
      </svg>
    </Figure>
  );
}

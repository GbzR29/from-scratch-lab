"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Row, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The three letter rows of a keyboard, as physical positions. Every position
// has one scancode, named after the US QWERTY key that sits there
// (SDL_SCANCODE_W is "second key of the top row", whatever is printed on it).
// The layout decides the keycode: the character that position types. Pick a
// layout, then pick how the game binds "move": by scancode the four movement
// keys keep their inverted-T shape on every layout; by keycode they are the
// keys printed W, A, S, D, scattered on AZERTY and Dvorak. Clicking a key, or
// pressing a real one while the figure has focus, shows both codes; a real key
// press uses the reader's own layout (browser KeyboardEvent.code is the
// position, .key the character).

type Layout = "qwerty" | "azerty" | "qwertz" | "dvorak";
type Bind = "scancode" | "keycode";

const SCAN = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "SEMICOLON"],
  ["Z", "X", "C", "V", "B", "N", "M", "COMMA", "PERIOD", "SLASH"],
];
const CODE_TO_SCAN: Record<string, string> = Object.fromEntries(SCAN.flat().map(s => [
  s.length === 1 ? `Key${s}` : s.charAt(0) + s.slice(1).toLowerCase(), s,
]));

const CHARS: Record<Layout, string[]> = {
  qwerty: ["qwertyuiop", "asdfghjkl;", "zxcvbnm,./"],
  azerty: ["azertyuiop", "qsdfghjklm", "wxcvbn,;:!"],
  qwertz: ["qwertzuiop", "asdfghjklö", "yxcvbnm,.-"],
  dvorak: ["',.pyfgcrl", "aoeuidhtns", ";qjkxbmwvz"],
};
const MOVE_SCANS = ["W", "A", "S", "D"];
const MOVE_CHARS = "wasd";

const PUNCT: Record<string, string> = {
  ";": "SEMICOLON", ",": "COMMA", ".": "PERIOD", "/": "SLASH", ":": "COLON",
  "!": "EXCLAIM", "'": "APOSTROPHE", "-": "MINUS",
};

/** The SDLK_ name of an unshifted character, or its code point when SDL has no name for it. */
function keycodeName(ch: string): string {
  if (/^[a-z0-9]$/.test(ch)) return `SDLK_${ch.toUpperCase()}`;
  if (PUNCT[ch]) return `SDLK_${PUNCT[ch]}`;
  const cp = ch.codePointAt(0) ?? 0;
  return `0x${cp.toString(16).toUpperCase().padStart(8, "0")} ('${ch}')`;
}

const KW = 40, KH = 36, GAP = 5;
const OFFSET = [0, 14, 34];                    // row stagger, as on a real board

type Picked = { scan: string; ch: string; live?: boolean };

export function ScancodeKeycodeFigure({ t }: { t?: TrackTranslations }) {
  const [layout, setLayout] = useState<Layout>("azerty");
  const [bind, setBind] = useState<Bind>("scancode");
  const [picked, setPicked] = useState<Picked | null>({ scan: "W", ch: "z" });

  const charAt = (r: number, c: number) => CHARS[layout][r][c];
  const moves = (r: number, c: number) =>
    bind === "scancode" ? MOVE_SCANS.includes(SCAN[r][c]) : MOVE_CHARS.includes(charAt(r, c));
  const moveLabel = (r: number, c: number) =>
    bind === "scancode" ? ["up", "left", "down", "right"][MOVE_SCANS.indexOf(SCAN[r][c])] : ["up", "left", "down", "right"][MOVE_CHARS.indexOf(charAt(r, c))];

  const W = OFFSET[2] + 10 * (KW + GAP), H = 3 * (KH + GAP) + 4;
  const arrow: Record<string, string> = { up: "↑", left: "←", down: "↓", right: "→" };

  const onKey = (e: React.KeyboardEvent) => {
    const scan = CODE_TO_SCAN[e.code];
    if (!scan || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    setPicked({ scan, ch: e.key.length === 1 ? e.key.toLowerCase() : e.key, live: true });
  };

  return (
    <Figure
      title={tx(t, "figSdlScan_title", "Scancode or keycode: where WASD goes")}
      controls={
        <div className="space-y-3">
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-24">{tx(t, "figSdlScan_layout", "layout")}</span>
            <Choice value={layout} onChange={v => { setLayout(v); setPicked({ scan: "W", ch: CHARS[v][0][1] }); }}
              options={[["qwerty", "QWERTY (US)"], ["azerty", "AZERTY (FR)"], ["qwertz", "QWERTZ (DE)"], ["dvorak", "Dvorak"]] as const} />
          </Row>
          <Row>
            <span className="text-[10px] font-mono text-[var(--text-muted)] w-24">{tx(t, "figSdlScan_bind", "move with")}</span>
            <Choice value={bind} onChange={setBind}
              options={[["scancode", "SDL_SCANCODE_W A S D"], ["keycode", "SDLK_W A S D"]] as const} />
          </Row>
          {picked && (
            <p className="font-mono text-[11.5px] leading-relaxed text-[var(--text-main)]">
              {picked.live && <span className="text-[var(--text-muted)]">{tx(t, "figSdlScan_yours", "your keyboard")}: </span>}
              e.key.scancode = <span style={{ color: C.sky }}>SDL_SCANCODE_{picked.scan}</span>
              {" · "}e.key.key = <span style={{ color: C.amber }}>{picked.ch.length === 1 ? keycodeName(picked.ch) : picked.ch}</span>
            </p>
          )}
          <p className="text-[12.5px] leading-relaxed" style={{ color: bind === "scancode" || layout === "qwerty" ? C.green : C.red }}>
            {bind === "scancode"
              ? tx(t, "figSdlScan_okScan", "The four movement keys are the same four positions on every layout: the inverted T under the left hand. Only the letters printed on them change.")
              : layout === "qwerty"
                ? tx(t, "figSdlScan_okUs", "On US QWERTY the keys printed W A S D are in the usual place, so binding by keycode looks fine. That is why the bug ships: the developer's own keyboard never shows it. Switch the layout.")
                : tx(t, "figSdlScan_bad", "The game now waits for the keys printed W, A, S and D, wherever this layout puts them. The player's hand no longer finds an inverted T: on AZERTY, \"up\" is at the bottom left; on Dvorak, \"left\" and \"down\" are at the two ends of the middle row.")}
          </p>
        </div>
      }
      note={tx(t, "figSdlScan_note", "Each key is a physical position. The small grey name is its scancode, which never changes; the big letter is what the chosen layout prints on it, which is its keycode. Highlighted keys move the player. Click a key to read both codes, or click the keyboard and press a real key: the line shows what SDL would report on your own layout. SDL reports keycodes without Shift: Shift+W still gives SDLK_W.")}
    >
      <div className="p-3 md:p-4 overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
        tabIndex={0} onKeyDown={onKey}
        aria-label={tx(t, "figSdlScan_aria", "keyboard: press a key to see its scancode and keycode")}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W * 1.4, minWidth: 320 }} role="img"
          aria-label={tx(t, "figSdlScan_svg", "three rows of keys with scancode names and layout letters")}>
          {SCAN.map((row, r) => row.map((scan, c) => {
            const x = OFFSET[r] + c * (KW + GAP), y = r * (KH + GAP) + 2;
            const ch = charAt(r, c);
            const m = moves(r, c);
            const sel = picked?.scan === scan;
            const col = bind === "scancode" ? C.sky : C.amber;
            return (
              <g key={scan} onClick={() => setPicked({ scan, ch })} style={{ cursor: "pointer" }}>
                <rect x={x} y={y} width={KW} height={KH} rx={5}
                  fill={m ? `${col}33` : "var(--card)"} stroke={sel ? C.fg : m ? col : "var(--border)"} strokeWidth={sel ? 1.8 : 1} />
                <text x={x + KW / 2} y={y + 20} textAnchor="middle"
                  style={{ fontSize: 15, fontWeight: 600, fill: m ? col : "var(--text-main)", fontFamily: "var(--font-mono, monospace)" }}>
                  {ch.toUpperCase()}
                </text>
                <text x={x + KW / 2} y={y + KH - 5} textAnchor="middle"
                  style={{ fontSize: scan.length > 6 ? 5 : scan.length > 2 ? 6 : 7.5, fill: C.muted, fontFamily: "var(--font-mono, monospace)" }}>
                  {scan}
                </text>
                {m && (
                  <text x={x + KW - 6} y={y + 11} textAnchor="middle" style={{ fontSize: 10, fill: col }}>
                    {arrow[moveLabel(r, c)]}
                  </text>
                )}
              </g>
            );
          }))}
        </svg>
      </div>
    </Figure>
  );
}

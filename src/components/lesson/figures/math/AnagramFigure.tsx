"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Row, Readout, Choice, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Why repeated letters divide n!. Every distinct anagram of the chosen word is
// listed as a chip. Selecting one shows all its numbered copies: give the
// repeated letters little numbers (A₁ A₂ A₃) and every real word appears once
// for each order of its A's and each order of its N's. Those copies are what
// n! counted separately, so n! / (a! · b! · …) is the number of chips.

const WORDS = ["ROMA", "ABBA", "ARARA", "BANANA"] as const;
type Word = typeof WORDS[number];
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const LETTER_COLORS: Record<string, string> = { A: C.red, B: C.blue, N: C.green, R: C.purple, O: C.amber, M: C.teal };

const fact = (n: number) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

/** Distinct orders of the letters, in dictionary order. */
function anagrams(word: string) {
  const letters = word.split("").sort(), out: string[] = [], used = letters.map(() => false), cur: string[] = [];
  const go = () => {
    if (cur.length === letters.length) { out.push(cur.join("")); return; }
    for (let i = 0; i < letters.length; i++) {
      if (used[i] || (i > 0 && letters[i] === letters[i - 1] && !used[i - 1])) continue;
      used[i] = true; cur.push(letters[i]); go(); cur.pop(); used[i] = false;
    }
  };
  go();
  return out;
}

/** Every way to number the repeated letters of one word: one copy per order of each repeated letter. */
function copies(word: string) {
  const groups = [...new Set(word.split(""))];
  const permsOf = (n: number): number[][] => n <= 1 ? [[0]] : permsOf(n - 1).flatMap(p => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)]));
  let out: Record<string, number[]>[] = [{}];
  for (const g of groups) {
    const cnt = word.split("").filter(c => c === g).length;
    out = out.flatMap(o => permsOf(cnt).map(p => ({ ...o, [g]: p })));
  }
  return out.map(o => {
    const seen: Record<string, number> = {};
    return word.split("").map(c => {
      const i = seen[c] ?? 0; seen[c] = i + 1;
      const cnt = word.split("").filter(x => x === c).length;
      return cnt > 1 ? c + SUB[o[c][i] + 1] : c;
    });
  });
}

export function AnagramFigure({ t }: { t?: TrackTranslations }) {
  const [word, setWord] = useState<Word>("BANANA");
  const [sel, setSel] = useState(0);
  const list = anagrams(word);
  const pick = list[Math.min(sel, list.length - 1)];
  const reps = [...new Set(word.split(""))].map(c => [c, word.split("").filter(x => x === c).length] as const).filter(([, n]) => n > 1);
  const den = reps.reduce((p, [, n]) => p * fact(n), 1);
  const denTxt = reps.length ? reps.map(([c, n]) => `${n}! (${c})`).join(" · ") : "1";
  const choose = (w: Word) => { setWord(w); setSel(0); };

  const letter = (c: string, key: number) => <span key={key} style={{ color: LETTER_COLORS[c[0]] }}>{c}</span>;

  return (
    <Figure
      title={tx(t, "figAna_title", "Anagrams with repeated letters")}
      head={<Choice value={word} onChange={choose} options={WORDS.map(w => [w, w] as [Word, string])} />}
      controls={<Row>
        <Readout color={C.blue}>{`${word.length}! = ${fact(word.length)}`}</Readout>
        <Readout color={C.amber}>{`÷ ${denTxt} = ${den}`}</Readout>
        <Readout color={C.green}>{`= ${list.length} ${tx(t, "figAna_words", "different words")}`}</Readout>
      </Row>}
      note={<>
        {tx(t, "figAna_note", "Each chip is one different word made from the same letters. Number the repeated letters (A₁, A₂, A₃) as if they were different: then there are n! orders, but each real word appears once for every way of numbering its repeats. The panel below shows those copies for the selected word; their number is the same for every word, so n! divided by it gives the number of chips.")}{" "}
        <span data-mouse-only>{tx(t, "figAna_click", "Click a word to see its numbered copies.")}</span>
        <span data-touch-only>{tx(t, "figAna_tap", "Tap a word to see its numbered copies.")}</span>
      </>}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5 max-h-[190px] overflow-y-auto">
          {list.map((w, i) => (
            <button key={w} type="button" onClick={() => setSel(i)}
              className="font-mono text-[12px] font-semibold px-1.5 py-0.5 rounded-md border"
              style={{ borderColor: i === sel ? "var(--primary)" : "var(--border)", background: i === sel ? "var(--card)" : "var(--surface)" }}>
              {w.split("").map(letter)}
            </button>
          ))}
        </div>
        <div className="text-[12px] text-[var(--text-muted)]">
          {tx(t, "figAna_copies", "The copies of {w} with numbered letters").replace("{w}", pick)} ({den})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {copies(pick).map((c, i) => (
            <span key={i} className="font-mono text-[12px] px-1.5 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)]">{c.map(letter)}</span>
          ))}
        </div>
      </div>
    </Figure>
  );
}

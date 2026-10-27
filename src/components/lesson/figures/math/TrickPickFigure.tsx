"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure } from "@/components/lesson/kit/figure";
import { Practice, type StageApi } from "@/components/lesson/kit/practice/Practice";
import { ChoiceButtons } from "@/components/lesson/kit/practice/ChoiceButtons";
import { Tex } from "@/components/lesson/Tex";
import { BANKS, type BankId, type TrickItem } from "./tricks/banks";

// ── What this figure shows ────────────────────────────────────────────────────
// A practice round (kit/practice) on recognising a trick, which is the hard
// part: a problem and what it asks for, and four tricks to choose from (the
// right one and three others from the chapter). After a wrong answer a card
// under the buttons says why the right trick opens it. `bank` picks the chapter
// (tricks/banks.ts).

type Q = { key: string; item: TrickItem; options: string[]; right: number };

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const shuffle = <T,>(xs: T[]) => xs.map(x => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(p => p[1]);

export function TrickPickFigure({ t, bank }: { t?: TrackTranslations; bank: BankId }) {
  const def = BANKS[bank];
  const [given, setGiven] = useState<{ q: string; i: number } | null>(null);
  const name = (id: string) => {
    const k = def.tricks.find(x => x.id === id);
    return k ? tx(t, k.name[0], k.name[1]) : id;
  };

  const make = (avoid: string | null): Q => {
    for (let i = 0; ; i++) {
      const item = pick(def.items);
      if (item.tex === avoid && i < 20) continue;
      const others = shuffle(def.tricks.map(k => k.id).filter(id => id !== item.right)).slice(0, 3);
      const options = shuffle([item.right, ...others]);
      return { key: item.tex, item, options, right: options.indexOf(item.right) };
    }
  };

  const stage = (q: Q, { submit, feedback }: StageApi) => {
    const mine = given?.q === q.key ? given.i : null;
    const wrong = feedback && !feedback.ok;
    return (
      <div className={`px-3 ${wrong ? "pb-28" : "pb-4"}`}>
        <ChoiceButtons options={q.options.map(id => <span key={id} className="text-[13px]">{name(id)}</span>)}
          right={q.right} picked={mine} feedback={feedback}
          onPick={i => { if (feedback) return; setGiven({ q: q.key, i }); submit(i === q.right); }} />
        {wrong && (
          <div className="mt-4 mx-auto max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">{tx(t, "figTk_why", "why this trick")}</p>
            <p className="text-[14px] text-[var(--text-main)]">{tx(t, q.item.why[0], q.item.why[1])}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Figure title={tx(t, def.title[0], def.title[1])}
      note={tx(t, "figTk_note", "Knowing a trick is half of it; the other half is seeing when it applies. Each question is a problem and what it asks for. Pick the trick that opens it. A wrong answer shows the right trick and one sentence on why it works there. The questions come in a new order every round.")}>
      <Practice<Q> t={t} id={`math-tricks-${bank}`} make={make}
        prompt={q => <>
          <div className="text-[13px] font-medium text-[var(--text-muted)] mb-2">{tx(t, q.item.goal[0], q.item.goal[1])}</div>
          <div className="overflow-x-auto"><Tex>{`\\displaystyle ${q.item.tex}`}</Tex></div>
        </>}
        stage={stage}
        solution={q => name(q.item.right)} />
    </Figure>
  );
}

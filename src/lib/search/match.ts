// src/lib/search/match.ts
// Ranks the search index against what was typed. Accents and case are ignored
// ("funcao" finds "função"); every word typed must appear somewhere in the
// entry; hits in the title count most, then the place, then the description.

import type { SearchDoc } from "./types";

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

/** "Função Afim" → "funcao afim". */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Does `word` start a word inside `text` (both folded)? */
function startsWord(text: string, word: string): boolean {
  let i = text.indexOf(word);
  while (i >= 0) {
    if (i === 0 || !/[a-z0-9]/.test(text[i - 1])) return true;
    i = text.indexOf(word, i + 1);
  }
  return false;
}

// The folded text of each entry, made once per index and language
type Folded = { title: string; place: string; desc: string };
const cache = new WeakMap<SearchDoc, Folded[]>();

function folded(doc: SearchDoc, li: 0 | 1): Folded {
  let pair = cache.get(doc);
  if (!pair) {
    const make = (l: 0 | 1): Folded => ({
      // A lesson matches in both languages, so a PT reader typing an English term still finds it
      title: fold(`${doc.t[l]} ${l === 1 && doc.t[0] !== doc.t[1] ? doc.t[0] : ""}`),
      place: fold(doc.s?.[l] ?? ""),
      desc: fold(doc.d?.[l] ?? ""),
    });
    pair = [make(0), make(1)];
    cache.set(doc, pair);
  }
  return pair[li];
}

const KIND_BONUS: Record<SearchDoc["k"], number> = { track: 30, lesson: 0, ref: -4 };

export function search(index: SearchDoc[], query: string, lang: "en" | "pt", limit = 40): SearchHit[] {
  const q = fold(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const li = lang === "pt" ? 1 : 0;
  const hits: SearchHit[] = [];

  for (const doc of index) {
    const f = folded(doc, li);
    let score = 0;
    let all = true;
    for (const w of words) {
      // The word's stem, so plurals and endings still match ("funcao" → "funcoes", "afim" → "afins")
      const stem = w.length >= 4 ? w.slice(0, Math.max(3, w.length - 2)) : "";
      if (startsWord(f.title, w)) score += 20;
      else if (f.title.includes(w)) score += 10;
      else if (startsWord(f.place, w)) score += 7;
      else if (f.desc.includes(w) || f.place.includes(w)) score += 2;
      else if (stem && startsWord(f.title, stem)) score += 8;
      else if (stem && (startsWord(f.place, stem) || startsWord(f.desc, stem))) score += 1;
      else { all = false; break; }
    }
    if (!all) continue;
    if (f.title.startsWith(q)) score += 40;
    else if (f.title.includes(q)) score += 15;
    if (doc.k === "ref" && f.title.replace("*", "").trim() === q) score += 60;
    hits.push({ doc, score: score + KIND_BONUS[doc.k] });
  }

  hits.sort((a, b) => b.score - a.score || (a.doc.n ?? 0) - (b.doc.n ?? 0));
  return hits.slice(0, limit);
}

"use client";

// ── Site search ─────────────────────────────────────────────────────────────
// The search button of HomeNav and LearnTopBar and the box it opens: every
// track, lesson and reference function, found as you type. "/" or Ctrl+K opens
// it from anywhere; ↑ ↓ pick a result, Enter opens it, Esc closes. The index
// (/search-index.json, src/lib/search) is downloaded the first time the box
// opens. The box is portalled to <body>, like the phone menu, so it carries its
// own tokens. Styles: src/styles/search.css.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { TrackGlyph } from "@/components/brand/TrackGlyph";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { chapterHref, trackHref, type UrlLang } from "@/lib/tracks/urls";
import { fold, search } from "@/lib/search/match";
import type { SearchDoc } from "@/lib/search/types";

type Strings = Record<string, string | undefined>;

// ── Index (downloaded once per visit) ───────────────────────────────────────

let indexPromise: Promise<SearchDoc[]> | null = null;

function loadIndex(): Promise<SearchDoc[]> {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .catch((err) => { indexPromise = null; throw err; });
  return indexPromise;
}

function hrefOf(doc: SearchDoc, lang: UrlLang): string {
  if (doc.k === "track") return trackHref(doc.p, lang);
  if (doc.k === "lesson") return chapterHref(doc.p, doc.id!, lang);
  return `${trackHref(doc.p)}/reference/${encodeURIComponent(doc.id!)}`; // the reference is English-only
}

/** The title with the typed words drawn in the accent colour. */
function Marked({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const f = fold(text);
  const on = new Array<boolean>(text.length).fill(false);
  for (const w of words) {
    for (let i = f.indexOf(w); i >= 0; i = f.indexOf(w, i + 1)) on.fill(true, i, i + w.length);
  }
  const parts: { s: string; on: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.on === on[i]) last.s += text[i];
    else parts.push({ s: text[i], on: on[i] });
  }
  return <>{parts.map((p, i) => (p.on ? <mark key={i}>{p.s}</mark> : <span key={i}>{p.s}</span>))}</>;
}

// ── Button + box ────────────────────────────────────────────────────────────

export function SiteSearch({ className = "", wide = false }: { className?: string; wide?: boolean }) {
  const { language, t } = useLanguage();
  const ui = t as unknown as Strings;
  const urlLang = useUrlLang();
  const router = useRouter();
  const lang: "en" | "pt" = language === "pt" ? "pt" : "en";
  const li = lang === "pt" ? 1 : 0;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState<SearchDoc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => setMounted(true), []);

  // "/" or Ctrl+K / ⌘K opens the box, unless the reader is typing somewhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // While open: load the index, lock the page scroll, focus the field; give focus back on close
  useEffect(() => {
    if (!open) return;
    setFailed(false);
    loadIndex().then(setIndex, () => setFailed(true));
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    const opener = button.current;
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [open]);

  const words = useMemo(() => fold(query.trim()).split(/\s+/).filter(Boolean), [query]);
  const results = useMemo<SearchDoc[]>(() => {
    if (!index) return [];
    if (!words.length) return index.filter((d) => d.k === "track");
    return search(index, query, lang).map((h) => h.doc);
  }, [index, query, words.length, lang]);

  useEffect(() => setActive(0), [query]);

  // Keep the picked row in view
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = useCallback(() => { setOpen(false); setQuery(""); }, []);
  const go = useCallback((doc: SearchDoc) => { close(); router.push(hrefOf(doc, urlLang)); }, [close, router, urlLang]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]); }
  };

  const kind = (doc: SearchDoc) =>
    doc.k === "lesson" ? `${ui.searchLesson ?? "lesson"} ${doc.n}` : doc.k === "ref" ? ui.searchFunction ?? "function" : ui.searchTrack ?? "track";

  return (
    <>
      <button
        ref={button}
        type="button"
        className={`ss-open ${wide ? "ss-open-wide" : ""} ${className}`}
        onClick={() => setOpen(true)}
        aria-label={ui.searchLabel}
        aria-haspopup="dialog"
        title={`${ui.searchOpen ?? "Search"} (/)`}
      >
        <Search size={15} strokeWidth={1.75} aria-hidden="true" />
        {wide && <span className="ss-open-text">{ui.searchOpen ?? "Search"}</span>}
        {wide && <kbd>/</kbd>}
      </button>

      {mounted && open && createPortal(
        <div className="ss" role="dialog" aria-modal="true" aria-label={ui.searchLabel} onKeyDown={onKeyDown}>
          <div className="ss-backdrop" onClick={close} />
          <div className="ss-panel">
            <div className="ss-field">
              <Search size={18} strokeWidth={1.75} aria-hidden="true" />
              <input
                ref={input}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.searchPlaceholder}
                aria-label={ui.searchLabel}
                aria-controls="ss-results"
                aria-activedescendant={results[active] ? `ss-row-${active}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="ss-esc" onClick={close}>esc</button>
            </div>

            <div className="ss-status">
              {!index && !failed && ui.searchLoading}
              {failed && "—"}
              {index && !words.length && (ui.searchTracks ?? "Tracks")}
              {index && words.length > 0 && results.length > 0 && `${results.length}${results.length === 40 ? "+" : ""} ${results.length === 1 ? ui.searchResult ?? "result" : ui.searchResults ?? "results"}`}
              {index && words.length > 0 && results.length === 0 && `${ui.searchNone ?? "Nothing found for"} “${query.trim()}”`}
            </div>

            <ul className="ss-results" id="ss-results" role="listbox" ref={list}>
              {results.map((doc, i) => (
                <li key={`${doc.k}:${doc.p}:${doc.id ?? ""}`} id={`ss-row-${i}`} role="option" aria-selected={i === active} data-row={i}>
                  <a
                    href={hrefOf(doc, urlLang)}
                    onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); go(doc); } }}
                    onMouseMove={() => setActive(i)}
                    tabIndex={-1}
                  >
                    <span className="ss-glyph"><TrackGlyph id={doc.g} size={26} /></span>
                    <span className="ss-text">
                      <span className={`ss-title ${doc.k === "ref" ? "ss-code" : ""}`}><Marked text={doc.t[li]} words={words} /></span>
                      {doc.s && <span className="ss-place">{doc.s[li]}</span>}
                      {doc.d?.[li] && <span className="ss-desc">{doc.d[li]}</span>}
                    </span>
                    <span className="ss-kind">{kind(doc)}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="ss-foot" data-mouse-only>{ui.searchKeys}</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

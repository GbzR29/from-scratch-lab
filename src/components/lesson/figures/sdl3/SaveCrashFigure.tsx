"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// Saving a new best score (13 over 12), step by step, and the game killed at
// a step the reader picks. Two ways to save: SDL_SaveFile straight over
// best.txt, or a temporary file + SDL_FlushIO + SDL_RenamePath. Two ways to
// die: the game crashes (the system keeps every call that finished, its cache
// included) or the power goes (only what was flushed is on the disk; file
// creation, truncation and renames are taken as already on the disk, the worst
// case some file systems allow). The panel shows best.txt after the restart
// and what loadBest makes of it.

type Mode = "inplace" | "safe";
type Death = "crash" | "power";
type Op = { kind: "open" | "write" | "flush" | "close" | "rename"; file: "best.txt" | "best.txt.tmp" };
type File = { os: string; disk: string };

const OLD = "sdl3lab-save 1\nbest 12\ndate 2026-10-20\n";
const NEW = "sdl3lab-save 1\nbest 13\ndate 2026-10-27\n";

const STEPS: Record<Mode, { op: Op; code: string; en: string }[]> = {
  inplace: [
    { op: { kind: "open", file: "best.txt" },  code: "SDL_IOFromFile(path, \"wb\")", en: "opens best.txt for writing; \"w\" empties it at once" },
    { op: { kind: "write", file: "best.txt" }, code: "SDL_WriteIO(io, text, 39)", en: "hands the 39 bytes to the system, which keeps them in memory for now" },
    { op: { kind: "close", file: "best.txt" }, code: "SDL_CloseIO(io)", en: "closes the file; the system writes its memory to the disk later, when it likes" },
  ],
  safe: [
    { op: { kind: "open", file: "best.txt.tmp" },  code: "SDL_IOFromFile(tmp, \"wb\")", en: "creates best.txt.tmp, empty; best.txt is not touched" },
    { op: { kind: "write", file: "best.txt.tmp" }, code: "SDL_WriteIO(io, text, 39)", en: "the 39 bytes go to the system's memory" },
    { op: { kind: "flush", file: "best.txt.tmp" }, code: "SDL_FlushIO(io)", en: "waits until those bytes are really on the disk" },
    { op: { kind: "close", file: "best.txt.tmp" }, code: "SDL_CloseIO(io)", en: "closes the temporary file" },
    { op: { kind: "rename", file: "best.txt.tmp" }, code: "SDL_RenamePath(tmp, path)", en: "best.txt now names the new file; the old one is gone in the same step" },
  ],
};

// Runs the first `n` steps; a skipped flush is simply not run
function simulate(mode: Mode, n: number, flush: boolean) {
  const files = new Map<string, File>([["best.txt", { os: OLD, disk: OLD }]]);
  STEPS[mode].slice(0, n).forEach(({ op }) => {
    const f = files.get(op.file);
    if (op.kind === "open") files.set(op.file, { os: "", disk: "" });
    if (op.kind === "write" && f) f.os = NEW;
    if (op.kind === "flush" && f && flush) f.disk = f.os;
    if (op.kind === "rename" && f) { files.set("best.txt", f); files.delete(op.file); }
  });
  return files;
}

// What loadBest does with the text it finds
function load(text: string | undefined): { best: number; kind: "new" | "old" | "empty" | "none" } {
  if (text === undefined) return { best: 0, kind: "none" };
  const m = /^sdl3lab-save 1\s+best (\d+)\s+date \d+-\d+-\d+/.exec(text);
  if (!m) return { best: 0, kind: "empty" };
  return { best: +m[1], kind: +m[1] === 13 ? "new" : "old" };
}

const show = (s: string) => (s === "" ? "" : s.replace(/\n/g, "↵\n"));

export function SaveCrashFigure({ t }: { t?: TrackTranslations }) {
  const [mode, setMode] = useState<Mode>("inplace");
  const [death, setDeath] = useState<Death>("crash");
  const [flush, setFlush] = useState(true);
  const [at, setAt] = useState(1);              // steps that ran before the game died

  const steps = STEPS[mode];
  const files = simulate(mode, at, flush);
  const view = (f: File) => (death === "crash" ? f.os : f.disk);
  const best = files.get("best.txt");
  const tmp = files.get("best.txt.tmp");
  const res = load(best ? view(best) : undefined);
  const col = { new: C.green, old: C.amber, empty: C.red, none: C.red }[res.kind];

  const pick = (m: Mode) => { setMode(m); setAt(1); };
  const verdict = {
    new: tx(t, "figSdlSave_vNew", "Next launch: Best 13. The new record survived."),
    old: tx(t, "figSdlSave_vOld", "Next launch: Best 12. The new record is lost, but the old one is intact: the player loses one gem's worth, not the save."),
    empty: death === "power" && mode === "safe" && !flush && at === steps.length
      ? tx(t, "figSdlSave_vNoFlush", "Next launch: best.txt is empty, so loadBest ignores it: Best 0. The rename reached the disk before the data did. That is the one thing SDL_FlushIO is there to prevent.")
      : tx(t, "figSdlSave_vEmpty", "Next launch: best.txt is empty, so loadBest ignores it and starts from Best 0. Both records are lost."),
    none: tx(t, "figSdlSave_vNone", "Next launch: there is no best.txt at all, as on a first launch: Best 0."),
  }[res.kind];

  return (
    <Figure
      title={tx(t, "figSdlSave_title", "Kill the game in the middle of a save")}
      head={<>
        <Btn active={mode === "inplace"} onClick={() => pick("inplace")}>SDL_SaveFile</Btn>
        <Btn active={mode === "safe"} onClick={() => pick("safe")}>{tx(t, "figSdlSave_safe", "temp + rename")}</Btn>
      </>}
      controls={<>
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[var(--text-muted)]">{tx(t, "figSdlSave_how", "The game dies by:")}</span>
          <Btn active={death === "crash"} onClick={() => setDeath("crash")}>{tx(t, "figSdlSave_crash", "a crash")}</Btn>
          <Btn active={death === "power"} onClick={() => setDeath("power")}>{tx(t, "figSdlSave_power", "a power cut")}</Btn>
        </div>
        <p className="text-[12.5px] leading-relaxed font-semibold" style={{ color: col }}>{verdict}</p>
      </>}
      note={tx(t, "figSdlSave_note", "The player has just beaten the record, 13 over 12, and the game saves. Click a line to kill the game right after it, or the gap above the first line to kill it before the save starts. A crash keeps every call that finished, because the system still has the bytes in memory and writes them later. A power cut loses whatever the system had not written to the disk yet. In temp + rename, untick SDL_FlushIO and cut the power after the rename.")}
    >
      <div className="grid gap-3 p-3 md:p-4 md:grid-cols-[1.2fr_1fr] items-start">
        <div>
          <button type="button" onClick={() => setAt(0)}
            className="block w-full h-3 rounded-sm mb-1" aria-label={tx(t, "figSdlSave_before", "die before the save starts")}
            style={{ background: at === 0 ? C.red : "transparent", outline: `1px dashed ${at === 0 ? C.red : "var(--border)"}` }} />
          <ul className="space-y-1">
            {steps.map((s, i) => {
              const ran = i < at;
              const skipped = s.op.kind === "flush" && !flush;
              return (
                <li key={s.code}>
                  <div onClick={() => setAt(i + 1)}
                    className={`flex items-start gap-2 px-2 py-1.5 rounded-md cursor-pointer ${ran ? "bg-[var(--surface)]" : "opacity-45"}`}>
                    {s.op.kind === "flush" ? (
                      <input type="checkbox" checked={flush} onClick={e => e.stopPropagation()} onChange={() => setFlush(f => !f)}
                        className="mt-[3px] accent-[var(--primary)]" aria-label="SDL_FlushIO" />
                    ) : <span className="w-[13px] shrink-0" />}
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px] break-all" style={{ color: skipped ? C.red : C.fg, textDecoration: skipped ? "line-through" : "none" }}>{s.code}</span>
                      <span className="block text-[10.5px] text-[var(--text-muted)]">{tx(t, `figSdlSave_${mode}${i}`, s.en)}</span>
                    </span>
                  </div>
                  {at === i + 1 && i + 1 < steps.length && (
                    <p className="mt-1 h-[3px] rounded-full" style={{ background: C.red }} />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] font-mono" style={{ color: at === steps.length ? C.green : C.red }}>
            {at === steps.length
              ? tx(t, "figSdlSave_done", "the save finished, then the game died")
              : `${tx(t, "figSdlSave_died", "the game died after step")} ${at} / ${steps.length}`}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {death === "crash" ? tx(t, "figSdlSave_afterCrash", "the folder after the crash") : tx(t, "figSdlSave_afterPower", "the disk after the power comes back")}
          </p>
          {([["best.txt", best], ["best.txt.tmp", tmp]] as const).map(([name, f]) => f && (
            <div key={name}>
              <p className="font-mono text-[11px] text-[var(--text-main)]">
                {name} <span className="text-[var(--text-muted)]">— {view(f).length} {tx(t, "figSdlSave_bytes", "bytes")}</span>
              </p>
              <pre className="mt-0.5 rounded-md bg-[var(--code-bg)] border border-[var(--border)] px-2 py-1.5 font-mono text-[10.5px] leading-snug min-h-[2.2rem] whitespace-pre-wrap"
                style={{ color: view(f) === "" ? C.red : C.fg }}>
                {view(f) === "" ? tx(t, "figSdlSave_emptyFile", "(empty)") : show(view(f))}
              </pre>
            </div>
          ))}
          {!best && <p className="font-mono text-[11px]" style={{ color: C.red }}>{tx(t, "figSdlSave_noFile", "no best.txt")}</p>}
          {tmp && res.kind !== "empty" && (
            <p className="text-[10.5px] text-[var(--text-muted)]">{tx(t, "figSdlSave_tmpLeft", "The leftover best.txt.tmp is harmless: loadBest never reads it, and the next save overwrites it.")}</p>
          )}
        </div>
      </div>
    </Figure>
  );
}

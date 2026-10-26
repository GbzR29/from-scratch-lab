"use client";

import { useEffect, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The first SDL3 project, as a list of the lines that matter. Untick one and
// the figure shows what really happens: a build error, a launch error, a
// window that misbehaves, or (for some lines) nothing visible at all, which is
// its own lesson. The window on the right is live: try to close it with its ✕.
// "Not responding" appears after five seconds without event pumping, as on
// Windows. Only the first failing stage is shown: a program that does not
// build never reaches the launch.

type Id = "link" | "dll" | "main" | "init" | "poll" | "quit" | "present" | "cleanup";
type Stage = "build" | "launch" | "run" | "fine";

const ITEMS: { id: Id; file: string; code: string }[] = [
  { id: "link",    file: "CMakeLists.txt", code: "target_link_libraries(game PRIVATE SDL3::SDL3)" },
  { id: "dll",     file: "CMakeLists.txt", code: "copy_if_different $<TARGET_FILE:SDL3::SDL3> …" },
  { id: "main",    file: "main.cpp", code: "#include <SDL3/SDL_main.h>" },
  { id: "init",    file: "main.cpp", code: "if (!SDL_Init(SDL_INIT_VIDEO)) { … }" },
  { id: "poll",    file: "main.cpp", code: "while (SDL_PollEvent(&e)) { … }" },
  { id: "quit",    file: "main.cpp", code: "if (e.type == SDL_EVENT_QUIT) running = false;" },
  { id: "present", file: "main.cpp", code: "SDL_RenderPresent(renderer);" },
  { id: "cleanup", file: "main.cpp", code: "SDL_DestroyRenderer(…); SDL_DestroyWindow(…); SDL_Quit();" },
];

const VERDICT: Record<Id, { stage: Stage; en: string }> = {
  link:    { stage: "build",  en: "Build fails: fatal error: SDL3/SDL.h: No such file or directory. Linking the SDL3::SDL3 target is also what gives the compiler SDL's include folder, so without it even the #include cannot be found." },
  dll:     { stage: "launch", en: "On Windows the build succeeds, but starting game.exe shows: \"The code execution cannot proceed because SDL3.dll was not found.\" The DLL sits in SDL's own build folder, and Windows only looks next to the .exe and in PATH. On Linux and macOS nothing changes: the build stores the library's path inside the executable." },
  main:    { stage: "fine",   en: "This console build still runs: on desktop, a plain main() is a valid entry point. That is why it is easy to forget. It breaks elsewhere: a Windows GUI build (add_executable(game WIN32 …)) fails to link with \"unresolved external symbol WinMain\", iOS and Android never call main at all, and the main callbacks of the next chapter need this header." },
  init:    { stage: "fine",   en: "Works by accident: SDL_CreateWindowAndRenderer starts the video subsystem itself when nobody did. But you lose the one check that explains a failure with SDL_GetError(), and code that relies on the accident breaks when you add audio or gamepads, which are not started for you." },
  poll:    { stage: "run",    en: "The window opens and draws, but nobody reads the operating system's messages. After about five seconds Windows marks it \"(Not Responding)\" and greys it out; macOS shows the spinning cursor. The ✕ does nothing, because the click is one of the unread messages." },
  quit:    { stage: "run",    en: "Events are read, so the window stays responsive, but clicking ✕ only puts an SDL_EVENT_QUIT in the queue, and nothing acts on it. The window cannot be closed. On Linux and macOS even Ctrl+C in the terminal does not help: SDL turns it into an SDL_EVENT_QUIT too. Kill the process to end it." },
  present: { stage: "run",    en: "The clear colour is drawn into a hidden back buffer that is never shown. The window stays black (on some systems it shows leftover garbage). Nothing appears on screen before SDL_RenderPresent." },
  cleanup: { stage: "fine",   en: "Nothing visible: when a process ends, the operating system takes back its memory and windows. The cleanup still matters in longer programs, where a window or texture is created and destroyed many times, and leak checkers report it." },
};

const STAGE_COL: Record<Stage, string> = { build: C.red, launch: C.red, run: C.amber, fine: C.green };
const ORDER: Stage[] = ["build", "launch", "run"];

export function SetupBreakFigure({ t }: { t?: TrackTranslations }) {
  const [on, setOn] = useState<Record<Id, boolean>>(() => Object.fromEntries(ITEMS.map(i => [i.id, true])) as Record<Id, boolean>);
  const [sel, setSel] = useState<Id | null>(null);
  const [closed, setClosed] = useState(false);
  const [poke, setPoke] = useState(0);         // flashes "nothing happens" after a useless ✕ click
  const [hung, setHung] = useState(false);

  // The first stage that fails decides what the reader sees
  const off = ITEMS.filter(i => !on[i.id]).map(i => i.id);
  const failed = ORDER.find(s => off.some(id => VERDICT[id].stage === s)) ?? "fine";
  const showsWindow = failed === "run" || failed === "fine";

  // Not responding: five seconds without event pumping
  useEffect(() => {
    setHung(false);
    if (!showsWindow || on.poll || closed) return;
    const id = setTimeout(() => setHung(true), 5000);
    return () => clearTimeout(id);
  }, [showsWindow, on.poll, closed]);

  useEffect(() => {
    if (!poke) return;
    const id = setTimeout(() => setPoke(0), 1400);
    return () => clearTimeout(id);
  }, [poke]);

  const flip = (id: Id) => { setOn(o => ({ ...o, [id]: !o[id] })); setSel(id); setClosed(false); };
  const reset = () => { setOn(Object.fromEntries(ITEMS.map(i => [i.id, true])) as Record<Id, boolean>); setSel(null); setClosed(false); };
  const tryClose = () => { if (on.poll && on.quit) setClosed(true); else setPoke(p => p + 1); };

  const shown = sel ?? off[0] ?? null;
  const stageLabel: Record<Stage, string> = {
    build: tx(t, "figSdlSetup_sBuild", "build fails"),
    launch: tx(t, "figSdlSetup_sLaunch", "does not start"),
    run: tx(t, "figSdlSetup_sRun", "runs, but wrong"),
    fine: tx(t, "figSdlSetup_sFine", "no visible change"),
  };

  return (
    <Figure
      title={tx(t, "figSdlSetup_title", "Untick a line, see what breaks")}
      head={<Btn onClick={reset}>{tx(t, "figSdlSetup_reset", "all on")}</Btn>}
      controls={shown ? (
        <p className="text-[12.5px] leading-relaxed">
          <span className="font-semibold" style={{ color: on[shown] ? C.green : STAGE_COL[VERDICT[shown].stage] }}>
            {on[shown] ? tx(t, "figSdlSetup_isOn", "line present") : stageLabel[VERDICT[shown].stage]}:{" "}
          </span>
          {tx(t, `figSdlSetup_v_${shown}`, VERDICT[shown].en)}
        </p>
      ) : undefined}
      note={tx(t, "figSdlSetup_note", "Every line here is in the project of this chapter. Untick one to remove it, rebuild in your head, and read what really happens. The window on the right is the program: with every line in place, its ✕ closes it. Not every mistake shows: some lines only matter on other platforms or in bigger programs.")}
    >
      <div className="grid gap-3 p-3 md:p-4 md:grid-cols-[1.25fr_1fr] items-start">
        <ul className="space-y-1">
          {ITEMS.map(i => {
            const v = VERDICT[i.id];
            return (
              <li key={i.id}>
                <label className={`flex items-start gap-2 px-2 py-1 rounded-md cursor-pointer ${shown === i.id ? "bg-[var(--primary-low)]" : "hover:bg-[var(--surface)]"}`}>
                  <input type="checkbox" checked={on[i.id]} onChange={() => flip(i.id)} className="mt-[3px] accent-[var(--primary)]" />
                  <span className="min-w-0">
                    <span className="block text-[9.5px] font-semibold" style={{ color: C.axis }}>{i.file}</span>
                    <span className="block font-mono text-[11px] break-all" style={{ color: on[i.id] ? C.fg : STAGE_COL[v.stage], textDecoration: on[i.id] ? "none" : "line-through" }}>{i.code}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 min-h-[13rem] flex flex-col justify-center">
          {failed === "build" && (
            <pre className="font-mono text-[11px] whitespace-pre-wrap" style={{ color: C.red }}>
              {"$ cmake --build build\n"}main.cpp:1:10: fatal error: SDL3/SDL.h: No such file or directory{"\n"}compilation terminated.
            </pre>
          )}
          {failed === "launch" && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-[12px] shadow-sm">
              <p className="font-semibold text-[var(--text-main)] mb-1.5">game.exe – {tx(t, "figSdlSetup_sysErr", "System Error")}</p>
              <p className="text-[var(--text-muted)]">{tx(t, "figSdlSetup_dllMsg", "The code execution cannot proceed because SDL3.dll was not found. Reinstalling the program may fix this problem.")}</p>
            </div>
          )}
          {showsWindow && (closed ? (
            <p className="text-[12px] text-center" style={{ color: C.green }}>
              {tx(t, "figSdlSetup_closed", "The window closed and the program returned 0.")}{" "}
              <button type="button" className="underline text-[var(--primary)]" onClick={() => setClosed(false)}>{tx(t, "figSdlSetup_again", "run again")}</button>
            </p>
          ) : (
            <div className="rounded-md overflow-hidden border border-[var(--border)] shadow-sm relative">
              <div className="flex items-center justify-between px-2 py-1 bg-[var(--card)] text-[11px]">
                <span className="text-[var(--text-main)] truncate">SDL3 Lab{hung ? ` ${tx(t, "figSdlSetup_hung", "(Not Responding)")}` : ""}</span>
                <button type="button" onClick={tryClose} aria-label={tx(t, "figSdlSetup_close", "close")}
                  className="w-6 h-5 rounded text-[var(--text-muted)] hover:bg-[#ef4444] hover:text-white">✕</button>
              </div>
              <div className="relative" style={{ aspectRatio: "16 / 9", background: on.present ? "#10121a" : "#000" }}>
                {hung && <div className="absolute inset-0 bg-white/45" />}
                {poke > 0 && (
                  <p className="absolute inset-x-0 bottom-2 text-center text-[11px] font-mono" style={{ color: C.amber }}>
                    {tx(t, "figSdlSetup_nothing", "✕ clicked … nothing happens")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  );
}

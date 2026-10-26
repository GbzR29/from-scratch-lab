"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// A small SDL2 program built against the SDL3 headers. Every line can be
// flipped to its SDL3 form; "Build" prints the errors a compiler (GCC wording)
// really gives, and "Run" shows what the program does once it compiles. The
// messages come from SDL3's SDL_oldnames.h, which turns old names into
// deliberate errors such as SDL_QUIT_renamed_SDL_EVENT_QUIT. Defining
// SDL_ENABLE_OLD_NAMES maps the renamed ones back, so only the real API
// changes are left. Two lines are traps: the SDL_Init check compiles either
// way and takes the wrong branch, and SDL_Rect only fails once SDL_RenderCopy
// has been renamed (the new function wants an SDL_FRect).

type Line = {
  sdl2: string;
  sdl3: string;
  /** Error for the SDL2 form, or null if it compiles. `old` = with SDL_ENABLE_OLD_NAMES. */
  err: (old: boolean) => string | null;
  whyKey: string;
  why: string;
};

const LINES: Line[] = [
  { sdl2: "#include <SDL.h>", sdl3: "#include <SDL3/SDL.h>",
    err: () => "fatal error: SDL.h: No such file or directory",
    whyKey: "w0", why: "SDL3's headers live in an SDL3/ folder, so SDL2 and SDL3 can be installed side by side." },
  { sdl2: "if (SDL_Init(SDL_INIT_VIDEO) != 0) {", sdl3: "if (!SDL_Init(SDL_INIT_VIDEO)) {",
    err: () => null,
    whyKey: "w1", why: "SDL_Init now returns bool: true means success. The old check still compiles, because true != 0 is a valid comparison. It is the one change the compiler cannot catch." },
  { sdl2: "    SDL_Log(\"init: %s\", SDL_GetError()); return 1; }", sdl3: "    SDL_Log(\"init: %s\", SDL_GetError()); return 1; }",
    err: () => null, whyKey: "w2", why: "Unchanged: SDL_Log and SDL_GetError work the same in both versions." },
  { sdl2: "SDL_Window* win = SDL_CreateWindow(\"Game\", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 1280, 720, 0);",
    sdl3: "SDL_Window* win = SDL_CreateWindow(\"Game\", 1280, 720, 0);",
    err: () => "error: too many arguments to function 'SDL_Window* SDL_CreateWindow(const char*, int, int, SDL_WindowFlags)'",
    whyKey: "w3", why: "The position arguments are gone. A new window is placed by the window manager; SDL_SetWindowPosition moves it if you need to." },
  { sdl2: "SDL_Renderer* ren = SDL_CreateRenderer(win, -1, SDL_RENDERER_ACCELERATED);",
    sdl3: "SDL_Renderer* ren = SDL_CreateRenderer(win, nullptr);",
    err: (old) => old ? "error: 'SDL_RENDERER_ACCELERATED' was not declared in this scope"
                      : "error: 'SDL_RENDERER_ACCELERATED_deprecated_remove_this_line' was not declared in this scope",
    whyKey: "w4", why: "The index and the flags are gone. The second argument is a backend name (\"direct3d12\", \"vulkan\", …) or nullptr to let SDL pick the best one. Every renderer is accelerated when the machine allows it." },
  { sdl2: "SDL_Texture* tex = SDL_CreateTextureFromSurface(ren, surf);", sdl3: "SDL_Texture* tex = SDL_CreateTextureFromSurface(ren, surf);",
    err: () => null, whyKey: "w5", why: "Unchanged." },
  { sdl2: "SDL_FreeSurface(surf);", sdl3: "SDL_DestroySurface(surf);",
    err: (old) => old ? null : "error: 'SDL_FreeSurface_renamed_SDL_DestroySurface' was not declared in this scope",
    whyKey: "w6", why: "Every SDL object is now released with a Destroy function. The error message itself names the new function." },
  { sdl2: "if (e.type == SDL_QUIT) running = false;", sdl3: "if (e.type == SDL_EVENT_QUIT) running = false;",
    err: (old) => old ? null : "error: 'SDL_QUIT_renamed_SDL_EVENT_QUIT' was not declared in this scope",
    whyKey: "w7", why: "Every event type got the SDL_EVENT_ prefix: SDL_KEYDOWN is now SDL_EVENT_KEY_DOWN, SDL_MOUSEMOTION is SDL_EVENT_MOUSE_MOTION." },
  { sdl2: "if (e.key.keysym.sym == SDLK_ESCAPE) running = false;", sdl3: "if (e.key.key == SDLK_ESCAPE) running = false;",
    err: () => "error: 'struct SDL_KeyboardEvent' has no member named 'keysym'",
    whyKey: "w8", why: "The keysym struct was flattened: the key code is e.key.key, the scancode e.key.scancode, the modifiers e.key.mod. No macro can rename a struct member, so this one never compiles." },
  { sdl2: "SDL_Rect dst{x, y, 64, 64};", sdl3: "SDL_FRect dst{x, y, 64.0f, 64.0f};",
    err: () => null,
    whyKey: "w9", why: "SDL_Rect still exists (integer rectangles are used for windows and clipping), so this line compiles on its own. But SDL_RenderTexture takes an SDL_FRect: the 2D renderer works in floats end to end." },
  { sdl2: "SDL_RenderCopy(ren, tex, nullptr, &dst);", sdl3: "SDL_RenderTexture(ren, tex, nullptr, &dst);",
    err: (old) => old ? null : "error: 'SDL_RenderCopy_renamed_SDL_RenderTexture' was not declared in this scope",
    whyKey: "w10", why: "Renamed to say what it draws. With the new name the compiler finally checks the arguments, which is how the SDL_Rect above gets caught." },
];

const RECT = 9, COPY = 10, INIT = 1;
const RECT_ERR = "error: cannot convert 'SDL_Rect*' to 'const SDL_FRect*'";

type Msg = { line: number; text: string };

function build(fixed: boolean[], old: boolean): Msg[] {
  if (!fixed[0]) return [{ line: 0, text: LINES[0].err(old)! }, { line: -1, text: "compilation terminated." }];
  const out: Msg[] = [];
  LINES.forEach((l, i) => {
    if (fixed[i]) return;
    const e = l.err(old);
    if (e) out.push({ line: i, text: e });
  });
  // SDL_RenderTexture (the new name, or the old one mapped by SDL_ENABLE_OLD_NAMES) rejects an SDL_Rect
  const copyResolves = fixed[COPY] || old;
  if (!fixed[RECT] && copyResolves) out.push({ line: COPY, text: RECT_ERR });
  return out.sort((a, b) => a.line - b.line);
}

export function PortSdl2Figure({ t }: { t?: TrackTranslations }) {
  const [fixed, setFixed] = useState<boolean[]>(() => LINES.map(() => false));
  const [old, setOld] = useState(false);
  const [sel, setSel] = useState(INIT);
  const [out, setOut] = useState<"none" | "build" | "run">("none");

  const errors = build(fixed, old);
  const compiles = errors.length === 0;
  const toggle = (i: number) => { setFixed(f => f.map((v, j) => (j === i ? !v : v))); setSel(i); setOut("none"); };
  const allFixed = () => { setFixed(LINES.map(() => true)); setOut("none"); };
  const reset = () => { setFixed(LINES.map(() => false)); setOut("none"); setSel(INIT); };
  const changeable = (i: number) => LINES[i].sdl2 !== LINES[i].sdl3;
  const nErr = errors.filter(e => e.line >= 0).length;

  return (
    <Figure
      title={tx(t, "figSdlPort_title", "Porting an SDL2 program, line by line")}
      head={<>
        <Btn active={old} onClick={() => { setOld(o => !o); setOut("none"); }}>SDL_ENABLE_OLD_NAMES</Btn>
        <Btn onClick={allFixed}>{tx(t, "figSdlPort_fixAll", "fix all")}</Btn>
        <Btn onClick={reset}>{tx(t, "figSdlPort_reset", "back to SDL2")}</Btn>
      </>}
      controls={<>
        <Row>
          <Btn active={out === "build"} onClick={() => setOut("build")}>{tx(t, "figSdlPort_build", "Build")}</Btn>
          <Btn active={out === "run"} onClick={() => setOut(compiles ? "run" : "build")}>{tx(t, "figSdlPort_run", "Run")}</Btn>
          <Readout color={compiles ? C.green : C.red}>
            {compiles ? tx(t, "figSdlPort_ok", "0 errors") : `${nErr} ${tx(t, "figSdlPort_errs", "error(s)")}`}
          </Readout>
        </Row>
        <p className="text-[12.5px] leading-relaxed">
          <span className="font-mono text-[var(--text-main)]">{tx(t, "figSdlPort_line", "line")} {sel + 1}: </span>
          {tx(t, `figSdlPort_${LINES[sel].whyKey}`, LINES[sel].why)}
        </p>
      </>}
      note={tx(t, "figSdlPort_note", "Click a line to switch it between its SDL2 and SDL3 form, then Build. A missing header stops the compiler at once; after that it lists every error, and each renamed function or constant names its replacement in the error itself. Turn on SDL_ENABLE_OLD_NAMES to see which errors are only renames. Two lines are traps: the SDL_Init check compiles in both forms, and the SDL_Rect line only fails once SDL_RenderCopy is fixed. Run the program with the SDL_Init line still in SDL2 form to see the silent bug.")}
    >
      <div className="p-3 md:p-4 space-y-3">
        <ol className="font-mono text-[11.5px] leading-[1.55] overflow-x-auto">
          {LINES.map((l, i) => {
            const isFixed = fixed[i] && changeable(i);
            const bad = errors.some(e => e.line === i);
            return (
              <li key={i}>
                <button type="button" onClick={() => (changeable(i) ? toggle(i) : setSel(i))}
                  className={`w-full text-left flex gap-3 px-2 rounded-md whitespace-pre transition-colors ${sel === i ? "bg-[var(--primary-low)]" : "hover:bg-[var(--surface)]"}`}>
                  <span className="w-5 text-right flex-shrink-0" style={{ color: C.axis }}>{i + 1}</span>
                  <span className="w-12 flex-shrink-0 text-[9.5px] pt-[2px] font-semibold"
                    style={{ color: !changeable(i) ? C.axis : isFixed ? C.green : bad && out !== "none" ? C.red : C.amber }}>
                    {!changeable(i) ? "" : isFixed ? "SDL3" : "SDL2"}
                  </span>
                  <span style={{ color: isFixed ? C.fg : C.muted }}>{isFixed ? l.sdl3 : l.sdl2}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {out === "build" && (
          <pre className="font-mono text-[11px] leading-relaxed rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 overflow-x-auto whitespace-pre-wrap">
            {compiles
              ? <span style={{ color: C.green }}>{tx(t, "figSdlPort_built", "[100%] Built target game")}</span>
              : errors.map((e, k) => (
                <div key={k} style={{ color: e.line < 0 ? C.muted : C.red }}>
                  {e.line >= 0 ? `main.cpp:${e.line + 1}: ` : ""}{e.text}
                </div>
              ))}
          </pre>
        )}

        {out === "run" && compiles && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-[11px] leading-relaxed">
            <div style={{ color: C.muted }}>$ ./game</div>
            {fixed[INIT] ? (
              <div style={{ color: C.green }}>{tx(t, "figSdlPort_runOk", "(a 1280×720 window titled \"Game\" opens and runs)")}</div>
            ) : (<>
              <div style={{ color: C.fg }}>INFO: init: </div>
              <div style={{ color: C.muted }}>$ echo $?</div>
              <div style={{ color: C.fg }}>1</div>
              <div className="pt-2 font-sans text-[12px]" style={{ color: C.red }}>
                {tx(t, "figSdlPort_runBad", "SDL_Init succeeded and returned true. true != 0 is true, so the program took the failure branch, printed an empty error (nothing failed) and quit with code 1. No compiler warned you.")}
              </div>
            </>)}
          </div>
        )}
      </div>
    </Figure>
  );
}

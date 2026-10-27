"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// The folder `cmake --install` makes, unzipped on a clean computer (nothing
// installed but the system: no SDL, no Visual C++ runtime). Untick a file to
// leave it out of the zip, or a CMake line to remove it from the build, and
// the right side shows what the player sees: the system's loader refusing to
// start (Windows dialog, Linux terminal), the project's own message box from
// fail(), or the game running with something wrong. The first problem in
// start-up order wins, as on a real machine. Messages are the real ones:
// Windows' loader, glibc's ld.so, and SDL_IOFromFile's "Couldn't open".

type Os = "windows" | "linux";
type Stage = "loader" | "box" | "run" | "legal";
type Item = { id: string; label: string; cmake?: boolean; stage: Stage; en: string; msg?: string };

const DIR: Record<Os, string> = { windows: "C:\\Users\\player\\Downloads\\SDL3Lab-1.0\\", linux: "/home/player/Games/SDL3Lab-1.0/" };
const NOT_FOUND: Record<Os, string> = { windows: "The system cannot find the file specified.", linux: "No such file or directory" };
const asset = (os: Os, f: string) => `${DIR[os]}assets${os === "windows" ? "\\" : "/"}${f}`;

function items(os: Os): Item[] {
  const shared: Item[] = [
    { id: "hero", label: "assets/hero.png", stage: "box", msg: `Loading hero.png failed:\nCouldn't open ${asset(os, "hero.png")}: ${NOT_FOUND[os]}`,
      en: "SDL starts, the window opens, and loadTexture fails. fail() shows the error in a message box, so the player can read what is missing, and SDL_AppInit returns SDL_APP_FAILURE." },
    { id: "font", label: "assets/Micro5-Regular.ttf", stage: "box", msg: `TTF_OpenFont failed:\nCouldn't open ${asset(os, "Micro5-Regular.ttf")}: ${NOT_FOUND[os]}`,
      en: "Same path as the sprite: TTF_OpenFont opens the file with SDL_IOFromFile, which sets the same \"Couldn't open\" error, and fail() shows it." },
    { id: "wav", label: "assets/pickup.wav", stage: "run",
      en: "The game runs, silent. initAudio stops at SDL_LoadWAV, before it opens the device, so the music is gone too, not only the chime. That is the design: sound is not essential. The log says \"No sound: Couldn't open …pickup.wav\", but nobody reads a log on a player's machine." },
    { id: "lic", label: "licenses/", stage: "legal",
      en: "Nothing visible: the game runs perfectly. But Micro 5's licence (OFL) and HarfBuzz's must travel with every copy, and FreeType's asks for a credit line in your documentation. Without the folder, the zip breaks terms the game depends on." },
  ];
  if (os === "windows") return [
    { id: "crt", label: "CMAKE_MSVC_RUNTIME_LIBRARY \"MultiThreaded…\"", cmake: true, stage: "loader", msg: "The code execution cannot proceed because VCRUNTIME140.dll was not found. Reinstalling the program may fix this problem.",
      en: "Without this line every file needs Microsoft's C and C++ runtime DLLs (VCRUNTIME140.dll, MSVCP140.dll). Your PC has them, because Visual Studio installed them. A clean one does not, until the player installs the Visual C++ Redistributable." },
    { id: "win32", label: "add_executable(game WIN32 …)", cmake: true, stage: "run",
      en: "The game runs, but a black console window opens with it and stays behind it. Closing the console closes the game. WIN32 makes game.exe a window program that starts no console; SDL_main.h supplies the WinMain that such a program needs." },
    { id: "sdl", label: "SDL3.dll", stage: "loader", msg: "The code execution cannot proceed because SDL3.dll was not found. Reinstalling the program may fix this problem.",
      en: "Windows loads every DLL that game.exe was linked against before a single line of main.cpp runs, and looks for them next to the .exe first. Missing one, the program never starts, and your own error handling never gets a chance." },
    { id: "ttf", label: "SDL3_ttf.dll", stage: "loader", msg: "The code execution cannot proceed because SDL3_ttf.dll was not found. Reinstalling the program may fix this problem.",
      en: "The same for the second library. FreeType and HarfBuzz are built into SDL3_ttf.dll, so they need no file of their own." },
    ...shared,
  ];
  return [
    { id: "rpath", label: "CMAKE_INSTALL_RPATH \"$ORIGIN\"", cmake: true, stage: "loader", msg: "./game: error while loading shared libraries: libSDL3.so.0: cannot open shared object file: No such file or directory",
      en: "The libraries are in the folder, but the loader does not look there: it searches the paths stored in the program (its RPATH) and then the system's folders. In the build folder CMake stores the build paths; cmake --install removes them. $ORIGIN means \"the folder this program is in\". On a machine with SDL3 installed the game would start anyway, with that machine's SDL, which is worse: it hides the bug." },
    { id: "sdl", label: "libSDL3.so.0", stage: "loader", msg: "./game: error while loading shared libraries: libSDL3.so.0: cannot open shared object file: No such file or directory",
      en: "The loader opens every library the program needs before main runs. The name it asks for is the soname, libSDL3.so.0; cmake --install also copies the file that link points to, libSDL3.so.0.4.18." },
    { id: "ttf", label: "libSDL3_ttf.so.0", stage: "loader", msg: "./game: error while loading shared libraries: libSDL3_ttf.so.0: cannot open shared object file: No such file or directory",
      en: "The same for SDL3_ttf. FreeType and HarfBuzz are built into it, so they need no file of their own." },
    ...shared,
  ];
}

const ORDER: Stage[] = ["loader", "box", "run", "legal"];
const SHARED = ["hero", "font", "wav", "lic"];      // same text on both systems: one translation key

export function ShipFolderFigure({ t }: { t?: TrackTranslations }) {
  const [os, setOs] = useState<Os>("windows");
  const [off, setOff] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<string | null>(null);

  const list = items(os);
  const missing = list.filter(i => off.has(i.id));
  const first = ORDER.map(s => missing.find(i => i.stage === s)).find(Boolean) ?? null;
  const fatal = first && (first.stage === "loader" || first.stage === "box") ? first : null;
  const shown = list.find(i => i.id === sel) ?? first;

  const flip = (id: string) => {
    setOff(o => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    setSel(id);
  };
  const choose = (o: Os) => { setOs(o); setOff(new Set()); setSel(null); };
  const hasConsole = os === "windows" && off.has("win32");
  const silent = off.has("wav");

  return (
    <Figure
      title={tx(t, "figSdlShip_title", "Untick a file, run it on a clean computer")}
      head={<>
        <Btn active={os === "windows"} onClick={() => choose("windows")}>Windows</Btn>
        <Btn active={os === "linux"} onClick={() => choose("linux")}>Linux</Btn>
        <Btn onClick={() => { setOff(new Set()); setSel(null); }}>{tx(t, "figSdlShip_all", "all in")}</Btn>
      </>}
      controls={shown ? (
        <p className="text-[12.5px] leading-relaxed">
          <span className="font-semibold" style={{ color: off.has(shown.id) ? (shown.stage === "loader" || shown.stage === "box" ? C.red : C.amber) : C.green }}>
            {shown.label}:{" "}
          </span>
          {tx(t, `figSdlShip_${SHARED.includes(shown.id) ? "" : `${os}_`}${shown.id}`, shown.en)}
        </p>
      ) : undefined}
      note={tx(t, "figSdlShip_note", "The left side is the zip you send: what cmake --install put in dist/, and the CMake lines that decide how those files were built. The right side is the player's computer, which has never seen Visual Studio or SDL. Untick something to leave it out. When several things are missing, the player sees the first failure in start-up order: the system's loader, then SDL_AppInit, then the game itself.")}
    >
      <div className="grid gap-3 p-3 md:p-4 md:grid-cols-[1fr_1.15fr] items-start">
        <ul className="space-y-0.5">
          <li className="px-2 font-mono text-[11px] text-[var(--text-muted)]">SDL3Lab-1.0/</li>
          {list.map(i => (
            <li key={i.id}>
              <label className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer ${shown?.id === i.id ? "bg-[var(--primary-low)]" : "hover:bg-[var(--surface)]"}`}>
                <input type="checkbox" checked={!off.has(i.id)} onChange={() => flip(i.id)} className="accent-[var(--primary)]" />
                <span className="min-w-0 font-mono text-[11px] [overflow-wrap:anywhere]">
                  {i.cmake ? <span className="block text-[9.5px] font-sans font-semibold" style={{ color: C.axis }}>CMakeLists.txt</span> : <span className="text-[var(--text-muted)]">├─ </span>}
                  <span style={{ color: off.has(i.id) ? C.red : C.fg, textDecoration: off.has(i.id) ? "line-through" : "none" }}>{i.label}</span>
                </span>
              </label>
            </li>
          ))}
          <li className="px-2 pt-1 font-mono text-[11px] text-[var(--text-muted)]">└─ {os === "windows" ? "game.exe" : "game"}</li>
        </ul>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 min-h-[13rem] flex flex-col justify-center relative">
          {fatal?.stage === "loader" && os === "windows" && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-[12px] shadow-sm">
              <p className="font-semibold text-[var(--text-main)] mb-1.5">game.exe – {tx(t, "figSdlShip_sysErr", "System Error")}</p>
              <p className="text-[var(--text-muted)]">{fatal.msg}</p>
            </div>
          )}
          {fatal?.stage === "loader" && os === "linux" && (
            <pre className="rounded-md bg-[#0b0d12] p-3 font-mono text-[11px] whitespace-pre-wrap" style={{ color: "#e5e7eb" }}>
              {"$ ./game\n"}<span style={{ color: C.red }}>{fatal.msg}</span>
            </pre>
          )}
          {fatal?.stage === "box" && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-[12px] shadow-sm">
              <p className="font-semibold text-[var(--text-main)] mb-1.5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="7.5" fill={C.red} /><path d="M5 5l6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.6" /></svg>
                SDL3 Lab
              </p>
              <p className="text-[var(--text-muted)] whitespace-pre-wrap break-all">{fatal.msg}</p>
              <p className="mt-2 text-right"><span className="inline-block rounded border border-[var(--border)] px-3 py-0.5 text-[11px] text-[var(--text-main)]">OK</span></p>
            </div>
          )}
          {!fatal && (
            <div className="relative">
              {hasConsole && (
                <div className="absolute -top-1 -left-1 right-6 bottom-6 rounded-md bg-[#0c0c0c] border border-[#333] p-1.5 font-mono text-[9.5px] text-[#ccc] overflow-hidden">
                  {DIR.windows}game.exe{silent ? `\nINFO: No sound: Couldn't open ${asset("windows", "pickup.wav")}: ${NOT_FOUND.windows}` : ""}
                </div>
              )}
              <div className={`rounded-md overflow-hidden border border-[var(--border)] shadow-sm relative ${hasConsole ? "ml-6 mt-6" : ""}`}>
                <div className="flex items-center justify-between px-2 py-1 bg-[var(--card)] text-[11px]">
                  <span className="text-[var(--text-main)]">SDL3 Lab</span>
                  <span className="text-[var(--text-muted)] font-mono text-[10px]">{silent ? tx(t, "figSdlShip_silent", "no sound") : tx(t, "figSdlShip_sound", "chime + music")}</span>
                </div>
                <div className="relative font-mono" style={{ aspectRatio: "16 / 9", background: "#10121a" }}>
                  <span className="absolute left-[1.5%] top-[2%] text-[10px]" style={{ color: "#facc15" }}>Score 0</span>
                  <span className="absolute left-[1.5%] top-[11%] text-[10px]" style={{ color: "#94a3b8" }}>Best 12 (2026-10-20)</span>
                  <span className="absolute right-[1.5%] top-[2%] text-[10px]" style={{ color: "#94a3b8" }}>60 fps</span>
                  {/* drawn at twice the game's scale, so the sprite reads at this size */}
                  <span className="absolute left-[66%] top-[30%] w-[3.5%] aspect-square rotate-45" style={{ background: "linear-gradient(135deg, #22d3ee, #0773a6)" }} />
                  <span className="absolute left-[45%] top-[41%] w-[10%] aspect-square"
                    style={{ backgroundImage: "url(/sdl3/hero.png)", backgroundSize: "400% 200%", backgroundPosition: "0 0", imageRendering: "pixelated" }} />
                </div>
              </div>
            </div>
          )}
          {off.has("lic") && !fatal && (
            <p className="mt-2 text-[11px]" style={{ color: C.amber }}>{tx(t, "figSdlShip_legal", "Runs perfectly, and the zip still breaks three licences.")}</p>
          )}
        </div>
      </div>
    </Figure>
  );
}

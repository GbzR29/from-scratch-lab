"use client";

// SDL3 track — "SDL3 vs SDL2": what SDL is and what it does not do; why a new
// major version; the changes that break SDL2 code, with SDL_oldnames.h's
// deliberate errors and the PortSdl2 figure; the silent return-value flip;
// what is new in 3.2 and 3.4; the odd/even version policy.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { PortSdl2Figure } from "@/components/lesson/figures/sdl3/PortSdl2Figure";

export function WhatsNewContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl01_intro",
          "SDL is the layer between your game and the operating system. It opens the window, reads the keyboard and the gamepad, plays the sound and gives you a way to draw. SDL3 is its new major version: 3.2.0, in January 2025, was the first stable release, and the current line is 3.4. It is not a drop-in upgrade from SDL2, and most tutorials online are still written for SDL2. This chapter shows what changed, so that old code and old answers stop confusing you.")}
      </Lead>

      <Goals t={t} id="sdl01" items={[
        "Say what SDL does for a game, and what it leaves to you.",
        "Recognize the changes that break SDL2 code, and fix them.",
        "Spot the one change the compiler cannot catch.",
        "Name what SDL3 adds that SDL2 never had.",
      ]} />

      <H2>{tx(t, "sdl01_jobTitle", "What SDL does for you")}</H2>
      <p>
        {tx(t, "sdl01_jobBody",
          "Every operating system has its own way to open a window, read a key or play a sound. On Windows it is Win32 and WASAPI. On Linux it is X11 or Wayland and PipeWire. On macOS it is Cocoa and Core Audio. SDL wraps all of them behind one C API. You write SDL calls; SDL makes the native ones.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl01_jh0", "Job"), tx(t, "sdl01_jh1", "SDL3 API"), tx(t, "sdl01_jh2", "Chapter")]}
        rows={[
          [tx(t, "sdl01_j1", "Windows and the program's lifetime"), "SDL_CreateWindow, SDL_AppIterate", tx(t, "sdl01_j1c", "Setup, The Main Loop")],
          [tx(t, "sdl01_j2", "Keyboard, mouse, gamepads, touch"), "SDL_Event, SDL_Gamepad", tx(t, "sdl01_j2c", "Events & Input")],
          [tx(t, "sdl01_j3", "2D drawing: shapes, sprites, text"), "SDL_Renderer, SDL3_ttf", tx(t, "sdl01_j3c", "The 2D Renderer, Textures, Text")],
          [tx(t, "sdl01_j4", "Sound"), "SDL_AudioStream", tx(t, "sdl01_j4c", "Audio Streams")],
          [tx(t, "sdl01_j5", "Modern 3D graphics"), "SDL_GPU", tx(t, "sdl01_j5c", "SDL_GPU")],
          [tx(t, "sdl01_j6", "Time, files, threads"), "SDL_GetTicksNS, SDL_Storage", tx(t, "sdl01_j6c", "Time, Files & Shipping")],
        ]}
      />
      <p>
        {tx(t, "sdl01_notBody",
          "SDL is a library, not an engine. It has no scenes, no physics, no collision and no editor. It gives you a window and the raw input, and the game itself is your code. That is the point of learning it: nothing is hidden.")}
      </p>

      <H2>{tx(t, "sdl01_whyTitle", "Why a new major version")}</H2>
      <p>
        {tx(t, "sdl01_whyBody",
          "SDL2 shipped in 2013. For over ten years it kept its ABI stable: a program built against an old SDL2 keeps working with a newer SDL2 library. That promise had a cost. Inconsistent names and odd return values could never be fixed, because fixing them would break existing programs.")}
      </p>
      <p>
        {tx(t, "sdl01_whyBody2",
          "SDL3 broke compatibility once, on purpose. It made the names consistent, made every function report errors the same way, added a modern GPU API, and changed the main loop so the same code runs on desktop, phones and the web.")}
      </p>

      <H2>{tx(t, "sdl01_tableTitle", "The changes that break your code")}</H2>
      <LessonTable
        headers={["SDL2", "SDL3", tx(t, "sdl01_h2", "Why")]}
        rows={[
          ["#include <SDL.h>",        "#include <SDL3/SDL.h>",      tx(t, "sdl01_r0", "The headers live in an SDL3/ folder, so both versions can be installed side by side.")],
          ["int SDL_Init(...) == 0",  "bool SDL_Init(...) == true", tx(t, "sdl01_r1", "Every function that can fail now returns bool. true is success.")],
          ["SDL_bool / SDL_TRUE",     "bool / true",                tx(t, "sdl01_r2", "SDL3 requires C99 or newer, so the real bool type is used.")],
          ["SDL_CreateWindow(t,x,y,w,h,f)", "SDL_CreateWindow(t,w,h,f)", tx(t, "sdl01_r3", "The position is left to the window manager, or set separately.")],
          ["SDL_CreateRenderer(w,-1,flags)", "SDL_CreateRenderer(w,name)", tx(t, "sdl01_r3b", "No index and no flags: pass a backend name, or nullptr to let SDL choose.")],
          ["SDL_Rect (int)",          "SDL_FRect (float)",          tx(t, "sdl01_r4", "The 2D renderer works in floats end to end: smooth motion, no rounding.")],
          ["SDL_QUIT",                "SDL_EVENT_QUIT",             tx(t, "sdl01_r5", "All event types got the SDL_EVENT_ prefix.")],
          ["event.key.keysym.sym",    "event.key.key",              tx(t, "sdl01_r6", "The keysym struct was flattened into the event.")],
          ["SDL_RenderCopy",          "SDL_RenderTexture",          tx(t, "sdl01_r7", "Renderer functions were renamed to say what they draw.")],
          ["SDL_FreeSurface",         "SDL_DestroySurface",         tx(t, "sdl01_r8", "Destroy is now used for every SDL object.")],
          ["SDL_GetTicks() (Uint32)", "SDL_GetTicks() (Uint64), SDL_GetTicksNS()", tx(t, "sdl01_r9", "64-bit time: no wraparound after 49 days, and a nanosecond version.")],
          ["SDL_INIT_TIMER, SDL_INIT_EVERYTHING", tx(t, "sdl01_r10k", "removed"), tx(t, "sdl01_r10", "Timers are always available; list the subsystems you use explicitly.")],
        ]}
      />
      <p>
        {tx(t, "sdl01_oldBody",
          "You do not have to remember this table. SDL3's headers include SDL_oldnames.h, which defines every old name as a deliberate error that spells out the new one. If you write SDL_RenderCopy, the compiler complains that SDL_RenderCopy_renamed_SDL_RenderTexture is not declared. The error message is the migration guide.")}
      </p>
      <p>
        {tx(t, "sdl01_oldBody2",
          "While porting a big codebase, you can define SDL_ENABLE_OLD_NAMES in your project. The old names then work again as aliases, so you can fix the real API changes first and rename later. SDL also ships a script, build-scripts/rename_symbols.py, that renames everything in a source folder for you.")}
      </p>

      <PortSdl2Figure t={t} />

      <H2>{tx(t, "sdl01_silentTitle", "The one change the compiler cannot catch")}</H2>
      <p>
        {tx(t, "sdl01_silentBody",
          "In SDL2, functions that could fail returned an int: 0 for success and a negative number for failure. That is the usual C convention. In SDL3 they return bool: true for success. An old check like != 0 still compiles, because comparing a bool with 0 is valid C and C++. It just means the opposite now.")}
      </p>
      <CodeBlock lang="cpp" filename="convention.cpp" t={t}>{`// SDL2: 0 means success, negative means failure
if (SDL_Init(SDL_INIT_VIDEO) != 0) {
    SDL_Log("error: %s", SDL_GetError());
    return 1;
}

// SDL3: true means success
if (!SDL_Init(SDL_INIT_VIDEO)) {
    SDL_Log("error: %s", SDL_GetError());
    return 1;
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl01_sh0", "Old check, built against SDL3"), tx(t, "sdl01_sh1", "What happens")]}
        rows={[
          ["if (SDL_Init(...) != 0)", tx(t, "sdl01_s1", "true != 0 is true, so every success takes the error branch. The program quits at once with an empty error message.")],
          ["if (SDL_Init(...) < 0)", tx(t, "sdl01_s2", "A bool is never below 0, so the check never fires. Real failures go unnoticed, and the crash comes later, far from the cause.")],
          ["if (SDL_Init(...))", tx(t, "sdl01_s3", "Written as \"if it returned an error code\", it now runs the error branch on success.")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "sdl01_portWarn",
          "When you port SDL2 code, search for every SDL call used inside a condition and check it by hand before running anything. The compiler gives no warning for any of these.")}
      </Callout>

      <H2>{tx(t, "sdl01_newTitle", "What is genuinely new")}</H2>
      <LessonTable
        headers={[tx(t, "sdl01_nh0", "Feature"), tx(t, "sdl01_nh1", "What it gives you"), tx(t, "sdl01_nh2", "Since")]}
        rows={[
          [tx(t, "sdl01_n1t", "SDL_GPU"), tx(t, "sdl01_n1b", "A modern graphics API over Vulkan, Direct3D 12 and Metal, from one source. It is the reason many people move to SDL3 at all."), "3.2"],
          [tx(t, "sdl01_n2t", "Main callbacks"), tx(t, "sdl01_n2b", "You write four functions and SDL runs the loop. The same code then works on iOS, Android and the web."), "3.2"],
          [tx(t, "sdl01_n3t", "Properties"), tx(t, "sdl01_n3b", "A key-value store on every SDL object. New and platform-specific options become properties instead of new functions."), "3.2"],
          [tx(t, "sdl01_n4t", "Storage"), tx(t, "sdl01_n4b", "Separate title storage (read-only game data) and user storage (saves), which consoles require."), "3.2"],
          [tx(t, "sdl01_n5t", "Camera, pens, async I/O"), tx(t, "sdl01_n5b", "Webcam capture, pressure-sensitive pens and asynchronous file reads in the core library."), "3.2"],
          [tx(t, "sdl01_n6t", "Shaders in the 2D renderer"), tx(t, "sdl01_n6b", "The GPU-backed 2D renderer can run your own fragment shader (SDL_CreateGPURenderState)."), "3.4"],
          [tx(t, "sdl01_n7t", "PNG built in"), tx(t, "sdl01_n7b", "SDL_LoadPNG and SDL_SavePNG without SDL3_image."), "3.4"],
          [tx(t, "sdl01_n8t", "Pixel-art scaling"), tx(t, "sdl01_n8b", "SDL_SCALEMODE_PIXELART keeps pixels sharp when sprites are scaled by uneven amounts."), "3.4"],
        ]}
      />

      <H2>{tx(t, "sdl01_versionTitle", "Reading a version number")}</H2>
      <p>
        {tx(t, "sdl01_versionBody",
          "SDL3 uses an odd/even rule. When the minor and the patch number are both even, as in 3.2.0 or 3.4.18, the release is stable and meant for real projects. An odd number, as in the 3.3.x releases, marks a development preview. A newer patch of the same line only fixes bugs: a program built against 3.4.0 runs with the 3.4.18 library.")}
      </p>
      <p>
        {tx(t, "sdl01_versionBody2",
          "The satellite libraries (SDL3_image, SDL3_ttf, SDL3_mixer) have their own version numbers. SDL also adds functions between minor versions. So if a snippet does not compile, check first that you have the version it was written for. This track uses SDL 3.4.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "sdl01_migTip",
          "The official list of every renamed and removed function is docs/README-migration.md in the SDL repository. Keep it open in a tab while you port; it is more reliable than guessing from the new headers.")}
      </Callout>

      <KeyIdeas t={t} id="sdl01" items={[
        "SDL wraps each system's window, input, audio and graphics APIs behind one C API; it is a library, not an engine.",
        "SDL3 broke compatibility with SDL2 once, on purpose, to fix names and conventions that SDL2 could never change.",
        "Old names are deliberate errors that name their replacement (SDL_QUIT_renamed_SDL_EVENT_QUIT); SDL_ENABLE_OLD_NAMES maps them back while porting.",
        "Functions that can fail return bool, true for success; an old != 0 or < 0 check compiles and silently does the wrong thing.",
        "The 2D renderer uses SDL_FRect and floats everywhere; event types start with SDL_EVENT_.",
        "New in SDL3: SDL_GPU, main callbacks, properties, storage; 3.4 adds shaders in the 2D renderer and built-in PNG.",
        "Even minor and patch numbers are stable releases; this track uses SDL 3.4.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "setup", title: tx(t, "sdl01_rel1", "Setup & First Window"), why: tx(t, "sdl01_rel1b", "the next step: SDL3 in a CMake project and the first window.") },
        { track: "OpenGL", id: "setup", title: tx(t, "sdl01_rel2", "Window & Context (OpenGL)"), why: tx(t, "sdl01_rel2b", "the same job done with GLFW, with a table mapping it to SDL3.") },
      ]} />
    </Article>
  );
}

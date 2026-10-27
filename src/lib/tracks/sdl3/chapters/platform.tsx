"use client";

// SDL3 track — "Time, Files & Shipping": the three clocks (ticks, performance
// counter, wall clock); base path vs pref path, with the PrefPath figure; a
// small versioned save format; saving with temp file + flush + rename, with
// the SaveCrash figure; fatal errors in a message box, SDL_GetError and log
// priorities; the project: a best score that survives (complete main.cpp);
// a shippable build: static MSVC runtime, WIN32, RPATH, install rules,
// licences (complete CMakeLists.txt), with the ShipFolder figure; other
// platforms; common mistakes. Facts checked in SDL 3.4.18 (SDL_filesystem.h,
// filesystem/*/SDL_sysfilesystem.c, SDL_sysfsops.c, SDL_iostream.c,
// SDL_genericstorage.c, SDL_log.c, SDL_hints.h, CMakeLists.txt) and SDL_ttf 3.2.2.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { PrefPathFigure } from "@/components/lesson/figures/sdl3/PrefPathFigure";
import { SaveCrashFigure } from "@/components/lesson/figures/sdl3/SaveCrashFigure";
import { ShipFolderFigure } from "@/components/lesson/figures/sdl3/ShipFolderFigure";
import { MAIN_CPP, CMAKE_LISTS } from "./platformCode";

const r = String.raw;

export function PlatformContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl10_intro",
          "The game forgets everything when it closes, and it only runs on the computer that built it. This chapter fixes both. The best score is saved in the folder SDL gives every game for its files, in a way that survives a crash in the middle of the save, together with the date it was set. Then the build becomes a folder you can zip and send: it starts on a computer with nothing installed, and when something is missing it tells the player what.")}
      </Lead>

      <Goals t={t} id="sdl10" items={[
        "Pick the right clock: ticks for movement, the performance counter for measuring code, the wall clock for dates.",
        "Find the one folder a game may write to on every platform, and say why the game's own folder is the wrong one.",
        "Save a file so that a crash or a power cut at any moment still leaves a usable save.",
        "Show fatal errors where a player can see them, and control what SDL logs.",
        "Turn the project into a folder that runs on a computer with nothing installed.",
      ]} />

      <H2>{tx(t, "sdl10_timeTitle", "Three clocks")}</H2>
      <p>
        {tx(t, "sdl10_timeBody",
          "The project already reads one clock: SDL_GetTicksNS, for delta time. SDL has three, and each answers a different question.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl10_th0", "Clock"), tx(t, "sdl10_th1", "Counts"), tx(t, "sdl10_th2", "Use it for")]}
        rows={[
          ["SDL_GetTicksNS()", tx(t, "sdl10_t1", "nanoseconds since SDL_Init; never goes back"), tx(t, "sdl10_t1b", "movement, animation, timers: anything measured in game time")],
          ["SDL_GetPerformanceCounter()", tx(t, "sdl10_t2", "ticks of the finest timer the system has, from an arbitrary start"), tx(t, "sdl10_t2b", "measuring how long a piece of code takes")],
          ["SDL_GetCurrentTime(&now)", tx(t, "sdl10_t3", "nanoseconds since 1 January 1970, UTC: the calendar"), tx(t, "sdl10_t3b", "dates: when a record was set, a save's timestamp")],
        ]}
      />
      <p>
        {tx(t, "sdl10_perfBody",
          "The performance counter's ticks have no fixed length. SDL_GetPerformanceFrequency says how many there are per second (10 000 000 on current Windows, 1 000 000 000 on Linux), so a duration is a difference divided by that frequency:")}
      </p>
      <Equation label={tx(t, "sdl10_eqPerf", "Duration from the performance counter")}
        where={[
          [r`\Delta t`, tx(t, "sdl10_wDt", "the time between the two readings, in seconds")],
          [r`c_0,\ c_1`, tx(t, "sdl10_wC", "SDL_GetPerformanceCounter() before and after the code")],
          [r`f`, tx(t, "sdl10_wF", "SDL_GetPerformanceFrequency(): counter ticks per second")],
        ]}>
        {r`\Delta t = \frac{c_1 - c_0}{f}, \qquad \frac{14\,820}{10\,000\,000} = 0.00148\ \text{s} = 1.48\ \text{ms}`}
      </Equation>
      <p>
        {tx(t, "sdl10_wallBody",
          "The wall clock is the only one that knows the date, and the only one that can jump: the player changes the time, the system corrects itself from the internet, or the laptop wakes up from sleep. Movement computed from it would teleport the hero or run time backwards. Use it only to label things. SDL_TimeToDateTime turns its value into a year, month, day and time, in UTC or, with true as the last argument, in the player's time zone:")}
      </p>
      <CodeBlock lang="cpp" filename="date.cpp" t={t}>{`SDL_Time now = 0;                        // a Sint64: nanoseconds since 1970-01-01 UTC
SDL_GetCurrentTime(&now);

SDL_DateTime d;
SDL_TimeToDateTime(now, &d, true);       // true: the local time zone
SDL_Log("%04d-%02d-%02d", d.year, d.month, d.day);   // 2026-10-27`}</CodeBlock>

      <H2>{tx(t, "sdl10_fsTitle", "Where a game may write")}</H2>
      <p>
        {tx(t, "sdl10_fsBody",
          "The Textures chapter found the game's files with SDL_GetBasePath, the folder of the executable. It is tempting to write the save there too. It works while you develop, because the build folder is yours. Installed, the game lives somewhere players cannot write (Program Files, /opt, a signed .app), and the same line fails. SDL_GetPrefPath gives the folder that is meant for writing: one per user and per game, created the first time you ask.")}
      </p>
      <CodeBlock lang="cpp" filename="paths.cpp" t={t}>{`const char* base = SDL_GetBasePath();             // read from here; SDL owns it, do not free

char* prefs = SDL_GetPrefPath("Example", "SDL3 Lab");   // write here
if (prefs) {
    std::string savePath = std::string(prefs) + "best.txt";
    SDL_free(prefs);                                  // this one is yours to free
}`}</CodeBlock>
      <p>
        {tx(t, "sdl10_prefFig",
          "The two strings, org and app, become folder names. Try them on each platform, and write best.txt in each folder:")}
      </p>

      <PrefPathFigure t={t} />

      <LessonTable
        headers={[tx(t, "sdl10_rh0", "Rule for org and app"), tx(t, "sdl10_rh1", "Why")]}
        rows={[
          [tx(t, "sdl10_r1", "Letters, numbers and spaces only"), tx(t, "sdl10_r1b", "they are folder names on every system, and each system refuses different punctuation.")],
          [tx(t, "sdl10_r2", "Never change them after release"), tx(t, "sdl10_r2b", "a new string is a new folder: every player's old save stays behind in the old one.")],
          [tx(t, "sdl10_r3", "Always give an org"), tx(t, "sdl10_r3b", "an empty org is allowed for old code, but SDL then skips that folder even where an app store requires it.")],
          [tx(t, "sdl10_r4", "Check for NULL"), tx(t, "sdl10_r4b", "if the folder cannot be created, there is nowhere to save: run without saving and log why.")],
        ]}
      />

      <H2>{tx(t, "sdl10_formatTitle", "A save file")}</H2>
      <p>
        {tx(t, "sdl10_formatBody",
          "The project saves three lines of text. Text is easy to read when debugging and easy to check by hand; a game with a lot to save would use a binary format, as in the C/C++ track. The first line names the format and its version, so that a later version of the game can recognise an old file and convert it instead of misreading it.")}
      </p>
      <CodeBlock lang="text" filename="best.txt" t={t}>{`sdl3lab-save 1
best 13
date 2026-10-27`}</CodeBlock>
      <p>
        {tx(t, "sdl10_loadBody",
          "SDL_LoadFile reads a whole file into memory and adds a zero byte at the end, so the result can be read as a C string; you free it with SDL_free. SDL_sscanf then picks the numbers out and returns how many it found. Two cases are normal, not errors: on the first launch there is no file, and a file can be damaged or edited by hand. In both, the game starts with no record. A save must never be a reason for the game not to start.")}
      </p>

      <H2>{tx(t, "sdl10_safeTitle", "Saving without losing the save")}</H2>
      <p>
        {tx(t, "sdl10_safeBody",
          "The obvious way to save is one call: SDL_SaveFile(path, text, len). It opens the file with mode \"wb\", and \"w\" empties the file the moment it opens. Until the new bytes are written, there is no save at all, old or new. And a written byte is not yet on the disk: the system keeps it in memory and writes it out later, to group small writes together. A game that dies in that window leaves an empty file.")}
      </p>
      <p>
        {tx(t, "sdl10_safeBody2",
          "The safe way never touches the old file until the new one is complete. Write to a temporary file next to it, push it to the disk with SDL_FlushIO, then SDL_RenamePath it over the old name. A rename on the same disk is a single step for the file system (MoveFileExW with MOVEFILE_REPLACE_EXISTING on Windows, rename on the others): at any moment, best.txt is either the whole old file or the whole new one. Kill the game at every step of both ways:")}
      </p>

      <SaveCrashFigure t={t} />

      <p>
        {tx(t, "sdl10_flushBody",
          "SDL_FlushIO is what makes the power cut safe. On a file it calls FlushFileBuffers on Windows, fdatasync on Linux and F_FULLFSYNC on macOS, and it returns only when the drive says the bytes are stored. Without it, some file systems record the rename before the data, and a power cut can leave best.txt pointing at an empty file. SDL_CloseIO does not flush to the disk; it only gives the file back.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "sdl10_storageNote",
          "SDL3 also has a storage API: SDL_OpenUserStorage(org, app, 0) for saves, SDL_OpenTitleStorage for the game's own read-only files. On PC it uses the same folder as SDL_GetPrefPath; on consoles it maps to the system's save service, which is why console ports use it. Its SDL_WriteStorageFile also writes in place, so the same rule applies: write a temporary name, then SDL_RenameStoragePath.")}
      </Callout>
      <Callout type="tip" t={t}>
        {tx(t, "sdl10_costTip",
          "A flush waits for the drive, so it costs time on the main thread: about a millisecond on an SSD, more on a slow disk. The project measures it with the performance counter and logs it. For a save of a few kilobytes that is fine. A large save would stutter the game: do it on another thread, or with SDL3's SDL_AsyncIO, and never touch the window or renderer from that thread.")}
      </Callout>

      <H2>{tx(t, "sdl10_errTitle", "Errors the player can see")}</H2>
      <p>
        {tx(t, "sdl10_errBody",
          "Until now every failure ended with SDL_Log. A shipped Windows game has no console, so the player sees a window flash and vanish, and nothing else. The project gets one function for fatal errors: it writes the message to the log and also shows it in SDL_ShowSimpleMessageBox, a system dialog that works without a window or renderer, even before SDL_Init.")}
      </p>
      <CodeBlock lang="cpp" filename="fail.cpp" t={t}>{`static SDL_AppResult fail(const char* what) {
    char msg[512];
    SDL_snprintf(msg, sizeof msg, "%s failed:\\n%s", what, SDL_GetError());
    SDL_LogError(SDL_LOG_CATEGORY_APPLICATION, "%s", msg);
    SDL_ShowSimpleMessageBox(SDL_MESSAGEBOX_ERROR, "SDL3 Lab", msg, nullptr);
    return SDL_APP_FAILURE;
}

if (!TTF_Init()) return fail("TTF_Init");`}</CodeBlock>
      <Callout type="warn" t={t}>
        {tx(t, "sdl10_errWarn",
          "SDL_GetError returns the last error set on this thread, and a call that succeeds does not clear it. Read it right after the call that returned false or NULL. Read later, or after a call that did not fail, it is an old message from something else, and it sends you debugging the wrong part of the program.")}
      </Callout>
      <p>
        {tx(t, "sdl10_logBody",
          "Every log message has a category (app, audio, video, render…) and a priority, from verbose to critical. By default SDL prints the app category from info up, and every other category only from error up; that is why SDL_Log, which is app and info, always shows, and SDL_LogDebug does not. The hint SDL_LOGGING changes it without recompiling: set the environment variable SDL_LOGGING=app=debug,render=verbose before starting the game. In a Windows build without a console, SDL still writes the log to a terminal that started the game, and to the debugger's output window.")}
      </p>

      <H2>{tx(t, "sdl10_projectTitle", "The project: a best score that survives")}</H2>
      <p>
        {tx(t, "sdl10_projectBody",
          "The project continues from the Audio chapter. Four changes. One: fail() replaces the SDL_Log lines of SDL_AppInit, and loadTexture no longer logs on its own. Two: SDL_AppInit asks for the pref path, loads best.txt if there is one, and shows the record under the score. Three: when the score passes the record, the game stores the date, updates the text and saves at once, measuring how long that takes. Saving at that moment, and not only when the game closes, means a crash later cannot take the record with it. Four: the version in SDL_SetAppMetadata becomes 1.0, because this build is the one that ships.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{MAIN_CPP}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl10_lh0", "Code"), tx(t, "sdl10_lh1", "What it does")]}
        rows={[
          ["fail(\"…\")", tx(t, "sdl10_l1", "Copies SDL_GetError into the message first, while it is still the right one, then logs it and shows it. Returning SDL_APP_FAILURE from it keeps each check on one line.")],
          ["SDL_LoadFile(…, nullptr)", tx(t, "sdl10_l2", "The whole file, zero-terminated. nullptr: the size is not needed, since the text ends at the zero byte.")],
          ["SDL_sscanf(…) == 5", tx(t, "sdl10_l3", "A space in the pattern matches any run of spaces and line breaks, so the three lines read as one. Fewer than 5 values found means a damaged file.")],
          ["version == 1", tx(t, "sdl10_l4", "A file from a future version is not misread as this one. Version 2 of the game would read 1 and 2.")],
          ["SDL_WriteIO(…) == size_t(len)", tx(t, "sdl10_l5", "SDL_WriteIO returns how many bytes it wrote; fewer than asked (a full disk) is a failure.")],
          ["ok = SDL_CloseIO(io) && ok", tx(t, "sdl10_l6", "The file is closed in every case, and a failed close counts as a failed save. If anything failed, the rename does not happen and best.txt keeps the old record.")],
          ["4.0f + FONT_PT", tx(t, "sdl10_l7", "One line below the score: the font's line skip is 22 pixels at 22 pt, from the Text chapter.")],
          ["SDL_GetCurrentTime + SDL_TimeToDateTime", tx(t, "sdl10_l8", "The wall clock, only to label the record. The movement above still uses SDL_GetTicksNS.")],
          ["SDL_GetPerformanceCounter", tx(t, "sdl10_l9", "Two readings around saveBest, the difference divided by the frequency, times 1000 for milliseconds.")],
          ["if (!app->savePath.empty())", tx(t, "sdl10_l10", "No pref path, no saving: the game still plays, and the record lasts until it closes.")],
        ]}
      />
      <p>
        {tx(t, "sdl10_runBody",
          "Build and run. The second line says Best -. Collect a few gems: from the first one the line becomes Best 1 with today's date, and the terminal shows lines like Saved best 3 in 0.84 ms. Close the game and start it again: the record is back. Open the pref path from the figure above in your file manager and look at best.txt. Then damage it on purpose: change best to bets, or delete the file. The game must start in both cases, with Best -.")}
      </p>

      <H2>{tx(t, "sdl10_shipTitle", "A build you can give to someone")}</H2>
      <p>
        {tx(t, "sdl10_shipBody",
          "The build folder is full of compiler leftovers, and the game in it depends on things only your computer has. A few lines and an install section turn the project into a clean folder that runs anywhere. The complete CMakeLists.txt, with the new lines marked:")}
      </p>
      <CodeBlock lang="cmake" filename="CMakeLists.txt" t={t}>{CMAKE_LISTS}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl10_ch0", "Line"), tx(t, "sdl10_ch1", "What it does")]}
        rows={[
          ["CMAKE_MSVC_RUNTIME_LIBRARY", tx(t, "sdl10_c1", "MultiThreaded is the static runtime: the C and C++ library code is copied into game.exe, SDL3.dll and SDL3_ttf.dll, so they no longer need VCRUNTIME140.dll and MSVCP140.dll, which a clean Windows does not have. Set before FetchContent, it applies to SDL too. Other compilers ignore it.")],
          ["CMAKE_INSTALL_RPATH", tx(t, "sdl10_c2", "Where the installed program looks for its libraries. $ORIGIN (Linux) and @executable_path (macOS) both mean \"the folder this program is in\". Without it, cmake --install strips the build paths and the loader looks only in the system's folders.")],
          ["add_executable(game WIN32 …)", tx(t, "sdl10_c3", "A Windows window program: no console opens with it. It needs WinMain, which SDL_main.h supplies. Elsewhere WIN32 is ignored.")],
          ["install(TARGETS … SDL3-shared SDL3_ttf-shared)", tx(t, "sdl10_c4", "Copies the program and the two libraries. SDL and SDL3_ttf install nothing by themselves when they are part of another project (their SDL_INSTALL and SDLTTF_INSTALL options are off), so the project names their real targets.")],
          ["NAMELINK_SKIP", tx(t, "sdl10_c5", "On Linux a library comes as three names: libSDL3.so.0.4.18 (the file), libSDL3.so.0 (what the program asks for) and libSDL3.so (only for linking). The first two are installed.")],
          ["ARCHIVE … EXCLUDE_FROM_ALL", tx(t, "sdl10_c6", "On Windows each DLL has an import library, SDL3.lib, used only to link. Excluded: not part of the game.")],
          ["install(FILES … LICENSE …)", tx(t, "sdl10_c7", "The licence texts, from the sources FetchContent downloaded. SDL and SDL3_ttf (zlib licence) do not even require them in a binary; HarfBuzz's licence and the font's OFL do, and FreeType's asks for a credit line in your documentation: \"Portions of this software are copyright © 2023 The FreeType Project (www.freetype.org). All rights reserved.\"")],
        ]}
      />
      <p>
        {tx(t, "sdl10_cmdBody",
          "Release builds go in their own folder, so the debug build you work with stays as it is. --config is for Visual Studio and Xcode, which keep every configuration in one folder; CMAKE_BUILD_TYPE is for the other generators. Each flag is ignored where it does not apply, so the same three commands work everywhere:")}
      </p>
      <CodeBlock lang="bash" filename="terminal" t={t}>{`cmake -S . -B build-release -DCMAKE_BUILD_TYPE=Release
cmake --build build-release --config Release
cmake --install build-release --config Release --prefix dist`}</CodeBlock>
      <CodeBlock lang="text" filename="dist/ on Windows" t={t}>{`dist/
├── game.exe
├── SDL3.dll
├── SDL3_ttf.dll
├── assets/        hero.png  Micro5-Regular.ttf  OFL-Micro5.txt  pickup.wav
└── licenses/      SDL3.txt  SDL3_ttf.txt  FreeType.txt  HarfBuzz.txt  OFL-Micro5.txt`}</CodeBlock>
      <p>
        {tx(t, "sdl10_zipBody",
          "Zip dist as SDL3Lab-1.0-windows.zip (or -linux) and the game is ready to send. On Linux, dist/ holds game, libSDL3.so.0 with libSDL3.so.0.4.18, and the libSDL3_ttf files. The figure is that folder on a computer that has never seen your development tools. Leave things out:")}
      </p>

      <ShipFolderFigure t={t} />

      <Callout type="tip" t={t}>
        {tx(t, "sdl10_cleanTip",
          "Your own computer cannot test this: it has every DLL and every path the build used. Test on a clean one. The Pro and Enterprise editions of Windows include Windows Sandbox (turn it on in Windows Features), a fresh, disposable Windows that opens in a window: copy the zip in, unzip, double-click game.exe. On Linux, a new virtual machine or a container of another distribution does the same job.")}
      </Callout>

      <LessonTable
        headers={[tx(t, "sdl10_ph0", "Target"), tx(t, "sdl10_ph1", "What changes")]}
        rows={[
          ["macOS", tx(t, "sdl10_p1", "Players expect an .app bundle (add_executable(game MACOSX_BUNDLE …)), and a downloaded app must be signed and notarized by Apple, or macOS refuses to open it. SDL_GetBasePath then returns the bundle's Contents/Resources/, so the assets go there.")],
          ["Linux", tx(t, "sdl10_p2", "The folder above runs on distributions at least as new as the one that built it (they share glibc). For Steam, build in its Steam Runtime container; for everyone else, an AppImage or a Flatpak packs the same folder.")],
          ["Web", tx(t, "sdl10_p3", "Emscripten compiles the same main.cpp; the main callbacks are exactly what a browser needs. Assets are packed into a .data file, and saves need IDBFS mounted at the pref path, or they vanish on reload.")],
          ["Android, iOS", tx(t, "sdl10_p4", "Built from SDL's Android and Xcode projects, not from this folder. The system can stop a game in the background without warning: save on SDL_EVENT_WILL_ENTER_BACKGROUND, not only on quit.")],
        ]}
      />

      <H2>{tx(t, "sdl10_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl10_eh0", "Symptom"), tx(t, "sdl10_eh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl10_e1", "The save works in the build folder and fails when installed"), tx(t, "sdl10_e1b", "it is written next to the executable. Write to SDL_GetPrefPath.")],
          [tx(t, "sdl10_e2", "After a crash the record is 0"), tx(t, "sdl10_e2b", "the save overwrote best.txt in place and the game died before the bytes were on the disk. Temporary file, SDL_FlushIO, SDL_RenamePath.")],
          [tx(t, "sdl10_e3", "A damaged or edited save stops the game from starting"), tx(t, "sdl10_e3b", "the loader trusts the file. Check what SDL_sscanf found and fall back to no record.")],
          [tx(t, "sdl10_e4", "Players lost their saves after an update"), tx(t, "sdl10_e4b", "the org or app string changed, so SDL_GetPrefPath points to a new, empty folder. Never change them.")],
          [tx(t, "sdl10_e5", "The hero jumps or freezes when the clock changes"), tx(t, "sdl10_e5b", "delta time comes from the wall clock. Use SDL_GetTicksNS.")],
          [tx(t, "sdl10_e6", "The error message names an unrelated problem"), tx(t, "sdl10_e6b", "SDL_GetError was read late, after other calls. Read it right after the call that failed.")],
          [tx(t, "sdl10_e7", "The game window flashes and vanishes on another PC"), tx(t, "sdl10_e7b", "a fatal error went only to the log, and a WIN32 build has no console. Show it with SDL_ShowSimpleMessageBox.")],
          [tx(t, "sdl10_e8", "VCRUNTIME140.dll or MSVCP140.dll was not found"), tx(t, "sdl10_e8b", "the build uses Microsoft's runtime DLLs. Set CMAKE_MSVC_RUNTIME_LIBRARY before FetchContent, or ship the Visual C++ Redistributable.")],
          [tx(t, "sdl10_e9", "error while loading shared libraries: libSDL3.so.0"), tx(t, "sdl10_e9b", "the installed program has no RPATH. Set CMAKE_INSTALL_RPATH to $ORIGIN.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl10" items={[
        "SDL_GetTicksNS for game time, the performance counter for measuring code, the wall clock only for dates: it can jump.",
        "A duration from the performance counter is (c₁ − c₀) / SDL_GetPerformanceFrequency().",
        "Read the game's files from SDL_GetBasePath; write only to SDL_GetPrefPath, which you free with SDL_free.",
        "org and app are folder names: letters, numbers and spaces, and never changed after release.",
        "A missing or damaged save is normal: the game starts without a record, never fails because of it.",
        "Save to a temporary file, SDL_FlushIO it, then SDL_RenamePath it over the old one: best.txt is always complete.",
        "Fatal errors go into a message box; SDL_GetError must be read right after the call that failed.",
        "A shippable build: static MSVC runtime, WIN32, an RPATH of its own folder, install rules, the licences, and a test on a clean computer.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "audio", title: tx(t, "sdl10_rel1", "Audio Streams"), why: tx(t, "sdl10_rel1b", "the project this chapter starts from.") },
        { track: "C++", id: "errors", title: tx(t, "sdl10_rel2", "Error Handling"), why: tx(t, "sdl10_rel2b", "absence, damage and failure: the cases loadBest tells apart.") },
        { track: "C++", id: "c-io-files", title: tx(t, "sdl10_rel3", "Input, Output & Files"), why: tx(t, "sdl10_rel3b", "binary files, for a game with more to save than one number.") },
      ]} />

      <Callout type="tip" t={t}>
        {tx(t, "sdl10_nextTip",
          "The project is complete: it moves, animates, draws text, plays sound, keeps a record and ships. From here, go down the stack with the OpenGL, Vulkan and GLSL tracks, to see what a draw call becomes on the GPU, or up: give the game a goal and an ending. A timer, a menu and a game over screen would teach you more about the parts of SDL you now know than anything else to read.")}
      </Callout>
    </Article>
  );
}

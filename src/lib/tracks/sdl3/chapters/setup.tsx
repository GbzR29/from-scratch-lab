"use client";

// SDL3 track — "Setup & First Window": the tools per system; the project
// folder; CMakeLists.txt with FetchContent, line by line; building and running;
// the first main.cpp (classic while loop), line by line, with the SetupBreak
// figure; subsystems; the roadmap of the project this track grows; optional
// RAII wrappers; common mistakes.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { SetupBreakFigure } from "@/components/lesson/figures/sdl3/SetupBreakFigure";

export function SetupContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl02_intro",
          "This chapter starts the project you will grow through the whole track. By the end you have a folder with two files, a build that downloads SDL by itself, and a 1280×720 window that opens and closes properly. The stack is C++20, CMake and SDL 3.4. SDL comes in through CMake's FetchContent, so there is nothing to install by hand and every machine builds the exact same version.")}
      </Lead>

      <Goals t={t} id="sdl02" items={[
        "Add SDL3 to a project with CMake and FetchContent.",
        "Build and run the project from the command line.",
        "Open a window that closes properly, and say what each line does.",
        "Start only the subsystems you use.",
      ]} />

      <H2>{tx(t, "sdl02_toolsTitle", "What you need")}</H2>
      <p>
        {tx(t, "sdl02_toolsBody",
          "Three tools: a C++ compiler, CMake 3.24 or newer, and Git (CMake uses it to download SDL). Check them with cmake --version and git --version.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl02_th0", "System"), tx(t, "sdl02_th1", "Install")]}
        rows={[
          ["Windows", tx(t, "sdl02_tw", "Visual Studio 2022 with the \"Desktop development with C++\" workload. It includes the MSVC compiler and CMake. Install Git for Windows separately.")],
          ["macOS", tx(t, "sdl02_tm", "xcode-select --install for the compiler and Git, then brew install cmake.")],
          ["Linux (Debian, Ubuntu)", tx(t, "sdl02_tl", "sudo apt install build-essential cmake git, plus the development packages SDL needs to talk to the desktop (below).")],
        ]}
      />
      <p>
        {tx(t, "sdl02_linuxBody",
          "On Linux, SDL is built from source on your machine, and it can only support the window systems whose headers it finds. Without them the build succeeds, but SDL_Init fails at run time with \"No available video device\". This installs the common ones (X11, Wayland, audio):")}
      </p>
      <CodeBlock lang="bash" filename="terminal" t={t}>{`sudo apt install libx11-dev libxext-dev libxrandr-dev libxcursor-dev libxfixes-dev \\
    libxi-dev libxss-dev libxtst-dev libxkbcommon-dev libwayland-dev libdecor-0-dev \\
    libdrm-dev libgbm-dev libgl1-mesa-dev libegl1-mesa-dev \\
    libasound2-dev libpulse-dev libpipewire-0.3-dev libudev-dev libdbus-1-dev`}</CodeBlock>

      <H2>{tx(t, "sdl02_folderTitle", "The project folder")}</H2>
      <p>
        {tx(t, "sdl02_folderBody",
          "Make a folder called sdl3-lab with this layout. CMake creates build/ itself the first time you build; you never edit anything in it.")}
      </p>
      <CodeBlock lang="text" filename="sdl3-lab/" t={t}>{`sdl3-lab/
├── CMakeLists.txt      the build recipe
└── src/
    └── main.cpp        the program (the whole track grows this file)`}</CodeBlock>

      <H2>{tx(t, "sdl02_cmakeTitle", "The build file")}</H2>
      <CodeBlock lang="cmake" filename="CMakeLists.txt" t={t}>{`cmake_minimum_required(VERSION 3.24)
project(SDL3Lab LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(SDL3
    GIT_REPOSITORY https://github.com/libsdl-org/SDL.git
    GIT_TAG        release-3.4.18     # pin a release tag, never a branch
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(SDL3)

add_executable(game src/main.cpp)
target_link_libraries(game PRIVATE SDL3::SDL3)

# Windows only: copy SDL3.dll next to game.exe so it starts
if (WIN32)
    add_custom_command(TARGET game POST_BUILD
        COMMAND \${CMAKE_COMMAND} -E copy_if_different
                $<TARGET_FILE:SDL3::SDL3> $<TARGET_FILE_DIR:game>)
endif()`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl02_ch0", "Line"), tx(t, "sdl02_ch1", "What it does")]}
        rows={[
          ["cmake_minimum_required", tx(t, "sdl02_c1", "Refuses to run on a CMake older than 3.24, instead of failing later with a confusing error.")],
          ["project(... LANGUAGES C CXX)", tx(t, "sdl02_c2", "Names the project and turns on the C and C++ compilers. SDL itself is written in C, so C must be enabled.")],
          ["CMAKE_CXX_STANDARD 20", tx(t, "sdl02_c3", "Compiles our code as C++20. REQUIRED makes it an error, not a quiet fallback, if the compiler cannot.")],
          ["FetchContent_Declare", tx(t, "sdl02_c4", "Describes where SDL comes from: the official repository, at the tag release-3.4.18. GIT_SHALLOW downloads only that version, not the whole history.")],
          ["FetchContent_MakeAvailable", tx(t, "sdl02_c5", "Downloads SDL (the first time only) and adds it to the build, as if its source were part of the project.")],
          ["add_executable(game ...)", tx(t, "sdl02_c6", "Our program: an executable named game, built from src/main.cpp.")],
          ["target_link_libraries", tx(t, "sdl02_c7", "Links game with SDL. The SDL3::SDL3 target also carries SDL's include folder, which is how #include <SDL3/SDL.h> is found.")],
          ["add_custom_command (WIN32)", tx(t, "sdl02_c8", "After each build, copies SDL3.dll next to game.exe. Windows looks for DLLs next to the executable, and SDL's DLL is built in a different folder.")],
        ]}
      />
      <Callout type="tip" t={t}>
        {tx(t, "sdl02_installTip",
          "If SDL3 is already installed (vcpkg, Homebrew, a distro package, or the official SDL3-devel zip), replace the three FetchContent lines with find_package(SDL3 REQUIRED CONFIG). The target is still called SDL3::SDL3, so the rest of the file stays the same.")}
      </Callout>

      <H2>{tx(t, "sdl02_buildTitle", "Building and running")}</H2>
      <p>
        {tx(t, "sdl02_buildBody",
          "Open a terminal in sdl3-lab. The first command configures: it reads CMakeLists.txt, downloads SDL and writes the build files into build/. The second compiles. The first build compiles all of SDL, which takes a minute or two; later builds only recompile what changed.")}
      </p>
      <CodeBlock lang="bash" filename="terminal" t={t}>{`cmake -S . -B build          # configure: -S = source folder, -B = build folder
cmake --build build          # compile

./build/game                 # Linux and macOS
build\\Debug\\game.exe         # Windows (Visual Studio puts Debug builds in Debug\\)`}</CodeBlock>
      <p>
        {tx(t, "sdl02_ideBody",
          "Visual Studio, VS Code (with the CMake Tools extension) and CLion can all open the folder directly: they find CMakeLists.txt and run the same two steps for you.")}
      </p>

      <H2>{tx(t, "sdl02_windowTitle", "The first window")}</H2>
      <p>
        {tx(t, "sdl02_windowBody",
          "Put this in src/main.cpp. It is the complete file: start SDL, open a window with a renderer to draw with, then loop until the window is closed. Each turn of the loop reads the pending events and draws one frame.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>     // the right entry point on every platform

int main(int argc, char* argv[]) {
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return 1;
    }

    SDL_Window*   window   = nullptr;
    SDL_Renderer* renderer = nullptr;
    if (!SDL_CreateWindowAndRenderer("SDL3 Lab", 1280, 720, SDL_WINDOW_RESIZABLE,
                                     &window, &renderer)) {
        SDL_Log("SDL_CreateWindowAndRenderer failed: %s", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    bool running = true;
    while (running) {
        SDL_Event e;
        while (SDL_PollEvent(&e)) {                 // read every pending event
            if (e.type == SDL_EVENT_QUIT) running = false;
        }

        SDL_SetRenderDrawColor(renderer, 16, 18, 26, 255);   // r, g, b, a: 0-255
        SDL_RenderClear(renderer);                  // fill the frame
        SDL_RenderPresent(renderer);                // show it
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl02_lh0", "Code"), tx(t, "sdl02_lh1", "What it does")]}
        rows={[
          ["#include <SDL3/SDL.h>", tx(t, "sdl02_l1", "All of SDL's core API in one header.")],
          ["#include <SDL3/SDL_main.h>", tx(t, "sdl02_l2", "Adapts main to the platform. On Windows GUI builds, iOS and Android the system does not call main directly, and this header supplies the real entry point that does. Include it in exactly one file: the one with main.")],
          ["SDL_Init(SDL_INIT_VIDEO)", tx(t, "sdl02_l3", "Starts the video subsystem (windows, displays) and the event system it needs. Returns false on failure.")],
          ["SDL_GetError()", tx(t, "sdl02_l4", "The text of the last error, in English. Every SDL function that fails sets it, so print it on every failure.")],
          ["SDL_CreateWindowAndRenderer", tx(t, "sdl02_l5", "Opens a window titled \"SDL3 Lab\", 1280 by 720 pixels, and creates a renderer for it: the object you draw with. RESIZABLE lets the user drag its edges. The two pointers are filled in through &window and &renderer.")],
          ["SDL_PollEvent(&e)", tx(t, "sdl02_l6", "Takes the oldest pending event out of the queue and copies it into e. Returns false when the queue is empty, which ends the inner loop.")],
          ["SDL_EVENT_QUIT", tx(t, "sdl02_l7", "Sent when the user closes the last window (its ✕, Alt+F4, Cmd+Q). Setting running to false ends the outer loop.")],
          ["SDL_SetRenderDrawColor", tx(t, "sdl02_l8", "Chooses the colour for the next drawing calls: red 16, green 18, blue 26, fully opaque. A very dark blue-grey.")],
          ["SDL_RenderClear", tx(t, "sdl02_l9", "Fills the whole frame with that colour. The frame is hidden while you draw it.")],
          ["SDL_RenderPresent", tx(t, "sdl02_l10", "Shows the finished frame in the window. Nothing you draw appears before this call.")],
          ["SDL_Destroy... / SDL_Quit", tx(t, "sdl02_l11", "Frees the renderer, then the window, then shuts SDL down: the reverse of the order they were created in.")],
        ]}
      />
      <p>
        {tx(t, "sdl02_runBody",
          "Build and run. A 1280×720 window titled SDL3 Lab opens, filled with dark blue-grey, and its ✕ closes it. If you look at your CPU usage, one core is at 100%: the loop draws frames as fast as it can, thousands per second. The next chapter fixes that.")}
      </p>

      <SetupBreakFigure t={t} />

      <H2>{tx(t, "sdl02_subsysTitle", "Subsystems")}</H2>
      <p>
        {tx(t, "sdl02_subsysBody",
          "SDL is split into subsystems, and SDL_Init starts the ones you ask for. Combine flags with |, for example SDL_INIT_VIDEO | SDL_INIT_AUDIO. Some flags start others: video, audio and gamepads all start the event system.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl02_h0", "Flag"), tx(t, "sdl02_h1", "Starts")]}
        rows={[
          ["SDL_INIT_VIDEO",   tx(t, "sdl02_s1", "Windows, the display list and the event system. Call it on the main thread.")],
          ["SDL_INIT_AUDIO",   tx(t, "sdl02_s2", "Audio devices and streams (Audio Streams chapter).")],
          ["SDL_INIT_GAMEPAD", tx(t, "sdl02_s3", "Gamepads; also starts the joystick subsystem.")],
          ["SDL_INIT_HAPTIC",  tx(t, "sdl02_s4", "Force feedback devices.")],
          ["SDL_INIT_CAMERA",  tx(t, "sdl02_s5", "Webcam capture, new in SDL3.")],
          ["SDL_INIT_EVENTS",  tx(t, "sdl02_s6", "Only the event queue, for programs without a window.")],
        ]}
      />
      <p>
        {tx(t, "sdl02_subsysBody2",
          "There is no SDL_INIT_TIMER any more (timing always works) and no SDL_INIT_EVERYTHING (list what you use). A subsystem can also be started later with SDL_InitSubSystem. That is useful for audio: on a machine with no sound device, the game can still open its window and simply stay silent.")}
      </p>

      <H2>{tx(t, "sdl02_roadmapTitle", "The project you will build")}</H2>
      <p>
        {tx(t, "sdl02_roadmapBody",
          "Each chapter of the track adds one piece to the same main.cpp and ends with the complete file, so you can always compare yours. The names stay fixed: the window is \"SDL3 Lab\", 1280×720, and from the next chapter all state lives in a struct called AppState.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl02_rh0", "Chapter"), tx(t, "sdl02_rh1", "The project gains")]}
        rows={[
          [tx(t, "sdl02_rm1", "Setup & First Window"), tx(t, "sdl02_rm1b", "a window that closes properly")],
          [tx(t, "sdl02_rm2", "The Main Loop"), tx(t, "sdl02_rm2b", "the four main callbacks, a square moving with delta time, VSync")],
          [tx(t, "sdl02_rm3", "Events & Input"), tx(t, "sdl02_rm3b", "the square steered with the keyboard, the mouse and a gamepad")],
          [tx(t, "sdl02_rm4", "The 2D Renderer"), tx(t, "sdl02_rm4b", "a fixed 640×360 game resolution in any window size, shapes and blending")],
          [tx(t, "sdl02_rm5", "Textures & Images"), tx(t, "sdl02_rm5b", "the square becomes an animated sprite")],
          [tx(t, "sdl02_rm6", "Text with SDL3_ttf"), tx(t, "sdl02_rm6b", "a score and a frame counter on screen")],
          [tx(t, "sdl02_rm7", "Audio Streams"), tx(t, "sdl02_rm7b", "sound effects")],
          [tx(t, "sdl02_rm8", "SDL_GPU"), tx(t, "sdl02_rm8b", "a separate small project: a triangle drawn with the GPU API")],
          [tx(t, "sdl02_rm9", "Time, Files & Shipping"), tx(t, "sdl02_rm9b", "a saved best score and a build you can give to someone")],
        ]}
      />

      <H2>{tx(t, "sdl02_raiiTitle", "Optional: RAII wrappers")}</H2>
      <p>
        {tx(t, "sdl02_raiiBody",
          "SDL is a C API: every Create has a matching Destroy, and every early return must call it. In C++ you can let a std::unique_ptr do that. Its deleter is called automatically when the pointer goes out of scope, on every exit path, and it costs nothing at run time.")}
      </p>
      <CodeBlock lang="cpp" filename="sdl_raii.hpp" t={t}>{`#include <memory>
#include <SDL3/SDL.h>

struct SDLDeleter {
    void operator()(SDL_Window*   w) const noexcept { SDL_DestroyWindow(w); }
    void operator()(SDL_Renderer* r) const noexcept { SDL_DestroyRenderer(r); }
    void operator()(SDL_Texture*  t) const noexcept { SDL_DestroyTexture(t); }
    void operator()(SDL_Surface*  s) const noexcept { SDL_DestroySurface(s); }
};

using WindowPtr   = std::unique_ptr<SDL_Window,   SDLDeleter>;
using RendererPtr = std::unique_ptr<SDL_Renderer, SDLDeleter>;
using TexturePtr  = std::unique_ptr<SDL_Texture,  SDLDeleter>;`}</CodeBlock>
      <p>
        {tx(t, "sdl02_raiiWhy",
          "The project keeps plain pointers. From the next chapter on, SDL calls one function, SDL_AppQuit, whenever the program ends, for any reason, so all cleanup lives in one place and the wrappers would add little. They pay off in bigger programs with many objects.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "sdl02_orderTip",
          "Destruction order matters: every texture before its renderer, the renderer before its window. If you keep the wrappers as members of a class, declare them in creation order. C++ destroys members in reverse declaration order, which is exactly right.")}
      </Callout>

      <H2>{tx(t, "sdl02_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl02_mh0", "Symptom"), tx(t, "sdl02_mh1", "Cause and fix")]}
        rows={[
          ["SDL3/SDL.h: No such file or directory", tx(t, "sdl02_m1", "game is not linked with SDL3::SDL3, or the line is misspelled. The include folder comes with the target.")],
          ["SDL3.dll was not found", tx(t, "sdl02_m2", "Windows cannot find the DLL. Keep the copy command, or run from the folder that contains both files.")],
          ["No available video device", tx(t, "sdl02_m3", "Linux: SDL was built without X11 or Wayland support. Install the development packages above, delete build/ and configure again.")],
          ["unresolved external symbol WinMain", tx(t, "sdl02_m4", "A Windows GUI build (WIN32) without #include <SDL3/SDL_main.h> in the file with main.")],
          [tx(t, "sdl02_m5k", "The window is \"Not Responding\""), tx(t, "sdl02_m5", "Events are never polled. Every frame must empty the event queue.")],
          [tx(t, "sdl02_m6k", "The first configure fails at FetchContent"), tx(t, "sdl02_m6", "Git is missing or there is no network. Install Git; after the first download, configuring works offline.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl02" items={[
        "FetchContent downloads and builds a pinned SDL release with the project: nothing to install, the same version everywhere.",
        "Linking SDL3::SDL3 provides both the library and its include folder; on Windows, copy SDL3.dll next to the executable.",
        "On Linux, SDL needs the X11/Wayland development packages at build time, or SDL_Init reports \"No available video device\".",
        "Include SDL_main.h in the file with main; it provides the real entry point where the system does not call main.",
        "Check every SDL call that can fail and print SDL_GetError().",
        "Every frame: poll all events, clear, draw, present. Without polling the window stops responding; without present nothing shows.",
        "Initialize only the subsystems you use; there is no SDL_INIT_TIMER or SDL_INIT_EVERYTHING.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "main-loop", title: tx(t, "sdl02_rel1", "The Main Loop"), why: tx(t, "sdl02_rel1b", "the next step: the same program with SDL3's main callbacks.") },
        { track: "C++", id: "raii", title: tx(t, "sdl02_rel2", "RAII & Smart Pointers"), why: tx(t, "sdl02_rel2b", "why unique_ptr with a deleter cleans up on every path.") },
        { track: "C++", id: "tooling", title: tx(t, "sdl02_rel3", "Tooling, Build & Sanitizers"), why: tx(t, "sdl02_rel3b", "CMake, build types and the sanitizers that find leaks.") },
      ]} />
    </Article>
  );
}

"use client";

// SDL3 track — "The Main Loop": who owns the loop (the browser and phones),
// the MainCallbacks figure; the four callbacks and SDL_AppResult; the project
// converted to callbacks with a square moving by delta time (formula and a
// 60/144 Hz worked example); VSync and SDL_HINT_MAIN_CALLBACK_RATE; the fixed
// timestep in short (the Game Dev chapter has the full treatment); when to keep
// the while loop; common mistakes.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { MainCallbacksFigure } from "@/components/lesson/figures/sdl3/MainCallbacksFigure";

const r = String.raw;

export function MainLoopContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl03_intro",
          "The program from the last chapter owns its loop: while (running) turns until the window closes. That works on a desktop, but in a browser and on phones the system owns the loop, and it calls your code when it wants a frame. SDL3's main callbacks let you write the program that way everywhere. In this chapter the project switches to them, and the window gets a square that moves at the same speed on any screen.")}
      </Lead>

      <Goals t={t} id="sdl03" items={[
        "Explain why a while loop freezes a browser tab.",
        "Write a program as SDL3's four main callbacks.",
        "Move an object by delta time, so its speed does not depend on the frame rate.",
        "Stop the loop from burning a CPU core, with VSync or the callback rate hint.",
      ]} />

      <H2>{tx(t, "sdl03_problemTitle", "Who owns the loop")}</H2>
      <p>
        {tx(t, "sdl03_problemBody",
          "A web page has one main thread. The browser uses it to run your code, to draw the page and to handle clicks and key presses, one job after another. A C++ program compiled to WebAssembly runs on that same thread.")}
      </p>
      <p>
        {tx(t, "sdl03_problemBody2",
          "So a while loop that never returns takes the thread forever. The browser cannot show the frames you draw, and it cannot run the handlers that would turn a click into an SDL event. The tab freezes until the browser offers to kill it. iOS and Android work the same way: the system calls the app for each frame and expects it to return.")}
      </p>
      <p>
        {tx(t, "sdl03_problemBody3",
          "The fix is to turn the loop inside out. You no longer write the loop; you write what happens in one turn of it, and the platform calls that once per frame. SDL3 standardizes this as four functions, the main callbacks.")}
      </p>

      <MainCallbacksFigure t={t} />

      <H2>{tx(t, "sdl03_callbacksTitle", "The four callbacks")}</H2>
      <LessonTable
        headers={[tx(t, "sdl03_h0", "Function"), tx(t, "sdl03_h1", "When SDL calls it"), tx(t, "sdl03_h2", "Your job")]}
        rows={[
          ["SDL_AppInit",    tx(t, "sdl03_c1", "once, at startup"), tx(t, "sdl03_c1b", "start SDL, create the window, allocate your state and hand it to SDL through *appstate")],
          ["SDL_AppEvent",   tx(t, "sdl03_c2", "once for each event, as it arrives"), tx(t, "sdl03_c2b", "react to one event; no polling loop of your own")],
          ["SDL_AppIterate", tx(t, "sdl03_c3", "once per frame"), tx(t, "sdl03_c3b", "update the game by the time that passed, draw one frame, return")],
          ["SDL_AppQuit",    tx(t, "sdl03_c4", "once, at the end, whatever ended the program"), tx(t, "sdl03_c4b", "free everything; SDL calls SDL_Quit for you afterwards")],
        ]}
      />
      <p>
        {tx(t, "sdl03_stateBody",
          "The appstate pointer is how your data travels between them. SDL_AppInit receives void** appstate: a place to store one pointer. Whatever you store there, SDL passes back as void* appstate to every other callback, so no global variables are needed.")}
      </p>
      <p>
        {tx(t, "sdl03_returnBody",
          "The first three callbacks return an SDL_AppResult, which tells SDL whether to go on:")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl03_rh0", "Value"), tx(t, "sdl03_rh1", "Meaning")]}
        rows={[
          ["SDL_APP_CONTINUE", tx(t, "sdl03_r1", "keep running")],
          ["SDL_APP_SUCCESS",  tx(t, "sdl03_r2", "end the program normally: SDL calls SDL_AppQuit, then exits with a success code")],
          ["SDL_APP_FAILURE",  tx(t, "sdl03_r3", "end the program with an error: SDL calls SDL_AppQuit, then exits with an error code")],
        ]}
      />
      <p>
        {tx(t, "sdl03_quitBody",
          "SDL_AppQuit runs in every case, even when SDL_AppInit itself returned SDL_APP_FAILURE halfway through. That is why it must cope with a half-built state: a window that was never created is still nullptr.")}
      </p>

      <H2>{tx(t, "sdl03_projectTitle", "The project, as callbacks")}</H2>
      <p>
        {tx(t, "sdl03_projectBody",
          "Replace all of src/main.cpp with this. CMakeLists.txt does not change. The window is the same as before; the new parts are the AppState struct, the four callbacks instead of main, VSync, and a blue square that crosses the window.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1       // before SDL_main.h: SDL writes main for us
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

struct AppState {
    SDL_Window*   window   = nullptr;
    SDL_Renderer* renderer = nullptr;
    Uint64        lastTick = 0;        // SDL_GetTicksNS() at the previous frame
    float         x        = 0.0f;     // the square's left edge, in pixels
};

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    SDL_SetAppMetadata("SDL3 Lab", "0.1", "com.example.sdl3lab");

    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    auto* app = new AppState{};
    *appstate = app;                   // SDL hands this back to every callback
    if (!SDL_CreateWindowAndRenderer("SDL3 Lab", 1280, 720, SDL_WINDOW_RESIZABLE,
                                     &app->window, &app->renderer)) {
        SDL_Log("SDL_CreateWindowAndRenderer failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;        // SDL_AppQuit still runs and frees app
    }
    SDL_SetRenderVSync(app->renderer, 1);    // present once per display refresh

    app->lastTick = SDL_GetTicksNS();
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    auto* app = static_cast<AppState*>(appstate);

    // Delta time: seconds since the previous frame
    const Uint64 now = SDL_GetTicksNS();
    const float  dt  = float(now - app->lastTick) / 1e9f;
    app->lastTick = now;

    // Update: 240 pixels per second; past the right edge, start again at the left
    app->x += 240.0f * dt;
    if (app->x > 1280.0f) app->x = -100.0f;

    // Draw
    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

    const SDL_FRect square{app->x, 310.0f, 100.0f, 100.0f};   // x, y, w, h
    SDL_SetRenderDrawColor(app->renderer, 59, 130, 246, 255);
    SDL_RenderFillRect(app->renderer, &square);

    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        SDL_DestroyRenderer(app->renderer);  // both simply return on nullptr
        SDL_DestroyWindow(app->window);
        delete app;
    }
    // SDL calls SDL_Quit() itself after this function returns
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl03_lh0", "Code"), tx(t, "sdl03_lh1", "What it does")]}
        rows={[
          ["#define SDL_MAIN_USE_CALLBACKS 1", tx(t, "sdl03_l1", "Tells SDL_main.h to provide main itself and call the four functions below. It must come before the #include, or the header expects you to write main.")],
          ["struct AppState", tx(t, "sdl03_l2", "Everything the program must remember between frames. It grows in every chapter.")],
          ["SDL_SetAppMetadata", tx(t, "sdl03_l3", "The program's name, version and a unique identifier in reverse-domain form. Systems show them, for example in the volume mixer.")],
          ["*appstate = app", tx(t, "sdl03_l4", "Hands the state to SDL right after it is allocated, so SDL_AppQuit can free it even if the window fails next.")],
          ["SDL_SetRenderVSync(..., 1)", tx(t, "sdl03_l5", "Makes SDL_RenderPresent wait for the display's next refresh: one frame per refresh, and no more 100% CPU.")],
          ["SDL_GetTicksNS()", tx(t, "sdl03_l6", "Nanoseconds since SDL started, as a 64-bit integer. The difference between two frames, divided by 10⁹, is the frame time in seconds.")],
          ["app->x += 240.0f * dt", tx(t, "sdl03_l7", "Moves the square by speed × time, explained below.")],
          ["SDL_FRect square{...}", tx(t, "sdl03_l8", "A float rectangle: left edge x, top edge 310, 100 wide, 100 tall. The y of 310 centres it vertically: (720 − 100) / 2 = 310.")],
          ["SDL_RenderFillRect", tx(t, "sdl03_l9", "Fills the rectangle with the current draw colour, a blue (59, 130, 246).")],
          ["return SDL_APP_SUCCESS", tx(t, "sdl03_l10", "On SDL_EVENT_QUIT the program ends cleanly. There is no running flag any more.")],
        ]}
      />
      <p>
        {tx(t, "sdl03_runBody",
          "Run it. The square slides from left to right, takes a little under six seconds to cross, and comes back in from the left. The CPU usage is now a few percent.")}
      </p>

      <H2>{tx(t, "sdl03_dtTitle", "Delta time: the same speed on every screen")}</H2>
      <p>
        {tx(t, "sdl03_dtBody",
          "With VSync, SDL_AppIterate runs once per display refresh: 60 times a second on one screen, 144 on another. If the square moved a fixed 4 pixels per frame, it would be 2.4 times faster on the 144 Hz screen. So the update is written in seconds, not in frames:")}
      </p>
      <Equation label={tx(t, "sdl03_eqLabel", "Moving by delta time")}
        where={[
          [r`x`, tx(t, "sdl03_wX", "the square's position before this frame, in pixels")],
          [r`x'`, tx(t, "sdl03_wX2", "its position after this frame")],
          [r`v`, tx(t, "sdl03_wV", "the speed, in pixels per second: 240 here")],
          [r`\Delta t`, tx(t, "sdl03_wDt", "the frame time: the seconds since the previous frame (dt in the code)")],
        ]}>
        {r`x' = x + v\,\Delta t`}
      </Equation>
      <LessonTable
        headers={[tx(t, "sdl03_dh0", "Screen"), "Δt", tx(t, "sdl03_dh2", "Pixels per frame"), tx(t, "sdl03_dh3", "Pixels per second")]}
        rows={[
          ["60 Hz", "1/60 ≈ 0.01667 s", "240 × 0.01667 = 4.0", "4.0 × 60 = 240"],
          ["144 Hz", "1/144 ≈ 0.00694 s", "240 × 0.00694 ≈ 1.67", "1.67 × 144 = 240"],
        ]}
      />
      <p>
        {tx(t, "sdl03_dtBody2",
          "Each frame moves less on the faster screen, and there are more frames, so a second always adds up to 240 pixels. The square travels from x = −100 to x = 1280, which is 1380 pixels, in 1380 / 240 = 5.75 seconds on both.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "sdl03_dtNote",
          "Δt is measured, not assumed. Even with VSync a frame can arrive late, and some drivers ignore the VSync request. Because the code multiplies by the real elapsed time, the square keeps the right speed in every case.")}
      </Callout>

      <H2>{tx(t, "sdl03_rateTitle", "How often SDL_AppIterate runs")}</H2>
      <p>
        {tx(t, "sdl03_rateBody",
          "By default SDL calls SDL_AppIterate as often as it can. With VSync on, SDL_RenderPresent waits for the refresh, which sets the pace. The hint SDL_HINT_MAIN_CALLBACK_RATE changes that pace, and can be set at any time:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`SDL_SetHint(SDL_HINT_MAIN_CALLBACK_RATE, "60");         // aim for 60 frames per second
SDL_SetHint(SDL_HINT_MAIN_CALLBACK_RATE, "waitevent");  // only after an event arrives
SDL_SetHint(SDL_HINT_MAIN_CALLBACK_RATE, "0");          // as fast as possible (default)`}</CodeBlock>
      <p>
        {tx(t, "sdl03_rateBody2",
          "\"waitevent\" is for programs that only change when the user does something, like a level editor or a menu: between events, SDL sleeps and the program uses no CPU at all. A game that animates needs every frame, so the project keeps the default. On the web the browser sets the pace, and the hint may be ignored.")}
      </p>

      <H2>{tx(t, "sdl03_timestepTitle", "Fixed timestep, in short")}</H2>
      <p>
        {tx(t, "sdl03_timestepBody",
          "Delta time is right for simple motion. Physics is different: stepped by a varying Δt, the same input gives different results at 60 and at 144 frames per second, and one long frame can push an object through a wall. Physics is therefore stepped in fixed slices of time, and the real frame time is collected in an accumulator until a slice is full.")}
      </p>
      <CodeBlock lang="cpp" filename="timestep.cpp" t={t}>{`constexpr double FIXED_DT = 1.0 / 60.0;     // one physics step = 1/60 s

// in SDL_AppIterate, after measuring frameTime in seconds:
frameTime = SDL_min(frameTime, 0.25);      // after a stall, do not try to catch up forever
app->accumulator += frameTime;
while (app->accumulator >= FIXED_DT) {
    stepPhysics(app->world, FIXED_DT);
    app->accumulator -= FIXED_DT;
}
const double alpha = app->accumulator / FIXED_DT;   // 0..1: how far into the next step
render(app, alpha);                                 // draw between the last two states`}</CodeBlock>
      <p>
        {tx(t, "sdl03_timestepLink",
          "The Game Loop & Fixed Timestep chapter of the Game Development track builds this step by step, with a figure that runs both loops side by side, the interpolation with alpha, and the \"spiral of death\" the clamp prevents. The project here does not need it yet: it has no physics.")}
      </p>

      <H2>{tx(t, "sdl03_bothTitle", "When to keep the while loop")}</H2>
      <p>
        {tx(t, "sdl03_bothNote",
          "The classic main with a while loop is still fully supported; nothing about it is deprecated. Keep it when SDL is only one part of a program that already owns its loop, such as an existing engine or a tool built on another framework. For a new game, use the callbacks: the same file then builds for desktop, phones and the web, and this track uses them from here on.")}
      </p>

      <H2>{tx(t, "sdl03_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl03_mh0", "Mistake"), tx(t, "sdl03_mh1", "What happens, and the fix")]}
        rows={[
          [tx(t, "sdl03_e1", "#define SDL_MAIN_USE_CALLBACKS after the #include"), tx(t, "sdl03_e1b", "the header has already decided you write main: the linker reports an undefined reference to main. Put the #define first.")],
          [tx(t, "sdl03_e2", "Writing your own main as well"), tx(t, "sdl03_e2b", "\"multiple definition of main\": with callbacks, SDL provides it.")],
          [tx(t, "sdl03_e3", "A while loop inside SDL_AppIterate"), tx(t, "sdl03_e3b", "the same freeze as before, just one level deeper. Do one frame and return.")],
          [tx(t, "sdl03_e4", "Forgetting *appstate = app"), tx(t, "sdl03_e4b", "the other callbacks receive nullptr and crash on app->renderer.")],
          [tx(t, "sdl03_e5", "Starting lastTick at 0"), tx(t, "sdl03_e5b", "the first Δt is the whole time since SDL started, and the square jumps on the first frame. Set lastTick in SDL_AppInit.")],
          [tx(t, "sdl03_e6", "Moving by a fixed amount per frame"), tx(t, "sdl03_e6b", "the game runs faster on faster screens. Multiply by Δt.")],
          [tx(t, "sdl03_e7", "Keeping a pointer to the SDL_Event"), tx(t, "sdl03_e7b", "the event belongs to SDL and is reused after SDL_AppEvent returns. Copy what you need.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl03" items={[
        "On the web and on phones the system owns the loop; a while loop that never returns freezes the page.",
        "With SDL_MAIN_USE_CALLBACKS defined before SDL_main.h, SDL provides main and calls SDL_AppInit, SDL_AppEvent, SDL_AppIterate and SDL_AppQuit.",
        "Your state travels through appstate: store it in SDL_AppInit, get it back in every callback.",
        "SDL_APP_CONTINUE keeps going; SUCCESS and FAILURE end the program, and SDL_AppQuit always runs.",
        "Move things by speed × Δt, with Δt measured by SDL_GetTicksNS, so speed does not depend on the frame rate.",
        "VSync (SDL_SetRenderVSync) paces frames to the display; SDL_HINT_MAIN_CALLBACK_RATE can slow them or wait for events.",
        "Physics uses a fixed timestep with an accumulator and a clamp.",
      ]} />

      <Related t={t} links={[
        { track: "GameDev", id: "game-loop", title: tx(t, "sdl03_rel1", "The Game Loop & Fixed Timestep"), why: tx(t, "sdl03_rel1b", "the fixed timestep in full, with interpolation and the spiral of death, side by side in a figure.") },
        { track: "SDL3", id: "input", title: tx(t, "sdl03_rel2", "Events & Input"), why: tx(t, "sdl03_rel2b", "the next step: steering the square with SDL_AppEvent.") },
      ]} />
    </Article>
  );
}

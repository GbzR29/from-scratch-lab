"use client";

// SDL3 track — "Events & Input": the SDL_Event union read in SDL_AppEvent;
// events versus keyboard state, with the EventsState figure (key repeat); the
// rule of thumb; scancode versus keycode, with the ScancodeKeycode figure and
// key names for menus; the project: the square steered with arrows or WASD
// (diagonal formula, clamp), Escape quits, complete main.cpp; the mouse
// (floats, relative mode); gamepads in short (radial deadzone formula); text
// input; common mistakes.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { EventsStateFigure } from "@/components/lesson/figures/sdl3/EventsStateFigure";
import { ScancodeKeycodeFigure } from "@/components/lesson/figures/sdl3/ScancodeKeycodeFigure";

const r = String.raw;

export function InputContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl04_intro",
          "SDL tells you what the player does in two ways. An event says that something happened: a key went down, the mouse moved, a gamepad was plugged in. The state says what is true right now: which keys are held at this moment. Games need both, and most input bugs come from using one where the other belongs. In this chapter the square from the last chapter gets steered with the keyboard, and Escape closes the program.")}
      </Lead>

      <Goals t={t} id="sdl04" items={[
        "Read an SDL_Event: check its type, then use the matching member.",
        "Choose between an event and the keyboard state for each action.",
        "Bind movement by scancode, so it works on every keyboard layout.",
        "Steer the square at the same speed in every direction, inside the window.",
        "Read the mouse, a gamepad stick and typed text.",
      ]} />

      <H2>{tx(t, "sdl04_eventTitle", "Events: something happened")}</H2>
      <p>
        {tx(t, "sdl04_eventBody",
          "With the main callbacks, SDL calls SDL_AppEvent once for every event, in the order they happened. The event arrives as an SDL_Event, which is a union: one block of memory that holds one of many structs. The type field, which every member shares, says which struct it is. Check type first, then read only the member that belongs to it.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl04_eh0", "type"), tx(t, "sdl04_eh1", "Member to read"), tx(t, "sdl04_eh2", "Useful fields")]}
        rows={[
          ["SDL_EVENT_KEY_DOWN, _KEY_UP", "event->key", tx(t, "sdl04_e1", "scancode, key, mod (Shift, Ctrl…), repeat, down")],
          ["SDL_EVENT_MOUSE_MOTION", "event->motion", tx(t, "sdl04_e2", "x, y (position), xrel, yrel (movement since the last event), all float")],
          ["SDL_EVENT_MOUSE_BUTTON_DOWN, _UP", "event->button", tx(t, "sdl04_e3", "button (SDL_BUTTON_LEFT…), clicks (2 = double click), x, y")],
          ["SDL_EVENT_MOUSE_WHEEL", "event->wheel", tx(t, "sdl04_e4", "x, y: float, so smooth trackpads give fractions")],
          ["SDL_EVENT_WINDOW_RESIZED", "event->window", tx(t, "sdl04_e5", "data1, data2: the new width and height")],
          ["SDL_EVENT_GAMEPAD_ADDED, _REMOVED", "event->gdevice", tx(t, "sdl04_e6", "which: the id to open or close")],
          ["SDL_EVENT_TEXT_INPUT", "event->text", tx(t, "sdl04_e7", "text: the typed characters, as UTF-8")],
        ]}
      />
      <CodeBlock lang="cpp" filename="events.cpp" t={t}>{`SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    switch (event->type) {
        case SDL_EVENT_QUIT:
            return SDL_APP_SUCCESS;
        case SDL_EVENT_KEY_DOWN:
            if (event->key.repeat) break;            // held down: not a new press
            if (event->key.key == SDLK_SPACE) jump();
            break;
        case SDL_EVENT_MOUSE_BUTTON_DOWN:
            if (event->button.button == SDL_BUTTON_LEFT) shoot(event->button.x, event->button.y);
            break;
    }
    return SDL_APP_CONTINUE;
}`}</CodeBlock>
      <p>
        {tx(t, "sdl04_repeatBody",
          "When a key is held, the operating system starts repeating it after a short delay, as it does in a text editor. Each repeat is another SDL_EVENT_KEY_DOWN, with repeat set to true. For a jump, a repeat is not a new press, so the code skips it.")}
      </p>

      <H2>{tx(t, "sdl04_stateTitle", "State: what is held right now")}</H2>
      <p>
        {tx(t, "sdl04_stateBody",
          "SDL_GetKeyboardState returns a pointer to an array of bool, one entry per key, indexed by scancode (explained below). keys[SDL_SCANCODE_LEFT] is true while the left arrow is held. SDL updates the array itself as it processes events, which happens before each SDL_AppIterate. The pointer stays valid for the whole program, so you can ask for it once or every frame; both are fine.")}
      </p>
      <CodeBlock lang="cpp" filename="state.cpp" t={t}>{`const bool* keys = SDL_GetKeyboardState(nullptr);   // nullptr: we do not need the array's length
if (keys[SDL_SCANCODE_LEFT]) { /* held this frame */ }`}</CodeBlock>
      <p>
        {tx(t, "sdl04_stateWhy",
          "Why not move with key events? Hold a key in the figure below and compare the two squares.")}
      </p>

      <EventsStateFigure t={t} />

      <p>
        {tx(t, "sdl04_stateAfter",
          "The event square follows the key-repeat settings of the operating system: one step, a pause of about half a second, then steps at the repeat rate. Every player's settings are different, and some turn repeat off. The state square moves from the first frame at exactly the speed the code says. The rule that follows:")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl04_rh0", "The action"), tx(t, "sdl04_rh1", "Read"), tx(t, "sdl04_rh2", "Examples")]}
        rows={[
          [tx(t, "sdl04_r1", "happens once per press"), tx(t, "sdl04_r1b", "an event (skip repeat)"), tx(t, "sdl04_r1c", "jump, shoot, open the menu, pause")],
          [tx(t, "sdl04_r2", "lasts as long as the key is held"), tx(t, "sdl04_r2b", "the state, every frame"), tx(t, "sdl04_r2c", "walk, run, aim, accelerate")],
          [tx(t, "sdl04_r3", "repeats on purpose"), tx(t, "sdl04_r3b", "events, with repeat"), tx(t, "sdl04_r3c", "moving through a menu or a text cursor while the key is held")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "sdl04_focusNote",
          "When the window loses focus, for example when the player Alt+Tabs away while holding a key, SDL sends a KEY_UP for every held key and clears the state. Without that, the character would keep walking forever, since the key-up happens in another window. You can try it in the figure: hold a key and click outside.")}
      </Callout>

      <H2>{tx(t, "sdl04_scanTitle", "Scancode or keycode")}</H2>
      <p>
        {tx(t, "sdl04_scanBody",
          "Every key event carries two codes. The scancode is the physical position of the key. SDL names positions after the US keyboard, so SDL_SCANCODE_W means \"the second key of the top letter row\", whatever is printed on it. The keycode is what the key types under the player's layout: on a French AZERTY keyboard that same position types Z, so its keycode is SDLK_Z.")}
      </p>

      <ScancodeKeycodeFigure t={t} />

      <LessonTable
        headers={[tx(t, "sdl04_sh0", "Use"), tx(t, "sdl04_sh1", "For"), tx(t, "sdl04_sh2", "Because")]}
        rows={[
          ["scancode", tx(t, "sdl04_s1", "movement, and any binding chosen for where it is on the board"), tx(t, "sdl04_s1b", "the hand finds the same shape on every layout")],
          ["keycode", tx(t, "sdl04_s2", "shortcuts named after a letter: Ctrl+Z, M for map, I for inventory"), tx(t, "sdl04_s2b", "the player looks for the letter printed on the key")],
          [tx(t, "sdl04_s3", "neither"), tx(t, "sdl04_s3c", "typed text: names, chat"), tx(t, "sdl04_s3b", "use SDL_EVENT_TEXT_INPUT, at the end of this chapter")],
        ]}
      />
      <p>
        {tx(t, "sdl04_namesBody",
          "A settings menu should show the player's own letters. SDL_GetKeyFromScancode turns a position into the keycode of the current layout, and SDL_GetKeyName gives its printable name:")}
      </p>
      <CodeBlock lang="cpp" filename="keynames.cpp" t={t}>{`// "Z" on AZERTY, "W" on QWERTY: the key the player must press to move up
SDL_Keycode k = SDL_GetKeyFromScancode(SDL_SCANCODE_W, SDL_KMOD_NONE, false);
SDL_Log("Up: %s", SDL_GetKeyName(k));`}</CodeBlock>
      <Callout type="tip" t={t}>
        {tx(t, "sdl04_shiftTip",
          "SDL's keycodes ignore Shift: Shift+W still gives SDLK_W, and the Shift is in event->key.mod. On layouts without Latin letters, such as Russian, the letter keys report the US letter by default, so a Ctrl+Z shortcut still works. Both behaviours come from the default of SDL_HINT_KEYCODE_OPTIONS.")}
      </Callout>

      <H2>{tx(t, "sdl04_projectTitle", "The project: steer the square")}</H2>
      <p>
        {tx(t, "sdl04_projectBody",
          "Back to src/main.cpp from the Main Loop chapter. Three changes: the square gets a y and starts in the middle of the window; Escape ends the program; and SDL_AppIterate moves the square with the arrow keys or WASD instead of sliding it on its own.")}
      </p>
      <p>
        {tx(t, "sdl04_dirBody",
          "Each frame builds a direction (dx, dy) from the held keys: −1, 0 or +1 on each axis. Holding Right and Down gives (1, 1). That vector is longer than (1, 0):")}
      </p>
      <Equation label={tx(t, "sdl04_eqDiag", "Length of a diagonal")}
        where={[
          [r`(1, 1)`, tx(t, "sdl04_wDir", "the direction with Right and Down held")],
          [r`\lvert(1,1)\rvert`, tx(t, "sdl04_wLen", "its length, by Pythagoras")],
          [r`0.7071`, tx(t, "sdl04_w07", "1 / √2: multiplying both parts by it brings the length back to 1")],
        ]}>
        {r`\lvert(1,1)\rvert = \sqrt{1^2 + 1^2} = \sqrt{2} \approx 1.414, \qquad \sqrt{2}\cdot 0.7071 \approx 1`}
      </Equation>
      <p>
        {tx(t, "sdl04_dirBody2",
          "Without the correction, the square moves 41% faster on a diagonal, an old bug of many games. With it, the speed is the same in all eight directions. The new position is then kept inside the window:")}
      </p>
      <Equation label={tx(t, "sdl04_eqMove", "One frame of movement")}
        where={[
          [r`x`, tx(t, "sdl04_wX", "the square's left edge before this frame, in pixels")],
          [r`d_x`, tx(t, "sdl04_wDx", "the horizontal part of the direction: −1, −0.7071, 0, 0.7071 or 1")],
          [r`v`, tx(t, "sdl04_wV", "SPEED: 240 pixels per second")],
          [r`\Delta t`, tx(t, "sdl04_wDt", "the frame time in seconds, measured as in the last chapter")],
          [r`1180`, tx(t, "sdl04_w1180", "the largest left edge that keeps the square inside: 1280 − 100")],
          [r`\operatorname{clamp}`, tx(t, "sdl04_wClamp", "SDL_clamp(v, lo, hi): v, but at least lo and at most hi")],
        ]}>
        {r`x' = \operatorname{clamp}(\,x + d_x\, v\, \Delta t,\; 0,\; 1180\,)`}
      </Equation>
      <p>
        {tx(t, "sdl04_yBody", "y works the same way, with dy and a limit of 720 − 100 = 620. The complete file:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

constexpr float SPEED = 240.0f;      // new: pixels per second
constexpr float SIZE  = 100.0f;      // new: the square's width and height

struct AppState {
    SDL_Window*   window   = nullptr;
    SDL_Renderer* renderer = nullptr;
    Uint64        lastTick = 0;
    float         x = 590.0f, y = 310.0f;   // new: y; both start centred
};

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    SDL_SetAppMetadata("SDL3 Lab", "0.1", "com.example.sdl3lab");
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    auto* app = new AppState{};
    *appstate = app;
    if (!SDL_CreateWindowAndRenderer("SDL3 Lab", 1280, 720, SDL_WINDOW_RESIZABLE,
                                     &app->window, &app->renderer)) {
        SDL_Log("SDL_CreateWindowAndRenderer failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    SDL_SetRenderVSync(app->renderer, 1);
    app->lastTick = SDL_GetTicksNS();
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    // new: Escape quits. A key named by its letter or symbol: the keycode
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) return SDL_APP_SUCCESS;
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    auto* app = static_cast<AppState*>(appstate);

    const Uint64 now = SDL_GetTicksNS();
    const float  dt  = float(now - app->lastTick) / 1e9f;
    app->lastTick = now;

    // new: input: arrows or WASD, by physical key position
    const bool* keys = SDL_GetKeyboardState(nullptr);
    float dx = 0.0f, dy = 0.0f;
    if (keys[SDL_SCANCODE_LEFT]  || keys[SDL_SCANCODE_A]) dx -= 1.0f;
    if (keys[SDL_SCANCODE_RIGHT] || keys[SDL_SCANCODE_D]) dx += 1.0f;
    if (keys[SDL_SCANCODE_UP]    || keys[SDL_SCANCODE_W]) dy -= 1.0f;
    if (keys[SDL_SCANCODE_DOWN]  || keys[SDL_SCANCODE_S]) dy += 1.0f;
    if (dx != 0.0f && dy != 0.0f) { dx *= 0.7071f; dy *= 0.7071f; }   // diagonals not faster

    app->x = SDL_clamp(app->x + dx * SPEED * dt, 0.0f, 1280.0f - SIZE);
    app->y = SDL_clamp(app->y + dy * SPEED * dt, 0.0f, 720.0f - SIZE);

    // Draw
    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

    const SDL_FRect square{app->x, app->y, SIZE, SIZE};
    SDL_SetRenderDrawColor(app->renderer, 59, 130, 246, 255);
    SDL_RenderFillRect(app->renderer, &square);

    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        SDL_DestroyRenderer(app->renderer);
        SDL_DestroyWindow(app->window);
        delete app;
    }
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl04_lh0", "Code"), tx(t, "sdl04_lh1", "What it does")]}
        rows={[
          ["x = 590.0f, y = 310.0f", tx(t, "sdl04_l1", "The centre of the window for a 100-pixel square: (1280 − 100) / 2 = 590 and (720 − 100) / 2 = 310.")],
          ["event->key.key == SDLK_ESCAPE", tx(t, "sdl04_l2", "Escape is found by what it is, so the keycode is right here. It is the same key on every layout anyway.")],
          ["SDL_GetKeyboardState(nullptr)", tx(t, "sdl04_l3", "The held keys this frame. SDL has already processed this frame's events when SDL_AppIterate runs.")],
          ["|| keys[SDL_SCANCODE_A]", tx(t, "sdl04_l4", "Two bindings per direction: the arrows and the WASD positions. The positions, not the letters, so AZERTY players get the same inverted T.")],
          ["dx -= 1.0f … dx += 1.0f", tx(t, "sdl04_l5", "Left and right held together cancel to 0, and the square stands still, which is what players expect.")],
          ["dx *= 0.7071f; dy *= 0.7071f", tx(t, "sdl04_l6", "Only when both axes are non-zero: the diagonal correction from the formula above.")],
          ["SDL_clamp(…, 0.0f, 1280.0f - SIZE)", tx(t, "sdl04_l7", "Keeps the left edge between 0 and 1180, so the whole square stays inside the 1280-pixel-wide window.")],
          ["SDL_FRect square{app->x, app->y, …}", tx(t, "sdl04_l8", "The square is now drawn where the player put it, not at a fixed height.")],
        ]}
      />
      <p>
        {tx(t, "sdl04_runBody",
          "Build and run. The arrows or WASD move the square in eight directions at the same speed, it stops at the edges, and Escape closes the window. Now drag the window's corner to make it bigger: the square still stops at x = 1180, far from the new right edge, and a smaller window hides part of the playing field. The game is written in window pixels, and the window size is not fixed. The next chapter fixes that with a logical resolution.")}
      </p>

      <H2>{tx(t, "sdl04_mouseTitle", "The mouse")}</H2>
      <p>
        {tx(t, "sdl04_mouseBody",
          "Mouse positions are floats in SDL3, measured in window coordinates from the top-left corner. Like the keyboard, the mouse has events (motion, button, wheel) and a state you can ask for at any time:")}
      </p>
      <CodeBlock lang="cpp" filename="mouse.cpp" t={t}>{`float mx, my;
SDL_MouseButtonFlags buttons = SDL_GetMouseState(&mx, &my);   // position + held buttons
if (buttons & SDL_BUTTON_LMASK) { /* left button held */ }

// First-person camera: hide the cursor, keep it in the window, report only movement
SDL_SetWindowRelativeMouseMode(window, true);
// then, in SDL_AppEvent, for SDL_EVENT_MOUSE_MOTION:
//     yaw   += event->motion.xrel * sensitivity;
//     pitch -= event->motion.yrel * sensitivity;`}</CodeBlock>
      <p>
        {tx(t, "sdl04_mouseNote",
          "In relative mode the cursor cannot reach the window's edge, so xrel and yrel keep coming however far the mouse travels. Once the next chapter sets a logical resolution, window coordinates no longer match game coordinates; SDL_ConvertEventToRenderCoordinates converts them, and the renderer chapter shows how.")}
      </p>

      <H2>{tx(t, "sdl04_padTitle", "Gamepads, in short")}</H2>
      <p>
        {tx(t, "sdl04_padBody",
          "The SDL_Gamepad API maps every known controller onto one layout: four face buttons named by direction (SDL_GAMEPAD_BUTTON_SOUTH is A on Xbox, Cross on PlayStation, B on Switch), two sticks, two triggers. Controllers come and go while the game runs, so open them when SDL_EVENT_GAMEPAD_ADDED arrives, not once at startup. Remember to add SDL_INIT_GAMEPAD to SDL_Init.")}
      </p>
      <CodeBlock lang="cpp" filename="gamepad.cpp" t={t}>{`// in SDL_AppEvent
case SDL_EVENT_GAMEPAD_ADDED:
    if (!app->pad) app->pad = SDL_OpenGamepad(event->gdevice.which);
    break;
case SDL_EVENT_GAMEPAD_REMOVED:
    if (app->pad && SDL_GetGamepadID(app->pad) == event->gdevice.which) {
        SDL_CloseGamepad(app->pad);
        app->pad = nullptr;
    }
    break;

// in SDL_AppIterate, when app->pad is set: the left stick, from -32768..32767 to about -1..1
float sx = SDL_GetGamepadAxis(app->pad, SDL_GAMEPAD_AXIS_LEFTX) / 32767.0f;
float sy = SDL_GetGamepadAxis(app->pad, SDL_GAMEPAD_AXIS_LEFTY) / 32767.0f;
const float len = SDL_sqrtf(sx * sx + sy * sy);
const float DEAD = 0.20f;
if (len < DEAD) { sx = sy = 0.0f; }                      // resting stick: no movement
else {
    const float k = SDL_min((len - DEAD) / (1.0f - DEAD), 1.0f) / len;
    sx *= k; sy *= k;                                      // rescaled: 0 at the edge of the dead zone
}`}</CodeBlock>
      <p>
        {tx(t, "sdl04_deadBody",
          "A stick at rest rarely reads exactly 0: worn springs leave it at 0.05 or 0.1, and the character would creep. The dead zone ignores a small circle around the centre, and the rest is rescaled so movement starts smoothly from 0 at the circle's edge:")}
      </p>
      <Equation label={tx(t, "sdl04_eqDead", "Radial dead zone")}
        where={[
          [r`\vec s`, tx(t, "sdl04_wS", "the stick's raw position (sx, sy), each part from about −1 to 1")],
          [r`\lvert\vec s\rvert`, tx(t, "sdl04_wSl", "its distance from the centre: len in the code")],
          [r`d`, tx(t, "sdl04_wD", "the dead zone's radius: 0.20 here")],
          [r`\vec s\,'`, tx(t, "sdl04_wS2", "the position the game uses: same direction, length from 0 to 1")],
        ]}>
        {r`\vec s\,' = \begin{cases} \vec 0 & \lvert\vec s\rvert < d \\[4pt] \dfrac{\lvert\vec s\rvert - d}{1 - d}\cdot\dfrac{\vec s}{\lvert\vec s\rvert} & \text{otherwise} \end{cases}`}
      </Equation>
      <Callout type="warn" t={t}>
        {tx(t, "sdl04_deadzoneWarn",
          "Apply the dead zone to the stick's length, not to each axis separately. Separate dead zones form a square of dead area, and a stick pushed slightly off an axis snaps onto it: players feel the stick sticking to up, down, left and right.")}
      </Callout>

      <H2>{tx(t, "sdl04_textTitle", "Typed text")}</H2>
      <p>
        {tx(t, "sdl04_textBody",
          "To type a name or a chat message, do not build text from key events. One character can take several keys (é is a dead key ´ then e on many layouts), and Chinese, Japanese and Korean are typed through an input method that composes characters from many keystrokes. SDL does all of that and sends the finished characters as SDL_EVENT_TEXT_INPUT, as UTF-8. Text input is off by default and belongs to a window:")}
      </p>
      <CodeBlock lang="cpp" filename="text.cpp" t={t}>{`SDL_StartTextInput(window);        // when the name field gets focus; on phones, shows the keyboard

case SDL_EVENT_TEXT_INPUT:
    name += event->text.text;      // std::string: already UTF-8, one or more characters
    break;

SDL_StopTextInput(window);         // when the field loses focus`}</CodeBlock>
      <p>
        {tx(t, "sdl04_textNote",
          "While text input is on, letter keys still send key events too. A game that moves with WASD should turn text input off when the name field closes, or a player typing \"Sam\" also walks.")}
      </p>

      <H2>{tx(t, "sdl04_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl04_mh0", "Symptom"), tx(t, "sdl04_mh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl04_m1", "Movement starts, stops for half a second, then continues"), tx(t, "sdl04_m1b", "movement driven by KEY_DOWN events and their repeats. Read SDL_GetKeyboardState in SDL_AppIterate.")],
          [tx(t, "sdl04_m2", "A jump fires many times while the key is held"), tx(t, "sdl04_m2b", "repeat events counted as presses. Skip events with event->key.repeat.")],
          [tx(t, "sdl04_m3", "French or German players cannot walk properly"), tx(t, "sdl04_m3b", "movement bound by keycode (SDLK_W). Bind by scancode (SDL_SCANCODE_W).")],
          [tx(t, "sdl04_m4", "Moving diagonally is faster"), tx(t, "sdl04_m4b", "the direction (1, 1) has length √2. Scale both parts by 0.7071, or normalize the vector.")],
          [tx(t, "sdl04_m5", "The mouse position is wrong by a factor, or offset"), tx(t, "sdl04_m5b", "window coordinates used as game coordinates after a logical resolution was set. Convert them (next chapter).")],
          [tx(t, "sdl04_m6", "The character creeps with nobody touching the gamepad"), tx(t, "sdl04_m6b", "no dead zone. Apply a radial one.")],
          [tx(t, "sdl04_m7", "Reading event->key on a mouse event gives nonsense"), tx(t, "sdl04_m7b", "the union holds one struct at a time. Check event->type first.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl04" items={[
        "An SDL_Event is a union: check type, then read the matching member (key, motion, button, wheel…).",
        "Events say something happened; SDL_GetKeyboardState says what is held now. Single actions use events, continuous ones use the state.",
        "Held keys repeat after a delay set by the operating system; skip event->key.repeat for presses, and never move with repeats.",
        "Scancodes are positions, keycodes are what the layout types: movement by scancode, letter shortcuts by keycode, text through SDL_EVENT_TEXT_INPUT.",
        "Scale a diagonal by 1/√2 ≈ 0.7071 so all eight directions have the same speed, and clamp the position to the playing field.",
        "Mouse positions are floats in window coordinates; relative mode reports movement only.",
        "Open gamepads on SDL_EVENT_GAMEPAD_ADDED and apply a radial dead zone to each stick.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "renderer", title: tx(t, "sdl04_rel1", "The 2D Renderer"), why: tx(t, "sdl04_rel1b", "the next step: a 640 × 360 game resolution, so the playing field no longer depends on the window size.") },
        { track: "GameDev", id: "platformer", title: tx(t, "sdl04_rel2", "Platformer Feel: Jumps, Coyote Time & Buffering"), why: tx(t, "sdl04_rel2b", "what a game does with a jump event once it has one: buffering it, and forgiving late presses.") },
      ]} />
    </Article>
  );
}

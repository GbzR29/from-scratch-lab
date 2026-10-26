"use client";

// SDL3 track — "The 2D Renderer": what SDL_Renderer is (backends, the frame:
// clear, draw, present); the drawing calls and debug text; a fixed game
// resolution with SDL_SetRenderLogicalPresentation, the LogicalPresentation
// figure, the scale formulas and a 1000 × 720 worked example; the project
// moved to 640 × 360 with INTEGER_SCALE (complete main.cpp, the state the
// Textures chapter starts from); mouse coordinates converted to the game's;
// blend modes, with the BlendModes figure and the BLEND formula; VSync and the
// backend; custom geometry; limits; common mistakes.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { LogicalPresentationFigure } from "@/components/lesson/figures/sdl3/LogicalPresentationFigure";
import { BlendModesFigure } from "@/components/lesson/figures/sdl3/BlendModesFigure";

const r = String.raw;

export function RendererContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl05_intro",
          "At the end of the last chapter the game was written in window pixels: make the window bigger and the square still stops at x = 1180, make it smaller and part of the field disappears. This chapter gives the game its own resolution, 640 × 360, that SDL scales into any window. On the way you meet the rest of the 2D renderer: its drawing calls, how a colour with alpha is mixed into what is already drawn, and where the renderer stops and a GPU API begins.")}
      </Lead>

      <Goals t={t} id="sdl05" items={[
        "Draw a frame with the renderer: clear, draw shapes, present.",
        "Give the game a fixed resolution and choose how SDL fits it into the window.",
        "Compute the scale and the bars SDL uses for a given window size.",
        "Convert a mouse position from window to game coordinates.",
        "Pick a blend mode, and say what each one does to the pixels underneath.",
      ]} />

      <H2>{tx(t, "sdl05_whatTitle", "What the renderer is")}</H2>
      <p>
        {tx(t, "sdl05_whatBody",
          "SDL_Renderer is SDL's 2D drawing API. It draws rectangles, lines, points, textures and triangles, and does it on the graphics card through whatever the system offers: Direct3D on Windows, Metal on macOS and iOS, Vulkan or OpenGL elsewhere, WebGL in a browser. Your code is the same on all of them. SDL_CreateWindowAndRenderer picked one for you in the setup chapter; SDL_GetRendererName says which.")}
      </p>
      <p>
        {tx(t, "sdl05_frameBody",
          "Every frame has the same three steps. SDL_RenderClear fills the whole frame with the draw colour. The drawing calls then paint on top of it, in order: later calls cover earlier ones. Nothing is visible until SDL_RenderPresent shows the finished frame at once. Drawing happens in a hidden back buffer, so the player never sees half a frame.")}
      </p>
      <CodeBlock lang="cpp" filename="shapes.cpp" t={t}>{`SDL_SetRenderDrawColor(renderer, 16, 18, 26, 255);    // r, g, b, a: 0-255
SDL_RenderClear(renderer);

const SDL_FRect box{100.5f, 80.0f, 220.0f, 140.0f};   // x, y, w, h: floats
SDL_SetRenderDrawColor(renderer, 59, 130, 246, 255);
SDL_RenderFillRect(renderer, &box);                    // filled
SDL_SetRenderDrawColor(renderer, 168, 85, 247, 255);
SDL_RenderRect(renderer, &box);                        // outline, 1 pixel wide

SDL_RenderLine(renderer, 0.0f, 0.0f, 320.0f, 180.0f);
SDL_RenderPoint(renderer, 160.0f, 90.0f);

SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
SDL_RenderDebugText(renderer, 8.0f, 8.0f, "hello");    // built-in 8 x 8 font, for debugging

SDL_RenderPresent(renderer);`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl05_dh0", "Call"), tx(t, "sdl05_dh1", "Draws")]}
        rows={[
          ["SDL_RenderClear", tx(t, "sdl05_d1", "the whole target, in the draw colour, ignoring blend mode")],
          ["SDL_RenderFillRect / SDL_RenderRect", tx(t, "sdl05_d2", "a filled rectangle / its 1-pixel outline")],
          ["SDL_RenderLine, SDL_RenderPoint", tx(t, "sdl05_d3", "a 1-pixel line between two points / a single pixel")],
          ["SDL_RenderFillRects, …Rects, …Lines, …Points", tx(t, "sdl05_d4", "many at once from an array: one call instead of hundreds")],
          ["SDL_RenderDebugText", tx(t, "sdl05_d5", "ASCII text in a fixed 8 × 8 pixel font; real fonts come in the Text chapter")],
          ["SDL_RenderTexture", tx(t, "sdl05_d6", "an image (Textures chapter)")],
          ["SDL_RenderGeometry", tx(t, "sdl05_d7", "your own triangles, at the end of this chapter")],
        ]}
      />
      <p>
        {tx(t, "sdl05_colourNote",
          "The draw colour is a setting of the renderer, not an argument of each call: every call uses the colour set last. A forgotten SDL_SetRenderDrawColor shows up as a shape in the colour of whatever was drawn before it.")}
      </p>

      <H2>{tx(t, "sdl05_logicalTitle", "A fixed game resolution")}</H2>
      <p>
        {tx(t, "sdl05_logicalBody",
          "SDL_SetRenderLogicalPresentation(renderer, 640, 360, mode) gives the game a resolution of its own. From then on every drawing call uses game coordinates: (0, 0) is the top-left of the game, (640, 360) its bottom-right, whatever size the window has. SDL scales the finished frame into the window. The mode says how, when the window's shape does not match the game's. Drag the corner of the window in the figure.")}
      </p>

      <LogicalPresentationFigure t={t} />

      <LessonTable
        headers={[tx(t, "sdl05_h0", "Mode"), tx(t, "sdl05_h1", "Behaviour"), tx(t, "sdl05_h2", "Good for")]}
        rows={[
          ["INTEGER_SCALE", tx(t, "sdl05_m3", "whole-number scales only, centred, bars around"), tx(t, "sdl05_m3b", "pixel art: every pixel stays square and sharp")],
          ["LETTERBOX", tx(t, "sdl05_m1", "as large as fits, aspect kept, bars on two sides"), tx(t, "sdl05_m1b", "most games; the safe default for smooth art")],
          ["OVERSCAN", tx(t, "sdl05_m2", "as small as fills, aspect kept, edges cut off"), tx(t, "sdl05_m2b", "backgrounds that can lose their edges; keep the HUD away from them")],
          ["STRETCH", tx(t, "sdl05_m4", "fills the window, aspect distorted"), tx(t, "sdl05_m4b", "rarely: circles become ellipses")],
          ["DISABLED", tx(t, "sdl05_m5", "no logical size: coordinates are window pixels"), tx(t, "sdl05_m5b", "editors and tools that use every pixel")],
        ]}
      />
      <p>
        {tx(t, "sdl05_scaleBody",
          "SDL computes the scale from the window's size in pixels, W × H, and the game's, 640 × 360. For LETTERBOX it takes the largest scale at which the game still fits in both directions; INTEGER_SCALE rounds it down to a whole number:")}
      </p>
      <Equation label={tx(t, "sdl05_eqScale", "Letterbox and integer scale")}
        where={[
          [r`W, H`, tx(t, "sdl05_wWH", "the window's size, in pixels")],
          [r`640, 360`, tx(t, "sdl05_w640", "the game's logical size")],
          [r`s`, tx(t, "sdl05_wS", "the letterbox scale: one game pixel becomes s × s window pixels")],
          [r`s_{\text{int}}`, tx(t, "sdl05_wSi", "the integer scale: s rounded down, at least 1")],
          [r`\lfloor\cdot\rfloor`, tx(t, "sdl05_wFloor", "rounding down to a whole number")],
        ]}>
        {r`s = \min\!\left(\frac{W}{640},\ \frac{H}{360}\right), \qquad s_{\text{int}} = \max\!\big(1,\ \lfloor s \rfloor\big)`}
      </Equation>
      <p>
        {tx(t, "sdl05_exampleBody",
          "A worked example, for a window of 1000 × 720. W / 640 = 1.5625 and H / 360 = 2, so the width limits. LETTERBOX: s = 1.5625, the game is drawn 1000 × 562 (360 × 1.5625 = 562.5, rounded down), with bars of (720 − 562) / 2 = 79 pixels above and below. INTEGER_SCALE: ⌊1.5625⌋ = 1, so the game is drawn at its own size, 640 × 360, in the middle, with bars of 180 pixels on every side. Pick 1000×720 in the figure to see both.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "sdl05_barsNote",
          "The bars are not black: they are whatever SDL_RenderClear filled the frame with, since clearing covers the whole window, bars included. With a clear colour that is also the game's background, the bars are invisible and the game simply sits on that colour.")}
      </Callout>

      <H2>{tx(t, "sdl05_projectTitle", "The project: a 640 × 360 game")}</H2>
      <p>
        {tx(t, "sdl05_projectBody",
          "The project uses INTEGER_SCALE. The sprites of the next chapter are pixel art, and 640 × 360 divides the most common screens exactly: 1280 × 720 is 2×, 1920 × 1080 is 3×, 2560 × 1440 is 4×. Everything in the game is now measured in game pixels, so the numbers change: the square is 32 game pixels wide (64 on a 1280 × 720 window), and the speed is 120 game pixels per second, which is the same 240 window pixels per second at 2×.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

constexpr int   GAME_W = 640;        // new: the logical resolution
constexpr int   GAME_H = 360;
constexpr float SPEED  = 120.0f;     // now logical pixels per second
constexpr float FRAME  = 32.0f;      // the square's size; one sprite frame in the next chapter

struct AppState {
    SDL_Window*   window   = nullptr;
    SDL_Renderer* renderer = nullptr;
    Uint64        lastTick = 0;
    float         x = 304.0f, y = 164.0f;   // centred in 640 × 360
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
    SDL_SetRenderLogicalPresentation(app->renderer, GAME_W, GAME_H,     // new
                                     SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);

    app->lastTick = SDL_GetTicksNS();
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) return SDL_APP_SUCCESS;
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    auto* app = static_cast<AppState*>(appstate);

    const Uint64 now = SDL_GetTicksNS();
    const float  dt  = float(now - app->lastTick) / 1e9f;
    app->lastTick = now;

    // Input: arrows or WASD, by physical key position
    const bool* keys = SDL_GetKeyboardState(nullptr);
    float dx = 0.0f, dy = 0.0f;
    if (keys[SDL_SCANCODE_LEFT]  || keys[SDL_SCANCODE_A]) dx -= 1.0f;
    if (keys[SDL_SCANCODE_RIGHT] || keys[SDL_SCANCODE_D]) dx += 1.0f;
    if (keys[SDL_SCANCODE_UP]    || keys[SDL_SCANCODE_W]) dy -= 1.0f;
    if (keys[SDL_SCANCODE_DOWN]  || keys[SDL_SCANCODE_S]) dy += 1.0f;
    if (dx != 0.0f && dy != 0.0f) { dx *= 0.7071f; dy *= 0.7071f; }   // diagonals not faster

    // new: the limits are the game's size, not the window's
    app->x = SDL_clamp(app->x + dx * SPEED * dt, 0.0f, GAME_W - FRAME);
    app->y = SDL_clamp(app->y + dy * SPEED * dt, 0.0f, GAME_H - FRAME);

    // Draw, in game coordinates
    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

    const SDL_FRect square{app->x, app->y, FRAME, FRAME};
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
        headers={[tx(t, "sdl05_lh0", "Code"), tx(t, "sdl05_lh1", "What changed")]}
        rows={[
          ["GAME_W, GAME_H", tx(t, "sdl05_l1", "The game's size, used for the presentation and for the limits, so the two cannot disagree.")],
          ["SPEED 120, FRAME 32", tx(t, "sdl05_l2", "The old 240 and 100 were window pixels. In game pixels at 2×, 240 becomes 120; the square becomes 32, the size of one sprite frame in the next chapter.")],
          ["x = 304, y = 164", tx(t, "sdl05_l3", "The centre for a 32-pixel square: (640 − 32) / 2 = 304 and (360 − 32) / 2 = 164.")],
          ["SDL_SetRenderLogicalPresentation", tx(t, "sdl05_l4", "Called once, right after the renderer exists. SDL keeps the setting and recomputes the scale whenever the window changes size.")],
          ["GAME_W - FRAME", tx(t, "sdl05_l5", "The limit is now 640 − 32 = 608, in game pixels, for every window size.")],
          ["1280, 720 in SDL_CreateWindowAndRenderer", tx(t, "sdl05_l6", "Still window pixels: the size the window opens at, which is exactly 2× the game.")],
        ]}
      />
      <p>
        {tx(t, "sdl05_runBody",
          "Build and run. At first nothing seems to change: the window is 1280 × 720, the game is drawn at 2×. Now resize the window. Below 1280 × 720 the game drops to 1× in the middle; at 1920 × 1080 (or fullscreen on such a screen) it is 3×. The square always stops at the edge of the game, and the field never gets cut off.")}
      </p>

      <H2>{tx(t, "sdl05_mouseTitle", "Mouse positions in game coordinates")}</H2>
      <p>
        {tx(t, "sdl05_mouseBody",
          "Mouse events still arrive in window coordinates. With a logical resolution they must be converted before they mean anything in the game: a click at window (640, 360) is the game's centre (320, 180) at 2×, and at 1× with 180-pixel bars it is (460, 180). The conversion undoes the presentation:")}
      </p>
      <Equation label={tx(t, "sdl05_eqMouse", "Window to game")}
        where={[
          [r`g_x`, tx(t, "sdl05_wGx", "the x position in game coordinates")],
          [r`w_x`, tx(t, "sdl05_wWx", "the x position in the window, from the event")],
          [r`x_0`, tx(t, "sdl05_wX0", "where the game's left edge is in the window: the width of the left bar")],
          [r`s`, tx(t, "sdl05_wS2", "the presentation's scale")],
        ]}>
        {r`g_x = \frac{w_x - x_0}{s}`}
      </Equation>
      <p>
        {tx(t, "sdl05_mouseBody2",
          "You never write it yourself: SDL_ConvertEventToRenderCoordinates converts every position in an event in place, and SDL_RenderCoordinatesFromWindow converts one point. Move the pointer over the window in the figure above to watch the numbers.")}
      </p>
      <CodeBlock lang="cpp" filename="mouse.cpp" t={t}>{`// first line of SDL_AppEvent: from here on, positions are game coordinates
SDL_ConvertEventToRenderCoordinates(app->renderer, event);

if (event->type == SDL_EVENT_MOUSE_BUTTON_DOWN) {
    const float gx = event->button.x, gy = event->button.y;   // 0..640, 0..360
    if (gx < 0 || gx >= GAME_W || gy < 0 || gy >= GAME_H) { /* a click on a bar */ }
}

// SDL_GetMouseState still returns window coordinates: convert them yourself
float wx, wy, gx, gy;
SDL_GetMouseState(&wx, &wy);
SDL_RenderCoordinatesFromWindow(app->renderer, wx, wy, &gx, &gy);`}</CodeBlock>

      <H2>{tx(t, "sdl05_blendTitle", "Blending: drawing over what is there")}</H2>
      <p>
        {tx(t, "sdl05_blendBody",
          "Each drawing call mixes its colour, the source, with the pixel already in the frame, the destination. The renderer's blend mode, set with SDL_SetRenderDrawBlendMode, says how. The default is SDL_BLENDMODE_NONE: the source simply replaces the destination, so a colour with alpha 128 still draws fully opaque. Try the modes in the figure.")}
      </p>

      <BlendModesFigure t={t} />

      <p>
        {tx(t, "sdl05_blendFormula",
          "SDL_BLENDMODE_BLEND is ordinary transparency. With every value between 0 and 1, each of the three colour channels is mixed as:")}
      </p>
      <Equation label={tx(t, "sdl05_eqBlend", "SDL_BLENDMODE_BLEND")}
        where={[
          [r`c_{\text{out}}`, tx(t, "sdl05_wOut", "the channel's new value in the frame")],
          [r`c_s`, tx(t, "sdl05_wCs", "the source channel: the draw colour, as 0 to 1 (red 239 becomes 0.937)")],
          [r`c_d`, tx(t, "sdl05_wCd", "the destination channel: what the frame held at that pixel")],
          [r`\alpha_s`, tx(t, "sdl05_wAs", "the source alpha, 0 to 1: alpha 128 becomes 0.502")],
        ]}>
        {r`c_{\text{out}} = c_s\,\alpha_s + c_d\,(1 - \alpha_s)`}
      </Equation>
      <p>
        {tx(t, "sdl05_blendExample",
          "Half-transparent red (239, 68, 68, 128) over cyan (34, 211, 238): the red channel becomes 0.937 × 0.502 + 0.133 × 0.498 ≈ 0.537, which is 137 out of 255. Green and blue follow the same way, and the pixel becomes (137, 139, 153), a slate grey. The figure shows these numbers for the cell you click.")}
      </p>
      <CodeBlock lang="cpp" filename="pause.cpp" t={t}>{`// A pause screen: darken the finished frame by half, then draw the menu
SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
SDL_SetRenderDrawColor(renderer, 0, 0, 0, 128);
SDL_RenderFillRect(renderer, nullptr);              // nullptr: the whole target
SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_NONE);   // back to the default`}</CodeBlock>
      <p>
        {tx(t, "sdl05_blendTexture",
          "The draw blend mode only affects shapes. Textures have their own, set with SDL_SetTextureBlendMode; a texture loaded from a PNG with transparency already gets SDL_BLENDMODE_BLEND, as the next chapter shows.")}
      </p>

      <H2>{tx(t, "sdl05_vsyncTitle", "VSync and the backend")}</H2>
      <CodeBlock lang="cpp" filename="vsync.cpp" t={t}>{`SDL_SetRenderVSync(renderer, 1);                           // one frame per display refresh
SDL_SetRenderVSync(renderer, 2);                           // one frame every second refresh
SDL_SetRenderVSync(renderer, SDL_RENDERER_VSYNC_ADAPTIVE); // sync, but never wait when late
SDL_SetRenderVSync(renderer, SDL_RENDERER_VSYNC_DISABLED); // as fast as possible

SDL_Log("renderer: %s", SDL_GetRendererName(renderer));    // e.g. "direct3d11", "metal", "vulkan"
SDL_SetHint(SDL_HINT_RENDER_DRIVER, "vulkan");             // before creating it: ask for one`}</CodeBlock>
      <p>
        {tx(t, "sdl05_vsyncBody",
          "Not every backend supports every value: SDL_SetRenderVSync returns false when the one you asked for is not available, and the game keeps running with the previous setting. The project measures Δt every frame, so its speed is right either way.")}
      </p>

      <H2>{tx(t, "sdl05_geomTitle", "Your own triangles")}</H2>
      <p>
        {tx(t, "sdl05_geomBody",
          "SDL_RenderGeometry draws triangles from a list of vertices, each with a position, a colour and a texture coordinate. Colours are interpolated across the triangle. It is the way out when rectangles are not enough: rotated or skewed quads, trails, simple particles, a health ring.")}
      </p>
      <CodeBlock lang="cpp" filename="geometry.cpp" t={t}>{`// position (x, y), colour (r, g, b, a as floats 0..1), texture coordinate (u, v)
const SDL_Vertex verts[3] = {
    { {320.0f,  40.0f}, {1.0f, 0.0f, 0.0f, 1.0f}, {0.5f, 0.0f} },
    { {560.0f, 320.0f}, {0.0f, 1.0f, 0.0f, 1.0f}, {1.0f, 1.0f} },
    { { 80.0f, 320.0f}, {0.0f, 0.0f, 1.0f, 1.0f}, {0.0f, 1.0f} },
};
SDL_RenderGeometry(renderer, nullptr, verts, 3, nullptr, 0);
// nullptr texture: plain colours; pass a texture to sample it at (u, v)
// the last two arguments: an index array and its length, to share vertices`}</CodeBlock>
      <Callout type="warn" t={t}>
        {tx(t, "sdl05_limitWarn",
          "SDL_Renderer has no shaders of your own, no 3D and no compute. Lighting, post-processing or any per-pixel effect is where you move to SDL_GPU (later in this track) or to OpenGL. The renderer is deliberately a sprite and shape pipeline, and for many 2D games that is all they need.")}
      </Callout>

      <H2>{tx(t, "sdl05_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl05_mh0", "Symptom"), tx(t, "sdl05_mh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl05_e1", "A colour with alpha draws fully opaque"), tx(t, "sdl05_e1b", "the blend mode is still NONE. Set SDL_BLENDMODE_BLEND before the draw.")],
          [tx(t, "sdl05_e2", "A shape has the colour of the previous one"), tx(t, "sdl05_e2b", "SDL_SetRenderDrawColor forgotten: the colour is renderer state.")],
          [tx(t, "sdl05_e3", "Black screen, nothing drawn"), tx(t, "sdl05_e3b", "SDL_RenderPresent missing, or the clear comes after the drawing.")],
          [tx(t, "sdl05_e4", "Clicks land in the wrong place after resizing"), tx(t, "sdl05_e4b", "window coordinates used as game coordinates. Call SDL_ConvertEventToRenderCoordinates.")],
          [tx(t, "sdl05_e5", "The game is tiny in a big window"), tx(t, "sdl05_e5b", "no logical presentation, or DISABLED: coordinates are window pixels.")],
          [tx(t, "sdl05_e6", "Pixel art has uneven pixels, some 2 wide and some 3"), tx(t, "sdl05_e6b", "LETTERBOX at a fractional scale. Use INTEGER_SCALE.")],
          [tx(t, "sdl05_e7", "The square leaves the field after the resolution change"), tx(t, "sdl05_e7b", "the limits still use 1280 and 720. Use GAME_W and GAME_H.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl05" items={[
        "A frame is clear, draw in order, present. The draw colour and the blend mode are renderer state used by every following call.",
        "SDL_SetRenderLogicalPresentation gives the game its own resolution; every drawing call then uses game coordinates.",
        "Letterbox scale s = min(W/640, H/360); INTEGER_SCALE uses ⌊s⌋, at least 1. The rest of the window shows the clear colour.",
        "The project draws at 640 × 360 with INTEGER_SCALE: 2× on 1280 × 720, 3× on 1920 × 1080.",
        "Mouse events are in window coordinates; SDL_ConvertEventToRenderCoordinates turns them into game coordinates.",
        "The default blend mode NONE ignores alpha; BLEND mixes c_s·α + c_d·(1 − α); ADD brightens, MOD and MUL multiply.",
        "SDL_RenderGeometry draws your own coloured or textured triangles; shaders need SDL_GPU or OpenGL.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "textures", title: tx(t, "sdl05_rel1", "Textures & Images"), why: tx(t, "sdl05_rel1b", "the next step: the square becomes an animated sprite, kept sharp by the integer scale.") },
        { track: "OpenGL", id: "blending", title: tx(t, "sdl05_rel2", "OpenGL: Blending & Transparency"), why: tx(t, "sdl05_rel2b", "the blend equation in general, with every factor and the drawing order of transparent objects.") },
      ]} />
    </Article>
  );
}

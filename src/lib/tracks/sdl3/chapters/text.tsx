"use client";

// SDL3 track — "Text with SDL3_ttf": why text needs a library; SDL3_ttf 3.2.2
// added to the build with FetchContent (vendored FreeType and HarfBuzz); the
// project's pixel font Micro 5 (public/sdl3, OFL) and its 150-unit grid; points,
// pixels and font units (formula); glyph metrics with the GlyphMetrics figure
// and SDL_ttf's ceil formulas, worked at 22 pt; measuring and aligning; the
// surface path and its render modes; the text engine, with the TextEngine
// figure; the project: a gem to collect, a score and a frame counter (complete
// main.cpp); smooth fonts and logical presentation; common mistakes.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { GlyphMetricsFigure } from "@/components/lesson/figures/sdl3/GlyphMetricsFigure";
import { TextEngineFigure } from "@/components/lesson/figures/sdl3/TextEngineFigure";

const r = String.raw;

export function TextContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl07_intro",
          "SDL can draw a rectangle, a line or a picture, but not the letter A. A letter in a font file is a shape described by curves and lines, and turning it into pixels takes a rasterizer. SDL3_ttf adds one. In this chapter the character gets something to do: a gem to collect, a score in the corner that counts the gems, and a frame counter. On the way you learn how a font is measured, why pixel fonts only look sharp at certain sizes, and how to draw text that changes without rebuilding it every frame.")}
      </Lead>

      <Goals t={t} id="sdl07" items={[
        "Add SDL3_ttf to the CMake build and open a font.",
        "Explain points, pixels and font units, and pick a size at which a pixel font stays sharp.",
        "Read a font's metrics: ascent, descent, line skip, advance, and measure a string.",
        "Draw text that changes with a TTF_Text from the renderer text engine.",
        "Show a score and a frame counter that update only when their value changes.",
      ]} />

      <H2>{tx(t, "sdl07_whyTitle", "Why text needs a library")}</H2>
      <p>
        {tx(t, "sdl07_whyBody",
          "SDL has one built-in way to write: SDL_RenderDebugText, from the renderer chapter, with a fixed 8 × 8 font of ASCII characters. It is for debugging. Real text needs three jobs done. A font file must be read, each character's outline must be turned into pixels at the size you want (rasterizing), and the characters must be placed after each other, with the right spacing, ligatures and right-to-left order where a language needs them (shaping). The libraries FreeType and HarfBuzz do those jobs, and SDL3_ttf wraps them in a few SDL-style functions.")}
      </p>

      <H2>{tx(t, "sdl07_buildTitle", "Adding SDL3_ttf to the build")}</H2>
      <p>
        {tx(t, "sdl07_buildBody",
          "SDL3_ttf comes in the same way as SDL: FetchContent, pinned to a release tag. Its latest release is 3.2.2; it needs SDL 3.2.6 or newer, so the project's 3.4.18 is fine. The complete CMakeLists.txt, with the new lines marked:")}
      </p>
      <CodeBlock lang="cmake" filename="CMakeLists.txt" t={t}>{`cmake_minimum_required(VERSION 3.24)
project(SDL3Lab LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(SDL3
    GIT_REPOSITORY https://github.com/libsdl-org/SDL.git
    GIT_TAG        release-3.4.18
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(SDL3)

# new: SDL3_ttf, with its own copies of FreeType and HarfBuzz
set(SDLTTF_VENDORED ON)        # build them from source instead of looking for installed ones
set(SDLTTF_PLUTOSVG OFF)       # no colour emoji: one dependency fewer
FetchContent_Declare(SDL3_ttf
    GIT_REPOSITORY https://github.com/libsdl-org/SDL_ttf.git
    GIT_TAG        release-3.2.2
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(SDL3_ttf)

add_executable(game src/main.cpp)
target_link_libraries(game PRIVATE SDL3_ttf::SDL3_ttf SDL3::SDL3)   # new: SDL3_ttf

if (WIN32)
    add_custom_command(TARGET game POST_BUILD
        COMMAND \${CMAKE_COMMAND} -E copy_if_different
                $<TARGET_FILE:SDL3::SDL3> $<TARGET_FILE:SDL3_ttf::SDL3_ttf>   # new: SDL3_ttf.dll
                $<TARGET_FILE_DIR:game>)
endif()

add_custom_command(TARGET game POST_BUILD
    COMMAND \${CMAKE_COMMAND} -E copy_directory
            \${CMAKE_SOURCE_DIR}/assets $<TARGET_FILE_DIR:game>/assets)`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl07_ch0", "Line"), tx(t, "sdl07_ch1", "What it does")]}
        rows={[
          ["set(SDLTTF_VENDORED ON)", tx(t, "sdl07_c1", "SDL3_ttf keeps FreeType and HarfBuzz as Git submodules. ON builds those copies, so nothing has to be installed. Without it, builds look for installed packages and stop if they are missing; only Visual Studio and Android builds turn it on by themselves.")],
          ["set(SDLTTF_PLUTOSVG OFF)", tx(t, "sdl07_c2", "plutosvg draws colour emoji from SVG fonts. The project does not need it, and the build gets shorter.")],
          ["FetchContent_Declare(SDL3_ttf …)", tx(t, "sdl07_c3", "Like SDL's: the official repository at a release tag. FetchContent also downloads the submodules. The first configure takes a few minutes longer, once.")],
          ["SDL3_ttf::SDL3_ttf", tx(t, "sdl07_c4", "The library and its include folder, so #include <SDL3_ttf/SDL_ttf.h> is found. SDL3_ttf finds the SDL3::SDL3 target that is already in the build and uses it.")],
          ["$<TARGET_FILE:SDL3_ttf::SDL3_ttf>", tx(t, "sdl07_c5", "On Windows, SDL3_ttf.dll must sit next to game.exe like SDL3.dll. FreeType and HarfBuzz are built into it, so there is no third DLL.")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "sdl07_pkgNote",
          "With SDL3_ttf installed by a package manager (vcpkg sdl3-ttf, Homebrew sdl3_ttf, a distro's libsdl3-ttf-dev), replace its FetchContent lines with find_package(SDL3_ttf REQUIRED CONFIG). The target name stays SDL3_ttf::SDL3_ttf.")}
      </Callout>

      <H2>{tx(t, "sdl07_fontTitle", "The project's font")}</H2>
      <p>
        <a href="/sdl3/Micro5-Regular.ttf" download="Micro5-Regular.ttf" className="text-[var(--primary)] underline">
          {tx(t, "sdl07_download", "Download Micro5-Regular.ttf")}
        </a>{" "}
        {tx(t, "sdl07_downloadBody", "and its licence,")}{" "}
        <a href="/sdl3/OFL-Micro5.txt" download="OFL-Micro5.txt" className="text-[var(--primary)] underline">OFL-Micro5.txt</a>
        {tx(t, "sdl07_downloadBody2",
          ", into assets/ next to hero.png. Micro 5, from the Soft Type project, is a pixel font under the SIL Open Font License: you may ship it with a game, free or paid, as long as the licence file goes with it.")}
      </p>
      <p>
        {tx(t, "sdl07_pixelFont",
          "It is a pixel font: every letter is drawn on a grid of square pixels, like the character's sprite. That matches a 640 × 360 game drawn with integer scaling. A smooth font like the ones on this page would come out blurry when the game is scaled up; the end of the chapter shows how games handle that.")}
      </p>

      <H2>{tx(t, "sdl07_unitsTitle", "Points, pixels and font units")}</H2>
      <p>
        {tx(t, "sdl07_unitsBody",
          "TTF_OpenFont(path, size) takes a size in points. SDL3_ttf assumes 72 dots per inch unless told otherwise, and a point is 1/72 inch, so the size is simply the height of one em in pixels. The em is the font's design square. Inside the file every coordinate is in font units, and the font's head table says how many units make one em (unitsPerEm). A coordinate becomes pixels by:")}
      </p>
      <Equation label={tx(t, "sdl07_eqUnits", "Font units to pixels")}
        where={[
          [r`p`, tx(t, "sdl07_wP", "the distance in pixels")],
          [r`u`, tx(t, "sdl07_wU", "the same distance in font units, as stored in the file")],
          [r`\text{size}`, tx(t, "sdl07_wSize", "the size passed to TTF_OpenFont, in points: pixels per em at 72 DPI")],
          [r`U`, tx(t, "sdl07_wUpem", "unitsPerEm: 1650 for Micro 5 (often 1000 or 2048 in other fonts)")],
        ]}>
        {r`p = u \cdot \frac{\text{size}}{U}`}
      </Equation>
      <p>
        {tx(t, "sdl07_gridBody",
          "Micro 5 is drawn on a grid of 150 units: every corner of every letter sits on a multiple of 150. One font pixel is therefore 150 × size / 1650 = size / 11 screen pixels. At size 11 a font pixel is exactly 1 pixel, at 22 exactly 2, at 33 exactly 3. At 16 it is 1.45 pixels, and edges fall inside pixels: the text turns grey at its edges or ragged. The project uses 22: each font pixel is 2 × 2 game pixels, and with the 2× window scale 4 × 4 screen pixels.")}
      </p>

      <H2>{tx(t, "sdl07_metricsTitle", "Glyph metrics")}</H2>
      <p>
        {tx(t, "sdl07_metricsBody",
          "Every character of a font is a glyph. Text sits on a baseline, the line the letters stand on. Some parts go above it, some (the tails of g, p, y) below. A font describes this with a few numbers, and SDL3_ttf reports them in pixels at the size you opened:")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl07_mh0", "Metric"), tx(t, "sdl07_mh1", "Function"), tx(t, "sdl07_mh2", "Meaning")]}
        rows={[
          [tx(t, "sdl07_m1", "ascent"), "TTF_GetFontAscent", tx(t, "sdl07_m1b", "from the top of the line down to the baseline, positive")],
          [tx(t, "sdl07_m2", "descent"), "TTF_GetFontDescent", tx(t, "sdl07_m2b", "from the baseline down to the lowest point, negative")],
          [tx(t, "sdl07_m3", "height"), "TTF_GetFontHeight", tx(t, "sdl07_m3b", "ascent − descent: the height of one line of text")],
          [tx(t, "sdl07_m4", "line skip"), "TTF_GetFontLineSkip", tx(t, "sdl07_m4b", "the distance from one line's top to the next one's: height plus the font's extra line gap")],
          [tx(t, "sdl07_m5", "advance"), "TTF_GetGlyphMetrics", tx(t, "sdl07_m5b", "how far the pen moves after this glyph; often more than its ink, which leaves a gap before the next one")],
          [tx(t, "sdl07_m6", "ink box"), "TTF_GetGlyphMetrics", tx(t, "sdl07_m6b", "minx, maxx, miny, maxy: where the glyph's pixels are, from the pen position and the baseline")],
        ]}
      />
      <p>
        {tx(t, "sdl07_ceilBody",
          "The file stores these in font units. Micro 5 has an ascender of 1190 units and a descender of −460. SDL3_ttf converts them with the formula above and rounds up, so a glyph is never cut off:")}
      </p>
      <Equation label={tx(t, "sdl07_eqMetrics", "Metrics at 22 points")}
        where={[
          [r`\lceil\cdot\rceil`, tx(t, "sdl07_wCeil", "rounding up to a whole number of pixels (−6.13 rounds up to −6)")],
          [r`1190,\ -460`, tx(t, "sdl07_wAscDesc", "Micro 5's ascender and descender, in font units (its hhea table)")],
          [r`22 / 1650`, tx(t, "sdl07_wScale", "size / unitsPerEm: pixels per font unit at 22 points")],
        ]}>
        {r`\text{ascent} = \left\lceil 1190 \cdot \tfrac{22}{1650} \right\rceil = \lceil 15.87 \rceil = 16, \qquad \text{descent} = \left\lceil -460 \cdot \tfrac{22}{1650} \right\rceil = \lceil -6.13 \rceil = -6`}
      </Equation>
      <p>
        {tx(t, "sdl07_ceilBody2",
          "The height is ⌈1650 × 22 / 1650⌉ = 22 and, since Micro 5 has no extra line gap, the line skip is 22 as well. Try other strings and sizes in the figure; the numbers are computed from the real font file, as SDL3_ttf computes them.")}
      </p>

      <GlyphMetricsFigure t={t} />

      <p>
        {tx(t, "sdl07_sizeBody",
          "TTF_GetStringSize(font, text, 0, &w, &h) measures a whole string without drawing it. The width is the advances added up (the ink of the last glyph can stick out a little further), the height is the font's height. \"Score 12\" at 22 points is 8 + 8 + 8 + 6 + 8 + 6 + 6 + 8 = 58 pixels wide and 22 tall. That is how text is aligned: to put it against the right edge with an 8-pixel margin, draw it at x = 640 − 8 − w.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "sdl07_digitsTip",
          "In Micro 5 the digit 1 is 6 pixels wide and the other digits 8. A right-aligned number therefore shifts by 2 pixels when a 1 appears, and a left-aligned one changes length. Measure again whenever the string changes, as the project does; for numbers that change every frame, a monospaced font (every glyph the same advance) keeps them still.")}
      </Callout>

      <H2>{tx(t, "sdl07_surfaceTitle", "The first way: render to a surface")}</H2>
      <p>
        {tx(t, "sdl07_surfaceBody",
          "The oldest way, the same as in SDL2's SDL_ttf: render the string into a new surface, upload it as a texture, draw the texture. The length argument is new in SDL3_ttf: the number of bytes of UTF-8 text, or 0 for a string that ends with a zero byte.")}
      </p>
      <CodeBlock lang="cpp" filename="text_surface.cpp" t={t}>{`const SDL_Color white{255, 255, 255, 255};
SDL_Surface* surface = TTF_RenderText_Blended(font, "Game over", 0, white);   // 0: zero-terminated
SDL_Texture* label   = SDL_CreateTextureFromSurface(renderer, surface);
const SDL_FRect dst{100.0f, 80.0f, float(surface->w), float(surface->h)};
SDL_DestroySurface(surface);

// every frame, until the text changes:
SDL_RenderTexture(renderer, label, nullptr, &dst);`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl07_rh0", "Function"), tx(t, "sdl07_rh1", "Pixels"), tx(t, "sdl07_rh2", "Use for")]}
        rows={[
          ["TTF_RenderText_Solid", tx(t, "sdl07_r1", "on or off: a pixel is coloured if the outline covers at least half of it"), tx(t, "sdl07_r1b", "pixel fonts at their grid sizes; retro looks")],
          ["TTF_RenderText_Shaded", tx(t, "sdl07_r2", "smooth edges, mixed with a background colour you pass: the box is opaque"), tx(t, "sdl07_r2b", "text on a plain panel of that same colour")],
          ["TTF_RenderText_Blended", tx(t, "sdl07_r3", "smooth edges as alpha: the coverage of each pixel becomes its transparency"), tx(t, "sdl07_r3b", "almost everything: it blends over any background")],
          ["TTF_RenderText_LCD", tx(t, "sdl07_r4", "smooth edges per colour channel, for the red, green and blue stripes of a pixel"), tx(t, "sdl07_r4b", "small text on desktop monitors, on an opaque background")],
          ["…_Wrapped", tx(t, "sdl07_r5", "the same, broken into lines at a width in pixels"), tx(t, "sdl07_r5b", "paragraphs, dialogue boxes")],
        ]}
      />
      <p>
        {tx(t, "sdl07_modesFig",
          "The Solid and Blended views of the figure above show the difference. At 22 points a pixel of Micro 5 is either fully covered or not at all, so both give the same result; at 16 they do not.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "sdl07_perfWarn",
          "Never rebuild a surface text every frame. Rasterizing the string, creating a texture and uploading it costs far more than drawing it, and the texture would be created and destroyed 60 times a second. Keep the texture and rebuild it only when the string changes, or use the text engine below, which does that bookkeeping for you.")}
      </Callout>

      <H2>{tx(t, "sdl07_engineTitle", "The second way: the text engine")}</H2>
      <p>
        {tx(t, "sdl07_engineBody",
          "SDL3_ttf adds text objects. TTF_CreateRendererTextEngine(renderer) creates an engine that draws with your renderer. TTF_CreateText(engine, font, string, 0) creates a TTF_Text: a string laid out with a font. TTF_SetTextString changes its string, and TTF_DrawRendererText(text, x, y) draws it with its top-left corner at (x, y).")}
      </p>
      <p>
        {tx(t, "sdl07_engineBody2",
          "Behind this, the engine rasterizes each glyph once and keeps it in an atlas: one texture that holds many small images. A text is drawn as one small rectangle (a quad) per glyph, each pointing at its glyph in the atlas. A new string that uses glyphs already in the atlas costs no rasterizing and no upload at all:")}
      </p>

      <TextEngineFigure t={t} />

      <p>
        {tx(t, "sdl07_engineNumbers",
          "In numbers: \"Score 12\" is 58 × 22 pixels at 4 bytes each, 5104 bytes. The surface path uploads that much on every change, and about 300 KB per second if it is rebuilt every frame at 60 frames per second. The engine uploads the fifteen glyphs of \"Score 0123456789\" once, a few kilobytes, and nothing afterwards. Its atlas textures already use the NEAREST scale mode, so pixel fonts stay sharp.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "sdl07_enginesNote",
          "There are three engines. The renderer engine is for SDL_Renderer. The surface engine (TTF_CreateSurfaceTextEngine, TTF_DrawSurfaceText) draws into an SDL_Surface. The GPU engine (TTF_CreateGPUTextEngine) gives you the atlas textures and the vertices of each quad, to draw yourself with SDL_GPU, the subject of a later chapter.")}
      </Callout>

      <H2>{tx(t, "sdl07_projectTitle", "The project: a gem, a score, a frame counter")}</H2>
      <p>
        {tx(t, "sdl07_projectBody",
          "The project starts as the Textures chapter left it: the animated character walks in a 640 × 360 game. Five changes. One: a helper that builds an asset path, which loadTexture and the font now share. Two: SDL_AppInit starts SDL3_ttf, opens the font at 22 points and creates two texts, the score and the frame counter. Three: a gem, drawn as a diamond with SDL_RenderGeometry, appears at a random place; walking into it adds a point and moves it. Four: every half second the frame counter is updated. Five: SDL_AppQuit frees the text objects, the engine and the font before the renderer.")}
      </p>
      <p>
        {tx(t, "sdl07_fpsBody",
          "The frame rate is counted over half a second, not measured from one frame, because a single frame's time jitters and the number would flicker unreadably:")}
      </p>
      <Equation label={tx(t, "sdl07_eqFps", "Frames per second")}
        where={[
          [r`n`, tx(t, "sdl07_wN", "frames drawn since the last update of the counter")],
          [r`T`, tx(t, "sdl07_wT", "seconds since the last update: the Δt of those frames added up, at least 0.5")],
        ]}>
        {r`\text{fps} = \frac{n}{T}`}
      </Equation>
      <p>
        {tx(t, "sdl07_fpsExample",
          "On a 60 Hz screen with VSync, the counter is updated after 30 frames, when T has reached 0.5 s: 30 / 0.5 = 60. The text changes twice a second at most, so even the surface path would be cheap here; the text engine makes it free.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <SDL3_ttf/SDL_ttf.h>                // new
#include <string>

constexpr int   GAME_W   = 640;
constexpr int   GAME_H   = 360;
constexpr float SPEED    = 120.0f;
constexpr float FRAME    = 32.0f;
constexpr float ANIM_FPS = 8.0f;
constexpr float GEM      = 12.0f;            // new: the gem's width and height
constexpr float FONT_PT  = 22.0f;            // new: 2 game pixels per font pixel

struct AppState {
    SDL_Window*     window     = nullptr;
    SDL_Renderer*   renderer   = nullptr;
    SDL_Texture*    hero       = nullptr;
    TTF_Font*       font       = nullptr;    // new
    TTF_TextEngine* engine     = nullptr;    // new
    TTF_Text*       scoreText  = nullptr;    // new
    TTF_Text*       fpsText    = nullptr;    // new
    Uint64          lastTick   = 0;
    float           x = 304.0f, y = 164.0f;
    float           animTime   = 0.0f;
    bool            facingLeft = false;
    float           gemX = 0.0f, gemY = 0.0f;   // new
    int             score      = 0;             // new
    int             frames     = 0;             // new: frames since the counter was updated
    float           fpsTime    = 0.0f;          // new: seconds since then
};

// new: the full path of a file in the assets folder next to the executable
static std::string assetPath(const char* file) {
    const char* base = SDL_GetBasePath();
    return std::string(base ? base : "") + file;
}

static SDL_Texture* loadTexture(SDL_Renderer* renderer, const char* file) {
    const std::string path = assetPath(file);   // changed: uses the helper
    SDL_Surface* surface = SDL_LoadPNG(path.c_str());
    if (!surface) {
        SDL_Log("SDL_LoadPNG(%s) failed: %s", path.c_str(), SDL_GetError());
        return nullptr;
    }
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);
    SDL_DestroySurface(surface);
    if (!texture) SDL_Log("SDL_CreateTextureFromSurface failed: %s", SDL_GetError());
    return texture;
}

// new: a random spot for the gem, below the text and away from the edges
static void placeGem(AppState* app) {
    app->gemX = 16.0f + SDL_randf() * (GAME_W - 32.0f - GEM);
    app->gemY = 40.0f + SDL_randf() * (GAME_H - 56.0f - GEM);
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    SDL_SetAppMetadata("SDL3 Lab", "0.1", "com.example.sdl3lab");
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    if (!TTF_Init()) {                                       // new
        SDL_Log("TTF_Init failed: %s", SDL_GetError());
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
    SDL_SetRenderLogicalPresentation(app->renderer, GAME_W, GAME_H,
                                     SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);

    app->hero = loadTexture(app->renderer, "assets/hero.png");
    if (!app->hero) return SDL_APP_FAILURE;
    SDL_SetTextureScaleMode(app->hero, SDL_SCALEMODE_NEAREST);

    // new: the font and two text objects
    app->font = TTF_OpenFont(assetPath("assets/Micro5-Regular.ttf").c_str(), FONT_PT);
    if (!app->font) {
        SDL_Log("TTF_OpenFont failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    app->engine    = TTF_CreateRendererTextEngine(app->renderer);
    app->scoreText = TTF_CreateText(app->engine, app->font, "Score 0", 0);
    app->fpsText   = TTF_CreateText(app->engine, app->font, "", 0);
    if (!app->engine || !app->scoreText || !app->fpsText) {
        SDL_Log("SDL3_ttf text setup failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    TTF_SetTextColor(app->scoreText, 250, 204, 21, 255);     // gold
    TTF_SetTextColor(app->fpsText, 148, 163, 184, 255);      // grey

    placeGem(app);                                           // new
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
    if (dx != 0.0f && dy != 0.0f) { dx *= 0.7071f; dy *= 0.7071f; }

    app->x = SDL_clamp(app->x + dx * SPEED * dt, 0.0f, GAME_W - FRAME);
    app->y = SDL_clamp(app->y + dy * SPEED * dt, 0.0f, GAME_H - FRAME);

    // Animation
    const bool moving = dx != 0.0f || dy != 0.0f;
    if (dx < 0.0f) app->facingLeft = true;
    if (dx > 0.0f) app->facingLeft = false;
    app->animTime += dt;
    const int row   = moving ? 1 : 0;
    const int frame = int(app->animTime * ANIM_FPS) % 4;

    // new: walking into the gem scores a point
    const SDL_FRect body{app->x + 7.0f, app->y + 8.0f, 18.0f, 21.0f};   // the drawn pixels of the frame
    const SDL_FRect gem{app->gemX, app->gemY, GEM, GEM};
    if (SDL_HasRectIntersectionFloat(&body, &gem)) {
        ++app->score;
        placeGem(app);
        char buf[32];
        SDL_snprintf(buf, sizeof buf, "Score %d", app->score);
        TTF_SetTextString(app->scoreText, buf, 0);           // only when the score changes
    }

    // new: frames per second, counted over half a second
    ++app->frames;
    app->fpsTime += dt;
    if (app->fpsTime >= 0.5f) {
        char buf[32];
        SDL_snprintf(buf, sizeof buf, "%d fps", int(app->frames / app->fpsTime + 0.5f));
        TTF_SetTextString(app->fpsText, buf, 0);
        app->frames  = 0;
        app->fpsTime = 0.0f;
    }

    // Draw
    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

    // new: the gem, a diamond of two triangles
    const float cx = app->gemX + GEM / 2, cy = app->gemY + GEM / 2, h = GEM / 2;
    const SDL_FColor light{0.13f, 0.83f, 0.93f, 1.0f}, dark{0.03f, 0.45f, 0.65f, 1.0f};
    const SDL_Vertex v[4] = {
        {{cx, cy - h}, light, {0, 0}}, {{cx + h, cy}, dark, {0, 0}},
        {{cx, cy + h}, dark,  {0, 0}}, {{cx - h, cy}, light, {0, 0}},
    };
    const int idx[6] = {0, 1, 2, 0, 2, 3};
    SDL_RenderGeometry(app->renderer, nullptr, v, 4, idx, 6);

    const SDL_FRect src{frame * FRAME, row * FRAME, FRAME, FRAME};
    const SDL_FRect dst{SDL_roundf(app->x), SDL_roundf(app->y), FRAME, FRAME};
    SDL_RenderTextureRotated(app->renderer, app->hero, &src, &dst, 0.0, nullptr,
                             app->facingLeft ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);

    // new: the text, last, so it is drawn over everything
    TTF_DrawRendererText(app->scoreText, 8.0f, 4.0f);
    int w = 0, hText = 0;
    TTF_GetTextSize(app->fpsText, &w, &hText);
    TTF_DrawRendererText(app->fpsText, float(GAME_W - 8 - w), 4.0f);   // right-aligned

    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        TTF_DestroyText(app->scoreText);                     // new: texts, engine, font
        TTF_DestroyText(app->fpsText);
        TTF_DestroyRendererTextEngine(app->engine);          //      before the renderer
        TTF_CloseFont(app->font);
        SDL_DestroyTexture(app->hero);
        SDL_DestroyRenderer(app->renderer);
        SDL_DestroyWindow(app->window);
        delete app;
    }
    TTF_Quit();                                              // new
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl07_lh0", "Code"), tx(t, "sdl07_lh1", "What it does")]}
        rows={[
          ["TTF_Init()", tx(t, "sdl07_l1", "Starts FreeType. Like SDL_Init it returns false on failure, and SDL_GetError says why.")],
          ["TTF_OpenFont(…, FONT_PT)", tx(t, "sdl07_l2", "Reads the font file at 22 points. The path comes from assetPath, so it works from any current directory. A typo in the name gives \"Couldn't open …\" with the full path.")],
          ["TTF_CreateRendererTextEngine", tx(t, "sdl07_l3", "One engine for the whole program, tied to the renderer; it owns the atlas textures.")],
          ["TTF_CreateText(…, \"Score 0\", 0)", tx(t, "sdl07_l4", "A text object with its first string. The 0 means the string ends with a zero byte.")],
          ["TTF_SetTextColor", tx(t, "sdl07_l5", "The colour belongs to the text object, not to the renderer's draw colour.")],
          ["SDL_randf()", tx(t, "sdl07_l6", "A random float from 0 up to (not including) 1. placeGem stretches it to the free part of the field: x from 16 to 612, y from 40 to 332.")],
          ["body{x + 7, y + 8, 18, 21}", tx(t, "sdl07_l7", "The pixels the character really covers inside its 32 × 32 frame (columns 7 to 24, rows 8 to 28). The empty corners of the frame should not collect gems.")],
          ["SDL_HasRectIntersectionFloat", tx(t, "sdl07_l8", "True when the two rectangles overlap.")],
          ["SDL_snprintf + TTF_SetTextString", tx(t, "sdl07_l9", "Builds the new string, at most 31 characters, and gives it to the text. This runs only when the value changes.")],
          ["int(frames / fpsTime + 0.5f)", tx(t, "sdl07_l10", "The formula above, rounded to the nearest whole number.")],
          ["SDL_RenderGeometry(…, idx, 6)", tx(t, "sdl07_l11", "Four corners, two triangles (0, 1, 2) and (0, 2, 3) that share two corners through the index array. Colours are interpolated: light at the top and left, dark at the bottom and right.")],
          ["TTF_DrawRendererText(…, 8, 4)", tx(t, "sdl07_l12", "The text's top-left corner, in game coordinates. The logical presentation scales it like everything else.")],
          ["GAME_W - 8 - w", tx(t, "sdl07_l13", "Right alignment: the measured width, taken each frame so the counter stays against the edge when its width changes.")],
          ["TTF_Quit()", tx(t, "sdl07_l14", "After everything from SDL3_ttf is freed, outside the if, so it also runs when SDL_AppInit failed early.")],
        ]}
      />
      <p>
        {tx(t, "sdl07_runBody",
          "Copy Micro5-Regular.ttf into assets/, build and run. A cyan gem waits somewhere on the field. Walk into it: the score in the top-left corner goes up, and the gem jumps to a new place. The top-right corner shows the frame rate, 60 fps on a 60 Hz screen. The letters have the same chunky pixels as the character, and they stay sharp at any window size.")}
      </p>

      <H2>{tx(t, "sdl07_smoothTitle", "Smooth fonts and the logical resolution")}</H2>
      <p>
        {tx(t, "sdl07_smoothBody",
          "A pixel font scaled 2× with NEAREST stays crisp. A smooth font does not: drawn at 640 × 360 and scaled up, its soft edges become blurry blocks. Games with smooth fonts draw the text at the window's real resolution instead. Logical presentation can be switched off in the middle of a frame, and the font opened at the size multiplied by the scale:")}
      </p>
      <CodeBlock lang="cpp" filename="smooth_text.cpp" t={t}>{`// the game in 640 × 360, as before ...
SDL_SetRenderLogicalPresentation(renderer, 0, 0, SDL_LOGICAL_PRESENTATION_DISABLED);
TTF_DrawRendererText(dialogue, 40.0f * scale, 500.0f * scale);   // window pixels
SDL_SetRenderLogicalPresentation(renderer, GAME_W, GAME_H, SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);

// scale: the presentation's scale (2 at 1280 × 720); when it changes, resize the font:
TTF_SetFontSize(smoothFont, 16.0f * scale);`}</CodeBlock>

      <H2>{tx(t, "sdl07_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl07_eh0", "Symptom"), tx(t, "sdl07_eh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl07_e1", "SDL3_ttf/SDL_ttf.h: No such file or directory"), tx(t, "sdl07_e1b", "game is not linked with SDL3_ttf::SDL3_ttf.")],
          [tx(t, "sdl07_e2", "Configure fails: Could NOT find Freetype"), tx(t, "sdl07_e2b", "SDLTTF_VENDORED is off and no FreeType is installed. Set it ON before FetchContent_MakeAvailable(SDL3_ttf).")],
          [tx(t, "sdl07_e3", "Windows: SDL3_ttf.dll was not found"), tx(t, "sdl07_e3b", "the DLL is not copied next to game.exe. Add $<TARGET_FILE:SDL3_ttf::SDL3_ttf> to the copy command.")],
          [tx(t, "sdl07_e4", "TTF_OpenFont: Couldn't open …"), tx(t, "sdl07_e4b", "the font is not in assets/, or the path is relative. Build it with assetPath and check that the POST_BUILD copy ran.")],
          [tx(t, "sdl07_e5", "A pixel font is blurry or uneven"), tx(t, "sdl07_e5b", "a size off the font's grid (16 for Micro 5), or a texture with LINEAR scaling. Use a multiple of the font's pixel size.")],
          [tx(t, "sdl07_e6", "Text is slow, or memory grows every frame"), tx(t, "sdl07_e6b", "a surface and texture created every frame (and maybe never destroyed). Use a TTF_Text, or rebuild only on change.")],
          [tx(t, "sdl07_e7", "Crash on exit inside SDL3_ttf"), tx(t, "sdl07_e7b", "the renderer was destroyed before the engine or the texts. Free texts, then the engine, then the font, then the renderer.")],
          [tx(t, "sdl07_e8", "Accented letters show as boxes or ?"), tx(t, "sdl07_e8b", "the font has no glyph for them, or the string is not UTF-8. Check with TTF_FontHasGlyph, and save source files as UTF-8.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl07" items={[
        "SDL3_ttf wraps FreeType (rasterizing) and HarfBuzz (shaping); with SDLTTF_VENDORED ON, FetchContent builds them from source.",
        "At the default 72 DPI the size in points is the em in pixels; a font unit is size / unitsPerEm pixels.",
        "A pixel font is sharp only when its grid lands on whole pixels: for Micro 5, sizes that are multiples of 11.",
        "Ascent, descent, height and line skip come from the font's tables, rounded up: 16, −6, 22 and 22 for Micro 5 at 22 points.",
        "TTF_GetStringSize adds up the advances; measure a string to align it, and again when it changes.",
        "Surface text (TTF_RenderText_*) is rasterized and uploaded as a whole; never rebuild it every frame.",
        "The text engine rasterizes each glyph once into an atlas and draws a TTF_Text as one quad per glyph; changing its string is cheap.",
        "Free texts, the engine and fonts before the renderer, then call TTF_Quit.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "textures", title: tx(t, "sdl07_rel1", "Textures & Images"), why: tx(t, "sdl07_rel1b", "surfaces, textures and scale modes, which every way of drawing text is built on.") },
        { track: "SDL3", id: "audio", title: tx(t, "sdl07_rel2", "Audio Streams"), why: tx(t, "sdl07_rel2b", "the next step: a sound when the gem is collected.") },
      ]} />
    </Article>
  );
}

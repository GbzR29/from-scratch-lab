// SDL3 track — the project's complete files at the end of "Time, Files & Shipping"
// (chapters/platform.tsx). Kept apart so the chapter stays readable; new lines
// are marked "new" in the code itself.

// ── src/main.cpp ──────────────────────────────────────────────────────────────

export const MAIN_CPP = `#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <SDL3_ttf/SDL_ttf.h>
#include <string>

constexpr int   GAME_W     = 640;
constexpr int   GAME_H     = 360;
constexpr float SPEED      = 120.0f;
constexpr float FRAME      = 32.0f;
constexpr float ANIM_FPS   = 8.0f;
constexpr float GEM        = 12.0f;
constexpr float FONT_PT    = 22.0f;
constexpr int   MUSIC_RATE = 48000;
constexpr int   MUSIC_NOTE = MUSIC_RATE / 2;

struct Music { int frame = 0; };

struct AppState {
    SDL_Window*       window      = nullptr;
    SDL_Renderer*     renderer    = nullptr;
    SDL_Texture*      hero        = nullptr;
    TTF_Font*         font        = nullptr;
    TTF_TextEngine*   engine      = nullptr;
    TTF_Text*         scoreText   = nullptr;
    TTF_Text*         fpsText     = nullptr;
    TTF_Text*         bestText    = nullptr;     // new
    SDL_AudioDeviceID audioDevice = 0;
    SDL_AudioStream*  sfx         = nullptr;
    SDL_AudioStream*  music       = nullptr;
    Uint8*            pickupData  = nullptr;
    Uint32            pickupLen   = 0;
    Music             tune;
    bool              sound       = false;
    std::string       savePath;                  // new: empty when there is nowhere to save
    int               best        = 0;           // new: the record, from best.txt
    SDL_DateTime      bestDate{};                // new: when it was set
    Uint64            lastTick    = 0;
    float             x = 304.0f, y = 164.0f;
    float             animTime    = 0.0f;
    bool              facingLeft  = false;
    float             gemX = 0.0f, gemY = 0.0f;
    int               score       = 0;
    int               frames      = 0;
    float             fpsTime     = 0.0f;
};

// new: a fatal error, in the log and in a dialog the player can read
static SDL_AppResult fail(const char* what) {
    char msg[512];
    SDL_snprintf(msg, sizeof msg, "%s failed:\\n%s", what, SDL_GetError());
    SDL_LogError(SDL_LOG_CATEGORY_APPLICATION, "%s", msg);
    SDL_ShowSimpleMessageBox(SDL_MESSAGEBOX_ERROR, "SDL3 Lab", msg, nullptr);
    return SDL_APP_FAILURE;
}

static std::string assetPath(const char* file) {
    const char* base = SDL_GetBasePath();
    return std::string(base ? base : "") + file;
}

static SDL_Texture* loadTexture(SDL_Renderer* renderer, const char* file) {
    SDL_Surface* surface = SDL_LoadPNG(assetPath(file).c_str());
    if (!surface) return nullptr;                        // changed: the caller reports it
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);
    SDL_DestroySurface(surface);
    return texture;
}

static void placeGem(AppState* app) {
    app->gemX = 16.0f + SDL_randf() * (GAME_W - 32.0f - GEM);
    app->gemY = 40.0f + SDL_randf() * (GAME_H - 56.0f - GEM);
}

// new: read best.txt; no file or a damaged one both mean "no record yet"
static void loadBest(AppState* app) {
    char* text = static_cast<char*>(SDL_LoadFile(app->savePath.c_str(), nullptr));
    if (!text) return;                                   // first launch: nothing saved yet
    int version = 0, best = 0;
    SDL_DateTime d{};
    const int found = SDL_sscanf(text, "sdl3lab-save %d best %d date %d-%d-%d",
                                 &version, &best, &d.year, &d.month, &d.day);
    if (found == 5 && version == 1 && best >= 0) {
        app->best     = best;
        app->bestDate = d;
    } else {
        SDL_Log("Ignoring a damaged save: %s", app->savePath.c_str());
    }
    SDL_free(text);
}

// new: write a temporary file, push it to the disk, then rename it over best.txt
static bool saveBest(const AppState* app) {
    char text[64];
    const int len = SDL_snprintf(text, sizeof text, "sdl3lab-save 1\\nbest %d\\ndate %04d-%02d-%02d\\n",
                                 app->best, app->bestDate.year, app->bestDate.month, app->bestDate.day);
    const std::string tmp = app->savePath + ".tmp";
    SDL_IOStream* io = SDL_IOFromFile(tmp.c_str(), "wb");
    if (!io) return false;
    bool ok = SDL_WriteIO(io, text, size_t(len)) == size_t(len);
    ok = ok && SDL_FlushIO(io);
    ok = SDL_CloseIO(io) && ok;                          // close even when the write failed
    return ok && SDL_RenamePath(tmp.c_str(), app->savePath.c_str());
}

// new
static void updateBestText(AppState* app) {
    char buf[48];
    if (app->best > 0)
        SDL_snprintf(buf, sizeof buf, "Best %d (%04d-%02d-%02d)", app->best,
                     app->bestDate.year, app->bestDate.month, app->bestDate.day);
    else
        SDL_snprintf(buf, sizeof buf, "Best -");
    TTF_SetTextString(app->bestText, buf, 0);
}

static void SDLCALL feedMusic(void* userdata, SDL_AudioStream* stream,
                              int additional, int /*total*/) {
    auto* m = static_cast<Music*>(userdata);
    static const float NOTES[4] = {110.00f, 87.31f, 130.81f, 98.00f};
    float buf[512];
    int needed = additional / int(sizeof(float));
    while (needed > 0) {
        const int n = SDL_min(needed, 512);
        for (int i = 0; i < n; ++i) {
            const int   note  = m->frame / MUSIC_NOTE;
            const float t     = float(m->frame % MUSIC_NOTE) / MUSIC_RATE;
            const float phase = SDL_fmodf(t * NOTES[note], 1.0f);
            buf[i] = (4.0f * SDL_fabsf(phase - 0.5f) - 1.0f) * SDL_expf(-3.0f * t) * 0.5f;
            m->frame = (m->frame + 1) % (4 * MUSIC_NOTE);
        }
        SDL_PutAudioStreamData(stream, buf, n * int(sizeof(float)));
        needed -= n;
    }
}

static bool initAudio(AppState* app) {
    if (!SDL_InitSubSystem(SDL_INIT_AUDIO)) return false;
    SDL_AudioSpec wavSpec;
    if (!SDL_LoadWAV(assetPath("assets/pickup.wav").c_str(), &wavSpec,
                     &app->pickupData, &app->pickupLen)) return false;
    app->audioDevice = SDL_OpenAudioDevice(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, nullptr);
    if (!app->audioDevice) return false;
    const SDL_AudioSpec musicSpec{SDL_AUDIO_F32, 1, MUSIC_RATE};
    app->sfx   = SDL_CreateAudioStream(&wavSpec, nullptr);
    app->music = SDL_CreateAudioStream(&musicSpec, nullptr);
    if (!app->sfx || !app->music) return false;
    SDL_SetAudioStreamGetCallback(app->music, feedMusic, &app->tune);
    SDL_SetAudioStreamGain(app->music, 0.5f);
    SDL_AudioStream* streams[] = {app->sfx, app->music};
    return SDL_BindAudioStreams(app->audioDevice, streams, 2);
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    SDL_SetAppMetadata("SDL3 Lab", "1.0", "com.example.sdl3lab");   // changed: 1.0
    if (!SDL_Init(SDL_INIT_VIDEO)) return fail("SDL_Init");          // changed: fail()
    if (!TTF_Init()) return fail("TTF_Init");
    auto* app = new AppState{};
    *appstate = app;
    if (!SDL_CreateWindowAndRenderer("SDL3 Lab", 1280, 720, SDL_WINDOW_RESIZABLE,
                                     &app->window, &app->renderer))
        return fail("SDL_CreateWindowAndRenderer");
    SDL_SetRenderVSync(app->renderer, 1);
    SDL_SetRenderLogicalPresentation(app->renderer, GAME_W, GAME_H,
                                     SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);

    app->hero = loadTexture(app->renderer, "assets/hero.png");
    if (!app->hero) return fail("Loading hero.png");
    SDL_SetTextureScaleMode(app->hero, SDL_SCALEMODE_NEAREST);

    app->font = TTF_OpenFont(assetPath("assets/Micro5-Regular.ttf").c_str(), FONT_PT);
    if (!app->font) return fail("TTF_OpenFont");
    app->engine    = TTF_CreateRendererTextEngine(app->renderer);
    app->scoreText = TTF_CreateText(app->engine, app->font, "Score 0", 0);
    app->fpsText   = TTF_CreateText(app->engine, app->font, "", 0);
    app->bestText  = TTF_CreateText(app->engine, app->font, "", 0);  // new
    if (!app->engine || !app->scoreText || !app->fpsText || !app->bestText)
        return fail("SDL3_ttf text setup");
    TTF_SetTextColor(app->scoreText, 250, 204, 21, 255);
    TTF_SetTextColor(app->fpsText, 148, 163, 184, 255);
    TTF_SetTextColor(app->bestText, 148, 163, 184, 255);             // new

    if (char* prefs = SDL_GetPrefPath("Example", "SDL3 Lab")) {        // new
        app->savePath = std::string(prefs) + "best.txt";
        SDL_free(prefs);
        loadBest(app);
    } else {
        SDL_Log("No save folder, the record will not be kept: %s", SDL_GetError());
    }
    updateBestText(app);                                               // new

    app->sound = initAudio(app);
    if (!app->sound) SDL_Log("No sound: %s", SDL_GetError());

    placeGem(app);
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

    const bool* keys = SDL_GetKeyboardState(nullptr);
    float dx = 0.0f, dy = 0.0f;
    if (keys[SDL_SCANCODE_LEFT]  || keys[SDL_SCANCODE_A]) dx -= 1.0f;
    if (keys[SDL_SCANCODE_RIGHT] || keys[SDL_SCANCODE_D]) dx += 1.0f;
    if (keys[SDL_SCANCODE_UP]    || keys[SDL_SCANCODE_W]) dy -= 1.0f;
    if (keys[SDL_SCANCODE_DOWN]  || keys[SDL_SCANCODE_S]) dy += 1.0f;
    if (dx != 0.0f && dy != 0.0f) { dx *= 0.7071f; dy *= 0.7071f; }

    app->x = SDL_clamp(app->x + dx * SPEED * dt, 0.0f, GAME_W - FRAME);
    app->y = SDL_clamp(app->y + dy * SPEED * dt, 0.0f, GAME_H - FRAME);

    const bool moving = dx != 0.0f || dy != 0.0f;
    if (dx < 0.0f) app->facingLeft = true;
    if (dx > 0.0f) app->facingLeft = false;
    app->animTime += dt;
    const int row   = moving ? 1 : 0;
    const int frame = int(app->animTime * ANIM_FPS) % 4;

    const SDL_FRect body{app->x + 7.0f, app->y + 8.0f, 18.0f, 21.0f};
    const SDL_FRect gem{app->gemX, app->gemY, GEM, GEM};
    if (SDL_HasRectIntersectionFloat(&body, &gem)) {
        ++app->score;
        placeGem(app);
        char buf[32];
        SDL_snprintf(buf, sizeof buf, "Score %d", app->score);
        TTF_SetTextString(app->scoreText, buf, 0);
        if (app->sound) {
            SDL_ClearAudioStream(app->sfx);
            SDL_SetAudioStreamFrequencyRatio(app->sfx, 0.95f + 0.1f * SDL_randf());
            SDL_PutAudioStreamData(app->sfx, app->pickupData, int(app->pickupLen));
        }
        if (app->score > app->best) {                                  // new: a new record
            app->best = app->score;
            SDL_Time wall = 0;
            if (SDL_GetCurrentTime(&wall)) SDL_TimeToDateTime(wall, &app->bestDate, true);
            updateBestText(app);
            if (!app->savePath.empty()) {
                const Uint64 c0 = SDL_GetPerformanceCounter();
                const bool saved = saveBest(app);
                const double ms = double(SDL_GetPerformanceCounter() - c0) * 1000.0
                                / double(SDL_GetPerformanceFrequency());
                if (saved) SDL_Log("Saved best %d in %.2f ms", app->best, ms);
                else       SDL_Log("Save failed: %s", SDL_GetError());
            }
        }
    }

    ++app->frames;
    app->fpsTime += dt;
    if (app->fpsTime >= 0.5f) {
        char buf[32];
        SDL_snprintf(buf, sizeof buf, "%d fps", int(app->frames / app->fpsTime + 0.5f));
        TTF_SetTextString(app->fpsText, buf, 0);
        app->frames  = 0;
        app->fpsTime = 0.0f;
    }

    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

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

    TTF_DrawRendererText(app->scoreText, 8.0f, 4.0f);
    TTF_DrawRendererText(app->bestText, 8.0f, 4.0f + FONT_PT);         // new: one line lower
    int w = 0, hText = 0;
    TTF_GetTextSize(app->fpsText, &w, &hText);
    TTF_DrawRendererText(app->fpsText, float(GAME_W - 8 - w), 4.0f);

    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        SDL_DestroyAudioStream(app->music);
        SDL_DestroyAudioStream(app->sfx);
        SDL_CloseAudioDevice(app->audioDevice);
        SDL_free(app->pickupData);
        TTF_DestroyText(app->scoreText);
        TTF_DestroyText(app->fpsText);
        TTF_DestroyText(app->bestText);                                // new
        TTF_DestroyRendererTextEngine(app->engine);
        TTF_CloseFont(app->font);
        SDL_DestroyTexture(app->hero);
        SDL_DestroyRenderer(app->renderer);
        SDL_DestroyWindow(app->window);
        delete app;
    }
    TTF_Quit();
}`;

// ── CMakeLists.txt ────────────────────────────────────────────────────────────

export const CMAKE_LISTS = `cmake_minimum_required(VERSION 3.24)
project(SDL3Lab VERSION 1.0 LANGUAGES C CXX)          # new: VERSION 1.0

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# new: Visual Studio puts its C/C++ runtime inside each file instead of needing its DLLs
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
# new: an installed program looks for its libraries in its own folder
if (APPLE)
    set(CMAKE_INSTALL_RPATH "@executable_path")
else()
    set(CMAKE_INSTALL_RPATH "$ORIGIN")
endif()

include(FetchContent)
FetchContent_Declare(SDL3
    GIT_REPOSITORY https://github.com/libsdl-org/SDL.git
    GIT_TAG        release-3.4.18
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(SDL3)

set(SDLTTF_VENDORED ON)
set(SDLTTF_PLUTOSVG OFF)
FetchContent_Declare(SDL3_ttf
    GIT_REPOSITORY https://github.com/libsdl-org/SDL_ttf.git
    GIT_TAG        release-3.2.2
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(SDL3_ttf)

add_executable(game WIN32 src/main.cpp)                # new: WIN32, no console window
target_link_libraries(game PRIVATE SDL3_ttf::SDL3_ttf SDL3::SDL3)

if (WIN32)
    add_custom_command(TARGET game POST_BUILD
        COMMAND \${CMAKE_COMMAND} -E copy_if_different
                $<TARGET_FILE:SDL3::SDL3> $<TARGET_FILE:SDL3_ttf::SDL3_ttf>
                $<TARGET_FILE_DIR:game>)
endif()

add_custom_command(TARGET game POST_BUILD
    COMMAND \${CMAKE_COMMAND} -E copy_directory
            \${CMAKE_SOURCE_DIR}/assets $<TARGET_FILE_DIR:game>/assets)

# new: what cmake --install puts in the folder you ship
install(TARGETS game SDL3-shared SDL3_ttf-shared
        RUNTIME DESTINATION .                        # game(.exe), and the DLLs on Windows
        LIBRARY DESTINATION . NAMELINK_SKIP          # the .so / .dylib files elsewhere
        ARCHIVE DESTINATION lib EXCLUDE_FROM_ALL)    # .lib files: only for linking, not shipped
install(DIRECTORY assets/ DESTINATION assets)
install(FILES \${sdl3_SOURCE_DIR}/LICENSE.txt     DESTINATION licenses RENAME SDL3.txt)
install(FILES \${sdl3_ttf_SOURCE_DIR}/LICENSE.txt DESTINATION licenses RENAME SDL3_ttf.txt)
install(FILES \${sdl3_ttf_SOURCE_DIR}/external/freetype/docs/FTL.TXT
        DESTINATION licenses RENAME FreeType.txt)
install(FILES \${sdl3_ttf_SOURCE_DIR}/external/harfbuzz/COPYING
        DESTINATION licenses RENAME HarfBuzz.txt)
install(FILES assets/OFL-Micro5.txt DESTINATION licenses)`;

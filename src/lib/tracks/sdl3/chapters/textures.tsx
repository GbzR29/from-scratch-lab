"use client";

// SDL3 track — "Textures & Images": surface vs texture; the project's sprite
// sheet (public/sdl3/hero.png) copied next to the executable by CMake; loading
// a PNG with SDL 3.4's own SDL_LoadPNG (SDL3_image for other formats); src/dst
// rectangles and the frame formula, with the SpriteSheet figure; scale modes
// (NEAREST, LINEAR, PIXELART); the project: animated, facing the way it walks;
// flip and rotation; colour and alpha mod; render targets; streaming textures
// and pitch, with the Pitch figure; the complete main.cpp; common mistakes.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { SpriteSheetFigure } from "@/components/lesson/figures/sdl3/SpriteSheetFigure";
import { PitchFigure } from "@/components/lesson/figures/sdl3/PitchFigure";

const r = String.raw;

export function TexturesContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl06_intro",
          "Until now the player has been a blue square drawn with SDL_RenderFillRect. In this chapter it becomes a picture: a small character from a PNG file, with an idle and a walking animation, that turns to face the way it moves. On the way you learn the two kinds of image SDL has, how a sprite sheet is cut into frames, why pixel art goes blurry and how to stop it, and two special textures: one you draw into and one whose pixels you write yourself every frame.")}
      </Lead>

      <Goals t={t} id="sdl06" items={[
        "Tell a surface from a texture and say where each one lives.",
        "Load a PNG and draw one frame of a sprite sheet with source and destination rectangles.",
        "Animate a sprite by time and flip it to face the way it moves.",
        "Keep pixel art sharp with the right scale mode.",
        "Draw into a texture, and write a streaming texture's pixels using its pitch.",
      ]} />

      <H2>{tx(t, "sdl06_kindsTitle", "Two kinds of image")}</H2>
      <p>
        {tx(t, "sdl06_kindsBody",
          "An SDL_Surface is an image in ordinary memory (RAM): width, height, a pixel format and a pointer to the pixels. The CPU can read and change every pixel, which is what loading a file needs. An SDL_Texture is an image in the graphics card's memory. The GPU draws it very fast, scaled, rotated and blended, but your code cannot touch its pixels directly. So an image is loaded into a surface, copied once into a texture, and the surface is thrown away.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl06_h0", ""), "SDL_Surface", "SDL_Texture"]}
        rows={[
          [tx(t, "sdl06_r0", "Lives in"),      tx(t, "sdl06_r1", "system RAM"),                       tx(t, "sdl06_r2", "GPU memory")],
          [tx(t, "sdl06_r3", "Pixel access"),  tx(t, "sdl06_r4", "direct: read and write"),           tx(t, "sdl06_r5", "none, except streaming textures (below)")],
          [tx(t, "sdl06_r6", "Drawing"),       tx(t, "sdl06_r7", "slow: the CPU copies pixels"),     tx(t, "sdl06_r8", "fast: the GPU does it")],
          [tx(t, "sdl06_r9", "Belongs to"),    tx(t, "sdl06_r10", "nobody: works without a renderer"), tx(t, "sdl06_r11", "one renderer; it cannot be drawn by another")],
          [tx(t, "sdl06_r12", "Use it for"),   tx(t, "sdl06_r13", "loading files, editing pixels"),   tx(t, "sdl06_r14", "everything you draw")],
        ]}
      />

      <H2>{tx(t, "sdl06_assetTitle", "The sprite sheet")}</H2>
      <p>
        {tx(t, "sdl06_assetBody",
          "A sprite sheet is one image that holds every frame of a character, side by side on a grid. The project's sheet is hero.png: 128 × 64 pixels, cut into frames of 32 × 32. Row 0 is the idle animation (the character breathes), row 1 is the walk; each row has four frames. One texture for all frames is faster than one texture per frame, because the renderer can draw many sprites from the same texture in one batch.")}
      </p>
      <p>
        <a href="/sdl3/hero.png" download="hero.png" className="text-[var(--primary)] underline">
          {tx(t, "sdl06_download", "Download hero.png")}
        </a>{" "}
        {tx(t, "sdl06_downloadBody",
          "and put it in a new folder assets/ beside src/. You may draw your own instead: any PNG with the same grid works.")}
      </p>
      <CodeBlock lang="text" filename="sdl3-lab/" t={t}>{`sdl3-lab/
├── CMakeLists.txt
├── assets/
│   └── hero.png        new: 4 frames × 2 rows, 32 × 32 each
└── src/
    └── main.cpp`}</CodeBlock>
      <p>
        {tx(t, "sdl06_cmakeBody",
          "The program looks for its files next to the executable, but the executable is built into build/ (build/Debug/ with Visual Studio). Add this at the end of CMakeLists.txt, so every build copies the assets folder there:")}
      </p>
      <CodeBlock lang="cmake" filename="CMakeLists.txt" t={t}>{`# Copy assets/ next to the executable after every build
add_custom_command(TARGET game POST_BUILD
    COMMAND \${CMAKE_COMMAND} -E copy_directory
            \${CMAKE_SOURCE_DIR}/assets $<TARGET_FILE_DIR:game>/assets)`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl06_ch0", "Piece"), tx(t, "sdl06_ch1", "What it means")]}
        rows={[
          ["POST_BUILD", tx(t, "sdl06_c1", "run the command after game is built, every time")],
          ["${CMAKE_COMMAND} -E copy_directory", tx(t, "sdl06_c2", "CMake's own copy tool, so the same line works on Windows, Linux and macOS")],
          ["${CMAKE_SOURCE_DIR}/assets", tx(t, "sdl06_c3", "the folder beside CMakeLists.txt")],
          ["$<TARGET_FILE_DIR:game>/assets", tx(t, "sdl06_c4", "an assets folder in whatever directory game ended up in")],
        ]}
      />

      <H2>{tx(t, "sdl06_loadTitle", "Loading a PNG")}</H2>
      <p>
        {tx(t, "sdl06_loadBody",
          "Since version 3.4, SDL reads PNG files by itself with SDL_LoadPNG, so the project needs no extra library. Add this function above SDL_AppInit:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`// Loads an image from the folder of the executable into a texture
static SDL_Texture* loadTexture(SDL_Renderer* renderer, const char* file) {
    const char* base = SDL_GetBasePath();           // ends with a / or \\
    const std::string path = std::string(base ? base : "") + file;

    SDL_Surface* surface = SDL_LoadPNG(path.c_str());   // pixels in RAM
    if (!surface) {
        SDL_Log("SDL_LoadPNG(%s) failed: %s", path.c_str(), SDL_GetError());
        return nullptr;
    }
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);  // copy to the GPU
    SDL_DestroySurface(surface);                    // the GPU has its own copy now
    if (!texture) SDL_Log("SDL_CreateTextureFromSurface failed: %s", SDL_GetError());
    return texture;
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl06_lh0", "Code"), tx(t, "sdl06_lh1", "What it does")]}
        rows={[
          ["SDL_GetBasePath()", tx(t, "sdl06_l1", "The folder the executable is in, always ending with a path separator. SDL owns the string: do not free it. A path such as \"assets/hero.png\" alone would be relative to the current directory, which is wherever the program was started from, often not the build folder.")],
          ["std::string(base ? base : \"\")", tx(t, "sdl06_l2", "SDL_GetBasePath returns nullptr if it cannot tell, and building a std::string from nullptr crashes. Add #include <string> at the top of the file.")],
          ["SDL_LoadPNG", tx(t, "sdl06_l3", "Reads the file and decodes it into a new surface. On failure it returns nullptr, and SDL_GetError says why: usually \"Couldn't open …\" with the full path, which shows at once where the program looked.")],
          ["SDL_CreateTextureFromSurface", tx(t, "sdl06_l4", "Creates a texture of the same size and uploads the pixels. A PNG with transparency gets the blend mode SDL_BLENDMODE_BLEND, so transparent pixels stay transparent.")],
          ["SDL_DestroySurface", tx(t, "sdl06_l5", "The surface is not needed after the upload. Forgetting this keeps a second copy of every image in RAM.")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "sdl06_imageNote",
          "SDL_LoadPNG is meant for your own files. For JPG, WEBP, AVIF and other formats, or for images from untrusted sources, use the satellite library SDL3_image: IMG_Load(path) returns a surface the same way, and IMG_LoadTexture(renderer, path) does the load and the upload in one call. SDL_LoadBMP has always been built in.")}
      </Callout>

      <H2>{tx(t, "sdl06_drawTitle", "Source and destination")}</H2>
      <p>
        {tx(t, "sdl06_drawBody",
          "SDL_RenderTexture(renderer, texture, &src, &dst) copies a rectangle of the texture, src, onto a rectangle of the screen, dst. Both are SDL_FRect: x, y, width, height, in floats. src is measured in the texture's pixels, dst in the screen's (logical) pixels. When the two sizes differ, the picture is scaled; nullptr for src means the whole texture, nullptr for dst the whole screen.")}
      </p>
      <p>
        {tx(t, "sdl06_frameBody",
          "For a sprite sheet, src picks one cell of the grid. Frame f of row r starts f frames from the left and r frames from the top:")}
      </p>
      <Equation label={tx(t, "sdl06_eqSrc", "One cell of the sheet")}
        where={[
          [r`f`, tx(t, "sdl06_wF", "the frame number in the row, from 0 to 3")],
          [r`r`, tx(t, "sdl06_wR", "the row: 0 idle, 1 walk")],
          [r`32`, tx(t, "sdl06_w32", "the size of one frame, in pixels of the texture")],
        ]}>
        {r`\text{src} = (\,32f,\; 32r,\; 32,\; 32\,)`}
      </Equation>
      <SpriteSheetFigure t={t} />
      <p>
        {tx(t, "sdl06_rotBody",
          "SDL_RenderTextureRotated takes three more arguments. The angle is in degrees, clockwise. The centre is the point it turns around, measured from dst's top-left corner; nullptr means the middle of dst. The flip mirrors the picture inside dst: SDL_FLIP_HORIZONTAL swaps left and right, which is how one set of frames serves both walking directions.")}
      </p>

      <H2>{tx(t, "sdl06_scaleTitle", "Sharp pixels: the scale mode")}</H2>
      <p>
        {tx(t, "sdl06_scaleBody",
          "When a texture is drawn larger than it is, every screen pixel has to pick a colour from the texture. The texture's scale mode decides how. The default, SDL_SCALEMODE_LINEAR, blends the nearest four texels, which is right for photos and turns pixel art into a blur. SDL_SCALEMODE_NEAREST takes the one closest texel: every texel becomes a sharp block. SDL 3.4 added SDL_SCALEMODE_PIXELART: sharp blocks, with only the edge between two texels softened, so the sprite also stays clean at scales like 2.5 and when it rotates. Try all three in the figure above at a scale of 3.5.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`SDL_SetTextureScaleMode(app->hero, SDL_SCALEMODE_NEAREST);         // one texture
SDL_SetDefaultTextureScaleMode(app->renderer, SDL_SCALEMODE_NEAREST); // SDL 3.4: every texture made from now on`}</CodeBlock>
      <p>
        {tx(t, "sdl06_scaleBody2",
          "The project uses NEAREST. Its logical resolution is 640 × 360 with integer scaling (from the renderer chapter), so a 1280 × 720 window shows every logical pixel as exactly 2 × 2 screen pixels, and nearest sampling is exact. One more rule keeps it exact: draw at whole logical pixels. A sprite at x = 100.5 sits on the border between two pixels, and its columns are cut unevenly. The position stays a float for smooth movement; only the drawing rounds it.")}
      </p>

      <H2>{tx(t, "sdl06_projectTitle", "The project: an animated character")}</H2>
      <p>
        {tx(t, "sdl06_startBody",
          "The project starts as the Events & Input chapter left it: the square moves with the arrow keys or WASD at 120 pixels per second, in a 640 × 360 logical screen. Four changes turn it into the character. First, the state gets the texture and two animation values:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`struct AppState {
    SDL_Window*   window     = nullptr;
    SDL_Renderer* renderer   = nullptr;
    SDL_Texture*  hero       = nullptr;   // new: the sprite sheet
    Uint64        lastTick   = 0;
    float         x = 304.0f, y = 164.0f; // top-left corner, in logical pixels
    float         animTime   = 0.0f;      // new: seconds of animation played
    bool          facingLeft = false;     // new: the last direction walked
};`}</CodeBlock>
      <p>
        {tx(t, "sdl06_step2", "Second, load the sheet at the end of SDL_AppInit, after the renderer exists:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`    app->hero = loadTexture(app->renderer, "assets/hero.png");
    if (!app->hero) return SDL_APP_FAILURE;      // the log already says why
    SDL_SetTextureScaleMode(app->hero, SDL_SCALEMODE_NEAREST);`}</CodeBlock>
      <p>
        {tx(t, "sdl06_step3",
          "Third, in SDL_AppIterate, choose the frame. The row depends on whether the character moves; the frame inside the row comes from the time played. At 8 frames per second, a four-frame walk repeats twice a second:")}
      </p>
      <Equation label={tx(t, "sdl06_eqFrame", "Which frame to show")}
        where={[
          [r`f`, tx(t, "sdl06_wF2", "the frame to draw, 0 to 3")],
          [r`t`, tx(t, "sdl06_wT", "animTime: seconds of animation played so far, increased by Δt every frame")],
          [r`\text{fps}`, tx(t, "sdl06_wFps", "animation frames per second: 8 here, independent of the screen's frame rate")],
          [r`4`, tx(t, "sdl06_w4", "frames in a row; mod 4 starts again at 0 after frame 3")],
        ]}>
        {r`f = \lfloor t \cdot \text{fps} \rfloor \bmod 4`}
      </Equation>
      <LessonTable
        headers={["t", "t × 8", tx(t, "sdl06_fh2", "rounded down"), "mod 4 = f"]}
        rows={[
          ["0.10 s", "0.8", "0", "0"],
          ["0.30 s", "2.4", "2", "2"],
          ["0.45 s", "3.6", "3", "3"],
          ["0.55 s", "4.4", "4", "0"],
        ]}
      />
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`    // after moving by dx, dy (Events & Input chapter):
    const bool moving = dx != 0.0f || dy != 0.0f;
    if (dx < 0.0f) app->facingLeft = true;       // only a horizontal move turns around
    if (dx > 0.0f) app->facingLeft = false;

    app->animTime += dt;
    const int row   = moving ? 1 : 0;            // 1 = walk, 0 = idle
    const int frame = int(app->animTime * ANIM_FPS) % 4;`}</CodeBlock>
      <p>
        {tx(t, "sdl06_step4", "Fourth, draw the frame instead of the square, and destroy the texture in SDL_AppQuit, before the renderer it belongs to:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`    const SDL_FRect src{frame * FRAME, row * FRAME, FRAME, FRAME};
    const SDL_FRect dst{SDL_roundf(app->x), SDL_roundf(app->y), FRAME, FRAME};
    SDL_RenderTextureRotated(app->renderer, app->hero, &src, &dst, 0.0, nullptr,
                             app->facingLeft ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);

// in SDL_AppQuit, first line inside the if:
        SDL_DestroyTexture(app->hero);           // textures before their renderer`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl06_ph0", "Code"), tx(t, "sdl06_ph1", "What it does")]}
        rows={[
          ["dst{…, FRAME, FRAME}", tx(t, "sdl06_p1", "The frame is drawn at its own size, 32 × 32 logical pixels, which the window shows as 64 × 64. No scaling inside the logical screen.")],
          ["SDL_roundf(app->x)", tx(t, "sdl06_p2", "Whole logical pixels for the drawing, as explained above. app->x itself keeps its fraction, so slow movement is still smooth over several frames.")],
          ["0.0, nullptr", tx(t, "sdl06_p3", "No rotation; the centre would be the middle of dst. SDL_RenderTextureRotated is used only for its flip argument.")],
          ["SDL_FLIP_HORIZONTAL", tx(t, "sdl06_p4", "The sheet only has frames facing right. Mirrored, the same frames face left.")],
          ["SDL_DestroyTexture before SDL_DestroyRenderer", tx(t, "sdl06_p5", "A texture belongs to its renderer. Destroying the renderer frees its textures too, but in this order each object is freed exactly once, by you.")],
        ]}
      />
      <p>
        {tx(t, "sdl06_runBody",
          "Build and run. The character breathes while it stands still, walks when you press a key, and looks left or right with the last horizontal key. Diagonal keys keep the walk animation and the last facing.")}
      </p>

      <H2>{tx(t, "sdl06_modTitle", "Tinting and fading")}</H2>
      <p>
        {tx(t, "sdl06_modBody",
          "Two settings change how a texture is drawn without touching its pixels. The colour mod multiplies every texel's red, green and blue; the alpha mod multiplies its alpha:")}
      </p>
      <Equation label={tx(t, "sdl06_eqMod", "Colour and alpha mod")}
        where={[
          [r`c`, tx(t, "sdl06_wC", "one channel of a texel (red, green, blue or alpha), 0 to 255")],
          [r`m`, tx(t, "sdl06_wM", "the mod for that channel, set by SDL_SetTextureColorMod or SDL_SetTextureAlphaMod, 0 to 255")],
          [r`c'`, tx(t, "sdl06_wC2", "the value that is drawn")],
        ]}>
        {r`c' = c \cdot \frac{m}{255}`}
      </Equation>
      <p>
        {tx(t, "sdl06_modBody2",
          "A mod of 255 changes nothing, 128 halves the channel, 0 removes it. SDL_SetTextureColorMod(tex, 255, 80, 80) keeps the red and dims green and blue: the classic red flash when a character is hit. SDL_SetTextureAlphaMod(tex, 128) makes it half transparent. The mods belong to the texture, so set them back to 255 after the draw that needed them, or every later draw of that texture is tinted too.")}
      </p>

      <H2>{tx(t, "sdl06_targetTitle", "Drawing into a texture")}</H2>
      <p>
        {tx(t, "sdl06_targetBody",
          "A texture created with SDL_TEXTUREACCESS_TARGET can be drawn into instead of the window. SDL_SetRenderTarget(renderer, texture) sends every following draw call there; SDL_SetRenderTarget(renderer, nullptr) goes back to the window. The texture can then be drawn like any other. Typical uses: a tile map drawn once and reused until it changes, a minimap, or a whole scene drawn small and scaled up at the end.")}
      </p>
      <CodeBlock lang="cpp" filename="render_target.cpp" t={t}>{`// Once: a 320 × 180 texture you can draw into
SDL_Texture* layer = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_RGBA8888,
                                       SDL_TEXTUREACCESS_TARGET, 320, 180);
SDL_SetTextureBlendMode(layer, SDL_BLENDMODE_BLEND);   // keep its transparent parts

// When the map changes: redraw the layer
SDL_SetRenderTarget(renderer, layer);
SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);          // alpha 0: transparent
SDL_RenderClear(renderer);
drawTiles(renderer);
SDL_SetRenderTarget(renderer, nullptr);                // back to the window

// Every frame: one draw instead of hundreds of tiles
SDL_RenderTexture(renderer, layer, nullptr, nullptr);`}</CodeBlock>
      <Callout type="warn" t={t}>
        {tx(t, "sdl06_targetWarn",
          "The contents of a target texture can be lost when the graphics device is reset, for example on some Windows systems when the screen resolution changes or the GPU driver restarts. SDL then sends SDL_EVENT_RENDER_TARGETS_RESET (or SDL_EVENT_RENDER_DEVICE_RESET, which loses every texture). A cached layer must be able to redraw itself when that event arrives.")}
      </Callout>

      <H2>{tx(t, "sdl06_streamTitle", "Writing pixels yourself: streaming textures")}</H2>
      <p>
        {tx(t, "sdl06_streamBody",
          "Sometimes the CPU computes every pixel: a software ray tracer, a plasma effect, a video decoder, an emulator's screen. A texture created with SDL_TEXTUREACCESS_STREAMING lends you its memory: SDL_LockTexture gives a pointer to the pixels and the pitch, you write the frame, and SDL_UnlockTexture sends it to the GPU.")}
      </p>
      <p>
        {tx(t, "sdl06_pitchBody",
          "The pitch is the length of one row in bytes. It is at least width × 4 for a 4-byte format, and may be more: many GPUs want each row to start at a multiple of 16, 64 or even 256 bytes, so the driver adds unused bytes at the end of each row. Pixel (x, y) is therefore found at:")}
      </p>
      <Equation label={tx(t, "sdl06_eqPitch", "Where a pixel lives")}
        where={[
          [r`\text{offset}`, tx(t, "sdl06_wOff", "bytes from the start of the locked memory")],
          [r`y`, tx(t, "sdl06_wY", "the row, from 0 at the top")],
          [r`\text{pitch}`, tx(t, "sdl06_wPitch", "bytes per row, as reported by SDL_LockTexture")],
          [r`x`, tx(t, "sdl06_wX", "the column, from 0 at the left")],
          [r`4`, tx(t, "sdl06_wBpp", "bytes per pixel in an 8-bit RGBA or ARGB format")],
        ]}>
        {r`\text{offset} = y \cdot \text{pitch} + 4x`}
      </Equation>
      <PitchFigure t={t} />
      <CodeBlock lang="cpp" filename="streaming.cpp" t={t}>{`// Once
SDL_Texture* screen = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_ARGB8888,
                                        SDL_TEXTUREACCESS_STREAMING, W, H);

// Every frame
void* pixels = nullptr;
int   pitch  = 0;                                    // bytes per row: NOT always W * 4
if (SDL_LockTexture(screen, nullptr, &pixels, &pitch)) {
    for (int y = 0; y < H; ++y) {
        auto* row = reinterpret_cast<Uint32*>(static_cast<Uint8*>(pixels) + y * pitch);
        for (int x = 0; x < W; ++x)
            row[x] = 0xFF000000u | (Uint32(x * 255 / W) << 16) | Uint32(y * 255 / H);  // A R G B
    }
    SDL_UnlockTexture(screen);                       // uploads the new pixels
}
SDL_RenderTexture(renderer, screen, nullptr, nullptr);`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl06_sh0", "Code"), tx(t, "sdl06_sh1", "What it does")]}
        rows={[
          ["SDL_PIXELFORMAT_ARGB8888", tx(t, "sdl06_s1", "Each pixel is one 32-bit number with alpha in the top byte, then red, green, blue. That is why the loop builds 0xFF000000 | red << 16 | blue.")],
          ["SDL_LockTexture(…, nullptr, …)", tx(t, "sdl06_s2", "Locks the whole texture (a rectangle would lock part of it). The memory is write-only in practice: its old contents are undefined, so write every pixel.")],
          ["static_cast<Uint8*>(pixels) + y * pitch", tx(t, "sdl06_s3", "Steps to row y in bytes, which is the unit pitch is measured in, and only then treats the row as Uint32 pixels.")],
          ["SDL_UnlockTexture", tx(t, "sdl06_s4", "Hands the memory back; the pointer is invalid from here on.")],
        ]}
      />
      <p>
        {tx(t, "sdl06_updateBody",
          "When the pixels already sit in an array of your own, SDL_UpdateTexture(texture, nullptr, data, W * 4) copies them in one call. There the last argument is the pitch of your array, which you know is tight; SDL deals with the texture's own pitch.")}
      </p>

      <H2>{tx(t, "sdl06_fullTitle", "The complete main.cpp")}</H2>
      <p>
        {tx(t, "sdl06_fullBody", "With the four changes in place, the whole file reads:")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <string>

constexpr int   GAME_W   = 640;      // logical resolution (renderer chapter)
constexpr int   GAME_H   = 360;
constexpr float SPEED    = 120.0f;   // logical pixels per second
constexpr float FRAME    = 32.0f;    // one frame of hero.png
constexpr float ANIM_FPS = 8.0f;     // animation frames per second

struct AppState {
    SDL_Window*   window     = nullptr;
    SDL_Renderer* renderer   = nullptr;
    SDL_Texture*  hero       = nullptr;
    Uint64        lastTick   = 0;
    float         x = 304.0f, y = 164.0f;
    float         animTime   = 0.0f;
    bool          facingLeft = false;
};

static SDL_Texture* loadTexture(SDL_Renderer* renderer, const char* file) {
    const char* base = SDL_GetBasePath();
    const std::string path = std::string(base ? base : "") + file;
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
    SDL_SetRenderLogicalPresentation(app->renderer, GAME_W, GAME_H,
                                     SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);

    app->hero = loadTexture(app->renderer, "assets/hero.png");
    if (!app->hero) return SDL_APP_FAILURE;
    SDL_SetTextureScaleMode(app->hero, SDL_SCALEMODE_NEAREST);

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

    app->x = SDL_clamp(app->x + dx * SPEED * dt, 0.0f, GAME_W - FRAME);
    app->y = SDL_clamp(app->y + dy * SPEED * dt, 0.0f, GAME_H - FRAME);

    // Animation
    const bool moving = dx != 0.0f || dy != 0.0f;
    if (dx < 0.0f) app->facingLeft = true;
    if (dx > 0.0f) app->facingLeft = false;
    app->animTime += dt;
    const int row   = moving ? 1 : 0;
    const int frame = int(app->animTime * ANIM_FPS) % 4;

    // Draw
    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

    const SDL_FRect src{frame * FRAME, row * FRAME, FRAME, FRAME};
    const SDL_FRect dst{SDL_roundf(app->x), SDL_roundf(app->y), FRAME, FRAME};
    SDL_RenderTextureRotated(app->renderer, app->hero, &src, &dst, 0.0, nullptr,
                             app->facingLeft ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);

    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        SDL_DestroyTexture(app->hero);
        SDL_DestroyRenderer(app->renderer);
        SDL_DestroyWindow(app->window);
        delete app;
    }
}`}</CodeBlock>

      <H2>{tx(t, "sdl06_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl06_mh0", "Symptom"), tx(t, "sdl06_mh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl06_e1", "\"Couldn't open assets/hero.png\" when started from the IDE, fine from the build folder"), tx(t, "sdl06_e1b", "the path was relative to the current directory. Build it from SDL_GetBasePath(), and check that the POST_BUILD copy ran.")],
          [tx(t, "sdl06_e2", "The sprite is blurry"), tx(t, "sdl06_e2b", "the default scale mode is LINEAR. Set NEAREST (or PIXELART) on the texture, or with SDL_SetDefaultTextureScaleMode before loading.")],
          [tx(t, "sdl06_e3", "Thin lines in the sprite flicker or change width as it moves"), tx(t, "sdl06_e3b", "drawn at fractional positions or a non-integer scale. Round dst.x and dst.y, use INTEGER_SCALE presentation, or PIXELART.")],
          [tx(t, "sdl06_e4", "A strip of the next frame shows at the edge"), tx(t, "sdl06_e4b", "src is off by some pixels, or LINEAR sampling reads across the border into the neighbouring frame. Check frame × 32 and use NEAREST.")],
          [tx(t, "sdl06_e5", "The whole sheet is drawn, squeezed into the sprite's box"), tx(t, "sdl06_e5b", "src is nullptr. Pass &src with one cell.")],
          [tx(t, "sdl06_e6", "Every sprite drawn after the hit flash is red"), tx(t, "sdl06_e6b", "the colour mod stays on the texture. Set it back to 255, 255, 255.")],
          [tx(t, "sdl06_e7", "A streaming texture shows diagonal stripes on one machine only"), tx(t, "sdl06_e7b", "rows indexed with W * 4 instead of the pitch from SDL_LockTexture (figure above).")],
          [tx(t, "sdl06_e8", "The texture draws nothing, or crashes, in a second window"), tx(t, "sdl06_e8b", "a texture belongs to the renderer that created it. Load it again for the other renderer.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl06" items={[
        "A surface is pixels in RAM that the CPU can edit; a texture is pixels on the GPU that the renderer draws fast. Load into a surface, upload, destroy the surface.",
        "SDL 3.4 loads PNG itself with SDL_LoadPNG; SDL3_image adds the other formats.",
        "Build asset paths from SDL_GetBasePath(), and let CMake copy assets/ next to the executable.",
        "src picks a rectangle of the texture, dst places it on screen; a sheet's frame is src = (32f, 32r, 32, 32).",
        "Animate by time: f = ⌊t · fps⌋ mod 4, with t increased by Δt.",
        "SDL_RenderTextureRotated adds an angle (degrees, clockwise), a centre and a flip; SDL_FLIP_HORIZONTAL turns a sprite around.",
        "Pixel art needs NEAREST or PIXELART, whole-pixel positions and integer scaling.",
        "Target textures are drawn into with SDL_SetRenderTarget; streaming textures are written through SDL_LockTexture, row y at y × pitch.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "renderer", title: tx(t, "sdl06_rel1", "The 2D Renderer"), why: tx(t, "sdl06_rel1b", "logical presentation and integer scaling, which keep the sprite's pixels square.") },
        { track: "OpenGL", id: "textures", title: tx(t, "sdl06_rel2", "OpenGL: Textures"), why: tx(t, "sdl06_rel2b", "what SDL does underneath: texture objects, filtering, mipmaps and row alignment.") },
        { track: "SDL3", id: "text", title: tx(t, "sdl06_rel3", "Text with SDL3_ttf"), why: tx(t, "sdl06_rel3b", "the next step: a score drawn from a font, which is also a texture.") },
      ]} />
    </Article>
  );
}

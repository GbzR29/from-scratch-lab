// src/lib/reference/sdl3/render.ts
// SDL 3.2: creating the 2D renderer and the settings that shape what it draws.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const renderEntries: RefEntry[] = [
  {
    name: "SDL_CreateWindowAndRenderer",
    category: "render",
    since: "SDL 3.2",
    signature: "bool SDL_CreateWindowAndRenderer(const char *title, int width, int height, SDL_WindowFlags window_flags, SDL_Window **window, SDL_Renderer **renderer);",
    summary: {
      en: "Creates a window and its 2D renderer in one call. The shortest start for a 2D program.",
      pt: "Cria uma janela e o renderer 2D dela numa chamada só. O começo mais curto de um programa 2D.",
    },
    description: {
      en: "It is SDL_CreateWindow followed by SDL_CreateRenderer with the default driver. The two results come back through the pointer-to-pointer parameters, and the function itself returns `true` or `false`.",
      pt: "É SDL_CreateWindow seguida de SDL_CreateRenderer com o driver padrão. Os dois resultados voltam pelos parâmetros ponteiro-para-ponteiro, e a função em si retorna `true` ou `false`.",
    },
    params: [
      { name: "title", type: "const char *", desc: { en: "Title bar text, UTF-8.", pt: "Texto da barra de título, UTF-8." } },
      { name: "width", type: "int", desc: { en: "Window width in window coordinates.", pt: "Largura da janela em coordenadas de janela." } },
      { name: "height", type: "int", desc: { en: "Window height in window coordinates.", pt: "Altura da janela em coordenadas de janela." } },
      { name: "window_flags", type: "SDL_WindowFlags", desc: { en: "Same flags as SDL_CreateWindow, e.g. SDL_WINDOW_RESIZABLE, or 0.", pt: "As mesmas flags de SDL_CreateWindow, ex.: SDL_WINDOW_RESIZABLE, ou 0." } },
      { name: "window", type: "SDL_Window **", desc: { en: "Receives the window.", pt: "Recebe a janela." } },
      { name: "renderer", type: "SDL_Renderer **", desc: { en: "Receives the renderer.", pt: "Recebe o renderer." } },
    ],
    returns: { en: "`true` on success, `false` on failure (see SDL_GetError).", pt: "`true` se deu certo, `false` se falhou (veja SDL_GetError)." },
    example: `SDL_Window* window = nullptr;
SDL_Renderer* renderer = nullptr;
if (!SDL_CreateWindowAndRenderer("SDL3 Window", 1280, 720, SDL_WINDOW_RESIZABLE,
                                 &window, &renderer)) {
    SDL_Log("CreateWindowAndRenderer: %s", SDL_GetError());
    return 1;
}`,
    related: ["SDL_CreateWindow", "SDL_CreateRenderer", "SDL_DestroyRenderer"],
    khronos: `${WIKI}SDL_CreateWindowAndRenderer`,
  },
  {
    name: "SDL_CreateRenderer",
    category: "render",
    since: "SDL 3.2",
    signature: "SDL_Renderer * SDL_CreateRenderer(SDL_Window *window, const char *name);",
    summary: {
      en: "Creates a 2D renderer for a window: the object that draws rectangles, lines and textures with the GPU.",
      pt: "Cria um renderer 2D para uma janela: o objeto que desenha retângulos, linhas e texturas com a GPU.",
    },
    description: {
      en: "The renderer is SDL's simple 2D API. Under the hood it uses whatever the platform does best (Direct3D, Metal, Vulkan, OpenGL), but you only see functions like SDL_RenderTexture. Pass NULL as the name and SDL picks the best driver.\n\nEvery texture belongs to the renderer that created it: you cannot draw a texture of renderer A with renderer B.",
      pt: "O renderer é a API 2D simples do SDL. Por baixo ele usa o que a plataforma faz de melhor (Direct3D, Metal, Vulkan, OpenGL), mas você só vê funções como SDL_RenderTexture. Passe NULL como nome e o SDL escolhe o melhor driver.\n\nToda textura pertence ao renderer que a criou: não dá para desenhar uma textura do renderer A com o renderer B.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to draw into.", pt: "A janela onde desenhar." } },
      { name: "name", type: "const char *", desc: { en: "NULL for the best driver, or one name such as \"direct3d11\", \"metal\", \"vulkan\", \"opengl\", \"gpu\", \"software\".", pt: "NULL para o melhor driver, ou um nome como \"direct3d11\", \"metal\", \"vulkan\", \"opengl\", \"gpu\", \"software\"." } },
    ],
    returns: { en: "The renderer, or NULL on failure.", pt: "O renderer, ou NULL se falhar." },
    notes: [
      { en: "Vsync is OFF by default in SDL3. Turn it on with SDL_SetRenderVSync.", pt: "O vsync vem DESLIGADO por padrão no SDL3. Ligue com SDL_SetRenderVSync." },
    ],
    example: `SDL_Renderer* renderer = SDL_CreateRenderer(window, nullptr);
if (!renderer) { SDL_Log("CreateRenderer: %s", SDL_GetError()); return 1; }
SDL_SetRenderVSync(renderer, 1);
SDL_Log("renderer: %s", SDL_GetRendererName(renderer));`,
    related: ["SDL_CreateWindowAndRenderer", "SDL_SetRenderVSync", "SDL_GetRendererName", "SDL_DestroyRenderer"],
    khronos: `${WIKI}SDL_CreateRenderer`,
  },
  {
    name: "SDL_DestroyRenderer",
    category: "render",
    since: "SDL 3.2",
    signature: "void SDL_DestroyRenderer(SDL_Renderer *renderer);",
    summary: {
      en: "Destroys a renderer and every texture it created.",
      pt: "Destrói um renderer e toda textura que ele criou.",
    },
    description: {
      en: "Textures die with their renderer, so any SDL_Texture* you still hold becomes invalid. Destroy the renderer before its window.",
      pt: "As texturas morrem junto com o renderer, então todo SDL_Texture* que você ainda guardar fica inválido. Destrua o renderer antes da janela dele.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer to destroy.", pt: "O renderer a destruir." } },
    ],
    example: `SDL_DestroyRenderer(renderer);
SDL_DestroyWindow(window);
SDL_Quit();`,
    related: ["SDL_CreateRenderer", "SDL_DestroyWindow", "SDL_DestroyTexture"],
    khronos: `${WIKI}SDL_DestroyRenderer`,
  },
  {
    name: "SDL_GetRendererName",
    category: "render",
    since: "SDL 3.2",
    signature: "const char * SDL_GetRendererName(SDL_Renderer *renderer);",
    summary: {
      en: "Tells which backend the renderer ended up using, e.g. \"direct3d11\" or \"metal\".",
      pt: "Diz qual backend o renderer acabou usando, ex.: \"direct3d11\" ou \"metal\".",
    },
    description: {
      en: "Handy in a log line at startup: when a user reports a drawing bug, you know which driver was behind it.",
      pt: "Útil numa linha de log na partida: quando um usuário relata um erro de desenho, você sabe qual driver estava por trás.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
    ],
    returns: { en: "The driver name (owned by SDL), or NULL on failure.", pt: "O nome do driver (do SDL), ou NULL se falhar." },
    example: `SDL_Log("renderer: %s", SDL_GetRendererName(renderer));`,
    related: ["SDL_CreateRenderer"],
    khronos: `${WIKI}SDL_GetRendererName`,
  },
  {
    name: "SDL_SetRenderVSync",
    category: "render",
    since: "SDL 3.2",
    signature: "bool SDL_SetRenderVSync(SDL_Renderer *renderer, int vsync);",
    summary: {
      en: "Turns vsync on or off for the renderer: whether SDL_RenderPresent waits for the monitor's refresh.",
      pt: "Liga ou desliga o vsync do renderer: se SDL_RenderPresent espera a atualização do monitor.",
    },
    description: {
      en: "With vsync 1, each present waits for the next refresh: no tearing and no wasted frames, and the loop runs at the monitor's rate (60, 144 Hz…). With 0 the loop runs as fast as it can, which is useful to measure performance but burns power.",
      pt: "Com vsync 1, cada present espera a próxima atualização: sem tearing e sem quadros desperdiçados, e o laço roda na taxa do monitor (60, 144 Hz…). Com 0 o laço roda o mais rápido que pode, o que serve para medir desempenho mas gasta energia.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      {
        name: "vsync",
        type: "int",
        desc: { en: "How many refreshes to wait per present.", pt: "Quantas atualizações esperar por present." },
        values: [
          { name: "SDL_RENDERER_VSYNC_DISABLED (0)", desc: { en: "No waiting.", pt: "Sem espera." } },
          { name: "1", desc: { en: "Every refresh (normal vsync).", pt: "Toda atualização (vsync normal)." } },
          { name: "2", desc: { en: "Every second refresh (e.g. 30 fps on a 60 Hz monitor).", pt: "A cada duas atualizações (ex.: 30 fps num monitor de 60 Hz)." } },
          { name: "SDL_RENDERER_VSYNC_ADAPTIVE (-1)", desc: { en: "Like 1, but a late frame is shown at once. Not everywhere.", pt: "Como 1, mas um quadro atrasado aparece na hora. Não em todo lugar." } },
        ],
      },
    ],
    returns: { en: "`true` on success; `false` if this value is not supported.", pt: "`true` se deu certo; `false` se este valor não é suportado." },
    example: `if (!SDL_SetRenderVSync(renderer, SDL_RENDERER_VSYNC_ADAPTIVE))
    SDL_SetRenderVSync(renderer, 1);   // fall back to plain vsync`,
    related: ["SDL_RenderPresent", "SDL_CreateRenderer"],
    khronos: `${WIKI}SDL_SetRenderVSync`,
  },
  {
    name: "SDL_SetRenderLogicalPresentation",
    category: "render",
    since: "SDL 3.2",
    signature: "bool SDL_SetRenderLogicalPresentation(SDL_Renderer *renderer, int w, int h, SDL_RendererLogicalPresentation mode);",
    summary: {
      en: "Lets you draw at a fixed size (e.g. 640×360) and have SDL scale it to whatever the window is.",
      pt: "Deixa você desenhar num tamanho fixo (ex.: 640×360) e o SDL escala para o tamanho que a janela tiver.",
    },
    description: {
      en: "Pixel-art games are designed for one small resolution. With a logical size, all your drawing coordinates stay in that resolution and SDL scales the result to the window, adding black bars if the proportions differ.\n\nINTEGER_SCALE only scales by whole numbers (2×, 3×…), so every game pixel becomes the same number of screen pixels and nothing looks uneven.",
      pt: "Jogos em pixel art são desenhados para uma resolução pequena. Com um tamanho lógico, todas as suas coordenadas de desenho ficam nessa resolução e o SDL escala o resultado para a janela, acrescentando faixas pretas se as proporções forem diferentes.\n\nINTEGER_SCALE só escala por números inteiros (2×, 3×…), então cada pixel do jogo vira o mesmo número de pixels da tela e nada fica irregular.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "w", type: "int", desc: { en: "Logical width you draw in.", pt: "Largura lógica em que você desenha." } },
      { name: "h", type: "int", desc: { en: "Logical height you draw in.", pt: "Altura lógica em que você desenha." } },
      {
        name: "mode",
        type: "SDL_RendererLogicalPresentation",
        desc: { en: "How to fit the logical size into the window.", pt: "Como encaixar o tamanho lógico na janela." },
        values: [
          { name: "SDL_LOGICAL_PRESENTATION_LETTERBOX", desc: { en: "Keep proportions, black bars on the sides that do not fit.", pt: "Mantém as proporções, faixas pretas nos lados que não encaixam." } },
          { name: "SDL_LOGICAL_PRESENTATION_INTEGER_SCALE", desc: { en: "Whole-number scale only, centered. Best for pixel art.", pt: "Só escala inteira, centralizada. Melhor para pixel art." } },
          { name: "SDL_LOGICAL_PRESENTATION_STRETCH", desc: { en: "Fill the window, distorting proportions.", pt: "Preenche a janela, distorcendo as proporções." } },
          { name: "SDL_LOGICAL_PRESENTATION_OVERSCAN", desc: { en: "Fill the window, cutting off the parts that overflow.", pt: "Preenche a janela, cortando o que transborda." } },
          { name: "SDL_LOGICAL_PRESENTATION_DISABLED", desc: { en: "Turn it off: draw in real pixels again.", pt: "Desliga: desenha em pixels reais de novo." } },
        ],
      },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    notes: [
      { en: "Mouse positions stay in window coordinates. Convert them with SDL_RenderCoordinatesFromWindow.", pt: "As posições do mouse continuam em coordenadas de janela. Converta com SDL_RenderCoordinatesFromWindow." },
      { en: "Combine with SDL_SetTextureScaleMode(tex, SDL_SCALEMODE_NEAREST) so the pixels stay sharp.", pt: "Combine com SDL_SetTextureScaleMode(tex, SDL_SCALEMODE_NEAREST) para os pixels continuarem nítidos." },
    ],
    example: `SDL_SetRenderLogicalPresentation(renderer, 640, 360,
                                 SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);
// from now on, (0,0)-(640,360) covers the game area in any window size`,
    related: ["SDL_RenderCoordinatesFromWindow", "SDL_SetTextureScaleMode"],
    khronos: `${WIKI}SDL_SetRenderLogicalPresentation`,
  },
  {
    name: "SDL_RenderCoordinatesFromWindow",
    category: "render",
    since: "SDL 3.2",
    signature: "bool SDL_RenderCoordinatesFromWindow(SDL_Renderer *renderer, float window_x, float window_y, float *x, float *y);",
    summary: {
      en: "Converts a window position (e.g. the mouse) into the renderer's drawing coordinates.",
      pt: "Converte uma posição de janela (ex.: o mouse) para as coordenadas de desenho do renderer.",
    },
    description: {
      en: "With a logical presentation or a render scale, a mouse at window point (800, 450) may be at game point (320, 180). This function undoes the scaling and the black bars, so you can compare the mouse with your sprites directly. SDL_ConvertEventToRenderCoordinates converts a whole event in place.",
      pt: "Com uma apresentação lógica ou uma escala de render, um mouse no ponto (800, 450) da janela pode estar no ponto (320, 180) do jogo. Esta função desfaz a escala e as faixas pretas, para você comparar o mouse direto com os seus sprites. SDL_ConvertEventToRenderCoordinates converte um evento inteiro no lugar.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "window_x", type: "float", desc: { en: "x in window coordinates.", pt: "x em coordenadas de janela." } },
      { name: "window_y", type: "float", desc: { en: "y in window coordinates.", pt: "y em coordenadas de janela." } },
      { name: "x", type: "float *", desc: { en: "Receives x in render coordinates.", pt: "Recebe o x em coordenadas de render." } },
      { name: "y", type: "float *", desc: { en: "Receives y in render coordinates.", pt: "Recebe o y em coordenadas de render." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `float lx, ly;
SDL_RenderCoordinatesFromWindow(renderer, e.motion.x, e.motion.y, &lx, &ly);
hovered = pointInRect(lx, ly, button);`,
    related: ["SDL_SetRenderLogicalPresentation", "SDL_GetMouseState"],
    khronos: `${WIKI}SDL_RenderCoordinatesFromWindow`,
  },
  {
    name: "SDL_SetRenderTarget",
    category: "render",
    since: "SDL 3.2",
    signature: "bool SDL_SetRenderTarget(SDL_Renderer *renderer, SDL_Texture *texture);",
    summary: {
      en: "Makes the renderer draw into a texture instead of the window. NULL switches back to the window.",
      pt: "Faz o renderer desenhar numa textura em vez da janela. NULL volta para a janela.",
    },
    description: {
      en: "Draw a minimap, a scene to be post-processed or a cached background once into a texture, then draw that texture like any other. The texture must have been created with SDL_TEXTUREACCESS_TARGET.\n\nClear the target first (the texture's old contents are kept otherwise), and remember to set NULL before presenting.",
      pt: "Desenhe um minimapa, uma cena a ser pós-processada ou um fundo em cache uma vez numa textura e depois desenhe essa textura como qualquer outra. A textura precisa ter sido criada com SDL_TEXTUREACCESS_TARGET.\n\nLimpe o alvo antes (senão o conteúdo antigo da textura continua lá), e lembre de definir NULL antes de apresentar.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "texture", type: "SDL_Texture *", desc: { en: "A TARGET texture, or NULL for the window.", pt: "Uma textura TARGET, ou NULL para a janela." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_Texture* minimap = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_RGBA8888,
                                         SDL_TEXTUREACCESS_TARGET, 256, 256);
SDL_SetRenderTarget(renderer, minimap);
SDL_SetRenderDrawColor(renderer, 0, 0, 0, 0);
SDL_RenderClear(renderer);
drawMapTiles(renderer);
SDL_SetRenderTarget(renderer, nullptr);          // back to the window
SDL_FRect corner{1000, 20, 256, 256};
SDL_RenderTexture(renderer, minimap, nullptr, &corner);`,
    related: ["SDL_CreateTexture", "SDL_RenderClear", "SDL_RenderTexture"],
    khronos: `${WIKI}SDL_SetRenderTarget`,
  },
];

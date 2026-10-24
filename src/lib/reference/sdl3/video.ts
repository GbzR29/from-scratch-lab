// src/lib/reference/sdl3/video.ts
// SDL 3.2: windows, their size in window units and pixels, position, displays.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const videoEntries: RefEntry[] = [
  {
    name: "SDL_CreateWindow",
    category: "video",
    since: "SDL 3.2",
    signature: "SDL_Window * SDL_CreateWindow(const char *title, int w, int h, SDL_WindowFlags flags);",
    summary: {
      en: "Opens a window. Flags choose how it can be drawn into (OpenGL, Vulkan…) and how it behaves.",
      pt: "Abre uma janela. As flags escolhem como desenhar nela (OpenGL, Vulkan…) e como ela se comporta.",
    },
    description: {
      en: "The window alone shows nothing: you still need something that draws into it. For 2D, create an SDL_Renderer for it (or use SDL_CreateWindowAndRenderer, which does both). For OpenGL add SDL_WINDOW_OPENGL and create a context; for Vulkan add SDL_WINDOW_VULKAN; SDL_GPU needs no flag.\n\nUnlike SDL2 there are no x and y parameters: the system places the window. Move it afterwards with SDL_SetWindowPosition if you care.",
      pt: "A janela sozinha não mostra nada: ainda falta algo que desenhe nela. Para 2D, crie um SDL_Renderer para ela (ou use SDL_CreateWindowAndRenderer, que faz os dois). Para OpenGL acrescente SDL_WINDOW_OPENGL e crie um contexto; para Vulkan acrescente SDL_WINDOW_VULKAN; o SDL_GPU não precisa de flag.\n\nAo contrário do SDL2 não há parâmetros x e y: o sistema posiciona a janela. Mova depois com SDL_SetWindowPosition se fizer questão.",
    },
    params: [
      { name: "title", type: "const char *", desc: { en: "Title bar text, UTF-8.", pt: "Texto da barra de título, UTF-8." } },
      { name: "w", type: "int", desc: { en: "Width in window coordinates (not always pixels: see SDL_GetWindowSizeInPixels).", pt: "Largura em coordenadas de janela (nem sempre pixels: veja SDL_GetWindowSizeInPixels)." } },
      { name: "h", type: "int", desc: { en: "Height in window coordinates.", pt: "Altura em coordenadas de janela." } },
      {
        name: "flags",
        type: "SDL_WindowFlags",
        desc: { en: "0, or flags combined with `|`.", pt: "0, ou flags combinadas com `|`." },
        values: [
          { name: "SDL_WINDOW_RESIZABLE", desc: { en: "The user can resize it.", pt: "O usuário pode redimensionar." } },
          { name: "SDL_WINDOW_HIGH_PIXEL_DENSITY", desc: { en: "Ask for the full pixel resolution on Retina / high-DPI screens.", pt: "Pede a resolução completa em pixels em telas Retina / de alta densidade." } },
          { name: "SDL_WINDOW_FULLSCREEN", desc: { en: "Start in full screen (desktop resolution).", pt: "Começa em tela cheia (resolução da área de trabalho)." } },
          { name: "SDL_WINDOW_OPENGL / SDL_WINDOW_VULKAN", desc: { en: "The window will be used with an OpenGL context / a Vulkan surface.", pt: "A janela será usada com um contexto OpenGL / uma surface Vulkan." } },
          { name: "SDL_WINDOW_HIDDEN", desc: { en: "Create it invisible; SDL_ShowWindow later.", pt: "Cria invisível; SDL_ShowWindow depois." } },
          { name: "SDL_WINDOW_BORDERLESS", desc: { en: "No title bar or border.", pt: "Sem barra de título nem borda." } },
        ],
      },
    ],
    returns: { en: "The window, or NULL on failure (see SDL_GetError).", pt: "A janela, ou NULL se falhar (veja SDL_GetError)." },
    notes: [
      { en: "The size is a request: a tiling window manager or a small screen may give you another one. Handle any size.", pt: "O tamanho é um pedido: um gerenciador de janelas lado a lado ou uma tela pequena podem dar outro. Trate qualquer tamanho." },
    ],
    example: `SDL_Window* window = SDL_CreateWindow("Editor", 1280, 720,
    SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIGH_PIXEL_DENSITY);
if (!window) {
    SDL_Log("CreateWindow: %s", SDL_GetError());
    return 1;
}
SDL_Renderer* renderer = SDL_CreateRenderer(window, nullptr);`,
    related: ["SDL_DestroyWindow", "SDL_CreateWindowAndRenderer", "SDL_CreateRenderer", "SDL_GetWindowSizeInPixels"],
    khronos: `${WIKI}SDL_CreateWindow`,
  },
  {
    name: "SDL_DestroyWindow",
    category: "video",
    since: "SDL 3.2",
    signature: "void SDL_DestroyWindow(SDL_Window *window);",
    summary: {
      en: "Closes a window and frees it.",
      pt: "Fecha uma janela e a libera.",
    },
    description: {
      en: "Destroy what draws into the window first: its renderer (SDL_DestroyRenderer), its OpenGL context or its Vulkan surface. Then the window, then SDL_Quit at the very end.\n\nIn C++ a std::unique_ptr with a deleter that calls this function makes the order automatic.",
      pt: "Destrua antes o que desenha na janela: o renderer (SDL_DestroyRenderer), o contexto OpenGL ou a surface Vulkan. Depois a janela, e SDL_Quit bem no fim.\n\nEm C++ um std::unique_ptr com um deleter que chama esta função torna a ordem automática.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to destroy.", pt: "A janela a destruir." } },
    ],
    example: `struct SdlDeleter {
    void operator()(SDL_Window* w) const noexcept { SDL_DestroyWindow(w); }
};
std::unique_ptr<SDL_Window, SdlDeleter> window{SDL_CreateWindow("App", 800, 600, 0)};`,
    related: ["SDL_CreateWindow", "SDL_DestroyRenderer", "SDL_Quit"],
    khronos: `${WIKI}SDL_DestroyWindow`,
  },
  {
    name: "SDL_GetWindowSize",
    category: "video",
    since: "SDL 3.2",
    signature: "bool SDL_GetWindowSize(SDL_Window *window, int *w, int *h);",
    summary: {
      en: "Reads the size of the window's content area in WINDOW coordinates (the units of mouse events).",
      pt: "Lê o tamanho da área de conteúdo da janela em coordenadas de JANELA (as unidades dos eventos de mouse).",
    },
    description: {
      en: "SDL has two units. Window coordinates are what you pass to SDL_CreateWindow and what mouse events report. Pixels are the real dots. On a Retina Mac with SDL_WINDOW_HIGH_PIXEL_DENSITY, a 800×600 window has 1600×1200 pixels.\n\nUse this size to make sense of mouse positions. For anything that draws (viewports, render targets, GPU textures), use SDL_GetWindowSizeInPixels.",
      pt: "O SDL tem duas unidades. Coordenadas de janela são o que você passa para SDL_CreateWindow e o que os eventos de mouse informam. Pixels são os pontos reais. Num Mac Retina com SDL_WINDOW_HIGH_PIXEL_DENSITY, uma janela de 800×600 tem 1600×1200 pixels.\n\nUse este tamanho para interpretar posições do mouse. Para tudo o que desenha (viewports, render targets, texturas da GPU), use SDL_GetWindowSizeInPixels.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to measure.", pt: "A janela a medir." } },
      { name: "w", type: "int *", desc: { en: "Where to write the width, or NULL.", pt: "Onde escrever a largura, ou NULL." } },
      { name: "h", type: "int *", desc: { en: "Where to write the height, or NULL.", pt: "Onde escrever a altura, ou NULL." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `int w, h;
SDL_GetWindowSize(window, &w, &h);
float u = e.motion.x / w;   // 0..1 across the window`,
    related: ["SDL_GetWindowSizeInPixels", "SDL_GetMouseState"],
    khronos: `${WIKI}SDL_GetWindowSize`,
  },
  {
    name: "SDL_GetWindowSizeInPixels",
    category: "video",
    since: "SDL 3.2",
    signature: "bool SDL_GetWindowSizeInPixels(SDL_Window *window, int *w, int *h);",
    summary: {
      en: "Reads the size of the window's drawing area in real PIXELS: what OpenGL, Vulkan and SDL_GPU draw into.",
      pt: "Lê o tamanho da área de desenho da janela em PIXELS reais: onde OpenGL, Vulkan e SDL_GPU desenham.",
    },
    description: {
      en: "Pass this size to glViewport, to the Vulkan swapchain extent, or use it to size an offscreen texture. It changes when the window is resized or dragged to a monitor with another density; the event SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED tells you when.",
      pt: "Passe este tamanho para glViewport, para o extent da swapchain do Vulkan, ou use para dimensionar uma textura fora da tela. Ele muda quando a janela é redimensionada ou arrastada para um monitor com outra densidade; o evento SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED avisa quando.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to measure.", pt: "A janela a medir." } },
      { name: "w", type: "int *", desc: { en: "Where to write the width in pixels, or NULL.", pt: "Onde escrever a largura em pixels, ou NULL." } },
      { name: "h", type: "int *", desc: { en: "Where to write the height in pixels, or NULL.", pt: "Onde escrever a altura em pixels, ou NULL." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    notes: [
      { en: "A minimized window can report 0×0. Skip the frame: a swapchain or a projection with 0 height is invalid.", pt: "Uma janela minimizada pode informar 0×0. Pule o quadro: uma swapchain ou uma projeção com altura 0 é inválida." },
    ],
    example: `if (e.type == SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED) {
    int pw, ph;
    SDL_GetWindowSizeInPixels(window, &pw, &ph);
    glViewport(0, 0, pw, ph);
}`,
    related: ["SDL_GetWindowSize", "SDL_GetWindowDisplayScale"],
    khronos: `${WIKI}SDL_GetWindowSizeInPixels`,
  },
  {
    name: "SDL_SetWindowTitle",
    category: "video",
    since: "SDL 3.2",
    signature: "bool SDL_SetWindowTitle(SDL_Window *window, const char *title);",
    summary: {
      en: "Changes the text in the window's title bar.",
      pt: "Muda o texto da barra de título da janela.",
    },
    description: {
      en: "Useful for showing the frame rate or the open file's name during development. Update it a few times per second at most: on some systems the call is slow.",
      pt: "Útil para mostrar a taxa de quadros ou o nome do arquivo aberto durante o desenvolvimento. Atualize no máximo algumas vezes por segundo: em alguns sistemas a chamada é lenta.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to rename.", pt: "A janela a renomear." } },
      { name: "title", type: "const char *", desc: { en: "The new title, UTF-8. SDL copies it.", pt: "O novo título, UTF-8. O SDL copia." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `char title[64];
SDL_snprintf(title, sizeof title, "Game - %.0f fps", fps);
SDL_SetWindowTitle(window, title);`,
    related: ["SDL_CreateWindow"],
    khronos: `${WIKI}SDL_SetWindowTitle`,
  },
  {
    name: "SDL_SetWindowPosition",
    category: "video",
    since: "SDL 3.2",
    signature: "bool SDL_SetWindowPosition(SDL_Window *window, int x, int y);",
    summary: {
      en: "Asks to move the window. SDL_WINDOWPOS_CENTERED centers it on its display.",
      pt: "Pede para mover a janela. SDL_WINDOWPOS_CENTERED a centraliza no monitor dela.",
    },
    description: {
      en: "x and y are the top-left corner of the content area, in desktop coordinates. Instead of numbers you can pass SDL_WINDOWPOS_CENTERED for either axis, and SDL does the centering math for you.\n\nIt is a request. On some systems the move happens later (wait for SDL_EVENT_WINDOW_MOVED), the system may keep the window on screen, and Wayland does not let applications place windows at all.",
      pt: "x e y são o canto superior esquerdo da área de conteúdo, em coordenadas da área de trabalho. Em vez de números você pode passar SDL_WINDOWPOS_CENTERED em qualquer eixo, e o SDL faz a conta da centralização por você.\n\nÉ um pedido. Em alguns sistemas o movimento acontece depois (espere SDL_EVENT_WINDOW_MOVED), o sistema pode manter a janela dentro da tela, e o Wayland não deixa aplicações posicionarem janelas.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to move.", pt: "A janela a mover." } },
      { name: "x", type: "int", desc: { en: "New x, or SDL_WINDOWPOS_CENTERED / SDL_WINDOWPOS_UNDEFINED.", pt: "Novo x, ou SDL_WINDOWPOS_CENTERED / SDL_WINDOWPOS_UNDEFINED." } },
      { name: "y", type: "int", desc: { en: "New y (down is positive), or SDL_WINDOWPOS_CENTERED / SDL_WINDOWPOS_UNDEFINED.", pt: "Novo y (para baixo é positivo), ou SDL_WINDOWPOS_CENTERED / SDL_WINDOWPOS_UNDEFINED." } },
    ],
    returns: { en: "`true` if the request was made, `false` on failure.", pt: "`true` se o pedido foi feito, `false` se falhou." },
    example: `SDL_SetWindowPosition(window, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED);`,
    related: ["SDL_CreateWindow"],
    khronos: `${WIKI}SDL_SetWindowPosition`,
  },
  {
    name: "SDL_GetWindowDisplayScale",
    category: "video",
    since: "SDL 3.2",
    signature: "float SDL_GetWindowDisplayScale(SDL_Window *window);",
    summary: {
      en: "The scale at which content in this window should be drawn, e.g. 2.0 on a Retina screen or at 200%.",
      pt: "A escala em que o conteúdo desta janela deve ser desenhado, ex.: 2.0 numa tela Retina ou em 200%.",
    },
    description: {
      en: "It combines two things: the pixel density (how many pixels per window unit) and the user's scaling setting (125%, 150%…). Multiply your text and interface sizes by it, and they look as big as the rest of the system.\n\nExample: a 3840×2160-pixel window with scale 2.0 should look like a 1920×1080 window at scale 1.0.",
      pt: "Ela combina duas coisas: a densidade de pixels (quantos pixels por unidade de janela) e a escala que o usuário escolheu (125%, 150%…). Multiplique os tamanhos de texto e interface por ela, e eles parecem do mesmo tamanho que o resto do sistema.\n\nExemplo: uma janela de 3840×2160 pixels com escala 2.0 deve parecer uma janela de 1920×1080 com escala 1.0.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to ask about.", pt: "A janela a consultar." } },
    ],
    returns: { en: "The scale, or 0.0f on failure.", pt: "A escala, ou 0.0f se falhar." },
    notes: [
      { en: "It changes when the window moves to another monitor: SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED tells you.", pt: "Ela muda quando a janela vai para outro monitor: SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED avisa." },
    ],
    example: `float scale = SDL_GetWindowDisplayScale(window);
TTF_SetFontSize(font, 16.0f * scale);`,
    related: ["SDL_GetWindowSizeInPixels", "SDL_GetWindowSize"],
    khronos: `${WIKI}SDL_GetWindowDisplayScale`,
  },
  {
    name: "SDL_GetDisplayForWindow",
    category: "video",
    since: "SDL 3.2",
    signature: "SDL_DisplayID SDL_GetDisplayForWindow(SDL_Window *window);",
    summary: {
      en: "Tells which monitor (display) the window is on.",
      pt: "Diz em qual monitor (display) a janela está.",
    },
    description: {
      en: "Display functions such as SDL_GetCurrentDisplayMode take an SDL_DisplayID, a number naming one monitor. This gets the one the window is mostly on. SDL_GetPrimaryDisplay gives the main monitor instead.",
      pt: "Funções de display como SDL_GetCurrentDisplayMode recebem um SDL_DisplayID, um número que identifica um monitor. Esta pega aquele em que a janela está em maior parte. SDL_GetPrimaryDisplay dá o monitor principal.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window.", pt: "A janela." } },
    ],
    returns: { en: "The display ID, or 0 on failure.", pt: "O ID do display, ou 0 se falhar." },
    example: `SDL_DisplayID display = SDL_GetDisplayForWindow(window);
const SDL_DisplayMode* mode = SDL_GetCurrentDisplayMode(display);`,
    related: ["SDL_GetCurrentDisplayMode"],
    khronos: `${WIKI}SDL_GetDisplayForWindow`,
  },
  {
    name: "SDL_GetCurrentDisplayMode",
    category: "video",
    since: "SDL 3.2",
    signature: "const SDL_DisplayMode * SDL_GetCurrentDisplayMode(SDL_DisplayID displayID);",
    summary: {
      en: "Reads a monitor's current resolution and refresh rate.",
      pt: "Lê a resolução e a taxa de atualização atuais de um monitor.",
    },
    description: {
      en: "The SDL_DisplayMode has `w` and `h` (size), `pixel_density` (pixels per unit), `refresh_rate` (a float in Hz, e.g. 59.94f; 0 if unknown) and `format`.\n\nThe refresh rate tells you the frame budget: at 60 Hz each frame has 1000 / 60 ≈ 16.7 ms.",
      pt: "O SDL_DisplayMode tem `w` e `h` (tamanho), `pixel_density` (pixels por unidade), `refresh_rate` (um float em Hz, ex.: 59.94f; 0 se desconhecida) e `format`.\n\nA taxa de atualização diz o orçamento de cada quadro: a 60 Hz cada quadro tem 1000 / 60 ≈ 16,7 ms.",
    },
    params: [
      { name: "displayID", type: "SDL_DisplayID", desc: { en: "The monitor, from SDL_GetDisplayForWindow or SDL_GetPrimaryDisplay.", pt: "O monitor, vindo de SDL_GetDisplayForWindow ou SDL_GetPrimaryDisplay." } },
    ],
    returns: { en: "A pointer owned by SDL (do not free), or NULL on failure.", pt: "Um ponteiro do SDL (não libere), ou NULL se falhar." },
    example: `const SDL_DisplayMode* mode = SDL_GetCurrentDisplayMode(SDL_GetDisplayForWindow(window));
if (mode) SDL_Log("%dx%d @ %.2f Hz", mode->w, mode->h, mode->refresh_rate);`,
    related: ["SDL_GetDisplayForWindow"],
    khronos: `${WIKI}SDL_GetCurrentDisplayMode`,
  },
  {
    name: "SDL_GetWindowFlags",
    category: "video",
    since: "SDL 3.2",
    signature: "SDL_WindowFlags SDL_GetWindowFlags(SDL_Window *window);",
    summary: {
      en: "Reads the window's current state as flags: minimized, full screen, has focus…",
      pt: "Lê o estado atual da janela como flags: minimizada, em tela cheia, com foco…",
    },
    description: {
      en: "Test single bits with `&`. A common use is to stop rendering while the window is minimized (SDL_WINDOW_MINIMIZED), which saves battery and avoids zero-sized swapchains, or to pause the game when it loses keyboard focus (SDL_WINDOW_INPUT_FOCUS not set).",
      pt: "Teste bits isolados com `&`. Um uso comum é parar de renderizar enquanto a janela está minimizada (SDL_WINDOW_MINIMIZED), o que poupa bateria e evita swapchains de tamanho zero, ou pausar o jogo quando ele perde o foco do teclado (SDL_WINDOW_INPUT_FOCUS desligado).",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window to ask about.", pt: "A janela a consultar." } },
    ],
    returns: { en: "A mask of SDL_WINDOW_… flags.", pt: "Uma máscara de flags SDL_WINDOW_…." },
    example: `if (SDL_GetWindowFlags(window) & SDL_WINDOW_MINIMIZED) {
    SDL_DelayNS(SDL_MS_TO_NS(10));   // nothing to draw
    continue;
}`,
    related: ["SDL_CreateWindow"],
    khronos: `${WIKI}SDL_GetWindowFlags`,
  },
];

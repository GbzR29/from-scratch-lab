// src/lib/reference/sdl3/init.ts
// SDL 3.2: starting and stopping SDL, errors, hints, memory, and the main callbacks.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const initEntries: RefEntry[] = [
  {
    name: "SDL_Init",
    category: "init",
    since: "SDL 3.2",
    signature: "bool SDL_Init(SDL_InitFlags flags);",
    summary: {
      en: "Starts the parts of SDL you ask for (video, audio, gamepads…). The first SDL call of a program.",
      pt: "Inicia as partes do SDL que você pede (vídeo, áudio, controles…). A primeira chamada SDL de um programa.",
    },
    description: {
      en: "SDL is split into subsystems. You start only the ones you use by combining flags with a bitwise or (`|`). Some flags bring others along: video, audio and joystick all start the event system too.\n\nIn SDL3 it returns a bool: `true` means success. (SDL2 returned 0 for success, so `if (SDL_Init(...) < 0)` from old tutorials is now wrong.)",
      pt: "O SDL é dividido em subsistemas. Você inicia só os que usa, combinando flags com um ou bit a bit (`|`). Algumas flags trazem outras junto: vídeo, áudio e joystick também iniciam o sistema de eventos.\n\nNo SDL3 ela retorna um bool: `true` significa sucesso. (O SDL2 retornava 0 para sucesso, então `if (SDL_Init(...) < 0)` de tutoriais antigos agora está errado.)",
    },
    params: [
      {
        name: "flags",
        type: "SDL_InitFlags",
        desc: { en: "The subsystems to start, combined with `|`.", pt: "Os subsistemas a iniciar, combinados com `|`." },
        values: [
          { name: "SDL_INIT_VIDEO", desc: { en: "Windows, renderer, OpenGL/Vulkan/GPU, keyboard and mouse. Start it on the main thread.", pt: "Janelas, renderer, OpenGL/Vulkan/GPU, teclado e mouse. Inicie na thread principal." } },
          { name: "SDL_INIT_AUDIO", desc: { en: "Audio playback and recording.", pt: "Reprodução e gravação de áudio." } },
          { name: "SDL_INIT_GAMEPAD", desc: { en: "Gamepads with a standard layout (also starts SDL_INIT_JOYSTICK).", pt: "Controles com layout padrão (também inicia SDL_INIT_JOYSTICK)." } },
          { name: "SDL_INIT_JOYSTICK", desc: { en: "Raw joysticks: any axes and buttons, no standard names.", pt: "Joysticks brutos: quaisquer eixos e botões, sem nomes padrão." } },
          { name: "SDL_INIT_HAPTIC", desc: { en: "Force feedback devices.", pt: "Dispositivos de force feedback." } },
          { name: "SDL_INIT_EVENTS", desc: { en: "Only the event queue (started by most other flags anyway).", pt: "Só a fila de eventos (já iniciada pela maioria das outras flags)." } },
          { name: "SDL_INIT_SENSOR / SDL_INIT_CAMERA", desc: { en: "Accelerometer/gyroscope, and webcams.", pt: "Acelerômetro/giroscópio, e webcams." } },
        ],
      },
    ],
    returns: {
      en: "`true` on success, `false` on failure. On failure, SDL_GetError says why.",
      pt: "`true` se deu certo, `false` se falhou. Na falha, SDL_GetError diz por quê.",
    },
    notes: [
      { en: "There is no SDL_INIT_TIMER in SDL3: the clock (SDL_GetTicks) always works.", pt: "Não existe SDL_INIT_TIMER no SDL3: o relógio (SDL_GetTicks) sempre funciona." },
      { en: "Pair it with one SDL_Quit at the end of the program.", pt: "Faça par com um SDL_Quit no fim do programa." },
    ],
    example: `if (!SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_GAMEPAD)) {
    SDL_Log("SDL_Init failed: %s", SDL_GetError());
    return 1;
}
// ...
SDL_Quit();`,
    related: ["SDL_Quit", "SDL_InitSubSystem", "SDL_GetError", "SDL_AppInit"],
    khronos: `${WIKI}SDL_Init`,
  },
  {
    name: "SDL_InitSubSystem",
    category: "init",
    since: "SDL 3.2",
    signature: "bool SDL_InitSubSystem(SDL_InitFlags flags);",
    summary: {
      en: "Starts more subsystems after SDL is already running, e.g. audio only when the game reaches its menu.",
      pt: "Inicia mais subsistemas com o SDL já rodando, ex.: o áudio só quando o jogo chega ao menu.",
    },
    description: {
      en: "It takes the same flags as SDL_Init and works the same way: SDL_Init simply calls it. Use it to delay a slow subsystem, or one the user may never need. SDL_QuitSubSystem stops it again early; otherwise SDL_Quit stops everything.",
      pt: "Recebe as mesmas flags de SDL_Init e funciona do mesmo jeito. SDL_Init simplesmente a chama. Use para adiar um subsistema lento, ou um que o usuário talvez nunca precise. SDL_QuitSubSystem o encerra antes; senão SDL_Quit encerra tudo.",
    },
    params: [
      { name: "flags", type: "SDL_InitFlags", desc: { en: "The subsystems to start, e.g. SDL_INIT_AUDIO.", pt: "Os subsistemas a iniciar, ex.: SDL_INIT_AUDIO." } },
    ],
    returns: { en: "`true` on success, `false` on failure (see SDL_GetError).", pt: "`true` se deu certo, `false` se falhou (veja SDL_GetError)." },
    example: `SDL_Init(SDL_INIT_VIDEO);            // window first, fast start
// ... later, entering the options menu:
if (!SDL_InitSubSystem(SDL_INIT_AUDIO))
    SDL_Log("no audio: %s", SDL_GetError());`,
    related: ["SDL_Init", "SDL_Quit"],
    khronos: `${WIKI}SDL_InitSubSystem`,
  },
  {
    name: "SDL_Quit",
    category: "init",
    since: "SDL 3.2",
    signature: "void SDL_Quit(void);",
    summary: {
      en: "Shuts down every SDL subsystem that is still running. The last SDL call of a program.",
      pt: "Encerra todo subsistema do SDL ainda ligado. A última chamada SDL de um programa.",
    },
    description: {
      en: "Destroy your own objects first (textures, renderer, window), then call SDL_Quit. It restores the screen mode if you changed it and releases the devices SDL opened.\n\nIt is safe to call even when SDL_Init failed, so an early `return` path can call it too.",
      pt: "Destrua seus objetos primeiro (texturas, renderer, janela) e depois chame SDL_Quit. Ela restaura o modo de tela se você mudou e libera os dispositivos que o SDL abriu.\n\nÉ seguro chamar mesmo quando SDL_Init falhou, então um caminho de `return` antecipado também pode chamá-la.",
    },
    params: [],
    notes: [
      { en: "With the SDL_AppInit callbacks, SDL calls SDL_Quit for you after SDL_AppQuit returns.", pt: "Com os callbacks SDL_AppInit, o SDL chama SDL_Quit por você depois que SDL_AppQuit retorna." },
    ],
    example: `SDL_DestroyTexture(sprite);
SDL_DestroyRenderer(renderer);
SDL_DestroyWindow(window);
SDL_Quit();`,
    related: ["SDL_Init", "SDL_DestroyWindow", "SDL_AppQuit"],
    khronos: `${WIKI}SDL_Quit`,
  },
  {
    name: "SDL_GetError",
    category: "init",
    since: "SDL 3.2",
    signature: "const char * SDL_GetError(void);",
    summary: {
      en: "Returns a readable message about the last SDL error on this thread.",
      pt: "Retorna uma mensagem legível sobre o último erro do SDL nesta thread.",
    },
    description: {
      en: "Most SDL3 functions return `false` or NULL when they fail, and store the reason as text. SDL_GetError reads that text.\n\nCheck the return value FIRST. SDL does not clear the message when a call succeeds, so a non-empty SDL_GetError() on its own proves nothing: it may be an old message, or an internal warning from a call that worked.",
      pt: "A maioria das funções do SDL3 retorna `false` ou NULL quando falha e guarda o motivo como texto. SDL_GetError lê esse texto.\n\nConfira o valor de retorno PRIMEIRO. O SDL não apaga a mensagem quando uma chamada dá certo, então um SDL_GetError() não vazio sozinho não prova nada: pode ser uma mensagem antiga, ou um aviso interno de uma chamada que funcionou.",
    },
    params: [],
    returns: {
      en: "The message (empty string if none). It stays valid until the next error on this thread; copy it to keep it.",
      pt: "A mensagem (string vazia se não houver). Vale até o próximo erro nesta thread; copie para guardar.",
    },
    example: `SDL_Texture* tex = SDL_CreateTextureFromSurface(renderer, surface);
if (!tex) {                                   // check the result first
    SDL_Log("texture failed: %s", SDL_GetError());
}`,
    related: ["SDL_Log", "SDL_Init"],
    khronos: `${WIKI}SDL_GetError`,
  },
  {
    name: "SDL_SetHint",
    category: "init",
    since: "SDL 3.2",
    signature: "bool SDL_SetHint(const char *name, const char *value);",
    summary: {
      en: "Changes one of SDL's many fine-tuning options, given as a name and a text value.",
      pt: "Muda uma das muitas opções de ajuste fino do SDL, dada como nome e valor em texto.",
    },
    description: {
      en: "Hints adjust behaviour that has no function of its own: whether the renderer uses vsync, whether a full-screen window minimizes when it loses focus, which audio driver to try… Each hint has a constant name SDL_HINT_… and takes a string value, often \"0\" or \"1\".\n\nMost hints are read when the thing they affect is created, so set them BEFORE SDL_Init, SDL_CreateWindow or SDL_CreateRenderer. Environment variables with the same name win over SDL_SetHint, which lets a user override your choice.",
      pt: "Hints ajustam comportamentos que não têm função própria: se o renderer usa vsync, se uma janela em tela cheia minimiza ao perder o foco, qual driver de áudio tentar… Cada hint tem um nome constante SDL_HINT_… e recebe um valor em texto, muitas vezes \"0\" ou \"1\".\n\nA maioria dos hints é lida quando a coisa que eles afetam é criada, então defina ANTES de SDL_Init, SDL_CreateWindow ou SDL_CreateRenderer. Variáveis de ambiente com o mesmo nome vencem SDL_SetHint, o que deixa o usuário sobrepor a sua escolha.",
    },
    params: [
      {
        name: "name",
        type: "const char *",
        desc: { en: "The hint, as an SDL_HINT_… constant.", pt: "O hint, como uma constante SDL_HINT_…." },
        values: [
          { name: "SDL_HINT_RENDER_VSYNC", desc: { en: "\"1\": renderers created later sync to the monitor.", pt: "\"1\": renderers criados depois sincronizam com o monitor." } },
          { name: "SDL_HINT_VIDEO_MINIMIZE_ON_FOCUS_LOSS", desc: { en: "\"0\": a full-screen window stays visible when you click into the debugger.", pt: "\"0\": uma janela em tela cheia continua visível quando você clica no depurador." } },
          { name: "SDL_HINT_RENDER_DRIVER", desc: { en: "Which renderer backend to prefer, e.g. \"vulkan\", \"opengl\", \"direct3d11\".", pt: "Qual backend de renderer preferir, ex.: \"vulkan\", \"opengl\", \"direct3d11\"." } },
          { name: "SDL_HINT_APP_NAME", desc: { en: "Your program's name, shown e.g. in the system's audio mixer.", pt: "O nome do seu programa, mostrado ex.: no mixer de áudio do sistema." } },
        ],
      },
      { name: "value", type: "const char *", desc: { en: "The new value as text. SDL copies it.", pt: "O novo valor em texto. O SDL copia." } },
    ],
    returns: {
      en: "`true` on success, `false` on failure (see SDL_GetError).",
      pt: "`true` se deu certo, `false` se falhou (veja SDL_GetError).",
    },
    example: `SDL_SetHint(SDL_HINT_APP_NAME, "Space Miner");
SDL_SetHint(SDL_HINT_VIDEO_MINIMIZE_ON_FOCUS_LOSS, "0");
SDL_Init(SDL_INIT_VIDEO);`,
    related: ["SDL_Init", "SDL_CreateRenderer"],
    khronos: `${WIKI}SDL_SetHint`,
  },
  {
    name: "SDL_free",
    category: "init",
    since: "SDL 3.2",
    signature: "void SDL_free(void *mem);",
    summary: {
      en: "Frees memory that an SDL function allocated and handed to you.",
      pt: "Libera memória que uma função do SDL alocou e entregou a você.",
    },
    description: {
      en: "Some SDL functions return a block of memory that becomes yours: SDL_LoadFile, SDL_LoadWAV, SDL_GetPrefPath. Free those with SDL_free, not with `free` or `delete`. SDL may use its own allocator, and mixing allocators corrupts memory.\n\nEach function's page says whether its result must be freed. Read-only results such as SDL_GetBasePath or SDL_GetError are owned by SDL and must NOT be freed.",
      pt: "Algumas funções do SDL retornam um bloco de memória que passa a ser seu: SDL_LoadFile, SDL_LoadWAV, SDL_GetPrefPath. Libere esses com SDL_free, não com `free` ou `delete`. O SDL pode usar o próprio alocador, e misturar alocadores corrompe a memória.\n\nA página de cada função diz se o resultado precisa ser liberado. Resultados só de leitura, como SDL_GetBasePath ou SDL_GetError, pertencem ao SDL e NÃO devem ser liberados.",
    },
    params: [
      { name: "mem", type: "void *", desc: { en: "The pointer SDL gave you. NULL is allowed and does nothing.", pt: "O ponteiro que o SDL te deu. NULL é aceito e não faz nada." } },
    ],
    example: `char* prefs = SDL_GetPrefPath("MyStudio", "MyGame");
std::string savePath = std::string(prefs) + "save1.dat";
SDL_free(prefs);`,
    related: ["SDL_LoadFile", "SDL_GetPrefPath", "SDL_LoadWAV"],
    khronos: `${WIKI}SDL_free`,
  },
  {
    name: "SDL_AppInit",
    category: "init",
    since: "SDL 3.2",
    signature: "SDL_AppResult SDL_AppInit(void **appstate, int argc, char *argv[]);",
    summary: {
      en: "A function YOU write: SDL calls it once at startup when you use the main callbacks instead of main().",
      pt: "Uma função que VOCÊ escreve: o SDL a chama uma vez na partida quando você usa os callbacks principais em vez de main().",
    },
    description: {
      en: "SDL3 offers a second way to structure a program. Instead of writing `main()` with your own `while` loop, you `#define SDL_MAIN_USE_CALLBACKS` before `#include <SDL3/SDL_main.h>` and write four functions: SDL_AppInit (start), SDL_AppEvent (one event), SDL_AppIterate (one frame) and SDL_AppQuit (end). SDL owns the loop.\n\nWhy: on the web (Emscripten), iOS and some consoles a program may not block in its own endless loop. With callbacks the same code runs everywhere.\n\nIn SDL_AppInit you call SDL_Init and create the window. Store your state in a struct and put its address in `*appstate`: SDL passes it back to the other three callbacks.",
      pt: "O SDL3 oferece um segundo jeito de estruturar um programa. Em vez de escrever `main()` com o seu próprio laço `while`, você faz `#define SDL_MAIN_USE_CALLBACKS` antes de `#include <SDL3/SDL_main.h>` e escreve quatro funções: SDL_AppInit (início), SDL_AppEvent (um evento), SDL_AppIterate (um quadro) e SDL_AppQuit (fim). O SDL é dono do laço.\n\nPor quê: na web (Emscripten), no iOS e em alguns consoles um programa não pode travar num laço infinito próprio. Com callbacks o mesmo código roda em todo lugar.\n\nEm SDL_AppInit você chama SDL_Init e cria a janela. Guarde o seu estado numa struct e coloque o endereço em `*appstate`: o SDL o devolve aos outros três callbacks.",
    },
    params: [
      { name: "appstate", type: "void **", desc: { en: "Where to store a pointer to your app state. SDL passes it to the other callbacks.", pt: "Onde guardar um ponteiro para o estado da aplicação. O SDL o passa para os outros callbacks." } },
      { name: "argc", type: "int", desc: { en: "Number of command-line arguments, as in main().", pt: "Número de argumentos da linha de comando, como em main()." } },
      { name: "argv", type: "char *", desc: { en: "The command-line arguments, as in main().", pt: "Os argumentos da linha de comando, como em main()." } },
    ],
    returns: {
      en: "SDL_APP_CONTINUE to start running, SDL_APP_FAILURE to quit with an error, SDL_APP_SUCCESS to quit normally.",
      pt: "SDL_APP_CONTINUE para começar a rodar, SDL_APP_FAILURE para sair com erro, SDL_APP_SUCCESS para sair normalmente.",
    },
    example: `#define SDL_MAIN_USE_CALLBACKS
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>

struct App { SDL_Window* window; SDL_Renderer* renderer; };

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    if (!SDL_Init(SDL_INIT_VIDEO)) return SDL_APP_FAILURE;
    auto* app = new App{};
    if (!SDL_CreateWindowAndRenderer("Game", 1280, 720, 0, &app->window, &app->renderer))
        return SDL_APP_FAILURE;
    *appstate = app;
    return SDL_APP_CONTINUE;
}`,
    related: ["SDL_AppIterate", "SDL_AppEvent", "SDL_AppQuit", "SDL_Init"],
    khronos: `${WIKI}SDL_AppInit`,
  },
  {
    name: "SDL_AppIterate",
    category: "init",
    since: "SDL 3.2",
    signature: "SDL_AppResult SDL_AppIterate(void *appstate);",
    summary: {
      en: "A function YOU write: SDL calls it once per frame to update and draw.",
      pt: "Uma função que VOCÊ escreve: o SDL a chama uma vez por quadro para atualizar e desenhar.",
    },
    description: {
      en: "This is the body of your old `while` loop, minus the event handling (that moved to SDL_AppEvent). Measure the time since the last frame, update the game, draw, present, return.\n\nSDL calls it as fast as it can, or at the monitor's rate if vsync is on. Return quickly: blocking here freezes the window.",
      pt: "Este é o corpo do seu antigo laço `while`, sem o tratamento de eventos (que foi para SDL_AppEvent). Meça o tempo desde o último quadro, atualize o jogo, desenhe, apresente e retorne.\n\nO SDL a chama o mais rápido que pode, ou na taxa do monitor se o vsync estiver ligado. Retorne rápido: travar aqui congela a janela.",
    },
    params: [
      { name: "appstate", type: "void *", desc: { en: "The pointer you stored in SDL_AppInit.", pt: "O ponteiro que você guardou em SDL_AppInit." } },
    ],
    returns: {
      en: "SDL_APP_CONTINUE to keep going; SDL_APP_SUCCESS or SDL_APP_FAILURE to end the program.",
      pt: "SDL_APP_CONTINUE para continuar; SDL_APP_SUCCESS ou SDL_APP_FAILURE para encerrar o programa.",
    },
    example: `SDL_AppResult SDL_AppIterate(void* appstate) {
    auto* app = static_cast<App*>(appstate);
    Uint64 now = SDL_GetTicksNS();
    float dt = (now - app->lastTick) / 1e9f;
    app->lastTick = now;
    update(*app, dt);
    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);
    draw(*app);
    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}`,
    related: ["SDL_AppInit", "SDL_AppEvent", "SDL_GetTicksNS"],
    khronos: `${WIKI}SDL_AppIterate`,
  },
  {
    name: "SDL_AppEvent",
    category: "init",
    since: "SDL 3.2",
    signature: "SDL_AppResult SDL_AppEvent(void *appstate, SDL_Event *event);",
    summary: {
      en: "A function YOU write: SDL calls it once for every event (key, mouse, quit…).",
      pt: "Uma função que VOCÊ escreve: o SDL a chama uma vez para cada evento (tecla, mouse, sair…).",
    },
    description: {
      en: "It replaces the `while (SDL_PollEvent(&e))` loop: SDL polls for you and hands over each event. Look at `event->type` and react.\n\nThe close button arrives as SDL_EVENT_QUIT. Return SDL_APP_SUCCESS for it, and the program ends cleanly through SDL_AppQuit.",
      pt: "Ela substitui o laço `while (SDL_PollEvent(&e))`: o SDL consulta por você e entrega cada evento. Olhe `event->type` e reaja.\n\nO botão de fechar chega como SDL_EVENT_QUIT. Retorne SDL_APP_SUCCESS para ele, e o programa termina limpo passando por SDL_AppQuit.",
    },
    params: [
      { name: "appstate", type: "void *", desc: { en: "The pointer you stored in SDL_AppInit.", pt: "O ponteiro que você guardou em SDL_AppInit." } },
      { name: "event", type: "SDL_Event *", desc: { en: "The event. Valid only during this call.", pt: "O evento. Vale só durante esta chamada." } },
    ],
    returns: {
      en: "SDL_APP_CONTINUE to keep going; SDL_APP_SUCCESS or SDL_APP_FAILURE to end the program.",
      pt: "SDL_APP_CONTINUE para continuar; SDL_APP_SUCCESS ou SDL_APP_FAILURE para encerrar o programa.",
    },
    notes: [
      { en: "Events SDL itself produces arrive between two SDL_AppIterate calls, one after another. An event YOUR worker thread pushes with SDL_PushEvent can arrive on that thread, at the same time as SDL_AppIterate: protect shared data then.", pt: "Os eventos que o próprio SDL produz chegam entre duas chamadas de SDL_AppIterate, um depois do outro. Um evento que a SUA thread de trabalho envia com SDL_PushEvent pode chegar nessa thread, ao mesmo tempo que SDL_AppIterate: proteja os dados compartilhados nesse caso." },
    ],
    example: `SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    auto* app = static_cast<App*>(appstate);
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_SPACE)
        app->paused = !app->paused;
    return SDL_APP_CONTINUE;
}`,
    related: ["SDL_AppInit", "SDL_AppIterate", "SDL_PollEvent"],
    khronos: `${WIKI}SDL_AppEvent`,
  },
  {
    name: "SDL_AppQuit",
    category: "init",
    since: "SDL 3.2",
    signature: "void SDL_AppQuit(void *appstate, SDL_AppResult result);",
    summary: {
      en: "A function YOU write: SDL calls it once at the end, so you can free everything.",
      pt: "Uma função que VOCÊ escreve: o SDL a chama uma vez no fim, para você liberar tudo.",
    },
    description: {
      en: "It runs after any callback returned SDL_APP_SUCCESS or SDL_APP_FAILURE (the value arrives as `result`). Destroy your textures, renderer and window and delete your state. SDL calls SDL_Quit itself right after, so you do not have to.\n\nIt also runs when SDL_AppInit failed, so `appstate` can be NULL or half-built: check before using it.",
      pt: "Ela roda depois que qualquer callback retornou SDL_APP_SUCCESS ou SDL_APP_FAILURE (o valor chega em `result`). Destrua texturas, renderer e janela e apague o seu estado. O SDL chama SDL_Quit sozinho logo depois, então você não precisa.\n\nEla também roda quando SDL_AppInit falhou, então `appstate` pode ser NULL ou estar pela metade: confira antes de usar.",
    },
    params: [
      { name: "appstate", type: "void *", desc: { en: "The pointer you stored in SDL_AppInit (may be NULL).", pt: "O ponteiro que você guardou em SDL_AppInit (pode ser NULL)." } },
      { name: "result", type: "SDL_AppResult", desc: { en: "SDL_APP_SUCCESS or SDL_APP_FAILURE: why the program is ending.", pt: "SDL_APP_SUCCESS ou SDL_APP_FAILURE: por que o programa está terminando." } },
    ],
    example: `void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    auto* app = static_cast<App*>(appstate);
    if (app) {
        SDL_DestroyRenderer(app->renderer);
        SDL_DestroyWindow(app->window);
        delete app;
    }
    // SDL_Quit() is called by SDL after this returns
}`,
    related: ["SDL_AppInit", "SDL_Quit", "SDL_DestroyWindow"],
    khronos: `${WIKI}SDL_AppQuit`,
  },
];

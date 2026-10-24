// src/lib/reference/sdl3/logTime.ts
// SDL 3.2: logging, the clock, high-resolution timing and sleeping.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const logTimeEntries: RefEntry[] = [
  {
    name: "SDL_Log",
    category: "log-time",
    since: "SDL 3.2",
    signature: "void SDL_Log(const char *fmt, ...);",
    summary: {
      en: "Prints a message, printf-style, to wherever this platform shows logs.",
      pt: "Imprime uma mensagem, no estilo printf, onde esta plataforma mostra logs.",
    },
    description: {
      en: "It formats like `printf` (`%d`, `%s`, `%.2f`…) and adds a newline. The difference is where the text goes: the terminal on desktop, the debugger's output window in Visual Studio, logcat on Android. `printf` would be lost on some of those.\n\nIt logs in the APPLICATION category with INFO priority. SDL_LogInfo, SDL_LogError and friends choose the category and priority explicitly.",
      pt: "Formata como `printf` (`%d`, `%s`, `%.2f`…) e acrescenta uma quebra de linha. A diferença é para onde o texto vai: o terminal no desktop, a janela de saída do depurador no Visual Studio, o logcat no Android. O `printf` se perderia em alguns desses.\n\nEla registra na categoria APPLICATION com prioridade INFO. SDL_LogInfo, SDL_LogError e parentes escolhem a categoria e a prioridade explicitamente.",
    },
    params: [
      { name: "fmt", type: "const char *", desc: { en: "A printf format string, followed by its values.", pt: "Uma string de formato do printf, seguida dos valores." } },
    ],
    example: `SDL_Log("window %dx%d, scale %.2f", w, h, SDL_GetWindowDisplayScale(window));
SDL_Log("SDL_Init failed: %s", SDL_GetError());`,
    related: ["SDL_LogInfo", "SDL_LogError", "SDL_GetError"],
    khronos: `${WIKI}SDL_Log`,
  },
  {
    name: "SDL_LogInfo",
    category: "log-time",
    since: "SDL 3.2",
    signature: "void SDL_LogInfo(int category, const char *fmt, ...);",
    summary: {
      en: "Logs an informational message in a category of your choice.",
      pt: "Registra uma mensagem informativa numa categoria escolhida por você.",
    },
    description: {
      en: "Categories group messages (application, audio, render, input…) so you can make one area more verbose without drowning in the others. Priorities rank them: VERBOSE, DEBUG, INFO, WARN, ERROR, CRITICAL. A message is shown only if its priority is at least the category's current level (set with SDL_SetLogPriority).\n\nSDL_LogVerbose, SDL_LogDebug, SDL_LogWarn and SDL_LogCritical work the same way at the other priorities.",
      pt: "Categorias agrupam mensagens (aplicação, áudio, render, entrada…), para você deixar uma área mais falante sem se afogar nas outras. Prioridades as ordenam: VERBOSE, DEBUG, INFO, WARN, ERROR, CRITICAL. Uma mensagem só aparece se a prioridade dela for pelo menos o nível atual da categoria (definido com SDL_SetLogPriority).\n\nSDL_LogVerbose, SDL_LogDebug, SDL_LogWarn e SDL_LogCritical funcionam do mesmo jeito nas outras prioridades.",
    },
    params: [
      {
        name: "category",
        type: "int",
        desc: { en: "The category.", pt: "A categoria." },
        values: [
          { name: "SDL_LOG_CATEGORY_APPLICATION", desc: { en: "Your own messages.", pt: "As suas próprias mensagens." } },
          { name: "SDL_LOG_CATEGORY_RENDER / _VIDEO", desc: { en: "Drawing and windows.", pt: "Desenho e janelas." } },
          { name: "SDL_LOG_CATEGORY_AUDIO / _INPUT", desc: { en: "Sound and input devices.", pt: "Som e dispositivos de entrada." } },
          { name: "SDL_LOG_CATEGORY_CUSTOM", desc: { en: "First number free for your own categories (CUSTOM, CUSTOM + 1…).", pt: "Primeiro número livre para categorias suas (CUSTOM, CUSTOM + 1…)." } },
        ],
      },
      { name: "fmt", type: "const char *", desc: { en: "A printf format string, followed by its values.", pt: "Uma string de formato do printf, seguida dos valores." } },
    ],
    example: `SDL_LogInfo(SDL_LOG_CATEGORY_APPLICATION, "loaded %zu meshes", meshes.size());`,
    related: ["SDL_Log", "SDL_LogError", "SDL_SetLogPriority"],
    khronos: `${WIKI}SDL_LogInfo`,
  },
  {
    name: "SDL_LogError",
    category: "log-time",
    since: "SDL 3.2",
    signature: "void SDL_LogError(int category, const char *fmt, ...);",
    summary: {
      en: "Logs an error message in a category. Errors are shown at the default levels.",
      pt: "Registra uma mensagem de erro numa categoria. Erros aparecem nos níveis padrão.",
    },
    description: {
      en: "Same as SDL_LogInfo at ERROR priority. Use it for failures you want visible even in a quiet build. Many platforms also mark it differently (red text, \"E\" in logcat).",
      pt: "O mesmo que SDL_LogInfo com prioridade ERROR. Use para falhas que você quer ver mesmo numa versão silenciosa. Muitas plataformas também a destacam (texto vermelho, \"E\" no logcat).",
    },
    params: [
      { name: "category", type: "int", desc: { en: "The category, e.g. SDL_LOG_CATEGORY_RENDER.", pt: "A categoria, ex.: SDL_LOG_CATEGORY_RENDER." } },
      { name: "fmt", type: "const char *", desc: { en: "A printf format string, followed by its values.", pt: "Uma string de formato do printf, seguida dos valores." } },
    ],
    example: `if (!pipeline)
    SDL_LogError(SDL_LOG_CATEGORY_RENDER, "pipeline: %s", SDL_GetError());`,
    related: ["SDL_LogInfo", "SDL_GetError"],
    khronos: `${WIKI}SDL_LogError`,
  },
  {
    name: "SDL_SetLogPriority",
    category: "log-time",
    since: "SDL 3.2",
    signature: "void SDL_SetLogPriority(int category, SDL_LogPriority priority);",
    summary: {
      en: "Sets the lowest priority that is still printed for one category.",
      pt: "Define a menor prioridade que ainda é impressa numa categoria.",
    },
    description: {
      en: "By default your application category shows INFO and above, so SDL_LogDebug messages are hidden. Lower the level to DEBUG while developing, raise it to WARN for a release. SDL_SetLogPriorities sets every category at once.",
      pt: "Por padrão a categoria da aplicação mostra INFO para cima, então as mensagens de SDL_LogDebug ficam escondidas. Baixe o nível para DEBUG enquanto desenvolve, suba para WARN numa versão final. SDL_SetLogPriorities define todas as categorias de uma vez.",
    },
    params: [
      { name: "category", type: "int", desc: { en: "The category to change.", pt: "A categoria a mudar." } },
      {
        name: "priority",
        type: "SDL_LogPriority",
        desc: { en: "The new minimum.", pt: "O novo mínimo." },
        values: [
          { name: "SDL_LOG_PRIORITY_VERBOSE / _DEBUG", desc: { en: "Everything, for development.", pt: "Tudo, para desenvolvimento." } },
          { name: "SDL_LOG_PRIORITY_INFO", desc: { en: "Normal messages and up.", pt: "Mensagens normais para cima." } },
          { name: "SDL_LOG_PRIORITY_WARN / _ERROR / _CRITICAL", desc: { en: "Only problems.", pt: "Só problemas." } },
        ],
      },
    ],
    example: `#ifndef NDEBUG
SDL_SetLogPriority(SDL_LOG_CATEGORY_APPLICATION, SDL_LOG_PRIORITY_DEBUG);
#endif
SDL_LogDebug(SDL_LOG_CATEGORY_APPLICATION, "player at %.1f, %.1f", x, y);`,
    related: ["SDL_LogInfo", "SDL_Log"],
    khronos: `${WIKI}SDL_SetLogPriority`,
  },
  {
    name: "SDL_GetTicks",
    category: "log-time",
    since: "SDL 3.2",
    signature: "Uint64 SDL_GetTicks(void);",
    summary: {
      en: "Milliseconds since SDL started. Simple, but too coarse to time a frame.",
      pt: "Milissegundos desde que o SDL iniciou. Simples, mas grosso demais para medir um quadro.",
    },
    description: {
      en: "A frame at 144 Hz lasts about 6.9 ms. Whole milliseconds round that to 6 or 7, an error of up to 14% that shows up as jittery movement. Use SDL_GetTicksNS (nanoseconds, same clock) for frame timing, and SDL_GetTicks for coarse things such as \"show the hint after 3 seconds\".\n\nThe value is a 64-bit integer, so unlike SDL2's 32-bit version it does not wrap around after 49 days.",
      pt: "Um quadro a 144 Hz dura uns 6,9 ms. Milissegundos inteiros arredondam isso para 6 ou 7, um erro de até 14% que aparece como movimento tremido. Use SDL_GetTicksNS (nanossegundos, mesmo relógio) para medir quadros, e SDL_GetTicks para coisas grossas, como \"mostrar a dica depois de 3 segundos\".\n\nO valor é um inteiro de 64 bits, então, ao contrário da versão de 32 bits do SDL2, ele não dá a volta depois de 49 dias.",
    },
    params: [],
    returns: { en: "Milliseconds since SDL was initialized.", pt: "Milissegundos desde que o SDL foi inicializado." },
    example: `Uint64 shownAt = SDL_GetTicks();
// ...
if (SDL_GetTicks() - shownAt > 3000) showHint = true;`,
    related: ["SDL_GetTicksNS", "SDL_GetPerformanceCounter"],
    khronos: `${WIKI}SDL_GetTicks`,
  },
  {
    name: "SDL_GetTicksNS",
    category: "log-time",
    since: "SDL 3.2",
    signature: "Uint64 SDL_GetTicksNS(void);",
    summary: {
      en: "Nanoseconds since SDL started. The clock to compute deltaTime with.",
      pt: "Nanossegundos desde que o SDL iniciou. O relógio para calcular o deltaTime.",
    },
    description: {
      en: "The same clock as SDL_GetTicks with a million times finer units. It is monotonic: it never jumps backwards, even if the user changes the system time.\n\nSubtract two readings and divide by 1e9 to get seconds. Do the subtraction in integers first, then convert: the difference is small, so the float keeps all its precision.",
      pt: "O mesmo relógio de SDL_GetTicks com unidades um milhão de vezes mais finas. É monotônico: nunca volta para trás, mesmo se o usuário mudar a hora do sistema.\n\nSubtraia duas leituras e divida por 1e9 para ter segundos. Faça a subtração em inteiros primeiro e só depois converta: a diferença é pequena, então o float guarda toda a precisão.",
    },
    params: [],
    returns: { en: "Nanoseconds since SDL was initialized.", pt: "Nanossegundos desde que o SDL foi inicializado." },
    example: `Uint64 last = SDL_GetTicksNS();
while (running) {
    Uint64 now = SDL_GetTicksNS();
    float dt = float(now - last) / 1e9f;   // seconds, subtract first
    last = now;
    update(dt);
}`,
    related: ["SDL_GetTicks", "SDL_DelayNS", "SDL_AppIterate"],
    khronos: `${WIKI}SDL_GetTicksNS`,
  },
  {
    name: "SDL_GetPerformanceCounter",
    category: "log-time",
    since: "SDL 3.2",
    signature: "Uint64 SDL_GetPerformanceCounter(void);",
    summary: {
      en: "Reads the finest timer the system has, in ticks of unknown size. For profiling.",
      pt: "Lê o timer mais fino que o sistema tem, em tiques de tamanho desconhecido. Para medir desempenho.",
    },
    description: {
      en: "The counter alone means nothing: its unit depends on the machine. Take two readings, subtract them, and divide by SDL_GetPerformanceFrequency (ticks per second) to get seconds.\n\nUse it to measure how long a piece of code takes. For game time, SDL_GetTicksNS is simpler and usually just as precise.",
      pt: "O contador sozinho não significa nada: a unidade depende da máquina. Faça duas leituras, subtraia e divida por SDL_GetPerformanceFrequency (tiques por segundo) para ter segundos.\n\nUse para medir quanto tempo um trecho de código leva. Para o tempo do jogo, SDL_GetTicksNS é mais simples e normalmente tão preciso quanto.",
    },
    params: [],
    returns: { en: "The current counter value, in platform ticks.", pt: "O valor atual do contador, em tiques da plataforma." },
    example: `Uint64 start = SDL_GetPerformanceCounter();
buildNavMesh();
double ms = 1000.0 * double(SDL_GetPerformanceCounter() - start)
                   / double(SDL_GetPerformanceFrequency());
SDL_Log("navmesh: %.3f ms", ms);`,
    related: ["SDL_GetPerformanceFrequency", "SDL_GetTicksNS"],
    khronos: `${WIKI}SDL_GetPerformanceCounter`,
  },
  {
    name: "SDL_GetPerformanceFrequency",
    category: "log-time",
    since: "SDL 3.2",
    signature: "Uint64 SDL_GetPerformanceFrequency(void);",
    summary: {
      en: "How many SDL_GetPerformanceCounter ticks make one second on this machine.",
      pt: "Quantos tiques de SDL_GetPerformanceCounter formam um segundo nesta máquina.",
    },
    description: {
      en: "It does not change while the program runs, so you can read it once. Divide a counter difference by it to turn ticks into seconds.",
      pt: "Não muda enquanto o programa roda, então dá para ler uma vez só. Divida uma diferença do contador por ele para transformar tiques em segundos.",
    },
    params: [],
    returns: { en: "Ticks per second.", pt: "Tiques por segundo." },
    example: `const double toSeconds = 1.0 / double(SDL_GetPerformanceFrequency());
double elapsed = double(end - start) * toSeconds;`,
    related: ["SDL_GetPerformanceCounter"],
    khronos: `${WIKI}SDL_GetPerformanceFrequency`,
  },
  {
    name: "SDL_DelayNS",
    category: "log-time",
    since: "SDL 3.2",
    signature: "void SDL_DelayNS(Uint64 ns);",
    summary: {
      en: "Sleeps for at least the given number of nanoseconds.",
      pt: "Dorme por pelo menos o número dado de nanossegundos.",
    },
    description: {
      en: "The thread gives the CPU back to the system for that long. \"At least\": the operating system wakes it when it gets around to it, which can be a millisecond or more late on some systems.\n\nUse it to cap the frame rate when vsync is off, or to wait politely in a tool. SDL_Delay takes milliseconds; SDL_DelayPrecise spins for the last bit to be more exact, at the cost of some CPU.",
      pt: "A thread devolve a CPU ao sistema por esse tempo. \"Pelo menos\": o sistema operacional a acorda quando puder, o que pode atrasar um milissegundo ou mais em alguns sistemas.\n\nUse para limitar a taxa de quadros quando o vsync está desligado, ou para esperar com educação numa ferramenta. SDL_Delay recebe milissegundos; SDL_DelayPrecise gira em espera no finalzinho para ser mais exato, ao custo de um pouco de CPU.",
    },
    params: [
      { name: "ns", type: "Uint64", desc: { en: "How long to sleep, in nanoseconds (1 ms = 1'000'000 ns). SDL_MS_TO_NS(ms) converts.", pt: "Quanto dormir, em nanossegundos (1 ms = 1'000'000 ns). SDL_MS_TO_NS(ms) converte." } },
    ],
    example: `// cap at 120 fps without vsync
const Uint64 frameNS = 1'000'000'000 / 120;
Uint64 used = SDL_GetTicksNS() - frameStart;
if (used < frameNS) SDL_DelayNS(frameNS - used);`,
    related: ["SDL_GetTicksNS"],
    khronos: `${WIKI}SDL_DelayNS`,
  },
];

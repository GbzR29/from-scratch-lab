// src/lib/reference/sdl3/events.ts
// SDL 3.2: the event queue, keyboard and mouse state, relative mouse, text input.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const eventEntries: RefEntry[] = [
  {
    name: "SDL_PollEvent",
    category: "events",
    since: "SDL 3.2",
    signature: "bool SDL_PollEvent(SDL_Event *event);",
    summary: {
      en: "Takes the next event out of the queue, if there is one. Never waits.",
      pt: "Tira o próximo evento da fila, se houver. Nunca espera.",
    },
    description: {
      en: "Everything the user does (keys, mouse, closing the window, plugging a gamepad) becomes an SDL_Event in a queue. Each frame, empty the queue with `while (SDL_PollEvent(&e))`, then update and draw. If you stop reading events the system thinks the program froze (\"not responding\").\n\nSDL_Event is a union: look at `e.type` first, then read the matching member: `e.key` for keys, `e.motion` and `e.button` for the mouse, `e.wheel`, `e.window`, `e.text`, `e.gdevice`…",
      pt: "Tudo o que o usuário faz (teclas, mouse, fechar a janela, ligar um controle) vira um SDL_Event numa fila. A cada quadro, esvazie a fila com `while (SDL_PollEvent(&e))` e depois atualize e desenhe. Se você parar de ler eventos o sistema acha que o programa travou (\"não está respondendo\").\n\nSDL_Event é uma union: olhe `e.type` primeiro e depois leia o membro correspondente: `e.key` para teclas, `e.motion` e `e.button` para o mouse, `e.wheel`, `e.window`, `e.text`, `e.gdevice`…",
    },
    params: [
      { name: "event", type: "SDL_Event *", desc: { en: "Where to copy the event. With NULL it only tells whether an event is waiting, without removing it.", pt: "Onde copiar o evento. Com NULL só diz se há evento esperando, sem tirá-lo." } },
    ],
    returns: { en: "`true` if an event was taken out, `false` if the queue is empty.", pt: "`true` se um evento foi tirado, `false` se a fila está vazia." },
    notes: [
      { en: "Call it from the thread that created the window (normally the main thread).", pt: "Chame da thread que criou a janela (normalmente a principal)." },
      { en: "Key events: `e.key.key` is the SDL_Keycode (the symbol, layout-aware, e.g. SDLK_A), `e.key.scancode` the physical position (SDL_SCANCODE_A), `e.key.down` and `e.key.repeat` are bools.", pt: "Eventos de tecla: `e.key.key` é o SDL_Keycode (o símbolo, respeitando o layout, ex.: SDLK_A), `e.key.scancode` a posição física (SDL_SCANCODE_A), `e.key.down` e `e.key.repeat` são bools." },
    ],
    example: `SDL_Event e;
while (SDL_PollEvent(&e)) {
    switch (e.type) {
    case SDL_EVENT_QUIT:          running = false; break;
    case SDL_EVENT_KEY_DOWN:
        if (e.key.key == SDLK_ESCAPE) running = false;
        break;
    case SDL_EVENT_MOUSE_BUTTON_DOWN:
        click(e.button.x, e.button.y);   // floats in SDL3
        break;
    }
}`,
    related: ["SDL_WaitEvent", "SDL_AppEvent", "SDL_GetKeyboardState"],
    khronos: `${WIKI}SDL_PollEvent`,
  },
  {
    name: "SDL_WaitEvent",
    category: "events",
    since: "SDL 3.2",
    signature: "bool SDL_WaitEvent(SDL_Event *event);",
    summary: {
      en: "Sleeps until an event arrives, then takes it out. For tools that only redraw on input.",
      pt: "Dorme até chegar um evento e então o tira da fila. Para ferramentas que só redesenham com entrada.",
    },
    description: {
      en: "A game redraws every frame, so it polls. An editor or a viewer only changes when the user does something; waiting instead of polling drops its CPU use to almost zero while idle. SDL_WaitEventTimeout adds a time limit (e.g. to blink a cursor).",
      pt: "Um jogo redesenha todo quadro, então consulta. Um editor ou um visualizador só muda quando o usuário faz algo; esperar em vez de consultar derruba o uso de CPU para quase zero enquanto parado. SDL_WaitEventTimeout acrescenta um tempo limite (ex.: para piscar um cursor).",
    },
    params: [
      { name: "event", type: "SDL_Event *", desc: { en: "Where to copy the event, or NULL.", pt: "Onde copiar o evento, ou NULL." } },
    ],
    returns: { en: "`true` with an event, `false` on error.", pt: "`true` com um evento, `false` em caso de erro." },
    example: `SDL_Event e;
while (running && SDL_WaitEvent(&e)) {
    handle(e);
    while (SDL_PollEvent(&e)) handle(e);   // drain the rest
    redraw();
}`,
    related: ["SDL_PollEvent"],
    khronos: `${WIKI}SDL_WaitEvent`,
  },
  {
    name: "SDL_PushEvent",
    category: "events",
    since: "SDL 3.2",
    signature: "bool SDL_PushEvent(SDL_Event *event);",
    summary: {
      en: "Adds an event to the queue yourself. Safe from any thread: the way a worker thread talks to the main loop.",
      pt: "Coloca um evento na fila você mesmo. Seguro de qualquer thread: o jeito de uma thread de trabalho falar com o laço principal.",
    },
    description: {
      en: "Most SDL functions must run on the main thread. A loading thread that finished a level cannot touch the renderer, but it can push an event; the main loop then picks it up with SDL_PollEvent and does the main-thread work.\n\nFor your own event types, reserve numbers with SDL_RegisterEvents and put your data in `event.user` (`code`, `data1`, `data2`). SDL copies the event, so a local variable is fine.",
      pt: "A maioria das funções do SDL precisa rodar na thread principal. Uma thread de carregamento que terminou uma fase não pode mexer no renderer, mas pode enviar um evento; o laço principal o pega com SDL_PollEvent e faz o trabalho da thread principal.\n\nPara tipos de evento seus, reserve números com SDL_RegisterEvents e coloque os dados em `event.user` (`code`, `data1`, `data2`). O SDL copia o evento, então uma variável local serve.",
    },
    params: [
      { name: "event", type: "SDL_Event *", desc: { en: "The event to add (copied).", pt: "O evento a adicionar (copiado)." } },
    ],
    returns: { en: "`true` if queued; `false` if it was filtered out or the queue is full.", pt: "`true` se entrou na fila; `false` se foi filtrado ou a fila está cheia." },
    example: `// worker thread
SDL_Event ev{};
ev.type = assetLoadedEvent;          // from SDL_RegisterEvents(1)
ev.user.data1 = loadedMesh;
SDL_PushEvent(&ev);`,
    related: ["SDL_RegisterEvents", "SDL_PollEvent"],
    khronos: `${WIKI}SDL_PushEvent`,
  },
  {
    name: "SDL_RegisterEvents",
    category: "events",
    since: "SDL 3.2",
    signature: "Uint32 SDL_RegisterEvents(int numevents);",
    summary: {
      en: "Reserves event type numbers for your own events, so they never clash with SDL's or a library's.",
      pt: "Reserva números de tipo de evento para eventos seus, para nunca colidirem com os do SDL ou de uma biblioteca.",
    },
    description: {
      en: "Call it once at startup and keep the returned number. If you asked for several, they are consecutive: first, first + 1, …",
      pt: "Chame uma vez na partida e guarde o número retornado. Se pediu vários, eles são consecutivos: primeiro, primeiro + 1, …",
    },
    params: [
      { name: "numevents", type: "int", desc: { en: "How many event types to reserve.", pt: "Quantos tipos de evento reservar." } },
    ],
    returns: { en: "The first reserved type, or 0 if none are left (0 is never a valid user type).", pt: "O primeiro tipo reservado, ou 0 se não houver mais (0 nunca é um tipo válido)." },
    example: `static Uint32 assetLoadedEvent = SDL_RegisterEvents(1);
// in the loop:
if (e.type == assetLoadedEvent) upload(static_cast<Mesh*>(e.user.data1));`,
    related: ["SDL_PushEvent"],
    khronos: `${WIKI}SDL_RegisterEvents`,
  },
  {
    name: "SDL_GetKeyboardState",
    category: "events",
    since: "SDL 3.2",
    signature: "const bool * SDL_GetKeyboardState(int *numkeys);",
    summary: {
      en: "Returns SDL's array of key states: `keys[SDL_SCANCODE_W]` is true while W is held.",
      pt: "Retorna o array de estados de tecla do SDL: `keys[SDL_SCANCODE_W]` é true enquanto W está apertada.",
    },
    description: {
      en: "Events tell you when a key goes down; this array tells you whether it IS down. That is what continuous movement needs: move while held, in every frame.\n\nThe array is indexed by scancode, the physical position of the key. SDL_SCANCODE_W is the key where W sits on a US keyboard, so WASD stays in the same place on AZERTY. In SDL3 the entries are `bool` (they were Uint8 in SDL2).",
      pt: "Eventos dizem quando uma tecla desce; este array diz se ela ESTÁ apertada. É disso que o movimento contínuo precisa: andar enquanto segura, em todo quadro.\n\nO array é indexado por scancode, a posição física da tecla. SDL_SCANCODE_W é a tecla onde fica o W num teclado americano, então o WASD fica no mesmo lugar num AZERTY. No SDL3 as entradas são `bool` (eram Uint8 no SDL2).",
    },
    params: [
      { name: "numkeys", type: "int *", desc: { en: "Where to write the array length, or NULL.", pt: "Onde escrever o tamanho do array, ou NULL." } },
    ],
    returns: {
      en: "A pointer owned by SDL, valid for the whole program. Get it once; its contents update during event processing.",
      pt: "Um ponteiro do SDL, válido o programa inteiro. Pegue uma vez; o conteúdo é atualizado durante o processamento de eventos.",
    },
    example: `const bool* keys = SDL_GetKeyboardState(nullptr);
// every frame, after the event loop:
float dx = keys[SDL_SCANCODE_D] - keys[SDL_SCANCODE_A];
float dy = keys[SDL_SCANCODE_S] - keys[SDL_SCANCODE_W];
player.x += dx * speed * dt;
player.y += dy * speed * dt;`,
    related: ["SDL_PollEvent", "SDL_GetMouseState"],
    khronos: `${WIKI}SDL_GetKeyboardState`,
  },
  {
    name: "SDL_GetMouseState",
    category: "events",
    since: "SDL 3.2",
    signature: "SDL_MouseButtonFlags SDL_GetMouseState(float *x, float *y);",
    summary: {
      en: "Reads where the mouse is (in the focused window) and which buttons are held.",
      pt: "Lê onde o mouse está (na janela com foco) e quais botões estão apertados.",
    },
    description: {
      en: "The position is in window coordinates, as floats (SDL3 reports fractions on precise devices). The return value is a bit mask: test a button with `buttons & SDL_BUTTON_LMASK` (left), SDL_BUTTON_RMASK (right) or SDL_BUTTON_MMASK (middle).\n\nIf you use SDL_SetRenderLogicalPresentation, convert the position with SDL_RenderCoordinatesFromWindow before comparing it with your game's coordinates.",
      pt: "A posição está em coordenadas de janela, como floats (o SDL3 informa frações em dispositivos precisos). O retorno é uma máscara de bits: teste um botão com `buttons & SDL_BUTTON_LMASK` (esquerdo), SDL_BUTTON_RMASK (direito) ou SDL_BUTTON_MMASK (meio).\n\nSe você usa SDL_SetRenderLogicalPresentation, converta a posição com SDL_RenderCoordinatesFromWindow antes de comparar com as coordenadas do jogo.",
    },
    params: [
      { name: "x", type: "float *", desc: { en: "Where to write x, or NULL.", pt: "Onde escrever o x, ou NULL." } },
      { name: "y", type: "float *", desc: { en: "Where to write y (down is positive), or NULL.", pt: "Onde escrever o y (para baixo é positivo), ou NULL." } },
    ],
    returns: { en: "A mask of held buttons.", pt: "Uma máscara dos botões apertados." },
    example: `float mx, my;
SDL_MouseButtonFlags buttons = SDL_GetMouseState(&mx, &my);
if (buttons & SDL_BUTTON_LMASK) paintAt(mx, my);`,
    related: ["SDL_GetKeyboardState", "SDL_RenderCoordinatesFromWindow", "SDL_SetWindowRelativeMouseMode"],
    khronos: `${WIKI}SDL_GetMouseState`,
  },
  {
    name: "SDL_SetWindowRelativeMouseMode",
    category: "events",
    since: "SDL 3.2",
    signature: "bool SDL_SetWindowRelativeMouseMode(SDL_Window *window, bool enabled);",
    summary: {
      en: "Hides and locks the cursor and reports pure mouse movement. For first-person cameras.",
      pt: "Esconde e prende o cursor e informa só o movimento do mouse. Para câmeras em primeira pessoa.",
    },
    description: {
      en: "With relative mode on, the cursor disappears and cannot leave the window, and mouse motion events keep coming even when the mouse would have hit the screen edge. Read the movement from `e.motion.xrel` and `e.motion.yrel`: how far the mouse moved since the last event. Turn it off when a menu opens.\n\nIn SDL3 the mode belongs to a window (SDL2 had a global SDL_SetRelativeMouseMode).",
      pt: "Com o modo relativo ligado, o cursor some e não sai da janela, e os eventos de movimento continuam chegando mesmo quando o mouse teria batido na borda da tela. Leia o movimento em `e.motion.xrel` e `e.motion.yrel`: quanto o mouse andou desde o último evento. Desligue quando um menu abrir.\n\nNo SDL3 o modo pertence a uma janela (o SDL2 tinha um SDL_SetRelativeMouseMode global).",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window that captures the mouse.", pt: "A janela que captura o mouse." } },
      { name: "enabled", type: "bool", desc: { en: "`true` to turn relative mode on, `false` to free the cursor.", pt: "`true` para ligar o modo relativo, `false` para soltar o cursor." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetWindowRelativeMouseMode(window, true);
// in the event loop:
if (e.type == SDL_EVENT_MOUSE_MOTION) {
    yaw   += e.motion.xrel * 0.1f;
    pitch -= e.motion.yrel * 0.1f;   // screen y grows down
}`,
    related: ["SDL_GetMouseState", "SDL_PollEvent"],
    khronos: `${WIKI}SDL_SetWindowRelativeMouseMode`,
  },
  {
    name: "SDL_StartTextInput",
    category: "events",
    since: "SDL 3.2",
    signature: "bool SDL_StartTextInput(SDL_Window *window);",
    summary: {
      en: "Turns on text input for a window: SDL starts sending SDL_EVENT_TEXT_INPUT with typed characters.",
      pt: "Liga a entrada de texto numa janela: o SDL passa a enviar SDL_EVENT_TEXT_INPUT com os caracteres digitados.",
    },
    description: {
      en: "Key events are not text: \"ã\" on a Brazilian keyboard is two key presses, and Shift+2 is \"@\" on one layout and \"\\\"\" on another. Text input events carry the final UTF-8 string in `e.text.text`, after the system applied the layout, accents and input methods (Chinese, Japanese…).\n\nIn SDL3 text input is OFF by default (SDL2 had it on). Turn it on when a text field gets focus, and off again with SDL_StopTextInput. On phones this also shows the on-screen keyboard.",
      pt: "Eventos de tecla não são texto: \"ã\" num teclado brasileiro são dois toques, e Shift+2 é \"@\" num layout e \"\\\"\" em outro. Eventos de texto trazem a string UTF-8 final em `e.text.text`, depois que o sistema aplicou o layout, os acentos e os métodos de entrada (chinês, japonês…).\n\nNo SDL3 a entrada de texto vem DESLIGADA (no SDL2 vinha ligada). Ligue quando um campo de texto ganha foco e desligue de novo com SDL_StopTextInput. Em celulares isso também mostra o teclado na tela.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window that receives the text.", pt: "A janela que recebe o texto." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_StartTextInput(window);          // name field focused
// ...
if (e.type == SDL_EVENT_TEXT_INPUT) playerName += e.text.text;   // UTF-8
// ...
SDL_StopTextInput(window);           // field closed`,
    related: ["SDL_StopTextInput", "SDL_PollEvent"],
    khronos: `${WIKI}SDL_StartTextInput`,
  },
  {
    name: "SDL_StopTextInput",
    category: "events",
    since: "SDL 3.2",
    signature: "bool SDL_StopTextInput(SDL_Window *window);",
    summary: {
      en: "Turns text input off again: no more SDL_EVENT_TEXT_INPUT, and the on-screen keyboard closes.",
      pt: "Desliga a entrada de texto de novo: chega de SDL_EVENT_TEXT_INPUT, e o teclado na tela fecha.",
    },
    description: {
      en: "Call it when the text field loses focus. Leaving text input on during gameplay can make some input methods pop up candidate windows when the player presses letter keys.",
      pt: "Chame quando o campo de texto perde o foco. Deixar a entrada de texto ligada durante o jogo pode fazer alguns métodos de entrada abrirem janelas de sugestões quando o jogador aperta letras.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The window.", pt: "A janela." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `if (e.type == SDL_EVENT_KEY_DOWN && e.key.key == SDLK_RETURN) {
    submit(playerName);
    SDL_StopTextInput(window);
}`,
    related: ["SDL_StartTextInput"],
    khronos: `${WIKI}SDL_StopTextInput`,
  },
];

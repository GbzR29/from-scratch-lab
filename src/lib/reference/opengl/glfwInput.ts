// src/lib/reference/opengl/glfwInput.ts
// GLFW 3.4: keyboard, mouse, scroll, cursor modes and the clock.
import type { RefEntry } from "../types";

const DOCS = "https://www.glfw.org/docs/3.4/";

export const glfwInputEntries: RefEntry[] = [
  {
    name: "glfwGetKey",
    category: "glfw-input",
    since: "GLFW 1.0",
    signature: "int glfwGetKey(GLFWwindow* window, int key);",
    summary: {
      en: "Asks whether a key is held down right now. Best for continuous actions such as walking with WASD.",
      pt: "Pergunta se uma tecla está apertada agora. Melhor para ações contínuas, como andar com WASD.",
    },
    description: {
      en: "There are two ways to read the keyboard. Polling asks every frame \"is W down?\": perfect for movement, where the camera moves for as long as the key is held. Events (glfwSetKeyCallback) tell you once per press: better for toggles such as \"P pauses\", which would otherwise flip 60 times per second.\n\nThe answer is the state seen by the last glfwPollEvents, so call this after polling.",
      pt: "Há dois jeitos de ler o teclado. Consultar pergunta todo quadro \"W está apertada?\": perfeito para movimento, em que a câmera anda enquanto a tecla está segura. Eventos (glfwSetKeyCallback) avisam uma vez por toque: melhor para alternâncias como \"P pausa\", que de outro jeito trocariam 60 vezes por segundo.\n\nA resposta é o estado visto pelo último glfwPollEvents, então chame depois de processar os eventos.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window that has the keyboard focus.", pt: "A janela que tem o foco do teclado." } },
      {
        name: "key",
        type: "int",
        desc: { en: "A key constant. Names follow the US layout POSITION: GLFW_KEY_W is the key where W sits on a US keyboard, even on AZERTY.", pt: "Uma constante de tecla. Os nomes seguem a POSIÇÃO do layout americano: GLFW_KEY_W é a tecla onde fica o W num teclado americano, mesmo num AZERTY." },
        values: [
          { name: "GLFW_KEY_A … GLFW_KEY_Z, GLFW_KEY_0 … GLFW_KEY_9", desc: { en: "Letters and digits.", pt: "Letras e dígitos." } },
          { name: "GLFW_KEY_SPACE, GLFW_KEY_ESCAPE, GLFW_KEY_ENTER", desc: { en: "Space, Esc, Enter.", pt: "Espaço, Esc, Enter." } },
          { name: "GLFW_KEY_LEFT_SHIFT, GLFW_KEY_LEFT_CONTROL", desc: { en: "Modifiers as keys (e.g. Shift to run).", pt: "Modificadores como teclas (ex.: Shift para correr)." } },
          { name: "GLFW_KEY_UP / DOWN / LEFT / RIGHT", desc: { en: "Arrow keys.", pt: "Setas." } },
          { name: "GLFW_KEY_F1 … GLFW_KEY_F25", desc: { en: "Function keys.", pt: "Teclas de função." } },
        ],
      },
    ],
    returns: {
      en: "GLFW_PRESS if the key is down, GLFW_RELEASE if it is up. Never GLFW_REPEAT.",
      pt: "GLFW_PRESS se a tecla está apertada, GLFW_RELEASE se está solta. Nunca GLFW_REPEAT.",
    },
    notes: [
      { en: "Multiply movement by the frame time (deltaTime from glfwGetTime), or the camera moves faster on faster computers.", pt: "Multiplique o movimento pelo tempo do quadro (deltaTime de glfwGetTime), senão a câmera anda mais rápido em computadores mais rápidos." },
      { en: "A press shorter than one frame can be missed. Turn on GLFW_STICKY_KEYS with glfwSetInputMode, or use the key callback.", pt: "Um toque mais curto que um quadro pode passar despercebido. Ligue GLFW_STICKY_KEYS com glfwSetInputMode, ou use o callback de tecla." },
    ],
    example: `float speed = 2.5f * deltaTime;
if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS) camPos += speed * camFront;
if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS) camPos -= speed * camFront;
if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS) camPos -= speed * camRight;
if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS) camPos += speed * camRight;`,
    related: ["glfwSetKeyCallback", "glfwPollEvents", "glfwGetTime"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwSetKeyCallback",
    category: "glfw-input",
    since: "GLFW 1.0",
    signature: "GLFWkeyfun glfwSetKeyCallback(GLFWwindow* window, GLFWkeyfun callback);",
    summary: {
      en: "Registers a function GLFW calls once for every key press, release and auto-repeat.",
      pt: "Registra uma função que o GLFW chama uma vez para cada aperto, soltura e repetição automática de tecla.",
    },
    description: {
      en: "The callback receives five values: the window, `key` (a GLFW_KEY_* constant), `scancode` (the raw key number of this keyboard), `action` and `mods`.\n\n`action` is GLFW_PRESS when the key goes down, GLFW_RELEASE when it comes up, and GLFW_REPEAT while it is held (the system's auto-repeat, as in a text editor). `mods` is a bit mask of the modifiers held at that moment: GLFW_MOD_SHIFT, GLFW_MOD_CONTROL, GLFW_MOD_ALT, GLFW_MOD_SUPER.\n\nUse it for one-shot actions: open a menu, toggle wireframe, take a screenshot.",
      pt: "O callback recebe cinco valores: a janela, `key` (uma constante GLFW_KEY_*), `scancode` (o número bruto da tecla neste teclado), `action` e `mods`.\n\n`action` é GLFW_PRESS quando a tecla desce, GLFW_RELEASE quando sobe, e GLFW_REPEAT enquanto ela é segurada (a repetição automática do sistema, como num editor de texto). `mods` é uma máscara de bits dos modificadores segurados naquele momento: GLFW_MOD_SHIFT, GLFW_MOD_CONTROL, GLFW_MOD_ALT, GLFW_MOD_SUPER.\n\nUse para ações de uma vez: abrir um menu, alternar wireframe, tirar uma captura.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to listen to.", pt: "A janela a escutar." } },
      { name: "callback", type: "GLFWkeyfun", desc: { en: "Your function, `void f(GLFWwindow* window, int key, int scancode, int action, int mods)`, or NULL.", pt: "Sua função, `void f(GLFWwindow* window, int key, int scancode, int action, int mods)`, ou NULL." } },
    ],
    returns: { en: "The callback that was set before, or NULL.", pt: "O callback que estava definido antes, ou NULL." },
    notes: [
      { en: "Check `action == GLFW_PRESS`, or a held key fires your toggle again on every GLFW_REPEAT.", pt: "Confira `action == GLFW_PRESS`, senão uma tecla segurada dispara a sua alternância de novo a cada GLFW_REPEAT." },
      { en: "For typing text (names, chat) use glfwSetCharCallback: it knows the keyboard layout, accents and Shift.", pt: "Para digitar texto (nomes, chat) use glfwSetCharCallback: ele conhece o layout do teclado, os acentos e o Shift." },
    ],
    example: `void onKey(GLFWwindow* w, int key, int scancode, int action, int mods) {
    if (action != GLFW_PRESS) return;
    if (key == GLFW_KEY_ESCAPE) glfwSetWindowShouldClose(w, GLFW_TRUE);
    if (key == GLFW_KEY_F) wireframe = !wireframe;
    if (key == GLFW_KEY_S && (mods & GLFW_MOD_CONTROL)) saveScene();
}

glfwSetKeyCallback(window, onKey);`,
    related: ["glfwGetKey", "glfwSetCharCallback", "glfwSetWindowUserPointer"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwSetCharCallback",
    category: "glfw-input",
    since: "GLFW 2.4",
    signature: "GLFWcharfun glfwSetCharCallback(GLFWwindow* window, GLFWcharfun callback);",
    summary: {
      en: "Registers a function that receives TEXT typed by the user, one Unicode character at a time.",
      pt: "Registra uma função que recebe o TEXTO digitado pelo usuário, um caractere Unicode por vez.",
    },
    description: {
      en: "Keys are not characters. On a Brazilian keyboard, typing \"ã\" is two key presses (~ then a) but one character; Shift+2 is \"@\" on one layout and \"\\\"\" on another. The char callback receives the final character after the system applied the layout, Shift and accents.\n\nThe value is a Unicode code point (an unsigned int). Convert it to UTF-8 to add it to a string.",
      pt: "Teclas não são caracteres. Num teclado brasileiro, digitar \"ã\" são dois toques (~ e depois a) mas um caractere; Shift+2 é \"@\" num layout e \"\\\"\" em outro. O callback de caractere recebe o caractere final, depois que o sistema aplicou o layout, o Shift e os acentos.\n\nO valor é um code point Unicode (um unsigned int). Converta para UTF-8 para colocar numa string.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to listen to.", pt: "A janela a escutar." } },
      { name: "callback", type: "GLFWcharfun", desc: { en: "Your function, `void f(GLFWwindow* window, unsigned int codepoint)`, or NULL.", pt: "Sua função, `void f(GLFWwindow* window, unsigned int codepoint)`, ou NULL." } },
    ],
    returns: { en: "The callback that was set before, or NULL.", pt: "O callback que estava definido antes, ou NULL." },
    notes: [
      { en: "Backspace, Enter and arrows produce no character: handle them in the key callback.", pt: "Backspace, Enter e as setas não geram caractere: trate no callback de tecla." },
    ],
    example: `std::u32string typed;
glfwSetCharCallback(window, [](GLFWwindow*, unsigned int cp) {
    typed.push_back(static_cast<char32_t>(cp));   // 'a', 'ã', '@', '€'...
});`,
    related: ["glfwSetKeyCallback"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwGetMouseButton",
    category: "glfw-input",
    since: "GLFW 1.0",
    signature: "int glfwGetMouseButton(GLFWwindow* window, int button);",
    summary: {
      en: "Asks whether a mouse button is held down right now.",
      pt: "Pergunta se um botão do mouse está apertado agora.",
    },
    description: {
      en: "The mouse version of glfwGetKey: good for \"while the right button is held, rotate the camera\" or dragging. For single clicks, glfwSetMouseButtonCallback is the better tool.",
      pt: "A versão de mouse de glfwGetKey: boa para \"enquanto o botão direito estiver apertado, gire a câmera\" ou para arrastar. Para cliques únicos, glfwSetMouseButtonCallback é a ferramenta melhor.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to ask about.", pt: "A janela a consultar." } },
      {
        name: "button",
        type: "int",
        desc: { en: "Which button.", pt: "Qual botão." },
        values: [
          { name: "GLFW_MOUSE_BUTTON_LEFT", desc: { en: "Left button (same as GLFW_MOUSE_BUTTON_1).", pt: "Botão esquerdo (o mesmo que GLFW_MOUSE_BUTTON_1)." } },
          { name: "GLFW_MOUSE_BUTTON_RIGHT", desc: { en: "Right button (GLFW_MOUSE_BUTTON_2).", pt: "Botão direito (GLFW_MOUSE_BUTTON_2)." } },
          { name: "GLFW_MOUSE_BUTTON_MIDDLE", desc: { en: "Wheel click (GLFW_MOUSE_BUTTON_3).", pt: "Clique da roda (GLFW_MOUSE_BUTTON_3)." } },
        ],
      },
    ],
    returns: { en: "GLFW_PRESS or GLFW_RELEASE.", pt: "GLFW_PRESS ou GLFW_RELEASE." },
    example: `if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS)
    orbitCamera(mouseDx, mouseDy);`,
    related: ["glfwSetMouseButtonCallback", "glfwGetCursorPos"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwSetMouseButtonCallback",
    category: "glfw-input",
    since: "GLFW 1.0",
    signature: "GLFWmousebuttonfun glfwSetMouseButtonCallback(GLFWwindow* window, GLFWmousebuttonfun callback);",
    summary: {
      en: "Registers a function called once each time a mouse button goes down or comes up.",
      pt: "Registra uma função chamada uma vez cada vez que um botão do mouse desce ou sobe.",
    },
    description: {
      en: "The callback receives the window, `button` (GLFW_MOUSE_BUTTON_LEFT…), `action` (GLFW_PRESS or GLFW_RELEASE) and `mods` (Shift, Ctrl… held at that moment). It does not receive the position: read it with glfwGetCursorPos inside the callback.",
      pt: "O callback recebe a janela, `button` (GLFW_MOUSE_BUTTON_LEFT…), `action` (GLFW_PRESS ou GLFW_RELEASE) e `mods` (Shift, Ctrl… segurados no momento). Ele não recebe a posição: leia com glfwGetCursorPos dentro do callback.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to listen to.", pt: "A janela a escutar." } },
      { name: "callback", type: "GLFWmousebuttonfun", desc: { en: "Your function, `void f(GLFWwindow* window, int button, int action, int mods)`, or NULL.", pt: "Sua função, `void f(GLFWwindow* window, int button, int action, int mods)`, ou NULL." } },
    ],
    returns: { en: "The callback that was set before, or NULL.", pt: "O callback que estava definido antes, ou NULL." },
    example: `glfwSetMouseButtonCallback(window, [](GLFWwindow* w, int button, int action, int) {
    if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_PRESS) {
        double x, y;
        glfwGetCursorPos(w, &x, &y);
        pickObjectAt(x, y);
    }
});`,
    related: ["glfwGetMouseButton", "glfwGetCursorPos"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwGetCursorPos",
    category: "glfw-input",
    since: "GLFW 3.0",
    signature: "void glfwGetCursorPos(GLFWwindow* window, double* xpos, double* ypos);",
    summary: {
      en: "Reads where the mouse cursor is, measured from the top-left corner of the window's content.",
      pt: "Lê onde está o cursor do mouse, medido a partir do canto superior esquerdo do conteúdo da janela.",
    },
    description: {
      en: "The position is in screen coordinates, with y growing DOWNWARDS. OpenGL's window coordinates (gl_FragCoord, glReadPixels) grow upwards, so convert with `fbHeight - y` after scaling to pixels.\n\nThe values are doubles: some systems report fractions of a coordinate. With the cursor disabled (glfwSetInputMode GLFW_CURSOR_DISABLED) the position is no longer limited to the window: it keeps growing as the mouse moves, which is exactly what a first-person camera needs.",
      pt: "A posição está em coordenadas de tela, com o y crescendo PARA BAIXO. As coordenadas de janela do OpenGL (gl_FragCoord, glReadPixels) crescem para cima, então converta com `fbHeight - y` depois de escalar para pixels.\n\nOs valores são doubles: alguns sistemas informam frações de coordenada. Com o cursor desativado (glfwSetInputMode GLFW_CURSOR_DISABLED) a posição deixa de ficar presa à janela: continua crescendo conforme o mouse anda, que é exatamente o que uma câmera em primeira pessoa precisa.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to measure from.", pt: "A janela de referência." } },
      { name: "xpos", type: "double*", desc: { en: "Where to write x, or NULL.", pt: "Onde escrever o x, ou NULL." } },
      { name: "ypos", type: "double*", desc: { en: "Where to write y (down is positive), or NULL.", pt: "Onde escrever o y (para baixo é positivo), ou NULL." } },
    ],
    notes: [
      { en: "On high-DPI screens multiply by framebuffer size ÷ window size before using it as a pixel position.", pt: "Em telas de alta densidade multiplique por tamanho do framebuffer ÷ tamanho da janela antes de usar como posição em pixels." },
    ],
    example: `double mx, my;
glfwGetCursorPos(window, &mx, &my);
int ww, wh, fw, fh;
glfwGetWindowSize(window, &ww, &wh);
glfwGetFramebufferSize(window, &fw, &fh);
int px = (int)(mx * fw / ww);
int py = fh - 1 - (int)(my * fh / wh);   // flip to OpenGL's bottom-up rows
glReadPixels(px, py, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, rgba);`,
    related: ["glfwSetCursorPosCallback", "glfwSetInputMode", "glfwGetWindowSize", "glReadPixels"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwSetCursorPosCallback",
    category: "glfw-input",
    since: "GLFW 3.0",
    signature: "GLFWcursorposfun glfwSetCursorPosCallback(GLFWwindow* window, GLFWcursorposfun callback);",
    summary: {
      en: "Registers a function called every time the mouse moves, with the new cursor position.",
      pt: "Registra uma função chamada toda vez que o mouse se move, com a nova posição do cursor.",
    },
    description: {
      en: "The callback receives the NEW position, not how far the mouse moved. To turn a camera you need the movement (the offset), so keep the previous position and subtract: `dx = x - lastX`, `dy = lastY - y` (reversed, because screen y grows downwards while \"looking up\" is positive pitch).\n\nOn the very first call there is no previous position yet. Store it and skip the movement, or the camera jumps the first time the mouse enters the window.",
      pt: "O callback recebe a NOVA posição, não quanto o mouse andou. Para girar uma câmera você precisa do movimento (o deslocamento), então guarde a posição anterior e subtraia: `dx = x - lastX`, `dy = lastY - y` (invertido, porque o y da tela cresce para baixo enquanto \"olhar para cima\" é pitch positivo).\n\nNa primeira chamada ainda não há posição anterior. Guarde a posição e pule o movimento, senão a câmera dá um pulo na primeira vez que o mouse entra na janela.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to listen to.", pt: "A janela a escutar." } },
      { name: "callback", type: "GLFWcursorposfun", desc: { en: "Your function, `void f(GLFWwindow* window, double xpos, double ypos)`, or NULL.", pt: "Sua função, `void f(GLFWwindow* window, double xpos, double ypos)`, ou NULL." } },
    ],
    returns: { en: "The callback that was set before, or NULL.", pt: "O callback que estava definido antes, ou NULL." },
    example: `bool firstMouse = true;
double lastX, lastY;

void onCursor(GLFWwindow*, double x, double y) {
    if (firstMouse) { lastX = x; lastY = y; firstMouse = false; }
    float dx = float(x - lastX), dy = float(lastY - y);   // y reversed
    lastX = x; lastY = y;
    yaw   += dx * 0.1f;
    pitch += dy * 0.1f;
    pitch = std::clamp(pitch, -89.0f, 89.0f);
}

glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
glfwSetCursorPosCallback(window, onCursor);`,
    related: ["glfwGetCursorPos", "glfwSetInputMode", "glfwSetScrollCallback"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwSetScrollCallback",
    category: "glfw-input",
    since: "GLFW 3.0",
    signature: "GLFWscrollfun glfwSetScrollCallback(GLFWwindow* window, GLFWscrollfun callback);",
    summary: {
      en: "Registers a function called when the mouse wheel or touchpad scrolls.",
      pt: "Registra uma função chamada quando a roda do mouse ou o touchpad rolam.",
    },
    description: {
      en: "The callback receives `xoffset` and `yoffset`: how much was scrolled since the last event, not a position. A normal wheel gives yoffset = +1 or -1 per notch (positive = away from you). Touchpads give small fractions and can scroll sideways (xoffset).\n\nThe classic use in the lessons is zoom: change the camera's field of view by yoffset.",
      pt: "O callback recebe `xoffset` e `yoffset`: quanto foi rolado desde o último evento, não uma posição. Uma roda comum dá yoffset = +1 ou -1 por clique (positivo = para longe de você). Touchpads dão frações pequenas e podem rolar de lado (xoffset).\n\nO uso clássico nas lições é zoom: mudar o campo de visão da câmera por yoffset.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to listen to.", pt: "A janela a escutar." } },
      { name: "callback", type: "GLFWscrollfun", desc: { en: "Your function, `void f(GLFWwindow* window, double xoffset, double yoffset)`, or NULL.", pt: "Sua função, `void f(GLFWwindow* window, double xoffset, double yoffset)`, ou NULL." } },
    ],
    returns: { en: "The callback that was set before, or NULL.", pt: "O callback que estava definido antes, ou NULL." },
    example: `glfwSetScrollCallback(window, [](GLFWwindow*, double, double yoffset) {
    fov = std::clamp(fov - (float)yoffset, 1.0f, 45.0f);   // wheel up = zoom in
});`,
    related: ["glfwSetCursorPosCallback"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwSetInputMode",
    category: "glfw-input",
    since: "GLFW 3.0",
    signature: "void glfwSetInputMode(GLFWwindow* window, int mode, int value);",
    summary: {
      en: "Changes how input behaves: hide or capture the cursor, sticky keys, raw mouse motion…",
      pt: "Muda como a entrada se comporta: esconder ou capturar o cursor, sticky keys, movimento bruto do mouse…",
    },
    description: {
      en: "The most used mode is the cursor. A first-person camera wants GLFW_CURSOR_DISABLED: the cursor disappears, stays locked to the window, and its position grows without limit, so the player can turn around forever without the mouse hitting the edge of the screen.\n\nPress a key to go back to GLFW_CURSOR_NORMAL when the player opens a menu.",
      pt: "O modo mais usado é o do cursor. Uma câmera em primeira pessoa quer GLFW_CURSOR_DISABLED: o cursor some, fica preso à janela, e a posição cresce sem limite, então o jogador pode girar para sempre sem o mouse bater na borda da tela.\n\nUse uma tecla para voltar a GLFW_CURSOR_NORMAL quando o jogador abre um menu.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to change.", pt: "A janela a mudar." } },
      {
        name: "mode",
        type: "int",
        desc: { en: "Which setting.", pt: "Qual configuração." },
        values: [
          { name: "GLFW_CURSOR", desc: { en: "Cursor behaviour; value is one of the four below.", pt: "Comportamento do cursor; o valor é um dos quatro abaixo." } },
          { name: "GLFW_CURSOR_NORMAL", desc: { en: "Visible and free (default).", pt: "Visível e livre (padrão)." } },
          { name: "GLFW_CURSOR_HIDDEN", desc: { en: "Invisible over the window, but free to leave it.", pt: "Invisível sobre a janela, mas livre para sair dela." } },
          { name: "GLFW_CURSOR_DISABLED", desc: { en: "Invisible, locked, unlimited motion: for camera control.", pt: "Invisível, preso, movimento ilimitado: para controle de câmera." } },
          { name: "GLFW_CURSOR_CAPTURED", desc: { en: "GLFW 3.4: visible but cannot leave the window (strategy games).", pt: "GLFW 3.4: visível mas não sai da janela (jogos de estratégia)." } },
          { name: "GLFW_STICKY_KEYS", desc: { en: "GLFW_TRUE: glfwGetKey reports GLFW_PRESS once even if the key was already released, so quick taps are not lost.", pt: "GLFW_TRUE: glfwGetKey informa GLFW_PRESS uma vez mesmo se a tecla já foi solta, para toques rápidos não se perderem." } },
          { name: "GLFW_STICKY_MOUSE_BUTTONS", desc: { en: "The same for mouse buttons.", pt: "O mesmo para os botões do mouse." } },
          { name: "GLFW_RAW_MOUSE_MOTION", desc: { en: "GLFW_TRUE: with the cursor disabled, use unaccelerated mouse motion. Check glfwRawMouseMotionSupported first.", pt: "GLFW_TRUE: com o cursor desativado, usa o movimento do mouse sem aceleração. Confira glfwRawMouseMotionSupported antes." } },
          { name: "GLFW_LOCK_KEY_MODS", desc: { en: "GLFW_TRUE: callbacks also get GLFW_MOD_CAPS_LOCK and GLFW_MOD_NUM_LOCK in mods.", pt: "GLFW_TRUE: os callbacks também recebem GLFW_MOD_CAPS_LOCK e GLFW_MOD_NUM_LOCK em mods." } },
        ],
      },
      { name: "value", type: "int", desc: { en: "The new value for that mode.", pt: "O novo valor para esse modo." } },
    ],
    example: `glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
if (glfwRawMouseMotionSupported())
    glfwSetInputMode(window, GLFW_RAW_MOUSE_MOTION, GLFW_TRUE);

// Tab frees the mouse for the menu
if (glfwGetKey(window, GLFW_KEY_TAB) == GLFW_PRESS)
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);`,
    related: ["glfwSetCursorPosCallback", "glfwRawMouseMotionSupported", "glfwGetKey"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwRawMouseMotionSupported",
    category: "glfw-input",
    since: "GLFW 3.3",
    signature: "int glfwRawMouseMotionSupported(void);",
    summary: {
      en: "Asks whether this system can deliver raw (unaccelerated) mouse motion.",
      pt: "Pergunta se este sistema consegue entregar o movimento bruto (sem aceleração) do mouse.",
    },
    description: {
      en: "The operating system normally adds \"pointer acceleration\": a fast flick moves the cursor further than a slow one over the same distance. Good for a desktop, bad for aiming in a game, where the same hand movement should always turn the camera by the same angle.\n\nRaw motion skips that. It only works with the cursor disabled, and only where the platform offers it (Windows and X11 yes, macOS no).",
      pt: "O sistema operacional normalmente adiciona \"aceleração do ponteiro\": um movimento rápido leva o cursor mais longe que um lento na mesma distância. Bom para a área de trabalho, ruim para mirar num jogo, onde o mesmo movimento da mão deve sempre girar a câmera pelo mesmo ângulo.\n\nO movimento bruto pula isso. Só funciona com o cursor desativado, e só onde a plataforma oferece (Windows e X11 sim, macOS não).",
    },
    params: [],
    returns: { en: "GLFW_TRUE if raw motion is available, otherwise GLFW_FALSE.", pt: "GLFW_TRUE se o movimento bruto está disponível, senão GLFW_FALSE." },
    example: `if (glfwRawMouseMotionSupported())
    glfwSetInputMode(window, GLFW_RAW_MOUSE_MOTION, GLFW_TRUE);`,
    related: ["glfwSetInputMode"],
    khronos: `${DOCS}group__input.html`,
  },
  {
    name: "glfwGetTime",
    category: "glfw-input",
    since: "GLFW 1.0",
    signature: "double glfwGetTime(void);",
    summary: {
      en: "Returns the seconds since glfwInit, as a double with sub-microsecond precision.",
      pt: "Retorna os segundos desde glfwInit, como double com precisão abaixo do microssegundo.",
    },
    description: {
      en: "Two uses appear in almost every lesson. Animation: pass the time to a shader as a uniform, so things move with `sin(time)`. Frame time: subtract the time of the previous frame to get `deltaTime`, then multiply speeds by it, so movement is the same at 30 or 144 frames per second.\n\nThe clock uses the system's high-resolution timer. glfwSetTime can reset it, but you rarely need to.",
      pt: "Dois usos aparecem em quase toda lição. Animação: passe o tempo para um shader como uniform, para as coisas se moverem com `sin(time)`. Tempo de quadro: subtraia o tempo do quadro anterior para obter `deltaTime` e multiplique as velocidades por ele, para o movimento ser igual a 30 ou a 144 quadros por segundo.\n\nO relógio usa o timer de alta resolução do sistema. glfwSetTime pode reiniciá-lo, mas raramente é preciso.",
    },
    params: [],
    returns: {
      en: "Seconds since GLFW started (or since the last glfwSetTime). 0 if GLFW is not initialized.",
      pt: "Segundos desde que o GLFW iniciou (ou desde o último glfwSetTime). 0 se o GLFW não estiver iniciado.",
    },
    notes: [
      { en: "Keep it in a double. A float has only about 7 significant digits: after some hours the frame time rounds to steps of several milliseconds and animations stutter.", pt: "Guarde num double. Um float tem só uns 7 dígitos significativos: depois de algumas horas o tempo de quadro arredonda em degraus de vários milissegundos e as animações engasgam." },
    ],
    example: `double last = glfwGetTime();
while (!glfwWindowShouldClose(window)) {
    double now = glfwGetTime();
    float deltaTime = float(now - last);
    last = now;
    glUniform1f(timeLoc, float(now));
    update(deltaTime);
    render();
    glfwSwapBuffers(window);
    glfwPollEvents();
}`,
    related: ["glfwGetKey", "glfwSetWindowTitle"],
    khronos: `${DOCS}group__input.html`,
  },
];

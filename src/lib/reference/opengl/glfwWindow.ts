// src/lib/reference/opengl/glfwWindow.ts
// GLFW 3.4: window size and position, high-DPI, monitors, full screen, user pointer.
import type { RefEntry } from "../types";

const DOCS = "https://www.glfw.org/docs/3.4/";

export const glfwWindowEntries: RefEntry[] = [
  {
    name: "glfwGetFramebufferSize",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "void glfwGetFramebufferSize(GLFWwindow* window, int* width, int* height);",
    summary: {
      en: "Reads the size of the window's drawing area in PIXELS: the numbers glViewport needs.",
      pt: "Lê o tamanho da área de desenho da janela em PIXELS: os números que o glViewport precisa.",
    },
    description: {
      en: "GLFW measures windows in two units. Screen coordinates are what you pass to glfwCreateWindow. Pixels are the real dots of the framebuffer. On an ordinary screen both are the same; on a Retina Mac or a Windows laptop at 150% scaling, an 800×600 window can have a 1600×1200 framebuffer.\n\nOpenGL works in pixels, so glViewport takes this size. Using glfwGetWindowSize instead draws the scene into one quarter of the window on a Retina screen.",
      pt: "O GLFW mede janelas em duas unidades. Coordenadas de tela são o que você passa para glfwCreateWindow. Pixels são os pontos reais do framebuffer. Numa tela comum as duas coincidem; num Mac Retina ou num notebook Windows com escala de 150%, uma janela de 800×600 pode ter um framebuffer de 1600×1200.\n\nO OpenGL trabalha em pixels, então o glViewport recebe este tamanho. Usar glfwGetWindowSize no lugar desenha a cena em um quarto da janela numa tela Retina.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to measure.", pt: "A janela a medir." } },
      { name: "width", type: "int*", desc: { en: "Where to write the width in pixels, or NULL.", pt: "Onde escrever a largura em pixels, ou NULL." } },
      { name: "height", type: "int*", desc: { en: "Where to write the height in pixels, or NULL.", pt: "Onde escrever a altura em pixels, ou NULL." } },
    ],
    notes: [
      { en: "A minimized window reports 0×0. Skip rendering then: a projection matrix with aspect = width / 0 is full of infinities.", pt: "Uma janela minimizada informa 0×0. Pule a renderização nesse caso: uma matriz de projeção com aspecto = largura / 0 fica cheia de infinitos." },
      { en: "To react to changes instead of asking every frame, use glfwSetFramebufferSizeCallback.", pt: "Para reagir às mudanças em vez de perguntar todo quadro, use glfwSetFramebufferSizeCallback." },
    ],
    example: `int fbW, fbH;
glfwGetFramebufferSize(window, &fbW, &fbH);
glViewport(0, 0, fbW, fbH);
float aspect = fbH > 0 ? (float)fbW / fbH : 1.0f;`,
    related: ["glfwSetFramebufferSizeCallback", "glfwGetWindowSize", "glViewport"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSetFramebufferSizeCallback",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "GLFWframebuffersizefun glfwSetFramebufferSizeCallback(GLFWwindow* window, GLFWframebuffersizefun callback);",
    summary: {
      en: "Registers a function GLFW calls whenever the framebuffer changes size, so you can update glViewport.",
      pt: "Registra uma função que o GLFW chama sempre que o framebuffer muda de tamanho, para você atualizar o glViewport.",
    },
    description: {
      en: "When the user resizes the window (or drags it to a monitor with another scale), the framebuffer gets a new size, but the viewport keeps the old one. The picture then looks stretched or cut off.\n\nThe callback receives the window and the new width and height in pixels. The classic body is a single glViewport call. Projection matrices that use the aspect ratio should read the new size too.",
      pt: "Quando o usuário redimensiona a janela (ou a arrasta para um monitor com outra escala), o framebuffer ganha um tamanho novo, mas o viewport continua com o antigo. A imagem fica esticada ou cortada.\n\nO callback recebe a janela e a nova largura e altura em pixels. O corpo clássico é uma única chamada a glViewport. Matrizes de projeção que usam a proporção também devem ler o tamanho novo.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to watch.", pt: "A janela a observar." } },
      { name: "callback", type: "GLFWframebuffersizefun", desc: { en: "Your function, `void f(GLFWwindow* window, int width, int height)`, or NULL to remove it.", pt: "Sua função, `void f(GLFWwindow* window, int width, int height)`, ou NULL para remover." } },
    ],
    returns: {
      en: "The callback that was set before, or NULL.",
      pt: "O callback que estava definido antes, ou NULL.",
    },
    notes: [
      { en: "It runs inside glfwPollEvents, on the main thread, with the context still current: gl* calls are fine there.", pt: "Ele roda dentro de glfwPollEvents, na thread principal, com o contexto ainda atual: chamadas gl* funcionam ali." },
      { en: "It is NOT called for the initial size. Call glViewport once yourself after creating the window.", pt: "Ele NÃO é chamado para o tamanho inicial. Chame glViewport uma vez você mesmo depois de criar a janela." },
      { en: "Prefer it over glfwSetWindowSizeCallback for the viewport: that one reports screen coordinates, not pixels.", pt: "Prefira este a glfwSetWindowSizeCallback para o viewport: aquele informa coordenadas de tela, não pixels." },
    ],
    example: `void onFramebufferSize(GLFWwindow*, int w, int h) {
    glViewport(0, 0, w, h);
}

glfwSetFramebufferSizeCallback(window, onFramebufferSize);`,
    related: ["glfwGetFramebufferSize", "glViewport", "glfwSetWindowSizeCallback"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwGetWindowSize",
    category: "glfw-window",
    since: "GLFW 1.0",
    signature: "void glfwGetWindowSize(GLFWwindow* window, int* width, int* height);",
    summary: {
      en: "Reads the size of the window's content area in SCREEN COORDINATES (not pixels).",
      pt: "Lê o tamanho da área de conteúdo da janela em COORDENADAS DE TELA (não pixels).",
    },
    description: {
      en: "This is the size in the same units as glfwCreateWindow and the cursor position. It does not include the title bar or borders (see glfwGetWindowFrameSize for those).\n\nUse it for things measured in screen coordinates, such as turning a cursor position into a 0–1 fraction of the window. For glViewport use glfwGetFramebufferSize.",
      pt: "Este é o tamanho nas mesmas unidades de glfwCreateWindow e da posição do cursor. Ele não inclui a barra de título nem as bordas (para isso veja glfwGetWindowFrameSize).\n\nUse para coisas medidas em coordenadas de tela, como transformar a posição do cursor numa fração 0–1 da janela. Para o glViewport use glfwGetFramebufferSize.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to measure.", pt: "A janela a medir." } },
      { name: "width", type: "int*", desc: { en: "Where to write the width, or NULL.", pt: "Onde escrever a largura, ou NULL." } },
      { name: "height", type: "int*", desc: { en: "Where to write the height, or NULL.", pt: "Onde escrever a altura, ou NULL." } },
    ],
    example: `double mx, my;
int ww, wh;
glfwGetCursorPos(window, &mx, &my);
glfwGetWindowSize(window, &ww, &wh);     // same units as the cursor
float u = (float)(mx / ww), v = 1.0f - (float)(my / wh);`,
    related: ["glfwGetFramebufferSize", "glfwGetWindowFrameSize", "glfwGetCursorPos"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSetWindowSizeCallback",
    category: "glfw-window",
    since: "GLFW 1.0",
    signature: "GLFWwindowsizefun glfwSetWindowSizeCallback(GLFWwindow* window, GLFWwindowsizefun callback);",
    summary: {
      en: "Registers a function called when the window's content area changes size, in screen coordinates.",
      pt: "Registra uma função chamada quando a área de conteúdo da janela muda de tamanho, em coordenadas de tela.",
    },
    description: {
      en: "The twin of glfwSetFramebufferSizeCallback, in the other unit. Use it for layout that is measured in screen coordinates, such as a user interface. For anything OpenGL (the viewport, render targets) use the framebuffer callback.",
      pt: "O gêmeo de glfwSetFramebufferSizeCallback, na outra unidade. Use para layout medido em coordenadas de tela, como uma interface. Para tudo do OpenGL (o viewport, render targets) use o callback do framebuffer.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to watch.", pt: "A janela a observar." } },
      { name: "callback", type: "GLFWwindowsizefun", desc: { en: "Your function, `void f(GLFWwindow* window, int width, int height)`, or NULL.", pt: "Sua função, `void f(GLFWwindow* window, int width, int height)`, ou NULL." } },
    ],
    returns: { en: "The callback that was set before, or NULL.", pt: "O callback que estava definido antes, ou NULL." },
    example: `glfwSetWindowSizeCallback(window, [](GLFWwindow*, int w, int h) {
    ui.layout(w, h);   // screen coordinates
});`,
    related: ["glfwSetFramebufferSizeCallback", "glfwGetWindowSize"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwGetWindowFrameSize",
    category: "glfw-window",
    since: "GLFW 3.1",
    signature: "void glfwGetWindowFrameSize(GLFWwindow* window, int* left, int* top, int* right, int* bottom);",
    summary: {
      en: "Reads how thick the window's frame is on each side: the title bar on top and the borders.",
      pt: "Lê a espessura da moldura da janela em cada lado: a barra de título em cima e as bordas.",
    },
    description: {
      en: "The size you give glfwCreateWindow is the content only. The system adds a title bar and borders around it. To center the WHOLE window on the screen, or to fit it inside the work area, you need those extra sizes.\n\nThe four numbers are the distances from each edge of the content area to the matching edge of the frame, in screen coordinates. `top` is usually the title bar height.",
      pt: "O tamanho que você dá a glfwCreateWindow é só o conteúdo. O sistema coloca uma barra de título e bordas em volta. Para centralizar a janela INTEIRA na tela, ou fazê-la caber na área de trabalho, você precisa desses tamanhos a mais.\n\nOs quatro números são as distâncias de cada borda da área de conteúdo até a borda correspondente da moldura, em coordenadas de tela. `top` costuma ser a altura da barra de título.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to measure.", pt: "A janela a medir." } },
      { name: "left", type: "int*", desc: { en: "Width of the left border, or NULL.", pt: "Largura da borda esquerda, ou NULL." } },
      { name: "top", type: "int*", desc: { en: "Height of the top part (title bar + border), or NULL.", pt: "Altura da parte de cima (barra de título + borda), ou NULL." } },
      { name: "right", type: "int*", desc: { en: "Width of the right border, or NULL.", pt: "Largura da borda direita, ou NULL." } },
      { name: "bottom", type: "int*", desc: { en: "Height of the bottom border, or NULL.", pt: "Altura da borda de baixo, ou NULL." } },
    ],
    notes: [
      { en: "The frame may only be known once the window exists, so measure after glfwCreateWindow (a hidden window works).", pt: "A moldura pode só ser conhecida depois que a janela existe, então meça depois de glfwCreateWindow (uma janela escondida serve)." },
    ],
    example: `int l, t, r, b;
glfwGetWindowFrameSize(window, &l, &t, &r, &b);
int outerW = w + l + r;   // whole window, frame included
int outerH = h + t + b;`,
    related: ["glfwGetWindowSize", "glfwSetWindowPos", "glfwGetMonitorWorkarea"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSetWindowPos",
    category: "glfw-window",
    since: "GLFW 1.0",
    signature: "void glfwSetWindowPos(GLFWwindow* window, int xpos, int ypos);",
    summary: {
      en: "Moves the window so the top-left corner of its CONTENT area lands at (xpos, ypos) on the desktop.",
      pt: "Move a janela para que o canto superior esquerdo da área de CONTEÚDO fique em (xpos, ypos) na área de trabalho.",
    },
    description: {
      en: "Positions are in screen coordinates on the virtual desktop that spans every monitor: (0, 0) is the top-left of the primary monitor, and y grows downwards (unlike OpenGL).\n\nThe point is the corner of the content, not of the title bar. So placing the window at y = 0 puts its title bar above the screen; add the `top` size from glfwGetWindowFrameSize.\n\nTo avoid a visible jump, create the window hidden (hint GLFW_VISIBLE = GLFW_FALSE), move it, then call glfwShowWindow. GLFW 3.4 can also open it in place with the hints GLFW_POSITION_X / GLFW_POSITION_Y.",
      pt: "As posições estão em coordenadas de tela na área de trabalho virtual que cobre todos os monitores: (0, 0) é o canto superior esquerdo do monitor principal, e o y cresce para baixo (ao contrário do OpenGL).\n\nO ponto é o canto do conteúdo, não da barra de título. Então colocar a janela em y = 0 deixa a barra de título acima da tela; some o tamanho `top` de glfwGetWindowFrameSize.\n\nPara evitar um pulo visível, crie a janela escondida (hint GLFW_VISIBLE = GLFW_FALSE), mova e depois chame glfwShowWindow. O GLFW 3.4 também consegue abrir já no lugar com os hints GLFW_POSITION_X / GLFW_POSITION_Y.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to move.", pt: "A janela a mover." } },
      { name: "xpos", type: "int", desc: { en: "New x of the content area's left edge, in screen coordinates.", pt: "Novo x da borda esquerda da área de conteúdo, em coordenadas de tela." } },
      { name: "ypos", type: "int", desc: { en: "New y of the content area's top edge, in screen coordinates (y down).", pt: "Novo y da borda de cima da área de conteúdo, em coordenadas de tela (y para baixo)." } },
    ],
    notes: [
      { en: "Wayland does not let applications place their windows. There the call does nothing and reports GLFW_FEATURE_UNAVAILABLE.", pt: "O Wayland não deixa aplicações posicionarem as próprias janelas. Lá a chamada não faz nada e informa GLFW_FEATURE_UNAVAILABLE." },
      { en: "It has no effect on a full-screen window.", pt: "Não tem efeito numa janela em tela cheia." },
    ],
    example: `// center a hidden w×h window on the primary monitor's work area
int ax, ay, aw, ah, l, t, r, b;
glfwGetMonitorWorkarea(glfwGetPrimaryMonitor(), &ax, &ay, &aw, &ah);
glfwGetWindowFrameSize(window, &l, &t, &r, &b);
glfwSetWindowPos(window,
    ax + (aw - (w + l + r)) / 2 + l,
    ay + (ah - (h + t + b)) / 2 + t);
glfwShowWindow(window);`,
    related: ["glfwGetMonitorWorkarea", "glfwGetWindowFrameSize", "glfwShowWindow", "glfwWindowHint"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwShowWindow",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "void glfwShowWindow(GLFWwindow* window);",
    summary: {
      en: "Makes a hidden window visible.",
      pt: "Torna visível uma janela escondida.",
    },
    description: {
      en: "Windows are visible right after glfwCreateWindow, unless you set the hint GLFW_VISIBLE to GLFW_FALSE. Hiding the window first lets you move it, resize it or draw a first frame before the user sees anything. Then call glfwShowWindow.\n\nIt does nothing if the window is already visible or in full screen. glfwHideWindow does the opposite.",
      pt: "As janelas ficam visíveis logo depois de glfwCreateWindow, a não ser que você defina o hint GLFW_VISIBLE como GLFW_FALSE. Esconder a janela antes deixa você movê-la, redimensioná-la ou desenhar um primeiro quadro antes que o usuário veja algo. Depois chame glfwShowWindow.\n\nNão faz nada se a janela já está visível ou em tela cheia. glfwHideWindow faz o contrário.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to show.", pt: "A janela a mostrar." } },
    ],
    notes: [
      { en: "Showing a window usually also gives it keyboard focus (hint GLFW_FOCUS_ON_SHOW, on by default).", pt: "Mostrar uma janela normalmente também dá a ela o foco do teclado (hint GLFW_FOCUS_ON_SHOW, ligado por padrão)." },
    ],
    example: `glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
GLFWwindow* window = glfwCreateWindow(800, 600, "App", nullptr, nullptr);
glfwSetWindowPos(window, 200, 150);
glfwShowWindow(window);   // appears already in place`,
    related: ["glfwWindowHint", "glfwSetWindowPos"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSetWindowTitle",
    category: "glfw-window",
    since: "GLFW 1.0",
    signature: "void glfwSetWindowTitle(GLFWwindow* window, const char* title);",
    summary: {
      en: "Changes the text in the window's title bar.",
      pt: "Muda o texto da barra de título da janela.",
    },
    description: {
      en: "A cheap place to show live numbers while you develop, such as frames per second or the frame time, without drawing any text with OpenGL. Update it a few times per second, not every frame: on some systems the call is slow.",
      pt: "Um lugar barato para mostrar números ao vivo enquanto você desenvolve, como quadros por segundo ou o tempo de quadro, sem desenhar texto com OpenGL. Atualize algumas vezes por segundo, não a cada quadro: em alguns sistemas a chamada é lenta.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to rename.", pt: "A janela a renomear." } },
      { name: "title", type: "const char*", desc: { en: "The new title, UTF-8. GLFW copies it, so a temporary buffer is fine.", pt: "O novo título, UTF-8. O GLFW copia, então um buffer temporário serve." } },
    ],
    example: `static double last = glfwGetTime();
static int frames = 0;
++frames;
if (glfwGetTime() - last >= 0.5) {
    char title[64];
    std::snprintf(title, sizeof title, "Demo - %.1f fps", frames / (glfwGetTime() - last));
    glfwSetWindowTitle(window, title);
    last = glfwGetTime();
    frames = 0;
}`,
    related: ["glfwCreateWindow", "glfwGetTime"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwGetWindowContentScale",
    category: "glfw-window",
    since: "GLFW 3.3",
    signature: "void glfwGetWindowContentScale(GLFWwindow* window, float* xscale, float* yscale);",
    summary: {
      en: "Reads the display scale the user chose for the window's monitor, e.g. 1.5 for 150%.",
      pt: "Lê a escala de exibição que o usuário escolheu para o monitor da janela, ex.: 1.5 para 150%.",
    },
    description: {
      en: "On high-DPI screens people enlarge everything (125%, 150%, 200%) so text stays readable. The content scale is that factor. Multiply the size of your text and user interface by it, so a 16-pixel font becomes 24 pixels at 1.5 and looks the same size as everywhere else.\n\nIt is not the same as framebuffer size ÷ window size: on Windows and X11 the window size already grows with the scale when GLFW_SCALE_TO_MONITOR is on, on macOS it never does.",
      pt: "Em telas de alta densidade as pessoas aumentam tudo (125%, 150%, 200%) para o texto continuar legível. A escala de conteúdo é esse fator. Multiplique o tamanho do texto e da interface por ela, e uma fonte de 16 pixels vira 24 pixels em 1.5, parecendo do mesmo tamanho que no resto do sistema.\n\nNão é o mesmo que tamanho do framebuffer ÷ tamanho da janela: no Windows e no X11 o tamanho da janela já cresce com a escala quando GLFW_SCALE_TO_MONITOR está ligado; no macOS nunca cresce.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to ask about.", pt: "A janela a consultar." } },
      { name: "xscale", type: "float*", desc: { en: "Where to write the horizontal scale, or NULL.", pt: "Onde escrever a escala horizontal, ou NULL." } },
      { name: "yscale", type: "float*", desc: { en: "Where to write the vertical scale, or NULL.", pt: "Onde escrever a escala vertical, ou NULL." } },
    ],
    notes: [
      { en: "It changes when the window moves to another monitor; glfwSetWindowContentScaleCallback tells you when.", pt: "Ela muda quando a janela vai para outro monitor; glfwSetWindowContentScaleCallback avisa quando." },
    ],
    example: `float sx, sy;
glfwGetWindowContentScale(window, &sx, &sy);
float fontPx = 16.0f * sy;   // same apparent size at 100%, 150%, 200%`,
    related: ["glfwGetFramebufferSize", "glfwWindowHint"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSetWindowUserPointer",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "void glfwSetWindowUserPointer(GLFWwindow* window, void* pointer);",
    summary: {
      en: "Attaches one pointer of your own to the window, so callbacks can reach your objects without globals.",
      pt: "Prende um ponteiro seu à janela, para que os callbacks alcancem seus objetos sem variáveis globais.",
    },
    description: {
      en: "GLFW callbacks are plain C functions: they receive the window and the event, nothing else. If the key callback must move a camera, how does it find the camera? The quick answer is a global variable; the clean one is the user pointer.\n\nStore a pointer to your app object once, then read it back inside any callback with glfwGetWindowUserPointer. GLFW never looks at it or frees it.",
      pt: "Os callbacks do GLFW são funções C simples: recebem a janela e o evento, mais nada. Se o callback de tecla precisa mover uma câmera, como ele acha a câmera? A resposta rápida é uma variável global; a limpa é o user pointer.\n\nGuarde uma vez um ponteiro para o seu objeto da aplicação e leia de volta dentro de qualquer callback com glfwGetWindowUserPointer. O GLFW nunca olha nem libera esse ponteiro.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to attach the pointer to.", pt: "A janela à qual prender o ponteiro." } },
      { name: "pointer", type: "void*", desc: { en: "Any pointer, usually `this` or the address of your app struct. Starts as NULL.", pt: "Qualquer ponteiro, normalmente `this` ou o endereço da sua struct da aplicação. Começa NULL." } },
    ],
    notes: [
      { en: "The object must live as long as the window, or callbacks will read a dangling pointer.", pt: "O objeto precisa viver tanto quanto a janela, senão os callbacks leem um ponteiro solto." },
    ],
    example: `struct App { Camera camera; };
App app;
glfwSetWindowUserPointer(window, &app);
glfwSetScrollCallback(window, [](GLFWwindow* w, double, double dy) {
    auto* app = static_cast<App*>(glfwGetWindowUserPointer(w));
    app->camera.zoom(dy);
});`,
    related: ["glfwGetWindowUserPointer", "glfwSetKeyCallback"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwGetWindowUserPointer",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "void* glfwGetWindowUserPointer(GLFWwindow* window);",
    summary: {
      en: "Reads back the pointer stored with glfwSetWindowUserPointer.",
      pt: "Lê de volta o ponteiro guardado com glfwSetWindowUserPointer.",
    },
    description: {
      en: "Used inside callbacks: they receive the window, ask it for the user pointer and cast it back to your type with static_cast.",
      pt: "Usada dentro dos callbacks: eles recebem a janela, pedem a ela o user pointer e convertem de volta para o seu tipo com static_cast.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to read from.", pt: "A janela de onde ler." } },
    ],
    returns: {
      en: "The stored pointer, or NULL if none was set.",
      pt: "O ponteiro guardado, ou NULL se nenhum foi definido.",
    },
    example: `void onKey(GLFWwindow* w, int key, int, int action, int) {
    auto* app = static_cast<App*>(glfwGetWindowUserPointer(w));
    if (key == GLFW_KEY_P && action == GLFW_PRESS) app->paused = !app->paused;
}`,
    related: ["glfwSetWindowUserPointer"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwGetPrimaryMonitor",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "GLFWmonitor* glfwGetPrimaryMonitor(void);",
    summary: {
      en: "Returns the user's main monitor, where the taskbar or menu bar usually is.",
      pt: "Retorna o monitor principal do usuário, onde costumam ficar a barra de tarefas ou a barra de menus.",
    },
    description: {
      en: "A GLFWmonitor* is a handle you pass to the monitor functions (work area, video mode) or to glfwCreateWindow / glfwSetWindowMonitor for full screen. Other monitors come from glfwGetMonitors.",
      pt: "Um GLFWmonitor* é um identificador que você passa para as funções de monitor (área de trabalho, modo de vídeo) ou para glfwCreateWindow / glfwSetWindowMonitor para tela cheia. Os outros monitores vêm de glfwGetMonitors.",
    },
    params: [],
    returns: {
      en: "The primary monitor, or NULL if no monitor was found.",
      pt: "O monitor principal, ou NULL se nenhum monitor foi encontrado.",
    },
    notes: [
      { en: "The handle becomes invalid if the monitor is disconnected; do not keep it forever.", pt: "O identificador deixa de valer se o monitor for desconectado; não guarde para sempre." },
    ],
    example: `GLFWmonitor* monitor = glfwGetPrimaryMonitor();
const GLFWvidmode* mode = glfwGetVideoMode(monitor);
std::printf("%dx%d @ %d Hz\\n", mode->width, mode->height, mode->refreshRate);`,
    related: ["glfwGetVideoMode", "glfwGetMonitorWorkarea", "glfwSetWindowMonitor"],
    khronos: `${DOCS}group__monitor.html`,
  },
  {
    name: "glfwGetMonitorWorkarea",
    category: "glfw-window",
    since: "GLFW 3.3",
    signature: "void glfwGetMonitorWorkarea(GLFWmonitor* monitor, int* xpos, int* ypos, int* width, int* height);",
    summary: {
      en: "Reads the part of a monitor that windows may use: the screen minus the taskbar, dock or menu bar.",
      pt: "Lê a parte de um monitor que as janelas podem usar: a tela menos a barra de tarefas, o dock ou a barra de menus.",
    },
    description: {
      en: "The work area is the rectangle a maximized window fills. Center windows inside it, not inside the full screen, or the window ends up partly under the taskbar.\n\nAll four values are in screen coordinates on the virtual desktop. xpos and ypos are not always 0: a taskbar on the left or top shifts them, and so does a second monitor.",
      pt: "A área de trabalho é o retângulo que uma janela maximizada ocupa. Centralize janelas dentro dela, não dentro da tela inteira, senão a janela fica parcialmente embaixo da barra de tarefas.\n\nOs quatro valores estão em coordenadas de tela na área de trabalho virtual. xpos e ypos nem sempre são 0: uma barra de tarefas à esquerda ou em cima os desloca, e um segundo monitor também.",
    },
    params: [
      { name: "monitor", type: "GLFWmonitor*", desc: { en: "The monitor, e.g. glfwGetPrimaryMonitor().", pt: "O monitor, ex.: glfwGetPrimaryMonitor()." } },
      { name: "xpos", type: "int*", desc: { en: "Left edge of the work area, or NULL.", pt: "Borda esquerda da área de trabalho, ou NULL." } },
      { name: "ypos", type: "int*", desc: { en: "Top edge of the work area, or NULL.", pt: "Borda de cima da área de trabalho, ou NULL." } },
      { name: "width", type: "int*", desc: { en: "Width of the work area, or NULL.", pt: "Largura da área de trabalho, ou NULL." } },
      { name: "height", type: "int*", desc: { en: "Height of the work area, or NULL.", pt: "Altura da área de trabalho, ou NULL." } },
    ],
    example: `int ax, ay, aw, ah;
glfwGetMonitorWorkarea(glfwGetPrimaryMonitor(), &ax, &ay, &aw, &ah);
// center of the usable area
int cx = ax + aw / 2, cy = ay + ah / 2;`,
    related: ["glfwGetPrimaryMonitor", "glfwSetWindowPos", "glfwGetWindowFrameSize"],
    khronos: `${DOCS}group__monitor.html`,
  },
  {
    name: "glfwGetVideoMode",
    category: "glfw-window",
    since: "GLFW 3.0",
    signature: "const GLFWvidmode* glfwGetVideoMode(GLFWmonitor* monitor);",
    summary: {
      en: "Reads a monitor's current resolution, color depth and refresh rate.",
      pt: "Lê a resolução, a profundidade de cor e a taxa de atualização atuais de um monitor.",
    },
    description: {
      en: "The returned GLFWvidmode has `width` and `height` (in screen coordinates), `redBits`, `greenBits`, `blueBits` and `refreshRate` (in Hz).\n\nThe usual use is full screen without changing the monitor's mode (\"borderless full screen\"): pass exactly these width, height and refresh rate to glfwSetWindowMonitor or glfwCreateWindow, and the monitor does not flicker into a new mode.",
      pt: "O GLFWvidmode retornado tem `width` e `height` (em coordenadas de tela), `redBits`, `greenBits`, `blueBits` e `refreshRate` (em Hz).\n\nO uso comum é tela cheia sem trocar o modo do monitor (\"tela cheia sem borda\"): passe exatamente essa largura, altura e taxa para glfwSetWindowMonitor ou glfwCreateWindow, e o monitor não pisca trocando de modo.",
    },
    params: [
      { name: "monitor", type: "GLFWmonitor*", desc: { en: "The monitor to ask about.", pt: "O monitor a consultar." } },
    ],
    returns: {
      en: "A pointer owned by GLFW, valid until the monitor is disconnected or GLFW terminates. Do not free it.",
      pt: "Um ponteiro do GLFW, válido até o monitor ser desconectado ou o GLFW terminar. Não libere.",
    },
    example: `const GLFWvidmode* mode = glfwGetVideoMode(glfwGetPrimaryMonitor());
double frameBudgetMs = 1000.0 / mode->refreshRate;   // 16.7 ms at 60 Hz`,
    related: ["glfwGetPrimaryMonitor", "glfwSetWindowMonitor"],
    khronos: `${DOCS}group__monitor.html`,
  },
  {
    name: "glfwSetWindowMonitor",
    category: "glfw-window",
    since: "GLFW 3.2",
    signature: "void glfwSetWindowMonitor(GLFWwindow* window, GLFWmonitor* monitor, int xpos, int ypos, int width, int height, int refreshRate);",
    summary: {
      en: "Switches a window between full screen on a monitor and a normal window, keeping the same OpenGL context.",
      pt: "Alterna uma janela entre tela cheia num monitor e janela normal, mantendo o mesmo contexto OpenGL.",
    },
    description: {
      en: "Pass a monitor to go full screen on it with the given resolution and refresh rate. Pass NULL to come back to a normal window at (xpos, ypos) with the given size.\n\nThe window and its context survive, so your buffers, textures and shaders stay valid. Remember the windowed position and size (glfwGetWindowPos, glfwGetWindowSize) BEFORE going full screen, so you can restore them.",
      pt: "Passe um monitor para ir para tela cheia nele com a resolução e a taxa dadas. Passe NULL para voltar a uma janela normal em (xpos, ypos) com o tamanho dado.\n\nA janela e o contexto sobrevivem, então buffers, texturas e shaders continuam válidos. Guarde a posição e o tamanho em janela (glfwGetWindowPos, glfwGetWindowSize) ANTES de ir para tela cheia, para poder restaurar.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to switch.", pt: "A janela a alternar." } },
      { name: "monitor", type: "GLFWmonitor*", desc: { en: "The monitor for full screen, or NULL for windowed mode.", pt: "O monitor para tela cheia, ou NULL para modo janela." } },
      { name: "xpos", type: "int", desc: { en: "Windowed mode: x of the content area. Ignored in full screen.", pt: "Modo janela: x da área de conteúdo. Ignorado em tela cheia." } },
      { name: "ypos", type: "int", desc: { en: "Windowed mode: y of the content area. Ignored in full screen.", pt: "Modo janela: y da área de conteúdo. Ignorado em tela cheia." } },
      { name: "width", type: "int", desc: { en: "Content width (windowed) or resolution width (full screen).", pt: "Largura do conteúdo (janela) ou largura da resolução (tela cheia)." } },
      { name: "height", type: "int", desc: { en: "Content height (windowed) or resolution height (full screen).", pt: "Altura do conteúdo (janela) ou altura da resolução (tela cheia)." } },
      { name: "refreshRate", type: "int", desc: { en: "Full screen refresh rate in Hz, or GLFW_DONT_CARE for the highest available. Ignored in windowed mode.", pt: "Taxa de atualização da tela cheia em Hz, ou GLFW_DONT_CARE para a maior disponível. Ignorada no modo janela." } },
    ],
    notes: [
      { en: "The framebuffer size changes, so your framebuffer-size callback runs: the viewport follows if it calls glViewport.", pt: "O tamanho do framebuffer muda, então o seu callback de tamanho do framebuffer roda: o viewport acompanha se ele chama glViewport." },
      { en: "On Wayland the windowed position is ignored: applications cannot place their windows there.", pt: "No Wayland a posição em modo janela é ignorada: lá as aplicações não podem posicionar as próprias janelas." },
    ],
    example: `void toggleFullscreen(GLFWwindow* w) {
    static int wx, wy, ww, wh;
    if (glfwGetWindowMonitor(w)) {                          // full screen -> window
        glfwSetWindowMonitor(w, nullptr, wx, wy, ww, wh, 0);
    } else {                                                // window -> full screen
        glfwGetWindowPos(w, &wx, &wy);
        glfwGetWindowSize(w, &ww, &wh);
        GLFWmonitor* m = glfwGetPrimaryMonitor();
        const GLFWvidmode* mode = glfwGetVideoMode(m);
        glfwSetWindowMonitor(w, m, 0, 0, mode->width, mode->height, mode->refreshRate);
    }
}`,
    related: ["glfwGetPrimaryMonitor", "glfwGetVideoMode", "glfwCreateWindow"],
    khronos: `${DOCS}group__window.html`,
  },
];

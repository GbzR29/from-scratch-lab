// src/lib/reference/opengl/glfwSetup.ts
// GLFW 3.4: starting the library, creating the window + OpenGL context, the frame loop.
import type { RefEntry } from "../types";
import { INVALID_ENUM, INVALID_VALUE, NO_CURRENT_CONTEXT, NO_WINDOW_CONTEXT, NOT_INITIALIZED, PLATFORM_ERROR } from "./glfwErrors";

const DOCS = "https://www.glfw.org/docs/3.4/";

export const glfwSetupEntries: RefEntry[] = [
  {
    name: "glfwInit",
    errors: [
      { code: "GLFW_PLATFORM_UNAVAILABLE", when: { en: "No supported window system was found (for example, no display on a Linux server).", pt: "Nenhum sistema de janelas compatível foi encontrado (por exemplo, sem display num servidor Linux)." } },
      PLATFORM_ERROR,
    ],
    category: "glfw-setup",
    since: "GLFW 1.0",
    signature: "int glfwInit(void);",
    summary: {
      en: "Starts the GLFW library. Call it once, before any other GLFW function that needs it.",
      pt: "Inicia a biblioteca GLFW. Chame uma vez, antes de qualquer outra função do GLFW que precise dela.",
    },
    description: {
      en: "GLFW talks to the operating system for you: it opens windows, creates the OpenGL context and reads the keyboard and mouse. glfwInit connects to the window system (Win32, Cocoa on macOS, X11 or Wayland on Linux) and prepares everything else.\n\nIt returns GLFW_TRUE when it worked. If it fails, nothing else in GLFW will work, so stop the program. Calling it again while GLFW is already running does nothing and returns GLFW_TRUE.",
      pt: "O GLFW conversa com o sistema operacional por você: abre janelas, cria o contexto OpenGL e lê teclado e mouse. glfwInit se conecta ao sistema de janelas (Win32, Cocoa no macOS, X11 ou Wayland no Linux) e prepara o resto.\n\nEla retorna GLFW_TRUE quando dá certo. Se falhar, nada mais no GLFW funciona, então encerre o programa. Chamar de novo com o GLFW já iniciado não faz nada e retorna GLFW_TRUE.",
    },
    params: [],
    returns: {
      en: "GLFW_TRUE (1) on success, GLFW_FALSE (0) if the window system could not be reached. The reason goes to the error callback (glfwSetErrorCallback) and to glfwGetError.",
      pt: "GLFW_TRUE (1) se deu certo, GLFW_FALSE (0) se o sistema de janelas não respondeu. O motivo vai para o callback de erro (glfwSetErrorCallback) e para glfwGetError.",
    },
    notes: [
      { en: "Set the error callback BEFORE glfwInit, so a failure in glfwInit itself is printed.", pt: "Defina o callback de erro ANTES de glfwInit, para que uma falha da própria glfwInit seja impressa." },
      { en: "Call it from the main thread. On macOS, windows and events only work there.", pt: "Chame da thread principal. No macOS, janelas e eventos só funcionam nela." },
      { en: "Every successful glfwInit needs a matching glfwTerminate at the end of the program.", pt: "Todo glfwInit que deu certo precisa de um glfwTerminate correspondente no fim do programa." },
    ],
    example: `glfwSetErrorCallback(onGlfwError);
if (!glfwInit()) {
    std::fprintf(stderr, "GLFW could not start\\n");
    return 1;
}
// ... create the window, run the loop ...
glfwTerminate();`,
    related: ["glfwTerminate", "glfwSetErrorCallback", "glfwCreateWindow"],
    khronos: `${DOCS}group__init.html`,
  },
  {
    name: "glfwTerminate",
    errors: [PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 1.0",
    signature: "void glfwTerminate(void);",
    summary: {
      en: "Shuts GLFW down: destroys every window that is still open and frees what GLFW allocated.",
      pt: "Desliga o GLFW: destrói toda janela ainda aberta e libera o que o GLFW alocou.",
    },
    description: {
      en: "Call it once at the very end of the program. Windows you forgot to destroy are destroyed here, and so are their OpenGL contexts.\n\nAfter glfwTerminate, no GLFW function works again until you call glfwInit once more. Any OpenGL object (buffer, texture, shader) belonged to a context that no longer exists, so delete them BEFORE this call if you want to free them cleanly.",
      pt: "Chame uma vez, bem no fim do programa. Janelas que você esqueceu de destruir são destruídas aqui, junto com seus contextos OpenGL.\n\nDepois de glfwTerminate nenhuma função do GLFW funciona até você chamar glfwInit de novo. Todo objeto OpenGL (buffer, textura, shader) pertencia a um contexto que deixou de existir, então apague-os ANTES desta chamada se quiser liberá-los com cuidado.",
    },
    params: [],
    notes: [
      { en: "It is safe to call even when glfwInit failed: it then does nothing, because glfwInit already cleaned up after itself.", pt: "É seguro chamar mesmo quando glfwInit falhou: ela não faz nada, porque glfwInit já limpou o que tinha feito." },
      { en: "Never call it from inside a GLFW callback.", pt: "Nunca chame de dentro de um callback do GLFW." },
    ],
    example: `glDeleteVertexArrays(1, &vao);   // free GL objects while the context is alive
glDeleteProgram(program);
glfwDestroyWindow(window);
glfwTerminate();`,
    related: ["glfwInit", "glfwDestroyWindow"],
    khronos: `${DOCS}group__init.html`,
  },
  {
    name: "glfwSetErrorCallback",
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "GLFWerrorfun glfwSetErrorCallback(GLFWerrorfun callback);",
    summary: {
      en: "Registers a function that GLFW calls with a code and a readable message whenever something fails.",
      pt: "Registra uma função que o GLFW chama com um código e uma mensagem legível sempre que algo falha.",
    },
    description: {
      en: "Most GLFW functions do not return an error code. When one fails, GLFW calls your error callback instead. Without one, failures are silent: the window simply does not appear and you do not know why.\n\nThe callback receives `int error_code` (a constant such as GLFW_VERSION_UNAVAILABLE) and `const char* description` (an English sentence). This is one of the few functions you may call BEFORE glfwInit, and you should.",
      pt: "A maioria das funções do GLFW não retorna código de erro. Quando uma falha, o GLFW chama o seu callback de erro. Sem ele, as falhas são silenciosas: a janela só não aparece e você não sabe por quê.\n\nO callback recebe `int error_code` (uma constante como GLFW_VERSION_UNAVAILABLE) e `const char* description` (uma frase em inglês). Esta é uma das poucas funções que podem ser chamadas ANTES de glfwInit, e deveria ser.",
    },
    params: [
      {
        name: "callback",
        type: "GLFWerrorfun",
        desc: { en: "Your function, `void f(int error_code, const char* description)`, or NULL to remove the current one.", pt: "Sua função, `void f(int error_code, const char* description)`, ou NULL para remover a atual." },
        values: [
          { name: "GLFW_VERSION_UNAVAILABLE", desc: { en: "The driver cannot create the OpenGL version you asked for with glfwWindowHint.", pt: "O driver não consegue criar a versão do OpenGL que você pediu com glfwWindowHint." } },
          { name: "GLFW_API_UNAVAILABLE", desc: { en: "No OpenGL driver at all (common in virtual machines and remote desktops).", pt: "Nenhum driver OpenGL (comum em máquinas virtuais e áreas de trabalho remotas)." } },
          { name: "GLFW_NO_CURRENT_CONTEXT", desc: { en: "A context function was called with no context current on this thread.", pt: "Uma função de contexto foi chamada sem contexto atual nesta thread." } },
          { name: "GLFW_FEATURE_UNAVAILABLE", desc: { en: "The platform cannot do this at all, e.g. moving a window on Wayland (GLFW 3.4).", pt: "A plataforma não consegue fazer isso, ex.: mover uma janela no Wayland (GLFW 3.4)." } },
          { name: "GLFW_PLATFORM_ERROR", desc: { en: "The operating system refused; the message says why.", pt: "O sistema operacional recusou; a mensagem diz por quê." } },
        ],
      },
    ],
    returns: {
      en: "The callback that was set before, or NULL.",
      pt: "O callback que estava definido antes, ou NULL.",
    },
    notes: [
      { en: "The description string belongs to GLFW and is only valid inside the callback. Copy it if you need it later.", pt: "A string da descrição pertence ao GLFW e só vale dentro do callback. Copie se precisar dela depois." },
    ],
    example: `void onGlfwError(int code, const char* description) {
    std::fprintf(stderr, "GLFW error 0x%X: %s\\n", code, description);
}

int main() {
    glfwSetErrorCallback(onGlfwError);   // before glfwInit
    if (!glfwInit()) return 1;
}`,
    related: ["glfwGetError", "glfwInit"],
    khronos: `${DOCS}group__init.html`,
  },
  {
    name: "glfwGetError",
    category: "glfw-setup",
    since: "GLFW 3.3",
    signature: "int glfwGetError(const char** description);",
    summary: {
      en: "Returns the last GLFW error on this thread (and its message), then clears it.",
      pt: "Retorna o último erro do GLFW nesta thread (e sua mensagem) e depois o apaga.",
    },
    description: {
      en: "An alternative to the error callback when you want to check one specific call: call the function, then ask glfwGetError whether it failed.\n\nIt returns GLFW_NO_ERROR (0) when nothing went wrong since the last check. Reading the error clears it, so a second call right after returns GLFW_NO_ERROR.",
      pt: "Uma alternativa ao callback de erro quando você quer conferir uma chamada específica: chame a função e depois pergunte a glfwGetError se ela falhou.\n\nRetorna GLFW_NO_ERROR (0) quando nada deu errado desde a última conferência. Ler o erro o apaga, então uma segunda chamada logo depois retorna GLFW_NO_ERROR.",
    },
    params: [
      { name: "description", type: "const char**", desc: { en: "Where to store a pointer to the message, or NULL if you only want the code. Set to NULL when there is no error.", pt: "Onde guardar um ponteiro para a mensagem, ou NULL se só quiser o código. Recebe NULL quando não há erro." } },
    ],
    returns: {
      en: "The error code (e.g. GLFW_VERSION_UNAVAILABLE), or GLFW_NO_ERROR.",
      pt: "O código do erro (ex.: GLFW_VERSION_UNAVAILABLE), ou GLFW_NO_ERROR.",
    },
    notes: [
      { en: "Works before glfwInit too, so you can see why glfwInit failed.", pt: "Funciona antes de glfwInit também, então dá para ver por que glfwInit falhou." },
    ],
    example: `GLFWwindow* window = glfwCreateWindow(800, 600, "App", nullptr, nullptr);
if (!window) {
    const char* why = nullptr;
    int code = glfwGetError(&why);
    std::fprintf(stderr, "window failed (0x%X): %s\\n", code, why ? why : "?");
}`,
    related: ["glfwSetErrorCallback"],
    khronos: `${DOCS}group__init.html`,
  },
  {
    name: "glfwGetVersionString",
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "const char* glfwGetVersionString(void);",
    summary: {
      en: "Describes the GLFW library that is actually running: version, platforms and build options.",
      pt: "Descreve a biblioteca GLFW que está de fato rodando: versão, plataformas e opções de compilação.",
    },
    description: {
      en: "Handy when a feature such as GLFW_POSITION_X (3.4) does nothing: print this string and check which GLFW your program really linked against. The header you compiled with and the library (.dll / .so) you run with can differ.\n\nA typical result looks like `3.4.0 Win32 WGL Null EGL OSMesa MinGW DLL`.",
      pt: "Útil quando um recurso como GLFW_POSITION_X (3.4) não faz nada: imprima esta string e veja com qual GLFW o programa realmente foi ligado. O header com que você compilou e a biblioteca (.dll / .so) com que você roda podem ser diferentes.\n\nUm resultado típico é `3.4.0 Win32 WGL Null EGL OSMesa MinGW DLL`.",
    },
    params: [],
    returns: {
      en: "A static string owned by GLFW. Do not free it. Can be called before glfwInit.",
      pt: "Uma string estática do GLFW. Não libere. Pode ser chamada antes de glfwInit.",
    },
    example: `std::printf("GLFW %s\\n", glfwGetVersionString());`,
    related: ["glfwInit", "glGetString"],
    khronos: `${DOCS}group__init.html`,
  },
  {
    name: "glfwWindowHint",
    errors: [NOT_INITIALIZED, INVALID_ENUM],
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "void glfwWindowHint(int hint, int value);",
    summary: {
      en: "Sets one option for the NEXT window created with glfwCreateWindow: OpenGL version, profile, MSAA, visibility…",
      pt: "Define uma opção para a PRÓXIMA janela criada com glfwCreateWindow: versão do OpenGL, profile, MSAA, visibilidade…",
    },
    description: {
      en: "glfwCreateWindow has only a few parameters. Everything else is set beforehand with hints: you call glfwWindowHint once per option, then create the window.\n\nHints stay set for every later window until glfwDefaultWindowHints or glfwTerminate. A hint is a request: if the driver cannot give an OpenGL version you asked for, glfwCreateWindow fails with GLFW_VERSION_UNAVAILABLE instead of silently giving you another one.",
      pt: "glfwCreateWindow tem poucos parâmetros. Todo o resto é definido antes com hints: você chama glfwWindowHint uma vez por opção e depois cria a janela.\n\nOs hints continuam valendo para toda janela seguinte até glfwDefaultWindowHints ou glfwTerminate. Um hint é um pedido: se o driver não consegue dar a versão do OpenGL que você pediu, glfwCreateWindow falha com GLFW_VERSION_UNAVAILABLE em vez de entregar outra em silêncio.",
    },
    params: [
      {
        name: "hint",
        type: "int",
        desc: { en: "Which option to set.", pt: "Qual opção definir." },
        values: [
          { name: "GLFW_CONTEXT_VERSION_MAJOR / _MINOR", desc: { en: "The OpenGL version to create, e.g. 4 and 6 for OpenGL 4.6. macOS stops at 4.1.", pt: "A versão do OpenGL a criar, ex.: 4 e 6 para OpenGL 4.6. O macOS para no 4.1." } },
          { name: "GLFW_OPENGL_PROFILE", desc: { en: "GLFW_OPENGL_CORE_PROFILE (modern functions only), GLFW_OPENGL_COMPAT_PROFILE (old ones too) or GLFW_OPENGL_ANY_PROFILE.", pt: "GLFW_OPENGL_CORE_PROFILE (só funções modernas), GLFW_OPENGL_COMPAT_PROFILE (as antigas também) ou GLFW_OPENGL_ANY_PROFILE." } },
          { name: "GLFW_OPENGL_FORWARD_COMPAT", desc: { en: "GLFW_TRUE removes everything deprecated. Required on macOS for any core context 3.2 or newer.", pt: "GLFW_TRUE remove tudo o que é obsoleto. Obrigatório no macOS para qualquer contexto core 3.2 ou mais novo." } },
          { name: "GLFW_CONTEXT_DEBUG", desc: { en: "GLFW_TRUE asks for a debug context, so glDebugMessageCallback gets detailed messages. Old name: GLFW_OPENGL_DEBUG_CONTEXT.", pt: "GLFW_TRUE pede um contexto de debug, para glDebugMessageCallback receber mensagens detalhadas. Nome antigo: GLFW_OPENGL_DEBUG_CONTEXT." } },
          { name: "GLFW_SAMPLES", desc: { en: "Samples per pixel for MSAA on the default framebuffer, e.g. 4. Default 0 (off).", pt: "Amostras por pixel para MSAA no framebuffer padrão, ex.: 4. Padrão 0 (desligado)." } },
          { name: "GLFW_DEPTH_BITS / GLFW_STENCIL_BITS", desc: { en: "Bits of the depth and stencil buffers. Defaults 24 and 8, which is what you want.", pt: "Bits do depth buffer e do stencil buffer. Padrões 24 e 8, que é o que você quer." } },
          { name: "GLFW_SRGB_CAPABLE", desc: { en: "GLFW_TRUE asks for a framebuffer that can do sRGB conversion (with glEnable(GL_FRAMEBUFFER_SRGB)).", pt: "GLFW_TRUE pede um framebuffer capaz de converter para sRGB (com glEnable(GL_FRAMEBUFFER_SRGB))." } },
          { name: "GLFW_RESIZABLE", desc: { en: "GLFW_FALSE gives a window the user cannot resize. Default GLFW_TRUE.", pt: "GLFW_FALSE dá uma janela que o usuário não pode redimensionar. Padrão GLFW_TRUE." } },
          { name: "GLFW_VISIBLE", desc: { en: "GLFW_FALSE creates the window hidden; show it later with glfwShowWindow (e.g. after moving it).", pt: "GLFW_FALSE cria a janela escondida; mostre depois com glfwShowWindow (ex.: depois de movê-la)." } },
          { name: "GLFW_POSITION_X / _Y", desc: { en: "GLFW 3.4: where the window opens, in screen coordinates. Default GLFW_ANY_POSITION (the system decides).", pt: "GLFW 3.4: onde a janela abre, em coordenadas de tela. Padrão GLFW_ANY_POSITION (o sistema decide)." } },
          { name: "GLFW_SCALE_TO_MONITOR", desc: { en: "GLFW_TRUE grows the window on high-DPI monitors (Windows, X11) so it keeps its apparent size.", pt: "GLFW_TRUE aumenta a janela em monitores de alta densidade (Windows, X11) para manter o tamanho aparente." } },
        ],
      },
      { name: "value", type: "int", desc: { en: "The new value: a number, GLFW_TRUE / GLFW_FALSE, or a constant such as GLFW_OPENGL_CORE_PROFILE.", pt: "O novo valor: um número, GLFW_TRUE / GLFW_FALSE, ou uma constante como GLFW_OPENGL_CORE_PROFILE." } },
    ],
    notes: [
      { en: "Hints must come AFTER glfwInit (which resets them) and BEFORE glfwCreateWindow.", pt: "Os hints vêm DEPOIS de glfwInit (que os reinicia) e ANTES de glfwCreateWindow." },
      { en: "Asking for 4.6 on a machine with only 4.1 (macOS, old GPUs) fails. Ask for the oldest version your code really needs.", pt: "Pedir 4.6 numa máquina que só tem 4.1 (macOS, GPUs antigas) falha. Peça a versão mais antiga que o seu código realmente precisa." },
      { en: "String hints (such as the X11 class name) use glfwWindowHintString instead.", pt: "Hints de texto (como o nome de classe do X11) usam glfwWindowHintString." },
    ],
    example: `glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
#ifdef __APPLE__
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);           // macOS: 4.1 at most
glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
#endif
glfwWindowHint(GLFW_SAMPLES, 4);                         // 4x MSAA
GLFWwindow* window = glfwCreateWindow(1280, 720, "Hello", nullptr, nullptr);`,
    related: ["glfwCreateWindow", "glfwShowWindow", "glDebugMessageCallback"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwCreateWindow",
    errors: [
      NOT_INITIALIZED,
      INVALID_ENUM,
      INVALID_VALUE,
      { code: "GLFW_API_UNAVAILABLE", when: { en: "The driver does not support OpenGL at all, or not the API asked for.", pt: "O driver não suporta OpenGL, ou não a API pedida." } },
      { code: "GLFW_VERSION_UNAVAILABLE", when: { en: "The requested context version (for example 4.6) is higher than the driver supports. On macOS the maximum is 4.1.", pt: "A versão de contexto pedida (por exemplo 4.6) é maior que a que o driver suporta. No macOS o máximo é 4.1." } },
      { code: "GLFW_FORMAT_UNAVAILABLE", when: { en: "No pixel format matches the hints, for example too many MSAA samples.", pt: "Nenhum formato de pixel atende às hints, por exemplo amostras de MSAA demais." } },
      PLATFORM_ERROR,
    ],
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "GLFWwindow* glfwCreateWindow(int width, int height, const char* title, GLFWmonitor* monitor, GLFWwindow* share);",
    summary: {
      en: "Opens a window together with its OpenGL context, using the hints set before.",
      pt: "Abre uma janela junto com o seu contexto OpenGL, usando os hints definidos antes.",
    },
    description: {
      en: "One call gives you two things: the window on the screen and the OpenGL context (the GPU state every gl* call works on). The context is NOT current yet: call glfwMakeContextCurrent before any gl* call, and load the functions with glad after that.\n\nThe returned pointer is the handle every other window function takes. It is NULL when creation failed, most often because the OpenGL version you asked for with glfwWindowHint is not available.",
      pt: "Uma chamada te dá duas coisas: a janela na tela e o contexto OpenGL (o estado da GPU sobre o qual toda chamada gl* trabalha). O contexto AINDA NÃO é o atual: chame glfwMakeContextCurrent antes de qualquer gl*, e carregue as funções com o glad depois disso.\n\nO ponteiro retornado é o identificador que toda outra função de janela recebe. Ele é NULL quando a criação falhou, quase sempre porque a versão do OpenGL que você pediu com glfwWindowHint não está disponível.",
    },
    params: [
      { name: "width", type: "int", desc: { en: "Width of the content area in screen coordinates (not counting the title bar). On high-DPI screens the framebuffer can have more pixels: see glfwGetFramebufferSize.", pt: "Largura da área de conteúdo em coordenadas de tela (sem a barra de título). Em telas de alta densidade o framebuffer pode ter mais pixels: veja glfwGetFramebufferSize." } },
      { name: "height", type: "int", desc: { en: "Height of the content area in screen coordinates.", pt: "Altura da área de conteúdo em coordenadas de tela." } },
      { name: "title", type: "const char*", desc: { en: "Text of the title bar, in UTF-8. Change it later with glfwSetWindowTitle.", pt: "Texto da barra de título, em UTF-8. Mude depois com glfwSetWindowTitle." } },
      { name: "monitor", type: "GLFWmonitor*", desc: { en: "NULL for a normal window. A monitor (e.g. glfwGetPrimaryMonitor()) for full screen on it.", pt: "NULL para uma janela normal. Um monitor (ex.: glfwGetPrimaryMonitor()) para tela cheia nele." } },
      { name: "share", type: "GLFWwindow*", desc: { en: "NULL, or another window whose context should share objects (buffers, textures, shaders) with the new one.", pt: "NULL, ou outra janela cujo contexto deve compartilhar objetos (buffers, texturas, shaders) com o novo." } },
    ],
    returns: {
      en: "The window handle, or NULL on failure (the error callback says why).",
      pt: "O identificador da janela, ou NULL se falhar (o callback de erro diz por quê).",
    },
    notes: [
      { en: "Always check for NULL. Using a NULL window crashes on the next call.", pt: "Sempre confira o NULL. Usar uma janela NULL quebra na próxima chamada." },
      { en: "Calling gl* before glfwMakeContextCurrent and the glad loader crashes: the function pointers are still empty.", pt: "Chamar gl* antes de glfwMakeContextCurrent e do carregador do glad quebra: os ponteiros de função ainda estão vazios." },
      { en: "Width and height are what you asked for; the framebuffer size can differ. Read it with glfwGetFramebufferSize for glViewport.", pt: "Largura e altura são o que você pediu; o tamanho do framebuffer pode ser outro. Leia com glfwGetFramebufferSize para o glViewport." },
    ],
    example: `GLFWwindow* window = glfwCreateWindow(800, 600, "LearnOpenGL", nullptr, nullptr);
if (!window) {
    glfwTerminate();
    return 1;
}
glfwMakeContextCurrent(window);
if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) return 1;`,
    related: ["glfwWindowHint", "glfwMakeContextCurrent", "glfwDestroyWindow", "glfwGetFramebufferSize"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwDestroyWindow",
    errors: [NOT_INITIALIZED, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "void glfwDestroyWindow(GLFWwindow* window);",
    summary: {
      en: "Closes a window and destroys its OpenGL context.",
      pt: "Fecha uma janela e destrói o seu contexto OpenGL.",
    },
    description: {
      en: "The window disappears and its callbacks stop. If its context was current on this thread, no context is current afterwards.\n\nWith a single window you can skip it, since glfwTerminate destroys every remaining window. With several windows, destroy each one when the user closes it.",
      pt: "A janela some e seus callbacks param. Se o contexto dela era o atual nesta thread, nenhum contexto fica atual depois.\n\nCom uma janela só, dá para pular, já que glfwTerminate destrói toda janela restante. Com várias janelas, destrua cada uma quando o usuário a fechar.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to destroy. NULL is allowed and does nothing.", pt: "A janela a destruir. NULL é aceito e não faz nada." } },
    ],
    notes: [
      { en: "Delete OpenGL objects first, while the context still exists.", pt: "Apague os objetos OpenGL antes, enquanto o contexto ainda existe." },
      { en: "Never call it from inside one of that window's callbacks.", pt: "Nunca chame de dentro de um callback dessa mesma janela." },
    ],
    example: `glfwDestroyWindow(window);
glfwTerminate();`,
    related: ["glfwCreateWindow", "glfwTerminate"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwMakeContextCurrent",
    errors: [NOT_INITIALIZED, NO_WINDOW_CONTEXT, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "void glfwMakeContextCurrent(GLFWwindow* window);",
    summary: {
      en: "Makes this window's OpenGL context the one gl* calls on this thread talk to.",
      pt: "Torna o contexto OpenGL desta janela aquele com que as chamadas gl* desta thread conversam.",
    },
    description: {
      en: "OpenGL functions take no window parameter: they act on the context that is \"current\" on the calling thread. After glfwCreateWindow no context is current yet, so this call comes next, before the glad loader and before any gl* call.\n\nA context can be current on only one thread at a time. With several windows, switch contexts with this call before drawing into each one.",
      pt: "As funções do OpenGL não recebem janela: elas agem sobre o contexto que está \"atual\" na thread que chama. Depois de glfwCreateWindow nenhum contexto está atual ainda, então esta chamada vem em seguida, antes do carregador do glad e antes de qualquer gl*.\n\nUm contexto só pode estar atual em uma thread por vez. Com várias janelas, troque de contexto com esta chamada antes de desenhar em cada uma.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window whose context becomes current, or NULL to leave this thread with no context.", pt: "A janela cujo contexto vira o atual, ou NULL para deixar esta thread sem contexto." } },
    ],
    notes: [
      { en: "glfwSwapInterval and glfwGetProcAddress act on the current context, so they only work after this call.", pt: "glfwSwapInterval e glfwGetProcAddress agem sobre o contexto atual, então só funcionam depois desta chamada." },
      { en: "To render from a worker thread, make the context current THERE (and not current on the main thread).", pt: "Para renderizar de outra thread, torne o contexto atual LÁ (e não atual na thread principal)." },
    ],
    example: `GLFWwindow* window = glfwCreateWindow(800, 600, "App", nullptr, nullptr);
glfwMakeContextCurrent(window);   // gl* now talks to this window
glfwSwapInterval(1);              // needs a current context`,
    related: ["glfwCreateWindow", "glfwGetProcAddress", "glfwSwapInterval"],
    khronos: `${DOCS}group__context.html`,
  },
  {
    name: "glfwGetProcAddress",
    errors: [NOT_INITIALIZED, NO_CURRENT_CONTEXT, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 1.0",
    signature: "GLFWglproc glfwGetProcAddress(const char* procname);",
    summary: {
      en: "Finds the address of an OpenGL function in the driver. You hand it to glad, which loads all of them.",
      pt: "Encontra o endereço de uma função do OpenGL no driver. Você a entrega ao glad, que carrega todas.",
    },
    description: {
      en: "Modern OpenGL functions are not in a library you link against: they live in the GPU driver, and their addresses are only known at run time. Each one has to be looked up by name.\n\nNobody does that by hand for hundreds of functions. A loader such as glad calls glfwGetProcAddress for every name it knows and fills its function pointers. That is why `gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)` (glad 1) or `gladLoadGL(glfwGetProcAddress)` (glad 2) comes right after glfwMakeContextCurrent.",
      pt: "As funções modernas do OpenGL não estão numa biblioteca que você liga: elas moram no driver da GPU, e os endereços só são conhecidos durante a execução. Cada uma precisa ser procurada pelo nome.\n\nNinguém faz isso à mão para centenas de funções. Um carregador como o glad chama glfwGetProcAddress para cada nome que conhece e preenche seus ponteiros de função. Por isso `gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)` (glad 1) ou `gladLoadGL(glfwGetProcAddress)` (glad 2) vem logo depois de glfwMakeContextCurrent.",
    },
    params: [
      { name: "procname", type: "const char*", desc: { en: "The function name in ASCII, e.g. \"glGenBuffers\".", pt: "O nome da função em ASCII, ex.: \"glGenBuffers\"." } },
    ],
    returns: {
      en: "The function's address, or NULL if this context does not have it.",
      pt: "O endereço da função, ou NULL se este contexto não a tiver.",
    },
    notes: [
      { en: "A context must be current. Called too early, glad gets NULL everywhere and its load function returns 0.", pt: "Um contexto precisa estar atual. Chamado cedo demais, o glad recebe NULL em tudo e a função de carga retorna 0." },
      { en: "A non-NULL address does not prove the function works on this GPU; check the OpenGL version too.", pt: "Um endereço não NULL não prova que a função funciona nesta GPU; confira também a versão do OpenGL." },
    ],
    example: `glfwMakeContextCurrent(window);
if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
    std::fprintf(stderr, "could not load OpenGL functions\\n");
    return 1;
}
std::printf("%s\\n", (const char*)glGetString(GL_VERSION));`,
    related: ["glfwMakeContextCurrent", "glGetString"],
    khronos: `${DOCS}group__context.html`,
  },
  {
    name: "glfwSwapBuffers",
    errors: [NOT_INITIALIZED, NO_WINDOW_CONTEXT, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 1.0",
    signature: "void glfwSwapBuffers(GLFWwindow* window);",
    summary: {
      en: "Shows the frame you just drew: swaps the hidden back buffer with the visible front buffer.",
      pt: "Mostra o quadro que você acabou de desenhar: troca o back buffer escondido pelo front buffer visível.",
    },
    description: {
      en: "The window has two color buffers. You draw into the back buffer, which nobody sees, while the front buffer is on the screen. glfwSwapBuffers exchanges them, so the finished frame appears all at once, without the viewer watching it being drawn (flicker).\n\nWith a swap interval of 1 (glfwSwapInterval), the swap waits for the monitor's next refresh, which also limits the loop to the refresh rate (vsync).",
      pt: "A janela tem dois color buffers. Você desenha no back buffer, que ninguém vê, enquanto o front buffer está na tela. glfwSwapBuffers troca os dois, e o quadro pronto aparece de uma vez, sem quem olha ver o desenho acontecendo (cintilação).\n\nCom intervalo de troca 1 (glfwSwapInterval), a troca espera a próxima atualização do monitor, o que também limita o laço à taxa de atualização (vsync).",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window whose buffers to swap.", pt: "A janela cujos buffers trocar." } },
    ],
    notes: [
      { en: "Call it once per frame, after the last draw call and before glfwPollEvents.", pt: "Chame uma vez por quadro, depois da última chamada de desenho e antes de glfwPollEvents." },
      { en: "After the swap the back buffer's content is undefined: clear it with glClear at the start of every frame.", pt: "Depois da troca o conteúdo do back buffer é indefinido: limpe com glClear no começo de todo quadro." },
    ],
    example: `while (!glfwWindowShouldClose(window)) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    drawScene();
    glfwSwapBuffers(window);   // show the frame
    glfwPollEvents();          // then read input
}`,
    related: ["glfwSwapInterval", "glfwPollEvents", "glClear"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSwapInterval",
    errors: [NOT_INITIALIZED, NO_CURRENT_CONTEXT, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 1.0",
    signature: "void glfwSwapInterval(int interval);",
    summary: {
      en: "Turns vsync on or off: how many monitor refreshes glfwSwapBuffers waits for.",
      pt: "Liga ou desliga o vsync: quantas atualizações do monitor glfwSwapBuffers espera.",
    },
    description: {
      en: "The monitor redraws itself at a fixed rate, such as 60 times per second. With interval 1 each swap waits for the next refresh: no tearing (half of one frame over half of another), and the loop runs at the monitor's rate instead of using 100% of the GPU.\n\nWith interval 0 the swap happens at once. Use it to measure how fast your renderer really is.",
      pt: "O monitor se redesenha numa taxa fixa, como 60 vezes por segundo. Com intervalo 1 cada troca espera a próxima atualização: sem tearing (metade de um quadro sobre metade de outro), e o laço roda na taxa do monitor em vez de usar 100% da GPU.\n\nCom intervalo 0 a troca acontece na hora. Use para medir quão rápido o seu renderizador realmente é.",
    },
    params: [
      {
        name: "interval",
        type: "int",
        desc: { en: "Refreshes to wait per swap.", pt: "Atualizações a esperar por troca." },
        values: [
          { name: "0", desc: { en: "No wait (vsync off): maximum frame rate, tearing possible.", pt: "Sem espera (vsync desligado): taxa máxima, tearing possível." } },
          { name: "1", desc: { en: "Wait for one refresh (vsync on). The usual choice.", pt: "Espera uma atualização (vsync ligado). A escolha comum." } },
          { name: "-1", desc: { en: "Adaptive: like 1, but a late frame is shown at once. Only if the driver supports swap_control_tear.", pt: "Adaptativo: como 1, mas um quadro atrasado aparece na hora. Só se o driver suportar swap_control_tear." } },
        ],
      },
    ],
    notes: [
      { en: "It applies to the CURRENT context, so call it after glfwMakeContextCurrent.", pt: "Vale para o contexto ATUAL, então chame depois de glfwMakeContextCurrent." },
      { en: "The driver control panel can override it, so 0 does not always turn vsync off.", pt: "O painel do driver pode sobrepor esta escolha, então 0 nem sempre desliga o vsync." },
    ],
    example: `glfwMakeContextCurrent(window);
glfwSwapInterval(1);   // vsync on`,
    related: ["glfwSwapBuffers", "glfwMakeContextCurrent"],
    khronos: `${DOCS}group__context.html`,
  },
  {
    name: "glfwPollEvents",
    errors: [NOT_INITIALIZED, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 1.0",
    signature: "void glfwPollEvents(void);",
    summary: {
      en: "Handles the keyboard, mouse and window events that arrived since the last call, then returns at once.",
      pt: "Trata os eventos de teclado, mouse e janela que chegaram desde a última chamada e volta na hora.",
    },
    description: {
      en: "The operating system puts events in a queue: a key was pressed, the mouse moved, the close button was clicked. Until you process that queue the window \"does not respond\", and glfwGetKey keeps returning old states.\n\nglfwPollEvents empties the queue. Your callbacks (key, cursor, framebuffer size…) run INSIDE this call, one per event. Call it once per frame; it never waits, which suits a game or animation that redraws continuously.",
      pt: "O sistema operacional coloca eventos numa fila: uma tecla foi apertada, o mouse andou, o botão de fechar foi clicado. Enquanto você não processa essa fila a janela \"não responde\", e glfwGetKey continua devolvendo estados velhos.\n\nglfwPollEvents esvazia a fila. Os seus callbacks (tecla, cursor, tamanho do framebuffer…) rodam DENTRO desta chamada, um por evento. Chame uma vez por quadro; ela nunca espera, o que serve para um jogo ou animação que redesenha sem parar.",
    },
    params: [],
    notes: [
      { en: "Call it from the main thread only.", pt: "Chame só da thread principal." },
      { en: "On Windows, dragging or resizing the window blocks inside this call until the mouse is released. Redraw from the framebuffer-size callback if the picture must follow the resize.", pt: "No Windows, arrastar ou redimensionar a janela bloqueia dentro desta chamada até soltar o mouse. Redesenhe pelo callback de tamanho do framebuffer se a imagem precisar acompanhar." },
      { en: "An editor or tool that only redraws on input should use glfwWaitEvents and save the CPU.", pt: "Um editor ou ferramenta que só redesenha com entrada deve usar glfwWaitEvents e poupar a CPU." },
    ],
    example: `while (!glfwWindowShouldClose(window)) {
    render();
    glfwSwapBuffers(window);
    glfwPollEvents();   // callbacks run here
}`,
    related: ["glfwWaitEvents", "glfwWindowShouldClose", "glfwGetKey", "glfwSwapBuffers"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwWaitEvents",
    errors: [NOT_INITIALIZED, PLATFORM_ERROR],
    category: "glfw-setup",
    since: "GLFW 2.5",
    signature: "void glfwWaitEvents(void);",
    summary: {
      en: "Like glfwPollEvents, but sleeps until at least one event arrives. Uses no CPU while nothing happens.",
      pt: "Como glfwPollEvents, mas dorme até chegar pelo menos um evento. Não usa CPU enquanto nada acontece.",
    },
    description: {
      en: "If nothing changes on screen unless the user does something (an editor, a viewer, a menu), redrawing 60 times per second wastes battery. glfwWaitEvents puts the thread to sleep until an event comes, handles it (callbacks run inside), and returns.\n\nTwo relatives: glfwWaitEventsTimeout(seconds) also wakes after a time limit, and glfwPostEmptyEvent() wakes a waiting main thread from another thread.",
      pt: "Se nada muda na tela sem o usuário agir (um editor, um visualizador, um menu), redesenhar 60 vezes por segundo gasta bateria à toa. glfwWaitEvents põe a thread para dormir até chegar um evento, trata esse evento (os callbacks rodam dentro) e volta.\n\nDuas parentes: glfwWaitEventsTimeout(segundos) também acorda depois de um tempo limite, e glfwPostEmptyEvent() acorda a thread principal que está esperando, a partir de outra thread.",
    },
    params: [],
    example: `// a viewer that redraws only when something happens
while (!glfwWindowShouldClose(window)) {
    render();
    glfwSwapBuffers(window);
    glfwWaitEvents();   // sleep until input
}`,
    related: ["glfwPollEvents"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwWindowShouldClose",
    errors: [NOT_INITIALIZED],
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "int glfwWindowShouldClose(GLFWwindow* window);",
    summary: {
      en: "Asks whether the user wants the window closed. The condition of the main loop.",
      pt: "Pergunta se o usuário quer fechar a janela. A condição do laço principal.",
    },
    description: {
      en: "Clicking the window's close button (or Alt+F4) does NOT close it. GLFW only raises a flag, and your loop decides what to do. That lets you ask \"save before quitting?\" or finish the frame first.\n\nThe usual main loop runs `while (!glfwWindowShouldClose(window))`. You can raise the flag yourself with glfwSetWindowShouldClose, e.g. when Esc is pressed.",
      pt: "Clicar no botão de fechar da janela (ou Alt+F4) NÃO a fecha. O GLFW só levanta uma bandeira, e o seu laço decide o que fazer. Isso deixa você perguntar \"salvar antes de sair?\" ou terminar o quadro antes.\n\nO laço principal comum roda `while (!glfwWindowShouldClose(window))`. Você pode levantar a bandeira com glfwSetWindowShouldClose, ex.: quando Esc é apertado.",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window to ask about.", pt: "A janela a consultar." } },
    ],
    returns: {
      en: "GLFW_TRUE if the close flag is set, otherwise GLFW_FALSE.",
      pt: "GLFW_TRUE se a bandeira de fechar está levantada, senão GLFW_FALSE.",
    },
    notes: [
      { en: "The flag only changes inside glfwPollEvents / glfwWaitEvents. Without them the loop never ends.", pt: "A bandeira só muda dentro de glfwPollEvents / glfwWaitEvents. Sem elas o laço nunca termina." },
    ],
    example: `while (!glfwWindowShouldClose(window)) {
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GLFW_TRUE);
    render();
    glfwSwapBuffers(window);
    glfwPollEvents();
}`,
    related: ["glfwSetWindowShouldClose", "glfwPollEvents"],
    khronos: `${DOCS}group__window.html`,
  },
  {
    name: "glfwSetWindowShouldClose",
    errors: [NOT_INITIALIZED],
    category: "glfw-setup",
    since: "GLFW 3.0",
    signature: "void glfwSetWindowShouldClose(GLFWwindow* window, int value);",
    summary: {
      en: "Raises (or lowers) the window's close flag, the same flag the close button raises.",
      pt: "Levanta (ou abaixa) a bandeira de fechar da janela, a mesma que o botão de fechar levanta.",
    },
    description: {
      en: "Use GLFW_TRUE to end the main loop from your own code, such as an Esc key or a \"Quit\" menu item. Use GLFW_FALSE to cancel a close the user asked for, for example after \"you have unsaved changes\".",
      pt: "Use GLFW_TRUE para encerrar o laço principal pelo seu próprio código, como a tecla Esc ou um item \"Sair\" do menu. Use GLFW_FALSE para cancelar um fechamento pedido pelo usuário, por exemplo depois de \"há alterações não salvas\".",
    },
    params: [
      { name: "window", type: "GLFWwindow*", desc: { en: "The window whose flag to change.", pt: "A janela cuja bandeira mudar." } },
      { name: "value", type: "int", desc: { en: "GLFW_TRUE to ask for closing, GLFW_FALSE to cancel it.", pt: "GLFW_TRUE para pedir o fechamento, GLFW_FALSE para cancelar." } },
    ],
    notes: [
      { en: "It does not close anything by itself: the loop still has to see the flag and exit.", pt: "Ela não fecha nada sozinha: o laço ainda precisa ver a bandeira e sair." },
    ],
    example: `void onKey(GLFWwindow* w, int key, int, int action, int) {
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(w, GLFW_TRUE);
}`,
    related: ["glfwWindowShouldClose", "glfwSetKeyCallback"],
    khronos: `${DOCS}group__window.html`,
  },
];

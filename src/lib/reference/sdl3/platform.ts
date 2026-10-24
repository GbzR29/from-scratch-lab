// src/lib/reference/sdl3/platform.ts
// SDL 3.2: files and paths, storage, and SDL as a window for OpenGL or Vulkan.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const platformEntries: RefEntry[] = [
  // ── Files & storage ───────────────────────────────────────────────────────
  {
    name: "SDL_GetBasePath",
    category: "files",
    since: "SDL 3.2",
    signature: "const char * SDL_GetBasePath(void);",
    summary: {
      en: "The folder the program was started from (next to the executable). Where your read-only assets live.",
      pt: "A pasta de onde o programa foi iniciado (ao lado do executável). Onde ficam os seus arquivos de leitura.",
    },
    description: {
      en: "Relative paths such as \"assets/player.png\" are relative to the CURRENT directory, which depends on how the program was launched (a double-click, a terminal elsewhere, the IDE). Building paths from the base path makes asset loading work no matter where it was started from.\n\nThe string always ends with a path separator, so just append the file name. On macOS app bundles it is the bundle's Resources folder.",
      pt: "Caminhos relativos como \"assets/player.png\" são relativos à pasta ATUAL, que depende de como o programa foi aberto (duplo clique, um terminal em outra pasta, a IDE). Montar os caminhos a partir do base path faz o carregamento funcionar não importa de onde ele foi iniciado.\n\nA string sempre termina com um separador de pasta, então é só acrescentar o nome do arquivo. Em pacotes .app do macOS ela é a pasta Resources do pacote.",
    },
    params: [],
    returns: {
      en: "An absolute UTF-8 path owned by SDL (SDL3 caches it: do NOT free it, unlike SDL2), or NULL if unknown.",
      pt: "Um caminho absoluto UTF-8 do SDL (o SDL3 guarda em cache: NÃO libere, ao contrário do SDL2), ou NULL se desconhecido.",
    },
    notes: [
      { en: "Treat it as read-only. Installed programs usually cannot write there; save games go in SDL_GetPrefPath.", pt: "Trate como só leitura. Programas instalados normalmente não podem escrever ali; jogos salvos vão em SDL_GetPrefPath." },
    ],
    example: `std::string asset(const char* name) {
    return std::string(SDL_GetBasePath()) + "assets/" + name;
}
SDL_Surface* s = IMG_Load(asset("player.png").c_str());`,
    related: ["SDL_GetPrefPath", "SDL_LoadFile", "SDL_OpenTitleStorage"],
    khronos: `${WIKI}SDL_GetBasePath`,
  },
  {
    name: "SDL_GetPrefPath",
    category: "files",
    since: "SDL 3.2",
    signature: "char * SDL_GetPrefPath(const char *org, const char *app);",
    summary: {
      en: "A folder where your program may write: settings, save games, logs. Created if missing.",
      pt: "Uma pasta onde o programa pode escrever: configurações, jogos salvos, logs. Criada se não existir.",
    },
    description: {
      en: "Each system has its own place for per-user data: %APPDATA% on Windows, ~/Library/Application Support on macOS, ~/.local/share on Linux. SDL builds the right path from your organization and app names and creates the folder.\n\nKeep the names stable: changing them later \"loses\" every player's saves.",
      pt: "Cada sistema tem seu lugar para dados por usuário: %APPDATA% no Windows, ~/Library/Application Support no macOS, ~/.local/share no Linux. O SDL monta o caminho certo a partir dos nomes da organização e do app e cria a pasta.\n\nMantenha os nomes estáveis: mudá-los depois \"perde\" os jogos salvos de todo jogador.",
    },
    params: [
      { name: "org", type: "const char *", desc: { en: "Your studio or organization name.", pt: "O nome do seu estúdio ou organização." } },
      { name: "app", type: "const char *", desc: { en: "Your application name.", pt: "O nome da sua aplicação." } },
    ],
    returns: {
      en: "The path, ending with a separator. It is yours: free it with SDL_free. NULL on failure.",
      pt: "O caminho, terminando com separador. Ele é seu: libere com SDL_free. NULL se falhar.",
    },
    example: `char* prefs = SDL_GetPrefPath("MyStudio", "MyGame");
std::string savePath = std::string(prefs) + "save1.dat";
SDL_free(prefs);`,
    related: ["SDL_GetBasePath", "SDL_free", "SDL_OpenUserStorage"],
    khronos: `${WIKI}SDL_GetPrefPath`,
  },
  {
    name: "SDL_LoadFile",
    category: "files",
    since: "SDL 3.2",
    signature: "void * SDL_LoadFile(const char *file, size_t *datasize);",
    summary: {
      en: "Reads a whole file into memory in one call.",
      pt: "Lê um arquivo inteiro para a memória numa chamada só.",
    },
    description: {
      en: "Good for level files, JSON, shaders. SDL adds a zero byte after the data, so a text file can be used directly as a C string. The size you get back does not count that extra byte.\n\nOn Android it can also read files packed inside the APK, which plain `fopen` cannot.",
      pt: "Bom para arquivos de fase, JSON, shaders. O SDL acrescenta um byte zero depois dos dados, então um arquivo de texto pode ser usado direto como string C. O tamanho devolvido não conta esse byte extra.\n\nNo Android ela também lê arquivos empacotados dentro do APK, o que o `fopen` comum não consegue.",
    },
    params: [
      { name: "file", type: "const char *", desc: { en: "The path to read.", pt: "O caminho a ler." } },
      { name: "datasize", type: "size_t *", desc: { en: "Receives the number of bytes read, or NULL.", pt: "Recebe o número de bytes lidos, ou NULL." } },
    ],
    returns: { en: "The data (free with SDL_free), or NULL on failure.", pt: "Os dados (libere com SDL_free), ou NULL se falhar." },
    example: `size_t size = 0;
char* json = static_cast<char*>(SDL_LoadFile("assets/level1.json", &size));
if (!json) { SDL_Log("LoadFile: %s", SDL_GetError()); return; }
parseLevel(std::string_view(json, size));
SDL_free(json);`,
    related: ["SDL_free", "SDL_GetBasePath"],
    khronos: `${WIKI}SDL_LoadFile`,
  },
  {
    name: "SDL_OpenTitleStorage",
    category: "files",
    since: "SDL 3.2",
    signature: "SDL_Storage * SDL_OpenTitleStorage(const char *override, SDL_PropertiesID props);",
    summary: {
      en: "Opens the game's own read-only files through SDL's storage API, which also works on consoles.",
      pt: "Abre os arquivos de leitura do próprio jogo pela API de storage do SDL, que também funciona em consoles.",
    },
    description: {
      en: "On a PC, reading assets with paths is fine. Consoles and some stores do not give you a normal file system: assets live in a package and saves in a managed container. SDL_Storage hides that difference. Open the container, wait until SDL_StorageReady says yes, read files with SDL_GetStorageFileSize and SDL_ReadStorageFile, then SDL_CloseStorage.",
      pt: "Num PC, ler arquivos por caminho funciona bem. Consoles e algumas lojas não dão um sistema de arquivos normal: os arquivos ficam num pacote e os jogos salvos num contêiner gerenciado. O SDL_Storage esconde essa diferença. Abra o contêiner, espere SDL_StorageReady dizer que sim, leia arquivos com SDL_GetStorageFileSize e SDL_ReadStorageFile e depois SDL_CloseStorage.",
    },
    params: [
      { name: "override", type: "const char *", desc: { en: "NULL for the default (the base path on PC), or a folder to use instead.", pt: "NULL para o padrão (o base path no PC), ou uma pasta para usar no lugar." } },
      { name: "props", type: "SDL_PropertiesID", desc: { en: "Backend-specific options, usually 0.", pt: "Opções do backend, normalmente 0." } },
    ],
    returns: { en: "The storage container, or NULL on failure.", pt: "O contêiner de storage, ou NULL se falhar." },
    example: `SDL_Storage* title = SDL_OpenTitleStorage(nullptr, 0);
while (!SDL_StorageReady(title)) SDL_Delay(1);
Uint64 size;
SDL_GetStorageFileSize(title, "levels/1.json", &size);
std::string text(size, '\\0');
SDL_ReadStorageFile(title, "levels/1.json", text.data(), size);
SDL_CloseStorage(title);`,
    related: ["SDL_OpenUserStorage", "SDL_GetBasePath"],
    khronos: `${WIKI}SDL_OpenTitleStorage`,
  },
  {
    name: "SDL_OpenUserStorage",
    category: "files",
    since: "SDL 3.2",
    signature: "SDL_Storage * SDL_OpenUserStorage(const char *org, const char *app, SDL_PropertiesID props);",
    summary: {
      en: "Opens the player's writable storage (save games, settings) through SDL's storage API.",
      pt: "Abre o storage gravável do jogador (jogos salvos, configurações) pela API de storage do SDL.",
    },
    description: {
      en: "The writable twin of SDL_OpenTitleStorage. On PC it maps to the same folder as SDL_GetPrefPath. Open it only when you are about to read or write, and close it soon after: on some platforms closing is what actually commits the save safely.",
      pt: "O gêmeo gravável de SDL_OpenTitleStorage. No PC ele aponta para a mesma pasta de SDL_GetPrefPath. Abra só quando for ler ou escrever e feche logo depois: em algumas plataformas é o fechamento que de fato grava o jogo salvo com segurança.",
    },
    params: [
      { name: "org", type: "const char *", desc: { en: "Your organization name (as in SDL_GetPrefPath).", pt: "O nome da organização (como em SDL_GetPrefPath)." } },
      { name: "app", type: "const char *", desc: { en: "Your application name.", pt: "O nome da aplicação." } },
      { name: "props", type: "SDL_PropertiesID", desc: { en: "Backend-specific options, usually 0.", pt: "Opções do backend, normalmente 0." } },
    ],
    returns: { en: "The storage container, or NULL on failure.", pt: "O contêiner de storage, ou NULL se falhar." },
    example: `SDL_Storage* user = SDL_OpenUserStorage("MyStudio", "MyGame", 0);
while (!SDL_StorageReady(user)) SDL_Delay(1);
SDL_WriteStorageFile(user, "save1.dat", save.data(), save.size());
SDL_CloseStorage(user);   // commit`,
    related: ["SDL_OpenTitleStorage", "SDL_GetPrefPath"],
    khronos: `${WIKI}SDL_OpenUserStorage`,
  },

  // ── OpenGL & Vulkan windows ───────────────────────────────────────────────
  {
    name: "SDL_GL_SetAttribute",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "bool SDL_GL_SetAttribute(SDL_GLAttr attr, int value);",
    summary: {
      en: "Requests one property of the OpenGL context and framebuffer (version, profile, depth bits…) BEFORE the window is created.",
      pt: "Pede uma propriedade do contexto e do framebuffer OpenGL (versão, profile, bits de profundidade…) ANTES de criar a janela.",
    },
    description: {
      en: "The SDL equivalent of glfwWindowHint. The framebuffer format is chosen when the window is created, so set the attributes first, then SDL_CreateWindow with SDL_WINDOW_OPENGL, then SDL_GL_CreateContext.",
      pt: "O equivalente no SDL de glfwWindowHint. O formato do framebuffer é escolhido quando a janela é criada, então defina os atributos primeiro, depois SDL_CreateWindow com SDL_WINDOW_OPENGL, depois SDL_GL_CreateContext.",
    },
    params: [
      {
        name: "attr",
        type: "SDL_GLAttr",
        desc: { en: "Which property.", pt: "Qual propriedade." },
        values: [
          { name: "SDL_GL_CONTEXT_MAJOR_VERSION / _MINOR_VERSION", desc: { en: "OpenGL version, e.g. 4 and 6.", pt: "Versão do OpenGL, ex.: 4 e 6." } },
          { name: "SDL_GL_CONTEXT_PROFILE_MASK", desc: { en: "SDL_GL_CONTEXT_PROFILE_CORE (modern only) or _COMPATIBILITY.", pt: "SDL_GL_CONTEXT_PROFILE_CORE (só moderno) ou _COMPATIBILITY." } },
          { name: "SDL_GL_CONTEXT_FLAGS", desc: { en: "SDL_GL_CONTEXT_DEBUG_FLAG for a debug context; SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG for macOS.", pt: "SDL_GL_CONTEXT_DEBUG_FLAG para um contexto de debug; SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG para o macOS." } },
          { name: "SDL_GL_DEPTH_SIZE / SDL_GL_STENCIL_SIZE", desc: { en: "Bits of depth and stencil, e.g. 24 and 8.", pt: "Bits de profundidade e stencil, ex.: 24 e 8." } },
          { name: "SDL_GL_MULTISAMPLEBUFFERS / SDL_GL_MULTISAMPLESAMPLES", desc: { en: "1 and 4 for 4x MSAA.", pt: "1 e 4 para MSAA 4x." } },
          { name: "SDL_GL_DOUBLEBUFFER", desc: { en: "1 (default) for a back buffer.", pt: "1 (padrão) para ter back buffer." } },
        ],
      },
      { name: "value", type: "int", desc: { en: "The requested value.", pt: "O valor pedido." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 6);
SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
SDL_Window* window = SDL_CreateWindow("GL", 1280, 720, SDL_WINDOW_OPENGL);`,
    related: ["SDL_GL_CreateContext", "SDL_CreateWindow"],
    khronos: `${WIKI}SDL_GL_SetAttribute`,
  },
  {
    name: "SDL_GL_CreateContext",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "SDL_GLContext SDL_GL_CreateContext(SDL_Window *window);",
    summary: {
      en: "Creates an OpenGL context for an OpenGL window and makes it current.",
      pt: "Cria um contexto OpenGL para uma janela OpenGL e o torna atual.",
    },
    description: {
      en: "The window must have been created with SDL_WINDOW_OPENGL. The context comes back already current, so the next step is loading the GL functions with glad and SDL_GL_GetProcAddress.\n\nThe context follows the attributes set with SDL_GL_SetAttribute; if the version you asked for is not available, this returns NULL.",
      pt: "A janela precisa ter sido criada com SDL_WINDOW_OPENGL. O contexto já volta atual, então o próximo passo é carregar as funções GL com o glad e SDL_GL_GetProcAddress.\n\nO contexto segue os atributos definidos com SDL_GL_SetAttribute; se a versão pedida não estiver disponível, ela retorna NULL.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "A window created with SDL_WINDOW_OPENGL.", pt: "Uma janela criada com SDL_WINDOW_OPENGL." } },
    ],
    returns: { en: "The context, or NULL on failure.", pt: "O contexto, ou NULL se falhar." },
    example: `SDL_GLContext gl = SDL_GL_CreateContext(window);
if (!gl) { SDL_Log("GL context: %s", SDL_GetError()); return 1; }
gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress);`,
    related: ["SDL_GL_SetAttribute", "SDL_GL_GetProcAddress", "SDL_GL_DestroyContext"],
    khronos: `${WIKI}SDL_GL_CreateContext`,
  },
  {
    name: "SDL_GL_DestroyContext",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "bool SDL_GL_DestroyContext(SDL_GLContext context);",
    summary: {
      en: "Destroys an OpenGL context (SDL_GL_DeleteContext in SDL2).",
      pt: "Destrói um contexto OpenGL (SDL_GL_DeleteContext no SDL2).",
    },
    description: {
      en: "Delete your GL objects first, while the context still exists; then destroy the context, then the window.",
      pt: "Apague os seus objetos GL antes, enquanto o contexto ainda existe; depois destrua o contexto e então a janela.",
    },
    params: [
      { name: "context", type: "SDL_GLContext", desc: { en: "The context to destroy.", pt: "O contexto a destruir." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `glDeleteProgram(program);
SDL_GL_DestroyContext(gl);
SDL_DestroyWindow(window);`,
    related: ["SDL_GL_CreateContext"],
    khronos: `${WIKI}SDL_GL_DestroyContext`,
  },
  {
    name: "SDL_GL_GetProcAddress",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "SDL_FunctionPointer SDL_GL_GetProcAddress(const char *proc);",
    summary: {
      en: "Finds an OpenGL function in the driver by name. Handed to glad to load them all.",
      pt: "Encontra uma função do OpenGL no driver pelo nome. Entregue ao glad para carregar todas.",
    },
    description: {
      en: "Modern OpenGL functions live in the GPU driver and are looked up at run time; nobody does that by hand. Pass this function to your loader right after creating the context: `gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress)` (glad 1) or `gladLoadGL((GLADloadfunc)SDL_GL_GetProcAddress)` (glad 2).",
      pt: "As funções modernas do OpenGL moram no driver da GPU e são procuradas durante a execução; ninguém faz isso à mão. Passe esta função para o seu carregador logo depois de criar o contexto: `gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress)` (glad 1) ou `gladLoadGL((GLADloadfunc)SDL_GL_GetProcAddress)` (glad 2).",
    },
    params: [
      { name: "proc", type: "const char *", desc: { en: "The function name, e.g. \"glGenBuffers\".", pt: "O nome da função, ex.: \"glGenBuffers\"." } },
    ],
    returns: { en: "The function's address, or NULL if not found.", pt: "O endereço da função, ou NULL se não encontrada." },
    example: `if (!gladLoadGLLoader((GLADloadproc)SDL_GL_GetProcAddress)) {
    SDL_Log("could not load OpenGL");
    return 1;
}`,
    related: ["SDL_GL_CreateContext"],
    khronos: `${WIKI}SDL_GL_GetProcAddress`,
  },
  {
    name: "SDL_GL_SetSwapInterval",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "bool SDL_GL_SetSwapInterval(int interval);",
    summary: {
      en: "Turns vsync on or off for the current OpenGL context.",
      pt: "Liga ou desliga o vsync do contexto OpenGL atual.",
    },
    description: {
      en: "0 = swap at once, 1 = wait for the monitor's refresh, -1 = adaptive (like 1, but a late frame is shown at once to avoid a stutter). Adaptive is not available everywhere: if it fails, fall back to 1.",
      pt: "0 = troca na hora, 1 = espera a atualização do monitor, -1 = adaptativo (como 1, mas um quadro atrasado aparece na hora para evitar um engasgo). O adaptativo não existe em todo lugar: se falhar, volte para 1.",
    },
    params: [
      { name: "interval", type: "int", desc: { en: "0, 1, or -1 (adaptive).", pt: "0, 1, ou -1 (adaptativo)." } },
    ],
    returns: { en: "`true` on success; `false` if this interval is not supported.", pt: "`true` se deu certo; `false` se este intervalo não é suportado." },
    example: `if (!SDL_GL_SetSwapInterval(-1)) SDL_GL_SetSwapInterval(1);`,
    related: ["SDL_GL_SwapWindow"],
    khronos: `${WIKI}SDL_GL_SetSwapInterval`,
  },
  {
    name: "SDL_GL_SwapWindow",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "bool SDL_GL_SwapWindow(SDL_Window *window);",
    summary: {
      en: "Shows the OpenGL frame you just drew (swaps the back and front buffers).",
      pt: "Mostra o quadro OpenGL que você acabou de desenhar (troca o back e o front buffer).",
    },
    description: {
      en: "The SDL equivalent of glfwSwapBuffers: call it once per frame after the last draw. With a swap interval of 1 it waits for the monitor's refresh.",
      pt: "O equivalente no SDL de glfwSwapBuffers: chame uma vez por quadro depois do último desenho. Com intervalo de troca 1 ela espera a atualização do monitor.",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "The OpenGL window.", pt: "A janela OpenGL." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
drawScene();
SDL_GL_SwapWindow(window);`,
    related: ["SDL_GL_SetSwapInterval", "SDL_GL_CreateContext"],
    khronos: `${WIKI}SDL_GL_SwapWindow`,
  },
  {
    name: "SDL_Vulkan_GetInstanceExtensions",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "char const * const * SDL_Vulkan_GetInstanceExtensions(Uint32 *count);",
    summary: {
      en: "Lists the Vulkan instance extensions needed to show images in an SDL window on this system.",
      pt: "Lista as extensões de instância do Vulkan necessárias para mostrar imagens numa janela SDL neste sistema.",
    },
    description: {
      en: "Vulkan itself knows nothing about windows. Presenting needs platform extensions (VK_KHR_surface plus VK_KHR_win32_surface, or the X11, Wayland, Metal… one). SDL tells you which; pass them to vkCreateInstance, adding any others you want such as VK_EXT_debug_utils.\n\nCall it after creating a window with SDL_WINDOW_VULKAN (or after SDL_Vulkan_LoadLibrary).",
      pt: "O Vulkan em si não sabe nada de janelas. Apresentar precisa de extensões da plataforma (VK_KHR_surface mais VK_KHR_win32_surface, ou a do X11, Wayland, Metal…). O SDL diz quais; passe para vkCreateInstance, acrescentando outras que quiser, como VK_EXT_debug_utils.\n\nChame depois de criar uma janela com SDL_WINDOW_VULKAN (ou depois de SDL_Vulkan_LoadLibrary).",
    },
    params: [
      { name: "count", type: "Uint32 *", desc: { en: "Receives the number of names.", pt: "Recebe a quantidade de nomes." } },
    ],
    returns: { en: "An array of extension names owned by SDL (do not free), or NULL on failure.", pt: "Um array de nomes de extensão do SDL (não libere), ou NULL se falhar." },
    example: `Uint32 n = 0;
const char* const* sdlExts = SDL_Vulkan_GetInstanceExtensions(&n);
std::vector<const char*> exts(sdlExts, sdlExts + n);
exts.push_back(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);
VkInstanceCreateInfo ci{VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO};
ci.enabledExtensionCount   = Uint32(exts.size());
ci.ppEnabledExtensionNames = exts.data();`,
    related: ["SDL_Vulkan_CreateSurface", "SDL_CreateWindow"],
    khronos: `${WIKI}SDL_Vulkan_GetInstanceExtensions`,
  },
  {
    name: "SDL_Vulkan_CreateSurface",
    category: "gl-vulkan",
    since: "SDL 3.2",
    signature: "bool SDL_Vulkan_CreateSurface(SDL_Window *window, VkInstance instance, const struct VkAllocationCallbacks *allocator, VkSurfaceKHR *surface);",
    summary: {
      en: "Creates the VkSurfaceKHR for an SDL window: the bridge between Vulkan and the window.",
      pt: "Cria a VkSurfaceKHR de uma janela SDL: a ponte entre o Vulkan e a janela.",
    },
    description: {
      en: "The surface is what the swapchain presents to. Each platform creates it with a different Vulkan function; SDL calls the right one. The window needs SDL_WINDOW_VULKAN, and the instance must have the extensions from SDL_Vulkan_GetInstanceExtensions.\n\nDestroy it before the instance with SDL_Vulkan_DestroySurface (or vkDestroySurfaceKHR).",
      pt: "A surface é onde a swapchain apresenta. Cada plataforma a cria com uma função Vulkan diferente; o SDL chama a certa. A janela precisa de SDL_WINDOW_VULKAN, e a instância precisa das extensões de SDL_Vulkan_GetInstanceExtensions.\n\nDestrua antes da instância com SDL_Vulkan_DestroySurface (ou vkDestroySurfaceKHR).",
    },
    params: [
      { name: "window", type: "SDL_Window *", desc: { en: "A window created with SDL_WINDOW_VULKAN.", pt: "Uma janela criada com SDL_WINDOW_VULKAN." } },
      { name: "instance", type: "VkInstance", desc: { en: "Your Vulkan instance.", pt: "A sua instância Vulkan." } },
      { name: "allocator", type: "const struct VkAllocationCallbacks *", desc: { en: "Custom allocator, usually NULL.", pt: "Alocador próprio, normalmente NULL." } },
      { name: "surface", type: "VkSurfaceKHR *", desc: { en: "Receives the surface.", pt: "Recebe a surface." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `VkSurfaceKHR surface;
if (!SDL_Vulkan_CreateSurface(window, instance, nullptr, &surface)) {
    SDL_Log("surface: %s", SDL_GetError());
    return 1;
}
// ... at shutdown, before vkDestroyInstance:
SDL_Vulkan_DestroySurface(instance, surface, nullptr);`,
    related: ["SDL_Vulkan_GetInstanceExtensions", "SDL_CreateWindow"],
    khronos: `${WIKI}SDL_Vulkan_CreateSurface`,
  },
];

// src/lib/reference/sdl3/gpu.ts
// SDL 3.2 GPU API: the device, the window's swapchain, command buffers, render passes, drawing.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const gpuEntries: RefEntry[] = [
  {
    name: "SDL_CreateGPUDevice",
    category: "gpu",
    since: "SDL 3.2",
    signature: "SDL_GPUDevice * SDL_CreateGPUDevice(SDL_GPUShaderFormat format_flags, bool debug_mode, const char *name);",
    summary: {
      en: "Opens the GPU through SDL's modern 3D API, which runs on Vulkan, Direct3D 12 or Metal.",
      pt: "Abre a GPU pela API 3D moderna do SDL, que roda sobre Vulkan, Direct3D 12 ou Metal.",
    },
    description: {
      en: "SDL_GPU is one API on top of the three modern graphics APIs, with the same ideas (command buffers, passes, pipelines) and far less code than raw Vulkan. The device is the object everything else is created from.\n\nYou declare which shader formats you can supply. Shaders are not written in one shared language: Vulkan wants SPIR-V, Direct3D 12 DXIL, Metal MSL. SDL only picks a backend whose format you offered, so ship each shader in several formats (tools such as SDL_shadercross convert one source to all of them).",
      pt: "O SDL_GPU é uma API por cima das três APIs gráficas modernas, com as mesmas ideias (command buffers, passes, pipelines) e muito menos código que o Vulkan puro. O device é o objeto a partir do qual todo o resto é criado.\n\nVocê declara quais formatos de shader consegue fornecer. Os shaders não são escritos numa linguagem única: o Vulkan quer SPIR-V, o Direct3D 12 DXIL, o Metal MSL. O SDL só escolhe um backend cujo formato você ofereceu, então distribua cada shader em vários formatos (ferramentas como o SDL_shadercross convertem um código-fonte para todos).",
    },
    params: [
      {
        name: "format_flags",
        type: "SDL_GPUShaderFormat",
        desc: { en: "The shader formats you can provide, combined with `|`.", pt: "Os formatos de shader que você consegue fornecer, combinados com `|`." },
        values: [
          { name: "SDL_GPU_SHADERFORMAT_SPIRV", desc: { en: "SPIR-V, for Vulkan.", pt: "SPIR-V, para Vulkan." } },
          { name: "SDL_GPU_SHADERFORMAT_DXIL", desc: { en: "DXIL (Shader Model 6.0), for Direct3D 12.", pt: "DXIL (Shader Model 6.0), para Direct3D 12." } },
          { name: "SDL_GPU_SHADERFORMAT_MSL / METALLIB", desc: { en: "Metal source or precompiled library, for Apple platforms.", pt: "Código Metal ou biblioteca pré-compilada, para plataformas Apple." } },
        ],
      },
      { name: "debug_mode", type: "bool", desc: { en: "`true` turns on validation (Vulkan validation layers, D3D12 debug layer): slower, but explains mistakes in the log.", pt: "`true` liga a validação (camadas de validação do Vulkan, debug layer do D3D12): mais lento, mas explica os erros no log." } },
      { name: "name", type: "const char *", desc: { en: "NULL to let SDL choose, or \"vulkan\", \"direct3d12\", \"metal\".", pt: "NULL para o SDL escolher, ou \"vulkan\", \"direct3d12\", \"metal\"." } },
    ],
    returns: { en: "The device, or NULL if no backend accepts your formats.", pt: "O device, ou NULL se nenhum backend aceita os seus formatos." },
    example: `SDL_GPUDevice* device = SDL_CreateGPUDevice(
    SDL_GPU_SHADERFORMAT_SPIRV | SDL_GPU_SHADERFORMAT_DXIL | SDL_GPU_SHADERFORMAT_MSL,
    true,        // debug while developing
    nullptr);
if (!device) { SDL_Log("CreateGPUDevice: %s", SDL_GetError()); return 1; }
SDL_Log("GPU backend: %s", SDL_GetGPUDeviceDriver(device));`,
    related: ["SDL_ClaimWindowForGPUDevice", "SDL_GetGPUDeviceDriver", "SDL_GetGPUShaderFormats", "SDL_DestroyGPUDevice"],
    khronos: `${WIKI}SDL_CreateGPUDevice`,
  },
  {
    name: "SDL_DestroyGPUDevice",
    category: "gpu",
    since: "SDL 3.2",
    signature: "void SDL_DestroyGPUDevice(SDL_GPUDevice *device);",
    summary: {
      en: "Destroys the GPU device. Release everything created from it first.",
      pt: "Destrói o device da GPU. Libere antes tudo o que foi criado a partir dele.",
    },
    description: {
      en: "Shutdown order: release pipelines, buffers, textures and samplers; SDL_ReleaseWindowFromGPUDevice for each claimed window; then destroy the device; then the windows; then SDL_Quit.",
      pt: "Ordem de encerramento: libere pipelines, buffers, texturas e samplers; SDL_ReleaseWindowFromGPUDevice para cada janela reivindicada; depois destrua o device; depois as janelas; depois SDL_Quit.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device to destroy.", pt: "O device a destruir." } },
    ],
    example: `SDL_ReleaseGPUGraphicsPipeline(device, pipeline);
SDL_ReleaseGPUBuffer(device, vertexBuffer);
SDL_ReleaseWindowFromGPUDevice(device, window);
SDL_DestroyGPUDevice(device);
SDL_DestroyWindow(window);`,
    related: ["SDL_CreateGPUDevice", "SDL_ReleaseGPUBuffer"],
    khronos: `${WIKI}SDL_DestroyGPUDevice`,
  },
  {
    name: "SDL_GetGPUDeviceDriver",
    category: "gpu",
    since: "SDL 3.2",
    signature: "const char * SDL_GetGPUDeviceDriver(SDL_GPUDevice *device);",
    summary: {
      en: "Tells which backend the device uses: \"vulkan\", \"direct3d12\" or \"metal\".",
      pt: "Diz qual backend o device usa: \"vulkan\", \"direct3d12\" ou \"metal\".",
    },
    description: {
      en: "Log it at startup. It also tells you which shader format to load, though SDL_GetGPUShaderFormats answers that more directly.",
      pt: "Registre no log na partida. Também diz qual formato de shader carregar, embora SDL_GetGPUShaderFormats responda isso mais diretamente.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
    ],
    returns: { en: "The backend name (owned by SDL).", pt: "O nome do backend (do SDL)." },
    example: `SDL_Log("GPU backend: %s", SDL_GetGPUDeviceDriver(device));`,
    related: ["SDL_CreateGPUDevice", "SDL_GetGPUShaderFormats"],
    khronos: `${WIKI}SDL_GetGPUDeviceDriver`,
  },
  {
    name: "SDL_GetGPUShaderFormats",
    category: "gpu",
    since: "SDL 3.2",
    signature: "SDL_GPUShaderFormat SDL_GetGPUShaderFormats(SDL_GPUDevice *device);",
    summary: {
      en: "Tells which shader formats the chosen backend accepts, so you load the right file.",
      pt: "Diz quais formatos de shader o backend escolhido aceita, para você carregar o arquivo certo.",
    },
    description: {
      en: "You offered several formats when creating the device; now load the one that matches. Test the returned bits with `&`.",
      pt: "Você ofereceu vários formatos ao criar o device; agora carregue o que combina. Teste os bits retornados com `&`.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
    ],
    returns: { en: "A mask of SDL_GPU_SHADERFORMAT_… bits.", pt: "Uma máscara de bits SDL_GPU_SHADERFORMAT_…." },
    example: `SDL_GPUShaderFormat fmts = SDL_GetGPUShaderFormats(device);
const char* ext = (fmts & SDL_GPU_SHADERFORMAT_SPIRV) ? ".spv"
                : (fmts & SDL_GPU_SHADERFORMAT_DXIL)  ? ".dxil"
                :                                        ".msl";`,
    related: ["SDL_CreateGPUShader", "SDL_GetGPUDeviceDriver"],
    khronos: `${WIKI}SDL_GetGPUShaderFormats`,
  },
  {
    name: "SDL_ClaimWindowForGPUDevice",
    category: "gpu",
    since: "SDL 3.2",
    signature: "bool SDL_ClaimWindowForGPUDevice(SDL_GPUDevice *device, SDL_Window *window);",
    summary: {
      en: "Connects a window to the GPU device by creating its swapchain, so you can draw into it.",
      pt: "Liga uma janela ao device da GPU criando a swapchain dela, para você poder desenhar nela.",
    },
    description: {
      en: "The swapchain is the small set of images the window cycles through: one is on screen while you draw into another. Claiming the window builds it with vsync and standard (SDR) colours; SDL_SetGPUSwapchainParameters changes that afterwards.\n\nUnlike raw Vulkan, SDL recreates the swapchain for you when the window is resized.",
      pt: "A swapchain é o pequeno conjunto de imagens pelo qual a janela alterna: uma está na tela enquanto você desenha em outra. Reivindicar a janela a constrói com vsync e cores padrão (SDR); SDL_SetGPUSwapchainParameters muda isso depois.\n\nAo contrário do Vulkan puro, o SDL recria a swapchain por você quando a janela é redimensionada.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "window", type: "SDL_Window *", desc: { en: "The window (no special flag needed).", pt: "A janela (não precisa de flag especial)." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `if (!SDL_ClaimWindowForGPUDevice(device, window)) {
    SDL_Log("ClaimWindow: %s", SDL_GetError());
    return 1;
}`,
    related: ["SDL_CreateGPUDevice", "SDL_WaitAndAcquireGPUSwapchainTexture"],
    khronos: `${WIKI}SDL_ClaimWindowForGPUDevice`,
  },
  {
    name: "SDL_AcquireGPUCommandBuffer",
    category: "gpu",
    since: "SDL 3.2",
    signature: "SDL_GPUCommandBuffer * SDL_AcquireGPUCommandBuffer(SDL_GPUDevice *device);",
    summary: {
      en: "Gets a command buffer: a list you record GPU work into, then submit all at once.",
      pt: "Pega um command buffer: uma lista onde você grava o trabalho da GPU e depois envia tudo de uma vez.",
    },
    description: {
      en: "Modern GPU APIs do not run each call immediately. You RECORD commands (copy this, draw that) into a command buffer, then SUBMIT the whole buffer; the GPU works through it while your CPU moves on to the next frame.\n\nThe usual frame acquires one command buffer, records the passes, and submits it. Use it only on the thread that acquired it, and always submit it (or cancel it with SDL_CancelGPUCommandBuffer). You never free it yourself.",
      pt: "As APIs de GPU modernas não executam cada chamada na hora. Você GRAVA comandos (copie isto, desenhe aquilo) num command buffer e depois ENVIA o buffer inteiro; a GPU o percorre enquanto a CPU segue para o próximo quadro.\n\nO quadro comum pega um command buffer, grava os passes e o envia. Use só na thread que o pegou, e sempre envie (ou cancele com SDL_CancelGPUCommandBuffer). Você nunca o libera.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
    ],
    returns: { en: "A command buffer, or NULL on failure.", pt: "Um command buffer, ou NULL se falhar." },
    example: `SDL_GPUCommandBuffer* cmd = SDL_AcquireGPUCommandBuffer(device);
// ... record copy passes and render passes ...
SDL_SubmitGPUCommandBuffer(cmd);`,
    related: ["SDL_SubmitGPUCommandBuffer", "SDL_WaitAndAcquireGPUSwapchainTexture", "SDL_BeginGPURenderPass"],
    khronos: `${WIKI}SDL_AcquireGPUCommandBuffer`,
  },
  {
    name: "SDL_WaitAndAcquireGPUSwapchainTexture",
    category: "gpu",
    since: "SDL 3.2",
    signature: "bool SDL_WaitAndAcquireGPUSwapchainTexture(SDL_GPUCommandBuffer *command_buffer, SDL_Window *window, SDL_GPUTexture **swapchain_texture, Uint32 *swapchain_texture_width, Uint32 *swapchain_texture_height);",
    summary: {
      en: "Gets this frame's window image to draw into, waiting if all of them are still busy.",
      pt: "Pega a imagem da janela deste quadro para desenhar, esperando se todas ainda estão ocupadas.",
    },
    description: {
      en: "The texture you get is the window's next image. Use it as a render pass color target; when the command buffer is submitted, SDL presents it.\n\nTwo different outcomes need two checks. `false` is a real error. `true` with a NULL texture is NOT an error: it happens when the window is minimized, and simply means \"nothing to draw this frame\". Submit the command buffer anyway and skip the drawing.",
      pt: "A textura que você recebe é a próxima imagem da janela. Use como color target de um render pass; quando o command buffer for enviado, o SDL a apresenta.\n\nDois resultados diferentes pedem duas conferências. `false` é um erro de verdade. `true` com textura NULL NÃO é erro: acontece quando a janela está minimizada e significa só \"nada a desenhar neste quadro\". Envie o command buffer mesmo assim e pule o desenho.",
    },
    params: [
      { name: "command_buffer", type: "SDL_GPUCommandBuffer *", desc: { en: "This frame's command buffer.", pt: "O command buffer deste quadro." } },
      { name: "window", type: "SDL_Window *", desc: { en: "A window claimed with SDL_ClaimWindowForGPUDevice.", pt: "Uma janela reivindicada com SDL_ClaimWindowForGPUDevice." } },
      { name: "swapchain_texture", type: "SDL_GPUTexture **", desc: { en: "Receives the texture, or NULL when there is nothing to draw to.", pt: "Recebe a textura, ou NULL quando não há onde desenhar." } },
      { name: "swapchain_texture_width", type: "Uint32 *", desc: { en: "Receives its width in pixels, or NULL.", pt: "Recebe a largura em pixels, ou NULL." } },
      { name: "swapchain_texture_height", type: "Uint32 *", desc: { en: "Receives its height in pixels, or NULL.", pt: "Recebe a altura em pixels, ou NULL." } },
    ],
    returns: { en: "`true` on success (the texture may still be NULL), `false` on error.", pt: "`true` se deu certo (a textura ainda pode ser NULL), `false` em caso de erro." },
    notes: [
      { en: "Do not release the swapchain texture: it belongs to the window.", pt: "Não libere a textura da swapchain: ela pertence à janela." },
    ],
    example: `SDL_GPUTexture* swapchain = nullptr;
Uint32 w = 0, h = 0;
if (!SDL_WaitAndAcquireGPUSwapchainTexture(cmd, window, &swapchain, &w, &h)) {
    SDL_Log("acquire: %s", SDL_GetError());       // real error
    SDL_CancelGPUCommandBuffer(cmd);
    return;
}
if (!swapchain) {                                  // minimized: not an error
    SDL_SubmitGPUCommandBuffer(cmd);
    return;
}`,
    related: ["SDL_ClaimWindowForGPUDevice", "SDL_BeginGPURenderPass", "SDL_SubmitGPUCommandBuffer"],
    khronos: `${WIKI}SDL_WaitAndAcquireGPUSwapchainTexture`,
  },
  {
    name: "SDL_SubmitGPUCommandBuffer",
    category: "gpu",
    since: "SDL 3.2",
    signature: "bool SDL_SubmitGPUCommandBuffer(SDL_GPUCommandBuffer *command_buffer);",
    summary: {
      en: "Sends everything recorded in the command buffer to the GPU (and presents the swapchain image, if one was acquired).",
      pt: "Envia tudo o que foi gravado no command buffer para a GPU (e apresenta a imagem da swapchain, se uma foi pega).",
    },
    description: {
      en: "The work runs on the GPU after this returns; the CPU does not wait. The command buffer is finished: do not touch it again, acquire a new one next frame. To wait for the GPU (e.g. to read results back), SDL_SubmitGPUCommandBufferAndAcquireFence gives you a fence to wait on.",
      pt: "O trabalho roda na GPU depois que esta função retorna; a CPU não espera. O command buffer acabou: não mexa mais nele, pegue um novo no próximo quadro. Para esperar a GPU (ex.: para ler resultados), SDL_SubmitGPUCommandBufferAndAcquireFence dá um fence para esperar.",
    },
    params: [
      { name: "command_buffer", type: "SDL_GPUCommandBuffer *", desc: { en: "The recorded command buffer.", pt: "O command buffer gravado." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_EndGPURenderPass(pass);
SDL_SubmitGPUCommandBuffer(cmd);   // GPU runs it, window shows it`,
    related: ["SDL_AcquireGPUCommandBuffer", "SDL_WaitAndAcquireGPUSwapchainTexture"],
    khronos: `${WIKI}SDL_SubmitGPUCommandBuffer`,
  },
  {
    name: "SDL_BeginGPURenderPass",
    category: "gpu",
    since: "SDL 3.2",
    signature: "SDL_GPURenderPass * SDL_BeginGPURenderPass(SDL_GPUCommandBuffer *command_buffer, const SDL_GPUColorTargetInfo *color_target_infos, Uint32 num_color_targets, const SDL_GPUDepthStencilTargetInfo *depth_stencil_target_info);",
    summary: {
      en: "Starts a render pass: says which textures you draw into and how to treat their old contents.",
      pt: "Começa um render pass: diz em quais texturas você desenha e o que fazer com o conteúdo antigo delas.",
    },
    description: {
      en: "All drawing happens inside a render pass. Each color target says which texture (often the swapchain image), and two operations. `load_op` happens at the start: SDL_GPU_LOADOP_CLEAR fills with `clear_color` (this is how you clear the screen), LOAD keeps what was there, DONT_CARE lets the GPU skip it. `store_op` happens at the end: SDL_GPU_STOREOP_STORE keeps the result.\n\nWhile a render pass is open you cannot start another pass. Close it with SDL_EndGPURenderPass.",
      pt: "Todo desenho acontece dentro de um render pass. Cada color target diz qual textura (muitas vezes a imagem da swapchain) e duas operações. `load_op` acontece no início: SDL_GPU_LOADOP_CLEAR preenche com `clear_color` (é assim que você limpa a tela), LOAD mantém o que havia, DONT_CARE deixa a GPU pular. `store_op` acontece no fim: SDL_GPU_STOREOP_STORE guarda o resultado.\n\nEnquanto um render pass está aberto você não pode começar outro pass. Feche com SDL_EndGPURenderPass.",
    },
    params: [
      { name: "command_buffer", type: "SDL_GPUCommandBuffer *", desc: { en: "This frame's command buffer.", pt: "O command buffer deste quadro." } },
      { name: "color_target_infos", type: "const SDL_GPUColorTargetInfo *", desc: { en: "Array of color targets: texture, clear_color, load_op, store_op.", pt: "Array de color targets: texture, clear_color, load_op, store_op." } },
      { name: "num_color_targets", type: "Uint32", desc: { en: "How many color targets (1 for a plain window).", pt: "Quantos color targets (1 para uma janela simples)." } },
      { name: "depth_stencil_target_info", type: "const SDL_GPUDepthStencilTargetInfo *", desc: { en: "The depth buffer for 3D, or NULL.", pt: "O depth buffer para 3D, ou NULL." } },
    ],
    returns: { en: "The render pass handle.", pt: "O identificador do render pass." },
    example: `SDL_GPUColorTargetInfo color{};
color.texture     = swapchain;
color.clear_color = SDL_FColor{0.06f, 0.07f, 0.10f, 1.0f};
color.load_op     = SDL_GPU_LOADOP_CLEAR;
color.store_op    = SDL_GPU_STOREOP_STORE;
SDL_GPURenderPass* pass = SDL_BeginGPURenderPass(cmd, &color, 1, nullptr);`,
    related: ["SDL_EndGPURenderPass", "SDL_BindGPUGraphicsPipeline", "SDL_DrawGPUPrimitives"],
    khronos: `${WIKI}SDL_BeginGPURenderPass`,
  },
  {
    name: "SDL_EndGPURenderPass",
    category: "gpu",
    since: "SDL 3.2",
    signature: "void SDL_EndGPURenderPass(SDL_GPURenderPass *render_pass);",
    summary: {
      en: "Ends a render pass. After it you may start another pass or submit.",
      pt: "Termina um render pass. Depois dele você pode começar outro pass ou enviar.",
    },
    description: {
      en: "The render pass handle is invalid afterwards. Every Begin needs its End before the command buffer is submitted.",
      pt: "O identificador do render pass fica inválido depois. Todo Begin precisa do seu End antes de o command buffer ser enviado.",
    },
    params: [
      { name: "render_pass", type: "SDL_GPURenderPass *", desc: { en: "The pass to end.", pt: "O pass a terminar." } },
    ],
    example: `SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);
SDL_EndGPURenderPass(pass);
SDL_SubmitGPUCommandBuffer(cmd);`,
    related: ["SDL_BeginGPURenderPass"],
    khronos: `${WIKI}SDL_EndGPURenderPass`,
  },
  {
    name: "SDL_BindGPUGraphicsPipeline",
    category: "gpu",
    since: "SDL 3.2",
    signature: "void SDL_BindGPUGraphicsPipeline(SDL_GPURenderPass *render_pass, SDL_GPUGraphicsPipeline *graphics_pipeline);",
    summary: {
      en: "Selects the pipeline (shaders + fixed settings) for the next draw calls in this pass.",
      pt: "Seleciona o pipeline (shaders + configurações fixas) para as próximas chamadas de desenho deste pass.",
    },
    description: {
      en: "A pipeline bundles everything about HOW to draw: the vertex and fragment shaders, the vertex layout, blending, culling, depth testing. Binding it is cheap; creating it (SDL_CreateGPUGraphicsPipeline) is expensive, so create all pipelines at load time.",
      pt: "Um pipeline junta tudo sobre COMO desenhar: os shaders de vértice e de fragmento, o layout dos vértices, blending, culling, teste de profundidade. Vinculá-lo é barato; criá-lo (SDL_CreateGPUGraphicsPipeline) é caro, então crie todos os pipelines no carregamento.",
    },
    params: [
      { name: "render_pass", type: "SDL_GPURenderPass *", desc: { en: "The open render pass.", pt: "O render pass aberto." } },
      { name: "graphics_pipeline", type: "SDL_GPUGraphicsPipeline *", desc: { en: "The pipeline to use.", pt: "O pipeline a usar." } },
    ],
    example: `SDL_BindGPUGraphicsPipeline(pass, pipeline);
SDL_BindGPUVertexBuffers(pass, 0, &vb, 1);
SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);`,
    related: ["SDL_CreateGPUGraphicsPipeline", "SDL_DrawGPUPrimitives"],
    khronos: `${WIKI}SDL_BindGPUGraphicsPipeline`,
  },
  {
    name: "SDL_BindGPUVertexBuffers",
    category: "gpu",
    since: "SDL 3.2",
    signature: "void SDL_BindGPUVertexBuffers(SDL_GPURenderPass *render_pass, Uint32 first_slot, const SDL_GPUBufferBinding *bindings, Uint32 num_bindings);",
    summary: {
      en: "Tells the next draws which GPU buffers to read vertices from.",
      pt: "Diz às próximas chamadas de desenho de quais buffers da GPU ler os vértices.",
    },
    description: {
      en: "Each SDL_GPUBufferBinding is `{buffer, offset}`: a buffer created with SDL_GPU_BUFFERUSAGE_VERTEX and the byte where the data starts. Slots match the vertex buffer descriptions in the pipeline: slot 0 for positions and colours in the simple case.",
      pt: "Cada SDL_GPUBufferBinding é `{buffer, offset}`: um buffer criado com SDL_GPU_BUFFERUSAGE_VERTEX e o byte onde os dados começam. Os slots correspondem às descrições de vertex buffer do pipeline: slot 0 para posições e cores no caso simples.",
    },
    params: [
      { name: "render_pass", type: "SDL_GPURenderPass *", desc: { en: "The open render pass.", pt: "O render pass aberto." } },
      { name: "first_slot", type: "Uint32", desc: { en: "The first slot to fill, usually 0.", pt: "O primeiro slot a preencher, normalmente 0." } },
      { name: "bindings", type: "const SDL_GPUBufferBinding *", desc: { en: "Array of {buffer, offset}.", pt: "Array de {buffer, offset}." } },
      { name: "num_bindings", type: "Uint32", desc: { en: "How many bindings.", pt: "Quantos bindings." } },
    ],
    example: `SDL_GPUBufferBinding vb{vertexBuffer, 0};
SDL_BindGPUVertexBuffers(pass, 0, &vb, 1);`,
    related: ["SDL_CreateGPUBuffer", "SDL_DrawGPUPrimitives"],
    khronos: `${WIKI}SDL_BindGPUVertexBuffers`,
  },
  {
    name: "SDL_DrawGPUPrimitives",
    category: "gpu",
    since: "SDL 3.2",
    signature: "void SDL_DrawGPUPrimitives(SDL_GPURenderPass *render_pass, Uint32 num_vertices, Uint32 num_instances, Uint32 first_vertex, Uint32 first_instance);",
    summary: {
      en: "Draws: runs the bound pipeline over num_vertices vertices, num_instances times.",
      pt: "Desenha: roda o pipeline vinculado sobre num_vertices vértices, num_instances vezes.",
    },
    description: {
      en: "The SDL_GPU version of glDrawArrays / vkCmdDraw. The vertices are grouped into primitives according to the pipeline's primitive type (a triangle list takes them three by three). Instancing draws the same vertices several times; the shader tells the copies apart by the instance index.\n\nSDL_DrawGPUIndexedPrimitives does the same with an index buffer.",
      pt: "A versão do SDL_GPU de glDrawArrays / vkCmdDraw. Os vértices são agrupados em primitivas segundo o tipo de primitiva do pipeline (uma triangle list os pega de três em três). Instancing desenha os mesmos vértices várias vezes; o shader distingue as cópias pelo índice da instância.\n\nSDL_DrawGPUIndexedPrimitives faz o mesmo com um index buffer.",
    },
    params: [
      { name: "render_pass", type: "SDL_GPURenderPass *", desc: { en: "The open render pass.", pt: "O render pass aberto." } },
      { name: "num_vertices", type: "Uint32", desc: { en: "How many vertices (3 for one triangle).", pt: "Quantos vértices (3 para um triângulo)." } },
      { name: "num_instances", type: "Uint32", desc: { en: "How many copies; 1 for a normal draw.", pt: "Quantas cópias; 1 para um desenho normal." } },
      { name: "first_vertex", type: "Uint32", desc: { en: "Index of the first vertex to use, usually 0.", pt: "Índice do primeiro vértice a usar, normalmente 0." } },
      { name: "first_instance", type: "Uint32", desc: { en: "First instance index, usually 0.", pt: "Primeiro índice de instância, normalmente 0." } },
    ],
    example: `SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);   // one triangle`,
    related: ["SDL_BindGPUGraphicsPipeline", "SDL_BindGPUVertexBuffers"],
    khronos: `${WIKI}SDL_DrawGPUPrimitives`,
  },
];

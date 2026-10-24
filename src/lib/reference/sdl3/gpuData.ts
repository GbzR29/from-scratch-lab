// src/lib/reference/sdl3/gpuData.ts
// SDL 3.2 GPU API: shaders, pipelines, buffers and uploading data through transfer buffers.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const gpuDataEntries: RefEntry[] = [
  {
    name: "SDL_CreateGPUShader",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "SDL_GPUShader * SDL_CreateGPUShader(SDL_GPUDevice *device, const SDL_GPUShaderCreateInfo *createinfo);",
    summary: {
      en: "Loads one compiled shader (vertex or fragment) into the device.",
      pt: "Carrega um shader compilado (de vértice ou de fragmento) no device.",
    },
    description: {
      en: "SDL_GPU takes shaders already compiled, in the device's format (SPIR-V, DXIL or MSL). The create info gives the bytes (`code`, `code_size`), the `entrypoint` name (\"main\"), the `format`, the `stage` (SDL_GPU_SHADERSTAGE_VERTEX or _FRAGMENT), and how many resources the shader uses: `num_samplers`, `num_storage_textures`, `num_storage_buffers`, `num_uniform_buffers`.\n\nThose counts must match the shader exactly, and resources must sit in the binding slots SDL expects (for SPIR-V: set 0/1 for the vertex stage, 2/3 for the fragment stage). A shader is only an ingredient: it does nothing until it goes into a pipeline, after which you can release it.",
      pt: "O SDL_GPU recebe shaders já compilados, no formato do device (SPIR-V, DXIL ou MSL). O create info dá os bytes (`code`, `code_size`), o nome do `entrypoint` (\"main\"), o `format`, o `stage` (SDL_GPU_SHADERSTAGE_VERTEX ou _FRAGMENT) e quantos recursos o shader usa: `num_samplers`, `num_storage_textures`, `num_storage_buffers`, `num_uniform_buffers`.\n\nEssas contagens precisam bater exatamente com o shader, e os recursos precisam estar nos slots que o SDL espera (para SPIR-V: set 0/1 no estágio de vértice, 2/3 no de fragmento). Um shader é só um ingrediente: não faz nada até entrar num pipeline, e depois disso você pode liberá-lo.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "createinfo", type: "const SDL_GPUShaderCreateInfo *", desc: { en: "Code, entry point, format, stage and resource counts.", pt: "Código, entry point, formato, estágio e contagem de recursos." } },
    ],
    returns: { en: "The shader, or NULL on failure.", pt: "O shader, ou NULL se falhar." },
    example: `size_t size;
void* code = SDL_LoadFile("shaders/triangle.vert.spv", &size);
SDL_GPUShaderCreateInfo info{};
info.code       = static_cast<const Uint8*>(code);
info.code_size  = size;
info.entrypoint = "main";
info.format     = SDL_GPU_SHADERFORMAT_SPIRV;
info.stage      = SDL_GPU_SHADERSTAGE_VERTEX;
SDL_GPUShader* vs = SDL_CreateGPUShader(device, &info);
SDL_free(code);`,
    related: ["SDL_CreateGPUGraphicsPipeline", "SDL_GetGPUShaderFormats", "SDL_LoadFile"],
    khronos: `${WIKI}SDL_CreateGPUShader`,
  },
  {
    name: "SDL_CreateGPUGraphicsPipeline",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "SDL_GPUGraphicsPipeline * SDL_CreateGPUGraphicsPipeline(SDL_GPUDevice *device, const SDL_GPUGraphicsPipelineCreateInfo *createinfo);",
    summary: {
      en: "Builds a pipeline: shaders, vertex layout, primitive type, blending and target formats, fixed together.",
      pt: "Constrói um pipeline: shaders, layout de vértices, tipo de primitiva, blending e formatos de alvo, fixados juntos.",
    },
    description: {
      en: "Modern GPUs compile all drawing state into one object ahead of time, so switching between draws is fast. The create info holds the `vertex_shader` and `fragment_shader`, the `vertex_input_state` (how bytes in your buffer become shader inputs), the `primitive_type` (e.g. SDL_GPU_PRIMITIVETYPE_TRIANGLELIST), rasterizer, depth-stencil and multisample state, and `target_info`: the formats of the textures this pipeline will draw into.\n\nThe color target format must match the texture you draw into; for the window use SDL_GetGPUSwapchainTextureFormat(device, window). Create pipelines at load time; afterwards the shaders can be released.",
      pt: "As GPUs modernas compilam todo o estado de desenho num objeto antecipadamente, para a troca entre desenhos ser rápida. O create info guarda o `vertex_shader` e o `fragment_shader`, o `vertex_input_state` (como os bytes do seu buffer viram entradas do shader), o `primitive_type` (ex.: SDL_GPU_PRIMITIVETYPE_TRIANGLELIST), os estados de rasterização, profundidade-stencil e multisample, e o `target_info`: os formatos das texturas em que este pipeline vai desenhar.\n\nO formato do color target precisa bater com a textura onde você desenha; para a janela use SDL_GetGPUSwapchainTextureFormat(device, window). Crie os pipelines no carregamento; depois os shaders podem ser liberados.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "createinfo", type: "const SDL_GPUGraphicsPipelineCreateInfo *", desc: { en: "Shaders, vertex input, primitive type, states and target formats.", pt: "Shaders, entrada de vértices, tipo de primitiva, estados e formatos de alvo." } },
    ],
    returns: { en: "The pipeline, or NULL on failure (shader/layout mismatch, unsupported state…).", pt: "O pipeline, ou NULL se falhar (shader e layout incompatíveis, estado não suportado…)." },
    example: `SDL_GPUColorTargetDescription target{};
target.format = SDL_GetGPUSwapchainTextureFormat(device, window);

SDL_GPUGraphicsPipelineCreateInfo info{};
info.vertex_shader   = vs;
info.fragment_shader = fs;
info.vertex_input_state = vertexInput;          // buffers + attributes
info.primitive_type  = SDL_GPU_PRIMITIVETYPE_TRIANGLELIST;
info.target_info.color_target_descriptions = &target;
info.target_info.num_color_targets         = 1;
SDL_GPUGraphicsPipeline* pipeline = SDL_CreateGPUGraphicsPipeline(device, &info);
SDL_ReleaseGPUShader(device, vs);   // baked into the pipeline now
SDL_ReleaseGPUShader(device, fs);`,
    related: ["SDL_CreateGPUShader", "SDL_BindGPUGraphicsPipeline"],
    khronos: `${WIKI}SDL_CreateGPUGraphicsPipeline`,
  },
  {
    name: "SDL_CreateGPUBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "SDL_GPUBuffer * SDL_CreateGPUBuffer(SDL_GPUDevice *device, const SDL_GPUBufferCreateInfo *createinfo);",
    summary: {
      en: "Creates a buffer in GPU memory for vertices, indices or shader data. It starts empty.",
      pt: "Cria um buffer na memória da GPU para vértices, índices ou dados de shader. Ele começa vazio.",
    },
    description: {
      en: "The create info has a `usage` (what the buffer is for) and a `size` in bytes. The CPU cannot write into a GPU buffer directly: fill it by copying from a transfer buffer in a copy pass (SDL_UploadToGPUBuffer).",
      pt: "O create info tem um `usage` (para que serve o buffer) e um `size` em bytes. A CPU não consegue escrever direto num buffer da GPU: preencha copiando de um transfer buffer num copy pass (SDL_UploadToGPUBuffer).",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      {
        name: "createinfo",
        type: "const SDL_GPUBufferCreateInfo *",
        desc: { en: "`usage` flags and `size` in bytes.", pt: "Flags de `usage` e `size` em bytes." },
        values: [
          { name: "SDL_GPU_BUFFERUSAGE_VERTEX", desc: { en: "Vertex data (SDL_BindGPUVertexBuffers).", pt: "Dados de vértice (SDL_BindGPUVertexBuffers)." } },
          { name: "SDL_GPU_BUFFERUSAGE_INDEX", desc: { en: "Indices (SDL_BindGPUIndexBuffer).", pt: "Índices (SDL_BindGPUIndexBuffer)." } },
          { name: "SDL_GPU_BUFFERUSAGE_GRAPHICS_STORAGE_READ", desc: { en: "Read by shaders as a storage buffer.", pt: "Lido pelos shaders como storage buffer." } },
          { name: "SDL_GPU_BUFFERUSAGE_INDIRECT", desc: { en: "Draw parameters written by the GPU (indirect draws).", pt: "Parâmetros de desenho escritos pela GPU (desenhos indiretos)." } },
        ],
      },
    ],
    returns: { en: "The buffer, or NULL on failure.", pt: "O buffer, ou NULL se falhar." },
    example: `SDL_GPUBufferCreateInfo bufInfo{};
bufInfo.usage = SDL_GPU_BUFFERUSAGE_VERTEX;
bufInfo.size  = sizeof(vertices);
SDL_GPUBuffer* vertexBuffer = SDL_CreateGPUBuffer(device, &bufInfo);`,
    related: ["SDL_CreateGPUTransferBuffer", "SDL_UploadToGPUBuffer", "SDL_ReleaseGPUBuffer"],
    khronos: `${WIKI}SDL_CreateGPUBuffer`,
  },
  {
    name: "SDL_ReleaseGPUBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "void SDL_ReleaseGPUBuffer(SDL_GPUDevice *device, SDL_GPUBuffer *buffer);",
    summary: {
      en: "Frees a GPU buffer as soon as the GPU has finished using it.",
      pt: "Libera um buffer da GPU assim que a GPU terminar de usá-lo.",
    },
    description: {
      en: "Frames already submitted may still read the buffer, so SDL waits until that work is done before really freeing it. You can call it right away without a crash; just do not use the pointer afterwards.",
      pt: "Quadros já enviados ainda podem estar lendo o buffer, então o SDL espera esse trabalho terminar antes de liberar de verdade. Dá para chamar na hora sem quebrar nada; só não use o ponteiro depois.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "buffer", type: "SDL_GPUBuffer *", desc: { en: "The buffer to free.", pt: "O buffer a liberar." } },
    ],
    example: `SDL_ReleaseGPUBuffer(device, vertexBuffer);
vertexBuffer = nullptr;`,
    related: ["SDL_CreateGPUBuffer", "SDL_ReleaseGPUTransferBuffer"],
    khronos: `${WIKI}SDL_ReleaseGPUBuffer`,
  },
  {
    name: "SDL_CreateGPUTransferBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "SDL_GPUTransferBuffer * SDL_CreateGPUTransferBuffer(SDL_GPUDevice *device, const SDL_GPUTransferBufferCreateInfo *createinfo);",
    summary: {
      en: "Creates a staging buffer the CPU CAN write into, used to move data to (or from) the GPU.",
      pt: "Cria um buffer de passagem em que a CPU CONSEGUE escrever, usado para levar dados para a GPU (ou trazer de lá).",
    },
    description: {
      en: "Uploading takes two hops. Fastest GPU memory is not visible to the CPU, so you write into a transfer buffer (mapped memory the CPU can see), then a copy pass moves the bytes into the real buffer or texture.\n\n`usage` is SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD (CPU → GPU) or _DOWNLOAD (GPU → CPU, e.g. reading a screenshot back). `size` is in bytes.",
      pt: "Enviar dados leva dois saltos. A memória mais rápida da GPU não é visível para a CPU, então você escreve num transfer buffer (memória mapeada que a CPU vê) e depois um copy pass move os bytes para o buffer ou textura de verdade.\n\n`usage` é SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD (CPU → GPU) ou _DOWNLOAD (GPU → CPU, ex.: ler uma captura de tela). `size` é em bytes.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "createinfo", type: "const SDL_GPUTransferBufferCreateInfo *", desc: { en: "`usage` (UPLOAD or DOWNLOAD) and `size` in bytes.", pt: "`usage` (UPLOAD ou DOWNLOAD) e `size` em bytes." } },
    ],
    returns: { en: "The transfer buffer, or NULL on failure.", pt: "O transfer buffer, ou NULL se falhar." },
    example: `SDL_GPUTransferBufferCreateInfo tbInfo{};
tbInfo.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
tbInfo.size  = sizeof(vertices);
SDL_GPUTransferBuffer* staging = SDL_CreateGPUTransferBuffer(device, &tbInfo);`,
    related: ["SDL_MapGPUTransferBuffer", "SDL_UploadToGPUBuffer", "SDL_ReleaseGPUTransferBuffer"],
    khronos: `${WIKI}SDL_CreateGPUTransferBuffer`,
  },
  {
    name: "SDL_MapGPUTransferBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "void * SDL_MapGPUTransferBuffer(SDL_GPUDevice *device, SDL_GPUTransferBuffer *transfer_buffer, bool cycle);",
    summary: {
      en: "Gives you a CPU pointer into a transfer buffer, so you can memcpy your data in.",
      pt: "Te dá um ponteiro de CPU para dentro de um transfer buffer, para você copiar os dados com memcpy.",
    },
    description: {
      en: "Write your data, then SDL_UnmapGPUTransferBuffer BEFORE recording the copy. The memory belongs to the driver: never SDL_free it.\n\n`cycle` matters when you reuse the same transfer buffer every frame. With `true`, if the GPU is still reading the previous contents, SDL hands you fresh memory instead of making you wait or overwriting data in use. For a one-shot upload pass `false`.",
      pt: "Escreva os dados e chame SDL_UnmapGPUTransferBuffer ANTES de gravar a cópia. A memória pertence ao driver: nunca use SDL_free nela.\n\n`cycle` importa quando você reusa o mesmo transfer buffer todo quadro. Com `true`, se a GPU ainda está lendo o conteúdo anterior, o SDL te dá memória nova em vez de fazer você esperar ou sobrescrever dados em uso. Para um envio único passe `false`.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "transfer_buffer", type: "SDL_GPUTransferBuffer *", desc: { en: "The transfer buffer.", pt: "O transfer buffer." } },
      { name: "cycle", type: "bool", desc: { en: "`true` to get fresh memory if the old contents may still be in use.", pt: "`true` para receber memória nova se o conteúdo antigo ainda pode estar em uso." } },
    ],
    returns: { en: "The mapped address, or NULL on failure.", pt: "O endereço mapeado, ou NULL se falhar." },
    example: `void* mapped = SDL_MapGPUTransferBuffer(device, staging, false);
SDL_memcpy(mapped, vertices, sizeof(vertices));
SDL_UnmapGPUTransferBuffer(device, staging);`,
    related: ["SDL_UnmapGPUTransferBuffer", "SDL_CreateGPUTransferBuffer"],
    khronos: `${WIKI}SDL_MapGPUTransferBuffer`,
  },
  {
    name: "SDL_UnmapGPUTransferBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "void SDL_UnmapGPUTransferBuffer(SDL_GPUDevice *device, SDL_GPUTransferBuffer *transfer_buffer);",
    summary: {
      en: "Ends CPU access to a mapped transfer buffer. Required before copying from it.",
      pt: "Encerra o acesso da CPU a um transfer buffer mapeado. Obrigatório antes de copiar dele.",
    },
    description: {
      en: "After this the pointer from SDL_MapGPUTransferBuffer is invalid. Upload commands recorded while the buffer is still mapped are an error.",
      pt: "Depois disto o ponteiro de SDL_MapGPUTransferBuffer fica inválido. Comandos de envio gravados com o buffer ainda mapeado são um erro.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "transfer_buffer", type: "SDL_GPUTransferBuffer *", desc: { en: "The mapped transfer buffer.", pt: "O transfer buffer mapeado." } },
    ],
    example: `SDL_UnmapGPUTransferBuffer(device, staging);
SDL_GPUCopyPass* copy = SDL_BeginGPUCopyPass(cmd);`,
    related: ["SDL_MapGPUTransferBuffer", "SDL_BeginGPUCopyPass"],
    khronos: `${WIKI}SDL_UnmapGPUTransferBuffer`,
  },
  {
    name: "SDL_BeginGPUCopyPass",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "SDL_GPUCopyPass * SDL_BeginGPUCopyPass(SDL_GPUCommandBuffer *command_buffer);",
    summary: {
      en: "Starts a copy pass: the part of a command buffer where data moves between buffers and textures.",
      pt: "Começa um copy pass: a parte de um command buffer onde dados se movem entre buffers e texturas.",
    },
    description: {
      en: "Uploads (SDL_UploadToGPUBuffer, SDL_UploadToGPUTexture), downloads and GPU-to-GPU copies are recorded inside a copy pass. Like a render pass it cannot overlap another pass; end it with SDL_EndGPUCopyPass. A common frame does the copy pass first, then the render pass that uses the new data.",
      pt: "Envios (SDL_UploadToGPUBuffer, SDL_UploadToGPUTexture), downloads e cópias de GPU para GPU são gravados dentro de um copy pass. Como um render pass, ele não pode se sobrepor a outro pass; termine com SDL_EndGPUCopyPass. Um quadro comum faz o copy pass primeiro e depois o render pass que usa os dados novos.",
    },
    params: [
      { name: "command_buffer", type: "SDL_GPUCommandBuffer *", desc: { en: "The command buffer to record into.", pt: "O command buffer onde gravar." } },
    ],
    returns: { en: "The copy pass handle.", pt: "O identificador do copy pass." },
    example: `SDL_GPUCommandBuffer* cmd  = SDL_AcquireGPUCommandBuffer(device);
SDL_GPUCopyPass*      copy = SDL_BeginGPUCopyPass(cmd);
SDL_UploadToGPUBuffer(copy, &src, &dst, false);
SDL_EndGPUCopyPass(copy);
SDL_SubmitGPUCommandBuffer(cmd);`,
    related: ["SDL_UploadToGPUBuffer", "SDL_EndGPUCopyPass"],
    khronos: `${WIKI}SDL_BeginGPUCopyPass`,
  },
  {
    name: "SDL_UploadToGPUBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "void SDL_UploadToGPUBuffer(SDL_GPUCopyPass *copy_pass, const SDL_GPUTransferBufferLocation *source, const SDL_GPUBufferRegion *destination, bool cycle);",
    summary: {
      en: "Records a copy from a transfer buffer into a GPU buffer.",
      pt: "Grava uma cópia de um transfer buffer para um buffer da GPU.",
    },
    description: {
      en: "`source` is `{transfer_buffer, offset}`: where the bytes start in the staging buffer. `destination` is `{buffer, offset, size}`: where they go and how many. The copy itself happens on the GPU when the command buffer runs.\n\n`cycle` works like in SDL_MapGPUTransferBuffer: `true` lets SDL use fresh memory for the destination if a previous frame is still reading it.",
      pt: "`source` é `{transfer_buffer, offset}`: onde os bytes começam no buffer de passagem. `destination` é `{buffer, offset, size}`: para onde vão e quantos são. A cópia em si acontece na GPU quando o command buffer roda.\n\n`cycle` funciona como em SDL_MapGPUTransferBuffer: `true` deixa o SDL usar memória nova para o destino se um quadro anterior ainda o está lendo.",
    },
    params: [
      { name: "copy_pass", type: "SDL_GPUCopyPass *", desc: { en: "The open copy pass.", pt: "O copy pass aberto." } },
      { name: "source", type: "const SDL_GPUTransferBufferLocation *", desc: { en: "{transfer_buffer, offset}.", pt: "{transfer_buffer, offset}." } },
      { name: "destination", type: "const SDL_GPUBufferRegion *", desc: { en: "{buffer, offset, size}.", pt: "{buffer, offset, size}." } },
      { name: "cycle", type: "bool", desc: { en: "`true` to avoid waiting on a destination still in use.", pt: "`true` para não esperar por um destino ainda em uso." } },
    ],
    example: `SDL_GPUTransferBufferLocation src{staging, 0};
SDL_GPUBufferRegion dst{vertexBuffer, 0, sizeof(vertices)};
SDL_UploadToGPUBuffer(copy, &src, &dst, false);`,
    related: ["SDL_BeginGPUCopyPass", "SDL_CreateGPUTransferBuffer", "SDL_CreateGPUBuffer"],
    khronos: `${WIKI}SDL_UploadToGPUBuffer`,
  },
  {
    name: "SDL_EndGPUCopyPass",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "void SDL_EndGPUCopyPass(SDL_GPUCopyPass *copy_pass);",
    summary: {
      en: "Ends a copy pass.",
      pt: "Termina um copy pass.",
    },
    description: {
      en: "After it you can begin a render pass in the same command buffer; the GPU makes sure the copies are finished before the draws that read the data.",
      pt: "Depois dele você pode começar um render pass no mesmo command buffer; a GPU garante que as cópias terminem antes dos desenhos que leem os dados.",
    },
    params: [
      { name: "copy_pass", type: "SDL_GPUCopyPass *", desc: { en: "The pass to end.", pt: "O pass a terminar." } },
    ],
    example: `SDL_EndGPUCopyPass(copy);`,
    related: ["SDL_BeginGPUCopyPass"],
    khronos: `${WIKI}SDL_EndGPUCopyPass`,
  },
  {
    name: "SDL_ReleaseGPUTransferBuffer",
    category: "gpu-data",
    since: "SDL 3.2",
    signature: "void SDL_ReleaseGPUTransferBuffer(SDL_GPUDevice *device, SDL_GPUTransferBuffer *transfer_buffer);",
    summary: {
      en: "Frees a transfer buffer as soon as it is safe (after the GPU finished copying from it).",
      pt: "Libera um transfer buffer assim que for seguro (depois que a GPU terminar de copiar dele).",
    },
    description: {
      en: "For a one-time upload (a mesh loaded at startup) release the staging buffer right after submitting: SDL keeps it alive until the copy is done. For data that changes every frame, keep one transfer buffer and reuse it with `cycle = true` instead of creating and releasing one per frame.",
      pt: "Para um envio único (uma malha carregada na partida) libere o buffer de passagem logo depois de enviar: o SDL o mantém vivo até a cópia terminar. Para dados que mudam todo quadro, mantenha um transfer buffer e reuse com `cycle = true` em vez de criar e liberar um por quadro.",
    },
    params: [
      { name: "device", type: "SDL_GPUDevice *", desc: { en: "The device.", pt: "O device." } },
      { name: "transfer_buffer", type: "SDL_GPUTransferBuffer *", desc: { en: "The transfer buffer to free.", pt: "O transfer buffer a liberar." } },
    ],
    example: `SDL_SubmitGPUCommandBuffer(cmd);
SDL_ReleaseGPUTransferBuffer(device, staging);   // freed once the copy finishes`,
    related: ["SDL_CreateGPUTransferBuffer", "SDL_ReleaseGPUBuffer"],
    khronos: `${WIKI}SDL_ReleaseGPUTransferBuffer`,
  },
];

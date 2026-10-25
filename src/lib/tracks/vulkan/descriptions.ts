// src/lib/tracks/vulkan/descriptions.ts
// What search results show under each Vulkan lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const vulkanDescriptions: LessonDescriptions = {
  "why-vulkan": {
    en: "Why Vulkan: what the OpenGL driver did for you, what an explicit GPU API gains and costs, the create-info pattern, and one frame in outline.",
    pt: "Por que Vulkan: o que o driver do OpenGL fazia por você, o que uma API explícita ganha e custa, o padrão create-info e um quadro em linhas gerais.",
  },
  instance: {
    en: "Create a Vulkan instance in C++: the loader, window extensions, VkApplicationInfo, the validation layer and debug messenger, and shutdown order.",
    pt: "Crie uma instância Vulkan em C++: o loader, extensões da janela, VkApplicationInfo, a camada de validação e o debug messenger, e a ordem de destruição.",
  },
  devices: {
    en: "Vulkan physical devices and queue families: choosing a GPU, finding graphics and present queues, and creating the logical device with its features.",
    pt: "Dispositivos físicos e queue families no Vulkan: escolher a GPU, achar filas de gráficos e apresentação e criar o dispositivo lógico com seus recursos.",
  },
  swapchain: {
    en: "The Vulkan swapchain: window surface, image format, present modes (FIFO, mailbox), image count, image views, and recreating it on resize.",
    pt: "A swapchain do Vulkan: surface da janela, formato de imagem, modos de apresentação (FIFO, mailbox), número de imagens, image views e recriação ao redimensionar.",
  },
  pipeline: {
    en: "The Vulkan graphics pipeline: GLSL compiled to SPIR-V, shader modules, every piece of pipeline state, dynamic state, and Vulkan's clip space.",
    pt: "O pipeline gráfico do Vulkan: GLSL compilado para SPIR-V, shader modules, cada parte do estado do pipeline, estado dinâmico e o clip space do Vulkan.",
  },
  commands: {
    en: "Vulkan command buffers: command pools, the command buffer lifecycle, image layouts and transitions, dynamic rendering, and recording one frame.",
    pt: "Command buffers no Vulkan: command pools, o ciclo de vida do command buffer, layouts e transições de imagem, dynamic rendering e gravar um quadro.",
  },
  synchronization: {
    en: "Vulkan synchronization explained: fences vs semaphores vs pipeline barriers, the acquire-submit-present frame loop, stages and access masks.",
    pt: "Sincronização no Vulkan explicada: fences vs semáforos vs pipeline barriers, o loop acquire-submit-present, estágios e máscaras de acesso.",
  },
  "buffers-memory": {
    en: "Vulkan buffers and memory: memory heaps and types, property flags, creating and binding a vertex buffer, and why real apps sub-allocate.",
    pt: "Buffers e memória no Vulkan: heaps e tipos de memória, flags de propriedade, criar e associar um vertex buffer e por que apps reais sub-alocam.",
  },
  staging: {
    en: "Vulkan staging buffers: why vertex data belongs in device-local memory, uploading with a GPU copy, batching uploads, and transfer queues.",
    pt: "Staging buffers no Vulkan: por que os vértices vão para a memória local da GPU, envio com cópia na GPU, agrupar envios e filas de transferência.",
  },
  descriptors: {
    en: "Vulkan descriptor sets, uniform buffers and push constants: descriptor types, std140 layout, set layouts, pools, dynamic offsets and a camera.",
    pt: "Descriptor sets, uniform buffers e push constants no Vulkan: tipos de descritor, layout std140, set layouts, pools, offsets dinâmicos e uma câmera.",
  },
  textures: {
    en: "Vulkan textures and samplers: images, memory and image views, uploading a PNG, layout transitions, sRGB vs linear formats, and binding a sampler.",
    pt: "Texturas e samplers no Vulkan: imagens, memória e image views, enviar um PNG, transições de layout, formatos sRGB vs lineares e ligar um sampler.",
  },
  depth: {
    en: "Depth buffering and face culling in Vulkan: depth formats and precision, creating the depth image, pipeline depth state, and back-face culling.",
    pt: "Depth buffer e face culling no Vulkan: formatos e precisão de profundidade, criar a imagem de profundidade, estado de profundidade no pipeline e culling.",
  },
  "frames-in-flight": {
    en: "Vulkan frames in flight: why one frame at a time idles the GPU, choosing the count, per-frame resources, and resizing without vkDeviceWaitIdle.",
    pt: "Frames in flight no Vulkan: por que um quadro por vez deixa a GPU ociosa, quantos usar, recursos por quadro e redimensionar sem vkDeviceWaitIdle.",
  },
  "mipmaps-msaa": {
    en: "Mipmaps and MSAA in Vulkan: why textures shimmer, generating mip chains with blits on the GPU, multisampling, and resolving into the swapchain.",
    pt: "Mipmaps e MSAA no Vulkan: por que texturas tremulam, gerar a cadeia de mips na GPU com blits, multisampling e resolver na swapchain.",
  },
  compute: {
    en: "Vulkan compute shaders: workgroups and invocations, the compute pipeline, dispatching between barriers, and a GPU particle simulation.",
    pt: "Compute shaders no Vulkan: workgroups e invocações, o pipeline de compute, dispatch entre barreiras e uma simulação de partículas na GPU.",
  },
  modern: {
    en: "Modern Vulkan: Vulkan 1.2 features, bindless textures with descriptor indexing, buffer device addresses, timeline semaphores, and Vulkan 1.4.",
    pt: "Vulkan moderno: recursos do Vulkan 1.2, texturas bindless com descriptor indexing, buffer device address, timeline semaphores e Vulkan 1.4.",
  },
};

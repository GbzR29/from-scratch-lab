// ── About the Vulkan track ────────────────────────────────────────────────────
// The text block of the track page (/Vulkan, /pt/Vulkan): what the track is,
// what the reader builds and what they need. Read by components/track/TrackAbout.

import type { TrackAbout } from "@/lib/tracks/about";

export const vulkanAbout: TrackAbout = {
  en: {
    title: "Learn Vulkan from an empty window to a modern renderer",
    paragraphs: [
      "Vulkan is the explicit graphics and compute API from Khronos, the group behind OpenGL. It runs on Windows, Linux and Android, and on macOS and iOS through MoltenVK. Where OpenGL's driver guesses what you mean, Vulkan makes you say it: which memory a buffer lives in, when an image changes layout, which work must wait for which. That is more code, and in exchange the CPU cost is low and predictable, and the same ideas carry over to Direct3D 12 and Metal.",
      "This tutorial targets Vulkan 1.3 in C++20, with the plain C API, SDL3 for the window and GLM for the maths. It uses dynamic rendering and synchronization2 from the first triangle, so there are no render pass or framebuffer objects to set up. Every chapter adds to one program, says where each snippet goes, explains every structure field it fills, and ends with the mistakes the validation layers will report.",
      "Vulkan cannot run in a web page, so the interactive figures simulate what the GPU does instead: which objects depend on which, how a std140 block is laid out byte by byte, how a barrier orders two pieces of work. Each lesson is free, in English and Portuguese, with no sign-up.",
    ],
    build: [
      "a window, a swapchain and a first triangle drawn with dynamic rendering",
      "vertex and index buffers uploaded through staging buffers",
      "a camera in a uniform buffer and per-object push constants",
      "textured, depth-tested, mipmapped and multisampled geometry",
      "two frames in flight and a swapchain that survives resizing",
      "a particle simulation in a compute shader",
      "bindless textures, buffer device addresses and timeline semaphores",
    ],
    need: [
      "C++: pointers, structs and std::vector (the C/C++ track covers them)",
      "basic 3D maths: vectors and 4 × 4 matrices (the Math track)",
      "a GPU and driver with Vulkan 1.3, and the Vulkan SDK from LunarG",
      "having drawn something with OpenGL helps, but is not required",
    ],
  },
  pt: {
    title: "Aprenda Vulkan de uma janela vazia até um renderizador moderno",
    paragraphs: [
      "Vulkan é a API explícita de gráficos e compute do Khronos, o grupo por trás do OpenGL. Roda no Windows, Linux e Android, e no macOS e iOS através do MoltenVK. Onde o driver do OpenGL adivinha o que você quer, o Vulkan obriga você a dizer: em que memória um buffer mora, quando uma imagem muda de layout, que trabalho precisa esperar qual. É mais código, e em troca o custo de CPU é baixo e previsível, e as mesmas ideias valem para o Direct3D 12 e o Metal.",
      "Este tutorial usa Vulkan 1.3 em C++20, com a API em C pura, SDL3 para a janela e GLM para a matemática. Ele usa dynamic rendering e synchronization2 desde o primeiro triângulo, então não há render pass nem framebuffer para configurar. Cada capítulo acrescenta algo ao mesmo programa, diz onde cada trecho entra, explica cada campo de struct que preenche e termina com os erros que as validation layers vão apontar.",
      "Vulkan não roda numa página web, então as figuras interativas simulam o que a GPU faz: quais objetos dependem de quais, como um bloco std140 fica disposto byte a byte, como uma barreira ordena dois trabalhos. Cada aula é gratuita, em português e inglês, sem cadastro.",
    ],
    build: [
      "uma janela, uma swapchain e um primeiro triângulo desenhado com dynamic rendering",
      "vertex e index buffers enviados por staging buffers",
      "uma câmera num uniform buffer e push constants por objeto",
      "geometria com textura, teste de profundidade, mipmaps e multisampling",
      "dois quadros em voo e uma swapchain que sobrevive ao redimensionamento",
      "uma simulação de partículas num compute shader",
      "texturas bindless, endereços de buffer e timeline semaphores",
    ],
    need: [
      "C++: ponteiros, structs e std::vector (a trilha de C/C++ cobre isso)",
      "matemática 3D básica: vetores e matrizes 4 × 4 (a trilha de Matemática)",
      "uma GPU e um driver com Vulkan 1.3, e o Vulkan SDK da LunarG",
      "já ter desenhado algo com OpenGL ajuda, mas não é obrigatório",
    ],
  },
};

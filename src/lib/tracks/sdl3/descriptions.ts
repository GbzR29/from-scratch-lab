// src/lib/tracks/sdl3/descriptions.ts
// What search results show under each SDL3 lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const sdl3Descriptions: LessonDescriptions = {
  "whats-new": {
    en: "SDL3 vs SDL2: why SDL3 is not a drop-in upgrade, the changes that break SDL2 code and how to fix them, and what SDL3 adds that SDL2 never had.",
    pt: "SDL3 vs SDL2: por que o SDL3 não é uma troca direta, as mudanças que quebram código SDL2 e como corrigir, e o que o SDL3 traz de novo.",
  },
  setup: {
    en: "Install SDL3 with CMake and FetchContent, open a window that closes properly, initialize only the subsystems you need, and wrap SDL in C++ RAII.",
    pt: "Instale o SDL3 com CMake e FetchContent, abra uma janela que fecha direito, inicialize só os subsistemas necessários e encapsule o SDL com RAII em C++.",
  },
  "main-loop": {
    en: "The SDL3 main loop: why a plain while loop breaks on the web and phones, the four SDL_App callbacks, and a fixed timestep at any frame rate.",
    pt: "O loop principal no SDL3: por que um while simples quebra na web e no celular, os quatro callbacks SDL_App e passo fixo em qualquer frame rate.",
  },
  input: {
    en: "SDL3 events and input: the SDL_Event union, events vs keyboard state, scancodes vs keycodes, mouse modes, gamepads, and text input.",
    pt: "Eventos e input no SDL3: a union SDL_Event, eventos vs estado do teclado, scancodes vs keycodes, modos do mouse, controles e entrada de texto.",
  },
  renderer: {
    en: "The SDL3 2D renderer: clear, draw and present, logical presentation for resolution independence, VSync and frame pacing, and custom geometry.",
    pt: "O renderer 2D do SDL3: clear, draw e present, apresentação lógica independente da resolução, VSync e ritmo de quadros, e geometria própria.",
  },
  textures: {
    en: "SDL3 textures step by step: surface vs texture, loading a PNG with SDL_LoadPNG, sprite sheets with src/dst rects, animation and flip, pixel-art scale modes, pitch.",
    pt: "Texturas no SDL3 passo a passo: surface vs texture, carregar PNG com SDL_LoadPNG, sprite sheet com src/dst, animação e flip, modos de escala para pixel art, pitch.",
  },
  text: {
    en: "Draw text with SDL3_ttf: string to texture, rendering modes for crisp or fast text, the text engine for changing text, and measuring for layout.",
    pt: "Texto com SDL3_ttf: de string para textura, modos de renderização para texto nítido ou rápido, o text engine para texto que muda e medir para layout.",
  },
  audio: {
    en: "SDL3 audio streams: devices and logical devices, automatic format conversion, generating sound in a callback, and mixing several sounds.",
    pt: "Áudio no SDL3 com audio streams: dispositivos e dispositivos lógicos, conversão automática de formato, gerar som num callback e mixar vários sons.",
  },
  gpu: {
    en: "SDL_GPU, SDL3's modern graphics API: where it sits next to OpenGL and Vulkan, one set of shaders on Vulkan, D3D12 and Metal, devices and uploads.",
    pt: "SDL_GPU, a API gráfica moderna do SDL3: onde fica perto de OpenGL e Vulkan, os mesmos shaders em Vulkan, D3D12 e Metal, device e envio de dados.",
  },
  platform: {
    en: "SDL3 time, files and shipping: clocks and timers, save files in the right folder on every platform, threads, hints and logging, and release builds.",
    pt: "Tempo, arquivos e distribuição no SDL3: relógios e timers, saves na pasta certa em cada plataforma, threads, hints e logs, e builds para lançar.",
  },
};

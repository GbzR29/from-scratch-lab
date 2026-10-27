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
    en: "SDL3 keyboard input, step by step: events vs SDL_GetKeyboardState, key repeat, scancode vs keycode (AZERTY, Dvorak), WASD movement with diagonals, mouse, gamepad dead zone, text input.",
    pt: "Teclado no SDL3, passo a passo: eventos vs SDL_GetKeyboardState, repetição de teclas, scancode vs keycode (AZERTY, Dvorak), movimento WASD com diagonais, mouse, zona morta do gamepad, texto.",
  },
  renderer: {
    en: "The SDL3 2D renderer: drawing shapes, SDL_SetRenderLogicalPresentation modes (letterbox, integer scale) with the scale math, mouse to game coordinates, blend modes, VSync, geometry.",
    pt: "O renderer 2D do SDL3: formas, os modos do SDL_SetRenderLogicalPresentation (letterbox, escala inteira) com a conta da escala, mouse em coordenadas do jogo, modos de blend, VSync, geometria.",
  },
  textures: {
    en: "SDL3 textures step by step: surface vs texture, loading a PNG with SDL_LoadPNG, sprite sheets with src/dst rects, animation and flip, pixel-art scale modes, pitch.",
    pt: "Texturas no SDL3 passo a passo: surface vs texture, carregar PNG com SDL_LoadPNG, sprite sheet com src/dst, animação e flip, modos de escala para pixel art, pitch.",
  },
  text: {
    en: "SDL3_ttf step by step: CMake FetchContent, points vs pixels, glyph metrics (ascent, descent, advance) worked out, a sharp pixel font, the text engine atlas, a score and FPS counter.",
    pt: "SDL3_ttf passo a passo: FetchContent no CMake, pontos vs pixels, métricas de glifo (ascent, descent, avanço) calculadas, fonte de pixel nítida, o atlas do text engine, placar e contador de FPS.",
  },
  audio: {
    en: "SDL3 audio step by step: samples and bytes worked out, SDL_LoadWAV and audio streams, format conversion and resampling, two streams mixed with gains and clipping, music from a callback.",
    pt: "Áudio no SDL3 passo a passo: amostras e bytes calculados, SDL_LoadWAV e audio streams, conversão de formato e reamostragem, dois streams mixados com ganho e clipping, música por callback.",
  },
  gpu: {
    en: "SDL_GPU hello triangle, complete: CMake with glslc shaders, device, pipeline and vertex layout, transfer-buffer upload, recording and submitting a frame, cycling, and 3.4 render states.",
    pt: "Triângulo com SDL_GPU, completo: CMake com shaders pelo glslc, device, pipeline e layout de vértices, envio por transfer buffer, gravar e enviar um quadro, cycling e render states da 3.4.",
  },
  platform: {
    en: "SDL3 time, files and shipping: clocks and timers, save files in the right folder on every platform, threads, hints and logging, and release builds.",
    pt: "Tempo, arquivos e distribuição no SDL3: relógios e timers, saves na pasta certa em cada plataforma, threads, hints e logs, e builds para lançar.",
  },
};

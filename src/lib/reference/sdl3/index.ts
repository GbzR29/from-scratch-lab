// src/lib/reference/sdl3/index.ts
// SDL3 function reference. One file per category; the category order here is display order.

import type { Reference } from "../types";
import { initEntries } from "./init";
import { logTimeEntries } from "./logTime";
import { videoEntries } from "./video";
import { eventEntries } from "./events";
import { gamepadEntries } from "./gamepad";
import { renderEntries } from "./render";
import { drawEntries } from "./draw";
import { textureEntries } from "./textures";
import { audioEntries } from "./audio";
import { platformEntries } from "./platform";
import { gpuEntries } from "./gpu";
import { gpuDataEntries } from "./gpuData";

export const sdl3Reference: Reference = {
  trackPath: "SDL3",
  title: "SDL 3.2",
  tokenPattern: /\bSDL_[A-Za-z][A-Za-z0-9_]*\b/g,
  categories: [
    { id: "init",      title: { en: "Init, errors & main callbacks", pt: "Inicialização, erros e callbacks" } },
    { id: "log-time",  title: { en: "Logging & time",                pt: "Log e tempo" } },
    { id: "video",     title: { en: "Windows & displays",            pt: "Janelas e monitores" } },
    { id: "events",    title: { en: "Events, keyboard & mouse",      pt: "Eventos, teclado e mouse" } },
    { id: "gamepad",   title: { en: "Gamepads",                      pt: "Controles" } },
    { id: "render",    title: { en: "2D renderer",                   pt: "Renderer 2D" } },
    { id: "draw",      title: { en: "Drawing shapes",                pt: "Desenhando formas" } },
    { id: "textures",  title: { en: "Textures & surfaces",           pt: "Texturas e surfaces" } },
    { id: "audio",     title: { en: "Audio",                         pt: "Áudio" } },
    { id: "files",     title: { en: "Files & storage",               pt: "Arquivos e storage" } },
    { id: "gl-vulkan", title: { en: "OpenGL & Vulkan windows",       pt: "Janelas OpenGL e Vulkan" } },
    { id: "gpu",       title: { en: "GPU: device & frame",           pt: "GPU: device e quadro" } },
    { id: "gpu-data",  title: { en: "GPU: shaders, pipelines & buffers", pt: "GPU: shaders, pipelines e buffers" } },
  ],
  entries: [
    ...initEntries,
    ...logTimeEntries,
    ...videoEntries,
    ...eventEntries,
    ...gamepadEntries,
    ...renderEntries,
    ...drawEntries,
    ...textureEntries,
    ...audioEntries,
    ...platformEntries,
    ...gpuEntries,
    ...gpuDataEntries,
  ],
};

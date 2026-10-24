// src/lib/reference/sdl3/draw.ts
// SDL 3.2: drawing with the 2D renderer: colour, clear, shapes, geometry, present.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const drawEntries: RefEntry[] = [
  {
    name: "SDL_SetRenderDrawColor",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_SetRenderDrawColor(SDL_Renderer *renderer, Uint8 r, Uint8 g, Uint8 b, Uint8 a);",
    summary: {
      en: "Chooses the colour for the next clear, rectangle, line or point.",
      pt: "Escolhe a cor do próximo clear, retângulo, linha ou ponto.",
    },
    description: {
      en: "The renderer remembers one current colour. SDL_RenderClear, SDL_RenderFillRect, SDL_RenderRect, SDL_RenderLine and SDL_RenderPoint all use it. Set it right before each thing you draw, because the last value stays.\n\nValues go from 0 to 255. Alpha (a) only has an effect once blending is on (SDL_SetRenderDrawBlendMode with SDL_BLENDMODE_BLEND). SDL_SetRenderDrawColorFloat takes 0–1 floats instead.",
      pt: "O renderer guarda uma cor atual. SDL_RenderClear, SDL_RenderFillRect, SDL_RenderRect, SDL_RenderLine e SDL_RenderPoint usam essa cor. Defina logo antes de cada coisa que desenhar, porque o último valor continua valendo.\n\nOs valores vão de 0 a 255. O alfa (a) só tem efeito com o blending ligado (SDL_SetRenderDrawBlendMode com SDL_BLENDMODE_BLEND). SDL_SetRenderDrawColorFloat recebe floats de 0 a 1.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "r", type: "Uint8", desc: { en: "Red, 0–255.", pt: "Vermelho, 0–255." } },
      { name: "g", type: "Uint8", desc: { en: "Green, 0–255.", pt: "Verde, 0–255." } },
      { name: "b", type: "Uint8", desc: { en: "Blue, 0–255.", pt: "Azul, 0–255." } },
      { name: "a", type: "Uint8", desc: { en: "Alpha (opacity), 0–255. 255 is opaque.", pt: "Alfa (opacidade), 0–255. 255 é opaco." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetRenderDrawColor(renderer, 16, 18, 26, 255);    // background
SDL_RenderClear(renderer);
SDL_SetRenderDrawColor(renderer, 59, 130, 246, 255);   // blue box
SDL_RenderFillRect(renderer, &box);`,
    related: ["SDL_RenderClear", "SDL_RenderFillRect", "SDL_SetRenderDrawBlendMode"],
    khronos: `${WIKI}SDL_SetRenderDrawColor`,
  },
  {
    name: "SDL_SetRenderDrawBlendMode",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_SetRenderDrawBlendMode(SDL_Renderer *renderer, SDL_BlendMode blendMode);",
    summary: {
      en: "Chooses how shapes drawn with the draw colour mix with what is already there (e.g. transparency).",
      pt: "Escolhe como as formas desenhadas com a cor atual se misturam com o que já está lá (ex.: transparência).",
    },
    description: {
      en: "The default for shapes is SDL_BLENDMODE_NONE: the colour simply replaces the pixels, and alpha is ignored. Switch to SDL_BLENDMODE_BLEND for see-through overlays such as a dark half-transparent box behind a menu.\n\nThis only affects rectangles, lines, points and clears. Textures have their own setting, SDL_SetTextureBlendMode.",
      pt: "O padrão para formas é SDL_BLENDMODE_NONE: a cor simplesmente substitui os pixels, e o alfa é ignorado. Troque para SDL_BLENDMODE_BLEND para sobreposições translúcidas, como uma caixa escura meio transparente atrás de um menu.\n\nIsso só afeta retângulos, linhas, pontos e clears. As texturas têm a própria configuração, SDL_SetTextureBlendMode.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      {
        name: "blendMode",
        type: "SDL_BlendMode",
        desc: { en: "The mixing rule.", pt: "A regra de mistura." },
        values: [
          { name: "SDL_BLENDMODE_NONE", desc: { en: "Replace: dst = src. Default.", pt: "Substitui: dst = src. Padrão." } },
          { name: "SDL_BLENDMODE_BLEND", desc: { en: "Transparency: dst = src·a + dst·(1 − a).", pt: "Transparência: dst = src·a + dst·(1 − a)." } },
          { name: "SDL_BLENDMODE_ADD", desc: { en: "Glow: dst = src·a + dst. Light only gets brighter.", pt: "Brilho: dst = src·a + dst. A luz só fica mais forte." } },
          { name: "SDL_BLENDMODE_MOD", desc: { en: "Tint/darken: dst = src · dst.", pt: "Tingir/escurecer: dst = src · dst." } },
          { name: "SDL_BLENDMODE_BLEND_PREMULTIPLIED", desc: { en: "For colours already multiplied by alpha: dst = src + dst·(1 − a).", pt: "Para cores já multiplicadas pelo alfa: dst = src + dst·(1 − a)." } },
        ],
      },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
SDL_SetRenderDrawColor(renderer, 0, 0, 0, 160);      // 63% black
SDL_RenderFillRect(renderer, nullptr);               // dim the whole screen
drawPauseMenu(renderer);`,
    related: ["SDL_SetRenderDrawColor", "SDL_SetTextureBlendMode"],
    khronos: `${WIKI}SDL_SetRenderDrawBlendMode`,
  },
  {
    name: "SDL_RenderClear",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderClear(SDL_Renderer *renderer);",
    summary: {
      en: "Fills the whole render target with the current draw colour. The first draw call of every frame.",
      pt: "Preenche o alvo de render inteiro com a cor atual. A primeira chamada de desenho de todo quadro.",
    },
    description: {
      en: "After SDL_RenderPresent the back buffer's contents are undefined, so every frame starts with a clear. It covers the entire target, ignoring the viewport and the clip rectangle.",
      pt: "Depois de SDL_RenderPresent o conteúdo do back buffer é indefinido, então todo quadro começa com um clear. Ele cobre o alvo inteiro, ignorando o viewport e o retângulo de recorte.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetRenderDrawColor(renderer, 16, 18, 26, 255);
SDL_RenderClear(renderer);
drawWorld(renderer);
SDL_RenderPresent(renderer);`,
    related: ["SDL_SetRenderDrawColor", "SDL_RenderPresent"],
    khronos: `${WIKI}SDL_RenderClear`,
  },
  {
    name: "SDL_RenderPresent",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderPresent(SDL_Renderer *renderer);",
    summary: {
      en: "Shows the finished frame on screen. Nothing you drew is visible before this call.",
      pt: "Mostra o quadro pronto na tela. Nada do que você desenhou aparece antes desta chamada.",
    },
    description: {
      en: "All drawing goes to a hidden back buffer. Present swaps it onto the screen in one go, so the viewer never sees a half-drawn frame. With vsync on (SDL_SetRenderVSync) it waits for the monitor's refresh.\n\nAfterwards treat the back buffer as garbage: clear it before drawing the next frame, never draw \"on top of last frame\".",
      pt: "Todo desenho vai para um back buffer escondido. O present o leva para a tela de uma vez, e quem olha nunca vê um quadro pela metade. Com o vsync ligado (SDL_SetRenderVSync) ele espera a atualização do monitor.\n\nDepois disso trate o back buffer como lixo: limpe antes de desenhar o próximo quadro, nunca desenhe \"por cima do quadro anterior\".",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    notes: [
      { en: "Call it with the window as the target (SDL_SetRenderTarget(renderer, NULL)), not while drawing into a texture.", pt: "Chame com a janela como alvo (SDL_SetRenderTarget(renderer, NULL)), não enquanto desenha numa textura." },
    ],
    example: `SDL_RenderClear(renderer);
drawEverything(renderer);
SDL_RenderPresent(renderer);   // one per frame`,
    related: ["SDL_RenderClear", "SDL_SetRenderVSync"],
    khronos: `${WIKI}SDL_RenderPresent`,
  },
  {
    name: "SDL_RenderFillRect",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderFillRect(SDL_Renderer *renderer, const SDL_FRect *rect);",
    summary: {
      en: "Draws a filled rectangle in the current draw colour.",
      pt: "Desenha um retângulo cheio na cor atual.",
    },
    description: {
      en: "SDL_FRect is `{x, y, w, h}` in floats: the top-left corner, then width and height. y grows downwards. In SDL3 every drawing function takes floats, so positions can move smoothly by fractions of a pixel.",
      pt: "SDL_FRect é `{x, y, w, h}` em floats: o canto superior esquerdo, depois largura e altura. O y cresce para baixo. No SDL3 toda função de desenho recebe floats, então as posições podem se mover suavemente por frações de pixel.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "rect", type: "const SDL_FRect *", desc: { en: "The rectangle, or NULL to fill the whole target.", pt: "O retângulo, ou NULL para preencher o alvo inteiro." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_FRect paddle{player.x, 680.0f, 120.0f, 16.0f};
SDL_SetRenderDrawColor(renderer, 240, 240, 240, 255);
SDL_RenderFillRect(renderer, &paddle);`,
    related: ["SDL_RenderRect", "SDL_SetRenderDrawColor"],
    khronos: `${WIKI}SDL_RenderFillRect`,
  },
  {
    name: "SDL_RenderRect",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderRect(SDL_Renderer *renderer, const SDL_FRect *rect);",
    summary: {
      en: "Draws only the outline of a rectangle, one pixel thick.",
      pt: "Desenha só o contorno de um retângulo, com um pixel de espessura.",
    },
    description: {
      en: "Handy for debugging: draw every collision box as an outline on top of the sprites to see what the physics sees.",
      pt: "Útil para depurar: desenhe cada caixa de colisão como contorno por cima dos sprites para ver o que a física vê.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "rect", type: "const SDL_FRect *", desc: { en: "The rectangle, or NULL for the whole target's border.", pt: "O retângulo, ou NULL para a borda do alvo inteiro." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetRenderDrawColor(renderer, 255, 0, 255, 255);
for (const Body& b : bodies) SDL_RenderRect(renderer, &b.box);`,
    related: ["SDL_RenderFillRect"],
    khronos: `${WIKI}SDL_RenderRect`,
  },
  {
    name: "SDL_RenderLine",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderLine(SDL_Renderer *renderer, float x1, float y1, float x2, float y2);",
    summary: {
      en: "Draws a one-pixel line between two points.",
      pt: "Desenha uma linha de um pixel entre dois pontos.",
    },
    description: {
      en: "Coordinates are floats, so the line can start and end between pixels. For many connected lines (a graph, a path) SDL_RenderLines takes an array of points and is faster than a loop of single calls. Lines are always 1 pixel wide; for thick lines draw a quad with SDL_RenderGeometry.",
      pt: "As coordenadas são floats, então a linha pode começar e terminar entre pixels. Para muitas linhas ligadas (um gráfico, um caminho) SDL_RenderLines recebe um array de pontos e é mais rápida que um laço de chamadas avulsas. As linhas sempre têm 1 pixel; para linhas grossas desenhe um quadrilátero com SDL_RenderGeometry.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "x1", type: "float", desc: { en: "Start x.", pt: "x inicial." } },
      { name: "y1", type: "float", desc: { en: "Start y.", pt: "y inicial." } },
      { name: "x2", type: "float", desc: { en: "End x.", pt: "x final." } },
      { name: "y2", type: "float", desc: { en: "End y.", pt: "y final." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_RenderLine(renderer, 0.0f, 0.0f, 1280.0f, 720.0f);   // corner to corner`,
    related: ["SDL_RenderPoint", "SDL_RenderGeometry"],
    khronos: `${WIKI}SDL_RenderLine`,
  },
  {
    name: "SDL_RenderPoint",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderPoint(SDL_Renderer *renderer, float x, float y);",
    summary: {
      en: "Draws a single pixel in the current draw colour.",
      pt: "Desenha um único pixel na cor atual.",
    },
    description: {
      en: "Fine for a few dots (stars, particles). For thousands, SDL_RenderPoints takes an array in one call; for a full image computed per pixel, write into a streaming texture with SDL_LockTexture instead.",
      pt: "Serve para alguns pontos (estrelas, partículas). Para milhares, SDL_RenderPoints recebe um array numa chamada; para uma imagem inteira calculada pixel a pixel, escreva numa textura streaming com SDL_LockTexture.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "x", type: "float", desc: { en: "x of the pixel.", pt: "x do pixel." } },
      { name: "y", type: "float", desc: { en: "y of the pixel.", pt: "y do pixel." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
for (const Star& s : stars) SDL_RenderPoint(renderer, s.x, s.y);`,
    related: ["SDL_RenderLine", "SDL_LockTexture"],
    khronos: `${WIKI}SDL_RenderPoint`,
  },
  {
    name: "SDL_RenderGeometry",
    category: "draw",
    since: "SDL 3.2",
    signature: "bool SDL_RenderGeometry(SDL_Renderer *renderer, SDL_Texture *texture, const SDL_Vertex *vertices, int num_vertices, const int *indices, int num_indices);",
    summary: {
      en: "Draws triangles from your own vertices, each with a position, a colour and texture coordinates.",
      pt: "Desenha triângulos a partir dos seus próprios vértices, cada um com posição, cor e coordenadas de textura.",
    },
    description: {
      en: "The renderer's escape hatch for shapes it has no function for: gradients, rotated quads, thick lines, circles, deformed sprites. Every three vertices (or every three indices) make one triangle, and colours are interpolated across it.\n\nSDL_Vertex has `position` (SDL_FPoint), `color` (SDL_FColor, floats 0–1 in SDL3) and `tex_coord` (SDL_FPoint, 0–1 across the texture).",
      pt: "A saída de emergência do renderer para formas que ele não tem função: gradientes, quadriláteros girados, linhas grossas, círculos, sprites deformados. Cada três vértices (ou cada três índices) formam um triângulo, e as cores são interpoladas nele.\n\nSDL_Vertex tem `position` (SDL_FPoint), `color` (SDL_FColor, floats 0–1 no SDL3) e `tex_coord` (SDL_FPoint, 0–1 sobre a textura).",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "texture", type: "SDL_Texture *", desc: { en: "Texture to sample with tex_coord, or NULL for colour only.", pt: "Textura amostrada com tex_coord, ou NULL só para cor." } },
      { name: "vertices", type: "const SDL_Vertex *", desc: { en: "The vertex array.", pt: "O array de vértices." } },
      { name: "num_vertices", type: "int", desc: { en: "How many vertices.", pt: "Quantos vértices." } },
      { name: "indices", type: "const int *", desc: { en: "Optional index array (reuse vertices between triangles), or NULL.", pt: "Array de índices opcional (reaproveita vértices entre triângulos), ou NULL." } },
      { name: "num_indices", type: "int", desc: { en: "How many indices (a multiple of 3), or 0.", pt: "Quantos índices (múltiplo de 3), ou 0." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_Vertex verts[3] = {
    {{640, 100}, {1, 0, 0, 1}, {0, 0}},   // red top
    {{340, 600}, {0, 1, 0, 1}, {0, 0}},   // green left
    {{940, 600}, {0, 0, 1, 1}, {0, 0}},   // blue right
};
SDL_RenderGeometry(renderer, nullptr, verts, 3, nullptr, 0);`,
    related: ["SDL_RenderTexture", "SDL_RenderLine"],
    khronos: `${WIKI}SDL_RenderGeometry`,
  },
];

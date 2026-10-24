// src/lib/reference/sdl3/textures.ts
// SDL 3.2: textures and surfaces for the 2D renderer: create, draw, tint, filter, stream.
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const textureEntries: RefEntry[] = [
  {
    name: "SDL_CreateTextureFromSurface",
    category: "textures",
    since: "SDL 3.2",
    signature: "SDL_Texture * SDL_CreateTextureFromSurface(SDL_Renderer *renderer, SDL_Surface *surface);",
    summary: {
      en: "Copies an image from CPU memory (a surface) into a texture the renderer can draw.",
      pt: "Copia uma imagem da memória da CPU (uma surface) para uma textura que o renderer consegue desenhar.",
    },
    description: {
      en: "Two kinds of image live in SDL. An SDL_Surface is pixels in ordinary RAM: image loaders (SDL_LoadBMP, IMG_Load from SDL3_image) and text renderers (TTF_RenderText_Blended) give you one. An SDL_Texture is pixels on the GPU, which is what the renderer draws fast.\n\nThis call uploads the surface. The surface is not changed or freed: once you have the texture, destroy the surface with SDL_DestroySurface.",
      pt: "Dois tipos de imagem vivem no SDL. Uma SDL_Surface é pixels na RAM comum: carregadores de imagem (SDL_LoadBMP, IMG_Load do SDL3_image) e renderizadores de texto (TTF_RenderText_Blended) te dão uma. Uma SDL_Texture é pixels na GPU, que é o que o renderer desenha rápido.\n\nEsta chamada envia a surface. A surface não é alterada nem liberada: depois de ter a textura, destrua a surface com SDL_DestroySurface.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer that will own the texture.", pt: "O renderer que será dono da textura." } },
      { name: "surface", type: "SDL_Surface *", desc: { en: "The image to copy.", pt: "A imagem a copiar." } },
    ],
    returns: { en: "A static texture, or NULL on failure.", pt: "Uma textura estática, ou NULL se falhar." },
    example: `SDL_Surface* surface = IMG_Load("assets/player.png");
if (!surface) { SDL_Log("IMG_Load: %s", SDL_GetError()); return; }
SDL_Texture* player = SDL_CreateTextureFromSurface(renderer, surface);
SDL_DestroySurface(surface);    // the GPU has its own copy now`,
    related: ["SDL_DestroySurface", "SDL_CreateTexture", "SDL_RenderTexture"],
    khronos: `${WIKI}SDL_CreateTextureFromSurface`,
  },
  {
    name: "SDL_CreateTexture",
    category: "textures",
    since: "SDL 3.2",
    signature: "SDL_Texture * SDL_CreateTexture(SDL_Renderer *renderer, SDL_PixelFormat format, SDL_TextureAccess access, int w, int h);",
    summary: {
      en: "Creates an empty texture: to draw into (target) or to fill with your own pixels every frame (streaming).",
      pt: "Cria uma textura vazia: para desenhar nela (target) ou para preencher com os seus pixels todo quadro (streaming).",
    },
    description: {
      en: "The access mode decides what you can do with it. STATIC is for images that never change (that is what SDL_CreateTextureFromSurface makes). STREAMING lets you write pixels from the CPU with SDL_LockTexture: emulators, video, software renderers. TARGET lets the renderer draw into it with SDL_SetRenderTarget: minimaps, low-resolution game screens, cached backgrounds.",
      pt: "O modo de acesso decide o que dá para fazer com ela. STATIC é para imagens que nunca mudam (é o que SDL_CreateTextureFromSurface cria). STREAMING deixa você escrever pixels pela CPU com SDL_LockTexture: emuladores, vídeo, renderizadores por software. TARGET deixa o renderer desenhar nela com SDL_SetRenderTarget: minimapas, telas de jogo em baixa resolução, fundos em cache.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer that will own the texture.", pt: "O renderer que será dono da textura." } },
      {
        name: "format",
        type: "SDL_PixelFormat",
        desc: { en: "The pixel layout.", pt: "O layout dos pixels." },
        values: [
          { name: "SDL_PIXELFORMAT_RGBA32", desc: { en: "Bytes R, G, B, A in memory order on any machine. Easiest to fill by hand.", pt: "Bytes R, G, B, A na ordem da memória em qualquer máquina. O mais fácil de preencher à mão." } },
          { name: "SDL_PIXELFORMAT_RGBA8888 / ARGB8888", desc: { en: "One Uint32 per pixel, channels packed from the high bits down.", pt: "Um Uint32 por pixel, canais empacotados dos bits altos para baixo." } },
        ],
      },
      {
        name: "access",
        type: "SDL_TextureAccess",
        desc: { en: "How the texture will be used.", pt: "Como a textura será usada." },
        values: [
          { name: "SDL_TEXTUREACCESS_STATIC", desc: { en: "Rarely changes (SDL_UpdateTexture to change it).", pt: "Muda raramente (SDL_UpdateTexture para mudar)." } },
          { name: "SDL_TEXTUREACCESS_STREAMING", desc: { en: "Rewritten often with SDL_LockTexture.", pt: "Reescrita com frequência com SDL_LockTexture." } },
          { name: "SDL_TEXTUREACCESS_TARGET", desc: { en: "Can be a render target.", pt: "Pode ser alvo de render." } },
        ],
      },
      { name: "w", type: "int", desc: { en: "Width in pixels.", pt: "Largura em pixels." } },
      { name: "h", type: "int", desc: { en: "Height in pixels.", pt: "Altura em pixels." } },
    ],
    returns: { en: "The texture, or NULL on failure.", pt: "A textura, ou NULL se falhar." },
    example: `SDL_Texture* screen = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_RGBA32,
                                       SDL_TEXTUREACCESS_STREAMING, 320, 240);
SDL_SetTextureScaleMode(screen, SDL_SCALEMODE_NEAREST);`,
    related: ["SDL_LockTexture", "SDL_SetRenderTarget", "SDL_CreateTextureFromSurface", "SDL_DestroyTexture"],
    khronos: `${WIKI}SDL_CreateTexture`,
  },
  {
    name: "SDL_DestroyTexture",
    category: "textures",
    since: "SDL 3.2",
    signature: "void SDL_DestroyTexture(SDL_Texture *texture);",
    summary: {
      en: "Frees a texture's GPU memory.",
      pt: "Libera a memória de GPU de uma textura.",
    },
    description: {
      en: "Destroy textures you no longer need, e.g. when a level ends. Destroying the renderer destroys all of its textures too, so do not destroy a texture after its renderer is gone.",
      pt: "Destrua as texturas que não precisa mais, ex.: quando uma fase termina. Destruir o renderer destrói todas as texturas dele também, então não destrua uma textura depois que o renderer dela já se foi.",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture to free.", pt: "A textura a liberar." } },
    ],
    example: `SDL_DestroyTexture(levelBackground);
levelBackground = nullptr;`,
    related: ["SDL_CreateTexture", "SDL_DestroyRenderer"],
    khronos: `${WIKI}SDL_DestroyTexture`,
  },
  {
    name: "SDL_DestroySurface",
    category: "textures",
    since: "SDL 3.2",
    signature: "void SDL_DestroySurface(SDL_Surface *surface);",
    summary: {
      en: "Frees a surface (an image in CPU memory). SDL2 called it SDL_FreeSurface.",
      pt: "Libera uma surface (uma imagem na memória da CPU). O SDL2 chamava de SDL_FreeSurface.",
    },
    description: {
      en: "Surfaces are usually temporary: load, turn into a texture, destroy. Keep one only if you need to read its pixels on the CPU later (for example for pixel-perfect collision).",
      pt: "Surfaces costumam ser temporárias: carrega, vira textura, destrói. Guarde uma só se precisar ler os pixels dela na CPU depois (por exemplo para colisão por pixel).",
    },
    params: [
      { name: "surface", type: "SDL_Surface *", desc: { en: "The surface to free. NULL is allowed.", pt: "A surface a liberar. NULL é aceito." } },
    ],
    example: `SDL_Surface* text = TTF_RenderText_Blended(font, "Score: 120", 0, white);
SDL_Texture* label = SDL_CreateTextureFromSurface(renderer, text);
SDL_DestroySurface(text);`,
    related: ["SDL_CreateTextureFromSurface"],
    khronos: `${WIKI}SDL_DestroySurface`,
  },
  {
    name: "SDL_RenderTexture",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_RenderTexture(SDL_Renderer *renderer, SDL_Texture *texture, const SDL_FRect *srcrect, const SDL_FRect *dstrect);",
    summary: {
      en: "Draws a texture, or part of it, into a rectangle on screen. The sprite-drawing call (SDL_RenderCopy in SDL2).",
      pt: "Desenha uma textura, ou parte dela, num retângulo da tela. A chamada de desenhar sprites (SDL_RenderCopy no SDL2).",
    },
    description: {
      en: "`srcrect` picks which part of the texture to use: NULL for all of it, or one frame of a sprite sheet. `dstrect` says where it goes and how big: NULL stretches over the whole target. If the sizes differ, the image is scaled using the texture's scale mode.",
      pt: "`srcrect` escolhe qual parte da textura usar: NULL para ela toda, ou um quadro de uma sprite sheet. `dstrect` diz onde ela vai e em que tamanho: NULL estica sobre o alvo inteiro. Se os tamanhos forem diferentes, a imagem é escalada usando o modo de escala da textura.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture to draw (created by this renderer).", pt: "A textura a desenhar (criada por este renderer)." } },
      { name: "srcrect", type: "const SDL_FRect *", desc: { en: "Part of the texture in texture pixels, or NULL for all.", pt: "Parte da textura em pixels da textura, ou NULL para toda." } },
      { name: "dstrect", type: "const SDL_FRect *", desc: { en: "Where to draw, or NULL for the whole target.", pt: "Onde desenhar, ou NULL para o alvo inteiro." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `// frame 3 of a sheet of 32x32 frames in one row
SDL_FRect src{3 * 32.0f, 0.0f, 32.0f, 32.0f};
SDL_FRect dst{player.x, player.y, 64.0f, 64.0f};   // drawn at 2x
SDL_RenderTexture(renderer, sheet, &src, &dst);`,
    related: ["SDL_RenderTextureRotated", "SDL_SetTextureScaleMode", "SDL_CreateTextureFromSurface"],
    khronos: `${WIKI}SDL_RenderTexture`,
  },
  {
    name: "SDL_RenderTextureRotated",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_RenderTextureRotated(SDL_Renderer *renderer, SDL_Texture *texture, const SDL_FRect *srcrect, const SDL_FRect *dstrect, double angle, const SDL_FPoint *center, SDL_FlipMode flip);",
    summary: {
      en: "Like SDL_RenderTexture, plus rotation around a point and horizontal/vertical mirroring.",
      pt: "Como SDL_RenderTexture, mais rotação em torno de um ponto e espelhamento horizontal/vertical.",
    },
    description: {
      en: "The angle is in DEGREES, clockwise on screen (because y points down). The center is relative to dstrect's top-left corner; NULL rotates around the middle of dstrect.\n\nFlipping is how one sprite facing right also walks left: draw it with SDL_FLIP_HORIZONTAL.",
      pt: "O ângulo é em GRAUS, no sentido horário na tela (porque o y aponta para baixo). O centro é relativo ao canto superior esquerdo de dstrect; NULL gira em torno do meio de dstrect.\n\nEspelhar é como um sprite virado para a direita também anda para a esquerda: desenhe com SDL_FLIP_HORIZONTAL.",
    },
    params: [
      { name: "renderer", type: "SDL_Renderer *", desc: { en: "The renderer.", pt: "O renderer." } },
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture to draw.", pt: "A textura a desenhar." } },
      { name: "srcrect", type: "const SDL_FRect *", desc: { en: "Part of the texture, or NULL.", pt: "Parte da textura, ou NULL." } },
      { name: "dstrect", type: "const SDL_FRect *", desc: { en: "Where to draw, or NULL.", pt: "Onde desenhar, ou NULL." } },
      { name: "angle", type: "double", desc: { en: "Rotation in degrees, clockwise.", pt: "Rotação em graus, sentido horário." } },
      { name: "center", type: "const SDL_FPoint *", desc: { en: "Pivot relative to dstrect, or NULL for its center.", pt: "Pivô relativo a dstrect, ou NULL para o centro dele." } },
      {
        name: "flip",
        type: "SDL_FlipMode",
        desc: { en: "Mirroring.", pt: "Espelhamento." },
        values: [
          { name: "SDL_FLIP_NONE", desc: { en: "As is.", pt: "Como está." } },
          { name: "SDL_FLIP_HORIZONTAL", desc: { en: "Mirror left-right.", pt: "Espelha esquerda-direita." } },
          { name: "SDL_FLIP_VERTICAL", desc: { en: "Mirror top-bottom.", pt: "Espelha cima-baixo." } },
        ],
      },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `double degrees = ship.angleRadians * 180.0 / SDL_PI_D;
SDL_RenderTextureRotated(renderer, shipTex, nullptr, &ship.rect, degrees, nullptr,
                         ship.facingLeft ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);`,
    related: ["SDL_RenderTexture"],
    khronos: `${WIKI}SDL_RenderTextureRotated`,
  },
  {
    name: "SDL_SetTextureColorMod",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_SetTextureColorMod(SDL_Texture *texture, Uint8 r, Uint8 g, Uint8 b);",
    summary: {
      en: "Tints a texture: every pixel's colour is multiplied by (r, g, b) / 255 when drawn.",
      pt: "Tinge uma textura: a cor de cada pixel é multiplicada por (r, g, b) / 255 ao desenhar.",
    },
    description: {
      en: "The formula is `srcC = srcC · (color / 255)` for each channel. White (255, 255, 255) leaves the texture unchanged; (255, 128, 128) keeps red and halves green and blue, a red flash for \"took damage\". The texture's pixels are not changed: it is applied at draw time, so you can change it every frame.",
      pt: "A fórmula é `srcC = srcC · (cor / 255)` em cada canal. Branco (255, 255, 255) deixa a textura igual; (255, 128, 128) mantém o vermelho e corta pela metade o verde e o azul, um clarão vermelho para \"levou dano\". Os pixels da textura não mudam: é aplicado na hora de desenhar, então dá para mudar a cada quadro.",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture.", pt: "A textura." } },
      { name: "r", type: "Uint8", desc: { en: "Red multiplier, 0–255.", pt: "Multiplicador do vermelho, 0–255." } },
      { name: "g", type: "Uint8", desc: { en: "Green multiplier, 0–255.", pt: "Multiplicador do verde, 0–255." } },
      { name: "b", type: "Uint8", desc: { en: "Blue multiplier, 0–255.", pt: "Multiplicador do azul, 0–255." } },
    ],
    returns: { en: "`true` on success; `false` if the renderer cannot do it.", pt: "`true` se deu certo; `false` se o renderer não consegue." },
    example: `if (enemy.hitTimer > 0) SDL_SetTextureColorMod(enemyTex, 255, 128, 128);
else                    SDL_SetTextureColorMod(enemyTex, 255, 255, 255);
SDL_RenderTexture(renderer, enemyTex, nullptr, &enemy.rect);`,
    related: ["SDL_SetTextureAlphaMod", "SDL_SetTextureBlendMode"],
    khronos: `${WIKI}SDL_SetTextureColorMod`,
  },
  {
    name: "SDL_SetTextureAlphaMod",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_SetTextureAlphaMod(SDL_Texture *texture, Uint8 alpha);",
    summary: {
      en: "Makes a whole texture more transparent when drawn: alpha is multiplied by alpha / 255.",
      pt: "Deixa a textura inteira mais transparente ao desenhar: o alfa é multiplicado por alfa / 255.",
    },
    description: {
      en: "Use it for fades: lower it from 255 to 0 over a second and the sprite disappears smoothly. It only shows if the texture's blend mode uses alpha (SDL_BLENDMODE_BLEND).",
      pt: "Use para fades: baixe de 255 até 0 ao longo de um segundo e o sprite some suavemente. Só aparece se o modo de blend da textura usar o alfa (SDL_BLENDMODE_BLEND).",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture.", pt: "A textura." } },
      { name: "alpha", type: "Uint8", desc: { en: "Opacity multiplier, 0 (invisible) to 255 (unchanged).", pt: "Multiplicador de opacidade, 0 (invisível) a 255 (sem mudança)." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `float t = fadeTime / fadeDuration;                  // 0 -> 1
SDL_SetTextureAlphaMod(logo, Uint8(255 * (1.0f - t)));`,
    related: ["SDL_SetTextureColorMod", "SDL_SetTextureBlendMode"],
    khronos: `${WIKI}SDL_SetTextureAlphaMod`,
  },
  {
    name: "SDL_SetTextureBlendMode",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_SetTextureBlendMode(SDL_Texture *texture, SDL_BlendMode blendMode);",
    summary: {
      en: "Chooses how the texture mixes with what is behind it: transparency, additive glow, none…",
      pt: "Escolhe como a textura se mistura com o que está atrás: transparência, brilho aditivo, nenhum…",
    },
    description: {
      en: "SDL_BLENDMODE_BLEND gives normal transparency, so the see-through parts of a PNG show what is behind. SDL_BLENDMODE_ADD adds the colour on top, which suits fire, lasers and light. SDL_BLENDMODE_NONE copies the pixels as they are, ignoring alpha, which is a little faster for opaque backgrounds.\n\nThe modes and their formulas are the same as for SDL_SetRenderDrawBlendMode.",
      pt: "SDL_BLENDMODE_BLEND dá a transparência normal, e as partes transparentes de um PNG mostram o que está atrás. SDL_BLENDMODE_ADD soma a cor por cima, o que serve para fogo, lasers e luz. SDL_BLENDMODE_NONE copia os pixels como estão, ignorando o alfa, o que é um pouco mais rápido para fundos opacos.\n\nOs modos e as fórmulas são os mesmos de SDL_SetRenderDrawBlendMode.",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture.", pt: "A textura." } },
      { name: "blendMode", type: "SDL_BlendMode", desc: { en: "SDL_BLENDMODE_NONE, _BLEND, _ADD, _MOD…", pt: "SDL_BLENDMODE_NONE, _BLEND, _ADD, _MOD…" } },
    ],
    returns: { en: "`true` on success; `false` if the renderer does not support that mode.", pt: "`true` se deu certo; `false` se o renderer não suporta esse modo." },
    example: `SDL_SetTextureBlendMode(sparkTex, SDL_BLENDMODE_ADD);   // overlapping sparks glow`,
    related: ["SDL_SetRenderDrawBlendMode", "SDL_SetTextureAlphaMod"],
    khronos: `${WIKI}SDL_SetTextureBlendMode`,
  },
  {
    name: "SDL_SetTextureScaleMode",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_SetTextureScaleMode(SDL_Texture *texture, SDL_ScaleMode scaleMode);",
    summary: {
      en: "Chooses how a texture is filtered when drawn bigger or smaller: smooth (linear) or sharp pixels (nearest).",
      pt: "Escolhe como a textura é filtrada ao ser desenhada maior ou menor: suave (linear) ou pixels nítidos (nearest).",
    },
    description: {
      en: "The default is SDL_SCALEMODE_LINEAR, which blends neighbouring pixels: good for photos and smooth art, but it blurs pixel art the moment it is drawn at a size other than 1:1. SDL_SCALEMODE_NEAREST picks the closest pixel, so a 16×16 sprite drawn at 64×64 becomes crisp 4×4 blocks.",
      pt: "O padrão é SDL_SCALEMODE_LINEAR, que mistura pixels vizinhos: bom para fotos e arte suave, mas borra pixel art assim que ela é desenhada num tamanho diferente de 1:1. SDL_SCALEMODE_NEAREST pega o pixel mais próximo, e um sprite de 16×16 desenhado em 64×64 vira blocos nítidos de 4×4.",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "The texture.", pt: "A textura." } },
      {
        name: "scaleMode",
        type: "SDL_ScaleMode",
        desc: { en: "The filter.", pt: "O filtro." },
        values: [
          { name: "SDL_SCALEMODE_NEAREST", desc: { en: "Sharp, blocky. For pixel art.", pt: "Nítido, em blocos. Para pixel art." } },
          { name: "SDL_SCALEMODE_LINEAR", desc: { en: "Smooth, blurry when enlarged. Default.", pt: "Suave, borrado quando ampliado. Padrão." } },
        ],
      },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_Texture* tiles = SDL_CreateTextureFromSurface(renderer, surface);
SDL_SetTextureScaleMode(tiles, SDL_SCALEMODE_NEAREST);`,
    related: ["SDL_RenderTexture", "SDL_SetRenderLogicalPresentation"],
    khronos: `${WIKI}SDL_SetTextureScaleMode`,
  },
  {
    name: "SDL_LockTexture",
    category: "textures",
    since: "SDL 3.2",
    signature: "bool SDL_LockTexture(SDL_Texture *texture, const SDL_Rect *rect, void **pixels, int *pitch);",
    summary: {
      en: "Gives you a pointer to write a STREAMING texture's pixels directly from the CPU.",
      pt: "Dá um ponteiro para escrever os pixels de uma textura STREAMING direto pela CPU.",
    },
    description: {
      en: "Lock, write every pixel, unlock: the new image is uploaded on SDL_UnlockTexture. It is write-only: the memory you get may NOT hold the old picture, so fill the whole locked area each time.\n\n`pitch` is the length of one row in BYTES, and it can be larger than width × bytes per pixel (rows may be padded for speed). Step from row to row by pitch, never by width.",
      pt: "Trava, escreve todos os pixels, destrava: a imagem nova é enviada em SDL_UnlockTexture. É só escrita: a memória que você recebe pode NÃO conter a imagem antiga, então preencha a área travada inteira toda vez.\n\n`pitch` é o comprimento de uma linha em BYTES, e pode ser maior que largura × bytes por pixel (as linhas podem ter enchimento por velocidade). Pule de linha em linha pelo pitch, nunca pela largura.",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "A texture created with SDL_TEXTUREACCESS_STREAMING.", pt: "Uma textura criada com SDL_TEXTUREACCESS_STREAMING." } },
      { name: "rect", type: "const SDL_Rect *", desc: { en: "Area to lock (integers), or NULL for the whole texture.", pt: "Área a travar (inteiros), ou NULL para a textura inteira." } },
      { name: "pixels", type: "void **", desc: { en: "Receives the pointer to the first pixel.", pt: "Recebe o ponteiro para o primeiro pixel." } },
      { name: "pitch", type: "int *", desc: { en: "Receives the row length in bytes.", pt: "Recebe o comprimento da linha em bytes." } },
    ],
    returns: { en: "`true` on success; `false` if the texture is not STREAMING.", pt: "`true` se deu certo; `false` se a textura não for STREAMING." },
    example: `void* pixels; int pitch;
if (SDL_LockTexture(screen, nullptr, &pixels, &pitch)) {
    for (int y = 0; y < 240; ++y) {
        Uint8* row = static_cast<Uint8*>(pixels) + y * pitch;   // by pitch!
        for (int x = 0; x < 320; ++x) {
            row[x * 4 + 0] = Uint8(x);     // R  (SDL_PIXELFORMAT_RGBA32)
            row[x * 4 + 1] = Uint8(y);     // G
            row[x * 4 + 2] = 128;          // B
            row[x * 4 + 3] = 255;          // A
        }
    }
    SDL_UnlockTexture(screen);
}`,
    related: ["SDL_UnlockTexture", "SDL_CreateTexture"],
    khronos: `${WIKI}SDL_LockTexture`,
  },
  {
    name: "SDL_UnlockTexture",
    category: "textures",
    since: "SDL 3.2",
    signature: "void SDL_UnlockTexture(SDL_Texture *texture);",
    summary: {
      en: "Finishes writing a locked texture and uploads the new pixels.",
      pt: "Termina a escrita numa textura travada e envia os pixels novos.",
    },
    description: {
      en: "After this call the pointer from SDL_LockTexture is invalid. Lock and unlock once per frame, not once per pixel: each pair is an upload.",
      pt: "Depois desta chamada o ponteiro de SDL_LockTexture fica inválido. Trave e destrave uma vez por quadro, não uma vez por pixel: cada par é um envio.",
    },
    params: [
      { name: "texture", type: "SDL_Texture *", desc: { en: "The locked texture.", pt: "A textura travada." } },
    ],
    example: `SDL_UnlockTexture(screen);
SDL_RenderTexture(renderer, screen, nullptr, nullptr);`,
    related: ["SDL_LockTexture"],
    khronos: `${WIKI}SDL_UnlockTexture`,
  },
];

// src/lib/reference/opengl/framebuffers.ts
import type { RefEntry } from "../types";

const KHR = "https://registry.khronos.org/OpenGL-Refpages/gl4/html/";

const ATTACHMENTS = [
  { name: "GL_COLOR_ATTACHMENT0 … n", desc: { en: "Color outputs. The fragment shader's out variables write here (location 0 → attachment 0).", pt: "Saídas de cor. As variáveis out do fragment shader escrevem aqui (location 0 → attachment 0)." } },
  { name: "GL_DEPTH_ATTACHMENT", desc: { en: "Depth buffer.", pt: "Depth buffer." } },
  { name: "GL_STENCIL_ATTACHMENT", desc: { en: "Stencil buffer.", pt: "Stencil buffer." } },
  { name: "GL_DEPTH_STENCIL_ATTACHMENT", desc: { en: "Combined depth + stencil (e.g. GL_DEPTH24_STENCIL8).", pt: "Profundidade + stencil combinados (ex.: GL_DEPTH24_STENCIL8)." } },
];

export const framebufferEntries: RefEntry[] = [
  {
    name: "glGenFramebuffers",
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glGenFramebuffers(GLsizei n, GLuint *ids);",
    summary: {
      en: "Reserves names for new framebuffer objects (off-screen render targets).",
      pt: "Reserva nomes para novos framebuffer objects (alvos de renderização fora da tela).",
    },
    description: {
      en: "By default you draw into the window's framebuffer (ID 0). A framebuffer object (FBO) lets you draw into textures instead — the basis of post-processing, shadow maps, reflections and deferred shading.\n\nAn FBO owns no memory itself; it is a list of attachments (textures or renderbuffers) that you plug in.",
      pt: "Por padrão você desenha no framebuffer da janela (ID 0). Um framebuffer object (FBO) permite desenhar em texturas — a base de pós-processamento, shadow maps, reflexos e deferred shading.\n\nUm FBO não tem memória própria; ele é uma lista de attachments (texturas ou renderbuffers) que você conecta.",
    },
    params: [
      { name: "n", type: "GLsizei", desc: { en: "How many IDs.", pt: "Quantos IDs." } },
      { name: "ids", type: "GLuint *", desc: { en: "Array receiving the IDs.", pt: "Array que recebe os IDs." } },
    ],
    notes: [
      { en: "An FBO is a container object: it is not shared between contexts, even when textures and buffers are. Create it on the context that draws with it.", pt: "Um FBO é um objeto contêiner: não é compartilhado entre contextos, mesmo quando texturas e buffers são. Crie-o no contexto que desenha com ele." },
      { en: "After attaching, always check glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE. Drawing into an incomplete FBO is a GL_INVALID_FRAMEBUFFER_OPERATION.", pt: "Depois de anexar, sempre verifique glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE. Desenhar num FBO incompleto dá GL_INVALID_FRAMEBUFFER_OPERATION." },
    ],
    errors: [
      { code: "GL_INVALID_VALUE", when: { en: "n is negative.", pt: "n é negativo." } },
    ],
    example: `GLuint fbo;
glGenFramebuffers(1, &fbo);
glBindFramebuffer(GL_FRAMEBUFFER, fbo);`,
    related: ["glBindFramebuffer", "glFramebufferTexture2D", "glCheckFramebufferStatus"],
    khronos: `${KHR}glGenFramebuffers.xhtml`,
  },
  {
    name: "glBindFramebuffer",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "target is not GL_FRAMEBUFFER, GL_DRAW_FRAMEBUFFER or GL_READ_FRAMEBUFFER.", pt: "target não é GL_FRAMEBUFFER, GL_DRAW_FRAMEBUFFER nem GL_READ_FRAMEBUFFER." } },
      { code: "GL_INVALID_OPERATION", when: { en: "framebuffer is not 0 and not a name from glGenFramebuffers or glCreateFramebuffers.", pt: "framebuffer não é 0 nem um nome vindo de glGenFramebuffers ou glCreateFramebuffers." } },
    ],
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glBindFramebuffer(GLenum target, GLuint framebuffer);",
    summary: {
      en: "Selects the framebuffer that draw calls render into (and/or read from).",
      pt: "Seleciona o framebuffer em que os draws renderizam (e/ou de onde leem).",
    },
    description: {
      en: "Everything drawn after this call goes to the bound framebuffer's attachments instead of the screen. Bind 0 to go back to drawing into the window.\n\nA post-processing frame looks like: bind FBO → draw scene → bind 0 → draw a screen quad sampling the FBO's color texture.",
      pt: "Tudo que for desenhado depois desta chamada vai para os attachments do framebuffer ligado em vez da tela. Faça bind do 0 para voltar a desenhar na janela.\n\nUm frame com pós-processamento fica assim: bind do FBO → desenhar a cena → bind do 0 → desenhar um quad de tela amostrando a textura de cor do FBO.",
    },
    params: [
      {
        name: "target", type: "GLenum",
        desc: { en: "Which role to bind for.", pt: "Para qual papel fazer o bind." },
        values: [
          { name: "GL_FRAMEBUFFER", desc: { en: "Both drawing and reading — the usual choice.", pt: "Desenho e leitura — a escolha comum." } },
          { name: "GL_DRAW_FRAMEBUFFER", desc: { en: "Only as a draw destination.", pt: "Só como destino de desenho." } },
          { name: "GL_READ_FRAMEBUFFER", desc: { en: "Only as a read source (glReadPixels, glBlitFramebuffer).", pt: "Só como fonte de leitura (glReadPixels, glBlitFramebuffer)." } },
        ],
      },
      { name: "framebuffer", type: "GLuint", desc: { en: "FBO ID, or 0 for the window.", pt: "ID do FBO, ou 0 para a janela." } },
    ],
    notes: [
      { en: "Remember glViewport when the FBO size differs from the window.", pt: "Lembre do glViewport quando o tamanho do FBO for diferente da janela." },
      { en: "Clear the FBO after binding it — glClear acts on the bound framebuffer.", pt: "Limpe o FBO depois de fazer bind — glClear age no framebuffer ligado." },
    ],
    example: `glBindFramebuffer(GL_FRAMEBUFFER, sceneFBO);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
drawScene();

glBindFramebuffer(GL_FRAMEBUFFER, 0);
glBindTexture(GL_TEXTURE_2D, sceneColor);
drawScreenQuad();`,
    related: ["glGenFramebuffers", "glViewport", "glClear"],
    khronos: `${KHR}glBindFramebuffer.xhtml`,
  },
  {
    name: "glFramebufferTexture2D",
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glFramebufferTexture2D(GLenum target, GLenum attachment,\n                            GLenum textarget, GLuint texture, GLint level);",
    summary: {
      en: "Attaches a 2D texture to the bound framebuffer so rendering writes into it.",
      pt: "Anexa uma textura 2D ao framebuffer ligado para que a renderização escreva nela.",
    },
    description: {
      en: "Plugs a texture into one attachment slot of the FBO. Afterwards, drawing writes into the texture, and later you can sample that same texture in a shader. Use this when you need to READ the result (color for post-processing, depth for shadow maps). If you never read it, a renderbuffer is enough.",
      pt: "Conecta uma textura em um slot de attachment do FBO. Depois disso, desenhar escreve na textura, e mais tarde você pode amostrar essa mesma textura em um shader. Use quando precisar LER o resultado (cor para pós-processamento, profundidade para shadow maps). Se nunca for ler, um renderbuffer basta.",
    },
    params: [
      { name: "target", type: "GLenum", desc: { en: "GL_FRAMEBUFFER (or DRAW/READ variant).", pt: "GL_FRAMEBUFFER (ou a variante DRAW/READ)." } },
      { name: "attachment", type: "GLenum", desc: { en: "Which slot.", pt: "Qual slot." }, values: ATTACHMENTS },
      { name: "textarget", type: "GLenum", desc: { en: "GL_TEXTURE_2D, or a cube face GL_TEXTURE_CUBE_MAP_POSITIVE_X + i.", pt: "GL_TEXTURE_2D, ou uma face de cube map GL_TEXTURE_CUBE_MAP_POSITIVE_X + i." } },
      { name: "texture", type: "GLuint", desc: { en: "The texture (already allocated with the right format).", pt: "A textura (já alocada com o formato certo)." } },
      { name: "level", type: "GLint", desc: { en: "Mip level to render into, usually 0.", pt: "Nível de mipmap onde renderizar, normalmente 0." } },
    ],
    notes: [
      { en: "Never sample a texture while it is attached to the FBO you are drawing into — the result is undefined (feedback loop).", pt: "Nunca amostre uma textura enquanto ela estiver anexada ao FBO em que você está desenhando — o resultado é indefinido (feedback loop)." },
    ],
    errors: [
      { code: "GL_INVALID_OPERATION", when: { en: "Framebuffer 0 is bound, or textarget does not match the texture type.", pt: "O framebuffer 0 está ligado, ou textarget não bate com o tipo da textura." } },
    ],
    example: `GLuint color;
glGenTextures(1, &color);
glBindTexture(GL_TEXTURE_2D, color);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, w, h, 0, GL_RGBA, GL_FLOAT, nullptr);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

glBindFramebuffer(GL_FRAMEBUFFER, fbo);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, color, 0);`,
    related: ["glFramebufferRenderbuffer", "glCheckFramebufferStatus", "glTexImage2D"],
    khronos: `${KHR}glFramebufferTexture.xhtml`,
  },
  {
    name: "glCheckFramebufferStatus",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "target is not GL_FRAMEBUFFER, GL_DRAW_FRAMEBUFFER or GL_READ_FRAMEBUFFER. The call then returns 0, which is not a status.", pt: "target não é GL_FRAMEBUFFER, GL_DRAW_FRAMEBUFFER nem GL_READ_FRAMEBUFFER. A chamada então devolve 0, que não é um status." } },
    ],
    category: "framebuffers",
    since: "GL 3.0",
    signature: "GLenum glCheckFramebufferStatus(GLenum target);",
    summary: {
      en: "Checks that the bound framebuffer is complete (usable for rendering).",
      pt: "Verifica se o framebuffer ligado está completo (pronto para renderizar).",
    },
    description: {
      en: "An FBO is only usable when its attachments are compatible: at least one attachment, all with the same number of samples, formats that can be rendered to, and so on. Call this after setting up the attachments; if it does not return GL_FRAMEBUFFER_COMPLETE, drawing into it will fail.",
      pt: "Um FBO só pode ser usado quando os attachments são compatíveis: pelo menos um attachment, todos com o mesmo número de amostras, formatos que aceitam renderização, e assim por diante. Chame depois de configurar os attachments; se não retornar GL_FRAMEBUFFER_COMPLETE, desenhar nele vai falhar.",
    },
    params: [
      { name: "target", type: "GLenum", desc: { en: "GL_FRAMEBUFFER, GL_DRAW_FRAMEBUFFER or GL_READ_FRAMEBUFFER.", pt: "GL_FRAMEBUFFER, GL_DRAW_FRAMEBUFFER ou GL_READ_FRAMEBUFFER." } },
    ],
    returns: {
      en: "GL_FRAMEBUFFER_COMPLETE on success. Otherwise a reason, e.g. GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT, GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT, GL_FRAMEBUFFER_UNSUPPORTED, GL_FRAMEBUFFER_INCOMPLETE_MULTISAMPLE.",
      pt: "GL_FRAMEBUFFER_COMPLETE em caso de sucesso. Senão, o motivo, ex.: GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT, GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT, GL_FRAMEBUFFER_UNSUPPORTED, GL_FRAMEBUFFER_INCOMPLETE_MULTISAMPLE.",
    },
    example: `if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
    std::fprintf(stderr, "Framebuffer is not complete!\\n");
glBindFramebuffer(GL_FRAMEBUFFER, 0);`,
    related: ["glFramebufferTexture2D", "glFramebufferRenderbuffer"],
    khronos: `${KHR}glCheckFramebufferStatus.xhtml`,
  },
  {
    name: "glGenRenderbuffers",
    errors: [
      { code: "GL_INVALID_VALUE", when: { en: "n is negative.", pt: "n é negativo." } },
    ],
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glGenRenderbuffers(GLsizei n, GLuint *renderbuffers);",
    summary: {
      en: "Reserves names for renderbuffers — render-only images you never sample.",
      pt: "Reserva nomes para renderbuffers — imagens só de renderização que você nunca amostra.",
    },
    description: {
      en: "A renderbuffer is like a texture that can only be rendered into, not sampled from. That restriction lets the driver store it in the fastest layout. The typical use is the depth/stencil attachment of a post-processing FBO: depth is needed while drawing, but never read afterwards.",
      pt: "Um renderbuffer é como uma textura que só pode receber renderização, não ser amostrada. Essa restrição permite ao driver guardar no formato mais rápido. O uso típico é o attachment de profundidade/stencil de um FBO de pós-processamento: a profundidade é necessária durante o desenho, mas nunca é lida depois.",
    },
    params: [
      { name: "n", type: "GLsizei", desc: { en: "How many IDs.", pt: "Quantos IDs." } },
      { name: "renderbuffers", type: "GLuint *", desc: { en: "Array receiving the IDs.", pt: "Array que recebe os IDs." } },
    ],
    example: `GLuint rbo;
glGenRenderbuffers(1, &rbo);`,
    related: ["glBindRenderbuffer", "glRenderbufferStorage", "glFramebufferRenderbuffer"],
    khronos: `${KHR}glGenRenderbuffers.xhtml`,
  },
  {
    name: "glBindRenderbuffer",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "target is not GL_RENDERBUFFER.", pt: "target não é GL_RENDERBUFFER." } },
      { code: "GL_INVALID_OPERATION", when: { en: "renderbuffer is not 0 and not a name from glGenRenderbuffers or glCreateRenderbuffers.", pt: "renderbuffer não é 0 nem um nome vindo de glGenRenderbuffers ou glCreateRenderbuffers." } },
    ],
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glBindRenderbuffer(GLenum target, GLuint renderbuffer);",
    summary: {
      en: "Binds a renderbuffer so glRenderbufferStorage can allocate it.",
      pt: "Liga um renderbuffer para que glRenderbufferStorage possa alocá-lo.",
    },
    description: {
      en: "Binding a renderbuffer has only one purpose: telling glRenderbufferStorage which renderbuffer to allocate. Unlike textures, a renderbuffer is never bound for drawing; it is used by being attached to a framebuffer. The first bind of a name from glGenRenderbuffers is also what creates the object.",
      pt: "Ligar um renderbuffer tem um só propósito: dizer a glRenderbufferStorage qual renderbuffer alocar. Diferente das texturas, um renderbuffer nunca é ligado para desenhar; ele é usado ao ser anexado a um framebuffer. O primeiro bind de um nome vindo de glGenRenderbuffers também é o que cria o objeto.",
    },
    params: [
      { name: "target", type: "GLenum", desc: { en: "Always GL_RENDERBUFFER.", pt: "Sempre GL_RENDERBUFFER." } },
      { name: "renderbuffer", type: "GLuint", desc: { en: "Renderbuffer ID, or 0.", pt: "ID do renderbuffer, ou 0." } },
    ],
    example: `glBindRenderbuffer(GL_RENDERBUFFER, rbo);
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, w, h);`,
    related: ["glRenderbufferStorage", "glGenRenderbuffers"],
    khronos: `${KHR}glBindRenderbuffer.xhtml`,
  },
  {
    name: "glRenderbufferStorage",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "target is not GL_RENDERBUFFER, or internalformat is not a colour-, depth- or stencil-renderable format.", pt: "target não é GL_RENDERBUFFER, ou internalformat não é um formato renderizável de cor, profundidade ou stencil." } },
      { code: "GL_INVALID_OPERATION", when: { en: "No renderbuffer is bound (the binding is 0).", pt: "Nenhum renderbuffer está ligado (o binding é 0)." } },
      { code: "GL_INVALID_VALUE", when: { en: "width or height is negative or larger than GL_MAX_RENDERBUFFER_SIZE.", pt: "width ou height é negativo ou maior que GL_MAX_RENDERBUFFER_SIZE." } },
      { code: "GL_OUT_OF_MEMORY", when: { en: "The GPU could not allocate the storage.", pt: "A GPU não conseguiu alocar o armazenamento." } },
    ],
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glRenderbufferStorage(GLenum target, GLenum internalformat,\n                           GLsizei width, GLsizei height);",
    summary: {
      en: "Allocates the memory of the bound renderbuffer.",
      pt: "Aloca a memória do renderbuffer ligado.",
    },
    description: {
      en: "Gives the bound renderbuffer an image of internalformat and width × height pixels. A renderbuffer is a framebuffer image that shaders cannot read, so it suits buffers needed only while drawing, above all the depth-stencil buffer of an off-screen framebuffer (GL_DEPTH24_STENCIL8).\n\nIts size must match the other attachments; when the window is resized, call it again with the new size.",
      pt: "Dá ao renderbuffer ligado uma imagem de formato internalformat e width × height pixels. Um renderbuffer é uma imagem de framebuffer que os shaders não podem ler, então serve para buffers necessários só durante o desenho, principalmente o depth-stencil buffer de um framebuffer fora da tela (GL_DEPTH24_STENCIL8).\n\nO tamanho precisa bater com os outros anexos; quando a janela mudar de tamanho, chame de novo com o tamanho novo.",
    },
    params: [
      { name: "target", type: "GLenum", desc: { en: "GL_RENDERBUFFER.", pt: "GL_RENDERBUFFER." } },
      {
        name: "internalformat", type: "GLenum",
        desc: { en: "Storage format.", pt: "Formato de armazenamento." },
        values: [
          { name: "GL_DEPTH24_STENCIL8", desc: { en: "24-bit depth + 8-bit stencil — the common choice.", pt: "Profundidade 24 bits + stencil 8 bits — a escolha comum." } },
          { name: "GL_DEPTH_COMPONENT24 / 32F", desc: { en: "Depth only.", pt: "Só profundidade." } },
          { name: "GL_RGBA8 / GL_RGBA16F", desc: { en: "Color, e.g. an MSAA color target to resolve later.", pt: "Cor, ex.: um alvo de cor MSAA para resolver depois." } },
        ],
      },
      { name: "width", type: "GLsizei", desc: { en: "Width in pixels — must match the other attachments.", pt: "Largura em pixels — deve bater com os outros attachments." } },
      { name: "height", type: "GLsizei", desc: { en: "Height in pixels.", pt: "Altura em pixels." } },
    ],
    notes: [
      { en: "On window resize, re-allocate every attachment with the new size.", pt: "Ao redimensionar a janela, realoque todos os attachments com o novo tamanho." },
    ],
    example: `glBindRenderbuffer(GL_RENDERBUFFER, rbo);
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, width, height);
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);`,
    related: ["glBindRenderbuffer", "glFramebufferRenderbuffer"],
    khronos: `${KHR}glRenderbufferStorage.xhtml`,
  },
  {
    name: "glFramebufferRenderbuffer",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "target is not a framebuffer target, renderbuffertarget is not GL_RENDERBUFFER, or attachment is not an attachment name.", pt: "target não é um target de framebuffer, renderbuffertarget não é GL_RENDERBUFFER, ou attachment não é um nome de anexo." } },
      { code: "GL_INVALID_OPERATION", when: { en: "Framebuffer 0 (the window) is bound to target, renderbuffer is not 0 and not an existing renderbuffer, or attachment is GL_COLOR_ATTACHMENTi with i ≥ GL_MAX_COLOR_ATTACHMENTS.", pt: "O framebuffer 0 (a janela) está ligado ao target, renderbuffer não é 0 nem um renderbuffer existente, ou attachment é GL_COLOR_ATTACHMENTi com i ≥ GL_MAX_COLOR_ATTACHMENTS." } },
    ],
    category: "framebuffers",
    since: "GL 3.0",
    signature: "void glFramebufferRenderbuffer(GLenum target, GLenum attachment,\n                               GLenum renderbuffertarget, GLuint renderbuffer);",
    summary: {
      en: "Attaches a renderbuffer to the bound framebuffer.",
      pt: "Anexa um renderbuffer ao framebuffer ligado.",
    },
    description: {
      en: "Connects a renderbuffer to one attachment point of the framebuffer bound to target. From then on, drawing into the framebuffer writes into it: depth values for GL_DEPTH_ATTACHMENT, depth and stencil for GL_DEPTH_STENCIL_ATTACHMENT.\n\nThe typical post-processing framebuffer pairs a colour texture (read in the next pass) with a depth-stencil renderbuffer (needed only for testing). Check the result with glCheckFramebufferStatus.",
      pt: "Liga um renderbuffer a um ponto de anexo do framebuffer ligado a target. A partir daí, desenhar no framebuffer escreve nele: valores de profundidade em GL_DEPTH_ATTACHMENT, profundidade e stencil em GL_DEPTH_STENCIL_ATTACHMENT.\n\nO framebuffer típico de pós-processamento junta uma textura de cor (lida na passada seguinte) com um renderbuffer de depth-stencil (necessário só para os testes). Confira o resultado com glCheckFramebufferStatus.",
    },
    params: [
      { name: "target", type: "GLenum", desc: { en: "GL_FRAMEBUFFER.", pt: "GL_FRAMEBUFFER." } },
      { name: "attachment", type: "GLenum", desc: { en: "Which slot.", pt: "Qual slot." }, values: ATTACHMENTS },
      { name: "renderbuffertarget", type: "GLenum", desc: { en: "Must be GL_RENDERBUFFER.", pt: "Deve ser GL_RENDERBUFFER." } },
      { name: "renderbuffer", type: "GLuint", desc: { en: "The renderbuffer, already allocated.", pt: "O renderbuffer, já alocado." } },
    ],
    example: `glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);`,
    related: ["glRenderbufferStorage", "glFramebufferTexture2D", "glCheckFramebufferStatus"],
    khronos: `${KHR}glFramebufferRenderbuffer.xhtml`,
  },
  {
    name: "glDrawBuffer",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "buf is not one of the accepted values.", pt: "buf não é um dos valores aceitos." } },
      { code: "GL_INVALID_OPERATION", when: { en: "buf does not exist in the bound framebuffer: GL_BACK with an FBO bound, a GL_COLOR_ATTACHMENTi with the window bound, or i ≥ GL_MAX_COLOR_ATTACHMENTS.", pt: "buf não existe no framebuffer ligado: GL_BACK com um FBO ligado, um GL_COLOR_ATTACHMENTi com a janela ligada, ou i ≥ GL_MAX_COLOR_ATTACHMENTS." } },
    ],
    category: "framebuffers",
    since: "GL 1.0",
    signature: "void glDrawBuffer(GLenum buf);",
    summary: {
      en: "Chooses which color buffer of the bound framebuffer receives color output.",
      pt: "Escolhe qual color buffer do framebuffer ligado recebe a saída de cor.",
    },
    description: {
      en: "The main use in modern code is depth-only framebuffers, like a shadow map FBO: there is no color attachment, so you tell OpenGL not to write color at all with GL_NONE. Otherwise the framebuffer would be incomplete.",
      pt: "O uso principal em código moderno é em framebuffers só de profundidade, como o FBO do shadow map: não há attachment de cor, então você diz ao OpenGL para não escrever cor nenhuma com GL_NONE. Senão o framebuffer ficaria incompleto.",
    },
    params: [
      {
        name: "buf", type: "GLenum",
        desc: { en: "Target color buffer.", pt: "Color buffer de destino." },
        values: [
          { name: "GL_NONE", desc: { en: "Write no color (depth-only passes).", pt: "Não escreve cor (passadas só de profundidade)." } },
          { name: "GL_COLOR_ATTACHMENT0 … n", desc: { en: "One color attachment of an FBO.", pt: "Um attachment de cor de um FBO." } },
          { name: "GL_BACK", desc: { en: "The window's back buffer (framebuffer 0).", pt: "O back buffer da janela (framebuffer 0)." } },
        ],
      },
    ],
    notes: [
      { en: "To write to several attachments at once (MRT / G-buffer) use glDrawBuffers with an array.", pt: "Para escrever em vários attachments de uma vez (MRT / G-buffer) use glDrawBuffers com um array." },
    ],
    example: `glBindFramebuffer(GL_FRAMEBUFFER, shadowFBO);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, shadowMap, 0);
glDrawBuffer(GL_NONE);
glReadBuffer(GL_NONE);`,
    related: ["glReadBuffer", "glBindFramebuffer"],
    khronos: `${KHR}glDrawBuffer.xhtml`,
  },
  {
    name: "glReadBuffer",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "src is not one of the accepted values.", pt: "src não é um dos valores aceitos." } },
      { code: "GL_INVALID_OPERATION", when: { en: "src does not exist in the bound read framebuffer: GL_BACK with an FBO bound, a GL_COLOR_ATTACHMENTi with the window bound, or i ≥ GL_MAX_COLOR_ATTACHMENTS.", pt: "src não existe no framebuffer de leitura ligado: GL_BACK com um FBO ligado, um GL_COLOR_ATTACHMENTi com a janela ligada, ou i ≥ GL_MAX_COLOR_ATTACHMENTS." } },
    ],
    category: "framebuffers",
    since: "GL 1.0",
    signature: "void glReadBuffer(GLenum src);",
    summary: {
      en: "Chooses which color buffer is the source for read operations.",
      pt: "Escolhe qual color buffer é a fonte das operações de leitura.",
    },
    description: {
      en: "Affects glReadPixels, glBlitFramebuffer and glCopyTexSubImage. Like glDrawBuffer, it is set to GL_NONE on depth-only framebuffers so they are complete without a color attachment.",
      pt: "Afeta glReadPixels, glBlitFramebuffer e glCopyTexSubImage. Como glDrawBuffer, é definido como GL_NONE em framebuffers só de profundidade para que fiquem completos sem attachment de cor.",
    },
    params: [
      { name: "src", type: "GLenum", desc: { en: "GL_NONE, GL_COLOR_ATTACHMENTi, or GL_BACK / GL_FRONT for the window.", pt: "GL_NONE, GL_COLOR_ATTACHMENTi, ou GL_BACK / GL_FRONT para a janela." } },
    ],
    example: `glReadBuffer(GL_NONE);`,
    related: ["glDrawBuffer"],
    khronos: `${KHR}glReadBuffer.xhtml`,
  },
];

// src/lib/tracks/opengl/descriptions.ts
// What search results show under each OpenGL lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const openglDescriptions: LessonDescriptions = {
  legacy: {
    en: "What OpenGL really is, how to tell old glBegin/glVertex code from modern OpenGL, why shaders replaced the fixed pipeline, and core vs compatibility profile.",
    pt: "O que o OpenGL realmente é, como reconhecer código antigo com glBegin/glVertex, por que os shaders substituíram o pipeline fixo, e perfil core vs compatibility.",
  },
  setup: {
    en: "Create a window and an OpenGL context with GLFW and GLAD, build with CMake, and write a render loop with double buffering, vsync and resizing.",
    pt: "Crie uma janela e um contexto OpenGL com GLFW e GLAD, compile com CMake e escreva o loop de renderização com double buffering, vsync e redimensionamento.",
  },
  pipeline: {
    en: "Follow one triangle through every stage of the graphics pipeline, from the vertex shader through clip space and rasterization to a pixel, with real numbers.",
    pt: "Siga um triângulo por cada estágio do pipeline gráfico, do vertex shader ao clip space, à rasterização e ao pixel na tela, com números reais.",
  },
  vbo: {
    en: "What a vertex buffer object (VBO) is: move vertex data into GPU memory with glGenBuffers and glBufferData, count the bytes, and pick a usage hint.",
    pt: "O que é um vertex buffer object (VBO): leve os vértices para a memória da GPU com glGenBuffers e glBufferData, conte os bytes e escolha o usage hint.",
  },
  vao: {
    en: "What a vertex array object (VAO) stores, glVertexAttribPointer explained argument by argument, and how to set up and switch between several VAOs.",
    pt: "O que um vertex array object (VAO) guarda, o glVertexAttribPointer explicado argumento por argumento, e como criar e alternar entre vários VAOs.",
  },
  shaders: {
    en: "Write your first vertex and fragment shaders in GLSL: vector types, passing data between stages, uniforms from C++, compiling, linking and reading errors.",
    pt: "Escreva seus primeiros vertex e fragment shaders em GLSL: tipos vetoriais, dados entre estágios, uniforms pelo C++, compilar, linkar e ler os erros.",
  },
  triangle: {
    en: "Draw your first triangle in modern OpenGL: the complete C++ program explained part by part, and a checklist for when the screen stays black.",
    pt: "Desenhe seu primeiro triângulo em OpenGL moderno: o programa C++ completo explicado parte por parte, e um roteiro para quando a tela fica preta.",
  },
  ebo: {
    en: "Indexed drawing with an element buffer object (EBO): share vertices between triangles, draw with glDrawElements, and check an indexed grid in wireframe.",
    pt: "Desenho indexado com element buffer object (EBO): compartilhe vértices entre triângulos, desenhe com glDrawElements e confira uma grade em wireframe.",
  },
  textures: {
    en: "Texture an OpenGL shape: UV coordinates, loading images with stb_image, filtering and mipmap modes, and why textures come out black or skewed.",
    pt: "Texturas em OpenGL: coordenadas UV, carregar imagens com stb_image, filtros e modos de mipmap, e por que a textura sai preta ou torta.",
  },
  vectors: {
    en: "Vectors for 3D graphics: add, scale and normalize, the dot and cross products in pictures and numbers, and the same operations in GLM.",
    pt: "Vetores para gráficos 3D: somar, escalar e normalizar, produto escalar e vetorial com desenhos e números, e as mesmas operações em GLM.",
  },
  "linear-algebra": {
    en: "Matrices for 3D graphics: multiply a matrix by a vector, build scale, rotation and translation matrices, why 4×4, and combining them in the right order.",
    pt: "Matrizes para gráficos 3D: matriz vezes vetor, matrizes de escala, rotação e translação, por que 4×4, e como combiná-las na ordem certa.",
  },
  transformations: {
    en: "Model, view and projection matrices with GLM: move a shape in the vertex shader, follow a vertex through each space, perspective vs orthographic.",
    pt: "Matrizes model, view e projection com GLM: mova uma forma no vertex shader, siga um vértice por cada espaço, e perspectiva vs ortográfica.",
  },
  "rotate-triangle": {
    en: "Rotate a triangle in OpenGL step by step with glm::rotate: fix the stretched window with glm::ortho, spin it with time, pause it, steer it with keys, pick a pivot.",
    pt: "Gire um triângulo em OpenGL passo a passo com glm::rotate: corrija a janela esticada com glm::ortho, gire com o tempo, pause, controle com o teclado e escolha o pivô.",
  },
  cube: {
    en: "Draw a 3D cube in OpenGL: why it needs 36 corners, glDrawArrays vs an EBO with 8 or 24 vertices, the depth test, and a textured cube.",
    pt: "Desenhe um cubo 3D em OpenGL: por que são 36 cantos, glDrawArrays vs EBO com 8 ou 24 vértices, o teste de profundidade e o cubo texturizado.",
  },
  "rotate-cube": {
    en: "Rotate a cube in OpenGL step by step: one axis at a time, two rotations in the right order, drag with the mouse (yaw and pitch), and many cubes with a moon.",
    pt: "Gire um cubo em OpenGL passo a passo: um eixo de cada vez, duas rotações na ordem certa, arrastar com o mouse (yaw e pitch) e vários cubos com uma lua.",
  },
  camera: {
    en: "Build an OpenGL camera with glm::lookAt: walk with WASD at the same speed on any machine, look around with the mouse, zoom with the scroll wheel.",
    pt: "Monte uma câmera em OpenGL com glm::lookAt: ande com WASD na mesma velocidade em qualquer máquina, olhe com o mouse e dê zoom com a roda.",
  },
  "depth-testing": {
    en: "How the OpenGL depth buffer works: depth functions, glDepthMask, viewing the depth buffer, z-fighting, and why precision runs out with distance.",
    pt: "Como funciona o depth buffer do OpenGL: funções de profundidade, glDepthMask, ver o depth buffer, z-fighting e por que a precisão acaba com a distância.",
  },
  "light-color": {
    en: "Why a colour is three numbers and what light × surface means: write the lit object shader and the lamp shader, then predict colours by hand.",
    pt: "Por que uma cor são três números e o que significa luz × superfície: escreva o shader do objeto iluminado e o da lâmpada, e preveja as cores à mão.",
  },
  lighting: {
    en: "The Phong lighting model in GLSL: ambient, diffuse with Lambert's cosine law, specular highlights, shininess, and the normal matrix.",
    pt: "O modelo de iluminação Phong em GLSL: ambiente, difusa com a lei do cosseno de Lambert, brilho especular, shininess e a normal matrix.",
  },
  materials: {
    en: "Describe surfaces with ambient, diffuse and specular colours plus shininess, work one fragment out by hand, and make metals and plastics look different.",
    pt: "Descreva superfícies com cores ambiente, difusa e especular mais shininess, calcule um fragmento à mão e faça metal e plástico parecerem diferentes.",
  },
  "lighting-maps": {
    en: "Diffuse, specular and emission maps: vary a material texel by texel, control where highlights appear, and bind each map to the right texture unit.",
    pt: "Mapas difuso, especular e de emissão: varie o material texel a texel, controle onde aparece o brilho e ligue cada mapa à texture unit certa.",
  },
  "light-casters": {
    en: "Directional lights like the sun, point lights with distance attenuation, and spotlights with a soft edge, written as OpenGL fragment shaders.",
    pt: "Luz direcional como o sol, luzes pontuais com atenuação pela distância e spotlights com borda suave, escritas como fragment shaders em OpenGL.",
  },
  "multiple-lights": {
    en: "Why light from several sources simply adds up, one GLSL function per kind of light, choosing a light's radius, and what many lights cost.",
    pt: "Por que a luz de várias fontes simplesmente se soma, uma função GLSL por tipo de luz, como escolher o raio de uma luz e quanto custam muitas luzes.",
  },
  "advanced-lighting": {
    en: "Blinn-Phong vs Phong: where Phong's specular highlight breaks, the halfway vector, and both models worked out on one fragment.",
    pt: "Blinn-Phong vs Phong: onde o brilho especular do Phong quebra, o vetor halfway e os dois modelos calculados no mesmo fragmento.",
  },
  gamma: {
    en: "Gamma correction explained: what the monitor does to your colour values, lighting in linear space, sRGB textures, and why falloff looked wrong.",
    pt: "Correção gama explicada: o que o monitor faz com os valores de cor, iluminação em espaço linear, texturas sRGB e por que a atenuação parecia errada.",
  },
  "shadow-mapping": {
    en: "Shadow mapping in OpenGL: render depth from the light, build the light-space matrix, test each fragment, and fix shadow acne and peter-panning.",
    pt: "Shadow mapping em OpenGL: renderize a profundidade a partir da luz, monte a matriz light-space, teste cada fragmento e corrija shadow acne e peter-panning.",
  },
  "point-shadows": {
    en: "Omnidirectional shadows for point lights: render six 90° views into a cube map, store distances instead of depths, and soften edges with PCF.",
    pt: "Sombras omnidirecionais de luzes pontuais: seis vistas de 90° num cube map, guardar distâncias em vez de profundidade e suavizar bordas com PCF.",
  },
  "cascaded-shadows": {
    en: "Cascaded shadow maps (CSM) for large outdoor scenes: split the view frustum, fit a light frustum per cascade, blend between them and stop shimmering.",
    pt: "Cascaded shadow maps (CSM) para cenas abertas: divida o frustum da câmera, ajuste um frustum de luz por cascata, misture entre elas e evite tremulação.",
  },
  "normal-mapping": {
    en: "Normal mapping explained: turn normal-map colours back into normals, tangent space, and the TBN matrix to light a flat surface as if it were bumpy.",
    pt: "Normal mapping explicado: transforme as cores do normal map em normais, entenda o tangent space e a matriz TBN para iluminar uma superfície plana como se tivesse relevo.",
  },
  hdr: {
    en: "HDR rendering in OpenGL: what clamping to 1.0 destroys, floating-point framebuffers, and tone mapping operators worked out on one pixel.",
    pt: "Renderização HDR em OpenGL: o que limitar a 1.0 destrói, framebuffers de ponto flutuante e operadores de tone mapping calculados num pixel.",
  },
  bloom: {
    en: "Bloom in OpenGL: extract the bright parts of an HDR image, blur them with two separable Gaussian passes, and add the glow back to the scene.",
    pt: "Bloom em OpenGL: extraia as partes claras de uma imagem HDR, desfoque com duas passadas gaussianas separáveis e some o brilho de volta à cena.",
  },
  "color-spaces": {
    en: "Colour spaces for rendering: sRGB, P3 and HDR primaries, scene-referred vs display-referred values, and what ACES tone mapping does to colour.",
    pt: "Espaços de cor na renderização: primárias sRGB, P3 e HDR, valores da cena vs valores da tela, e o que o tone mapping ACES faz com as cores.",
  },
  deferred: {
    en: "Deferred shading in OpenGL: fill a G-buffer with positions, normals and colours, light hundreds of lights with light volumes, then add forward objects.",
    pt: "Deferred shading em OpenGL: preencha um G-buffer com posições, normais e cores, ilumine centenas de luzes com light volumes e depois some objetos forward.",
  },
  "global-illumination": {
    en: "Global illumination for real-time graphics: why constant ambient fails, baked lightmaps, light probes with spherical harmonics, and dynamic GI.",
    pt: "Iluminação global em tempo real: por que a luz ambiente constante falha, lightmaps pré-calculados, light probes com harmônicos esféricos e GI dinâmica.",
  },
  "pbr-theory": {
    en: "PBR theory explained: microfacets, energy conservation, radiometry, the reflectance equation term by term, the BRDF and the metallic-roughness workflow.",
    pt: "Teoria de PBR explicada: microfacetas, conservação de energia, radiometria, a equação de reflectância termo a termo, a BRDF e o fluxo metallic-roughness.",
  },
  "pbr-lighting": {
    en: "The Cook-Torrance BRDF in GLSL: GGX normal distribution, Smith geometry and Schlick Fresnel, each derived and shown, then a full textured PBR shader.",
    pt: "A BRDF de Cook-Torrance em GLSL: distribuição GGX, geometria de Smith e Fresnel de Schlick, cada termo derivado e mostrado, e um shader PBR com texturas.",
  },
  "ibl-diffuse": {
    en: "Image-based lighting, diffuse part: load an HDR environment, convert it to a cube map, and precompute the irradiance map by convolution.",
    pt: "Image-based lighting, parte difusa: carregue um ambiente HDR, converta para cube map e pré-calcule o irradiance map por convolução.",
  },
  "ibl-specular": {
    en: "Specular image-based lighting with the split sum approximation: prefiltered environment maps, importance sampling, and the BRDF integration LUT.",
    pt: "Image-based lighting especular com a aproximação split sum: environment maps pré-filtrados, importance sampling e a LUT de integração da BRDF.",
  },
  "post-processing": {
    en: "Post-processing effects in OpenGL: greyscale and colour grading, convolution kernels for blur, sharpen and edges, separable Gaussian blur, film effects.",
    pt: "Efeitos de pós-processamento em OpenGL: tons de cinza e color grading, kernels de convolução para blur, nitidez e bordas, blur gaussiano separável.",
  },
  ssao: {
    en: "Screen-space ambient occlusion (SSAO) step by step: a view-space G-buffer, the hemisphere sample kernel, the SSAO pass, blur, and using it in lighting.",
    pt: "Screen-space ambient occlusion (SSAO) passo a passo: G-buffer em view space, o kernel de amostras no hemisfério, a passada de SSAO, blur e uso na iluminação.",
  },
  "parallax-mapping": {
    en: "Parallax mapping in GLSL: offset texture coordinates with a depth map, steep parallax with layers, and parallax occlusion mapping with interpolation.",
    pt: "Parallax mapping em GLSL: desloque coordenadas de textura com um depth map, steep parallax em camadas e parallax occlusion mapping com interpolação.",
  },
  "anti-aliasing": {
    en: "Anti-aliasing explained: why jagged edges come from sampling, SSAA vs MSAA vs FXAA compared by cost and quality, and how to enable MSAA in OpenGL.",
    pt: "Anti-aliasing explicado: por que serrilhado vem da amostragem, SSAA vs MSAA vs FXAA comparados em custo e qualidade, e como ligar MSAA no OpenGL.",
  },
  taa: {
    en: "Temporal anti-aliasing (TAA): camera jitter, a running history, motion vectors, rejecting stale history, and how temporal upscaling builds on it.",
    pt: "Anti-aliasing temporal (TAA): jitter da câmera, histórico acumulado, motion vectors, rejeitar histórico errado e como o upscaling temporal parte disso.",
  },
  "model-loading": {
    en: "Load 3D models in OpenGL with Assimp: how a scene file is structured, a Mesh class that owns its buffers, walking the node tree, caching textures.",
    pt: "Carregue modelos 3D em OpenGL com Assimp: a estrutura de um arquivo de cena, uma classe Mesh dona dos buffers, percorrer a árvore de nós e cache de texturas.",
  },
  "stencil-testing": {
    en: "The OpenGL stencil buffer: where the test sits, glStencilFunc and glStencilOp outcomes, object outlines, mirrors, portals and masks.",
    pt: "O stencil buffer do OpenGL: onde fica o teste, os resultados de glStencilFunc e glStencilOp, contornos de objetos, espelhos, portais e máscaras.",
  },
  blending: {
    en: "Blending and transparency in OpenGL: the blend equation and glBlendFunc factors, glBlendEquation, cut-out alpha, and sorting transparent objects.",
    pt: "Blending e transparência em OpenGL: a equação de blend e os fatores do glBlendFunc, glBlendEquation, alpha recortado e ordenação de objetos transparentes.",
  },
  framebuffers: {
    en: "Framebuffer objects (FBO) in OpenGL: colour and depth attachments, render to a texture, then draw it with a fullscreen pass for screen effects.",
    pt: "Framebuffer objects (FBO) em OpenGL: anexos de cor e profundidade, renderizar para uma textura e desenhá-la numa passada de tela cheia com efeitos.",
  },
  cubemaps: {
    en: "Cubemaps and skyboxes in OpenGL: sample with a direction, load six faces or a panorama, draw the sky behind everything, reflect and refract it.",
    pt: "Cubemaps e skybox em OpenGL: amostrar com uma direção, carregar seis faces ou um panorama, desenhar o céu atrás de tudo, refletir e refratar.",
  },
  "buffer-data": {
    en: "Update OpenGL buffers: glBufferSubData, writing through glMapBuffer, interleaved vs batched attributes, and GPU copies with glCopyBufferSubData.",
    pt: "Atualizar buffers no OpenGL: glBufferSubData, escrever por um ponteiro com glMapBuffer, atributos intercalados vs em blocos, e cópias com glCopyBufferSubData.",
  },
  instancing: {
    en: "Instanced rendering in OpenGL: what a draw call costs, glDrawArraysInstanced, per-instance data with glVertexAttribDivisor, and an asteroid ring.",
    pt: "Instancing em OpenGL: quanto custa um draw call, glDrawArraysInstanced, dados por instância com glVertexAttribDivisor e um anel de asteroides.",
  },
  particles: {
    en: "A particle system in OpenGL: spawn without drift, integrate motion, a pool with swap-remove, one instanced draw, blending, and moving it to the GPU.",
    pt: "Um sistema de partículas em OpenGL: emissão sem deriva, integração do movimento, pool com swap-remove, um draw instanciado, blending e a versão na GPU.",
  },
  ubo: {
    en: "Uniform buffer objects (UBO): share matrices between shaders with a uniform block, binding points, and the std140 layout padding rules explained.",
    pt: "Uniform buffer objects (UBO): compartilhe matrizes entre shaders com um uniform block, binding points e as regras de alinhamento do std140 explicadas.",
  },
  "geometry-shader": {
    en: "Geometry shaders in OpenGL: EmitVertex and EndPrimitive, exploding a mesh, drawing normals, layered rendering, and why they fell out of favour.",
    pt: "Geometry shaders em OpenGL: EmitVertex e EndPrimitive, explodir uma malha, desenhar normais, renderização em camadas e por que caíram em desuso.",
  },
  tessellation: {
    en: "Tessellation shaders in OpenGL: control and evaluation stages, tessellation levels without cracks, heightmap terrain, and Phong tessellation.",
    pt: "Shaders de tesselação em OpenGL: estágios de controle e avaliação, níveis de tesselação sem rachaduras, terreno com heightmap e tesselação de Phong.",
  },
  "skeletal-animation": {
    en: "Skeletal animation explained: bone hierarchies, bind pose and inverse bind matrices, linear blend skinning, keyframes, and blending animations.",
    pt: "Animação esquelética explicada: hierarquia de ossos, bind pose e matrizes inversas, linear blend skinning, keyframes e mistura de animações.",
  },
  "text-rendering": {
    en: "Text rendering in OpenGL: what a font file holds, glyph atlases and batched quads, and crisp text at any size with signed distance fields (SDF).",
    pt: "Renderização de texto em OpenGL: o que um arquivo de fonte contém, atlas de glifos e quads em lote, e texto nítido em qualquer tamanho com SDF.",
  },
  picking: {
    en: "Object picking in OpenGL: turn the mouse into a world-space ray, ray tests against spheres, boxes and triangles, and exact picking with an ID buffer.",
    pt: "Seleção de objetos (picking) em OpenGL: transforme o mouse num raio no mundo, testes contra esferas, caixas e triângulos, e picking exato com ID buffer.",
  },
  oit: {
    en: "Order-independent transparency: why blending depends on draw order, exact methods like depth peeling, and weighted blended OIT step by step.",
    pt: "Transparência independente da ordem: por que o blending depende da ordem de desenho, métodos exatos como depth peeling e weighted blended OIT passo a passo.",
  },
  reflections: {
    en: "Real-time reflections: the reflected ray, planar mirrors with a mirrored camera, reflection probes with box projection, and screen-space reflections.",
    pt: "Reflexos em tempo real: o raio refletido, espelhos planos com câmera espelhada, reflection probes com box projection e screen-space reflections.",
  },
  volumetrics: {
    en: "Atmospheric scattering and volumetric fog: absorption and scattering, phase functions, why the sky is blue and sunsets red, and froxel fog.",
    pt: "Espalhamento atmosférico e neblina volumétrica: absorção e espalhamento, funções de fase, por que o céu é azul e o pôr do sol vermelho, e neblina em froxels.",
  },
  decals: {
    en: "Decals in a renderer: the limits of mesh decals, projected deferred decals with a box, and writing decals straight into the G-buffer.",
    pt: "Decals num renderizador: os limites dos decals em malha, decals projetados com uma caixa, e escrever decals direto no G-buffer.",
  },
  terrain: {
    en: "Terrain rendering: build a landscape from a heightmap, blend textures with splatting, and split it into LOD chunks without cracks.",
    pt: "Renderização de terreno: construa a paisagem a partir de um heightmap, misture texturas com splatting e divida em blocos com LOD sem rachaduras.",
  },
  profiling: {
    en: "Measure OpenGL performance: think in milliseconds not FPS, time the GPU with timer queries, and find out whether the CPU or the GPU is the bottleneck.",
    pt: "Meça o desempenho no OpenGL: pense em milissegundos e não em FPS, cronometre a GPU com timer queries e descubra se o gargalo é a CPU ou a GPU.",
  },
  winding: {
    en: "Winding order and face culling in OpenGL: front vs back faces, glCullFace and glFrontFace, fixing inside-out meshes, and what culling really saves.",
    pt: "Ordem de winding e face culling em OpenGL: frente vs verso, glCullFace e glFrontFace, consertar malhas do avesso e o que o culling realmente economiza.",
  },
  "frustum-culling": {
    en: "Frustum culling and occlusion culling: the view frustum as six planes, sphere and box tests, hierarchies, and skipping objects hidden behind others.",
    pt: "Frustum culling e occlusion culling: o frustum como seis planos, testes com esferas e caixas, hierarquias e pular objetos escondidos atrás de outros.",
  },
  "draw-calls": {
    en: "Why draw calls are slow on the CPU, which OpenGL state changes cost the most, sorting draws with a key, and batching to draw less often.",
    pt: "Por que draw calls pesam na CPU, quais mudanças de estado do OpenGL custam mais, ordenar draws com uma chave e agrupar para desenhar menos vezes.",
  },
  "clustered-shading": {
    en: "Forward+ (tiled) and clustered shading for thousands of lights: why each light costs time, light lists per tile or cluster, built on the GPU.",
    pt: "Forward+ (tiled) e clustered shading para milhares de luzes: por que cada luz custa tempo, listas de luzes por tile ou cluster, montadas na GPU.",
  },
  lod: {
    en: "Level of detail (LOD): pick a mesh by its size on screen, hide the switch with hysteresis and cross-fades, and where simpler meshes come from.",
    pt: "Nível de detalhe (LOD): escolha a malha pelo tamanho na tela, esconda a troca com histerese e cross-fade, e de onde vêm as malhas simplificadas.",
  },
  "texture-compression": {
    en: "Mipmapping and texture compression: why distant textures shimmer, building mipmaps, and choosing a BC block-compression format for each texture.",
    pt: "Mipmapping e compressão de texturas: por que texturas distantes tremulam, como gerar mipmaps e qual formato de compressão BC usar em cada textura.",
  },
  streaming: {
    en: "Stream data to the GPU without stalls: implicit sync, buffer orphaning, persistent mapping with fences, and reading results back asynchronously.",
    pt: "Envie dados à GPU sem travar: sincronização implícita, buffer orphaning, mapeamento persistente com fences e leitura de volta sem espera.",
  },
  dsa: {
    en: "OpenGL Direct State Access (DSA) from 4.5: edit buffers, textures and VAOs by ID without binding, the bugs it removes, and DSA vs classic side by side.",
    pt: "Direct State Access (DSA) do OpenGL 4.5: edite buffers, texturas e VAOs pelo ID sem bind, os bugs que isso elimina, e DSA vs estilo clássico lado a lado.",
  },
  debugging: {
    en: "Debug OpenGL: glDebugMessageCallback and its messages, glGetError when there is no debug output, naming objects, and a black-screen checklist.",
    pt: "Depurar OpenGL: glDebugMessageCallback e suas mensagens, glGetError quando não há debug output, nomear objetos e um roteiro para tela preta.",
  },
  compute: {
    en: "Compute shaders in OpenGL: workgroups and dispatch, image writes, shared memory and barrier(), SSBOs, atomics, indirect dispatch and GPU culling.",
    pt: "Compute shaders em OpenGL: workgroups e dispatch, escrita em imagens, memória shared e barrier(), SSBOs, atomics, dispatch indireto e culling na GPU.",
  },
};

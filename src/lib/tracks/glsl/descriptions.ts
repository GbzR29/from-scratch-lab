// src/lib/tracks/glsl/descriptions.ts
// What search results show under each GLSL lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const glslDescriptions: LessonDescriptions = {
  types: {
    en: "GLSL data types: float, int and bool, vec2, vec3 and vec4, swizzling, constructors, matrices, type casts, precision qualifiers, and common compile errors.",
    pt: "Tipos de dados em GLSL: float, int e bool, vec2, vec3 e vec4, swizzling, construtores, matrizes, conversões, qualificadores de precisão e erros comuns.",
  },
  builtins: {
    en: "GLSL built-in functions with live graphs: clamp, mix, step, smoothstep, fract, length, dot, cross, normalize, reflect, and smooth edges with fwidth.",
    pt: "Funções embutidas do GLSL com gráficos ao vivo: clamp, mix, step, smoothstep, fract, length, dot, cross, normalize, reflect e bordas suaves com fwidth.",
  },
  fragcoord: {
    en: "gl_FragCoord to UV coordinates in GLSL: normalize to 0–1, center the origin, fix the aspect ratio, and animate a fragment shader with time.",
    pt: "De gl_FragCoord a coordenadas UV em GLSL: normalizar para 0–1, centralizar a origem, corrigir a proporção da tela e animar o fragment shader com o tempo.",
  },
  "builtin-vars": {
    en: "GLSL built-in variables: gl_Position, gl_PointSize and gl_PointCoord, gl_ClipDistance, gl_FragCoord and gl_FrontFacing, interpolation qualifiers.",
    pt: "Variáveis embutidas do GLSL: gl_Position, gl_PointSize e gl_PointCoord, gl_ClipDistance, gl_FragCoord e gl_FrontFacing, qualificadores de interpolação.",
  },
  playground: {
    en: "A free GLSL shader playground in the browser: write a fragment shader line by line, use time, mouse and textures, add sliders, and debug with colours.",
    pt: "Um playground de shaders GLSL grátis no navegador: escreva um fragment shader linha a linha, use tempo, mouse e texturas, crie sliders e depure com cores.",
  },
  sdf: {
    en: "Signed distance functions (SDF) in GLSL: circle and box distances, union, intersection, subtraction and smooth min, and crisp anti-aliased edges.",
    pt: "Funções de distância com sinal (SDF) em GLSL: distância de círculo e retângulo, união, interseção, subtração e smooth min, e bordas nítidas sem serrilhado.",
  },
  patterns: {
    en: "Procedural patterns in GLSL: move, rotate and scale by transforming the point, repeat tiles with fract, floor and mod, and randomize each tile.",
    pt: "Padrões procedurais em GLSL: mova, gire e escale transformando o ponto, repita blocos com fract, floor e mod, e dê a cada bloco uma variação aleatória.",
  },
  color: {
    en: "Colour in shaders: cosine palettes, HSV hue and saturation, mixing in linear light vs sRGB, and the common blend modes in one line of GLSL each.",
    pt: "Cor em shaders: paletas de cosseno, matiz e saturação em HSV, misturar em luz linear vs sRGB, e os modos de mesclagem comuns em uma linha de GLSL cada.",
  },
  noise: {
    en: "Noise in GLSL from scratch: sin and PCG hashes, value, Perlin, simplex and Worley noise, fBm without aliasing, domain warping and tileable noise.",
    pt: "Ruído em GLSL do zero: hashes com sin e PCG, ruído de valor, Perlin, simplex e Worley, fBm sem aliasing, domain warping e ruído que repete sem emenda.",
  },
  texturing: {
    en: "GLSL texturing tricks: texture vs textureLod vs textureGrad vs texelFetch, noise distortion, scrolling layers, and triplanar mapping without UVs.",
    pt: "Truques de textura em GLSL: texture vs textureLod vs textureGrad vs texelFetch, distorção com ruído, camadas rolando e mapeamento triplanar sem UVs.",
  },
  water: {
    en: "Water shader in GLSL: sums of sines and their normals, Gerstner waves, ripples, foam and rain, and Fresnel-mixed reflection and refraction.",
    pt: "Shader de água em GLSL: somas de senos e suas normais, ondas de Gerstner, ondulações, espuma e chuva, e reflexo e refração misturados por Fresnel.",
  },
  ocean: {
    en: "FFT ocean waves: the sea as a wind-driven spectrum, generating and animating an ocean tile, the fast Fourier transform, cascades, and lingering foam.",
    pt: "Oceano com FFT: o mar como um espectro gerado pelo vento, gerar e animar um bloco de oceano, a transformada rápida de Fourier, cascatas e espuma persistente.",
  },
  underwater: {
    en: "Underwater rendering: Snell's window, water as an absorbing and scattering medium, ray marching through it, and volumetric light shafts.",
    pt: "Renderização subaquática: a janela de Snell, a água como meio que absorve e espalha luz, ray marching pela água e feixes de luz volumétricos.",
  },
  pool: {
    en: "Interactive pool in WebGL: a height-field wave equation in a texture, a floating ball that pushes water, caustics from a mesh, and drawing the pool.",
    pt: "Piscina interativa em WebGL: equação da onda num height field em textura, uma bola que flutua e empurra a água, cáusticas a partir de malha e o desenho final.",
  },
  river: {
    en: "Flow maps for rivers and lakes: why scrolling a texture fails, two-phase flow mapping, making a flow map, shading moving water, planar reflections.",
    pt: "Flow maps para rios e lagos: por que rolar a textura falha, flow map em duas fases, como criar o mapa, sombrear a água em movimento e reflexos planares.",
  },
  glass: {
    en: "Glass shader: refract() from Snell's law, total internal reflection, Fresnel, dispersion, coloured absorption, and clear, frosted or stained glass.",
    pt: "Shader de vidro: refract() a partir da lei de Snell, reflexão total interna, Fresnel, dispersão, absorção colorida e vidro liso, fosco ou vitral.",
  },
  "gems-bubbles": {
    en: "Diamond and soap-bubble shaders: why a brilliant cut sparkles, tracing a gem as planes, spectral fire, and thin-film interference colours.",
    pt: "Shaders de diamante e bolha de sabão: por que a lapidação brilhante cintila, traçar a gema como planos, fogo espectral e cores de interferência em filme fino.",
  },
  fog: {
    en: "Fog in shaders: where linear, exponential and squared exponential fog come from, height fog near the ground, and tinting the fog toward the sun.",
    pt: "Neblina em shaders: de onde vêm a neblina linear, exponencial e exponencial ao quadrado, neblina de altura junto ao chão e tingir a neblina na direção do sol.",
  },
  snow: {
    en: "Procedural snow in GLSL: six-armed snowflakes by folding the plane, falling snow from hashed cells, footprints that persist, blizzards, settled snow.",
    pt: "Neve procedural em GLSL: flocos de seis braços dobrando o plano, neve caindo de células com hash, pegadas que ficam, nevascas e neve acumulada.",
  },
  fire: {
    en: "Fire and smoke shaders: why flames are yellow or blue, blackbody colour from Planck's law, a flickering flame from noise, and volumetric smoke.",
    pt: "Shaders de fogo e fumaça: por que a chama é amarela ou azul, cor de corpo negro pela lei de Planck, chama tremulando com ruído e fumaça volumétrica.",
  },
  "rain-glass": {
    en: "Rain on a window shader: why drops stick then slide, each drop as a lens, sliding drops and trails from hashed cells, and fogged glass you can wipe.",
    pt: "Shader de chuva no vidro: por que as gotas grudam e depois escorrem, cada gota como lente, gotas e rastros com células hash e vidro embaçado que se limpa.",
  },
  shatter: {
    en: "Cracks and shattering glass: why glass is weak (Griffith), tempered vs window glass, spiderweb cracks from Voronoi cells, and animating shards.",
    pt: "Rachaduras e vidro estilhaçado: por que o vidro é frágil (Griffith), vidro temperado vs comum, rachaduras em teia com Voronoi e animação dos cacos.",
  },
  stylized: {
    en: "Stylized shaders: toon shading with outlines, a noise dissolve effect with a glowing edge, and a hologram from Fresnel, scanlines and flicker.",
    pt: "Shaders estilizados: toon shading com contorno, efeito de dissolver com ruído e borda brilhante, e holograma com Fresnel, scanlines e tremulação.",
  },
  raymarching: {
    en: "Raymarching in GLSL: a camera ray per pixel, sphere tracing through distance fields, 3D SDF scenes, normals, soft shadows and ambient occlusion.",
    pt: "Raymarching em GLSL: um raio de câmera por pixel, sphere tracing em campos de distância, cenas 3D com SDF, normais, sombras suaves e oclusão ambiente.",
  },
  "black-hole": {
    en: "Black hole shader: tracing bent light backwards, the photon sphere and shadow, the accretion disk, Doppler beaming and gravitational redshift.",
    pt: "Shader de buraco negro: traçar a luz curvada de trás para frente, esfera de fótons e sombra, disco de acreção, Doppler beaming e redshift gravitacional.",
  },
  raytracing: {
    en: "Ray tracing in a shader: ray–sphere and ray–plane intersection, the nearest hit, shadow rays, and Whitted-style reflection and refraction.",
    pt: "Ray tracing num shader: interseção raio–esfera e raio–plano, o acerto mais próximo, raios de sombra e reflexão e refração no estilo Whitted.",
  },
  pathtracing: {
    en: "Path tracing explained: the rendering equation term by term, Monte Carlo integration with random samples, and averaging paths into an image.",
    pt: "Path tracing explicado: a equação de renderização termo a termo, integração de Monte Carlo com amostras aleatórias e a média dos caminhos na imagem.",
  },
  "rt-accel": {
    en: "Ray tracing acceleration: bounding volume hierarchies (BVH), the ray–box slab test, how denoisers clean up few samples, and RT hardware.",
    pt: "Aceleração de ray tracing: hierarquias de volumes envolventes (BVH), o teste de slabs raio–caixa, como denoisers limpam poucas amostras e hardware de RT.",
  },
  shaderclass: {
    en: "A Shader class in C++ for OpenGL: load GLSL from files, compile and link with error reporting, set uniforms, and hot-reload shaders while running.",
    pt: "Uma classe Shader em C++ para OpenGL: carregue GLSL de arquivos, compile e linke mostrando erros, defina uniforms e recarregue shaders em execução.",
  },
};

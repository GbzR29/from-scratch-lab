// src/lib/tracks/gamedev/descriptions.ts
// What search results show under each Game Dev lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const gamedevDescriptions: LessonDescriptions = {
  "game-loop": {
    en: "The game loop and fixed timestep: delta time, a fixed physics step with an accumulator, interpolating for smooth drawing, and the spiral of death.",
    pt: "O game loop e o passo fixo: delta time, física em passo fixo com acumulador, interpolação para desenhar suave e a espiral da morte.",
  },
  easing: {
    en: "Lerp, easing functions and tweening for games: remapping ranges, ease-in and ease-out curves, tweens, and frame-rate independent smooth following.",
    pt: "Lerp, funções de easing e tweening para jogos: remapear intervalos, curvas ease-in e ease-out, tweens e seguir um alvo suave em qualquer frame rate.",
  },
  springs: {
    en: "Damped springs in games: Hooke's law with damping, tuning by frequency and damping ratio, stable stepping in code, and trauma-based screen shake.",
    pt: "Molas amortecidas em jogos: lei de Hooke com amortecimento, ajuste por frequência e razão de amortecimento, passo estável no código e screen shake com trauma.",
  },
  random: {
    en: "Randomness in games: PRNGs and seeds, determinism, stateless hashing from coordinates, weighted choices, and scattering objects with blue noise.",
    pt: "Aleatoriedade em jogos: PRNGs e sementes, determinismo, hash sem estado a partir de coordenadas, escolhas ponderadas e espalhar objetos com blue noise.",
  },
  perlin: {
    en: "Perlin noise explained step by step: value noise, gradient noise, fractal octaves for terrain, simplex noise, and which noise to use in a game.",
    pt: "Ruído de Perlin explicado passo a passo: value noise, ruído de gradiente, oitavas fractais para terreno, simplex noise e qual ruído usar num jogo.",
  },
  collision: {
    en: "2D collision detection: circle vs circle, AABB vs AABB, circle vs box, contact normal and depth, pushing objects apart, and tunnelling.",
    pt: "Detecção de colisão 2D: círculo vs círculo, AABB vs AABB, círculo vs caixa, normal e profundidade do contato, separar objetos e tunelamento.",
  },
  sat: {
    en: "The separating axis theorem (SAT) for collision: convex shapes, testing polygon overlap axis by axis, and the minimum translation vector.",
    pt: "Teorema do eixo separador (SAT) para colisões: formas convexas, testar a sobreposição de polígonos eixo a eixo e o vetor mínimo de translação.",
  },
  integration: {
    en: "Physics integrators for games: explicit Euler and why it gains energy, semi-implicit Euler, Verlet, RK4, and choosing a stable step size.",
    pt: "Integradores de física para jogos: Euler explícito e por que ganha energia, Euler semi-implícito, Verlet, RK4 e como escolher um passo estável.",
  },
  "collision-response": {
    en: "Collision response with impulses: conserving momentum, restitution, friction, positional correction, and sequential impulses for stable stacks.",
    pt: "Resposta a colisões com impulsos: conservar o momento, restituição, atrito, correção de posição e impulsos sequenciais para pilhas estáveis.",
  },
  "rigid-body": {
    en: "2D rigid body physics: position, angle and spin, torque from off-centre forces, impulses at a contact point, box-box contacts, and tuning.",
    pt: "Física de corpo rígido 2D: posição, ângulo e giro, torque de forças fora do centro, impulso num ponto de contato, contato entre caixas e ajustes.",
  },
  platformer: {
    en: "Platformer game feel: kinematic character control, designing a jump from height and time, coyote time, jump buffering, and other fairness tricks.",
    pt: "A sensação de um jogo de plataforma: controle cinemático do personagem, projetar o pulo por altura e tempo, coyote time, jump buffering e outros truques.",
  },
  "object-pool": {
    en: "Object pools in games: the cost of creating objects mid-game, a pool with a free list, generational handles against dangling references, pool size.",
    pt: "Object pools em jogos: o custo de criar objetos durante o jogo, pool com lista livre, handles com geração contra referências soltas e tamanho do pool.",
  },
};

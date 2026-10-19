// PT text for the cracks & shattering widgets (figures/shatter). Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  // ── FlawFigure (2026-10-19) ──
  figFlaw_title: "Por onde a carga passa em volta de um defeito",
  figFlaw_hole: "furo redondo",
  figFlaw_slot: "fenda",
  figFlaw_crack: "trinca afiada",
  figFlaw_a: "meio comprimento a",
  figFlaw_ba: "altura / comprimento b/a",
  figFlaw_note: "A placa é puxada para cima e para baixo (setas). Longe do defeito a carga se espalha por igual, então as linhas são retas e igualmente espaçadas. O defeito não carrega nada, então a carga precisa se espremer em volta das pontas dele, e as linhas se amontoam ali; a cor mostra quanto. Um furo redondo só triplica a tensão. Deixe-o comprido e fino e o aperto nas pontas explode: esse número é o de Inglis, a resposta elástica exata. As linhas em si são uma imagem, desenhadas como um fluido escoando em volta da mesma forma.",

  // ── CrackFigure (2026-10-19) ──
  figCrack_title: "Uma placa que trinca",
  figCrack_view_glass: "vidro",
  figCrack_view_shards: "cacos",
  figCrack_view_grid: "grade deformada",
  figCrack_kind_annealed: "vidro de janela",
  figCrack_kind_tempered: "vidro temperado",
  figCrack_radial: "trincas radiais N",
  figCrack_rings: "anéis por fator e, S",
  figCrack_keep: "anéis que quebram",
  figCrack_speed: "velocidade da trinca (lenta)",
  figCrack_lens: "inclinação dos cacos",
  figCrack_again: "quebrar de novo",
  figCrack_new: "placa nova",
  figCrack_vGlass: "Clique ou toque em qualquer ponto da janela para jogar uma pedra ali. Cada pedaço fica um pouco inclinado, então mostra o jardim deslocado e pega a luz no seu próprio ângulo; as bordas quebradas brilham num verde claro, porque ali você olha ao longo do vidro em vez de através dele.",
  figCrack_vShards: "Uma cor por célula de Voronoi; as linhas pretas são as bordas que quebraram. Onde duas cores se encontram sem linha, as células ainda são um pedaço só de vidro. No vidro de janela as trincas radiais correm primeiro e dividem a placa em cunhas compridas; os anéis vêm depois e cortam só algumas delas. O vidro temperado quebra em todas as bordas, em milhares de cubinhos rombudos.",
  figCrack_vGrid: "O espaço em que o Voronoi é calculado. Para o vidro de janela a grade azul é quadrada em q = (S·ln r, N·θ/2π); na placa as suas células são cunhas que alargam com a distância. Os pontos amarelos são as sementes, as linhas brancas todas as bordas de célula, quebradas ou não.",
  figCrack_note: "Nada é simulado: cada trinca é a borda entre duas células de Voronoi, e se ela já quebrou é uma comparação com a frente da trinca v·t. A frente aqui está cerca de um milhão de vezes mais lenta; no vidro de verdade ela corre a uns 1500 m/s e a imagem inteira acaba em menos de um milissegundo.",

  // ── ShatterFigure (2026-10-19) ──
  figShatter_title: "Uma placa que se estilhaça",
  figShatter_view_glass: "vidro",
  figShatter_view_ids: "ids dos cacos",
  figShatter_view_texture: "a textura",
  figShatter_mode_closed: "fórmula fechada",
  figShatter_mode_baked: "textura gravada (VAT)",
  figShatter_push: "empurrão da pedra",
  figShatter_slow: "câmera lenta",
  figShatter_again: "jogar de novo",
  figShatter_mend: "placa inteira",
  figShatter_edges: "faces de fratura verdes",
  figShatter_nClosed: "O centro de cada caco é c₀ + v·t + ½g·t², e ele gira a uma taxa constante em torno de um eixo fixo: algumas linhas no vertex shader, sem memória, qualquer número de cacos. Mas a fórmula não sabe nada do chão: os cacos afundam direto através dele (são cortados onde passam por baixo).",
  figShatter_nBaked: "O mesmo começo, mas desta vez uma pequena simulação de corpos rígidos rodou uma vez, quando a pedra acertou, e escreveu o centro e a rotação de cada caco por 150 quadros numa textura de floats. Os cacos quicam, escorregam e assentam no chão; o vertex shader só lê dois quadros e os mistura. O preço: o movimento é fixo, e a memória cresce com cacos × quadros.",
  figShatter_nTexture: "A textura gravada, como uma imagem. Cada coluna é um caco, cada linha um quadro, com o tempo correndo para baixo; a linha branca é o quadro sendo tocado. Metade esquerda: o deslocamento do centro desde o quadro 0 como uma cor (x, y, z → vermelho, verde, azul). Metade direita: o quatérnio da orientação. Onde uma coluna para de mudar, aquele caco parou.",
  figShatter_noteMouse: "Clique na placa para jogar uma pedra ali; arraste para orbitar, role para dar zoom. ",
  figShatter_noteTouch: "Toque na placa para jogar uma pedra ali; arraste para orbitar, faça pinça para dar zoom. ",
  figShatter_note: "A placa é cortada em cacos de Voronoi antes de qualquer coisa acontecer, amontoados em volta da pedra. Todos eles são uma malha só desenhada numa chamada só: cada vértice carrega o número do seu caco, e o vertex shader move o caco inteiro. Os cacos atravessam uns aos outros, como nos efeitos mais baratos dos jogos; a soltura é atrasada com a distância da pedra para o olho conseguir acompanhar.",
};

export default text;

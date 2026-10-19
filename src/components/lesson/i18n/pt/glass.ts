// PT text for the glass widgets. Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  figWin_n0: "Limpe o vidro embaçado com o ponteiro (arraste); ele embaça de novo aos poucos. Através de uma gota a rua fica nítida e curvada: cada gota é uma lentezinha que também limpou seu próprio pedaço de condensação.",
  figWin_n1: "A máscara de gotas c: gotas paradas, gotas escorrendo e as gotículas que elas deixam, a partir de três camadas de células de grade.",
  figWin_n2: "O gradiente de c (x → vermelho, y → verde). É o deslocamento usado para ler o fundo, então a forma da gota decide como ela curva a imagem.",
  figWin_n3: "Rastros: as faixas que uma gota escorrendo varreu. Elas limpam a condensação, exatamente como gotas reais fazem.",
  figWin_n4: "A condensação que sobra: a máscara limpa vezes a quantidade de embaçamento, menos os rastros. Ela escolhe o quão borrado o fundo fica em cada pixel.",
  figWin_title: "Laboratório de Janela — Chuva, Embaçado e Geada no Vidro",
  figWin_refog: "embaçar de novo",
  figWater_view: "visão",
  figWin_credit: "Técnica de chuva baseada em Martijn Steinrucken (BigWIngs), “Heartfelt”, Shadertoy 2017.",

  // ── GlassRayFigure (2026-10-18) ──
  figGlRay_title: "Raios no vidro, um refract() de cada vez",
  figGlRay_white: "luz branca",
  figGlRay_refl: "reflexos",
  figGlRay_slab: "placa",
  figGlRay_prism: "prisma",
  figGlRay_ball: "bola",
  figGlRay_fibre: "fibra",
  figGlRay_tirCount: "reflexões internas totais",
  figGlRay_exag: "leque de cores desenhado 4× mais largo",
  figGlRay_side: "lado",
  figGlRay_normal: "normal passada",
  figGlRay_result: "resultado",
  figGlRay_enter: "entra",
  figGlRay_leave: "sai",
  figGlRay_nOut: "N (para fora)",
  figGlRay_nIn: "−N (invertida)",
  figGlRay_tir: "k < 0: reflect()",
  figGlRay_miss: "o laser não acerta o vidro: mire na forma",
  figGlRay_air: "ar",
  figGlRay_glass: "vidro",
  figGlRay_note: "Arraste o laser para movê-lo e a sua alcinha redonda para mirar. A tabela segue o caminho mais forte. Cada vez que o raio entra, a normal passada para refract() é a de fora (seta azul) e η = 1/n. Cada vez que ele sai, a normal é invertida para ficar voltada para o raio (seta laranja) e η = n. Só a saída pode deixar k negativo. Experimente cada forma. A placa: o raio sai paralelo a como entrou, só deslocado. O prisma: ligue a luz branca e as cores se abrem em leque, porque o violeta enxerga um n um pouco maior. A bola é exatamente o shader da bola de vidro mais abaixo: duas refrações. A fibra: o raio bate nas paredes em ângulos rasantes, todo acerto tem k < 0, e a luz fica presa e é levada pela curva. Abaixe n até θc passar do ângulo de batida e veja a luz escapar.",

  // ── AbsorptionFigure (2026-10-18) ──
  figAbs_title: "Beer–Lambert: cor a partir da espessura",
  figAbs_bottle: "vidro de garrafa",
  figAbs_cobalt: "vidro cobalto",
  figAbs_amber: "vidro âmbar",
  figAbs_water: "água limpa",
  figAbs_density: "densidade ×",
  figAbs_half: "cai à metade a cada",
  figAbs_side: "vista de lado: a espessura cresce para a direita",
  figAbs_seen: "olhando através dele para uma luz branca",
  figAbs_swatch: "cor no cursor",
  figAbs_axis: "espessura d",
  figAbs_note: "Arraste pela cunha ou pelo gráfico. Todo canal perde a mesma fração a cada unidade extra de espessura, então cada curva é uma exponencial e cada canal cai à metade depois da sua própria distância ln 2 / σ. A cor que você vê são os três sobreviventes multiplicados pelo branco atrás do vidro. Vidro fino é quase transparente; vidro grosso mostra a cor do canal menos absorvido. É por isso que a borda de uma vidraça, onde a luz atravessa a largura inteira, é verde mesmo que a vidraça pareça incolor de frente. Escolha a água e desça fundo: o vermelho some depois de poucos metros, o verde depois de dezenas, e o que sobra é azul.",
};

export default text;

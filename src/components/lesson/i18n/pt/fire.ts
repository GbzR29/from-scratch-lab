// PT text for the fire and smoke widgets (figures/fire). Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  // ── BlackbodyFigure (2026-10-19) ──
  figBB_title: "A cor das coisas quentes",
  figBB_p_embers: "brasas apagando",
  figBB_p_candle: "fuligem da vela",
  figBB_p_bulb: "lâmpada de filamento",
  figBB_p_sun: "o Sol",
  figBB_p_star: "estrela azul",
  figBB_T: "temperatura T",
  figBB_visible: "visível",
  figBB_power: "potência vs vela",
  figBB_axis: "comprimento de onda (nm)",
  figBB_band: "visível",
  figBB_note: "A curva está escalada pelo próprio pico, então você vê a forma dela, não o tamanho: a altura de verdade cresce como T⁴. A 950 K o pico fica perto de 3000 nm, bem no infravermelho, e só a ponta fraca que chega a 700 nm é visível: um brilho vermelho apagado. A 1850 K, a fuligem de uma vela, menos de meio por cento da luz é visível, laranja-amarelada; o resto é o calor que você sente na mão. O pico do Sol fica dentro da faixa visível, e a curva é tão larga que todas as cores estão presentes: branco. Só acima de uns 7000 K o azul ganha.",

  // ── FlameFigure (2026-10-19) ──
  figFlame_title: "Uma chama a partir de um campo de temperatura",
  figFlame_m_candle: "vela",
  figFlame_m_campfire: "fogueira",
  figFlame_m_gas: "boca de gás",
  figFlame_temp: "temperatura",
  figFlame_T: "fuligem mais quente",
  figFlame_soot: "fuligem",
  figFlame_turb: "turbulência",
  figFlame_wind: "corrente de ar",
  figFlame_exp: "exposição",
  figFlame_pause: "pausar",
  figFlame_play: "tocar",
  figFlame_puff: "pulsação",
  figFlame_mCandle: "A cera derrete, sobe pelo pavio e evapora; o vapor queima onde encontra o ar, na borda da chama. Dentro, logo acima do pavio, há um núcleo mais escuro de vapor que ainda não encontrou ar. A fuligem se forma dentro da chama e brilha a uns 1850 K enquanto sobe, que é o amarelo; na ponta ela queima e some. A borda azul fininha embaixo é onde o ar chega ao combustível antes de a fuligem conseguir se formar.",
  figFlame_mCampfire: "O gás da madeira queima mais frio e muito mais turbulento: uns 1300–1500 K, então a luz é laranja-escura e umas 30 vezes mais fraca por centímetro quadrado que a de uma vela, por isso a exposição é tão alta. Um fogo largo assim também respira: chamas grandes pulsam a mais ou menos f ≈ 1,5/√D Hz, aqui 1,7 Hz para uma fogueira de 0,8 m. As rachaduras das toras brilham a 1100–1300 K, vermelho apagado.",
  figFlame_mGas: "O gás e o ar se misturam antes de queimar (uma chama pré-misturada), então há oxigênio em toda parte e a fuligem nunca tem chance de se formar. Quase nenhuma luz de corpo negro: o azul vem de moléculas de CH e C₂ que ficam excitadas pelas reações e emitem luz nos seus próprios comprimentos de onda, 431 nm e 516 nm. Feche a entrada de ar de um bico (aumente a fuligem) e a chama fica preguiçosa e amarela.",
  figFlame_note: "Leve a fuligem mais quente para perto de 3000 K e a chama vai de laranja para branco-amarelado e fica muito mais brilhante: baixe a exposição para mantê-la na tela. A mesma função desenha as três; só mudam a forma, a velocidade do ruído e a quantidade de fuligem. Em \"temperatura\" as cores são um mapa, não luz: uma linha a cada 250 K.",

  // ── SmokeFigure (2026-10-19) ──
  figSmoke_title: "Fumaça como volume",
  figSmoke_view_smoke: "fumaça",
  figSmoke_view_flat: "sem sombra própria",
  figSmoke_view_trans: "transmitância",
  figSmoke_density: "σt mais grosso",
  figSmoke_albedo: "albedo σs/σt",
  figSmoke_wind: "vento",
  figSmoke_sun: "altura do sol",
  figSmoke_pause: "pausar",
  figSmoke_play: "tocar",
  figSmoke_fire: "fogo",
  figSmoke_soot: "fuligem",
  figSmoke_steam: "vapor",
  figSmoke_vSmoke: "Cada pixel atravessa a fumaça em 72 passos. Em cada passo ele pergunta quanta luz do sol chega ali, com mais seis passos em direção ao sol, então o lado de lá da pluma fica na própria sombra. Baixe o albedo para perto de 0,3 para a fumaça cheia de fuligem de um fogo abafado: ela absorve a maior parte da luz e fica cinza-escura. Suba para 0,99 para vapor branco.",
  figSmoke_vFlat: "A mesma fumaça sem a marcha em direção ao sol: cada ponto é iluminado como se nada estivesse entre ele e o sol. A pluma fica chapada e parece pintada, sem lado claro nem lado na sombra. Essa segunda marcha é o que faz um volume parecer redondo, e é a maior parte do custo.",
  figSmoke_vTrans: "1 − T: branco onde a fumaça esconde tudo o que está atrás, preto onde não esconde nada. Perto do fogo, onde a pluma é estreita, a fumaça é densa; mais para cima a mesma fumaça se espalhou por mais área e fica rala, como 1/r².",
  figSmoke_noteMouse: "Arraste para girar a câmera, role para dar zoom. ",
  figSmoke_noteTouch: "Arraste para girar a câmera, faça pinça para dar zoom. ",
  figSmoke_note: "Gire para olhar em direção ao sol: a fumaça rala iluminada por trás brilha nas bordas, e a fumaça grossa vira uma silhueta escura. A pluma se alarga enquanto sobe, uns 12 cm a cada metro, porque o gás subindo arrasta para dentro o ar parado em volta; a mesma fumaça espalhada por mais área fica mais rala.",
};

export default text;

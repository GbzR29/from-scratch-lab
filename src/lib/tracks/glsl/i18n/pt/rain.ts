// PT text for src/lib/tracks/glsl/chapters/effects/rain.tsx (+ its live formulas). Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  glslRain_intro2: "Uma janela com chuva é uma das imagens mais reconhecíveis do cinema e dos jogos, e quase tudo nela é um pedacinho de física: gotas que se agarram ao vidro até de repente ficarem pesadas o bastante para escorrer, caminhos que serpenteiam e seguem uns aos outros, uma rua inteira de cabeça para baixo dentro de cada gota, e o embaçado do lado de dentro do vidro que uma mão consegue limpar. Este capítulo explica essa física e depois monta o efeito com as ferramentas dos últimos capítulos: células com hash, um campo de alturas, refração e mipmaps.",
  glslRain_goal0: "Calcular quando uma gota numa janela começa a escorrer, e por que ela escorre aos trancos.",
  glslRain_goal1: "Explicar por que cada gota mostra uma imagem de cabeça para baixo, e fingir essa refração a partir da inclinação de um campo de alturas.",
  glslRain_goal2: "Construir gotas escorrendo, rastros e gotinhas paradas a partir de células com hash.",
  glslRain_goal3: "Embaçar o vidro com o desfoque dos mipmaps e deixar o leitor limpá-lo com uma textura que volta a embaçar devagar.",

  // ── Why drops stick ──
  glslRain_stickTitle: "Por que as gotas grudam, e depois escorrem",
  glslRain_stickBody: "A superfície da água age como uma pele esticada: criar mais dela custa energia, uma quantidade por área chamada tensão superficial γ (0,072 N/m para a água). Uma gota no vidro o encontra num ângulo de contato θ. Num vidro perfeitamente limpo e liso, uma gota escorreria com a menor inclinação. O vidro de verdade tem poeira e arranhões microscópicos que prendem a borda da gota, então o ângulo pode variar dentro de uma faixa: uma gota prestes a avançar mostra um ângulo grande θA na frente, e a parte de trás, prestes a recuar, mostra um ângulo menor θR. Essa diferença, a histerese do ângulo de contato, é o que segura uma gota parada numa janela vertical:",
  glslRain_slideDer: "Quão grande uma gota precisa ser para escorrer",
  glslRain_wR: "o raio da gota, visto no vidro",
  glslRain_wAlpha: "a inclinação do vidro: 90° para uma janela",
  glslRain_wGamma: "tensão superficial da água, 0,072 N/m",
  glslRain_wTheta: "os ângulos de contato de avanço e de recuo, na frente e atrás da gota",
  glslRain_wRho: "a densidade da água, 1000 kg/m³, e a gravidade, 9,81 m/s²",
  glslRain_s1: "o puxão da gravidade ao longo do vidro, para uma gota com o formato mais ou menos de meia bola: volume (2/3)πr³",
  glslRain_s2: "a tensão superficial puxa ao longo da borda da gota. Numa gota de largura w, a parte de trás puxa com γ·cos θR e a da frente com γ·cos θA; a diferença a segura no lugar",
  glslRain_s3: "o peso cresce como r³, a força que segura só como r, então toda gota escorre quando fica grande o bastante. Iguale as duas e resolva para r",
  glslRain_s4: "para vidro de janela comum: gotas com menos de uns 3–4 mm de largura ficam onde caíram, as maiores escorrem. É o tamanho das gotas que você vê correndo numa janela",
  glslRain_liveSlide: "Experimente: quando ela escorre?",
  glslRain_liveSlideNote: "Incline a janela para trás (baixe α): as gotas precisam crescer mais antes de escorrer. Aproxime θR de θA, como faz um repelente de água no para-brisa de um carro: a histerese quase some e até gotas pequenas rolam embora.",
  glslRain_liveSlides: "qualquer gota escorre",
  glslRain_wanderBody: "Depois que começa a andar, a gota não desliza. A frente dela engancha no próximo grão de sujeira, ela para, a parte de trás alcança, e ela dá um tranco para a frente: o stick-slip, que é por que as gotas numa janela andam aos trancos. Quando ela encosta numa gota menor, engole a outra, fica mais pesada e acelera. E ela prefere seguir um caminho que outra gota já molhou, porque no vidro molhado o ângulo de recuo é pequeno e pouca coisa a segura. Então as gotas correm pelos mesmos trilhos tortos de novo e de novo, deixando linhas de gotinhas onde o rastro se quebrou atrás delas.",

  // ── Every drop is a lens ──
  glslRain_lensTitle: "Cada gota é uma lente",
  glslRain_lensBody: "Uma gota no vidro é plana de um lado e curva do outro: uma lente plano-convexa, e muito forte, porque é muito pequena. A equação dos fabricantes de lentes dá a distância focal a partir do raio de curvatura da superfície:",
  glslRain_lensLabel: "A distância focal de uma gota",
  glslRain_wF: "a distância focal: onde a luz vinda de longe se junta num ponto",
  glslRain_wRc: "o raio de curvatura da superfície da gota",
  glslRain_wN: "o índice de refração da água, 1,33",
  glslRain_lensWords: "Para a água, f é umas três vezes o raio de curvatura: alguns milímetros para uma gota de chuva. Tudo do lado de fora da janela está a milhares de distâncias focais, então cada gota forma uma imagem minúscula, nítida e de cabeça para baixo da rua. Olhe de perto uma janela com chuva e cada gota guarda a cena, invertida.",
  glslRain_prismBody: "Um shader não precisa traçar a lente. Pense na gota como muitos prismas minúsculos, cada um inclinado como a superfície da gota naquele ponto. Um prisma fino de ângulo A desvia a luz em mais ou menos (n − 1)·A, e para uma superfície com inclinação s o ângulo é quase s. Então a refração vira um deslocamento: leia o fundo um pouco longe do pixel, numa quantidade proporcional à inclinação da superfície ali. No centro da gota a inclinação é zero e nada se mexe; em direção à borda a inclinação cresce, o deslocamento cresce, e passando do meio o pixel está lendo o lado oposto da cena: a imagem vira.",
  glslRain_dropHTitle: "Gotas como campo de alturas",
  glslRain_dropHBody: "Uma gota é modelada como as marolas da água: um escalar c(uv) que é 0 no vidro seco e sobe em direção a 1 dentro de uma gota, uma aproximação grosseira da espessura da gota. A inclinação dele é estimada a partir de duas avaliações extras a um passinho de distância, e o fundo é lido deslocado por essa inclinação. A mesma inclinação também dá a normal para a iluminação, então um único campo de alturas comanda tudo:",
  glslRain_offLabel: "Deslocamento de refração a partir do campo de gotas",
  glslRain_wGrad: "diferenças finitas com ε = 0,001, e é por isso que drops() roda três vezes por pixel",
  glslRain_wK: "o slider de refração: quão fortemente uma inclinação curva a vista. Representa (n − 1) × a distância até a cena, juntados num número só",

  // ── Drops from cells ──
  glslRain_cellsTitle: "Gotas a partir de células com hash",
  glslRain_cellsBody2: "A técnica aqui segue a janela com chuva em tempo real mais conhecida, o Shadertoy “Heartfelt”, de Martijn Steinrucken (BigWIngs). Como nas estrelas e na neve caindo, nenhuma gota é guardada. O vidro é cortado em células, 6 vezes mais altas que largas porque as gotas escorrem na vertical, e cada célula faz o hash do seu id em três números aleatórios n = (n.x, n.y, n.z). n.x posiciona a gota na horizontal, n.z dá a ela o seu próprio relógio e balanço, e cada coluna de células é deslocada por uma quantidade aleatória para que as linhas nunca se alinhem. Três camadas são somadas: gotinhas paradas numa grade de 40 células e duas camadas de gotas que escorrem, a segunda com 1,85× a escala para variar os tamanhos.",
  glslRain_sawLabel: "Grudar e depois escorrer: o dente de serra",
  glslRain_wSaw: "sobe suavemente enquanto t vai de 0 a b = 0,85 e depois cai de volta a 0 nos 15% restantes. Uma subida lenta e uma queda repentina",
  glslRain_wY: "a altura da gota dentro da sua célula. A grade inteira rola para baixo a uma velocidade constante enquanto a gota sobe dentro dela quase na mesma velocidade, então na tela a gota mal se arrasta. Quando o dente de serra cai, a gota salta para baixo na sua célula: o stick-slip calculado acima, segura pela histerese até se soltar",
  glslRain_wX: "a posição horizontal: n.x − ½ mais um balanço sin(y + sin y), cuja amplitude diminui perto das laterais da célula para a gota nunca sair da sua coluna",
  glslRain_trailBody2: "O rastro é uma faixa vertical acima da gota. Ele é estreito onde a gota acabou de passar e mais estreito ainda mais acima, já que r diminui com a altura. Ao longo dele, um padrão repetido fract(10·v) posiciona gotinhas deixadas para trás, e é por isso que um rastro de verdade parece um colar de contas. O rastro tem pouca água, mas marca onde o vidro foi limpo, então tira o embaçado. As gotas paradas usam o mesmo dente de serra com b = 0,025: elas aparecem quase instantaneamente (uma gota de chuva batendo) e evaporam ao longo do resto do ciclo. Por fim, as camadas são somadas e passadas por smoothstep(0,3, 1, c). Isso funde gotas vizinhas numa superfície suave, do jeito que gotas de água que se tocam se juntam.",

  // ── Fog on the glass ──
  glslRain_fogTitle: "O embaçado no vidro",
  glslRain_fogBody: "O ar quente e úmido dentro de um carro ou de um quarto embaça a janela quando o vidro está mais frio que o ponto de orvalho do ar: a temperatura em que esse ar não consegue mais segurar o seu vapor d'água. O vapor condensa em gotículas de alguns micrômetros, pequenas demais para ver uma por uma mas numerosas o bastante para espalhar a luz em todas as direções, então a rua atrás vira um brilho borrado. O ponto de orvalho sai da temperatura e da umidade relativa do ar pela fórmula de Magnus:",
  glslRain_liveDew: "Experimente: quando a janela embaça?",
  glslRain_liveDewNote: "Um quarto a 20 °C e 60% de umidade tem ponto de orvalho de 12 °C: qualquer vidro mais frio que isso embaça. Respire dentro de um carro frio e a umidade dispara; o ponto de orvalho passa da temperatura do para-brisa, e ele embaça em segundos.",
  glslRain_mipBody2: "Borrar o fundo inteiro a cada quadro seria caro, mas há um desfoque de graça à mão: os mipmaps. A rua é desenhada uma vez numa textura, e a GPU monta a cadeia de cópias com metade do tamanho, cada uma uma média em caixa da anterior. Ler um nível alto dessa cadeia dá um desfoque suave pelo custo de uma consulta de textura. O vidro embaçado lê um nível borrado e soma um véu claro (o embaçado também espalha a luz do quarto de volta para você); onde uma gota ou um rastro limpou o vidro, o shader lê o nível 0, nítido:",
  glslRain_lodLabel: "Escolhendo quão borrado fica cada pixel",
  glslRain_wLod: "o nível de mip passado para textureLod. O nível L é a imagem com média de 2^L × 2^L texels, então borrar por cerca de R pixels significa ler o nível log₂R",
  glslRain_wFog: "condensação neste pixel: o slider de condensação × a máscara de limpeza × (1 − rastro), porque gotas que escorrem limpam o vidro por onde passam",
  glslRain_wC: "a máscara das gotas: dentro de uma gota o nível vai a 0, então a vista fica nítida. Uma gota é água límpida no meio da névoa",
  glslRain_lodNote: "Mipmaps dão desfoque variável de graça, mas em forma de caixa: uma luz forte vira um quadrado. Seis amostras extras em volta de um círculo, no mesmo nível, o arredondam num bokeh de verdade.",
  glslRain_wipeBody2: "Limpar funciona como as pegadas na neve: uma texturinha (192×108) lembra quão limpo está cada pedaço do vidro. O ponteiro carimba discos suaves nela ao longo do segmento da posição anterior até a atual, então uma mão rápida deixa uma faixa sem falhas. A cada quadro a parte limpa encolhe por um fator e^(−k·dt), então o embaçado volta no mesmo ritmo em qualquer taxa de quadros, como a condensação faz.",
  glslRain_frostTitle: "Vidro jateado e franjas coloridas",
  glslRain_frostBody: "O vidro jateado é uma superfície áspera. Todo raio que o atravessa é refratado numa direção um pouco aleatória, e um pixel tira a média de muitos desses raios, o que é um desfoque cujo raio cresce com a aspereza. A sua forma barata é um nível de mip proporcional ao jateado, mais uma variação por pixel do deslocamento para o aspecto granulado do vidro gravado. A dispersão reaproveita o deslocamento da gota três vezes, com forças um pouco diferentes para vermelho, verde e azul (1 ± 0,3k), então luzes fortes vistas através de uma gota ganham franjas coloridas, o mesmo truque das três chamadas de refract() no capítulo do vidro.",
  glslRain_gameTip: "Os jogos põem o mesmo efeito na câmera em vez de numa janela: chuva respingando na lente num jogo de corrida ou numa tempestade. Ali as gotas costumam ser alguns quadros de um normal map pronto, tocados como um flipbook e aparecendo e sumindo, e a refração é o mesmo deslocamento da imagem já renderizada pela normal. A imagem invertida dentro de cada gota costuma ficar de fora; ela é pequena, mas é o que faz um close de uma janela com chuva parecer de verdade.",

  glslRain_key0: "Uma gota no vidro é segura pela histerese do ângulo de contato: ela escorre quando o peso vence γ·w·(cos θR − cos θA), o que para água no vidro dá um raio de 1–2 mm.",
  glslRain_key1: "As gotas escorrem aos trancos (stick-slip), engolem as gotas que tocam e preferem rastros já molhados, onde menos coisa as segura.",
  glslRain_key2: "Uma gota é uma lente forte, f ≈ R/(n − 1) ≈ 3R: cada luz da rua a mais de alguns milímetros forma uma pequena imagem invertida dentro dela.",
  glslRain_key3: "Num shader, a refração por uma camada fina de água é um deslocamento do fundo pela inclinação da superfície: leia a cena em uv + k·∇c.",
  glslRain_key4: "Chuva são células com hash: células altas em duas camadas para as gotas que escorrem, um dente de serra para o stick-slip delas, uma faixa acima de cada gota para o rastro, uma grade fina para as gotas paradas.",
  glslRain_key5: "A iluminação e a refração saem de um único campo de alturas, diferenciado em x e y.",
  glslRain_key6: "O vidro embaça abaixo do ponto de orvalho; vidro embaçado é o fundo lido num nível de mip borrado, nítido onde gotas, rastros e uma máscara de limpeza mandam.",
  glslRain_key7: "A máscara de limpeza é a única memória: uma texturinha que volta a embaçar por e^(−k·dt) a cada quadro, em qualquer taxa de quadros.",
};

export default text;

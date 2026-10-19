// PT text for src/lib/tracks/glsl/chapters/effects/rain.tsx (+ its live formulas). Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  glslRain_intro: "Uma janela com chuva é uma das imagens mais reconhecíveis do cinema e dos jogos, e quase tudo nela é um pedacinho de física: gotas que se agarram ao vidro até de repente ficarem pesadas o bastante para escorrer, caminhos que serpenteiam e seguem uns aos outros, uma rua inteira de cabeça para baixo dentro de cada gota, e o embaçado do lado de dentro do vidro que uma mão consegue limpar. Este capítulo constrói tudo isso com as ferramentas dos últimos capítulos: células com hash, um campo de alturas, refração, mipmaps e uma textura em ping-pong.",
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
  glslRain_shiftLabel: "A refração como um deslocamento",
  glslRain_wGrad: "a inclinação da superfície da água: quão rápido a altura h dela muda em x e em y",
  glslRain_wK: "a força da lente: (n − 1) vezes a distância até o que se vê, juntadas num número só",
  glslRain_shiftWords: "Cada pixel lê a cena atrás do vidro de um ponto deslocado contra a inclinação da água. A mesma inclinação também dá a normal para a iluminação, então um único campo de alturas comanda tudo.",

  // ── Drops from cells ──
  glslRain_cellsTitle: "Gotas a partir de células com hash",
  glslRain_cellsBody: "As gotas são feitas exatamente como a neve caindo: o vidro é cortado em células, cada célula tem no máximo uma gota, e um hash do número da célula decide tudo sobre ela. Duas camadas bastam. As gotas que escorrem moram em células altas, três vezes mais altas que largas, então cada uma tem espaço para descer pela própria coluna. As gotas paradas moram em células quadradas pequenas. As duas escrevem num único campo de alturas h, a espessura da água sobre o vidro.",
  glslRain_slipTitle: "O stick-slip numa linha",
  glslRain_slipBody: "A altura de uma gota que escorre na sua célula é uma função do tempo. Divida uma descida pela célula em cinco trechos; em cada um, a gota fica parada nos primeiros 55% e depois escorrega depressa até a próxima parada. A posição de lado é uma função ondulada da altura, a mesma função para a gota e para o rastro, então o rastro fica exatamente por onde a gota passou:",
  glslRain_trailBody: "O rastro não tem água própria (é fino demais para importar), mas marca onde o vidro foi limpo, então ele tira o embaçado e remove as gotas paradas que cruza. Ao longo dele, algumas gotinhas ficam espalhadas, uma por trechinho de altura, cada uma posta pelo seu próprio hash. O sombreamento então precisa da inclinação de h, a partir de duas avaliações extras um passinho para a direita e para cima. Para manter o shader compacto, as três avaliações ficam num laço só, então o código das gotas é compilado uma vez só.",

  // ── Fog on the glass ──
  glslRain_fogTitle: "O embaçado no vidro",
  glslRain_fogBody: "O ar quente e úmido dentro de um carro ou de um quarto embaça a janela quando o vidro está mais frio que o ponto de orvalho do ar: a temperatura em que esse ar não consegue mais segurar o seu vapor d'água. O vapor condensa em gotículas de alguns micrômetros, pequenas demais para ver uma por uma mas numerosas o bastante para espalhar a luz em todas as direções, então a rua atrás vira um brilho borrado. O ponto de orvalho sai da temperatura e da umidade relativa do ar pela fórmula de Magnus:",
  glslRain_liveDew: "Experimente: quando a janela embaça?",
  glslRain_liveDewNote: "Um quarto a 20 °C e 60% de umidade tem ponto de orvalho de 12 °C: qualquer vidro mais frio que isso embaça. Respire dentro de um carro frio e a umidade dispara; o ponto de orvalho passa da temperatura do para-brisa, e ele embaça em segundos.",
  glslRain_mipBody: "Borrar o fundo inteiro a cada quadro seria caro, mas há um desfoque de graça à mão: os mipmaps. A rua é desenhada uma vez numa textura, e a GPU monta a cadeia de cópias com metade do tamanho, cada uma uma média em caixa da anterior. Ler o nível 4 ou 5 dessa cadeia dá um desfoque suave pelo custo de uma consulta de textura. O vidro embaçado lê um nível borrado e soma um véu claro (o embaçado também espalha a luz do quarto de volta para você); onde uma gota, um rastro ou uma mão limpou o vidro, o shader lê o nível 0, nítido.",
  glslRain_wipeBody: "Limpar funciona como as pegadas na neve: uma texturinha lembra quão limpo está cada pedaço do vidro. Cada quadro a lê e a escreve de novo (ping-pong), multiplicando por e^(−k·dt) para o embaçado voltar no mesmo ritmo em qualquer taxa de quadros, e o ponteiro carimba uma faixa nela ao longo do segmento da posição anterior até a atual, então uma mão rápida deixa uma faixa sem falhas.",
  glslRain_gameTip: "Os jogos põem o mesmo efeito na câmera em vez de numa janela: chuva respingando na lente num jogo de corrida ou numa tempestade. Ali as gotas costumam ser alguns quadros de um normal map pronto, tocados como um flipbook e aparecendo e sumindo, e a refração é o mesmo deslocamento da imagem já renderizada pela normal. A imagem invertida dentro de cada gota costuma ficar de fora; ela é pequena, mas é o que faz um close de uma janela com chuva parecer de verdade.",

  glslRain_key0: "Uma gota no vidro é segura pela histerese do ângulo de contato: ela escorre quando o peso vence γ·w·(cos θR − cos θA), o que para água no vidro dá um raio de 1–2 mm.",
  glslRain_key1: "As gotas escorrem aos trancos (stick-slip), engolem as gotas que tocam e preferem rastros já molhados, onde menos coisa as segura.",
  glslRain_key2: "Uma gota é uma lente forte, f ≈ R/(n − 1) ≈ 3R: cada luz da rua a mais de alguns milímetros forma uma pequena imagem invertida dentro dela.",
  glslRain_key3: "Num shader, a refração por uma camada fina de água é um deslocamento do fundo pela inclinação da superfície, δ ≈ (n − 1)·inclinação.",
  glslRain_key4: "Chuva são células com hash de novo: células altas para as gotas que escorrem, uma função do tempo para o stick-slip delas, um caminho só para gota e rastro, células pequenas para as gotas paradas.",
  glslRain_key5: "A iluminação e a refração saem de um único campo de alturas, diferenciado em x e y.",
  glslRain_key6: "O vidro embaça abaixo do ponto de orvalho; vidro embaçado é o fundo lido num nível de mip borrado, limpo onde gotas, rastros e uma máscara de limpeza mandam.",
  glslRain_key7: "A máscara de limpeza é a única memória: uma textura em ping-pong que decai por e^(−k·dt), exatamente como as pegadas na neve.",
};

export default text;

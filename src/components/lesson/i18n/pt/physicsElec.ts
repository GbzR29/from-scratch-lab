// PT text for the Physics track's widgets (figures/physics), batch 6: electricity and magnetism.

const text: Record<string, string> = {
  // FieldLinesFigure
  figPhField_title: "O campo elétrico de cargas pontuais",
  figPhField_broken: "quebre: some os tamanhos, não as setas",
  figPhField_dipole: "+ e −",
  figPhField_like: "dois +",
  figPhField_single: "um +",
  figPhField_q: "cada carga",
  figPhField_note: "Arraste as cargas e a carga de prova âmbar. As setas cinzas mostram para onde uma pequena carga positiva seria empurrada em cada ponto, mais escuras onde o empurrão é mais forte; as linhas seguem essas setas do + para o −. Com + e −, as linhas saem do + e fazem a curva até o −. Com duas cargas +, uma afasta as linhas da outra, e no meio do caminho entre elas as setas somem: os dois empurrões iguais se cancelam. Ponha a carga de prova ali e a força sobre ela cai a zero. Agora quebre: some os tamanhos dos dois campos em vez de somá-los como setas. O ponto do meio passa a mostrar o campo mais forte da figura, embora uma carga colocada ali não sinta nada. Campos são vetores, e só a soma de setas bate com o que as cargas sentem de verdade.",
  figPhField_scale: "1 px = 1 cm",

  // GaussFigure
  figPhGauss_title: "Lei de Gauss: o fluxo através de qualquer superfície fechada",
  figPhGauss_broken: "quebre: campo cai como 1/R",
  figPhGauss_R: "raio da esfera",
  figPhGauss_q: "carga dentro",
  figPhGauss_outside: "pôr uma carga do lado de fora",
  figPhGauss_note: "Aumente e diminua a esfera. O campo na superfície enfraquece como 1/R², mas a área cresce como R², então o produto dos dois, o fluxo, nunca muda: é sempre a carga de dentro dividida por ε₀. As linhas dizem o mesmo sem números: elas são desenhadas em proporção à carga, 8 por nanocoulomb, e cada uma atravessa a superfície uma vez, seja qual for o tamanho. Ponha uma carga do lado de fora: cada linha dela que entra na esfera sai de novo, então ela não soma nada ao fluxo total. Depois quebre: se o campo caísse só como 1/R, o fluxo cresceria com o raio, e uma esfera maior seria atravessada por mais linhas do que saíram da carga. Linhas novas teriam de surgir do espaço vazio, onde não há carga. A lei de Gauss e o 1/r² da lei de Coulomb são o mesmo fato.",
  figPhGauss_inOut: "linhas entram e saem",
  figPhGauss_cross: "linhas atravessam a superfície",
  figPhGauss_brokenNote: "fluxo ≠ q/ε₀: linhas do nada",
  figPhGauss_scale: "desenhado com 1 m = 100 px",

  // EquipotentialFigure
  figPhEqp_title: "Equipotenciais e um trabalho que não depende do caminho",
  figPhEqp_broken: "quebre: some um campo em redemoinho",
  figPhEqp_dipole: "+ e −",
  figPhEqp_like: "dois +",
  figPhEqp_w1: "trabalho pelo caminho 1",
  figPhEqp_w2: "trabalho pelo caminho 2",
  figPhEqp_loop: "ida e volta",
  figPhEqp_note: "Cada contorno junta pontos com o mesmo potencial: os vermelhos, acima de zero, perto da carga +; os azuis, abaixo de zero, perto da −. As setas do campo sempre os cruzam em ângulo reto e apontam morro abaixo, do V alto para o baixo. Arraste a carga de prova ao longo de um contorno e a sua energia U = qV não muda, então andar sobre uma equipotencial não custa trabalho. Agora compare os dois caminhos de A até B: o reto e o longo, pela parte de baixo. O trabalho que você faz levando 1 nC por cada um é somado passo a passo, e os totais são iguais, ambos q(V_B − V_A). É isso que torna possível um potencial. Quebre com um campo que gira em volta do centro: os dois caminhos passam a custar quantidades diferentes, uma ida por um e volta pelo outro ganha energia do nada, e nenhum mapa de V pode ser desenhado.",
  figPhEqp_levels: "um contorno a cada dobra: ±20, 40, 80, 160, 320 V",
  figPhEqp_noV: "não existe potencial para este campo",

  // CapacitorFigure
  figPhCap_title: "Um capacitor de placas paralelas",
  figPhCap_A: "área das placas A",
  figPhCap_d: "distância d",
  figPhCap_V: "tensão da bateria",
  figPhCap_air: "ar, κ = 1",
  figPhCap_plastic: "plástico, κ = 2,3",
  figPhCap_glass: "vidro, κ = 5",
  figPhCap_disconnect: "desligar a bateria",
  figPhCap_connect: "religar a bateria",
  figPhCap_note: "Com a bateria ligada, aumente a área das placas ou diminua a distância: a capacitância cresce, e a mesma tensão empurra mais carga para as placas. Ponha um dielétrico: as moléculas se alinham, as pontas delas cancelam parte do campo, e a bateria precisa fornecer κ vezes mais carga para manter a mesma tensão. Agora desligue a bateria, prendendo a carga, e afaste as placas. A carga não pode mudar e o campo entre as placas continua o mesmo, mas numa distância maior esse campo soma uma tensão maior, e a energia guardada ½QV cresce. Essa energia veio de você: as placas se atraem, e separá-las dá trabalho. Ponha o dielétrico agora e a tensão cai κ vezes.",
  figPhCap_open: "aberto",
  figPhCap_energy: "energia guardada",
  figPhCap_log: "barra: escala log",

  // CircuitFigure
  figPhCirc_title: "Corrente, tensão e duas lâmpadas",
  figPhCirc_broken: "quebre: a primeira lâmpada gasta corrente",
  figPhCirc_series: "em série",
  figPhCirc_parallel: "em paralelo",
  figPhCirc_emf: "bateria ε",
  figPhCirc_piled: "carga acumulada",
  figPhCirc_note: "Os pontos mostram a carga andando pelo circuito, mais depressa onde a corrente é maior. Em série há um caminho só, então a mesma corrente passa pelas duas lâmpadas, e a tensão da bateria é dividida: a resistência maior fica com a maior parte, e as duas quedas sempre somam a tensão da bateria. Aumente R₂ e as duas lâmpadas ficam mais fracas, porque passa menos corrente. Agora mude para paralelo: cada lâmpada fica ligada direto na bateria, recebe a tensão inteira e puxa a sua própria corrente, e a bateria fornece a soma. Pôr uma lâmpada em paralelo não enfraquece a outra, e é assim que as tomadas de uma casa são ligadas. De volta à série, quebre: se a lâmpada 1 gastasse parte da corrente, a carga se acumularia no fio depois dela, um coulomb atrás do outro, para sempre. O que as lâmpadas gastam é energia: cada coulomb chega com potencial alto e sai com potencial baixo.",
  figPhCirc_junction: "nó: I = I₁ + I₂",
  figPhCirc_pile: "carga se acumulando aqui",

  // RcFigure
  figPhRc_title: "Carregando e descarregando um capacitor",
  figPhRc_broken: "quebre: mantenha a primeira corrente",
  figPhRc_emf: "bateria ε",
  figPhRc_toDis: "passar para descarga",
  figPhRc_toCharge: "passar para carga",
  figPhRc_restart: "começar de novo",
  figPhRc_pause: "pausar",
  figPhRc_play: "rodar",
  figPhRc_note: "Aperte começar de novo e veja o capacitor encher. No início ele está vazio, então a tensão inteira da bateria empurra corrente pelo resistor; conforme a carga se junta, a própria tensão do capacitor empurra de volta, a corrente diminui e o enchimento fica mais lento. Depois de uma constante de tempo τ = RC a tensão percorreu 63% do caminho; depois de cinco, está praticamente cheio. Dobre R ou C e tudo leva o dobro do tempo. Passe para descarga: agora o próprio capacitor empurra a corrente, no sentido contrário, e esvazia pela curva espelhada. Quebre mantendo a primeira corrente constante: a tensão sobe em linha reta, chega à tensão da bateria depois de exatamente um τ, que é o que τ significa, e continua subindo, acima do que a bateria conseguiria empurrar.",
  figPhRc_charging: "bateria no circuito",
  figPhRc_discharging: "bateria fora do circuito",
  figPhRc_axis: "tensão no capacitor",

  // ChargeInFieldFigure
  figPhLor_title: "Uma carga num campo magnético",
  figPhLor_broken: "quebre: uma força que empurra para a frente",
  figPhLor_proton: "próton",
  figPhLor_deuteron: "dêuteron (2 × massa)",
  figPhLor_alpha: "alfa (4 × massa, 2 × carga)",
  figPhLor_flip: "inverter a carga",
  figPhLor_v: "velocidade",
  figPhLor_ke: "energia cinética",
  figPhLor_note: "O campo aponta para dentro da tela. A força sobre a carga em movimento, em vermelho, sempre aponta para o lado, em ângulo reto com o movimento, então a partícula roda num círculo com velocidade constante e a sua energia nunca muda. Aumente a velocidade e o círculo cresce na mesma proporção; reforce o campo e ele encolhe. Repare no tempo de uma volta: ele não muda com a velocidade, porque uma partícula mais rápida percorre um círculo maior no mesmo tempo. Experimente o dêuteron, duas vezes mais pesado com a mesma carga: o círculo dele é duas vezes maior, e é assim que um espectrômetro de massa separa átomos pela massa. Inverta a carga e ela se curva para o outro lado. Depois quebre: incline a força um pouco para a frente e ela realiza trabalho, a partícula acelera, sai em espiral e ganha energia do campo. Uma força magnética de verdade nunca faz isso, porque é sempre perpendicular à velocidade.",
  figPhLor_into: "para dentro da tela",
  figPhLor_slow: "em câmera lenta",
  figPhLor_vLabel: "azul: velocidade",
  figPhLor_fLabel: "vermelho: força",

  // WireFieldFigure
  figPhWire_title: "O campo magnético de duas correntes",
  figPhWire_I1: "corrente no fio 1",
  figPhWire_I2: "corrente no fio 2",
  figPhWire_mid: "no meio",
  figPhWire_attract: "se atraem",
  figPhWire_repel: "se repelem",
  figPhWire_note: "Cada agulha aponta ao longo do campo magnético, com a ponta vermelha na frente. Zere uma das correntes: as agulhas circulam o outro fio, no sentido anti-horário quando a corrente sai da tela (um ponto), no horário quando entra (um x), e enfraquecem com a distância como 1/r. Com as duas correntes no mesmo sentido, os campos se cancelam entre os fios, onde as agulhas ficam apagadas, e se somam do lado de fora, e os fios se puxam. Inverta uma corrente e os campos passam a se somar entre os fios, e eles se empurram. Aproxime o fio 2 e a força cresce como 1/d. Dois fios a 1 m de distância, cada um com 1 A, se atraem com 2 × 10⁻⁷ N por metro: até 2019 essa era a definição do ampère. Para comparar, o campo da própria Terra é de cerca de 50 µT.",
  figPhWire_key: "• saindo da tela · × entrando na tela · 1 px = 1 mm",
};

export default text;

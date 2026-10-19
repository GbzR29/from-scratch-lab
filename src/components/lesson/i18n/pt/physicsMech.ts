// PT text for the Physics track's widgets (figures/physics), batch 8: advanced mechanics.

const text: Record<string, string> = {
  // ActionFigure
  figPhAct_title: "A ação de uma bola lançada",
  figPhAct_broken: "quebre aqui: usar T + V",
  figPhAct_snap: "voltar ao caminho real",
  figPhAct_random: "caminho aleatório",
  figPhAct_true: "caminho real",
  figPhAct_trial: "seu caminho",
  figPhAct_bottom: "menor S em",
  figPhAct_time: "tempo t (s)",
  figPhAct_height: "altura x (m)",
  figPhAct_keyTrue: "caminho real: x = gt(2 − t)/2",
  figPhAct_keyValley: "caminho que T + V prefere: ẍ = +g",
  figPhAct_sTitle: "ação S(ε), caminho = real + ε·ondulação",
  figPhAct_eps0: "caminho real",
  figPhAct_note: "Os dois caminhos saem do chão em t = 0 e pousam em t = 2 s; só o formato no meio muda. Arraste as três alças rosa para entortar o seu caminho, ou aperte caminho aleatório. Faça o que fizer, a sua ação fica maior que a do caminho real: ΔS nunca é negativo, e só vale zero quando você volta ao real. O painel da direita mostra por quê: ele desliza o seu caminho em direção ao real (ε = 0) e para longe de novo (ε = 1 é o seu caminho, ε = −1 a imagem espelhada dele), e a ação desenha uma parábola cujo fundo fica exatamente no caminho real. A natureza escolhe o caminho em que a ação é estacionária. Agora quebre usando T + V: o fundo da parábola se afasta do caminho real, e o caminho que T + V prefere é o vale vermelho, uma bola que cai para cima. Só T − V dá a lei de Newton.",

  // BeadHoopFigure
  figPhHoop_title: "Uma conta num aro girando",
  figPhHoop_broken: "quebre aqui: esquecer o movimento do aro",
  figPhHoop_w: "giro ω (rad/s)",
  figPhHoop_nudge: "empurrar a conta",
  figPhHoop_friction: "atrito leve",
  figPhHoop_rest: "repousa em",
  figPhHoop_bottom: "o fundo",
  figPhHoop_uTitle: "potencial efetivo",
  figPhHoop_uFormula: "U(θ) = −(g/R) cos θ − (ω²/2) sen²θ",
  figPhHoop_note: "A conta tem uma só coordenada, o ângulo θ subindo pelo aro a partir do fundo, e a lagrangiana só precisa da energia cinética dela (ao longo do aro e girando junto) e da altura. Com giro lento, a conta fica no fundo, como um pêndulo. Passe ω de ω_c = 6,3 rad/s, cerca de uma volta por segundo, e o fundo deixa de ser um vale: a conta sobe para o lado e para em cos θ = g/(Rω²), mais alto quanto mais rápido o giro. O painel da direita mostra o potencial efetivo: o vale do meio se divide em dois. Nenhuma força do aro sobre a conta foi necessária. Quebre esquecendo que o aro carrega a conta junto: a energia cinética perde o termo do giro, e a conta se comporta como um pêndulo em qualquer velocidade.",

  // PhasePortraitFigure
  figPhPhase_sep: "na separatriz: sobe devagar até o topo",
  figPhPhase_swing: "balançando para lá e para cá",
  figPhPhase_over: "passando por cima",
  figPhPhase_title: "O pêndulo no espaço de fase",
  figPhPhase_q: "ângulo q",
  figPhPhase_sepLabel: "separatriz H = 1",
  figPhPhase_units: "unidades: g/L = 1, mL² = 1",
  figPhPhase_note: "Cada ponto do plano à direita é um estado completo do pêndulo: o ângulo q na horizontal, o momento angular p na vertical. Clique ou arraste em qualquer lugar para começar ali. O ponto então anda seguindo as setas, que são as equações de Hamilton, e nunca sai da sua curva de nível de H, porque a energia se conserva. Comece perto do meio: um oval pequeno, uma oscilação suave. Comece mais alto: um oval maior, uma oscilação mais ampla. Comece acima da linha âmbar, a separatriz: a curva não fecha mais, e o pêndulo passa por cima de novo e de novo; o eixo q dá a volta porque −180° e +180° são a mesma posição, reto para cima. Começando exatamente na separatriz, o pêndulo sobe para o topo cada vez mais devagar e, em teoria, nunca chega. Todo o movimento do pêndulo, para qualquer começo, está nessa única figura.",

  // LiouvilleFigure
  figPhLiou_title: "Uma nuvem de pêndulos mantém a área",
  figPhLiou_broken: "quebre aqui: passos de Euler",
  figPhLiou_area: "área",
  figPhLiou_ofStart: "da inicial",
  figPhLiou_meanE: "H médio",
  figPhLiou_edge: "pontos da borda",
  figPhLiou_euler: "Euler: q += hp, p −= h sen q",
  figPhLiou_leap: "leapfrog: meio chute, deriva, meio chute",
  figPhLiou_axes: "horizontal: ângulo q · vertical: momento p",
  figPhLiou_note: "Cada ponto é um pêndulo, e juntos eles preenchem um pequeno disco de estados iniciais. Aperte play. Os pêndulos mais perto do meio dos ovais oscilam um pouco mais rápido que os mais de fora, então o disco é cisalhado num braço longo e fino que se enrola de novo e de novo. A forma muda até ficar irreconhecível, mas a área dentro da borda continua em 100%: é o teorema de Liouville, válido para todo sistema hamiltoniano. Arraste o disco para outro lugar, até atravessando a separatriz âmbar, e vale o mesmo. Agora quebre com o método de Euler simples, que atualiza q e p a partir dos valores antigos: cada passo estica as áreas por um fator 1 + h² cos q, a nuvem incha e a energia média sobe, então um pêndulo simulado oscilaria cada vez mais alto. Métodos que conservam a área, como o leapfrog, se chamam simpléticos; é por causa deles que simulações de órbitas e de moléculas rodam milhões de passos sem desandar.",

  // DoublePendulumFigure
  figPhDbl_title: "Dois pêndulos duplos, quase o mesmo começo",
  figPhDbl_broken: "quebre aqui: equações de ângulo pequeno",
  figPhDbl_th0: "ângulo inicial θ₀",
  figPhDbl_gap: "diferença inicial δ",
  figPhDbl_horizon: "horizonte (d > 0,1)",
  figPhDbl_notYet: "ainda não",
  figPhDbl_graph: "distância entre os dois (escala log)",
  figPhDbl_note: "Dois pêndulos duplos partem do repouso com os dois braços no mesmo ângulo, só que o braço de cima do azul começa girado um tiquinho a mais, δ. Comece em 120° e aperte play: por alguns segundos eles se movem como um só, depois de repente se separam e logo não têm mais nada em comum. O gráfico explica o \"de repente\". Ele mostra o logaritmo da distância entre os dois: ela sobe ao longo de uma reta mais ou menos regular, o que quer dizer que a diferença é multiplicada pelo mesmo fator a cada segundo, crescimento exponencial; nessa escala, uma diferença de um bilionésimo de radiano está só nove degraus abaixo de uma de um radiano. Mude δ de 1e-6 para 1e-9 rad (de um milionésimo para um bilionésimo de radiano): o começo fica mil vezes mais preciso, e o horizonte só chega alguns segundos depois. Agora tente 10°: o movimento é regular e a diferença fica minúscula a corrida inteira. Quebre com as equações de ângulo pequeno: elas são lineares, e equações lineares nunca podem ser caóticas.",

  // LogisticMapFigure
  figPhLog_fixed: "assenta num valor só",
  figPhLog_cycle: "repete a cada",
  figPhLog_steps: "passos",
  figPhLog_chaos: "nunca se repete: caos",
  figPhLog_title: "O mapa logístico: da ordem ao caos",
  figPhLog_xn: "x agora",
  figPhLog_xnext: "próximo x",
  figPhLog_series: "x nos passos 0 a 50, a partir de x₀ e de x₀ + 0,000001",
  figPhLog_bif: "onde x termina, para cada r (diagrama de bifurcação)",
  figPhLog_note: "Uma linha de álgebra, x → r x (1 − x), repetida. Em r = 2,8 a teia de aranha espirala até um ponto: os valores assentam. Em 3,2 eles assentam num ciclo de 2 passos, em 3,5 num ciclo de 4, em 3,56 num de 8: o período dobra de novo e de novo, cada vez mais depressa, e depois de r ≈ 3,5699 ele nunca mais se repete. Isso é caos: as séries de x₀ (rosa) e de x₀ + 0,000001 (azul) concordam por uma dúzia de passos e depois não têm nada a ver uma com a outra, e o expoente de Lyapunov λ fica positivo. O diagrama de bifurcação embaixo mostra a história toda de uma vez, incluindo as janelas de ordem no meio do caos, como o ciclo de 3 passos em 3,83. Nada aqui é aleatório: cada valor sai exatamente do anterior.",

  // EinsteinSolidFigure
  figPhEin_title: "Dois sólidos dividindo energia",
  figPhEin_q: "quanta q",
  figPhEin_best: "mais provável",
  figPhEin_max: "máx.",
  figPhEin_allA: "chance de todos os quanta voltarem para A",
  figPhEin_solidA: "sólido A",
  figPhEin_atoms: "átomos",
  figPhEin_solidB: "sólido B",
  figPhEin_qa: "quanta em A, q_A",
  figPhEin_chart: "cada divisão: vista (barras), contada (linha)",
  figPhEin_moves: "trocas",
  figPhEin_note: "Cada quadrado é um átomo de um sólido, vibrando com algum número de quanta de energia (os pontinhos). Toda a energia começa no sólido A, então A está quente e B frio. Aperte play: quanta pulam entre átomos sorteados, sem preferência por nenhum lado, e mesmo assim a energia flui de A para B e depois fica mais ou menos dividida. Nada empurra: simplesmente existem muito mais arranjos com a energia dividida do que com ela amontoada em A. Depois que a energia se espalha, o gráfico começa a contar quantas vezes cada divisão aparece (rosa) e compara com a contagem exata de arranjos (linha azul); elas batem. As temperaturas kT_A e kT_B, calculadas só pela contagem, ficam iguais bem onde os arranjos têm o pico. Aumente o número de átomos e de quanta: o pico fica relativamente mais estreito, e a chance de toda a energia voltar sozinha para A fica absurdamente pequena. Num sólido de verdade, com 10²³ átomos, isso nunca acontece. Essa é a segunda lei.",

  // BoltzmannFigure
  figPhBoltz_title: "Dividir ao acaso produz a distribuição de Boltzmann",
  figPhBoltz_broken: "quebre aqui: dividir com justiça",
  figPhBoltz_qbar: "quanta por átomo q̄",
  figPhBoltz_log: "escala log",
  figPhBoltz_zero: "átomos com 0 quanta",
  figPhBoltz_theory: "teoria",
  figPhBoltz_richest: "átomo mais rico",
  figPhBoltz_grid: "400 átomos: mais claro = mais quanta",
  figPhBoltz_n: "quanta que tem, n",
  figPhBoltz_chart: "número de átomos com n quanta",
  figPhBoltz_moves: "trocas",
  figPhBoltz_note: "Todo átomo começa com a mesma energia. Aperte play: quanta passam de átomos sorteados para átomos sorteados, ninguém é favorecido, e o total fica fixo. Em segundos a igualdade some: muitos átomos ficam sem nada, alguns enriquecem, e o histograma se acomoda numa curva que cai, a distribuição de Boltzmann (linha azul). Ligue a escala log e a curva vira uma reta: cada quantum a mais deixa um átomo menos provável pelo mesmo fator, e^(−ε/kT). Um q̄ maior (um sólido mais quente) dá uma inclinação mais suave. Observe ln W, o logaritmo do número de jeitos de distribuir essas energias: ele começa em zero e sobe até o máximo; a forma de Boltzmann é simplesmente a que tem mais jeitos. Quebre dividindo com justiça, sempre do mais rico para o mais pobre: os átomos ficam iguais, só existe um jeito de serem iguais, e a exponencial nunca aparece.",
};

export default text;

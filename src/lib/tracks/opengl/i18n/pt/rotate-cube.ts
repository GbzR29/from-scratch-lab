// PT text for src/lib/tracks/opengl/chapters/rotate-cube.tsx. Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  // ── Intro and what changes ──
  oglRotCube_intro: "Desenhando um cubo fez o cubo rodopiar com uma linha. Este capítulo desmonta essa linha. Você leva o cubo para o programa spin de Girando um triângulo, onde as teclas já giram as coisas, e experimenta um eixo de cada vez, depois dois giros juntos, depois o mouse. No fim, três cubos giram cada um na sua velocidade e uma pequena lua dá voltas no do meio.",
  oglRotCube_goal0: "Prever que faces um cubo mostra ao girar em volta de x, y ou z.",
  oglRotCube_goal1: "Combinar duas rotações e escolher a ordem delas: um prato giratório ou um bamboleio.",
  oglRotCube_goal2: "Girar o cubo arrastando o mouse, com yaw e pitch.",
  oglRotCube_goal3: "Dar a vários objetos o próprio giro, e fazer um orbitar outro.",
  oglRotCube_alongTitle: "O que este capítulo acrescenta ao spin.cpp",
  oglRotCube_alongBody: "Ele continua o spin.cpp do fim de Girando um triângulo: o triângulo que gira, pausa com Espaço, gira na mão com as setas e escolhe o eixo com X, Y e Z. O seu main.cpp não é tocado. Rode o programa depois de cada passo; cada passo diz o que você deve ver.",
  oglRotCube_along1: "Passo 1: o cubo colorido no lugar do triângulo, em perspectiva.",
  oglRotCube_along2: "Passo 2: um eixo de cada vez, com as teclas que você já tem.",
  oglRotCube_along3: "Passo 3: dois giros juntos, nas duas ordens.",
  oglRotCube_along4: "Passo 4: arraste com o mouse para girá-lo.",
  oglRotCube_along5: "Passo 5: três cubos e uma lua.",

  // ── Step 1 ──
  oglRotCube_s1Title: "Passo 1: o cubo no lugar do triângulo",
  oglRotCube_s1a: "Use o cubo do passo 1 de Desenhando um cubo: 8 vértices só com posição, 36 índices, colorido pela própria posição. Ele não tem textura, então o spin.cpp não precisa de imagem nem de stb_image. Troque os vértices do triângulo no passo 4b:",
  oglRotCube_s1b: "O vertex shader perde o aColor e calcula a cor a partir da posição. Ele também ganha a matriz view do capítulo Transformações + GLM, entre as outras duas:",
  oglRotCube_s1c: "O fragment shader fica como está. No passo 4c, procure o novo uniform e ligue o teste de profundidade, para as faces da frente esconderem as de trás:",
  oglRotCube_s1d: "Por último, o loop. O glm::ortho plano dá lugar ao glm::perspective, para as faces que vêm na sua direção ficarem maiores, e a matriz view recua a câmera 3 unidades. As duas são as do capítulo Transformações + GLM. O draw call lê 36 índices:",
  oglRotCube_s1e: "No passo 6, apague o EBO também: glDeleteBuffers(1, &ebo). O seu glClear já limpa o depth buffer (GL_DEPTH_BUFFER_BIT), de que o teste de profundidade precisa.",
  oglRotCube_s1Run: "Rode. Surpresa: você vê um quadrado girando, e não um cubo. Ele começa com ciano em cima à esquerda, azul embaixo à esquerda, magenta embaixo à direita e branco em cima à direita. É a face da frente do cubo. O eixo ainda começa como z, o que aponta para você, e um cubo girando em volta dele só mostra essa face. Aperte Y.",

  // ── Step 2 ──
  oglRotCube_s2Title: "Passo 2: um eixo de cada vez",
  oglRotCube_s2a: "Não há nada para digitar neste passo: as teclas X, Y e Z do capítulo anterior já escolhem o eixo. Aperte cada uma e veja que faces aparecem. A figura faz o mesmo; escolha um eixo nela e compare.",
  oglRotCube_tKey: "Tecla",
  oglRotCube_tAxis: "Eixo",
  oglRotCube_tSee: "O que você vê",
  oglRotCube_tNever: "Nunca fica de frente",
  oglRotCube_y: "um prato giratório. A face da frente escorrega para a direita e a da esquerda aparece, depois a de trás, depois a da direita.",
  oglRotCube_yN: "cima e baixo",
  oglRotCube_x: "uma roda rolando na sua direção. A face de cima desce para a frente, depois vem a de trás, depois a de baixo.",
  oglRotCube_xN: "esquerda e direita",
  oglRotCube_z: "a face da frente girando como um ponteiro de relógio. Parece plana porque o eixo aponta direto para você.",
  oglRotCube_zN: "todas menos a da frente",
  oglRotCube_s2b: "Então um eixo sempre esconde duas faces. Aperte Y, e aperte Espaço quando duas faces dividirem a imagem por igual, a 45°: a face da frente à direita, a da esquerda à esquerda. Segure as setas para girá-lo na mão a partir dali.",

  // ── Step 3 ──
  oglRotCube_s3Title: "Passo 3: dois giros juntos",
  oglRotCube_s3a: "Para ver a face de cima enquanto o cubo gira em volta de y, incline-o na sua direção também. Isso é um segundo rotate. Troque a linha da model; as teclas X, Y e Z e a variável axis não são mais usadas, então apague-as:",
  oglRotCube_s3b: "Como sempre, a chamada escrita por último age primeiro. Então, a cada frame, o cubo primeiro gira em volta do próprio eixo vertical, por angle, e depois o cubo já girado é inclinado 30° na sua direção. A inclinação vem depois do giro, então é sempre a mesma: você olha um prato giratório um pouco de cima, e a face de cima nunca sai de vista.",
  oglRotCube_s3c: "Agora troque as duas linhas e rode de novo. A inclinação age primeiro, e o giro carrega o cubo inclinado junto. Depois de meia volta, o lado que se inclinava para você se inclina para longe, e você vê a face de baixo em vez da de cima. O cubo bamboleia, como uma moeda prestes a cair. As mesmas duas chamadas, outra ordem, outro movimento. Na figura, compare \"inclinar, depois girar\" com \"girar, depois inclinar\".",
  oglRotCube_tWritten: "Ordem escrita",
  oglRotCube_tActs: "Age no vértice",
  oglRotCube_tMotion: "Movimento",
  oglRotCube_o1: "inclinar, depois girar",
  oglRotCube_o1b: "gira primeiro, inclina por último",
  oglRotCube_o1c: "um prato giratório visto de cima; a face de cima está sempre visível",
  oglRotCube_o2: "girar, depois inclinar",
  oglRotCube_o2b: "inclina primeiro, gira por último",
  oglRotCube_o2c: "um bamboleio; cima e baixo se revezam",
  oglRotCube_s3Run: "Ponha as linhas de volta na primeira ordem e rode: o cubo gira como um prato giratório, visto um pouco de cima, mostrando a face de cima o tempo todo. O Espaço ainda pausa, e as setas ainda giram na mão.",

  // ── Step 4 ──
  oglRotCube_s4Title: "Passo 4: girar com o mouse",
  oglRotCube_s4a: "A inclinação fixa de 30° vai virar algo que você arrasta. Dois ângulos fazem isso, com nomes da aviação: yaw, o giro em volta do eixo vertical (y), e pitch, a inclinação para perto ou para longe de você (em volta de x). Arrastar para a direita gira o cubo para a direita; arrastar para baixo inclina a face de cima na sua direção. É assim que editores 3D como o Blender giram um objeto. Acrescente os dois ao estado no passo 4, junto com a posição do mouse no último frame:",
  oglRotCube_s4b: "No loop, depois das teclas, leia o mouse:",
  oglRotCube_tLine: "Linha",
  oglRotCube_tDoes: "O que faz",
  oglRotCube_l1: "a posição do mouse, medida a partir do canto superior esquerdo da janela. O y cresce para baixo, ao contrário do y do OpenGL.",
  oglRotCube_l2: "quanto o mouse andou desde o último frame. lastX é atualizado em todo frame, apertado ou não, então o primeiro frame de um arraste só vê o pequeno movimento daquele frame, nunca um salto a partir de onde o último arraste terminou.",
  oglRotCube_l3: "a sensibilidade: arrastar 180 pixels gira o cubo 90°. Não há dt aqui: um movimento do mouse já é uma distância, não uma velocidade.",
  oglRotCube_l4: "positivo quando você arrasta para baixo, porque o y do mouse cresce para baixo. Um pitch positivo em volta de x inclina a face de cima na sua direção, então arrastar para baixo mostra o topo.",
  oglRotCube_l5: "mantém o pitch entre −90° e 90°. Depois de 90° o cubo ficaria de cabeça para baixo, e arrastar para a direita o giraria para a esquerda.",
  oglRotCube_s4c: "Depois a matriz model: pitch toma o lugar da inclinação fixa, e yaw se junta ao giro:",
  oglRotCube_s4d: "A ordem é a do prato giratório do passo 3, pelo mesmo motivo: o pitch é aplicado por último, então um arraste para o lado sempre gira o cubo em volta do próprio eixo vertical, seja qual for a inclinação. O giro e o yaw são ambos em volta de y e vêm um depois do outro, então simplesmente se somam: yaw é um giro que fica parado, angle um giro que continua.",
  oglRotCube_s4Run: "Rode, aperte Espaço para parar o giro e arraste pela janela. Para a direita o cubo gira para a direita, para baixo mostra o topo, para cima mostra a base. Solte, e ele fica onde você deixou. Aperte Espaço de novo e ele volta a girar dali. O botão \"arrastar\" da figura funciona do mesmo jeito.",

  // ── Step 5 ──
  oglRotCube_s5Title: "Passo 5: três cubos e uma lua",
  oglRotCube_s5a: "Um VAO basta para muitos cubos, como o Experimente de Desenhando um cubo mostrou: desenhe-o várias vezes, com uma matriz model diferente a cada vez. Cada cubo ganha o próprio lugar e o próprio giro, e o mouse gira todos juntos. O giro que eles dividem vai numa matriz chamada scene, montada uma vez por frame a partir de yaw e pitch. Primeiro recue a câmera de 3 para 4 unidades, para caberem três:",
  oglRotCube_s5b: "Depois o draw call vira um laço. Troque as linhas da model, o glUniformMatrix4fv da model e o glDrawElements (view e projection são enviadas uma vez, antes):",
  oglRotCube_s5c: "Leia cada matriz de baixo para cima, a ordem em que o vértice as encontra. Um cubo é diminuído, rodopia em volta do eixo inclinado de Desenhando um cubo, é levado para o seu lugar e só então girado com o resto da cena. O rodopio vem antes do deslocamento, então cada cubo gira no lugar. A lua é a órbita do capítulo do triângulo, agora em 3D: ela é levada para fora primeiro e girada depois, em volta de y, então circula o cubo do meio em vez de girar.",
  oglRotCube_s5d: "Começar cada matriz de scene, e não da identidade, é o que faz o mouse girar tudo de uma vez, em volta do meio da cena. O ângulo também é compartilhado, então o Espaço pausa os quatro. E quando a lua passa atrás do cubo do meio, o teste de profundidade a esconde, sem código extra.",
  oglRotCube_s5Run: "Rode: três cubos em fila, o da esquerda rodopiando devagar, o da direita rápido, e um cubinho dando voltas no do meio, sumindo atrás dele e voltando. Arraste para girar a fila inteira; arraste para baixo para vê-la de cima, com o círculo da lua em volta do cubo do meio.",

  // ── Checkpoint ──
  oglRotCube_soFarTitle: "Seu spin.cpp até aqui",
  oglRotCube_soFarBody: "O arquivo inteiro depois do passo 5. Em relação ao fim de Girando um triângulo, as mudanças estão marcadas NEW: os shaders do cubo colorido com uView, os vértices e índices do cubo com o EBO, o teste de profundidade, o estado de yaw e pitch, o mouse, a câmera em perspectiva e o laço de desenho. As teclas X, Y e Z saíram. Os dois helpers de shader estão encurtados porque não mudaram.",

  // ── What you see ──
  oglRotCube_seeTitle: "Se não ficar certo",
  oglRotCube_tSeeW: "O que você vê",
  oglRotCube_tCause: "Causa provável",
  oglRotCube_w1: "um quadrado, não um cubo",
  oglRotCube_w1b: "o cubo gira em volta de z, o eixo que aponta para você, ou não gira. Aperte Y, ou confira a matriz model.",
  oglRotCube_w2: "faces de trás aparecem através das da frente",
  oglRotCube_w2b: "falta o glEnable(GL_DEPTH_TEST), ou falta GL_DEPTH_BUFFER_BIT no glClear.",
  oglRotCube_w3: "o cubo está enorme, ou nada é desenhado",
  oglRotCube_w3b: "falta a matriz view ou ela move por +3: a câmera fica dentro do cubo ou na frente dele, olhando para o outro lado. uView precisa ser enviada e multiplicada no shader.",
  oglRotCube_w4: "arrastar gira para o lado errado",
  oglRotCube_w4b: "um sinal está trocado. Arrastar para a direita deve somar ao yaw, arrastar para baixo deve somar ao pitch; o y do mouse cresce para baixo.",
  oglRotCube_w5: "ele pula quando você começa a arrastar",
  oglRotCube_w5b: "lastX e lastY só são atualizados enquanto o botão está apertado, então o primeiro frame de um novo arraste mede a partir de onde o último terminou. Atualize os dois em todo frame.",
  oglRotCube_w6: "os cubos dão voltas em torno do meio em vez de girar no lugar",
  oglRotCube_w6b: "translate e rotate estão trocados: cada cubo é movido primeiro e girado depois, então orbita, que é a receita da lua. Escreva o translate antes do rotate.",

  // ── Mistakes ──
  oglRotCube_mistakesTitle: "Erros comuns",
  oglRotCube_tMistake: "Erro",
  oglRotCube_tFix: "O que acontece, e a correção",
  oglRotCube_e1: "Escrever as rotações na ordem em que devem acontecer",
  oglRotCube_e1b: "a última chamada do GLM age primeiro. Para girar e depois inclinar, escreva a inclinação primeiro. Quando um movimento parece errado, trocar duas linhas é a primeira coisa a tentar.",
  oglRotCube_e2: "Multiplicar o movimento do mouse por dt",
  oglRotCube_e2b: "um arraste é uma distância, então o giro deve depender só de quanto você arrastou. Com dt, o mesmo arraste gira menos numa máquina mais rápida.",
  oglRotCube_e3: "Nenhum limite no pitch",
  oglRotCube_e3b: "depois de 90° o cubo fica de cabeça para baixo e um arraste para o lado gira para o lado oposto. Limite o pitch a ±90°.",
  oglRotCube_e4: "Dar a cada cubo a sua própria cópia do giro do mouse",
  oglRotCube_e4b: "começar cada model da identidade e pôr yaw e pitch depois do translate gira cada cubo em volta do próprio centro, e não a fila em volta do meio. Comece cada model de scene.",
  oglRotCube_e5: "Esquecer o EBO na limpeza",
  oglRotCube_e5b: "nada visível acontece: o programa termina de qualquer jeito. Mas todo glGen precisa do seu glDelete, e programas maiores criam buffers enquanto rodam.",
  oglRotCube_next: "A matriz scene que você acabou de montar é uma câmera disfarçada: girar o mundo inteiro é o mesmo que andar em volta dele. Em seguida, Câmera e matriz de visão torna isso real, de volta ao main.cpp: glm::lookAt, o mouse para olhar em volta e o teclado para andar.",

  // ── Key ideas ──
  oglRotCube_key0: "Girar em volta de um eixo esconde duas faces: em volta de y você nunca vê cima e baixo, em volta de x nunca os lados, e em volta de z, o eixo que aponta para você, um cubo parece um quadrado plano.",
  oglRotCube_key1: "Duas rotações não comutam. A última chamada do GLM age primeiro: inclinar e depois girar (na escrita) é um prato giratório, girar e depois inclinar é um bamboleio.",
  oglRotCube_key2: "Yaw (em volta de y) e pitch (em volta de x) vindos de um arraste do mouse giram um objeto como um editor 3D: pitch escrito primeiro, para agir por último; limite-o a ±90°.",
  oglRotCube_key3: "Um arraste do mouse é uma distância: multiplique-o por um ângulo por pixel, nunca por dt.",
  oglRotCube_key4: "Um VAO, muitos desenhos: cada objeto ganha a própria matriz model. Começar todas de uma matriz scene compartilhada gira todos juntos.",
  oglRotCube_key5: "Mover e depois girar (na ordem em que o vértice os encontra) faz um objeto orbitar; girar e depois mover o faz girar no lugar.",
};

export default text;

// src/lib/tracks/ai/descriptions.ts
// What search results show under each AI lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const aiDescriptions: LessonDescriptions = {
  "what-is-ai": {
    en: "What is machine learning: programs that learn from data, the four ingredients of learning, supervised vs unsupervised vs reinforcement, a first model.",
    pt: "O que é aprendizado de máquina: programas que aprendem com dados, os quatro ingredientes, supervisionado vs não supervisionado vs por reforço, e um primeiro modelo.",
  },
  data: {
    en: "Data for machine learning: features and labels, datasets as matrices, one-hot encoding, feature scaling, and train, validation and test splits.",
    pt: "Dados para machine learning: atributos e rótulos, datasets como matrizes, one-hot encoding, normalização de atributos e divisão em treino, validação e teste.",
  },
  "linear-regression": {
    en: "Linear regression from scratch in C++: the model, mean squared error, the exact best fit, the gradient for many features, and R² to judge the fit.",
    pt: "Regressão linear do zero em C++: o modelo, erro quadrático médio, o melhor ajuste exato, o gradiente com muitos atributos e o R² para avaliar o ajuste.",
  },
  "gradient-descent": {
    en: "Gradient descent explained by hand: the update rule, choosing the learning rate, batch vs mini-batch vs stochastic, and checking gradients numerically.",
    pt: "Gradiente descendente explicado à mão: a regra de atualização, a taxa de aprendizado, batch vs mini-batch vs estocástico e verificação numérica do gradiente.",
  },
  "logistic-regression": {
    en: "Logistic regression for classification: the sigmoid, why cross-entropy loss, its gradient, decision boundaries, and softmax for many classes, in C++.",
    pt: "Regressão logística para classificação: a sigmoide, por que entropia cruzada, seu gradiente, fronteiras de decisão e softmax para várias classes, em C++.",
  },
  generalisation: {
    en: "Overfitting vs underfitting: why training error lies, validation sets for model choice, confusion matrices, precision and recall.",
    pt: "Overfitting vs underfitting: por que o erro de treino engana, conjuntos de validação para escolher modelos, matriz de confusão, precisão e recall.",
  },
  "k-nearest-neighbours": {
    en: "k-nearest neighbours (KNN): classify and regress by votes of the closest examples, distances and feature scaling, choosing k, the curse of dimensionality.",
    pt: "k-vizinhos mais próximos (KNN): classificar e prever pelo voto dos exemplos mais próximos, distâncias e escala, escolha de k e a maldição da dimensionalidade.",
  },
  "decision-trees": {
    en: "Decision trees: Gini impurity and entropy, growing a tree by hand with CART, pruning against overfitting, regression trees, random forests and boosting.",
    pt: "Árvores de decisão: impureza de Gini e entropia, construir uma árvore à mão com CART, poda contra overfitting, árvores de regressão, random forests e boosting.",
  },
  "k-means": {
    en: "k-means clustering: Lloyd's algorithm by hand, bad starts and local minima, k-means++, choosing k with the elbow, and what shapes k-means cannot find.",
    pt: "Clusterização k-means: algoritmo de Lloyd à mão, inícios ruins e mínimos locais, k-means++, escolher k e quais formatos de grupo o k-means não encontra.",
  },
  perceptron: {
    en: "The perceptron: a neuron's weighted sum and bias, AND, OR and NAND gates, the perceptron learning rule, convergence, and why it cannot learn XOR.",
    pt: "O perceptron: soma ponderada e viés de um neurônio, portas AND, OR e NAND, a regra de aprendizado do perceptron, convergência e por que não aprende XOR.",
  },
  mlp: {
    en: "Multi-layer perceptrons: the forward pass by hand, layers as matrix products, activations, XOR solved, counting parameters, universal approximation.",
    pt: "Perceptron multicamadas: o forward pass à mão, camadas como produto de matrizes, funções de ativação, XOR resolvido, contar parâmetros e aproximação universal.",
  },
  backpropagation: {
    en: "Backpropagation explained step by step: the chain rule through a network, deltas, every gradient of a small net by hand, and gradient checking.",
    pt: "Backpropagation explicado passo a passo: a regra da cadeia pela rede, os deltas, todos os gradientes de uma rede pequena à mão e verificação do gradiente.",
  },
  training: {
    en: "Training neural networks: Xavier and He initialisation, vanishing and exploding gradients, momentum, RMSProp and Adam, learning-rate schedules, loss curves.",
    pt: "Treinando redes neurais: inicialização Xavier e He, gradientes que somem e explodem, momentum, RMSProp e Adam, agenda da taxa de aprendizado e curvas de perda.",
  },
  regularisation: {
    en: "Regularisation in neural networks: L2 weight decay, early stopping, inverted dropout and why it scales by 1/(1 − p), compared on the same network.",
    pt: "Regularização em redes neurais: weight decay L2, early stopping, dropout invertido e por que escala por 1/(1 − p), comparados na mesma rede.",
  },
  cnn: {
    en: "Convolutional neural networks (CNN): convolution by hand, padding and stride, channels, pooling and receptive fields, parameter counts, and softmax.",
    pt: "Redes neurais convolucionais (CNN): convolução à mão, padding e stride, canais, pooling e campo receptivo, contagem de parâmetros e softmax.",
  },
  embeddings: {
    en: "Word embeddings: why one-hot fails, an embedding layer as a lookup table, training skip-gram (word2vec), cosine similarity, and their limits.",
    pt: "Word embeddings: por que one-hot falha, a camada de embedding como tabela, treinar skip-gram (word2vec), similaridade de cosseno e seus limites.",
  },
  rnn: {
    en: "Recurrent neural networks and LSTMs: hidden states, backpropagation through time, vanishing gradients and clipping, and the LSTM cell equations.",
    pt: "Redes neurais recorrentes e LSTMs: estados ocultos, backpropagation through time, gradientes que somem e clipping, e as equações da célula LSTM.",
  },
  attention: {
    en: "Attention explained: queries, keys and values, scaled dot-product attention by hand, why divide by √d, self-attention, causal masks, multi-head attention.",
    pt: "Atenção explicada: queries, keys e values, atenção por produto escalar à mão, por que dividir por √d, self-attention, máscara causal e atenção multi-head.",
  },
  transformers: {
    en: "How transformers and LLMs work: byte-pair tokenisation, the transformer block, training a tiny GPT in the page, GPT-2's parameters, temperature and top-p.",
    pt: "Como funcionam transformers e LLMs: tokenização BPE, o bloco transformer, treinar um GPT pequeno na página, os parâmetros do GPT-2, temperatura e top-p.",
  },
  "game-search": {
    en: "Minimax and alpha-beta pruning: game trees, minimax by hand, tic-tac-toe solved, α and β cut-offs, depth limits, evaluation functions, move ordering.",
    pt: "Minimax e poda alfa-beta: árvores de jogo, minimax à mão, jogo da velha resolvido, cortes α e β, limite de profundidade, funções de avaliação e ordem de jogadas.",
  },
  mcts: {
    en: "Monte Carlo tree search (MCTS): random playouts, selection, expansion, simulation and backpropagation, the UCB1 formula, and AlphaGo and AlphaZero.",
    pt: "Busca em árvore Monte Carlo (MCTS): simulações aleatórias, seleção, expansão, simulação e retropropagação, a fórmula UCB1, e AlphaGo e AlphaZero.",
  },
  "bandits-mdps": {
    en: "Multi-armed bandits and Markov decision processes: ε-greedy and UCB1, regret, the Bellman optimality equation, value iteration and policy iteration.",
    pt: "Bandidos multibraço e processos de decisão de Markov: ε-greedy e UCB1, arrependimento, equação de otimalidade de Bellman, iteração de valor e de política.",
  },
  "q-learning": {
    en: "Q-learning explained: the update rule by hand, bootstrapping, SARSA vs Q-learning on the cliff, deep Q-networks (DQN), policy gradients and RLHF.",
    pt: "Q-learning explicado: a regra de atualização à mão, bootstrapping, SARSA vs Q-learning no penhasco, deep Q-networks (DQN), policy gradients e RLHF.",
  },
  "game-ai": {
    en: "Game AI: finite state machines vs behaviour trees, steering behaviours (seek, flee, arrive), flocking with boids, A* and navmeshes, utility AI.",
    pt: "IA para jogos: máquinas de estados finitos vs behaviour trees, steering (seek, flee, arrive), bandos com boids, A* e navmeshes, e utility AI.",
  },
};

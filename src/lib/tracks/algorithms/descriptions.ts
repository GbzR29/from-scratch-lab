// src/lib/tracks/algorithms/descriptions.ts
// What search results show under each Algorithms lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const algorithmsDescriptions: LessonDescriptions = {
  memory: {
    en: "Memory for algorithms in C++: array element addresses in 1D and 2D, pointers, struct size and padding, stack vs heap, and why the cache loves arrays.",
    pt: "Memória para algoritmos em C++: endereço de elementos em arrays 1D e 2D, ponteiros, tamanho e padding de structs, pilha vs heap e por que o cache ama arrays.",
  },
  complexity: {
    en: "Big-O notation explained: count an algorithm's steps, the shortcut rules for loops, best, worst and average case, memory use, and doubling experiments.",
    pt: "Notação Big-O explicada: conte os passos de um algoritmo, regras rápidas para laços, melhor, pior e caso médio, uso de memória e o teste de dobrar a entrada.",
  },
  recursion: {
    en: "Recursion in C++: base cases, the call stack traced by hand, recurrences for the cost, the Towers of Hanoi, backtracking, and recursion vs loops.",
    pt: "Recursão em C++: caso base, a pilha de chamadas passo a passo, recorrências para o custo, Torre de Hanói, backtracking e recursão vs laços.",
  },
  searching: {
    en: "Linear and binary search in C++: binary search without off-by-one bugs, why it is correct, lower_bound and upper_bound, and binary search on the answer.",
    pt: "Busca linear e binária em C++: busca binária sem erro de um a mais, por que ela funciona, lower_bound e upper_bound e busca binária na resposta.",
  },
  "elementary-sorts": {
    en: "Selection sort, bubble sort and insertion sort step by step: counting inversions to predict the work, and which sorts are stable and why it matters.",
    pt: "Selection sort, bubble sort e insertion sort passo a passo: contar inversões para prever o trabalho, e quais são estáveis e por que isso importa.",
  },
  "merge-sort": {
    en: "Merge sort in C++: merging sorted runs, top-down and bottom-up, why it is O(n log n) in every case, its extra memory, and counting inversions.",
    pt: "Merge sort em C++: intercalar sequências ordenadas, versões top-down e bottom-up, por que é O(n log n) sempre, a memória extra e contagem de inversões.",
  },
  quicksort: {
    en: "Quicksort in C++: Lomuto and Hoare partitions, best and worst case, random pivots, many equal keys, a shallow stack, and quickselect for the k-th element.",
    pt: "Quicksort em C++: partições de Lomuto e Hoare, melhor e pior caso, pivô aleatório, muitas chaves iguais, pilha rasa e quickselect para o k-ésimo elemento.",
  },
  "linear-sorts": {
    en: "Linear-time sorting: why comparison sorts need n log n, counting sort, radix sort one digit at a time, bucket sort, and choosing a sort for your data.",
    pt: "Ordenação em tempo linear: por que ordenar por comparação exige n log n, counting sort, radix sort dígito a dígito, bucket sort e qual ordenação usar.",
  },
  "dynamic-array": {
    en: "Build a dynamic array (std::vector) in C++: size and capacity, why doubling makes push_back O(1) amortized, shrinking, and pointers invalidated by growth.",
    pt: "Construa um array dinâmico (std::vector) em C++: size e capacity, por que dobrar deixa o push_back O(1) amortizado, encolher e ponteiros invalidados.",
  },
  "linked-list": {
    en: "Linked lists in C++: insert and remove nodes, reverse a list in place, doubly linked lists with a sentinel, fast and slow pointers, arrays vs lists.",
    pt: "Listas ligadas em C++: inserir e remover nós, inverter a lista no lugar, lista duplamente ligada com sentinela, ponteiros rápido e lento, e arrays vs listas.",
  },
  stacks: {
    en: "Stacks in C++: array and list implementations, balanced brackets, postfix evaluation, the shunting-yard algorithm, and monotonic stacks.",
    pt: "Pilhas em C++: implementação com array e com lista, parênteses balanceados, avaliação pós-fixa, algoritmo shunting-yard e pilhas monotônicas.",
  },
  queues: {
    en: "Queues and deques in C++: a circular buffer with wrapping indices, full vs empty, a deque for both ends, and the sliding-window maximum trick.",
    pt: "Filas e deques em C++: buffer circular com índices que dão a volta, cheio vs vazio, deque para as duas pontas e o truque do máximo em janela deslizante.",
  },
  "hash-table": {
    en: "How a hash table works in C++: hash functions for ints and strings, separate chaining vs linear probing, load factor and resizing, and worst-case attacks.",
    pt: "Como funciona uma tabela hash em C++: funções hash para inteiros e strings, encadeamento vs sondagem linear, fator de carga e redimensionamento.",
  },
  trees: {
    en: "Trees and tree traversals in C++: root, leaf, depth and height, recursive tree functions, pre-order, in-order, post-order and level order, expression trees.",
    pt: "Árvores e percursos em C++: raiz, folha, profundidade e altura, funções recursivas, pré-ordem, em ordem, pós-ordem e por nível, e árvores de expressão.",
  },
  bst: {
    en: "Binary search trees in C++: search, insert and delete, in-order sorted traversal, successor and range queries, and how insertion order shapes the tree.",
    pt: "Árvores binárias de busca em C++: buscar, inserir e remover, percurso em ordem ordenado, sucessor e consultas por intervalo, e o efeito da ordem de inserção.",
  },
  "balanced-trees": {
    en: "Balanced binary trees: rotations, AVL trees and rebalancing after insertion, the red-black tree rules, and choosing between AVL and red-black.",
    pt: "Árvores balanceadas: rotações, árvores AVL e rebalanceamento após inserção, as regras da árvore rubro-negra e quando usar AVL ou rubro-negra.",
  },
  heaps: {
    en: "Heaps and priority queues in C++: the heap in an array, sift up and sift down, building a heap in linear time, heapsort, and min-heaps.",
    pt: "Heaps e filas de prioridade em C++: o heap num array, sift up e sift down, construir o heap em tempo linear, heapsort e min-heaps.",
  },
  tries: {
    en: "Tries (prefix trees) in C++: insert, search and prefix queries, autocomplete, sorted listing for free, memory cost, and trie vs hash table vs tree.",
    pt: "Tries (árvores de prefixos) em C++: inserir, buscar e consultar prefixos, autocompletar, listagem ordenada de graça, custo de memória e trie vs hash vs árvore.",
  },
  greedy: {
    en: "Greedy algorithms: interval scheduling, exchange-argument proofs and counterexamples, fractional vs 0/1 knapsack, and building Huffman codes.",
    pt: "Algoritmos gulosos: agendamento de intervalos, provas por troca e contraexemplos, mochila fracionária vs 0/1 e construção de códigos de Huffman.",
  },
  "dynamic-programming": {
    en: "What is dynamic programming: overlapping subproblems, memoization vs tabulation, a recipe for any DP, coin change, 0/1 knapsack and edit distance in C++.",
    pt: "O que é programação dinâmica: subproblemas repetidos, memoização vs tabela, uma receita para qualquer DP, troco, mochila 0/1 e distância de edição em C++.",
  },
  graphs: {
    en: "Graphs in C++: vertices, edges and degrees, adjacency matrix vs adjacency list vs edge list, and implicit graphs like grids and game states.",
    pt: "Grafos em C++: vértices, arestas e graus, matriz de adjacência vs lista de adjacência vs lista de arestas, e grafos implícitos como grades e estados de jogo.",
  },
  "graph-traversal": {
    en: "Breadth-first search (BFS) and depth-first search (DFS) in C++: shortest paths in edges, recursive and stack DFS, components, cycles and topological order.",
    pt: "Busca em largura (BFS) e em profundidade (DFS) em C++: menor caminho em arestas, DFS recursiva e com pilha, componentes, ciclos e ordenação topológica.",
  },
  "shortest-paths": {
    en: "Shortest path algorithms: edge relaxation, Dijkstra's algorithm by hand, Bellman–Ford for negative weights, DAGs, Floyd–Warshall and A* search.",
    pt: "Algoritmos de menor caminho: relaxamento de arestas, Dijkstra passo a passo, Bellman–Ford com pesos negativos, DAGs, Floyd–Warshall e busca A*.",
  },
  mst: {
    en: "Minimum spanning trees: the cut property, Kruskal's algorithm with union-find (disjoint sets), Prim's algorithm, and where spanning trees are used.",
    pt: "Árvore geradora mínima: a propriedade do corte, algoritmo de Kruskal com union-find (conjuntos disjuntos), algoritmo de Prim e onde elas são usadas.",
  },
};

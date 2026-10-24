// src/lib/tracks/math/descriptions.ts
// What search results show under each Math lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const mathDescriptions: LessonDescriptions = {
  "number-line": {
    en: "Whole numbers, fractions and negatives on the number line, what the four operations mean, the sign rules for multiplying negatives, and absolute value.",
    pt: "Números inteiros, frações e negativos na reta numérica, o que as quatro operações significam, a regra de sinais e o valor absoluto (módulo).",
  },
  "order-of-operations": {
    en: "Order of operations (PEMDAS/BODMAS) explained: why 2 + 3 × 4 = 14, expressions drawn as trees, and the traps with minus signs, powers and division.",
    pt: "Ordem das operações explicada: por que 2 + 3 × 4 = 14, expressões desenhadas como árvores e as armadilhas com sinal de menos, potências e divisão.",
  },
  fractions: {
    en: "Fractions and decimals: simplify, find equivalent fractions, add, subtract, multiply and divide them, convert to decimals, and round correctly.",
    pt: "Frações e decimais: simplificar, achar frações equivalentes, somar, subtrair, multiplicar e dividir, converter para decimal e arredondar.",
  },
  ratios: {
    en: "Ratios, rates and proportion, percentages and percentage change, percentages of percentages, and finding a value part of the way between two others.",
    pt: "Razão, taxa e proporção, porcentagem e variação percentual, porcentagem de porcentagem, e achar o valor a uma fração do caminho entre dois outros.",
  },
  divisibility: {
    en: "Division with remainder, prime numbers and prime factorisation, GCD with Euclid's algorithm, LCM, and remainders as clock arithmetic.",
    pt: "Divisão com resto, números primos e fatoração, MDC pelo algoritmo de Euclides, MMC, e restos como aritmética do relógio.",
  },
  powers: {
    en: "Powers and roots: the laws of exponents (zero and negative included), scientific notation, square roots by hand, and fast powers by repeated squaring.",
    pt: "Potências e raízes: propriedades das potências (expoente zero e negativo), notação científica, raiz quadrada à mão e potências rápidas por quadrados.",
  },
  bases: {
    en: "Number bases explained: read any base digit by digit, convert decimal, binary and hexadecimal, add in binary, and why 0.1 is not exact in binary.",
    pt: "Bases numéricas: leia qualquer base dígito a dígito, converta decimal, binário e hexadecimal, some em binário e veja por que 0,1 não é exato em binário.",
  },
  modular: {
    en: "Modular arithmetic step by step: calculating mod n, huge powers mod n, why divisibility tests work, modular inverses, Fermat's little theorem, ISBN checks.",
    pt: "Aritmética modular passo a passo: contas mod n, potências enormes mod n, por que os critérios de divisibilidade funcionam, inverso modular e pequeno teorema de Fermat.",
  },
  expressions: {
    en: "Algebraic expressions: name the parts, substitute numbers for letters, combine like terms, expand brackets with the distributive law, and nest to save steps.",
    pt: "Expressões algébricas: nomes das partes, substituir letras por números, juntar termos semelhantes, aplicar a distributiva e reescrever em forma aninhada.",
  },
  "linear-equations": {
    en: "Solve linear equations step by step with the balance rule: brackets, fractions, the unknown on both sides, no or infinite solutions, and word problems.",
    pt: "Resolva equações do 1º grau passo a passo pela regra da balança: parênteses, frações, incógnita dos dois lados, nenhuma ou infinitas soluções e problemas.",
  },
  inequalities: {
    en: "Solve inequalities: answers as ranges, when the sign flips, compound inequalities, absolute value inequalities, and checking with test points.",
    pt: "Resolva inequações: a resposta como intervalo, quando o sinal inverte, inequações compostas, inequações com módulo e conferência com pontos de teste.",
  },
  algebra: {
    en: "Functions and graphs: read values from a formula or graph, slope and the equation of a line, shifting and stretching graphs, composition and inverses.",
    pt: "Funções e gráficos: ler valores pela fórmula ou pelo gráfico, inclinação e equação da reta, deslocar e esticar gráficos, composição e função inversa.",
  },
  "linear-systems": {
    en: "Solve systems of linear equations by substitution and elimination, see them as two crossing lines, spot no or infinite solutions, and use Cramer's rule.",
    pt: "Resolva sistemas lineares por substituição e adição, veja como duas retas que se cruzam, identifique nenhuma ou infinitas soluções e use a regra de Cramer.",
  },
  quadratics: {
    en: "Quadratic equations: the parabola from its equation, solving by factoring and completing the square, the quadratic formula and its discriminant.",
    pt: "Equação do 2º grau: a parábola pela equação, resolver por fatoração e completando quadrado, a fórmula de Bhaskara e o discriminante (delta).",
  },
  polynomials: {
    en: "Polynomials: add and multiply them, evaluate quickly with Horner's method, divide and use remainders to find factors, and sketch graphs from roots.",
    pt: "Polinômios: somar e multiplicar, calcular rápido pelo método de Horner, dividir e usar o resto para achar fatores, e esboçar o gráfico pelas raízes.",
  },
  "polynomial-division": {
    en: "Polynomial long division and Ruffini's rule (synthetic division) explained, the remainder theorem, root multiplicity, rational roots and Girard's relations.",
    pt: "Divisão de polinômios e a regra de Ruffini (Briot-Ruffini) explicadas, teorema do resto, multiplicidade de raízes, raízes racionais e relações de Girard.",
  },
  binomial: {
    en: "The binomial theorem: expand (a + b)² and (a + b)³, Pascal's triangle, C(n, k) with factorials, finding one term of an expansion, and (1 + x)ⁿ ≈ 1 + nx.",
    pt: "Binômio de Newton: desenvolva (a + b)² e (a + b)³, triângulo de Pascal, C(n, k) com fatoriais, achar um termo da expansão e (1 + x)ⁿ ≈ 1 + nx.",
  },
  exponents: {
    en: "Exponential functions and logarithms: growth and decay, the log as the inverse of a power, the rules of logarithms, and solving exponential equations.",
    pt: "Funções exponenciais e logaritmos: crescimento e decaimento, o log como inverso da potência, propriedades dos logaritmos e equações exponenciais.",
  },
  "equation-toolkit": {
    en: "Safe moves for solving equations: cross-multiplying, never dividing by the unknown, square-root equations, multiplying by the conjugate, substitution.",
    pt: "Movimentos seguros para resolver equações: multiplicação em cruz, nunca dividir pela incógnita, equações com raiz, multiplicar pelo conjugado e substituição.",
  },
  sequences: {
    en: "Arithmetic and geometric sequences: find any term, read Σ notation, sum formulas for both kinds, and when an infinite series has a finite total.",
    pt: "Progressão aritmética e geométrica: termo geral, notação Σ, fórmulas da soma de PA e PG, e quando uma soma infinita tem total finito.",
  },
  sets: {
    en: "Set theory basics: notation, subsets and the power set, union, intersection and complement with Venn diagrams, De Morgan, inclusion–exclusion.",
    pt: "Teoria dos conjuntos: notação, subconjuntos e conjunto das partes, união, interseção e complementar com diagramas de Venn, De Morgan e inclusão–exclusão.",
  },
  logic: {
    en: "Propositional logic: truth tables, why p → q is true when p is false, converse vs contrapositive, De Morgan's laws, and negating ∀ and ∃.",
    pt: "Lógica proposicional: tabelas-verdade, por que p → q é verdadeira quando p é falsa, recíproca vs contrapositiva, leis de De Morgan e negação de ∀ e ∃.",
  },
  proofs: {
    en: "Methods of proof with examples: direct proof, contrapositive, contradiction (√2 is irrational), cases, counterexamples, and if-and-only-if proofs.",
    pt: "Métodos de demonstração com exemplos: prova direta, contrapositiva, por absurdo (√2 é irracional), por casos, contraexemplo e provas de 'se e somente se'.",
  },
  summation: {
    en: "Summation notation and its rules: linearity, index shifts, the sums of k, k² and k³, geometric sums, telescoping sums, double sums and Π products.",
    pt: "Somatório e suas propriedades: linearidade, mudança de índice, somas de k, k² e k³, soma geométrica, somas telescópicas, somas duplas e produtório Π.",
  },
  induction: {
    en: "Proof by mathematical induction: the base case and the step, proving sums, divisibility and inequalities, strong induction, and classic broken proofs.",
    pt: "Indução matemática: caso base e passo indutivo, provar somas, divisibilidade e desigualdades, indução forte e as 'provas' quebradas clássicas.",
  },
  angles: {
    en: "Points, lines and angles: kinds of angle, complementary and supplementary pairs, vertical angles, and the angles made by a line crossing two parallels.",
    pt: "Pontos, retas e ângulos: tipos de ângulo, complementares e suplementares, opostos pelo vértice e os ângulos de uma transversal cortando duas paralelas.",
  },
  triangles: {
    en: "Triangles: why the angles add up to 180°, naming by sides and angles, the triangle inequality, the congruence cases (SSS, SAS, ASA) and the centroid.",
    pt: "Triângulos: por que os ângulos somam 180°, classificação por lados e ângulos, desigualdade triangular, casos de congruência (LLL, LAL, ALA) e baricentro.",
  },
  area: {
    en: "Perimeter and area of rectangles, triangles, parallelograms and trapezoids, composite shapes, how area scales, and the shoelace formula for any polygon.",
    pt: "Perímetro e área de retângulo, triângulo, paralelogramo e trapézio, figuras compostas, como a área muda com a escala e a fórmula do cadarço para polígonos.",
  },
  pythagoras: {
    en: "The Pythagorean theorem: why a² + b² = c² is true, find a missing side, Pythagorean triples, test for a right angle, and the distance between two points.",
    pt: "Teorema de Pitágoras: por que a² + b² = c², achar o lado que falta, ternos pitagóricos, testar se há ângulo reto e a distância entre dois pontos.",
  },
  similarity: {
    en: "Similar triangles and scale: the scale factor, AA similarity, the altitude of a right triangle, how lengths, areas and volumes scale, and map scales.",
    pt: "Semelhança de triângulos e escala: razão de semelhança, caso AA, altura do triângulo retângulo, como comprimentos, áreas e volumes mudam e escalas de mapa.",
  },
  circle: {
    en: "Circles and π: why π is the same for every circle, circumference and area πr², arc length and sector area, and tangent lines at right angles.",
    pt: "Círculo e π: por que π é o mesmo em todo círculo, comprimento da circunferência e área πr², arco e setor circular, e a tangente perpendicular ao raio.",
  },
  volumes: {
    en: "Volume and surface area of prisms, cylinders, pyramids, cones and spheres, Cavalieri's principle, unfolding solids, and how volume scales by k³.",
    pt: "Volume e área de superfície de prismas, cilindros, pirâmides, cones e esferas, princípio de Cavalieri, planificação e por que o volume escala com k³.",
  },
  analytic: {
    en: "Coordinate geometry: midpoint and section formula, equations of lines and circles, ellipses, parabolas and hyperbolas, and where a line meets a circle.",
    pt: "Geometria analítica: ponto médio e divisão de segmento, equações da reta e da circunferência, elipse, parábola e hipérbole, e reta vs circunferência.",
  },
  transformations: {
    en: "Geometric transformations on coordinates: translation, reflection, rotation, scaling and shear, which keep shape and size, composing them, and symmetry.",
    pt: "Transformações geométricas em coordenadas: translação, reflexão, rotação, escala e cisalhamento, quais preservam a forma, composição e simetria.",
  },
  trig: {
    en: "Right-triangle trigonometry: SOH-CAH-TOA, finding sides and angles, exact sin, cos and tan of 30°, 45° and 60°, heights from angles, and slope as tangent.",
    pt: "Trigonometria no triângulo retângulo: seno, cosseno e tangente, achar lados e ângulos, valores exatos de 30°, 45° e 60°, alturas por ângulo e inclinação.",
  },
  "unit-circle": {
    en: "Radians and the unit circle: how many radians in a circle (2π) and why, degrees to radians, arc length, and sine and cosine of any angle with signs.",
    pt: "Radianos e ciclo trigonométrico: quantos radianos tem uma volta (2π) e por quê, graus para radianos, comprimento de arco e seno e cosseno com sinais.",
  },
  "triangle-laws": {
    en: "The law of sines and the law of cosines: solve any triangle, choose the right law for your data, the ambiguous case, and area from two sides and an angle.",
    pt: "Lei dos senos e lei dos cossenos: resolva qualquer triângulo, escolha a lei certa para os dados, o caso ambíguo e a área por dois lados e o ângulo.",
  },
  identities: {
    en: "Trigonometric identities: rotate a point by any angle, derive sin(α + β) and cos(α + β), double-angle formulas, and prove identities step by step.",
    pt: "Identidades trigonométricas: gire um ponto por qualquer ângulo, deduza sen(α + β) e cos(α + β), fórmulas de arco duplo e prove identidades passo a passo.",
  },
  "trig-equations": {
    en: "Solve trigonometric equations: arcsin, arccos and arctan ranges, the general solution of sin x = c, all solutions in an interval, and trig inequalities.",
    pt: "Equações trigonométricas: domínios de arcsen, arccos e arctg, a solução geral de sen x = c, todas as soluções num intervalo e inequações trigonométricas.",
  },
  polar: {
    en: "Polar coordinates and atan2: convert between (x, y) and (r, θ), find the angle of any point, the shortest turn between directions, and polar curves.",
    pt: "Coordenadas polares e atan2: converta entre (x, y) e (r, θ), ache o ângulo de qualquer ponto, o menor giro entre direções e curvas polares.",
  },
  waves: {
    en: "Sine waves and oscillation: amplitude, frequency, phase and offset from a formula or graph, adding waves, beats, square waves and damped motion.",
    pt: "Ondas senoidais e oscilação: amplitude, frequência, fase e deslocamento pela fórmula ou gráfico, soma de ondas, batimento, onda quadrada e amortecimento.",
  },
  vectors: {
    en: "Vectors in math: components and arrows, adding, subtracting and scaling, length and unit vectors, and writing any vector as a combination of a basis.",
    pt: "Vetores na matemática: componentes e setas, soma, subtração e multiplicação por número, módulo e versor, e combinação linear numa base.",
  },
  dot: {
    en: "The dot product two ways: the angle between vectors, projecting one vector onto another, reflecting off a surface, and distance to a plane.",
    pt: "Produto escalar de duas formas: o ângulo entre vetores, a projeção de um vetor sobre outro, reflexão numa superfície e distância a um plano.",
  },
  cross: {
    en: "The cross product of 3D vectors: surface normals and parallelogram area, the 2D cross product for left/right tests, and the scalar triple product.",
    pt: "Produto vetorial em 3D: normais de superfície e área do paralelogramo, o produto vetorial 2D para testar esquerda/direita e o produto misto.",
  },
  matrices: {
    en: "Matrices as linear maps: matrix times vector two ways, columns as where the axes land, matrix multiplication as chaining, and homogeneous coordinates.",
    pt: "Matrizes como transformações lineares: matriz vezes vetor de duas formas, colunas como destino dos eixos, produto de matrizes e coordenadas homogêneas.",
  },
  determinant: {
    en: "The determinant explained: compute 2×2 and 3×3 determinants, read them as the area or volume scale factor, the meaning of the sign, and of zero.",
    pt: "Determinante explicado: calcule determinantes 2×2 e 3×3, leia como fator de escala de área ou volume, o significado do sinal e do zero.",
  },
  inverse: {
    en: "Matrix inverses and linear systems: the 2×2 inverse formula, Gaussian elimination for Ax = b, change of basis, and nearly singular matrices.",
    pt: "Matriz inversa e sistemas lineares: a fórmula da inversa 2×2, escalonamento (eliminação de Gauss) para Ax = b, mudança de base e matrizes quase singulares.",
  },
  eigen: {
    en: "Eigenvalues and eigenvectors: solve det(A − λI) = 0, eigenvectors of stretches, reflections and rotations, repeated application and power iteration.",
    pt: "Autovalores e autovetores: resolva det(A − λI) = 0, autovetores de esticamentos, reflexões e rotações, aplicação repetida e método das potências.",
  },
  complex: {
    en: "Complex numbers: add, multiply and divide, multiplication as turn and scale, polar form for powers and roots, Euler's formula, and the Mandelbrot set.",
    pt: "Números complexos: somar, multiplicar e dividir, multiplicação como giro e escala, forma polar para potências e raízes, fórmula de Euler e o conjunto de Mandelbrot.",
  },
  quaternions: {
    en: "Quaternions for 3D rotation: what goes wrong with Euler angles (gimbal lock), quaternion multiplication, rotating vectors, slerp, and conversion to a matrix.",
    pt: "Quatérnios para rotação 3D: o problema dos ângulos de Euler (gimbal lock), produto de quatérnios, girar vetores, slerp e conversão para matriz.",
  },
  limits: {
    en: "Limits and continuity: what a limit means, one-sided limits and limits at infinity, the ε–δ definition, continuity, and bisection with the IVT.",
    pt: "Limites e continuidade: o que é um limite, limites laterais e no infinito, a definição ε–δ, continuidade e bissecção pelo teorema do valor intermediário.",
  },
  derivatives: {
    en: "The derivative from scratch: from average to instantaneous rate of change, the limit definition, notation and units, second derivatives, and where it fails.",
    pt: "A derivada do zero: da taxa média à taxa instantânea, a definição por limite, notação e unidades, derivada segunda e onde a derivada não existe.",
  },
  "derivative-rules": {
    en: "Rules of differentiation: power, product, quotient and chain rules, derivatives of sin, cos, eˣ and ln x, and differentiating step by step.",
    pt: "Regras de derivação: regra da potência, do produto, do quociente e da cadeia, derivadas de sen, cos, eˣ e ln x, e derivar passo a passo.",
  },
  "derivative-uses": {
    en: "Applications of derivatives: increasing and decreasing, concavity, optimization problems, linear approximation, Newton's method, related rates, L'Hôpital.",
    pt: "Aplicações da derivada: crescimento e decrescimento, concavidade, problemas de otimização, aproximação linear, método de Newton, taxas relacionadas e L'Hôpital.",
  },
  integrals: {
    en: "Integrals as area: Riemann sums, the definite integral as signed area, the trapezoid rule and Simpson's rule, and a function's average value.",
    pt: "Integral como área: somas de Riemann, a integral definida como área com sinal, regra dos trapézios e de Simpson, e o valor médio de uma função.",
  },
  ftc: {
    en: "The fundamental theorem of calculus explained: why area grows at the rate f(x), antiderivatives and +C, evaluating definite integrals, and motion.",
    pt: "Teorema fundamental do cálculo explicado: por que a área cresce à taxa f(x), primitivas e a constante C, cálculo de integrais definidas e movimento.",
  },
  "integration-techniques": {
    en: "Techniques of integration: substitution, integration by parts, powers of sine and cosine, partial fractions, trig substitution and improper integrals.",
    pt: "Técnicas de integração: substituição, integração por partes, potências de seno e cosseno, frações parciais, substituição trigonométrica e integrais impróprias.",
  },
  series: {
    en: "Taylor and Maclaurin series: copy a function with a polynomial, the series of eˣ, sin x and cos x, convergence, error bounds, and Euler's formula.",
    pt: "Séries de Taylor e Maclaurin: aproxime uma função por um polinômio, as séries de eˣ, sen x e cos x, convergência, estimativa de erro e fórmula de Euler.",
  },
  "partial-derivatives": {
    en: "Partial derivatives and the gradient: how to solve partial derivatives, directional slope, tangent planes, error propagation, extrema and Lagrange multipliers.",
    pt: "Derivadas parciais e gradiente: como calcular derivadas parciais, derivada direcional, plano tangente, propagação de erro, máximos e mínimos e multiplicadores de Lagrange.",
  },
  "multiple-integrals": {
    en: "Double and triple integrals: volume as an integral inside an integral, limits for curved regions, mass and centroid, and polar coordinates dA = r dr dθ.",
    pt: "Integrais duplas e triplas: volume como integral dentro de integral, limites para regiões curvas, massa e centro de massa, e coordenadas polares dA = r dr dθ.",
  },
  "differential-equations": {
    en: "Differential equations: slope fields, exponential growth and decay, separation of variables, Euler's method, stability, and the spring equation.",
    pt: "Equações diferenciais: campos de direções, crescimento e decaimento exponencial, separação de variáveis, método de Euler, estabilidade e a equação da mola.",
  },
  "vector-fields": {
    en: "Vector fields, divergence and curl explained: flow lines, gradient fields, divergence as outflow, curl as a paddle wheel, and the 3D formulas.",
    pt: "Campos vetoriais, divergente e rotacional explicados: linhas de fluxo, campos gradiente, divergente como vazão, rotacional como roda de pás e fórmulas em 3D.",
  },
  "line-integrals": {
    en: "Line integrals and conservative fields: parametrized curves and arc length, work ∫ F · dr, the fundamental theorem for gradients, and finding a potential.",
    pt: "Integrais de linha e campos conservativos: curvas parametrizadas e comprimento, trabalho ∫ F · dr, o teorema fundamental para gradientes e achar o potencial.",
  },
  "green-stokes": {
    en: "Green's theorem, the divergence theorem (Gauss) and Stokes' theorem explained with small cells, worked examples, and the pattern they all share.",
    pt: "Teorema de Green, teorema da divergência (Gauss) e teorema de Stokes explicados por pequenas células, com exemplos e o padrão comum a todos.",
  },
  fourier: {
    en: "Fourier series and the Fourier transform: orthogonality, the formulas for aₙ and bₙ, odd and even functions, the complex form, Parseval's identity.",
    pt: "Séries de Fourier e transformada de Fourier: ortogonalidade, as fórmulas de aₙ e bₙ, funções pares e ímpares, forma complexa e identidade de Parseval.",
  },
  "calculus-of-variations": {
    en: "Calculus of variations: functionals, deriving the Euler–Lagrange equation, the brachistochrone and Beltrami identity, and the principle of least action.",
    pt: "Cálculo das variações: funcionais, dedução da equação de Euler–Lagrange, a braquistócrona e a identidade de Beltrami, e o princípio da mínima ação.",
  },
  pde: {
    en: "Partial differential equations: the heat, wave and Laplace equations, separation of variables with Fourier series, d'Alembert, and grid stability.",
    pt: "Equações diferenciais parciais: equações do calor, da onda e de Laplace, separação de variáveis com séries de Fourier, d'Alembert e estabilidade numérica.",
  },
  "descriptive-stats": {
    en: "Descriptive statistics: histograms, mean, median and mode, quartiles and standard deviation, box plots, z-scores, percentiles and Simpson's paradox.",
    pt: "Estatística descritiva: histogramas, média, mediana e moda, quartis e desvio padrão, box plot, escore z, percentis e o paradoxo de Simpson.",
  },
  counting: {
    en: "Counting principles: the multiplication principle, permutations vs combinations and when order matters, repetition, Pascal's triangle, inclusion–exclusion.",
    pt: "Análise combinatória: princípio multiplicativo, arranjo, permutação e combinação e quando a ordem importa, repetição, triângulo de Pascal e inclusão–exclusão.",
  },
  probability: {
    en: "Probability basics: outcomes and events, equally likely outcomes, the axioms, the complement trick, counting probabilities, and geometric probability.",
    pt: "Probabilidade básica: resultados e eventos, casos igualmente prováveis, os axiomas, o truque do complementar, probabilidade por contagem e probabilidade geométrica.",
  },
  conditional: {
    en: "Conditional probability and Bayes' theorem: probability trees, independence, the law of total probability, the Monty Hall problem, first-step analysis.",
    pt: "Probabilidade condicional e teorema de Bayes: árvores de probabilidade, independência, lei da probabilidade total, o problema de Monty Hall e análise do primeiro passo.",
  },
  "random-variables": {
    en: "Random variables: probability mass functions, cumulative distribution functions (CDF), joint distributions, and continuous densities as area.",
    pt: "Variáveis aleatórias: função de probabilidade, função de distribuição acumulada (FDA), distribuições conjuntas e densidades contínuas como área.",
  },
  expectation: {
    en: "Expected value and variance: discrete and continuous means, linearity of expectation, conditional expectation, standard deviation, Chebyshev's inequality.",
    pt: "Esperança e variância: média discreta e contínua, linearidade da esperança, esperança condicional, desvio padrão e desigualdade de Chebyshev.",
  },
  distributions: {
    en: "Common probability distributions: binomial, geometric and Poisson, uniform and exponential waiting times, and the normal distribution, with examples.",
    pt: "Distribuições de probabilidade: binomial, geométrica e de Poisson, uniforme e exponencial para tempos de espera, e a distribuição normal, com exemplos.",
  },
  sampling: {
    en: "Sampling and statistical inference: the law of large numbers, the central limit theorem, confidence intervals, and hypothesis tests with p-values.",
    pt: "Amostragem e inferência estatística: lei dos grandes números, teorema central do limite, intervalos de confiança e testes de hipótese com valor-p.",
  },
  regression: {
    en: "Correlation and linear regression: covariance, the correlation coefficient, the least-squares line, residuals and R², and straightening curved data.",
    pt: "Correlação e regressão linear: covariância, coeficiente de correlação, a reta de mínimos quadrados, resíduos e R², e como linearizar dados curvos.",
  },
  "markov-chains": {
    en: "Markov chains explained: transition matrices, the distribution after n steps, the stationary distribution πP = π, long-run averages, absorbing chains.",
    pt: "Cadeias de Markov explicadas: matriz de transição, a distribuição após n passos, a distribuição estacionária πP = π, médias de longo prazo e cadeias absorventes.",
  },
  "absorbing-chains": {
    en: "Absorbing Markov chains and hitting times: the fundamental matrix N = (I − Q)⁻¹, expected time to absorption, absorption probabilities, coin-flip patterns.",
    pt: "Cadeias de Markov absorventes e tempos de chegada: a matriz fundamental N = (I − Q)⁻¹, tempo esperado até a absorção, probabilidades e padrões de moedas.",
  },
  "graphs-intro": {
    en: "Graph theory basics: vertices, edges and degrees, the handshake lemma, complete, bipartite and regular graphs, isomorphism, and the adjacency matrix.",
    pt: "Teoria dos grafos: vértices, arestas e graus, o lema do aperto de mãos, grafos completos, bipartidos e regulares, isomorfismo e matriz de adjacência.",
  },
  "euler-paths": {
    en: "Euler paths and circuits: the bridges of Königsberg, why vertex degrees decide, drawing a figure in one stroke, and Hamiltonian cycles with Dirac's theorem.",
    pt: "Caminhos e circuitos eulerianos: as pontes de Königsberg, por que os graus decidem, desenhar sem tirar o lápis e ciclos hamiltonianos com o teorema de Dirac.",
  },
  "trees-math": {
    en: "Trees in graph theory: why a tree on n vertices has n − 1 edges, counting leaves, spanning trees, Prüfer codes and Cayley's formula nⁿ⁻².",
    pt: "Árvores na teoria dos grafos: por que uma árvore com n vértices tem n − 1 arestas, contagem de folhas, árvores geradoras, código de Prüfer e fórmula de Cayley.",
  },
  "planar-coloring": {
    en: "Planar graphs and graph colouring: Euler's formula V − E + F = 2, why K₅ and K₃,₃ are not planar, chromatic number, and the four colour theorem.",
    pt: "Grafos planares e coloração: fórmula de Euler V − A + F = 2, por que K₅ e K₃,₃ não são planares, número cromático e o teorema das quatro cores.",
  },
  recurrences: {
    en: "Recurrence relations: unrolling, the Tower of Hanoi, first-order linear recurrences, counting with recurrences, the characteristic equation and Binet's formula.",
    pt: "Relações de recorrência: desenrolar, a Torre de Hanói, recorrências lineares de 1ª ordem, contagem por recorrência, equação característica e fórmula de Binet.",
  },
};

// src/lib/tracks/cpp/descriptions.ts
// What search results show under each C/C++ lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const cppDescriptions: LessonDescriptions = {
  history: {
    en: "The history of C and C++: Bell Labs and Unix, from BCPL to B to C, Stroustrup's classes without cost, the standards timeline, and why both still matter.",
    pt: "A história do C e do C++: Bell Labs e o Unix, de BCPL a B e a C, as classes sem custo de Stroustrup, a linha do tempo dos padrões e por que ainda importam.",
  },
  "c-basics": {
    en: "Your first C program: compile and run it, read warnings, choose types and their sizes, integer division, printf formats, and reading input safely with scanf.",
    pt: "Seu primeiro programa em C: compilar e rodar, ler avisos, escolher tipos e seus tamanhos, divisão inteira, formatos do printf e ler entrada com scanf.",
  },
  "c-pointers": {
    en: "C pointers explained with live memory boxes: & and *, changing a caller's variable, pointer arithmetic, arrays and pointers, NULL, and const pointers.",
    pt: "Ponteiros em C explicados com caixas de memória: & e *, alterar a variável de quem chamou, aritmética de ponteiros, arrays, NULL e ponteiros const.",
  },
  "c-memory": {
    en: "Stack vs heap in C: where variables live and how long, malloc, realloc and free, leaks, dangling pointers, double free, ownership, and AddressSanitizer.",
    pt: "Pilha vs heap em C: onde as variáveis vivem e por quanto tempo, malloc, realloc e free, vazamentos, ponteiros soltos, double free, posse e AddressSanitizer.",
  },
  "c-strings-structs": {
    en: "C strings and the '\\0' terminator, <string.h> and snprintf without overflow, structs with . and ->, enums, and tagged unions.",
    pt: "Strings em C e o terminador '\\0', <string.h> e snprintf sem estouro, structs com . e ->, enums e unions com tag.",
  },
  "c-preprocessor-build": {
    en: "How a C build works: preprocessor, compiler and linker, #define macros and their traps, headers and include guards, declarations vs definitions, static and extern.",
    pt: "Como funciona a compilação em C: pré-processador, compilador e linker, macros #define e suas armadilhas, headers e include guards, declaração vs definição.",
  },
  "c-undefined-behavior": {
    en: "Undefined behaviour in C: signed overflow, out-of-bounds access, the usual suspects, how the optimiser deletes code because of UB, and sanitizers.",
    pt: "Comportamento indefinido em C: overflow com sinal, acesso fora dos limites, os suspeitos de sempre, como o otimizador apaga código por UB, e sanitizers.",
  },
  "c-io-files": {
    en: "File I/O in C: stdin, stdout and stderr, fopen and fclose, reading lines with fgets, output buffering and fflush, binary files, and errno.",
    pt: "Arquivos em C: stdin, stdout e stderr, fopen e fclose, ler linhas com fgets, buffer de saída e fflush, arquivos binários e errno.",
  },
  "c-to-cpp": {
    en: "From C to C++: the C problem behind each C++ feature, references instead of pointers, destructors and std::vector, zero overhead, and extern \"C\".",
    pt: "Do C ao C++: o problema do C por trás de cada recurso do C++, referências em vez de ponteiros, destrutores e std::vector, custo zero e extern \"C\".",
  },
  landscape: {
    en: "Modern C++ today: a first C++ program read line by line, choosing a standard and warnings when compiling, who decides C++, and today's defaults.",
    pt: "C++ moderno hoje: um primeiro programa lido linha a linha, escolher o padrão e os avisos ao compilar, quem decide o C++ e os padrões atuais.",
  },
  "cpp-references": {
    en: "C++ references, function overloading and namespaces: pass by value, reference, const reference or pointer, overload resolution, and the :: operator.",
    pt: "Referências, sobrecarga de funções e namespaces em C++: passagem por valor, referência, referência const ou ponteiro, resolução de sobrecarga e o operador ::.",
  },
  "cpp-classes": {
    en: "C++ classes: private data and invariants, constructors with initialiser lists, destructors, construction order, objects on the stack, with new and make_unique.",
    pt: "Classes em C++: dados privados e invariantes, construtores com lista de inicialização, destrutores, ordem de construção, objetos na pilha, com new e make_unique.",
  },
  "cpp-strings-vectors": {
    en: "std::string and std::vector: text that manages itself, a growing array, size vs capacity and reserve, and the classic out-of-bounds and reallocation bugs.",
    pt: "std::string e std::vector: texto que se gerencia sozinho, um array que cresce, size vs capacity e reserve, e os bugs clássicos de limite e realocação.",
  },
  values: {
    en: "C++ value semantics: initialization forms and braces, where copies happen, deep copy for pointer members, the rule of three and rule of zero, auto.",
    pt: "Semântica de valor em C++: formas de inicialização e chaves, onde acontecem cópias, cópia profunda com ponteiros, regra dos três e regra do zero, auto.",
  },
  move: {
    en: "C++ move semantics explained: move constructors and assignment, lvalues vs rvalues, why std::move moves nothing, noexcept, return by value, rule of five.",
    pt: "Move semantics em C++ explicado: construtor e atribuição de movimento, lvalues vs rvalues, por que std::move não move nada, noexcept e regra dos cinco.",
  },
  raii: {
    en: "RAII and smart pointers in C++: resource classes, std::unique_ptr, std::shared_ptr and weak_ptr, custom deleters for C libraries, and which one to use.",
    pt: "RAII e ponteiros inteligentes em C++: classes de recurso, std::unique_ptr, std::shared_ptr e weak_ptr, deleters para bibliotecas C e qual usar.",
  },
  "cpp-inheritance": {
    en: "C++ inheritance and virtual functions: base and derived classes, dynamic dispatch, how the vptr and vtable work, override, abstract classes, slicing.",
    pt: "Herança e funções virtuais em C++: classes base e derivadas, despacho dinâmico, como funcionam vptr e vtable, override, classes abstratas e slicing.",
  },
  "cpp-lambdas": {
    en: "C++ lambdas explained: captures by value and by reference, dangling captures, what the compiler generates, generic lambdas, std::function vs templates.",
    pt: "Lambdas em C++ explicadas: captura por valor e por referência, capturas soltas, o que o compilador gera, lambdas genéricas, std::function vs templates.",
  },
  "cpp-containers": {
    en: "Choosing a C++ container: big-O in plain words, std::map vs std::unordered_map, red-black trees and hash tables, iterator invalidation, why vector wins.",
    pt: "Escolhendo um container em C++: big-O em palavras simples, std::map vs std::unordered_map, árvores rubro-negras e tabelas hash, iteradores inválidos.",
  },
  templates: {
    en: "C++ templates: function and class templates, type deduction, why templates live in headers, specialisation, if constexpr and parameter packs.",
    pt: "Templates em C++: templates de função e de classe, dedução de tipos, por que ficam em headers, especialização, if constexpr e parameter packs.",
  },
  concepts: {
    en: "C++20 concepts and constraints: requires-expressions, the four ways to constrain a template, overloading on constraints, standard concepts, static_assert.",
    pt: "Concepts e restrições do C++20: requires-expressions, as quatro formas de restringir um template, sobrecarga por restrição, concepts padrão e static_assert.",
  },
  constexpr: {
    en: "Compile-time C++: constant expressions, constexpr functions, const vs constexpr vs consteval vs constinit, compile-time lookup tables and static_assert.",
    pt: "C++ em tempo de compilação: expressões constantes, funções constexpr, const vs constexpr vs consteval vs constinit, tabelas prontas e static_assert.",
  },
  ranges: {
    en: "C++ ranges and views: iterators and half-open ranges, range algorithms with projections, lazy view pipelines, and avoiding dangling views.",
    pt: "Ranges e views em C++: iteradores e intervalos semiabertos, algoritmos de range com projeções, pipelines preguiçosos de views e views que ficam soltas.",
  },
  errors: {
    en: "C++ error handling: exceptions and stack unwinding, std::optional and std::expected, error codes, noexcept, and why exceptions are slow only when thrown.",
    pt: "Tratamento de erros em C++: exceções e desempilhamento, std::optional e std::expected, códigos de erro, noexcept e por que exceções só custam quando lançadas.",
  },
  vocabulary: {
    en: "C++ vocabulary types: string_view and span, std::variant and visit, pair, tuple and structured bindings, and std::format with std::println.",
    pt: "Tipos vocabulário do C++: string_view e span, std::variant e visit, pair, tuple e structured bindings, e std::format com std::println.",
  },
  modules: {
    en: "C++20 modules: why #include makes builds slow, writing and importing a named module, interfaces, partitions, modules in CMake, and support in 2026.",
    pt: "Módulos do C++20: por que #include deixa a compilação lenta, escrever e importar um módulo, interfaces, partições, módulos no CMake e o suporte em 2026.",
  },
  concurrency: {
    en: "C++ threads and concurrency: std::jthread, data races explained at machine level, mutexes and atomics, deadlock, false sharing, async and future.",
    pt: "Threads e concorrência em C++: std::jthread, condições de corrida no nível da máquina, mutex e atomics, deadlock, false sharing, async e future.",
  },
  performance: {
    en: "C++ performance and data layout: benchmarking correctly, caches and cache lines, array of structs vs struct of arrays, branch prediction, allocation.",
    pt: "Desempenho e layout de dados em C++: medir corretamente, caches e linhas de cache, array de structs vs struct de arrays, predição de desvio e alocação.",
  },
  cpp26: {
    en: "What's new in C++26: static reflection with ^^ and splices, contracts, erroneous behaviour for uninitialised variables, and compiler support.",
    pt: "Novidades do C++26: reflexão estática com ^^ e splices, contratos, comportamento errôneo para variáveis não inicializadas e suporte dos compiladores.",
  },
  tooling: {
    en: "C++ tooling: compiler warnings worth enabling, AddressSanitizer and friends, using a debugger, target-based CMake, and package managers and analysers.",
    pt: "Ferramentas de C++: avisos do compilador que valem a pena, AddressSanitizer e cia., usar um depurador, CMake por targets, gerenciadores de pacotes e analisadores.",
  },
};

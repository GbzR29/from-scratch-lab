// src/lib/tracks/asm/descriptions.ts
// What search results show under each Assembly lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const asmDescriptions: LessonDescriptions = {
  "what-is-assembly": {
    en: "What is assembly language: machine code and assemblers, the fetch-decode-execute cycle, hexadecimal and little-endian, Intel vs AT&T syntax, NASM setup.",
    pt: "O que é assembly: código de máquina e montadores, o ciclo busca-decodifica-executa, hexadecimal e little-endian, sintaxe Intel vs AT&T e instalação do NASM.",
  },
  registers: {
    en: "x86-64 registers explained: the 16 general-purpose registers, rax/eax/ax/al names, the 32-bit zeroing rule, two's complement, and xor eax, eax.",
    pt: "Registradores x86-64 explicados: os 16 registradores de uso geral, nomes rax/eax/ax/al, a regra dos 32 bits, complemento de dois e xor eax, eax.",
  },
  "first-program": {
    en: "Your first x86-64 assembly program in NASM: .data and .text sections, _start, Linux write and exit system calls, assembling, linking and running it.",
    pt: "Seu primeiro programa em assembly x86-64 com NASM: seções .data e .text, _start, syscalls write e exit do Linux, montar, linkar e executar.",
  },
  "mov-addressing": {
    en: "The x86 mov instruction and addressing modes: operand sizes, brackets mean memory, base + index × scale + offset, lea, and RIP-relative addressing.",
    pt: "A instrução mov e os modos de endereçamento x86: tamanhos de operando, colchetes significam memória, base + índice × escala + deslocamento, lea e RIP-relative.",
  },
  "arithmetic-flags": {
    en: "x86 arithmetic and flags: add, sub, imul and idiv, the zero, sign, carry and overflow flags, cqo before division, and shr vs sar for dividing.",
    pt: "Aritmética e flags no x86: add, sub, imul e idiv, flags de zero, sinal, carry e overflow, cqo antes da divisão, e shr vs sar para dividir.",
  },
  "jumps-loops": {
    en: "Jumps and loops in assembly: cmp and test with conditional jumps, signed vs unsigned jumps, if/else and loops as labels, setcc and cmov.",
    pt: "Saltos e laços em assembly: cmp e test com saltos condicionais, saltos com e sem sinal, if/else e laços com labels, setcc e cmov.",
  },
  "stack-calls": {
    en: "The stack and function calls in x86-64: push and pop, call and ret, prologue and epilogue with rbp, local variables, recursion, and stack alignment.",
    pt: "A pilha e chamadas de função no x86-64: push e pop, call e ret, prólogo e epílogo com rbp, variáveis locais, recursão e alinhamento da pilha.",
  },
  "calling-convention": {
    en: "The System V x86-64 calling convention: argument registers, return values, caller- vs callee-saved registers, 16-byte alignment, calling C from assembly.",
    pt: "A convenção de chamada System V x86-64: registradores de argumentos, retorno, registradores salvos pelo chamador e pelo chamado, alinhamento e chamar C do assembly.",
  },
  "reading-compiler-output": {
    en: "Read compiler assembly output: gcc -S, objdump and Compiler Explorer, directives vs instructions, -O0 vs -O2, and a method for reading any function.",
    pt: "Lendo o assembly gerado pelo compilador: gcc -S, objdump e Compiler Explorer, diretivas vs instruções, -O0 vs -O2 e um método para ler qualquer função.",
  },
  "arrays-structs": {
    en: "Arrays and structs in assembly: address of a[i] and 2D arrays, struct field offsets and padding, gcc's lea tricks, and struc in NASM.",
    pt: "Arrays e structs em assembly: endereço de a[i] e arrays 2D, offsets de campos e padding, os truques de lea do gcc e struc no NASM.",
  },
  "floating-point": {
    en: "Floating point in x86-64 assembly: IEEE 754 doubles, why 0.1 + 0.2 ≠ 0.3, SSE xmm registers, movsd and addsd, conversions, comparisons and NaN.",
    pt: "Ponto flutuante em assembly x86-64: doubles IEEE 754, por que 0,1 + 0,2 ≠ 0,3, registradores xmm do SSE, movsd e addsd, conversões, comparações e NaN.",
  },
  "pointers-and-memory": {
    en: "Pointers in assembly: *p, p[i] and p->f as instructions, why NULL segfaults, optimisations that rely on undefined behaviour, ASan and volatile.",
    pt: "Ponteiros em assembly: *p, p[i] e p->f como instruções, por que NULL dá segfault, otimizações que dependem de comportamento indefinido, ASan e volatile.",
  },
  simd: {
    en: "SIMD with SSE and AVX: packed instructions and lanes, reading gcc's auto-vectorised loops, -ffast-math, and SIMD by hand in NASM and with intrinsics.",
    pt: "SIMD com SSE e AVX: instruções empacotadas e lanes, ler os laços vetorizados pelo gcc, -ffast-math e SIMD à mão em NASM e com intrinsics.",
  },
  "cpu-pipeline": {
    en: "How CPUs run code fast: pipelines and stalls, latency vs throughput, dependency chains, branch prediction, and L1, L2, L3 and RAM latencies.",
    pt: "Como a CPU executa rápido: pipelines e bolhas, latência vs vazão, cadeias de dependência, predição de desvios e latências de L1, L2, L3 e RAM.",
  },
  arm64: {
    en: "ARM64 assembly compared with x86-64: registers, zero and link registers, load/store architecture, fixed 4-byte instructions, and a complete Linux program.",
    pt: "Assembly ARM64 comparado ao x86-64: registradores, registrador zero e link register, arquitetura load/store, instruções de 4 bytes e um programa Linux completo.",
  },
  "inline-asm": {
    en: "GCC inline assembly: extended asm templates, outputs, inputs and clobbers, constraints, volatile and the memory clobber, rdtsc, and intrinsics instead.",
    pt: "Assembly inline no GCC: extended asm, saídas, entradas e clobbers, constraints, volatile e o clobber de memória, rdtsc, e quando preferir intrinsics.",
  },
};

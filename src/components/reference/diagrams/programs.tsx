// src/components/reference/diagrams/programs.tsx
// Shader-program drawings: the compile check with its two branches (and what
// the log looks like on three drivers), and how uniform blocks reach buffers
// through numbered binding points.

import { C, DiagramFrame, pick, T, useArrow } from "./frame";
import type { DiagramProps } from "./index";

// ── Compile check ─────────────────────────────────────────────────────────────

function Box({ x, y, w, h, lines, color }: { x: number; y: number; w: number; h: number; lines: string[]; color?: string }) {
  const mid = y + h / 2 - (lines.length - 1) * 8 + 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={color ?? "var(--bg)"} fillOpacity={color ? 0.14 : 1} stroke={color ?? "var(--border-strong, var(--border))"} />
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={mid + i * 16} textAnchor="middle" style={i === 0 ? T.strong : T.small}>{l}</text>
      ))}
    </g>
  );
}

export function ShaderCheckDiagram({ language }: DiagramProps) {
  const [defs, arrow] = useArrow("var(--text-muted)");
  const [defsG, arrowG] = useArrow(C.green);
  const [defsR, arrowR] = useArrow(C.red);
  const logs: [string, string][] = [
    ["NVIDIA", `0(12) : error C1008: undefined variable "colr"`],
    ["Mesa", "0:12(5): error: `colr' undeclared"],
    ["AMD", "ERROR: 0:12: 'colr' : undeclared identifier"],
  ];
  return (
    <DiagramFrame
      caption={pick(language,
        "glCompileShader returns nothing, so the program asks. GL_TRUE: attach the shader and link. GL_FALSE: ask how long the log is, read it with glGetShaderInfoLog and print it. The log has the same content on every driver but not the same shape: here one typo (colr for color) on line 12 of source string 0, as three drivers write it.",
        "O glCompileShader não devolve nada, então o programa pergunta. GL_TRUE: anexe o shader e linke. GL_FALSE: pergunte o tamanho do log, leia com glGetShaderInfoLog e imprima. O log diz a mesma coisa em todo driver, mas não do mesmo jeito: aqui um erro de digitação (colr em vez de color) na linha 12 da string 0 do código, como três drivers o escrevem.")}
    >
      <svg viewBox="0 0 640 310" width="100%" role="img" aria-label={pick(language, "shader compile check", "verificação de compilação do shader")}>
        {defs}{defsG}{defsR}
        <Box x={24} y={16} w={200} h={40} lines={["glShaderSource"]} />
        <Box x={24} y={80} w={200} h={40} lines={["glCompileShader"]} />
        <Box x={24} y={144} w={200} h={54} lines={["glGetShaderiv", "GL_COMPILE_STATUS"]} />
        <Box x={24} y={250} w={200} h={44} lines={["glAttachShader", pick(language, "then glLinkProgram", "depois glLinkProgram")]} color={C.green} />
        <line x1={124} y1={56} x2={124} y2={78} stroke="var(--text-muted)" markerEnd={arrow} />
        <line x1={124} y1={120} x2={124} y2={142} stroke="var(--text-muted)" markerEnd={arrow} />
        <line x1={124} y1={198} x2={124} y2={248} stroke={C.green} strokeWidth={1.4} markerEnd={arrowG} />
        <text x={132} y={228} style={{ ...T.label, fill: C.green }}>GL_TRUE</text>

        <Box x={284} y={144} w={166} h={54} lines={["glGetShaderiv", "GL_INFO_LOG_LENGTH"]} color={C.red} />
        <Box x={466} y={144} w={160} h={54} lines={["glGetShaderInfoLog", pick(language, "fills your buffer", "enche o seu buffer")]} color={C.red} />
        <line x1={224} y1={171} x2={282} y2={171} stroke={C.red} strokeWidth={1.4} markerEnd={arrowR} />
        <text x={228} y={163} style={{ ...T.small, fill: C.red }}>GL_FALSE</text>
        <line x1={450} y1={171} x2={464} y2={171} stroke={C.red} strokeWidth={1.4} markerEnd={arrowR} />
        <text x={367} y={216} textAnchor="middle" style={T.small}>{pick(language, "length counts the \\0", "o tamanho conta o \\0")}</text>
        <text x={546} y={216} textAnchor="middle" style={T.small}>{pick(language, "print, glDeleteShader", "imprima, glDeleteShader")}</text>
        <line x1={546} y1={144} x2={546} y2={120} stroke={C.red} strokeWidth={1.4} markerEnd={arrowR} />

        <rect x={250} y={16} width={380} height={102} rx={6} fill="var(--code-bg, var(--bg))" stroke="var(--border)" />
        <text x={264} y={36} style={T.label}>{pick(language, "the log: one typo, three drivers", "o log: um erro, três drivers")}</text>
        {logs.map(([who, line], i) => (
          <g key={who}>
            <text x={264} y={60 + i * 20} style={{ ...T.small, fill: C.gray }}>{who}</text>
            <text x={318} y={60 + i * 20} style={{ ...T.small, fill: C.red }}>{line}</text>
          </g>
        ))}
      </svg>
    </DiagramFrame>
  );
}

// ── Uniform blocks: index vs binding point ────────────────────────────────────

export function UniformBlocksDiagram({ language }: DiagramProps) {
  const [defsO, arrowO] = useArrow(C.orange);
  const [defsB, arrowB] = useArrow(C.blue);
  const sockets = [0, 1, 2, 3].map((n) => ({ n, y: 44 + n * 52 }));
  const sy = (n: number) => sockets[n].y + 15;
  const block = (x: number, y: number, name: string, idx: number, color: string) => (
    <g>
      <rect x={x} y={y - 15} width={170} height={26} rx={4} fill={color} fillOpacity={0.16} stroke={color} />
      <text x={x + 10} y={y + 3} style={T.strong}>{name}</text>
      <text x={x + 160} y={y + 3} textAnchor="end" style={T.small}>index {idx}</text>
    </g>
  );
  return (
    <DiagramFrame
      caption={pick(language,
        "The index is a number the linker gives each block inside one program, in whatever order it likes: Matrices is index 0 in program A and index 1 in program B. The binding point is a slot you choose, shared by every program. glUniformBlockBinding plugs a program's block into a slot; glBindBufferBase plugs a buffer into the same slot. Both programs now read uboCamera, although their indexes differ.",
        "O índice é um número que o linker dá a cada bloco dentro de um programa, na ordem que quiser: Matrices é o índice 0 no programa A e o índice 1 no programa B. O binding point é um slot que você escolhe, comum a todos os programas. O glUniformBlockBinding pluga o bloco de um programa num slot; o glBindBufferBase pluga um buffer no mesmo slot. Os dois programas agora leem o uboCamera, embora os seus índices sejam diferentes.")}
    >
      <svg viewBox="0 0 640 270" width="100%" role="img" aria-label={pick(language, "uniform block binding points", "binding points de uniform blocks")}>
        {defsO}{defsB}
        <text x={262} y={20} textAnchor="middle" style={T.small}>glUniformBlockBinding</text>
        <text x={432} y={20} textAnchor="middle" style={T.small}>glBindBufferBase</text>

        <rect x={14} y={34} width={190} height={70} rx={6} fill="none" stroke="var(--border-strong, var(--border))" />
        <text x={24} y={52} style={T.label}>{pick(language, "program A", "programa A")}</text>
        {block(24, 80, "Matrices", 0, C.orange)}

        <rect x={14} y={134} width={190} height={110} rx={6} fill="none" stroke="var(--border-strong, var(--border))" />
        <text x={24} y={152} style={T.label}>{pick(language, "program B", "programa B")}</text>
        {block(24, 180, "Lights", 0, C.blue)}
        {block(24, 220, "Matrices", 1, C.orange)}

        {sockets.map((s) => (
          <g key={s.n}>
            <rect x={322} y={s.y} width={52} height={30} rx={5} fill="var(--bg)" stroke="var(--text-muted)" />
            <text x={348} y={s.y + 19} textAnchor="middle" style={T.strong}>{s.n}</text>
          </g>
        ))}
        <text x={348} y={260} textAnchor="middle" style={T.small}>{pick(language, "binding points", "binding points")}</text>

        <line x1={194} y1={80} x2={320} y2={sy(0) - 3} stroke={C.orange} strokeWidth={1.4} markerEnd={arrowO} />
        <line x1={194} y1={220} x2={320} y2={sy(0) + 4} stroke={C.orange} strokeWidth={1.4} markerEnd={arrowO} />
        <line x1={194} y1={180} x2={320} y2={sy(1)} stroke={C.blue} strokeWidth={1.4} markerEnd={arrowB} />

        <rect x={478} y={sockets[0].y - 4} width={148} height={38} rx={6} fill={C.orange} fillOpacity={0.16} stroke={C.orange} />
        <text x={552} y={sockets[0].y + 19} textAnchor="middle" style={T.strong}>uboCamera</text>
        <rect x={478} y={sockets[1].y - 4} width={148} height={38} rx={6} fill={C.blue} fillOpacity={0.16} stroke={C.blue} />
        <text x={552} y={sockets[1].y + 19} textAnchor="middle" style={T.strong}>uboLights</text>
        <line x1={476} y1={sy(0)} x2={376} y2={sy(0)} stroke={C.orange} strokeWidth={1.4} markerEnd={arrowO} />
        <line x1={476} y1={sy(1)} x2={376} y2={sy(1)} stroke={C.blue} strokeWidth={1.4} markerEnd={arrowB} />
      </svg>
    </DiagramFrame>
  );
}

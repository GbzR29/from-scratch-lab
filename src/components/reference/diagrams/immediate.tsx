// src/components/reference/diagrams/immediate.tsx
// Legacy immediate mode: where glVertex2f puts its vertices (the −1…1 square
// when no matrix is set) and how each vertex takes the colour set before it.

import { C, DiagramFrame, pick, T } from "./frame";
import type { DiagramProps } from "./index";

type V = { x: number; y: number; col: string; name: string };

export function ImmediateDiagram({ language }: DiagramProps) {
  const S = 180, X0 = 40, Y0 = 40;
  const at = (nx: number, ny: number) => [X0 + ((nx + 1) / 2) * S, Y0 + ((1 - ny) / 2) * S] as const;
  const verts: V[] = [
    { x: -0.5, y: -0.5, col: C.red, name: pick(language, "red", "vermelho") },
    { x: 0.5, y: -0.5, col: C.green, name: pick(language, "green", "verde") },
    { x: 0, y: 0.5, col: C.blue, name: pick(language, "blue", "azul") },
  ];
  const pts = verts.map((v) => at(v.x, v.y));
  const calls: { code: string; note: string; col?: string; dot?: boolean }[] = [
    { code: "glBegin(GL_TRIANGLES);", note: pick(language, "start collecting", "começa a juntar") },
    { code: "glColor3f(1, 0, 0);", note: pick(language, "current colour = red", "cor atual = vermelho"), col: C.red },
    { code: "glVertex2f(-0.5f, -0.5f);", note: pick(language, "vertex 0, takes red", "vértice 0, leva vermelho"), col: C.red, dot: true },
    { code: "glColor3f(0, 1, 0);", note: pick(language, "current colour = green", "cor atual = verde"), col: C.green },
    { code: "glVertex2f( 0.5f, -0.5f);", note: pick(language, "vertex 1, takes green", "vértice 1, leva verde"), col: C.green, dot: true },
    { code: "glColor3f(0, 0, 1);", note: pick(language, "current colour = blue", "cor atual = azul"), col: C.blue },
    { code: "glVertex2f( 0.0f,  0.5f);", note: pick(language, "vertex 2: triangle full", "vértice 2: triângulo completo"), col: C.blue, dot: true },
    { code: "glEnd();", note: pick(language, "stop", "para") },
  ];
  return (
    <DiagramFrame
      caption={pick(language,
        "Left: with no matrix set, glVertex2f(x, y) is a point in the square from −1 to 1, with (0, 0) in the middle of the window and y pointing up. Right: OpenGL keeps a current colour; glColor3f changes it, and every glVertex2f takes a copy of whatever it is at that moment. Every three vertices make one GL_TRIANGLES triangle, and the colours blend across it.",
        "Esquerda: sem nenhuma matriz definida, glVertex2f(x, y) é um ponto no quadrado de −1 a 1, com (0, 0) no meio da janela e o y para cima. Direita: o OpenGL guarda uma cor atual; o glColor3f a muda, e cada glVertex2f leva uma cópia do que ela for naquele momento. Cada três vértices formam um triângulo GL_TRIANGLES, e as cores se misturam nele.")}
    >
      <svg viewBox="0 0 700 270" width="100%" role="img" aria-label={pick(language, "glVertex2f in normalized coordinates", "glVertex2f em coordenadas normalizadas")}>
        <rect x={X0} y={Y0} width={S} height={S} fill="none" stroke="var(--text-muted)" />
        <line x1={X0 + S / 2} y1={Y0} x2={X0 + S / 2} y2={Y0 + S} stroke="var(--border)" />
        <line x1={X0} y1={Y0 + S / 2} x2={X0 + S} y2={Y0 + S / 2} stroke="var(--border)" />
        <text x={X0} y={Y0 + S + 18} textAnchor="middle" style={T.small}>−1</text>
        <text x={X0 + S} y={Y0 + S + 18} textAnchor="middle" style={T.small}>1</text>
        <text x={X0 - 8} y={Y0 + S + 4} textAnchor="end" style={T.small}>−1</text>
        <text x={X0 - 8} y={Y0 + 4} textAnchor="end" style={T.small}>1</text>
        <text x={X0 + S / 2} y={Y0 + S / 2 + 16} textAnchor="middle" style={T.small}>(0, 0)</text>
        <text x={X0 + S / 2} y={Y0 - 12} textAnchor="middle" style={T.strong}>{pick(language, "the window, in NDC", "a janela, em NDC")}</text>
        <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={C.gray} fillOpacity={0.16} stroke="var(--text-muted)" strokeWidth={1.2} />
        {verts.map((v, i) => {
          const [px, py] = pts[i];
          const below = v.y < 0;
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={6} fill={v.col} />
              <text x={px} y={below ? py + 20 : py - 11} textAnchor="middle" style={T.small}>
                ({v.x}, {v.y})
              </text>
            </g>
          );
        })}

        {calls.map((c, i) => {
          const y = 34 + i * 28;
          return (
            <g key={i}>
              {c.col && <circle cx={286} cy={y - 4} r={c.dot ? 6 : 3.5} fill={c.dot ? c.col : "none"} stroke={c.col} strokeWidth={1.5} />}
              <text x={300} y={y} style={c.dot ? T.strong : T.label}>{c.code}</text>
              <text x={500} y={y} style={T.small}>{c.note}</text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

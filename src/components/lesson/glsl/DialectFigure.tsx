"use client";

import { useEffect, useRef, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, C } from "@/components/lesson/kit/figure";
import { claimContext, releaseContext } from "../kit/gl/context";
import { DIALECTS, SOURCES, NOTES, parseSource, type DialectId, type Stage } from "./dialects";

// ── What this figure shows ────────────────────────────────────────────────────
// One textured, lit shader pair written in five GLSL dialects (dialects.ts).
// Lines that are specific to the chosen dialect carry a number, explained
// under the code. "Compile here" hands the exact text to this browser's own
// GLSL compiler and prints its log: WebGL 2 accepts only the two ES dialects,
// and the errors for the others are the real ones.

type Result = { ok: boolean; log: string };

export function DialectFigure({ t }: { t?: TrackTranslations }) {
  const [dialect, setDialect] = useState<DialectId>("gl330");
  const [stage, setStage] = useState<Stage>("vert");
  const [result, setResult] = useState<Record<Stage, Result> | null>(null);
  const ctx = useRef<{ canvas: HTMLCanvasElement; gl: WebGL2RenderingContext } | null>(null);

  useEffect(() => {
    const c = ctx.current;
    if (c) claimContext(c.canvas);
    return () => { if (ctx.current) releaseContext(ctx.current.canvas, ctx.current.gl); ctx.current = null; };
  }, []);

  const pick = (d: DialectId) => { setDialect(d); setResult(null); };
  const { lines } = parseSource(SOURCES[dialect][stage]);
  const keys = lines.map(l => l.key).filter((k): k is string => !!k);
  const info = DIALECTS.find(d => d.id === dialect)!;

  const compile = () => {
    if (!ctx.current) {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      if (!gl) { setResult({ vert: { ok: false, log: "WebGL2 is not available in this browser." }, frag: { ok: false, log: "" } }); return; }
      ctx.current = { canvas, gl };
    }
    const gl = ctx.current.gl;
    const run = (s: Stage): Result => {
      const sh = gl.createShader(s === "vert" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;
      gl.shaderSource(sh, parseSource(SOURCES[dialect][s]).code);
      gl.compileShader(sh);
      const ok = !!gl.getShaderParameter(sh, gl.COMPILE_STATUS);
      const log = (gl.getShaderInfoLog(sh) ?? "").trim();
      gl.deleteShader(sh);
      return { ok, log };
    };
    setResult({ vert: run("vert"), frag: run("frag") });
  };

  return (
    <Figure title={tx(t, "figDialect_title", "One shader, five dialects")}
      head={<>
        <Btn active={stage === "vert"} onClick={() => setStage("vert")}>{tx(t, "figDialect_vert", "vertex")}</Btn>
        <Btn active={stage === "frag"} onClick={() => setStage("frag")}>{tx(t, "figDialect_frag", "fragment")}</Btn>
      </>}
      controls={<>
        <Row>
          {DIALECTS.map(d => <Btn key={d.id} active={dialect === d.id} onClick={() => pick(d.id)}>{d.label}</Btn>)}
        </Row>
        <Row>
          <Btn onClick={compile}>{tx(t, "figDialect_compile", "compile it in this browser")}</Btn>
          {result && (["vert", "frag"] as Stage[]).map(s => (
            <span key={s} className="text-[11px] font-mono mr-3" style={{ color: result[s].ok ? C.green : C.red }}>
              {`${s === "vert" ? tx(t, "figDialect_vert", "vertex") : tx(t, "figDialect_frag", "fragment")}: ${result[s].ok ? tx(t, "figDialect_ok", "compiled") : tx(t, "figDialect_failed", "rejected")}`}
            </span>
          ))}
        </Row>
        {result && (result.vert.log || result.frag.log) && (
          <pre className="text-[11px] font-mono whitespace-pre-wrap leading-snug p-2 rounded bg-[var(--code-bg)] text-[var(--text-muted)]">
            {(["vert", "frag"] as Stage[]).filter(s => result[s].log).map(s => `${s === "vert" ? "vertex" : "fragment"}:\n${result[s].log}`).join("\n\n")}
          </pre>
        )}
      </>}
      note={tx(t, "figDialect_note", "Pick a dialect and switch between the two stages. The numbered lines are the ones that change from dialect to dialect; the body of main() is the same in all five. \"Compile\" gives the exact text to the GLSL compiler inside this browser. WebGL 2 speaks only GLSL ES, so it accepts ES 1.00 and ES 3.00 and rejects the rest with its real error messages.")}>
      <div className="rounded bg-[var(--code-bg)] p-3 overflow-x-auto">
        <p className="text-[11px] font-mono mb-2" style={{ color: C.amber }}>{`${info.label} → ${info.target}`}</p>
        <pre className="text-[12px] font-mono leading-relaxed">
          {lines.map((l, i) => {
            const n = l.key ? keys.indexOf(l.key) + 1 : 0;
            return (
              <div key={i} className="flex gap-2" style={l.key ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                <span className="w-5 shrink-0 text-right select-none text-[var(--text-muted)] opacity-50">{i + 1}</span>
                <span className="text-[var(--text-main)] whitespace-pre">{l.text}</span>
                {l.key && <span className="select-none font-bold text-[var(--primary)]">{`← ${n}`}</span>}
              </div>
            );
          })}
        </pre>
      </div>
      <ol className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-[var(--text-main)]">
        {keys.map((k, i) => (
          <li key={k} className="flex gap-2">
            <span className="w-5 shrink-0 text-right font-mono text-[var(--primary)]">{i + 1}</span>
            <span>{tx(t, `figDialect_n_${k}`, NOTES[k])}</span>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

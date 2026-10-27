"use client";

import { useEffect, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, Row, Readout, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// One SDL_AppIterate of the GPU project, a line at a time. The CPU lane runs
// your code; the calls between Begin and End only RECORD commands into the
// command buffer, and the GPU lane stays idle until Submit hands the whole
// buffer over; then the GPU runs it and the window shows the result. Each
// line can be unticked to see what breaks; the messages are SDL 3.4.18's own
// (SDL_gpu.c, debug mode). "Minimized" makes the acquire return NULL, which
// is not an error: the frame is skipped.

type Line = { code: string; cmd?: string; optional: boolean };
const LINES: Line[] = [
  { code: "cmd = SDL_AcquireGPUCommandBuffer(device);", optional: false },
  { code: "SDL_WaitAndAcquireGPUSwapchainTexture(cmd, window, &swapchain, …);", cmd: "acquire swapchain", optional: true },
  { code: "if (!swapchain) { SDL_SubmitGPUCommandBuffer(cmd); return; }", optional: false },
  { code: "pass = SDL_BeginGPURenderPass(cmd, &color, 1, nullptr);", cmd: "begin pass · clear", optional: true },
  { code: "SDL_BindGPUGraphicsPipeline(pass, pipeline);", cmd: "bind pipeline", optional: true },
  { code: "SDL_BindGPUVertexBuffers(pass, 0, &binding, 1);", cmd: "bind vertex buffer", optional: true },
  { code: "SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);", cmd: "draw 3 vertices", optional: true },
  { code: "SDL_EndGPURenderPass(pass);", cmd: "end pass", optional: true },
  { code: "SDL_SubmitGPUCommandBuffer(cmd);", optional: true },
];
type Screen = "none" | "triangle" | "clear" | "garbage" | "undefined";

/** What the frame does with these lines switched off. */
function outcome(off: Set<number>, minimized: boolean) {
  const skip = minimized || off.has(1);                       // swapchain stays NULL → the early return
  const ran = skip ? [0, 1, 2].filter(i => !off.has(i)) : LINES.map((_, i) => i).filter(i => !off.has(i));
  const recorded = ran.filter(i => LINES[i].cmd && !(off.has(3) && i > 3));
  let screen: Screen = "triangle", msg = "", err = "";
  if (minimized) { screen = "none"; msg = "min"; }
  else if (off.has(1)) { screen = "none"; msg = "noAcquire"; }
  else if (off.has(7)) { screen = "none"; msg = "noEnd"; err = "Cannot submit command buffer while a pass is in progress!"; }
  else if (off.has(8)) { screen = "none"; msg = "noSubmit"; }
  else if (off.has(3)) { screen = "garbage"; msg = "noBegin"; err = "Parameter 'render_pass' is invalid"; }
  else if (off.has(4)) { screen = "clear"; msg = "noPipeline"; err = "Graphics pipeline not bound!"; }
  else if (off.has(5)) { screen = "undefined"; msg = "noVertex"; }
  else if (off.has(6)) { screen = "clear"; msg = "noDraw"; }
  return { ran, recorded, screen, msg, err, submitted: skip || !off.has(8) && !off.has(7) };
}

export function GpuFrameFigure({ t }: { t?: TrackTranslations }) {
  const [off, setOff] = useState<Set<number>>(new Set());
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState(-1);                       // last CPU line run; LINES.length + k = GPU command k
  const [auto, setAuto] = useState(false);

  const o = outcome(off, minimized);
  const gpuCmds = o.submitted ? o.recorded : [];
  const last = o.ran.length + gpuCmds.length;                 // total steps of this frame
  const cpuDone = o.ran.filter((_, k) => k <= step).length;
  const ranSoFar = o.ran.slice(0, Math.min(step + 1, o.ran.length));
  const gpuSoFar = Math.max(0, step + 1 - o.ran.length);
  const finished = step >= last - 1;

  useEffect(() => {
    if (!auto) return;
    if (finished) { setAuto(false); return; }
    const id = setTimeout(() => setStep(s => s + 1), 420);
    return () => clearTimeout(id);
  }, [auto, step, finished]);

  const reset = () => { setStep(-1); setAuto(false); };
  const toggle = (i: number) => { const n = new Set(off); if (n.has(i)) n.delete(i); else n.add(i); setOff(n); reset(); };

  const msgs: Record<string, string> = {
    min: tx(t, "figSdlGpuFrame_min", "The window is minimized: the acquire succeeds but gives NULL. That is not an error. The empty command buffer is submitted and the frame is skipped; drawing resumes when the window comes back."),
    noAcquire: tx(t, "figSdlGpuFrame_noAcquire", "Without the acquire, swapchain stays nullptr, so the check takes it for a minimized window and skips every frame. The window never shows anything."),
    noBegin: tx(t, "figSdlGpuFrame_noBegin", "pass is NULL, so binding, drawing and ending fail with an invalid-parameter error. The swapchain texture is still presented at submit, never cleared: its contents are undefined, often garbage."),
    noPipeline: tx(t, "figSdlGpuFrame_noPipeline", "In debug mode the draw stops with this assertion and is skipped. The GPU has no shaders to run. The pass still clears, so the window shows only the clear colour."),
    noVertex: tx(t, "figSdlGpuFrame_noVertex", "SDL does not check this one. The pipeline reads vertex slot 0 and nothing is bound there: the Vulkan validation layer reports it, and the result is undefined: nothing, garbage, or a lost device."),
    noDraw: tx(t, "figSdlGpuFrame_noDraw", "No error at all: the pass clears and ends, and nothing was asked to be drawn. Only the clear colour."),
    noEnd: tx(t, "figSdlGpuFrame_noEnd", "Submit refuses a command buffer with a pass still open and returns false. Nothing reaches the GPU, nothing is presented."),
    noSubmit: tx(t, "figSdlGpuFrame_noSubmit", "Every command was recorded, and none of it ever reaches the GPU. Recording is not drawing: without submit, the window never changes."),
  };

  // ── Drawing: the window as it looks after this frame ──
  const shown: Screen = finished ? o.screen : "none";
  const W = 220, H = 130;

  return (
    <Figure
      title={tx(t, "figSdlGpuFrame_title", "Recording is not drawing: one GPU frame")}
      head={<>
        <Btn active={minimized} onClick={() => { setMinimized(!minimized); reset(); }}>{tx(t, "figSdlGpuFrame_minimized", "minimized")}</Btn>
        <Btn onClick={() => { if (finished) setStep(-1); setAuto(true); }}>{tx(t, "figSdlGpuFrame_run", "run frame")}</Btn>
        <Btn onClick={() => setStep(s => (s >= last - 1 ? -1 : s + 1))}>{tx(t, "figSdlGpuFrame_step", "step")}</Btn>
      </>}
      controls={
        <div className="space-y-3">
          <Row>
            <Readout color={C.sky}>CPU: {cpuDone}/{o.ran.length}</Readout>
            <Readout color={C.amber}>{tx(t, "figSdlGpuFrame_buffer", "command buffer")}: {ranSoFar.filter(i => LINES[i].cmd && o.recorded.includes(i)).length}</Readout>
            <Readout color={gpuSoFar ? C.green : C.muted}>GPU: {gpuSoFar ? `${Math.min(gpuSoFar, gpuCmds.length)}/${gpuCmds.length}` : tx(t, "figSdlGpuFrame_idle", "idle")}</Readout>
          </Row>
          {finished && o.msg && (
            <div className="text-[12.5px] leading-relaxed text-[var(--text-main)] space-y-1">
              {o.err && <p className="font-mono text-[12px]" style={{ color: C.red }}>{o.err}</p>}
              <p>{msgs[o.msg]}</p>
            </div>
          )}
          {finished && !o.msg && (
            <p className="text-[12.5px] leading-relaxed text-[var(--text-main)]">
              {tx(t, "figSdlGpuFrame_ok", "The whole frame reached the GPU at once, at submit, and the swapchain texture was presented with it. Untick a line to see what breaks.")}
            </p>
          )}
        </div>
      }
      note={tx(t, "figSdlGpuFrame_note", "Step through the frame. The calls between begin and end return at once: they only add commands to the command buffer, and the GPU lane stays idle. At submit, the GPU receives the whole buffer and runs it, and the swapchain texture is presented. Untick a line to remove it from the code.")}
    >
      <div className="p-3 md:p-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <ol className="font-mono text-[11.5px] leading-[1.9] min-w-0">
          {LINES.map((l, i) => {
            const isOff = off.has(i), ranIt = ranSoFar.includes(i), current = o.ran[step] === i;
            const skipped = !isOff && !o.ran.includes(i);
            return (
              <li key={i} className="flex items-center gap-2 min-w-0" style={{ opacity: isOff || skipped ? 0.45 : 1 }}>
                {l.optional
                  ? <input type="checkbox" checked={!isOff} onChange={() => toggle(i)} aria-label={l.code} className="accent-[var(--primary)] flex-shrink-0" />
                  : <span className="w-[13px] flex-shrink-0" />}
                <span className="truncate px-1 rounded"
                  style={{ textDecoration: isOff ? "line-through" : undefined, background: current ? "var(--primary-low)" : undefined, color: ranIt ? C.fg : C.muted }}>
                  {l.code}
                </span>
                {ranIt && l.cmd && o.recorded.includes(i) && <span className="text-[10px] flex-shrink-0" style={{ color: C.amber }}>→ {tx(t, "figSdlGpuFrame_rec", "recorded")}</span>}
              </li>
            );
          })}
        </ol>
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-[var(--text-muted)]">
            {tx(t, "figSdlGpuFrame_buffer", "command buffer")} → GPU{" "}
            <span style={{ color: gpuSoFar ? C.green : C.muted }}>
              ({gpuSoFar ? (gpuSoFar >= gpuCmds.length ? tx(t, "figSdlGpuFrame_done", "done") : tx(t, "figSdlGpuFrame_running", "running")) : tx(t, "figSdlGpuFrame_idle", "idle")})
            </span>
          </div>
          <div className="flex flex-wrap gap-1 max-w-[220px] min-h-[22px]">
            {ranSoFar.filter(i => o.recorded.includes(i)).map(i => {
              const k = gpuCmds.indexOf(i), ran = k >= 0 && k < gpuSoFar;
              return (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ borderColor: ran ? C.green : C.amber, color: ran ? C.green : C.amber }}>{LINES[i].cmd}</span>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)]">{tx(t, "figSdlGpuFrame_window", "window")}</div>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={tx(t, "figSdlGpuFrame_aria", "the window after this frame")}>
            <defs>
              {/* the vertex colours, approximated: blue → green along the base, red fading in towards the top */}
              <linearGradient id="gpuTriBase" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#4d80ff" /><stop offset="1" stopColor="#4dff66" />
              </linearGradient>
              <linearGradient id="gpuTriTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff4d4d" /><stop offset="1" stopColor="#ff4d4d" stopOpacity={0} />
              </linearGradient>
              <pattern id="gpuNoise" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#3b0764" /><rect width="4" height="2" fill="#16a34a" /><rect x="4" y="5" width="4" height="2" fill="#eab308" /><rect x="1" y="3" width="2" height="2" fill="#f43f5e" />
              </pattern>
            </defs>
            <rect width={W} height={H} rx={4} fill={shown === "none" ? "#05060a" : shown === "garbage" ? "url(#gpuNoise)" : "#10121a"} stroke="var(--border)" />
            {shown === "triangle" && <>
              <polygon points={`${W / 2},${H * 0.2} ${W * 0.8},${H * 0.75} ${W * 0.2},${H * 0.75}`} fill="url(#gpuTriBase)" />
              <polygon points={`${W / 2},${H * 0.2} ${W * 0.8},${H * 0.75} ${W * 0.2},${H * 0.75}`} fill="url(#gpuTriTop)" />
            </>}
            {shown === "undefined" && <text x={W / 2} y={H / 2 + 8} textAnchor="middle" style={{ fontSize: 28, fill: C.amber }}>?</text>}
            {shown === "none" && <text x={W / 2} y={H / 2 + 4} textAnchor="middle" style={{ fontSize: 10, fill: C.muted }}>{finished ? tx(t, "figSdlGpuFrame_nothing", "nothing presented") : tx(t, "figSdlGpuFrame_prev", "still the previous frame")}</text>}
          </svg>
        </div>
      </div>
    </Figure>
  );
}

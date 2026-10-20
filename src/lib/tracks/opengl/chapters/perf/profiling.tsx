"use client";

// "Measuring Performance" (Performance): frame time, CPU/GPU overlap, timer queries and finding the bottleneck.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { fpsNumbers } from "@/lib/tracks/opengl/live/profiling";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { FrameTimelineFigure } from "@/components/lesson/figures/perf/FrameTimelineFigure";
import { BottleneckLabFigure } from "@/components/lesson/figures/perf/BottleneckLabFigure";

const r = String.raw;

export function ProfilingContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglProf_intro",
          "Optimising without measuring is guessing, and in graphics the guesses are usually wrong. The GPU runs asynchronously, far behind the CPU, so a slow line of C++ may cost nothing while an innocent-looking call stalls everything. This chapter is about finding the actual bottleneck before touching any code. The rest of the section is about what to do once you know it.")}
      </Lead>

      <Goals t={t} id="oglProf" items={[
        "Measure the cost of a frame in milliseconds instead of FPS.",
        "Time GPU work with timer queries.",
        "Find out by experiment whether the CPU or the GPU is the bottleneck.",
        "Pick the right profiling tool.",
      ]} />

      <H2>{tx(t, "oglProf_msTitle", "Think in milliseconds, not FPS")}</H2>
      <Equation label={tx(t, "oglProf_msLabel", "Frame time and frame rate")}
        where={[
          [r`T`, tx(t, "oglProf_wT", "frame time in milliseconds")],
          [r`\text{FPS}`, tx(t, "oglProf_wFps", "frames per second; a second has 1000 ms, hence the 1000")],
          [r`\Delta T`, tx(t, "oglProf_wDT", "how many milliseconds a change added to (or saved from) every frame")],
        ]}
        words={tx(t, "oglProf_msWords", "Frames per second is 1000 divided by the milliseconds one frame takes. To know what a change really cost, turn both frame rates back into milliseconds and subtract.")}
        note={tx(t, "oglProf_msNote", "FPS is the reciprocal of what you pay, so its changes are misleading. Going from 60 to 50 fps costs 3.3 ms, while 200 to 150 fps costs only 1.7 ms. Costs add in milliseconds: a 2 ms shadow pass plus a 3 ms post chain is 5 ms. At 60 Hz the whole budget is 16.7 ms, at 144 Hz 6.9 ms, and in VR at 90 Hz 11.1 ms, with some kept free for the compositor.")}>
        {r`\text{FPS} = \frac{1000}{T} \qquad \Delta T = \frac{1000}{\text{FPS}_{new}} - \frac{1000}{\text{FPS}_{old}}`}
      </Equation>
      <LiveFormula label={tx(t, "oglProf_msLive", "Try it: what a drop in FPS really costs")}
        tex={r`\Delta T = \frac{1000}{\text{FPS}_{new}} - \frac{1000}{\text{FPS}_{old}}`}
        vars={[
          { id: "a", label: <>FPS<sub>old</sub></>, min: 20, max: 240, step: 1, value: 200, fmt: v => `${v}` },
          { id: "b", label: <>FPS<sub>new</sub></>, min: 20, max: 240, step: 1, value: 150, fmt: v => `${v}` },
        ]}
        compute={fpsNumbers(t)}
        note={tx(t, "oglProf_msLiveNote", "A drop of 50 fps, from 200 to 150, costs 1.7 ms. A drop of only 30 fps, from 60 to 30, costs 16.7 ms: ten times more work. Set 60 → 50 and then 50 → 40: equal steps in FPS, but the second costs 5 ms against 3.3 ms. A profiler that reports FPS hides this; one that reports milliseconds shows it directly.")} />

      <H2>{tx(t, "oglProf_pipeTitle", "Two processors on an assembly line")}</H2>
      <p>
        {tx(t, "oglProf_pipeBody",
          "GL calls do not execute when you make them. The driver records them into a command buffer that the GPU consumes a frame or two later. The CPU and the GPU therefore work in parallel on different frames, and the frame time is set by whichever of the two is slower. Speeding up the other one changes nothing, which is why guessing so often fails.")}
      </p>
      <Equation label={tx(t, "oglProf_boundLabel", "Steady-state frame time")}
        where={[
          [r`T_{CPU},\ T_{GPU}`, tx(t, "oglProf_wCG", "time each processor spends per frame")],
          [r`T_{vsync}`, tx(t, "oglProf_wV", "refresh interval, 16.7 ms at 60 Hz")],
          [r`\lceil\ \rceil`, tx(t, "oglProf_wCeil", "round up to the next whole number: a frame can only be shown at a refresh, never between two")],
          [r`T_{sync}`, tx(t, "oglProf_wSync", "frame time when the CPU waits for the GPU every frame, so they no longer overlap")],
        ]}
        words={tx(t, "oglProf_boundWords", "The CPU and the GPU work at the same time on different frames, so a frame takes as long as the slower of the two. With vsync that time is rounded up to whole refresh intervals. If the CPU has to wait for the GPU's result, the overlap is gone and the two times add up.")}
        note={tx(t, "oglProf_boundNote", "With vsync, a frame that misses the refresh by a little waits for the next one: 17 ms of work shows as 33.3 ms (30 fps) with double buffering. A synchronisation point, like reading a result back, breaks the overlap, and the two times add instead.")}>
        {r`\begin{gathered} T \approx \max(T_{CPU},\ T_{GPU}) \;\xrightarrow{\text{vsync}}\; \left\lceil \frac{\max(T_{CPU}, T_{GPU})}{T_{vsync}} \right\rceil T_{vsync} \\[6pt] T_{sync} \approx T_{CPU} + T_{GPU} \end{gathered}`}
      </Equation>
      <FrameTimelineFigure t={t} />

      <H2>{tx(t, "oglProf_gpuTitle", "Timing the GPU: timer queries")}</H2>
      <p>
        {tx(t, "oglProf_gpuBody",
          "std::chrono around a glDrawElements measures how long it took to record the command, not to execute it. To time GPU work, ask the GPU: a GL_TIME_ELAPSED query brackets a range of commands, and the GPU writes the elapsed nanoseconds when it gets there. Reading the result immediately would stall until the GPU catches up, so keep a small ring of queries and read the one from a few frames ago:")}
      </p>
      <CodeBlock lang="cpp" filename="gpu_timer.cpp" t={t}>{`struct GpuTimer {
    static constexpr int N = 4;              // > frames in flight: results are ready when read
    GLuint q[N];  int frame = 0;  double ms = 0;

    void init()  { glGenQueries(N, q); }
    void begin() { glBeginQuery(GL_TIME_ELAPSED, q[frame % N]); }
    void end() {
        glEndQuery(GL_TIME_ELAPSED);
        ++frame;
        if (frame >= N) {                    // the oldest query, N − 1 frames old
            GLuint oldest = q[frame % N], ready = 0;
            glGetQueryObjectuiv(oldest, GL_QUERY_RESULT_AVAILABLE, &ready);
            if (ready) {
                GLuint64 ns;
                glGetQueryObjectui64v(oldest, GL_QUERY_RESULT, &ns);
                ms = ms * 0.9 + (ns / 1e6) * 0.1;   // smooth: single frames are noisy
            }
        }
    }
};

shadowTimer.begin();  renderShadows();  shadowTimer.end();
gbufferTimer.begin(); renderGBuffer();  gbufferTimer.end();`}</CodeBlock>
      <p>
        {tx(t, "oglProf_nestBody",
          "GL_TIME_ELAPSED queries cannot be nested. For a hierarchical profiler (frame → pass → sub-pass), use glQueryCounter(q, GL_TIMESTAMP) at every boundary instead: each gives an absolute GPU time, and differences give every range. Label the same ranges with glPushDebugGroup so they show up by name in RenderDoc and Nsight.")}
      </p>

      <H2>{tx(t, "oglProf_findTitle", "Finding the bottleneck by experiment")}</H2>
      <p>
        {tx(t, "oglProf_findBody",
          "A frame is limited by exactly one thing at a time. The fastest way to find it is to change one load and watch the frame time. Anything that does not move the frame time is not the bottleneck:")}
      </p>
      <LessonTable
        headers={[tx(t, "oglProf_thTry", "Try"), tx(t, "oglProf_thIf", "If the frame gets faster…"), tx(t, "oglProf_thFix", "Look at")]}
        rows={[
          [tx(t, "oglProf_e1", "Render at ¼ the resolution"), tx(t, "oglProf_e1i", "fragment / fill / bandwidth bound"), tx(t, "oglProf_e1f", "shader cost, overdraw, blending, render-target formats, MSAA")],
          [tx(t, "oglProf_e2", "Replace fragment shaders with a flat colour"), tx(t, "oglProf_e2i", "fragment ALU / texture bound"), tx(t, "oglProf_e2f", "shader maths, texture fetches, mip use")],
          [tx(t, "oglProf_e3", "Skip every draw call but keep the CPU work"), tx(t, "oglProf_e3i", "GPU bound somewhere in the draws"), tx(t, "oglProf_e3f", "per-pass GPU timers")],
          [tx(t, "oglProf_e4", "Skip all GL calls entirely"), tx(t, "oglProf_e4i", "driver / API overhead (CPU)"), tx(t, "oglProf_e4f", "draw count, state changes — see Draw Calls & State")],
          [tx(t, "oglProf_e5", "Use lower-poly meshes"), tx(t, "oglProf_e5i", "vertex / primitive bound"), tx(t, "oglProf_e5f", "LOD, culling, vertex format size")],
          [tx(t, "oglProf_e6", "Nothing changes"), tx(t, "oglProf_e6i", "CPU bound in your own code, or vsync-capped"), tx(t, "oglProf_e6f", "a CPU profiler (Tracy, Superluminal, VTune), or turn vsync off")],
        ]}
      />
      <BottleneckLabFigure t={t} />

      <H2>{tx(t, "oglProf_toolsTitle", "Tools")}</H2>
      <LessonTable
        headers={[tx(t, "oglProf_thTool", "Tool"), tx(t, "oglProf_thUse", "Use it for")]}
        rows={[
          ["RenderDoc", tx(t, "oglProf_t1", "capture one frame; inspect every draw, its state, textures, meshes and shaders; per-draw GPU durations")],
          ["NVIDIA Nsight Graphics / AMD RGP / Intel GPA", tx(t, "oglProf_t2", "hardware counters: which unit (SM, texture, ROP, memory) is saturated, occupancy, stalls")],
          ["Tracy", tx(t, "oglProf_t3", "a frame profiler for CPU zones and GPU zones (it wraps timer queries) on one timeline")],
          ["apitrace", tx(t, "oglProf_t4", "record every GL call to a file and replay it; find redundant calls")],
          ["GL_KHR_debug", tx(t, "oglProf_t5", "performance warnings from the driver (\"buffer used as source while being written, stalling\")")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "oglProf_pitfalls",
          "Measure release builds with vsync off, and look at averages over hundreds of frames, or better the worst 1% (players feel stutters, not averages). Never put glFinish or glGetError in the hot loop outside debug builds, since both drain the pipeline. GPU clocks ramp up and down with load, so a nearly idle scene can be slower per frame than a busy one; warm up before measuring. And laptops switch GPUs and throttle when hot.")}
      </Callout>

      <KeyIdeas t={t} id="oglProf" items={[
        "Measure in milliseconds; costs add in ms, not in FPS.",
        "CPU and GPU overlap on different frames: T ≈ max(T_CPU, T_GPU). A readback or glFinish makes them add.",
        "Time GPU work with GL_TIME_ELAPSED / GL_TIMESTAMP queries, read a few frames later.",
        "Find the bottleneck by changing one load at a time (resolution, shader, draw count) and watching frame time.",
        "Use RenderDoc for correctness, vendor tools for hardware counters, a frame profiler for the timeline.",
      ]} />
    </Article>
  );
}

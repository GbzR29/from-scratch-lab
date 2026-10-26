"use client";

// GLSL track — "How the GPU Runs a Shader": warps and lanes, divergence in
// branches and loops (with a live timing on the reader's GPU), if vs mix,
// latency hiding and occupancy, the cost of operations, and how to measure.

import type { TrackTranslations } from "@/lib/tracks/types";
import { tx } from "@/lib/tracks/tx";
import { CodeBlock, Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { KeyIdeas, Goals } from "@/components/lesson/Prose";
import { Equation } from "@/components/lesson/Tex";
import { Related } from "@/components/lesson/Related";
import { WarpFigure } from "@/components/lesson/glsl/WarpFigure";
import { DivergenceTimerFigure } from "@/components/lesson/glsl/DivergenceTimerFigure";
import { LatencyFigure } from "@/components/lesson/glsl/LatencyFigure";

const r = String.raw;

export function GpuExecutionContent({ t }: { t: TrackTranslations }) {
  return (
    <article className="space-y-5 text-[var(--text-muted)] leading-relaxed text-base">

      <p className="text-lg text-[var(--text-main)]">
        {tx(t, "glslGpu_intro",
          "A shader reads like a small program that runs once per pixel. The GPU does not run it that way. It runs 32 pixels at a time, with one instruction for all 32, and it keeps dozens of such groups in flight so that it never waits for memory. Two facts follow, and they explain most of what makes a shader fast or slow: an if costs both of its paths when neighbouring pixels disagree, and a texture read is cheap only while other pixels have work to do.")}
      </p>

      <Goals t={t} id="glslGpu" items={[
        "Say what a warp is, and why 32 pixels share one instruction.",
        "Predict when an if costs both of its paths and when it costs one.",
        "Explain why a loop costs as much as its slowest pixel.",
        "Explain how registers decide how well texture reads are hidden.",
        "Tell cheap operations from expensive ones, and measure instead of guessing.",
      ]} />

      {/* ── warps ── */}
      <H2>{tx(t, "glslGpu_warpTitle", "Thousands of lanes, few instruction streams")}</H2>
      <p>
        {tx(t, "glslGpu_warpBody1",
          "Graphics cards are sold by their number of cores: an NVIDIA RTX 4060 has 3,072. They are not 3,072 independent processors. The chip has 24 streaming multiprocessors (SMs), each SM has 4 schedulers, and each scheduler drives 32 arithmetic lanes. Every cycle, a scheduler picks one instruction and all 32 lanes execute it, each on its own data. 24 × 4 × 32 = 3,072.")}
      </p>
      <p>
        {tx(t, "glslGpu_warpBody2",
          "The 32 invocations that share an instruction stream are a warp. Each lane is one invocation of your shader: one vertex in a vertex shader, one pixel in a fragment shader. A fragment warp is filled with whole 2×2 quads, 8 of them, because the derivatives need all four pixels of a quad (see Derivatives & Anti-aliasing). Every vendor builds GPUs this way; only the names and widths change:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslGpu_vH0", "GPU"), tx(t, "glslGpu_vH1", "Name of the group"), tx(t, "glslGpu_vH2", "Lanes"), tx(t, "glslGpu_vH3", "Runs on")]}
        rows={[
          ["NVIDIA", "warp", "32", tx(t, "glslGpu_v1", "streaming multiprocessor (SM)")],
          ["AMD RDNA", "wave (wavefront)", tx(t, "glslGpu_v2", "32 or 64, chosen by the driver"), tx(t, "glslGpu_v2b", "compute unit (CU)")],
          ["AMD GCN", "wavefront", "64", tx(t, "glslGpu_v3", "compute unit (CU)")],
          ["Intel", "SIMD width", tx(t, "glslGpu_v4", "8, 16 or 32, chosen by the compiler"), tx(t, "glslGpu_v4b", "execution unit (EU) / Xe core")],
          ["Apple", "SIMD-group", "32", tx(t, "glslGpu_v5", "GPU core")],
          ["Arm Mali (Valhall)", "warp", "16", tx(t, "glslGpu_v6", "shader core")],
          ["Vulkan / GLSL", "subgroup", "gl_SubgroupSize", tx(t, "glslGpu_v7", "the portable name for all of the above")],
        ]}
      />

      {/* ── divergence ── */}
      <H2>{tx(t, "glslGpu_divTitle", "Branches: when a warp disagrees")}</H2>
      <p>
        {tx(t, "glslGpu_divBody1",
          "Take if (c) { A } else { B }. When every lane of a warp has the same c, the warp jumps over the path nobody needs and runs only A or only B, as a CPU would. When the lanes disagree, there is still one instruction stream. The warp runs A with the B lanes switched off, then B with the A lanes switched off. Every pixel gets the right result, but the warp spends the time of both paths. This is called divergence.")}
      </p>
      <Equation label={tx(t, "glslGpu_eqLabel", "The cost of an if / else for one warp")}
        where={[
          [r`c_A`, tx(t, "glslGpu_wA", "the cost of path A, in instructions")],
          [r`c_B`, tx(t, "glslGpu_wB", "the cost of path B")],
          [r`n_A`, tx(t, "glslGpu_wNA", "how many of the warp's 32 lanes take path A")],
          [r`[\,\cdot\,]`, tx(t, "glslGpu_wIv", "1 if the condition inside is true, 0 if not")],
        ]}
        words={tx(t, "glslGpu_eqWords", "A warp pays for every path that at least one of its lanes takes.")}
        note={tx(t, "glslGpu_eqNote", "Worked example: 12 lanes take A (cost 40) and 20 take B (cost 8). The warp pays 40 + 8 = 48 for all 32 lanes. The work actually needed is 12 · 40 + 20 · 8 = 640 lane-instructions out of 32 · 48 = 1,536 paid, so 42% of the lanes are doing useful work.")}>
        {r`\text{cost} = [\,n_A > 0\,]\, c_A + [\,n_A < 32\,]\, c_B`}
      </Equation>
      <WarpFigure t={t} />
      <H3>{tx(t, "glslGpu_kindsTitle", "Three kinds of condition")}</H3>
      <LessonTable
        headers={[tx(t, "glslGpu_kH0", "Condition"), tx(t, "glslGpu_kH1", "Example"), tx(t, "glslGpu_kH2", "What it costs")]}
        rows={[
          [tx(t, "glslGpu_k1", "uniform: the same for every invocation of the draw"), "if (uQuality > 1)", tx(t, "glslGpu_k1b", "only the path taken, in every warp")],
          [tx(t, "glslGpu_k2", "coherent: changes across the screen, but neighbours agree"), "if (d < 0.0) // a large shape", tx(t, "glslGpu_k2b", "one path in most warps; both only in the warps along the border")],
          [tx(t, "glslGpu_k3", "incoherent: changes from pixel to pixel"), "if (hash(p) > 0.5)", tx(t, "glslGpu_k3b", "both paths in nearly every warp")],
        ]}
      />
      <p>
        {tx(t, "glslGpu_timerBody",
          "This is not only theory. The next figure times a real pass on your GPU: 1024 × 1024 pixels, each running an if / else whose two paths cost exactly the same. On the RTX 4060 the pass takes 0.246 ms when the condition is uniform and 0.479 ms when it alternates every pixel: twice as long, although no pixel ran more than one path. Stripes make the size of a warp visible. Vertical stripes 4 pixels wide cost nothing extra, horizontal ones need to be 8 pixels tall: a warp there covers a block 4 pixels wide and 8 tall.")}
      </p>
      <DivergenceTimerFigure t={t} />
      <H3>{tx(t, "glslGpu_loopTitle", "Loops wait for the slowest lane")}</H3>
      <p>
        {tx(t, "glslGpu_loopBody",
          "A loop whose number of iterations differs between pixels diverges the same way. Lanes that leave the loop early are switched off and wait, and the warp keeps looping until its last lane is done. A warp therefore costs as much as its slowest pixel. Raymarching is the classic case: a ray that grazes a silhouette or the floor near the horizon takes many small steps, and every pixel in its warp pays for them. Switch the figure above to \"loop\" to see it, and use the heat map in the Raymarching chapter on a real scene.")}
      </p>
      <Equation label={tx(t, "glslGpu_loopLabel", "The cost of a loop for one warp")}
        where={[
          [r`n_i`, tx(t, "glslGpu_wNi", "the number of iterations lane i needs")],
          [r`c`, tx(t, "glslGpu_wC", "the cost of one iteration")],
        ]}
        words={tx(t, "glslGpu_loopWords", "Every lane waits for the one that loops the longest.")}>
        {r`\text{cost} = c \cdot \max_{i\,=\,1}^{32} n_i`}
      </Equation>

      {/* ── if vs mix ── */}
      <H2>{tx(t, "glslGpu_mixTitle", "if or mix?")}</H2>
      <p>
        {tx(t, "glslGpu_mixBody1",
          "A common piece of advice is to avoid if in shaders and write step and mix instead. It is half true. For a short if, the compiler already does it: it computes both sides and picks the result with a select instruction, with no jump at all. And mix always computes both sides, so it can never be cheaper than a branch that skips one. What matters is how expensive the paths are and how coherent the condition is:")}
      </p>
      <CodeBlock lang="glsl" filename="branch_or_select.frag" t={t}>{`// 1. Both sides cheap: write what reads best. The compiler emits the same select either way.
float a = x > 0.5 ? 1.0 : 0.2;
float b = mix(0.2, 1.0, step(0.5, x));

// 2. One side expensive, condition coherent: a real branch skips the work
//    in every warp that lies wholly outside the shape.
if (d < 0.0) {
    col = expensiveInterior(p);          // 200 instructions, only inside the shape
}

// 3. The same work written with mix runs the expensive side everywhere.
col = mix(col, expensiveInterior(p), step(d, 0.0));`}</CodeBlock>
      <Callout type="info" t={t}>
        {tx(t, "glslGpu_attrNote",
          "You cannot force the choice in standard GLSL. Vulkan's GLSL has GL_EXT_control_flow_attributes: [[flatten]] asks for a select, [[dont_flatten]] for a real branch, and [[unroll]] / [[dont_unroll]] do the same for loops. HLSL has [flatten] and [branch]. They are hints, and the only way to know what the compiler did is to look at the output in a tool.")}
      </Callout>
      <Callout type="tip" t={t}>
        {tx(t, "glslGpu_subgroupTip",
          "With GL_KHR_shader_subgroup (Vulkan 1.1, and OpenGL 4.6 as an extension; not WebGL) a shader can ask its own warp. subgroupAll(c) is true when every lane's c is true and subgroupAny(c) when at least one is, so if (subgroupAll(d > 1.0)) can take a cheap path for warps that lie wholly outside a shape, without any lane disagreeing.")}
      </Callout>

      {/* ── latency ── */}
      <H2>{tx(t, "glslGpu_latTitle", "Waiting for memory: occupancy")}</H2>
      <p>
        {tx(t, "glslGpu_latBody1",
          "A texture read takes a few dozen cycles when the texels are in the cache and several hundred when they come from video memory. The warp that asked cannot continue, since its next instruction needs the value. So the scheduler switches to another warp that is ready, and switching costs nothing: every warp on the SM keeps its registers in the SM's register file all the time. With enough warps in flight, there is always one ready, and the waiting is hidden.")}
      </p>
      <p>
        {tx(t, "glslGpu_latBody2",
          "How many warps fit is decided by registers. An RTX 40 SM has 65,536 registers of 32 bits, 16,384 per scheduler, and takes at most 48 warps, 12 per scheduler. Every lane of every warp needs its own copy of every value the shader keeps alive at the same time, so a shader that needs many registers leaves room for fewer warps. The share of the maximum that fits is called occupancy.")}
      </p>
      <Equation label={tx(t, "glslGpu_occLabel", "Warps that fit on one scheduler")}
        where={[
          [r`N`, tx(t, "glslGpu_wN", "the warps the scheduler can keep in flight")],
          [r`N_{max}`, tx(t, "glslGpu_wNmax", "the hardware limit: 12 per scheduler on the RTX 40 series")],
          [r`R`, tx(t, "glslGpu_wR", "the scheduler's share of the register file: 16,384")],
          [r`r`, tx(t, "glslGpu_wr", "registers per lane, rounded up to a multiple of 8; the compiler decides it")],
        ]}
        words={tx(t, "glslGpu_occWords", "Divide the register file by what one warp needs, and stop at the hardware limit.")}
        note={tx(t, "glslGpu_occNote", "Worked numbers: 32 registers per lane gives 16,384 / 1,024 = 16, capped at 12, full occupancy. 64 registers gives 8 warps, 128 gives 4, and the maximum of 255 (rounded to 256) gives only 2.")}>
        {r`N = \min\!\left(N_{max},\ \left\lfloor \frac{R}{32\, r} \right\rfloor\right)`}
      </Equation>
      <Equation label={tx(t, "glslGpu_utilLabel", "How busy the arithmetic stays")}
        where={[
          [r`U`, tx(t, "glslGpu_wU", "the fraction of cycles in which the scheduler issues an instruction")],
          [r`K`, tx(t, "glslGpu_wK", "the arithmetic instructions a warp runs between two texture reads")],
          [r`L`, tx(t, "glslGpu_wL", "the latency of one read, in cycles")],
        ]}
        words={tx(t, "glslGpu_utilWords", "Each warp is busy for K cycles out of every K + L, so N warps can fill N · K of them.")}
        note={tx(t, "glslGpu_utilNote", "Worked example: K = 8 and L = 200 need ⌈208 / 8⌉ = 26 warps to keep the unit busy; with 8 warps U = 64 / 208 ≈ 31%. That is why heavy shaders do maths between their reads, and why the texture cache matters so much: at L = 30 the same 8 warps already reach 8 · 8 / 38 ≈ 100%.")}>
        {r`U \approx \min\!\left(1,\ \frac{N\,K}{K + L}\right)`}
      </Equation>
      <LatencyFigure t={t} />
      <p>
        {tx(t, "glslGpu_regsBody",
          "What drives registers up: many values alive at once, large local arrays, long unrolled loops, and many texture reads issued before their results are used (which is good for latency, so it is a trade-off). The compiler chooses the count; you cannot set it in GLSL. Profilers such as Nsight Graphics or the Radeon GPU Analyzer show it per shader. It is worth looking only when a shader is the bottleneck and heavy.")}
      </p>

      {/* ── costs ── */}
      <H2>{tx(t, "glslGpu_costTitle", "What things cost")}</H2>
      <p>
        {tx(t, "glslGpu_costBody",
          "Exact numbers change with every generation, but the ranking has held for years. Counting in multiplies:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslGpu_cH0", "Operation"), tx(t, "glslGpu_cH1", "Cost"), tx(t, "glslGpu_cH2", "Why")]}
        rows={[
          ["+ − * , fma, min, max, clamp, abs, mix, select", tx(t, "glslGpu_c1", "1"), tx(t, "glslGpu_c1b", "full-rate lanes; mix(a, b, t) = a + t · (b − a) is a subtraction and one fused multiply-add")],
          ["dot(vec3), length², cross", tx(t, "glslGpu_c2", "2 to 6"), tx(t, "glslGpu_c2b", "a short chain of multiply-adds")],
          ["sqrt, inversesqrt, exp2, log2, sin, cos, 1/x", tx(t, "glslGpu_c3", "4 to 8"), tx(t, "glslGpu_c3b", "run on special function units: 16 per SM on the RTX 40 series, against 128 multiply lanes")],
          ["a / b, normalize, pow(x, y)", tx(t, "glslGpu_c4", "5 to 10"), tx(t, "glslGpu_c4b", "built from the above: a · (1/b); v · inversesqrt(dot(v, v)); exp2(y · log2(x)), which is why pow of a negative x is undefined")],
          [tx(t, "glslGpu_c5a", "int / and %"), tx(t, "glslGpu_c5", "20 or more"), tx(t, "glslGpu_c5b", "no hardware divider: emulated with many instructions; by a constant power of two it becomes a shift")],
          ["texture()", tx(t, "glslGpu_c6", "a few, plus latency"), tx(t, "glslGpu_c6b", "the filtering is done by texture units; the cost is the wait, hidden by other warps")],
          [tx(t, "glslGpu_c7a", "a texture read whose uv comes from another read"), tx(t, "glslGpu_c7", "latencies add up"), tx(t, "glslGpu_c7b", "the second read cannot start until the first returns")],
          ["double", tx(t, "glslGpu_c8", "64 on GeForce"), tx(t, "glslGpu_c8b", "consumer cards run 64-bit floats at 1/64 rate; WebGL has no double at all")],
        ]}
      />

      {/* ── measuring ── */}
      <H2>{tx(t, "glslGpu_measureTitle", "Measure instead of guessing")}</H2>
      <p>
        {tx(t, "glslGpu_measureBody",
          "Compilers reorder, merge and remove code, so the only reliable answer is a measurement. In OpenGL, time a pass with a timer query (see Measuring Performance in the OpenGL track); in WebGL the same queries come from EXT_disjoint_timer_query_webgl2, which the timing figure above used. Five rules make the numbers trustworthy:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslGpu_mH0", "Rule"), tx(t, "glslGpu_mH1", "Why")]}
        rows={[
          [tx(t, "glslGpu_m1", "Time in milliseconds, on the GPU"), tx(t, "glslGpu_m1b", "FPS hides small changes and includes the CPU; a CPU clock only measures how long the commands took to send")],
          [tx(t, "glslGpu_m2", "Warm up first"), tx(t, "glslGpu_m2b", "an idle GPU runs at a low clock for the first fraction of a second")],
          [tx(t, "glslGpu_m3", "Repeat, and keep the fastest run"), tx(t, "glslGpu_m3b", "interruptions and clock changes only ever add time")],
          [tx(t, "glslGpu_m4", "Make the shader the bottleneck"), tx(t, "glslGpu_m4b", "full screen, high resolution, nothing else drawn; otherwise you are timing something else")],
          [tx(t, "glslGpu_m5", "Change one thing at a time"), tx(t, "glslGpu_m5b", "two changes can cancel each other out")],
        ]}
      />
      <p>
        {tx(t, "glslGpu_toolsBody",
          "To see why a shader is slow, not only how slow, use the vendor's profiler: Nsight Graphics (NVIDIA), Radeon GPU Profiler and Radeon GPU Analyzer (AMD), Intel GPA, or the Metal debugger in Xcode. They show registers, occupancy, how often warps diverge, and what each warp was waiting for.")}
      </p>

      <H2>{tx(t, "glslGpu_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "glslGpu_xH0", "Symptom"), tx(t, "glslGpu_xH1", "Cause"), tx(t, "glslGpu_xH2", "Fix")]}
        rows={[
          [tx(t, "glslGpu_x1a", "an \"early out\" if makes nothing faster"), tx(t, "glslGpu_x1b", "the condition is incoherent, so every warp still runs the expensive path"), tx(t, "glslGpu_x1c", "make the test coarser (per tile or per object), or accept the cost")],
          [tx(t, "glslGpu_x2a", "a raymarcher is slow only where objects meet the sky"), tx(t, "glslGpu_x2b", "rays grazing silhouettes take many steps, and their whole warp waits"), tx(t, "glslGpu_x2c", "cap the steps, grow the hit threshold with distance, bound the scene with a cheap shape")],
          [tx(t, "glslGpu_x3a", "rewriting every if as mix made the shader slower"), tx(t, "glslGpu_x3b", "mix computes both sides, including the expensive one"), tx(t, "glslGpu_x3c", "keep real branches around expensive, coherent work")],
          [tx(t, "glslGpu_x4a", "adding one texture read halved the speed"), tx(t, "glslGpu_x4b", "the shader already had low occupancy, so nothing hides the new latency"), tx(t, "glslGpu_x4c", "fewer live values, smaller arrays; read earlier and use later")],
          [tx(t, "glslGpu_x5a", "a % or / by a variable shows up in the profile"), tx(t, "glslGpu_x5b", "integer division is emulated"), tx(t, "glslGpu_x5c", "use floats, or & (n − 1) and shifts for powers of two")],
          [tx(t, "glslGpu_x6a", "an optimisation helps on one GPU and hurts on another"), tx(t, "glslGpu_x6b", "warp width, caches and compilers differ"), tx(t, "glslGpu_x6c", "measure on the hardware you ship to")],
        ]}
      />

      <KeyIdeas t={t} id="glslGpu" items={[
        "A warp of 32 lanes (64 on some AMD GPUs, 16 on Mali) runs one instruction at a time; each lane is one pixel or vertex.",
        "An if costs every path that at least one lane of the warp takes; a loop costs the slowest lane's iterations.",
        "Uniform and coherent conditions are cheap; conditions that change from pixel to pixel run both paths almost everywhere.",
        "Short ifs become selects anyway; mix and step never skip work, so keep real branches around expensive, coherent code.",
        "Memory latency is hidden by switching between resident warps, and registers per lane decide how many are resident.",
        "Measure in milliseconds with timer queries, warmed up, fastest of many runs, one change at a time.",
      ]} />

      <Related t={t} links={[
        { track: "GLSL", id: "derivatives", title: tx(t, "glslGpu_rel1", "Derivatives & Anti-aliasing"), why: tx(t, "glslGpu_rel1b", "2×2 quads, helper pixels, and why derivatives break inside divergent branches.") },
        { track: "GLSL", id: "raymarching", title: tx(t, "glslGpu_rel2", "Raymarching"), why: tx(t, "glslGpu_rel2b", "the step-count heat map: loop divergence on a real scene.") },
        { track: "OpenGL", id: "profiling", title: tx(t, "glslGpu_rel3", "Measuring Performance"), why: tx(t, "glslGpu_rel3b", "timer queries, finding the bottleneck, and the tools in detail.") },
        { track: "Vulkan", id: "compute", title: tx(t, "glslGpu_rel4", "Compute Shaders (Vulkan)"), why: tx(t, "glslGpu_rel4b", "workgroups, subgroups and shared memory, where the warp is in plain view.") },
      ]} />
    </article>
  );
}

// src/lib/tracks/opengl/chapters/compute.tsx
"use client";

// Compute shaders (explanation pass 2026-10-01, split out of tooling.tsx):
// the two-level execution model and how the built-in IDs relate
// (DispatchFigure), limits, writing an image (glBindImageTexture argument by
// argument), the 1921×1080 rounding worked through, memory barriers by
// consumer, shared memory + barrier() with a parallel reduction, SSBOs drawn
// as vertices, choices and mistakes. Added 2026-10-25: limits queried in
// code, the reduction LiveFormula (the dispatch maths stays in DispatchFigure
// and the worked example), atomics (histogram in shared
// memory), indirect dispatch and GPU frustum culling into an indirect draw,
// ping-pong buffers, exercises and related lessons.

import { CodeBlock, Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { Related } from "@/components/lesson/Related";
import { DispatchFigure } from "@/components/lesson/figures/advgl/DispatchFigure";
import { reduceNumbers } from "../live/compute";

const r = String.raw;

// ── Compute Shaders ──────────────────────────────────────────────────────────

export function ComputeContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglCompute_intro",
          "Every shader so far sat inside the rasterization pipeline: it received vertices or fragments and had to produce geometry or colour. A compute shader has no pipeline around it. You dispatch a grid of threads, they read and write buffers and images, and that is the whole model. It is how particle simulation, culling, physics and image processing move onto the GPU.")}
      </Lead>

      <Goals t={t} id="oglCompute" items={[
        "Explain how compute work is split into workgroups.",
        "Write into a texture from a compute shader.",
        "Share data inside a workgroup with shared memory and barrier().",
        "Read and write large data with shader storage buffers.",
        "Count and build lists with atomics, and let the GPU size the next draw or dispatch.",
      ]} />

      <H2>{tx(t, "oglCompute_modelTitle", "The execution model")}</H2>
      <p>
        {tx(t, "oglCompute_modelBody",
          "Work is organized in two levels. You dispatch work groups; each work group runs a fixed number of invocations declared in the shader. Invocations inside a group can share memory and synchronize with each other. Invocations in different groups cannot — they may not even run at the same time.")}
      </p>
      <p>
        {tx(t, "oglCompute_modelBody2",
          "The shader fixes the size of a group with layout (local_size_x = 16, local_size_y = 16) in: 256 invocations arranged as a 16 × 16 square. The C++ side only chooses how many groups to launch, with glDispatchCompute(x, y, z). Each invocation then finds out which one it is from built-in variables, and the one you use most is assembled from the others:")}
      </p>
      <Equation label={tx(t, "oglCompute_idLabel", "The global ID of an invocation")}
        where={[
          [r`\text{gl\_WorkGroupID}`, tx(t, "oglCompute_wGroup", "which group, from (0,0,0) to the dispatch size − 1")],
          [r`\text{gl\_WorkGroupSize}`, tx(t, "oglCompute_wSize", "the local_size declared in the shader, e.g. (16, 16, 1)")],
          [r`\text{gl\_LocalInvocationID}`, tx(t, "oglCompute_wLocal", "the position inside the group, from (0,0,0) to the size − 1")],
        ]}
        words={tx(t, "oglCompute_idWords", "Skip over all the groups before yours, each one group-size wide, then add your place inside your own group. With 16 × 16 groups, invocation (3, 5) of group (2, 1) is at (2·16 + 3, 1·16 + 5) = (35, 21).")}>
        {r`\begin{gathered} \text{gl\_GlobalInvocationID} = \\ \text{gl\_WorkGroupID} \cdot \text{gl\_WorkGroupSize} + \text{gl\_LocalInvocationID} \end{gathered}`}
      </Equation>

      <LessonTable
        headers={[tx(t, "oglCompute_h0", "Built-in"), tx(t, "oglCompute_h1", "Meaning")]}
        rows={[
          ["gl_GlobalInvocationID",  tx(t, "oglCompute_b1", "Unique index across the whole dispatch. Usually your data index.")],
          ["gl_LocalInvocationID",   tx(t, "oglCompute_b2", "Index within the work group. Used to address shared memory.")],
          ["gl_LocalInvocationIndex", tx(t, "oglCompute_b5", "The local ID flattened to one number: z·sx·sy + y·sx + x.")],
          ["gl_WorkGroupID",         tx(t, "oglCompute_b3", "Which work group this invocation belongs to.")],
          ["gl_NumWorkGroups",       tx(t, "oglCompute_b4", "The dispatch dimensions you passed to glDispatchCompute.")],
        ]}
      />

      <DispatchFigure t={t} />

      <p>
        {tx(t, "oglCompute_limitsBody",
          "The limits are generous but real. A group may hold at most GL_MAX_COMPUTE_WORK_GROUP_INVOCATIONS invocations, at least 1024, with per-axis maxima of at least 1024, 1024 and 64. A dispatch may launch at least 65 535 groups along each axis. Shared memory per group is at least 32 KB (GL_MAX_COMPUTE_SHARED_MEMORY_SIZE).")}
      </p>
      <CodeBlock lang="cpp" filename="limits.cpp" t={t}>{`GLint maxInvocations, maxShared, size[3], count[3];
glGetIntegerv(GL_MAX_COMPUTE_WORK_GROUP_INVOCATIONS, &maxInvocations);   // lx · ly · lz at most this
glGetIntegerv(GL_MAX_COMPUTE_SHARED_MEMORY_SIZE, &maxShared);            // bytes of shared per group
for (int i = 0; i < 3; i++) {                                            // indexed: one value per axis
    glGetIntegeri_v(GL_MAX_COMPUTE_WORK_GROUP_SIZE,  i, &size[i]);       // max local_size_x/y/z
    glGetIntegeri_v(GL_MAX_COMPUTE_WORK_GROUP_COUNT, i, &count[i]);      // max groups per axis in one dispatch
}`}</CodeBlock>

      <H2>{tx(t, "oglCompute_writeTitle", "Writing into a texture")}</H2>
      <CodeBlock lang="glsl" filename="gradient.comp" t={t}>{`#version 460 core

layout (local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
layout (rgba32f, binding = 0) uniform writeonly image2D uOutput;

uniform float uTime;

void main() {
    ivec2 texel = ivec2(gl_GlobalInvocationID.xy);
    ivec2 size  = imageSize(uOutput);

    // A dispatch is rounded up, so the last group runs past the edge
    if (texel.x >= size.x || texel.y >= size.y) return;

    vec2 uv = vec2(texel) / vec2(size);
    vec3 color = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0.0, 2.0, 4.0));

    imageStore(uOutput, texel, vec4(color, 1.0));
}`}</CodeBlock>
      <p>
        {tx(t, "oglCompute_imageBody",
          "An image2D is a texture accessed without a sampler: no filtering, no mipmap selection, no normalized coordinates. imageStore writes one texel at an integer address, imageLoad reads one. The rgba32f qualifier must match the texture's format, because the shader has to know how to encode the value; writeonly promises the shader never reads it, which lets the compiler skip work. binding = 0 is an image unit, a separate set of slots from texture units.")}
      </p>

      <CodeBlock lang="cpp" filename="dispatch.cpp" t={t}>{`// The texture must be complete and use an image-compatible format.
// Immutable storage guarantees both, which is why it is the recommended way
unsigned int tex;
glCreateTextures(GL_TEXTURE_2D, 1, &tex);
glTextureStorage2D(tex, 1, GL_RGBA32F, W, H);    // 1 level: complete by construction
glTextureParameteri(tex, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTextureParameteri(tex, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

glUseProgram(computeProgram);
//                unit tex level layered layer access         format
glBindImageTexture(0,   tex, 0,    GL_FALSE, 0,  GL_WRITE_ONLY, GL_RGBA32F);

// Round UP — 1920/16 is exact, but 1921 would lose a column without the +15
glDispatchCompute((W + 15) / 16, (H + 15) / 16, 1);

// Wait for the writes to be visible to the next stage
glMemoryBarrier(GL_TEXTURE_FETCH_BARRIER_BIT);   // the next pass samples it with texture()

// Now sample it like any other texture
glUseProgram(drawProgram);
glBindTextureUnit(0, tex);`}</CodeBlock>
      <p>
        {tx(t, "oglCompute_bindBody",
          "glBindImageTexture puts mip level 0 of the texture on image unit 0. layered = GL_FALSE with layer 0 means a single 2D image (for an array or cube map, GL_TRUE exposes all layers). The access argument repeats the promise of writeonly, and the format says how texels are interpreted; it must be compatible with the texture's internal format.")}
      </p>

      <H3>{tx(t, "oglCompute_workedTitle", "Worked example: rounding up the dispatch")}</H3>
      <p>
        {tx(t, "oglCompute_workedBody",
          "A 1921 × 1080 image with 16 × 16 groups. Integer division rounds down, so 1921 / 16 = 120 groups would cover only 1920 columns. Adding 15 first turns the division into a round-up: (1921 + 15) / 16 = 121, and (1080 + 15) / 16 = 68 (1080 / 16 = 67.5). The dispatch runs 121 × 16 = 1936 by 68 × 16 = 1088 invocations, 2 106 368 in total, for 2 074 680 pixels. The other 31 688, about 1.5%, fail the bounds check and return at once. Without that check they would write outside the image; imageStore ignores out-of-range writes, but an SSBO write past the end of the array would corrupt memory.")}
      </p>

      <Callout type="warn" t={t}>
        {tx(t, "oglCompute_barrierWarn",
          "glMemoryBarrier is not optional and forgetting it is the defining compute-shader bug. The dispatch is asynchronous: without a barrier the next draw may read the texture before the compute writes have landed, and the result is a flickering or one-frame-stale image that looks intermittent and hardware-dependent. Pick the barrier bits matching how you will read the data.")}
      </Callout>
      <p>
        {tx(t, "oglCompute_bitsBody",
          "The bits name the consumer: how the data written by shaders before the barrier will be read after it. Writing an image and then sampling it needs the texture-fetch bit, not the image-access bit, because texture() goes through a different cache.")}
      </p>
      <LessonTable
        headers={[tx(t, "oglCompute_bH0", "Next, the data is read as…"), tx(t, "oglCompute_bH1", "Barrier bit")]}
        rows={[
          [tx(t, "oglCompute_bb1", "a texture, with texture() or texelFetch"), "GL_TEXTURE_FETCH_BARRIER_BIT"],
          [tx(t, "oglCompute_bb2", "an image, with imageLoad / imageStore"), "GL_SHADER_IMAGE_ACCESS_BARRIER_BIT"],
          [tx(t, "oglCompute_bb3", "a storage buffer in another shader"), "GL_SHADER_STORAGE_BARRIER_BIT"],
          [tx(t, "oglCompute_bb4", "vertex attributes"), "GL_VERTEX_ATTRIB_ARRAY_BARRIER_BIT"],
          [tx(t, "oglCompute_bb5", "indirect draw or dispatch parameters"), "GL_COMMAND_BARRIER_BIT"],
          [tx(t, "oglCompute_bb6", "the CPU, via glGetBufferSubData or a mapping"), "GL_BUFFER_UPDATE_BARRIER_BIT"],
        ]}
      />

      <H2>{tx(t, "oglCompute_sharedTitle", "Shared memory and barrier()")}</H2>
      <p>
        {tx(t, "oglCompute_sharedBody",
          "Variables declared shared exist once per work group, in fast on-chip memory, and every invocation of the group can read and write them. That is what makes cooperation possible: a group can load a tile of data once and let every invocation read its neighbours, or combine many values into one. barrier() is the meeting point: no invocation of the group continues past it until all of them have reached it. memoryBarrierShared() before it makes sure the shared writes are visible when they continue.")}
      </p>
      <CodeBlock lang="glsl" filename="reduce.comp" t={t}>{`#version 460 core
layout (local_size_x = 256) in;

layout (std430, binding = 0) readonly  buffer In  { float values[];  };
layout (std430, binding = 1) writeonly buffer Out { float partial[]; };

shared float tile[256];                  // one per group, 1 KB

void main() {
    uint lid = gl_LocalInvocationID.x;
    uint gid = gl_GlobalInvocationID.x;

    // Out-of-range invocations load 0 instead of returning: all 256 must reach barrier()
    tile[lid] = gid < values.length() ? values[gid] : 0.0;
    memoryBarrierShared();
    barrier();

    for (uint s = 128; s > 0; s >>= 1) {     // 128, 64, 32, … 1: 8 steps
        if (lid < s) tile[lid] += tile[lid + s];
        memoryBarrierShared();
        barrier();                           // outside the if: every invocation reaches it
    }
    if (lid == 0) partial[gl_WorkGroupID.x] = tile[0];
}`}</CodeBlock>
      <p>
        {tx(t, "oglCompute_reduceBody",
          "Step by step: after loading, the 256 values sit in tile. In the first step the lower 128 invocations each add the value 128 places above theirs, so tile[0..127] holds 128 sums of pairs. The next step halves again, 64 sums of four values, and so on: after log₂ 256 = 8 steps tile[0] holds the sum of the whole group, and invocation 0 writes it out. Summing 1 000 000 values takes ⌈1 000 000 / 256⌉ = 3907 groups, giving 3907 partial sums; a second dispatch reduces those to ⌈3907 / 256⌉ = 16, and a third to 1. Each loop iteration has a barrier, because step k reads values written by other invocations in step k − 1.")}
      </p>
      <LiveFormula label={tx(t, "oglCompute_liveReduce", "Try it: dispatches needed to sum n values")}
        tex={r`n_{k+1} = \left\lceil \frac{n_k}{G} \right\rceil, \qquad n_0 = n \ \to\ \dots\ \to\ 1`}
        vars={[
          { id: "e", label: "n", min: 1, max: 9, step: 0.05, value: 6, fmt: v => String(Math.round(10 ** v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") },
          { id: "G", label: "G", min: 32, max: 1024, step: 32, value: 256, fmt: v => `${v}` },
        ]}
        compute={reduceNumbers(t)}
        where={[
          [r`n_k`, tx(t, "oglCompute_wNk", "how many values are left before dispatch k + 1")],
          ["G", tx(t, "oglCompute_wG", "the group size: each group turns G values into one partial sum")],
        ]}
        note={tx(t, "oglCompute_liveReduceNote", "Each dispatch divides the count by G, so the number of dispatches grows with the logarithm of n: a billion values need four dispatches of 256, three of 1024. Between two dispatches goes a glMemoryBarrier(GL_SHADER_STORAGE_BARRIER_BIT), because the next one reads the partial sums as an SSBO.")} />

      <H2>{tx(t, "oglCompute_ssboTitle", "SSBOs — the real workhorse")}</H2>
      <p>
        {tx(t, "oglCompute_ssboBody",
          "Shader storage buffers are readable and writable from the shader, can be hundreds of megabytes, and support a runtime-sized trailing array. They are how you keep a particle system, a culling result or a spatial grid entirely on the GPU.")}
      </p>

      <CodeBlock lang="glsl" filename="particles.comp" t={t}>{`#version 460 core
layout (local_size_x = 256) in;

struct Particle {
    vec4 position;    // vec4, not vec3 — std430 still aligns vec3 to 16
    vec4 velocity;
};

layout (std430, binding = 0) buffer Particles {
    Particle particles[];      // runtime-sized: no length needed
};

uniform float uDt;

void main() {
    uint i = gl_GlobalInvocationID.x;
    if (i >= particles.length()) return;   // no barrier() in this shader, so returning is fine

    particles[i].velocity.y -= 9.81 * uDt;                     // gravity, m/s²
    particles[i].position    += particles[i].velocity * uDt;   // with the NEW velocity

    if (particles[i].position.y < 0.0) {
        particles[i].position.y = 0.0;
        particles[i].velocity.y *= -0.6;    // bounce, keeping 60% of the speed
    }
}`}</CodeBlock>
      <p>
        {tx(t, "oglCompute_particleBody",
          "Updating the velocity first and then moving with the new velocity is semi-implicit Euler, the same integrator as the Game Dev track's physics chapters; it stays stable where updating the position first would slowly gain energy. particles.length() is the number of whole Particle structs in the bound range, worked out from the buffer size, so the shader needs no count uniform. Each Particle is 2 × 16 = 32 bytes in std430, exactly the size of a C++ struct of two glm::vec4.")}
      </p>

      <CodeBlock lang="cpp" filename="ssbo.cpp" t={t}>{`// Once at startup
unsigned int ssbo;
glCreateBuffers(1, &ssbo);
glNamedBufferStorage(ssbo, particles.size() * sizeof(Particle), particles.data(), 0);
glBindBufferBase(GL_SHADER_STORAGE_BUFFER, 0, ssbo);   // binding = 0

// The same buffer is also the vertex input: positions are the first 16 bytes of each Particle
glVertexArrayVertexBuffer(particleVAO, 0, ssbo, 0, sizeof(Particle));   // stride 32
glVertexArrayAttribFormat(particleVAO, 0, 4, GL_FLOAT, GL_FALSE, 0);
glVertexArrayAttribBinding(particleVAO, 0, 0);
glEnableVertexArrayAttrib(particleVAO, 0);

// Every frame
glUseProgram(computeProgram);
glProgramUniform1f(computeProgram, glGetUniformLocation(computeProgram, "uDt"), dt);
glDispatchCompute((particleCount + 255) / 256, 1, 1);
glMemoryBarrier(GL_VERTEX_ATTRIB_ARRAY_BARRIER_BIT);   // next, it is read as vertices

glUseProgram(drawProgram);
glBindVertexArray(particleVAO);
glDrawArrays(GL_POINTS, 0, particleCount);              // the data never leaves the GPU`}</CodeBlock>

      <Callout type="tip" t={t}>
        {tx(t, "oglCompute_sizeTip",
          "Make the local size a multiple of the hardware's wavefront width: 32 on NVIDIA, 64 on AMD. 64 or 256 is a safe default that wastes no lanes on either. A local size of 1 runs at a fraction of the throughput because most lanes in every wavefront sit idle.")}
      </Callout>

      <Callout type="info" t={t}>
        {tx(t, "oglCompute_readbackNote",
          "Reading results back to the CPU with glGetBufferSubData stalls the pipeline: it waits for the GPU to finish everything. If you must read back, do it into a persistently mapped buffer and read it one or two frames later. Better still, keep the data on the GPU — the particle example above never touches the CPU after upload.")}
      </Callout>

      <AtomicsSection t={t} />
      <IndirectSection t={t} />

      <H2>{tx(t, "oglCompute_choicesTitle", "Choices in the code")}</H2>
      <LessonTable
        headers={[tx(t, "oglCompute_tChoice", "Choice"), tx(t, "oglCompute_tReason", "Reason")]}
        rows={[
          [tx(t, "oglCompute_c1", "16 × 16 groups for images"), tx(t, "oglCompute_c1b", "256 invocations, a multiple of 32 and 64, and square tiles keep neighbouring texels in the same group and cache.")],
          [tx(t, "oglCompute_c2", "256 × 1 for buffers"), tx(t, "oglCompute_c2b", "the data is one-dimensional; consecutive invocations read consecutive elements, which the memory system merges into few transactions.")],
          [tx(t, "oglCompute_c3", "(n + size − 1) / size groups plus a bounds check"), tx(t, "oglCompute_c3b", "covers any size without a remainder pass; the check costs one comparison.")],
          [tx(t, "oglCompute_c4", "readonly / writeonly qualifiers"), tx(t, "oglCompute_c4b", "tell the compiler which accesses cannot happen, so it can skip caches and reorder freely.")],
          [tx(t, "oglCompute_c5", "rgba32f image"), tx(t, "oglCompute_c5b", "simplest to reason about; rgba16f halves memory and bandwidth and is enough for colour.")],
        ]}
      />

      <H2>{tx(t, "oglCompute_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "oglCompute_tMistake", "Mistake"), tx(t, "oglCompute_tFix", "What happens, and the fix")]}
        rows={[
          [tx(t, "oglCompute_e1", "No glMemoryBarrier, or the wrong bit"), tx(t, "oglCompute_e1b", "stale or half-written data that flickers and differs between GPUs. Choose the bit by how the data is read next.")],
          [tx(t, "oglCompute_e2", "W / 16 groups instead of (W + 15) / 16"), tx(t, "oglCompute_e2b", "the last partial group is never launched: a strip of unprocessed pixels on the right or top edge.")],
          [tx(t, "oglCompute_e3", "return before barrier() for out-of-range invocations"), tx(t, "oglCompute_e3b", "barrier() must be reached by every invocation of the group; otherwise the behaviour is undefined, often a hang. Load a neutral value and let them continue.")],
          [tx(t, "oglCompute_e4", "Image format qualifier different from the texture's format"), tx(t, "oglCompute_e4b", "values are encoded wrongly: garbage colours. Match rgba32f with GL_RGBA32F, rgba8 with GL_RGBA8.")],
          [tx(t, "oglCompute_e5", "vec3 in an std430 struct mirrored as glm::vec3"), tx(t, "oglCompute_e5b", "std430 aligns vec3 to 16, glm to 4; from the second member on, every particle is misread. Use vec4.")],
          [tx(t, "oglCompute_e6", "Mipmap filter on a 1-level texture used as an image"), tx(t, "oglCompute_e6b", "the texture is incomplete: stores have no effect and sampling returns black. Use immutable storage and a non-mipmap filter.")],
          [tx(t, "oglCompute_e7", "counter += 1 instead of atomicAdd"), tx(t, "oglCompute_e7b", "thousands of invocations read the same old value and write the same new one: the count comes out far too low, and different every run. Use atomicAdd and keep the value it returns.")],
          [tx(t, "oglCompute_e8", "Not resetting the indirect command's instanceCount"), tx(t, "oglCompute_e8b", "each frame adds to the last one's count: the list overflows and garbage instances appear. Write the command back with instanceCount = 0 before the culling dispatch.")],
          [tx(t, "oglCompute_e9", "Reading and writing the same buffer when neighbours matter"), tx(t, "oglCompute_e9b", "some invocations read neighbours that were already updated this step, others the old ones, in an order that changes per GPU. Read from one buffer, write to another, swap.")],
        ]}
      />

      <H2>{tx(t, "oglCompute_tryTitle", "Try it yourself")}</H2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>{tx(t, "oglCompute_try1", "Change gradient.comp to 8 × 8 groups and fix the dispatch to match. Then remove the bounds check and run it on a 1921-pixel-wide texture: where do the extra invocations write?")}</li>
        <li>{tx(t, "oglCompute_try2", "Finish the reduction: dispatch reduce.comp again on the partial sums until one value is left, read it back once, and compare it with a sum on the CPU.")}</li>
        <li>{tx(t, "oglCompute_try3", "Use the histogram to auto-expose an HDR image: find the brightness below which 50% of the pixels lie and scale the exposure so that it maps to middle grey.")}</li>
        <li>{tx(t, "oglCompute_try4", "Add a frame-time readout to the culling example and compare 100 000 instances drawn with and without the compute pass.")}</li>
        <li>{tx(t, "oglCompute_try5", "Write Conway's Game of Life as a compute shader on two r8ui images, swapping them each frame, and draw the current one with a full-screen triangle.")}</li>
      </ol>

      <KeyIdeas t={t} id="oglCompute" items={[
        "A dispatch launches groups; the shader fixes the group size with local_size.",
        "gl_GlobalInvocationID = gl_WorkGroupID × gl_WorkGroupSize + gl_LocalInvocationID.",
        "Round the group count up with (n + size − 1) / size and bounds-check in the shader.",
        "glMemoryBarrier's bits name how the data is read next.",
        "shared memory plus barrier() lets a group cooperate; every invocation must reach each barrier().",
        "An SSBO can be written by compute and read as vertices without ever leaving the GPU.",
        "Atomics make read-modify-write safe; do them in shared memory first and merge once per group.",
        "A compute pass can write the parameters of the next draw or dispatch, so the GPU decides how much work follows.",
      ]} />

      <Related t={t} links={[
        { track: "Vulkan", id: "compute", title: tx(t, "oglCompute_rel1", "Vulkan: Compute Shaders"), why: tx(t, "oglCompute_rel1b", "the same model with explicit pipelines, descriptor sets and pipeline barriers.") },
        { track: "OpenGL", id: "particles", title: tx(t, "oglCompute_rel2", "Particles"), why: tx(t, "oglCompute_rel2b", "a whole particle system: emission, integration, instanced drawing, blending and sorting, then the move to the GPU.") },
        { track: "OpenGL", id: "frustum-culling", title: tx(t, "oglCompute_rel3", "Frustum & Occlusion Culling"), why: tx(t, "oglCompute_rel3b", "where the six planes come from, sphere and box tests, and Hi-Z occlusion.") },
        { track: "OpenGL", id: "draw-calls", title: tx(t, "oglCompute_rel4", "Draw Calls & State"), why: tx(t, "oglCompute_rel4b", "multi-draw indirect and the GPU-driven renderer built on it.") },
        { track: "OpenGL", id: "ubo", title: tx(t, "oglCompute_rel5", "Uniform Buffer Objects"), why: tx(t, "oglCompute_rel5b", "std140 and std430 layout rules, member by member.") },
      ]} />
    </Article>
  );
}

// ── Atomics ───────────────────────────────────────────────────────────────────

function AtomicsSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "oglCompute_atomicTitle", "Atomics: many invocations, one counter")}</H2>
      <p>
        {tx(t, "oglCompute_atomicBody",
          "Every example so far had each invocation write its own element. Counting is different: when thousands of invocations do count = count + 1 on the same variable, most of them read the same old value before any has written, and the increments are lost. An atomic operation does the read, the change and the write as one step that no other invocation can interrupt, and returns the value from before the change.")}
      </p>
      <LessonTable
        headers={[tx(t, "oglCompute_thAtomic", "Function"), tx(t, "oglCompute_thAtomicDoes", "Does, in one step")]}
        rows={[
          ["atomicAdd(mem, v)", tx(t, "oglCompute_a1", "mem += v; the returned old value is a unique slot when every invocation adds 1")],
          ["atomicMin / atomicMax", tx(t, "oglCompute_a2", "keeps the smaller or larger: nearest hit, depth bounds of a tile")],
          ["atomicAnd / atomicOr / atomicXor", tx(t, "oglCompute_a3", "sets or clears bits: occupancy masks, visited flags")],
          ["atomicExchange(mem, v)", tx(t, "oglCompute_a4", "writes v and returns what was there: building linked lists")],
          ["atomicCompSwap(mem, cmp, v)", tx(t, "oglCompute_a5", "writes v only if mem still equals cmp: the base of every lock-free trick")],
          ["imageAtomicAdd(img, p, v)", tx(t, "oglCompute_a6", "the same on a texel of an r32ui or r32i image")],
        ]}
      />
      <p>
        {tx(t, "oglCompute_atomicTypes",
          "They work on int and uint members of SSBOs and on shared variables. Float atomics are not core OpenGL (NV_shader_atomic_float adds them); the portable trick is to scale floats to integers, for example millimetres as uint. A brightness histogram shows the usual pattern: count in shared memory first, then merge once per group.")}
      </p>
      <CodeBlock lang="glsl" filename="histogram.comp" t={t}>{`#version 460 core
layout (local_size_x = 16, local_size_y = 16) in;          // 256 invocations: one per bin

layout (rgba8, binding = 0) uniform readonly image2D uImage;
layout (std430, binding = 1) buffer Histogram { uint bins[256]; };

shared uint localBins[256];                                 // this group's own histogram, 1 KB

void main() {
    uint lid = gl_LocalInvocationIndex;                     // 0..255
    localBins[lid] = 0u;
    memoryBarrierShared();
    barrier();

    ivec2 p = ivec2(gl_GlobalInvocationID.xy);
    if (all(lessThan(p, imageSize(uImage)))) {             // no return: all must reach the next barrier
        vec3 c = imageLoad(uImage, p).rgb;
        float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));   // Rec. 709 luminance
        atomicAdd(localBins[uint(lum * 255.0 + 0.5)], 1u);  // fast: on-chip, contended by 256 at most
    }
    memoryBarrierShared();
    barrier();

    if (localBins[lid] != 0u)
        atomicAdd(bins[lid], localBins[lid]);               // one global add per non-empty bin
}`}</CodeBlock>
      <p>
        {tx(t, "oglCompute_histBody",
          "Atomics on the same address are done one after another, so their cost grows with the number of invocations that collide. Adding every pixel of a 1920 × 1080 image straight into the global bins would be 2 million atomics fighting over 256 addresses in memory. The shared version collides only inside one 16 × 16 tile, in on-chip memory, and a tile usually covers a few dozen brightness levels, so the global adds drop to roughly one per bin that actually appears in each tile. The luminance weights are those of Rec. 709 (and sRGB): green counts most, because the eye is most sensitive to it. Clear bins with glClearNamedBufferData before each frame's dispatch.")}
      </p>
    </>
  );
}

// ── Indirect dispatch, GPU culling and ping-pong ──────────────────────────────

function IndirectSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "oglCompute_indirectTitle", "Letting the GPU decide the work: indirect calls")}</H2>
      <p>
        {tx(t, "oglCompute_indirectBody",
          "Often the result of one pass decides how much work the next one has: how many particles are alive, how many objects survived culling. Reading that count back to the CPU would stall the pipeline. Indirect calls read their parameters from a buffer instead, so a compute shader can write them and the next call uses them without the CPU ever seeing the number. glDispatchComputeIndirect(offset) reads three uints (groups in x, y, z) from the buffer bound to GL_DISPATCH_INDIRECT_BUFFER; glDrawElementsIndirect reads a whole draw command from GL_DRAW_INDIRECT_BUFFER. Both need GL_COMMAND_BARRIER_BIT after the shader that wrote them.")}
      </p>
      <p>
        {tx(t, "oglCompute_cullBody",
          "The classic use is culling on the GPU. One invocation per object tests its bounding sphere against the six planes of the camera's frustum; survivors claim a slot in a list with atomicAdd on the draw command's instanceCount, and write their index into that slot. The draw then runs exactly as many instances as survived:")}
      </p>
      <CodeBlock lang="glsl" filename="cull.comp" t={t}>{`#version 460 core
layout (local_size_x = 64) in;

struct Instance { vec4 sphere; mat4 model; };              // sphere: centre xyz, radius w (80 bytes)
layout (std430, binding = 0) readonly  buffer All     { Instance all[]; };
layout (std430, binding = 1) writeonly buffer Visible { uint visible[]; };
layout (std430, binding = 2) buffer Command {              // a DrawElementsIndirectCommand
    uint count, instanceCount, firstIndex;
    int  baseVertex;
    uint baseInstance;
} cmd;

uniform vec4 uPlanes[6];                                    // xyz: inward normal, w: distance

void main() {
    uint i = gl_GlobalInvocationID.x;
    if (i >= all.length()) return;                          // no barrier(): returning is fine
    vec4 s = all[i].sphere;
    for (int k = 0; k < 6; k++)
        if (dot(uPlanes[k].xyz, s.xyz) + uPlanes[k].w < -s.w) return;   // wholly outside one plane
    uint slot = atomicAdd(cmd.instanceCount, 1u);           // the old value: this object's place
    visible[slot] = i;
}`}</CodeBlock>
      <CodeBlock lang="cpp" filename="cull.cpp" t={t}>{`struct DrawElementsIndirectCommand {
    GLuint count, instanceCount, firstIndex;
    GLint  baseVertex;
    GLuint baseInstance;
};

// Every frame. cmdBuf was created with GL_DYNAMIC_STORAGE_BIT so it can be rewritten.
DrawElementsIndirectCommand reset{indexCount, 0, 0, 0, 0};       // instanceCount back to 0
glNamedBufferSubData(cmdBuf, 0, sizeof(reset), &reset);

glUseProgram(cullProgram);
glProgramUniform4fv(cullProgram, planesLoc, 6, &planes[0].x);   // from the view-projection matrix
glBindBufferBase(GL_SHADER_STORAGE_BUFFER, 0, instanceBuf);
glBindBufferBase(GL_SHADER_STORAGE_BUFFER, 1, visibleBuf);
glBindBufferBase(GL_SHADER_STORAGE_BUFFER, 2, cmdBuf);
glDispatchCompute((objectCount + 63) / 64, 1, 1);

// The draw reads the command (COMMAND) and the vertex shader reads visible[] (SHADER_STORAGE)
glMemoryBarrier(GL_COMMAND_BARRIER_BIT | GL_SHADER_STORAGE_BARRIER_BIT);

glUseProgram(drawProgram);
glBindVertexArray(meshVAO);
glBindBuffer(GL_DRAW_INDIRECT_BUFFER, cmdBuf);
glDrawElementsIndirect(GL_TRIANGLES, GL_UNSIGNED_INT, nullptr);   // instance count chosen by the GPU

// draw.vert:  mat4 model = all[visible[gl_InstanceID]].model;`}</CodeBlock>
      <p>
        {tx(t, "oglCompute_cullAfter",
          "The order of the visible list changes from frame to frame, because atomicAdd hands out slots in whatever order the invocations happen to run. For opaque objects that does not matter. The test keeps any sphere that is not entirely behind one plane, so a few objects just outside a corner of the frustum are drawn anyway; that is conservative and cheap. The Frustum & Occlusion Culling chapter derives the six planes from the view-projection matrix, and Draw Calls & State extends this to many different meshes with glMultiDrawElementsIndirect.")}
      </p>

      <H3>{tx(t, "oglCompute_pingTitle", "Ping-pong: when invocations read their neighbours")}</H3>
      <p>
        {tx(t, "oglCompute_pingBody",
          "The particle shader reads and writes only its own particle. A blur, a fluid or a Game of Life cell reads its neighbours, and if it writes its new value into the same buffer, neighbours that run later read a mix of old and new values. Invocations run in no fixed order, so the result is wrong in a different way on every GPU. Use two buffers or images: read the current state from one, write the next state to the other, and swap their bindings after each step, with a barrier between steps.")}
      </p>
      <CodeBlock lang="cpp" filename="pingpong.cpp" t={t}>{`GLuint state[2];                                   // two r8ui images of the same size
int cur = 0;
for (int step = 0; step < stepsPerFrame; step++) {
    glBindImageTexture(0, state[cur],     0, GL_FALSE, 0, GL_READ_ONLY,  GL_R8UI);   // read
    glBindImageTexture(1, state[1 - cur], 0, GL_FALSE, 0, GL_WRITE_ONLY, GL_R8UI);   // write
    glDispatchCompute((W + 15) / 16, (H + 15) / 16, 1);
    glMemoryBarrier(GL_SHADER_IMAGE_ACCESS_BARRIER_BIT);    // the next step reads it with imageLoad
    cur = 1 - cur;                                           // swap
}
glMemoryBarrier(GL_TEXTURE_FETCH_BARRIER_BIT);              // then it is sampled for display`}</CodeBlock>
    </>
  );
}

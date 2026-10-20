"use client";

// "Buffer Streaming & Sync" (Performance): implicit sync, orphaning, persistent mapped rings and readback.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { ringNumbers } from "@/lib/tracks/opengl/live/streaming";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { StreamingFigure } from "@/components/lesson/figures/perf/StreamingFigure";

const r = String.raw;

export function StreamingContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglStream_intro",
          "Every frame something has to travel from the CPU to the GPU: instance transforms, particle positions, UI vertices, skinning matrices. Upload it the wrong way and the CPU quietly waits for the GPU, destroying the overlap the whole pipeline depends on. Getting it right is about one idea: never write memory the GPU might still be reading.")}
      </Lead>

      <Goals t={t} id="oglStream" items={[
        "Explain how the driver stalls when you write a buffer the GPU is still using.",
        "Stream data with buffer orphaning.",
        "Use persistent mapping with fences.",
        "Read data back from the GPU without stalling.",
      ]} />

      <H2>{tx(t, "oglStream_implicitTitle", "Implicit synchronisation")}</H2>
      <p>
        {tx(t, "oglStream_implicitBody",
          "When you call glBufferSubData on a buffer used by a draw that the GPU has not executed yet, the driver has two choices. It can block until the GPU is done, or copy your data into a temporary buffer and schedule a GPU-side copy. Either way you pay, and you have no control over which. The same happens with glMapBuffer without flags, glTexSubImage on a texture in use, and glReadPixels into client memory.")}
      </p>
      <StreamingFigure t={t} />

      <H2>{tx(t, "oglStream_orphanTitle", "Orphaning")}</H2>
      <CodeBlock lang="cpp" filename="orphan.cpp" t={t}>{`glBindBuffer(GL_ARRAY_BUFFER, vbo);
glBufferData(GL_ARRAY_BUFFER, capacity, nullptr, GL_STREAM_DRAW);   // "I don't need the old contents"
glBufferSubData(GL_ARRAY_BUFFER, 0, used, data);                    // fresh storage: no wait

// Same effect with mapping:
void* p = glMapBufferRange(GL_ARRAY_BUFFER, 0, used,
                           GL_MAP_WRITE_BIT | GL_MAP_INVALIDATE_BUFFER_BIT);`}</CodeBlock>
      <p>
        {tx(t, "oglStream_orphanBody",
          "Orphaning tells the driver the old contents are no longer needed. The GPU keeps the old storage alive until it is done with it, and you get a new block right away. It is simple and works everywhere, including WebGL, but the driver does allocation and bookkeeping work on every call. Some mobile drivers handle it poorly.")}
      </p>

      <H2>{tx(t, "oglStream_persistTitle", "Persistent mapping with fences")}</H2>
      <p>
        {tx(t, "oglStream_persistBody",
          "OpenGL 4.4's glBufferStorage lets you map a buffer once and keep the pointer forever. The driver no longer protects you: you promise not to write what the GPU is reading. Split the buffer into N regions (3 is usual: one being written, one queued, one being read), and after submitting the draws that read region k, insert a fence. Before writing region k again, wait on its fence. That fence is N frames old and has almost always signalled already.")}
      </p>
      <Equation label={tx(t, "oglStream_ringLabel", "Ring indexing")}
        where={[
          [r`i`, tx(t, "oglStream_wI", "frame number")],
          [r`N`, tx(t, "oglStream_wN", "regions in the ring; must exceed the frames the GPU can lag behind")],
          [r`S`, tx(t, "oglStream_wS", "region size, rounded up to GL_UNIFORM_BUFFER_OFFSET_ALIGNMENT (or 256) if bound as a UBO range")],
          [r`\bmod`, tx(t, "oglStream_wMod", "the remainder of the division: frame numbers 0, 1, 2, 3, 4… become regions 0, 1, 2, 0, 1… for N = 3")],
          [r`\text{fence}(i - N)`, tx(t, "oglStream_wFence", "the fence inserted N frames ago, after the draws that last read this same region")],
        ]}
        words={tx(t, "oglStream_ringWords", "Frames take turns over the N regions, like seats around a table. Before frame i reuses a seat, it checks that the frame which sat there N frames ago has left: the GPU finished reading it.")}>
        {r`\begin{gathered} \text{region}(i) = i \bmod N \qquad \text{offset}(i) = S\,(i \bmod N) \\[4pt] \text{wait on fence}(i - N) \end{gathered}`}
      </Equation>
      <LiveFormula label={tx(t, "oglStream_ringLive", "Try it: a ring of N regions")}
        tex={r`\begin{gathered} \text{region}(i) = i \bmod N \qquad \text{offset}(i) = S\,(i \bmod N) \\[4pt] \text{wait on fence}(i - N) \end{gathered}`}
        vars={[
          { id: "i", label: "i", min: 0, max: 30, step: 1, value: 7, fmt: v => `${v}` },
          { id: "N", label: "N", min: 1, max: 5, step: 1, value: 3, fmt: v => `${v}` },
          { id: "S", label: "S", min: 100, max: 20000, step: 100, value: 4800, fmt: v => `${v} B` },
          { id: "F", label: "F", min: 1, max: 4, step: 1, value: 2, fmt: v => `${v}` },
        ]}
        where={[
          [r`F`, tx(t, "oglStream_wF", "frames in flight: the GPU may still be executing any of the last F frames (2 is common, 3 with triple buffering)")],
        ]}
        compute={ringNumbers(t)}
        note={tx(t, "oglStream_ringLiveNote", "4800 bytes become 4864, the next multiple of 256, so every region starts on an aligned offset. With N = 3 and F = 2 the fence is always from a frame the GPU is done with. Lower N to 2: now the fence belongs to a frame that may still be running, and the CPU waits every frame, the stall the ring was built to avoid. The rule is N > F.")} />
      <CodeBlock lang="cpp" filename="persistent_ring.cpp" t={t}>{`constexpr int N = 3;
const GLbitfield flags = GL_MAP_WRITE_BIT | GL_MAP_PERSISTENT_BIT | GL_MAP_COHERENT_BIT;
glCreateBuffers(1, &buf);
glNamedBufferStorage(buf, N * regionSize, nullptr, flags);        // immutable storage
auto* base = static_cast<std::byte*>(glMapNamedBufferRange(buf, 0, N * regionSize, flags));
GLsync fence[N] = {};

void frame(int i) {
    int k = i % N;
    if (fence[k]) {                                                // was region k read yet?
        while (glClientWaitSync(fence[k], GL_SYNC_FLUSH_COMMANDS_BIT, 1'000'000) == GL_TIMEOUT_EXPIRED) {}
        glDeleteSync(fence[k]);
    }
    std::memcpy(base + k * regionSize, instances.data(), instances.size() * sizeof(Instance));

    glBindBufferRange(GL_SHADER_STORAGE_BUFFER, 0, buf, k * regionSize, regionSize);
    drawEverything();
    fence[k] = glFenceSync(GL_SYNC_GPU_COMMANDS_COMPLETE, 0);     // signalled when the draws above finish
}`}</CodeBlock>
      <Callout type="info" t={t}>
        {tx(t, "oglStream_coherentNote",
          "GL_MAP_COHERENT_BIT makes CPU writes visible to the GPU automatically at the next draw. Without it, call glFlushMappedBufferRange for the bytes you wrote (and map with GL_MAP_FLUSH_EXPLICIT_BIT). Coherent mappings are usually write-combined memory: fast to write sequentially, extremely slow to read, so never read back through the pointer.")}
      </Callout>

      <H2>{tx(t, "oglStream_readTitle", "Reading back without stalling")}</H2>
      <p>
        {tx(t, "oglStream_readBody",
          "The same rule applies in reverse. glReadPixels into a pointer, glGetBufferSubData, or glGetQueryObject on a fresh query all force the CPU to wait for the GPU to finish everything before it. Read into a buffer object (a pixel pack buffer) instead, fence it, and map it a frame or two later, when the fence has signalled. Screenshots, GPU picking, auto-exposure and occlusion results all work this way.")}
      </p>
      <CodeBlock lang="cpp" filename="async_readback.cpp" t={t}>{`// Frame i: queue the copy into a PBO, returns immediately
glBindBuffer(GL_PIXEL_PACK_BUFFER, pbo[i % 2]);
glReadPixels(x, y, 1, 1, GL_RED_INTEGER, GL_UNSIGNED_INT, nullptr);   // offset into the PBO
readFence[i % 2] = glFenceSync(GL_SYNC_GPU_COMMANDS_COMPLETE, 0);

// Frame i + 1 (or later): only map when the GPU is done
GLenum s = glClientWaitSync(readFence[(i + 1) % 2], 0, 0);             // timeout 0: just ask
if (s == GL_ALREADY_SIGNALED || s == GL_CONDITION_SATISFIED) {
    auto* id = (GLuint*)glMapNamedBufferRange(pbo[(i + 1) % 2], 0, 4, GL_MAP_READ_BIT);
    pickedObject = *id;
    glUnmapNamedBuffer(pbo[(i + 1) % 2]);
}`}</CodeBlock>

      <LessonTable
        headers={[tx(t, "oglStream_thWay", "Method"), tx(t, "oglStream_thGL", "GL"), tx(t, "oglStream_thVerdict", "Verdict")]}
        rows={[
          ["glBufferSubData", "1.5", tx(t, "oglStream_v1", "fine for data the GPU is not using (loading); stalls or copies for per-frame data")],
          [tx(t, "oglStream_m2", "Orphaning"), "1.5", tx(t, "oglStream_v2", "simple, portable, WebGL-compatible; driver overhead per call")],
          [tx(t, "oglStream_m3", "glMapBufferRange + UNSYNCHRONIZED + own fences"), "3.0", tx(t, "oglStream_v3", "no driver sync; you manage the ring; map/unmap each frame")],
          [tx(t, "oglStream_m4", "Persistent + coherent ring"), "4.4", tx(t, "oglStream_v4", "the fastest: map once, memcpy, fence — the AZDO standard")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "oglStream_pitfalls",
          "Fences must be deleted after waiting, or they leak. Do not wait on a fence you just created: that is a glFinish in disguise. With too few ring regions (N ≤ frames in flight) you are back to stalling, and with triple buffering in the swap chain the GPU can be three frames behind. Watch GL_KHR_debug output: drivers warn about implicit synchronisation explicitly.")}
      </Callout>

      <KeyIdeas t={t} id="oglStream" items={[
        "Never overwrite memory the GPU may still be reading; the driver will stall or copy for you.",
        "Orphaning (glBufferData(NULL) or INVALIDATE) gives fresh storage cheaply and portably.",
        "Persistent mapped ring of N regions + glFenceSync / glClientWaitSync: map once, no driver sync.",
        "Read back through pixel pack buffers, fenced, a frame or two later.",
        "A wait on a just-created fence is glFinish: always keep a frame of distance.",
      ]} />
    </Article>
  );
}

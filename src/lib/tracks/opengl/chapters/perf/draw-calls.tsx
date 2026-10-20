"use client";

// "Draw Calls & State" (Performance): state-change costs, sort keys and drawing less often.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { drawCostNumbers } from "@/lib/tracks/opengl/live/draw-calls";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { SortKeyFigure } from "@/components/lesson/figures/perf/SortKeyFigure";

const r = String.raw;

export function DrawCallsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglDraw_intro",
          "A draw call itself is cheap for the GPU. The cost is on the CPU: before each draw the driver checks that the state is valid, resolves bindings, may recompile a shader variant for the current state, and writes commands. With OpenGL that is typically a few microseconds per draw, so 5 000 naive draws can eat most of a 16 ms frame on the CPU while the GPU sits half idle. The cure is to draw less often and change state less often.")}
      </Lead>

      <Goals t={t} id="oglDraw" items={[
        "Rank state changes by how much they cost.",
        "Sort draws with a key so state changes less often.",
        "Draw less often by merging and batching.",
      ]} />

      <H2>{tx(t, "oglDraw_costTitle", "Not all state costs the same")}</H2>
      <p>
        {tx(t, "oglDraw_costBody",
          "Changing some state forces the driver to flush or revalidate far more than others. The ranking below, from Cass Everitt and John McDonald's \"Approaching Zero Driver Overhead\" talk, has held across vendors for a decade. It is the order to sort by:")}
      </p>
      <LessonTable
        headers={[tx(t, "oglDraw_thState", "State change"), tx(t, "oglDraw_thRel", "Relative cost"), tx(t, "oglDraw_thEx", "Examples")]}
        rows={[
          [tx(t, "oglDraw_s1", "Render target"), "≈ 60 000 / s", "glBindFramebuffer"],
          [tx(t, "oglDraw_s2", "Program"), "≈ 300 000 / s", "glUseProgram"],
          [tx(t, "oglDraw_s3", "ROP / blend / depth state"), "", "glBlendFunc, glDepthFunc, glColorMask"],
          [tx(t, "oglDraw_s4", "Texture bindings"), "≈ 1.5 M / s", "glBindTextureUnit"],
          [tx(t, "oglDraw_s5", "Vertex format"), "", tx(t, "oglDraw_s5e", "switching VAOs with different layouts")],
          [tx(t, "oglDraw_s6", "UBO / vertex buffer bindings"), "", "glBindBufferRange, glBindVertexBuffer"],
          [tx(t, "oglDraw_s7", "Uniform updates"), "≈ 10 M / s", "glUniform*"],
        ]}
      />
      <p>
        {tx(t, "oglDraw_costNote", "(Changes per second a driver could sustain on the hardware of the time. The ratios matter, not the absolute numbers.)")}
      </p>

      <H2>{tx(t, "oglDraw_sortTitle", "Sorting draws with a key")}</H2>
      <p>
        {tx(t, "oglDraw_sortBody",
          "Instead of walking the scene graph and drawing as you go, collect every draw of the frame into a list, give each a 64-bit key that packs its state from most to least expensive, sort the integers, and submit in order. Identical states become neighbours, and the renderer skips redundant binds by comparing with the previous draw:")}
      </p>
      <Equation label={tx(t, "oglDraw_keyLabel", "A sort key (one common layout)")}
        where={[
          [r`\|`, tx(t, "oglDraw_wConcat", "concatenation: the fields are written one after the other into the bits of a single integer, the first field in the highest bits")],
          [r`\text{layer}`, tx(t, "oglDraw_wLayer", "which pass the draw belongs to: shadows, opaque, transparent, UI")],
          [r`\text{depth}`, tx(t, "oglDraw_wDepth", "the object's distance from the camera, rounded to an integer")],
        ]}
        words={tx(t, "oglDraw_keyWords", "Pack everything a draw needs into one number, with the most expensive state in the highest bits. Sorting those numbers puts draws that share expensive state next to each other.")}
        notes={[
          tx(t, "oglDraw_kn1", "Opaque: program, then material, then mesh, then depth front to back. Early-Z then rejects hidden pixels before shading."),
          tx(t, "oglDraw_kn2", "Transparent: depth back to front must come first, even though it breaks state grouping, because blending is order-dependent."),
          tx(t, "oglDraw_kn3", "Sorting 10 000 64-bit keys takes well under a millisecond (radix sort: two or three passes)."),
        ]}>
        {r`\text{key} = \underbrace{\text{layer}}_{\text{pass}} \,\|\, \underbrace{\text{program}}_{\text{most expensive}} \,\|\, \text{material} \,\|\, \text{mesh} \,\|\, \underbrace{\text{depth}}_{\text{least}}`}
      </Equation>
      <Derivation t={t} label={tx(t, "oglDraw_keyDer", "Why one integer comparison sorts by every field")}
        steps={[
          { full: true, tex: r`\begin{aligned} \text{key} = {}&\text{layer}\cdot 2^{62} + \text{program}\cdot 2^{52} \\ &+ \text{material}\cdot 2^{36} + \text{mesh}\cdot 2^{20} + \text{depth} \end{aligned}`,
            why: tx(t, "oglDraw_kd1", "one possible split of the 64 bits: 2 for the layer, 10 for the program (1024 shaders), 16 for the material, 16 for the mesh and 20 for the depth. Writing a field into higher bits means multiplying it by a power of two") },
          { full: true, tex: r`\begin{aligned} &\text{material}\cdot 2^{36} + \text{mesh}\cdot 2^{20} + \text{depth} \\ &\le (2^{16}{-}1)\,2^{36} + (2^{16}{-}1)\,2^{20} + (2^{20}{-}1) = 2^{52} - 1 \end{aligned}`,
            why: tx(t, "oglDraw_kd2", "with every lower field at its maximum, the sum is one less than the program's unit 2⁵²: the terms telescope, since (2¹⁶ − 1)·2³⁶ = 2⁵² − 2³⁶ and so on") },
          { full: true, tex: r`\begin{gathered} \text{program}_a < \text{program}_b \;\Rightarrow\; \text{key}_a < \text{key}_b \\ \text{(${tx(t, "oglDraw_kdSameLayer", "same layer, any lower fields")})} \end{gathered}`,
            why: tx(t, "oglDraw_kd3", "one step in the program field (2⁵²) outweighs everything the lower fields can add. The same holds at every boundary, so comparing keys compares layer first, then program, and so on: a lexicographic sort for the price of one integer comparison") },
          { full: true, tex: r`\begin{gathered} \text{depth} = \Big\lfloor \frac{z}{z_{far}}\,(2^{20} - 1) \Big\rfloor \\ \text{${tx(t, "oglDraw_kdTransp", "transparent")}}: \ (2^{20} - 1) - \text{depth} \end{gathered}`,
            why: tx(t, "oglDraw_kd4", "depth becomes a 20-bit integer, so near objects get small keys and sort first (front to back). For transparent draws the value is flipped so the farthest comes first, and their layer puts depth above program") },
        ]} />
      <SortKeyFigure t={t} />
      <CodeBlock lang="cpp" filename="submit.cpp" t={t}>{`std::sort(draws.begin(), draws.end(), [](auto& a, auto& b) { return a.key < b.key; });

GLuint curProgram = 0, curMaterial = ~0u, curVao = 0;
for (const Draw& d : draws) {
    if (d.program  != curProgram)  { glUseProgram(d.program);      curProgram  = d.program; }
    if (d.material != curMaterial) { bindMaterial(d.material);     curMaterial = d.material; }
    if (d.vao      != curVao)      { glBindVertexArray(d.vao);     curVao      = d.vao; }
    glUniformMatrix4fv(uModel, 1, GL_FALSE, &d.model[0][0]);
    glDrawElements(GL_TRIANGLES, d.count, GL_UNSIGNED_INT, (void*)(d.first * sizeof(GLuint)));
}`}</CodeBlock>

      <H2>{tx(t, "oglDraw_fewerTitle", "Fewer draws")}</H2>
      <LiveFormula label={tx(t, "oglDraw_costLive", "Try it: CPU time spent issuing draws")}
        tex={r`T_{draws} = N \cdot c \qquad \text{${tx(t, "oglDraw_costLiveMerged", "merged")}}: \Big\lceil \frac{N}{k} \Big\rceil \cdot c`}
        vars={[
          { id: "n", label: "N", min: 100, max: 20000, step: 100, value: 5000, fmt: v => `${v}` },
          { id: "us", label: "c", min: 0.5, max: 10, step: 0.5, value: 3, fmt: v => `${v} µs` },
          { id: "k", label: "k", min: 1, max: 256, step: 1, value: 1, fmt: v => `${v}` },
        ]}
        where={[
          [r`N`, tx(t, "oglDraw_wN", "draw calls in the frame")],
          [r`c`, tx(t, "oglDraw_wC", "CPU cost of one draw in the driver: a few microseconds with typical state changes in between")],
          [r`k`, tx(t, "oglDraw_wK", "how many draws are merged into one by batching, instancing or multi-draw")],
        ]}
        compute={drawCostNumbers(t)}
        note={tx(t, "oglDraw_costLiveNote", "5 000 draws at 3 µs each is 15 ms: almost the whole 60 Hz frame goes to the driver, before your own game code runs. Merge 16 draws into each call and it drops below 1 ms. The figure of a few µs is an order of magnitude, not a constant: measure your own driver with the bottleneck experiment from Measuring Performance.")} />
      <LessonTable
        headers={[tx(t, "oglDraw_thHow", "Technique"), tx(t, "oglDraw_thWhen", "When"), tx(t, "oglDraw_thCost", "Catch")]}
        rows={[
          [tx(t, "oglDraw_f1", "Static batching"), tx(t, "oglDraw_f1w", "many static meshes with one material: merge them into one vertex buffer at load time"), tx(t, "oglDraw_f1c", "no per-object culling or movement; memory for duplicated geometry")],
          [tx(t, "oglDraw_f2", "Instancing"), tx(t, "oglDraw_f2w", "many copies of the same mesh (see Instancing)"), tx(t, "oglDraw_f2c", "same mesh and material; per-instance data in a buffer")],
          [tx(t, "oglDraw_f3", "Texture arrays / atlases"), tx(t, "oglDraw_f3w", "different textures would split batches: put them in one GL_TEXTURE_2D_ARRAY and index by layer"), tx(t, "oglDraw_f3c", "same size and format per array; atlases bleed at mip edges")],
          [tx(t, "oglDraw_f4", "Big shared buffers"), tx(t, "oglDraw_f4w", "all meshes in one vertex/index buffer, drawn by offset (baseVertex)"), tx(t, "oglDraw_f4c", "one VAO for everything; needs an allocator")],
          [tx(t, "oglDraw_f5", "Multi-draw indirect"), tx(t, "oglDraw_f5w", "thousands of different meshes in one call: glMultiDrawElementsIndirect reads draw parameters from a buffer"), tx(t, "oglDraw_f5c", "GL 4.3; per-draw data fetched with gl_DrawID (GL 4.6)")],
          [tx(t, "oglDraw_f6", "Bindless textures"), tx(t, "oglDraw_f6w", "textures become 64-bit handles stored in a buffer; no binding at all"), tx(t, "oglDraw_f6c", "ARB_bindless_texture: widely available on desktop, not core")],
        ]}
      />
      <CodeBlock lang="cpp" filename="mdi.cpp" t={t}>{`struct DrawElementsIndirectCommand {
    GLuint count, instanceCount, firstIndex;
    GLint  baseVertex;
    GLuint baseInstance;          // free slot: use it to index per-object data
};

// All meshes live in one vertex + index buffer; per-object data in an SSBO
std::vector<DrawElementsIndirectCommand> cmds = buildCommands(visibleList);
glNamedBufferSubData(indirectBuf, 0, cmds.size() * sizeof(cmds[0]), cmds.data());
glBindBuffer(GL_DRAW_INDIRECT_BUFFER, indirectBuf);
glMultiDrawElementsIndirect(GL_TRIANGLES, GL_UNSIGNED_INT, nullptr, GLsizei(cmds.size()), 0);

// vertex shader
// layout(std430, binding = 0) readonly buffer Objects { mat4 model[]; };
// mat4 M = model[gl_DrawID];     // or gl_BaseInstance`}</CodeBlock>
      <Callout type="info" t={t}>
        {tx(t, "oglDraw_gpuDriven", "Combine the last three rows with the Hi-Z culling from the previous chapter and you get a GPU-driven renderer. A compute shader culls every object and writes the indirect command buffer; one glMultiDrawElementsIndirectCount draws what survived. The CPU cost per frame no longer depends on the object count. Vulkan and D3D12 were designed around the same idea.")}
      </Callout>
      <Callout type="warn" t={t}>
        {tx(t, "oglDraw_pitfalls",
          "Redundant state calls are not free just because the value did not change: the driver still has to check. Filter them yourself. Avoid glGet* for anything you set yourself; keep a shadow copy. Changing a uniform of a program that is not bound needs glProgramUniform or DSA, not a program switch. And measure first: a GPU-bound frame gains nothing from fewer draw calls.")}
      </Callout>

      <KeyIdeas t={t} id="oglDraw" items={[
        "Draw-call cost is CPU/driver validation; state changes differ by orders of magnitude.",
        "Collect draws, sort by a 64-bit key (pass | program | material | mesh | depth), skip redundant binds.",
        "Opaque front to back for early-Z; transparent back to front for correct blending.",
        "Reduce draws with batching, instancing, texture arrays, shared buffers and multi-draw indirect.",
        "GPU-driven rendering: compute culls, writes indirect commands, one call draws the scene.",
      ]} />
    </Article>
  );
}

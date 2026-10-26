"use client";

// GLSL track — "Versions & Dialects": #version, desktop vs ES vs Vulkan GLSL,
// porting old shaders, SPIR-V compilation and the preprocessor.

import type { TrackTranslations } from "@/lib/tracks/types";
import { tx } from "@/lib/tracks/tx";
import { CodeBlock, Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { KeyIdeas, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { DialectFigure } from "@/components/lesson/glsl/DialectFigure";

export function VersionsContent({ t }: { t: TrackTranslations }) {
  return (
    <article className="space-y-5 text-[var(--text-muted)] leading-relaxed text-base">

      <p className="text-lg text-[var(--text-main)]">
        {tx(t, "glslVer_intro",
          "GLSL is not one language. It is a family of closely related languages: one for desktop OpenGL, one for phones and the web (GLSL ES), and a set of rules for Vulkan. They share almost every function and type, but a shader written for one is often rejected by another. This chapter shows how to tell them apart, how to move a shader between them, and how to keep one source that compiles everywhere."
        )}
      </p>

      <Goals t={t} id="glslVer" items={[
        "Read a #version line and say which API and which GPUs it is for.",
        "Port an old shader that uses attribute, varying and gl_FragColor.",
        "Write a fragment shader that compiles in WebGL 2 and on phones.",
        "Turn an OpenGL shader into a Vulkan one and compile it to SPIR-V.",
        "Keep one shader source for several targets with the preprocessor.",
      ]} />

      {/* ── #version ── */}
      <H2>{tx(t, "glslVer_versionTitle", "The #version line")}</H2>
      <p>
        {tx(t, "glslVer_versionBody1",
          "The first thing a GLSL compiler reads is the #version line. It says which edition of the language the rest of the file is written in, and the compiler then accepts exactly the words and rules of that edition. The number is the GLSL version times 100: #version 330 means GLSL 3.30."
        )}
      </p>
      <p>
        {tx(t, "glslVer_versionBody2",
          "Desktop GLSL versions follow OpenGL. Up to OpenGL 3.2 the numbers were different (OpenGL 2.0 came with GLSL 1.10), and from OpenGL 3.3 on they match: GLSL 3.30 is OpenGL 3.3, GLSL 4.60 is OpenGL 4.6. A desktop shader with no #version line at all is compiled as GLSL 1.10, the oldest edition, which is almost never what you want."
        )}
      </p>
      <LessonTable
        headers={[tx(t, "glslVer_vH0", "#version"), tx(t, "glslVer_vH1", "API"), tx(t, "glslVer_vH2", "What it added")]}
        rows={[
          ["110", "OpenGL 2.0", tx(t, "glslVer_v110", "the first GLSL; also what you get with no #version line")],
          ["120", "OpenGL 2.1", tx(t, "glslVer_v120", "non-square matrices such as mat2x3")],
          ["130", "OpenGL 3.0", tx(t, "glslVer_v130", "in and out instead of attribute and varying, one texture() for every sampler, full integer support")],
          ["140", "OpenGL 3.1", tx(t, "glslVer_v140", "uniform blocks")],
          ["150", "OpenGL 3.2", tx(t, "glslVer_v150", "geometry shaders, interface blocks, the core and compatibility profiles")],
          ["330", "OpenGL 3.3", tx(t, "glslVer_v330", "layout(location = n) on vertex inputs and fragment outputs; the numbers now match OpenGL")],
          ["400", "OpenGL 4.0", tx(t, "glslVer_v400", "tessellation shaders, double")],
          ["420", "OpenGL 4.2", tx(t, "glslVer_v420", "layout(binding = n), image load and store, atomic counters")],
          ["430", "OpenGL 4.3", tx(t, "glslVer_v430", "compute shaders, shader storage buffers, layout(location) on uniforms")],
          ["450", "OpenGL 4.5", tx(t, "glslVer_v450", "dFdxFine and dFdxCoarse, cull distances")],
          ["460", "OpenGL 4.6", tx(t, "glslVer_v460", "gl_BaseVertex, gl_BaseInstance and gl_DrawID built in; OpenGL can load SPIR-V")],
        ]}
      />
      <p>
        {tx(t, "glslVer_esBody",
          "GLSL ES is the edition for OpenGL ES, the API of phones and tablets, and for WebGL, which is OpenGL ES inside a browser. Its version line ends in es, except the first one:"
        )}
      </p>
      <LessonTable
        headers={[tx(t, "glslVer_vH0", "#version"), tx(t, "glslVer_vH1", "API"), tx(t, "glslVer_vH2", "What it added")]}
        rows={[
          [tx(t, "glslVer_e100a", "100 (or no line)"), "OpenGL ES 2.0, WebGL 1", tx(t, "glslVer_e100", "the old style: attribute, varying, gl_FragColor, texture2D")],
          ["300 es", "OpenGL ES 3.0, WebGL 2", tx(t, "glslVer_e300", "the modern style of desktop 3.30: in, out, texture(), layout(location)")],
          ["310 es", "OpenGL ES 3.1", tx(t, "glslVer_e310", "compute shaders, storage buffers, image load and store; not in WebGL")],
          ["320 es", "OpenGL ES 3.2", tx(t, "glslVer_e320", "geometry and tessellation shaders; not in WebGL")],
        ]}
      />
      <p>
        {tx(t, "glslVer_profileBody",
          "From 1.50 on, a desktop #version line can name a profile: core or compatibility. Core contains only the modern language. Compatibility also keeps everything that was deprecated, such as gl_FragColor and gl_ModelViewMatrix, and works only with a compatibility OpenGL context. With no profile word, 1.50 and later mean core. This track and the OpenGL track always write core."
        )}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "glslVer_firstLine",
          "On desktop, only comments and blank lines may come before #version. WebGL is stricter: #version 300 es must be the very first line of the text. A shader stored in a JavaScript template string that starts with a line break, `\\n#version 300 es`, fails with \"#version directive must occur on the first line\". Start the string right after the backtick."
        )}
      </Callout>

      {/* ── porting ── */}
      <H2>{tx(t, "glslVer_portTitle", "Old tutorials: what changed in GLSL 1.30")}</H2>
      <p>
        {tx(t, "glslVer_portBody",
          "Much of the GLSL on the internet, and every GLSL ES 1.00 shader written for WebGL 1, still uses the words from before GLSL 1.30. They are not wrong in their own dialect, but a #version 330 core or a #version 300 es shader rejects them. Porting is mechanical:"
        )}
      </p>
      <LessonTable
        headers={[tx(t, "glslVer_pH0", "Old (1.10, 1.20, ES 1.00)"), tx(t, "glslVer_pH1", "Modern (3.30, ES 3.00, Vulkan)"), tx(t, "glslVer_pH2", "Note")]}
        rows={[
          ["attribute vec3 aPos;", "layout(location = 0) in vec3 aPos;", tx(t, "glslVer_p1", "vertex shader inputs")],
          ["varying vec2 vUV;", tx(t, "glslVer_p2a", "out vec2 vUV; (vertex) · in vec2 vUV; (fragment)"), tx(t, "glslVer_p2", "one word became two, one per side")],
          ["gl_FragColor = c;", "out vec4 FragColor; … FragColor = c;", tx(t, "glslVer_p3", "you declare the output and choose its name")],
          ["gl_FragData[1] = n;", "layout(location = 1) out vec4 Normal;", tx(t, "glslVer_p4", "several render targets, as in deferred shading")],
          ["texture2D, textureCube, shadow2D", "texture", tx(t, "glslVer_p5", "the sampler's type picks the right version")],
          ["texture2DLod", "textureLod", tx(t, "glslVer_p6", "the same for every variant: Lod, Proj, Grad")],
          ["gl_ModelViewProjectionMatrix, gl_Vertex, ftransform()", tx(t, "glslVer_p7a", "your own uniforms and attributes"), tx(t, "glslVer_p7", "the old fixed-function state is gone from core")],
        ]}
      />
      <DialectFigure t={t} />

      {/* ── ES ── */}
      <H2>{tx(t, "glslVer_esTitle", "GLSL ES: phones and the web")}</H2>
      <p>
        {tx(t, "glslVer_esPrec",
          "The difference you meet first is precision. A desktop GPU computes every float with 32 bits. A phone GPU may offer a faster 16-bit float, and GLSL ES lets the shader choose with highp, mediump and lowp, as the Types & Vectors chapter explains. The vertex shader has a default (highp), but the fragment shader has none for float, so a GLSL ES fragment shader without a precision line does not compile: \"No precision specified for (float)\"."
        )}
      </p>
      <CodeBlock lang="glsl" filename="es_fragment.frag" t={t}>{`#version 300 es
precision highp float;      // required: a fragment shader has no default float precision
precision highp sampler2D;  // optional: samplers default to lowp, enough for 8-bit colour but not for float textures

in vec2 vUV;
uniform sampler2D uAlbedo;
out vec4 FragColor;

void main() {
    FragColor = texture(uAlbedo, vUV);
}`}</CodeBlock>
      <p>
        {tx(t, "glslVer_esStrict",
          "GLSL ES is also stricter about types. Desktop GLSL from 1.20 on turns an int into a float where one is expected, so float x = 1; compiles there. GLSL ES never converts on its own: write 1.0. A shader developed only on a desktop compiler often breaks on a phone for exactly this reason."
        )}
      </p>
      <LessonTable
        headers={[tx(t, "glslVer_mH0", "Missing in WebGL 2 (GLSL ES 3.00)"), tx(t, "glslVer_mH1", "What to do instead")]}
        rows={[
          [tx(t, "glslVer_m1", "noperspective"), tx(t, "glslVer_m1b", "the extension GL_NV_shader_noperspective_interpolation where it exists, or the two-varying trick from the Built-in Variables chapter")],
          [tx(t, "glslVer_m2", "geometry and tessellation shaders"), tx(t, "glslVer_m2b", "build the geometry on the CPU, or expand it in the vertex shader from gl_VertexID")],
          [tx(t, "glslVer_m3", "compute shaders and storage buffers"), tx(t, "glslVer_m3b", "a fragment shader drawing into a texture, with ping-pong between two textures; or WebGPU")],
          [tx(t, "glslVer_m4", "double, dFdxFine, dFdxCoarse"), tx(t, "glslVer_m4b", "float, and plain dFdx")],
        ]}
      />

      {/* ── Vulkan ── */}
      <H2>{tx(t, "glslVer_vkTitle", "GLSL for Vulkan")}</H2>
      <p>
        {tx(t, "glslVer_vkBody1",
          "Vulkan does not accept shader text at all. It takes SPIR-V, a binary intermediate language, and the GLSL is compiled to SPIR-V ahead of time, usually as a build step. Two compilers ship with the Vulkan SDK: glslc (from Google's shaderc) and glslangValidator (the Khronos reference compiler). Both use the same front end and produce the same kind of file."
        )}
      </p>
      <CodeBlock lang="bash" filename="compile.sh" t={t}>{`glslc shader.vert -o shader.vert.spv     # the stage comes from the extension: .vert .frag .comp ...
glslc shader.frag -o shader.frag.spv
glslc -O shader.frag -o shader.frag.spv  # optimise the SPIR-V

glslangValidator -V shader.vert -o shader.vert.spv   # the reference compiler; -V = for Vulkan

spirv-dis shader.vert.spv                # print the SPIR-V as readable text`}</CodeBlock>
      <p>
        {tx(t, "glslVer_vkBody2",
          "The language is GLSL 4.50 or 4.60 with a few changes, written down in the GL_KHR_vulkan_glsl extension. The compiler applies them because it is told to compile for Vulkan, not because the source asks for them. Most of the changes come from one fact: Vulkan has no glUniform calls. Everything a shader reads from outside comes from a descriptor set or from push constants."
        )}
      </p>
      <LessonTable
        headers={[tx(t, "glslVer_kH0", "Topic"), tx(t, "glslVer_kH1", "OpenGL GLSL"), tx(t, "glslVer_kH2", "Vulkan GLSL")]}
        rows={[
          [tx(t, "glslVer_k1", "plain values"), "uniform mat4 uMVP;", tx(t, "glslVer_k1b", "only inside a uniform block; a loose float or mat4 is an error")],
          [tx(t, "glslVer_k2", "where a resource comes from"), tx(t, "glslVer_k2a", "a location or binding set from C++ with glUniform* or glBindBufferBase"), "layout(set = s, binding = b)"],
          [tx(t, "glslVer_k3", "small per-draw values"), tx(t, "glslVer_k3a", "a uniform"), tx(t, "glslVer_k3b", "a layout(push_constant) block, at least 128 bytes")],
          [tx(t, "glslVer_k4", "matching stages"), tx(t, "glslVer_k4a", "by name; location optional"), tx(t, "glslVer_k4b", "by location; layout(location = n) required on every in and out")],
          [tx(t, "glslVer_k5", "vertex and instance number"), "gl_VertexID, gl_InstanceID", tx(t, "glslVer_k5b", "gl_VertexIndex, gl_InstanceIndex; the instance index includes firstInstance")],
          [tx(t, "glslVer_k6", "textures"), "sampler2D", tx(t, "glslVer_k6b", "sampler2D, or a texture2D and a sampler kept apart and joined where used: sampler2D(tex, samp)")],
          [tx(t, "glslVer_k7", "compile-time constants"), "#define N 4", tx(t, "glslVer_k7b", "also specialization constants, set when the pipeline is created")],
        ]}
      />
      <CodeBlock lang="glsl" filename="vulkan_only.frag" t={t}>{`#version 450

// A specialization constant: 4 unless the pipeline sets constant 0 to something else.
// The driver then compiles the shader with that value, as if it had been a #define.
layout(constant_id = 0) const int SAMPLES = 4;

// A texture and a sampler kept apart: one sampler can serve many textures
layout(set = 0, binding = 0) uniform texture2D uColor;
layout(set = 0, binding = 1) uniform sampler   uLinear;

layout(location = 0) in  vec2 vUV;
layout(location = 0) out vec4 FragColor;

void main() {
    vec4 sum = vec4(0.0);
    for (int i = 0; i < SAMPLES; i++) {
        vec2 offset = vec2(float(i) / float(SAMPLES) - 0.5, 0.0) * 0.01;
        sum += texture(sampler2D(uColor, uLinear), vUV + offset);   // joined where it is used
    }
    FragColor = sum / float(SAMPLES);
}`}</CodeBlock>
      <Callout type="info" t={t}>
        {tx(t, "glslVer_vkConv",
          "Two differences are not in the language at all: in Vulkan, clip-space y points down and depth goes from 0 to 1 instead of −1 to 1. The shader text stays the same; the projection matrix built on the C++ side changes. The Graphics Pipeline chapter of the Vulkan track shows how."
        )}
      </Callout>

      {/* ── preprocessor ── */}
      <H2>{tx(t, "glslVer_ppTitle", "One source, many targets: the preprocessor")}</H2>
      <p>
        {tx(t, "glslVer_ppBody1",
          "GLSL has a preprocessor much like C's, which runs before the compiler proper. Besides #define, #if, #ifdef and #else, it gives each dialect a few macros to test: __VERSION__ holds the version number (330, 300…), GL_ES is defined as 1 in GLSL ES, and VULKAN is defined as 100 when compiling for Vulkan."
        )}
      </p>
      <p>
        {tx(t, "glslVer_ppBody2",
          "The usual way to share a shader between targets is to leave the #version line out of the file and let the program put it in front when it loads the source, together with any settings. The body uses the macros to cover the differences that remain."
        )}
      </p>
      <CodeBlock lang="cpp" filename="load_shader.cpp" t={t}>{`// The file has no #version line; the program chooses it for the API it runs on.
std::string header =
#ifdef __EMSCRIPTEN__
    "#version 300 es\\n";                      // a WebGL 2 build
#else
    "#version 330 core\\n";                    // desktop OpenGL
#endif
header += "#define MAX_LIGHTS 8\\n";         // settings go in the same way

std::string source = header + readFile("shaders/lit.frag");`}</CodeBlock>
      <CodeBlock lang="glsl" filename="lit.frag" t={t}>{`#ifdef GL_ES
precision highp float;          // GLSL ES needs it (desktop 1.30+ would accept and ignore it)
#endif

#ifndef MAX_LIGHTS
#define MAX_LIGHTS 4            // a default if the program did not set one
#endif
#if MAX_LIGHTS > 16
#error MAX_LIGHTS is too large for the uniform array
#endif

#ifdef VULKAN
layout(set = 0, binding = 0) uniform Lights { vec4 pos[MAX_LIGHTS]; } lights;
#define LIGHT_POS(i) lights.pos[i]
#else
uniform vec4 uLightPos[MAX_LIGHTS];
#define LIGHT_POS(i) uLightPos[i]
#endif`}</CodeBlock>
      <H3>{tx(t, "glslVer_extTitle", "#extension")}</H3>
      <p>
        {tx(t, "glslVer_extBody",
          "Features newer than the version, or offered only by some GPUs, are switched on by name with #extension, right after the #version line. require stops the compile if the extension is missing; enable turns it on if it is there, and the shader can test the macro of the same name to see whether it is. WebGL extensions with shader parts work the same way, once JavaScript has enabled them with getExtension."
        )}
      </p>
      <CodeBlock lang="glsl" filename="extensions.glsl" t={t}>{`#version 300 es
#extension GL_NV_shader_noperspective_interpolation : enable

#ifdef GL_NV_shader_noperspective_interpolation
noperspective in vec3 vEdgeDist;      // the real qualifier, where the GPU has it
#else
in vec3 vEdgeDist;                    // fall back to perspective-correct
#endif

// Vulkan, bindless textures (see Modern Vulkan):
// #extension GL_EXT_nonuniform_qualifier : require`}</CodeBlock>
      <Callout type="tip" t={t}>
        {tx(t, "glslVer_include",
          "Core GLSL has no #include. In OpenGL you join the files yourself before glShaderSource; the loader of the Shader Class chapter is the place to do it. glslc understands #include \"common.glsl\" by itself (through the GL_GOOGLE_include_directive extension), which is one more reason Vulkan projects keep their shaders in many small files."
        )}
      </Callout>

      {/* ── mistakes ── */}
      <H2>{tx(t, "glslVer_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "glslVer_xH0", "Message or symptom"), tx(t, "glslVer_xH1", "Cause"), tx(t, "glslVer_xH2", "Fix")]}
        rows={[
          ["#version directive must occur on the first line", tx(t, "glslVer_x1b", "a line break or comment before #version, in WebGL"), tx(t, "glslVer_x1c", "start the string with #version")],
          ["No precision specified for (float)", tx(t, "glslVer_x2b", "a GLSL ES fragment shader without a precision line"), "precision highp float;"],
          [tx(t, "glslVer_x3a", "works on the PC, fails on a phone"), tx(t, "glslVer_x3b", "float x = 1; and similar int-to-float conversions"), tx(t, "glslVer_x3c", "write float literals: 1.0")],
          [tx(t, "glslVer_x4a", "works on one desktop GPU, fails on another"), tx(t, "glslVer_x4b", "some drivers accept code the specification forbids"), tx(t, "glslVer_x4c", "check shaders with glslangValidator, which follows the specification")],
          ["SPIR-V requires location for user input/output", tx(t, "glslVer_x5b", "an in or out without layout(location) in Vulkan"), tx(t, "glslVer_x5c", "number every in and out")],
          ["non-opaque uniforms outside a block", tx(t, "glslVer_x6b", "an OpenGL-style loose uniform compiled for Vulkan"), tx(t, "glslVer_x6c", "move it into a uniform block or a push_constant block")],
        ]}
      />

      <KeyIdeas t={t} id="glslVer" items={[
        "#version picks the edition of the language: 330 = OpenGL 3.3, 300 es = WebGL 2, 450 with glslc = Vulkan.",
        "Old GLSL (attribute, varying, gl_FragColor, texture2D) ports to modern GLSL word for word.",
        "GLSL ES fragment shaders need a precision line, and GLSL ES never turns an int into a float for you.",
        "Vulkan GLSL is compiled to SPIR-V ahead of time; resources come from descriptor sets and push constants, and every in and out has a location.",
        "Leave #version out of shared files: the loader adds it, and the preprocessor (GL_ES, VULKAN, __VERSION__) covers the rest.",
      ]} />

      <Related t={t} links={[
        { track: "GLSL", id: "types", title: tx(t, "glslVer_rel1", "Types & Vectors"), why: tx(t, "glslVer_rel1b", "highp, mediump and lowp, and what each one can hold.") },
        { track: "Vulkan", id: "pipeline", title: tx(t, "glslVer_rel2", "The Graphics Pipeline"), why: tx(t, "glslVer_rel2b", "loading SPIR-V into shader modules, and Vulkan's clip space.") },
        { track: "Vulkan", id: "descriptors", title: tx(t, "glslVer_rel3", "Descriptors, Uniforms & Push Constants"), why: tx(t, "glslVer_rel3b", "the C++ side of set, binding and push_constant.") },
        { track: "GLSL", id: "shaderclass", title: tx(t, "glslVer_rel4", "Shader Class in C++"), why: tx(t, "glslVer_rel4b", "a loader that reads shader files, reports errors and reloads them; the place to add the #version header.") },
      ]} />
    </article>
  );
}

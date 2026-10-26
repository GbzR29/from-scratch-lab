// ── One shader, five dialects ─────────────────────────────────────────────────
// The same textured, lit vertex + fragment pair written for each GLSL dialect
// the Versions chapter compares. A line ending in `//#key` carries a note: the
// figure strips the marker, numbers the line and explains it under the code.

export type DialectId = "gl120" | "es100" | "gl330" | "es300" | "vk450";
export type Stage = "vert" | "frag";

export const DIALECTS: { id: DialectId; label: string; target: string }[] = [
  { id: "gl120", label: "1.20", target: "OpenGL 2.1" },
  { id: "es100", label: "ES 1.00", target: "WebGL 1 · OpenGL ES 2.0" },
  { id: "gl330", label: "3.30 core", target: "OpenGL 3.3+" },
  { id: "es300", label: "ES 3.00", target: "WebGL 2 · OpenGL ES 3.0" },
  { id: "vk450", label: "4.50 Vulkan", target: "Vulkan (SPIR-V)" },
];

const BODY_VS = (normal: string, mvp: string) => `void main() {
    vNormal = ${normal} * aNormal;
    vUV = aUV;
    gl_Position = ${mvp} * vec4(aPos, 1.0);
}`;

const BODY_FS = (sample: string, light: string, out: string) => `void main() {
    float diff = max(dot(normalize(vNormal), ${light}), 0.0);
    vec3 albedo = ${sample}(uAlbedo, vUV).rgb;${sample === "texture2D" ? " //#tex2D" : ""}
    ${out} = vec4(albedo * (0.15 + 0.85 * diff), 1.0);${out === "gl_FragColor" ? " //#fragColor" : ""}
}`;

export const SOURCES: Record<DialectId, Record<Stage, string>> = {
  gl120: {
    vert: `#version 120 //#ver120
attribute vec3 aPos; //#attr
attribute vec3 aNormal;
attribute vec2 aUV;
uniform mat4 uMVP;
uniform mat3 uNormalMat;
varying vec3 vNormal; //#varying
varying vec2 vUV;
${BODY_VS("uNormalMat", "uMVP")}`,
    frag: `#version 120
uniform sampler2D uAlbedo;
uniform vec3 uLightDir;
varying vec3 vNormal; //#varying
varying vec2 vUV;
${BODY_FS("texture2D", "uLightDir", "gl_FragColor")}`,
  },
  es100: {
    vert: `attribute vec3 aPos; //#es100
attribute vec3 aNormal;
attribute vec2 aUV;
uniform mat4 uMVP;
uniform mat3 uNormalMat;
varying vec3 vNormal;
varying vec2 vUV;
${BODY_VS("uNormalMat", "uMVP")}`,
    frag: `precision mediump float; //#mediump
uniform sampler2D uAlbedo;
uniform vec3 uLightDir;
varying vec3 vNormal;
varying vec2 vUV;
${BODY_FS("texture2D", "uLightDir", "gl_FragColor")}`,
  },
  gl330: {
    vert: `#version 330 core //#ver330
layout(location = 0) in vec3 aPos; //#loc
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;
uniform mat4 uMVP;
uniform mat3 uNormalMat;
out vec3 vNormal; //#out
out vec2 vUV;
${BODY_VS("uNormalMat", "uMVP")}`,
    frag: `#version 330 core
uniform sampler2D uAlbedo;
uniform vec3 uLightDir;
in vec3 vNormal; //#in
in vec2 vUV;
layout(location = 0) out vec4 FragColor; //#fragOut
${BODY_FS("texture", "uLightDir", "FragColor")}`,
  },
  es300: {
    vert: `#version 300 es //#ver300
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;
uniform mat4 uMVP;
uniform mat3 uNormalMat;
out vec3 vNormal;
out vec2 vUV;
${BODY_VS("uNormalMat", "uMVP")}`,
    frag: `#version 300 es
precision highp float; //#highp
uniform sampler2D uAlbedo;
uniform vec3 uLightDir;
in vec3 vNormal;
in vec2 vUV;
layout(location = 0) out vec4 FragColor;
${BODY_FS("texture", "uLightDir", "FragColor")}`,
  },
  vk450: {
    vert: `#version 450 //#ver450
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;
layout(set = 0, binding = 0) uniform Camera { //#block
    mat4 mvp;
    mat4 normalMat; //#mat
} cam;
layout(location = 0) out vec3 vNormal; //#vloc
layout(location = 1) out vec2 vUV;
${BODY_VS("mat3(cam.normalMat)", "cam.mvp")}`,
    frag: `#version 450
layout(set = 0, binding = 1) uniform sampler2D uAlbedo; //#binding
layout(push_constant) uniform Push { //#push
    vec3 lightDir;
} pc;
layout(location = 0) in vec3 vNormal;
layout(location = 1) in vec2 vUV;
layout(location = 0) out vec4 FragColor;
${BODY_FS("texture", "pc.lightDir", "FragColor")}`,
  },
};

/** Note text per marker key (English; the figure translates with figDialect_n_<key>). */
export const NOTES: Record<string, string> = {
  ver120: "#version 120 is GLSL for OpenGL 2.1. On desktop GL, a shader with no #version line at all is compiled as 1.10.",
  attr: "attribute: a per-vertex input. The linker picks its index unless the C++ side calls glBindAttribLocation before linking.",
  varying: "varying: written by the vertex shader and read, interpolated, by the fragment shader. The same word on both sides.",
  tex2D: "One function per sampler type: texture2D, textureCube, texture3D… From GLSL 1.30 on, a single overloaded texture() replaces them all.",
  fragColor: "gl_FragColor: a built-in output. It is deprecated since GLSL 1.30 and gone from the core profile, where you declare your own out.",
  es100: "No #version line means GLSL ES 1.00, the language of WebGL 1 and OpenGL ES 2.0. It still uses attribute, varying and gl_FragColor, and WebGL 2 still accepts it.",
  mediump: "GLSL ES fragment shaders have no default float precision: without this line they do not compile. mediump (at least 16-bit) is enough for colours and is faster on many phone GPUs.",
  ver330: "#version 330 core is OpenGL 3.3 with the core profile: everything deprecated before, like attribute, varying and gl_FragColor, is gone.",
  loc: "layout(location = n) fixes the attribute's index, so glVertexAttribPointer(n, …) on the C++ side needs no lookup. Available from GLSL 3.30 and ES 3.00.",
  out: "out replaces varying in the vertex shader. The fragment shader declares the same name and type as in.",
  in: "in is the other half of the vertex shader's out. The two are matched by name in OpenGL.",
  fragOut: "Your own colour output. A single output goes to colour attachment 0; the location says so explicitly, and with several outputs it picks the attachment for each.",
  ver300: "#version 300 es is OpenGL ES 3.0 and WebGL 2. In WebGL it must be the very first line: even a comment or an empty line before it is an error.",
  highp: "Still needed in GLSL ES 3.00: fragment shaders have no default float precision. highp is 32-bit float on almost every GPU sold today.",
  ver450: "#version 450, compiled ahead of time to SPIR-V by glslc. The Vulkan rules (GL_KHR_vulkan_glsl) are turned on by the compiler's target, not by the source.",
  block: "Vulkan GLSL has no loose uniforms like uMVP. Plain values live in a uniform block, and the block is one descriptor of a descriptor set.",
  mat: "A mat4 instead of a mat3: in a std140 block each mat3 column is padded to a vec4 anyway, and a mat4 avoids a padding mismatch on the C++ side.",
  vloc: "Every in and out between stages needs a location. SPIR-V matches stages by location, not by name.",
  binding: "set and binding name the descriptor this sampler reads. The descriptor set layout on the C++ side must describe the same pair.",
  push: "push_constant: a small block written straight into the command buffer with vkCmdPushConstants. Every device offers at least 128 bytes.",
};

/** Splits a source into display lines with their note keys, and the plain source to compile. */
export function parseSource(src: string) {
  const lines = src.split("\n").map(l => {
    const m = l.match(/^(.*?)\s*\/\/#(\w+)$/);
    return m ? { text: m[1], key: m[2] } : { text: l, key: null as string | null };
  });
  return { lines, code: lines.map(l => l.text).join("\n") };
}

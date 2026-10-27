"use client";

// SDL3 track — "SDL_GPU": where it sits next to SDL_Renderer, OpenGL and
// Vulkan; its objects; the shader-format problem and this chapter's choice
// (GLSL → SPIR-V with glslc, plus MSL source for macOS); a separate small
// project, sdl3-gpu, that draws one triangle: CMakeLists with a shaders
// target, the two GLSL shaders and the Metal file; device and window; the
// pipeline and the vertex layout (pitch, offsets); NDC to pixels (formula);
// upload through a transfer buffer and a copy pass; the frame, with the
// GpuFrame figure (record, submit, untick a line); cycling and frames in
// flight; the complete main.cpp; 3.4's custom shaders in the 2D renderer;
// when to choose it; common mistakes. Facts checked in SDL 3.4.18
// (SDL_gpu.h, SDL_gpu.c, SDL_render.h, test/testgpurender_effects.c).

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { GpuFrameFigure } from "@/components/lesson/figures/sdl3/GpuFrameFigure";

const r = String.raw;

export function GpuContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl09_intro",
          "SDL_Renderer draws sprites, shapes and text, and for a 2D game that is often all you need. When you want your own shaders, 3D, or effects the renderer cannot do, SDL3 has a second graphics API: SDL_GPU. It works the way Vulkan, Direct3D 12 and Metal work, with command buffers, pipelines and explicit uploads, and runs on all three. This chapter leaves the game for a moment and builds a separate small program that draws one coloured triangle, the first picture of every graphics API.")}
      </Lead>

      <Goals t={t} id="sdl09" items={[
        "Say where SDL_GPU sits next to SDL_Renderer, OpenGL and Vulkan, and when to choose it.",
        "Build shaders for SDL_GPU: SPIR-V from GLSL with glslc, and Metal source for macOS.",
        "Create a GPU device, a graphics pipeline and a vertex layout.",
        "Upload vertices through a transfer buffer and a copy pass.",
        "Record a frame into a command buffer and explain why nothing happens before submit.",
      ]} />

      <H2>{tx(t, "sdl09_whereTitle", "Where it sits")}</H2>
      <LessonTable
        headers={[tx(t, "sdl09_h0", "API"), tx(t, "sdl09_h1", "You control"), tx(t, "sdl09_h2", "A coloured triangle")]}
        rows={[
          ["SDL_Renderer", tx(t, "sdl09_a1", "what to draw: textures, rectangles, lines, geometry; SDL picks the backend"), tx(t, "sdl09_b1", "one SDL_RenderGeometry call")],
          ["OpenGL 4.6", tx(t, "sdl09_a2", "shaders and buffers; the driver keeps hidden global state"), tx(t, "sdl09_b2", "about 100 lines")],
          ["SDL_GPU", tx(t, "sdl09_a3", "shaders, pipelines, command buffers, uploads; SDL handles memory, synchronization and the swapchain"), tx(t, "sdl09_b3", "about 200 lines (this chapter)")],
          ["Vulkan", tx(t, "sdl09_a4", "everything, including memory types, barriers and fences"), tx(t, "sdl09_b4", "about 1000 lines")],
        ]}
      />
      <p>
        {tx(t, "sdl09_whereBody",
          "SDL_GPU takes the parts of the modern APIs that give speed and predictability: work is recorded first and sent to the GPU in one batch, and all pipeline state is fixed in advance. It leaves out the parts that make Vulkan long: choosing memory types, placing barriers between passes, waiting on fences by hand. SDL tracks which resources are in use and does that for you.")}
      </p>

      <H2>{tx(t, "sdl09_objectsTitle", "The objects")}</H2>
      <LessonTable
        headers={[tx(t, "sdl09_oh0", "Object"), tx(t, "sdl09_oh1", "What it is"), tx(t, "sdl09_oh2", "Made")]}
        rows={[
          ["SDL_GPUDevice", tx(t, "sdl09_o1", "the connection to the graphics card, through one backend"), tx(t, "sdl09_o1b", "once")],
          ["SDL_GPUShader", tx(t, "sdl09_o2", "one compiled shader stage: vertex or fragment"), tx(t, "sdl09_o2b", "once, freed after the pipeline is made")],
          ["SDL_GPUGraphicsPipeline", tx(t, "sdl09_o3", "everything about how to draw, fixed: shaders, vertex layout, primitive type, target format, blending"), tx(t, "sdl09_o3b", "once")],
          ["SDL_GPUBuffer", tx(t, "sdl09_o4", "memory on the GPU: vertices, indices, storage"), tx(t, "sdl09_o4b", "once")],
          ["SDL_GPUTransferBuffer", tx(t, "sdl09_o5", "memory the CPU can write, used to send data to (or read it from) GPU buffers and textures"), tx(t, "sdl09_o5b", "per upload, or once and reused")],
          ["SDL_GPUCommandBuffer", tx(t, "sdl09_o6", "a list of commands being recorded, sent to the GPU by submit"), tx(t, "sdl09_o6b", "every frame")],
          [tx(t, "sdl09_o7", "render pass, copy pass"), tx(t, "sdl09_o7b", "sections of a command buffer: drawing into textures, or copying data"), tx(t, "sdl09_o7c", "every frame")],
        ]}
      />

      <H2>{tx(t, "sdl09_shaderTitle", "The shader problem")}</H2>
      <p>
        {tx(t, "sdl09_shaderBody",
          "SDL_GPU has no shading language of its own. Each backend accepts its own compiled format, and you hand SDL bytes in that format. When you create the device you say which formats you can provide, and SDL picks a backend that accepts one of them.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl09_s0", "Backend"), tx(t, "sdl09_s1", "Platforms"), tx(t, "sdl09_s2", "Shader format")]}
        rows={[
          ["Vulkan", tx(t, "sdl09_p1", "Windows, Linux, Android, Switch"), "SPIR-V (SDL_GPU_SHADERFORMAT_SPIRV)"],
          ["Direct3D 12", tx(t, "sdl09_p2", "Windows 10+, Xbox"), "DXIL (SDL_GPU_SHADERFORMAT_DXIL)"],
          ["Metal", tx(t, "sdl09_p3", "macOS 10.14+, iOS"), tx(t, "sdl09_p3b", "MSL source or a compiled metallib")],
        ]}
      />
      <p>
        {tx(t, "sdl09_shaderChoice",
          "This chapter takes the shortest road that covers the three desktop systems. The shaders are written in GLSL and compiled to SPIR-V with glslc, the compiler that comes with the Vulkan SDK (Linux packages call it glslc or shaderc): Windows and Linux then run on Vulkan. macOS gets the same two shaders written in Metal's language, MSL, which SDL accepts as source text. The next part of SDL_GPU uses SDL_shadercross to make every format from one source.")}
      </p>

      <H2>{tx(t, "sdl09_projectTitle", "A separate project: sdl3-gpu")}</H2>
      <p>
        {tx(t, "sdl09_projectBody",
          "The game keeps its SDL_Renderer. The triangle gets its own folder, next to sdl3-lab, with the same CMake setup and one new part: a target that compiles the shaders.")}
      </p>
      <CodeBlock lang="text" filename="sdl3-gpu/" t={t}>{`sdl3-gpu/
├── CMakeLists.txt
├── shaders/
│   ├── triangle.vert     GLSL vertex shader   → triangle.vert.spv
│   ├── triangle.frag     GLSL fragment shader → triangle.frag.spv
│   └── triangle.metal    both stages in MSL, for macOS
└── src/
    └── main.cpp`}</CodeBlock>
      <CodeBlock lang="cmake" filename="CMakeLists.txt" t={t}>{`cmake_minimum_required(VERSION 3.24)
project(SDL3Gpu LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(SDL3
    GIT_REPOSITORY https://github.com/libsdl-org/SDL.git
    GIT_TAG        release-3.4.18
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(SDL3)

add_executable(triangle src/main.cpp)
target_link_libraries(triangle PRIVATE SDL3::SDL3)

if (WIN32)
    add_custom_command(TARGET triangle POST_BUILD
        COMMAND \${CMAKE_COMMAND} -E copy_if_different
                $<TARGET_FILE:SDL3::SDL3> $<TARGET_FILE_DIR:triangle>)
endif()

# The shaders, into a shaders/ folder next to the executable, on every build
set(OUT $<TARGET_FILE_DIR:triangle>/shaders)
if (APPLE)
    add_custom_target(shaders ALL
        COMMAND \${CMAKE_COMMAND} -E make_directory \${OUT}
        COMMAND \${CMAKE_COMMAND} -E copy_if_different
                \${CMAKE_SOURCE_DIR}/shaders/triangle.metal \${OUT})
else()
    find_program(GLSLC glslc HINTS $ENV{VULKAN_SDK}/bin REQUIRED)
    add_custom_target(shaders ALL
        COMMAND \${CMAKE_COMMAND} -E make_directory \${OUT}
        COMMAND \${GLSLC} \${CMAKE_SOURCE_DIR}/shaders/triangle.vert -o \${OUT}/triangle.vert.spv
        COMMAND \${GLSLC} \${CMAKE_SOURCE_DIR}/shaders/triangle.frag -o \${OUT}/triangle.frag.spv)
endif()
add_dependencies(triangle shaders)`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl09_ch0", "Line"), tx(t, "sdl09_ch1", "What it does")]}
        rows={[
          ["$<TARGET_FILE_DIR:triangle>/shaders", tx(t, "sdl09_c1", "The folder next to triangle.exe (or triangle), wherever the generator puts it: build/ or build/Debug/. The program finds it with SDL_GetBasePath.")],
          ["add_custom_target(shaders ALL …)", tx(t, "sdl09_c2", "A build step with no output file, so it runs on every build. Compiling two tiny shaders takes a fraction of a second, and an edited shader is never forgotten.")],
          ["find_program(GLSLC glslc …)", tx(t, "sdl09_c3", "Looks for glslc on the PATH and in the Vulkan SDK's bin folder (the installer sets VULKAN_SDK). REQUIRED stops the configure with a clear message if it is missing.")],
          ["add_dependencies(triangle shaders)", tx(t, "sdl09_c4", "Building only the triangle target (as an IDE does before running it) also builds the shaders.")],
        ]}
      />
      <p>
        {tx(t, "sdl09_glslBody",
          "The vertex shader receives each corner's position and colour, passes the colour on and outputs the position. The fragment shader receives the colour, blended between the three corners by the GPU, and writes it. The layout(location = …) numbers are what the pipeline's vertex layout will refer to.")}
      </p>
      <CodeBlock lang="glsl" filename="shaders/triangle.vert" t={t}>{`#version 450
layout(location = 0) in vec2 inPos;      // vertex attribute 0
layout(location = 1) in vec3 inColor;    // vertex attribute 1
layout(location = 0) out vec3 vColor;    // to the fragment shader

void main() {
    vColor = inColor;
    gl_Position = vec4(inPos, 0.0, 1.0);
}`}</CodeBlock>
      <CodeBlock lang="glsl" filename="shaders/triangle.frag" t={t}>{`#version 450
layout(location = 0) in vec3 vColor;     // interpolated between the corners
layout(location = 0) out vec4 outColor;  // colour target 0: the window

void main() {
    outColor = vec4(vColor, 1.0);
}`}</CodeBlock>
      <CodeBlock lang="cpp" filename="shaders/triangle.metal" t={t}>{`#include <metal_stdlib>
using namespace metal;

struct VertexIn  { float2 pos [[attribute(0)]]; float3 color [[attribute(1)]]; };
struct VertexOut { float4 pos [[position]];     float3 color; };

vertex VertexOut vs_main(VertexIn in [[stage_in]]) {
    VertexOut out;
    out.pos   = float4(in.pos, 0.0, 1.0);
    out.color = in.color;
    return out;
}

fragment float4 fs_main(VertexOut in [[stage_in]]) {
    return float4(in.color, 1.0);
}`}</CodeBlock>
      <Callout type="info" t={t}>
        {tx(t, "sdl09_layoutNote",
          "These shaders use no textures and no uniform data. Once they do, SDL_GPU requires a fixed layout: in SPIR-V, vertex-shader textures and buffers go in descriptor set 0 and its uniform buffers in set 1, fragment-shader ones in sets 2 and 3. The counts you pass in SDL_GPUShaderCreateInfo must match the shader. Getting this wrong is the most common reason a shader \"does nothing\".")}
      </Callout>

      <H2>{tx(t, "sdl09_deviceTitle", "The device and the window")}</H2>
      <CodeBlock lang="cpp" filename="device.cpp" t={t}>{`SDL_GPUDevice* device = SDL_CreateGPUDevice(
    SDL_GPU_SHADERFORMAT_SPIRV | SDL_GPU_SHADERFORMAT_MSL,   // what we ship
    true,                                                    // debug mode
    nullptr);                                                // any backend that fits
SDL_Log("GPU backend: %s", SDL_GetGPUDeviceDriver(device));  // "vulkan" or "metal"
SDL_ClaimWindowForGPUDevice(device, window);                 // the window gets a swapchain`}</CodeBlock>
      <p>
        {tx(t, "sdl09_deviceBody",
          "Debug mode turns on SDL's own checks (the messages in the figure below) and the backend's validation layer if it is installed: on Windows the Vulkan SDK provides it. It costs some speed; turn it off in release builds. Claiming the window creates its swapchain, the textures the window shows in turn.")}
      </p>

      <H2>{tx(t, "sdl09_pipeTitle", "The pipeline and the vertex layout")}</H2>
      <p>
        {tx(t, "sdl09_pipeBody",
          "Each corner is a Vertex: two floats of position, then three of colour. The pipeline must be told how those bytes are laid out, because the GPU sees only a buffer of bytes. A vertex buffer description gives the size of one vertex (pitch); each attribute gives its shader location, its type and where it starts inside a vertex (offset):")}
      </p>
      <Equation label={tx(t, "sdl09_eqLayout", "Where attribute a of vertex i starts")}
        where={[
          [r`\text{addr}`, tx(t, "sdl09_wAddr", "the byte in the vertex buffer where the attribute's first float is")],
          [r`i`, tx(t, "sdl09_wI", "the vertex number: 0, 1, 2")],
          [r`\text{pitch}`, tx(t, "sdl09_wPitch", "bytes per vertex: sizeof(Vertex) = 5 floats × 4 = 20")],
          [r`\text{offset}_a`, tx(t, "sdl09_wOffset", "where the attribute starts inside a vertex: 0 for the position, 8 for the colour (after two floats)")],
        ]}>
        {r`\text{addr} = i \cdot \text{pitch} + \text{offset}_a, \qquad \text{vertex 2's colour: } 2 \cdot 20 + 8 = 48`}
      </Equation>
      <p>
        {tx(t, "sdl09_pipeBody2",
          "The pipeline also needs the format of the texture it will draw into. That is the swapchain's, which only the device knows: SDL_GetGPUSwapchainTextureFormat. Everything left at zero in the create-info structs is a sensible default: filled triangles, no culling, no multisampling, no depth test, no blending.")}
      </p>

      <H2>{tx(t, "sdl09_ndcTitle", "Where the corners land")}</H2>
      <p>
        {tx(t, "sdl09_ndcBody",
          "The position the vertex shader outputs is in normalized device coordinates (NDC): x from −1 at the left edge to +1 at the right, y from −1 at the bottom to +1 at the top, whatever the window's size. SDL_GPU uses this convention on every backend; Vulkan's own NDC has y pointing down, and SDL flips it for you. The window's pixels count y downwards from the top:")}
      </p>
      <Equation label={tx(t, "sdl09_eqNdc", "NDC to window pixels")}
        where={[
          [r`x_{\text{px}},\ y_{\text{px}}`, tx(t, "sdl09_wPx", "the pixel position, from the top-left corner")],
          [r`x,\ y`, tx(t, "sdl09_wNdc", "the NDC position the vertex shader wrote")],
          [r`W,\ H`, tx(t, "sdl09_wWH", "the swapchain texture's size in pixels: 960 × 540 here")],
          [r`1 - y`, tx(t, "sdl09_wFlip", "turns \"up is +1\" into \"down from the top\"")],
        ]}>
        {r`x_{\text{px}} = \frac{x + 1}{2}\, W, \qquad y_{\text{px}} = \frac{1 - y}{2}\, H`}
      </Equation>
      <p>
        {tx(t, "sdl09_ndcExample",
          "The top corner, (0, 0.6), lands at x = 0.5 × 960 = 480 and y = 0.2 × 540 = 108. The bottom-right one, (0.6, −0.5), at (768, 405). When the window is resized the triangle stretches with it, because NDC always spans the whole target.")}
      </p>

      <H2>{tx(t, "sdl09_uploadTitle", "Getting the vertices onto the GPU")}</H2>
      <p>
        {tx(t, "sdl09_uploadBody",
          "A GPU buffer lives in the graphics card's memory, where the CPU cannot write. The data goes in two hops: the CPU writes it into a transfer buffer (map, copy, unmap), and a copy pass in a command buffer tells the GPU to copy it into the real buffer. The three vertices are 3 × 20 = 60 bytes. They never change, so the project uploads them once in SDL_AppInit and releases the transfer buffer right after submitting: SDL keeps it alive until the GPU has finished the copy.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "sdl09_vulkanStaging",
          "This is the staging upload of the Vulkan track, without the memory types, barriers and fence it needs there. SDL works out those for you from the passes you record.")}
      </Callout>

      <H2>{tx(t, "sdl09_frameTitle", "One frame: record, then submit")}</H2>
      <p>
        {tx(t, "sdl09_frameBody",
          "Every frame acquires a command buffer and the window's next swapchain texture, begins a render pass that clears that texture, binds the pipeline and the vertex buffer, draws three vertices, ends the pass and submits. Only submit sends anything to the GPU. The calls in between return at once: they write commands into the buffer. Step through a frame, then untick a line and see what breaks:")}
      </p>

      <GpuFrameFigure t={t} />

      <LessonTable
        headers={[tx(t, "sdl09_fh0", "Call"), tx(t, "sdl09_fh1", "What it does")]}
        rows={[
          ["SDL_WaitAndAcquireGPUSwapchainTexture", tx(t, "sdl09_f1", "Waits until a swapchain texture is free and gives it to this command buffer. It returns true with NULL when the window is minimized: skip the frame, that is not an error.")],
          ["SDL_GPUColorTargetInfo", tx(t, "sdl09_f2", "What the pass draws into, and how: load_op CLEAR fills it with clear_color first, store_op STORE keeps the result.")],
          ["SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0)", tx(t, "sdl09_f3", "3 vertices, 1 instance, starting at vertex 0 and instance 0.")],
          ["SDL_SubmitGPUCommandBuffer", tx(t, "sdl09_f4", "Sends the buffer to the GPU. Because it holds a swapchain texture, the texture is shown in the window when the GPU is done.")],
        ]}
      />

      <H2>{tx(t, "sdl09_cycleTitle", "Frames in flight and the cycle flag")}</H2>
      <p>
        {tx(t, "sdl09_cycleBody",
          "Submit does not wait for the GPU. While the GPU draws frame 1, the CPU is already recording frame 2: two frames are \"in flight\" by default (SDL_SetGPUAllowedFramesInFlight accepts 1 to 3). After that many, the swapchain acquire waits. This overlap is where the speed comes from, and also a trap: a buffer that frame 1 has not finished reading may already be written for frame 2.")}
      </p>
      <p>
        {tx(t, "sdl09_cycleBody2",
          "Every SDL_GPU call that writes to a resource therefore has a bool cycle. With cycle = true, if the resource is still in use by a submitted command buffer, SDL gives you a fresh piece of memory behind the same handle, and keeps a small ring of them. With cycle = false you write the same memory, which is right when nothing submitted still uses it. The project writes its transfer buffer once, so false is correct there. A program that updates vertices every frame maps its transfer buffer with cycle = true; otherwise some frames draw another frame's data and the motion stutters, with no error.")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl09_yh0", "Where"), tx(t, "sdl09_yh1", "cycle = true means")]}
        rows={[
          ["SDL_MapGPUTransferBuffer(…, cycle)", tx(t, "sdl09_y1", "write into memory no pending copy is reading")],
          ["SDL_UploadToGPUBuffer(…, cycle)", tx(t, "sdl09_y2", "copy into a buffer no pending draw is reading")],
          ["SDL_GPUColorTargetInfo.cycle", tx(t, "sdl09_y3", "render into a texture that the previous frame may still be sampling (not with load_op LOAD: the old contents would be lost)")],
        ]}
      />

      <H2>{tx(t, "sdl09_codeTitle", "The complete program")}</H2>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <cstddef>                       // offsetof
#include <string>

struct Vertex { float x, y; float r, g, b; };

static const Vertex VERTICES[3] = {
    { 0.0f,  0.6f,   1.0f, 0.30f, 0.30f},   // top: red
    { 0.6f, -0.5f,   0.3f, 1.00f, 0.40f},   // bottom right: green
    {-0.6f, -0.5f,   0.3f, 0.50f, 1.00f},   // bottom left: blue
};

struct AppState {
    SDL_Window*              window       = nullptr;
    SDL_GPUDevice*           device       = nullptr;
    SDL_GPUGraphicsPipeline* pipeline     = nullptr;
    SDL_GPUBuffer*           vertexBuffer = nullptr;
};

// Loads shaders/<name>.vert.spv / .frag.spv, or the .metal file on macOS
static SDL_GPUShader* loadShader(SDL_GPUDevice* device, const char* name, SDL_GPUShaderStage stage) {
    const bool vertex = stage == SDL_GPU_SHADERSTAGE_VERTEX;
    const SDL_GPUShaderFormat formats = SDL_GetGPUShaderFormats(device);
    std::string file = std::string("shaders/") + name;
    SDL_GPUShaderCreateInfo info{};
    if (formats & SDL_GPU_SHADERFORMAT_SPIRV) {
        file += vertex ? ".vert.spv" : ".frag.spv";
        info.format     = SDL_GPU_SHADERFORMAT_SPIRV;
        info.entrypoint = "main";
    } else if (formats & SDL_GPU_SHADERFORMAT_MSL) {
        file += ".metal";
        info.format     = SDL_GPU_SHADERFORMAT_MSL;
        info.entrypoint = vertex ? "vs_main" : "fs_main";
    } else {
        SDL_SetError("this device takes no shader format we ship");
        return nullptr;
    }
    const char* base = SDL_GetBasePath();
    const std::string path = std::string(base ? base : "") + file;
    size_t size = 0;
    void* code = SDL_LoadFile(path.c_str(), &size);
    if (!code) return nullptr;                      // SDL_GetError names the file

    info.code      = static_cast<const Uint8*>(code);
    info.code_size = size;
    info.stage     = stage;                         // no samplers, textures or uniforms: counts stay 0
    SDL_GPUShader* shader = SDL_CreateGPUShader(device, &info);
    SDL_free(code);                                 // SDL has its own copy now
    return shader;
}

// Copies the vertices into a new GPU buffer, through a transfer buffer
static SDL_GPUBuffer* uploadVertices(SDL_GPUDevice* device) {
    SDL_GPUBufferCreateInfo bufInfo{};
    bufInfo.usage = SDL_GPU_BUFFERUSAGE_VERTEX;
    bufInfo.size  = sizeof(VERTICES);                               // 60 bytes
    SDL_GPUBuffer* buffer = SDL_CreateGPUBuffer(device, &bufInfo);

    SDL_GPUTransferBufferCreateInfo tbInfo{};
    tbInfo.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
    tbInfo.size  = sizeof(VERTICES);
    SDL_GPUTransferBuffer* staging = SDL_CreateGPUTransferBuffer(device, &tbInfo);
    if (!buffer || !staging) return nullptr;

    void* mapped = SDL_MapGPUTransferBuffer(device, staging, false);  // written once: no cycling
    SDL_memcpy(mapped, VERTICES, sizeof(VERTICES));
    SDL_UnmapGPUTransferBuffer(device, staging);

    SDL_GPUCommandBuffer* cmd  = SDL_AcquireGPUCommandBuffer(device);
    SDL_GPUCopyPass*      copy = SDL_BeginGPUCopyPass(cmd);
    const SDL_GPUTransferBufferLocation src{staging, 0};
    const SDL_GPUBufferRegion           dst{buffer, 0, sizeof(VERTICES)};
    SDL_UploadToGPUBuffer(copy, &src, &dst, false);
    SDL_EndGPUCopyPass(copy);
    SDL_SubmitGPUCommandBuffer(cmd);
    SDL_ReleaseGPUTransferBuffer(device, staging);  // freed once the copy is done
    return buffer;
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    SDL_SetAppMetadata("SDL3 GPU Triangle", "0.1", "com.example.sdl3gpu");
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    auto* app = new AppState{};
    *appstate = app;

    app->window = SDL_CreateWindow("SDL3 GPU Triangle", 960, 540, SDL_WINDOW_RESIZABLE);
    app->device = SDL_CreateGPUDevice(SDL_GPU_SHADERFORMAT_SPIRV | SDL_GPU_SHADERFORMAT_MSL, true, nullptr);
    if (!app->window || !app->device || !SDL_ClaimWindowForGPUDevice(app->device, app->window)) {
        SDL_Log("GPU setup failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    SDL_Log("GPU backend: %s", SDL_GetGPUDeviceDriver(app->device));

    SDL_GPUShader* vs = loadShader(app->device, "triangle", SDL_GPU_SHADERSTAGE_VERTEX);
    SDL_GPUShader* fs = loadShader(app->device, "triangle", SDL_GPU_SHADERSTAGE_FRAGMENT);
    if (!vs || !fs) {
        SDL_Log("shader failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    // How the bytes of one Vertex reach the shader's inputs
    SDL_GPUVertexBufferDescription vbDesc{};
    vbDesc.slot       = 0;
    vbDesc.pitch      = sizeof(Vertex);                              // 20
    vbDesc.input_rate = SDL_GPU_VERTEXINPUTRATE_VERTEX;
    SDL_GPUVertexAttribute attrs[2]{};
    attrs[0] = {0, 0, SDL_GPU_VERTEXELEMENTFORMAT_FLOAT2, offsetof(Vertex, x)};   // location 0: 0
    attrs[1] = {1, 0, SDL_GPU_VERTEXELEMENTFORMAT_FLOAT3, offsetof(Vertex, r)};   // location 1: 8

    SDL_GPUColorTargetDescription target{};
    target.format = SDL_GetGPUSwapchainTextureFormat(app->device, app->window);

    SDL_GPUGraphicsPipelineCreateInfo pipe{};
    pipe.vertex_shader   = vs;
    pipe.fragment_shader = fs;
    pipe.vertex_input_state.vertex_buffer_descriptions = &vbDesc;
    pipe.vertex_input_state.num_vertex_buffers         = 1;
    pipe.vertex_input_state.vertex_attributes          = attrs;
    pipe.vertex_input_state.num_vertex_attributes      = 2;
    pipe.primitive_type = SDL_GPU_PRIMITIVETYPE_TRIANGLELIST;
    pipe.target_info.color_target_descriptions = &target;
    pipe.target_info.num_color_targets         = 1;
    app->pipeline = SDL_CreateGPUGraphicsPipeline(app->device, &pipe);
    SDL_ReleaseGPUShader(app->device, vs);          // the pipeline keeps what it needs
    SDL_ReleaseGPUShader(app->device, fs);
    if (!app->pipeline) {
        SDL_Log("pipeline failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }

    app->vertexBuffer = uploadVertices(app->device);
    if (!app->vertexBuffer) {
        SDL_Log("upload failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) return SDL_APP_SUCCESS;
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    auto* app = static_cast<AppState*>(appstate);

    SDL_GPUCommandBuffer* cmd = SDL_AcquireGPUCommandBuffer(app->device);
    if (!cmd) {
        SDL_Log("AcquireGPUCommandBuffer failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    SDL_GPUTexture* swapchain = nullptr;
    if (!SDL_WaitAndAcquireGPUSwapchainTexture(cmd, app->window, &swapchain, nullptr, nullptr)) {
        SDL_Log("WaitAndAcquireGPUSwapchainTexture failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    if (!swapchain) {                               // minimized: nothing to draw into
        SDL_SubmitGPUCommandBuffer(cmd);
        return SDL_APP_CONTINUE;
    }

    SDL_GPUColorTargetInfo color{};
    color.texture     = swapchain;
    color.clear_color = {16 / 255.0f, 18 / 255.0f, 26 / 255.0f, 1.0f};   // the game's background
    color.load_op     = SDL_GPU_LOADOP_CLEAR;
    color.store_op    = SDL_GPU_STOREOP_STORE;

    SDL_GPURenderPass* pass = SDL_BeginGPURenderPass(cmd, &color, 1, nullptr);
    SDL_BindGPUGraphicsPipeline(pass, app->pipeline);
    const SDL_GPUBufferBinding binding{app->vertexBuffer, 0};
    SDL_BindGPUVertexBuffers(pass, 0, &binding, 1);
    SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);
    SDL_EndGPURenderPass(pass);

    SDL_SubmitGPUCommandBuffer(cmd);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        if (app->device) {
            SDL_ReleaseGPUBuffer(app->device, app->vertexBuffer);
            SDL_ReleaseGPUGraphicsPipeline(app->device, app->pipeline);
            SDL_ReleaseWindowFromGPUDevice(app->device, app->window);
            SDL_DestroyGPUDevice(app->device);
        }
        SDL_DestroyWindow(app->window);
        delete app;
    }
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl09_lh0", "Code"), tx(t, "sdl09_lh1", "What it does")]}
        rows={[
          ["SDL_GetGPUShaderFormats", tx(t, "sdl09_l1", "The formats the chosen backend accepts. The device was asked for SPIR-V or MSL, so one of the two is there.")],
          ["SDL_LoadFile", tx(t, "sdl09_l2", "Reads a whole file into memory, freed with SDL_free. The path is built from SDL_GetBasePath, like the game's assets.")],
          ["info.entrypoint", tx(t, "sdl09_l3", "The function to run: main for the GLSL files, vs_main and fs_main inside the one Metal file.")],
          ["offsetof(Vertex, r)", tx(t, "sdl09_l4", "The byte where the colour starts inside a Vertex, worked out by the compiler: 8. Safer than typing the number.")],
          ["SDL_GetGPUSwapchainTextureFormat", tx(t, "sdl09_l5", "The window's pixel format, often B8G8R8A8_UNORM. The pipeline must match the texture it draws into.")],
          ["SDL_ReleaseGPUShader", tx(t, "sdl09_l6", "Shaders are only needed to build the pipeline. Release functions never free something the GPU still uses; SDL waits for that.")],
          ["clear_color = {16 / 255.0f, …}", tx(t, "sdl09_l7", "SDL_GPU colours are floats from 0 to 1, so the game's background (16, 18, 26) is divided by 255.")],
          ["if (app->device)", tx(t, "sdl09_l8", "SDL_AppQuit also runs when SDL_AppInit failed half-way; without a device there is nothing to release.")],
          ["SDL_ReleaseWindowFromGPUDevice", tx(t, "sdl09_l9", "Gives the window back (its swapchain is destroyed) before the device and the window go.")],
        ]}
      />
      <p>
        {tx(t, "sdl09_runBody",
          "Build and run. The log prints the backend: vulkan on Windows and Linux, metal on a Mac. The window shows a triangle on the game's dark background, red at the top, green at the bottom right, blue at the bottom left, the colours blended across its surface. Resize the window: the triangle stretches with it.")}
      </p>

      <H2>{tx(t, "sdl09_renderStateTitle", "New in 3.4: your shaders in the 2D renderer")}</H2>
      <p>
        {tx(t, "sdl09_renderStateBody",
          "SDL 3.4 lets SDL_Renderer itself draw with your fragment shader, so the game could get a special effect without leaving the renderer. Ask for the GPU-based renderer by name, take its device, create a shader for it, wrap it in an SDL_GPURenderState, and switch it on around the draws it should affect:")}
      </p>
      <CodeBlock lang="cpp" filename="render_state.cpp" t={t}>{`SDL_Renderer*  renderer = SDL_CreateRenderer(window, SDL_GPU_RENDERER);   // "gpu"
SDL_GPUDevice* device   = SDL_GetGPURendererDevice(renderer);

SDL_GPUShaderCreateInfo info{};               // code, size, format chosen as in loadShader
info.stage               = SDL_GPU_SHADERSTAGE_FRAGMENT;
info.num_samplers        = 1;                 // the texture being drawn
info.num_uniform_buffers = 1;                 // our own parameters
SDL_GPUShader* flashShader = SDL_CreateGPUShader(device, &info);

SDL_GPURenderStateCreateInfo stateInfo{};
stateInfo.fragment_shader = flashShader;
SDL_GPURenderState* flash = SDL_CreateGPURenderState(renderer, &stateInfo);

// every frame: the character drawn white for a moment after a pickup
const float amount = app->flashTime / 0.1f;   // 1 → 0 over a tenth of a second
SDL_SetGPURenderStateFragmentUniforms(flash, 0, &amount, sizeof amount);
SDL_SetGPURenderState(renderer, flash);
SDL_RenderTextureRotated(renderer, hero, &src, &dst, 0.0, nullptr, flip);
SDL_SetGPURenderState(renderer, nullptr);     // back to SDL's own shaders`}</CodeBlock>
      <CodeBlock lang="glsl" filename="flash.frag" t={t}>{`#version 450
layout(location = 0) in vec4 v_color;                      // SDL's inputs: colour (mod) ...
layout(location = 1) in vec2 v_uv;                         // ... and texture coordinate
layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D u_texture;  // fragment textures: set 2
layout(set = 3, binding = 0) uniform Flash { float amount; };   // fragment uniforms: set 3

void main() {
    vec4 c = texture(u_texture, v_uv) * v_color;
    o_color = vec4(mix(c.rgb, vec3(1.0), amount), c.a);    // towards white, keeping alpha
}`}</CodeBlock>
      <p>
        {tx(t, "sdl09_renderStateBody2",
          "mix(a, b, k) is a + (b − a) · k: amount 0 leaves the sprite as it is, 1 makes every visible pixel white, and the alpha is kept so the transparent corners stay transparent. The render state only works with the gpu renderer, and the shader must be in a format its device accepts, so the same SPIR-V and MSL question applies.")}
      </p>

      <H2>{tx(t, "sdl09_whenTitle", "When to choose it")}</H2>
      <LessonTable
        headers={[tx(t, "sdl09_w0", "You want to"), tx(t, "sdl09_w1", "Use")]}
        rows={[
          [tx(t, "sdl09_w2", "Ship a 2D game"), "SDL_Renderer"],
          [tx(t, "sdl09_w2b", "A 2D game with a few custom effects"), tx(t, "sdl09_w2c", "SDL_Renderer with SDL_GPURenderState")],
          [tx(t, "sdl09_w3", "Learn graphics programming concepts"), tx(t, "sdl09_w3b", "OpenGL first: a simpler model and far more material")],
          [tx(t, "sdl09_w4", "Your own renderer, 2D or 3D, on desktop, consoles and phones"), "SDL_GPU"],
          [tx(t, "sdl09_w5", "Control memory, synchronization and extensions yourself"), tx(t, "sdl09_w5b", "Vulkan directly")],
        ]}
      />

      <H2>{tx(t, "sdl09_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl09_eh0", "Symptom"), tx(t, "sdl09_eh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl09_e1", "Configure: Could not find GLSLC"), tx(t, "sdl09_e1b", "glslc is not installed or not on the PATH. Install the Vulkan SDK (Windows) or the shaderc / glslc package (Linux), then configure again.")],
          [tx(t, "sdl09_e2", "SDL_CreateGPUDevice: No supported SDL_GPU backend found!"), tx(t, "sdl09_e2b", "no backend accepts the formats you listed, or the driver is too old (Vulkan 1.0 with some extensions is needed). Update the graphics driver.")],
          [tx(t, "sdl09_e3", "Couldn't open …/shaders/triangle.vert.spv"), tx(t, "sdl09_e3b", "the shaders target did not run, or the program was started from a copy elsewhere. Build the whole project.")],
          [tx(t, "sdl09_e4", "Black window, no error"), tx(t, "sdl09_e4b", "the submit is missing, or the triangle is outside −1…1. Check the frame code against the figure.")],
          [tx(t, "sdl09_e5", "Graphics pipeline not bound!"), tx(t, "sdl09_e5b", "a draw without SDL_BindGPUGraphicsPipeline in the same render pass: every pass starts with nothing bound.")],
          [tx(t, "sdl09_e6", "Colours wrong or the triangle torn apart"), tx(t, "sdl09_e6b", "pitch or offsets do not match the Vertex struct. Use sizeof and offsetof instead of numbers.")],
          [tx(t, "sdl09_e7", "Pipeline creation fails after adding a texture or uniform"), tx(t, "sdl09_e7b", "the counts in SDL_GPUShaderCreateInfo or the descriptor sets do not follow SDL_GPU's layout (sets 0–3).")],
        ]}
      />

      <KeyIdeas t={t} id="sdl09" items={[
        "SDL_GPU is one modern API over Vulkan, Direct3D 12 and Metal; SDL takes care of memory, synchronization and swapchains.",
        "Each backend takes its own shader format; you list the formats you ship and SDL picks a backend that accepts one.",
        "A graphics pipeline fixes shaders, vertex layout, primitive type and target format in advance.",
        "An attribute of vertex i starts at i × pitch + offset; use sizeof and offsetof to get them right.",
        "Vertices reach a GPU buffer in two hops: a mapped transfer buffer, then a copy pass.",
        "Commands are only recorded until submit; the window shows the frame when the GPU has run it.",
        "A NULL swapchain texture means a minimized window: submit and skip the frame.",
        "With frames in flight, data written every frame needs cycle = true, or frames draw each other's data.",
        "Since 3.4, SDL_GPURenderState puts your own fragment shader into SDL_Renderer's draws.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "audio", title: tx(t, "sdl09_rel1", "Audio Streams"), why: tx(t, "sdl09_rel1b", "the previous chapter of the game project, which continues in the next one.") },
        { track: "OpenGL", id: "triangle", title: tx(t, "sdl09_rel2", "OpenGL: Drawing the Triangle"), why: tx(t, "sdl09_rel2b", "the same triangle with the concepts explained slowly: vertex data, shaders, the pipeline.") },
        { track: "Vulkan", id: "frames-in-flight", title: tx(t, "sdl09_rel3", "Vulkan: Frames in Flight & Resizing"), why: tx(t, "sdl09_rel3b", "what the cycle flag automates: a figure of the CPU writing what the GPU is still reading.") },
        { track: "Vulkan", id: "staging", title: tx(t, "sdl09_rel4", "Vulkan: Staging Buffers & Transfers"), why: tx(t, "sdl09_rel4b", "the transfer-buffer upload with everything SDL does for you written out.") },
      ]} />
    </Article>
  );
}

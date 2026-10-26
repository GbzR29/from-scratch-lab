"use client";

// GLSL track — "Debugging Shaders": compile logs and #line, values as colours
// (split screen, range check), cutting a shader in half, a pixel probe, the
// results the spec leaves undefined (asked of the reader's GPU), NaN, and the
// tools that step through a shader.

import type { TrackTranslations } from "@/lib/tracks/types";
import { tx } from "@/lib/tracks/tx";
import { CodeBlock, Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { KeyIdeas, Goals } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { ShaderPlayground } from "@/components/lesson/glsl/ShaderPlayground";
import { GpuQuirksFigure } from "@/components/lesson/glsl/GpuQuirksFigure";
import { DEBUG_PRESETS } from "../presets/debugging";

const VIEWS = DEBUG_PRESETS.filter(p => p.id === "views");
const BUG = DEBUG_PRESETS.filter(p => p.id === "bug");

export function DebuggingContent({ t }: { t: TrackTranslations }) {
  return (
    <article className="space-y-5 text-[var(--text-muted)] leading-relaxed text-base">

      <p className="text-lg text-[var(--text-main)]">
        {tx(t, "glslDbg_intro",
          "A shader that does not compile at least says where it fails. A shader that compiles and draws the wrong thing says nothing. It has no printf and no breakpoints in the browser, and it runs as millions of copies at once. Debugging it is a craft of its own: read the compiler's log well, turn the values you doubt into colours, cut the problem in half until it has nowhere to hide, and know which operations have no defined result.")}
      </p>

      <Goals t={t} id="glslDbg" items={[
        "Read a compile log and find the line it means, even when code was added in front of yours.",
        "Turn any value into a colour that shows at a glance whether it is right.",
        "Find a bug by cutting the shader in half, and read one pixel's value as a number.",
        "Recognise the operations whose result is undefined, and guard them.",
        "Choose a tool that can step through a shader on your platform.",
      ]} />

      {/* ── compile errors ── */}
      <H2>{tx(t, "glslDbg_compileTitle", "Reading the compile log")}</H2>
      <p>
        {tx(t, "glslDbg_compileBody1",
          "glGetShaderInfoLog returns the compiler's messages as text. Its format is not standardised, but most drivers start each message with the source string and the line. These are real messages from the compiler in Chrome and Edge (ANGLE):")}
      </p>
      <CodeBlock lang="text" filename="info_log.txt" t={t}>{`ERROR: 0:6: 'col' : undeclared identifier
ERROR: 0:6: 'constructor' : not enough data provided for construction
         │ │
         │ └─ line 6
         └─── source string 0 (glShaderSource can take several strings)`}</CodeBlock>
      <p>
        {tx(t, "glslDbg_compileBody2",
          "Fix the first message first. Later messages are often consequences of it: above, vec4(col, 1.0) fails only because col does not exist. And a syntax error is reported where the parser noticed it, which is often the line after the mistake. A missing semicolon at the end of line 6 shows up as \"'o' : syntax error\" on line 7, at the first word that cannot continue the statement.")}
      </p>
      <LessonTable
        headers={[tx(t, "glslDbg_eH0", "Code"), tx(t, "glslDbg_eH1", "Message (ANGLE)"), tx(t, "glslDbg_eH2", "What it means")]}
        rows={[
          ["float x = 1;", "cannot convert from 'const int' to 'highp float'", tx(t, "glslDbg_e1", "GLSL ES never converts int to float by itself (desktop GLSL does since 1.20). Write 1.0.")],
          ["float x = 0.5 * i;", "wrong operand types - no operation '*' exists that takes a left-hand operand of type 'const float' and a right operand of type 'highp int'", tx(t, "glslDbg_e2", "the same rule for operators: write 0.5 * float(i).")],
          ["vec3 c = vec4(1.0);", "dimension mismatch", tx(t, "glslDbg_e3", "a vec4 does not fit a vec3: take .rgb or .xyz.")],
          [tx(t, "glslDbg_e4a", "a missing ;"), "'o' : syntax error", tx(t, "glslDbg_e4", "reported on the next line, at the first word that cannot follow.")],
          ["vec4(col, 1.0)", "undeclared identifier", tx(t, "glslDbg_e5", "a typo, a variable declared inside a block that has ended, or one the stage does not have.")],
        ]}
      />
      <H3>{tx(t, "glslDbg_lineTitle", "When the line numbers do not match")}</H3>
      <p>
        {tx(t, "glslDbg_lineBody",
          "Programs often put code in front of the shader before compiling it: a #version line, a list of #defines, a shared library of functions. Every line added shifts the numbers in the log, and \"line 47\" no longer means line 47 of your file. The #line directive fixes that: #line n says that the next line is line n. Put #line 1 right before your own code, and the log counts from your first line again. (The playground in this track gets the same result the other way round: it counts the lines of its prelude and subtracts them from every number in the log.)")}
      </p>
      <CodeBlock lang="cpp" filename="build_source.cpp" t={t}>{`std::string src = "#version 330 core\\n"
                + defines                  // "#define SHADOWS 1\\n#define LIGHTS 4\\n"
                + commonLib                // shared functions, many lines
                + "#line 1\\n"             // the log now counts from the next line
                + readFile("lit.frag");`}</CodeBlock>
      <H3>{tx(t, "glslDbg_offlineTitle", "Compile before you run")}</H3>
      <p>
        {tx(t, "glslDbg_offlineBody",
          "Each driver has its own GLSL compiler, and some accept code the specification forbids. A shader can then work on your computer and fail to compile on someone else's. The Khronos reference compiler is strict and runs without a GPU, so you can check every shader as part of your build: glslangValidator lit.frag prints the errors (the stage comes from the file extension: .vert, .frag, .comp), and for Vulkan, glslc compiles to SPIR-V (see Versions & Dialects).")}
      </p>

      {/* ── values as colours ── */}
      <H2>{tx(t, "glslDbg_colorTitle", "Values as colours")}</H2>
      <p>
        {tx(t, "glslDbg_colorBody",
          "There is no printf on the GPU, but there is a screen with millions of pixels. The universal technique is to output the value you doubt as a colour. Write FragColor = vec4(vec3(x), 1.0) for a scalar, or vec4(v * 0.5 + 0.5, 1.0) for a direction in [−1, 1]. Then check that it looks the way you expect: black where it should be 0, white where 1, a smooth ramp where it should be continuous. Out-of-range values clip to black and white, so use fract(x) to see large values as bands.")}
      </p>
      <CodeBlock lang="glsl" filename="debug_views.glsl" t={t}>{`FragColor = vec4(vec3(d), 1.0);                   // a scalar
FragColor = vec4(normal * 0.5 + 0.5, 1.0);        // a direction
FragColor = vec4(fract(worldPos), 1.0);           // large coordinates as repeating bands
FragColor = vec4(d < 0.0 ? vec3(1, 0, 0) : vec3(0, 0, 1), 1.0);  // a sign
FragColor = vec4(any(isnan(c)) ? vec3(1, 0, 1) : vec3(0), 1.0);  // NaN hunting`}</CodeBlock>
      <p>{tx(t, "glslDbg_colorSteps", "Why * 0.5 + 0.5 for directions: a unit normal's components run −1..1, but a colour channel can only show 0..1, so everything negative would be black. Halving and shifting maps −1 → 0, 0 → 0.5 and 1 → 1. A normal pointing straight up, (0, 1, 0), shows as (0.5, 1, 0.5), light green; one pointing at the camera along +Z shows as (0.5, 0.5, 1), the lavender colour of every normal map. With fract(worldPos), a position of 3.25 shows as 0.25: each whole unit becomes one band, so you can count units on screen.")}</p>
      <p>
        {tx(t, "glslDbg_splitBody",
          "Two habits make these views far more useful. Show the debug view on one side of the screen and the real image on the other, split at the mouse, so you can see which part of the picture each value belongs to. And for a final colour, do not look at it: test it. A range check paints every pixel below 0 blue, above 1 red and NaN magenta, and everything that is fine grey, so a problem of one pixel cannot hide in a busy image.")}
      </p>
      <ShaderPlayground presets={VIEWS} t={t} id="glslDbg" />

      {/* ── bisect ── */}
      <H2>{tx(t, "glslDbg_bisectTitle", "Cutting the problem in half")}</H2>
      <p>
        {tx(t, "glslDbg_bisectBody",
          "When you have no idea where the bug is, halve the space it can be in, again and again. Each step takes one edit and one look, so even a long shader takes only a few steps:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslDbg_bH0", "Step"), tx(t, "glslDbg_bH1", "If it is still wrong"), tx(t, "glslDbg_bH2", "If it is right")]}
        rows={[
          [tx(t, "glslDbg_b1", "Write a constant colour on the first line of main and return."), tx(t, "glslDbg_b1b", "the shader is not the problem: geometry, blending, depth test, or the wrong program bound (see Debugging OpenGL)"), tx(t, "glslDbg_b1c", "the bug is in the shader; go on")],
          [tx(t, "glslDbg_b2", "Replace a uniform or texture you doubt with the value it should have."), tx(t, "glslDbg_b2b", "the bug is in the shader's own maths"), tx(t, "glslDbg_b2c", "the bug is on the CPU side: wrong location, glUniform1i for a float, a uniform the compiler removed")],
          [tx(t, "glslDbg_b3", "Output an intermediate value halfway down main and return."), tx(t, "glslDbg_b3b", "the bug is above that line: move the early return up"), tx(t, "glslDbg_b3c", "the bug is below it: move the return down")],
        ]}
      />
      <p>
        {tx(t, "glslDbg_probeBody",
          "Sometimes a colour is not precise enough: you need to know whether a value is 0.5 or 0.503. Then pick one pixel and read its value as a number. Render to a 32-bit float target, write the value you want only for that pixel, and read it back with glReadPixels. That is a printf for one pixel, and it is how the figure in the next section gets its numbers.")}
      </p>
      <CodeBlock lang="glsl" filename="pixel_probe.frag" t={t}>{`// Early return: everything below this line is not run
FragColor = vec4(vec3(ndl), 1.0); return;

// Pixel probe: write the exact numbers for pixel (200, 100) only.
// Render into a GL_RGBA32F texture, then on the CPU:
// glReadPixels(200, 100, 1, 1, GL_RGBA, GL_FLOAT, out);
if (ivec2(gl_FragCoord.xy) == ivec2(200, 100)) {
    FragColor = vec4(ndl, spec, length(N), 1.0);
    return;
}`}</CodeBlock>

      {/* ── undefined results ── */}
      <H2>{tx(t, "glslDbg_undefTitle", "Bugs that compile: undefined results")}</H2>
      <p>
        {tx(t, "glslDbg_undefBody1",
          "The specification lists, function by function, inputs for which the result is undefined: sqrt of a negative number, pow of a negative base, acos of a value above 1, and more. Undefined does not mean an error. The GPU returns something, often NaN (not a number), sometimes a plain number, and different GPUs return different things. The figure runs each case as a real shader on your GPU and reads the result back:")}
      </p>
      <GpuQuirksFigure t={t} />
      <p>
        {tx(t, "glslDbg_nanBody",
          "NaN is the worst of these, because it spreads. Any arithmetic with a NaN gives NaN, so one bad value in a lighting term turns the whole colour into NaN. When the colour is written to a normal 8-bit target, NaN usually becomes 0: black pixels, or a black shape with crisp edges, where the bad input lies. Infinity spreads in a gentler way: it turns into NaN as soon as you compute ∞ − ∞, 0 · ∞ or ∞ / ∞.")}
      </p>
      <ShaderPlayground presets={BUG} t={t} id="glslDbg" />
      <p>
        {tx(t, "glslDbg_bugAnswer",
          "The answer: pow(dot(N, H), uShine). The half vector H points between the light and the viewer. On the side of the ball that faces away from it, dot(N, H) is negative, and pow of a negative base is undefined. GPUs compute pow(x, y) as exp2(y · log2(x)), and log2 of a negative number is NaN. NaN then flows through the sum and the gamma line into the colour, and the 0.12 of ambient light is lost with it. The fix is pow(max(dot(N, H), 0.0), uShine). Every pixel that showed magenta was a pixel where a negative number reached pow.")}
      </p>
      <LessonTable
        headers={[tx(t, "glslDbg_gH0", "Expression"), tx(t, "glslDbg_gH1", "Undefined when"), tx(t, "glslDbg_gH2", "Guarded version")]}
        rows={[
          ["sqrt(x)", "x < 0", "sqrt(max(x, 0.0))"],
          ["pow(x, y)", tx(t, "glslDbg_g2", "x < 0, or x = 0 and y ≤ 0"), "pow(max(x, 0.0), y)"],
          ["log(x), log2(x)", "x ≤ 0", "log(max(x, 1e-30))"],
          ["acos(x), asin(x)", "|x| > 1", "acos(clamp(x, -1.0, 1.0))"],
          ["normalize(v)", tx(t, "glslDbg_g5", "v has length 0"), tx(t, "glslDbg_g5b", "check dot(v, v) > 1e-12 first, or pick a fallback direction")],
          ["a / b", "b = 0", tx(t, "glslDbg_g6", "a / max(b, 1e-6) when b ≥ 0")],
          ["atan(y, x)", tx(t, "glslDbg_g7", "x = y = 0"), tx(t, "glslDbg_g7b", "test for the centre before calling it")],
          ["smoothstep(e0, e1, x)", "e0 ≥ e1", tx(t, "glslDbg_g8", "1.0 − smoothstep(e1, e0, x) for a falling edge")],
          ["clamp(x, lo, hi)", "lo > hi", tx(t, "glslDbg_g9", "make sure the bounds are in order")],
          ["a % b (int)", tx(t, "glslDbg_g10", "a or b negative"), tx(t, "glslDbg_g10b", "mod() on floats, or unsigned ints")],
        ]}
      />
      <Callout type="warn" t={t}>
        {tx(t, "glslDbg_browserWarn",
          "The browser hides some bugs that native programs show. Chrome and Edge run WebGL through ANGLE, which sets every variable you forgot to initialise to 0, for safety; the table above shows 0 for it and for the function that misses its return. A native OpenGL driver gives no such promise: the same shader can read whatever the register held before, and work on one GPU but flicker on another. Initialise every variable, and give every path of a function a return.")}
      </Callout>
      <Callout type="info" t={t}>
        {tx(t, "glslDbg_isnanNote",
          "isnan can lie. GLSL ES says it always returns false on GPUs without NaN, and optimising compilers may assume that NaN never occurs and remove the test, as they removed x / x and NaN * 0.0 in the table. If the NaN view stays dark while pixels are clearly black, read the value back with the pixel probe instead.")}
      </Callout>

      {/* ── tools ── */}
      <H2>{tx(t, "glslDbg_toolsTitle", "Tools that look inside")}</H2>
      <p>
        {tx(t, "glslDbg_toolsBody",
          "Colours and probes work everywhere. On native platforms, tools can do more: capture a frame, pick a pixel, and step through the shader for that pixel line by line with every variable's value. Support depends on the API:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslDbg_tH0", "Tool"), tx(t, "glslDbg_tH1", "What it does for shaders"), tx(t, "glslDbg_tH2", "Where")]}
        rows={[
          ["RenderDoc", tx(t, "glslDbg_t1", "frame capture, pixel history, and line-by-line shader debugging; for OpenGL it captures the frame but cannot step through shaders"), "Vulkan, D3D11, D3D12, OpenGL"],
          ["debugPrintfEXT", tx(t, "glslDbg_t2", "printf from a shader (GL_EXT_debug_printf); the validation layer prints the output, and RenderDoc shows it per draw"), "Vulkan"],
          ["Nsight Graphics", tx(t, "glslDbg_t3", "NVIDIA's frame debugger and profiler; its shader debugger works with Vulkan and D3D12"), "Vulkan, D3D12, OpenGL"],
          [tx(t, "glslDbg_t4a", "Xcode Metal debugger"), tx(t, "glslDbg_t4", "steps through Metal shaders, which is what WebGL becomes on a Mac"), "macOS, iOS"],
          ["Spector.js", tx(t, "glslDbg_t5", "a browser extension that captures every WebGL call of a frame with its state and shader source; no stepping"), "WebGL"],
          ["glslangValidator, glslc", tx(t, "glslDbg_t6", "compile offline with the reference compiler, to catch errors before the driver sees them"), tx(t, "glslDbg_t6b", "any")],
        ]}
      />
      <CodeBlock lang="glsl" filename="printf.frag" t={t}>{`#version 450
#extension GL_EXT_debug_printf : enable
...
// Printed once per invocation that runs it, so limit it to one pixel
if (ivec2(gl_FragCoord.xy) == ivec2(200, 100))
    debugPrintfEXT("N = %v3f, ndl = %f", N, ndl);`}</CodeBlock>

      <H2>{tx(t, "glslDbg_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "glslDbg_xH0", "Symptom"), tx(t, "glslDbg_xH1", "Cause"), tx(t, "glslDbg_xH2", "Fix")]}
        rows={[
          [tx(t, "glslDbg_x1a", "dozens of errors after one small edit"), tx(t, "glslDbg_x1b", "one mistake confuses the parser for everything that follows"), tx(t, "glslDbg_x1c", "fix only the first message, then compile again")],
          [tx(t, "glslDbg_x2a", "the log points at a line that looks fine"), tx(t, "glslDbg_x2b", "code was added in front of the shader, or the mistake is at the end of the line before"), tx(t, "glslDbg_x2c", "#line 1 before your code; look one line up")],
          [tx(t, "glslDbg_x3a", "black pixels with sharp edges"), tx(t, "glslDbg_x3b", "NaN from an unguarded sqrt, pow, acos or normalize"), tx(t, "glslDbg_x3c", "NaN view to find them, then guard the input")],
          [tx(t, "glslDbg_x4a", "works in the browser, flickers in the native build"), tx(t, "glslDbg_x4b", "an uninitialised variable, zeroed by ANGLE but not by the driver"), tx(t, "glslDbg_x4c", "initialise everything")],
          [tx(t, "glslDbg_x5a", "works on one GPU, fails to compile on another"), tx(t, "glslDbg_x5b", "a lenient driver accepted code outside the specification"), tx(t, "glslDbg_x5c", "check with glslangValidator in the build")],
          [tx(t, "glslDbg_x6a", "a debug colour looks right but the result is still wrong"), tx(t, "glslDbg_x6b", "the value clipped to 0..1 on screen, hiding that it was 3 or −2"), tx(t, "glslDbg_x6c", "use a range check, fract, or the pixel probe")],
        ]}
      />

      <KeyIdeas t={t} id="glslDbg" items={[
        "Fix the first compile error first; a syntax error is reported where the parser noticed it, often one line late.",
        "#line 1 before your own code makes the log's line numbers yours again.",
        "Paint the value you doubt as a colour, split against the real image, and range-check final colours.",
        "Cut the shader in half with early returns and constants; read exact numbers with a one-pixel probe.",
        "sqrt, pow, log, acos, normalize, division and % have inputs with undefined results; NaN spreads and usually shows as black.",
        "The browser zeroes forgotten variables; native drivers do not. RenderDoc, debugPrintfEXT and vendor tools can step through shaders.",
      ]} />

      <Related t={t} links={[
        { track: "OpenGL", id: "debugging", title: tx(t, "glslDbg_rel1", "Debugging OpenGL"), why: tx(t, "glslDbg_rel1b", "the API side: debug callback, object labels and the black screen checklist.") },
        { track: "GLSL", id: "playground", title: tx(t, "glslDbg_rel2", "The Shader Playground"), why: tx(t, "glslDbg_rel2b", "the uniforms, controls and common mistakes of the editor used here.") },
        { track: "GLSL", id: "versions", title: tx(t, "glslDbg_rel3", "Versions & Dialects"), why: tx(t, "glslDbg_rel3b", "#version, the preprocessor and glslc, the reference compiler for Vulkan.") },
        { track: "GLSL", id: "builtins", title: tx(t, "glslDbg_rel4", "Built-in Functions"), why: tx(t, "glslDbg_rel4b", "what each function computes, with its valid inputs.") },
      ]} />
    </article>
  );
}

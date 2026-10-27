"use client";

// OpenGL track — "Rotating a Triangle". A hands-on chapter after
// "Transformations + GLM": a second, small program (spin.cpp, a copy of the
// Drawing the Triangle main.cpp) that turns the triangle in five runnable
// steps: one fixed turn with a uModel matrix (and why it looks stretched);
// glm::ortho to undo the window's stretch; spinning with the clock; an angle
// kept between frames (dt, arrow keys, space to pause, once per press);
// other axes with the X, Y and Z keys. Then variations (a pivot, spinning in
// place vs orbiting), the full spin.cpp, what you see and why, mistakes.
// Rotating the Cube continues spin.cpp.

import { CodeBlock, Callout, H2, H3, IC, LessonTable } from "@/components/lesson/LessonComponents";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { RotateTriangleFigure } from "@/components/lesson/figures/glintro/RotateTriangleFigure";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";

export function RotateTriangleContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglRotTri_intro",
          "The last chapter showed every matrix at once. This one slows down and does one thing: it takes the first triangle you drew and makes it turn. Five small steps, and you run the program after each one. First it turns once, then it spins, then you steer it with the keyboard. Along the way you meet the two things that surprise everyone the first time: the triangle looks stretched while it turns, and it turns around the wrong point.")}
      </Lead>

      <Goals t={t} id="oglRotTri" items={[
        "Turn a shape with glm::rotate and a uModel matrix in the vertex shader.",
        "Undo the window's stretch with glm::ortho, so a turning shape keeps its shape.",
        "Spin it at a fixed speed in degrees per second, then pause and steer it with keys.",
        "Turn it around any axis and any point, and spin it in place or make it orbit.",
      ]} />

      {/* ── THE PROGRAM ─────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_progTitle", "A second program: spin")}</H2>
      <p>
        {tx(t, "oglRotTri_prog1",
          "This chapter does not touch your main.cpp. That file goes on to the cube and the camera. Here you build a small second program, called spin, next to it. You make it once, and Rotating the Cube, two chapters on, keeps growing it.")}
      </p>
      <p>{tx(t, "oglRotTri_prog2", "Add two lines at the end of CMakeLists.txt, like the mathlab program of the Vectors chapter:")}</p>
      <CodeBlock lang="cmake" filename="CMakeLists.txt" t={t}>{`add_executable(spin src/spin.cpp)                     # NEW: a third program
target_link_libraries(spin PRIVATE glad glfw glm::glm)  # NEW: the same libraries as app`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_prog3",
          "Then create src/spin.cpp as a copy of the complete program from the Drawing the Triangle chapter: the coloured triangle, nothing else. Change only the window title, so you can tell the two windows apart, and add the three GLM includes under the others:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (top of the file, and step 1)" t={t}>{`#include <glm/glm.hpp>                    // NEW: glm::vec3, glm::mat4
#include <glm/gtc/matrix_transform.hpp>   // NEW: glm::rotate, glm::translate, glm::ortho
#include <glm/gtc/type_ptr.hpp>           // NEW: glm::value_ptr

GLFWwindow* window = glfwCreateWindow(1280, 720, "Spin", nullptr, nullptr);   // was "GLApp"`}</CodeBlock>
      <Callout type="info" t={t}>
        {tx(t, "oglRotTri_progRun",
          "Build the spin target and run it (in a terminal: cmake --build build --target spin). You should see the familiar triangle: red at the bottom left, green at the bottom right, blue at the top. It does not move yet.")}
      </Callout>

      {/* ── STEP 1 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_s1Title", "Step 1: turn it once")}</H2>
      <p>
        {tx(t, "oglRotTri_s1a",
          "The GPU moves vertices in the vertex shader, so that is where the turn goes. Give the shader a mat4 uniform called uModel and multiply every position by it:")}
      </p>
      <CodeBlock lang="glsl" filename="vertex shader (in spin.cpp)" t={t}>{`#version 460 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
out vec3 vColor;
uniform mat4 uModel;                          // NEW: the turn, the same for every vertex

void main() {
    gl_Position = uModel * vec4(aPos, 1.0);   // NEW: was vec4(aPos, 1.0)
    vColor = aColor;
}`}</CodeBlock>
      <p>{tx(t, "oglRotTri_s1b", "In step 4, right after the program is made, ask once where the uniform lives:")}</p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 4, after makeProgram)" t={t}>{`GLint modelLoc = glGetUniformLocation(shaderProgram, "uModel");`}</CodeBlock>
      <p>{tx(t, "oglRotTri_s1c", "Then, in the render loop, build the matrix and send it, between glUseProgram and the draw call:")}</p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, in the render loop)" t={t}>{`glm::mat4 model = glm::rotate(glm::mat4(1.0f),            // start from "change nothing"
                              glm::radians(30.0f),          // how far: 30°
                              glm::vec3(0.0f, 0.0f, 1.0f)); // around which axis: z

glUseProgram(shaderProgram);
glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
glBindVertexArray(vao);
glDrawArrays(GL_TRIANGLES, 0, 3);`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "oglRotTri_tPart", "Part"), tx(t, "oglRotTri_tMeans", "What it means")]}
        rows={[
          [<IC key="1">{"glm::mat4(1.0f)"}</IC>, tx(t, "oglRotTri_m1", "the identity matrix: it leaves every vertex where it is. glm::rotate returns this matrix with a turn added to it.")],
          [<IC key="2">{"glm::radians(30.0f)"}</IC>, tx(t, "oglRotTri_m2", "the angle. GLM wants radians, so glm::radians converts: 30° is 0.524 radians. A positive angle turns counter-clockwise.")],
          [<IC key="3">{"glm::vec3(0.0f, 0.0f, 1.0f)"}</IC>, tx(t, "oglRotTri_m3", "the axis, the line the triangle turns around. z points out of the screen toward you, so turning around z keeps the triangle flat on the screen, like a clock hand.")],
          [<IC key="4">{"glUniformMatrix4fv(…)"}</IC>, tx(t, "oglRotTri_m4", "sends the 16 numbers to uModel. Its four arguments are explained in the Transformations + GLM chapter.")],
        ]}
      />
      <p>
        {tx(t, "oglRotTri_s1d",
          "Run it. The triangle has turned to the left, but look closely: it does not look like the same triangle, turned. It looks bent, a little wider and flatter. Follow the top corner, (0, 0.65). Turned by 30°, it lands at (−0.325, 0.563). Now count pixels. The window is 1280 pixels wide and 720 high, and NDC runs from −1 to 1 both ways. So one unit of x is 640 pixels, but one unit of y is only 360.")}
      </p>
      <LessonTable
        headers={[tx(t, "oglRotTri_tCorner", "Top corner"), tx(t, "oglRotTri_tNdc", "NDC"), tx(t, "oglRotTri_tPx", "Pixels from the centre (x, y)"), tx(t, "oglRotTri_tDist", "Distance")]}
        rows={[
          [tx(t, "oglRotTri_k0", "before the turn"), "(0, 0.65)", "(0, 234)", "234 px"],
          [tx(t, "oglRotTri_k30", "turned 30°"), "(−0.325, 0.563)", "(−208, 203)", "290 px"],
          [tx(t, "oglRotTri_k90", "turned 90°"), "(−0.65, 0)", "(−416, 0)", "416 px"],
        ]}
      />
      <p>
        {tx(t, "oglRotTri_s1e",
          "The corner is always 0.65 units from the centre, but on screen it is 234 pixels away when it points up and 416 when it points sideways. The window stretches everything sideways by 640 / 360 = 1.78. It did so in the Triangle chapter too; you just could not tell while nothing turned. Try it in the figure: press spin, and watch the readout.")}
      </p>

      <RotateTriangleFigure t={t} />

      {/* ── STEP 2 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_s2Title", "Step 2: stop the stretch")}</H2>
      <p>
        {tx(t, "oglRotTri_s2a",
          "The fix is to make the visible area as wide, in units, as the window is in pixels. If y goes from −1 to 1, x should go from −1.78 to 1.78. Then one unit is 360 pixels both ways. glm::ortho builds the matrix that does this. It is an orthographic projection, the simple kind from the Transformations + GLM chapter: no perspective, just a box squeezed into NDC. Add a second uniform to the vertex shader:")}
      </p>
      <CodeBlock lang="glsl" filename="vertex shader (in spin.cpp)" t={t}>{`uniform mat4 uModel;
uniform mat4 uProjection;                                   // NEW

void main() {
    gl_Position = uProjection * uModel * vec4(aPos, 1.0);   // NEW: uProjection on the left
    vColor = aColor;
}`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_s2b",
          "The order matters. Read it from right to left: uModel turns the vertex first, then uProjection fits the result to the window. Next, a second location in step 4, and in the loop the projection, rebuilt every frame from the window's real size:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 4, and step 5 in the render loop)" t={t}>{`GLint projectionLoc = glGetUniformLocation(shaderProgram, "uProjection");   // step 4

// step 5, before glUseProgram:
int width, height;
glfwGetFramebufferSize(window, &width, &height);
float aspect = height > 0 ? (float)width / (float)height : 1.0f;   // 1280 / 720 = 1.78
glm::mat4 projection = glm::ortho(-aspect, aspect,     // left and right edges: x = ±1.78
                                  -1.0f, 1.0f,         // bottom and top edges: y = ±1
                                  -1.0f, 1.0f);        // near and far: keep z from −1 to 1

// step 5, after glUseProgram:
glUniformMatrix4fv(projectionLoc, 1, GL_FALSE, glm::value_ptr(projection));`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "oglRotTri_tPart", "Part"), tx(t, "oglRotTri_tMeans", "What it means")]}
        rows={[
          [<IC key="1">{"aspect"}</IC>, tx(t, "oglRotTri_p1", "width ÷ height. The (float) casts come first, or 1280 / 720 is divided as integers and gives 1. The height > 0 test avoids dividing by 0 when the window is minimised.")],
          [<IC key="2">{"-aspect, aspect"}</IC>, tx(t, "oglRotTri_p2", "the x values that land on the left and right edges of the window. A wider window shows more of the world instead of stretching it.")],
          [<IC key="3">{"-1.0f, 1.0f"}</IC>, tx(t, "oglRotTri_p3", "the y values at the bottom and top edges, the same as before.")],
          [<IC key="4">{"-1.0f, 1.0f (last pair)"}</IC>, tx(t, "oglRotTri_p4", "the depth range to keep. The triangle sits at z = 0, and in step 5 it will turn out of the screen a little, up to z = ±0.65, still inside.")],
        ]}
      />
      <p>
        {tx(t, "oglRotTri_s2c",
          "With numbers: the turned top corner, (−0.325, 0.563), now lands at x = −0.325 / 1.78 = −0.183 in NDC, which is −117 pixels from the centre, and y = 203 pixels as before. Its distance is 234 pixels again, the same as before the turn.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "oglRotTri_s2Run",
          "Run it: the triangle is turned 30° and looks like itself, only turned. It is also narrower than in the Triangle chapter, because that one was stretched all along. Resize the window: the triangle keeps its shape, and a wider window simply shows more space at the sides.")}
      </Callout>

      {/* ── STEP 3 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_s3Title", "Step 3: make it spin")}</H2>
      <p>
        {tx(t, "oglRotTri_s3a",
          "A fixed 30° is a picture. To make it move, the angle has to grow while the program runs. The loop already redraws the triangle about 60 times a second, so the angle only has to be different each time. The simplest source of a growing number is the clock: glfwGetTime() returns the seconds since glfwInit. Replace the 30° line:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, in the render loop)" t={t}>{`float time = (float)glfwGetTime();                          // 0, 0.016, 0.033, … seconds
glm::mat4 model = glm::rotate(glm::mat4(1.0f),
                              time * glm::radians(90.0f),   // 90° for every second
                              glm::vec3(0.0f, 0.0f, 1.0f));`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_s3b",
          "Read time * glm::radians(90.0f) as \"seconds × degrees per second\". After 1 second the angle is 90°, after 2 seconds 180°, after 4 seconds 360°: one full turn. The number in glm::radians is the speed. Change it and see:")}
      </p>
      <LessonTable
        headers={[tx(t, "oglRotTri_tSpeed", "Speed"), tx(t, "oglRotTri_tTurn", "One full turn takes"), tx(t, "oglRotTri_tLooks", "What you see")]}
        rows={[
          ["glm::radians(90.0f)", "360 / 90 = 4 s", tx(t, "oglRotTri_v1", "a calm spin, counter-clockwise")],
          ["glm::radians(360.0f)", "1 s", tx(t, "oglRotTri_v2", "fast, one turn per second")],
          ["glm::radians(-90.0f)", "4 s", tx(t, "oglRotTri_v3", "the same spin, clockwise: a negative angle turns the other way")],
          ["glm::radians(6.0f)", "60 s", tx(t, "oglRotTri_v4", "the second hand of a clock (going backwards)")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "oglRotTri_s3Run",
          "Run it: the triangle spins counter-clockwise, once every 4 seconds, and keeps its shape all the way round. Look at its middle: it wobbles a little instead of spinning perfectly in place. The variations at the end of the chapter explain why.")}
      </Callout>

      {/* ── STEP 4 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_s4Title", "Step 4: pause it and steer it")}</H2>
      <p>
        {tx(t, "oglRotTri_s4a",
          "The clock cannot be stopped. If you pause the spin for 3 seconds and let it go, time * speed jumps ahead by 270° at once. To pause, the program needs its own angle: a variable that remembers where the triangle is, and grows by a small step each frame only while it should.")}
      </p>
      <p>
        {tx(t, "oglRotTri_s4b",
          "How big a step? A frame does not always last the same time. At 60 frames per second it lasts 1/60 of a second, on a 144 Hz screen 1/144. So measure it: dt is the time since the last frame, and the step is speed × dt. At 60 Hz that is 90° × 0.0167 = 1.5° per frame; at 144 Hz it is 0.625°, smaller steps but more of them, so 90° per second on every machine. Add the state in step 4, just before the loop:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (end of step 4, before the loop)" t={t}>{`float angle        = 0.0f;                 // where the triangle is, in radians
bool  spinning     = true;                 // false while paused
bool  spaceWasDown = false;                // was Space held during the last frame?
float lastFrame    = (float)glfwGetTime(); // when the last frame started`}</CodeBlock>
      <p>{tx(t, "oglRotTri_s4c", "Then, at the top of the loop, measure the frame, read the keys and move the angle:")}</p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, top of the render loop)" t={t}>{`float time = (float)glfwGetTime();
float dt   = time - lastFrame;             // how long the last frame took, in seconds
lastFrame  = time;

bool spaceDown = glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS;
if (spaceDown && !spaceWasDown)            // only on the frame the key goes down
    spinning = !spinning;
spaceWasDown = spaceDown;

float speed = glm::radians(90.0f);         // 90° per second
if (spinning) angle += speed * dt;
if (glfwGetKey(window, GLFW_KEY_LEFT)  == GLFW_PRESS) angle += speed * dt;   // counter-clockwise
if (glfwGetKey(window, GLFW_KEY_RIGHT) == GLFW_PRESS) angle -= speed * dt;   // clockwise`}</CodeBlock>
      <p>{tx(t, "oglRotTri_s4d", "And the model matrix uses the angle instead of the clock:")}</p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, in the render loop)" t={t}>{`glm::mat4 model = glm::rotate(glm::mat4(1.0f), angle, glm::vec3(0.0f, 0.0f, 1.0f));`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "oglRotTri_tLine", "Line"), tx(t, "oglRotTri_tDoes", "What it does")]}
        rows={[
          [<IC key="1">{"dt = time - lastFrame"}</IC>, tx(t, "oglRotTri_l1", "the length of the last frame. lastFrame is set before the loop, so the first dt is tiny instead of the whole start-up time.")],
          [<IC key="2">{"spaceDown && !spaceWasDown"}</IC>, tx(t, "oglRotTri_l2", "true only on the first frame of a press. glfwGetKey says \"held\", and a short press lasts several frames; flipping spinning on every one of them would leave it on or off at random.")],
          [<IC key="3">{"angle += speed * dt"}</IC>, tx(t, "oglRotTri_l3", "one frame's worth of turning. Holding Left while it spins adds a second step, so it goes twice as fast. Holding Right cancels the spin, and the triangle stands still.")],
          [<IC key="4">{"angle (no glm::radians)"}</IC>, tx(t, "oglRotTri_l4", "angle is already in radians, because speed was converted once. Do not wrap it in glm::radians again.")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "oglRotTri_s4Run",
          "Run it: the triangle spins as before. Press Space and it stops exactly where it is; press it again and it goes on from there. While it is paused, hold Left or Right to turn it by hand.")}
      </Callout>

      {/* ── STEP 5 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_s5Title", "Step 5: other axes")}</H2>
      <p>
        {tx(t, "oglRotTri_s5a",
          "Turning around z keeps the triangle flat on the screen. The other two axes lie in the screen: x points right, y points up. Turning around them flips the triangle like a playing card. Make the axis a variable, next to angle in step 4, and let the X, Y and Z keys pick it:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 4, and step 5 after the arrow keys)" t={t}>{`glm::vec3 axis(0.0f, 0.0f, 1.0f);          // step 4: start with z

// step 5:
if (glfwGetKey(window, GLFW_KEY_X) == GLFW_PRESS) axis = glm::vec3(1.0f, 0.0f, 0.0f);
if (glfwGetKey(window, GLFW_KEY_Y) == GLFW_PRESS) axis = glm::vec3(0.0f, 1.0f, 0.0f);
if (glfwGetKey(window, GLFW_KEY_Z) == GLFW_PRESS) axis = glm::vec3(0.0f, 0.0f, 1.0f);

glm::mat4 model = glm::rotate(glm::mat4(1.0f), angle, axis);   // was the fixed z axis`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "oglRotTri_tAxis", "Axis"), tx(t, "oglRotTri_tSee", "What you see")]}
        rows={[
          [tx(t, "oglRotTri_az", "z (0, 0, 1)"), tx(t, "oglRotTri_azb", "it turns flat on the screen, like a clock hand.")],
          [tx(t, "oglRotTri_ay", "y (0, 1, 0)"), tx(t, "oglRotTri_ayb", "it turns like a revolving door. At 90° you see it edge-on: a thin vertical line. At 180° it is mirrored, with green on the left and red on the right.")],
          [tx(t, "oglRotTri_ax", "x (1, 0, 0)"), tx(t, "oglRotTri_axb", "it tips like a seesaw seen from the front. At 90° it is a thin horizontal line; at 180° it is upside down.")],
        ]}
      />
      <p>
        {tx(t, "oglRotTri_s5b",
          "Two things to notice. First, it looks flat even while it turns in 3D: one side never gets bigger as it comes toward you. That is the orthographic projection; perspective comes with the cube. Second, halfway round you see the back of the triangle, and it is still drawn. OpenGL draws both sides of a triangle unless you ask it not to; the Face Winding & Culling chapter shows how and why you would.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "oglRotTri_s5Run",
          "Run it, press Y, then X, then Z. Combine it with Space: pause at 90° around y and the triangle is a line. Try the same in the figure above, with the axis buttons.")}
      </Callout>

      {/* ── VARIATIONS ──────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_varTitle", "Variations: around another point, and in a circle")}</H2>
      <p>
        {tx(t, "oglRotTri_var1",
          "glm::rotate always turns around the origin, (0, 0, 0). That is why the triangle wobbled in step 3: its middle is not at the origin. The middle of a triangle is the average of its three corners: ((−0.6 + 0.65 + 0) / 3, (−0.55 − 0.45 + 0.65) / 3) = (0.017, −0.117). Close to (0, 0), so it almost spins in place. Each variation below replaces the model line of step 5. Try one, run it, then try the next.")}
      </p>

      <H3>{tx(t, "oglRotTri_pivTitle", "Turning around any point")}</H3>
      <p>
        {tx(t, "oglRotTri_piv1",
          "To turn around another point, the pivot, do it in three moves: slide the triangle so the pivot sits on the origin, turn, and slide it back. Here the pivot is the top corner, (0, 0.65):")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model line)" t={t}>{`glm::vec3 pivot(0.0f, 0.65f, 0.0f);                 // the top corner
glm::mat4 model(1.0f);
model = glm::translate(model, pivot);               // 3rd: slide the pivot back
model = glm::rotate(model, angle, axis);            // 2nd: turn around the origin
model = glm::translate(model, -pivot);              // 1st: slide the pivot to the origin`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_piv2",
          "Why are the comments numbered upwards? Each GLM call multiplies the new matrix on the right, so the line written last is the first to touch the vertex (the Transformations + GLM chapter explains it with a figure). Follow the red corner, (−0.6, −0.55), at 90°:")}
      </p>
      <LessonTable
        headers={[tx(t, "oglRotTri_tStep", "Step"), tx(t, "oglRotTri_tRed", "The red corner")]}
        rows={[
          [tx(t, "oglRotTri_r0", "start"), "(−0.6, −0.55)"],
          [tx(t, "oglRotTri_r1", "1st: minus the pivot (0, 0.65)"), "(−0.6, −1.2)"],
          [tx(t, "oglRotTri_r2", "2nd: turn 90°, (x, y) becomes (−y, x)"), "(1.2, −0.6)"],
          [tx(t, "oglRotTri_r3", "3rd: plus the pivot"), "(1.2, 0.05)"],
        ]}
      />
      <p>
        {tx(t, "oglRotTri_piv3",
          "The top corner stays put and the triangle swings around it like a flag on a pole. Set the pivot to the middle, (0.017, −0.117, 0), and the wobble of step 3 is gone.")}
      </p>

      <H3>{tx(t, "oglRotTri_orbTitle", "Spinning in place, or going round in a circle")}</H3>
      <p>
        {tx(t, "oglRotTri_orb1",
          "Now move the triangle away from the centre, to x = 0.6, and shrink it to 0.4 times its size so it fits. Write translate first and rotate second, and it spins in place over there:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model line)" t={t}>{`glm::mat4 model(1.0f);
model = glm::translate(model, glm::vec3(0.6f, 0.0f, 0.0f));   // 3rd: move it right
model = glm::rotate(model, angle, glm::vec3(0.0f, 0.0f, 1.0f)); // 2nd: spin
model = glm::scale(model, glm::vec3(0.4f));                     // 1st: 0.4 times the size`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_orb2",
          "Swap the first two calls. Now the triangle is moved first and turned after, and a turn is always around the origin, so it travels around the centre of the window on a circle of radius 0.6. It always shows the same side to the centre, like the Moon to the Earth:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model line)" t={t}>{`glm::mat4 model(1.0f);
model = glm::rotate(model, angle, glm::vec3(0.0f, 0.0f, 1.0f)); // 3rd: swing around the centre
model = glm::translate(model, glm::vec3(0.6f, 0.0f, 0.0f));   // 2nd: move it right
model = glm::scale(model, glm::vec3(0.4f));                     // 1st: 0.4 times the size`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_orb3",
          "Both at once is one more rotate: an orbit on the outside, a spin on the inside. With a quarter of the speed for the orbit, it spins four times for each trip around the centre:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model line)" t={t}>{`glm::mat4 model(1.0f);
model = glm::rotate(model, angle * 0.25f, glm::vec3(0.0f, 0.0f, 1.0f)); // 4th: orbit, slowly
model = glm::translate(model, glm::vec3(0.6f, 0.0f, 0.0f));           // 3rd: out to radius 0.6
model = glm::rotate(model, angle, glm::vec3(0.0f, 0.0f, 1.0f));         // 2nd: spin in place
model = glm::scale(model, glm::vec3(0.4f));                             // 1st: 0.4 times the size`}</CodeBlock>
      <p>
        {tx(t, "oglRotTri_orb4",
          "When you are done, put back the plain line of step 5, glm::rotate(glm::mat4(1.0f), angle, axis). The checkpoint below and Rotating the Cube start from it.")}
      </p>

      {/* ── CHECKPOINT ──────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_soFarTitle", "Your spin.cpp so far")}</H2>
      <p>
        {tx(t, "oglRotTri_soFarBody",
          "The whole file after step 5. Compared with the Drawing the Triangle program, the changes are marked NEW: the GLM includes, the two matrices in the vertex shader, two uniform locations and the spin state in step 4, and the time, keys and matrices in the loop. The two shader helpers are shortened because they did not change.")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp" t={t}>{`#include <glad/glad.h>      // MUST come before glfw3.h
#include <GLFW/glfw3.h>
#include <iostream>
#include <glm/glm.hpp>                    // NEW
#include <glm/gtc/matrix_transform.hpp>   // NEW
#include <glm/gtc/type_ptr.hpp>           // NEW

// ── Shaders ─────────────────────────────────────── NEW: two matrices
const char* vertexShaderSource = R"(#version 460 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
out vec3 vColor;
uniform mat4 uModel;
uniform mat4 uProjection;
void main() {
    gl_Position = uProjection * uModel * vec4(aPos, 1.0);
    vColor = aColor;
})";

const char* fragmentShaderSource = R"(#version 460 core
in vec3 vColor;
out vec4 FragColor;
void main() {
    FragColor = vec4(vColor, 1.0);
})";

// ── Shader helpers (unchanged since First Shaders) ──────────────────────────
GLuint compileShader(GLenum type, const char* src) { /* ... */ }
GLuint makeProgram(const char* vsSrc, const char* fsSrc) { /* ... */ }

void framebufferSizeCallback(GLFWwindow*, int width, int height) {
    glViewport(0, 0, width, height);
}

int main() {
    // ── 1–3. Window, GLAD, viewport (unchanged, except the title) ───────────
    if (!glfwInit()) return 1;
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    GLFWwindow* window = glfwCreateWindow(1280, 720, "Spin", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 1; }
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) return 1;
    int fbw, fbh;
    glfwGetFramebufferSize(window, &fbw, &fbh);
    glViewport(0, 0, fbw, fbh);
    glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);

    // ── 4. One-time setup ────────────────────────────────────────────────────
    // 4a. Shaders → program (unchanged)
    GLuint shaderProgram = makeProgram(vertexShaderSource, fragmentShaderSource);
    if (shaderProgram == 0) { glfwTerminate(); return 1; }

    // 4b. Vertex data → VAO + VBO (unchanged: the triangle)
    float vertices[] = {
    //    x      y      z     r     g     b
        -0.6f, -0.55f, 0.0f, 1.0f, 0.27f, 0.27f,   // vertex 0: red, bottom left
         0.65f,-0.45f, 0.0f, 0.13f,0.77f, 0.37f,   // vertex 1: green, bottom right
         0.0f,  0.65f, 0.0f, 0.23f,0.51f, 0.96f,   // vertex 2: blue, top
    };
    GLuint vao, vbo;
    glGenVertexArrays(1, &vao);
    glGenBuffers(1, &vbo);

    glBindVertexArray(vao);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glBindVertexArray(0);

    // 4c. Matrix uniforms                            >>> NEW
    GLint modelLoc      = glGetUniformLocation(shaderProgram, "uModel");
    GLint projectionLoc = glGetUniformLocation(shaderProgram, "uProjection");

    // 4d. The spin, kept between frames
    float angle        = 0.0f;                     // radians
    glm::vec3 axis(0.0f, 0.0f, 1.0f);              // z: flat on the screen
    bool  spinning     = true;
    bool  spaceWasDown = false;
    float lastFrame    = (float)glfwGetTime();
    //                                               <<< end of NEW

    // ── 5. The render loop ───────────────────────────────────────────────────
    while (!glfwWindowShouldClose(window)) {
        if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
            glfwSetWindowShouldClose(window, true);

        // >>> NEW: time, keys and the angle
        float time = (float)glfwGetTime();
        float dt   = time - lastFrame;
        lastFrame  = time;

        bool spaceDown = glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS;
        if (spaceDown && !spaceWasDown) spinning = !spinning;
        spaceWasDown = spaceDown;

        float speed = glm::radians(90.0f);
        if (spinning) angle += speed * dt;
        if (glfwGetKey(window, GLFW_KEY_LEFT)  == GLFW_PRESS) angle += speed * dt;
        if (glfwGetKey(window, GLFW_KEY_RIGHT) == GLFW_PRESS) angle -= speed * dt;

        if (glfwGetKey(window, GLFW_KEY_X) == GLFW_PRESS) axis = glm::vec3(1.0f, 0.0f, 0.0f);
        if (glfwGetKey(window, GLFW_KEY_Y) == GLFW_PRESS) axis = glm::vec3(0.0f, 1.0f, 0.0f);
        if (glfwGetKey(window, GLFW_KEY_Z) == GLFW_PRESS) axis = glm::vec3(0.0f, 0.0f, 1.0f);
        // <<< end of NEW

        glClearColor(0.06f, 0.07f, 0.10f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // >>> NEW: the two matrices, rebuilt every frame
        int width, height;
        glfwGetFramebufferSize(window, &width, &height);
        float aspect = height > 0 ? (float)width / (float)height : 1.0f;
        glm::mat4 projection = glm::ortho(-aspect, aspect, -1.0f, 1.0f, -1.0f, 1.0f);
        glm::mat4 model = glm::rotate(glm::mat4(1.0f), angle, axis);
        // <<< end of NEW

        glUseProgram(shaderProgram);
        glUniformMatrix4fv(modelLoc,      1, GL_FALSE, glm::value_ptr(model));        // NEW
        glUniformMatrix4fv(projectionLoc, 1, GL_FALSE, glm::value_ptr(projection));   // NEW
        glBindVertexArray(vao);
        glDrawArrays(GL_TRIANGLES, 0, 3);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // ── 6. Clean up (unchanged) ──────────────────────────────────────────────
    glDeleteVertexArrays(1, &vao);
    glDeleteBuffers(1, &vbo);
    glDeleteProgram(shaderProgram);
    glfwTerminate();
    return 0;
}`}</CodeBlock>

      {/* ── WHAT YOU SEE ────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_seeTitle", "If it does not look right")}</H2>
      <LessonTable
        headers={[tx(t, "oglRotTri_tSee", "What you see"), tx(t, "oglRotTri_tCause", "Likely cause")]}
        rows={[
          [tx(t, "oglRotTri_w1", "nothing at all, only the clear colour"), tx(t, "oglRotTri_w1b", "a matrix uniform that was never set is all zeros, and every vertex lands on one point. Print modelLoc and projectionLoc: −1 means a misspelled name, or a uniform the shader declares but never uses.")],
          [tx(t, "oglRotTri_w2", "the triangle does not move"), tx(t, "oglRotTri_w2b", "the matrix is built once, before the loop, or angle never grows: check that spinning starts true and that dt is not always 0 (lastFrame = time must come after dt is computed).")],
          [tx(t, "oglRotTri_w3", "it spins madly, or jumps between a few poses"), tx(t, "oglRotTri_w3b", "degrees passed as radians: glm::rotate(…, 90.0f, …) turns by 90 radians, about 14 full turns. Use glm::radians.")],
          [tx(t, "oglRotTri_w4", "it changes shape as it turns"), tx(t, "oglRotTri_w4b", "no projection, or uProjection is not in the shader's multiplication. That is the stretch of step 1.")],
          [tx(t, "oglRotTri_w5", "Space sometimes does nothing"), tx(t, "oglRotTri_w5b", "spinning is flipped on every frame the key is held, not once per press. Keep spaceWasDown, as in step 4.")],
          [tx(t, "oglRotTri_w6", "it disappears when you press a key"), tx(t, "oglRotTri_w6b", "the axis became (0, 0, 0). glm::rotate needs a direction; with none, the matrix fills with NaN and nothing is drawn.")],
        ]}
      />

      {/* ── MISTAKES ────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotTri_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "oglRotTri_tMistake", "Mistake"), tx(t, "oglRotTri_tFix", "What happens, and the fix")]}
        rows={[
          [tx(t, "oglRotTri_e1", "angle += speed, without dt"), tx(t, "oglRotTri_e1b", "the step is per frame, so the triangle spins 2.4 times faster on a 144 Hz screen than on a 60 Hz one. Multiply by dt to make the speed \"per second\".")],
          [tx(t, "oglRotTri_e2", "Pausing a time-based angle"), tx(t, "oglRotTri_e2b", "angle = time * speed cannot stop; it jumps ahead when you resume. Keep your own angle and add speed * dt.")],
          [tx(t, "oglRotTri_e3", "uModel * uProjection in the shader"), tx(t, "oglRotTri_e3b", "the projection would act first and the turn after it, in the stretched space: the shape changes as it turns again. The matrix that acts first sits next to the vector: uProjection * uModel * pos.")],
          [tx(t, "oglRotTri_e4", "Expecting rotate to turn around the shape's middle"), tx(t, "oglRotTri_e4b", "it always turns around the origin. Put the pivot on the origin first (translate by −pivot), turn, and move it back.")],
          [tx(t, "oglRotTri_e5", "(float)(width / height)"), tx(t, "oglRotTri_e5b", "the division is done on integers first and gives 1, so the stretch comes back. Convert before dividing.")],
        ]}
      />
      <p>
        {tx(t, "oglRotTri_next",
          "Next, Drawing a Cube builds the cube in main.cpp. Then Rotating the Cube brings it into spin.cpp, turns it around each axis, combines two turns and lets you spin it with the mouse.")}
      </p>

      <KeyIdeas t={t} id="oglRotTri" items={[
        "A turn is a matrix in the vertex shader: gl_Position = uProjection * uModel * vec4(aPos, 1.0), with uModel = glm::rotate(glm::mat4(1.0f), angle, axis).",
        "glm::rotate wants radians and turns counter-clockwise for a positive angle; glm::radians converts from degrees.",
        "NDC is stretched to the window, so a turning shape changes shape. glm::ortho(-aspect, aspect, -1, 1, -1, 1) makes one unit the same number of pixels both ways.",
        "angle = time × speed spins at a fixed speed. To pause or steer, keep your own angle and add speed × dt every frame.",
        "glm::rotate always turns around the origin. To turn around a pivot: translate(pivot) × rotate × translate(−pivot).",
        "Translate then rotate (in the order written) spins a shape in place; rotate then translate makes it orbit the origin.",
      ]} />
    </Article>
  );
}

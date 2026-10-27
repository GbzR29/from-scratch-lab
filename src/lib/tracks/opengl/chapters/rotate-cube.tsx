"use client";

// OpenGL track — "Rotating the Cube". A hands-on chapter after "Drawing a
// Cube" that continues spin.cpp from "Rotating a Triangle": step 1 swaps the
// triangle for the 8-vertex colour cube (EBO, perspective, view, depth test)
// and shows it is only a square while it turns around z; step 2, one axis at
// a time (figure); step 3, two turns at once, tilt then spin vs spin then
// tilt; step 4, yaw and pitch from a mouse drag; step 5, three cubes and a
// moon sharing a scene matrix. The full spin.cpp, what you see and why,
// mistakes.

import { CodeBlock, Callout, H2, IC, LessonTable } from "@/components/lesson/LessonComponents";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { RotateCubeFigure } from "@/components/lesson/figures/glintro/RotateCubeFigure";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";

export function RotateCubeContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglRotCube_intro",
          "Drawing a Cube made the cube tumble with one line. This chapter takes that line apart. You bring the cube into the spin program of Rotating a Triangle, where the keys already turn things, and try one axis at a time, then two turns at once, then the mouse. At the end, three cubes spin at their own speeds and a small moon circles the middle one.")}
      </Lead>

      <Goals t={t} id="oglRotCube" items={[
        "Predict which faces a cube shows when it turns around x, y or z.",
        "Combine two rotations and choose their order: a turntable or a wobble.",
        "Turn the cube with a mouse drag, using yaw and pitch.",
        "Give several objects their own spin, and make one orbit another.",
      ]} />

      {/* ── WHAT CHANGES ────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_alongTitle", "What this chapter adds to spin.cpp")}</H2>
      <p>
        {tx(t, "oglRotCube_alongBody",
          "It continues spin.cpp from the end of Rotating a Triangle: the triangle that spins, pauses with Space, turns by hand with Left and Right, and picks its axis with X, Y and Z. Your main.cpp is not touched. Run the program after each step; each step says what you should see.")}
      </p>
      <ol className="list-decimal pl-6 space-y-1.5">
        <li>{tx(t, "oglRotCube_along1", "Step 1: the colour cube instead of the triangle, in perspective.")}</li>
        <li>{tx(t, "oglRotCube_along2", "Step 2: one axis at a time, with the keys you already have.")}</li>
        <li>{tx(t, "oglRotCube_along3", "Step 3: two turns at once, in both orders.")}</li>
        <li>{tx(t, "oglRotCube_along4", "Step 4: drag with the mouse to turn it.")}</li>
        <li>{tx(t, "oglRotCube_along5", "Step 5: three cubes and a moon.")}</li>
      </ol>

      {/* ── STEP 1 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_s1Title", "Step 1: the cube instead of the triangle")}</H2>
      <p>
        {tx(t, "oglRotCube_s1a",
          "Use the cube from step 1 of Drawing a Cube: 8 vertices with positions only, 36 indices, coloured by its own position. It has no texture, so spin.cpp needs no image and no stb_image. Replace the triangle's vertices in step 4b:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 4b)" t={t}>{`float vertices[] = {
//     x      y      z
    -0.5f,  0.5f,  0.5f,   // 0: front top-left
    -0.5f, -0.5f,  0.5f,   // 1: front bottom-left
     0.5f, -0.5f,  0.5f,   // 2: front bottom-right
     0.5f,  0.5f,  0.5f,   // 3: front top-right
    -0.5f,  0.5f, -0.5f,   // 4: back  top-left
    -0.5f, -0.5f, -0.5f,   // 5: back  bottom-left
     0.5f, -0.5f, -0.5f,   // 6: back  bottom-right
     0.5f,  0.5f, -0.5f,   // 7: back  top-right
};
GLuint indices[] = {
    0, 1, 2,   0, 2, 3,    // front  (+z)
    7, 6, 5,   7, 5, 4,    // back   (−z)
    3, 2, 6,   3, 6, 7,    // right  (+x)
    4, 5, 1,   4, 1, 0,    // left   (−x)
    4, 0, 3,   4, 3, 7,    // top    (+y)
    1, 5, 6,   1, 6, 2,    // bottom (−y)
};
GLuint vao, vbo, ebo;                       // NEW: ebo
glGenVertexArrays(1, &vao);
glGenBuffers(1, &vbo);
glGenBuffers(1, &ebo);                      // NEW

glBindVertexArray(vao);
glBindBuffer(GL_ARRAY_BUFFER, vbo);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);   // stride: was 6
glEnableVertexAttribArray(0);
// attribute 1 (the colour) is gone: delete its two lines
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);                                     // NEW, while the VAO is bound
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW); // NEW
glBindVertexArray(0);`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s1b",
          "The vertex shader loses aColor and computes the colour from the position instead. It also gets the view matrix from the Transformations + GLM chapter, between the other two:")}
      </p>
      <CodeBlock lang="glsl" filename="vertex shader (in spin.cpp)" t={t}>{`#version 460 core
layout (location = 0) in vec3 aPos;
out vec3 vColor;
uniform mat4 uModel;
uniform mat4 uView;                                                // NEW
uniform mat4 uProjection;
void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPos, 1.0);   // NEW: uView in the middle
    vColor = aPos + 0.5;                                           // NEW: −0.5…0.5 becomes 0…1
}`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s1c",
          "The fragment shader stays as it is. In step 4c, look up the new uniform and switch on the depth test, so the near faces hide the far ones:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 4c)" t={t}>{`GLint viewLoc = glGetUniformLocation(shaderProgram, "uView");   // NEW
glEnable(GL_DEPTH_TEST);                                         // NEW`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s1d",
          "Last, the loop. The flat glm::ortho gives way to glm::perspective, so the faces that come toward you get bigger, and the view matrix steps the camera 3 units back. Both are the ones from the Transformations + GLM chapter. The draw call reads 36 indices:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, in the render loop)" t={t}>{`glm::mat4 projection = glm::perspective(glm::radians(45.0f), aspect, 0.1f, 100.0f);  // was glm::ortho
glm::mat4 view = glm::translate(glm::mat4(1.0f), glm::vec3(0.0f, 0.0f, -3.0f));      // NEW
glm::mat4 model = glm::rotate(glm::mat4(1.0f), angle, axis);                         // unchanged

glUseProgram(shaderProgram);
glUniformMatrix4fv(modelLoc,      1, GL_FALSE, glm::value_ptr(model));
glUniformMatrix4fv(viewLoc,       1, GL_FALSE, glm::value_ptr(view));                // NEW
glUniformMatrix4fv(projectionLoc, 1, GL_FALSE, glm::value_ptr(projection));
glBindVertexArray(vao);
glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, (void*)0);                         // was glDrawArrays(…, 3)`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s1e",
          "In step 6, delete the EBO too: glDeleteBuffers(1, &ebo). Your glClear already clears the depth buffer (GL_DEPTH_BUFFER_BIT), which the depth test needs.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "oglRotCube_s1Run",
          "Run it. Surprise: you see a spinning square, not a cube. It starts with cyan at the top left, blue at the bottom left, magenta at the bottom right and white at the top right. That is the cube's front face. The axis still starts as z, the one that points at you, and a cube turning around it shows only that face. Press Y.")}
      </Callout>

      {/* ── STEP 2 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_s2Title", "Step 2: one axis at a time")}</H2>
      <p>
        {tx(t, "oglRotCube_s2a",
          "There is nothing to type in this step: the X, Y and Z keys from the last chapter already pick the axis. Press each one and watch which faces come round. The figure does the same; pick an axis there and compare.")}
      </p>
      <LessonTable
        headers={[tx(t, "oglRotCube_tKey", "Key"), tx(t, "oglRotCube_tAxis", "Axis"), tx(t, "oglRotCube_tSee", "What you see"), tx(t, "oglRotCube_tNever", "Never faces you")]}
        rows={[
          ["Y", "(0, 1, 0)", tx(t, "oglRotCube_y", "a turntable. The front face slides off to the right and the left face comes round, then the back, then the right."), tx(t, "oglRotCube_yN", "top and bottom")],
          ["X", "(1, 0, 0)", tx(t, "oglRotCube_x", "a wheel rolling toward you. The top face comes down to the front, then the back, then the bottom."), tx(t, "oglRotCube_xN", "left and right")],
          ["Z", "(0, 0, 1)", tx(t, "oglRotCube_z", "the front face turning like a clock hand. It looks flat because the axis points straight at you."), tx(t, "oglRotCube_zN", "all but the front")],
        ]}
      />
      <p>
        {tx(t, "oglRotCube_s2b",
          "So one axis always hides two faces. Press Y, and press Space when two faces share the picture equally, at 45°: the front face on the right, the left face on the left. Hold Left or Right to turn it by hand from there.")}
      </p>

      <RotateCubeFigure t={t} />

      {/* ── STEP 3 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_s3Title", "Step 3: two turns at once")}</H2>
      <p>
        {tx(t, "oglRotCube_s3a",
          "To see the top while the cube spins around y, tilt it toward you as well. That is a second rotate. Replace the model line; the X, Y and Z keys and the axis variable are no longer used, so delete them:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model line)" t={t}>{`glm::mat4 model(1.0f);
model = glm::rotate(model, glm::radians(30.0f), glm::vec3(1.0f, 0.0f, 0.0f)); // 2nd: tilt the top toward you
model = glm::rotate(model, angle,               glm::vec3(0.0f, 1.0f, 0.0f)); // 1st: spin around its own up axis`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s3b",
          "As always, the call written last acts first. So every frame the cube first spins around its own up axis, by angle, and then the whole spun cube is tipped 30° toward you. The tilt comes after the spin, so it is always the same: you look at a turntable from a little above, and the top face never leaves.")}
      </p>
      <p>
        {tx(t, "oglRotCube_s3c",
          "Now swap the two lines and run it again. The tilt acts first, and the spin carries the tilted cube round with it. After half a turn, the side that leaned toward you leans away, and you see the bottom face instead of the top. The cube wobbles, like a coin about to fall over. Same two calls, different order, different motion. In the figure, compare \"tilt, then spin\" with \"spin, then tilt\".")}
      </p>
      <LessonTable
        headers={[tx(t, "oglRotCube_tWritten", "Written order"), tx(t, "oglRotCube_tActs", "Acts on the vertex"), tx(t, "oglRotCube_tMotion", "Motion")]}
        rows={[
          [tx(t, "oglRotCube_o1", "tilt, then spin"), tx(t, "oglRotCube_o1b", "spin first, tilt last"), tx(t, "oglRotCube_o1c", "a turntable seen from above; the top is always visible")],
          [tx(t, "oglRotCube_o2", "spin, then tilt"), tx(t, "oglRotCube_o2b", "tilt first, spin last"), tx(t, "oglRotCube_o2c", "a wobble; top and bottom take turns")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "oglRotCube_s3Run",
          "Put the lines back in the first order and run it: the cube spins like a turntable, seen from a little above, showing its top all the time. Space still pauses it, and Left and Right still turn it by hand.")}
      </Callout>

      {/* ── STEP 4 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_s4Title", "Step 4: turn it with the mouse")}</H2>
      <p>
        {tx(t, "oglRotCube_s4a",
          "The fixed 30° tilt is about to become something you drag. Two angles do it, with names from aircraft: yaw, the turn around the up axis (y), and pitch, the tip toward you or away from you (around x). Dragging right turns the cube right; dragging down tips its top toward you. That is how 3D editors such as Blender turn an object. Add them to the state in step 4, with the mouse position of the last frame:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (end of step 4, before the loop)" t={t}>{`float yaw   = 0.0f;                    // around y, set by dragging sideways
float pitch = glm::radians(30.0f);     // around x, set by dragging up and down; starts as the old tilt
double lastX, lastY;                   // where the mouse was during the last frame
glfwGetCursorPos(window, &lastX, &lastY);`}</CodeBlock>
      <p>{tx(t, "oglRotCube_s4b", "In the loop, after the keys, read the mouse:")}</p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, after the keys)" t={t}>{`double mouseX, mouseY;
glfwGetCursorPos(window, &mouseX, &mouseY);           // from the top-left corner of the window
if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS) {
    float perPixel = glm::radians(0.5f);               // half a degree for every pixel dragged
    yaw   += (float)(mouseX - lastX) * perPixel;       // drag right: turn right
    pitch += (float)(mouseY - lastY) * perPixel;       // drag down: tip the top toward you
    pitch  = glm::clamp(pitch, glm::radians(-90.0f), glm::radians(90.0f));
}
lastX = mouseX;                                        // every frame, pressed or not
lastY = mouseY;`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "oglRotCube_tLine", "Line"), tx(t, "oglRotCube_tDoes", "What it does")]}
        rows={[
          [<IC key="1">{"glfwGetCursorPos"}</IC>, tx(t, "oglRotCube_l1", "the mouse position, measured from the top-left corner of the window. y grows downward, unlike OpenGL's y.")],
          [<IC key="2">{"mouseX - lastX"}</IC>, tx(t, "oglRotCube_l2", "how far the mouse moved since the last frame. lastX is updated every frame, pressed or not, so the first frame of a drag only sees that frame's small move, never a jump from where the last drag ended.")],
          [<IC key="3">{"perPixel"}</IC>, tx(t, "oglRotCube_l3", "the sensitivity: a 180-pixel drag turns the cube 90°. There is no dt here: a mouse move is already a distance, not a speed.")],
          [<IC key="4">{"mouseY - lastY"}</IC>, tx(t, "oglRotCube_l4", "positive when you drag down, because the mouse's y grows downward. A positive pitch around x tips the top face toward you, so dragging down shows the top.")],
          [<IC key="5">{"glm::clamp"}</IC>, tx(t, "oglRotCube_l5", "keeps pitch between −90° and 90°. Past 90° the cube would be upside down, and dragging right would turn it left.")],
        ]}
      />
      <p>{tx(t, "oglRotCube_s4c", "Then the model matrix: pitch takes the place of the fixed tilt, and yaw joins the spin:")}</p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model lines)" t={t}>{`glm::mat4 model(1.0f);
model = glm::rotate(model, pitch, glm::vec3(1.0f, 0.0f, 0.0f));   // 3rd: tip toward you (mouse up and down)
model = glm::rotate(model, yaw,   glm::vec3(0.0f, 1.0f, 0.0f));   // 2nd: turn (mouse sideways)
model = glm::rotate(model, angle, glm::vec3(0.0f, 1.0f, 0.0f));   // 1st: its own spin (Space pauses it)`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s4d",
          "The order is the turntable of step 3, for the same reason: pitch is applied last, so a sideways drag always turns the cube around its own up axis, whatever its tilt. The spin and the yaw are both around y and come one after the other, so they simply add up: yaw is a turn you hold, angle a turn that keeps going.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "oglRotCube_s4Run",
          "Run it, press Space to stop the spin, and drag across the window. Right turns the cube right, down shows its top, up shows its bottom. Release, and it stays where you left it. Press Space again and it spins from there. The \"drag it\" button in the figure works the same way.")}
      </Callout>

      {/* ── STEP 5 ──────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_s5Title", "Step 5: three cubes and a moon")}</H2>
      <p>
        {tx(t, "oglRotCube_s5a",
          "One VAO is enough for many cubes, as the Try it of Drawing a Cube showed: draw it several times, with a different model matrix each time. Each cube gets its own place and its own spin, and the mouse turns them all together. The turn they share goes into a matrix called scene, built once per frame from yaw and pitch. First step the camera back from 3 to 4 units, so there is room for three:")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, in the render loop)" t={t}>{`glm::mat4 view = glm::translate(glm::mat4(1.0f), glm::vec3(0.0f, 0.0f, -4.0f));   // was −3

glm::mat4 scene(1.0f);                                    // the mouse turns everything
scene = glm::rotate(scene, pitch, glm::vec3(1.0f, 0.0f, 0.0f));
scene = glm::rotate(scene, yaw,   glm::vec3(0.0f, 1.0f, 0.0f));`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s5b",
          "Then the draw call becomes a loop. Replace the model lines, the model glUniformMatrix4fv and glDrawElements (view and projection are sent once, before it):")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp (step 5, replaces the model and the draw call)" t={t}>{`glm::vec3 positions[] = {
    glm::vec3(-1.6f, 0.0f, 0.0f),
    glm::vec3( 0.0f, 0.0f, 0.0f),
    glm::vec3( 1.6f, 0.0f, 0.0f),
};
float rates[] = { 0.5f, 1.0f, 2.0f };                     // half, normal and double speed

glBindVertexArray(vao);
for (int i = 0; i < 3; ++i) {
    glm::mat4 model = scene;                                                    // 4th: the mouse turn
    model = glm::translate(model, positions[i]);                                // 3rd: into its place
    model = glm::rotate(model, angle * rates[i], glm::vec3(0.5f, 1.0f, 0.0f));  // 2nd: its own tumble
    model = glm::scale(model, glm::vec3(0.6f));                                 // 1st: a bit smaller
    glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
    glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, (void*)0);
}

// The moon: a small cube that circles the middle one
glm::mat4 moon = scene;                                                 // 5th: the mouse turn
moon = glm::translate(moon, positions[1]);                              // 4th: to the middle cube
moon = glm::rotate(moon, angle * 1.5f, glm::vec3(0.0f, 1.0f, 0.0f));    // 3rd: swing around it
moon = glm::translate(moon, glm::vec3(0.8f, 0.0f, 0.0f));               // 2nd: out to radius 0.8
moon = glm::scale(moon, glm::vec3(0.2f));                               // 1st: small
glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(moon));
glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, (void*)0);`}</CodeBlock>
      <p>
        {tx(t, "oglRotCube_s5c",
          "Read each matrix from the bottom up, the order the vertex meets them. A cube is made smaller, tumbles around the leaning axis of Drawing a Cube, is moved to its place, and only then turned with the rest of the scene. The tumble comes before the move, so each cube spins in place. The moon is the orbit of the last chapter, now in 3D: it is moved out first and turned after, around y, so it circles the middle cube instead of spinning.")}
      </p>
      <p>
        {tx(t, "oglRotCube_s5d",
          "Starting each matrix from scene, not from the identity, is what makes the mouse turn everything at once, around the middle of the scene. The angle is shared too, so Space pauses all four. And as the moon passes behind the middle cube, the depth test hides it, with no extra code.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "oglRotCube_s5Run",
          "Run it: three cubes in a row, the left one tumbling slowly, the right one fast, and a small cube circling the middle one, disappearing behind it and coming back. Drag to turn the whole row; drag down to see it from above, with the moon's circle around the middle cube.")}
      </Callout>

      {/* ── CHECKPOINT ──────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_soFarTitle", "Your spin.cpp so far")}</H2>
      <p>
        {tx(t, "oglRotCube_soFarBody",
          "The whole file after step 5. Compared with the end of Rotating a Triangle, the changes are marked NEW: the colour-cube shaders with uView, the cube's vertices and indices with the EBO, the depth test, the yaw and pitch state, the mouse, the perspective camera and the drawing loop. The X, Y and Z keys are gone. The two shader helpers are shortened because they did not change.")}
      </p>
      <CodeBlock lang="cpp" filename="src/spin.cpp" t={t}>{`#include <glad/glad.h>      // MUST come before glfw3.h
#include <GLFW/glfw3.h>
#include <iostream>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

// ── Shaders ─────────────────────────────────────── NEW: colour from the position, uView
const char* vertexShaderSource = R"(#version 460 core
layout (location = 0) in vec3 aPos;
out vec3 vColor;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPos, 1.0);
    vColor = aPos + 0.5;
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
    // ── 1–3. Window, GLAD, viewport (unchanged) ─────────────────────────────
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

    // 4b. Vertex data → VAO + VBO + EBO            >>> NEW: the colour cube
    float vertices[] = {
    //     x      y      z
        -0.5f,  0.5f,  0.5f,   -0.5f, -0.5f,  0.5f,    0.5f, -0.5f,  0.5f,    0.5f,  0.5f,  0.5f,   // 0–3: front
        -0.5f,  0.5f, -0.5f,   -0.5f, -0.5f, -0.5f,    0.5f, -0.5f, -0.5f,    0.5f,  0.5f, -0.5f,   // 4–7: back
    };
    GLuint indices[] = {
        0, 1, 2,   0, 2, 3,    // front
        7, 6, 5,   7, 5, 4,    // back
        3, 2, 6,   3, 6, 7,    // right
        4, 5, 1,   4, 1, 0,    // left
        4, 0, 3,   4, 3, 7,    // top
        1, 5, 6,   1, 6, 2,    // bottom
    };
    GLuint vao, vbo, ebo;
    glGenVertexArrays(1, &vao);
    glGenBuffers(1, &vbo);
    glGenBuffers(1, &ebo);

    glBindVertexArray(vao);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
    glBindVertexArray(0);
    //                                               <<< end of NEW

    // 4c. Matrix uniforms and depth
    GLint modelLoc      = glGetUniformLocation(shaderProgram, "uModel");
    GLint viewLoc       = glGetUniformLocation(shaderProgram, "uView");          // NEW
    GLint projectionLoc = glGetUniformLocation(shaderProgram, "uProjection");
    glEnable(GL_DEPTH_TEST);                                                     // NEW

    // 4d. The spin and the mouse turn, kept between frames
    float angle        = 0.0f;
    bool  spinning     = true;
    bool  spaceWasDown = false;
    float lastFrame    = (float)glfwGetTime();
    float yaw   = 0.0f;                                   // NEW
    float pitch = glm::radians(30.0f);                    // NEW
    double lastX, lastY;                                  // NEW
    glfwGetCursorPos(window, &lastX, &lastY);             // NEW

    // ── 5. The render loop ───────────────────────────────────────────────────
    while (!glfwWindowShouldClose(window)) {
        if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
            glfwSetWindowShouldClose(window, true);

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

        // >>> NEW: drag to turn
        double mouseX, mouseY;
        glfwGetCursorPos(window, &mouseX, &mouseY);
        if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS) {
            float perPixel = glm::radians(0.5f);
            yaw   += (float)(mouseX - lastX) * perPixel;
            pitch += (float)(mouseY - lastY) * perPixel;
            pitch  = glm::clamp(pitch, glm::radians(-90.0f), glm::radians(90.0f));
        }
        lastX = mouseX;
        lastY = mouseY;
        // <<< end of NEW

        glClearColor(0.06f, 0.07f, 0.10f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // >>> NEW: a perspective camera, and the turn the whole scene shares
        int width, height;
        glfwGetFramebufferSize(window, &width, &height);
        float aspect = height > 0 ? (float)width / (float)height : 1.0f;
        glm::mat4 projection = glm::perspective(glm::radians(45.0f), aspect, 0.1f, 100.0f);
        glm::mat4 view = glm::translate(glm::mat4(1.0f), glm::vec3(0.0f, 0.0f, -4.0f));
        glm::mat4 scene(1.0f);
        scene = glm::rotate(scene, pitch, glm::vec3(1.0f, 0.0f, 0.0f));
        scene = glm::rotate(scene, yaw,   glm::vec3(0.0f, 1.0f, 0.0f));

        glUseProgram(shaderProgram);
        glUniformMatrix4fv(viewLoc,       1, GL_FALSE, glm::value_ptr(view));
        glUniformMatrix4fv(projectionLoc, 1, GL_FALSE, glm::value_ptr(projection));
        glBindVertexArray(vao);

        glm::vec3 positions[] = {
            glm::vec3(-1.6f, 0.0f, 0.0f),
            glm::vec3( 0.0f, 0.0f, 0.0f),
            glm::vec3( 1.6f, 0.0f, 0.0f),
        };
        float rates[] = { 0.5f, 1.0f, 2.0f };
        for (int i = 0; i < 3; ++i) {
            glm::mat4 model = scene;
            model = glm::translate(model, positions[i]);
            model = glm::rotate(model, angle * rates[i], glm::vec3(0.5f, 1.0f, 0.0f));
            model = glm::scale(model, glm::vec3(0.6f));
            glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
            glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, (void*)0);
        }

        glm::mat4 moon = scene;
        moon = glm::translate(moon, positions[1]);
        moon = glm::rotate(moon, angle * 1.5f, glm::vec3(0.0f, 1.0f, 0.0f));
        moon = glm::translate(moon, glm::vec3(0.8f, 0.0f, 0.0f));
        moon = glm::scale(moon, glm::vec3(0.2f));
        glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(moon));
        glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, (void*)0);
        // <<< end of NEW

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // ── 6. Clean up ──────────────────────────────────────────────────────────
    glDeleteVertexArrays(1, &vao);
    glDeleteBuffers(1, &vbo);
    glDeleteBuffers(1, &ebo);                                                    // NEW
    glDeleteProgram(shaderProgram);
    glfwTerminate();
    return 0;
}`}</CodeBlock>

      {/* ── WHAT YOU SEE ────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_seeTitle", "If it does not look right")}</H2>
      <LessonTable
        headers={[tx(t, "oglRotCube_tSeeW", "What you see"), tx(t, "oglRotCube_tCause", "Likely cause")]}
        rows={[
          [tx(t, "oglRotCube_w1", "a square, not a cube"), tx(t, "oglRotCube_w1b", "the cube turns around z, the axis that points at you, or does not turn at all. Press Y, or check the model matrix.")],
          [tx(t, "oglRotCube_w2", "back faces show through the front ones"), tx(t, "oglRotCube_w2b", "glEnable(GL_DEPTH_TEST) is missing, or glClear lacks GL_DEPTH_BUFFER_BIT.")],
          [tx(t, "oglRotCube_w3", "the cube is huge, or nothing is drawn"), tx(t, "oglRotCube_w3b", "the view matrix is missing or moves by +3: the camera sits inside the cube or in front of it, looking away. uView must be set and multiplied in the shader.")],
          [tx(t, "oglRotCube_w4", "dragging turns it the wrong way"), tx(t, "oglRotCube_w4b", "a sign is flipped. Dragging right should add to yaw, dragging down should add to pitch; the mouse's y grows downward.")],
          [tx(t, "oglRotCube_w5", "it jumps when you start dragging"), tx(t, "oglRotCube_w5b", "lastX and lastY are updated only while the button is held, so the first frame of a new drag measures from where the last one ended. Update them every frame.")],
          [tx(t, "oglRotCube_w6", "the cubes swing around the middle instead of spinning in place"), tx(t, "oglRotCube_w6b", "translate and rotate are swapped: each cube is moved first and turned after, so it orbits, which is the moon's recipe. Write translate before rotate.")],
        ]}
      />

      {/* ── MISTAKES ────────────────────────────────────────────────────── */}
      <H2>{tx(t, "oglRotCube_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "oglRotCube_tMistake", "Mistake"), tx(t, "oglRotCube_tFix", "What happens, and the fix")]}
        rows={[
          [tx(t, "oglRotCube_e1", "Writing the rotations in the order they should happen"), tx(t, "oglRotCube_e1b", "GLM's last call acts first. To spin and then tilt, write the tilt first. When a motion looks wrong, swapping two lines is the first thing to try.")],
          [tx(t, "oglRotCube_e2", "Multiplying the mouse move by dt"), tx(t, "oglRotCube_e2b", "a drag is a distance, so the turn should depend only on how far you dragged. With dt, the same drag turns less on a faster machine.")],
          [tx(t, "oglRotCube_e3", "No limit on pitch"), tx(t, "oglRotCube_e3b", "past 90° the cube is upside down and a sideways drag turns it the opposite way. Clamp pitch to ±90°.")],
          [tx(t, "oglRotCube_e4", "Giving each cube its own copy of the mouse turn"), tx(t, "oglRotCube_e4b", "starting each model from the identity and adding yaw and pitch after the translate turns every cube around its own centre, not the row around its middle. Start every model from scene.")],
          [tx(t, "oglRotCube_e5", "Forgetting the EBO in the clean-up"), tx(t, "oglRotCube_e5b", "nothing visible happens: the program ends anyway. But every glGen needs its glDelete, and later programs create buffers while they run.")],
        ]}
      />
      <p>
        {tx(t, "oglRotCube_next",
          "The scene matrix you just built is a camera in disguise: turning the whole world is the same as walking around it. Next, Camera & View Matrix makes that real, back in main.cpp: glm::lookAt, the mouse to look around and the keyboard to walk.")}
      </p>

      <KeyIdeas t={t} id="oglRotCube" items={[
        "Turning around one axis hides two faces: around y you never see the top and bottom, around x never the sides, and around z, the axis pointing at you, a cube looks like a flat square.",
        "Two rotations do not commute. GLM's last call acts first: tilt then spin (written) is a turntable, spin then tilt is a wobble.",
        "Yaw (around y) and pitch (around x) from a mouse drag turn an object like a 3D editor: pitch written first, so it acts last; clamp it to ±90°.",
        "A mouse drag is a distance: multiply it by an angle per pixel, never by dt.",
        "One VAO, many draws: each object gets its own model matrix. Starting each from a shared scene matrix turns them all together.",
        "Move then turn (in the order the vertex meets them) makes an object orbit; turn then move makes it spin in place.",
      ]} />
    </Article>
  );
}

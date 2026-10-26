// src/lib/reference/opengl/legacy.ts
import type { RefEntry } from "../types";

const DEPRECATED = {
  en: "Part of the legacy immediate mode, removed from the core profile in OpenGL 3.2. Shown here only so you can recognize it in old tutorials — use VBOs and VAOs instead.",
  pt: "Faz parte do antigo immediate mode, removido do core profile no OpenGL 3.2. Aparece aqui só para você reconhecê-lo em tutoriais antigos — use VBOs e VAOs.",
};

export const legacyEntries: RefEntry[] = [
  {
    name: "glBegin",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "mode is not a primitive type.", pt: "mode não é um tipo de primitiva." } },
      { code: "GL_INVALID_OPERATION", when: { en: "Called again before the glEnd of the previous glBegin.", pt: "Chamada de novo antes do glEnd do glBegin anterior." } },
    ],
    category: "legacy",
    since: "GL 1.0",
    deprecated: DEPRECATED,
    signature: "void glBegin(GLenum mode);",
    summary: {
      en: "Starts sending vertices one by one from the CPU (immediate mode).",
      pt: "Começa a enviar vértices um por um a partir da CPU (immediate mode).",
    },
    description: {
      en: "In immediate mode, each vertex was a separate function call between glBegin and glEnd. For a mesh with a million vertices that is millions of calls from CPU to driver every frame — the bottleneck that buffers were invented to remove. In modern OpenGL the same data lives in a VBO on the GPU and one draw call renders it.",
      pt: "No immediate mode, cada vértice era uma chamada de função separada entre glBegin e glEnd. Para uma malha com um milhão de vértices são milhões de chamadas da CPU ao driver por frame — o gargalo que os buffers foram criados para eliminar. No OpenGL moderno os mesmos dados ficam em um VBO na GPU e um único draw renderiza tudo.",
    },
    params: [
      { name: "mode", type: "GLenum", desc: { en: "Primitive type: GL_TRIANGLES, GL_QUADS (also removed), GL_LINES…", pt: "Tipo de primitiva: GL_TRIANGLES, GL_QUADS (também removido), GL_LINES…" } },
    ],
    example: `// Legacy — does not work in a core profile context
glBegin(GL_TRIANGLES);
    glColor3f(1, 0, 0); glVertex3f(-0.5f, -0.5f, 0);
    glColor3f(0, 1, 0); glVertex3f( 0.5f, -0.5f, 0);
    glColor3f(0, 0, 1); glVertex3f( 0.0f,  0.5f, 0);
glEnd();`,
    related: ["glEnd", "glVertex3f", "glDrawArrays", "glBufferData"],
  },
  {
    name: "glEnd",
    errors: [
      { code: "GL_INVALID_OPERATION", when: { en: "Called without a glBegin before it.", pt: "Chamada sem um glBegin antes." } },
    ],
    category: "legacy",
    since: "GL 1.0",
    deprecated: DEPRECATED,
    signature: "void glEnd(void);",
    summary: {
      en: "Finishes a glBegin block and draws the vertices sent inside it.",
      pt: "Encerra um bloco glBegin e desenha os vértices enviados dentro dele.",
    },
    description: {
      en: "Closes the block opened by glBegin; the vertices sent in between are assembled into the primitives glBegin asked for. Inside the block only vertex calls were allowed (glVertex, glColor, glNormal, glTexCoord); anything else was an error. Modern code replaces the whole block with one glDrawArrays over a vertex buffer.",
      pt: "Fecha o bloco aberto por glBegin; os vértices enviados no meio são montados nas primitivas que glBegin pediu. Dentro do bloco só eram permitidas chamadas de vértice (glVertex, glColor, glNormal, glTexCoord); qualquer outra coisa era erro. Código moderno troca o bloco inteiro por um glDrawArrays sobre um vertex buffer.",
    },
    params: [],
    example: `glBegin(GL_LINES);
    glVertex3f(0, 0, 0);
    glVertex3f(1, 1, 0);
glEnd();`,
    related: ["glBegin"],
  },
  {
    name: "glVertex3f",
    category: "legacy",
    since: "GL 1.0",
    deprecated: DEPRECATED,
    signature: "void glVertex3f(GLfloat x, GLfloat y, GLfloat z);",
    summary: {
      en: "Emits one vertex position inside a glBegin/glEnd block.",
      pt: "Emite a posição de um vértice dentro de um bloco glBegin/glEnd.",
    },
    description: {
      en: "The vertex takes whatever color, normal and texture coordinate were set last. Today the positions go into a vertex buffer and are described with glVertexAttribPointer.",
      pt: "O vértice usa a última cor, normal e coordenada de textura definidas. Hoje as posições vão para um vertex buffer e são descritas com glVertexAttribPointer.",
    },
    params: [
      { name: "x", type: "GLfloat", desc: { en: "X coordinate.", pt: "Coordenada X." } },
      { name: "y", type: "GLfloat", desc: { en: "Y coordinate.", pt: "Coordenada Y." } },
      { name: "z", type: "GLfloat", desc: { en: "Z coordinate.", pt: "Coordenada Z." } },
    ],
    example: `glVertex3f(0.0f, 0.5f, 0.0f);`,
    related: ["glBegin", "glColor3f", "glVertexAttribPointer"],
  },
  {
    name: "glColor3f",
    category: "legacy",
    since: "GL 1.0",
    deprecated: DEPRECATED,
    signature: "void glColor3f(GLfloat red, GLfloat green, GLfloat blue);",
    summary: {
      en: "Sets the current color used by the following glVertex calls.",
      pt: "Define a cor atual usada pelas próximas chamadas de glVertex.",
    },
    description: {
      en: "In modern OpenGL, per-vertex color is just another vertex attribute in your buffer, and a constant color is a uniform (glUniform4f).",
      pt: "No OpenGL moderno, a cor por vértice é só mais um atributo de vértice no seu buffer, e uma cor constante é um uniform (glUniform4f).",
    },
    params: [
      { name: "red", type: "GLfloat", desc: { en: "Red, 0–1.", pt: "Vermelho, 0–1." } },
      { name: "green", type: "GLfloat", desc: { en: "Green, 0–1.", pt: "Verde, 0–1." } },
      { name: "blue", type: "GLfloat", desc: { en: "Blue, 0–1.", pt: "Azul, 0–1." } },
    ],
    example: `glColor3f(1.0f, 0.5f, 0.2f);`,
    related: ["glVertex3f", "glUniform4f"],
  },
  {
    name: "glVertex2f",
    category: "legacy",
    since: "GL 1.0",
    deprecated: DEPRECATED,
    signature: "void glVertex2f(GLfloat x, GLfloat y);",
    summary: {
      en: "glVertex3f for 2D: emits a vertex at (x, y) with z = 0.",
      pt: "glVertex3f em 2D: emite um vértice em (x, y) com z = 0.",
    },
    description: {
      en: "The suffix tells the shape of the arguments, a naming scheme modern OpenGL kept: 2f = two floats, 3f = three floats, 3fv = a pointer to three floats. glUniform2f follows the same rule.\n\nWhere does (x, y) land? With no matrix set, the coordinates are already the final ones, normalized device coordinates: the window is the square from −1 to 1 on both axes, (0, 0) is its centre and y points up. So glVertex2f(0.0f, 0.5f) is halfway between the centre and the top edge, whatever the size of the window, and a value of 2 is off screen. To use pixels instead, old code set an orthographic projection first: glMatrixMode(GL_PROJECTION) and glOrtho(0, width, height, 0, -1, 1) put (0, 0) at the top-left corner with y pointing down.\n\nglVertex2f is the call that actually emits a vertex. Everything else (glColor3f, glTexCoord2f, glNormal3f) only changes the current value of one attribute, and each glVertex2f takes a copy of all of them at that moment. That is why the colour comes before the vertex it belongs to. glBegin(GL_TRIANGLES) then groups the vertices three by three.\n\nIt only exists in a compatibility context. Most windowing libraries give you one unless you ask otherwise: with GLFW it is the default, and it disappears as soon as you request GLFW_OPENGL_CORE_PROFILE. On macOS, a context of version 3.2 or later is always core; immediate mode is only there in the legacy 2.1 context. A loader such as glad generated for the core profile does not even declare the function, so the code fails to compile.",
      pt: "O sufixo diz a forma dos argumentos, um padrão de nomes que o OpenGL moderno manteve: 2f = dois floats, 3f = três floats, 3fv = um ponteiro para três floats. glUniform2f segue a mesma regra.\n\nOnde o (x, y) cai? Sem nenhuma matriz definida, as coordenadas já são as finais, coordenadas normalizadas do dispositivo: a janela é o quadrado de −1 a 1 nos dois eixos, (0, 0) é o centro e o y aponta para cima. Então glVertex2f(0.0f, 0.5f) fica no meio do caminho entre o centro e a borda de cima, qualquer que seja o tamanho da janela, e um valor 2 fica fora da tela. Para usar pixels, o código antigo definia antes uma projeção ortográfica: glMatrixMode(GL_PROJECTION) e glOrtho(0, width, height, 0, -1, 1) põem o (0, 0) no canto de cima à esquerda, com o y para baixo.\n\nO glVertex2f é a chamada que de fato emite um vértice. Todo o resto (glColor3f, glTexCoord2f, glNormal3f) só muda o valor atual de um atributo, e cada glVertex2f leva uma cópia de todos eles naquele momento. Por isso a cor vem antes do vértice a que pertence. O glBegin(GL_TRIANGLES) então agrupa os vértices de três em três.\n\nEle só existe num contexto de compatibilidade. A maioria das bibliotecas de janela dá um, a menos que você peça outra coisa: no GLFW é o padrão, e ele some assim que você pede GLFW_OPENGL_CORE_PROFILE. No macOS, um contexto de versão 3.2 ou mais nova é sempre core; o immediate mode só existe no contexto legado 2.1. Um loader como o glad gerado para o core profile nem declara a função, então o código não compila.",
    },
    diagram: "immediate",
    params: [
      { name: "x", type: "GLfloat", desc: { en: "X coordinate. Without a projection matrix: −1 is the left edge of the window, 1 the right edge.", pt: "Coordenada X. Sem matriz de projeção: −1 é a borda esquerda da janela, 1 a direita." } },
      { name: "y", type: "GLfloat", desc: { en: "Y coordinate. Without a projection matrix: −1 is the bottom edge, 1 the top. The z of the vertex is 0 and its w is 1.", pt: "Coordenada Y. Sem matriz de projeção: −1 é a borda de baixo, 1 a de cima. O z do vértice é 0 e o w é 1." } },
    ],
    notes: [
      { en: "Only valid between glBegin and glEnd. Outside them the result is undefined (in practice, nothing is drawn) and no error is defined for it, so nothing tells you.", pt: "Só vale entre glBegin e glEnd. Fora deles o resultado é indefinido (na prática, nada é desenhado) e não há erro definido para isso, então nada avisa você." },
      { en: "The integer version does not scale: glVertex2i(1, 0) is x = 1, the right edge, not one pixel. Pixel coordinates need glOrtho, with any suffix.", pt: "A versão inteira não converte escala: glVertex2i(1, 0) é x = 1, a borda direita, não um pixel. Coordenadas em pixels precisam do glOrtho, com qualquer sufixo." },
      { en: "glVertex2fv(p) is the same call with a pointer to two floats, handy when the points are already in an array: for (auto& p : pts) glVertex2fv(&p.x);.", pt: "glVertex2fv(p) é a mesma chamada com um ponteiro para dois floats, útil quando os pontos já estão num array: for (auto& p : pts) glVertex2fv(&p.x);." },
      { en: "One function call per vertex is the reason immediate mode was removed: a model of 100 000 vertices is 100 000 calls or more every frame. A vertex buffer sends them once and draws them with one glDrawArrays.", pt: "Uma chamada de função por vértice é o motivo de o immediate mode ter sido removido: um modelo de 100 000 vértices são 100 000 chamadas ou mais em todo quadro. Um vertex buffer os envia uma vez e os desenha com um glDrawArrays." },
      { en: "Nothing appears on screen? Check, in this order: the context is compatibility, not core; the values are between −1 and 1 (or a glOrtho is set); glClear runs before drawing and not after; and the buffers are swapped (glfwSwapBuffers) at the end of the frame.", pt: "Nada aparece na tela? Confira, nesta ordem: o contexto é de compatibilidade, não core; os valores estão entre −1 e 1 (ou há um glOrtho); o glClear roda antes de desenhar e não depois; e os buffers são trocados (glfwSwapBuffers) no fim do quadro." },
    ],
    example: `glBegin(GL_TRIANGLES);
    glVertex2f(-0.5f, -0.5f);
    glVertex2f( 0.5f, -0.5f);
    glVertex2f( 0.0f,  0.5f);
glEnd();`,
    examples: [
      {
        title: { en: "A complete program: a coloured triangle with GLFW", pt: "Um programa completo: um triângulo colorido com GLFW" },
        filename: "main.cpp",
        code: `#include <GLFW/glfw3.h>    // also includes the system's old <GL/gl.h>

int main() {
    if (!glfwInit()) return 1;
    // No GLFW_OPENGL_PROFILE hint: the default context keeps immediate mode
    GLFWwindow* window = glfwCreateWindow(640, 480, "glVertex2f", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 1; }
    glfwMakeContextCurrent(window);

    while (!glfwWindowShouldClose(window)) {
        glClearColor(0.1f, 0.1f, 0.12f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        glBegin(GL_TRIANGLES);
            glColor3f(1, 0, 0); glVertex2f(-0.5f, -0.5f);   // bottom left, red
            glColor3f(0, 1, 0); glVertex2f( 0.5f, -0.5f);   // bottom right, green
            glColor3f(0, 0, 1); glVertex2f( 0.0f,  0.5f);   // top, blue
        glEnd();

        glfwSwapBuffers(window);
        glfwPollEvents();
    }
    glfwTerminate();
}
// Linux: g++ main.cpp -lglfw -lGL     Windows: link glfw3.lib and opengl32.lib`,
      },
      {
        title: { en: "Pixel coordinates with glOrtho", pt: "Coordenadas em pixels com glOrtho" },
        code: `int w, h;
glfwGetFramebufferSize(window, &w, &h);
glViewport(0, 0, w, h);
glMatrixMode(GL_PROJECTION);
glLoadIdentity();
glOrtho(0, w, h, 0, -1, 1);        // (0, 0) top-left, y down, units = pixels
glMatrixMode(GL_MODELVIEW);
glLoadIdentity();

glBegin(GL_LINE_LOOP);             // a 200 × 100 rectangle outline at (50, 40)
    glVertex2f( 50,  40);
    glVertex2f(250,  40);
    glVertex2f(250, 140);
    glVertex2f( 50, 140);
glEnd();`,
      },
      {
        title: { en: "The same triangle in modern OpenGL", pt: "O mesmo triângulo no OpenGL moderno" },
        code: `// Once, at startup: the three vertices go to the GPU a single time
float verts[] = {
//    x      y     r  g  b
    -0.5f, -0.5f,  1, 0, 0,
     0.5f, -0.5f,  0, 1, 0,
     0.0f,  0.5f,  0, 0, 1,
};
GLuint vao, vbo;
glGenVertexArrays(1, &vao);
glBindVertexArray(vao);
glGenBuffers(1, &vbo);
glBindBuffer(GL_ARRAY_BUFFER, vbo);
glBufferData(GL_ARRAY_BUFFER, sizeof(verts), verts, GL_STATIC_DRAW);
glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);                   // x y
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(2 * sizeof(float))); // r g b
glEnableVertexAttribArray(0);
glEnableVertexAttribArray(1);

// Every frame: one call instead of six
glUseProgram(program);             // a vertex + fragment shader pair, see glCreateShader
glBindVertexArray(vao);
glDrawArrays(GL_TRIANGLES, 0, 3);`,
      },
    ],
    related: ["glVertex3f", "glBegin", "glColor3f", "glMatrixMode", "glVertexAttribPointer", "glUniform2f"],
  },
  {
    name: "glEnableClientState",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "cap is not one of the client array names, such as GL_VERTEX_ARRAY or GL_COLOR_ARRAY.", pt: "cap não é um dos nomes de array do cliente, como GL_VERTEX_ARRAY ou GL_COLOR_ARRAY." } },
    ],
    category: "legacy",
    since: "GL 1.1",
    deprecated: DEPRECATED,
    signature: "void glEnableClientState(GLenum cap);",
    summary: {
      en: "Turned on one of the fixed vertex arrays (positions, colours, normals…) of old OpenGL.",
      pt: "Ligava um dos vertex arrays fixos (posições, cores, normais…) do OpenGL antigo.",
    },
    description: {
      en: "Between immediate mode and modern attributes, OpenGL 1.1 had vertex arrays with fixed roles: GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_NORMAL_ARRAY, GL_TEXTURE_COORD_ARRAY. Each was turned on with this call and described with glVertexPointer, glColorPointer and so on. Today every attribute is generic: glEnableVertexAttribArray(location) plus glVertexAttribPointer, and the shader decides what each one means.",
      pt: "Entre o immediate mode e os atributos modernos, o OpenGL 1.1 tinha vertex arrays com papéis fixos: GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_NORMAL_ARRAY, GL_TEXTURE_COORD_ARRAY. Cada um era ligado com esta chamada e descrito com glVertexPointer, glColorPointer e assim por diante. Hoje todo atributo é genérico: glEnableVertexAttribArray(location) mais glVertexAttribPointer, e o shader decide o que cada um significa.",
    },
    params: [
      { name: "cap", type: "GLenum", desc: { en: "GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_NORMAL_ARRAY or GL_TEXTURE_COORD_ARRAY.", pt: "GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_NORMAL_ARRAY ou GL_TEXTURE_COORD_ARRAY." } },
    ],
    example: `glEnableClientState(GL_VERTEX_ARRAY);
glVertexPointer(3, GL_FLOAT, 0, positions);
glDrawArrays(GL_TRIANGLES, 0, 3);`,
    related: ["glVertexPointer", "glEnableVertexAttribArray", "glVertexAttribPointer"],
  },
  {
    name: "glVertexPointer",
    errors: [
      { code: "GL_INVALID_VALUE", when: { en: "size is not 2, 3 or 4, or stride is negative.", pt: "size não é 2, 3 nem 4, ou stride é negativo." } },
      { code: "GL_INVALID_ENUM", when: { en: "type is not an accepted data type.", pt: "type não é um tipo de dado aceito." } },
    ],
    category: "legacy",
    since: "GL 1.1",
    deprecated: DEPRECATED,
    signature: "void glVertexPointer(GLint size, GLenum type, GLsizei stride, const void *pointer);",
    summary: {
      en: "Described the fixed position array of old OpenGL; the ancestor of glVertexAttribPointer.",
      pt: "Descrevia o array fixo de posições do OpenGL antigo; o ancestral de glVertexAttribPointer.",
    },
    description: {
      en: "The parameters are almost the same as glVertexAttribPointer's (size, type, stride, pointer), minus the location: there was only one position array. Often pointer was CPU memory, copied to the GPU on every draw, which is exactly the cost VBOs removed.",
      pt: "Os parâmetros são quase os mesmos de glVertexAttribPointer (size, type, stride, pointer), sem a location: só havia um array de posições. Muitas vezes pointer era memória da CPU, copiada para a GPU a cada desenho, que é justamente o custo que os VBOs eliminaram.",
    },
    params: [
      { name: "size", type: "GLint", desc: { en: "Coordinates per vertex: 2, 3 or 4.", pt: "Coordenadas por vértice: 2, 3 ou 4." } },
      { name: "type", type: "GLenum", desc: { en: "GL_FLOAT, GL_DOUBLE, GL_INT or GL_SHORT.", pt: "GL_FLOAT, GL_DOUBLE, GL_INT ou GL_SHORT." } },
      { name: "stride", type: "GLsizei", desc: { en: "Bytes between vertices, 0 = packed.", pt: "Bytes entre vértices, 0 = colados." } },
      { name: "pointer", type: "const void *", desc: { en: "CPU array, or an offset into a bound buffer.", pt: "Array na CPU, ou um offset num buffer ligado." } },
    ],
    example: `glVertexPointer(3, GL_FLOAT, 0, positions);`,
    related: ["glEnableClientState", "glVertexAttribPointer"],
  },
  {
    name: "glMatrixMode",
    errors: [
      { code: "GL_INVALID_ENUM", when: { en: "mode is not GL_MODELVIEW, GL_PROJECTION, GL_TEXTURE or GL_COLOR.", pt: "mode não é GL_MODELVIEW, GL_PROJECTION, GL_TEXTURE nem GL_COLOR." } },
      { code: "GL_INVALID_OPERATION", when: { en: "Called between glBegin and glEnd.", pt: "Chamada entre glBegin e glEnd." } },
    ],
    category: "legacy",
    since: "GL 1.0",
    deprecated: DEPRECATED,
    signature: "void glMatrixMode(GLenum mode);",
    summary: {
      en: "Chose which built-in matrix stack (model-view or projection) the old matrix calls changed.",
      pt: "Escolhia qual pilha de matrizes embutida (model-view ou projeção) as chamadas antigas de matriz alteravam.",
    },
    description: {
      en: "Old OpenGL kept the matrices itself. glMatrixMode(GL_PROJECTION) then glFrustum or glOrtho set the camera lens; glMatrixMode(GL_MODELVIEW) then glTranslatef, glRotatef and glScalef moved objects. Modern OpenGL has none of this: you build the matrices yourself (usually with GLM) and send them to the shader with glUniformMatrix4fv, where gl_Position = projection * view * model * position.",
      pt: "O OpenGL antigo guardava as matrizes ele mesmo. glMatrixMode(GL_PROJECTION) e depois glFrustum ou glOrtho definiam a lente da câmera; glMatrixMode(GL_MODELVIEW) e depois glTranslatef, glRotatef e glScalef moviam os objetos. O OpenGL moderno não tem nada disso: você monta as matrizes (normalmente com GLM) e as envia ao shader com glUniformMatrix4fv, onde gl_Position = projection * view * model * position.",
    },
    params: [
      { name: "mode", type: "GLenum", desc: { en: "GL_MODELVIEW, GL_PROJECTION or GL_TEXTURE.", pt: "GL_MODELVIEW, GL_PROJECTION ou GL_TEXTURE." } },
    ],
    example: `// Legacy
glMatrixMode(GL_MODELVIEW);
glLoadIdentity();
glTranslatef(0.0f, 0.0f, -5.0f);
glRotatef(angle, 0.0f, 1.0f, 0.0f);`,
    related: ["glUniformMatrix4fv", "glBegin"],
  },
];

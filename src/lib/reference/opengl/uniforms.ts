// src/lib/reference/opengl/uniforms.ts
import type { RefEntry, RefParam } from "../types";

const KHR = "https://registry.khronos.org/OpenGL-Refpages/gl4/html/";

const LOCATION: RefParam = {
  name: "location", type: "GLint",
  desc: {
    en: "Uniform location from glGetUniformLocation. -1 is silently ignored.",
    pt: "Location do uniform vinda de glGetUniformLocation. -1 é ignorado silenciosamente.",
  },
};

const UNIFORM_ERRORS = [
  { code: "GL_INVALID_OPERATION", when: {
    en: "No program in use, or the function's type/size does not match the uniform declared in GLSL.",
    pt: "Nenhum programa em uso, ou o tipo/tamanho da função não bate com o uniform declarado no GLSL.",
  } },
];

const UNIFORM_NOTE = {
  en: "Uniforms are written to the program currently selected with glUseProgram.",
  pt: "Os uniforms são escritos no programa selecionado no momento com glUseProgram.",
};

export const uniformEntries: RefEntry[] = [
  {
    name: "glGetUniformLocation",
    category: "uniforms",
    since: "GL 2.0",
    signature: "GLint glGetUniformLocation(GLuint program, const GLchar *name);",
    summary: {
      en: "Looks up the location (slot number) of a uniform variable by its GLSL name.",
      pt: "Busca a location (número do slot) de uma variável uniform pelo nome no GLSL.",
    },
    description: {
      en: "Uniforms are values that stay the same for a whole draw call — matrices, colors, time. To set one you need its location, an integer assigned by the linker. This function asks for it by name.\n\nLocations do not change until the program is re-linked, so look them up once and cache them instead of calling this every frame.",
      pt: "Uniforms são valores que ficam iguais durante um draw inteiro — matrizes, cores, tempo. Para definir um você precisa da location dele, um inteiro atribuído pelo linker. Esta função pergunta por ela pelo nome.\n\nAs locations não mudam até o programa ser linkado de novo, então busque uma vez e guarde em cache em vez de chamar todo frame.",
    },
    params: [
      { name: "program", type: "GLuint", desc: { en: "A linked program.", pt: "Um programa linkado." } },
      { name: "name", type: "const GLchar *", desc: { en: "Exact uniform name. Struct members and array elements use GLSL syntax: \"light.color\", \"lights[2].position\".", pt: "Nome exato do uniform. Membros de struct e elementos de array usam sintaxe GLSL: \"light.color\", \"lights[2].position\"." } },
    ],
    returns: {
      en: "The location, or -1 if no ACTIVE uniform has that name.",
      pt: "A location, ou -1 se nenhum uniform ATIVO tiver esse nome.",
    },
    notes: [
      { en: "-1 does not always mean a typo: the compiler removes uniforms that do not affect the output. An unused uniform returns -1 too.", pt: "-1 nem sempre é erro de digitação: o compilador remove uniforms que não afetam o resultado. Um uniform não usado também retorna -1." },
      { en: "With GLSL 4.30+ you can fix locations in the shader with layout(location = N) and skip the lookup.", pt: "Com GLSL 4.30+ você pode fixar locations no shader com layout(location = N) e pular a busca." },
    ],
    errors: [{ code: "GL_INVALID_OPERATION", when: { en: "program has not been linked successfully.", pt: "program não foi linkado com sucesso." } }],
    example: `// once, after linking
GLint uModel = glGetUniformLocation(program, "model");

// every frame
glUseProgram(program);
glUniformMatrix4fv(uModel, 1, GL_FALSE, glm::value_ptr(model));`,
    related: ["glUniform1i", "glUniform1f", "glUniformMatrix4fv", "glUseProgram"],
    khronos: `${KHR}glGetUniformLocation.xhtml`,
  },
  {
    name: "glUniform1i",
    category: "uniforms",
    since: "GL 2.0",
    signature: "void glUniform1i(GLint location, GLint v0);",
    summary: {
      en: "Sets an int, bool or sampler uniform — e.g. tells a sampler which texture unit to read.",
      pt: "Define um uniform int, bool ou sampler — ex.: diz a um sampler qual texture unit ler.",
    },
    description: {
      en: "The suffix of glUniform* encodes the type: 1i = one int. Besides plain ints and bools, this is how samplers are connected: a sampler2D uniform holds the NUMBER of the texture unit it reads from, so glUniform1i(loc, 2) means \"read from GL_TEXTURE2\".",
      pt: "O sufixo de glUniform* indica o tipo: 1i = um int. Além de ints e bools, é assim que samplers são conectados: um uniform sampler2D guarda o NÚMERO da texture unit que ele lê, então glUniform1i(loc, 2) significa \"leia de GL_TEXTURE2\".",
    },
    params: [
      LOCATION,
      { name: "v0", type: "GLint", desc: { en: "The value. For samplers: the texture unit index (0, 1, 2…), NOT the texture ID.", pt: "O valor. Para samplers: o índice da texture unit (0, 1, 2…), NÃO o ID da textura." } },
    ],
    notes: [
      UNIFORM_NOTE,
      { en: "Passing the texture ID instead of the unit number is a very common bug.", pt: "Passar o ID da textura em vez do número da unit é um bug muito comum." },
    ],
    errors: UNIFORM_ERRORS,
    example: `glUseProgram(program);
glUniform1i(glGetUniformLocation(program, "diffuseMap"),  0); // GL_TEXTURE0
glUniform1i(glGetUniformLocation(program, "specularMap"), 1); // GL_TEXTURE1`,
    related: ["glActiveTexture", "glUniform1f", "glGetUniformLocation"],
    khronos: `${KHR}glUniform.xhtml`,
  },
  {
    name: "glUniform1f",
    category: "uniforms",
    since: "GL 2.0",
    signature: "void glUniform1f(GLint location, GLfloat v0);",
    summary: {
      en: "Sets a float uniform.",
      pt: "Define um uniform float.",
    },
    description: {
      en: "Sets one float — typical uses are time for animations, a shininess exponent, or a mix factor.",
      pt: "Define um float — usos típicos são o tempo para animações, um expoente de brilho ou um fator de mistura.",
    },
    params: [
      LOCATION,
      { name: "v0", type: "GLfloat", desc: { en: "The value.", pt: "O valor." } },
    ],
    notes: [UNIFORM_NOTE],
    errors: UNIFORM_ERRORS,
    example: `glUniform1f(uTime, (float)glfwGetTime());`,
    related: ["glUniform1i", "glUniform3fv", "glGetUniformLocation"],
    khronos: `${KHR}glUniform.xhtml`,
  },
  {
    name: "glUniform3fv",
    category: "uniforms",
    since: "GL 2.0",
    signature: "void glUniform3fv(GLint location, GLsizei count, const GLfloat *value);",
    summary: {
      en: "Sets a vec3 uniform (or an array of them) from a pointer.",
      pt: "Define um uniform vec3 (ou um array deles) a partir de um ponteiro.",
    },
    description: {
      en: "The v suffix means \"vector\": values come from a pointer instead of separate arguments. With GLM you pass glm::value_ptr(v) or &v[0]. count lets you upload a whole vec3 array in one call.",
      pt: "O sufixo v significa \"vetor\": os valores vêm de um ponteiro em vez de argumentos separados. Com GLM você passa glm::value_ptr(v) ou &v[0]. count permite enviar um array inteiro de vec3 em uma chamada.",
    },
    params: [
      LOCATION,
      { name: "count", type: "GLsizei", desc: { en: "How many vec3 to set: 1 for a single vec3, N for an array.", pt: "Quantos vec3 definir: 1 para um vec3, N para um array." } },
      { name: "value", type: "const GLfloat *", desc: { en: "Pointer to 3 × count floats.", pt: "Ponteiro para 3 × count floats." } },
    ],
    notes: [UNIFORM_NOTE],
    errors: UNIFORM_ERRORS,
    example: `glm::vec3 lightPos(1.2f, 1.0f, 2.0f);
glUniform3fv(uLightPos, 1, glm::value_ptr(lightPos));`,
    related: ["glUniform4f", "glUniform1f", "glUniformMatrix4fv"],
    khronos: `${KHR}glUniform.xhtml`,
  },
  {
    name: "glUniform4f",
    category: "uniforms",
    since: "GL 2.0",
    signature: "void glUniform4f(GLint location, GLfloat v0, GLfloat v1, GLfloat v2, GLfloat v3);",
    summary: {
      en: "Sets a vec4 uniform from four separate floats.",
      pt: "Define um uniform vec4 a partir de quatro floats separados.",
    },
    description: {
      en: "Writes the four values into a vec4 uniform of the program in use; the typical case is a colour with alpha, uniform vec4 uColor. Changing it every frame from the CPU (a colour that pulses with time) is the first animation many people write.\n\nThe four values go in as written: for a colour they are red, green, blue and alpha from 0 to 1, not 0 to 255.",
      pt: "Escreve os quatro valores num uniform vec4 do programa em uso; o caso típico é uma cor com alfa, uniform vec4 uColor. Mudá-lo a cada frame pela CPU (uma cor que pulsa com o tempo) é a primeira animação que muita gente escreve.\n\nOs quatro valores entram como escritos: numa cor são vermelho, verde, azul e alfa de 0 a 1, não de 0 a 255.",
    },
    params: [
      LOCATION,
      { name: "v0", type: "GLfloat", desc: { en: "x / r component.", pt: "Componente x / r." } },
      { name: "v1", type: "GLfloat", desc: { en: "y / g component.", pt: "Componente y / g." } },
      { name: "v2", type: "GLfloat", desc: { en: "z / b component.", pt: "Componente z / b." } },
      { name: "v3", type: "GLfloat", desc: { en: "w / a component.", pt: "Componente w / a." } },
    ],
    notes: [UNIFORM_NOTE],
    errors: UNIFORM_ERRORS,
    example: `float green = (std::sin(glfwGetTime()) / 2.0f) + 0.5f;
glUniform4f(uColor, 0.0f, green, 0.0f, 1.0f);`,
    related: ["glUniform3fv", "glGetUniformLocation"],
    khronos: `${KHR}glUniform.xhtml`,
  },
  {
    name: "glUniformMatrix3fv",
    category: "uniforms",
    since: "GL 2.0",
    signature: "void glUniformMatrix3fv(GLint location, GLsizei count,\n                        GLboolean transpose, const GLfloat *value);",
    summary: {
      en: "Sets a mat3 uniform — most often the normal matrix.",
      pt: "Define um uniform mat3 — na maioria das vezes a normal matrix.",
    },
    description: {
      en: "Normals must not be moved by translation and must stay perpendicular after non-uniform scaling. The fix is the normal matrix, transpose(inverse(mat3(model))), usually computed on the CPU and uploaded with this call.",
      pt: "Normais não podem ser afetadas por translação e precisam continuar perpendiculares depois de uma escala não uniforme. A solução é a normal matrix, transpose(inverse(mat3(model))), normalmente calculada na CPU e enviada com esta chamada.",
    },
    params: [
      LOCATION,
      { name: "count", type: "GLsizei", desc: { en: "Number of matrices (1 unless the uniform is an array).", pt: "Número de matrizes (1 a menos que o uniform seja um array)." } },
      { name: "transpose", type: "GLboolean", desc: { en: "GL_FALSE for GLM/column-major data.", pt: "GL_FALSE para dados GLM/column-major." } },
      { name: "value", type: "const GLfloat *", desc: { en: "Pointer to 9 × count floats.", pt: "Ponteiro para 9 × count floats." } },
    ],
    notes: [UNIFORM_NOTE],
    errors: UNIFORM_ERRORS,
    example: `glm::mat3 normalMatrix = glm::transpose(glm::inverse(glm::mat3(model)));
glUniformMatrix3fv(uNormalMatrix, 1, GL_FALSE, glm::value_ptr(normalMatrix));`,
    related: ["glUniformMatrix4fv"],
    khronos: `${KHR}glUniform.xhtml`,
  },
  {
    name: "glUniformMatrix4fv",
    category: "uniforms",
    since: "GL 2.0",
    signature: "void glUniformMatrix4fv(GLint location, GLsizei count,\n                        GLboolean transpose, const GLfloat *value);",
    summary: {
      en: "Sets a mat4 uniform — how model, view and projection matrices reach the shader.",
      pt: "Define um uniform mat4 — é assim que as matrizes model, view e projection chegam ao shader.",
    },
    description: {
      en: "Uploads one or more 4×4 float matrices. OpenGL and GLM both store matrices column by column (column-major), so with GLM transpose is always GL_FALSE and you pass glm::value_ptr(m).",
      pt: "Envia uma ou mais matrizes 4×4 de float. O OpenGL e o GLM guardam matrizes coluna por coluna (column-major), então com GLM transpose é sempre GL_FALSE e você passa glm::value_ptr(m).",
    },
    params: [
      LOCATION,
      { name: "count", type: "GLsizei", desc: { en: "Number of matrices. 1 for a single mat4; N for mat4 bones[N].", pt: "Número de matrizes. 1 para um mat4; N para mat4 bones[N]." } },
      { name: "transpose", type: "GLboolean", desc: { en: "GL_TRUE if your data is row-major. With GLM: GL_FALSE.", pt: "GL_TRUE se seus dados são row-major. Com GLM: GL_FALSE." } },
      { name: "value", type: "const GLfloat *", desc: { en: "Pointer to 16 × count floats.", pt: "Ponteiro para 16 × count floats." } },
    ],
    notes: [
      UNIFORM_NOTE,
      { en: "Sending the same projection and view to many programs? Put them in a uniform buffer instead.", pt: "Enviando a mesma projection e view para vários programas? Coloque-as em um uniform buffer." },
    ],
    errors: UNIFORM_ERRORS,
    example: `glm::mat4 projection = glm::perspective(glm::radians(45.0f), aspect, 0.1f, 100.0f);
glUniformMatrix4fv(uProjection, 1, GL_FALSE, glm::value_ptr(projection));`,
    related: ["glUniformMatrix3fv", "glGetUniformLocation", "glBindBufferBase"],
    khronos: `${KHR}glUniform.xhtml`,
  },
  {
    name: "glGetUniformBlockIndex",
    errors: [
      { code: "GL_INVALID_VALUE", when: { en: "program is not a name generated by OpenGL.", pt: "program não é um nome gerado pelo OpenGL." } },
      { code: "GL_INVALID_OPERATION", when: { en: "program is not a program object, or glLinkProgram has never been called on it. A wrong or unused block name is not an error: the call returns GL_INVALID_INDEX.", pt: "program não é um program object, ou o glLinkProgram nunca foi chamado nele. Um nome de bloco errado ou não usado não é erro: a chamada devolve GL_INVALID_INDEX." } },
    ],
    category: "uniforms",
    since: "GL 3.1",
    signature: "GLuint glGetUniformBlockIndex(GLuint program, const GLchar *uniformBlockName);",
    summary: {
      en: "Finds the index of a named uniform block inside a program.",
      pt: "Encontra o índice de um uniform block pelo nome dentro de um programa.",
    },
    description: {
      en: "A uniform block groups uniforms whose values come from a buffer (a UBO) instead of glUniform* calls. To connect a block to a binding point on older GLSL, you first need its index — that is what this returns. Then glUniformBlockBinding connects index → binding point.\n\nThe index and the binding point are two different numbers, and mixing them up is the usual bug. The index is chosen by the linker, separately in each program, in no order you can rely on: a block can be index 0 in one program and index 1 in another. The binding point is a slot number you choose, and it is shared by all programs. Code that passes the index straight to glBindBufferBase works by luck while every program happens to give index 0, and breaks when a second block is added.\n\nThe usual setup runs once after each link: look up the index by name, connect it to a fixed binding point (0 for the camera, 1 for the lights…), and bind each buffer to its point with glBindBufferBase. From then on, updating the buffer updates every program that reads that point.",
      pt: "Um uniform block agrupa uniforms cujos valores vêm de um buffer (um UBO) em vez de chamadas glUniform*. Para ligar um bloco a um binding point em GLSL mais antigo, primeiro você precisa do índice dele — é isso que esta função retorna. Depois glUniformBlockBinding conecta índice → binding point.\n\nO índice e o binding point são dois números diferentes, e confundir os dois é o bug de sempre. O índice é escolhido pelo linker, separadamente em cada programa, numa ordem em que não dá para confiar: um bloco pode ser o índice 0 num programa e o índice 1 em outro. O binding point é um número de slot que você escolhe, e é comum a todos os programas. Um código que passa o índice direto para o glBindBufferBase funciona por sorte enquanto todo programa por acaso dá o índice 0, e quebra quando um segundo bloco é adicionado.\n\nA configuração de sempre roda uma vez depois de cada link: procure o índice pelo nome, ligue-o a um binding point fixo (0 para a câmera, 1 para as luzes…) e ligue cada buffer ao seu ponto com glBindBufferBase. Daí em diante, atualizar o buffer atualiza todo programa que lê aquele ponto.",
    },
    diagram: "uniformBlocks",
    params: [
      { name: "program", type: "GLuint", desc: { en: "A program that glLinkProgram has already been called on. Before any link the program has no blocks yet, and the call is a GL_INVALID_OPERATION.", pt: "Um programa em que o glLinkProgram já foi chamado. Antes de qualquer link o programa ainda não tem blocos, e a chamada dá GL_INVALID_OPERATION." } },
      { name: "uniformBlockName", type: "const GLchar *", desc: { en: "Block name as declared in GLSL: the name before the braces, not the instance name after them. In `uniform Matrices { mat4 view; } cam;` it is \"Matrices\". For an array of blocks, name one element: \"Lights[2]\".", pt: "Nome do bloco como declarado no GLSL: o nome antes das chaves, não o nome da instância depois delas. Em `uniform Matrices { mat4 view; } cam;` é \"Matrices\". Para um array de blocos, nomeie um elemento: \"Lights[2]\"." } },
    ],
    returns: {
      en: "The block index, or GL_INVALID_INDEX if not found. GL_INVALID_INDEX is 0xFFFFFFFF, the largest GLuint.",
      pt: "O índice do bloco, ou GL_INVALID_INDEX se não for encontrado. GL_INVALID_INDEX é 0xFFFFFFFF, o maior GLuint.",
    },
    notes: [
      { en: "With GLSL 4.20+, layout(std140, binding = N) sets the binding in the shader and both calls become unnecessary.", pt: "Com GLSL 4.20+, layout(std140, binding = N) define o binding no shader e as duas chamadas deixam de ser necessárias." },
      { en: "The result is unsigned, so `if (idx < 0)` is never true and lets a missing block through. Compare with GL_INVALID_INDEX.", pt: "O resultado é sem sinal, então `if (idx < 0)` nunca é verdadeiro e deixa passar um bloco que falta. Compare com GL_INVALID_INDEX." },
      { en: "A block the shader declares but never reads is removed by the compiler, exactly like an unused uniform, and then it is \"not found\". Getting GL_INVALID_INDEX for a name you are sure is right usually means the code that reads it was commented out.", pt: "Um bloco que o shader declara mas nunca lê é removido pelo compilador, exatamente como um uniform sem uso, e aí ele \"não é encontrado\". Receber GL_INVALID_INDEX para um nome que você tem certeza que está certo costuma significar que o código que o lê foi comentado." },
      { en: "This finds uniform blocks only. A buffer block (`buffer Particles { … };`, an SSBO) is looked up with glGetProgramResourceIndex(program, GL_SHADER_STORAGE_BLOCK, name).", pt: "Isto acha só uniform blocks. Um buffer block (`buffer Particles { … };`, um SSBO) é procurado com glGetProgramResourceIndex(program, GL_SHADER_STORAGE_BLOCK, name)." },
      { en: "To size the buffer, ask the program instead of adding up sizeof by hand: glGetActiveUniformBlockiv(program, idx, GL_UNIFORM_BLOCK_DATA_SIZE, &size) returns the bytes the block really takes, padding included.", pt: "Para dimensionar o buffer, pergunte ao programa em vez de somar sizeof na mão: glGetActiveUniformBlockiv(program, idx, GL_UNIFORM_BLOCK_DATA_SIZE, &size) devolve os bytes que o bloco ocupa de verdade, com o preenchimento." },
    ],
    example: `GLuint idx = glGetUniformBlockIndex(program, "Matrices");
glUniformBlockBinding(program, idx, 0);`,
    examples: [
      {
        title: { en: "The shader side", pt: "O lado do shader" },
        filename: "shader.vert",
        lang: "glsl",
        code: `#version 330 core
layout(std140) uniform Matrices {   // "Matrices" is the name to look up
    mat4 projection;
    mat4 view;
};                                  // no instance name: use projection, view directly

layout(location = 0) in vec3 aPos;
uniform mat4 model;

void main() {
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}`,
      },
      {
        title: { en: "One camera buffer for every program", pt: "Um buffer de câmera para todos os programas" },
        code: `constexpr GLuint CAMERA_BINDING = 0;          // a slot number you choose

// After each glLinkProgram: connect the program's block to the slot
for (GLuint prog : { litShader, skyShader, debugShader }) {
    GLuint idx = glGetUniformBlockIndex(prog, "Matrices");
    if (idx == GL_INVALID_INDEX) {             // wrong name, or the block is unused
        std::fprintf(stderr, "program %u has no block Matrices\\n", prog);
        continue;
    }
    glUniformBlockBinding(prog, idx, CAMERA_BINDING);
}

// Once: the buffer, plugged into the same slot
GLuint ubo;
glGenBuffers(1, &ubo);
glBindBuffer(GL_UNIFORM_BUFFER, ubo);
glBufferData(GL_UNIFORM_BUFFER, 2 * sizeof(glm::mat4), nullptr, GL_DYNAMIC_DRAW);
glBindBufferBase(GL_UNIFORM_BUFFER, CAMERA_BINDING, ubo);

// Every frame: write the matrices once, all three programs see them
glBindBuffer(GL_UNIFORM_BUFFER, ubo);
glBufferSubData(GL_UNIFORM_BUFFER, 0,                 sizeof(glm::mat4), glm::value_ptr(projection));
glBufferSubData(GL_UNIFORM_BUFFER, sizeof(glm::mat4), sizeof(glm::mat4), glm::value_ptr(view));`,
      },
      {
        title: { en: "GLSL 4.20 and later: no lookup at all", pt: "GLSL 4.20 em diante: sem procurar nada" },
        filename: "shader.vert",
        lang: "glsl",
        code: `#version 420 core
layout(std140, binding = 0) uniform Matrices {   // the slot is written here
    mat4 projection;
    mat4 view;
};
// C++ only needs glBindBufferBase(GL_UNIFORM_BUFFER, 0, ubo)`,
      },
    ],
    related: ["glUniformBlockBinding", "glBindBufferBase", "glBufferSubData", "glGetUniformLocation"],
    khronos: `${KHR}glGetUniformBlockIndex.xhtml`,
  },
  {
    name: "glUniformBlockBinding",
    category: "uniforms",
    since: "GL 3.1",
    signature: "void glUniformBlockBinding(GLuint program, GLuint uniformBlockIndex,\n                           GLuint uniformBlockBinding);",
    summary: {
      en: "Connects a uniform block of a program to a numbered binding point.",
      pt: "Conecta um uniform block de um programa a um binding point numerado.",
    },
    description: {
      en: "Picture a row of numbered sockets. A buffer is plugged into socket N with glBindBufferBase(GL_UNIFORM_BUFFER, N, ubo). A program's block reads from socket N after glUniformBlockBinding(program, blockIndex, N). Many programs can read the same socket, so one camera UBO serves every shader.",
      pt: "Imagine uma fileira de tomadas numeradas. Um buffer é plugado na tomada N com glBindBufferBase(GL_UNIFORM_BUFFER, N, ubo). O bloco de um programa lê da tomada N depois de glUniformBlockBinding(program, blockIndex, N). Vários programas podem ler a mesma tomada, então um único UBO de câmera atende todos os shaders.",
    },
    params: [
      { name: "program", type: "GLuint", desc: { en: "Linked program.", pt: "Programa linkado." } },
      { name: "uniformBlockIndex", type: "GLuint", desc: { en: "Index from glGetUniformBlockIndex.", pt: "Índice vindo de glGetUniformBlockIndex." } },
      { name: "uniformBlockBinding", type: "GLuint", desc: { en: "Binding point number (socket).", pt: "Número do binding point (tomada)." } },
    ],
    errors: [
      { code: "GL_INVALID_VALUE", when: { en: "Index is not a valid block, or the binding is ≥ GL_MAX_UNIFORM_BUFFER_BINDINGS.", pt: "O índice não é um bloco válido, ou o binding é ≥ GL_MAX_UNIFORM_BUFFER_BINDINGS." } },
    ],
    notes: [
      { en: "Since GLSL 4.20 you can write the binding in the shader, layout(std140, binding = 0) uniform Matrices { … };, and skip both glGetUniformBlockIndex and this call.", pt: "Desde o GLSL 4.20 dá para escrever o binding no shader, layout(std140, binding = 0) uniform Matrices { … };, e pular glGetUniformBlockIndex e esta chamada." },
      { en: "The binding is stored in the program and reset by glLinkProgram. Call it after every link, not once at startup before linking.", pt: "O binding fica guardado no programa e é zerado pelo glLinkProgram. Chame depois de cada link, não uma vez no início antes de linkar." },
      { en: "glGetUniformBlockIndex returns GL_INVALID_INDEX when the block name is wrong or the block is unused and was removed. Passing that on is a GL_INVALID_VALUE.", pt: "glGetUniformBlockIndex devolve GL_INVALID_INDEX quando o nome do bloco está errado ou o bloco não é usado e foi removido. Passar isso adiante dá GL_INVALID_VALUE." },
    ],
    example: `for (GLuint prog : { shaderRed, shaderGreen, shaderBlue }) {
    GLuint idx = glGetUniformBlockIndex(prog, "Matrices");
    glUniformBlockBinding(prog, idx, 0);
}
glBindBufferBase(GL_UNIFORM_BUFFER, 0, uboMatrices);`,
    related: ["glGetUniformBlockIndex", "glBindBufferBase", "glBindBufferRange"],
    khronos: `${KHR}glUniformBlockBinding.xhtml`,
  },
];

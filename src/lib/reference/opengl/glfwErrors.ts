// src/lib/reference/opengl/glfwErrors.ts
// The GLFW 3.4 error codes the function pages list, as reported by glfwGetError
// or the error callback (GLFW never returns them from the call itself).

type GlfwError = { code: string; when: { en: string; pt: string } };

export const NOT_INITIALIZED: GlfwError = {
  code: "GLFW_NOT_INITIALIZED",
  when: { en: "Called before glfwInit or after glfwTerminate.", pt: "Chamada antes de glfwInit ou depois de glfwTerminate." },
};

export const PLATFORM_ERROR: GlfwError = {
  code: "GLFW_PLATFORM_ERROR",
  when: { en: "The operating system or window system reported a failure; the description says which.", pt: "O sistema operacional ou o sistema de janelas relatou uma falha; a descrição diz qual." },
};

export const INVALID_ENUM: GlfwError = {
  code: "GLFW_INVALID_ENUM",
  when: { en: "A hint, mode, key or button argument is not a valid GLFW constant.", pt: "Um argumento de hint, modo, tecla ou botão não é uma constante válida do GLFW." },
};

export const INVALID_VALUE: GlfwError = {
  code: "GLFW_INVALID_VALUE",
  when: { en: "A value is out of range, such as a size of zero or a context version that does not exist.", pt: "Um valor está fora do intervalo, como tamanho zero ou uma versão de contexto que não existe." },
};

export const NO_CURRENT_CONTEXT: GlfwError = {
  code: "GLFW_NO_CURRENT_CONTEXT",
  when: { en: "No OpenGL context is current on this thread: call glfwMakeContextCurrent first.", pt: "Nenhum contexto OpenGL está atual nesta thread: chame glfwMakeContextCurrent antes." },
};

export const NO_WINDOW_CONTEXT: GlfwError = {
  code: "GLFW_NO_WINDOW_CONTEXT",
  when: { en: "The window was created with GLFW_CLIENT_API set to GLFW_NO_API, so it has no context.", pt: "A janela foi criada com GLFW_CLIENT_API igual a GLFW_NO_API, então não tem contexto." },
};

export const FEATURE_UNAVAILABLE: GlfwError = {
  code: "GLFW_FEATURE_UNAVAILABLE",
  when: { en: "This platform cannot do it; Wayland, for example, does not let a program move its windows.", pt: "Esta plataforma não permite; o Wayland, por exemplo, não deixa um programa mover suas janelas." },
};

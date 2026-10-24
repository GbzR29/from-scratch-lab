// src/lib/reference/sdl3/gamepad.ts
// SDL 3.2: gamepads with a standard layout (Xbox / PlayStation / Switch style).
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const gamepadEntries: RefEntry[] = [
  {
    name: "SDL_OpenGamepad",
    category: "gamepad",
    since: "SDL 3.2",
    signature: "SDL_Gamepad * SDL_OpenGamepad(SDL_JoystickID instance_id);",
    summary: {
      en: "Opens a connected gamepad so you can read its sticks and buttons.",
      pt: "Abre um controle conectado para você ler os analógicos e os botões.",
    },
    description: {
      en: "SDL knows the layout of hundreds of controllers and maps them all to one standard pad: two sticks, two triggers, a D-pad and four face buttons named by position (SOUTH, EAST, WEST, NORTH). Your code reads SOUTH and works with an Xbox A, a PlayStation Cross and a Switch B alike.\n\nOpen pads when they arrive: SDL sends SDL_EVENT_GAMEPAD_ADDED for every pad already plugged in at startup and for every one plugged in later, with the ID in `e.gdevice.which`. Requires SDL_INIT_GAMEPAD.",
      pt: "O SDL conhece o layout de centenas de controles e mapeia todos para um controle padrão: dois analógicos, dois gatilhos, um direcional e quatro botões de face nomeados pela posição (SOUTH, EAST, WEST, NORTH). O seu código lê SOUTH e funciona igual com o A do Xbox, o X do PlayStation e o B do Switch.\n\nAbra os controles quando eles chegam: o SDL envia SDL_EVENT_GAMEPAD_ADDED para cada controle já conectado na partida e para cada um conectado depois, com o ID em `e.gdevice.which`. Precisa de SDL_INIT_GAMEPAD.",
    },
    params: [
      { name: "instance_id", type: "SDL_JoystickID", desc: { en: "The device ID, from `e.gdevice.which`.", pt: "O ID do dispositivo, de `e.gdevice.which`." } },
    ],
    returns: { en: "The gamepad, or NULL on failure.", pt: "O controle, ou NULL se falhar." },
    example: `case SDL_EVENT_GAMEPAD_ADDED:
    if (!pad) pad = SDL_OpenGamepad(e.gdevice.which);
    break;
case SDL_EVENT_GAMEPAD_REMOVED:
    if (pad && SDL_GetGamepadID(pad) == e.gdevice.which) {
        SDL_CloseGamepad(pad);
        pad = nullptr;
    }
    break;`,
    related: ["SDL_CloseGamepad", "SDL_GetGamepadAxis", "SDL_GetGamepadButton"],
    khronos: `${WIKI}SDL_OpenGamepad`,
  },
  {
    name: "SDL_CloseGamepad",
    category: "gamepad",
    since: "SDL 3.2",
    signature: "void SDL_CloseGamepad(SDL_Gamepad *gamepad);",
    summary: {
      en: "Closes a gamepad you opened, e.g. when it is unplugged.",
      pt: "Fecha um controle que você abriu, ex.: quando ele é desconectado.",
    },
    description: {
      en: "After SDL_EVENT_GAMEPAD_REMOVED the pointer is useless: close it and forget it. Pads still open at the end are closed by SDL_Quit.",
      pt: "Depois de SDL_EVENT_GAMEPAD_REMOVED o ponteiro não serve mais: feche e esqueça. Controles ainda abertos no fim são fechados por SDL_Quit.",
    },
    params: [
      { name: "gamepad", type: "SDL_Gamepad *", desc: { en: "The gamepad to close.", pt: "O controle a fechar." } },
    ],
    example: `SDL_CloseGamepad(pad);
pad = nullptr;`,
    related: ["SDL_OpenGamepad"],
    khronos: `${WIKI}SDL_CloseGamepad`,
  },
  {
    name: "SDL_GetGamepadAxis",
    category: "gamepad",
    since: "SDL 3.2",
    signature: "Sint16 SDL_GetGamepadAxis(SDL_Gamepad *gamepad, SDL_GamepadAxis axis);",
    summary: {
      en: "Reads a stick or trigger position as a 16-bit integer.",
      pt: "Lê a posição de um analógico ou gatilho como um inteiro de 16 bits.",
    },
    description: {
      en: "Sticks go from -32768 to 32767, with 0 at rest; divide by 32767.0f to get about -1..1. Positive Y is DOWN. Triggers go from 0 (released) to 32767 (fully pressed).\n\nA stick at rest rarely reads exactly 0: worn pads drift a little. Ignore values below a \"dead zone\" (around 0.15 of full range), or the character creeps on its own.",
      pt: "Os analógicos vão de -32768 a 32767, com 0 em repouso; divida por 32767.0f para ter mais ou menos -1..1. Y positivo é PARA BAIXO. Os gatilhos vão de 0 (solto) a 32767 (apertado até o fim).\n\nUm analógico em repouso raramente lê exatamente 0: controles gastos derivam um pouco. Ignore valores abaixo de uma \"zona morta\" (por volta de 0,15 do total), senão o personagem anda sozinho.",
    },
    params: [
      { name: "gamepad", type: "SDL_Gamepad *", desc: { en: "The gamepad.", pt: "O controle." } },
      {
        name: "axis",
        type: "SDL_GamepadAxis",
        desc: { en: "Which axis.", pt: "Qual eixo." },
        values: [
          { name: "SDL_GAMEPAD_AXIS_LEFTX / _LEFTY", desc: { en: "Left stick.", pt: "Analógico esquerdo." } },
          { name: "SDL_GAMEPAD_AXIS_RIGHTX / _RIGHTY", desc: { en: "Right stick.", pt: "Analógico direito." } },
          { name: "SDL_GAMEPAD_AXIS_LEFT_TRIGGER / _RIGHT_TRIGGER", desc: { en: "Triggers, 0..32767.", pt: "Gatilhos, 0..32767." } },
        ],
      },
    ],
    returns: { en: "The axis value, or 0 on failure.", pt: "O valor do eixo, ou 0 se falhar." },
    example: `float lx = SDL_GetGamepadAxis(pad, SDL_GAMEPAD_AXIS_LEFTX) / 32767.0f;
float ly = SDL_GetGamepadAxis(pad, SDL_GAMEPAD_AXIS_LEFTY) / 32767.0f;
if (std::hypot(lx, ly) < 0.15f) lx = ly = 0.0f;   // dead zone
player.move(lx, ly);`,
    related: ["SDL_GetGamepadButton", "SDL_OpenGamepad"],
    khronos: `${WIKI}SDL_GetGamepadAxis`,
  },
  {
    name: "SDL_GetGamepadButton",
    category: "gamepad",
    since: "SDL 3.2",
    signature: "bool SDL_GetGamepadButton(SDL_Gamepad *gamepad, SDL_GamepadButton button);",
    summary: {
      en: "Asks whether a gamepad button is held right now.",
      pt: "Pergunta se um botão do controle está apertado agora.",
    },
    description: {
      en: "The polling counterpart of the SDL_EVENT_GAMEPAD_BUTTON_DOWN / _UP events. Face buttons are named by POSITION, because the labels differ between brands: SOUTH is the bottom one (Xbox A, PlayStation Cross), EAST the right one (Xbox B, PlayStation Circle).",
      pt: "A versão de consulta dos eventos SDL_EVENT_GAMEPAD_BUTTON_DOWN / _UP. Os botões de face têm nome pela POSIÇÃO, porque os rótulos mudam entre marcas: SOUTH é o de baixo (A do Xbox, X do PlayStation), EAST o da direita (B do Xbox, Círculo do PlayStation).",
    },
    params: [
      { name: "gamepad", type: "SDL_Gamepad *", desc: { en: "The gamepad.", pt: "O controle." } },
      {
        name: "button",
        type: "SDL_GamepadButton",
        desc: { en: "Which button.", pt: "Qual botão." },
        values: [
          { name: "SDL_GAMEPAD_BUTTON_SOUTH / EAST / WEST / NORTH", desc: { en: "The four face buttons, by position.", pt: "Os quatro botões de face, pela posição." } },
          { name: "SDL_GAMEPAD_BUTTON_DPAD_UP / DOWN / LEFT / RIGHT", desc: { en: "The D-pad.", pt: "O direcional." } },
          { name: "SDL_GAMEPAD_BUTTON_LEFT_SHOULDER / RIGHT_SHOULDER", desc: { en: "Bumpers (LB/RB, L1/R1).", pt: "Botões de ombro (LB/RB, L1/R1)." } },
          { name: "SDL_GAMEPAD_BUTTON_START / BACK / GUIDE", desc: { en: "Menu buttons.", pt: "Botões de menu." } },
          { name: "SDL_GAMEPAD_BUTTON_LEFT_STICK / RIGHT_STICK", desc: { en: "Pressing a stick in.", pt: "Apertar um analógico." } },
        ],
      },
    ],
    returns: { en: "`true` while the button is held.", pt: "`true` enquanto o botão está apertado." },
    example: `if (SDL_GetGamepadButton(pad, SDL_GAMEPAD_BUTTON_SOUTH) && player.onGround)
    player.jump();`,
    related: ["SDL_GetGamepadAxis", "SDL_RumbleGamepad"],
    khronos: `${WIKI}SDL_GetGamepadButton`,
  },
  {
    name: "SDL_RumbleGamepad",
    category: "gamepad",
    since: "SDL 3.2",
    signature: "bool SDL_RumbleGamepad(SDL_Gamepad *gamepad, Uint16 low_frequency_rumble, Uint16 high_frequency_rumble, Uint32 duration_ms);",
    summary: {
      en: "Makes the gamepad vibrate for a given time.",
      pt: "Faz o controle vibrar por um tempo dado.",
    },
    description: {
      en: "Pads have two motors: a heavy one on the left (low frequency, a deep rumble for explosions) and a light one on the right (high frequency, a buzz for footsteps or gunfire). Each intensity goes from 0 to 0xFFFF.\n\nEach call replaces the previous rumble; calling with both intensities 0 stops it.",
      pt: "Controles têm dois motores: um pesado à esquerda (baixa frequência, um tremor grave para explosões) e um leve à direita (alta frequência, um zumbido para passos ou tiros). Cada intensidade vai de 0 a 0xFFFF.\n\nCada chamada substitui a vibração anterior; chamar com as duas intensidades em 0 para tudo.",
    },
    params: [
      { name: "gamepad", type: "SDL_Gamepad *", desc: { en: "The gamepad.", pt: "O controle." } },
      { name: "low_frequency_rumble", type: "Uint16", desc: { en: "Left, heavy motor: 0 to 0xFFFF.", pt: "Motor esquerdo, pesado: 0 a 0xFFFF." } },
      { name: "high_frequency_rumble", type: "Uint16", desc: { en: "Right, light motor: 0 to 0xFFFF.", pt: "Motor direito, leve: 0 a 0xFFFF." } },
      { name: "duration_ms", type: "Uint32", desc: { en: "How long, in milliseconds.", pt: "Por quanto tempo, em milissegundos." } },
    ],
    returns: { en: "`true` on success; `false` if this pad cannot rumble.", pt: "`true` se deu certo; `false` se este controle não vibra." },
    example: `SDL_RumbleGamepad(pad, 0x8000, 0x4000, 200);   // a 200 ms thump when hit`,
    related: ["SDL_GetGamepadButton"],
    khronos: `${WIKI}SDL_RumbleGamepad`,
  },
];

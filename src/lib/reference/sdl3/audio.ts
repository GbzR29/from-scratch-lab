// src/lib/reference/sdl3/audio.ts
// SDL 3.2: audio devices and audio streams (SDL3's audio model has no SDL2-style callback).
import type { RefEntry } from "../types";

const WIKI = "https://wiki.libsdl.org/SDL3/";

export const audioEntries: RefEntry[] = [
  {
    name: "SDL_OpenAudioDeviceStream",
    category: "audio",
    since: "SDL 3.2",
    signature: "SDL_AudioStream * SDL_OpenAudioDeviceStream(SDL_AudioDeviceID devid, const SDL_AudioSpec *spec, SDL_AudioStreamCallback callback, void *userdata);",
    summary: {
      en: "The one-call way to play sound: opens a device and gives you a stream already connected to it.",
      pt: "O jeito de uma chamada para tocar som: abre um dispositivo e te dá um stream já ligado a ele.",
    },
    description: {
      en: "SDL3's audio is built on streams. A stream is a queue: you put samples in, in your format, and SDL converts them (rate, channels, sample type) to whatever the sound card wants. This function opens a device, creates one stream, and binds them together.\n\nThe device starts PAUSED, so nothing plays until SDL_ResumeAudioStreamDevice. Destroying the stream also closes the device. For several sounds at once (music + effects), open a device with SDL_OpenAudioDevice and bind several streams to it instead.",
      pt: "O áudio do SDL3 é feito de streams. Um stream é uma fila: você coloca amostras, no seu formato, e o SDL as converte (taxa, canais, tipo de amostra) para o que a placa de som quer. Esta função abre um dispositivo, cria um stream e liga os dois.\n\nO dispositivo começa PAUSADO, então nada toca até SDL_ResumeAudioStreamDevice. Destruir o stream também fecha o dispositivo. Para vários sons ao mesmo tempo (música + efeitos), abra um dispositivo com SDL_OpenAudioDevice e ligue vários streams nele.",
    },
    params: [
      { name: "devid", type: "SDL_AudioDeviceID", desc: { en: "Usually SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK (follows the user's default output, even if it changes).", pt: "Normalmente SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK (segue a saída padrão do usuário, mesmo se ela mudar)." } },
      { name: "spec", type: "const SDL_AudioSpec *", desc: { en: "The format YOU will put in: `{format, channels, freq}`, e.g. `{SDL_AUDIO_F32, 2, 48000}`.", pt: "O formato que VOCÊ vai colocar: `{format, channels, freq}`, ex.: `{SDL_AUDIO_F32, 2, 48000}`." } },
      { name: "callback", type: "SDL_AudioStreamCallback", desc: { en: "NULL to push data yourself with SDL_PutAudioStreamData; or a function SDL calls when the stream needs more (synths, generated sound).", pt: "NULL para você empurrar dados com SDL_PutAudioStreamData; ou uma função que o SDL chama quando o stream precisa de mais (sintetizadores, som gerado)." } },
      { name: "userdata", type: "void *", desc: { en: "Passed to the callback. Ignored if callback is NULL.", pt: "Passado para o callback. Ignorado se callback for NULL." } },
    ],
    returns: { en: "The stream, or NULL on failure.", pt: "O stream, ou NULL se falhar." },
    notes: [
      { en: "A callback runs on the AUDIO thread: keep it short, never block, and protect shared data.", pt: "Um callback roda na thread de ÁUDIO: deixe curto, nunca bloqueie, e proteja dados compartilhados." },
    ],
    example: `SDL_AudioSpec spec{SDL_AUDIO_F32, 1, 48000};   // mono float at 48 kHz
SDL_AudioStream* stream = SDL_OpenAudioDeviceStream(
    SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, &spec, nullptr, nullptr);
SDL_ResumeAudioStreamDevice(stream);          // devices start paused
SDL_PutAudioStreamData(stream, samples, int(count * sizeof(float)));`,
    related: ["SDL_ResumeAudioStreamDevice", "SDL_PutAudioStreamData", "SDL_DestroyAudioStream", "SDL_OpenAudioDevice"],
    khronos: `${WIKI}SDL_OpenAudioDeviceStream`,
  },
  {
    name: "SDL_ResumeAudioStreamDevice",
    category: "audio",
    since: "SDL 3.2",
    signature: "bool SDL_ResumeAudioStreamDevice(SDL_AudioStream *stream);",
    summary: {
      en: "Unpauses the device behind a stream opened with SDL_OpenAudioDeviceStream, so sound starts flowing.",
      pt: "Tira da pausa o dispositivo por trás de um stream aberto com SDL_OpenAudioDeviceStream, e o som começa a sair.",
    },
    description: {
      en: "Forgetting this call is the classic \"my sound does not play\" bug with SDL_OpenAudioDeviceStream. SDL_PauseAudioStreamDevice pauses it again (for a pause menu, say).",
      pt: "Esquecer esta chamada é o erro clássico de \"meu som não toca\" com SDL_OpenAudioDeviceStream. SDL_PauseAudioStreamDevice pausa de novo (para um menu de pausa, por exemplo).",
    },
    params: [
      { name: "stream", type: "SDL_AudioStream *", desc: { en: "The stream from SDL_OpenAudioDeviceStream.", pt: "O stream de SDL_OpenAudioDeviceStream." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_ResumeAudioStreamDevice(stream);`,
    related: ["SDL_OpenAudioDeviceStream", "SDL_ResumeAudioDevice"],
    khronos: `${WIKI}SDL_ResumeAudioStreamDevice`,
  },
  {
    name: "SDL_PutAudioStreamData",
    category: "audio",
    since: "SDL 3.2",
    signature: "bool SDL_PutAudioStreamData(SDL_AudioStream *stream, const void *buf, int len);",
    summary: {
      en: "Queues sound samples into a stream. SDL copies them and plays them in order.",
      pt: "Coloca amostras de som na fila de um stream. O SDL as copia e toca em ordem.",
    },
    description: {
      en: "The data must be in the stream's input format (the spec you gave). It is copied, so you can free or reuse your buffer right after the call: \"fire and forget\" for a sound effect.\n\n`len` is in BYTES, not samples: for float samples multiply the count by `sizeof(float)`. SDL_GetAudioStreamQueued tells how many bytes are still waiting, which lets a generator keep the queue short (low latency) but never empty (no gaps).",
      pt: "Os dados precisam estar no formato de entrada do stream (o spec que você deu). Eles são copiados, então dá para liberar ou reusar o seu buffer logo depois da chamada: \"dispara e esquece\" para um efeito sonoro.\n\n`len` é em BYTES, não em amostras: para amostras float multiplique a quantidade por `sizeof(float)`. SDL_GetAudioStreamQueued diz quantos bytes ainda estão esperando, o que deixa um gerador manter a fila curta (pouca latência) mas nunca vazia (sem buracos).",
    },
    params: [
      { name: "stream", type: "SDL_AudioStream *", desc: { en: "The stream.", pt: "O stream." } },
      { name: "buf", type: "const void *", desc: { en: "The samples, interleaved for stereo (L R L R…).", pt: "As amostras, intercaladas para estéreo (E D E D…)." } },
      { name: "len", type: "int", desc: { en: "Size in bytes.", pt: "Tamanho em bytes." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `// keep about 0.1 s of a 440 Hz tone queued
const int rate = 48000;
if (SDL_GetAudioStreamQueued(stream) < int(rate * 0.1f * sizeof(float))) {
    float buf[1024];
    for (float& s : buf) { s = 0.2f * std::sin(phase); phase += 2 * SDL_PI_F * 440 / rate; }
    SDL_PutAudioStreamData(stream, buf, sizeof buf);
}`,
    related: ["SDL_OpenAudioDeviceStream", "SDL_LoadWAV", "SDL_CreateAudioStream"],
    khronos: `${WIKI}SDL_PutAudioStreamData`,
  },
  {
    name: "SDL_DestroyAudioStream",
    category: "audio",
    since: "SDL 3.2",
    signature: "void SDL_DestroyAudioStream(SDL_AudioStream *stream);",
    summary: {
      en: "Frees a stream. If it came from SDL_OpenAudioDeviceStream, its device closes too.",
      pt: "Libera um stream. Se ele veio de SDL_OpenAudioDeviceStream, o dispositivo fecha junto.",
    },
    description: {
      en: "Queued audio that has not played yet is dropped. A stream bound to a device you opened yourself is unbound first; the device stays open.",
      pt: "O áudio na fila que ainda não tocou é descartado. Um stream ligado a um dispositivo que você mesmo abriu é desligado antes; o dispositivo continua aberto.",
    },
    params: [
      { name: "stream", type: "SDL_AudioStream *", desc: { en: "The stream to free.", pt: "O stream a liberar." } },
    ],
    example: `SDL_DestroyAudioStream(stream);`,
    related: ["SDL_OpenAudioDeviceStream", "SDL_CreateAudioStream"],
    khronos: `${WIKI}SDL_DestroyAudioStream`,
  },
  {
    name: "SDL_LoadWAV",
    category: "audio",
    since: "SDL 3.2",
    signature: "bool SDL_LoadWAV(const char *path, SDL_AudioSpec *spec, Uint8 **audio_buf, Uint32 *audio_len);",
    summary: {
      en: "Loads a .wav file: fills in its format and gives you a buffer with the samples.",
      pt: "Carrega um arquivo .wav: preenche o formato dele e te dá um buffer com as amostras.",
    },
    description: {
      en: "WAV is the one format SDL reads without extra libraries (for MP3 or OGG use SDL3_mixer or a decoder such as stb_vorbis). The returned `spec` is exactly what a stream needs as its input format.\n\nThe buffer is yours: free it with SDL_free when you no longer need the sound.",
      pt: "WAV é o único formato que o SDL lê sem bibliotecas extras (para MP3 ou OGG use o SDL3_mixer ou um decodificador como o stb_vorbis). O `spec` retornado é exatamente o que um stream precisa como formato de entrada.\n\nO buffer é seu: libere com SDL_free quando não precisar mais do som.",
    },
    params: [
      { name: "path", type: "const char *", desc: { en: "The file to read.", pt: "O arquivo a ler." } },
      { name: "spec", type: "SDL_AudioSpec *", desc: { en: "Receives the file's format.", pt: "Recebe o formato do arquivo." } },
      { name: "audio_buf", type: "Uint8 **", desc: { en: "Receives a pointer to the samples (free with SDL_free).", pt: "Recebe um ponteiro para as amostras (libere com SDL_free)." } },
      { name: "audio_len", type: "Uint32 *", desc: { en: "Receives the size in bytes.", pt: "Recebe o tamanho em bytes." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_AudioSpec spec;
Uint8* data; Uint32 length;
if (!SDL_LoadWAV("assets/shoot.wav", &spec, &data, &length)) {
    SDL_Log("LoadWAV: %s", SDL_GetError());
}
SDL_AudioStream* sfx = SDL_OpenAudioDeviceStream(
    SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, &spec, nullptr, nullptr);
SDL_ResumeAudioStreamDevice(sfx);
SDL_PutAudioStreamData(sfx, data, int(length));
// ... at shutdown:
SDL_free(data);`,
    related: ["SDL_PutAudioStreamData", "SDL_free"],
    khronos: `${WIKI}SDL_LoadWAV`,
  },
  {
    name: "SDL_OpenAudioDevice",
    category: "audio",
    since: "SDL 3.2",
    signature: "SDL_AudioDeviceID SDL_OpenAudioDevice(SDL_AudioDeviceID devid, const SDL_AudioSpec *spec);",
    summary: {
      en: "Opens an audio device you can bind several streams to. SDL mixes them for you.",
      pt: "Abre um dispositivo de áudio em que você pode ligar vários streams. O SDL os mistura por você.",
    },
    description: {
      en: "Use this when you need more than one sound at a time: one stream for music, one for effects, one per voice. Bind each stream with SDL_BindAudioStream and SDL adds their outputs together.\n\nUnlike SDL_OpenAudioDeviceStream, a device opened here starts UNpaused: sound flows as soon as a bound stream has data. It returns a new logical device ID; close it with SDL_CloseAudioDevice.",
      pt: "Use quando precisar de mais de um som por vez: um stream para a música, um para os efeitos, um por voz. Ligue cada stream com SDL_BindAudioStream e o SDL soma as saídas deles.\n\nAo contrário de SDL_OpenAudioDeviceStream, um dispositivo aberto aqui começa SEM pausa: o som sai assim que um stream ligado tiver dados. Ela retorna um novo ID de dispositivo lógico; feche com SDL_CloseAudioDevice.",
    },
    params: [
      { name: "devid", type: "SDL_AudioDeviceID", desc: { en: "SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, or a specific device ID.", pt: "SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, ou um ID de dispositivo específico." } },
      { name: "spec", type: "const SDL_AudioSpec *", desc: { en: "A format hint for the device, or NULL for sensible defaults. Streams convert anyway.", pt: "Uma sugestão de formato para o dispositivo, ou NULL para padrões razoáveis. Os streams convertem de qualquer jeito." } },
    ],
    returns: { en: "The device ID, or 0 on failure.", pt: "O ID do dispositivo, ou 0 se falhar." },
    example: `SDL_AudioDeviceID dev = SDL_OpenAudioDevice(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, nullptr);
SDL_AudioStream* music = SDL_CreateAudioStream(&musicSpec, nullptr);
SDL_AudioStream* sfx   = SDL_CreateAudioStream(&sfxSpec,   nullptr);
SDL_BindAudioStream(dev, music);
SDL_BindAudioStream(dev, sfx);       // both play, mixed`,
    related: ["SDL_BindAudioStream", "SDL_CreateAudioStream", "SDL_OpenAudioDeviceStream"],
    khronos: `${WIKI}SDL_OpenAudioDevice`,
  },
  {
    name: "SDL_CreateAudioStream",
    category: "audio",
    since: "SDL 3.2",
    signature: "SDL_AudioStream * SDL_CreateAudioStream(const SDL_AudioSpec *src_spec, const SDL_AudioSpec *dst_spec);",
    summary: {
      en: "Creates a standalone audio stream that converts from one format to another.",
      pt: "Cria um stream de áudio avulso que converte de um formato para outro.",
    },
    description: {
      en: "On its own a stream is a converter: data goes in as `src_spec`, comes out as `dst_spec`. Bound to a device (SDL_BindAudioStream), the device pulls from it and sets the output side itself, which is why `dst_spec` can be NULL in that case.",
      pt: "Sozinho, um stream é um conversor: os dados entram como `src_spec` e saem como `dst_spec`. Ligado a um dispositivo (SDL_BindAudioStream), o dispositivo puxa dele e define o lado de saída sozinho, e é por isso que `dst_spec` pode ser NULL nesse caso.",
    },
    params: [
      { name: "src_spec", type: "const SDL_AudioSpec *", desc: { en: "The format of the data you put in.", pt: "O formato dos dados que você coloca." } },
      { name: "dst_spec", type: "const SDL_AudioSpec *", desc: { en: "The format that comes out, or NULL when the stream will be bound to a device.", pt: "O formato que sai, ou NULL quando o stream será ligado a um dispositivo." } },
    ],
    returns: { en: "The stream, or NULL on failure.", pt: "O stream, ou NULL se falhar." },
    example: `SDL_AudioSpec musicSpec{SDL_AUDIO_S16, 2, 44100};
SDL_AudioStream* music = SDL_CreateAudioStream(&musicSpec, nullptr);
SDL_BindAudioStream(dev, music);`,
    related: ["SDL_BindAudioStream", "SDL_OpenAudioDevice", "SDL_DestroyAudioStream"],
    khronos: `${WIKI}SDL_CreateAudioStream`,
  },
  {
    name: "SDL_BindAudioStream",
    category: "audio",
    since: "SDL 3.2",
    signature: "bool SDL_BindAudioStream(SDL_AudioDeviceID devid, SDL_AudioStream *stream);",
    summary: {
      en: "Connects a stream to an opened device, so the device plays what you put into the stream.",
      pt: "Liga um stream a um dispositivo aberto, para o dispositivo tocar o que você coloca no stream.",
    },
    description: {
      en: "A device can have many streams bound; it mixes them all. A stream can be bound to only one device at a time. SDL_UnbindAudioStream disconnects it.",
      pt: "Um dispositivo pode ter muitos streams ligados; ele mistura todos. Um stream só pode estar ligado a um dispositivo por vez. SDL_UnbindAudioStream o desliga.",
    },
    params: [
      { name: "devid", type: "SDL_AudioDeviceID", desc: { en: "A device from SDL_OpenAudioDevice.", pt: "Um dispositivo de SDL_OpenAudioDevice." } },
      { name: "stream", type: "SDL_AudioStream *", desc: { en: "The stream to connect.", pt: "O stream a ligar." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_BindAudioStream(dev, music);
SDL_BindAudioStream(dev, sfx);`,
    related: ["SDL_OpenAudioDevice", "SDL_CreateAudioStream"],
    khronos: `${WIKI}SDL_BindAudioStream`,
  },
  {
    name: "SDL_SetAudioStreamGain",
    category: "audio",
    since: "SDL 3.2",
    signature: "bool SDL_SetAudioStreamGain(SDL_AudioStream *stream, float gain);",
    summary: {
      en: "Sets a stream's volume: 1.0 unchanged, 0.5 half, 0.0 silent.",
      pt: "Define o volume de um stream: 1.0 sem mudança, 0.5 metade, 0.0 silêncio.",
    },
    description: {
      en: "The gain multiplies every sample. Give music and effects separate streams and you get separate volume sliders for free.\n\nOur ears hear loudness roughly logarithmically, so a slider feels more even if it maps to gain as `slider²` or through decibels (gain = 10^(dB/20)) instead of linearly.",
      pt: "O ganho multiplica cada amostra. Dê streams separados para a música e os efeitos e você ganha controles de volume separados de graça.\n\nO ouvido percebe volume de forma mais ou menos logarítmica, então um controle parece mais uniforme se for mapeado para o ganho como `controle²` ou por decibéis (ganho = 10^(dB/20)) em vez de linear.",
    },
    params: [
      { name: "stream", type: "SDL_AudioStream *", desc: { en: "The stream.", pt: "O stream." } },
      { name: "gain", type: "float", desc: { en: "Multiplier, 0.0 = silence, 1.0 = default. Above 1.0 is louder (and may clip).", pt: "Multiplicador, 0.0 = silêncio, 1.0 = padrão. Acima de 1.0 fica mais alto (e pode distorcer)." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_SetAudioStreamGain(music, settings.musicVolume * settings.musicVolume);
SDL_SetAudioStreamGain(sfx, 1.0f);`,
    related: ["SDL_CreateAudioStream"],
    khronos: `${WIKI}SDL_SetAudioStreamGain`,
  },
  {
    name: "SDL_ResumeAudioDevice",
    category: "audio",
    since: "SDL 3.2",
    signature: "bool SDL_ResumeAudioDevice(SDL_AudioDeviceID devid);",
    summary: {
      en: "Unpauses a device paused with SDL_PauseAudioDevice.",
      pt: "Tira da pausa um dispositivo pausado com SDL_PauseAudioDevice.",
    },
    description: {
      en: "Devices from SDL_OpenAudioDevice start unpaused, so you only need this after pausing one yourself (a pause menu stops all bound streams at once). Resuming a device that is already playing does nothing, so calling it right after opening is harmless.",
      pt: "Dispositivos de SDL_OpenAudioDevice começam sem pausa, então só precisa disto depois de pausar um você mesmo (um menu de pausa para todos os streams ligados de uma vez). Retomar um dispositivo que já está tocando não faz nada, então chamar logo depois de abrir é inofensivo.",
    },
    params: [
      { name: "devid", type: "SDL_AudioDeviceID", desc: { en: "A device from SDL_OpenAudioDevice.", pt: "Um dispositivo de SDL_OpenAudioDevice." } },
    ],
    returns: { en: "`true` on success, `false` on failure.", pt: "`true` se deu certo, `false` se falhou." },
    example: `SDL_PauseAudioDevice(dev);    // pause menu opened
// ...
SDL_ResumeAudioDevice(dev);   // back to the game`,
    related: ["SDL_OpenAudioDevice", "SDL_ResumeAudioStreamDevice"],
    khronos: `${WIKI}SDL_ResumeAudioDevice`,
  },
];

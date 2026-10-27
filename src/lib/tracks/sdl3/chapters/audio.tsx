"use client";

// SDL3 track — "Audio Streams": what digital sound is (samples, frames, rate,
// formats; bytes per second); devices and streams; the first sound with
// SDL_LoadWAV + SDL_OpenAudioDeviceStream, with the AudioQueue figure; what a
// stream converts (S16 → F32, channels, resampling) with the AudioSpec
// figure; pitch with the frequency ratio; two streams on one device and the
// clamped mix, with the AudioMix figure; music made by a get callback and the
// audio-thread rules; the project: pickup sound + music (complete main.cpp);
// latency; SDL3_mixer; common mistakes. Facts checked in SDL 3.4.18
// (SDL_audio.h, SDL_audio.c, SDL_mixer.c, SDL_audioresample.c).

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Article, Lead, Goals, KeyIdeas } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { AudioQueueFigure } from "@/components/lesson/figures/sdl3/AudioQueueFigure";
import { AudioSpecFigure } from "@/components/lesson/figures/sdl3/AudioSpecFigure";
import { AudioMixFigure } from "@/components/lesson/figures/sdl3/AudioMixFigure";

const r = String.raw;

export function AudioContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "sdl08_intro",
          "The game is silent. In this chapter the gem makes a sound when it is collected, and a short bass line plays underneath. SDL3 builds all of its audio on one idea, the audio stream: a queue that takes sound in the format you have and gives it to the sound card in the format the card wants. You load a WAV file into one stream, generate music in code into a second, and let SDL mix the two.")}
      </Lead>

      <Goals t={t} id="sdl08" items={[
        "Explain samples, sample frames, sample rate and format, and work out how many bytes a sound takes.",
        "Load a WAV file and play it through an audio stream, and say why a device can play nothing without any error.",
        "Describe what a stream converts: sample format, channels and rate.",
        "Bind two streams to one device, set their gains, and recognise clipping.",
        "Generate sound in a get callback, following the rules of the audio thread.",
      ]} />

      <H2>{tx(t, "sdl08_soundTitle", "What sound is to a computer")}</H2>
      <p>
        {tx(t, "sdl08_soundBody",
          "A speaker cone moves back and forth, and the air carries those movements to your ear. Digital audio stores the cone's position as a list of numbers, measured at equal time steps. Each number is a sample. The number of samples per second is the sample rate (freq in SDL): 44100 or 48000 for music, 22050 is enough for short game effects. With two channels (stereo) there is one sample for the left speaker and one for the right at every step; those samples together are a sample frame, and they are stored one after the other, left, right, left, right (interleaved).")}
      </p>
      <LessonTable
        headers={[tx(t, "sdl08_fh0", "SDL_AudioFormat"), tx(t, "sdl08_fh1", "One sample is"), tx(t, "sdl08_fh2", "Silence, loudest")]}
        rows={[
          ["SDL_AUDIO_U8", tx(t, "sdl08_f1", "1 byte, unsigned: 0 to 255"), "128, 0 / 255"],
          ["SDL_AUDIO_S16", tx(t, "sdl08_f2", "2 bytes, signed: −32768 to 32767; most WAV files"), "0, −32768 / 32767"],
          ["SDL_AUDIO_S32", tx(t, "sdl08_f3", "4 bytes, signed"), "0, ±2³¹"],
          ["SDL_AUDIO_F32", tx(t, "sdl08_f4", "4 bytes, a float from −1.0 to +1.0; what SDL mixes in"), "0.0, ±1.0"],
        ]}
      />
      <p>
        {tx(t, "sdl08_specBody",
          "SDL describes a sound with three numbers in an SDL_AudioSpec: format, channels and freq. From them, how many bytes one second of sound takes:")}
      </p>
      <Equation label={tx(t, "sdl08_eqBytes", "Bytes per second")}
        where={[
          [r`B`, tx(t, "sdl08_wB", "bytes per second of sound")],
          [r`f`, tx(t, "sdl08_wF", "freq, the sample rate: sample frames per second")],
          [r`c`, tx(t, "sdl08_wC", "channels: 1 mono, 2 stereo")],
          [r`b`, tx(t, "sdl08_wb", "bytes per sample: 1 for U8, 2 for S16, 4 for S32 and F32")],
        ]}>
        {r`B = f \cdot c \cdot b`}
      </Equation>
      <p>
        {tx(t, "sdl08_specExample",
          "The project's sound, pickup.wav, is S16, mono, 22050 Hz: B = 22050 × 1 × 2 = 44100 bytes per second. Its data is 8820 bytes, so it lasts 8820 / 44100 = 0.2 s, which is 4410 sample frames. SDL_AUDIO_FRAMESIZE(spec) gives c × b, the bytes of one frame (2 here).")}
      </p>

      <H2>{tx(t, "sdl08_devTitle", "Devices and streams")}</H2>
      <p>
        {tx(t, "sdl08_devBody",
          "A physical device is a real output: speakers, headphones, a monitor's HDMI audio. Opening it gives you a logical device, your program's own handle on it; a library can open the same physical device separately, and SDL mixes both. Unlike SDL2, there is no callback that fills the device's buffer. You bind audio streams to the device, and the device takes data from every bound stream whenever it needs more.")}
      </p>
      <p>
        {tx(t, "sdl08_streamBody",
          "A stream has an input side and an output side, each with its own spec. You put data in on the input side, in your format. The device takes it out on the output side, in its format, and the stream converts on the way. Until then the data waits in the stream's queue.")}
      </p>

      <H2>{tx(t, "sdl08_firstTitle", "The first sound")}</H2>
      <p>
        <a href="/sdl3/pickup.wav" download="pickup.wav" className="text-[var(--primary)] underline">
          {tx(t, "sdl08_download", "Download pickup.wav")}
        </a>{" "}
        {tx(t, "sdl08_downloadBody",
          "into assets/, next to hero.png and the font. It is a two-note chime made for this course, free to use. The shortest way to play it is SDL_OpenAudioDeviceStream, which opens the default device, creates one stream with your spec and binds it, in one call:")}
      </p>
      <CodeBlock lang="cpp" filename="first_sound.cpp" t={t}>{`SDL_InitSubSystem(SDL_INIT_AUDIO);                // audio is its own subsystem

SDL_AudioSpec spec;
Uint8* data = nullptr;
Uint32 len  = 0;
if (!SDL_LoadWAV(assetPath("assets/pickup.wav").c_str(), &spec, &data, &len)) {
    SDL_Log("SDL_LoadWAV failed: %s", SDL_GetError());
}
// spec is now {SDL_AUDIO_S16, 1, 22050}, len is 8820

SDL_AudioStream* stream =
    SDL_OpenAudioDeviceStream(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, &spec, nullptr, nullptr);
SDL_ResumeAudioStreamDevice(stream);              // this device starts paused

// whenever the sound should play:
SDL_PutAudioStreamData(stream, data, int(len));   // copies the bytes and returns at once

// at the end:
SDL_DestroyAudioStream(stream);                    // also closes the device it opened
SDL_free(data);`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl08_ch0", "Call"), tx(t, "sdl08_ch1", "What it does")]}
        rows={[
          ["SDL_LoadWAV", tx(t, "sdl08_c1", "Reads the file, fills spec with its format and gives you its sample bytes in a new buffer. You free that buffer with SDL_free.")],
          ["SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK", tx(t, "sdl08_c2", "Whatever output the system calls the default. If the user plugs in headphones, SDL moves the sound there by itself.")],
          ["&spec", tx(t, "sdl08_c3", "The input side of the stream: the format of the bytes you will put in. The output side is set to the device's format.")],
          ["SDL_ResumeAudioStreamDevice", tx(t, "sdl08_c4", "SDL_OpenAudioDeviceStream is the one way of opening that returns a paused device, to behave like SDL2. Without this call, nothing ever plays.")],
          ["SDL_PutAudioStreamData", tx(t, "sdl08_c5", "Adds a copy of the bytes to the end of the queue. You may free or reuse your buffer right after.")],
        ]}
      />
      <p>
        {tx(t, "sdl08_queueBody",
          "Try the stream in the figure. It holds the real bytes of pickup.wav and plays them through your own speakers. Start with the device paused, as SDL opens it, and put the sound a few times:")}
      </p>

      <AudioQueueFigure t={t} />

      <Callout type="warn" t={t}>
        {tx(t, "sdl08_pauseWarn",
          "A paused device is not an error. SDL_PutAudioStreamData returns true, the bytes wait in the queue, and the queue grows with every put. If a program runs and nothing is heard, check for SDL_ResumeAudioStreamDevice first, then SDL_GetAudioStreamQueued: a number that only grows means nothing is taking data out.")}
      </Callout>
      <p>
        {tx(t, "sdl08_restartBody",
          "The figure also shows that a stream is a queue, not a mixer: put the sound twice and the second copy plays after the first, 0.2 s late. For a sound effect that is wrong; collecting two gems quickly should restart the chime. SDL_ClearAudioStream throws away what is still queued, so clear, then put.")}
      </p>

      <H2>{tx(t, "sdl08_convTitle", "What the stream converts")}</H2>
      <p>
        {tx(t, "sdl08_convBody",
          "Your device almost certainly does not play S16 mono at 22050 Hz. A typical one plays F32 stereo at 48000 Hz (SDL_GetAudioDeviceFormat tells you). Between the two, the stream does three conversions. The format: each S16 sample becomes a float by dividing it by 32768.")}
      </p>
      <Equation label={tx(t, "sdl08_eqS16", "S16 to F32")}
        where={[
          [r`x`, tx(t, "sdl08_wX", "the sample as a float, from −1.0 to just under +1.0")],
          [r`s`, tx(t, "sdl08_wS", "the S16 sample, from −32768 to 32767")],
          [r`32768`, tx(t, "sdl08_w32768", "2¹⁵, the size of the negative half of the S16 range")],
        ]}>
        {r`x = \frac{s}{32768}`}
      </Equation>
      <p>
        {tx(t, "sdl08_convBody2",
          "The channels: mono becomes stereo by sending the same sample to both speakers. The rate: the stream computes new samples between the old ones (resampling), so that 0.2 s of sound is still 0.2 s on the device. The number of frames changes in proportion:")}
      </p>
      <Equation label={tx(t, "sdl08_eqResample", "Frames after resampling")}
        where={[
          [r`n_{\text{out}}`, tx(t, "sdl08_wNout", "sample frames the device receives")],
          [r`n_{\text{in}}`, tx(t, "sdl08_wNin", "sample frames you put in: 4410 for pickup.wav")],
          [r`f_{\text{in}},\ f_{\text{out}}`, tx(t, "sdl08_wFio", "the input and output rates: 22050 and 48000 Hz")],
        ]}>
        {r`n_{\text{out}} = n_{\text{in}} \cdot \frac{f_{\text{out}}}{f_{\text{in}}} = 4410 \cdot \frac{48000}{22050} = 9600`}
      </Equation>
      <p>
        {tx(t, "sdl08_resampler",
          "SDL's resampler uses bandlimited interpolation: each new sample is a weighted sum of the 12 nearest old ones (5 or 6 on each side), weighted by a windowed sinc curve. That keeps it free of the metallic whine a straight line between neighbours would add.")}
      </p>
      <p>
        {tx(t, "sdl08_specFig",
          "The stream does all of this because the spec told it what your bytes are. It has no way to check. Give it a wrong spec and it converts the wrong thing, faithfully. The figure reads the same 8820 bytes with any spec you choose:")}
      </p>

      <AudioSpecFigure t={t} />

      <p>
        {tx(t, "sdl08_ratioBody",
          "Playing the frames faster on purpose is useful. SDL_SetAudioStreamFrequencyRatio(stream, r) makes the stream consume its input r times as fast: r = 2 is an octave higher and half as long, r = 0.5 an octave lower. A small random ratio on every pickup keeps a sound that repeats all game long from getting tiring. In semitones, the steps of a piano keyboard:")}
      </p>
      <Equation label={tx(t, "sdl08_eqRatio", "Ratio to semitones")}
        where={[
          [r`n`, tx(t, "sdl08_wSemi", "the change in pitch, in semitones (12 is an octave)")],
          [r`r`, tx(t, "sdl08_wRatio", "the frequency ratio passed to SDL_SetAudioStreamFrequencyRatio")],
        ]}>
        {r`n = 12 \log_2 r, \qquad r = 0.95 \Rightarrow n = -0.89, \qquad r = 1.05 \Rightarrow n = +0.84`}
      </Equation>
      <p>
        {tx(t, "sdl08_ratioUse",
          "The project picks r between 0.95 and 1.05, less than a semitone either way: the chime sounds alive, never out of tune.")}
      </p>

      <H2>{tx(t, "sdl08_mixTitle", "Two sounds at once")}</H2>
      <p>
        {tx(t, "sdl08_mixBody",
          "Music and effects need two streams, so that an effect can be cleared and restarted without touching the music. SDL_OpenAudioDeviceStream cannot do that: its device belongs to its one stream, and binding a second gives \"Cannot change stream bindings on device opened with SDL_OpenAudioDeviceStream\". The full form takes three steps: open a device, create the streams, bind them.")}
      </p>
      <CodeBlock lang="cpp" filename="two_streams.cpp" t={t}>{`SDL_AudioDeviceID device = SDL_OpenAudioDevice(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, nullptr);
// nullptr: no wish for a format; this kind of device is not paused

SDL_AudioStream* sfx   = SDL_CreateAudioStream(&wavSpec,   nullptr);   // output side:
SDL_AudioStream* music = SDL_CreateAudioStream(&musicSpec, nullptr);   //   set by the binding

SDL_AudioStream* streams[] = {sfx, music};
SDL_BindAudioStreams(device, streams, 2);   // both start at the same moment

SDL_SetAudioStreamGain(music, 0.5f);        // quieter than the effects`}</CodeBlock>
      <p>
        {tx(t, "sdl08_mixHow",
          "When the device needs more sound, it takes the next block from every bound stream, converted to F32, multiplies each by its stream's gain and adds them up. Floats can go past ±1.0 in the sum, but no speaker can, so SDL clamps the result:")}
      </p>
      <Equation label={tx(t, "sdl08_eqMix", "The device's mix")}
        where={[
          [r`y`, tx(t, "sdl08_wY", "the sample sent to the device")],
          [r`x_i`, tx(t, "sdl08_wXi", "the sample of stream i at the same moment, as F32")],
          [r`g_i`, tx(t, "sdl08_wGi", "the gain of stream i (SDL_SetAudioStreamGain; 1.0 by default)")],
          [r`\operatorname{clamp}`, tx(t, "sdl08_wClamp", "cuts values below −1 to −1 and above +1 to +1")],
        ]}>
        {r`y = \operatorname{clamp}\!\left(\sum_i g_i\, x_i,\ -1,\ 1\right)`}
      </Equation>
      <p>
        {tx(t, "sdl08_clipBody",
          "Clamping cuts the tops off the wave, and a cut wave sounds harsh and crackly: that is clipping. It happens only when several loud sounds coincide, which makes it easy to miss while testing one sound at a time. Gains are often given in decibels, dB = 20 log₁₀ g: 0.5 is −6 dB, 2 is +6 dB. Raise the gains in the figure and press the pickup sound while the music plays:")}
      </p>

      <AudioMixFigure t={t} />

      <Callout type="tip" t={t}>
        {tx(t, "sdl08_headroomTip",
          "Leave headroom: keep the sum of the loudest sounds that can play together under 1. The project's music peaks at 0.25 after its 0.5 gain, and the chime at 0.56, so the worst case is 0.81. SDL_SetAudioDeviceGain changes the whole device's volume, for a settings menu; it is applied when the streams are mixed, so it lowers everything together.")}
      </Callout>

      <H2>{tx(t, "sdl08_cbTitle", "Music made by code: the get callback")}</H2>
      <p>
        {tx(t, "sdl08_cbBody",
          "The music is not a file. SDL_SetAudioStreamGetCallback gives the music stream a function that SDL calls whenever the device is about to take data from it. The callback computes the next samples and puts them in, so the stream never runs dry and never holds more than a few milliseconds. Its arguments say how much is needed: additional_amount is the number of bytes, in the stream's input format, still missing for this request (it can be 0, and it may overestimate a little).")}
      </p>
      <p>
        {tx(t, "sdl08_triBody",
          "The bass line is four notes, A2, F2, C3 and G2, half a second each, in a triangle wave that fades after each note starts. A triangle wave rises and falls in straight lines; it has a soft, round sound, like an old console's bass. For a note of frequency f, t seconds after the note began:")}
      </p>
      <Equation label={tx(t, "sdl08_eqTri", "A fading triangle wave")}
        where={[
          [r`x`, tx(t, "sdl08_wXtri", "the sample, before the stream's 0.5 gain")],
          [r`\varphi`, tx(t, "sdl08_wPhi", "the phase: how far through the current cycle, from 0 to 1")],
          [r`f`, tx(t, "sdl08_wFreq", "the note's frequency: 110 Hz for A2, 87.31 for F2, 130.81 for C3, 98 for G2")],
          [r`t`, tx(t, "sdl08_wT", "seconds since the note started, from 0 to 0.5")],
          [r`\operatorname{frac}`, tx(t, "sdl08_wFrac", "the part after the decimal point: frac(2.3) = 0.3")],
          [r`e^{-3t}`, tx(t, "sdl08_wExp", "the fade: 1 when the note starts, 0.22 when it ends")],
          [r`0.5`, tx(t, "sdl08_wHalf", "the loudness of the wave itself")],
        ]}>
        {r`\varphi = \operatorname{frac}(t f), \qquad x = \bigl(4\,\lvert \varphi - 0.5 \rvert - 1\bigr)\, e^{-3t} \cdot 0.5`}
      </Equation>
      <p>
        {tx(t, "sdl08_triCheck",
          "Check the shape: at φ = 0, 4 × 0.5 − 1 = 1, the top; at φ = 0.5, −1, the bottom; at φ = 1, the top again. In between, straight lines. The same music plays in the mix figure above.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "sdl08_threadWarn",
          "The callback runs on SDL's audio thread, not in SDL_AppIterate, and the device is waiting for it. If it takes too long, the sound breaks up into clicks. Inside it: no file reading, no memory allocation, no SDL_Log every call, no lock that the game might be holding. Give it data that only it touches, as the project does with its frame counter, or protect shared data with SDL_LockAudioStream (SDL holds that lock while it calls you).")}
      </Callout>

      <H2>{tx(t, "sdl08_projectTitle", "The project: a pickup sound and music")}</H2>
      <p>
        {tx(t, "sdl08_projectBody",
          "The project continues from the Text chapter. Four changes. One: a new function initAudio starts the audio subsystem on its own, with SDL_InitSubSystem, as the Setup chapter suggested, so that a machine without sound still gets its window. Two: initAudio then loads the sound, opens the device, creates the two streams, gives the music its callback and binds both; a failure in any step only logs a message and the game runs silently. Three: collecting a gem clears the effect stream, picks a random ratio and puts the sound. Four: SDL_AppQuit destroys the streams before anything they use.")}
      </p>
      <CodeBlock lang="cpp" filename="src/main.cpp" t={t}>{`#define SDL_MAIN_USE_CALLBACKS 1
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <SDL3_ttf/SDL_ttf.h>
#include <string>

constexpr int   GAME_W     = 640;
constexpr int   GAME_H     = 360;
constexpr float SPEED      = 120.0f;
constexpr float FRAME      = 32.0f;
constexpr float ANIM_FPS   = 8.0f;
constexpr float GEM        = 12.0f;
constexpr float FONT_PT    = 22.0f;
constexpr int   MUSIC_RATE = 48000;              // new: the music's sample rate
constexpr int   MUSIC_NOTE = MUSIC_RATE / 2;     // new: frames per note, half a second

// new: the music generator's state; only the audio thread touches it
struct Music { int frame = 0; };

struct AppState {
    SDL_Window*       window      = nullptr;
    SDL_Renderer*     renderer    = nullptr;
    SDL_Texture*      hero        = nullptr;
    TTF_Font*         font        = nullptr;
    TTF_TextEngine*   engine      = nullptr;
    TTF_Text*         scoreText   = nullptr;
    TTF_Text*         fpsText     = nullptr;
    SDL_AudioDeviceID audioDevice = 0;           // new
    SDL_AudioStream*  sfx         = nullptr;     // new: sound effects
    SDL_AudioStream*  music       = nullptr;     // new: generated music
    Uint8*            pickupData  = nullptr;     // new: pickup.wav's samples
    Uint32            pickupLen   = 0;           // new: their size in bytes
    Music             tune;                      // new
    bool              sound       = false;       // new: false when there is no audio
    Uint64            lastTick    = 0;
    float             x = 304.0f, y = 164.0f;
    float             animTime    = 0.0f;
    bool              facingLeft  = false;
    float             gemX = 0.0f, gemY = 0.0f;
    int               score       = 0;
    int               frames      = 0;
    float             fpsTime     = 0.0f;
};

static std::string assetPath(const char* file) {
    const char* base = SDL_GetBasePath();
    return std::string(base ? base : "") + file;
}

static SDL_Texture* loadTexture(SDL_Renderer* renderer, const char* file) {
    const std::string path = assetPath(file);
    SDL_Surface* surface = SDL_LoadPNG(path.c_str());
    if (!surface) {
        SDL_Log("SDL_LoadPNG(%s) failed: %s", path.c_str(), SDL_GetError());
        return nullptr;
    }
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);
    SDL_DestroySurface(surface);
    if (!texture) SDL_Log("SDL_CreateTextureFromSurface failed: %s", SDL_GetError());
    return texture;
}

static void placeGem(AppState* app) {
    app->gemX = 16.0f + SDL_randf() * (GAME_W - 32.0f - GEM);
    app->gemY = 40.0f + SDL_randf() * (GAME_H - 56.0f - GEM);
}

// new: runs on the audio thread when the music stream needs more data
static void SDLCALL feedMusic(void* userdata, SDL_AudioStream* stream,
                              int additional, int /*total*/) {
    auto* m = static_cast<Music*>(userdata);
    static const float NOTES[4] = {110.00f, 87.31f, 130.81f, 98.00f};   // A2 F2 C3 G2
    float buf[512];
    int needed = additional / int(sizeof(float));                    // F32 mono: 4 bytes a frame
    while (needed > 0) {
        const int n = SDL_min(needed, 512);
        for (int i = 0; i < n; ++i) {
            const int   note  = m->frame / MUSIC_NOTE;                   // 0..3
            const float t     = float(m->frame % MUSIC_NOTE) / MUSIC_RATE;
            const float phase = SDL_fmodf(t * NOTES[note], 1.0f);
            buf[i] = (4.0f * SDL_fabsf(phase - 0.5f) - 1.0f) * SDL_expf(-3.0f * t) * 0.5f;
            m->frame = (m->frame + 1) % (4 * MUSIC_NOTE);                // loop every 2 s
        }
        SDL_PutAudioStreamData(stream, buf, n * int(sizeof(float)));
        needed -= n;
    }
}

// new: the audio subsystem, the sound, the device and the two streams; false if a step fails
static bool initAudio(AppState* app) {
    if (!SDL_InitSubSystem(SDL_INIT_AUDIO)) return false;    // apart from video: may fail alone

    SDL_AudioSpec wavSpec;
    if (!SDL_LoadWAV(assetPath("assets/pickup.wav").c_str(), &wavSpec,
                     &app->pickupData, &app->pickupLen)) return false;

    app->audioDevice = SDL_OpenAudioDevice(SDL_AUDIO_DEVICE_DEFAULT_PLAYBACK, nullptr);
    if (!app->audioDevice) return false;

    const SDL_AudioSpec musicSpec{SDL_AUDIO_F32, 1, MUSIC_RATE};
    app->sfx   = SDL_CreateAudioStream(&wavSpec, nullptr);
    app->music = SDL_CreateAudioStream(&musicSpec, nullptr);
    if (!app->sfx || !app->music) return false;

    SDL_SetAudioStreamGetCallback(app->music, feedMusic, &app->tune);
    SDL_SetAudioStreamGain(app->music, 0.5f);

    SDL_AudioStream* streams[] = {app->sfx, app->music};
    return SDL_BindAudioStreams(app->audioDevice, streams, 2);
}

SDL_AppResult SDL_AppInit(void** appstate, int argc, char* argv[]) {
    SDL_SetAppMetadata("SDL3 Lab", "0.1", "com.example.sdl3lab");
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    if (!TTF_Init()) {
        SDL_Log("TTF_Init failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    auto* app = new AppState{};
    *appstate = app;
    if (!SDL_CreateWindowAndRenderer("SDL3 Lab", 1280, 720, SDL_WINDOW_RESIZABLE,
                                     &app->window, &app->renderer)) {
        SDL_Log("SDL_CreateWindowAndRenderer failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    SDL_SetRenderVSync(app->renderer, 1);
    SDL_SetRenderLogicalPresentation(app->renderer, GAME_W, GAME_H,
                                     SDL_LOGICAL_PRESENTATION_INTEGER_SCALE);

    app->hero = loadTexture(app->renderer, "assets/hero.png");
    if (!app->hero) return SDL_APP_FAILURE;
    SDL_SetTextureScaleMode(app->hero, SDL_SCALEMODE_NEAREST);

    app->font = TTF_OpenFont(assetPath("assets/Micro5-Regular.ttf").c_str(), FONT_PT);
    if (!app->font) {
        SDL_Log("TTF_OpenFont failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    app->engine    = TTF_CreateRendererTextEngine(app->renderer);
    app->scoreText = TTF_CreateText(app->engine, app->font, "Score 0", 0);
    app->fpsText   = TTF_CreateText(app->engine, app->font, "", 0);
    if (!app->engine || !app->scoreText || !app->fpsText) {
        SDL_Log("SDL3_ttf text setup failed: %s", SDL_GetError());
        return SDL_APP_FAILURE;
    }
    TTF_SetTextColor(app->scoreText, 250, 204, 21, 255);
    TTF_SetTextColor(app->fpsText, 148, 163, 184, 255);

    app->sound = initAudio(app);                                       // new
    if (!app->sound) SDL_Log("No sound: %s", SDL_GetError());          // the game still runs

    placeGem(app);
    app->lastTick = SDL_GetTicksNS();
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppEvent(void* appstate, SDL_Event* event) {
    if (event->type == SDL_EVENT_QUIT) return SDL_APP_SUCCESS;
    if (event->type == SDL_EVENT_KEY_DOWN && event->key.key == SDLK_ESCAPE) return SDL_APP_SUCCESS;
    return SDL_APP_CONTINUE;
}

SDL_AppResult SDL_AppIterate(void* appstate) {
    auto* app = static_cast<AppState*>(appstate);

    const Uint64 now = SDL_GetTicksNS();
    const float  dt  = float(now - app->lastTick) / 1e9f;
    app->lastTick = now;

    const bool* keys = SDL_GetKeyboardState(nullptr);
    float dx = 0.0f, dy = 0.0f;
    if (keys[SDL_SCANCODE_LEFT]  || keys[SDL_SCANCODE_A]) dx -= 1.0f;
    if (keys[SDL_SCANCODE_RIGHT] || keys[SDL_SCANCODE_D]) dx += 1.0f;
    if (keys[SDL_SCANCODE_UP]    || keys[SDL_SCANCODE_W]) dy -= 1.0f;
    if (keys[SDL_SCANCODE_DOWN]  || keys[SDL_SCANCODE_S]) dy += 1.0f;
    if (dx != 0.0f && dy != 0.0f) { dx *= 0.7071f; dy *= 0.7071f; }

    app->x = SDL_clamp(app->x + dx * SPEED * dt, 0.0f, GAME_W - FRAME);
    app->y = SDL_clamp(app->y + dy * SPEED * dt, 0.0f, GAME_H - FRAME);

    const bool moving = dx != 0.0f || dy != 0.0f;
    if (dx < 0.0f) app->facingLeft = true;
    if (dx > 0.0f) app->facingLeft = false;
    app->animTime += dt;
    const int row   = moving ? 1 : 0;
    const int frame = int(app->animTime * ANIM_FPS) % 4;

    const SDL_FRect body{app->x + 7.0f, app->y + 8.0f, 18.0f, 21.0f};
    const SDL_FRect gem{app->gemX, app->gemY, GEM, GEM};
    if (SDL_HasRectIntersectionFloat(&body, &gem)) {
        ++app->score;
        placeGem(app);
        char buf[32];
        SDL_snprintf(buf, sizeof buf, "Score %d", app->score);
        TTF_SetTextString(app->scoreText, buf, 0);
        if (app->sound) {                                              // new: restart the chime
            SDL_ClearAudioStream(app->sfx);
            SDL_SetAudioStreamFrequencyRatio(app->sfx, 0.95f + 0.1f * SDL_randf());
            SDL_PutAudioStreamData(app->sfx, app->pickupData, int(app->pickupLen));
        }
    }

    ++app->frames;
    app->fpsTime += dt;
    if (app->fpsTime >= 0.5f) {
        char buf[32];
        SDL_snprintf(buf, sizeof buf, "%d fps", int(app->frames / app->fpsTime + 0.5f));
        TTF_SetTextString(app->fpsText, buf, 0);
        app->frames  = 0;
        app->fpsTime = 0.0f;
    }

    SDL_SetRenderDrawColor(app->renderer, 16, 18, 26, 255);
    SDL_RenderClear(app->renderer);

    const float cx = app->gemX + GEM / 2, cy = app->gemY + GEM / 2, h = GEM / 2;
    const SDL_FColor light{0.13f, 0.83f, 0.93f, 1.0f}, dark{0.03f, 0.45f, 0.65f, 1.0f};
    const SDL_Vertex v[4] = {
        {{cx, cy - h}, light, {0, 0}}, {{cx + h, cy}, dark, {0, 0}},
        {{cx, cy + h}, dark,  {0, 0}}, {{cx - h, cy}, light, {0, 0}},
    };
    const int idx[6] = {0, 1, 2, 0, 2, 3};
    SDL_RenderGeometry(app->renderer, nullptr, v, 4, idx, 6);

    const SDL_FRect src{frame * FRAME, row * FRAME, FRAME, FRAME};
    const SDL_FRect dst{SDL_roundf(app->x), SDL_roundf(app->y), FRAME, FRAME};
    SDL_RenderTextureRotated(app->renderer, app->hero, &src, &dst, 0.0, nullptr,
                             app->facingLeft ? SDL_FLIP_HORIZONTAL : SDL_FLIP_NONE);

    TTF_DrawRendererText(app->scoreText, 8.0f, 4.0f);
    int w = 0, hText = 0;
    TTF_GetTextSize(app->fpsText, &w, &hText);
    TTF_DrawRendererText(app->fpsText, float(GAME_W - 8 - w), 4.0f);

    SDL_RenderPresent(app->renderer);
    return SDL_APP_CONTINUE;
}

void SDL_AppQuit(void* appstate, SDL_AppResult result) {
    if (auto* app = static_cast<AppState*>(appstate)) {
        SDL_DestroyAudioStream(app->music);      // new: streams first, so the callback
        SDL_DestroyAudioStream(app->sfx);        //      has stopped before tune goes away
        SDL_CloseAudioDevice(app->audioDevice);
        SDL_free(app->pickupData);
        TTF_DestroyText(app->scoreText);
        TTF_DestroyText(app->fpsText);
        TTF_DestroyRendererTextEngine(app->engine);
        TTF_CloseFont(app->font);
        SDL_DestroyTexture(app->hero);
        SDL_DestroyRenderer(app->renderer);
        SDL_DestroyWindow(app->window);
        delete app;
    }
    TTF_Quit();
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "sdl08_lh0", "Code"), tx(t, "sdl08_lh1", "What it does")]}
        rows={[
          ["SDL_InitSubSystem(SDL_INIT_AUDIO)", tx(t, "sdl08_l1", "Starts the audio subsystem and picks a driver: WASAPI on Windows, Core Audio on macOS, PipeWire or PulseAudio on Linux. Kept out of SDL_Init so that its failure does not stop the game; SDL_Quit shuts it down with the rest.")],
          ["struct Music", tx(t, "sdl08_l2", "The callback's only state: which frame of the 2-second loop comes next. Nothing else reads or writes it, so no lock is needed.")],
          ["additional / sizeof(float)", tx(t, "sdl08_l3", "Bytes to frames: the music is F32 mono, 4 bytes a frame.")],
          ["buf[512], SDL_min", tx(t, "sdl08_l4", "A small buffer on the stack, filled and put as many times as needed: no allocation on the audio thread.")],
          ["m->frame / MUSIC_NOTE", tx(t, "sdl08_l5", "Which of the four notes: frames 0 to 23999 are note 0, 24000 to 47999 note 1, and so on.")],
          ["% (4 * MUSIC_NOTE)", tx(t, "sdl08_l6", "Back to 0 after 96000 frames, 2 seconds: the bass line loops, and the counter never overflows.")],
          ["SDL_CreateAudioStream(&wavSpec, nullptr)", tx(t, "sdl08_l7", "The input side is the WAV's spec; the output side is left open and SDL_BindAudioStreams sets it to the device's.")],
          ["SDL_SetAudioStreamGetCallback", tx(t, "sdl08_l8", "feedMusic is called before each time the device takes data, from the moment the stream is bound.")],
          ["app->sound = initAudio(app)", tx(t, "sdl08_l9", "Missing audio is not fatal: on a machine without a sound device the game runs silently, and the log says why.")],
          ["SDL_ClearAudioStream + Put", tx(t, "sdl08_l10", "Drops what is left of the previous chime and queues a fresh one: two quick gems give two clean starts.")],
          ["0.95f + 0.1f * SDL_randf()", tx(t, "sdl08_l11", "A ratio from 0.95 to 1.05, set before the put, so each chime has a slightly different pitch.")],
          ["SDL_DestroyAudioStream(app->music)", tx(t, "sdl08_l12", "Unbinds the stream and waits for a running callback to finish, before tune is deleted with app.")],
        ]}
      />
      <p>
        {tx(t, "sdl08_runBody",
          "Copy pickup.wav into assets/, build and run. The bass line starts at once and loops every two seconds. Walk into the gem: the chime sounds over the music, each time a little higher or lower. Collect two gems in quick succession and the second chime cuts off the first instead of waiting for it.")}
      </p>

      <H2>{tx(t, "sdl08_latencyTitle", "How late is the sound?")}</H2>
      <p>
        {tx(t, "sdl08_latencyBody",
          "The device does not take one sample at a time but a block, its buffer. A sound you put now is heard after the block being played has finished, at worst one buffer later. SDL's default buffer for a 48000 Hz device is 1024 sample frames (the system may choose another size; SDL_GetAudioDeviceFormat reports it as sample_frames):")}
      </p>
      <Equation label={tx(t, "sdl08_eqLatency", "Buffer time")}
        where={[
          [r`L`, tx(t, "sdl08_wL", "the time one buffer lasts, in seconds")],
          [r`N`, tx(t, "sdl08_wN", "the buffer size in sample frames: 1024")],
          [r`f`, tx(t, "sdl08_wF2", "the device's rate: 48000 Hz")],
        ]}>
        {r`L = \frac{N}{f} = \frac{1024}{48000} = 0.0213\ \text{s} = 21.3\ \text{ms}`}
      </Equation>
      <p>
        {tx(t, "sdl08_latencyBody2",
          "About one frame at 60 fps: quick enough for a pickup. What makes a game sound late is usually its own queue. A stream holding a second of music delays everything put after it by a second. Keep queues short: let a callback fill them, or check SDL_GetAudioStreamQueued and put more only when it is low.")}
      </p>

      <Callout type="info" t={t}>
        {tx(t, "sdl08_mixerNote",
          "Core SDL reads only WAV. For OGG, MP3 or FLAC files, many sounds at once, fades and positional effects, use SDL3_mixer, the companion library, added with FetchContent the same way as SDL3_ttf. It is built on the same streams and devices, so everything in this chapter still applies.")}
      </Callout>

      <H2>{tx(t, "sdl08_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "sdl08_eh0", "Symptom"), tx(t, "sdl08_eh1", "Cause and fix")]}
        rows={[
          [tx(t, "sdl08_e1", "No sound, no error"), tx(t, "sdl08_e1b", "a stream from SDL_OpenAudioDeviceStream was never resumed. Call SDL_ResumeAudioStreamDevice.")],
          [tx(t, "sdl08_e2", "SDL_LoadWAV: Couldn't open …"), tx(t, "sdl08_e2b", "pickup.wav is not in assets/, or the path is relative. Build it with assetPath.")],
          [tx(t, "sdl08_e3", "Chipmunk voice, or deep and slow"), tx(t, "sdl08_e3b", "the spec's freq does not match the data. Use the spec SDL_LoadWAV filled in, not one you typed.")],
          [tx(t, "sdl08_e4", "Loud noise instead of the sound"), tx(t, "sdl08_e4b", "the spec's format is wrong (S16 data declared as F32 or U8), or the byte count is wrong.")],
          [tx(t, "sdl08_e5", "Sounds pile up and play late"), tx(t, "sdl08_e5b", "putting into a stream that is still playing queues the new sound after the old. Clear first, or use one stream per sound.")],
          [tx(t, "sdl08_e6", "Cannot change stream bindings on device opened with SDL_OpenAudioDeviceStream"), tx(t, "sdl08_e6b", "that device belongs to its one stream. Open the device with SDL_OpenAudioDevice and bind your streams to it.")],
          [tx(t, "sdl08_e7", "Crackling when several sounds play"), tx(t, "sdl08_e7b", "the sum passes ±1 and is clamped (clipping). Lower the gains.")],
          [tx(t, "sdl08_e8", "Clicks and gaps in generated sound"), tx(t, "sdl08_e8b", "the callback is too slow or puts too little. Remove allocation, files and logging from it, and fill all of additional_amount.")],
          [tx(t, "sdl08_e9", "Crash on exit in the callback"), tx(t, "sdl08_e9b", "the callback's data was freed while the stream was still bound. Destroy the stream first.")],
        ]}
      />

      <KeyIdeas t={t} id="sdl08" items={[
        "A sample is one measurement of the sound; a sample frame holds one sample per channel; freq counts frames per second.",
        "Bytes per second = freq × channels × bytes per sample: pickup.wav is 44100 B/s, 8820 bytes, 0.2 s.",
        "An audio stream is a queue with a converter: you put in your format, the device takes out its own.",
        "SDL_OpenAudioDeviceStream is one call for one stream, and its device starts paused.",
        "The spec is the only description of your bytes; a wrong one is converted faithfully into the wrong sound.",
        "A stream queues; for two sounds at once, bind two streams to a device opened with SDL_OpenAudioDevice.",
        "The device adds gain × sample over all streams and clamps to ±1; leave headroom to avoid clipping.",
        "A get callback generates sound on demand, on the audio thread: keep it fast, and give it data no one else touches.",
      ]} />

      <Related t={t} links={[
        { track: "SDL3", id: "text", title: tx(t, "sdl08_rel1", "Text with SDL3_ttf"), why: tx(t, "sdl08_rel1b", "the gem and the score this chapter gives a sound.") },
        { track: "SDL3", id: "gpu", title: tx(t, "sdl08_rel2", "SDL_GPU — Modern Graphics"), why: tx(t, "sdl08_rel2b", "the next chapter: SDL's own modern graphics API, in a separate small project.") },
      ]} />
    </Article>
  );
}

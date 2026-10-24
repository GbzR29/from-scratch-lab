// src/lib/tracks/music/descriptions.ts
// What search results show under each Music lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const musicDescriptions: LessonDescriptions = {
  "what-is-sound": {
    en: "What is sound: vibrations that move your eardrum, amplitude, frequency and period, T = 1/f, wavelength λ = v/f, and the range of human hearing.",
    pt: "O que é o som: vibrações que movem o tímpano, amplitude, frequência e período, T = 1/f, comprimento de onda λ = v/f e a faixa da audição humana.",
  },
  pitch: {
    en: "Pitch and frequency: why the ear hears ratios, why octaves sound alike, the semitone ratio 2^(1/12), the frequency of any piano key, and cents.",
    pt: "Altura e frequência: por que o ouvido percebe razões, por que oitavas soam iguais, a razão do semitom 2^(1/12), a frequência de qualquer tecla e cents.",
  },
  timbre: {
    en: "Timbre in music: why instruments sound different on the same note, harmonics, the spectrum of sine, square and sawtooth waves, the missing fundamental.",
    pt: "Timbre na música: por que instrumentos soam diferentes na mesma nota, harmônicos, espectro das ondas senoidal, quadrada e dente de serra e a fundamental ausente.",
  },
  loudness: {
    en: "Loudness and decibels: why sound is measured on a log scale, dB from intensity and pressure, level vs loudness, dynamics, and the ADSR envelope.",
    pt: "Volume e decibéis: por que o som é medido em escala logarítmica, dB por intensidade e pressão, nível vs sensação de volume, dinâmica e o envelope ADSR.",
  },
  pulse: {
    en: "Pulse and tempo: the beat your brain adds, BPM and the length of a beat, tapping a tempo, Italian tempo markings, and when rhythm becomes pitch.",
    pt: "Pulso e andamento: a batida que o cérebro cria, BPM e a duração de um tempo, medir o andamento batendo, termos italianos e quando o ritmo vira altura.",
  },
  durations: {
    en: "Note durations and lengths: whole, half, quarter, eighth and sixteenth notes, rests, dotted notes and ties, subdividing the beat, triplets and swing.",
    pt: "Figuras rítmicas e duração das notas: semibreve, mínima, semínima, colcheia e semicolcheia, pausas, ponto de aumento e ligadura, quiálteras e swing.",
  },
  meter: {
    en: "Meter in music and time signatures: strong and weak beats, bars, simple vs compound meters, 3/4 vs 6/8, odd meters like 5/8 and 7/8, pickups.",
    pt: "Compasso e fórmula de compasso: tempos fortes e fracos, compassos simples vs compostos, 3/4 vs 6/8, compassos ímpares como 5/8 e 7/8, e anacruse.",
  },
  syncopation: {
    en: "Syncopation explained: measuring it with the metrical grid, anticipations, offbeats and the backbeat, the tresillo and the clave, and Euclidean rhythms.",
    pt: "Síncope explicada: medir com a grade métrica, antecipações, contratempos e backbeat, tresillo e clave, e ritmos euclidianos.",
  },
  "note-names": {
    en: "Note names and the piano keyboard: letters C D E F G A B and solfège, finding keys by the black-key groups, octave numbers like C4 and A4, the 88 keys.",
    pt: "Nomes das notas e o teclado: letras C D E F G A B e dó ré mi fá sol lá si, achar as teclas pelos grupos de pretas, números de oitava como C4 e A4, as 88 teclas.",
  },
  staff: {
    en: "How to read the music staff: lines and spaces, treble, bass and alto clefs, the grand staff and middle C, ledger lines, and reading notes fast.",
    pt: "Como ler a pauta musical: linhas e espaços, claves de sol, fá e dó, o sistema de piano e o dó central, linhas suplementares e leitura rápida das notas.",
  },
  accidentals: {
    en: "Sharps, flats and naturals: half and whole steps, which key a written note asks for, enharmonic names like E♯ = F, and the bar-line rule.",
    pt: "Sustenido, bemol e bequadro: tons e semitons, qual tecla uma nota escrita pede, nomes enarmônicos como mi♯ = fá e a regra da barra de compasso.",
  },
  temperament: {
    en: "Equal temperament explained: beating intervals, the Pythagorean comma and wolf fifth, why 12 notes per octave, meantone and well temperament, guitar frets.",
    pt: "Temperamento igual explicado: batimentos, a coma pitagórica e a quinta do lobo, por que 12 notas por oitava, mesotônico e temperamento bom, e trastes do violão.",
  },
  intervals: {
    en: "Music intervals: counting letters, major, minor, perfect, augmented and diminished, enharmonic intervals, inversion, compound intervals, and ear training.",
    pt: "Intervalos musicais: contar as letras, maior, menor, justo, aumentado e diminuto, intervalos enarmônicos, inversão, intervalos compostos e percepção.",
  },
  "major-scale": {
    en: "The major scale: the whole-whole-half pattern, building it on any note, why it is called major, the circle of fifths, key signatures, and transposing.",
    pt: "A escala maior: o padrão tom-tom-semitom, montar em qualquer nota, por que se chama maior, o ciclo das quintas, armaduras de clave e transposição.",
  },
  "minor-scale": {
    en: "Minor scales: the natural minor step pattern, relative and parallel keys, minor key signatures, and the harmonic and melodic minor and why they exist.",
    pt: "Escalas menores: o padrão da menor natural, tonalidades relativas e homônimas, armaduras menores, e as escalas menor harmônica e melódica e por que existem.",
  },
};

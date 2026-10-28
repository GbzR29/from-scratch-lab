"use client";

// Rhythm, hands on: playing a picking pattern in time with a metronome. What
// the click marks, the counting grid that gives every eighth note an address
// (t_k = k·T/2), who plays what (thumb on the bass and the strong beats,
// i m a on the top strings; two hands on the piano), patterns in 4/4, 3/4 and
// 6/8, a step-by-step way to practise with the click, and when to start a
// chord change so the new chord is ready on the 1 (k = ⌈h/τ⌉).

import { H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ForInstrument } from "@/components/lesson/kit/audio/useInstrument";
import { MusicPickingGridFigure } from "@/components/lesson/figures/music/PickingGridFigure";
import { MusicPlayAlongFigure } from "@/components/lesson/figures/music/PlayAlongFigure";
import { MusicChordChangeFigure } from "@/components/lesson/figures/music/ChordChangeFigure";
import { changeNumbers, countName, slotNumbers } from "../live/playing-in-time";

const r = String.raw;

export function PlayingInTimeContent({ t }: { t: TrackTranslations }) {
  const count = countName(t), bar44 = Array.from({ length: 8 }, (_, k) => count(k)).join(" ");
  return (
    <Article>
      <Lead>
        {tx(t, "musPlay_intro",
          "The last four chapters were about rhythm on paper: the beat, durations, meter, syncopation. This one puts it in your hands. The most common trouble when learning to pick a chord is not the fingers, it is time: the metronome clicks four times a bar, the pattern has eight notes, and it is not clear which notes go with the click and which do not. The answer is exact, and once you can say it out loud, the pattern stops being a blur.")}
      </Lead>

      <Goals t={t} id="musPlay" items={[
        "Say what the metronome click marks, and why most notes of a picking pattern do not fall on a click.",
        "Give every note of a bar its address by counting \"1 & 2 & 3 & 4 &\", and compute when it sounds: t = k·T/2.",
        "Assign the fingers: the thumb on the bass and the strong beats, i, m and a on the top strings (or the two hands on the piano).",
        "Practise with the metronome in steps: count, thumb alone, fingers alone, everything, then raise the tempo.",
        "Plan a chord change so the new chord is ready on the 1, starting k = ⌈h/τ⌉ notes before it.",
      ]} />

      <H2>{tx(t, "musPlay_clickTitle", "What the click marks")}</H2>
      <p>
        {tx(t, "musPlay_clickBody",
          "A metronome clicks the beat, the pulse you would tap your foot to (chapter 5). In 4/4 there are four beats in a bar, and the first is the strongest (chapter 7), which is why many metronomes give it a higher click. That is all the metronome says: where the beats are. It knows nothing about your notes.")}
      </p>
      <p>
        {tx(t, "musPlay_clickProblem",
          "A typical picking pattern plays eight notes in that bar, twice as many as there are clicks. So \"do I play with the click?\" has two answers: half of the notes, yes, exactly with it; the other half, no, exactly in the middle between two clicks. The confusion comes from treating all eight the same: trying to hear every note as \"with\" a click, or filling the gaps with whatever fits and hoping. The cure is to give every note a name before you play it.")}
      </p>

      <H2>{tx(t, "musPlay_gridTitle", "Every note has an address")}</H2>
      <p>
        {tx(t, "musPlay_gridBody",
          "Split each beat in two (an eighth note is half a beat, chapter 6) and count the halves out loud: \"1 & 2 & 3 & 4 &\" (in Portuguese, \"1 e 2 e 3 e 4 e\"). The numbers are the beats, so they fall on the clicks. Each \"&\" is the second half of a beat, so it falls exactly halfway to the next click. Every note of the pattern now has an address: the thumb on \"1\", the index finger on the \"&\" after it, and so on. Instead of \"the second note, somewhere after the click\", you know that it is the \"&\" of 1, and where the \"&\" is.")}
      </p>
      <Derivation t={t} label={tx(t, "musPlay_dTitle", "When each eighth note of a bar sounds")}
        steps={[
          { tex: r`T = \frac{60}{\text{BPM}}`, why: tx(t, "musPlay_d0", "the time from one click to the next, in seconds (chapter 5): 60 seconds in a minute shared among BPM clicks") },
          { tex: r`\tau = \frac{T}{2}`, why: tx(t, "musPlay_d1", "an eighth note is half a beat, so the notes of the pattern are τ apart: half the gap between clicks") },
          { tex: r`t_k = k\,\tau, \qquad k = 0, 1, \dots, 7`, why: tx(t, "musPlay_d2", "number the eighths of the bar from 0, counting from the first click (the 1). Note k starts k steps of τ after it") },
          { tex: r`k = 2j \;\Rightarrow\; t_k = j\,T`, why: tx(t, "musPlay_d3", "an even k is a whole number of beats: the note lands exactly on click j + 1, and is counted with that number (k = 2 is j = 1: beat 2)") },
          { tex: r`k = 2j + 1 \;\Rightarrow\; t_k = \bigl(j + \tfrac12\bigr)\,T`, why: tx(t, "musPlay_d4", "an odd k is half a beat past click j + 1: exactly in the middle of the silence before the next click. That is the \"&\"") },
        ]} />
      <Equation label={tx(t, "musPlay_eqT", "The start of eighth note k")}
        where={[
          [r`t_k`, tx(t, "musPlay_wtk", "when note k sounds, in seconds after the first click of the bar")],
          [r`k`, tx(t, "musPlay_wk", "which eighth of the bar: 0 is \"1\", 1 is the \"&\" of 1, 2 is \"2\"… up to 7, the \"&\" of 4")],
          [r`T`, tx(t, "musPlay_wT", "the gap between clicks, 60/BPM seconds")],
          [r`\tfrac{T}{2}`, tx(t, "musPlay_wtau", "the gap between two eighths, written τ: half a beat")],
        ]}
        words={tx(t, "musPlay_eqWords", "Even notes land on a click; odd notes land exactly halfway to the next one.")}>
        {r`t_k = k \cdot \frac{T}{2} = k \cdot \frac{60}{2\,\text{BPM}}`}
      </Equation>
      <p>
        {tx(t, "musPlay_table",
          "At 60 BPM the clicks are one second apart, which makes the numbers easy to see:")}
      </p>
      <LessonTable
        headers={[tx(t, "musPlay_tK", "note k"), tx(t, "musPlay_tSay", "you say"), tx(t, "musPlay_tTime", "time (60 BPM)"), tx(t, "musPlay_tWhere", "where")]}
        rows={Array.from({ length: 8 }, (_, k) => [
          String(k), count(k), `${k * 500} ms`,
          k % 2 === 0 ? tx(t, "musPlay_tWith", "with a click") : tx(t, "musPlay_tMid", "halfway between clicks"),
        ])}
      />
      <LiveFormula label={tx(t, "musPlay_liveSlot", "Try it: where does a note fall?")}
        tex={r`t_k = k \cdot \frac{T}{2}`}
        vars={[
          { id: "bpm", label: tx(t, "musPlay_liveBpm", "tempo (BPM)"), min: 40, max: 160, step: 1, value: 60, fmt: v => `${v}` },
          { id: "k", label: tx(t, "musPlay_liveK", "note of the bar"), min: 0, max: 7, step: 1, value: 3, fmt: v => `${v} (“${v % 2 ? `${(v - 1) / 2 + 1} ` : ""}${count(v)}”)` },
        ]}
        compute={slotNumbers(t)}
        where={[
          [r`\tau`, tx(t, "musPlay_wtauLive", "the gap between two notes of the pattern, T/2")],
        ]}
        note={tx(t, "musPlay_liveSlotNote", "At 60 BPM an \"&\" comes 500 ms after its click; at 120 BPM only 250 ms. The tempo changes the gaps, never the address: an \"&\" is always halfway.")} />
      <p>
        {tx(t, "musPlay_halfway",
          "\"Halfway\" is meant exactly. In a steady stream of notes, trained ears notice a note that is off by a few percent of the gap, around 10 to 20 milliseconds at these speeds. An \"&\" that drifts towards the next click sounds rushed, one that hangs back after its click sounds lazy, even when every number lands perfectly.")}
      </p>

      <H3>{tx(t, "musPlay_sixTitle", "Faster patterns: four notes a beat")}</H3>
      <p>
        {tx(t, "musPlay_sixBody",
          "Some patterns play four notes a beat: sixteenth notes. Count them \"1 e & a 2 e & a…\" (in Portuguese \"1 i e a 2 i e a…\"). The method is the same, with τ = T/4 and sixteen addresses a bar instead of eight: \"1\" with the click, \"&\" halfway, \"e\" and \"a\" a quarter of the way on either side of it. Learn the eighths first; the sixteenths are the same idea, cut once more.")}
      </p>

      <H2>{tx(t, "musPlay_whoTitle", "Who plays what")}</H2>
      <ForInstrument only="guitar">
        <p>
          {tx(t, "musPlay_gtFingers",
            "Guitarists name the picking fingers with the first letters of their Spanish names: p (pulgar, the thumb), i (índice, index), m (medio, middle) and a (anular, ring). A simple rule assigns them: one finger per string. The thumb plays the three bass strings, 6, 5 and 4; i plays string 3, m string 2 and a string 1, the thinnest. The fretting hand holds the chord, and the picking hand just follows the pattern, so a pattern written in letters works over any chord.")}
        </p>
        <p>
          {tx(t, "musPlay_gtBass",
            "The thumb plays the bass: the chord's root (the note that names it; for C, the C on string 5, fret 3), often alternating with another low string of the chord. In almost every pattern the thumb lands on the strong beats, 1 and 3 or all four. That makes it your anchor: if the thumb is with the click, the fingers have fixed places to go between.")}
        </p>
      </ForInstrument>
      <ForInstrument only="piano">
        <p>
          {tx(t, "musPlay_pnHands",
            "On the piano the same pattern is shared between the hands. The left hand plays the bass: the fifth finger on the chord's root (for C, the C an octave below middle C), the thumb on the second bass note. The right hand holds the three upper notes of the chord and plays them one at a time, with fingers 1, 3 and 5. The notes are the same ones a guitar plays in that chord, so the patterns in this chapter are the same for both instruments; on the piano they are called broken chords, and the left-hand bass alternating with the chord is the oldest accompaniment in the book.")}
        </p>
        <p>
          {tx(t, "musPlay_pnBass",
            "As on the guitar, the bass lands on the strong beats. Keep the left hand with the click and let the right hand fill the halves in between.")}
        </p>
      </ForInstrument>
      <p>
        {tx(t, "musPlay_whyBass",
          "Why the bass on the strong beats? Partly harmony: the bass note tells the ear which chord it is, so it belongs where the bar is felt most. Partly the ear itself: in 2014 Michael Hove and colleagues played two streams of tones, one low and one high, and nudged a note off time in one of them. Listeners' brains caught the slip better in the low stream, and when they tapped along, the low stream moved their taps more. Low notes carry the rhythm, which is why bass players and drummers keep time for the band.")}
      </p>
      <LessonTable
        headers={[tx(t, "musPlay_rRole", "part"), tx(t, "musPlay_rGuitar", "guitar"), tx(t, "musPlay_rPiano", "piano"), tx(t, "musPlay_rWhen", "usually on")]}
        rows={[
          [tx(t, "musPlay_rBass", "bass"), tx(t, "musPlay_rBassG", "thumb p, strings 6–4"), tx(t, "musPlay_rBassP", "left hand, fingers 5 and 1"), tx(t, "musPlay_rBassW", "the numbers: 1, 3 (or 1 2 3 4)")],
          [tx(t, "musPlay_rTop", "top notes"), tx(t, "musPlay_rTopG", "i, m, a on strings 3, 2, 1"), tx(t, "musPlay_rTopP", "right hand, fingers 1, 3, 5"), tx(t, "musPlay_rTopW", "the \"&\"s, and the numbers the bass leaves free")],
        ]}
      />

      <MusicPickingGridFigure t={t} />

      <p>
        {tx(t, "musPlay_patterns",
          "The four 4/4 presets are the patterns that open most method books. Say each one aloud with its count before playing it:")}
      </p>
      <LessonTable
        headers={[tx(t, "musPlay_pName", "pattern"), tx(t, "musPlay_pCount", "count"), tx(t, "musPlay_pFingers", "fingers"), tx(t, "musPlay_pNote", "what to notice")]}
        rows={[
          [tx(t, "musPlay_pPima", "p i m a"), bar44, "p i m a p i m a", tx(t, "musPlay_pPimaN", "the thumb on 1 and 3; m lands on the clicks of 2 and 4")],
          [tx(t, "musPlay_pPimi", "p i m i"), bar44, "p i m i p i m i", tx(t, "musPlay_pPimiN", "i plays every \"&\": the easiest one to keep even")],
          [tx(t, "musPlay_pAlt", "alternating bass"), bar44, "p m p i p m p a", tx(t, "musPlay_pAltN", "the thumb on every click, switching strings; the fingers only on the \"&\"s")],
          [tx(t, "musPlay_pPinch", "pinch"), bar44, "pa i m i pa i m i", tx(t, "musPlay_pPinchN", "p and a pluck together on 1 and 3, like a small chord")],
        ]}
      />

      <H2>{tx(t, "musPlay_threeTitle", "Patterns in 3/4 and 6/8")}</H2>
      <p>
        {tx(t, "musPlay_threeBody",
          "In 3/4 there are three clicks a bar, and the count is \"1 & 2 & 3 &\": six eighths. The waltz pattern is the plainest of all, bass on 1 and the chord on 2 and on 3, \"oom-pah-pah\". An arpeggio fills the halves: p i m a m i, the thumb alone on the 1.")}
      </p>
      <p>
        {tx(t, "musPlay_sixEightBody",
          "6/8 also has six eighths, but grouped the other way (chapter 7): two beats, each split in three. Count \"1 2 3 4 5 6\", with the weight on 1 and 4. The metronome is usually set to those two beats, the dotted quarter, so each click is followed by two notes before the next one, a third and two thirds of the way: τ = T/3. If two clicks a bar feel too sparse at first, set the metronome three times faster so it clicks every eighth, and slow it back down once the groups of three feel natural. Many picked ballads sit in 6/8; the slow, rolling feel of \"House of the Rising Sun\" is exactly this pattern.")}
      </p>

      <H2>{tx(t, "musPlay_practTitle", "Practising with the metronome")}</H2>
      <p>
        {tx(t, "musPlay_practBody",
          "Playing in time is a skill of its own, separate from knowing the notes, and it is trained the same way: slowly, one layer at a time. The order below adds one thing per step, and each step uses the one before as its scaffold:")}
      </p>
      <LessonTable
        headers={[tx(t, "musPlay_sStep", "step"), tx(t, "musPlay_sDo", "what to do"), tx(t, "musPlay_sWhy", "why")]}
        rows={[
          ["1", tx(t, "musPlay_s1", "Pick a tempo where you can play the whole pattern without a single slip, even if it is 40 BPM."), tx(t, "musPlay_s1W", "every slow, correct bar teaches the timing; a fast, messy one teaches the mess")],
          ["2", tx(t, "musPlay_s2", "Start the click and count aloud \"1 & 2 & 3 & 4 &\" for a bar or two without playing."), tx(t, "musPlay_s2W", "you hear where the \"&\"s are before your hands have to find them")],
          ["3", tx(t, "musPlay_s3", "Play only the thumb, still counting."), tx(t, "musPlay_s3W", "the thumb is on the clicks: the easiest part, and the anchor of the rest")],
          ["4", tx(t, "musPlay_s4", "Play only the fingers, saying the numbers where the thumb would be."), tx(t, "musPlay_s4W", "most finger notes are between clicks; alone, you can hear if they are in the middle")],
          ["5", tx(t, "musPlay_s5", "Play everything, counting aloud."), tx(t, "musPlay_s5W", "the count holds the two parts together")],
          ["6", tx(t, "musPlay_s6", "Turn on a soft click between the beats, then turn it off again."), tx(t, "musPlay_s6W", "the extra click checks each \"&\"; without it, you supply the halves yourself")],
          ["7", tx(t, "musPlay_s7", "After a few clean bars, raise the tempo by 4 or 5 BPM. When it breaks, go back down."), tx(t, "musPlay_s7W", "small steps keep you on the edge of what you can do, not past it")],
          ["8", tx(t, "musPlay_s8", "Advanced: set the click to half speed and hear it as beats 2 and 4, or only as the 1."), tx(t, "musPlay_s8W", "the less the click gives you, the more of the beat you keep inside")],
        ]}
      />
      <p>
        {tx(t, "musPlay_early",
          "Expect to be early at first. When people tap along with a metronome, their taps land on average a few tens of milliseconds before the clicks; researchers call it negative mean asynchrony, and it is one of the best-documented results in the study of timing (reviewed by Bruno Repp in 2005). Musicians show less of it, but it rarely vanishes. The play-along widget below shows your offsets; an average of 20 ms early is normal, 100 ms is rushing.")}
      </p>

      <MusicPlayAlongFigure t={t} />

      <H2>{tx(t, "musPlay_changeTitle", "Changing chords on time")}</H2>
      <p>
        {tx(t, "musPlay_changeBody",
          "The other big source of trouble is the chord change. The new chord has to sound on the 1 of its bar, but the fretting hand cannot jump instantly: lifting the fingers, moving them and pressing them down takes time, h, maybe 300 to 600 ms while you are learning. If you only start moving on the 1, you are already late. So you start before it, and the counting grid tells you exactly how much before.")}
      </p>
      <Derivation t={t} label={tx(t, "musPlay_cTitle", "When to start the change")}
        steps={[
          { tex: r`\tau = \frac{60}{2\,\text{BPM}}`, why: tx(t, "musPlay_c0", "the time between two notes of the pattern, from the first section: half a beat") },
          { tex: r`h`, why: tx(t, "musPlay_c1", "the time your hand needs to go from one chord to the other. Time it with the widget below, or by ear: it gets shorter with practice") },
          { tex: r`k\,\tau \ge h`, why: tx(t, "musPlay_c2", "if you lift the hand k notes before the 1, it has k·τ seconds to get there. That must be at least h") },
          { tex: r`k = \left\lceil \frac{h}{\tau} \right\rceil`, why: tx(t, "musPlay_c3", "the smallest whole k that works: h/τ rounded up (⌈ ⌉ means round up). Rounding down would leave the hand short") },
          { tex: r`\text{${tx(t, "musPlay_cLift", "lift on note")}}\ 8 - k`, why: tx(t, "musPlay_c4", "in a bar of eight notes numbered 0 to 7, k notes before the next 1 is note 8 − k. With k = 1 that is note 7, the last \"&\"; with k = 2, note 6, beat 4") },
        ]} />
      <Equation label={tx(t, "musPlay_eqK", "How many notes ahead to start a chord change")}
        where={[
          [r`k`, tx(t, "musPlay_wkc", "how many notes before the 1 the fretting hand leaves the old chord")],
          [r`h`, tx(t, "musPlay_wh", "the time the hand needs for the change, in seconds")],
          [r`\tau`, tx(t, "musPlay_wtauc", "the gap between notes of the pattern, 60/(2·BPM)")],
          [r`\lceil\ \rceil`, tx(t, "musPlay_wceil", "round up to a whole number")],
        ]}
        words={tx(t, "musPlay_eqKWords", "Divide the hand's time by the gap between notes and round up: that is how many notes early you let go.")}>
        {r`k = \left\lceil \frac{h}{\tau} \right\rceil = \left\lceil \frac{2\,\text{BPM} \cdot h}{60} \right\rceil`}
      </Equation>
      <LiveFormula label={tx(t, "musPlay_liveChange", "Try it: your tempo, your hand")}
        tex={r`k = \left\lceil \frac{h}{\tau} \right\rceil`}
        vars={[
          { id: "bpm", label: tx(t, "musPlay_liveBpm", "tempo (BPM)"), min: 40, max: 160, step: 1, value: 70, fmt: v => `${v}` },
          { id: "h", label: tx(t, "musPlay_liveH", "the hand needs (ms)"), min: 100, max: 1200, step: 10, value: 400, fmt: v => `${v} ms` },
        ]}
        compute={changeNumbers(t)}
        where={[
          [r`k`, tx(t, "musPlay_wkLive", "notes before the 1; the last line says on which count to lift")],
        ]}
        note={tx(t, "musPlay_liveChangeNote", "At 70 BPM a hand that needs 400 ms lifts on the last \"&\". Push the tempo to 100 and the same hand must lift on beat 4. This is why a song you can play slowly falls apart when you speed it up: the change, not the picking, runs out of time.")} />
      <p>
        {tx(t, "musPlay_tricks",
          "Three habits make the change easier. First, the note you pick while the hand is in the air rings as an open string; that is normal, and guitarists rely on it, which is why the last \"&\" of so many patterns is a top string. Second, put down first the finger of the bass string, because the thumb needs it on the 1; the others can land a moment later. Third, if you are late anyway, keep the beat: play the 1 on time even with the hand not ready. A slightly wrong chord in the right place sounds far better than the right chord late, and the band (or the song in your head) never stops for you. Practise the change alone, too: switch between two chords for a minute, with no picking at all, and count how many changes you make; the number goes up quickly.")}
      </p>

      <MusicChordChangeFigure t={t} />

      <H2>{tx(t, "musPlay_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "musPlay_mWhat", "what you hear"), tx(t, "musPlay_mWhy", "usual cause"), tx(t, "musPlay_mFix", "fix")]}
        rows={[
          [tx(t, "musPlay_m1", "the \"&\"s come too soon, the pattern rushes"), tx(t, "musPlay_m1W", "the fingers move as soon as the click sounds"), tx(t, "musPlay_m1F", "say the \"&\" aloud; turn on the soft click between beats")],
          [tx(t, "musPlay_m2", "the 1 after a chord change is late"), tx(t, "musPlay_m2W", "the hand leaves the old chord too late"), tx(t, "musPlay_m2F", "lift k = ⌈h/τ⌉ notes early; bass finger first")],
          [tx(t, "musPlay_m3", "the song speeds up as it goes"), tx(t, "musPlay_m3W", "easy bars get played faster, hard ones slower"), tx(t, "musPlay_m3F", "keep the click on from start to end; record yourself")],
          [tx(t, "musPlay_m4", "the beat gets lost in the notes"), tx(t, "musPlay_m4W", "the top strings are brighter and drown the bass"), tx(t, "musPlay_m4F", "play the thumb a little stronger, most of all on the 1")],
          [tx(t, "musPlay_m5", "every mistake stops the music"), tx(t, "musPlay_m5W", "fixing the note matters more to you than the beat"), tx(t, "musPlay_m5F", "keep going: the next 1 comes anyway, be there")],
        ]}
      />

      <p>
        {tx(t, "musPlay_next",
          "This closes the rhythm section: pulse and tempo, durations, meter, syncopation, and now playing them in time. The next section turns to the notes themselves: their names, the keys of the piano and why they come in a pattern of 7 white and 5 black. That pattern was already in the last widget of the syncopation chapter: spread 7 notes over 12 pulses and you get the West African bell, gaps 2 2 1 2 2 2 1. Keep it in mind; it will come back as the major scale.")}
      </p>

      <KeyIdeas t={t} id="musPlay" items={[
        "The metronome clicks only the beats; a picking pattern of eighth notes has twice as many notes as clicks.",
        "Count \"1 & 2 & 3 & 4 &\": notes on the numbers sound with a click, notes on the \"&\"s exactly halfway between two (t = k·T/2).",
        "One finger per string: the thumb on the bass strings and the strong beats, i, m, a on strings 3, 2, 1; on the piano, left hand bass and right hand chord.",
        "3/4 counts \"1 & 2 & 3 &\"; 6/8 counts \"1 2 3 4 5 6\" with clicks on 1 and 4.",
        "Practise in layers at a tempo with no slips: count, thumb, fingers, everything, then +4 or 5 BPM; being a little early is normal.",
        "Start a chord change k = ⌈h/τ⌉ notes before the 1, bass finger first; if late, keep the beat.",
      ]} />
    </Article>
  );
}

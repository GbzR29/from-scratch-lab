// src/lib/tracks/glsl/chapters/effects/fire.tsx
"use client";

import { Callout, CodeBlock, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BlackbodyFigure } from "@/components/lesson/figures/fire/BlackbodyFigure";
import { FlameFigure } from "@/components/lesson/figures/fire/FlameFigure";
import { SmokeFigure } from "@/components/lesson/figures/fire/SmokeFigure";
import { wienNumbers, puffNumbers } from "../../live/fire";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Fire & Smoke
// ═════════════════════════════════════════════════════════════════════════════

export function FireContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslFire_intro",
          "A flame has no surface to shade. It is hot gas full of glowing specks, and its colour is set by one number, the temperature, through a law of physics that also colours molten iron, light bulbs and stars. Smoke is the opposite: it gives off no light, only blocks and scatters the light that passes through it. This chapter builds both: a flame as a temperature field painted with Planck's law, and smoke as a volume the ray has to march through.")}
      </Lead>

      <Goals t={t} id="glslFire" items={[
        "Say what makes a flame yellow and what makes it blue.",
        "Use Planck's law to turn a temperature into a colour, and Wien's law to find where the light peaks.",
        "Build a flickering flame from a temperature field and rising noise.",
        "Render smoke as a volume: transmittance, scattered sunlight and self-shadowing.",
      ]} />

      <GlowSection t={t} />
      <FlameSection t={t} />
      <SmokeSection t={t} />

      <KeyIdeas t={t} id="glslFire" items={[
        "The yellow of a flame is soot glowing because it is hot (incandescence); the blue at its base is CH and C₂ molecules giving off light at their own fixed wavelengths.",
        "A hot body's spectrum is Planck's law, and its colour is that spectrum seen through the eye's three colour curves.",
        "The peak moves as λmax·T = 2898 µm·K and the total power grows as T⁴: hotter is whiter and far brighter, never green.",
        "A flame is a temperature field: a teardrop shape, eaten into by noise that scrolls upwards faster the hotter the gas, coloured through a blackbody table.",
        "Buoyant gas speeds up as it rises, so the flame narrows; large fires puff at about f ≈ 1.5/√D Hz.",
        "Smoke is rendered by marching: each step lets through e^(−σt·dt) and adds S·(1 − e^(−σt·dt))/σt of scattered light.",
        "Self-shadowing needs a second march towards the light at every step: that is what makes a volume look round, and most of its cost.",
        "Albedo σs/σt decides the smoke's colour: about 0.3 for soot, 0.99 for steam.",
      ]} />
    </Article>
  );
}

// ── What glows in a flame ─────────────────────────────────────────────────────

function GlowSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslFire_glowTitle", "What glows in a flame")}</H2>
      <p>
        {tx(t, "glslFire_glowBody",
          "Burning is fuel reacting with oxygen and releasing heat. A candle flame has three kinds of light in it, and only one of them is hot stuff glowing:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslFire_thPart", "part"), tx(t, "glslFire_thWhat", "what makes the light"), tx(t, "glslFire_thLook", "what it looks like")]}
        rows={[
          [tx(t, "glslFire_p1", "the bright body"), tx(t, "glslFire_p1w", "tiny specks of soot (carbon), formed where fuel is heated without enough air, glowing because they are hot: incandescence"), tx(t, "glslFire_p1l", "yellow-orange, a smooth spectrum set by the temperature")],
          [tx(t, "glslFire_p2", "the base and the edge"), tx(t, "glslFire_p2w", "CH and C₂ molecules, left excited by the reactions, dropping back and emitting at their own wavelengths (431 nm and 516 nm): chemiluminescence"), tx(t, "glslFire_p2l", "faint blue, the same at any temperature")],
          [tx(t, "glslFire_p3", "the smoke above"), tx(t, "glslFire_p3w", "soot that cooled before it could burn; it no longer glows, it only blocks and scatters light"), tx(t, "glslFire_p3l", "grey or black, lit by its surroundings")],
        ]} />
      <p>
        {tx(t, "glslFire_planckBody",
          "Anything hot glows, and how much light it gives at each wavelength depends only on its temperature. Max Planck found the formula in 1900, and to make it work he had to assume that light is emitted in packets of energy hν, the start of quantum physics. A body that absorbs all light (a blackbody) emits exactly this; soot is close to one:")}
      </p>
      <Equation label={tx(t, "glslFire_planckLabel", "Planck's law")}
        where={[
          [r`B(\lambda, T)`, tx(t, "glslFire_wB", "the light given off per wavelength, per area, per direction")],
          [r`\lambda`, tx(t, "glslFire_wL", "the wavelength, in metres")],
          [r`T`, tx(t, "glslFire_wT", "the temperature, in kelvin (degrees Celsius + 273)")],
          [r`h,\ c,\ k`, tx(t, "glslFire_wConst", "Planck's constant 6.626 × 10⁻³⁴ J·s, the speed of light 2.998 × 10⁸ m/s, Boltzmann's constant 1.381 × 10⁻²³ J/K")],
        ]}
        words={tx(t, "glslFire_planckWords", "The first factor grows quickly at short wavelengths; the second shuts them off unless the temperature is high enough to supply packets of energy hc/λ. Their product is a hump whose peak slides to shorter wavelengths as the temperature rises.")}>
        {r`B(\lambda, T) = \frac{2hc^2}{\lambda^5}\;\frac{1}{e^{hc/(\lambda k T)} - 1}`}
      </Equation>
      <Derivation t={t} label={tx(t, "glslFire_wienDer", "Where the hump peaks: Wien's law")}
        where={[
          [r`x`, tx(t, "glslFire_wX", "the shorthand hc/(λkT), a number without units")],
        ]}
        steps={[
          { full: true, tex: r`B \propto \lambda^{-5}\,\big(e^{x} - 1\big)^{-1}, \qquad x = \frac{hc}{\lambda k T}`,
            why: tx(t, "glslFire_w1", "drop the constants in front: they do not move the peak") },
          { full: true, tex: r`\frac{dB}{d\lambda} = 0 \;\Rightarrow\; -5 + \frac{x\,e^{x}}{e^{x} - 1} = 0`,
            why: tx(t, "glslFire_w2", "differentiate with respect to λ (x depends on λ, with dx/dλ = −x/λ), set it to zero and multiply through by λ⁶(e^x − 1)") },
          { full: true, tex: r`x = 5\,(1 - e^{-x}) \;\Rightarrow\; x \approx 4.965`,
            why: tx(t, "glslFire_w3", "rearrange. This has no neat solution, but iterating it from x = 5 settles in two or three steps") },
          { full: true, tex: r`\lambda_{max}\, T = \frac{hc}{4.965\,k} \approx 2898\ \mu\text{m·K}`,
            why: tx(t, "glslFire_w4", "put back what x stands for. Double the temperature and the peak moves to half the wavelength") },
        ]} />
      <p>
        {tx(t, "glslFire_stefanBody",
          "Adding up all wavelengths gives the total power, which grows as T⁴ (the Stefan–Boltzmann law): twice as hot is sixteen times as bright. A candle's soot at about 1850 K peaks at 1.6 µm, in the infrared; less than half a percent of its light is visible, and the visible part is the short tail, orange-yellow. The colour of a blackbody is its curve weighed by the eye's three colour curves (the same CIE curves the prism and the diamond used), which is how the table used by the shaders in this chapter is built.")}
      </p>
      <LiveFormula label={tx(t, "glslFire_liveWien", "Try it: where is the peak?")}
        tex={r`\lambda_{max} = \frac{2898\ \mu\text{m·K}}{T}, \qquad P \propto T^4`}
        vars={[{ id: "T", label: "T", min: 700, max: 12000, step: 50, value: 1850, fmt: v => `${v} K` }]}
        compute={wienNumbers(t)}
        note={tx(t, "glslFire_liveWienNote", "At 1850 K the peak is at 1.57 µm, more than twice the longest visible wavelength. An electric stove ring at 900 K peaks at 3.2 µm and only just glows. The Sun's surface, 5800 K, peaks at 0.5 µm, in the middle of the visible band, and is 1100 times brighter per square metre than the 1000 K reference.")} />
      <BlackbodyFigure t={t} />
    </>
  );
}

// ── A flame in a shader ───────────────────────────────────────────────────────

function FlameSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslFire_flameTitle", "A flame in a shader")}</H2>
      <p>
        {tx(t, "glslFire_shapeBody",
          "A flame's shape comes from buoyancy. Gas at 1500 K is five times lighter than the air around it, so it is pushed upwards and keeps speeding up as it rises. The same amount of gas passes every height each second, so where it moves faster it must be narrower, like water falling from a tap. That is why a candle flame tapers to a point:")}
      </p>
      <Equation label={tx(t, "glslFire_buoyLabel", "Why the flame narrows")}
        where={[
          [r`g'`, tx(t, "glslFire_wG", "the reduced gravity of hot gas in cold air: g·(T_flame − T_air)/T_air, about 40 m/s² for a flame")],
          [r`y`, tx(t, "glslFire_wY", "the height above the wick")],
          [r`v,\ A`, tx(t, "glslFire_wVA", "the gas's speed and the flame's cross-section at that height")],
        ]}
        words={tx(t, "glslFire_buoyWords", "Speed grows like a falling object's, but upwards: v = √(2g′y), about 1.5 m/s at 3 cm. The flow ρvA stays the same at every height, so the area shrinks as 1/v and the width as y^(−1/4).")}>
        {r`v = \sqrt{2 g' y}, \qquad \rho\,v\,A = \text{const} \;\Rightarrow\; A \propto y^{-1/2}`}
      </Equation>
      <p>
        {tx(t, "glslFire_recipeBody",
          "A shader cannot afford to simulate the gas, so it fakes the result: a temperature field T(x, y). Start from a teardrop: hottest on the axis, cooling outwards and upwards. Then scroll a noise upwards at the gas's speed and let it eat into the shape, a little at the bottom, a lot near the tip: the top breaks into tongues that rise and vanish, which is exactly how flames flicker. Last, turn the temperature into light with the blackbody table.")}
      </p>
      <CodeBlock lang="glsl" filename="flame.frag" t={t}>{`float y = (p.y - base.y) / H;                        // 0 at the root, 1 at the tip
float n = fbm(vec2(p.x / W, y * 2.2 - time * rise)); // noise rising with the hot gas
float x = p.x + (n - 0.5) * turb * W * y;             // sway more higher up
float w = W * pow(y, 0.45) * pow(1.0 - 0.85 * y, 0.9) * 1.6;   // teardrop width
float shape = 1.0 - (x / w) * (x / w) - 0.35 * y;     // hot on the axis, cooler outwards and up
shape -= (1.0 - n) * turb * y * 1.3;                  // the noise eats the top into tongues
float T = Tmax * pow(clamp(shape, 0.0, 1.0), 0.45);
vec3 light = blackbody(T);                             // colour × brightness, from a table`}</CodeBlock>
      <p>
        {tx(t, "glslFire_lutBody",
          "blackbody(T) reads a small table filled on the CPU: for 48 temperatures between 700 and 3300 K, the colour and the visible brightness, relative to 2000 K. The brightness changes enormously, about 700 times between 1300 K and 2000 K, so a dim campfire and a bright candle need very different exposures, just as they would for a camera.")}
      </p>
      <H3>{tx(t, "glslFire_puffTitle", "Why big fires breathe")}</H3>
      <p>
        {tx(t, "glslFire_puffBody",
          "A large fire does not just flicker at random. Air drawn in at the bottom rolls up into a ring vortex that lifts away, pinching the flames off in puffs at a steady rhythm. Measured across fires from centimetres to tens of metres, the frequency follows a simple rule: bigger fires breathe more slowly. The campfire in the widget swells and shrinks at this rate.")}
      </p>
      <LiveFormula label={tx(t, "glslFire_livePuff", "Try it: how fast does a fire puff?")}
        tex={r`f \approx \frac{1.5}{\sqrt{D}}\ \text{Hz}, \quad D \text{ in metres}`}
        vars={[{ id: "D", label: "D", min: 0.05, max: 30, step: 0.05, value: 0.8, fmt: v => `${v} m` }]}
        compute={puffNumbers()}
        note={tx(t, "glslFire_livePuffNote", "A 0.8 m campfire puffs 1.7 times a second; a 10 m pool fire about once every two seconds. A candle is too small for this rule: its flicker comes from draughts and from the wick.")} />
      <FlameFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "glslFire_gameTip", "Many games draw fire as particles: small camera-facing quads, each carrying a flame texture or a few frames of a filmed flame, spawned at the base and rising, growing and fading. The temperature idea still applies: the particle carries a temperature that drops as it ages, and the colour comes from the same kind of table. Adding the particles' light together (additive blending) gives the bright, self-lit look.")}
      </Callout>
    </>
  );
}

// ── Smoke ─────────────────────────────────────────────────────────────────────

function SmokeSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslFire_smokeTitle", "Smoke: rendering a volume")}</H2>
      <p>
        {tx(t, "glslFire_smokeBody",
          "Smoke has no surface for a ray to hit. Light passes into it, and on the way some is absorbed, some is scattered off in other directions, and some is scattered towards your eye. So the ray does not stop at the smoke: it marches through, adding up what happens at every step. Two coefficients describe the smoke at each point: σa, how much it absorbs per metre, and σs, how much it scatters. Their sum σt is the extinction from the Fog chapter.")}
      </p>
      <Derivation t={t} label={tx(t, "glslFire_volDer", "The volume rendering loop")}
        where={[
          [r`L`, tx(t, "glslFire_wLight", "the light travelling along the ray towards the eye")],
          [r`\sigma_t = \sigma_a + \sigma_s`, tx(t, "glslFire_wSig", "extinction per metre: absorbed plus scattered away")],
          [r`S`, tx(t, "glslFire_wS", "light added per metre: σs times the light arriving at that point (from the sun and the sky), plus anything glowing there")],
          [r`T`, tx(t, "glslFire_wTr", "transmittance: the fraction of light that gets through everything so far")],
        ]}
        steps={[
          { full: true, tex: r`\frac{dL}{ds} = -\sigma_t L + S`,
            why: tx(t, "glslFire_v1", "over a short distance ds, a fraction σt·ds of the light is lost and S·ds is added. This is the radiative transfer equation along one ray") },
          { full: true, tex: r`T(s) = e^{-\int_0^s \sigma_t\,ds'}`,
            why: tx(t, "glslFire_v2", "with no source, the solution is Beer–Lambert again: light from distance s reaches the eye reduced by T(s)") },
          { full: true, tex: r`L = \int_0^D T(s)\,S(s)\,ds \;+\; T(D)\,L_{behind}`,
            why: tx(t, "glslFire_v3", "every bit of the ray adds its S·ds, dimmed by the smoke between it and the eye, and what is behind the smoke shows through T of the whole way") },
          { full: true, tex: r`\begin{gathered} L \mathrel{+}= T\cdot S\,\frac{1 - e^{-\sigma_t\,\Delta t}}{\sigma_t} \\[2pt] T \mathrel{*}= e^{-\sigma_t\,\Delta t} \end{gathered}`,
            why: tx(t, "glslFire_v4", "split the ray into steps of length Δt and treat σt and S as constant in each: the integral over one step is exact. Adding just S·Δt instead overshoots in thick smoke, where light from the far end of a step is already dimmed") },
        ]} />
      <CodeBlock lang="glsl" filename="smoke.frag" t={t}>{`vec3 L = vec3(0.0); float T = 1.0;
for (int i = 0; i < STEPS; i++, t += dt) {
    vec3 p = ro + rd * t;
    float st = density(p) * sigmaMax;                 // σt here
    // sunlight that reaches p: a short march towards the sun through the same smoke
    float od = 0.0;
    for (int j = 1; j <= 6; j++) od += density(p + sunDir * float(j) * 0.18) * 0.18;
    vec3 S = albedo * st * (sunColor * exp(-od * sigmaMax) * phase + skyColor);
    float tr = exp(-st * dt);
    L += T * S * (1.0 - tr) / max(st, 1e-4);
    T *= tr;
    if (T < 0.01) break;                              // nothing behind can show any more
}
color = L + T * background;`}</CodeBlock>
      <p>
        {tx(t, "glslFire_shadowBody",
          "The inner loop is the expensive part. Without it every point would be lit as if nothing stood between it and the sun, and the plume would look flat, painted on. With it, the side away from the sun lies in the smoke's own shadow and the volume looks round. The albedo, σs/σt, sets the colour: soot absorbs most of the light that hits it (albedo about 0.3) and looks dark grey even in sunlight; steam and water droplets scatter almost all of it (0.99) and look white. The phase function says in which directions scattered light goes; here it is the same in every direction, 1/4π. Clouds, in the next chapter, need a better one.")}
      </p>
      <Equation label={tx(t, "glslFire_plumeLabel", "The shape of a plume")}
        where={[
          [r`r(y)`, tx(t, "glslFire_wR", "the plume's radius at height y")],
          [r`c(y)`, tx(t, "glslFire_wC", "how much smoke there is per cubic metre at that height")],
        ]}
        words={tx(t, "glslFire_plumeWords", "Rising hot gas drags the still air beside it in (entrainment), so a plume widens steadily, about 12 cm for every metre it rises: a cone. The same smoke, spread over a cross-section that grows as r², thins out at least that fast.")}>
        {r`r(y) \approx r_0 + 0.12\,y, \qquad c(y) \propto \frac{1}{r(y)^2}`}
      </Equation>
      <SmokeFigure t={t} />
      <Callout type="info" t={t}>
        {tx(t, "glslFire_costNote", "72 steps, each with a 6-step light march and noise of several octaves, is thousands of noise evaluations per pixel. Real-time renderers keep it affordable by drawing the volume at a lower resolution, storing the noise in a 3D texture instead of computing it, starting each pixel's march at a random offset and averaging the noise away over several frames (temporal reprojection), and caching the sunlight in a coarse 3D grid shared by all pixels.")}
      </Callout>
    </>
  );
}

// src/lib/tracks/glsl/chapters/effects/rain.tsx
"use client";

import { Callout, H2, H3 } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { WindowLabFigure } from "@/components/lesson/figures/glass/WindowLabFigure";
import { slideNumbers, dewNumbers } from "../../live/rain";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Rain on Glass
// ═════════════════════════════════════════════════════════════════════════════

export function RainContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslRain_intro2",
          "A rainy window is one of the most recognisable shots in film and games, and almost everything in it is a small piece of physics: drops that cling to the glass until they are suddenly heavy enough to slide, paths that wander and follow each other, a whole upside-down street inside every drop, and fog on the inside of the glass that a hand can wipe away. This chapter explains that physics, then builds the effect from the tools of the last few chapters: hashed cells, a height field, refraction and mipmaps.")}
      </Lead>

      <Goals t={t} id="glslRain" items={[
        "Work out when a drop on a window starts to slide, and why it slides in jumps.",
        "Explain why every drop shows an upside-down image, and fake that refraction from the slope of a height field.",
        "Build sliding drops, trails and still droplets from hashed cells.",
        "Fog the glass with mipmap blur and let the reader wipe it with a texture that slowly fogs back.",
      ]} />

      <StickSection t={t} />
      <LensSection t={t} />
      <CellsSection t={t} />
      <FogSection t={t} />

      <KeyIdeas t={t} id="glslRain" items={[
        "A drop on glass is held by contact-angle hysteresis: it slides once its weight beats γ·w·(cos θR − cos θA), which for water on glass means a radius of 1–2 mm.",
        "Drops slide in jumps (stick-slip), swallow the drops they touch, and prefer old wet trails, where less holds them back.",
        "A drop is a strong lens, f ≈ R/(n − 1) ≈ 3R: every street light beyond a few millimetres forms a small inverted image inside it.",
        "In a shader, refraction through a thin layer of water is a shift of the background by the surface's slope: read the scene at uv + k·∇c.",
        "Rain is hashed cells: tall cells in two layers for sliding drops, a sawtooth for their stick-slip, a strip above each drop for its trail, a fine grid for still drops.",
        "Lighting and refraction come from one height field, differenced in x and y.",
        "Glass fogs below the dew point; fogged glass is the background read at a blurry mip level, sharp where drops, trails and a wiping mask say so.",
        "The wiping mask is the only memory: a small texture that fogs back by e^(−k·dt) each frame, whatever the frame rate.",
      ]} />
    </Article>
  );
}

// ── Why drops stick ───────────────────────────────────────────────────────────

function StickSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslRain_stickTitle", "Why drops stick, then slide")}</H2>
      <p>
        {tx(t, "glslRain_stickBody",
          "Water's surface acts like a stretched skin: it costs energy to make more of it, an amount per area called the surface tension γ (0.072 N/m for water). A drop on glass meets it at a contact angle θ. On perfectly clean, perfectly smooth glass a drop would slide at the slightest tilt. Real glass has dust and microscopic scratches that pin the edge of the drop, so the angle can vary over a range: a drop that is about to advance at its front shows a large angle θA there, and its back, about to recede, shows a smaller θR. That difference, the contact-angle hysteresis, is what holds a drop still on a vertical window:")}
      </p>
      <Derivation t={t} label={tx(t, "glslRain_slideDer", "How big a drop must be to slide")}
        where={[
          [r`r`, tx(t, "glslRain_wR", "the drop's radius, as seen on the glass")],
          [r`\alpha`, tx(t, "glslRain_wAlpha", "the tilt of the glass: 90° for a window")],
          [r`\gamma`, tx(t, "glslRain_wGamma", "surface tension of water, 0.072 N/m")],
          [r`\theta_A,\ \theta_R`, tx(t, "glslRain_wTheta", "the advancing and receding contact angles, at the drop's front and back")],
          [r`\rho,\ g`, tx(t, "glslRain_wRho", "water's density, 1000 kg/m³, and gravity, 9.81 m/s²")],
        ]}
        steps={[
          { full: true, tex: r`F_g = \rho\,g\,\sin\alpha\cdot\tfrac{2}{3}\pi r^3`,
            why: tx(t, "glslRain_s1", "the pull of gravity along the glass, for a drop shaped roughly like half a ball: volume (2/3)πr³") },
          { full: true, tex: r`F_p = \gamma\,w\,(\cos\theta_R - \cos\theta_A), \qquad w \approx 2r`,
            why: tx(t, "glslRain_s2", "surface tension pulls along the drop's edge. Across a drop of width w, the back pulls with γ·cos θR and the front with γ·cos θA; the difference holds it in place") },
          { full: true, tex: r`F_g > F_p \;\Rightarrow\; r > r_c = \sqrt{\frac{3\,\gamma\,(\cos\theta_R - \cos\theta_A)}{\pi\,\rho\,g\,\sin\alpha}}`,
            why: tx(t, "glslRain_s3", "weight grows as r³, the holding force only as r, so every drop slides once it is big enough. Set the two equal and solve for r") },
          { full: true, tex: r`\theta_A = 70^\circ,\ \theta_R = 40^\circ,\ \alpha = 90^\circ \;\Rightarrow\; r_c \approx 1.7\ \text{mm}`,
            why: tx(t, "glslRain_s4", "for ordinary window glass: drops smaller than about 3–4 mm across stay where they land, bigger ones run. That is the size of the drops you see racing down a window") },
        ]} />
      <LiveFormula label={tx(t, "glslRain_liveSlide", "Try it: when does it slide?")}
        tex={r`r_c = \sqrt{\frac{3\,\gamma\,(\cos\theta_R - \cos\theta_A)}{\pi\,\rho\,g\,\sin\alpha}}`}
        vars={[
          { id: "thA", label: "θA", min: 20, max: 160, step: 1, value: 70, fmt: v => `${v}°` },
          { id: "thR", label: "θR", min: 5, max: 150, step: 1, value: 40, fmt: v => `${v}°` },
          { id: "alpha", label: "α", min: 5, max: 90, step: 1, value: 90, fmt: v => `${v}°` },
        ]}
        compute={slideNumbers(t)}
        note={tx(t, "glslRain_liveSlideNote", "Make the window lean back (lower α): drops must grow larger before they run. Bring θR close to θA, as a water-repellent coating on a car's windscreen does: the hysteresis almost vanishes and even small drops roll off.")} />
      <p>
        {tx(t, "glslRain_wanderBody",
          "Once moving, a drop does not glide. Its front gets caught on the next speck, it stops, its back catches up, and it lurches on: stick-slip, which is why drops on a window move in jerks. When it touches a smaller drop it swallows it, becomes heavier, and speeds up. And it prefers to follow a path another drop has already wetted, because on wet glass the receding angle is small and little holds it back. So drops run in the same wandering tracks again and again, leaving lines of tiny droplets where the trail broke up behind them.")}
      </p>
    </>
  );
}

// ── Every drop is a lens ──────────────────────────────────────────────────────

function LensSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslRain_lensTitle", "Every drop is a lens")}</H2>
      <p>
        {tx(t, "glslRain_lensBody",
          "A drop on glass is flat on one side and curved on the other: a plano-convex lens, and a very strong one, because it is so small. The lensmaker's equation gives its focal length from the radius of curvature of its surface:")}
      </p>
      <Equation label={tx(t, "glslRain_lensLabel", "A drop's focal length")}
        where={[
          [r`f`, tx(t, "glslRain_wF", "the focal length: where light from far away comes to a point")],
          [r`R`, tx(t, "glslRain_wRc", "the radius of curvature of the drop's surface")],
          [r`n`, tx(t, "glslRain_wN", "water's refractive index, 1.33")],
        ]}
        words={tx(t, "glslRain_lensWords", "For water, f is about three times the radius of curvature: a few millimetres for a raindrop. Everything outside the window is thousands of focal lengths away, so each drop forms a tiny, sharp, upside-down image of the street. Look closely at a rainy window and every drop holds the scene, inverted.")}>
        {r`\frac{1}{f} = \frac{n - 1}{R} \;\Rightarrow\; f \approx 3R`}
      </Equation>
      <p>
        {tx(t, "glslRain_prismBody",
          "A shader does not need to trace the lens. Think of the drop as many tiny prisms, each tilted like the drop's surface at that point. A thin prism of angle A turns light by about (n − 1)·A, and for a surface with slope s the angle is close to s. So refraction becomes a shift: read the background a little away from the pixel, by an amount proportional to the surface's slope there. At a drop's centre the slope is zero and nothing moves; towards its edge the slope grows, the shift grows, and past the middle the pixel is reading the far side of the scene: the image flips.")}
      </p>
      <H3>{tx(t, "glslRain_dropHTitle", "Drops as a height field")}</H3>
      <p>
        {tx(t, "glslRain_dropHBody",
          "A drop is modelled like the water ripples: a scalar c(uv) that is 0 on dry glass and rises toward 1 inside a drop, a rough stand-in for the drop's thickness. Its slope is estimated from two extra evaluations a tiny step apart, and the background is read shifted by that slope. The same slope also gives the normal for lighting, so one height field drives everything:")}
      </p>
      <Equation label={tx(t, "glslRain_offLabel", "Refraction offset from the drop field")}
        where={[
          [r`\nabla c \approx \tfrac{1}{\varepsilon}\big(c(u{+}\varepsilon,v) - c,\ c(u,v{+}\varepsilon) - c\big)`, tx(t, "glslRain_wGrad", "finite differences with ε = 0.001, which is why drops() runs three times per pixel")],
          [r`k`, tx(t, "glslRain_wK", "the refraction slider: how strongly a slope bends the view. It stands for (n − 1) × the distance to the scene, folded into one number")],
        ]}
        glsl={`vec2 n = vec2(drops(uv + e).x - c, drops(uv + e.yx).x - c);\nvec3 col = textureLod(uScene, UV + n * k, lod).rgb;`}>
        {r`\text{colour}(uv) = \text{scene}\big(uv + k\,\nabla c(uv)\big)`}
      </Equation>
    </>
  );
}

// ── Drops from cells ──────────────────────────────────────────────────────────

function CellsSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslRain_cellsTitle", "Drops from hashed cells")}</H2>
      <p>
        {tx(t, "glslRain_cellsBody2",
          "The technique here follows the best-known real-time rainy window, Martijn Steinrucken's (BigWIngs) Shadertoy “Heartfelt”. As with the stars and the falling snow, no drop is stored. The glass is cut into cells, 6 times taller than wide because drops slide vertically, and every cell hashes its id into three random numbers n = (n.x, n.y, n.z). n.x places the drop horizontally, n.z gives it its own clock and wobble, and each column of cells is shifted by a random amount so that the rows never line up. Three layers are added together: tiny still drops on a 40-cell grid, and two layers of sliding drops, the second at 1.85× the scale so the sizes vary.")}
      </p>
      <Equation label={tx(t, "glslRain_sawLabel", "Stick, then slide: the sawtooth")}
        where={[
          [r`\operatorname{saw}(b, t)`, tx(t, "glslRain_wSaw", "rises smoothly while t goes from 0 to b = 0.85, then drops back to 0 in the remaining 15%. A slow climb and a sudden fall")],
          [r`y`, tx(t, "glslRain_wY", "the drop's height inside its cell. The whole grid scrolls down at a constant speed while the drop climbs inside it almost as fast, so on screen the drop barely creeps. When the sawtooth falls, the drop jumps down its cell: the stick-slip worked out above, held by hysteresis until it lets go")],
          [r`x`, tx(t, "glslRain_wX", "the horizontal position: n.x − ½ plus a wobble sin(y + sin y), whose amplitude shrinks near the cell's sides so the drop never leaves its column")],
        ]}
        glsl={`float saw(float b, float t) { return smoothstep(0.0, b, t) * smoothstep(1.0, b, t); }\nfloat y = (saw(0.85, fract(t + n.z)) - 0.5) * 0.9 + 0.5;`}>
        {r`\operatorname{saw}(b, t) = \operatorname{smoothstep}(0, b, t)\cdot\operatorname{smoothstep}(1, b, t) \qquad y = 0.9\big(\operatorname{saw}(0.85,\ \operatorname{fract}(t + n_z)) - 0.5\big) + 0.5`}
      </Equation>
      <p>
        {tx(t, "glslRain_trailBody2",
          "The trail is a vertical strip above the drop. It is narrow where the drop has just passed and narrower still further up, since r shrinks with height. Along it, a repeating pattern fract(10·v) places small droplets left behind, which is why a real trail looks beaded. The trail carries little water, but it marks where the glass was wiped, so it clears the fog. The still drops use the same sawtooth with b = 0.025: they appear almost instantly (a raindrop hitting) and evaporate over the rest of their cycle. Finally the layers are summed and passed through smoothstep(0.3, 1, c). That merges neighbouring drops into one smooth surface, the way touching water drops fuse.")}
      </p>
    </>
  );
}

// ── Fog on the glass ──────────────────────────────────────────────────────────

function FogSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslRain_fogTitle", "Fog on the glass")}</H2>
      <p>
        {tx(t, "glslRain_fogBody",
          "Warm, moist air inside a car or a room fogs the window when the glass is colder than the air's dew point: the temperature at which that air can no longer hold its water vapour. The vapour condenses into droplets a few micrometres across, far too small to see one by one but numerous enough to scatter light in every direction, so the street behind turns into a blurred glow. The dew point follows from the air's temperature and relative humidity with the Magnus formula:")}
      </p>
      <LiveFormula label={tx(t, "glslRain_liveDew", "Try it: when does the window fog?")}
        tex={r`\gamma = \ln\frac{RH}{100} + \frac{17.62\,T}{243.12 + T}, \qquad T_d = \frac{243.12\,\gamma}{17.62 - \gamma}`}
        vars={[
          { id: "T", label: "T", min: -5, max: 35, step: 0.5, value: 20, fmt: v => `${v} °C` },
          { id: "RH", label: "RH", min: 10, max: 100, step: 1, value: 60, fmt: v => `${v}%` },
        ]}
        compute={dewNumbers()}
        note={tx(t, "glslRain_liveDewNote", "A room at 20 °C and 60% humidity has a dew point of 12 °C: any glass colder than that fogs. Breathe into a cold car and the humidity jumps; the dew point climbs past the temperature of the windscreen, and it fogs in seconds.")} />
      <p>
        {tx(t, "glslRain_mipBody2",
          "Blurring the whole background every frame would be expensive, but there is a free blur at hand: mipmaps. The street is drawn once into a texture, and the GPU builds its chain of half-size copies, each a box-filtered average of the one before. Reading a high level of that chain gives a soft blur at the cost of one texture lookup. Fogged glass reads a blurry level and adds a pale veil (the fog also scatters the room's light back at you); wherever a drop or a trail has cleared the glass, the shader reads level 0, sharp:")}
      </p>
      <Equation label={tx(t, "glslRain_lodLabel", "Choosing how blurry each pixel is")}
        where={[
          [r`\text{lod}`, tx(t, "glslRain_wLod", "the mip level passed to textureLod. Level L is the image averaged over 2^L × 2^L texels, so blurring by about R pixels means reading level log₂R")],
          [r`f`, tx(t, "glslRain_wFog", "condensation at this pixel: the fog slider × the wipe mask × (1 − trail), because sliding drops clear the glass they cross")],
          [r`c`, tx(t, "glslRain_wC", "the drop mask: inside a drop the level goes to 0, so the view is sharp. A drop is clear water in the middle of the mist")],
        ]}
        note={tx(t, "glslRain_lodNote", "Mipmaps give free, variable blur, but box-shaped: a bright light turns into a square. Six extra taps around a circle at the same level round it off into proper bokeh.")}>
        {r`\text{lod} = \operatorname{mix}\!\big(\max(f\cdot\text{blur},\ 5\cdot\text{frost}),\ 0,\ \operatorname{smoothstep}(0.1, 0.2, c)\big)`}
      </Equation>
      <p>
        {tx(t, "glslRain_wipeBody2",
          "The wiping works like the footprints in the snow: a small texture (192×108) remembers how clear each part of the glass is. The pointer stamps soft discs into it along the segment from its last position to its current one, so a fast hand leaves an unbroken stripe. Every frame the clear part shrinks by a factor e^(−k·dt), so the fog creeps back at the same rate at any frame rate, as condensation does.")}
      </p>
      <WindowLabFigure t={t} />
      <H3>{tx(t, "glslRain_frostTitle", "Frosted glass and coloured fringes")}</H3>
      <p>
        {tx(t, "glslRain_frostBody",
          "Frosted glass is a rough surface. Every ray that crosses it is refracted in a slightly random direction, and a pixel averages many such rays, which is a blur whose radius grows with the roughness. Its cheap form is a mip level proportional to the frost, plus a per-pixel jitter of the offset for the grainy look of etched glass. Dispersion reuses the drop offset three times with slightly different strengths for red, green and blue (1 ± 0.3k), so bright lights seen through a drop get coloured fringes, the same trick as the three refract() calls in the glass chapter.")}
      </p>
      <Callout type="tip" t={t}>
        {tx(t, "glslRain_gameTip", "Games put the same effect on the camera instead of a window: rain splashing on the lens in a driving game or in a storm. There the drops are usually a few frames of a pre-made normal map, played as a flipbook and faded in and out, and refraction is the same shift of the already-rendered image by the normal. The upside-down image inside each drop is often left out; it is small, but it is what makes a close-up of a rainy window look real.")}
      </Callout>
    </>
  );
}

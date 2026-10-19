// src/lib/tracks/glsl/chapters/effects/rain.tsx
"use client";

import { Callout, CodeBlock, H2, H3 } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { RainGlassFigure } from "@/components/lesson/figures/rain/RainGlassFigure";
import { slideNumbers, dewNumbers } from "../../live/rain";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Rain on Glass
// ═════════════════════════════════════════════════════════════════════════════

export function RainContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslRain_intro",
          "A rainy window is one of the most recognisable shots in film and games, and almost everything in it is a small piece of physics: drops that cling to the glass until they are suddenly heavy enough to slide, paths that wander and follow each other, a whole upside-down street inside every drop, and fog on the inside of the glass that a hand can wipe away. This chapter builds it from the tools of the last few chapters: hashed cells, a height field, refraction, mipmaps and a ping-pong texture.")}
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
        "In a shader, refraction through a thin layer of water is a shift of the background by the surface's slope, δ ≈ (n − 1)·slope.",
        "Rain is hashed cells again: tall cells for sliding drops, a time function for their stick-slip, one path shared by drop and trail, small cells for still drops.",
        "Lighting and refraction come from one height field, differenced in x and y.",
        "Glass fogs below the dew point; fogged glass is the background read at a blurry mip level, clear where drops, trails and a wiping mask say so.",
        "The wiping mask is the only memory: a ping-pong texture that decays by e^(−k·dt), exactly like the footprints in the snow.",
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
      <Equation label={tx(t, "glslRain_shiftLabel", "Refraction as a shift")}
        where={[
          [r`\nabla h`, tx(t, "glslRain_wGrad", "the slope of the water's surface: how fast its height h changes along x and y")],
          [r`k`, tx(t, "glslRain_wK", "the lens strength: (n − 1) times the distance to what is seen, folded into one number")],
        ]}
        words={tx(t, "glslRain_shiftWords", "Each pixel reads the scene behind the glass from a point moved against the slope of the water. The same slope also gives the normal for lighting, so one height field drives everything.")}
        glsl={`vec2 grad = vec2(h(p + ex) - h(p), h(p + ey) - h(p)) / e;\nvec3 behind = textureLod(scene, uv - grad * k, 0.0).rgb;`}>
        {r`\delta \approx (n - 1)\,\nabla h, \qquad \mathbf{uv}' = \mathbf{uv} - k\,\nabla h`}
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
        {tx(t, "glslRain_cellsBody",
          "The drops are made exactly like the falling snow: the glass is cut into cells, each cell holds at most one drop, and a hash of the cell's number decides everything about it. Two layers are enough. Sliding drops live in tall cells, three times higher than wide, so each has room to run down its own column. Still drops live in small square cells. Both write into one height field h, the thickness of water on the glass.")}
      </p>
      <H3>{tx(t, "glslRain_slipTitle", "Stick-slip in one line")}</H3>
      <p>
        {tx(t, "glslRain_slipBody",
          "A sliding drop's height in its cell is a function of time. Split one trip down the cell into five stretches; in each, the drop stays put for the first 55% and then slides quickly to the next stop. Its sideways position is a wobbly function of height, the same function for the drop and its trail, so the trail is exactly where the drop has been:")}
      </p>
      <CodeBlock lang="glsl" filename="sliding drop" t={t}>{`// cell: tall cells, 7 across the window, 3 times higher than wide
vec3  n  = hash3(cellId);                      // this drop's random numbers
float ph = fract(time * (0.05 + 0.06 * n.y) + n.x) * 5.0;
float y  = 0.88 - 0.76 * (floor(ph) + smoothstep(0.55, 1.0, fract(ph))) / 5.0;   // stick, then slip; never at the cell's ends
float pathX(float y) { return (n.x - 0.5) * 0.45 + 0.09 * sin(y * 17.0) * sin(y * 7.3); }

vec2  d = vec2(st.x - pathX(y), (st.y - y) * 3.0) / radius;
float h = radius * sqrt(max(1.0 - dot(d, d), 0.0));      // a spherical cap

// The trail: above the drop, near its path, fading with distance
float above = st.y - y;
float trail = above > 0.0 ? smoothstep(w, 0.6 * w, abs(st.x - pathX(st.y))) * exp(-1.2 * above) : 0.0;`}</CodeBlock>
      <p>
        {tx(t, "glslRain_trailBody",
          "The trail carries no water of its own (it is too thin to matter), but it marks where the glass was wiped, so it clears the fog and removes the still drops it crosses. Along it, a few tiny drops are scattered, one per short stretch of height, each placed by its own hash. Shading then needs the slope of h, from two extra evaluations a small step to the right and up. To keep the shader compact, the three evaluations sit in one loop, so the drop code is compiled only once.")}
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
        {tx(t, "glslRain_mipBody",
          "Blurring the whole background every frame would be expensive, but there is a free blur at hand: mipmaps. The street is drawn once into a texture, and the GPU builds its chain of half-size copies, each a box-filtered average of the one before. Reading level 4 or 5 of that chain gives a soft blur at the cost of one texture lookup. Fogged glass reads a blurry level and adds a pale veil (the fog also scatters the room's light back at you); wherever a drop, a trail or a hand has cleared the glass, the shader reads level 0, sharp.")}
      </p>
      <p>
        {tx(t, "glslRain_wipeBody",
          "The wiping works like the footprints in the snow: a small texture remembers how clear each part of the glass is. Each frame reads it and writes it again (ping-pong), multiplying by e^(−k·dt) so the fog creeps back at the same rate at any frame rate, and the pointer stamps a stripe into it along the segment from its last position to its current one, so a fast hand leaves an unbroken stripe.")}
      </p>
      <RainGlassFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "glslRain_gameTip", "Games put the same effect on the camera instead of a window: rain splashing on the lens in a driving game or in a storm. There the drops are usually a few frames of a pre-made normal map, played as a flipbook and faded in and out, and refraction is the same shift of the already-rendered image by the normal. The upside-down image inside each drop is often left out; it is small, but it is what makes a close-up of a rainy window look real.")}
      </Callout>
    </>
  );
}

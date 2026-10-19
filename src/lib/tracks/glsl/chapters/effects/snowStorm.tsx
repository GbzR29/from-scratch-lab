// src/lib/tracks/glsl/chapters/effects/snowStorm.tsx
// Two sections of "Snow & Blizzards" (snow.tsx), kept here so the chapter file stays small:
// the blizzard (streaks, curl noise, visibility) and snow that settles on a scene.
"use client";

import { Callout, CodeBlock, H2, H3 } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { BlizzardFigure } from "@/components/lesson/figures/snow/BlizzardFigure";
import { SnowCoverFigure } from "@/components/lesson/figures/snow/SnowCoverFigure";
import { visibilityNumbers } from "../../live/snow";

const r = String.raw;

// ── The blizzard ──────────────────────────────────────────────────────────────

export function BlizzardSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslSnow_blzTitle", "Blizzard: wind, streaks and whiteout")}</H2>
      <p>
        {tx(t, "glslSnow_blzBody",
          "A blizzard is not more snow. It is the same snow driven by a strong wind, often lifted back off the ground and broken into fine grains, until you cannot see the road. Three things change on screen: the flakes become streaks, their paths swirl, and the air itself turns white. Each has a short explanation and a few lines of shader.")}
      </p>

      <H3>{tx(t, "glslSnow_streakTitle", "Streaks: where the flake was during the frame")}</H3>
      <p>
        {tx(t, "glslSnow_streakBody",
          "A camera, and your eye, collect light over a short time Δt, not in an instant. In that time a flake moving at speed v covers v·Δt, and all of that path lands in the picture. Draw the flake as a segment of that length instead of a dot, and take the distance to the segment rather than to its centre. Its direction on screen comes from the wind U across and the fall speed w down:")}
      </p>
      <Equation label={tx(t, "glslSnow_streakLabel", "One streak")}
        where={[
          [r`U,\ w`, tx(t, "glslSnow_wUw", "the wind's speed across the view and the flakes' fall speed, about 1 m/s, in m/s")],
          [r`\Delta t`, tx(t, "glslSnow_wDt2", "the exposure: how long the camera collects light for one frame, in seconds")],
          [r`\theta`, tx(t, "glslSnow_wTheta", "the streak's angle from straight down")],
        ]}
        words={tx(t, "glslSnow_streakWords", "At 15 m/s of wind the snow flies almost sideways (86° from vertical) and, with a 40 ms exposure, each flake is a 60 cm streak. The same light is spread over the whole streak, so a long streak is fainter than the dot it came from.")}>
        {r`\ell = \sqrt{U^2 + w^2}\;\Delta t, \qquad \theta = \arctan\frac{U}{w}`}
      </Equation>
      <p>
        {tx(t, "glslSnow_streakCells",
          "A 60 cm streak does not fit in a 35 cm cell. Instead of checking neighbouring cells, the shader turns the grid so one of its axes runs along the motion, and stretches the cells along that axis to ℓ plus a margin. Every streak is then a vertical segment inside its own tall cell, and the cell budget from before still holds.")}
      </p>

      <H3>{tx(t, "glslSnow_curlTitle", "Swirls without clumps: curl noise")}</H3>
      <p>
        {tx(t, "glslSnow_curlBody",
          "To make the wind swirl, move the snow by a velocity field that changes from place to place. Plain noise used as a velocity looks wrong: where the arrows point inwards the flakes pile up, where they point outwards the air empties. Air does not do that; what flows into a region flows out of it. A field with that property, zero divergence, can be built from any smooth noise ψ:")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_curlDer", "Why the curl has no sources")}
        where={[
          [r`\psi(x, y)`, tx(t, "glslSnow_wPsi", "any smooth noise; its contour lines will be the flow's paths (it is called a stream function)")],
          [r`\mathbf v`, tx(t, "glslSnow_wVel", "the velocity the snow is moved by")],
        ]}
        steps={[
          { full: true, tex: r`\mathbf v = \left(\frac{\partial \psi}{\partial y},\ -\frac{\partial \psi}{\partial x}\right)`,
            why: tx(t, "glslSnow_c1", "take the slope of ψ and turn it by 90°. The slope points uphill; turned, it runs along the contour lines, so the flow circles round the hills and hollows of the noise") },
          { full: true, tex: r`\nabla\cdot\mathbf v = \frac{\partial}{\partial x}\frac{\partial \psi}{\partial y} - \frac{\partial}{\partial y}\frac{\partial \psi}{\partial x} = 0`,
            why: tx(t, "glslSnow_c2", "the divergence adds how fast each component grows along its own axis: it measures how much flow leaves a tiny box. The two mixed derivatives are equal for any smooth function, so they cancel exactly, everywhere") },
          { full: true, tex: r`\frac{\partial \psi}{\partial y} \approx \frac{\psi(x, y + e) - \psi(x, y - e)}{2e}`,
            why: tx(t, "glslSnow_c3", "in the shader, each derivative is two noise lookups a small step e apart. Four lookups give the whole field") },
        ]} />
      <CodeBlock lang="glsl" filename="curl.glsl" t={t}>{`vec2 curl(vec2 p) {
    const float e = 0.05;
    float dy = noise(p + vec2(0.0, e)) - noise(p - vec2(0.0, e));
    float dx = noise(p + vec2(e, 0.0)) - noise(p - vec2(e, 0.0));
    return vec2(dy, -dx) / (2.0 * e);
}

// In each sheet: bend the space the cells live in, then find the cell
W += turbulence * curl(W * 0.35 + vec2(0.0, time * 0.25));
vec2 cell = W / cellSize;`}</CodeBlock>
      <p>
        {tx(t, "glslSnow_warpBody",
          "The shader cannot push each flake separately, because a flake is only a hash of its cell. So it bends the space the cells live in: the point W where the pixel meets the sheet is moved by the field before the cell is looked up, and every flake near W follows the same swirl. As long as the field changes slowly across one cell, the flakes keep their shape. Gusts are simpler still: the wind speed is multiplied by a slow wobble over time, and the drift is integrated frame by frame as before.")}
      </p>

      <H3>{tx(t, "glslSnow_visTitle", "Visibility: the snow is the fog")}</H3>
      <p>
        {tx(t, "glslSnow_visBody",
          "The Fog chapter used a density ρ and let light fade as e^(−ρd). In a snowstorm that density has a physical value. Every grain blocks the light that hits it, and also bends away about as much again around its edge (diffraction), so it removes twice its shadow area. Add up the grains in one cubic metre:")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_visDer", "From grains to visibility")}
        where={[
          [r`n`, tx(t, "glslSnow_wN", "grains per cubic metre of air")],
          [r`r`, tx(t, "glslSnow_wRg", "a grain's radius, in metres")],
          [r`Q`, tx(t, "glslSnow_wQext", "extinction efficiency: about 2 for grains much bigger than a wavelength of light")],
          [r`V`, tx(t, "glslSnow_wV2", "the visibility: the distance at which a dark object fades to 2% contrast against the sky")],
        ]}
        steps={[
          { full: true, tex: r`\sigma = n\,Q\,\pi r^2`,
            why: tx(t, "glslSnow_v1", "a slab of air 1 m thick and 1 m² across holds n grains, each blocking Q·πr². Their total, as a fraction of the square metre, is the fraction of light removed per metre: the extinction coefficient σ") },
          { full: true, tex: r`C(d) = e^{-\sigma d}`,
            why: tx(t, "glslSnow_v2", "a dark object's contrast against the bright air falls with distance exactly as its light does, the same exponential as fog") },
          { full: true, tex: r`e^{-\sigma V} = 0.02 \;\Rightarrow\; V = \frac{\ln 50}{\sigma} \approx \frac{3.912}{\sigma}`,
            why: tx(t, "glslSnow_v3", "the eye stops seeing an edge at about 2% contrast. Solving for the distance gives Koschmieder's formula (1924), still how weather stations turn a measured σ into a visibility") },
        ]} />
      <LiveFormula label={tx(t, "glslSnow_liveVis", "Try it: how far can you see?")}
        tex={r`\sigma = n\,Q\,\pi r^2, \qquad V = \frac{3.912}{\sigma}`}
        vars={[
          { id: "logN", label: "n", min: 2, max: 6, step: 0.05, value: 3, fmt: v => (10 ** v >= 1e4 ? `${Math.round(10 ** v / 1000)}k` : `${Math.round(10 ** v)}`) + " /m³" },
          { id: "rmm", label: "r", min: 0.1, max: 3, step: 0.05, value: 1.5, fmt: v => `${v.toFixed(2)} mm` },
        ]}
        compute={visibilityNumbers(t)}
        note={tx(t, "glslSnow_liveVisNote", "A thousand flakes of 1.5 mm in every cubic metre, ordinary steady snow, let you see about 280 m. Blowing snow is the same snow broken into grains around 0.1 mm, but hundreds of thousands of them: set r = 0.1 mm and n = 300k and the visibility drops to about 200 m.")} />
      <BlizzardFigure t={t} />
      <Callout type="info" t={t}>
        {tx(t, "glslSnow_whiteNote", "A whiteout is a lighting effect as much as a fog. Under a thick, even overcast, light arrives from the whole sky at once, so nothing casts a shadow, and fresh snow reflects about 90% of it, so the ground is as bright as the sky. With the air between them the same white, there is no horizon and no shading left to read slopes from. In the shader it is a single number pulling sky, ground, flakes and fog towards the same colour.")}
      </Callout>
    </>
  );
}

// ── Snow that settles ─────────────────────────────────────────────────────────

export function SettleSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslSnow_setTitle", "Snow that settles")}</H2>
      <p>
        {tx(t, "glslSnow_setBody",
          "Snow lands on whatever faces the sky and slides off whatever does not. Games get most of the way there without changing any shape: in the material shader they mix the surface towards snow where its normal points up. A little noise breaks up the edge of the snow, and the amount slider simply shifts the threshold:")}
      </p>
      <Equation label={tx(t, "glslSnow_maskLabel", "The snow mask")}
        where={[
          [r`\mathbf n`, tx(t, "glslSnow_wNn", "the surface's normal")],
          [r`\mathbf u`, tx(t, "glslSnow_wU", "the direction the snow comes from: straight up, or tilted into the wind")],
          [r`\eta`, tx(t, "glslSnow_wEta", "a noise value between 0 and 1, so the snow line is ragged instead of perfectly level")],
          [r`a`, tx(t, "glslSnow_wAmt", "how much snow has fallen, from 0 to 1")],
        ]}
        words={tx(t, "glslSnow_maskWords", "n · u is 1 on a flat top and 0 on a wall. Add some noise, subtract what has not fallen yet, and turn the result into a soft 0-to-1 mask with smoothstep. Mix the albedo, roughness and normal towards snow by that mask.")}>
        {r`\text{snow} = \operatorname{smoothstep}\big(0.55,\ 0.75,\ \mathbf n\cdot\mathbf u + 0.5\,\eta - 1.2\,(1 - a)\big)`}
      </Equation>
      <p>
        {tx(t, "glslSnow_setLimits",
          "That snow has no thickness. A rail stays a thin rail painted white, and the edges of a crate stay sharp, where real snow would round them over and stick out past them. It also has no idea of what is above it: the ground under a bench gets snow because it faces up. Games fix the second problem with a picture taken from the sky, like a shadow map: a camera above the level records the height of the first thing it sees, and a surface lower than that is under cover and gets no snow. With a distance function, the first problem has a neat answer: build the snow as shape.")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_layerDer", "A layer of snow from one SDF")}
        where={[
          [r`s(\mathbf p)`, tx(t, "glslSnow_wS2", "the scene's signed distance function: negative inside things, positive outside")],
          [r`T`, tx(t, "glslSnow_wT", "how deep the snow lies here")],
          [r`\mathbf u`, tx(t, "glslSnow_wU2", "up, or up tilted into the wind")],
        ]}
        steps={[
          { full: true, tex: r`s(\mathbf p) - T < 0`,
            why: tx(t, "glslSnow_s1d", "subtracting T from an SDF inflates everything by T: a shell of thickness T all round every object, walls and undersides included. Too much snow") },
          { full: true, tex: r`b(\mathbf p) = \min_{k = 1, 2, 3} s\!\left(\mathbf p - \mathbf u\,\tfrac{k}{3}T\right) < -M`,
            why: tx(t, "glslSnow_s2d", "look below p, up to T down. If one of those points is inside something, p is sitting on top of it. Three depths, because a rail thinner than T would be missed by a single look T down. Beside a wall the point below is still on the wall, at distance 0, so the test asks for clearly inside, by a small margin M") },
          { full: true, tex: r`\text{snow}(\mathbf p) = \max\big(s(\mathbf p) - T,\ b(\mathbf p) + M\big)`,
            why: tx(t, "glslSnow_s3d", "a point is snow only if both tests pass, and the intersection of two SDF shapes is their max. A smooth max (smax) rounds the cap's lip, as real snow is rounded") },
          { full: true, tex: r`d(\mathbf p) = \min\big(s(\mathbf p),\ \text{snow}(\mathbf p)\big)`,
            why: tx(t, "glslSnow_s4d", "add the snow to the scene with min, the union. Shading then asks which of the two is closer at the hit point to choose the material") },
        ]} />
      <CodeBlock lang="glsl" filename="snow_layer.glsl" t={t}>{`float snowLayer(vec3 p) {
    float T = depthAt(p);                       // noise × how much has fallen
    if (T < 0.002) return 1e3;                  // bare here
    float below = 1e3;                          // anything solid under p, up to T down?
    for (int i = 0; i < 3; i++) below = min(below, scene(p - up * T * float(i + 1) / 3.0));
    return smax(scene(p) - T, below + M, 0.03); // M ≈ 1 cm: clearly inside, not just touching a wall
}
float map(vec3 p) { return min(scene(p), snowLayer(p)); }`}</CodeBlock>
      <p>
        {tx(t, "glslSnow_setMore",
          "The result is only roughly a distance (a max of two distances usually is), which the raymarcher handles by stepping a little less than the full distance. It costs five scene evaluations per step instead of one; the three looks below sit in a loop, so the scene's code is compiled once for them, which matters for the GPU driver's compile time. Tilting u into the wind moves the snow onto the faces that look into it, which is what a windy snowfall does to trees, posts and walls. The sparkle comes from the snow's grains: each is a tiny ice mirror with its own tilt, and only those tilted exactly halfway between the sun and your eye flash. The shader gives each small cell of the surface a random facet and a very sharp highlight, so a slow orbit makes them twinkle.")}
      </p>
      <SnowCoverFigure t={t} />
    </>
  );
}

// src/lib/tracks/glsl/chapters/effects/gems.tsx
"use client";

import { Callout, CodeBlock, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { GemCutFigure } from "@/components/lesson/figures/gems/GemCutFigure";
import { DiamondFigure } from "@/components/lesson/figures/gems/DiamondFigure";
import { BubbleFigure } from "@/components/lesson/figures/gems/BubbleFigure";
import { pavilionNumbers, filmNumbers } from "../../live/gems";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Gems & Bubbles
// ═════════════════════════════════════════════════════════════════════════════

export function GemsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslGems_intro",
          "A diamond and a soap bubble are the two most colourful transparent things most people ever hold, and neither has any colour of its own. The diamond makes its colours by bending light, trapping it and splitting it; the bubble makes them by letting two reflections of the same light interfere. This chapter builds both in GLSL on top of the previous one: refract(), Fresnel and total internal reflection for the stone, and one new formula for the film.")}
      </Lead>

      <Goals t={t} id="glslGems" items={[
        "Explain brilliance, fire and scintillation, and derive the pavilion angles that keep light inside a diamond.",
        "Trace a cut stone exactly as a list of planes, with no marching.",
        "Render fire by tracing several wavelengths and adding them with their colours.",
        "Compute thin-film interference at any angle and colour a soap bubble with it.",
      ]} />

      <SparkleSection t={t} />
      <BrilliantSection t={t} />
      <BubbleSection t={t} />

      <KeyIdeas t={t} id="glslGems" items={[
        "Brilliance is white light the cut sends back up, fire is that light split into colours, scintillation is the flashing as the stone moves.",
        "A ray falling through the table must be totally reflected twice by the pavilion and then leave through the table: θc < α, 180° − 3α > θc, |180° − 4α| < θc.",
        "For diamond (θc = 24.4°) that window is 38.9°–51.1°; for glass (θc = 41.1°) it shrinks to 41.1°–46.3°.",
        "Fire grows near the critical angle: dθ_out/dn = sin θ_in / cos θ_out.",
        "A convex stone is a list of planes n·p = h: enter at the largest t of the planes being entered, leave at the smallest t of the planes being left.",
        "Inside a gem, follow the reflected branch and add (1 − F) × the environment at every exit.",
        "Spectral rendering: trace each wavelength with its own n and add the results with colours that sum to white.",
        "A thin film reflects R = 4r² sin²φ / ((1 − r²)² + 4r² sin²φ), with φ = 2π n t cos θt / λ.",
        "Under about 30 nm a film reflects nothing (black film); over a few micrometres the colours average out.",
      ]} />
    </Article>
  );
}

// ── Why a diamond sparkles ────────────────────────────────────────────────────

function SparkleSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGems_sparkTitle", "Why a diamond sparkles")}</H2>
      <p>
        {tx(t, "glslGems_sparkBody",
          "Jewellers judge a stone by three things. Brilliance is how much white light it sends back towards your eye. Fire is that light split into flashes of colour. Scintillation is the twinkling as the stone, the lamp or your head moves. All three come from the previous chapter: a large refractive index, total internal reflection and dispersion. What turns them into sparkle is the cut. Here are the stones this chapter compares:")}
      </p>
      <LessonTable
        headers={[
          tx(t, "glslGems_thMat", "material"),
          tx(t, "glslGems_thN", "n at 589 nm"),
          tx(t, "glslGems_thCrit", "critical angle θc"),
          tx(t, "glslGems_thDisp", "dispersion (n at 431 nm − n at 687 nm)"),
        ]}
        rows={[
          [tx(t, "glslGems_mDiamond", "diamond"), "2.417", "24.4°", "0.044"],
          [tx(t, "glslGems_mMoiss", "moissanite"), "2.65", "22.2°", "0.104"],
          [tx(t, "glslGems_mCz", "cubic zirconia"), "2.16", "27.6°", "0.060"],
          [tx(t, "glslGems_mGlass", "glass"), "1.52", "41.1°", "0.010"],
        ]} />
      <p>
        {tx(t, "glslGems_cutBody",
          "The round brilliant has a flat top, the table, ringed by the sloping facets of the crown. At its widest point is a thin band, the girdle. Below it the pavilion narrows to a point, the culet. In 1919 the engineer Marcel Tolkowsky worked out, with nothing but rays and Snell's law, the angles that return the most light: a pavilion tilted α = 40.75° from the girdle plane, a crown at β = 34.5°, and a table 53% of the width. Diamond cutters still use numbers close to his. The key is the pavilion. Follow one ray that falls straight down through the table:")}
      </p>
      <Derivation t={t} label={tx(t, "glslGems_winDer", "The pavilion window")}
        where={[
          [r`\alpha`, tx(t, "glslGems_wAlpha", "pavilion angle: the tilt of the pavilion facets from the girdle plane. Each facet's normal is tilted by the same α from the vertical")],
          [r`\theta_c`, tx(t, "glslGems_wCrit", "critical angle, arcsin(1/n): 24.4° for diamond, 41.1° for glass")],
          [r`\mathbf d`, tx(t, "glslGems_wD", "the ray's direction, in the section through two opposite pavilion facets: x across, y up")],
        ]}
        steps={[
          { full: true, tex: r`\mathbf d = (0,\,-1), \qquad \theta_1 = \alpha \;>\; \theta_c`,
            why: tx(t, "glslGems_w1", "the ray enters the table head-on, so it does not bend, and goes straight down. The facet it meets has its normal tilted α from the vertical, so the angle of incidence is α. It must be more than θc, or the light simply leaves through the bottom") },
          { full: true, tex: r`\begin{gathered} \mathbf d' = (-\sin 2\alpha,\ \cos 2\alpha) \\[2pt] \theta_2 = 180^\circ - 3\alpha \;>\; \theta_c \end{gathered}`,
            why: tx(t, "glslGems_w2", "reflect() off that facet. The new ray runs across the stone, 2α from straight up. The opposite facet's normal is tilted α the other way, so the angle between the ray and that normal is 180° − 3α. Below α = 30° the ray climbs too steeply to reach it at all") },
          { full: true, tex: r`\begin{gathered} \mathbf d'' = (-\sin 4\alpha,\ -\cos 4\alpha) \\[2pt] |180^\circ - 4\alpha| \;<\; \theta_c \end{gathered}`,
            why: tx(t, "glslGems_w3", "a second reflect(). Two mirrors turn a ray by twice the angle between them, here 2 × 2α. The ray now rises |180° − 4α| from the vertical towards the table, whose normal is vertical. This time it has to get out, so the angle must be under θc") },
          { full: true, tex: r`\begin{gathered} \text{diamond: } 38.9^\circ < \alpha < 51.1^\circ \\[2pt] \text{glass: } 41.1^\circ < \alpha < 46.3^\circ \end{gathered}`,
            why: tx(t, "glslGems_w4", "solve the three tests. For diamond, test 3 decides both ends, (180° − θc)/4 and (180° + θc)/4, and tests 1 and 2 are easily met. For glass the large θc makes tests 1 and 2 the limits. Tolkowsky's 40.75° is well inside the diamond window and just outside the glass one") },
        ]} />
      <LiveFormula label={tx(t, "glslGems_liveWin", "Try it: does the ray come back?")}
        tex={r`\theta_c < \alpha, \qquad \theta_c < 180^\circ - 3\alpha, \qquad |180^\circ - 4\alpha| < \theta_c`}
        vars={[
          { id: "alpha", label: "α", min: 25, max: 60, step: 0.25, value: 40.75, fmt: v => `${v}°` },
          { id: "n", label: "n", min: 1.4, max: 2.7, step: 0.01, value: 2.42, fmt: v => v.toFixed(2) },
        ]}
        compute={pavilionNumbers(t)}
        note={tx(t, "glslGems_liveWinNote", "Start at diamond with Tolkowsky's angle: all three pass and the ray leaves the table about 45° from the vertical. Drag α down to 37°: test 3 fails, the ray comes back too slanted and is reflected again. Set n = 1.52, glass: now α must be above 41.1° just to pass test 1.")} />
      <GemCutFigure t={t} />

      <H3>{tx(t, "glslGems_fireTitle", "Fire")}</H3>
      <p>
        {tx(t, "glslGems_fireBody",
          "Reflections do not care about wavelength, so the two trips off the pavilion are the same for every colour. The colours part only at the exit, where each wavelength refracts with its own n. Leaving the table at 17° inside, red (n = 2.407) comes out at 44.7° and violet (n = 2.451) at 45.8°: only about 1° apart. How much the exit angle moves for a change in n follows from Snell's law:")}
      </p>
      <Equation label={tx(t, "glslGems_spreadLabel", "How fast the colours spread")}
        where={[
          [r`\theta_{in},\ \theta_{out}`, tx(t, "glslGems_wInOut", "the angles of the ray inside and outside the stone, from the facet's normal")],
          [r`dn`, tx(t, "glslGems_wDn", "the difference in index between two colours: 0.044 from red to violet in diamond")],
        ]}
        words={tx(t, "glslGems_spreadWords", "Differentiate n sin θ_in = sin θ_out with θ_in held fixed: sin θ_in dn = cos θ_out dθ_out. When the light leaves almost along the surface, cos θ_out is close to 0 and a tiny dn throws the colours far apart.")}>
        {r`\frac{d\theta_{out}}{dn} = \frac{\sin\theta_{in}}{\cos\theta_{out}}`}
      </Equation>
      <p>
        {tx(t, "glslGems_fireMore",
          "So the strongest fire comes from light that leaves a crown facet near the critical angle, skimming out at a low slant. That light goes off sideways, which is why fire is seen as small coloured flashes from particular directions under small, bright lamps, and hardly at all under a cloudy sky. Moissanite, with more than twice diamond's dispersion, throws so much colour that jewellers can tell the two apart by eye.")}
      </p>
    </>
  );
}

// ── A brilliant in GLSL ───────────────────────────────────────────────────────

function BrilliantSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGems_rtTitle", "A brilliant in GLSL")}</H2>
      <p>
        {tx(t, "glslGems_rtBody",
          "The glass studio marched a signed distance function step by step. A cut stone does not need that. It is convex: it is exactly the region that lies behind every facet plane at once. Write each facet as a plane n·p = h with its outward unit normal n, and a point is inside when n·p ≤ h for all of them. Hitting such a solid with a ray is the slab test from ray tracing, done once per plane:")}
      </p>
      <Equation label={tx(t, "glslGems_slabLabel", "A ray against a convex stone")}
        where={[
          [r`\mathbf n,\ h`, tx(t, "glslGems_wNh", "a facet's outward unit normal and its distance from the centre: the plane n·p = h")],
          [r`\mathbf o,\ \mathbf d`, tx(t, "glslGems_wOd", "the ray's origin and unit direction; the ray is o + t d")],
          [r`t_{in},\ t_{out}`, tx(t, "glslGems_wTinout", "where the ray is inside every half-space at once. It hits the stone when t_in < t_out")],
        ]}
        words={tx(t, "glslGems_slabWords", "Each plane is crossed at one t. If the ray is heading against the normal there (n·d < 0) it is entering that half-space, so the stone can begin no earlier: take the largest such t. If it is heading along the normal, it is leaving, so the stone ends no later: take the smallest.")}>
        {r`\begin{gathered} t = \frac{h - \mathbf n\cdot\mathbf o}{\mathbf n\cdot\mathbf d} \\[4pt] t_{in} = \max_{\mathbf n\cdot\mathbf d < 0} t, \qquad t_{out} = \min_{\mathbf n\cdot\mathbf d > 0} t \end{gathered}`}
      </Equation>
      <CodeBlock lang="glsl" filename="planes.glsl" t={t}>{`uniform vec4 uPlanes[80];   // xyz = outward normal, w = h
uniform int  uCount;

// From inside the stone: the nearest facet the ray is heading out of
float leave(vec3 p, vec3 d, out vec3 N) {
    float tOut = 1e9;
    for (int i = 0; i < uCount; i++) {
        vec4 P = uPlanes[i];
        float den = dot(P.xyz, d);
        if (den <= 0.0) continue;                 // facing away: not the way out
        float t = (P.w - dot(P.xyz, p)) / den;
        if (t > 1e-5 && t < tOut) { tOut = t; N = P.xyz; }
    }
    return tOut;
}`}</CodeBlock>
      <p>
        {tx(t, "glslGems_planesBody",
          "The planes are built on the CPU from the cut's angles and sent as 73 vec4 uniforms: the table, 8 crown mains tilted β, 8 star facets around the table, 16 upper girdle facets, 16 vertical planes for the girdle, 8 pavilion mains tilted α through the culet, and 16 lower girdle facets. Move a slider and only the uniforms change. Inside, the tracer keeps the part of the light that is reflected and lets the rest out:")}
      </p>
      <CodeBlock lang="glsl" filename="inside the stone" t={t}>{`float w = 1.0 - F0;                          // what got in through the first surface
for (int b = 0; b < 10 && w > 0.01; b++) {
    vec3 N;
    p += d * leave(p, d, N);
    float c = dot(d, N), k = 1.0 - n * n * (1.0 - c * c);
    if (k >= 0.0) {                              // some of it gets out here
        float F = fresnel(n, 1.0, c, sqrt(k));
        light += w * (1.0 - F) * env(refract(d, -N, n));
        w *= F;                                  // the rest is reflected back in
    }                                            // k < 0: total internal reflection, w stays
    d = reflect(d, N);
}`}</CodeBlock>
      <p>
        {tx(t, "glslGems_branchBody",
          "This is the opposite choice from the glass studio, which followed the refracted ray and only looked up the reflection. In a well-cut gem most of the light stays inside after each hit, so the reflected branch is the one worth following, and every exit is added as it happens.")}
      </p>
      <H3>{tx(t, "glslGems_specTitle", "Fire in a shader: one wavelength at a time")}</H3>
      <p>
        {tx(t, "glslGems_specBody",
          "An RGB shader has three numbers per pixel, but fire is a smear of every colour. So the stone is traced once per wavelength λₖ, each time with its own index from Cauchy, n(λ) = A + B/λ², and each result is added in with that wavelength's colour wₖ. The colours come from the CIE matching functions turned into RGB, scaled so that they sum to white: a path that is the same for every wavelength (a reflection) comes out white, and only paths that differ show colour.")}
      </p>
      <Equation label={tx(t, "glslGems_specLabel", "Spectral rendering in RGB")}
        where={[
          [r`L_k`, tx(t, "glslGems_wLk", "the light the tracer collects along the path of wavelength λₖ")],
          [r`\mathbf w_k`, tx(t, "glslGems_wWk", "the RGB colour of λₖ, from the CIE 1931 curves; Σ wₖ = (1, 1, 1)")],
        ]}
        words={tx(t, "glslGems_specWords", "Trace each wavelength on its own and paint it in its own colour. With three wavelengths you get three separate images in red, green and blue with gaps between them; with eight the gaps close into a spectrum.")}>
        {r`\text{colour} = \sum_{k=1}^{K} \mathbf w_k\, L_k`}
      </Equation>
      <DiamondFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "glslGems_costNote", "Eight wavelengths × ten bounces × 73 planes is close to 6000 plane tests per pixel, still fast because each test is two dot products. Games skip most of it: they trace a few bounces once for one wavelength and store where the light comes out, or add the colour as a cheap rainbow texture in the sparkles.")}
      </Callout>
    </>
  );
}

// ── Soap bubbles ──────────────────────────────────────────────────────────────

function BubbleSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGems_bubTitle", "Soap bubbles: thin-film interference")}</H2>
      <p>
        {tx(t, "glslGems_bubBody",
          "A bubble's wall is soapy water a few hundred nanometres thick, about the size of a wavelength of light. Light reflects off its outer surface and off its inner surface, and the two reflections are the same wave, slightly delayed, so they interfere. The Interference & Diffraction chapter of the Physics track works out the head-on case: an extra path 2nt and half a wave of flip at the front surface. A shader looking at a round bubble needs two more things: the angle, which changes across the bubble, and every bounce inside the film, not just the first two.")}
      </p>
      <Derivation t={t} label={tx(t, "glslGems_airyDer", "From two reflections to the whole film")}
        where={[
          [r`t`, tx(t, "glslGems_wT", "thickness of the film, in nanometres")],
          [r`n`, tx(t, "glslGems_wN", "index of the film: 1.33 for soapy water")],
          [r`\theta_t`, tx(t, "glslGems_wThT", "angle of the light inside the film, from Snell's law: sin θt = sin θ / n")],
          [r`r`, tx(t, "glslGems_wR", "Fresnel amplitude ratio of one air–water surface; head-on (1 − 1.33)/(1 + 1.33) = −0.14")],
        ]}
        steps={[
          { full: true, tex: r`\Delta = 2\,n\,t\,\cos\theta_t`,
            why: tx(t, "glslGems_a1", "the wave reflected at the back crosses the film twice at θt. Counting its extra path inside (in vacuum wavelengths, so × n) and subtracting the bit the front reflection travels in air meanwhile leaves 2nt cos θt. Slanted light sees a thinner film") },
          { full: true, tex: r`\varphi = \frac{\pi\,\Delta}{\lambda} = \frac{2\pi\, n\, t \cos\theta_t}{\lambda}`,
            why: tx(t, "glslGems_a2", "a path of one wavelength is a full turn, 2π, of phase. φ is half the phase of one round trip, which is the form the next step needs") },
          { full: true, tex: r`\begin{gathered} \text{front: } r, \quad \text{back: } -r \\[2pt] A = r - r\,(1 - r^2)\,e^{2i\varphi}\big(1 + r^2 e^{2i\varphi} + r^4 e^{4i\varphi} + \dots\big) \end{gathered}`,
            why: tx(t, "glslGems_a3", "reflecting off water from air gives r; reflecting off air from inside the water gives −r: that sign is the half-wave flip. Each later wave crossed the surface twice (keeping 1 − r² of the power) and bounced inside more times; each round trip adds the phase 2φ. Add them all: a geometric series") },
          { full: true, tex: r`R = |A|^2 = \frac{4r^2 \sin^2\varphi}{(1 - r^2)^2 + 4r^2 \sin^2\varphi}`,
            why: tx(t, "glslGems_a4", "sum the series and take the squared size of the result: the fraction of the power reflected. It is the Airy formula of a film between two equal media") },
          { full: true, tex: r`\begin{gathered} t \to 0:\ R \to 0 \\[2pt] \sin^2\varphi = 1:\ R = \frac{4r^2}{(1 + r^2)^2} \approx 7.7\% \end{gathered}`,
            why: tx(t, "glslGems_a5", "check the ends. A film much thinner than the light reflects nothing: the front and back waves cancel exactly (the black film). At best the two reflections arrive in step and give nearly four times what one surface reflects (2%)") },
        ]} />
      <Equation label={tx(t, "glslGems_filmLabel", "Thin-film reflectance in the shader")}
        words={tx(t, "glslGems_filmWords", "Turn thickness, angle and wavelength into a phase φ, then into a reflectance R. Do it for both polarisations (r_s and r_p from the Fresnel equations) and average them, and do it at many wavelengths.")}
        glsl={`float phi = 6.2831853 * NF * t * cosT / lambda;\nfloat s2  = sin(phi) * sin(phi);\nfloat R   = 4.0*r*r*s2 / ((1.0 - r*r)*(1.0 - r*r) + 4.0*r*r*s2);`}>
        {r`R(\lambda) = \frac{4r^2 \sin^2\varphi}{(1 - r^2)^2 + 4r^2 \sin^2\varphi}, \qquad \varphi = \frac{2\pi n t \cos\theta_t}{\lambda}`}
      </Equation>
      <LiveFormula label={tx(t, "glslGems_liveFilm", "Try it: one wavelength through the film")}
        tex={r`\varphi = \frac{2\pi n t \cos\theta_t}{\lambda}, \qquad R = \frac{4r^2 \sin^2\varphi}{(1 - r^2)^2 + 4r^2 \sin^2\varphi}`}
        vars={[
          { id: "th", label: "t", min: 0, max: 1500, step: 5, value: 300, fmt: v => `${v} nm` },
          { id: "theta", label: "θ", min: 0, max: 85, step: 1, value: 0, fmt: v => `${v}°` },
          { id: "lambda", label: "λ", min: 400, max: 700, step: 5, value: 550, fmt: v => `${v} nm` },
        ]}
        compute={filmNumbers()}
        note={tx(t, "glslGems_liveFilmNote", "At 300 nm and 550 nm (green), φ is close to 3π/2, so sin²φ is near 1 and green is reflected strongly. Move λ to 400 or 700: R drops, so the film looks green-yellow. Now raise θ: cos θt shrinks, so φ shrinks as if the film were thinner, and the colour changes. Set t near 0: nothing reflects, at any wavelength.")} />
      <BubbleFigure t={t} />
      <p>
        {tx(t, "glslGems_bubEnd",
          "The shader runs the formula at 16 wavelengths for each wall and adds them with the same colour weights as the diamond. Three paths reach the eye: off the front wall, straight through both, and off the inside of the back wall, the small upside-down second image of the sky. The film drains under gravity, so the top is thin and the bottom thick, and flows in swirls. When the top drops under about 30 nm it goes black, which is the sign that the bubble is about to burst. Very thick films lose their colour for a different reason: so many wavelengths fit that every colour is half reflected, and they average out to a pale pink and green.")}
      </p>
    </>
  );
}

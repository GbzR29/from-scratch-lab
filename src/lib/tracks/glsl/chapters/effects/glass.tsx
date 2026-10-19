// src/lib/tracks/glsl/chapters/effects/glass.tsx
"use client";

import { Callout, CodeBlock, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ShaderPlayground } from "@/components/lesson/glsl/ShaderPlayground";
import { WindowLabFigure } from "@/components/lesson/figures/glass/WindowLabFigure";
import { GlassRayFigure } from "@/components/lesson/figures/glass/GlassRayFigure";
import { AbsorptionFigure } from "@/components/lesson/figures/glass/AbsorptionFigure";
import { FresnelFigure } from "@/components/lesson/glsl/FresnelFigure";
import { GLASS_PRESETS } from "../../presets/glass";
import { refractNumbers, schlickNumbers } from "../../live/glass";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Glass & Fresnel
// ═════════════════════════════════════════════════════════════════════════════

export function GlassContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslGlass_intro",
          "Every transparent material follows two rules. Snell's law says where light goes when it crosses into another medium. The Fresnel equations say how much of it reflects instead. GLSL has both built in: refract() and, with one line of Schlick, the Fresnel term. Together they make glass, water, gems and soap bubbles.")}
      </Lead>

      <Goals t={t} id="glslGlass" items={[
        "Derive refract() from Snell's law, and know which normal and η to pass.",
        "Follow a ray into and out of glass, and catch total internal reflection.",
        "Compute how much light reflects with the Fresnel term.",
        "Add dispersion and coloured absorption.",
        "Render rain running down a window.",
      ]} />

      <RefractionSection t={t} />
      <FresnelSection t={t} />
      <DispersionSection t={t} />
      <AbsorptionSection t={t} />
      <RainSection t={t} />

      <KeyIdeas t={t} id="glslGlass" items={[
        "Light moves at c/n inside a material; Snell's law n₁ sin θ₁ = n₂ sin θ₂ says how much a ray bends.",
        "refract(I, N, η) is Snell's law in vector form: the tangent part of I is scaled by η, the normal part is √k.",
        "Entering: N faces the ray, η = 1/n. Leaving: flip N, η = n. Only leaving can make k < 0.",
        "k < 0 means total internal reflection: refract() returns vec3(0), so use reflect() instead.",
        "Fresnel: F ≈ R₀ + (1 − R₀)(1 − cosθ)⁵; mix refraction and reflection with it.",
        "R₀ = ((n₁ − n₂)/(n₁ + n₂))²: 4% for glass, 2% for water.",
        "Dispersion: n(λ) ≈ A + B/λ²; a shader refracts R, G and B with three slightly different η.",
        "Absorption: T = e^(−σ·d) per channel; in GLSL pow(tint, d), with d the path length inside.",
        "Rain on glass: drops are a height field c; read the scene at uv + k·∇c.",
        "Drops come from hashed grid cells; a sawtooth gives the stick-then-slide motion; trails clear the fog.",
        "Blur = mip level ≈ log₂(radius); condensation and frost choose the level, drops force it to 0.",
      ]} />
    </Article>
  );
}

// ── Refraction ────────────────────────────────────────────────────────────────

function RefractionSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGlass_snellTitle", "Refraction")}</H2>
      <p>
        {tx(t, "glslGlass_whyBend",
          "Light travels more slowly inside glass than in air. The refractive index n says how much slower: light moves at c/n, so in glass (n ≈ 1.5) it goes at two thirds of its speed in vacuum. When a beam reaches the surface at an angle, one side of it enters first and slows down first, so the whole beam turns, like a cart whose right wheels roll off the road into sand. The Physics track derives the rule from Fermat's principle of least time. Here we only need the rule itself:")}
      </p>
      <Equation label={tx(t, "glslGlass_lawLabel", "Snell's law")}
        where={[
          [r`n_1,\ n_2`, tx(t, "glslGlass_wN12", "refractive indices of the medium the ray comes from and the one it enters: air 1.0, water 1.33, glass 1.5, diamond 2.42")],
          [r`\theta_1,\ \theta_2`, tx(t, "glslGlass_wTh12", "angles of the incoming and the refracted ray, both measured from the normal (the line perpendicular to the surface)")],
        ]}
        words={tx(t, "glslGlass_lawWords", "Index times the sine of the angle is the same on both sides. Going into a higher index, the sine must shrink, so the ray bends towards the normal; going into a lower index it bends away from it.")}>
        {r`n_1 \sin\theta_1 = n_2 \sin\theta_2`}
      </Equation>
      <p>
        {tx(t, "glslGlass_vecIntro",
          "A shader does not work with angles. It has the unit direction of the ray, I, and the unit normal of the surface, N, and wants the unit direction of the refracted ray, T. refract() is Snell's law rewritten for those vectors. Here is where its formula comes from:")}
      </p>
      <Derivation t={t} label={tx(t, "glslGlass_derLabel", "From Snell's law to refract()")}
        where={[
          [r`\eta`, tx(t, "glslGlass_wEta", "η = n₁ / n₂, the index of the medium the ray is in divided by the index of the one it enters")],
          [r`\mathbf I,\ \mathbf N`, tx(t, "glslGlass_wIN", "unit incident direction and unit normal facing against it, so N·I = −cos θ₁ is negative")],
          [r`k`, tx(t, "glslGlass_wK2", "the number under the square root, named k in the GLSL specification: cos² of the refracted angle")],
        ]}
        steps={[
          { full: true, tex: r`\begin{gathered} \mathbf I = \mathbf I_\perp + \mathbf I_\parallel \\ \mathbf I_\perp = (\mathbf N\cdot\mathbf I)\,\mathbf N, \qquad \mathbf I_\parallel = \mathbf I - (\mathbf N\cdot\mathbf I)\,\mathbf N \end{gathered}`,
            why: tx(t, "glslGlass_d1", "split I into a part along the normal and a part along the surface. N·I is the length of I measured along N, so (N·I) N is the normal part, and the rest is the tangent part") },
          { full: true, tex: r`|\mathbf I_\parallel| = \sin\theta_1, \qquad |\mathbf I_\perp| = \cos\theta_1`,
            why: tx(t, "glslGlass_d2", "I has length 1, so its two parts are the sides of a right triangle with hypotenuse 1 and angle θ₁ at the normal") },
          { full: true, tex: r`\sin\theta_2 = \eta\,\sin\theta_1 \;\Rightarrow\; \mathbf T_\parallel = \eta\,\mathbf I_\parallel`,
            why: tx(t, "glslGlass_d3", "Snell's law divided by n₂. The refracted ray keeps going the same way along the surface, so its tangent part points like I's; only the length changes, from sin θ₁ to sin θ₂, a factor η") },
          { full: true, tex: r`\begin{aligned} |\mathbf T_\perp| = \cos\theta_2 &= \sqrt{1 - \sin^2\theta_2} \\ &= \sqrt{1 - \eta^2\big(1 - (\mathbf N\cdot\mathbf I)^2\big)} = \sqrt{k} \end{aligned}`,
            why: tx(t, "glslGlass_d4", "T must have length 1 too, so its normal part is whatever Pythagoras leaves. Inside, sin²θ₂ = η² sin²θ₁ and sin²θ₁ = 1 − cos²θ₁ = 1 − (N·I)²") },
          { full: true, tex: r`\begin{aligned} \mathbf T &= \eta\,\big(\mathbf I - (\mathbf N\cdot\mathbf I)\,\mathbf N\big) - \sqrt{k}\,\mathbf N \\ &= \eta\,\mathbf I - \big(\eta\,(\mathbf N\cdot\mathbf I) + \sqrt{k}\big)\,\mathbf N \end{aligned}`,
            why: tx(t, "glslGlass_d5", "add the two parts. The normal part points into the second medium, which is the direction −N. Multiplying out gives, letter for letter, the formula of the GLSL specification") },
          { full: true, tex: r`k < 0 \iff \eta\,\sin\theta_1 > 1`,
            why: tx(t, "glslGlass_d6", "k is negative only when Snell's law asks for a sine larger than 1. No angle has such a sine, so there is no refracted ray and refract() returns vec3(0). When η < 1 (entering a denser medium) k ≥ 1 − η² > 0, so this can only happen on the way out") },
        ]} />
      <Equation label={tx(t, "glslGlass_snellLabel", "What refract() computes")}
        words={tx(t, "glslGlass_snellWords", "Keep the part of the ray that runs along the surface, scaled by η, and add as much of −N as it takes to make the result one unit long. If no amount can do that, k is negative and there is no refracted ray.")}
        note={tx(t, "glslGlass_snellNote", "When k < 0 there is no refracted ray (total internal reflection) and refract() returns vec3(0). Check for it. Entering glass from air use η = 1/1.5; leaving it use η = 1.5 with the normal flipped to face the ray.")}
        glsl="vec3 T = refract(I, N, eta);   // vec3(0.0) on total internal reflection">
        {r`\begin{gathered} k = 1 - \eta^2\big(1 - (\mathbf N\cdot\mathbf I)^2\big) \\ \mathbf T = \eta\,\mathbf I - \big(\eta\,(\mathbf N\cdot\mathbf I) + \sqrt{k}\big)\mathbf N \end{gathered}`}
      </Equation>

      <H3>{tx(t, "glslGlass_sidesTitle", "Entering and leaving")}</H3>
      <p>
        {tx(t, "glslGlass_sidesBody",
          "refract() trusts its inputs on two points: N faces against the ray (N·I < 0), and η is the index of the medium the ray is in divided by the index of the medium it enters. A mesh stores only the outward normal, so the shader tells the two cases apart by the sign of dot(I, N):")}
      </p>
      <LessonTable
        headers={[
          tx(t, "glslGlass_thCase", "case"),
          tx(t, "glslGlass_thNormal", "normal to pass"),
          "η",
          tx(t, "glslGlass_thTir", "can k be negative?"),
        ]}
        rows={[
          [tx(t, "glslGlass_tcEnter", "air → glass, dot(I, N) < 0"), tx(t, "glslGlass_tnEnter", "N, the outward normal"), "1 / 1.5 ≈ 0.667", tx(t, "glslGlass_ttEnter", "never: η < 1")],
          [tx(t, "glslGlass_tcLeave", "glass → air, dot(I, N) > 0"), tx(t, "glslGlass_tnLeave", "−N, flipped to face the ray"), "1.5", tx(t, "glslGlass_ttLeave", "yes, beyond the critical angle, 41.8° for glass")],
        ]} />
      <CodeBlock lang="glsl" filename="refract both ways" t={t}>{`bool  entering = dot(I, N) < 0.0;          // N is the outward normal
vec3  n   = entering ? N : -N;             // must face against the ray
float eta = entering ? 1.0 / ior : ior;    // n_from / n_to
vec3  T   = refract(I, n, eta);
if (dot(T, T) == 0.0) T = reflect(I, n);   // total internal reflection`}</CodeBlock>
      <Equation label={tx(t, "glslGlass_critLabel", "The critical angle")}
        where={[[r`\theta_c`, tx(t, "glslGlass_wCrit", "the incoming angle at which the refracted ray runs along the surface (θ₂ = 90°). Glass to air 41.8°, water to air 48.8°, diamond to air 24.4°")]]}
        words={tx(t, "glslGlass_critWords", "Put θ₂ = 90° in Snell's law. Past that angle, light inside the denser medium cannot get out at all and is reflected back completely.")}>
        {r`\sin\theta_c = \frac{n_2}{n_1} \qquad (n_1 > n_2)`}
      </Equation>
      <LiveFormula label={tx(t, "glslGlass_liveRefract", "Try it: refract() by hand")}
        tex={r`\begin{gathered} k = 1 - \eta^2\big(1 - (\mathbf N\cdot\mathbf I)^2\big) \\ \mathbf T = \eta\,\mathbf I - \big(\eta\,(\mathbf N\cdot\mathbf I) + \sqrt{k}\big)\mathbf N \end{gathered}`}
        vars={[
          { id: "n", label: "n", min: 1, max: 2.5, step: 0.01, value: 1.5, fmt: v => v.toFixed(2) },
          { id: "theta", label: "θ₁", min: 0, max: 89, step: 1, value: 40, fmt: v => `${v}°` },
          { id: "side", label: tx(t, "glslGlass_lvSide", "ray"), min: 0, max: 1, step: 1, value: 0, fmt: v => (v ? tx(t, "glslGlass_lvLeave", "leaving") : tx(t, "glslGlass_lvEnter", "entering")) },
        ]}
        compute={refractNumbers(t)}
        note={tx(t, "glslGlass_liveRefractNote", "The frame is turned so that N = (0, 1) and I = (sin θ₁, −cos θ₁); then T works out to (η sin θ₁, −√k). Entering glass at 40°, the ray bends to about 25°. Now switch the ray to leaving: η becomes 1.5 and k drops. Raise θ₁ past 41.8° and k turns negative: total internal reflection. Try n = 2.42, diamond: it is trapped from 24.4° on.")} />
      <GlassRayFigure t={t} />
    </>
  );
}

// ── Fresnel ───────────────────────────────────────────────────────────────────

function FresnelSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGlass_fresTitle", "Fresnel: how much reflects")}</H2>
      <p>
        {tx(t, "glslGlass_fresBody",
          "Refraction says where the light goes, not how much of it. At every surface the light splits: a fraction F is reflected and the rest, 1 − F, goes through. F depends on the angle. Look straight through a window and you barely see your reflection; look along a wet road at a low angle and it is a mirror. The exact fractions come from the Fresnel equations, one for each polarisation of light. Head-on they collapse to a very simple number:")}
      </p>
      <Derivation t={t} label={tx(t, "glslGlass_r0Der", "The reflectance head-on, R₀")}
        steps={[
          { full: true, tex: r`\begin{gathered} r_s = \frac{n_1\cos\theta_1 - n_2\cos\theta_2}{n_1\cos\theta_1 + n_2\cos\theta_2} \\[4pt] r_p = \frac{n_1\cos\theta_2 - n_2\cos\theta_1}{n_1\cos\theta_2 + n_2\cos\theta_1} \end{gathered}`,
            why: tx(t, "glslGlass_r1", "the Fresnel ratios of reflected to incoming wave amplitude, for light polarised across the plane of the rays (s) and along it (p). They come from Maxwell's equations at the boundary; here we take them as given") },
          { full: true, tex: r`F = \tfrac{1}{2}\,\big(r_s^2 + r_p^2\big)`,
            why: tx(t, "glslGlass_r2", "the energy of a wave goes as its amplitude squared, and sunlight or a lamp is an even mix of both polarisations, so F is the average of the two squares") },
          { full: true, tex: r`\begin{gathered} \theta_1 = \theta_2 = 0: \\[2pt] r_s = \frac{n_1 - n_2}{n_1 + n_2}, \qquad r_p = \frac{n_2 - n_1}{n_1 + n_2} \end{gathered}`,
            why: tx(t, "glslGlass_r3", "head-on, both cosines are 1. The two ratios are then the same number with opposite signs") },
          { full: true, tex: r`\begin{aligned} R_0 = F(0) &= \Big(\frac{n_1 - n_2}{n_1 + n_2}\Big)^2 \\ &= \Big(\frac{1 - 1.5}{1 + 1.5}\Big)^2 = 0.04 \end{aligned}`,
            why: tx(t, "glslGlass_r4", "squaring removes the sign, so both polarisations agree. For glass in air that is 4%; water gives 2%, diamond 17%") },
        ]} />
      <Equation label={tx(t, "glslGlass_schlickLabel", "Schlick's approximation")}
        where={[
          [r`R_0`, tx(t, "glslGlass_wR0", "reflectance at normal incidence: 2% water, 4% glass, 17% diamond; 50–100% metals (coloured)")],
          [r`\cos\theta`, tx(t, "glslGlass_wCos", "N·V, the angle between the view and the normal")],
        ]}
        words={tx(t, "glslGlass_schlickWords", "Start from the head-on reflectance R₀ and close the gap to 100% with (1 − cos θ)⁵, a number that stays near 0 until the view is close to grazing and then shoots up to 1. Then blend the refracted and reflected colours by that amount.")}
        note={tx(t, "glslGlass_schlickNote", "The exact equations average two polarisations with square roots and divisions. Schlick's fifth power matches them within a few percent for dielectrics and costs a couple of multiplies. The PBR chapters of the OpenGL track use the same term, F in Cook-Torrance.")}>
        {r`\begin{gathered} R_0 = \left(\frac{n_1 - n_2}{n_1 + n_2}\right)^2 \\[4pt] F(\theta) \approx R_0 + (1 - R_0)(1 - \cos\theta)^5 \\[4pt] c = \operatorname{mix}(\text{${tx(t, "glslGlass_mixRefr", "refracted")}},\ \text{${tx(t, "glslGlass_mixRefl", "reflected")}},\ F) \end{gathered}`}
      </Equation>
      <p>
        {tx(t, "glslGlass_mixBody",
          "In the shader F is the weight of a mix(): the reflected colour gets F and the refracted colour gets 1 − F, so no light is made or lost at the surface. Two details matter. cos θ is N·V, with V pointing from the surface to the eye, so it is 1 head-on and 0 at the rim of an object. And when a ray leaves glass, Schlick must use the angle on the air side, cos θ₂; with the inside angle it never reaches 1 and misses total internal reflection. The figure below does it that way.")}
      </p>
      <LiveFormula label={tx(t, "glslGlass_liveSchlick", "Try it: Schlick against the exact value")}
        tex={r`F \approx R_0 + (1 - R_0)(1 - \cos\theta)^5`}
        vars={[
          { id: "n", label: "n", min: 1, max: 2.5, step: 0.01, value: 1.5, fmt: v => v.toFixed(2) },
          { id: "theta", label: "θ", min: 0, max: 89, step: 1, value: 60, fmt: v => `${v}°` },
        ]}
        compute={schlickNumbers(t)}
        note={tx(t, "glslGlass_liveSchlickNote", "Light enters from air. Up to about 45° F hardly moves from R₀; the fifth power keeps it flat. Past 70° it climbs fast, and at 89° almost everything is reflected. Compare with the exact value: Schlick is a little low in the middle and catches up at both ends. Set n = 1 and nothing reflects at any angle, since there is no boundary.")} />
      <FresnelFigure t={t} />
    </>
  );
}

// ── Dispersion ────────────────────────────────────────────────────────────────

function DispersionSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGlass_dispTitle", "Dispersion")}</H2>
      <p>
        {tx(t, "glslGlass_dispBody",
          "The index of refraction depends on the wavelength. Glass slows violet light a little more than red, so violet bends a little more, and a prism uses that to spread white light into a rainbow. Over the visible range a two-term fit is enough:")}
      </p>
      <Equation label={tx(t, "glslGlass_cauchyLabel", "Cauchy's equation")}
        where={[
          [r`\lambda`, tx(t, "glslGlass_wLambda", "wavelength in nanometres: about 400 for violet, 550 for green, 700 for red")],
          [r`A`, tx(t, "glslGlass_wA", "the index far into the red, where the second term fades: about 1.505 for common window glass")],
          [r`B`, tx(t, "glslGlass_wB", "how strongly the index rises towards blue: about 4200 nm² for the same glass, much more for diamond")],
        ]}
        words={tx(t, "glslGlass_cauchyWords", "The index is a constant plus a small extra that grows as the wavelength gets shorter, so blue and violet see slightly denser glass than red.")}
        note={tx(t, "glslGlass_cauchyNote", "With those values n = 1.531 at 400 nm, 1.517 at 589 nm and 1.513 at 700 nm. The difference is under 0.02, yet it is what puts coloured fringes on the edges of a glass object and a rainbow out of a prism.")}>
        {r`n(\lambda) \approx A + \frac{B}{\lambda^2}`}
      </Equation>
      <p>
        {tx(t, "glslGlass_dispShader",
          "A shader has only three colour channels. The cheap version refracts three times, with η a little lower for red and a little higher for blue, and keeps one channel from each result. That is three times the work for that part of the shader. uDispersion in the ball shader below is that ±Δn. Its default 0.03 is about twice the real spread of glass, which makes the fringes easy to see.")}
      </p>
      <CodeBlock lang="glsl" filename="three refractions" t={t}>{`vec3 refr = vec3(through(ro, rd, uIOR - uDispersion).r,   // red: the smallest index
                 through(ro, rd, uIOR).g,
                 through(ro, rd, uIOR + uDispersion).b);  // blue: the largest index`}</CodeBlock>
    </>
  );
}

// ── Absorption ────────────────────────────────────────────────────────────────

function AbsorptionSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGlass_absTitle", "Absorption: why thick glass has a colour")}</H2>
      <p>
        {tx(t, "glslGlass_absBody",
          "Clear glass absorbs a little light and tinted glass a lot, but neither absorbs every colour equally. Inside the material, each thin layer removes the same fraction of the light that reaches it. That one rule gives the whole law:")}
      </p>
      <Derivation t={t} label={tx(t, "glslGlass_beerDer", "From one thin layer to Beer–Lambert")}
        steps={[
          { full: true, tex: r`dI = -\,\sigma_a\, I\, dx`,
            why: tx(t, "glslGlass_b1", "a layer of thickness dx removes the fraction σₐ dx of the light I that reaches it. Twice the light in, twice as much absorbed") },
          { full: true, tex: r`\frac{dI}{I} = -\,\sigma_a\, dx`,
            why: tx(t, "glslGlass_b2", "divide by I: every layer takes the same fraction, whatever is left") },
          { full: true, tex: r`\ln I(d) - \ln I(0) = -\,\sigma_a\, d`,
            why: tx(t, "glslGlass_b3", "add up all the layers from 0 to d (integrate both sides); the integral of dI/I is ln I") },
          { full: true, tex: r`T = \frac{I(d)}{I(0)} = e^{-\sigma_a d}`,
            why: tx(t, "glslGlass_b4", "undo the logarithm. T is the fraction that survives the whole thickness") },
          { full: true, tex: r`\begin{gathered} e^{-\sigma_a (d_1 + d_2)} = e^{-\sigma_a d_1}\, e^{-\sigma_a d_2} \\[2pt] e^{-\sigma_a d} = \big(e^{-\sigma_a}\big)^{d} \end{gathered}`,
            why: tx(t, "glslGlass_b5", "two panes multiply their transmissions. And e^(−σₐ) is just the fraction left after one unit of thickness, so a shader can store that colour and raise it to the power d") },
        ]} />
      <Equation label={tx(t, "glslGlass_beerLabel", "Beer–Lambert absorption")}
        where={[[r`\sigma_a`, tx(t, "glslGlass_wSigma", "absorption per colour channel. Water absorbs red far more than blue (large σ for red), which is why deep water looks blue-green")], [r`d`, tx(t, "glslGlass_wDist", "distance travelled inside the medium")]]}
        words={tx(t, "glslGlass_beerWords", "Every extra unit of thickness keeps the same fraction of each colour, so the colour that is absorbed least takes over as the glass gets thicker.")}
        glsl="vec3 absorb = pow(uTint, vec3(d * uDensity));   // = exp(-sigma * d) with sigma = -log(uTint) * uDensity">
        {r`T = e^{-\sigma_a\,d}`}
      </Equation>
      <AbsorptionFigure t={t} />
      <p>
        {tx(t, "glslGlass_absShader",
          "To use it, the shader needs d, the length of the path inside the glass. For the ball it comes free: it is the exit distance of the second ray–sphere test. The ball shader stores the tint as uTint, the colour that survives one unit of glass, and raises it to the power d × uDensity. Raise uDensity: the centre of the ball, where the path is longest (d = 2), darkens first, and the thin rim stays clear.")}
      </p>
      <ShaderPlayground presets={GLASS_PRESETS} t={t} id="glslGlass" />
      <Callout type="info" t={t}>
        {tx(t, "glslGlass_rtNote", "In a rasteriser you cannot trace the refracted ray through the scene. Real-time glass samples a cube map, the screen behind the object (screen-space refraction, offsetting the UV by the normal), or a blurred copy of the scene for frosted glass. The ball here is ray-traced analytically because it is a sphere.")}
      </Callout>
    </>
  );
}

// ── Rain on a window ──────────────────────────────────────────────────────────

function RainSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslGlass_winTitle", "Rain on a window")}</H2>
      <p>
        {tx(t, "glslGlass_winBody",
          "A rainy window brings everything in this chapter together on a flat pane. Each drop is a small lens that bends the street behind it. The condensation around the drops scatters light and blurs the view, and a sliding drop wipes that condensation away and leaves a clear trail. The best-known real-time version is Martijn Steinrucken's (BigWIngs) Shadertoy “Heartfelt”. The lab below rebuilds its technique step by step, and adds frosted glass, dispersion and condensation you can wipe with the pointer.")}
      </p>

      <WindowLabFigure t={t} />

      <H3>{tx(t, "glslGlass_dropHTitle", "Drops as a height field")}</H3>
      <p>
        {tx(t, "glslGlass_dropHBody",
          "A drop is modelled like the water ripples: a scalar c(uv) that is 0 on dry glass and rises toward 1 inside a drop, a rough stand-in for the drop's thickness. Where the glass is tilted by a drop, light bends by an amount proportional to the slope (the small-angle form of Snell's law). So the background is read at an offset equal to the gradient of c, estimated from two extra evaluations one pixel apart:")}
      </p>
      <Equation label={tx(t, "glslGlass_offLabel", "Refraction offset from the drop field")}
        where={[
          [r`\nabla c \approx \tfrac{1}{\varepsilon}\big(c(u{+}\varepsilon,v) - c,\ c(u,v{+}\varepsilon) - c\big)`, tx(t, "glslGlass_wGrad", "finite differences with ε = 0.001, which is why drops() runs three times per pixel")],
          [r`k`, tx(t, "glslGlass_wK", "the refraction slider: how strongly a slope bends the view (it stands for (1 − 1/n) × the distance to the scene)")],
        ]}
        glsl={`vec2 n = vec2(drops(uv + e).x - c, drops(uv + e.yx).x - c);\nvec3 col = textureLod(uScene, UV + n * k, lod).rgb;`}>
        {r`\text{colour}(uv) = \text{scene}\big(uv + k\,\nabla c(uv)\big)`}
      </Equation>

      <H3>{tx(t, "glslGlass_cellsTitle", "Thousands of drops from a grid")}</H3>
      <p>
        {tx(t, "glslGlass_cellsBody",
          "As with the stars and the raindrops on water, no drop is stored. The glass is cut into cells, 6 times taller than wide because drops slide vertically, and every cell hashes its id into three random numbers n = (n.x, n.y, n.z). n.x places the drop horizontally, n.z gives it its own clock and wobble, and each column of cells is shifted by a random amount so that the rows never line up. Three layers are added together: tiny static drops on a 40-cell grid, and two layers of sliding drops, the second at 1.85× the scale so the sizes vary.")}
      </p>
      <Equation label={tx(t, "glslGlass_sawLabel", "Stick, then slide: the sawtooth")}
        where={[
          [r`\operatorname{saw}(b, t)`, tx(t, "glslGlass_wSaw", "rises smoothly while t goes from 0 to b = 0.85, then drops back to 0 in the remaining 15%. A slow climb and a sudden fall")],
          [r`y`, tx(t, "glslGlass_wY", "the drop's height inside its cell. The whole grid scrolls down at a constant speed while the drop climbs inside it almost as fast, so on screen the drop barely creeps. When the sawtooth falls, the drop jumps down its cell. It is the stick-then-slide motion of real drops, held by surface tension until they are heavy enough")],
          [r`x`, tx(t, "glslGlass_wX", "the horizontal position: n.x − ½ plus a wobble sin(y + sin y), whose amplitude shrinks near the cell's sides so the drop never leaves its column")],
        ]}
        glsl={`float saw(float b, float t) { return smoothstep(0.0, b, t) * smoothstep(1.0, b, t); }\nfloat y = (saw(0.85, fract(t + n.z)) - 0.5) * 0.9 + 0.5;`}>
        {r`\operatorname{saw}(b, t) = \operatorname{smoothstep}(0, b, t)\cdot\operatorname{smoothstep}(1, b, t) \qquad y = 0.9\big(\operatorname{saw}(0.85,\ \operatorname{fract}(t + n_z)) - 0.5\big) + 0.5`}
      </Equation>
      <p>
        {tx(t, "glslGlass_trailBody",
          "The trail is a vertical strip above the drop. It is narrow where the drop has just passed and narrower still further up, since r shrinks with height. Along it, a repeating pattern fract(10·v) places small droplets left behind, which is why a real trail looks beaded. The static drops use the same sawtooth with b = 0.025: they appear almost instantly (a raindrop hitting) and evaporate over the rest of their cycle. Finally the layers are summed and passed through smoothstep(0.3, 1, c). That merges neighbouring drops into one smooth surface, the way touching water drops fuse.")}
      </p>

      <H3>{tx(t, "glslGlass_blurTitle", "Blur from the mip chain")}</H3>
      <Equation label={tx(t, "glslGlass_lodLabel", "Choosing how blurry each pixel is")}
        where={[
          [r`\text{lod}`, tx(t, "glslGlass_wLod", "the mip level passed to textureLod. Level L is the image averaged over 2^L × 2^L texels, so blurring by about R pixels means reading level log₂R")],
          [r`f`, tx(t, "glslGlass_wF", "condensation at this pixel: the fog slider × the wipe mask × (1 − trail), because sliding drops clear the glass they cross")],
          [r`c`, tx(t, "glslGlass_wC", "the drop mask: inside a drop the level goes to 0, so the view is sharp. A drop is clear water in the middle of the mist")],
        ]}
        note={tx(t, "glslGlass_lodNote", "Mipmaps give free, variable blur, but box-shaped: a bright light turns into a square. Six extra taps around a circle at the same level round it off into proper bokeh. The wipe mask is a small 192×108 texture that the page updates from the pointer and that fogs back up a little every frame.")}>
        {r`\text{lod} = \operatorname{mix}\!\big(\max(f\cdot\text{blur},\ 5\cdot\text{frost}),\ 0,\ \operatorname{smoothstep}(0.1, 0.2, c)\big)`}
      </Equation>
      <p>
        {tx(t, "glslGlass_frostBody",
          "Frosted glass is a rough surface. Every ray that crosses it is refracted in a slightly random direction, and a pixel averages many such rays, which is a blur whose radius grows with the roughness. Its cheap form is a mip level proportional to the frost, plus a per-pixel jitter of the offset for the grainy look of etched glass. Dispersion reuses the drop offset three times with slightly different strengths for red, green and blue (1 ± 0.3k), so bright lights seen through a drop get coloured fringes, like the glass ball above.")}
      </p>
    </>
  );
}

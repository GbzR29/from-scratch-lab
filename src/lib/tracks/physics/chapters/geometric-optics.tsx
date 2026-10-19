"use client";

// Electromagnetism & Light 3: geometric optics — rays, the refractive index
// and what changes inside a material, the law of reflection and plane
// mirrors, Snell's law and its derivation from Fermat's least-time
// principle, apparent depth, total internal reflection and fibres,
// dispersion and the rainbow, thin lenses (the lens equation derived from
// similar triangles, magnification, sign rules), curved mirrors, the eye,
// glasses in dioptres, magnifier, camera and telescope.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { SnellFigure } from "@/components/lesson/figures/physics/SnellFigure";
import { FermatFigure } from "@/components/lesson/figures/physics/FermatFigure";
import { LensFigure } from "@/components/lesson/figures/physics/LensFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** The critical angle from a dense material into a less dense one. */
const criticalNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const s = v.n2 / v.n1;
  if (s >= 1) return { tex: r`\frac{n_2}{n_1} = ${num(s, 3)} \ge 1:\ \text{${tx(t, "phOpt_liveNoTir", "no total internal reflection")}}`, meter: 0, meterLabel: "—" };
  const th = (Math.asin(s) * 180) / Math.PI;
  return {
    tex: r`\theta_c = \arcsin\frac{${num(v.n2, 3)}}{${num(v.n1, 3)}} = \amber{${num(th, 1)}^\circ}`,
    meter: th / 90, meterLabel: `${tx(t, "phOpt_liveTrapped", "trapped beyond")} ${num(th, 1)}°`,
  };
};

export function GeometricOpticsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phOpt_intro",
          "The last chapter showed that light is an electromagnetic wave with a wavelength of half a micrometre. Most things light meets, a window, a raindrop, the lens of your eye, are thousands of times bigger than that, and then the wave nature hardly shows: light travels in straight lines called rays, which bounce off mirrors and bend where they cross into glass or water. Those two rules, reflection and refraction, are enough to explain mirrors, rainbows, optical fibres, glasses, cameras and telescopes.")}
      </Lead>

      <Goals t={t} id="phOpt" items={[
        "Use the refractive index n = c/v, the law of reflection and Snell's law.",
        "Derive Snell's law from Fermat's principle of least time.",
        "Find the critical angle for total internal reflection and explain fibres, dispersion and rainbows.",
        "Use the thin-lens equation and magnification to find images, and apply them to the eye and to glasses.",
      ]} />

      <H2>{tx(t, "phOpt_indexTitle", "Light inside materials")}</H2>
      <p>
        {tx(t, "phOpt_indexBody",
          "In empty space light travels at c. Inside glass or water its field drives the electrons of the atoms back and forth, they re-radiate, and the combined wave moves more slowly. How much more slowly is measured by the refractive index.")}
      </p>
      <Equation label={tx(t, "phOpt_eqIndex", "The refractive index")}
        where={[
          [r`n`, tx(t, "phOpt_wN", "the refractive index of the material, a pure number, 1 for a vacuum and larger for everything else")],
          [r`c`, tx(t, "phOpt_wC", "the speed of light in a vacuum, 2.998 × 10⁸ m/s")],
          [r`v`, tx(t, "phOpt_wV", "the speed of light in the material")],
          [r`\lambda_n`, tx(t, "phOpt_wLn", "the wavelength inside the material; λ is the wavelength in a vacuum")],
        ]}
        words={tx(t, "phOpt_indexWords", "Light is n times slower inside the material. Its frequency stays the same, set by the source, so its wavelength shrinks by the same factor.")}
        note={tx(t, "phOpt_indexNote", "The colour we see is set by the frequency, which is why a red object still looks red under water.")}>
        {r`n = \frac{c}{v}, \qquad \lambda_n = \frac{\lambda}{n}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "phOpt_tMat", "Material"), "n", tx(t, "phOpt_tSpeed", "Speed of light")]}
        rows={[
          [tx(t, "phOpt_n1", "vacuum"), "1", tx(t, "phOpt_n1v", "300 000 km/s")],
          [tx(t, "phOpt_n2", "air"), tx(t, "phOpt_n2n", "1.0003"), tx(t, "phOpt_n2v", "299 700 km/s")],
          [tx(t, "phOpt_n3", "water"), tx(t, "phOpt_n3n", "1.33"), tx(t, "phOpt_n3v", "225 000 km/s")],
          [tx(t, "phOpt_n4", "window glass"), tx(t, "phOpt_n4n", "1.52"), tx(t, "phOpt_n4v", "197 000 km/s")],
          [tx(t, "phOpt_n5", "diamond"), tx(t, "phOpt_n5n", "2.42"), tx(t, "phOpt_n5v", "124 000 km/s")],
        ]}
      />

      <H2>{tx(t, "phOpt_reflTitle", "Reflection")}</H2>
      <p>
        {tx(t, "phOpt_reflBody",
          "Angles in optics are always measured from the normal, the line perpendicular to the surface where the ray hits it. The law of reflection says the reflected ray leaves at the same angle as the incident ray arrived, on the other side of the normal, in the same plane. A smooth surface reflects a whole beam the same way and gives a mirror image; a rough one, like paper, has its normal pointing every which way and scatters light in all directions, which is how you see most objects.")}
      </p>
      <p>
        {tx(t, "phOpt_planeBody",
          "In a flat mirror, the rays from each point of your face bounce off and spread out as if they came from a point as far behind the mirror as your face is in front of it. Your eye traces them back to that point and sees an image there. No light actually reaches the space behind the mirror: the image is virtual. Because the mirror sits halfway between you and your image, a mirror only half your height is enough to see yourself head to toe, wherever you stand.")}
      </p>

      <H2>{tx(t, "phOpt_refrTitle", "Refraction: Snell's law")}</H2>
      <Equation label={tx(t, "phOpt_eqSnell", "Snell's law of refraction")}
        where={[
          [r`n_1,\ n_2`, tx(t, "phOpt_wN12", "the refractive indices of the material the light leaves and the one it enters")],
          [r`\theta_1`, tx(t, "phOpt_wTh1", "the angle of incidence, between the incoming ray and the normal")],
          [r`\theta_2`, tx(t, "phOpt_wTh2", "the angle of refraction, between the outgoing ray and the normal")],
        ]}
        words={tx(t, "phOpt_snellWords", "Entering a slower material (bigger n), a ray bends towards the normal; entering a faster one, it bends away from it. Straight along the normal, it does not bend at all.")}
        note={tx(t, "phOpt_snellNote", "Part of the light is always reflected as well. For glass in air it is about 4% straight on, rising towards 100% at grazing angles.")}>
        {r`n_1 \sin\theta_1 = n_2 \sin\theta_2`}
      </Equation>
      <SnellFigure t={t} />
      <H3>{tx(t, "phOpt_fermatTitle", "Why light bends: the path of least time")}</H3>
      <p>
        {tx(t, "phOpt_fermatBody",
          "In 1662 Pierre de Fermat found a single principle behind both laws: between two points, light follows the path that takes the least time. In one material the quickest path is a straight line. Across a boundary between a fast and a slow material, it pays to travel a bit further in the fast one and cut the distance in the slow one, so the path bends.")}
      </p>
      <Derivation t={t} label={tx(t, "phOpt_eqFermat", "Snell's law from least time")}
        steps={[
          { tex: r`T(x) = \frac{\sqrt{a^2 + x^2}}{v_1} + \frac{\sqrt{b^2 + (d - x)^2}}{v_2}`, why: tx(t, "phOpt_f1", "light goes from A, a height a above the boundary, to B, a depth b below it and a distance d further along, crossing the boundary at x; time is distance over speed on each side") },
          { tex: r`\frac{dT}{dx} = \frac{x}{v_1\sqrt{a^2 + x^2}} - \frac{d - x}{v_2\sqrt{b^2 + (d-x)^2}} = 0`, why: tx(t, "phOpt_f2", "the quickest crossing is where the time stops changing as x moves: set the derivative to zero (Math track, derivatives)") },
          { tex: r`\frac{\sin\theta_1}{v_1} = \frac{\sin\theta_2}{v_2}`, why: tx(t, "phOpt_f3", "each fraction is the opposite side over the hypotenuse of its triangle, the sine of the angle from the normal") },
          { tex: r`\green{n_1 \sin\theta_1 = n_2 \sin\theta_2}`, why: tx(t, "phOpt_f4", "multiply by c and use n = c/v: Snell's law") },
        ]} />
      <FermatFigure t={t} />
      <p>
        {tx(t, "phOpt_fermatMore",
          "The same principle gives the law of reflection: of all the paths that touch the mirror on the way from A to B, the equal-angle one is the shortest. Principles of this kind, a quantity made as small as possible over a whole path, run deep in physics: the Math track's chapter on the calculus of variations finds them, and the chapters on Lagrangian mechanics will show that motion itself obeys one.")}
      </p>
      <H3>{tx(t, "phOpt_depthTitle", "Why pools look shallow")}</H3>
      <p>
        {tx(t, "phOpt_depthBody",
          "Rays from a coin at the bottom of a pool bend away from the normal as they leave the water, so traced back they seem to come from a point higher up. Looking almost straight down, where the angles are small and sin θ ≈ tan θ, the apparent depth is the real depth divided by n: a 2.0 m pool looks 2.0/1.33 = 1.5 m deep. A straw in a glass looks broken at the surface for the same reason.")}
      </p>

      <H2>{tx(t, "phOpt_tirTitle", "Total internal reflection")}</H2>
      <p>
        {tx(t, "phOpt_tirBody",
          "When light goes from a slow material into a faster one, say from glass to air, it bends away from the normal: θ₂ is bigger than θ₁. Tilt the incoming ray further and θ₂ reaches 90°, the ray skimming along the surface. Beyond that angle Snell's law would need sin θ₂ > 1, which no angle has: no light gets out, and all of it is reflected back inside, losslessly.")}
      </p>
      <Derivation t={t} label={tx(t, "phOpt_eqCrit", "The critical angle")}
        steps={[
          { tex: r`n_1 \sin\theta_c = n_2 \sin 90^\circ = n_2`, why: tx(t, "phOpt_c1", "at the critical angle the refracted ray runs along the surface") },
          { tex: r`\green{\sin\theta_c = \frac{n_2}{n_1}}`, why: tx(t, "phOpt_c2", "only possible when n₁ > n₂: from the slower material into the faster") },
        ]} />
      <LiveFormula label={tx(t, "phOpt_liveCrit", "Try it: the critical angle")}
        tex={r`\sin\theta_c = \frac{n_2}{n_1}`}
        vars={[
          { id: "n1", label: tx(t, "phOpt_liveN1", "n₁ (inside)"), min: 1, max: 2.6, step: 0.01, value: 1.52, fmt: v => num(v, 2) },
          { id: "n2", label: tx(t, "phOpt_liveN2", "n₂ (outside)"), min: 1, max: 2.6, step: 0.01, value: 1.0, fmt: v => num(v, 2) },
        ]}
        compute={criticalNumbers(t)}
        note={tx(t, "phOpt_liveCritNote", "Glass in air traps light beyond 41°, water beyond 49°, diamond beyond only 24°. That small angle is why a cut diamond sparkles: light entering the top bounces around inside many times before it finds a way out.")} />
      <p>
        {tx(t, "phOpt_fibreBody",
          "An optical fibre is a glass thread with a core of slightly higher index than the cladding around it. Light sent in along the fibre hits the boundary at a shallow angle, beyond the critical angle, and is reflected again and again, following the fibre round bends for tens of kilometres. Pulses of infrared light in fibres carry almost all of the world's internet traffic, including the undersea cables between continents. Doctors' endoscopes use bundles of fibres to look inside the body.")}
      </p>
      <H3>{tx(t, "phOpt_dispTitle", "Dispersion and the rainbow")}</H3>
      <p>
        {tx(t, "phOpt_dispBody",
          "The refractive index depends slightly on the wavelength: in glass, violet light is slowed a little more than red, n ≈ 1.53 against 1.51. So a prism bends violet more than red and spreads white light into its colours, as Newton showed in 1666. A rainbow is the same thing inside raindrops: sunlight enters a drop, reflects once off the back, and comes out again. Rays leaving at about 42° from the direction straight away from the Sun bunch together, so every drop on a cone of 42° around the shadow of your head sends you bright light, red from the outside of the cone, at 42.4°, and violet from the inside, at 40.6°. Each observer sees their own rainbow, made by different drops.")}
      </p>

      <H2>{tx(t, "phOpt_lensTitle", "Lenses")}</H2>
      <p>
        {tx(t, "phOpt_lensBody",
          "A lens is a piece of glass with curved faces. A converging lens, thicker in the middle, bends parallel rays so that they meet at a point, the focal point, a distance f from the lens: the focal length. A diverging lens, thinner in the middle, spreads them as if they came from a focal point on the near side; its focal length counts as negative. For a thin lens, the rule that every ray obeys is simple: a ray crossing the lens at a height h above the axis has its slope changed by −h/f. Three rays from the tip of an object are easy to draw, and they find the image.")}
      </p>
      <Derivation t={t} label={tx(t, "phOpt_eqLens", "The thin-lens equation from two rays")}
        steps={[
          { tex: r`\frac{h_i}{h_o} = -\frac{d_i}{d_o}`, why: tx(t, "phOpt_le1", "the ray through the centre goes straight on: the object (height h_o at distance d_o) and the image (height h_i at distance d_i) make similar triangles; the minus sign says the image is upside down") },
          { tex: r`\frac{h_o}{f} = -\frac{h_i}{d_i - f}`, why: tx(t, "phOpt_le2", "the ray that leaves the object parallel to the axis crosses the lens at height h_o and then passes through the far focal point: two more similar triangles meeting at that point") },
          { tex: r`\frac{d_i}{d_o} = \frac{d_i - f}{f}`, why: tx(t, "phOpt_le3", "both equations give h_i/h_o; set them equal") },
          { tex: r`\green{\frac{1}{d_o} + \frac{1}{d_i} = \frac{1}{f}}, \qquad \green{m = \frac{h_i}{h_o} = -\frac{d_i}{d_o}}`, why: tx(t, "phOpt_le4", "multiply out, d_i f = d_o d_i − d_o f, and divide by d_o d_i f: the thin-lens equation, with the magnification m") },
        ]} />
      <LessonTable
        headers={[tx(t, "phOpt_tSign", "Quantity"), tx(t, "phOpt_tPos", "Positive"), tx(t, "phOpt_tNeg", "Negative")]}
        rows={[
          ["f", tx(t, "phOpt_sg1p", "converging lens (or concave mirror)"), tx(t, "phOpt_sg1n", "diverging lens (or convex mirror)")],
          ["d_i", tx(t, "phOpt_sg2p", "real image on the far side: light really meets there, a screen can catch it"), tx(t, "phOpt_sg2n", "virtual image on the object's side: the rays only seem to come from it")],
          ["m", tx(t, "phOpt_sg3p", "upright image"), tx(t, "phOpt_sg3n", "inverted image")],
        ]}
      />
      <LensFigure t={t} />
      <p>
        {tx(t, "phOpt_makerBody",
          "The focal length comes from the shape and the glass: for a thin lens with faces of radii R₁ and R₂, 1/f = (n − 1)(1/R₁ − 1/R₂), the lensmaker's equation. Opticians quote the power P = 1/f instead, in dioptres (D, 1 D = 1 m⁻¹), because the powers of thin lenses placed together simply add. Curved mirrors work the same way: a concave mirror of radius R has f = R/2 and obeys the same equation. Make-up and shaving mirrors are concave, to magnify; the wide-angle mirrors in shops and on cars are convex, giving small upright images of a wide view.")}
      </p>

      <H2>{tx(t, "phOpt_eyeTitle", "The eye and optical instruments")}</H2>
      <p>
        {tx(t, "phOpt_eyeBody",
          "The eye is a camera. The curved cornea does most of the bending and the lens behind it the fine adjustment, together about 60 D, forming a real, inverted image on the retina about 1.7 cm behind; the brain turns it the right way up. To focus on something near, muscles squeeze the lens to make it more curved: accommodation. A young eye can focus from infinity down to about 25 cm, which needs 1/0.25 = 4 D of extra power; with age the lens stiffens, and reading glasses add those dioptres back.")}
      </p>
      <LessonTable
        headers={[tx(t, "phOpt_tDev", "Device or problem"), tx(t, "phOpt_tHow", "How the optics work")]}
        rows={[
          [tx(t, "phOpt_d1", "short sight (myopia)"), tx(t, "phOpt_d1h", "the eye is too strong or too long, and distant objects focus in front of the retina; a diverging lens fixes it. Someone who sees sharply only up to 50 cm needs −1/0.5 = −2 D")],
          [tx(t, "phOpt_d2", "long sight (hyperopia)"), tx(t, "phOpt_d2h", "the eye is too weak, and near objects focus behind the retina; a converging lens adds the missing power")],
          [tx(t, "phOpt_d3", "magnifying glass"), tx(t, "phOpt_d3h", "an object just inside the focal point gives a large, upright virtual image; the angular magnification is about 25 cm / f")],
          [tx(t, "phOpt_d4", "camera"), tx(t, "phOpt_d4h", "a converging lens makes a real image on the sensor; focusing moves the lens so that d_i fits the object's distance")],
          [tx(t, "phOpt_d5", "telescope"), tx(t, "phOpt_d5h", "a long-focus objective makes a real image of a distant object, and a short-focus eyepiece magnifies it; the magnification is f_objective / f_eyepiece, for example 900 mm / 10 mm = 90×")],
          [tx(t, "phOpt_d6", "microscope"), tx(t, "phOpt_d6h", "a very short-focus objective makes a magnified real image of a tiny object near its focal point, and the eyepiece magnifies that again")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phOpt_limits", "Ray optics has limits. Light passing through an opening only a few wavelengths across, or the fine detail of an image near the limit of a lens, behaves like the wave it is: it spreads, and waves from different paths add or cancel. That is the next chapter, wave optics.")}
      </Callout>

      <H2>{tx(t, "phOpt_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phOpt_ex1", "1. Light from air hits water at 45°: sin θ₂ = (1.00 × sin 45°)/1.33 = 0.532, so θ₂ = 32°. Inside the water it travels at c/1.33 = 2.25 × 10⁸ m/s, and green light of 530 nm has a wavelength of 530/1.33 = 398 nm.")}</p>
      <p>{tx(t, "phOpt_ex2", "2. The critical angle for glass (n = 1.52) in water (n = 1.33): sin θc = 1.33/1.52 = 0.875, θc = 61°. Under water a glass prism traps light far less easily than in air, where θc = 41°.")}</p>
      <p>{tx(t, "phOpt_ex3", "3. An object 30 cm in front of a converging lens with f = 10 cm: 1/d_i = 1/10 − 1/30 = 2/30, so d_i = 15 cm, m = −15/30 = −0.5: a real image, inverted, half the size.")}</p>
      <p>{tx(t, "phOpt_ex4", "4. The same lens with the object at 5 cm: 1/d_i = 1/10 − 1/5 = −1/10, d_i = −10 cm, m = +2: a virtual, upright image twice the size, on the object's side. That is a magnifying glass.")}</p>
      <p>{tx(t, "phOpt_ex5", "5. A diverging lens with f = −20 cm and an object at 20 cm: 1/d_i = −1/20 − 1/20 = −1/10, d_i = −10 cm, m = +0.5: virtual, upright, half the size. A diverging lens always gives this kind of image.")}</p>

      <H2>{tx(t, "phOpt_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phOpt_tWrong", "Wrong"), tx(t, "phOpt_tRight", "Right"), tx(t, "phOpt_tWhy", "Why")]}
        rows={[
          [tx(t, "phOpt_m1w", "measuring angles from the surface"), tx(t, "phOpt_m1r", "from the normal"), tx(t, "phOpt_m1", "Snell's law and the law of reflection use the angle to the perpendicular")],
          [tx(t, "phOpt_m2w", "light bends towards the normal when it speeds up"), tx(t, "phOpt_m2r", "when it slows down"), tx(t, "phOpt_m2", "bigger n means smaller sin θ")],
          [tx(t, "phOpt_m3w", "the frequency changes in water"), tx(t, "phOpt_m3r", "the wavelength does"), tx(t, "phOpt_m3", "the source sets the frequency; v = fλ, so λ shrinks with v")],
          [tx(t, "phOpt_m4w", "total internal reflection going into glass"), tx(t, "phOpt_m4r", "only coming out of it"), tx(t, "phOpt_m4", "it needs n₁ > n₂")],
          [tx(t, "phOpt_m5w", "covering half a lens cuts off half the image"), tx(t, "phOpt_m5r", "the whole image stays, dimmer"), tx(t, "phOpt_m5", "every part of the lens receives light from every point of the object")],
          [tx(t, "phOpt_m6w", "a virtual image can be caught on a screen"), tx(t, "phOpt_m6r", "only a real image can"), tx(t, "phOpt_m6", "no light actually passes through a virtual image")],
        ]}
      />

      <KeyIdeas t={t} id="phOpt" items={[
        "Inside a material light travels at v = c/n; its frequency stays, its wavelength becomes λ/n.",
        "Reflection: equal angles from the normal. Refraction: n₁ sin θ₁ = n₂ sin θ₂, bending towards the normal in the slower material.",
        "Both laws follow from Fermat's principle: light takes the path of least time.",
        "From a slower into a faster material, beyond sin θc = n₂/n₁ all the light is reflected; fibres and diamonds rely on it.",
        "n depends on wavelength, so prisms and raindrops spread white light into colours; the rainbow sits 42° from the antisolar point.",
        "Thin lenses obey 1/d_o + 1/d_i = 1/f with m = −d_i/d_o; powers in dioptres (1/f) add, and glasses correct the eye's power.",
      ]} />
    </Article>
  );
}

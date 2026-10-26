"use client";

// GLSL track — "Derivatives & Anti-aliasing": 2×2 quads, dFdx/dFdy/fwidth,
// coverage from fwidth, thin lines and fading detail, the texture seam,
// normals from derivatives, and where derivatives are undefined.

import type { TrackTranslations } from "@/lib/tracks/types";
import { tx } from "@/lib/tracks/tx";
import { CodeBlock, Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { KeyIdeas, Goals } from "@/components/lesson/Prose";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { ShaderPlayground } from "@/components/lesson/glsl/ShaderPlayground";
import { PixelQuadFigure } from "@/components/lesson/glsl/PixelQuadFigure";
import { EdgeAAFigure } from "@/components/lesson/glsl/EdgeAAFigure";
import { DERIV_PRESETS } from "../presets/derivatives";

const r = String.raw;
const SEAM = DERIV_PRESETS.filter(p => p.id === "seam");
const FLAT = DERIV_PRESETS.filter(p => p.id === "flat-normals");

export function DerivativesContent({ t }: { t: TrackTranslations }) {
  return (
    <article className="space-y-5 text-[var(--text-muted)] leading-relaxed text-base">

      <p className="text-lg text-[var(--text-main)]">
        {tx(t, "glslDer_intro",
          "A fragment shader looks as if it ran alone, one pixel at a time, with no idea of its neighbours. It does not. The GPU runs pixels in groups of four, and a shader can ask how much any value changes from one pixel to the next. Those answers, the derivatives dFdx, dFdy and fwidth, are what makes edges smooth at every zoom, what lets texture() choose a mip level, and what turns a position into a normal."
        )}
      </p>

      <Goals t={t} id="glslDer" items={[
        "Say what dFdx and dFdy return, and where the numbers come from.",
        "Anti-alias any edge, line or pattern with fwidth, at any zoom.",
        "Fix the line that atan or fract leaves in a texture.",
        "Build a flat normal from the derivatives of a position.",
        "Recognise where derivatives are undefined, and what to use instead.",
      ]} />

      {/* ── quads ── */}
      <H2>{tx(t, "glslDer_quadTitle", "Pixels run in 2×2 quads")}</H2>
      <p>
        {tx(t, "glslDer_quadBody1",
          "The rasteriser does not hand pixels to the shader one by one. It hands them over in squares of 2 × 2, called quads, and the four pixels of a quad run the same instructions at the same time. At any line of the shader, a pixel can therefore see the value its neighbour in the quad has just computed for the same expression."
        )}
      </p>
      <p>
        {tx(t, "glslDer_quadBody2",
          "dFdx(v) is that value in the right-hand pixel minus the value in the left-hand pixel. dFdy(v) is the upper pixel minus the lower one, since y grows upwards in gl_FragCoord. Both pixels of a pair get the same answer. fwidth adds the two sizes together."
        )}
      </p>
      <Equation label={tx(t, "glslDer_eqLabel", "The three derivative functions")}
        where={[
          ["v", tx(t, "glslDer_wV", "any float or vector expression, evaluated in each pixel of the quad")],
          [r`v_{x+1}`, tx(t, "glslDer_wVx", "the same expression in the neighbouring pixel to the right")],
          [r`v_{y+1}`, tx(t, "glslDer_wVy", "the same expression in the pixel above")],
        ]}
        words={tx(t, "glslDer_eqWords", "How much v changes when you move one pixel right, one pixel up, and both changes added as sizes.")}
        note={tx(t, "glslDer_eqNote", "Written for the left (or lower) pixel of a pair. Its partner on the right (or above) gets the same number, so for that pixel it is its own value minus the one on its left (or below).")}
        glsl="float w = fwidth(v);   // = abs(dFdx(v)) + abs(dFdy(v))">
        {r`\begin{gathered}\operatorname{dFdx}(v) = v_{x+1} - v \qquad \operatorname{dFdy}(v) = v_{y+1} - v \\ \operatorname{fwidth}(v) = |\operatorname{dFdx}(v)| + |\operatorname{dFdy}(v)|\end{gathered}`}
      </Equation>
      <p>
        {tx(t, "glslDer_units",
          "The unit is always \"per pixel\". If v is a distance in metres, dFdx(v) is metres per pixel; if v is a uv coordinate, it is how much of the texture one pixel spans. For f = 0.1 · gl_FragCoord.x, dFdx(f) is 0.1 in every pixel and dFdy(f) is 0. Most of this chapter comes down to dividing by that number to measure something in pixels."
        )}
      </p>
      <PixelQuadFigure t={t} />
      <H3>{tx(t, "glslDer_fineTitle", "Fine and coarse")}</H3>
      <p>
        {tx(t, "glslDer_fineBody",
          "A quad has two rows, so there are two possible dFdx values in it, one per row. GLSL 4.50 lets you choose: dFdxFine uses the pixel's own row, dFdxCoarse may use one row for the whole quad, which is cheaper. Plain dFdx lets the driver pick, and GLSL ES and WebGL have only the plain versions. Either way, a derivative is a difference over one pixel, not an exact slope: where a value bends sharply, it is off by up to a pixel's worth."
        )}
      </p>
      <H3>{tx(t, "glslDer_helperTitle", "Helper pixels")}</H3>
      <p>
        {tx(t, "glslDer_helperBody",
          "A triangle's edge cuts through quads. The pixels of a cut quad that lie outside the triangle still run the shader, as helper invocations, only so that their neighbours have values to subtract. Their colour is thrown away (gl_HelperInvocation is true for them, from GLSL 4.50 and ES 3.10). This is why a mesh made of tiny triangles costs far more than its pixel count suggests: a triangle covering one pixel still runs four."
        )}
      </p>

      {/* ── anti-aliasing ── */}
      <H2>{tx(t, "glslDer_aaTitle", "Anti-aliasing with fwidth")}</H2>
      <p>
        {tx(t, "glslDer_aaBody1",
          "Shapes in shaders are usually decided by a signed distance d, negative inside, as in the Signed Distance Functions chapter. step(d, 0.0) asks the question once, at the pixel's centre, and answers all or nothing. A pixel half covered by the shape gets either full colour or none, and edges turn into stairs."
        )}
      </p>
      <p>
        {tx(t, "glslDer_aaBody2",
          "What the pixel should get is the fraction of it that the shape covers. Across one pixel, d changes by about fwidth(d), so d / fwidth(d) is the distance to the edge measured in pixels. That gives the coverage in four steps:"
        )}
      </p>
      <Derivation t={t} label={tx(t, "glslDer_covLabel", "Coverage from a distance")}
        where={[
          ["d", tx(t, "glslDer_cwD", "signed distance to the edge in scene units, negative inside")],
          ["w", tx(t, "glslDer_cwW", "how much d changes over one pixel: scene units per pixel")],
          [r`d_{px}`, tx(t, "glslDer_cwDp", "the same distance in pixels")],
          [r`\alpha`, tx(t, "glslDer_cwA", "the coverage: 1 fully inside, 0 fully outside")],
        ]}
        steps={[
          { full: true, tex: r`w = \operatorname{fwidth}(d)`, why: tx(t, "glslDer_c1", "The pixel's size, measured in the units of d.") },
          { full: true, tex: r`d_{px} = \frac{d}{w}`, why: tx(t, "glslDer_c2", "Dividing turns the distance into pixels: −1 means one pixel inside the edge.") },
          { full: true, tex: r`\alpha = 0.5 - d_{px}`, why: tx(t, "glslDer_c3", "A pixel centred exactly on the edge (d = 0) is half covered. Each pixel further in adds one whole pixel of coverage.") },
          { full: true, tex: r`\alpha = \operatorname{clamp}\!\left(0.5 - \frac{d}{\operatorname{fwidth}(d)},\ 0,\ 1\right)`, why: tx(t, "glslDer_c4", "Clamp, since a pixel cannot be more than fully covered or less than empty. The ramp is exactly one pixel wide at every zoom.") },
        ]}
      />
      <CodeBlock lang="glsl" filename="aa.glsl" t={t}>{`// Coverage of a filled shape: d < 0 inside
float fillAA(float d) {
    float w = fwidth(d);                  // scene units per pixel, here
    return clamp(0.5 - d / w, 0.0, 1.0);  // a one-pixel ramp centred on the edge
}

// Coverage of a line of half-width h, r = distance from its centre line.
// A line thinner than a pixel is drawn one pixel wide and dimmed instead,
// so it stays continuous and keeps the brightness it really has.
float lineAA(float r, float h) {
    float w = fwidth(r);
    float wide = max(2.0 * h, w);
    return clamp((0.5 * wide - abs(r)) / w + 0.5, 0.0, 1.0) * (2.0 * h / wide);
}

// Grid lines on a plane: past ~2 pixels per cell, fade to the average coverage
float gridAA(vec2 uv, float h) {
    vec2 g = abs(fract(uv + 0.5) - 0.5);                 // distance to the nearest line, per axis
    vec2 w = fwidth(uv);
    float cx = mix(lineAA(g.x, h), 2.0 * h, smoothstep(0.3, 0.7, w.x));
    float cy = mix(lineAA(g.y, h), 2.0 * h, smoothstep(0.3, 0.7, w.y));
    return 1.0 - (1.0 - cx) * (1.0 - cy);                // either line covers the pixel
}`}</CodeBlock>
      <EdgeAAFigure t={t} />
      <H3>{tx(t, "glslDer_smallTitle", "Detail smaller than a pixel")}</H3>
      <p>
        {tx(t, "glslDer_smallBody1",
          "The one-pixel ramp fixes edges, but two kinds of detail need more. A line thinner than a pixel never covers a pixel's centre fully, so the plain ramp draws it as a broken row of dashes that flicker when it moves. lineAA above draws it one pixel wide and multiplies by its real width in pixels, 2h / w: a line a quarter of a pixel wide becomes a full-width line at a quarter of the brightness, which is what the eye sees from a real thin line."
        )}
      </p>
      <p>
        {tx(t, "glslDer_smallBody2",
          "A pattern that repeats faster than every two pixels cannot be shown at all. One sample per pixel cannot tell a stripe pattern of period 1.5 pixels from a much wider one, and the screen shows the wider one, a moiré that is not in the scene. The only honest picture is the pattern's average colour. fwidth of the pattern's coordinate says how many periods fit in a pixel, and the shader fades to the average as that number nears one half. Mipmaps do the same thing for textures, which is why textures need no such code."
        )}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "glslDer_lenNote",
          "fwidth adds |dFdx| and |dFdy|. For an edge at 45° that is about 1.41 times the true change per pixel, so diagonal edges come out a little softer than straight ones. length(vec2(dFdx(d), dFdy(d))) is exact and costs a square root. And when you already know how many scene units one pixel spans (a 2D scene with a fixed zoom), pass that number as a uniform and skip the derivatives."
        )}
      </Callout>

      {/* ── textures ── */}
      <H2>{tx(t, "glslDer_texTitle", "texture() uses them too")}</H2>
      <p>
        {tx(t, "glslDer_texBody1",
          "texture(s, uv) takes the derivatives of uv itself. Multiplied by the texture's size, they say how many texels one pixel spans, and the base-2 log of that is the mip level. One texel per pixel reads level 0; four texels per pixel reads level 2. The Mipmapping chapter of the OpenGL track works through the formula with live numbers."
        )}
      </p>
      <p>
        {tx(t, "glslDer_texBody2",
          "That is fine as long as uv is smooth. Polar coordinates are not: atan returns −π on one side of the negative x axis and +π on the other, so u jumps by a whole turn between two neighbouring pixels. Inside that quad the derivative is huge, texture() concludes that the pixel spans the whole texture, and reads the smallest mip level, a single average colour. The result is a thin seam one pixel wide. Tiling with fract(uv * 4.0) inside a texture atlas makes the same seam at every tile border."
        )}
      </p>
      <ShaderPlayground presets={SEAM} t={t} id="glslDer" />
      <p>
        {tx(t, "glslDer_seamFix",
          "The fix is to keep the coordinate but give the texture the derivatives it should have had. textureGrad(s, uv, dx, dy) takes them as arguments. For a tiled atlas, they are simply the derivatives of the coordinate before fract. For polar coordinates, compute them for two copies of the angle whose jumps are on opposite sides, and use whichever is smaller: at any pixel, at least one of the two is smooth."
        )}
      </p>
      <CodeBlock lang="glsl" filename="atlas_tile.frag" t={t}>{`vec2 tiled = uv * 4.0;                  // smooth: no jumps
vec2 inTile = fract(tiled);             // jumps from 1 back to 0 at every tile border
vec2 atlasUV = uTileOrigin + inTile * uTileSize;

// texture(uAtlas, atlasUV) would see the jump and draw a seam.
// The derivatives of the smooth coordinate, scaled like atlasUV, are the right ones:
vec4 c = textureGrad(uAtlas, atlasUV, dFdx(tiled) * uTileSize, dFdy(tiled) * uTileSize);`}</CodeBlock>

      {/* ── normals ── */}
      <H2>{tx(t, "glslDer_normTitle", "Normals from derivatives")}</H2>
      <p>
        {tx(t, "glslDer_normBody",
          "Apply dFdx and dFdy to the world position of the surface. dFdx(vWorld) is the step along the surface from one pixel to the next one on the right, and dFdy(vWorld) the step to the pixel above. Both lie in the surface, so their cross product is perpendicular to it: a normal. Inside one triangle the position changes linearly, so this normal is constant per triangle, the faceted look of flat shading, with no extra vertices. It is also always true to the geometry actually drawn, even after a vertex shader has moved the vertices and left the stored normals behind."
        )}
      </p>
      <Equation label={tx(t, "glslDer_nLabel", "A flat normal from the screen-space derivatives")}
        where={[
          [r`\mathbf{p}`, tx(t, "glslDer_nwP", "the fragment's world position, vWorld")],
          [r`\mathbf{n}`, tx(t, "glslDer_nwN", "the unit normal of the triangle under the pixel")],
        ]}
        note={tx(t, "glslDer_nNote", "With y up, as in OpenGL, the result points towards the camera. In Vulkan the framebuffer's y points down, dFdy goes down the screen, and the cross product must be swapped (or negated).")}
        glsl="vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));">
        {r`\mathbf{n} = \frac{\operatorname{dFdx}(\mathbf{p}) \times \operatorname{dFdy}(\mathbf{p})}{\lVert \operatorname{dFdx}(\mathbf{p}) \times \operatorname{dFdy}(\mathbf{p}) \rVert}`}
      </Equation>
      <ShaderPlayground presets={FLAT} t={t} id="glslDer" />

      {/* ── limits ── */}
      <H2>{tx(t, "glslDer_limitTitle", "Where derivatives break")}</H2>
      <p>
        {tx(t, "glslDer_branchBody",
          "A derivative needs the neighbour to have computed the same expression. Inside an if, a loop or a function call whose condition differs between the pixels of a quad (non-uniform control flow), some neighbours skipped that code, and the specification calls the result undefined. That includes the hidden derivatives in texture() and fwidth. Many GPUs happen to give a sensible answer anyway, so the bug shows up only on some hardware, as blocky blurring or seams along the branch's border."
        )}
      </p>
      <CodeBlock lang="glsl" filename="branch.frag" t={t}>{`// Undefined: texture() needs derivatives, and only some pixels of a quad get here
if (noise(vWorld.xz) > 0.5) {
    col = texture(uMoss, vUV).rgb;
}

// Defined: take the derivatives (or the sample) before the branch
vec2 dx = dFdx(vUV), dy = dFdy(vUV);
if (noise(vWorld.xz) > 0.5) {
    col = textureGrad(uMoss, vUV, dx, dy).rgb;   // or textureLod with a level you chose
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "glslDer_lH0", "Situation"), tx(t, "glslDer_lH1", "What happens"), tx(t, "glslDer_lH2", "What to do")]}
        rows={[
          [tx(t, "glslDer_l1", "vertex, geometry or compute shader"), tx(t, "glslDer_l1b", "there are no quads: dFdx does not exist, and texture() in a vertex shader reads level 0"), tx(t, "glslDer_l1c", "textureLod with an explicit level")],
          [tx(t, "glslDer_l2", "inside a branch that differs within a quad"), tx(t, "glslDer_l2b", "undefined"), tx(t, "glslDer_l2c", "compute derivatives before the branch; textureGrad or textureLod inside")],
          [tx(t, "glslDer_l3", "a value that jumps (atan, fract, a hash per cell)"), tx(t, "glslDer_l3b", "a huge derivative at the jump: seams, or a one-pixel edge in the AA"), tx(t, "glslDer_l3c", "take derivatives of a smooth version of the value")],
          [tx(t, "glslDer_l4", "large values, such as world positions far from the origin"), tx(t, "glslDer_l4b", "the difference of two nearly equal big floats has few correct digits, and the normals become noisy"), tx(t, "glslDer_l4c", "work relative to the camera or to the object")],
        ]}
      />

      <H2>{tx(t, "glslDer_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "glslDer_xH0", "Symptom"), tx(t, "glslDer_xH1", "Cause"), tx(t, "glslDer_xH2", "Fix")]}
        rows={[
          [tx(t, "glslDer_x1a", "edges sharp when zoomed out, blurry when zoomed in"), tx(t, "glslDer_x1b", "a smoothstep of fixed width"), tx(t, "glslDer_x1c", "make the width fwidth(d)")],
          [tx(t, "glslDer_x2a", "a one-pixel line along a seam in a texture"), tx(t, "glslDer_x2b", "the coordinate jumps inside a quad and picks the smallest mip"), tx(t, "glslDer_x2c", "textureGrad with derivatives of the smooth coordinate")],
          [tx(t, "glslDer_x3a", "thin lines break into flickering dashes"), tx(t, "glslDer_x3b", "lines thinner than a pixel cut with a one-pixel ramp"), tx(t, "glslDer_x3c", "draw at least one pixel wide and dim by the real width")],
          [tx(t, "glslDer_x4a", "the far floor shows curved bands that are not in the scene"), tx(t, "glslDer_x4b", "a pattern finer than two pixels per period (moiré)"), tx(t, "glslDer_x4c", "fade to the average where fwidth of the coordinate nears ½")],
          [tx(t, "glslDer_x5a", "a flat normal points into the surface"), tx(t, "glslDer_x5b", "y points down (Vulkan, or a flipped render target)"), tx(t, "glslDer_x5c", "swap the cross product's order")],
          [tx(t, "glslDer_x6a", "dFdx is 0 or garbage in some pixels only"), tx(t, "glslDer_x6b", "it was called inside a branch that differs within the quad"), tx(t, "glslDer_x6c", "move it before the branch")],
        ]}
      />

      <KeyIdeas t={t} id="glslDer" items={[
        "Pixels run in 2×2 quads; dFdx and dFdy are the differences between neighbours in a quad, in units per pixel.",
        "clamp(0.5 − d / fwidth(d), 0, 1) turns any signed distance into a one-pixel anti-aliased edge, at every zoom.",
        "Detail smaller than a pixel must be dimmed (thin lines) or replaced by its average (fine patterns), never sampled raw.",
        "texture() picks its mip level from the derivatives of uv; a coordinate that jumps leaves a seam, fixed with textureGrad.",
        "cross(dFdx(p), dFdy(p)) is the true flat normal of whatever was drawn.",
        "Derivatives are undefined inside branches that differ within a quad, and do not exist outside fragment shaders.",
      ]} />

      <Related t={t} links={[
        { track: "GLSL", id: "sdf", title: tx(t, "glslDer_rel1", "Signed Distance Functions"), why: tx(t, "glslDer_rel1b", "the distances this chapter turns into smooth edges.") },
        { track: "OpenGL", id: "texture-compression", title: tx(t, "glslDer_rel2", "Mipmapping & Texture Compression"), why: tx(t, "glslDer_rel2b", "the mip level formula, trilinear and anisotropic filtering.") },
        { track: "OpenGL", id: "anti-aliasing", title: tx(t, "glslDer_rel3", "Anti-Aliasing"), why: tx(t, "glslDer_rel3b", "MSAA, FXAA and SMAA: anti-aliasing for the whole frame, not one shader.") },
        { track: "GLSL", id: "noise", title: tx(t, "glslDer_rel4", "Noise & Procedural Patterns"), why: tx(t, "glslDer_rel4b", "fading noise octaves that are too fine to show, with fwidth.") },
      ]} />
    </article>
  );
}

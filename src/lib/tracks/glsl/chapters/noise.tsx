"use client";

// GLSL track — "Noise & Procedural Patterns" (rewritten 2026-10-25).
// The GPU side of noise; the CPU derivation of Perlin noise lives in Game Dev →
// Perlin Noise, and Voronoi border distances in Effects → Cracks & Shattering.
// Order: what a shader needs from noise; hashes on the GPU (the sin hash taken
// apart in float32, its precision limit, pcg2d, the hash playground); value
// noise + the fade curves; gradient noise; simplex; Worley (WorleyFigure);
// fBm (octave budget, variants, anti-aliased octaves); domain warping; moving,
// tiling and textures; the main playground; mistakes; exercises.

import type { TrackTranslations } from "@/lib/tracks/types";
import { tx } from "@/lib/tracks/tx";
import { CodeBlock, Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { Article, Goals, KeyIdeas, Lead } from "@/components/lesson/Prose";
import { Related } from "@/components/lesson/Related";
import { ShaderPlayground } from "@/components/lesson/glsl/ShaderPlayground";
import { Noise1DFigure } from "@/components/lesson/glsl/Noise1DFigure";
import { WorleyFigure } from "@/components/lesson/glsl/WorleyFigure";
import { HASH_PRESET, NOISE_PRESETS } from "../presets/noise";
import { fadeNumbers, hashNumbers, octaveNumbers } from "../live/noise";

const r = String.raw;

export function NoiseContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glsl05_intro2",
          "Clouds, marble, terrain, rust, fire, water ripples: almost every natural-looking surface in a shader starts as noise, a function that looks random but is smooth and gives the same answer every time it is asked about the same point. GLSL has no usable noise function of its own. The old noise1() to noise4() were never implemented by most drivers (they returned 0), were deprecated in GLSL 4.40, and do not exist in the GLSL ES of WebGL. So every shader writes its own, from three parts: a hash, a value or gradient stored on a grid, and a curve that blends between grid points. This chapter builds each part for the GPU, where 32-bit floats, millions of pixels per frame and no memory between pixels change what works.")}
      </Lead>

      <Goals t={t} id="glsl05" items={[
        "Write a hash, and say why the classic sin hash breaks far from the origin.",
        "Build value and gradient noise from a hash and a fade curve.",
        "Compute Worley (cellular) noise with a 3 × 3 search, and use F1, F2 and the cell id.",
        "Sum octaves into fBm without aliasing, and bend it with domain warping.",
        "Make noise move, tile, and run fast enough for a full screen.",
      ]} />

      <H2>{tx(t, "glsl05_needTitle", "What a shader needs from noise")}</H2>
      <p>
        {tx(t, "glsl05_needBody",
          "A fragment shader runs once per pixel with no memory of the other pixels, so noise must be a pure function of position: n(p) computed from p alone. Five properties make it useful:")}
      </p>
      <LessonTable
        headers={[tx(t, "glsl05_thProp", "Property"), tx(t, "glsl05_thWhy", "Why it matters")]}
        rows={[
          [tx(t, "glsl05_n1", "repeatable"), tx(t, "glsl05_n1b", "the same p always gives the same value, in every frame and on every pixel that asks: the texture does not boil")],
          [tx(t, "glsl05_n2", "smooth"), tx(t, "glsl05_n2b", "nearby points have nearby values, so it reads as a surface, not as TV static")],
          [tx(t, "glsl05_n3", "one feature size"), tx(t, "glsl05_n3b", "bumps about one grid cell across, so scaling p sets their size and octaves can be stacked")],
          [tx(t, "glsl05_n4", "no visible grid"), tx(t, "glsl05_n4b", "the lattice it is built on should not show as rows, columns or blocks")],
          [tx(t, "glsl05_n5", "cheap"), tx(t, "glsl05_n5b", "a 1920 × 1080 screen is 2 million pixels; eight octaves of noise is 16 million evaluations per frame")],
        ]}
      />
      <p>
        {tx(t, "glsl05_needLink",
          "The theory of gradient noise, step by step on the CPU, with the derivation of the fade curve, is in the Game Dev track's Perlin noise chapter. Here the same ideas are written for the GPU.")}
      </p>

      <HashSection t={t} />
      <LatticeSection t={t} />
      <WorleySection t={t} />
      <FbmSection t={t} />
      <WarpSection t={t} />
      <PracticeSection t={t} />

      <KeyIdeas t={t} id="glsl05" items={[
        "Lattice noise = a hash at integer points + a value or gradient stored there + a fade curve between them.",
        "The sin hash is a quick trick: in 32-bit floats it has only about 8 bits of randomness and breaks far from the origin; pcg2d on uint coordinates does not.",
        "The fade curve sets how smooth the joins are: smoothstep has continuous slope, the quintic 6f⁵ − 15f⁴ + 10f³ also continuous curvature, which normals need.",
        "Gradient (Perlin) noise is 0 on every lattice point, so its features fall between them and the grid hides; simplex does the same on triangles, with fewer corners.",
        "Worley noise is the distance to the nearest random point in the 3 × 3 cells around: F1 gives cells, F2 − F1 borders, the cell id flat colours.",
        "fBm adds octaves, ×lacunarity in frequency and ×gain in amplitude; rotate each octave and stop adding them before they are smaller than two pixels.",
        "Domain warping, f(p + k·q(p)), feeds noise into the coordinates of noise: marble, smoke, gas giants.",
        "Animate by scrolling or with a third dimension, tile by wrapping the lattice index, and bake to a texture when the cost matters.",
      ]} />
    </Article>
  );
}

// ── Hashes on the GPU ─────────────────────────────────────────────────────────

function HashSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glsl05_hashTitle", "Hash function")}</H2>
      <p>
        {tx(t, "glsl05_hashBody2",
          "A hash turns a coordinate into a number that looks random: similar inputs, unrelated outputs. It is not a random number generator, which keeps a state and gives a new number each call; a hash has no state, so hash(3, 7) is the same in every pixel and every frame. The one in most shader tutorials is a single line:")}
      </p>
      <CodeBlock lang="glsl" filename="hash.glsl" t={t}>{`// Pseudo-random float in [0, 1) from a vec2 seed
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// 2D version: a pseudo-random vec2, one hash per component
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));       // different constants: unrelated x and y
    return fract(sin(p) * 43758.5453);
}

// Usage: one random grey per cell of a 10 × 10 grid (white noise, no smoothness)
float n = hash(floor(uv * 10.0));`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "glsl05_thStep", "Step"), tx(t, "glsl05_thDoes", "What it does")]}
        rows={[
          ["dot(p, vec2(127.1, 311.7))", tx(t, "glsl05_h1", "folds the two coordinates into one number. The constants are arbitrary but not round, so that (1, 0) and (0, 1) land far apart and no simple pattern of cells gives equal sums.")],
          ["sin(…)", tx(t, "glsl05_h2", "a smooth wave of that number, between −1 and 1. On its own it would still be smooth: neighbouring cells, neighbouring values.")],
          ["× 43758.5453", tx(t, "glsl05_h3", "stretches the wave enormously, so a change of 0.0001 in sin moves the product by about 4: the digits after the point no longer follow the input in any visible way.")],
          ["fract(…)", tx(t, "glsl05_h4", "keeps only those digits after the point, a number in [0, 1). fract(x) = x − floor(x), so negative products give positive results too.")],
        ]}
      />
      <LiveFormula label={tx(t, "glsl05_liveHash", "Try it: the sin hash in 32-bit floats")}
        tex={r`\text{hash}(x, y) = \operatorname{fract}\big(43758.5453 \cdot \sin(127.1\,x + 311.7\,y)\big)`}
        vars={[
          { id: "x", label: "x", min: 0, max: 10, step: 0.01, value: 3, fmt: v => v.toFixed(2) },
          { id: "y", label: "y", min: 0, max: 10, step: 1, value: 2, fmt: v => v.toFixed(0) },
        ]}
        compute={hashNumbers()}
        note={tx(t, "glsl05_liveHashNote", "Every step here is rounded to a 32-bit float, as on the GPU. Move x by 0.01 and the result jumps to an unrelated value. Now look at the last digits: once the product is above 32 768, a float can only hold it in steps of 1/256, so the result is always a multiple of 0.00390625. Most of the time this hash has only 8 or 9 bits of randomness, enough for grain and sparkles but visibly banded in a smooth gradient. Real GPUs also compute sin() slightly differently from each other, so the same shader gives different patterns on different cards.")} />

      <H3>{tx(t, "glsl05_farTitle", "Far from the origin")}</H3>
      <p>
        {tx(t, "glsl05_farBody",
          "The sin hash gets worse as the coordinates grow. A float has 24 bits of precision: at 1 000 000 the gap between neighbouring floats is 0.0625, and dot(p, k) for a cell 10⁶ away from the origin is about 4 × 10⁸, where the gap is 32. Different cells round to the same d, sin is fed numbers that have lost their fractional part, and the hash starts to repeat in stripes. That happens when a world is large, when a coordinate is scrolled by the time and the game runs for hours, or on a phone whose sin() is computed with fewer bits. Integer hashes do not have the problem: they work on uint values, where every bit is used and nothing is rounded.")}
      </p>
      <CodeBlock lang="glsl" filename="pcg2d.glsl" t={t}>{`// Jarzynski & Olano, "Hash Functions for GPU Rendering" (JCGT, 2020)
uvec2 pcg2d(uvec2 v) {
    v = v * 1664525u + 1013904223u;          // one step of a linear congruential generator
    v.x += v.y * 1664525u;                    // mix y into x…
    v.y += v.x * 1664525u;                    // …and x into y
    v ^= v >> 16u;                            // fold the well-mixed high bits into the low ones
    v.x += v.y * 1664525u;                    // a second round
    v.y += v.x * 1664525u;
    v ^= v >> 16u;
    return v;
}

// To a float in [0, 1): 2^-32 maps the full uint range onto it
float hash(vec2 p) {
    return float(pcg2d(uvec2(ivec2(floor(p)))).x) * (1.0 / 4294967296.0);
}`}</CodeBlock>
      <p>
        {tx(t, "glsl05_pcgBody",
          "1664525 and 1013904223 are the multiplier and increment of a classic linear congruential generator (they are in Numerical Recipes). uint arithmetic wraps around at 2³², which is the modulo the generator needs, for free. One round mixes poorly, so the two coordinates are added into each other twice and the high bits, which change the most, are shifted down. The cost is a few integer multiplies, similar to the sin version, and the paper above measured it among the best quality-per-cost hashes for GPUs. ivec2(floor(p)) first turns the cell coordinate into an integer; negative cells wrap to large uints, which is fine for a hash.")}
      </p>
      <ShaderPlayground presets={[HASH_PRESET]} t={t} id="glsl05Hash" editorOpen={false} />
      <Callout type="warn" t={t}>
        {tx(t, "glsl05_hashWarn2", "Use the sin hash for quick effects close to the origin, and an integer hash (pcg2d, or pcg3d for 3D) for anything large, long-running or shipped to phones. In GLSL ES, also make sure the hash runs in highp: in mediump a float has only 10 bits of mantissa and the sin hash collapses into a few flat values.")}
      </Callout>
    </>
  );
}

// ── Value, gradient and simplex noise ─────────────────────────────────────────

function LatticeSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glsl05_valueNoiseTitle", "Value noise")}</H2>
      <p>
        {tx(t, "glsl05_valueNoiseBody2",
          "White noise has no smoothness because every cell is unrelated to the next. Value noise keeps the random values on the corners of the grid and blends between them inside each cell, the same way bilinear filtering blends four texels:")}
      </p>
      <CodeBlock lang="glsl" filename="value_noise.glsl" t={t}>{`float noise(vec2 p) {
    vec2 i = floor(p);      // which cell: its bottom-left corner
    vec2 f = fract(p);      // where inside the cell, 0..1 on each axis

    // The fade curve: smoothstep's 3f² − 2f³
    vec2 u = f * f * (3.0 - 2.0 * f);

    // A random value at each corner of the cell
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    // Blend the bottom pair and the top pair across x, then those two across y
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Usage: about 4 bumps across the screen
float n = noise(uv * 4.0);`}</CodeBlock>
      <p>
        {tx(t, "glsl05_valueWhy",
          "Two pixels in the same cell share the same four corners, so their values differ only through f, which changes smoothly. A pixel on the border of two cells sees the same two corners from both sides, so the value is continuous across it. Everything depends on the curve u(f): with u = f the blend is plain bilinear and every grid line shows as a crease, because the slope jumps there. The figure shows the three usual curves in one dimension.")}
      </p>
      <Noise1DFigure t={t} />
      <LiveFormula label={tx(t, "glsl05_liveFade", "Try it: the three fade curves at one point")}
        tex={r`\text{smoothstep: } u = 3f^2 - 2f^3, \qquad \text{quintic: } u = 6f^5 - 15f^4 + 10f^3`}
        vars={[{ id: "f", label: "f", min: 0, max: 1, step: 0.01, value: 0, fmt: v => v.toFixed(2) }]}
        compute={fadeNumbers()}
        where={[
          ["f", tx(t, "glsl05_wF", "the position inside the cell along one axis, from 0 (one corner) to 1 (the next)")],
          ["u", tx(t, "glsl05_wUu", "the blend weight given to the next corner")],
          ["u', u''", tx(t, "glsl05_wDer", "the slope and the curvature of the curve: how fast the weight changes, and how fast that changes")],
        ]}
        note={tx(t, "glsl05_liveFadeNote", "At f = 0 and f = 1 both curves have zero slope, so cells meet without a crease. Smoothstep's curvature is 6 at f = 0 and −6 at f = 1, so where two cells meet it jumps from −6 to 6. The value looks smooth, but a normal computed from it (bump mapping, terrain lighting) depends on the slope, whose rate of change jumps: the grid shows up again in the shading. The quintic curve has zero curvature at both ends, which is why Perlin switched to it in 2002.")} />

      <H2>{tx(t, "glsl05_gradTitle", "Gradient noise")}</H2>
      <p>
        {tx(t, "glsl05_gradBody",
          "Value noise still looks blocky, because its hills and valleys sit on the lattice points, in rows and columns. Ken Perlin's gradient noise stores a random direction at each corner instead of a value. Each corner contributes a tilted plane, the dot product of its gradient with the vector from the corner to the pixel, and the four planes are blended with the quintic fade:")}
      </p>
      <CodeBlock lang="glsl" filename="gradient_noise.glsl" t={t}>{`vec2 grad(vec2 i) {                               // a random direction per corner
    return normalize(hash2(i) * 2.0 - 1.0);
}

float gradientNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);   // quintic fade

    float a = dot(grad(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));   // corner's plane at the pixel
    float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);      // in about [-0.71, 0.71]
}`}</CodeBlock>
      <Equation label={tx(t, "glsl05_gradLabel", "Gradient noise in 2D (Perlin)")}
        where={[
          [r`\mathbf i,\ \mathbf f`, tx(t, "glsl05_wIF", "integer cell and fractional position inside it")],
          [r`\mathbf g(\cdot)`, tx(t, "glsl05_wG", "random unit gradient at a lattice corner (from a hash)")],
          [r`u = 6f^5 - 15f^4 + 10f^3`, tx(t, "glsl05_wU", "the quintic fade, per axis")],
          [r`n_0,\ n_1`, tx(t, "glsl05_wN01", "the blends along the bottom and the top edge of the cell")],
        ]}
        words={tx(t, "glsl05_gradWords", "Each corner votes with how far the pixel lies in the direction of that corner's arrow; the four votes are blended by the fade weights, first along x, then along y.")}
        note={tx(t, "glsl05_gradNote", "Each corner contributes a plane (gradient · offset) that is zero at the corner itself; the fade blends the four. Because the value at every lattice point is 0, peaks fall between the points and the grid is far less visible than with value noise.")}>
        {r`\begin{gathered} n(\mathbf p) = \operatorname{mix}(n_0,\ n_1,\ u_y) \\ n_0 = \operatorname{mix}\big(\mathbf g_{00}\cdot\mathbf f,\ \mathbf g_{10}\cdot(\mathbf f - (1,0)),\ u_x\big) \\ n_1 = \operatorname{mix}\big(\mathbf g_{01}\cdot(\mathbf f - (0,1)),\ \mathbf g_{11}\cdot(\mathbf f - (1,1)),\ u_x\big) \end{gathered}`}
      </Equation>
      <p>
        {tx(t, "glsl05_gradRange",
          "With unit gradients the 2D result stays within ±√2/2 ≈ ±0.71 (in n dimensions, ±√n/2), so multiply by about 1.4 to use the full range from −1 to 1, and add 0.5 after halving if you need it in [0, 1]. Without the normalize() the gradients are spread over a square instead of a circle: a little cheaper, slightly more uneven, and the range grows. Value noise lies in [0, 1] and gradient noise is centred on 0, so the two are not interchangeable without rescaling.")}
      </p>

      <H3>{tx(t, "glsl05_simplexTitle", "Simplex noise")}</H3>
      <p>
        {tx(t, "glsl05_simplexBody",
          "A square cell has 4 corners in 2D, 8 in 3D and 16 in 4D: gradient noise doubles in cost with every dimension, and the square grid leaves faint horizontal and vertical streaks. Perlin's simplex noise (2001) uses triangles instead, the simplest shape that tiles the plane (tetrahedra in 3D), so a point has only n + 1 corners. To find the triangle, the plane is skewed so that the triangles become half-squares, the ordinary floor() finds the cell, and comparing x with y tells which half:")}
      </p>
      <Equation label={tx(t, "glsl05_skewLabel", "Skewing to the triangle grid and back (2D)")}
        where={[
          [r`K_1`, tx(t, "glsl05_wK1", "the skew factor: squares to rhombi made of two equilateral triangles")],
          [r`K_2`, tx(t, "glsl05_wK2", "the unskew factor, to measure the distance from a corner in the real plane")],
          [r`\mathbf i`, tx(t, "glsl05_wI", "the skewed cell: its corner is a corner of the pixel's triangle")],
          [r`\mathbf a`, tx(t, "glsl05_wA", "the vector from that corner to the pixel, back in the real plane")],
        ]}
        words={tx(t, "glsl05_skewWords", "Push every point along the diagonal by K₁ times the sum of its coordinates, take the floor to find the cell, then pull the cell's corner back by K₂ times its sum to measure from it in ordinary coordinates.")}>
        {r`\begin{gathered} K_1 = \frac{\sqrt3 - 1}{2} \approx 0.366, \qquad K_2 = \frac{3 - \sqrt3}{6} \approx 0.211 \\[4pt] \mathbf i = \lfloor \mathbf p + (p_x + p_y)K_1 \rfloor, \qquad \mathbf a = \mathbf p - \mathbf i + (i_x + i_y)K_2 \end{gathered}`}
      </Equation>
      <CodeBlock lang="glsl" filename="simplex.glsl" t={t}>{`float simplexNoise(vec2 p) {
    const float K1 = 0.366025404;                   // (sqrt(3) - 1) / 2
    const float K2 = 0.211324865;                   // (3 - sqrt(3)) / 6
    vec2 i = floor(p + (p.x + p.y) * K1);           // skewed cell
    vec2 a = p - i + (i.x + i.y) * K2;              // from the first corner
    float m = step(a.y, a.x);                       // 1 in the lower triangle, 0 in the upper
    vec2 o = vec2(m, 1.0 - m);                      // the middle corner: (1,0) or (0,1)
    vec2 b = a - o + K2;                            // from the middle corner
    vec2 c = a - 1.0 + 2.0 * K2;                    // from the far corner
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);   // radial falloff, 0 beyond r² = 0.5
    vec3 n = h * h * h * h * vec3(dot(a, grad(i)), dot(b, grad(i + o)), dot(c, grad(i + 1.0)));
    return dot(n, vec3(70.0));                      // scaled to about [-1, 1]
}`}</CodeBlock>
      <p>
        {tx(t, "glsl05_simplexAfter",
          "Instead of blending the corners with mix(), each corner's plane is multiplied by a bump (0.5 − r²)⁴ that is 1 at the corner and fades to exactly 0 at a distance of √0.5 ≈ 0.71. The three bumps are simply added. 70 is the factor that brings the largest possible sum to about 1. The 3D version was patented until January 2022, which is why OpenSimplex exists; both are free to use now.")}
      </p>
    </>
  );
}

// ── Worley (cellular) noise ───────────────────────────────────────────────────

function WorleySection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glsl05_worleyTitle", "Worley (cellular) noise")}</H2>
      <p>
        {tx(t, "glsl05_worleyBody",
          "Steven Worley's noise (1996) is built on points instead of a smooth blend. Scatter one random feature point in every grid cell, and for each pixel measure the distance to the nearest one. Near a point the value is 0, it grows towards the edges of the point's region, and the regions are Voronoi cells: stones, scales, cells under a microscope, the caustics on a pool floor. In a shader the scattering is free, because the hash gives each cell its point, and only the neighbouring cells need to be checked:")}
      </p>
      <CodeBlock lang="glsl" filename="worley.glsl" t={t}>{`// Returns (F1, F2): distances to the nearest and second-nearest feature points
vec2 worley(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float f1 = 8.0, f2 = 8.0;
    for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));        // the neighbouring cell
        vec2 o = hash2(i + g);                    // its feature point, 0..1 inside it
        float d = length(g + o - f);              // pixel → point
        if (d < f1) { f2 = f1; f1 = d; }          // new nearest: the old one becomes second
        else if (d < f2) { f2 = d; }
    }
    return vec2(f1, f2);
}`}</CodeBlock>
      <WorleyFigure t={t} />
      <LessonTable
        headers={[tx(t, "glsl05_thUse", "Use"), tx(t, "glsl05_thGives", "Gives"), tx(t, "glsl05_thFor", "Good for")]}
        rows={[
          ["F1", tx(t, "glsl05_w1", "round cells, dark at the centre"), tx(t, "glsl05_w1b", "bubbles, organic cells, the bright web of caustics (1 − F1)")],
          ["F2", tx(t, "glsl05_w2", "puffier, overlapping shapes"), tx(t, "glsl05_w2b", "mixed with F1 for variety")],
          ["F2 − F1", tx(t, "glsl05_w3", "0 on the borders between cells"), tx(t, "glsl05_w3b", "stones and grout, scales, cracked mud, crackle glaze")],
          [tx(t, "glsl05_w4k", "cell id"), tx(t, "glsl05_w4", "the same number on the whole cell"), tx(t, "glsl05_w4b", "a colour, height or rotation per stone or tile")],
        ]}
      />
      <p>
        {tx(t, "glsl05_worleyLimits",
          "The 3 × 3 search finds the nearest point in practice, but not always: a pixel in a corner of its cell whose own point sits in the opposite corner can be nearer to a point two cells away. The miss shows as a rare small seam. Scaling the hashed offset towards the middle of the cell (the figure's jitter) makes it rarer, and impossible once every point stays in the middle half of its cell (jitter ≤ 0.5); a 5 × 5 search is exact for F1 and F2 at almost three times the cost. F2 − F1 is not a true distance to the border either, so its lines change width near the corners of cells. The Cracks & Shattering chapter computes the exact distance to a Voronoi border, which is what cracks of constant width need.")}
      </p>
    </>
  );
}

// ── Fractal Brownian motion ───────────────────────────────────────────────────

function FbmSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glsl05_fbmTitle", "Fractal Brownian Motion (fBm)")}</H2>
      <p>
        {tx(t, "glsl05_fbmBody2",
          "One layer of noise has bumps of a single size, which looks like soft hills and nothing else. Nature has detail at every scale: a mountain has ridges, the ridges have rocks, the rocks have cracks. fBm adds copies of the same noise, each with twice the frequency and half the amplitude of the one before. Each copy is called an octave, after the musical interval that doubles a frequency.")}
      </p>
      <CodeBlock lang="glsl" filename="fbm.glsl" t={t}>{`const mat2 R = mat2(0.8, 0.6, -0.6, 0.8);   // rotation by 36.87°: cos = 0.8, sin = 0.6

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        value     += amplitude * gradientNoise(p);
        p          = R * p * 2.0;    // next octave: rotated, twice the frequency (lacunarity)
        amplitude *= 0.5;            // half the amplitude (gain)
    }
    return value;
}

// Drifting clouds
void main() {
    vec2  uv    = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
    float cloud = fbm(uv * 3.0 + uTime * 0.1) * 1.4 + 0.5;
    vec3  color = mix(vec3(0.3, 0.4, 0.8), vec3(1.0), clamp(cloud, 0.0, 1.0));
    FragColor = vec4(color, 1.0);
}`}</CodeBlock>
      <Equation label={tx(t, "glsl05_fbmLabel", "Fractal sum (fBm)")}
        where={[
          [r`\lambda`, tx(t, "glsl05_wLac", "lacunarity: frequency multiplier per octave, usually ≈ 2")],
          [r`g`, tx(t, "glsl05_wGain", "gain (persistence): amplitude multiplier, usually 0.5")],
          [r`H`, tx(t, "glsl05_wH", "the Hurst exponent: g = λ^(−H); H = 1 is the natural 1/f spectrum")],
          [r`R`, tx(t, "glsl05_wR", "a fixed rotation, applied once more per octave")],
          [r`N`, tx(t, "glsl05_wN", "the number of octaves")],
        ]}
        words={tx(t, "glsl05_fbmWords", "Add N copies of the noise; copy i is λⁱ times finer, turned i times by R, and gⁱ times as strong.")}>
        {r`\operatorname{fbm}(\mathbf p) = \sum_{i=0}^{N-1} g^{\,i}\; n\!\left(\lambda^{i}\,R^{i}\,\mathbf p\right)`}
      </Equation>
      <p>
        {tx(t, "glsl05_rotBody",
          "Why rotate? Every octave of gradient noise is 0 on its own lattice points, and with λ = 2 and no rotation the lattices of all octaves share the origin and every other point of the first one. The zeros pile up along the same rows and columns and the grid shows through the sum. 0.8² + 0.6² = 1, so R turns without stretching, and 36.87° shares no symmetry with the square grid. A lacunarity of 2.01 instead of 2 has a similar effect.")}
      </p>
      <H3>{tx(t, "glsl05_aliasTitle", "How many octaves?")}</H3>
      <p>
        {tx(t, "glsl05_aliasBody",
          "Each octave halves the size of its bumps. Once a bump is smaller than two pixels, the screen can no longer show it: the octave adds no detail, only aliasing, a shimmer that crawls when the camera moves. With the noise scaled to s cells across a screen W pixels wide, octave i has bumps W / (s·λⁱ) pixels apart:")}
      </p>
      <LiveFormula label={tx(t, "glsl05_liveOct", "Try it: which octaves can the screen show?")}
        tex={r`P_i = \frac{W}{s\,\lambda^{i}}\ \text{px}, \qquad N_{max} = 1 + \left\lfloor \log_\lambda \frac{W}{2s} \right\rfloor`}
        vars={[
          { id: "W", label: "W", min: 256, max: 3840, step: 16, value: 1920, fmt: v => `${v} px` },
          { id: "s", label: "s", min: 1, max: 32, step: 1, value: 3, fmt: v => `${v}` },
          { id: "lac", label: "λ", min: 1.5, max: 3, step: 0.05, value: 2, fmt: v => v.toFixed(2) },
          { id: "N", label: "N", min: 1, max: 14, step: 1, value: 8, fmt: v => `${v}` },
        ]}
        compute={octaveNumbers(t)}
        where={[
          ["W", tx(t, "glsl05_wW", "the width of the screen (or of the noise's area), in pixels")],
          ["s", tx(t, "glsl05_wS", "how many cells of the first octave fit across it: the scale p is multiplied by")],
          [r`P_i`, tx(t, "glsl05_wP", "the size of octave i's bumps on screen, in pixels")],
          [r`N_{max}`, tx(t, "glsl05_wNmax", "the last octave whose bumps are still at least 2 pixels apart")],
        ]}
        note={tx(t, "glsl05_liveOctNote", "Full HD with 3 cells across allows 9 octaves; a tenth would have bumps 1.25 px apart. On a 4K screen the same scale allows one more. In 3D the answer changes with distance: a far-away mountain covers fewer pixels and needs fewer octaves than the ground at your feet, which is what the code below handles.")} />
      <p>
        {tx(t, "glsl05_aaBody",
          "On a surface seen in perspective the right number of octaves differs per pixel. fwidth(p) tells how much p changes from one pixel to the next, in cells; an octave is fine while its cells are at least two pixels wide, so its weight can be faded out between 4 and 2 pixels per cell. The fade is smooth, so no octave pops in or out as the camera moves:")}
      </p>
      <CodeBlock lang="glsl" filename="fbm_aa.glsl" t={t}>{`float fbmAA(vec2 p) {
    float fw  = length(fwidth(p));          // cells per pixel, first octave
    float sum = 0.0, amp = 0.5;
    for (int i = 0; i < 10; i++) {
        float w = 1.0 - smoothstep(0.25, 0.5, fw);   // 1 while a cell spans 4+ px, 0 below 2 px
        if (w <= 0.0) break;                          // every finer octave is invisible too
        sum += amp * w * gradientNoise(p);
        p   = R * p * 2.0;
        fw *= 2.0;                                    // the rotation keeps lengths: only λ counts
        amp *= 0.5;
    }
    return sum;
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "glsl05_thVariant", "Variant"), tx(t, "glsl05_thTerm", "Each octave adds"), tx(t, "glsl05_thLooks", "Looks like")]}
        rows={[
          [tx(t, "glsl05_v1", "fBm"), "g^i · n", tx(t, "glsl05_v1b", "clouds, soft terrain, dust")],
          [tx(t, "glsl05_v2", "turbulence"), "g^i · |n|", tx(t, "glsl05_v2b", "creases where n crosses 0: fire, marble veins, billowing smoke")],
          [tx(t, "glsl05_v3", "ridged"), "g^i · (1 − |n|)²", tx(t, "glsl05_v3b", "sharp crests turned upwards: mountain ridges, lightning")],
          [tx(t, "glsl05_v4", "gain above 0.5"), "g = 0.6 … 0.7", tx(t, "glsl05_v4b", "rougher: rock, rust, gravel")],
          [tx(t, "glsl05_v5", "gain below 0.5"), "g = 0.3 … 0.4", tx(t, "glsl05_v5b", "smoother: sand dunes, distant hills")],
        ]}
      />
    </>
  );
}

// ── Domain warping ────────────────────────────────────────────────────────────

function WarpSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glsl05_warpTitle", "Domain warping")}</H2>
      <p>
        {tx(t, "glsl05_warpBody",
          "fBm changes the values of noise; domain warping changes where it is read. Instead of fbm(p), compute fbm(p + k·q), where q is itself a vector of two fBm values. Each pixel looks up the pattern at a displaced spot, and since the displacement is smooth the pattern is bent and stretched rather than torn. Doing it twice gives the flowing, folded look of marble, smoke and the bands of gas giants (Íñigo Quílez's well-known version):")}
      </p>
      <Equation label={tx(t, "glsl05_warpLabel", "Two levels of domain warping")}
        where={[
          [r`\mathbf q,\ \mathbf r`, tx(t, "glsl05_wQR", "vectors made of two fBm values each: the displacement fields")],
          [r`k`, tx(t, "glsl05_wK", "the warp strength; about 4 gives strong folds")],
          [r`\mathbf c_j`, tx(t, "glsl05_wC", "arbitrary offsets, so the two components of a vector come from unrelated parts of the noise")],
        ]}
        words={tx(t, "glsl05_warpWords", "Read the noise at a point pushed by a noise vector, which was itself read at a point pushed by another noise vector.")}>
        {r`\begin{gathered} \mathbf q = \big(\operatorname{fbm}(\mathbf p),\ \operatorname{fbm}(\mathbf p + \mathbf c_1)\big) \\ \mathbf r = \big(\operatorname{fbm}(\mathbf p + k\mathbf q + \mathbf c_2),\ \operatorname{fbm}(\mathbf p + k\mathbf q + \mathbf c_3)\big) \\ f = \operatorname{fbm}(\mathbf p + k\,\mathbf r) \end{gathered}`}
      </Equation>
      <CodeBlock lang="glsl" filename="warp.glsl" t={t}>{`vec2  q = vec2(fbm(p),                     fbm(p + vec2(5.2, 1.3)));
vec2  r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2)), fbm(p + 4.0*q + vec2(8.3, 2.8)));
float f = fbm(p + 4.0 * r);

// q and r are useful for colouring too: they say how far each pixel was moved
vec3 col = mix(vec3(0.1, 0.3, 0.4), vec3(0.7, 0.65, 0.5), clamp(f * 2.0 + 0.5, 0.0, 1.0));
col = mix(col, vec3(0.0, 0.1, 0.25), clamp(length(q) * 1.5, 0.0, 1.0));`}</CodeBlock>
      <p>
        {tx(t, "glsl05_warpCost",
          "The price is five fBm calls per pixel instead of one, 30 noise evaluations with 6 octaves. Animating the offsets c with time makes the folds flow; animating only p would just slide the picture.")}
      </p>
    </>
  );
}

// ── Moving, tiling, playground, mistakes ──────────────────────────────────────

function PracticeSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glsl05_moveTitle", "Moving, tiling and baking noise")}</H2>
      <LessonTable
        headers={[tx(t, "glsl05_thGoal", "Goal"), tx(t, "glsl05_thHow", "How"), tx(t, "glsl05_thCostT", "Cost and catch")]}
        rows={[
          [tx(t, "glsl05_m1", "scroll"), "noise(p + uTime * v)", tx(t, "glsl05_m1b", "free; the whole pattern slides like a rigid sheet. Different speeds per octave make clouds look alive.")],
          [tx(t, "glsl05_m2", "evolve in place"), "noise3(vec3(p, uTime))", tx(t, "glsl05_m2b", "3D noise with time as the third axis: 8 corners instead of 4, twice the cost (simplex: 4 instead of 3).")],
          [tx(t, "glsl05_m3", "flow"), tx(t, "glsl05_m3k", "rotate each gradient by uTime"), tx(t, "glsl05_m3b", "Perlin and Neyret's flow noise: swirls without any drift.")],
          [tx(t, "glsl05_m4", "tile"), "hash(mod(i, period))", tx(t, "glsl05_m4b", "wrap the lattice index so cell period is cell 0 again; the period must be a whole number of cells, and the same for every octave times λⁱ.")],
          [tx(t, "glsl05_m5", "bake"), "texture(uNoise, p / 256.0)", tx(t, "glsl05_m5b", "render the noise once into a tileable texture; one filtered fetch replaces dozens of operations. The texture has a fixed resolution and repeats.")],
        ]}
      />
      <CodeBlock lang="glsl" filename="tileable.glsl" t={t}>{`// Value noise that repeats every 'period' cells: the right edge matches the left
float tileNoise(vec2 p, vec2 period) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(mod(i,                 period));
    float b = hash(mod(i + vec2(1.0, 0.0), period));
    float c = hash(mod(i + vec2(0.0, 1.0), period));
    float d = hash(mod(i + vec2(1.0, 1.0), period));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// For tileable fBm, multiply the period by the lacunarity at each octave (keep λ = 2, no rotation)`}</CodeBlock>

      <H2>{tx(t, "glsl05_playTitle", "The noise playground")}</H2>
      <p>
        {tx(t, "glsl05_playBody",
          "Every noise of this chapter runs in the playground below, with its sliders. Compare the four basic noises side by side (toggle the lattice to see the grid each is built on), switch fBm between plain, turbulence and ridged, turn up the warp, and look at the two classic materials built from turbulence: wood rings and marble.")}
      </p>
      <ShaderPlayground presets={NOISE_PRESETS} t={t} id="glsl05Noise" />
      <LessonTable
        headers={[tx(t, "glsl05_thKind", "Noise"), tx(t, "glsl05_thCost", "Cost (2D)"), tx(t, "glsl05_thLook", "Look / use")]}
        rows={[
          [tx(t, "glsl05_k1", "Value"), tx(t, "glsl05_k1c", "4 hashes"), tx(t, "glsl05_k1l", "blocky blobs; cheap clouds, dithering")],
          [tx(t, "glsl05_k2", "Gradient (Perlin)"), tx(t, "glsl05_k2c", "4 hashes + 4 dots"), tx(t, "glsl05_k2l", "smooth, grid mostly hidden: terrain, fBm")],
          [tx(t, "glsl05_k3", "Simplex"), tx(t, "glsl05_k3c", "3 corners (n + 1 in n-D)"), tx(t, "glsl05_k3l", "like Perlin, no axis bias, scales better to 3D/4D")],
          [tx(t, "glsl05_k4", "Worley (cellular)"), tx(t, "glsl05_k4c", "9 feature points"), tx(t, "glsl05_k4l", "cells, stones, scales, caustics, cracks")],
          [tx(t, "glsl05_k5", "Domain-warped fBm"), tx(t, "glsl05_k5c2", "5× fBm"), tx(t, "glsl05_k5l", "marble, gas giants, smoke, alien flesh")],
        ]}
      />

      <H2>{tx(t, "glsl05_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "glsl05_thMistake", "Mistake"), tx(t, "glsl05_thFix", "What happens, and the fix")]}
        rows={[
          [tx(t, "glsl05_e1", "hash(uv * 10.0) without floor()"), tx(t, "glsl05_e1b", "every pixel gets its own value: static instead of cells. Hash the cell, floor(p), not the position.")],
          [tx(t, "glsl05_e2", "the same hash for x and y of a vector"), tx(t, "glsl05_e2b", "both components are equal, so every gradient points along the diagonal and the noise has diagonal streaks. Use different constants, or both outputs of pcg2d.")],
          [tx(t, "glsl05_e3", "octaves with λ = 2 and no rotation"), tx(t, "glsl05_e3b", "the lattices line up and the grid shows through. Rotate each octave or use λ = 2.01. Every octave of gradient noise is still 0 at the origin, rotated or not, so if the origin is on screen, add a different offset to p in each octave.")],
          [tx(t, "glsl05_e4", "more octaves than the screen can show"), tx(t, "glsl05_e4b", "shimmer and crawling when the camera moves, for extra cost. Stop at two pixels per bump, or fade octaves with fwidth().")],
          [tx(t, "glsl05_e5", "p + uTime with a sin hash"), tx(t, "glsl05_e5b", "after a few hours the coordinates are large and the noise turns into stripes or blocks. Use an integer hash, or wrap the offset at a tile period.")],
          [tx(t, "glsl05_e6", "mixing value noise with gradient noise"), tx(t, "glsl05_e6b", "one lies in [0, 1], the other around 0: half the picture goes black. Rescale gradient noise with n · 1.4 · 0.5 + 0.5.")],
          [tx(t, "glsl05_e7", "smoothstep fade for a bump map"), tx(t, "glsl05_e7b", "the lighting shows the grid even though the height looks smooth. Use the quintic fade wherever normals are taken.")],
        ]}
      />

      <H2>{tx(t, "glsl05_tryTitle", "Try it yourself")}</H2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>{tx(t, "glsl05_try1", "In the hash playground, find the uOffset where the left half first shows a pattern on your screen. Then open the same page on a phone and compare.")}</li>
        <li>{tx(t, "glsl05_try2", "Write 3D value noise: floor and fract of a vec3, eight corners, and three levels of mix(). Use it as noise3(vec3(p, uTime)) and compare with scrolling.")}</li>
        <li>{tx(t, "glsl05_try3", "Colour Worley cells by their id: return the hashed point of the nearest cell along with F1, and use it to pick a colour per stone, with dark grout where F2 − F1 is small.")}</li>
        <li>{tx(t, "glsl05_try4", "Build ridged fBm and use it as the height of a terrain: water below 0.3, rock above 0.6, snow above 0.8, as in the fBm preset.")}</li>
        <li>{tx(t, "glsl05_try5", "Make fBm tile with a period of 4 cells and draw it twice side by side: the seam should be invisible.")}</li>
      </ol>

      <Related t={t} links={[
        { track: "GameDev", id: "perlin", title: tx(t, "glsl05_rel1", "Perlin Noise & Fractal Terrain"), why: tx(t, "glsl05_rel1b", "gradient noise step by step on the CPU, where the quintic fade comes from, and terrain from fBm.") },
        { track: "GameDev", id: "random", title: tx(t, "glsl05_rel2", "Randomness, Seeds & Hashing"), why: tx(t, "glsl05_rel2b", "random number generators, seeds and why hashes need no state.") },
        { track: "GLSL", id: "shatter", title: tx(t, "glsl05_rel3", "Cracks & Shattering"), why: tx(t, "glsl05_rel3b", "the exact distance to a Voronoi border, and Voronoi in log-polar space.") },
        { track: "GLSL", id: "fire", title: tx(t, "glsl05_rel4", "Fire & Smoke"), why: tx(t, "glsl05_rel4b", "rising fBm as a flame's temperature field, and noisy smoke volumes.") },
      ]} />
    </>
  );
}

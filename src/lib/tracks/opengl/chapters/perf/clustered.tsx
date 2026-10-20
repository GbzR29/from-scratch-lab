"use client";

// "Forward+ & Clustered Shading" (Performance): many lights without deferred shading's bandwidth.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { lightCostNumbers, sliceNumbers } from "@/lib/tracks/opengl/live/clustered";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { LightBinningFigure } from "@/components/lesson/figures/perf/LightBinningFigure";
import { ForwardPlusFigure } from "@/components/lesson/figures/perf/ForwardPlusFigure";

const r = String.raw;

export function ClusteredContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglClus_intro",
          "A night scene with street lamps, muzzle flashes, spells and neon signs can easily have a thousand lights. Plain forward shading loops over every light for every pixel of every object. Deferred shading fixes that but pays in memory bandwidth and gives up MSAA and easy transparency. Tiled and clustered shading keep forward rendering's strengths and add one idea: work out once, per screen region, which lights can possibly matter there.")}
      </Lead>

      <Goals t={t} id="oglClus" items={[
        "Explain why each light costs time at every pixel it might touch.",
        "Assign lights to screen tiles with Forward+.",
        "Assign them to 3D clusters, and build the lists on the GPU.",
      ]} />

      <H2>{tx(t, "oglClus_costTitle", "The cost of a light")}</H2>
      <Equation label={tx(t, "oglClus_costLabel", "Shading work per frame")}
        where={[
          [r`P`, tx(t, "oglClus_wP", "pixels shaded (with overdraw)")],
          [r`L`, tx(t, "oglClus_wL", "lights in the scene")],
          [r`\bar\ell`, tx(t, "oglClus_wLbar", "average number of lights actually looped over per pixel")],
        ]}
        words={tx(t, "oglClus_costWords", "Plain forward shading runs the light loop once per light for every pixel it shades. Culling first shortens that loop to the few lights that can actually reach the pixel.")}
        note={tx(t, "oglClus_costNote", "A point light with a finite radius only affects a sphere. On screen that is a small disk, often a few percent of the image. Everything outside the disk contributes exactly zero, so looping over it is pure waste. The goal is to make ℓ̄ close to the number of lights that really reach each pixel.")}>
        {r`\text{naive forward: } P \cdot L \qquad \text{culled: } P \cdot \bar\ell,\quad \bar\ell \ll L`}
      </Equation>
      <LiveFormula label={tx(t, "oglClus_costLive", "Try it: light-loop iterations per frame at 1080p")}
        tex={r`P \cdot L \qquad P \cdot \bar\ell \qquad \bar\ell \approx L \cdot \text{${tx(t, "oglClus_costLiveCov", "coverage")}}`}
        vars={[
          { id: "L", label: "L", min: 1, max: 1024, step: 1, value: 256, fmt: v => `${v}` },
          { id: "cov", label: tx(t, "oglClus_costLiveCovLbl", "coverage"), min: 0.5, max: 50, step: 0.5, value: 2, fmt: v => `${v}%` },
          { id: "od", label: "overdraw", min: 1, max: 4, step: 0.1, value: 1.5, fmt: v => `${v}×` },
        ]}
        where={[
          [r`\text{${tx(t, "oglClus_costLiveCov", "coverage")}}`, tx(t, "oglClus_wCov", "the share of the screen an average light's sphere covers once projected; a lamp with a 5 m radius seen from 20 m covers a few percent")],
          [r`\text{overdraw}`, tx(t, "oglClus_wOd", "how many times each pixel is shaded on average, because surfaces overlap")],
        ]}
        compute={lightCostNumbers(t)}
        note={tx(t, "oglClus_costLiveNote", "With 256 lights each covering 2% of the screen, a pixel is reached by about 5 of them, so culling does 50 times less loop work, and the gain does not depend on L at all: only on the coverage. Real tile lists are a little longer than ℓ̄, because the tests are conservative, and the build pass has its own small cost.")} />

      <H2>{tx(t, "oglClus_tiledTitle", "Tiled shading (Forward+)")}</H2>
      <p>
        {tx(t, "oglClus_tiledBody",
          "Harada, McKee and Yang's Forward+ (2012) cuts the screen into tiles, typically 16×16 pixels, and gives each tile its own light list. A depth pre-pass records the scene's depth. A compute shader then reads the minimum and maximum depth inside every tile, which bounds the tile's pixels to a thin sub-frustum. It tests every light's sphere against that sub-frustum and appends the survivors to the tile's list. The forward pass finally shades each pixel with only its tile's lights.")}
      </p>
      <Equation label={tx(t, "oglClus_tileTestLabel", "Light sphere vs tile sub-frustum")}
        where={[
          [r`(\mathbf n_k, d_k)`, tx(t, "oglClus_wPlanes", "the four side planes of the tile's frustum (through the camera and the tile's edges), in view space")],
          [r`\mathbf c,\ \rho`, tx(t, "oglClus_wC", "the light's view-space centre and radius; z_c is its depth")],
          [r`z_{min}, z_{max}`, tx(t, "oglClus_wZ", "the tile's depth bounds from the depth buffer")],
          [r`\bigwedge`, tx(t, "oglClus_wAnd", "\"and\" over all four planes: every one of the conditions must hold")],
        ]}
        words={tx(t, "oglClus_tileTestWords", "Keep a light for a tile if its sphere is not completely outside any of the tile's four side planes, and its depth range overlaps the depths actually found in the tile.")}
        note={tx(t, "oglClus_tileTestNote", "The same sphere-vs-plane test as frustum culling, per tile. It is conservative near the tile's corners, so a light may be listed in a tile it barely misses. That costs a few wasted loop iterations and is never wrong.")}>
        {r`\begin{gathered} \text{keep} \iff \bigwedge_{k=1}^{4} \big(\mathbf n_k\cdot\mathbf c + d_k \ge -\rho\big) \\[4pt] \wedge\;\; z_c + \rho \ge z_{min} \;\;\wedge\;\; z_c - \rho \le z_{max} \end{gathered}`}
      </Equation>
      <p>
        {tx(t, "oglClus_discBody",
          "Tiled shading has one weak spot: depth discontinuities. A tile that contains both a nearby character and the far background has a huge [zmin, zmax] range, so every light between them lands in its list. At silhouettes, which are common, the lists balloon.")}
      </p>
      <LightBinningFigure t={t} />

      <H2>{tx(t, "oglClus_clusterTitle", "Clustered shading")}</H2>
      <p>
        {tx(t, "oglClus_clusterBody",
          "Olsson, Billeter and Assarsson's clustered shading (2012) subdivides each tile along depth as well, into a 3D grid of \"froxels\" (frustum voxels). A pixel finds its cluster from its screen position and its depth, and loops over that cluster's list only. Depth discontinuities stop mattering, and because the grid does not depend on the depth buffer, the lists can be built before any geometry is drawn. That also makes them usable for transparent objects and volumetric fog, which have no single depth.")}
      </p>
      <Equation label={tx(t, "oglClus_sliceLabel", "Exponential depth slicing")}
        where={[
          [r`z`, tx(t, "oglClus_wZv", "view-space depth of the pixel (positive, in front of the camera)")],
          [r`n,\ f`, tx(t, "oglClus_wNF", "near and far planes of the clustered range")],
          [r`S`, tx(t, "oglClus_wS", "number of depth slices, typically 16–32")],
          [r`z_k`, tx(t, "oglClus_wZk", "the depth where slice k begins: z₀ = n and z_S = f")],
          [r`\lfloor\ \rfloor`, tx(t, "oglClus_wFloor", "round down: slice numbers are whole numbers")],
        ]}
        words={tx(t, "oglClus_sliceWords", "Every slice is the same fixed percentage deeper than the one before it. Taking the logarithm turns that into equal steps, so the slice number is just a scaled logarithm of the depth.")}
        note={tx(t, "oglClus_sliceNote", "Uniform slices would waste most of them on the distance, where perspective makes everything small. Exponential slices grow with distance at the same rate as screen-space size shrinks, so clusters stay roughly cube-shaped in view space. DOOM (2016) uses this formula, and its log() is two multiply-adds once the constants are precomputed.")}>
        {r`\text{slice}(z) = \left\lfloor \frac{\ln(z / n)}{\ln(f / n)}\,S \right\rfloor \qquad z_k = n\left(\frac{f}{n}\right)^{k/S}`}
      </Equation>
      <Derivation t={t} label={tx(t, "oglClus_sliceDer", "From \"same shape at every depth\" to the logarithm")}
        steps={[
          { tex: r`z_{k+1} = q\,z_k`,
            why: tx(t, "oglClus_sd1", "a tile's width in view space grows in proportion to z. For clusters to stay roughly cube-shaped, each slice's thickness must grow the same way: every boundary is a fixed factor q beyond the previous one") },
          { tex: r`z_k = n\,q^k`,
            why: tx(t, "oglClus_sd2", "start at z₀ = n and multiply by q, k times") },
          { tex: r`z_S = n\,q^S = f \;\Rightarrow\; q = \Big(\frac{f}{n}\Big)^{1/S}`,
            why: tx(t, "oglClus_sd3", "the last boundary must land on the far plane; take the S-th root") },
          { tex: r`z = n\,q^{s} \iff s = \frac{\ln(z / n)}{\ln q} = \frac{\ln(z / n)}{\ln(f / n)}\,S`,
            why: tx(t, "oglClus_sd4", "solve for the slice number s with a logarithm, and replace ln q by ln(f/n)/S. Rounding s down gives the slice") },
          { tex: r`s = \ln z \cdot \underbrace{\frac{S}{\ln(f/n)}}_{\text{uLogScale}} \;\underbrace{-\;\frac{S\,\ln n}{\ln(f/n)}}_{\text{uLogBias}}`,
            why: tx(t, "oglClus_sd5", "split ln(z/n) into ln z − ln n: everything but ln z is constant for the frame, so the shader does one log and one multiply-add") },
        ]} />
      <LiveFormula label={tx(t, "oglClus_sliceLive", "Try it: n = 0.1, f = 1000")}
        tex={r`\text{slice}(z) = \left\lfloor \frac{\ln(z / n)}{\ln(f / n)}\,S \right\rfloor`}
        vars={[
          { id: "z", label: "z", min: 0.1, max: 1000, step: 0.1, value: 12, fmt: v => v.toFixed(1) },
          { id: "S", label: "S", min: 4, max: 32, step: 1, value: 16, fmt: v => `${v}` },
        ]}
        compute={sliceNumbers}
        note={tx(t, "oglClus_sliceLiveNote", "Whatever slice z falls in, the last ratio is the same: every slice is the same fraction thicker than its depth. With S = 16 it is 78%: the slice holding 12 m runs from 10 to 17.8 m (7.8 m thick), and the one holding 600 m from 562 to 1000 m (438 m thick). Uniform slices of 1000/16 ≈ 62 m would put everything from 0.1 to 62 m, nearly the whole visible scene, into the first slice.")} />
      <CodeBlock lang="glsl" filename="clustered_lookup.frag" t={t}>{`layout(std430, binding = 0) readonly buffer Lights      { PointLight lights[]; };
layout(std430, binding = 1) readonly buffer ClusterGrid { uvec2 grid[]; };      // (offset, count)
layout(std430, binding = 2) readonly buffer LightIndex  { uint  indices[]; };
uniform uvec3 uGridSize;          // e.g. (16, 9, 24)
uniform vec2  uScreen;
uniform float uLogScale, uLogBias;  // S / ln(f/n),  −S·ln(n) / ln(f/n)

uint clusterIndex(vec2 fragCoord, float viewZ) {
    uint slice = uint(max(log(viewZ) * uLogScale + uLogBias, 0.0));
    uvec2 tile = uvec2(fragCoord / uScreen * vec2(uGridSize.xy));
    return tile.x + uGridSize.x * (tile.y + uGridSize.y * slice);
}

vec3 shadeAllLights(vec3 P, vec3 N, vec3 V, float viewZ) {
    uvec2 cell = grid[clusterIndex(gl_FragCoord.xy, viewZ)];
    vec3 sum = vec3(0.0);
    for (uint k = 0u; k < cell.y; ++k)
        sum += shadePointLight(lights[indices[cell.x + k]], P, N, V);
    return sum;
}`}</CodeBlock>
      <ForwardPlusFigure t={t} />

      <H2>{tx(t, "oglClus_buildTitle", "Building the lists on the GPU")}</H2>
      <p>
        {tx(t, "oglClus_buildBody",
          "Each frame, a compute shader with one thread per cluster (or one workgroup per tile) tests the lights and writes the lists. The lists all go into one flat index buffer. A global atomic counter reserves each cluster's range: count the matches, atomicAdd the count to get an offset, then write the indices. Lights are first culled against the camera frustum and sorted into shared memory in batches, so each workgroup reads every light from memory once.")}
      </p>
      <LessonTable
        headers={[tx(t, "oglClus_thTech", "Technique"), tx(t, "oglClus_thGood", "Good at"), tx(t, "oglClus_thBad", "Costs")]}
        rows={[
          [tx(t, "oglClus_t1", "Forward"), tx(t, "oglClus_t1g", "MSAA, transparency, complex materials; simple"), tx(t, "oglClus_t1b", "P × L: a handful of lights at most")],
          [tx(t, "oglClus_t2", "Deferred"), tx(t, "oglClus_t2g", "many lights, decoupled from geometry"), tx(t, "oglClus_t2b", "G-buffer bandwidth; MSAA and transparency are awkward; one material model")],
          [tx(t, "oglClus_t3", "Tiled forward (Forward+)"), tx(t, "oglClus_t3g", "many lights with forward's flexibility"), tx(t, "oglClus_t3b", "needs a depth pre-pass; lists bloat at depth discontinuities")],
          [tx(t, "oglClus_t4", "Clustered forward"), tx(t, "oglClus_t4g", "many lights, stable cost, works for transparents and volumetrics"), tx(t, "oglClus_t4b", "a 3D grid and index lists in memory; one more lookup per pixel")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "oglClus_whoNote",
          "DOOM (2016) and DOOM Eternal, Detroit: Become Human, and Unreal's Forward Shading mode use clustered forward. Unity's URP \"Forward+\" path is tiled. Deferred renderers also tile their lighting pass the same way (tiled deferred). The binning idea is the same everywhere; only where the material data comes from differs.")}
      </Callout>
      <Callout type="warn" t={t}>
        {tx(t, "oglClus_pitfalls",
          "Lights must have a finite range for any of this to work, so give point lights a radius and a falloff that reaches exactly zero there, like the windowed inverse-square in the figure, or you get hard seams at tile edges. Cap the per-cluster list length and watch the worst case: fifty overlapping lights in one cluster is still fifty loop iterations, in every pixel of it. Shadowed lights still need their shadow maps, and those remain the expensive part.")}
      </Callout>

      <KeyIdeas t={t} id="oglClus" items={[
        "Naive forward costs pixels × lights; lights with a finite radius only affect small screen regions.",
        "Tiled (Forward+): per 16×16 tile, keep lights whose sphere meets the tile's frustum and depth range.",
        "Depth discontinuities bloat tile lists; clustered shading also slices depth, exponentially.",
        "A pixel finds its cluster from (tile, slice(z)) and loops only over that list.",
        "Lists are built per frame in a compute shader into one flat index buffer with atomic offsets.",
      ]} />
    </Article>
  );
}

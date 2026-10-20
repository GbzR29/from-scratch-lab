"use client";

// "Level of Detail" (Performance): choosing levels by projected size, hiding the switch, and simplification.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { LodFigure } from "@/components/lesson/figures/perf/LodFigure";

const r = String.raw;

export function LodContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglLod_intro",
          "A rock 200 m away is eight pixels tall. Drawing it with the same 5 000 triangles as when it sits at your feet wastes vertex work, and worse: triangles smaller than a pixel shade very inefficiently. Level of detail (LOD) keeps several versions of each mesh and picks, per frame, the cheapest one that still looks the same at its current size on screen.")}
      </Lead>

      <Goals t={t} id="oglLod" items={[
        "Choose a level of detail from an object's size on screen.",
        "Hide the switch between levels with hysteresis and cross-fades.",
        "Say where the simpler levels come from.",
      ]} />

      <H2>{tx(t, "oglLod_metricTitle", "Choosing by projected size")}</H2>
      <p>
        {tx(t, "oglLod_metricBody",
          "Distance alone is a poor metric: it ignores the field of view (a sniper scope zooms in, so LOD must go up), the resolution and the object's own size. Projected size in pixels accounts for all three:")}
      </p>
      <Equation label={tx(t, "oglLod_pxLabel", "Projected radius in pixels")}
        where={[
          [r`\rho`, tx(t, "oglLod_wRho", "radius of the object's bounding sphere")],
          [r`d`, tx(t, "oglLod_wD", "distance from the camera to the sphere's centre")],
          [r`H,\ \text{fov}`, tx(t, "oglLod_wH", "viewport height in pixels, vertical field of view")],
          [r`b`, tx(t, "oglLod_wB", "LOD bias: a quality knob (and a per-platform setting)")],
          [r`\tau_i`, tx(t, "oglLod_wTau", "the size threshold of level i in pixels, falling as i grows: level 0 (full detail) needs the largest r_px")],
        ]}
        words={tx(t, "oglLod_pxWords", "Work out how many pixels the object's radius covers on screen: its size over its distance, times how many pixels one unit at distance 1 takes. Then use the most detailed level whose threshold that size still beats.")}
        note={tx(t, "oglLod_pxNote", "Pick the first level whose threshold r_px exceeds. Artists often author thresholds as \"screen size\", the fraction of the screen height the object covers, which is the same number divided by H.")}>
        {r`r_{px} = b \cdot \frac{\rho}{d} \cdot \frac{H}{2\tan(\text{fov}/2)} \qquad \text{LOD} = \min\{\,i : r_{px} > \tau_i\,\}`}
      </Equation>
      <Derivation t={t} label={tx(t, "oglLod_pxDer", "Where r_px comes from")}
        steps={[
          { tex: r`h(d) = d\,\tan(\text{fov}/2)`,
            why: tx(t, "oglLod_pd1", "at distance d, the frustum reaches this far above the centre of the view: half of what the screen shows there, from the right triangle with angle fov/2 at the camera") },
          { tex: r`r_{ndc} = \frac{\rho}{d\,\tan(\text{fov}/2)}`,
            why: tx(t, "oglLod_pd2", "the sphere's radius as a fraction of that half-height. This is its radius in NDC, where the screen goes from −1 to +1") },
          { tex: r`r_{px} = r_{ndc}\cdot\frac{H}{2} = \frac{\rho}{d}\cdot\frac{H}{2\tan(\text{fov}/2)}`,
            why: tx(t, "oglLod_pd3", "2 NDC units span the H pixels of the viewport, so one unit is H/2 pixels") },
          { tex: r`\times\, b`,
            why: tx(t, "oglLod_pd4", "the bias scales the result: b = 2 treats every object as twice as large, so detail drops later. It is an approximation for small, centred spheres; for a sphere close to the camera or near the edge of the screen the true projection is a little larger, which only errs toward more detail") },
        ]} />

      <H2>{tx(t, "oglLod_popTitle", "Popping, hysteresis and cross-fades")}</H2>
      <p>
        {tx(t, "oglLod_popBody",
          "Switching levels changes the silhouette in one frame, a \"pop\". An object sitting right at a threshold, or a camera bobbing while walking, makes it pop back and forth every frame. Hysteresis fixes the flicker: switching to a coarser level uses a slightly lower threshold than switching back.")}
      </p>
      <Equation label={tx(t, "oglLod_hystLabel", "Hysteresis band")}
        where={[[r`h`, tx(t, "oglLod_wHyst", "hysteresis fraction, e.g. 0.1–0.2")]]}
        words={tx(t, "oglLod_hystWords", "Use two thresholds instead of one: to gain detail the object must grow a little past the threshold, and to lose it, shrink a little below. In between, the current level stays.")}
        note={tx(t, "oglLod_hystNote", "With τ = 100 px and h = 0.15 the band is 85–115 px. An object bobbing between 95 and 105 px never leaves it, so it keeps whatever level it had.")}>
        {r`\begin{gathered} \text{refine to } i \text{ when } r_{px} > \tau_i\,(1 + h) \\[4pt] \text{coarsen past } i \text{ when } r_{px} < \tau_i\,(1 - h) \end{gathered}`}
      </Equation>
      <p>
        {tx(t, "oglLod_fadeBody",
          "To hide the pop itself, draw both levels for a short time and blend. Alpha blending would need sorting, so engines use a dithered cross-fade instead. Each level discards a complementary pattern of pixels (a 4×4 Bayer matrix) according to the fade factor, and TAA smooths the pattern out. Unreal and Unity both do this.")}
      </p>
      <CodeBlock lang="glsl" filename="lod_fade.frag" t={t}>{`uniform float fade;       // 0..1 coverage of this level during the transition
uniform bool  isIncoming; // the other level uses the complementary mask

float bayer4(ivec2 p) {
    const int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
    return (float(m[(p.x & 3) + (p.y & 3) * 4]) + 0.5) / 16.0;
}

void main() {
    float b = bayer4(ivec2(gl_FragCoord.xy));
    if (isIncoming ? b > fade : b <= fade) discard;   // together they cover every pixel once
    // … normal shading
}`}</CodeBlock>
      <LodFigure t={t} />

      <H2>{tx(t, "oglLod_makeTitle", "Where the levels come from")}</H2>
      <p>
        {tx(t, "oglLod_makeBody",
          "LODs are generated offline by mesh simplification, most often edge collapse guided by the quadric error metric (Garland & Heckbert, 1997). Every vertex accumulates the planes of its surrounding triangles into a 4×4 matrix. Collapsing an edge to a point v costs the sum of squared distances from v to those planes, and the cheapest collapses are done first until the triangle budget is met. meshoptimizer and Simplygon implement it.")}
      </p>
      <Equation label={tx(t, "oglLod_qemLabel", "Quadric error metric")}
        where={[
          [r`\mathbf p = (a, b, c, d)`, tx(t, "oglLod_wP", "a triangle's plane, ax + by + cz + d = 0 with (a, b, c) unit length")],
          [r`\bar v = (x, y, z, 1)`, tx(t, "oglLod_wV", "the candidate position in homogeneous form")],
          [r`Q_i`, tx(t, "oglLod_wQ2", "sum of p·pᵀ over the triangles around vertex i: a symmetric 4×4 matrix")],
          [r`\Delta(v)`, tx(t, "oglLod_wDelta", "the error of moving the vertex to v: the sum of squared distances from v to the original planes")],
        ]}
        words={tx(t, "oglLod_qemWords", "Each vertex remembers the planes of the triangles around it. The cost of moving it is how far it would drift from those planes, squared and added up, and all of that fits in one small matrix.")}
        note={tx(t, "oglLod_qemNote", "Collapsing edge (i, j) uses Q = Qᵢ + Qⱼ. The best position solves ∂Δ/∂v = 0, a 3×3 linear system; if it is singular, try the endpoints and the midpoint. UV seams and normals are protected by adding extra weighted planes along the borders.")}>
        {r`\Delta(v) = \sum_{\mathbf p \in \text{planes}} (\mathbf p^{\mathsf T} \bar v)^2 = \bar v^{\mathsf T} \Big(\sum \mathbf p\,\mathbf p^{\mathsf T}\Big) \bar v = \bar v^{\mathsf T} Q\,\bar v`}
      </Equation>
      <Derivation t={t} label={tx(t, "oglLod_qemDer", "From a distance to a matrix")}
        steps={[
          { full: true, tex: r`\operatorname{dist}(v, \mathbf p) = ax + by + cz + d = \mathbf p^{\mathsf T}\bar v`,
            why: tx(t, "oglLod_qd1", "with (a, b, c) of unit length, plugging a point into the plane equation gives its signed distance. Appending a 1 to v turns that into one dot product") },
          { full: true, tex: r`(\mathbf p^{\mathsf T}\bar v)^2 = (\bar v^{\mathsf T}\mathbf p)(\mathbf p^{\mathsf T}\bar v) = \bar v^{\mathsf T}\,(\mathbf p\,\mathbf p^{\mathsf T})\,\bar v`,
            why: tx(t, "oglLod_qd2", "a number equals its own transpose, so one copy can be written as v̄ᵀp. Regrouping the product puts the plane alone in the middle: p·pᵀ is a 4×4 matrix") },
          { full: true, tex: r`\sum_{\mathbf p} \bar v^{\mathsf T}(\mathbf p\,\mathbf p^{\mathsf T})\bar v = \bar v^{\mathsf T}\Big(\sum_{\mathbf p}\mathbf p\,\mathbf p^{\mathsf T}\Big)\bar v`,
            why: tx(t, "oglLod_qd3", "v̄ is the same in every term, so it moves outside the sum. Whatever the number of planes, the vertex stores one symmetric 4×4 matrix: 10 numbers") },
          { full: true, tex: r`Q_{ij} = Q_i + Q_j`,
            why: tx(t, "oglLod_qd4", "collapsing an edge merges the plane sets of both ends, and summing sets of planes is summing their matrices. No list of planes is ever kept") },
        ]} />
      <LessonTable
        headers={[tx(t, "oglLod_thKind", "Kind"), tx(t, "oglLod_thIdea", "Idea"), tx(t, "oglLod_thUse", "Used for")]}
        rows={[
          [tx(t, "oglLod_k1", "Discrete LOD"), tx(t, "oglLod_k1i", "3–5 prebuilt meshes, each ~50% of the previous"), tx(t, "oglLod_k1u", "almost everything")],
          [tx(t, "oglLod_k2", "Impostors"), tx(t, "oglLod_k2i", "the last level is a camera-facing quad with a pre-rendered image (often several angles plus normals)"), tx(t, "oglLod_k2u", "trees and props far away")],
          [tx(t, "oglLod_k3", "HLOD"), tx(t, "oglLod_k3i", "far away, whole groups of objects are replaced by one merged, simplified mesh"), tx(t, "oglLod_k3u", "open worlds: one draw per city block")],
          [tx(t, "oglLod_k4", "Continuous / terrain"), tx(t, "oglLod_k4i", "detail varies smoothly across one mesh (tessellation, clipmaps, CDLOD)"), tx(t, "oglLod_k4u", "terrain, water")],
          [tx(t, "oglLod_k5", "Cluster LOD (Nanite)"), tx(t, "oglLod_k5i", "a hierarchy of small clusters, each simplified; the GPU picks per cluster so the error stays below a pixel"), tx(t, "oglLod_k5u", "film-quality assets at any distance")],
        ]}
      />
      <p>
        {tx(t, "oglLod_texBody", "Mipmaps are LOD for textures, applied automatically per pixel. Shading can have LOD too: skip normal mapping, parallax or extra lights for small objects. Even animation has LOD, updating distant characters' skeletons at a lower rate.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "oglLod_pitfalls",
          "Compute the metric from the same camera for every view that uses it. Shadow passes should usually reuse the main camera's LOD choice, or the shadow silhouette differs from the object. Keep LOD thresholds resolution-aware (r_px already is). Don't forget the vertex format: a simplified mesh with a 64-byte vertex can still cost more than a denser one with a 16-byte vertex.")}
      </Callout>

      <KeyIdeas t={t} id="oglLod" items={[
        "Pick LOD by projected size in pixels, which accounts for distance, fov, resolution and object size.",
        "Hysteresis stops flicker at thresholds; dithered cross-fades hide the pop.",
        "Levels are generated by edge collapse with the quadric error metric.",
        "Impostors, HLOD, terrain LOD and cluster LOD extend the idea.",
        "Tiny triangles are inefficient: LOD saves vertex and fragment work at once.",
      ]} />
    </Article>
  );
}

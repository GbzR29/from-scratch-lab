"use client";

// "Frustum & Occlusion Culling" (Performance): frustum planes, bounding-volume tests, hierarchies and occlusion culling.

import { CodeBlock, Callout, H2, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { boxNumbers, hizNumbers } from "@/lib/tracks/opengl/live/frustum-culling";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { FrustumCullFigure } from "@/components/lesson/figures/perf/FrustumCullFigure";

const r = String.raw;

export function FrustumCullingContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "oglCull_intro",
          "The fastest draw call is the one you never make. The GPU would clip an off-screen object anyway, but only after the CPU has issued its draw and the GPU has transformed every vertex. Culling decides on the CPU, or earlier on the GPU, that an object cannot be visible, using a cheap bounding volume instead of its triangles. In a typical open scene more than half of everything is behind or beside the camera.")}
      </Lead>

      <Goals t={t} id="oglCull" items={[
        "Describe the view frustum as six planes.",
        "Test bounding spheres and boxes against it.",
        "Skip whole groups of objects with a hierarchy.",
        "Skip objects hidden behind others with occlusion culling.",
      ]} />

      <H2>{tx(t, "oglCull_planesTitle", "The frustum as six planes")}</H2>
      <p>
        {tx(t, "oglCull_planesBody",
          "A point is inside the view frustum exactly when its clip-space coordinates satisfy −w ≤ x, y, z ≤ w. Each inequality is a plane, and because clip = M·p with M = projection · view, the plane equations can be read straight out of the rows of M (Gribb & Hartmann, 2001). No trigonometry, and it works for any projection:")}
      </p>
      <Equation label={tx(t, "oglCull_ghLabel", "Extracting planes from the view-projection matrix")}
        where={[
          [r`m_i`, tx(t, "oglCull_wRow", "row i of M = P·V (as a 4-vector)")],
          [r`(\mathbf n, d)`, tx(t, "oglCull_wPlane", "a plane: points with n·p + d ≥ 0 are inside")],
        ]}
        words={tx(t, "oglCull_ghWords", "Each side of the frustum is the last row of the matrix plus or minus one of the first three rows. Six additions and subtractions give all six planes.")}
        note={tx(t, "oglCull_ghNote", "Normalise each plane (divide by ‖n‖) so n·p + d is a true distance, which the sphere test needs. Pass M = P·V·Model instead and the planes come out in that object's local space.")}>
        {r`\begin{aligned}
\text{left} &= m_3 + m_0 & \text{right} &= m_3 - m_0 \\
\text{bottom} &= m_3 + m_1 & \text{top} &= m_3 - m_1 \\
\text{near} &= m_3 + m_2 & \text{far} &= m_3 - m_2
\end{aligned}`}
      </Equation>
      <Derivation t={t} label={tx(t, "oglCull_ghDer", "Where the left plane comes from")}
        steps={[
          { full: true, tex: r`(x_c,\ y_c,\ z_c,\ w_c) = M\,p = (m_0\cdot p,\ m_1\cdot p,\ m_2\cdot p,\ m_3\cdot p)`,
            why: tx(t, "oglCull_gd1", "each clip coordinate is one row of M dotted with the point p = (x, y, z, 1)") },
          { full: true, tex: r`-w_c \le x_c \iff m_3\cdot p + m_0\cdot p \ge 0`,
            why: tx(t, "oglCull_gd2", "the left side of the clip volume is x_c = −w_c. Move −w_c to the other side and write both coordinates as rows") },
          { full: true, tex: r`\iff (m_3 + m_0)\cdot p \ge 0`,
            why: tx(t, "oglCull_gd3", "the dot product distributes over addition, so the two rows add first") },
          { full: true, tex: r`(a, b, c, d)\cdot(x, y, z, 1) = ax + by + cz + d`,
            why: tx(t, "oglCull_gd4", "a 4-vector dotted with a point is a plane equation: n = (a, b, c) and d. The other five planes come the same way from x_c ≤ w_c, ±y_c and ±z_c") },
        ]} />
      <CodeBlock lang="cpp" filename="frustum.cpp" t={t}>{`struct Plane { glm::vec3 n; float d; };

std::array<Plane, 6> extractPlanes(const glm::mat4& m) {   // m = projection * view
    auto row = [&](int i) { return glm::vec4(m[0][i], m[1][i], m[2][i], m[3][i]); };  // GLM is column-major
    glm::vec4 r0 = row(0), r1 = row(1), r2 = row(2), r3 = row(3);
    glm::vec4 p[6] = { r3 + r0, r3 - r0, r3 + r1, r3 - r1, r3 + r2, r3 - r2 };
    std::array<Plane, 6> out;
    for (int i = 0; i < 6; ++i) {
        float len = glm::length(glm::vec3(p[i]));
        out[i] = { glm::vec3(p[i]) / len, p[i].w / len };
    }
    return out;
}`}</CodeBlock>

      <H2>{tx(t, "oglCull_testsTitle", "Testing bounding volumes")}</H2>
      <Equation label={tx(t, "oglCull_sphereLabel", "Sphere and AABB against a plane")}
        where={[
          [r`c,\ \rho`, tx(t, "oglCull_wSphere", "sphere centre and radius")],
          [r`\mathbf e`, tx(t, "oglCull_wExt", "AABB half-extents (from its centre c)")],
          [r`p^{+}`, tx(t, "oglCull_wPv", "the box corner furthest along n (the \"p-vertex\")")],
          [r`\mathbf n_i\cdot c + d_i`, tx(t, "oglCull_wDist", "signed distance from the centre to plane i: positive on the inside, negative outside")],
          [r`|\mathbf n_i|`, tx(t, "oglCull_wAbs", "the normal with every component made positive")],
        ]}
        words={tx(t, "oglCull_testWords", "Measure how far the centre is outside a plane. If it is further out than the volume's own reach toward that plane (the radius for a sphere, a projected radius for a box), the whole volume is outside.")}
        note={tx(t, "oglCull_testNote", "Test all six planes; outside any one of them means culled. The AABB form with |n| gives the box's projected radius onto n: that is the p-vertex test in one line and no branches. Both tests are conservative. Near the frustum's corners, a volume can be outside the frustum yet not fully behind any single plane, so it passes. That costs an extra draw, never a missing object.")}>
        {r`\begin{gathered} \text{sphere outside} \iff \exists\,i:\ \mathbf n_i\cdot c + d_i < -\rho \\[4pt] \text{AABB outside} \iff \exists\,i:\ \mathbf n_i\cdot c + d_i < -\,\mathbf e\cdot|\mathbf n_i| \end{gathered}`}
      </Equation>
      <Derivation t={t} label={tx(t, "oglCull_boxDer", "The box's radius along a normal")}
        steps={[
          { full: true, tex: r`\text{${tx(t, "oglCull_bdCorner", "corner")}} = c + (\pm e_x,\ \pm e_y,\ \pm e_z)`,
            why: tx(t, "oglCull_bd1", "an axis-aligned box has 8 corners: the centre plus or minus each half-extent") },
          { full: true, tex: r`\mathbf n\cdot\text{${tx(t, "oglCull_bdCorner", "corner")}} + d =(\mathbf n\cdot c + d) + (\pm n_x e_x \pm n_y e_y \pm n_z e_z)`,
            why: tx(t, "oglCull_bd2", "a corner's signed distance is the centre's plus the offset's projection onto n") },
          { full: true, tex: r`\begin{aligned} \max_{\pm}\,(\pm n_x e_x \pm n_y e_y \pm n_z e_z) &= |n_x| e_x + |n_y| e_y + |n_z| e_z \\ &= \mathbf e\cdot|\mathbf n| \end{aligned}`,
            why: tx(t, "oglCull_bd3", "the furthest corner along n picks each sign to make its term positive. That corner is p⁺, the p-vertex") },
          { full: true, tex: r`\mathbf n\cdot c + d + \mathbf e\cdot|\mathbf n| < 0 \iff \mathbf n\cdot c + d < -\,\mathbf e\cdot|\mathbf n|`,
            why: tx(t, "oglCull_bd4", "if even p⁺ is outside the plane, all eight corners are, and so is the box") },
        ]} />
      <LiveFormula label={tx(t, "oglCull_boxLive", "Try it: a box and its bounding sphere against one plane")}
        tex={r`\text{${tx(t, "oglCull_boxLiveOut", "outside")}} \iff \mathbf n\cdot c + d < -\,\mathbf e\cdot|\mathbf n| \qquad \text{${tx(t, "oglCull_boxLiveOr", "or")}} \qquad \mathbf n\cdot c + d < -\rho`}
        vars={[
          { id: "s", label: "n·c + d", min: -8, max: 4, step: 0.1, value: -3.1, fmt: v => v.toFixed(1) },
          { id: "phi", label: "φ", min: 0, max: 90, step: 1, value: 0, fmt: v => `${v}°` },
          { id: "ex", label: <>e<sub>x</sub></>, min: 0.5, max: 6, step: 0.1, value: 3, fmt: v => v.toFixed(1) },
          { id: "ey", label: <>e<sub>y</sub></>, min: 0.5, max: 6, step: 0.1, value: 1, fmt: v => v.toFixed(1) },
        ]}
        where={[
          [r`\varphi`, tx(t, "oglCull_wPhi", "direction of the plane's normal in the x–y plane: n = (cos φ, sin φ, 0)")],
          [r`\rho`, tx(t, "oglCull_wRhoBox", "radius of the sphere around the same box: the length of its half-diagonal")],
        ]}
        compute={boxNumbers(t)}
        note={tx(t, "oglCull_boxLiveNote", "A long, thin box (3 × 1) with the plane facing its long side: the box is culled once its centre is 3 units out, but its bounding sphere needs 3.16. Turn φ to 90° and the box only reaches 1 unit, while the sphere still reaches 3.16: between −1 and −3.16 the sphere keeps drawing an object that cannot be seen. Spheres are cheaper to store and test; boxes fit long objects much better.")} />
      <CodeBlock lang="cpp" filename="cull.cpp" t={t}>{`bool visible(const std::array<Plane, 6>& f, glm::vec3 c, glm::vec3 e) {
    for (const Plane& p : f) {
        float r = glm::dot(e, glm::abs(p.n));        // box "radius" along this normal
        if (glm::dot(p.n, c) + p.d < -r) return false;
    }
    return true;
}

visibleList.clear();
for (const Object& o : objects)
    if (visible(frustum, o.worldBounds.center, o.worldBounds.extent))
        visibleList.push_back(&o);`}</CodeBlock>
      <FrustumCullFigure t={t} />

      <H2>{tx(t, "oglCull_hierTitle", "Hierarchies: not testing everything")}</H2>
      <p>
        {tx(t, "oglCull_hierBody",
          "Testing 100 000 objects one by one is itself a cost. Group them in a spatial structure (a grid, an octree or a bounding volume hierarchy) and test the groups first. A group outside the frustum removes everything in it with one test, and a group fully inside accepts everything without further tests. Only groups that straddle a plane are opened. Data layout matters as much as the algorithm: store bounds in flat, contiguous arrays (structure of arrays), so the test loop streams through memory and vectorises.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "oglCull_gameDev", "Building and updating these structures for moving objects (quadtrees, loose octrees, BVH refits) is covered in the Game Dev track. Here the point is what they buy the renderer.")}
      </Callout>

      <H2>{tx(t, "oglCull_occTitle", "Occlusion culling: hidden behind something")}</H2>
      <p>
        {tx(t, "oglCull_occBody",
          "Frustum culling keeps everything inside the view, including the 500 rooms behind the wall in front of you. Occlusion culling removes objects hidden by other objects. The GPU can answer \"would any pixel of this pass the depth test?\" with an occlusion query. Drawing just the bounding box with colour and depth writes off, you get a sample count back:")}
      </p>
      <CodeBlock lang="cpp" filename="occlusion.cpp" t={t}>{`// Frame N: draw big occluders first, then test cheap proxies
glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE);
glDepthMask(GL_FALSE);
for (auto& o : candidates) {
    glBeginQuery(GL_ANY_SAMPLES_PASSED_CONSERVATIVE, o.query);
    drawBoundingBox(o);
    glEndQuery(GL_ANY_SAMPLES_PASSED_CONSERVATIVE);
}
glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_TRUE);
glDepthMask(GL_TRUE);

// Let the GPU decide, without a CPU round trip:
for (auto& o : candidates) {
    glBeginConditionalRender(o.query, GL_QUERY_NO_WAIT);   // draws if unsure (result not ready)
    drawObject(o);
    glEndConditionalRender();
}`}</CodeBlock>
      <LessonTable
        headers={[tx(t, "oglCull_thTech", "Technique"), tx(t, "oglCull_thHow", "How"), tx(t, "oglCull_thNote", "Trade-off")]}
        rows={[
          [tx(t, "oglCull_o1", "Occlusion queries + conditional render"), tx(t, "oglCull_o1h", "GPU tests proxies; draw is skipped on the GPU"), tx(t, "oglCull_o1n", "saves GPU work, not the CPU's draw call; one query per object")],
          [tx(t, "oglCull_o2", "Last frame's results"), tx(t, "oglCull_o2h", "read queries one frame late (no stall)"), tx(t, "oglCull_o2n", "objects appearing suddenly pop in one frame late")],
          [tx(t, "oglCull_o3", "Hi-Z (hierarchical depth) culling"), tx(t, "oglCull_o3h", "build a depth mip chain (max depth per texel); a compute shader tests each object's screen rectangle against it and writes an indirect draw list"), tx(t, "oglCull_o3n", "the modern GPU-driven standard; millions of objects, no CPU involvement")],
          [tx(t, "oglCull_o4", "Software rasterised occluders"), tx(t, "oglCull_o4h", "rasterise a few low-poly occluders on the CPU (SIMD) into a small depth buffer"), tx(t, "oglCull_o4n", "no GPU latency; used by Frostbite and Intel's Masked Occlusion Culling")],
          [tx(t, "oglCull_o5", "Portals / PVS"), tx(t, "oglCull_o5h", "precomputed cell-to-cell visibility for indoor levels"), tx(t, "oglCull_o5n", "nearly free at runtime; only for static, room-based levels (Quake, Source)")],
        ]}
      />
      <Equation label={tx(t, "oglCull_hizLabel", "Hi-Z test for one object")}
        where={[
          [r`R`, tx(t, "oglCull_wR", "the object's screen-space bounding rectangle, in pixels")],
          [r`R_w,\ R_h`, tx(t, "oglCull_wRwh", "the rectangle's width and height in pixels")],
          [r`\ell`, tx(t, "oglCull_wL2", "the mip level where one texel is at least as wide as R, so R touches at most 2×2 texels and 4 fetches suffice")],
          [r`\text{HiZ}_\ell`, tx(t, "oglCull_wHiz", "level ℓ of the Hi-Z chain: each texel holds the farthest depth of the 2ˡ × 2ˡ pixels under it")],
          [r`z_{near}`, tx(t, "oglCull_wZ", "the closest depth of the object's bounds")],
        ]}
        words={tx(t, "oglCull_hizWords", "Go down the depth pyramid until the object's rectangle fits inside one texel, read the 2×2 texels it can touch, and take the farthest depth. If the object's nearest point is behind even that, it is hidden.")}
        note={tx(t, "oglCull_hizNote", "Each Hi-Z texel stores the farthest depth of the pixels it covers. If even the nearest point of the object lies behind the farthest occluder depth in that area, every pixel of the object would fail the depth test.")}>
        {r`\begin{gathered} \ell = \left\lceil \log_2 \max(R_w, R_h) \right\rceil \\[6pt] \text{occluded} \iff z_{near} > \max_{2\times 2}\ \text{HiZ}_\ell(R) \end{gathered}`}
      </Equation>
      <LiveFormula label={tx(t, "oglCull_hizLive", "Try it: pick the Hi-Z level for a rectangle")}
        tex={r`\ell = \left\lceil \log_2 \max(R_w, R_h) \right\rceil`}
        vars={[
          { id: "w", label: <>R<sub>w</sub></>, min: 4, max: 512, step: 1, value: 40, fmt: v => `${v} px` },
          { id: "h", label: <>R<sub>h</sub></>, min: 4, max: 512, step: 1, value: 24, fmt: v => `${v} px` },
        ]}
        compute={hizNumbers(t)}
        note={tx(t, "oglCull_hizLiveNote", "A rectangle W texels wide, placed anywhere, can straddle ⌈W⌉ + 1 texels. At level ℓ it is at most 1 texel wide, so 2 per axis: 4 fetches cover it. One level finer it can be up to 2 texels wide and straddle 3, and a 2×2 read would miss the middle texel, which may hold a farther depth: the object would be called hidden while part of it shows. Some engines use the finer level on purpose and read 3×3 texels instead, for a tighter test.")} />
      <Callout type="warn" t={t}>
        {tx(t, "oglCull_pitfalls",
          "Cull with the object's world-space bounds and recompute them when it moves or animates. Skinned characters need bounds that cover every pose. Remember shadow passes: an object outside the camera frustum can still cast a shadow into it, so shadow maps are culled against the light's frustum (plus an extension toward the light), not the camera's. And freeze the culling camera while flying the real one away: it is the quickest way to see what is being culled.")}
      </Callout>

      <KeyIdeas t={t} id="oglCull" items={[
        "Culling skips whole objects using cheap bounds before any vertex work.",
        "The six frustum planes come straight from the rows of projection·view (Gribb–Hartmann).",
        "Sphere: outside if n·c + d < −r. AABB: outside if n·c + d < −e·|n|. Both are conservative.",
        "Hierarchies (grid, octree, BVH) reject or accept whole groups with one test.",
        "Occlusion culling removes hidden objects: queries + conditional render, or GPU-driven Hi-Z.",
      ]} />
    </Article>
  );
}

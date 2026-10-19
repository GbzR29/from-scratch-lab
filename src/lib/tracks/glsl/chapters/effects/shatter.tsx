// src/lib/tracks/glsl/chapters/effects/shatter.tsx
"use client";

import { Callout, CodeBlock, H2, H3 } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { FlawFigure } from "@/components/lesson/figures/shatter/FlawFigure";
import { CrackFigure } from "@/components/lesson/figures/shatter/CrackFigure";
import { griffithNumbers } from "../../live/shatter";
import { FacesSection, FlySection, BakeSection } from "./shatterFly";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Cracks & Shattering
// ═════════════════════════════════════════════════════════════════════════════

export function ShatterContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslShatter_intro",
          "Breaking glass is one of the most satisfying effects in a game, and one of the most physical: a stone hits a window, a star of cracks runs out from the impact faster than the eye can follow, and the pane falls apart in long, sharp wedges, or, if it was tempered, in a shower of small cubes. This chapter starts with why glass breaks so easily, then draws the cracks in a fragment shader with Voronoi cells, and ends by throwing thousands of shards around with a vertex shader, first with a formula, then with a texture that remembers a whole simulation.")}
      </Lead>

      <Goals t={t} id="glslShatter" items={[
        "Explain why glass breaks at about 1% of its ideal strength, with Inglis's stress concentration and Griffith's energy balance.",
        "Tell window glass from tempered glass by how it breaks, and say where the difference comes from.",
        "Draw spiderweb and diced cracks from Voronoi cells, in a warped space, spreading from the impact over time.",
        "Animate every shard of a broken pane in one draw call, first in closed form, then from a vertex animation texture.",
      ]} />

      <StrengthSection t={t} />
      <PatternSection t={t} />
      <ShaderSection t={t} />
      <FacesSection t={t} />
      <FlySection t={t} />
      <BakeSection t={t} />

      <KeyIdeas t={t} id="glslShatter" items={[
        "Perfect glass would hold about 7 GPa; real glass breaks at 30–100 MPa, because tiny flaws concentrate the stress at their tips by 1 + 2a/b.",
        "Griffith: a crack grows when the elastic energy it frees beats the energy of the two new surfaces, σf = √(2Eγ/πa). Bigger flaws, weaker glass, and once it starts, it runs.",
        "Window glass breaks in a spiderweb: radial cracks from the bending under the impact first, rings later. Tempered glass stores stress and dices into small blunt cubes.",
        "Cracks in a shader are Voronoi borders. The border distance comes from a second pass over the neighbours, measured along the line between the two seeds.",
        "Computing the Voronoi in log-polar space around the impact turns square cells into wedges that grow with distance: the spiderweb in one change of coordinates.",
        "Spreading is a comparison: a border is broken once the crack front v·t has passed it. Each shard gets its own small tilt, so it shows the world shifted.",
        "Fracture faces look green because there you look along the glass, through centimetres of it, and Beer–Lambert does the rest.",
        "All shards are one mesh; every vertex stores its shard's number and its position around the shard's centre, and the vertex shader moves the whole shard.",
        "A closed form (c₀ + v·t + ½g·t², a steady spin) is free but knows nothing of the floor; a vertex animation texture replays a simulation baked once, at the cost of memory and freedom.",
      ]} />
    </Article>
  );
}

// ── Why glass breaks ──────────────────────────────────────────────────────────

function StrengthSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslShatter_strengthTitle", "Why glass breaks so easily")}</H2>
      <p>
        {tx(t, "glslShatter_strengthBody",
          "Pulling a solid apart means pulling its atoms apart, and the bonds in glass are strong. A rough estimate of the stress needed to break them all at once is a tenth of the stiffness, E/10: for glass, with E = 70 GPa, about 7 GPa, more than the best steel. Freshly drawn glass fibres come close to it. A window breaks at 30 to 100 MPa, a hundred times less. The difference is not in the bonds but in tiny flaws: scratches, dust pits and microscopic cracks a few micrometres long, all over the surface.")}
      </p>
      <p>
        {tx(t, "glslShatter_inglisBody",
          "A flaw carries no load, so the load has to go around it, and it crowds at its ends. For an elliptical hole of half length a across the pull and half height b, Charles Inglis worked out in 1913 how much:")}
      </p>
      <Equation label={tx(t, "glslShatter_inglisLabel", "Stress at the tip of a flaw (Inglis)")}
        where={[
          [r`\sigma`, tx(t, "glslShatter_wSigma", "the stress applied far away: force per area pulling the plate")],
          [r`\sigma_{tip}`, tx(t, "glslShatter_wTip", "the stress at the end of the flaw")],
          [r`a,\ b`, tx(t, "glslShatter_wAB", "the flaw's half length across the pull and its half height along it")],
          [r`\rho`, tx(t, "glslShatter_wRho", "the radius of the rounded tip, b²/a")],
        ]}
        words={tx(t, "glslShatter_inglisWords", "A round hole (a = b) triples the stress. A crack is an extremely thin ellipse: a flaw 1 µm long whose tip is as sharp as a few atoms (ρ ≈ 0.5 nm) multiplies the stress about 90 times. The plate sees 70 MPa; the bonds at the tip see 6 GPa, and give way.")}>
        {r`\sigma_{tip} = \sigma\left(1 + \frac{2a}{b}\right) = \sigma\left(1 + 2\sqrt{\frac{a}{\rho}}\right)`}
      </Equation>
      <FlawFigure t={t} />
      <H3>{tx(t, "glslShatter_griffithTitle", "Griffith: when a crack runs")}</H3>
      <p>
        {tx(t, "glslShatter_griffithBody",
          "Inglis says the tip is overloaded, but every crack's tip is infinitely sharp in his formula, so it cannot say which cracks grow. Alan Griffith answered in 1921 with energy. A stretched plate stores elastic energy. When a crack grows, the material next to it relaxes and gives some of that energy back; but making the crack longer also creates two new surfaces, and surfaces cost energy, γ per square metre. The crack grows only when it pays for itself:")}
      </p>
      <Derivation t={t} label={tx(t, "glslShatter_griffithDer", "Griffith's energy balance")}
        where={[
          [r`a`, tx(t, "glslShatter_wA", "half the crack's length (the crack is 2a long)")],
          [r`E`, tx(t, "glslShatter_wE", "Young's modulus, the stiffness: 70 GPa for window glass")],
          [r`\gamma`, tx(t, "glslShatter_wGamma", "the energy per area of a new surface; for glass about 4 J/m² once the work done near the tip is counted")],
          [r`U`, tx(t, "glslShatter_wU", "energy, per metre of the plate's thickness")],
        ]}
        steps={[
          { full: true, tex: r`U_{elastic} = -\frac{\pi\,\sigma^2 a^2}{E}`,
            why: tx(t, "glslShatter_g1", "the elastic energy the plate gives back around a crack of length 2a: roughly a disc of radius a that no longer carries load, holding σ²/2E per unit volume (the exact factor π comes from the elastic solution)") },
          { full: true, tex: r`U_{surface} = 2 \cdot 2a \cdot \gamma = 4a\gamma`,
            why: tx(t, "glslShatter_g2", "the cost: a crack 2a long has two faces, top and bottom") },
          { full: true, tex: r`\frac{d}{da}\left(4a\gamma - \frac{\pi\sigma^2 a^2}{E}\right) = 4\gamma - \frac{2\pi\sigma^2 a}{E}`,
            why: tx(t, "glslShatter_g3", "how the total changes if the crack grows a little. The surface cost grows like a, the energy freed like a², so for a long enough crack the second term always wins") },
          { full: true, tex: r`4\gamma - \frac{2\pi\sigma^2 a}{E} < 0 \;\Rightarrow\; \sigma > \sigma_f = \sqrt{\frac{2E\gamma}{\pi a}}`,
            why: tx(t, "glslShatter_g4", "the crack grows when growing lowers the total energy: that is the stress at which the glass breaks, for a flaw of half length a") },
          { full: true, tex: r`K_{IC} = \sigma_f\sqrt{\pi a} = \sqrt{2E\gamma} \approx 0.75\ \text{MPa}\sqrt{\text{m}}`,
            why: tx(t, "glslShatter_g5", "the right side depends only on the material: engineers call it the fracture toughness. Measured for window glass, it is about 0.75 MPa·√m") },
        ]} />
      <LiveFormula label={tx(t, "glslShatter_liveGriffith", "Try it: how strong is this glass?")}
        tex={r`\sigma_f = \sqrt{\frac{2E\gamma}{\pi a}}`}
        vars={[
          { id: "lg", label: "a", min: -1, max: 3, step: 0.05, value: 2, fmt: v => `${Number((10 ** v).toPrecision(2))} µm` },
        ]}
        compute={griffithNumbers(t)}
        note={tx(t, "glslShatter_liveGriffithNote", "A window's worst flaw is around 100 µm, which gives 40–50 MPa, just what windows are designed for. Flaws of a tenth of a micrometre would make glass as strong as steel; that is why fresh fibres are so strong, and why a glass cutter only has to scratch the surface: it plants one big flaw where you want the break.")} />
      <p>
        {tx(t, "glslShatter_runBody",
          "Notice what happens once a crack starts: a grows, so σf drops, and the same load is now far above it. The crack accelerates until it runs at about 1500 m/s in window glass (about a quarter of the speed of sound in it), and at that speed it becomes unstable and splits in two, again and again. That is where the branching star comes from, and why the whole thing is over in well under a millisecond.")}
      </p>
    </>
  );
}

// ── Spiderwebs and dice ───────────────────────────────────────────────────────

function PatternSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslShatter_patternTitle", "Spiderwebs and dice")}</H2>
      <p>
        {tx(t, "glslShatter_annealedBody",
          "A stone pushes the middle of a window in, and the pane bends like a shallow cone. Bending squeezes the face the stone hits and stretches the opposite face, and glass fails in tension, so the first cracks start on the far side, right under the impact, and run outwards: the radial cracks. The pane is now a set of wedges held at their outer ends. Pushed further, each wedge bends near its outer end the other way, and a second family of cracks runs across the wedges, roughly in circles: the concentric cracks. They come later, and they cross only some of the wedges.")}
      </p>
      <p>
        {tx(t, "glslShatter_temperedBody",
          "Tempered glass is heated close to softening and then its surfaces are blown cold. The skin hardens first; when the core cools and shrinks afterwards, it pulls the skin into compression (about 100 MPa) and is itself left in tension. Now a scratch on the surface has to overcome that compression before it can open, which makes the pane four or five times stronger. But the stored energy is a trap: once a crack reaches the core, the tension there drives it everywhere at once, branching all the time, and the pane turns into thousands of small, blunt cubes. That is a safety feature: cubes do not cut like wedges. Car side windows and shower doors are tempered.")}
      </p>
      <Equation label={tx(t, "glslShatter_energyLabel", "Energy stored in tempered glass")}
        where={[
          [r`u`, tx(t, "glslShatter_wu", "elastic energy per cubic metre of glass")],
          [r`\sigma_t`, tx(t, "glslShatter_wSt", "the tension locked in the core, about 50 MPa")],
          [r`E`, tx(t, "glslShatter_wE2", "the stiffness, 70 GPa")],
        ]}
        words={tx(t, "glslShatter_energyWords", "About 18 kJ in every cubic metre, ready to be spent on new surfaces. The more energy there is to spend, the more surface the pane can afford, and the smaller the pieces: the size of the dice falls roughly as 1/σt². Annealed window glass stores nothing, so it cracks only as far as the stone's energy reaches.")}>
        {r`u = \frac{\sigma_t^2}{2E} = \frac{(50\times10^6)^2}{2 \cdot 70\times10^9} \approx 18\ \text{kJ/m}^3`}
      </Equation>
    </>
  );
}

// ── Cracks in a shader ────────────────────────────────────────────────────────

function ShaderSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslShatter_voronoiTitle", "Cracks from Voronoi cells")}</H2>
      <p>
        {tx(t, "glslShatter_voronoiBody",
          "Scatter points (seeds) over the plane and give every pixel to its nearest seed: the regions you get are Voronoi cells, convex polygons with straight borders, and they look remarkably like shards. In a shader the seeds come from the same trick as the snowflakes and raindrops: cut the plane into unit cells, put one seed in each at a hashed offset, and search the 3×3 neighbouring cells for the nearest one. That first search finds the shard a pixel belongs to. For the cracks we also need the distance to the nearest border, and that takes a second search:")}
      </p>
      <Equation label={tx(t, "glslShatter_borderLabel", "Distance to a Voronoi border")}
        where={[
          [r`\mathbf{m}`, tx(t, "glslShatter_wM", "the vector from the pixel to its own (nearest) seed")],
          [r`\mathbf{s}`, tx(t, "glslShatter_wS", "the vector from the pixel to one of the other seeds around it")],
          [r`d`, tx(t, "glslShatter_wD", "the distance from the pixel to the border between the two cells")],
        ]}
        words={tx(t, "glslShatter_borderWords", "The border between two cells is the line halfway between their seeds, perpendicular to the line joining them. So measure along that joining line: how far is the pixel from the midpoint, in the direction from one seed to the other? Take the smallest d over the neighbours. The obvious shortcut, the second-nearest distance minus the nearest, gives wavy lines of the wrong width near corners.")}
        glsl={`float d = dot(0.5 * (m + s), normalize(s - m));`}>
        {r`d = \tfrac{1}{2}(\mathbf{m} + \mathbf{s}) \cdot \frac{\mathbf{s} - \mathbf{m}}{\lVert \mathbf{s} - \mathbf{m} \rVert}`}
      </Equation>
      <H3>{tx(t, "glslShatter_warpTitle", "A spiderweb is Voronoi in a different space")}</H3>
      <p>
        {tx(t, "glslShatter_warpBody",
          "Uniform cells give tempered glass straight away: make them small, and every border is a crack. Window glass needs wedges that point at the impact and grow with distance. Instead of changing the cells, change the space they are computed in. Measure each pixel by its angle θ around the impact and by the logarithm of its distance r, and run the same Voronoi there:")}
      </p>
      <Equation label={tx(t, "glslShatter_warpLabel", "Log-polar coordinates around the impact")}
        where={[
          [r`r,\ \theta`, tx(t, "glslShatter_wRT", "the pixel's distance from the impact and its angle around it")],
          [r`r_0`, tx(t, "glslShatter_wR0", "the radius of the crushed zone right under the stone")],
          [r`S`, tx(t, "glslShatter_wSS", "rings per e-fold of distance: how many cells fit while r grows by a factor e ≈ 2.7")],
          [r`N`, tx(t, "glslShatter_wN", "the number of cells around the circle: about the number of radial cracks")],
        ]}
        words={tx(t, "glslShatter_warpWords", "A step of 1 in q is a step of r/S along the radius and of 2πr/N around it: both grow with r, so the cells grow with distance and keep their shape. With S small compared with N/2π, each cell is a long wedge. Borders across θ are the radial cracks, borders across ln r are the rings. θ wraps around, so the hash uses the cell's index modulo N, and the seeds meet up seamlessly behind the impact.")}
        glsl={`vec2 q = vec2(S * log(r / r0), N * atan(d.y, d.x) / TAU);\nvec2 id = vec2(cell.x, mod(cell.y, N));   // the same cell all the way round`}>
        {r`\mathbf{q} = \left(S\,\ln\frac{r}{r_0},\ \ N\,\frac{\theta}{2\pi}\right)`}
      </Equation>
      <p>
        {tx(t, "glslShatter_backBody",
          "One catch: the border distance d is measured in q, but the crack line must be drawn a fixed number of pixels wide on the pane. Going back is a matter of how much q changes per unit of distance on the pane. Along the border's normal n (in q), one unit of the pane changes n·q by √((n_x S)² + (n_y N/2π)²)/r, so dividing by that turns d into a distance on the pane, and dividing again by the size of a pixel gives pixels.")}
      </p>
      <H3>{tx(t, "glslShatter_spreadTitle", "Spreading, and the shards themselves")}</H3>
      <p>
        {tx(t, "glslShatter_spreadBody",
          "The crack front is a circle growing from the impact, r = v·t. A border is broken once the front has passed it, with a small hashed delay per border so the cracks do not all arrive in a perfect circle. The ring borders break only after the front is well past them, and only a fraction of them break at all (a hash of the two cells decides). To classify a border, look at its normal in q: mostly along ln r means a ring. Each piece that has broken free gets its own small tilt, larger near the impact where the pane was dished in most, and a tilted shard does two things: it shows the scene behind shifted (the same shift-by-slope as the raindrop lens), and it reflects the light at its own angle.")}
      </p>
      <CodeBlock lang="glsl" filename="cracks" t={t}>{`vec2 b = cracks(q, r, id, nid, seed);           // b.x = distance to the border on the pane, b.y = 1 for a ring
float h = hash1(id + nid);                        // the same number seen from either side of the border
float front = uTime * uSpeed;
float broken = b.y < 0.5 ? step(r, front * (0.8 + 0.4 * h))          // radial: first, as the front passes
                         : step(h, uRingKeep) * step(r * 1.6, front); // rings: later, and only some

vec2 tilt = rs < front ? dir * 0.7 * exp(-rs / 0.35) * (0.6 + 0.8 * hs.x) : vec2(0.0);
vec3 col = scene(p + tilt * uLens);                                  // the garden, seen through a tilted shard
float line = broken * (1.0 - smoothstep(w * 0.5, w + 0.6, b.x / pixel));
col = mix(col, edgeColour, line);`}</CodeBlock>
      <CrackFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "glslShatter_decalTip", "Games rarely compute cracks per pixel over a whole screen. A bullet hole in a window is usually a decal: a small square texture of a crack star, stamped where the bullet hit, sometimes with a normal map so the cracks catch the light. The Voronoi shader is what makes those textures, or what draws the cracks when they have to grow on screen.")}
      </Callout>
    </>
  );
}

"use client";

// Geometry 8: polyhedra — faces, edges and vertices; prisms and pyramids by
// formula (n sides of the base); counting every edge twice (from the faces,
// from the vertices); Euler's relation V − E + F = 2 used as a tool (the proof
// lives in planar-coloring); solving for a missing count; cutting the corners
// (V' = 2E, E' = 3E, F' = F + V, the football); the five regular solids;
// orthogonal views (top, front, side) and projections onto coordinate planes.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { Related } from "@/components/lesson/Related";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { PolyhedronFigure } from "@/components/lesson/figures/math/PolyhedronFigure";
import { SolidViewsFigure } from "@/components/lesson/figures/math/SolidViewsFigure";

const r = String.raw;

export function PolyhedraContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "mPoly_intro",
          "A dice, a brick, a pyramid in Egypt, a football, a crystal of salt: all of them are solids bounded by flat polygons. Such a solid is a polyhedron, and the first questions about one are counting questions. How many faces, how many edges, how many corners? This chapter counts them without drawing every piece: with formulas for prisms and pyramids, with the trick of counting each edge twice, and with a relation Euler found in 1750 that ties the three numbers together. It ends with the other everyday skill about solids: reading and drawing them from above, from the front and from the side.")}
      </Lead>

      <Goals t={t} id="mPoly" items={[
        "Name the faces, edges and vertices of a polyhedron and count them.",
        "Give V, E and F of any prism or pyramid from the number of sides of its base.",
        "Find the number of edges by adding the sides of the faces, or the edges at each vertex.",
        "Use Euler's relation V − E + F = 2 to find a missing count.",
        "Draw and read the top, front and side views of a solid.",
      ]} />

      <H2>{tx(t, "mPoly_whatTitle", "Faces, edges and vertices")}</H2>
      <p>
        {tx(t, "mPoly_whatBody",
          "A polyhedron (Greek for \"many seats\") is a solid whose surface is made of flat polygons. Each polygon is a face. Two faces meet along a segment, an edge, and every edge belongs to exactly two faces. The points where edges meet are the vertices, the corners. The counts are written V (vertices), E (edges) and F (faces). A cube has 8 vertices, 12 edges and 6 faces. A polyhedron is convex when it has no dents: the segment between any two of its points stays inside it. A dice and a pyramid are convex; a star-shaped solid is not.")}
      </p>
      <PolyhedronFigure t={t} />
      <p>
        {tx(t, "mPoly_figRead",
          "In the figure, switch between faces, edges and vertices to see each set on its own, and turn the solid: the dashed lines are edges behind it. Counting by eye works for a cube and fails quickly for a dodecahedron. The rest of the chapter replaces counting with reasoning.")}
      </p>

      <H2>{tx(t, "mPoly_prismTitle", "Prisms and pyramids by formula")}</H2>
      <p>
        {tx(t, "mPoly_prismBody",
          "A prism has two equal polygons, its bases, joined by a band of parallelograms (rectangles when it stands upright). A pyramid has one base and a single top vertex, the apex, joined to every corner of the base by triangles. Both are named after the base: a pentagonal prism has pentagons as bases. If the base has n sides, every count follows from n. For the prism: n vertices on each base, so 2n; n edges around each base plus n edges going up, so 3n; n side faces plus 2 bases, so n + 2. For the pyramid: n base vertices plus the apex; n base edges plus n edges up to the apex; n triangles plus the base.")}
      </p>
      <Equation label={tx(t, "mPoly_eqPrism", "Prism and pyramid with an n-sided base")}
        where={[
          [r`n`, tx(t, "mPoly_wN", "the number of sides of the base polygon (3 for a triangle, 6 for a hexagon)")],
          [r`V`, tx(t, "mPoly_wV", "the number of vertices, the corners")],
          [r`E`, tx(t, "mPoly_wE", "the number of edges, the segments where two faces meet")],
          [r`F`, tx(t, "mPoly_wF", "the number of faces, the flat polygons")],
        ]}
        words={tx(t, "mPoly_prismWords", "A prism doubles the base and joins the copies: twice the corners, three times the edges, the sides plus two faces. A pyramid adds one point on top: one more corner, twice the edges, the sides plus one face.")}
        note={tx(t, "mPoly_prismNote", "Example: a hexagonal prism (a pencil) has V = 12, E = 18, F = 8; a square pyramid has V = 5, E = 8, F = 5.")}>
        {r`\text{prism: } V = 2n,\ E = 3n,\ F = n + 2 \qquad \text{pyramid: } V = n + 1,\ E = 2n,\ F = n + 1`}
      </Equation>
      <LessonTable
        headers={[tx(t, "mPoly_tSolid", "Solid"), "n", "V", "E", "F"]}
        rows={[
          [tx(t, "mPoly_s1", "triangular prism"), "3", "6", "9", "5"],
          [tx(t, "mPoly_s2", "cube (square prism)"), "4", "8", "12", "6"],
          [tx(t, "mPoly_s3", "hexagonal prism"), "6", "12", "18", "8"],
          [tx(t, "mPoly_s4", "triangular pyramid"), "3", "4", "6", "4"],
          [tx(t, "mPoly_s5", "square pyramid"), "4", "5", "8", "5"],
          [tx(t, "mPoly_s6", "hexagonal pyramid"), "6", "7", "12", "7"],
        ]}
      />

      <H2>{tx(t, "mPoly_twiceTitle", "Count every edge twice")}</H2>
      <p>
        {tx(t, "mPoly_twiceBody",
          "Most solids in exercises are neither prisms nor pyramids, and the question gives the faces instead: \"a solid has 12 pentagonal faces and 20 hexagonal faces\". Go round each face and count its sides. Every side is an edge, but every edge is a side of two faces, so this count meets each edge exactly twice. The same double count works from the corners: at each vertex count the edges that meet there (the degree of the vertex); every edge has two ends, so the total is again 2E.")}
      </p>
      <Equation label={tx(t, "mPoly_eqTwice", "Edges from the faces, and from the vertices")}
        where={[
          [r`F_k`, tx(t, "mPoly_wFk", "the number of faces with k sides (F₃ triangles, F₄ quadrilaterals, …)")],
          [r`V_k`, tx(t, "mPoly_wVk", "the number of vertices where exactly k edges meet")],
          [r`2E`, tx(t, "mPoly_w2E", "every edge counted twice: once for each of its two faces, or once for each of its two ends")],
        ]}
        words={tx(t, "mPoly_twiceWords", "Add up the sides of all the faces: you get twice the number of edges. Add up the edges at all the corners: twice the number of edges again.")}>
        {r`2E = 3F_3 + 4F_4 + 5F_5 + \cdots \qquad 2E = 3V_3 + 4V_4 + 5V_5 + \cdots`}
      </Equation>
      <Derivation t={t} label={tx(t, "mPoly_eqBall", "The football: 12 pentagons and 20 hexagons")}
        steps={[
          { tex: r`2E = 12 \cdot 5 + 20 \cdot 6 = 60 + 120 = 180`, full: true, why: tx(t, "mPoly_b1", "add the sides of all the faces: each pentagon has 5, each hexagon 6") },
          { tex: r`E = 90`, full: true, why: tx(t, "mPoly_b2", "each edge was counted twice, so halve the total") },
          { tex: r`3V = 2E = 180 \;\Rightarrow\; V = 60`, full: true, why: tx(t, "mPoly_b3", "at every corner of a football 3 edges meet (two hexagons and a pentagon), so the corners count each edge twice too") },
          { tex: r`V - E + F = 60 - 90 + 32 = \green{2}`, full: true, why: tx(t, "mPoly_b4", "F = 12 + 20 = 32; the check of the next section comes out right") },
        ]} />
      <Callout type="tip" t={t}>
        {tx(t, "mPoly_twiceTip", "If adding the sides of the faces gives an odd number, the solid cannot exist: 2E is always even. Exercises sometimes ask exactly that.")}
      </Callout>

      <H2>{tx(t, "mPoly_eulerTitle", "Euler's relation")}</H2>
      <p>
        {tx(t, "mPoly_eulerBody",
          "Add the vertices, take away the edges, add the faces. For the cube, 8 − 12 + 6 = 2; for the football, 60 − 90 + 32 = 2; for every polyhedron in the figure, 2. Leonhard Euler noticed this in 1750, and it holds for every convex polyhedron. The idea of the proof: look at the solid through one face, very close, and its edges become a flat drawing with no crossings, in which the face you look through is the outside. Building that drawing one edge at a time never changes V − E + F. The full proof is in the Planar Graphs chapter of the Discrete Mathematics section; here the relation is a tool.")}
      </p>
      <Equation label={tx(t, "mPoly_eqEuler", "Euler's relation for polyhedra")}
        where={[
          [r`V`, tx(t, "mPoly_wV2", "vertices")],
          [r`E`, tx(t, "mPoly_wE2", "edges")],
          [r`F`, tx(t, "mPoly_wF2", "faces")],
        ]}
        words={tx(t, "mPoly_eulerWords", "For any convex polyhedron, corners minus edges plus faces is 2. Knowing two of the three numbers gives the third.")}
        note={tx(t, "mPoly_eulerNote", "It holds for every convex polyhedron, and for many that are not convex, but not for all: a square picture frame made of 16 four-sided faces, with a hole through the middle, has V = 16, E = 32, F = 16 and V − E + F = 0. A solid with a tunnel through it breaks the relation.")}>
        {r`V - E + F = 2`}
      </Equation>

      <H3>{tx(t, "mPoly_solveTitle", "Finding the missing count")}</H3>
      <p>
        {tx(t, "mPoly_solveBody",
          "The standard exercise gives the faces and asks for the vertices. Two steps: the faces give E by the double count, then Euler gives V. A convex polyhedron has 8 triangular faces and 6 square faces. How many vertices?")}
      </p>
      <Derivation t={t} label={tx(t, "mPoly_eqSolve", "8 triangles and 6 squares: how many vertices?")}
        steps={[
          { tex: r`F = 8 + 6 = 14`, full: true, why: tx(t, "mPoly_v1", "all the faces together") },
          { tex: r`2E = 8 \cdot 3 + 6 \cdot 4 = 48 \;\Rightarrow\; E = 24`, full: true, why: tx(t, "mPoly_v2", "the sides of all the faces count each edge twice") },
          { tex: r`V = 2 + E - F = 2 + 24 - 14 = \green{12}`, full: true, why: tx(t, "mPoly_v3", "Euler's relation solved for V") },
        ]} />
      <p>
        {tx(t, "mPoly_solveCheck",
          "The solid is real: it is the cube with its corners cut off halfway along each edge (the cuboctahedron), and at each of its 12 vertices 4 edges meet, so 4 · 12 = 48 = 2E. A second count that agrees is the best check.")}
      </p>

      <H2>{tx(t, "mPoly_cutTitle", "Cutting the corners")}</H2>
      <p>
        {tx(t, "mPoly_cutBody",
          "Saw off every corner of a polyhedron, a little way along each edge. Each old corner leaves a new small face, a polygon with as many sides as there were edges meeting there. Each old edge loses both its ends but keeps its middle piece, and gets one new vertex at each end. Press \"cut the corners\" in the figure and follow the counts. The new numbers, marked with a prime, come straight from the old ones.")}
      </p>
      <Derivation t={t} label={tx(t, "mPoly_eqCut", "The counts after cutting every corner")}
        steps={[
          { tex: r`V' = 2E`, full: true, why: tx(t, "mPoly_c1", "the new vertices are the cut points, two on every old edge") },
          { tex: r`F' = F + V`, full: true, why: tx(t, "mPoly_c2", "every old face stays (with more sides), and every old corner becomes a new face") },
          { tex: r`E' = E + 2E = 3E`, full: true, why: tx(t, "mPoly_c3", "the old edges stay, shortened; the new faces add edges equal to the sum of the corner degrees, which is 2E") },
          { tex: r`V' - E' + F' = 2E - 3E + F + V = V - E + F = \green{2}`, full: true, why: tx(t, "mPoly_c4", "the relation survives the cut, as it must") },
        ]} />
      <p>
        {tx(t, "mPoly_cutBall",
          "Cut the 12 corners of an icosahedron (20 triangles, 5 meeting at each corner) a third of the way along each edge: the triangles become hexagons, the corners become 12 pentagons. V' = 2 · 30 = 60, E' = 3 · 30 = 90, F' = 20 + 12 = 32. That is the football of the earlier example, and its official name is the truncated icosahedron.")}
      </p>

      <H2>{tx(t, "mPoly_regTitle", "The five regular solids")}</H2>
      <p>
        {tx(t, "mPoly_regBody",
          "A polyhedron is regular when all its faces are the same regular polygon and the same number of faces meet at every vertex. There are only five, known as the Platonic solids. The faces at one corner must add up to less than 360°, or they would lie flat: three, four or five equilateral triangles (60° each), three squares (90°) or three regular pentagons (108°) are the only options. The Planar Graphs chapter proves the same thing from Euler's relation.")}
      </p>
      <LessonTable
        headers={[tx(t, "mPoly_tSolid", "Solid"), tx(t, "mPoly_tFace", "Face"), tx(t, "mPoly_tAt", "Faces at each vertex"), "V", "E", "F"]}
        rows={[
          [tx(t, "mPoly_r1", "tetrahedron"), tx(t, "mPoly_fTri", "triangle"), "3", "4", "6", "4"],
          [tx(t, "mPoly_r2", "cube (hexahedron)"), tx(t, "mPoly_fSq", "square"), "3", "8", "12", "6"],
          [tx(t, "mPoly_r3", "octahedron"), tx(t, "mPoly_fTri", "triangle"), "4", "6", "12", "8"],
          [tx(t, "mPoly_r4", "dodecahedron"), tx(t, "mPoly_fPent", "pentagon"), "3", "20", "30", "12"],
          [tx(t, "mPoly_r5", "icosahedron"), tx(t, "mPoly_fTri", "triangle"), "5", "12", "30", "20"],
        ]}
      />
      <p>
        {tx(t, "mPoly_dual",
          "Look at the columns: the cube and the octahedron swap V and F, and so do the dodecahedron and the icosahedron. Put a point at the centre of every face of a cube and join neighbouring points: you get an octahedron. Such pairs are called dual. The name of each solid counts its faces: tetra 4, hexa 6, octa 8, dodeca 12, icosa 20.")}
      </p>

      <H2>{tx(t, "mPoly_viewTitle", "Top, front and side: orthogonal views")}</H2>
      <p>
        {tx(t, "mPoly_viewBody",
          "Plans for a building or a machine part do not draw the solid in perspective. They draw what you see looking straight at it from three directions: from above (the top view, or plan), from the front, and from one side. Each view is an orthogonal projection: every point of the solid moves straight towards a flat wall, along lines perpendicular to it, and lands where it hits. Depth is lost, so a view shows only the outline in that direction, and whatever stands behind something taller disappears.")}
      </p>
      <SolidViewsFigure t={t} />
      <p>
        {tx(t, "mPoly_viewRead",
          "In the figure, each column of the front view shows the tallest stack in that column, wherever it stands; the side view does the same for each row. Try to build two different solids with the same front view: it is easy, which is why one view is never enough to describe a solid. Seen from the right, the front of the solid is on the left of the picture.")}
      </p>
      <LessonTable
        headers={[tx(t, "mPoly_tSolid", "Solid"), tx(t, "mPoly_tTop", "Top view"), tx(t, "mPoly_tFront", "Front view"), tx(t, "mPoly_tSide", "Side view")]}
        rows={[
          [tx(t, "mPoly_vw1", "upright cylinder"), tx(t, "mPoly_vCircle", "circle"), tx(t, "mPoly_vRect", "rectangle"), tx(t, "mPoly_vRect", "rectangle")],
          [tx(t, "mPoly_vw2", "upright cone"), tx(t, "mPoly_vCircleDot", "circle with its centre marked (the apex)"), tx(t, "mPoly_vTri", "triangle"), tx(t, "mPoly_vTri", "triangle")],
          [tx(t, "mPoly_vw3", "sphere"), tx(t, "mPoly_vCircle", "circle"), tx(t, "mPoly_vCircle", "circle"), tx(t, "mPoly_vCircle", "circle")],
          [tx(t, "mPoly_vw4", "square pyramid"), tx(t, "mPoly_vSqX", "square with its two diagonals (the slanted edges)"), tx(t, "mPoly_vTri", "triangle"), tx(t, "mPoly_vTri", "triangle")],
          [tx(t, "mPoly_vw5", "triangular prism lying on a side (a tent)"), tx(t, "mPoly_vRectLine", "rectangle split by a line (the ridge)"), tx(t, "mPoly_vTri", "triangle"), tx(t, "mPoly_vRect", "rectangle")],
        ]}
      />
      <H3>{tx(t, "mPoly_projTitle", "Projecting onto the coordinate planes")}</H3>
      <p>
        {tx(t, "mPoly_projBody",
          "With coordinates the views become very simple. Put the solid in space with x to the right, y up and z towards you. Projecting onto a coordinate plane just forgets one coordinate: the top view keeps x and z, the front view keeps x and y, the side view keeps y and z. A segment parallel to the wall keeps its length; a tilted one comes out shorter, multiplied by the cosine of its angle with the wall; one pointing straight at the wall shrinks to a point. In the same way a circle tilted towards you looks like an ellipse, and seen edge-on it is a segment.")}
      </p>
      <Equation label={tx(t, "mPoly_eqProj", "Orthogonal projection onto the coordinate planes")}
        where={[
          [r`(x, y, z)`, tx(t, "mPoly_wP", "a point of the solid: x to the right, y up, z towards the viewer")],
          [r`\ell\cos\theta`, tx(t, "mPoly_wCos", "the projected length of a segment of length ℓ that makes the angle θ with the plane")],
        ]}
        words={tx(t, "mPoly_projWords", "Each view drops the coordinate along which you are looking. A segment shrinks by the cosine of its tilt.")}
        note={tx(t, "mPoly_projNote", "Example: a rod 2 m long tilted 60° from the floor casts a shadow at noon (light straight down) of 2 · cos 60° = 1 m.")}>
        {r`\text{top: } (x, z) \qquad \text{front: } (x, y) \qquad \text{side: } (z, y) \qquad \ell' = \ell\cos\theta`}
      </Equation>

      <H2>{tx(t, "mPoly_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "mPoly_ex1", "1. A prism has 24 edges. What is its base, and how many faces does it have? E = 3n = 24 gives n = 8: an octagonal prism, with F = n + 2 = 10 faces and V = 16 vertices. Check: 16 − 24 + 10 = 2.")}</p>
      <p>{tx(t, "mPoly_ex2", "2. A convex polyhedron has 20 vertices, and 3 edges meet at each one. How many faces? 2E = 3 · 20 = 60, so E = 30, and F = 2 − V + E = 2 − 20 + 30 = 12. If all the faces are alike, each has 2E/F = 60/12 = 5 sides: the dodecahedron.")}</p>
      <p>{tx(t, "mPoly_ex3", "3. A gem is cut with 10 triangular faces and 2 pentagonal faces. Edges: 2E = 10 · 3 + 2 · 5 = 40, E = 20. Vertices: V = 2 + 20 − 12 = 10. (It is a pentagonal antiprism: two pentagons, one turned, joined by a zigzag band of triangles.)")}</p>
      <p>{tx(t, "mPoly_ex4", "4. A pyramid has 10 faces. Then n + 1 = 10, the base is a 9-sided polygon, E = 2 · 9 = 18 and V = 10.")}</p>
      <p>{tx(t, "mPoly_ex5", "5. A cube has every corner cut off. V' = 2 · 12 = 24, E' = 3 · 12 = 36, F' = 6 + 8 = 14 (6 octagons and 8 triangles). 24 − 36 + 14 = 2.")}</p>
      <p>{tx(t, "mPoly_ex6", "6. Can a polyhedron have exactly 7 edges? With F faces of at least 3 sides, 2E ≥ 3F, so F ≤ 4; with corners of at least 3 edges, V ≤ 4 as well. Then V − E + F ≤ 4 − 7 + 4 = 1, never 2. No polyhedron has 7 edges, although 6 (tetrahedron) and 8 (square pyramid) both exist.")}</p>

      <H2>{tx(t, "mPoly_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "mPoly_tWrong", "Wrong"), tx(t, "mPoly_tRight", "Right"), tx(t, "mPoly_tWhy", "Why")]}
        rows={[
          [tx(t, "mPoly_m1w", "football: E = 12 · 5 + 20 · 6 = 180"), "E = 180/2 = 90", tx(t, "mPoly_m1", "every edge is a side of two faces, so the sides count it twice")],
          [tx(t, "mPoly_m2w", "V − E + F = 2 for a frame with a hole"), "V − E + F = 0", tx(t, "mPoly_m2", "the relation is for solids without tunnels, such as every convex one")],
          [tx(t, "mPoly_m3w", "a hexagonal prism has F = 6"), "F = 6 + 2 = 8", tx(t, "mPoly_m3", "the two bases are faces too")],
          [tx(t, "mPoly_m4w", "a pyramid with n-sided base has 2n vertices"), "n + 1", tx(t, "mPoly_m4", "only one point, the apex, is added to the base")],
          [tx(t, "mPoly_m5w", "front view of a back stack hidden by a lower front one"), tx(t, "mPoly_m5r", "the taller stack shows"), tx(t, "mPoly_m5", "a view keeps the tallest thing in each line of sight, front or back")],
        ]}
      />

      <Related t={t} links={[
        { track: "Math", id: "planar-coloring", title: tx(t, "mPoly_rel1", "Planar Graphs & Colouring"), why: tx(t, "mPoly_rel1b", "the proof of V − E + F = 2 and why there are only five regular solids.") },
        { track: "Math", id: "volumes", title: tx(t, "mPoly_rel2", "Volume & Surface Area"), why: tx(t, "mPoly_rel2b", "how much prisms and pyramids hold, and their nets.") },
      ]} />

      <KeyIdeas t={t} id="mPoly" items={[
        "Prism with n-sided base: V = 2n, E = 3n, F = n + 2. Pyramid: V = n + 1, E = 2n, F = n + 1.",
        "Adding the sides of all the faces counts every edge twice: 2E = 3F₃ + 4F₄ + …; the same from the vertices.",
        "Euler: V − E + F = 2 for every convex polyhedron; two counts give the third.",
        "Cutting every corner: V' = 2E, E' = 3E, F' = F + V.",
        "There are five regular solids: tetrahedron, cube, octahedron, dodecahedron, icosahedron.",
        "A view is an orthogonal projection: it drops the depth and keeps the tallest thing in each line of sight.",
      ]} />
    </Article>
  );
}

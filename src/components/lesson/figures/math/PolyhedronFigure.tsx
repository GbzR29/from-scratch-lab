"use client";

import { useMemo, useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Choice, Row, Readout, Slider, Btn, C } from "@/components/lesson/kit/figure";
import { makeProjector, useOrbit, towardEye, add, sub, scale, dot, cross, type V3 } from "@/components/lesson/kit/scene3d";
import { hull, solidPoints, truncatedPoints, faceKinds, vertexKinds, type SolidId } from "./polyhedra";

// ── What this figure shows ────────────────────────────────────────────────────
// A polyhedron you can turn, with its vertices V, edges E and faces F counted
// and V − E + F = 2 checked. Faces are coloured by their number of sides, and
// the readouts count the edges twice, once from the faces (each face lists its
// sides, each edge is a side of 2 faces) and once from the vertices (each edge
// has 2 ends): the trick behind most polyhedron exercises. "Cut the corners"
// slices every corner off a third of the way along its edges; the icosahedron
// cut that way is the football, 12 pentagons and 20 hexagons.
// Hidden edges are dashed, so every edge can be counted from any view.

const W = 560, H = 320, DIST = 7;

/** Colour per number of sides (data colours, the same in both themes). */
const SIDE_COL: Record<number, string> = { 3: C.sky, 4: C.amber, 5: C.pink, 6: C.green, 8: C.purple, 10: C.teal };
const sideCol = (n: number) => SIDE_COL[n] ?? C.orange;

type Show = "faces" | "edges" | "vertices";

export function PolyhedronFigure({ t }: { t?: TrackTranslations }) {
  const [id, setId] = useState<SolidId>("cube");
  const [n, setN] = useState(5);
  const [cut, setCut] = useState(false);
  const [show, setShow] = useState<Show>("faces");
  const orb = useOrbit({ yaw: -0.55, pitch: 0.42, zoom: 1 });

  const poly = useMemo(() => {
    const p = hull(solidPoints(id, n));
    return cut ? hull(truncatedPoints(p)) : p;
  }, [id, n, cut]);

  const proj = makeProjector(orb.orbit, W / 2, H / 2, 118, DIST);
  const eye = scale(towardEye(orb.orbit), DIST);
  const sp = poly.verts.map(proj);
  const faceVis = poly.faces.map(f => {
    const a = poly.verts[f[0]], b = poly.verts[f[1]], c = poly.verts[f[2]];
    const nrm = cross(sub(b, a), sub(c, a));
    const mid = scale(f.reduce((s, i) => add(s, poly.verts[i]), [0, 0, 0] as V3), 1 / f.length);
    return dot(nrm, sub(eye, mid)) > 0;
  });
  // An edge or vertex is seen when any face it belongs to is seen
  const vertVis = new Array(poly.verts.length).fill(false);
  const edgeVis = new Map<string, boolean>();
  poly.faces.forEach((f, fi) => f.forEach((a, m) => {
    const b = f[(m + 1) % f.length], key = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeVis.set(key, (edgeVis.get(key) ?? false) || faceVis[fi]);
    if (faceVis[fi]) vertVis[a] = true;
  }));

  const V = poly.verts.length, E = poly.edges.length, F = poly.faces.length;
  const fk = faceKinds(poly), vk = vertexKinds(poly);
  const sumF = fk.map(([s, c]) => `${c}·${s}`).join(" + ");
  const sumV = vk.map(([d, c]) => `${c}·${d}`).join(" + ");
  const kindName = (s: number) =>
    s === 3 ? tx(t, "figPhd_tri", "triangles") : s === 4 ? tx(t, "figPhd_quad", "quadrilaterals") :
    s === 5 ? tx(t, "figPhd_pent", "pentagons") : s === 6 ? tx(t, "figPhd_hex", "hexagons") :
    `${s}${tx(t, "figPhd_gon", "-gons")}`;

  const edgeCol = show === "edges" ? C.amber : C.fg;
  const path = (f: number[]) => "M" + f.map(i => `${sp[i].x.toFixed(1)},${sp[i].y.toFixed(1)}`).join("L") + "Z";
  const hasN = id === "prism" || id === "pyramid";

  return (
    <Figure
      title={tx(t, "figPhd_title", "Counting a polyhedron")}
      head={<>
        <Choice value={show} onChange={setShow} options={[
          ["faces", tx(t, "figPhd_showF", "faces")],
          ["edges", tx(t, "figPhd_showE", "edges")],
          ["vertices", tx(t, "figPhd_showV", "vertices")],
        ]} />
        <Btn onClick={orb.reset}>{tx(t, "figPhd_view", "reset view")}</Btn>
      </>}
      controls={<>
        <Row>
          <Choice value={id} onChange={setId} options={[
            ["prism", tx(t, "figPhd_prism", "prism")],
            ["pyramid", tx(t, "figPhd_pyramid", "pyramid")],
            ["tetra", tx(t, "figPhd_tetra", "tetrahedron")],
            ["cube", tx(t, "figPhd_cube", "cube")],
            ["octa", tx(t, "figPhd_octa", "octahedron")],
            ["dodeca", tx(t, "figPhd_dodeca", "dodecahedron")],
            ["icosa", tx(t, "figPhd_icosa", "icosahedron")],
          ]} />
        </Row>
        <Row>
          <Btn active={cut} onClick={() => setCut(!cut)}>{tx(t, "figPhd_cut", "cut the corners")}</Btn>
          {hasN && <div className="w-72 max-w-full"><Slider label={tx(t, "figPhd_n", "sides of the base n")} value={n} min={3} max={8} step={1} onChange={setN} fmt={v => String(v)} width="w-32" /></div>}
        </Row>
        <Row>
          <Readout color={show === "vertices" ? C.purple : undefined}>{`V = ${V}`}</Readout>
          <Readout color={show === "edges" ? C.amber : undefined}>{`E = ${E}`}</Readout>
          <Readout color={show === "faces" ? C.sky : undefined}>{`F = ${F}`}</Readout>
          <Readout color={C.green}>{`V − E + F = ${V} − ${E} + ${F} = ${V - E + F}`}</Readout>
        </Row>
        <Row>
          {fk.map(([s, c]) => <Readout key={s} color={sideCol(s)}>{`${c} ${kindName(s)}`}</Readout>)}
        </Row>
        <Row>
          <Readout>{`${tx(t, "figPhd_byFaces", "from the faces")}: 2E = ${sumF} = ${2 * E}`}</Readout>
          <Readout>{`${tx(t, "figPhd_byVerts", "from the vertices")}: 2E = ${sumV} = ${2 * E}`}</Readout>
        </Row>
      </>}
      note={<>
        {tx(t, "figPhd_note", "Each face lists its sides, and every edge is a side of exactly two faces, so adding up the sides of all the faces counts every edge twice. The same happens with the vertices: each edge has two ends. Cut the corners and watch the counts: every corner becomes a new face, every edge keeps a shorter middle piece, and V − E + F stays 2. The icosahedron cut a third of the way along its edges is the classic football.")}{" "}
        <span data-mouse-only>{tx(t, "figPhd_drag", "Drag to turn it; hidden edges are dashed.")}</span>
        <span data-touch-only>{tx(t, "figPhd_dragTouch", "Swipe to turn it; hidden edges are dashed.")}</span>
      </>}
    >
      <svg ref={orb.ref} {...orb.handlers} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto cursor-grab" style={{ touchAction: "none" }}>
        {/* Hidden edges first, dashed */}
        {poly.edges.map(([a, b]) => edgeVis.get(`${a}-${b}`) ? null :
          <line key={`h${a}-${b}`} x1={sp[a].x} y1={sp[a].y} x2={sp[b].x} y2={sp[b].y}
            stroke={edgeCol} strokeWidth={show === "edges" ? 1.4 : 1} strokeDasharray="4 4" opacity={0.45} />)}
        {poly.faces.map((f, fi) => faceVis[fi] &&
          <path key={`f${fi}`} d={path(f)} fill={show === "faces" ? sideCol(f.length) : C.muted}
            fillOpacity={show === "faces" ? 0.42 : 0.12} stroke="none" />)}
        {poly.edges.map(([a, b]) => edgeVis.get(`${a}-${b}`) &&
          <line key={`e${a}-${b}`} x1={sp[a].x} y1={sp[a].y} x2={sp[b].x} y2={sp[b].y}
            stroke={edgeCol} strokeWidth={show === "edges" ? 2.6 : 1.5} strokeLinecap="round" />)}
        {poly.verts.map((_, i) => (show === "vertices" || V <= 12) &&
          <circle key={`v${i}`} cx={sp[i].x} cy={sp[i].y} r={show === "vertices" ? 4.2 : 2.4}
            fill={vertVis[i] ? (show === "vertices" ? C.purple : C.fg) : "none"}
            stroke={show === "vertices" ? C.purple : C.fg} strokeWidth={1.2} opacity={vertVis[i] ? 1 : 0.5} />)}
      </svg>
    </Figure>
  );
}

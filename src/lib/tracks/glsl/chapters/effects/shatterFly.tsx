// src/lib/tracks/glsl/chapters/effects/shatterFly.tsx
// The second half of "Cracks & Shattering": fracture faces, pre-fractured
// meshes moved by the vertex shader, and vertex animation textures.
"use client";

import { Callout, CodeBlock, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { ShatterFigure } from "@/components/lesson/figures/shatter/ShatterFigure";
import { flightNumbers } from "../../live/shatter";

const r = String.raw;

// ── The faces of a break ──────────────────────────────────────────────────────

export function FacesSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslShatter_facesTitle", "The faces of a break")}</H2>
      <p>
        {tx(t, "glslShatter_facesBody",
          "Look at the edge of a broken window and it is green, although the pane looked clear. Ordinary glass contains a little iron, and iron absorbs some red and some blue. Through the pane, light crosses 4 mm of glass and loses almost nothing; along the edge, the eye looks through the whole width of the pane, centimetres to metres, and Beer–Lambert from the glass chapter takes over: T = e^(−σd) per colour channel, and only green gets through. A shader does not need to trace that path. The fracture faces simply get their own material: a pale, fairly opaque green, plus the usual Fresnel reflection.")}
      </p>
      <p>
        {tx(t, "glslShatter_mirrorBody",
          "Close up, a fracture face has a structure of its own. Around the flaw where the break began there is a smooth, glossy patch, the mirror; around it a faintly frosted band, the mist; and further out the surface turns rough and ridged, the hackle, where the crack was running so fast that it kept trying to branch. Curved ripples (Wallner lines) cross it where sound waves bouncing inside the glass met the crack front. Forensic glass experts read these marks to tell which side a window was broken from.")}
      </p>
      <Equation label={tx(t, "glslShatter_mirrorLabel", "Size of the fracture mirror")}
        where={[
          [r`\sigma_f`, tx(t, "glslShatter_wSf", "the stress at which the glass broke")],
          [r`r_m`, tx(t, "glslShatter_wRm", "the radius of the mirror around the origin of the break")],
          [r`A`, tx(t, "glslShatter_wAm", "the mirror constant: about 2 MPa·√m for window glass")],
        ]}
        words={tx(t, "glslShatter_mirrorWords", "The harder it was to break, the smaller the mirror. A window broken at 50 MPa leaves a mirror of radius (2/50)² m = 1.6 mm; a strong fibre breaking at 2 GPa leaves one of 1 µm. A shader that draws fracture faces close up can use this: smooth near the origin, rougher normals further out.")}>
        {r`\sigma_f \sqrt{r_m} = A \;\Rightarrow\; r_m = \left(\frac{A}{\sigma_f}\right)^2`}
      </Equation>
    </>
  );
}

// ── Shards that fly ───────────────────────────────────────────────────────────

export function FlySection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslShatter_flyTitle", "Shards that fly")}</H2>
      <p>
        {tx(t, "glslShatter_preBody",
          "Drawing cracks is the easy half; now the pieces have to fall. Games almost never cut a mesh at the moment of impact. The pane is pre-fractured when the level is built: cut into Voronoi cells once, each cell extruded into a thin prism. The cut is simple for convex cells: start with the pane's rectangle, and for every other seed keep only the half of the plane closer to your own seed. What is left after all the other seeds is your shard. Seeds crowded around a likely impact point give small pieces there and large ones far away, as in a real break.")}
      </p>
      <p>
        {tx(t, "glslShatter_oneMeshBody",
          "Then comes the trick that makes thousands of shards cheap: all of them go into a single mesh, drawn with a single call. Each vertex stores three things:")}
      </p>
      <LessonTable
        headers={[tx(t, "glslShatter_thAttr", "Attribute"), tx(t, "glslShatter_thHolds", "What it holds")]}
        rows={[
          ["aLocal", tx(t, "glslShatter_tdLocal", "the vertex's position around its shard's centre, as it sat in the whole pane")],
          ["aNormal", tx(t, "glslShatter_tdNormal", "the face's normal in the same frame: ±z on the two flat faces, sideways on the fracture faces")],
          ["aShard", tx(t, "glslShatter_tdShard", "x = which shard this vertex belongs to; y = 1 on a fracture face, so the fragment shader can paint it green")],
        ]} />
      <p>
        {tx(t, "glslShatter_moveBody",
          "The vertex shader looks up where shard aShard.x is now (a centre c and an orientation q), and places the vertex at c + rotate(q, aLocal). Every vertex of the same shard gets the same c and q, so the shard moves as one rigid piece. The question left is how to know c and q at time t.")}
      </p>
      <H3>{tx(t, "glslShatter_closedTitle", "Closed form: a formula per shard")}</H3>
      <p>
        {tx(t, "glslShatter_closedBody",
          "Between the moment a shard breaks free and the moment it hits something, the only force on it is gravity, and gravity does not turn it. So its centre follows a parabola and it spins at a steady rate about a fixed axis, and both can be written as functions of time. All the shader needs per shard is its starting centre, its velocity, its spin and the moment it was released: four values in a small float texture, one column per shard.")}
      </p>
      <Derivation t={t} label={tx(t, "glslShatter_motionDer", "Where a shard is at time t")}
        where={[
          [r`\mathbf{c}_0,\ \mathbf{v}`, tx(t, "glslShatter_wCV", "the shard's centre in the whole pane, and the velocity the stone gave it")],
          [r`\boldsymbol{\omega}`, tx(t, "glslShatter_wW", "its spin: the axis it turns about, with a length of so many radians per second")],
          [r`t_0`, tx(t, "glslShatter_wT0", "when this shard broke free (later the further it is from the impact)")],
          [r`\mathbf{g}`, tx(t, "glslShatter_wG", "gravity, (0, −9.81, 0) m/s²")],
          [r`\mathbf{q}`, tx(t, "glslShatter_wQ", "the shard's orientation, as a unit quaternion")],
        ]}
        steps={[
          { full: true, tex: r`\tau = \max(t - t_0,\ 0)`,
            why: tx(t, "glslShatter_m1", "time since this shard came free; before that it sits still in the pane") },
          { full: true, tex: r`\mathbf{c}(\tau) = \mathbf{c}_0 + \mathbf{v}\,\tau + \tfrac{1}{2}\,\mathbf{g}\,\tau^2`,
            why: tx(t, "glslShatter_m2", "constant acceleration: the velocity grows by g every second, so the position gains v·τ plus the area under that growing speed, ½gτ²") },
          { full: true, tex: r`\mathbf{q}(\tau) = \left(\hat{\boldsymbol{\omega}}\,\sin\tfrac{|\boldsymbol{\omega}|\tau}{2},\ \cos\tfrac{|\boldsymbol{\omega}|\tau}{2}\right)`,
            why: tx(t, "glslShatter_m3", "a steady spin is a turn by the angle |ω|τ about the axis ω̂, and a quaternion stores a turn by φ about an axis as (axis · sin φ/2, cos φ/2)") },
          { full: true, tex: r`\mathbf{p} = \mathbf{c}(\tau) + \mathbf{q}\,\mathbf{a}_{local}\,\mathbf{q}^{-1} = \mathbf{c} + \mathbf{a} + 2\,\mathbf{u} \times (\mathbf{u} \times \mathbf{a} + w\,\mathbf{a})`,
            why: tx(t, "glslShatter_m4", "turn the vertex's local position by q and add the centre. The last form, with q = (u, w), is the cheap way to rotate a vector by a quaternion: two cross products") },
        ]} />
      <p>
        {tx(t, "glslShatter_spinNote",
          "Strictly, a spinning flat object does not keep a fixed axis: it wobbles, because it is easier to turn about some axes than others (a tossed book does it). Over the second or so a shard is in the air nobody notices, and the steady spin is what every closed-form effect uses.")}
      </p>
      <LiveFormula label={tx(t, "glslShatter_liveFlight", "Try it: when does a shard reach the floor?")}
        tex={r`h + v_y t - \tfrac{1}{2} g t^2 = 0 \;\Rightarrow\; t = \frac{v_y + \sqrt{v_y^2 + 2gh}}{g}`}
        vars={[
          { id: "h", label: "h", min: 0.1, max: 3, step: 0.05, value: 1.2, fmt: v => `${v.toFixed(2)} m` },
          { id: "vy", label: "v_y", min: -3, max: 3, step: 0.1, value: 0, fmt: v => `${v.toFixed(1)} m/s` },
        ]}
        compute={flightNumbers()}
        note={tx(t, "glslShatter_liveFlightNote", "A shard from the top of a window reaches the floor in about half a second: around 30 frames. That is all the time the effect has, which is why games play shattering in slow motion so often. The formula can say when the centre reaches the floor, but not how a tumbling shard lands on its corner, bounces, and slides.")} />
      <CodeBlock lang="glsl" filename="shard.vert (closed form)" t={t}>{`layout(location = 0) in vec3 aLocal;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aShard;               // x = shard index, y = 1 on a fracture face
uniform highp sampler2D uLaunch;                   // one column per shard: (c0, t0), v, omega

vec3 rotq(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }

void main() {
  int i = int(aShard.x + 0.5);
  vec4 c0 = texelFetch(uLaunch, ivec2(i, 0), 0);
  vec3 v  = texelFetch(uLaunch, ivec2(i, 1), 0).xyz;
  vec3 w  = texelFetch(uLaunch, ivec2(i, 2), 0).xyz;
  float tau = max(uTime - c0.w, 0.0);
  vec3 c = c0.xyz + v * tau + 0.5 * vec3(0.0, -9.81, 0.0) * tau * tau;
  float a = length(w) * tau;
  vec4 q = vec4(normalize(w + 1e-6) * sin(0.5 * a), cos(0.5 * a));
  vec3 p = c + rotq(q, aLocal);
  vN = rotq(q, aNormal);
  gl_Position = uViewProj * vec4(p, 1.0);
}`}</CodeBlock>
    </>
  );
}

// ── Baking the motion ─────────────────────────────────────────────────────────

export function BakeSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslShatter_bakeTitle", "Baking the motion into a texture")}</H2>
      <p>
        {tx(t, "glslShatter_bakeBody",
          "The closed form has no memory, and that is exactly its weakness: a bounce depends on everything that happened before it, so no formula of t alone can contain it. The usual answer in games is to run a real rigid-body simulation once, ahead of time, and record it. Every frame, for every shard, write down its centre and its orientation. Store the recording in a texture, one column per shard and two rows per frame, and the vertex shader replays it: this is a vertex animation texture (VAT).")}
      </p>
      <LessonTable
        headers={[tx(t, "glslShatter_thRow", "Row"), tx(t, "glslShatter_thColumn", "Column i"), tx(t, "glslShatter_thSize", "Size here")]}
        rows={[
          ["2f", tx(t, "glslShatter_tdPos", "centre of shard i at frame f (x, y, z)"), tx(t, "glslShatter_tdSizeA", "64 shards × 150 frames × 2 rows")],
          ["2f + 1", tx(t, "glslShatter_tdRot", "orientation of shard i at frame f (a quaternion)"), tx(t, "glslShatter_tdSizeB", "RGBA32F: 16 bytes a texel, about 300 kB")],
        ]} />
      <p>
        {tx(t, "glslShatter_readBody",
          "Reading it back is cheap. The current time falls between two recorded frames; read both, blend the centres linearly and the quaternions with a normalised blend. One detail: q and −q are the same turn, so if the two quaternions point away from each other (negative dot product) flip one first, or the blend takes the long way round and the shard spins wildly between frames.")}
      </p>
      <CodeBlock lang="glsl" filename="shard.vert (baked)" t={t}>{`uniform highp sampler2D uVat;          // row 2f = centre, row 2f + 1 = quaternion
float f = clamp(uTime * uFps, 0.0, float(uFrames) - 1.001);
int   f0 = int(f);
float s = f - float(f0);
vec3 c0 = texelFetch(uVat, ivec2(i, 2 * f0), 0).xyz;
vec3 c1 = texelFetch(uVat, ivec2(i, 2 * f0 + 2), 0).xyz;
vec4 q0 = texelFetch(uVat, ivec2(i, 2 * f0 + 1), 0);
vec4 q1 = texelFetch(uVat, ivec2(i, 2 * f0 + 3), 0);
if (dot(q0, q1) < 0.0) q1 = -q1;       // the same turn, the short way
vec3 c = mix(c0, c1, s);
vec4 q = normalize(mix(q0, q1, s));`}</CodeBlock>
      <p>
        {tx(t, "glslShatter_simBody",
          "The simulation behind the figure is small: each shard is a rigid body with a mass and a box-shaped resistance to turning. Every step adds gravity, moves it, and turns it by its spin (q̇ = ½ωq). If any corner has gone below the floor, it applies an impulse at that corner, enough to stop it sinking and bounce it back a quarter as fast, plus friction against sliding; the impulse at a corner also changes the spin, which is what makes a shard that lands on its corner flip over. Shards that barely move for half a second are put to sleep. Shards do not collide with each other here; a full physics engine would add that, and its cost is why baking pays off.")}
      </p>
      <ShatterFigure t={t} />
      <H3>{tx(t, "glslShatter_choiceTitle", "Which one to use")}</H3>
      <LessonTable
        headers={[tx(t, "glslShatter_thWay", "Way"), tx(t, "glslShatter_thGood", "Good at"), tx(t, "glslShatter_thBad", "Costs")]}
        rows={[
          [tx(t, "glslShatter_tdClosed", "Closed form in the vertex shader"), tx(t, "glslShatter_tdClosedGood", "any number of pieces, any frame instantly, no memory: debris, sparks, distant explosions"), tx(t, "glslShatter_tdClosedBad", "no collisions: pieces must vanish or fade before they hit anything")],
          [tx(t, "glslShatter_tdVat", "Vertex animation texture"), tx(t, "glslShatter_tdVatGood", "a full simulation (bounces, piles, shards hitting each other) replayed at the price of a texture read"), tx(t, "glslShatter_tdVatBad", "the same break every time; memory grows with pieces × frames; made offline in a tool such as Houdini")],
          [tx(t, "glslShatter_tdGpu", "GPU particles (compute or transform feedback)"), tx(t, "glslShatter_tdGpuGood", "state kept on the GPU and stepped every frame: can react to the floor and to the player"), tx(t, "glslShatter_tdGpuBad", "shards are points, not rigid bodies, unless the shader does the rigid-body maths itself")],
          [tx(t, "glslShatter_tdCpu", "Rigid bodies in the physics engine"), tx(t, "glslShatter_tdCpuGood", "fully interactive: the player can kick the shards"), tx(t, "glslShatter_tdCpuBad", "each piece is a body the engine must step and collide: dozens, not thousands")],
        ]} />
      <Callout type="tip" t={t}>
        {tx(t, "glslShatter_mixTip", "Real games mix them. The big pieces near the player become physics bodies, the small ones become a VAT or closed-form debris that fades out, and a decal of cracks covers what is left in the frame. The rigid-body physics behind the bake is the same that keeps boxes from sinking into the floor in a game engine; the Game Dev track is the place for that.")}
      </Callout>
    </>
  );
}

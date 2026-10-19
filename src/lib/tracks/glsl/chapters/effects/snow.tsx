// src/lib/tracks/glsl/chapters/effects/snow.tsx
"use client";

import { Callout, CodeBlock, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ShaderPlayground } from "@/components/lesson/glsl/ShaderPlayground";
import { SnowflakeFigure } from "@/components/lesson/figures/snow/SnowflakeFigure";
import { SnowfallFigure } from "@/components/lesson/figures/snow/SnowfallFigure";
import { SNOW_PRESETS } from "../../presets/snow";
import { DeformSnowFigure } from "@/components/lesson/figures/snow/DeformSnowFigure";
import { foldNumbers, parallaxNumbers, ballPrintNumbers } from "../../live/snow";

const r = String.raw;

// ═════════════════════════════════════════════════════════════════════════════
// Snow & Blizzards
// ═════════════════════════════════════════════════════════════════════════════

export function SnowContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "glslSnow_intro",
          "Snow is two effects at two sizes. Up close it is a crystal, a six-armed piece of ice whose shape records the air it grew in. From a distance it is a crowd, thousands of white dots drifting down at different depths. This chapter builds both with very little code: one twelfth of a crystal, folded into the whole flake, and a grid of cells that falls past the camera, where each cell holds at most one flake. Last, the snow on the ground: a texture that remembers every footprint pressed into it.")}
      </Lead>

      <Goals t={t} id="glslSnow" items={[
        "Explain why a snow crystal has six arms and what decides whether it grows as a plate or a star.",
        "Fold the plane into one twelfth, so that drawing half an arm draws the whole flake.",
        "Grow a flake procedurally: an arm, side branches at 60° and plates, from a growth record.",
        "Fill the screen with falling snow from hashed cells on a stack of sheets, with parallax, sway and depth of field.",
        "Make snow keep footprints: a height texture, stamps with min, a displaced mesh and a refill over time.",
      ]} />

      <CrystalSection t={t} />
      <FoldSection t={t} />
      <FallSection t={t} />
      <DeformSection t={t} />

      <KeyIdeas t={t} id="glslSnow" items={[
        "Ice is a hexagonal lattice, so a snow crystal starts as a tiny hexagonal plate and keeps the same six directions as it grows.",
        "Corners stick out into the moist air and grow faster than faces: high supersaturation makes branches, low makes facets and plates. Temperature decides plates or columns.",
        "fold6: a = mod(atan(y, x) + 30°, 60°) − 30°, then |a|. Every pixel lands in one 30° wedge, so one function draws all twelve pieces.",
        "Side branches leave at 60°, parallel to the neighbouring arms, and must stay shorter than their distance from the centre (ℓ < x), or they run into the next arm's branches.",
        "Falling snow needs no particles: each cell of a grid holds at most one flake, placed by a hash of the cell's integer id.",
        "A flake must fit in its cell: |offset| + sway + radius + blur ≤ half a cell. A bigger flake needs the 3 × 3 neighbouring cells, at nine times the cost.",
        "Put each sheet at a depth z, take the world point p·z and divide by the cell size. Motion added in metres gives parallax for free: in cell units every sheet moves at v/D.",
        "Defocus grows with |1/z − 1/z_f|; spreading the same light over a bigger disc dims it by (r / (r + c))².",
        "Deformable snow is a height texture seen from above: stamp with h = min(h, underside), ping-pong between two textures, and sink a dense mesh in the vertex shader.",
        "A sphere sunk δ leaves a print of radius √(2ρδ − δ²). Fresh snow refills with h += (1 − h)(1 − e^(−kΔt)), which gives the same result at any frame rate.",
      ]} />
    </Article>
  );
}

// ── Why six arms ──────────────────────────────────────────────────────────────

function CrystalSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslSnow_whyTitle", "Why a snowflake has six arms")}</H2>
      <p>
        {tx(t, "glslSnow_whyBody",
          "A snowflake is not frozen rain. It grows straight from water vapour in a cloud, molecule by molecule, onto a speck of dust. Water molecules in ice hold on to each other with hydrogen bonds, each to four neighbours, and the pattern that makes is a stack of sheets of six-sided rings. So the smallest snow crystal is a tiny hexagonal prism: two flat six-sided faces (the basal faces) and six rectangular sides (the prism faces). Everything after that grows outwards along the six directions the lattice already has, which is why every snowflake has six arms and never five or eight.")}
      </p>
      <p>
        {tx(t, "glslSnow_cornerBody",
          "Why arms and not a bigger hexagon? Vapour reaches the crystal by drifting through the air, and the six corners of the hexagon stick out farther into that air than the middles of the faces. They meet more molecules per second, so they grow faster, which makes them stick out even more. A bump that wins keeps winning, and the corners become arms; the same thing then happens along each arm, and the arms sprout side branches. Flat faces fight back: a molecule landing on a smooth molecular face struggles to find a place to stick. Which side wins depends on the supersaturation, how much more vapour the air holds than ice needs. Low: the faces keep up and the crystal stays a faceted plate. High: the corners run away and it grows into a star.")}
      </p>
      <p>
        {tx(t, "glslSnow_nakayaBody",
          "Temperature decides something else: whether the crystal grows wide or tall. In the 1930s the physicist Ukichiro Nakaya grew snow crystals in his lab in Sapporo, the first ones made by hand, and mapped their shapes against temperature and humidity. His diagram still holds, and the strange flip from plates to columns and back is still not fully explained:")}
      </p>
      <LessonTable
        headers={[
          tx(t, "glslSnow_thTemp", "temperature"),
          tx(t, "glslSnow_thLow", "drier air (low supersaturation)"),
          tx(t, "glslSnow_thHigh", "moister air (high supersaturation)"),
        ]}
        rows={[
          ["0 … −4 °C", tx(t, "glslSnow_n1a", "thin hexagonal plates"), tx(t, "glslSnow_n1b", "plates with branched edges")],
          ["−4 … −10 °C", tx(t, "glslSnow_n2a", "short solid columns"), tx(t, "glslSnow_n2b", "needles and hollow columns")],
          ["−10 … −22 °C", tx(t, "glslSnow_n3a", "plates and sectored plates"), tx(t, "glslSnow_n3b", "stellar dendrites (the classic star), largest near −15 °C")],
          [tx(t, "glslSnow_n4t", "below −22 °C"), tx(t, "glslSnow_n4a", "small plates and columns"), tx(t, "glslSnow_n4b", "clusters of plates and columns")],
        ]} />
      <p>
        {tx(t, "glslSnow_historyBody",
          "A crystal falls for half an hour or so, through air that keeps changing. Each change is written into the crystal at the radius its tips have reached at that moment: a dry stretch makes a band of plate, a moist one a band of branches. The six tips are only a millimetre apart and live through exactly the same changes, so the six arms record the same story and come out nearly alike. That is the real reason a snowflake looks symmetric, and it is the rule the widget below follows. It stays in the −10 to −22 °C band, where crystals grow as flat plates and stars and can be drawn seen from above.")}
      </p>
    </>
  );
}

// ── Folding the plane ─────────────────────────────────────────────────────────

function FoldSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslSnow_foldTitle", "One arm, twelve times: folding the plane")}</H2>
      <p>
        {tx(t, "glslSnow_foldBody",
          "A six-armed crystal looks the same after a turn of 60°, and each arm is also the same on both sides of its centre line. Together those are 12 symmetries: 6 turns and 6 mirrors. So the whole flake is fixed by one thin wedge of 30°, between an arm and the line halfway to the next arm. A fragment shader can use that directly. Before drawing, it moves each pixel into that wedge, by turning it through a multiple of 60° and mirroring it if needed. Then a shape written for the wedge alone appears twelve times. This is called folding the plane:")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_foldDer", "fold6, step by step")}
        where={[
          [r`\mathbf p`, tx(t, "glslSnow_wP", "the pixel's position, with the flake's centre at the origin")],
          [r`a,\ \rho`, tx(t, "glslSnow_wA", "its angle from the +x axis and its distance from the centre (polar coordinates)")],
          [r`\mathbf q`, tx(t, "glslSnow_wQ", "the folded point: where p lands inside the wedge 0° ≤ angle ≤ 30°, with an arm along +x")],
        ]}
        steps={[
          { full: true, tex: r`a = \operatorname{atan}(p_y,\, p_x), \qquad \rho = |\mathbf p|`,
            why: tx(t, "glslSnow_f1", "switch to polar coordinates. A turn about the centre only changes a and leaves ρ alone, so the six turns become a simple operation on one number. GLSL's two-argument atan returns a between −180° and 180°") },
          { full: true, tex: r`a_1 = \operatorname{mod}(a + 30^\circ,\ 60^\circ) - 30^\circ \;\in\; [-30^\circ,\ 30^\circ)`,
            why: tx(t, "glslSnow_f2", "mod by 60° maps every 60° wedge onto the first one: an angle of 130° and one of 10° land in the same place. The +30° before and −30° after shift that wedge so it is centred on the arm along +x, instead of starting at it") },
          { full: true, tex: r`a_2 = |a_1| \;\in\; [0^\circ,\ 30^\circ]`,
            why: tx(t, "glslSnow_f3", "the mirror: the arm is the same on both sides of its centre line, so the half below the x axis (negative a₁) is flipped onto the half above it") },
          { full: true, tex: r`\mathbf q = \rho\,(\cos a_2,\ \sin a_2)`,
            why: tx(t, "glslSnow_f4", "back to x and y. A point in any of the twelve pieces now gives the same q as its partners in the other eleven, so whatever is drawn using q is repeated around the flake. In q, x runs along the arm and y across it, and 0 ≤ q.y ≤ q.x · tan 30°") },
        ]} />
      <LiveFormula label={tx(t, "glslSnow_liveFold", "Try it: where does a point land?")}
        tex={r`a_1 = \operatorname{mod}(a + 30^\circ, 60^\circ) - 30^\circ, \qquad a_2 = |a_1|, \qquad \mathbf q = \rho(\cos a_2, \sin a_2)`}
        vars={[
          { id: "theta", label: "a", min: 0, max: 359, step: 1, value: 130, fmt: v => `${v}°` },
          { id: "rad", label: "ρ", min: 0.1, max: 1, step: 0.01, value: 0.6, fmt: v => v.toFixed(2) },
        ]}
        compute={foldNumbers(t)}
        note={tx(t, "glslSnow_liveFoldNote", "130° lands at 10°: it is 10° past the arm at 120°. Try 110°: it is 10° short of that arm, so it is mirrored and also lands at 10°. Sweep a all the way round: a₂ climbs from 0° to 30° and back down twelve times.")} />
      <CodeBlock lang="glsl" filename="fold6.glsl" t={t}>{`const float PI = 3.14159265;

// Every point of the plane moved into the wedge 0° ≤ angle ≤ 30°
vec2 fold6(vec2 p) {
    float a = atan(p.y, p.x);
    a = mod(a + PI / 6.0, PI / 3.0) - PI / 6.0;   // six wedges of 60° onto one
    a = abs(a);                                     // its two halves onto one
    return length(p) * vec2(cos(a), sin(a));
}`}</CodeBlock>
      <Callout type="tip" t={t}>
        {tx(t, "glslSnow_foldTip", "The same fold can be done with three mirrors and no atan, sin or cos: p = abs(p) folds the plane into a quarter, a reflection across the line at 60° folds that onto the strip between 60° and 120°, and a last abs(p.x) leaves the wedge from 60° to 90°, with the arm along +y. It is a little faster, and it is the usual way to write a hexagon's distance function.")}
      </Callout>

      <H3>{tx(t, "glslSnow_armTitle", "Drawing half an arm")}</H3>
      <p>
        {tx(t, "glslSnow_armBody",
          "Inside the wedge, the flake is a few distance functions joined with min. The arm is a segment from the centre to the tip at radius R, given a width. Side branches leave it at 60°: that is not a choice, it is the lattice again, since the only directions ice grows in are the six arm directions, and from an arm the one that points outwards is 60°. Each branch is parallel to the neighbouring arm. Branches that sprouted early, near the centre, have had longer to grow, so their length grows with R − x, how far the tip has moved on since. But there is a limit:")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_lenDer", "How long can a branch be?")}
        where={[
          [r`x`, tx(t, "glslSnow_wX", "where the branch leaves the arm, measured from the centre")],
          [r`\ell`, tx(t, "glslSnow_wL", "the branch's length")],
        ]}
        steps={[
          { full: true, tex: r`\text{tip} = (x,\, 0) + \ell\,(\cos 60^\circ,\ \sin 60^\circ) = \Big(x + \tfrac{\ell}{2},\ \tfrac{\sqrt 3}{2}\,\ell\Big)`,
            why: tx(t, "glslSnow_l1", "start at the arm, at distance x, and go ℓ along the 60° direction") },
          { full: true, tex: r`\frac{\tfrac{\sqrt 3}{2}\,\ell}{x + \tfrac{\ell}{2}} = \tan 30^\circ = \frac{1}{\sqrt 3}`,
            why: tx(t, "glslSnow_l2", "the wedge ends at the 30° mirror line. A branch tip on that line touches the mirrored branch of the next arm, coming the other way") },
          { full: true, tex: r`\tfrac{3}{2}\,\ell = x + \tfrac{\ell}{2} \quad\Rightarrow\quad \ell = x`,
            why: tx(t, "glslSnow_l3", "multiply both sides by √3 (x + ℓ/2) and solve. So a branch must stay shorter than its distance from the centre: ℓ < x. In a real crystal the two branches compete for the same vapour and both stop growing as they get close") },
        ]} />
      <CodeBlock lang="glsl" filename="arm.glsl" t={t}>{`float flake(vec2 p, float R) {
    vec2 q = fold6(p);
    float d = sdSegment(q, vec2(0.0), vec2(R, 0.0)) - width;     // the arm
    vec2 B = vec2(0.5, 0.866);                                     // 60°
    for (int j = 1; j <= 8; j++) {
        float x = float(j) * spacing;
        if (x >= R) break;                                         // the tip has not got here yet
        float len = min(0.75 * x, 0.8 * (R - x));                  // older is longer, but ℓ < x
        d = min(d, sdSegment(q, vec2(x, 0.0), vec2(x, 0.0) + B * len) - width);
    }
    return max(d, dot(q, vec2(0.866, 0.5)) - R * 0.866);           // inside the hexagon of the tips
}`}</CodeBlock>
      <p>
        {tx(t, "glslSnow_hexBody",
          "The last line keeps everything inside the hexagon whose corners are the six tips. In the wedge, that hexagon's edge is a single line with its normal at 30°, so the test is one dot product: a point is inside when q · (cos 30°, sin 30°) ≤ R cos 30°. Real crystals obey the same envelope, because the tips are the fastest-growing parts. To turn the growth record into a shape, the widget looks up the supersaturation the tip met at each radius: where it was high, a branch sprouts; where it was low, the arm is widened into a flat plate, up to the hexagon.")}
      </p>
      <SnowflakeFigure t={t} />
      <Callout type="info" t={t}>
        {tx(t, "glslSnow_randomNote", "The random numbers that vary the branches are hashed from j, the branch's position along the arm, never from which arm it is on. That is what keeps the arms alike: all six read the same q, so they get the same numbers. Hash the arm's number into them as well, as the imperfection slider does, and the arms drift apart. fold6 can return that number: it is floor((a + 30°) / 60°) before the mod.")}
      </Callout>
    </>
  );
}

// ── Falling snow ──────────────────────────────────────────────────────────────

function FallSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslSnow_fallTitle", "Falling snow from hashed cells")}</H2>
      <p>
        {tx(t, "glslSnow_fallBody",
          "A snowfall is far too many flakes to draw one by one in a fragment shader: a pixel that loops over ten thousand flakes to see which ones cover it is ten thousand times too slow. The trick is to turn the question round. Cut the screen into a grid of cells and allow at most one flake per cell. Then a pixel only has to ask about one flake, the one in its own cell, and it can find out everything about that flake without any storage: hash the cell's integer id into a few random numbers, and those numbers say whether the cell has a flake, where it sits and how it sways. To make it fall, slide the whole grid down over time.")}
      </p>
      <CodeBlock lang="glsl" filename="snow_layer.glsl" t={t}>{`// One sheet of snow at depth z: how much flake covers this pixel
float layer(vec2 p, float z) {
    vec2 w = p * z + vec2(camX, 0.0);        // where this pixel's ray meets the sheet, in metres
    w += vec2(-wind, fall) * time;           // the air carries the snow: fall down, drift with the wind
    vec2 cell = w / D;                       // into cells D metres wide
    vec2 id = floor(cell), f = fract(cell) - 0.5;
    vec3 h = hash32(id);                     // three random numbers for this cell
    if (h.z > density) return 0.0;           // most cells are empty
    vec2 c = (h.xy - 0.5) * 0.3;             // the flake's place in its cell, |c| ≤ 0.15
    c.x += 0.12 * sway * sin(time * (1.5 + 2.0 * h.y) + 6.28 * h.x);
    float r = 0.045 + 0.045 * h.y;           // its radius, at most 0.09
    return smoothstep(r, 0.5 * r, length(f - c));
}`}</CodeBlock>
      <p>
        {tx(t, "glslSnow_budgetBody",
          "This only works if each flake stays inside its own cell. The pixel never looks at the neighbouring cells, so a flake that pokes over the edge is simply cut off there, with a straight edge. With the cell running from −0.5 to 0.5, everything that moves the flake away from the centre must add up to less than half a cell:")}
      </p>
      <Equation label={tx(t, "glslSnow_budgetLabel", "The cell budget")}
        where={[
          [r`|c|`, tx(t, "glslSnow_wC", "how far the hash places the flake from the cell's centre: up to 0.15")],
          [r`s`, tx(t, "glslSnow_wS", "the sway, a sine that rocks it from side to side: up to 0.12")],
          [r`r`, tx(t, "glslSnow_wR", "the flake's radius: up to 0.09")],
          [r`b`, tx(t, "glslSnow_wB", "the extra radius of the defocus blur, below: kept under 0.12")],
        ]}
        words={tx(t, "glslSnow_budgetWords", "Add up the worst case of everything that moves the flake or makes it bigger. If it stays under half a cell, no flake ever touches an edge. If a design needs more, check the 3 × 3 cells around the pixel instead of one: it removes the limit and costs nine times as much.")}>
        {r`|c| + s + r + b \;\le\; 0.5 \qquad 0.15 + 0.12 + 0.09 + 0.12 = 0.48`}
      </Equation>

      <H3>{tx(t, "glslSnow_depthTitle", "Depth for free: a stack of sheets")}</H3>
      <p>
        {tx(t, "glslSnow_depthBody",
          "One grid looks like a flat curtain. Real snow is at every depth, so the shader draws several grids, one for each of a stack of flat sheets at depths z from about a metre to twenty-five. A pinhole camera puts a point at depth z and height Y on the screen at y = f · Y / z, with f the focal length. So a pixel at screen position p looks through the sheet at depth z at the world point p · z. Work in metres on the sheet, divide by the cell size, and the perspective takes care of itself:")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_parDer", "Why every sheet uses the same code")}
        where={[
          [r`z`, tx(t, "glslSnow_wZ", "the depth of one sheet of snow, in metres")],
          [r`D`, tx(t, "glslSnow_wD", "the width of a cell on the sheet, in metres (35 cm here)")],
          [r`v`, tx(t, "glslSnow_wV", "how fast the snow falls, in metres per second (about 1 m/s for real snow)")],
          [r`f`, tx(t, "glslSnow_wF", "the focal length: here 1, so screen units are the tangent of the angle from the centre")],
        ]}
        steps={[
          { full: true, tex: r`\text{cell on screen} = \frac{f\,D}{z}, \qquad \text{speed on screen} = \frac{f\,v}{z}`,
            why: tx(t, "glslSnow_p1", "anything of size D, or anything moving v per second, at depth z shrinks on screen by f/z. Twice as far looks half as big and moves half as fast: that difference between near and far is parallax") },
          { full: true, tex: r`\text{speed in cells} = \frac{f v / z}{f D / z} = \frac{v}{D}`,
            why: tx(t, "glslSnow_p2", "measured in the sheet's own cells, z cancels. Every sheet falls at the same number of cells per second; only the size of its cells differs") },
          { full: true, tex: r`\text{cell} = \frac{\mathbf p\, z + \mathbf m(t)}{D}`,
            why: tx(t, "glslSnow_p3", "so the code adds all motion m(t) in metres (falling, wind, the camera walking) and divides by D once. Depth enters in exactly one place, the multiplication by z, and near sheets come out big and fast, far ones small and slow, without a line of code for it") },
        ]} />
      <LiveFormula label={tx(t, "glslSnow_livePar", "Try it: one sheet at depth z")}
        tex={r`\frac{f D}{z}, \qquad \frac{f v}{z}, \qquad \frac{v}{D}`}
        vars={[
          { id: "z", label: "z", min: 1, max: 25, step: 0.5, value: 2, fmt: v => `${v} m` },
          { id: "v", label: "v", min: 0.3, max: 2.5, step: 0.05, value: 1, fmt: v => `${v.toFixed(2)} m/s` },
        ]}
        compute={parallaxNumbers(t)}
        note={tx(t, "glslSnow_liveParNote", "At 2 m a cell is 0.175 screen units wide and a flake moves 0.5 units per second, a quarter of the screen's height (which runs from −1 to 1). Move z to 20 m: the cell is ten times smaller and ten times slower on screen, but the last line does not change at all.")} />
      <p>
        {tx(t, "glslSnow_lookBody",
          "Three more things make the sheets look like air full of snow rather than layers of dots. Fog: a far flake is mixed towards the colour of the night with the exponential fog of the previous chapter, e^(−ρz). Light: each flake knows its real position in metres, so it can ask a street lamp how far away it is and take 1/distance² of its light, which makes the flakes in the lamp's cone glow and the ones in front of it stay dark. Order: the sheets are added front to back, each one covering a fraction of what is behind it, exactly as in volume rendering. And defocus, which makes near flakes the big soft discs every snowy photograph has:")}
      </p>
      <Equation label={tx(t, "glslSnow_cocLabel", "Circle of confusion")}
        where={[
          [r`c`, tx(t, "glslSnow_wCoc", "the diameter of the blurry disc a point turns into, on the sensor")],
          [r`A`, tx(t, "glslSnow_wAp", "the diameter of the lens opening (the aperture): 0 is a pinhole, where everything is sharp")],
          [r`z_f`, tx(t, "glslSnow_wZf", "the distance the camera is focused at")],
          [r`r`, tx(t, "glslSnow_wRr", "the flake's sharp radius; the blurred disc has radius r + c")],
        ]}
        words={tx(t, "glslSnow_cocWords", "A lens focused at z_f turns a point at another depth into a disc, bigger the larger the opening and the further 1/z is from 1/z_f. The light of the flake is the same, just spread over a bigger disc, so its brightness drops by the ratio of the two areas.")}>
        {r`\begin{gathered} c \;\approx\; A\,f\,\left|\frac{1}{z} - \frac{1}{z_f}\right| \\[4pt] \text{brightness} \times \left(\frac{r}{r + c}\right)^{2} \end{gathered}`}
      </Equation>
      <SnowfallFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "glslSnow_3dTip", "The sheets are a cheat: a flake never moves from one sheet to another. For snow the camera can fly through, a shader steps along the ray through a 3D grid of cells, one cell per step (a DDA, as in voxel ray casting), and looks for one flake in each. Games usually skip the shader and use GPU particles in a box that travels with the camera: a flake that falls out of the box comes back in at the other side, using mod on its position, so a few thousand flakes are always enough.")}
      </Callout>
      <p>
        {tx(t, "glslSnow_pgBody",
          "Both ideas fit in a few dozen lines. The playground has them as editable shaders: the folded flake, and a stack of falling sheets without the street.")}
      </p>
      <ShaderPlayground presets={SNOW_PRESETS} t={t} id="glslSnow" editorOpen={false} />
    </>
  );
}

// ── Footprints ────────────────────────────────────────────────────────────────

function DeformSection({ t }: { t: TrackTranslations }) {
  return (
    <>
      <H2>{tx(t, "glslSnow_defTitle", "Footprints: snow that remembers")}</H2>
      <p>
        {tx(t, "glslSnow_defBody",
          "In a game, the snow on the ground has to keep every step the player takes, and every track of every wolf and sled, and nobody keeps a list of footprints. The usual answer, made famous by Batman: Arkham Origins in 2013, is a texture: a picture of the snow's height seen from above, covering the ground around the player. It takes four steps, all on the GPU, every frame:")}
      </p>
      <LessonTable
        headers={[
          tx(t, "glslSnow_thStep", "step"),
          tx(t, "glslSnow_thWhat", "what it does"),
          tx(t, "glslSnow_thWhere", "where it runs"),
        ]}
        rows={[
          [tx(t, "glslSnow_s1", "1. height texture"), tx(t, "glslSnow_s1w", "one number h per texel: 1 is fresh snow, 0 is the ground, a little over 1 is snow pushed up into a rim"), tx(t, "glslSnow_s1r", "a render target, here 512 × 512 over 6 × 6 m: 1.2 cm per texel")],
          [tx(t, "glslSnow_s2", "2. stamp"), tx(t, "glslSnow_s2w", "press everything that touches the snow into it: h = min(h, its underside)"), tx(t, "glslSnow_s2r", "a fullscreen pass over the texture, ping-pong between two copies")],
          [tx(t, "glslSnow_s3", "3. displace"), tx(t, "glslSnow_s3w", "sink the snow's surface by depth · (h − 1)"), tx(t, "glslSnow_s3r", "the vertex shader of a dense grid (or tessellation)")],
          [tx(t, "glslSnow_s4", "4. light"), tx(t, "glslSnow_s4w", "normals and shadows from the same texture"), tx(t, "glslSnow_s4r", "the fragment shader")],
        ]} />
      <Equation label={tx(t, "glslSnow_stampLabel", "The stamp")}
        where={[
          [r`h(\mathbf p)`, tx(t, "glslSnow_wH", "the snow's height at the point p of the ground, as a fraction of the fresh snow's depth: 1 untouched, 0 pressed down to the ground")],
          [r`s(\mathbf p)`, tx(t, "glslSnow_wSp", "the underside of the object touching the snow above p, in the same units; everywhere the object is not, s is above 1 and changes nothing")],
        ]}
        words={tx(t, "glslSnow_stampWords", "Snow is crushed, not squeezed like a sponge: where a boot pressed it down, it stays down after the boot lifts. So the new height is the lower of the old height and the boot's sole. min does exactly that, and it also makes the order of the stamps irrelevant.")}>
        {r`h_{new}(\mathbf p) = \min\big(h_{old}(\mathbf p),\ s(\mathbf p)\big)`}
      </Equation>
      <p>
        {tx(t, "glslSnow_pingBody",
          "A pass cannot read the texture it is writing, so there are two copies: each frame reads A and writes B, and the next frame swaps them. This is called ping-pong. The stamps here are shapes written in the shader: a boot is two ellipses joined smoothly, with lugs across the sole, and a snowball is a sphere. A game with characters of any shape renders them from below instead: an orthographic camera under the ground, looking up, draws the depth of everything above it into a texture, and that depth is the underside to press with. For a sphere, the underside is easy to work out:")}
      </p>
      <Derivation t={t} label={tx(t, "glslSnow_ballDer", "The print of a snowball")}
        where={[
          [r`\rho`, tx(t, "glslSnow_wRho", "the ball's radius")],
          [r`\delta`, tx(t, "glslSnow_wDelta", "how far its bottom has sunk below the snow's top, which is at y = 0")],
          [r`r`, tx(t, "glslSnow_wRr2", "the distance on the ground from the point straight under the ball's centre")],
        ]}
        steps={[
          { full: true, tex: r`c = \rho - \delta`,
            why: tx(t, "glslSnow_b1", "the centre sits one radius above the ball's bottom, and the bottom is at −δ") },
          { full: true, tex: r`y_b(r) = c - \sqrt{\rho^2 - r^2} \qquad (r < \rho)`,
            why: tx(t, "glslSnow_b2", "the lower half of the sphere: a point of it at distance r from the axis is √(ρ² − r²) below the centre, by Pythagoras. This is s(p), turned into h by dividing by the snow's depth and adding 1") },
          { full: true, tex: r`y_b(r_c) = 0 \;\Rightarrow\; r_c = \sqrt{\rho^2 - c^2} = \sqrt{2\rho\delta - \delta^2}`,
            why: tx(t, "glslSnow_b3", "the print ends where the sphere comes up through the snow's top. Expand (ρ − δ)² and the ρ² cancels. Past r_c the ball is above the snow and the stamp does nothing; that ring is where the pushed-aside snow piles up") },
        ]} />
      <LiveFormula label={tx(t, "glslSnow_liveBall", "Try it: how wide is the trench?")}
        tex={r`r_c = \sqrt{2\rho\delta - \delta^2}`}
        vars={[
          { id: "rho", label: "ρ", min: 5, max: 60, step: 1, value: 30, fmt: v => `${v} cm` },
          { id: "delta", label: "δ", min: 0, max: 60, step: 1, value: 10, fmt: v => `${v} cm` },
        ]}
        compute={ballPrintNumbers(t)}
        note={tx(t, "glslSnow_liveBallNote", "A 30 cm ball sunk only 10 cm already leaves a trench 75% as wide as itself: near its bottom a sphere is flat, so a little sinking spreads a long way sideways. Sink it to δ = ρ, half the ball buried, and the trench is exactly as wide as the ball.")} />
      <CodeBlock lang="glsl" filename="stamp.frag" t={t}>{`uniform sampler2D uPrev;        // last frame's heights (the other ping-pong copy)
uniform vec3 uBall;              // xz = where the ball is, z = its centre's height c
uniform float uRadius, uDepth, uRefill;

void main() {
    float h = texture(uPrev, vUV).r;
    vec2 p = (vUV * 2.0 - 1.0) * HALF;               // this texel's place on the ground, m
    h += (1.0 - h) * uRefill;                        // fresh snow, see below
    float r = length(p - uBall.xy);
    if (r < uRadius) {
        float yb = uBall.z - sqrt(uRadius * uRadius - r * r);
        h = min(h, max(1.0 + yb / uDepth, 0.0));     // the stamp
    }
    FragColor = vec4(h, 0.0, 0.0, 1.0);
}`}</CodeBlock>

      <H3>{tx(t, "glslSnow_dispTitle", "Sinking the mesh and lighting it")}</H3>
      <p>
        {tx(t, "glslSnow_dispBody",
          "The snow is drawn as a grid of vertices, and its vertex shader reads the texture once per vertex and moves the vertex down. The grid has to be dense, or the prints come out as blocky dents: here it has 256 × 256 vertices over 6 m, one every 2.3 cm. Desktop games often use tessellation to add vertices only near the camera, or skip moving vertices at all and fake the depth in the fragment shader with parallax occlusion mapping. The lighting does not use the moved vertices. It reads the slope of the texture directly in every pixel, which is sharper:")}
      </p>
      <CodeBlock lang="glsl" filename="snow.vert" t={t}>{`layout(location = 0) in vec2 aXZ;                   // the grid, −1…1
uniform sampler2D uMap;
uniform mat4 uVP;
out vec2 vUV;

void main() {
    vUV = aXZ * 0.5 + 0.5;
    float h = textureLod(uMap, vUV, 0.0).r;          // the vertex shader must pick the mip level itself
    vec3 world = vec3(aXZ.x * HALF, uDepth * (h - 1.0), aXZ.y * HALF);
    gl_Position = uVP * vec4(world, 1.0);
}`}</CodeBlock>
      <Equation label={tx(t, "glslSnow_normLabel", "The normal from a height texture")}
        where={[
          [r`y(x, z)`, tx(t, "glslSnow_wY", "the snow's height in metres, uDepth · (h − 1)")],
          [r`e`, tx(t, "glslSnow_wE", "one texel, in metres: 6 m / 512 ≈ 1.2 cm")],
        ]}
        words={tx(t, "glslSnow_normWords", "Read the height one texel to each side and divide the difference by the distance between them: that is the slope in x, and the same in z. A surface that rises by a in x and b in z for each metre has the normal (−a, 1, −b), made unit length.")}>
        {r`\begin{gathered} \frac{\partial y}{\partial x} \approx \frac{y(x + e, z) - y(x - e, z)}{2e} \\[4pt] \mathbf n = \operatorname{normalize}\!\left(-\frac{\partial y}{\partial x},\ 1,\ -\frac{\partial y}{\partial z}\right) \end{gathered}`}
      </Equation>
      <p>
        {tx(t, "glslSnow_shadeBody",
          "Snow is bright and almost the same colour everywhere, so a footprint has hardly any contrast of its own. What makes it readable is a low sun and the shadows it casts. The shader finds them in the texture as well: from each pixel it steps towards the sun across the height texture, and if the snow is ever higher than the ray, the pixel is in shadow. Two smaller touches: the packed snow at the bottom of a print is tinted blue, because light travels further inside dense snow and red is absorbed on the way, and a few grains with randomly tilted facets mirror the sun, which is the sparkle of fresh snow.")}
      </p>
      <Equation label={tx(t, "glslSnow_refillLabel", "Fresh snow, at any frame rate")}
        where={[
          [r`k`, tx(t, "glslSnow_wK", "how fast fresh snow fills the prints, per second")],
          [r`\Delta t`, tx(t, "glslSnow_wDt", "the time since the last frame, in seconds")],
        ]}
        words={tx(t, "glslSnow_refillWords", "Each frame, close a fraction of the gap between h and fresh snow (1). Written with e^(−kΔt), the gap is multiplied by e^(−kΔt) every frame, and those factors multiply to e^(−k · total time): two frames of 1/60 s fill exactly as much as one of 1/30 s. With a plain h += k·Δt, a fast and a slow computer would fill at different rates. Pushed-up rims sink back the same way, since for them 1 − h is negative.")}>
        {r`h \;\leftarrow\; h + (1 - h)\left(1 - e^{-k\,\Delta t}\right)`}
      </Equation>
      <DeformSnowFigure t={t} />
      <Callout type="tip" t={t}>
        {tx(t, "glslSnow_worldTip", "A texture can only cover a few metres around the player, but a game world is kilometres wide. So the texture moves with the player. Read and write it at fract(position / size), so that it wraps around like a torus, and each time the player crosses into a new row of texels, clear the row that comes in on the far side: it is the old row that just went out of range behind. Footprints far behind are lost, which nobody notices because new snow would have covered them anyway.")}
      </Callout>
    </>
  );
}

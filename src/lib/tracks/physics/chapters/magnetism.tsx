"use client";

// Electricity 4: magnetism — magnets, poles that never come alone, the field
// B and its closed lines, the Earth's field; the force on a moving charge
// F = qv × B, which does no work; circular motion derived (r = mv/qB and a
// period that ignores the speed), the cyclotron, mass spectrometer and
// aurora; the force on a current derived from it, and the electric motor;
// currents make fields: Ørsted, the long wire from Ampère's law, the
// solenoid, the force between parallel wires; magnetic materials.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { ChargeInFieldFigure } from "@/components/lesson/figures/physics/ChargeInFieldFigure";
import { WireFieldFigure } from "@/components/lesson/figures/physics/WireFieldFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** The force on a straight wire across a field: F = B I L. */
const wireNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const F = v.B * v.I * v.L;
  return {
    tex: r`F = ${num(v.B, 2)}\ \text{T} \times ${num(v.I, 1)}\ \text{A} \times ${num(v.L, 2)}\ \text{m} = \amber{${num(F, 3)}\ \text{N}}`,
    meter: Math.min(1, F / 5), meterLabel: `${tx(t, "phMag_liveWeight", "the weight of")} ${num((F / 9.81) * 1000, 0)} g`,
  };
};

export function MagnetismContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phMag_intro",
          "A compass needle swings north, a fridge magnet holds up a shopping list, an MRI scanner looks inside the body, and every electric motor, from a phone's vibrator to a train, turns because of magnetism. For centuries magnets seemed to have nothing to do with electricity. Then in 1820 Hans Christian Ørsted noticed a compass needle twitch when he switched on a current in a nearby wire. This chapter follows that clue: magnetic fields push on moving charges, and moving charges make magnetic fields.")}
      </Lead>

      <Goals t={t} id="phMag" items={[
        "Describe magnets and the magnetic field B, and read its field lines.",
        "Use the force on a moving charge, F = qv × B, and derive the circular path it causes.",
        "Find the force on a current-carrying wire and explain how an electric motor turns.",
        "Find the field of a long wire and of a solenoid from Ampère's law, and the force between two currents.",
      ]} />

      <H2>{tx(t, "phMag_magTitle", "Magnets and the magnetic field")}</H2>
      <p>
        {tx(t, "phMag_magBody",
          "Every magnet has two ends, a north pole and a south pole. Like poles repel, unlike poles attract. Unlike electric charges, the poles never come alone: cut a bar magnet in half and you get two smaller magnets, each with its own north and south. No isolated magnetic pole has ever been found. Around a magnet there is a magnetic field, written B and measured in teslas (T). Its field lines leave the north pole, curve round and enter the south pole, then carry on through the magnet: they are closed loops with no beginning and no end, which is why the magnetic flux out of any closed surface is always zero.")}
      </p>
      <p>
        {tx(t, "phMag_earthBody",
          "The Earth is a magnet too, thanks to currents of molten iron in its core. A compass needle is a small magnet free to turn, and its north pole points along the field, towards the Arctic. Since unlike poles attract, the Earth's magnetic pole up there is, strictly speaking, a south pole. The field at the surface is between 25 and 65 microteslas.")}
      </p>
      <LessonTable
        headers={[tx(t, "phMag_tWhere", "Where"), tx(t, "phMag_tB", "Magnetic field")]}
        rows={[
          [tx(t, "phMag_b1", "the Earth's surface"), tx(t, "phMag_b1v", "25–65 µT")],
          [tx(t, "phMag_b2", "a fridge magnet"), tx(t, "phMag_b2v", "about 5 mT")],
          [tx(t, "phMag_b3", "the surface of a strong neodymium magnet"), tx(t, "phMag_b3v", "about 1 T")],
          [tx(t, "phMag_b4", "a hospital MRI scanner"), tx(t, "phMag_b4v", "1.5–3 T")],
          [tx(t, "phMag_b5", "the strongest steady laboratory magnets"), tx(t, "phMag_b5v", "about 45 T")],
          [tx(t, "phMag_b6", "a magnetar (a kind of neutron star)"), tx(t, "phMag_b6v", "up to 10¹¹ T")],
        ]}
      />

      <H2>{tx(t, "phMag_forceTitle", "The force on a moving charge")}</H2>
      <p>
        {tx(t, "phMag_forceBody",
          "A magnetic field does nothing to a charge at rest. It pushes only on moving charges, and in a strange direction: neither along the field nor along the motion, but at right angles to both. The force is given by a cross product, a way of multiplying two arrows that gives a third arrow perpendicular to both (the Math track's chapter on the cross product explains it).")}
      </p>
      <Equation label={tx(t, "phMag_eqLorentz", "The magnetic force on a moving charge")}
        where={[
          [r`\vec F`, tx(t, "phMag_wF", "the force on the charge (N)")],
          [r`q`, tx(t, "phMag_wQ", "its charge (C), with its sign")],
          [r`\vec v`, tx(t, "phMag_wV", "its velocity (m/s)")],
          [r`\vec B`, tx(t, "phMag_wB", "the magnetic field (T); one tesla is the field that pushes 1 N on 1 C moving at 1 m/s across it")],
          [r`\theta`, tx(t, "phMag_wTh", "the angle between v and B")],
        ]}
        words={tx(t, "phMag_lorentzWords", "The force is biggest when the charge moves straight across the field, zero when it moves along the field, and always at right angles to both.")}
        note={tx(t, "phMag_lorentzNote", "Right-hand rule: point your fingers along v, curl them towards B, and your thumb gives the force on a positive charge; on a negative charge it is the opposite way. Together with the electric force, the total F = q(E + v × B) is called the Lorentz force.")}>
        {r`\vec F = q\,\vec v \times \vec B, \qquad F = |q|\,v\,B\,\sin\theta`}
      </Equation>
      <p>
        {tx(t, "phMag_noWorkBody",
          "Because the force is always perpendicular to the velocity, it never pushes a charge forwards or backwards along its path. It does no work: a magnetic field can bend a charged particle's path but can never change its speed or its energy.")}
      </p>
      <H3>{tx(t, "phMag_circleTitle", "Charges go round in circles")}</H3>
      <Derivation t={t} label={tx(t, "phMag_eqCircle", "The circle of a charge in a uniform field")}
        steps={[
          { tex: r`F = |q|\,v\,B`, why: tx(t, "phMag_c1", "a charge moving at right angles to a uniform field feels a constant sideways force") },
          { tex: r`|q|\,v\,B = \frac{m v^2}{r}`, why: tx(t, "phMag_c2", "a constant force at right angles to the motion is exactly what circular motion needs: it supplies the centripetal force m v² / r (from the circular motion chapter)") },
          { tex: r`\green{r = \frac{m v}{|q| B}}`, why: tx(t, "phMag_c3", "solve for the radius: faster or heavier particles curve less, stronger fields curve them more") },
          { tex: r`T = \frac{2\pi r}{v} = \frac{2\pi m}{|q| B}`, why: tx(t, "phMag_c4", "one turn is 2πr long; the speed cancels: every particle of the same kind takes the same time per turn, fast or slow") },
        ]} />
      <ChargeInFieldFigure t={t} />
      <LessonTable
        headers={[tx(t, "phMag_tApp", "Where"), tx(t, "phMag_tUses", "What the circling does")]}
        rows={[
          [tx(t, "phMag_a1", "mass spectrometer"), tx(t, "phMag_a1h", "ions with the same speed and charge curve with r ∝ m, so different masses land in different places: it weighs atoms and identifies molecules")],
          [tx(t, "phMag_a2", "cyclotron"), tx(t, "phMag_a2h", "since T does not depend on speed, a voltage flipped at a fixed rhythm can kick particles every half turn as they spiral outwards, faster and faster")],
          [tx(t, "phMag_a3", "aurora"), tx(t, "phMag_a3h", "charged particles from the Sun spiral along the Earth's field lines down towards the poles, where they make the air glow")],
          [tx(t, "phMag_a4", "velocity selector"), tx(t, "phMag_a4h", "an electric field E across a magnetic field lets through undeflected only particles with qE = qvB, that is v = E/B")],
        ]}
      />

      <H2>{tx(t, "phMag_wireTitle", "The force on a current")}</H2>
      <p>
        {tx(t, "phMag_wireBody",
          "A current is a stream of moving charges, so a wire carrying current across a magnetic field is pushed sideways too. The force on the wire is the sum of the forces on all its drifting electrons.")}
      </p>
      <Derivation t={t} label={tx(t, "phMag_eqWire", "The force on a straight wire")}
        steps={[
          { tex: r`F_1 = q\,v_d\,B`, why: tx(t, "phMag_w1", "each charge drifting at speed v_d across the field feels this force") },
          { tex: r`N = n\,A\,L`, why: tx(t, "phMag_w2", "a length L of wire with cross-section A holds n A L moving charges") },
          { tex: r`F = n A L\, q\,v_d\,B = (n q A v_d)\, L\, B`, why: tx(t, "phMag_w3", "multiply; the bracket is exactly the current I = n q A v_d (previous chapter)") },
          { tex: r`\green{F = B\,I\,L\,\sin\theta}`, why: tx(t, "phMag_w4", "with θ the angle between the wire and the field; in vector form F = I L × B") },
        ]} />
      <LiveFormula label={tx(t, "phMag_liveWire", "Try it: a wire across a magnet's field")}
        tex={r`F = B\,I\,L`}
        vars={[
          { id: "B", label: "B (T)", min: 0.01, max: 1.5, step: 0.01, value: 0.4, fmt: v => `${num(v, 2)} T` },
          { id: "I", label: "I (A)", min: 0, max: 20, step: 0.5, value: 5, fmt: v => `${num(v, 1)} A` },
          { id: "L", label: "L (m)", min: 0.01, max: 0.5, step: 0.01, value: 0.2, fmt: v => `${num(v, 2)} m` },
        ]}
        compute={wireNumbers(t)}
        note={tx(t, "phMag_liveWireNote", "A 20 cm wire carrying 5 A between the poles of a strong magnet (0.4 T) is pushed with 0.4 N, the weight of 40 g. Loudspeakers use exactly this: the current from the amplifier runs through a coil sitting in a magnet's field, and the force on it drives the cone back and forth.")} />
      <p>
        {tx(t, "phMag_motorBody",
          "Put a rectangular loop of wire in a field and send a current round it. The two sides that run across the field carry current in opposite directions, so one is pushed up and the other down: the loop feels a twist, a torque τ = N I A B sin θ for a coil of N turns and area A, where θ is the angle between the field and the line perpendicular to the coil. When the coil reaches the position where the torque would reverse, a sliding contact called a commutator flips the current, and the coil keeps turning the same way. That is a direct-current electric motor.")}
      </p>

      <H2>{tx(t, "phMag_makeTitle", "Currents make magnetic fields")}</H2>
      <p>
        {tx(t, "phMag_makeBody",
          "Ørsted's twitching compass showed the other half of the story: a current makes a magnetic field around it. Around a long straight wire the field lines are circles centred on the wire. Grip the wire with your right hand, thumb along the current, and your fingers curl the way the field goes. André-Marie Ampère turned this into a law that plays the role for magnetism that Gauss's law plays for electricity.")}
      </p>
      <Equation label={tx(t, "phMag_eqAmpere", "Ampère's law")}
        where={[
          [r`\oint \vec B \cdot d\vec l`, tx(t, "phMag_wCirc", "the field along each small step dl of a closed loop, added up all the way round (the circulation)")],
          [r`I_{through}`, tx(t, "phMag_wIth", "the total current passing through the loop (A)")],
          [r`\mu_0`, tx(t, "phMag_wMu", "the permeability of free space, 4π × 10⁻⁷ T·m/A")],
        ]}
        words={tx(t, "phMag_ampereWords", "Go round any closed loop adding up the magnetic field along it: the total is μ₀ times the current threading the loop.")}
        note={tx(t, "phMag_ampereNote", "Like Gauss's law, it is always true but quickly useful only when symmetry makes B the same all along a well-chosen loop. In the chapter on Maxwell's equations it gains one more term, the one that predicts light.")}>
        {r`\oint \vec B \cdot d\vec l = \mu_0\, I_{through}`}
      </Equation>
      <Derivation t={t} label={tx(t, "phMag_eqLong", "The field of a long wire and of a solenoid")}
        steps={[
          { tex: r`B \cdot 2\pi r = \mu_0 I`, why: tx(t, "phMag_l1", "take a circle of radius r around a long wire: by symmetry B is the same all round it and points along it, so the circulation is B times the circumference") },
          { tex: r`\green{B_{wire} = \frac{\mu_0 I}{2\pi r}}`, why: tx(t, "phMag_l2", "so the field falls as 1/r, not 1/r²") },
          { tex: r`B\,\ell = \mu_0\, (n\ell)\, I`, why: tx(t, "phMag_l3", "a solenoid is a long coil with n turns per metre. Take a rectangular loop with one side of length ℓ inside the coil, along the axis, and the other side outside where the field is almost zero; it is threaded by n ℓ turns, each carrying I") },
          { tex: r`\green{B_{solenoid} = \mu_0\, n\, I}`, why: tx(t, "phMag_l4", "a uniform field inside, the same everywhere across the coil, and independent of its width") },
        ]} />
      <WireFieldFigure t={t} />
      <p>
        {tx(t, "phMag_twoBody",
          "Two parallel wires each sit in the other's field, so each feels a force. Wire 2, carrying I₂, sits in wire 1's field μ₀I₁/(2πd), and feels a force per metre F/L = I₂ B₁ = μ₀ I₁ I₂ / (2π d). Currents in the same direction attract; opposite currents repel. Until 2019 this was how the ampere was defined: the current that makes two parallel wires 1 m apart attract with 2 × 10⁻⁷ N per metre.")}
      </p>
      <H3>{tx(t, "phMag_matTitle", "Magnetic materials")}</H3>
      <p>
        {tx(t, "phMag_matBody",
          "If magnetic fields come from moving charges, where is the current in a bar magnet? Inside its atoms: electrons orbit and spin, and each behaves like a tiny loop of current, a tiny magnet. In most materials these cancel. In iron, nickel and cobalt, neighbouring atoms line up their magnets in regions called domains, and when the domains line up too, the whole piece is magnetised. A coil wound on an iron core, an electromagnet, makes a field hundreds to thousands of times stronger than the coil alone, and it can be switched off. Heat a magnet above its Curie temperature (770 °C for iron) and the jiggling of the atoms destroys the order: it stops being a magnet.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phMag_relativity", "Why should moving charges be special? Because electric and magnetic fields are two faces of one thing. A charge at rest in your frame makes only an electric field; seen by someone moving past, the same charge is a current and makes a magnetic field too. The chapters on relativity show that magnetism is what the electric force looks like when you account properly for motion, and the next chapters show changing magnetic fields making electric ones.")}
      </Callout>

      <H2>{tx(t, "phMag_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phMag_ex1", "1. A proton at 1.0 × 10⁶ m/s across a field of 0.10 T: r = m v / (q B) = 1.673 × 10⁻²⁷ × 10⁶ / (1.602 × 10⁻¹⁹ × 0.1) = 0.10 m, and one turn takes T = 2πm/(qB) = 0.66 µs.")}</p>
      <p>{tx(t, "phMag_ex2", "2. An electron at 1.0 × 10⁷ m/s across the Earth's field of 50 µT: r = 9.11 × 10⁻³¹ × 10⁷ / (1.602 × 10⁻¹⁹ × 5 × 10⁻⁵) = 1.1 m. That is why old television tubes needed magnetic shielding.")}</p>
      <p>{tx(t, "phMag_ex3", "3. A wire 0.20 m long carrying 5.0 A at right angles to a 0.40 T field: F = B I L = 0.40 × 5.0 × 0.20 = 0.40 N.")}</p>
      <p>{tx(t, "phMag_ex4", "4. The field 5.0 cm from a wire carrying 10 A: B = 4π × 10⁻⁷ × 10 / (2π × 0.05) = 4.0 × 10⁻⁵ T = 40 µT, about the Earth's field: a compass near household wiring can be fooled.")}</p>
      <p>{tx(t, "phMag_ex5", "5. A solenoid with 1 000 turns per metre carrying 2.0 A: B = μ₀ n I = 4π × 10⁻⁷ × 1 000 × 2.0 = 2.5 × 10⁻³ T = 2.5 mT, uniform inside. An iron core would raise it to about a tesla.")}</p>

      <H2>{tx(t, "phMag_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phMag_tWrong", "Wrong"), tx(t, "phMag_tRight", "Right"), tx(t, "phMag_tWhy", "Why")]}
        rows={[
          [tx(t, "phMag_m1w", "a magnet pushes on a charge at rest"), tx(t, "phMag_m1r", "only on moving charges"), tx(t, "phMag_m1", "F = qv × B is zero when v = 0")],
          [tx(t, "phMag_m2w", "the force points along the field lines"), tx(t, "phMag_m2r", "at right angles to them"), tx(t, "phMag_m2", "it is perpendicular to both v and B")],
          [tx(t, "phMag_m3w", "a magnetic field can speed a charge up"), tx(t, "phMag_m3r", "it can only bend its path"), tx(t, "phMag_m3", "a force perpendicular to the motion does no work")],
          [tx(t, "phMag_m4w", "magnetic field lines end on the poles"), tx(t, "phMag_m4r", "they are closed loops"), tx(t, "phMag_m4", "they continue through the magnet; there are no magnetic charges")],
          [tx(t, "phMag_m5w", "a wire's field falls as 1/r²"), tx(t, "phMag_m5r", "as 1/r"), tx(t, "phMag_m5", "from Ampère's law: B × 2πr = μ₀I")],
          [tx(t, "phMag_m6w", "parallel currents repel, like like charges"), tx(t, "phMag_m6r", "they attract"), tx(t, "phMag_m6", "currents the same way pull together")],
        ]}
      />

      <KeyIdeas t={t} id="phMag" items={[
        "Magnets always have a north and a south pole; magnetic field lines are closed loops, and B is measured in teslas.",
        "A moving charge feels F = q v × B, perpendicular to its motion, so the field bends its path but does no work.",
        "In a uniform field a charge circles with r = mv/(|q|B) and period 2πm/(|q|B), independent of its speed.",
        "A current in a field feels F = B I L sin θ; a coil feels a torque, which turns electric motors.",
        "Currents make fields: Ampère's law gives B = μ₀I/(2πr) around a wire and B = μ₀nI inside a solenoid.",
        "Parallel currents attract with F/L = μ₀I₁I₂/(2πd); iron's aligned domains make electromagnets far stronger.",
      ]} />
    </Article>
  );
}

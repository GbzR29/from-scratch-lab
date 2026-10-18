"use client";

// Electricity 2: electric potential and capacitors — the electric force as a
// conservative force and the potential energy of two charges (derived by an
// integral); potential and potential difference (volts), the potential of a
// point charge and superposition as a sum of numbers; equipotentials and
// E = −dV/dx; the electron-volt and accelerating electrons; capacitance, the
// parallel-plate capacitor derived, dielectrics; the energy stored, ½CV²,
// and the energy density of a field; capacitors in parallel and in series.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { EquipotentialFigure } from "@/components/lesson/figures/physics/EquipotentialFigure";
import { CapacitorFigure } from "@/components/lesson/figures/physics/CapacitorFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** An electron accelerated from rest through a voltage V: ½mv² = eV. */
const electronNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const E = 1.602e-19 * v.V, speed = Math.sqrt((2 * E) / 9.109e-31);
  const frac = speed / 2.998e8;
  return {
    tex: r`v = \sqrt{\frac{2 \cdot 1.602\times10^{-19} \cdot ${num(v.V, 0)}}{9.109\times10^{-31}}} = \amber{${num(speed / 1e6, 2)}\times10^{6}\ \text{m/s}}`,
    meter: Math.min(1, frac), meterLabel: `${num(frac * 100, 1)}% ${tx(t, "phPot_liveC", "of the speed of light")}${frac > 0.1 ? ` · ${tx(t, "phPot_liveRel", "relativity starts to matter")}` : ""}`,
  };
};

export function ElectricPotentialContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phPot_intro",
          "A torch battery says 1.5 V, a car battery 12 V, a wall socket somewhere between 110 and 240 V, and a lightning stroke can bridge a hundred million volts. Volts measure electric potential, and they are a bookkeeping of energy: how much energy each coulomb of charge gains or gives up between two points. This chapter builds that idea from the electric force, uses it to map fields with lines of equal potential, and then puts it to work in the capacitor, the device that stores energy in an electric field.")}
      </Lead>

      <Goals t={t} id="phPot" items={[
        "Find the potential energy of charges and the potential of a point charge, and add potentials from several charges.",
        "Connect potential to the field: equipotentials, E = −ΔV/Δx, and the energy qΔV a charge gains.",
        "Derive the capacitance of a parallel-plate capacitor and explain what a dielectric does.",
        "Derive the energy stored in a capacitor, ½CV², and combine capacitors in series and in parallel.",
      ]} />

      <H2>{tx(t, "phPot_energyTitle", "Electric potential energy")}</H2>
      <p>
        {tx(t, "phPot_energyBody",
          "Lift a stone and you store energy, mgh, that you get back when it falls. The work you do does not depend on the route, only on the start and finish height: gravity is a conservative force. The electric force between charges has the same 1/r² form and is conservative too, so a charge in a field also has a potential energy U that depends only on where it is. For two point charges it follows from adding up the work.")}
      </p>
      <Derivation t={t} label={tx(t, "phPot_eqUDer", "The potential energy of two charges")}
        steps={[
          { tex: r`F(x) = k\frac{q_1 q_2}{x^2}`, why: tx(t, "phPot_u1", "the repulsion between two charges when they are a distance x apart") },
          { tex: r`U(r) = \int_r^{\infty} F(x)\,dx`, why: tx(t, "phPot_u2", "choose U = 0 when they are infinitely far apart; U(r) is the work the force does as they fly apart from r to infinity, the sum (integral) of F times each small step dx") },
          { tex: r`= k q_1 q_2 \left[-\frac{1}{x}\right]_r^{\infty} = k q_1 q_2 \left(0 + \frac{1}{r}\right)`, why: tx(t, "phPot_u3", "the integral of 1/x² is −1/x (from the Math track's integrals)") },
          { tex: r`\green{U = k\,\frac{q_1 q_2}{r}}`, why: tx(t, "phPot_u4", "positive for like charges (pushing them together stores energy), negative for opposite ones (pulling them apart takes energy)") },
        ]} />
      <p>
        {tx(t, "phPot_bondBody",
          "A negative U means the pair is bound: energy must be supplied to separate them. The electron in hydrogen sits at U = −27.2 eV (the unit is explained below); with its kinetic energy of +13.6 eV, its total is −13.6 eV, and 13.6 eV is exactly the energy needed to pull it out of the atom.")}
      </p>

      <H2>{tx(t, "phPot_potTitle", "Potential and voltage")}</H2>
      <p>
        {tx(t, "phPot_potBody",
          "Just as the field is the force per unit charge, the electric potential V is the potential energy per unit charge. It describes the place, not the charge put there, and its unit, joules per coulomb, is called the volt. What batteries and sockets are labelled with is a potential difference, or voltage: the energy each coulomb gains or loses going from one terminal to the other.")}
      </p>
      <Equation label={tx(t, "phPot_eqPot", "Potential and potential difference")}
        where={[
          [r`V`, tx(t, "phPot_wV", "the potential at a point (V = J/C)")],
          [r`U`, tx(t, "phPot_wU", "the potential energy a charge q would have there (J)")],
          [r`\Delta V`, tx(t, "phPot_wDV", "the potential difference, or voltage, between two points (V)")],
          [r`W`, tx(t, "phPot_wW", "the energy a charge q gains when it falls through the potential difference ΔV (J)")],
          [r`Q,\ r`, tx(t, "phPot_wQr", "the charge making the potential and the distance from it")],
        ]}
        words={tx(t, "phPot_potWords", "One volt is one joule per coulomb. Around a point charge the potential falls as 1/r, not 1/r².")}
        note={tx(t, "phPot_potNote", "Potentials are plain numbers, not arrows, so the potential of several charges is simply the sum of their potentials, with their signs. That makes V far easier to calculate than E. Only differences of potential matter: where V = 0 is a choice, usually infinitely far away, or the ground in a circuit.")}>
        {r`V = \frac{U}{q}, \qquad V_{point} = k\,\frac{Q}{r}, \qquad W = q\,\Delta V`}
      </Equation>
      <H3>{tx(t, "phPot_eqpTitle", "Equipotentials and the field")}</H3>
      <p>
        {tx(t, "phPot_eqpBody",
          "Join all the points with the same potential and you get equipotential surfaces, like the contour lines on a hiking map. A charge moving along one gains or loses no energy, so the field does no work on it there: the field must be perpendicular to every equipotential. And the field points downhill, from high potential to low, steepest where the contours crowd together. Field and potential are two descriptions of the same thing: the field is the slope of the potential.")}
      </p>
      <Equation label={tx(t, "phPot_eqGrad", "The field is the downhill slope of the potential")}
        where={[
          [r`E_x`, tx(t, "phPot_wEx", "the field along a direction x (V/m)")],
          [r`\frac{dV}{dx}`, tx(t, "phPot_wDvdx", "how fast the potential changes per metre along x (the derivative)")],
          [r`d`, tx(t, "phPot_wD", "the distance between two points in a uniform field (m)")],
        ]}
        words={tx(t, "phPot_gradWords", "The field is how many volts the potential drops per metre, in the direction it drops fastest.")}
        note={tx(t, "phPot_gradNote", "This is why N/C and V/m are the same unit. Between two parallel plates the field is uniform, and the voltage between them is simply the field times the gap: 1.5 V across 1 cm is a field of 150 V/m.")}>
        {r`E_x = -\frac{dV}{dx}, \qquad \Delta V = E\,d \ \ (\text{uniform field})`}
      </Equation>
      <EquipotentialFigure t={t} />
      <H3>{tx(t, "phPot_evTitle", "The electron-volt")}</H3>
      <p>
        {tx(t, "phPot_evBody",
          "An electron falling through one volt gains e × 1 V = 1.602 × 10⁻¹⁹ J. This tiny amount is a handy unit for atoms and particles, the electron-volt (eV). Chemical bonds hold a few eV, visible light comes in packets of about 2 eV, and particle accelerators speak of mega- and giga-electron-volts. An electron that starts at rest and falls through a voltage V gains kinetic energy ½mv² = eV.")}
      </p>
      <LiveFormula label={tx(t, "phPot_liveElectron", "Try it: accelerate an electron")}
        tex={r`\tfrac12 m v^2 = e V \ \Rightarrow\ v = \sqrt{\frac{2 e V}{m}}`}
        vars={[
          { id: "V", label: "V (volts)", min: 1, max: 20000, step: 1, value: 100, fmt: v => `${num(v, 0)} V` },
        ]}
        compute={electronNumbers(t)}
        note={tx(t, "phPot_liveElectronNote", "Old television tubes accelerated electrons through about 25 000 V towards the screen. This simple formula then gives about 30% of the speed of light, and its error has already grown to several per cent: near light speed, energy and speed are related differently, as the chapters on relativity will show.")} />

      <H2>{tx(t, "phPot_capTitle", "Capacitors")}</H2>
      <p>
        {tx(t, "phPot_capBody",
          "A capacitor is two conductors close together but not touching. Connect them to a battery and charge flows: +Q gathers on one, −Q on the other, until the voltage between them matches the battery's. The more charge it takes per volt, the larger the capacitance. Its unit, a coulomb per volt, is the farad (F); practical capacitors range from picofarads (10⁻¹² F) to a few farads.")}
      </p>
      <Derivation t={t} label={tx(t, "phPot_eqCapDer", "The capacitance of two parallel plates")}
        steps={[
          { tex: r`C = \frac{Q}{V}`, why: tx(t, "phPot_c1", "the definition: charge stored per volt") },
          { tex: r`E = \frac{\sigma}{\varepsilon_0} = \frac{Q}{\varepsilon_0 A}`, why: tx(t, "phPot_c2", "two plates of area A carrying ±Q make a uniform field between them (Gauss's law, previous chapter); σ = Q/A is the charge per square metre") },
          { tex: r`V = E\,d = \frac{Q\,d}{\varepsilon_0 A}`, why: tx(t, "phPot_c3", "in a uniform field the voltage is field times gap d") },
          { tex: r`\green{C = \frac{\varepsilon_0 A}{d}}`, why: tx(t, "phPot_c4", "divide Q by V: Q cancels, so the capacitance depends only on the shape, larger plates and a smaller gap storing more") },
        ]} />
      <p>
        {tx(t, "phPot_dielBody",
          "Fill the gap with an insulator and the capacitance rises by a factor κ (kappa), the dielectric constant. The material's molecules polarise in the field, their ends lining the plates with charge of the opposite sign that cancels part of the field. A weaker field for the same charge means a lower voltage, so more charge fits per volt: C = κ ε₀ A / d. Every insulator also has a dielectric strength, the field at which it breaks down and sparks across.")}
      </p>
      <LessonTable
        headers={[tx(t, "phPot_tMat", "Material"), tx(t, "phPot_tK", "Dielectric constant κ"), tx(t, "phPot_tBreak", "Breaks down at about")]}
        rows={[
          [tx(t, "phPot_k1", "vacuum"), "1", tx(t, "phPot_k1b", "never")],
          [tx(t, "phPot_k2", "dry air"), tx(t, "phPot_k2k", "1.0006"), "3 MV/m"],
          [tx(t, "phPot_k3", "polyethylene (plastic)"), tx(t, "phPot_k3k", "2.3"), "20 MV/m"],
          [tx(t, "phPot_k4", "paper"), "3–4", "15 MV/m"],
          [tx(t, "phPot_k5", "glass"), "4–10", "10 MV/m"],
          [tx(t, "phPot_k6", "pure water"), "80", tx(t, "phPot_k6b", "conducts if impure")],
        ]}
      />
      <CapacitorFigure t={t} />
      <H3>{tx(t, "phPot_storeTitle", "The energy stored")}</H3>
      <Derivation t={t} label={tx(t, "phPot_eqUDer2", "The energy in a charged capacitor")}
        steps={[
          { tex: r`dW = V\,dq = \frac{q}{C}\,dq`, why: tx(t, "phPot_e1", "moving a small extra charge dq onto plates already at voltage V = q/C costs this much work") },
          { tex: r`U = \int_0^Q \frac{q}{C}\,dq = \frac{Q^2}{2C}`, why: tx(t, "phPot_e2", "add up all the small charges from empty to full: the first ones are cheap, the last ones cost the full voltage") },
          { tex: r`\green{U = \tfrac12 C V^2 = \tfrac12 Q V}`, why: tx(t, "phPot_e3", "using Q = C V; the half is because on average the charge was moved through half the final voltage") },
          { tex: r`u = \frac{U}{A d} = \tfrac12 \varepsilon_0 E^2`, why: tx(t, "phPot_e4", "for plates, put C = ε₀A/d and V = E d and divide by the volume A d between them: the energy lives in the field itself, ½ε₀E² joules per cubic metre") },
        ]} />
      <p>
        {tx(t, "phPot_combBody",
          "Capacitors side by side (in parallel) share the same voltage and their charges add: C = C₁ + C₂, like one capacitor with a bigger area. In a chain (in series) each carries the same charge and the voltages add: 1/C = 1/C₁ + 1/C₂, like one capacitor with a wider gap, so the total is smaller than either.")}
      </p>
      <LessonTable
        headers={[tx(t, "phPot_tUse", "Where"), tx(t, "phPot_tHow", "What the capacitor does")]}
        rows={[
          [tx(t, "phPot_use1", "camera flash"), tx(t, "phPot_use1h", "a small battery charges it slowly; it dumps its energy into the lamp in a millisecond")],
          [tx(t, "phPot_use2", "defibrillator"), tx(t, "phPot_use2h", "about 100 µF charged to about 2 000 V stores ½CV² = 200 J and delivers it to the heart in a few milliseconds")],
          [tx(t, "phPot_use3", "touchscreen"), tx(t, "phPot_use3h", "your finger, a conductor, changes the capacitance of a grid of tiny electrodes under the glass")],
          [tx(t, "phPot_use4", "computer memory (DRAM)"), tx(t, "phPot_use4h", "each bit is a microscopic capacitor, charged for 1 and empty for 0, refreshed many times a second because it leaks")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phPot_battery", "A capacitor and a battery both store energy, differently. A battery stores it in chemical bonds and gives a nearly steady voltage while it empties; a capacitor stores it in a field, its voltage falls as it empties (V = Q/C), and it can release everything almost instantly. Per kilogram, a battery holds hundreds of times more energy, which is why phones use batteries and flashes use capacitors.")}
      </Callout>

      <H2>{tx(t, "phPot_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phPot_ex1", "1. Moving 2 µC from the − to the + terminal of a 12 V battery takes W = q ΔV = 2 × 10⁻⁶ × 12 = 24 µJ.")}</p>
      <p>{tx(t, "phPot_ex2", "2. The potential 10 cm from a 1 nC charge is 8.99 × 10⁹ × 10⁻⁹ / 0.1 = 90 V; at 20 cm it is 45 V. Doubling the distance halves V, but quarters E.")}</p>
      <p>{tx(t, "phPot_ex3", "3. An electron accelerated through 100 V gains 100 eV = 1.6 × 10⁻¹⁷ J, so v = √(2 × 1.6 × 10⁻¹⁷ / 9.11 × 10⁻³¹) = 5.9 × 10⁶ m/s.")}</p>
      <p>{tx(t, "phPot_ex4", "4. Plates of 200 cm² (0.02 m²) 4 mm apart in air: C = 8.854 × 10⁻¹² × 0.02 / 0.004 = 44 pF. At 50 V they hold Q = 2.2 nC and store ½ × 44 × 10⁻¹² × 50² = 55 nJ.")}</p>
      <p>{tx(t, "phPot_ex5", "5. Two capacitors of 10 µF and 40 µF: in parallel they make 50 µF; in series 1/C = 1/10 + 1/40 = 5/40, so C = 8 µF.")}</p>

      <H2>{tx(t, "phPot_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phPot_tWrong", "Wrong"), tx(t, "phPot_tRight", "Right"), tx(t, "phPot_tWhy", "Why")]}
        rows={[
          [tx(t, "phPot_m1w", "potential and potential energy are the same"), tx(t, "phPot_m1r", "V = U/q"), tx(t, "phPot_m1", "V belongs to the place, U to a charge placed there")],
          [tx(t, "phPot_m2w", "adding potentials as arrows"), tx(t, "phPot_m2r", "adding them as numbers with signs"), tx(t, "phPot_m2", "potential is a scalar")],
          [tx(t, "phPot_m3w", "V falls as 1/r²"), tx(t, "phPot_m3r", "V falls as 1/r"), tx(t, "phPot_m3", "it is E that falls as 1/r²")],
          [tx(t, "phPot_m4w", "zero field means zero potential"), tx(t, "phPot_m4r", "zero field means constant potential"), tx(t, "phPot_m4", "E is the slope of V; inside a charged metal shell V is high but E = 0")],
          [tx(t, "phPot_m5w", "a capacitor's C depends on its charge"), tx(t, "phPot_m5r", "only on its shape and the material"), tx(t, "phPot_m5", "Q and V rise together; their ratio is fixed")],
          [tx(t, "phPot_m6w", "the energy stored is C V²"), tx(t, "phPot_m6r", "½ C V²"), tx(t, "phPot_m6", "the charge was moved, on average, through half the final voltage")],
        ]}
      />

      <KeyIdeas t={t} id="phPot" items={[
        "The electric force is conservative; two charges have potential energy U = k q₁ q₂ / r.",
        "Potential is energy per charge, V = U/q, in volts; a point charge gives V = kQ/r, and potentials add as plain numbers.",
        "A charge falling through ΔV gains q ΔV; an electron through 1 V gains 1 eV = 1.602 × 10⁻¹⁹ J.",
        "The field is perpendicular to equipotentials and points downhill: E = −dV/dx, and ΔV = E d in a uniform field.",
        "Capacitance C = Q/V; parallel plates give C = κ ε₀ A / d.",
        "A capacitor stores U = ½CV² = ½QV, in the field itself at ½ε₀E² per cubic metre; parallel capacitances add, series ones add as reciprocals.",
      ]} />
    </Article>
  );
}

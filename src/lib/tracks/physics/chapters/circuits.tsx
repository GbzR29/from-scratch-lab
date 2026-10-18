"use client";

// Electricity 3: electric circuits — current and the drift speed of electrons
// (derived), the emf of a battery; Ohm's law, resistance and resistivity;
// electric power and why power lines use high voltage; resistors in series
// and in parallel (derived), Kirchhoff's junction and loop rules, internal
// resistance; the RC circuit solved (charging, discharging, the time
// constant); electrical safety.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { CircuitFigure } from "@/components/lesson/figures/physics/CircuitFigure";
import { RcFigure } from "@/components/lesson/figures/physics/RcFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** 100 MW sent down a line of 5 Ω: the current and the share lost as heat. */
const lineNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const I = 100e6 / (v.V * 1e3), loss = I * I * 5, frac = loss / 100e6;
  return {
    tex: r`P_{loss} = I^2 R = \left(\frac{100\ \text{MW}}{${num(v.V, 0)}\ \text{kV}}\right)^2 \times 5\ \Omega = \amber{${num(loss / 1e6, loss < 1e6 ? 2 : 1)}\ \text{MW}}`,
    meter: Math.min(1, frac), meterLabel: frac >= 1 ? tx(t, "phDc_liveAll", "more than everything sent: impossible") : `${num(frac * 100, 1)}% ${tx(t, "phDc_liveLost", "of the power lost in the line")}`,
  };
};

export function CircuitsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phDc_intro",
          "Flip a switch and the lamp lights at once, although the electrons in the wire creep along slower than a snail. A phone charger, a kettle and a power station obey the same few rules: charge flows round closed loops, it is never used up, and what the devices take from it is energy. This chapter puts numbers on current, voltage, resistance and power, finds the rules for combining them, and follows a capacitor as it fills through a resistor, the circuit behind every electronic timer.")}
      </Lead>

      <Goals t={t} id="phDc" items={[
        "Explain current, the drift of electrons, and what a battery's voltage does.",
        "Use Ohm's law, resistivity and the power formulas, and explain why power lines run at high voltage.",
        "Combine resistors in series and in parallel and apply Kirchhoff's two rules.",
        "Solve the RC circuit: how a capacitor charges and discharges, and what the time constant RC means.",
      ]} />

      <H2>{tx(t, "phDc_currentTitle", "Electric current")}</H2>
      <p>
        {tx(t, "phDc_currentBody",
          "An electric current is charge on the move. Its size is how much charge passes a point each second: one coulomb per second is one ampere (A). A phone charger delivers 1 to 3 A, a kettle about 9 A, a lightning stroke tens of thousands. By convention the current's direction is the way positive charge would flow, from + to −; in a metal it is actually electrons moving the other way, but for almost every calculation the two pictures are equivalent.")}
      </p>
      <Derivation t={t} label={tx(t, "phDc_eqDrift", "How fast do the electrons move?")}
        steps={[
          { tex: r`I = \frac{\Delta Q}{\Delta t}`, why: tx(t, "phDc_d1", "current is charge per second (more exactly I = dQ/dt)") },
          { tex: r`\Delta Q = n\,A\,v_d\,\Delta t\;e`, why: tx(t, "phDc_d2", "in a time Δt the electrons in a length v_d Δt of wire pass the point: that is a volume A v_d Δt holding n electrons per cubic metre, each with charge e") },
          { tex: r`I = n\,e\,A\,v_d`, why: tx(t, "phDc_d3", "divide by Δt") },
          { tex: r`\green{v_d = \frac{I}{n e A} = \frac{1}{8.5\times10^{28}\cdot 1.6\times10^{-19}\cdot 10^{-6}} \approx 7\times10^{-5}\ \text{m/s}}`, why: tx(t, "phDc_d4", "for 1 A in a copper wire of 1 mm², with n = 8.5 × 10²⁸ free electrons per m³: less than a tenth of a millimetre per second") },
        ]} />
      <p>
        {tx(t, "phDc_signalBody",
          "So why does the lamp light instantly? The wire is already full of electrons. Closing the switch sets up the electric field along the whole wire almost at the speed of light, and every electron starts drifting at once, like water in a full hose: open the tap and water comes out of the far end immediately, although no drop has travelled the whole length.")}
      </p>
      <p>
        {tx(t, "phDc_emfBody",
          "Something must keep the charges going round, since they lose energy in every lamp and wire. A battery pumps them back up: chemical reactions move charge from its + terminal to its − terminal inside, against the field, giving each coulomb a fixed amount of energy. That energy per coulomb is the battery's electromotive force, or emf, written ε and measured in volts. A 1.5 V cell gives every coulomb that passes through it 1.5 J.")}
      </p>

      <H2>{tx(t, "phDc_ohmTitle", "Ohm's law and resistance")}</H2>
      <p>
        {tx(t, "phDc_ohmBody",
          "Push harder and more current flows. In 1827 Georg Ohm found that for metal wires the current is simply proportional to the voltage across them. The ratio, the resistance, depends on the wire: its material, how long it is, and how thick.")}
      </p>
      <Equation label={tx(t, "phDc_eqOhm", "Ohm's law and resistivity")}
        where={[
          [r`V`, tx(t, "phDc_wV", "the voltage across the component (V)")],
          [r`I`, tx(t, "phDc_wI", "the current through it (A)")],
          [r`R`, tx(t, "phDc_wR", "its resistance, in ohms (Ω = V/A)")],
          [r`\rho`, tx(t, "phDc_wRho", "the resistivity of the material (Ω·m), the Greek letter rho")],
          [r`L,\ A`, tx(t, "phDc_wLA", "the length (m) and cross-section area (m²) of the wire")],
        ]}
        words={tx(t, "phDc_ohmWords", "Current equals voltage divided by resistance. A longer wire resists more, a thicker one less.")}
        note={tx(t, "phDc_ohmNote", "Ohm's law is not a law of nature but a property of many materials. A lamp filament's resistance rises as it heats, a diode lets current through one way only, and neither follows V = IR with a fixed R. Inside a conductor, electrons are pushed by the field and keep bumping into the vibrating atoms; that friction is the resistance, and it turns their energy into heat.")}>
        {r`V = I\,R, \qquad R = \rho\,\frac{L}{A}`}
      </Equation>
      <LessonTable
        headers={[tx(t, "phDc_tMat", "Material"), tx(t, "phDc_tRho", "Resistivity at 20 °C (Ω·m)")]}
        rows={[
          [tx(t, "phDc_r1", "silver"), tx(t, "phDc_r1v", "1.59 × 10⁻⁸")],
          [tx(t, "phDc_r2", "copper"), tx(t, "phDc_r2v", "1.68 × 10⁻⁸")],
          [tx(t, "phDc_r3", "aluminium"), tx(t, "phDc_r3v", "2.65 × 10⁻⁸")],
          [tx(t, "phDc_r4", "nichrome (heating elements)"), tx(t, "phDc_r4v", "1.1 × 10⁻⁶")],
          [tx(t, "phDc_r5", "pure silicon"), tx(t, "phDc_r5v", "about 2 × 10³")],
          [tx(t, "phDc_r6", "glass"), tx(t, "phDc_r6v", "10¹⁰ to 10¹⁴")],
        ]}
      />

      <H2>{tx(t, "phDc_powerTitle", "Electric power")}</H2>
      <p>
        {tx(t, "phDc_powerBody",
          "Each coulomb that falls through a voltage V gives up V joules. With I coulombs passing every second, the power delivered is V times I. Using Ohm's law it can be written in two more ways, which say how a resistor turns electrical energy into heat.")}
      </p>
      <Equation label={tx(t, "phDc_eqPower", "Electric power")}
        where={[
          [r`P`, tx(t, "phDc_wP", "the power delivered to the component (W = J/s)")],
          [r`V,\ I,\ R`, tx(t, "phDc_wVIR", "its voltage, current and resistance")],
        ]}
        words={tx(t, "phDc_powerWords", "Power is voltage times current.")}
        note={tx(t, "phDc_powerNote", "Electricity bills count energy in kilowatt-hours: a 1 kW appliance running for one hour, 1 000 W × 3 600 s = 3.6 MJ. A 2 kW kettle on 230 V draws I = P/V = 8.7 A and has R = V²/P = 26 Ω.")}>
        {r`P = V I = I^2 R = \frac{V^2}{R}`}
      </Equation>
      <p>
        {tx(t, "phDc_lineBody",
          "Power stations send electricity hundreds of kilometres through wires that have some resistance R, and the wires waste I²R as heat. To send a given power P = V I, the current can be made small by making the voltage large. Ten times the voltage means a tenth of the current and a hundredth of the loss. That is why transmission lines run at hundreds of thousands of volts, and transformers (in the chapter on induction) step it down before it reaches your home.")}
      </p>
      <LiveFormula label={tx(t, "phDc_liveLine", "Try it: send 100 MW down a 5 Ω line")}
        tex={r`I = \frac{P}{V}, \qquad P_{loss} = I^2 R`}
        vars={[
          { id: "V", label: "V (kV)", min: 10, max: 500, step: 5, value: 400, fmt: v => `${num(v, 0)} kV` },
        ]}
        compute={lineNumbers(t)}
        note={tx(t, "phDc_liveLineNote", "At 400 kV the line carries 250 A and loses 0.3 MW, a third of a per cent. At 20 kV it would need 5 000 A, and the loss, 125 MW, would be more than the power sent: the line would simply melt. Low voltage only works over short distances, like the last few hundred metres to your house.")} />

      <H2>{tx(t, "phDc_combTitle", "Series and parallel")}</H2>
      <p>
        {tx(t, "phDc_combBody",
          "Components in a chain, one after another, are in series: the same current passes through each. Components side by side between the same two points are in parallel: each has the same voltage across it. Each arrangement behaves like a single equivalent resistance.")}
      </p>
      <Derivation t={t} label={tx(t, "phDc_eqComb", "Equivalent resistance")}
        steps={[
          { tex: r`V = I R_1 + I R_2 = I\,(R_1 + R_2)`, why: tx(t, "phDc_s1", "in series one current I flows through both, and the voltage drops add up") },
          { tex: r`\green{R_{series} = R_1 + R_2}`, why: tx(t, "phDc_s2", "so the chain acts like one resistor of the sum: always bigger than either") },
          { tex: r`I = \frac{V}{R_1} + \frac{V}{R_2} = V\left(\frac{1}{R_1} + \frac{1}{R_2}\right)`, why: tx(t, "phDc_s3", "in parallel both get the same voltage V, and the branch currents add up") },
          { tex: r`\green{\frac{1}{R_{parallel}} = \frac{1}{R_1} + \frac{1}{R_2}}`, why: tx(t, "phDc_s4", "so the pair acts like a smaller resistor than either: an extra path lets more current through") },
        ]} />
      <CircuitFigure t={t} />
      <H3>{tx(t, "phDc_kirchTitle", "Kirchhoff's rules")}</H3>
      <p>
        {tx(t, "phDc_kirchBody",
          "Any circuit, however tangled, can be solved with two rules stated by Gustav Kirchhoff in 1845, and each is a conservation law in disguise.")}
      </p>
      <LessonTable
        headers={[tx(t, "phDc_tRule", "Rule"), tx(t, "phDc_tSays", "What it says"), tx(t, "phDc_tWhy2", "Why it is true")]}
        rows={[
          [tx(t, "phDc_k1", "junction rule"), tx(t, "phDc_k1s", "the currents flowing into any junction equal the currents flowing out"), tx(t, "phDc_k1w", "charge is conserved and does not pile up in a wire")],
          [tx(t, "phDc_k2", "loop rule"), tx(t, "phDc_k2s", "going round any closed loop, the voltage rises and drops add up to zero"), tx(t, "phDc_k2w", "energy is conserved: a charge back at its start has the same potential")],
        ]}
      />
      <p>
        {tx(t, "phDc_internalBody",
          "A real battery has some resistance of its own, its internal resistance r. The loop rule then gives ε − I r − I R = 0: the voltage at its terminals is V = ε − I r, lower the more current is drawn. A car battery with ε = 12.6 V and r = 0.02 Ω delivering 150 A to the starter motor drops to 12.6 − 150 × 0.02 = 9.6 V, which is why the headlights dim while the engine cranks.")}
      </p>

      <H2>{tx(t, "phDc_rcTitle", "Filling a capacitor: the RC circuit")}</H2>
      <p>
        {tx(t, "phDc_rcBody",
          "Connect an empty capacitor C to a battery ε through a resistor R. At first the capacitor has no voltage, so the full ε drives a current ε/R. As charge q builds up, the capacitor's voltage q/C pushes back, the current falls, and the filling slows down. The loop rule turns this into an equation that tells the whole story.")}
      </p>
      <Derivation t={t} label={tx(t, "phDc_eqRc", "Charging a capacitor through a resistor")}
        steps={[
          { tex: r`\varepsilon - I R - \frac{q}{C} = 0`, why: tx(t, "phDc_c1", "the loop rule: the battery's rise equals the drops across the resistor and the capacitor") },
          { tex: r`\frac{dq}{dt} = \frac{\varepsilon C - q}{RC}`, why: tx(t, "phDc_c2", "the current is the rate at which charge arrives on the capacitor, I = dq/dt") },
          { tex: r`q(t) = C\varepsilon\left(1 - e^{-t/RC}\right)`, why: tx(t, "phDc_c3", "the solution: check it by differentiating; at t = 0 it gives q = 0, and it approaches the full charge Cε (the Math track explains the number e and exponentials)") },
          { tex: r`\green{V_C(t) = \varepsilon\left(1 - e^{-t/\tau}\right), \quad \tau = RC}`, why: tx(t, "phDc_c4", "divide by C; τ (tau) = RC is the time constant, in seconds, since ohms times farads is seconds") },
        ]} />
      <p>
        {tx(t, "phDc_tauBody",
          "After one time constant the capacitor is 1 − e⁻¹ = 63% full; after two, 86%; after five, 99.3%, which counts as full in practice. The current dies away as I = (ε/R) e^(−t/τ). Discharging through the resistor, the voltage falls as V₀ e^(−t/τ), losing 63% of what is left every τ. A 10 kΩ resistor with a 100 µF capacitor gives τ = 10⁴ × 10⁻⁴ = 1 s.")}
      </p>
      <RcFigure t={t} />
      <p>
        {tx(t, "phDc_rcUses", "RC circuits set the timing of blinking lights and delays, decide how long a camera flash takes to recharge, smooth out the ripple of a power supply, and filter fast changes from slow ones in audio electronics. Your nerve cells charge and discharge their membranes in the same way.")}
      </p>
      <Callout type="warn" t={t}>
        {tx(t, "phDc_safety", "What harms the body is the current through it, and the voltage decides how much flows. About 1 mA can be felt, 10 mA through the hand makes the muscles clamp so you cannot let go, and 100 mA across the chest can stop the heart. Dry skin has a resistance of around 100 kΩ, so 12 V drives only 0.1 mA; wet skin can fall to about 1 kΩ, and then a 230 V socket drives over 200 mA. Never touch mains wiring, and keep water away from it.")}
      </Callout>

      <H2>{tx(t, "phDc_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phDc_ex1", "1. A current of 0.5 A for one minute moves Q = 0.5 × 60 = 30 C, which is 30 / 1.602 × 10⁻¹⁹ = 1.9 × 10²⁰ electrons.")}</p>
      <p>{tx(t, "phDc_ex2", "2. A copper wire 10 m long with a cross-section of 1.5 mm²: R = 1.68 × 10⁻⁸ × 10 / 1.5 × 10⁻⁶ = 0.11 Ω.")}</p>
      <p>{tx(t, "phDc_ex3", "3. Resistors of 10 Ω and 20 Ω in series on 12 V: I = 12/30 = 0.4 A, with 4 V across the first and 8 V across the second. In parallel: 1.2 A and 0.6 A, 1.8 A in total, as if one resistor of 12/1.8 = 6.7 Ω.")}</p>
      <p>{tx(t, "phDc_ex4", "4. A 2 kW kettle running for 3 minutes uses 2 000 × 180 = 360 000 J = 0.1 kWh.")}</p>
      <p>{tx(t, "phDc_ex5", "5. With R = 10 kΩ and C = 100 µF, how long until the capacitor reaches 99% of ε? Solve 1 − e^(−t/τ) = 0.99: e^(−t/τ) = 0.01, so t = τ ln 100 = 4.6 τ = 4.6 s.")}</p>

      <H2>{tx(t, "phDc_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phDc_tWrong", "Wrong"), tx(t, "phDc_tRight", "Right"), tx(t, "phDc_tWhy", "Why")]}
        rows={[
          [tx(t, "phDc_m1w", "lamps use up current"), tx(t, "phDc_m1r", "they use up energy"), tx(t, "phDc_m1", "the same current enters and leaves; it leaves at a lower potential")],
          [tx(t, "phDc_m2w", "the electrons race round at light speed"), tx(t, "phDc_m2r", "they drift at a fraction of a mm/s"), tx(t, "phDc_m2", "it is the field, the signal, that travels fast")],
          [tx(t, "phDc_m3w", "adding a resistor in parallel raises the resistance"), tx(t, "phDc_m3r", "it lowers it"), tx(t, "phDc_m3", "it opens an extra path for the current")],
          [tx(t, "phDc_m4w", "voltage flows through a circuit"), tx(t, "phDc_m4r", "current flows; voltage is across"), tx(t, "phDc_m4", "voltage is a difference between two points")],
          [tx(t, "phDc_m5w", "a battery always gives its labelled voltage"), tx(t, "phDc_m5r", "V = ε − I r"), tx(t, "phDc_m5", "its internal resistance eats some of it under load")],
          [tx(t, "phDc_m6w", "after one τ the capacitor is full"), tx(t, "phDc_m6r", "63% full"), tx(t, "phDc_m6", "the exponential only approaches full; 5τ gives 99%")],
        ]}
      />

      <KeyIdeas t={t} id="phDc" items={[
        "Current is charge per second, I = dQ/dt, in amperes; electrons drift slowly, I = n e A v_d, but the field travels fast.",
        "A battery's emf is the energy it gives each coulomb; Ohm's law V = IR, with R = ρL/A.",
        "Power P = VI = I²R = V²/R; high voltage cuts transmission losses, which grow as I².",
        "Series resistances add, R = R₁ + R₂; parallel ones add as reciprocals and give less than either.",
        "Kirchhoff: currents into a junction equal currents out (charge), and voltages round a loop add to zero (energy).",
        "A capacitor charges through a resistor as V = ε(1 − e^(−t/RC)); τ = RC is the time to 63%, and 5τ is practically full.",
      ]} />
    </Article>
  );
}

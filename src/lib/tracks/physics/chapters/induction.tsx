"use client";

// Electromagnetism & Light 1: electromagnetic induction — Faraday's
// experiments, magnetic flux, Faraday's law and Lenz's minus sign (energy
// conservation), motional emf derived two ways and the braking force on a
// sliding rod, eddy currents, the AC generator derived (ε = NBAω sin ωt) and
// rms values, self-inductance (solenoid L, back emf, energy ½LI², L/R), and
// the transformer with why the grid runs at high voltage.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { RailFigure } from "@/components/lesson/figures/physics/RailFigure";
import { GeneratorFigure } from "@/components/lesson/figures/physics/GeneratorFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** An ideal transformer: V_s = V_p N_s / N_p, and the same power on both sides. */
const transformerNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const Vs = (v.Vp * v.Ns) / v.Np, Is = (v.P / v.Vp) * (v.Np / v.Ns);
  return {
    tex: r`V_s = ${num(v.Vp, 0)}\ \text{V} \times \frac{${num(v.Ns, 0)}}{${num(v.Np, 0)}} = \amber{${num(Vs, 1)}\ \text{V}}, \quad I_s = \frac{${num(v.P, 0)}\ \text{W}}{${num(Vs, 1)}\ \text{V}} = \green{${num(Is, 2)}\ \text{A}}`,
    meter: Math.min(1, Vs / 1000), meterLabel: `${tx(t, "phInd_livePrimary", "current drawn from the primary")}: ${num(v.P / v.Vp, 2)} A`,
  };
};

export function InductionContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phInd_intro",
          "Almost all the electricity you use was made by moving a magnet past a coil of wire. The power station may burn gas, split uranium or catch the wind, but in the end it turns a shaft, and the shaft turns a magnet inside coils, or coils inside a magnet. In 1831 Michael Faraday found the rule behind this: a changing magnetic field makes an electric current. The previous chapter showed currents making magnetic fields; this one shows the other half, which runs generators, transformers, induction cooktops, wireless chargers and the brakes of some trains.")}
      </Lead>

      <Goals t={t} id="phInd" items={[
        "Find the magnetic flux through a loop and use Faraday's law to get the emf it induces.",
        "Use Lenz's law to find the direction of an induced current, and explain it with energy conservation.",
        "Derive the emf of a rod moving through a field and of a turning coil, the generator.",
        "Explain self-inductance and the energy a coil stores, and how a transformer changes voltages.",
      ]} />

      <H2>{tx(t, "phInd_faradayTitle", "Faraday's experiments")}</H2>
      <p>
        {tx(t, "phInd_faradayBody",
          "Connect a coil of wire to a sensitive current meter, a galvanometer. Hold a bar magnet still next to it: nothing. Push the magnet into the coil: the needle kicks. Hold it still inside: the needle goes back to zero. Pull it out: the needle kicks the other way. Moving the coil instead of the magnet does the same, and so does switching on or off a current in a second coil nearby, with no motion at all. Faraday saw what all of these have in common: a current appears only while the magnetic field passing through the coil is changing. A field that is merely strong does nothing; a field that changes drives a current.")}
      </p>

      <H2>{tx(t, "phInd_fluxTitle", "Magnetic flux")}</H2>
      <p>
        {tx(t, "phInd_fluxBody",
          "To say how much field passes through a loop, use the magnetic flux, the same idea as the electric flux of Gauss's law: the field times the area it crosses, counting only the part of the field that goes straight through.")}
      </p>
      <Equation label={tx(t, "phInd_eqFlux", "Magnetic flux through a flat loop")}
        where={[
          [r`\Phi_B`, tx(t, "phInd_wPhi", "the magnetic flux, in webers (Wb); 1 Wb = 1 T·m²")],
          [r`B`, tx(t, "phInd_wB", "the magnetic field, uniform over the loop (T)")],
          [r`A`, tx(t, "phInd_wA", "the area enclosed by the loop (m²)")],
          [r`\theta`, tx(t, "phInd_wTh", "the angle between the field and the line perpendicular to the loop's surface")],
        ]}
        words={tx(t, "phInd_fluxWords", "Flux counts the field lines through the loop: most when the loop faces the field, none when it is edge-on.")}
        note={tx(t, "phInd_fluxNote", "If the field varies over the surface, add up B·dA over small pieces: Φ_B = ∫ B · dA. The flux can change in three ways: the field changes, the area changes, or the angle changes.")}>
        {r`\Phi_B = B\,A\,\cos\theta`}
      </Equation>

      <H2>{tx(t, "phInd_lawTitle", "Faraday's law")}</H2>
      <Equation label={tx(t, "phInd_eqFaraday", "Faraday's law of induction")}
        where={[
          [r`\varepsilon`, tx(t, "phInd_wEmf", "the induced emf round the loop (V): the work done on each coulomb that goes once round")],
          [r`N`, tx(t, "phInd_wN", "the number of turns in the coil; each turn adds the same emf")],
          [r`\frac{d\Phi_B}{dt}`, tx(t, "phInd_wRate", "how fast the flux through one turn changes (Wb/s)")],
        ]}
        words={tx(t, "phInd_faradayWords", "The voltage induced in a coil equals the number of turns times how fast the flux through each turn is changing, with a minus sign that says which way it pushes.")}
        note={tx(t, "phInd_faradayNote", "Nothing here mentions how the flux changes: moving magnet, moving coil, or a current switched on nearby all count. The emf is not made by a battery at one point; it is spread round the whole loop, pushed by an electric field that circles round, unlike the electric fields of static charges.")}>
        {r`\varepsilon = -N\,\frac{d\Phi_B}{dt}`}
      </Equation>
      <H3>{tx(t, "phInd_lenzTitle", "Lenz's law: the minus sign")}</H3>
      <p>
        {tx(t, "phInd_lenzBody",
          "The minus sign is Lenz's law: the induced current always flows so that its own magnetic field opposes the change that made it. Push a magnet's north pole towards a coil, and the current in the coil makes a north pole facing the magnet, pushing it back. Pull the magnet away, and the coil makes a south pole that pulls it back. You always have to work against the coil, and that work is exactly the energy the current carries off as heat. If the sign were the other way, the coil would pull the approaching magnet in faster, which would make more current, which would pull harder: a magnet nudged once would run away with energy from nowhere. Lenz's law is energy conservation.")}
      </p>
      <p>
        {tx(t, "phInd_pipeBody",
          "You can see it by dropping a strong magnet down a copper pipe. Copper is not magnetic, yet the magnet drifts down slowly, taking seconds instead of a fraction of a second. As it falls, the flux through each ring of copper below it grows and through each ring above it shrinks; the currents induced in the rings push up on the magnet from below and pull up on it from above.")}
      </p>

      <H2>{tx(t, "phInd_motionalTitle", "A rod moving through a field")}</H2>
      <p>
        {tx(t, "phInd_motionalBody",
          "The cleanest case is a metal rod sliding along two rails in a uniform field, with the rails joined at one end so that rod, rails and connection make a loop. It can be worked out in two ways that agree, which shows the force on moving charges and Faraday's law are two views of one thing.")}
      </p>
      <Derivation t={t} label={tx(t, "phInd_eqMotional", "The emf of a moving rod, two ways")}
        steps={[
          { tex: r`F = q\,v\,B`, why: tx(t, "phInd_mo1", "view 1: the charges in the rod move with it at speed v across the field, so each feels the magnetic force along the rod (previous chapter)") },
          { tex: r`\varepsilon = \frac{W}{q} = \frac{F\,L}{q} = B\,L\,v`, why: tx(t, "phInd_mo2", "pushing a charge the whole length L of the rod, that force does work F L; work per coulomb is the emf") },
          { tex: r`\Phi_B = B\,L\,x`, why: tx(t, "phInd_mo3", "view 2: the loop is L wide and x long, where x is the rod's distance from the joined end, so this is the flux through it") },
          { tex: r`\green{|\varepsilon| = \frac{d\Phi_B}{dt} = B\,L\,\frac{dx}{dt} = B\,L\,v}`, why: tx(t, "phInd_mo4", "Faraday's law gives the same answer: the area grows by L v every second") },
        ]} />
      <Derivation t={t} label={tx(t, "phInd_eqBrake", "The braking force and where the energy goes")}
        steps={[
          { tex: r`I = \frac{\varepsilon}{R} = \frac{B L v}{R}`, why: tx(t, "phInd_br1", "the emf drives a current round the loop, whose resistance is R") },
          { tex: r`F = B\,I\,L = \frac{B^2 L^2 v}{R}`, why: tx(t, "phInd_br2", "the field pushes on that current in the rod; by Lenz's law the push is backwards, against the motion") },
          { tex: r`P_{push} = F\,v = \frac{B^2 L^2 v^2}{R}`, why: tx(t, "phInd_br3", "to keep the rod moving at speed v you must push forwards with that force, doing this much work per second") },
          { tex: r`\green{P_{heat} = I^2 R = \frac{B^2 L^2 v^2}{R} = P_{push}}`, why: tx(t, "phInd_br4", "the heat made in the resistor each second is exactly the same: the push becomes heat, joule for joule") },
        ]} />
      <p>
        {tx(t, "phInd_tauBody",
          "If you give the rod a kick and let go, the backward force F = (B²L²/R) v is proportional to its speed, just like the drag on a ball in syrup. Newton's second law m dv/dt = −(B²L²/R) v gives a speed that dies away exponentially, v = v₀ e^(−t/τ), with a time constant τ = mR/(B²L²): a strong field or a small resistance stops it quickly.")}
      </p>
      <RailFigure t={t} />
      <H3>{tx(t, "phInd_eddyTitle", "Eddy currents")}</H3>
      <p>
        {tx(t, "phInd_eddyBody",
          "A solid piece of metal moving through a field, or sitting in a changing one, has no wires to guide the current, so the current swirls round inside it in loops called eddy currents. They heat the metal and, by Lenz's law, resist the motion. Some trains and roller coasters brake this way, with magnets near a metal rail or fin: no contact and no wear, and the braking fades as the speed falls. An induction cooktop runs a rapidly alternating current in a coil under the glass; the changing field induces eddy currents in the pan's iron base, which heats up while the glass stays cool. Metal detectors notice the field of the eddy currents they induce in a coin. In transformers eddy currents are a waste, so their iron cores are built from thin insulated sheets that break the loops.")}
      </p>

      <H2>{tx(t, "phInd_genTitle", "The generator")}</H2>
      <p>
        {tx(t, "phInd_genBody",
          "Instead of sliding a rod, turn a coil steadily between the poles of a magnet. The flux through the coil rises and falls as it turns, and Faraday's law gives a voltage that swings back and forth.")}
      </p>
      <Derivation t={t} label={tx(t, "phInd_eqGen", "The voltage of a turning coil")}
        steps={[
          { tex: r`\theta = \omega\,t`, why: tx(t, "phInd_g1", "the coil turns at a steady angular speed ω = 2πf, where f is the number of turns per second") },
          { tex: r`\Phi_B = B\,A\,\cos(\omega t)`, why: tx(t, "phInd_g2", "the flux through each turn, with θ the angle between the field and the coil's perpendicular") },
          { tex: r`\varepsilon = -N\,\frac{d}{dt}\big(B A \cos\omega t\big) = N B A\,\omega\,\sin(\omega t)`, why: tx(t, "phInd_g3", "Faraday's law; the derivative of cos(ωt) is −ω sin(ωt) (Math track, derivatives)") },
          { tex: r`\green{\varepsilon = \varepsilon_0 \sin(\omega t), \quad \varepsilon_0 = N B A\,\omega}`, why: tx(t, "phInd_g4", "an alternating voltage whose peak grows with the number of turns, the field, the area and the speed") },
        ]} />
      <GeneratorFigure t={t} />
      <p>
        {tx(t, "phInd_rmsBody",
          "Mains electricity is made exactly like this, at 50 turns per second in most of the world and 60 in the Americas. Because the voltage keeps changing, it is quoted by its root-mean-square value: the steady voltage that would heat a resistor at the same average rate. The power V²/R follows sin², whose average over a cycle is ½, so V_rms = V₀/√2. The 230 V of a European socket swings between +325 V and −325 V; the 127 V found in much of Brazil peaks at 180 V. Turning the coil is the hard part: as soon as current flows, Lenz's law makes it push back, so the turbine has to supply exactly the power the customers draw.")}
      </p>

      <H2>{tx(t, "phInd_selfTitle", "Self-inductance")}</H2>
      <p>
        {tx(t, "phInd_selfBody",
          "A coil also reacts to its own current. If the current through it changes, its own magnetic field changes, the flux through its own turns changes, and an emf appears that opposes the change. This back emf is proportional to how fast the current changes: ε = −L dI/dt. The constant L is the coil's inductance, measured in henries (H): 1 H gives 1 V of back emf when the current changes by 1 A per second. A coil is to current what mass is to velocity: it does not stop a current, but it resists any change in it.")}
      </p>
      <Derivation t={t} label={tx(t, "phInd_eqSelf", "The inductance of a solenoid and the energy it stores")}
        steps={[
          { tex: r`B = \mu_0 \frac{N}{\ell}\, I`, why: tx(t, "phInd_s1", "the field inside a solenoid of N turns and length ℓ (previous chapter, with n = N/ℓ)") },
          { tex: r`N\Phi_B = N\,B\,A = \frac{\mu_0 N^2 A}{\ell}\, I`, why: tx(t, "phInd_s2", "the flux through all N turns of area A together; it is proportional to the current") },
          { tex: r`\green{L = \frac{N\Phi_B}{I} = \frac{\mu_0 N^2 A}{\ell}}`, why: tx(t, "phInd_s3", "the inductance is that flux per ampere; it grows with the square of the number of turns, since more turns make more field and each turn catches it") },
          { tex: r`P = I\,|\varepsilon| = L\,I\,\frac{dI}{dt}`, why: tx(t, "phInd_s4", "while the current is rising, the source must push each coulomb against the back emf; that is the power going into the coil") },
          { tex: r`\green{U = \int_0^I L\,I'\,dI' = \tfrac12 L I^2}`, why: tx(t, "phInd_s5", "add that power up while the current grows from 0 to I: the energy is stored in the magnetic field, like ½CV² in a capacitor's electric field") },
        ]} />
      <p>
        {tx(t, "phInd_rlBody",
          "Connect a coil of inductance L and a resistor R to a battery, and the current does not jump to ε/R: it rises as I = (ε/R)(1 − e^(−t/τ)) with τ = L/R, the mirror image of a charging capacitor. Opening the switch is the dramatic part: the current must fall to zero almost instantly, dI/dt is huge, and the back emf can reach thousands of volts, enough to make a spark jump across the switch. Car ignition coils use this on purpose to fire spark plugs from a 12 V battery; circuits that switch relays or motors add a diode to give the current a safe path.")}
      </p>

      <H2>{tx(t, "phInd_trTitle", "The transformer")}</H2>
      <p>
        {tx(t, "phInd_trBody",
          "Wind two coils on the same iron ring. An alternating current in the first coil, the primary, makes an alternating flux in the iron, which guides it through the second coil, the secondary. The changing flux induces a voltage in the secondary, without any wire connecting the two.")}
      </p>
      <Derivation t={t} label={tx(t, "phInd_eqTr", "The ideal transformer")}
        steps={[
          { tex: r`V_p = N_p\,\frac{d\Phi_B}{dt}, \qquad V_s = N_s\,\frac{d\Phi_B}{dt}`, why: tx(t, "phInd_t1", "the iron carries the same flux through every turn of both coils, so each turn gets the same emf") },
          { tex: r`\green{\frac{V_s}{V_p} = \frac{N_s}{N_p}}`, why: tx(t, "phInd_t2", "divide: the voltages are in the ratio of the turns") },
          { tex: r`V_p\,I_p = V_s\,I_s`, why: tx(t, "phInd_t3", "an ideal transformer wastes nothing (real ones lose 1–2%), so the power in equals the power out") },
          { tex: r`\green{\frac{I_s}{I_p} = \frac{N_p}{N_s}}`, why: tx(t, "phInd_t4", "stepping the voltage up steps the current down by the same factor, and the other way round") },
        ]} />
      <LiveFormula label={tx(t, "phInd_liveTr", "Try it: a transformer")}
        tex={r`V_s = V_p\,\frac{N_s}{N_p}`}
        vars={[
          { id: "Vp", label: "V_p (V)", min: 10, max: 400, step: 5, value: 230, fmt: v => `${num(v, 0)} V` },
          { id: "Np", label: "N_p", min: 10, max: 2000, step: 10, value: 1000, fmt: v => num(v, 0) },
          { id: "Ns", label: "N_s", min: 10, max: 2000, step: 10, value: 50, fmt: v => num(v, 0) },
          { id: "P", label: tx(t, "phInd_livePower", "power (W)"), min: 1, max: 100, step: 1, value: 20, fmt: v => `${num(v, 0)} W` },
        ]}
        compute={transformerNumbers(t)}
        note={tx(t, "phInd_liveTrNote", "A phone charger's transformer has far fewer turns on the secondary: 230 V in, about 12 V out, and the low-voltage side carries twenty times more current than the mains side for the same 20 W.")} />
      <p>
        {tx(t, "phInd_gridBody",
          "This is why the grid carries power at hundreds of thousands of volts. The circuits chapter showed that a line of resistance R carrying current I wastes I²R. For the same power P = VI, raising the voltage a hundred times lowers the current a hundred times and the loss ten thousand times. Transformers step the voltage up at the power station and down again near your home, and they only work with a changing current: a steady current makes a steady flux, which induces nothing. That is the main reason the world's grids run on alternating current.")}
      </p>
      <Callout type="info" t={t}>
        {tx(t, "phInd_wireless", "Wireless phone chargers are transformers with the iron removed and the two coils pulled apart: a coil in the pad carries an alternating current of about 100 to 200 kHz, and a coil in the phone catches part of its changing flux. Because the coils share only part of the flux, they have to be close and well lined up.")}
      </Callout>

      <H2>{tx(t, "phInd_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phInd_ex1", "1. A coil of 200 turns, each 0.002 m² in area, faces a magnet whose field rises from 0 to 0.30 T in 0.10 s. The flux per turn changes by 0.30 × 0.002 = 6.0 × 10⁻⁴ Wb, so ε = 200 × 6.0 × 10⁻⁴ / 0.10 = 1.2 V while the field is changing, and zero once it stops.")}</p>
      <p>{tx(t, "phInd_ex2", "2. A rod 0.50 m long slides at 4.0 m/s across a 0.80 T field on rails joined by 2.0 Ω: ε = BLv = 0.80 × 0.50 × 4.0 = 1.6 V, I = 0.80 A, braking force F = BIL = 0.32 N. Keeping it going takes F v = 1.28 W, and the resistor gets I²R = 1.28 W.")}</p>
      <p>{tx(t, "phInd_ex3", "3. A generator coil of 100 turns, 0.010 m² each, turning at 50 Hz in a 0.50 T field: ε₀ = NBAω = 100 × 0.50 × 0.010 × 2π × 50 = 157 V peak, or 157/√2 = 111 V rms.")}</p>
      <p>{tx(t, "phInd_ex4", "4. A solenoid with 500 turns, 10 cm long and 1.0 cm² in cross-section: L = μ₀N²A/ℓ = 4π × 10⁻⁷ × 500² × 10⁻⁴ / 0.10 = 3.1 × 10⁻⁴ H = 0.31 mH. Carrying 2.0 A it stores ½LI² = 6.3 × 10⁻⁴ J.")}</p>
      <p>{tx(t, "phInd_ex5", "5. A power line delivers 10 MW through wires of 5 Ω. At 10 kV the current is 1 000 A and the loss I²R is 5 MW, half the power. At 500 kV the current is 20 A and the loss 2 kW, a fraction of a percent.")}</p>

      <H2>{tx(t, "phInd_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phInd_tWrong", "Wrong"), tx(t, "phInd_tRight", "Right"), tx(t, "phInd_tWhy", "Why")]}
        rows={[
          [tx(t, "phInd_m1w", "a strong field induces a current"), tx(t, "phInd_m1r", "a changing flux does"), tx(t, "phInd_m1", "ε depends on dΦ/dt, not on Φ")],
          [tx(t, "phInd_m2w", "the induced field always opposes the magnet's field"), tx(t, "phInd_m2r", "it opposes the change in flux"), tx(t, "phInd_m2", "when the flux is falling, the induced field points the same way as the magnet's, to prop it up")],
          [tx(t, "phInd_m3w", "the emf is largest when the coil faces the field"), tx(t, "phInd_m3r", "when it is edge-on"), tx(t, "phInd_m3", "there the flux is zero but changing fastest")],
          [tx(t, "phInd_m4w", "a transformer gives free power"), tx(t, "phInd_m4r", "it trades voltage for current"), tx(t, "phInd_m4", "V_p I_p = V_s I_s at best")],
          [tx(t, "phInd_m5w", "a transformer works on a battery"), tx(t, "phInd_m5r", "only on a changing current"), tx(t, "phInd_m5", "a steady current gives a steady flux, which induces nothing")],
          [tx(t, "phInd_m6w", "230 V mains never exceeds 230 V"), tx(t, "phInd_m6r", "it peaks at 325 V"), tx(t, "phInd_m6", "230 V is the rms value, V₀/√2")],
        ]}
      />

      <KeyIdeas t={t} id="phInd" items={[
        "The magnetic flux through a loop is Φ = BA cos θ, in webers; it changes if B, the area or the angle changes.",
        "Faraday's law: a changing flux induces ε = −N dΦ/dt round a coil, however the change is made.",
        "Lenz's law, the minus sign, makes the induced current oppose the change: it is energy conservation.",
        "A rod moving through a field gets ε = BLv; the braking force B²L²v/R turns the work of pushing it into heat.",
        "A coil turning in a field gives an alternating ε = NBAω sin ωt; mains voltages are quoted as rms, V₀/√2.",
        "A coil resists changes in its own current (ε = −L dI/dt) and stores ½LI²; a transformer sets V_s/V_p = N_s/N_p.",
      ]} />
    </Article>
  );
}

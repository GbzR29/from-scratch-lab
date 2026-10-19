"use client";

// Relativity 3: relativistic energy — why momentum must become p = γmv, the
// speed limit under a steady force, kinetic energy (γ − 1)mc² derived from
// the work–energy theorem and its low-speed limit, total energy γmc² and
// rest energy mc², mass as energy (hot putty, batteries), the energy–momentum
// relation E² = (pc)² + (mc²)² derived, massless particles (E = pc, always at
// c), binding energy and the mass defect (helium-4, the Sun, chemistry vs
// nuclear), and particle accelerators and pair creation.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { SpeedLimitFigure } from "@/components/lesson/figures/physics/SpeedLimitFigure";
import { MassEnergyFigure } from "@/components/lesson/figures/physics/MassEnergyFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** An electron accelerated from rest through a voltage V: K = eV, γ = 1 + K/mc². */
const electronNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const K = v.V / 1000, g = 1 + K / 0.511, b = Math.sqrt(1 - 1 / (g * g)), bN = Math.sqrt(2 * K / 0.511);
  return {
    tex: r`\gamma = 1 + \frac{${num(K, 3)}\ \text{MeV}}{0.511\ \text{MeV}} = \amber{${num(g, 3)}}, \quad v = c\sqrt{1 - 1/\gamma^2} = \green{${num(b, 4)}\,c}`,
    meter: b, meterLabel: `${tx(t, "phRe_liveNewton", "Newton's ½mv² would give")} ${num(bN, 3)}c`,
  };
};

export function RelativisticEnergyContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phRe_intro",
          "E = mc² is the most famous equation in physics, and it appeared almost as an afterthought: a three-page paper Einstein sent in September 1905, asking whether the inertia of a body depends on its energy content. The answer is yes. Mass is a form of energy, and energy, wherever it is, has mass. This chapter follows how relativity forces new formulas for momentum and energy, derives E = mc² from them, and shows where it matters: why nothing can be pushed up to the speed of light, why the Sun shines, and why a uranium nucleus holds a million times more energy than a molecule of petrol.")}
      </Lead>

      <Goals t={t} id="phRe" items={[
        "Use the relativistic momentum p = γmv and explain why no object with mass can reach c.",
        "Derive the kinetic energy (γ − 1)mc² and show that it becomes ½mv² at low speed.",
        "Use E = γmc², the rest energy mc² and E² = (pc)² + (mc²)², including for massless particles.",
        "Compute binding energies from mass defects and explain where the energy of the Sun and of nuclear reactors comes from.",
      ]} />

      <H2>{tx(t, "phRe_momTitle", "Momentum must change")}</H2>
      <p>
        {tx(t, "phRe_momBody",
          "Conservation of momentum is one of the pillars of mechanics, and by Noether's theorem it follows from the sameness of space, which relativity keeps. But with p = mv and relativistic velocity addition, a collision that conserves momentum in one frame fails to in another. The fix is to measure velocity with the traveller's own clock: dx/dτ instead of dx/dt. Since dt = γ dτ, that gives the relativistic momentum.")}
      </p>
      <Equation label={tx(t, "phRe_eqP", "Relativistic momentum")}
        where={[
          [r`p`, tx(t, "phRe_wP", "the momentum (kg·m/s), conserved in every collision in every frame")],
          [r`m`, tx(t, "phRe_wM", "the mass, the same in every frame (the \"rest mass\")")],
          [r`\gamma v`, tx(t, "phRe_wGv", "distance per unit of the moving object's own time; it grows without limit as v approaches c")],
        ]}
        words={tx(t, "phRe_pWords", "Momentum is mass times velocity, multiplied by γ: ordinary at low speed, enormous near c.")}
        note={tx(t, "phRe_pNote", "Newton's second law survives in the form F = dp/dt. A steady force adds momentum at a steady rate, but as γ grows, more and more of the added momentum goes into γ and less into v.")}>
        {r`\mathbf{p} = \gamma\, m\, \mathbf{v}`}
      </Equation>
      <SpeedLimitFigure t={t} />

      <H2>{tx(t, "phRe_keTitle", "Kinetic energy")}</H2>
      <p>
        {tx(t, "phRe_keBody",
          "Kinetic energy is the work done to bring a body from rest to speed v. The work–energy theorem of the dynamics section still holds, with the new momentum.")}
      </p>
      <Derivation t={t} label={tx(t, "phRe_eqKe", "The work needed to reach speed v")}
        steps={[
          { tex: r`K = \int F\,dx = \int \frac{dp}{dt}\,dx = \int v\,dp`, why: tx(t, "phRe_k1", "work is force times distance; F = dp/dt and dx/dt = v") },
          { tex: r`v\,dp = d(pv) - p\,dv \;\Rightarrow\; K = pv - \int_0^v \frac{m u}{\sqrt{1 - u^2/c^2}}\,du`, why: tx(t, "phRe_k2", "integrate by parts (u is the speed along the way, from 0 to v)") },
          { tex: r`\int_0^v \frac{m u\,du}{\sqrt{1 - u^2/c^2}} = m c^2\left(1 - \sqrt{1 - v^2/c^2}\right) = mc^2\left(1 - \frac{1}{\gamma}\right)`, why: tx(t, "phRe_k3", "substitute w = 1 − u²/c²; the integral of the reciprocal square root is a square root") },
          { tex: r`K = \gamma m v^2 - mc^2 + \frac{mc^2}{\gamma} = mc^2\left(\gamma\beta^2 + \frac{1}{\gamma}\right) - mc^2`, why: tx(t, "phRe_k4", "put it together, with pv = γmv²") },
          { tex: r`\green{K = (\gamma - 1)\,m c^2}`, why: tx(t, "phRe_k5", "since γβ² + 1/γ = γ(β² + 1 − β²) = γ") },
        ]} />
      <p>
        {tx(t, "phRe_keLow",
          "At low speed, γ ≈ 1 + β²/2 + (3/8)β⁴, so K ≈ ½mv² + (3/8)mv⁴/c²: Newton's formula plus a correction that matters only near c. As v approaches c, γ and K grow without limit: an infinite amount of energy would be needed to reach the speed of light.")}
      </p>

      <H2>{tx(t, "phRe_restTitle", "Rest energy: E = mc²")}</H2>
      <p>
        {tx(t, "phRe_restBody",
          "The kinetic energy is a difference of two terms, γmc² and mc². Einstein's insight was to take each seriously. The total energy of a moving body is E = γmc², and even at rest it keeps E₀ = mc², its rest energy. That is not just bookkeeping. If a body at rest gives off energy E as light or heat, its mass falls by E/c²; if it takes energy in, its mass grows. A hot cup of coffee is heavier than a cold one; a charged battery is heavier than a flat one.")}
      </p>
      <Equation label={tx(t, "phRe_eqE", "Total energy and rest energy")}
        where={[
          [r`E`, tx(t, "phRe_wE", "the total energy of a body moving at speed v (J)")],
          [r`m c^2`, tx(t, "phRe_wE0", "its rest energy, the energy it has when not moving at all")],
          [r`c^2`, tx(t, "phRe_wC2", "the conversion factor between kilograms and joules: 9.0 × 10¹⁶ J per kilogram")],
        ]}
        words={tx(t, "phRe_eWords", "Every body carries energy mc² just by having mass; moving adds the kinetic energy on top.")}
        note={tx(t, "phRe_eNote", "1 kg of anything holds 9 × 10¹⁶ J of rest energy, about 21 megatonnes of TNT, or what a large power station produces in three years. Almost none of it is normally accessible: matter cannot simply be turned into energy unless it meets antimatter. What we can release is the small part stored in how particles are bound together.")}>
        {r`E = \gamma\, m c^2 = K + m c^2, \qquad E_0 = m c^2`}
      </Equation>
      <MassEnergyFigure t={t} />
      <LessonTable
        headers={[tx(t, "phRe_tPart", "Particle"), tx(t, "phRe_tMass", "Mass"), tx(t, "phRe_tRest", "Rest energy mc²")]}
        rows={[
          [tx(t, "phRe_pe", "electron"), tx(t, "phRe_pe1", "9.109 × 10⁻³¹ kg"), tx(t, "phRe_pe2", "0.511 MeV")],
          [tx(t, "phRe_pp", "proton"), tx(t, "phRe_pp1", "1.673 × 10⁻²⁷ kg"), tx(t, "phRe_pp2", "938.3 MeV")],
          [tx(t, "phRe_pn", "neutron"), tx(t, "phRe_pn1", "1.675 × 10⁻²⁷ kg"), tx(t, "phRe_pn2", "939.6 MeV")],
          [tx(t, "phRe_pu", "1 atomic mass unit (u)"), tx(t, "phRe_pu1", "1.661 × 10⁻²⁷ kg"), tx(t, "phRe_pu2", "931.5 MeV")],
          [tx(t, "phRe_pk", "1 kg"), "1 kg", tx(t, "phRe_pk2", "9.0 × 10¹⁶ J")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phRe_ev", "Particle physicists measure energy in electronvolts (eV): the energy an electron gains crossing 1 volt, 1.602 × 10⁻¹⁹ J (electric potential chapter). Masses are then quoted as rest energies, in MeV or GeV, \"divided by c²\": the proton is 938 MeV/c².")}
      </Callout>

      <H2>{tx(t, "phRe_triTitle", "Energy and momentum together")}</H2>
      <Derivation t={t} label={tx(t, "phRe_eqEp", "A relation without the speed in it")}
        steps={[
          { tex: r`E^2 - (pc)^2 = \gamma^2 m^2 c^4 - \gamma^2 m^2 v^2 c^2`, why: tx(t, "phRe_t1", "square E = γmc² and pc = γmvc and subtract") },
          { tex: r`= \gamma^2 m^2 c^4 \left(1 - \beta^2\right) = m^2 c^4`, why: tx(t, "phRe_t2", "take out the common factor; γ²(1 − β²) = 1") },
          { tex: r`\green{E^2 = (pc)^2 + (mc^2)^2}`, why: tx(t, "phRe_t3", "like Pythagoras: a right triangle with legs pc and mc² and hypotenuse E") },
        ]} />
      <p>
        {tx(t, "phRe_triBody",
          "E² − (pc)² is the same in every frame, just as the interval was: energy and momentum combine into one four-dimensional vector whose \"length\" is the mass. The relation also allows particles with no mass at all. For them E = pc, and since p = γmv would be zero unless γ is infinite, they must always move at exactly c. Light is made of such particles, photons; the radiation pressure of the Maxwell chapter is their momentum, p = E/c. A particle with mass, however energetic, always has E > pc and v < c.")}
      </p>

      <H2>{tx(t, "phRe_bindTitle", "Binding energy: where mass becomes useful energy")}</H2>
      <p>
        {tx(t, "phRe_bindBody",
          "Weigh a helium-4 nucleus and the two protons and two neutrons it is made of, separately. The nucleus is lighter. To pull it apart you would have to supply energy, and that energy shows up as mass of the separated pieces. Turned round, when the pieces come together, the missing mass, the mass defect, leaves as energy. The same is true of every bound system, but the size varies enormously.")}
      </p>
      <Derivation t={t} label={tx(t, "phRe_eqHe", "The binding energy of helium-4")}
        steps={[
          { tex: r`2m_p + 2m_n = 2(1.007276) + 2(1.008665) = 4.031883\ \text{u}`, why: tx(t, "phRe_b1", "the masses of the parts, in atomic mass units") },
          { tex: r`m_{He} = 4.001506\ \text{u}`, why: tx(t, "phRe_b2", "the measured mass of the helium-4 nucleus") },
          { tex: r`\Delta m = 0.030377\ \text{u} \quad (0.75\%)`, why: tx(t, "phRe_b3", "the mass defect") },
          { tex: r`\green{E_B = \Delta m\,c^2 = 0.030377 \times 931.5\ \text{MeV} = 28.3\ \text{MeV}}`, why: tx(t, "phRe_b4", "each u of mass is 931.5 MeV of energy") },
        ]} />
      <LessonTable
        headers={[tx(t, "phRe_tProc", "Process"), tx(t, "phRe_tPer", "Energy released"), tx(t, "phRe_tFrac", "Fraction of the mass turned into energy")]}
        rows={[
          [tx(t, "phRe_r1a", "burning methane (chemical bonds)"), tx(t, "phRe_r1b", "55 MJ per kg"), tx(t, "phRe_r1c", "6 × 10⁻¹⁰ (0.6 μg per kg)")],
          [tx(t, "phRe_r2a", "uranium-235 fission"), tx(t, "phRe_r2b", "about 200 MeV per nucleus, 8 × 10¹³ J per kg"), tx(t, "phRe_r2c", "about 0.09%")],
          [tx(t, "phRe_r3a", "hydrogen fusing to helium (the Sun)"), tx(t, "phRe_r3b", "26.7 MeV per helium, 6 × 10¹⁴ J per kg"), tx(t, "phRe_r3c", "0.7%")],
          [tx(t, "phRe_r4a", "matter meeting antimatter"), tx(t, "phRe_r4b", "9 × 10¹⁶ J per kg"), "100%"],
        ]}
      />
      <p>
        {tx(t, "phRe_sun",
          "The Sun radiates 3.83 × 10²⁶ W. Dividing by c² gives the mass it loses: 4.3 billion kilograms every second, about four million tonnes, as hydrogen in its core fuses into helium. Even so, in its 4.6 billion years it has lost less than a tenth of a percent of its mass. Chemical energy is mass too, but a million times less of it: the mass difference when you burn fuel is real but far too small to weigh, which is why chemists could treat mass as conserved.")}
      </p>
      <H3>{tx(t, "phRe_accTitle", "Particle accelerators")}</H3>
      <p>
        {tx(t, "phRe_accBody",
          "Accelerators live in the regime where kinetic energy dwarfs rest energy. The Large Hadron Collider gives each proton 6.8 TeV, about 7 250 times its rest energy, so γ ≈ 7 250 and v = 0.999 999 991 c. Pushing harder barely changes the speed; it raises γ, the energy and the momentum. When two such protons collide, their energy can turn into the mass of new particles: in 2012 the Higgs boson, of mass 125 GeV/c², was made this way. The reverse of annihilation, pair creation, is the simplest example: a gamma-ray photon of at least 2 × 0.511 = 1.022 MeV passing near a nucleus can turn into an electron and a positron.")}
      </p>
      <LiveFormula label={tx(t, "phRe_liveElectron", "Try it: an electron accelerated through a voltage")}
        tex={r`K = eV, \quad \gamma = 1 + \frac{K}{mc^2}, \quad v = c\sqrt{1 - \frac{1}{\gamma^2}}`}
        vars={[
          { id: "V", label: tx(t, "phRe_liveV", "voltage V (kV)"), min: 1, max: 5000, step: 1, value: 100, fmt: v => `${num(v, 0)} kV` },
        ]}
        compute={electronNumbers(t)}
        note={tx(t, "phRe_liveNote", "Old television tubes used about 25 kV: the electrons reached 0.30c, and Newton's formula is only 4% off. At 100 kV Newton already gives 0.63c for a true 0.55c; past 256 kV (K = ½mc²), Newton would give speeds above c.")} />

      <H2>{tx(t, "phRe_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phRe_ex1", "1. A proton at 0.6c: γ = 1.25, E = 1.25 × 938.3 = 1 173 MeV, K = 235 MeV, p = γmv = 1.25 × 938.3 × 0.6 = 704 MeV/c. Check: 1 173² ≈ 704² + 938.3².")}</p>
      <p>{tx(t, "phRe_ex2", "2. Heating 1 kg of water from 20 °C to 100 °C takes 4 186 × 80 = 3.3 × 10⁵ J, so its mass grows by 3.3 × 10⁵ / 9 × 10¹⁶ = 3.7 × 10⁻¹² kg, about 4 nanograms.")}</p>
      <p>{tx(t, "phRe_ex3", "3. An electron and a positron at rest annihilate: 2 × 0.511 = 1.022 MeV appears as two photons of 0.511 MeV each, going in opposite directions so that the total momentum stays zero. PET scanners in hospitals detect exactly these pairs.")}</p>
      <p>{tx(t, "phRe_ex4", "4. A photon of green light, 2.3 eV, carries momentum p = E/c = 2.3 eV/c = 1.2 × 10⁻²⁷ kg·m/s.")}</p>
      <p>{tx(t, "phRe_ex5", "5. The deuteron (a proton plus a neutron) has binding energy 2.224 MeV, so a gamma ray of at least 2.224 MeV can split it. Its mass defect is 2.224/931.5 = 0.002 39 u.")}</p>

      <H2>{tx(t, "phRe_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phRe_tWrong", "Wrong"), tx(t, "phRe_tRight", "Right"), tx(t, "phRe_tWhy", "Why")]}
        rows={[
          [tx(t, "phRe_m1w", "kinetic energy is ½mv² at all speeds"), tx(t, "phRe_m1r", "(γ − 1)mc²"), tx(t, "phRe_m1", "½mv² is only the low-speed approximation")],
          [tx(t, "phRe_m2w", "E = mc² for a moving body"), tx(t, "phRe_m2r", "E = γmc²"), tx(t, "phRe_m2", "mc² is the rest energy; motion adds kinetic energy")],
          [tx(t, "phRe_m3w", "mass increases with speed"), tx(t, "phRe_m3r", "γ increases; mass is fixed"), tx(t, "phRe_m3", "modern usage keeps m invariant and puts the speed dependence in γ")],
          [tx(t, "phRe_m4w", "only nuclear reactions convert mass"), tx(t, "phRe_m4r", "every energy change does"), tx(t, "phRe_m4", "chemical and thermal changes are just a million times smaller")],
          [tx(t, "phRe_m5w", "photons have no momentum, having no mass"), tx(t, "phRe_m5r", "p = E/c"), tx(t, "phRe_m5", "E² = (pc)² + (mc²)² with m = 0")],
          [tx(t, "phRe_m6w", "a bound nucleus is heavier than its parts"), tx(t, "phRe_m6r", "it is lighter"), tx(t, "phRe_m6", "binding releases energy, so mass leaves")],
        ]}
      />

      <KeyIdeas t={t} id="phRe" items={[
        "Momentum is p = γmv; a steady force keeps adding momentum but the speed only approaches c.",
        "Kinetic energy is (γ − 1)mc², which is ½mv² at low speed and infinite at c.",
        "A body at rest has energy mc²; its total energy when moving is E = γmc².",
        "Energy and momentum obey E² = (pc)² + (mc²)²; massless particles have E = pc and always move at c.",
        "Any energy added to or removed from a body changes its mass by E/c², from hot coffee to the shining Sun.",
        "Binding energy is the mass defect times c²: 28.3 MeV for helium-4, about a million times chemical energies.",
      ]} />
    </Article>
  );
}

"use client";

// Advanced Mechanics 3: chaos — Laplace's demon and Lorenz's rounding, the
// double pendulum, exponential divergence and the Lyapunov exponent, the
// prediction horizon t = ln(Δ/δ)/λ derived, what chaos needs (nonlinearity,
// three phase-space dimensions for a flow: Poincaré–Bendixson), stretching and
// folding, dissipation and strange attractors (Lorenz), the logistic map
// (fixed point and its stability derived, period doubling, Feigenbaum's δ,
// λ = ln 2 at r = 4), Poincaré sections, and chaos in the Solar System, the
// weather and everyday life.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { DoublePendulumFigure } from "@/components/lesson/figures/physics/DoublePendulumFigure";
import { LogisticMapFigure } from "@/components/lesson/figures/physics/LogisticMapFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** The prediction horizon t = ln(Δ/δ₀)/λ. */
const horizonNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const d0 = 10 ** v.k, th = Math.log(v.tol / d0) / v.lam;
  return {
    tex: r`t_h = \frac{1}{${num(v.lam, 2)}}\,\ln\frac{${num(v.tol, 2)}}{10^{${num(v.k, 0)}}} = \green{${num(th, 1)}}`,
    meter: Math.min(1, th / 100), meterLabel: `${tx(t, "phChaos_liveDoubling", "error doubles every")} ${num(Math.LN2 / v.lam, 2)}`,
  };
};

export function ChaosContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phChaos_intro",
          "In 1814 Pierre-Simon Laplace imagined an intellect that knew the position and velocity of every particle in the universe and all the forces between them. For it, he wrote, nothing would be uncertain: the future would be present before its eyes. Newton's laws are deterministic, so this seemed right. In 1961 the meteorologist Edward Lorenz restarted a weather simulation from a printout, typing 0.506 instead of the 0.506127 stored in the computer. Within a couple of simulated months the weather was completely different. The equations had no randomness in them; they simply amplified a difference in the fourth decimal place until it took over. This is chaos: motion that follows exact laws and still cannot be predicted for long.")}
      </Lead>

      <Goals t={t} id="phChaos" items={[
        "Explain what chaos is and why a deterministic system can be unpredictable.",
        "Use the Lyapunov exponent to estimate how long a prediction stays useful.",
        "Say what a system needs to be chaotic, and why a single pendulum is not.",
        "Follow the logistic map from a fixed point through period doubling to chaos.",
      ]} />

      <H2>{tx(t, "phChaos_detTitle", "Determinism is not predictability")}</H2>
      <p>
        {tx(t, "phChaos_detBody",
          "A double pendulum is a pendulum hanging from the end of another. It has two angles, so its phase space has four dimensions: two angles and two angular momenta. Its equations come straight from the Lagrangian of the earlier chapter, with nothing random in them. Start it with a small swing and it moves in a regular, almost periodic way. Start it high and it flails, whirls one arm over the top, pauses, reverses, never settling into a pattern. Worse, two double pendulums started almost identically end up doing completely different things.")}
      </p>
      <DoublePendulumFigure t={t} />

      <H2>{tx(t, "phChaos_lyapTitle", "Exponential divergence and the Lyapunov exponent")}</H2>
      <p>
        {tx(t, "phChaos_lyapBody",
          "In a regular system, two nearby starting states drift apart slowly, at worst in proportion to time. In a chaotic one, the gap grows by the same factor every second: exponential growth, the same law as compound interest. The growth rate is called the Lyapunov exponent, after Aleksandr Lyapunov, and it is the standard measure of how chaotic a system is.")}
      </p>
      <Equation label={tx(t, "phChaos_eqLyap", "How a small difference grows in a chaotic system")}
        where={[
          [r`\delta(t)`, tx(t, "phChaos_wDelta", "the distance in phase space between two motions at time t")],
          [r`\delta_0`, tx(t, "phChaos_wDelta0", "their distance at the start, the uncertainty in our knowledge of the state")],
          [r`\lambda`, tx(t, "phChaos_wLam", "the Lyapunov exponent (per second); positive means chaos, zero or negative means regular motion")],
        ]}
        words={tx(t, "phChaos_lyapWords", "Each time interval 1/λ, the error is multiplied by e ≈ 2.7. It doubles every ln 2 / λ.")}
        note={tx(t, "phChaos_lyapNote", "This holds while the gap is still small. Once it reaches the size of the whole region the motion can explore (the arms of the pendulum cannot be more than a full turn apart), it stops growing: the two motions are simply unrelated. The graph in the figure shows both stages, the straight climb and the flat top.")}>
        {r`\delta(t) \approx \delta_0\, e^{\lambda t}`}
      </Equation>
      <Derivation t={t} label={tx(t, "phChaos_eqHorizon", "How long a prediction lasts")}
        steps={[
          { tex: r`\Delta = \delta_0\, e^{\lambda t_h}`, why: tx(t, "phChaos_h1", "call Δ the largest error we can accept; the prediction horizon t_h is when the gap reaches it") },
          { tex: r`\ln\frac{\Delta}{\delta_0} = \lambda\, t_h`, why: tx(t, "phChaos_h2", "divide by δ₀ and take the natural logarithm of both sides") },
          { tex: r`\green{t_h = \frac{1}{\lambda}\,\ln\frac{\Delta}{\delta_0}}`, why: tx(t, "phChaos_h3", "the horizon depends on the starting precision only through a logarithm") },
        ]} />
      <LiveFormula label={tx(t, "phChaos_liveHorizon", "Try it: the prediction horizon")}
        tex={r`t_h = \frac{1}{\lambda}\,\ln\frac{\Delta}{\delta_0}`}
        vars={[
          { id: "lam", label: "λ", min: 0.1, max: 3, step: 0.05, value: 1, fmt: v => num(v, 2) },
          { id: "k", label: tx(t, "phChaos_liveD0", "δ₀ = 10^k, k"), min: -15, max: -1, step: 1, value: -6, fmt: v => num(v, 0) },
          { id: "tol", label: tx(t, "phChaos_liveTol", "tolerance Δ"), min: 0.01, max: 1, step: 0.01, value: 0.1, fmt: v => num(v, 2) },
        ]}
        compute={horizonNumbers(t)}
        note={tx(t, "phChaos_liveNote", "Make δ₀ a million times smaller (k from −6 to −12): the horizon grows only by ln(10⁶)/λ ≈ 14/λ. Doubling λ halves it. This is why better measurements barely help long-range forecasts, while understanding λ tells you where the wall is.")} />
      <p>
        {tx(t, "phChaos_weather",
          "The atmosphere is the most famous example. Forecast errors at the scale of weather systems roughly double every couple of days; useful forecasts now reach about ten days, and the theoretical limit is thought to be around two weeks, however good the instruments. Lorenz summed it up in the title of a 1972 talk: does the flap of a butterfly's wings in Brazil set off a tornado in Texas? Not by itself, but a forecast that ignored it would be wrong a few weeks later.")}
      </p>

      <H2>{tx(t, "phChaos_needTitle", "What chaos needs")}</H2>
      <p>
        {tx(t, "phChaos_needBody",
          "Two ingredients. The first is nonlinearity: in a linear system, such as a pendulum with small swings or any set of springs, the difference between two motions obeys the same linear equations as the motions themselves, so it can grow at most like a sum of oscillations, never exponentially without bound. The \"break it\" button of the figure shows this. The second is room. A flow in a phase space of two dimensions cannot be chaotic, because curves in a plane that may not cross can only spiral into a point, close into a loop, or run off: this is the Poincaré–Bendixson theorem. Chaos needs at least three dimensions, so a single pendulum, with its two-dimensional phase plane, is never chaotic. Push it periodically, and the phase of the push becomes a third dimension: the driven pendulum can be.")}
      </p>
      <LessonTable
        headers={[tx(t, "phChaos_tSys", "System"), tx(t, "phChaos_tDim", "Phase-space dimensions"), tx(t, "phChaos_tChaos", "Chaotic?")]}
        rows={[
          [tx(t, "phChaos_s1a", "simple pendulum"), "2", tx(t, "phChaos_s1c", "never")],
          [tx(t, "phChaos_s2a", "pendulum pushed back and forth"), "3", tx(t, "phChaos_s2c", "for some pushes")],
          [tx(t, "phChaos_s3a", "double pendulum"), "4", tx(t, "phChaos_s3c", "at high energy")],
          [tx(t, "phChaos_s4a", "Earth round the Sun alone"), "4", tx(t, "phChaos_s4c", "never: two bodies are solvable")],
          [tx(t, "phChaos_s5a", "three bodies under gravity"), tx(t, "phChaos_s5b", "12 (18 in 3D)"), tx(t, "phChaos_s5c", "usually")],
          [tx(t, "phChaos_s6a", "Lorenz's convection model"), "3", tx(t, "phChaos_s6c", "yes")],
        ]}
      />
      <H3>{tx(t, "phChaos_foldTitle", "Stretching and folding")}</H3>
      <p>
        {tx(t, "phChaos_foldBody",
          "Exponential separation cannot go on for ever in a bounded region: the states would leave it. What happens instead is stretching and folding, like a baker kneading dough. A small blob of states is stretched in one direction (nearby states separate), squeezed in another, and folded back into the region; then stretched again. After a few rounds, two raisins that started side by side are anywhere in the dough. The Liouville figure of the previous chapter showed the first stretch; in a chaotic system the folding never stops and the blob becomes an infinitely layered filament.")}
      </p>
      <H3>{tx(t, "phChaos_attrTitle", "Strange attractors")}</H3>
      <p>
        {tx(t, "phChaos_attrBody",
          "Real systems lose energy to friction, so phase-space volumes shrink instead of being conserved, and motions settle onto an attractor. For a damped pendulum the attractor is a point, the rest position. A chaotic system with friction, kept going by a driving force, settles onto a strange attractor: a set of zero volume, stretched and folded infinitely often, with a fractal structure, detail at every scale. Lorenz's model of a layer of fluid heated from below has three variables: x, how fast the fluid rolls, and y and z, how the temperature varies across and up the layer. Its equations are ẋ = σ(y − x), ẏ = x(ρ − z) − y, ż = xy − βz, with σ = 10, ρ = 28 and β = 8/3. The motion loops round one lobe of a butterfly-shaped attractor, then the other, switching unpredictably; the attractor has a fractal dimension of about 2.06, a little more than a surface.")}
      </p>

      <H2>{tx(t, "phChaos_logTitle", "The logistic map: chaos in one line")}</H2>
      <p>
        {tx(t, "phChaos_logBody",
          "The simplest chaos does not even need differential equations. Take a population of insects that breed once a year, and let x be its size as a fraction of the most the habitat can hold, between 0 and 1. Next year's population grows with this year's, by a factor r, but is limited by crowding, the factor (1 − x). The rule x → r x (1 − x) is the logistic map, and the biologist Robert May showed in 1976 how much it hides. Repeating it from a starting x₀ gives a sequence x₀, x₁, x₂, …, and what that sequence does depends on r.")}
      </p>
      <Derivation t={t} label={tx(t, "phChaos_eqFixed", "The steady population and when it is stable")}
        steps={[
          { tex: r`x^* = r\,x^*(1 - x^*)`, why: tx(t, "phChaos_f1", "a fixed point: a value the map sends to itself") },
          { tex: r`\green{x^* = 1 - \frac{1}{r}}`, why: tx(t, "phChaos_f2", "divide by x* (the other solution is extinction, x* = 0) and solve") },
          { tex: r`x_{n+1} - x^* \approx f'(x^*)\,\big(x_n - x^*\big)`, why: tx(t, "phChaos_f3", "near the fixed point, the map is close to its tangent line, so a small error is multiplied by the slope f′ each year") },
          { tex: r`f'(x) = r(1 - 2x) \;\Rightarrow\; f'(x^*) = 2 - r`, why: tx(t, "phChaos_f4", "differentiate rx − rx², then put in x* = 1 − 1/r") },
          { tex: r`\green{|2 - r| < 1 \iff 1 < r < 3}`, why: tx(t, "phChaos_f5", "errors shrink if the slope is less than 1 in size: the population settles for r between 1 and 3, and not above") },
        ]} />
      <p>
        {tx(t, "phChaos_doubling",
          "Above r = 3 the steady state is unstable and the population alternates between a high year and a low year, a cycle of period 2. At r = 3.449 that cycle becomes unstable in turn and is replaced by a cycle of period 4, then 8 at 3.544, 16, 32, … The doublings come faster and faster: each interval of r is about 4.669 times shorter than the one before. They pile up at r ≈ 3.5699, and beyond it the sequence never repeats: chaos.")}
      </p>
      <LogisticMapFigure t={t} />
      <p>
        {tx(t, "phChaos_feigen",
          "Mitchell Feigenbaum found in 1975 that the ratio 4.669… is not special to this map. Any process that goes to chaos by period doubling, with a smooth single hump, gives the same number, Feigenbaum's δ. It has been measured in convecting fluids, dripping taps, electronic circuits and lasers. Chaos has universal laws, as precise as those of orderly motion.")}
      </p>
      <Equation label={tx(t, "phChaos_eqLyapMap", "The Lyapunov exponent of a map")}
        where={[
          [r`\lambda`, tx(t, "phChaos_wLamMap", "the average stretching per step, in natural-log units")],
          [r`f'(x_n)`, tx(t, "phChaos_wFp", "the slope of the map at the n-th value: how much a tiny error is multiplied by in that step")],
          [r`N`, tx(t, "phChaos_wN", "the number of steps averaged over")],
        ]}
        words={tx(t, "phChaos_lyapMapWords", "Multiply the stretch factors of every step, and take the average logarithm: positive means errors grow on the whole.")}
        note={tx(t, "phChaos_lyapMapNote", "At r = 4 the exponent is exactly ln 2: on average each step doubles the error. Since doubling an error loses one binary digit of the starting value, the map eats one bit of information per step. A starting value known to 50 bits, the precision of an ordinary computer number, is useless after about 50 steps.")}>
        {r`\lambda = \lim_{N\to\infty} \frac{1}{N}\sum_{n=0}^{N-1} \ln\big|f'(x_n)\big|`}
      </Equation>
      <H3>{tx(t, "phChaos_poincareTitle", "Poincaré sections")}</H3>
      <p>
        {tx(t, "phChaos_poincareBody",
          "Maps are not just toys. Henri Poincaré, studying three bodies under gravity around 1890, found he could understand a flow by marking a dot each time a trajectory crosses a chosen surface, for example each time the double pendulum's lower arm passes straight down. The flow becomes a map from one crossing to the next. Regular motion leaves its dots on smooth closed curves; chaotic motion scatters them over a region. In doing this, Poincaré became the first to see chaos, some seventy years before it had a name.")}
      </p>

      <H2>{tx(t, "phChaos_whereTitle", "Chaos around us")}</H2>
      <LessonTable
        headers={[tx(t, "phChaos_tWhere", "Where"), tx(t, "phChaos_tWhat", "What is chaotic")]}
        rows={[
          [tx(t, "phChaos_w1a", "the Solar System"), tx(t, "phChaos_w1b", "the orbits of the inner planets have a Lyapunov time of about 5 million years: their positions cannot be predicted beyond some tens of millions of years, and Mercury has about a 1% chance of becoming unstable within the Sun's lifetime")],
          [tx(t, "phChaos_w2a", "Saturn's moon Hyperion"), tx(t, "phChaos_w2b", "an irregular potato-shaped moon that tumbles unpredictably instead of keeping one face to Saturn")],
          [tx(t, "phChaos_w3a", "the asteroid belt"), tx(t, "phChaos_w3b", "gaps where an asteroid's period would be a simple fraction of Jupiter's: orbits there turn chaotic and get cleared out")],
          [tx(t, "phChaos_w4a", "weather"), tx(t, "phChaos_w4b", "forecasts are run many times from slightly different starts (an ensemble) to see how far they can be trusted")],
          [tx(t, "phChaos_w5a", "fluids"), tx(t, "phChaos_w5b", "the onset of turbulence; a dripping tap whose drops fall at irregular intervals")],
          [tx(t, "phChaos_w6a", "dice and roulette"), tx(t, "phChaos_w6b", "deterministic throws, made random in practice by sensitivity to tiny differences")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phChaos_notRandom", "Chaos is not the same as randomness. A chaotic system follows exact laws, and over short times it can be predicted very well; its statistics, such as the shape of its attractor or the average weather of a season, can be predicted for ever. What is lost is only the detailed state far into the future. Climate projections rest on this distinction: the weather of a particular day in 2050 is unknowable, the average of many such days is not.")}
      </Callout>

      <H2>{tx(t, "phChaos_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phChaos_ex1", "1. A system with λ = 0.5 per second, started with an error of 10⁻⁶, can be trusted until the error reaches 0.1: t_h = ln(0.1/10⁻⁶)/0.5 = ln(10⁵)/0.5 = 11.5/0.5 = 23 s. Measuring a thousand times more precisely (10⁻⁹) adds only ln(1000)/0.5 = 14 s.")}</p>
      <p>{tx(t, "phChaos_ex2", "2. If weather errors double every 2 days, λ = ln 2 / 2 = 0.35 per day. Shrinking the starting error from 1% to 0.01% of the full range buys ln(100)/0.35 = 13 extra days only if everything else is perfect, which it never is.")}</p>
      <p>{tx(t, "phChaos_ex3", "3. The logistic map with r = 2.5: x* = 1 − 1/2.5 = 0.6, and the slope there is 2 − 2.5 = −0.5, so an error halves each step and flips sign: the population settles, oscillating gently.")}</p>
      <p>{tx(t, "phChaos_ex4", "4. With r = 3.2, the period-2 cycle visits 0.513 and 0.799: check 3.2 × 0.513 × 0.487 = 0.799 and 3.2 × 0.799 × 0.201 = 0.513.")}</p>
      <p>{tx(t, "phChaos_ex5", "5. At r = 4 the map loses one bit per step. A start known to 15 decimal digits, about 50 bits, gives a useless sequence after about 50 steps; the figure shows two starts differing by 10⁻⁶, about 20 bits, parting after about 20.")}</p>

      <H2>{tx(t, "phChaos_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phChaos_tWrong", "Wrong"), tx(t, "phChaos_tRight", "Right"), tx(t, "phChaos_tWhy", "Why")]}
        rows={[
          [tx(t, "phChaos_m1w", "chaos means randomness"), tx(t, "phChaos_m1r", "deterministic but sensitive"), tx(t, "phChaos_m1", "the same start always gives the same motion; nearby starts do not")],
          [tx(t, "phChaos_m2w", "better measurements fix it"), tx(t, "phChaos_m2r", "they help only logarithmically"), tx(t, "phChaos_m2", "t_h grows with ln(1/δ₀), not with 1/δ₀")],
          [tx(t, "phChaos_m3w", "complicated systems are chaotic, simple ones are not"), tx(t, "phChaos_m3r", "one line can be chaotic"), tx(t, "phChaos_m3", "the logistic map; and many-particle linear systems are not chaotic")],
          [tx(t, "phChaos_m4w", "a single pendulum can be chaotic"), tx(t, "phChaos_m4r", "only if driven"), tx(t, "phChaos_m4", "a flow needs three phase-space dimensions")],
          [tx(t, "phChaos_m5w", "chaos makes everything unpredictable"), tx(t, "phChaos_m5r", "only details far ahead"), tx(t, "phChaos_m5", "short-term motion and long-run statistics stay predictable")],
          [tx(t, "phChaos_m6w", "the separation grows for ever"), tx(t, "phChaos_m6r", "until it fills the available region"), tx(t, "phChaos_m6", "then the two motions are just unrelated")],
        ]}
      />

      <KeyIdeas t={t} id="phChaos" items={[
        "Chaos is deterministic motion with sensitive dependence on initial conditions: tiny differences grow until they dominate.",
        "Small gaps grow exponentially, δ ≈ δ₀ e^(λt); λ, the Lyapunov exponent, is positive for chaos.",
        "The prediction horizon t_h = (1/λ) ln(Δ/δ₀) grows only with the logarithm of the starting precision.",
        "Chaos needs nonlinearity, and a flow needs at least three phase-space dimensions: a single pendulum is never chaotic, a double one can be.",
        "Stretching and folding mix states; with friction, motion settles on a fractal strange attractor such as Lorenz's.",
        "The logistic map x → rx(1 − x) goes from a fixed point through period doubling (Feigenbaum's δ = 4.669) to chaos past r ≈ 3.57.",
      ]} />
    </Article>
  );
}

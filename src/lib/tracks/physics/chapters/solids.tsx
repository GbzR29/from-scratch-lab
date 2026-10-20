"use client";

// Quantum deeper 4: solids — crystals and Bloch waves, levels splitting into
// bands (two wells, N wells, the tight-binding band E = E₀ − 2t cos ka, gaps
// as Bragg reflection), filling the bands: metals, insulators and
// semiconductors, conduction σ = neμ, intrinsic carriers
// nᵢ = √(NcNv) e^(−Eg/2kT), holes, doping and n·p = nᵢ², the p–n junction
// and the diode equation, LEDs, solar cells and transistors, and a note on
// superconductivity.

import { Callout, H2, H3, LessonTable } from "@/components/lesson/LessonComponents";
import { Equation } from "@/components/lesson/Tex";
import { Derivation } from "@/components/lesson/Derivation";
import { LiveFormula } from "@/components/lesson/LiveFormula";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { KeyIdeas, Article, Lead, Goals } from "@/components/lesson/Prose";
import { BandsFigure } from "@/components/lesson/figures/physics/BandsFigure";
import { SemiconductorFigure } from "@/components/lesson/figures/physics/SemiconductorFigure";

const r = String.raw;
const num = (v: number, d = 2) => String(+v.toFixed(d)).replace("-", "−");
const sciTex = (v: number) => {
  const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  return `${num(m, 2)}\\times10^{${e}}`;
};

// ── Live formulas: the numbers plugged in ─────────────────────────────────────

/** Intrinsic carrier density of silicon (or any gap) at temperature T. */
const niNumbers = (t: TrackTranslations) => (v: Record<string, number>) => {
  const kT = 8.617e-5 * v.T, s = (v.T / 300) ** 1.5;
  const ni = Math.sqrt(2.8e19 * 1.04e19) * s * Math.exp(-v.eg / (2 * kT));
  return {
    tex: r`n_i = 1.7\times10^{19}\times${num(s, 2)}\times e^{-${num(v.eg, 2)}/(2\times${num(kT, 4)})} = \amber{${sciTex(ni)}\ \text{cm}^{-3}}`,
    meter: Math.min(1, Math.max(0, Math.log10(ni) / 19)),
    meterLabel: `${tx(t, "phSol_liveOne", "one carrier per")} ${(5e22 / ni).toExponential(1).replace("e+", "e")} ${tx(t, "phSol_liveAtoms", "atoms")}`,
  };
};

/** Current through a diode at forward voltage V. */
const diodeNumbers = (v: Record<string, number>) => {
  const Is = 1e-12, kT = 0.02585, I = Is * (Math.exp(v.V / kT) - 1);
  const show = Math.abs(I) >= 1e-3 ? `${num(I * 1000, 2)}\\ \\text{mA}` : Math.abs(I) >= 1e-6 ? `${num(I * 1e6, 2)}\\ \\mu\\text{A}` : `${num(I * 1e12, 2)}\\ \\text{pA}`;
  return {
    tex: r`I = 10^{-12}\ \text{A}\left(e^{${num(v.V, 2)}/0.0259} - 1\right) = \amber{${show}}`,
    meter: Math.min(1, Math.max(0, (Math.log10(Math.max(1e-13, Math.abs(I))) + 12) / 11)),
  };
};

export function SolidsContent({ t }: { t: TrackTranslations }) {
  return (
    <Article>
      <Lead>
        {tx(t, "phSol_intro",
          "Copper conducts electricity 10²⁰ times better than glass, yet both are made of atoms with electrons, and both hold together by the same electric forces. Why? Because when atoms are packed into a crystal, their sharp energy levels spread into bands, and what matters is whether the highest band holding electrons is full or not. This one idea, from the late 1920s, explains metals, insulators and the semiconductors in every chip, LED and solar panel. It is what the quantum mechanics of the last chapters is used for most, every second of every day.")}
      </Lead>

      <Goals t={t} id="phSol" items={[
        "Explain how the levels of single atoms spread into bands with gaps when atoms form a crystal.",
        "Use band filling to tell metals, insulators and semiconductors apart.",
        "Compute the carrier density of a pure semiconductor and explain how doping changes it.",
        "Describe how a p–n junction works as a diode, an LED and a solar cell.",
      ]} />

      <H2>{tx(t, "phSol_crystalTitle", "Electrons in a crystal")}</H2>
      <p>
        {tx(t, "phSol_crystalBody",
          "In a crystal the atoms sit in a pattern that repeats every fraction of a nanometre (0.36 nm for copper's cube, 0.54 nm for silicon's). The inner electrons stay at home. The outer ones feel the pull of every nucleus and spread across the whole crystal. In 1928 Felix Bloch showed what their waves look like in a potential that repeats with spacing a: a travelling wave e^(ikx), like a free electron's, multiplied by a pattern that repeats from atom to atom.")}
      </p>
      <Equation label={tx(t, "phSol_eqBloch", "Bloch's theorem")}
        where={[
          [r`\psi_k`, tx(t, "phSol_wPsi", "an electron wave in the crystal, labelled by its wavenumber k")],
          [r`e^{ikx}`, tx(t, "phSol_wPlane", "a plane wave, as for a free electron: the electron travels through the crystal without bouncing off each atom")],
          [r`u_k(x)`, tx(t, "phSol_wU", "a function that repeats with the lattice, u(x + a) = u(x): the wave's shape near each atom")],
          [r`-\pi/a < k \le \pi/a`, tx(t, "phSol_wK", "the range of k needed: k and k + 2π/a describe the same wave (the first Brillouin zone)")],
        ]}
        words={tx(t, "phSol_blochWords", "In a perfect crystal, an electron's wave is a plane wave dressed up with the repeating pattern of the atoms.")}
        note={tx(t, "phSol_blochNote", "This is why a perfect crystal has no electrical resistance: the electron wave moves through the regular array as a wave moves through a clean medium. Resistance comes from what breaks the pattern: the atoms' thermal jiggling, impurities and defects.")}>
        {r`\psi_k(x) = e^{ikx}\,u_k(x), \qquad u_k(x + a) = u_k(x)`}
      </Equation>

      <H2>{tx(t, "phSol_bandsTitle", "From levels to bands")}</H2>
      <p>
        {tx(t, "phSol_bandsBody",
          "Take one atom: it has sharp levels. Bring a second close, and an electron can tunnel from one to the other (the Schrödinger chapter). Each level splits in two, like two pendulums joined by a spring, which swing together or against each other at two slightly different frequencies. N atoms split each level into N, spread over a range set by how easily the electron tunnels. The figure solves this exactly for a row of wells.")}
      </p>
      <BandsFigure t={t} />
      <Equation label={tx(t, "phSol_eqTb", "A band from tunnelling (tight binding)")}
        where={[
          [r`E_0`, tx(t, "phSol_wE0", "the level of a single isolated atom")],
          [r`t`, tx(t, "phSol_wT", "the hopping energy: how strongly neighbouring atoms are linked by tunnelling. Thinner barriers, larger t")],
          [r`a`, tx(t, "phSol_wA", "the spacing between atoms")],
          [r`E_j`, tx(t, "phSol_wEj", "the N levels of a row of N atoms, j = 1 … N, all inside the band from E₀ − 2t to E₀ + 2t")],
        ]}
        words={tx(t, "phSol_tbWords", "Each atomic level becomes a band of width 4t, centred on the original level; a row of N atoms puts N levels in it.")}
        note={tx(t, "phSol_tbNote", "The band is wider for the higher levels, whose waves reach further out of each atom and tunnel more easily: the figure's second band is wider than its first. A crystal of one cubic centimetre has some 10²³ atoms, so the levels in a band are about 10⁻²³ eV apart, effectively continuous.")}>
        {r`E(k) = E_0 - 2t\cos ka, \qquad E_j = E_0 - 2t\cos\frac{j\pi}{N+1}`}
      </Equation>
      <Callout type="tip" t={t}>
        {tx(t, "phSol_bragg", "The gaps have a wave explanation too, from the wave optics chapter. An electron whose wavelength fits the lattice, k = π/a, is reflected by every row of atoms in step (Bragg reflection), so it cannot travel: it forms two standing waves, one with its peaks on the atoms (lower energy) and one with its peaks between them (higher). No travelling state exists between those two energies: a gap.")}
      </Callout>

      <H2>{tx(t, "phSol_fillTitle", "Full bands, half-full bands")}</H2>
      <p>
        {tx(t, "phSol_fillBody",
          "Now put the electrons in, two per level (Pauli), lowest first. What happens next depends only on where the filling stops. If it stops in the middle of a band, there are empty levels just above the filled ones, a tiny push from an electric field moves electrons into them, and they carry a current: a metal. If it stops exactly at the top of a band, with a gap above, then for every electron moving right there is one moving left, and no field can change that without lifting electrons across the gap: an insulator. A semiconductor is an insulator with a small gap, small enough that heat lifts a few electrons across.")}
      </p>
      <LessonTable
        headers={[tx(t, "phSol_tMat", "Material"), tx(t, "phSol_tBand", "Top of the filling"), tx(t, "phSol_tGap", "Gap"), tx(t, "phSol_tKind", "Kind")]}
        rows={[
          [tx(t, "phSol_r1", "sodium, copper"), tx(t, "phSol_r1b", "middle of the band from the outer s electron (one per atom, room for two)"), "–", tx(t, "phSol_metal", "metal")],
          [tx(t, "phSol_r2", "magnesium"), tx(t, "phSol_r2b", "two s electrons fill the s band, but it overlaps the empty p band"), "–", tx(t, "phSol_metal", "metal")],
          [tx(t, "phSol_r3", "germanium, silicon"), tx(t, "phSol_r3b", "top of the bonding (valence) band"), "0.66, 1.12 eV", tx(t, "phSol_semi", "semiconductor")],
          [tx(t, "phSol_r4", "gallium nitride"), tx(t, "phSol_r4b", "top of the valence band"), "3.4 eV", tx(t, "phSol_wide", "wide-gap semiconductor")],
          [tx(t, "phSol_r5", "diamond, glass"), tx(t, "phSol_r5b", "top of the valence band"), tx(t, "phSol_r5g", "5.5, about 9 eV"), tx(t, "phSol_ins", "insulator")],
        ]}
      />
      <Equation label={tx(t, "phSol_eqSigma", "Conductivity")}
        where={[
          [r`\sigma`, tx(t, "phSol_wSig", "the conductivity in siemens per metre; the resistivity is ρ = 1/σ (the circuits chapter)")],
          [r`n`, tx(t, "phSol_wN", "the number of mobile charge carriers per cubic metre")],
          [r`e`, tx(t, "phSol_wE", "the charge of each carrier, 1.60 × 10⁻¹⁹ C")],
          [r`\mu`, tx(t, "phSol_wMu", "the mobility: drift speed per unit field, v = μE, in m²/(V·s). It is limited by collisions with lattice vibrations and impurities")],
        ]}
        words={tx(t, "phSol_sigmaWords", "How well a material conducts is how many carriers it has, times their charge, times how freely they drift.")}
        note={tx(t, "phSol_sigmaNote", "Heat a metal and its resistance rises: n is fixed, but the atoms jiggle more and μ falls. Heat a semiconductor and its resistance falls steeply: n grows exponentially, far faster than μ drops. That opposite behaviour is the simplest test of which you have.")}>
        {r`\sigma = n\,e\,\mu`}
      </Equation>

      <H2>{tx(t, "phSol_semiTitle", "Semiconductors: electrons and holes")}</H2>
      <p>
        {tx(t, "phSol_semiBody",
          "In silicon each atom shares its four outer electrons in bonds with four neighbours; the bonding states form the valence band, completely full. Breaking a bond lifts an electron across the gap into the conduction band, where it is free to move. It leaves a hole: a missing electron in a bond, which a neighbouring electron can hop into, so the hole moves too and acts like a positive charge. Heat makes these pairs; the chance of the needed energy goes as a Boltzmann factor, which is why the gap matters so much.")}
      </p>
      <Derivation t={t} label={tx(t, "phSol_niDer", "Where nᵢ and n·p = nᵢ² come from")}
        steps={[
          { tex: r`n = N_c\,e^{-(E_c - E_F)/kT}`, why: tx(t, "phSol_dn1", "electrons in the conduction band: Nc states near its bottom edge Ec, each filled with the Boltzmann chance of an energy Ec − E_F above the Fermi level E_F (statistical mechanics chapter)") },
          { tex: r`p = N_v\,e^{-(E_F - E_v)/kT}`, why: tx(t, "phSol_dn2", "holes in the valence band: Nv states near its top edge Ev, each empty with the chance of the energy E_F − Ev") },
          { tex: r`n\,p = N_c N_v\,e^{-(E_c - E_v)/kT} = N_c N_v\,e^{-E_g/kT}`, why: tx(t, "phSol_dn3", "multiply: E_F cancels, so the product depends only on the material and T, not on doping") },
          { tex: r`\green{n = p = n_i = \sqrt{N_c N_v}\,e^{-E_g/2kT}}`, why: tx(t, "phSol_dn4", "in a pure crystal every electron left a hole, so n = p, and each is the square root of the product: hence the 2 in the exponent") },
        ]} />
      <Equation label={tx(t, "phSol_eqNi", "Carriers in a pure semiconductor")}
        where={[
          [r`n_i`, tx(t, "phSol_wNi", "the intrinsic density: electrons per cm³ in the conduction band, equal to the holes in the valence band")],
          [r`N_c,\ N_v`, tx(t, "phSol_wNc", "the effective numbers of states near the band edges, about 10¹⁹ cm⁻³, growing as T^(3/2)")],
          [r`E_g`, tx(t, "phSol_wEg", "the band gap")],
          [r`kT`, tx(t, "phSol_wKT", "the thermal energy, 0.0259 eV at 300 K. The 2 appears because each excitation makes two carriers, sharing the cost")],
        ]}
        words={tx(t, "phSol_niWords", "The number of free carriers falls exponentially with the gap and rises exponentially with temperature.")}
        note={tx(t, "phSol_niNote", "For silicon at 300 K, e^(−1.12/0.0518) = 4 × 10⁻¹⁰, so nᵢ ≈ 10¹⁰ cm⁻³: about one free electron for every 5 × 10¹² atoms. Pure silicon is a poor conductor; it is the doping that makes it useful.")}>
        {r`n_i = \sqrt{N_c N_v}\;e^{-E_g/2kT}`}
      </Equation>
      <LiveFormula label={tx(t, "phSol_liveNi", "Try it: how many carriers in pure silicon?")}
        tex={r`n_i = \sqrt{N_c N_v}\,e^{-E_g/2kT}`}
        vars={[
          { id: "T", label: tx(t, "phSol_liveT", "temperature T"), min: 200, max: 600, step: 5, value: 300, fmt: v => `${num(v, 0)} K` },
          { id: "eg", label: tx(t, "phSol_liveEg", "gap Eg"), min: 0.3, max: 3.5, step: 0.01, value: 1.12, fmt: v => `${num(v, 2)} eV` },
        ]}
        compute={niNumbers(t)}
        note={tx(t, "phSol_liveNiNote", "Silicon's Nc and Nv are used for every gap. From 300 K to 400 K the count rises about 350 times. Set the gap to 3.4 eV (gallium nitride) and almost no carriers remain at any reasonable temperature, which is why such wide-gap materials work in hot power electronics.")} />
      <H3>{tx(t, "phSol_dopeTitle", "Doping")}</H3>
      <p>
        {tx(t, "phSol_dopeBody",
          "Replace one silicon atom in a million with phosphorus, which has five outer electrons. Four go into bonds; the fifth is held so weakly (about 0.045 eV) that at room temperature it is free. Silicon now has one free electron per phosphorus atom, 5 × 10¹⁶ cm⁻³, millions of times its own: n-type. Boron, with three outer electrons, leaves a bond one electron short, a hole: p-type. The minority carriers do not vanish, they shrink, because electrons and holes meet and recombine; in equilibrium their product stays fixed.")}
      </p>
      <Equation label={tx(t, "phSol_eqMass", "The law of mass action")}
        where={[
          [r`n,\ p`, tx(t, "phSol_wNp", "the densities of free electrons and holes")],
          [r`N_D,\ N_A`, tx(t, "phSol_wNd", "the densities of donors (like phosphorus) and acceptors (like boron), all ionised at room temperature")],
        ]}
        words={tx(t, "phSol_massWords", "Doping sets the difference between electrons and holes; their product is fixed by the material and the temperature.")}
        note={tx(t, "phSol_massNote", "In n-type silicon with N_D = 10¹⁶ cm⁻³: n ≈ 10¹⁶ and p = nᵢ²/n = 10²⁰/10¹⁶ = 10⁴ cm⁻³. The holes are now a trillionth of the electrons.")}>
        {r`n\,p = n_i^2, \qquad n - p = N_D - N_A`}
      </Equation>
      <SemiconductorFigure t={t} />

      <H2>{tx(t, "phSol_pnTitle", "The p–n junction")}</H2>
      <p>
        {tx(t, "phSol_pnBody",
          "Join p-type and n-type silicon. Electrons from the n side diffuse into the p side and fill holes there; holes diffuse the other way. They leave behind a thin layer, the depletion region, with fixed positive ions on the n side and negative ions on the p side and almost no free carriers. Its electric field stops further diffusion, with a built-in voltage of about 0.7 V in silicon. Push the other way (forward bias, p side positive) and the barrier drops, so current flows freely; pull (reverse bias) and the barrier grows, so almost nothing flows. That one-way valve is a diode.")}
      </p>
      <Equation label={tx(t, "phSol_eqDiode", "The diode equation")}
        where={[
          [r`I`, tx(t, "phSol_wI", "the current through the junction")],
          [r`I_s`, tx(t, "phSol_wIs", "the saturation current, the tiny reverse current carried by minority carriers; about 10⁻¹² A for a small silicon diode")],
          [r`V`, tx(t, "phSol_wV", "the applied voltage, positive for forward bias")],
          [r`kT/e`, tx(t, "phSol_wKTe", "the thermal voltage, 25.9 mV at room temperature")],
        ]}
        words={tx(t, "phSol_diodeWords", "Every extra 60 mV of forward voltage multiplies the current by ten; in reverse the current stays stuck at the tiny Is.")}
        note={tx(t, "phSol_diodeNote", "The exponential is the Boltzmann factor again: lowering the barrier by eV lets e^(eV/kT) times as many carriers over it. The factor ten per 60 mV is e^(0.06/0.0259) ≈ 10.")}>
        {r`I = I_s\left(e^{eV/kT} - 1\right)`}
      </Equation>
      <LiveFormula label={tx(t, "phSol_liveDiode", "Try it: current through a silicon diode")}
        tex={r`I = I_s\left(e^{eV/kT} - 1\right)`}
        vars={[{ id: "V", label: tx(t, "phSol_liveV", "voltage V"), min: -0.5, max: 0.75, step: 0.01, value: 0.6, fmt: v => `${num(v, 2)} V` }]}
        compute={diodeNumbers}
        note={tx(t, "phSol_liveDiodeNote", "With Is = 1 pA: at 0.6 V the current is about 12 mA, at 0.7 V more than half an ampere. Reverse it and the current is −1 pA, whatever the voltage (until the junction breaks down).")} />
      <LessonTable
        headers={[tx(t, "phSol_tDev", "Device"), tx(t, "phSol_tPrinciple", "What the junction does")]}
        rows={[
          [tx(t, "phSol_dv1", "LED"), tx(t, "phSol_dv1p", "forward current pushes electrons and holes together; in a direct-gap material each meeting emits a photon of energy ≈ Eg. Blue LEDs (GaN, Nobel 2014) made white LED lighting possible")],
          [tx(t, "phSol_dv2", "solar cell"), tx(t, "phSol_dv2p", "a photon with energy above Eg makes an electron–hole pair; the junction's field sweeps them apart, and the cell drives a current. A single silicon junction can convert at most about 33% of sunlight (the Shockley–Queisser limit)")],
          [tx(t, "phSol_dv3", "laser diode"), tx(t, "phSol_dv3p", "an LED inside a cavity, pumped above threshold (previous chapter)")],
          [tx(t, "phSol_dv4", "transistor (MOSFET)"), tx(t, "phSol_dv4p", "a voltage on an insulated gate pulls carriers into a thin channel between two junctions, switching the current on and off; a modern chip holds tens of billions")],
        ]}
      />
      <Callout type="info" t={t}>
        {tx(t, "phSol_super", "Some metals, cooled enough, lose all resistance: superconductivity, found by Heike Kamerlingh Onnes in mercury at 4.2 K in 1911. In 1957 Bardeen, Cooper and Schrieffer explained it: lattice vibrations bind electrons into pairs, and a pair of fermions is a boson. The pairs condense into one shared quantum state, like a Bose–Einstein condensate, which flows without scattering. Superconducting coils make the strong fields of MRI scanners and particle accelerators, and superconducting circuits are the qubits of the first chapter of this section.")}
      </Callout>

      <H2>{tx(t, "phSol_exTitle", "Worked examples")}</H2>
      <p>{tx(t, "phSol_ex1", "1. Copper: n = 8.5 × 10²⁸ m⁻³ and μ = 4.3 × 10⁻³ m²/(V·s) give σ = 8.5 × 10²⁸ × 1.60 × 10⁻¹⁹ × 4.3 × 10⁻³ = 5.8 × 10⁷ S/m, close to the measured 5.96 × 10⁷.")}</p>
      <p>{tx(t, "phSol_ex2", "2. Pure silicon from 300 K to 400 K: the exponential factor grows by e^((1.12/2k)(1/300 − 1/400)) = e^(5.4) ≈ 225 and √(Nc·Nv) grows by (4/3)^(3/2) = 1.54, so nᵢ rises about 350 times. A silicon chip running hot leaks far more current.")}</p>
      <p>{tx(t, "phSol_ex3", "3. Silicon doped with 10¹⁶ phosphorus atoms per cm³ (one per 5 million atoms): n = 10¹⁶ cm⁻³ and, with μ = 1400 cm²/(V·s), σ = 10¹⁶ × 1.6 × 10⁻¹⁹ × 1400 = 2.2 S/cm, a resistivity of 0.45 Ω·cm. Pure silicon's is a few hundred thousand Ω·cm.")}</p>
      <p>{tx(t, "phSol_ex4", "4. A red LED glows when its voltage reaches about 1.8–2 V, a blue one about 2.7–3 V. Multiply by e and you have the photon energy, 1240/λ eV: 1.9 eV for 650 nm, 2.7 eV for 460 nm. Measuring the voltage and the colour of a few LEDs is a classroom way to measure Planck's constant.")}</p>

      <H2>{tx(t, "phSol_mistakesTitle", "Common mistakes")}</H2>
      <LessonTable
        headers={[tx(t, "phSol_tWrong", "Wrong"), tx(t, "phSol_tRight", "Right"), tx(t, "phSol_tWhy", "Why")]}
        rows={[
          [tx(t, "phSol_m1w", "insulators have no free electrons because they are bound to atoms"), tx(t, "phSol_m1r", "their bands are exactly full"), tx(t, "phSol_m1", "electrons are shared over the crystal in both; a full band simply cannot carry a net current")],
          [tx(t, "phSol_m2w", "a hole is a positron"), tx(t, "phSol_m2r", "a hole is a missing electron in a band"), tx(t, "phSol_m2", "the moving thing is the gap left by electrons, which acts like a positive charge")],
          [tx(t, "phSol_m3w", "doped silicon is electrically charged"), tx(t, "phSol_m3r", "it is neutral"), tx(t, "phSol_m3", "each phosphorus brings an extra proton as well as the extra electron")],
          [tx(t, "phSol_m4w", "heating a metal improves conduction like a semiconductor"), tx(t, "phSol_m4r", "metals conduct worse when hot"), tx(t, "phSol_m4", "a metal's carrier number is fixed; only the scattering grows")],
          [tx(t, "phSol_m5w", "any semiconductor makes a good LED"), tx(t, "phSol_m5r", "it needs a direct gap"), tx(t, "phSol_m5", "in silicon and germanium the electron must also change momentum, so it usually gives its energy to the lattice as heat")],
        ]}
      />

      <KeyIdeas t={t} id="phSol" items={[
        "In a crystal, electron waves are Bloch waves, plane waves times the lattice's repeating pattern; a perfect crystal has no resistance.",
        "Tunnelling between N atoms splits each level into N, forming a band of width about 4t; between bands lie gaps with no states.",
        "Filling the bands two per level decides everything: a part-filled band makes a metal; a full band below a gap makes an insulator, or a semiconductor if the gap is small.",
        "Conductivity is σ = neμ; a pure semiconductor has nᵢ = √(NcNv) e^(−Eg/2kT) electrons and as many holes, about 10¹⁰ cm⁻³ in silicon at room temperature.",
        "Doping with donors or acceptors gives n-type or p-type material with a million times more carriers, and n·p = nᵢ² fixes the minority.",
        "A p–n junction passes current one way, I = Is(e^(eV/kT) − 1): the basis of diodes, LEDs, solar cells, laser diodes and transistors.",
      ]} />
    </Article>
  );
}

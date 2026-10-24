// src/lib/tracks/physics/descriptions.ts
// What search results show under each Physics lesson's title. Server only (../seo.ts).

import type { LessonDescriptions } from "../types";

export const physicsDescriptions: LessonDescriptions = {
  "units-measurement": {
    en: "Units and measurement: the seven SI base units, prefixes, converting units, dimensional analysis, orders of magnitude, uncertainty and significant figures.",
    pt: "Unidades e medidas: as sete unidades de base do SI, prefixos, conversão de unidades, análise dimensional, ordens de grandeza, incerteza e algarismos significativos.",
  },
  "kinematics-1d": {
    en: "Motion in a straight line: displacement vs distance, velocity and acceleration graphs, the constant-acceleration equations, and free fall.",
    pt: "Movimento retilíneo: deslocamento vs distância, gráficos de velocidade e aceleração, as equações do MUV e queda livre.",
  },
  "kinematics-2d": {
    en: "Projectile motion: split velocity into components, why horizontal and vertical motion are independent, flight time, maximum height, range, air drag.",
    pt: "Lançamento de projéteis: decomponha a velocidade, por que o movimento horizontal e o vertical são independentes, tempo de voo, altura máxima e alcance.",
  },
  "relative-motion": {
    en: "Relative motion and frames of reference: adding velocities, river-crossing and crosswind problems, the Galilean transformation, and where it breaks.",
    pt: "Movimento relativo e referenciais: soma de velocidades, travessia de rio e vento lateral, a transformação de Galileu e onde ela deixa de valer.",
  },
  "newtons-laws": {
    en: "Newton's three laws of motion explained: inertia, ΣF = ma, action and reaction pairs, mass vs weight, and free-body diagrams with worked examples.",
    pt: "As três leis de Newton explicadas: inércia, ΣF = ma, pares de ação e reação, massa vs peso e diagramas de corpo livre com exemplos resolvidos.",
  },
  forces: {
    en: "Everyday forces: weight, the normal force, static and kinetic friction, the inclined plane, tension over pulleys, springs and Hooke's law, air drag.",
    pt: "Forças do dia a dia: peso, força normal, atrito estático e cinético, plano inclinado, tração em polias, molas e lei de Hooke, e resistência do ar.",
  },
  "circular-motion": {
    en: "Circular motion: period, frequency and angular speed, centripetal acceleration a = v²/r, what provides the centripetal force, banked curves and loops.",
    pt: "Movimento circular: período, frequência e velocidade angular, aceleração centrípeta a = v²/r, quem faz o papel de força centrípeta, curvas inclinadas e loops.",
  },
  "work-energy": {
    en: "Work, energy and power: the work–energy theorem, kinetic and potential energy, conservation of mechanical energy, friction losses and efficiency.",
    pt: "Trabalho, energia e potência: teorema trabalho–energia, energia cinética e potencial, conservação da energia mecânica, perdas por atrito e rendimento.",
  },
  "momentum-collisions": {
    en: "Momentum and impulse, conservation of momentum, centre of mass, elastic and inelastic collisions, recoil and rockets, and 2D collisions.",
    pt: "Quantidade de movimento e impulso, conservação do momento, centro de massa, colisões elásticas e inelásticas, recuo, foguetes e colisões em 2D.",
  },
  rotation: {
    en: "Rotation, torque and moment of inertia: rotational kinematics, equilibrium, τ = Iα, and why a hoop rolls down a ramp slower than a ball.",
    pt: "Rotação, torque e momento de inércia: cinemática rotacional, equilíbrio, τ = Iα e por que um aro desce a rampa mais devagar que uma bola.",
  },
  "angular-momentum": {
    en: "Angular momentum and its conservation: spinning skaters, rotational collisions, Kepler's second law, and how a gyroscope precesses.",
    pt: "Momento angular e sua conservação: patinadores girando, colisões rotacionais, a segunda lei de Kepler e a precessão do giroscópio.",
  },
  "gravity-orbits": {
    en: "Newton's law of gravitation, orbital speed and period, Kepler's three laws, gravitational potential energy −GMm/r, and escape velocity.",
    pt: "Lei da gravitação universal, velocidade e período orbital, as três leis de Kepler, energia potencial gravitacional −GMm/r e velocidade de escape.",
  },
  "simple-harmonic": {
    en: "Simple harmonic motion: restoring forces, x = A cos(ωt + φ), the spring period T = 2π√(m/k), energy through a cycle, and the simple pendulum.",
    pt: "Movimento harmônico simples: força restauradora, x = A cos(ωt + φ), período da mola T = 2π√(m/k), energia ao longo do ciclo e pêndulo simples.",
  },
  "damping-resonance": {
    en: "Damping and resonance in physics: damped oscillators and their three regimes, the quality factor Q, driven oscillations, and resonance in the world.",
    pt: "Amortecimento e ressonância: osciladores amortecidos e seus três regimes, o fator de qualidade Q, oscilações forçadas e ressonância no mundo real.",
  },
  waves: {
    en: "Mechanical waves: transverse and longitudinal, y = A sin(kx − ωt), v = fλ, wave speed on a string, superposition, standing waves and harmonics.",
    pt: "Ondas mecânicas: transversais e longitudinais, y = A sen(kx − ωt), v = fλ, velocidade numa corda, superposição, ondas estacionárias e harmônicos.",
  },
  sound: {
    en: "The physics of sound: speed of sound, intensity and decibels, notes from open and closed pipes, beats, the Doppler effect and the sonic boom.",
    pt: "A física do som: velocidade do som, intensidade e decibéis, notas de tubos abertos e fechados, batimento, efeito Doppler e estrondo sônico.",
  },
  "fluid-statics": {
    en: "Fluids at rest: density and pressure, why pressure depends only on depth, Pascal's principle and the hydraulic press, Archimedes' principle and floating.",
    pt: "Hidrostática: densidade e pressão, por que a pressão só depende da profundidade, princípio de Pascal e prensa hidráulica, empuxo e princípio de Arquimedes.",
  },
  "fluid-dynamics": {
    en: "Fluids in motion: the continuity equation, Bernoulli's equation derived from energy, Torricelli's law, viscosity, laminar vs turbulent flow, Reynolds number.",
    pt: "Hidrodinâmica: equação da continuidade, equação de Bernoulli a partir da energia, lei de Torricelli, viscosidade, escoamento laminar vs turbulento e número de Reynolds.",
  },
  "temperature-heat": {
    en: "Heat vs temperature in physics: Celsius, Fahrenheit and kelvin, thermal expansion, specific heat Q = mcΔT, latent heat, conduction, convection, radiation.",
    pt: "Calor e temperatura: Celsius, Fahrenheit e kelvin, dilatação térmica, calor específico Q = mcΔT, calor latente, condução, convecção e radiação.",
  },
  thermodynamics: {
    en: "Thermodynamics explained: the ideal gas law, kinetic theory, the first law ΔU = Q − W, p–V diagrams, heat engines, Carnot efficiency, entropy.",
    pt: "Termodinâmica explicada: lei dos gases ideais, teoria cinética, primeira lei ΔU = Q − W, diagramas p–V, máquinas térmicas, rendimento de Carnot e entropia.",
  },
  "electric-charge-field": {
    en: "Electric charge and electric field: Coulomb's law, superposition, field lines, the field of a point charge, and Gauss's law with conductors.",
    pt: "Carga elétrica e campo elétrico: lei de Coulomb, superposição, linhas de campo, o campo de uma carga pontual e a lei de Gauss em condutores.",
  },
  "electric-potential": {
    en: "Electric potential and voltage, equipotentials, E = −ΔV/Δx, parallel-plate capacitors, dielectrics, stored energy ½CV², series and parallel capacitors.",
    pt: "Potencial elétrico e tensão, equipotenciais, E = −ΔV/Δx, capacitor de placas paralelas, dielétricos, energia ½CV² e associação de capacitores.",
  },
  circuits: {
    en: "Electric circuits: current, Ohm's law, resistivity, electric power, resistors in series and parallel, Kirchhoff's rules, and RC charging.",
    pt: "Circuitos elétricos: corrente, lei de Ohm, resistividade, potência elétrica, resistores em série e paralelo, leis de Kirchhoff e carga do circuito RC.",
  },
  magnetism: {
    en: "Magnetism: the magnetic field, the force F = qv × B on moving charges, forces on wires and electric motors, Ampère's law for wires and solenoids.",
    pt: "Magnetismo: o campo magnético, a força F = qv × B em cargas, força em fios e motores elétricos, e a lei de Ampère para fios e solenoides.",
  },
  induction: {
    en: "Electromagnetic induction: magnetic flux, Faraday's law and Lenz's law, motional emf, generators, self-inductance, and how a transformer works.",
    pt: "Indução eletromagnética: fluxo magnético, lei de Faraday e lei de Lenz, fem de movimento, geradores, autoindutância e como funciona o transformador.",
  },
  "maxwell-em-waves": {
    en: "Maxwell's equations in words, the displacement current, light as an electromagnetic wave with c = 1/√(μ₀ε₀), the spectrum, and polarisation.",
    pt: "As equações de Maxwell em palavras, a corrente de deslocamento, a luz como onda eletromagnética com c = 1/√(μ₀ε₀), o espectro e a polarização.",
  },
  "geometric-optics": {
    en: "Geometric optics: reflection, Snell's law of refraction, total internal reflection, rainbows, the thin-lens equation, magnification, the eye and glasses.",
    pt: "Óptica geométrica: reflexão, lei de Snell da refração, reflexão total, arco-íris, equação das lentes finas, ampliação, o olho e os óculos.",
  },
  "wave-optics": {
    en: "Interference and diffraction: Young's double-slit experiment, single-slit diffraction, resolution, diffraction gratings and thin-film colours.",
    pt: "Interferência e difração: experimento da fenda dupla de Young, difração em fenda única, resolução, redes de difração e cores de filmes finos.",
  },
  lagrangian: {
    en: "Lagrangian mechanics: generalised coordinates, L = T − V, the principle of stationary action, Euler–Lagrange equations, examples, Noether's theorem.",
    pt: "Mecânica lagrangiana: coordenadas generalizadas, L = T − V, princípio da ação estacionária, equações de Euler–Lagrange, exemplos e teorema de Noether.",
  },
  "hamiltonian-phase-space": {
    en: "Hamiltonian mechanics: from the Lagrangian to the Hamiltonian, Hamilton's equations, phase portraits of the pendulum, and Liouville's theorem.",
    pt: "Mecânica hamiltoniana: do lagrangiano ao hamiltoniano, equações de Hamilton, retrato de fase do pêndulo e o teorema de Liouville.",
  },
  chaos: {
    en: "Chaos theory: why deterministic systems can be unpredictable, the Lyapunov exponent, what chaos needs, and the logistic map's period doubling.",
    pt: "Teoria do caos: por que sistemas determinísticos podem ser imprevisíveis, o expoente de Lyapunov, o que o caos exige e a duplicação de período do mapa logístico.",
  },
  "statistical-mechanics": {
    en: "Statistical mechanics: microstates and macrostates, entropy S = k ln Ω, temperature from counting, the Boltzmann factor, and free energy.",
    pt: "Mecânica estatística: microestados e macroestados, entropia S = k ln Ω, temperatura a partir da contagem, o fator de Boltzmann e energia livre.",
  },
  "special-relativity": {
    en: "Special relativity explained: Einstein's postulates, time dilation with a light clock, length contraction, muons, and the relativity of simultaneity.",
    pt: "Relatividade especial explicada: postulados de Einstein, dilatação do tempo com relógio de luz, contração do comprimento, múons e relatividade da simultaneidade.",
  },
  spacetime: {
    en: "Spacetime diagrams and the Lorentz transformation: the spacetime interval, timelike and spacelike, relativistic velocity addition, the twin paradox.",
    pt: "Diagramas de espaço-tempo e a transformação de Lorentz: intervalo, separações tipo tempo e tipo espaço, soma relativística de velocidades e paradoxo dos gêmeos.",
  },
  "relativistic-energy": {
    en: "E = mc² explained: relativistic momentum, kinetic energy (γ − 1)mc², rest energy, E² = (pc)² + (mc²)², and binding energy from mass defects.",
    pt: "E = mc² explicado: momento relativístico, energia cinética (γ − 1)mc², energia de repouso, E² = (pc)² + (mc²)² e energia de ligação pelo defeito de massa.",
  },
  "general-relativity": {
    en: "General relativity: the equivalence principle, bending light, gravitational time dilation and GPS, curved spacetime, black holes, gravitational waves.",
    pt: "Relatividade geral: princípio da equivalência, desvio da luz, dilatação gravitacional do tempo e o GPS, espaço-tempo curvo, buracos negros e ondas gravitacionais.",
  },
  "birth-of-quantum": {
    en: "The birth of quantum physics: the ultraviolet catastrophe, Planck's law, the photoelectric effect K = hf − W, photon momentum and Compton scattering.",
    pt: "O nascimento da física quântica: catástrofe do ultravioleta, lei de Planck, efeito fotoelétrico K = hf − W, momento do fóton e espalhamento Compton.",
  },
  "wave-particle": {
    en: "Wave–particle duality: de Broglie wavelength, the double slit one particle at a time, Born's rule, wave packets, and Heisenberg's uncertainty principle.",
    pt: "Dualidade onda–partícula: comprimento de onda de de Broglie, fenda dupla uma partícula por vez, regra de Born, pacotes de onda e princípio da incerteza.",
  },
  schrodinger: {
    en: "The Schrödinger equation built step by step: the particle in a box and its energy levels, stationary states, quantum tunnelling, the quantum oscillator.",
    pt: "A equação de Schrödinger construída passo a passo: partícula na caixa e níveis de energia, estados estacionários, tunelamento quântico e oscilador quântico.",
  },
  "hydrogen-atom": {
    en: "The hydrogen atom: spectral lines and the Rydberg formula, the Bohr model and its limits, quantum numbers n, l, m and spin, orbitals and shells.",
    pt: "O átomo de hidrogênio: linhas espectrais e fórmula de Rydberg, o modelo de Bohr e seus limites, números quânticos n, l, m e spin, orbitais e camadas.",
  },
  "spin-qubits": {
    en: "Quantum spin and qubits: the Stern–Gerlach experiment, spin ±ħ/2, measuring along tilted axes, the Bloch sphere, precession and MRI.",
    pt: "Spin quântico e qubits: o experimento de Stern–Gerlach, spin ±ħ/2, medidas em eixos inclinados, a esfera de Bloch, precessão e ressonância magnética.",
  },
  entanglement: {
    en: "Quantum entanglement and Bell's theorem: two-qubit states, the EPR argument, Bell's inequality and 2√2, why no message travels, and its uses.",
    pt: "Emaranhamento quântico e teorema de Bell: estados de dois qubits, o argumento EPR, desigualdade de Bell e 2√2, por que nenhuma mensagem viaja e aplicações.",
  },
  "many-particles": {
    en: "Identical particles: bosons and fermions, the Pauli exclusion principle and the periodic table, Fermi energy, degeneracy pressure, how lasers work.",
    pt: "Partículas idênticas: bósons e férmions, princípio de exclusão de Pauli e a tabela periódica, energia de Fermi, pressão de degenerescência e como o laser funciona.",
  },
  solids: {
    en: "Band theory of solids: energy bands and gaps, metals vs insulators vs semiconductors, doping, and the p–n junction in diodes, LEDs and solar cells.",
    pt: "Teoria de bandas: bandas de energia e gaps, metais vs isolantes vs semicondutores, dopagem e a junção p–n em diodos, LEDs e células solares.",
  },
  nuclear: {
    en: "Nuclear physics: the strong force, the binding-energy curve, radioactive decay and half-life, carbon-14 dating, fission chain reactions and fusion.",
    pt: "Física nuclear: força forte, curva de energia de ligação, decaimento radioativo e meia-vida, datação por carbono-14, fissão em cadeia e fusão.",
  },
  "particle-physics": {
    en: "Particle physics and the Standard Model: quarks and colour, the four forces and their carriers, the weak force, conservation laws, and the Higgs.",
    pt: "Física de partículas e o Modelo Padrão: quarks e cor, as quatro forças e seus mediadores, a força fraca, leis de conservação e o bóson de Higgs.",
  },
  "quantum-fields": {
    en: "Quantum field theory for beginners: why particles are fields, the Klein–Gordon equation, Feynman diagrams, the fine-structure constant, the Higgs field.",
    pt: "Teoria quântica de campos para iniciantes: por que partículas são campos, equação de Klein–Gordon, diagramas de Feynman, constante de estrutura fina e campo de Higgs.",
  },
  cosmology: {
    en: "Cosmology: Hubble's law and redshift, the Friedmann equation, the age and fate of the universe, the hot Big Bang, the CMB, dark matter and dark energy.",
    pt: "Cosmologia: lei de Hubble e redshift, equação de Friedmann, idade e destino do universo, Big Bang quente, radiação cósmica de fundo, matéria e energia escuras.",
  },
};

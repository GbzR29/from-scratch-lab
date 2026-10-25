// src/components/lesson/figures/chemistry/elements.ts
// The element table every Chemistry widget reads. Data (2026-10-24): PubChem's
// periodic table (pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable) for
// electronegativity (Pauling), first ionisation energy and electron affinity
// (eV), state at 25 °C, melting/boiling points (K), density (g/cm³) and ground
// state configuration; atomic masses are IUPAC 2021 abridged standard atomic
// weights (for elements with no stable isotope: the mass of the longest-lived
// one); covalent radii are Pyykkö's single-bond radii (pm). null = no value.

export type Category = "nm" | "ng" | "am" | "ae" | "md" | "hl" | "pt" | "tm" | "ln" | "an";

type Row = [z: number, sym: string, name: string, mass: number, en: number | null, rCov: number | null,
  ie: number | null, ea: number | null, state: "s" | "l" | "g", mp: number | null, bp: number | null,
  density: number | null, cat: Category, config: string, predicted?: 1];

const ROWS: Row[] = [
  [1, "H", "Hydrogen", 1.008, 2.2, 32, 13.598, 0.754, "g", 13.81, 20.28, 0.00008988, "nm", "1s1"],
  [2, "He", "Helium", 4.0026, null, 46, 24.587, null, "g", 0.95, 4.22, 0.0001785, "ng", "1s2"],
  [3, "Li", "Lithium", 6.94, 0.98, 133, 5.392, 0.618, "s", 453.65, 1615, 0.534, "am", "[He]2s1"],
  [4, "Be", "Beryllium", 9.0122, 1.57, 102, 9.323, null, "s", 1560, 2744, 1.85, "ae", "[He]2s2"],
  [5, "B", "Boron", 10.81, 2.04, 85, 8.298, 0.277, "s", 2348, 4273, 2.37, "md", "[He]2s2 2p1"],
  [6, "C", "Carbon", 12.011, 2.55, 75, 11.26, 1.263, "s", 3823, 4098, 2.267, "nm", "[He]2s2 2p2"],
  [7, "N", "Nitrogen", 14.007, 3.04, 71, 14.534, null, "g", 63.15, 77.36, 0.0012506, "nm", "[He] 2s2 2p3"],
  [8, "O", "Oxygen", 15.999, 3.44, 63, 13.618, 1.461, "g", 54.36, 90.2, 0.001429, "nm", "[He]2s2 2p4"],
  [9, "F", "Fluorine", 18.998, 3.98, 64, 17.423, 3.339, "g", 53.53, 85.03, 0.001696, "hl", "[He]2s2 2p5"],
  [10, "Ne", "Neon", 20.18, null, 67, 21.565, null, "g", 24.56, 27.07, 0.0008999, "ng", "[He]2s2 2p6"],
  [11, "Na", "Sodium", 22.99, 0.93, 155, 5.139, 0.548, "s", 370.95, 1156, 0.97, "am", "[Ne]3s1"],
  [12, "Mg", "Magnesium", 24.305, 1.31, 139, 7.646, null, "s", 923, 1363, 1.74, "ae", "[Ne]3s2"],
  [13, "Al", "Aluminium", 26.982, 1.61, 126, 5.986, 0.441, "s", 933.437, 2792, 2.7, "pt", "[Ne]3s2 3p1"],
  [14, "Si", "Silicon", 28.085, 1.9, 116, 8.152, 1.385, "s", 1687, 3538, 2.3296, "md", "[Ne]3s2 3p2"],
  [15, "P", "Phosphorus", 30.974, 2.19, 111, 10.487, 0.746, "s", 317.3, 553.65, 1.82, "nm", "[Ne]3s2 3p3"],
  [16, "S", "Sulfur", 32.06, 2.58, 103, 10.36, 2.077, "s", 388.36, 717.75, 2.067, "nm", "[Ne]3s2 3p4"],
  [17, "Cl", "Chlorine", 35.45, 3.16, 99, 12.968, 3.617, "g", 171.65, 239.11, 0.003214, "hl", "[Ne]3s2 3p5"],
  [18, "Ar", "Argon", 39.95, null, 96, 15.76, null, "g", 83.8, 87.3, 0.0017837, "ng", "[Ne]3s2 3p6"],
  [19, "K", "Potassium", 39.098, 0.82, 196, 4.341, 0.501, "s", 336.53, 1032, 0.89, "am", "[Ar]4s1"],
  [20, "Ca", "Calcium", 40.078, 1, 171, 6.113, null, "s", 1115, 1757, 1.54, "ae", "[Ar]4s2"],
  [21, "Sc", "Scandium", 44.956, 1.36, 148, 6.561, 0.188, "s", 1814, 3109, 2.99, "tm", "[Ar]4s2 3d1"],
  [22, "Ti", "Titanium", 47.867, 1.54, 136, 6.828, 0.079, "s", 1941, 3560, 4.5, "tm", "[Ar]4s2 3d2"],
  [23, "V", "Vanadium", 50.942, 1.63, 134, 6.746, 0.525, "s", 2183, 3680, 6, "tm", "[Ar]4s2 3d3"],
  [24, "Cr", "Chromium", 51.996, 1.66, 122, 6.767, 0.666, "s", 2180, 2944, 7.15, "tm", "[Ar]3d5 4s1"],
  [25, "Mn", "Manganese", 54.938, 1.55, 119, 7.434, null, "s", 1519, 2334, 7.3, "tm", "[Ar]4s2 3d5"],
  [26, "Fe", "Iron", 55.845, 1.83, 116, 7.902, 0.163, "s", 1811, 3134, 7.874, "tm", "[Ar]4s2 3d6"],
  [27, "Co", "Cobalt", 58.933, 1.88, 111, 7.881, 0.661, "s", 1768, 3200, 8.86, "tm", "[Ar]4s2 3d7"],
  [28, "Ni", "Nickel", 58.693, 1.91, 110, 7.64, 1.156, "s", 1728, 3186, 8.912, "tm", "[Ar]4s2 3d8"],
  [29, "Cu", "Copper", 63.546, 1.9, 112, 7.726, 1.228, "s", 1357.77, 2835, 8.933, "tm", "[Ar]4s1 3d10"],
  [30, "Zn", "Zinc", 65.38, 1.65, 118, 9.394, null, "s", 692.68, 1180, 7.134, "tm", "[Ar]4s2 3d10"],
  [31, "Ga", "Gallium", 69.723, 1.81, 124, 5.999, 0.3, "s", 302.91, 2477, 5.91, "pt", "[Ar]4s2 3d10 4p1"],
  [32, "Ge", "Germanium", 72.63, 2.01, 121, 7.9, 1.35, "s", 1211.4, 3106, 5.323, "md", "[Ar]4s2 3d10 4p2"],
  [33, "As", "Arsenic", 74.922, 2.18, 121, 9.815, 0.81, "s", 1090, 887, 5.776, "md", "[Ar]4s2 3d10 4p3"],
  [34, "Se", "Selenium", 78.97, 2.55, 116, 9.752, 2.021, "s", 493.65, 958, 4.809, "nm", "[Ar]4s2 3d10 4p4"],
  [35, "Br", "Bromine", 79.904, 2.96, 114, 11.814, 3.365, "l", 265.95, 331.95, 3.11, "hl", "[Ar]4s2 3d10 4p5"],
  [36, "Kr", "Krypton", 83.798, 3, 117, 14, null, "g", 115.79, 119.93, 0.003733, "ng", "[Ar]4s2 3d10 4p6"],
  [37, "Rb", "Rubidium", 85.468, 0.82, 210, 4.177, 0.468, "s", 312.46, 961, 1.53, "am", "[Kr]5s1"],
  [38, "Sr", "Strontium", 87.62, 0.95, 185, 5.695, null, "s", 1050, 1655, 2.64, "ae", "[Kr]5s2"],
  [39, "Y", "Yttrium", 88.906, 1.22, 163, 6.217, 0.307, "s", 1795, 3618, 4.47, "tm", "[Kr]5s2 4d1"],
  [40, "Zr", "Zirconium", 91.224, 1.33, 154, 6.634, 0.426, "s", 2128, 4682, 6.52, "tm", "[Kr]5s2 4d2"],
  [41, "Nb", "Niobium", 92.906, 1.6, 147, 6.759, 0.893, "s", 2750, 5017, 8.57, "tm", "[Kr]5s1 4d4"],
  [42, "Mo", "Molybdenum", 95.95, 2.16, 138, 7.092, 0.746, "s", 2896, 4912, 10.2, "tm", "[Kr]5s1 4d5"],
  [43, "Tc", "Technetium", 96.90636, 1.9, 128, 7.28, 0.55, "s", 2430, 4538, 11, "tm", "[Kr]5s2 4d5"],
  [44, "Ru", "Ruthenium", 101.07, 2.2, 125, 7.361, 1.05, "s", 2607, 4423, 12.1, "tm", "[Kr]5s1 4d7"],
  [45, "Rh", "Rhodium", 102.91, 2.28, 125, 7.459, 1.137, "s", 2237, 3968, 12.4, "tm", "[Kr]5s1 4d8"],
  [46, "Pd", "Palladium", 106.42, 2.2, 120, 8.337, 0.557, "s", 1828.05, 3236, 12, "tm", "[Kr]4d10"],
  [47, "Ag", "Silver", 107.87, 1.93, 128, 7.576, 1.302, "s", 1234.93, 2435, 10.501, "tm", "[Kr]5s1 4d10"],
  [48, "Cd", "Cadmium", 112.41, 1.69, 136, 8.994, null, "s", 594.22, 1040, 8.69, "tm", "[Kr]5s2 4d10"],
  [49, "In", "Indium", 114.82, 1.78, 142, 5.786, 0.3, "s", 429.75, 2345, 7.31, "pt", "[Kr]5s2 4d10 5p1"],
  [50, "Sn", "Tin", 118.71, 1.96, 140, 7.344, 1.2, "s", 505.08, 2875, 7.287, "pt", "[Kr]5s2 4d10 5p2"],
  [51, "Sb", "Antimony", 121.76, 2.05, 140, 8.64, 1.07, "s", 903.78, 1860, 6.685, "md", "[Kr]5s2 4d10 5p3"],
  [52, "Te", "Tellurium", 127.6, 2.1, 136, 9.01, 1.971, "s", 722.66, 1261, 6.232, "md", "[Kr]5s2 4d10 5p4"],
  [53, "I", "Iodine", 126.9, 2.66, 133, 10.451, 3.059, "s", 386.85, 457.55, 4.93, "hl", "[Kr]5s2 4d10 5p5"],
  [54, "Xe", "Xenon", 131.29, 2.6, 131, 12.13, null, "g", 161.36, 165.03, 0.005887, "ng", "[Kr]5s2 4d10 5p6"],
  [55, "Cs", "Cesium", 132.91, 0.79, 232, 3.894, 0.472, "s", 301.59, 944, 1.93, "am", "[Xe]6s1"],
  [56, "Ba", "Barium", 137.33, 0.89, 196, 5.212, null, "s", 1000, 2170, 3.62, "ae", "[Xe]6s2"],
  [57, "La", "Lanthanum", 138.91, 1.1, 180, 5.577, 0.5, "s", 1191, 3737, 6.15, "ln", "[Xe]6s2 5d1"],
  [58, "Ce", "Cerium", 140.12, 1.12, 163, 5.539, 0.5, "s", 1071, 3697, 6.77, "ln", "[Xe]6s2 4f1 5d1"],
  [59, "Pr", "Praseodymium", 140.91, 1.13, 176, 5.464, null, "s", 1204, 3793, 6.77, "ln", "[Xe]6s2 4f3"],
  [60, "Nd", "Neodymium", 144.24, 1.14, 174, 5.525, null, "s", 1294, 3347, 7.01, "ln", "[Xe]6s2 4f4"],
  [61, "Pm", "Promethium", 144.91276, null, 173, 5.55, null, "s", 1315, 3273, 7.26, "ln", "[Xe]6s2 4f5"],
  [62, "Sm", "Samarium", 150.36, 1.17, 172, 5.644, null, "s", 1347, 2067, 7.52, "ln", "[Xe]6s2 4f6"],
  [63, "Eu", "Europium", 151.964, null, 168, 5.67, null, "s", 1095, 1802, 5.24, "ln", "[Xe]6s2 4f7"],
  [64, "Gd", "Gadolinium", 157.25, 1.2, 169, 6.15, null, "s", 1586, 3546, 7.9, "ln", "[Xe]6s2 4f7 5d1"],
  [65, "Tb", "Terbium", 158.93, null, 168, 5.864, null, "s", 1629, 3503, 8.23, "ln", "[Xe]6s2 4f9"],
  [66, "Dy", "Dysprosium", 162.5, 1.22, 167, 5.939, null, "s", 1685, 2840, 8.55, "ln", "[Xe]6s2 4f10"],
  [67, "Ho", "Holmium", 164.93, 1.23, 166, 6.022, null, "s", 1747, 2973, 8.8, "ln", "[Xe]6s2 4f11"],
  [68, "Er", "Erbium", 167.26, 1.24, 165, 6.108, null, "s", 1802, 3141, 9.07, "ln", "[Xe]6s2 4f12"],
  [69, "Tm", "Thulium", 168.93, 1.25, 164, 6.184, null, "s", 1818, 2223, 9.32, "ln", "[Xe]6s2 4f13"],
  [70, "Yb", "Ytterbium", 173.05, null, 170, 6.254, null, "s", 1092, 1469, 6.9, "ln", "[Xe]6s2 4f14"],
  [71, "Lu", "Lutetium", 174.97, 1.27, 162, 5.426, null, "s", 1936, 3675, 9.84, "ln", "[Xe]6s2 4f14 5d1"],
  [72, "Hf", "Hafnium", 178.49, 1.3, 152, 6.825, null, "s", 2506, 4876, 13.3, "tm", "[Xe]6s2 4f14 5d2"],
  [73, "Ta", "Tantalum", 180.95, 1.5, 146, 7.89, 0.322, "s", 3290, 5731, 16.4, "tm", "[Xe]6s2 4f14 5d3"],
  [74, "W", "Tungsten", 183.84, 2.36, 137, 7.98, 0.815, "s", 3695, 5828, 19.3, "tm", "[Xe]6s2 4f14 5d4"],
  [75, "Re", "Rhenium", 186.21, 1.9, 131, 7.88, 0.15, "s", 3459, 5869, 20.8, "tm", "[Xe]6s2 4f14 5d5"],
  [76, "Os", "Osmium", 190.23, 2.2, 129, 8.7, 1.1, "s", 3306, 5285, 22.57, "tm", "[Xe]6s2 4f14 5d6"],
  [77, "Ir", "Iridium", 192.22, 2.2, 122, 9.1, 1.565, "s", 2719, 4701, 22.42, "tm", "[Xe]6s2 4f14 5d7"],
  [78, "Pt", "Platinum", 195.08, 2.28, 123, 9, 2.128, "s", 2041.55, 4098, 21.46, "tm", "[Xe]6s1 4f14 5d9"],
  [79, "Au", "Gold", 196.97, 2.54, 124, 9.226, 2.309, "s", 1337.33, 3129, 19.282, "tm", "[Xe]6s1 4f14 5d10"],
  [80, "Hg", "Mercury", 200.59, 2, 133, 10.438, null, "l", 234.32, 629.88, 13.5336, "tm", "[Xe]6s2 4f14 5d10"],
  [81, "Tl", "Thallium", 204.38, 1.62, 144, 6.108, 0.2, "s", 577, 1746, 11.8, "pt", "[Xe]6s2 4f14 5d10 6p1"],
  [82, "Pb", "Lead", 207.2, 2.33, 144, 7.417, 0.36, "s", 600.61, 2022, 11.342, "pt", "[Xe]6s2 4f14 5d10 6p2"],
  [83, "Bi", "Bismuth", 208.98, 2.02, 151, 7.289, 0.946, "s", 544.55, 1837, 9.807, "pt", "[Xe]6s2 4f14 5d10 6p3"],
  [84, "Po", "Polonium", 208.98243, 2, 145, 8.417, 1.9, "s", 527, 1235, 9.32, "md", "[Xe]6s2 4f14 5d10 6p4"],
  [85, "At", "Astatine", 209.98715, 2.2, 147, 9.5, 2.8, "s", 575, null, 7, "hl", "[Xe]6s2 4f14 5d10 6p5"],
  [86, "Rn", "Radon", 222.01758, null, 142, 10.745, null, "g", 202, 211.45, 0.00973, "ng", "[Xe]6s2 4f14 5d10 6p6"],
  [87, "Fr", "Francium", 223.01973, 0.7, null, 3.9, 0.47, "s", 300, null, null, "am", "[Rn]7s1"],
  [88, "Ra", "Radium", 226.02541, 0.9, 201, 5.279, null, "s", 973, 1413, 5, "ae", "[Rn]7s2"],
  [89, "Ac", "Actinium", 227.02775, 1.1, 186, 5.17, null, "s", 1324, 3471, 10.07, "an", "[Rn]7s2 6d1"],
  [90, "Th", "Thorium", 232.04, 1.3, 175, 6.08, null, "s", 2023, 5061, 11.72, "an", "[Rn]7s2 6d2"],
  [91, "Pa", "Protactinium", 231.04, 1.5, 169, 5.89, null, "s", 1845, null, 15.37, "an", "[Rn]7s2 5f2 6d1"],
  [92, "U", "Uranium", 238.03, 1.38, 170, 6.194, null, "s", 1408, 4404, 18.95, "an", "[Rn]7s2 5f3 6d1"],
  [93, "Np", "Neptunium", 237.048172, 1.36, 171, 6.266, null, "s", 917, 4175, 20.25, "an", "[Rn]7s2 5f4 6d1"],
  [94, "Pu", "Plutonium", 244.0642, 1.28, 172, 6.06, null, "s", 913, 3501, 19.84, "an", "[Rn]7s2 5f6"],
  [95, "Am", "Americium", 243.06138, 1.3, 166, 5.993, null, "s", 1449, 2284, 13.69, "an", "[Rn]7s2 5f7"],
  [96, "Cm", "Curium", 247.07035, 1.3, 166, 6.02, null, "s", 1618, 3400, 13.51, "an", "[Rn]7s2 5f7 6d1"],
  [97, "Bk", "Berkelium", 247.07031, 1.3, null, 6.23, null, "s", 1323, null, 14, "an", "[Rn]7s2 5f9"],
  [98, "Cf", "Californium", 251.07959, 1.3, null, 6.3, null, "s", 1173, null, null, "an", "[Rn]7s2 5f10"],
  [99, "Es", "Einsteinium", 252.083, 1.3, null, 6.42, null, "s", 1133, null, null, "an", "[Rn]7s2 5f11"],
  [100, "Fm", "Fermium", 257.09511, 1.3, null, 6.5, null, "s", 1800, null, null, "an", "[Rn] 5f12 7s2"],
  [101, "Md", "Mendelevium", 258.09843, 1.3, null, 6.58, null, "s", 1100, null, null, "an", "[Rn]7s2 5f13"],
  [102, "No", "Nobelium", 259.101, 1.3, null, 6.65, null, "s", 1100, null, null, "an", "[Rn]7s2 5f14"],
  [103, "Lr", "Lawrencium", 266.12, 1.3, null, null, null, "s", 1900, null, null, "an", "[Rn]7s2 5f14 6d1"],
  [104, "Rf", "Rutherfordium", 267.122, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d2"],
  [105, "Db", "Dubnium", 268.126, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d3"],
  [106, "Sg", "Seaborgium", 269.128, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d4"],
  [107, "Bh", "Bohrium", 270.133, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d5"],
  [108, "Hs", "Hassium", 269.1336, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d6"],
  [109, "Mt", "Meitnerium", 277.154, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d7"],
  [110, "Ds", "Darmstadtium", 282.166, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d8", 1],
  [111, "Rg", "Roentgenium", 282.169, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d9", 1],
  [112, "Cn", "Copernicium", 286.179, null, null, null, null, "s", null, null, null, "tm", "[Rn]7s2 5f14 6d10", 1],
  [113, "Nh", "Nihonium", 286.182, null, null, null, null, "s", null, null, null, "pt", "[Rn]5f14 6d10 7s2 7p1", 1],
  [114, "Fl", "Flerovium", 290.192, null, null, null, null, "s", null, null, null, "pt", "[Rn]7s2 7p2 5f14 6d10", 1],
  [115, "Mc", "Moscovium", 290.196, null, null, null, null, "s", null, null, null, "pt", "[Rn]7s2 7p3 5f14 6d10", 1],
  [116, "Lv", "Livermorium", 293.205, null, null, null, null, "s", null, null, null, "pt", "[Rn]7s2 7p4 5f14 6d10", 1],
  [117, "Ts", "Tennessine", 294.211, null, null, null, null, "s", null, null, null, "hl", "[Rn]7s2 7p5 5f14 6d10", 1],
  [118, "Og", "Oganesson", 295.216, null, null, null, null, "g", null, null, null, "ng", "[Rn]7s2 7p6 5f14 6d10", 1],
];

export type Element = {
  z: number; sym: string; name: string; mass: number;
  /** Pauling electronegativity */
  en: number | null;
  /** covalent (single-bond) radius, pm */
  rCov: number | null;
  /** first ionisation energy, eV */
  ie: number | null;
  /** electron affinity, eV (null: the anion is not stable) */
  ea: number | null;
  state: "s" | "l" | "g";
  /** melting and boiling points, K */
  mp: number | null; bp: number | null;
  /** g/cm³ */
  density: number | null;
  cat: Category; config: string;
  /** state only predicted (made a few atoms at a time) */
  predicted: boolean;
  group: number | null; period: number;
  block: "s" | "p" | "d" | "f";
};

const PERIOD_END = [2, 10, 18, 36, 54, 86, 118];

/** Period, group (1–18, null for the f-block) and block from the atomic number. */
function place(z: number): Pick<Element, "group" | "period" | "block"> {
  const period = PERIOD_END.findIndex(e => z <= e) + 1;
  const start = period === 1 ? 1 : PERIOD_END[period - 2] + 1;
  const i = z - start;                                       // 0-based position in the period
  if (period === 1) return { period, group: z === 1 ? 1 : 18, block: "s" };
  if (period <= 3) return { period, group: i < 2 ? i + 1 : i + 11, block: i < 2 ? "s" : "p" };
  if (period <= 5) return { period, group: i + 1, block: i < 2 ? "s" : i < 12 ? "d" : "p" };
  // periods 6–7: 2 s, then La/Ac + 14 f (the f row shown under the table), then d and p
  if (i < 2) return { period, group: i + 1, block: "s" };
  if (i < 17) return { period, group: i === 2 ? 3 : null, block: i === 2 ? "d" : "f" };
  return { period, group: i - 13, block: i < 26 ? "d" : "p" };
}

export const ELEMENTS: Element[] = ROWS.map(([z, sym, name, mass, en, rCov, ie, ea, state, mp, bp, density, cat, config, predicted]) =>
  ({ z, sym, name, mass, en, rCov, ie, ea, state, mp, bp, density, cat, config, predicted: !!predicted, ...place(z) }));

export const BY_SYMBOL: Record<string, Element> = Object.fromEntries(ELEMENTS.map(e => [e.sym, e]));
export const el = (z: number) => ELEMENTS[z - 1];

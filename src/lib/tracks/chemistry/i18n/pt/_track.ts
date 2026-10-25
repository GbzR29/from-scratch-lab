// PT chapter titles and section names for the chemistry track (see chemistry/index.tsx).

const track = {
  titles: {
    "matter-measurement": "Matéria: substâncias, misturas e transformações",
    "atoms-isotopes": "Átomos, íons e isótopos",
    "the-mole": "O mol: contar átomos pesando",
    "periodic-trends": "A tabela periódica e suas tendências",
    "valence-ions": "Elétrons de valência, octeto e íons",
    "ionic-bonding": "Ligação iônica e energia de rede",
    "covalent-lewis": "Ligação covalente e estruturas de Lewis",
    "molecular-shape": "Geometria molecular: VSEPR e polaridade",
  } as Record<string, string>,
  sections: {
    "Matter & Atoms": "Matéria e átomos",
    "Bonding": "Ligações químicas",
  } as Record<string, string>,
};

export default track;

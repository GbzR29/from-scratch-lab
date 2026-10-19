// PT text for the rain-on-glass widget (figures/rain). Keys match the tx() calls there; English is the fallback in the code.

const text: Record<string, string> = {
  // ── RainGlassFigure (2026-10-19) ──
  figRainGlass_title: "Chuva numa janela",
  figRainGlass_view_window: "janela",
  figRainGlass_view_height: "altura da água",
  figRainGlass_view_mask: "máscara limpa",
  figRainGlass_rain: "chuva",
  figRainGlass_fog: "condensação",
  figRainGlass_lens: "força da lente",
  figRainGlass_blur: "desfoque (nível de mip)",
  figRainGlass_k: "embaçado volta, k",
  figRainGlass_pause: "pausar",
  figRainGlass_play: "tocar",
  figRainGlass_wipe: "limpar com o ponteiro",
  figRainGlass_refog: "embaçar tudo de novo",
  figRainGlass_vWindow: "Passe o ponteiro sobre o vidro (ou arraste um dedo) para limpar o embaçado com a mão; veja ele voltar devagar. Cada gota grande fica parada, depois escorrega um pouco, depois gruda de novo, deixando um rastro limpo e uma linha de gotinhas. Olhe dentro de uma gota grande: as luzes da rua lá dentro estão de cabeça para baixo, porque a gota é uma lente.",
  figRainGlass_vHeight: "A altura da água sobre o vidro, a única coisa de que as gotas são feitas. Claro é grosso; os riscos vermelhos são os rastros, que não têm altura mas limparam o embaçado. A iluminação, a lente e a limpeza saem todas deste único campo.",
  figRainGlass_vMask: "Onde o vidro está limpo: branco é nítido, preto é embaçado. Gotas, rastros e a sua limpeza escrevem nela; só a limpeza fica guardada de um quadro para o outro (numa textura que volta a embaçar), as gotas e os rastros são recalculados a cada quadro.",
  figRainGlass_note: "Nada aqui é simulado: cada gota é um hash da sua célula, como na neve, e a posição dela é uma função do tempo. A única memória é a limpeza, guardada numa texturinha que decai por e^(−k·dt) a cada quadro. O desfoque do vidro embaçado não custa nada: a cidade é desenhada uma vez numa textura com mipmaps, e as partes embaçadas simplesmente leem uma cópia menor e mais borrada.",
};

export default text;

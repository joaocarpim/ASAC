// src/navigation/contractionsData.ts

export interface Contraction {
  word: string; // A palavra ou grupo de letras
  dots: number[]; // Padrão Braille
  description: string; // Descrição do que representa
  type: "Palavra" | "Grupo"; // Tipo de contração
}

/**
 * Lista de contrações do Braille Grau 2 (Português Brasileiro)
 * Baseada nas contrações mais comuns usadas no Brasil
 */
export const CONTRACTION_LIST: Contraction[] = [
  // ========================================
  // CONTRAÇÕES DE PALAVRAS COMPLETAS
  // ========================================
  {
    word: "MAS",
    dots: [1, 3, 4],
    description: "Palavra 'mas' representada pela letra 'm'",
    type: "Palavra",
  },
  {
    word: "MAIS",
    dots: [1, 3, 4, 6],
    description: "Palavra 'mais' com sinal especial",
    type: "Palavra",
  },
  {
    word: "COM",
    dots: [1, 4],
    description: "Palavra 'com' representada pela letra 'c'",
    type: "Palavra",
  },
  {
    word: "DE",
    dots: [1, 4, 5],
    description: "Palavra 'de' representada pela letra 'd'",
    type: "Palavra",
  },
  {
    word: "E",
    dots: [1, 5],
    description: "Palavra 'e' (conjunção) representada pela letra 'e'",
    type: "Palavra",
  },
  {
    word: "PARA",
    dots: [1, 2, 3, 4],
    description: "Palavra 'para' representada pela letra 'p'",
    type: "Palavra",
  },
  {
    word: "POR",
    dots: [1, 2, 3, 4],
    description: "Palavra 'por' (mesma contração que 'para', contexto define)",
    type: "Palavra",
  },
  {
    word: "QUE",
    dots: [1, 2, 3, 4, 5],
    description: "Palavra 'que' representada pela letra 'q'",
    type: "Palavra",
  },
  {
    word: "SEM",
    dots: [2, 3, 4],
    description: "Palavra 'sem' representada pela letra 's'",
    type: "Palavra",
  },
  {
    word: "UM",
    dots: [1, 3, 6],
    description: "Palavra 'um' representada pela letra 'u'",
    type: "Palavra",
  },

  // ========================================
  // CONTRAÇÕES DE GRUPOS DE LETRAS (Dígrafos)
  // ========================================
  {
    word: "CH",
    dots: [1, 6],
    description: "Dígrafo 'ch' (como em 'chave')",
    type: "Grupo",
  },
  {
    word: "NH",
    dots: [1, 2, 4, 6],
    description: "Dígrafo 'nh' (como em 'ninho')",
    type: "Grupo",
  },
  {
    word: "LH",
    dots: [1, 2, 3, 6],
    description: "Dígrafo 'lh' (como em 'filho')",
    type: "Grupo",
  },
  {
    word: "RR",
    dots: [1, 2, 3, 5],
    description: "Dígrafo 'rr' (como em 'carro')",
    type: "Grupo",
  },
  {
    word: "SS",
    dots: [2, 3, 4],
    description: "Dígrafo 'ss' (como em 'passo')",
    type: "Grupo",
  },

  // ========================================
  // CONTRAÇÕES DE COMBINAÇÕES COMUNS
  // ========================================
  {
    word: "OU",
    dots: [1, 2, 5, 6],
    description: "Combinação 'ou' (como em 'outro')",
    type: "Grupo",
  },
  {
    word: "AN",
    dots: [3, 4, 5],
    description: "Combinação 'an' ou 'am' (como em 'antes', 'campo')",
    type: "Grupo",
  },
  {
    word: "EN",
    dots: [1, 5, 6],
    description: "Combinação 'en' ou 'em' (como em 'entre', 'tempo')",
    type: "Grupo",
  },
  {
    word: "IN",
    dots: [2, 4, 6],
    description: "Combinação 'in' ou 'im' (como em 'inverno', 'sim')",
    type: "Grupo",
  },
  {
    word: "ON",
    dots: [1, 3, 5, 6],
    description: "Combinação 'on' ou 'om' (como em 'onda', 'som')",
    type: "Grupo",
  },
  {
    word: "UN",
    dots: [1, 3, 6],
    description: "Combinação 'un' ou 'um' (como em 'mundo')",
    type: "Grupo",
  },

  // ========================================
  // SINAIS ESPECIAIS
  // ========================================
  {
    word: "ÃO",
    dots: [3, 4, 6],
    description: "Til 'ão' (como em 'pão', 'mão')",
    type: "Grupo",
  },
  {
    word: "ÕE",
    dots: [3, 4, 5, 6],
    description: "Til 'õe' (como em 'põe')",
    type: "Grupo",
  },
];

/**
 * Função auxiliar para buscar uma contração por palavra
 */
export function getContractionByWord(word: string): Contraction | undefined {
  return CONTRACTION_LIST.find(
    (c) => c.word.toUpperCase() === word.toUpperCase()
  );
}

/**
 * Função auxiliar para buscar contrações por tipo
 */
export function getContractionsByType(
  type: "Palavra" | "Grupo"
): Contraction[] {
  return CONTRACTION_LIST.filter((c) => c.type === type);
}

/**
 * Retorna o número total de contrações disponíveis
 */
export function getTotalContractions(): number {
  return CONTRACTION_LIST.length;
}

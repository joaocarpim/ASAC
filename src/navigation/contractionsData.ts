// src/navigation/contractionsData.ts

export interface Contraction {
  word: string; // A palavra completa
  dots: number[]; // Os pontos da cela
  description: string; // Explicação
  type: "Palavra" | "Grupo"; // Categoria
}

/**
 * Lista de Abreviaturas Braille (Grau 2) - Português Brasileiro
 * Focada nas abreviações alfabéticas mais comuns do dia a dia.
 */
export const CONTRACTION_LIST: Contraction[] = [
  // ========================================
  // PALAVRAS REPRESENTADAS POR UMA LETRA (ISOLADA)
  // ========================================
  {
    word: "NÃO",
    dots: [1, 3, 4, 5], // Letra n
    description: "A letra 'n' isolada representa a palavra 'não'.",
    type: "Palavra",
  },
  {
    word: "VOCÊ",
    dots: [1, 2, 3, 6], // Letra v
    description: "A letra 'v' isolada representa a palavra 'você'.",
    type: "Palavra",
  },
  {
    word: "QUE",
    dots: [1, 2, 3, 4, 5], // Letra q
    description: "A letra 'q' isolada representa a palavra 'que'.",
    type: "Palavra",
  },
  {
    word: "PARA",
    dots: [1, 2, 3, 4], // Letra p
    description: "A letra 'p' isolada representa a palavra 'para'.",
    type: "Palavra",
  },
  {
    word: "COM",
    dots: [1, 4], // Letra c
    description: "A letra 'c' isolada representa a palavra 'com'.",
    type: "Palavra",
  },
  {
    word: "DE",
    dots: [1, 4, 5], // Letra d
    description: "A letra 'd' isolada representa a palavra 'de'.",
    type: "Palavra",
  },
  {
    word: "HOJE",
    dots: [1, 2, 5], // Letra h
    description: "A letra 'h' isolada representa a palavra 'hoje'.",
    type: "Palavra",
  },
  {
    word: "TEM",
    dots: [2, 3, 4, 5], // Letra t
    description: "A letra 't' isolada representa a palavra 'tem'.",
    type: "Palavra",
  },
  {
    word: "SE",
    dots: [2, 3, 4], // Letra s
    description: "A letra 's' isolada representa a palavra 'se'.",
    type: "Palavra",
  },
  {
    word: "GENTE",
    dots: [1, 2, 4, 5], // Letra g
    description: "A letra 'g' isolada representa a palavra 'gente'.",
    type: "Palavra",
  },

  // ========================================
  // SINAIS E GRUPOS COMUNS 
  // ========================================
  {
    word: "ÃO",
    dots: [3, 4, 5], // Sinal de ão (til)
    description: "Sinal usado para o som 'ão' (como em mão, pão).",
    type: "Grupo",
  },
  {
    word: "ÇÃO",
    dots: [1, 2, 3, 4, 6], // ç
    description: "O 'ç' muitas vezes abrevia o sufixo 'ção'.",
    type: "Grupo",
  },
];

// Helpers de busca
export function getContractionByWord(word: string): Contraction | undefined {
  return CONTRACTION_LIST.find(
    (c) => c.word.toUpperCase() === word.toUpperCase()
  );
}

export function getContractionsByType(
  type: "Palavra" | "Grupo"
): Contraction[] {
  return CONTRACTION_LIST.filter((c) => c.type === type);
}

export function getTotalContractions(): number {
  return CONTRACTION_LIST.length;
}

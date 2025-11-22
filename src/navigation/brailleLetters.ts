// src/navigation/brailleLetters.ts

// O Alfabeto estava correto, apenas garanti a ordenação numérica dos arrays.
export const BRAILLE_ALPHABET: { [key: string]: number[] } = {
  A: [1],
  B: [1, 2],
  C: [1, 4],
  D: [1, 4, 5],
  E: [1, 5],
  F: [1, 2, 4],
  G: [1, 2, 4, 5],
  H: [1, 2, 5],
  I: [2, 4],
  J: [2, 4, 5],
  K: [1, 3],
  L: [1, 2, 3],
  M: [1, 3, 4],
  N: [1, 3, 4, 5],
  O: [1, 3, 5],
  P: [1, 2, 3, 4],
  Q: [1, 2, 3, 4, 5],
  R: [1, 2, 3, 5],
  S: [2, 3, 4],
  T: [2, 3, 4, 5],
  U: [1, 3, 6],
  V: [1, 2, 3, 6],
  W: [2, 4, 5, 6],
  X: [1, 3, 4, 6],
  Y: [1, 3, 4, 5, 6],
  Z: [1, 3, 5, 6],
};

// Os números seguem o padrão internacional (letras A-J deslocadas), correto.
export const BRAILLE_NUMBERS: { [key: string]: number[] } = {
  "#": [3, 4, 5, 6], // Sinal de número
  "1": [1],
  "2": [1, 2],
  "3": [1, 4],
  "4": [1, 4, 5],
  "5": [1, 5],
  "6": [1, 2, 4],
  "7": [1, 2, 4, 5],
  "8": [1, 2, 5],
  "9": [2, 4],
  "0": [2, 4, 5],
};

// CORREÇÕES PRINCIPAIS AQUI (Padrão Português)
export const BRAILLE_SYMBOLS: { [key: string]: number[] } = {
  ",": [2],
  ";": [2, 3],
  ".": [2, 5, 6], // Ponto final (na escrita literária)

  // CORRIGIDO: Era [2, 3, 6] (padrão inglês). Em PT é [2, 6].
  "?": [2, 6],

  "!": [2, 3, 5],

  // CORRIGIDO: Era [1, 2, 3, 5, 6]. Em PT é [1, 2, 6].
  "(": [1, 2, 6],

  // CORRIGIDO: Era [2, 3, 4, 5, 6]. Em PT é [3, 4, 5].
  ")": [3, 4, 5],
};

// Combina todos os caracteres para a tela de prática
export const ALL_BRAILLE_CHARS = {
  ...BRAILLE_ALPHABET,
  ...BRAILLE_NUMBERS,
  ...BRAILLE_SYMBOLS,
};

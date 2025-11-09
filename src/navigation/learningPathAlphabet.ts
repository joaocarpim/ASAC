// src/navigation/learningPathData.ts (Nomenclatura Atualizada)
import {
  BRAILLE_ALPHABET,
  BRAILLE_NUMBERS,
  BRAILLE_SYMBOLS,
} from "./brailleLetters";

export interface LearningSession {
  id: string;
  title: string;
  icon: any;
  description: string;
  characters: string[];
}

export const LEARNING_PATH_SESSIONS: LearningSession[] = [
  {
    id: "session-1",
    // ✅ NOVO NOME E DESCRIÇÃO
    title: "Base Alfabética (A-M)",
    icon: "alpha-a-box-outline",
    description:
      "A primeira etapa da sua jornada. Domine as letras de A a M e abra a porta para um novo mundo de leitura.",
    characters: Object.keys(BRAILLE_ALPHABET).slice(0, 13), // Letras A-M
  },
  {
    id: "session-2",
    // ✅ NOVO NOME E DESCRIÇÃO
    title: "Expandindo o Alfabeto (N-Z)",
    icon: "alpha-z-box-outline",
    description:
      "Hora de expandir seus horizontes. Complete o alfabeto de N a Z e torne-se fluente na linguagem dos pontos.",
    characters: Object.keys(BRAILLE_ALPHABET).slice(13), // Letras N-Z
  },
  {
    id: "session-3",
    // ✅ NOVO NOME E DESCRIÇÃO
    title: "Desafio Numérico",
    icon: "numeric",
    description:
      "O alfabeto foi só o aquecimento. Aceite o desafio de decifrar os números e adicione a matemática ao seu vocabulário tátil.",
    characters: Object.keys(BRAILLE_NUMBERS),
  },
  {
    id: "session-4",
    // ✅ NOVO NOME E DESCRIÇÃO
    title: "Mestres da Pontuação",
    icon: "format-quote-close-outline",
    description:
      "A etapa final para a fluência. Aprenda os sinais de pontuação e descubra como dar ritmo e emoção às suas frases.",
    characters: Object.keys(BRAILLE_SYMBOLS),
  },
];

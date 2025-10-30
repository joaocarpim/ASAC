// src/navigation/learningPathData.ts
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
    title: "Sessão dos Iniciantes",
    icon: "baby-carriage",
    description:
      "Aqui nascem os primeiros passos no mundo do Braille!\nDescubra as letras iniciais e aprenda a sentir o alfabeto com o toque.",
    characters: Object.keys(BRAILLE_ALPHABET).slice(0, 13), // Letras A-M
  },
  {
    id: "session-2",
    title: "Sessão dos Exploradores",
    icon: "compass-outline",
    description:
      "O explorador agora domina metade do caminho!\nEnfrente os novos desafios das últimas letras e torne-se um verdadeiro leitor do toque.",
    characters: Object.keys(BRAILLE_ALPHABET).slice(13), // Letras N-Z
  },
  {
    id: "session-3",
    title: "Sessão dos Guardiões",
    icon: "shield-key-outline",
    description:
      "Os guardiões do templo protegem os números sagrados.\nDomine o Braille numérico e desbloqueie o poder da contagem tátil!",
    characters: Object.keys(BRAILLE_NUMBERS),
  },
  {
    id: "session-4",
    title: "Sessão dos Mestres",
    icon: "crown-outline",
    description:
      "Apenas os verdadeiros Mestres do Braille chegam até aqui.\nDecifre sinais secretos e prove que domina a leitura do invisível.",
    characters: Object.keys(BRAILLE_SYMBOLS),
  },
];

// types/moduleQuestionTypes.ts
export interface ModuleQuiz {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  coinsPerCorrect: number;
  totalCoins: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // índice da resposta correta (0-based)
  explanation: string;
  order: number;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export const DEFAULT_MODULE_QUIZZES: ModuleQuiz[] = [
  {
    id: "quiz-module-1",
    moduleId: 1,
    title: "Questionário - Módulo 1: Introdução ao Sistema Braille",
    description:
      "Avalie seu conhecimento sobre as letras, números e acentos em Braille, bem como a localização dos pontos na célula Braille.",
    passingScore: 7,
    coinsPerCorrect: 15,
    totalCoins: 150,
    questions: [
      {
        id: "q1-1",
        question: "Na célula Braille, onde está localizado o ponto 2?",
        options: [
          "Linha superior, coluna direita",
          "Linha do meio, coluna esquerda",
          "Linha inferior, coluna direita",
          "Linha superior, coluna esquerda",
        ],
        correctAnswer: 1,
        explanation:
          "O ponto 2 está localizado na linha do meio, coluna esquerda da célula Braille.",
        order: 1,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q1-2",
        question: 'Qual a representação em Braille da letra "E"?',
        options: ["Pontos 1, 4", "Pontos 1, 5", "Pontos 2, 4", "Pontos 1, 2"],
        correctAnswer: 1,
        explanation:
          "A letra E é representada pelos pontos 1 e 5 na célula Braille.",
        order: 2,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q1-3",
        question: 'Qual a representação em Braille da letra "I"?',
        options: [
          "Pontos 1, 5",
          "Pontos 2, 4",
          "Pontos 1, 2, 4",
          "Pontos 1, 4, 5",
        ],
        correctAnswer: 1,
        explanation:
          "A letra I é representada pelos pontos 2 e 4 na célula Braille.",
        order: 3,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q1-4",
        question:
          "Para representar o número 5 em Braille, qual letra é utilizada após o sinal de número?",
        options: ["Letra A", "Letra E", "Letra I", "Letra O"],
        correctAnswer: 1,
        explanation:
          "O número 5 é representado pela letra E (quinta letra do alfabeto) após o sinal de número.",
        order: 4,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q1-5",
        question: "Qual a representação em Braille do sinal de número?",
        options: [
          "Pontos 1, 2, 3, 4",
          "Pontos 2, 3, 4, 5",
          "Pontos 3, 4, 5, 6",
          "Pontos 1, 3, 5, 6",
        ],
        correctAnswer: 2,
        explanation:
          "O sinal de número é representado pelos pontos 3, 4, 5 e 6 na célula Braille.",
        order: 5,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q1-6",
        question: "Qual a representação em Braille do acento agudo?",
        options: ["Ponto 2", "Ponto 4", "Ponto 5", "Ponto 6"],
        correctAnswer: 1,
        explanation:
          "O acento agudo é representado pelo ponto 4 na célula Braille.",
        order: 6,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q1-7",
        question: 'Como se escreve a sílaba "BA" em Braille?',
        options: [
          "Pontos 1, 2 (B) + Ponto 1 (A)",
          "Pontos 1, 4 (C) + Ponto 1 (A)",
          "Pontos 1, 2, 4 (F) + Ponto 1 (A)",
          "Pontos 1, 2, 5 (H) + Ponto 1 (A)",
        ],
        correctAnswer: 0,
        explanation:
          "BA = B(pontos 1,2) + A(ponto 1). Cada letra ocupa uma célula separada.",
        order: 7,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q1-8",
        question: 'Como se escreve a sílaba "ME" em Braille?',
        options: [
          "Pontos 1, 3, 4 (M) + Pontos 1, 5 (E)",
          "Pontos 1, 2, 3 (L) + Pontos 1, 5 (E)",
          "Pontos 1, 3, 5 (O) + Pontos 1, 5 (E)",
          "Pontos 1, 2, 3, 4 (P) + Pontos 1, 5 (E)",
        ],
        correctAnswer: 0,
        explanation:
          "ME = M(pontos 1,3,4) + E(pontos 1,5). A letra M é formada pelos pontos 1, 3 e 4.",
        order: 8,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q1-9",
        question: "Na célula Braille, onde está localizado o ponto 5?",
        options: [
          "Linha superior, coluna direita",
          "Linha do meio, coluna direita",
          "Linha inferior, coluna esquerda",
          "Linha do meio, coluna esquerda",
        ],
        correctAnswer: 1,
        explanation:
          "O ponto 5 está localizado na linha do meio, coluna direita da célula Braille.",
        order: 9,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q1-10",
        question: "Qual a representação em Braille do ponto final?",
        options: ["Ponto 2", "Pontos 2, 5", "Pontos 2, 5, 6", "Pontos 2, 3, 6"],
        correctAnswer: 2,
        explanation:
          "O ponto final é representado pelos pontos 2, 5 e 6 na célula Braille.",
        order: 10,
        difficulty: "easy",
        points: 15,
      },
    ],
  },
  {
    id: "quiz-module-2",
    moduleId: 2,
    title: "Questionário - Módulo 2: Formação de Palavras em Braille",
    description:
      "Avalie seu conhecimento sobre a formação de palavras em Braille.",
    passingScore: 7,
    coinsPerCorrect: 15,
    totalCoins: 150,
    questions: [
      {
        id: "q2-1",
        question: 'Como se escreve a palavra "CASA" em Braille?',
        options: [
          "C (1,4) A (1) S (2,3,4) A (1)",
          "C (1,4) A (1) S (2,3,4) O (1,3,5)",
          "C (1,4) A (1) Z (1,3,5,6) A (1)",
          "C (1,4) O (1,3,5) S (2,3,4) A (1)",
        ],
        correctAnswer: 0,
        explanation:
          "CASA = C(pontos 1,4) + A(ponto 1) + S(pontos 2,3,4) + A(ponto 1).",
        order: 1,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q2-2",
        question:
          "Qual palavra é formada pela sequência de Braille: L (1,2,3) I (2,4) V (1,2,3,6) R (1,2,3,5) O (1,3,5)?",
        options: ["LOBO", "LIVRO", "LUZ", "LAGO"],
        correctAnswer: 1,
        explanation:
          "A sequência L(1,2,3) + I(2,4) + V(1,2,3,6) + R(1,2,3,5) + O(1,3,5) forma a palavra LIVRO.",
        order: 2,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-3",
        question: 'Como se escreve a palavra "GATO" em Braille?',
        options: [
          "G (1,2,4,5) A (1) T (2,3,4,5) O (1,3,5)",
          "G (1,2,4,5) E (1,5) T (2,3,4,5) O (1,3,5)",
          "G (1,2,4,5) A (1) D (1,4,5) O (1,3,5)",
          "G (1,2,4,5) A (1) P (1,2,3,4) O (1,3,5)",
        ],
        correctAnswer: 0,
        explanation:
          "GATO = G(pontos 1,2,4,5) + A(ponto 1) + T(pontos 2,3,4,5) + O(pontos 1,3,5).",
        order: 3,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q2-4",
        question:
          "Qual palavra é formada pela sequência de Braille: S (2,3,4) O (1,3,5) L (1,2,3)?",
        options: ["SAL", "SOL", "SUL", "SAO"],
        correctAnswer: 1,
        explanation:
          "A sequência S(2,3,4) + O(1,3,5) + L(1,2,3) forma a palavra SOL.",
        order: 4,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q2-5",
        question: 'Como se escreve a palavra "PÃO" em Braille?',
        options: [
          "P (1,2,3,4) A (1) O (1,3,5)",
          "P (1,2,3,4) A (1) Til (3,4) O (1,3,5)",
          "P (1,2,3,4) O (1,3,5) A (1)",
          "P (1,2,3,4) A (1) Cedilha (3,6) O (1,3,5)",
        ],
        correctAnswer: 1,
        explanation:
          "PÃO = P(pontos 1,2,3,4) + A(ponto 1) + Til(pontos 3,4) + O(pontos 1,3,5). O til é necessário para o acento til do Ã.",
        order: 5,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-6",
        question:
          "Qual palavra é formada pela sequência de Braille: M (1,3,4) A (1) R (1,2,3,5)?",
        options: ["MAO", "MAR", "MEU", "MAIS"],
        correctAnswer: 1,
        explanation:
          "A sequência M(1,3,4) + A(1) + R(1,2,3,5) forma a palavra MAR.",
        order: 6,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q2-7",
        question:
          'Como se escreve a sequência de palavras "EU GOSTO" em Braille?',
        options: [
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) O (1,3,5)",
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) U (1,3,6)",
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) A (1)",
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) I (2,4)",
        ],
        correctAnswer: 0,
        explanation:
          "EU GOSTO = E(1,5) U(1,3,6) [espaço] G(1,2,4,5) O(1,3,5) S(2,3,4) T(2,3,4,5) O(1,3,5).",
        order: 7,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-8",
        question:
          "Qual a palavra formada pela sequência de letras Braille: D (1,4,5) A (1) D (1,4,5) O (1,3,5)?",
        options: ["DADO", "DIA", "DEPOIS", "DOCE"],
        correctAnswer: 0,
        explanation:
          "A sequência D(1,4,5) + A(1) + D(1,4,5) + O(1,3,5) forma a palavra DADO.",
        order: 8,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q2-9",
        question:
          'Como se escreve a sequência de palavras "BOLA AZUL" em Braille?',
        options: [
          "B (1,2) O (1,3,5) L (1,2,3) A (1) A (1) Z (1,3,5,6) U (1,3,6) L (1,2,3)",
          "B (1,2) O (1,3,5) L (1,2,3) A (1) A (1) S (2,3,4) U (1,3,6) L (1,2,3)",
          "B (1,2) O (1,3,5) L (1,2,3) A (1) A (1) V (1,2,3,6) U (1,3,6) L (1,2,3)",
          "B (1,2) O (1,3,5) L (1,2,3) A (1) A (1) C (1,4) U (1,3,6) L (1,2,3)",
        ],
        correctAnswer: 0,
        explanation:
          "BOLA AZUL = B(1,2) O(1,3,5) L(1,2,3) A(1) [espaço] A(1) Z(1,3,5,6) U(1,3,6) L(1,2,3).",
        order: 9,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-10",
        question:
          "Qual a palavra formada pela sequência de letras Braille: C (1,4) A (1) B (1,2) O (1,3,5)?",
        options: ["CABO", "CAIXA", "CARRO", "CASA"],
        correctAnswer: 0,
        explanation:
          "A sequência C(1,4) + A(1) + B(1,2) + O(1,3,5) forma a palavra CABO.",
        order: 10,
        difficulty: "medium",
        points: 15,
      },
    ],
  },
  {
    id: "quiz-module-3",
    moduleId: 3,
    title: "Questionário - Módulo 3: Formação de Frases Simples em Braille",
    description:
      "Avalie seu conhecimento sobre a formação de frases simples em Braille.",
    passingScore: 7,
    coinsPerCorrect: 15,
    totalCoins: 150,
    questions: [
      {
        id: "q3-1",
        question:
          'Como se escreve a frase "O sol brilha." em Braille, considerando as letras, espaços e o ponto final?',
        options: [
          "O (1,3,5) espaço S (2,3,4) O (1,3,5) L (1,2,3) espaço B (1,2) R (1,2,3,5) I (2,4) L (1,2,3) H (1,2,5) A (1) . (2,5,6)",
          "O (1,3,5) espaço S (2,3,4) O (1,3,5) L (1,2,3) espaço B (1,2) R (1,2,3,5) I (2,4) L (1,2,3) H (1,2,5) A (1)",
          "O (1,3,5) espaço S (2,3,4) O (1,3,5) L (1,2,3) espaço B (1,2) R (1,2,3,5) I (2,4) L (1,2,3) H (1,2,5) A (1) ! (2,3,5,6)",
          "O (1,3,5) espaço S (2,3,4) O (1,3,5) L (1,2,3) espaço B (1,2) R (1,2,3,5) I (2,4) L (1,2,3) H (1,2,5) A (1) ? (2,6)",
        ],
        correctAnswer: 0,
        explanation:
          "A frase completa deve incluir todas as letras, espaços entre palavras e terminar com ponto final (pontos 2,5,6).",
        order: 1,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q3-2",
        question: "Como o espaço entre as palavras é representado em Braille?",
        options: [
          "Com o ponto 1",
          "Com uma célula vazia (sem pontos)",
          "Com os pontos 1, 2, 3",
          "Com os pontos 4, 5, 6",
        ],
        correctAnswer: 1,
        explanation:
          "O espaço entre palavras é representado por uma célula completamente vazia, sem nenhum ponto em relevo.",
        order: 2,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q3-3",
        question:
          'Na frase "O gato pula.", qual a sequência correta para a palavra "gato" em Braille?',
        options: [
          "G (1,2,4,5) A (1) T (2,3,4,5) O (1,3,5)",
          "G (1,2,4,5) E (1,5) T (2,3,4,5) O (1,3,5)",
          "G (1,2,4,5) A (1) D (1,4,5) O (1,3,5)",
          "G (1,2,4,5) A (1) P (1,2,3,4) O (1,3,5)",
        ],
        correctAnswer: 0,
        explanation:
          "GATO = G(pontos 1,2,4,5) + A(ponto 1) + T(pontos 2,3,4,5) + O(pontos 1,3,5).",
        order: 3,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q3-4",
        question: "Qual a representação em Braille do ponto final?",
        options: [
          "Pontos 2, 5, 6",
          "Ponto 2",
          "Pontos 2, 3, 6",
          "Pontos 2, 3, 5",
        ],
        correctAnswer: 0,
        explanation:
          "O ponto final é representado pelos pontos 2, 5 e 6 na célula Braille.",
        order: 4,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q3-5",
        question:
          'Como se escreve a frase "Eu gosto de suco." em Braille, considerando apenas as letras e espaços?',
        options: [
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) O (1,3,5) D (1,4,5) E (1,5) S (2,3,4) U (1,3,6) C (1,4) O (1,3,5) . (2,5,6)",
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) O (1,3,5) D (1,4,5) E (1,5) S (2,3,4) U (1,3,6) C (1,4) O (1,3,5)",
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) O (1,3,5) D (1,4,5) E (1,5) S (2,3,4) U (1,3,6) C (1,4) O (1,3,5) ! (2,3,5,6)",
          "E (1,5) U (1,3,6) G (1,2,4,5) O (1,3,5) S (2,3,4) T (2,3,4,5) O (1,3,5) D (1,4,5) E (1,5) S (2,3,4) U (1,3,6) C (1,4) O (1,3,5) ? (2,6)",
        ],
        correctAnswer: 0,
        explanation:
          "A frase completa deve incluir espaços entre as palavras e terminar com ponto final (pontos 2,5,6).",
        order: 5,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q3-6",
        question:
          "Qual frase é formada pela sequência de Braille: O (1,3,5) espaço G (1,2,4,5) A (1) T (2,3,4,5) O (1,3,5) espaço P (1,2,3,4) U (1,3,6) L (1,2,3) A (1) . (2,5,6)?",
        options: [
          "O gato come.",
          "O gato pula.",
          "O pato nada.",
          "O rato corre.",
        ],
        correctAnswer: 1,
        explanation:
          "A sequência representa: O + [espaço] + GATO + [espaço] + PULA + [ponto final] = 'O gato pula.'",
        order: 6,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q3-7",
        question:
          'Como se escreve a frase "A bola caiu." em Braille, considerando apenas as letras e espaços?',
        options: [
          "A (1) B (1,2) O (1,3,5) L (1,2,3) A (1) C (1,4) A (1) I (2,4) U (1,3,6) . (2,5,6)",
          "A (1) B (1,2) O (1,3,5) L (1,2,3) A (1) C (1,4) A (1) I (2,4) U (1,3,6)",
          "A (1) B (1,2) O (1,3,5) L (1,2,3) A (1) C (1,4) A (1) I (2,4) U (1,3,6) ! (2,3,5,6)",
          "A (1) B (1,2) O (1,3,5) L (1,2,3) A (1) C (1,4) A (1) I (2,4) U (1,3,6) ? (2,6)",
        ],
        correctAnswer: 0,
        explanation:
          "A frase deve incluir espaços entre as palavras A, BOLA e CAIU, terminando com ponto final (pontos 2,5,6).",
        order: 7,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q3-8",
        question:
          "Qual frase é formada pela sequência de Braille: M (1,3,4) A (1) E (1,5) espaço F (1,2,4) A (1) Z (1,3,5,6) espaço A (1) R (1,2,3,5) R (1,2,3,5) O (1,3,5) Z (1,3,5,6) . (2,5,6)?",
        options: [
          "Mãe faz bolo.",
          "Mãe faz arroz.",
          "Mãe come pão.",
          "Mãe gosta de suco.",
        ],
        correctAnswer: 1,
        explanation:
          "A sequência representa: MAE + [espaço] + FAZ + [espaço] + ARROZ + [ponto final] = 'Mãe faz arroz.'",
        order: 8,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q3-9",
        question:
          'Ao escrever a frase "O aluno estuda.", qual sinal de pontuação deve ser usado no final?',
        options: [
          "Vírgula (Ponto 2)",
          "Ponto de interrogação (Pontos 2, 6)",
          "Ponto final (Pontos 2, 5, 6)",
          "Ponto de exclamação (Pontos 2, 3, 5, 6)",
        ],
        correctAnswer: 2,
        explanation:
          "Uma frase afirmativa deve terminar com ponto final, representado pelos pontos 2, 5 e 6.",
        order: 9,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q3-10",
        question: "Qual a representação em Braille do ponto de interrogação?",
        options: ["Pontos 2, 5, 6", "Ponto 2", "Pontos 2, 3, 6", "Pontos 2, 6"],
        correctAnswer: 3,
        explanation:
          "O ponto de interrogação é representado pelos pontos 2 e 6 na célula Braille.",
        order: 10,
        difficulty: "medium",
        points: 15,
      },
    ],
  },
];

// Função utilitária para buscar quiz por módulo
export const getQuizByModuleId = (moduleId: number): ModuleQuiz | undefined => {
  return DEFAULT_MODULE_QUIZZES.find((quiz) => quiz.moduleId === moduleId);
};

// Função utilitária para calcular pontuação total de um quiz
export const calculateQuizTotalPoints = (quiz: ModuleQuiz): number => {
  return quiz.questions.reduce((total, question) => total + question.points, 0);
};

// Função utilitária para verificar se passou no quiz
export const checkQuizPassed = (
  correctAnswers: number,
  quiz: ModuleQuiz
): boolean => {
  return correctAnswers >= quiz.passingScore;
};

// Função utilitária para calcular moedas ganhas
export const calculateCoinsEarned = (
  correctAnswers: number,
  quiz: ModuleQuiz
): number => {
  return correctAnswers * quiz.coinsPerCorrect;
};

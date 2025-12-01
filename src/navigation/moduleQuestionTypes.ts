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
    title: "Questionário - Módulo 1: Fundamentos do Braille",
    description:
      "Avalie seu conhecimento sobre a estrutura da célula Braille, as vogais, consoantes e a formação de suas primeiras palavras.",
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
        question: "Qual a representação em Braille da letra 'E'?",
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
        question: "Qual a representação em Braille da letra 'I'?",
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
        question: "Qual consoante é representada pelos pontos 1, 2, 3?",
        options: ["letra B", "letra C", "letra L", "letra S"],
        correctAnswer: 2,
        explanation:
          "A letra L é representada pelos pontos 1, 2 e 3, preenchendo toda a coluna da esquerda.",
        order: 4,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q1-5",
        question:
          "Na célula Braille, qual ponto está no canto inferior direito?",
        options: ["Ponto 3", "Ponto 4", "Ponto 5", "Ponto 6"],
        correctAnswer: 3,
        explanation:
          "O ponto 6 está localizado na linha inferior, na coluna da direita.",
        order: 5,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q1-6",
        question: "Quais pontos formam a vogal 'O'?",
        options: [
          "Pontos 1, 2, 3",
          "Pontos 1, 3, 6",
          "Pontos 1, 3, 5",
          "Pontos 2, 4, 5",
        ],
        correctAnswer: 2,
        explanation: "A vogal 'O' é representada pelos pontos 1, 3 e 5.",
        order: 6,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q1-7",
        question: 'Como se escreve a sílaba "BA" em Braille?',
        options: [
          "Pontos (1, 2) seguidos de (1)",
          "Pontos (1, 4) seguidos de (1)",
          "Pontos (1, 2, 4) seguidos de (1)",
          "Pontos (1, 2, 5) seguidos de (1)",
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
          "Pontos (1, 3, 4) seguidos de (1, 5)",
          "Pontos (1, 2, 3) seguidos de (1, 5)",
          "Pontos (1, 3, 5) seguidos de (1, 5)",
          "Pontos (1, 2, 3, 4) seguidos de (1, 5)",
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
        question:
          "Qual palavra é formada pela sequência de pontos: (1,4), (1), (2,3,4), (1)?",
        options: ["LALA", "CASA", "BOLA", "DADO"],
        correctAnswer: 1,
        explanation:
          "A sequência (1,4)=C, (1)=A, (2,3,4)=S, (1)=A forma a palavra CASA.",
        order: 10,
        difficulty: "medium",
        points: 15,
      },
    ],
  },
  {
    id: "quiz-module-2",
    moduleId: 2,
    title: "Questionário - Módulo 2: Formação de Palavras e Números",
    description:
      "Avalie seu conhecimento sobre a formação de palavras e números em Braille.",
    passingScore: 7,
    coinsPerCorrect: 15,
    totalCoins: 150,
    questions: [
      {
        id: "q2-1",
        question: 'Como se escreve a palavra "CASA" em Braille?',
        options: [
          "(1,4) (1) (2,3,4) (1)",
          "(1,4) (1) (2,3,4) (1,3,5)",
          "(1,4) (1) (1,3,5,6) (1)",
          "(1,4) (1,3,5) (2,3,4) (1)",
        ],
        correctAnswer: 0,
        explanation: "CASA = C(1,4) + A(1) + S(2,3,4) + A(1).",
        order: 1,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q2-2",
        question:
          "Qual palavra é formada pela sequência: (1,2,3) (2,4) (1,2,3,6) (1,2,3,5) (1,3,5)?",
        options: ["LOBO", "LIVRO", "LUZ", "LAGO"],
        correctAnswer: 1,
        explanation: "A sequência forma a palavra LIVRO.",
        order: 2,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-3",
        question: 'Como se escreve a palavra "GATO" em Braille?',
        options: [
          "(1,2,4,5) (1) (2,3,4,5) (1,3,5)",
          "(1,2,4,5) (1,5) (2,3,4,5) (1,3,5)",
          "(1,2,4,5) (1) (1,4,5) (1,3,5)",
          "(1,2,4,5) (1) (1,2,3,4) (1,3,5)",
        ],
        correctAnswer: 0,
        explanation: "GATO = G(1,2,4,5) + A(1) + T(2,3,4,5) + O(1,3,5).",
        order: 3,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q2-4",
        question:
          "Qual palavra é formada pela sequência: (2,3,4) (1,3,5) (1,2,3)?",
        options: ["SAL", "SOL", "SUL", "SAO"],
        correctAnswer: 1,
        explanation: "A sequência forma a palavra SOL.",
        order: 4,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q2-5",
        question: 'Como se escreve a palavra "PÃO" em Braille?',
        options: [
          "(1,2,3,4) (1) (1,3,5)",
          "(1,2,3,4) (1) (3,4,5) (1,3,5)",
          "(1,2,3,4) (1,3,5) (1)",
          "(1,2,3,4) (1,5) (1,3,5)",
        ],
        correctAnswer: 1,
        explanation:
          "PÃO = P(1,2,3,4) + Ã(representado por A(1) e o sinal de til(3,4,5)). A resposta correta reflete a combinação para Ã.",
        order: 5,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-6",
        question:
          "Qual palavra é formada pela sequência: (1,3,4) (1) (1,2,3,5)?",
        options: ["MAO", "MAR", "MEU", "MAIS"],
        correctAnswer: 1,
        explanation: "A sequência forma a palavra MAR.",
        order: 6,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q2-7",
        question: 'Como se escreve "EU GOSTO" em Braille?',
        options: [
          "(1,5)(1,3,6) [espaço] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1,3,5)",
          "(1,5)(1,3,6) [espaço] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1,3,6)",
          "(1,5)(1,3,6) [espaço] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1)",
          "(1,5)(1,3,6) [espaço] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(2,4)",
        ],
        correctAnswer: 0,
        explanation:
          "A sequência de células correta para 'EU GOSTO' é a primeira opção.",
        order: 7,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-8",
        question:
          "Qual palavra é formada pela sequência: (1,4,5) (1) (1,4,5) (1,3,5)?",
        options: ["DADO", "DIA", "DEPOIS", "DOCE"],
        correctAnswer: 0,
        explanation: "A sequência forma a palavra DADO.",
        order: 8,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q2-9",
        question: 'Como se escreve "BOLA AZUL" em Braille?',
        options: [
          "(1,2)(1,3,5)(1,2,3)(1) [espaço] (1)(1,3,5,6)(1,3,6)(1,2,3)",
          "(1,2)(1,3,5)(1,2,3)(1) [espaço] (1)(2,3,4)(1,3,6)(1,2,3)",
          "(1,2)(1,3,5)(1,2,3)(1) [espaço] (1)(1,2,3,6)(1,3,6)(1,2,3)",
          "(1,2)(1,3,5)(1,2,3)(1) [espaço] (1)(1,4)(1,3,6)(1,2,3)",
        ],
        correctAnswer: 0,
        explanation:
          "A sequência de células correta para 'BOLA AZUL' é a primeira opção.",
        order: 9,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q2-10",
        question:
          "Qual palavra é formada pela sequência: (1,4) (1) (1,2) (1,3,5)?",
        options: ["CABO", "CAIXA", "CARRO", "CASA"],
        correctAnswer: 0,
        explanation: "A sequência forma a palavra CABO.",
        order: 10,
        difficulty: "medium",
        points: 15,
      },
    ],
  },
  {
    id: "quiz-module-3",
    moduleId: 3,
    title: "Questionário - Módulo 3: Formação de Frases Simples",
    description:
      "Avalie seu conhecimento sobre a formação de frases simples em Braille.",
    passingScore: 7,
    coinsPerCorrect: 15,
    totalCoins: 150,
    questions: [
      {
        id: "q3-1",
        question: 'Como se escreve a frase "O sol brilha." em Braille?',
        options: [
          "(1,3,5) [espaço] (2,3,4)(1,3,5)(1,2,3) [espaço] (1,2)(1,2,3,5)(2,4)(1,2,3)(1,2,5)(1) (2,5,6)",
          "(1,3,5) [espaço] (2,3,4)(1,3,5)(1,2,3) [espaço] (1,2)(1,2,3,5)(2,4)(1,2,3)(1,2,5)(1)",
          "(1,3,5) [espaço] (2,3,4)(1,3,5)(1,2,3) [espaço] (1,2)(1,2,3,5)(2,4)(1,2,3)(1,2,5)(1) (2,3,5,6)",
          "(1,3,5) [espaço] (2,3,4)(1,3,5)(1,2,3) [espaço] (1,2)(1,2,3,5)(2,4)(1,2,3)(1,2,5)(1) (2,6)",
        ],
        correctAnswer: 0,
        explanation:
          "A frase completa deve incluir todas as letras, espaços entre palavras e terminar com ponto final (2,5,6).",
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
          'Na frase "O gato pula.", qual a sequência correta para a palavra "gato"?',
        options: [
          "(1,2,4,5) (1) (2,3,4,5) (1,3,5)",
          "(1,2,4,5) (1,5) (2,3,4,5) (1,3,5)",
          "(1,2,4,5) (1) (1,4,5) (1,3,5)",
          "(1,2,4,5) (1) (1,2,3,4) (1,3,5)",
        ],
        correctAnswer: 0,
        explanation: "GATO = G(1,2,4,5) + A(1) + T(2,3,4,5) + O(1,3,5).",
        order: 3,
        difficulty: "medium",
        points: 15,
      },
      {
        id: "q3-4",
        question: "Qual a representação em Braille do ponto final?",
        options: [
          "Pontos 3",
          "Ponto 2",
          "Pontos 2, 3, 6",
          "Pontos 2, 3, 5",
        ],
        correctAnswer: 0,
        explanation:
          "O ponto final é representado pelos pontos 3 na célula Braille.",
        order: 4,
        difficulty: "easy",
        points: 15,
      },
      {
        id: "q3-5",
        question: 'Como se escreve a frase "Eu gosto de suco." em Braille?',
        options: [
          "(1,5)(1,3,6) [espaço] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1,3,5) [espaço] (1,4,5)(1,5) [espaço] (2,3,4)(1,3,6)(1,4)(1,3,5) (2,5,6)",
          "(1,5)(1,3,6) (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1,3,5) (1,4,5)(1,5) (2,3,4)(1,3,6)(1,4)(1,3,5)",
          "(1,5)(1,3,6) [espaça] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1,3,5) [espaço] (1,4,5)(1,5) [espaço] (2,3,4)(1,3,6)(1,4)(1,3,5) (2,3,5,6)",
          "(1,5)(1,3,6) [espaço] (1,2,4,5)(1,3,5)(2,3,4)(2,3,4,5)(1,3,5) [espaço] (1,4,5)(1,5) [espaço] (2,3,4)(1,3,6)(1,4)(1,3,5) (2,6)",
        ],
        correctAnswer: 0,
        explanation:
          "A frase completa deve incluir espaços entre as palavras e terminar com ponto final (2,5,6).",
        order: 5,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q3-6",
        question:
          "Qual frase é formada pela sequência: (1,3,5) [espaço] (1,2,4,5)(1)(2,3,4,5)(1,3,5) [espaço] (1,2,3,4)(1,3,6)(1,2,3)(1) (2,5,6)?",
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
        question: 'Como se escreve a frase "A bola caiu." em Braille?',
        options: [
          "(1) [espaço] (1,2)(1,3,5)(1,2,3)(1) [espaço] (1,4)(1)(2,4)(1,3,6) (2,5,6)",
          "(1) (1,2)(1,3,5)(1,2,3)(1) (1,4)(1)(2,4)(1,3,6)",
          "(1) [espaço] (1,2)(1,3,5)(1,2,3)(1) [espaço] (1,4)(1)(2,4)(1,3,6) (2,3,5,6)",
          "(1) [espaço] (1,2)(1,3,5)(1,2,3)(1) [espaço] (1,4)(1)(2,4)(1,3,6) (2,6)",
        ],
        correctAnswer: 0,
        explanation:
          "A frase deve incluir espaços entre as palavras A, BOLA e CAIU, terminando com ponto final (2,5,6).",
        order: 7,
        difficulty: "hard",
        points: 15,
      },
      {
        id: "q3-8",
        question:
          "Qual frase é formada pela sequência: (1,3,4)(1)(1,5) [espaço] (1,2,4)(1)(1,3,5,6) [espaço] (1)(1,2,3,5)(1,2,3,5)(1,3,5)(1,3,5,6) (2,5,6)?",
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
        // ======================================================
        // ✅ CORREÇÃO (Bug 2): Remove o "cheat"
        // ======================================================
        options: [
          "Ponto 2",
          "Pontos 2, 6",
          "Pontos 3",
          "Pontos 2, 3, 5, 6", // Esta opção está tecnicamente errada (é 2,3,5), mas mantemos para consistência
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
        // ======================================================
        // ✅ CORREÇÃO (Bug 2): Opções já estavam limpas
        // ======================================================
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

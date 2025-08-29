// types/moduleTypes.ts
export interface ModuleContent {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  sections: ContentSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentSection {
  id: string;
  type: "text" | "image" | "audio" | "interactive";
  title?: string;
  content: string;
  order: number;
  metadata?: {
    audioUrl?: string;
    imageUrl?: string;
    braillePattern?: string;
  };
}

export interface Quiz {
  id: string;
  moduleId: number;
  questions: Question[];
  passingScore: number;
  coinsPerCorrect: number;
  totalPoints: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  order: number;
  difficulty: "easy" | "medium" | "hard";
}

// Dados iniciais como fallback
export const DEFAULT_MODULES: ModuleContent[] = [
  {
    id: "module-1",
    moduleId: 1,
    title: "Primeiros Passos no Braille: Da Célula à Palavra",
    description:
      "Bem-vindo(a) ao Mundo do Braille! Aprenda a base de tudo: a célula Braille, as vogais e suas primeiras palavras.",
    sections: [
      {
        id: "section-1-1",
        type: "text",
        title: "Bem-vindo(a) ao Mundo do Braille!",
        content:
          "Olá! Estamos muito felizes em ter você aqui. Este é o primeiro passo de uma jornada fascinante no sistema Braille. O Braille é uma ferramenta poderosa de comunicação e independência, criada para ser lida pelo tato.\n\nNeste primeiro módulo, nosso objetivo é claro: você não vai apenas decorar símbolos, mas sim entender a lógica por trás deles e, ao final, escrever suas primeiras palavras!\n\nVamos começar?",
        order: 1,
      },
      {
        id: "section-1-2",
        type: "text",
        title: "A Base de Tudo: A Célula Braille",
        content:
          "Tudo no sistema Braille começa com uma unidade simples chamada célula Braille. Imagine uma peça de dominó em pé, com espaço para 6 pontos. Esses pontos podem estar em relevo ou não, e cada combinação diferente forma uma letra, número ou símbolo.\n\nA numeração dos pontos é sempre a mesma:\n• Coluna da esquerda: pontos 1, 2, 3 (de cima para baixo)\n• Coluna da direita: pontos 4, 5, 6 (de cima para baixo)\n\nDica de Estudo: Passe o dedo sobre uma superfície e tente 'desenhar' a célula Braille, localizando mentalmente a posição de cada um dos seis pontos.",
        order: 2,
      },
      {
        id: "section-1-3",
        type: "text",
        title: "As Vogais: Os Sons Essenciais",
        content:
          "As vogais são a alma das palavras. No Braille, elas possuem combinações simples:\n\n• A: Ponto 1\n• E: Pontos 1, 5\n• I: Pontos 2, 4\n• O: Pontos 1, 3, 5\n• U: Pontos 1, 3, 6\n\nParabéns! Você acaba de aprender os 5 blocos de construção mais importantes do nosso idioma em Braille.",
        order: 3,
      },
      {
        id: "section-1-4",
        type: "text",
        title: "Primeiras Consoantes: Construindo Palavras",
        content:
          "Agora vamos adicionar algumas consoantes estratégicas:\n\n• C: Pontos 1, 4\n• L: Pontos 1, 2, 3\n• S: Pontos 2, 3, 4\n\nCom apenas estas 8 letras (A, E, I, O, U, C, L, S), você já está pronto(a) para o grande momento: escrever suas primeiras palavras.",
        order: 4,
      },
      {
        id: "section-1-5",
        type: "text",
        title: "Sua Primeira Palavra em Braille!",
        content:
          "Formar palavras em Braille é um processo sequencial. As letras são escritas uma após a outra, cada uma em sua própria célula.\n\nExemplo - CASA:\n• C: Pontos 1, 4\n• A: Ponto 1\n• S: Pontos 2, 3, 4\n• A: Ponto 1\n\nExemplo - SOL:\n• S: Pontos 2, 3, 4\n• O: Pontos 1, 3, 5\n• L: Pontos 1, 2, 3\n\nViu como é lógico? Cada célula representa uma letra e a combinação delas forma a palavra.",
        order: 5,
      },
    ],
  },
  {
    id: "module-2",
    moduleId: 2,
    title: "Expandindo Horizontes: Novas Letras e Números",
    description:
      "Expanda seu vocabulário com novas consoantes e descubra como o Braille representa números de forma inteligente.",
    sections: [
      {
        id: "section-2-1",
        type: "text",
        title: "Parabéns por avançar!",
        content:
          "Você concluiu o Módulo 1 com sucesso e já consegue escrever suas primeiras palavras. Isso é um grande feito! Agora, vamos expandir seu vocabulário e adicionar uma nova ferramenta poderosa ao seu conhecimento: os números.\n\nNeste módulo, você aprenderá novas consoantes para formar palavras mais ricas e descobrirá como o Braille representa valores numéricos de forma inteligente e simples.",
        order: 1,
      },
      {
        id: "section-2-2",
        type: "text",
        title: "Novas Consoantes para o seu Alfabeto",
        content:
          "Para formar mais palavras, precisamos de mais letras. Cada nova letra aprendida multiplica exponencialmente o número de palavras que você pode escrever.\n\n• B: Pontos 1, 2\n• G: Pontos 1, 2, 4, 5\n• P: Pontos 1, 2, 3, 4\n• T: Pontos 2, 3, 4, 5\n\nCom estas, você já conhece 12 letras do alfabeto! (A, E, I, O, U, C, L, S, B, G, P, T)",
        order: 2,
      },
      {
        id: "section-2-3",
        type: "text",
        title: "Formando Palavras Mais Complexas",
        content:
          "Agora, vamos combinar todo o seu conhecimento para formar palavras mais longas.\n\nExemplo - GATO:\n• G: Pontos 1, 2, 4, 5\n• A: Ponto 1\n• T: Pontos 2, 3, 4, 5\n• O: Pontos 1, 3, 5\n\nExemplo - SAPATO:\n• S: Pontos 2, 3, 4\n• A: Ponto 1\n• P: Pontos 1, 2, 3, 4\n• A: Ponto 1\n• T: Pontos 2, 3, 4, 5\n• O: Pontos 1, 3, 5",
        order: 3,
      },
      {
        id: "section-2-4",
        type: "text",
        title: "Introdução aos Números em Braille",
        content:
          "Representar números em Braille é muito engenhoso. Em vez de criar 10 novos símbolos, o sistema reutiliza as dez primeiras letras do alfabeto (de A até J).\n\nPara que o leitor saiba que não se trata de uma letra, mas sim de um número, usamos um símbolo especial:\n\n• Sinal de Número: Pontos 3, 4, 5, 6\n\nExemplos:\n• Número 1: Sinal de Número + Letra A\n• Número 2: Sinal de Número + Letra B\n• Número 3: Sinal de Número + Letra C",
        order: 4,
      },
      {
        id: "section-2-5",
        type: "text",
        title: "A Lógica dos Números Altos",
        content:
          "Para números com mais de um dígito, como 21 ou 13, a regra é simples:\n\nO Sinal de Número é usado apenas uma vez, antes do primeiro dígito. Os dígitos seguintes são representados por suas letras correspondentes.\n\nExemplo - Número 21:\n• Sinal de Número (Pontos 3, 4, 5, 6)\n• Letra B (para representar o 2)\n• Letra A (para representar o 1)\n\nExemplo - Número 13:\n• Sinal de Número (Pontos 3, 4, 5, 6)\n• Letra A (para representar o 1)\n• Letra C (para representar o 3)",
        order: 5,
      },
    ],
  },
  {
    id: "module-3",
    moduleId: 3,
    title: "Construindo Ideias: Da Palavra à Frase Completa",
    description:
      "Aprenda a usar espaços, maiúsculas e pontuação para criar suas primeiras frases completas em Braille.",
    sections: [
      {
        id: "section-3-1",
        type: "text",
        title: "Você chegou à etapa final!",
        content:
          "Seja muito bem-vindo(a) ao Módulo 3. Nos módulos anteriores, você aprendeu os blocos de construção essenciais: as letras, os números e como juntá-los para formar palavras. Agora, você aprenderá a usar a 'argamassa' que une esses blocos para construir ideias completas: as frases.\n\nNeste módulo, você dominará o uso de espaços, letras maiúsculas e os sinais de pontuação mais importantes. Este é o grande momento em que tudo se conecta!",
        order: 1,
      },
      {
        id: "section-3-2",
        type: "text",
        title: "O Espaço: Dando Ar às Palavras",
        content:
          "Até agora, escrevemos palavras isoladas. Para que uma frase seja legível, as palavras precisam ser claramente separadas umas das outras.\n\n• O Espaço: é representado por uma célula Braille vazia (sem nenhum ponto em relevo)\n\nExemplo: Para escrever 'GATO BOLO':\n• As quatro células para G-A-T-O\n• Uma célula inteira vazia\n• As quatro células para B-O-L-O",
        order: 2,
      },
      {
        id: "section-3-3",
        type: "text",
        title: "A Letra Maiúscula: O Início de Tudo",
        content:
          "As frases em Braille começam com uma letra maiúscula. Para isso, usa-se um sinal que modifica a letra seguinte:\n\n• Sinal de Maiúscula: Ponto 6\n\nPara tornar uma letra maiúscula, basta colocar o Sinal de Maiúscula (ponto 6) na célula imediatamente anterior a ela.\n\nExemplo - Letra 'P' maiúscula:\n• Primeira Célula: Sinal de Maiúscula (Ponto 6)\n• Segunda Célula: Letra P (Pontos 1, 2, 3, 4)",
        order: 3,
      },
      {
        id: "section-3-4",
        type: "text",
        title: "O Ponto Final: Concluindo uma Ideia",
        content:
          "Uma frase expressa um pensamento completo e, para sinalizar que esse pensamento terminou, usamos o ponto final.\n\n• Ponto Final: Pontos 2, 5, 6\n\nEste sinal é colocado no final da última palavra da frase, sem espaço entre eles, assim como na escrita em tinta.",
        order: 4,
      },
      {
        id: "section-3-5",
        type: "text",
        title: "Sua Primeira Frase Completa!",
        content:
          "Agora, vamos unir os três conceitos: Letra Maiúscula, Espaço e Ponto Final.\n\nExemplo - Frase 'Guga toca.':\n• G (maiúsculo): Sinal de Maiúscula + Letra G\n• uga: U + G + A\n• Espaço: Célula Vazia\n• toca: T + O + C + A\n• Ponto Final: Pontos 2, 5, 6\n\nParabéns! Você acabou de estruturar uma frase completa em Braille!",
        order: 5,
      },
      {
        id: "section-3-6",
        type: "text",
        title: "Expandindo a Pontuação: A Vírgula",
        content:
          "Para dar mais clareza e ritmo às frases, a vírgula é essencial. Ela indica uma pequena pausa.\n\n• Vírgula: Ponto 2\n\nExemplo de uso: Na frase 'Guga, o gato, toca.', a vírgula seria inserida após a palavra 'Guga' e após 'gato'.",
        order: 6,
      },
      {
        id: "section-3-7",
        type: "text",
        title: "Missão Cumprida!",
        content:
          "Você completou a base fundamental do aprendizado de Braille. Neste módulo, você:\n\n• Aprendeu a usar o espaço para separar palavras\n• Dominou o uso do sinal de maiúscula para iniciar frases\n• Utilizou o ponto final e a vírgula para dar sentido e ritmo ao texto\n• Combinou todo o seu conhecimento para escrever frases completas!\n\nCom a base dos Módulos 1, 2 e 3, você já tem as ferramentas para escrever e ler uma infinidade de textos simples.\n\nContinue praticando, pois a fluência vem com a dedicação. Você construiu uma base excelente. Parabéns pela conquista!",
        order: 7,
      },
    ],
  },
];

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    moduleId: 1,
    passingScore: 7,
    coinsPerCorrect: 15,
    totalPoints: 12250,
    questions: [
      {
        id: "q1-1",
        question: "Quantos pontos possui uma célula Braille?",
        options: ["4 pontos", "6 pontos", "8 pontos", "5 pontos"],
        correctAnswer: 1,
        explanation:
          "Uma célula Braille possui sempre 6 pontos, organizados em duas colunas de 3 pontos cada.",
        order: 1,
        difficulty: "easy",
      },
      {
        id: "q1-2",
        question: "Qual vogal é representada apenas pelo ponto 1?",
        options: ["E", "I", "A", "O"],
        correctAnswer: 2,
        explanation:
          "A letra A é representada apenas pelo ponto 1, sendo a mais simples das vogais.",
        order: 2,
        difficulty: "easy",
      },
      {
        id: "q1-3",
        question: "Quais pontos formam a letra L?",
        options: [
          "Pontos 1, 2",
          "Pontos 1, 2, 3",
          "Pontos 2, 3, 4",
          "Pontos 1, 4",
        ],
        correctAnswer: 1,
        explanation:
          "A letra L é formada pelos pontos 1, 2 e 3, ocupando toda a coluna da esquerda.",
        order: 3,
        difficulty: "medium",
      },
      {
        id: "q1-4",
        question: "Como se escreve a palavra 'SOL' em Braille?",
        options: [
          "S(2,3,4) + O(1,3,5) + L(1,2,3)",
          "S(1,2,3) + O(1,4) + L(2,3,4)",
          "S(1,4) + O(1,3,5) + L(1,2,3)",
          "S(2,3,4) + O(1,2,4) + L(1,3,5)",
        ],
        correctAnswer: 0,
        explanation:
          "SOL = S(pontos 2,3,4) + O(pontos 1,3,5) + L(pontos 1,2,3).",
        order: 4,
        difficulty: "medium",
      },
      {
        id: "q1-5",
        question: "Qual é a função principal da célula Braille?",
        options: [
          "Apenas representar números",
          "Ser a unidade básica para formar letras, números e símbolos",
          "Servir como separador entre palavras",
          "Representar apenas vogais",
        ],
        correctAnswer: 1,
        explanation:
          "A célula Braille é a unidade fundamental do sistema, permitindo formar letras, números e símbolos através das combinações de seus 6 pontos.",
        order: 5,
        difficulty: "easy",
      },
    ],
  },
  {
    id: "quiz-2",
    moduleId: 2,
    passingScore: 7,
    coinsPerCorrect: 15,
    totalPoints: 12250,
    questions: [
      {
        id: "q2-1",
        question: "Quais pontos formam a letra B?",
        options: ["Pontos 1, 2", "Pontos 1, 4", "Pontos 2, 3", "Pontos 1, 3"],
        correctAnswer: 0,
        explanation:
          "A letra B é formada pelos pontos 1 e 2, ocupando a parte superior da coluna esquerda.",
        order: 1,
        difficulty: "easy",
      },
      {
        id: "q2-2",
        question: "Como se representa o 'Sinal de Número' em Braille?",
        options: [
          "Pontos 3, 4, 5, 6",
          "Pontos 1, 2, 3, 4",
          "Pontos 2, 3, 4, 5",
          "Pontos 1, 3, 5, 6",
        ],
        correctAnswer: 0,
        explanation:
          "O Sinal de Número é representado pelos pontos 3, 4, 5 e 6, ocupando toda a parte inferior da célula.",
        order: 2,
        difficulty: "medium",
      },
      {
        id: "q2-3",
        question: "Para escrever o número 21, qual sequência está correta?",
        options: [
          "Sinal de Número + A + B",
          "Sinal de Número + B + A",
          "B + A + Sinal de Número",
          "Dois Sinais de Número + B + A",
        ],
        correctAnswer: 1,
        explanation:
          "Para escrever 21: Sinal de Número + B (representa 2) + A (representa 1). O sinal é usado apenas uma vez no início.",
        order: 3,
        difficulty: "medium",
      },
      {
        id: "q2-4",
        question: "Quantas letras do alfabeto você conhece após o Módulo 2?",
        options: ["8 letras", "10 letras", "12 letras", "15 letras"],
        correctAnswer: 2,
        explanation:
          "Após o Módulo 2, você conhece 12 letras: A, E, I, O, U, C, L, S (Módulo 1) + B, G, P, T (Módulo 2).",
        order: 4,
        difficulty: "easy",
      },
      {
        id: "q2-5",
        question: "Como se escreve a palavra 'GATO' em Braille?",
        options: [
          "G(1,2,4,5) + A(1) + T(2,3,4,5) + O(1,3,5)",
          "G(1,2,3) + A(1) + T(1,4) + O(1,3,5)",
          "G(1,4) + A(1) + T(2,3,4) + O(1,3,5)",
          "G(1,2,4,5) + A(1,5) + T(2,3,4,5) + O(1,2,5)",
        ],
        correctAnswer: 0,
        explanation:
          "GATO = G(pontos 1,2,4,5) + A(ponto 1) + T(pontos 2,3,4,5) + O(pontos 1,3,5).",
        order: 5,
        difficulty: "hard",
      },
    ],
  },
  {
    id: "quiz-3",
    moduleId: 3,
    passingScore: 7,
    coinsPerCorrect: 15,
    totalPoints: 12250,
    questions: [
      {
        id: "q3-1",
        question: "Como são separadas as palavras em Braille?",
        options: [
          "Com um espaço de uma célula em branco",
          "Com um ponto de exclamação especial",
          "Não há separação entre as palavras",
          "Com duas células em branco",
        ],
        correctAnswer: 0,
        explanation:
          "As palavras em Braille são separadas por um espaço de uma célula completamente vazia (sem pontos em relevo).",
        order: 1,
        difficulty: "easy",
      },
      {
        id: "q3-2",
        question: "Qual é o sinal usado para indicar letra maiúscula?",
        options: ["Ponto 6", "Pontos 1, 6", "Pontos 4, 5, 6", "Ponto 1"],
        correctAnswer: 0,
        explanation:
          "O Sinal de Maiúscula é representado apenas pelo ponto 6 e deve ser colocado imediatamente antes da letra.",
        order: 2,
        difficulty: "easy",
      },
      {
        id: "q3-3",
        question: "Como se representa o ponto final em Braille?",
        options: ["Ponto 6", "Pontos 2, 5, 6", "Pontos 1, 2, 3", "Ponto 2"],
        correctAnswer: 1,
        explanation:
          "O ponto final é representado pelos pontos 2, 5 e 6, colocado no final da frase sem espaço.",
        order: 3,
        difficulty: "medium",
      },
      {
        id: "q3-4",
        question: "Para escrever 'Casa.', qual é a sequência correta?",
        options: [
          "Maiúscula + C + A + S + A + Espaço + Ponto final",
          "Maiúscula + C + A + S + A + Ponto final",
          "C + A + S + A + Ponto final",
          "Maiúscula + C + A + S + A + Vírgula",
        ],
        correctAnswer: 1,
        explanation:
          "Para 'Casa.': Sinal de Maiúscula + C + A + S + A + Ponto final. Não há espaço antes da pontuação.",
        order: 4,
        difficulty: "medium",
      },
      {
        id: "q3-5",
        question: "Qual pontuação indica uma pequena pausa na frase?",
        options: [
          "Ponto final",
          "Vírgula",
          "Ponto de exclamação",
          "Dois pontos",
        ],
        correctAnswer: 1,
        explanation:
          "A vírgula (ponto 2) indica uma pequena pausa na frase e é essencial para dar clareza e ritmo ao texto.",
        order: 5,
        difficulty: "easy",
      },
    ],
  },
];

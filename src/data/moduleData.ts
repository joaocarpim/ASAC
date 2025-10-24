// src/store/moduleData.ts
// ========================
// Conteúdo completo dos módulos do ASAC - local e estático.
// Este arquivo substitui a dependência da API para exibir e usar módulos.
// Ele contém 3 módulos, cada um com 10 questões, de dificuldade crescente.

export interface Lesson {
  id: string;
  title: string;
  content: string;
  image?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  order: number;
}

export interface Module {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

// ==========================================================
// CONTEÚDO DOS MÓDULOS
// ==========================================================

export const modules: Module[] = [
  // ======================================================
  // MÓDULO 1 - Fundamentos do Sistema Braille
  // ======================================================
  {
    id: "1",
    moduleNumber: 1,
    title: "Fundamentos do Braille",
    description:
      "Aprenda as origens, estrutura e funcionamento do sistema Braille, base da alfabetização tátil.",
    lessons: [
      {
        id: "L1.1",
        title: "O que é o Braille?",
        content:
          "O sistema Braille é um método de leitura e escrita tátil inventado por Louis Braille no século XIX. Ele utiliza combinações de até seis pontos em relevo dispostos em uma célula retangular.",
      },
      {
        id: "L1.2",
        title: "Como funciona uma célula Braille",
        content:
          "Cada célula Braille possui seis pontos numerados de 1 a 6. A presença ou ausência desses pontos forma letras, números e símbolos.",
      },
      {
        id: "L1.3",
        title: "História e importância",
        content:
          "O Braille foi criado para permitir que pessoas cegas tivessem acesso à leitura e escrita. Ele promove inclusão e autonomia na comunicação.",
      },
    ],
    quiz: [
      {
        id: "Q1.1",
        question: "Quem criou o sistema Braille?",
        options: ["Louis Braille", "Isaac Newton", "Albert Einstein", "Helen Keller"],
        correctAnswer: 0,
        explanation: "Louis Braille criou o sistema Braille aos 15 anos de idade.",
        order: 1,
      },
      {
        id: "Q1.2",
        question: "Em que século o Braille foi criado?",
        options: ["XV", "XVI", "XVII", "XIX"],
        correctAnswer: 3,
        explanation: "O Braille foi criado no século XIX.",
        order: 2,
      },
      {
        id: "Q1.3",
        question: "Quantos pontos compõem uma célula Braille?",
        options: ["4", "6", "8", "10"],
        correctAnswer: 1,
        explanation: "Uma célula Braille é composta por 6 pontos.",
        order: 3,
      },
      {
        id: "Q1.4",
        question: "O Braille é lido por meio de qual sentido?",
        options: ["Visão", "Audição", "Tato", "Olfato"],
        correctAnswer: 2,
        explanation: "A leitura em Braille é feita com o tato.",
        order: 4,
      },
      {
        id: "Q1.5",
        question: "Qual o principal objetivo do Braille?",
        options: [
          "Enfeitar produtos",
          "Permitir leitura e escrita para pessoas cegas",
          "Ajudar pessoas surdas",
          "Ensinar linguagem de sinais",
        ],
        correctAnswer: 1,
        explanation: "O Braille é um sistema de leitura e escrita tátil para cegos.",
        order: 5,
      },
      {
        id: "Q1.6",
        question: "Quantas colunas há em uma célula Braille?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Cada célula Braille possui duas colunas de pontos.",
        order: 6,
      },
      {
        id: "Q1.7",
        question: "Quem pode usar o Braille?",
        options: [
          "Apenas cegos",
          "Pessoas com deficiência visual total ou parcial",
          "Somente professores",
          "Somente crianças",
        ],
        correctAnswer: 1,
        explanation: "O Braille é utilizado por qualquer pessoa com deficiência visual.",
        order: 7,
      },
      {
        id: "Q1.8",
        question: "Qual o país de origem do criador do Braille?",
        options: ["França", "Inglaterra", "Alemanha", "EUA"],
        correctAnswer: 0,
        explanation: "Louis Braille era francês.",
        order: 8,
      },
      {
        id: "Q1.9",
        question: "Quantas combinações diferentes uma célula Braille pode formar?",
        options: ["64", "32", "48", "100"],
        correctAnswer: 0,
        explanation:
          "Com 6 pontos, uma célula Braille pode formar até 64 combinações possíveis.",
        order: 9,
      },
      {
        id: "Q1.10",
        question: "Qual desses materiais NÃO é usado para Braille?",
        options: ["Reglete", "Punção", "Lápis comum", "Máquina Perkins"],
        correctAnswer: 2,
        explanation:
          "O Braille é feito em relevo; lápis comum não cria pontos táteis.",
        order: 10,
      },
    ],
  },

  // ======================================================
  // MÓDULO 2 - Leitura e Escrita em Braille
  // ======================================================
  {
    id: "2",
    moduleNumber: 2,
    title: "Leitura e Escrita em Braille",
    description:
      "Aprofunde-se nas técnicas de leitura e escrita, aprendendo a reconhecer e formar palavras em Braille.",
    lessons: [
      {
        id: "L2.1",
        title: "Técnicas de leitura tátil",
        content:
          "A leitura tátil requer prática para aumentar a sensibilidade dos dedos indicadores. É importante posicionar as mãos de forma confortável.",
      },
      {
        id: "L2.2",
        title: "Escrita Braille",
        content:
          "A escrita é feita com uma reglete e um punção, ou através de máquinas Braille como a Perkins.",
      },
      {
        id: "L2.3",
        title: "Letras e números",
        content:
          "As letras A a J formam a base. Acrescentando o ponto 3, formam as letras K a T. Acrescentando o ponto 6, formam U a Z.",
      },
    ],
    quiz: Array.from({ length: 10 }, (_, i) => {
      const questions = [
        {
          question: "Qual o principal sentido usado na leitura Braille?",
          options: ["Visão", "Tato", "Audição", "Paladar"],
          correctAnswer: 1,
          explanation: "A leitura é feita pelo tato.",
        },
        {
          question: "Qual ferramenta é usada para escrever Braille manualmente?",
          options: ["Caneta", "Reglete e Punção", "Teclado", "Pincel"],
          correctAnswer: 1,
          explanation: "A reglete e o punção são usados para marcar os pontos.",
        },
        {
          question: "Como são formadas as letras de K a T?",
          options: [
            "Adicionando ponto 1",
            "Adicionando ponto 3 às letras A a J",
            "Usando pontos 4 e 5",
            "Com ponto 6 isolado",
          ],
          correctAnswer: 1,
          explanation: "As letras K a T são formadas adicionando o ponto 3.",
        },
        {
          question: "Qual número é representado pela letra 'A' em Braille com o símbolo numérico?",
          options: ["1", "2", "3", "4"],
          correctAnswer: 0,
          explanation: "O número 1 corresponde à letra A precedida do símbolo numérico.",
        },
        {
          question: "Como é feito o treino para leitura Braille?",
          options: [
            "Com os olhos vendados",
            "Com prática tátil constante",
            "Com lupa",
            "Apenas com áudios",
          ],
          correctAnswer: 1,
          explanation: "A prática tátil constante melhora a sensibilidade dos dedos.",
        },
        {
          question: "Qual mão geralmente inicia a leitura Braille?",
          options: ["Esquerda", "Direita", "Ambas", "Nenhuma"],
          correctAnswer: 2,
          explanation:
            "A leitura usa ambas as mãos: uma lê enquanto a outra se posiciona na próxima linha.",
        },
        {
          question: "O que é uma máquina Perkins?",
          options: [
            "Uma impressora 3D",
            "Uma máquina de escrever Braille",
            "Um leitor de tela",
            "Um computador adaptado",
          ],
          correctAnswer: 1,
          explanation: "A Perkins é uma máquina de escrever em Braille.",
        },
        {
          question: "Como são diferenciados números em Braille?",
          options: [
            "Pelo tamanho dos pontos",
            "Por um símbolo numérico antes das letras",
            "Por letras maiúsculas",
            "Por sinais de pontuação",
          ],
          correctAnswer: 1,
          explanation: "Os números são indicados por um símbolo especial antes das letras A–J.",
        },
        {
          question: "Qual é a principal dificuldade ao aprender Braille?",
          options: [
            "Reconhecer os sons",
            "Memorizar padrões de pontos",
            "Usar o teclado",
            "Aprender a desenhar",
          ],
          correctAnswer: 1,
          explanation: "Memorizar os padrões é o maior desafio inicial.",
        },
        {
          question: "O que é fundamental para escrever corretamente em Braille?",
          options: [
            "Força no punção",
            "Simetria e ordem dos pontos",
            "Cor da folha",
            "Uso de canetas especiais",
          ],
          correctAnswer: 1,
          explanation:
            "A simetria e posição correta dos pontos são essenciais para legibilidade.",
        },
      ];
      return { ...questions[i], id: `Q2.${i + 1}`, order: i + 1 };
    }),
  },

  // ======================================================
  // MÓDULO 3 - Aplicações e Contextos do Braille
  // ======================================================
  {
    id: "3",
    moduleNumber: 3,
    title: "Aplicações e Contextos do Braille",
    description:
      "Conheça como o Braille é aplicado no cotidiano, em tecnologia, música e matemática.",
    lessons: [
      {
        id: "L3.1",
        title: "Braille no cotidiano",
        content:
          "O Braille está presente em placas, remédios e embalagens para garantir acessibilidade.",
      },
      {
        id: "L3.2",
        title: "Braille na música e matemática",
        content:
          "Existem variações do Braille que representam notas musicais e expressões matemáticas.",
      },
    ],
    quiz: Array.from({ length: 10 }, (_, i) => {
      const questions = [
        {
          question: "Onde o Braille é mais encontrado no cotidiano?",
          options: [
            "Somente em livros",
            "Em embalagens e placas de identificação",
            "Em músicas apenas",
            "Em computadores",
          ],
          correctAnswer: 1,
          explanation: "O Braille é amplamente usado em embalagens e sinalizações públicas.",
        },
        {
          question: "O que é o Braille musical?",
          options: [
            "Uma linguagem sonora",
            "Um sistema tátil para representar notas e ritmos",
            "Um tipo de partitura em tinta",
            "Um instrumento adaptado",
          ],
          correctAnswer: 1,
          explanation: "O Braille musical representa notas e ritmos em forma tátil.",
        },
        {
          question: "Como o Braille matemático difere do tradicional?",
          options: [
            "Usa símbolos adicionais para operações",
            "Tem mais colunas de pontos",
            "É colorido",
            "Usa letras maiúsculas",
          ],
          correctAnswer: 0,
          explanation: "O Braille matemático inclui símbolos para números e operadores.",
        },
        {
          question: "Qual a importância do Braille em espaços públicos?",
          options: [
            "Estética",
            "Marketing visual",
            "Acessibilidade",
            "Controle de estoque",
          ],
          correctAnswer: 2,
          explanation:
            "O Braille garante inclusão e acessibilidade em locais públicos.",
        },
        {
          question: "O que é um display Braille?",
          options: [
            "Uma tela tátil que traduz texto digital em Braille",
            "Um quadro em relevo",
            "Um tipo de teclado musical",
            "Um painel luminoso",
          ],
          correctAnswer: 0,
          explanation:
            "O display Braille transforma texto digital em células Braille táteis.",
        },
        {
          question: "Como o Braille é ensinado nas escolas?",
          options: [
            "Com jogos táteis e materiais adaptados",
            "Somente por livros comuns",
            "Por vídeos legendados",
            "Com textos visuais apenas",
          ],
          correctAnswer: 0,
          explanation:
            "Jogos e materiais táteis tornam o aprendizado mais acessível.",
        },
        {
          question: "Em que área o Braille tem crescido com a tecnologia?",
          options: [
            "Redes sociais",
            "Computadores e smartphones acessíveis",
            "Cinema",
            "Moda",
          ],
          correctAnswer: 1,
          explanation: "Softwares e leitores de tela agora suportam Braille digital.",
        },
        {
          question: "Qual instituição mundial promove o uso do Braille?",
          options: [
            "ONU",
            "NASA",
            "FIFA",
            "OMS",
          ],
          correctAnswer: 0,
          explanation:
            "A ONU reconhece o Braille como meio essencial de comunicação.",
        },
        {
          question: "Quando é celebrado o Dia Mundial do Braille?",
          options: [
            "4 de Janeiro",
            "15 de Abril",
            "10 de Dezembro",
            "22 de Março",
          ],
          correctAnswer: 0,
          explanation: "4 de Janeiro homenageia o nascimento de Louis Braille.",
        },
        {
          question: "Por que o Braille ainda é essencial na era digital?",
          options: [
            "É apenas simbólico",
            "Permite leitura ativa e independência",
            "Foi substituído por leitores de tela",
            "Serve apenas para decoração",
          ],
          correctAnswer: 1,
          explanation: "O Braille promove autonomia e alfabetização completa.",
        },
      ];
      return { ...questions[i], id: `Q3.${i + 1}`, order: i + 1 };
    }),
  },
];

// ==========================================================
// FUNÇÃO AUXILIAR
// ==========================================================
export const getQuizByModuleId = (id: number) => {
  return modules.find((m) => m.moduleNumber === id) || null;
};

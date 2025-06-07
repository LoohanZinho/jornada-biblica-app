
import type { QuizQuestionType } from '@/types';

export const sampleQuizQuestions: QuizQuestionType[] = [
  {
    id: 'sample-1',
    question: "Quem construiu a Arca conforme instruído por Deus para salvar sua família e os animais do grande dilúvio?",
    options: ["Moisés", "Noé", "Abraão", "Davi"],
    correctAnswer: "Noé",
    topic: "Antigo Testamento",
    difficulty: "fácil",
    explanationContext: "A história da Arca de Noé é encontrada no Livro de Gênesis, capítulos 6-9. Deus instruiu Noé, um homem justo, a construir uma grande embarcação (arca) para preservar a vida durante um dilúvio mundial destinado a limpar a terra da maldade.",
    imageHint: "ark flood",
  },
  {
    id: 'sample-2',
    question: "Qual profeta é conhecido por dividir o Mar Vermelho?",
    options: ["Elias", "Isaías", "Moisés", "Jeremias"],
    correctAnswer: "Moisés",
    topic: "Antigo Testamento",
    difficulty: "fácil",
    explanationContext: "Moisés, uma figura chave no Judaísmo, Cristianismo e Islamismo, liderou os israelitas para fora da escravidão no Egito. A divisão do Mar Vermelho, descrita no Livro do Êxodo, permitiu que eles escapassem do exército egípcio que os perseguia.",
    imageHint: "sea parting",
  },
];

// quizTopics foi removido pois o campo de tópico agora é um input de texto.
export const quizDifficulties: Array<"todos" | "fácil" | "médio" | "difícil"> = ["todos", "fácil", "médio", "difícil"];


import type { TrueFalseQuestionType } from '@/types';

export const sampleTrueFalseQuestions: TrueFalseQuestionType[] = [
  {
    id: 'tf-sample-1',
    statement: 'Moisés escreveu o livro de Gênesis.',
    correctAnswer: true, // Tradicionalmente atribuído a Moisés
    explanation: 'Embora a autoria mosaica seja tradicional, o consenso acadêmico moderno sugere múltiplas fontes. No entanto, para fins de conhecimento bíblico geral, é frequentemente atribuído a Moisés.',
    topic: 'Antigo Testamento',
    difficulty: 'médio',
    imageHint: 'moses writing scroll',
  },
  {
    id: 'tf-sample-2',
    statement: 'Jesus nasceu em Jerusalém.',
    correctAnswer: false,
    explanation: 'Jesus nasceu em Belém, conforme registrado nos Evangelhos de Mateus e Lucas.',
    topic: 'Vida de Jesus',
    difficulty: 'fácil',
    imageHint: 'birth manger star',
  },
  {
    id: 'tf-sample-3',
    statement: 'O apóstolo Paulo era um dos doze discípulos originais de Jesus.',
    correctAnswer: false,
    explanation: 'Paulo (originalmente Saulo) tornou-se apóstolo após a ascensão de Jesus. Os doze originais foram escolhidos por Jesus durante seu ministério terreno.',
    topic: 'Apóstolos',
    difficulty: 'médio',
    imageHint: 'paul preaching crowd',
  },
  {
    id: 'tf-sample-4',
    statement: 'Davi derrotou Golias com uma espada.',
    correctAnswer: false,
    explanation: 'Davi derrotou Golias com uma funda e uma pedra, e só depois usou a espada de Golias para decapitá-lo (1 Samuel 17).',
    topic: 'Histórias do Antigo Testamento',
    difficulty: 'fácil',
    imageHint: 'david goliath sling',
  },
  {
    id: 'tf-sample-5',
    statement: 'O livro de Apocalipse é o último livro do Novo Testamento.',
    correctAnswer: true,
    explanation: 'Sim, o livro de Apocalipse (Revelação) é tradicionalmente posicionado como o último livro canônico do Novo Testamento.',
    topic: 'Novo Testamento',
    difficulty: 'fácil',
    imageHint: 'scroll seven seals',
  },
];


import type { WhoSaidThisQuestionType } from '@/types';

export const sampleWhoSaidThisQuestions: WhoSaidThisQuestionType[] = [
  {
    id: 'wst-sample-1',
    quote: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.',
    options: ['Moisés', 'Jesus', 'Paulo', 'Pedro'],
    correctCharacter: 'Jesus',
    referenceForExplanation: 'João 14:6',
    contextForExplanation: 'Jesus conforta seus discípulos antes de sua crucificação, explicando sua relação única com o Pai.',
    topic: 'Ensinos de Jesus',
    difficulty: 'fácil',
    imageHint: 'Jesus teaching',
  },
  {
    id: 'wst-sample-2',
    quote: 'O Senhor é o meu pastor; de nada terei falta.',
    options: ['Davi', 'Salomão', 'Isaías', 'Jeremias'],
    correctCharacter: 'Davi',
    referenceForExplanation: 'Salmos 23:1',
    contextForExplanation: 'Um salmo de Davi expressando confiança na provisão e cuidado de Deus.',
    topic: 'Salmos',
    difficulty: 'fácil',
    imageHint: 'shepherd guiding sheep',
  },
  {
    id: 'wst-sample-3',
    quote: 'Combati o bom combate, terminei a corrida, guardei a fé.',
    options: ['Pedro', 'Tiago', 'Paulo', 'João'],
    correctCharacter: 'Paulo',
    referenceForExplanation: '2 Timóteo 4:7',
    contextForExplanation: 'Paulo, próximo ao fim de sua vida, reflete sobre seu ministério e fidelidade a Cristo.',
    topic: 'Cartas Paulinas',
    difficulty: 'médio',
    imageHint: 'scroll faith',
  },
  {
    id: 'wst-sample-4',
    quote: 'Rasguem o coração, e não as vestes. Voltem-se para o Senhor, o seu Deus, pois ele é misericordioso e compassivo, muito paciente e cheio de amor.',
    options: ['Amós', 'Oseias', 'Joel', 'Jonas'],
    correctCharacter: 'Joel',
    referenceForExplanation: 'Joel 2:13',
    contextForExplanation: 'O profeta Joel conclama o povo ao arrependimento sincero diante de um julgamento iminente.',
    topic: 'Profetas Menores',
    difficulty: 'difícil',
    imageHint: 'torn heart repentance',
  },
];

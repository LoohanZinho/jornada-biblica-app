
export interface QuizQuestionType {
  id: string;
  question: string; 
  options: string[]; 
  correctAnswer: string; 
  topic: string; 
  difficulty: "fácil" | "médio" | "difícil"; 
  explanationContext?: string; 
  imageHint?: string; 
}

export interface DailyVerse {
  id: string;
  reference: string; 
  text: string; 
  theme?: string; 
}

export interface QuizSettings {
  topic: string; 
  difficulty: "fácil" | "médio" | "difícil" | "todos"; 
  numberOfQuestions: number;
}

export interface QuizResult {
  question: string; 
  selectedAnswer: string; 
  correctAnswer: string; 
  isCorrect: boolean;
}

export interface ExplainAnswerOutput {
  briefContext: string;
  coreExplanation: string;
  bibleVerseReference: string;
  bibleVerseText: string;
}

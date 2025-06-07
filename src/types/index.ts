export interface QuizQuestionType {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  explanationContext?: string; 
  imageHint?: string; // For data-ai-hint
}

export interface DailyVerse {
  id: string;
  reference: string;
  text: string;
  theme?: string; // Optional theme for the verse
}

export interface QuizSettings {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "any";
  numberOfQuestions: number;
}

export interface QuizResult {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}


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

export interface GuessTheTextQuestionType {
  id: string;
  textSnippet: string; 
  options: string[]; 
  correctAnswer: string; 
  fullText: string; 
  topic: string; 
  difficulty: "fácil" | "médio" | "difícil";
  imageHint?: string; 
}

export interface GuessTheTextResult {
  textSnippet: string;
  selectedAnswer: string; 
  correctAnswer: string; 
  fullText: string; 
  isCorrect: boolean;
}

export interface WhoSaidThisQuestionType {
  id: string;
  quote: string; 
  options: string[]; 
  correctCharacter: string; 
  referenceForExplanation: string; 
  contextForExplanation: string; 
  topic: string;
  difficulty: "fácil" | "médio" | "difícil";
  imageHint?: string; 
}

export interface WhoSaidThisResultType {
  quote: string;
  selectedCharacter: string;
  correctCharacter: string;
  isCorrect: boolean;
  reference: string; 
}

// Tipos para o jogo "Verdadeiro ou Falso"
export interface TrueFalseQuestionType {
  id: string;
  statement: string; // A afirmação a ser julgada
  correctAnswer: boolean; // true se a afirmação for verdadeira, false se for falsa
  explanation: string; // Explicação do porquê é V ou F
  topic: string;
  difficulty: "fácil" | "médio" | "difícil";
  imageHint?: string;
}

export interface TrueFalseResultType {
  statement: string;
  selectedAnswer: boolean; // Resposta do usuário
  correctAnswer: boolean; // Resposta correta
  isCorrect: boolean;
  explanation: string;
}

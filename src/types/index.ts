
export interface UserPlan {
  planId: 'free' | 'peregrino_digital' | 'mestre_escrituras';
  name: string;
  usageLimits: {
    quizPerDay?: number;
    guessTheTextPerDay?: number;
    whoSaidThisPerDay?: number;
    trueFalsePerDay?: number;
    personalizedPrayersPerWeek?: number;
  }
}

// Adicionando plan ao UserAppMetadata para simular
export interface UserAppMetadata {
  full_name?: string;
  avatar_url?: string;
  plan?: UserPlan['planId']; // 'free', 'peregrino_digital', etc.
}

// Supabase User interface (simplificada, adicione o que precisar)
export interface SupabaseUser {
  id: string;
  email?: string;
  app_metadata: UserAppMetadata;
  // Outros campos relevantes do usuário do Supabase
}


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

// Para uso com o hook useUser e simulação de plano
export interface AppUser extends Omit<SupabaseUser, 'app_metadata'> {
   app_metadata: UserAppMetadata;
}

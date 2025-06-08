
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

export interface QuizSettings { // Pode ser renomeado para GameSettings no futuro se necessário
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

// Tipos para o novo jogo "Qual é o Texto?"
export interface GuessTheTextQuestionType {
  id: string;
  textSnippet: string; // O trecho do texto bíblico
  options: string[]; // Referências bíblicas como opções (ex: "Gênesis 1:1", "João 3:16")
  correctAnswer: string; // A referência correta
  fullText: string; // O texto completo do versículo para exibição posterior
  topic: string; // Tópico relacionado ao versículo
  difficulty: "fácil" | "médio" | "difícil";
  imageHint?: string; // Dica para imagem de fundo
}

export interface GuessTheTextResult {
  textSnippet: string;
  selectedAnswer: string; // Referência selecionada pelo usuário
  correctAnswer: string; // Referência correta
  fullText: string; // Texto completo do versículo correto
  isCorrect: boolean;
}

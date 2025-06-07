
'use server';
/**
 * @fileOverview Gera perguntas de quiz sobre a Bíblia usando IA.
 *
 * - generateQuizQuestions - Função que gera um conjunto de perguntas de quiz.
 * - GenerateQuizQuestionsInput - O tipo de entrada para a função generateQuizQuestions.
 * - GenerateQuizQuestionsOutput - O tipo de retorno para a função generateQuizQuestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { QuizQuestionType } from '@/types';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('O tópico para as perguntas do quiz (ex: "Antigo Testamento", "Profetas").'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('O nível de dificuldade das perguntas.'),
  numberOfQuestions: z.number().int().min(1).max(20).describe('O número de perguntas a serem geradas.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

// Schema completo da pergunta, usado pelo output do FLOW e esperado da IA
const QuizQuestionSchema = z.object({
  id: z.string().describe('Um identificador único para a pergunta.'),
  question: z.string().describe('O texto da pergunta do quiz em português.'),
  options: z.array(z.string()).length(4).describe('Um array de 4 strings contendo as opções de resposta em português.'),
  correctAnswer: z.string().describe('A resposta correta dentre as opções, em português.'),
  topic: z.string().describe('O tópico da pergunta, em português.'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('A dificuldade da pergunta.'),
  explanationContext: z.string().optional().describe('Um breve contexto para a explicação da resposta, em português.'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave em INGLÊS para gerar uma imagem (ex: "ark flood", "desert stars"). Maximo de duas palavras.'),
});

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('Um array de objetos de perguntas do quiz geradas pela IA.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPromptPortugueseReverted',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema}, 
  prompt: `Você é um especialista em Bíblia e teologia, criando um quiz interativo.
Gere EXATAMENTE {{numberOfQuestions}} perguntas de quiz em português sobre o tópico "{{topic}}" com dificuldade "{{difficulty}}".

IMPORTANTE: As perguntas devem focar EXCLUSIVAMENTE em acontecimentos históricos, narrativas e fatos bíblicos do passado (por exemplo: "Quem liderou o êxodo do Egito?", "Qual milagre Jesus realizou em Caná?", "Quem foi o primeiro rei de Israel?", "Qual era a profissão de Mateus antes de seguir Jesus?"). EVITE perguntas sobre interpretações teológicas, doutrinas abstratas, significados simbólicos ou conceitos puramente teóricos. Foque em eventos, personagens e ações concretas descritas na Bíblia.

Para CADA uma das {{numberOfQuestions}} perguntas, forneça TODOS os seguintes campos:
1.  'id': Um identificador único para a pergunta (ex: "q1-{{topic}}-{{difficulty}}", "q2-geral-facil"). Use o tópico e dificuldade no id.
2.  'question': O texto completo da pergunta em português, focada em acontecimentos.
3.  'options': Um array com exatamente 4 opções de resposta em português.
4.  'correctAnswer': A string exata de uma das opções que é a resposta correta, em português.
5.  'topic': O tópico da pergunta (deve ser o mesmo que o input "{{topic}}").
6.  'difficulty': A dificuldade da pergunta (deve ser a mesma que o input "{{difficulty}}").
7.  'explanationContext': (Opcional, mas útil) Uma frase curta em português que forneça contexto para uma futura explicação mais detalhada da resposta, relacionada ao acontecimento.
8.  'imageHint': (Opcional, mas altamente preferível) Uma ou duas palavras-chave EM INGLÊS que possam ser usadas para encontrar ou gerar uma imagem relevante para o acontecimento da pergunta (ex: "red sea parting", "water wine"). Maximo de duas palavras.

Certifique-se de que a resposta correta ('correctAnswer') seja uma das strings presentes no array 'options'.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado, onde o campo "questions" DEVE ser um array contendo EXATAMENTE {{numberOfQuestions}} objetos de pergunta.
Não inclua nenhuma numeração de pergunta como "1." ou "P1:" no campo 'question'. Apenas o texto da pergunta.
As opções devem ser apenas o texto das opções, sem "a)", "b)", etc.
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlowPortugueseReverted',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema, 
  },
  async (input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> => {
    const {output: aiOutput} = await prompt(input); 
    
    if (!aiOutput || !aiOutput.questions || !Array.isArray(aiOutput.questions)) {
      throw new Error('Falha ao gerar perguntas do quiz: a IA não retornou um array de perguntas válido.');
    }
    
    // A IA deve retornar os campos completos conforme o QuizQuestionSchema.
    // Adicionamos uma leve validação/normalização para garantir que os campos essenciais estejam presentes.
    const processedQuestions: QuizQuestionType[] = aiOutput.questions.map((aiQuestion, index) => {
      if (!aiQuestion.question || !aiQuestion.options || !aiQuestion.correctAnswer || !aiQuestion.id || !aiQuestion.topic || !aiQuestion.difficulty) {
        console.warn("Pergunta da IA incompleta ou malformada:", aiQuestion);
        // Cria uma pergunta "inválida" de fallback para não quebrar o quiz, mas idealmente a IA deve seguir o prompt.
        return {
          id: aiQuestion.id || `invalid-q${index + 1}-${Date.now()}`,
          question: aiQuestion.question || "Pergunta inválida da IA",
          options: aiQuestion.options || ["Opção A", "Opção B", "Opção C", "Opção D"],
          correctAnswer: aiQuestion.correctAnswer || (aiQuestion.options ? aiQuestion.options[0] : "Opção A"),
          topic: aiQuestion.topic || input.topic,
          difficulty: aiQuestion.difficulty || input.difficulty,
          explanationContext: aiQuestion.explanationContext,
          imageHint: aiQuestion.imageHint,
        };
      }
      return aiQuestion as QuizQuestionType; 
    });
    
    return { questions: processedQuestions };
  }
);

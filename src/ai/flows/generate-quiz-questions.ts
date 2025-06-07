
'use server';
/**
 * @fileOverview Gera perguntas de quiz sobre a Bíblia usando IA, focando em acontecimentos históricos.
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

// Schema completo da pergunta, usado pelo output do FLOW
const QuizQuestionSchema = z.object({
  id: z.string().describe('Um identificador único para a pergunta.'),
  question: z.string().describe('O texto da pergunta do quiz em português.'),
  options: z.array(z.string()).length(4).describe('Um array de 4 strings contendo as opções de resposta em português.'),
  correctAnswer: z.string().describe('A resposta correta dentre as opções, em português.'),
  topic: z.string().describe('O tópico da pergunta, em português.'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('A dificuldade da pergunta.'),
  explanationContext: z.string().optional().describe('Um breve contexto para a explicação da resposta, em português.'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave em INGLÊS para gerar uma imagem (ex: "ark flood", "desert stars"). Maximo de duas palavras.'),
  hintText: z.string().optional().describe('Uma dica sutil de uma frase para ajudar o usuário, em português. Não revele a resposta diretamente.'),
});

// Schema para o que a IA deve GERAR (sem id, topic, difficulty)
const AIQuestionOutputSchema = z.object({
  question: z.string().describe('O texto da pergunta do quiz em português.'),
  options: z.array(z.string()).length(4).describe('Um array de 4 strings contendo as opções de resposta em português.'),
  correctAnswer: z.string().describe('A resposta correta dentre as opções, em português.'),
  explanationContext: z.string().optional().describe('Um breve contexto para a explicação da resposta, em português.'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave em INGLÊS para gerar uma imagem (ex: "ark flood", "desert stars"). Maximo de duas palavras.'),
  hintText: z.string().optional().describe('Uma dica sutil de uma frase para ajudar o usuário, em português. Não revele a resposta diretamente.'),
});

// Schema do output direto do PROMPT da IA
const AIPromptOutputSchema = z.object({
  questions: z.array(AIQuestionOutputSchema).describe('Um array de objetos de perguntas do quiz geradas pela IA, contendo EXATAMENTE o número de perguntas solicitado.'),
});

// Schema do output do FLOW (que usa o QuizQuestionSchema completo)
const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('Um array de objetos de perguntas do quiz geradas e processadas.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPromptHistoricalEnhanced',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: AIPromptOutputSchema}, 
  prompt: `Você é um especialista em Bíblia e teologia, criando um quiz interativo.
Gere EXATAMENTE {{numberOfQuestions}} perguntas de quiz em português sobre o tópico "{{topic}}" com dificuldade "{{difficulty}}".
É CRUCIAL que você gere exatamente {{numberOfQuestions}} perguntas. Se {{numberOfQuestions}} for 5, gere 5 perguntas. Se for 10, gere 10.
AS PERGUNTAS DEVEM FOCAR EM ACONTECIMENTOS HISTÓRICOS importantes e narrativas da Bíblia, em vez de conceitos teológicos abstratos ou interpretações doutrinárias. Pergunte sobre 'o que aconteceu', 'quem fez o quê', 'onde ocorreu um evento importante', etc.

Para CADA uma das {{numberOfQuestions}} perguntas, forneça APENAS os seguintes campos:
1.  'question': O texto completo da pergunta em português.
2.  'options': Um array com exatamente 4 opções de resposta em português.
3.  'correctAnswer': A string exata de uma das opções que é a resposta correta, em português.
4.  'explanationContext': (Opcional) Uma frase curta em português que forneça contexto para uma futura explicação mais detalhada da resposta.
5.  'imageHint': (Opcional, mas altamente preferível) Uma ou duas palavras-chave EM INGLÊS que possam ser usadas para encontrar ou gerar uma imagem relevante para a pergunta (ex: "Moses staff", "Jerusalem temple", "dove peace"). Maximo de duas palavras.
6.  'hintText': (Opcional, mas ALTAMENTE PREFERÍVEL) Uma ÚNICA frase curta em português que sirva como uma pista SUTIL para a pergunta. NÃO deve revelar a resposta diretamente, mas guiar o pensamento. Ex: 'Este evento ocorreu perto de uma montanha famosa.' ou 'Este personagem era conhecido por sua grande força.' É muito importante que você tente fornecer uma 'hintText' para cada pergunta.

Certifique-se de que a resposta correta ('correctAnswer') seja uma das strings presentes no array 'options'.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado. O campo "questions" DEVE ser um array contendo EXATAMENTE {{numberOfQuestions}} objetos de pergunta.
Não inclua nenhuma numeração de pergunta como "1." ou "P1:" no campo 'question'. Apenas o texto da pergunta.
As opções devem ser apenas o texto das opções, sem "a)", "b)", etc.
Os campos 'id', 'topic' e 'difficulty' NÃO devem ser incluídos na sua resposta JSON, pois serão adicionados posteriormente pelo sistema.
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlowHistoricalEnhanced',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema, 
  },
  async (input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> => {
    const {output: aiOutput} = await prompt(input); 
    
    if (!aiOutput || !aiOutput.questions || !Array.isArray(aiOutput.questions)) {
      // Lança um erro mais específico se a IA não retornar um array de perguntas
      throw new Error('Falha ao gerar perguntas do quiz: a IA não retornou um array de perguntas válido.');
    }
    
    // Mapeia a saída da IA para o tipo QuizQuestionType (que é o schema completo)
    const processedQuestions: QuizQuestionType[] = aiOutput.questions.map((aiQuestion, index) => {
      if (!aiQuestion.question || !aiQuestion.options || !aiQuestion.correctAnswer) {
        // Poderia lançar um erro aqui ou filtrar esta pergunta inválida
        console.warn("Pergunta da IA incompleta ou malformada:", aiQuestion);
        // Para este exemplo, vamos tentar preencher com valores padrão, mas o ideal seria tratar melhor
        return {
          id: `invalid-q${index + 1}-${Date.now()}`,
          question: aiQuestion.question || "Pergunta inválida da IA",
          options: aiQuestion.options || ["Opção A", "Opção B", "Opção C", "Opção D"],
          correctAnswer: aiQuestion.correctAnswer || (aiQuestion.options ? aiQuestion.options[0] : "Opção A"),
          topic: input.topic,
          difficulty: input.difficulty,
          explanationContext: aiQuestion.explanationContext,
          imageHint: aiQuestion.imageHint,
          hintText: aiQuestion.hintText,
        };
      }
      return {
        ...aiQuestion, 
        id: `gen-q${index + 1}-${Date.now()}`, 
        topic: input.topic, 
        difficulty: input.difficulty, 
      };
    });
    
    return { questions: processedQuestions };
  }
);


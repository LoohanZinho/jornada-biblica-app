
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

const QuizQuestionSchema = z.object({
  id: z.string().describe('Um identificador único para a pergunta (pode ser gerado sequencialmente).'),
  question: z.string().describe('O texto da pergunta do quiz em português.'),
  options: z.array(z.string()).length(4).describe('Um array de 4 strings contendo as opções de resposta em português.'),
  correctAnswer: z.string().describe('A resposta correta dentre as opções, em português.'),
  topic: z.string().describe('O tópico da pergunta, em português (deve corresponder ao tópico de entrada).'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('A dificuldade da pergunta (deve corresponder à dificuldade de entrada).'),
  explanationContext: z.string().optional().describe('Um breve contexto para a explicação da resposta, em português.'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave em INGLÊS para gerar uma imagem (ex: "ark flood", "desert stars").'),
});

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('Um array de objetos de perguntas do quiz geradas.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `Você é um especialista em Bíblia e teologia, criando um quiz interativo.
Gere {{numberOfQuestions}} perguntas de quiz em português sobre o tópico "{{topic}}" com dificuldade "{{difficulty}}".

Para cada pergunta, forneça:
1.  'id': Um 'id' (string, pode ser "q1", "q2", etc. mas será sobrescrito).
2.  'question': O texto completo da pergunta em português.
3.  'options': Um array com exatamente 4 opções de resposta em português.
4.  'correctAnswer': A string exata de uma das opções que é a resposta correta, em português.
5.  'topic': O tópico fornecido na entrada ("{{topic}}").
6.  'difficulty': A dificuldade fornecida na entrada ("{{difficulty}}").
7.  'explanationContext': (Opcional) Uma frase curta em português que forneça contexto para uma futura explicação mais detalhada da resposta.
8.  'imageHint': (Opcional, mas preferível) Uma ou duas palavras-chave EM INGLÊS que possam ser usadas para encontrar ou gerar uma imagem relevante para a pergunta (ex: "Moses staff", "Jerusalem temple", "dove peace"). Maximo de duas palavras.

Certifique-se de que a resposta correta ('correctAnswer') seja uma das strings presentes no array 'options'.
Formate a saída como um objeto JSON que corresponda ao schema de saída.
Não inclua nenhuma numeração de pergunta como "1." ou "P1:" no campo 'question'.
Apenas o texto da pergunta.
As opções devem ser apenas o texto das opções, sem "a)", "b)", etc.
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input: GenerateQuizQuestionsInput) => {
    const {output} = await prompt(input);
    if (!output || !output.questions) {
      throw new Error('Falha ao gerar perguntas do quiz ou formato de saída inválido.');
    }
    output.questions.forEach((q, index) => {
      q.id = `gen-q${index + 1}-${Date.now()}`; // Ensure unique ID
      q.topic = input.topic; 
      q.difficulty = input.difficulty; 
    });
    return output;
  }
);

    
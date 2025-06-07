
'use server';

/**
 * @fileOverview Explica a resposta para uma pergunta de quiz bíblico, fornecendo contexto histórico,
 * uma explicação central e um versículo bíblico relevante, em português.
 *
 * - explainAnswer - Uma função que lida com o processo de explicação.
 * - ExplainAnswerInput - O tipo de entrada para a função explainAnswer.
 * - ExplainAnswerOutput - O tipo de retorno para a função explainAnswer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ExplainAnswerOutput as ExplainAnswerOutputType } from '@/types';


const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('A pergunta do quiz bíblico, em português.'),
  answer: z.string().describe('A resposta fornecida pelo usuário, em português.'),
  correctAnswer: z.string().describe('A resposta correta para a pergunta, em português.'),
  explanationContext: z.string().optional().describe('Contexto pré-definido para a pergunta, se disponível, para ajudar na explicação.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  briefContext: z.string().describe('Um breve contexto histórico ou narrativo sobre a questão, em português. Mantenha conciso (1-2 frases).'),
  coreExplanation: z.string().describe('A explicação central da resposta correta, de forma clara e concisa, em português (2-3 frases no máximo).'),
  bibleVerseReference: z.string().describe('A referência bíblica relevante para a explicação (ex: Gênesis 1:1), em português.'),
  bibleVerseText: z.string().describe('O texto do versículo bíblico correspondente à referência, em português.'),
});
// Exporta o tipo inferido para uso externo, alinhado com o tipo em @/types
export type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;


export async function explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutputType> {
  const result = await explainAnswerFlow(input);
  // Assegura que o tipo de retorno está em conformidade com ExplainAnswerOutputType
  return result as ExplainAnswerOutputType;
}

const prompt = ai.definePrompt({
  name: 'explainAnswerDetailsPromptPortuguese',
  input: {schema: ExplainAnswerInputSchema},
  output: {schema: ExplainAnswerOutputSchema},
  prompt: `Você é um teólogo e historiador bíblico experiente, fornecendo explicações claras e concisas.
Um usuário respondeu a uma pergunta do quiz. Sua tarefa é fornecer uma explicação enriquecedora sobre a resposta correta.

Pergunta: {{{question}}}
Resposta do Usuário: {{{answer}}}
Resposta Correta: {{{correctAnswer}}}
{{#if explanationContext}}
Contexto Adicional Fornecido: {{{explanationContext}}}
{{/if}}

Por favor, forneça as seguintes informações em português, sendo o mais CONCISO possível para cada campo, para que não ocupe muito espaço na interface:
1.  'briefContext': Um breve contexto histórico ou narrativo sobre a questão (idealmente 1-2 frases curtas).
2.  'coreExplanation': A explicação central da resposta correta (idealmente 2-3 frases curtas e diretas).
3.  'bibleVerseReference': A referência de UM versículo bíblico relevante que fundamente ou ilustre a explicação (formato: Livro Capítulo:Versículo, ex: João 3:16).
4.  'bibleVerseText': O texto completo desse versículo bíblico.

Seja direto e evite introduções desnecessárias. O foco é fornecer valor rapidamente.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado.
`,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerDetailsFlowPortuguese',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.briefContext || !output.coreExplanation || !output.bibleVerseReference || !output.bibleVerseText) {
        throw new Error('A IA não conseguiu gerar uma explicação detalhada com todos os campos necessários.');
    }
    return output;
  }
);


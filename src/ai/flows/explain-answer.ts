
'use server';

/**
 * @fileOverview Explica a resposta para uma pergunta de quiz bíblico, fornecendo contexto histórico e fatos relacionados, em português.
 *
 * - explainAnswer - Uma função que lida com o processo de explicação.
 * - ExplainAnswerInput - O tipo de entrada para a função explainAnswer (espera texto em português).
 * - ExplainAnswerOutput - O tipo de retorno para a função explainAnswer (retorna texto em português).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('A pergunta do quiz bíblico, em português.'),
  answer: z.string().describe('A resposta fornecida pelo usuário, em português.'),
  correctAnswer: z.string().describe('A resposta correta para a pergunta, em português.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('Uma explicação extremamente concisa e envolvente da resposta correta (idealmente uma frase curta), destacando um fato interessante ou curiosidade, em português, para garantir rapidez.'),
});
export type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;

export async function explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutput> {
  return explainAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAnswerPromptPortuguese',
  input: {schema: ExplainAnswerInputSchema},
  output: {schema: ExplainAnswerOutputSchema},
  prompt: `Você é um especialista em Bíblia, capaz de fornecer fatos interessantes de forma MUITO RÁPIDA e CONCISA.
Um usuário respondeu a uma pergunta do quiz. Forneça uma explicação EXTREMAMENTE CURTA e ENVOLVENTE em português sobre a resposta correta.
O objetivo é ser rápido. Idealmente, uma única frase destacando um fato curioso ou o ponto principal. Evite qualquer texto longo. FOCO NA BREVIDADE.

Pergunta: {{{question}}}
Resposta do Usuário: {{{answer}}}
Resposta Correta: {{{correctAnswer}}}

Explicação (muito curta e direta): `,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlowPortuguese',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


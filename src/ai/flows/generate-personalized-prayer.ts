
'use server';

/**
 * @fileOverview Agente de IA que gera orações ou reflexões personalizadas em português,
 * com base no desempenho do usuário no quiz e em seus interesses.
 *
 * - generatePersonalizedPrayer - Função que gera orações personalizadas.
 * - GeneratePersonalizedPrayerInput - O tipo de entrada para a função (espera texto em português).
 * - GeneratePersonalizedPrayerOutput - O tipo de retorno para a função (retorna texto em português).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedPrayerInputSchema = z.object({
  quizPerformanceSummary: z
    .string()
    .describe(
      'Um resumo do desempenho do usuário no quiz, incluindo áreas de força e fraqueza, em português.'
    ),
  areasOfInterest: z
    .string()
    .describe(
      'Uma descrição das áreas de interesse do usuário na Bíblia (ex: livros específicos, temas ou personagens), em português.'
    ),
});
export type GeneratePersonalizedPrayerInput = z.infer<
  typeof GeneratePersonalizedPrayerInputSchema
>;

const GeneratePersonalizedPrayerOutputSchema = z.object({
  prayer: z.string().describe('Uma oração ou reflexão personalizada, em português.'),
});
export type GeneratePersonalizedPrayerOutput = z.infer<
  typeof GeneratePersonalizedPrayerOutputSchema
>;

export async function generatePersonalizedPrayer(
  input: GeneratePersonalizedPrayerInput
): Promise<GeneratePersonalizedPrayerOutput> {
  return generatePersonalizedPrayerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedPrayerPromptPortuguese',
  input: {schema: GeneratePersonalizedPrayerInputSchema},
  output: {schema: GeneratePersonalizedPrayerOutputSchema},
  prompt: `Com base no desempenho do usuário no quiz e em suas áreas de interesse, gere uma oração ou reflexão personalizada e encorajadora em português.
A oração deve ser respeitosa, inspiradora e teologicamente sólida dentro de uma perspectiva cristã geral.

Resumo do Desempenho no Quiz: {{{quizPerformanceSummary}}}
Áreas de Interesse: {{{areasOfInterest}}}

Oração/Reflexão:`,
});

const generatePersonalizedPrayerFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedPrayerFlowPortuguese',
    inputSchema: GeneratePersonalizedPrayerInputSchema,
    outputSchema: GeneratePersonalizedPrayerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    
'use server';

/**
 * @fileOverview AI agent that generates personalized prayers or reflections based on user quiz performance and interests.
 *
 * - generatePersonalizedPrayer - A function that generates personalized prayers.
 * - GeneratePersonalizedPrayerInput - The input type for the generatePersonalizedPrayer function.
 * - GeneratePersonalizedPrayerOutput - The return type for the generatePersonalizedPrayer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedPrayerInputSchema = z.object({
  quizPerformanceSummary: z
    .string()
    .describe(
      'A summary of the user\'s quiz performance, including areas of strength and weakness.'
    ),
  areasOfInterest: z
    .string()
    .describe(
      'A description of the user\'s areas of interest within the Bible, e.g., specific books, themes, or characters.'
    ),
});
export type GeneratePersonalizedPrayerInput = z.infer<
  typeof GeneratePersonalizedPrayerInputSchema
>;

const GeneratePersonalizedPrayerOutputSchema = z.object({
  prayer: z.string().describe('A personalized prayer or reflection.'),
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
  name: 'generatePersonalizedPrayerPrompt',
  input: {schema: GeneratePersonalizedPrayerInputSchema},
  output: {schema: GeneratePersonalizedPrayerOutputSchema},
  prompt: `Based on the user\'s quiz performance and areas of interest, generate a personalized prayer or reflection.

Quiz Performance Summary: {{{quizPerformanceSummary}}}
Areas of Interest: {{{areasOfInterest}}}

Prayer:`,
});

const generatePersonalizedPrayerFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedPrayerFlow',
    inputSchema: GeneratePersonalizedPrayerInputSchema,
    outputSchema: GeneratePersonalizedPrayerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

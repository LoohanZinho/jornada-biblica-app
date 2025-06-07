'use server';

/**
 * @fileOverview Explains the answer to a biblical quiz question, providing historical context and related facts.
 *
 * - explainAnswer - A function that handles the explanation process.
 * - ExplainAnswerInput - The input type for the explainAnswer function.
 * - ExplainAnswerOutput - The return type for the explainAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('The biblical quiz question.'),
  answer: z.string().describe('The answer provided by the user.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the correct answer, including historical context and related facts.'),
});
export type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;

export async function explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutput> {
  return explainAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAnswerPrompt',
  input: {schema: ExplainAnswerInputSchema},
  output: {schema: ExplainAnswerOutputSchema},
  prompt: `You are an expert in biblical history and theology. A user has just answered a quiz question. Provide a detailed explanation of the correct answer, including historical context, related facts, and curiosities.

Question: {{{question}}}
User's Answer: {{{answer}}}
Correct Answer: {{{correctAnswer}}}

Explanation: `,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlow',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

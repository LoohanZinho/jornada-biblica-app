
'use server';
/**
 * @fileOverview Gera um comentário reflexivo sobre um versículo bíblico diário.
 *
 * - generateDailyVerseCommentary - Função que gera o comentário.
 * - GenerateDailyVerseCommentaryInput - O tipo de entrada.
 * - GenerateDailyVerseCommentaryOutput - O tipo de retorno.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyVerseCommentaryInputSchema = z.object({
  verseText: z.string().describe('O texto do versículo bíblico.'),
  verseReference: z.string().describe('A referência do versículo bíblico (ex: João 3:16).'),
});
export type GenerateDailyVerseCommentaryInput = z.infer<typeof GenerateDailyVerseCommentaryInputSchema>;

const GenerateDailyVerseCommentaryOutputSchema = z.object({
  commentary: z.string().describe('Um comentário reflexivo sobre como aplicar o versículo na vida diária (2-4 frases concisas).'),
});
export type GenerateDailyVerseCommentaryOutput = z.infer<typeof GenerateDailyVerseCommentaryOutputSchema>;

export async function generateDailyVerseCommentary(input: GenerateDailyVerseCommentaryInput): Promise<GenerateDailyVerseCommentaryOutput> {
  return generateDailyVerseCommentaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyVerseCommentaryPrompt',
  input: {schema: GenerateDailyVerseCommentaryInputSchema},
  output: {schema: GenerateDailyVerseCommentaryOutputSchema},
  prompt: `Você é um conselheiro espiritual que ajuda as pessoas a aplicarem a sabedoria bíblica em suas vidas.
Dado o seguinte versículo bíblico:
Referência: {{{verseReference}}}
Texto: "{{{verseText}}}"

Por favor, gere um 'commentary' que seja uma breve reflexão (2-4 frases concisas e diretas) sobre como uma pessoa pode tirar proveito prático ou aplicar os ensinamentos deste versículo em seu cotidiano.
O comentário deve ser inspirador, encorajador e focado na aplicação prática. Evite explicações teológicas complexas e seja direto ao ponto.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado.
`,
});

const generateDailyVerseCommentaryFlow = ai.defineFlow(
  {
    name: 'generateDailyVerseCommentaryFlow',
    inputSchema: GenerateDailyVerseCommentaryInputSchema,
    outputSchema: GenerateDailyVerseCommentaryOutputSchema,
  },
  async (input: GenerateDailyVerseCommentaryInput) => {
    const {output} = await prompt(input);
    if (!output || !output.commentary) {
      throw new Error('A IA não conseguiu gerar um comentário para o versículo.');
    }
    return output;
  }
);

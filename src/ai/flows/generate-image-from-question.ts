
'use server';
/**
 * @fileOverview Gera uma imagem baseada em uma pergunta fornecida (em português) usando Gemini.
 *
 * - generateImageFromQuestion - Uma função que gera uma imagem a partir de uma pergunta.
 * - GenerateImageFromQuestionInput - O tipo de entrada para a função generateImageFromQuestion.
 * - GenerateImageFromQuestionOutput - O tipo de retorno para a função generateImageFromQuestion.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromQuestionInputSchema = z.object({
  questionText: z.string().describe('O texto da pergunta (em português) para gerar uma imagem.'),
});
export type GenerateImageFromQuestionInput = z.infer<typeof GenerateImageFromQuestionInputSchema>;

const GenerateImageFromQuestionOutputSchema = z.object({
  imageUrl: z.string().describe('A URL da imagem gerada como um data URI.'),
});
export type GenerateImageFromQuestionOutput = z.infer<typeof GenerateImageFromQuestionOutputSchema>;

export async function generateImageFromQuestion(input: GenerateImageFromQuestionInput): Promise<GenerateImageFromQuestionOutput> {
  return generateImageFromQuestionFlow(input);
}

const imageGenerationPromptForModel = (questionText: string) => {
  // Instrução mais enfática para não gerar texto na imagem
  return `Gere uma imagem que represente visualmente o contexto da pergunta bíblica: "${questionText}". A imagem deve ser artística e puramente ilustrativa. É CRUCIAL que a imagem NÃO contenha NENHUM texto, NENHUMA letra, NENHUM caracter escrito. O foco é 100% na ilustração visual. Estilo: ilustração digital ou pintura. Não inclua bordas ou molduras que pareçam conter texto.`;
}

const generateImageFromQuestionFlow = ai.defineFlow(
  {
    name: 'generateImageFromQuestionFlowPortuguese',
    inputSchema: GenerateImageFromQuestionInputSchema,
    outputSchema: GenerateImageFromQuestionOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imageGenerationPromptForModel(input.questionText),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Falha ao gerar imagem ou URL da imagem não encontrada.');
    }
    return {imageUrl: media.url};
  }
);


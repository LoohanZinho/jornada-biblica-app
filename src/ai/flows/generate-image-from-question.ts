
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
  questionText: z.string().describe('O texto da pergunta ou dica de imagem (em português) para gerar uma imagem.'),
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
  const maxLength = 350; 
  let effectivePrompt = questionText;
  if (questionText.length > maxLength ) {
    effectivePrompt = questionText.substring(0, maxLength - 3) + "...";
  }
  
  return `Gere uma ilustração de alta qualidade para o tema bíblico: "${effectivePrompt}". A cena deve ser ambientada nos tempos bíblicos, durante a era de Jesus Cristo, mostrando pessoas em trajes tradicionais hebreus antigos. Inclua elementos como paisagens desérticas, oliveiras, casas de pedra, sandálias, potes de barro e vestes de linho. A imagem deve ser vibrante, com cores ricas e composição clara. Foco narrativo. SEM TEXTO. Estilo: arte digital detalhada, iluminação expressiva, respeitoso ao contexto bíblico.`;
}

const generateImageFromQuestionFlow = ai.defineFlow(
  {
    name: 'generateImageFromQuestionFlowPortuguese',
    inputSchema: GenerateImageFromQuestionInputSchema,
    outputSchema: GenerateImageFromQuestionOutputSchema,
  },
  async input => {
    if (!input.questionText || input.questionText.trim() === "") {
        throw new Error('O texto para geração de imagem não pode estar vazio.');
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imageGenerationPromptForModel(input.questionText),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
    });

    if (!media || !media.url || media.url.trim() === "") {
        throw new Error('Falha ao gerar imagem ou URL da imagem não encontrada.');
    }
    return {imageUrl: media.url};
  }
);


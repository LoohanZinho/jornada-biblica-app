
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
  const maxLength = 300; 
  let effectiveQuestionText = questionText;
  if (questionText.length > maxLength ) {
    effectiveQuestionText = questionText.substring(0, maxLength - 3) + "...";
  }
  
  // Combina o estilo com o texto da pergunta
  return `No estilo artístico dos tempos bíblicos antigos, durante a vida de Jesus Cristo. Todos os personagens devem usar roupas tradicionais do Oriente Médio do primeiro século, com tecidos naturais como linho e lã. Ilustre vividamente o seguinte conceito ou cena: "${effectiveQuestionText}". A imagem deve ter cores ricas, composição clara e foco narrativo. SEM TEXTO na imagem. Estilo: arte digital detalhada, iluminação expressiva, respeitoso ao contexto bíblico.`;
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


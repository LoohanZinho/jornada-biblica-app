
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
  // Certifica-se de que o prompt não seja excessivamente longo para o modelo de imagem
  const maxLength = 300; // Um limite razoável para prompts de imagem
  const CUE_TEXT = "Ilustração bíblica para: "
  let effectivePrompt = questionText;
  if (questionText.length > maxLength - CUE_TEXT.length ) {
    effectivePrompt = questionText.substring(0, maxLength - CUE_TEXT.length - 3) + "...";
  }
  
  return `Crie uma ilustração digital detalhada ou uma pintura com estilo narrativo claro que represente fielmente os elementos principais do seguinte texto/tema bíblico: "${effectivePrompt}". A imagem deve ser de fácil compreensão, focada nos acontecimentos ou personagens descritos, e evitar interpretações excessivamente artísticas ou abstratas. O objetivo é uma representação visual clara e direta, adequada para um contexto bíblico. É CRUCIAL que a imagem NÃO contenha NENHUM texto, NENHUMA letra, NENHUM caracter escrito. Estilo: arte digital, pintura bíblica clássica, cores ricas, iluminação dramática suave.`;
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


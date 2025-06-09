
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
  
  return `Gere uma imagem vibrante e artisticamente estilizada, como uma ilustração de um livro de histórias bíblicas de alta qualidade ou uma arte digital inspirada em vitrais, para o seguinte tema/texto bíblico: "${effectivePrompt}". A imagem deve ser visualmente cativante, com cores ricas e uma composição clara que transmita a essência da cena ou personagem. Foque em elementos narrativos e evite abstrações excessivas. IMPORTANTE: A imagem NÃO DEVE conter NENHUM texto, NENHUMA letra, NENHUM caracter escrito. Estilo desejado: arte digital detalhada, iluminação expressiva, cores saturadas, com um toque clássico ou de conto de fadas, mas respeitoso ao contexto bíblico.`;
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


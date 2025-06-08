
'use server';
/**
 * @fileOverview Gera perguntas para o jogo "Qual é o Texto?".
 * O jogo apresenta um trecho de um versículo bíblico, e o usuário deve
 * adivinhar a referência correta (livro, capítulo, versículo) dentre as opções.
 *
 * - generateGuessTheTextQuestions - Função que gera um conjunto de perguntas.
 * - GenerateGuessTheTextQuestionsInput - O tipo de entrada.
 * - GenerateGuessTheTextQuestionsOutput - O tipo de retorno.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GuessTheTextQuestionType } from '@/types';

// Esquema para a entrada da função
export const GenerateGuessTheTextQuestionsInputSchema = z.object({
  topic: z.string().describe('O tópico para os versículos (ex: "Amor", "Profecias Messiânicas", "Milagres de Jesus"). "Bíblia em geral" para aleatório.'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('O nível de dificuldade das perguntas.'),
  numberOfQuestions: z.number().int().min(1).max(10).describe('O número de perguntas a serem geradas (máximo 10 para este modo).'),
});
export type GenerateGuessTheTextQuestionsInput = z.infer<typeof GenerateGuessTheTextQuestionsInputSchema>;

// Esquema para cada pergunta individual gerada pela IA
const GuessTheTextQuestionInternalSchema = z.object({
  id: z.string().describe('Um identificador único para a pergunta (ex: gtt-q1-amor-facil).'),
  textSnippet: z.string().describe('Um trecho curto e significativo de um versículo bíblico em português (idealmente 5-15 palavras). Use a "Tradução do Novo Mundo das Escrituras Sagradas" se possível.'),
  options: z.array(z.string()).length(4).describe('Um array de 4 strings contendo as referências bíblicas como opções em português (ex: "Gênesis 1:1", "Apocalipse 21:3-4"). Uma delas deve ser a correta.'),
  correctAnswer: z.string().describe('A referência bíblica correta (exatamente como uma das opções) para o trecho fornecido, em português.'),
  fullText: z.string().describe('O texto completo do versículo bíblico correspondente à resposta correta, em português. Use a "Tradução do Novo Mundo das Escrituras Sagradas" se possível.'),
  topic: z.string().describe('O tópico da pergunta (deve ser o mesmo que o input "{{topic}}" ou um sub-tópico relevante se o input for "Bíblia em geral").'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('A dificuldade da pergunta (deve ser a mesma que o input "{{difficulty}}").'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave EM INGLÊS para gerar uma imagem relacionada ao tema do versículo (ex: "dove peace", "heavenly city", "helping hand"). Máximo de duas palavras.'),
});

// Esquema para a saída da função (um array de perguntas)
export const GenerateGuessTheTextQuestionsOutputSchema = z.object({
  questions: z.array(GuessTheTextQuestionInternalSchema).describe('Um array de objetos de perguntas para o jogo "Qual é o Texto?".'),
});
export type GenerateGuessTheTextQuestionsOutput = z.infer<typeof GenerateGuessTheTextQuestionsOutputSchema>;


export async function generateGuessTheTextQuestions(input: GenerateGuessTheTextQuestionsInput): Promise<GenerateGuessTheTextQuestionsOutput> {
  return generateGuessTheTextQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGuessTheTextQuestionsPromptTNM',
  input: {schema: GenerateGuessTheTextQuestionsInputSchema},
  output: {schema: GenerateGuessTheTextQuestionsOutputSchema},
  prompt: `Você é um erudito bíblico preparando um jogo chamado "Qual é o Texto?".
Gere EXATAMENTE {{numberOfQuestions}} perguntas sobre o tópico "{{topic}}" com dificuldade "{{difficulty}}".
Para cada pergunta, o usuário verá um pequeno trecho de um versículo e deverá escolher a referência bíblica correta entre 4 opções.

IMPORTANTE:
- Use preferencialmente a "Tradução do Novo Mundo das Escrituras Sagradas" para os textos e trechos.
- Os trechos ('textSnippet') devem ser curtos (5-15 palavras), mas suficientemente distintos para permitir a identificação.
- As opções de referência ('options') devem incluir 1 correta e 3 incorretas, mas plausíveis.
  - Para 'fácil': opções incorretas podem ser de livros diferentes.
  - Para 'médio': opções incorretas podem ser do mesmo livro, mas capítulos/versículos errados, ou de livros com temas muito similares.
  - Para 'difícil': opções incorretas podem ser muito próximas da correta (ex: mesmo capítulo, versículos próximos) ou de passagens obscuras que se assemelham tematicamente.
- A 'correctAnswer' deve ser uma das strings exatas das 'options'.
- O 'fullText' deve ser o texto completo do versículo da 'correctAnswer'.
- O 'topic' e 'difficulty' no output devem corresponder ao input.
- O 'id' deve ser único e informativo (ex: gtt-q1-{{topic}}-{{difficulty}}).
- 'imageHint' (opcional, mas preferível): 1-2 palavras em INGLÊS para uma imagem (ex: "creation light", "lost sheep").

Para CADA uma das {{numberOfQuestions}} perguntas, forneça TODOS os seguintes campos:
1.  'id'
2.  'textSnippet'
3.  'options' (array de 4 strings de referências)
4.  'correctAnswer' (uma das opções)
5.  'fullText'
6.  'topic'
7.  'difficulty'
8.  'imageHint'

Formate a saída como um objeto JSON que corresponda ao schema de saída especificado.
O campo "questions" DEVE ser um array contendo EXATAMENTE {{numberOfQuestions}} objetos de pergunta.
Evite introduções, apenas o JSON.
`,
});

const generateGuessTheTextQuestionsFlow = ai.defineFlow(
  {
    name: 'generateGuessTheTextQuestionsFlowTNM',
    inputSchema: GenerateGuessTheTextQuestionsInputSchema,
    outputSchema: GenerateGuessTheTextQuestionsOutputSchema,
  },
  async (input: GenerateGuessTheTextQuestionsInput): Promise<GenerateGuessTheTextQuestionsOutput> => {
    const {output: aiOutput} = await prompt(input);

    if (!aiOutput || !aiOutput.questions || !Array.isArray(aiOutput.questions)) {
      throw new Error('Falha ao gerar perguntas "Qual é o Texto?": a IA não retornou um array de perguntas válido.');
    }

    // Validação e normalização básica
    const processedQuestions: GuessTheTextQuestionType[] = aiOutput.questions.map((q, index) => {
      if (!q.id || !q.textSnippet || !q.options || q.options.length !== 4 || !q.correctAnswer || !q.fullText || !q.topic || !q.difficulty) {
        console.warn("Pergunta 'Qual é o Texto?' da IA incompleta ou malformada:", q);
        // Fallback para evitar quebrar o jogo, mas a IA deve ser robusta
        return {
          id: q.id || `invalid-gtt-q${index + 1}-${Date.now()}`,
          textSnippet: q.textSnippet || "Trecho inválido.",
          options: q.options && q.options.length === 4 ? q.options : ["Gênesis 1:1", "Êxodo 20:3", "Salmos 23:1", "João 3:16"],
          correctAnswer: q.correctAnswer || (q.options && q.options.length > 0 ? q.options[0] : "Gênesis 1:1"),
          fullText: q.fullText || "Texto completo indisponível.",
          topic: q.topic || input.topic,
          difficulty: q.difficulty || input.difficulty,
          imageHint: q.imageHint,
        };
      }
      if (!q.options.includes(q.correctAnswer)) {
        console.warn("Resposta correta não está nas opções para a pergunta:", q.id);
        // Tenta corrigir, ou marca como inválida/usa a primeira opção
        return { ...q, correctAnswer: q.options[0] }; // Simples fallback
      }
      return q as GuessTheTextQuestionType;
    });
    
    return { questions: processedQuestions };
  }
);

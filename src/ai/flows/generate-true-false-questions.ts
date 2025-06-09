
'use server';
/**
 * @fileOverview Gera perguntas de Verdadeiro ou Falso sobre a Bíblia.
 *
 * - generateTrueFalseQuestions - Função que gera um conjunto de perguntas.
 * - GenerateTrueFalseQuestionsInput - O tipo de entrada.
 * - GenerateTrueFalseQuestionsOutput - O tipo de retorno.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import type { TrueFalseQuestionType } from '@/types';

// Esquema para a entrada da função
const GenerateTrueFalseQuestionsInputSchema = z.object({
  topic: z.string().describe('O tópico para as afirmações (ex: "Vida de Jesus", "Doutrinas", "Antigo Testamento"). "Bíblia em geral" para aleatório.'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('O nível de dificuldade das afirmações.'),
  numberOfQuestions: z.number().int().min(1).max(15).describe('O número de afirmações a serem geradas.'),
});
export type GenerateTrueFalseQuestionsInput = z.infer<typeof GenerateTrueFalseQuestionsInputSchema>;

// Esquema para cada pergunta individual gerada pela IA
const TrueFalseQuestionInternalSchema = z.object({
  id: z.string().describe('Um identificador único para a afirmação (ex: tf-q1-jesus-facil).'),
  statement: z.string().describe('Uma afirmação clara sobre um fato, personagem ou evento bíblico que pode ser classificada como verdadeira ou falsa, em português.'),
  correctAnswer: z.boolean().describe('Indica se a afirmação ("statement") é verdadeira (true) ou falsa (false).'), // Nomeado como correctAnswer para alinhar com TrueFalseQuestionType
  explanation: z.string().describe('Uma breve explicação (1-3 frases) em português do porquê a afirmação é verdadeira ou falsa, incluindo, se possível, uma referência bíblica relevante (ex: Gênesis 1:1 ou "Conforme Atos 2:1-4").'),
  topic: z.string().describe('O tópico da afirmação (deve ser o mesmo que o input "{{topic}}" ou um sub-tópico relevante se o input for "Bíblia em geral").'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('A dificuldade da afirmação (deve ser a mesma que o input "{{difficulty}}").'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave EM INGLÊS para gerar uma imagem relacionada ao tema da afirmação (ex: "moses tablets", "jesus walking water", "empty tomb"). Máximo de duas palavras.'),
});

// Esquema para a saída da função
const GenerateTrueFalseQuestionsOutputSchema = z.object({
  questions: z.array(TrueFalseQuestionInternalSchema).describe('Um array de objetos de afirmações para o jogo "Verdadeiro ou Falso?".'),
});
// Não exportamos este tipo interno diretamente, o tipo da função wrapper usará TrueFalseQuestionType[]
// export type GenerateTrueFalseQuestionsOutput = z.infer<typeof GenerateTrueFalseQuestionsOutputSchema>;


export async function generateTrueFalseQuestions(input: GenerateTrueFalseQuestionsInput): Promise<{ questions: TrueFalseQuestionType[] }> {
  return generateTrueFalseQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrueFalseBibleQuestionsPromptRevised',
  input: {schema: GenerateTrueFalseQuestionsInputSchema},
  output: {schema: GenerateTrueFalseQuestionsOutputSchema}, // A IA retorna correctAnswer como booleano
  prompt: `Você é um especialista em teologia e história bíblica, criando um jogo de Verdadeiro ou Falso.
Sua principal tarefa é gerar afirmações **NOVAS e ÚNICAS** para cada solicitação. **NÃO REPITA** afirmações que você possa ter gerado antes ou que sejam semelhantes a exemplos comuns. Priorize a originalidade e a variedade.

Gere EXATAMENTE {{numberOfQuestions}} afirmações sobre o tópico "{{topic}}" com dificuldade "{{difficulty}}".
Cada afirmação deve ser clara e inequívoca para ser classificada como Verdadeira ou Falsa.

Instruções de Dificuldade:
- Para 'fácil': Afirmações sobre fatos bíblicos **muito conhecidos e diretos**.
- Para 'médio': Afirmações que podem exigir um pouco mais de conhecimento detalhado ou sobre eventos/personagens menos centrais.
- Para 'difícil': Afirmações que envolvem detalhes mais obscuros, nuances de narrativas ou conexões menos óbvias, mas ainda factuais.

Para CADA uma das {{numberOfQuestions}} afirmações, forneça TODOS os seguintes campos:
1.  'id': Um identificador único (ex: "tf-q1-{{topic}}-{{difficulty}}").
2.  'statement': A afirmação em português.
3.  'correctAnswer': Um booleano (true se a afirmação for verdadeira, false se for falsa).
4.  'explanation': Uma breve explicação (1-3 frases) do porquê a afirmação é V ou F, idealmente citando uma referência bíblica como "segundo Gênesis 3:4" ou "conforme registrado em Atos 2:1-4".
5.  'topic': O tópico da afirmação (deve ser o mesmo que o input "{{topic}}").
6.  'difficulty': A dificuldade (deve ser a mesma que o input "{{difficulty}}").
7.  'imageHint': (Opcional, mas preferível) 1-2 palavras em INGLÊS para uma imagem.

Garanta que cada conjunto de afirmações gerado seja original e diverso.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado, onde o campo "questions" DEVE ser um array contendo EXATAMENTE {{numberOfQuestions}} objetos de pergunta.
Evite introduções, apenas o JSON.
A 'explanation' deve ser concisa e direta ao ponto.
`,
});

const generateTrueFalseQuestionsFlow = ai.defineFlow(
  {
    name: 'generateTrueFalseBibleQuestionsFlowRevised',
    inputSchema: GenerateTrueFalseQuestionsInputSchema,
    outputSchema: GenerateTrueFalseQuestionsOutputSchema, 
  },
  async (input: GenerateTrueFalseQuestionsInput): Promise<{ questions: TrueFalseQuestionType[] }> => {
    const {output: aiOutput} = await prompt(input);

    if (!aiOutput || !aiOutput.questions || !Array.isArray(aiOutput.questions)) {
      throw new Error(
        'A IA não retornou uma estrutura de resposta válida para Verdadeiro ou Falso (objeto esperado com uma propriedade "questions" do tipo array).'
      );
    }

    if (input.numberOfQuestions > 0 && aiOutput.questions.length === 0) {
      throw new Error(
        'A IA retornou uma lista de afirmações vazia para Verdadeiro ou Falso, embora fossem esperadas.'
      );
    }
    
    const processedQuestions: TrueFalseQuestionType[] = aiOutput.questions.map((q, index) => {
      if (!q.id || !q.statement || typeof q.correctAnswer !== 'boolean' || !q.explanation || !q.topic || !q.difficulty) {
        console.warn("Afirmação Verdadeiro/Falso da IA incompleta ou malformada no índice:", index, q);
        return {
          id: q.id || `invalid-tf-q${index + 1}-${Date.now()}`,
          statement: q.statement || "Afirmação inválida.",
          correctAnswer: typeof q.correctAnswer === 'boolean' ? q.correctAnswer : false,
          explanation: q.explanation || "Explicação indisponível.",
          topic: q.topic || input.topic,
          difficulty: q.difficulty || input.difficulty,
          imageHint: q.imageHint,
        };
      }
      // O schema da IA já usa 'correctAnswer', então não é necessário renomear.
      return q as TrueFalseQuestionType; 
    });
    
    return { questions: processedQuestions };
  }
);

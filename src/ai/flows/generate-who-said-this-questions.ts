
'use server';
/**
 * @fileOverview Gera perguntas para o jogo "Quem Disse Isso?".
 * O jogo apresenta uma citação bíblica, e o usuário deve
 * adivinhar qual personagem bíblico a proferiu.
 *
 * - generateWhoSaidThisQuestions - Função que gera um conjunto de perguntas.
 * - GenerateWhoSaidThisQuestionsInput - O tipo de entrada.
 * - GenerateWhoSaidThisQuestionsOutput - O tipo de retorno.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { WhoSaidThisQuestionType } from '@/types';

const GenerateWhoSaidThisQuestionsInputSchema = z.object({
  topic: z.string().describe('O tópico para as citações (ex: "Ensinos de Jesus", "Profetas Maiores", "Mulheres da Bíblia"). "Bíblia em geral" para aleatório.'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('O nível de dificuldade das perguntas.'),
  numberOfQuestions: z.number().int().min(1).max(10).describe('O número de perguntas a serem geradas (máximo 10 para este modo).'),
});
export type GenerateWhoSaidThisQuestionsInput = z.infer<typeof GenerateWhoSaidThisQuestionsInputSchema>;

const WhoSaidThisQuestionInternalSchema = z.object({
  id: z.string().describe('Um identificador único para a pergunta (ex: wst-q1-jesus-facil).'),
  quote: z.string().describe('Uma citação bíblica direta e significativa em português. Use a "Tradução do Novo Mundo das Escrituras Sagradas" se possível.'),
  options: z.array(z.string()).length(4).describe('Um array de 4 strings contendo nomes de personagens bíblicos como opções. Um deles deve ser quem proferiu a citação.'),
  correctCharacter: z.string().describe('O nome do personagem bíblico que realmente disse a citação (deve ser uma das opções).'),
  referenceForExplanation: z.string().describe('A referência bíblica exata da citação (ex: "João 14:6" ou "Salmos 23:1-2").'),
  contextForExplanation: z.string().describe('Uma frase curta em português que fornece um contexto sobre a citação para ajudar o flow de explicação (ex: "Jesus fala aos seus discípulos sobre o caminho ao Pai" ou "Davi expressa sua confiança em Deus como pastor").'),
  topic: z.string().describe('O tópico da pergunta (deve ser o mesmo que o input "{{topic}}" ou um sub-tópico relevante).'),
  difficulty: z.enum(['fácil', 'médio', 'difícil']).describe('A dificuldade da pergunta (deve ser a mesma que o input "{{difficulty}}").'),
  imageHint: z.string().optional().describe('Uma ou duas palavras-chave EM INGLÊS para gerar uma imagem relacionada à citação ou ao personagem (ex: "jesus teaching", "king david", "prophet isaiah"). Máximo de duas palavras.'),
});

const GenerateWhoSaidThisQuestionsOutputSchema = z.object({
  questions: z.array(WhoSaidThisQuestionInternalSchema).describe('Um array de objetos de perguntas para o jogo "Quem Disse Isso?".'),
});
export type GenerateWhoSaidThisQuestionsOutput = z.infer<typeof GenerateWhoSaidThisQuestionsOutputSchema>;


export async function generateWhoSaidThisQuestions(input: GenerateWhoSaidThisQuestionsInput): Promise<GenerateWhoSaidThisQuestionsOutput> {
  return generateWhoSaidThisQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWhoSaidThisQuestionsPromptTNM',
  input: {schema: GenerateWhoSaidThisQuestionsInputSchema},
  output: {schema: GenerateWhoSaidThisQuestionsOutputSchema},
  prompt: `Você é um erudito bíblico e historiador, preparando um jogo chamado "Quem Disse Isso?".
Sua principal tarefa é gerar perguntas **NOVAS e ÚNICAS** para cada solicitação. **NÃO REPITA** perguntas que você possa ter gerado antes ou que sejam semelhantes a exemplos comuns. Priorize a originalidade e a variedade.

Gere EXATAMENTE {{numberOfQuestions}} perguntas sobre o tópico "{{topic}}" com dificuldade "{{difficulty}}". Se o tópico for "Bíblia em geral", escolha citações de uma ampla variedade de personagens e livros.
Para cada pergunta, o usuário verá uma citação bíblica e deverá escolher qual personagem a disse entre 4 opções.

IMPORTANTE:
- Use preferencialmente a "Tradução do Novo Mundo das Escrituras Sagradas" para as citações.
- As citações ('quote') devem ser diretas e significativas. Podem ser um versículo ou um trecho curto e impactante.
- As opções de personagens ('options') devem incluir 1 correto e 3 incorretos, mas plausíveis para o contexto bíblico.
  - Para 'fácil': Citações de personagens **muito conhecidos** (ex: Jesus, Moisés, Davi, Paulo). As opções incorretas podem ser de personagens de épocas ou funções bíblicas bem diferentes, tornando a escolha mais clara.
  - Para 'médio': Citações de personagens conhecidos, mas talvez não as suas falas mais famosas. Opções incorretas podem ser contemporâneos ou personagens com papéis similares.
  - Para 'difícil': Citações menos óbvias, ou de personagens secundários importantes, ou até mesmo citações onde Deus fala através de um profeta (nesse caso, o profeta pode ser a resposta, ou Deus, dependendo do foco). Opções incorretas devem ser muito próximas em termos de contexto ou estilo.
- 'correctCharacter' deve ser uma das strings exatas das 'options'.
- 'referenceForExplanation' deve ser a referência bíblica precisa da citação.
- 'contextForExplanation' deve ser uma breve descrição do contexto em que a citação foi dita, para auxiliar em futuras explicações.
- O 'topic' e 'difficulty' no output devem corresponder ao input.
- O 'id' deve ser único e informativo (ex: wst-q1-{{topic}}-{{difficulty}}).
- 'imageHint' (opcional, mas preferível): 1-2 palavras em INGLÊS para uma imagem relacionada.

Para CADA uma das {{numberOfQuestions}} perguntas, forneça TODOS os seguintes campos:
1.  'id'
2.  'quote'
3.  'options' (array de 4 nomes de personagens)
4.  'correctCharacter' (um dos personagens das opções)
5.  'referenceForExplanation'
6.  'contextForExplanation'
7.  'topic'
8.  'difficulty'
9.  'imageHint'

Garanta que cada conjunto de perguntas gerado seja original e diverso.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado.
O campo "questions" DEVE ser um array contendo EXATAMENTE {{numberOfQuestions}} objetos de pergunta.
Evite introduções, apenas o JSON.
`,
});

const generateWhoSaidThisQuestionsFlow = ai.defineFlow(
  {
    name: 'generateWhoSaidThisQuestionsFlowTNM',
    inputSchema: GenerateWhoSaidThisQuestionsInputSchema,
    outputSchema: GenerateWhoSaidThisQuestionsOutputSchema,
  },
  async (input: GenerateWhoSaidThisQuestionsInput): Promise<GenerateWhoSaidThisQuestionsOutput> => {
    const {output: aiOutput} = await prompt(input);

    if (!aiOutput || !aiOutput.questions || !Array.isArray(aiOutput.questions)) {
      throw new Error(
        'A IA não retornou uma estrutura de resposta válida (objeto esperado com uma propriedade "questions" do tipo array).'
      );
    }
    
    if (input.numberOfQuestions > 0 && aiOutput.questions.length === 0) {
      throw new Error(
        'A IA retornou uma lista de perguntas vazia, embora perguntas fossem esperadas. Nenhuma pergunta gerada.'
      );
    }
    
    const processedQuestions: WhoSaidThisQuestionType[] = aiOutput.questions.map((q, index) => {
      if (!q.id || !q.quote || !q.options || q.options.length !== 4 || !q.correctCharacter || !q.referenceForExplanation || !q.contextForExplanation || !q.topic || !q.difficulty) {
        console.warn("Pergunta 'Quem Disse Isso?' da IA incompleta ou malformada no índice:", index, q);
        // Fornecer um fallback mais robusto, se possível
        return {
          id: q.id || `invalid-wst-q${index + 1}-${Date.now()}`,
          quote: q.quote || "Citação inválida.",
          options: q.options && q.options.length === 4 ? q.options : ["Jesus", "Moisés", "Davi", "Paulo"],
          correctCharacter: q.correctCharacter || (q.options && q.options.length > 0 ? q.options[0] : "Jesus"),
          referenceForExplanation: q.referenceForExplanation || "Referência desconhecida",
          contextForExplanation: q.contextForExplanation || "Contexto não fornecido.",
          topic: q.topic || input.topic,
          difficulty: q.difficulty || input.difficulty,
          imageHint: q.imageHint,
        };
      }
      if (!q.options.includes(q.correctCharacter)) {
        console.warn("Personagem correto não está nas opções para a pergunta:", q.id, "Usando a primeira opção como fallback.");
        return { ...q, correctCharacter: q.options[0] }; 
      }
      return q as WhoSaidThisQuestionType;
    });
    
    return { questions: processedQuestions };
  }
);

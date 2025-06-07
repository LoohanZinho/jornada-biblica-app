
'use server';

/**
 * @fileOverview Explica a resposta para uma pergunta de quiz bíblico, fornecendo contexto histórico,
 * uma explicação central e um versículo bíblico relevante, em português, preferencialmente da Tradução do Novo Mundo.
 *
 * - explainAnswer - Uma função que lida com o processo de explicação.
 * - ExplainAnswerInput - O tipo de entrada para a função explainAnswer.
 * - ExplainAnswerOutput - O tipo de retorno para a função explainAnswer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ExplainAnswerOutput as ExplainAnswerOutputType } from '@/types';


const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('A pergunta do quiz bíblico, em português.'),
  answer: z.string().describe('A resposta fornecida pelo usuário, em português.'),
  correctAnswer: z.string().describe('A resposta correta para a pergunta, em português.'),
  explanationContext: z.string().optional().describe('Contexto pré-definido para a pergunta, se disponível, para ajudar na explicação.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  briefContext: z.string().describe('Um contexto histórico ou narrativo um pouco mais detalhado sobre a questão, em português. Mantenha informativo e envolvente (2-4 frases).'),
  coreExplanation: z.string().describe('A explicação central da resposta correta, de forma clara e bem concisa, em português (1-2 frases no máximo).'),
  bibleVerseReference: z.string().describe('A referência bíblica relevante para a explicação (ex: Gênesis 1:1 ou Gênesis 1:1-3), em português. Escolha a referência mais precisa e relevante para a explicação.'),
  bibleVerseText: z.string().describe('O texto do(s) versículo(s) bíblico(s) correspondente(s) à referência, em português. Forneça o texto da "Tradução do Novo Mundo das Escrituras Sagradas" se possível. Se for um trecho, inclua o texto de todos os versículos referenciados, de forma concisa.'),
});
// Exporta o tipo inferido para uso externo, alinhado com o tipo em @/types
export type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;


export async function explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutputType> {
  const result = await explainAnswerFlow(input);
  // Assegura que o tipo de retorno está em conformidade com ExplainAnswerOutputType
  return result as ExplainAnswerOutputType;
}

const prompt = ai.definePrompt({
  name: 'explainAnswerDetailsPromptPortugueseTNM',
  input: {schema: ExplainAnswerInputSchema},
  output: {schema: ExplainAnswerOutputSchema},
  prompt: `Você é um teólogo e historiador bíblico experiente, fornecendo explicações claras e envolventes.
Um usuário respondeu a uma pergunta do quiz. Sua tarefa é fornecer uma explicação enriquecedora sobre a resposta correta.

Pergunta: {{{question}}}
Resposta do Usuário: {{{answer}}}
Resposta Correta: {{{correctAnswer}}}
{{#if explanationContext}}
Contexto Adicional Fornecido: {{{explanationContext}}}
{{/if}}

Por favor, forneça as seguintes informações em português:
1.  'briefContext': Forneça um contexto histórico ou narrativo um pouco mais detalhado e interessante sobre a questão. Este deve ser o foco principal, um pouco mais longo que a explicação (idealmente 2-4 frases).
2.  'coreExplanation': Uma explicação central BEM CURTA e direta da resposta correta (idealmente 1-2 frases curtas).
3.  'bibleVerseReference': A referência bíblica MAIS RELEVANTE E PRECISA para a explicação. Pode ser um único versículo (ex: João 3:16) ou um pequeno trecho de versículos consecutivos (ex: Gênesis 1:1-3 ou 1 Samuel 17:45-47) se isso for essencial para entender o contexto da história relacionada à pergunta. Priorize a relevância e a concisão.
4.  'bibleVerseText': O texto completo do(s) versículo(s) bíblico(s) correspondente(s) à referência fornecida. MUITO IMPORTANTE: Use o texto da "Tradução do Novo Mundo das Escrituras Sagradas". Certifique-se de que o texto corresponda exatamente à referência e à tradução solicitada. Se for um trecho, inclua todo o texto do trecho, mas mantenha-o conciso.

Seja direto e evite introduções desnecessárias. O foco é fornecer valor rapidamente, com um contexto mais rico.
Certifique-se de que a passagem bíblica escolhida seja diretamente relevante para a pergunta e a resposta correta.
Formate a saída como um objeto JSON que corresponda ao schema de saída especificado.
`,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerDetailsFlowPortugueseTNM',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.briefContext || !output.coreExplanation || !output.bibleVerseReference || !output.bibleVerseText) {
        throw new Error('A IA não conseguiu gerar uma explicação detalhada com todos os campos necessários.');
    }
    return output;
  }
);

    

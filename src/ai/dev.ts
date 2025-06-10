
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-prayer.ts';
import '@/ai/flows/explain-answer.ts';
import '@/ai/flows/generate-image-from-question.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/generate-guess-the-text-questions.ts';
import '@/ai/flows/generate-who-said-this-questions.ts';
import '@/ai/flows/generate-true-false-questions.ts'; // Novo fluxo adicionado
import '@/ai/flows/generate-daily-verse-commentary.ts'; // Novo fluxo para comentários do versículo
    

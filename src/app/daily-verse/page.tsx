
import { getRandomVerse } from '@/lib/dailyVerses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import type { DailyVerse as DailyVerseType } from '@/types';
import { DailyVerseImage } from '@/components/daily-verse/DailyVerseImage';

export default function DailyVersePage() {
  const verse: DailyVerseType = getRandomVerse();
  const imagePrompt = verse.theme || verse.text.substring(0, 100) + (verse.text.length > 100 ? "..." : "");
  // Prioriza o tema para o hint, senão a primeira palavra da referência, senão um genérico.
  const imageHintForPlaceholder = verse.theme?.toLowerCase().split(' ')[0] || verse.reference.split(' ')[0].toLowerCase() || "scripture";


  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <BookOpenCheck className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-headline">Versículo para Reflexão</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Medite nesta passagem hoje.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <DailyVerseImage
            prompt={imagePrompt}
            altText={`Ilustração para o versículo: ${verse.reference}`}
            imageHint={imageHintForPlaceholder}
          />
          <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground mb-4 italic px-4 py-6 bg-secondary/50 rounded-md border-l-4 border-primary">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
          <p className="text-lg font-semibold text-primary">{verse.reference}</p>
          {verse.theme && (
            <p className="text-sm text-muted-foreground mt-2">Tema: {verse.theme}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import { getRandomVerse } from '@/lib/dailyVerses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenText, MessageCircle, AlertTriangle } from 'lucide-react';
import type { DailyVerse as DailyVerseType } from '@/types';
import { DailyVerseImage } from '@/components/daily-verse/DailyVerseImage';
import { Separator } from '@/components/ui/separator';
import { generateDailyVerseCommentary } from '@/ai/flows/generate-daily-verse-commentary';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

async function getVerseAndCommentary() {
  const verse: DailyVerseType = getRandomVerse();
  let commentary: string | null = null;
  let commentaryError: string | null = null;

  try {
    const commentaryResponse = await generateDailyVerseCommentary({
      verseText: verse.text,
      verseReference: verse.reference,
    });
    commentary = commentaryResponse.commentary;
  } catch (error) {
    console.error("Erro ao gerar comentário para o versículo diário:", error);
    commentaryError = "Não foi possível carregar o comentário para este versículo no momento.";
  }
  return { verse, commentary, commentaryError };
}

export default async function DailyVersePage() {
  const { verse, commentary, commentaryError } = await getVerseAndCommentary();
  
  const imagePrompt = verse.theme || verse.text.substring(0, 100) + (verse.text.length > 100 ? "..." : "");
  const imageHintForPlaceholder = verse.theme?.toLowerCase().split(' ')[0] || verse.reference.split(' ')[0].toLowerCase() || "scripture";

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 animate-fade-in">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <BookOpenText className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-headline">Examinando as Escrituras Diariamente</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Uma passagem para guiar e inspirar seu dia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <DailyVerseImage
            prompt={imagePrompt}
            altText={`Ilustração para o versículo: ${verse.reference}`}
            imageHint={imageHintForPlaceholder}
          />

          <div className="space-y-3 pt-4">
            <h2 className="text-2xl font-semibold text-primary text-center font-headline">A Palavra de Hoje</h2>
            <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground italic px-6 py-4 bg-secondary/40 rounded-lg border-l-4 border-primary shadow-sm">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <p className="text-right text-lg font-medium text-primary/90 pr-2">{verse.reference}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Reflexão Sobre o Versículo
            </h3>
            {verse.theme && (
              <p className="text-foreground/90 font-body text-sm">
                <strong className="font-semibold">Tema principal:</strong> {verse.theme}
              </p>
            )}
            
            {commentary && (
              <p className="text-foreground/90 font-body leading-relaxed text-sm p-4 bg-muted/50 rounded-md shadow-sm">
                {commentary}
              </p>
            )}
            {commentaryError && (
              <div className="p-4 bg-destructive/10 rounded-md text-destructive flex items-center gap-2 text-sm">
                <AlertTriangle className="h-5 w-5" />
                {commentaryError}
              </div>
            )}
            {!commentary && !commentaryError && (
              <div className="p-4 bg-muted/50 rounded-md text-sm">
                <LoadingIndicator text="Gerando reflexão..." />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

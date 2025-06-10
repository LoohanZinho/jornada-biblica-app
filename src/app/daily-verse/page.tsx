
import { getRandomVerse } from '@/lib/dailyVerses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenText, MessageCircle } from 'lucide-react';
import type { DailyVerse as DailyVerseType } from '@/types';
import { DailyVerseImage } from '@/components/daily-verse/DailyVerseImage';
import { Separator } from '@/components/ui/separator';

export default function DailyVersePage() {
  const verse: DailyVerseType = getRandomVerse();
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
              <p className="text-foreground/90 font-body">
                <strong className="font-semibold">Tema principal:</strong> {verse.theme}
              </p>
            )}
            <p className="text-muted-foreground text-sm font-body leading-relaxed">
              Medite sobre como este versículo se aplica à sua vida hoje.
              Esta seção será enriquecida no futuro com comentários detalhados, contexto histórico
              e conexões com outras passagens bíblicas relevantes para aprofundar seu entendimento.
            </p>
            {/*
              TODO: No futuro, integrar IA aqui para gerar:
              - Explicação mais detalhada do versículo.
              - Contexto histórico e cultural.
              - Referências a outros versículos relacionados.
              - Aplicações práticas.
            */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

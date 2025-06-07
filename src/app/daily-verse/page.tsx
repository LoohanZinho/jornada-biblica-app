import { dailyVerses, getRandomVerse } from '@/lib/dailyVerses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import type { DailyVerse } from '@/types';

// This component will be a server component, so we can fetch data directly.
// For a truly "daily" verse, logic to pick one based on date would be needed.
// For now, we'll pick one randomly or the first one.

export default function DailyVersePage() {
  // In a real app, you might fetch this or have logic for "today's verse"
  // const verse: DailyVerse = dailyVerses[0]; // Simplistic: always shows the first verse
  const verse: DailyVerse = getRandomVerse();


  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <BookOpenCheck className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-headline">Verse for Reflection</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Meditate on this passage today.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground mb-4 italic px-4 py-6 bg-secondary/50 rounded-md border-l-4 border-primary">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
          <p className="text-lg font-semibold text-primary">{verse.reference}</p>
          {verse.theme && (
            <p className="text-sm text-muted-foreground mt-2">Theme: {verse.theme}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

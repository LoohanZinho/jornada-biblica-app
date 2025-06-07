
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ListChecks, BookOpenText, Map, Award, HeartHandshake, Bird } from 'lucide-react';
import Image from 'next/image';

const featureCards = [
  {
    title: 'Interactive Quiz',
    description: 'Test your knowledge with engaging biblical questions.',
    href: '/quiz',
    icon: <ListChecks className="h-10 w-10 text-primary mb-4" />,
    cta: 'Start Quiz',
  },
  {
    title: 'Daily Verse',
    description: 'Receive a new insightful verse each day for reflection.',
    href: '/daily-verse',
    icon: <BookOpenText className="h-10 w-10 text-primary mb-4" />,
    cta: 'View Verse',
  },
  {
    title: 'Virtual Tours',
    description: 'Explore reconstructions of biblical locations (Coming Soon).',
    href: '/tours',
    icon: <Map className="h-10 w-10 text-primary mb-4" />,
    cta: 'Explore Tours',
  },
   {
    title: 'Personalized Prayers',
    description: 'Generate prayers based on your spiritual journey.',
    href: '/quiz', // Prayer generation is part of quiz results for now
    icon: <HeartHandshake className="h-10 w-10 text-primary mb-4" />,
    cta: 'Discover Prayers',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center space-y-12 animate-fade-in">
      <section className="text-center py-12 md:py-20 w-full bg-card rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <Bird className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Welcome to Biblical Quest
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Embark on an enriching journey through the scriptures. Test your knowledge, discover daily wisdom, and deepen your understanding of biblical history.
          </p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/quiz">Begin Your Quest <Award className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      <section className="w-full">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary/90">Explore Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {featureCards.map((card) => (
            <Card key={card.title} className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col animate-slide-in-from-bottom" style={{animationDelay: `${featureCards.indexOf(card) * 100}ms`}}>
              <CardHeader className="items-center text-center">
                {card.icon}
                <CardTitle className="text-2xl font-headline">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow items-center text-center">
                <CardDescription className="mb-6 text-base flex-grow">{card.description}</CardDescription>
                <Button asChild variant={card.title === 'Virtual Tours' ? 'outline' : 'default'} className="w-full mt-auto">
                  <Link href={card.href}>{card.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="w-full py-12 text-center">
         <Image 
            src="https://placehold.co/800x300.png" 
            alt="Biblical Landscape" 
            width={800} 
            height={300}
            className="rounded-lg shadow-lg mx-auto"
            data-ai-hint="landscape bible"
          />
          <p className="text-md text-muted-foreground mt-6 max-w-xl mx-auto">
            "Your word is a lamp to my feet and a light to my path." - Psalm 119:105
          </p>
      </section>
    </div>
  );
}

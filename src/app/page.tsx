
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ListChecks, BookOpenText, Map, Award, HeartHandshake, Bird } from 'lucide-react';
import Image from 'next/image';

const featureCards = [
  {
    title: 'Quiz Interativo',
    description: 'Teste seu conhecimento com perguntas bíblicas envolventes.',
    href: '/quiz',
    icon: <ListChecks className="h-10 w-10 text-primary mb-4" />,
    cta: 'Começar Quiz',
  },
  {
    title: 'Versículo do Dia',
    description: 'Receba um novo versículo inspirador a cada dia para reflexão.',
    href: '/daily-verse',
    icon: <BookOpenText className="h-10 w-10 text-primary mb-4" />,
    cta: 'Ver Versículo',
  },
  {
    title: 'Passeios Virtuais',
    description: 'Explore reconstruções de locais bíblicos (Em Breve).',
    href: '/tours',
    icon: <Map className="h-10 w-10 text-primary mb-4" />,
    cta: 'Explorar Passeios',
  },
   {
    title: 'Orações Personalizadas',
    description: 'Gere orações baseadas em sua jornada espiritual.',
    href: '/quiz', 
    icon: <HeartHandshake className="h-10 w-10 text-primary mb-4" />,
    cta: 'Descobrir Orações',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center space-y-12 animate-fade-in">
      <section className="text-center py-12 md:py-20 w-full bg-card rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <Bird className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Bem-vindo à Jornada Bíblica
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Embarque em uma jornada enriquecedora pelas escrituras. Teste seus conhecimentos, descubra sabedoria diária e aprofunde seu entendimento da história bíblica.
          </p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/quiz">Comece sua Jornada <Award className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      <section className="w-full">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary/90">Explore os Recursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {featureCards.map((card, index) => (
            <Card key={card.title} className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col animate-slide-in-from-bottom" style={{animationDelay: `${index * 100}ms`}}>
              <CardHeader className="items-center text-center">
                {card.icon}
                <CardTitle className="text-2xl font-headline">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow items-center text-center">
                <CardDescription className="mb-6 text-base flex-grow">{card.description}</CardDescription>
                <Button asChild variant={card.title === 'Passeios Virtuais' ? 'outline' : 'default'} className="w-full mt-auto">
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
            alt="Paisagem Bíblica"
            width={800}
            height={300}
            className="rounded-lg shadow-lg mx-auto"
            data-ai-hint="landscape bible"
          />
          <p className="text-md text-muted-foreground mt-6 max-w-xl mx-auto">
            "Lâmpada para os meus pés é tua palavra e, luz para o meu caminho." - Salmos 119:105
          </p>
      </section>
    </div>
  );
}

    
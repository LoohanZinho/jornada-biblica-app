
import { getTourBySlug, virtualToursData } from '@/lib/toursData';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Landmark, BookOpen, Construction } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TourDetailPageProps {
  params: {
    slug: string;
  };
}

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const tour = getTourBySlug(params.slug);

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
        <MapPin className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Passeio Não Encontrado</h1>
        <p className="text-lg text-muted-foreground mb-8">
          O passeio que você está procurando não existe ou foi movido.
        </p>
        <Button asChild>
          <Link href="/tours">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para Todos os Passeios
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-8 space-y-8">
      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href="/tours">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Todos os Passeios
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="p-0">
          <div className="aspect-[16/7] relative w-full">
            <Image
              src={tour.imagePlaceholderUrl}
              alt={`Imagem principal para ${tour.title}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={tour.imageHint}
              priority
            />
          </div>
          <div className="p-6">
            <CardTitle className="text-4xl font-headline text-primary mb-2">{tour.title}</CardTitle>
            <CardDescription className="text-lg text-foreground/80">{tour.shortDescription}</CardDescription>
            {tour.status === 'em breve' && (
              <Badge variant="outline" className="mt-2 text-amber-600 border-amber-500">
                <Construction className="mr-2 h-4 w-4" />
                Experiência Interativa em Breve
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Separator />
          <div>
            <h2 className="text-2xl font-semibold font-headline text-primary/90 mb-3">Sobre este Passeio</h2>
            <p className="text-base leading-relaxed whitespace-pre-line text-foreground/90">
              {tour.longDescription}
            </p>
          </div>

          {tour.mainAttractions && tour.mainAttractions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold font-headline text-primary/80 mb-2 flex items-center">
                <Landmark className="mr-2 h-5 w-5" />
                Principais Pontos de Interesse
              </h3>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                {tour.mainAttractions.map((attraction, index) => (
                  <li key={index}>{attraction}</li>
                ))}
              </ul>
            </div>
          )}

          {tour.historicalContext && (
             <div>
              <h3 className="text-xl font-semibold font-headline text-primary/80 mb-2">Contexto Histórico</h3>
              <p className="text-base leading-relaxed text-foreground/80">{tour.historicalContext}</p>
            </div>
          )}
          
          {tour.relatedScriptures && tour.relatedScriptures.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold font-headline text-primary/80 mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Escrituras Relacionadas
              </h3>
              <ul className="space-y-1">
                {tour.relatedScriptures.map((scripture, index) => (
                  <li key={index} className="text-sm text-accent hover:underline">
                    {/* Idealmente, isso poderia ser um link para uma Bíblia online ou uma seção no app */}
                    {scripture}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {tour.status === 'disponível' && (
            <div className="mt-8 p-4 bg-secondary/50 rounded-md text-center">
                <Construction className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="text-md text-foreground/90">
                    oque falta para completar isso?
                </p>
            </div>
           )}

        </CardContent>
      </Card>
    </div>
  );
}

// Generate static paths for all tours
export async function generateStaticParams() {
  const tours = virtualToursData;
  return tours.map((tour) => ({
    slug: tour.slug,
  }));
}

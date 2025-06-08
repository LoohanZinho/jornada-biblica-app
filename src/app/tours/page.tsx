
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { virtualToursData } from '@/lib/toursData';
import { MapPinned, Eye } from 'lucide-react';

export default function VirtualToursPage() {
  const availableTours = virtualToursData.filter(tour => tour.status === 'disponível');
  const upcomingTours = virtualToursData.filter(tour => tour.status === 'em breve');

  return (
    <div className="animate-fade-in space-y-12 py-8">
      <section className="text-center">
        <MapPinned className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">Passeios Bíblicos Virtuais</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Explore reconstruções de locais bíblicos significativos, trazendo a história à vida como nunca antes.
        </p>
      </section>

      {availableTours.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-primary/90 mb-8 font-headline">Passeios Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableTours.map((tour, index) => (
              <Card key={tour.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-from-bottom" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader>
                  <div className="aspect-video relative w-full mb-4 rounded-t-lg overflow-hidden">
                    <Image
                      src={tour.imagePlaceholderUrl}
                      alt={`Imagem para ${tour.title}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={tour.imageHint}
                    />
                  </div>
                  <CardTitle className="text-2xl font-headline">{tour.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-base">{tour.shortDescription}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/tours/${tour.slug}`}>
                      <Eye className="mr-2 h-5 w-5" />
                      Explorar Passeio
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {upcomingTours.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-primary/90 mb-8 mt-16 font-headline">Em Breve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingTours.map((tour, index) => (
              <Card key={tour.id} className="flex flex-col shadow-md opacity-70 animate-slide-in-from-bottom" style={{animationDelay: `${(availableTours.length + index) * 100}ms`}}>
                <CardHeader>
                   <div className="aspect-video relative w-full mb-4 rounded-t-lg overflow-hidden">
                    <Image
                      src={tour.imagePlaceholderUrl}
                      alt={`Imagem para ${tour.title}`}
                      layout="fill"
                      objectFit="cover"
                      className="grayscale"
                      data-ai-hint={tour.imageHint}
                    />
                  </div>
                  <CardTitle className="text-2xl font-headline">{tour.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-base">{tour.shortDescription}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button disabled className="w-full" variant="outline">
                    Em Breve
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {availableTours.length === 0 && upcomingTours.length === 0 && (
         <section className="text-center py-10">
            <p className="text-xl text-muted-foreground">Nenhum passeio virtual cadastrado no momento. Volte em breve!</p>
        </section>
      )}
    </div>
  );
}

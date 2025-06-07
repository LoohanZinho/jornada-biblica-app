
import { MapPinned } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VirtualToursPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <MapPinned className="h-20 w-20 text-primary mx-auto mb-6" />
          <CardTitle className="text-4xl font-headline text-primary">Passeios Bíblicos Virtuais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-foreground/80 mb-4">
            Este recurso emocionante está atualmente em desenvolvimento.
          </p>
          <p className="text-md text-muted-foreground">
            Em breve, você poderá explorar reconstruções virtuais de locais bíblicos significativos, trazendo a história à vida como nunca antes. Fique atento às atualizações!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    
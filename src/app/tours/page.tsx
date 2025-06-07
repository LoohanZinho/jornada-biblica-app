import { MapPinned } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VirtualToursPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <MapPinned className="h-20 w-20 text-primary mx-auto mb-6" />
          <CardTitle className="text-4xl font-headline text-primary">Virtual Biblical Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-foreground/80 mb-4">
            This exciting feature is currently under development.
          </p>
          <p className="text-md text-muted-foreground">
            Soon, you'll be able to explore virtual reconstructions of significant biblical locations, bringing history to life like never before. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

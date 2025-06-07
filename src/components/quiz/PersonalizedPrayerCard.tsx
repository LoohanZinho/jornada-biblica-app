
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generatePersonalizedPrayer } from '@/ai/flows/generate-personalized-prayer'; 
import type { GeneratePersonalizedPrayerInput } from '@/ai/flows/generate-personalized-prayer';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useToast } from "@/hooks/use-toast";
import { HeartHandshake, RefreshCw } from 'lucide-react';

interface PersonalizedPrayerCardProps {
  quizPerformanceSummary: string; 
  areasOfInterest: string; 
}

export function PersonalizedPrayerCard({ quizPerformanceSummary, areasOfInterest }: PersonalizedPrayerCardProps) {
  const [prayer, setPrayer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePrayer = async () => {
    setIsLoading(true);
    setPrayer(null);
    try {
      const input: GeneratePersonalizedPrayerInput = {
        quizPerformanceSummary,
        areasOfInterest,
      };
      const response = await generatePersonalizedPrayer(input);
      setPrayer(response.prayer);
    } catch (error) {
      console.error("Erro ao gerar oração:", error);
      toast({
        title: "Falha na Geração da Oração",
        description: "Não foi possível gerar uma oração no momento. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl animate-fade-in">
      <CardHeader className="text-center">
        <HeartHandshake className="h-12 w-12 text-primary mx-auto mb-3" />
        <CardTitle className="text-2xl font-headline">Reflexão Personalizada</CardTitle>
        <CardDescription>
          Receba uma oração ou reflexão personalizada baseada na sua jornada no quiz.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && <LoadingIndicator text="Criando sua reflexão..." />}
        {!isLoading && prayer && (
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-background shadow-inner">
            <p className="text-sm whitespace-pre-wrap font-body leading-relaxed">{prayer}</p>
          </ScrollArea>
        )}
        {!isLoading && !prayer && (
          <p className="text-center text-muted-foreground">Clique no botão abaixo para gerar uma reflexão personalizada.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleGeneratePrayer} disabled={isLoading} className="w-full sm:flex-1">
          {isLoading ? <LoadingIndicator size={16} /> : (prayer ? "Gerar Outra" : "Gerar Reflexão")}
          {!isLoading && <RefreshCw className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

    
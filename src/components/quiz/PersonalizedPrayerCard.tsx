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
  areasOfInterest: string; // Could be a comma-separated string or a general description
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
      console.error("Error generating prayer:", error);
      toast({
        title: "Prayer Generation Failed",
        description: "Could not generate a prayer at this time. Please try again.",
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
        <CardTitle className="text-2xl font-headline">Personalized Reflection</CardTitle>
        <CardDescription>
          Receive a personalized prayer or reflection based on your quiz journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && <LoadingIndicator text="Crafting your reflection..." />}
        {!isLoading && prayer && (
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-background shadow-inner">
            <p className="text-sm whitespace-pre-wrap font-body leading-relaxed">{prayer}</p>
          </ScrollArea>
        )}
        {!isLoading && !prayer && (
          <p className="text-center text-muted-foreground">Click the button below to generate a personalized reflection.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleGeneratePrayer} disabled={isLoading} className="w-full sm:flex-1">
          {isLoading ? <LoadingIndicator size={16} /> : (prayer ? "Generate Another" : "Generate Reflection")}
          {!isLoading && <RefreshCw className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

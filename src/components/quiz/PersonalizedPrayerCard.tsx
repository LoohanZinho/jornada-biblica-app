
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
import { useUser } from '@/hooks/useUser';
import { canUseFeature, recordFeatureUsage, getFeatureLimitConfig, USER_PLANS_CONFIG } from '@/lib/usageLimits';
import { useRouter } from 'next/navigation';

interface PersonalizedPrayerCardProps {
  quizPerformanceSummary: string;
  areasOfInterest: string;
}

export function PersonalizedPrayerCard({ quizPerformanceSummary, areasOfInterest }: PersonalizedPrayerCardProps) {
  const [prayer, setPrayer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: isLoadingUser } = useUser();
  const router = useRouter();

  const handleGeneratePrayer = async () => {
    if (isLoadingUser) return; // Aguarda o carregamento do usuário

    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para gerar uma reflexão personalizada.",
        variant: "destructive",
      });
      router.push('/login?next=/quiz/results'); // ou outra página relevante
      return;
    }

    const userPlan = user.app_metadata.plan || 'free';
    const limitConfig = getFeatureLimitConfig(userPlan, 'personalizedPrayer');

    if (limitConfig) {
      if (!canUseFeature(user.id, 'personalizedPrayer', limitConfig.limit, limitConfig.period)) {
        toast({
          title: `Limite de Reflexões Atingido`,
          description: `Você atingiu o limite de ${limitConfig.limit} reflex${limitConfig.limit > 1 ? 'ões' : 'ão'} por ${limitConfig.period === 'daily' ? 'dia' : 'semana'} para o plano ${USER_PLANS_CONFIG[userPlan]?.name || userPlan}. Considere fazer um upgrade!`,
          variant: "destructive",
          duration: 7000,
          action: (
            <Button onClick={() => router.push('/planos')} size="sm">
              Ver Planos
            </Button>
          ),
        });
        return;
      }
    }

    setIsLoading(true);
    setPrayer(null);
    try {
      const input: GeneratePersonalizedPrayerInput = {
        quizPerformanceSummary,
        areasOfInterest,
      };
      const response = await generatePersonalizedPrayer(input);
      setPrayer(response.prayer);
      if (limitConfig && user) {
        recordFeatureUsage(user.id, 'personalizedPrayer', limitConfig.period);
      }
    } catch (error) {
      console.error("Erro ao gerar oração:", error);
      toast({
        title: "Falha na Geração da Reflexão",
        description: (error as Error).message || "Não foi possível gerar uma reflexão no momento. Por favor, tente novamente.",
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
        <Button onClick={handleGeneratePrayer} disabled={isLoading || isLoadingUser} className="w-full sm:flex-1">
          {isLoading ? <LoadingIndicator size={16} /> : (prayer ? "Gerar Outra" : "Gerar Reflexão")}
          {!isLoading && <RefreshCw className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

    
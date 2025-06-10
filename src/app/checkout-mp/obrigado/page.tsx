
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Gift, Award, Info } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planName, setPlanName] = useState<string | null>(null);
  const [planPrice, setPlanPrice] = useState<string | null>(null);
  const [isLoadingParams, setIsLoadingParams] = useState(true);

  useEffect(() => {
    const name = searchParams.get('planName');
    const price = searchParams.get('planPrice');
    
    if (name) setPlanName(name);
    if (price) setPlanPrice(price);
    
    setIsLoadingParams(false);
  }, [searchParams]);

  if (isLoadingParams) {
    return <LoadingIndicator text="Carregando detalhes da sua assinatura..." className="py-20" />;
  }

  if (!planName) {
    return (
      <Card className="w-full max-w-lg text-center shadow-xl animate-fade-in">
        <CardHeader>
          <Info className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-headline">Detalhes Não Encontrados</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Não conseguimos encontrar os detalhes do seu plano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">
            Por favor, verifique o link ou tente refazer o processo.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/')} className="text-sm">
            <Home className="mr-2 h-5 w-5" /> Voltar para a Página Inicial
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const isFreePlan = parseFloat(planPrice || "0") === 0;

  return (
    <Card className="w-full max-w-lg text-center shadow-xl animate-fade-in">
      <CardHeader>
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
        <CardTitle className="text-3xl md:text-4xl font-headline">
            {isFreePlan ? "Acesso Confirmado!" : "Assinatura Confirmada!"}
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          {isFreePlan ? `Obrigado por se juntar à Jornada Bíblica com o plano ${planName}!` : `Obrigado por assinar o plano ${planName}!`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-secondary/50 rounded-md">
          <h3 className="text-xl font-semibold text-primary">{planName}</h3>
          {!isFreePlan && planPrice && (
            <p className="text-lg text-foreground/80">
              Valor: R$ {parseFloat(planPrice).toFixed(2).replace('.', ',')}
            </p>
          )}
           {isFreePlan && (
            <p className="text-lg text-foreground/80">
              Acesso Gratuito
            </p>
          )}
        </div>
        
        <p className="text-foreground/90">
          {isFreePlan 
            ? "Você já pode começar a explorar os recursos disponíveis para o seu plano." 
            : "Seu pagamento foi processado com sucesso e sua assinatura está ativa. Explore todos os benefícios do seu novo plano!"}
        </p>
        
        {/* Adicionar lista de benefícios aqui se desejar */}

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="w-full sm:w-auto" size="lg">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" /> Voltar ao Início
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
          <Link href="/quiz"> 
            <Award className="mr-2 h-5 w-5" /> Começar um Quiz
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutObrigadoPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] py-12">
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingIndicator text="Carregando..." /></div>}>
          <ThankYouContent />
        </Suspense>
      </div>
    );
}

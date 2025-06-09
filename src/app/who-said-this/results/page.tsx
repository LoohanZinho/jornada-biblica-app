
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, CheckCircle2, Home, XCircle, RotateCcwIcon } from 'lucide-react';
import type { WhoSaidThisResultType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

interface StoredWhoSaidThisResults {
  score: number;
  totalQuestions: number;
  results: WhoSaidThisResultType[];
  topic: string; 
}

export default function WhoSaidThisResultsPage() {
  const router = useRouter();
  const [storedResults, setStoredResults] = useState<StoredWhoSaidThisResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsString = localStorage.getItem('whoSaidThisResults');
    if (resultsString) {
      try {
        const parsedResults = JSON.parse(resultsString) as StoredWhoSaidThisResults;
        setStoredResults(parsedResults);
      } catch (error) {
        console.error("Falha ao analisar os resultados do jogo 'Quem Disse Isso?' do localStorage", error);
        router.push('/who-said-this'); 
      }
    } else {
      // Se não houver resultados, redireciona para a página de setup do jogo
      router.push('/who-said-this'); 
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !storedResults) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Carregando resultados..." size={48} />
      </div>
    );
  }

  const { score, totalQuestions, results, topic } = storedResults;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let performanceMessage = "Continue estudando as Escrituras! A familiaridade com as vozes bíblicas é uma jornada.";
  if (percentage >= 80) {
    performanceMessage = "Impressionante! Você conhece muito bem quem disse o quê na Bíblia.";
  } else if (percentage >= 50) {
    performanceMessage = "Muito bom! Você está no caminho certo para identificar os personagens por suas palavras.";
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-8 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl text-center">
        <CardHeader>
          <Quote className="h-20 w-20 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-headline">Desafio "Quem Disse Isso?" Concluído!</CardTitle>
          <CardDescription className="text-lg">{performanceMessage} (Tópico: {topic})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold text-accent">
            {score} / {totalQuestions}
          </p>
          <p className="text-2xl text-primary">{percentage}% Corretas</p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 font-headline">Resumo das Citações:</h3>
            <ScrollArea className="h-[250px] border rounded-md p-4 text-left bg-secondary/30">
              {results.map((result, index) => (
                <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                  <blockquote className="font-medium text-sm text-foreground/90 italic mb-1">
                    &ldquo;{result.quote}&rdquo;
                    <footer className="text-xs not-italic text-primary/80 mt-0.5 block">{result.reference}</footer>
                  </blockquote>
                  <p className={`text-xs ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    Sua resposta: {result.selectedCharacter} 
                    {result.isCorrect ? <CheckCircle2 className="inline ml-1 h-3 w-3" /> : <XCircle className="inline ml-1 h-3 w-3" />}
                  </p>
                  {!result.isCorrect && <p className="text-xs text-muted-foreground">Resposta correta: {result.correctCharacter}</p>}
                </div>
              ))}
            </ScrollArea>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/who-said-this"><RotateCcwIcon className="mr-2 h-4 w-4" />Jogar Novamente</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/"><Home className="mr-2 h-4 w-4" />Voltar ao Início</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

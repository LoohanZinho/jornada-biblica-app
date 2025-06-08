
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareQuote, CheckCircle2, Home, XCircle } from 'lucide-react';
import type { GuessTheTextResult } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

interface StoredResults {
  score: number;
  totalQuestions: number;
  results: GuessTheTextResult[];
  topic: string; 
}

export default function GuessTheTextResultsPage() {
  const router = useRouter();
  const [storedResults, setStoredResults] = useState<StoredResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsString = localStorage.getItem('guessTheTextResults');
    if (resultsString) {
      try {
        const parsedResults = JSON.parse(resultsString) as StoredResults;
        setStoredResults(parsedResults);
      } catch (error) {
        console.error("Falha ao analisar os resultados do jogo 'Qual é o Texto?' do localStorage", error);
        router.push('/guess-the-text'); 
      }
    } else {
      router.push('/guess-the-text'); 
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

  const { score, totalQuestions, results } = storedResults;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let performanceMessage = "Continue praticando! A familiaridade com os textos vem com o tempo.";
  if (percentage >= 80) {
    performanceMessage = "Excelente! Você conhece bem as passagens bíblicas.";
  } else if (percentage >= 50) {
    performanceMessage = "Muito bom! Você está no caminho certo para dominar os textos.";
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-8 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl text-center">
        <CardHeader>
          <MessageSquareQuote className="h-20 w-20 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-headline">Desafio Concluído!</CardTitle>
          <CardDescription className="text-lg">{performanceMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold text-accent">
            {score} / {totalQuestions}
          </p>
          <p className="text-2xl text-primary">{percentage}% Corretas</p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 font-headline">Seus Desafios:</h3>
            <ScrollArea className="h-[250px] border rounded-md p-4 text-left bg-secondary/30">
              {results.map((result, index) => (
                <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                  <p className="font-medium text-sm text-foreground/90 italic">&ldquo;{result.textSnippet}&rdquo;</p>
                  <p className={`text-xs ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    Sua resposta: {result.selectedAnswer} 
                    {result.isCorrect ? <CheckCircle2 className="inline ml-1 h-3 w-3" /> : <XCircle className="inline ml-1 h-3 w-3" />}
                  </p>
                  {!result.isCorrect && <p className="text-xs text-muted-foreground">Correta: {result.correctAnswer}</p>}
                   <p className="text-xs text-muted-foreground mt-1">Texto completo: <span className="italic">{result.fullText.substring(0,100)}...</span></p>
                </div>
              ))}
            </ScrollArea>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/guess-the-text"><MessageSquareQuote className="mr-2 h-4 w-4" />Jogar Novamente</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/"><Home className="mr-2 h-4 w-4" />Voltar ao Início</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

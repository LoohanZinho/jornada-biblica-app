
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Home, RotateCcwIcon, ThumbsDown, ThumbsUp, XSquare } from 'lucide-react';
import type { TrueFalseResultType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { cn } from '@/lib/utils';

interface StoredTrueFalseResults {
  score: number;
  totalQuestions: number;
  results: TrueFalseResultType[];
  topic: string; 
}

export default function TrueFalseQuizResultsPage() {
  const router = useRouter();
  const [storedResults, setStoredResults] = useState<StoredTrueFalseResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsString = localStorage.getItem('trueFalseQuizResults');
    if (resultsString) {
      try {
        const parsedResults = JSON.parse(resultsString) as StoredTrueFalseResults;
        setStoredResults(parsedResults);
      } catch (error) {
        console.error("Falha ao analisar os resultados do quiz 'Verdadeiro ou Falso' do localStorage", error);
        router.push('/true-false-quiz'); 
      }
    } else {
      router.push('/true-false-quiz'); 
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

  let performanceMessage = "Continue estudando e aprofundando seu conhecimento bíblico!";
  if (percentage >= 80) {
    performanceMessage = "Excelente! Você demonstrou um ótimo conhecimento dos fatos bíblicos.";
  } else if (percentage >= 50) {
    performanceMessage = "Muito bom! Você está no caminho certo para dominar os detalhes das Escrituras.";
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-8 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center items-center gap-2 mx-auto mb-4">
            <CheckSquare className="h-16 w-16 text-primary" />
            <XSquare className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline">Desafio Concluído!</CardTitle>
          <CardDescription className="text-lg">{performanceMessage} (Tópico: {topic})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold text-accent">
            {score} / {totalQuestions}
          </p>
          <p className="text-2xl text-primary">{percentage}% Corretas</p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 font-headline">Resumo das Afirmações:</h3>
            <ScrollArea className="h-[250px] border rounded-md p-4 text-left bg-secondary/30">
              {results.map((result, index) => (
                <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                  <p className="font-medium text-sm text-foreground/90 italic mb-1">
                    {index + 1}. &ldquo;{result.statement}&rdquo;
                  </p>
                  <p className={cn("text-xs flex items-center", result.isCorrect ? 'text-green-600' : 'text-red-600')}>
                    Sua resposta: {result.selectedAnswer ? 
                        <><ThumbsUp className="inline ml-1 mr-0.5 h-3 w-3" /> Verdadeiro</> : 
                        <><ThumbsDown className="inline ml-1 mr-0.5 h-3 w-3" /> Falso</>
                    }
                  </p>
                  {!result.isCorrect && (
                    <p className="text-xs text-muted-foreground flex items-center">
                        Correta: {result.correctAnswer ? 
                            <><ThumbsUp className="inline ml-1 mr-0.5 h-3 w-3 text-green-600" /> Verdadeiro</> : 
                            <><ThumbsDown className="inline ml-1 mr-0.5 h-3 w-3 text-red-600" /> Falso</>
                        }
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold">Explicação:</span> {result.explanation.substring(0,150)}{result.explanation.length > 150 ? '...' : ''}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/true-false-quiz"><RotateCcwIcon className="mr-2 h-4 w-4" />Jogar Novamente</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/"><Home className="mr-2 h-4 w-4" />Voltar ao Início</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

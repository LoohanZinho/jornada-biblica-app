
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { GuessTheTextQuestionType, QuizSettings, GuessTheTextResult, User } from '@/types';
import { generateGuessTheTextQuestions, type GenerateGuessTheTextQuestionsInput } from '@/ai/flows/generate-guess-the-text-questions';
import { sampleGuessTheTextQuestions } from '@/lib/guessTheTextData'; // For fallback
import { GuessTheTextSetup } from '@/components/game/GuessTheTextSetup';
import { GuessTheTextQuestionDisplay } from '@/components/game/GuessTheTextQuestionDisplay';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RotateCcw } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpenCheck, CheckCircle2, Home, XCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GuessTheTextPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<GuessTheTextQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameResults, setGameResults] = useState<GuessTheTextResult[]>([]);
  
  const [showFullText, setShowFullText] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const router = useRouter();
  const { user, isLoading } = useUser();
  const { toast } = useToast();

  // Redirect if user is not logged in and loading is complete
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  const handleStartGame = useCallback(async (selectedSettings: QuizSettings) => {
    setIsLoadingQuestions(true);
    setSettings(selectedSettings);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameResults([]);
    setQuestions([]); 

    try {
      const aiInput: GenerateGuessTheTextQuestionsInput = {
        topic: selectedSettings.topic === "Todos os Tópicos" ? "Bíblia em geral" : selectedSettings.topic,
        difficulty: selectedSettings.difficulty === "todos" ? "médio" : selectedSettings.difficulty,
        numberOfQuestions: selectedSettings.numberOfQuestions,
      };
      const response = await generateGuessTheTextQuestions(aiInput);
      
      let generatedQuestions = response.questions as GuessTheTextQuestionType[];

      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast({
            title: "IA não Gerou Perguntas",
            description: "A IA não conseguiu gerar perguntas. Usando perguntas de exemplo.",
            variant: "destructive",
        });
        generatedQuestions = sampleGuessTheTextQuestions.filter(q => 
            (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || aiInput.topic === "Bíblia em geral") &&
            (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
        ).slice(0, selectedSettings.numberOfQuestions);
      }
      
      let finalQuestions = generatedQuestions.filter(q => q.textSnippet && q.options && q.correctAnswer && q.fullText); 

      if (finalQuestions.length < selectedSettings.numberOfQuestions) {
        const needed = selectedSettings.numberOfQuestions - finalQuestions.length;
        if (needed > 0) {
            const fallbackSample = sampleGuessTheTextQuestions.filter(q => 
                (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || aiInput.topic === "Bíblia em geral") &&
                (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty) &&
                !finalQuestions.some(fq => fq.id === q.id) 
            ).slice(0, needed);
            finalQuestions = [...finalQuestions, ...fallbackSample];
        }
      }
      
      finalQuestions = finalQuestions.slice(0, selectedSettings.numberOfQuestions);

      if (finalQuestions.length === 0) {
         toast({
            title: "Nenhuma Pergunta Encontrada",
            description: "Não foi possível encontrar ou gerar perguntas com os critérios selecionados.",
            variant: "destructive",
        });
        setIsLoadingQuestions(false);
        setGameStarted(false); 
        return;
      }
      
      setQuestions(finalQuestions);
      setGameStarted(true);

    } catch (error) {
      console.error("Erro ao gerar perguntas 'Qual é o Texto?':", error);
      toast({
        title: "Erro ao Gerar Perguntas",
        description: `Houve um problema com a IA: ${(error as Error).message}. Usando perguntas de exemplo.`,
        variant: "destructive",
      });
      
      let fallbackQuestions = sampleGuessTheTextQuestions.filter(q => 
          (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || (selectedSettings.topic === "Todos os Tópicos" && "Bíblia em geral")) &&
          (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
      ).slice(0, selectedSettings.numberOfQuestions);
        
      if (fallbackQuestions.length === 0) {
           toast({
              title: "Nenhuma Pergunta de Exemplo",
              description: "Não foi possível encontrar perguntas de exemplo com os critérios selecionados.",
              variant: "destructive",
          });
          setIsLoadingQuestions(false);
          setGameStarted(false); 
          return;
      }
      setQuestions(fallbackQuestions);
      setGameStarted(true);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [toast]);

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    const currentQ = questions[currentQuestionIndex];

    setGameResults(prev => [...prev, {
      textSnippet: currentQ.textSnippet,
      selectedAnswer,
      correctAnswer: currentQ.correctAnswer,
      fullText: currentQ.fullText,
      isCorrect
    }]);
    
    setShowFullText(true); 
  };

  const handleNextAfterFullText = () => {
    setShowFullText(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      localStorage.setItem('guessTheTextResults', JSON.stringify({ score, totalQuestions: questions.length, results: gameResults, topic: settings?.topic || 'Conhecimento Geral' }));
      router.push(`/guess-the-text/results`);
    }
  };
  
  const resetGame = () => {
    setGameStarted(false);
    setSettings(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameResults([]);
    setIsLoadingQuestions(false);
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Gerando suas perguntas com IA..." size={48} />
        <p className="mt-4 text-muted-foreground">Isso pode levar alguns segundos...</p>
      </div>
    );
  }

  if (!gameStarted || !settings) {
    return <GuessTheTextSetup onStartGame={handleStartGame} />;
  }

  if (questions.length === 0 && !isLoadingQuestions) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">Nenhuma pergunta disponível para os critérios selecionados.</p>
        <Button onClick={resetGame} variant="outline">Tentar Configurações Diferentes</Button>
      </div>
    );
  }
  
  const currentQuestionData = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary font-headline">Qual é o Texto?</h2>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Jogo
        </Button>
      </div>
      <Progress value={progressPercentage} className="w-full h-3" />
      
      {currentQuestionData && !showFullText && (
        <GuessTheTextQuestionDisplay
          questionData={currentQuestionData}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      )}

      {showFullText && currentQuestionData && (
        <Card className="w-full shadow-lg animate-fade-in">
          <CardHeader className="text-center">
            <BookOpenCheck className="h-12 w-12 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl font-headline">Texto Completo</CardTitle>
            <CardDescription>
              {gameResults[gameResults.length -1]?.isCorrect ? "Você acertou!" : "A resposta correta era:"} <span className="font-semibold text-primary">{currentQuestionData.correctAnswer}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="text-md md:text-lg leading-relaxed text-foreground mb-4 italic px-4 py-6 bg-secondary/50 rounded-md border-l-4 border-primary">
              &ldquo;{currentQuestionData.fullText}&rdquo;
            </blockquote>
          </CardContent>
           <CardFooter className="flex justify-center">
             <Button onClick={handleNextAfterFullText} size="lg">
                {currentQuestionIndex < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultados"}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}

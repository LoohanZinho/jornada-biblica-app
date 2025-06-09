
"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TrueFalseQuestionType, QuizSettings, TrueFalseResultType } from '@/types';
import { generateTrueFalseQuestions, type GenerateTrueFalseQuestionsInput } from '@/ai/flows/generate-true-false-questions';
import { sampleTrueFalseQuestions } from '@/lib/trueFalseQuizData'; 
import { TrueFalseQuizSetup } from '@/components/game/TrueFalseQuizSetup';
import { TrueFalseQuizQuestionDisplay } from '@/components/game/TrueFalseQuizQuestionDisplay';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RotateCcw, CheckSquare, XSquare, Lightbulb, CheckCircle2, XCircle } from 'lucide-react'; // Added CheckCircle2, XCircle
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CurrentResolutionData {
  statement: string;
  selectedAnswer: boolean;
  correctAnswer: boolean;
  explanation: string;
  isCorrect: boolean;
}

export default function TrueFalseQuizPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<TrueFalseQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameResults, setGameResults] = useState<TrueFalseResultType[]>([]);
  
  const [showResolutionCard, setShowResolutionCard] = useState(false);
  const [currentResolutionData, setCurrentResolutionData] = useState<CurrentResolutionData | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleStartGame = useCallback(async (selectedSettings: QuizSettings) => {
    setIsLoadingQuestions(true);
    setSettings(selectedSettings);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameResults([]);
    setQuestions([]);
    setShowResolutionCard(false);
    setCurrentResolutionData(null);

    try {
      const aiInput: GenerateTrueFalseQuestionsInput = {
        topic: selectedSettings.topic === "Todos os Tópicos" ? "Bíblia em geral" : selectedSettings.topic,
        difficulty: selectedSettings.difficulty === "todos" ? "médio" : selectedSettings.difficulty,
        numberOfQuestions: selectedSettings.numberOfQuestions,
      };
      const response = await generateTrueFalseQuestions(aiInput);
      
      let generatedQuestions = response.questions;

      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast({
            title: "IA não Gerou Perguntas",
            description: "A IA não conseguiu gerar afirmações para 'Verdadeiro ou Falso'. Usando exemplos.",
            variant: "destructive",
        });
        generatedQuestions = sampleTrueFalseQuestions.filter(q => 
            (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || aiInput.topic === "Bíblia em geral") &&
            (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
        ).slice(0, selectedSettings.numberOfQuestions);
      }
      
      let finalQuestions = generatedQuestions.filter(q => q.statement && typeof q.correctAnswer === 'boolean' && q.explanation); 

      if (finalQuestions.length < selectedSettings.numberOfQuestions && sampleTrueFalseQuestions.length > 0) {
        const needed = selectedSettings.numberOfQuestions - finalQuestions.length;
        if (needed > 0) {
            const fallbackSample = sampleTrueFalseQuestions.filter(q => 
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
            title: "Nenhuma Afirmação Encontrada",
            description: "Não foi possível encontrar ou gerar afirmações com os critérios selecionados.",
            variant: "destructive",
        });
        setIsLoadingQuestions(false);
        setGameStarted(false); 
        return;
      }
      
      setQuestions(finalQuestions);
      setGameStarted(true);

    } catch (error) {
      toast({
        title: "Erro ao Gerar Afirmações",
        description: `Houve um problema com a IA: ${(error as Error).message}. Usando exemplos.`,
        variant: "destructive",
      });
      
      let fallbackQuestions = sampleTrueFalseQuestions.filter(q => 
          (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || (selectedSettings.topic === "Todos os Tópicos" && "Bíblia em geral")) &&
          (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
      ).slice(0, selectedSettings.numberOfQuestions);
        
      if (fallbackQuestions.length === 0 && sampleTrueFalseQuestions.length > 0) {
           toast({
              title: "Nenhuma Afirmação de Exemplo",
              description: "Não foi possível encontrar afirmações de exemplo com os critérios selecionados.",
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

  const handleAnswer = (userSelectedAnswer: boolean, isSelectionCorrect: boolean) => {
    if (isSelectionCorrect) {
      setScore(prev => prev + 1);
    }

    const currentQuestion = questions[currentQuestionIndex];

    const resultEntry: TrueFalseResultType = {
      statement: currentQuestion.statement,
      selectedAnswer: userSelectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: isSelectionCorrect,
      explanation: currentQuestion.explanation,
    };
    setGameResults(prev => [...prev, resultEntry]);
    
    const resolutionData: CurrentResolutionData = {
      statement: currentQuestion.statement,
      selectedAnswer: userSelectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      isCorrect: isSelectionCorrect,
    };
    setCurrentResolutionData(resolutionData);
    setShowResolutionCard(true); 
  };

  const handleNextAfterResolution = () => {
    setShowResolutionCard(false);
    setCurrentResolutionData(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      localStorage.setItem('trueFalseQuizResults', JSON.stringify({ score, totalQuestions: questions.length, results: gameResults, topic: settings?.topic || 'Conhecimento Bíblico' }));
      router.push(`/true-false-quiz/results`);
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
    setShowResolutionCard(false);
    setCurrentResolutionData(null);
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Gerando suas afirmações com IA..." size={48} />
        <p className="mt-4 text-muted-foreground">Isso pode levar alguns segundos...</p>
      </div>
    );
  }

  if (!gameStarted || !settings) {
    return <TrueFalseQuizSetup onStartGame={handleStartGame} />;
  }

  if (questions.length === 0 && !isLoadingQuestions) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">Nenhuma afirmação disponível para os critérios selecionados.</p>
        <Button onClick={resetGame} variant="outline">Tentar Configurações Diferentes</Button>
      </div>
    );
  }
  
  const currentQuestionData = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary font-headline flex items-center">
          <CheckSquare className="mr-1 h-7 w-7" />/<XSquare className="mr-2 h-7 w-7" /> Verdadeiro ou Falso
        </h2>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Jogo
        </Button>
      </div>
      <Progress value={progressPercentage} className="w-full h-3" />
      
      {currentQuestionData && !showResolutionCard && (
        <TrueFalseQuizQuestionDisplay
          questionData={currentQuestionData}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      )}

      {showResolutionCard && currentResolutionData && (
        <Card className="w-full shadow-lg animate-fade-in">
          <CardHeader className="text-center">
             {currentResolutionData.isCorrect ? 
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" /> : 
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
             }
            <CardTitle className="text-2xl font-headline">
              {currentResolutionData.isCorrect ? "Correto!" : "Incorreto!"}
            </CardTitle>
            <CardDescription className="space-y-1">
              <span>A afirmação era: <span className="font-semibold text-primary">{currentResolutionData.correctAnswer ? "Verdadeira" : "Falsa"}</span>.</span>
              {!currentResolutionData.isCorrect && (
                <span className="block text-sm text-destructive">
                  Sua resposta: {currentResolutionData.selectedAnswer ? "Verdadeiro" : "Falso"}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Afirmação:</h4>
                <blockquote className="text-md italic border-l-2 border-primary pl-3 py-1">
                    &ldquo;{currentResolutionData.statement}&rdquo;
                </blockquote>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1.5 text-primary"/>
                    Explicação:
                </h4>
                <ScrollArea className="h-auto max-h-[150px] p-3 border rounded-md bg-secondary/30">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{currentResolutionData.explanation}</p>
                </ScrollArea>
            </div>
          </CardContent>
           <CardFooter className="flex justify-center">
             <Button onClick={handleNextAfterResolution} size="lg">
                {currentQuestionIndex < questions.length - 1 ? "Próxima Afirmação" : "Ver Resultados"}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}

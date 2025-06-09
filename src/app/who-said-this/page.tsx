
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { WhoSaidThisQuestionType, QuizSettings, WhoSaidThisResultType } from '@/types';
import { generateWhoSaidThisQuestions, type GenerateWhoSaidThisQuestionsInput } from '@/ai/flows/generate-who-said-this-questions';
import { sampleWhoSaidThisQuestions } from '@/lib/whoSaidThisData';
import { WhoSaidThisSetup } from '@/components/game/WhoSaidThisSetup';
import { WhoSaidThisQuestionDisplay } from '@/components/game/WhoSaidThisQuestionDisplay';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RotateCcw, BookOpenCheck, QuoteIcon, CheckCircle2, XCircle } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CurrentQuoteResolutionData {
  quote: string;
  selectedCharacter: string; // O que o usuário selecionou
  correctCharacter: string; // O que é o correto
  referenceForExplanation: string;
  contextForExplanation: string;
  isCorrect: boolean; // Se a seleção do usuário foi correta
}

export default function WhoSaidThisPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<WhoSaidThisQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameResults, setGameResults] = useState<WhoSaidThisResultType[]>([]);
  
  const [showQuoteResolutionCard, setShowQuoteResolutionCard] = useState(false);
  const [currentQuoteResolutionData, setCurrentQuoteResolutionData] = useState<CurrentQuoteResolutionData | null>(null);
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
    setShowQuoteResolutionCard(false);
    setCurrentQuoteResolutionData(null);

    try {
      const aiInput: GenerateWhoSaidThisQuestionsInput = {
        topic: selectedSettings.topic === "Todos os Tópicos" ? "Bíblia em geral" : selectedSettings.topic,
        difficulty: selectedSettings.difficulty === "todos" ? "médio" : selectedSettings.difficulty,
        numberOfQuestions: selectedSettings.numberOfQuestions,
      };
      const response = await generateWhoSaidThisQuestions(aiInput);
      
      let generatedQuestions = response.questions as WhoSaidThisQuestionType[];

      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast({
            title: "IA não Gerou Perguntas",
            description: "A IA não conseguiu gerar perguntas para 'Quem Disse Isso?'. Usando perguntas de exemplo.",
            variant: "destructive",
        });
        generatedQuestions = sampleWhoSaidThisQuestions.filter(q => 
            (selectedSettings.topic === "Todos os Tópicos" || q.topic === selectedSettings.topic || aiInput.topic === "Bíblia em geral") &&
            (selectedSettings.difficulty === "todos" || q.difficulty === selectedSettings.difficulty)
        ).slice(0, selectedSettings.numberOfQuestions);
      }
      
      let finalQuestions = generatedQuestions.filter(q => q.quote && q.options && q.correctCharacter && q.referenceForExplanation && q.contextForExplanation); 

      if (finalQuestions.length < selectedSettings.numberOfQuestions) {
        const needed = selectedSettings.numberOfQuestions - finalQuestions.length;
        if (needed > 0) {
            const fallbackSample = sampleWhoSaidThisQuestions.filter(q => 
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
            description: "Não foi possível encontrar ou gerar perguntas para 'Quem Disse Isso?' com os critérios selecionados.",
            variant: "destructive",
        });
        setIsLoadingQuestions(false);
        setGameStarted(false); 
        return;
      }
      
      setQuestions(finalQuestions);
      setGameStarted(true);

    } catch (error) {
      console.error("Erro ao gerar perguntas 'Quem Disse Isso?':", error);
      toast({
        title: "Erro ao Gerar Perguntas",
        description: `Houve um problema com a IA: ${(error as Error).message}. Usando perguntas de exemplo.`,
        variant: "destructive",
      });
      
      let fallbackQuestions = sampleWhoSaidThisQuestions.filter(q => 
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

  const handleAnswer = (characterUserSelected: string, wasUserCorrect: boolean) => {
    if (wasUserCorrect) {
      setScore(prev => prev + 1);
    }

    const currentQuestion = questions[currentQuestionIndex];

    const resultEntry: WhoSaidThisResultType = {
      quote: currentQuestion.quote,
      selectedCharacter: characterUserSelected,
      correctCharacter: currentQuestion.correctCharacter,
      isCorrect: wasUserCorrect,
      reference: currentQuestion.referenceForExplanation,
    };
    setGameResults(prev => [...prev, resultEntry]);
    
    setCurrentQuoteResolutionData({
      quote: currentQuestion.quote,
      selectedCharacter: characterUserSelected,
      correctCharacter: currentQuestion.correctCharacter,
      referenceForExplanation: currentQuestion.referenceForExplanation,
      contextForExplanation: currentQuestion.contextForExplanation,
      isCorrect: wasUserCorrect,
    });
    setShowQuoteResolutionCard(true); 
  };

  const handleNextAfterResolution = () => {
    setShowQuoteResolutionCard(false);
    setCurrentQuoteResolutionData(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      localStorage.setItem('whoSaidThisResults', JSON.stringify({ score, totalQuestions: questions.length, results: gameResults, topic: settings?.topic || 'Conhecimento Geral' }));
      router.push(`/who-said-this/results`);
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
    setShowQuoteResolutionCard(false);
    setCurrentQuoteResolutionData(null);
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator text="Gerando seus desafios com IA..." size={48} />
        <p className="mt-4 text-muted-foreground">Isso pode levar alguns segundos...</p>
      </div>
    );
  }

  if (!gameStarted || !settings) {
    return <WhoSaidThisSetup onStartGame={handleStartGame} />;
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
        <h2 className="text-2xl font-bold text-primary font-headline flex items-center">
          <QuoteIcon className="mr-2 h-7 w-7" /> Quem Disse Isso?
        </h2>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Jogo
        </Button>
      </div>
      <Progress value={progressPercentage} className="w-full h-3" />
      
      {currentQuestionData && !showQuoteResolutionCard && (
        <WhoSaidThisQuestionDisplay
          questionData={currentQuestionData}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      )}

      {showQuoteResolutionCard && currentQuoteResolutionData && (
        <Card className="w-full shadow-lg animate-fade-in">
          <CardHeader className="text-center">
             {currentQuoteResolutionData.isCorrect ? 
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" /> : 
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
             }
            <CardTitle className="text-2xl font-headline">
              {currentQuoteResolutionData.isCorrect ? "Você Acertou!" : "Ops, não foi dessa vez!"}
            </CardTitle>
            <CardDescription className="space-y-1">
              <span>A citação foi dita por: <span className="font-semibold text-primary">{currentQuoteResolutionData.correctCharacter}</span>.</span>
              {!currentQuoteResolutionData.isCorrect && (
                <span className="block text-sm text-destructive">
                  Sua resposta: {currentQuoteResolutionData.selectedCharacter}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Citação:</h4>
                <blockquote className="text-md italic border-l-2 border-primary pl-3 py-1">
                    &ldquo;{currentQuoteResolutionData.quote}&rdquo;
                </blockquote>
            </div>
             <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Referência:</h4>
                <p className="text-md text-primary">{currentQuoteResolutionData.referenceForExplanation}</p>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Contexto:</h4>
                <ScrollArea className="h-[100px] p-2 border rounded-md bg-secondary/30">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{currentQuoteResolutionData.contextForExplanation}</p>
                </ScrollArea>
            </div>
          </CardContent>
           <CardFooter className="flex justify-center">
             <Button onClick={handleNextAfterResolution} size="lg">
                {currentQuestionIndex < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultados"}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
